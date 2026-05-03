// src/js/render/enemies/cryo_caster.js
// Cryomancien — caster ranged.
// Médecin cryogénique en robe blanche-bleue, masque chirurgical gelé,
// orbe de glace flottant, yeux cyan.

export const palette = {
  robe:        '#a0c0d8',  // robe blanc-bleu
  robeDark:    '#5a7898',
  robeLight:   '#d0e4f0',
  hood:        '#7898b0',
  hoodEdge:    '#3a5878',
  mask:        '#e0f5ff',  // masque chirurgical
  maskDark:    '#a0c0d8',
  glove:       '#3a4858',
  ice:         '#aee6ff',
  iceHot:      '#e0f5ff',
  iceCore:     '#fff',
  iceDark:     '#4fc3f7',
  shadow:      'rgba(20,40,60,0.7)',
};

export function draw(ctx, sx, sy, t, opts){
  opts = opts || {};
  const p = palette;
  const float = Math.sin(t * 0.05) * 0.7;
  const breathe = Math.sin(t * 0.04) * 0.3;
  sx = Math.round(sx + (opts.bodyShift || 0));
  sy = Math.round(sy + float);

  const armRaise = opts.armRaise !== undefined ? opts.armRaise : -0.4;
  const orbSize = (opts.orbSize !== undefined ? opts.orbSize : 1) * (0.85 + Math.sin(t * 0.1) * 0.15);
  const glowBoost = opts.glowBoost || 0;

  // Shadow
  ctx.fillStyle = p.shadow;
  ctx.beginPath();
  ctx.ellipse(sx, sy + 6, 11, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Cyan glow halo (perma)
  const glow = 0.3 + glowBoost * 0.5 + Math.sin(t * 0.06) * 0.1;
  const bg = ctx.createRadialGradient(sx, sy - 14, 4, sx, sy - 14, 28);
  bg.addColorStop(0, `rgba(174,230,255,${glow})`);
  bg.addColorStop(1, 'rgba(174,230,255,0)');
  ctx.fillStyle = bg;
  ctx.fillRect(sx - 28, sy - 42, 56, 50);

  // Robe bottom (s'évase)
  ctx.fillStyle = p.robeDark;
  ctx.beginPath();
  ctx.moveTo(sx - 9, sy + 5);
  ctx.lineTo(sx + 9, sy + 5);
  ctx.lineTo(sx + 7, sy - 15 + breathe);
  ctx.lineTo(sx - 7, sy - 15 + breathe);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = p.robe;
  ctx.fillRect(sx - 7, sy - 15 + breathe, 14, 20);

  // Robe folds
  ctx.strokeStyle = p.robeLight;
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(sx - 4, sy - 12 + breathe); ctx.lineTo(sx - 4, sy + 4);
  ctx.moveTo(sx, sy - 12 + breathe); ctx.lineTo(sx, sy + 4);
  ctx.moveTo(sx + 4, sy - 12 + breathe); ctx.lineTo(sx + 4, sy + 4);
  ctx.stroke();

  // Belt with cyan accent
  ctx.fillStyle = p.iceDark;
  ctx.fillRect(sx - 8, sy - 5 + breathe, 16, 1);

  // Sleeves (long)
  // Left sleeve (lifted with orb)
  ctx.save();
  ctx.translate(sx - 7, sy - 13 + breathe);
  ctx.rotate(armRaise * 0.6);
  ctx.fillStyle = p.robeDark;
  ctx.fillRect(-2, 0, 4, 12);
  ctx.fillStyle = p.robe;
  ctx.fillRect(-2, 0, 2, 12);
  // Glove (frozen)
  ctx.fillStyle = p.glove;
  ctx.fillRect(-2, 11, 4, 3);
  // Ice orb above the hand
  drawIceOrb(ctx, 0, 14, t, orbSize, p);
  ctx.restore();

  // Right sleeve (lower, holding spell focus)
  ctx.fillStyle = p.robeDark;
  ctx.fillRect(sx + 4, sy - 13 + breathe, 4, 13);
  ctx.fillStyle = p.robe;
  ctx.fillRect(sx + 7, sy - 13 + breathe, 1, 13);
  // Glove
  ctx.fillStyle = p.glove;
  ctx.fillRect(sx + 4, sy + 0 + breathe, 4, 3);
  // Small ice crystal between fingers
  ctx.fillStyle = p.iceHot;
  ctx.fillRect(sx + 5, sy + 3 + breathe, 1, 2);

  // Hood
  ctx.fillStyle = p.hood;
  ctx.beginPath();
  ctx.moveTo(sx - 9, sy - 14 + breathe);
  ctx.lineTo(sx + 9, sy - 14 + breathe);
  ctx.lineTo(sx + 8, sy - 26 + breathe);
  ctx.lineTo(sx + 4, sy - 30 + breathe);
  ctx.lineTo(sx - 4, sy - 30 + breathe);
  ctx.lineTo(sx - 8, sy - 26 + breathe);
  ctx.closePath();
  ctx.fill();

  // Hood edge
  ctx.fillStyle = p.hoodEdge;
  ctx.beginPath();
  ctx.moveTo(sx - 9, sy - 14 + breathe);
  ctx.lineTo(sx + 9, sy - 14 + breathe);
  ctx.lineTo(sx + 8, sy - 17 + breathe);
  ctx.lineTo(sx - 8, sy - 17 + breathe);
  ctx.closePath();
  ctx.fill();

  // Inner shadow of hood
  ctx.fillStyle = p.hoodEdge;
  ctx.fillRect(sx - 4, sy - 25 + breathe, 8, 9);

  // Surgical mask (gelé) — couvre le bas du visage
  ctx.fillStyle = p.maskDark;
  ctx.fillRect(sx - 5, sy - 20 + breathe, 10, 5);
  ctx.fillStyle = p.mask;
  ctx.fillRect(sx - 5, sy - 20 + breathe, 10, 3);
  // Mask straps (horizontal lines)
  ctx.fillStyle = p.iceDark;
  ctx.fillRect(sx - 5, sy - 18 + breathe, 10, 0.5);
  // Frost on mask
  ctx.fillStyle = p.iceCore;
  ctx.fillRect(sx - 4, sy - 19 + breathe, 1, 1);
  ctx.fillRect(sx + 3, sy - 19 + breathe, 1, 1);

  // Two glowing cyan eyes (above mask)
  const eyePulse = 0.85 + Math.sin(t * 0.08) * 0.15;
  ctx.fillStyle = `rgba(174,230,255,${eyePulse})`;
  ctx.fillRect(sx - 3, sy - 23 + breathe, 2, 2);
  ctx.fillRect(sx + 1, sy - 23 + breathe, 2, 2);
  ctx.fillStyle = `rgba(255,255,255,${eyePulse})`;
  ctx.fillRect(sx - 3, sy - 23 + breathe, 1, 1);
  ctx.fillRect(sx + 1, sy - 23 + breathe, 1, 1);

  // Ice crystals on hood (decoration)
  if(true){
    ctx.fillStyle = p.iceHot;
    ctx.fillRect(sx - 6, sy - 28 + breathe, 1, 2);
    ctx.fillRect(sx + 5, sy - 27 + breathe, 1, 2);
  }
}

function drawIceOrb(ctx, lx, ly, t, scale, p){
  if(scale <= 0) return;
  const r = 4 * scale;
  // Halo
  const grad = ctx.createRadialGradient(lx, ly, 0, lx, ly, r * 2.5);
  grad.addColorStop(0, `rgba(255,255,255,${0.95 * scale})`);
  grad.addColorStop(0.4, `rgba(174,230,255,${0.7 * scale})`);
  grad.addColorStop(1, 'rgba(79,195,247,0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(lx, ly, r * 2.5, 0, Math.PI * 2);
  ctx.fill();
  // Core
  ctx.fillStyle = p.iceDark;
  ctx.beginPath();
  ctx.arc(lx, ly, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = p.ice;
  ctx.beginPath();
  ctx.arc(lx, ly, r * 0.6, 0, Math.PI * 2);
  ctx.fill();
  // White center
  ctx.fillStyle = p.iceCore;
  ctx.fillRect(Math.round(lx - 0.5), Math.round(ly - 0.5), 1, 1);
  // Small rotating crystal facets
  for(let i = 0; i < 3; i++){
    const angle = (i / 3) * Math.PI * 2 + t * 0.06;
    const fx = lx + Math.cos(angle) * r * 0.7;
    const fy = ly + Math.sin(angle) * r * 0.7;
    ctx.fillStyle = `rgba(255,255,255,${scale * 0.8})`;
    ctx.fillRect(Math.round(fx), Math.round(fy), 1, 1);
  }
}

export const attacks = {
  idle: {
    id: 'idle', name: 'IDLE', icon: '◇',
    duration: 9999, looping: true,
    description: 'Lévite légèrement, orbe de glace pulsant en main, vapeur blanche s\'échappe du masque. Yeux cyan brillants.',
    phases: [{ from: 0, to: 9999, label: 'Loop' }],
    update(frame){
      const fx = [];
      if(frame % 24 === 0){
        fx.push({ type: 'ash', dx: 0, dy: -22, count: 1, color: '#e0f5ff' });
      }
      return { opts: {}, fx };
    },
  },

  iceShard: {
    id: 'iceShard', name: 'ICE SHARD', icon: '❄',
    duration: 65,
    description: 'Lance un éclat de glace tranchant. Range 4. 60% chance d\'appliquer Chill prolongé. 10% chance Frozen 1 tour.',
    phases: [
      { from: 0, to: 22, label: 'Charge' },
      { from: 22, to: 32, label: 'Cast' },
      { from: 32, to: 65, label: 'Recovery' },
    ],
    projectile: {
      spawnFrame: 22,
      spawnOffset: { dx: 0, dy: -10 },
      travelFrames: 16,
      drawProjectile(ctx, x, y, vx, vy, t){
        const angle = Math.atan2(vy, vx);
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        // Halo cyan
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, 10);
        grad.addColorStop(0, 'rgba(255,255,255,0.95)');
        grad.addColorStop(0.4, 'rgba(174,230,255,0.85)');
        grad.addColorStop(1, 'rgba(79,195,247,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(-10, -10, 20, 20);
        // Shard body (losange pointu)
        ctx.fillStyle = '#4fc3f7';
        ctx.beginPath();
        ctx.moveTo(-5, 0);
        ctx.lineTo(0, -2);
        ctx.lineTo(6, 0);
        ctx.lineTo(0, 2);
        ctx.closePath();
        ctx.fill();
        // Bright facet
        ctx.fillStyle = '#aee6ff';
        ctx.beginPath();
        ctx.moveTo(-5, 0);
        ctx.lineTo(0, -2);
        ctx.lineTo(6, 0);
        ctx.closePath();
        ctx.fill();
        // White core
        ctx.fillStyle = '#fff';
        ctx.fillRect(-1, -1, 3, 1);
        ctx.restore();
      },
      trailColor: '#aee6ff',
      onHit: {
        flash: '#e0f5ff', flashSize: 13,
        sparks: 10, color: '#aee6ff',
      },
    },
    update(frame){
      const opts = {};
      const fx = [];
      if(frame < 22){
        const p = frame / 22;
        opts.armRaise = -0.4 - p * 0.7;
        opts.orbSize = 1 + p * 0.6;
        opts.glowBoost = p * 0.5;
        if(frame % 4 === 0){
          fx.push({ type: 'sparks', dx: -7, dy: 0, count: 1, color: '#aee6ff' });
        }
      } else if(frame < 32){
        opts.armRaise = -1.1;
        opts.orbSize = 0.4;
        opts.glowBoost = 1;
        if(frame === 22){
          fx.push({ type: 'flash', dx: 0, dy: -10, color: '#e0f5ff', size: 14 });
          fx.push({ type: 'sparks', dx: 0, dy: -10, count: 8, color: '#aee6ff' });
          fx.push({
            type: 'projectile',
            dx: 0, dy: -10,
            useAttackProjectile: 'iceShard',
          });
        }
      } else {
        const p = (frame - 32) / 33;
        opts.armRaise = -1.1 + 0.7 * p;
        opts.orbSize = 0.4 + 0.6 * p;
        opts.glowBoost = Math.max(0, 1 - p);
      }
      return { opts, fx };
    },
  },

  walk: {
    id: 'walk', name: 'WALK', icon: '🏃',
    duration: 160,
    looping: true,
    description: 'Recule pour maintenir distance puis revient (boucle). Robe qui flotte, traînée de givre.',
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
      opts.bodyShift += Math.sin(frame * 0.18) * 0.3;
      if(frame % 18 === 0){
        fx.push({ type: 'ash', dx: 0, dy: 6, count: 2, color: '#aee6ff' });
      }
      return { opts, fx };
    },
  },
};

export const meta = { width: 22, height: 38, groundOffsetY: 0 };
export default { draw, attacks, palette, meta };
