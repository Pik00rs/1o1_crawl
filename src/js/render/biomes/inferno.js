// src/js/render/biomes/inferno.js
// Biome Inferno : palette rouge/orange/brun, ambiance fonderie / lave.
//
// Exporte :
//   - config  : couleurs + listes des tile types et props + weights
//   - tiles   : 12 fonctions de rendu pour les détails de tuiles
//   - props   : 8 fonctions de rendu pour les objets sur les murs

import { TILE_W, TILE_H } from '../iso-projection.js';
import { clipToDiamond, prand } from '../iso-utils.js';

// =============================================================================
// CONFIG
// =============================================================================

export const config = {
  id: 'inferno',
  name: 'INFERNO',
  description: 'Fonderie volcanique. Métal rouillé, pierre fissurée, lave.',

  // Sky (gradient haut → bas)
  skyTop: '#2a0d0a',
  skyBot: '#0a0303',

  // Couleurs de base des tuiles (3 tons)
  base:      '#5e2418',
  baseLight: '#7a3525',
  baseDark:  '#3a1610',

  // Accent / glow / ambiance
  accent: '#ffb347',
  glow:   '#ff6f1a',
  ember:  '#ffb347',
  edge:   '#1a0805',

  // Liste ordonnée des 12 tile types disponibles + leurs poids de probabilité
  // (somme normalisée). Index = ordre d'apparition dans tiles{} ci-dessous.
  tileTypes: [
    'metalGrid', 'crackedRock', 'emberTile', 'ashFloor', 'hotVent',
    'rustedPlate', 'boltedFloor', 'obsidian', 'heatPipe', 'scorched',
    'rubble', 'ironTile'
  ],
  tileWeights: [
    0.22, 0.18, 0.10, 0.12, 0.04,
    0.10, 0.08, 0.06, 0.04, 0.03,
    0.02, 0.01
  ],

  // Liste des props (placés sur les tuiles isWall)
  props: [
    'barrel', 'crate', 'bonepile', 'machineCore',
    'torchPost', 'crackedPillar', 'ventPipe', 'gearWheel'
  ],
};

// =============================================================================
// TILE RENDERERS
// =============================================================================
// Signature commune : (ctx, cx, cy, tile, time)
// Le wrapper (drawTileBase) a déjà peint le fond + bevel + bord.
// Ici on ajoute juste les détails du type spécifique.

export const tiles = {

  metalGrid(ctx, cx, cy, tile, t){
    clipToDiamond(ctx, cx, cy, TILE_W, TILE_H);
    ctx.strokeStyle = 'rgba(0,0,0,0.4)';
    ctx.lineWidth = 1;
    for(let i = -2; i <= 2; i++){
      ctx.beginPath();
      ctx.moveTo(cx + i*15, cy - TILE_H/2);
      ctx.lineTo(cx + i*15 + TILE_W/2, cy);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx + i*15, cy + TILE_H/2);
      ctx.lineTo(cx + i*15 + TILE_W/2, cy);
      ctx.stroke();
    }
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    for(let i = -1; i <= 1; i++) for(let j = -1; j <= 1; j++){
      ctx.fillRect((cx + i*15 - 1)|0, (cy + j*8 - 1)|0, 2, 2);
    }
    ctx.restore();
  },

  crackedRock(ctx, cx, cy, tile, t){
    clipToDiamond(ctx, cx, cy, TILE_W, TILE_H);
    for(let i = 0; i < 5; i++){
      const px = cx + (prand(tile.seed, i*1.7) - 0.5) * TILE_W * 0.7;
      const py = cy + (prand(tile.seed, i*2.3) - 0.5) * TILE_H * 0.7;
      const sz = 1 + (prand(tile.seed, i*3.1) * 2.5)|0;
      ctx.fillStyle = 'rgba(0,0,0,0.45)';
      ctx.fillRect((px-sz/2)|0, (py-sz/2+1)|0, sz, 1);
      ctx.fillStyle = `rgba(255,180,100,${0.15 + prand(tile.seed, i*4.1)*0.2})`;
      ctx.fillRect((px-sz/2)|0, (py-sz/2)|0, sz, 1);
    }
    ctx.strokeStyle = `rgba(255,90,30,${0.4 + Math.sin(t*0.04 + tile.seed)*0.2})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx-12, cy-4);
    ctx.lineTo(cx-4, cy+2);
    ctx.lineTo(cx+6, cy-2);
    ctx.lineTo(cx+14, cy+4);
    ctx.stroke();
    ctx.restore();
  },

  emberTile(ctx, cx, cy, tile, t){
    clipToDiamond(ctx, cx, cy, TILE_W, TILE_H);
    for(let i = 0; i < 10; i++){
      const px = cx + (prand(tile.seed, i*2.7) - 0.5) * TILE_W * 0.7;
      const py = cy + (prand(tile.seed, i*3.3) - 0.5) * TILE_H * 0.7;
      const fl = Math.sin(t*0.1 + tile.seed + i)*0.3 + 0.7;
      ctx.fillStyle = `rgba(255,140,40,${0.4*fl})`;
      ctx.fillRect(px|0, py|0, 1, 1);
    }
    ctx.fillStyle = `rgba(255,200,100,${0.15 + Math.sin(t*0.05)*0.05})`;
    ctx.fillRect((cx-14)|0, (cy + Math.sin(t*0.08)*2)|0, 28, 1);
    ctx.restore();
  },

  ashFloor(ctx, cx, cy, tile, t){
    clipToDiamond(ctx, cx, cy, TILE_W, TILE_H);
    for(let i = 0; i < 24; i++){
      const px = cx + (prand(tile.seed, i*1.1) - 0.5) * TILE_W * 0.7;
      const py = cy + (prand(tile.seed, i*1.7) - 0.5) * TILE_H * 0.7;
      const a = prand(tile.seed, i*2.3);
      ctx.fillStyle = `rgba(180,160,140,${0.15 + a*0.2})`;
      ctx.fillRect(px|0, py|0, 1, 1);
    }
    ctx.restore();
  },

  hotVent(ctx, cx, cy, tile, t){
    clipToDiamond(ctx, cx, cy, TILE_W, TILE_H);
    const pulse = (Math.sin(t*0.08 + tile.seed) + 1) * 0.5;
    const r = 6 + pulse * 2;
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    grad.addColorStop(0, 'rgba(255,180,80,0.7)');
    grad.addColorStop(0.5, 'rgba(255,90,30,0.3)');
    grad.addColorStop(1, 'rgba(255,80,30,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(cx-r, cy-r, r*2, r*2);
    ctx.strokeStyle = `rgba(255,120,40,${0.5 + pulse*0.3})`;
    ctx.lineWidth = 1;
    for(let a = 0; a < 4; a++){
      const ang = a*Math.PI/2 + tile.seed*0.1;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(ang)*14, cy + Math.sin(ang)*7);
      ctx.stroke();
    }
    ctx.restore();
  },

  rustedPlate(ctx, cx, cy, tile, t){
    clipToDiamond(ctx, cx, cy, TILE_W, TILE_H);
    for(let i = 0; i < 6; i++){
      const px = cx + (prand(tile.seed, i*3.7) - 0.5) * TILE_W * 0.6;
      const py = cy + (prand(tile.seed, i*5.1) - 0.5) * TILE_H * 0.5;
      ctx.fillStyle = `rgba(160,70,30,${0.3 + prand(tile.seed, i*7.3)*0.3})`;
      ctx.fillRect(px|0, py|0, 3 + (prand(tile.seed, i*9.1)*2)|0, 1);
      ctx.fillStyle = 'rgba(80,40,20,0.3)';
      ctx.fillRect((px+1)|0, (py+1)|0, 2, 1);
    }
    ctx.strokeStyle = 'rgba(0,0,0,0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx - TILE_W/2 + 4, cy - 2);
    ctx.lineTo(cx + TILE_W/2 - 4, cy - 2);
    ctx.stroke();
    ctx.restore();
  },

  boltedFloor(ctx, cx, cy, tile, t){
    clipToDiamond(ctx, cx, cy, TILE_W, TILE_H);
    const cs = [[-12,-4],[8,-4],[-12,4],[8,4],[-2,0]];
    for(const [dx, dy] of cs){
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect((cx+dx-2)|0, (cy+dy-1)|0, 4, 3);
      ctx.fillStyle = 'rgba(60,30,15,0.6)';
      ctx.fillRect((cx+dx-1)|0, (cy+dy)|0, 2, 1);
    }
    ctx.restore();
  },

  obsidian(ctx, cx, cy, tile, t){
    clipToDiamond(ctx, cx, cy, TILE_W, TILE_H);
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.beginPath();
    ctx.moveTo(cx-8, cy-2);
    ctx.lineTo(cx-2, cy-5);
    ctx.lineTo(cx+8, cy-1);
    ctx.lineTo(cx+4, cy+5);
    ctx.lineTo(cx-6, cy+3);
    ctx.closePath();
    ctx.fill();
    const sx = cx + Math.sin(t*0.04 + tile.seed) * 4;
    ctx.fillStyle = 'rgba(180,80,50,0.4)';
    ctx.fillRect((sx-2)|0, (cy-3)|0, 4, 1);
    ctx.restore();
  },

  heatPipe(ctx, cx, cy, tile, t){
    clipToDiamond(ctx, cx, cy, TILE_W, TILE_H);
    ctx.strokeStyle = 'rgba(40,20,10,0.7)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(cx - TILE_W/2 + 8, cy);
    ctx.lineTo(cx + TILE_W/2 - 8, cy);
    ctx.stroke();
    ctx.strokeStyle = `rgba(255,140,60,${0.5 + Math.sin(t*0.1 + tile.seed)*0.3})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx - TILE_W/2 + 8, cy);
    ctx.lineTo(cx + TILE_W/2 - 8, cy);
    ctx.stroke();
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect((cx-12)|0, (cy-1)|0, 2, 2);
    ctx.fillRect((cx+10)|0, (cy-1)|0, 2, 2);
    ctx.restore();
  },

  scorched(ctx, cx, cy, tile, t){
    clipToDiamond(ctx, cx, cy, TILE_W, TILE_H);
    for(let i = 0; i < 3; i++){
      const px = cx + (prand(tile.seed, i*2.3) - 0.5) * TILE_W * 0.6;
      const py = cy + (prand(tile.seed, i*3.1) - 0.5) * TILE_H * 0.5;
      ctx.fillStyle = 'rgba(0,0,0,0.45)';
      ctx.beginPath();
      ctx.ellipse(px, py, 4 + prand(tile.seed, i*5.7)*2, 2, 0, 0, Math.PI*2);
      ctx.fill();
      ctx.fillStyle = `rgba(255,140,40,${0.5 + Math.sin(t*0.1 + i + tile.seed)*0.4})`;
      ctx.fillRect(px|0, py|0, 1, 1);
    }
    ctx.restore();
  },

  rubble(ctx, cx, cy, tile, t){
    clipToDiamond(ctx, cx, cy, TILE_W, TILE_H);
    for(let i = 0; i < 8; i++){
      const px = cx + (prand(tile.seed, i*1.3) - 0.5) * TILE_W * 0.7;
      const py = cy + (prand(tile.seed, i*2.7) - 0.5) * TILE_H * 0.6;
      const sz = 2 + (prand(tile.seed, i*4.1)*2)|0;
      ctx.fillStyle = 'rgba(0,0,0,0.45)';
      ctx.fillRect((px-sz/2)|0, py|0, sz, 1);
      ctx.fillStyle = 'rgba(120,80,60,0.5)';
      ctx.fillRect((px-sz/2)|0, (py-1)|0, sz, 1);
      ctx.fillStyle = 'rgba(180,130,90,0.4)';
      ctx.fillRect((px-sz/2)|0, (py-2)|0, 1, 1);
    }
    ctx.restore();
  },

  ironTile(ctx, cx, cy, tile, t){
    clipToDiamond(ctx, cx, cy, TILE_W, TILE_H);
    ctx.strokeStyle = 'rgba(0,0,0,0.45)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx-12, cy-4);
    ctx.lineTo(cx+12, cy+4);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(220,150,100,0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx-12, cy-5);
    ctx.lineTo(cx+12, cy+3);
    ctx.stroke();
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect((cx-1)|0, (cy-1)|0, 2, 2);
    ctx.restore();
  },

};

// =============================================================================
// PROP RENDERERS
// =============================================================================
// Signature : (ctx, cx, cy, t, seed)

export const props = {

  barrel(ctx, cx, cy, t, seed){
    ctx.fillStyle = '#3a2418';
    ctx.fillRect((cx-7)|0, (cy-18)|0, 14, 18);
    ctx.fillStyle = '#5e3220';
    ctx.fillRect((cx-7)|0, (cy-18)|0, 3, 18);
    ctx.fillStyle = '#1c0e08';
    ctx.fillRect((cx+4)|0, (cy-18)|0, 3, 18);
    ctx.fillStyle = '#1c0e08';
    ctx.fillRect((cx-7)|0, (cy-18)|0, 14, 2);
    ctx.fillRect((cx-7)|0, (cy-2)|0, 14, 2);
    ctx.fillStyle = '#ffb300';
    ctx.fillRect((cx-3)|0, (cy-12)|0, 6, 3);
    ctx.fillStyle = '#000';
    ctx.fillRect((cx-2)|0, (cy-11)|0, 4, 1);
    ctx.fillStyle = '#5e3220';
    ctx.beginPath();
    ctx.ellipse(cx, cy-18, 7, 2, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = '#7a4530';
    ctx.beginPath();
    ctx.ellipse(cx-1, cy-18, 4, 1, 0, 0, Math.PI*2);
    ctx.fill();
    const fl = Math.sin(t*0.1 + seed) * 0.5 + 0.5;
    ctx.fillStyle = `rgba(255,140,40,${0.3 + fl*0.4})`;
    ctx.fillRect((cx-1)|0, (cy-7)|0, 2, 4);
  },

  crate(ctx, cx, cy, t, seed){
    const h = 18, w = 22;
    ctx.fillStyle = '#3a2210';
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx+w/2, cy-h/2);
    ctx.lineTo(cx+w/2, cy-h/2 - h*0.7);
    ctx.lineTo(cx, cy - h*0.7);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#5a3520';
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx-w/2, cy-h/2);
    ctx.lineTo(cx-w/2, cy-h/2 - h*0.7);
    ctx.lineTo(cx, cy - h*0.7);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#7a4a2a';
    ctx.beginPath();
    ctx.moveTo(cx, cy - h*0.7);
    ctx.lineTo(cx-w/2, cy-h/2 - h*0.7);
    ctx.lineTo(cx, cy - h - h*0.7 + h/2);
    ctx.lineTo(cx+w/2, cy-h/2 - h*0.7);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx-w/2, cy-h/2 - h*0.4);
    ctx.lineTo(cx, cy - h*0.4);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx+w/2, cy-h/2 - h*0.4);
    ctx.lineTo(cx, cy - h*0.4);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx, cy - h*0.7);
    ctx.stroke();
    ctx.fillStyle = '#1a0a08';
    ctx.fillRect((cx-w/2-1)|0, (cy-h/2-h*0.7)|0, 3, 3);
    ctx.fillRect((cx+w/2-2)|0, (cy-h/2-h*0.7)|0, 3, 3);
  },

  bonepile(ctx, cx, cy, t, seed){
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.beginPath();
    ctx.ellipse(cx, cy, 12, 3, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = '#d4c4a0';
    ctx.beginPath();
    ctx.ellipse(cx-2, cy-2, 9, 2, 0.2, 0, Math.PI*2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx+1, cy-3, 8, 2, -0.3, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = '#e8dab0';
    ctx.fillRect((cx-10)|0, (cy-3)|0, 2, 2);
    ctx.fillRect((cx+8)|0, (cy-4)|0, 2, 2);
    ctx.beginPath();
    ctx.arc(cx-3, cy-9, 5, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.fillRect((cx-5)|0, (cy-9)|0, 2, 2);
    ctx.fillRect((cx-2)|0, (cy-9)|0, 2, 2);
    ctx.fillRect((cx-3)|0, (cy-6)|0, 1, 1);
    ctx.fillRect((cx-2)|0, (cy-6)|0, 1, 1);
  },

  machineCore(ctx, cx, cy, t, seed){
    ctx.fillStyle = '#222';
    ctx.fillRect((cx-9)|0, (cy-22)|0, 18, 22);
    ctx.fillStyle = '#333';
    ctx.fillRect((cx-9)|0, (cy-22)|0, 3, 22);
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect((cx+6)|0, (cy-22)|0, 3, 22);
    ctx.fillStyle = '#444';
    ctx.fillRect((cx-9)|0, (cy-22)|0, 18, 2);
    const pulse = Math.sin(t*0.08 + seed) * 0.3 + 0.7;
    const grad = ctx.createRadialGradient(cx, cy-12, 0, cx, cy-12, 8);
    grad.addColorStop(0, `rgba(255,160,40,${pulse})`);
    grad.addColorStop(1, 'rgba(255,80,20,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(cx-8, cy-20, 16, 16);
    ctx.fillStyle = `rgba(255,200,80,${pulse})`;
    ctx.fillRect((cx-2)|0, (cy-13)|0, 4, 2);
    ctx.fillStyle = '#555';
    ctx.fillRect((cx-3)|0, (cy-22)|0, 6, 2);
    ctx.fillStyle = Math.sin(t*0.15) > 0 ? '#4caf50' : '#1a3a1a';
    ctx.fillRect((cx-7)|0, (cy-3)|0, 2, 2);
    ctx.fillStyle = Math.sin(t*0.13 + 1) > 0 ? '#f44336' : '#3a1a1a';
    ctx.fillRect((cx+5)|0, (cy-3)|0, 2, 2);
  },

  torchPost(ctx, cx, cy, t, seed){
    ctx.fillStyle = '#222';
    ctx.fillRect((cx-1)|0, (cy-20)|0, 2, 20);
    ctx.fillStyle = '#333';
    ctx.fillRect((cx-3)|0, (cy-2)|0, 6, 2);
    ctx.fillStyle = '#444';
    ctx.fillRect((cx-3)|0, (cy-22)|0, 6, 3);
    const flicker = Math.sin(t*0.3 + seed) * 1 + (Math.random()-0.5)*0.5;
    const fh = 8 + flicker;
    ctx.fillStyle = '#ff6f1a';
    ctx.beginPath();
    ctx.moveTo(cx, cy-22-fh);
    ctx.bezierCurveTo(cx-3, cy-22-fh*0.5, cx-3, cy-22, cx, cy-22);
    ctx.bezierCurveTo(cx+3, cy-22, cx+3, cy-22-fh*0.5, cx, cy-22-fh);
    ctx.fill();
    ctx.fillStyle = '#ffb300';
    ctx.beginPath();
    ctx.moveTo(cx, cy-22-fh*0.7);
    ctx.bezierCurveTo(cx-2, cy-22-fh*0.3, cx-2, cy-22, cx, cy-22);
    ctx.bezierCurveTo(cx+2, cy-22, cx+2, cy-22-fh*0.3, cx, cy-22-fh*0.7);
    ctx.fill();
    ctx.fillStyle = '#fff5b0';
    ctx.fillRect((cx-1)|0, (cy-22-fh*0.4)|0, 2, 2);
    const grad = ctx.createRadialGradient(cx, cy-22, 2, cx, cy-22, 18);
    grad.addColorStop(0, 'rgba(255,140,40,0.3)');
    grad.addColorStop(1, 'rgba(255,80,20,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(cx-18, cy-22-18, 36, 36);
  },

  crackedPillar(ctx, cx, cy, t, seed){
    ctx.fillStyle = '#3a2218';
    ctx.fillRect((cx-5)|0, (cy-24)|0, 10, 24);
    ctx.fillStyle = '#5a3a28';
    ctx.fillRect((cx-5)|0, (cy-24)|0, 2, 24);
    ctx.fillStyle = '#1a0e08';
    ctx.fillRect((cx+3)|0, (cy-24)|0, 2, 24);
    ctx.fillStyle = '#7a5238';
    ctx.fillRect((cx-7)|0, (cy-25)|0, 14, 3);
    ctx.fillStyle = '#5a3a28';
    ctx.fillRect((cx-7)|0, (cy-2)|0, 14, 3);
    ctx.strokeStyle = 'rgba(0,0,0,0.6)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx-2, cy-22);
    ctx.lineTo(cx, cy-15);
    ctx.lineTo(cx-1, cy-8);
    ctx.lineTo(cx+2, cy-3);
    ctx.stroke();
    ctx.strokeStyle = `rgba(255,140,40,${0.4 + Math.sin(t*0.05 + seed)*0.2})`;
    ctx.beginPath();
    ctx.moveTo(cx-2, cy-22);
    ctx.lineTo(cx, cy-15);
    ctx.lineTo(cx-1, cy-8);
    ctx.stroke();
  },

  ventPipe(ctx, cx, cy, t, seed){
    ctx.fillStyle = '#3a2818';
    ctx.fillRect((cx-3)|0, (cy-16)|0, 6, 16);
    ctx.fillStyle = '#5a4030';
    ctx.fillRect((cx-3)|0, (cy-16)|0, 1, 16);
    ctx.fillStyle = '#5a4030';
    ctx.beginPath();
    ctx.moveTo(cx-6, cy-20);
    ctx.lineTo(cx+6, cy-20);
    ctx.lineTo(cx+3, cy-16);
    ctx.lineTo(cx-3, cy-16);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#1a0e08';
    ctx.fillRect((cx-2)|0, (cy-10)|0, 1, 1);
    ctx.fillRect((cx+1)|0, (cy-10)|0, 1, 1);
    ctx.fillRect((cx-2)|0, (cy-5)|0, 1, 1);
    ctx.fillRect((cx+1)|0, (cy-5)|0, 1, 1);
    const phase = (t*0.05 + seed) % (Math.PI*2);
    for(let i = 0; i < 3; i++){
      const off = (phase + i*1.5) % (Math.PI*2);
      if(off < Math.PI){
        const py = cy-20 - off*8;
        const a = Math.sin(off) * 0.5;
        ctx.fillStyle = `rgba(200,180,160,${a})`;
        ctx.beginPath();
        ctx.arc(cx + Math.sin(off*2)*2, py, 2 + off, 0, Math.PI*2);
        ctx.fill();
      }
    }
  },

  gearWheel(ctx, cx, cy, t, seed){
    const angle = t*0.02 + seed;
    ctx.save();
    ctx.translate(cx, cy-10);
    ctx.rotate(angle);
    ctx.fillStyle = '#3a2818';
    ctx.beginPath();
    ctx.arc(0, 0, 8, 0, Math.PI*2);
    ctx.fill();
    for(let i = 0; i < 8; i++){
      const ang = i*Math.PI/4;
      ctx.fillStyle = '#5a3818';
      ctx.fillRect(Math.cos(ang)*8 - 1, Math.sin(ang)*8 - 1, 2, 3);
    }
    ctx.fillStyle = '#1a0e08';
    ctx.beginPath();
    ctx.arc(0, 0, 3, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = '#7a4828';
    ctx.fillRect(-1, -1, 2, 2);
    ctx.restore();
    ctx.fillStyle = '#222';
    ctx.fillRect((cx-1)|0, (cy-10)|0, 2, 10);
  },

};

// Export par défaut pour faciliter l'import dans le registre
export default { config, tiles, props };
