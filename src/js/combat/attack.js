// src/js/combat/attack.js
// Résolution d'une attaque (joueur ou ennemi).
//
// Étapes étendues :
//   1) computeDamage → applique esquive/parry/armure/résistances/crit/bonus/blocage/first-hit-reduction/conditionnels
//   2) Inflige les dégâts à la cible (sauf si esquivé/parry)
//   3) Lifesteal (joueur uniquement)
//   4) Application du statut éventuel (skip si esquivé)
//   5) stunOnCrit
//   6) Triggers (paralyzed/electrocuted/sick/explosion)
//   7) Thorns mêlée + block thorns
//   8) Riposte (offhand classique + riposteChance)
//   9) Mark backstabbed (le 1er hit "consomme" le backstab)
//  10) DoubleStrike / Multishot / SpellEcho (anti-cascade)
//  11) On-kill : cdReduc, killReload, freeSpellOnKill
//  12) Mort si HP <= 0

import { computeDamage } from './damage.js';
import { applyStatus } from './status.js';
import { isPhysical } from './damage-types.js';
import { log } from '../ui/log.js';
import {
  applyThornsMelee,
  applyBlockThorns,
  tryRiposte,
  onActorKilled,
  shouldMultishot,
  shouldSpellEcho,
  shouldStunOnCrit,
  rollTriggers,
  isBackstabAttack,
  markBackstabbed,
} from './modifiers.js';
import { state } from '../core/state.js';

export function performAttack(attacker, target, skill, weapon) {
  if (target.isDead) return;

  // Track backstab AVANT le hit (sinon le 1er hit ne sera pas backstab)
  const wasBackstab = attacker.isPlayer && isBackstabAttack(attacker, target);

  // armorPen total
  const baseArmorPen = attacker.armorPen || 0;
  const skillArmorPen = skill?.bonusArmorPen || 0;
  const computeAttacker = { ...attacker, armorPen: baseArmorPen + skillArmorPen };

  const result = computeDamage({ attacker: computeAttacker, target, skill, weapon });
  const { dmg, isCrit, damageType, dodged, parried, blocked } = result;
  const skillRange = skill?.range || 1;

  // === LOG + APPLY DMG ===
  if (dodged) {
    log(`${target.name} esquive l'attaque de ${attacker.name} !`, 'dodge');
  } else if (parried) {
    log(`${target.name} pare l'attaque de ${attacker.name} !`, 'dodge');
  } else {
    target.hp -= dmg;
    const tags = [];
    if (isCrit)  tags.push('CRIT!');
    if (blocked) tags.push('bloqué');
    if (wasBackstab && attacker.backstabDamageMult) tags.push('dans le dos');
    const tagStr = tags.length ? ` (${tags.join(', ')})` : '';
    log(`${attacker.name} → ${target.name} : ${dmg} dégâts ${damageType}${tagStr}.`, 'damage');
  }

  // Mark backstab consumed (1er hit du combat)
  if (attacker.isPlayer && !dodged && !parried) {
    markBackstabbed(attacker, target);
    attacker._firstAttackDone = true;
  }

  // === LIFESTEAL ===
  if (!dodged && !parried && attacker.isPlayer && dmg > 0) {
    // lifesteal standard
    let lsPct = attacker.lifesteal || 0;
    // elemLifesteal : ajoute X% si attaque magique
    if (attacker.elemLifesteal && skill?.damageType && ['fire','ice','shock','poison','magic'].includes(skill.damageType)) {
      lsPct += attacker.elemLifesteal;
    }
    if (lsPct > 0) {
      const heal = Math.max(0, Math.round(dmg * lsPct / 100));
      if (heal > 0) {
        attacker.hp = Math.min(attacker.maxHp, attacker.hp + heal);
        if (heal >= 2) log(`${attacker.name} récupère ${heal} PV (vol de vie).`, 'heal');
      }
    }
  }

  // === STATUS APPLY ===
  if (!dodged && !parried && skill?.applyStatus) {
    const chance = skill.applyStatus.chance ?? 100;
    if (Math.random() * 100 < chance) {
      applyStatus(target, skill.applyStatus, attacker);
    }
  }

  // === STUN ON CRIT ===
  if (!dodged && !parried && shouldStunOnCrit(attacker, isCrit)) {
    applyStatus(target, { id: 'stunned', duration: 1, power: 0 }, attacker);
  }

  // === TRIGGERS (paralyzed / electrocuted / sick / explosion) ===
  if (!dodged && !parried && dmg > 0 && attacker.isPlayer) {
    const triggers = rollTriggers(attacker);
    for (const t of triggers) {
      if (t.type === 'status') {
        applyStatus(target, { id: t.id, duration: t.duration, power: 0 }, attacker);
      } else if (t.type === 'explosion') {
        // Dégâts d'explosion à tous les ennemis adjacents au target
        const explDmg = Math.max(3, Math.round(dmg * 0.3));
        for (const e of state.enemies || []) {
          if (e === target || e.isDead) continue;
          const dx = Math.abs(e.x - target.x);
          const dy = Math.abs(e.y - target.y);
          if (Math.max(dx, dy) === 1) {
            e.hp -= explDmg;
            log(`💥 Explosion : ${e.name} subit ${explDmg} dégâts.`, 'damage');
            if (e.hp <= 0) killActor(e, attacker);
          }
        }
      }
    }
  }

  // === THORNS / BLOCK THORNS (renvoie dmg à l'attaquant) ===
  if (!dodged && !parried) {
    let reflected = 0;
    reflected += applyThornsMelee(attacker, target, dmg, skillRange);
    reflected += applyBlockThorns(target, blocked);
    if (reflected > 0 && !attacker.isDead) {
      attacker.hp -= reflected;
      log(`${target.name} renvoie ${reflected} dégâts.`, 'damage');
      if (attacker.hp <= 0) killActor(attacker, target);
    }
  }

  // === RIPOSTE (offhand auto + riposteChance) ===
  if (!dodged && !parried && target.isPlayer && skillRange === 1
      && isPhysical(damageType) && !target.ripostedThisTurn) {
    const offhandFlat = target.equipment?.offhand?.passive?.riposte || 0;
    const procByChance = tryRiposte(target, damageType, skillRange);
    if (offhandFlat > 0 || procByChance) {
      target.ripostedThisTurn = true;
      const riposteDmg = Math.max(1, offhandFlat + Math.floor(Math.random() * 4) + (procByChance ? 3 : 0));
      attacker.hp -= riposteDmg;
      log(`${target.name} riposte pour ${riposteDmg} dégâts !`, 'damage');
      if (attacker.hp <= 0) killActor(attacker, target);
    }
  }

  // === MORT / ON-KILL ===
  if (target.hp <= 0) {
    killActor(target, attacker);
    return; // pas de double-strike ni multishot si cible morte
  }

  // === DOUBLE STRIKE (melee, joueur) ===
  if (
    attacker.isPlayer &&
    skill?.type === 'attack' &&
    !skill._isDoubleStrike && !skill._isMultishot && !skill._isCleaveHit &&
    (attacker.doubleStrikeChance || 0) > 0 &&
    Math.random() * 100 < attacker.doubleStrikeChance
  ) {
    log(`${attacker.name} frappe une seconde fois !`, 'info');
    const replay = { ...skill, _isDoubleStrike: true };
    performAttack(attacker, target, replay, weapon);
  }

  // === MULTISHOT (ranged) ===
  if (attacker.isPlayer && shouldMultishot(attacker, skill)) {
    log(`${attacker.name} tire un second projectile !`, 'info');
    const replay = { ...skill, _isMultishot: true };
    performAttack(attacker, target, replay, weapon);
  }

  // === SPELL ECHO ===
  if (attacker.isPlayer && shouldSpellEcho(attacker, skill)) {
    log(`✦ Echo du sort !`, 'info');
    const replay = { ...skill, _isEcho: true };
    performAttack(attacker, target, replay, weapon);
  }
}

export function killActor(actor, killer = null) {
  if (actor.isDead) return;
  actor.isDead = true;
  log(`💀 ${actor.name} est vaincu !`, 'combat-end');
  // Proc les effets on-kill du killer
  if (killer) {
    onActorKilled(killer, actor);
  }
}

/**
 * À appeler au début de chaque combat (initCombat) pour reset les flags par-combat.
 */
export function resetPerCombatFlags(actor) {
  if (!actor) return;
  delete actor._firstHitConsumed;
  delete actor._firstAttackDone;
  delete actor._backstabbedTargets;
  delete actor._fortifyActivated;
  delete actor._fortifyActive;
  delete actor._fortifyAmount;
  delete actor._fortifyUntilTurn;
  delete actor._freeSpellAvailable;
  delete actor.ripostedThisTurn;
}
