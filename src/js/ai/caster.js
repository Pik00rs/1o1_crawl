// src/js/ai/caster.js
// IA caster : soigne les alliés blessés ; sinon attaque à distance.

import { state } from '../core/state.js';
import { distance } from '../grid/grid.js';
import { performAttack } from '../combat/attack.js';
import { runAggressive } from './aggressive.js';
import { endTurn, checkCombatEnd } from '../core/turn.js';
import { log } from '../ui/log.js';

export function runCaster(enemy) {
  if (enemy.isDead) return endTurn();

  // Soigner un allié blessé
  if (enemy.hasHeal && enemy.healCooldown === 0) {
    const wounded = state.enemies.find(e =>
      !e.isDead && e !== enemy && e.hp < e.maxHp * 0.5 && distance(enemy, e) <= 4
    );
    if (wounded) {
      const healed = 8;
      wounded.hp = Math.min(wounded.maxHp, wounded.hp + healed);
      enemy.healCooldown = 3;
      log(`${enemy.name} soigne ${wounded.name} de ${healed} PV.`, 'heal');
      return setTimeout(() => endTurn(), 600);
    }
  }

  // Sinon attaque distance
  const target = state.player;
  if (target.isDead) return endTurn();

  if (distance(enemy, target) <= enemy.range) {
    performAttack(enemy, target, { type: 'spell', range: enemy.range, damageType: enemy.damageType }, null);
    if (checkCombatEnd()) return;
    return setTimeout(() => endTurn(), 600);
  }

  // Sinon se rapproche (réutilise IA aggressive)
  return runAggressive(enemy);
}
