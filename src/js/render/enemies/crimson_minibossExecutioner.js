// src/js/render/characters/enemies/crimson_minibossExecutioner.js
// Exécuteur — MINIBOSS, cagoule noire, hache à 2 mains, torse nu massif.
import { hexToRgba, shade } from '../iso-utils.js';

export const crimsonMinibossExecutionerConfig = {
  id: 'crimson_minibossExecutioner', name: 'EXÉCUTEUR', archetype: 'crimson_minibossExecutioner',
  bodyColor: '#a87858', accentColor: '#c82828', glowColor: '#e84040',
  skinColor: '#c89878', hairColor: '#1a0a05', capeColor: '#3a1a08',
  height: 'xlarge', weapon: 'big_axe',
};

export function drawCrimsonMinibossExecutioner(ctx, cx, cy, actor, time, options = {}){
  const fxLevel = options.fxLevel ?? 1;
  const idle = actor.idle ?? 0;
  const moving = !!actor.target;
  const bob = Math.sin(idle * 0.7) * 0.8; // lent, lourd
  const breathe = Math.sin(idle * 0.55) * 0.5;
  const stride = moving ? Math.sin(time * 0.3) * 1.2 : 0;
  cy = cy - 14 + bob; // MINIBOSS : plus grand

  // Halo rouge mort intense
  if(fxLevel >= 1){
    const auraPulse = 0.5 + Math.sin(time * 0.05) * 0.15;
    const aura = ctx.createRadialGradient(cx, cy - 4, 2, cx, cy - 4, 22);
    aura.addColorStop(0, hexToRgba(actor.glowColor, auraPulse * 0.5));
    aura.addColorStop(0.5, hexToRgba(actor.accentColor, auraPulse * 0.4));
    aura.addColorStop(1, hexToRgba(actor.accentColor, 0));
    ctx.fillStyle = aura;
    ctx.fillRect(cx - 22, cy - 26, 44, 44);
  }

  // Jambes massives
  ctx.fillStyle = actor.hairColor;
  ctx.fillRect(cx - 7, cy + 7 + stride, 5, 10);
  ctx.fillRect(cx + 2, cy + 7 - stride, 5, 10);
  // Bottes
  ctx.fillStyle = '#000';
  ctx.fillRect(cx - 8, cy + 16 + stride, 6, 3);
  ctx.fillRect(cx + 2, cy + 16 - stride, 6, 3);
  // Studs sur bottes
  ctx.fillStyle = '#a89878';
  ctx.fillRect(cx - 6, cy + 17 + stride, 1, 1);
  ctx.fillRect(cx + 5, cy + 17 - stride, 1, 1);

  // Loincloth/belt studded (signature)
  ctx.fillStyle = '#000';
  ctx.fillRect(cx - 8, cy + 5, 16, 3);
  for(let i = 0; i < 6; i++){
    ctx.fillStyle = '#a89878';
    ctx.fillRect(cx - 7 + i * 2.5, cy + 6, 1, 1);
  }
  // Boucle bronze centrale
  ctx.fillStyle = '#c8a040';
  ctx.fillRect(cx - 2, cy + 5, 4, 3);

  // TORSE NU MASSIF
  ctx.fillStyle = actor.skinColor;
  ctx.beginPath();
  ctx.moveTo(cx - 9, cy + 5);
  ctx.lineTo(cx + 9, cy + 5);
  ctx.lineTo(cx + 8, cy - 9 + breathe);
  ctx.lineTo(cx - 8, cy - 9 + breathe);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = shade(actor.skinColor, -0.3);
  ctx.beginPath();
  ctx.moveTo(cx + 9, cy + 5);
  ctx.lineTo(cx + 8, cy - 9 + breathe);
  ctx.lineTo(cx + 3, cy - 9 + breathe);
  ctx.lineTo(cx + 3, cy + 5);
  ctx.closePath();
  ctx.fill();
  // Pec line
  ctx.strokeStyle = shade(actor.skinColor, -0.4);
  ctx.lineWidth = 0.6;
  ctx.beginPath();
  ctx.moveTo(cx, cy - 7 + breathe);
  ctx.lineTo(cx, cy - 1 + breathe);
  ctx.stroke();
  // Scars
  ctx.strokeStyle = shade(actor.accentColor, -0.4);
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(cx - 7, cy - 7 + breathe);
  ctx.lineTo(cx - 2, cy - 1 + breathe);
  ctx.stroke();

  // ÉPAULES avec pauldrons à pointes (signature)
  ctx.fillStyle = actor.hairColor;
  ctx.fillRect(cx - 10, cy - 9 + breathe, 3, 4);
  ctx.fillRect(cx + 7, cy - 9 + breathe, 3, 4);
  // Pointes
  ctx.fillStyle = shade(actor.hairColor, 0.4);
  ctx.beginPath();
  ctx.moveTo(cx - 10, cy - 9 + breathe);
  ctx.lineTo(cx - 8, cy - 13 + breathe);
  ctx.lineTo(cx - 7, cy - 9 + breathe);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx + 7, cy - 9 + breathe);
  ctx.lineTo(cx + 9, cy - 13 + breathe);
  ctx.lineTo(cx + 10, cy - 9 + breathe);
  ctx.closePath();
  ctx.fill();

  // Bras massifs avec bracers studded
  ctx.fillStyle = actor.skinColor;
  ctx.fillRect(cx - 10, cy - 5 + breathe, 3, 4);
  ctx.fillRect(cx + 7, cy - 5 + breathe, 3, 4);
  ctx.fillStyle = actor.capeColor;
  ctx.fillRect(cx - 10, cy - 1 + breathe, 3, 5);
  ctx.fillRect(cx + 7, cy - 1 + breathe, 3, 5);
  ctx.fillStyle = '#a89878';
  ctx.fillRect(cx - 9, cy + 1 + breathe, 1, 1);
  ctx.fillRect(cx + 8, cy + 1 + breathe, 1, 1);

  // GROSSE HACHE 2 mains (signature) — derrière sur le dos OU tenue
  // Haft (vertical, sur le côté)
  ctx.fillStyle = actor.capeColor;
  ctx.fillRect(cx - 13, cy - 15 + breathe, 1.5, 22);
  ctx.fillStyle = shade(actor.capeColor, 0.2);
  ctx.fillRect(cx - 13, cy - 15 + breathe, 0.5, 22);
  // Axe head (massive)
  ctx.fillStyle = '#5a4828';
  ctx.beginPath();
  ctx.moveTo(cx - 12, cy - 16 + breathe);
  ctx.lineTo(cx - 18, cy - 17 + breathe);
  ctx.lineTo(cx - 19, cy - 13 + breathe);
  ctx.lineTo(cx - 18, cy - 9 + breathe);
  ctx.lineTo(cx - 12, cy - 10 + breathe);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#9a8868';
  ctx.fillRect(cx - 18, cy - 17 + breathe, 1, 8);
  // Sang sur lame
  ctx.fillStyle = actor.accentColor;
  ctx.fillRect(cx - 17, cy - 14 + breathe, 3, 1);

  // CAGOULE DE BOURREAU (signature) — noire pointue avec eye holes
  // Hood neck
  ctx.fillStyle = actor.hairColor;
  ctx.fillRect(cx - 5, cy - 11 + breathe, 10, 3);
  // Hood main mass
  ctx.fillStyle = actor.hairColor;
  ctx.fillRect(cx - 6, cy - 19 + breathe, 12, 8);
  // Pointed top
  ctx.fillStyle = actor.hairColor;
  ctx.beginPath();
  ctx.moveTo(cx - 3, cy - 19 + breathe);
  ctx.lineTo(cx + 3, cy - 19 + breathe);
  ctx.lineTo(cx, cy - 22 + breathe);
  ctx.closePath();
  ctx.fill();
  // Highlight
  ctx.fillStyle = shade(actor.hairColor, 0.4);
  ctx.fillRect(cx - 6, cy - 19 + breathe, 1, 8);

  // EYE HOLES (signature) — rouge glow dedans
  ctx.fillStyle = '#000';
  ctx.fillRect(cx - 4, cy - 16 + breathe, 2.5, 2);
  ctx.fillRect(cx + 1.5, cy - 16 + breathe, 2.5, 2);
  const eyePulse = 0.92 + Math.sin(time * 0.08) * 0.08;
  ctx.fillStyle = hexToRgba(actor.accentColor, eyePulse);
  ctx.fillRect(cx - 3.5, cy - 15.5 + breathe, 1.5, 1);
  ctx.fillRect(cx + 2, cy - 15.5 + breathe, 1.5, 1);
  ctx.fillStyle = hexToRgba(actor.glowColor, eyePulse);
  ctx.fillRect(cx - 3.5, cy - 15.5 + breathe, 0.5, 0.5);
  ctx.fillRect(cx + 2, cy - 15.5 + breathe, 0.5, 0.5);

  // Mouth slit
  ctx.fillStyle = '#000';
  ctx.fillRect(cx - 2, cy - 13 + breathe, 4, 0.5);

  // Rope autour du cou
  ctx.fillStyle = '#7a6850';
  ctx.fillRect(cx - 5, cy - 11 + breathe, 10, 1);
}

export default { drawCrimsonMinibossExecutioner, crimsonMinibossExecutionerConfig };
