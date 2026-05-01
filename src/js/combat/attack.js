// src/js/combat/attack.js
// Résolution d'une attaque.

import { computeDamage } from './damage.js';
import { applyStatus } from './status.js';
import { log } from '../ui/log.js';

export function performAttack(attacker, target, skill, weapon) {
  if (target.isDead) return;
  const { dmg, isCrit, isSpell } = computeDamage({ attacker, target, skill, weapon });
  target.hp -= dmg;

  log(`${attacker.name} frappe ${target.name} pour ${dmg} dégâts${isCrit ? ' (CRIT!)' : ''}.`, 'damage');

  if (skill?.applyStatus) {
    const chance = skill.applyStatus.chance || 100;
    if (Math.random() * 100 < chance) {
      applyStatus(target, skill.applyStatus);
    }
  }

  // Riposte (passif bouclier)
  if (target.isPlayer && target.equipment?.offhand?.id === 'guardShield'
      && skill?.range === 1 && !isSpell && !target.ripostedThisTurn) {
    target.ripostedThisTurn = true;
    const riposteDmg = Math.max(1, Math.floor(Math.random() * 4 + 4 - attacker.armor / 2));
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
