// src/js/render/iso-projection.js
// Conversion entre coordonnées de grille et coordonnées écran.
// Supporte maintenant : caméra (pan) + zoom.

export const TILE_W = 60;
export const TILE_H = 30;

/**
 * Convertit grille → écran avec une "vue" optionnelle.
 *
 * @param {number} gx - case en x
 * @param {number} gy - case en y
 * @param {number} gz - élévation (optionnel)
 * @param {object} viewport - { width, height } du canvas
 * @param {object} view - { camX, camY, zoom } optionnel (default 0,0,1)
 */
export function isoToScreen(gx, gy, gz, viewport, view){
  const camX = view?.camX || 0;
  const camY = view?.camY || 0;
  const zoom = view?.zoom || 1;
  const tw = TILE_W * zoom;
  const th = TILE_H * zoom;
  const ox = viewport.width / 2 - tw * 0.5 + camX;
  const oy = viewport.height / 2 - th * 1.5 + camY;
  return {
    x: ox + (gx - gy) * tw / 2,
    y: oy + (gx + gy) * th / 2 - (gz || 0) * zoom
  };
}

/**
 * Renvoie la tuile (gx, gy) sous une coordonnée écran (sx, sy).
 */
export function screenToIso(sx, sy, gridW, gridH, viewport, getElev, view){
  const zoom = view?.zoom || 1;
  const tw = TILE_W * zoom;
  const th = TILE_H * zoom;
  let best = null, bestDist = Infinity;
  for(let x = 0; x < gridW; x++){
    for(let y = 0; y < gridH; y++){
      const gz = getElev ? getElev(x, y) : 0;
      const sp = isoToScreen(x, y, gz, viewport, view);
      const dx = sx - sp.x;
      const dy = sy - sp.y;
      if(Math.abs(dx)/(tw/2) + Math.abs(dy)/(th/2) <= 1){
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
 * Renvoie les 4 coins du losange d'une tuile à l'écran (au zoom courant).
 */
export function tileCorners(sx, sy, zoom = 1){
  const tw = TILE_W * zoom;
  const th = TILE_H * zoom;
  return {
    top:   { x: sx, y: sy - th/2 },
    right: { x: sx + tw/2, y: sy },
    bot:   { x: sx, y: sy + th/2 },
    left:  { x: sx - tw/2, y: sy },
  };
}
