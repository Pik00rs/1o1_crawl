// src/js/render/enemies/inferno_berserker.js
// Berserker Carbonisé — ÉLITE.
// Plus grand (1.4x hero), exo-armure de sécurité fracturée,
// énorme flamberge enflammée à 2 mains. Antenne de casque arrachée.

export const palette = {
  armor:       '#3a1a14',
  armorDark:   '#1a0a05',
  armorLight:  '#5a2a1c',
  armorPlate:  '#7a3825',
  helmet:      '#2a1008',
  helmetEdge:  '#5a2818',
  helmetCrack: '#1a0805',
  visor:       '#ff3015',
  visorHot:    '#ff8a4d',
  smoke:       'rgba(80,50,40,0.4)',
  flame:       '#ff6f1a',
  flameHot:    '#ffb347',
  flameCore:   '#ffe080',
  blade:       '#3a1a10',
  bladeMetal:  '#5a3025',
  bladeEdge:   '#1a0805',
  rage:        '#ff3015',
  shadow:      'rgba(0,0,0,0.8)',
};

export function draw(ctx, sx, sy, t, opts){
  opts = opts || {};
  const p = palette;
  const SCALE = 1.0; // sprite déjà drawn larger
  const bob = Math.sin(t * 0.04) * 0.7;
  const breathe = Math.sin(t * 0.03) * 0.4;
  sx = Math.round(sx + (opts.bodyShift || 0));
  sy = Math.round(sy + bob);

  const swordRaise = opts.swordRaise || 0;
  const bladeGlow = opts.bladeGlow !== undefined ? opts.bladeGlow : 0.5;
  const rageActive = opts.rageActive || 0; // 0..1, intensity de l'aura rage

  // Shadow (large)
  ctx.fillStyle = p.shadow;
  ctx.beginPath();
  ctx.ellipse(sx, sy + 9, 19, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Rage aura (anim passive quand <50% HP)
  if(rageActive > 0){
    for(let i = 0; i < 3; i++){
      const r = 28 + i * 6 + Math.sin(t * 0.12 + i) * 3;
      const a = rageActive * 0.18 * (1 - i * 0.25);
      ctx.fillStyle = `rgba(255,48,21,${a})`;
      ctx.beginPath();
      ctx.ellipse(sx, sy + 6, r, r * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    // Embers from feet
    if(t % 4 === 0){
      // (laissé au fx system côté caller via update)
    }
  }

  // Body glow
  const glow = 0.45 + Math.sin(t * 0.06) * 0.15;
  const bg = ctx.createRadialGradient(sx, sy - 14, 5, sx, sy - 14, 36);
  bg.addColorStop(0, `rgba(255,107,26,${glow})`);
  bg.addColorStop(1, 'rgba(255,107,26,0)');
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

  // Boots
  ctx.fillStyle = p.helmetCrack;
  ctx.fillRect(sx - 12, sy + 10, 11, 4);
  ctx.fillRect(sx + 1, sy + 10, 11, 4);
  ctx.fillStyle = p.flame;
  ctx.fillRect(sx - 12, sy + 13, 11, 1);
  ctx.fillRect(sx + 1, sy + 13, 11, 1);

  // === TORSO : exo-armure imposante, fissurée ===
  // Lower torso
  ctx.fillStyle = p.armorDark;
  ctx.fillRect(sx - 13, sy - 3 + breathe, 26, 4);
  // Main chest plate
  ctx.fillStyle = p.armor;
  ctx.fillRect(sx - 14, sy - 24 + breathe, 28, 22);
  ctx.fillStyle = p.armorLight;
  ctx.fillRect(sx - 14, sy - 24 + breathe, 3, 22);
  ctx.fillStyle = p.armorDark;
  ctx.fillRect(sx + 11, sy - 24 + breathe, 3, 22);

  // Pectoral plate (relief)
  ctx.fillStyle = p.armorPlate;
  ctx.beginPath();
  ctx.moveTo(sx - 11, sy - 22 + breathe);
  ctx.lineTo(sx + 11, sy - 22 + breathe);
  ctx.lineTo(sx + 8, sy - 12 + breathe);
  ctx.lineTo(sx - 8, sy - 12 + breathe);
  ctx.closePath();
  ctx.fill();

  // Cracks across plate (3 majeures, smoke escaping)
  const crackPulse = 0.85 + Math.sin(t * 0.07) * 0.15;
  ctx.strokeStyle = `rgba(255,107,26,${crackPulse})`;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(sx - 9, sy - 20 + breathe);
  ctx.lineTo(sx - 5, sy - 14 + breathe);
  ctx.lineTo(sx - 8, sy - 8 + breathe);
  ctx.moveTo(sx + 6, sy - 21 + breathe);
  ctx.lineTo(sx + 3, sy - 15 + breathe);
  ctx.lineTo(sx + 7, sy - 9 + breathe);
  ctx.moveTo(sx, sy - 18 + breathe);
  ctx.lineTo(sx - 1, sy - 12 + breathe);
  ctx.lineTo(sx + 1, sy - 6 + breathe);
  ctx.stroke();
  ctx.strokeStyle = `rgba(255,224,128,${crackPulse * 0.6})`;
  ctx.lineWidth = 0.7;
  ctx.beginPath();
  ctx.moveTo(sx - 7, sy - 18 + breathe); ctx.lineTo(sx - 7, sy - 14 + breathe);
  ctx.moveTo(sx + 5, sy - 19 + breathe); ctx.lineTo(sx + 5, sy - 14 + breathe);
  ctx.stroke();

  // Smoke escaping the cracks
  if(t % 3 === 0){
    ctx.fillStyle = p.smoke;
    ctx.fillRect(sx - 6, sy - 26 + breathe, 1, 1);
    ctx.fillRect(sx + 4, sy - 27 + breathe, 1, 1);
  }

  // Shoulder pads (plus larges que le torse)
  ctx.fillStyle = p.armorDark;
  ctx.fillRect(sx - 17, sy - 25 + breathe, 5, 7);
  ctx.fillRect(sx + 12, sy - 25 + breathe, 5, 7);
  ctx.fillStyle = p.armorLight;
  ctx.fillRect(sx - 17, sy - 25 + breathe, 5, 1);
  ctx.fillRect(sx + 12, sy - 25 + breathe, 5, 1);
  // Spike on each shoulder
  ctx.fillStyle = p.armorLight;
  ctx.beginPath();
  ctx.moveTo(sx - 17, sy - 25 + breathe);
  ctx.lineTo(sx - 14, sy - 30 + breathe);
  ctx.lineTo(sx - 11, sy - 25 + breathe);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(sx + 12, sy - 25 + breathe);
  ctx.lineTo(sx + 15, sy - 30 + breathe);
  ctx.lineTo(sx + 18, sy - 25 + breathe);
  ctx.closePath();
  ctx.fill();

  // === ARMS holding flamberge with both hands ===
  // Left arm (front)
  ctx.fillStyle = p.armorDark;
  ctx.fillRect(sx - 16, sy - 18 + breathe, 5, 14);
  ctx.fillStyle = p.armor;
  ctx.fillRect(sx - 16, sy - 18 + breathe, 1, 14);
  // Left glove
  ctx.fillStyle = p.helmetCrack;
  ctx.fillRect(sx - 17, sy - 4 + breathe, 6, 5);

  // Right arm
  ctx.save();
  ctx.translate(sx + 13, sy - 18 + breathe);
  ctx.rotate(swordRaise);
  ctx.fillStyle = p.armorDark;
  ctx.fillRect(-2, 0, 5, 14);
  ctx.fillStyle = p.armor;
  ctx.fillRect(-2, 0, 1, 14);
  ctx.fillStyle = p.helmetCrack;
  ctx.fillRect(-2, 14, 6, 5);

  // === FLAMBERGE ===
  drawFlamberge(ctx, 1, 18, t, bladeGlow, p);
  ctx.restore();

  // === HEAD : casque blindé ===
  // Helmet base
  ctx.fillStyle = p.helmetEdge;
  ctx.fillRect(sx - 10, sy - 38 + breathe, 20, 14);
  ctx.fillStyle = p.helmet;
  ctx.fillRect(sx - 10, sy - 38 + breathe, 20, 11);

  // Top edge highlights
  ctx.fillStyle = p.helmetEdge;
  ctx.fillRect(sx - 10, sy - 38 + breathe, 20, 2);
  ctx.fillStyle = p.armorPlate;
  ctx.fillRect(sx - 9, sy - 38 + breathe, 18, 1);

  // Antenna mount (broken antenna)
  ctx.fillStyle = p.helmetEdge;
  ctx.fillRect(sx + 5, sy - 41 + breathe, 2, 3);
  // Broken stub
  ctx.fillStyle = p.armorDark;
  ctx.fillRect(sx + 5, sy - 42 + breathe, 1, 1);

  // Cracks on helmet
  ctx.strokeStyle = `rgba(255,107,26,${crackPulse * 0.8})`;
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(sx - 7, sy - 36 + breathe);
  ctx.lineTo(sx - 4, sy - 32 + breathe);
  ctx.lineTo(sx - 7, sy - 28 + breathe);
  ctx.stroke();

  // Visor (large band, rouge intense, pas orange — différent du Brûlant)
  const visorPulse = rageActive > 0 ? (0.95 + Math.sin(t * 0.15) * 0.05) : (0.85 + Math.sin(t * 0.05) * 0.15);
  ctx.fillStyle = `rgba(255,48,21,${visorPulse})`;
  ctx.fillRect(sx - 8, sy - 32 + breathe, 16, 3);
  ctx.fillStyle = `rgba(255,138,77,${visorPulse})`;
  ctx.fillRect(sx - 8, sy - 32 + breathe, 16, 1);
  // Visor reflections
  ctx.fillStyle = '#fff';
  ctx.fillRect(sx - 6, sy - 31 + breathe, 1, 1);
  ctx.fillRect(sx + 5, sy - 31 + breathe, 1, 1);

  // Chin guard
  ctx.fillStyle = p.helmetEdge;
  ctx.fillRect(sx - 8, sy - 27 + breathe, 16, 3);
}

function drawFlamberge(ctx, lx, ly, t, glow, p){
  // Le pommeau est au pivot, la lame s'étend vers le haut
  // Pommeau
  ctx.fillStyle = p.bladeEdge;
  ctx.beginPath();
  ctx.arc(lx, ly + 3, 2.5, 0, Math.PI * 2);
  ctx.fill();
  // Pommeau highlight
  ctx.fillStyle = p.bladeMetal;
  ctx.fillRect(lx - 1, ly + 2, 1, 1);

  // Grip
  ctx.fillStyle = p.bladeEdge;
  ctx.fillRect(lx - 1, ly - 8, 3, 11);
  ctx.fillStyle = p.bladeMetal;
  ctx.fillRect(lx, ly - 8, 1, 11);

  // Cross-guard (large)
  ctx.fillStyle = p.armorPlate;
  ctx.fillRect(lx - 7, ly - 10, 15, 3);
  ctx.fillStyle = p.bladeMetal;
  ctx.fillRect(lx - 7, ly - 10, 15, 1);
  // Spike on guard
  ctx.beginPath();
  ctx.moveTo(lx - 7, ly - 10);
  ctx.lineTo(lx - 9, ly - 12);
  ctx.lineTo(lx - 7, ly - 12);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(lx + 8, ly - 10);
  ctx.lineTo(lx + 10, ly - 12);
  ctx.lineTo(lx + 8, ly - 12);
  ctx.closePath();
  ctx.fill();

  // Blade (large, en pointe, ondulée façon flamberge)
  ctx.fillStyle = p.bladeMetal;
  ctx.beginPath();
  ctx.moveTo(lx - 4, ly - 10);
  ctx.lineTo(lx - 3, ly - 14);
  ctx.lineTo(lx - 4, ly - 18);
  ctx.lineTo(lx - 2, ly - 22);
  ctx.lineTo(lx - 3, ly - 26);
  ctx.lineTo(lx, ly - 32);
  ctx.lineTo(lx + 3, ly - 26);
  ctx.lineTo(lx + 2, ly - 22);
  ctx.lineTo(lx + 4, ly - 18);
  ctx.lineTo(lx + 3, ly - 14);
  ctx.lineTo(lx + 4, ly - 10);
  ctx.closePath();
  ctx.fill();
  // Blade highlight
  ctx.fillStyle = p.armorPlate;
  ctx.beginPath();
  ctx.moveTo(lx - 1, ly - 10);
  ctx.lineTo(lx, ly - 30);
  ctx.lineTo(lx + 1, ly - 10);
  ctx.closePath();
  ctx.fill();

  // Flame on blade
  if(glow > 0){
    // Inner flame
    ctx.fillStyle = `rgba(255,107,26,${0.85 * glow})`;
    ctx.beginPath();
    ctx.moveTo(lx - 5, ly - 10);
    ctx.lineTo(lx - 4, ly - 18);
    ctx.lineTo(lx - 6, ly - 24);
    ctx.lineTo(lx - 3, ly - 30);
    ctx.lineTo(lx, ly - 36 + Math.sin(t * 0.2) * 2);
    ctx.lineTo(lx + 3, ly - 30);
    ctx.lineTo(lx + 6, ly - 24);
    ctx.lineTo(lx + 4, ly - 18);
    ctx.lineTo(lx + 5, ly - 10);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = `rgba(255,179,71,${0.85 * glow})`;
    ctx.beginPath();
    ctx.moveTo(lx - 3, ly - 10);
    ctx.lineTo(lx - 2, ly - 20);
    ctx.lineTo(lx, ly - 32);
    ctx.lineTo(lx + 2, ly - 20);
    ctx.lineTo(lx + 3, ly - 10);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = `rgba(255,224,128,${glow})`;
    ctx.beginPath();
    ctx.moveTo(lx - 1, ly - 12);
    ctx.lineTo(lx, ly - 28);
    ctx.lineTo(lx + 1, ly - 12);
    ctx.closePath();
    ctx.fill();

    // Halo
    const grad = ctx.createRadialGradient(lx, ly - 22, 2, lx, ly - 22, 14);
    grad.addColorStop(0, `rgba(255,138,77,${0.4 * glow})`);
    grad.addColorStop(1, 'rgba(255,138,77,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(lx - 14, ly - 36, 28, 28);
  }
}

export const attacks = {
  idle: {
    id: 'idle', name: 'IDLE', icon: '◇',
    duration: 9999, looping: true,
    description: 'Repos, flamberge tenue verticalement. Lame qui pulse, fumée qui s\'échappe des fissures de l\'armure, visière rouge.',
    phases: [{ from: 0, to: 9999, label: 'Loop' }],
    update(frame){
      const fx = [];
      if(frame % 14 === 0){
        fx.push({ type: 'ash', dx: 0, dy: -22, count: 1, color: '#5a3525' });
      }
      return { opts: { swordRaise: 0, bladeGlow: 0.6 }, fx };
    },
  },

  cleave: {
    id: 'cleave', name: 'CLEAVE', icon: '⚔️',
    duration: 90,
    description: 'Slash circulaire AOE 3 cases devant. Anticipation lourde, swing horizontal massif, traînée de flammes.',
    phases: [
      { from: 0, to: 30, label: 'Anticipation' },
      { from: 30, to: 45, label: 'Swing' },
      { from: 45, to: 90, label: 'Recovery' },
    ],
    update(frame){
      const opts = {};
      const fx = [];
      if(frame < 30){
        const p = frame / 30;
        opts.swordRaise = -0.3 - p * 1.0;
        opts.bladeGlow = 0.6 + p * 0.4;
        if(frame > 20 && frame % 3 === 0){
          fx.push({ type: 'sparks', dx: 12, dy: -22, count: 1, color: '#ffb347' });
        }
      } else if(frame < 45){
        const p = (frame - 30) / 15;
        opts.swordRaise = -1.3 + 1.7 * p;
        opts.bladeGlow = 1;
        if(frame === 30){
          fx.push({ type: 'shockwave', dx: 14, dy: 0, color: '#ff6f1a', maxRadius: 38 });
        }
        if(frame === 35){
          fx.push({ type: 'sparks', dx: 14, dy: 0, count: 12, color: '#ffd47a' });
          fx.push({ type: 'flash', dx: 14, dy: -4, color: '#ffe080', size: 14 });
        }
        if(frame === 38){
          fx.push({ type: 'shockwave', dx: 14, dy: 0, color: '#ff8a4d', maxRadius: 30 });
        }
      } else {
        const p = (frame - 45) / 45;
        opts.swordRaise = 0.4 - 0.4 * p;
        opts.bladeGlow = 1 - p * 0.4;
      }
      return { opts, fx };
    },
  },

  rage: {
    id: 'rage', name: 'RAGE', icon: '💢',
    duration: 90, passive: true,
    description: 'Passif activé sous 50% HP : +30% dégâts. Visuel : aura rouge pulsante au sol, visière qui devient incandescente, traînée d\'embers.',
    phases: [
      { from: 0, to: 30, label: 'Activation' },
      { from: 30, to: 90, label: 'Stable' },
    ],
    update(frame){
      const opts = { swordRaise: 0, bladeGlow: 0.8 };
      const fx = [];
      if(frame < 30){
        const p = frame / 30;
        opts.rageActive = p;
        if(frame === 0){
          fx.push({ type: 'shockwave', dx: 0, dy: 8, color: '#ff3015', maxRadius: 40 });
          fx.push({ type: 'flash', dx: 0, dy: -10, color: '#ff3015', size: 22 });
        }
      } else {
        opts.rageActive = 1 + Math.sin(frame * 0.15) * 0.1;
        if(frame % 5 === 0){
          const angle = Math.random() * Math.PI * 2;
          fx.push({
            type: 'ash',
            dx: Math.cos(angle) * 18,
            dy: 8 + Math.sin(angle) * 4,
            count: 1,
            color: '#ff3015',
          });
        }
      }
      return { opts, fx };
    },
  },

  walk: {
    id: 'walk', name: 'WALK', icon: '🏃',
    duration: 220,
    looping: true,
    description: 'Marche pesante d\'élite armuré sur 110 frames puis retour (boucle aller-retour). Plaques qui s\'entrechoquent visuellement.',
    phases: [
      { from: 0, to: 110, label: 'Avancée' },
      { from: 110, to: 220, label: 'Retour' },
    ],
    update(frame){
      const opts = { swordRaise: 0, bladeGlow: 0.6 };
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
        fx.push({ type: 'ash', dx: -5, dy: 13, count: 3, color: '#5a3525' });
        fx.push({ type: 'ash', dx: 5, dy: 13, count: 3, color: '#5a3525' });
        fx.push({ type: 'sparks', dx: 0, dy: 13, count: 1 });
      }
      return { opts, fx };
    },
  },
};

export const meta = { width: 36, height: 60, groundOffsetY: 0 }; // élite, plus grand
export default { draw, attacks, palette, meta };
