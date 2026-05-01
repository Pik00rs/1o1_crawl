// src/js/grid/grid.js
// Helpers de manipulation de la grille (8 directions, Chebyshev).

import { state } from '../core/state.js';

export function key(x, y) { return `${x},${y}`; }
export function inBounds(x, y) {
  return x >= 0 && x < state.gridWidth && y >= 0 && y < state.gridHeight;
}
export function isWall(x, y) { return state.walls.has(key(x, y)); }

export function getActorAt(x, y) {
  return state.actors.find(a => !a.isDead && a.x === x && a.y === y);
}

export function distance(a, b) {
  return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
}

export function isPassable(x, y, ignoreActor = null) {
  if (!inBounds(x, y) || isWall(x, y)) return false;
  const a = getActorAt(x, y);
  return !(a && a !== ignoreActor);
}

export function getCellsInAOE(cx, cy, radius) {
  const cells = [];
  for (let dx = -radius; dx <= radius; dx++) {
    for (let dy = -radius; dy <= radius; dy++) {
      const nx = cx + dx, ny = cy + dy;
      if (inBounds(nx, ny) && !isWall(nx, ny)) cells.push({ x: nx, y: ny });
    }
  }
  return cells;
}
