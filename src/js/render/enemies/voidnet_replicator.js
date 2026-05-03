// src/js/render/enemies/voidnet_replicator.js
// Réplicateur — mob qui se duplique à 50% HP.
// Silhouette double : un fantôme/écho identique mais translucide juste à côté
// (suggère la réplication imminente). Hexagones de duplication autour.

export const palette = {
  body:        '#1a3848',
  bodyDark:    '#0a1828',
  bodyLight:   '#3a6878',
  cyan:        '#3df0ff',
  cyanCore:    '#e0ffff',
  cyanDark:    '#1a8aa0',
  echo:        'rgba(61,240,255,0.4)',
  hex:         '#3df0ff',
  hexCore:     '#e0ffff',
  void:        '#0a0a18',
  shadow:      'rgba(10,20,40,0.7)',
};

export function draw(ctx, sx, sy, t, opts){
  opts = opts || {};
  const p = palette;
  const bob = Math.sin(t * 0.05) * 0.5;
  sx = Math.round(sx + (opts.bodyShift || 0));
  sy = Math.round(sy + bob);

  const armRaise = opts.armRaise || 0;
  const echoOffset = opts.echoOffset !== undefined ? opts.echoOffset : 4; // distance du fantôme
  const echoAlpha = opts.echoAlpha !== undefined ? opts.echoAlpha : 0.4;
  const replicating = opts.replicating || 0; // 0..1, anim de réplication

  // Shadow (deux ombres pour le double)
  ctx.fillStyle = p.shadow;
  ctx.beginPath();
  ctx.ellipse(sx, sy + 7, 11, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  // Echo shadow
  if(echoAlpha > 0){
    ctx.fillStyle = `rgba(10,20,40,${echoAlpha * 0.7})`;
    ctx.beginPath();
    ctx.ellipse(sx + echoOffset, sy + 7, 9, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Cyan glow
  const glow = 0.4 + replicating * 0.5 + Math.sin(t * 0.07) * 0.1;
  const bg = ctx.createRadialGradient(sx + echoOffset / 2, sy - 12, 4, sx + echoOffset / 2, sy - 12, 30);
  bg.addColorStop(0, `rgba(61,240,255,${glow * 0.5})`);
  bg.addColorStop(1, 'rgba(61,240,255,0)');
  ctx.fillStyle = bg;
  ctx.fillRect(sx - 30, sy - 38, 60 + echoOffset, 50);

  // Orbiting hexagons (suggesting duplication)
  drawDuplicationHexes(ctx, sx + echoOffset / 2, sy - 12, t, 1 + replicating, p);

  // === ECHO/GHOST FIGURE (drawn first, behind) ===
  if(echoAlpha > 0){
    drawFigure(ctx, sx + echoOffset, sy, t + 5, p, echoAlpha, armRaise);
  }

  // === MAIN FIGURE (drawn over the echo) ===
  drawFigure(ctx, sx, sy, t, p, 1, armRaise);

  // Connection beam between the two (subtle)
  if(echoAlpha > 0 && echoOffset > 1){
    ctx.strokeStyle = `rgba(61,240,255,${echoAlpha * 0.5})`;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(sx + 4, sy - 14);
    ctx.lineTo(sx + echoOffset - 4, sy - 14);
    ctx.moveTo(sx + 4, sy - 6);
    ctx.lineTo(sx + echoOffset - 4, sy - 6);
    ctx.stroke();
  }
}

function drawFigure(ctx, sx, sy, t, p, alpha, armRaise){
  ctx.save();
  ctx.globalAlpha = alpha;

  // Legs
  ctx.fillStyle = p.bodyDark;
  ctx.fillRect(sx - 6, sy - 1, 4, 9);
  ctx.fillRect(sx + 2, sy - 1, 4, 9);
  ctx.fillStyle = p.body;
  ctx.fillRect(sx - 6, sy - 1, 1, 9);
  // Boot
  ctx.fillStyle = p.void;
  ctx.fillRect(sx - 7, sy + 8, 6, 3);
  ctx.fillRect(sx + 1, sy + 8, 6, 3);
  // Cyan accent
  ctx.fillStyle = p.cyan;
  ctx.fillRect(sx - 7, sy + 10, 6, 1);
  ctx.fillRect(sx + 1, sy + 10, 6, 1);

  // Torso
  ctx.fillStyle = p.bodyDark;
  ctx.fillRect(sx - 7, sy - 17, 14, 16);
  ctx.fillStyle = p.body;
  ctx.fillRect(sx - 7, sy - 17, 14, 14);
  ctx.fillStyle = p.bodyLight;
  ctx.fillRect(sx - 7, sy - 17, 2, 14);

  // Cyan circuit lines on chest
  ctx.strokeStyle = p.cyan;
  ctx.lineWidth = 0.6;
  ctx.beginPath();
  ctx.moveTo(sx - 5, sy - 14); ctx.lineTo(sx - 2, sy - 14); ctx.lineTo(sx - 2, sy - 10);
  ctx.moveTo(sx + 4, sy - 13); ctx.lineTo(sx + 4, sy - 8);
  ctx.stroke();
  // Tiny LEDs at the line ends
  ctx.fillStyle = p.cyanCore;
  ctx.fillRect(sx - 2, sy - 10, 1, 1);
  ctx.fillRect(sx + 4, sy - 8, 1, 1);

  // Arms
  ctx.save();
  ctx.translate(sx - 7, sy - 16);
  ctx.rotate(armRaise);
  ctx.fillStyle = p.bodyDark;
  ctx.fillRect(-2, 0, 4, 12);
  ctx.fillStyle = p.body;
  ctx.fillRect(-2, 0, 1, 12);
  ctx.fillStyle = p.void;
  ctx.fillRect(-2, 12, 4, 3);
  ctx.fillStyle = p.cyan;
  ctx.fillRect(-2, 14, 4, 0.5);
  ctx.restore();

  ctx.fillStyle = p.bodyDark;
  ctx.fillRect(sx + 6, sy - 16, 4, 12);
  ctx.fillStyle = p.body;
  ctx.fillRect(sx + 9, sy - 16, 1, 12);
  ctx.fillStyle = p.void;
  ctx.fillRect(sx + 6, sy - 4, 4, 3);

  // Head
  ctx.fillStyle = p.bodyDark;
  ctx.fillRect(sx - 6, sy - 27, 12, 11);
  ctx.fillStyle = p.body;
  ctx.fillRect(sx - 6, sy - 27, 12, 9);
  ctx.fillStyle = p.bodyLight;
  ctx.fillRect(sx - 6, sy - 27, 2, 11);

  // Visor
  const eyePulse = 0.92 + Math.sin(t * 0.09) * 0.08;
  ctx.fillStyle = `rgba(61,240,255,${eyePulse})`;
  ctx.fillRect(sx - 5, sy - 23, 10, 2);
  ctx.fillStyle = `rgba(255,255,255,${eyePulse})`;
  ctx.fillRect(sx - 5, sy - 23, 10, 1);
  // Pupil dots
  ctx.fillStyle = p.void;
  ctx.fillRect(sx - 3, sy - 22, 1, 1);
  ctx.fillRect(sx + 2, sy - 22, 1, 1);

  // Helmet seam
  ctx.fillStyle = p.cyan;
  ctx.fillRect(sx - 6, sy - 27, 12, 0.5);

  ctx.restore();
}

function drawDuplicationHexes(ctx, lx, ly, t, scale, p){
  // 3 hexagons in a triangular orbit
  for(let i = 0; i < 3; i++){
    const angle = (i / 3) * Math.PI * 2 + t * 0.03;
    const r = 14 * scale;
    const hx = lx + Math.cos(angle) * r;
    const hy = ly + Math.sin(angle) * r * 0.55;
    drawHex(ctx, hx, hy, t + i * 30, 2.5 * scale, p);
  }
}

function drawHex(ctx, lx, ly, t, r, p){
  const pulse = 0.85 + Math.sin(t * 0.1) * 0.15;
  ctx.fillStyle = `rgba(61,240,255,${pulse * 0.4})`;
  ctx.fillRect(lx - r - 1, ly - r - 1, r * 2 + 2, r * 2 + 2);
  ctx.strokeStyle = p.cyan;
  ctx.lineWidth = 0.7;
  ctx.beginPath();
  for(let i = 0; i < 6; i++){
    const angle = (i / 6) * Math.PI * 2;
    const x = lx + Math.cos(angle) * r;
    const y = ly + Math.sin(angle) * r;
    if(i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.stroke();
  ctx.fillStyle = p.cyanCore;
  ctx.fillRect(Math.round(lx - 0.5), Math.round(ly - 0.5), 1, 1);
}

export const attacks = {
  idle: {
    id: 'idle', name: 'IDLE', icon: '◇',
    duration: 9999, looping: true,
    description: 'Échos fantôme oscille à côté du corps principal, hexagones orbitent. Sensation d\'instabilité quantique.',
    phases: [{ from: 0, to: 9999, label: 'Loop' }],
    update(frame){
      const opts = {};
      const fx = [];
      // Echo offset oscillates
      opts.echoOffset = 4 + Math.sin(frame * 0.04) * 1.5;
      opts.echoAlpha = 0.4 + Math.sin(frame * 0.06) * 0.1;
      if(frame % 22 === 0){
        fx.push({ type: 'ash', dx: 4, dy: -22, count: 1, color: '#3df0ff' });
      }
      return { opts, fx };
    },
  },

  shockBolt: {
    id: 'shockBolt', name: 'SHOCK BOLT', icon: '⚡',
    duration: 60,
    description: 'Attaque shock simple. Range 2.',
    phases: [
      { from: 0, to: 22, label: 'Charge' },
      { from: 22, to: 30, label: 'Cast' },
      { from: 30, to: 60, label: 'Recovery' },
    ],
    projectile: {
      spawnFrame: 22,
      spawnOffset: { dx: -8, dy: -8 },
      travelFrames: 10,
      drawProjectile(ctx, x, y, vx, vy, t){
        const angle = Math.atan2(vy, vx);
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, 9);
        grad.addColorStop(0, 'rgba(224,255,255,0.95)');
        grad.addColorStop(0.4, 'rgba(61,240,255,0.7)');
        grad.addColorStop(1, 'rgba(61,240,255,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(-9, -9, 18, 18);
        ctx.strokeStyle = '#e0ffff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-5, 0); ctx.lineTo(-1, -1); ctx.lineTo(1, 1); ctx.lineTo(5, 0);
        ctx.stroke();
        ctx.restore();
      },
      trailColor: '#3df0ff',
      onHit: {
        flash: '#e0ffff', flashSize: 10,
        sparks: 8, color: '#3df0ff',
      },
    },
    update(frame){
      const opts = { echoOffset: 4, echoAlpha: 0.4 };
      const fx = [];
      if(frame < 22){
        const p = frame / 22;
        opts.armRaise = -0.4 - p * 0.5;
      } else if(frame < 30){
        opts.armRaise = -0.9;
        if(frame === 22){
          fx.push({ type: 'flash', dx: -8, dy: -8, color: '#e0ffff', size: 10 });
          fx.push({ type: 'sparks', dx: -8, dy: -8, count: 6, color: '#3df0ff' });
          fx.push({
            type: 'projectile',
            dx: -8, dy: -8,
            useAttackProjectile: 'shockBolt',
          });
        }
      } else {
        const p = (frame - 30) / 30;
        opts.armRaise = -0.9 + p * 0.5;
      }
      return { opts, fx };
    },
  },

  replicate: {
    id: 'replicate', name: 'REPLICATE', icon: '✦',
    duration: 100, passive: true,
    description: 'À 50% HP : se duplique en 2 copies. Anim : l\'écho fantôme se densifie, hexagones convergent, flash, séparation finale.',
    phases: [
      { from: 0, to: 30, label: 'Sync' },
      { from: 30, to: 60, label: 'Densify' },
      { from: 60, to: 80, label: 'Burst' },
      { from: 80, to: 100, label: 'Settle' },
    ],
    update(frame){
      const opts = {};
      const fx = [];
      if(frame < 30){
        const p = frame / 30;
        opts.echoOffset = 4 - p * 4;
        opts.echoAlpha = 0.4 + p * 0.3;
        opts.replicating = p * 0.4;
        if(frame % 4 === 0){
          fx.push({ type: 'sparks', dx: 2, dy: -12, count: 1, color: '#3df0ff' });
        }
      } else if(frame < 60){
        const p = (frame - 30) / 30;
        opts.echoOffset = 0;
        opts.echoAlpha = 0.7 + p * 0.3;
        opts.replicating = 0.4 + p * 0.6;
        if(frame % 3 === 0){
          fx.push({ type: 'sparks', dx: 0, dy: -12, count: 2, color: '#e0ffff' });
        }
      } else if(frame < 80){
        const p = (frame - 60) / 20;
        opts.echoOffset = p * 14;
        opts.echoAlpha = 1;
        opts.replicating = 1;
        if(frame === 60){
          fx.push({ type: 'flash', dx: 0, dy: -12, color: '#fff', size: 28 });
          fx.push({ type: 'shockwave', dx: 0, dy: -8, color: '#3df0ff', maxRadius: 36 });
          fx.push({ type: 'sparks', dx: 0, dy: -12, count: 18, color: '#3df0ff' });
        }
        if(frame === 70){
          fx.push({ type: 'shockwave', dx: 7, dy: -8, color: '#88ffff', maxRadius: 22 });
        }
      } else {
        const p = (frame - 80) / 20;
        opts.echoOffset = 14;
        opts.echoAlpha = 1;
        opts.replicating = 1 - p;
      }
      return { opts, fx };
    },
  },

  walk: {
    id: 'walk', name: 'WALK', icon: '🏃',
    duration: 160,
    looping: true,
    description: 'Marche, écho suit avec léger délai. Aller-retour 80/80.',
    phases: [
      { from: 0, to: 80, label: 'Avancée' },
      { from: 80, to: 160, label: 'Retour' },
    ],
    update(frame){
      const opts = { echoOffset: 4, echoAlpha: 0.4 };
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
        fx.push({ type: 'ash', dx: 0, dy: 11, count: 1, color: '#3df0ff' });
      }
      return { opts, fx };
    },
  },
};

export const meta = { width: 28, height: 38, groundOffsetY: 0 };
export default { draw, attacks, palette, meta };
