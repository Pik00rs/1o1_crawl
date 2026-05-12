// src/js/render/characters/enemies/inferno_charger.js
// Charge Cendreuse — silhouette voûtée, crâne calciné mâchoire exposée.
import { hexToRgba, shade } from '../iso-utils.js';

export const infernoChargerConfig = {
  id: 'inferno_charger', name: 'CHARGE CENDREUSE', archetype: 'inferno_charger',
  bodyColor: '#3a1810', accentColor: '#ff4818', glowColor: '#ffb060',
  skinColor: '#2a1408', hairColor: '#0a0402', capeColor: '#1a0805',
  height: 'medium', weapon: 'none',
};

export function drawInfernoCharger(ctx, cx, cy, actor, time, options = {}){
  const fxLevel = options.fxLevel ?? 1;
  const idle = actor.idle ?? 0;
  const moving = !!actor.target;
  const bob = Math.sin(idle * 1.2) * 1.1;
  const breathe = Math.sin(idle * 0.9) * 0.5;
  const stride = moving ? Math.sin(time * 0.5) * 1.7 : 0;
  cy = cy - 9 + bob; // voûté = un peu plus bas

  // Halo orange feu intense
  if(fxLevel >= 1){
    const auraPulse = 0.5 + Math.sin(time * 0.08) * 0.15;
    const aura = ctx.createRadialGradient(cx, cy - 2, 2, cx, cy - 2, 15);
    aura.addColorStop(0, hexToRgba(actor.glowColor, auraPulse * 0.6));
    aura.addColorStop(0.5, hexToRgba(actor.accentColor, auraPulse * 0.4));
    aura.addColorStop(1, hexToRgba(actor.accentColor, 0));
    ctx.fillStyle = aura;
    ctx.fillRect(cx - 15, cy - 17, 30, 30);
  }

  // Embers flottants ambiants (signature)
  if(fxLevel >= 1){
    for(let i = 0; i < 3; i++){
      const t = (time * 0.04 + i * 0.7) % 1;
      const ex = cx + Math.sin(i * 2.1 + time * 0.05) * 5;
      const ey = cy - 4 - t * 14;
      const a = 1 - t;
      ctx.fillStyle = hexToRgba(actor.accentColor, a * 0.7);
      ctx.fillRect(Math.round(ex), Math.round(ey), 1, 1);
    }
  }

  // Jambes carbonisées
  ctx.fillStyle = shade(actor.bodyColor, -0.3);
  ctx.fillRect(cx - 5, cy + 6 + stride, 4, 9);
  ctx.fillRect(cx + 1, cy + 6 - stride, 4, 9);
  // Fissures jambes
  ctx.strokeStyle = hexToRgba(actor.accentColor, 0.8);
  ctx.lineWidth = 0.4;
  ctx.beginPath();
  ctx.moveTo(cx - 3, cy + 8 + stride); ctx.lineTo(cx - 4, cy + 13 + stride);
  ctx.moveTo(cx + 3, cy + 8 - stride); ctx.lineTo(cx + 2, cy + 13 - stride);
  ctx.stroke();
  // Pieds nus carbonisés
  ctx.fillStyle = actor.hairColor;
  ctx.fillRect(cx - 6, cy + 14 + stride, 5, 2);
  ctx.fillRect(cx + 1, cy + 14 - stride, 5, 2);

  // Torse voûté (silhouette penchée)
  ctx.fillStyle = actor.bodyColor;
  ctx.beginPath();
  ctx.moveTo(cx - 7, cy + 5);
  ctx.lineTo(cx + 7, cy + 5);
  ctx.lineTo(cx + 6, cy - 6 + breathe);
  ctx.lineTo(cx - 6, cy - 6 + breathe);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = shade(actor.bodyColor, -0.4);
  ctx.beginPath();
  ctx.moveTo(cx + 7, cy + 5);
  ctx.lineTo(cx + 6, cy - 6 + breathe);
  ctx.lineTo(cx + 2, cy - 6 + breathe);
  ctx.lineTo(cx + 2, cy + 5);
  ctx.closePath();
  ctx.fill();

  // FISSURES INTERNES MULTIPLES (signature)
  const crackPulse = 0.8 + Math.sin(time * 0.07) * 0.2;
  ctx.strokeStyle = hexToRgba(actor.accentColor, crackPulse);
  ctx.lineWidth = 0.6;
  ctx.beginPath();
  ctx.moveTo(cx - 5, cy - 4 + breathe); ctx.lineTo(cx - 2, cy + 2 + breathe);
  ctx.moveTo(cx + 4, cy - 3 + breathe); ctx.lineTo(cx + 1, cy + 3 + breathe);
  ctx.moveTo(cx, cy - 5 + breathe); ctx.lineTo(cx, cy + 4 + breathe);
  ctx.stroke();
  ctx.strokeStyle = hexToRgba(actor.glowColor, crackPulse);
  ctx.lineWidth = 0.3;
  ctx.beginPath();
  ctx.moveTo(cx - 4, cy - 2 + breathe); ctx.lineTo(cx - 3, cy + 1 + breathe);
  ctx.moveTo(cx + 3, cy - 1 + breathe); ctx.lineTo(cx + 2, cy + 2 + breathe);
  ctx.stroke();

  // BRAS PENDANTS (signature, mort vivant)
  ctx.fillStyle = shade(actor.bodyColor, -0.3);
  ctx.fillRect(cx - 9, cy - 4 + breathe, 2, 10);
  ctx.fillRect(cx + 7, cy - 4 + breathe, 2, 10);
  // Mains griffues calcinées
  ctx.fillStyle = actor.hairColor;
  ctx.fillRect(cx - 9, cy + 6 + breathe, 2, 2);
  ctx.fillRect(cx + 7, cy + 6 + breathe, 2, 2);
  // Griffes (3 per main)
  ctx.fillStyle = actor.hairColor;
  for(let i = 0; i < 3; i++){
    ctx.fillRect(cx - 9 + i * 0.7, cy + 8 + breathe, 0.4, 1.5);
    ctx.fillRect(cx + 7 + i * 0.7, cy + 8 + breathe, 0.4, 1.5);
  }

  // CRÂNE CALCINÉ avec MÂCHOIRE EXPOSÉE (signature)
  // Skull mass
  ctx.fillStyle = actor.bodyColor;
  ctx.beginPath();
  ctx.ellipse(cx, cy - 11 + breathe, 4.5, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = shade(actor.bodyColor, -0.3);
  ctx.beginPath();
  ctx.ellipse(cx + 1.5, cy - 11 + breathe, 2.5, 4.5, 0, 0, Math.PI * 2);
  ctx.fill();
  // Skull cracks
  ctx.strokeStyle = hexToRgba(actor.accentColor, crackPulse);
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(cx - 3, cy - 14 + breathe); ctx.lineTo(cx - 2, cy - 11 + breathe);
  ctx.moveTo(cx + 2, cy - 14 + breathe); ctx.lineTo(cx + 3, cy - 11 + breathe);
  ctx.stroke();

  // EYES (orbites vides avec glow)
  ctx.fillStyle = '#000';
  ctx.fillRect(cx - 3, cy - 12 + breathe, 2, 1.5);
  ctx.fillRect(cx + 1, cy - 12 + breathe, 2, 1.5);
  const eyePulse = 0.92 + Math.sin(time * 0.09) * 0.08;
  ctx.fillStyle = hexToRgba(actor.accentColor, eyePulse);
  ctx.fillRect(cx - 2.5, cy - 11.5 + breathe, 1, 0.5);
  ctx.fillRect(cx + 1.5, cy - 11.5 + breathe, 1, 0.5);
  ctx.fillStyle = hexToRgba(actor.glowColor, eyePulse);
  ctx.fillRect(cx - 2.3, cy - 11.5 + breathe, 0.5, 0.5);
  ctx.fillRect(cx + 1.7, cy - 11.5 + breathe, 0.5, 0.5);

  // MÂCHOIRE EXPOSÉE (signature)
  ctx.fillStyle = '#000';
  ctx.fillRect(cx - 2, cy - 9 + breathe, 4, 2);
  // Dents
  ctx.fillStyle = '#a89878';
  for(let i = 0; i < 4; i++){
    ctx.fillRect(cx - 2 + i * 1, cy - 9 + breathe, 0.5, 1);
    ctx.fillRect(cx - 2 + i * 1 + 0.5, cy - 8 + breathe, 0.5, 0.5);
  }
}

export default { drawInfernoCharger, infernoChargerConfig };
