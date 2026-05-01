// src/js/render/biomes/cryo.js
// Biome Cryo : palette bleu/glace, ambiance arctique / cryogénique.

import { TILE_W, TILE_H } from '../iso-projection.js';
import { clipToDiamond, prand } from '../iso-utils.js';

export const config = {
  id: 'cryo',
  name: 'CRYO',
  description: 'Stations cryogéniques abandonnées. Glace, neige, métal givré.',

  skyTop: '#0e2333',
  skyBot: '#02080d',

  base:      '#1d3e55',
  baseLight: '#2c5979',
  baseDark:  '#0f2433',

  accent: '#aee6ff',
  glow:   '#4fc3f7',
  ember:  '#cfeaff',
  edge:   '#04111a',

  tileTypes: [
    'icePlate', 'snowDust', 'cryoCrack', 'frostMetal', 'iceShards',
    'glacier', 'frozenTile', 'deepIce', 'snowPile', 'cryoVent',
    'crystalFloor', 'frostPlate'
  ],
  tileWeights: [
    0.20, 0.18, 0.10, 0.12, 0.04,
    0.05, 0.05, 0.06, 0.10, 0.04,
    0.03, 0.03
  ],

  props: [
    'cryopod', 'iceShard', 'frozenCorpse', 'snowMound',
    'cryostatue', 'crystalCluster', 'frozenTank', 'icePillar'
  ],
};

export const tiles = {

  icePlate(ctx, cx, cy, tile, t){
    clipToDiamond(ctx, cx, cy, TILE_W, TILE_H);
    ctx.strokeStyle = 'rgba(220,240,255,0.25)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx-12, cy-5);
    ctx.lineTo(cx+8, cy-2);
    ctx.lineTo(cx+12, cy+4);
    ctx.stroke();
    const sx = cx + Math.sin(t*0.03 + tile.seed) * 8;
    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    ctx.fillRect((sx-3)|0, (cy-3)|0, 6, 1);
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    for(let i = 0; i < 6; i++){
      const px = cx + (prand(tile.seed, i*2.1) - 0.5) * TILE_W * 0.7;
      const py = cy + (prand(tile.seed, i*3.1) - 0.5) * TILE_H * 0.7;
      ctx.fillRect(px|0, py|0, 1, 1);
    }
    ctx.restore();
  },

  snowDust(ctx, cx, cy, tile, t){
    clipToDiamond(ctx, cx, cy, TILE_W, TILE_H);
    for(let i = 0; i < 26; i++){
      const px = cx + (prand(tile.seed, i*1.3) - 0.5) * TILE_W * 0.75;
      const py = cy + (prand(tile.seed, i*2.7) - 0.5) * TILE_H * 0.75;
      const a = prand(tile.seed, i*3.3) * 0.5 + 0.2;
      ctx.fillStyle = `rgba(220,240,255,${a})`;
      ctx.fillRect(px|0, py|0, 1, 1);
    }
    ctx.restore();
  },

  cryoCrack(ctx, cx, cy, tile, t){
    clipToDiamond(ctx, cx, cy, TILE_W, TILE_H);
    ctx.strokeStyle = `rgba(120,200,255,${0.5 + Math.sin(t*0.05 + tile.seed)*0.2})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx-14, cy);
    ctx.lineTo(cx-4, cy-2);
    ctx.lineTo(cx+2, cy+3);
    ctx.lineTo(cx+12, cy);
    ctx.moveTo(cx-4, cy-2);
    ctx.lineTo(cx-6, cy-6);
    ctx.stroke();
    ctx.restore();
  },

  frostMetal(ctx, cx, cy, tile, t){
    clipToDiamond(ctx, cx, cy, TILE_W, TILE_H);
    ctx.strokeStyle = 'rgba(0,0,0,0.4)';
    ctx.lineWidth = 1;
    for(let i = -1; i <= 1; i++){
      ctx.beginPath();
      ctx.moveTo(cx + i*15, cy - TILE_H/2);
      ctx.lineTo(cx + i*15 + TILE_W/2, cy);
      ctx.stroke();
    }
    ctx.fillStyle = 'rgba(180,220,255,0.25)';
    for(let i = 0; i < 12; i++){
      const px = cx + (prand(tile.seed, i*1.8) - 0.5) * TILE_W * 0.7;
      const py = cy + (prand(tile.seed, i*2.4) - 0.5) * TILE_H * 0.7;
      ctx.fillRect(px|0, py|0, 1, 1);
    }
    ctx.restore();
  },

  iceShards(ctx, cx, cy, tile, t){
    clipToDiamond(ctx, cx, cy, TILE_W, TILE_H);
    for(let i = 0; i < 3; i++){
      const px = cx + (prand(tile.seed, i*7.1) - 0.5) * TILE_W * 0.5;
      const py = cy + (prand(tile.seed, i*9.3) - 0.5) * TILE_H * 0.4;
      ctx.fillStyle = 'rgba(180,220,255,0.5)';
      ctx.beginPath();
      ctx.moveTo(px, py-4);
      ctx.lineTo(px-1, py);
      ctx.lineTo(px+1, py);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.4)';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(px, py-4);
      ctx.lineTo(px, py);
      ctx.stroke();
    }
    ctx.restore();
  },

  glacier(ctx, cx, cy, tile, t){
    clipToDiamond(ctx, cx, cy, TILE_W, TILE_H);
    ctx.fillStyle = 'rgba(180,220,240,0.2)';
    ctx.beginPath();
    ctx.moveTo(cx-10, cy-4);
    ctx.lineTo(cx+10, cy-2);
    ctx.lineTo(cx+8, cy+1);
    ctx.lineTo(cx-12, cy);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(220,240,255,0.3)';
    ctx.beginPath();
    ctx.moveTo(cx-8, cy-2);
    ctx.lineTo(cx+8, cy);
    ctx.lineTo(cx+6, cy+3);
    ctx.lineTo(cx-10, cy+1);
    ctx.closePath();
    ctx.fill();
    const sx = cx + Math.sin(t*0.025 + tile.seed) * 6;
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fillRect((sx-2)|0, (cy-1)|0, 4, 1);
    ctx.restore();
  },

  frozenTile(ctx, cx, cy, tile, t){
    clipToDiamond(ctx, cx, cy, TILE_W, TILE_H);
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fillRect((cx-3)|0, (cy-2)|0, 6, 4);
    ctx.fillStyle = 'rgba(180,220,255,0.3)';
    ctx.fillRect((cx-3)|0, (cy-2)|0, 6, 1);
    ctx.fillStyle = 'rgba(220,240,255,0.18)';
    for(let i = 0; i < 6; i++){
      const px = cx + (prand(tile.seed, i*1.7) - 0.5) * TILE_W * 0.7;
      const py = cy + (prand(tile.seed, i*2.3) - 0.5) * TILE_H * 0.7;
      ctx.fillRect(px|0, py|0, 1, 1);
    }
    ctx.restore();
  },

  deepIce(ctx, cx, cy, tile, t){
    clipToDiamond(ctx, cx, cy, TILE_W, TILE_H);
    const grad = ctx.createRadialGradient(cx, cy, 1, cx, cy, 16);
    grad.addColorStop(0, 'rgba(20,60,90,0.7)');
    grad.addColorStop(1, 'rgba(40,100,140,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(cx-16, cy-12, 32, 24);
    ctx.fillStyle = `rgba(120,200,240,${0.3 + Math.sin(t*0.04 + tile.seed)*0.15})`;
    ctx.fillRect((cx-2)|0, (cy-1)|0, 4, 2);
    ctx.restore();
  },

  snowPile(ctx, cx, cy, tile, t){
    clipToDiamond(ctx, cx, cy, TILE_W, TILE_H);
    ctx.fillStyle = 'rgba(220,240,255,0.4)';
    ctx.beginPath();
    ctx.ellipse(cx, cy, 10, 4, 0, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.beginPath();
    ctx.ellipse(cx-1, cy-1, 7, 2, 0, Math.PI, 0);
    ctx.fill();
    for(let i = 0; i < 3; i++){
      const px = cx + (prand(tile.seed, i*4.1) - 0.5) * 14;
      const py = cy - 1 + (prand(tile.seed, i*5.3) - 0.5) * 3;
      if(Math.sin(t*0.1 + i + tile.seed) > 0.5){
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.fillRect(px|0, py|0, 1, 1);
      }
    }
    ctx.restore();
  },

  cryoVent(ctx, cx, cy, tile, t){
    clipToDiamond(ctx, cx, cy, TILE_W, TILE_H);
    const pulse = (Math.sin(t*0.06 + tile.seed) + 1) * 0.5;
    const r = 7 + pulse * 2;
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    grad.addColorStop(0, 'rgba(180,230,255,0.7)');
    grad.addColorStop(1, 'rgba(80,180,240,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(cx-r, cy-r, r*2, r*2);
    ctx.strokeStyle = `rgba(200,240,255,${0.5 + pulse*0.3})`;
    ctx.lineWidth = 1;
    for(let a = 0; a < 6; a++){
      const ang = a*Math.PI/3 + tile.seed*0.1;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(ang)*8, cy + Math.sin(ang)*4);
      ctx.stroke();
    }
    ctx.restore();
  },

  crystalFloor(ctx, cx, cy, tile, t){
    clipToDiamond(ctx, cx, cy, TILE_W, TILE_H);
    for(let i = 0; i < 5; i++){
      const px = cx + (prand(tile.seed, i*2.7) - 0.5) * TILE_W * 0.6;
      const py = cy + (prand(tile.seed, i*3.5) - 0.5) * TILE_H * 0.5;
      ctx.fillStyle = 'rgba(180,220,255,0.5)';
      ctx.beginPath();
      ctx.moveTo(px, py-3);
      ctx.lineTo(px-1, py);
      ctx.lineTo(px+1, py);
      ctx.closePath();
      ctx.fill();
      if(Math.sin(t*0.08 + i + tile.seed) > 0.6){
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.fillRect(px|0, (py-2)|0, 1, 1);
      }
    }
    ctx.restore();
  },

  frostPlate(ctx, cx, cy, tile, t){
    clipToDiamond(ctx, cx, cy, TILE_W, TILE_H);
    ctx.strokeStyle = 'rgba(200,240,255,0.35)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx-8, cy);
    ctx.lineTo(cx-4, cy-3);
    ctx.lineTo(cx+4, cy-3);
    ctx.lineTo(cx+8, cy);
    ctx.lineTo(cx+4, cy+3);
    ctx.lineTo(cx-4, cy+3);
    ctx.closePath();
    ctx.stroke();
    ctx.fillStyle = 'rgba(220,240,255,0.18)';
    ctx.fillRect((cx-3)|0, cy|0, 6, 1);
    ctx.restore();
  },

};

export const props = {

  cryopod(ctx, cx, cy, t, seed){
    ctx.fillStyle = '#1a3045';
    ctx.beginPath();
    ctx.ellipse(cx, cy-10, 8, 12, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = 'rgba(180,220,240,0.6)';
    ctx.beginPath();
    ctx.ellipse(cx, cy-12, 5, 9, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = 'rgba(80,120,150,0.7)';
    ctx.fillRect((cx-2)|0, (cy-15)|0, 4, 8);
    ctx.fillStyle = 'rgba(60,100,130,0.6)';
    ctx.beginPath();
    ctx.arc(cx, cy-16, 2, 0, Math.PI*2);
    ctx.fill();
    const fl = Math.sin(t*0.05 + seed);
    ctx.fillStyle = `rgba(220,240,255,${0.4 + fl*0.2})`;
    ctx.fillRect((cx-3)|0, (cy-14)|0, 1, 1);
    ctx.fillRect((cx+1)|0, (cy-10)|0, 1, 1);
    ctx.fillStyle = '#1a2a35';
    ctx.fillRect((cx-9)|0, (cy-2)|0, 18, 3);
    ctx.fillRect((cx-9)|0, (cy-22)|0, 18, 3);
    ctx.fillStyle = '#4fc3f7';
    ctx.fillRect((cx-6)|0, (cy-21)|0, 2, 1);
  },

  iceShard(ctx, cx, cy, t, seed){
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath();
    ctx.ellipse(cx, cy, 8, 2, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = 'rgba(120,180,220,0.8)';
    ctx.beginPath();
    ctx.moveTo(cx, cy-22);
    ctx.lineTo(cx-5, cy-2);
    ctx.lineTo(cx+5, cy-2);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(220,240,255,0.7)';
    ctx.beginPath();
    ctx.moveTo(cx, cy-22);
    ctx.lineTo(cx-2, cy-12);
    ctx.lineTo(cx+1, cy-2);
    ctx.closePath();
    ctx.fill();
    const sx = cx + Math.sin(t*0.04 + seed) * 0.5;
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fillRect((sx-1)|0, (cy-15)|0, 2, 4);
    ctx.fillStyle = 'rgba(120,180,220,0.7)';
    ctx.beginPath();
    ctx.moveTo(cx-7, cy-12);
    ctx.lineTo(cx-9, cy-2);
    ctx.lineTo(cx-5, cy-2);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx+7, cy-8);
    ctx.lineTo(cx+5, cy-2);
    ctx.lineTo(cx+9, cy-2);
    ctx.closePath();
    ctx.fill();
  },

  frozenCorpse(ctx, cx, cy, t, seed){
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath();
    ctx.ellipse(cx, cy, 10, 3, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = '#3a4555';
    ctx.fillRect((cx-5)|0, (cy-8)|0, 10, 8);
    ctx.fillStyle = '#2a3545';
    ctx.fillRect((cx-5)|0, (cy-8)|0, 2, 8);
    ctx.fillStyle = '#5a6575';
    ctx.beginPath();
    ctx.arc(cx-2, cy-11, 3, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = 'rgba(200,230,250,0.4)';
    ctx.fillRect((cx-5)|0, (cy-12)|0, 10, 2);
    ctx.fillStyle = 'rgba(220,240,255,0.7)';
    ctx.fillRect((cx-3)|0, (cy-3)|0, 1, 1);
    ctx.fillRect((cx+2)|0, (cy-6)|0, 1, 1);
    ctx.fillRect((cx-1)|0, (cy-9)|0, 1, 1);
  },

  snowMound(ctx, cx, cy, t, seed){
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(cx, cy, 14, 4, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = 'rgba(180,220,240,0.8)';
    ctx.beginPath();
    ctx.ellipse(cx, cy-2, 12, 5, 0, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = 'rgba(220,240,255,0.9)';
    ctx.beginPath();
    ctx.ellipse(cx-1, cy-5, 10, 4, 0, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.beginPath();
    ctx.ellipse(cx-2, cy-8, 7, 3, 0, Math.PI, 0);
    ctx.fill();
    for(let i = 0; i < 4; i++){
      if(Math.sin(t*0.1 + i + seed) > 0.6){
        const px = cx + (Math.sin(seed + i*1.7) - 0.5) * 16;
        const py = cy - 6 + (Math.cos(seed + i*2.3) - 0.5) * 4;
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.fillRect(px|0, py|0, 1, 1);
      }
    }
  },

  cryostatue(ctx, cx, cy, t, seed){
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath();
    ctx.ellipse(cx, cy, 8, 3, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = '#1a2a35';
    ctx.fillRect((cx-7)|0, (cy-3)|0, 14, 3);
    ctx.fillStyle = 'rgba(120,170,200,0.7)';
    ctx.fillRect((cx-5)|0, (cy-22)|0, 10, 19);
    ctx.fillStyle = 'rgba(40,60,80,0.8)';
    ctx.fillRect((cx-3)|0, (cy-18)|0, 6, 12);
    ctx.beginPath();
    ctx.arc(cx, cy-22, 2, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = 'rgba(220,240,255,0.6)';
    ctx.fillRect((cx-5)|0, (cy-22)|0, 1, 19);
    ctx.fillStyle = 'rgba(180,220,240,0.5)';
    const sx = cx - 3 + (Math.sin(t*0.03 + seed) * 1);
    ctx.fillRect(sx|0, (cy-15)|0, 1, 8);
  },

  crystalCluster(ctx, cx, cy, t, seed){
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath();
    ctx.ellipse(cx, cy, 9, 2, 0, 0, Math.PI*2);
    ctx.fill();
    const crystals = [[-4,-12,1.0],[4,-15,1.2],[0,-10,0.8],[-7,-8,0.7],[6,-9,0.9]];
    for(const [dx, dy, sc] of crystals){
      ctx.fillStyle = 'rgba(120,180,220,0.7)';
      const h = 10*sc, w = 2*sc;
      ctx.beginPath();
      ctx.moveTo(cx+dx, cy+dy*0.6);
      ctx.lineTo(cx+dx-w, cy);
      ctx.lineTo(cx+dx+w, cy);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = 'rgba(220,240,255,0.7)';
      ctx.fillRect((cx+dx)|0, (cy+dy*0.6)|0, 1, h*0.8);
    }
    if(Math.sin(t*0.15 + seed) > 0.5){
      ctx.fillStyle = 'rgba(255,255,255,0.95)';
      ctx.fillRect((cx+4)|0, (cy-13)|0, 1, 1);
    }
  },

  frozenTank(ctx, cx, cy, t, seed){
    ctx.fillStyle = '#1a2a35';
    ctx.fillRect((cx-9)|0, (cy-20)|0, 18, 20);
    ctx.fillStyle = '#0a1a25';
    ctx.fillRect((cx+5)|0, (cy-20)|0, 4, 20);
    ctx.fillStyle = '#2a3a45';
    ctx.fillRect((cx-9)|0, (cy-22)|0, 18, 3);
    ctx.fillStyle = 'rgba(200,230,250,0.5)';
    for(let i = 0; i < 6; i++){
      ctx.fillRect((cx-8+i*3)|0, (cy-20)|0, 2, 1);
      ctx.fillRect((cx-8+i*3)|0, (cy-15)|0, 2, 1);
    }
    ctx.fillStyle = '#3a5a75';
    ctx.fillRect((cx-3)|0, (cy-13)|0, 6, 6);
    const pulse = Math.sin(t*0.06 + seed) * 0.3 + 0.7;
    ctx.fillStyle = `rgba(120,200,240,${pulse})`;
    ctx.fillRect((cx-2)|0, (cy-12)|0, 4, 4);
    ctx.fillStyle = '#0a1a25';
    ctx.fillRect((cx-1)|0, (cy-22)|0, 3, 2);
    ctx.fillStyle = 'rgba(220,240,255,0.7)';
    ctx.beginPath();
    ctx.moveTo(cx-7, cy);
    ctx.lineTo(cx-6, cy+3);
    ctx.lineTo(cx-5, cy);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx+5, cy);
    ctx.lineTo(cx+6, cy+2);
    ctx.lineTo(cx+7, cy);
    ctx.closePath();
    ctx.fill();
  },

  icePillar(ctx, cx, cy, t, seed){
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath();
    ctx.ellipse(cx, cy, 8, 3, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = 'rgba(80,140,180,0.8)';
    ctx.fillRect((cx-4)|0, (cy-26)|0, 8, 26);
    ctx.fillStyle = 'rgba(120,180,220,0.7)';
    ctx.fillRect((cx-4)|0, (cy-26)|0, 2, 26);
    ctx.fillStyle = 'rgba(200,230,250,0.5)';
    const sx = cx - 4 + (Math.sin(t*0.02 + seed) * 1 + 1);
    ctx.fillRect(sx|0, (cy-24)|0, 1, 22);
    ctx.fillStyle = 'rgba(220,240,255,0.8)';
    ctx.beginPath();
    ctx.moveTo(cx-5, cy-26);
    ctx.lineTo(cx, cy-30);
    ctx.lineTo(cx+5, cy-26);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(180,220,250,0.6)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx-2, cy-22);
    ctx.lineTo(cx+1, cy-15);
    ctx.lineTo(cx-1, cy-8);
    ctx.stroke();
  },

};

export default { config, tiles, props };
