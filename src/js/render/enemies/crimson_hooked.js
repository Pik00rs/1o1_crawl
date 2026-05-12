// src/js/render/characters/enemies/crimson_hooked.js
// Crocheteur — costaud avec hook au bout d'une chaîne.
import { hexToRgba, shade } from '../iso-utils.js';

export const crimsonHookedConfig = {
  id: 'crimson_hooked', name: 'CROCHETEUR', archetype: 'crimson_hooked',
  bodyColor: '#a87858', accentColor: '#8a1818', glowColor: '#c82828',
  skinColor: '#c89878', hairColor: '#3a1a08', capeColor: '#3a1a08',
  height: 'medium', weapon: 'hook',
};

export function drawCrimsonHooked(ctx, cx, cy, actor, time, options = {}){
  const fxLevel = options.fxLevel ?? 1;
  const idle = actor.idle ?? 0;
  const moving = !!actor.target;
  const bob = Math.sin(idle * 0.9) * 1.0;
  const breathe = Math.sin(idle * 0.7) * 0.4;
  const stride = moving ? Math.sin(time * 0.4) * 1.5 : 0;
  cy = cy - 10 + bob;

  // Halo rouge
  if(fxLevel >= 1){
    const auraPulse = 0.3 + Math.sin(time * 0.06) * 0.1;
    const aura = ctx.createRadialGradient(cx, cy - 2, 2, cx, cy - 2, 14);
    aura.addColorStop(0, hexToRgba(actor.accentColor, auraPulse * 0.5));
    aura.addColorStop(1, hexToRgba(actor.accentColor, 0));
    ctx.fillStyle = aura;
    ctx.fillRect(cx - 14, cy - 16, 28, 28);
  }

  // Jambes
  ctx.fillStyle = shade(actor.capeColor, -0.4);
  ctx.fillRect(cx - 6, cy + 6 + stride, 4, 9);
  ctx.fillRect(cx + 2, cy + 6 - stride, 4, 9);
  ctx.fillStyle = '#000';
  ctx.fillRect(cx - 7, cy + 14 + stride, 5, 2);
  ctx.fillRect(cx + 2, cy + 14 - stride, 5, 2);

  // Belt avec bronze buckle
  ctx.fillStyle = actor.capeColor;
  ctx.fillRect(cx - 7, cy + 5, 14, 2);
  ctx.fillStyle = '#c8a040';
  ctx.fillRect(cx - 1, cy + 5, 2, 2);

  // Vest cuir ouvert (skin visible au centre)
  ctx.fillStyle = actor.capeColor;
  ctx.beginPath();
  ctx.moveTo(cx - 7, cy + 5);
  ctx.lineTo(cx + 7, cy + 5);
  ctx.lineTo(cx + 6, cy - 7 + breathe);
  ctx.lineTo(cx - 6, cy - 7 + breathe);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = shade(actor.capeColor, 0.3);
  ctx.fillRect(cx - 6, cy - 7 + breathe, 2, 12);
  // Skin au centre (vest ouvert)
  ctx.fillStyle = actor.skinColor;
  ctx.fillRect(cx - 2, cy - 6 + breathe, 4, 11);
  ctx.fillStyle = shade(actor.skinColor, -0.3);
  ctx.fillRect(cx, cy - 6 + breathe, 0.5, 11);

  // Bras musclés
  ctx.fillStyle = actor.skinColor;
  ctx.fillRect(cx - 9, cy - 5 + breathe, 2, 9);
  ctx.fillRect(cx + 7, cy - 5 + breathe, 2, 9);
  // Bandages bras
  ctx.fillStyle = '#a89878';
  ctx.fillRect(cx - 9, cy - 2 + breathe, 2, 1);
  ctx.fillRect(cx + 7, cy - 2 + breathe, 2, 1);

  // CHAIN + HOOK qui pend (signature)
  ctx.strokeStyle = '#7a6850';
  ctx.lineWidth = 1;
  ctx.beginPath();
  const chainSway = Math.sin(time * 0.08) * 1.5;
  ctx.moveTo(cx - 9, cy + 3 + breathe);
  ctx.lineTo(cx - 11 + chainSway, cy + 8 + breathe);
  ctx.stroke();
  // Hook (J-shape)
  ctx.strokeStyle = '#9a8868';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cx - 11 + chainSway, cy + 8 + breathe);
  ctx.lineTo(cx - 11 + chainSway, cy + 11 + breathe);
  ctx.quadraticCurveTo(cx - 13 + chainSway, cy + 13 + breathe, cx - 14 + chainSway, cy + 11 + breathe);
  ctx.stroke();
  // Sang sur hook
  ctx.fillStyle = actor.accentColor;
  ctx.fillRect(cx - 14 + chainSway, cy + 11 + breathe, 1, 1);

  // Tête + beard
  ctx.fillStyle = actor.skinColor;
  ctx.beginPath();
  ctx.ellipse(cx, cy - 12 + breathe, 4.5, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  // Beard (épais)
  ctx.fillStyle = actor.hairColor;
  ctx.fillRect(cx - 4, cy - 10 + breathe, 8, 3);
  // Hair top
  ctx.fillStyle = actor.hairColor;
  ctx.fillRect(cx - 4, cy - 16 + breathe, 8, 3);
  // Scar œil
  ctx.fillStyle = shade(actor.accentColor, -0.3);
  ctx.fillRect(cx - 4, cy - 14 + breathe, 0.5, 3);

  // Yeux prédateur
  const eyePulse = 0.85 + Math.sin(time * 0.08) * 0.15;
  ctx.fillStyle = '#000';
  ctx.fillRect(cx - 3, cy - 13 + breathe, 1.5, 1.5);
  ctx.fillRect(cx + 1.5, cy - 13 + breathe, 1.5, 1.5);
  ctx.fillStyle = hexToRgba('#d8c880', eyePulse);
  ctx.fillRect(cx - 2.5, cy - 13 + breathe, 1, 1);
  ctx.fillRect(cx + 2, cy - 13 + breathe, 1, 1);
}

export default { drawCrimsonHooked, crimsonHookedConfig };
