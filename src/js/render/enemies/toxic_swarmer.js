// src/js/render/enemies/toxic_swarmer.js
// Essaim Bourdonnant — pas un humanoïde mais une nuée d'insectes mutants.
// Forme globale qui suggère un torse + bras bourdonnants, composé de dizaines
// de petits insectes verdâtres qui orbitent. Yeux rouges multiples.

export const palette = {
  bug:         '#5a8030',
  bugDark:     '#2a4815',
  bugLight:    '#7fc844',
  bugHot:      '#a8e065',
  bugWing:     'rgba(168,224,101,0.55)',
  eye:         '#ff3030',
  eyeCore:     '#ff8a8a',
  cloud:       'rgba(127,200,68,0.25)',
  shadow:      'rgba(20,30,10,0.5)',
};

// L'essaim utilise un nombre fixe d'insectes positionnés dynamiquement.
// On précalcule des paramètres d'orbite pour garder une cohérence visuelle.
const SWARM_BUGS = [];
for(let i = 0; i < 24; i++){
  SWARM_BUGS.push({
    rx: 4 + Math.random() * 9,
    ry: 6 + Math.random() * 12,
    angle: Math.random() * Math.PI * 2,
    speed: 0.04 + Math.random() * 0.05,
    yOffset: -8 - Math.random() * 12,
    size: 0.7 + Math.random() * 0.6,
    phase: Math.random() * Math.PI * 2,
  });
}

export function draw(ctx, sx, sy, t, opts){
  opts = opts || {};
  const p = palette;
  sx = Math.round(sx + (opts.bodyShift || 0));
  // Pas de bobbing global, l'essaim oscille sur place

  const compress = opts.compress || 0; // 0..1, l'essaim se compresse pour frapper
  const cohesion = opts.cohesion !== undefined ? opts.cohesion : 1; // 0..1, dispersion vs cohésion

  // Shadow (large diffuse)
  ctx.fillStyle = p.shadow;
  ctx.beginPath();
  ctx.ellipse(sx, sy + 7, 14 - compress * 6, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Cloud of green spores (background du swarm)
  for(let i = 0; i < 5; i++){
    const r = 18 + i * 3 + Math.sin(t * 0.06 + i) * 2;
    const a = 0.12 * (1 - i * 0.2) * cohesion;
    ctx.fillStyle = `rgba(127,200,68,${a})`;
    ctx.beginPath();
    ctx.ellipse(sx, sy - 8, r, r * 0.8, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Inner glow
  const grad = ctx.createRadialGradient(sx, sy - 8, 4, sx, sy - 8, 22);
  grad.addColorStop(0, `rgba(168,224,101,${0.35 + Math.sin(t * 0.08) * 0.1})`);
  grad.addColorStop(1, 'rgba(168,224,101,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(sx - 22, sy - 30, 44, 38);

  // Render each bug in the swarm
  // En mode "compress", tous les bugs convergent vers un point (pour bite anim)
  for(const bug of SWARM_BUGS){
    const localT = t * bug.speed + bug.phase;
    let x, y;
    if(compress > 0){
      // Convergent vers (sx-12, sy-6) (devant l'essaim, vers la cible)
      const targetX = sx - 12;
      const targetY = sy - 6;
      const baseX = sx + Math.cos(localT) * bug.rx * cohesion;
      const baseY = sy + bug.yOffset + Math.sin(localT * 1.3) * bug.ry * 0.3 * cohesion;
      x = baseX + (targetX - baseX) * compress;
      y = baseY + (targetY - baseY) * compress;
    } else {
      x = sx + Math.cos(localT) * bug.rx * cohesion;
      y = sy + bug.yOffset + Math.sin(localT * 1.3) * bug.ry * 0.3 * cohesion;
    }
    drawBug(ctx, Math.round(x), Math.round(y), localT, bug.size, p);
  }

  // Core mass (a darker dense cluster in the middle, suggesting the body)
  ctx.fillStyle = p.bugDark;
  ctx.beginPath();
  ctx.ellipse(sx, sy - 8, 5 - compress * 2, 6 - compress * 2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = p.bug;
  ctx.beginPath();
  ctx.ellipse(sx, sy - 8, 3, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Multiple red eyes (suggested in the cluster)
  const eyePulse = 0.85 + Math.sin(t * 0.1) * 0.15;
  ctx.fillStyle = `rgba(255,48,48,${eyePulse})`;
  ctx.fillRect(sx - 2, sy - 11, 1, 1);
  ctx.fillRect(sx + 1, sy - 11, 1, 1);
  ctx.fillRect(sx - 1, sy - 8, 1, 1);
  ctx.fillRect(sx + 2, sy - 6, 1, 1);
  ctx.fillRect(sx - 3, sy - 6, 1, 1);
}

function drawBug(ctx, lx, ly, t, scale, p){
  const sz = 1.5 * scale;
  // Wing blur (oval)
  const wingFlap = 0.7 + Math.sin(t * 3) * 0.3;
  ctx.fillStyle = p.bugWing;
  ctx.beginPath();
  ctx.ellipse(lx, ly, sz * 1.8, sz * 0.6 * wingFlap, 0, 0, Math.PI * 2);
  ctx.fill();
  // Body
  ctx.fillStyle = p.bugDark;
  ctx.fillRect(Math.round(lx - sz / 2), Math.round(ly - sz / 2), Math.round(sz), Math.round(sz));
  ctx.fillStyle = p.bug;
  ctx.fillRect(Math.round(lx - sz / 2), Math.round(ly - sz / 2), Math.max(1, Math.round(sz - 1)), Math.max(1, Math.round(sz - 1)));
  // Tiny red eye dot (random subset)
  if(scale > 0.9){
    ctx.fillStyle = p.eye;
    ctx.fillRect(Math.round(lx), Math.round(ly), 1, 1);
  }
}

export const attacks = {
  idle: {
    id: 'idle', name: 'IDLE', icon: '◇',
    duration: 9999, looping: true,
    description: 'L\'essaim oscille sur place, insectes orbitent, bourdonnement constant. Spores vertes diffusent autour.',
    phases: [{ from: 0, to: 9999, label: 'Loop' }],
    update(frame){
      const fx = [];
      if(frame % 14 === 0){
        const angle = Math.random() * Math.PI * 2;
        fx.push({ type: 'ash', dx: Math.cos(angle) * 16, dy: -8 + Math.sin(angle) * 12, count: 1, color: '#7fc844' });
      }
      return { opts: { cohesion: 1, compress: 0 }, fx };
    },
  },

  bite: {
    id: 'bite', name: 'SWARM BITE', icon: '🦟',
    duration: 60,
    description: 'L\'essaim se compresse pour frapper la cible. 70% chance Poison faible (cumulable). Les insectes convergent puis se dispersent.',
    phases: [
      { from: 0, to: 18, label: 'Compress' },
      { from: 18, to: 30, label: 'Strike' },
      { from: 30, to: 60, label: 'Disperse' },
    ],
    update(frame){
      const opts = {};
      const fx = [];
      if(frame < 18){
        const p = frame / 18;
        opts.compress = p * 0.4;
        opts.cohesion = 1 + p * 0.3; // se rapproche
      } else if(frame < 30){
        const p = (frame - 18) / 12;
        opts.compress = 0.4 + p * 0.5;
        opts.cohesion = 1.3 - p * 0.3;
        if(frame === 18){
          fx.push({ type: 'sparks', dx: -14, dy: -6, count: 12, color: '#a8e065' });
          fx.push({ type: 'shockwave', dx: -14, dy: -4, color: '#7fc844', maxRadius: 22 });
          fx.push({ type: 'flash', dx: -14, dy: -6, color: '#c8e845', size: 12 });
        }
      } else {
        const p = (frame - 30) / 30;
        opts.compress = Math.max(0, 0.9 - p * 1.2);
        opts.cohesion = 1 + Math.sin(frame * 0.3) * 0.3;
        // Particules qui s'éparpillent
        if(frame % 3 === 0){
          fx.push({ type: 'sparks', dx: -10 + (Math.random() - 0.5) * 16, dy: -6 + (Math.random() - 0.5) * 12, count: 1, color: '#a8e065' });
        }
      }
      return { opts, fx };
    },
  },

  walk: {
    id: 'walk', name: 'DRIFT', icon: '🏃',
    duration: 160,
    looping: true,
    description: 'L\'essaim dérive vers l\'avant puis revient. Aller-retour 80/80. Insectes traînent derrière.',
    phases: [
      { from: 0, to: 80, label: 'Avancée' },
      { from: 80, to: 160, label: 'Retour' },
    ],
    update(frame){
      const opts = { cohesion: 0.85, compress: 0 };
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
      if(frame % 6 === 0){
        const angle = Math.random() * Math.PI * 2;
        fx.push({ type: 'ash', dx: -8 + Math.cos(angle) * 8, dy: -8 + Math.sin(angle) * 8, count: 1, color: '#7fc844' });
      }
      return { opts, fx };
    },
  },
};

export const meta = { width: 28, height: 36, groundOffsetY: 0 };
export default { draw, attacks, palette, meta };
