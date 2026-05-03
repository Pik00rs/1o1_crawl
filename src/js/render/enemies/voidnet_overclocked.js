// src/js/render/enemies/voidnet_overclocked.js
// Process Overclocké — ÉLITE.
// Silhouette qui vibre intensément (effet motion blur pixelisé), traînées qui suivent,
// cyan saturé + arcs électriques constants autour du corps.

export const palette = {
  body:        '#2a4878',
  bodyDark:    '#0a1828',
  bodyLight:   '#5a88b8',
  cyan:        '#3df0ff',
  cyanCore:    '#e0ffff',
  cyanHot:     '#88ffff',
  cyanDark:    '#1a8aa0',
  trail:       'rgba(61,240,255,0.45)',
  arc:         '#e0ffff',
  void:        '#0a0a18',
  shadow:      'rgba(10,30,50,0.85)',
};

export function draw(ctx, sx, sy, t, opts){
  opts = opts || {};
  const p = palette;
  // Vibration constante : jitter horizontal + vertical
  const jitterX = Math.sin(t * 0.6) * 1.5;
  const jitterY = Math.cos(t * 0.8) * 1.0;
  const baseSx = sx + (opts.bodyShift || 0);
  sx = Math.round(baseSx + jitterX);
  sy = Math.round(sy + jitterY);

  const armRaise1 = opts.armRaise1 || 0;
  const armRaise2 = opts.armRaise2 || 0;
  const intensity = opts.intensity !== undefined ? opts.intensity : 1;

  // Shadow (large, vibrant)
  ctx.fillStyle = p.shadow;
  ctx.beginPath();
  ctx.ellipse(Math.round(baseSx), sy + 9, 15, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Saturated cyan glow
  const glow = 0.55 + intensity * 0.3 + Math.sin(t * 0.12) * 0.15;
  const bg = ctx.createRadialGradient(sx, sy - 16, 6, sx, sy - 16, 38);
  bg.addColorStop(0, `rgba(61,240,255,${glow * 0.6})`);
  bg.addColorStop(0.4, `rgba(136,255,255,${glow * 0.4})`);
  bg.addColorStop(1, 'rgba(61,240,255,0)');
  ctx.fillStyle = bg;
  ctx.fillRect(sx - 38, sy - 50, 76, 64);

  // === MOTION TRAILS (3 ghost copies behind) ===
  for(let i = 1; i <= 3; i++){
    const trailSx = Math.round(baseSx - i * 4 + Math.sin(t * 0.6 + i) * 1.2);
    const trailSy = Math.round(sy + Math.cos(t * 0.8 + i) * 0.8);
    drawFigure(ctx, trailSx, trailSy, t - i * 4, p, 0.45 - i * 0.1, 0, 0);
  }

  // === MAIN FIGURE ===
  drawFigure(ctx, sx, sy, t, p, 1, armRaise1, armRaise2);

  // === ELECTRIC ARCS around the body (constant) ===
  drawElectricArcs(ctx, sx, sy - 16, t, intensity, p);
}

function drawFigure(ctx, sx, sy, t, p, alpha, armRaise1, armRaise2){
  ctx.save();
  ctx.globalAlpha = alpha;
  const breathe = Math.sin(t * 0.04) * 0.3;

  // Legs (élite scale, slim)
  ctx.fillStyle = p.bodyDark;
  ctx.fillRect(sx - 8, sy - 1, 6, 11);
  ctx.fillRect(sx + 2, sy - 1, 6, 11);
  ctx.fillStyle = p.body;
  ctx.fillRect(sx - 8, sy - 1, 1, 11);
  // Cyan circuit lines
  ctx.fillStyle = p.cyan;
  ctx.fillRect(sx - 6, sy + 4, 2, 1);
  ctx.fillRect(sx + 4, sy + 4, 2, 1);

  // Boots
  ctx.fillStyle = p.void;
  ctx.fillRect(sx - 9, sy + 10, 7, 4);
  ctx.fillRect(sx + 2, sy + 10, 7, 4);
  ctx.fillStyle = p.cyanHot;
  ctx.fillRect(sx - 9, sy + 13, 7, 1);
  ctx.fillRect(sx + 2, sy + 13, 7, 1);

  // === TORSO (élite, larger) ===
  ctx.fillStyle = p.bodyDark;
  ctx.fillRect(sx - 11, sy - 22 + breathe, 22, 21);
  ctx.fillStyle = p.body;
  ctx.fillRect(sx - 11, sy - 22 + breathe, 22, 19);
  ctx.fillStyle = p.bodyLight;
  ctx.fillRect(sx - 11, sy - 22 + breathe, 3, 21);

  // Big cyan circuit pattern on chest
  ctx.strokeStyle = p.cyan;
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(sx - 8, sy - 18 + breathe); ctx.lineTo(sx - 8, sy - 14 + breathe);
  ctx.lineTo(sx - 4, sy - 14 + breathe); ctx.lineTo(sx - 4, sy - 8 + breathe);
  ctx.moveTo(sx + 4, sy - 19 + breathe); ctx.lineTo(sx + 4, sy - 13 + breathe);
  ctx.lineTo(sx + 8, sy - 13 + breathe); ctx.lineTo(sx + 8, sy - 5 + breathe);
  ctx.moveTo(sx, sy - 18 + breathe); ctx.lineTo(sx, sy - 6 + breathe);
  ctx.stroke();

  // LED dots
  ctx.fillStyle = p.cyanCore;
  ctx.fillRect(sx - 8, sy - 18 + breathe, 1, 1);
  ctx.fillRect(sx + 4, sy - 19 + breathe, 1, 1);
  ctx.fillRect(sx, sy - 18 + breathe, 1, 1);
  ctx.fillRect(sx - 4, sy - 8 + breathe, 1, 1);
  ctx.fillRect(sx + 8, sy - 5 + breathe, 1, 1);

  // === ARMS (2 sets — primary + secondary effect) ===
  // Left arm
  ctx.save();
  ctx.translate(sx - 11, sy - 21 + breathe);
  ctx.rotate(armRaise1);
  ctx.fillStyle = p.bodyDark;
  ctx.fillRect(-2, 0, 4, 13);
  ctx.fillStyle = p.body;
  ctx.fillRect(-2, 0, 1, 13);
  ctx.fillStyle = p.void;
  ctx.fillRect(-2, 13, 4, 4);
  ctx.fillStyle = p.cyanHot;
  ctx.fillRect(-2, 16, 4, 1);
  ctx.restore();

  // Right arm
  ctx.save();
  ctx.translate(sx + 11, sy - 21 + breathe);
  ctx.rotate(armRaise2);
  ctx.fillStyle = p.bodyDark;
  ctx.fillRect(-2, 0, 4, 13);
  ctx.fillStyle = p.body;
  ctx.fillRect(0, 0, 1, 13);
  ctx.fillStyle = p.void;
  ctx.fillRect(-2, 13, 4, 4);
  ctx.fillStyle = p.cyanHot;
  ctx.fillRect(-2, 16, 4, 1);
  ctx.restore();

  // === HEAD (élite helmet) ===
  ctx.fillStyle = p.bodyDark;
  ctx.fillRect(sx - 8, sy - 36 + breathe, 16, 14);
  ctx.fillStyle = p.body;
  ctx.fillRect(sx - 8, sy - 36 + breathe, 16, 12);
  ctx.fillStyle = p.bodyLight;
  ctx.fillRect(sx - 8, sy - 36 + breathe, 3, 14);

  // Visor (large saturated cyan)
  const eyePulse = 0.92 + Math.sin(t * 0.15) * 0.08;
  ctx.fillStyle = `rgba(61,240,255,${eyePulse})`;
  ctx.fillRect(sx - 7, sy - 32 + breathe, 14, 3);
  ctx.fillStyle = `rgba(136,255,255,${eyePulse})`;
  ctx.fillRect(sx - 7, sy - 32 + breathe, 14, 1);
  // White hot core line
  ctx.fillStyle = `rgba(255,255,255,${eyePulse})`;
  ctx.fillRect(sx - 6, sy - 32 + breathe, 12, 0.5);

  // Helmet seams
  ctx.fillStyle = p.cyanCore;
  ctx.fillRect(sx - 8, sy - 36 + breathe, 16, 0.5);
  ctx.fillRect(sx, sy - 36 + breathe, 0.5, 4);

  // Top antenna (vibrating)
  ctx.fillStyle = p.bodyDark;
  ctx.fillRect(sx - 1, sy - 40 + breathe, 1, 4);
  ctx.fillRect(sx + 1, sy - 40 + breathe, 1, 4);
  ctx.fillStyle = p.cyanCore;
  ctx.fillRect(sx - 1, sy - 41 + breathe, 1, 1);
  ctx.fillRect(sx + 1, sy - 41 + breathe, 1, 1);

  ctx.restore();
}

function drawElectricArcs(ctx, lx, ly, t, intensity, p){
  // 5 arcs jaillissent du corps à intervalles
  const arcCount = 5;
  for(let i = 0; i < arcCount; i++){
    const seed = (Math.floor(t / 4) * 7 + i * 31) % 60;
    if(seed < 18){
      const angle = (i / arcCount) * Math.PI * 2 + t * 0.05;
      const innerR = 8;
      const outerR = 16 + intensity * 4;
      const x1 = lx + Math.cos(angle) * innerR;
      const y1 = ly + Math.sin(angle) * innerR * 0.7;
      const x2 = lx + Math.cos(angle) * outerR;
      const y2 = ly + Math.sin(angle) * outerR * 0.7;
      // Mid-zigzag
      const midX = (x1 + x2) / 2 + (Math.random() - 0.5) * 4;
      const midY = (y1 + y2) / 2 + (Math.random() - 0.5) * 4;
      ctx.strokeStyle = p.arc;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(midX, midY);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      ctx.strokeStyle = p.cyan;
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }
  }
}

export const attacks = {
  idle: {
    id: 'idle', name: 'IDLE', icon: '◇',
    duration: 9999, looping: true,
    description: 'Vibration constante, motion trails permanents, arcs électriques jaillissent du corps. Hyper instable.',
    phases: [{ from: 0, to: 9999, label: 'Loop' }],
    update(frame){
      const fx = [];
      if(frame % 8 === 0){
        const angle = Math.random() * Math.PI * 2;
        fx.push({ type: 'sparks', dx: Math.cos(angle) * 18, dy: -16 + Math.sin(angle) * 12, count: 1, color: '#88ffff' });
      }
      return { opts: { intensity: 1 }, fx };
    },
  },

  doubleAttack: {
    id: 'doubleAttack', name: 'DOUBLE STRIKE', icon: '⚡⚡',
    duration: 80,
    description: 'Frappe 2 fois en chaîne ultra-rapide. 50% Shock chain adjacent. Range 4.',
    phases: [
      { from: 0, to: 18, label: 'Wind-up' },
      { from: 18, to: 28, label: 'Strike 1' },
      { from: 28, to: 40, label: 'Reload' },
      { from: 40, to: 50, label: 'Strike 2' },
      { from: 50, to: 80, label: 'Recovery' },
    ],
    projectile: {
      spawnFrame: 18,
      spawnOffset: { dx: -10, dy: -10 },
      travelFrames: 10,
      drawProjectile(ctx, x, y, vx, vy, t){
        const angle = Math.atan2(vy, vx);
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, 11);
        grad.addColorStop(0, 'rgba(255,255,255,0.95)');
        grad.addColorStop(0.4, 'rgba(136,255,255,0.7)');
        grad.addColorStop(1, 'rgba(61,240,255,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(-11, -11, 22, 22);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(-7, 0); ctx.lineTo(-3, -2); ctx.lineTo(0, 1); ctx.lineTo(4, -1); ctx.lineTo(7, 0);
        ctx.stroke();
        ctx.strokeStyle = '#3df0ff';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fillStyle = '#fff';
        ctx.fillRect(6, -1, 2, 2);
        ctx.restore();
      },
      trailColor: '#88ffff',
      onHit: {
        flash: '#fff', flashSize: 12,
        sparks: 10, color: '#3df0ff',
      },
    },
    update(frame){
      const opts = { intensity: 1 };
      const fx = [];
      if(frame < 18){
        const p = frame / 18;
        opts.armRaise1 = -p * 1.0;
        opts.intensity = 1 + p * 0.5;
      } else if(frame < 28){
        opts.armRaise1 = -1.0 + (frame - 18) / 10 * 0.6;
        opts.intensity = 1.5;
        if(frame === 18){
          fx.push({ type: 'flash', dx: -10, dy: -10, color: '#fff', size: 13 });
          fx.push({ type: 'sparks', dx: -10, dy: -10, count: 8, color: '#88ffff' });
          fx.push({
            type: 'projectile',
            dx: -10, dy: -10,
            useAttackProjectile: 'doubleAttack',
          });
        }
      } else if(frame < 40){
        const p = (frame - 28) / 12;
        opts.armRaise1 = -0.4 + p * 0.4;
        opts.armRaise2 = -p * 1.0;
        opts.intensity = 1.3;
      } else if(frame < 50){
        opts.armRaise2 = -1.0 + (frame - 40) / 10 * 0.6;
        opts.intensity = 1.5;
        if(frame === 40){
          fx.push({ type: 'flash', dx: 10, dy: -10, color: '#fff', size: 13 });
          fx.push({ type: 'sparks', dx: 10, dy: -10, count: 8, color: '#88ffff' });
          fx.push({
            type: 'projectile',
            dx: 10, dy: -10,
            useAttackProjectile: 'doubleAttack',
          });
        }
      } else {
        const p = (frame - 50) / 30;
        opts.armRaise2 = -0.4 + p * 0.4;
        opts.intensity = 1.5 - p * 0.5;
      }
      return { opts, fx };
    },
  },

  haste: {
    id: 'haste', name: 'HASTE', icon: '💨',
    duration: 60, passive: true,
    description: 'Passif : se déplace de 4 cases. Visuel : trails démultipliés, vibration extrême.',
    phases: [
      { from: 0, to: 25, label: 'Activation' },
      { from: 25, to: 60, label: 'Sustain' },
    ],
    update(frame){
      const opts = {};
      const fx = [];
      if(frame < 25){
        const p = frame / 25;
        opts.intensity = 1 + p;
        if(frame === 0){
          fx.push({ type: 'flash', dx: 0, dy: -16, color: '#88ffff', size: 22 });
          fx.push({ type: 'shockwave', dx: 0, dy: 4, color: '#3df0ff', maxRadius: 38 });
        }
      } else {
        opts.intensity = 2 + Math.sin(frame * 0.2) * 0.3;
        if(frame % 3 === 0){
          const angle = Math.random() * Math.PI * 2;
          fx.push({ type: 'sparks', dx: Math.cos(angle) * 18, dy: -16 + Math.sin(angle) * 14, count: 1, color: '#fff' });
        }
      }
      return { opts, fx };
    },
  },

  walk: {
    id: 'walk', name: 'WALK', icon: '🏃',
    duration: 140, // rapide
    looping: true,
    description: 'Marche ultra-rapide avec trails. Aller-retour 70/70.',
    phases: [
      { from: 0, to: 70, label: 'Avancée' },
      { from: 70, to: 140, label: 'Retour' },
    ],
    update(frame){
      const opts = { intensity: 1.2 };
      const fx = [];
      const half = 70;
      let p;
      if(frame < half){
        p = frame / half;
        opts.bodyShift = p * 38;
      } else {
        p = (frame - half) / half;
        opts.bodyShift = (1 - p) * 38;
      }
      if(frame % 6 === 0){
        fx.push({ type: 'sparks', dx: -8, dy: 13, count: 1, color: '#88ffff' });
      }
      return { opts, fx };
    },
  },
};

export const meta = { width: 32, height: 56, groundOffsetY: 0 };
export default { draw, attacks, palette, meta };
