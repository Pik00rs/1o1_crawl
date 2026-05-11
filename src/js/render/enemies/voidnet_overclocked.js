// src/js/render/characters/enemies/voidnet_overclocked.js
// Surchargé — ÉLITE, vibre intensément, motion blur, arcs électriques cyan.
import { hexToRgba, shade } from '../../iso-utils.js';

export const voidnetOverclockedConfig = {
  id: 'voidnet_overclocked', name: 'SURCHARGÉ', archetype: 'voidnet_overclocked',
  bodyColor: '#1a1828', accentColor: '#00f0ff', glowColor: '#fff',
  skinColor: '#3a3850', hairColor: '#0a0818', capeColor: '#0a0818',
  height: 'large', weapon: 'arc_burst',
};

export function drawVoidnetOverclocked(ctx, cx, cy, actor, time, options = {}){
  const fxLevel = options.fxLevel ?? 1;
  const idle = actor.idle ?? 0;
  const moving = !!actor.target;
  const bob = Math.sin(idle * 0.9) * 0.9;
  const breathe = Math.sin(idle * 0.7) * 0.4;
  const stride = moving ? Math.sin(time * 0.42) * 1.4 : 0;
  // VIBRATION constante (signature)
  const vibX = Math.sin(time * 0.8) * 0.8 + Math.sin(time * 1.7) * 0.4;
  const vibY = Math.cos(time * 0.9) * 0.5;
  cy = cy - 13 + bob;

  // Halo électrique large
  if(fxLevel >= 1){
    const auraPulse = 0.5 + Math.sin(time * 0.1) * 0.2;
    const aura = ctx.createRadialGradient(cx, cy - 2, 2, cx, cy - 2, 22);
    aura.addColorStop(0, hexToRgba(actor.glowColor, auraPulse * 0.5));
    aura.addColorStop(0.4, hexToRgba(actor.accentColor, auraPulse * 0.4));
    aura.addColorStop(1, hexToRgba(actor.accentColor, 0));
    ctx.fillStyle = aura;
    ctx.fillRect(cx - 22, cy - 24, 44, 42);
  }

  // ═══ MOTION BLUR (signature) — silhouette répétée avec offsets ═══
  ctx.save();
  ctx.globalAlpha = 0.25;
  drawBody(ctx, cx - 2, cy, breathe, stride, actor.accentColor, true);
  ctx.globalAlpha = 0.25;
  drawBody(ctx, cx + 2, cy, breathe, stride, actor.glowColor, true);
  ctx.restore();

  // Figure principale avec vibration
  cx += vibX;
  cy += vibY;

  drawBody(ctx, cx, cy, breathe, stride, null, false, actor);

  // ═══ ARCS ÉLECTRIQUES CYAN (signature) ═══
  if(fxLevel >= 1){
    drawElectricArcs(ctx, cx, cy, breathe, time, actor);
  }

  // YEUX blancs trop brillants (overclocked)
  const eyePulse = 0.92 + Math.sin(time * 0.15) * 0.08;
  // Big white glow
  const eyeGrad = ctx.createRadialGradient(cx, cy - 14 + breathe, 0, cx, cy - 14 + breathe, 5);
  eyeGrad.addColorStop(0, hexToRgba('#fff', eyePulse * 0.7));
  eyeGrad.addColorStop(1, hexToRgba(actor.accentColor, 0));
  ctx.fillStyle = eyeGrad;
  ctx.fillRect(cx - 6, cy - 18 + breathe, 12, 8);
  // Eyes pure white
  ctx.fillStyle = hexToRgba('#fff', eyePulse);
  ctx.fillRect(cx - 3, cy - 14 + breathe, 2, 1.5);
  ctx.fillRect(cx + 1, cy - 14 + breathe, 2, 1.5);
  ctx.fillStyle = hexToRgba(actor.accentColor, eyePulse);
  ctx.fillRect(cx - 2.8, cy - 13.8 + breathe, 1.6, 1.1);
  ctx.fillRect(cx + 1.2, cy - 13.8 + breathe, 1.6, 1.1);
}

function drawBody(ctx, cx, cy, breathe, stride, tintColor, isBlur, actor){
  const bodyC = tintColor || (actor ? actor.bodyColor : '#1a1828');
  const capeC = tintColor || (actor ? actor.capeColor : '#0a0818');
  const accentC = (actor ? actor.accentColor : '#00f0ff');
  const glowC = (actor ? actor.glowColor : '#fff');

  // Jambes
  ctx.fillStyle = isBlur ? bodyC : shade(bodyC, -0.3);
  ctx.fillRect(cx - 7, cy + 7 + stride, 5, 10);
  ctx.fillRect(cx + 2, cy + 7 - stride, 5, 10);
  if(!isBlur){
    ctx.fillStyle = '#000';
    ctx.fillRect(cx - 8, cy + 16 + stride, 6, 2);
    ctx.fillRect(cx + 2, cy + 16 - stride, 6, 2);
    ctx.fillStyle = accentC;
    ctx.fillRect(cx - 8, cy + 17 + stride, 6, 0.5);
    ctx.fillRect(cx + 2, cy + 17 - stride, 6, 0.5);
  }

  // Torse
  ctx.fillStyle = bodyC;
  ctx.beginPath();
  ctx.moveTo(cx - 8, cy + 5);
  ctx.lineTo(cx + 8, cy + 5);
  ctx.lineTo(cx + 7, cy - 9 + breathe);
  ctx.lineTo(cx - 7, cy - 9 + breathe);
  ctx.closePath();
  ctx.fill();
  if(!isBlur){
    ctx.fillStyle = shade(bodyC, -0.3);
    ctx.beginPath();
    ctx.moveTo(cx + 8, cy + 5);
    ctx.lineTo(cx + 7, cy - 9 + breathe);
    ctx.lineTo(cx + 3, cy - 9 + breathe);
    ctx.lineTo(cx + 3, cy + 5);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = shade(bodyC, 0.3);
    ctx.fillRect(cx - 7, cy - 8 + breathe, 2, 13);

    // Power core sur poitrine (signature overclocked)
    const corePulse = 0.92 + Math.sin(((typeof actor !== 'undefined' && actor) ? actor.idle * 4 : 0)) * 0.08;
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(cx, cy - 2 + breathe, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = hexToRgba(accentC, corePulse);
    ctx.beginPath();
    ctx.arc(cx, cy - 2 + breathe, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = hexToRgba('#fff', corePulse);
    ctx.beginPath();
    ctx.arc(cx, cy - 2 + breathe, 1.2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Bras
  ctx.fillStyle = isBlur ? bodyC : shade(bodyC, -0.1);
  ctx.fillRect(cx - 10, cy - 6 + breathe, 3, 10);
  ctx.fillRect(cx + 7, cy - 6 + breathe, 3, 10);
  if(!isBlur){
    ctx.fillStyle = '#000';
    ctx.fillRect(cx - 10, cy + 3 + breathe, 3, 4);
    ctx.fillRect(cx + 7, cy + 3 + breathe, 3, 4);
  }

  // Casque ouvert
  ctx.fillStyle = capeC;
  ctx.fillRect(cx - 6, cy - 17 + breathe, 12, 8);
  if(!isBlur){
    ctx.fillStyle = bodyC;
    ctx.fillRect(cx - 6, cy - 17 + breathe, 12, 5);
    // Antenna double
    ctx.fillStyle = accentC;
    ctx.fillRect(cx - 2, cy - 20 + breathe, 0.8, 3);
    ctx.fillRect(cx + 1, cy - 20 + breathe, 0.8, 3);
    ctx.fillStyle = glowC;
    ctx.fillRect(cx - 2, cy - 20 + breathe, 0.4, 0.5);
    ctx.fillRect(cx + 1, cy - 20 + breathe, 0.4, 0.5);
  }
}

function drawElectricArcs(ctx, cx, cy, breathe, time, actor){
  const arcPulse = 0.85 + Math.sin(time * 0.2) * 0.15;
  ctx.strokeStyle = hexToRgba(actor.accentColor, arcPulse);
  ctx.lineWidth = 0.6;

  // 4 arcs zigzag
  const arcs = [
    {sx: cx - 10, sy: cy - 6, ex: cx - 15, ey: cy - 10},
    {sx: cx + 10, sy: cy - 6, ex: cx + 15, ey: cy - 10},
    {sx: cx - 10, sy: cy + 6, ex: cx - 14, ey: cy + 11},
    {sx: cx + 10, sy: cy + 6, ex: cx + 14, ey: cy + 11},
  ];
  for(const arc of arcs){
    ctx.beginPath();
    ctx.moveTo(arc.sx, arc.sy + breathe);
    // Zigzag 3 points
    const dx = (arc.ex - arc.sx) / 3;
    const dy = (arc.ey - arc.sy) / 3;
    const r1 = Math.sin(time * 0.5) * 1.5;
    const r2 = Math.cos(time * 0.5 + 1) * 1.5;
    ctx.lineTo(arc.sx + dx + r1, arc.sy + dy + breathe);
    ctx.lineTo(arc.sx + dx * 2 + r2, arc.sy + dy * 2 + breathe);
    ctx.lineTo(arc.ex, arc.ey + breathe);
    ctx.stroke();
    // Brighter core
    ctx.strokeStyle = hexToRgba('#fff', arcPulse * 0.7);
    ctx.lineWidth = 0.3;
    ctx.stroke();
    ctx.strokeStyle = hexToRgba(actor.accentColor, arcPulse);
    ctx.lineWidth = 0.6;
  }
}

export default { drawVoidnetOverclocked, voidnetOverclockedConfig };
