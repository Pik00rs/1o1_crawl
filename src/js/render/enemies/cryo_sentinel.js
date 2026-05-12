// src/js/render/characters/enemies/cryo_sentinel.js
// Sentinelle de Glace — ÉLITE, armure militaire glacée, visière cyan, hallebarde.
import { hexToRgba, shade } from '../iso-utils.js';

export const cryoSentinelConfig = {
  id: 'cryo_sentinel', name: 'SENTINELLE', archetype: 'cryo_sentinel',
  bodyColor: '#3a5878', accentColor: '#4fc3f7', glowColor: '#aee6ff',
  skinColor: '#5a7898', hairColor: '#28384a', capeColor: '#0a1418',
  height: 'large', weapon: 'halberd',
};

export function drawCryoSentinel(ctx, cx, cy, actor, time, options = {}){
  const fxLevel = options.fxLevel ?? 1;
  const idle = actor.idle ?? 0;
  const moving = !!actor.target;
  const bob = Math.sin(idle * 0.7) * 0.8;
  const breathe = Math.sin(idle * 0.55) * 0.4;
  const stride = moving ? Math.sin(time * 0.3) * 1.2 : 0;
  cy = cy - 13 + bob; // ÉLITE plus grand

  // Halo cyan
  if(fxLevel >= 1){
    const auraPulse = 0.4 + Math.sin(time * 0.06) * 0.1;
    const aura = ctx.createRadialGradient(cx, cy - 2, 2, cx, cy - 2, 18);
    aura.addColorStop(0, hexToRgba(actor.glowColor, auraPulse * 0.5));
    aura.addColorStop(0.5, hexToRgba(actor.accentColor, auraPulse * 0.3));
    aura.addColorStop(1, hexToRgba(actor.accentColor, 0));
    ctx.fillStyle = aura;
    ctx.fillRect(cx - 18, cy - 22, 36, 38);
  }

  // Jambes armurées
  ctx.fillStyle = actor.hairColor;
  ctx.fillRect(cx - 7, cy + 7 + stride, 5, 10);
  ctx.fillRect(cx + 2, cy + 7 - stride, 5, 10);
  ctx.fillStyle = actor.bodyColor;
  ctx.fillRect(cx - 7, cy + 7 + stride, 5, 4);
  ctx.fillRect(cx + 2, cy + 7 - stride, 5, 4);
  // Bottes
  ctx.fillStyle = actor.capeColor;
  ctx.fillRect(cx - 8, cy + 16 + stride, 6, 3);
  ctx.fillRect(cx + 2, cy + 16 - stride, 6, 3);
  ctx.fillStyle = actor.glowColor;
  ctx.fillRect(cx - 8, cy + 18 + stride, 6, 0.5);
  ctx.fillRect(cx + 2, cy + 18 - stride, 6, 0.5);

  // ARMURE TORSE
  ctx.fillStyle = actor.bodyColor;
  ctx.beginPath();
  ctx.moveTo(cx - 9, cy + 7);
  ctx.lineTo(cx + 9, cy + 7);
  ctx.lineTo(cx + 8, cy - 8 + breathe);
  ctx.lineTo(cx - 8, cy - 8 + breathe);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = shade(actor.bodyColor, -0.3);
  ctx.beginPath();
  ctx.moveTo(cx + 9, cy + 7);
  ctx.lineTo(cx + 8, cy - 8 + breathe);
  ctx.lineTo(cx + 3, cy - 8 + breathe);
  ctx.lineTo(cx + 3, cy + 7);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = shade(actor.bodyColor, 0.3);
  ctx.fillRect(cx - 8, cy - 7 + breathe, 2, 14);

  // Fissures cyan brillantes sur armure (signature)
  const crackPulse = 0.85 + Math.sin(time * 0.07) * 0.15;
  ctx.strokeStyle = hexToRgba(actor.accentColor, crackPulse);
  ctx.lineWidth = 0.7;
  ctx.beginPath();
  ctx.moveTo(cx - 6, cy - 6 + breathe);
  ctx.lineTo(cx - 3, cy - 1 + breathe);
  ctx.moveTo(cx + 5, cy - 6 + breathe);
  ctx.lineTo(cx + 2, cy - 1 + breathe);
  ctx.stroke();

  // Épaulettes avec cristaux
  ctx.fillStyle = actor.hairColor;
  ctx.fillRect(cx - 11, cy - 8 + breathe, 3, 4);
  ctx.fillRect(cx + 8, cy - 8 + breathe, 3, 4);
  ctx.fillStyle = actor.bodyColor;
  ctx.fillRect(cx - 11, cy - 8 + breathe, 3, 1);
  ctx.fillRect(cx + 8, cy - 8 + breathe, 3, 1);
  // Cristaux d'épaule
  ctx.fillStyle = shade(actor.accentColor, -0.2);
  ctx.fillRect(cx - 10, cy - 11 + breathe, 1, 2);
  ctx.fillRect(cx + 9, cy - 11 + breathe, 1, 2);
  ctx.fillStyle = actor.glowColor;
  ctx.fillRect(cx - 10, cy - 11 + breathe, 0.5, 1);
  ctx.fillRect(cx + 9, cy - 11 + breathe, 0.5, 1);

  // Bras
  ctx.fillStyle = actor.hairColor;
  ctx.fillRect(cx - 10, cy - 4 + breathe, 3, 8);
  ctx.fillRect(cx + 7, cy - 4 + breathe, 3, 8);
  ctx.fillStyle = actor.capeColor;
  ctx.fillRect(cx - 10, cy + 4 + breathe, 3, 3);
  ctx.fillRect(cx + 7, cy + 4 + breathe, 3, 3);

  // CASQUE FERMÉ militaire (signature)
  ctx.fillStyle = actor.capeColor;
  ctx.fillRect(cx - 6, cy - 18 + breathe, 12, 10);
  ctx.fillStyle = actor.hairColor;
  ctx.fillRect(cx - 6, cy - 18 + breathe, 12, 9);
  // Frost top
  ctx.fillStyle = actor.glowColor;
  ctx.fillRect(cx - 5, cy - 19 + breathe, 10, 1);
  // Petit cristal au sommet
  ctx.fillStyle = shade(actor.accentColor, -0.2);
  ctx.beginPath();
  ctx.moveTo(cx, cy - 20 + breathe);
  ctx.lineTo(cx - 1, cy - 18 + breathe);
  ctx.lineTo(cx + 1, cy - 18 + breathe);
  ctx.closePath();
  ctx.fill();
  // Cheek guards
  ctx.fillStyle = actor.capeColor;
  ctx.fillRect(cx - 6, cy - 11 + breathe, 2, 3);
  ctx.fillRect(cx + 4, cy - 11 + breathe, 2, 3);

  // VISIÈRE CYAN LARGE (signature)
  const visorPulse = 0.85 + Math.sin(time * 0.06) * 0.15;
  ctx.fillStyle = hexToRgba(actor.accentColor, visorPulse);
  ctx.fillRect(cx - 5, cy - 14 + breathe, 10, 2);
  ctx.fillStyle = hexToRgba(actor.glowColor, visorPulse);
  ctx.fillRect(cx - 5, cy - 14 + breathe, 10, 0.5);
  // Reflets
  ctx.fillStyle = '#fff';
  ctx.fillRect(cx - 3, cy - 13.5 + breathe, 1, 0.5);
  ctx.fillRect(cx + 3, cy - 13.5 + breathe, 1, 0.5);

  // HALLEBARDE — sur le côté droit, longue
  // Shaft vertical
  ctx.fillStyle = actor.capeColor;
  ctx.fillRect(cx + 12, cy - 18 + breathe, 1.5, 30);
  ctx.fillStyle = actor.hairColor;
  ctx.fillRect(cx + 12.5, cy - 18 + breathe, 0.5, 30);
  // Axe head de glace en haut
  ctx.fillStyle = shade(actor.accentColor, -0.3);
  ctx.beginPath();
  ctx.moveTo(cx + 13, cy - 18 + breathe);
  ctx.lineTo(cx + 17, cy - 20 + breathe);
  ctx.lineTo(cx + 18, cy - 16 + breathe);
  ctx.lineTo(cx + 13, cy - 14 + breathe);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = actor.accentColor;
  ctx.fillRect(cx + 17, cy - 19 + breathe, 1, 3);
  // Top spike
  ctx.fillStyle = shade(actor.accentColor, -0.3);
  ctx.beginPath();
  ctx.moveTo(cx + 12, cy - 18 + breathe);
  ctx.lineTo(cx + 12.5, cy - 22 + breathe);
  ctx.lineTo(cx + 13.5, cy - 22 + breathe);
  ctx.lineTo(cx + 14, cy - 18 + breathe);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = actor.glowColor;
  ctx.fillRect(cx + 12.7, cy - 22 + breathe, 0.5, 4);
}

export default { drawCryoSentinel, cryoSentinelConfig };
