// src/js/entities/enemy.js
// Création d'ennemis depuis les data.

import { DATA } from '../data/loader.js';

export function createEnemy(id, typeId, x, y) {
  const t = DATA.enemies[typeId];
  if (!t) throw new Error(`Unknown enemy type: ${typeId}`);
  return {
    id, typeId,
    name: t.name,
    icon: t.icon,
    isPlayer: false,
    x, y,
    hp: t.hp, maxHp: t.hp,
    armor: t.armor,
    attackPower: t.attackPower,
    damageType: t.damageType,
    range: t.range,
    moveSpeed: t.moveSpeed,
    initiative: t.initiative + Math.floor(Math.random() * 5),
    ai: t.ai,
    hasHeal: t.hasHeal,
    statuses: [],
    healCooldown: 0,
    isDead: false,
  };
}
