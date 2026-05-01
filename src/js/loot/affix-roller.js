// src/js/loot/affix-roller.js
// Roll des affixes selon tier, biome, slot. Couche 2 du RNG.

import { rollValue, applyIlvlMultiplier, getTierRangeMultiplier } from './value-roller.js';

/**
 * Roll un set d'affixes pour un item.
 *
 * @param {object} DATA - Toute la data
 * @param {object} ctx - Contexte
 *   @param {object} ctx.item - Item de base
 *   @param {object} ctx.biome - Biome courant
 *   @param {string} ctx.tier - Tier de l'item
 *   @param {number} ctx.ilvl - Item level
 *   @param {number} ctx.count - Nombre d'affixes à roll
 *   @param {string[]} [ctx.forcedAffixIds] - IDs d'affixes garantis (ex: légendaires)
 *   @param {string[]} [ctx.excludeIds] - IDs d'affixes à exclure
 * @returns {Array} Array d'affixes rollés
 */
export function rollAffixes(DATA, ctx) {
  const { item, biome, tier, ilvl, count, forcedAffixIds = [], excludeIds = [] } = ctx;
  const result = [];
  const usedIds = new Set([...excludeIds]);

  // Étape 1 : ajouter les forcedAffixIds (légendaires)
  for (const forcedId of forcedAffixIds) {
    const affix = findAffix(DATA, forcedId);
    if (affix && isAffixValidForItem(affix, item)) {
      result.push(rollAffixValue(DATA, affix, tier, ilvl));
      usedIds.add(forcedId);
    }
  }

  // Étape 2 : roll le reste
  const slotsToFill = count - result.length;
  for (let i = 0; i < slotsToFill; i++) {
    // 50% chance : affixe lié au biome
    const useBiome = Math.random() < 0.5 && biome;
    const affix = pickAffix(DATA, item, biome, useBiome, usedIds);
    if (affix) {
      result.push(rollAffixValue(DATA, affix, tier, ilvl));
      usedIds.add(affix.id);
    }
  }

  return result;
}

/**
 * Choisit un affixe approprié dans le pool, selon item et biome.
 */
function pickAffix(DATA, item, biome, useBiome, usedIds) {
  const allAffixes = [
    ...Object.entries(DATA.affixes.prefixes).map(([id, a]) => ({ ...a, id })),
    ...Object.entries(DATA.affixes.suffixes).map(([id, a]) => ({ ...a, id })),
  ];

  // Filtrer : valides pour ce slot, pas déjà utilisés
  let pool = allAffixes.filter(a => isAffixValidForItem(a, item) && !usedIds.has(a.id));

  if (pool.length === 0) return null;

  // Si biome bonus, favoriser les affixes du biome
  if (useBiome && biome) {
    const favoredTags = biome.favoredTags || [];
    const favoredPool = pool.filter(a =>
      a.tags?.some(t => favoredTags.includes(t)) || a.biome === biome.id
    );
    if (favoredPool.length > 0) pool = favoredPool;
  }

  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Vérifie si un affixe est valide pour un slot d'item donné.
 */
function isAffixValidForItem(affix, item) {
  if (!affix.validSlots || affix.validSlots.length === 0) return true;

  const slotMap = {
    'oneHand': 'mainhand',
    'twoHand': 'mainhand',
    'offHand': 'offhand',
  };
  const itemSlot = slotMap[item.category] || item.slot || item.subtype;
  return affix.validSlots.includes(itemSlot);
}

/**
 * Roll la valeur d'un affixe selon tier et iLvl.
 */
function rollAffixValue(DATA, affix, tier, ilvl) {
  const tierMult = getTierRangeMultiplier(DATA, tier);
  const ilvlMult = applyIlvlMultiplier(DATA, ilvl);

  // Range finale = base × tierMult × ilvlMult
  const baseMin = affix.valueRange[0];
  const baseMax = affix.valueRange[1];

  const finalMin = Math.round(baseMin * tierMult[0] * ilvlMult * 10) / 10;
  const finalMax = Math.round(baseMax * tierMult[1] * ilvlMult * 10) / 10;

  const value = rollValue([finalMin, finalMax]);

  // Calcul du % de qualité (où on est dans la range possible)
  const quality = ((value - finalMin) / (finalMax - finalMin)) * 100;

  return {
    id: affix.id,
    name: affix.name,
    type: affix.type,
    stat: affix.stat,
    label: affix.label,
    value,
    minRolled: finalMin,
    maxRolled: finalMax,
    quality: Math.round(quality),
    tags: affix.tags || [],
  };
}

function findAffix(DATA, id) {
  return DATA.affixes.prefixes[id] || DATA.affixes.suffixes[id]
    ? { ...((DATA.affixes.prefixes[id] || DATA.affixes.suffixes[id])), id }
    : null;
}
