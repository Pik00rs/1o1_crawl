// src/js/render/characters/enemies/inferno_brute.js
// Brûlant — silhouette voûtée avec casque de soudeur à fente incandescente,
// gantelet de forge, fissures orange sur le corps.
import { hexToRgba, shade } from '../iso-utils.js';

export const infernoBruteConfig = {
  id: 'inferno_brute', name: 'BRÛLANT', archetype: 'inferno_brute',
  bodyColor: '#5e2418', accentColor: '#ff6f1a', glowColor: '#ffb347',
  skinColor: '#a06850', hairColor: '#1a0805', capeColor: '#3a1610',
  height: 'medium', weapon: 'gauntlet',
};

export function drawInfernoBrute(ctx, cx, cy, actor, time, options = {}){
  const fxLevel = options.fxLevel ?? 1;
  const idle = actor.idle ?? 0;
  const moving = !!actor.target;
  const bob = Math.sin(idle * 0.9) * 1.0;
  const breathe = Math.sin(idle * 0.7) * 0.4;
  const stride = moving ? Math.sin(time * 0.4) * 1.4 : 0;
  cy = cy - 11 + bob;

  // Halo orange feu
  if(fxLevel >= 1){
    const auraPulse = 0.4 + Math.sin(time * 0.07) * 0.15;
    const aura = ctx.createRadialGradient(cx, cy - 2, 2, cx, cy - 2, 16);
    aura.addColorStop(0, hexToRgba(actor.glowColor, auraPulse * 0.5));
    aura.addColorStop(0.6, hexToRgba(actor.accentColor, auraPulse * 0.3));
    aura.addColorStop(1, hexToRgba(actor.accentColor, 0));
    ctx.fillStyle = aura;
    ctx.fillRect(cx - 16, cy - 18, 32, 32);
  }

  // Jambes
  ctx.fillStyle = shade(actor.bodyColor, -0.3);
  ctx.fillRect(cx - 6, cy + 6 + stride, 4, 9);
  ctx.fillRect(cx + 2, cy + 6 - stride, 4, 9);
  ctx.fillStyle = actor.hairColor;
  ctx.fillRect(cx - 7, cy + 14 + stride, 5, 2);
  ctx.fillRect(cx + 2, cy + 14 - stride, 5, 2);
  ctx.fillStyle = actor.accentColor;
  ctx.fillRect(cx - 7, cy + 15 + stride, 5, 1);
  ctx.fillRect(cx + 2, cy + 15 - stride, 5, 1);

  // Torse (combinaison)
  ctx.fillStyle = actor.bodyColor;
  ctx.beginPath();
  ctx.moveTo(cx - 8, cy + 5);
  ctx.lineTo(cx + 8, cy + 5);
  ctx.lineTo(cx + 7, cy - 8 + breathe);
  ctx.lineTo(cx - 7, cy - 8 + breathe);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = shade(actor.bodyColor, -0.3);
  ctx.beginPath();
  ctx.moveTo(cx + 8, cy + 5);
  ctx.lineTo(cx + 7, cy - 8 + breathe);
  ctx.lineTo(cx + 2, cy - 8 + breathe);
  ctx.lineTo(cx + 2, cy + 5);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = shade(actor.bodyColor, 0.25);
  ctx.fillRect(cx - 7, cy - 7 + breathe, 2, 12);

  // FISSURES ORANGE (signature)
  const crackPulse = 0.7 + Math.sin(time * 0.06) * 0.3;
  ctx.strokeStyle = hexToRgba(actor.accentColor, crackPulse);
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(cx - 5, cy - 6 + breathe);
  ctx.lineTo(cx - 3, cy - 2 + breathe);
  ctx.lineTo(cx - 5, cy + 2 + breathe);
  ctx.moveTo(cx + 4, cy - 5 + breathe);
  ctx.lineTo(cx + 2, cy - 1 + breathe);
  ctx.lineTo(cx + 5, cy + 3 + breathe);
  ctx.stroke();
  // Hot streak
  ctx.strokeStyle = hexToRgba(actor.glowColor, crackPulse);
  ctx.lineWidth = 0.4;
  ctx.beginPath();
  ctx.moveTo(cx, cy - 5 + breathe);
  ctx.lineTo(cx, cy + 1 + breathe);
  ctx.stroke();

  // Bras (peau visible bas)
  ctx.fillStyle = shade(actor.bodyColor, -0.1);
  ctx.fillRect(cx - 9, cy - 5 + breathe, 2, 5);
  ctx.fillStyle = actor.skinColor;
  ctx.fillRect(cx - 9, cy + 0 + breathe, 2, 4);

  // GANTELET DE FORGE (signature) — bras droit
  ctx.fillStyle = '#4a2a18';
  ctx.fillRect(cx + 7, cy - 5 + breathe, 3, 10);
  ctx.fillStyle = '#7a4528';
  ctx.fillRect(cx + 7, cy - 5 + breathe, 3, 2);
  ctx.fillStyle = '#2a140a';
  ctx.fillRect(cx + 9, cy - 5 + breathe, 1, 10);
  // Veines de métal en fusion
  ctx.strokeStyle = hexToRgba(actor.glowColor, crackPulse);
  ctx.lineWidth = 0.3;
  ctx.beginPath();
  ctx.moveTo(cx + 7, cy - 3 + breathe); ctx.lineTo(cx + 10, cy - 3 + breathe);
  ctx.moveTo(cx + 7, cy + 0 + breathe); ctx.lineTo(cx + 10, cy + 0 + breathe);
  ctx.moveTo(cx + 7, cy + 3 + breathe); ctx.lineTo(cx + 10, cy + 3 + breathe);
  ctx.stroke();

  // CASQUE DE SOUDEUR (signature)
  ctx.fillStyle = actor.hairColor;
  ctx.fillRect(cx - 7, cy - 17 + breathe, 14, 9);
  ctx.fillStyle = '#3a1810';
  ctx.fillRect(cx - 7, cy - 17 + breathe, 14, 2);
  // Rivets
  ctx.fillStyle = actor.glowColor;
  ctx.fillRect(cx - 7, cy - 14 + breathe, 1, 1);
  ctx.fillRect(cx + 6, cy - 14 + breathe, 1, 1);

  // FENTE INCANDESCENTE (signature)
  const slitPulse = 0.85 + Math.sin(time * 0.05) * 0.15;
  ctx.fillStyle = hexToRgba(actor.accentColor, slitPulse);
  ctx.fillRect(cx - 5, cy - 13 + breathe, 10, 1.5);
  ctx.fillStyle = hexToRgba(actor.glowColor, slitPulse);
  ctx.fillRect(cx - 5, cy - 13 + breathe, 10, 0.5);
  // Reflets
  ctx.fillStyle = '#fff';
  ctx.fillRect(cx - 3, cy - 12.5 + breathe, 1, 0.5);
  ctx.fillRect(cx + 2, cy - 12.5 + breathe, 1, 0.5);
}

export default { drawInfernoBrute, infernoBruteConfig };
