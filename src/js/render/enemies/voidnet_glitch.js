// src/js/render/enemies/voidnet_glitch.js
// Erreur Persistante — mob glitch.
// Silhouette fragmentée, blocs de pixels qui se détachent et réapparaissent,
// split RGB shift (magenta-cyan), masque pixelisé.

export const palette = {
  base:        '#1a0a28',
  baseLight:   '#3a1a4a',
  baseDark:    '#0a0510',
  cyan:        '#3df0ff',
  cyanCore:    '#e0ffff',
  cyanDark:    '#1a8aa0',
  magenta:     '#ff40c0',
  magentaCore: '#ffc0e8',
  magentaDark: '#9a2868',
  white:       '#ffffff',
  void:        '#0a0a18',
  shadow:      'rgba(20,10,30,0.5)',
};

export function draw(ctx, sx, sy, t, opts){
  opts = opts || {};
  const p = palette;
  const float = Math.sin(t * 0.06) * 1.2;
  // Glitch jitter horizontal
  const jitter = ((t * 7) % 13 < 2) ? 2 : 0;
  sx = Math.round(sx + (opts.bodyShift || 0) + jitter);
  sy = Math.round(sy + float);

  const dissolve = opts.dissolve || 0; // 0..1 pour phaseShift
  const armRaise = opts.armRaise || 0;

  // Shadow (faible car instable)
  if(dissolve < 0.7){
    ctx.fillStyle = p.shadow;
    ctx.beginPath();
    ctx.ellipse(sx, sy + 7, 11, 3, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Cyan-magenta glow halo (constant)
  const glow = 0.4 + Math.sin(t * 0.1) * 0.15;
  const bg = ctx.createRadialGradient(sx, sy - 12, 4, sx, sy - 12, 26);
  bg.addColorStop(0, `rgba(61,240,255,${glow * 0.4})`);
  bg.addColorStop(0.5, `rgba(255,64,192,${glow * 0.3})`);
  bg.addColorStop(1, 'rgba(61,240,255,0)');
  ctx.fillStyle = bg;
  ctx.fillRect(sx - 26, sy - 38, 52, 50);

  const visible = 1 - dissolve;
  if(visible <= 0) return;

  // === GLITCH BLOCKS : on dessine 3 fois avec offsets RGB pour split ===
  // Magenta layer (offset right)
  drawGlitchedFigure(ctx, sx + 1, sy, t, p.magenta, p.magentaDark, visible * 0.7, armRaise);
  // Cyan layer (offset left)
  drawGlitchedFigure(ctx, sx - 1, sy, t + 7, p.cyan, p.cyanDark, visible * 0.7, armRaise);
  // White core (centered)
  drawGlitchedFigure(ctx, sx, sy, t + 13, p.baseLight, p.base, visible, armRaise);

  // Detached glitch blocks (random pixels floating away)
  for(let i = 0; i < 6; i++){
    const seed = (t + i * 17) % 60;
    if(seed < 20){
      const angle = (i / 6) * Math.PI * 2 + t * 0.02;
      const r = 14 + (seed / 20) * 6;
      const px = sx + Math.cos(angle) * r;
      const py = sy - 12 + Math.sin(angle) * r * 0.7;
      const blockColor = i % 2 === 0 ? p.cyan : p.magenta;
      ctx.fillStyle = blockColor;
      const sz = 1 + (seed % 3);
      ctx.fillRect(Math.round(px), Math.round(py), sz, sz);
    }
  }

  // Scan lines (horizontal flicker)
  if(t % 8 < 2){
    ctx.fillStyle = `rgba(255,255,255,${0.3 * visible})`;
    ctx.fillRect(sx - 14, sy - 22 + (t % 24), 28, 1);
  }

  // === FACE / MASK (pixelated, no clear features) ===
  if(t % 60 > 5){
    // Eyes (sometimes flicker off)
    const eyeOn = (t % 40 > 5);
    if(eyeOn){
      ctx.fillStyle = p.cyanCore;
      ctx.fillRect(sx - 4, sy - 24, 2, 2);
      ctx.fillRect(sx + 2, sy - 24, 2, 2);
      ctx.fillStyle = p.white;
      ctx.fillRect(sx - 4, sy - 24, 1, 1);
      ctx.fillRect(sx + 2, sy - 24, 1, 1);
    } else {
      // Sometimes show magenta instead
      ctx.fillStyle = p.magentaCore;
      ctx.fillRect(sx - 4, sy - 24, 2, 2);
      ctx.fillRect(sx + 2, sy - 24, 2, 2);
    }
  }
}

function drawGlitchedFigure(ctx, sx, sy, t, mainColor, darkColor, alpha, armRaise){
  ctx.save();
  ctx.globalAlpha = alpha;

  // Legs (blocky)
  ctx.fillStyle = darkColor;
  ctx.fillRect(sx - 6, sy - 1, 4, 9);
  ctx.fillRect(sx + 2, sy - 1, 4, 9);
  ctx.fillStyle = mainColor;
  ctx.fillRect(sx - 6, sy - 1, 1, 9);
  // Glitch missing pixel
  if((t * 5) % 50 < 5){
    ctx.fillStyle = '#000';
    ctx.fillRect(sx - 5, sy + 4, 2, 2);
  }

  // Feet
  ctx.fillStyle = darkColor;
  ctx.fillRect(sx - 7, sy + 8, 6, 3);
  ctx.fillRect(sx + 1, sy + 8, 6, 3);

  // Torso (blocky, fragmented)
  ctx.fillStyle = darkColor;
  ctx.fillRect(sx - 7, sy - 17, 14, 16);
  ctx.fillStyle = mainColor;
  ctx.fillRect(sx - 7, sy - 17, 14, 14);

  // Glitch holes / blocks missing
  if((t * 3) % 30 < 8){
    ctx.fillStyle = '#000';
    ctx.fillRect(sx - 3, sy - 11, 4, 3);
  }
  if((t * 4) % 40 < 5){
    ctx.fillStyle = '#000';
    ctx.fillRect(sx + 3, sy - 7, 3, 2);
  }

  // Highlight
  ctx.fillStyle = mainColor;
  ctx.fillRect(sx - 7, sy - 17, 2, 14);

  // Arms
  ctx.save();
  ctx.translate(sx - 7, sy - 16);
  ctx.rotate(armRaise);
  ctx.fillStyle = darkColor;
  ctx.fillRect(-2, 0, 4, 12);
  ctx.fillStyle = mainColor;
  ctx.fillRect(-2, 0, 1, 12);
  ctx.restore();

  ctx.fillStyle = darkColor;
  ctx.fillRect(sx + 6, sy - 16, 4, 12);
  ctx.fillStyle = mainColor;
  ctx.fillRect(sx + 9, sy - 16, 1, 12);

  // Head
  ctx.fillStyle = darkColor;
  ctx.fillRect(sx - 6, sy - 27, 12, 10);
  ctx.fillStyle = mainColor;
  ctx.fillRect(sx - 6, sy - 27, 12, 8);
  ctx.fillStyle = mainColor;
  ctx.fillRect(sx - 6, sy - 27, 2, 8);

  // Glitch on head
  if((t * 6) % 35 < 6){
    ctx.fillStyle = '#000';
    ctx.fillRect(sx - 4, sy - 22, 4, 2);
  }

  ctx.restore();
}

export const attacks = {
  idle: {
    id: 'idle', name: 'IDLE', icon: '◇',
    duration: 9999, looping: true,
    description: 'Glitche en permanence (RGB split, blocs détachés, scan lines), oscillation cyan-magenta.',
    phases: [{ from: 0, to: 9999, label: 'Loop' }],
    update(frame){
      const fx = [];
      if(frame % 14 === 0){
        const angle = Math.random() * Math.PI * 2;
        fx.push({ type: 'sparks', dx: Math.cos(angle) * 14, dy: -10 + Math.sin(angle) * 10, count: 1, color: '#3df0ff' });
      }
      return { opts: {}, fx };
    },
  },

  shockBolt: {
    id: 'shockBolt', name: 'SHOCK BOLT', icon: '⚡',
    duration: 60,
    description: 'Lance un éclair électrique. Range 3. 40% Shock.',
    phases: [
      { from: 0, to: 22, label: 'Charge' },
      { from: 22, to: 30, label: 'Cast' },
      { from: 30, to: 60, label: 'Recovery' },
    ],
    projectile: {
      spawnFrame: 22,
      spawnOffset: { dx: -10, dy: -10 },
      travelFrames: 12,
      drawProjectile(ctx, x, y, vx, vy, t){
        const angle = Math.atan2(vy, vx);
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        // Halo
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, 10);
        grad.addColorStop(0, 'rgba(224,255,255,0.95)');
        grad.addColorStop(0.4, 'rgba(61,240,255,0.7)');
        grad.addColorStop(1, 'rgba(61,240,255,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(-10, -10, 20, 20);
        // Zigzag bolt body
        ctx.strokeStyle = '#e0ffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-6, 0);
        ctx.lineTo(-2, -2);
        ctx.lineTo(0, 1);
        ctx.lineTo(3, -1);
        ctx.lineTo(6, 0);
        ctx.stroke();
        ctx.strokeStyle = '#3df0ff';
        ctx.lineWidth = 1;
        ctx.stroke();
        // Spark tip
        ctx.fillStyle = '#fff';
        ctx.fillRect(5, -1, 2, 2);
        ctx.restore();
      },
      trailColor: '#3df0ff',
      onHit: {
        flash: '#e0ffff', flashSize: 12,
        sparks: 10, color: '#3df0ff',
      },
    },
    update(frame){
      const opts = {};
      const fx = [];
      if(frame < 22){
        const p = frame / 22;
        opts.armRaise = -0.4 - p * 0.6;
        if(frame % 3 === 0){
          fx.push({ type: 'sparks', dx: -8, dy: -10, count: 1, color: '#3df0ff' });
        }
      } else if(frame < 30){
        opts.armRaise = -1.0;
        if(frame === 22){
          fx.push({ type: 'flash', dx: -10, dy: -10, color: '#e0ffff', size: 11 });
          fx.push({ type: 'sparks', dx: -10, dy: -10, count: 8, color: '#3df0ff' });
          fx.push({
            type: 'projectile',
            dx: -10, dy: -10,
            useAttackProjectile: 'shockBolt',
          });
        }
      } else {
        const p = (frame - 30) / 30;
        opts.armRaise = -1.0 + p * 0.6;
      }
      return { opts, fx };
    },
  },

  phaseShift: {
    id: 'phaseShift', name: 'PHASE SHIFT', icon: '✦',
    duration: 50,
    description: 'Se téléporte aléatoirement (30% dodge inhérent). Anim : dissolution en blocs de pixels, recomposition ailleurs.',
    phases: [
      { from: 0, to: 20, label: 'Dissolve' },
      { from: 20, to: 30, label: 'Void' },
      { from: 30, to: 50, label: 'Reform' },
    ],
    update(frame){
      const opts = {};
      const fx = [];
      if(frame < 20){
        const p = frame / 20;
        opts.dissolve = p;
        if(frame % 2 === 0){
          fx.push({ type: 'sparks', dx: (Math.random() - 0.5) * 22, dy: -12 + (Math.random() - 0.5) * 22, count: 1, color: frame % 4 === 0 ? '#3df0ff' : '#ff40c0' });
        }
      } else if(frame < 30){
        opts.dissolve = 1;
        opts.bodyShift = 999;
      } else {
        const p = (frame - 30) / 20;
        opts.dissolve = 1 - p;
        opts.bodyShift = 0;
        if(frame === 30){
          fx.push({ type: 'flash', dx: 0, dy: -12, color: '#e0ffff', size: 18 });
          fx.push({ type: 'sparks', dx: 0, dy: -12, count: 14, color: '#3df0ff' });
        }
      }
      return { opts, fx };
    },
  },

  walk: {
    id: 'walk', name: 'WALK', icon: '🏃',
    duration: 160,
    looping: true,
    description: 'Glitch-marche, déplacements saccadés. Aller-retour 80/80.',
    phases: [
      { from: 0, to: 80, label: 'Avancée' },
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
      // Saccaded movement (steps of 4 pixels)
      opts.bodyShift = Math.round(opts.bodyShift / 2) * 2;
      if(frame % 12 === 0){
        fx.push({ type: 'sparks', dx: 0, dy: 11, count: 1, color: '#ff40c0' });
      }
      return { opts, fx };
    },
  },
};

export const meta = { width: 22, height: 38, groundOffsetY: 0 };
export default { draw, attacks, palette, meta };
