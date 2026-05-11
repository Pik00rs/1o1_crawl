// src/dashboard/equipment-builder.js
//
// Convertit l'équipement Supabase → format consommé par createPlayer({equipment, stats}).
//
// Source de vérité (lecture du moteur dans src/js/combat/) :
//   damage.js / attack.js lisent sur le joueur :
//     maxHp, hp, damage (range), critChance, critMultiplier, armorPen, armorPiercing,
//     bonusFire/Ice/Shock/Poison (additifs au roll si dmg type matche),
//     armor (réduction physique), fireResist/iceResist/shockResist/poisonResist + magicResist,
//     lifesteal, hpRegen, maxAp, bonusAp.
//   Les autres stats (dodge, parry, block, triggers, freeXxxChance, after*, *OnKill...) ne sont
//   PAS lues par le moteur actuel.
//
// player.js / aggregatePassives() écrit sur stats UNIQUEMENT les clés de PASSIVE_STAT_KEYS :
//   lifesteal, armorPen, hpRegen, critChance, critMultiplier, dodgeChance, blockChance,
//   bonusFire/Ice/Shock/Poison, fireResist/iceResist/shockResist/poisonResist/magicResist,
//   ccReduction.
//   Les autres stats (maxHp, armor, damage) doivent être directement dans `stats` final.

import { getItem } from './items-catalog.js';

// Damage scaling par iLvl (aligné sur index.html / run.html / hero.html)
const ILVL_MULTIPLIER = {
  1: 0.50, 2: 0.65, 3: 0.80, 4: 0.95, 5: 1.00,
  6: 1.15, 7: 1.30, 8: 1.50, 9: 1.75, 10: 2.10,
};

// =============================================================================
// MAPPING : affixe catalogue → stat moteur
// =============================================================================
// Valeur du mapping :
//   - 'STAT'     : agrégé dans passive (aggregatePassives le lira)
//   - PRIMARY_*  : agrégé dans primaryBoosts (appliqué direct sur stats finales)
//   - 'IGNORED'  : affixe pas géré par le moteur — on logue mais on n'agrège pas
//
// IMPORTANT : les clés correspondent EXACTEMENT aux noms d'affixes dans affixes.json
// (cf. grep "stat" dans le catalog).

const PRIMARY_MAXHP    = '__primary_maxHp__';
const PRIMARY_ARMOR    = '__primary_armor__';
const PRIMARY_GLOBALDMG_PCT = '__primary_globalDmgPct__';
const PRIMARY_ELEMDMG_PCT   = '__primary_elemDmgPct__';

const STAT_MAP = {
  // === STATS PRIMAIRES ===
  maxHp:            PRIMARY_MAXHP,
  armor:            PRIMARY_ARMOR,
  globalDamagePct:  PRIMARY_GLOBALDMG_PCT,
  elemDamagePct:    PRIMARY_ELEMDMG_PCT,

  // === STATS DE BASE (déjà câblées) ===
  critChance:       'critChance',
  critDamage:       'critMultiplier',
  armorPen:         'armorPen',
  lifesteal:        'lifesteal',
  hpRegen:          'hpRegen',
  bonusFireDamage:   'bonusFire',
  bonusIceDamage:    'bonusIce',
  bonusShockDamage:  'bonusShock',
  bonusPoisonDamage: 'bonusPoison',
  fireResist:       'fireResist',
  iceResist:        'iceResist',
  shockResist:      'shockResist',
  poisonResist:     'poisonResist',
  divineShield:        'magicResist',
  divineShieldFire:    'fireResist',
  divineShieldIce:     'iceResist',
  divineShieldShock:   'shockResist',
  divineShieldPoison:  'poisonResist',
  bonusAP:          'bonusAp',
  dodgeChance:           'dodgeChance',
  blockChance:           'blockChance',
  firstHitReductionPct:  'firstHitReductionPct',
  doubleStrikeChance:    'doubleStrikeChance',
  freeMovement:          'freeMovement',
  armorAdjacent:         'armorAdjacent',

  // === NOUVEAUX (53 affixes câblés) ===
  // Multipliers conditionnels offensifs
  fullHpDamageMult:      'fullHpDamageMult',
  missingHpDamagePct:    'missingHpDamagePct',
  executeDamageMult:     'executeDamageMult',
  firstStrikeDamageMult: 'firstStrikeDamageMult',
  firstStrikeChance:     'firstStrikeChance',
  afterMoveDamageMult:   'afterMoveDamageMult',
  noMoveDamageMult:      'noMoveDamageMult',
  longMoveDamageMult:    'longMoveDamageMult',
  armorDamageMult:       'armorDamageMult',
  afflictedDamageBonus:  'afflictedDamageBonus',
  backstabDamageMult:    'backstabDamageMult',
  perBleedStackDamage:   'perBleedStackDamage',
  pierceDamagePct:       'pierceDamagePct',
  maxRangeDamage:        'maxRangeDamage',
  headshotDamagePct:     'headshotDamagePct',
  // Réductions défensives
  lowHpReductionPct:     'lowHpReductionPct',
  fortifyPct:            'fortifyPct',
  // Crit alt
  elemCritChance:        'elemCritChance',
  elemCritDamage:        'elemCritDamage',
  elemLifesteal:         'elemLifesteal',
  elemStatusDuration:    'elemStatusDuration',
  // Status
  bleedDamage:           'bleedDamage',
  bleedResist:           'bleedResist',
  stunOnCritChance:      'stunOnCritChance',
  // Triggers
  triggerExplosion:      'triggerExplosion',
  triggerParalyzed:      'triggerParalyzed',
  triggerElectrocuted:   'triggerElectrocuted',
  triggerSick:           'triggerSick',
  // On-kill
  cdReducOnKill:         'cdReducOnKill',
  killReloadChance:      'killReloadChance',
  freeSpellOnKillChance: 'freeSpellOnKillChance',
  // Avoidance / reflects
  parryChance:           'parryChance',
  riposteChance:         'riposteChance',
  thornsMeleePct:        'thornsMeleePct',
  blockThornsDamage:     'blockThornsDamage',
  // Repeat
  multishotChance:       'multishotChance',
  cleavePct:             'cleavePct',
  spellEchoChance:       'spellEchoChance',
  // Free actions
  freeOpenerChance:      'freeOpenerChance',
  freeShotChance:        'freeShotChance',
  // Item modifiers
  spellRange:            'spellRange',
  spellAPCostReduction:  'spellAPCostReduction',
  aoeRadius:             'aoeRadius',
  bowRangeBonus:         'bowRangeBonus',
  amuletElemDamage:      'amuletElemDamage',
  amuletSpellPower:      'amuletSpellPower',
  // Movement
  fly:                   'fly',
  teleport:              'teleport',  // tracké mais nécessite skill UI custom
  // Loot
  magicFind:             'magicFind',
  essenceFind:           'essenceFind',
};

// Tous les affixes du catalog qui ne sont PAS dans STAT_MAP sont automatiquement ignorés
// (mais on les logue pour transparence). Liste prévue à titre indicatif :
const KNOWN_IGNORED = new Set([
  'afflictedDamageBonus', 'afterMoveDamageMult', 'amuletElemDamage', 'amuletSpellPower',
  'aoeRadius', 'armorAdjacent', 'armorDamageMult', 'backstabDamageMult', 'bleedDamage',
  'bleedResist', 'blockChance', 'blockThornsDamage', 'bowRangeBonus', 'cdReducOnKill',
  'cleavePct', 'doubleStrikeChance', 'dodgeChance', 'elemCritChance', 'elemCritDamage',
  'elemLifesteal', 'elemStatusDuration', 'essenceFind', 'executeDamageMult',
  'firstHitReductionPct', 'firstStrikeChance', 'firstStrikeDamageMult', 'fly', 'fortifyPct',
  'freeMovement', 'freeOpenerChance', 'freeShotChance', 'freeSpellOnKillChance',
  'fullHpDamageMult', 'headshotDamagePct', 'killReloadChance', 'longMoveDamageMult',
  'lowHpReductionPct', 'magicFind', 'maxRangeDamage', 'missingHpDamagePct',
  'multishotChance', 'noMoveDamageMult', 'parryChance', 'perBleedStackDamage',
  'pierceDamagePct', 'riposteChance', 'spellAPCostReduction', 'spellEchoChance',
  'spellRange', 'stunOnCritChance', 'teleport', 'thornsMeleePct', 'triggerElectrocuted',
  'triggerExplosion', 'triggerParalyzed', 'triggerSick',
]);

// =============================================================================
// BASE STATS (alignées sur src/js/entities/player-stats.js)
// =============================================================================
const BASE_STATS = {
  baseMaxHp: 100, hpPerLevel: 7,
  baseMaxAp: 6, bonusAp: 1,
  baseDamage: [4, 7], damageType: 'blunt',
  baseArmor: 0, baseDodgeChance: 5, baseBlockChance: 0,
  baseCritChance: 5, baseCritMultiplier: 50,
  baseMoveSpeed: 4, baseRange: 1, baseInitiative: 18,
  baseHpRegen: 0, baseLifesteal: 0, baseArmorPen: 0,
  baseBonusFire: 0, baseBonusIce: 0, baseBonusShock: 0, baseBonusPoison: 0,
  baseFireResist: 0, baseIceResist: 0, baseShockResist: 0, basePoisonResist: 0,
  baseMagicResist: 0, baseCcReduction: 0,
};

const CAPS = {
  fireResist: 75, iceResist: 75, shockResist: 75, poisonResist: 75, magicResist: 75,
  critChance: 70, dodgeChance: 60, blockChance: 60, ccReduction: 50,
};

// Track des affixes inconnus rencontrés (pour debug)
const UNKNOWN_AFFIXES = new Set();
const IGNORED_HITS = new Map(); // affixId → count (cumul pour log final)

// =============================================================================
// BUILD ITEM
// =============================================================================

/**
 * @param {object} item - { instanceId, itemId, ilvl, rarity, implicit, affixes }
 * @returns {{ gameItem: object, primaryBoosts: { maxHp, armor, globalDmgPct, elemDmgPct } } | null}
 */
function buildGameItem(item){
  if(!item || !item.itemId) return null;
  const tpl = getItem(item.itemId);
  if(!tpl) return null;

  const out = { ...tpl };

  // Damage scalé par iLvl
  if(tpl.damage && Array.isArray(tpl.damage)){
    const mult = ILVL_MULTIPLIER[item.ilvl] || 1;
    out.damage = [
      Math.max(1, Math.round(tpl.damage[0] * mult)),
      Math.max(1, Math.round(tpl.damage[1] * mult)),
    ];
  }

  const passive = {};
  const primaryBoosts = { maxHp: 0, armor: 0, globalDmgPct: 0, elemDmgPct: 0 };

  function addBonus(stat, value){
    if(!stat || value == null || value === 0) return;

    // bonusElemDamage : s'applique aux 4 types magiques
    if(stat === 'bonusElemDamage'){
      passive.bonusFire   = (passive.bonusFire   || 0) + value;
      passive.bonusIce    = (passive.bonusIce    || 0) + value;
      passive.bonusShock  = (passive.bonusShock  || 0) + value;
      passive.bonusPoison = (passive.bonusPoison || 0) + value;
      return;
    }

    const mapped = STAT_MAP[stat];
    if(mapped === undefined){
      // Inconnu : on track et on ignore
      UNKNOWN_AFFIXES.add(stat);
      IGNORED_HITS.set(stat, (IGNORED_HITS.get(stat) || 0) + 1);
      return;
    }
    if(mapped === PRIMARY_MAXHP){   primaryBoosts.maxHp += value; return; }
    if(mapped === PRIMARY_ARMOR){   primaryBoosts.armor += value; return; }
    if(mapped === PRIMARY_GLOBALDMG_PCT){ primaryBoosts.globalDmgPct += value; return; }
    if(mapped === PRIMARY_ELEMDMG_PCT){   primaryBoosts.elemDmgPct   += value; return; }
    // Sinon : passive
    passive[mapped] = (passive[mapped] || 0) + value;
  }

  // Implicit
  if(tpl.implicit && item.implicit){
    addBonus(tpl.implicit.id, item.implicit.value || 0);
  }
  // Affixes
  (item.affixes || []).forEach(a => addBonus(a.stat, a.value || 0));

  if(Object.keys(passive).length > 0){
    out.passive = passive;
  }

  return { gameItem: out, primaryBoosts };
}

// =============================================================================
// BUILD PLAYER
// =============================================================================

/**
 * Construit { equipment, stats } pour createPlayer({ equipment, stats }).
 *
 * @param {object} equippedFromApi - { mainhand, offhand, head, chest, legs, gloves, boots, amulet, ring }
 * @param {number} level
 * @returns {{ equipment: object, stats: object, debug: object }}
 */
export function buildPlayerFromEquipped(equippedFromApi, level = 1){
  // Reset des compteurs ignored pour cette construction
  UNKNOWN_AFFIXES.clear();
  IGNORED_HITS.clear();

  // 1) Items + agrégation des primaryBoosts
  const equipment = {};
  let totalMaxHpBoost = 0;
  let totalArmorBoost = 0;
  let totalGlobalDmgPct = 0;
  let totalElemDmgPct = 0;
  for(const [slot, item] of Object.entries(equippedFromApi || {})){
    const res = buildGameItem(item);
    if(res){
      equipment[slot] = res.gameItem;
      totalMaxHpBoost   += res.primaryBoosts.maxHp || 0;
      totalArmorBoost   += res.primaryBoosts.armor || 0;
      totalGlobalDmgPct += res.primaryBoosts.globalDmgPct || 0;
      totalElemDmgPct   += res.primaryBoosts.elemDmgPct   || 0;
    }
  }

  // 2) Stats finales : base + level + bonus primaires
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

  // 3) Arme équipée : remplace damage + damageType + range
  if(equipment.mainhand){
    const mh = equipment.mainhand;
    if(mh.damage) stats.damage = [...mh.damage];
    if(mh.damageType) stats.damageType = mh.damageType;
    if(mh.range) stats.range = mh.range;
  }

  // 4) Bonus globalDmgPct sur le range damage (pré-calcul, car le moteur ne lit pas globalDmg).
  //    Note : elemDmgPct ne s'applique que si on attaque avec une arme de damageType magique
  //    (rare en mêlée). On l'applique aussi si applicable.
  let dmgMult = 1 + totalGlobalDmgPct / 100;
  // Si l'arme est magique (fire/ice/shock/poison/magic), on multiplie aussi par elemDmgPct
  const dmgType = stats.damageType;
  const isMagicWeapon = ['fire','ice','shock','poison','magic'].includes(dmgType);
  if(isMagicWeapon && totalElemDmgPct !== 0){
    dmgMult *= (1 + totalElemDmgPct / 100);
  }
  if(dmgMult !== 1){
    stats.damage = [
      Math.max(1, Math.round(stats.damage[0] * dmgMult)),
      Math.max(1, Math.round(stats.damage[1] * dmgMult)),
    ];
  }

  // 5) Caps
  for(const [stat, cap] of Object.entries(CAPS)){
    if(stats[stat] > cap) stats[stat] = cap;
  }
  if(stats.hpRegen > 5) stats.hpRegen = 5;

  // 6) Debug : log les affixes ignorés rencontrés
  const debug = {
    totalMaxHpBoost, totalArmorBoost, totalGlobalDmgPct, totalElemDmgPct,
    ignoredAffixes: Object.fromEntries(IGNORED_HITS),
    unknownAffixesSeen: [...UNKNOWN_AFFIXES],
  };
  if(IGNORED_HITS.size > 0){
    const list = [...IGNORED_HITS.entries()].map(([k, n]) => `${k}×${n}`).join(', ');
    console.warn(`[equipment-builder] Affixes ignorés (non câblés au moteur) : ${list}`);
  }

  return { equipment, stats, debug };
}

// =============================================================================
// SIMULATION de aggregatePassives() côté player.js
// =============================================================================
// Source : src/js/entities/player.js — PASSIVE_STAT_KEYS contient :
//   lifesteal, armorPen, hpRegen, critChance, critMultiplier, dodgeChance,
//   blockChance, bonusFire, bonusIce, bonusShock, bonusPoison, fireResist,
//   iceResist, shockResist, poisonResist, magicResist, ccReduction.
// Pour les autres clés (maxHp, armor...), player.js NE LES AGRÈGE PAS via passive,
// elles arrivent déjà dans `stats` final.
//
// NOTE : il faut aussi ajouter les 6 nouvelles stats câblées au moteur
// (firstHitReductionPct, doubleStrikeChance, freeMovement, armorAdjacent)
// à PASSIVE_STAT_KEYS dans player.js sinon elles ne seront pas agrégées.
// Ici on les liste pour que le panel debug les voie de façon cohérente.
const PASSIVE_STAT_KEYS = new Set([
  // Base
  'lifesteal', 'armorPen', 'hpRegen',
  'critChance', 'critMultiplier', 'dodgeChance', 'blockChance',
  'bonusFire', 'bonusIce', 'bonusShock', 'bonusPoison',
  'fireResist', 'iceResist', 'shockResist', 'poisonResist', 'magicResist',
  'ccReduction',
  // 1ère vague
  'firstHitReductionPct', 'doubleStrikeChance', 'freeMovement', 'armorAdjacent',
  // Multipliers conditionnels offensifs
  'fullHpDamageMult', 'missingHpDamagePct', 'executeDamageMult',
  'firstStrikeDamageMult', 'firstStrikeChance',
  'afterMoveDamageMult', 'noMoveDamageMult', 'longMoveDamageMult',
  'armorDamageMult', 'afflictedDamageBonus', 'backstabDamageMult',
  'perBleedStackDamage', 'pierceDamagePct', 'maxRangeDamage', 'headshotDamagePct',
  // Réductions défensives
  'lowHpReductionPct', 'fortifyPct',
  // Crit alt
  'elemCritChance', 'elemCritDamage', 'elemLifesteal', 'elemStatusDuration',
  // Status
  'bleedDamage', 'bleedResist', 'stunOnCritChance',
  // Triggers
  'triggerExplosion', 'triggerParalyzed', 'triggerElectrocuted', 'triggerSick',
  // On-kill
  'cdReducOnKill', 'killReloadChance', 'freeSpellOnKillChance',
  // Avoidance
  'parryChance', 'riposteChance', 'thornsMeleePct', 'blockThornsDamage',
  // Repeat
  'multishotChance', 'cleavePct', 'spellEchoChance',
  // Free actions
  'freeOpenerChance', 'freeShotChance',
  // Item modifiers
  'spellRange', 'spellAPCostReduction', 'aoeRadius', 'bowRangeBonus',
  'amuletElemDamage', 'amuletSpellPower',
  // Movement
  'fly', 'teleport',
  // Loot
  'magicFind', 'essenceFind',
]);

/**
 * Reproduit aggregatePassives() de player.js : pour chaque item, somme les
 * passives autorisées sur les stats correspondantes. Retourne le stats final
 * que le moteur de combat verra (= ce qui finit dans state.player.X).
 *
 * @param {object} stats - sortie de buildPlayerFromEquipped().stats
 * @param {object} equipment - sortie de buildPlayerFromEquipped().equipment
 * @returns {object} stats final tel que le moteur le verra
 */
export function finalizeStatsForDisplay(stats, equipment){
  const out = { ...stats };
  // Copie defensive du range damage (sinon mutation partagée)
  if(Array.isArray(stats.damage)) out.damage = [...stats.damage];

  for(const slot in equipment){
    const item = equipment[slot];
    if(!item?.passive) continue;
    for(const [k, v] of Object.entries(item.passive)){
      if(!PASSIVE_STAT_KEYS.has(k)) continue;
      out[k] = (out[k] || 0) + v;
    }
  }

  // Applique les caps (comme dans player.js)
  const CAPS_FINAL = {
    fireResist: 75, iceResist: 75, shockResist: 75, poisonResist: 75, magicResist: 75,
    critChance: 70, dodgeChance: 60, blockChance: 60, ccReduction: 50,
  };
  for(const [stat, cap] of Object.entries(CAPS_FINAL)){
    if(out[stat] > cap) out[stat] = cap;
  }
  if(out.hpRegen > 5) out.hpRegen = 5;

  return out;
}
