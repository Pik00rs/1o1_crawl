// src/js/render/characters/enemies/voidnet_replicator.js
// Réplicateur — silhouette double avec écho fantôme cyan derrière.
import { hexToRgba, shade } from '../iso-utils.js';

export const voidnetReplicatorConfig = {
  id: 'voidnet_replicator', name: 'RÉPLICATEUR', archetype: 'voidnet_replicator',
  bodyColor: '#2a2840', accentColor: '#00f0ff', glowColor: '#aef0ff',
  skinColor: '#3a3850', hairColor: '#1a1828', capeColor: '#0a0818',
  height: 'medium', weapon: 'clone_strike',
};

export function drawVoidnetReplicator(ctx, cx, cy, actor, time, options = {}){
  const fxLevel = options.fxLevel ?? 1;
  const idle = actor.idle ?? 0;
  const moving = !!actor.target;
  const bob = Math.sin(idle * 1.1) * 1.0;
  const breathe = Math.sin(idle * 0.8) * 0.4;
  const stride = moving ? Math.sin(time * 0.45) * 1.3 : 0;
  cy = cy - 10 + bob;

  // Halo cyan
  if(fxLevel >= 1){
    const auraPulse = 0.35 + Math.sin(time * 0.07) * 0.15;
    const aura = ctx.createRadialGradient(cx, cy - 2, 2, cx, cy - 2, 15);
    aura.addColorStop(0, hexToRgba(actor.glowColor, auraPulse * 0.4));
    aura.addColorStop(0.5, hexToRgba(actor.accentColor, auraPulse * 0.3));
    aura.addColorStop(1, hexToRgba(actor.accentColor, 0));
    ctx.fillStyle = aura;
    ctx.fillRect(cx - 15, cy - 17, 30, 30);
  }

  // ═══ ÉCHO FANTÔME CYAN (signature) — silhouette identique décalée derrière, semi-transparente ═══
  const echoOffset = Math.sin(time * 0.06) * 3;
  ctx.save();
  ctx.globalAlpha = 0.35;
  // Echo gauche
  drawSimpleFigure(ctx, cx - 4 - echoOffset, cy, breathe, stride, actor.accentColor, actor);
  // Echo droite
  ctx.globalAlpha = 0.25;
  drawSimpleFigure(ctx, cx + 4 + echoOffset, cy, breathe, -stride, actor.accentColor, actor);
  ctx.restore();

  // FIGURE PRINCIPALE
  // Jambes
  ctx.fillStyle = shade(actor.bodyColor, -0.3);
  ctx.fillRect(cx - 5, cy + 6 + stride, 3, 9);
  ctx.fillRect(cx + 2, cy + 6 - stride, 3, 9);
  // Bottes
  ctx.fillStyle = actor.capeColor;
  ctx.fillRect(cx - 6, cy + 14 + stride, 4, 2);
  ctx.fillRect(cx + 2, cy + 14 - stride, 4, 2);
  ctx.fillStyle = actor.accentColor;
  ctx.fillRect(cx - 6, cy + 15 + stride, 4, 0.5);
  ctx.fillRect(cx + 2, cy + 15 - stride, 4, 0.5);

  // Torse
  ctx.fillStyle = actor.bodyColor;
  ctx.beginPath();
  ctx.moveTo(cx - 6, cy + 5);
  ctx.lineTo(cx + 6, cy + 5);
  ctx.lineTo(cx + 5, cy - 7 + breathe);
  ctx.lineTo(cx - 5, cy - 7 + breathe);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = shade(actor.bodyColor, -0.3);
  ctx.beginPath();
  ctx.moveTo(cx + 6, cy + 5);
  ctx.lineTo(cx + 5, cy - 7 + breathe);
  ctx.lineTo(cx + 2, cy - 7 + breathe);
  ctx.lineTo(cx + 2, cy + 5);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = shade(actor.bodyColor, 0.3);
  ctx.fillRect(cx - 5, cy - 6 + breathe, 2, 11);

  // CIRCUITS CYAN sur torse (signature)
  const circuitPulse = 0.7 + Math.sin(time * 0.08) * 0.2;
  ctx.strokeStyle = hexToRgba(actor.accentColor, circuitPulse);
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(cx - 3, cy - 5 + breathe);
  ctx.lineTo(cx - 3, cy - 2 + breathe);
  ctx.lineTo(cx + 3, cy - 2 + breathe);
  ctx.lineTo(cx + 3, cy + 1 + breathe);
  ctx.stroke();
  // Nodes
  ctx.fillStyle = actor.glowColor;
  ctx.fillRect(cx - 3.5, cy - 2.5 + breathe, 1, 1);
  ctx.fillRect(cx + 2.5, cy + 0.5 + breathe, 1, 1);

  // Bras
  ctx.fillStyle = shade(actor.bodyColor, -0.1);
  ctx.fillRect(cx - 7, cy - 5 + breathe, 2, 9);
  ctx.fillRect(cx + 5, cy - 5 + breathe, 2, 9);
  // Mains
  ctx.fillStyle = actor.capeColor;
  ctx.fillRect(cx - 7, cy + 4 + breathe, 2, 3);
  ctx.fillRect(cx + 5, cy + 4 + breathe, 2, 3);

  // CASQUE
  ctx.fillStyle = actor.capeColor;
  ctx.fillRect(cx - 5, cy - 16 + breathe, 10, 8);
  ctx.fillStyle = actor.bodyColor;
  ctx.fillRect(cx - 5, cy - 16 + breathe, 10, 5);
  // Antenna
  ctx.fillStyle = actor.accentColor;
  ctx.fillRect(cx - 0.5, cy - 18 + breathe, 1, 2);

  // 2 BANDES VISIÈRE CYAN (signature, double = réplique)
  const visorPulse = 0.9 + Math.sin(time * 0.08) * 0.1;
  ctx.fillStyle = '#000';
  ctx.fillRect(cx - 5, cy - 13 + breathe, 10, 3);
  ctx.fillStyle = hexToRgba(actor.accentColor, visorPulse);
  ctx.fillRect(cx - 5, cy - 13 + breathe, 10, 0.8);
  ctx.fillRect(cx - 5, cy - 11.5 + breathe, 10, 0.8);
  ctx.fillStyle = hexToRgba(actor.glowColor, visorPulse);
  ctx.fillRect(cx - 5, cy - 13 + breathe, 10, 0.3);
  ctx.fillRect(cx - 5, cy - 11.5 + breathe, 10, 0.3);
  // Eye slits
  ctx.fillStyle = '#fff';
  ctx.fillRect(cx - 3, cy - 12.7 + breathe, 1, 0.3);
  ctx.fillRect(cx + 2, cy - 12.7 + breathe, 1, 0.3);
  ctx.fillRect(cx - 3, cy - 11.2 + breathe, 1, 0.3);
  ctx.fillRect(cx + 2, cy - 11.2 + breathe, 1, 0.3);
}

// Helper pour echo
function drawSimpleFigure(ctx, cx, cy, breathe, stride, color, actor){
  // Simplified silhouette
  // Legs
  ctx.fillStyle = color;
  ctx.fillRect(cx - 5, cy + 6 + stride, 3, 9);
  ctx.fillRect(cx + 2, cy + 6 - stride, 3, 9);
  // Torso
  ctx.fillRect(cx - 5, cy - 7 + breathe, 10, 12);
  // Arms
  ctx.fillRect(cx - 7, cy - 5 + breathe, 2, 9);
  ctx.fillRect(cx + 5, cy - 5 + breathe, 2, 9);
  // Head
  ctx.fillRect(cx - 5, cy - 16 + breathe, 10, 8);
}

export default { drawVoidnetReplicator, voidnetReplicatorConfig };
