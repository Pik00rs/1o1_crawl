// src/js/render/enemies/inferno_charger.js
// Charge Cendreuse — berserker dégénéré qui charge.
// Silhouette voûtée, large mais pas armurée, bras pendants,
// crâne à moitié calciné apparent (mâchoire visible), corps craqué partout.

export const palette = {
  flesh:       '#5a3525',  // chair carbonisée
  fleshDark:   '#3a2018',
  fleshLight:  '#7a4530',
  bone:        '#d4c8a0',  // crâne
  boneDark:    '#8a7858',
  crack:       '#ff6f1a',
  crackHot:    '#ffb347',
  crackCore:   '#ffe080',
  shadow:      'rgba(0,0,0,0.7)',
};

export function draw(ctx, sx, sy, t, opts){
  opts = opts || {};
  const p = palette;
  const bob = Math.sin(t * 0.05) * 0.6;
  const twitch = (t % 80 < 5) ? (Math.random() - 0.5) * 1.5 : 0;
  sx = Math.round(sx + (opts.bodyShift || 0) + twitch);
  sy = Math.round(sy + bob);

  const lean = opts.lean || 0; // pour la charge
  const trailIntensity = opts.trailIntensity || 0;

  // Shadow
  ctx.fillStyle = p.shadow;
  ctx.beginPath();
  ctx.ellipse(sx, sy + 7, 14, 3.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Glow / fire trail (charge mode)
  if(trailIntensity > 0){
    for(let i = 0; i < 6; i++){
      const dx = -i * 4;
      const a = trailIntensity * (1 - i / 6) * 0.5;
      ctx.fillStyle = `rgba(255,107,26,${a})`;
      ctx.fillRect(sx + dx - 8, sy - 18, 16, 22);
    }
  }

  // Body glow (perma)
  const glow = 0.35 + Math.sin(t * 0.07) * 0.15;
  const bg = ctx.createRadialGradient(sx, sy - 8, 4, sx, sy - 8, 26);
  bg.addColorStop(0, `rgba(255,107,26,${glow})`);
  bg.addColorStop(1, 'rgba(255,107,26,0)');
  ctx.fillStyle = bg;
  ctx.fillRect(sx - 26, sy - 34, 52, 50);

  ctx.save();
  ctx.translate(sx, sy);
  ctx.rotate(lean);
  sx = 0; sy = 0;

  // Legs (épaisses, écartées)
  ctx.fillStyle = p.fleshDark;
  ctx.fillRect(sx - 8, sy - 1, 6, 9);
  ctx.fillRect(sx + 2, sy - 1, 6, 9);
  ctx.fillStyle = p.flesh;
  ctx.fillRect(sx - 8, sy - 1, 2, 9);
  ctx.fillStyle = p.fleshLight;
  ctx.fillRect(sx + 2, sy - 1, 1, 9);

  // Feet
  ctx.fillStyle = '#1a0805';
  ctx.fillRect(sx - 9, sy + 8, 8, 3);
  ctx.fillRect(sx + 1, sy + 8, 8, 3);

  // Torso (large, voûté)
  ctx.fillStyle = p.fleshDark;
  ctx.beginPath();
  ctx.moveTo(sx - 11, sy - 18);
  ctx.lineTo(sx + 11, sy - 18);
  ctx.lineTo(sx + 9, sy - 1);
  ctx.lineTo(sx - 9, sy - 1);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = p.flesh;
  ctx.fillRect(sx - 9, sy - 17, 18, 16);
  ctx.fillStyle = p.fleshLight;
  ctx.fillRect(sx - 9, sy - 17, 2, 16);

  // Big cracks (3 majeures)
  const crackPulse = 0.85 + Math.sin(t * 0.08) * 0.15;
  ctx.strokeStyle = `rgba(255,107,26,${crackPulse})`;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  // Diagonal big crack
  ctx.moveTo(sx - 7, sy - 16);
  ctx.lineTo(sx - 4, sy - 12);
  ctx.lineTo(sx - 6, sy - 8);
  ctx.lineTo(sx - 2, sy - 3);
  // Second
  ctx.moveTo(sx + 5, sy - 15);
  ctx.lineTo(sx + 2, sy - 11);
  ctx.lineTo(sx + 6, sy - 7);
  ctx.lineTo(sx + 3, sy - 2);
  // Third (sternum)
  ctx.moveTo(sx, sy - 16);
  ctx.lineTo(sx - 1, sy - 11);
  ctx.lineTo(sx + 1, sy - 6);
  ctx.lineTo(sx, sy - 2);
  ctx.stroke();
  // Hot inner
  ctx.strokeStyle = `rgba(255,224,128,${crackPulse * 0.7})`;
  ctx.lineWidth = 0.6;
  ctx.beginPath();
  ctx.moveTo(sx - 6, sy - 15); ctx.lineTo(sx - 5, sy - 11);
  ctx.moveTo(sx + 4, sy - 14); ctx.lineTo(sx + 4, sy - 10);
  ctx.stroke();

  // Arms (pendants, longs)
  ctx.fillStyle = p.fleshDark;
  ctx.fillRect(sx - 13, sy - 16, 4, 14);
  ctx.fillRect(sx + 9, sy - 16, 4, 14);
  ctx.fillStyle = p.flesh;
  ctx.fillRect(sx - 13, sy - 16, 1, 14);
  ctx.fillRect(sx + 12, sy - 16, 1, 14);

  // Hands (poings serrés, calcinés)
  ctx.fillStyle = '#1a0805';
  ctx.fillRect(sx - 14, sy - 2, 5, 4);
  ctx.fillRect(sx + 9, sy - 2, 5, 4);
  // Glow on knuckles
  ctx.fillStyle = `rgba(255,107,26,${crackPulse * 0.8})`;
  ctx.fillRect(sx - 13, sy - 1, 3, 1);
  ctx.fillRect(sx + 10, sy - 1, 3, 1);

  // Head/Skull (calciné, mâchoire exposée)
  // Top of head : encore un peu de chair
  ctx.fillStyle = p.fleshDark;
  ctx.beginPath();
  ctx.moveTo(sx - 7, sy - 30);
  ctx.lineTo(sx + 7, sy - 30);
  ctx.lineTo(sx + 6, sy - 24);
  ctx.lineTo(sx - 6, sy - 24);
  ctx.closePath();
  ctx.fill();

  // Skull (chair partie sur la moitié inférieure)
  ctx.fillStyle = p.bone;
  ctx.fillRect(sx - 6, sy - 24, 12, 6);
  // Shadow on right side
  ctx.fillStyle = p.boneDark;
  ctx.fillRect(sx + 4, sy - 24, 2, 6);

  // Eye sockets (vides, lueur dedans)
  ctx.fillStyle = '#000';
  ctx.fillRect(sx - 5, sy - 23, 3, 3);
  ctx.fillRect(sx + 2, sy - 23, 3, 3);
  // Eye glow
  const eyeGlow = 0.7 + Math.sin(t * 0.1) * 0.3;
  ctx.fillStyle = `rgba(255,107,26,${eyeGlow})`;
  ctx.fillRect(sx - 4, sy - 22, 1, 1);
  ctx.fillRect(sx + 3, sy - 22, 1, 1);

  // Jaw (mâchoire à moitié décrochée)
  ctx.fillStyle = p.bone;
  ctx.fillRect(sx - 5, sy - 18, 10, 3);
  // Teeth
  ctx.fillStyle = p.boneDark;
  ctx.fillRect(sx - 4, sy - 17, 1, 2);
  ctx.fillRect(sx - 2, sy - 17, 1, 2);
  ctx.fillRect(sx, sy - 17, 1, 2);
  ctx.fillRect(sx + 2, sy - 17, 1, 2);
  ctx.fillRect(sx + 4, sy - 17, 1, 2);

  // Nasal cavity
  ctx.fillStyle = '#000';
  ctx.fillRect(sx - 1, sy - 21, 2, 2);

  ctx.restore();
}

export const attacks = {
  idle: {
    id: 'idle', name: 'IDLE', icon: '◇',
    duration: 9999, looping: true,
    description: 'Twitches nerveux occasionnels, bobbing de respiration. Cendre qui s\'échappe des fissures.',
    phases: [{ from: 0, to: 9999, label: 'Loop' }],
    update(frame){
      const fx = [];
      if(frame % 18 === 0){
        fx.push({ type: 'ash', dx: 0, dy: -16, count: 1 });
      }
      return { opts: {}, fx };
    },
  },

  charge: {
    id: 'charge', name: 'CHARGE', icon: '💢',
    duration: 100,
    description: 'Charge sur 3 cases au tour 1 du combat. Étourdit 1 tour si la charge touche. Anticipation lourde, traînée de feu.',
    phases: [
      { from: 0, to: 25, label: 'Anticipation' },
      { from: 25, to: 75, label: 'Charge' },
      { from: 75, to: 100, label: 'Impact' },
    ],
    update(frame){
      const opts = {};
      const fx = [];
      if(frame < 25){
        // Anticipation : se penche, pieds qui tremblent
        const p = frame / 25;
        opts.lean = p * 0.18;
        opts.bodyShift = -p * 4;
        if(frame % 4 === 0){
          fx.push({ type: 'ash', dx: -2, dy: 10, count: 2, color: '#5a3525' });
          fx.push({ type: 'ash', dx: 2, dy: 10, count: 2, color: '#5a3525' });
        }
      } else if(frame < 75){
        // Charge active : avance vite, traînée
        const p = (frame - 25) / 50;
        opts.lean = 0.18;
        opts.bodyShift = -4 + p * 50; // déplace fortement à droite
        opts.trailIntensity = 1;
        if(frame % 3 === 0){
          fx.push({ type: 'sparks', dx: 0, dy: 6, count: 3 });
          fx.push({ type: 'ash', dx: 0, dy: 4, count: 2, color: '#ffb347' });
        }
      } else {
        // Impact : freine sec, rebond
        const p = (frame - 75) / 25;
        opts.lean = 0.18 - p * 0.18;
        opts.bodyShift = 46 - p * 6;
        opts.trailIntensity = Math.max(0, 1 - p * 2);
        if(frame === 75){
          fx.push({ type: 'shockwave', dx: 50, dy: 8, color: '#ff6f1a', maxRadius: 36 });
          fx.push({ type: 'sparks', dx: 50, dy: 8, count: 14 });
          fx.push({ type: 'flash', dx: 50, dy: 0, color: '#ffe080', size: 16 });
        }
      }
      return { opts, fx };
    },
  },

  walk: {
    id: 'walk', name: 'WALK', icon: '🏃',
    duration: 200,
    looping: true,
    description: 'Marche lourde sur 100 frames, retour 100 frames (boucle aller-retour). Tangage marqué, cendres soulevées à chaque pas.',
    phases: [
      { from: 0, to: 100, label: 'Avancée' },
      { from: 100, to: 200, label: 'Retour' },
    ],
    update(frame){
      const opts = {};
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
      opts.bodyShift += Math.sin(frame * 0.22) * 0.7;
      if(frame % 12 === 0){
        fx.push({ type: 'ash', dx: -3, dy: 11, count: 2, color: '#5a3525' });
        fx.push({ type: 'ash', dx: 3, dy: 11, count: 2, color: '#5a3525' });
      }
      return { opts, fx };
    },
  },
};

export const meta = { width: 26, height: 42, groundOffsetY: 0 };
export default { draw, attacks, palette, meta };
