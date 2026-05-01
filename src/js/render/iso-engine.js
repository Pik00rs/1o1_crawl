// src/js/render/iso-engine.js
// Moteur de rendu iso 2.5D. Orchestre :
//   - le ciel et l'ambiance
//   - le rendu des tuiles dans l'ordre z (back to front)
//   - le rendu des props et entités, triés ensemble par profondeur
//   - les particules
//   - la vignette finale
//
// Le moteur ne connaît pas le state du jeu directement. Il reçoit à chaque
// frame :
//   - viewport       : { width, height } du canvas
//   - tileGrid       : map gridKey → tile object
//   - actors         : array d'actors (joueur + ennemis)
//   - hover          : { gx, gy } | null
//   - reachableSet   : Set<"x,y"> de cases atteignables
//   - biome          : objet biome (cf biomes/index.js)
//   - particles      : ParticleSystem instance
//   - time           : frame counter
//   - options        : { showGrid, night, fxLevel, bevel }

import { isoToScreen, TILE_W, TILE_H } from './iso-projection.js';
import { drawTileBase, drawTileOverlay } from './tile-base.js';
import { drawSky, drawVignette, emitAmbientEmbers } from './effects.js';
import { hexToRgba } from './iso-utils.js';
import { getCharacterRenderer } from './characters/index.js';

/**
 * Render frame complète.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {object} params
 *   - viewport, tileGrid, gridW, gridH, actors,
 *     hover, reachableSet, biome, particles, time, options
 */
export function renderFrame(ctx, params){
  const {
    viewport,
    tileGrid,
    gridW,
    gridH,
    actors,
    hover,
    reachableSet,
    biome,
    particles,
    time,
    options = {},
  } = params;

  // 1) Ciel + ambiance
  drawSky(ctx, viewport, biome.config, time, options);
  emitAmbientEmbers(particles, viewport, biome.config, time, options.fxLevel ?? 1);

  // 2) Tuiles : tri back-to-front (depth = x + y)
  const tileOrder = [];
  for(let y = 0; y < gridH; y++){
    for(let x = 0; x < gridW; x++){
      tileOrder.push([x, y]);
    }
  }
  tileOrder.sort((a, b) => (a[0]+a[1]) - (b[0]+b[1]));

  for(const [x, y] of tileOrder){
    drawTile(ctx, x, y, tileGrid, biome, time, hover, reachableSet, viewport, options);
  }

  // 3) Props et entités, triés ensemble
  const upper = [];
  for(const [x, y] of tileOrder){
    const tile = tileGrid[x+','+y];
    if(tile && tile.isWall && tile.prop){
      upper.push({ kind: 'prop', gx: x, gy: y, depth: x + y });
    }
  }
  for(const a of actors){
    upper.push({ kind: 'actor', ref: a, depth: a.ax + a.ay + 0.5 });
  }
  upper.sort((a, b) => a.depth - b.depth);

  for(const item of upper){
    if(item.kind === 'prop'){
      drawProp(ctx, item.gx, item.gy, tileGrid, biome, time, viewport);
    } else {
      drawActor(ctx, item.ref, biome, time, viewport, options);
    }
  }

  // 4) Particules
  particles.render(ctx);

  // 5) Vignette finale
  drawVignette(ctx, viewport);
}

// ============================================================================
// DRAW TILE (base + détail + overlays)
// ============================================================================

function drawTile(ctx, gx, gy, tileGrid, biome, time, hover, reachableSet, viewport, options){
  const tile = tileGrid[gx+','+gy];
  if(!tile) return;

  const sp = isoToScreen(gx, gy, tile.microElev || 0, viewport);

  // Base tile (bevel + variation + bord)
  drawTileBase(ctx, sp.x, sp.y, tile, biome.config, time, {
    bevel: options.bevel !== false,
    debug: options.showGrid,
  });

  // Détail spécifique au type de tuile
  const tileTypeName = biome.config.tileTypes[tile.type];
  const tileRenderer = biome.tiles[tileTypeName];
  if(tileRenderer){
    tileRenderer(ctx, sp.x, sp.y, tile, time);
  }

  // Overlay : reachable
  if(reachableSet && reachableSet.has(gx+','+gy) && !tile.isWall){
    const alpha = 0.14 + Math.sin(time*0.08) * 0.04;
    drawTileOverlay(ctx, sp.x, sp.y, biome.config.accent, alpha, 'fill');
  }

  // Overlay : hover
  if(hover && hover.gx === gx && hover.gy === gy && !tile.isWall){
    drawTileOverlay(ctx, sp.x, sp.y, biome.config.accent, 0.95, 'stroke');
  }
}

// ============================================================================
// DRAW PROP
// ============================================================================

function drawProp(ctx, gx, gy, tileGrid, biome, time, viewport){
  const tile = tileGrid[gx+','+gy];
  if(!tile || !tile.prop) return;
  const propRenderer = biome.props[tile.prop];
  if(!propRenderer) return;
  const sp = isoToScreen(gx, gy, tile.microElev || 0, viewport);
  propRenderer(ctx, sp.x, sp.y, time, tile.seed || 0);
}

// ============================================================================
// DRAW ACTOR (player + enemies, via le registre characters/)
// ============================================================================

function drawActor(ctx, actor, biome, time, viewport, options){
  if(actor.isDead) return;

  const sp = isoToScreen(actor.ax, actor.ay, getElev(actor, viewport), viewport);
  const fxLevel = options.fxLevel ?? 1;

  // Ombre au sol
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.beginPath();
  ctx.ellipse(sp.x, sp.y + 7, 12, 4, 0, 0, Math.PI*2);
  ctx.fill();

  // Halo coloré sous le perso
  if(fxLevel >= 1 && actor.glowColor){
    const idle = actor.idle ?? 0;
    const gPulse = 0.3 + Math.sin(time*0.05 + idle) * 0.1;
    const grad = ctx.createRadialGradient(sp.x, sp.y+2, 2, sp.x, sp.y+2, 26);
    grad.addColorStop(0, hexToRgba(actor.glowColor, 0.55 * gPulse));
    grad.addColorStop(1, hexToRgba(actor.glowColor, 0));
    ctx.fillStyle = grad;
    ctx.fillRect(sp.x-26, sp.y-18, 52, 36);
  }

  // Le personnage lui-même (via le renderer de son archetype)
  const renderer = getCharacterRenderer(actor.archetype || 'hero');
  renderer(ctx, sp.x, sp.y, actor, time, { fxLevel });

  // HP bar (ennemis)
  if(!actor.isPlayer && actor.maxHp){
    const w = 28, h = 3;
    const ratio = (actor.hp || 0) / actor.maxHp;
    const cy = sp.y - 10 + (Math.sin(actor.idle ?? 0) * 1.2);
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(sp.x - w/2 - 1, cy - 28, w+2, h+2);
    ctx.fillStyle = ratio > 0.5 ? '#4caf50' : ratio > 0.25 ? '#ffb300' : '#f44336';
    ctx.fillRect(sp.x - w/2, cy - 27, w * ratio, h);
  }

  // Tag de nom
  if(actor.name){
    const cy = sp.y - 10 + (Math.sin(actor.idle ?? 0) * 1.2);
    ctx.fillStyle = actor.isPlayer ? '#aee6ff' : '#ffb74d';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(actor.name, sp.x, cy - 30);
  }
}

function getElev(actor, viewport){
  // Pour l'instant, pas d'élévation par actor (les actors suivent le sol).
  // On peut récupérer l'élévation de la tuile sous lui via un callback si besoin.
  return 0;
}
