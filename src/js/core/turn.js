// src/js/core/turn.js
// Gestion du tour par tour : initiative, début/fin de tour, fin de combat.

import { state } from './state.js';
import { tickDoTStatuses, tickStatusDurations, isSkippedByStatus } from '../combat/status.js';
import { runEnemyAI } from '../ai/ai.js';
import { render } from '../ui/render.js';
import { showCombatEnd } from '../ui/combat-end.js';
import { killActor } from '../combat/attack.js';
import { log } from '../ui/log.js';

export function computeInitiative() {
  state.initiative = [...state.actors]
    .filter(a => !a.isDead)
    .sort((a, b) => b.initiative - a.initiative);
}

export function getCurrentActor() {
  return state.initiative[state.currentActorIdx];
}

export function startTurn(actor) {
  // Reset AP
  actor.ap = (actor.maxAp || 0) + (actor.bonusAp || 0);
  actor.ripostedThisTurn = false;

  // DoT
  tickDoTStatuses(actor);
  if (actor.hp <= 0) { killActor(actor); return advanceTurn(); }

  // Cooldowns
  if (actor.cooldowns) {
    for (const k in actor.cooldowns) if (actor.cooldowns[k] > 0) actor.cooldowns[k]--;
  }
  if (actor.healCooldown > 0) actor.healCooldown--;

  // Durée des statuts
  tickStatusDurations(actor);

  // Skip si CC
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
