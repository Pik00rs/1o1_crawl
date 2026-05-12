// src/js/render/characters/enemies/inferno_caster.js
// Pyromancien Mineur — caster avec orbes de feu, cortex LED orange.
import { hexToRgba, shade } from '../iso-utils.js';

export const infernoCasterConfig = {
  id: 'inferno_caster', name: 'PYROMANCIEN', archetype: 'inferno_caster',
  bodyColor: '#8a2818', accentColor: '#ff6f1a', glowColor: '#ffd060',
  skinColor: '#a06850', hairColor: '#1a0805', capeColor: '#3a1610',
  height: 'small', weapon: 'fire_orb',
};

export function drawInfernoCaster(ctx, cx, cy, actor, time, options = {}){
  const fxLevel = options.fxLevel ?? 1;
  const idle = actor.idle ?? 0;
  const moving = !!actor.target;
  const bob = Math.sin(idle * 1.0) * 1.2;
  const breathe = Math.sin(idle * 0.7) * 0.3;
  const stride = moving ? Math.sin(time * 0.4) * 1.2 : 0;
  cy = cy - 12 + bob;

  // Halo orange
  if(fxLevel >= 1){
    const auraPulse = 0.4 + Math.sin(time * 0.07) * 0.15;
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

  // Hot ember sur ourlet (signature)
  ctx.fillStyle = actor.accentColor;
  ctx.fillRect(cx - 8, cy + 7, 16, 1);
  ctx.fillStyle = actor.glowColor;
  ctx.fillRect(cx - 5, cy + 8, 1, 0.5);
  ctx.fillRect(cx + 2, cy + 8, 1, 0.5);

  // Belt
  ctx.fillStyle = '#000';
  ctx.fillRect(cx - 6, cy - 1 + breathe, 12, 1.5);
  ctx.fillStyle = actor.accentColor;
  ctx.fillRect(cx - 1, cy - 1 + breathe, 2, 1.5);

  // Fissures sur robe
  const crackPulse = 0.7 + Math.sin(time * 0.08) * 0.3;
  ctx.strokeStyle = hexToRgba(actor.accentColor, crackPulse);
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(cx - 4, cy + 1 + breathe);
  ctx.lineTo(cx - 2, cy + 5 + breathe);
  ctx.moveTo(cx + 3, cy + 0 + breathe);
  ctx.lineTo(cx + 4, cy + 4 + breathe);
  ctx.stroke();

  // Bras (sleeves)
  ctx.fillStyle = actor.capeColor;
  ctx.fillRect(cx - 8, cy - 5 + breathe, 2, 8);
  ctx.fillRect(cx + 6, cy - 5 + breathe, 2, 8);
  // Gants noirs
  ctx.fillStyle = '#1a0805';
  ctx.fillRect(cx - 8, cy + 3 + breathe, 2, 3);
  ctx.fillRect(cx + 6, cy + 3 + breathe, 2, 3);

  // ORBE DE FEU (signature) main gauche
  const orbPulse = 0.85 + Math.sin(time * 0.1) * 0.15;
  const orbGrad = ctx.createRadialGradient(cx - 9, cy + 6 + breathe, 0, cx - 9, cy + 6 + breathe, 6);
  orbGrad.addColorStop(0, hexToRgba('#ffffff', orbPulse));
  orbGrad.addColorStop(0.3, hexToRgba(actor.glowColor, orbPulse * 0.9));
  orbGrad.addColorStop(0.7, hexToRgba(actor.accentColor, orbPulse * 0.6));
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

  // CORTEX LED ORANGE (signature) — tempes
  const ledPulse = 0.85 + Math.sin(time * 0.12) * 0.15;
  ctx.fillStyle = hexToRgba(actor.accentColor, ledPulse);
  ctx.fillRect(cx - 5, cy - 13 + breathe, 1, 2);
  ctx.fillRect(cx + 4, cy - 13 + breathe, 1, 2);
  ctx.fillStyle = hexToRgba(actor.glowColor, ledPulse);
  ctx.fillRect(cx - 5, cy - 13 + breathe, 0.5, 0.5);
  ctx.fillRect(cx + 4, cy - 13 + breathe, 0.5, 0.5);

  // YEUX ORANGES
  const eyePulse = 0.85 + Math.sin(time * 0.08) * 0.15;
  ctx.fillStyle = hexToRgba(actor.accentColor, eyePulse);
  ctx.fillRect(cx - 3, cy - 11 + breathe, 1.5, 1.5);
  ctx.fillRect(cx + 1.5, cy - 11 + breathe, 1.5, 1.5);
  ctx.fillStyle = hexToRgba('#fff', eyePulse);
  ctx.fillRect(cx - 3, cy - 11 + breathe, 0.5, 0.5);
  ctx.fillRect(cx + 1.5, cy - 11 + breathe, 0.5, 0.5);
}

export default { drawInfernoCaster, infernoCasterConfig };
