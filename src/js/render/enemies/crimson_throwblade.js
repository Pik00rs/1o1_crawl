// src/js/render/enemies/crimson_throwblade.js
// Lanceur de Lames — caster ranged.
// Silhouette mince, bandolier en X de lames de jet sur le torse,
// position lateral throw. Range 5.

export const palette = {
  skin:        '#a87858',
  skinDark:    '#5a3818',
  skinLight:   '#c89878',
  shirt:       '#5a1818',
  shirtDark:   '#2a0808',
  shirtLight:  '#8a3838',
  pants:       '#3a1a08',
  pantsDark:   '#1a0a05',
  bandolier:   '#3a1808',
  bandolierLt: '#5a2818',
  bladeMetal:  '#9a8868',
  bladeEdge:   '#d8c8a0',
  bladeRust:   '#6a3818',
  blood:       '#8a1818',
  bloodBright: '#c82828',
  bronze:      '#c8a040',
  shadow:      'rgba(20,5,5,0.8)',
};

export function draw(ctx, sx, sy, t, opts){
  opts = opts || {};
  const p = palette;
  const bob = Math.sin(t * 0.05) * 0.6;
  const breathe = Math.sin(t * 0.04) * 0.3;
  sx = Math.round(sx + (opts.bodyShift || 0));
  sy = Math.round(sy + bob);

  const armRaise = opts.armRaise !== undefined ? opts.armRaise : -0.3;
  const charging = opts.charging || 0;

  // Shadow
  ctx.fillStyle = p.shadow;
  ctx.beginPath();
  ctx.ellipse(sx, sy + 7, 11, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Soft red glow
  const glow = 0.3 + charging * 0.3 + Math.sin(t * 0.06) * 0.1;
  const bg = ctx.createRadialGradient(sx, sy - 14, 4, sx, sy - 14, 26);
  bg.addColorStop(0, `rgba(138,24,24,${glow * 0.4})`);
  bg.addColorStop(1, 'rgba(138,24,24,0)');
  ctx.fillStyle = bg;
  ctx.fillRect(sx - 26, sy - 38, 52, 50);

  // Legs (slim pants)
  ctx.fillStyle = p.pantsDark;
  ctx.fillRect(sx - 6, sy - 1, 5, 9);
  ctx.fillRect(sx + 1, sy - 1, 5, 9);
  ctx.fillStyle = p.pants;
  ctx.fillRect(sx - 6, sy - 1, 1, 9);

  // Boots (light, mobile)
  ctx.fillStyle = '#000';
  ctx.fillRect(sx - 7, sy + 8, 6, 3);
  ctx.fillRect(sx + 1, sy + 8, 6, 3);

  // Belt with extra blade pouches
  ctx.fillStyle = p.bandolier;
  ctx.fillRect(sx - 7, sy - 4 + breathe, 14, 2);
  // Small blade pouches on belt
  ctx.fillStyle = p.bandolierLt;
  ctx.fillRect(sx - 6, sy - 3 + breathe, 2, 1);
  ctx.fillRect(sx + 4, sy - 3 + breathe, 2, 1);
  // Tiny blade tips poking out
  ctx.fillStyle = p.bladeMetal;
  ctx.fillRect(sx - 5, sy - 5 + breathe, 1, 1);
  ctx.fillRect(sx + 5, sy - 5 + breathe, 1, 1);

  // === TORSO (slim shirt) ===
  ctx.fillStyle = p.shirtDark;
  ctx.fillRect(sx - 7, sy - 18 + breathe, 14, 16);
  ctx.fillStyle = p.shirt;
  ctx.fillRect(sx - 7, sy - 18 + breathe, 14, 14);
  ctx.fillStyle = p.shirtLight;
  ctx.fillRect(sx - 7, sy - 18 + breathe, 2, 16);

  // === BANDOLIER X-CROSS (signature) with blades ===
  drawBandolierWithBlades(ctx, sx, sy - 17 + breathe, t, p);

  // === ARMS ===
  // Left arm (shifts forward to throw)
  ctx.save();
  ctx.translate(sx - 7, sy - 17 + breathe);
  ctx.rotate(armRaise);
  ctx.fillStyle = p.skinDark;
  ctx.fillRect(-2, 0, 4, 13);
  ctx.fillStyle = p.skin;
  ctx.fillRect(-2, 0, 1, 13);
  // Wrist wrap
  ctx.fillStyle = p.bandolier;
  ctx.fillRect(-2, 11, 4, 2);
  // Hand holding a blade (when charging)
  ctx.fillStyle = p.skinDark;
  ctx.fillRect(-2, 13, 4, 4);
  if(charging > 0){
    drawHandBlade(ctx, 0, 14, t, charging, p);
  }
  ctx.restore();

  // Right arm (rest, also has wraps)
  ctx.fillStyle = p.skinDark;
  ctx.fillRect(sx + 6, sy - 17 + breathe, 4, 13);
  ctx.fillStyle = p.skin;
  ctx.fillRect(sx + 9, sy - 17 + breathe, 1, 13);
  ctx.fillStyle = p.bandolier;
  ctx.fillRect(sx + 6, sy - 6 + breathe, 4, 2);
  ctx.fillStyle = p.skinDark;
  ctx.fillRect(sx + 6, sy - 4 + breathe, 4, 4);

  // === HEAD (with cloth wrap / mask) ===
  ctx.fillStyle = p.skinDark;
  ctx.fillRect(sx - 6, sy - 28 + breathe, 12, 10);
  ctx.fillStyle = p.skin;
  ctx.fillRect(sx - 6, sy - 28 + breathe, 12, 8);
  ctx.fillStyle = p.skinLight;
  ctx.fillRect(sx - 6, sy - 28 + breathe, 2, 10);

  // Cloth wrap covering lower face (red bandana style)
  ctx.fillStyle = p.shirtDark;
  ctx.fillRect(sx - 6, sy - 22 + breathe, 12, 4);
  ctx.fillStyle = p.shirt;
  ctx.fillRect(sx - 6, sy - 22 + breathe, 12, 3);
  // Knot at the side
  ctx.fillStyle = p.shirtDark;
  ctx.fillRect(sx + 6, sy - 22 + breathe, 2, 3);
  ctx.fillStyle = p.shirt;
  ctx.fillRect(sx + 7, sy - 21 + breathe, 1, 1);

  // Headband
  ctx.fillStyle = p.bandolier;
  ctx.fillRect(sx - 6, sy - 28 + breathe, 12, 2);
  // Headband detail
  ctx.fillStyle = p.bronze;
  ctx.fillRect(sx - 1, sy - 28 + breathe, 2, 2);
  ctx.fillStyle = '#e8c860';
  ctx.fillRect(sx, sy - 28 + breathe, 1, 1);

  // Hair tuft sticking out
  ctx.fillStyle = p.bandolier;
  ctx.fillRect(sx - 4, sy - 30 + breathe, 2, 2);

  // Eyes (focused, sharp)
  ctx.fillStyle = '#000';
  ctx.fillRect(sx - 4, sy - 26 + breathe, 2, 1);
  ctx.fillRect(sx + 2, sy - 26 + breathe, 2, 1);
  const eyePulse = 0.92 + Math.sin(t * 0.08) * 0.08;
  ctx.fillStyle = `rgba(216,200,128,${eyePulse * 0.85})`;
  ctx.fillRect(sx - 4, sy - 25 + breathe, 1, 0.5);
  ctx.fillRect(sx + 3, sy - 25 + breathe, 1, 0.5);
}

function drawBandolierWithBlades(ctx, sx, sy, t, p){
  // X-cross of leather straps with blades attached
  // Left strap (top-left to bottom-right)
  ctx.strokeStyle = p.bandolier;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(sx - 6, sy);
  ctx.lineTo(sx + 6, sy + 14);
  ctx.stroke();
  // Right strap (top-right to bottom-left)
  ctx.beginPath();
  ctx.moveTo(sx + 6, sy);
  ctx.lineTo(sx - 6, sy + 14);
  ctx.stroke();

  // === BLADES TUCKED INTO BANDOLIERS (signature) ===
  // 3 blades visible on each strap
  const bladePositions = [
    [-4, 3, -0.7],   // upper left
    [-2, 7, -0.7],   // mid left
    [4, 3, 0.7],    // upper right
    [2, 7, 0.7],    // mid right
    [0, 11, 0],     // center bottom
  ];
  for(const [dx, dy, angle] of bladePositions){
    drawBladeOnBandolier(ctx, sx + dx, sy + dy, angle, p);
  }

  // Bronze buckle at center
  ctx.fillStyle = p.bronze;
  ctx.fillRect(sx - 1, sy + 5, 3, 3);
  ctx.fillStyle = '#e8c860';
  ctx.fillRect(sx, sy + 6, 1, 1);
}

function drawBladeOnBandolier(ctx, lx, ly, angle, p){
  ctx.save();
  ctx.translate(lx, ly);
  ctx.rotate(angle);
  // Tiny throwing blade
  ctx.fillStyle = p.bladeMetal;
  ctx.beginPath();
  ctx.moveTo(0, -3);
  ctx.lineTo(1, 0);
  ctx.lineTo(0, 2);
  ctx.lineTo(-1, 0);
  ctx.closePath();
  ctx.fill();
  // Edge highlight
  ctx.fillStyle = p.bladeEdge;
  ctx.fillRect(-0.5, -2, 0.5, 4);
  // Tiny blood stain
  ctx.fillStyle = p.blood;
  ctx.fillRect(0, -1, 0.5, 1);
  ctx.restore();
}

function drawHandBlade(ctx, lx, ly, t, intensity, p){
  // Blade in hand, ready to throw
  ctx.save();
  ctx.translate(lx, ly);
  ctx.rotate(-Math.PI / 4);
  // Halo (red intensity glow)
  const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, 5 * intensity);
  grad.addColorStop(0, `rgba(200,40,40,${intensity * 0.6})`);
  grad.addColorStop(1, 'rgba(138,24,24,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(-5, -5, 10, 10);
  // Blade body
  ctx.fillStyle = p.bladeMetal;
  ctx.beginPath();
  ctx.moveTo(0, -5);
  ctx.lineTo(2, 0);
  ctx.lineTo(0, 4);
  ctx.lineTo(-2, 0);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = p.bladeEdge;
  ctx.fillRect(-1, -4, 1, 7);
  ctx.restore();
}

export const attacks = {
  idle: {
    id: 'idle', name: 'IDLE', icon: '◇',
    duration: 9999, looping: true,
    description: 'Posture vigilante, bandolier de lames visible, cherche une cible. Léger sway.',
    phases: [{ from: 0, to: 9999, label: 'Loop' }],
    update(frame){
      const fx = [];
      if(frame % 30 === 0){
        fx.push({ type: 'ash', dx: 0, dy: -10, count: 1, color: '#8a1818' });
      }
      return { opts: { armRaise: -0.3 }, fx };
    },
  },

  throwBlade: {
    id: 'throwBlade', name: 'THROW BLADE', icon: '🔪',
    duration: 65,
    description: 'Lance une lame qui tournoie. Range 5. 40% Bleed.',
    phases: [
      { from: 0, to: 20, label: 'Charge' },
      { from: 20, to: 28, label: 'Throw' },
      { from: 28, to: 65, label: 'Recovery' },
    ],
    projectile: {
      spawnFrame: 20,
      spawnOffset: { dx: -10, dy: -6 },
      travelFrames: 14,
      drawProjectile(ctx, x, y, vx, vy, t){
        // Spinning blade
        const spin = t * 0.6;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(spin);
        // Halo
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, 8);
        grad.addColorStop(0, 'rgba(216,200,160,0.5)');
        grad.addColorStop(0.5, 'rgba(200,40,40,0.4)');
        grad.addColorStop(1, 'rgba(138,24,24,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(-8, -8, 16, 16);
        // Blade shape (thin diamond)
        ctx.fillStyle = '#9a8868';
        ctx.beginPath();
        ctx.moveTo(0, -6);
        ctx.lineTo(2, 0);
        ctx.lineTo(0, 6);
        ctx.lineTo(-2, 0);
        ctx.closePath();
        ctx.fill();
        // Edge highlights
        ctx.fillStyle = '#d8c8a0';
        ctx.fillRect(-1, -5, 1, 9);
        // Tip
        ctx.fillStyle = '#e8d8b8';
        ctx.fillRect(-0.5, -6, 1, 2);
        // Blood drop trailing
        ctx.fillStyle = '#a02828';
        ctx.fillRect(0, 4, 1, 1);
        ctx.restore();
      },
      trailColor: '#a02828',
      onHit: {
        flash: '#d8c8a0', flashSize: 12,
        sparks: 12, color: '#a02828',
        shockwave: '#8a1818', shockwaveRadius: 22,
      },
    },
    update(frame){
      const opts = {};
      const fx = [];
      if(frame < 20){
        const p = frame / 20;
        opts.armRaise = -0.3 - p * 0.7;
        opts.charging = p;
      } else if(frame < 28){
        opts.armRaise = -1.0 + (frame - 20) / 8 * 1.4;
        opts.charging = Math.max(0, 1 - (frame - 20) / 8);
        if(frame === 20){
          fx.push({ type: 'flash', dx: -10, dy: -6, color: '#d8c8a0', size: 11 });
          fx.push({ type: 'sparks', dx: -10, dy: -6, count: 8, color: '#a02828' });
          fx.push({
            type: 'projectile',
            dx: -10, dy: -6,
            useAttackProjectile: 'throwBlade',
          });
        }
      } else {
        const p = (frame - 28) / 37;
        opts.armRaise = 0.4 - p * 0.7;
      }
      return { opts, fx };
    },
  },

  walk: {
    id: 'walk', name: 'WALK', icon: '🏃',
    duration: 160,
    looping: true,
    description: 'Recule pour maintenir distance. Aller-retour 80/80.',
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
      opts.bodyShift += Math.sin(frame * 0.18) * 0.4;
      if(frame % 16 === 0){
        fx.push({ type: 'ash', dx: 0, dy: 11, count: 1, color: '#3a1a08' });
      }
      return { opts, fx };
    },
  },
};

export const meta = { width: 22, height: 38, groundOffsetY: 0 };
export default { draw, attacks, palette, meta };
