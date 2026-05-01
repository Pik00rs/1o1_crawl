// src/js/render/biomes/toxic.js
// Biome Toxic : palette vert/jaune, ambiance jungle pourrissante / spores.

import { TILE_W, TILE_H } from '../iso-projection.js';
import { clipToDiamond, prand } from '../iso-utils.js';

export const config = {
  id: 'toxic',
  name: 'TOXIC',
  description: 'Jungle infestée. Mousse, champignons, spores, fluide acide.',

  skyTop: '#1a2a17',
  skyBot: '#040804',

  base:      '#244d2c',
  baseLight: '#386b3e',
  baseDark:  '#15301c',

  accent: '#cddc39',
  glow:   '#8bc34a',
  ember:  '#ddff85',
  edge:   '#08120c',

  tileTypes: [
    'mossPatch', 'sporeTile', 'toxicCrack', 'rootedFloor', 'sludgeFloor',
    'sickPlant', 'rotWood', 'muckPit', 'greenStone', 'overgrowth',
    'fungalFloor', 'wetMoss'
  ],
  tileWeights: [
    0.20, 0.10, 0.10, 0.12, 0.06,
    0.08, 0.05, 0.04, 0.06, 0.10,
    0.05, 0.04
  ],

  props: [
    'mushroomGiant', 'toxicBarrel', 'rotPile', 'sporeEmitter',
    'deadTree', 'fleshPod', 'vineCluster', 'plagueCauldron'
  ],
};

export const tiles = {

  mossPatch(ctx, cx, cy, tile, t){
    clipToDiamond(ctx, cx, cy, TILE_W, TILE_H);
    const sway = Math.sin(t*0.04 + tile.seed) * 0.5;
    for(let i = 0; i < 10; i++){
      const px = cx + (prand(tile.seed, i*1.7) - 0.5) * TILE_W * 0.7;
      const py = cy + (prand(tile.seed, i*2.3) - 0.5) * TILE_H * 0.6;
      const h = 2 + (prand(tile.seed, i*3.1)*2)|0;
      const blade = Math.sin(t*0.05 + i + tile.seed) * 0.7;
      ctx.strokeStyle = `rgba(140,200,80,${0.4 + prand(tile.seed, i*5.1)*0.3})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px + sway + blade*0.5, py - h);
      ctx.stroke();
    }
    if(prand(tile.seed, 99) > 0.7){
      const mx = cx + (prand(tile.seed, 11) - 0.5) * 16;
      const my = cy + (prand(tile.seed, 13) - 0.5) * 8;
      ctx.fillStyle = '#cddc39';
      ctx.fillRect(mx|0, (my-1)|0, 2, 1);
      ctx.fillStyle = '#9aa83c';
      ctx.fillRect(mx|0, my|0, 1, 2);
    }
    ctx.restore();
  },

  sporeTile(ctx, cx, cy, tile, t){
    clipToDiamond(ctx, cx, cy, TILE_W, TILE_H);
    for(let i = 0; i < 6; i++){
      const px = cx + (prand(tile.seed, i*2.7) - 0.5) * TILE_W * 0.6;
      const baseY = cy + (prand(tile.seed, i*3.5) - 0.5) * TILE_H * 0.5;
      const drift = Math.sin(t*0.04 + i + tile.seed) * 1.5;
      const py = baseY - ((t*0.3 + tile.seed*10) % 12);
      ctx.fillStyle = `rgba(220,255,140,${0.5 - ((t*0.3 + tile.seed*10) % 12)/24})`;
      ctx.fillRect((px+drift)|0, py|0, 1, 1);
    }
    ctx.fillStyle = 'rgba(190,230,100,0.3)';
    ctx.fillRect((cx-3)|0, cy|0, 6, 1);
    ctx.restore();
  },

  toxicCrack(ctx, cx, cy, tile, t){
    clipToDiamond(ctx, cx, cy, TILE_W, TILE_H);
    ctx.strokeStyle = `rgba(180,255,80,${0.5 + Math.sin(t*0.06 + tile.seed)*0.2})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx-12, cy+2);
    ctx.lineTo(cx-2, cy);
    ctx.lineTo(cx+6, cy+4);
    ctx.lineTo(cx+14, cy);
    ctx.moveTo(cx-2, cy);
    ctx.lineTo(cx-4, cy-5);
    ctx.stroke();
    ctx.restore();
  },

  rootedFloor(ctx, cx, cy, tile, t){
    clipToDiamond(ctx, cx, cy, TILE_W, TILE_H);
    ctx.strokeStyle = 'rgba(100,80,50,0.5)';
    ctx.lineWidth = 1;
    for(let i = 0; i < 3; i++){
      const sx = cx - 14 + i*10;
      const sy = cy + (prand(tile.seed, i*1.7) - 0.5) * 6;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.bezierCurveTo(sx+5, sy-2, sx+7, sy+3, sx+10, sy);
      ctx.stroke();
    }
    for(let i = 0; i < 3; i++){
      const px = cx + (prand(tile.seed, i*4.1) - 0.5) * 18;
      const py = cy + (prand(tile.seed, i*5.3) - 0.5) * 6;
      ctx.strokeStyle = 'rgba(140,200,80,0.5)';
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px + Math.sin(t*0.05 + i)*0.5, py - 2);
      ctx.stroke();
    }
    ctx.restore();
  },

  sludgeFloor(ctx, cx, cy, tile, t){
    clipToDiamond(ctx, cx, cy, TILE_W, TILE_H);
    const wave = Math.sin(t*0.04 + tile.seed) * 1;
    ctx.fillStyle = 'rgba(100,140,50,0.25)';
    ctx.fillRect((cx-14)|0, (cy+wave)|0, 28, 1);
    ctx.fillStyle = 'rgba(180,220,80,0.18)';
    ctx.fillRect((cx-10)|0, (cy+wave-2)|0, 20, 1);
    for(let i = 0; i < 3; i++){
      const px = cx + Math.sin(t*0.03 + i + tile.seed) * 8;
      const py = cy + (prand(tile.seed, i*1.7) - 0.5) * 8 + Math.sin(t*0.06 + i) * 1;
      ctx.fillStyle = 'rgba(220,255,120,0.4)';
      ctx.beginPath();
      ctx.arc(px, py, 1, 0, Math.PI*2);
      ctx.fill();
    }
    ctx.restore();
  },

  sickPlant(ctx, cx, cy, tile, t){
    clipToDiamond(ctx, cx, cy, TILE_W, TILE_H);
    const sway = Math.sin(t*0.03 + tile.seed);
    for(let i = 0; i < 3; i++){
      const px = cx + (i-1)*6;
      const py = cy - 2;
      ctx.strokeStyle = 'rgba(140,180,60,0.6)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px + sway*0.5, py - 3);
      ctx.stroke();
      ctx.fillStyle = 'rgba(200,220,80,0.5)';
      ctx.fillRect((px-1+sway*0.5)|0, (py-4)|0, 3, 1);
    }
    ctx.restore();
  },

  rotWood(ctx, cx, cy, tile, t){
    clipToDiamond(ctx, cx, cy, TILE_W, TILE_H);
    for(let i = -1; i <= 1; i++){
      ctx.fillStyle = 'rgba(80,50,30,0.55)';
      ctx.fillRect((cx-12)|0, (cy+i*4-1)|0, 24, 2);
      ctx.fillStyle = 'rgba(40,30,20,0.5)';
      ctx.fillRect((cx-10)|0, (cy+i*4)|0, 20, 1);
    }
    ctx.fillStyle = 'rgba(140,200,80,0.4)';
    for(let i = 0; i < 4; i++){
      const px = cx + (prand(tile.seed, i*2.1) - 0.5) * 16;
      const py = cy + (prand(tile.seed, i*3.7) - 0.5) * 4;
      ctx.fillRect(px|0, py|0, 2, 1);
    }
    ctx.restore();
  },

  muckPit(ctx, cx, cy, tile, t){
    clipToDiamond(ctx, cx, cy, TILE_W, TILE_H);
    const wave = Math.sin(t*0.05 + tile.seed) * 1.5;
    const grad = ctx.createRadialGradient(cx, cy, 1, cx, cy, 12);
    grad.addColorStop(0, 'rgba(20,30,15,0.85)');
    grad.addColorStop(1, 'rgba(40,60,30,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(cx-12, cy-8, 24, 16);
    ctx.strokeStyle = `rgba(140,180,60,${0.4 + Math.sin(t*0.08 + tile.seed)*0.2})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(cx, cy+wave, 8, 2, 0, 0, Math.PI*2);
    ctx.stroke();
    ctx.restore();
  },

  greenStone(ctx, cx, cy, tile, t){
    clipToDiamond(ctx, cx, cy, TILE_W, TILE_H);
    for(let i = 0; i < 3; i++){
      const px = cx + (prand(tile.seed, i*3.7) - 0.5) * TILE_W * 0.5;
      const py = cy + (prand(tile.seed, i*5.1) - 0.5) * TILE_H * 0.4;
      ctx.fillStyle = 'rgba(40,60,30,0.6)';
      ctx.fillRect((px-2)|0, py|0, 5, 2);
      ctx.fillStyle = 'rgba(140,180,80,0.35)';
      ctx.fillRect((px-2)|0, (py-1)|0, 5, 1);
      ctx.fillStyle = 'rgba(180,220,100,0.4)';
      ctx.fillRect((px-1)|0, (py-1)|0, 1, 1);
    }
    ctx.restore();
  },

  overgrowth(ctx, cx, cy, tile, t){
    clipToDiamond(ctx, cx, cy, TILE_W, TILE_H);
    ctx.strokeStyle = 'rgba(80,140,50,0.7)';
    ctx.lineWidth = 1;
    for(let i = 0; i < 4; i++){
      const sx = cx - 12 + i*8;
      const sy = cy + (prand(tile.seed, i) - 0.5) * 4;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.bezierCurveTo(sx+3, sy-3, sx+5, sy+3, sx+7, sy);
      ctx.stroke();
    }
    const fl = Math.sin(t*0.04 + tile.seed);
    ctx.fillStyle = `rgba(255,200,100,${0.4 + fl*0.2})`;
    ctx.fillRect((cx-4)|0, (cy-3)|0, 1, 1);
    ctx.fillStyle = 'rgba(255,150,100,0.5)';
    ctx.fillRect((cx+5)|0, (cy+2)|0, 1, 1);
    ctx.restore();
  },

  fungalFloor(ctx, cx, cy, tile, t){
    clipToDiamond(ctx, cx, cy, TILE_W, TILE_H);
    for(let i = 0; i < 5; i++){
      const px = cx + (prand(tile.seed, i*2.7) - 0.5) * TILE_W * 0.6;
      const py = cy + (prand(tile.seed, i*3.5) - 0.5) * TILE_H * 0.5;
      const cap = ['#ff7043','#ffeb3b','#ce93d8','#aed581','#80deea'][i % 5];
      ctx.fillStyle = cap;
      ctx.fillRect((px-1)|0, (py-1)|0, 3, 1);
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.fillRect((px-1)|0, py|0, 1, 2);
      const pulse = Math.sin(t*0.08 + i + tile.seed) * 0.5 + 0.5;
      ctx.fillStyle = `rgba(255,255,255,${0.2*pulse})`;
      ctx.fillRect(px|0, (py-1)|0, 1, 1);
    }
    ctx.restore();
  },

  wetMoss(ctx, cx, cy, tile, t){
    clipToDiamond(ctx, cx, cy, TILE_W, TILE_H);
    ctx.fillStyle = 'rgba(80,140,60,0.4)';
    for(let i = 0; i < 8; i++){
      const px = cx + (prand(tile.seed, i*1.3) - 0.5) * TILE_W * 0.7;
      const py = cy + (prand(tile.seed, i*2.7) - 0.5) * TILE_H * 0.6;
      ctx.fillRect(px|0, py|0, 2, 1);
    }
    const sx = cx + Math.sin(t*0.03 + tile.seed) * 4;
    ctx.fillStyle = 'rgba(200,255,180,0.3)';
    ctx.fillRect((sx-1)|0, cy|0, 2, 1);
    ctx.strokeStyle = 'rgba(140,200,80,0.6)';
    ctx.lineWidth = 1;
    for(let i = 0; i < 5; i++){
      const px = cx + (prand(tile.seed, i*5.7) - 0.5) * 16;
      const py = cy + (prand(tile.seed, i*6.1) - 0.5) * 4;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px + Math.sin(t*0.04 + i)*0.5, py - 2);
      ctx.stroke();
    }
    ctx.restore();
  },

};

export const props = {

  mushroomGiant(ctx, cx, cy, t, seed){
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath(); ctx.ellipse(cx, cy, 8, 3, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#d4c8a0';
    ctx.fillRect((cx-3)|0, (cy-15)|0, 6, 15);
    ctx.fillStyle = '#a89878';
    ctx.fillRect((cx-3)|0, (cy-15)|0, 2, 15);
    ctx.fillStyle = '#8b1f15';
    ctx.beginPath(); ctx.ellipse(cx, cy-16, 9, 5, 0, Math.PI, 0); ctx.fill();
    ctx.fillStyle = '#fff5b0';
    ctx.beginPath(); ctx.arc(cx-3, cy-17, 1.2, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx+3, cy-18, 1.5, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx, cy-19, 1, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx-5, cy-15, 0.8, 0, Math.PI*2); ctx.fill();
    const pulse = Math.sin(t*0.08 + seed) * 0.3 + 0.5;
    ctx.fillStyle = `rgba(255,255,200,${pulse*0.4})`;
    ctx.beginPath(); ctx.ellipse(cx, cy-16, 11, 6, 0, Math.PI, 0); ctx.fill();
  },

  toxicBarrel(ctx, cx, cy, t, seed){
    ctx.fillStyle = '#1a2818';
    ctx.fillRect((cx-7)|0, (cy-18)|0, 14, 18);
    ctx.fillStyle = '#2a4525';
    ctx.fillRect((cx-7)|0, (cy-18)|0, 3, 18);
    ctx.fillStyle = '#0a1a08';
    ctx.fillRect((cx+4)|0, (cy-18)|0, 3, 18);
    ctx.fillRect((cx-7)|0, (cy-18)|0, 14, 2);
    ctx.fillRect((cx-7)|0, (cy-2)|0, 14, 2);
    ctx.fillStyle = '#cddc39';
    ctx.fillRect((cx-3)|0, (cy-12)|0, 6, 3);
    const pulse = Math.sin(t*0.1 + seed) * 0.5 + 0.5;
    ctx.fillStyle = `rgba(180,255,100,${0.4 + pulse*0.4})`;
    ctx.fillRect((cx-1)|0, (cy-8)|0, 2, 5);
    ctx.fillStyle = 'rgba(140,220,80,0.5)';
    ctx.beginPath(); ctx.ellipse(cx, cy+2, 5, 1.5, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#2a4525';
    ctx.beginPath(); ctx.ellipse(cx, cy-18, 7, 2, 0, 0, Math.PI*2); ctx.fill();
  },

  rotPile(ctx, cx, cy, t, seed){
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.beginPath(); ctx.ellipse(cx, cy, 10, 3, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#3a3018';
    ctx.beginPath(); ctx.ellipse(cx, cy-2, 8, 4, 0, Math.PI, 0); ctx.fill();
    ctx.fillStyle = '#4a4520';
    ctx.beginPath(); ctx.ellipse(cx-1, cy-5, 6, 3, 0, Math.PI, 0); ctx.fill();
    ctx.fillStyle = '#5a5530';
    ctx.beginPath(); ctx.ellipse(cx-1, cy-7, 4, 2, 0, Math.PI, 0); ctx.fill();
    ctx.fillStyle = '#80a040';
    ctx.fillRect((cx-3)|0, (cy-9)|0, 2, 1);
    ctx.fillRect((cx+2)|0, (cy-7)|0, 2, 1);
    ctx.fillStyle = '#aac060';
    ctx.fillRect((cx-3)|0, (cy-8)|0, 1, 2);
    ctx.fillRect((cx+2)|0, (cy-6)|0, 1, 2);
    const fly = Math.sin(t*0.15 + seed);
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect((cx-1+fly*2)|0, (cy-10+Math.cos(t*0.13)*2)|0, 1, 1);
  },

  sporeEmitter(ctx, cx, cy, t, seed){
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath(); ctx.ellipse(cx, cy, 8, 2, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#9aa850';
    ctx.fillRect((cx-2)|0, (cy-12)|0, 4, 12);
    ctx.fillStyle = '#6a7838';
    ctx.fillRect((cx-2)|0, (cy-12)|0, 1, 12);
    ctx.fillStyle = '#8aa040';
    ctx.beginPath(); ctx.ellipse(cx, cy-13, 7, 4, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#aac060';
    ctx.beginPath(); ctx.ellipse(cx-1, cy-14, 4, 2, 0, 0, Math.PI*2); ctx.fill();
    const pulse = Math.sin(t*0.1 + seed) * 0.3 + 0.5;
    ctx.fillStyle = `rgba(220,255,140,${pulse})`;
    ctx.fillRect((cx-1)|0, (cy-13)|0, 2, 2);
    for(let i = 0; i < 4; i++){
      const phase = (t*0.3 + seed*7 + i*8) % 30;
      if(phase < 25){
        const sx = cx + Math.sin(phase*0.3 + i) * 4;
        const sy = cy - 13 - phase*0.7;
        ctx.fillStyle = `rgba(220,255,140,${(25-phase)/25*0.7})`;
        ctx.fillRect(sx|0, sy|0, 1, 1);
      }
    }
  },

  deadTree(ctx, cx, cy, t, seed){
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath(); ctx.ellipse(cx, cy, 7, 2, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#2a1a10';
    ctx.fillRect((cx-2)|0, (cy-22)|0, 4, 22);
    ctx.fillStyle = '#4a2818';
    ctx.fillRect((cx-2)|0, (cy-22)|0, 1, 22);
    ctx.strokeStyle = '#2a1a10';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy-15); ctx.bezierCurveTo(cx-5, cy-18, cx-7, cy-22, cx-9, cy-22);
    ctx.moveTo(cx, cy-12); ctx.bezierCurveTo(cx+5, cy-15, cx+8, cy-18, cx+9, cy-20);
    ctx.moveTo(cx, cy-22); ctx.bezierCurveTo(cx-2, cy-25, cx-3, cy-27, cx-2, cy-29);
    ctx.stroke();
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx-9, cy-22); ctx.lineTo(cx-11, cy-25);
    ctx.moveTo(cx+9, cy-20); ctx.lineTo(cx+11, cy-22);
    ctx.stroke();
    const sway = Math.sin(t*0.05 + seed) * 1;
    ctx.fillStyle = '#aac060';
    ctx.fillRect((cx-10+sway)|0, (cy-26)|0, 2, 2);
  },

  fleshPod(ctx, cx, cy, t, seed){
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath(); ctx.ellipse(cx, cy, 7, 2, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#5a3a3a';
    ctx.beginPath(); ctx.ellipse(cx, cy-9, 7, 9, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#7a4a4a';
    ctx.beginPath(); ctx.ellipse(cx-2, cy-9, 3, 7, 0, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = '#a82540';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx-5, cy-3); ctx.bezierCurveTo(cx-3, cy-8, cx-2, cy-12, cx, cy-15);
    ctx.moveTo(cx+4, cy-2); ctx.bezierCurveTo(cx+3, cy-7, cx+2, cy-12, cx+1, cy-16);
    ctx.stroke();
    const pulse = Math.sin(t*0.06 + seed) * 0.5 + 0.5;
    ctx.fillStyle = `rgba(255,80,40,${0.4 + pulse*0.5})`;
    ctx.beginPath(); ctx.ellipse(cx, cy-10, 2.5, 1.5, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = `rgba(255,200,180,${pulse*0.7})`;
    ctx.fillRect((cx-1)|0, (cy-10)|0, 2, 1);
  },

  vineCluster(ctx, cx, cy, t, seed){
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath(); ctx.ellipse(cx, cy, 8, 2, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#3a4520';
    ctx.beginPath(); ctx.ellipse(cx, cy-1, 5, 3, 0, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = '#5a7035';
    ctx.lineWidth = 2;
    for(let i = 0; i < 5; i++){
      const sway = Math.sin(t*0.04 + seed + i) * 2;
      const startX = cx + (i-2)*2;
      ctx.beginPath();
      ctx.moveTo(startX, cy-2);
      ctx.bezierCurveTo(startX+sway, cy-8, startX-sway, cy-14, startX+sway*0.5, cy-20-i*1.5);
      ctx.stroke();
    }
    ctx.strokeStyle = '#7a9540';
    ctx.lineWidth = 1;
    for(let i = 0; i < 5; i++){
      const sway = Math.sin(t*0.04 + seed + i) * 2;
      const startX = cx + (i-2)*2;
      ctx.beginPath();
      ctx.moveTo(startX, cy-2);
      ctx.bezierCurveTo(startX+sway, cy-8, startX-sway, cy-14, startX+sway*0.5, cy-20-i*1.5);
      ctx.stroke();
    }
    ctx.fillStyle = '#cddc39';
    for(let i = 0; i < 5; i++){
      const sway = Math.sin(t*0.04 + seed + i) * 2;
      ctx.fillRect((cx+(i-2)*2+sway*0.5-1)|0, (cy-20-i*1.5-1)|0, 2, 2);
    }
  },

  plagueCauldron(ctx, cx, cy, t, seed){
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.beginPath(); ctx.ellipse(cx, cy, 10, 3, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.moveTo(cx-9, cy-3); ctx.lineTo(cx+9, cy-3); ctx.lineTo(cx+7, cy-12); ctx.lineTo(cx-7, cy-12);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect((cx-9)|0, (cy-13)|0, 18, 2);
    const wave = Math.sin(t*0.06 + seed) * 1;
    ctx.fillStyle = '#7aa840';
    ctx.fillRect((cx-7)|0, (cy-12+wave)|0, 14, 3);
    ctx.fillStyle = '#a8c860';
    ctx.fillRect((cx-7)|0, (cy-12+wave)|0, 14, 1);
    for(let i = 0; i < 3; i++){
      const phase = (t*0.1 + seed*5 + i*7) % 20;
      if(phase < 15){
        const bx = cx - 5 + i*3 + Math.sin(phase*0.3) * 1;
        const by = cy - 12 - phase*0.5;
        const a = (15-phase)/15;
        ctx.fillStyle = `rgba(180,255,100,${a*0.7})`;
        ctx.beginPath(); ctx.arc(bx, by, 1+phase*0.05, 0, Math.PI*2); ctx.fill();
      }
    }
    const pulse = Math.sin(t*0.04 + seed) * 0.3 + 0.5;
    const grad = ctx.createRadialGradient(cx, cy-10, 2, cx, cy-10, 12);
    grad.addColorStop(0, `rgba(180,255,100,${pulse*0.4})`);
    grad.addColorStop(1, 'rgba(180,255,100,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(cx-12, cy-22, 24, 24);
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect((cx-8)|0, (cy-3)|0, 2, 3);
    ctx.fillRect((cx+6)|0, (cy-3)|0, 2, 3);
  },

};

export default { config, tiles, props };
