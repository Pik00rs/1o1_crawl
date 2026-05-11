// src/js/render/characters/enemies/inferno_berserker.js
// Berserker Inferno — ÉLITE, exo-armure fissurée orange, visière rouge, flamberge enflammée.
import { hexToRgba, shade } from '../../iso-utils.js';

export const infernoBerserkerConfig = {
  id: 'inferno_berserker', name: 'BERSERKER', archetype: 'inferno_berserker',
  bodyColor: '#3a1810', accentColor: '#ff4818', glowColor: '#ffb060',
  skinColor: '#a06850', hairColor: '#1a0805', capeColor: '#0a0402',
  height: 'large', weapon: 'flamberge',
};

export function drawInfernoBerserker(ctx, cx, cy, actor, time, options = {}){
  const fxLevel = options.fxLevel ?? 1;
  const idle = actor.idle ?? 0;
  const moving = !!actor.target;
  const bob = Math.sin(idle * 0.85) * 0.9;
  const breathe = Math.sin(idle * 0.65) * 0.4;
  const stride = moving ? Math.sin(time * 0.35) * 1.4 : 0;
  cy = cy - 13 + bob; // ÉLITE plus grand

  // Halo orange rage intense
  if(fxLevel >= 1){
    const auraPulse = 0.5 + Math.sin(time * 0.06) * 0.15;
    const aura = ctx.createRadialGradient(cx, cy - 2, 2, cx, cy - 2, 20);
    aura.addColorStop(0, hexToRgba(actor.glowColor, auraPulse * 0.5));
    aura.addColorStop(0.5, hexToRgba(actor.accentColor, auraPulse * 0.4));
    aura.addColorStop(1, hexToRgba(actor.accentColor, 0));
    ctx.fillStyle = aura;
    ctx.fillRect(cx - 20, cy - 24, 40, 40);
  }

  // Embers (signature)
  if(fxLevel >= 1){
    for(let i = 0; i < 4; i++){
      const t = (time * 0.04 + i * 0.5) % 1;
      const ex = cx + Math.sin(i * 1.8 + time * 0.04) * 7;
      const ey = cy + 4 - t * 18;
      ctx.fillStyle = hexToRgba(actor.accentColor, (1 - t) * 0.6);
      ctx.fillRect(Math.round(ex), Math.round(ey), 1, 1);
    }
  }

  // Jambes exo-armure
  ctx.fillStyle = actor.capeColor;
  ctx.fillRect(cx - 7, cy + 7 + stride, 5, 10);
  ctx.fillRect(cx + 2, cy + 7 - stride, 5, 10);
  ctx.fillStyle = actor.bodyColor;
  ctx.fillRect(cx - 7, cy + 7 + stride, 5, 5);
  ctx.fillRect(cx + 2, cy + 7 - stride, 5, 5);
  // Hot crack jambes
  const crackPulse = 0.85 + Math.sin(time * 0.07) * 0.15;
  ctx.strokeStyle = hexToRgba(actor.accentColor, crackPulse);
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(cx - 5, cy + 8 + stride); ctx.lineTo(cx - 4, cy + 13 + stride);
  ctx.moveTo(cx + 4, cy + 8 - stride); ctx.lineTo(cx + 5, cy + 13 - stride);
  ctx.stroke();
  // Bottes
  ctx.fillStyle = actor.capeColor;
  ctx.fillRect(cx - 8, cy + 16 + stride, 6, 3);
  ctx.fillRect(cx + 2, cy + 16 - stride, 6, 3);
  ctx.fillStyle = actor.accentColor;
  ctx.fillRect(cx - 8, cy + 18 + stride, 6, 0.5);
  ctx.fillRect(cx + 2, cy + 18 - stride, 6, 0.5);

  // Belt avec gem central
  ctx.fillStyle = actor.capeColor;
  ctx.fillRect(cx - 9, cy + 5, 18, 3);
  ctx.fillStyle = actor.accentColor;
  ctx.fillRect(cx - 2, cy + 5, 4, 3);
  ctx.fillStyle = actor.glowColor;
  ctx.fillRect(cx - 1, cy + 5.5, 2, 2);
  ctx.fillStyle = '#fff';
  ctx.fillRect(cx - 0.3, cy + 5.7, 0.5, 0.5);

  // EXO-ARMURE TORSE (signature)
  ctx.fillStyle = actor.bodyColor;
  ctx.beginPath();
  ctx.moveTo(cx - 9, cy + 5);
  ctx.lineTo(cx + 9, cy + 5);
  ctx.lineTo(cx + 8, cy - 9 + breathe);
  ctx.lineTo(cx - 8, cy - 9 + breathe);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = shade(actor.bodyColor, -0.4);
  ctx.beginPath();
  ctx.moveTo(cx + 9, cy + 5);
  ctx.lineTo(cx + 8, cy - 9 + breathe);
  ctx.lineTo(cx + 3, cy - 9 + breathe);
  ctx.lineTo(cx + 3, cy + 5);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = shade(actor.bodyColor, 0.3);
  ctx.fillRect(cx - 8, cy - 8 + breathe, 2, 13);

  // FISSURES PROFONDES (signature, plus que brute)
  ctx.strokeStyle = hexToRgba(actor.accentColor, crackPulse);
  ctx.lineWidth = 1;
  ctx.beginPath();
  // Cross diagonal
  ctx.moveTo(cx - 7, cy - 7 + breathe);
  ctx.lineTo(cx - 2, cy - 1 + breathe);
  ctx.lineTo(cx - 6, cy + 4 + breathe);
  ctx.moveTo(cx + 6, cy - 7 + breathe);
  ctx.lineTo(cx + 1, cy - 1 + breathe);
  ctx.lineTo(cx + 5, cy + 4 + breathe);
  // Horizontal
  ctx.moveTo(cx - 6, cy + 1 + breathe);
  ctx.lineTo(cx + 6, cy + 1 + breathe);
  ctx.stroke();
  // White hot core
  ctx.strokeStyle = hexToRgba(actor.glowColor, crackPulse);
  ctx.lineWidth = 0.4;
  ctx.beginPath();
  ctx.moveTo(cx - 2, cy - 1 + breathe);
  ctx.lineTo(cx + 1, cy - 1 + breathe);
  ctx.stroke();

  // Pauldrons avec spikes feu
  ctx.fillStyle = actor.capeColor;
  ctx.fillRect(cx - 11, cy - 9 + breathe, 3, 4);
  ctx.fillRect(cx + 8, cy - 9 + breathe, 3, 4);
  // Spikes
  ctx.fillStyle = shade(actor.bodyColor, 0.3);
  ctx.beginPath();
  ctx.moveTo(cx - 11, cy - 9 + breathe);
  ctx.lineTo(cx - 9, cy - 14 + breathe);
  ctx.lineTo(cx - 8, cy - 9 + breathe);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx + 8, cy - 9 + breathe);
  ctx.lineTo(cx + 10, cy - 14 + breathe);
  ctx.lineTo(cx + 11, cy - 9 + breathe);
  ctx.closePath();
  ctx.fill();
  // Glow tips
  ctx.fillStyle = actor.accentColor;
  ctx.fillRect(cx - 9, cy - 14 + breathe, 0.5, 1);
  ctx.fillRect(cx + 10, cy - 14 + breathe, 0.5, 1);

  // Bras massifs
  ctx.fillStyle = actor.capeColor;
  ctx.fillRect(cx - 10, cy - 5 + breathe, 3, 9);
  ctx.fillRect(cx + 7, cy - 5 + breathe, 3, 9);
  ctx.fillStyle = actor.bodyColor;
  ctx.fillRect(cx - 10, cy - 5 + breathe, 1, 9);
  ctx.fillStyle = shade(actor.bodyColor, -0.3);
  ctx.fillRect(cx + 9, cy - 5 + breathe, 1, 9);
  // Gants flaming
  ctx.fillStyle = actor.accentColor;
  ctx.fillRect(cx - 10, cy + 4 + breathe, 3, 2);
  ctx.fillRect(cx + 7, cy + 4 + breathe, 3, 2);

  // FLAMBERGE 2 MAINS (signature) — sur le côté, ondulée
  drawFlamberge(ctx, cx + 13, cy + 5 + breathe, time, actor);

  // Casque ouvert
  ctx.fillStyle = actor.capeColor;
  ctx.fillRect(cx - 5, cy - 17 + breathe, 10, 8);
  ctx.fillStyle = shade(actor.bodyColor, -0.3);
  ctx.fillRect(cx - 5, cy - 17 + breathe, 10, 5);
  // Top mohawk feu (signature)
  for(let i = 0; i < 5; i++){
    const offset = i - 2;
    const len = 3 + Math.abs(offset) * 0.3;
    const flamePulse = 0.7 + Math.sin(time * 0.15 + i) * 0.3;
    ctx.fillStyle = hexToRgba(actor.accentColor, flamePulse);
    ctx.fillRect(Math.round(cx + offset * 0.7), Math.round(cy - 17 + breathe - len), 1, len);
    ctx.fillStyle = hexToRgba(actor.glowColor, flamePulse);
    ctx.fillRect(Math.round(cx + offset * 0.7), Math.round(cy - 17 + breathe - len), 0.5, len * 0.4);
  }
  // Cheek guards
  ctx.fillStyle = actor.capeColor;
  ctx.fillRect(cx - 5, cy - 11 + breathe, 2, 3);
  ctx.fillRect(cx + 3, cy - 11 + breathe, 2, 3);

  // VISIÈRE ROUGE LARGE (signature)
  const visorPulse = 0.92 + Math.sin(time * 0.07) * 0.08;
  ctx.fillStyle = '#000';
  ctx.fillRect(cx - 5, cy - 13 + breathe, 10, 3);
  ctx.fillStyle = hexToRgba(actor.accentColor, visorPulse);
  ctx.fillRect(cx - 5, cy - 13 + breathe, 10, 2);
  ctx.fillStyle = hexToRgba(actor.glowColor, visorPulse);
  ctx.fillRect(cx - 5, cy - 13 + breathe, 10, 0.5);
  // Eye slits
  ctx.fillStyle = '#fff';
  ctx.fillRect(cx - 3, cy - 12.5 + breathe, 1.5, 0.6);
  ctx.fillRect(cx + 1.5, cy - 12.5 + breathe, 1.5, 0.6);

  // Mouth grill
  ctx.fillStyle = '#000';
  ctx.fillRect(cx - 2, cy - 10 + breathe, 4, 1);
  ctx.fillStyle = actor.accentColor;
  ctx.fillRect(cx - 2, cy - 10 + breathe, 4, 0.3);
}

function drawFlamberge(ctx, lx, ly, time, actor){
  // Pommeau
  ctx.fillStyle = actor.capeColor;
  ctx.beginPath();
  ctx.arc(lx, ly + 2, 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = actor.accentColor;
  ctx.fillRect(lx - 0.5, ly + 2, 1, 1);
  // Grip
  ctx.fillStyle = '#1a0805';
  ctx.fillRect(lx - 0.7, ly - 3, 1.5, 5);
  // Crossguard
  ctx.fillStyle = '#5a4828';
  ctx.fillRect(lx - 4, ly - 4, 8, 1.5);
  ctx.fillStyle = '#7a6850';
  ctx.fillRect(lx - 4, ly - 4, 8, 0.5);
  // Lame ondulée (flamberge — wave shape)
  ctx.fillStyle = '#9a8868';
  ctx.beginPath();
  ctx.moveTo(lx - 1, ly - 4);
  ctx.lineTo(lx + 1, ly - 4);
  // Right edge wavy
  ctx.lineTo(lx + 1.5, ly - 8);
  ctx.lineTo(lx + 0.5, ly - 12);
  ctx.lineTo(lx + 1.5, ly - 16);
  ctx.lineTo(lx + 0.5, ly - 20);
  ctx.lineTo(lx, ly - 22);
  // Left edge wavy
  ctx.lineTo(lx - 0.5, ly - 20);
  ctx.lineTo(lx - 1.5, ly - 16);
  ctx.lineTo(lx - 0.5, ly - 12);
  ctx.lineTo(lx - 1.5, ly - 8);
  ctx.closePath();
  ctx.fill();
  // Highlight
  ctx.fillStyle = '#d8c8a0';
  ctx.fillRect(lx - 0.3, ly - 22, 0.5, 18);
  // Flames sur la lame
  const flamePulse = 0.85 + Math.sin(time * 0.12) * 0.15;
  for(let i = 0; i < 4; i++){
    const y = ly - 6 - i * 4;
    ctx.fillStyle = hexToRgba(actor.accentColor, flamePulse * (1 - i * 0.15));
    ctx.fillRect(lx - 2, y, 4, 2);
    ctx.fillStyle = hexToRgba(actor.glowColor, flamePulse * (1 - i * 0.15));
    ctx.fillRect(lx - 1, y, 2, 1);
  }
}

export default { drawInfernoBerserker, infernoBerserkerConfig };
