// src/js/render/characters/enemies/toxic_alpha.js
// Alpha Putréfié — ÉLITE, mâchoire ressortie, crête dorsale de spores, yeux violets.
import { hexToRgba, shade } from '../iso-utils.js';

export const toxicAlphaConfig = {
  id: 'toxic_alpha', name: 'ALPHA', archetype: 'toxic_alpha',
  bodyColor: '#6a8828', accentColor: '#a040a0', glowColor: '#c8e848',
  skinColor: '#7a9828', hairColor: '#5a2848', capeColor: '#2a3810',
  height: 'large', weapon: 'fangs',
};

export function drawToxicAlpha(ctx, cx, cy, actor, time, options = {}){
  const fxLevel = options.fxLevel ?? 1;
  const idle = actor.idle ?? 0;
  const moving = !!actor.target;
  const bob = Math.sin(idle * 0.9) * 1.0;
  const breathe = Math.sin(idle * 0.65) * 0.5;
  const stride = moving ? Math.sin(time * 0.4) * 1.4 : 0;
  cy = cy - 12 + bob;

  // Halo violet + vert (signature alpha)
  if(fxLevel >= 1){
    const auraPulse = 0.45 + Math.sin(time * 0.06) * 0.15;
    const aura = ctx.createRadialGradient(cx, cy - 2, 2, cx, cy - 2, 20);
    aura.addColorStop(0, hexToRgba(actor.accentColor, auraPulse * 0.5));
    aura.addColorStop(0.4, hexToRgba(actor.glowColor, auraPulse * 0.3));
    aura.addColorStop(1, hexToRgba(actor.accentColor, 0));
    ctx.fillStyle = aura;
    ctx.fillRect(cx - 20, cy - 22, 40, 38);
  }

  // Spores violets flottants (signature)
  if(fxLevel >= 1){
    for(let i = 0; i < 5; i++){
      const t = (time * 0.03 + i * 0.4) % 1;
      const sx = cx + Math.sin(i * 1.5 + time * 0.04) * 9;
      const sy = cy - 8 - t * 16;
      ctx.fillStyle = hexToRgba(actor.accentColor, (1 - t) * 0.6);
      ctx.fillRect(Math.round(sx), Math.round(sy), 1, 1);
    }
  }

  // Jambes massives
  ctx.fillStyle = shade(actor.bodyColor, -0.3);
  ctx.fillRect(cx - 7, cy + 7 + stride, 5, 10);
  ctx.fillRect(cx + 2, cy + 7 - stride, 5, 10);
  // Plaques violettes
  ctx.fillStyle = '#5a2848';
  ctx.fillRect(cx - 6, cy + 10 + stride, 3, 3);
  ctx.fillRect(cx + 3, cy + 12 - stride, 3, 3);
  // Pieds griffus
  ctx.fillStyle = '#2a1408';
  ctx.fillRect(cx - 8, cy + 16 + stride, 6, 2);
  ctx.fillRect(cx + 2, cy + 16 - stride, 6, 2);
  // Griffes pieds
  for(let i = 0; i < 3; i++){
    ctx.fillRect(cx - 8 + i * 2, cy + 18 + stride, 0.8, 1.5);
    ctx.fillRect(cx + 2 + i * 2, cy + 18 - stride, 0.8, 1.5);
  }

  // TORSE VOÛTÉ massif
  ctx.fillStyle = actor.bodyColor;
  ctx.beginPath();
  ctx.moveTo(cx - 9, cy + 7);
  ctx.lineTo(cx + 9, cy + 7);
  ctx.lineTo(cx + 8, cy - 8 + breathe);
  ctx.lineTo(cx - 8, cy - 8 + breathe);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = shade(actor.bodyColor, -0.3);
  ctx.beginPath();
  ctx.moveTo(cx + 9, cy + 7);
  ctx.lineTo(cx + 8, cy - 8 + breathe);
  ctx.lineTo(cx + 3, cy - 8 + breathe);
  ctx.lineTo(cx + 3, cy + 7);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = shade(actor.bodyColor, 0.25);
  ctx.fillRect(cx - 8, cy - 7 + breathe, 2, 14);

  // PLAQUES NÉCROSÉES VIOLETTES multiples (signature)
  ctx.fillStyle = '#5a2848';
  ctx.fillRect(cx - 6, cy - 5 + breathe, 4, 3);
  ctx.fillRect(cx + 2, cy + 0 + breathe, 4, 3);
  ctx.fillRect(cx - 3, cy + 2 + breathe, 3, 2);
  // Centres purulents
  ctx.fillStyle = '#8a3a6a';
  ctx.fillRect(cx - 5, cy - 4 + breathe, 1, 1);
  ctx.fillRect(cx + 3, cy + 1 + breathe, 1, 1);
  ctx.fillStyle = actor.accentColor;
  ctx.fillRect(cx + 4, cy + 1 + breathe, 0.5, 0.5);

  // Veines violettes pulsantes
  const veinPulse = 0.7 + Math.sin(time * 0.08) * 0.2;
  ctx.strokeStyle = hexToRgba(actor.accentColor, veinPulse);
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(cx - 7, cy - 6 + breathe); ctx.lineTo(cx - 4, cy + 1 + breathe);
  ctx.moveTo(cx + 6, cy - 5 + breathe); ctx.lineTo(cx + 3, cy + 2 + breathe);
  ctx.stroke();

  // BRAS MASSIFS
  ctx.fillStyle = shade(actor.bodyColor, -0.1);
  ctx.fillRect(cx - 10, cy - 7 + breathe, 3, 11);
  ctx.fillRect(cx + 7, cy - 7 + breathe, 3, 11);
  // Plaques bras
  ctx.fillStyle = '#5a2848';
  ctx.fillRect(cx - 10, cy - 4 + breathe, 3, 2);
  ctx.fillRect(cx + 7, cy - 4 + breathe, 3, 2);
  // Griffes (poings massifs)
  ctx.fillStyle = '#1a0805';
  ctx.fillRect(cx - 10, cy + 4 + breathe, 3, 3);
  ctx.fillRect(cx + 7, cy + 4 + breathe, 3, 3);
  for(let i = 0; i < 4; i++){
    ctx.fillRect(cx - 10 + i * 0.7, cy + 7 + breathe, 0.5, 2);
    ctx.fillRect(cx + 7 + i * 0.7, cy + 7 + breathe, 0.5, 2);
  }

  // CRÊTE DORSALE DE SPORES VIOLETTES (signature) — derrière la tête, sortant du dos
  drawSporeRidge(ctx, cx, cy - 8 + breathe, time, actor);

  // TÊTE plus large (signature)
  ctx.fillStyle = actor.skinColor;
  ctx.beginPath();
  ctx.ellipse(cx, cy - 13 + breathe, 5.5, 5.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = shade(actor.skinColor, -0.2);
  ctx.beginPath();
  ctx.ellipse(cx + 2, cy - 13 + breathe, 3, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Plaques tête
  ctx.fillStyle = '#5a2848';
  ctx.fillRect(cx - 4, cy - 16 + breathe, 2, 2);
  ctx.fillRect(cx + 1, cy - 17 + breathe, 2, 2);

  // YEUX VIOLETS (signature, distinct du brute jaune)
  const eyePulse = 0.92 + Math.sin(time * 0.09) * 0.08;
  ctx.fillStyle = '#000';
  ctx.fillRect(cx - 3.5, cy - 14 + breathe, 2, 1.5);
  ctx.fillRect(cx + 1.5, cy - 14 + breathe, 2, 1.5);
  ctx.fillStyle = hexToRgba(actor.accentColor, eyePulse);
  ctx.fillRect(cx - 3.5, cy - 14 + breathe, 1.5, 1);
  ctx.fillRect(cx + 1.5, cy - 14 + breathe, 1.5, 1);
  ctx.fillStyle = hexToRgba('#e090e0', eyePulse);
  ctx.fillRect(cx - 3.3, cy - 14 + breathe, 0.5, 0.5);
  ctx.fillRect(cx + 1.7, cy - 14 + breathe, 0.5, 0.5);

  // MÂCHOIRE RESSORTIE avec CROCS (signature)
  // Lower jaw extending forward
  ctx.fillStyle = shade(actor.skinColor, -0.2);
  ctx.beginPath();
  ctx.moveTo(cx - 4, cy - 10 + breathe);
  ctx.lineTo(cx + 4, cy - 10 + breathe);
  ctx.lineTo(cx + 5, cy - 7 + breathe);
  ctx.lineTo(cx - 5, cy - 7 + breathe);
  ctx.closePath();
  ctx.fill();
  // Mouth opening
  ctx.fillStyle = '#000';
  ctx.fillRect(cx - 3, cy - 10 + breathe, 6, 2);
  // CROCS supérieurs (visible)
  ctx.fillStyle = '#d8c8a0';
  ctx.beginPath();
  ctx.moveTo(cx - 3, cy - 10 + breathe);
  ctx.lineTo(cx - 2.5, cy - 7 + breathe);
  ctx.lineTo(cx - 2, cy - 10 + breathe);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx + 2, cy - 10 + breathe);
  ctx.lineTo(cx + 2.5, cy - 7 + breathe);
  ctx.lineTo(cx + 3, cy - 10 + breathe);
  ctx.closePath();
  ctx.fill();
  // Drool
  ctx.fillStyle = hexToRgba(actor.glowColor, 0.85);
  ctx.fillRect(cx - 2.5, cy - 7 + breathe, 0.5, 2);
  ctx.fillRect(cx + 2.5, cy - 7 + breathe, 0.5, 2);
}

function drawSporeRidge(ctx, lx, ly, time, actor){
  // 5 spores en crête (signature)
  for(let i = 0; i < 5; i++){
    const offset = (i - 2) * 2;
    const t = time * 0.05 + i * 0.8;
    const pulse = 0.7 + Math.sin(t) * 0.3;
    const h = 4 + Math.abs(offset) * 0.3;
    // Stalk
    ctx.fillStyle = shade(actor.accentColor, -0.4);
    ctx.fillRect(lx + offset - 0.5, ly - h, 1, h);
    // Bulb
    ctx.fillStyle = actor.accentColor;
    ctx.beginPath();
    ctx.arc(lx + offset, ly - h, 1.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = hexToRgba('#e090e0', pulse);
    ctx.fillRect(lx + offset - 0.3, ly - h - 0.3, 0.7, 0.7);
    // Spore particle release
    if(((time + i * 7) % 30) < 5){
      ctx.fillStyle = hexToRgba(actor.accentColor, 0.6);
      ctx.fillRect(lx + offset, ly - h - 2, 0.5, 0.5);
    }
  }
}

export default { drawToxicAlpha, toxicAlphaConfig };
