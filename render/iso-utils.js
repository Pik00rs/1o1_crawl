// src/js/render/iso-utils.js
// Helpers partagés par tous les modules de rendu.
// Aucune dépendance, aucun état global.

// =============================================================================
// COULEURS
// =============================================================================

export function hexToRgb(h){
  h = h.replace('#','');
  if(h.length === 3) h = h.split('').map(c => c+c).join('');
  return {
    r: parseInt(h.slice(0,2), 16),
    g: parseInt(h.slice(2,4), 16),
    b: parseInt(h.slice(4,6), 16)
  };
}

export function hexToRgba(h, a){
  if(h && h.startsWith('rgb(')) return h.replace('rgb(', 'rgba(').replace(')', `,${a})`);
  const c = hexToRgb(h);
  return `rgba(${c.r},${c.g},${c.b},${a})`;
}

/**
 * Éclaircit (amt > 0) ou assombrit (amt < 0) une couleur hex.
 * amt typique : entre -0.5 et +0.5.
 */
export function shade(hex, amt){
  const c = hexToRgb(hex);
  const r = Math.max(0, Math.min(255, c.r + amt * 100));
  const g = Math.max(0, Math.min(255, c.g + amt * 100));
  const b = Math.max(0, Math.min(255, c.b + amt * 100));
  return `rgb(${r|0},${g|0},${b|0})`;
}

// =============================================================================
// PRNG DÉTERMINISTE
// =============================================================================

/**
 * Pseudo-random déterministe à partir d'une seed et d'une clé.
 * Retourne une valeur dans [0, 1).
 * Utilisé pour les positions/tailles de specks/cracks dans une tuile,
 * pour qu'ils ne bougent pas entre les frames.
 */
export function prand(seed, k){
  return Math.abs(Math.sin(seed * 73.13 + k * 19.7)) % 1;
}

/**
 * Générateur de RNG seedé (pour la génération de map).
 */
export function rng(seed){
  let s = seed | 0;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

/**
 * Choisit un index parmi une liste de poids selon un random [0, 1).
 */
export function pickWeighted(weights, r){
  let sum = 0;
  for(const w of weights) sum += w;
  let v = r * sum;
  for(let i = 0; i < weights.length; i++){
    v -= weights[i];
    if(v <= 0) return i;
  }
  return weights.length - 1;
}

// =============================================================================
// CLIPPING
// =============================================================================

/**
 * Clip le contexte au losange iso d'une tuile, pour que les détails ne
 * débordent pas sur les tuiles voisines.
 *
 * Usage :
 *   clipToDiamond(ctx, cx, cy, TILE_W, TILE_H);
 *   ... draw stuff ...
 *   ctx.restore();
 */
export function clipToDiamond(ctx, cx, cy, tileW, tileH){
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(cx, cy - tileH/2);
  ctx.lineTo(cx + tileW/2, cy);
  ctx.lineTo(cx, cy + tileH/2);
  ctx.lineTo(cx - tileW/2, cy);
  ctx.closePath();
  ctx.clip();
}

// =============================================================================
// EASING
// =============================================================================

export function easeInOutQuad(t){
  return t < 0.5 ? 2*t*t : 1 - Math.pow(-2*t + 2, 2) / 2;
}
