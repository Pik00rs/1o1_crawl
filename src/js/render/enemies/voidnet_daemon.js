// src/js/render/enemies/voidnet_daemon.js
// Daemon Mineur — caster ranged.
// Silhouette stable en robe-code numérique (0/1 défilent en texture),
// hexagone flottant au-dessus de la tête, yeux cyan.

export const palette = {
  robe:        '#1a2848',
  robeDark:    '#0a1428',
  robeLight:   '#3a5878',
  code:        '#3df0ff',
  codeDim:     '#1a8aa0',
  hex:         '#3df0ff',
  hexCore:     '#e0ffff',
  hexDark:     '#1a4858',
  cyan:        '#3df0ff',
  cyanCore:    '#e0ffff',
  void:        '#0a0a18',
  shadow:      'rgba(10,10,30,0.7)',
};

export function draw(ctx, sx, sy, t, opts){
  opts = opts || {};
  const p = palette;
  const float = Math.sin(t * 0.04) * 1.0;
  const breathe = Math.sin(t * 0.03) * 0.3;
  sx = Math.round(sx + (opts.bodyShift || 0));
  sy = Math.round(sy + float);

  const armRaise = opts.armRaise !== undefined ? opts.armRaise : -0.3;
  const charging = opts.charging || 0;

  // Shadow
  ctx.fillStyle = p.shadow;
  ctx.beginPath();
  ctx.ellipse(sx, sy + 6, 11, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Cyan glow halo
  const glow = 0.4 + charging * 0.4 + Math.sin(t * 0.06) * 0.1;
  const bg = ctx.createRadialGradient(sx, sy - 14, 4, sx, sy - 14, 28);
  bg.addColorStop(0, `rgba(61,240,255,${glow * 0.5})`);
  bg.addColorStop(1, 'rgba(61,240,255,0)');
  ctx.fillStyle = bg;
  ctx.fillRect(sx - 28, sy - 42, 56, 50);

  // Hexagonal process icon hovering above head
  drawProcessHex(ctx, sx, sy - 38 + breathe, t, p);

  // Robe bottom (s'évase)
  ctx.fillStyle = p.robeDark;
  ctx.beginPath();
  ctx.moveTo(sx - 9, sy + 5);
  ctx.lineTo(sx + 9, sy + 5);
  ctx.lineTo(sx + 7, sy - 14 + breathe);
  ctx.lineTo(sx - 7, sy - 14 + breathe);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = p.robe;
  ctx.fillRect(sx - 7, sy - 14 + breathe, 14, 20);

  // === CODE TEXTURE on robe (0/1 falling) ===
  drawCodeTexture(ctx, sx - 7, sy - 14 + breathe, 14, 20, t, p);

  // Belt
  ctx.fillStyle = p.cyan;
  ctx.fillRect(sx - 8, sy - 4 + breathe, 16, 1);

  // === ARMS ===
  ctx.save();
  ctx.translate(sx - 7, sy - 13 + breathe);
  ctx.rotate(armRaise);
  ctx.fillStyle = p.robeDark;
  ctx.fillRect(-2, 0, 4, 12);
  ctx.fillStyle = p.robe;
  ctx.fillRect(-2, 0, 1, 12);
  // Hand (gloved, glowing)
  ctx.fillStyle = p.void;
  ctx.fillRect(-2, 12, 4, 3);
  // Cyan glow at fingertip
  if(charging > 0){
    drawHandGlow(ctx, 0, 15, t, charging, p);
  }
  ctx.restore();

  // Right arm (hangs)
  ctx.fillStyle = p.robeDark;
  ctx.fillRect(sx + 5, sy - 13 + breathe, 4, 12);
  ctx.fillStyle = p.robe;
  ctx.fillRect(sx + 8, sy - 13 + breathe, 1, 12);
  ctx.fillStyle = p.void;
  ctx.fillRect(sx + 5, sy - 1 + breathe, 4, 3);

  // === HOOD/HEAD ===
  ctx.fillStyle = p.robeDark;
  ctx.beginPath();
  ctx.moveTo(sx - 8, sy - 14 + breathe);
  ctx.lineTo(sx + 8, sy - 14 + breathe);
  ctx.lineTo(sx + 7, sy - 25 + breathe);
  ctx.lineTo(sx + 4, sy - 28 + breathe);
  ctx.lineTo(sx - 4, sy - 28 + breathe);
  ctx.lineTo(sx - 7, sy - 25 + breathe);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = p.robe;
  ctx.fillRect(sx - 6, sy - 27 + breathe, 12, 13);

  // Hood inner shadow
  ctx.fillStyle = p.void;
  ctx.fillRect(sx - 4, sy - 24 + breathe, 8, 8);

  // Eyes (cyan, two horizontal slits)
  const eyePulse = 0.92 + Math.sin(t * 0.09) * 0.08;
  ctx.fillStyle = `rgba(61,240,255,${eyePulse})`;
  ctx.fillRect(sx - 3, sy - 21 + breathe, 2, 1);
  ctx.fillRect(sx + 1, sy - 21 + breathe, 2, 1);
  ctx.fillStyle = `rgba(255,255,255,${eyePulse})`;
  ctx.fillRect(sx - 3, sy - 21 + breathe, 1, 0.5);
  ctx.fillRect(sx + 1, sy - 21 + breathe, 1, 0.5);

  // Hood edge cyan trim
  ctx.fillStyle = p.cyan;
  ctx.fillRect(sx - 8, sy - 14 + breathe, 16, 1);
  ctx.fillStyle = p.cyanCore;
  ctx.fillRect(sx - 6, sy - 14 + breathe, 12, 0.5);
}

function drawProcessHex(ctx, lx, ly, t, p){
  const rotate = t * 0.02;
  const r = 5;
  ctx.save();
  ctx.translate(lx, ly);
  ctx.rotate(rotate);
  // Halo
  const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 2);
  grad.addColorStop(0, 'rgba(224,255,255,0.7)');
  grad.addColorStop(0.5, 'rgba(61,240,255,0.5)');
  grad.addColorStop(1, 'rgba(61,240,255,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(-r * 2, -r * 2, r * 4, r * 4);
  // Hex outline
  ctx.strokeStyle = p.cyan;
  ctx.lineWidth = 1;
  ctx.beginPath();
  for(let i = 0; i < 6; i++){
    const angle = (i / 6) * Math.PI * 2;
    const x = Math.cos(angle) * r;
    const y = Math.sin(angle) * r;
    if(i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.stroke();
  // Inner symbol (a small dot)
  ctx.fillStyle = p.cyanCore;
  ctx.fillRect(-1, -1, 2, 2);
  ctx.restore();
}

function drawCodeTexture(ctx, x, y, w, h, t, p){
  // Falling 0/1 texture
  const cols = 4;
  const rows = Math.floor(h / 3);
  for(let c = 0; c < cols; c++){
    for(let r = 0; r < rows; r++){
      const seed = ((c * 7 + r * 3 + Math.floor(t / 4)) % 10);
      if(seed < 7){
        const cx = x + 1 + c * (w / cols);
        const cy = y + 1 + r * 3;
        ctx.fillStyle = (seed % 2 === 0) ? p.code : p.codeDim;
        // Show 0 or 1
        ctx.fillRect(Math.round(cx), Math.round(cy), 1, 2);
      }
    }
  }
}

function drawHandGlow(ctx, lx, ly, t, intensity, p){
  const r = 4 * intensity;
  const grad = ctx.createRadialGradient(lx, ly, 0, lx, ly, r * 2);
  grad.addColorStop(0, `rgba(255,255,255,${intensity * 0.85})`);
  grad.addColorStop(0.4, `rgba(61,240,255,${intensity * 0.6})`);
  grad.addColorStop(1, 'rgba(61,240,255,0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(lx, ly, r * 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = p.cyanCore;
  ctx.fillRect(Math.round(lx - 0.5), Math.round(ly - 0.5), 1, 1);
}

export const attacks = {
  idle: {
    id: 'idle', name: 'IDLE', icon: '◇',
    duration: 9999, looping: true,
    description: 'Lévite, hexagone-process tourne, code 0/1 défile sur la robe, yeux cyan.',
    phases: [{ from: 0, to: 9999, label: 'Loop' }],
    update(frame){
      const fx = [];
      if(frame % 22 === 0){
        fx.push({ type: 'ash', dx: 0, dy: -38, count: 1, color: '#3df0ff' });
      }
      return { opts: {}, fx };
    },
  },

  chainLightning: {
    id: 'chainLightning', name: 'CHAIN LIGHTNING', icon: '⚡',
    duration: 70,
    description: 'Le shock se propage à 1 ennemi adjacent. Range 5. 15% Silence (1 tour).',
    phases: [
      { from: 0, to: 25, label: 'Charge' },
      { from: 25, to: 35, label: 'Cast' },
      { from: 35, to: 70, label: 'Recovery' },
    ],
    projectile: {
      spawnFrame: 25,
      spawnOffset: { dx: -10, dy: -8 },
      travelFrames: 14,
      drawProjectile(ctx, x, y, vx, vy, t){
        const angle = Math.atan2(vy, vx);
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        // Halo
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, 14);
        grad.addColorStop(0, 'rgba(224,255,255,0.95)');
        grad.addColorStop(0.4, 'rgba(61,240,255,0.7)');
        grad.addColorStop(1, 'rgba(61,240,255,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(-14, -14, 28, 28);
        // Main bolt (triple-zigzag for chain)
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(-9, 0);
        ctx.lineTo(-5, -3);
        ctx.lineTo(-1, 1);
        ctx.lineTo(3, -2);
        ctx.lineTo(7, 1);
        ctx.lineTo(10, 0);
        ctx.stroke();
        ctx.strokeStyle = '#3df0ff';
        ctx.lineWidth = 1;
        ctx.stroke();
        // Branches (chain visualization)
        ctx.strokeStyle = '#88ffff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-1, 1);
        ctx.lineTo(-3, 4);
        ctx.lineTo(-1, 6);
        ctx.moveTo(3, -2);
        ctx.lineTo(5, -5);
        ctx.lineTo(3, -7);
        ctx.stroke();
        // Bright tip
        ctx.fillStyle = '#fff';
        ctx.fillRect(8, -1, 3, 2);
        ctx.restore();
      },
      trailColor: '#3df0ff',
      onHit: {
        flash: '#e0ffff', flashSize: 16,
        sparks: 14, color: '#3df0ff',
        shockwave: '#88ffff', shockwaveRadius: 28,
      },
    },
    update(frame){
      const opts = {};
      const fx = [];
      if(frame < 25){
        const p = frame / 25;
        opts.armRaise = -0.3 - p * 0.7;
        opts.charging = p;
        if(frame % 3 === 0){
          fx.push({ type: 'sparks', dx: -8, dy: -8, count: 1, color: '#88ffff' });
        }
      } else if(frame < 35){
        opts.armRaise = -1.0;
        opts.charging = 1;
        if(frame === 25){
          fx.push({ type: 'flash', dx: -10, dy: -8, color: '#e0ffff', size: 14 });
          fx.push({ type: 'sparks', dx: -10, dy: -8, count: 10, color: '#3df0ff' });
          fx.push({
            type: 'projectile',
            dx: -10, dy: -8,
            useAttackProjectile: 'chainLightning',
          });
        }
      } else {
        const p = (frame - 35) / 35;
        opts.armRaise = -1.0 + p * 0.7;
        opts.charging = Math.max(0, 1 - p);
      }
      return { opts, fx };
    },
  },

  walk: {
    id: 'walk', name: 'WALK', icon: '🏃',
    duration: 160,
    looping: true,
    description: 'Lévitation glissée pour maintenir distance. Aller-retour 80/80. Code défile sur la robe.',
    phases: [
      { from: 0, to: 80, label: 'Recul' },
      { from: 80, to: 160, label: 'Retour' },
    ],
    update(frame){
      const opts = {};
      const fx = [];
      const half = 80;
      let p;
      if(frame < half){
        p = frame / half;
        opts.bodyShift = p * 32;
      } else {
        p = (frame - half) / half;
        opts.bodyShift = (1 - p) * 32;
      }
      if(frame % 14 === 0){
        fx.push({ type: 'ash', dx: 0, dy: 6, count: 1, color: '#3df0ff' });
      }
      return { opts, fx };
    },
  },
};

export const meta = { width: 22, height: 44, groundOffsetY: 0 };
export default { draw, attacks, palette, meta };
