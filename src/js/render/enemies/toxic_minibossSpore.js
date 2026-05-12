// src/js/render/characters/enemies/toxic_minibossSpore.js
// MÈRE-SPORE — MINIBOSS, NON HUMANOÏDE.
// Bulbe géant central avec orifices pulsants, tentacules à la base.
import { hexToRgba, shade } from '../iso-utils.js';

export const toxicMinibossSporeConfig = {
  id: 'toxic_minibossSpore', name: 'MÈRE-SPORE', archetype: 'toxic_minibossSpore',
  bodyColor: '#5a2848', accentColor: '#a040a0', glowColor: '#e090e0',
  skinColor: '#6a8828', hairColor: '#2a1028', capeColor: '#1a0818',
  height: 'xlarge', weapon: 'spore_burst',
};

export function drawToxicMinibossSpore(ctx, cx, cy, actor, time, options = {}){
  const fxLevel = options.fxLevel ?? 1;
  const idle = actor.idle ?? 0;
  const breathe = Math.sin(idle * 0.5) * 0.8; // gros breathe
  const bob = Math.sin(idle * 0.4) * 0.5;
  cy = cy - 8 + bob;

  // Halo violet massif
  if(fxLevel >= 1){
    const auraPulse = 0.55 + Math.sin(time * 0.05) * 0.15;
    const aura = ctx.createRadialGradient(cx, cy - 2, 4, cx, cy - 2, 26);
    aura.addColorStop(0, hexToRgba(actor.glowColor, auraPulse * 0.5));
    aura.addColorStop(0.4, hexToRgba(actor.accentColor, auraPulse * 0.4));
    aura.addColorStop(1, hexToRgba(actor.accentColor, 0));
    ctx.fillStyle = aura;
    ctx.fillRect(cx - 26, cy - 26, 52, 52);
  }

  // Cloud de spores ambiants (signature)
  if(fxLevel >= 1){
    for(let i = 0; i < 8; i++){
      const t = (time * 0.02 + i * 0.3) % 1;
      const angle = i * 0.85 + time * 0.02;
      const r = 14 + t * 10;
      const ex = cx + Math.cos(angle) * r;
      const ey = cy - 2 + Math.sin(angle) * r * 0.6;
      ctx.fillStyle = hexToRgba(actor.accentColor, (1 - t) * 0.5);
      ctx.beginPath();
      ctx.arc(ex, ey, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ═══ TENTACULES À LA BASE (signature) ═══
  const tentacleCount = 8;
  for(let i = 0; i < tentacleCount; i++){
    const baseAngle = (i / tentacleCount) * Math.PI;
    const sway = Math.sin(time * 0.06 + i * 0.7) * 1.5;
    const x1 = cx + Math.cos(baseAngle) * 10;
    const x2 = cx + Math.cos(baseAngle) * 12 + sway;
    // Tentacle body
    ctx.fillStyle = actor.hairColor;
    ctx.beginPath();
    ctx.moveTo(x1 - 1, cy + 8);
    ctx.lineTo(x1 + 1, cy + 8);
    ctx.lineTo(x2 + 0.5, cy + 17);
    ctx.lineTo(x2 - 0.5, cy + 17);
    ctx.closePath();
    ctx.fill();
    // Highlight
    ctx.fillStyle = shade(actor.hairColor, 0.4);
    ctx.fillRect(x1, cy + 8, 0.3, 9);
    // Suckers (small purple dots)
    for(let j = 0; j < 3; j++){
      ctx.fillStyle = actor.accentColor;
      ctx.fillRect(x1 + (x2 - x1) * (j / 3), cy + 10 + j * 2, 0.5, 0.5);
    }
  }

  // ═══ BULBE GÉANT CENTRAL (signature) ═══
  // Outer membrane
  ctx.fillStyle = actor.hairColor;
  ctx.beginPath();
  ctx.ellipse(cx, cy - 2 + breathe, 12, 11, 0, 0, Math.PI * 2);
  ctx.fill();
  // Mid membrane
  ctx.fillStyle = actor.bodyColor;
  ctx.beginPath();
  ctx.ellipse(cx, cy - 2 + breathe, 10, 9.5, 0, 0, Math.PI * 2);
  ctx.fill();
  // Inner translucent
  ctx.fillStyle = shade(actor.bodyColor, 0.3);
  ctx.beginPath();
  ctx.ellipse(cx - 2, cy - 4 + breathe, 4, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // VEINES PULSANTES (signature)
  const veinPulse = 0.85 + Math.sin(time * 0.07) * 0.15;
  ctx.strokeStyle = hexToRgba(actor.glowColor, veinPulse * 0.6);
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  // Veines partant du centre
  for(let i = 0; i < 6; i++){
    const angle = (i / 6) * Math.PI * 2;
    ctx.moveTo(cx, cy - 2 + breathe);
    const endX = cx + Math.cos(angle) * 9;
    const endY = cy - 2 + breathe + Math.sin(angle) * 8;
    // Branche au milieu
    const midX = cx + Math.cos(angle) * 5;
    const midY = cy - 2 + breathe + Math.sin(angle) * 4.5;
    ctx.lineTo(midX, midY);
    ctx.lineTo(endX, endY);
  }
  ctx.stroke();

  // ═══ ORIFICES PULSANTS (signature) ═══
  // 3 orifices répartis sur le bulbe
  const orifices = [
    [-5, -4, 0],
    [4, -3, 0.7],
    [0, 2, 1.4]
  ];
  for(const [dx, dy, offset] of orifices){
    drawSporeOrifice(ctx, cx + dx, cy + dy + breathe, time, offset, actor);
  }

  // ═══ ŒIL CENTRAL UNIQUE (signature) ═══
  const eyePulse = 0.92 + Math.sin(time * 0.1) * 0.08;
  // Eye socket
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.arc(cx, cy - 6 + breathe, 2.5, 0, Math.PI * 2);
  ctx.fill();
  // Iris
  ctx.fillStyle = hexToRgba(actor.accentColor, eyePulse);
  ctx.beginPath();
  ctx.arc(cx, cy - 6 + breathe, 1.8, 0, Math.PI * 2);
  ctx.fill();
  // Pupil
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.arc(cx, cy - 6 + breathe, 0.8, 0, Math.PI * 2);
  ctx.fill();
  // Highlight
  ctx.fillStyle = hexToRgba('#fff', eyePulse);
  ctx.fillRect(cx - 0.3, cy - 6.3 + breathe, 0.5, 0.5);

  // Tentacules supérieures (sensors)
  for(let i = 0; i < 3; i++){
    const sway = Math.sin(time * 0.08 + i * 1.2) * 1.5;
    const xpos = cx + (i - 1) * 4 + sway * 0.3;
    ctx.fillStyle = actor.hairColor;
    ctx.fillRect(xpos - 0.5, cy - 14 + breathe, 1, 4);
    // Tip
    ctx.fillStyle = actor.accentColor;
    ctx.beginPath();
    ctx.arc(xpos, cy - 14 + breathe, 1, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = actor.glowColor;
    ctx.fillRect(xpos - 0.3, cy - 14.3 + breathe, 0.6, 0.6);
  }
}

function drawSporeOrifice(ctx, lx, ly, time, offset, actor){
  const pulse = 0.7 + Math.sin(time * 0.08 + offset) * 0.3;
  const size = 1.5 + Math.sin(time * 0.08 + offset) * 0.3;
  // Outer rim
  ctx.fillStyle = shade(actor.accentColor, -0.4);
  ctx.beginPath();
  ctx.arc(lx, ly, size + 0.5, 0, Math.PI * 2);
  ctx.fill();
  // Inner
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.arc(lx, ly, size, 0, Math.PI * 2);
  ctx.fill();
  // Glow
  ctx.fillStyle = hexToRgba(actor.accentColor, pulse);
  ctx.beginPath();
  ctx.arc(lx, ly, size * 0.6, 0, Math.PI * 2);
  ctx.fill();
  // Hot spot
  ctx.fillStyle = hexToRgba(actor.glowColor, pulse);
  ctx.fillRect(lx - 0.3, ly - 0.3, 0.6, 0.6);
}

export default { drawToxicMinibossSpore, toxicMinibossSporeConfig };
