// src/js/combat/attack.js
// Résolution d'une attaque (joueur ou ennemi).
//
// Étapes :
//   1) computeDamage → applique esquive / armure / résistances / crit / bonus / blocage / first-hit-reduction
//   2) Inflige les dégâts à la cible (sauf si esquivé)
//   3) Lifesteal (si attaquant joueur)
//   4) Application du statut éventuel (skip si esquivé)
//   5) Riposte si la cible a un offhand spécial
//   6) DoubleStrike : % chance de retaper immédiatement (joueur uniquement, attaque arme)
//   7) Mort si HP <= 0

import { computeDamage } from './damage.js';
import { applyStatus } from './status.js';
import { isPhysical } from './damage-types.js';
import { log } from '../ui/log.js';

export function performAttack(attacker, target, skill, weapon) {
  if (target.isDead) return;

  // Pour le calcul, on stocke l'armorPen total (pen de base + bonus du skill)
  const baseArmorPen = attacker.armorPen || 0;
  const skillArmorPen = skill?.bonusArmorPen || 0;
  const computeAttacker = { ...attacker, armorPen: baseArmorPen + skillArmorPen };

  const result = computeDamage({ attacker: computeAttacker, target, skill, weapon });
  const { dmg, isCrit, isSpell, damageType, dodged, blocked } = result;

  if (dodged) {
    log(`${target.name} esquive l'attaque de ${attacker.name} !`, 'dodge');
  } else {
    target.hp -= dmg;
    const tags = [];
    if (isCrit)   tags.push('CRIT!');
    if (blocked)  tags.push('bloqué');
    const tagStr = tags.length ? ` (${tags.join(', ')})` : '';
    log(
      `${attacker.name} → ${target.name} : ${dmg} dégâts ${damageType}${tagStr}.`,
      'damage'
    );
  }

  // Lifesteal du joueur — seulement si dmg infligé
  if (!dodged && attacker.isPlayer && attacker.lifesteal && dmg > 0) {
    const heal = Math.max(0, Math.round(dmg * attacker.lifesteal / 100));
    if (heal > 0) {
      attacker.hp = Math.min(attacker.maxHp, attacker.hp + heal);
      if (heal >= 2) log(`${attacker.name} récupère ${heal} PV (vol de vie).`, 'heal');
    }
  }

  // Application du statut — skip si esquivé
  if (!dodged && skill?.applyStatus) {
    const chance = skill.applyStatus.chance ?? 100;
    if (Math.random() * 100 < chance) {
      applyStatus(target, skill.applyStatus);
    }
  }

  // Riposte (passif bouclier "guardShield") — skip si esquivé
  if (!dodged && target.isPlayer
      && target.equipment?.offhand?.passive?.riposte
      && skill?.range === 1
      && isPhysical(damageType)
      && !target.ripostedThisTurn) {
    target.ripostedThisTurn = true;
    const riposteDmg = Math.max(1, target.equipment.offhand.passive.riposte
      + Math.floor(Math.random() * 4));
    attacker.hp -= riposteDmg;
    log(`${target.name} riposte pour ${riposteDmg} dégâts !`, 'damage');
    if (attacker.hp <= 0) killActor(attacker);
  }

  if (target.hp <= 0) {
    killActor(target);
    return; // pas de double-strike si la cible meurt
  }

  // === DOUBLE STRIKE ===
  // Joueur uniquement, sur attaque physique (skill.type === 'attack'), pas un sort,
  // et pas en récursion (flag _isDoubleStrike pour éviter une cascade infinie).
  if (
    attacker.isPlayer &&
    skill?.type === 'attack' &&
    !skill._isDoubleStrike &&
    (attacker.doubleStrikeChance || 0) > 0 &&
    Math.random() * 100 < attacker.doubleStrikeChance
  ) {
    log(`${attacker.name} frappe une seconde fois !`, 'info');
    // On clone le skill avec un flag pour éviter de re-proc en chaîne
    const replay = { ...skill, _isDoubleStrike: true };
    performAttack(attacker, target, replay, weapon);
  }
}

export function killActor(actor) {
  actor.isDead = true;
  log(`💀 ${actor.name} est vaincu !`, 'combat-end');
}

/**
 * À appeler au début de chaque combat (initCombat) pour reset les flags par-combat
 * sur le joueur (et les ennemis si besoin).
 */
export function resetPerCombatFlags(actor) {
  if (!actor) return;
  delete actor._firstHitConsumed;
  delete actor.ripostedThisTurn;
}
