// src/js/render/characters/enemies/voidnet_minibossKernel.js
// SOUS-NOYAU — MINIBOSS, NON HUMANOÏDE.
// Polyèdre cubique, faces qui s'ouvrent, hex orbitants.
import { hexToRgba, shade } from '../iso-utils.js';

export const voidnetMinibossKernelConfig = {
  id: 'voidnet_minibossKernel', name: 'SOUS-NOYAU', archetype: 'voidnet_minibossKernel',
  bodyColor: '#1a1830', accentColor: '#8a40ff', glowColor: '#00f0ff',
  skinColor: '#3a3850', hairColor: '#0a0818', capeColor: '#0a0818',
  height: 'xlarge', weapon: 'data_lance',
};

export function drawVoidnetMinibossKernel(ctx, cx, cy, actor, time, options = {}){
  const fxLevel = options.fxLevel ?? 1;
  const idle = actor.idle ?? 0;
  const hover = Math.sin(idle * 0.6) * 1.8;
  const spin = time * 0.015;
  cy = cy - 14 + hover;

  // Ombre sol
  if(fxLevel >= 1){
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 18, 9, 2, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Halo cyan-violet large
  if(fxLevel >= 1){
    const auraPulse = 0.55 + Math.sin(time * 0.05) * 0.15;
    const aura = ctx.createRadialGradient(cx, cy, 4, cx, cy, 26);
    aura.addColorStop(0, hexToRgba(actor.glowColor, auraPulse * 0.4));
    aura.addColorStop(0.4, hexToRgba(actor.accentColor, auraPulse * 0.4));
    aura.addColorStop(1, hexToRgba(actor.accentColor, 0));
    ctx.fillStyle = aura;
    ctx.fillRect(cx - 26, cy - 26, 52, 52);
  }

  // ═══ POLYÈDRE CUBIQUE (signature) ═══
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(spin);

  // Face arrière (visible)
  ctx.fillStyle = actor.capeColor;
  ctx.beginPath();
  ctx.moveTo(-9, -6);
  ctx.lineTo(9, -6);
  ctx.lineTo(9, 6);
  ctx.lineTo(-9, 6);
  ctx.closePath();
  ctx.fill();

  // Face frontale (face shift selon spin pour effet 3D)
  const facePhase = Math.sin(spin * 4) * 0.5 + 0.5;
  ctx.fillStyle = actor.bodyColor;
  ctx.beginPath();
  ctx.moveTo(-8 + facePhase * 2, -5);
  ctx.lineTo(8 - facePhase * 2, -5);
  ctx.lineTo(8 - facePhase * 2, 5);
  ctx.lineTo(-8 + facePhase * 2, 5);
  ctx.closePath();
  ctx.fill();

  // Edges (frame)
  ctx.strokeStyle = hexToRgba(actor.accentColor, 0.85);
  ctx.lineWidth = 0.8;
  ctx.strokeRect(-9, -6, 18, 12);
  ctx.strokeRect(-8 + facePhase * 2, -5, 16 - facePhase * 4, 10);

  // Connecting lines (3D effect)
  ctx.strokeStyle = hexToRgba(actor.glowColor, 0.5);
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(-9, -6); ctx.lineTo(-8 + facePhase * 2, -5);
  ctx.moveTo(9, -6); ctx.lineTo(8 - facePhase * 2, -5);
  ctx.moveTo(-9, 6); ctx.lineTo(-8 + facePhase * 2, 5);
  ctx.moveTo(9, 6); ctx.lineTo(8 - facePhase * 2, 5);
  ctx.stroke();

  // FACES QUI S'OUVRENT (signature) — fissures lumineuses
  const openPulse = 0.85 + Math.sin(time * 0.06) * 0.15;
  ctx.strokeStyle = hexToRgba(actor.glowColor, openPulse);
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  // Cross dividing front face
  ctx.moveTo(-8 + facePhase * 2, 0); ctx.lineTo(8 - facePhase * 2, 0);
  ctx.moveTo(0, -5); ctx.lineTo(0, 5);
  ctx.stroke();

  // Hot core inside (visible quand "ouvert")
  const coreOpen = Math.abs(Math.sin(time * 0.04));
  if(coreOpen > 0.5){
    ctx.fillStyle = hexToRgba(actor.glowColor, (coreOpen - 0.5) * 2);
    ctx.fillRect(-2, -2, 4, 4);
    ctx.fillStyle = hexToRgba('#fff', (coreOpen - 0.5) * 2);
    ctx.fillRect(-1, -1, 2, 2);
  }

  ctx.restore();

  // ═══ ŒIL CENTRAL (qui regarde toujours le joueur) ═══
  const eyePulse = 0.92 + Math.sin(time * 0.1) * 0.08;
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.arc(cx, cy, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = hexToRgba(actor.accentColor, eyePulse);
  ctx.beginPath();
  ctx.arc(cx, cy, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.arc(cx, cy, 0.9, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = hexToRgba('#fff', eyePulse);
  ctx.fillRect(cx - 0.3, cy - 0.3, 0.5, 0.5);
  // Scan ring
  ctx.strokeStyle = hexToRgba(actor.glowColor, eyePulse * 0.7);
  ctx.lineWidth = 0.4;
  ctx.beginPath();
  ctx.arc(cx, cy, 3, time * 0.1, time * 0.1 + Math.PI * 0.7);
  ctx.stroke();

  // ═══ HEXAGONES ORBITANTS (signature) ═══
  if(fxLevel >= 1){
    drawOrbitingHexes(ctx, cx, cy, time, actor);
  }

  // 4 ANTENNAS aux corners (signature)
  const antennas = [
    [-9, -6], [9, -6], [-9, 6], [9, 6]
  ];
  for(const [dx, dy] of antennas){
    drawAntenna(ctx, cx + dx, cy + dy, time, actor);
  }
}

function drawOrbitingHexes(ctx, cx, cy, time, actor){
  for(let i = 0; i < 4; i++){
    const angle = (i / 4) * Math.PI * 2 + time * 0.05;
    const r = 16;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r * 0.4;
    const pulse = 0.85 + Math.sin(time * 0.1 + i) * 0.15;

    // Hex shape
    ctx.fillStyle = hexToRgba(actor.bodyColor, 0.9);
    ctx.beginPath();
    for(let j = 0; j < 6; j++){
      const a = (j / 6) * Math.PI * 2;
      const hx = x + Math.cos(a) * 1.8;
      const hy = y + Math.sin(a) * 1.8;
      if(j === 0) ctx.moveTo(hx, hy);
      else ctx.lineTo(hx, hy);
    }
    ctx.closePath();
    ctx.fill();
    // Stroke
    ctx.strokeStyle = hexToRgba(actor.accentColor, pulse);
    ctx.lineWidth = 0.4;
    ctx.stroke();
    // Center dot
    ctx.fillStyle = hexToRgba(actor.glowColor, pulse);
    ctx.fillRect(Math.round(x - 0.3), Math.round(y - 0.3), 0.6, 0.6);
  }
}

function drawAntenna(ctx, lx, ly, time, actor){
  const pulse = 0.85 + Math.sin(time * 0.15) * 0.15;
  ctx.fillStyle = shade(actor.bodyColor, -0.3);
  ctx.fillRect(lx - 0.5, ly - 3, 1, 3);
  ctx.fillStyle = hexToRgba(actor.glowColor, pulse);
  ctx.fillRect(lx - 0.3, ly - 3, 0.6, 0.6);
  ctx.fillStyle = '#fff';
  ctx.fillRect(lx - 0.2, ly - 3, 0.4, 0.4);
}

export default { drawVoidnetMinibossKernel, voidnetMinibossKernelConfig };
