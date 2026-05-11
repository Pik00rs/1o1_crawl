// src/js/render/characters/enemies/voidnet_glitch.js
// Erreur Persistante — silhouette avec RGB split magenta/cyan, blocs détachés, scan lines.
import { hexToRgba, shade } from '../../iso-utils.js';

export const voidnetGlitchConfig = {
  id: 'voidnet_glitch', name: 'ERREUR', archetype: 'voidnet_glitch',
  bodyColor: '#2a2840', accentColor: '#ff40e0', glowColor: '#00f0ff',
  skinColor: '#3a3850', hairColor: '#1a1828', capeColor: '#0a0818',
  height: 'medium', weapon: 'glitch_strike',
};

export function drawVoidnetGlitch(ctx, cx, cy, actor, time, options = {}){
  const fxLevel = options.fxLevel ?? 1;
  const idle = actor.idle ?? 0;
  const moving = !!actor.target;
  const bob = Math.sin(idle * 1.5) * 1.3;
  const breathe = Math.sin(idle * 1.1) * 0.4;
  const stride = moving ? Math.sin(time * 0.5) * 1.4 : 0;
  cy = cy - 10 + bob;

  // Glitch offset (signature, randomized par frame)
  const glitchActive = Math.floor(time * 0.3) % 7 === 0;
  const gOff = glitchActive ? Math.floor(Math.sin(time * 0.5) * 2) : 0;

  // Halo magenta/cyan
  if(fxLevel >= 1){
    const auraPulse = 0.4 + Math.sin(time * 0.08) * 0.15;
    const aura = ctx.createRadialGradient(cx, cy - 2, 2, cx, cy - 2, 14);
    aura.addColorStop(0, hexToRgba(actor.glowColor, auraPulse * 0.4));
    aura.addColorStop(0.5, hexToRgba(actor.accentColor, auraPulse * 0.3));
    aura.addColorStop(1, hexToRgba(actor.accentColor, 0));
    ctx.fillStyle = aura;
    ctx.fillRect(cx - 14, cy - 16, 28, 28);
  }

  // Body silhouette
  const drawBody = (offX, color, alpha) => {
    ctx.fillStyle = hexToRgba(color, alpha);
    // Legs
    ctx.fillRect(cx - 5 + offX, cy + 6 + stride, 3, 9);
    ctx.fillRect(cx + 2 + offX, cy + 6 - stride, 3, 9);
    // Torso
    ctx.fillRect(cx - 6 + offX, cy - 7 + breathe, 12, 12);
    // Arms
    ctx.fillRect(cx - 8 + offX, cy - 5 + breathe, 2, 9);
    ctx.fillRect(cx + 6 + offX, cy - 5 + breathe, 2, 9);
    // Head
    ctx.fillRect(cx - 4 + offX, cy - 14 + breathe, 8, 7);
  };

  // RGB SPLIT (signature) — 3 couches
  drawBody(-1 + gOff, actor.accentColor, 0.5);  // Magenta couche
  drawBody(1 - gOff, actor.glowColor, 0.5);     // Cyan couche
  drawBody(0, actor.bodyColor, 0.95);            // Main couche

  // SCAN LINES horizontales (signature)
  ctx.fillStyle = hexToRgba('#000', 0.4);
  for(let y = cy - 14; y < cy + 16; y += 2){
    ctx.fillRect(cx - 8, y, 16, 0.5);
  }

  // BLOCS DÉTACHÉS qui sortent du corps (signature)
  if(glitchActive){
    ctx.fillStyle = hexToRgba(actor.accentColor, 0.7);
    ctx.fillRect(cx - 9 + gOff * 2, cy - 3 + breathe, 2, 2);
    ctx.fillStyle = hexToRgba(actor.glowColor, 0.7);
    ctx.fillRect(cx + 8 - gOff * 2, cy + 1 + breathe, 2, 2);
    // Random pixel
    ctx.fillStyle = '#fff';
    ctx.fillRect(cx + 3 + gOff, cy - 4 + breathe, 1, 1);
  }

  // YEUX glitch (un cyan, un magenta — signature)
  const eyePulse = 0.85 + Math.sin(time * 0.1) * 0.15;
  ctx.fillStyle = '#000';
  ctx.fillRect(cx - 3, cy - 12 + breathe, 1.5, 1.5);
  ctx.fillRect(cx + 1.5, cy - 12 + breathe, 1.5, 1.5);
  ctx.fillStyle = hexToRgba(actor.glowColor, eyePulse);
  ctx.fillRect(cx - 3, cy - 12 + breathe, 1, 1);
  ctx.fillStyle = hexToRgba(actor.accentColor, eyePulse);
  ctx.fillRect(cx + 1.5, cy - 12 + breathe, 1, 1);

  // BANDE NUMÉRIQUE 0/1 sur torse (signature)
  if(fxLevel >= 1){
    ctx.fillStyle = hexToRgba(actor.glowColor, 0.5);
    ctx.font = '3px monospace';
    const code = ((time * 0.5) | 0).toString(2).padStart(8, '0').slice(0, 8);
    for(let i = 0; i < code.length; i++){
      ctx.fillText(code[i], cx - 5 + i * 1.4, cy + 0 + breathe);
    }
  }

  // Bras qui s'étirent (glitch arm)
  if(glitchActive && time % 30 < 10){
    ctx.fillStyle = hexToRgba(actor.accentColor, 0.6);
    ctx.fillRect(cx - 12, cy + 0 + breathe, 4, 1);
  }
}

export default { drawVoidnetGlitch, voidnetGlitchConfig };
