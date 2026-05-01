// src/js/ai/aggressive.js
// IA mêlée : avance vers le joueur, attaque si à portée.

import { state } from '../core/state.js';
import { distance } from '../grid/grid.js';
import { getReachableCells } from '../grid/pathfinding.js';
import { performAttack } from '../combat/attack.js';
import { endTurn, checkCombatEnd } from '../core/turn.js';
import { log } from '../ui/log.js';

export function runAggressive(enemy) {
  const target = state.player;
  if (target.isDead) return endTurn();

  let dist = distance(enemy, target);

  // Attaque si à portée
  if (dist <= enemy.range) {
    performAttack(enemy, target, { type: 'attack', range: enemy.range, damageType: enemy.damageType }, null);
    if (checkCombatEnd()) return;
    return setTimeout(() => endTurn(), 600);
  }

  // Sinon avance
  const reachable = getReachableCells(enemy, enemy.moveSpeed);
  let bestCell = null, bestDist = dist;
  for (const [k] of reachable.entries()) {
    const [x, y] = k.split(',').map(Number);
    const d = Math.max(Math.abs(x - target.x), Math.abs(y - target.y));
    if (d < bestDist) { bestDist = d; bestCell = { x, y }; }
  }

  if (bestCell) {
    enemy.x = bestCell.x;
    enemy.y = bestCell.y;
    log(`${enemy.name} avance.`, 'info');
    if (distance(enemy, target) <= enemy.range) {
      performAttack(enemy, target, { type: 'attack', range: enemy.range, damageType: enemy.damageType }, null);
      if (checkCombatEnd()) return;
    }
  } else {
    log(`${enemy.name} reste sur place.`, 'info');
  }

  setTimeout(() => endTurn(), 600);
}
