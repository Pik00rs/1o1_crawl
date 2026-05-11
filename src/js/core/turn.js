// src/js/core/turn.js
// Gestion du tour par tour : initiative, début/fin de tour, fin de combat.
// Étendu avec :
//   - hpRegen au début de tour (joueur uniquement)
//   - reset des flags par-tour (_freeMovementUsedThisTurn, _movedThisTurn, _cellsMovedThisTurn)
//   - expiration du buff fortifyPct

import { state } from './state.js';
import { pushCombatEvent } from './state.js';
import { tickDoTStatuses, tickStatusDurations, isSkippedByStatus } from '../combat/status.js';
import { runEnemyAI } from '../ai/ai.js';
import { render } from '../ui/render.js';
import { showCombatEnd } from '../ui/combat-end.js';
import { killActor } from '../combat/attack.js';
import { resetPerTurnFlags } from '../combat/actions.js';
import { log } from '../ui/log.js';

export function computeInitiative() {
  state.initiative = [...state.actors]
    .filter(a => !a.isDead)
    .sort((a, b) => {
      // firstStrikeChance : roll pour donner +50 init en début de combat
      let initA = a.initiative || 0;
      let initB = b.initiative || 0;
      if (a.isPlayer && a.firstStrikeChance && Math.random() * 100 < a.firstStrikeChance) {
        initA += 50;
      }
      if (b.isPlayer && b.firstStrikeChance && Math.random() * 100 < b.firstStrikeChance) {
        initB += 50;
      }
      return initB - initA;
    });
}

export function getCurrentActor() {
  return state.initiative[state.currentActorIdx];
}

export function startTurn(actor) {
  // Reset flags par-tour
  resetPerTurnFlags(actor);

  // Reset AP (bonusAp est inclus naturellement)
  actor.ap = (actor.maxAp || 0) + (actor.bonusAp || 0);

  // === HP REGEN (joueur uniquement) ===
  if (actor.isPlayer && actor.hpRegen && actor.hp > 0 && actor.hp < actor.maxHp) {
    const heal = actor.hpRegen;
    const before = actor.hp;
    actor.hp = Math.min(actor.maxHp, actor.hp + heal);
    const actual = actor.hp - before;
    if (actual > 0) {
      log(`${actor.name} régénère ${actual} PV.`, 'heal');
      pushCombatEvent({ type: 'heal', x: actor.x, y: actor.y, value: actual });
    }
  }

  // === EXPIRATION FORTIFY ===
  if (actor._fortifyActive && state.turn > (actor._fortifyUntilTurn || 0)) {
    actor._fortifyActive = false;
    log(`Le buff de fortification de ${actor.name} se dissipe.`, 'info');
  }

  // DoT (burning, bleeding, poisoned, electrocuted)
  tickDoTStatuses(actor);
  if (actor.hp <= 0) { killActor(actor); return advanceTurn(); }

  // Cooldowns
  if (actor.cooldowns) {
    for (const k in actor.cooldowns) if (actor.cooldowns[k] > 0) actor.cooldowns[k]--;
  }
  if (actor.healCooldown > 0) actor.healCooldown--;

  // Durée des statuts
  tickStatusDurations(actor);

  // Skip si CC (stunned, frozen, paralyzed)
  if (isSkippedByStatus(actor)) {
    log(`${actor.name} ne peut pas agir (CC).`, 'status');
    setTimeout(() => endTurn(), 600);
    return;
  }

  log(`--- Tour de ${actor.name} ---`, 'info');

  if (actor.isPlayer) {
    state.selectedSkill = null;
    state.targetingMode = null;
    render();
  } else {
    setTimeout(() => runEnemyAI(actor), 600);
  }
}

export function endTurn() {
  // Tick fire tiles
  for (const [k, turns] of state.fireTiles.entries()) {
    state.fireTiles.set(k, turns - 1);
    if (state.fireTiles.get(k) <= 0) state.fireTiles.delete(k);
  }
  advanceTurn();
}

export function advanceTurn() {
  if (checkCombatEnd()) return;
  state.currentActorIdx = (state.currentActorIdx + 1) % state.initiative.length;
  if (state.currentActorIdx === 0) state.turn++;
  const next = getCurrentActor();
  if (!next) return;
  if (next.isDead) return advanceTurn();
  startTurn(next);
}

export function checkCombatEnd() {
  if (state.player.isDead) {
    state.combatOver = true;
    showCombatEnd(false);
    return true;
  }
  if (state.enemies.every(e => e.isDead)) {
    state.combatOver = true;
    showCombatEnd(true);
    return true;
  }
  return false;
}
