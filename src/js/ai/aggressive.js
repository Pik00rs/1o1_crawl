// src/js/ai/aggressive.js
// IA mêlée : avance vers le joueur, attaque si à portée.

import { state } from '../core/state.js';
import { distance } from '../grid/grid.js';
import { getReachableCells } from '../grid/pathfinding.js';
import { performAttack } from '../combat/attack.js';
import { triggerEnemyAttackFx } from '../combat/attack-fx-bridge.js';
import { DATA } from '../data/loader.js';
import { endTurn, checkCombatEnd } from '../core/turn.js';
import { log } from '../ui/log.js';

// =============================================================================
// FX HELPER: déclenche l'animation visuelle de l'attaque bestiaire
// (visuel découplé du gameplay, n'impacte pas les dégâts).
// =============================================================================
function fireAttackFx(enemy, target){
  if(!enemy.enemyType) return;
  // Récupère la screen pos via callback installé par game.html (window.__getScreenPos__)
  // Si pas dispo (test, autre contexte) on skip silencieusement.
  const getPos = typeof window !== 'undefined' && window.__getScreenPos__;
  if(typeof getPos !== 'function') return;
  const attackerPos = getPos(enemy.x, enemy.y);
  const targetPos = getPos(target.x, target.y);
  if(!attackerPos || !targetPos) return;
  const enemyData = DATA.enemies?.[enemy.enemyType] || { id: enemy.enemyType, role: 'mob',
    damageType: enemy.damageType, attackPower: enemy.attackPower || [1, 1],
    range: enemy.range || 1, ai: enemy.ai || 'aggressive' };
  // Ajoute l'id si absent
  if(!enemyData.id) enemyData.id = enemy.enemyType;
  const dist = distance(enemy, target);
  triggerEnemyAttackFx(enemy.enemyType, enemyData, attackerPos, targetPos, dist, enemy.range || 1);
}

export function runAggressive(enemy) {
  const target = state.player;
  if (target.isDead) return endTurn();

  let dist = distance(enemy, target);

  // Attaque si à portée
  if (dist <= enemy.range) {
    fireAttackFx(enemy, target);
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
      fireAttackFx(enemy, target);
      performAttack(enemy, target, { type: 'attack', range: enemy.range, damageType: enemy.damageType }, null);
      if (checkCombatEnd()) return;
    }
  } else {
    log(`${enemy.name} reste sur place.`, 'info');
  }

  setTimeout(() => endTurn(), 600);
}
