// src/js/combat/attack.js
// Résolution d'une attaque (joueur ou ennemi).
//
// Étapes :
//   1) computeDamage → applique armure / résistances / crit / bonus
//   2) Inflige les dégâts à la cible
//   3) Lifesteal (si attaquant joueur)
//   4) Application du statut éventuel
//   5) Riposte si la cible a un offhand spécial
//   6) Mort si HP <= 0

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
  const { dmg, isCrit, isSpell, damageType } = result;
  target.hp -= dmg;

  log(
    `${attacker.name} → ${target.name} : ${dmg} dégâts ${damageType}${isCrit ? ' (CRIT!)' : ''}.`,
    'damage'
  );

  // Lifesteal du joueur
  if (attacker.isPlayer && attacker.lifesteal && dmg > 0) {
    const heal = Math.max(0, Math.round(dmg * attacker.lifesteal / 100));
    if (heal > 0) {
      attacker.hp = Math.min(attacker.maxHp, attacker.hp + heal);
      if (heal >= 2) log(`${attacker.name} récupère ${heal} PV (vol de vie).`, 'heal');
    }
  }

  // Application du statut
  if (skill?.applyStatus) {
    const chance = skill.applyStatus.chance ?? 100;
    if (Math.random() * 100 < chance) {
      applyStatus(target, skill.applyStatus);
    }
  }

  // Riposte (passif bouclier "guardShield")
  // Conditions : cible joueur + offhand riposte + attaque CaC physique + pas déjà riposté
  if (target.isPlayer
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

  if (target.hp <= 0) killActor(target);
}

export function killActor(actor) {
  actor.isDead = true;
  log(`💀 ${actor.name} est vaincu !`, 'combat-end');
}
