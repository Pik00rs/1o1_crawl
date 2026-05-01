// src/js/render/iso-engine.js
// Moteur de rendu iso 2.5D avec caméra et zoom.

import { isoToScreen, TILE_W, TILE_H } from './iso-projection.js';
import { drawTileBase, drawTileOverlay } from './tile-base.js';
import { drawSky, drawVignette, emitAmbientEmbers } from './effects.js';
import { hexToRgba } from './iso-utils.js';
import { getCharacterRenderer } from './characters/index.js';

/**
 * Render frame complète.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {object} params - { viewport, tileGrid, gridW, gridH, actors, hover,
 *                             reachableSet, validTargets, biome, particles,
 *                             time, view: {camX, camY, zoom}, options,
 *                             aoePreview }
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
    validTargets,
    aoePreview,
    biome,
    particles,
    time,
    view = { camX: 0, camY: 0, zoom: 1 },
    options = {},
  } = params;

  const zoom = view.zoom || 1;

  // 1) Ciel + ambiance
  drawSky(ctx, viewport, biome.config, time, options);
  emitAmbientEmbers(particles, viewport, biome.config, time, options.fxLevel ?? 1);

  // 2) Tuiles : tri back-to-front
  const tileOrder = [];
  for(let y = 0; y < gridH; y++){
    for(let x = 0; x < gridW; x++){
      tileOrder.push([x, y]);
    }
  }
  tileOrder.sort((a, b) => (a[0]+a[1]) - (b[0]+b[1]));

  for(const [x, y] of tileOrder){
    drawTile(ctx, x, y, tileGrid, biome, time, hover, reachableSet, validTargets, aoePreview, viewport, view, options);
  }

  // 3) Props et entités
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
      drawProp(ctx, item.gx, item.gy, tileGrid, biome, time, viewport, view);
    } else {
      drawActor(ctx, item.ref, biome, time, viewport, view, options, hover);
    }
  }

  // 4) Particules
  particles.render(ctx);

  // 5) Vignette finale
  drawVignette(ctx, viewport);
}

function drawTile(ctx, gx, gy, tileGrid, biome, time, hover, reachableSet, validTargets, aoePreview, viewport, view, options){
  const tile = tileGrid[gx+','+gy];
  if(!tile) return;

  const sp = isoToScreen(gx, gy, tile.microElev || 0, viewport, view);

  // Skip if off-screen (perf)
  const margin = 100;
  if(sp.x < -margin || sp.x > viewport.width + margin || sp.y < -margin || sp.y > viewport.height + margin) return;

  const zoom = view.zoom || 1;

  drawTileBase(ctx, sp.x, sp.y, tile, biome.config, time, {
    bevel: options.bevel !== false,
    debug: options.showGrid,
    zoom,
  });

  // Tile-type detail
  const tileTypeName = biome.config.tileTypes[tile.type];
  const tileRenderer = biome.tiles[tileTypeName];
  if(tileRenderer && zoom >= 0.7){
    // Skip details when zoomed too far out
    ctx.save();
    ctx.translate(sp.x, sp.y);
    ctx.scale(zoom, zoom);
    ctx.translate(-sp.x, -sp.y);
    tileRenderer(ctx, sp.x, sp.y, tile, time);
    ctx.restore();
  }

  // Reachable overlay (MOVE) - vert vif
  if(reachableSet && reachableSet.has(gx+','+gy) && !tile.isWall){
    const pulse = 0.30 + Math.sin(time*0.06) * 0.06;
    drawTileOverlay(ctx, sp.x, sp.y, '#4caf50', pulse, 'fill', zoom);
    drawTileOverlay(ctx, sp.x, sp.y, '#69f0ae', 0.85, 'stroke', zoom);
  }

  // Valid target overlay (ATTACK or SPELL) - couleur selon type
  if(validTargets && validTargets.has(gx+','+gy)){
    const col = options.targetColor || '#ff5252';
    const colStroke = options.targetStroke || '#ff8a80';
    const pulse = 0.32 + Math.sin(time*0.10) * 0.10;
    drawTileOverlay(ctx, sp.x, sp.y, col, pulse, 'fill', zoom);
    drawTileOverlay(ctx, sp.x, sp.y, colStroke, 0.95, 'stroke', zoom);
  }

  // AOE preview (orange vif sous le hover de spell)
  if(aoePreview && aoePreview.has(gx+','+gy)){
    drawTileOverlay(ctx, sp.x, sp.y, '#ff9800', 0.50, 'fill', zoom);
    drawTileOverlay(ctx, sp.x, sp.y, '#ffc947', 1.0, 'stroke', zoom);
  }

  // Hover stroke (toujours visible, blanc)
  if(hover && hover.gx === gx && hover.gy === gy && !tile.isWall){
    drawTileOverlay(ctx, sp.x, sp.y, '#ffffff', 1.0, 'stroke', zoom);
  }
}

function drawProp(ctx, gx, gy, tileGrid, biome, time, viewport, view){
  const tile = tileGrid[gx+','+gy];
  if(!tile || !tile.prop) return;
  const propRenderer = biome.props[tile.prop];
  if(!propRenderer) return;
  const sp = isoToScreen(gx, gy, tile.microElev || 0, viewport, view);
  const zoom = view.zoom || 1;
  ctx.save();
  ctx.translate(sp.x, sp.y);
  ctx.scale(zoom, zoom);
  propRenderer(ctx, 0, 0, time, tile.seed || 0);
  ctx.restore();
}

function drawActor(ctx, actor, biome, time, viewport, view, options, hover){
  if(actor.isDead) return;

  const sp = isoToScreen(actor.ax, actor.ay, 0, viewport, view);
  const fxLevel = options.fxLevel ?? 1;
  const zoom = view.zoom || 1;

  // Ombre
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.beginPath();
  ctx.ellipse(sp.x, sp.y + 7 * zoom, 12 * zoom, 4 * zoom, 0, 0, Math.PI*2);
  ctx.fill();

  // Halo
  if(fxLevel >= 1 && actor.glowColor){
    const idle = actor.idle ?? 0;
    const gPulse = 0.3 + Math.sin(time*0.05 + idle) * 0.1;
    const grad = ctx.createRadialGradient(sp.x, sp.y+2, 2, sp.x, sp.y+2, 26 * zoom);
    grad.addColorStop(0, hexToRgba(actor.glowColor, 0.55 * gPulse));
    grad.addColorStop(1, hexToRgba(actor.glowColor, 0));
    ctx.fillStyle = grad;
    ctx.fillRect(sp.x - 26 * zoom, sp.y - 18 * zoom, 52 * zoom, 36 * zoom);
  }

  // Le perso (avec scale pour le zoom)
  ctx.save();
  ctx.translate(sp.x, sp.y);
  ctx.scale(zoom, zoom);
  const renderer = getCharacterRenderer(actor.archetype || 'hero');
  renderer(ctx, 0, 0, actor, time, { fxLevel });
  ctx.restore();

  // HP bar + intent au-dessus (en taille screen, pas zoom)
  if(!actor.isPlayer && actor.maxHp){
    const cy = sp.y - 10 * zoom + (Math.sin(actor.idle ?? 0) * 1.2 * zoom);
    const w = 30, h = 3;
    const ratio = (actor.hp || 0) / actor.maxHp;

    // Hover ring
    if(hover && hover.gx === Math.round(actor.ax) && hover.gy === Math.round(actor.ay)){
      ctx.strokeStyle = `rgba(255,82,82,${0.7 + Math.sin(time*0.15)*0.3})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(sp.x, cy - 2, 18 * zoom, 0, Math.PI*2);
      ctx.stroke();
    }

    // Intent badge
    if(actor.intent){
      ctx.fillStyle = 'rgba(0,0,0,0.85)';
      ctx.fillRect(sp.x - 26, cy - 42, 52, 10);
      ctx.fillStyle = actor.intent.color || '#ff5252';
      ctx.font = 'bold 8px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('▸ ' + actor.intent.name, sp.x, cy - 34);
    }

    // HP bar
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(sp.x - w/2 - 1, cy - 30, w+2, h+2);
    ctx.fillStyle = ratio > 0.5 ? '#4caf50' : ratio > 0.25 ? '#ffb300' : '#f44336';
    ctx.fillRect(sp.x - w/2, cy - 29, w * ratio, h);

    // Name
    ctx.fillStyle = '#ffb74d';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(actor.name || '?', sp.x, cy - 46);
  } else if(actor.isPlayer && actor.name){
    const cy = sp.y - 10 * zoom + (Math.sin(actor.idle ?? 0) * 1.2 * zoom);
    ctx.fillStyle = '#aee6ff';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(actor.name, sp.x, cy - 30);
  }
}
