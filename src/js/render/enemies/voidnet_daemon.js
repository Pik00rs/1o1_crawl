// src/js/render/characters/enemies/voidnet_daemon.js
// Daemon Mineur — robe sombre avec code 0/1, hexagone flottant à la tête.
import { hexToRgba, shade } from '../../iso-utils.js';

export const voidnetDaemonConfig = {
  id: 'voidnet_daemon', name: 'DAEMON', archetype: 'voidnet_daemon',
  bodyColor: '#0a0818', accentColor: '#8a40ff', glowColor: '#00f0ff',
  skinColor: '#1a1828', hairColor: '#0a0818', capeColor: '#1a1830',
  height: 'small', weapon: 'data_bolt',
};

export function drawVoidnetDaemon(ctx, cx, cy, actor, time, options = {}){
  const fxLevel = options.fxLevel ?? 1;
  const idle = actor.idle ?? 0;
  const moving = !!actor.target;
  const float = Math.sin(idle * 0.8) * 1.5;
  const breathe = Math.sin(idle * 0.6) * 0.4;
  const headSpin = time * 0.02;
  cy = cy - 12 + float;

  // Ombre sol
  if(fxLevel >= 1){
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 16, 7, 1.5, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Halo cyan-violet
  if(fxLevel >= 1){
    const auraPulse = 0.4 + Math.sin(time * 0.06) * 0.1;
    const aura = ctx.createRadialGradient(cx, cy - 4, 2, cx, cy - 4, 16);
    aura.addColorStop(0, hexToRgba(actor.glowColor, auraPulse * 0.4));
    aura.addColorStop(0.5, hexToRgba(actor.accentColor, auraPulse * 0.3));
    aura.addColorStop(1, hexToRgba(actor.accentColor, 0));
    ctx.fillStyle = aura;
    ctx.fillRect(cx - 16, cy - 22, 32, 36);
  }

  // ROBE basse (s'évase)
  ctx.fillStyle = actor.capeColor;
  ctx.beginPath();
  ctx.moveTo(cx - 8, cy + 10);
  ctx.lineTo(cx + 8, cy + 10);
  ctx.lineTo(cx + 6, cy - 5 + breathe);
  ctx.lineTo(cx - 6, cy - 5 + breathe);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = actor.bodyColor;
  ctx.fillRect(cx - 6, cy - 5 + breathe, 12, 15);
  ctx.fillStyle = shade(actor.bodyColor, 0.4);
  ctx.fillRect(cx - 6, cy - 5 + breathe, 2, 15);

  // CODE 0/1 sur la robe (signature)
  if(fxLevel >= 1){
    ctx.fillStyle = hexToRgba(actor.glowColor, 0.6);
    ctx.font = '2.5px monospace';
    for(let row = 0; row < 4; row++){
      const seed = ((time * 0.3 + row * 7) | 0);
      const bits = (seed & 0xff).toString(2).padStart(6, '0').slice(0, 6);
      for(let col = 0; col < 6; col++){
        ctx.fillText(bits[col], cx - 5 + col * 1.5, cy + 0 + breathe + row * 2);
      }
    }
  }

  // Hot hem violet
  ctx.fillStyle = actor.accentColor;
  ctx.fillRect(cx - 8, cy + 9, 16, 0.5);
  ctx.fillStyle = hexToRgba(actor.glowColor, 0.85);
  ctx.fillRect(cx - 8, cy + 10, 16, 0.5);

  // Bras (sleeves)
  ctx.fillStyle = actor.capeColor;
  ctx.fillRect(cx - 8, cy - 5 + breathe, 2, 9);
  ctx.fillRect(cx + 6, cy - 5 + breathe, 2, 9);
  // Mains "données" (cubes lumineux à la place de mains)
  drawDataHand(ctx, cx - 8, cy + 4 + breathe, time, actor);
  drawDataHand(ctx, cx + 8, cy + 4 + breathe, time + 50, actor);

  // ═══ HEXAGONE FLOTTANT À LA PLACE DE LA TÊTE (signature) ═══
  // Petit espace flottant entre épaules et hex
  ctx.save();
  ctx.translate(cx, cy - 12 + breathe);
  ctx.rotate(headSpin);

  // Outer hex
  ctx.fillStyle = actor.bodyColor;
  ctx.beginPath();
  for(let i = 0; i < 6; i++){
    const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
    const x = Math.cos(a) * 5;
    const y = Math.sin(a) * 5;
    if(i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();

  // Inner hex stroke
  ctx.strokeStyle = hexToRgba(actor.accentColor, 0.85);
  ctx.lineWidth = 0.7;
  ctx.beginPath();
  for(let i = 0; i < 6; i++){
    const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
    const x = Math.cos(a) * 4;
    const y = Math.sin(a) * 4;
    if(i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.stroke();

  // Hex panels
  ctx.strokeStyle = hexToRgba(actor.glowColor, 0.5);
  ctx.lineWidth = 0.3;
  ctx.beginPath();
  for(let i = 0; i < 6; i++){
    const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(a) * 4, Math.sin(a) * 4);
  }
  ctx.stroke();

  ctx.restore();

  // 2 YEUX CYAN à travers le hex (signature)
  const eyePulse = 0.92 + Math.sin(time * 0.1) * 0.08;
  ctx.fillStyle = hexToRgba(actor.glowColor, eyePulse);
  ctx.fillRect(cx - 2, cy - 13 + breathe, 1.2, 1);
  ctx.fillRect(cx + 0.8, cy - 13 + breathe, 1.2, 1);
  ctx.fillStyle = hexToRgba('#fff', eyePulse);
  ctx.fillRect(cx - 2, cy - 13 + breathe, 0.5, 0.5);
  ctx.fillRect(cx + 0.8, cy - 13 + breathe, 0.5, 0.5);
}

function drawDataHand(ctx, lx, ly, time, actor){
  const pulse = 0.85 + Math.sin(time * 0.12) * 0.15;
  // Cube lumineux
  ctx.fillStyle = actor.bodyColor;
  ctx.fillRect(lx - 1.5, ly - 1, 3, 3);
  ctx.fillStyle = hexToRgba(actor.glowColor, pulse);
  ctx.fillRect(lx - 1, ly - 0.5, 2, 2);
  ctx.fillStyle = hexToRgba(actor.accentColor, pulse);
  ctx.fillRect(lx - 0.5, ly - 0.3, 1, 0.6);
}

export default { drawVoidnetDaemon, voidnetDaemonConfig };
