// src/js/render/characters/enemies/toxic_boss.js
// BÊTE PUTRÉFIÉE — BOSS final Toxic, QUADRUPÈDE.
// Posture quadrupède, pustules violettes dorsales, cœur violet poitrail.
import { hexToRgba, shade } from '../iso-utils.js';

export const toxicBossConfig = {
  id: 'toxic_boss', name: 'BÊTE PUTRÉFIÉE', archetype: 'toxic_boss',
  bodyColor: '#5a7818', accentColor: '#a040a0', glowColor: '#c8e848',
  skinColor: '#7a9828', hairColor: '#3a5018', capeColor: '#5a2848',
  height: 'boss', weapon: 'maw',
};

export function drawToxicBoss(ctx, cx, cy, actor, time, options = {}){
  const fxLevel = options.fxLevel ?? 1;
  const idle = actor.idle ?? 0;
  const moving = !!actor.target;
  const bob = Math.sin(idle * 0.7) * 0.8;
  const breathe = Math.sin(idle * 0.5) * 0.6;
  const stride = moving ? Math.sin(time * 0.35) * 1.5 : 0;
  cy = cy - 8 + bob; // Quadrupède plus bas que humanoïdes

  // ═══ HALO BOSS (vert + violet, large) ═══
  if(fxLevel >= 1){
    const auraPulse = 0.6 + Math.sin(time * 0.05) * 0.15;
    const aura = ctx.createRadialGradient(cx, cy - 2, 4, cx, cy - 2, 30);
    aura.addColorStop(0, hexToRgba(actor.glowColor, auraPulse * 0.4));
    aura.addColorStop(0.3, hexToRgba(actor.accentColor, auraPulse * 0.4));
    aura.addColorStop(0.7, hexToRgba(actor.glowColor, auraPulse * 0.15));
    aura.addColorStop(1, hexToRgba(actor.accentColor, 0));
    ctx.fillStyle = aura;
    ctx.fillRect(cx - 30, cy - 30, 60, 60);
  }

  // Spores ambiants
  if(fxLevel >= 1){
    for(let i = 0; i < 6; i++){
      const t = (time * 0.03 + i * 0.35) % 1;
      const sx = cx + Math.sin(i * 1.5 + time * 0.04) * 12;
      const sy = cy - 8 - t * 16;
      ctx.fillStyle = hexToRgba(actor.accentColor, (1 - t) * 0.6);
      ctx.fillRect(Math.round(sx), Math.round(sy), 1, 1);
    }
  }

  // ═══ 4 PATTES (quadrupède) ═══
  // Pattes avant (gauche, droite)
  ctx.fillStyle = shade(actor.bodyColor, -0.3);
  ctx.fillRect(cx - 11, cy + 4 + stride, 4, 12);
  ctx.fillRect(cx - 5, cy + 4 - stride, 4, 12);
  // Pattes arrière
  ctx.fillRect(cx + 1, cy + 4 + stride, 4, 12);
  ctx.fillRect(cx + 7, cy + 4 - stride, 4, 12);
  // Plaques sur pattes
  ctx.fillStyle = '#5a2848';
  ctx.fillRect(cx - 10, cy + 7 + stride, 2, 2);
  ctx.fillRect(cx + 8, cy + 9 - stride, 2, 2);
  // Griffes
  ctx.fillStyle = '#1a0805';
  for(let leg of [-11, -5, 1, 7]){
    const offset = (leg === -11 || leg === 1) ? stride : -stride;
    for(let c = 0; c < 3; c++){
      ctx.fillRect(cx + leg + c, cy + 16 + offset, 0.8, 2);
    }
  }

  // ═══ CORPS LONG (signature quadrupède) ═══
  ctx.fillStyle = actor.bodyColor;
  ctx.beginPath();
  ctx.ellipse(cx, cy - 1 + breathe, 13, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = shade(actor.bodyColor, -0.3);
  ctx.beginPath();
  ctx.ellipse(cx, cy + 2 + breathe, 13, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  // Top highlight
  ctx.fillStyle = shade(actor.bodyColor, 0.2);
  ctx.beginPath();
  ctx.ellipse(cx, cy - 4 + breathe, 11, 2, 0, 0, Math.PI * 2);
  ctx.fill();

  // ═══ PUSTULES VIOLETTES DORSALES (signature) ═══
  drawDorsalPustules(ctx, cx, cy - 5 + breathe, time, actor);

  // ═══ CŒUR VIOLET POITRAIL (signature focal point) ═══
  drawToxicHeart(ctx, cx - 8, cy + 0 + breathe, time, actor);

  // Plaques nécrosées sur flanc
  ctx.fillStyle = '#5a2848';
  ctx.fillRect(cx - 4, cy + 1 + breathe, 4, 3);
  ctx.fillRect(cx + 4, cy + 0 + breathe, 4, 3);
  ctx.fillStyle = '#8a3a6a';
  ctx.fillRect(cx - 3, cy + 2 + breathe, 1, 1);
  ctx.fillRect(cx + 5, cy + 1 + breathe, 1, 1);

  // Veines pulsantes
  const veinPulse = 0.7 + Math.sin(time * 0.08) * 0.2;
  ctx.strokeStyle = hexToRgba(actor.accentColor, veinPulse);
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(cx - 10, cy + 1 + breathe); ctx.lineTo(cx - 5, cy + 2 + breathe);
  ctx.moveTo(cx + 5, cy + 1 + breathe); ctx.lineTo(cx + 10, cy + 0 + breathe);
  ctx.stroke();

  // ═══ TÊTE MASSIVE (signature) ═══
  // Cou + tête
  ctx.fillStyle = shade(actor.bodyColor, -0.1);
  ctx.fillRect(cx - 16, cy - 6 + breathe, 6, 5);
  // Tête
  ctx.fillStyle = actor.bodyColor;
  ctx.beginPath();
  ctx.ellipse(cx - 17, cy - 4 + breathe, 5, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = shade(actor.bodyColor, -0.3);
  ctx.beginPath();
  ctx.ellipse(cx - 17, cy - 2 + breathe, 5, 2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Plaques violettes tête
  ctx.fillStyle = '#5a2848';
  ctx.fillRect(cx - 19, cy - 6 + breathe, 2, 2);
  ctx.fillRect(cx - 16, cy - 7 + breathe, 2, 2);

  // Cornes courtes
  ctx.fillStyle = '#3a1a08';
  ctx.beginPath();
  ctx.moveTo(cx - 19, cy - 6 + breathe);
  ctx.lineTo(cx - 20, cy - 9 + breathe);
  ctx.lineTo(cx - 18, cy - 6 + breathe);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx - 16, cy - 6 + breathe);
  ctx.lineTo(cx - 15, cy - 9 + breathe);
  ctx.lineTo(cx - 14, cy - 6 + breathe);
  ctx.closePath();
  ctx.fill();

  // YEUX violets brillants (2 yeux)
  const eyePulse = 0.92 + Math.sin(time * 0.09) * 0.08;
  ctx.fillStyle = '#000';
  ctx.fillRect(cx - 19, cy - 4 + breathe, 1.5, 1.5);
  ctx.fillRect(cx - 16, cy - 4 + breathe, 1.5, 1.5);
  ctx.fillStyle = hexToRgba(actor.accentColor, eyePulse);
  ctx.fillRect(cx - 18.7, cy - 4 + breathe, 1, 1);
  ctx.fillRect(cx - 15.7, cy - 4 + breathe, 1, 1);
  ctx.fillStyle = hexToRgba('#e090e0', eyePulse);
  ctx.fillRect(cx - 18.5, cy - 4 + breathe, 0.5, 0.5);
  ctx.fillRect(cx - 15.5, cy - 4 + breathe, 0.5, 0.5);

  // MÂCHOIRE AVEC CROCS (signature)
  ctx.fillStyle = '#000';
  ctx.fillRect(cx - 21, cy - 2 + breathe, 7, 2);
  // Crocs supérieurs
  ctx.fillStyle = '#d8c8a0';
  for(let i = 0; i < 4; i++){
    ctx.beginPath();
    ctx.moveTo(cx - 21 + i * 2, cy - 2 + breathe);
    ctx.lineTo(cx - 20 + i * 2, cy + 1 + breathe);
    ctx.lineTo(cx - 19.5 + i * 2, cy - 2 + breathe);
    ctx.closePath();
    ctx.fill();
  }
  // Saliva
  ctx.fillStyle = hexToRgba(actor.glowColor, 0.85);
  ctx.fillRect(cx - 19, cy + 1 + breathe, 0.5, 2);
  ctx.fillRect(cx - 17, cy + 1 + breathe, 0.5, 1.5);
}

function drawDorsalPustules(ctx, lx, ly, time, actor){
  // 6 pustules le long du dos
  const pustules = [
    [-10, 0], [-6, 0.7], [-2, 1.4], [2, 0], [6, 0.7], [10, 1.4]
  ];
  for(const [dx, offset] of pustules){
    const pulse = 0.7 + Math.sin(time * 0.06 + offset) * 0.3;
    // Base
    ctx.fillStyle = shade(actor.capeColor, -0.3);
    ctx.beginPath();
    ctx.arc(lx + dx, ly, 2, 0, Math.PI * 2);
    ctx.fill();
    // Mid
    ctx.fillStyle = actor.capeColor;
    ctx.beginPath();
    ctx.arc(lx + dx, ly, 1.5, 0, Math.PI * 2);
    ctx.fill();
    // Hot core
    ctx.fillStyle = hexToRgba(actor.accentColor, pulse);
    ctx.beginPath();
    ctx.arc(lx + dx, ly, 1, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = hexToRgba('#e090e0', pulse);
    ctx.fillRect(lx + dx - 0.3, ly - 0.3, 0.5, 0.5);
    // Spore release
    if(((time + dx * 3) % 40) < 5){
      ctx.fillStyle = hexToRgba(actor.accentColor, 0.6);
      ctx.fillRect(lx + dx, ly - 3, 0.5, 0.5);
    }
  }
}

function drawToxicHeart(ctx, lx, ly, time, actor){
  // Ring violet sombre
  ctx.fillStyle = '#2a0828';
  ctx.beginPath();
  ctx.arc(lx, ly, 3.5, 0, Math.PI * 2);
  ctx.fill();
  // Ring violet vif
  ctx.fillStyle = actor.accentColor;
  ctx.beginPath();
  ctx.arc(lx, ly, 3, 0, Math.PI * 2);
  ctx.fill();
  // Core glow
  const pulse = 0.9 + Math.sin(time * 0.08) * 0.1;
  ctx.fillStyle = hexToRgba('#e090e0', pulse);
  ctx.beginPath();
  ctx.arc(lx, ly, 2.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = hexToRgba('#fff', pulse);
  ctx.beginPath();
  ctx.arc(lx, ly, 1.3, 0, Math.PI * 2);
  ctx.fill();
  // Particules orbitales
  for(let i = 0; i < 4; i++){
    const angle = (i / 4) * Math.PI * 2 + time * 0.05;
    const x = lx + Math.cos(angle) * 1.7;
    const y = ly + Math.sin(angle) * 1.7;
    ctx.fillStyle = hexToRgba(actor.accentColor, pulse);
    ctx.fillRect(Math.round(x), Math.round(y), 0.5, 0.5);
  }
  // Cross
  ctx.strokeStyle = hexToRgba(actor.accentColor, pulse * 0.5);
  ctx.lineWidth = 0.3;
  ctx.beginPath();
  ctx.moveTo(lx - 5, ly); ctx.lineTo(lx + 5, ly);
  ctx.moveTo(lx, ly - 5); ctx.lineTo(lx, ly + 5);
  ctx.stroke();
}

export default { drawToxicBoss, toxicBossConfig };
