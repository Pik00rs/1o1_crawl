// src/js/render/biomes/svg-loader.js
// Charge la tile-library JSON (SVG inline) et rasterise chaque tile en
// HTMLImageElement utilisable par ctx.drawImage().
//
// Output: chaque biome est un objet compatible avec l'ancienne API
//   biome.config = { id, name, base, accent, ..., tileTypes, tileWeights, props }
//   biome.tiles[name] = (ctx, cx, cy, tile, time) => void  // dessine le SVG raster
//   biome.props[name] = (ctx, cx, cy, time, seed) => void  // dessine le SVG raster
//
// Cela permet à iso-engine.js (renderFrame) de dessiner les nouveaux visuels
// SVG sans aucune modif côté moteur.

import { TILE_W, TILE_H } from '../iso-projection.js';

// Taille du raster (px). On rastérise en 2x pour la qualité, et on draw
// en taille naturelle. Ajustable selon la qualité voulue vs perf.
const RASTER_W = 240;
const RASTER_H = 200;

// Fichiers JSON par biome. Le path est relatif à la racine du projet.
const BIOME_FILES = {
  cryo:    'tile-library/biomes/cryo.json',
  inferno: 'tile-library/biomes/inferno.json',
  toxic:   'tile-library/biomes/toxic.json',
  crimson: 'tile-library/biomes/crimson.json',
  voidnet: 'tile-library/biomes/voidnet.json',
};

// Cache global : biomeId -> biomeObj une fois chargé
const BIOME_CACHE = {};

/**
 * Construit un SVG complet à partir d'un objet tile + biome.
 *
 * viewBox = "-60 -60 120 100" :
 *   x : -60 (gauche du losange) à +60 (droite)
 *   y : -60 (top, pour blockers hauts comme P9 LAVA SPIRE à y=-50) à +40 (sous le losange dont la pointe basse est à y=38)
 *
 * Le centre du losange (point (0, 8) en coords SVG) tombe à :
 *   ratio_x dans le viewBox = (0 - (-60))/120 = 0.5  → centre horizontal du raster
 *   ratio_y dans le viewBox = (8 - (-60))/100 = 0.68 → 68% de la hauteur depuis le haut
 */
function buildTileSVG(biome, tile){
  const bgTopFill = tile.bgTopFill
    ? `<polygon points="0,-22 60,8 0,8 -60,8" fill="${tile.bgTopFill}"/>`
    : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${RASTER_W}" height="${RASTER_H}" viewBox="-60 -60 120 100">
    <defs>${biome.defs}</defs>
    <polygon points="0,8 60,8 0,38 -60,8" fill="#000" opacity="0.5" transform="translate(2,2)"/>
    <polygon points="0,-22 60,8 0,38 -60,8" fill="${tile.bgFill}"/>
    ${bgTopFill}
    <polygon points="0,-22 60,8 0,38 -60,8" fill="none" stroke="${biome.config.strokeColor}" stroke-width="0.5"/>
    ${tile.svg}
  </svg>`;
}

/**
 * Rastérise un SVG string en HTMLImageElement (Promise).
 */
function rasterizeSVG(svgStr){
  return new Promise((resolve, reject) => {
    const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      // Garde l'URL un peu pour permettre au browser de cache. On revoke après usage.
      // Note: on ne revoke pas immédiatement, sinon Firefox plante.
      resolve(img);
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(new Error('SVG rasterize failed'));
    };
    img.src = url;
  });
}

/**
 * Convertit le format JSON library (tile.id, tile.svg, etc.) vers l'API
 * attendue par iso-engine.js (biome.tiles[typeName] = fn(ctx, cx, cy, tile, t)).
 *
 * Stratégie :
 *  - tileTypes = liste des IDs de tiles "base" + "furnished" (walkable)
 *  - tileWeights = uniforme pour l'instant (on peut tuner après)
 *  - props = liste des IDs de tiles "blocking" (non-walkable)
 *  - tiles[id] = fonction qui drawImage du raster correspondant
 */
async function loadBiome(biomeId){
  if(BIOME_CACHE[biomeId]) return BIOME_CACHE[biomeId];

  const file = BIOME_FILES[biomeId];
  if(!file) throw new Error('Unknown biome: ' + biomeId);

  const res = await fetch(file);
  if(!res.ok) throw new Error('Failed to load ' + file + ': ' + res.status);
  const json = await res.json();

  // Rasterise toutes les tiles (base + furnished + blocking)
  const allTiles = [...json.base, ...json.furnished, ...json.blocking];
  const rasterMap = {};

  // Parallel rasterize
  await Promise.all(allTiles.map(async (t) => {
    try {
      const svgStr = buildTileSVG(json, t);
      const img = await rasterizeSVG(svgStr);
      rasterMap[t.id] = img;
    } catch(e){
      console.warn('[svg-loader] failed to rasterize', t.id, e);
    }
  }));

  // Build tiles map (base + furnished, walkables) and props map (blocking)
  const walkableTiles = [...json.base, ...json.furnished];
  const blockingTiles = json.blocking;

  const tiles = {};
  const tileTypes = [];
  const tileWeights = [];

  // Bases : poids 0.5 chacune
  for(const t of json.base){
    tiles[t.id] = makeRendererFn(rasterMap[t.id], false);
    tileTypes.push(t.id);
    tileWeights.push(0.10);
  }
  // Furnished : poids 0.4 chacune (un peu moins fréquentes)
  for(const t of json.furnished){
    tiles[t.id] = makeRendererFn(rasterMap[t.id], false);
    tileTypes.push(t.id);
    tileWeights.push(0.0333);
  }
  // Note: les poids sont en absolu, pickWeighted normalise.

  const props = {};
  const propsList = [];
  for(const t of json.blocking){
    props[t.id] = makeRendererFn(rasterMap[t.id], true);
    propsList.push(t.id);
  }

  // Construit l'objet biome compatible avec l'ancien format
  const biomeObj = {
    config: {
      id: json.name,
      name: json.config.name,
      displayName: json.config.displayName,
      description: json.config.displayName,

      // ambiance (placeholders raisonnables pour drawSky / vignette)
      skyTop: pickSkyTop(biomeId),
      skyBot: pickSkyBot(biomeId),
      base: json.config.bgColor || '#1a1a24',
      baseLight: lighten(json.config.bgColor, 0.3),
      baseDark: darken(json.config.bgColor, 0.3),
      accent: json.config.accent,
      glow: json.config.accent,
      ember: json.config.accent,
      edge: '#04040a',

      tileTypes,
      tileWeights,
      props: propsList,
    },
    tiles,
    props,
    _rasterMap: rasterMap,
    _json: json,
  };

  BIOME_CACHE[biomeId] = biomeObj;
  return biomeObj;
}

/**
 * Crée une fonction de rendu compatible avec iso-engine.
 * Pour les tiles : signature (ctx, cx, cy, tile, time)
 * Pour les props : signature (ctx, cx, cy, time, seed) — note: cx,cy sont 0,0 dans iso-engine, le translate est déjà fait
 *
 * Le raster est dessiné centré sur (cx, cy) avec offset Y pour aligner
 * le losange (le SVG a son origine au centre du losange en haut).
 */
/**
 * Crée une fonction de rendu compatible avec iso-engine.
 * Pour les tiles : signature (ctx, cx, cy, tile, time)
 * Pour les props : signature (ctx, cx, cy, time, seed) — note: cx,cy sont 0,0 dans iso-engine, le translate est déjà fait
 *
 * iso-engine applique déjà ctx.translate(sx, sy) puis ctx.scale(zoom, zoom).
 * Donc on dessine en TAILLE NATURELLE (sans multiplier par zoom).
 *
 * Géométrie :
 *   viewBox SVG = -60 -60 120 100
 *   Losange SVG : pointes (0,-22) (60,8) (0,38) (-60,8) → 120 SVG-units large pour 60 haut
 *   Mais en iso, TILE_W = 60, TILE_H = 30 (la moitié) → le losange réel fait 60×30
 *   Donc le SVG est exactement 2× la taille du losange iso
 *   → drawW = 60 (= TILE_W), drawH = 50 (= 100 * 60/120)
 *
 *   Centre du losange SVG (0, 8) → ratio_y = (8-(-60))/100 = 0.68
 *   → drawY = cy - 0.68 * drawH = cy - 34
 *   → drawX = cx - 30
 */
function makeRendererFn(img, isProp){
  return function(ctx, cx, cy, tile, time){
    if(!img || !img.complete || !img.naturalWidth) return;
    const drawW = 60;          // = TILE_W
    const drawH = 50;          // = 100 * (TILE_W / 120)
    const drawX = cx - drawW/2;
    const drawY = cy - 0.68 * drawH;  // = cy - 34
    ctx.drawImage(img, drawX, drawY, drawW, drawH);
  };
}

// ---------- helpers ambiance ----------

function pickSkyTop(biome){
  const m = {
    cryo:    '#0e2333',
    inferno: '#2a0e08',
    toxic:   '#0e1a08',
    crimson: '#2a0e08',
    voidnet: '#0a0420',
  };
  return m[biome] || '#0e0e14';
}
function pickSkyBot(biome){
  const m = {
    cryo:    '#02080d',
    inferno: '#080202',
    toxic:   '#040804',
    crimson: '#100404',
    voidnet: '#02010a',
  };
  return m[biome] || '#02020a';
}
function lighten(hex, amt){
  if(!hex) return '#444';
  const c = hex.replace('#','');
  const r = Math.min(255, parseInt(c.substr(0,2),16) + 60);
  const g = Math.min(255, parseInt(c.substr(2,2),16) + 60);
  const b = Math.min(255, parseInt(c.substr(4,2),16) + 60);
  return '#' + [r,g,b].map(v => v.toString(16).padStart(2,'0')).join('');
}
function darken(hex, amt){
  if(!hex) return '#111';
  const c = hex.replace('#','');
  const r = Math.max(0, parseInt(c.substr(0,2),16) - 30);
  const g = Math.max(0, parseInt(c.substr(2,2),16) - 30);
  const b = Math.max(0, parseInt(c.substr(4,2),16) - 30);
  return '#' + [r,g,b].map(v => v.toString(16).padStart(2,'0')).join('');
}

// ---------- public API ----------

const PRELOAD_PROMISES = {};

/**
 * Charge tous les biomes en parallèle. Promise resolvable.
 */
export async function preloadAllBiomes(){
  const ids = Object.keys(BIOME_FILES);
  await Promise.all(ids.map(id => {
    if(!PRELOAD_PROMISES[id]) PRELOAD_PROMISES[id] = loadBiome(id);
    return PRELOAD_PROMISES[id];
  }));
  return BIOME_CACHE;
}

/**
 * Récupère un biome (synchrone si déjà chargé, sinon trigger un load).
 * Retourne un objet biome plus ou moins prêt — les tiles peuvent être
 * vides (rasters pas encore chargés) au début.
 */
export function getBiome(id){
  if(BIOME_CACHE[id]) return BIOME_CACHE[id];
  // Trigger async load + return un placeholder vide (le moteur le redemandera)
  if(!PRELOAD_PROMISES[id]) PRELOAD_PROMISES[id] = loadBiome(id);
  // Retourne un stub qui se rendra dès que le vrai biome sera prêt
  return getStubBiome(id);
}

let _stubCache = {};
function getStubBiome(id){
  if(_stubCache[id]) return _stubCache[id];
  _stubCache[id] = {
    config: {
      id, name: id.toUpperCase(),
      base: '#1a1a24', baseLight: '#2a2a34', baseDark: '#0a0a14',
      accent: '#aaa', glow: '#aaa', ember: '#aaa', edge: '#000',
      skyTop: '#0e0e14', skyBot: '#02020a',
      tileTypes: ['_stub'],
      tileWeights: [1],
      props: [],
    },
    tiles: { _stub: () => {} },
    props: {},
    _stub: true,
  };
  return _stubCache[id];
}

export function listBiomeIds(){
  return Object.keys(BIOME_FILES);
}

export function listBiomeConfigs(){
  return listBiomeIds().map(id => {
    const b = BIOME_CACHE[id];
    return b ? b.config : { id, name: id.toUpperCase() };
  });
}

/**
 * Récupère le mapping ID -> Image (raster) d'un biome (utile pour debug).
 */
export function getBiomeRasters(id){
  return BIOME_CACHE[id]?._rasterMap || null;
}
