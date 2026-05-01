// src/js/render/iso-projection.js
// Conversion entre coordonnées de grille et coordonnées écran.
// Click iso précis via INVERSE MATHÉMATIQUE PURE (pas de boucle, pas de test).

export const TILE_W = 60;
export const TILE_H = 30;

/**
 * Grille → écran avec vue (camX, camY, zoom).
 *
 *   sx = ox + (gx - gy) * tw/2
 *   sy = oy + (gx + gy) * th/2 - gz * zoom
 *
 * où ox, oy sont les offsets pour centrer.
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
 * Écran → grille : VRAIE INVERSE MATHÉMATIQUE.
 *
 * Étant donné les équations directes :
 *   sx - ox = (gx - gy) * (tw/2)        [1]
 *   sy - oy = (gx + gy) * (th/2)        [2]   (en ignorant gz pour l'instant)
 *
 * On résout pour gx, gy :
 *   (sx - ox) / (tw/2) = gx - gy        [1']
 *   (sy - oy) / (th/2) = gx + gy        [2']
 * Donc :
 *   gx = ((sx - ox)/(tw/2) + (sy - oy)/(th/2)) / 2
 *   gy = ((sy - oy)/(th/2) - (sx - ox)/(tw/2)) / 2
 *
 * Puis on prend floor() pour avoir l'index entier.
 *
 * Cette méthode est EXACTE par construction : pour tout point (sx, sy)
 * dans le losange d'une tuile (gx, gy) à élévation 0, l'inverse retourne
 * exactement (gx, gy). Pas d'approximation, pas de boucle, pas de tiebreaker.
 */
export function screenToIso(sx, sy, gridW, gridH, viewport, getElev, view){
  const camX = view?.camX || 0;
  const camY = view?.camY || 0;
  const zoom = view?.zoom || 1;
  const tw = TILE_W * zoom;
  const th = TILE_H * zoom;
  const ox = viewport.width / 2 - tw * 0.5 + camX;
  const oy = viewport.height / 2 - th * 1.5 + camY;

  // Inverse mathématique pure. On ignore l'élévation dans un premier temps :
  // elle ne décale qu'en Y, donc on compense ensuite.
  // Pour l'élévation : sy_real = sy + gz * zoom, donc on ajoute gz à sy avant inverse.
  // Comme gz dépend de la tuile finale, on procède en 2 passes :
  //   passe 1 : inverse SANS élévation -> donne une tuile candidate
  //   passe 2 : ré-inverse avec gz de la tuile candidate -> donne la tuile correcte

  function inverseAt(syAdjusted){
    const dx = (sx - ox) / (tw / 2);
    const dy = (syAdjusted - oy) / (th / 2);
    // ROUND (pas FLOOR) parce que les coords flottantes pointent vers
    // le centre des tuiles : un point dans le losange de la tuile (gx, gy)
    // donne des coords flottantes proches de (gx, gy), donc round() est correct.
    // Avec floor(), un point juste à droite du centre tomberait dans la tuile voisine.
    return {
      gx: Math.round((dx + dy) / 2),
      gy: Math.round((dy - dx) / 2),
    };
  }

  // Passe 1 : sans élévation
  let { gx, gy } = inverseAt(sy);

  // Si dans la grille, on raffine avec l'élévation de cette tuile
  if(getElev && gx >= 0 && gy >= 0 && gx < gridW && gy < gridH){
    const gz = getElev(gx, gy);
    if(gz !== 0){
      // Recalcule avec compensation d'élévation
      const r2 = inverseAt(sy + gz * zoom);
      gx = r2.gx;
      gy = r2.gy;
    }
  }

  // Out of bounds → null
  if(gx < 0 || gy < 0 || gx >= gridW || gy >= gridH) return null;

  return { gx, gy };
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
