// src/js/render/characters/enemies/cryo_shielder.js
// Glacier Vivant — tank massif, bloc de glace avec fissures internes.
import { hexToRgba, shade } from '../../iso-utils.js';

export const cryoShielderConfig = {
  id: 'cryo_shielder', name: 'GLACIER VIVANT', archetype: 'cryo_shielder',
  bodyColor: '#5a98c8', accentColor: '#aee6ff', glowColor: '#e0f5ff',
  skinColor: '#7ab0d8', hairColor: '#28486a', capeColor: '#1a2838',
  height: 'large', weapon: 'ice_fist',
};

export function drawCryoShielder(ctx, cx, cy, actor, time, options = {}){
  const fxLevel = options.fxLevel ?? 1;
  const idle = actor.idle ?? 0;
  const moving = !!actor.target;
  const bob = Math.sin(idle * 0.5) * 0.5; // très lent
  const breathe = Math.sin(idle * 0.4) * 0.3;
  const stride = moving ? Math.sin(time * 0.25) * 1.0 : 0;
  cy = cy - 12 + bob;

  // Halo cyan défensif (large)
  if(fxLevel >= 1){
    const auraPulse = 0.4 + Math.sin(time * 0.05) * 0.1;
    const aura = ctx.createRadialGradient(cx, cy + 2, 4, cx, cy + 2, 20);
    aura.addColorStop(0, hexToRgba(actor.glowColor, auraPulse * 0.5));
    aura.addColorStop(0.5, hexToRgba(actor.accentColor, auraPulse * 0.3));
    aura.addColorStop(1, hexToRgba(actor.accentColor, 0));
    ctx.fillStyle = aura;
    ctx.fillRect(cx - 20, cy - 22, 40, 40);
  }

  // Jambes très courtes, trapues
  ctx.fillStyle = actor.hairColor;
  ctx.fillRect(cx - 7, cy + 8 + stride, 5, 6);
  ctx.fillRect(cx + 2, cy + 8 - stride, 5, 6);
  // Pieds gelés
  ctx.fillStyle = shade(actor.bodyColor, 0.2);
  ctx.fillRect(cx - 8, cy + 13 + stride, 6, 3);
  ctx.fillRect(cx + 2, cy + 13 - stride, 6, 3);
  ctx.fillStyle = actor.glowColor;
  ctx.fillRect(cx - 8, cy + 15 + stride, 6, 0.5);
  ctx.fillRect(cx + 2, cy + 15 - stride, 6, 0.5);

  // CORPS BLOC RECTANGULAIRE (signature)
  ctx.fillStyle = actor.hairColor;
  ctx.fillRect(cx - 11, cy - 8 + breathe, 22, 16);
  ctx.fillStyle = actor.bodyColor;
  ctx.fillRect(cx - 10, cy - 7 + breathe, 20, 14);
  ctx.fillStyle = shade(actor.bodyColor, 0.2);
  ctx.fillRect(cx - 10, cy - 7 + breathe, 3, 14);

  // Chipped corners
  ctx.fillStyle = actor.hairColor;
  ctx.beginPath();
  ctx.moveTo(cx - 11, cy - 8 + breathe);
  ctx.lineTo(cx - 9, cy - 8 + breathe);
  ctx.lineTo(cx - 11, cy - 5 + breathe);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx + 11, cy - 8 + breathe);
  ctx.lineTo(cx + 9, cy - 8 + breathe);
  ctx.lineTo(cx + 11, cy - 5 + breathe);
  ctx.closePath();
  ctx.fill();

  // FISSURES INTERNES LUMINEUSES (signature)
  const crackPulse = 0.85 + Math.sin(time * 0.07) * 0.15;
  ctx.strokeStyle = hexToRgba(actor.accentColor, crackPulse);
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  // Cracks diagonaux
  ctx.moveTo(cx - 8, cy - 5 + breathe);
  ctx.lineTo(cx - 4, cy - 1 + breathe);
  ctx.lineTo(cx - 6, cy + 3 + breathe);
  ctx.moveTo(cx + 6, cy - 6 + breathe);
  ctx.lineTo(cx + 3, cy - 2 + breathe);
  ctx.lineTo(cx + 6, cy + 2 + breathe);
  ctx.moveTo(cx, cy - 7 + breathe);
  ctx.lineTo(cx + 1, cy - 3 + breathe);
  ctx.lineTo(cx - 1, cy + 1 + breathe);
  ctx.stroke();
  // Hot streaks
  ctx.strokeStyle = hexToRgba(actor.glowColor, crackPulse * 0.7);
  ctx.lineWidth = 0.3;
  ctx.beginPath();
  ctx.moveTo(cx - 6, cy - 3 + breathe);
  ctx.lineTo(cx - 5, cy + 1 + breathe);
  ctx.moveTo(cx + 4, cy - 4 + breathe);
  ctx.lineTo(cx + 4, cy + 0 + breathe);
  ctx.stroke();

  // Crystaux protrusions au top (signature)
  drawIceSpike(ctx, cx - 4, cy - 8 + breathe, time, actor);
  drawIceSpike(ctx, cx + 3, cy - 8 + breathe, time + 50, actor);
  drawIceSpike(ctx, cx, cy - 8 + breathe, time + 100, actor);

  // Bras courts massifs
  ctx.fillStyle = actor.hairColor;
  ctx.fillRect(cx - 13, cy - 4 + breathe, 3, 8);
  ctx.fillRect(cx + 10, cy - 4 + breathe, 3, 8);
  // Fists de glace
  ctx.fillStyle = shade(actor.bodyColor, 0.2);
  ctx.fillRect(cx - 14, cy + 4 + breathe, 4, 4);
  ctx.fillStyle = actor.accentColor;
  ctx.fillRect(cx - 13, cy + 5 + breathe, 1, 1);
  ctx.fillStyle = shade(actor.bodyColor, 0.2);
  ctx.fillRect(cx + 10, cy + 4 + breathe, 4, 4);
  ctx.fillStyle = actor.accentColor;
  ctx.fillRect(cx + 12, cy + 5 + breathe, 1, 1);

  // YEUX à peine visibles entre les craquelures (signature)
  ctx.fillStyle = '#000';
  ctx.fillRect(cx - 4, cy - 5 + breathe, 3, 1.5);
  ctx.fillRect(cx + 1, cy - 5 + breathe, 3, 1.5);
  const eyePulse = 0.7 + Math.sin(time * 0.06) * 0.3;
  ctx.fillStyle = hexToRgba(actor.accentColor, eyePulse);
  ctx.fillRect(cx - 3.5, cy - 4.5 + breathe, 1.5, 0.5);
  ctx.fillRect(cx + 1.5, cy - 4.5 + breathe, 1.5, 0.5);
}

function drawIceSpike(ctx, lx, ly, time, actor){
  const pulse = 0.7 + Math.sin(time * 0.1) * 0.3;
  ctx.fillStyle = shade(actor.accentColor, -0.3);
  ctx.beginPath();
  ctx.moveTo(lx, ly - 3);
  ctx.lineTo(lx - 1, ly);
  ctx.lineTo(lx + 1, ly);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = hexToRgba('#fff', pulse);
  ctx.fillRect(lx - 0.3, ly - 2.5, 0.5, 2);
}

export default { drawCryoShielder, cryoShielderConfig };
