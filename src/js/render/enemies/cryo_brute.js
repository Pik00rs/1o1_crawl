// src/js/render/enemies/cryo_brute.js
// Givre-Marcheur — zombie de cryostase.
// Silhouette voûtée, peau bleu-gris cristallisée, cristaux qui sortent des épaules,
// bras pendants. Crâne gelé avec yeux bleu pâle.

export const palette = {
  flesh:       '#5a7080',  // chair gelée bleu-gris
  fleshDark:   '#3a4858',
  fleshLight:  '#7a90a0',
  crystal:     '#aee6ff',  // cristaux glacés
  crystalDark: '#4fc3f7',
  crystalCore: '#e0f5ff',
  bone:        '#c8d4e0',
  boneDark:    '#7a8898',
  eye:         '#aee6ff',
  eyeCore:     '#fff',
  rags:        '#3a3848',  // restes de vêtements
  ragsDark:    '#1a1828',
  shadow:      'rgba(20,40,60,0.7)',
};

export function draw(ctx, sx, sy, t, opts){
  opts = opts || {};
  const p = palette;
  const bob = Math.sin(t * 0.04) * 0.5;
  sx = Math.round(sx + (opts.bodyShift || 0));
  sy = Math.round(sy + bob);

  const armRaise = opts.armRaise || 0; // pour slam
  const auraIntensity = opts.auraIntensity || 0;

  // Shadow
  ctx.fillStyle = p.shadow;
  ctx.beginPath();
  ctx.ellipse(sx, sy + 7, 13, 3.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Cold aura (passive : Chill on hit)
  if(auraIntensity > 0){
    for(let i = 0; i < 3; i++){
      const r = 18 + i * 4 + Math.sin(t * 0.1 + i) * 2;
      const a = auraIntensity * 0.18 * (1 - i * 0.3);
      ctx.fillStyle = `rgba(174,230,255,${a})`;
      ctx.beginPath();
      ctx.ellipse(sx, sy + 6, r, r * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Soft cyan body glow (perma)
  const glow = 0.3 + Math.sin(t * 0.06) * 0.1;
  const bg = ctx.createRadialGradient(sx, sy - 10, 4, sx, sy - 10, 24);
  bg.addColorStop(0, `rgba(174,230,255,${glow * 0.4})`);
  bg.addColorStop(1, 'rgba(174,230,255,0)');
  ctx.fillStyle = bg;
  ctx.fillRect(sx - 24, sy - 36, 48, 50);

  // Legs
  ctx.fillStyle = p.fleshDark;
  ctx.fillRect(sx - 7, sy - 1, 5, 9);
  ctx.fillRect(sx + 2, sy - 1, 5, 9);
  ctx.fillStyle = p.flesh;
  ctx.fillRect(sx - 7, sy - 1, 1, 9);
  // Frostbite patches
  ctx.fillStyle = p.crystal;
  ctx.fillRect(sx - 6, sy + 4, 2, 1);
  ctx.fillRect(sx + 4, sy + 3, 2, 1);

  // Feet (bare, frozen)
  ctx.fillStyle = p.boneDark;
  ctx.fillRect(sx - 8, sy + 8, 7, 3);
  ctx.fillRect(sx + 1, sy + 8, 7, 3);
  // Frost on feet
  ctx.fillStyle = p.crystalCore;
  ctx.fillRect(sx - 8, sy + 10, 7, 1);
  ctx.fillRect(sx + 1, sy + 10, 7, 1);

  // Torso (voûté, bras pendants)
  ctx.fillStyle = p.fleshDark;
  ctx.beginPath();
  ctx.moveTo(sx - 10, sy - 17);
  ctx.lineTo(sx + 10, sy - 17);
  ctx.lineTo(sx + 8, sy - 1);
  ctx.lineTo(sx - 8, sy - 1);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = p.flesh;
  ctx.fillRect(sx - 8, sy - 16, 16, 15);
  ctx.fillStyle = p.fleshLight;
  ctx.fillRect(sx - 8, sy - 16, 2, 15);

  // Rags / torn shirt (over torso)
  ctx.fillStyle = p.ragsDark;
  ctx.fillRect(sx - 8, sy - 16, 16, 6);
  ctx.fillStyle = p.rags;
  ctx.fillRect(sx - 8, sy - 16, 16, 4);
  // Torn edges
  ctx.fillStyle = p.fleshDark;
  ctx.fillRect(sx - 8, sy - 11, 2, 1);
  ctx.fillRect(sx - 4, sy - 11, 2, 1);
  ctx.fillRect(sx + 2, sy - 11, 2, 1);
  ctx.fillRect(sx + 6, sy - 11, 2, 1);

  // Shoulder crystals (qui sortent du corps)
  drawCrystal(ctx, sx - 9, sy - 17, t, 1, p);
  drawCrystal(ctx, sx + 9, sy - 17, t + 30, 1.2, p);
  drawCrystal(ctx, sx - 4, sy - 18, t + 60, 0.7, p);

  // Body cracks (cristal qui pousse à travers)
  const crackPulse = 0.7 + Math.sin(t * 0.08) * 0.2;
  ctx.strokeStyle = `rgba(174,230,255,${crackPulse})`;
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(sx - 5, sy - 5);
  ctx.lineTo(sx - 3, sy - 3);
  ctx.lineTo(sx - 5, sy - 1);
  ctx.moveTo(sx + 4, sy - 6);
  ctx.lineTo(sx + 5, sy - 3);
  ctx.stroke();

  // Arms (pendants, bras gauche levé selon armRaise)
  ctx.save();
  ctx.translate(sx - 10, sy - 16);
  ctx.rotate(armRaise);
  ctx.fillStyle = p.fleshDark;
  ctx.fillRect(-3, 0, 4, 13);
  ctx.fillStyle = p.flesh;
  ctx.fillRect(-3, 0, 1, 13);
  // Hand
  ctx.fillStyle = p.boneDark;
  ctx.fillRect(-3, 13, 4, 4);
  // Frost on hand
  ctx.fillStyle = p.crystal;
  ctx.fillRect(-3, 16, 4, 1);
  ctx.restore();

  // Right arm (hangs)
  ctx.fillStyle = p.fleshDark;
  ctx.fillRect(sx + 8, sy - 16, 4, 13);
  ctx.fillStyle = p.flesh;
  ctx.fillRect(sx + 11, sy - 16, 1, 13);
  ctx.fillStyle = p.boneDark;
  ctx.fillRect(sx + 8, sy - 3, 4, 4);
  ctx.fillStyle = p.crystal;
  ctx.fillRect(sx + 8, sy, 4, 1);

  // Head/Skull (frozen, exposed in places)
  ctx.fillStyle = p.fleshDark;
  ctx.fillRect(sx - 7, sy - 27, 14, 11);
  ctx.fillStyle = p.flesh;
  ctx.fillRect(sx - 7, sy - 27, 14, 8);
  ctx.fillStyle = p.fleshLight;
  ctx.fillRect(sx - 7, sy - 27, 2, 8);

  // Frost cap on top
  ctx.fillStyle = p.crystal;
  ctx.fillRect(sx - 7, sy - 28, 14, 2);
  ctx.fillStyle = p.crystalCore;
  ctx.fillRect(sx - 6, sy - 28, 12, 1);
  // Crystal spikes from skull
  drawCrystal(ctx, sx - 5, sy - 28, t + 45, 0.6, p);
  drawCrystal(ctx, sx + 4, sy - 29, t + 75, 0.7, p);

  // Eye sockets (deep)
  ctx.fillStyle = '#000';
  ctx.fillRect(sx - 5, sy - 22, 3, 2);
  ctx.fillRect(sx + 2, sy - 22, 3, 2);
  // Frozen eyes (cyan glow)
  const eyePulse = 0.7 + Math.sin(t * 0.07) * 0.3;
  ctx.fillStyle = `rgba(174,230,255,${eyePulse})`;
  ctx.fillRect(sx - 4, sy - 22, 1, 1);
  ctx.fillRect(sx + 3, sy - 22, 1, 1);
  ctx.fillStyle = `rgba(255,255,255,${eyePulse})`;
  ctx.fillRect(sx - 4, sy - 22, 0.5, 0.5);

  // Mouth (frozen agape)
  ctx.fillStyle = '#000';
  ctx.fillRect(sx - 3, sy - 18, 6, 2);
  ctx.fillStyle = p.crystalCore;
  ctx.fillRect(sx - 3, sy - 18, 1, 1);
  ctx.fillRect(sx + 2, sy - 17, 1, 1);
}

function drawCrystal(ctx, lx, ly, t, scale, p){
  if(scale <= 0) return;
  const h = 5 * scale;
  const w = 2 * scale;
  // Halo
  ctx.fillStyle = `rgba(174,230,255,${0.4 * scale})`;
  ctx.fillRect(lx - w - 1, ly - h - 1, w * 2 + 2, h + 2);
  // Body
  ctx.fillStyle = p.crystalDark;
  ctx.beginPath();
  ctx.moveTo(lx, ly - h);
  ctx.lineTo(lx - w, ly);
  ctx.lineTo(lx + w, ly);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = p.crystal;
  ctx.beginPath();
  ctx.moveTo(lx, ly - h);
  ctx.lineTo(lx, ly);
  ctx.lineTo(lx + w, ly);
  ctx.closePath();
  ctx.fill();
  // Highlight
  const pulse = 0.7 + Math.sin(t * 0.1) * 0.3;
  ctx.fillStyle = `rgba(255,255,255,${pulse * scale})`;
  ctx.fillRect(lx - 0.5, ly - h + 1, 1, h - 1);
}

export const attacks = {
  idle: {
    id: 'idle', name: 'IDLE', icon: '◇',
    duration: 9999, looping: true,
    description: 'Pose au repos, aura froide diffuse, vapeur blanche qui s\'échappe de la bouche, cristaux pulsants.',
    phases: [{ from: 0, to: 9999, label: 'Loop' }],
    update(frame){
      const fx = [];
      if(frame % 30 === 0){
        fx.push({ type: 'ash', dx: 0, dy: -18, count: 1, color: '#aee6ff' });
      }
      return { opts: { auraIntensity: 0.3 }, fx };
    },
  },

  slam: {
    id: 'slam', name: 'SLAM', icon: '⚔',
    duration: 80,
    description: 'Frappe lourde au CaC. 30% chance d\'appliquer Chill (-1 PA pendant 2 tours). Lève le bras, frappe le sol, onde de gel.',
    phases: [
      { from: 0, to: 25, label: 'Anticipation' },
      { from: 25, to: 35, label: 'Frappe' },
      { from: 35, to: 50, label: 'Impact' },
      { from: 50, to: 80, label: 'Recovery' },
    ],
    update(frame){
      const opts = { auraIntensity: 0.3 };
      const fx = [];
      if(frame < 25){
        const p = frame / 25;
        opts.armRaise = -p * 1.4;
      } else if(frame < 35){
        const p = (frame - 25) / 10;
        opts.armRaise = -1.4 + p * 1.4;
      } else if(frame < 50){
        opts.armRaise = 0.1;
        if(frame === 35){
          fx.push({ type: 'shockwave', dx: -10, dy: 8, color: '#aee6ff', maxRadius: 32 });
          fx.push({ type: 'sparks', dx: -10, dy: 8, count: 10, color: '#aee6ff' });
          fx.push({ type: 'flash', dx: -10, dy: 6, color: '#e0f5ff', size: 14 });
          opts.auraIntensity = 1;
        }
      } else {
        const p = (frame - 50) / 30;
        opts.armRaise = 0.1 - 0.1 * p;
      }
      return { opts, fx };
    },
  },

  walk: {
    id: 'walk', name: 'WALK', icon: '🏃',
    duration: 200,
    looping: true,
    description: 'Démarche shambling lente. Avance 100 frames, retour 100 frames (boucle). Cristaux qui scintillent, traînée de givre.',
    phases: [
      { from: 0, to: 100, label: 'Avancée' },
      { from: 100, to: 200, label: 'Retour' },
    ],
    update(frame){
      const opts = { auraIntensity: 0.3 };
      const fx = [];
      const half = 100;
      let p;
      if(frame < half){
        p = frame / half;
        opts.bodyShift = p * 36;
      } else {
        p = (frame - half) / half;
        opts.bodyShift = (1 - p) * 36;
      }
      opts.bodyShift += Math.sin(frame * 0.18) * 0.5;
      if(frame % 14 === 0){
        fx.push({ type: 'ash', dx: -3, dy: 11, count: 2, color: '#aee6ff' });
        fx.push({ type: 'ash', dx: 3, dy: 11, count: 2, color: '#aee6ff' });
      }
      return { opts, fx };
    },
  },
};

export const meta = { width: 24, height: 38, groundOffsetY: 0 };
export default { draw, attacks, palette, meta };
