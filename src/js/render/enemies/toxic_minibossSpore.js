// src/js/render/enemies/toxic_minibossSpore.js
// Mère-Spore — MINIBOSS.
// Masse organique semi-immobile, bulbe géant central avec orifices pulsants,
// tentacules courts qui s'agitent à la base, pas de jambes — repose sur une
// masse de chair. Spores qui s'échappent en continu.

export const palette = {
  bulb:         '#5a7838',
  bulbDark:     '#3a4820',
  bulbLight:    '#7fa055',
  bulbVein:     '#7a3a8a',
  flesh:        '#5a3825',  // chair brune à la base
  fleshDark:    '#2a1808',
  fleshLight:   '#8a5a35',
  spore:        '#a8e065',
  sporeHot:     '#c8e845',
  sporeCore:    '#e8f880',
  orificeDark:  '#1a0a05',
  orificeIn:    '#4a3018',
  tentacle:     '#5a6038',
  tentacleDark: '#2a3018',
  toxicAura:    'rgba(168,224,101,0.35)',
  shadow:       'rgba(20,30,10,0.85)',
};

export function draw(ctx, sx, sy, t, opts){
  opts = opts || {};
  const p = palette;
  const breathe = Math.sin(t * 0.04) * 1.5; // gros breathe (le bulbe respire)
  sx = Math.round(sx + (opts.bodyShift || 0));
  // Pas de bobbing significatif, c'est immobile

  const burstActive = opts.burstActive || 0;
  const summonActive = opts.summonActive || 0;
  const auraIntensity = opts.auraIntensity !== undefined ? opts.auraIntensity : 0.6;

  // Shadow (très large)
  ctx.fillStyle = p.shadow;
  ctx.beginPath();
  ctx.ellipse(sx, sy + 9, 22, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // === TOXIC AURA (constant, large green cloud) ===
  for(let i = 0; i < 5; i++){
    const r = 28 + i * 6 + Math.sin(t * 0.05 + i) * 3;
    const a = auraIntensity * 0.15 * (1 - i * 0.18);
    ctx.fillStyle = `rgba(168,224,101,${a})`;
    ctx.beginPath();
    ctx.ellipse(sx, sy - 2, r, r * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Inner glow
  const grad = ctx.createRadialGradient(sx, sy - 12, 6, sx, sy - 12, 32);
  grad.addColorStop(0, `rgba(168,224,101,${0.4 + Math.sin(t * 0.08) * 0.1})`);
  grad.addColorStop(1, 'rgba(168,224,101,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(sx - 32, sy - 44, 64, 56);

  // === BASE : masse de chair brune ===
  ctx.fillStyle = p.fleshDark;
  ctx.beginPath();
  ctx.ellipse(sx, sy + 6, 18, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = p.flesh;
  ctx.beginPath();
  ctx.ellipse(sx, sy + 4, 16, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = p.fleshLight;
  ctx.beginPath();
  ctx.ellipse(sx - 4, sy + 3, 8, 2, 0, 0, Math.PI * 2);
  ctx.fill();

  // === TENTACLES at the base (s'agitent) ===
  for(let i = 0; i < 6; i++){
    const angle = (i / 6) * Math.PI - Math.PI / 12;
    const baseX = sx + Math.cos(angle) * 14;
    const baseY = sy + 6 + Math.sin(angle) * 2;
    drawTentacle(ctx, baseX, baseY, t, i, p);
  }

  // === BULB (the big central feature) ===
  const bulbWidth = 22 + breathe;
  const bulbHeight = 24 + breathe * 0.5;
  // Outline
  ctx.fillStyle = p.bulbDark;
  ctx.beginPath();
  ctx.ellipse(sx, sy - 12, bulbWidth / 2 + 1, bulbHeight / 2 + 1, 0, 0, Math.PI * 2);
  ctx.fill();
  // Main bulb
  ctx.fillStyle = p.bulb;
  ctx.beginPath();
  ctx.ellipse(sx, sy - 12, bulbWidth / 2, bulbHeight / 2, 0, 0, Math.PI * 2);
  ctx.fill();
  // Highlight (lit from upper-left)
  ctx.fillStyle = p.bulbLight;
  ctx.beginPath();
  ctx.ellipse(sx - 4, sy - 16, bulbWidth / 4, bulbHeight / 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Veins (purple) running across the bulb
  ctx.strokeStyle = p.bulbVein;
  ctx.lineWidth = 0.7;
  ctx.beginPath();
  ctx.moveTo(sx - 9, sy - 22); ctx.quadraticCurveTo(sx - 5, sy - 14, sx - 8, sy - 6);
  ctx.moveTo(sx + 8, sy - 22); ctx.quadraticCurveTo(sx + 4, sy - 14, sx + 9, sy - 4);
  ctx.moveTo(sx - 4, sy - 24); ctx.quadraticCurveTo(sx + 2, sy - 16, sx + 1, sy - 4);
  ctx.stroke();

  // === ORIFICES (3 pulsing holes that emit spores) ===
  // Top orifice
  drawOrifice(ctx, sx - 6, sy - 18, t, summonActive, 1.0, p);
  // Right orifice
  drawOrifice(ctx, sx + 6, sy - 14, t + 50, burstActive, 1.2, p);
  // Bottom orifice
  drawOrifice(ctx, sx - 2, sy - 6, t + 100, summonActive * 0.5, 0.8, p);

  // Spore particles emanating from bulb (constant)
  // (these are now rendered via fx system in update)
}

function drawTentacle(ctx, lx, ly, t, idx, p){
  const sway = Math.sin(t * 0.08 + idx * 1.2) * 1.5;
  const len = 6 + Math.sin(t * 0.05 + idx) * 1;
  // Segments (3-4 chunks for organic feel)
  const segs = 4;
  let x = lx, y = ly;
  for(let s = 0; s < segs; s++){
    const sp = s / segs;
    const sx2 = lx + Math.sin(t * 0.06 + idx + sp * 2) * sway * sp;
    const sy2 = ly + (s + 1) * (len / segs);
    ctx.fillStyle = s === segs - 1 ? p.tentacleDark : p.tentacle;
    const w = 2.5 - sp * 1.5;
    ctx.fillRect(Math.round(sx2 - w / 2), Math.round(sy2 - len / segs / 2), Math.round(w), Math.round(len / segs + 1));
    x = sx2; y = sy2;
  }
  // Tiny suction tip
  ctx.fillStyle = p.bulbVein;
  ctx.fillRect(Math.round(x - 0.5), Math.round(y), 1, 1);
}

function drawOrifice(ctx, lx, ly, t, intensity, scale, p){
  const r = 3 * scale + intensity * 1.5;
  const pulse = 0.85 + Math.sin(t * 0.12) * 0.15 + intensity * 0.3;
  // Halo green (when releasing)
  if(intensity > 0){
    const grad = ctx.createRadialGradient(lx, ly, 0, lx, ly, r * 3);
    grad.addColorStop(0, `rgba(200,232,69,${intensity * 0.6})`);
    grad.addColorStop(1, 'rgba(168,224,101,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(lx - r * 3, ly - r * 3, r * 6, r * 6);
  }
  // Outer rim
  ctx.fillStyle = p.bulbDark;
  ctx.beginPath();
  ctx.arc(lx, ly, r, 0, Math.PI * 2);
  ctx.fill();
  // Dark inside
  ctx.fillStyle = p.orificeDark;
  ctx.beginPath();
  ctx.arc(lx, ly, r - 1, 0, Math.PI * 2);
  ctx.fill();
  // Inner glow
  ctx.fillStyle = `rgba(127,200,68,${pulse})`;
  ctx.beginPath();
  ctx.arc(lx, ly, r * 0.5, 0, Math.PI * 2);
  ctx.fill();
  // Tiny bright dot
  ctx.fillStyle = `rgba(232,248,128,${pulse})`;
  ctx.fillRect(Math.round(lx - 0.5), Math.round(ly - 0.5), 1, 1);
}

export const attacks = {
  idle: {
    id: 'idle', name: 'IDLE', icon: '◇',
    duration: 9999, looping: true,
    description: 'Bulbe respire lentement, tentacules ondulent, orifices pulsent. Aura toxique constante.',
    phases: [{ from: 0, to: 9999, label: 'Loop' }],
    update(frame){
      const opts = { auraIntensity: 0.6 };
      const fx = [];
      if(frame % 5 === 0){
        const angle = Math.random() * Math.PI * 2;
        fx.push({ type: 'ash', dx: Math.cos(angle) * 16, dy: -16 + Math.sin(angle) * 12, count: 1, color: '#a8e065' });
      }
      return { opts, fx };
    },
  },

  sporeBurst: {
    id: 'sporeBurst', name: 'SPORE BURST', icon: '🌫',
    duration: 80,
    description: 'Projette un nuage de spores vers la cible. Range 3. Inflige Poison fort.',
    phases: [
      { from: 0, to: 25, label: 'Charge' },
      { from: 25, to: 35, label: 'Burst' },
      { from: 35, to: 80, label: 'Recovery' },
    ],
    projectile: {
      spawnFrame: 25,
      spawnOffset: { dx: 6, dy: -14 },
      travelFrames: 22,
      arc: 6,
      drawProjectile(ctx, x, y, vx, vy, t){
        // Nuage de spores tournant
        const grad = ctx.createRadialGradient(x, y, 0, x, y, 14);
        grad.addColorStop(0, 'rgba(232,248,128,0.85)');
        grad.addColorStop(0.4, 'rgba(168,224,101,0.7)');
        grad.addColorStop(1, 'rgba(127,200,68,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(x - 14, y - 14, 28, 28);
        // Multiple small particles in the cloud
        for(let i = 0; i < 8; i++){
          const angle = (i / 8) * Math.PI * 2 + t * 0.3;
          const r = 4 + (i % 3) * 2;
          const px = x + Math.cos(angle) * r;
          const py = y + Math.sin(angle) * r * 0.8;
          ctx.fillStyle = `rgba(168,224,101,${0.85 - (i % 3) * 0.2})`;
          ctx.fillRect(Math.round(px), Math.round(py), 1, 1);
        }
        // Center
        ctx.fillStyle = '#c8e845';
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#e8f880';
        ctx.fillRect(Math.round(x - 0.5), Math.round(y - 0.5), 1, 1);
      },
      trailColor: '#a8e065',
      onHit: {
        flash: '#c8e845', flashSize: 20,
        sparks: 18, color: '#a8e065',
        shockwave: '#7fc844', shockwaveRadius: 38,
        ash: 14, color: '#7fc844',
      },
    },
    update(frame){
      const opts = { auraIntensity: 0.6 };
      const fx = [];
      if(frame < 25){
        const p = frame / 25;
        opts.burstActive = p;
        if(frame % 3 === 0){
          fx.push({ type: 'sparks', dx: 6, dy: -14, count: 1, color: '#c8e845' });
        }
      } else if(frame < 35){
        opts.burstActive = 1;
        if(frame === 25){
          fx.push({ type: 'flash', dx: 6, dy: -14, color: '#c8e845', size: 18 });
          fx.push({ type: 'sparks', dx: 6, dy: -14, count: 14, color: '#a8e065' });
          fx.push({
            type: 'projectile',
            dx: 6, dy: -14,
            useAttackProjectile: 'sporeBurst',
          });
        }
      } else {
        const p = (frame - 35) / 45;
        opts.burstActive = Math.max(0, 1 - p);
      }
      return { opts, fx };
    },
  },

  summonSwarm: {
    id: 'summonSwarm', name: 'SUMMON SWARM', icon: '🦟',
    duration: 100,
    description: 'Invoque 2 Essaims tous les 3 tours. Anim : tous les orifices s\'ouvrent en grand, essaim émerge.',
    phases: [
      { from: 0, to: 30, label: 'Open' },
      { from: 30, to: 65, label: 'Emerge' },
      { from: 65, to: 100, label: 'Settle' },
    ],
    update(frame){
      const opts = { auraIntensity: 0.6 };
      const fx = [];
      if(frame < 30){
        const p = frame / 30;
        opts.summonActive = p;
        opts.auraIntensity = 0.6 + p * 0.5;
        if(frame % 3 === 0){
          const angle = Math.random() * Math.PI * 2;
          fx.push({ type: 'sparks', dx: Math.cos(angle) * 14, dy: -14 + Math.sin(angle) * 10, count: 1, color: '#c8e845' });
        }
        if(frame === 0){
          fx.push({ type: 'shockwave', dx: 0, dy: 0, color: '#a8e065', maxRadius: 38 });
        }
      } else if(frame < 65){
        opts.summonActive = 1 + Math.sin(frame * 0.15) * 0.15;
        opts.auraIntensity = 1.1;
        // Bugs emerging
        if(frame % 2 === 0){
          const orifice = Math.floor(frame / 5) % 3;
          const ox = orifice === 0 ? -6 : (orifice === 1 ? 6 : -2);
          const oy = orifice === 0 ? -18 : (orifice === 1 ? -14 : -6);
          fx.push({ type: 'sparks', dx: ox, dy: oy, count: 2, color: '#7fc844' });
        }
        if(frame === 30){
          fx.push({ type: 'flash', dx: 0, dy: -12, color: '#c8e845', size: 26 });
        }
      } else {
        const p = (frame - 65) / 35;
        opts.summonActive = Math.max(0, 1 - p);
        opts.auraIntensity = 0.6 + (1 - p) * 0.3;
      }
      return { opts, fx };
    },
  },

  toxicAura: {
    id: 'toxicAura', name: 'TOXIC AURA', icon: '☣',
    duration: 60, passive: true,
    description: 'Passif : 1 PV poison/tour aux ennemis dans 3 cases. Aura verte large constante autour de la masse.',
    phases: [
      { from: 0, to: 25, label: 'Pulse' },
      { from: 25, to: 60, label: 'Sustain' },
    ],
    update(frame){
      const opts = {};
      const fx = [];
      if(frame < 25){
        const p = frame / 25;
        opts.auraIntensity = 0.6 + p * 0.6;
        if(frame === 0){
          fx.push({ type: 'shockwave', dx: 0, dy: 0, color: '#7fc844', maxRadius: 56 });
        }
      } else {
        opts.auraIntensity = 1.2 + Math.sin(frame * 0.15) * 0.15;
        if(frame % 4 === 0){
          const angle = Math.random() * Math.PI * 2;
          fx.push({ type: 'ash', dx: Math.cos(angle) * 24, dy: 0 + Math.sin(angle) * 16, count: 1, color: '#a8e065' });
        }
      }
      return { opts, fx };
    },
  },
};

export const meta = { width: 50, height: 46, groundOffsetY: 0 };
export default { draw, attacks, palette, meta };
