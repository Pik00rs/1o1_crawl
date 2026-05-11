// src/dashboard/equipment-builder.js
//
// Convertit l'équipement Supabase (chaque item = { instanceId, itemId, ilvl, rarity, implicit, affixes })
// vers le format que `src/js/entities/player.js` consomme via createPlayer({ equipment, stats }).
//
// Format de sortie pour `equipment` (par slot) :
//   {
//     mainhand: { ...template, damage: [scaled], spell?, passive?: {…aggregated…} },
//     amulet:   { ...template, spell: 'fireball', passive?: {…} },
//     ...
//   }
//
// Format de sortie pour `stats` :
//   Mêmes clés que applyStuff() retourne. createPlayer(config.stats=…) bypass alors applyStuff.

import { getItem } from './items-catalog.js';

// Damage scaling par iLvl (aligné sur index.html / run.html)
const ILVL_MULTIPLIER = {
  1: 0.50, 2: 0.65, 3: 0.80, 4: 0.95, 5: 1.00,
  6: 1.15, 7: 1.30, 8: 1.50, 9: 1.75, 10: 2.10,
};

// Mapping affixe.stat → clé attendue par player-stats.js / passive
// Tous ces noms doivent matcher ceux dans PLAYER_BASE_STATS / PASSIVE_STAT_KEYS.
// Si un affixe a un autre nom (legacy), on le map ici.
const STAT_ALIAS = {
  // Affix stats — mêmes noms
  maxHp:          'maxHp',
  armor:          'armor',
  critChance:     'critChance',
  critDmg:        'critMultiplier',  // critDmg dans nos affixes ↔ critMultiplier côté engine
  globalDmg:      null,              // appliqué directement sur damage (multiplicateur)
  divineShield:   null,              // pas de stat 1-pour-1 ; on l'ignore en passive (ou map magicResist)
  // Resistances élémentaires
  fireResist:     'fireResist',
  iceResist:      'iceResist',
  shockResist:    'shockResist',
  poisonResist:   'poisonResist',
  // Bonus élémentaires
  bonusFire:      'bonusFire',
  bonusIce:       'bonusIce',
  bonusShock:     'bonusShock',
  bonusPoison:    'bonusPoison',
  // Utilitaires
  dodgeChance:    'dodgeChance',
  blockChance:    'blockChance',
  hpRegen:        'hpRegen',
  lifesteal:      'lifesteal',
  armorPen:       'armorPen',
  ccReduction:    'ccReduction',
  moveSpeed:      'moveSpeed',
};

// Base stats du joueur (alignées avec player-stats.js — copie pour pas dépendre de l'import)
// IMPORTANT : baseMaxHp doit matcher celui de src/js/entities/player-stats.js
// (sinon HP en combat ≠ HP affiché sur l'accueil).
const BASE_STATS = {
  baseMaxHp: 100, hpPerLevel: 7,
  baseMaxAp: 6, bonusAp: 1,
  baseDamage: [4, 7], damageType: 'blunt',
  baseArmor: 0, baseDodgeChance: 5, baseBlockChance: 0,
  baseCritChance: 5, baseCritMultiplier: 50,
  baseMoveSpeed: 4, baseRange: 1,
  baseInitiative: 18,
  baseHpRegen: 0, baseLifesteal: 0, baseArmorPen: 0,
  baseBonusFire: 0, baseBonusIce: 0, baseBonusShock: 0, baseBonusPoison: 0,
  baseFireResist: 0, baseIceResist: 0, baseShockResist: 0, basePoisonResist: 0, baseMagicResist: 0,
  baseCcReduction: 0,
};

const CAPS = {
  fireResist: 75, iceResist: 75, shockResist: 75, poisonResist: 75, magicResist: 75,
  critChance: 70, dodgeChance: 60, blockChance: 60, ccReduction: 50,
};

/**
 * Convertit un item Supabase en item "game-ready" (template enrichi).
 *
 * Important : `passive` ne contient QUE les stats que player.js/aggregatePassives
 * accepte (crit, resist, lifesteal, etc.) — voir PASSIVE_STAT_KEYS dans player.js.
 * Les stats primaires (maxHp, armor) sont retournées séparément via primaryBoosts
 * pour être appliquées directement sur le `stats` final.
 *
 * @param {object} item - { instanceId, itemId, ilvl, rarity, implicit, affixes }
 * @returns {{ gameItem: object, primaryBoosts: { maxHp, armor, globalDmgPct } } | null}
 */
function buildGameItem(item){
  if(!item || !item.itemId) return null;
  const tpl = getItem(item.itemId);
  if(!tpl) return null;

  // Clone shallow du template (on va y ajouter passive)
  const out = { ...tpl };

  // Damage scalé par iLvl (range)
  if(tpl.damage && Array.isArray(tpl.damage)){
    const mult = ILVL_MULTIPLIER[item.ilvl] || 1;
    out.damage = [
      Math.max(1, Math.round(tpl.damage[0] * mult)),
      Math.max(1, Math.round(tpl.damage[1] * mult)),
    ];
  }

  // Séparation des bonus :
  // - primaryBoosts : maxHp, armor, globalDmgPct (vont sur stats final directement)
  // - passive : tout le reste (crit, resist, lifesteal, etc.) → géré par aggregatePassives()
  const passive = {};
  const primaryBoosts = { maxHp: 0, armor: 0, globalDmgPct: 0 };
  let divineShield = 0;

  function addBonus(stat, value){
    if(!stat || value == null || value === 0) return;
    // Stats primaires : direct dans primaryBoosts (PAS dans passive,
    // car player.js/aggregatePassives ne lit pas maxHp/armor dans passive)
    if(stat === 'maxHp'){ primaryBoosts.maxHp += value; return; }
    if(stat === 'armor'){ primaryBoosts.armor += value; return; }
    if(stat === 'globalDmg'){ primaryBoosts.globalDmgPct += value; return; }
    if(stat === 'divineShield'){ divineShield += value; return; }
    // Stats secondaires : passive (sera lu par aggregatePassives dans player.js)
    const target = STAT_ALIAS[stat];
    if(target === undefined || target === null) return; // pas dans le mapping
    passive[target] = (passive[target] || 0) + value;
  }

  // Implicit
  if(tpl.implicit && item.implicit){
    addBonus(tpl.implicit.id, item.implicit.value || 0);
  }
  // Affixes
  (item.affixes || []).forEach(a => addBonus(a.stat, a.value || 0));

  // divineShield → on l'agrège à magicResist (proche sémantiquement : % réduction de dégâts magiques)
  if(divineShield > 0){
    passive.magicResist = (passive.magicResist || 0) + divineShield;
  }

  if(Object.keys(passive).length > 0){
    out.passive = passive;
  }

  return { gameItem: out, primaryBoosts };
}

/**
 * Construit l'objet `equipment` + l'objet `stats` finaux pour createPlayer({equipment, stats}).
 *
 * @param {object} equippedFromApi - { mainhand: itemSupabase, offhand: …, head: …, … }
 * @param {number} level - niveau du joueur (défaut 1)
 * @returns {{ equipment: object, stats: object }}
 */
export function buildPlayerFromEquipped(equippedFromApi, level = 1){
  // 1) Transforme chaque slot en game-item enrichi.
  //    Récupère aussi les primaryBoosts (maxHp/armor/globalDmgPct) à appliquer
  //    directement sur stats — car player.js/aggregatePassives ne traite QUE
  //    les stats secondaires (cf. PASSIVE_STAT_KEYS).
  const equipment = {};
  let totalMaxHpBoost = 0;
  let totalArmorBoost = 0;
  let totalGlobalDmgPct = 0;
  for(const [slot, item] of Object.entries(equippedFromApi || {})){
    const res = buildGameItem(item);
    if(res){
      equipment[slot] = res.gameItem;
      totalMaxHpBoost   += res.primaryBoosts.maxHp || 0;
      totalArmorBoost   += res.primaryBoosts.armor || 0;
      totalGlobalDmgPct += res.primaryBoosts.globalDmgPct || 0;
    }
  }

  // 2) Stats finales : base + level + bonus primaires de l'équipement
  const stats = {
    maxHp:           BASE_STATS.baseMaxHp + (level - 1) * BASE_STATS.hpPerLevel + totalMaxHpBoost,
    maxAp:           BASE_STATS.baseMaxAp,
    bonusAp:         BASE_STATS.bonusAp,
    damage:          [...BASE_STATS.baseDamage],
    damageType:      BASE_STATS.damageType,
    armor:           BASE_STATS.baseArmor + totalArmorBoost,
    dodgeChance:     BASE_STATS.baseDodgeChance,
    blockChance:     BASE_STATS.baseBlockChance,
    critChance:      BASE_STATS.baseCritChance,
    critMultiplier:  BASE_STATS.baseCritMultiplier,
    moveSpeed:       BASE_STATS.baseMoveSpeed,
    range:           BASE_STATS.baseRange,
    initiative:      BASE_STATS.baseInitiative,
    hpRegen:         BASE_STATS.baseHpRegen,
    lifesteal:       BASE_STATS.baseLifesteal,
    armorPen:        BASE_STATS.baseArmorPen,
    bonusFire:       BASE_STATS.baseBonusFire,
    bonusIce:        BASE_STATS.baseBonusIce,
    bonusShock:      BASE_STATS.baseBonusShock,
    bonusPoison:     BASE_STATS.baseBonusPoison,
    fireResist:      BASE_STATS.baseFireResist,
    iceResist:       BASE_STATS.baseIceResist,
    shockResist:     BASE_STATS.baseShockResist,
    poisonResist:    BASE_STATS.basePoisonResist,
    magicResist:     BASE_STATS.baseMagicResist,
    ccReduction:     BASE_STATS.baseCcReduction,
  };

  // 3) Arme équipée : damage range + damageType + range
  if(equipment.mainhand){
    const mh = equipment.mainhand;
    if(mh.damage) stats.damage = [...mh.damage];
    if(mh.damageType) stats.damageType = mh.damageType;
    if(mh.range) stats.range = mh.range;
  }

  // 4) Bonus globalDmg en %
  if(totalGlobalDmgPct !== 0){
    const m = 1 + totalGlobalDmgPct / 100;
    stats.damage = [
      Math.max(1, Math.round(stats.damage[0] * m)),
      Math.max(1, Math.round(stats.damage[1] * m)),
    ];
  }

  // 5) Note : les `passive` des items (crit, resist, lifesteal, etc.) seront
  //    agrégés par aggregatePassives() dans player.js. On NE les agrège PAS
  //    ici sinon ils seraient comptés en double.
  //    Par contre maxHp/armor sont DÉJÀ agrégés ici (ligne 2) car player.js
  //    skip ces clés dans aggregatePassives.

  // 6) Caps
  for(const [stat, cap] of Object.entries(CAPS)){
    if(stats[stat] > cap) stats[stat] = cap;
  }
  if(stats.hpRegen > 5) stats.hpRegen = 5;

  return { equipment, stats };
}
