// src/js/loot/synergies.js
// Calcul des synergies entre items équipés : tags, sets, passifs.

/**
 * Compte les items équipés par tag.
 * @returns {Object<string, number>} Mapping tag -> count
 */
export function countTagsOnEquipment(equipment) {
  const tags = {};
  for (const slot in equipment) {
    const item = equipment[slot];
    if (!item || !item.tags) continue;
    for (const tag of item.tags) {
      tags[tag] = (tags[tag] || 0) + 1;
    }
  }
  return tags;
}

/**
 * Compte les pièces de chaque set équipé.
 * @returns {Object<string, number>} Mapping setId -> count
 */
export function countSetsOnEquipment(equipment) {
  const sets = {};
  for (const slot in equipment) {
    const item = equipment[slot];
    if (!item || !item.setId) continue;
    sets[item.setId] = (sets[item.setId] || 0) + 1;
  }
  return sets;
}

/**
 * Calcule tous les bonus de set actifs sur l'équipement.
 * @returns {Array} Liste de bonus actifs
 */
export function getActiveSetBonuses(DATA, equipment) {
  const setCounts = countSetsOnEquipment(equipment);
  const activeBonuses = [];

  for (const [setId, count] of Object.entries(setCounts)) {
    const setDef = DATA.sets[setId];
    if (!setDef) continue;
    const bonuses = setDef.bonuses;

    // Trouve les paliers atteints (2/3/5)
    for (const threshold of ['2', '3', '5']) {
      if (count >= parseInt(threshold) && bonuses[threshold]) {
        activeBonuses.push({
          setId,
          setName: setDef.name,
          threshold: parseInt(threshold),
          bonus: bonuses[threshold],
        });
      }
    }
  }

  return activeBonuses;
}

/**
 * Récupère tous les passifs uniques actifs (depuis légendaires + bagues).
 */
export function getActivePassives(equipment) {
  const passives = [];
  for (const slot in equipment) {
    const item = equipment[slot];
    if (!item) continue;
    if (item.passiveId) passives.push({ source: item.name, passiveId: item.passiveId, description: item.uniquePassive });
    if (item.modifierId) passives.push({ source: item.name, passiveId: item.modifierId, description: item.uniqueModifier });
  }
  return passives;
}

/**
 * Calcule les bonus de Resonance (affixes "% par item au même tag équipé").
 */
export function computeResonanceBonus(equipment, tagToCheck) {
  const tagCounts = countTagsOnEquipment(equipment);
  const count = tagCounts[tagToCheck] || 0;
  let totalBonus = 0;

  // Cherche tous les affixes Resonance
  for (const slot in equipment) {
    const item = equipment[slot];
    if (!item || !item.affixes) continue;
    for (const affix of item.affixes) {
      if (affix.stat === 'tagResonance' && affix.tags?.includes('Resonance')) {
        totalBonus += affix.value * count;
      }
    }
  }
  return totalBonus;
}

/**
 * Aggrégation totale de toutes les stats d'un set d'équipement.
 * Utile pour afficher les stats du joueur ou calculer les dégâts.
 */
export function aggregateStats(DATA, equipment) {
  const stats = {};

  // Implicits + affixes
  for (const slot in equipment) {
    const item = equipment[slot];
    if (!item) continue;

    // Implicit
    if (item.implicit) {
      stats[item.implicit.id] = (stats[item.implicit.id] || 0) + item.implicit.value;
    }

    // Affixes
    if (item.affixes) {
      for (const affix of item.affixes) {
        stats[affix.stat] = (stats[affix.stat] || 0) + affix.value;
      }
    }
  }

  // Set bonuses
  const setBonuses = getActiveSetBonuses(DATA, equipment);
  for (const sb of setBonuses) {
    if (sb.bonus.stat) {
      stats[sb.bonus.stat] = (stats[sb.bonus.stat] || 0) + sb.bonus.value;
    }
  }

  return stats;
}
