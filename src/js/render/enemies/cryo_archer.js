// src/js/render/characters/enemies/cryo_archer.js
// Lanceur d'Aiguilles — silhouette mince, cristaux qui orbitent autour des poignets.
import { hexToRgba, shade } from '../../iso-utils.js';

export const cryoArcherConfig = {
  id: 'cryo_archer', name: 'LANCEUR D\'AIGUILLES', archetype: 'cryo_archer',
  bodyColor: '#5a7898', accentColor: '#aee6ff', glowColor: '#e0f5ff',
  skinColor: '#7a98b0', hairColor: '#28384a', capeColor: '#3a5878',
  height: 'small', weapon: 'ice_needle',
};

export function drawCryoArcher(ctx, cx, cy, actor, time, options = {}){
  const fxLevel = options.fxLevel ?? 1;
  const idle = actor.idle ?? 0;
  const moving = !!actor.target;
  const bob = Math.sin(idle * 1.1) * 1.0;
  const breathe = Math.sin(idle * 0.8) * 0.3;
  const stride = moving ? Math.sin(time * 0.45) * 1.3 : 0;
  cy = cy - 10 + bob;

  // Halo cyan
  if(fxLevel >= 1){
    const auraPulse = 0.4 + Math.sin(time * 0.1) * 0.15;
    const aura = ctx.createRadialGradient(cx, cy - 2, 2, cx, cy - 2, 14);
    aura.addColorStop(0, hexToRgba(actor.glowColor, auraPulse * 0.5));
    aura.addColorStop(1, hexToRgba(actor.accentColor, 0));
    ctx.fillStyle = aura;
    ctx.fillRect(cx - 14, cy - 16, 28, 28);
  }

  // Jambes
  ctx.fillStyle = shade(actor.bodyColor, -0.4);
  ctx.fillRect(cx - 5, cy + 6 + stride, 3, 9);
  ctx.fillRect(cx + 2, cy + 6 - stride, 3, 9);
  ctx.fillStyle = '#0a1418';
  ctx.fillRect(cx - 6, cy + 14 + stride, 4, 2);
  ctx.fillRect(cx + 2, cy + 14 - stride, 4, 2);
  // Givre sur bottes
  ctx.fillStyle = actor.glowColor;
  ctx.fillRect(cx - 6, cy + 15 + stride, 4, 0.5);
  ctx.fillRect(cx + 2, cy + 15 - stride, 4, 0.5);

  // Cloak qui pend derrière (droite)
  ctx.fillStyle = actor.capeColor;
  ctx.fillRect(cx + 5, cy - 7 + breathe, 3, 14);
  ctx.fillStyle = shade(actor.capeColor, -0.3);
  ctx.fillRect(cx + 7, cy - 7 + breathe, 1, 14);

  // Torse
  ctx.fillStyle = actor.bodyColor;
  ctx.beginPath();
  ctx.moveTo(cx - 6, cy + 5);
  ctx.lineTo(cx + 6, cy + 5);
  ctx.lineTo(cx + 5, cy - 7 + breathe);
  ctx.lineTo(cx - 5, cy - 7 + breathe);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = shade(actor.bodyColor, 0.2);
  ctx.fillRect(cx - 5, cy - 6 + breathe, 2, 11);
  // Frost veins
  ctx.strokeStyle = hexToRgba(actor.glowColor, 0.6);
  ctx.lineWidth = 0.4;
  ctx.beginPath();
  ctx.moveTo(cx - 2, cy - 5 + breathe);
  ctx.lineTo(cx, cy - 1 + breathe);
  ctx.stroke();

  // Bras
  ctx.fillStyle = shade(actor.bodyColor, -0.2);
  ctx.fillRect(cx - 7, cy - 5 + breathe, 2, 8);
  ctx.fillRect(cx + 5, cy - 5 + breathe, 2, 8);
  // Mains
  ctx.fillStyle = '#1a2838';
  ctx.fillRect(cx - 7, cy + 3 + breathe, 2, 2);
  ctx.fillRect(cx + 5, cy + 3 + breathe, 2, 2);

  // CRISTAUX ORBITANTS aux POIGNETS (signature)
  if(fxLevel >= 1){
    drawWristCrystals(ctx, cx - 6, cy + 4 + breathe, time, actor);
    drawWristCrystals(ctx, cx + 6, cy + 4 + breathe, time + 30, actor);
  }

  // CAPUCHE ample
  ctx.fillStyle = actor.hairColor;
  ctx.beginPath();
  ctx.moveTo(cx - 6, cy - 7 + breathe);
  ctx.lineTo(cx + 6, cy - 7 + breathe);
  ctx.lineTo(cx + 5, cy - 14 + breathe);
  ctx.lineTo(cx + 3, cy - 17 + breathe);
  ctx.lineTo(cx - 3, cy - 17 + breathe);
  ctx.lineTo(cx - 5, cy - 14 + breathe);
  ctx.closePath();
  ctx.fill();
  // Givre
  ctx.fillStyle = actor.accentColor;
  ctx.fillRect(cx - 4, cy - 16 + breathe, 8, 1);
  // Inner shadow
  ctx.fillStyle = '#000';
  ctx.fillRect(cx - 3, cy - 14 + breathe, 6, 5);

  // Yeux cyan
  const eyePulse = 0.85 + Math.sin(time * 0.08) * 0.15;
  ctx.fillStyle = hexToRgba(actor.accentColor, eyePulse);
  ctx.fillRect(cx - 2.5, cy - 12 + breathe, 1.5, 1.5);
  ctx.fillRect(cx + 1, cy - 12 + breathe, 1.5, 1.5);
  ctx.fillStyle = hexToRgba('#fff', eyePulse);
  ctx.fillRect(cx - 2.5, cy - 12 + breathe, 0.5, 0.5);
  ctx.fillRect(cx + 1, cy - 12 + breathe, 0.5, 0.5);
}

function drawWristCrystals(ctx, lx, ly, time, actor){
  // 2 cristaux orbitant
  for(let i = 0; i < 2; i++){
    const angle = (i / 2) * Math.PI * 2 + time * 0.05;
    const r = 2.5;
    const x = lx + Math.cos(angle) * r;
    const y = ly + Math.sin(angle) * r * 0.5;
    ctx.fillStyle = shade(actor.accentColor, -0.3);
    ctx.beginPath();
    ctx.moveTo(x, y - 1.5);
    ctx.lineTo(x - 1, y);
    ctx.lineTo(x, y + 1.5);
    ctx.lineTo(x + 1, y);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = actor.glowColor;
    ctx.fillRect(Math.round(x - 0.3), Math.round(y - 0.3), 0.6, 0.6);
  }
}

export default { drawCryoArcher, cryoArcherConfig };
