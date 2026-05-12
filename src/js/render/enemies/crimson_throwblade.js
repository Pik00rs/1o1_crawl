// src/js/render/characters/enemies/crimson_throwblade.js
// Lanceur de Lames — silhouette mince, bandolier en X, masque rouge.
import { hexToRgba, shade } from '../iso-utils.js';

export const crimsonThrowbladeConfig = {
  id: 'crimson_throwblade', name: 'LANCEUR DE LAMES', archetype: 'crimson_throwblade',
  bodyColor: '#a87858', accentColor: '#5a1818', glowColor: '#c82828',
  skinColor: '#c89878', hairColor: '#3a1808', capeColor: '#5a1818',
  height: 'small', weapon: 'throwblade',
};

export function drawCrimsonThrowblade(ctx, cx, cy, actor, time, options = {}){
  const fxLevel = options.fxLevel ?? 1;
  const idle = actor.idle ?? 0;
  const moving = !!actor.target;
  const bob = Math.sin(idle * 1.1) * 1.0;
  const breathe = Math.sin(idle * 0.8) * 0.3;
  const stride = moving ? Math.sin(time * 0.45) * 1.4 : 0;
  cy = cy - 10 + bob;

  // Halo rouge faible
  if(fxLevel >= 1){
    const auraPulse = 0.3 + Math.sin(time * 0.07) * 0.1;
    const aura = ctx.createRadialGradient(cx, cy - 2, 2, cx, cy - 2, 13);
    aura.addColorStop(0, hexToRgba(actor.glowColor, auraPulse * 0.4));
    aura.addColorStop(1, hexToRgba(actor.glowColor, 0));
    ctx.fillStyle = aura;
    ctx.fillRect(cx - 13, cy - 15, 26, 26);
  }

  // Jambes slim
  ctx.fillStyle = shade(actor.hairColor, -0.2);
  ctx.fillRect(cx - 5, cy + 6 + stride, 3, 9);
  ctx.fillRect(cx + 2, cy + 6 - stride, 3, 9);
  // Bottes
  ctx.fillStyle = '#000';
  ctx.fillRect(cx - 6, cy + 14 + stride, 4, 2);
  ctx.fillRect(cx + 2, cy + 14 - stride, 4, 2);

  // Belt
  ctx.fillStyle = actor.hairColor;
  ctx.fillRect(cx - 6, cy + 5, 12, 1);

  // Shirt rouge
  ctx.fillStyle = actor.capeColor;
  ctx.beginPath();
  ctx.moveTo(cx - 6, cy + 5);
  ctx.lineTo(cx + 6, cy + 5);
  ctx.lineTo(cx + 5, cy - 7 + breathe);
  ctx.lineTo(cx - 5, cy - 7 + breathe);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = shade(actor.capeColor, -0.3);
  ctx.beginPath();
  ctx.moveTo(cx + 6, cy + 5);
  ctx.lineTo(cx + 5, cy - 7 + breathe);
  ctx.lineTo(cx + 2, cy - 7 + breathe);
  ctx.lineTo(cx + 2, cy + 5);
  ctx.closePath();
  ctx.fill();

  // BANDOLIER X (signature) avec lames
  ctx.strokeStyle = actor.hairColor;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cx - 5, cy - 6 + breathe);
  ctx.lineTo(cx + 5, cy + 4);
  ctx.moveTo(cx + 5, cy - 6 + breathe);
  ctx.lineTo(cx - 5, cy + 4);
  ctx.stroke();
  // Lames sur bandolier
  ctx.fillStyle = '#9a8868';
  ctx.fillRect(cx - 3, cy - 3 + breathe, 1, 2);
  ctx.fillRect(cx + 2, cy - 3 + breathe, 1, 2);
  ctx.fillRect(cx - 1, cy + 1 + breathe, 1, 2);
  // Centre buckle
  ctx.fillStyle = '#c8a040';
  ctx.fillRect(cx - 1, cy - 1 + breathe, 2, 2);

  // Bras minces
  ctx.fillStyle = actor.skinColor;
  ctx.fillRect(cx - 7, cy - 5 + breathe, 2, 9);
  ctx.fillRect(cx + 5, cy - 5 + breathe, 2, 9);
  // Wrist wraps
  ctx.fillStyle = actor.hairColor;
  ctx.fillRect(cx - 7, cy + 2 + breathe, 2, 2);
  ctx.fillRect(cx + 5, cy + 2 + breathe, 2, 2);

  // Tête
  ctx.fillStyle = actor.skinColor;
  ctx.beginPath();
  ctx.ellipse(cx, cy - 12 + breathe, 4, 4.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = shade(actor.skinColor, -0.2);
  ctx.beginPath();
  ctx.ellipse(cx + 1.5, cy - 12 + breathe, 2, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  // Bandana rouge (masque visage bas)
  ctx.fillStyle = actor.capeColor;
  ctx.fillRect(cx - 4, cy - 11 + breathe, 8, 3);
  ctx.fillStyle = shade(actor.capeColor, 0.3);
  ctx.fillRect(cx - 4, cy - 11 + breathe, 8, 1);
  // Knot side
  ctx.fillStyle = actor.capeColor;
  ctx.fillRect(cx + 4, cy - 10 + breathe, 2, 2);
  // Headband
  ctx.fillStyle = actor.hairColor;
  ctx.fillRect(cx - 4, cy - 16 + breathe, 8, 2);
  ctx.fillStyle = '#c8a040';
  ctx.fillRect(cx - 1, cy - 16 + breathe, 2, 1);

  // Yeux focused
  const eyePulse = 0.85 + Math.sin(time * 0.08) * 0.15;
  ctx.fillStyle = '#000';
  ctx.fillRect(cx - 3, cy - 14 + breathe, 1.5, 1);
  ctx.fillRect(cx + 1.5, cy - 14 + breathe, 1.5, 1);
  ctx.fillStyle = hexToRgba('#d8c880', eyePulse);
  ctx.fillRect(cx - 2.5, cy - 14 + breathe, 1, 0.5);
  ctx.fillRect(cx + 2, cy - 14 + breathe, 1, 0.5);
}

export default { drawCrimsonThrowblade, crimsonThrowbladeConfig };
