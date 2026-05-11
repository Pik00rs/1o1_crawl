// src/js/render/characters/enemies/toxic_brute.js
// Mutant Putréfié — voûté, peau verte, plaques nécrosées, veines violettes, bave.
import { hexToRgba, shade } from '../../iso-utils.js';

export const toxicBruteConfig = {
  id: 'toxic_brute', name: 'PUTRÉFIÉ', archetype: 'toxic_brute',
  bodyColor: '#4a6818', accentColor: '#8eb828', glowColor: '#c8e848',
  skinColor: '#6a8828', hairColor: '#3a5018', capeColor: '#2a3810',
  height: 'medium', weapon: 'none',
};

export function drawToxicBrute(ctx, cx, cy, actor, time, options = {}){
  const fxLevel = options.fxLevel ?? 1;
  const idle = actor.idle ?? 0;
  const moving = !!actor.target;
  const bob = Math.sin(idle * 0.95) * 1.0;
  const breathe = Math.sin(idle * 0.65) * 0.5;
  const stride = moving ? Math.sin(time * 0.38) * 1.4 : 0;
  cy = cy - 9 + bob; // voûté

  // Halo vert toxique
  if(fxLevel >= 1){
    const auraPulse = 0.4 + Math.sin(time * 0.06) * 0.15;
    const aura = ctx.createRadialGradient(cx, cy - 2, 2, cx, cy - 2, 16);
    aura.addColorStop(0, hexToRgba(actor.glowColor, auraPulse * 0.5));
    aura.addColorStop(0.6, hexToRgba(actor.accentColor, auraPulse * 0.3));
    aura.addColorStop(1, hexToRgba(actor.accentColor, 0));
    ctx.fillStyle = aura;
    ctx.fillRect(cx - 16, cy - 18, 32, 32);
  }

  // Spores flottants (signature)
  if(fxLevel >= 1){
    for(let i = 0; i < 3; i++){
      const t = (time * 0.03 + i * 0.6) % 1;
      const sx = cx + Math.sin(i * 1.7 + time * 0.05) * 8;
      const sy = cy - 6 - t * 14;
      ctx.fillStyle = hexToRgba(actor.accentColor, (1 - t) * 0.6);
      ctx.fillRect(Math.round(sx), Math.round(sy), 1, 1);
    }
  }

  // Jambes
  ctx.fillStyle = shade(actor.bodyColor, -0.3);
  ctx.fillRect(cx - 6, cy + 6 + stride, 4, 9);
  ctx.fillRect(cx + 2, cy + 6 - stride, 4, 9);
  // Plaques nécrotiques jambes
  ctx.fillStyle = '#8a3a6a';
  ctx.fillRect(cx - 5, cy + 9 + stride, 2, 2);
  ctx.fillRect(cx + 3, cy + 11 - stride, 2, 2);
  // Pieds nus
  ctx.fillStyle = shade(actor.bodyColor, -0.5);
  ctx.fillRect(cx - 7, cy + 14 + stride, 5, 2);
  ctx.fillRect(cx + 2, cy + 14 - stride, 5, 2);

  // Loincloth déchirée
  ctx.fillStyle = actor.capeColor;
  ctx.fillRect(cx - 6, cy - 1 + breathe, 12, 7);
  ctx.fillStyle = shade(actor.capeColor, 0.3);
  ctx.fillRect(cx - 6, cy - 1 + breathe, 12, 1);
  // Loincloth strips déchirés
  ctx.fillStyle = actor.capeColor;
  ctx.beginPath();
  ctx.moveTo(cx - 6, cy + 6);
  ctx.lineTo(cx - 4, cy + 8);
  ctx.lineTo(cx - 2, cy + 6);
  ctx.lineTo(cx, cy + 7);
  ctx.lineTo(cx + 2, cy + 6);
  ctx.lineTo(cx + 4, cy + 8);
  ctx.lineTo(cx + 6, cy + 6);
  ctx.closePath();
  ctx.fill();

  // TORSE NU peau verte (signature)
  ctx.fillStyle = actor.bodyColor;
  ctx.beginPath();
  ctx.moveTo(cx - 8, cy + 5);
  ctx.lineTo(cx + 8, cy + 5);
  ctx.lineTo(cx + 7, cy - 7 + breathe);
  ctx.lineTo(cx - 7, cy - 7 + breathe);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = shade(actor.bodyColor, -0.3);
  ctx.beginPath();
  ctx.moveTo(cx + 8, cy + 5);
  ctx.lineTo(cx + 7, cy - 7 + breathe);
  ctx.lineTo(cx + 2, cy - 7 + breathe);
  ctx.lineTo(cx + 2, cy + 5);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = shade(actor.bodyColor, 0.25);
  ctx.fillRect(cx - 7, cy - 6 + breathe, 2, 11);

  // PLAQUES NÉCROSÉES violet (signature)
  ctx.fillStyle = '#5a2848';
  ctx.fillRect(cx - 5, cy - 3 + breathe, 3, 3);
  ctx.fillRect(cx + 3, cy + 1 + breathe, 3, 2);
  ctx.fillRect(cx - 2, cy + 2 + breathe, 2, 2);
  // Centre purulent
  ctx.fillStyle = '#8a3a6a';
  ctx.fillRect(cx - 4, cy - 2 + breathe, 1, 1);
  ctx.fillRect(cx + 4, cy + 2 + breathe, 1, 1);

  // VEINES VIOLETTES (signature)
  const veinPulse = 0.6 + Math.sin(time * 0.07) * 0.2;
  ctx.strokeStyle = hexToRgba('#a040a0', veinPulse);
  ctx.lineWidth = 0.4;
  ctx.beginPath();
  ctx.moveTo(cx - 6, cy - 5 + breathe); ctx.lineTo(cx - 4, cy + 1 + breathe);
  ctx.moveTo(cx + 5, cy - 4 + breathe); ctx.lineTo(cx + 3, cy + 2 + breathe);
  ctx.moveTo(cx, cy - 6 + breathe); ctx.lineTo(cx + 1, cy - 1 + breathe);
  ctx.stroke();

  // BRAS PENDANTS (signature)
  ctx.fillStyle = shade(actor.bodyColor, -0.1);
  ctx.fillRect(cx - 9, cy - 5 + breathe, 2, 10);
  ctx.fillRect(cx + 7, cy - 5 + breathe, 2, 10);
  // Mains griffues
  ctx.fillStyle = shade(actor.bodyColor, -0.4);
  ctx.fillRect(cx - 9, cy + 5 + breathe, 2, 2);
  ctx.fillRect(cx + 7, cy + 5 + breathe, 2, 2);
  // Griffes
  ctx.fillStyle = '#3a5018';
  ctx.fillRect(cx - 9, cy + 7 + breathe, 0.5, 1.5);
  ctx.fillRect(cx - 8, cy + 7 + breathe, 0.5, 1.5);
  ctx.fillRect(cx + 7, cy + 7 + breathe, 0.5, 1.5);
  ctx.fillRect(cx + 8, cy + 7 + breathe, 0.5, 1.5);
  // Plaque sur biceps
  ctx.fillStyle = '#5a2848';
  ctx.fillRect(cx - 9, cy - 2 + breathe, 2, 2);
  ctx.fillRect(cx + 7, cy - 2 + breathe, 2, 2);

  // TÊTE chauve
  ctx.fillStyle = actor.skinColor;
  ctx.beginPath();
  ctx.ellipse(cx, cy - 11 + breathe, 4.5, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = shade(actor.skinColor, -0.2);
  ctx.beginPath();
  ctx.ellipse(cx + 1.5, cy - 11 + breathe, 2.5, 4.5, 0, 0, Math.PI * 2);
  ctx.fill();
  // Plaques sur crâne
  ctx.fillStyle = '#5a2848';
  ctx.fillRect(cx - 3, cy - 15 + breathe, 2, 2);
  ctx.fillRect(cx + 1, cy - 13 + breathe, 2, 2);

  // Yeux jaunes vides
  const eyePulse = 0.85 + Math.sin(time * 0.08) * 0.15;
  ctx.fillStyle = '#000';
  ctx.fillRect(cx - 3, cy - 12 + breathe, 1.5, 1.5);
  ctx.fillRect(cx + 1.5, cy - 12 + breathe, 1.5, 1.5);
  ctx.fillStyle = hexToRgba('#d8c020', eyePulse);
  ctx.fillRect(cx - 2.5, cy - 12 + breathe, 1, 1);
  ctx.fillRect(cx + 2, cy - 12 + breathe, 1, 1);

  // BOUCHE qui bave (signature)
  ctx.fillStyle = '#000';
  ctx.fillRect(cx - 2, cy - 9 + breathe, 4, 2);
  // Dents
  ctx.fillStyle = '#a89878';
  for(let i = 0; i < 3; i++){
    ctx.fillRect(cx - 1.5 + i * 1.5, cy - 9 + breathe, 0.5, 0.5);
  }
  // BAVE qui dégouline (signature)
  const droolLen = 2 + (time % 30) / 30 * 2;
  ctx.fillStyle = hexToRgba(actor.glowColor, 0.85);
  ctx.fillRect(cx + 1, cy - 7 + breathe, 0.5, droolLen);
  ctx.fillStyle = actor.accentColor;
  ctx.fillRect(cx + 1, cy - 7 + breathe + droolLen - 0.5, 0.7, 0.7);
}

export default { drawToxicBrute, toxicBruteConfig };
