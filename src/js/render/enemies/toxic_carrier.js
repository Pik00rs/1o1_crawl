// src/js/render/characters/enemies/toxic_carrier.js
// Porteur de Plaies — plaques de bactéries vertes brillantes, lame courbée.
import { hexToRgba, shade } from '../../iso-utils.js';

export const toxicCarrierConfig = {
  id: 'toxic_carrier', name: 'PORTEUR', archetype: 'toxic_carrier',
  bodyColor: '#5a7818', accentColor: '#8eb828', glowColor: '#c8e848',
  skinColor: '#7a9828', hairColor: '#3a5018', capeColor: '#2a3810',
  height: 'medium', weapon: 'curved_blade',
};

export function drawToxicCarrier(ctx, cx, cy, actor, time, options = {}){
  const fxLevel = options.fxLevel ?? 1;
  const idle = actor.idle ?? 0;
  const moving = !!actor.target;
  const bob = Math.sin(idle * 0.9) * 1.0;
  const breathe = Math.sin(idle * 0.7) * 0.4;
  const stride = moving ? Math.sin(time * 0.4) * 1.3 : 0;
  cy = cy - 10 + bob;

  // Halo vert pulse fort (signature : porteur de maladies)
  if(fxLevel >= 1){
    const auraPulse = 0.45 + Math.sin(time * 0.05) * 0.2;
    const aura = ctx.createRadialGradient(cx, cy - 2, 2, cx, cy - 2, 16);
    aura.addColorStop(0, hexToRgba(actor.glowColor, auraPulse * 0.6));
    aura.addColorStop(0.5, hexToRgba(actor.accentColor, auraPulse * 0.4));
    aura.addColorStop(1, hexToRgba(actor.accentColor, 0));
    ctx.fillStyle = aura;
    ctx.fillRect(cx - 16, cy - 18, 32, 32);
  }

  // Plague clouds (signature)
  if(fxLevel >= 1){
    for(let i = 0; i < 4; i++){
      const t = (time * 0.025 + i * 0.3) % 1;
      const angle = i * 1.5 + time * 0.02;
      const r = 8 + t * 4;
      const ex = cx + Math.cos(angle) * r;
      const ey = cy - 2 + Math.sin(angle) * r * 0.5;
      ctx.fillStyle = hexToRgba(actor.accentColor, (1 - t) * 0.4);
      ctx.beginPath();
      ctx.arc(ex, ey, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Jambes
  ctx.fillStyle = shade(actor.bodyColor, -0.3);
  ctx.fillRect(cx - 6, cy + 6 + stride, 4, 9);
  ctx.fillRect(cx + 2, cy + 6 - stride, 4, 9);
  // Plague boots
  ctx.fillStyle = actor.capeColor;
  ctx.fillRect(cx - 7, cy + 14 + stride, 5, 2);
  ctx.fillRect(cx + 2, cy + 14 - stride, 5, 2);
  ctx.fillStyle = actor.accentColor;
  ctx.fillRect(cx - 7, cy + 15 + stride, 5, 0.5);
  ctx.fillRect(cx + 2, cy + 15 - stride, 5, 0.5);

  // Robe inférieure tachée
  ctx.fillStyle = actor.capeColor;
  ctx.fillRect(cx - 7, cy + 3 + breathe, 14, 5);

  // Torse + tunique
  ctx.fillStyle = actor.bodyColor;
  ctx.beginPath();
  ctx.moveTo(cx - 7, cy + 5);
  ctx.lineTo(cx + 7, cy + 5);
  ctx.lineTo(cx + 6, cy - 7 + breathe);
  ctx.lineTo(cx - 6, cy - 7 + breathe);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = shade(actor.bodyColor, -0.3);
  ctx.beginPath();
  ctx.moveTo(cx + 7, cy + 5);
  ctx.lineTo(cx + 6, cy - 7 + breathe);
  ctx.lineTo(cx + 2, cy - 7 + breathe);
  ctx.lineTo(cx + 2, cy + 5);
  ctx.closePath();
  ctx.fill();

  // PLAQUES DE BACTÉRIES VERTES BRILLANTES (signature)
  const bactPulse = 0.85 + Math.sin(time * 0.08) * 0.15;
  // Plaque 1 (gauche thorax)
  ctx.fillStyle = '#3a5018';
  ctx.fillRect(cx - 5, cy - 4 + breathe, 3, 4);
  ctx.fillStyle = hexToRgba(actor.glowColor, bactPulse);
  ctx.fillRect(cx - 4, cy - 3 + breathe, 1, 2);
  // Bact dots
  ctx.fillStyle = hexToRgba('#fff', bactPulse * 0.8);
  ctx.fillRect(cx - 4.5, cy - 3.5 + breathe, 0.5, 0.5);
  ctx.fillRect(cx - 3, cy - 2 + breathe, 0.5, 0.5);

  // Plaque 2 (droite abdo)
  ctx.fillStyle = '#3a5018';
  ctx.fillRect(cx + 2, cy + 0 + breathe, 4, 3);
  ctx.fillStyle = hexToRgba(actor.glowColor, bactPulse);
  ctx.fillRect(cx + 3, cy + 1 + breathe, 2, 1);
  ctx.fillStyle = hexToRgba('#fff', bactPulse * 0.8);
  ctx.fillRect(cx + 3, cy + 1 + breathe, 0.5, 0.5);
  ctx.fillRect(cx + 4.5, cy + 1.5 + breathe, 0.3, 0.3);

  // Plaque 3 (haut centre)
  ctx.fillStyle = '#3a5018';
  ctx.fillRect(cx - 1, cy - 5 + breathe, 3, 2);
  ctx.fillStyle = hexToRgba(actor.glowColor, bactPulse);
  ctx.fillRect(cx, cy - 4.5 + breathe, 1, 1);

  // Bras
  ctx.fillStyle = shade(actor.bodyColor, -0.1);
  ctx.fillRect(cx - 9, cy - 5 + breathe, 2, 8);
  ctx.fillRect(cx + 7, cy - 5 + breathe, 2, 8);
  // Gloves
  ctx.fillStyle = actor.capeColor;
  ctx.fillRect(cx - 9, cy + 3 + breathe, 2, 3);
  ctx.fillStyle = '#3a5018';
  ctx.fillRect(cx + 7, cy + 3 + breathe, 2, 3);

  // LAME COURBÉE (signature) main droite — kukri/sickle vert sale
  // Manche
  ctx.fillStyle = '#2a1808';
  ctx.fillRect(cx + 9, cy + 4 + breathe, 1, 5);
  // Crossguard
  ctx.fillStyle = '#5a4828';
  ctx.fillRect(cx + 8, cy + 4 + breathe, 3, 1);
  // Lame courbée
  ctx.fillStyle = '#9a8868';
  ctx.beginPath();
  ctx.moveTo(cx + 9, cy + 4 + breathe);
  ctx.lineTo(cx + 14, cy - 2 + breathe);
  ctx.lineTo(cx + 16, cy - 1 + breathe);
  ctx.lineTo(cx + 11, cy + 5 + breathe);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#d8c8a0';
  ctx.beginPath();
  ctx.moveTo(cx + 9, cy + 4 + breathe);
  ctx.lineTo(cx + 14, cy - 2 + breathe);
  ctx.lineTo(cx + 14.5, cy - 1.5 + breathe);
  ctx.lineTo(cx + 10, cy + 4.5 + breathe);
  ctx.closePath();
  ctx.fill();
  // Bactéries sur la lame
  ctx.fillStyle = hexToRgba(actor.glowColor, bactPulse);
  ctx.fillRect(cx + 11, cy + 1 + breathe, 2, 1);
  ctx.fillRect(cx + 13, cy - 1 + breathe, 1, 1);
  // Drip from blade
  ctx.fillStyle = actor.accentColor;
  ctx.fillRect(cx + 13, cy + 0 + breathe, 0.5, 2);

  // CAPUCHE
  ctx.fillStyle = actor.capeColor;
  ctx.beginPath();
  ctx.moveTo(cx - 7, cy - 7 + breathe);
  ctx.lineTo(cx + 7, cy - 7 + breathe);
  ctx.lineTo(cx + 6, cy - 14 + breathe);
  ctx.lineTo(cx + 3, cy - 17 + breathe);
  ctx.lineTo(cx - 3, cy - 17 + breathe);
  ctx.lineTo(cx - 6, cy - 14 + breathe);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#000';
  ctx.fillRect(cx - 3, cy - 13 + breathe, 6, 4);
  // Bactéries sur capuche
  ctx.fillStyle = hexToRgba(actor.glowColor, bactPulse);
  ctx.fillRect(cx - 5, cy - 14 + breathe, 1, 1);
  ctx.fillRect(cx + 4, cy - 15 + breathe, 1, 1);

  // YEUX verts brillants
  const eyePulse = 0.92 + Math.sin(time * 0.09) * 0.08;
  ctx.fillStyle = hexToRgba(actor.glowColor, eyePulse);
  ctx.fillRect(cx - 3, cy - 11 + breathe, 1.5, 1.5);
  ctx.fillRect(cx + 1.5, cy - 11 + breathe, 1.5, 1.5);
  ctx.fillStyle = hexToRgba('#fff', eyePulse);
  ctx.fillRect(cx - 3, cy - 11 + breathe, 0.5, 0.5);
  ctx.fillRect(cx + 1.5, cy - 11 + breathe, 0.5, 0.5);
}

export default { drawToxicCarrier, toxicCarrierConfig };
