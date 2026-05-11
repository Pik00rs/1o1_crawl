// src/js/render/characters/enemies/toxic_swarmer.js
// Essaim Bourdonnant — NON HUMANOÏDE. Nuée d'insectes verts orbitant autour
// d'un noyau central, yeux rouges multiples brillant à travers.
import { hexToRgba, shade } from '../../iso-utils.js';

export const toxicSwarmerConfig = {
  id: 'toxic_swarmer', name: 'ESSAIM', archetype: 'toxic_swarmer',
  bodyColor: '#3a5018', accentColor: '#8eb828', glowColor: '#c8e848',
  skinColor: '#5a7818', hairColor: '#2a3810', capeColor: '#1a2008',
  height: 'small', weapon: 'swarm_attack',
};

export function drawToxicSwarmer(ctx, cx, cy, actor, time, options = {}){
  const fxLevel = options.fxLevel ?? 1;
  const idle = actor.idle ?? 0;
  const moving = !!actor.target;
  const hover = Math.sin(idle * 1.4) * 1.5;
  cy = cy - 12 + hover;

  // Ombre sol
  if(fxLevel >= 1){
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 16, 7, 1.5, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Halo vert organique
  if(fxLevel >= 1){
    const auraPulse = 0.4 + Math.sin(time * 0.07) * 0.15;
    const aura = ctx.createRadialGradient(cx, cy - 2, 4, cx, cy - 2, 18);
    aura.addColorStop(0, hexToRgba(actor.glowColor, auraPulse * 0.5));
    aura.addColorStop(0.5, hexToRgba(actor.accentColor, auraPulse * 0.3));
    aura.addColorStop(1, hexToRgba(actor.accentColor, 0));
    ctx.fillStyle = aura;
    ctx.fillRect(cx - 18, cy - 20, 36, 36);
  }

  // NOYAU CENTRAL (signature) — masse organique vert sombre
  const corePulse = 0.85 + Math.sin(time * 0.06) * 0.15;
  // Outer
  ctx.fillStyle = actor.capeColor;
  ctx.beginPath();
  ctx.ellipse(cx, cy, 6, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  // Inner
  ctx.fillStyle = actor.hairColor;
  ctx.beginPath();
  ctx.ellipse(cx, cy, 5, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = shade(actor.hairColor, 0.3);
  ctx.beginPath();
  ctx.ellipse(cx - 1.5, cy - 1, 2, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Pulsations veines internes
  ctx.strokeStyle = hexToRgba(actor.glowColor, corePulse * 0.5);
  ctx.lineWidth = 0.3;
  ctx.beginPath();
  ctx.moveTo(cx - 3, cy - 2); ctx.lineTo(cx + 2, cy + 3);
  ctx.moveTo(cx + 3, cy - 1); ctx.lineTo(cx - 2, cy + 4);
  ctx.stroke();

  // YEUX ROUGES MULTIPLES (signature) — 5 yeux à travers le noyau
  const eyePulse = 0.92 + Math.sin(time * 0.1) * 0.08;
  const eyes = [
    [-2, -3], [2, -2], [-3, 1], [3, 2], [0, 3]
  ];
  for(const [dx, dy] of eyes){
    ctx.fillStyle = '#000';
    ctx.fillRect(cx + dx - 0.5, cy + dy - 0.5, 1.5, 1);
    ctx.fillStyle = hexToRgba('#ff3030', eyePulse);
    ctx.fillRect(cx + dx, cy + dy - 0.3, 0.8, 0.7);
    ctx.fillStyle = hexToRgba('#ffa040', eyePulse);
    ctx.fillRect(cx + dx + 0.2, cy + dy - 0.2, 0.3, 0.3);
  }

  // NUÉE D'INSECTES (signature) — 10 insectes orbitant
  if(fxLevel >= 1){
    for(let i = 0; i < 12; i++){
      const baseAngle = (i / 12) * Math.PI * 2;
      const t = time * 0.08 + i * 1.3;
      const angle = baseAngle + t;
      const r = 9 + Math.sin(t * 0.7 + i) * 2.5;
      const yScale = 0.7;
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r * yScale;
      // Body insect
      ctx.fillStyle = i % 3 === 0 ? actor.accentColor : actor.bodyColor;
      ctx.fillRect(Math.round(x - 0.5), Math.round(y - 0.3), 1.5, 0.8);
      // Wings (flutter)
      if((time + i * 3) % 4 < 2){
        ctx.fillStyle = hexToRgba(actor.glowColor, 0.6);
        ctx.fillRect(Math.round(x - 1), Math.round(y - 1), 0.6, 0.6);
        ctx.fillRect(Math.round(x + 1), Math.round(y - 1), 0.6, 0.6);
      }
    }
  }

  // Spores tombants
  if(fxLevel >= 1){
    for(let i = 0; i < 3; i++){
      const t = (time * 0.05 + i * 0.4) % 1;
      const sx = cx + Math.sin(i * 1.5) * 4;
      const sy = cy + 4 + t * 10;
      ctx.fillStyle = hexToRgba(actor.accentColor, (1 - t) * 0.7);
      ctx.fillRect(Math.round(sx), Math.round(sy), 1, 1);
    }
  }

  // Tendrils en bas (signature)
  for(let i = 0; i < 3; i++){
    const offset = (i - 1) * 2;
    const sway = Math.sin(time * 0.1 + i) * 1;
    ctx.fillStyle = actor.hairColor;
    ctx.fillRect(cx + offset, cy + 5, 1, 4);
    ctx.fillStyle = actor.accentColor;
    ctx.fillRect(cx + offset + sway * 0.3, cy + 8, 1, 1);
  }
}

export default { drawToxicSwarmer, toxicSwarmerConfig };
