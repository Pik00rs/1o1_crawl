// src/js/combat/modifiers.js
//
// Helpers transverses pour les affixes "conditionnels" et "trigger".
// Tout ce qui n'est ni une stat plate (ex: critChance) ni un bonus simple
// (ex: bonusFire flat) atterrit ici.
//
// Catégories couvertes :
//   - Multiplicateurs conditionnels offensifs (computeConditionalMultipliers)
//   - Multiplicateurs conditionnels défensifs (computeConditionalReduction)
//   - On-kill (onActorKilled)
//   - Reflects et thorns (applyThorns, applyBlockThorns)
//   - Status bonuses (getEffectiveBleedPower, getEffectiveStatusDuration, rollStatusResist)
//   - Backstab (isBackstabAttack) — défini comme "1ère attaque sur cet ennemi"
//   - Headshot (rollHeadshot) — proc au crit pour les armes ranged

import { isPhysical, isMagic } from './damage-types.js';
import { state } from '../core/state.js';
import { log } from '../ui/log.js';

// =============================================================================
// MULTIPLICATEURS OFFENSIFS CONDITIONNELS
// =============================================================================
/**
 * Calcule le multiplicateur de dégâts total selon le contexte du hit.
 * À appliquer APRÈS le crit, AVANT les défenses du target.
 * @returns {number} multiplicateur (1.0 = pas de bonus)
 */
export function computeConditionalMultipliers(attacker, target, skill) {
  let mult = 1;
  const skillType = skill?.type;
  const skillRange = skill?.range || 1;
  const isRanged = skillRange >= 3;
  const isSpell = skillType === 'spell';

  // === MULTIPLIERS BASÉS SUR L'ATTAQUANT ===
  // Full HP
  if (attacker.fullHpDamageMult && attacker.hp >= attacker.maxHp) {
    mult *= (1 + attacker.fullHpDamageMult / 100);
  }
  // Missing HP (proportionnel au % HP manquant)
  if (attacker.missingHpDamagePct) {
    const missingRatio = 1 - (attacker.hp / Math.max(1, attacker.maxHp));
    mult *= (1 + (attacker.missingHpDamagePct * missingRatio) / 100);
  }
  // 1ère attaque du combat
  if (attacker.firstStrikeDamageMult && !attacker._firstAttackDone) {
    mult *= (1 + attacker.firstStrikeDamageMult / 100);
  }
  // Après mouvement (ce tour)
  if (attacker.afterMoveDamageMult && attacker._movedThisTurn) {
    mult *= (1 + attacker.afterMoveDamageMult / 100);
  }
  // Sans bouger (ce tour)
  if (attacker.noMoveDamageMult && !attacker._movedThisTurn) {
    mult *= (1 + attacker.noMoveDamageMult / 100);
  }
  // Long mouvement (>= 3 cases ce tour)
  if (attacker.longMoveDamageMult && (attacker._cellsMovedThisTurn || 0) >= 3) {
    mult *= (1 + attacker.longMoveDamageMult / 100);
  }

  // === MULTIPLIERS BASÉS SUR LE TARGET ===
  // Execute (target PV bas <= 30%)
  if (attacker.executeDamageMult && (target.hp / Math.max(1, target.maxHp)) <= 0.3) {
    mult *= (1 + attacker.executeDamageMult / 100);
  }
  // Bonus dmg si target armuré
  if (attacker.armorDamageMult && (target.armor || 0) > 0) {
    mult *= (1 + attacker.armorDamageMult / 100);
  }
  // Bonus dmg si target affligé (a au moins 1 status)
  if (attacker.afflictedDamageBonus && (target.statuses?.length || 0) > 0) {
    mult *= (1 + attacker.afflictedDamageBonus / 100);
  }
  // Bonus dmg par stack bleed sur target
  if (attacker.perBleedStackDamage) {
    const bleedStacks = (target.statuses || []).filter(s => s.id === 'bleeding').length;
    if (bleedStacks > 0) {
      mult *= (1 + (attacker.perBleedStackDamage * bleedStacks) / 100);
    }
  }
  // Backstab : 1ère attaque sur cet ennemi
  if (attacker.backstabDamageMult && isBackstabAttack(attacker, target)) {
    mult *= (1 + attacker.backstabDamageMult / 100);
  }

  // === MULTIPLIERS BASÉS SUR LE SKILL ===
  // Pierce damage : si damageType=pierce
  if (attacker.pierceDamagePct && skill?.damageType === 'pierce') {
    mult *= (1 + attacker.pierceDamagePct / 100);
  }
  // Max range : si attaque à >= 80% de la portée du skill (ranged uniquement)
  if (attacker.maxRangeDamage && isRanged) {
    const dist = Math.max(Math.abs(attacker.x - target.x), Math.abs(attacker.y - target.y));
    if (dist >= skillRange * 0.8) {
      mult *= (1 + attacker.maxRangeDamage / 100);
    }
  }

  return mult;
}

// =============================================================================
// HEADSHOT (proc au crit, ranged uniquement)
// =============================================================================
/**
 * Si l'attaquant a headshotDamagePct, applique un bonus de dégâts au crit
 * sur une attaque ranged. À appeler APRÈS le crit a été rollé.
 * @returns multiplicateur supplémentaire (1.0 si pas de headshot)
 */
export function applyHeadshotIfCrit(attacker, skill, isCrit) {
  if (!isCrit || !attacker.headshotDamagePct) return 1;
  const range = skill?.range || 1;
  if (range < 3) return 1; // ranged only
  log(`💥 HEADSHOT !`, 'damage');
  return (1 + attacker.headshotDamagePct / 100);
}

// =============================================================================
// RÉDUCTIONS DÉFENSIVES CONDITIONNELLES
// =============================================================================
/**
 * Réduit les dégâts reçus selon le contexte du target.
 * À appliquer APRÈS armor/resist, APRÈS firstHitReduction.
 * @returns multiplicateur (1.0 = pas de réduction)
 */
export function computeConditionalReduction(target) {
  let mult = 1;
  // PV bas (<= 30%) : moins de dégâts reçus
  if (target.lowHpReductionPct && (target.hp / Math.max(1, target.maxHp)) <= 0.3) {
    mult *= (1 - target.lowHpReductionPct / 100);
  }
  // Fortify : buff temporaire après 1er hit reçu
  if (target._fortifyActive && state.turn <= (target._fortifyUntilTurn || 0)) {
    mult *= (1 - (target._fortifyAmount || 0) / 100);
  }
  return Math.max(0.1, mult); // garde-fou : ne réduit jamais à 0
}

/**
 * Active le buff fortifyPct au 1er hit reçu (à appeler depuis performAttack).
 */
export function tryActivateFortify(target) {
  if (!target.fortifyPct || target._fortifyActivated) return;
  target._fortifyActivated = true;
  target._fortifyActive = true;
  target._fortifyAmount = target.fortifyPct;
  target._fortifyUntilTurn = (state.turn || 0) + 2; // 2 tours
  log(`${target.name} se fortifie (+${target.fortifyPct}% défense, 2 tours).`, 'info');
}

// =============================================================================
// THORNS / REFLECT
// =============================================================================
/**
 * Reflect mêlée : renvoie X% du dmg reçu si attaque CaC.
 * À appeler APRÈS que le dmg ait été infligé.
 * @returns dégâts à renvoyer à l'attaquant (0 = rien)
 */
export function applyThornsMelee(attacker, target, dmg, skillRange) {
  if (!target.thornsMeleePct || skillRange !== 1 || dmg <= 0) return 0;
  return Math.max(1, Math.round(dmg * target.thornsMeleePct / 100));
}

/**
 * Reflect on block : renvoie un dmg flat si un block a procé.
 */
export function applyBlockThorns(target, blocked) {
  if (!blocked || !target.blockThornsDamage) return 0;
  return target.blockThornsDamage + Math.floor(Math.random() * 3);
}

// =============================================================================
// PARRY / RIPOSTE
// =============================================================================
/**
 * Parry : pareil que dodge mais physique only. Procé via parryChance.
 */
export function tryParry(target, damageType) {
  if (!isPhysical(damageType)) return false;
  const chance = target.parryChance || 0;
  if (chance <= 0) return false;
  return Math.random() * 100 < chance;
}

/**
 * Riposte par chance % (en plus de la riposte automatique de l'offhand).
 * Le moteur original a déjà une riposte si offhand.passive.riposte existe ;
 * ici on ajoute une riposte par % chance via riposteChance, et on reflète flat.
 */
export function tryRiposte(target, damageType, skillRange) {
  if (!target.isPlayer || skillRange !== 1 || !isPhysical(damageType)) return false;
  if (target.ripostedThisTurn) return false;
  const chance = target.riposteChance || 0;
  if (chance <= 0) return false;
  return Math.random() * 100 < chance;
}

// =============================================================================
// STATUS BONUSES
// =============================================================================
/**
 * Ajuste la durée d'un statut élémentaire selon elemStatusDuration.
 */
export function getEffectiveStatusDuration(attacker, statusId, baseDuration) {
  const elemBonus = attacker?.elemStatusDuration || 0;
  if (!elemBonus) return baseDuration;
  if (['burning', 'poisoned', 'chilled', 'shocked'].includes(statusId)) {
    return Math.round(baseDuration * (1 + elemBonus / 100));
  }
  return baseDuration;
}

/**
 * Ajuste le power d'un bleed selon bleedDamage de l'attaquant.
 */
export function getEffectiveBleedPower(attacker, basePower) {
  return basePower + (attacker?.bleedDamage || 0);
}

/**
 * Test si target résiste à un status (bleedResist pour le saignement).
 * @returns true si target résiste (skip apply), false sinon.
 */
export function rollStatusResist(target, statusId) {
  if (statusId === 'bleeding' && target.bleedResist) {
    if (Math.random() * 100 < target.bleedResist) {
      log(`${target.name} résiste au saignement.`, 'status');
      return true;
    }
  }
  return false;
}

// =============================================================================
// ON-KILL
// =============================================================================
/**
 * À appeler dans killActor() pour proc les effets on-kill du killer.
 * Note : killActor n'a pas le killer en arg actuellement, donc on stocke
 * le dernier attaquant via state._lastAttacker.
 */
export function onActorKilled(killer, victim) {
  if (!killer?.isPlayer || !victim) return;

  // cdReducOnKill : réduit tous les cooldowns
  if (killer.cdReducOnKill && killer.cooldowns) {
    let reduced = false;
    for (const skillId in killer.cooldowns) {
      if (killer.cooldowns[skillId] > 0) {
        killer.cooldowns[skillId] = Math.max(0, killer.cooldowns[skillId] - killer.cdReducOnKill);
        reduced = true;
      }
    }
    if (reduced) log(`Cooldowns -${killer.cdReducOnKill}t (kill).`, 'info');
  }

  // freeSpellOnKillChance : marque le prochain sort gratuit
  if (killer.freeSpellOnKillChance && !killer._freeSpellAvailable) {
    if (Math.random() * 100 < killer.freeSpellOnKillChance) {
      killer._freeSpellAvailable = true;
      log(`✨ Sort gratuit chargé !`, 'info');
    }
  }

  // killReloadChance : reset les CD des attaques d'arme
  if (killer.killReloadChance && Math.random() * 100 < killer.killReloadChance) {
    const mh = killer.equipment?.mainhand;
    if (mh && killer.cooldowns) {
      delete killer.cooldowns[`${mh.id}_light`];
      delete killer.cooldowns[`${mh.id}_heavy`];
      log(`⟲ Arme rechargée !`, 'info');
    }
  }
}

// =============================================================================
// MULTISHOT / CLEAVE
// =============================================================================
/**
 * Multishot : % chance de tirer une 2e fois sur la même cible (ranged).
 */
export function shouldMultishot(attacker, skill) {
  if (!attacker.multishotChance) return false;
  const range = skill?.range || 1;
  if (range < 3) return false; // ranged only
  if (skill?._isMultishot) return false; // anti-cascade
  return Math.random() * 100 < attacker.multishotChance;
}

/**
 * Cleave : pour une attaque mêlée, retourne les ennemis adjacents à toucher.
 * À utiliser dans actions.js après le hit principal.
 */
export function getCleaveTargets(attacker, mainTarget, skill) {
  if (!attacker.cleavePct) return [];
  const skillRange = skill?.range || 1;
  if (skillRange !== 1) return []; // melee only
  if (skill?._isCleaveHit) return []; // anti-cascade
  // Cherche les ennemis adjacents à mainTarget (mais != mainTarget et != attacker)
  const adj = [];
  for (const e of state.enemies || []) {
    if (e === mainTarget || e === attacker || e.isDead) continue;
    const dx = Math.abs(e.x - mainTarget.x);
    const dy = Math.abs(e.y - mainTarget.y);
    if (Math.max(dx, dy) === 1) adj.push(e);
  }
  return adj;
}

// =============================================================================
// BACKSTAB
// =============================================================================
/**
 * Définit "backstab" comme : la 1ère attaque sur cet ennemi durant le combat.
 * On track via _backstabbedTargets : Set<enemy.id>.
 */
export function isBackstabAttack(attacker, target) {
  if (!attacker._backstabbedTargets) attacker._backstabbedTargets = new Set();
  const id = target.id || target.name;
  return !attacker._backstabbedTargets.has(id);
}

export function markBackstabbed(attacker, target) {
  if (!attacker._backstabbedTargets) attacker._backstabbedTargets = new Set();
  const id = target.id || target.name;
  attacker._backstabbedTargets.add(id);
}

// =============================================================================
// STUN ON CRIT
// =============================================================================
/**
 * Si l'attaquant a stunOnCritChance et qu'on a un crit, applique stun.
 * Retourne true si proc.
 */
export function shouldStunOnCrit(attacker, isCrit) {
  if (!isCrit || !attacker.stunOnCritChance) return false;
  return Math.random() * 100 < attacker.stunOnCritChance;
}

// =============================================================================
// TRIGGERS (sur hit, sur kill)
// =============================================================================
/**
 * Procs les triggers de l'attaquant sur un hit.
 * @returns liste des status à appliquer au target (ou actions secondaires).
 */
export function rollTriggers(attacker) {
  const triggers = [];
  // Les triggerXxx sont stockés comme chances % (1-1 dans le catalog mais souvent 1)
  // → on roll selon une chance fixe de 15% pour chaque trigger possédé
  // (les valeurs catalog 1-1 sont des "présent/absent", la chance d'occurrence est constante)
  const TRIGGER_CHANCE = 15;
  if (attacker.triggerExplosion && Math.random() * 100 < TRIGGER_CHANCE) {
    triggers.push({ type: 'explosion' });
  }
  if (attacker.triggerParalyzed && Math.random() * 100 < TRIGGER_CHANCE) {
    triggers.push({ type: 'status', id: 'paralyzed', duration: 2 });
  }
  if (attacker.triggerElectrocuted && Math.random() * 100 < TRIGGER_CHANCE) {
    triggers.push({ type: 'status', id: 'electrocuted', duration: 3 });
  }
  if (attacker.triggerSick && Math.random() * 100 < TRIGGER_CHANCE) {
    triggers.push({ type: 'status', id: 'sick', duration: 3 });
  }
  return triggers;
}

// =============================================================================
// FREE OPENER / FREE SHOT
// =============================================================================
/**
 * Si freeOpenerChance proc et que c'est la 1ère action du combat, l'AP cost = 0.
 * @returns true si l'action doit être gratuite
 */
export function shouldUseFreeOpener(attacker) {
  if (attacker._firstAttackDone) return false;
  if (!attacker.freeOpenerChance) return false;
  return Math.random() * 100 < attacker.freeOpenerChance;
}

/**
 * Pour ranged uniquement : % chance que le tir soit gratuit (AP cost = 0).
 */
export function shouldUseFreeShot(attacker, skill) {
  const range = skill?.range || 1;
  if (range < 3) return false;
  if (skill?.type !== 'attack') return false;
  if (!attacker.freeShotChance) return false;
  return Math.random() * 100 < attacker.freeShotChance;
}

// =============================================================================
// SPELL ECHO
// =============================================================================
/**
 * Spell echo : % chance que le sort se relance gratuitement (1 fois max).
 */
export function shouldSpellEcho(attacker, skill) {
  if (skill?.type !== 'spell') return false;
  if (skill?._isEcho) return false; // anti-cascade
  if (!attacker.spellEchoChance) return false;
  return Math.random() * 100 < attacker.spellEchoChance;
}
