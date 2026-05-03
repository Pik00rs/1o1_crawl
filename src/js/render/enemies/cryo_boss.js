// src/js/render/enemies/cryo_boss.js
// Cryo-Reine — BOSS final Cryo.
// La plus grande (1.5x hero), lévite ~5px du sol, robe ample blanche-bleue qui flotte,
// couronne de cristal de glace acérée, cape qui descend en cristaux,
// CŒUR DE GLACE incrusté dans la poitrine (contrepoint visuel au cœur thermonucléaire
// du Pyromancien — forme similaire mais glacée, blanc-bleu intense).

export const palette = {
  robe:         '#e0eef5',  // robe blanc-bleu très claire
  robeShade:   '#a0c0d8',
  robeDark:    '#5a7898',
  robeAccent:  '#4fc3f7',
  cape:        '#7898b0',
  capeDark:    '#3a5878',
  capeLight:   '#a0c0d8',
  iceCore:     '#fff',
  iceHeart:    '#aee6ff',
  iceRing:     '#4fc3f7',
  iceOuter:    '#cef0ff',
  crown:       '#aee6ff',
  crownDark:   '#4fc3f7',
  crownCore:   '#fff',
  skin:        '#d8e4f0',
  skinShade:   '#a8b8c8',
  hair:        '#c0d0e0',
  hairLight:   '#e0eaf5',
  eye:         '#4fc3f7',
  eyeCore:     '#ffffff',
  shadow:      'rgba(20,40,60,0.85)',
};

export function draw(ctx, sx, sy, t, opts){
  opts = opts || {};
  const p = palette;
  // Lévite : pas de bobbing au sol
  const float = Math.sin(t * 0.03) * 1.2 - 6;
  const sway = Math.sin(t * 0.022 + 2.1) * 0.8;
  sx = Math.round(sx + (opts.bodyShift || 0) + sway);
  sy = Math.round(sy + float);

  const armRaise = opts.armRaise !== undefined ? opts.armRaise : -0.5;
  const heartFlare = opts.heartFlare || 0;
  const robeFlow = opts.robeFlow !== undefined ? opts.robeFlow : 1;
  const phase2 = opts.phase2 || 0;

  // Shadow (au sol, distant car lévite)
  ctx.fillStyle = p.shadow;
  ctx.beginPath();
  ctx.ellipse(sx, sy + 14, 18, 4.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Outer cyan glow (large halo)
  const outerGlow = 0.6 + heartFlare * 0.4 + Math.sin(t * 0.05) * 0.15;
  const og = ctx.createRadialGradient(sx, sy - 18, 8, sx, sy - 18, 56);
  og.addColorStop(0, `rgba(174,230,255,${outerGlow * 0.5})`);
  og.addColorStop(0.4, `rgba(79,195,247,${outerGlow * 0.3})`);
  og.addColorStop(1, 'rgba(79,195,247,0)');
  ctx.fillStyle = og;
  ctx.fillRect(sx - 56, sy - 78, 112, 110);

  // White-cyan core glow (super bright)
  const coreGlow = 0.75 + heartFlare * 0.25 + Math.sin(t * 0.1) * 0.15;
  const cg = ctx.createRadialGradient(sx, sy - 18, 1, sx, sy - 18, 26);
  cg.addColorStop(0, `rgba(255,255,255,${coreGlow * 0.7})`);
  cg.addColorStop(0.4, `rgba(174,230,255,${coreGlow * 0.4})`);
  cg.addColorStop(1, 'rgba(174,230,255,0)');
  ctx.fillStyle = cg;
  ctx.fillRect(sx - 26, sy - 44, 52, 52);

  // === ROBE BOTTOM (s'évase, flotte, descend en cristaux) ===
  const flowOffset = Math.sin(t * 0.04) * 1.8 * robeFlow;
  ctx.fillStyle = p.robeDark;
  ctx.beginPath();
  ctx.moveTo(sx - 14 - flowOffset, sy + 14);
  ctx.lineTo(sx + 14 + flowOffset, sy + 14);
  ctx.lineTo(sx + 11, sy - 6);
  ctx.lineTo(sx - 11, sy - 6);
  ctx.closePath();
  ctx.fill();
  // Inner robe
  ctx.fillStyle = p.robeShade;
  ctx.beginPath();
  ctx.moveTo(sx - 13 - flowOffset, sy + 13);
  ctx.lineTo(sx + 13 + flowOffset, sy + 13);
  ctx.lineTo(sx + 9, sy + 6);
  ctx.lineTo(sx - 9, sy + 6);
  ctx.closePath();
  ctx.fill();

  // Crystal hem (pointes de glace au bas de la robe)
  for(let i = -3; i <= 3; i++){
    const xpos = sx + i * 4 + flowOffset * 0.5;
    const ypos = sy + 14;
    const hpulse = 0.7 + Math.sin(t * 0.1 + i) * 0.3;
    ctx.fillStyle = p.iceRing;
    ctx.beginPath();
    ctx.moveTo(xpos - 1.5, ypos);
    ctx.lineTo(xpos, ypos + 4);
    ctx.lineTo(xpos + 1.5, ypos);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = `rgba(255,255,255,${hpulse})`;
    ctx.fillRect(xpos - 0.5, ypos + 1, 1, 2);
  }

  // Robe folds (vertical lines)
  ctx.strokeStyle = p.robeAccent;
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(sx - 8, sy + 12); ctx.lineTo(sx - 6, sy - 6);
  ctx.moveTo(sx, sy + 13); ctx.lineTo(sx, sy - 6);
  ctx.moveTo(sx + 8, sy + 12); ctx.lineTo(sx + 6, sy - 6);
  ctx.stroke();

  // === TORSO (robe corsage) ===
  ctx.fillStyle = p.robeShade;
  ctx.fillRect(sx - 11, sy - 24, 22, 18);
  ctx.fillStyle = p.robe;
  ctx.fillRect(sx - 11, sy - 24, 22, 16);
  ctx.fillStyle = p.iceOuter;
  ctx.fillRect(sx - 11, sy - 24, 3, 18);

  // Decorative panels on chest
  ctx.fillStyle = p.robeShade;
  ctx.fillRect(sx - 10, sy - 22, 6, 14);
  ctx.fillRect(sx + 4, sy - 22, 6, 14);

  // Frost veins on robe
  ctx.strokeStyle = p.iceRing;
  ctx.lineWidth = 0.6;
  ctx.beginPath();
  ctx.moveTo(sx - 8, sy - 20); ctx.lineTo(sx - 6, sy - 14); ctx.lineTo(sx - 8, sy - 9);
  ctx.moveTo(sx + 8, sy - 20); ctx.lineTo(sx + 6, sy - 14); ctx.lineTo(sx + 8, sy - 9);
  ctx.stroke();

  // === ICE HEART on chest (THE focal point — counterpoint to inferno boss) ===
  // Outer ring (cyan)
  ctx.fillStyle = p.iceRing;
  ctx.beginPath();
  ctx.arc(sx, sy - 18, 6, 0, Math.PI * 2);
  ctx.fill();
  // Mid (dark inner ring)
  ctx.fillStyle = '#0a1418';
  ctx.beginPath();
  ctx.arc(sx, sy - 18, 5, 0, Math.PI * 2);
  ctx.fill();
  // Heart core (white-cyan)
  const corePulse = 0.9 + Math.sin(t * 0.08) * 0.1 + heartFlare * 0.2;
  ctx.fillStyle = `rgba(174,230,255,${corePulse})`;
  ctx.beginPath();
  ctx.arc(sx, sy - 18, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = `rgba(255,255,255,${corePulse})`;
  ctx.beginPath();
  ctx.arc(sx, sy - 18, 2.5, 0, Math.PI * 2);
  ctx.fill();
  // Tiny rotating ice particles
  for(let i = 0; i < 3; i++){
    const angle = (i / 3) * Math.PI * 2 + t * 0.04;
    const x = sx + Math.cos(angle) * 3;
    const y = sy - 18 + Math.sin(angle) * 3;
    ctx.fillStyle = `rgba(79,195,247,${corePulse})`;
    ctx.fillRect(Math.round(x), Math.round(y), 1, 1);
  }
  // Cross beams (snowflake)
  ctx.strokeStyle = `rgba(174,230,255,${corePulse * 0.6})`;
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(sx - 8, sy - 18); ctx.lineTo(sx + 8, sy - 18);
  ctx.moveTo(sx, sy - 26); ctx.lineTo(sx, sy - 10);
  // Diagonals
  ctx.moveTo(sx - 6, sy - 24); ctx.lineTo(sx + 6, sy - 12);
  ctx.moveTo(sx + 6, sy - 24); ctx.lineTo(sx - 6, sy - 12);
  ctx.stroke();

  // === SLEEVES ===
  // Left sleeve
  ctx.save();
  ctx.translate(sx - 11, sy - 23);
  ctx.rotate(armRaise);
  ctx.fillStyle = p.robeShade;
  ctx.beginPath();
  ctx.moveTo(-3, 0);
  ctx.lineTo(2, 0);
  ctx.lineTo(4, 16);
  ctx.lineTo(-5, 16);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = p.robe;
  ctx.fillRect(-2, 0, 2, 14);
  // Hand (gantée blanc)
  ctx.fillStyle = p.iceOuter;
  ctx.fillRect(-1, 16, 4, 4);
  // Ice spiral around hand
  drawHandIce(ctx, 1, 20, t, 1, p);
  ctx.restore();

  // Right sleeve
  ctx.save();
  ctx.translate(sx + 11, sy - 23);
  ctx.rotate(-armRaise);
  ctx.fillStyle = p.robeShade;
  ctx.beginPath();
  ctx.moveTo(-2, 0);
  ctx.lineTo(3, 0);
  ctx.lineTo(5, 16);
  ctx.lineTo(-4, 16);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = p.robe;
  ctx.fillRect(0, 0, 2, 14);
  ctx.fillStyle = p.iceOuter;
  ctx.fillRect(-1, 16, 4, 4);
  drawHandIce(ctx, 1, 20, t + 60, 1, p);
  ctx.restore();

  // === HEAD ===
  // Face
  ctx.fillStyle = p.skinShade;
  ctx.fillRect(sx - 5, sy - 38, 10, 11);
  ctx.fillStyle = p.skin;
  ctx.fillRect(sx - 5, sy - 38, 10, 9);
  ctx.fillStyle = p.iceOuter;
  ctx.fillRect(sx - 5, sy - 38, 2, 11);

  // Hair (long, descends de chaque côté)
  ctx.fillStyle = p.hair;
  ctx.fillRect(sx - 7, sy - 38, 2, 14);
  ctx.fillRect(sx + 5, sy - 38, 2, 14);
  ctx.fillStyle = p.hairLight;
  ctx.fillRect(sx - 7, sy - 38, 1, 14);

  // Eyes (cyan)
  ctx.fillStyle = '#000';
  ctx.fillRect(sx - 4, sy - 33, 3, 2);
  ctx.fillRect(sx + 1, sy - 33, 3, 2);
  const eyePulse = 0.92 + Math.sin(t * 0.09) * 0.08;
  ctx.fillStyle = `rgba(79,195,247,${eyePulse})`;
  ctx.fillRect(sx - 3, sy - 32, 1, 1);
  ctx.fillRect(sx + 2, sy - 32, 1, 1);
  ctx.fillStyle = `rgba(255,255,255,${eyePulse})`;
  ctx.fillRect(sx - 3, sy - 32, 0.5, 0.5);

  // Lips
  ctx.fillStyle = p.iceRing;
  ctx.fillRect(sx - 2, sy - 29, 4, 1);

  // === CROWN OF ICE (acérée, pointes hautes) ===
  drawIceCrown(ctx, sx, sy - 38, t, p);

  // Phase 2 indicator : second ring of ice spikes around crown
  if(phase2 > 0){
    for(let i = 0; i < 8; i++){
      const angle = (i / 8) * Math.PI * 2 + t * 0.02;
      const cx = sx + Math.cos(angle) * 14;
      const cy = sy - 42 + Math.sin(angle) * 4;
      const sw = 2.5 * phase2;
      const sh = 4 * phase2;
      ctx.fillStyle = p.iceRing;
      ctx.beginPath();
      ctx.moveTo(cx, cy - sh);
      ctx.lineTo(cx - sw / 2, cy);
      ctx.lineTo(cx + sw / 2, cy);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = p.iceCore;
      ctx.fillRect(Math.round(cx - 0.5), cy - sh + 1, 1, sh - 1);
    }
  }
}

function drawHandIce(ctx, lx, ly, t, scale, p){
  const r = 5 * scale;
  // Halo
  const grad = ctx.createRadialGradient(lx, ly, 0, lx, ly, r * 2);
  grad.addColorStop(0, `rgba(255,255,255,${0.85 * scale})`);
  grad.addColorStop(0.4, `rgba(174,230,255,${0.6 * scale})`);
  grad.addColorStop(1, 'rgba(79,195,247,0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(lx, ly, r * 2, 0, Math.PI * 2);
  ctx.fill();

  // Spiral ice particles
  for(let i = 0; i < 3; i++){
    const angle = (i / 3) * Math.PI * 2 + t * 0.08;
    const fx = lx + Math.cos(angle) * r;
    const fy = ly + Math.sin(angle) * r;
    ctx.fillStyle = p.iceCore;
    ctx.fillRect(Math.round(fx - 0.5), Math.round(fy - 0.5), 1, 1);
  }
  // Inner core
  ctx.fillStyle = p.iceCore;
  ctx.beginPath();
  ctx.arc(lx, ly, 1.5, 0, Math.PI * 2);
  ctx.fill();
}

function drawIceCrown(ctx, lx, ly, t, p){
  // Base band
  ctx.fillStyle = p.crownDark;
  ctx.fillRect(lx - 7, ly - 4, 14, 4);
  ctx.fillStyle = p.crown;
  ctx.fillRect(lx - 7, ly - 4, 14, 1);

  // Front central spike (largest)
  ctx.fillStyle = p.crownDark;
  ctx.beginPath();
  ctx.moveTo(lx, ly - 10);
  ctx.lineTo(lx - 2, ly - 4);
  ctx.lineTo(lx + 2, ly - 4);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = p.crown;
  ctx.beginPath();
  ctx.moveTo(lx, ly - 10);
  ctx.lineTo(lx, ly - 4);
  ctx.lineTo(lx + 2, ly - 4);
  ctx.closePath();
  ctx.fill();
  // Highlight
  ctx.fillStyle = p.crownCore;
  ctx.fillRect(lx - 0.5, ly - 9, 1, 4);

  // Side spikes (smaller)
  for(const side of [-1, 1]){
    for(let i = 1; i <= 3; i++){
      const sx = lx + side * (i * 1.8 + 0.5);
      const h = 7 - i * 1.5;
      ctx.fillStyle = p.crownDark;
      ctx.beginPath();
      ctx.moveTo(sx, ly - 4 - h);
      ctx.lineTo(sx - 1, ly - 4);
      ctx.lineTo(sx + 1, ly - 4);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = p.crown;
      ctx.beginPath();
      ctx.moveTo(sx, ly - 4 - h);
      ctx.lineTo(sx, ly - 4);
      ctx.lineTo(sx + 1, ly - 4);
      ctx.closePath();
      ctx.fill();
    }
  }

  // Crown jewel (gem at center base)
  const pulse = 0.85 + Math.sin(t * 0.1) * 0.15;
  ctx.fillStyle = `rgba(174,230,255,${pulse})`;
  ctx.fillRect(lx - 1, ly - 2, 2, 2);
  ctx.fillStyle = p.crownCore;
  ctx.fillRect(lx - 0.5, ly - 2, 1, 1);
}

export const attacks = {
  idle: {
    id: 'idle', name: 'IDLE', icon: '◇',
    duration: 9999, looping: true,
    description: 'Lévite. Cœur de glace pulsant blanc-bleu, robe qui flotte, spirales de glace permanentes aux mains, cape qui ondule.',
    phases: [{ from: 0, to: 9999, label: 'Loop' }],
    update(frame){
      const fx = [];
      if(frame % 18 === 0){
        fx.push({ type: 'ash', dx: 0, dy: -22, count: 1, color: '#aee6ff' });
      }
      if(frame % 10 === 0){
        fx.push({ type: 'ash', dx: -14, dy: 5, count: 1, color: '#e0f5ff' });
        fx.push({ type: 'ash', dx: 14, dy: 5, count: 1, color: '#e0f5ff' });
      }
      return { opts: {}, fx };
    },
  },

  blizzard: {
    id: 'blizzard', name: 'BLIZZARD', icon: '🌨',
    duration: 110,
    description: 'Tous les 5 tours : -2 PA pour le joueur pendant 1 tour. La Reine charge un vortex de glace, le projette en ligne. Tornade-projectile blanche.',
    phases: [
      { from: 0, to: 35, label: 'Charge' },
      { from: 35, to: 55, label: 'Project' },
      { from: 55, to: 85, label: 'Sustain' },
      { from: 85, to: 110, label: 'Recovery' },
    ],
    projectile: {
      spawnFrame: 35,
      spawnOffset: { dx: 0, dy: -18 },
      travelFrames: 22, // long voyage, c'est un blizzard
      arc: 4,
      drawProjectile(ctx, x, y, vx, vy, t){
        // Tornade-projectile : vortex blanc-cyan tourbillonnant
        const angle = Math.atan2(vy, vx);
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        // Outer halo
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, 18);
        grad.addColorStop(0, 'rgba(255,255,255,0.95)');
        grad.addColorStop(0.4, 'rgba(174,230,255,0.7)');
        grad.addColorStop(0.7, 'rgba(79,195,247,0.5)');
        grad.addColorStop(1, 'rgba(79,195,247,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(-18, -18, 36, 36);
        // Vortex spinning particles
        for(let i = 0; i < 8; i++){
          const ta = (i / 8) * Math.PI * 2 + t * 0.4;
          const rad = 4 + (i % 3) * 2;
          const px = Math.cos(ta) * rad;
          const py = Math.sin(ta) * rad * 0.7;
          ctx.fillStyle = `rgba(255,255,255,${0.85 - (i % 3) * 0.2})`;
          ctx.fillRect(Math.round(px - 0.5), Math.round(py - 0.5), 1.5, 1.5);
        }
        // Core ring
        ctx.strokeStyle = '#aee6ff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, 5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(0, 0, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      },
      trailColor: '#cef0ff',
      onHit: {
        flash: '#fff', flashSize: 30,
        sparks: 26, color: '#aee6ff',
        shockwave: '#4fc3f7', shockwaveRadius: 50,
        ash: 14, color: '#e0f5ff',
      },
    },
    update(frame){
      const opts = {};
      const fx = [];
      if(frame < 35){
        const p = frame / 35;
        opts.armRaise = -0.5 - p * 1.0;
        opts.heartFlare = p;
        if(frame % 4 === 0){
          fx.push({ type: 'sparks', dx: 0, dy: -18, count: 2, color: '#aee6ff' });
        }
        if(frame > 22 && frame % 3 === 0){
          fx.push({ type: 'sparks', dx: 0, dy: -8, count: 1, color: '#fff' });
        }
      } else if(frame < 55){
        opts.armRaise = -1.5;
        opts.heartFlare = 1 - (frame - 35) / 20;
        if(frame === 35){
          fx.push({ type: 'flash', dx: 0, dy: -18, color: '#fff', size: 28 });
          fx.push({ type: 'shockwave', dx: 0, dy: -10, color: '#aee6ff', maxRadius: 42 });
          fx.push({
            type: 'projectile',
            dx: 0, dy: -18,
            useAttackProjectile: 'blizzard',
          });
        }
      } else if(frame < 85){
        opts.armRaise = -1.5 + ((frame - 55) / 30) * 1.0;
        opts.heartFlare = 0;
        // Secondary waves at impact location
        if(frame === 60){
          fx.push({ type: 'shockwave', dx: 0, dy: 0, color: '#aee6ff', maxRadius: 38, useTargetPosition: true });
        }
        if(frame === 68){
          fx.push({ type: 'shockwave', dx: 0, dy: 0, color: '#4fc3f7', maxRadius: 28, useTargetPosition: true });
        }
      } else {
        opts.armRaise = -0.5;
      }
      return { opts, fx };
    },
  },

  iceWall: {
    id: 'iceWall', name: 'ICE WALL (P2)', icon: '🛡',
    duration: 95,
    description: 'À 50% HP : invoque 2 Glaciers Vivants comme bouclier. Couronne secondaire de cristal apparaît, glyphes au sol manifestent les Glaciers.',
    phases: [
      { from: 0, to: 30, label: 'Phase shift' },
      { from: 30, to: 65, label: 'Glyphs' },
      { from: 65, to: 95, label: 'Manifest' },
    ],
    update(frame){
      const opts = { armRaise: -1.0 };
      const fx = [];
      if(frame < 30){
        const p = frame / 30;
        opts.phase2 = p;
        opts.heartFlare = p * 0.7;
        if(frame === 0){
          fx.push({ type: 'flash', dx: 0, dy: -36, color: '#aee6ff', size: 30 });
          fx.push({ type: 'shockwave', dx: 0, dy: -10, color: '#4fc3f7', maxRadius: 50 });
        }
      } else if(frame < 65){
        opts.phase2 = 1;
        opts.heartFlare = 0.7;
        if(frame % 3 === 0){
          fx.push({ type: 'sparks', dx: -22, dy: 12, count: 1, color: '#aee6ff' });
          fx.push({ type: 'sparks', dx: 22, dy: 12, count: 1, color: '#aee6ff' });
        }
        if(frame === 30){
          fx.push({ type: 'shockwave', dx: -22, dy: 12, color: '#4fc3f7', maxRadius: 26 });
          fx.push({ type: 'shockwave', dx: 22, dy: 12, color: '#4fc3f7', maxRadius: 26 });
        }
      } else {
        opts.phase2 = 1;
        opts.heartFlare = 0.5;
        if(frame === 65){
          fx.push({ type: 'flash', dx: -22, dy: 8, color: '#fff', size: 22 });
          fx.push({ type: 'flash', dx: 22, dy: 8, color: '#fff', size: 22 });
          fx.push({ type: 'sparks', dx: -22, dy: 8, count: 14, color: '#aee6ff' });
          fx.push({ type: 'sparks', dx: 22, dy: 8, count: 14, color: '#aee6ff' });
        }
      }
      return { opts, fx };
    },
  },

  teleport: {
    id: 'teleport', name: 'TELEPORT', icon: '✦',
    duration: 65,
    description: 'Disparaît en flocons de glace, réapparaît à distance. Robe se compresse, vortex blanc, flash, recomposition.',
    phases: [
      { from: 0, to: 25, label: 'Dissolve' },
      { from: 25, to: 35, label: 'Void' },
      { from: 35, to: 65, label: 'Reform' },
    ],
    update(frame){
      const opts = {};
      const fx = [];
      if(frame < 25){
        const p = frame / 25;
        opts.robeFlow = 1 - p;
        opts.heartFlare = p * 0.8;
        if(frame % 2 === 0){
          fx.push({
            type: 'ash',
            dx: (Math.random() - 0.5) * 26,
            dy: -10 + (Math.random() - 0.5) * 32,
            count: 2,
            color: '#aee6ff',
          });
        }
        if(frame === 24){
          fx.push({ type: 'flash', dx: 0, dy: -18, color: '#fff', size: 30 });
          fx.push({ type: 'shockwave', dx: 0, dy: -10, color: '#aee6ff', maxRadius: 36 });
        }
      } else if(frame < 35){
        opts.robeFlow = 0;
        opts.heartFlare = 0;
        opts.bodyShift = 999;
      } else {
        const p = (frame - 35) / 30;
        opts.robeFlow = p;
        opts.heartFlare = (1 - p) * 0.6;
        opts.bodyShift = 0;
        if(frame === 35){
          fx.push({ type: 'flash', dx: 0, dy: -18, color: '#fff', size: 28 });
          fx.push({ type: 'sparks', dx: 0, dy: -10, count: 22, color: '#cef0ff' });
        }
      }
      return { opts, fx };
    },
  },
};

export const meta = { width: 40, height: 70, groundOffsetY: -6 };
export default { draw, attacks, palette, meta };
