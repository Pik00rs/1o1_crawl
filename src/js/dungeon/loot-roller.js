// src/js/dungeon/loot-roller.js
// Roll le loot final d'un donjon (à la génération de la run, donc avant le combat).
// Respecte la règle :
//   - lootCount augmente avec le level (D1: 1-2, D6: 5-7)
//   - boss drop obligatoirement 1 item épique ou légendaire (75% épique / 25% légendaire)
//   - reste : roll par poids du pool

import { ITEM_TEMPLATES, RARITIES, ASCENSION_DATA } from '../../dashboard/ascension-data.js';

// ============================================================
// CONFIGURATION
// ============================================================

// Quantité de loot par level (min, max). Index 0 = D1.
const LOOT_COUNT_RANGES = [
  [1, 2],   // D1
  [2, 3],   // D2
  [2, 3],   // D3
  [3, 4],   // D4
  [4, 5],   // D5
  [5, 7],   // D6
];

// Drop des ressources biome par level (min, max). Index 0 = D1.
const RESOURCE_RANGES = [
  [3, 6],     // D1
  [6, 10],    // D2
  [10, 16],   // D3
  [16, 24],   // D4
  [24, 36],   // D5
  [40, 60],   // D6
];

// Probabilités épique vs légendaire pour le boss drop (D6 only).
// Légendaire est rare comme demandé : "peu de chance d'avoir légendaire".
const BOSS_DROP_LEGENDARY_CHANCE = 0.05; // 5% légendaire, 95% épique

// ============================================================
// HELPERS
// ============================================================

function rollInt(rng, min, max){
  return Math.floor(rng() * (max - min + 1)) + min;
}

function pickWeighted(rng, pool){
  const totalWeight = pool.reduce((s, p) => s + (p.weight || 1), 0);
  let r = rng() * totalWeight;
  for(const item of pool){
    r -= (item.weight || 1);
    if(r <= 0) return item;
  }
  return pool[pool.length - 1]; // fallback
}

// Roll les stats d'un item à partir de ses statRanges.
function rollItemStats(rng, statRanges){
  const stats = {};
  for(const [key, range] of Object.entries(statRanges || {})){
    if(Array.isArray(range) && range.length === 2){
      stats[key] = rollInt(rng, range[0], range[1]);
    }
  }
  return stats;
}

// ============================================================
// MAIN ROLLER
// ============================================================

/**
 * Roll le loot final du donjon.
 *
 * @param {string} biomeId
 * @param {number} level - 1..6
 * @param {function} rng - random number generator (0..1)
 * @returns {DungeonLoot}
 */
export function rollDungeonLoot(biomeId, level, rng){
  // Récupère le pool depuis ascension-data
  const biomeData = ASCENSION_DATA[biomeId];
  if(!biomeData){
    throw new Error(`Unknown biome: ${biomeId}`);
  }
  const dungeon = biomeData.dungeons[level - 1];
  if(!dungeon){
    throw new Error(`Unknown dungeon level ${level} for biome ${biomeId}`);
  }
  const pool = dungeon.lootPool;
  if(!pool || pool.length === 0){
    throw new Error(`Empty loot pool for ${biomeId} D${level}`);
  }

  // Quantité d'items
  const [countMin, countMax] = LOOT_COUNT_RANGES[level - 1];
  const itemCount = rollInt(rng, countMin, countMax);

  const items = [];

  // Boss garanti épique ou légendaire (D6 only)
  if(level === 6){
    const isLegendary = rng() < BOSS_DROP_LEGENDARY_CHANCE;
    const guaranteedRarity = isLegendary ? 'legendary' : 'epic';

    // On prend l'item le plus puissant du pool comme base, puis on bump sa rareté.
    // Stratégie : prendre un item de rareté max disponible (rare en général), et le promouvoir.
    const rareItems = pool.filter(p => p.rarity === 'rare');
    const baseItem = rareItems.length > 0
      ? pickWeighted(rng, rareItems)
      : pickWeighted(rng, pool);

    items.push({
      itemId: baseItem.itemId,
      rarity: guaranteedRarity,
      stats: rollItemStats(rng, baseItem.statRanges),
      isBossDrop: true,
    });
  }

  // Le reste du loot : roll par poids dans le pool
  const remaining = level === 6 ? itemCount - 1 : itemCount;
  for(let i = 0; i < remaining; i++){
    const baseItem = pickWeighted(rng, pool);
    items.push({
      itemId: baseItem.itemId,
      rarity: baseItem.rarity,
      stats: rollItemStats(rng, baseItem.statRanges),
      isBossDrop: false,
    });
  }

  // Roll les ressources biome
  const [resMin, resMax] = RESOURCE_RANGES[level - 1];
  const resourceAmount = rollInt(rng, resMin, resMax);

  return {
    items,
    resource: {
      id: biomeData.resource.id,
      name: biomeData.resource.name,
      icon: biomeData.resource.icon,
      color: biomeData.resource.color,
      amount: resourceAmount,
    },
  };
}

// ============================================================
// FORMATTERS (pour debug + UI)
// ============================================================

/**
 * Formatte un item pour l'affichage : nom + rareté + stats lisibles.
 */
export function formatItem(rolled){
  const template = ITEM_TEMPLATES[rolled.itemId];
  const rarity = RARITIES[rolled.rarity];
  if(!template) return null;

  const statsLine = Object.entries(rolled.stats)
    .map(([key, val]) => `${formatStatLabel(key)} ${val}`)
    .join(' · ');

  return {
    icon: template.icon,
    name: template.name,
    cat: template.cat,
    slot: template.slot,
    rarity: rolled.rarity,
    rarityLabel: rarity.label,
    rarityColor: rarity.color,
    stats: rolled.stats,
    statsLine,
    isBossDrop: rolled.isBossDrop,
  };
}

const STAT_LABELS = {
  dmg:        'DMG',
  armor:      'ARM',
  hp:         'HP',
  burn:       'BRN',
  freeze:     'FRZ',
  slow:       'SLW',
  poison:     'POI',
  bleed:      'BLD',
  shock:      'SHK',
  stun:       'STN',
  pierce:     'PRC',
  crit:       'CRT',
  heal:       'HEAL',
  charge:     'CHG',
  fireRes:    'FIRE_RES',
  coldRes:    'COLD_RES',
  poisonRes:  'POI_RES',
  shockRes:   'SHK_RES',
  bleedRes:   'BLD_RES',
  range:      'RNG',
  aoe:        'AOE',
  pull:       'PULL',
  block:      'BLOCK',
  lifesteal:  'LS',
  reroll:     'REROLL',
  invSlots:   'INV',
};
function formatStatLabel(key){
  return STAT_LABELS[key] || key.toUpperCase();
}

export { LOOT_COUNT_RANGES, RESOURCE_RANGES };
