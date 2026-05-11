// src/js/render/characters/enemies/cryo_brute.js
// Givre-Marcheur — zombie de cryostase.
// Silhouette voûtée bleue, cristaux d'épaule (signature), yeux cyan,
// halo froid permanent. Inspiré du sprite bestiaire 2D toxic.

import { hexToRgba, shade } from '../../iso-utils.js';

export const cryoBruteConfig = {
  id: 'cryo_brute',
  name: 'GIVRE-MARCHEUR',
  archetype: 'cryo_brute',

  // Palette (héritée du sprite bestiaire — gardé essentiels)
  bodyColor:   '#5a7080',  // chair gelée bleu-gris
  accentColor: '#aee6ff',  // cristaux/yeux cyan
  glowColor:   '#e0f5ff',  // halo plus clair
  skinColor:   '#7a90a0',  // peau exposée
  hairColor:   '#3a3848',  // restes de vêtements (rags)
  capeColor:   '#1a1828',  // rags sombres

  height: 'medium',
  weapon: 'none',
};

/**
 * Renderer iso simple du Givre-Marcheur.
 * Signature standard : (ctx, cx, cy, actor, time, options)
 */
export function drawCryoBrute(ctx, cx, cy, actor, time, options = {}){
  const fxLevel = options.fxLevel ?? 1;
  const idle = actor.idle ?? 0;
  const moving = !!actor.target;
  const bob = Math.sin(idle) * 1.0;
  const breathe = Math.sin(idle * 0.7) * 0.4;
  const stride = moving ? Math.sin(time * 0.4) * 1.5 : 0;

  cy = cy - 10 + bob;

  // ═══ HALO FROID AMBIANT (passive Chill aura) ═══
  if(fxLevel >= 1){
    const auraPulse = 0.4 + Math.sin(time * 0.06) * 0.1;
    const aura = ctx.createRadialGradient(cx, cy + 2, 2, cx, cy + 2, 16);
    aura.addColorStop(0, hexToRgba(actor.glowColor, auraPulse * 0.5));
    aura.addColorStop(0.6, hexToRgba(actor.accentColor, auraPulse * 0.3));
    aura.addColorStop(1, hexToRgba(actor.accentColor, 0));
    ctx.fillStyle = aura;
    ctx.fillRect(cx - 16, cy - 14, 32, 32);
  }

  // ═══ RAGS / LOINCLOTH (derrière) ═══
  ctx.fillStyle = actor.capeColor;
  ctx.fillRect(cx - 6, cy - 1 + breathe, 12, 7);
  ctx.fillStyle = shade(actor.capeColor, 0.3);
  ctx.fillRect(cx - 6, cy - 1 + breathe, 12, 1);

  // ═══ JAMBES (voûtées) ═══
  ctx.fillStyle = shade(actor.bodyColor, -0.3);
  ctx.fillRect(cx - 6, cy + 6 + stride, 4, 9);
  ctx.fillRect(cx + 2, cy + 6 - stride, 4, 9);
  // Pieds nus, gelés
  ctx.fillStyle = shade(actor.bodyColor, -0.5);
  ctx.fillRect(cx - 7, cy + 14 + stride, 5, 2);
  ctx.fillRect(cx + 2, cy + 14 - stride, 5, 2);
  // Givre sous les pieds
  ctx.fillStyle = actor.glowColor;
  ctx.fillRect(cx - 7, cy + 15 + stride, 5, 1);
  ctx.fillRect(cx + 2, cy + 15 - stride, 5, 1);

  // ═══ TORSE (voûté, plus large que le hero) ═══
  ctx.fillStyle = actor.bodyColor;
  ctx.beginPath();
  ctx.moveTo(cx - 8, cy + 5);
  ctx.lineTo(cx + 8, cy + 5);
  ctx.lineTo(cx + 7, cy - 7 + breathe);
  ctx.lineTo(cx - 7, cy - 7 + breathe);
  ctx.closePath();
  ctx.fill();
  // Ombrage droite
  ctx.fillStyle = shade(actor.bodyColor, -0.3);
  ctx.beginPath();
  ctx.moveTo(cx + 8, cy + 5);
  ctx.lineTo(cx + 7, cy - 7 + breathe);
  ctx.lineTo(cx + 3, cy - 7 + breathe);
  ctx.lineTo(cx + 3, cy + 5);
  ctx.closePath();
  ctx.fill();
  // Highlight gauche
  ctx.fillStyle = shade(actor.bodyColor, 0.25);
  ctx.fillRect(cx - 7, cy - 6 + breathe, 2, 11);

  // Rags torse (haut, déchirés)
  ctx.fillStyle = actor.hairColor;
  ctx.fillRect(cx - 7, cy - 7 + breathe, 14, 4);
  ctx.fillStyle = shade(actor.hairColor, 0.3);
  ctx.fillRect(cx - 7, cy - 7 + breathe, 14, 1);

  // Fissures cyan internes (signature)
  const crackPulse = 0.7 + Math.sin(time * 0.08) * 0.3;
  ctx.strokeStyle = hexToRgba(actor.accentColor, crackPulse);
  ctx.lineWidth = 0.7;
  ctx.beginPath();
  ctx.moveTo(cx - 4, cy + 1 + breathe);
  ctx.lineTo(cx - 2, cy + 3 + breathe);
  ctx.moveTo(cx + 3, cy + 0 + breathe);
  ctx.lineTo(cx + 5, cy + 3 + breathe);
  ctx.stroke();

  // ═══ ÉPAULETTES (cristaux — SIGNATURE) ═══
  drawShoulderCrystal(ctx, cx - 8, cy - 7 + breathe, time, 0, actor);
  drawShoulderCrystal(ctx, cx + 8, cy - 7 + breathe, time, 30, actor);

  // ═══ BRAS (pendants, signature zombie) ═══
  ctx.fillStyle = shade(actor.bodyColor, -0.1);
  ctx.fillRect(cx - 9, cy - 4 + breathe, 2, 7);
  ctx.fillRect(cx + 7, cy - 4 + breathe, 2, 7);
  // Avant-bras (peau gelée)
  ctx.fillStyle = actor.skinColor;
  ctx.fillRect(cx - 9, cy + 3 + breathe, 2, 4);
  ctx.fillRect(cx + 7, cy + 3 + breathe, 2, 4);
  // Givre sur les mains
  ctx.fillStyle = actor.accentColor;
  ctx.fillRect(cx - 9, cy + 6 + breathe, 2, 1);
  ctx.fillRect(cx + 7, cy + 6 + breathe, 2, 1);

  // ═══ TÊTE (légèrement penchée — voûtée) ═══
  ctx.fillStyle = actor.skinColor;
  ctx.beginPath();
  ctx.ellipse(cx, cy - 12 + breathe, 4.5, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  // Ombrage visage
  ctx.fillStyle = shade(actor.skinColor, -0.2);
  ctx.beginPath();
  ctx.ellipse(cx + 1.5, cy - 12 + breathe, 2.5, 4.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Cap de givre sur la tête (cheveux gelés)
  ctx.fillStyle = actor.glowColor;
  ctx.fillRect(cx - 4, cy - 16 + breathe, 8, 2);
  ctx.fillStyle = actor.accentColor;
  ctx.fillRect(cx - 4, cy - 15 + breathe, 8, 1);
  // Petit cristal sur le crâne
  ctx.fillStyle = shade(actor.accentColor, -0.2);
  ctx.beginPath();
  ctx.moveTo(cx - 1, cy - 17 + breathe);
  ctx.lineTo(cx + 1, cy - 17 + breathe);
  ctx.lineTo(cx, cy - 19 + breathe);
  ctx.closePath();
  ctx.fill();

  // ═══ YEUX (cyan glow — signature) ═══
  const eyePulse = 0.85 + Math.sin(time * 0.07) * 0.15;
  ctx.fillStyle = '#000';
  ctx.fillRect(cx - 3, cy - 13 + breathe, 1.5, 1.5);
  ctx.fillRect(cx + 1, cy - 13 + breathe, 1.5, 1.5);
  ctx.fillStyle = hexToRgba(actor.accentColor, eyePulse);
  ctx.fillRect(cx - 2.5, cy - 13 + breathe, 1, 1);
  ctx.fillRect(cx + 1.5, cy - 13 + breathe, 1, 1);
  if(fxLevel >= 1){
    ctx.fillStyle = hexToRgba(actor.glowColor, eyePulse * 0.8);
    ctx.fillRect(cx - 2.2, cy - 13 + breathe, 0.5, 0.5);
    ctx.fillRect(cx + 1.8, cy - 13 + breathe, 0.5, 0.5);
  }

  // ═══ BOUCHE (mâchoire agape, signature zombie) ═══
  ctx.fillStyle = '#000';
  ctx.fillRect(cx - 1.5, cy - 10 + breathe, 3, 1.5);
  // Cristal de givre dans la bouche
  ctx.fillStyle = actor.glowColor;
  ctx.fillRect(cx - 1, cy - 10 + breathe, 1, 1);
}

/**
 * Cristal d'épaule — signature visuelle des cryo_brute.
 */
function drawShoulderCrystal(ctx, lx, ly, time, offset, actor){
  const pulse = 0.7 + Math.sin(time * 0.1 + offset * 0.1) * 0.3;
  // Halo
  ctx.fillStyle = hexToRgba(actor.accentColor, pulse * 0.4);
  ctx.fillRect(lx - 2, ly - 5, 4, 5);
  // Corps cristal (pointe vers le haut)
  ctx.fillStyle = shade(actor.accentColor, -0.3);
  ctx.beginPath();
  ctx.moveTo(lx, ly - 5);
  ctx.lineTo(lx - 2, ly - 1);
  ctx.lineTo(lx + 2, ly - 1);
  ctx.closePath();
  ctx.fill();
  // Highlight (côté gauche)
  ctx.fillStyle = actor.accentColor;
  ctx.beginPath();
  ctx.moveTo(lx, ly - 5);
  ctx.lineTo(lx, ly - 1);
  ctx.lineTo(lx + 2, ly - 1);
  ctx.closePath();
  ctx.fill();
  // Bright tip
  ctx.fillStyle = hexToRgba(actor.glowColor, pulse);
  ctx.fillRect(lx - 0.5, ly - 4, 1, 2);
}

export default { drawCryoBrute, cryoBruteConfig };
