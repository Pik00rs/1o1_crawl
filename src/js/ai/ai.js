// src/js/ai/ai.js
// Routeur IA : sélectionne le comportement selon le type d'ennemi.

import { runAggressive } from './aggressive.js';
import { runCaster } from './caster.js';
import { endTurn } from '../core/turn.js';

export function runEnemyAI(enemy) {
  if (enemy.isDead) return endTurn();
  switch (enemy.ai) {
    case 'caster': return runCaster(enemy);
    case 'aggressive':
    default: return runAggressive(enemy);
  }
}
