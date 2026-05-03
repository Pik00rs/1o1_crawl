// src/js/render/enemies/voidnet_minibossKernel.js
// Sous-Noyau de Trame — MINIBOSS.
// PAS humanoïde — gros polyèdre cubique flottant (octahèdre) avec faces qui s'ouvrent
// pour révéler du circuit interne lumineux. Symboles hex tournants autour.

export const palette = {
  shell:        '#1a3858',
  shellDark:    '#0a1828',
  shellLight:   '#3a6888',
  shellEdge:    '#5a88b8',
  circuit:      '#3df0ff',
  circuitCore:  '#e0ffff',
  circuitDark:  '#1a8aa0',
  void:         '#0a0a18',
  // Accents violets (pour silence/marked)
  magenta:      '#ff40c0',
  magentaCore:  '#ffc0e8',
  shadow:       'rgba(10,30,50,0.85)',
};

export function draw(ctx, sx, sy, t, opts){
  opts = opts || {};
  const p = palette;
  const float = Math.sin(t * 0.04) * 1.5; // float prononcé
  sx = Math.round(sx + (opts.bodyShift || 0));
  sy = Math.round(sy + float);

  const facesOpen = opts.facesOpen !== undefined ? opts.facesOpen : 0.3; // 0..1
  const charging = opts.charging || 0;
  const fieldActive = opts.fieldActive || 0;
  const silenceActive = opts.silenceActive || 0;

  // Shadow (large)
  ctx.fillStyle = p.shadow;
  ctx.beginPath();
  ctx.ellipse(sx, sy + 18, 20, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Outer cyan halo (constant, large)
  const glow = 0.5 + charging * 0.4 + Math.sin(t * 0.06) * 0.15;
  const og = ctx.createRadialGradient(sx, sy - 4, 8, sx, sy - 4, 50);
  og.addColorStop(0, `rgba(61,240,255,${glow * 0.5})`);
  og.addColorStop(0.5, `rgba(136,255,255,${glow * 0.3})`);
  og.addColorStop(1, 'rgba(61,240,255,0)');
  ctx.fillStyle = og;
  ctx.fillRect(sx - 50, sy - 50, 100, 92);

  // Silence anti-aura (when active)
  if(silenceActive > 0){
    for(let i = 0; i < 4; i++){
      const r = 28 + i * 7 + Math.sin(t * 0.1 + i) * 3;
      const a = silenceActive * 0.2 * (1 - i * 0.22);
      // Black-violet (silence)
      ctx.fillStyle = `rgba(50,10,50,${a * 0.7})`;
      ctx.beginPath();
      ctx.arc(sx, sy - 4, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = `rgba(255,64,192,${a})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(sx, sy - 4, r, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  // === ORBITING HEX SYMBOLS (around the cube) ===
  drawOrbitingHexes(ctx, sx, sy - 4, t, p);

  // === MAIN CUBE / OCTAHEDRON BODY ===
  // Top facet (lit)
  ctx.fillStyle = p.shellLight;
  ctx.beginPath();
  ctx.moveTo(sx, sy - 24);
  ctx.lineTo(sx + 18, sy - 12);
  ctx.lineTo(sx, sy - 4);
  ctx.lineTo(sx - 18, sy - 12);
  ctx.closePath();
  ctx.fill();

  // Left facet (mid)
  ctx.fillStyle = p.shell;
  ctx.beginPath();
  ctx.moveTo(sx - 18, sy - 12);
  ctx.lineTo(sx, sy - 4);
  ctx.lineTo(sx, sy + 16);
  ctx.lineTo(sx - 18, sy + 8);
  ctx.closePath();
  ctx.fill();

  // Right facet (dark)
  ctx.fillStyle = p.shellDark;
  ctx.beginPath();
  ctx.moveTo(sx + 18, sy - 12);
  ctx.lineTo(sx, sy - 4);
  ctx.lineTo(sx, sy + 16);
  ctx.lineTo(sx + 18, sy + 8);
  ctx.closePath();
  ctx.fill();

  // === EDGES ===
  ctx.strokeStyle = p.shellEdge;
  ctx.lineWidth = 1;
  ctx.beginPath();
  // Top edges
  ctx.moveTo(sx, sy - 24); ctx.lineTo(sx + 18, sy - 12);
  ctx.moveTo(sx, sy - 24); ctx.lineTo(sx - 18, sy - 12);
  // Mid edges (where facets meet)
  ctx.moveTo(sx - 18, sy - 12); ctx.lineTo(sx, sy - 4);
  ctx.moveTo(sx + 18, sy - 12); ctx.lineTo(sx, sy - 4);
  ctx.moveTo(sx, sy - 4); ctx.lineTo(sx, sy + 16);
  // Bottom edges
  ctx.moveTo(sx - 18, sy + 8); ctx.lineTo(sx, sy + 16);
  ctx.moveTo(sx + 18, sy + 8); ctx.lineTo(sx, sy + 16);
  // Side edges
  ctx.moveTo(sx - 18, sy - 12); ctx.lineTo(sx - 18, sy + 8);
  ctx.moveTo(sx + 18, sy - 12); ctx.lineTo(sx + 18, sy + 8);
  ctx.stroke();

  // === FACES OPENING (revealing circuit inside) ===
  if(facesOpen > 0){
    // Gap on the front (between two facets)
    const gapWidth = facesOpen * 6;
    const gapHeight = facesOpen * 16;
    // Dark void inside
    ctx.fillStyle = p.void;
    ctx.fillRect(sx - gapWidth / 2, sy - gapHeight / 2 - 4, gapWidth, gapHeight);
    // Inner circuit glow
    const innerGrad = ctx.createRadialGradient(sx, sy - 4, 0, sx, sy - 4, gapHeight);
    innerGrad.addColorStop(0, `rgba(255,255,255,${charging * 0.95 + 0.4})`);
    innerGrad.addColorStop(0.5, `rgba(61,240,255,${charging * 0.7 + 0.3})`);
    innerGrad.addColorStop(1, 'rgba(61,240,255,0)');
    ctx.fillStyle = innerGrad;
    ctx.fillRect(sx - 8, sy - 16, 16, 24);
    // Circuit lines visible in the gap
    if(facesOpen > 0.5){
      ctx.strokeStyle = p.circuit;
      ctx.lineWidth = 0.7;
      ctx.beginPath();
      ctx.moveTo(sx - 2, sy - 10); ctx.lineTo(sx, sy - 8); ctx.lineTo(sx + 2, sy - 10);
      ctx.moveTo(sx - 2, sy - 4); ctx.lineTo(sx + 2, sy - 4);
      ctx.moveTo(sx - 2, sy + 2); ctx.lineTo(sx, sy + 4); ctx.lineTo(sx + 2, sy + 2);
      ctx.stroke();
      ctx.fillStyle = p.circuitCore;
      ctx.fillRect(sx, sy - 8, 1, 1);
      ctx.fillRect(sx, sy - 4, 1, 1);
      ctx.fillRect(sx, sy + 4, 1, 1);
    }
  }

  // === SURFACE CIRCUITS (lines on outer faces) ===
  // Top face circuits
  ctx.strokeStyle = p.circuit;
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(sx, sy - 22); ctx.lineTo(sx, sy - 18);
  ctx.lineTo(sx - 6, sy - 14); ctx.lineTo(sx - 12, sy - 12);
  ctx.moveTo(sx, sy - 18); ctx.lineTo(sx + 6, sy - 14); ctx.lineTo(sx + 12, sy - 12);
  ctx.stroke();
  ctx.fillStyle = p.circuitCore;
  ctx.fillRect(sx - 12, sy - 12, 1, 1);
  ctx.fillRect(sx + 12, sy - 12, 1, 1);
  ctx.fillRect(sx - 0.5, sy - 22, 1, 1);

  // Lightning field beacons (when active)
  if(fieldActive > 0){
    // Show 4 indicators of where the field will hit
    for(let i = 0; i < 4; i++){
      const angle = (i / 4) * Math.PI * 2 + t * 0.03;
      const r = 26 + Math.sin(t * 0.1 + i) * 4;
      const bx = sx + Math.cos(angle) * r;
      const by = sy - 4 + Math.sin(angle) * r * 0.5;
      const pulse = 0.85 + Math.sin(t * 0.2 + i) * 0.15;
      ctx.fillStyle = `rgba(255,255,255,${pulse * fieldActive})`;
      ctx.fillRect(Math.round(bx - 1), Math.round(by - 1), 2, 2);
      ctx.strokeStyle = `rgba(61,240,255,${pulse * fieldActive})`;
      ctx.lineWidth = 0.7;
      ctx.beginPath();
      ctx.arc(bx, by, 4, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  // Top vertex glow (apex of the polyhedron)
  const apexPulse = 0.85 + Math.sin(t * 0.12) * 0.15;
  ctx.fillStyle = `rgba(255,255,255,${apexPulse})`;
  ctx.fillRect(sx - 1, sy - 25, 2, 2);
  ctx.fillStyle = `rgba(61,240,255,${apexPulse})`;
  ctx.beginPath();
  ctx.arc(sx, sy - 24, 3, 0, Math.PI * 2);
  ctx.fill();
}

function drawOrbitingHexes(ctx, lx, ly, t, p){
  // 5 hex symbols orbiting in a non-coplanar pattern
  for(let i = 0; i < 5; i++){
    const angle = (i / 5) * Math.PI * 2 + t * 0.025;
    const r = 28;
    const yScale = 0.4;
    const hx = lx + Math.cos(angle) * r;
    const hy = ly + Math.sin(angle) * r * yScale - 6;
    const inFront = Math.sin(angle) > 0;
    const alpha = inFront ? 1 : 0.4;
    const size = inFront ? 3 : 2;
    drawHex(ctx, hx, hy, t + i * 30, size, alpha, p);
  }
}

function drawHex(ctx, lx, ly, t, r, alpha, p){
  const pulse = 0.85 + Math.sin(t * 0.1) * 0.15;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = p.circuit;
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  for(let i = 0; i < 6; i++){
    const angle = (i / 6) * Math.PI * 2 + t * 0.05;
    const x = lx + Math.cos(angle) * r;
    const y = ly + Math.sin(angle) * r;
    if(i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.stroke();
  ctx.fillStyle = `rgba(255,255,255,${pulse * alpha})`;
  ctx.fillRect(Math.round(lx - 0.5), Math.round(ly - 0.5), 1, 1);
  ctx.restore();
}

export const attacks = {
  idle: {
    id: 'idle', name: 'IDLE', icon: '◇',
    duration: 9999, looping: true,
    description: 'Polyèdre flotte, faces semi-ouvertes, hexagones orbitent. Lumière interne pulse.',
    phases: [{ from: 0, to: 9999, label: 'Loop' }],
    update(frame){
      const fx = [];
      if(frame % 14 === 0){
        const angle = Math.random() * Math.PI * 2;
        fx.push({ type: 'sparks', dx: Math.cos(angle) * 22, dy: -4 + Math.sin(angle) * 12, count: 1, color: '#3df0ff' });
      }
      return { opts: { facesOpen: 0.3 }, fx };
    },
  },

  voltShot: {
    id: 'voltShot', name: 'VOLT SHOT', icon: '⚡',
    duration: 90,
    description: 'Tir longue portée. Range 6. Faces s\'ouvrent en grand pour libérer la charge interne.',
    phases: [
      { from: 0, to: 32, label: 'Open & charge' },
      { from: 32, to: 42, label: 'Fire' },
      { from: 42, to: 90, label: 'Recovery' },
    ],
    projectile: {
      spawnFrame: 32,
      spawnOffset: { dx: -4, dy: -4 },
      travelFrames: 18,
      drawProjectile(ctx, x, y, vx, vy, t){
        const angle = Math.atan2(vy, vx);
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        // Halo intense
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, 16);
        grad.addColorStop(0, 'rgba(255,255,255,0.95)');
        grad.addColorStop(0.4, 'rgba(136,255,255,0.85)');
        grad.addColorStop(1, 'rgba(61,240,255,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(-16, -16, 32, 32);
        // Big bolt
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-10, 0); ctx.lineTo(-5, -3); ctx.lineTo(-1, 1); ctx.lineTo(4, -2); ctx.lineTo(8, 1); ctx.lineTo(11, 0);
        ctx.stroke();
        ctx.strokeStyle = '#3df0ff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        // Bright tip
        ctx.fillStyle = '#fff';
        ctx.fillRect(9, -1, 3, 2);
        ctx.restore();
      },
      trailColor: '#88ffff',
      onHit: {
        flash: '#fff', flashSize: 22,
        sparks: 18, color: '#3df0ff',
        shockwave: '#88ffff', shockwaveRadius: 38,
      },
    },
    update(frame){
      const opts = {};
      const fx = [];
      if(frame < 32){
        const p = frame / 32;
        opts.facesOpen = 0.3 + p * 0.7;
        opts.charging = p;
        if(frame % 4 === 0){
          fx.push({ type: 'sparks', dx: 0, dy: -4, count: 1, color: '#88ffff' });
        }
      } else if(frame < 42){
        opts.facesOpen = 1;
        opts.charging = 1;
        if(frame === 32){
          fx.push({ type: 'flash', dx: 0, dy: -4, color: '#fff', size: 26 });
          fx.push({ type: 'shockwave', dx: 0, dy: 0, color: '#3df0ff', maxRadius: 36 });
          fx.push({
            type: 'projectile',
            dx: -4, dy: -4,
            useAttackProjectile: 'voltShot',
          });
        }
      } else {
        const p = (frame - 42) / 48;
        opts.facesOpen = 1 - p * 0.7;
        opts.charging = Math.max(0, 1 - p);
      }
      return { opts, fx };
    },
  },

  lightningField: {
    id: 'lightningField', name: 'LIGHTNING FIELD', icon: '🌩',
    duration: 110,
    description: 'Tous les 4 tours : 4 cases aléatoires reçoivent dmg shock. Anim : beacons s\'allument autour, 4 strikes successifs.',
    phases: [
      { from: 0, to: 30, label: 'Mark zones' },
      { from: 30, to: 80, label: 'Strikes' },
      { from: 80, to: 110, label: 'Recovery' },
    ],
    update(frame){
      const opts = { facesOpen: 0.6 };
      const fx = [];
      if(frame < 30){
        const p = frame / 30;
        opts.fieldActive = p;
        opts.charging = p * 0.7;
        if(frame % 4 === 0){
          fx.push({ type: 'sparks', dx: 0, dy: -4, count: 1, color: '#88ffff' });
        }
      } else if(frame < 80){
        opts.fieldActive = 1;
        opts.charging = 0.7;
        // 4 successive strikes (every ~12 frames)
        const strikeFrames = [30, 42, 54, 66];
        for(const sf of strikeFrames){
          if(frame === sf){
            const idx = strikeFrames.indexOf(sf);
            const angle = (idx / 4) * Math.PI * 2 + 0.5;
            const dx = Math.cos(angle) * 26;
            const dy = -4 + Math.sin(angle) * 14;
            fx.push({ type: 'flash', dx, dy, color: '#fff', size: 16 });
            fx.push({ type: 'shockwave', dx, dy, color: '#3df0ff', maxRadius: 24 });
            fx.push({ type: 'sparks', dx, dy, count: 12, color: '#88ffff' });
          }
        }
      } else {
        const p = (frame - 80) / 30;
        opts.fieldActive = Math.max(0, 1 - p);
        opts.charging = Math.max(0, 0.7 - p);
      }
      return { opts, fx };
    },
  },

  silence: {
    id: 'silence', name: 'SILENCE', icon: '🔇',
    duration: 70,
    description: 'AOE silence (1 tour). Anneau noir-violet se déploie autour du cube.',
    phases: [
      { from: 0, to: 25, label: 'Charge' },
      { from: 25, to: 50, label: 'Pulse' },
      { from: 50, to: 70, label: 'Recovery' },
    ],
    update(frame){
      const opts = { facesOpen: 0.3 };
      const fx = [];
      if(frame < 25){
        const p = frame / 25;
        opts.silenceActive = p;
      } else if(frame < 50){
        opts.silenceActive = 1 + Math.sin(frame * 0.2) * 0.15;
        if(frame === 25){
          fx.push({ type: 'flash', dx: 0, dy: -4, color: '#ff40c0', size: 24 });
          fx.push({ type: 'shockwave', dx: 0, dy: -4, color: '#ff40c0', maxRadius: 50 });
        }
        if(frame === 32){
          fx.push({ type: 'shockwave', dx: 0, dy: -4, color: '#9a2868', maxRadius: 38 });
        }
      } else {
        const p = (frame - 50) / 20;
        opts.silenceActive = Math.max(0, 1 - p);
      }
      return { opts, fx };
    },
  },
};

export const meta = { width: 40, height: 50, groundOffsetY: 0 };
export default { draw, attacks, palette, meta };
