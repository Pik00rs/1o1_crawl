// src/js/loot/combo-resolver.js
// Détecte et déclenche les combos élémentaires en combat.

/**
 * Vérifie si un combo se déclenche quand on applique un statut sur une cible.
 *
 * @param {object} DATA
 * @param {object} target - Cible (qui possède statuses[])
 * @param {object} appliedStatus - Statut qu'on vient d'appliquer { id, duration, power }
 * @returns {object|null} Combo déclenché { combo, effect, aftermath } ou null
 */
export function checkComboOnStatus(DATA, target, appliedStatus) {
  const combos = DATA.combos;

  for (const [comboId, combo] of Object.entries(combos)) {
    if (comboId === '_meta') continue;

    if (combo.trigger.type === 'statusOnStatus') {
      // Vérifie : statut appliqué = trigger.applied, ET cible a déjà trigger.existing
      if (appliedStatus.id !== combo.trigger.applied) continue;
      const hasExisting = target.statuses?.some(s => s.id === combo.trigger.existing);
      if (!hasExisting) continue;

      return { combo, comboId };
    }

    if (combo.trigger.type === 'statusStackThreshold') {
      if (appliedStatus.id !== combo.trigger.statusId) continue;
      const stacks = target.statuses?.filter(s => s.id === appliedStatus.id).length || 0;
      if (stacks < combo.trigger.stackThreshold) continue;

      return { combo, comboId };
    }
  }

  return null;
}

/**
 * Vérifie un combo de type "damageTypeOnStatus" (ex: contondant sur Gelé = Brise).
 *
 * @param {object} DATA
 * @param {object} target - Cible
 * @param {string} damageType - Type de dégâts entrant
 * @returns {object|null} Combo déclenché ou null
 */
export function checkComboOnDamage(DATA, target, damageType) {
  const combos = DATA.combos;

  for (const [comboId, combo] of Object.entries(combos)) {
    if (comboId === '_meta') continue;
    if (combo.trigger.type !== 'damageTypeOnStatus') continue;
    if (combo.trigger.incomingDamageType !== damageType) continue;

    const hasExisting = target.statuses?.some(s => s.id === combo.trigger.existing);
    if (!hasExisting) continue;

    return { combo, comboId };
  }

  return null;
}

/**
 * Applique l'aftermath d'un combo (retire des statuts, etc.).
 */
export function applyComboAftermath(DATA, target, combo) {
  if (!combo.aftermath) return;
  for (const action of combo.aftermath) {
    if (action.action === 'removeStatus') {
      target.statuses = target.statuses?.filter(s => s.id !== action.statusId) || [];
    }
    if (action.action === 'clearStacks') {
      target.statuses = target.statuses?.filter(s => s.id !== action.statusId) || [];
    }
  }
}
