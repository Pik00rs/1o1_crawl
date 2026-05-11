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
 * @param {object} item - { instanceId, itemId, ilvl, rarity, implicit, affixes }
 * @returns {object|null} item au format game.html / player.js
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

  // Agréger l'implicit + les affixes en un objet `passive`
  // Plus globalDmg/divineShield qui ne mappent pas 1-pour-1 — on les met dans des champs spéciaux
  const passive = {};
  let globalDmgPct = 0;       // % à appliquer sur damage du joueur (sera traité en stats finales)
  let divineShield = 0;        // %réduction dégâts éléments (on l'ajoute à magicResist)

  function addToPassive(stat, value){
    if(!stat || value == null) return;
    const target = STAT_ALIAS[stat];
    if(target === undefined){
      // Pas dans le mapping : ignore (probablement un affixe spécial type "armorPen" qui passe)
      return;
    }
    if(target === null){
      if(stat === 'globalDmg') globalDmgPct += value;
      else if(stat === 'divineShield') divineShield += value;
      return;
    }
    passive[target] = (passive[target] || 0) + value;
  }

  // Implicit
  if(tpl.implicit && item.implicit){
    addToPassive(tpl.implicit.id, item.implicit.value || 0);
  }
  // Affixes
  (item.affixes || []).forEach(a => addToPassive(a.stat, a.value || 0));

  // divineShield → on l'agrège à magicResist (proche sémantiquement : % réduction de dégâts magiques)
  if(divineShield > 0){
    passive.magicResist = (passive.magicResist || 0) + divineShield;
  }

  if(Object.keys(passive).length > 0){
    out.passive = passive;
  }
  // On garde le globalDmgPct pour le retourner via la fonction principale
  out._globalDmgPct = globalDmgPct;

  return out;
}

/**
 * Construit l'objet `equipment` + l'objet `stats` finaux pour createPlayer({equipment, stats}).
 *
 * @param {object} equippedFromApi - { mainhand: itemSupabase, offhand: …, head: …, … }
 * @param {number} level - niveau du joueur (défaut 1)
 * @returns {{ equipment: object, stats: object }}
 */
export function buildPlayerFromEquipped(equippedFromApi, level = 1){
  // 1) Transforme chaque slot en game-item enrichi
  const equipment = {};
  let totalGlobalDmgPct = 0;
  for(const [slot, item] of Object.entries(equippedFromApi || {})){
    const gi = buildGameItem(item);
    if(gi){
      equipment[slot] = gi;
      totalGlobalDmgPct += gi._globalDmgPct || 0;
    }
  }

  // 2) Calcule les stats finales en partant des bases (level scaling sur HP)
  //    et en ajoutant les passifs agrégés des items.
  const stats = {
    maxHp:           BASE_STATS.baseMaxHp + (level - 1) * BASE_STATS.hpPerLevel,
    maxAp:           BASE_STATS.baseMaxAp,
    bonusAp:         BASE_STATS.bonusAp,
    damage:          [...BASE_STATS.baseDamage],
    damageType:      BASE_STATS.damageType,
    armor:           BASE_STATS.baseArmor,
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

  // 3) Si on a une arme : son `damage` (déjà scalé iLvl) remplace les damage de base
  //    + on prend son damageType et range et appliedStatus.
  if(equipment.mainhand){
    const mh = equipment.mainhand;
    if(mh.damage) stats.damage = [...mh.damage];
    if(mh.damageType) stats.damageType = mh.damageType;
    if(mh.range) stats.range = mh.range;
  }

  // 4) Applique le bonus globalDmg total en pourcent sur les dégâts
  if(totalGlobalDmgPct !== 0){
    const m = 1 + totalGlobalDmgPct / 100;
    stats.damage = [
      Math.max(1, Math.round(stats.damage[0] * m)),
      Math.max(1, Math.round(stats.damage[1] * m)),
    ];
  }

  // 5) Note : les `passive` des items sont AUSSI agrégés par aggregatePassives() dans
  //    createPlayer. On laisse cette logique à player.js — on n'ajoute donc PAS ici
  //    les passives à stats. Si on le faisait, on doublerait les bonus.

  // 6) Applique les caps
  for(const [stat, cap] of Object.entries(CAPS)){
    if(stats[stat] > cap) stats[stat] = cap;
  }
  if(stats.hpRegen > 5) stats.hpRegen = 5;

  return { equipment, stats };
}
