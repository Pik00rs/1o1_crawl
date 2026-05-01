// src/js/entities/player.js
// Création du joueur :
//   1) Lit la config (level, stuff preset, custom modifiers)
//   2) Calcule les stats finales via applyStuff()
//   3) Détermine l'équipement (config OU loadout par défaut)
//   4) Agrège les passifs des items (rings notamment) sur les stats finales
//   5) Construit l'objet player consommable par le moteur

import { applyStuff } from './player-stats.js';
import { DATA } from '../data/loader.js';

// Stats agrégeables depuis les passifs d'items
const PASSIVE_STAT_KEYS = [
  'lifesteal', 'armorPen', 'hpRegen',
  'critChance', 'critMultiplier', 'dodgeChance', 'blockChance',
  'bonusFire', 'bonusIce', 'bonusShock', 'bonusPoison',
  'fireResist', 'iceResist', 'shockResist', 'poisonResist', 'magicResist',
  'ccReduction',
];

// =============================================================================
// LOADOUT PAR DÉFAUT
// =============================================================================
// Si aucun équipement n'est passé en config, on en construit un selon le preset
// de stuff. Ça assure que le joueur a TOUJOURS une arme + une amulette + un anneau
// (sinon pas d'attaques d'arme et pas de sort).

function buildDefaultLoadout(stuffPreset) {
  // Chaque preset peut suggérer une variation de loadout
  const loadouts = {
    naked:   { mainhand: 'swordRusty',  amulet: null,                 ring: null },
    poor:    { mainhand: 'swordRusty',  amulet: 'amuletPyromancy',    ring: null },
    balanced:{ mainhand: 'swordIron',   amulet: 'amuletPyromancy',    ring: 'ringPyrokinesis' },
    strong:  { mainhand: 'axeBerserker',amulet: 'amuletStorm',        ring: 'ringPredator' },
    op:      { mainhand: 'warhammer',   amulet: 'amuletPlague',       ring: 'ringVampire' },
  };
  const loadout = loadouts[stuffPreset] || loadouts.balanced;

  const eq = {};
  if (loadout.mainhand && DATA.weapons?.[loadout.mainhand]) {
    eq.mainhand = DATA.weapons[loadout.mainhand];
  }
  if (loadout.amulet && DATA.amulets?.[loadout.amulet]) {
    eq.amulet = DATA.amulets[loadout.amulet];
  }
  if (loadout.ring && DATA.rings?.[loadout.ring]) {
    eq.ring = DATA.rings[loadout.ring];
  }
  return eq;
}

// =============================================================================
// AGRÉGATION DES PASSIFS
// =============================================================================
// Pour chaque item équipé qui a un champ "passive: { stat: value, ... }",
// on additionne les valeurs sur les stats correspondantes.

function aggregatePassives(stats, equipment) {
  for (const slot in equipment) {
    const item = equipment[slot];
    if (!item?.passive) continue;
    for (const [k, v] of Object.entries(item.passive)) {
      if (!PASSIVE_STAT_KEYS.includes(k)) continue;
      stats[k] = (stats[k] || 0) + v;
    }
  }
  return stats;
}

// =============================================================================
// CRÉATION DU JOUEUR
// =============================================================================

export function createPlayer(config = {}) {
  const level = config.level ?? 1;
  const stuff = config.stuff ?? 'balanced';
  const customMods = config.customModifiers ?? [];

  // 1) Stats de base + stuff modifiers
  let stats = config.stats ?? applyStuff(level, stuff, customMods);

  // 2) Équipement
  const equipment = config.equipment ?? buildDefaultLoadout(stuff);

  // 3) Agréger les passifs d'items sur les stats
  stats = aggregatePassives(stats, equipment);

  // Caps après agrégation
  if (stats.hpRegen > 5) stats.hpRegen = 5;
  if (stats.critChance > 70) stats.critChance = 70;
  if (stats.dodgeChance > 60) stats.dodgeChance = 60;
  if (stats.blockChance > 60) stats.blockChance = 60;
  for (const r of ['fireResist','iceResist','shockResist','poisonResist','magicResist']) {
    if (stats[r] > 75) stats[r] = 75;
  }

  return {
    id: 'player',
    name: config.name || 'Kael',
    icon: config.icon || '🧙',
    isPlayer: true,
    x: config.x ?? 1,
    y: config.y ?? 2,

    level,
    stuffPreset: stuff,
    equipment,

    // Vitalité
    hp: stats.maxHp,
    maxHp: stats.maxHp,
    ap: 0,
    maxAp: stats.maxAp,
    bonusAp: stats.bonusAp,

    // Combat
    damage: stats.damage,
    damageType: stats.damageType,
    armor: stats.armor,
    dodgeChance: stats.dodgeChance,
    blockChance: stats.blockChance,
    critChance: stats.critChance,
    critMultiplier: stats.critMultiplier,
    moveSpeed: stats.moveSpeed,
    range: stats.range,
    initiative: stats.initiative,

    // Régénération & vampirisme
    hpRegen: stats.hpRegen,
    lifesteal: stats.lifesteal,
    armorPen: stats.armorPen,

    // Élémentaires
    bonusFire: stats.bonusFire,
    bonusIce: stats.bonusIce,
    bonusShock: stats.bonusShock,
    bonusPoison: stats.bonusPoison,
    fireResist: stats.fireResist,
    iceResist: stats.iceResist,
    shockResist: stats.shockResist,
    poisonResist: stats.poisonResist,
    magicResist: stats.magicResist || 0,

    // CC
    ccReduction: stats.ccReduction,

    // État
    statuses: [],
    cooldowns: {},
    isDead: false,

    finalStats: stats,
  };
}
