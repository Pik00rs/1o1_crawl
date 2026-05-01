// src/js/render/iso-projection.js
// Conversion entre coordonnées de grille et coordonnées écran.
// Supporte caméra (pan) + zoom + détection iso précise.

export const TILE_W = 60;
export const TILE_H = 30;

/**
 * Grille → écran avec vue (camX, camY, zoom).
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
 * Écran → grille : vrai inverse de la projection isométrique.
 *
 * Mathématiquement :
 *   sx = ox + (gx - gy) * tw/2
 *   sy = oy + (gx + gy) * th/2
 * Donc :
 *   gx = ((sx - ox) / (tw/2) + (sy - oy) / (th/2)) / 2
 *   gy = ((sy - oy) / (th/2) - (sx - ox) / (tw/2)) / 2
 *
 * On calcule les coordonnées flottantes pour trouver une cellule de base,
 * puis on teste les 9 cellules autour avec un VRAI test point-in-diamond
 * (la formule |dx|/halfW + |dy|/halfH <= 1 est mathématiquement EXACTE
 * pour un losange aligné). On choisit la tuile la plus "devant" (depth max)
 * en cas de chevauchement dû à l'élévation.
 */
export function screenToIso(sx, sy, gridW, gridH, viewport, getElev, view){
  const camX = view?.camX || 0;
  const camY = view?.camY || 0;
  const zoom = view?.zoom || 1;
  const tw = TILE_W * zoom;
  const th = TILE_H * zoom;
  const ox = viewport.width / 2 - tw * 0.5 + camX;
  const oy = viewport.height / 2 - th * 1.5 + camY;

  // Inverse iso (en ignorant d'abord l'élévation)
  const dx = (sx - ox) / (tw / 2);
  const dy = (sy - oy) / (th / 2);
  const fgx = (dx + dy) / 2;
  const fgy = (dy - dx) / 2;

  const baseX = Math.floor(fgx);
  const baseY = Math.floor(fgy);

  let best = null;
  let bestDepth = -Infinity;

  // Test des 9 cellules autour pour gérer élévation et bords
  for(let oy2 = -1; oy2 <= 1; oy2++){
    for(let ox2 = -1; ox2 <= 1; ox2++){
      const gx = baseX + ox2;
      const gy = baseY + oy2;
      if(gx < 0 || gy < 0 || gx >= gridW || gy >= gridH) continue;

      const gz = getElev ? getElev(gx, gy) : 0;
      const sp = isoToScreen(gx, gy, gz, viewport, view);

      const ddx = Math.abs(sx - sp.x);
      const ddy = Math.abs(sy - sp.y);
      // Test exact point-in-diamond
      const inside = (ddx / (tw / 2)) + (ddy / (th / 2)) <= 1;

      if(inside){
        // La tuile la plus en avant (plus grand gx+gy) est dessinée par-dessus
        const depth = gx + gy;
        if(depth > bestDepth){
          bestDepth = depth;
          best = { gx, gy };
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
