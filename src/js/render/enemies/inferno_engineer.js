// src/js/render/characters/enemies/inferno_engineer.js
// Ingénieur Thermique — combinaison ouvrier, casque jaune à lampe, pistolet rivet.
import { hexToRgba, shade } from '../../iso-utils.js';

export const infernoEngineerConfig = {
  id: 'inferno_engineer', name: 'INGÉNIEUR', archetype: 'inferno_engineer',
  bodyColor: '#a8682a', accentColor: '#ff6f1a', glowColor: '#ffd060',
  skinColor: '#a06850', hairColor: '#1a0805', capeColor: '#3a1610',
  height: 'medium', weapon: 'rivet_gun',
};

export function drawInfernoEngineer(ctx, cx, cy, actor, time, options = {}){
  const fxLevel = options.fxLevel ?? 1;
  const idle = actor.idle ?? 0;
  const moving = !!actor.target;
  const bob = Math.sin(idle * 0.95) * 1.0;
  const breathe = Math.sin(idle * 0.7) * 0.4;
  const stride = moving ? Math.sin(time * 0.4) * 1.3 : 0;
  cy = cy - 10 + bob;

  // Halo orange
  if(fxLevel >= 1){
    const auraPulse = 0.35 + Math.sin(time * 0.06) * 0.1;
    const aura = ctx.createRadialGradient(cx, cy - 2, 2, cx, cy - 2, 14);
    aura.addColorStop(0, hexToRgba(actor.glowColor, auraPulse * 0.4));
    aura.addColorStop(1, hexToRgba(actor.accentColor, 0));
    ctx.fillStyle = aura;
    ctx.fillRect(cx - 14, cy - 16, 28, 28);
  }

  // Jambes (combinaison ouvrier)
  ctx.fillStyle = actor.bodyColor;
  ctx.fillRect(cx - 6, cy + 6 + stride, 4, 9);
  ctx.fillRect(cx + 2, cy + 6 - stride, 4, 9);
  ctx.fillStyle = shade(actor.bodyColor, -0.3);
  ctx.fillRect(cx - 6, cy + 6 + stride, 1, 9);
  // Bandes réfléchissantes (signature)
  ctx.fillStyle = actor.glowColor;
  ctx.fillRect(cx - 6, cy + 11 + stride, 4, 1);
  ctx.fillRect(cx + 2, cy + 11 - stride, 4, 1);
  // Bottes
  ctx.fillStyle = '#1a0805';
  ctx.fillRect(cx - 7, cy + 14 + stride, 5, 2);
  ctx.fillRect(cx + 2, cy + 14 - stride, 5, 2);
  // Toe steel
  ctx.fillStyle = '#7a6850';
  ctx.fillRect(cx - 7, cy + 15 + stride, 2, 1);
  ctx.fillRect(cx + 5, cy + 15 - stride, 2, 1);

  // Belt outils
  ctx.fillStyle = '#1a0805';
  ctx.fillRect(cx - 7, cy + 5, 14, 1.5);
  ctx.fillStyle = '#7a6850';
  ctx.fillRect(cx - 1, cy + 5, 2, 1.5);
  // Pouches
  ctx.fillStyle = actor.capeColor;
  ctx.fillRect(cx - 6, cy + 5, 2, 3);
  ctx.fillRect(cx + 4, cy + 5, 2, 3);

  // Combinaison torse
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
  ctx.fillStyle = shade(actor.bodyColor, 0.2);
  ctx.fillRect(cx - 6, cy - 6 + breathe, 2, 11);

  // Bande réfléchissante haute
  ctx.fillStyle = actor.glowColor;
  ctx.fillRect(cx - 7, cy - 4 + breathe, 14, 1);
  // Zip central
  ctx.fillStyle = '#7a6850';
  ctx.fillRect(cx, cy - 6 + breathe, 0.5, 11);

  // Bras combinaison
  ctx.fillStyle = shade(actor.bodyColor, -0.1);
  ctx.fillRect(cx - 9, cy - 5 + breathe, 2, 8);
  ctx.fillRect(cx + 7, cy - 5 + breathe, 2, 8);
  // Gants travail
  ctx.fillStyle = '#3a2818';
  ctx.fillRect(cx - 9, cy + 3 + breathe, 2, 3);
  ctx.fillRect(cx + 7, cy + 3 + breathe, 2, 3);

  // PISTOLET RIVET (signature) — main droite
  ctx.fillStyle = '#3a2818';
  ctx.fillRect(cx + 9, cy + 2 + breathe, 1.5, 4); // grip
  ctx.fillStyle = '#5a4828';
  ctx.fillRect(cx + 9, cy + 0 + breathe, 4, 2.5); // body
  ctx.fillStyle = '#7a6850';
  ctx.fillRect(cx + 9, cy + 0 + breathe, 4, 0.5);
  // Barrel
  ctx.fillStyle = '#1a0805';
  ctx.fillRect(cx + 13, cy + 0.5 + breathe, 3, 1.5);
  // Hot tip
  const tipPulse = 0.85 + Math.sin(time * 0.1) * 0.15;
  ctx.fillStyle = hexToRgba(actor.accentColor, tipPulse);
  ctx.fillRect(cx + 16, cy + 0.5 + breathe, 0.8, 1.5);
  // LED
  ctx.fillStyle = hexToRgba(actor.accentColor, tipPulse);
  ctx.fillRect(cx + 11, cy - 0.3 + breathe, 0.5, 0.5);

  // CASQUE JAUNE (signature)
  ctx.fillStyle = '#d8a020';
  ctx.fillRect(cx - 6, cy - 16 + breathe, 12, 6);
  ctx.fillStyle = '#a87810';
  ctx.fillRect(cx - 6, cy - 11 + breathe, 12, 2);
  ctx.fillStyle = '#f8c040';
  ctx.fillRect(cx - 6, cy - 16 + breathe, 12, 1);
  // Visière (rim avant)
  ctx.fillStyle = '#a87810';
  ctx.fillRect(cx - 6, cy - 11 + breathe, 12, 0.5);
  // Crête médiane
  ctx.fillStyle = '#a87810';
  ctx.fillRect(cx - 0.5, cy - 17 + breathe, 1, 7);

  // LAMPE FRONTALE (signature)
  const lampPulse = 0.92 + Math.sin(time * 0.08) * 0.08;
  ctx.fillStyle = '#3a2010';
  ctx.fillRect(cx - 2.5, cy - 14 + breathe, 5, 2.5);
  ctx.fillStyle = hexToRgba('#ffffff', lampPulse);
  ctx.fillRect(cx - 2, cy - 13.5 + breathe, 4, 1.5);
  ctx.fillStyle = hexToRgba(actor.glowColor, lampPulse);
  ctx.fillRect(cx - 1.5, cy - 13.5 + breathe, 3, 0.5);
  // Light beam
  if(fxLevel >= 1){
    const beamGrad = ctx.createRadialGradient(cx, cy - 13 + breathe, 0, cx, cy - 13 + breathe, 10);
    beamGrad.addColorStop(0, hexToRgba('#ffffff', lampPulse * 0.4));
    beamGrad.addColorStop(1, hexToRgba(actor.glowColor, 0));
    ctx.fillStyle = beamGrad;
    ctx.fillRect(cx - 10, cy - 18 + breathe, 20, 8);
  }

  // Bas du visage
  ctx.fillStyle = actor.skinColor;
  ctx.fillRect(cx - 3, cy - 10 + breathe, 6, 3);
  // Beard short
  ctx.fillStyle = actor.hairColor;
  ctx.fillRect(cx - 3, cy - 8 + breathe, 6, 1);
  // Bouche
  ctx.fillStyle = '#1a0805';
  ctx.fillRect(cx - 1, cy - 9 + breathe, 2, 0.5);
}

export default { drawInfernoEngineer, infernoEngineerConfig };
