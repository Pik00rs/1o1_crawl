// src/js/render/characters/enemies/crimson_brawler.js
// Bagarreur de Fosse — boxeur torse nu avec bandages tachés.
import { hexToRgba, shade } from '../../iso-utils.js';

export const crimsonBrawlerConfig = {
  id: 'crimson_brawler', name: 'BAGARREUR', archetype: 'crimson_brawler',
  bodyColor: '#a87858', accentColor: '#c82828', glowColor: '#e84040',
  skinColor: '#c89878', hairColor: '#3a1a08', capeColor: '#4a2818',
  height: 'medium', weapon: 'none',
};

export function drawCrimsonBrawler(ctx, cx, cy, actor, time, options = {}){
  const fxLevel = options.fxLevel ?? 1;
  const idle = actor.idle ?? 0;
  const moving = !!actor.target;
  const bob = Math.sin(idle) * 1.0;
  const breathe = Math.sin(idle * 0.7) * 0.5;
  const stride = moving ? Math.sin(time * 0.4) * 1.5 : 0;
  cy = cy - 10 + bob;

  // Halo rouge (rage)
  if(fxLevel >= 1){
    const auraPulse = 0.35 + Math.sin(time * 0.06) * 0.1;
    const aura = ctx.createRadialGradient(cx, cy - 2, 2, cx, cy - 2, 14);
    aura.addColorStop(0, hexToRgba(actor.accentColor, auraPulse * 0.5));
    aura.addColorStop(1, hexToRgba(actor.accentColor, 0));
    ctx.fillStyle = aura;
    ctx.fillRect(cx - 14, cy - 16, 28, 28);
  }

  // Pantalon de cuir
  ctx.fillStyle = actor.capeColor;
  ctx.fillRect(cx - 6, cy + 6 + stride, 4, 9);
  ctx.fillRect(cx + 2, cy + 6 - stride, 4, 9);
  ctx.fillStyle = shade(actor.capeColor, -0.4);
  ctx.fillRect(cx - 7, cy + 14 + stride, 5, 2);
  ctx.fillRect(cx + 2, cy + 14 - stride, 5, 2);

  // Belt
  ctx.fillStyle = actor.hairColor;
  ctx.fillRect(cx - 7, cy + 5, 14, 2);
  ctx.fillStyle = '#c8a040';
  ctx.fillRect(cx - 1, cy + 5, 2, 2);

  // Torse nu (skin)
  ctx.fillStyle = actor.skinColor;
  ctx.beginPath();
  ctx.moveTo(cx - 7, cy + 5);
  ctx.lineTo(cx + 7, cy + 5);
  ctx.lineTo(cx + 6, cy - 7 + breathe);
  ctx.lineTo(cx - 6, cy - 7 + breathe);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = shade(actor.skinColor, -0.3);
  ctx.beginPath();
  ctx.moveTo(cx + 7, cy + 5);
  ctx.lineTo(cx + 6, cy - 7 + breathe);
  ctx.lineTo(cx + 2, cy - 7 + breathe);
  ctx.lineTo(cx + 2, cy + 5);
  ctx.closePath();
  ctx.fill();
  // Pec line
  ctx.strokeStyle = shade(actor.skinColor, -0.4);
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(cx, cy - 5 + breathe);
  ctx.lineTo(cx, cy - 1 + breathe);
  ctx.stroke();
  // Cicatrice diagonale (signature)
  ctx.strokeStyle = shade(actor.accentColor, -0.3);
  ctx.lineWidth = 0.6;
  ctx.beginPath();
  ctx.moveTo(cx - 5, cy - 6 + breathe);
  ctx.lineTo(cx + 2, cy - 1 + breathe);
  ctx.stroke();

  // Bras musclés
  ctx.fillStyle = actor.skinColor;
  ctx.fillRect(cx - 9, cy - 5 + breathe, 2, 8);
  ctx.fillRect(cx + 7, cy - 5 + breathe, 2, 8);
  // Poings bandés (signature)
  ctx.fillStyle = '#d8c8a8';
  ctx.fillRect(cx - 10, cy + 3 + breathe, 3, 3);
  ctx.fillRect(cx + 7, cy + 3 + breathe, 3, 3);
  // Sang sur bandages
  ctx.fillStyle = shade(actor.accentColor, -0.3);
  ctx.fillRect(cx - 10, cy + 4 + breathe, 3, 1);
  ctx.fillRect(cx + 7, cy + 4 + breathe, 3, 1);

  // Tête
  ctx.fillStyle = actor.skinColor;
  ctx.beginPath();
  ctx.ellipse(cx, cy - 12 + breathe, 4.5, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = shade(actor.skinColor, -0.2);
  ctx.beginPath();
  ctx.ellipse(cx + 1.5, cy - 12 + breathe, 2.5, 4.5, 0, 0, Math.PI * 2);
  ctx.fill();
  // Cheveux courts
  ctx.fillStyle = actor.hairColor;
  ctx.fillRect(cx - 4, cy - 16 + breathe, 8, 3);
  // Cicatrice sur visage
  ctx.fillStyle = shade(actor.accentColor, -0.4);
  ctx.fillRect(cx + 2, cy - 13 + breathe, 0.5, 3);

  // Yeux intenses
  const eyePulse = 0.85 + Math.sin(time * 0.08) * 0.15;
  ctx.fillStyle = '#000';
  ctx.fillRect(cx - 3, cy - 13 + breathe, 1.5, 1);
  ctx.fillRect(cx + 1.5, cy - 13 + breathe, 1.5, 1);
  ctx.fillStyle = hexToRgba(actor.accentColor, eyePulse);
  ctx.fillRect(cx - 2.5, cy - 13 + breathe, 1, 0.5);
  ctx.fillRect(cx + 2, cy - 13 + breathe, 1, 0.5);

  // Bouche serrée
  ctx.fillStyle = shade(actor.skinColor, -0.5);
  ctx.fillRect(cx - 1, cy - 10 + breathe, 2, 0.5);
}

export default { drawCrimsonBrawler, crimsonBrawlerConfig };
