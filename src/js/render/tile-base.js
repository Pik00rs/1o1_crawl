// src/js/render/tile-base.js
// Rendu de la "tuile par défaut" — la base sur laquelle les détails de chaque
// type de tuile sont peints ensuite.

import { TILE_W, TILE_H, tileCorners } from './iso-projection.js';
import { hexToRgba } from './iso-utils.js';

export function drawTileBase(ctx, sx, sy, tile, biome, time, options = {}){
  const bevel = options.bevel !== false;
  const zoom = options.zoom || 1;
  const tw = TILE_W * zoom;
  const th = TILE_H * zoom;
  const corners = tileCorners(sx, sy, zoom);
  const { top, right, bot, left } = corners;

  // 1) Fond uni avec variation de teinte par tuile
  const baseCol = applyTint(biome.base, tile.tintShift || 0);
  drawDiamondPath(ctx, corners);
  ctx.fillStyle = baseCol;
  ctx.fill();

  // 2) Highlight haut
  if(bevel){
    ctx.fillStyle = hexToRgba(biome.baseLight, 0.22);
    ctx.beginPath();
    ctx.moveTo(top.x, top.y);
    ctx.lineTo(right.x, right.y);
    ctx.lineTo(right.x - 2, right.y + 1);
    ctx.lineTo(top.x, top.y + 2);
    ctx.lineTo(left.x + 2, left.y + 1);
    ctx.lineTo(left.x, left.y);
    ctx.closePath();
    ctx.fill();
  }

  // 3) Bevel sombre bas
  if(bevel){
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    ctx.beginPath();
    ctx.moveTo(left.x, left.y);
    ctx.lineTo(bot.x, bot.y);
    ctx.lineTo(right.x, right.y);
    ctx.lineTo(right.x - 2, right.y + 1);
    ctx.lineTo(bot.x, bot.y - 2);
    ctx.lineTo(left.x + 2, left.y + 1);
    ctx.closePath();
    ctx.fill();
  }

  // 4) Speckle de noise
  if(bevel && tile.noiseSeeds){
    for(let i = 0; i < 5; i++){
      const ns = tile.noiseSeeds[i] || 0;
      const angle = ns * Math.PI * 2;
      const dist = (tile.noiseSeeds[(i+1) % 5] || 0) * 12 * zoom;
      const px = sx + Math.cos(angle) * dist;
      const py = sy + Math.sin(angle) * dist * 0.5;
      const dark = ns > 0.5;
      ctx.fillStyle = dark ? 'rgba(0,0,0,0.18)' : hexToRgba(biome.baseLight, 0.12);
      ctx.fillRect(px|0, py|0, Math.max(1, zoom|0), Math.max(1, zoom|0));
    }
  }

  // 5) Vignette intra-tuile
  if(bevel){
    const grad = ctx.createRadialGradient(sx, sy, 6 * zoom, sx, sy, tw/2);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(0,0,0,0.18)');
    ctx.fillStyle = grad;
    drawDiamondPath(ctx, corners);
    ctx.fill();
  }

  // 6) Pulse de glow biome
  const pulse = (Math.sin(time * 0.025 + (tile.seed || 0) * 0.5) + 1) * 0.5;
  ctx.fillStyle = hexToRgba(biome.glow, 0.025 + pulse * 0.025);
  drawDiamondPath(ctx, corners);
  ctx.fill();

  // 7) Bord intérieur fin
  if(bevel){
    ctx.strokeStyle = hexToRgba(biome.edge, 0.55);
    ctx.lineWidth = 0.8;
    drawDiamondPath(ctx, corners);
    ctx.stroke();
  }

  if(options.debug){
    ctx.strokeStyle = hexToRgba(biome.edge, 0.85);
    ctx.lineWidth = 1;
    drawDiamondPath(ctx, corners);
    ctx.stroke();
  }
}

export function drawDiamondPath(ctx, corners){
  ctx.beginPath();
  ctx.moveTo(corners.top.x, corners.top.y);
  ctx.lineTo(corners.right.x, corners.right.y);
  ctx.lineTo(corners.bot.x, corners.bot.y);
  ctx.lineTo(corners.left.x, corners.left.y);
  ctx.closePath();
}

// Alias for backward compat
export const drawDiamond = drawDiamondPath;

function applyTint(hex, tintShift){
  if(!tintShift) return hex;
  const c = hex.replace('#','');
  const r = parseInt(c.slice(0,2), 16);
  const g = parseInt(c.slice(2,4), 16);
  const b = parseInt(c.slice(4,6), 16);
  const shift = tintShift * 100;
  const nr = Math.max(0, Math.min(255, r + shift)) | 0;
  const ng = Math.max(0, Math.min(255, g + shift)) | 0;
  const nb = Math.max(0, Math.min(255, b + shift)) | 0;
  return `rgb(${nr},${ng},${nb})`;
}

export function drawTileOverlay(ctx, sx, sy, color, alpha, mode = 'fill', zoom = 1){
  const corners = tileCorners(sx, sy, zoom);
  drawDiamondPath(ctx, corners);
  if(mode === 'stroke'){
    ctx.strokeStyle = hexToRgba(color, alpha);
    ctx.lineWidth = 2;
    ctx.stroke();
  } else {
    ctx.fillStyle = hexToRgba(color, alpha);
    ctx.fill();
  }
}
