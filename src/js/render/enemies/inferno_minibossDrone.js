// src/js/render/characters/enemies/inferno_minibossDrone.js
// IGNI-7 — MINIBOSS Drone-Sentinelle, NON HUMANOÏDE.
// Hexagone flottant, 4 buses thermiques, bouclier cyan, œil rouge cyclope.
import { hexToRgba, shade } from '../../iso-utils.js';

export const infernoMinibossDroneConfig = {
  id: 'inferno_minibossDrone', name: 'IGNI-7', archetype: 'inferno_minibossDrone',
  bodyColor: '#5a5848', accentColor: '#ff4818', glowColor: '#ffb060',
  skinColor: '#7a6850', hairColor: '#1a1a1a', capeColor: '#3a3838',
  height: 'xlarge', weapon: 'thermal_burst',
};

export function drawInfernoMinibossDrone(ctx, cx, cy, actor, time, options = {}){
  const fxLevel = options.fxLevel ?? 1;
  const idle = actor.idle ?? 0;
  const moving = !!actor.target;
  const hover = Math.sin(idle * 0.7) * 2.0;
  const tilt = Math.sin(idle * 0.5) * 0.3;
  cy = cy - 12 + hover;

  // Ombre au sol (drone flotte)
  if(fxLevel >= 1){
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 16, 8, 2, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Halo orange + cyan (bouclier)
  if(fxLevel >= 1){
    const auraPulse = 0.5 + Math.sin(time * 0.06) * 0.15;
    const aura = ctx.createRadialGradient(cx, cy, 4, cx, cy, 24);
    aura.addColorStop(0, hexToRgba(actor.glowColor, auraPulse * 0.4));
    aura.addColorStop(0.4, hexToRgba(actor.accentColor, auraPulse * 0.3));
    aura.addColorStop(0.8, hexToRgba('#4fc3f7', auraPulse * 0.15));
    aura.addColorStop(1, hexToRgba(actor.accentColor, 0));
    ctx.fillStyle = aura;
    ctx.fillRect(cx - 24, cy - 24, 48, 48);
  }

  // BOUCLIER CYAN SEMI-TRANSPARENT (signature)
  const shieldPulse = 0.4 + Math.sin(time * 0.05) * 0.15;
  ctx.strokeStyle = hexToRgba('#4fc3f7', shieldPulse);
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(cx, cy, 14, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = hexToRgba('#aee6ff', shieldPulse * 0.5);
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.arc(cx, cy, 13, 0, Math.PI * 2);
  ctx.stroke();
  // Hex pattern sur shield (signature scifi)
  ctx.strokeStyle = hexToRgba('#4fc3f7', shieldPulse * 0.3);
  ctx.lineWidth = 0.3;
  for(let i = 0; i < 6; i++){
    const a = (i / 6) * Math.PI * 2;
    const x1 = cx + Math.cos(a) * 13;
    const y1 = cy + Math.sin(a) * 13;
    const x2 = cx + Math.cos(a + Math.PI / 3) * 13;
    const y2 = cy + Math.sin(a + Math.PI / 3) * 13;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  // CORPS HEXAGONAL (signature)
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(tilt * 0.1);

  // Hex body
  ctx.fillStyle = actor.bodyColor;
  ctx.beginPath();
  for(let i = 0; i < 6; i++){
    const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
    const x = Math.cos(a) * 8;
    const y = Math.sin(a) * 8;
    if(i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
  // Inner hex shading
  ctx.fillStyle = shade(actor.bodyColor, -0.3);
  ctx.beginPath();
  for(let i = 0; i < 6; i++){
    const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
    const x = Math.cos(a) * 6;
    const y = Math.sin(a) * 6;
    if(i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
  // Highlight top
  ctx.fillStyle = shade(actor.bodyColor, 0.3);
  ctx.beginPath();
  ctx.moveTo(0, -8);
  ctx.lineTo(7, -4);
  ctx.lineTo(7, -2);
  ctx.lineTo(0, -6);
  ctx.closePath();
  ctx.fill();

  // Hex panels (lignes)
  ctx.strokeStyle = actor.capeColor;
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  for(let i = 0; i < 6; i++){
    const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(a) * 8, Math.sin(a) * 8);
  }
  ctx.stroke();

  // ŒIL ROUGE CENTRAL (signature)
  const eyePulse = 0.92 + Math.sin(time * 0.08) * 0.08;
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.arc(0, 0, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = hexToRgba(actor.accentColor, eyePulse);
  ctx.beginPath();
  ctx.arc(0, 0, 2.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = hexToRgba(actor.glowColor, eyePulse);
  ctx.beginPath();
  ctx.arc(0, 0, 1.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.fillRect(-0.3, -0.3, 0.6, 0.6);
  // Iris scan ring
  ctx.strokeStyle = hexToRgba(actor.glowColor, eyePulse * 0.7);
  ctx.lineWidth = 0.4;
  ctx.beginPath();
  ctx.arc(0, 0, 2.5, time * 0.08, time * 0.08 + Math.PI * 0.6);
  ctx.stroke();

  ctx.restore();

  // 4 BUSES THERMIQUES (signature) — aux 4 corners hex
  const positions = [
    [-8, -4], [8, -4], [-8, 4], [8, 4]
  ];
  for(const [dx, dy] of positions){
    drawNozzle(ctx, cx + dx, cy + dy, time, actor);
  }
  // Hot exhaust en bas
  if(fxLevel >= 1){
    const exhaustPulse = 0.85 + Math.sin(time * 0.15) * 0.15;
    for(let i = 0; i < 4; i++){
      const offset = (i / 4 - 0.5) * 10;
      ctx.fillStyle = hexToRgba(actor.accentColor, exhaustPulse * 0.5);
      ctx.fillRect(cx + offset - 0.5, cy + 8, 1, 5);
      ctx.fillStyle = hexToRgba(actor.glowColor, exhaustPulse * 0.7);
      ctx.fillRect(cx + offset, cy + 8, 0.5, 2);
    }
  }
}

function drawNozzle(ctx, lx, ly, time, actor){
  const pulse = 0.85 + Math.sin(time * 0.12) * 0.15;
  // Body
  ctx.fillStyle = shade(actor.bodyColor, -0.3);
  ctx.fillRect(lx - 1.5, ly - 1, 3, 2);
  ctx.fillStyle = '#000';
  ctx.fillRect(lx - 1, ly - 0.5, 2, 1);
  // Hot core
  ctx.fillStyle = hexToRgba(actor.accentColor, pulse);
  ctx.fillRect(lx - 0.5, ly - 0.3, 1, 0.6);
  ctx.fillStyle = hexToRgba(actor.glowColor, pulse);
  ctx.fillRect(lx - 0.3, ly - 0.2, 0.5, 0.4);
}

export default { drawInfernoMinibossDrone, infernoMinibossDroneConfig };
