// src/js/render/enemies/toxic_carrier.js
// Porteur de Plaies — mêlée avec deathCloud et bleed.
// Silhouette humanoïde couverte de plaques de bactéries vertes brillantes,
// spores qui s'échappent en permanence, lames courbées en main.

export const palette = {
  flesh:       '#5a6840',
  fleshDark:   '#3a4828',
  fleshLight:  '#7a8858',
  bacteria:    '#a8c440',
  bacteriaHot: '#c8e845',
  bacteriaCore:'#e8f880',
  bacteriaDark:'#5a7820',
  rags:        '#3a3018',
  ragsDark:    '#1a1408',
  blade:       '#5a6048',
  bladeMetal:  '#8a8870',
  bladeRust:   '#7a3a18',
  blood:       '#a02020',
  shadow:      'rgba(20,30,10,0.75)',
};

export function draw(ctx, sx, sy, t, opts){
  opts = opts || {};
  const p = palette;
  const bob = Math.sin(t * 0.045) * 0.5;
  const breathe = Math.sin(t * 0.035) * 0.3;
  sx = Math.round(sx + (opts.bodyShift || 0));
  sy = Math.round(sy + bob);

  const armRaise = opts.armRaise || 0;
  const cloudActive = opts.cloudActive || 0;

  // Shadow
  ctx.fillStyle = p.shadow;
  ctx.beginPath();
  ctx.ellipse(sx, sy + 7, 12, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Death cloud aura (when activated)
  if(cloudActive > 0){
    for(let i = 0; i < 4; i++){
      const r = 22 + i * 6 + Math.sin(t * 0.1 + i) * 3;
      const a = cloudActive * 0.2 * (1 - i * 0.22);
      ctx.fillStyle = `rgba(127,200,68,${a})`;
      ctx.beginPath();
      ctx.ellipse(sx, sy + 4, r, r * 0.45, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Soft green glow
  const glow = 0.35 + Math.sin(t * 0.06) * 0.1;
  const bg = ctx.createRadialGradient(sx, sy - 12, 4, sx, sy - 12, 28);
  bg.addColorStop(0, `rgba(168,196,64,${glow * 0.5})`);
  bg.addColorStop(1, 'rgba(168,196,64,0)');
  ctx.fillStyle = bg;
  ctx.fillRect(sx - 28, sy - 40, 56, 50);

  // Legs
  ctx.fillStyle = p.fleshDark;
  ctx.fillRect(sx - 7, sy - 1, 6, 9);
  ctx.fillRect(sx + 1, sy - 1, 6, 9);
  ctx.fillStyle = p.flesh;
  ctx.fillRect(sx - 7, sy - 1, 1, 9);
  // Bacterial patches on legs
  drawBacteriaPatch(ctx, sx - 4, sy + 4, t, 0.6, p);
  drawBacteriaPatch(ctx, sx + 5, sy + 5, t + 30, 0.5, p);

  // Boots
  ctx.fillStyle = p.ragsDark;
  ctx.fillRect(sx - 8, sy + 8, 7, 3);
  ctx.fillRect(sx + 1, sy + 8, 7, 3);

  // Loincloth / rags around hips
  ctx.fillStyle = p.ragsDark;
  ctx.fillRect(sx - 8, sy - 4 + breathe, 16, 5);
  ctx.fillStyle = p.rags;
  ctx.fillRect(sx - 8, sy - 4 + breathe, 16, 3);

  // Torso (cover with bacteria)
  ctx.fillStyle = p.fleshDark;
  ctx.fillRect(sx - 8, sy - 19 + breathe, 16, 16);
  ctx.fillStyle = p.flesh;
  ctx.fillRect(sx - 8, sy - 19 + breathe, 16, 14);
  ctx.fillStyle = p.fleshLight;
  ctx.fillRect(sx - 8, sy - 19 + breathe, 2, 16);

  // === BACTERIAL PLATES (signature feature) ===
  // Large patch on chest
  drawBacteriaPatch(ctx, sx - 2, sy - 14 + breathe, t, 1.4, p);
  drawBacteriaPatch(ctx, sx + 4, sy - 11 + breathe, t + 50, 1.0, p);
  drawBacteriaPatch(ctx, sx - 5, sy - 8 + breathe, t + 100, 0.9, p);
  drawBacteriaPatch(ctx, sx + 2, sy - 6 + breathe, t + 80, 0.8, p);

  // Arms
  // Left arm holding the curved blade
  ctx.save();
  ctx.translate(sx - 8, sy - 17 + breathe);
  ctx.rotate(armRaise);
  ctx.fillStyle = p.fleshDark;
  ctx.fillRect(-3, 0, 5, 13);
  ctx.fillStyle = p.flesh;
  ctx.fillRect(-3, 0, 1, 13);
  // Bacteria on arm
  drawBacteriaPatch(ctx, -1, 4, t + 20, 0.7, p);
  // Hand
  ctx.fillStyle = p.ragsDark;
  ctx.fillRect(-3, 13, 5, 4);
  // === CURVED BLADE ===
  drawCurvedBlade(ctx, 0, 17, t, p);
  ctx.restore();

  // Right arm
  ctx.fillStyle = p.fleshDark;
  ctx.fillRect(sx + 7, sy - 17 + breathe, 4, 13);
  ctx.fillStyle = p.flesh;
  ctx.fillRect(sx + 10, sy - 17 + breathe, 1, 13);
  drawBacteriaPatch(ctx, sx + 8, sy - 12 + breathe, t + 70, 0.6, p);
  ctx.fillStyle = p.ragsDark;
  ctx.fillRect(sx + 7, sy - 4 + breathe, 4, 3);

  // Head
  ctx.fillStyle = p.fleshDark;
  ctx.fillRect(sx - 6, sy - 30 + breathe, 12, 11);
  ctx.fillStyle = p.flesh;
  ctx.fillRect(sx - 6, sy - 30 + breathe, 12, 9);
  ctx.fillStyle = p.fleshLight;
  ctx.fillRect(sx - 6, sy - 30 + breathe, 2, 11);

  // Bacteria on head
  drawBacteriaPatch(ctx, sx + 2, sy - 26 + breathe, t + 40, 0.7, p);
  drawBacteriaPatch(ctx, sx - 4, sy - 22 + breathe, t + 110, 0.5, p);

  // Eyes
  ctx.fillStyle = '#000';
  ctx.fillRect(sx - 4, sy - 26 + breathe, 2, 2);
  ctx.fillRect(sx + 2, sy - 26 + breathe, 2, 2);
  const eyePulse = 0.85 + Math.sin(t * 0.08) * 0.15;
  ctx.fillStyle = `rgba(232,248,128,${eyePulse})`;
  ctx.fillRect(sx - 3, sy - 25 + breathe, 1, 1);
  ctx.fillRect(sx + 3, sy - 25 + breathe, 1, 1);

  // Mouth (sealed by bacteria — détail dérangeant)
  ctx.fillStyle = p.bacteriaDark;
  ctx.fillRect(sx - 3, sy - 22 + breathe, 6, 1);
  ctx.fillStyle = p.bacteriaHot;
  ctx.fillRect(sx - 3, sy - 22 + breathe, 1, 1);
  ctx.fillRect(sx + 2, sy - 22 + breathe, 1, 1);
}

function drawBacteriaPatch(ctx, lx, ly, t, scale, p){
  // Plaque irrégulière de bactéries qui pulsent
  const pulse = 0.85 + Math.sin(t * 0.1) * 0.15;
  // Outer (darker)
  ctx.fillStyle = p.bacteriaDark;
  ctx.fillRect(lx - 2 * scale, ly - 1.5 * scale, 4 * scale, 3 * scale);
  // Main (bright green)
  ctx.fillStyle = p.bacteria;
  ctx.fillRect(lx - 1.5 * scale, ly - 1 * scale, 3 * scale, 2 * scale);
  // Hot spots (smaller bright dots)
  ctx.fillStyle = `rgba(200,232,69,${pulse})`;
  ctx.fillRect(Math.round(lx - 1 * scale), Math.round(ly), Math.max(1, Math.round(scale)), 1);
  // Glow center
  ctx.fillStyle = p.bacteriaCore;
  ctx.fillRect(Math.round(lx), Math.round(ly), 1, 1);
}

function drawCurvedBlade(ctx, lx, ly, t, p){
  // Pommeau
  ctx.fillStyle = p.bladeRust;
  ctx.fillRect(lx - 1, ly + 2, 3, 2);
  // Grip
  ctx.fillStyle = p.ragsDark;
  ctx.fillRect(lx, ly - 4, 1, 6);
  // Curved blade (sickle-like)
  ctx.fillStyle = p.bladeRust;
  ctx.beginPath();
  ctx.moveTo(lx, ly - 4);
  ctx.lineTo(lx + 6, ly - 8);
  ctx.lineTo(lx + 8, ly - 4);
  ctx.lineTo(lx + 5, ly - 2);
  ctx.lineTo(lx + 1, ly - 4);
  ctx.closePath();
  ctx.fill();
  // Highlight
  ctx.fillStyle = p.bladeMetal;
  ctx.beginPath();
  ctx.moveTo(lx, ly - 4);
  ctx.lineTo(lx + 5, ly - 7);
  ctx.lineTo(lx + 4, ly - 4);
  ctx.closePath();
  ctx.fill();
  // Blood stain
  ctx.fillStyle = p.blood;
  ctx.fillRect(lx + 5, ly - 4, 1, 1);
  // Bacteria on blade
  ctx.fillStyle = p.bacteria;
  ctx.fillRect(lx + 2, ly - 6, 1, 1);
}

export const attacks = {
  idle: {
    id: 'idle', name: 'IDLE', icon: '◇',
    duration: 9999, looping: true,
    description: 'Spores et bactéries qui pulsent en permanence sur la peau. Posture menaçante avec lame courbée.',
    phases: [{ from: 0, to: 9999, label: 'Loop' }],
    update(frame){
      const fx = [];
      if(frame % 12 === 0){
        const angle = Math.random() * Math.PI * 2;
        fx.push({ type: 'ash', dx: Math.cos(angle) * 10, dy: -10 + Math.sin(angle) * 8, count: 1, color: '#a8c440' });
      }
      return { opts: {}, fx };
    },
  },

  slash: {
    id: 'slash', name: 'BLADE SLASH', icon: '⚔',
    duration: 65,
    description: 'Coup mêlée avec la lame courbée. 60% chance Bleed (saignement). Slash horizontal.',
    phases: [
      { from: 0, to: 20, label: 'Anticipation' },
      { from: 20, to: 30, label: 'Frappe' },
      { from: 30, to: 65, label: 'Recovery' },
    ],
    update(frame){
      const opts = {};
      const fx = [];
      if(frame < 20){
        const p = frame / 20;
        opts.armRaise = -p * 1.0;
      } else if(frame < 30){
        const p = (frame - 20) / 10;
        opts.armRaise = -1.0 + p * 1.5;
        if(frame === 20){
          fx.push({ type: 'sparks', dx: -14, dy: -6, count: 8, color: '#a02020' });
          fx.push({ type: 'flash', dx: -14, dy: -6, color: '#c8e845', size: 11 });
          fx.push({ type: 'shockwave', dx: -14, dy: -4, color: '#a8c440', maxRadius: 22 });
        }
        if(frame === 24){
          fx.push({ type: 'sparks', dx: -14, dy: -2, count: 4, color: '#a8c440' });
        }
      } else {
        const p = (frame - 30) / 35;
        opts.armRaise = 0.5 - 0.5 * p;
      }
      return { opts, fx };
    },
  },

  deathCloud: {
    id: 'deathCloud', name: 'DEATH CLOUD', icon: '☣',
    duration: 90, passive: true,
    description: 'Quand tué : nuage poison 2x2 cases pendant 3 tours. Anim : bactéries explosent, nuage vert se déploie.',
    phases: [
      { from: 0, to: 30, label: 'Crack' },
      { from: 30, to: 50, label: 'Explosion' },
      { from: 50, to: 90, label: 'Spread' },
    ],
    update(frame){
      const opts = {};
      const fx = [];
      if(frame < 30){
        const p = frame / 30;
        opts.cloudActive = p * 0.6;
        if(frame % 4 === 0){
          fx.push({ type: 'sparks', dx: (Math.random() - 0.5) * 18, dy: -10 + (Math.random() - 0.5) * 16, count: 1, color: '#c8e845' });
        }
      } else if(frame < 50){
        opts.cloudActive = 1;
        if(frame === 30){
          fx.push({ type: 'flash', dx: 0, dy: -10, color: '#c8e845', size: 28 });
          fx.push({ type: 'shockwave', dx: 0, dy: 4, color: '#7fc844', maxRadius: 56 });
          fx.push({ type: 'sparks', dx: 0, dy: -8, count: 28, color: '#a8e065' });
        }
        if(frame === 36){
          fx.push({ type: 'shockwave', dx: 0, dy: 4, color: '#a8c440', maxRadius: 46 });
        }
        if(frame === 42){
          fx.push({ type: 'shockwave', dx: 0, dy: 4, color: '#a8e065', maxRadius: 36 });
        }
      } else {
        const p = (frame - 50) / 40;
        opts.cloudActive = 1 - p * 0.5;
        // Cloud particles drifting
        if(frame % 4 === 0){
          const angle = Math.random() * Math.PI * 2;
          fx.push({ type: 'ash', dx: Math.cos(angle) * 26, dy: 4 + Math.sin(angle) * 12, count: 1, color: '#7fc844' });
        }
      }
      return { opts, fx };
    },
  },

  walk: {
    id: 'walk', name: 'WALK', icon: '🏃',
    duration: 200,
    looping: true,
    description: 'Marche menaçante, lame ballotte. Aller-retour 100/100.',
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
      opts.bodyShift += Math.sin(frame * 0.18) * 0.5;
      if(frame % 14 === 0){
        fx.push({ type: 'ash', dx: -3, dy: 11, count: 2, color: '#7fc844' });
        fx.push({ type: 'ash', dx: 3, dy: 11, count: 2, color: '#7fc844' });
      }
      return { opts, fx };
    },
  },
};

export const meta = { width: 24, height: 38, groundOffsetY: 0 };
export default { draw, attacks, palette, meta };
