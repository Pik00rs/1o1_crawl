// src/js/render/characters/enemies/toxic_spitter.js
// Cracheur d'Acide — glandes salivaires gonflées vert, bouche large déformée.
import { hexToRgba, shade } from '../iso-utils.js';

export const toxicSpitterConfig = {
  id: 'toxic_spitter', name: 'CRACHEUR', archetype: 'toxic_spitter',
  bodyColor: '#5a7818', accentColor: '#8eb828', glowColor: '#c8e848',
  skinColor: '#7a9828', hairColor: '#3a5018', capeColor: '#2a3810',
  height: 'small', weapon: 'acid_spit',
};

export function drawToxicSpitter(ctx, cx, cy, actor, time, options = {}){
  const fxLevel = options.fxLevel ?? 1;
  const idle = actor.idle ?? 0;
  const moving = !!actor.target;
  const bob = Math.sin(idle * 1.0) * 1.0;
  const breathe = Math.sin(idle * 0.75) * 0.4;
  const stride = moving ? Math.sin(time * 0.4) * 1.3 : 0;
  cy = cy - 10 + bob;

  // Halo vert
  if(fxLevel >= 1){
    const auraPulse = 0.35 + Math.sin(time * 0.07) * 0.1;
    const aura = ctx.createRadialGradient(cx, cy - 4, 2, cx, cy - 4, 14);
    aura.addColorStop(0, hexToRgba(actor.glowColor, auraPulse * 0.5));
    aura.addColorStop(1, hexToRgba(actor.accentColor, 0));
    ctx.fillStyle = aura;
    ctx.fillRect(cx - 14, cy - 18, 28, 28);
  }

  // Jambes
  ctx.fillStyle = shade(actor.bodyColor, -0.3);
  ctx.fillRect(cx - 5, cy + 6 + stride, 3, 9);
  ctx.fillRect(cx + 2, cy + 6 - stride, 3, 9);
  ctx.fillStyle = shade(actor.bodyColor, -0.5);
  ctx.fillRect(cx - 6, cy + 14 + stride, 4, 2);
  ctx.fillRect(cx + 2, cy + 14 - stride, 4, 2);

  // Loincloth
  ctx.fillStyle = actor.capeColor;
  ctx.fillRect(cx - 5, cy - 1 + breathe, 10, 7);

  // Torse maigre
  ctx.fillStyle = actor.bodyColor;
  ctx.beginPath();
  ctx.moveTo(cx - 6, cy + 5);
  ctx.lineTo(cx + 6, cy + 5);
  ctx.lineTo(cx + 5, cy - 7 + breathe);
  ctx.lineTo(cx - 5, cy - 7 + breathe);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = shade(actor.bodyColor, -0.3);
  ctx.beginPath();
  ctx.moveTo(cx + 6, cy + 5);
  ctx.lineTo(cx + 5, cy - 7 + breathe);
  ctx.lineTo(cx + 2, cy - 7 + breathe);
  ctx.lineTo(cx + 2, cy + 5);
  ctx.closePath();
  ctx.fill();

  // Ribs visible
  ctx.strokeStyle = shade(actor.bodyColor, -0.5);
  ctx.lineWidth = 0.4;
  ctx.beginPath();
  ctx.moveTo(cx - 4, cy - 4 + breathe); ctx.lineTo(cx + 4, cy - 4 + breathe);
  ctx.moveTo(cx - 4, cy - 2 + breathe); ctx.lineTo(cx + 4, cy - 2 + breathe);
  ctx.moveTo(cx - 4, cy + 0 + breathe); ctx.lineTo(cx + 4, cy + 0 + breathe);
  ctx.stroke();

  // Plaques acide
  ctx.fillStyle = '#3a5018';
  ctx.fillRect(cx - 3, cy + 1 + breathe, 2, 2);

  // Bras maigres
  ctx.fillStyle = shade(actor.bodyColor, -0.1);
  ctx.fillRect(cx - 7, cy - 5 + breathe, 2, 9);
  ctx.fillRect(cx + 5, cy - 5 + breathe, 2, 9);
  // Griffes
  ctx.fillStyle = '#3a5018';
  for(let i = 0; i < 3; i++){
    ctx.fillRect(cx - 7 + i * 0.6, cy + 5 + breathe, 0.5, 1.5);
    ctx.fillRect(cx + 5 + i * 0.6, cy + 5 + breathe, 0.5, 1.5);
  }

  // TÊTE allongée (signature, déformée par les glandes)
  ctx.fillStyle = actor.skinColor;
  ctx.beginPath();
  ctx.ellipse(cx, cy - 11 + breathe, 5.5, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = shade(actor.skinColor, -0.2);
  ctx.beginPath();
  ctx.ellipse(cx + 2, cy - 11 + breathe, 3, 4.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // GLANDES SALIVAIRES GONFLÉES (signature) — sur les joues
  const glandPulse = 0.85 + Math.sin(time * 0.08) * 0.15;
  // Glande gauche
  ctx.fillStyle = shade(actor.accentColor, -0.3);
  ctx.beginPath();
  ctx.arc(cx - 5, cy - 10 + breathe, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = hexToRgba(actor.glowColor, glandPulse * 0.8);
  ctx.beginPath();
  ctx.arc(cx - 5, cy - 10 + breathe, 1.3, 0, Math.PI * 2);
  ctx.fill();
  // Liquide visible
  ctx.fillStyle = hexToRgba('#fff', glandPulse * 0.6);
  ctx.fillRect(cx - 5.3, cy - 10.3 + breathe, 0.7, 0.7);
  // Glande droite
  ctx.fillStyle = shade(actor.accentColor, -0.3);
  ctx.beginPath();
  ctx.arc(cx + 5, cy - 10 + breathe, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = hexToRgba(actor.glowColor, glandPulse * 0.8);
  ctx.beginPath();
  ctx.arc(cx + 5, cy - 10 + breathe, 1.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = hexToRgba('#fff', glandPulse * 0.6);
  ctx.fillRect(cx + 4.7, cy - 10.3 + breathe, 0.7, 0.7);

  // Yeux jaunes petits
  ctx.fillStyle = '#000';
  ctx.fillRect(cx - 3, cy - 13 + breathe, 1.5, 1);
  ctx.fillRect(cx + 1.5, cy - 13 + breathe, 1.5, 1);
  ctx.fillStyle = '#d8c020';
  ctx.fillRect(cx - 2.5, cy - 13 + breathe, 1, 0.5);
  ctx.fillRect(cx + 2, cy - 13 + breathe, 1, 0.5);

  // BOUCHE DÉFORMÉE LARGE (signature) — pleine de bave acide
  ctx.fillStyle = '#000';
  ctx.fillRect(cx - 4, cy - 8 + breathe, 8, 2.5);
  // Dents
  ctx.fillStyle = '#a89878';
  for(let i = 0; i < 5; i++){
    ctx.fillRect(cx - 3.5 + i * 1.5, cy - 8 + breathe, 0.5, 1);
  }
  // Bave acide (signature)
  ctx.fillStyle = hexToRgba(actor.accentColor, 0.85);
  ctx.fillRect(cx - 3, cy - 6 + breathe, 6, 1);
  // Drip
  ctx.fillStyle = hexToRgba(actor.glowColor, 0.85);
  const dripLen = 1 + (time % 40) / 40 * 3;
  ctx.fillRect(cx, cy - 5 + breathe, 0.8, dripLen);
  ctx.fillStyle = actor.accentColor;
  ctx.fillRect(cx - 0.2, cy - 5 + breathe + dripLen - 0.5, 1, 0.7);

  // Tendrils sur tête
  ctx.fillStyle = actor.hairColor;
  ctx.fillRect(cx - 3, cy - 15 + breathe, 1, 2);
  ctx.fillRect(cx + 2, cy - 15 + breathe, 1, 2);
}

export default { drawToxicSpitter, toxicSpitterConfig };
