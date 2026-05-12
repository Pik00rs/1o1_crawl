// src/js/render/characters/enemies/toxic_grafted.js
// Greffé de Chair — abomination, 4 bras, 2 têtes fusionnées, sutures visibles.
import { hexToRgba, shade } from '../iso-utils.js';

export const toxicGraftedConfig = {
  id: 'toxic_grafted', name: 'GREFFÉ', archetype: 'toxic_grafted',
  bodyColor: '#7a6850', accentColor: '#8eb828', glowColor: '#c8e848',
  skinColor: '#a06850', hairColor: '#3a1a08', capeColor: '#3a3018',
  height: 'large', weapon: 'flesh_fists',
};

export function drawToxicGrafted(ctx, cx, cy, actor, time, options = {}){
  const fxLevel = options.fxLevel ?? 1;
  const idle = actor.idle ?? 0;
  const moving = !!actor.target;
  const bob = Math.sin(idle * 0.8) * 0.9;
  const breathe = Math.sin(idle * 0.6) * 0.5;
  const stride = moving ? Math.sin(time * 0.35) * 1.4 : 0;
  cy = cy - 12 + bob;

  // Halo vert-violet (chair toxique)
  if(fxLevel >= 1){
    const auraPulse = 0.4 + Math.sin(time * 0.06) * 0.15;
    const aura = ctx.createRadialGradient(cx, cy - 2, 2, cx, cy - 2, 18);
    aura.addColorStop(0, hexToRgba(actor.glowColor, auraPulse * 0.5));
    aura.addColorStop(0.5, hexToRgba(actor.accentColor, auraPulse * 0.3));
    aura.addColorStop(1, hexToRgba(actor.accentColor, 0));
    ctx.fillStyle = aura;
    ctx.fillRect(cx - 18, cy - 20, 36, 34);
  }

  // Jambes massives
  ctx.fillStyle = shade(actor.bodyColor, -0.3);
  ctx.fillRect(cx - 7, cy + 7 + stride, 5, 10);
  ctx.fillRect(cx + 2, cy + 7 - stride, 5, 10);
  // Sutures jambes (signature)
  ctx.strokeStyle = '#1a0805';
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  for(let i = 0; i < 4; i++){
    const yy = cy + 9 + i * 2 + stride;
    ctx.moveTo(cx - 5, yy); ctx.lineTo(cx - 4, yy);
    const yy2 = cy + 9 + i * 2 - stride;
    ctx.moveTo(cx + 3, yy2); ctx.lineTo(cx + 4, yy2);
  }
  ctx.stroke();
  // Pieds
  ctx.fillStyle = '#3a1a08';
  ctx.fillRect(cx - 8, cy + 16 + stride, 6, 2);
  ctx.fillRect(cx + 2, cy + 16 - stride, 6, 2);

  // TORSE MASSIF avec PEAUX DIFFÉRENTES (signature, 2 types de chair)
  // Half gauche (vert toxique)
  ctx.fillStyle = '#6a8828';
  ctx.beginPath();
  ctx.moveTo(cx - 9, cy + 7);
  ctx.lineTo(cx, cy + 7);
  ctx.lineTo(cx, cy - 9 + breathe);
  ctx.lineTo(cx - 8, cy - 9 + breathe);
  ctx.closePath();
  ctx.fill();
  // Half droite (skin pâle)
  ctx.fillStyle = actor.skinColor;
  ctx.beginPath();
  ctx.moveTo(cx, cy + 7);
  ctx.lineTo(cx + 9, cy + 7);
  ctx.lineTo(cx + 8, cy - 9 + breathe);
  ctx.lineTo(cx, cy - 9 + breathe);
  ctx.closePath();
  ctx.fill();

  // SUTURE CENTRALE VERTICALE (signature)
  const stitchPulse = 0.85 + Math.sin(time * 0.06) * 0.15;
  ctx.fillStyle = '#1a0805';
  ctx.fillRect(cx - 0.5, cy - 9 + breathe, 1, 16);
  // X-stitches
  ctx.strokeStyle = '#1a0805';
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  for(let i = 0; i < 8; i++){
    const yy = cy - 8 + breathe + i * 2;
    ctx.moveTo(cx - 1.5, yy); ctx.lineTo(cx + 1.5, yy + 1);
    ctx.moveTo(cx + 1.5, yy); ctx.lineTo(cx - 1.5, yy + 1);
  }
  ctx.stroke();
  // Glow le long de la couture
  ctx.fillStyle = hexToRgba(actor.glowColor, stitchPulse * 0.4);
  ctx.fillRect(cx - 0.2, cy - 9 + breathe, 0.5, 16);

  // PLAQUES NÉCROSÉES (signature, irrégulières)
  ctx.fillStyle = '#5a2848';
  ctx.fillRect(cx - 5, cy - 4 + breathe, 3, 2);
  ctx.fillRect(cx + 3, cy + 1 + breathe, 2, 2);
  // Centre purulent
  ctx.fillStyle = '#8a3a6a';
  ctx.fillRect(cx - 4, cy - 3 + breathe, 1, 1);

  // ═══ 4 BRAS (signature) ═══
  // Bras principaux (épaules normales)
  ctx.fillStyle = '#6a8828';
  ctx.fillRect(cx - 11, cy - 7 + breathe, 3, 9);
  ctx.fillStyle = actor.skinColor;
  ctx.fillRect(cx + 8, cy - 7 + breathe, 3, 9);
  // Fists principaux
  ctx.fillStyle = '#3a1a08';
  ctx.fillRect(cx - 11, cy + 2 + breathe, 3, 3);
  ctx.fillStyle = shade(actor.skinColor, -0.4);
  ctx.fillRect(cx + 8, cy + 2 + breathe, 3, 3);

  // BRAS SECONDAIRES (signature, plus petits, qui sortent du torse latéralement)
  // Stitches au point d'attache
  ctx.fillStyle = '#1a0805';
  ctx.fillRect(cx - 9, cy - 3 + breathe, 1, 3);
  ctx.fillRect(cx + 8, cy - 3 + breathe, 1, 3);
  // Bras secondaires
  ctx.fillStyle = actor.skinColor;
  ctx.fillRect(cx - 13, cy - 2 + breathe, 4, 2);
  ctx.fillStyle = '#6a8828';
  ctx.fillRect(cx + 9, cy - 2 + breathe, 4, 2);
  // Hands secondaires (griffes)
  ctx.fillStyle = '#3a1a08';
  ctx.fillRect(cx - 14, cy - 2 + breathe, 2, 3);
  ctx.fillRect(cx + 12, cy - 2 + breathe, 2, 3);
  // Griffes
  for(let i = 0; i < 3; i++){
    ctx.fillRect(cx - 14 + i * 0.6, cy + 1 + breathe, 0.4, 1.5);
    ctx.fillRect(cx + 12 + i * 0.6, cy + 1 + breathe, 0.4, 1.5);
  }

  // ═══ 2 TÊTES FUSIONNÉES (signature) ═══
  // Tête gauche (verte)
  ctx.fillStyle = '#6a8828';
  ctx.beginPath();
  ctx.ellipse(cx - 3, cy - 13 + breathe, 3.5, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = shade('#6a8828', -0.2);
  ctx.beginPath();
  ctx.ellipse(cx - 2, cy - 13 + breathe, 1.5, 3.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Tête droite (skin)
  ctx.fillStyle = actor.skinColor;
  ctx.beginPath();
  ctx.ellipse(cx + 3, cy - 13 + breathe, 3.5, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = shade(actor.skinColor, -0.2);
  ctx.beginPath();
  ctx.ellipse(cx + 4, cy - 13 + breathe, 1.5, 3.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Joint between heads (suture diagonale)
  ctx.strokeStyle = '#1a0805';
  ctx.lineWidth = 0.6;
  ctx.beginPath();
  ctx.moveTo(cx, cy - 15 + breathe);
  ctx.lineTo(cx, cy - 11 + breathe);
  ctx.stroke();
  // X stitches
  ctx.beginPath();
  ctx.moveTo(cx - 1, cy - 15 + breathe); ctx.lineTo(cx + 1, cy - 14 + breathe);
  ctx.moveTo(cx + 1, cy - 15 + breathe); ctx.lineTo(cx - 1, cy - 14 + breathe);
  ctx.moveTo(cx - 1, cy - 13 + breathe); ctx.lineTo(cx + 1, cy - 12 + breathe);
  ctx.moveTo(cx + 1, cy - 13 + breathe); ctx.lineTo(cx - 1, cy - 12 + breathe);
  ctx.stroke();

  // Yeux têtes (chacun 2 yeux)
  const eyePulse = 0.85 + Math.sin(time * 0.08) * 0.15;
  // Tête gauche eyes (jaunes)
  ctx.fillStyle = '#000';
  ctx.fillRect(cx - 4.5, cy - 14 + breathe, 1, 1);
  ctx.fillRect(cx - 2.5, cy - 14 + breathe, 1, 1);
  ctx.fillStyle = hexToRgba('#d8c020', eyePulse);
  ctx.fillRect(cx - 4.3, cy - 14 + breathe, 0.5, 0.5);
  ctx.fillRect(cx - 2.3, cy - 14 + breathe, 0.5, 0.5);
  // Tête droite eyes (rouges)
  ctx.fillStyle = '#000';
  ctx.fillRect(cx + 1.5, cy - 14 + breathe, 1, 1);
  ctx.fillRect(cx + 3.5, cy - 14 + breathe, 1, 1);
  ctx.fillStyle = hexToRgba('#ff3030', eyePulse);
  ctx.fillRect(cx + 1.7, cy - 14 + breathe, 0.5, 0.5);
  ctx.fillRect(cx + 3.7, cy - 14 + breathe, 0.5, 0.5);

  // Bouches
  ctx.fillStyle = '#000';
  ctx.fillRect(cx - 4, cy - 11 + breathe, 2, 0.5);
  ctx.fillRect(cx + 2, cy - 11 + breathe, 2, 0.5);
  // Drool gauche
  ctx.fillStyle = actor.accentColor;
  ctx.fillRect(cx - 3, cy - 10 + breathe, 0.5, 1.5);
}

export default { drawToxicGrafted, toxicGraftedConfig };
