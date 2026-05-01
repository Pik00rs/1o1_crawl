// src/js/loot/forge.js
// Opérations de la forge : burn, reroll value, reroll affix, transfer, upgrade ilvl.

import { rollValue, applyIlvlMultiplier, getTierRangeMultiplier } from './value-roller.js';

/**
 * BURN — Détruit un item, retourne les essences récupérées.
 *
 * @param {object} DATA
 * @param {object} item
 * @param {string} biomeId - Biome d'origine de l'item (pour type d'essence)
 * @returns {object} { essenceId, count }
 */
export function burnItem(DATA, item, biomeId = 'inferno') {
  const baseTier = DATA.forgeConfig.burnEssences[item.tier] || 1;
  const count = baseTier * item.ilvl;
  const biome = DATA.biomes[biomeId];
  return {
    essenceId: biome?.essence?.id || 'ashEmber',
    essenceName: biome?.essence?.name || 'Cendres ardentes',
    count,
  };
}

/**
 * REROLL VALUE — Re-roll juste la valeur d'un affixe (garde le même affixe).
 *
 * @param {object} DATA
 * @param {object} item
 * @param {number} affixIndex - Index de l'affixe à reroll dans item.affixes
 * @param {number} previousRerollCount - Nombre de fois où cet affixe a déjà été rerollé (pour coût exponentiel)
 * @returns {object} { newAffix, cost: { essences, gold } }
 */
export function rerollAffixValue(DATA, item, affixIndex, previousRerollCount = 0) {
  const affix = item.affixes[affixIndex];
  if (!affix) return null;

  // Récupère la définition originale
  const affixDef = DATA.affixes.prefixes[affix.id] || DATA.affixes.suffixes[affix.id];
  if (!affixDef) return null;

  // Calcule la range pour ce tier/ilvl
  const tierMult = getTierRangeMultiplier(DATA, item.tier);
  const ilvlMult = applyIlvlMultiplier(DATA, item.ilvl);
  const finalMin = affixDef.valueRange[0] * tierMult[0] * ilvlMult;
  const finalMax = affixDef.valueRange[1] * tierMult[1] * ilvlMult;

  const newValue = rollValue([finalMin, finalMax]);
  const quality = Math.round(((newValue - finalMin) / (finalMax - finalMin)) * 100);

  const newAffix = {
    ...affix,
    value: newValue,
    minRolled: Math.round(finalMin * 10) / 10,
    maxRolled: Math.round(finalMax * 10) / 10,
    quality,
  };

  // Coût exponentiel
  const costConfig = DATA.forgeConfig.rerollValueCost;
  const expMult = Math.pow(costConfig.exponentialMultiplier, previousRerollCount);
  const essences = Math.round(rollValue(costConfig.baseEssences) * expMult);
  const gold = Math.round(rollValue(costConfig.baseGold) * expMult);

  return {
    newAffix,
    cost: { essences, gold },
  };
}

/**
 * REROLL AFFIX — Change le type de stat (mais garde le slot).
 * L'affixe est replacé par un autre affixe valide pour cet item, du même type (préfixe/suffixe).
 */
export function rerollAffix(DATA, item, biome, affixIndex, previousRerollCount = 0) {
  const oldAffix = item.affixes[affixIndex];
  if (!oldAffix) return null;

  // Pool d'affixes valides du même type, exclure ceux déjà sur l'item
  const usedIds = new Set(item.affixes.map(a => a.id));
  usedIds.delete(oldAffix.id); // on autorise à re-roll le même par hasard

  const affixPool = oldAffix.type === 'prefix' ? DATA.affixes.prefixes : DATA.affixes.suffixes;
  const candidates = Object.entries(affixPool)
    .map(([id, a]) => ({ ...a, id }))
    .filter(a => !usedIds.has(a.id) && isAffixValid(a, item));

  if (candidates.length === 0) return null;

  const newDef = candidates[Math.floor(Math.random() * candidates.length)];

  // Calcule la valeur
  const tierMult = getTierRangeMultiplier(DATA, item.tier);
  const ilvlMult = applyIlvlMultiplier(DATA, item.ilvl);
  const finalMin = newDef.valueRange[0] * tierMult[0] * ilvlMult;
  const finalMax = newDef.valueRange[1] * tierMult[1] * ilvlMult;

  const value = rollValue([finalMin, finalMax]);
  const quality = Math.round(((value - finalMin) / (finalMax - finalMin)) * 100);

  const newAffix = {
    id: newDef.id,
    name: newDef.name,
    type: newDef.type,
    stat: newDef.stat,
    label: newDef.label,
    value,
    minRolled: Math.round(finalMin * 10) / 10,
    maxRolled: Math.round(finalMax * 10) / 10,
    quality,
    tags: newDef.tags || [],
  };

  const costConfig = DATA.forgeConfig.rerollAffixCost;
  const expMult = Math.pow(costConfig.exponentialMultiplier, previousRerollCount);
  const essences = Math.round(rollValue(costConfig.baseEssences) * expMult);
  const gold = Math.round(rollValue(costConfig.baseGold) * expMult);

  return {
    newAffix,
    cost: { essences, gold },
  };
}

/**
 * TRANSFER AFFIX — Transfère un affixe d'un item émetteur à un receveur.
 * L'émetteur est détruit dans l'opération.
 */
export function transferAffix(DATA, emitterItem, receiverItem, emitterAffixIndex, receiverSlotIndex) {
  // Vérification compatibilité
  if (emitterItem.type !== receiverItem.type) return null;

  const emitterCategory = emitterItem.category || emitterItem.slot;
  const receiverCategory = receiverItem.category || receiverItem.slot;
  if (emitterCategory !== receiverCategory) return null;

  const affixToTransfer = emitterItem.affixes[emitterAffixIndex];
  if (!affixToTransfer) return null;

  // Récupère la def originale
  const affixDef = DATA.affixes.prefixes[affixToTransfer.id] || DATA.affixes.suffixes[affixToTransfer.id];
  if (!affixDef) return null;

  // Re-calcul de la valeur selon iLvl du RECEVEUR
  const tierMult = getTierRangeMultiplier(DATA, receiverItem.tier);
  const ilvlMult = applyIlvlMultiplier(DATA, receiverItem.ilvl);
  const finalMin = affixDef.valueRange[0] * tierMult[0] * ilvlMult;
  const finalMax = affixDef.valueRange[1] * tierMult[1] * ilvlMult;

  // Bias selon différence d'iLvl
  let value;
  if (emitterItem.ilvl > receiverItem.ilvl) {
    // Roll défavorable (vers min)
    value = finalMin + Math.random() * (finalMax - finalMin) * 0.5;
  } else if (emitterItem.ilvl < receiverItem.ilvl) {
    // Roll favorable (vers max)
    value = finalMin + (finalMax - finalMin) * 0.5 + Math.random() * (finalMax - finalMin) * 0.5;
  } else {
    // Roll normal
    value = rollValue([finalMin, finalMax]);
  }
  value = Math.round(value * 10) / 10;
  const quality = Math.round(((value - finalMin) / (finalMax - finalMin)) * 100);

  const newAffix = {
    ...affixToTransfer,
    value,
    minRolled: Math.round(finalMin * 10) / 10,
    maxRolled: Math.round(finalMax * 10) / 10,
    quality,
  };

  // Place sur le receveur
  if (receiverSlotIndex !== undefined && receiverItem.affixes[receiverSlotIndex]) {
    receiverItem.affixes[receiverSlotIndex] = newAffix;
  } else {
    receiverItem.affixes.push(newAffix);
  }

  // Coût
  const costConfig = DATA.forgeConfig.transferAffixCost;
  const essences = Math.round(rollValue(costConfig.baseEssences));
  const gold = Math.round(rollValue(costConfig.baseGold));

  return {
    receiverItem,
    emitterDestroyed: true,
    cost: { essences, gold },
  };
}

/**
 * UPGRADE ILVL — +1 niveau d'item.
 */
export function upgradeIlvl(DATA, item) {
  if (item.ilvl >= 10) return null;
  const nextLvl = item.ilvl + 1;
  const costKey = `${item.ilvl}to${nextLvl}`;
  const cost = DATA.forgeConfig.upgradeIlvlCost[costKey];
  if (!cost) return null;

  // Re-calcul de toutes les valeurs avec le nouveau iLvl
  item.ilvl = nextLvl;

  // Re-scale implicit
  if (item.implicit) {
    const oldMult = applyIlvlMultiplier(DATA, item.ilvl - 1);
    const newMult = applyIlvlMultiplier(DATA, item.ilvl);
    item.implicit.value = Math.round(item.implicit.value * (newMult / oldMult) * 10) / 10;
  }

  // Re-scale affixes (proportionnellement, sans modifier la qualité)
  for (const affix of item.affixes) {
    const oldMult = applyIlvlMultiplier(DATA, item.ilvl - 1);
    const newMult = applyIlvlMultiplier(DATA, item.ilvl);
    const ratio = newMult / oldMult;
    affix.value = Math.round(affix.value * ratio * 10) / 10;
    affix.minRolled = Math.round(affix.minRolled * ratio * 10) / 10;
    affix.maxRolled = Math.round(affix.maxRolled * ratio * 10) / 10;
    // Quality stays the same
  }

  return {
    item,
    cost: { essences: cost, gold: 0 },
  };
}

// ===== Helpers =====

function isAffixValid(affix, item) {
  if (!affix.validSlots || affix.validSlots.length === 0) return true;
  const slotMap = {
    'oneHand': 'mainhand',
    'twoHand': 'mainhand',
    'offHand': 'offhand',
  };
  const itemSlot = slotMap[item.category] || item.slot || item.subtype;
  return affix.validSlots.includes(itemSlot);
}
