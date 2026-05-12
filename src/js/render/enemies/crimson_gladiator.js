// src/js/render/characters/enemies/crimson_gladiator.js
// Gladiateur — ÉLITE, casque romain avec crête, bouclier rond, gladius.
import { hexToRgba, shade } from '../iso-utils.js';

export const crimsonGladiatorConfig = {
  id: 'crimson_gladiator', name: 'GLADIATEUR', archetype: 'crimson_gladiator',
  bodyColor: '#c8a040', accentColor: '#a02828', glowColor: '#e8c860',
  skinColor: '#c89878', hairColor: '#7a5818', capeColor: '#3a1a08',
  height: 'large', weapon: 'gladius',
};

export function drawCrimsonGladiator(ctx, cx, cy, actor, time, options = {}){
  const fxLevel = options.fxLevel ?? 1;
  const idle = actor.idle ?? 0;
  const moving = !!actor.target;
  const bob = Math.sin(idle * 0.85) * 0.9;
  const breathe = Math.sin(idle * 0.65) * 0.4;
  const stride = moving ? Math.sin(time * 0.4) * 1.4 : 0;
  cy = cy - 12 + bob; // ÉLITE : un peu plus grand

  // Halo doré-rouge
  if(fxLevel >= 1){
    const auraPulse = 0.4 + Math.sin(time * 0.06) * 0.1;
    const aura = ctx.createRadialGradient(cx, cy - 2, 2, cx, cy - 2, 18);
    aura.addColorStop(0, hexToRgba(actor.glowColor, auraPulse * 0.5));
    aura.addColorStop(0.5, hexToRgba(actor.accentColor, auraPulse * 0.3));
    aura.addColorStop(1, hexToRgba(actor.accentColor, 0));
    ctx.fillStyle = aura;
    ctx.fillRect(cx - 18, cy - 22, 36, 38);
  }

  // Jambes (greaves dorées)
  ctx.fillStyle = shade(actor.capeColor, -0.4);
  ctx.fillRect(cx - 6, cy + 7 + stride, 4, 8);
  ctx.fillRect(cx + 2, cy + 7 - stride, 4, 8);
  // Greaves bronze (top)
  ctx.fillStyle = actor.bodyColor;
  ctx.fillRect(cx - 6, cy + 7 + stride, 4, 4);
  ctx.fillRect(cx + 2, cy + 7 - stride, 4, 4);
  ctx.fillStyle = actor.glowColor;
  ctx.fillRect(cx - 6, cy + 7 + stride, 1, 4);
  ctx.fillRect(cx + 2, cy + 7 - stride, 1, 4);
  // Sandales
  ctx.fillStyle = actor.capeColor;
  ctx.fillRect(cx - 7, cy + 15 + stride, 5, 2);
  ctx.fillRect(cx + 2, cy + 15 - stride, 5, 2);

  // Pteruges (jupe de cuir avec bandes)
  ctx.fillStyle = actor.capeColor;
  ctx.fillRect(cx - 7, cy + 5, 14, 4);
  for(let i = 0; i < 4; i++){
    ctx.fillStyle = shade(actor.capeColor, -0.2);
    ctx.fillRect(cx - 7 + i * 3.5, cy + 9, 2, 2);
  }

  // CUIRASSE bronze (torse)
  ctx.fillStyle = actor.bodyColor;
  ctx.beginPath();
  ctx.moveTo(cx - 8, cy + 5);
  ctx.lineTo(cx + 8, cy + 5);
  ctx.lineTo(cx + 7, cy - 8 + breathe);
  ctx.lineTo(cx - 7, cy - 8 + breathe);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = shade(actor.bodyColor, -0.3);
  ctx.beginPath();
  ctx.moveTo(cx + 8, cy + 5);
  ctx.lineTo(cx + 7, cy - 8 + breathe);
  ctx.lineTo(cx + 2, cy - 8 + breathe);
  ctx.lineTo(cx + 2, cy + 5);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = actor.glowColor;
  ctx.fillRect(cx - 7, cy - 7 + breathe, 2, 12);

  // Emblème central (sun)
  ctx.fillStyle = actor.glowColor;
  ctx.fillRect(cx - 1, cy - 3 + breathe, 2, 2);
  ctx.fillStyle = '#fff';
  ctx.fillRect(cx, cy - 2 + breathe, 1, 1);

  // Bras avec vambraces
  ctx.fillStyle = actor.skinColor;
  ctx.fillRect(cx - 9, cy - 5 + breathe, 2, 4);
  ctx.fillRect(cx + 7, cy - 5 + breathe, 2, 4);
  // Bandages bras
  ctx.fillStyle = '#d8c8a8';
  ctx.fillRect(cx - 9, cy - 3 + breathe, 2, 1);
  ctx.fillRect(cx + 7, cy - 3 + breathe, 2, 1);
  // Vambraces bronze
  ctx.fillStyle = actor.bodyColor;
  ctx.fillRect(cx - 9, cy - 1 + breathe, 2, 5);
  ctx.fillRect(cx + 7, cy - 1 + breathe, 2, 5);
  ctx.fillStyle = actor.glowColor;
  ctx.fillRect(cx - 9, cy - 1 + breathe, 1, 5);

  // BOUCLIER ROND (signature) — bras droit, devant
  drawShield(ctx, cx + 10, cy - 1 + breathe, time, actor);

  // GLADIUS — bras gauche
  ctx.fillStyle = actor.capeColor;
  ctx.fillRect(cx - 11, cy + 3 + breathe, 1, 4); // grip
  ctx.fillStyle = actor.bodyColor;
  ctx.fillRect(cx - 12, cy + 2 + breathe, 3, 1); // crossguard
  ctx.fillStyle = '#9a8868';
  ctx.beginPath();
  ctx.moveTo(cx - 11.5, cy + 2 + breathe);
  ctx.lineTo(cx - 10, cy + 2 + breathe);
  ctx.lineTo(cx - 10.5, cy - 8 + breathe);
  ctx.lineTo(cx - 11, cy - 9 + breathe);
  ctx.lineTo(cx - 11.5, cy - 8 + breathe);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#d8c8a0';
  ctx.fillRect(cx - 11.5, cy - 8 + breathe, 0.5, 10);
  // Sang
  ctx.fillStyle = actor.accentColor;
  ctx.fillRect(cx - 11, cy - 4 + breathe, 1, 2);

  // CASQUE ROMAIN (signature) — couvre la tête
  ctx.fillStyle = shade(actor.bodyColor, -0.3);
  ctx.fillRect(cx - 5, cy - 16 + breathe, 10, 8);
  ctx.fillStyle = actor.bodyColor;
  ctx.fillRect(cx - 5, cy - 16 + breathe, 10, 7);
  ctx.fillStyle = actor.glowColor;
  ctx.fillRect(cx - 5, cy - 16 + breathe, 2, 8);
  // Cheek guards
  ctx.fillStyle = shade(actor.bodyColor, -0.3);
  ctx.fillRect(cx - 5, cy - 9 + breathe, 2, 3);
  ctx.fillRect(cx + 3, cy - 9 + breathe, 2, 3);
  // Eye slits
  ctx.fillStyle = '#000';
  ctx.fillRect(cx - 3, cy - 13 + breathe, 2, 1);
  ctx.fillRect(cx + 1, cy - 13 + breathe, 2, 1);
  const eyePulse = 0.85 + Math.sin(time * 0.08) * 0.15;
  ctx.fillStyle = hexToRgba(actor.glowColor, eyePulse * 0.85);
  ctx.fillRect(cx - 2.5, cy - 13 + breathe, 1, 0.5);
  ctx.fillRect(cx + 1.5, cy - 13 + breathe, 1, 0.5);

  // CRÊTE DE CHEVAL (signature) sur le casque
  const sway = Math.sin(time * 0.08) * 0.8;
  for(let i = 0; i < 6; i++){
    const offset = i - 3;
    const len = 4 + Math.abs(offset) * 0.3;
    ctx.fillStyle = i % 2 === 0 ? actor.accentColor : shade(actor.accentColor, 0.2);
    ctx.fillRect(Math.round(cx + offset * 0.4 + sway), Math.round(cy - 16 + breathe - len), 1, len);
  }
}

function drawShield(ctx, lx, ly, time, actor){
  // Round shield (parma)
  ctx.fillStyle = shade(actor.bodyColor, -0.4);
  ctx.beginPath();
  ctx.arc(lx, ly, 5, 0, Math.PI * 2);
  ctx.fill();
  // Wood/iron body
  ctx.fillStyle = '#5a5848';
  ctx.beginPath();
  ctx.arc(lx, ly, 4, 0, Math.PI * 2);
  ctx.fill();
  // Bronze center boss
  ctx.fillStyle = actor.bodyColor;
  ctx.beginPath();
  ctx.arc(lx, ly, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = actor.glowColor;
  ctx.fillRect(lx - 0.5, ly - 0.5, 1, 1);
  // Spokes
  ctx.strokeStyle = actor.bodyColor;
  ctx.lineWidth = 0.4;
  ctx.beginPath();
  for(let i = 0; i < 4; i++){
    const a = (i / 4) * Math.PI * 2;
    ctx.moveTo(lx + Math.cos(a) * 2, ly + Math.sin(a) * 2);
    ctx.lineTo(lx + Math.cos(a) * 4, ly + Math.sin(a) * 4);
  }
  ctx.stroke();
}

export default { drawCrimsonGladiator, crimsonGladiatorConfig };
