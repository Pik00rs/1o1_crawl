// src/js/render/characters/enemies/crimson_boss.js
// CHAMPION DU SANG — BOSS final Crimson.
// Géant 1.5x, scarifications dorées, couronne de crocs, cœur de sang.
import { hexToRgba, shade } from '../iso-utils.js';

export const crimsonBossConfig = {
  id: 'crimson_boss', name: 'CHAMPION DU SANG', archetype: 'crimson_boss',
  bodyColor: '#a87858', accentColor: '#c82828', glowColor: '#ffe060',
  skinColor: '#c89878', hairColor: '#3a1a08', capeColor: '#1a0a05',
  height: 'boss', weapon: 'double_axe',
};

export function drawCrimsonBoss(ctx, cx, cy, actor, time, options = {}){
  const fxLevel = options.fxLevel ?? 1;
  const idle = actor.idle ?? 0;
  const moving = !!actor.target;
  const bob = Math.sin(idle * 0.6) * 0.7;
  const breathe = Math.sin(idle * 0.5) * 0.6;
  const stride = moving ? Math.sin(time * 0.28) * 1.3 : 0;
  cy = cy - 16 + bob; // BOSS — le plus grand

  // ═══ HALO BOSS (rouge + or, large) ═══
  if(fxLevel >= 1){
    const auraPulse = 0.6 + Math.sin(time * 0.05) * 0.15;
    const aura = ctx.createRadialGradient(cx, cy - 4, 4, cx, cy - 4, 28);
    aura.addColorStop(0, hexToRgba(actor.glowColor, auraPulse * 0.5));
    aura.addColorStop(0.4, hexToRgba(actor.accentColor, auraPulse * 0.4));
    aura.addColorStop(0.7, hexToRgba(actor.glowColor, auraPulse * 0.2));
    aura.addColorStop(1, hexToRgba(actor.accentColor, 0));
    ctx.fillStyle = aura;
    ctx.fillRect(cx - 28, cy - 32, 56, 56);
  }

  // Jambes massives
  ctx.fillStyle = actor.capeColor;
  ctx.fillRect(cx - 8, cy + 8 + stride, 6, 11);
  ctx.fillRect(cx + 2, cy + 8 - stride, 6, 11);
  // Bottes avec gold trim
  ctx.fillStyle = '#000';
  ctx.fillRect(cx - 9, cy + 18 + stride, 7, 3);
  ctx.fillRect(cx + 2, cy + 18 - stride, 7, 3);
  ctx.fillStyle = actor.glowColor;
  ctx.fillRect(cx - 9, cy + 20 + stride, 7, 1);
  ctx.fillRect(cx + 2, cy + 20 - stride, 7, 1);

  // Loincloth rags + belt
  ctx.fillStyle = actor.capeColor;
  ctx.fillRect(cx - 9, cy + 5, 18, 4);
  // Strips
  for(let i = 0; i < 5; i++){
    ctx.fillStyle = actor.capeColor;
    ctx.fillRect(cx - 9 + i * 4, cy + 8, 3, 3);
  }
  // Studded belt
  ctx.fillStyle = '#000';
  ctx.fillRect(cx - 10, cy + 3, 20, 3);
  for(let i = 0; i < 6; i++){
    ctx.fillStyle = '#a89878';
    ctx.fillRect(cx - 9 + i * 3.5, cy + 4, 1, 1);
  }
  // Gold buckle with skull
  ctx.fillStyle = '#c8a040';
  ctx.fillRect(cx - 3, cy + 3, 6, 3);
  ctx.fillStyle = '#000';
  ctx.fillRect(cx - 2, cy + 4, 4, 2);
  ctx.fillStyle = actor.glowColor;
  ctx.fillRect(cx - 1, cy + 4, 1, 1);
  ctx.fillRect(cx + 1, cy + 4, 1, 1);

  // ═══ TORSE NU SCARIFIÉ ═══
  ctx.fillStyle = actor.skinColor;
  ctx.beginPath();
  ctx.moveTo(cx - 10, cy + 5);
  ctx.lineTo(cx + 10, cy + 5);
  ctx.lineTo(cx + 9, cy - 11 + breathe);
  ctx.lineTo(cx - 9, cy - 11 + breathe);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = shade(actor.skinColor, -0.3);
  ctx.beginPath();
  ctx.moveTo(cx + 10, cy + 5);
  ctx.lineTo(cx + 9, cy - 11 + breathe);
  ctx.lineTo(cx + 3, cy - 11 + breathe);
  ctx.lineTo(cx + 3, cy + 5);
  ctx.closePath();
  ctx.fill();

  // ═══ SCARIFICATIONS DORÉES (signature) ═══
  const scarPulse = 0.7 + Math.sin(time * 0.08) * 0.3;
  ctx.strokeStyle = hexToRgba(actor.glowColor, scarPulse);
  ctx.lineWidth = 1;
  ctx.beginPath();
  // Diagonales sur les pecs
  ctx.moveTo(cx - 8, cy - 9 + breathe);
  ctx.lineTo(cx - 3, cy - 4 + breathe);
  ctx.moveTo(cx + 8, cy - 9 + breathe);
  ctx.lineTo(cx + 3, cy - 4 + breathe);
  // Horizontales abdo
  ctx.moveTo(cx - 6, cy + 1 + breathe);
  ctx.lineTo(cx + 6, cy + 1 + breathe);
  // Centre vertical
  ctx.moveTo(cx, cy - 7 + breathe);
  ctx.lineTo(cx, cy - 2 + breathe);
  ctx.stroke();
  // Highlights blancs
  ctx.strokeStyle = hexToRgba('#ffffff', scarPulse * 0.5);
  ctx.lineWidth = 0.4;
  ctx.beginPath();
  ctx.moveTo(cx - 8, cy - 9 + breathe);
  ctx.lineTo(cx - 3, cy - 4 + breathe);
  ctx.moveTo(cx + 8, cy - 9 + breathe);
  ctx.lineTo(cx + 3, cy - 4 + breathe);
  ctx.stroke();

  // ═══ CŒUR DE SANG (signature focal point) ═══
  drawBloodHeart(ctx, cx, cy - 7 + breathe, time, actor);

  // Bras massifs
  ctx.fillStyle = actor.skinColor;
  ctx.fillRect(cx - 12, cy - 7 + breathe, 3, 6);
  ctx.fillRect(cx + 9, cy - 7 + breathe, 3, 6);
  // Scars sur biceps
  ctx.strokeStyle = hexToRgba(actor.glowColor, scarPulse);
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(cx - 11, cy - 4 + breathe);
  ctx.lineTo(cx - 9, cy - 4 + breathe);
  ctx.moveTo(cx + 10, cy - 4 + breathe);
  ctx.lineTo(cx + 12, cy - 4 + breathe);
  ctx.stroke();

  // GANTELETS DORÉS (signature)
  ctx.fillStyle = '#c8a040';
  ctx.fillRect(cx - 12, cy - 1 + breathe, 3, 5);
  ctx.fillRect(cx + 9, cy - 1 + breathe, 3, 5);
  ctx.fillStyle = actor.glowColor;
  ctx.fillRect(cx - 12, cy - 1 + breathe, 3, 1);
  ctx.fillRect(cx + 9, cy - 1 + breathe, 3, 1);
  // Red gem on gauntlets
  ctx.fillStyle = actor.accentColor;
  ctx.fillRect(cx - 11, cy + 1 + breathe, 1, 1);
  ctx.fillRect(cx + 10, cy + 1 + breathe, 1, 1);

  // ═══ TÊTE avec beard ═══
  ctx.fillStyle = actor.skinColor;
  ctx.beginPath();
  ctx.ellipse(cx, cy - 16 + breathe, 5, 5.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = shade(actor.skinColor, -0.2);
  ctx.beginPath();
  ctx.ellipse(cx + 2, cy - 16 + breathe, 2.5, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  // Beard épais avec gold rings
  ctx.fillStyle = actor.hairColor;
  ctx.fillRect(cx - 4, cy - 13 + breathe, 8, 4);
  ctx.fillStyle = '#c8a040';
  ctx.fillRect(cx - 3, cy - 11 + breathe, 1, 1);
  ctx.fillRect(cx + 2, cy - 11 + breathe, 1, 1);

  // Yeux intenses rouges
  const eyePulse = 0.92 + Math.sin(time * 0.08) * 0.08;
  ctx.fillStyle = '#000';
  ctx.fillRect(cx - 3, cy - 17 + breathe, 1.5, 1.5);
  ctx.fillRect(cx + 1.5, cy - 17 + breathe, 1.5, 1.5);
  ctx.fillStyle = hexToRgba(actor.accentColor, eyePulse);
  ctx.fillRect(cx - 2.5, cy - 17 + breathe, 1, 1);
  ctx.fillRect(cx + 2, cy - 17 + breathe, 1, 1);
  ctx.fillStyle = hexToRgba('#ffe0e0', eyePulse);
  ctx.fillRect(cx - 2.5, cy - 17 + breathe, 0.5, 0.5);
  ctx.fillRect(cx + 2, cy - 17 + breathe, 0.5, 0.5);

  // Scars dorées sur visage
  ctx.fillStyle = hexToRgba(actor.glowColor, scarPulse);
  ctx.fillRect(cx - 5, cy - 16 + breathe, 0.5, 3);
  ctx.fillRect(cx + 4, cy - 16 + breathe, 0.5, 3);

  // ═══ COURONNE DE CROCS (signature) ═══
  drawFangCrown(ctx, cx, cy - 20 + breathe, time, actor);
}

function drawBloodHeart(ctx, lx, ly, time, actor){
  // Ring extérieur sang sombre
  ctx.fillStyle = '#3a0505';
  ctx.beginPath();
  ctx.arc(lx, ly, 3.5, 0, Math.PI * 2);
  ctx.fill();
  // Ring intermédiaire rouge
  ctx.fillStyle = actor.accentColor;
  ctx.beginPath();
  ctx.arc(lx, ly, 3, 0, Math.PI * 2);
  ctx.fill();
  // Core chaud
  ctx.fillStyle = '#ff4040';
  ctx.beginPath();
  ctx.arc(lx, ly, 2, 0, Math.PI * 2);
  ctx.fill();
  // Core noir
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.arc(lx, ly, 1.2, 0, Math.PI * 2);
  ctx.fill();
  // Étoiles tournantes (or/blanc)
  const corePulse = 0.85 + Math.sin(time * 0.12) * 0.15;
  for(let i = 0; i < 4; i++){
    const angle = (i / 4) * Math.PI * 2 + time * 0.04;
    const r = 0.8;
    const x = lx + Math.cos(angle) * r;
    const y = ly + Math.sin(angle) * r;
    ctx.fillStyle = hexToRgba(i % 2 === 0 ? actor.glowColor : '#ffffff', corePulse);
    ctx.fillRect(Math.round(x), Math.round(y), 0.5, 0.5);
  }
  // Cross beams
  ctx.strokeStyle = hexToRgba(actor.accentColor, corePulse * 0.5);
  ctx.lineWidth = 0.3;
  ctx.beginPath();
  ctx.moveTo(lx - 5, ly); ctx.lineTo(lx + 5, ly);
  ctx.moveTo(lx, ly - 5); ctx.lineTo(lx, ly + 5);
  ctx.stroke();
}

function drawFangCrown(ctx, lx, ly, time, actor){
  // Bandeau noir
  ctx.fillStyle = '#1a0a05';
  ctx.fillRect(lx - 5, ly, 10, 2);
  ctx.fillStyle = actor.capeColor;
  ctx.fillRect(lx - 5, ly, 10, 0.5);

  // 5 crocs (signature)
  const fangs = [-4, -2, 0, 2, 4];
  const heights = [2, 3, 4, 3, 2];
  for(let i = 0; i < fangs.length; i++){
    const dx = fangs[i];
    const h = heights[i];
    ctx.fillStyle = '#7a6850';
    ctx.beginPath();
    ctx.moveTo(lx + dx - 0.7, ly);
    ctx.lineTo(lx + dx + 0.7, ly);
    ctx.lineTo(lx + dx, ly - h);
    ctx.closePath();
    ctx.fill();
    // Highlight white tip
    ctx.fillStyle = '#fff';
    ctx.fillRect(lx + dx - 0.3, ly - h, 0.6, 1);
  }

  // Gem central red
  const gemPulse = 0.85 + Math.sin(time * 0.1) * 0.15;
  ctx.fillStyle = hexToRgba(actor.accentColor, gemPulse);
  ctx.fillRect(lx - 0.5, ly + 0.5, 1, 1);
  ctx.fillStyle = hexToRgba('#ff8080', gemPulse);
  ctx.fillRect(lx - 0.3, ly + 0.5, 0.5, 0.5);
}

export default { drawCrimsonBoss, crimsonBossConfig };
