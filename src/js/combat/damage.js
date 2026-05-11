// src/js/combat/damage.js
// Calcul des dégâts. Étend la version précédente avec :
//   - Esquive (dodgeChance)        : si proc, dmg = 0
//   - Blocage (blockChance)        : si proc sur dmg physique, dmg réduit de 50%
//   - Première frappe réduite      : firstHitReductionPct sur le 1er coup reçu du combat
//   - Armure des ennemis adjacents : armorAdjacent ajoute +X armor pour chaque ennemi à 1 case
//
// Source de vérité des types : damage-types.js

import { isPhysical, isMagic, getResistanceFields } from './damage-types.js';
import { state } from '../core/state.js';

// =============================================================================
// HELPERS
// =============================================================================

export function rollDamage(range) {
  if (!range || !Array.isArray(range)) return 0;
  return range[0] + Math.floor(Math.random() * (range[1] - range[0] + 1));
}

// Aggrège armor + armorAdjacent (compte les ennemis adjacents au target)
function getEffectiveArmor(target) {
  let armor = target.armor || 0;
  const adjBonusPer = target.armorAdjacent || 0;
  if (adjBonusPer > 0 && Array.isArray(state.enemies)) {
    let adjCount = 0;
    for (const e of state.enemies) {
      if (e.isDead) continue;
      if (e === target) continue;
      const dx = Math.abs((e.x || 0) - (target.x || 0));
      const dy = Math.abs((e.y || 0) - (target.y || 0));
      if (Math.max(dx, dy) === 1) adjCount++;
    }
    armor += adjBonusPer * adjCount;
  }
  return armor;
}

// =============================================================================
// CALCUL DES DÉGÂTS BRUTS
// =============================================================================

function rollBaseDamage({ attacker, skill, weapon }) {
  if (skill?.damage) return rollDamage(skill.damage);
  if (weapon?.damage) return rollDamage(weapon.damage);
  if (attacker.damage) return rollDamage(attacker.damage);
  if (attacker.attackPower) return rollDamage(attacker.attackPower);
  return 1;
}

// =============================================================================
// BONUS ÉLÉMENTAIRES
// =============================================================================

function applyElementalBonus(dmg, attacker, damageType) {
  if (!attacker.isPlayer) return dmg;
  if (!isMagic(damageType)) return dmg;
  if (damageType === 'fire'   && attacker.bonusFire)   dmg += attacker.bonusFire;
  if (damageType === 'ice'    && attacker.bonusIce)    dmg += attacker.bonusIce;
  if (damageType === 'shock'  && attacker.bonusShock)  dmg += attacker.bonusShock;
  if (damageType === 'poison' && attacker.bonusPoison) dmg += attacker.bonusPoison;
  return dmg;
}

// =============================================================================
// CRIT
// =============================================================================

function applyCrit(dmg, attacker, skill) {
  const critChance = (attacker.critChance || 5) + (skill?.critBonus || 0);
  const critMult   = (attacker.critMultiplier || 50);
  const isCrit = Math.random() * 100 < critChance;
  if (isCrit) {
    dmg = Math.round(dmg * (1 + critMult / 100));
  }
  return { dmg, isCrit };
}

// =============================================================================
// DÉFENSES
// =============================================================================

function applyPhysicalDefense(dmg, attacker, target) {
  const armorPen = attacker.armorPen || 0;
  const armorPiercingFactor = attacker.armorPiercing ? (1 - attacker.armorPiercing) : 1;
  let armorEff = Math.max(0, getEffectiveArmor(target) - armorPen);
  armorEff = Math.round(armorEff * armorPiercingFactor);
  const reduction = Math.min(0.75, armorEff / (armorEff + 50));
  return Math.max(1, Math.round(dmg * (1 - reduction)));
}

function applyMagicDefense(dmg, target, damageType) {
  const fields = getResistanceFields(damageType);
  let multiplier = 1;
  for (const field of fields) {
    const resist = target[field] || 0;
    if (resist > 0) {
      multiplier *= (1 - Math.min(75, resist) / 100);
    }
  }
  return Math.max(1, Math.round(dmg * multiplier));
}

// =============================================================================
// AVOIDANCE (esquive / blocage / réduction premier coup)
// =============================================================================

/**
 * Tente d'esquive. Si proc → dmg = 0 et flag dodged.
 */
function tryDodge(target) {
  const chance = target.dodgeChance || 0;
  if (chance <= 0) return false;
  return Math.random() * 100 < chance;
}

/**
 * Tente de bloquer (uniquement vs dmg physique). Si proc → dmg réduit de 50%.
 */
function tryBlock(target, damageType) {
  if (!isPhysical(damageType)) return false;
  const chance = target.blockChance || 0;
  if (chance <= 0) return false;
  return Math.random() * 100 < chance;
}

/**
 * Première frappe reçue du combat : réduction en % si target.firstHitReductionPct.
 * On utilise un flag posé sur le target (target._firstHitConsumed).
 */
function applyFirstHitReduction(dmg, target) {
  const pct = target.firstHitReductionPct || 0;
  if (pct <= 0) return dmg;
  if (target._firstHitConsumed) return dmg;
  target._firstHitConsumed = true;
  return Math.max(1, Math.round(dmg * (1 - pct / 100)));
}

// =============================================================================
// FONCTION PRINCIPALE
// =============================================================================

export function computeDamage({ attacker, target, skill, weapon }) {
  const damageType =
    skill?.damageType ||
    weapon?.damageType ||
    attacker.damageType ||
    'blunt';

  let dmg = rollBaseDamage({ attacker, skill, weapon });
  dmg = applyElementalBonus(dmg, attacker, damageType);
  if (skill?.damageMult) dmg = Math.round(dmg * skill.damageMult);

  const critResult = applyCrit(dmg, attacker, skill);
  dmg = critResult.dmg;

  // === DÉFENSES (esquive / blocage / armure / résistances / réduction 1er coup) ===
  // 1) Esquive
  let dodged = false;
  if (tryDodge(target)) {
    dmg = 0;
    dodged = true;
  } else {
    // 2) Réduction armor / résistances
    if (isPhysical(damageType)) {
      dmg = applyPhysicalDefense(dmg, attacker, target);
    } else {
      dmg = applyMagicDefense(dmg, target, damageType);
    }
    // 3) Blocage (physique only)
    let blocked = false;
    if (tryBlock(target, damageType)) {
      dmg = Math.max(1, Math.round(dmg * 0.5));
      blocked = true;
    }
    // 4) Réduction premier hit (s'applique APRÈS armor/resist pour matter même si déjà réduit)
    dmg = applyFirstHitReduction(dmg, target);
    // (exposé en return pour log)
    var __blocked = blocked;
  }

  return {
    dmg,
    isCrit: critResult.isCrit,
    isSpell: skill?.type === 'spell',
    damageType,
    dodged,
    blocked: typeof __blocked !== 'undefined' ? __blocked : false,
  };
}
