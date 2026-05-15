// src/js/ai/caster.js
// IA caster : soigne les alliés blessés ; sinon attaque à distance.

import { state } from '../core/state.js';
import { distance } from '../grid/grid.js';
import { performAttack } from '../combat/attack.js';
import { triggerEnemyAttackFx } from '../combat/attack-fx-bridge.js';
import { DATA } from '../data/loader.js';
import { runAggressive } from './aggressive.js';
import { endTurn, checkCombatEnd } from '../core/turn.js';
import { log } from '../ui/log.js';

function fireAttackFx(enemy, target){
  if(!enemy.enemyType) return;
  const getPos = typeof window !== 'undefined' && window.__getScreenPos__;
  if(typeof getPos !== 'function') return;
  const attackerPos = getPos(enemy.x, enemy.y);
  const targetPos = getPos(target.x, target.y);
  if(!attackerPos || !targetPos) return;
  const enemyData = DATA.enemies?.[enemy.enemyType] || { id: enemy.enemyType, role: 'mob',
    damageType: enemy.damageType, attackPower: enemy.attackPower || [1, 1],
    range: enemy.range || 1, ai: enemy.ai || 'caster' };
  if(!enemyData.id) enemyData.id = enemy.enemyType;
  const dist = distance(enemy, target);
  triggerEnemyAttackFx(enemy.enemyType, enemyData, attackerPos, targetPos, dist, enemy.range || 1);
}

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
    fireAttackFx(enemy, target);
    performAttack(enemy, target, { type: 'spell', range: enemy.range, damageType: enemy.damageType }, null);
    if (checkCombatEnd()) return;
    return setTimeout(() => endTurn(), 600);
  }

  // Sinon se rapproche (réutilise IA aggressive)
  return runAggressive(enemy);
}
