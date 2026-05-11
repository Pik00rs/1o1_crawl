// src/js/render/characters/enemies/cryo_minibossWarden.js
// Gardien des Cellules — MINIBOSS, manteau lourd cryo, casquette militaire, clé géante.
import { hexToRgba, shade } from '../../iso-utils.js';

export const cryoMinibossWardenConfig = {
  id: 'cryo_minibossWarden', name: 'GARDIEN', archetype: 'cryo_minibossWarden',
  bodyColor: '#3a4858', accentColor: '#aee6ff', glowColor: '#e0f5ff',
  skinColor: '#7a98b0', hairColor: '#1a2838', capeColor: '#0a1418',
  height: 'xlarge', weapon: 'ice_key',
};

export function drawCryoMinibossWarden(ctx, cx, cy, actor, time, options = {}){
  const fxLevel = options.fxLevel ?? 1;
  const idle = actor.idle ?? 0;
  const moving = !!actor.target;
  const bob = Math.sin(idle * 0.7) * 0.7;
  const breathe = Math.sin(idle * 0.55) * 0.4;
  const stride = moving ? Math.sin(time * 0.3) * 1.2 : 0;
  cy = cy - 14 + bob; // MINIBOSS plus grand

  // Halo cyan
  if(fxLevel >= 1){
    const auraPulse = 0.45 + Math.sin(time * 0.05) * 0.1;
    const aura = ctx.createRadialGradient(cx, cy - 4, 2, cx, cy - 4, 20);
    aura.addColorStop(0, hexToRgba(actor.glowColor, auraPulse * 0.5));
    aura.addColorStop(0.5, hexToRgba(actor.accentColor, auraPulse * 0.3));
    aura.addColorStop(1, hexToRgba(actor.accentColor, 0));
    ctx.fillStyle = aura;
    ctx.fillRect(cx - 20, cy - 24, 40, 38);
  }

  // Jambes militaires
  ctx.fillStyle = actor.hairColor;
  ctx.fillRect(cx - 7, cy + 7 + stride, 5, 11);
  ctx.fillRect(cx + 2, cy + 7 - stride, 5, 11);
  // Stripe officer side
  ctx.fillStyle = actor.accentColor;
  ctx.fillRect(cx - 0.5, cy + 7 + stride, 0.5, 11);
  // Bottes
  ctx.fillStyle = actor.capeColor;
  ctx.fillRect(cx - 8, cy + 17 + stride, 6, 3);
  ctx.fillRect(cx + 2, cy + 17 - stride, 6, 3);
  ctx.fillStyle = '#7a98b0';
  ctx.fillRect(cx - 8, cy + 17 + stride, 6, 0.5);
  ctx.fillRect(cx + 2, cy + 17 - stride, 6, 0.5);

  // MANTEAU LOURD (signature) — descend jusqu'aux genoux
  ctx.fillStyle = actor.capeColor;
  ctx.beginPath();
  ctx.moveTo(cx - 10, cy + 8);
  ctx.lineTo(cx + 10, cy + 8);
  ctx.lineTo(cx + 9, cy - 6 + breathe);
  ctx.lineTo(cx - 9, cy - 6 + breathe);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = actor.bodyColor;
  ctx.fillRect(cx - 9, cy - 6 + breathe, 18, 14);
  ctx.fillStyle = shade(actor.bodyColor, 0.3);
  ctx.fillRect(cx - 9, cy - 6 + breathe, 2, 14);

  // Center seam
  ctx.strokeStyle = actor.capeColor;
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(cx, cy - 5 + breathe);
  ctx.lineTo(cx, cy + 8);
  ctx.stroke();

  // Belt large
  ctx.fillStyle = actor.capeColor;
  ctx.fillRect(cx - 10, cy - 6 + breathe, 20, 3);
  ctx.fillStyle = '#7a98b0';
  ctx.fillRect(cx - 2, cy - 6 + breathe, 4, 3);
  ctx.fillStyle = actor.accentColor;
  ctx.fillRect(cx - 1, cy - 5 + breathe, 2, 1);

  // Lapels
  ctx.fillStyle = actor.capeColor;
  ctx.beginPath();
  ctx.moveTo(cx - 8, cy - 6 + breathe);
  ctx.lineTo(cx, cy - 3 + breathe);
  ctx.lineTo(cx - 4, cy - 6 + breathe);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx + 8, cy - 6 + breathe);
  ctx.lineTo(cx, cy - 3 + breathe);
  ctx.lineTo(cx + 4, cy - 6 + breathe);
  ctx.closePath();
  ctx.fill();

  // Boutons or
  ctx.fillStyle = actor.accentColor;
  ctx.fillRect(cx - 0.5, cy - 1 + breathe, 1, 1);
  ctx.fillRect(cx - 0.5, cy + 2 + breathe, 1, 1);

  // Frost on shoulders
  ctx.fillStyle = actor.glowColor;
  ctx.fillRect(cx - 9, cy - 6 + breathe, 18, 0.5);
  // Officer shoulder boards
  ctx.fillStyle = actor.accentColor;
  ctx.fillRect(cx - 10, cy - 6 + breathe, 3, 1);
  ctx.fillRect(cx + 7, cy - 6 + breathe, 3, 1);

  // Bras (manteau)
  ctx.fillStyle = actor.capeColor;
  ctx.fillRect(cx - 11, cy - 5 + breathe, 3, 10);
  ctx.fillRect(cx + 8, cy - 5 + breathe, 3, 10);
  ctx.fillStyle = actor.bodyColor;
  ctx.fillRect(cx - 11, cy - 5 + breathe, 1, 10);
  ctx.fillStyle = shade(actor.bodyColor, -0.3);
  ctx.fillRect(cx + 10, cy - 5 + breathe, 1, 10);
  // Gants noirs
  ctx.fillStyle = actor.capeColor;
  ctx.fillRect(cx - 11, cy + 5 + breathe, 3, 3);
  ctx.fillRect(cx + 8, cy + 5 + breathe, 3, 3);

  // CLÉ GÉANTE DE GLACE (signature) — bras droit
  drawIceKey(ctx, cx + 13, cy - 1 + breathe, time, actor);

  // CASQUETTE MILITAIRE (signature)
  // Crown
  ctx.fillStyle = actor.hairColor;
  ctx.fillRect(cx - 6, cy - 17 + breathe, 12, 6);
  ctx.fillStyle = shade(actor.hairColor, 0.3);
  ctx.fillRect(cx - 6, cy - 17 + breathe, 12, 1);
  // Hat band
  ctx.fillStyle = actor.capeColor;
  ctx.fillRect(cx - 6, cy - 12 + breathe, 12, 1.5);
  // Peak/visière
  ctx.fillStyle = actor.capeColor;
  ctx.beginPath();
  ctx.moveTo(cx - 7, cy - 11 + breathe);
  ctx.lineTo(cx + 7, cy - 11 + breathe);
  ctx.lineTo(cx + 5, cy - 10 + breathe);
  ctx.lineTo(cx - 5, cy - 10 + breathe);
  ctx.closePath();
  ctx.fill();
  // Badge cyan
  ctx.fillStyle = actor.accentColor;
  ctx.beginPath();
  ctx.moveTo(cx, cy - 17 + breathe);
  ctx.lineTo(cx - 1.5, cy - 14 + breathe);
  ctx.lineTo(cx, cy - 11 + breathe);
  ctx.lineTo(cx + 1.5, cy - 14 + breathe);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = actor.glowColor;
  ctx.fillRect(cx - 0.3, cy - 15 + breathe, 0.5, 0.5);
  // Frost on cap
  ctx.fillStyle = actor.glowColor;
  ctx.fillRect(cx - 6, cy - 18 + breathe, 12, 1);

  // Face
  ctx.fillStyle = actor.skinColor;
  ctx.beginPath();
  ctx.ellipse(cx, cy - 8 + breathe, 4.5, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  // Mustache
  ctx.fillStyle = actor.hairColor;
  ctx.fillRect(cx - 2, cy - 7 + breathe, 4, 1);

  // Yeux froids bleus
  const eyePulse = 0.85 + Math.sin(time * 0.07) * 0.15;
  ctx.fillStyle = '#000';
  ctx.fillRect(cx - 3, cy - 9 + breathe, 1.5, 1);
  ctx.fillRect(cx + 1.5, cy - 9 + breathe, 1.5, 1);
  ctx.fillStyle = hexToRgba(actor.accentColor, eyePulse);
  ctx.fillRect(cx - 2.5, cy - 9 + breathe, 1, 0.5);
  ctx.fillRect(cx + 2, cy - 9 + breathe, 1, 0.5);
}

function drawIceKey(ctx, lx, ly, time, actor){
  // Bow (anneau)
  ctx.fillStyle = shade(actor.accentColor, -0.3);
  ctx.beginPath();
  ctx.arc(lx, ly, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.arc(lx, ly, 1.3, 0, Math.PI * 2);
  ctx.fill();
  // Halo
  const pulse = 0.85 + Math.sin(time * 0.1) * 0.15;
  ctx.fillStyle = hexToRgba(actor.glowColor, pulse * 0.3);
  ctx.fillRect(lx - 4, ly - 4, 8, 14);
  // Shaft long
  ctx.fillStyle = shade(actor.accentColor, -0.3);
  ctx.fillRect(lx - 0.7, ly + 2, 1.5, 8);
  ctx.fillStyle = actor.accentColor;
  ctx.fillRect(lx - 0.2, ly + 2, 0.5, 8);
  // Bit (dent en bas)
  ctx.fillStyle = shade(actor.accentColor, -0.3);
  ctx.fillRect(lx - 0.7, ly + 8, 3, 2);
  ctx.fillStyle = actor.glowColor;
  ctx.fillRect(lx + 2, ly + 8, 0.5, 1);
}

export default { drawCryoMinibossWarden, cryoMinibossWardenConfig };
