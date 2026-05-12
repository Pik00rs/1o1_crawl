// src/js/render/characters/enemies/voidnet_executor.js
// Exécuteur — silhouette militaire, lame d'énergie rouge-orange, kill symbol poitrine.
import { hexToRgba, shade } from '../iso-utils.js';

export const voidnetExecutorConfig = {
  id: 'voidnet_executor', name: 'EXÉCUTEUR', archetype: 'voidnet_executor',
  bodyColor: '#1a1828', accentColor: '#ff3030', glowColor: '#ffa040',
  skinColor: '#2a2840', hairColor: '#0a0818', capeColor: '#0a0818',
  height: 'medium', weapon: 'energy_blade',
};

export function drawVoidnetExecutor(ctx, cx, cy, actor, time, options = {}){
  const fxLevel = options.fxLevel ?? 1;
  const idle = actor.idle ?? 0;
  const moving = !!actor.target;
  const bob = Math.sin(idle * 1.0) * 0.9;
  const breathe = Math.sin(idle * 0.75) * 0.4;
  const stride = moving ? Math.sin(time * 0.42) * 1.4 : 0;
  cy = cy - 11 + bob;

  // Halo rouge
  if(fxLevel >= 1){
    const auraPulse = 0.4 + Math.sin(time * 0.07) * 0.15;
    const aura = ctx.createRadialGradient(cx, cy - 2, 2, cx, cy - 2, 15);
    aura.addColorStop(0, hexToRgba(actor.glowColor, auraPulse * 0.4));
    aura.addColorStop(0.5, hexToRgba(actor.accentColor, auraPulse * 0.3));
    aura.addColorStop(1, hexToRgba(actor.accentColor, 0));
    ctx.fillStyle = aura;
    ctx.fillRect(cx - 15, cy - 17, 30, 30);
  }

  // Jambes (combat suit)
  ctx.fillStyle = actor.capeColor;
  ctx.fillRect(cx - 6, cy + 6 + stride, 4, 9);
  ctx.fillRect(cx + 2, cy + 6 - stride, 4, 9);
  ctx.fillStyle = actor.bodyColor;
  ctx.fillRect(cx - 6, cy + 6 + stride, 1, 9);
  ctx.fillStyle = shade(actor.bodyColor, 0.3);
  ctx.fillRect(cx - 6, cy + 10 + stride, 4, 0.5);
  ctx.fillRect(cx + 2, cy + 10 - stride, 4, 0.5);
  // Bottes
  ctx.fillStyle = '#000';
  ctx.fillRect(cx - 7, cy + 14 + stride, 5, 2);
  ctx.fillRect(cx + 2, cy + 14 - stride, 5, 2);
  ctx.fillStyle = actor.accentColor;
  ctx.fillRect(cx - 7, cy + 15 + stride, 5, 0.5);
  ctx.fillRect(cx + 2, cy + 15 - stride, 5, 0.5);

  // Belt + tactical pouches
  ctx.fillStyle = '#000';
  ctx.fillRect(cx - 7, cy + 5, 14, 2);
  ctx.fillStyle = actor.bodyColor;
  ctx.fillRect(cx - 5, cy + 5, 2, 2);
  ctx.fillRect(cx + 3, cy + 5, 2, 2);

  // Torse armor
  ctx.fillStyle = actor.bodyColor;
  ctx.beginPath();
  ctx.moveTo(cx - 7, cy + 5);
  ctx.lineTo(cx + 7, cy + 5);
  ctx.lineTo(cx + 6, cy - 8 + breathe);
  ctx.lineTo(cx - 6, cy - 8 + breathe);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = shade(actor.bodyColor, -0.3);
  ctx.beginPath();
  ctx.moveTo(cx + 7, cy + 5);
  ctx.lineTo(cx + 6, cy - 8 + breathe);
  ctx.lineTo(cx + 2, cy - 8 + breathe);
  ctx.lineTo(cx + 2, cy + 5);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = shade(actor.bodyColor, 0.3);
  ctx.fillRect(cx - 6, cy - 7 + breathe, 2, 12);

  // KILL SYMBOL sur poitrine (signature)
  drawKillSymbol(ctx, cx, cy - 3 + breathe, time, actor);

  // Bras
  ctx.fillStyle = shade(actor.bodyColor, -0.1);
  ctx.fillRect(cx - 9, cy - 5 + breathe, 2, 9);
  ctx.fillRect(cx + 7, cy - 5 + breathe, 2, 9);
  // Gants
  ctx.fillStyle = '#000';
  ctx.fillRect(cx - 9, cy + 4 + breathe, 2, 3);
  ctx.fillRect(cx + 7, cy + 4 + breathe, 2, 3);

  // ═══ LAME D'ÉNERGIE (signature) main droite ═══
  drawEnergyBlade(ctx, cx + 9, cy + 5 + breathe, time, actor);

  // Casque fermé
  ctx.fillStyle = actor.capeColor;
  ctx.fillRect(cx - 5, cy - 16 + breathe, 10, 9);
  ctx.fillStyle = actor.bodyColor;
  ctx.fillRect(cx - 5, cy - 16 + breathe, 10, 6);
  // Top antenna
  ctx.fillStyle = actor.accentColor;
  ctx.fillRect(cx - 0.5, cy - 18 + breathe, 1, 2);
  ctx.fillStyle = actor.glowColor;
  ctx.fillRect(cx - 0.3, cy - 18 + breathe, 0.5, 0.5);

  // VISIÈRE ROUGE (signature)
  const visorPulse = 0.92 + Math.sin(time * 0.07) * 0.08;
  ctx.fillStyle = '#000';
  ctx.fillRect(cx - 5, cy - 13 + breathe, 10, 2);
  ctx.fillStyle = hexToRgba(actor.accentColor, visorPulse);
  ctx.fillRect(cx - 5, cy - 13 + breathe, 10, 1.5);
  ctx.fillStyle = hexToRgba(actor.glowColor, visorPulse);
  ctx.fillRect(cx - 5, cy - 13 + breathe, 10, 0.4);
  // Eye slits
  ctx.fillStyle = '#fff';
  ctx.fillRect(cx - 3, cy - 12.7 + breathe, 1, 0.4);
  ctx.fillRect(cx + 2, cy - 12.7 + breathe, 1, 0.4);

  // Cheek guards
  ctx.fillStyle = actor.capeColor;
  ctx.fillRect(cx - 5, cy - 10 + breathe, 2, 3);
  ctx.fillRect(cx + 3, cy - 10 + breathe, 2, 3);
  // Mouth grill
  ctx.fillStyle = '#000';
  ctx.fillRect(cx - 2, cy - 9 + breathe, 4, 1.5);
  ctx.fillStyle = actor.accentColor;
  ctx.fillRect(cx - 2, cy - 9 + breathe, 4, 0.3);
}

function drawKillSymbol(ctx, lx, ly, time, actor){
  // Skull simplifié rouge
  const pulse = 0.85 + Math.sin(time * 0.08) * 0.15;
  // Background
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.arc(lx, ly, 2, 0, Math.PI * 2);
  ctx.fill();
  // Skull rouge
  ctx.fillStyle = hexToRgba(actor.accentColor, pulse);
  ctx.beginPath();
  ctx.arc(lx, ly - 0.3, 1.4, 0, Math.PI * 2);
  ctx.fill();
  // Eyes (negative space)
  ctx.fillStyle = '#000';
  ctx.fillRect(lx - 0.8, ly - 0.4, 0.5, 0.5);
  ctx.fillRect(lx + 0.3, ly - 0.4, 0.5, 0.5);
  // Mouth
  ctx.fillRect(lx - 0.5, ly + 0.5, 1, 0.3);
}

function drawEnergyBlade(ctx, lx, ly, time, actor){
  const pulse = 0.92 + Math.sin(time * 0.12) * 0.08;
  // Grip
  ctx.fillStyle = actor.capeColor;
  ctx.fillRect(lx - 0.7, ly, 1.5, 4);
  // Emitter base
  ctx.fillStyle = actor.bodyColor;
  ctx.fillRect(lx - 1.5, ly - 1, 3, 1.5);
  ctx.fillStyle = actor.accentColor;
  ctx.fillRect(lx - 1, ly - 0.5, 2, 0.5);

  // Lame energy (long)
  const bladeGrad = ctx.createLinearGradient(lx, ly - 1, lx, ly - 14);
  bladeGrad.addColorStop(0, hexToRgba(actor.accentColor, pulse));
  bladeGrad.addColorStop(0.5, hexToRgba(actor.glowColor, pulse));
  bladeGrad.addColorStop(1, hexToRgba('#fff', pulse));
  ctx.fillStyle = bladeGrad;
  ctx.fillRect(lx - 0.6, ly - 14, 1.2, 13);
  // Glow halo
  ctx.fillStyle = hexToRgba(actor.glowColor, pulse * 0.4);
  ctx.fillRect(lx - 1.2, ly - 14, 2.4, 13);
  // White core
  ctx.fillStyle = hexToRgba('#fff', pulse);
  ctx.fillRect(lx - 0.2, ly - 14, 0.4, 13);
  // Tip pointu
  ctx.fillStyle = hexToRgba('#fff', pulse);
  ctx.beginPath();
  ctx.moveTo(lx - 0.6, ly - 14);
  ctx.lineTo(lx + 0.6, ly - 14);
  ctx.lineTo(lx, ly - 16);
  ctx.closePath();
  ctx.fill();
}

export default { drawVoidnetExecutor, voidnetExecutorConfig };
