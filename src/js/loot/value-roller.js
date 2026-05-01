// src/js/loot/value-roller.js
// Couche 3 du RNG : roll des valeurs avec multiplicateur d'iLvl et tier.

/**
 * Roll une valeur dans une range donnée.
 *
 * @param {Array<number>} range - [min, max]
 * @param {number} [multiplier=1] - Multiplicateur appliqué à la range
 * @returns {number} Valeur rollée
 */
export function rollValue(range, multiplier = 1) {
  const [min, max] = range;
  const adjustedMin = min * multiplier;
  const adjustedMax = max * multiplier;
  const val = adjustedMin + Math.random() * (adjustedMax - adjustedMin);
  return Math.round(val * 10) / 10;
}

/**
 * Récupère le multiplicateur d'iLvl depuis la config forge.
 */
export function applyIlvlMultiplier(DATA, ilvl) {
  return DATA.forgeConfig.ilvlMultipliers[String(ilvl)] || 1;
}

/**
 * Récupère le multiplicateur de range pour un tier donné.
 * Returns [minMult, maxMult].
 */
export function getTierRangeMultiplier(DATA, tier) {
  return DATA.forgeConfig.tierRangeMultipliers[tier] || [1, 1];
}

/**
 * Calcule le pourcentage de qualité d'un roll dans sa range possible.
 *
 * @param {number} value - Valeur rollée
 * @param {number} min - Min de la range
 * @param {number} max - Max de la range
 * @returns {number} Pourcentage 0-100
 */
export function computeRollQuality(value, min, max) {
  if (max === min) return 100;
  return Math.round(((value - min) / (max - min)) * 100);
}

/**
 * Récupère le label de qualité (terrible, decent, good, excellent, perfect).
 */
export function getQualityTier(DATA, qualityPercent) {
  const thresholds = DATA.forgeConfig.rollQualityThresholds;
  for (const [tier, [min, max]] of Object.entries(thresholds)) {
    if (qualityPercent >= min && qualityPercent <= max) return tier;
  }
  return 'decent';
}

/**
 * Récupère la couleur de la qualité.
 */
export function getQualityColor(DATA, qualityPercent) {
  const tier = getQualityTier(DATA, qualityPercent);
  return DATA.forgeConfig.rollQualityColors[tier] || '#fff';
}
