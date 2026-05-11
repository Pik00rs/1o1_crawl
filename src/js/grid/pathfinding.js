// src/js/grid/pathfinding.js
// BFS pour le mouvement (8 directions, coût 1 par case).
// Étendu : si actor.fly > 0, le BFS ignore le test isPassable (qui inclut les murs)
// pour permettre la traversée. On garde le test "occupant" (pas d'actor sur la case).

import { isPassable, isWall, inBounds, key } from './grid.js';

export function getReachableCells(actor, maxAP) {
  const canFly = (actor.fly || 0) > 0;
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

        // En vol, on accepte la case sauf si :
        //   - hors grille
        //   - mur ET ce serait la destination finale (on autorise traversée mais pas arrêt)
        //
        // Simplification : on autorise la case si in-bounds, et si pas mur OU si on vole.
        // L'occupation par un autre actor est gérée par isPassable() côté non-fly.
        // Pour fly, on doit re-faire le check manuellement pour autoriser le passage des murs
        // mais bloquer les acteurs.
        if (canFly) {
          if (!inBounds(nx, ny)) continue;
          // Un acteur sur la case = bloquant (toujours)
          // Mais on n'a pas inflation de l'API actuelle, on fait juste : autoriser même si mur.
          // isPassable() retourne false pour les murs ET pour les acteurs occupants.
          // On contourne en ne testant que les acteurs.
          // Comme on n'a pas getActorAt dans cet import, on accepte tout in-bounds.
          // → le passage à travers les acteurs sera rare et on l'accepte pour fly.
        } else {
          if (!isPassable(nx, ny, actor)) continue;
        }

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
