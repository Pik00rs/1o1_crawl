// src/js/render/characters/enemies/voidnet_corrupter.js
// Corrupteur — silhouette pâle, glyphes magenta orbitants, hood.
import { hexToRgba, shade } from '../../iso-utils.js';

export const voidnetCorrupterConfig = {
  id: 'voidnet_corrupter', name: 'CORRUPTEUR', archetype: 'voidnet_corrupter',
  bodyColor: '#5a4870', accentColor: '#ff40e0', glowColor: '#e0a0ff',
  skinColor: '#7a6890', hairColor: '#2a1830', capeColor: '#1a0828',
  height: 'small', weapon: 'glyph_curse',
};

export function drawVoidnetCorrupter(ctx, cx, cy, actor, time, options = {}){
  const fxLevel = options.fxLevel ?? 1;
  const idle = actor.idle ?? 0;
  const moving = !!actor.target;
  const float = Math.sin(idle * 0.9) * 1.3;
  const breathe = Math.sin(idle * 0.7) * 0.3;
  const stride = moving ? Math.sin(time * 0.42) * 1.2 : 0;
  cy = cy - 11 + float;

  // Halo magenta + violet
  if(fxLevel >= 1){
    const auraPulse = 0.45 + Math.sin(time * 0.07) * 0.15;
    const aura = ctx.createRadialGradient(cx, cy - 2, 2, cx, cy - 2, 16);
    aura.addColorStop(0, hexToRgba(actor.glowColor, auraPulse * 0.5));
    aura.addColorStop(0.5, hexToRgba(actor.accentColor, auraPulse * 0.3));
    aura.addColorStop(1, hexToRgba(actor.accentColor, 0));
    ctx.fillStyle = aura;
    ctx.fillRect(cx - 16, cy - 18, 32, 32);
  }

  // Robe basse (s'évase)
  ctx.fillStyle = actor.capeColor;
  ctx.beginPath();
  ctx.moveTo(cx - 8, cy + 8);
  ctx.lineTo(cx + 8, cy + 8);
  ctx.lineTo(cx + 6, cy - 6 + breathe);
  ctx.lineTo(cx - 6, cy - 6 + breathe);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = actor.bodyColor;
  ctx.fillRect(cx - 6, cy - 6 + breathe, 12, 14);
  ctx.fillStyle = shade(actor.bodyColor, 0.3);
  ctx.fillRect(cx - 6, cy - 6 + breathe, 2, 14);

  // Glow hem
  ctx.fillStyle = hexToRgba(actor.accentColor, 0.7);
  ctx.fillRect(cx - 8, cy + 7, 16, 0.5);

  // Symboles magenta sur robe
  ctx.fillStyle = hexToRgba(actor.accentColor, 0.6);
  ctx.fillRect(cx - 3, cy + 1 + breathe, 1, 1);
  ctx.fillRect(cx - 2, cy + 0 + breathe, 1, 1);
  ctx.fillRect(cx - 3, cy - 1 + breathe, 1, 1);
  ctx.fillRect(cx + 2, cy + 3 + breathe, 2, 1);

  // Bras (sleeves)
  ctx.fillStyle = actor.capeColor;
  ctx.fillRect(cx - 8, cy - 5 + breathe, 2, 8);
  ctx.fillRect(cx + 6, cy - 5 + breathe, 2, 8);
  // Mains pâles (peau)
  ctx.fillStyle = actor.skinColor;
  ctx.fillRect(cx - 8, cy + 3 + breathe, 2, 3);
  ctx.fillRect(cx + 6, cy + 3 + breathe, 2, 3);
  // Ongles
  ctx.fillStyle = actor.accentColor;
  for(let i = 0; i < 3; i++){
    ctx.fillRect(cx - 8 + i * 0.6, cy + 6 + breathe, 0.4, 0.5);
    ctx.fillRect(cx + 6 + i * 0.6, cy + 6 + breathe, 0.4, 0.5);
  }

  // ═══ GLYPHES MAGENTA ORBITANTS (signature) ═══
  if(fxLevel >= 1){
    drawOrbitingGlyphs(ctx, cx, cy + 0 + breathe, time, actor);
  }

  // CAPUCHE
  ctx.fillStyle = actor.capeColor;
  ctx.beginPath();
  ctx.moveTo(cx - 7, cy - 6 + breathe);
  ctx.lineTo(cx + 7, cy - 6 + breathe);
  ctx.lineTo(cx + 6, cy - 14 + breathe);
  ctx.lineTo(cx + 3, cy - 17 + breathe);
  ctx.lineTo(cx - 3, cy - 17 + breathe);
  ctx.lineTo(cx - 6, cy - 14 + breathe);
  ctx.closePath();
  ctx.fill();
  // Inner shadow
  ctx.fillStyle = '#000';
  ctx.fillRect(cx - 3, cy - 14 + breathe, 6, 5);
  // Glyph on hood
  ctx.fillStyle = hexToRgba(actor.accentColor, 0.85);
  ctx.fillRect(cx, cy - 16 + breathe, 0.5, 1);
  ctx.fillRect(cx - 0.5, cy - 15 + breathe, 1.5, 0.5);

  // VISAGE pâle visible
  ctx.fillStyle = actor.skinColor;
  ctx.fillRect(cx - 3, cy - 12 + breathe, 6, 4);

  // YEUX MAGENTA (signature)
  const eyePulse = 0.92 + Math.sin(time * 0.09) * 0.08;
  ctx.fillStyle = hexToRgba(actor.accentColor, eyePulse);
  ctx.fillRect(cx - 2.5, cy - 11 + breathe, 1.5, 1.5);
  ctx.fillRect(cx + 1, cy - 11 + breathe, 1.5, 1.5);
  ctx.fillStyle = hexToRgba('#ffe0ff', eyePulse);
  ctx.fillRect(cx - 2.5, cy - 11 + breathe, 0.5, 0.5);
  ctx.fillRect(cx + 1, cy - 11 + breathe, 0.5, 0.5);

  // Bouche cousue (signature, corruption)
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 0.6;
  ctx.beginPath();
  ctx.moveTo(cx - 1.5, cy - 9 + breathe);
  ctx.lineTo(cx + 1.5, cy - 9 + breathe);
  ctx.stroke();
  // X stitches
  ctx.beginPath();
  for(let i = 0; i < 3; i++){
    const xx = cx - 1.5 + i * 1;
    ctx.moveTo(xx, cy - 9.3 + breathe); ctx.lineTo(xx + 0.5, cy - 8.7 + breathe);
    ctx.moveTo(xx + 0.5, cy - 9.3 + breathe); ctx.lineTo(xx, cy - 8.7 + breathe);
  }
  ctx.stroke();
}

function drawOrbitingGlyphs(ctx, lx, ly, time, actor){
  // 4 glyphes magenta tournant
  for(let i = 0; i < 4; i++){
    const angle = (i / 4) * Math.PI * 2 + time * 0.04;
    const r = 7;
    const x = lx + Math.cos(angle) * r;
    const y = ly + Math.sin(angle) * r * 0.5;
    const pulse = 0.85 + Math.sin(time * 0.1 + i) * 0.15;
    // Glyph (small geometric shape)
    ctx.fillStyle = hexToRgba(actor.accentColor, pulse);
    if(i === 0){
      // Triangle
      ctx.beginPath();
      ctx.moveTo(x, y - 1);
      ctx.lineTo(x - 1, y + 1);
      ctx.lineTo(x + 1, y + 1);
      ctx.closePath();
      ctx.fill();
    } else if(i === 1){
      // Square
      ctx.fillRect(Math.round(x - 0.7), Math.round(y - 0.7), 1.4, 1.4);
    } else if(i === 2){
      // Diamond
      ctx.beginPath();
      ctx.moveTo(x, y - 1);
      ctx.lineTo(x + 1, y);
      ctx.lineTo(x, y + 1);
      ctx.lineTo(x - 1, y);
      ctx.closePath();
      ctx.fill();
    } else {
      // Cross
      ctx.fillRect(x - 0.3, y - 1, 0.6, 2);
      ctx.fillRect(x - 1, y - 0.3, 2, 0.6);
    }
    // Glow
    ctx.fillStyle = hexToRgba(actor.glowColor, pulse * 0.6);
    ctx.fillRect(Math.round(x - 0.3), Math.round(y - 0.3), 0.5, 0.5);
  }
}

export default { drawVoidnetCorrupter, voidnetCorrupterConfig };
