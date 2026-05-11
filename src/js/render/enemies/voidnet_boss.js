// src/js/render/characters/enemies/voidnet_boss.js
// ARCHITECTE DU VIDE — BOSS final Voidnet.
// Lévite, robe pixels, couronne hex orbitante, cœur void avec étoiles.
import { hexToRgba, shade } from '../../iso-utils.js';

export const voidnetBossConfig = {
  id: 'voidnet_boss', name: 'ARCHITECTE', archetype: 'voidnet_boss',
  bodyColor: '#1a1830', accentColor: '#8a40ff', glowColor: '#00f0ff',
  skinColor: '#3a3850', hairColor: '#0a0818', capeColor: '#0a0818',
  height: 'boss', weapon: 'void_aura',
};

export function drawVoidnetBoss(ctx, cx, cy, actor, time, options = {}){
  const fxLevel = options.fxLevel ?? 1;
  const idle = actor.idle ?? 0;
  const float = Math.sin(idle * 0.55) * 1.6;
  const sway = Math.sin(idle * 0.45 + 1.2) * 0.5;
  const breathe = Math.sin(idle * 0.5) * 0.4;
  cy = cy - 18 + float;
  cx = Math.round(cx + sway);

  // ═══ HALO BOSS (cyan-violet-noir, énorme) ═══
  if(fxLevel >= 1){
    const auraPulse = 0.6 + Math.sin(time * 0.05) * 0.15;
    const aura = ctx.createRadialGradient(cx, cy - 4, 4, cx, cy - 4, 36);
    aura.addColorStop(0, hexToRgba(actor.glowColor, auraPulse * 0.4));
    aura.addColorStop(0.3, hexToRgba(actor.accentColor, auraPulse * 0.4));
    aura.addColorStop(0.7, hexToRgba(actor.bodyColor, auraPulse * 0.3));
    aura.addColorStop(1, hexToRgba(actor.accentColor, 0));
    ctx.fillStyle = aura;
    ctx.fillRect(cx - 36, cy - 40, 72, 72);
  }

  // Pixels qui orbitent (signature)
  if(fxLevel >= 1){
    for(let i = 0; i < 12; i++){
      const t = (time * 0.025 + i * 0.18) % 1;
      const angle = i * 0.6 + time * 0.025;
      const r = 18 + t * 8;
      const ex = cx + Math.cos(angle) * r;
      const ey = cy - 4 + Math.sin(angle) * r * 0.5;
      ctx.fillStyle = hexToRgba(i % 2 === 0 ? actor.accentColor : actor.glowColor, (1 - t) * 0.7);
      ctx.fillRect(Math.round(ex), Math.round(ey), 1, 1);
    }
  }

  // ═══ ROBE EN PIXELS (signature, lévitation, dégradée) ═══
  ctx.fillStyle = actor.capeColor;
  const flow = Math.sin(time * 0.05) * 1.5;
  ctx.beginPath();
  ctx.moveTo(cx - 13 - flow, cy + 18);
  ctx.lineTo(cx + 13 + flow, cy + 18);
  ctx.lineTo(cx + 7, cy - 6 + breathe);
  ctx.lineTo(cx - 7, cy - 6 + breathe);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = shade(actor.capeColor, 0.4);
  ctx.fillRect(cx - 7, cy - 6 + breathe, 2, 24);
  ctx.fillStyle = shade(actor.capeColor, -0.5);
  ctx.fillRect(cx + 5, cy - 6 + breathe, 2, 24);

  // Pixels qui se détachent du bas de la robe (signature)
  if(fxLevel >= 1){
    for(let i = 0; i < 8; i++){
      const t = ((time * 0.04 + i * 0.2) % 1);
      const xx = cx + (i - 4) * 3 + flow * 0.3;
      const yy = cy + 18 + t * 4;
      ctx.fillStyle = hexToRgba(actor.accentColor, (1 - t) * 0.7);
      ctx.fillRect(Math.round(xx), Math.round(yy), 1, 1);
    }
  }

  // Pattern code 0/1 sur robe
  if(fxLevel >= 1){
    ctx.fillStyle = hexToRgba(actor.accentColor, 0.5);
    ctx.font = '2.5px monospace';
    for(let row = 0; row < 5; row++){
      const seed = ((time * 0.4 + row * 7) | 0);
      const bits = (seed & 0xff).toString(2).padStart(8, '0').slice(0, 8);
      for(let col = 0; col < 8; col++){
        ctx.fillText(bits[col], cx - 7 + col * 1.8, cy - 1 + breathe + row * 2.5);
      }
    }
  }

  // Hot hem cyan
  ctx.fillStyle = actor.glowColor;
  ctx.fillRect(cx - 13, cy + 17, 26, 0.5);
  ctx.fillStyle = actor.accentColor;
  for(let i = -4; i <= 4; i++){
    ctx.fillRect(cx + i * 3, cy + 18, 1, 1);
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
  ctx.fillStyle = shade(actor.bodyColor, 0.3);
  ctx.fillRect(cx - 7, cy - 16 + breathe, 2, 10);

  // Circuits sur corsage
  const circuitPulse = 0.8 + Math.sin(time * 0.08) * 0.2;
  ctx.strokeStyle = hexToRgba(actor.accentColor, circuitPulse);
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(cx - 5, cy - 13 + breathe); ctx.lineTo(cx - 5, cy - 8 + breathe); ctx.lineTo(cx - 2, cy - 8 + breathe);
  ctx.moveTo(cx + 5, cy - 13 + breathe); ctx.lineTo(cx + 5, cy - 8 + breathe); ctx.lineTo(cx + 2, cy - 8 + breathe);
  ctx.stroke();
  // Nodes
  ctx.fillStyle = actor.glowColor;
  ctx.fillRect(cx - 5.5, cy - 13.5 + breathe, 1, 1);
  ctx.fillRect(cx + 4.5, cy - 13.5 + breathe, 1, 1);
  ctx.fillRect(cx - 2.5, cy - 8.5 + breathe, 1, 1);
  ctx.fillRect(cx + 1.5, cy - 8.5 + breathe, 1, 1);

  // ═══ CŒUR DU VIDE (signature focal point) ═══
  drawVoidHeart(ctx, cx, cy - 11 + breathe, time, actor);

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

  // Mains "data" — cubes de données
  drawDataHand(ctx, cx - 8, cy + 1 + breathe, time, actor);
  drawDataHand(ctx, cx + 8, cy + 1 + breathe, time + 50, actor);

  // ═══ TÊTE encadrée par capuche ═══
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
  // Hood edge cyan
  ctx.strokeStyle = hexToRgba(actor.glowColor, 0.7);
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(cx - 8, cy - 16 + breathe);
  ctx.lineTo(cx - 7, cy - 24 + breathe);
  ctx.lineTo(cx - 3, cy - 28 + breathe);
  ctx.lineTo(cx + 3, cy - 28 + breathe);
  ctx.lineTo(cx + 7, cy - 24 + breathe);
  ctx.lineTo(cx + 8, cy - 16 + breathe);
  ctx.stroke();

  // 2 YEUX CYAN dans le noir (signature)
  const eyePulse = 0.92 + Math.sin(time * 0.1) * 0.08;
  // Eye glow halo
  const eyeGrad = ctx.createRadialGradient(cx, cy - 21 + breathe, 0, cx, cy - 21 + breathe, 5);
  eyeGrad.addColorStop(0, hexToRgba(actor.glowColor, eyePulse * 0.7));
  eyeGrad.addColorStop(1, hexToRgba(actor.accentColor, 0));
  ctx.fillStyle = eyeGrad;
  ctx.fillRect(cx - 6, cy - 25 + breathe, 12, 9);
  // Eyes cyan
  ctx.fillStyle = hexToRgba(actor.glowColor, eyePulse);
  ctx.fillRect(cx - 3, cy - 22 + breathe, 2, 1.5);
  ctx.fillRect(cx + 1, cy - 22 + breathe, 2, 1.5);
  // White core
  ctx.fillStyle = hexToRgba('#fff', eyePulse);
  ctx.fillRect(cx - 3, cy - 22 + breathe, 1, 1);
  ctx.fillRect(cx + 1, cy - 22 + breathe, 1, 1);

  // ═══ COURONNE HEX ORBITANTE (signature) ═══
  drawOrbitingCrown(ctx, cx, cy - 28 + breathe, time, actor);
}

function drawVoidHeart(ctx, lx, ly, time, actor){
  // Ring violet sombre
  ctx.fillStyle = '#0a0418';
  ctx.beginPath();
  ctx.arc(lx, ly, 3.8, 0, Math.PI * 2);
  ctx.fill();
  // Ring violet
  ctx.fillStyle = actor.accentColor;
  ctx.beginPath();
  ctx.arc(lx, ly, 3, 0, Math.PI * 2);
  ctx.fill();
  // Void noir au centre
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.arc(lx, ly, 2.5, 0, Math.PI * 2);
  ctx.fill();
  // Étoiles cyan/magenta tournantes (signature, contraste avec noir)
  const pulse = 0.9 + Math.sin(time * 0.1) * 0.1;
  for(let i = 0; i < 6; i++){
    const angle = (i / 6) * Math.PI * 2 + time * 0.06;
    const r = 1.7;
    const x = lx + Math.cos(angle) * r;
    const y = ly + Math.sin(angle) * r;
    const c = i % 2 === 0 ? actor.glowColor : actor.accentColor;
    ctx.fillStyle = hexToRgba(c, pulse);
    ctx.fillRect(Math.round(x), Math.round(y), 0.6, 0.6);
  }
  // Center white point
  ctx.fillStyle = hexToRgba('#fff', pulse);
  ctx.fillRect(lx - 0.3, ly - 0.3, 0.6, 0.6);
  // Outer star particles
  for(let i = 0; i < 4; i++){
    const angle = (i / 4) * Math.PI * 2 - time * 0.04;
    const r = 3.5;
    const x = lx + Math.cos(angle) * r;
    const y = ly + Math.sin(angle) * r;
    ctx.fillStyle = hexToRgba(i % 2 === 0 ? actor.glowColor : '#fff', pulse * 0.7);
    ctx.fillRect(Math.round(x - 0.3), Math.round(y - 0.3), 0.5, 0.5);
  }
}

function drawDataHand(ctx, lx, ly, time, actor){
  const pulse = 0.85 + Math.sin(time * 0.12) * 0.15;
  // Floating cube
  const float = Math.sin(time * 0.1) * 0.5;
  ctx.fillStyle = actor.bodyColor;
  ctx.fillRect(lx - 1.5, ly - 1.5 + float, 3, 3);
  ctx.strokeStyle = hexToRgba(actor.accentColor, pulse);
  ctx.lineWidth = 0.5;
  ctx.strokeRect(lx - 1.5, ly - 1.5 + float, 3, 3);
  ctx.fillStyle = hexToRgba(actor.glowColor, pulse);
  ctx.fillRect(lx - 0.7, ly - 0.7 + float, 1.4, 1.4);
  ctx.fillStyle = '#fff';
  ctx.fillRect(lx - 0.3, ly - 0.3 + float, 0.6, 0.6);
}

function drawOrbitingCrown(ctx, lx, ly, time, actor){
  // 5 hex flottant en couronne au-dessus de la tête
  for(let i = 0; i < 5; i++){
    const baseAngle = -Math.PI / 2 + (i - 2) * 0.5;
    const orbitAngle = time * 0.04;
    const x = lx + Math.cos(baseAngle + orbitAngle * 0.3) * 5;
    const y = ly + Math.sin(baseAngle + orbitAngle * 0.3) * 3 - 1;
    const pulse = 0.85 + Math.sin(time * 0.1 + i) * 0.15;
    const size = 1.3 + (i === 2 ? 0.5 : 0); // milieu plus grand

    // Hex
    ctx.fillStyle = actor.bodyColor;
    ctx.beginPath();
    for(let j = 0; j < 6; j++){
      const a = (j / 6) * Math.PI * 2 + orbitAngle;
      const hx = x + Math.cos(a) * size;
      const hy = y + Math.sin(a) * size;
      if(j === 0) ctx.moveTo(hx, hy);
      else ctx.lineTo(hx, hy);
    }
    ctx.closePath();
    ctx.fill();
    // Stroke
    ctx.strokeStyle = hexToRgba(actor.accentColor, pulse);
    ctx.lineWidth = 0.4;
    ctx.stroke();
    // Center glow
    ctx.fillStyle = hexToRgba(actor.glowColor, pulse);
    ctx.fillRect(Math.round(x - 0.3), Math.round(y - 0.3), 0.6, 0.6);
  }
}

export default { drawVoidnetBoss, voidnetBossConfig };
