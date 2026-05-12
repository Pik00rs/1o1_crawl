// src/js/render/characters/enemies/crimson_doctor.js
// Docteur de Sang — silhouette grêle, blouse blanche tachée, masque chirurgical.
import { hexToRgba, shade } from '../iso-utils.js';

export const crimsonDoctorConfig = {
  id: 'crimson_doctor', name: 'DOCTEUR', archetype: 'crimson_doctor',
  bodyColor: '#d8c8a8', accentColor: '#8a1818', glowColor: '#ff8080',
  skinColor: '#c89878', hairColor: '#7a3838', capeColor: '#3a2818',
  height: 'small', weapon: 'scalpel',
};

export function drawCrimsonDoctor(ctx, cx, cy, actor, time, options = {}){
  const fxLevel = options.fxLevel ?? 1;
  const idle = actor.idle ?? 0;
  const moving = !!actor.target;
  const bob = Math.sin(idle * 1.1) * 1.0;
  const breathe = Math.sin(idle * 0.8) * 0.3;
  const stride = moving ? Math.sin(time * 0.45) * 1.2 : 0;
  cy = cy - 10 + bob;

  // Halo rouge clair (heal)
  if(fxLevel >= 1){
    const auraPulse = 0.3 + Math.sin(time * 0.07) * 0.1;
    const aura = ctx.createRadialGradient(cx, cy - 2, 2, cx, cy - 2, 13);
    aura.addColorStop(0, hexToRgba(actor.glowColor, auraPulse * 0.4));
    aura.addColorStop(1, hexToRgba(actor.glowColor, 0));
    ctx.fillStyle = aura;
    ctx.fillRect(cx - 13, cy - 15, 26, 26);
  }

  // Jambes minces
  ctx.fillStyle = shade(actor.capeColor, -0.4);
  ctx.fillRect(cx - 4, cy + 6 + stride, 3, 9);
  ctx.fillRect(cx + 1, cy + 6 - stride, 3, 9);
  ctx.fillStyle = '#000';
  ctx.fillRect(cx - 5, cy + 14 + stride, 4, 2);
  ctx.fillRect(cx + 1, cy + 14 - stride, 4, 2);

  // BLOUSE longue (signature) — descend bas
  ctx.fillStyle = actor.bodyColor;
  ctx.beginPath();
  ctx.moveTo(cx - 7, cy + 8);
  ctx.lineTo(cx + 7, cy + 8);
  ctx.lineTo(cx + 6, cy - 7 + breathe);
  ctx.lineTo(cx - 6, cy - 7 + breathe);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = shade(actor.bodyColor, -0.2);
  ctx.beginPath();
  ctx.moveTo(cx + 7, cy + 8);
  ctx.lineTo(cx + 6, cy - 7 + breathe);
  ctx.lineTo(cx + 2, cy - 7 + breathe);
  ctx.lineTo(cx + 2, cy + 8);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = shade(actor.bodyColor, 0.2);
  ctx.fillRect(cx - 6, cy - 6 + breathe, 2, 14);

  // TACHES DE SANG sur blouse (signature)
  ctx.fillStyle = actor.hairColor;
  ctx.fillRect(cx - 2, cy - 2 + breathe, 3, 3);
  ctx.fillRect(cx + 3, cy + 2 + breathe, 2, 2);
  ctx.fillStyle = actor.accentColor;
  ctx.fillRect(cx - 1, cy - 1 + breathe, 1, 1);
  ctx.fillRect(cx + 4, cy + 2 + breathe, 1, 1);
  // Petite tache haute
  ctx.fillStyle = actor.hairColor;
  ctx.fillRect(cx + 2, cy - 5 + breathe, 1, 1);

  // Boutons
  ctx.fillStyle = '#c8a040';
  ctx.fillRect(cx, cy - 4 + breathe, 0.5, 0.5);
  ctx.fillRect(cx, cy - 1 + breathe, 0.5, 0.5);
  ctx.fillRect(cx, cy + 2 + breathe, 0.5, 0.5);

  // Bras (sleeves blouse)
  ctx.fillStyle = actor.bodyColor;
  ctx.fillRect(cx - 8, cy - 5 + breathe, 2, 8);
  ctx.fillStyle = shade(actor.bodyColor, -0.2);
  ctx.fillRect(cx + 6, cy - 5 + breathe, 2, 8);
  // Mains (peau pâle)
  ctx.fillStyle = actor.skinColor;
  ctx.fillRect(cx - 8, cy + 3 + breathe, 2, 3);
  ctx.fillRect(cx + 6, cy + 3 + breathe, 2, 3);

  // SCALPEL dans main droite
  ctx.fillStyle = '#9a8868';
  ctx.fillRect(cx + 7, cy + 5 + breathe, 1, 3);
  ctx.fillStyle = '#d8c8a0';
  ctx.fillRect(cx + 7, cy + 5 + breathe, 0.5, 3);
  ctx.fillStyle = actor.accentColor;
  ctx.fillRect(cx + 7, cy + 6 + breathe, 1, 1);

  // Tête
  ctx.fillStyle = actor.skinColor;
  ctx.beginPath();
  ctx.ellipse(cx, cy - 12 + breathe, 4, 4.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = shade(actor.skinColor, -0.2);
  ctx.beginPath();
  ctx.ellipse(cx + 1.5, cy - 12 + breathe, 2, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // MASQUE CHIRURGICAL (signature) — couvre nez/bouche
  ctx.fillStyle = '#c8b898';
  ctx.fillRect(cx - 3, cy - 11 + breathe, 6, 3);
  ctx.fillStyle = '#a89878';
  ctx.fillRect(cx - 3, cy - 11 + breathe, 6, 1);
  // Tache de sang sur masque (signature)
  ctx.fillStyle = actor.hairColor;
  ctx.fillRect(cx - 1, cy - 10 + breathe, 2, 1);
  // Strap mask
  ctx.fillStyle = '#7a6850';
  ctx.fillRect(cx - 4, cy - 10 + breathe, 0.5, 2);
  ctx.fillRect(cx + 3.5, cy - 10 + breathe, 0.5, 2);

  // Lunettes (frames)
  ctx.strokeStyle = '#7a6850';
  ctx.lineWidth = 0.5;
  ctx.strokeRect(cx - 3, cy - 14 + breathe, 2.5, 2);
  ctx.strokeRect(cx + 0.5, cy - 14 + breathe, 2.5, 2);
  // Yeux derrière
  ctx.fillStyle = '#000';
  ctx.fillRect(cx - 2.5, cy - 13.5 + breathe, 1.5, 1);
  ctx.fillRect(cx + 1, cy - 13.5 + breathe, 1.5, 1);
  const eyePulse = 0.85 + Math.sin(time * 0.08) * 0.15;
  ctx.fillStyle = hexToRgba('#d8c880', eyePulse * 0.85);
  ctx.fillRect(cx - 2, cy - 13.5 + breathe, 0.5, 0.5);
  ctx.fillRect(cx + 1.5, cy - 13.5 + breathe, 0.5, 0.5);

  // Cap (haut blouse)
  ctx.fillStyle = shade(actor.bodyColor, 0.1);
  ctx.fillRect(cx - 4, cy - 16 + breathe, 8, 2);
  ctx.fillStyle = actor.hairColor;
  ctx.fillRect(cx + 1, cy - 15 + breathe, 1, 1);
}

export default { drawCrimsonDoctor, crimsonDoctorConfig };
