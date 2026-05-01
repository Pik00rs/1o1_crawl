// src/js/grid/pathfinding.js
// BFS pour le mouvement (8 directions, coût 1 par case).

import { isPassable, key } from './grid.js';

export function getReachableCells(actor, maxAP) {
  const reachable = new Map();
  reachable.set(key(actor.x, actor.y), 0);
  const queue = [{ x: actor.x, y: actor.y, cost: 0 }];

  while (queue.length > 0) {
    const cur = queue.shift();
    if (cur.cost >= maxAP) continue;

    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (dx === 0 && dy === 0) continue;
        const nx = cur.x + dx, ny = cur.y + dy;
        const k = key(nx, ny);
        if (!isPassable(nx, ny, actor)) continue;
        const newCost = cur.cost + 1;
        if (!reachable.has(k) || reachable.get(k) > newCost) {
          if (newCost <= maxAP) {
            reachable.set(k, newCost);
            queue.push({ x: nx, y: ny, cost: newCost });
          }
        }
      }
    }
  }
  reachable.delete(key(actor.x, actor.y));
  return reachable;
}
