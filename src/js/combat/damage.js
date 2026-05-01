// src/js/combat/damage.js
// Calcul des dégâts. Réécrit pour gérer :
//   - Dégâts physiques avec armure en diminishing returns (cap 75%)
//   - Dégâts magiques avec résistances cumulatives (magicResist + résist élémentaire)
//   - Crit basé sur les stats de l'attaquant
//   - Bonus de dégâts élémentaires si l'attaquant en a (additif au roll)
//   - Pénétration d'armure
//
// Source de vérité des types : damage-types.js

import { isPhysical, isMagic, getResistanceFields } from './damage-types.js';

// =============================================================================
// HELPERS
// =============================================================================

export function rollDamage(range) {
  if (!range || !Array.isArray(range)) return 0;
  return range[0] + Math.floor(Math.random() * (range[1] - range[0] + 1));
}

// =============================================================================
// CALCUL DES DÉGÂTS BRUTS
// =============================================================================

function rollBaseDamage({ attacker, skill, weapon }) {
  // 1) Skill avec damage explicite (ex: Trait de Givre, Boule de Feu)
  if (skill?.damage) return rollDamage(skill.damage);

  // 2) Sinon, dégâts de l'arme
  if (weapon?.damage) return rollDamage(weapon.damage);

  // 3) Sinon, dégâts du joueur (poing nu) ou de l'ennemi (attackPower)
  if (attacker.damage) return rollDamage(attacker.damage);
  if (attacker.attackPower) return rollDamage(attacker.attackPower);

  return 1; // dernier recours
}

// =============================================================================
// BONUS ÉLÉMENTAIRES DE L'ATTAQUANT
// =============================================================================
// Ces bonus s'ajoutent au roll de base si le type matche.
// Ex: épée + bonusFire 5 ne donne RIEN (épée = slash). Mais bague de feu sur
// un sort de feu : +5.
// Pour les armes physiques, on n'ajoute pas de bonus magiques (par souci
// de simplicité — le splash élémentaire revient si on veut plus tard).

function applyElementalBonus(dmg, attacker, damageType) {
  if (!attacker.isPlayer) return dmg; // les ennemis n'ont pas ces bonus
  if (!isMagic(damageType)) return dmg; // physique : pas de bonus élémentaire

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
// Physique : armor → diminishing returns
//   armorEff = max(0, target.armor - attacker.armorPen)
//   reduction = min(0.75, armorEff / (armorEff + 50))
// Magique : résistances cumulatives, multiplicatives
//   final = dmg * ∏ (1 - resist_i / 100)

function applyPhysicalDefense(dmg, attacker, target) {
  const armorPen = attacker.armorPen || 0;
  // armorPiercing : valeur 0..1, ignore X% de l'armure (pour boss spéciaux)
  const armorPiercingFactor = attacker.armorPiercing ? (1 - attacker.armorPiercing) : 1;
  let armorEff = Math.max(0, (target.armor || 0) - armorPen);
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
// FONCTION PRINCIPALE
// =============================================================================

export function computeDamage({ attacker, target, skill, weapon }) {
  // 1) Type de dégâts résolu
  // Priorité : skill.damageType > weapon.damageType > attacker.damageType > blunt
  const damageType =
    skill?.damageType ||
    weapon?.damageType ||
    attacker.damageType ||
    'blunt';

  // 2) Roll de base
  let dmg = rollBaseDamage({ attacker, skill, weapon });

  // 3) Bonus élémentaire (si applicable)
  dmg = applyElementalBonus(dmg, attacker, damageType);

  // 4) Multiplicateur du skill (ex: heavy attack ×1.5)
  if (skill?.damageMult) dmg = Math.round(dmg * skill.damageMult);

  // 5) Crit
  const critResult = applyCrit(dmg, attacker, skill);
  dmg = critResult.dmg;

  // 6) Défenses selon catégorie
  if (isPhysical(damageType)) {
    dmg = applyPhysicalDefense(dmg, attacker, target);
  } else {
    dmg = applyMagicDefense(dmg, target, damageType);
  }

  // 7) Lifesteal sera géré dans attack.js après mort/survie de la cible

  return {
    dmg,
    isCrit: critResult.isCrit,
    isSpell: skill?.type === 'spell',
    damageType,
  };
}
