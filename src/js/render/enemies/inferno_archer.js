// src/js/render/enemies/inferno_archer.js
// Tireur de Phosphore — ranged.
// Garde militaire, casque tactique avec visière, arc rétro-futuriste,
// flèche au phosphore blanc-bleu (contraste fort avec le reste).

export const palette = {
  uniform:    '#3a2818',
  uniformDk:  '#1a1008',
  uniformLt:  '#5a3a28',
  vest:       '#2a1810',  // gilet renforcé
  vestStrap:  '#5a3525',
  helmet:     '#2a1410',
  helmetEdge: '#1a0a08',
  visor:      '#ff6f1a',
  visorGlow:  '#ffb347',
  bow:        '#3a1810',
  bowMetal:   '#7a4030',
  bowString:  '#aa9070',
  phosphor:   '#cef0ff',  // flèche au phosphore (blanc-bleu)
  phosphorHot:'#ffffff',
  shadow:     'rgba(0,0,0,0.7)',
};

export function draw(ctx, sx, sy, t, opts){
  opts = opts || {};
  const p = palette;
  const bob = Math.sin(t * 0.04) * 0.4;
  const breathe = Math.sin(t * 0.03) * 0.3;
  sx = Math.round(sx + (opts.bodyShift || 0));
  sy = Math.round(sy + bob);

  const drawBack = opts.drawBack !== undefined ? opts.drawBack : 0; // tension de la corde (0..1)
  const arrowOnString = opts.arrowOnString !== undefined ? opts.arrowOnString : 1;
  const arrowGlowBoost = opts.arrowGlowBoost || 0;

  // Shadow
  ctx.fillStyle = p.shadow;
  ctx.beginPath();
  ctx.ellipse(sx, sy + 6, 11, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Phosphor glow (white-blue, contraste avec la scène)
  if(arrowOnString && arrowGlowBoost === 0){
    const ag = 0.4 + Math.sin(t * 0.1) * 0.2;
    const grad = ctx.createRadialGradient(sx - 9, sy - 13 + breathe, 1, sx - 9, sy - 13 + breathe, 12);
    grad.addColorStop(0, `rgba(206,240,255,${ag})`);
    grad.addColorStop(1, 'rgba(206,240,255,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(sx - 22, sy - 25 + breathe, 26, 26);
  }

  // Legs
  ctx.fillStyle = p.uniformDk;
  ctx.fillRect(sx - 6, sy - 1, 5, 9);
  ctx.fillRect(sx + 1, sy - 1, 5, 9);
  ctx.fillStyle = p.uniform;
  ctx.fillRect(sx - 6, sy - 1, 1, 9);

  // Boots
  ctx.fillStyle = '#0a0402';
  ctx.fillRect(sx - 7, sy + 8, 7, 3);
  ctx.fillRect(sx, sy + 8, 7, 3);

  // Torso (uniform)
  ctx.fillStyle = p.uniform;
  ctx.fillRect(sx - 8, sy - 17 + breathe, 16, 16);
  ctx.fillStyle = p.uniformDk;
  ctx.fillRect(sx + 6, sy - 17 + breathe, 2, 16);

  // Tactical vest
  ctx.fillStyle = p.vest;
  ctx.fillRect(sx - 9, sy - 16 + breathe, 18, 12);
  // Vest straps + pouches
  ctx.fillStyle = p.vestStrap;
  ctx.fillRect(sx - 9, sy - 12 + breathe, 18, 1);
  ctx.fillRect(sx - 9, sy - 8 + breathe, 18, 1);
  // Pouches
  ctx.fillStyle = p.uniformDk;
  ctx.fillRect(sx - 7, sy - 6 + breathe, 4, 3);
  ctx.fillRect(sx + 3, sy - 6 + breathe, 4, 3);

  // Quiver on back (peek)
  ctx.fillStyle = p.uniformDk;
  ctx.fillRect(sx + 7, sy - 18 + breathe, 3, 11);
  // Arrows in quiver (3 fletches)
  for(let i = 0; i < 3; i++){
    ctx.fillStyle = p.phosphor;
    ctx.fillRect(sx + 8, sy - 21 + breathe + i, 1, 1);
  }

  // === ARMS HOLDING BOW ===
  // Both arms forward, holding bow horizontally
  // Front arm (gauche du sprite, qui tient l'arc)
  ctx.fillStyle = p.uniformDk;
  ctx.fillRect(sx - 11, sy - 15 + breathe, 4, 4);
  ctx.fillRect(sx - 14, sy - 14 + breathe, 5, 3);
  // Hand
  ctx.fillStyle = '#1a0805';
  ctx.fillRect(sx - 16, sy - 14 + breathe, 3, 3);

  // Back arm (droite du sprite, qui tire la corde)
  const drawArmX = -2 - drawBack * 5;
  ctx.fillStyle = p.uniformDk;
  ctx.fillRect(sx + 7, sy - 15 + breathe, 4, 4);
  ctx.fillRect(sx + drawArmX + 4, sy - 13 + breathe, 5, 3);
  // Hand on string
  ctx.fillStyle = '#1a0805';
  ctx.fillRect(sx + drawArmX + 4, sy - 13 + breathe, 3, 3);

  // === BOW (vertical, tenu de profil) ===
  const bowX = sx - 16;
  // Upper limb
  ctx.strokeStyle = p.bow;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(bowX, sy - 22 + breathe);
  ctx.quadraticCurveTo(bowX - 4, sy - 14 + breathe, bowX, sy - 6 + breathe);
  ctx.stroke();
  // Highlight metal
  ctx.strokeStyle = p.bowMetal;
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(bowX, sy - 22 + breathe);
  ctx.quadraticCurveTo(bowX - 3, sy - 14 + breathe, bowX, sy - 6 + breathe);
  ctx.stroke();

  // Bow string (tendue avec arrow)
  // String va du haut au bas de l'arc, avec un creux où la flèche est
  const stringPullX = bowX + 4 + drawBack * 5;
  ctx.strokeStyle = p.bowString;
  ctx.lineWidth = 0.6;
  ctx.beginPath();
  ctx.moveTo(bowX, sy - 22 + breathe);
  ctx.lineTo(stringPullX, sy - 14 + breathe);
  ctx.lineTo(bowX, sy - 6 + breathe);
  ctx.stroke();

  // === ARROW ON STRING ===
  if(arrowOnString){
    const arrowLen = 14 + drawBack * 4;
    const arrowStartX = stringPullX;
    const arrowEndX = arrowStartX + arrowLen;
    const arrowY = sy - 14 + breathe;
    // Shaft
    ctx.fillStyle = '#5a3a28';
    ctx.fillRect(arrowStartX, arrowY, arrowLen, 1);
    // Phosphor head (white-blue, glow)
    const ag = 0.85 + arrowGlowBoost;
    ctx.fillStyle = `rgba(206,240,255,${ag})`;
    ctx.fillRect(arrowEndX - 3, arrowY - 1, 4, 3);
    ctx.fillStyle = `rgba(255,255,255,${ag})`;
    ctx.fillRect(arrowEndX - 2, arrowY, 2, 1);
    // Glowing core dot at tip
    ctx.fillStyle = '#fff';
    ctx.fillRect(arrowEndX, arrowY, 1, 1);
    // Halo around arrowhead
    if(arrowGlowBoost > 0 || true){
      const glowR = 5 + arrowGlowBoost * 6;
      const grad = ctx.createRadialGradient(arrowEndX, arrowY, 0, arrowEndX, arrowY, glowR);
      grad.addColorStop(0, `rgba(206,240,255,${0.7 + arrowGlowBoost * 0.3})`);
      grad.addColorStop(1, 'rgba(206,240,255,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(arrowEndX - glowR, arrowY - glowR, glowR * 2, glowR * 2);
    }
    // Fletches (blue)
    ctx.fillStyle = p.phosphor;
    ctx.fillRect(arrowStartX - 1, arrowY - 1, 2, 1);
    ctx.fillRect(arrowStartX - 1, arrowY + 1, 2, 1);
  }

  // === HEAD : casque tactique avec visière ===
  ctx.fillStyle = p.helmetEdge;
  ctx.fillRect(sx - 7, sy - 28 + breathe, 14, 11);
  ctx.fillStyle = p.helmet;
  ctx.fillRect(sx - 7, sy - 28 + breathe, 14, 8);

  // Top edge highlight
  ctx.fillStyle = '#3a1810';
  ctx.fillRect(sx - 7, sy - 28 + breathe, 14, 1);

  // Side strap (mentonnière)
  ctx.fillStyle = p.vestStrap;
  ctx.fillRect(sx - 7, sy - 19 + breathe, 1, 2);
  ctx.fillRect(sx + 6, sy - 19 + breathe, 1, 2);

  // Visor (orange, descend devant les yeux)
  const visorPulse = 0.85 + Math.sin(t * 0.06) * 0.15;
  ctx.fillStyle = `rgba(255,107,26,${visorPulse})`;
  ctx.fillRect(sx - 6, sy - 22 + breathe, 12, 3);
  // Visor highlight
  ctx.fillStyle = `rgba(255,179,71,${visorPulse})`;
  ctx.fillRect(sx - 6, sy - 22 + breathe, 12, 1);
  // Visor reflection
  ctx.fillStyle = '#fff';
  ctx.fillRect(sx - 4, sy - 22 + breathe, 1, 1);
  ctx.fillRect(sx + 3, sy - 22 + breathe, 1, 1);

  // Helmet front antenna
  ctx.fillStyle = p.uniformDk;
  ctx.fillRect(sx + 4, sy - 30 + breathe, 1, 3);
}

export const attacks = {
  idle: {
    id: 'idle', name: 'IDLE', icon: '◇',
    duration: 9999, looping: true,
    description: 'Position de tir relâchée, corde légèrement tendue. Visière qui pulse, halo phosphore autour de la flèche.',
    phases: [{ from: 0, to: 9999, label: 'Loop' }],
    update(){ return { opts: { drawBack: 0.2 }, fx: [] }; },
  },

  phosphorShot: {
    id: 'phosphorShot', name: 'PHOSPHOR SHOT', icon: '🏹',
    duration: 75,
    description: 'Tir au phosphore blanc. Range 5. 20% chance d\'appliquer Brûlure (2 tours). Charge la flèche, tire, replace une nouvelle.',
    phases: [
      { from: 0, to: 30, label: 'Tension' },
      { from: 30, to: 38, label: 'Tir' },
      { from: 38, to: 55, label: 'Hold' },
      { from: 55, to: 75, label: 'Reload' },
    ],
    update(frame){
      const opts = {};
      const fx = [];
      if(frame < 30){
        const p = frame / 30;
        opts.drawBack = 0.2 + p * 0.8;
        opts.arrowOnString = 1;
        opts.arrowGlowBoost = p * 0.6;
        if(frame % 5 === 0 && frame > 10){
          fx.push({ type: 'sparks', dx: -10, dy: -10, count: 1, color: '#cef0ff' });
        }
      } else if(frame < 38){
        // Tir
        opts.drawBack = 0;
        opts.arrowOnString = 0;
        if(frame === 30){
          fx.push({ type: 'flash', dx: -10, dy: -10, color: '#cef0ff', size: 14 });
          fx.push({ type: 'sparks', dx: -10, dy: -10, count: 8, color: '#cef0ff' });
        }
      } else if(frame < 55){
        opts.drawBack = 0;
        opts.arrowOnString = 0;
      } else {
        // Reload
        const p = (frame - 55) / 20;
        opts.drawBack = p * 0.2;
        opts.arrowOnString = p > 0.3 ? 1 : 0;
      }
      return { opts, fx };
    },
  },

  walk: {
    id: 'walk', name: 'WALK', icon: '🏃',
    duration: 90,
    description: 'Recule en gardant la cible en visée. Corde maintenue tendue.',
    phases: [{ from: 0, to: 90, label: 'Recul' }],
    update(frame){
      const opts = { drawBack: 0.3 };
      const fx = [];
      opts.bodyShift = Math.sin(frame * 0.18) * 0.4;
      if(frame % 15 === 0 && frame < 80){
        fx.push({ type: 'ash', dx: 0, dy: 11, count: 1, color: '#5a3525' });
      }
      return { opts, fx };
    },
  },
};

export const meta = { width: 24, height: 38, groundOffsetY: 0 };
export default { draw, attacks, palette, meta };
