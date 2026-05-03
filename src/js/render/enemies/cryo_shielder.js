// src/js/render/enemies/cryo_shielder.js
// Glacier Vivant — tank massif (1.3x hero).
// Bloc rectangulaire de glace avec coins ébréchés, fissures bleues internes lumineuses,
// bras et jambes courts, yeux à peine visibles entre les craquelures.

export const palette = {
  ice:         '#5a98c8',
  iceDark:     '#28486a',
  iceLight:    '#7ab0d8',
  iceCrack:    '#aee6ff',
  iceCrackHot: '#e0f5ff',
  iceCore:     '#fff',
  shieldGlow:  '#4fc3f7',
  shadow:      'rgba(20,40,60,0.85)',
};

export function draw(ctx, sx, sy, t, opts){
  opts = opts || {};
  const p = palette;
  const bob = Math.sin(t * 0.025) * 0.4;
  sx = Math.round(sx + (opts.bodyShift || 0));
  sy = Math.round(sy + bob);

  const armRaise = opts.armRaise || 0;
  const shieldPulse = opts.shieldPulse !== undefined ? opts.shieldPulse : 0.5;

  // Shadow (large)
  ctx.fillStyle = p.shadow;
  ctx.beginPath();
  ctx.ellipse(sx, sy + 9, 18, 4.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Shield glow (passive iceArmor : aura cyan défensive)
  if(shieldPulse > 0){
    for(let i = 0; i < 3; i++){
      const r = 24 + i * 5 + Math.sin(t * 0.08 + i) * 2;
      const a = shieldPulse * 0.18 * (1 - i * 0.25);
      ctx.fillStyle = `rgba(79,195,247,${a})`;
      ctx.beginPath();
      ctx.ellipse(sx, sy + 4, r, r * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Body main glow
  const glow = 0.35 + Math.sin(t * 0.05) * 0.1;
  const bg = ctx.createRadialGradient(sx, sy - 12, 6, sx, sy - 12, 30);
  bg.addColorStop(0, `rgba(174,230,255,${glow * 0.5})`);
  bg.addColorStop(1, 'rgba(174,230,255,0)');
  ctx.fillStyle = bg;
  ctx.fillRect(sx - 30, sy - 42, 60, 56);

  // === LEGS (très courtes, trapues) ===
  ctx.fillStyle = p.iceDark;
  ctx.fillRect(sx - 9, sy + 1, 7, 6);
  ctx.fillRect(sx + 2, sy + 1, 7, 6);
  ctx.fillStyle = p.ice;
  ctx.fillRect(sx - 9, sy + 1, 2, 6);

  // Frosted feet
  ctx.fillStyle = p.iceLight;
  ctx.fillRect(sx - 10, sy + 7, 8, 3);
  ctx.fillRect(sx + 2, sy + 7, 8, 3);
  ctx.fillStyle = p.iceCrack;
  ctx.fillRect(sx - 10, sy + 9, 8, 1);
  ctx.fillRect(sx + 2, sy + 9, 8, 1);

  // === BODY : bloc massif rectangulaire ===
  // Outline / dark base
  ctx.fillStyle = p.iceDark;
  ctx.beginPath();
  ctx.moveTo(sx - 14, sy - 22);
  ctx.lineTo(sx + 14, sy - 22);
  ctx.lineTo(sx + 16, sy - 14);
  ctx.lineTo(sx + 16, sy + 1);
  ctx.lineTo(sx - 16, sy + 1);
  ctx.lineTo(sx - 16, sy - 14);
  ctx.closePath();
  ctx.fill();

  // Main body (lighter)
  ctx.fillStyle = p.ice;
  ctx.fillRect(sx - 14, sy - 21, 28, 22);
  ctx.fillStyle = p.iceLight;
  ctx.fillRect(sx - 14, sy - 21, 4, 22);

  // Chipped corners (top corners et coins ébréchés)
  ctx.fillStyle = p.iceDark;
  // Top-left chip
  ctx.beginPath();
  ctx.moveTo(sx - 14, sy - 21);
  ctx.lineTo(sx - 11, sy - 21);
  ctx.lineTo(sx - 14, sy - 17);
  ctx.closePath();
  ctx.fill();
  // Top-right chip
  ctx.beginPath();
  ctx.moveTo(sx + 14, sy - 21);
  ctx.lineTo(sx + 11, sy - 21);
  ctx.lineTo(sx + 14, sy - 17);
  ctx.closePath();
  ctx.fill();
  // Side chips
  ctx.beginPath();
  ctx.moveTo(sx - 14, sy - 8);
  ctx.lineTo(sx - 14, sy - 5);
  ctx.lineTo(sx - 11, sy - 6);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(sx + 14, sy - 12);
  ctx.lineTo(sx + 14, sy - 9);
  ctx.lineTo(sx + 11, sy - 10);
  ctx.closePath();
  ctx.fill();

  // Major internal cracks (lumineuses)
  const crackPulse = 0.85 + Math.sin(t * 0.07) * 0.15;
  ctx.strokeStyle = `rgba(174,230,255,${crackPulse})`;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  // Diagonal main cracks
  ctx.moveTo(sx - 11, sy - 18);
  ctx.lineTo(sx - 6, sy - 12);
  ctx.lineTo(sx - 9, sy - 6);
  ctx.lineTo(sx - 4, sy);
  // Second
  ctx.moveTo(sx + 8, sy - 19);
  ctx.lineTo(sx + 4, sy - 13);
  ctx.lineTo(sx + 8, sy - 7);
  ctx.lineTo(sx + 5, sy - 1);
  // Third (centered)
  ctx.moveTo(sx - 1, sy - 20);
  ctx.lineTo(sx + 1, sy - 14);
  ctx.lineTo(sx - 2, sy - 8);
  ctx.lineTo(sx + 1, sy - 2);
  ctx.stroke();
  // Hot inner streaks
  ctx.strokeStyle = `rgba(224,245,255,${crackPulse * 0.7})`;
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(sx - 9, sy - 15); ctx.lineTo(sx - 7, sy - 10);
  ctx.moveTo(sx + 6, sy - 16); ctx.lineTo(sx + 5, sy - 11);
  ctx.moveTo(sx, sy - 17); ctx.lineTo(sx, sy - 12);
  ctx.stroke();

  // Crystal protrusions on top
  drawIceSpike(ctx, sx - 6, sy - 22, t, 1, p);
  drawIceSpike(ctx, sx + 5, sy - 22, t + 50, 1.2, p);
  drawIceSpike(ctx, sx, sy - 22, t + 100, 0.8, p);

  // === ARMS (very short, stubby) ===
  // Left arm (with bash motion)
  ctx.save();
  ctx.translate(sx - 14, sy - 16);
  ctx.rotate(armRaise);
  ctx.fillStyle = p.iceDark;
  ctx.fillRect(-4, 0, 5, 11);
  ctx.fillStyle = p.ice;
  ctx.fillRect(-4, 0, 1, 11);
  // Fist (poing de glace)
  ctx.fillStyle = p.iceLight;
  ctx.fillRect(-5, 11, 6, 6);
  ctx.fillStyle = p.iceCrack;
  ctx.fillRect(-4, 13, 2, 1);
  ctx.fillRect(-1, 14, 2, 1);
  ctx.restore();

  // Right arm (rest, hangs)
  ctx.fillStyle = p.iceDark;
  ctx.fillRect(sx + 13, sy - 16, 5, 11);
  ctx.fillStyle = p.ice;
  ctx.fillRect(sx + 17, sy - 16, 1, 11);
  ctx.fillStyle = p.iceLight;
  ctx.fillRect(sx + 12, sy - 5, 6, 6);
  ctx.fillStyle = p.iceCrack;
  ctx.fillRect(sx + 13, sy - 3, 2, 1);

  // === EYES : à peine visibles, deep cyan inside the cracks ===
  ctx.fillStyle = '#000';
  ctx.fillRect(sx - 6, sy - 16, 4, 2);
  ctx.fillRect(sx + 2, sy - 16, 4, 2);
  // Glow inside
  const eyePulse = 0.7 + Math.sin(t * 0.06) * 0.3;
  ctx.fillStyle = `rgba(174,230,255,${eyePulse})`;
  ctx.fillRect(sx - 5, sy - 15, 2, 1);
  ctx.fillRect(sx + 3, sy - 15, 2, 1);
  ctx.fillStyle = `rgba(255,255,255,${eyePulse * 0.7})`;
  ctx.fillRect(sx - 5, sy - 15, 0.5, 0.5);
}

function drawIceSpike(ctx, lx, ly, t, scale, p){
  const h = 5 * scale;
  const w = 1.5 * scale;
  ctx.fillStyle = p.iceDark;
  ctx.beginPath();
  ctx.moveTo(lx, ly - h);
  ctx.lineTo(lx - w, ly);
  ctx.lineTo(lx + w, ly);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = p.iceCrack;
  ctx.beginPath();
  ctx.moveTo(lx, ly - h);
  ctx.lineTo(lx, ly);
  ctx.lineTo(lx + w, ly);
  ctx.closePath();
  ctx.fill();
  // Pulse highlight
  const pulse = 0.7 + Math.sin(t * 0.1) * 0.3;
  ctx.fillStyle = `rgba(255,255,255,${pulse * scale})`;
  ctx.fillRect(lx - 0.5, ly - h + 1, 1, h - 1);
}

export const attacks = {
  idle: {
    id: 'idle', name: 'IDLE', icon: '◇',
    duration: 9999, looping: true,
    description: 'Stationnaire, aura de glace cyan défensive (passive iceArmor : -75% dégâts ice). Très peu d\'animation, fissures qui pulsent.',
    phases: [{ from: 0, to: 9999, label: 'Loop' }],
    update(frame){
      const fx = [];
      if(frame % 36 === 0){
        fx.push({ type: 'ash', dx: -8, dy: -16, count: 1, color: '#aee6ff' });
        fx.push({ type: 'ash', dx: 8, dy: -16, count: 1, color: '#aee6ff' });
      }
      return { opts: { shieldPulse: 0.5 }, fx };
    },
  },

  bash: {
    id: 'bash', name: 'ICE BASH', icon: '⚒',
    duration: 90,
    description: 'Frappe lourde au CaC. Lève le poing de glace et le rabat. Onde de gel à l\'impact.',
    phases: [
      { from: 0, to: 30, label: 'Anticipation' },
      { from: 30, to: 42, label: 'Frappe' },
      { from: 42, to: 60, label: 'Impact' },
      { from: 60, to: 90, label: 'Recovery' },
    ],
    update(frame){
      const opts = { shieldPulse: 0.5 };
      const fx = [];
      if(frame < 30){
        const p = frame / 30;
        opts.armRaise = -p * 1.3;
      } else if(frame < 42){
        const p = (frame - 30) / 12;
        opts.armRaise = -1.3 + p * 1.5;
      } else if(frame < 60){
        opts.armRaise = 0.2;
        if(frame === 42){
          fx.push({ type: 'shockwave', dx: -16, dy: 10, color: '#aee6ff', maxRadius: 36 });
          fx.push({ type: 'sparks', dx: -16, dy: 10, count: 14, color: '#aee6ff' });
          fx.push({ type: 'flash', dx: -16, dy: 8, color: '#e0f5ff', size: 16 });
          opts.shieldPulse = 1;
        }
      } else {
        const p = (frame - 60) / 30;
        opts.armRaise = 0.2 - 0.2 * p;
      }
      return { opts, fx };
    },
  },

  iceArmor: {
    id: 'iceArmor', name: 'ICE ARMOR', icon: '🛡',
    duration: 60, passive: true,
    description: 'Passif : -75% dégâts ice subis. -30% dégâts pour les alliés adjacents. Activation visuelle : aura cyan dense, fissures incandescentes.',
    phases: [
      { from: 0, to: 25, label: 'Activation' },
      { from: 25, to: 60, label: 'Stable' },
    ],
    update(frame){
      const opts = {};
      const fx = [];
      if(frame < 25){
        const p = frame / 25;
        opts.shieldPulse = 0.5 + p * 0.5;
        if(frame === 0){
          fx.push({ type: 'flash', dx: 0, dy: -10, color: '#aee6ff', size: 22 });
          fx.push({ type: 'shockwave', dx: 0, dy: 4, color: '#4fc3f7', maxRadius: 38 });
        }
      } else {
        opts.shieldPulse = 1 + Math.sin(frame * 0.15) * 0.15;
        if(frame % 6 === 0){
          const angle = Math.random() * Math.PI * 2;
          fx.push({ type: 'sparks', dx: Math.cos(angle) * 18, dy: -10 + Math.sin(angle) * 10, count: 1, color: '#e0f5ff' });
        }
      }
      return { opts, fx };
    },
  },

  walk: {
    id: 'walk', name: 'WALK', icon: '🏃',
    duration: 240,
    looping: true,
    description: 'Marche très lente (240 frames pour aller-retour). Tangage à peine perceptible, fissures qui clignotent.',
    phases: [
      { from: 0, to: 120, label: 'Avancée' },
      { from: 120, to: 240, label: 'Retour' },
    ],
    update(frame){
      const opts = { shieldPulse: 0.5 };
      const fx = [];
      const half = 120;
      let p;
      if(frame < half){
        p = frame / half;
        opts.bodyShift = p * 32;
      } else {
        p = (frame - half) / half;
        opts.bodyShift = (1 - p) * 32;
      }
      opts.bodyShift += Math.sin(frame * 0.1) * 0.4;
      if(frame % 18 === 0){
        fx.push({ type: 'ash', dx: -6, dy: 13, count: 2, color: '#aee6ff' });
        fx.push({ type: 'ash', dx: 6, dy: 13, count: 2, color: '#aee6ff' });
      }
      return { opts, fx };
    },
  },
};

export const meta = { width: 36, height: 44, groundOffsetY: 0 };
export default { draw, attacks, palette, meta };
