// src/js/combat/damage.js
// Calcul des dégâts avec tous les modifiers conditionnels.

import { isPhysical, isMagic, getResistanceFields } from './damage-types.js';
import { state } from '../core/state.js';
import {
  computeConditionalMultipliers,
  computeConditionalReduction,
  tryParry,
  applyHeadshotIfCrit,
  tryActivateFortify,
} from './modifiers.js';

export function rollDamage(range) {
  if (!range || !Array.isArray(range)) return 0;
  return range[0] + Math.floor(Math.random() * (range[1] - range[0] + 1));
}

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

function rollBaseDamage({ attacker, skill, weapon }) {
  if (skill?.damage) return rollDamage(skill.damage);
  if (weapon?.damage) return rollDamage(weapon.damage);
  if (attacker.damage) return rollDamage(attacker.damage);
  if (attacker.attackPower) return rollDamage(attacker.attackPower);
  return 1;
}

function applyElementalBonus(dmg, attacker, damageType) {
  if (!attacker.isPlayer) return dmg;
  if (!isMagic(damageType)) return dmg;
  if (damageType === 'fire'   && attacker.bonusFire)   dmg += attacker.bonusFire;
  if (damageType === 'ice'    && attacker.bonusIce)    dmg += attacker.bonusIce;
  if (damageType === 'shock'  && attacker.bonusShock)  dmg += attacker.bonusShock;
  if (damageType === 'poison' && attacker.bonusPoison) dmg += attacker.bonusPoison;
  return dmg;
}

function applyCrit(dmg, attacker, skill) {
  const damageType = skill?.damageType || attacker.damageType || 'blunt';
  const isMagicDmg = isMagic(damageType);
  let critChance = (attacker.critChance || 5) + (skill?.critBonus || 0);
  let critMult   = (attacker.critMultiplier || 50);
  if (isMagicDmg) {
    critChance += (attacker.elemCritChance || 0);
    critMult   += (attacker.elemCritDamage || 0);
  }
  const isCrit = Math.random() * 100 < critChance;
  if (isCrit) {
    dmg = Math.round(dmg * (1 + critMult / 100));
  }
  return { dmg, isCrit };
}

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

function tryDodge(target) {
  const chance = target.dodgeChance || 0;
  if (chance <= 0) return false;
  return Math.random() * 100 < chance;
}

function tryBlock(target, damageType) {
  if (!isPhysical(damageType)) return false;
  const chance = target.blockChance || 0;
  if (chance <= 0) return false;
  return Math.random() * 100 < chance;
}

function applyFirstHitReduction(dmg, target) {
  const pct = target.firstHitReductionPct || 0;
  if (pct <= 0) return dmg;
  if (target._firstHitConsumed) return dmg;
  target._firstHitConsumed = true;
  return Math.max(1, Math.round(dmg * (1 - pct / 100)));
}

export function computeDamage({ attacker, target, skill, weapon }) {
  const damageType =
    skill?.damageType ||
    weapon?.damageType ||
    attacker.damageType ||
    'blunt';

  let dmg = rollBaseDamage({ attacker, skill, weapon });
  dmg = applyElementalBonus(dmg, attacker, damageType);
  if (skill?.damageMult) dmg = Math.round(dmg * skill.damageMult);

  // Crit (avec elemCritChance/Damage si magic)
  const critResult = applyCrit(dmg, attacker, skill);
  dmg = critResult.dmg;

  // Headshot (proc au crit, ranged only)
  const headshotMult = applyHeadshotIfCrit(attacker, skill, critResult.isCrit);
  if (headshotMult !== 1) dmg = Math.round(dmg * headshotMult);

  // Multiplicateurs conditionnels offensifs
  const condMult = computeConditionalMultipliers(attacker, target, skill);
  if (condMult !== 1) dmg = Math.max(1, Math.round(dmg * condMult));

  // Défenses
  let dodged = false, parried = false, blocked = false;
  if (tryDodge(target)) {
    dmg = 0;
    dodged = true;
  } else if (tryParry(target, damageType)) {
    dmg = 0;
    parried = true;
  } else {
    tryActivateFortify(target);
    if (isPhysical(damageType)) {
      dmg = applyPhysicalDefense(dmg, attacker, target);
    } else {
      dmg = applyMagicDefense(dmg, target, damageType);
    }
    if (tryBlock(target, damageType)) {
      dmg = Math.max(1, Math.round(dmg * 0.5));
      blocked = true;
    }
    dmg = applyFirstHitReduction(dmg, target);
    const condRed = computeConditionalReduction(target);
    if (condRed !== 1) dmg = Math.max(1, Math.round(dmg * condRed));
  }

  return {
    dmg,
    isCrit: critResult.isCrit,
    isSpell: skill?.type === 'spell',
    damageType,
    dodged, parried, blocked,
  };
}
