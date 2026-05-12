// src/js/render/characters/enemies/cryo_skater.js
// Patineur Spectral — silhouette dynamique, lames de glace aux pieds, semi-translucide.
import { hexToRgba, shade } from '../iso-utils.js';

export const cryoSkaterConfig = {
  id: 'cryo_skater', name: 'PATINEUR', archetype: 'cryo_skater',
  bodyColor: '#4a6878', accentColor: '#aee6ff', glowColor: '#cef0ff',
  skinColor: '#6a8898', hairColor: '#28384a', capeColor: '#1a2838',
  height: 'small', weapon: 'ice_blade',
};

export function drawCryoSkater(ctx, cx, cy, actor, time, options = {}){
  const fxLevel = options.fxLevel ?? 1;
  const idle = actor.idle ?? 0;
  const moving = !!actor.target;
  const slide = Math.sin(idle * 1.3) * 1.2;
  const breathe = Math.sin(idle * 0.9) * 0.3;
  const stride = moving ? Math.sin(time * 0.6) * 1.8 : 0;
  cy = cy - 9 + slide;

  // Halo cyan + trail
  if(fxLevel >= 1){
    // Trail behind
    for(let i = 1; i <= 3; i++){
      const a = (0.2 - i * 0.05);
      ctx.fillStyle = hexToRgba(actor.accentColor, a);
      ctx.fillRect(cx - 10 - i * 3, cy - 4, 8, 14);
    }
    // Halo
    const auraPulse = 0.3 + Math.sin(time * 0.08) * 0.1;
    const aura = ctx.createRadialGradient(cx, cy - 2, 2, cx, cy - 2, 13);
    aura.addColorStop(0, hexToRgba(actor.accentColor, auraPulse * 0.4));
    aura.addColorStop(1, hexToRgba(actor.accentColor, 0));
    ctx.fillStyle = aura;
    ctx.fillRect(cx - 13, cy - 15, 26, 26);
  }

  // Translucide global (semi)
  ctx.save();
  ctx.globalAlpha = 0.85;

  // Posture patineur : un genou plié, un avancé
  // Front leg (gauche, plié)
  ctx.fillStyle = shade(actor.bodyColor, -0.3);
  ctx.fillRect(cx - 6, cy + 6 + stride, 4, 8);
  // Back leg (droite, tendue)
  ctx.fillStyle = shade(actor.bodyColor, -0.3);
  ctx.fillRect(cx + 2, cy + 6 - stride, 4, 8);

  // LAMES DE GLACE AUX PIEDS (signature)
  ctx.fillStyle = actor.glowColor;
  ctx.fillRect(cx - 7, cy + 14 + stride, 6, 2);
  ctx.fillRect(cx + 1, cy + 14 - stride, 6, 2);
  ctx.fillStyle = '#fff';
  ctx.fillRect(cx - 7, cy + 14 + stride, 6, 0.5);
  ctx.fillRect(cx + 1, cy + 14 - stride, 6, 0.5);
  // Particules sous les lames
  if(time % 4 === 0){
    ctx.fillStyle = actor.glowColor;
    ctx.fillRect(cx - 3 + ((time % 8) - 4), cy + 16, 1, 1);
  }

  // Torse penché avant
  ctx.fillStyle = actor.bodyColor;
  ctx.beginPath();
  ctx.moveTo(cx - 7, cy - 5 + breathe);
  ctx.lineTo(cx + 7, cy - 5 + breathe);
  ctx.lineTo(cx + 5, cy + 6);
  ctx.lineTo(cx - 5, cy + 6);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = shade(actor.bodyColor, 0.2);
  ctx.fillRect(cx - 6, cy - 5 + breathe, 2, 10);

  // Fissures cyan
  const crackPulse = 0.6 + Math.sin(time * 0.1) * 0.2;
  ctx.strokeStyle = hexToRgba(actor.accentColor, crackPulse);
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(cx - 3, cy - 3 + breathe);
  ctx.lineTo(cx - 1, cy + 1 + breathe);
  ctx.stroke();

  // Bras (un avant, un arrière)
  ctx.fillStyle = shade(actor.bodyColor, -0.2);
  ctx.fillRect(cx - 8, cy - 4 + breathe, 2, 6);
  ctx.fillRect(cx + 6, cy - 4 + breathe, 2, 6);
  // Griffes de glace mains
  ctx.fillStyle = actor.glowColor;
  ctx.fillRect(cx - 9, cy + 2 + breathe, 1, 3);
  ctx.fillRect(cx + 8, cy + 2 + breathe, 1, 3);

  // Tête + cagoule
  ctx.fillStyle = actor.capeColor;
  ctx.beginPath();
  ctx.ellipse(cx, cy - 10 + breathe, 4, 4.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = actor.bodyColor;
  ctx.beginPath();
  ctx.ellipse(cx, cy - 10 + breathe, 3.5, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  // Cap cristal
  ctx.fillStyle = actor.accentColor;
  ctx.fillRect(cx - 3, cy - 13 + breathe, 6, 1);

  // VISIÈRE CYAN HORIZONTALE (signature)
  const eyePulse = 0.85 + Math.sin(time * 0.09) * 0.15;
  ctx.fillStyle = hexToRgba(actor.accentColor, eyePulse);
  ctx.fillRect(cx - 3, cy - 11 + breathe, 6, 1.5);
  ctx.fillStyle = hexToRgba('#fff', eyePulse);
  ctx.fillRect(cx - 2, cy - 11 + breathe, 1, 0.5);
  ctx.fillRect(cx + 1, cy - 11 + breathe, 1, 0.5);

  ctx.restore();
}

export default { drawCryoSkater, cryoSkaterConfig };
