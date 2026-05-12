// src/js/render/characters/enemies/crimson_butcher.js
// Boucher — silhouette massive, tablier de cuir taché, masque de cuir, couperet.
import { hexToRgba, shade } from '../iso-utils.js';

export const crimsonButcherConfig = {
  id: 'crimson_butcher', name: 'BOUCHER', archetype: 'crimson_butcher',
  bodyColor: '#a87858', accentColor: '#5a0808', glowColor: '#a02828',
  skinColor: '#c89878', hairColor: '#1a0a05', capeColor: '#3a1a08',
  height: 'large', weapon: 'cleaver',
};

export function drawCrimsonButcher(ctx, cx, cy, actor, time, options = {}){
  const fxLevel = options.fxLevel ?? 1;
  const idle = actor.idle ?? 0;
  const moving = !!actor.target;
  const bob = Math.sin(idle * 0.8) * 0.8;
  const breathe = Math.sin(idle * 0.6) * 0.4;
  const stride = moving ? Math.sin(time * 0.35) * 1.3 : 0;
  cy = cy - 10 + bob;

  // Halo rouge sang
  if(fxLevel >= 1){
    const auraPulse = 0.4 + Math.sin(time * 0.05) * 0.1;
    const aura = ctx.createRadialGradient(cx, cy - 2, 2, cx, cy - 2, 16);
    aura.addColorStop(0, hexToRgba(actor.glowColor, auraPulse * 0.5));
    aura.addColorStop(0.6, hexToRgba(actor.accentColor, auraPulse * 0.3));
    aura.addColorStop(1, hexToRgba(actor.accentColor, 0));
    ctx.fillStyle = aura;
    ctx.fillRect(cx - 16, cy - 18, 32, 34);
  }

  // Jambes (pants)
  ctx.fillStyle = shade(actor.capeColor, -0.4);
  ctx.fillRect(cx - 6, cy + 6 + stride, 4, 9);
  ctx.fillRect(cx + 2, cy + 6 - stride, 4, 9);
  // Bottes ensanglantées
  ctx.fillStyle = '#000';
  ctx.fillRect(cx - 7, cy + 14 + stride, 5, 2);
  ctx.fillRect(cx + 2, cy + 14 - stride, 5, 2);
  ctx.fillStyle = actor.accentColor;
  ctx.fillRect(cx - 6, cy + 15 + stride, 2, 1);
  ctx.fillRect(cx + 4, cy + 15 - stride, 2, 1);

  // TABLIER DE CUIR (signature) — large, descend
  ctx.fillStyle = actor.capeColor;
  ctx.beginPath();
  ctx.moveTo(cx - 8, cy + 6);
  ctx.lineTo(cx + 8, cy + 6);
  ctx.lineTo(cx + 7, cy - 5 + breathe);
  ctx.lineTo(cx + 3, cy - 8 + breathe);
  ctx.lineTo(cx - 3, cy - 8 + breathe);
  ctx.lineTo(cx - 7, cy - 5 + breathe);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = shade(actor.capeColor, 0.2);
  ctx.fillRect(cx - 7, cy - 5 + breathe, 2, 11);

  // Taches de sang sur tablier (signature)
  ctx.fillStyle = actor.accentColor;
  ctx.fillRect(cx - 3, cy - 2 + breathe, 3, 2);
  ctx.fillRect(cx + 2, cy + 2 + breathe, 2, 2);
  ctx.fillStyle = shade(actor.glowColor, -0.2);
  ctx.fillRect(cx - 2, cy - 1 + breathe, 1, 1);
  // Drip
  if(time % 100 < 50){
    ctx.fillStyle = actor.glowColor;
    ctx.fillRect(cx - 1, cy + 1 + breathe, 1, Math.floor((time % 50) / 12) + 1);
  }

  // Bras massifs nus
  ctx.fillStyle = actor.skinColor;
  ctx.fillRect(cx - 10, cy - 5 + breathe, 3, 9);
  ctx.fillRect(cx + 7, cy - 5 + breathe, 3, 9);
  // Sang sur bras
  ctx.fillStyle = actor.accentColor;
  ctx.fillRect(cx - 9, cy - 2 + breathe, 1, 1);
  ctx.fillRect(cx + 8, cy + 1 + breathe, 1, 1);

  // Tête avec MASQUE DE CUIR (signature)
  ctx.fillStyle = actor.skinColor;
  ctx.beginPath();
  ctx.ellipse(cx, cy - 13 + breathe, 4.5, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  // Mask (couvre bas du visage)
  ctx.fillStyle = actor.hairColor;
  ctx.fillRect(cx - 4, cy - 12 + breathe, 8, 4);
  ctx.fillStyle = shade(actor.hairColor, 0.4);
  ctx.fillRect(cx - 4, cy - 12 + breathe, 8, 1);
  // Strap autour de la tête
  ctx.fillStyle = actor.capeColor;
  ctx.fillRect(cx - 5, cy - 13 + breathe, 10, 1);
  // Sang sur masque
  ctx.fillStyle = actor.accentColor;
  ctx.fillRect(cx + 1, cy - 11 + breathe, 2, 1);
  // Trous de respiration
  ctx.fillStyle = '#000';
  ctx.fillRect(cx - 1.5, cy - 10 + breathe, 1, 0.5);
  ctx.fillRect(cx, cy - 10 + breathe, 1, 0.5);
  ctx.fillRect(cx + 1.5, cy - 10 + breathe, 1, 0.5);

  // Yeux froids
  const eyePulse = 0.85 + Math.sin(time * 0.07) * 0.15;
  ctx.fillStyle = '#000';
  ctx.fillRect(cx - 3, cy - 15 + breathe, 1.5, 1.5);
  ctx.fillRect(cx + 1.5, cy - 15 + breathe, 1.5, 1.5);
  ctx.fillStyle = hexToRgba('#d8c880', eyePulse);
  ctx.fillRect(cx - 2.5, cy - 15 + breathe, 1, 1);
  ctx.fillRect(cx + 2, cy - 15 + breathe, 1, 1);

  // COUPERET sur le côté (signature)
  // Manche
  ctx.fillStyle = actor.capeColor;
  ctx.fillRect(cx + 10, cy - 2 + breathe, 1, 6);
  // Lame
  ctx.fillStyle = '#9a8868';
  ctx.fillRect(cx + 11, cy - 4 + breathe, 5, 3);
  ctx.fillStyle = '#d8c8a0';
  ctx.fillRect(cx + 11, cy - 4 + breathe, 5, 1);
  // Sang sur lame
  ctx.fillStyle = actor.accentColor;
  ctx.fillRect(cx + 13, cy - 2 + breathe, 2, 1);
}

export default { drawCrimsonButcher, crimsonButcherConfig };
