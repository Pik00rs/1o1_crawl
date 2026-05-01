// src/js/render/iso-projection.js
// Conversion entre coordonnées de grille et coordonnées écran.
// La projection iso utilisée : losange 2:1 (TILE_W = 2 × TILE_H).

export const TILE_W = 60;
export const TILE_H = 30;

/**
 * Convertit des coordonnées de grille en coordonnées écran.
 *
 * @param {number} gx - case en x
 * @param {number} gy - case en y
 * @param {number} gz - élévation (optionnel, soustrait à y)
 * @param {object} viewport - { width, height } du canvas
 * @returns { x, y } en pixels écran
 */
export function isoToScreen(gx, gy, gz, viewport){
  const ox = viewport.width / 2 - TILE_W * 0.5;
  const oy = viewport.height / 2 - TILE_H * 1.5;
  return {
    x: ox + (gx - gy) * TILE_W / 2,
    y: oy + (gx + gy) * TILE_H / 2 - (gz || 0)
  };
}

/**
 * Renvoie la tuile (gx, gy) sous une coordonnée écran (sx, sy).
 * Brute-force search : on teste toutes les tuiles dans la grille et on prend
 * celle dont le centre est le plus proche, parmi celles dont le pixel est
 * dans le losange.
 *
 * Renvoie null si aucune tuile n'est sous le curseur.
 */
export function screenToIso(sx, sy, gridW, gridH, viewport, getElev){
  let best = null, bestDist = Infinity;
  for(let x = 0; x < gridW; x++){
    for(let y = 0; y < gridH; y++){
      const gz = getElev ? getElev(x, y) : 0;
      const sp = isoToScreen(x, y, gz, viewport);
      const dx = sx - sp.x;
      const dy = sy - sp.y;
      // Test : dans le losange ?
      if(Math.abs(dx)/(TILE_W/2) + Math.abs(dy)/(TILE_H/2) <= 1){
        const d = dx*dx + dy*dy;
        if(d < bestDist){
          bestDist = d;
          best = { gx: x, gy: y };
        }
      }
    }
  }
  return best;
}

/**
 * Renvoie les 4 coins du losange d'une tuile à l'écran.
 * Pratique pour drawTileBase et autres.
 */
export function tileCorners(sx, sy){
  return {
    top:   { x: sx, y: sy - TILE_H/2 },
    right: { x: sx + TILE_W/2, y: sy },
    bot:   { x: sx, y: sy + TILE_H/2 },
    left:  { x: sx - TILE_W/2, y: sy },
  };
}
