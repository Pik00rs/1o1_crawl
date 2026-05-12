// src/js/render/characters/enemies/inferno_boss.js
// PYROMANCIEN SUPRÊME — BOSS Inferno final.
// Lévite, robe noire-rouge, capuche, cœur thermonucléaire, 2 yeux blancs, spirales feu.
import { hexToRgba, shade } from '../iso-utils.js';

export const infernoBossConfig = {
  id: 'inferno_boss', name: 'PYROMANCIEN', archetype: 'inferno_boss',
  bodyColor: '#3a0808', accentColor: '#ff4818', glowColor: '#aee6ff',
  skinColor: '#5a2818', hairColor: '#1a0402', capeColor: '#1a0202',
  height: 'boss', weapon: 'flame_aura',
};

export function drawInfernoBoss(ctx, cx, cy, actor, time, options = {}){
  const fxLevel = options.fxLevel ?? 1;
  const idle = actor.idle ?? 0;
  const moving = !!actor.target;
  const float = Math.sin(idle * 0.6) * 1.5;
  const sway = Math.sin(idle * 0.5 + 1.2) * 0.6;
  const breathe = Math.sin(idle * 0.5) * 0.4;
  cy = cy - 18 + float;
  cx = Math.round(cx + sway);

  // ═══ HALO BOSS (rouge-orange-blanc, énorme) ═══
  if(fxLevel >= 1){
    const auraPulse = 0.6 + Math.sin(time * 0.05) * 0.15;
    const aura = ctx.createRadialGradient(cx, cy - 4, 4, cx, cy - 4, 32);
    aura.addColorStop(0, hexToRgba('#ffffff', auraPulse * 0.5));
    aura.addColorStop(0.2, hexToRgba(actor.glowColor, auraPulse * 0.4));
    aura.addColorStop(0.5, hexToRgba(actor.accentColor, auraPulse * 0.4));
    aura.addColorStop(0.8, hexToRgba('#5a0808', auraPulse * 0.2));
    aura.addColorStop(1, hexToRgba(actor.accentColor, 0));
    ctx.fillStyle = aura;
    ctx.fillRect(cx - 32, cy - 36, 64, 64);
  }

  // Embers ambient (signature)
  if(fxLevel >= 1){
    for(let i = 0; i < 6; i++){
      const t = (time * 0.03 + i * 0.4) % 1;
      const angle = i * 1.1 + time * 0.03;
      const r = 12 + t * 8;
      const ex = cx + Math.cos(angle) * r;
      const ey = cy - 2 - t * 18;
      ctx.fillStyle = hexToRgba(actor.accentColor, (1 - t) * 0.7);
      ctx.fillRect(Math.round(ex), Math.round(ey), 1, 1);
    }
  }

  // ═══ ROBE QUI S'ÉVASE (lévitation) ═══
  ctx.fillStyle = actor.capeColor;
  const flow = Math.sin(time * 0.05) * 1.5;
  ctx.beginPath();
  ctx.moveTo(cx - 12 - flow, cy + 18);
  ctx.lineTo(cx + 12 + flow, cy + 18);
  ctx.lineTo(cx + 7, cy - 6 + breathe);
  ctx.lineTo(cx - 7, cy - 6 + breathe);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = shade(actor.capeColor, 0.4);
  ctx.fillRect(cx - 7, cy - 6 + breathe, 2, 24);
  ctx.fillStyle = shade(actor.capeColor, -0.4);
  ctx.fillRect(cx + 5, cy - 6 + breathe, 2, 24);

  // Fissures rouges sur robe (signature)
  const crackPulse = 0.85 + Math.sin(time * 0.07) * 0.15;
  ctx.strokeStyle = hexToRgba(actor.accentColor, crackPulse);
  ctx.lineWidth = 0.7;
  ctx.beginPath();
  ctx.moveTo(cx - 5, cy + 16); ctx.lineTo(cx - 2, cy - 4 + breathe);
  ctx.moveTo(cx + 5, cy + 16); ctx.lineTo(cx + 2, cy - 4 + breathe);
  ctx.moveTo(cx, cy + 17); ctx.lineTo(cx, cy - 5 + breathe);
  ctx.stroke();

  // Hot hem (signature)
  ctx.fillStyle = actor.accentColor;
  for(let i = -3; i <= 3; i++){
    const xpos = cx + i * 3 + flow * 0.3;
    ctx.fillRect(xpos - 1.5, cy + 17, 3, 2);
  }
  ctx.fillStyle = actor.glowColor;
  for(let i = -3; i <= 3; i++){
    const xpos = cx + i * 3 + flow * 0.3;
    ctx.fillRect(xpos - 0.5, cy + 17, 1, 1);
  }

  // ═══ CORSAGE ═══
  ctx.fillStyle = actor.bodyColor;
  ctx.beginPath();
  ctx.moveTo(cx - 8, cy - 6 + breathe);
  ctx.lineTo(cx + 8, cy - 6 + breathe);
  ctx.lineTo(cx + 7, cy - 16 + breathe);
  ctx.lineTo(cx - 7, cy - 16 + breathe);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = shade(actor.bodyColor, 0.2);
  ctx.fillRect(cx - 7, cy - 16 + breathe, 2, 10);

  // Fissures hot
  ctx.strokeStyle = hexToRgba(actor.accentColor, crackPulse);
  ctx.lineWidth = 0.7;
  ctx.beginPath();
  ctx.moveTo(cx - 6, cy - 13 + breathe); ctx.lineTo(cx - 3, cy - 8 + breathe);
  ctx.moveTo(cx + 6, cy - 13 + breathe); ctx.lineTo(cx + 3, cy - 8 + breathe);
  ctx.stroke();

  // ═══ CŒUR THERMONUCLÉAIRE BLANC-CYAN (signature, contraste avec robe rouge) ═══
  drawThermonuclearHeart(ctx, cx, cy - 11 + breathe, time, actor);

  // Sleeves
  ctx.fillStyle = actor.capeColor;
  ctx.beginPath();
  ctx.moveTo(cx - 8, cy - 15 + breathe);
  ctx.lineTo(cx - 5, cy - 15 + breathe);
  ctx.lineTo(cx - 6, cy - 3 + breathe);
  ctx.lineTo(cx - 9, cy - 3 + breathe);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx + 5, cy - 15 + breathe);
  ctx.lineTo(cx + 8, cy - 15 + breathe);
  ctx.lineTo(cx + 9, cy - 3 + breathe);
  ctx.lineTo(cx + 6, cy - 3 + breathe);
  ctx.closePath();
  ctx.fill();

  // Mains émettant feu
  ctx.fillStyle = '#000';
  ctx.fillRect(cx - 9, cy - 3 + breathe, 3, 3);
  ctx.fillRect(cx + 6, cy - 3 + breathe, 3, 3);

  // SPIRALES DE FEU dans les mains (signature)
  drawFireSpiral(ctx, cx - 8, cy + 1 + breathe, time, actor, 1);
  drawFireSpiral(ctx, cx + 8, cy + 1 + breathe, time + 30, actor, -1);

  // ═══ TÊTE (encadrée par capuche) ═══
  // Capuche
  ctx.fillStyle = actor.capeColor;
  ctx.beginPath();
  ctx.moveTo(cx - 8, cy - 16 + breathe);
  ctx.lineTo(cx + 8, cy - 16 + breathe);
  ctx.lineTo(cx + 7, cy - 24 + breathe);
  ctx.lineTo(cx + 3, cy - 28 + breathe);
  ctx.lineTo(cx - 3, cy - 28 + breathe);
  ctx.lineTo(cx - 7, cy - 24 + breathe);
  ctx.closePath();
  ctx.fill();
  // Hood inner shadow
  ctx.fillStyle = '#000';
  ctx.fillRect(cx - 5, cy - 25 + breathe, 10, 9);

  // Fissures sur capuche
  ctx.strokeStyle = hexToRgba(actor.accentColor, crackPulse);
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(cx - 6, cy - 22 + breathe); ctx.lineTo(cx - 4, cy - 18 + breathe);
  ctx.moveTo(cx + 6, cy - 22 + breathe); ctx.lineTo(cx + 4, cy - 18 + breathe);
  ctx.stroke();

  // 2 YEUX BLANCS BRILLANTS (signature)
  const eyePulse = 0.92 + Math.sin(time * 0.1) * 0.08;
  // Halo eyes
  const eyeGrad = ctx.createRadialGradient(cx, cy - 21 + breathe, 0, cx, cy - 21 + breathe, 5);
  eyeGrad.addColorStop(0, hexToRgba('#ffffff', eyePulse * 0.6));
  eyeGrad.addColorStop(1, hexToRgba(actor.glowColor, 0));
  ctx.fillStyle = eyeGrad;
  ctx.fillRect(cx - 6, cy - 25 + breathe, 12, 9);
  // Eyes pure white
  ctx.fillStyle = hexToRgba('#ffffff', eyePulse);
  ctx.fillRect(cx - 3, cy - 22 + breathe, 2, 2);
  ctx.fillRect(cx + 1, cy - 22 + breathe, 2, 2);
  // Inner glow cyan
  ctx.fillStyle = hexToRgba(actor.glowColor, eyePulse * 0.7);
  ctx.fillRect(cx - 2.8, cy - 21.8 + breathe, 1.6, 1.6);
  ctx.fillRect(cx + 1.2, cy - 21.8 + breathe, 1.6, 1.6);

  // Couronne flames sur capuche (signature)
  for(let i = 0; i < 5; i++){
    const offset = i - 2;
    const len = 4 + Math.abs(offset) * 0.3;
    const fp = 0.85 + Math.sin(time * 0.15 + i * 0.5) * 0.15;
    ctx.fillStyle = hexToRgba(actor.accentColor, fp);
    ctx.fillRect(Math.round(cx + offset * 1.5), Math.round(cy - 28 + breathe - len), 1, len);
    ctx.fillStyle = hexToRgba(actor.glowColor, fp);
    ctx.fillRect(Math.round(cx + offset * 1.5), Math.round(cy - 28 + breathe - len), 0.5, len * 0.4);
  }
}

function drawThermonuclearHeart(ctx, lx, ly, time, actor){
  // Ring rouge sombre (containment)
  ctx.fillStyle = '#3a0606';
  ctx.beginPath();
  ctx.arc(lx, ly, 3.8, 0, Math.PI * 2);
  ctx.fill();
  // Ring orange
  ctx.fillStyle = actor.accentColor;
  ctx.beginPath();
  ctx.arc(lx, ly, 3, 0, Math.PI * 2);
  ctx.fill();
  // Core blanc-cyan (contraste avec rouge)
  const pulse = 0.9 + Math.sin(time * 0.1) * 0.1;
  ctx.fillStyle = hexToRgba(actor.glowColor, pulse);
  ctx.beginPath();
  ctx.arc(lx, ly, 2.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = hexToRgba('#ffffff', pulse);
  ctx.beginPath();
  ctx.arc(lx, ly, 1.3, 0, Math.PI * 2);
  ctx.fill();
  // Rotating particles
  for(let i = 0; i < 4; i++){
    const angle = (i / 4) * Math.PI * 2 + time * 0.05;
    const x = lx + Math.cos(angle) * 1.7;
    const y = ly + Math.sin(angle) * 1.7;
    ctx.fillStyle = hexToRgba(actor.accentColor, pulse);
    ctx.fillRect(Math.round(x), Math.round(y), 0.5, 0.5);
  }
  // Energy cross
  ctx.strokeStyle = hexToRgba(actor.glowColor, pulse * 0.7);
  ctx.lineWidth = 0.4;
  ctx.beginPath();
  ctx.moveTo(lx - 5, ly); ctx.lineTo(lx + 5, ly);
  ctx.moveTo(lx, ly - 5); ctx.lineTo(lx, ly + 5);
  ctx.stroke();
}

function drawFireSpiral(ctx, lx, ly, time, actor, dir){
  // 5 segments en spirale
  for(let i = 0; i < 5; i++){
    const angle = (i / 5) * Math.PI * 2 + time * 0.1 * dir;
    const r = 0.8 + i * 0.6;
    const x = lx + Math.cos(angle) * r;
    const y = ly + Math.sin(angle) * r;
    const a = (1 - i / 5);
    ctx.fillStyle = hexToRgba(actor.accentColor, a * 0.9);
    ctx.fillRect(Math.round(x - 0.5), Math.round(y - 0.5), 1.5, 1.5);
    if(i < 2){
      ctx.fillStyle = hexToRgba(actor.glowColor, a);
      ctx.fillRect(Math.round(x), Math.round(y), 0.7, 0.7);
    }
  }
  // Center hot core
  ctx.fillStyle = '#fff';
  ctx.fillRect(lx - 0.3, ly - 0.3, 0.6, 0.6);
}

export default { drawInfernoBoss, infernoBossConfig };
