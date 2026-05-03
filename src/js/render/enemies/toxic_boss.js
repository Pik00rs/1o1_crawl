// src/js/render/enemies/toxic_boss.js
// Bête Putréfiée — BOSS final Toxic.
// Quadrupède bestial 1.5x, énorme, dos courbé. Pustules violettes sur le dos.
// CŒUR EXPOSÉ sur le poitrail (orbe VIOLET pulsant — contrepoint au cœur thermonucléaire
// du Pyromancien et au cœur de glace de la Cryo-Reine. Trio de bosses : feu rouge / glace bleue / poison violet).

export const palette = {
  flesh:        '#5a6840',
  fleshDark:    '#28301a',
  fleshLight:   '#8a9858',
  fleshBack:    '#7a5838',  // dos brun-rouge
  fleshBackDk:  '#3a2818',
  necrosis:     '#5a3825',
  necrosisDark: '#1a0a05',
  bile:         '#a8e065',
  bileBright:   '#c8d845',
  pustule:      '#a060c0',  // pustules violettes
  pustuleHot:   '#d8a0e8',
  pustuleCore:  '#fff8ff',
  pustuleDark:  '#5a2870',
  bone:         '#d4c0a0',
  boneDark:     '#7a6850',
  fang:         '#e8d8a0',
  // Cœur
  heart:        '#a060c0',
  heartCore:    '#fff8ff',
  heartRing:    '#7a3a8a',
  heartDeep:    '#5a2870',
  saliva:       '#a8e065',
  scar:         '#5a3018',
  shadow:       'rgba(20,30,10,0.9)',
};

export function draw(ctx, sx, sy, t, opts){
  opts = opts || {};
  const p = palette;
  const breathe = Math.sin(t * 0.04) * 1.0; // grosse respiration
  const sway = Math.sin(t * 0.025 + 1.3) * 0.7;
  sx = Math.round(sx + (opts.bodyShift || 0) + sway);
  sy = Math.round(sy + Math.sin(t * 0.05) * 0.6);

  const heartFlare = opts.heartFlare || 0;
  const lunge = opts.lunge || 0; // 0..1, charge mordante
  const regenGlow = opts.regenGlow || 0;
  const phase2 = opts.phase2 || 0;

  // Shadow (très large pour le quadrupède)
  ctx.fillStyle = p.shadow;
  ctx.beginPath();
  ctx.ellipse(sx, sy + 16, 30, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  // Outer purple-green glow
  const outerGlow = 0.5 + heartFlare * 0.4 + Math.sin(t * 0.05) * 0.15;
  const og = ctx.createRadialGradient(sx, sy - 4, 8, sx, sy - 4, 60);
  og.addColorStop(0, `rgba(160,96,192,${outerGlow * 0.5})`);
  og.addColorStop(0.4, `rgba(127,200,68,${outerGlow * 0.3})`);
  og.addColorStop(1, 'rgba(127,200,68,0)');
  ctx.fillStyle = og;
  ctx.fillRect(sx - 60, sy - 60, 120, 100);

  // Inner heart glow
  const coreGlow = 0.7 + heartFlare * 0.3 + Math.sin(t * 0.1) * 0.15;
  const cg = ctx.createRadialGradient(sx - 6, sy - 4, 1, sx - 6, sy - 4, 22);
  cg.addColorStop(0, `rgba(255,248,255,${coreGlow * 0.6})`);
  cg.addColorStop(0.4, `rgba(216,160,232,${coreGlow * 0.5})`);
  cg.addColorStop(1, 'rgba(160,96,192,0)');
  ctx.fillStyle = cg;
  ctx.fillRect(sx - 28, sy - 26, 44, 44);

  // Regen aura (when active)
  if(regenGlow > 0){
    for(let i = 0; i < 4; i++){
      const r = 32 + i * 7;
      const a = regenGlow * 0.18 * (1 - i * 0.22);
      ctx.fillStyle = `rgba(168,224,101,${a})`;
      ctx.beginPath();
      ctx.ellipse(sx, sy + 6, r, r * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.save();
  // Apply lunge (forward shift + slight rotation toward target)
  ctx.translate(sx, sy);
  ctx.rotate(lunge * -0.15);
  sx = 0; sy = 0;

  // === HIND LEGS (back) ===
  // Right hind (further)
  ctx.fillStyle = p.fleshBackDk;
  ctx.fillRect(sx + 14, sy + 2, 6, 14);
  ctx.fillStyle = p.fleshBack;
  ctx.fillRect(sx + 14, sy + 2, 1, 14);
  // Foot/paw with claws
  ctx.fillStyle = p.necrosisDark;
  ctx.fillRect(sx + 13, sy + 14, 8, 4);
  ctx.fillStyle = p.bone;
  ctx.fillRect(sx + 13, sy + 17, 1, 1);
  ctx.fillRect(sx + 15, sy + 17, 1, 1);
  ctx.fillRect(sx + 17, sy + 17, 1, 1);
  ctx.fillRect(sx + 19, sy + 17, 1, 1);

  // Left hind (closer)
  ctx.fillStyle = p.fleshDark;
  ctx.fillRect(sx + 8, sy + 2, 6, 14);
  ctx.fillStyle = p.flesh;
  ctx.fillRect(sx + 8, sy + 2, 1, 14);
  ctx.fillStyle = p.necrosisDark;
  ctx.fillRect(sx + 7, sy + 14, 8, 4);
  ctx.fillStyle = p.bone;
  ctx.fillRect(sx + 7, sy + 17, 1, 1);
  ctx.fillRect(sx + 9, sy + 17, 1, 1);
  ctx.fillRect(sx + 11, sy + 17, 1, 1);
  ctx.fillRect(sx + 13, sy + 17, 1, 1);

  // === FRONT LEGS ===
  // Right front (further)
  ctx.fillStyle = p.fleshBackDk;
  ctx.fillRect(sx - 14, sy + 2, 6, 14);
  ctx.fillStyle = p.fleshBack;
  ctx.fillRect(sx - 14, sy + 2, 1, 14);
  ctx.fillStyle = p.necrosisDark;
  ctx.fillRect(sx - 15, sy + 14, 8, 4);
  ctx.fillStyle = p.bone;
  ctx.fillRect(sx - 15, sy + 17, 1, 1);
  ctx.fillRect(sx - 13, sy + 17, 1, 1);
  ctx.fillRect(sx - 11, sy + 17, 1, 1);
  ctx.fillRect(sx - 9, sy + 17, 1, 1);

  // Left front (closer, biggest)
  ctx.fillStyle = p.fleshDark;
  ctx.fillRect(sx - 20, sy + 2, 7, 14);
  ctx.fillStyle = p.flesh;
  ctx.fillRect(sx - 20, sy + 2, 2, 14);
  ctx.fillStyle = p.necrosisDark;
  ctx.fillRect(sx - 21, sy + 14, 9, 4);
  ctx.fillStyle = p.bone;
  ctx.fillRect(sx - 21, sy + 17, 1, 2);
  ctx.fillRect(sx - 19, sy + 17, 1, 2);
  ctx.fillRect(sx - 17, sy + 17, 1, 2);
  ctx.fillRect(sx - 15, sy + 17, 1, 2);

  // === BODY (long, hunched, quadrupedal) ===
  ctx.fillStyle = p.fleshBackDk;
  ctx.beginPath();
  // Top of back (curved hump)
  ctx.moveTo(sx - 22, sy - 4 + breathe);
  ctx.quadraticCurveTo(sx - 8, sy - 14 + breathe, sx + 6, sy - 12 + breathe);
  ctx.quadraticCurveTo(sx + 18, sy - 8 + breathe, sx + 22, sy - 2 + breathe);
  ctx.lineTo(sx + 20, sy + 6);
  ctx.lineTo(sx - 20, sy + 6);
  ctx.closePath();
  ctx.fill();

  // Lighter back
  ctx.fillStyle = p.fleshBack;
  ctx.beginPath();
  ctx.moveTo(sx - 20, sy - 4 + breathe);
  ctx.quadraticCurveTo(sx - 8, sy - 13 + breathe, sx + 6, sy - 11 + breathe);
  ctx.quadraticCurveTo(sx + 16, sy - 7 + breathe, sx + 20, sy - 1 + breathe);
  ctx.lineTo(sx + 18, sy + 4);
  ctx.lineTo(sx - 18, sy + 4);
  ctx.closePath();
  ctx.fill();

  // Belly (lighter color, underside)
  ctx.fillStyle = p.flesh;
  ctx.fillRect(sx - 18, sy + 2, 36, 5);
  ctx.fillStyle = p.fleshLight;
  ctx.fillRect(sx - 18, sy + 2, 36, 1);

  // === PUSTULES ON BACK (signature violet) ===
  drawPustule(ctx, sx - 14, sy - 9 + breathe, t, 1.0, p);
  drawPustule(ctx, sx - 6, sy - 13 + breathe, t + 30, 1.3, p);
  drawPustule(ctx, sx + 4, sy - 11 + breathe, t + 60, 1.0, p);
  drawPustule(ctx, sx + 12, sy - 7 + breathe, t + 90, 0.9, p);
  drawPustule(ctx, sx - 10, sy - 5 + breathe, t + 120, 0.7, p);
  drawPustule(ctx, sx + 8, sy - 3 + breathe, t + 150, 0.8, p);
  // Phase 2: extra pustules emerging
  if(phase2 > 0){
    drawPustule(ctx, sx, sy - 14 + breathe, t + 200, 1.0 * phase2, p);
    drawPustule(ctx, sx - 18, sy - 8 + breathe, t + 250, 0.9 * phase2, p);
    drawPustule(ctx, sx + 18, sy - 4 + breathe, t + 300, 0.9 * phase2, p);
  }

  // Necrotic patches on flank
  ctx.fillStyle = p.necrosis;
  ctx.beginPath();
  ctx.moveTo(sx - 14, sy);
  ctx.lineTo(sx - 8, sy + 2);
  ctx.lineTo(sx - 12, sy + 5);
  ctx.lineTo(sx - 16, sy + 3);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = p.necrosisDark;
  ctx.fillRect(sx - 12, sy + 2, 1, 1);

  // === HEART (THE focal point — exposed on chest/poitrail, at front-left) ===
  // Position : visible sur la poitrine vue de profil
  const hx = sx - 12;
  const hy = sy - 4 + breathe;
  // Outer ring (deep purple)
  ctx.fillStyle = p.heartRing;
  ctx.beginPath();
  ctx.arc(hx, hy, 7, 0, Math.PI * 2);
  ctx.fill();
  // Mid (almost black)
  ctx.fillStyle = p.heartDeep;
  ctx.beginPath();
  ctx.arc(hx, hy, 6, 0, Math.PI * 2);
  ctx.fill();
  // Heart pulse
  const corePulse = 0.9 + Math.sin(t * 0.1) * 0.1 + heartFlare * 0.2;
  ctx.fillStyle = `rgba(160,96,192,${corePulse})`;
  ctx.beginPath();
  ctx.arc(hx, hy, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = `rgba(216,160,232,${corePulse})`;
  ctx.beginPath();
  ctx.arc(hx, hy, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = `rgba(255,248,255,${corePulse})`;
  ctx.beginPath();
  ctx.arc(hx, hy, 1.5, 0, Math.PI * 2);
  ctx.fill();
  // Rotating particles (purple)
  for(let i = 0; i < 4; i++){
    const angle = (i / 4) * Math.PI * 2 + t * 0.05;
    const x = hx + Math.cos(angle) * 4;
    const y = hy + Math.sin(angle) * 4;
    ctx.fillStyle = `rgba(216,160,232,${corePulse})`;
    ctx.fillRect(Math.round(x), Math.round(y), 1, 1);
  }
  // Veins extending into the body from the heart
  ctx.strokeStyle = p.heartRing;
  ctx.lineWidth = 0.7;
  ctx.beginPath();
  ctx.moveTo(hx, hy - 7); ctx.lineTo(hx - 3, hy - 12);
  ctx.moveTo(hx + 7, hy); ctx.lineTo(hx + 12, hy - 2);
  ctx.moveTo(hx, hy + 7); ctx.lineTo(hx + 2, hy + 11);
  ctx.stroke();

  // === HEAD (large monstrous head, jaws extended toward camera/left) ===
  // Skull
  ctx.fillStyle = p.fleshBackDk;
  ctx.beginPath();
  ctx.moveTo(sx - 25, sy - 6 + breathe);
  ctx.lineTo(sx - 32 - lunge * 4, sy - 4 + breathe);
  ctx.lineTo(sx - 34 - lunge * 4, sy + 2 + breathe);
  ctx.lineTo(sx - 28 - lunge * 4, sy + 6 + breathe);
  ctx.lineTo(sx - 22, sy + 6 + breathe);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = p.fleshBack;
  ctx.beginPath();
  ctx.moveTo(sx - 24, sy - 5 + breathe);
  ctx.lineTo(sx - 31 - lunge * 4, sy - 3 + breathe);
  ctx.lineTo(sx - 33 - lunge * 4, sy + 1 + breathe);
  ctx.lineTo(sx - 27 - lunge * 4, sy + 5 + breathe);
  ctx.lineTo(sx - 22, sy + 5 + breathe);
  ctx.closePath();
  ctx.fill();

  // Eye (single, malicious)
  const eyeX = sx - 28 - lunge * 4;
  const eyeY = sy - 1 + breathe;
  ctx.fillStyle = '#000';
  ctx.fillRect(eyeX - 2, eyeY - 1, 4, 2);
  const eyePulse = 0.92 + Math.sin(t * 0.1) * 0.08;
  ctx.fillStyle = `rgba(160,96,192,${eyePulse})`;
  ctx.fillRect(eyeX - 1, eyeY, 2, 1);
  ctx.fillStyle = `rgba(216,160,232,${eyePulse})`;
  ctx.fillRect(eyeX, eyeY, 1, 1);

  // Mouth (large, fanged, opens during lunge)
  const mouthOpen = lunge;
  ctx.fillStyle = '#1a0808';
  ctx.beginPath();
  ctx.moveTo(sx - 22, sy + 2 + breathe);
  ctx.lineTo(sx - 33 - lunge * 4, sy + 2 + breathe);
  ctx.lineTo(sx - 31 - lunge * 4, sy + 6 + breathe + mouthOpen * 4);
  ctx.lineTo(sx - 22, sy + 5 + breathe);
  ctx.closePath();
  ctx.fill();

  // Top fangs
  for(let i = 0; i < 4; i++){
    const fx = sx - 24 - i * 2.5;
    ctx.fillStyle = p.fang;
    ctx.beginPath();
    ctx.moveTo(fx - 0.5, sy + 2 + breathe);
    ctx.lineTo(fx, sy + 4 + breathe + mouthOpen * 2);
    ctx.lineTo(fx + 0.5, sy + 2 + breathe);
    ctx.closePath();
    ctx.fill();
  }
  // Bottom fangs (when open)
  if(mouthOpen > 0.3){
    for(let i = 0; i < 3; i++){
      const fx = sx - 25 - i * 3;
      ctx.fillStyle = p.fang;
      ctx.beginPath();
      ctx.moveTo(fx - 0.5, sy + 5 + breathe + mouthOpen * 3);
      ctx.lineTo(fx, sy + 3 + breathe + mouthOpen * 2);
      ctx.lineTo(fx + 0.5, sy + 5 + breathe + mouthOpen * 3);
      ctx.closePath();
      ctx.fill();
    }
  }

  // Saliva drip from mouth
  if(t % 60 < 30){
    const len = Math.floor((t % 30) / 8);
    ctx.fillStyle = p.saliva;
    ctx.fillRect(sx - 30, sy + 6 + breathe + mouthOpen * 3, 1, 2 + len);
    ctx.fillStyle = p.bileBright;
    ctx.fillRect(sx - 30, sy + 6 + breathe + mouthOpen * 3, 1, 1);
  }

  // Skull plates (bone visible on top of head)
  ctx.fillStyle = p.bone;
  ctx.fillRect(sx - 28 - lunge * 2, sy - 5 + breathe, 4, 1);
  ctx.fillRect(sx - 26 - lunge * 1, sy - 6 + breathe, 2, 1);

  ctx.restore();
}

function drawPustule(ctx, lx, ly, t, scale, p){
  const r = 2.5 * scale;
  const pulse = 0.85 + Math.sin(t * 0.12) * 0.15;
  // Halo violet
  ctx.fillStyle = `rgba(160,96,192,${pulse * 0.4 * scale})`;
  ctx.beginPath();
  ctx.arc(lx, ly, r * 1.8, 0, Math.PI * 2);
  ctx.fill();
  // Outer
  ctx.fillStyle = p.pustuleDark;
  ctx.beginPath();
  ctx.arc(lx, ly, r, 0, Math.PI * 2);
  ctx.fill();
  // Inner
  ctx.fillStyle = p.pustule;
  ctx.beginPath();
  ctx.arc(lx, ly, r * 0.7, 0, Math.PI * 2);
  ctx.fill();
  // Hot center
  ctx.fillStyle = `rgba(216,160,232,${pulse})`;
  ctx.fillRect(Math.round(lx - 0.5), Math.round(ly - 0.5), 1, 1);
}

export const attacks = {
  idle: {
    id: 'idle', name: 'IDLE', icon: '◇',
    duration: 9999, looping: true,
    description: 'Respiration lourde quadrupède, pustules violettes pulsent, salive qui dégouline. Cœur violet pulse régulièrement.',
    phases: [{ from: 0, to: 9999, label: 'Loop' }],
    update(frame){
      const fx = [];
      if(frame % 14 === 0){
        fx.push({ type: 'ash', dx: -28, dy: 4, count: 1, color: '#a8e065' });
      }
      if(frame % 22 === 0){
        fx.push({ type: 'ash', dx: -8, dy: -16, count: 1, color: '#a060c0' });
        fx.push({ type: 'ash', dx: 8, dy: -16, count: 1, color: '#a060c0' });
      }
      return { opts: {}, fx };
    },
  },

  lunge: {
    id: 'lunge', name: 'PUTREFIED LUNGE', icon: '🦷',
    duration: 100,
    description: 'Charge mordante avec projectile de bave en arc. 60% Poison forte. 30% lifesteal.',
    phases: [
      { from: 0, to: 25, label: 'Charge' },
      { from: 25, to: 45, label: 'Bite' },
      { from: 45, to: 75, label: 'Drain' },
      { from: 75, to: 100, label: 'Recovery' },
    ],
    projectile: {
      spawnFrame: 35,
      spawnOffset: { dx: -32, dy: 6 }, // depuis la gueule
      travelFrames: 18,
      arc: 10,
      drawProjectile(ctx, x, y, vx, vy, t){
        // Boule de bave putréfiée avec halo violet-vert
        const grad = ctx.createRadialGradient(x, y, 0, x, y, 16);
        grad.addColorStop(0, 'rgba(216,160,232,0.85)');
        grad.addColorStop(0.3, 'rgba(168,224,101,0.7)');
        grad.addColorStop(0.7, 'rgba(127,200,68,0.5)');
        grad.addColorStop(1, 'rgba(160,96,192,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(x - 16, y - 16, 32, 32);
        // Core
        ctx.fillStyle = '#a060c0';
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#7fc844';
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.fillRect(Math.round(x - 0.5), Math.round(y - 0.5), 1, 1);
        // Drips
        ctx.fillStyle = '#7fc844';
        ctx.fillRect(Math.round(x - 4 + Math.sin(t * 0.5) * 2), Math.round(y + 5), 1, 2);
        ctx.fillRect(Math.round(x + 3 + Math.cos(t * 0.4) * 2), Math.round(y + 6), 1, 2);
      },
      trailColor: '#a060c0',
      onHit: {
        flash: '#d8a0e8', flashSize: 22,
        sparks: 20, color: '#a060c0',
        shockwave: '#7a3a8a', shockwaveRadius: 44,
        ash: 12, color: '#a8e065',
      },
    },
    update(frame){
      const opts = {};
      const fx = [];
      if(frame < 25){
        const p = frame / 25;
        opts.lunge = p * 0.4;
        opts.heartFlare = p;
        opts.bodyShift = -p * 4;
        if(frame % 4 === 0){
          fx.push({ type: 'sparks', dx: -28, dy: 4, count: 1, color: '#a060c0' });
        }
      } else if(frame < 45){
        const p = (frame - 25) / 20;
        opts.lunge = 0.4 + p * 0.6;
        opts.heartFlare = 1 - p * 0.5;
        opts.bodyShift = -4 + p * 8;
        if(frame === 25){
          fx.push({ type: 'flash', dx: -32, dy: 4, color: '#d8a0e8', size: 18 });
          fx.push({ type: 'shockwave', dx: -20, dy: 8, color: '#a060c0', maxRadius: 30 });
        }
        if(frame === 35){
          fx.push({ type: 'sparks', dx: -32, dy: 6, count: 14, color: '#a8e065' });
          fx.push({
            type: 'projectile',
            dx: -32, dy: 6,
            useAttackProjectile: 'lunge',
          });
        }
      } else if(frame < 75){
        const p = (frame - 45) / 30;
        opts.lunge = 1 - p;
        opts.heartFlare = (1 - p) * 0.4;
        opts.bodyShift = 4 - p * 4;
        // Drain particles back to boss
        if(frame % 4 === 0){
          fx.push({ type: 'sparks', dx: -28, dy: 4, count: 1, color: '#7a3a8a' });
        }
      } else {
        const p = (frame - 75) / 25;
        opts.lunge = 0;
      }
      return { opts, fx };
    },
  },

  regen: {
    id: 'regen', name: 'REGENERATION', icon: '✚',
    duration: 70, passive: true,
    description: 'Régénère 5 PV/tour. Visuel : aura verte qui pulse, pustules qui se referment, cœur violet qui s\'intensifie.',
    phases: [
      { from: 0, to: 25, label: 'Activation' },
      { from: 25, to: 70, label: 'Sustain' },
    ],
    update(frame){
      const opts = {};
      const fx = [];
      if(frame < 25){
        const p = frame / 25;
        opts.regenGlow = p;
        opts.heartFlare = p * 0.6;
        if(frame === 0){
          fx.push({ type: 'flash', dx: -8, dy: -4, color: '#d8a0e8', size: 24 });
          fx.push({ type: 'shockwave', dx: 0, dy: 6, color: '#a8e065', maxRadius: 50 });
        }
      } else {
        opts.regenGlow = 1 + Math.sin(frame * 0.15) * 0.15;
        opts.heartFlare = 0.6 + Math.sin(frame * 0.1) * 0.2;
        if(frame % 5 === 0){
          const angle = Math.random() * Math.PI * 2;
          fx.push({ type: 'sparks', dx: Math.cos(angle) * 28, dy: -4 + Math.sin(angle) * 12, count: 1, color: '#c8e845' });
        }
      }
      return { opts, fx };
    },
  },

  spawnGrafted: {
    id: 'spawnGrafted', name: 'SPAWN GRAFTED (P2)', icon: '🧬',
    duration: 100,
    description: 'À 50% HP : invoque 2 Greffés. Pustules éclatent, deux mutations émergent du dos. Cœur violet pulse au max.',
    phases: [
      { from: 0, to: 30, label: 'Phase shift' },
      { from: 30, to: 70, label: 'Pustules burst' },
      { from: 70, to: 100, label: 'Manifest' },
    ],
    update(frame){
      const opts = {};
      const fx = [];
      if(frame < 30){
        const p = frame / 30;
        opts.phase2 = p;
        opts.heartFlare = p;
        if(frame === 0){
          fx.push({ type: 'flash', dx: -8, dy: -4, color: '#d8a0e8', size: 30 });
          fx.push({ type: 'shockwave', dx: 0, dy: 4, color: '#a060c0', maxRadius: 56 });
        }
      } else if(frame < 70){
        opts.phase2 = 1;
        opts.heartFlare = 1;
        // Pustule explosions
        if(frame % 4 === 0){
          const idx = Math.floor((frame - 30) / 4) % 6;
          const positions = [[-14, -9], [-6, -13], [4, -11], [12, -7], [-10, -5], [8, -3]];
          const [px, py] = positions[idx];
          fx.push({ type: 'sparks', dx: px, dy: py, count: 6, color: '#a060c0' });
          fx.push({ type: 'flash', dx: px, dy: py, color: '#d8a0e8', size: 8 });
        }
        if(frame === 30){
          fx.push({ type: 'shockwave', dx: 0, dy: -6, color: '#7a3a8a', maxRadius: 42 });
        }
      } else {
        const p = (frame - 70) / 30;
        opts.phase2 = 1;
        opts.heartFlare = 1 - p * 0.3;
        if(frame === 70){
          fx.push({ type: 'flash', dx: -16, dy: 4, color: '#a8e065', size: 22 });
          fx.push({ type: 'flash', dx: 16, dy: 4, color: '#a8e065', size: 22 });
          fx.push({ type: 'sparks', dx: -16, dy: 4, count: 18, color: '#7fc844' });
          fx.push({ type: 'sparks', dx: 16, dy: 4, count: 18, color: '#7fc844' });
        }
      }
      return { opts, fx };
    },
  },
};

export const meta = { width: 80, height: 50, groundOffsetY: 0 };
export default { draw, attacks, palette, meta };
