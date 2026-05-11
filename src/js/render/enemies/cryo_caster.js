// src/js/render/characters/enemies/cryo_caster.js
// Cryomancien — caster avec orbe de glace et masque chirurgical gelé.
import { hexToRgba, shade } from '../../iso-utils.js';

export const cryoCasterConfig = {
  id: 'cryo_caster', name: 'CRYOMANCIEN', archetype: 'cryo_caster',
  bodyColor: '#a0c0d8', accentColor: '#4fc3f7', glowColor: '#aee6ff',
  skinColor: '#d8e4f0', hairColor: '#7898b0', capeColor: '#3a5878',
  height: 'small', weapon: 'ice_orb',
};

export function drawCryoCaster(ctx, cx, cy, actor, time, options = {}){
  const fxLevel = options.fxLevel ?? 1;
  const idle = actor.idle ?? 0;
  const moving = !!actor.target;
  const bob = Math.sin(idle * 1.0) * 1.2;
  const breathe = Math.sin(idle * 0.7) * 0.3;
  const stride = moving ? Math.sin(time * 0.4) * 1.2 : 0;
  cy = cy - 12 + bob; // Lévitation légère

  // Halo cyan
  if(fxLevel >= 1){
    const auraPulse = 0.4 + Math.sin(time * 0.06) * 0.1;
    const aura = ctx.createRadialGradient(cx, cy - 2, 2, cx, cy - 2, 14);
    aura.addColorStop(0, hexToRgba(actor.glowColor, auraPulse * 0.5));
    aura.addColorStop(0.6, hexToRgba(actor.accentColor, auraPulse * 0.3));
    aura.addColorStop(1, hexToRgba(actor.accentColor, 0));
    ctx.fillStyle = aura;
    ctx.fillRect(cx - 14, cy - 16, 28, 28);
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
  ctx.fillStyle = shade(actor.bodyColor, 0.2);
  ctx.fillRect(cx - 6, cy - 6 + breathe, 2, 14);
  ctx.fillStyle = shade(actor.capeColor, -0.2);
  ctx.fillRect(cx + 4, cy - 6 + breathe, 2, 14);

  // Belt cyan accent
  ctx.fillStyle = actor.accentColor;
  ctx.fillRect(cx - 6, cy - 1 + breathe, 12, 0.5);

  // Bras (sleeves)
  ctx.fillStyle = actor.capeColor;
  ctx.fillRect(cx - 8, cy - 5 + breathe, 2, 8);
  ctx.fillRect(cx + 6, cy - 5 + breathe, 2, 8);
  // Glove gris foncé
  ctx.fillStyle = '#3a4858';
  ctx.fillRect(cx - 8, cy + 3 + breathe, 2, 3);
  ctx.fillRect(cx + 6, cy + 3 + breathe, 2, 3);

  // ORBE DE GLACE (signature) dans main gauche
  const orbPulse = 0.85 + Math.sin(time * 0.1) * 0.15;
  // Halo orbe
  const orbGrad = ctx.createRadialGradient(cx - 9, cy + 6 + breathe, 0, cx - 9, cy + 6 + breathe, 6);
  orbGrad.addColorStop(0, hexToRgba('#ffffff', orbPulse));
  orbGrad.addColorStop(0.4, hexToRgba(actor.glowColor, orbPulse * 0.8));
  orbGrad.addColorStop(1, hexToRgba(actor.accentColor, 0));
  ctx.fillStyle = orbGrad;
  ctx.fillRect(cx - 15, cy, 12, 12);
  // Core orbe
  ctx.fillStyle = actor.accentColor;
  ctx.beginPath();
  ctx.arc(cx - 9, cy + 6 + breathe, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = actor.glowColor;
  ctx.beginPath();
  ctx.arc(cx - 9, cy + 6 + breathe, 1.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.fillRect(cx - 9.5, cy + 5.5 + breathe, 1, 1);

  // CAPUCHE
  ctx.fillStyle = actor.hairColor;
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
  ctx.fillRect(cx - 3, cy - 13 + breathe, 6, 4);

  // MASQUE CHIRURGICAL gelé (signature)
  ctx.fillStyle = '#a0c0d8';
  ctx.fillRect(cx - 3, cy - 11 + breathe, 6, 2);
  ctx.fillStyle = '#e0f5ff';
  ctx.fillRect(cx - 3, cy - 11 + breathe, 6, 1);

  // YEUX CYAN
  const eyePulse = 0.85 + Math.sin(time * 0.08) * 0.15;
  ctx.fillStyle = hexToRgba(actor.glowColor, eyePulse);
  ctx.fillRect(cx - 3, cy - 13 + breathe, 1.5, 1.5);
  ctx.fillRect(cx + 1.5, cy - 13 + breathe, 1.5, 1.5);
  ctx.fillStyle = hexToRgba('#ffffff', eyePulse);
  ctx.fillRect(cx - 3, cy - 13 + breathe, 0.5, 0.5);
  ctx.fillRect(cx + 1.5, cy - 13 + breathe, 0.5, 0.5);

  // Cristaux sur capuche
  ctx.fillStyle = actor.glowColor;
  ctx.fillRect(cx - 4, cy - 16 + breathe, 1, 2);
  ctx.fillRect(cx + 3, cy - 16 + breathe, 1, 2);
}

export default { drawCryoCaster, cryoCasterConfig };
