// src/js/render/characters/enemies/inferno_archer.js
// Tireur Phosphore — uniforme + vest tactique + visière orange + arc à flèche phosphore.
import { hexToRgba, shade } from '../iso-utils.js';

export const infernoArcherConfig = {
  id: 'inferno_archer', name: 'TIREUR PHOSPHORE', archetype: 'inferno_archer',
  bodyColor: '#5e2418', accentColor: '#ff6f1a', glowColor: '#ffd060',
  skinColor: '#a06850', hairColor: '#1a0805', capeColor: '#3a1610',
  height: 'small', weapon: 'bow',
};

export function drawInfernoArcher(ctx, cx, cy, actor, time, options = {}){
  const fxLevel = options.fxLevel ?? 1;
  const idle = actor.idle ?? 0;
  const moving = !!actor.target;
  const bob = Math.sin(idle * 1.1) * 0.9;
  const breathe = Math.sin(idle * 0.8) * 0.3;
  const stride = moving ? Math.sin(time * 0.45) * 1.3 : 0;
  cy = cy - 10 + bob;

  // Halo orange
  if(fxLevel >= 1){
    const auraPulse = 0.35 + Math.sin(time * 0.07) * 0.1;
    const aura = ctx.createRadialGradient(cx, cy - 2, 2, cx, cy - 2, 14);
    aura.addColorStop(0, hexToRgba(actor.glowColor, auraPulse * 0.4));
    aura.addColorStop(1, hexToRgba(actor.accentColor, 0));
    ctx.fillStyle = aura;
    ctx.fillRect(cx - 14, cy - 16, 28, 28);
  }

  // Jambes (pantalon tactique)
  ctx.fillStyle = shade(actor.bodyColor, -0.3);
  ctx.fillRect(cx - 5, cy + 6 + stride, 3, 9);
  ctx.fillRect(cx + 2, cy + 6 - stride, 3, 9);
  // Poches tactiques
  ctx.fillStyle = actor.hairColor;
  ctx.fillRect(cx - 5, cy + 9 + stride, 3, 2);
  ctx.fillRect(cx + 2, cy + 9 - stride, 3, 2);
  // Bottes
  ctx.fillStyle = '#000';
  ctx.fillRect(cx - 6, cy + 14 + stride, 4, 2);
  ctx.fillRect(cx + 2, cy + 14 - stride, 4, 2);

  // VEST TACTIQUE (signature)
  // Torse uniforme dessous
  ctx.fillStyle = actor.bodyColor;
  ctx.beginPath();
  ctx.moveTo(cx - 6, cy + 5);
  ctx.lineTo(cx + 6, cy + 5);
  ctx.lineTo(cx + 5, cy - 7 + breathe);
  ctx.lineTo(cx - 5, cy - 7 + breathe);
  ctx.closePath();
  ctx.fill();
  // Vest par-dessus
  ctx.fillStyle = actor.capeColor;
  ctx.fillRect(cx - 6, cy - 4 + breathe, 12, 9);
  ctx.fillStyle = shade(actor.capeColor, 0.3);
  ctx.fillRect(cx - 6, cy - 4 + breathe, 2, 9);
  // Vest stripe LED orange (signature)
  const ledPulse = 0.85 + Math.sin(time * 0.08) * 0.15;
  ctx.fillStyle = hexToRgba(actor.accentColor, ledPulse);
  ctx.fillRect(cx - 4, cy - 2 + breathe, 8, 0.5);
  ctx.fillRect(cx - 4, cy + 2 + breathe, 8, 0.5);
  // Pouches
  ctx.fillStyle = actor.hairColor;
  ctx.fillRect(cx - 4, cy + 0 + breathe, 2, 2);
  ctx.fillRect(cx + 2, cy + 0 + breathe, 2, 2);
  // Buckle
  ctx.fillStyle = actor.accentColor;
  ctx.fillRect(cx - 1, cy + 0 + breathe, 2, 1);

  // Bras
  ctx.fillStyle = shade(actor.bodyColor, -0.2);
  ctx.fillRect(cx - 7, cy - 5 + breathe, 2, 5);
  ctx.fillRect(cx + 5, cy - 5 + breathe, 2, 5);
  ctx.fillStyle = actor.skinColor;
  ctx.fillRect(cx - 7, cy + 0 + breathe, 2, 4);
  ctx.fillStyle = '#000';
  ctx.fillRect(cx + 5, cy + 0 + breathe, 2, 4);

  // ARC (signature) — vertical à droite, tendu
  ctx.strokeStyle = '#3a2010';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(cx + 10, cy + 1 + breathe, 9, -Math.PI/2 - 0.5, Math.PI/2 + 0.5);
  ctx.stroke();
  // Tips (corne)
  ctx.fillStyle = '#1a0a05';
  ctx.fillRect(cx + 7, cy - 8 + breathe, 1.5, 1.5);
  ctx.fillRect(cx + 7, cy + 9 + breathe, 1.5, 1.5);
  // Corde
  ctx.strokeStyle = '#5a4828';
  ctx.lineWidth = 0.4;
  ctx.beginPath();
  ctx.moveTo(cx + 7.5, cy - 7 + breathe);
  ctx.lineTo(cx + 6, cy + 1 + breathe);
  ctx.lineTo(cx + 7.5, cy + 10 + breathe);
  ctx.stroke();

  // FLÈCHE PHOSPHORE (signature)
  ctx.fillStyle = '#3a2010';
  ctx.fillRect(cx + 1, cy + 0.7 + breathe, 6, 0.6);
  // Phosphore tip blanc-bleu
  const tipPulse = 0.92 + Math.sin(time * 0.12) * 0.08;
  const tipGrad = ctx.createRadialGradient(cx + 7.5, cy + 1 + breathe, 0, cx + 7.5, cy + 1 + breathe, 3);
  tipGrad.addColorStop(0, hexToRgba('#ffffff', tipPulse));
  tipGrad.addColorStop(0.5, hexToRgba('#aee6ff', tipPulse * 0.7));
  tipGrad.addColorStop(1, hexToRgba('#aee6ff', 0));
  ctx.fillStyle = tipGrad;
  ctx.fillRect(cx + 4, cy - 2 + breathe, 7, 7);

  // Tête
  ctx.fillStyle = actor.skinColor;
  ctx.beginPath();
  ctx.ellipse(cx, cy - 12 + breathe, 4, 4.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = shade(actor.skinColor, -0.2);
  ctx.beginPath();
  ctx.ellipse(cx + 1.5, cy - 12 + breathe, 2, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // CASQUE TACTIQUE
  ctx.fillStyle = actor.capeColor;
  ctx.fillRect(cx - 5, cy - 17 + breathe, 10, 5);
  ctx.fillStyle = shade(actor.capeColor, 0.3);
  ctx.fillRect(cx - 5, cy - 17 + breathe, 10, 1);
  // Strap
  ctx.fillStyle = actor.hairColor;
  ctx.fillRect(cx - 5, cy - 13 + breathe, 10, 1);

  // VISIÈRE ORANGE (signature) — couvre les yeux
  const visorPulse = 0.85 + Math.sin(time * 0.07) * 0.15;
  ctx.fillStyle = hexToRgba(actor.accentColor, visorPulse);
  ctx.fillRect(cx - 4, cy - 13 + breathe, 8, 1.5);
  ctx.fillStyle = hexToRgba(actor.glowColor, visorPulse);
  ctx.fillRect(cx - 4, cy - 13 + breathe, 8, 0.5);
  // Reflets
  ctx.fillStyle = '#fff';
  ctx.fillRect(cx - 3, cy - 12.7 + breathe, 1, 0.4);
  ctx.fillRect(cx + 2, cy - 12.7 + breathe, 1, 0.4);

  // Bouche serrée
  ctx.fillStyle = '#1a0805';
  ctx.fillRect(cx - 1, cy - 10 + breathe, 2, 0.5);
}

export default { drawInfernoArcher, infernoArcherConfig };
