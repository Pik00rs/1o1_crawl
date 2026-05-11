// src/js/dungeon/loot-roller.js
// Roll le loot final d'un donjon. Étendu avec magicFind / essenceFind.

import { ITEM_TEMPLATES, RARITIES, ASCENSION_DATA } from '../../dashboard/ascension-data.js';

const LOOT_COUNT_RANGES = [[1,2],[2,3],[2,3],[3,4],[4,5],[5,7]];
const RESOURCE_RANGES = [[3,6],[6,10],[10,16],[16,24],[24,36],[40,60]];
const BOSS_DROP_LEGENDARY_CHANCE = 0.05;
const RARITY_ORDER = ['common','magic','rare','epic','legendary'];

function rollInt(rng, min, max){ return Math.floor(rng() * (max - min + 1)) + min; }

function pickWeighted(rng, pool){
  const totalWeight = pool.reduce((s, p) => s + (p.weight || 1), 0);
  let r = rng() * totalWeight;
  for(const item of pool){
    r -= (item.weight || 1);
    if(r <= 0) return item;
  }
  return pool[pool.length - 1];
}

function rollItemStats(rng, statRanges){
  const stats = {};
  for(const [key, range] of Object.entries(statRanges || {})){
    if(Array.isArray(range) && range.length === 2){
      stats[key] = rollInt(rng, range[0], range[1]);
    }
  }
  return stats;
}

function applyMagicFindPromotion(rarity, magicFindPct, rng){
  if(!magicFindPct || magicFindPct <= 0) return rarity;
  let idx = RARITY_ORDER.indexOf(rarity);
  if(idx === -1) return rarity;
  let remaining = magicFindPct;
  while(idx < RARITY_ORDER.length - 1 && remaining > 0){
    const procChance = Math.min(50, remaining) / 100;
    if(rng() < procChance){ idx++; remaining -= 50; }
    else break;
  }
  return RARITY_ORDER[idx];
}

/**
 * @param {string} biomeId
 * @param {number} level - 1..6
 * @param {function} rng
 * @param {object} [playerStats] - { magicFind, essenceFind }
 */
export function rollDungeonLoot(biomeId, level, rng, playerStats = {}){
  const biomeData = ASCENSION_DATA[biomeId];
  if(!biomeData) throw new Error(`Unknown biome: ${biomeId}`);
  const dungeon = biomeData.dungeons[level - 1];
  if(!dungeon) throw new Error(`Unknown dungeon level ${level} for biome ${biomeId}`);
  const pool = dungeon.lootPool;
  if(!pool || pool.length === 0) throw new Error(`Empty loot pool for ${biomeId} D${level}`);

  const magicFind = playerStats.magicFind || 0;
  const essenceFind = playerStats.essenceFind || 0;

  const [countMin, countMax] = LOOT_COUNT_RANGES[level - 1];
  const itemCount = rollInt(rng, countMin, countMax);

  const items = [];

  if(level === 6){
    const isLegendary = rng() < BOSS_DROP_LEGENDARY_CHANCE;
    const guaranteedRarity = isLegendary ? 'legendary' : 'epic';
    const rareItems = pool.filter(p => p.rarity === 'rare');
    const baseItem = rareItems.length > 0 ? pickWeighted(rng, rareItems) : pickWeighted(rng, pool);
    items.push({
      itemId: baseItem.itemId,
      rarity: guaranteedRarity,
      stats: rollItemStats(rng, baseItem.statRanges),
      isBossDrop: true,
    });
  }

  const remaining = level === 6 ? itemCount - 1 : itemCount;
  for(let i = 0; i < remaining; i++){
    const baseItem = pickWeighted(rng, pool);
    const finalRarity = applyMagicFindPromotion(baseItem.rarity, magicFind, rng);
    items.push({
      itemId: baseItem.itemId,
      rarity: finalRarity,
      stats: rollItemStats(rng, baseItem.statRanges),
      isBossDrop: false,
      magicFindPromoted: finalRarity !== baseItem.rarity,
    });
  }

  const [resMin, resMax] = RESOURCE_RANGES[level - 1];
  let resourceAmount = rollInt(rng, resMin, resMax);
  if(essenceFind > 0){
    resourceAmount = Math.round(resourceAmount * (1 + essenceFind / 100));
  }

  return {
    items,
    resource: {
      id: biomeData.resource.id,
      name: biomeData.resource.name,
      icon: biomeData.resource.icon,
      color: biomeData.resource.color,
      amount: resourceAmount,
    },
    bonusesApplied: { magicFind, essenceFind },
  };
}

export function formatItem(rolled){
  const template = ITEM_TEMPLATES[rolled.itemId];
  const rarity = RARITIES[rolled.rarity];
  if(!template) return null;
  const statsLine = Object.entries(rolled.stats)
    .map(([key, val]) => `${formatStatLabel(key)} ${val}`)
    .join(' · ');
  return {
    icon: template.icon, name: template.name, cat: template.cat, slot: template.slot,
    rarity: rolled.rarity, rarityLabel: rarity.label, rarityColor: rarity.color,
    stats: rolled.stats, statsLine,
    isBossDrop: rolled.isBossDrop,
    magicFindPromoted: rolled.magicFindPromoted,
  };
}

const STAT_LABELS = {
  dmg:'DMG', armor:'ARM', hp:'HP', burn:'BRN', freeze:'FRZ', slow:'SLW',
  poison:'POI', bleed:'BLD', shock:'SHK', stun:'STN', pierce:'PRC',
  crit:'CRT', heal:'HEAL', charge:'CHG',
  fireRes:'FIRE_RES', coldRes:'COLD_RES', poisonRes:'POI_RES',
  shockRes:'SHK_RES', bleedRes:'BLD_RES',
  range:'RNG', aoe:'AOE', pull:'PULL', block:'BLOCK',
  lifesteal:'LS', reroll:'REROLL', invSlots:'INV',
};
function formatStatLabel(key){ return STAT_LABELS[key] || key.toUpperCase(); }

export { LOOT_COUNT_RANGES, RESOURCE_RANGES };
