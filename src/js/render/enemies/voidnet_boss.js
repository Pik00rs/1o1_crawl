// src/js/render/enemies/voidnet_boss.js
// Architecte du Vide — BOSS final Voidnet.
// Silhouette massive 1.5x en partie immatérielle, robe de code qui se dissout en pixels,
// couronne de hexagones orbitant, CŒUR DE VOID sur le poitrail (orbe noir avec étoiles
// violettes-cyan tournant — 4e élément du quatuor de bosses : feu rouge / glace bleue /
// poison violet / VIDE COSMIQUE).

export const palette = {
  robe:         '#1a1838',
  robeDark:     '#0a0518',
  robeLight:    '#3a3868',
  body:         '#28284a',
  bodyDark:     '#0a0a1a',
  bodyLight:    '#5a5878',
  cyan:         '#3df0ff',
  cyanCore:     '#e0ffff',
  cyanDark:     '#1a8aa0',
  magenta:      '#c040ff',
  magentaCore:  '#ffc0e8',
  magentaDark:  '#5a2870',
  void:         '#000005',
  voidStar:     '#ffe0ff',
  // Cœur
  heartRing:    '#3a1a4a',
  heartCore:    '#000000',
  heartCyan:    '#3df0ff',
  heartMagenta: '#ff40c0',
  heartStar:    '#ffffff',
  shadow:       'rgba(10,5,30,0.85)',
};

export function draw(ctx, sx, sy, t, opts){
  opts = opts || {};
  const p = palette;
  // Lévite, instabilité constante
  const float = Math.sin(t * 0.03) * 1.5 - 8;
  const sway = Math.sin(t * 0.025 + 1.5) * 1.0;
  // Glitch jitter occasionnel
  const jitter = ((t * 5) % 23 < 2) ? 2 : 0;
  sx = Math.round(sx + (opts.bodyShift || 0) + sway + jitter);
  sy = Math.round(sy + float);

  const armSpread = opts.armSpread !== undefined ? opts.armSpread : 0.5;
  const heartFlare = opts.heartFlare || 0;
  const phase2 = opts.phase2 || 0;
  const dissolve = opts.dissolve || 0; // pour phaseShift
  const robeFlow = opts.robeFlow !== undefined ? opts.robeFlow : 1;

  // Shadow (distant)
  if(dissolve < 0.7){
    ctx.fillStyle = p.shadow;
    ctx.beginPath();
    ctx.ellipse(sx, sy + 18, 22, 5, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // === OUTER COSMIC GLOW (large, multi-color) ===
  const outerGlow = 0.7 + heartFlare * 0.4 + Math.sin(t * 0.05) * 0.15;
  const og = ctx.createRadialGradient(sx, sy - 18, 8, sx, sy - 18, 70);
  og.addColorStop(0, `rgba(192,64,255,${outerGlow * 0.4})`);
  og.addColorStop(0.3, `rgba(61,240,255,${outerGlow * 0.3})`);
  og.addColorStop(0.7, `rgba(255,64,192,${outerGlow * 0.25})`);
  og.addColorStop(1, 'rgba(0,0,5,0)');
  ctx.fillStyle = og;
  ctx.fillRect(sx - 70, sy - 90, 140, 130);

  // Inner saturated core glow
  const coreGlow = 0.85 + heartFlare * 0.3;
  const cg = ctx.createRadialGradient(sx, sy - 18, 1, sx, sy - 18, 32);
  cg.addColorStop(0, `rgba(255,255,255,${coreGlow * 0.5})`);
  cg.addColorStop(0.5, `rgba(192,64,255,${coreGlow * 0.4})`);
  cg.addColorStop(1, 'rgba(192,64,255,0)');
  ctx.fillStyle = cg;
  ctx.fillRect(sx - 32, sy - 50, 64, 64);

  // === ORBITING HEX CROWN ===
  drawHexCrown(ctx, sx, sy - 42, t, phase2, p);

  if(dissolve >= 1) return; // fully phased out

  ctx.save();
  ctx.globalAlpha = 1 - dissolve;

  // === ROBE BOTTOM (s'évase, se dissout en pixels) ===
  const flowOffset = Math.sin(t * 0.04) * 2 * robeFlow;
  ctx.fillStyle = p.robeDark;
  ctx.beginPath();
  ctx.moveTo(sx - 18 - flowOffset, sy + 18);
  ctx.lineTo(sx + 18 + flowOffset, sy + 18);
  ctx.lineTo(sx + 14, sy - 4);
  ctx.lineTo(sx - 14, sy - 4);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = p.robe;
  ctx.beginPath();
  ctx.moveTo(sx - 16 - flowOffset, sy + 17);
  ctx.lineTo(sx + 16 + flowOffset, sy + 17);
  ctx.lineTo(sx + 12, sy - 4);
  ctx.lineTo(sx - 12, sy - 4);
  ctx.closePath();
  ctx.fill();

  // Pixel dissolve at the bottom hem (constant — robe falls apart into pixels)
  for(let i = 0; i < 14; i++){
    const seed = ((t + i * 17) % 80);
    if(seed < 50){
      const dx = (i - 7) * 3 + flowOffset * 0.5;
      const dy = 18 + (seed / 50) * 8;
      const c = (i % 3 === 0) ? p.cyan : (i % 3 === 1 ? p.magenta : p.bodyLight);
      ctx.fillStyle = c;
      ctx.fillRect(Math.round(sx + dx), Math.round(sy + dy), 1, 1);
    }
  }

  // Robe cyan trim
  ctx.fillStyle = p.cyan;
  ctx.fillRect(sx - 16, sy + 16, 32, 1);
  ctx.fillStyle = p.cyanCore;
  ctx.fillRect(sx - 14, sy + 16, 28, 0.5);

  // === TORSO ===
  ctx.fillStyle = p.bodyDark;
  ctx.fillRect(sx - 13, sy - 28, 26, 25);
  ctx.fillStyle = p.body;
  ctx.fillRect(sx - 13, sy - 28, 26, 22);
  ctx.fillStyle = p.bodyLight;
  ctx.fillRect(sx - 13, sy - 28, 4, 25);

  // Decorative chest panels
  ctx.fillStyle = p.bodyDark;
  ctx.fillRect(sx - 11, sy - 26, 7, 18);
  ctx.fillRect(sx + 4, sy - 26, 7, 18);

  // Cyan circuit lines on robe/body
  ctx.strokeStyle = p.cyan;
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(sx - 9, sy - 23); ctx.lineTo(sx - 6, sy - 18); ctx.lineTo(sx - 9, sy - 12);
  ctx.moveTo(sx + 9, sy - 23); ctx.lineTo(sx + 6, sy - 18); ctx.lineTo(sx + 9, sy - 12);
  ctx.stroke();
  // LED dots
  ctx.fillStyle = p.cyanCore;
  ctx.fillRect(sx - 6, sy - 18, 1, 1);
  ctx.fillRect(sx + 6, sy - 18, 1, 1);

  // === VOID HEART on chest (THE focal point — cosmic black with stars) ===
  drawVoidHeart(ctx, sx, sy - 18, t, heartFlare, p);

  // === ARMS (deformed, partly immaterial) ===
  // Left arm
  ctx.save();
  ctx.translate(sx - 13, sy - 27);
  ctx.rotate(-armSpread);
  ctx.fillStyle = p.robeDark;
  ctx.beginPath();
  ctx.moveTo(-3, 0);
  ctx.lineTo(2, 0);
  ctx.lineTo(4, 18);
  ctx.lineTo(-5, 18);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = p.robe;
  ctx.fillRect(-2, 0, 2, 16);
  // Hand (partly dissolving)
  ctx.fillStyle = p.bodyLight;
  ctx.fillRect(-2, 18, 4, 4);
  // Cosmic glow at fingertip
  drawHandVoid(ctx, 0, 22, t, 1, p);
  // Pixel dissolve at edge
  for(let i = 0; i < 4; i++){
    if(((t + i * 11) % 30) < 15){
      ctx.fillStyle = i % 2 === 0 ? p.magenta : p.cyan;
      ctx.fillRect(-4 - i, 4 + i * 3, 1, 1);
    }
  }
  ctx.restore();

  // Right arm
  ctx.save();
  ctx.translate(sx + 13, sy - 27);
  ctx.rotate(armSpread);
  ctx.fillStyle = p.robeDark;
  ctx.beginPath();
  ctx.moveTo(-2, 0);
  ctx.lineTo(3, 0);
  ctx.lineTo(5, 18);
  ctx.lineTo(-4, 18);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = p.robe;
  ctx.fillRect(0, 0, 2, 16);
  ctx.fillStyle = p.bodyLight;
  ctx.fillRect(-1, 18, 4, 4);
  drawHandVoid(ctx, 1, 22, t + 60, 1, p);
  for(let i = 0; i < 4; i++){
    if(((t + i * 13) % 30) < 15){
      ctx.fillStyle = i % 2 === 0 ? p.cyan : p.magenta;
      ctx.fillRect(4 + i, 4 + i * 3, 1, 1);
    }
  }
  ctx.restore();

  // === HEAD : voiled by interference / partly visible ===
  ctx.fillStyle = p.bodyDark;
  ctx.fillRect(sx - 8, sy - 42, 16, 14);
  ctx.fillStyle = p.body;
  ctx.fillRect(sx - 8, sy - 42, 16, 12);
  ctx.fillStyle = p.bodyLight;
  ctx.fillRect(sx - 8, sy - 42, 3, 14);

  // Visor (large, magenta-cyan dual band)
  const visorPulse = 0.92 + Math.sin(t * 0.08) * 0.08;
  // Cyan band
  ctx.fillStyle = `rgba(61,240,255,${visorPulse})`;
  ctx.fillRect(sx - 7, sy - 38, 14, 2);
  ctx.fillStyle = `rgba(255,255,255,${visorPulse})`;
  ctx.fillRect(sx - 7, sy - 38, 14, 0.5);
  // Magenta band below
  ctx.fillStyle = `rgba(192,64,255,${visorPulse * 0.85})`;
  ctx.fillRect(sx - 7, sy - 35, 14, 1);

  // Interference lines on the face (glitch artifacts)
  if((t * 3) % 35 < 8){
    ctx.fillStyle = p.magentaCore;
    ctx.fillRect(sx - 6, sy - 36 + ((t * 2) % 6), 12, 0.5);
  }

  // Top vertex
  ctx.fillStyle = p.bodyLight;
  ctx.fillRect(sx - 1, sy - 44, 2, 3);
  ctx.fillStyle = p.cyanCore;
  ctx.fillRect(sx - 0.5, sy - 45, 1, 1);

  ctx.restore();
}

function drawHexCrown(ctx, lx, ly, t, phase2, p){
  // 6 hexagons orbiting in a crown above the head
  for(let i = 0; i < 6; i++){
    const angle = (i / 6) * Math.PI * 2 + t * 0.02;
    const r = 16;
    const yScale = 0.4;
    const hx = lx + Math.cos(angle) * r;
    const hy = ly + Math.sin(angle) * r * yScale;
    const inFront = Math.sin(angle) > 0;
    const alpha = inFront ? 1 : 0.45;
    drawSmallHex(ctx, hx, hy, t + i * 30, 3, alpha, p);
  }
  // Phase 2: outer ring of additional hexes
  if(phase2 > 0){
    for(let i = 0; i < 8; i++){
      const angle = (i / 8) * Math.PI * 2 - t * 0.025;
      const r = 24;
      const yScale = 0.4;
      const hx = lx + Math.cos(angle) * r;
      const hy = ly + Math.sin(angle) * r * yScale;
      const inFront = Math.sin(angle) > 0;
      const alpha = (inFront ? 0.9 : 0.4) * phase2;
      drawSmallHex(ctx, hx, hy, t + i * 20, 2.5, alpha, p);
    }
  }
}

function drawSmallHex(ctx, lx, ly, t, r, alpha, p){
  const pulse = 0.85 + Math.sin(t * 0.1) * 0.15;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = `rgba(192,64,255,${pulse * 0.4})`;
  ctx.fillRect(lx - r - 1, ly - r - 1, r * 2 + 2, r * 2 + 2);
  ctx.strokeStyle = '#3df0ff';
  ctx.lineWidth = 1;
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
  ctx.fillStyle = `rgba(255,255,255,${pulse})`;
  ctx.fillRect(Math.round(lx - 0.5), Math.round(ly - 0.5), 1, 1);
  ctx.restore();
}

function drawVoidHeart(ctx, lx, ly, t, flare, p){
  // Outer ring (deep violet)
  ctx.fillStyle = p.heartRing;
  ctx.beginPath();
  ctx.arc(lx, ly, 8, 0, Math.PI * 2);
  ctx.fill();
  // Inner ring (dark cyan)
  ctx.fillStyle = p.cyanDark;
  ctx.beginPath();
  ctx.arc(lx, ly, 7, 0, Math.PI * 2);
  ctx.fill();
  // VOID core (pure black)
  ctx.fillStyle = p.heartCore;
  ctx.beginPath();
  ctx.arc(lx, ly, 6, 0, Math.PI * 2);
  ctx.fill();

  // Stars rotating inside the void (cosmic micro-galaxy)
  for(let i = 0; i < 8; i++){
    const angle = (i / 8) * Math.PI * 2 + t * 0.04;
    const r = 2 + (i % 3) * 1.2;
    const x = lx + Math.cos(angle) * r;
    const y = ly + Math.sin(angle) * r;
    const colorChoice = i % 3;
    let starColor;
    if(colorChoice === 0) starColor = p.heartCyan;
    else if(colorChoice === 1) starColor = p.heartMagenta;
    else starColor = p.heartStar;
    const starPulse = 0.85 + Math.sin(t * 0.15 + i) * 0.15;
    ctx.fillStyle = `rgba(${hexToRgb(starColor)},${starPulse})`;
    ctx.fillRect(Math.round(x - 0.5), Math.round(y - 0.5), 1, 1);
  }

  // Cross beams from the heart (cosmic rays)
  const beamPulse = 0.7 + Math.sin(t * 0.1) * 0.2 + flare * 0.3;
  ctx.strokeStyle = `rgba(192,64,255,${beamPulse * 0.7})`;
  ctx.lineWidth = 0.7;
  ctx.beginPath();
  ctx.moveTo(lx - 12, ly); ctx.lineTo(lx + 12, ly);
  ctx.moveTo(lx, ly - 12); ctx.lineTo(lx, ly + 12);
  ctx.moveTo(lx - 9, ly - 9); ctx.lineTo(lx + 9, ly + 9);
  ctx.moveTo(lx + 9, ly - 9); ctx.lineTo(lx - 9, ly + 9);
  ctx.stroke();
  // Cyan secondary beams
  ctx.strokeStyle = `rgba(61,240,255,${beamPulse * 0.5})`;
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(lx - 10, ly - 4); ctx.lineTo(lx + 10, ly + 4);
  ctx.moveTo(lx + 10, ly - 4); ctx.lineTo(lx - 10, ly + 4);
  ctx.stroke();

  // Central singularity bright spot
  const corePulse = 0.85 + Math.sin(t * 0.2) * 0.15 + flare * 0.4;
  ctx.fillStyle = `rgba(255,255,255,${corePulse})`;
  ctx.fillRect(Math.round(lx - 0.5), Math.round(ly - 0.5), 1, 1);
}

function hexToRgb(hex){
  hex = hex.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `${r},${g},${b}`;
}

function drawHandVoid(ctx, lx, ly, t, scale, p){
  // Halo
  const grad = ctx.createRadialGradient(lx, ly, 0, lx, ly, 8 * scale);
  grad.addColorStop(0, `rgba(255,255,255,${0.85 * scale})`);
  grad.addColorStop(0.4, `rgba(192,64,255,${0.6 * scale})`);
  grad.addColorStop(0.7, `rgba(61,240,255,${0.4 * scale})`);
  grad.addColorStop(1, 'rgba(0,0,5,0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(lx, ly, 8 * scale, 0, Math.PI * 2);
  ctx.fill();
  // Tiny stars
  for(let i = 0; i < 3; i++){
    const angle = (i / 3) * Math.PI * 2 + t * 0.08;
    const x = lx + Math.cos(angle) * 3;
    const y = ly + Math.sin(angle) * 3;
    ctx.fillStyle = i % 2 === 0 ? p.cyanCore : p.magentaCore;
    ctx.fillRect(Math.round(x - 0.5), Math.round(y - 0.5), 1, 1);
  }
  ctx.fillStyle = '#fff';
  ctx.fillRect(Math.round(lx - 0.5), Math.round(ly - 0.5), 1, 1);
}

export const attacks = {
  idle: {
    id: 'idle', name: 'IDLE', icon: '◇',
    duration: 9999, looping: true,
    description: 'Lévite, robe se dissout en pixels constants, hexagones orbitent, cœur du vide pulse, interférences visuelles.',
    phases: [{ from: 0, to: 9999, label: 'Loop' }],
    update(frame){
      const fx = [];
      if(frame % 12 === 0){
        fx.push({ type: 'ash', dx: 0, dy: -50, count: 1, color: '#c040ff' });
      }
      if(frame % 18 === 0){
        fx.push({ type: 'ash', dx: -16, dy: 8, count: 1, color: '#3df0ff' });
        fx.push({ type: 'ash', dx: 16, dy: 8, count: 1, color: '#ff40c0' });
      }
      return { opts: {}, fx };
    },
  },

  voidStorm: {
    id: 'voidStorm', name: 'VOID STORM', icon: '🌀',
    duration: 130,
    description: 'AOE shock 4×4 cases tous les 5 tours. Charge le cœur, projette un vortex cosmique massif. 50% Shock chain.',
    phases: [
      { from: 0, to: 40, label: 'Charge' },
      { from: 40, to: 60, label: 'Project' },
      { from: 60, to: 90, label: 'Sustain' },
      { from: 90, to: 130, label: 'Recovery' },
    ],
    projectile: {
      spawnFrame: 40,
      spawnOffset: { dx: 0, dy: -18 },
      travelFrames: 24,
      arc: 4,
      drawProjectile(ctx, x, y, vx, vy, t){
        // Cosmic vortex projectile
        const angle = Math.atan2(vy, vx);
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        // Halo
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, 22);
        grad.addColorStop(0, 'rgba(255,255,255,0.95)');
        grad.addColorStop(0.3, 'rgba(192,64,255,0.7)');
        grad.addColorStop(0.6, 'rgba(61,240,255,0.5)');
        grad.addColorStop(1, 'rgba(0,0,5,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(-22, -22, 44, 44);
        // Spinning vortex particles
        for(let i = 0; i < 12; i++){
          const ta = (i / 12) * Math.PI * 2 + t * 0.5;
          const r = 5 + (i % 3) * 3;
          const px = Math.cos(ta) * r;
          const py = Math.sin(ta) * r;
          const c = i % 3 === 0 ? '#c040ff' : (i % 3 === 1 ? '#3df0ff' : '#fff');
          ctx.fillStyle = c;
          ctx.fillRect(Math.round(px), Math.round(py), 1.5, 1.5);
        }
        // Inner ring
        ctx.strokeStyle = '#ff40c0';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, 7, 0, Math.PI * 2);
        ctx.stroke();
        // Black core (singularity)
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(0, 0, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.fillRect(-0.5, -0.5, 1, 1);
        ctx.restore();
      },
      trailColor: '#c040ff',
      onHit: {
        flash: '#fff', flashSize: 36,
        sparks: 32, color: '#c040ff',
        shockwave: '#3df0ff', shockwaveRadius: 60,
        ash: 16, color: '#ff40c0',
      },
    },
    update(frame){
      const opts = {};
      const fx = [];
      if(frame < 40){
        const p = frame / 40;
        opts.armSpread = 0.5 + p * 0.7;
        opts.heartFlare = p;
        if(frame % 3 === 0){
          fx.push({ type: 'sparks', dx: 0, dy: -18, count: 2, color: '#c040ff' });
        }
        if(frame > 28 && frame % 4 === 0){
          fx.push({ type: 'sparks', dx: 0, dy: -10, count: 1, color: '#3df0ff' });
        }
      } else if(frame < 60){
        opts.armSpread = 1.2;
        opts.heartFlare = 1 - (frame - 40) / 20 * 0.5;
        if(frame === 40){
          fx.push({ type: 'flash', dx: 0, dy: -18, color: '#fff', size: 36 });
          fx.push({ type: 'shockwave', dx: 0, dy: -10, color: '#c040ff', maxRadius: 50 });
          fx.push({
            type: 'projectile',
            dx: 0, dy: -18,
            useAttackProjectile: 'voidStorm',
          });
        }
      } else if(frame < 90){
        opts.armSpread = 1.0 - (frame - 60) / 30 * 0.5;
        opts.heartFlare = 0.5;
        // Secondary shockwaves at impact zone (4x4 AOE)
        if(frame === 65){
          fx.push({ type: 'shockwave', dx: 0, dy: 0, color: '#3df0ff', maxRadius: 56, useTargetPosition: true });
        }
        if(frame === 75){
          fx.push({ type: 'shockwave', dx: 0, dy: 0, color: '#c040ff', maxRadius: 44, useTargetPosition: true });
        }
        if(frame === 82){
          fx.push({ type: 'shockwave', dx: 0, dy: 0, color: '#ff40c0', maxRadius: 32, useTargetPosition: true });
        }
      } else {
        opts.armSpread = 0.5;
        opts.heartFlare = Math.max(0, 0.5 - (frame - 90) / 40);
      }
      return { opts, fx };
    },
  },

  phaseShift: {
    id: 'phaseShift', name: 'PHASE SHIFT (P1)', icon: '✦',
    duration: 95,
    description: 'À 50% HP : devient invulnérable 1 tour, téléporte, recommence. Anim : dissolution totale en pixels, void absolu, recomposition.',
    phases: [
      { from: 0, to: 30, label: 'Dissolve' },
      { from: 30, to: 50, label: 'Void' },
      { from: 50, to: 95, label: 'Reform' },
    ],
    update(frame){
      const opts = {};
      const fx = [];
      if(frame < 30){
        const p = frame / 30;
        opts.dissolve = p;
        opts.heartFlare = p * 0.8;
        opts.robeFlow = 1 - p;
        if(frame % 2 === 0){
          fx.push({
            type: 'sparks',
            dx: (Math.random() - 0.5) * 30,
            dy: -18 + (Math.random() - 0.5) * 40,
            count: 1,
            color: frame % 4 === 0 ? '#c040ff' : '#3df0ff',
          });
        }
        if(frame === 28){
          fx.push({ type: 'flash', dx: 0, dy: -18, color: '#fff', size: 40 });
          fx.push({ type: 'shockwave', dx: 0, dy: -10, color: '#c040ff', maxRadius: 50 });
        }
      } else if(frame < 50){
        opts.dissolve = 1;
        opts.bodyShift = 999;
      } else {
        const p = (frame - 50) / 45;
        opts.dissolve = 1 - p;
        opts.heartFlare = (1 - p) * 0.6;
        opts.robeFlow = p;
        opts.bodyShift = 0;
        if(frame === 50){
          fx.push({ type: 'flash', dx: 0, dy: -18, color: '#fff', size: 38 });
          fx.push({ type: 'sparks', dx: 0, dy: -18, count: 28, color: '#c040ff' });
        }
      }
      return { opts, fx };
    },
  },

  summonDaemons: {
    id: 'summonDaemons', name: 'SUMMON DAEMONS (P2)', icon: '🧬',
    duration: 105,
    description: 'À 30% HP : invoque 3 Daemons Mineurs. Couronne secondaire de hexagones apparaît, 3 portails s\'ouvrent.',
    phases: [
      { from: 0, to: 30, label: 'Phase shift' },
      { from: 30, to: 70, label: 'Portals' },
      { from: 70, to: 105, label: 'Manifest' },
    ],
    update(frame){
      const opts = { armSpread: 1.2 };
      const fx = [];
      if(frame < 30){
        const p = frame / 30;
        opts.phase2 = p;
        opts.heartFlare = p * 0.8;
        if(frame === 0){
          fx.push({ type: 'flash', dx: 0, dy: -42, color: '#c040ff', size: 36 });
          fx.push({ type: 'shockwave', dx: 0, dy: -18, color: '#3df0ff', maxRadius: 50 });
        }
      } else if(frame < 70){
        opts.phase2 = 1;
        opts.heartFlare = 0.8 + Math.sin(frame * 0.15) * 0.15;
        // 3 portal positions
        const portals = [[-30, 8], [0, 12], [30, 8]];
        for(let pi = 0; pi < 3; pi++){
          const [px, py] = portals[pi];
          if(frame % 4 === 0){
            fx.push({ type: 'sparks', dx: px, dy: py, count: 1, color: pi === 0 ? '#3df0ff' : (pi === 1 ? '#c040ff' : '#ff40c0') });
          }
          if(frame === 30 + pi * 6){
            fx.push({ type: 'shockwave', dx: px, dy: py, color: '#3df0ff', maxRadius: 26 });
          }
        }
      } else {
        const p = (frame - 70) / 35;
        opts.phase2 = 1;
        opts.heartFlare = 0.8 - p * 0.4;
        if(frame === 70){
          fx.push({ type: 'flash', dx: -30, dy: 8, color: '#3df0ff', size: 22 });
          fx.push({ type: 'flash', dx: 0, dy: 12, color: '#c040ff', size: 22 });
          fx.push({ type: 'flash', dx: 30, dy: 8, color: '#ff40c0', size: 22 });
          fx.push({ type: 'sparks', dx: -30, dy: 8, count: 14, color: '#3df0ff' });
          fx.push({ type: 'sparks', dx: 0, dy: 12, count: 14, color: '#c040ff' });
          fx.push({ type: 'sparks', dx: 30, dy: 8, count: 14, color: '#ff40c0' });
        }
      }
      return { opts, fx };
    },
  },
};

export const meta = { width: 44, height: 80, groundOffsetY: -8 };
export default { draw, attacks, palette, meta };
