// src/js/render/enemies/cryo_sentinel.js
// Sentinelle de Glace — ÉLITE.
// Plus grand (1.4x hero), armure militaire complète recouverte de gel permanent,
// casque fermé avec visière bleue, hallebarde à 2 mains avec tête en glace.

export const palette = {
  armor:        '#3a5878',
  armorDark:    '#1a2838',
  armorLight:   '#5a7898',
  armorPlate:   '#7a98b0',
  armorRivet:   '#0a1418',
  helmet:       '#28384a',
  helmetEdge:   '#0a1418',
  visor:        '#4fc3f7',
  visorHot:     '#aee6ff',
  ice:          '#aee6ff',
  iceCore:      '#e0f5ff',
  iceDark:      '#4fc3f7',
  frost:        '#cef0ff',
  shaft:        '#28384a',
  shaftMetal:   '#5a7898',
  shadow:       'rgba(20,40,60,0.85)',
};

export function draw(ctx, sx, sy, t, opts){
  opts = opts || {};
  const p = palette;
  const bob = Math.sin(t * 0.035) * 0.6;
  const breathe = Math.sin(t * 0.025) * 0.4;
  sx = Math.round(sx + (opts.bodyShift || 0));
  sy = Math.round(sy + bob);

  const halberdRaise = opts.halberdRaise || 0;
  const bladeGlow = opts.bladeGlow !== undefined ? opts.bladeGlow : 0.5;
  const shatterActive = opts.shatterActive || 0;

  // Shadow (large)
  ctx.fillStyle = p.shadow;
  ctx.beginPath();
  ctx.ellipse(sx, sy + 9, 19, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Shatter aura (passive — visuel à l'activation)
  if(shatterActive > 0){
    for(let i = 0; i < 4; i++){
      const r = 22 + i * 7 + Math.sin(t * 0.15 + i) * 3;
      const a = shatterActive * 0.22 * (1 - i * 0.22);
      ctx.fillStyle = `rgba(174,230,255,${a})`;
      ctx.beginPath();
      ctx.ellipse(sx, sy + 6, r, r * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Body glow
  const glow = 0.35 + Math.sin(t * 0.05) * 0.1;
  const bg = ctx.createRadialGradient(sx, sy - 14, 5, sx, sy - 14, 36);
  bg.addColorStop(0, `rgba(174,230,255,${glow * 0.5})`);
  bg.addColorStop(1, 'rgba(174,230,255,0)');
  ctx.fillStyle = bg;
  ctx.fillRect(sx - 36, sy - 50, 72, 70);

  // === LEGS (épaisses, armurées) ===
  ctx.fillStyle = p.armorDark;
  ctx.fillRect(sx - 10, sy - 1, 8, 11);
  ctx.fillRect(sx + 2, sy - 1, 8, 11);
  ctx.fillStyle = p.armor;
  ctx.fillRect(sx - 10, sy - 1, 2, 11);
  // Knee plates
  ctx.fillStyle = p.armorLight;
  ctx.fillRect(sx - 10, sy + 3, 8, 2);
  ctx.fillRect(sx + 2, sy + 3, 8, 2);
  // Frost patches on knees
  ctx.fillStyle = p.ice;
  ctx.fillRect(sx - 9, sy + 4, 2, 1);
  ctx.fillRect(sx + 5, sy + 4, 2, 1);

  // Boots
  ctx.fillStyle = p.helmetEdge;
  ctx.fillRect(sx - 12, sy + 10, 11, 4);
  ctx.fillRect(sx + 1, sy + 10, 11, 4);
  // Frost on boots
  ctx.fillStyle = p.iceCore;
  ctx.fillRect(sx - 12, sy + 13, 11, 1);
  ctx.fillRect(sx + 1, sy + 13, 11, 1);

  // === TORSO : armure imposante ===
  ctx.fillStyle = p.armorDark;
  ctx.fillRect(sx - 13, sy - 3 + breathe, 26, 4);
  ctx.fillStyle = p.armor;
  ctx.fillRect(sx - 14, sy - 24 + breathe, 28, 22);
  ctx.fillStyle = p.armorLight;
  ctx.fillRect(sx - 14, sy - 24 + breathe, 3, 22);
  ctx.fillStyle = p.armorDark;
  ctx.fillRect(sx + 11, sy - 24 + breathe, 3, 22);

  // Pectoral plate
  ctx.fillStyle = p.armorPlate;
  ctx.beginPath();
  ctx.moveTo(sx - 11, sy - 22 + breathe);
  ctx.lineTo(sx + 11, sy - 22 + breathe);
  ctx.lineTo(sx + 8, sy - 12 + breathe);
  ctx.lineTo(sx - 8, sy - 12 + breathe);
  ctx.closePath();
  ctx.fill();

  // Frost layer (fissures cyan brillantes)
  const crackPulse = 0.85 + Math.sin(t * 0.07) * 0.15;
  ctx.strokeStyle = `rgba(174,230,255,${crackPulse})`;
  ctx.lineWidth = 1.0;
  ctx.beginPath();
  ctx.moveTo(sx - 9, sy - 20 + breathe);
  ctx.lineTo(sx - 5, sy - 15 + breathe);
  ctx.lineTo(sx - 8, sy - 9 + breathe);
  ctx.moveTo(sx + 7, sy - 21 + breathe);
  ctx.lineTo(sx + 4, sy - 14 + breathe);
  ctx.lineTo(sx + 7, sy - 8 + breathe);
  ctx.moveTo(sx, sy - 18 + breathe);
  ctx.lineTo(sx - 1, sy - 11 + breathe);
  ctx.stroke();

  // Frost on shoulders (rivets gelés)
  ctx.fillStyle = p.armorRivet;
  ctx.beginPath();
  ctx.arc(sx - 11, sy - 21 + breathe, 1.5, 0, Math.PI * 2);
  ctx.arc(sx + 11, sy - 21 + breathe, 1.5, 0, Math.PI * 2);
  ctx.arc(sx - 11, sy - 7 + breathe, 1.5, 0, Math.PI * 2);
  ctx.arc(sx + 11, sy - 7 + breathe, 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = p.frost;
  ctx.fillRect(sx - 11, sy - 22 + breathe, 1, 1);
  ctx.fillRect(sx + 11, sy - 22 + breathe, 1, 1);

  // Shoulder pads (pas de spike contrairement à l'inferno_berserker, plus militaire)
  ctx.fillStyle = p.armorDark;
  ctx.fillRect(sx - 17, sy - 25 + breathe, 5, 7);
  ctx.fillRect(sx + 12, sy - 25 + breathe, 5, 7);
  ctx.fillStyle = p.armorLight;
  ctx.fillRect(sx - 17, sy - 25 + breathe, 5, 1);
  ctx.fillRect(sx + 12, sy - 25 + breathe, 5, 1);
  // Ice crystal on each shoulder
  ctx.fillStyle = p.iceDark;
  ctx.fillRect(sx - 16, sy - 28 + breathe, 3, 3);
  ctx.fillRect(sx + 13, sy - 28 + breathe, 3, 3);
  ctx.fillStyle = p.iceCore;
  ctx.fillRect(sx - 15, sy - 27 + breathe, 1, 1);
  ctx.fillRect(sx + 14, sy - 27 + breathe, 1, 1);

  // === ARMS holding the halberd (2 mains) ===
  // Left arm (front, supports the haft)
  ctx.fillStyle = p.armorDark;
  ctx.fillRect(sx - 16, sy - 18 + breathe, 5, 14);
  ctx.fillStyle = p.armor;
  ctx.fillRect(sx - 16, sy - 18 + breathe, 1, 14);
  ctx.fillStyle = p.helmetEdge;
  ctx.fillRect(sx - 17, sy - 4 + breathe, 6, 5);

  // Right arm (back, controls the halberd)
  ctx.save();
  ctx.translate(sx + 13, sy - 18 + breathe);
  ctx.rotate(halberdRaise);
  ctx.fillStyle = p.armorDark;
  ctx.fillRect(-2, 0, 5, 14);
  ctx.fillStyle = p.armor;
  ctx.fillRect(-2, 0, 1, 14);
  ctx.fillStyle = p.helmetEdge;
  ctx.fillRect(-2, 14, 6, 5);
  // === HALBERD ===
  drawHalberd(ctx, 1, 18, t, bladeGlow, p);
  ctx.restore();

  // === HEAD : casque fermé militaire ===
  ctx.fillStyle = p.helmetEdge;
  ctx.fillRect(sx - 10, sy - 38 + breathe, 20, 14);
  ctx.fillStyle = p.helmet;
  ctx.fillRect(sx - 10, sy - 38 + breathe, 20, 11);

  // Top edge
  ctx.fillStyle = p.helmetEdge;
  ctx.fillRect(sx - 10, sy - 38 + breathe, 20, 2);
  ctx.fillStyle = p.armor;
  ctx.fillRect(sx - 9, sy - 38 + breathe, 18, 1);

  // Frost on top of helmet
  ctx.fillStyle = p.frost;
  ctx.fillRect(sx - 8, sy - 39 + breathe, 16, 1);
  // Ice crystal on crown
  drawHelmetCrest(ctx, sx, sy - 41 + breathe, t, p);

  // Side cheek guards (full helmet)
  ctx.fillStyle = p.armorDark;
  ctx.fillRect(sx - 10, sy - 27 + breathe, 3, 4);
  ctx.fillRect(sx + 7, sy - 27 + breathe, 3, 4);

  // Visor (large band, cyan)
  const visorPulse = 0.85 + Math.sin(t * 0.06) * 0.15;
  ctx.fillStyle = `rgba(79,195,247,${visorPulse})`;
  ctx.fillRect(sx - 8, sy - 32 + breathe, 16, 3);
  ctx.fillStyle = `rgba(174,230,255,${visorPulse})`;
  ctx.fillRect(sx - 8, sy - 32 + breathe, 16, 1);
  // Reflections
  ctx.fillStyle = '#fff';
  ctx.fillRect(sx - 6, sy - 31 + breathe, 1, 1);
  ctx.fillRect(sx + 5, sy - 31 + breathe, 1, 1);

  // Vertical seam on visor
  ctx.fillStyle = p.helmetEdge;
  ctx.fillRect(sx, sy - 32 + breathe, 0.5, 3);

  // Chin guard
  ctx.fillStyle = p.helmetEdge;
  ctx.fillRect(sx - 8, sy - 27 + breathe, 16, 3);
}

function drawHalberd(ctx, lx, ly, t, glow, p){
  // Pommeau (bottom counter-weight)
  ctx.fillStyle = p.helmetEdge;
  ctx.beginPath();
  ctx.arc(lx, ly + 4, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = p.shaftMetal;
  ctx.fillRect(lx - 1, ly + 2, 1, 2);

  // Shaft (long, descend de bas en haut)
  ctx.fillStyle = p.shaft;
  ctx.fillRect(lx - 1, ly - 26, 3, 32);
  ctx.fillStyle = p.shaftMetal;
  ctx.fillRect(lx, ly - 26, 1, 32);

  // Cross guard (where blade attaches)
  ctx.fillStyle = p.armorDark;
  ctx.fillRect(lx - 4, ly - 26, 8, 2);
  ctx.fillStyle = p.armorPlate;
  ctx.fillRect(lx - 4, ly - 26, 8, 1);

  // === HALBERD HEAD : ice axe blade + spike ===
  // Main axe blade (large curved chunk of ice on the front)
  ctx.fillStyle = p.iceDark;
  ctx.beginPath();
  ctx.moveTo(lx + 1, ly - 26);
  ctx.lineTo(lx + 10, ly - 30);
  ctx.lineTo(lx + 12, ly - 24);
  ctx.lineTo(lx + 8, ly - 20);
  ctx.lineTo(lx + 1, ly - 22);
  ctx.closePath();
  ctx.fill();
  // Highlight
  ctx.fillStyle = p.ice;
  ctx.beginPath();
  ctx.moveTo(lx + 1, ly - 26);
  ctx.lineTo(lx + 8, ly - 28);
  ctx.lineTo(lx + 6, ly - 23);
  ctx.lineTo(lx + 1, ly - 24);
  ctx.closePath();
  ctx.fill();
  // Sharp edge
  ctx.fillStyle = p.iceCore;
  ctx.fillRect(lx + 8, ly - 30, 3, 1);
  ctx.fillRect(lx + 10, ly - 26, 1, 4);

  // Top spike (pointe au-dessus)
  ctx.fillStyle = p.iceDark;
  ctx.beginPath();
  ctx.moveTo(lx, ly - 26);
  ctx.lineTo(lx - 1, ly - 38);
  ctx.lineTo(lx + 2, ly - 38);
  ctx.lineTo(lx + 3, ly - 26);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = p.ice;
  ctx.beginPath();
  ctx.moveTo(lx, ly - 26);
  ctx.lineTo(lx, ly - 38);
  ctx.lineTo(lx + 2, ly - 38);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = p.iceCore;
  ctx.fillRect(lx, ly - 38, 1, 12);

  // Back hook (small hook on the back of the axe head)
  ctx.fillStyle = p.iceDark;
  ctx.beginPath();
  ctx.moveTo(lx - 1, ly - 26);
  ctx.lineTo(lx - 5, ly - 28);
  ctx.lineTo(lx - 4, ly - 24);
  ctx.lineTo(lx - 1, ly - 24);
  ctx.closePath();
  ctx.fill();

  // Glow on the ice blade
  if(glow > 0){
    const grad = ctx.createRadialGradient(lx + 6, ly - 26, 2, lx + 6, ly - 26, 14);
    grad.addColorStop(0, `rgba(174,230,255,${0.5 * glow})`);
    grad.addColorStop(1, 'rgba(174,230,255,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(lx - 8, ly - 40, 26, 26);
  }
}

function drawHelmetCrest(ctx, lx, ly, t, p){
  const pulse = 0.7 + Math.sin(t * 0.12) * 0.3;
  ctx.fillStyle = p.iceDark;
  ctx.beginPath();
  ctx.moveTo(lx, ly - 4);
  ctx.lineTo(lx - 2, ly);
  ctx.lineTo(lx + 2, ly);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = `rgba(255,255,255,${pulse})`;
  ctx.fillRect(lx - 0.5, ly - 3, 1, 3);
}

export const attacks = {
  idle: {
    id: 'idle', name: 'IDLE', icon: '◇',
    duration: 9999, looping: true,
    description: 'Garde militaire au repos, hallebarde verticale, lame de glace pulsante. Crête de casque scintille.',
    phases: [{ from: 0, to: 9999, label: 'Loop' }],
    update(frame){
      const fx = [];
      if(frame % 18 === 0){
        fx.push({ type: 'ash', dx: 0, dy: -22, count: 1, color: '#aee6ff' });
      }
      return { opts: { halberdRaise: 0, bladeGlow: 0.6 }, fx };
    },
  },

  cleave: {
    id: 'cleave', name: 'CLEAVE', icon: '⚔',
    duration: 95,
    description: 'Slash AOE 2 cases avec la hallebarde. 40% chance d\'appliquer Chill (-1 PA). Anticipation, swing horizontal massif.',
    phases: [
      { from: 0, to: 32, label: 'Anticipation' },
      { from: 32, to: 48, label: 'Swing' },
      { from: 48, to: 95, label: 'Recovery' },
    ],
    update(frame){
      const opts = {};
      const fx = [];
      if(frame < 32){
        const p = frame / 32;
        opts.halberdRaise = -0.3 - p * 1.0;
        opts.bladeGlow = 0.6 + p * 0.4;
        if(frame > 22 && frame % 3 === 0){
          fx.push({ type: 'sparks', dx: 12, dy: -22, count: 1, color: '#aee6ff' });
        }
      } else if(frame < 48){
        const p = (frame - 32) / 16;
        opts.halberdRaise = -1.3 + 1.7 * p;
        opts.bladeGlow = 1;
        if(frame === 32){
          fx.push({ type: 'shockwave', dx: 14, dy: 0, color: '#aee6ff', maxRadius: 36 });
        }
        if(frame === 38){
          fx.push({ type: 'sparks', dx: 14, dy: 0, count: 14, color: '#e0f5ff' });
          fx.push({ type: 'flash', dx: 14, dy: -4, color: '#fff', size: 14 });
        }
        if(frame === 42){
          fx.push({ type: 'shockwave', dx: 14, dy: 0, color: '#4fc3f7', maxRadius: 28 });
        }
      } else {
        const p = (frame - 48) / 47;
        opts.halberdRaise = 0.4 - 0.4 * p;
        opts.bladeGlow = 1 - p * 0.4;
      }
      return { opts, fx };
    },
  },

  iceShatter: {
    id: 'iceShatter', name: 'ICE SHATTER', icon: '💥',
    duration: 80, passive: true,
    description: 'Quand tué : explose en éclats de glace AOE 2 cases. Visuel : armure se craquelle, lumière interne saturée, puis détonation.',
    phases: [
      { from: 0, to: 35, label: 'Crack' },
      { from: 35, to: 50, label: 'Detonation' },
      { from: 50, to: 80, label: 'Aftermath' },
    ],
    update(frame){
      const opts = { halberdRaise: 0, bladeGlow: 0.6 };
      const fx = [];
      if(frame < 35){
        const p = frame / 35;
        opts.shatterActive = p;
        if(frame % 4 === 0){
          fx.push({ type: 'sparks', dx: (Math.random() - 0.5) * 24, dy: -16 + (Math.random() - 0.5) * 16, count: 1, color: '#aee6ff' });
        }
      } else if(frame < 50){
        opts.shatterActive = 1;
        if(frame === 35){
          fx.push({ type: 'flash', dx: 0, dy: -16, color: '#fff', size: 32 });
          fx.push({ type: 'shockwave', dx: 0, dy: 0, color: '#aee6ff', maxRadius: 60 });
          fx.push({ type: 'sparks', dx: 0, dy: -10, count: 30, color: '#e0f5ff' });
        }
        if(frame === 40){
          fx.push({ type: 'shockwave', dx: 0, dy: 0, color: '#4fc3f7', maxRadius: 50 });
        }
        if(frame === 45){
          fx.push({ type: 'shockwave', dx: 0, dy: 0, color: '#aee6ff', maxRadius: 38 });
        }
      } else {
        const p = (frame - 50) / 30;
        opts.shatterActive = Math.max(0, 1 - p * 1.2);
        if(frame % 5 === 0 && p < 0.7){
          fx.push({ type: 'ash', dx: (Math.random() - 0.5) * 30, dy: 4 + (Math.random() - 0.5) * 12, count: 1, color: '#aee6ff' });
        }
      }
      return { opts, fx };
    },
  },

  walk: {
    id: 'walk', name: 'WALK', icon: '🏃',
    duration: 220,
    looping: true,
    description: 'Marche pesante d\'élite armuré sur 110 frames puis retour (boucle). Plaques qui s\'entrechoquent visuellement.',
    phases: [
      { from: 0, to: 110, label: 'Avancée' },
      { from: 110, to: 220, label: 'Retour' },
    ],
    update(frame){
      const opts = { halberdRaise: 0, bladeGlow: 0.6 };
      const fx = [];
      const half = 110;
      let p;
      if(frame < half){
        p = frame / half;
        opts.bodyShift = p * 38;
      } else {
        p = (frame - half) / half;
        opts.bodyShift = (1 - p) * 38;
      }
      opts.bodyShift += Math.sin(frame * 0.18) * 0.7;
      if(frame % 14 === 0){
        fx.push({ type: 'ash', dx: -5, dy: 13, count: 3, color: '#aee6ff' });
        fx.push({ type: 'ash', dx: 5, dy: 13, count: 3, color: '#aee6ff' });
        fx.push({ type: 'sparks', dx: 0, dy: 13, count: 1, color: '#e0f5ff' });
      }
      return { opts, fx };
    },
  },
};

export const meta = { width: 36, height: 60, groundOffsetY: 0 };
export default { draw, attacks, palette, meta };
