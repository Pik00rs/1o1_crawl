// src/js/render/enemies/voidnet_corrupter.js
// Corrupteur — caster ranged.
// Silhouette pâle violette, mains ouvertes lançant des glyphes de corruption,
// aura magenta. Pas d'arme, magie pure.

export const palette = {
  robe:        '#3a1848',
  robeDark:    '#1a0828',
  robeLight:   '#6a3878',
  flesh:       '#a888b8',
  fleshDark:   '#583868',
  magenta:     '#ff40c0',
  magentaCore: '#ffc0e8',
  magentaDark: '#9a2868',
  glyph:       '#ff40c0',
  glyphCore:   '#ffe0ff',
  void:        '#0a0a18',
  shadow:      'rgba(30,10,30,0.7)',
};

export function draw(ctx, sx, sy, t, opts){
  opts = opts || {};
  const p = palette;
  const float = Math.sin(t * 0.04) * 1.0;
  const breathe = Math.sin(t * 0.03) * 0.4;
  sx = Math.round(sx + (opts.bodyShift || 0));
  sy = Math.round(sy + float);

  const armSpread = opts.armSpread !== undefined ? opts.armSpread : 0.4;
  const charging = opts.charging || 0;
  const glyphScale = opts.glyphScale !== undefined ? opts.glyphScale : 1;

  // Shadow
  ctx.fillStyle = p.shadow;
  ctx.beginPath();
  ctx.ellipse(sx, sy + 6, 11, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Magenta glow halo
  const glow = 0.4 + charging * 0.4 + Math.sin(t * 0.07) * 0.1;
  const bg = ctx.createRadialGradient(sx, sy - 12, 4, sx, sy - 12, 28);
  bg.addColorStop(0, `rgba(255,64,192,${glow * 0.5})`);
  bg.addColorStop(1, 'rgba(255,64,192,0)');
  ctx.fillStyle = bg;
  ctx.fillRect(sx - 28, sy - 40, 56, 50);

  // Orbiting glyphs around the corrupter
  drawOrbitingGlyphs(ctx, sx, sy - 12, t, glyphScale, p);

  // Robe (longue, descend)
  ctx.fillStyle = p.robeDark;
  ctx.beginPath();
  ctx.moveTo(sx - 9, sy + 5);
  ctx.lineTo(sx + 9, sy + 5);
  ctx.lineTo(sx + 7, sy - 14 + breathe);
  ctx.lineTo(sx - 7, sy - 14 + breathe);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = p.robe;
  ctx.fillRect(sx - 7, sy - 14 + breathe, 14, 19);
  ctx.fillStyle = p.robeLight;
  ctx.fillRect(sx - 7, sy - 14 + breathe, 2, 19);

  // Magenta trim
  ctx.fillStyle = p.magenta;
  ctx.fillRect(sx - 8, sy + 4, 16, 1);
  ctx.fillStyle = p.magentaCore;
  ctx.fillRect(sx - 6, sy + 4, 12, 0.5);

  // Belt with magenta gem
  ctx.fillStyle = p.void;
  ctx.fillRect(sx - 8, sy - 4 + breathe, 16, 2);
  const gemPulse = 0.85 + Math.sin(t * 0.1) * 0.15;
  ctx.fillStyle = `rgba(255,64,192,${gemPulse})`;
  ctx.fillRect(sx - 1, sy - 4 + breathe, 3, 2);
  ctx.fillStyle = `rgba(255,224,255,${gemPulse})`;
  ctx.fillRect(sx, sy - 4 + breathe, 1, 1);

  // === ARMS spread out (mains ouvertes pour caster) ===
  // Left arm
  ctx.save();
  ctx.translate(sx - 7, sy - 13 + breathe);
  ctx.rotate(-armSpread);
  ctx.fillStyle = p.robeDark;
  ctx.fillRect(-2, 0, 4, 12);
  ctx.fillStyle = p.robe;
  ctx.fillRect(-2, 0, 1, 12);
  // Open hand (palm facing forward)
  ctx.fillStyle = p.fleshDark;
  ctx.fillRect(-3, 12, 5, 4);
  ctx.fillStyle = p.flesh;
  ctx.fillRect(-3, 12, 5, 3);
  // Glyph forming in palm
  if(charging > 0){
    drawHandGlyph(ctx, 0, 14, t, charging, p);
  }
  ctx.restore();

  // Right arm
  ctx.save();
  ctx.translate(sx + 7, sy - 13 + breathe);
  ctx.rotate(armSpread);
  ctx.fillStyle = p.robeDark;
  ctx.fillRect(-2, 0, 4, 12);
  ctx.fillStyle = p.robe;
  ctx.fillRect(0, 0, 1, 12);
  ctx.fillStyle = p.fleshDark;
  ctx.fillRect(-2, 12, 5, 4);
  ctx.fillStyle = p.flesh;
  ctx.fillRect(-2, 12, 5, 3);
  if(charging > 0){
    drawHandGlyph(ctx, 0, 14, t + 60, charging, p);
  }
  ctx.restore();

  // === HEAD : hood shadowing the face ===
  ctx.fillStyle = p.robeDark;
  ctx.beginPath();
  ctx.moveTo(sx - 8, sy - 14 + breathe);
  ctx.lineTo(sx + 8, sy - 14 + breathe);
  ctx.lineTo(sx + 7, sy - 26 + breathe);
  ctx.lineTo(sx + 4, sy - 30 + breathe);
  ctx.lineTo(sx - 4, sy - 30 + breathe);
  ctx.lineTo(sx - 7, sy - 26 + breathe);
  ctx.closePath();
  ctx.fill();

  // Hood inside (very dark)
  ctx.fillStyle = p.void;
  ctx.fillRect(sx - 5, sy - 27 + breathe, 10, 11);

  // Pale face barely visible
  ctx.fillStyle = p.fleshDark;
  ctx.fillRect(sx - 4, sy - 24 + breathe, 8, 7);
  ctx.fillStyle = p.flesh;
  ctx.fillRect(sx - 4, sy - 24 + breathe, 8, 5);

  // Eyes (magenta, intense)
  ctx.fillStyle = '#000';
  ctx.fillRect(sx - 3, sy - 22 + breathe, 2, 2);
  ctx.fillRect(sx + 1, sy - 22 + breathe, 2, 2);
  const eyePulse = 0.92 + Math.sin(t * 0.09) * 0.08;
  ctx.fillStyle = `rgba(255,64,192,${eyePulse})`;
  ctx.fillRect(sx - 3, sy - 22 + breathe, 1, 1);
  ctx.fillRect(sx + 1, sy - 22 + breathe, 1, 1);
  ctx.fillStyle = `rgba(255,255,255,${eyePulse})`;
  ctx.fillRect(sx - 3, sy - 22 + breathe, 0.5, 0.5);
  ctx.fillRect(sx + 1, sy - 22 + breathe, 0.5, 0.5);

  // Hood top accent
  ctx.fillStyle = p.magenta;
  ctx.fillRect(sx - 1, sy - 30 + breathe, 2, 1);
}

function drawOrbitingGlyphs(ctx, lx, ly, t, scale, p){
  // 4 small glyphs orbiting around the corrupter
  for(let i = 0; i < 4; i++){
    const angle = (i / 4) * Math.PI * 2 + t * 0.04;
    const r = 16;
    const gx = lx + Math.cos(angle) * r;
    const gy = ly + Math.sin(angle) * r * 0.6 - 4;
    const pulse = 0.85 + Math.sin(t * 0.1 + i) * 0.15;
    // Halo
    ctx.fillStyle = `rgba(255,64,192,${pulse * 0.4 * scale})`;
    ctx.fillRect(Math.round(gx - 2 * scale), Math.round(gy - 2 * scale), Math.round(4 * scale), Math.round(4 * scale));
    // Glyph (small rune)
    ctx.fillStyle = p.magenta;
    ctx.fillRect(Math.round(gx - 1 * scale), Math.round(gy - 1 * scale), Math.round(2 * scale), Math.round(2 * scale));
    ctx.fillStyle = p.glyphCore;
    ctx.fillRect(Math.round(gx), Math.round(gy), 1, 1);
  }
}

function drawHandGlyph(ctx, lx, ly, t, intensity, p){
  const r = 4 * intensity;
  // Halo
  const grad = ctx.createRadialGradient(lx, ly, 0, lx, ly, r * 2.5);
  grad.addColorStop(0, `rgba(255,224,255,${intensity * 0.85})`);
  grad.addColorStop(0.5, `rgba(255,64,192,${intensity * 0.6})`);
  grad.addColorStop(1, 'rgba(255,64,192,0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(lx, ly, r * 2.5, 0, Math.PI * 2);
  ctx.fill();
  // Spinning glyph (triangle)
  const rot = t * 0.1;
  ctx.save();
  ctx.translate(lx, ly);
  ctx.rotate(rot);
  ctx.strokeStyle = p.magenta;
  ctx.lineWidth = 1;
  ctx.beginPath();
  for(let i = 0; i < 3; i++){
    const angle = (i / 3) * Math.PI * 2 - Math.PI / 2;
    const x = Math.cos(angle) * r;
    const y = Math.sin(angle) * r;
    if(i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
  // Bright core
  ctx.fillStyle = p.glyphCore;
  ctx.fillRect(Math.round(lx - 0.5), Math.round(ly - 0.5), 1, 1);
}

export const attacks = {
  idle: {
    id: 'idle', name: 'IDLE', icon: '◇',
    duration: 9999, looping: true,
    description: 'Lévite, glyphes orbitent autour, capuche cache visage, yeux magenta brillants.',
    phases: [{ from: 0, to: 9999, label: 'Loop' }],
    update(frame){
      const fx = [];
      if(frame % 22 === 0){
        fx.push({ type: 'ash', dx: 0, dy: -22, count: 1, color: '#ff40c0' });
      }
      return { opts: { glyphScale: 1 }, fx };
    },
  },

  markGlyph: {
    id: 'markGlyph', name: 'MARK GLYPH', icon: '✦',
    duration: 75,
    description: 'Lance un glyphe de corruption qui s\'attache à la cible. Range 4. 30% Marked (+25% damage). 30% Shock.',
    phases: [
      { from: 0, to: 28, label: 'Charge' },
      { from: 28, to: 38, label: 'Cast' },
      { from: 38, to: 75, label: 'Recovery' },
    ],
    projectile: {
      spawnFrame: 28,
      spawnOffset: { dx: 0, dy: -12 },
      travelFrames: 16,
      drawProjectile(ctx, x, y, vx, vy, t){
        const rot = t * 0.15;
        ctx.save();
        ctx.translate(x, y);
        // Halo
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, 13);
        grad.addColorStop(0, 'rgba(255,224,255,0.85)');
        grad.addColorStop(0.4, 'rgba(255,64,192,0.7)');
        grad.addColorStop(1, 'rgba(255,64,192,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(-13, -13, 26, 26);
        // Glyph (rotating sigil — 6-pointed star)
        ctx.rotate(rot);
        ctx.strokeStyle = '#ff40c0';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for(let i = 0; i < 6; i++){
          const angle = (i / 6) * Math.PI * 2;
          const x2 = Math.cos(angle) * 6;
          const y2 = Math.sin(angle) * 6;
          if(i === 0) ctx.moveTo(x2, y2);
          else ctx.lineTo(x2, y2);
        }
        ctx.closePath();
        ctx.stroke();
        // Inner triangle (counter-rotating)
        ctx.rotate(-rot * 2);
        ctx.strokeStyle = '#ffc0e8';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for(let i = 0; i < 3; i++){
          const angle = (i / 3) * Math.PI * 2;
          const x2 = Math.cos(angle) * 3;
          const y2 = Math.sin(angle) * 3;
          if(i === 0) ctx.moveTo(x2, y2);
          else ctx.lineTo(x2, y2);
        }
        ctx.closePath();
        ctx.stroke();
        // Core
        ctx.fillStyle = '#fff';
        ctx.fillRect(-1, -1, 2, 2);
        ctx.restore();
      },
      trailColor: '#ff40c0',
      onHit: {
        flash: '#ffc0e8', flashSize: 18,
        sparks: 14, color: '#ff40c0',
        shockwave: '#9a2868', shockwaveRadius: 30,
      },
    },
    update(frame){
      const opts = {};
      const fx = [];
      if(frame < 28){
        const p = frame / 28;
        opts.armSpread = 0.4 + p * 0.5;
        opts.charging = p;
        opts.glyphScale = 1 + p * 0.5;
        if(frame % 4 === 0){
          fx.push({ type: 'sparks', dx: -8, dy: -10, count: 1, color: '#ff40c0' });
          fx.push({ type: 'sparks', dx: 8, dy: -10, count: 1, color: '#ff40c0' });
        }
      } else if(frame < 38){
        opts.armSpread = 0.9;
        opts.charging = 1;
        opts.glyphScale = 0.5;
        if(frame === 28){
          fx.push({ type: 'flash', dx: 0, dy: -12, color: '#ffe0ff', size: 20 });
          fx.push({ type: 'sparks', dx: 0, dy: -12, count: 14, color: '#ff40c0' });
          fx.push({
            type: 'projectile',
            dx: 0, dy: -12,
            useAttackProjectile: 'markGlyph',
          });
        }
      } else {
        const p = (frame - 38) / 37;
        opts.armSpread = 0.9 - p * 0.5;
        opts.charging = Math.max(0, 1 - p);
        opts.glyphScale = 0.5 + p * 0.5;
      }
      return { opts, fx };
    },
  },

  walk: {
    id: 'walk', name: 'WALK', icon: '🏃',
    duration: 160,
    looping: true,
    description: 'Lévitation glissée. Aller-retour 80/80. Glyphes continuent d\'orbiter.',
    phases: [
      { from: 0, to: 80, label: 'Recul' },
      { from: 80, to: 160, label: 'Retour' },
    ],
    update(frame){
      const opts = { glyphScale: 1 };
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
        fx.push({ type: 'ash', dx: 0, dy: 6, count: 1, color: '#ff40c0' });
      }
      return { opts, fx };
    },
  },
};

export const meta = { width: 22, height: 38, groundOffsetY: 0 };
export default { draw, attacks, palette, meta };
