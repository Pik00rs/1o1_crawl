// src/js/render/characters/enemies/cryo_boss.js
// CRYO-REINE — BOSS final Cryo.
// Lévite, robe blanche-bleue, couronne de cristal, cœur de glace.
import { hexToRgba, shade } from '../iso-utils.js';

export const cryoBossConfig = {
  id: 'cryo_boss', name: 'CRYO-REINE', archetype: 'cryo_boss',
  bodyColor: '#e0eef5', accentColor: '#4fc3f7', glowColor: '#aee6ff',
  skinColor: '#d8e4f0', hairColor: '#c0d0e0', capeColor: '#7898b0',
  height: 'boss', weapon: 'ice_aura',
};

export function drawCryoBoss(ctx, cx, cy, actor, time, options = {}){
  const fxLevel = options.fxLevel ?? 1;
  const idle = actor.idle ?? 0;
  const moving = !!actor.target;
  const float = Math.sin(idle * 0.6) * 1.5;
  const sway = Math.sin(idle * 0.5 + 1.2) * 0.6;
  const breathe = Math.sin(idle * 0.5) * 0.4;
  cy = cy - 18 + float; // LÉVITATION + BOSS — le plus haut
  cx = Math.round(cx + sway);

  // ═══ HALO BOSS (cyan + blanc, large) ═══
  if(fxLevel >= 1){
    const auraPulse = 0.6 + Math.sin(time * 0.05) * 0.15;
    const aura = ctx.createRadialGradient(cx, cy - 4, 4, cx, cy - 4, 32);
    aura.addColorStop(0, hexToRgba('#ffffff', auraPulse * 0.5));
    aura.addColorStop(0.3, hexToRgba(actor.glowColor, auraPulse * 0.4));
    aura.addColorStop(0.7, hexToRgba(actor.accentColor, auraPulse * 0.2));
    aura.addColorStop(1, hexToRgba(actor.accentColor, 0));
    ctx.fillStyle = aura;
    ctx.fillRect(cx - 32, cy - 36, 64, 64);
  }

  // Pas de jambes — robe descend très bas (lévitation)
  // ROBE INFÉRIEURE qui s'évase (signature)
  ctx.fillStyle = actor.capeColor;
  const flow = Math.sin(time * 0.05) * 1.5;
  ctx.beginPath();
  ctx.moveTo(cx - 12 - flow, cy + 18);
  ctx.lineTo(cx + 12 + flow, cy + 18);
  ctx.lineTo(cx + 7, cy - 6 + breathe);
  ctx.lineTo(cx - 7, cy - 6 + breathe);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = shade(actor.capeColor, 0.3);
  ctx.fillRect(cx - 7, cy - 6 + breathe, 2, 24);
  ctx.fillStyle = shade(actor.capeColor, -0.2);
  ctx.fillRect(cx + 5, cy - 6 + breathe, 2, 24);

  // Crystal hem (pointes en bas — signature)
  for(let i = -3; i <= 3; i++){
    const xpos = cx + i * 3 + flow * 0.3;
    const hpulse = 0.7 + Math.sin(time * 0.1 + i) * 0.3;
    ctx.fillStyle = actor.accentColor;
    ctx.beginPath();
    ctx.moveTo(xpos - 1, cy + 18);
    ctx.lineTo(xpos, cy + 21);
    ctx.lineTo(xpos + 1, cy + 18);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = hexToRgba('#ffffff', hpulse);
    ctx.fillRect(xpos - 0.3, cy + 19, 0.5, 1);
  }

  // Folds robe
  ctx.strokeStyle = hexToRgba(actor.accentColor, 0.4);
  ctx.lineWidth = 0.4;
  ctx.beginPath();
  ctx.moveTo(cx - 5, cy + 17); ctx.lineTo(cx - 3, cy - 5 + breathe);
  ctx.moveTo(cx, cy + 18); ctx.lineTo(cx, cy - 5 + breathe);
  ctx.moveTo(cx + 5, cy + 17); ctx.lineTo(cx + 3, cy - 5 + breathe);
  ctx.stroke();

  // ═══ CORSAGE ═══
  ctx.fillStyle = actor.bodyColor;
  ctx.beginPath();
  ctx.moveTo(cx - 8, cy - 6 + breathe);
  ctx.lineTo(cx + 8, cy - 6 + breathe);
  ctx.lineTo(cx + 7, cy - 16 + breathe);
  ctx.lineTo(cx - 7, cy - 16 + breathe);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = shade(actor.bodyColor, 0.1);
  ctx.fillRect(cx - 7, cy - 16 + breathe, 2, 10);

  // Frost veins
  ctx.strokeStyle = hexToRgba(actor.accentColor, 0.6);
  ctx.lineWidth = 0.6;
  ctx.beginPath();
  ctx.moveTo(cx - 6, cy - 13 + breathe);
  ctx.lineTo(cx - 4, cy - 10 + breathe);
  ctx.lineTo(cx - 6, cy - 7 + breathe);
  ctx.moveTo(cx + 6, cy - 13 + breathe);
  ctx.lineTo(cx + 4, cy - 10 + breathe);
  ctx.lineTo(cx + 6, cy - 7 + breathe);
  ctx.stroke();

  // ═══ CŒUR DE GLACE (signature focal point) ═══
  drawIceHeart(ctx, cx, cy - 11 + breathe, time, actor);

  // Sleeves (manches)
  ctx.fillStyle = actor.capeColor;
  ctx.beginPath();
  ctx.moveTo(cx - 8, cy - 15 + breathe);
  ctx.lineTo(cx - 5, cy - 15 + breathe);
  ctx.lineTo(cx - 6, cy - 3 + breathe);
  ctx.lineTo(cx - 9, cy - 3 + breathe);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx + 5, cy - 15 + breathe);
  ctx.lineTo(cx + 8, cy - 15 + breathe);
  ctx.lineTo(cx + 9, cy - 3 + breathe);
  ctx.lineTo(cx + 6, cy - 3 + breathe);
  ctx.closePath();
  ctx.fill();
  // Mains gantées blanches
  ctx.fillStyle = '#fff';
  ctx.fillRect(cx - 9, cy - 3 + breathe, 3, 3);
  ctx.fillRect(cx + 6, cy - 3 + breathe, 3, 3);
  // Halo aux mains (signature)
  const handPulse = 0.85 + Math.sin(time * 0.1) * 0.15;
  const lhGrad = ctx.createRadialGradient(cx - 8, cy + 0 + breathe, 0, cx - 8, cy + 0 + breathe, 5);
  lhGrad.addColorStop(0, hexToRgba('#fff', handPulse * 0.8));
  lhGrad.addColorStop(1, hexToRgba(actor.accentColor, 0));
  ctx.fillStyle = lhGrad;
  ctx.fillRect(cx - 13, cy - 5 + breathe, 10, 10);
  const rhGrad = ctx.createRadialGradient(cx + 8, cy + 0 + breathe, 0, cx + 8, cy + 0 + breathe, 5);
  rhGrad.addColorStop(0, hexToRgba('#fff', handPulse * 0.8));
  rhGrad.addColorStop(1, hexToRgba(actor.accentColor, 0));
  ctx.fillStyle = rhGrad;
  ctx.fillRect(cx + 3, cy - 5 + breathe, 10, 10);

  // ═══ TÊTE pâle ═══
  ctx.fillStyle = actor.skinColor;
  ctx.beginPath();
  ctx.ellipse(cx, cy - 22 + breathe, 5, 5.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = shade(actor.skinColor, -0.15);
  ctx.beginPath();
  ctx.ellipse(cx + 1.5, cy - 22 + breathe, 2.5, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Cheveux longs (signature)
  ctx.fillStyle = actor.hairColor;
  ctx.fillRect(cx - 7, cy - 22 + breathe, 2, 12);
  ctx.fillRect(cx + 5, cy - 22 + breathe, 2, 12);
  ctx.fillStyle = shade(actor.hairColor, 0.3);
  ctx.fillRect(cx - 7, cy - 22 + breathe, 1, 12);

  // Yeux cyan
  const eyePulse = 0.92 + Math.sin(time * 0.09) * 0.08;
  ctx.fillStyle = '#000';
  ctx.fillRect(cx - 3, cy - 23 + breathe, 1.5, 1.5);
  ctx.fillRect(cx + 1.5, cy - 23 + breathe, 1.5, 1.5);
  ctx.fillStyle = hexToRgba(actor.accentColor, eyePulse);
  ctx.fillRect(cx - 3, cy - 23 + breathe, 1, 1);
  ctx.fillRect(cx + 1.5, cy - 23 + breathe, 1, 1);
  ctx.fillStyle = hexToRgba('#fff', eyePulse);
  ctx.fillRect(cx - 3, cy - 23 + breathe, 0.5, 0.5);

  // Lèvres
  ctx.fillStyle = actor.accentColor;
  ctx.fillRect(cx - 1.5, cy - 20 + breathe, 3, 0.5);

  // ═══ COURONNE DE CRISTAL ACÉRÉE (signature) ═══
  drawIceCrown(ctx, cx, cy - 26 + breathe, time, actor);
}

function drawIceHeart(ctx, lx, ly, time, actor){
  // Ring cyan
  ctx.fillStyle = actor.accentColor;
  ctx.beginPath();
  ctx.arc(lx, ly, 3.5, 0, Math.PI * 2);
  ctx.fill();
  // Dark inner
  ctx.fillStyle = '#0a1418';
  ctx.beginPath();
  ctx.arc(lx, ly, 2.8, 0, Math.PI * 2);
  ctx.fill();
  // Core
  const pulse = 0.9 + Math.sin(time * 0.08) * 0.1;
  ctx.fillStyle = hexToRgba(actor.glowColor, pulse);
  ctx.beginPath();
  ctx.arc(lx, ly, 2.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = hexToRgba('#ffffff', pulse);
  ctx.beginPath();
  ctx.arc(lx, ly, 1.3, 0, Math.PI * 2);
  ctx.fill();
  // Tiny rotating particles
  for(let i = 0; i < 3; i++){
    const angle = (i / 3) * Math.PI * 2 + time * 0.04;
    const x = lx + Math.cos(angle) * 1.6;
    const y = ly + Math.sin(angle) * 1.6;
    ctx.fillStyle = hexToRgba(actor.accentColor, pulse);
    ctx.fillRect(Math.round(x), Math.round(y), 0.5, 0.5);
  }
  // Cross beams (snowflake)
  ctx.strokeStyle = hexToRgba(actor.glowColor, pulse * 0.6);
  ctx.lineWidth = 0.3;
  ctx.beginPath();
  ctx.moveTo(lx - 5, ly); ctx.lineTo(lx + 5, ly);
  ctx.moveTo(lx, ly - 5); ctx.lineTo(lx, ly + 5);
  ctx.moveTo(lx - 4, ly - 4); ctx.lineTo(lx + 4, ly + 4);
  ctx.moveTo(lx + 4, ly - 4); ctx.lineTo(lx - 4, ly + 4);
  ctx.stroke();
}

function drawIceCrown(ctx, lx, ly, time, actor){
  // Base band
  ctx.fillStyle = shade(actor.accentColor, -0.3);
  ctx.fillRect(lx - 4, ly, 8, 2);
  // Front central spike (largest)
  ctx.fillStyle = shade(actor.accentColor, -0.3);
  ctx.beginPath();
  ctx.moveTo(lx, ly - 5);
  ctx.lineTo(lx - 1, ly);
  ctx.lineTo(lx + 1, ly);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.fillRect(lx - 0.3, ly - 4, 0.5, 3);
  // Side spikes
  for(let side = -1; side <= 1; side += 2){
    for(let i = 1; i <= 2; i++){
      const sx = lx + side * (i * 1.3);
      const h = 4 - i;
      ctx.fillStyle = shade(actor.accentColor, -0.3);
      ctx.beginPath();
      ctx.moveTo(sx, ly - h);
      ctx.lineTo(sx - 0.7, ly);
      ctx.lineTo(sx + 0.7, ly);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.fillRect(sx - 0.2, ly - h + 0.5, 0.4, h - 0.5);
    }
  }
  // Gem central
  const pulse = 0.85 + Math.sin(time * 0.1) * 0.15;
  ctx.fillStyle = hexToRgba(actor.glowColor, pulse);
  ctx.fillRect(lx - 0.7, ly + 0.5, 1.5, 1);
}

export default { drawCryoBoss, cryoBossConfig };
