// src/js/render/enemies/toxic_alpha.js
// Alpha Mutant — ÉLITE.
// Plus grand (1.4x), mâchoire ressortie agressive, crête dorsale de spores,
// yeux VIOLETS brillants (contraste signature), posture droite et dominante.

export const palette = {
  flesh:        '#7fa055',
  fleshDark:    '#4a6030',
  fleshLight:   '#a8c878',
  fleshBack:    '#a08858',
  bile:         '#a8e065',
  bileDark:     '#7fc844',
  bileBright:   '#c8d845',
  scar:         '#5a3818',
  necrosis:     '#5a3825',
  necrosisDark: '#2a1808',
  pus:          '#d8c870',
  bone:         '#d4c0a0',
  boneDark:     '#7a6850',
  // Violet pour le contraste — les yeux et la crête
  violet:       '#a060c0',
  violetCore:   '#d8a0e8',
  violetDark:   '#5a2870',
  buffAura:     'rgba(160,96,192,0.35)',
  shadow:       'rgba(20,30,10,0.85)',
};

export function draw(ctx, sx, sy, t, opts){
  opts = opts || {};
  const p = palette;
  const bob = Math.sin(t * 0.04) * 0.7;
  const breathe = Math.sin(t * 0.03) * 0.4;
  sx = Math.round(sx + (opts.bodyShift || 0));
  sy = Math.round(sy + bob);

  const armRaise = opts.armRaise || 0;
  const buffActive = opts.buffActive || 0;
  const roar = opts.roar || 0;

  // Shadow (large)
  ctx.fillStyle = p.shadow;
  ctx.beginPath();
  ctx.ellipse(sx, sy + 9, 18, 4.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Buff aura (violet)
  if(buffActive > 0){
    for(let i = 0; i < 4; i++){
      const r = 24 + i * 7 + Math.sin(t * 0.12 + i) * 3;
      const a = buffActive * 0.18 * (1 - i * 0.22);
      ctx.fillStyle = `rgba(160,96,192,${a})`;
      ctx.beginPath();
      ctx.ellipse(sx, sy + 4, r, r * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Body glow (mix green + violet hint)
  const glow = 0.4 + Math.sin(t * 0.05) * 0.1;
  const bg = ctx.createRadialGradient(sx, sy - 16, 5, sx, sy - 16, 36);
  bg.addColorStop(0, `rgba(168,224,101,${glow * 0.5})`);
  bg.addColorStop(0.6, `rgba(160,96,192,${glow * 0.3})`);
  bg.addColorStop(1, 'rgba(160,96,192,0)');
  ctx.fillStyle = bg;
  ctx.fillRect(sx - 36, sy - 50, 72, 70);

  // === LEGS (épaisses, musclées) ===
  ctx.fillStyle = p.fleshDark;
  ctx.fillRect(sx - 10, sy - 1, 8, 11);
  ctx.fillRect(sx + 2, sy - 1, 8, 11);
  ctx.fillStyle = p.flesh;
  ctx.fillRect(sx - 10, sy - 1, 2, 11);
  // Knee detail (necrotic)
  ctx.fillStyle = p.necrosis;
  ctx.fillRect(sx - 9, sy + 4, 3, 2);
  ctx.fillRect(sx + 3, sy + 4, 3, 2);

  // Feet (clawed)
  ctx.fillStyle = p.necrosisDark;
  ctx.fillRect(sx - 12, sy + 10, 11, 4);
  ctx.fillRect(sx + 1, sy + 10, 11, 4);
  // Big claws
  ctx.fillStyle = p.bone;
  ctx.fillRect(sx - 12, sy + 13, 1, 2);
  ctx.fillRect(sx - 9, sy + 13, 1, 2);
  ctx.fillRect(sx - 5, sy + 13, 1, 2);
  ctx.fillRect(sx - 2, sy + 13, 1, 2);
  ctx.fillRect(sx + 1, sy + 13, 1, 2);
  ctx.fillRect(sx + 4, sy + 13, 1, 2);
  ctx.fillRect(sx + 7, sy + 13, 1, 2);
  ctx.fillRect(sx + 10, sy + 13, 1, 2);

  // === SPORE CREST (dorsal — peeks behind shoulders) ===
  drawSporeCrest(ctx, sx, sy - 32 + breathe, t, p);

  // === TORSO (large, muscular) ===
  ctx.fillStyle = p.fleshDark;
  ctx.fillRect(sx - 13, sy - 24 + breathe, 26, 23);
  ctx.fillStyle = p.flesh;
  ctx.fillRect(sx - 13, sy - 24 + breathe, 26, 21);
  ctx.fillStyle = p.fleshLight;
  ctx.fillRect(sx - 13, sy - 24 + breathe, 3, 23);

  // Pectoral musculature
  ctx.fillStyle = p.fleshDark;
  ctx.fillRect(sx - 11, sy - 19 + breathe, 9, 6);
  ctx.fillRect(sx + 2, sy - 19 + breathe, 9, 6);
  ctx.fillStyle = p.flesh;
  ctx.fillRect(sx - 11, sy - 19 + breathe, 9, 4);
  ctx.fillRect(sx + 2, sy - 19 + breathe, 9, 4);

  // Abdomen (ribs/scales pattern)
  ctx.strokeStyle = p.fleshDark;
  ctx.lineWidth = 0.6;
  ctx.beginPath();
  ctx.moveTo(sx - 10, sy - 11 + breathe); ctx.lineTo(sx + 10, sy - 11 + breathe);
  ctx.moveTo(sx - 10, sy - 7 + breathe); ctx.lineTo(sx + 10, sy - 7 + breathe);
  ctx.moveTo(sx - 9, sy - 4 + breathe); ctx.lineTo(sx + 9, sy - 4 + breathe);
  ctx.stroke();

  // Necrotic patches
  ctx.fillStyle = p.necrosis;
  ctx.beginPath();
  ctx.moveTo(sx - 7, sy - 16 + breathe);
  ctx.lineTo(sx - 3, sy - 12 + breathe);
  ctx.lineTo(sx - 6, sy - 7 + breathe);
  ctx.lineTo(sx - 9, sy - 11 + breathe);
  ctx.closePath();
  ctx.fill();

  // Pustules
  const pulse = 0.7 + Math.sin(t * 0.12) * 0.3;
  ctx.fillStyle = p.bileBright;
  ctx.beginPath();
  ctx.arc(sx + 5, sy - 9 + breathe, 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = `rgba(216,200,112,${pulse})`;
  ctx.fillRect(sx + 4, sy - 10 + breathe, 1, 1);
  ctx.fillStyle = p.bileBright;
  ctx.beginPath();
  ctx.arc(sx - 5, sy - 6 + breathe, 1, 0, Math.PI * 2);
  ctx.fill();

  // Violet veins (ancreur de l'identité Alpha)
  ctx.strokeStyle = p.violet;
  ctx.lineWidth = 0.7;
  ctx.beginPath();
  ctx.moveTo(sx - 11, sy - 22 + breathe);
  ctx.lineTo(sx - 8, sy - 17 + breathe);
  ctx.lineTo(sx - 4, sy - 14 + breathe);
  ctx.moveTo(sx + 11, sy - 22 + breathe);
  ctx.lineTo(sx + 8, sy - 17 + breathe);
  ctx.lineTo(sx + 4, sy - 14 + breathe);
  ctx.stroke();

  // Shoulder pads (massive, organic)
  ctx.fillStyle = p.fleshDark;
  ctx.fillRect(sx - 17, sy - 25 + breathe, 6, 8);
  ctx.fillRect(sx + 11, sy - 25 + breathe, 6, 8);
  ctx.fillStyle = p.flesh;
  ctx.fillRect(sx - 17, sy - 25 + breathe, 6, 2);
  ctx.fillRect(sx + 11, sy - 25 + breathe, 6, 2);
  // Bone spikes on shoulders
  ctx.fillStyle = p.bone;
  ctx.beginPath();
  ctx.moveTo(sx - 17, sy - 25 + breathe);
  ctx.lineTo(sx - 14, sy - 30 + breathe);
  ctx.lineTo(sx - 11, sy - 25 + breathe);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(sx + 11, sy - 25 + breathe);
  ctx.lineTo(sx + 14, sy - 30 + breathe);
  ctx.lineTo(sx + 17, sy - 25 + breathe);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = p.boneDark;
  ctx.fillRect(sx - 14, sy - 28 + breathe, 1, 2);
  ctx.fillRect(sx + 13, sy - 28 + breathe, 1, 2);

  // === ARMS (massive, muscular) ===
  // Left arm
  ctx.save();
  ctx.translate(sx - 16, sy - 18 + breathe);
  ctx.rotate(armRaise);
  ctx.fillStyle = p.fleshDark;
  ctx.fillRect(-3, 0, 5, 16);
  ctx.fillStyle = p.flesh;
  ctx.fillRect(-3, 0, 1, 16);
  ctx.fillStyle = p.necrosis;
  ctx.fillRect(-2, 7, 2, 3);
  // Hand (clawed)
  ctx.fillStyle = p.necrosisDark;
  ctx.fillRect(-3, 16, 6, 5);
  ctx.fillStyle = p.bone;
  ctx.fillRect(-3, 20, 1, 2);
  ctx.fillRect(-1, 20, 1, 2);
  ctx.fillRect(1, 20, 1, 2);
  ctx.fillRect(3, 20, 1, 2);
  ctx.restore();

  // Right arm
  ctx.fillStyle = p.fleshDark;
  ctx.fillRect(sx + 13, sy - 18 + breathe, 5, 16);
  ctx.fillStyle = p.flesh;
  ctx.fillRect(sx + 17, sy - 18 + breathe, 1, 16);
  ctx.fillStyle = p.necrosis;
  ctx.fillRect(sx + 14, sy - 11 + breathe, 2, 3);
  ctx.fillStyle = p.necrosisDark;
  ctx.fillRect(sx + 12, sy - 2 + breathe, 6, 5);
  ctx.fillStyle = p.bone;
  ctx.fillRect(sx + 12, sy + 2 + breathe, 1, 2);
  ctx.fillRect(sx + 14, sy + 2 + breathe, 1, 2);
  ctx.fillRect(sx + 16, sy + 2 + breathe, 1, 2);

  // === HEAD (large, dominant, mâchoire ressortie) ===
  // Cranium
  ctx.fillStyle = p.fleshDark;
  ctx.fillRect(sx - 8, sy - 38 + breathe, 16, 14);
  ctx.fillStyle = p.flesh;
  ctx.fillRect(sx - 8, sy - 38 + breathe, 16, 11);
  ctx.fillStyle = p.fleshLight;
  ctx.fillRect(sx - 8, sy - 38 + breathe, 2, 14);

  // === PROTRUDING JAW (signature) ===
  ctx.fillStyle = p.fleshDark;
  ctx.beginPath();
  ctx.moveTo(sx - 7, sy - 28 + breathe);
  ctx.lineTo(sx + 7, sy - 28 + breathe);
  ctx.lineTo(sx + 9 - roar * 2, sy - 24 + breathe + roar * 3);
  ctx.lineTo(sx - 9 + roar * 2, sy - 24 + breathe + roar * 3);
  ctx.closePath();
  ctx.fill();
  // Lower jaw pulled forward
  ctx.fillStyle = p.flesh;
  ctx.fillRect(sx - 7, sy - 27 + breathe, 14, 2 + roar);

  // Mouth (large fanged) — opens in roar
  ctx.fillStyle = '#1a0808';
  const mouthH = 2 + roar * 4;
  ctx.fillRect(sx - 6, sy - 26 + breathe, 12, mouthH);
  // Big fangs
  ctx.fillStyle = p.bone;
  for(let i = 0; i < 5; i++){
    const fx = sx - 5 + i * 3;
    ctx.beginPath();
    ctx.moveTo(fx - 0.5, sy - 26 + breathe);
    ctx.lineTo(fx, sy - 26 + breathe + mouthH * 0.7);
    ctx.lineTo(fx + 0.5, sy - 26 + breathe);
    ctx.closePath();
    ctx.fill();
  }
  // Lower fangs (when roaring)
  if(roar > 0.5){
    ctx.fillStyle = p.bone;
    ctx.beginPath();
    ctx.moveTo(sx - 4, sy - 26 + breathe + mouthH);
    ctx.lineTo(sx - 4, sy - 26 + breathe + mouthH - 2);
    ctx.lineTo(sx - 3, sy - 26 + breathe + mouthH);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(sx + 4, sy - 26 + breathe + mouthH);
    ctx.lineTo(sx + 4, sy - 26 + breathe + mouthH - 2);
    ctx.lineTo(sx + 3, sy - 26 + breathe + mouthH);
    ctx.closePath();
    ctx.fill();
  }

  // === EYES (VIOLET — signature contraste) ===
  ctx.fillStyle = '#000';
  ctx.fillRect(sx - 5, sy - 35 + breathe, 3, 3);
  ctx.fillRect(sx + 2, sy - 35 + breathe, 3, 3);
  // Violet glow
  const eyePulse = 0.92 + Math.sin(t * 0.09) * 0.08;
  ctx.fillStyle = `rgba(160,96,192,${eyePulse})`;
  ctx.fillRect(sx - 4, sy - 34 + breathe, 2, 2);
  ctx.fillRect(sx + 3, sy - 34 + breathe, 2, 2);
  ctx.fillStyle = `rgba(216,160,232,${eyePulse})`;
  ctx.fillRect(sx - 4, sy - 34 + breathe, 1, 1);
  ctx.fillRect(sx + 3, sy - 34 + breathe, 1, 1);
  // Halo violet
  ctx.fillStyle = `rgba(160,96,192,${eyePulse * 0.4})`;
  ctx.fillRect(sx - 5, sy - 35 + breathe, 4, 4);
  ctx.fillRect(sx + 2, sy - 35 + breathe, 4, 4);

  // Brow ridges (intimidating)
  ctx.fillStyle = p.scar;
  ctx.fillRect(sx - 6, sy - 36 + breathe, 4, 1);
  ctx.fillRect(sx + 2, sy - 36 + breathe, 4, 1);

  // Cranial scar
  ctx.strokeStyle = p.scar;
  ctx.lineWidth = 0.6;
  ctx.beginPath();
  ctx.moveTo(sx - 3, sy - 38 + breathe);
  ctx.lineTo(sx, sy - 36 + breathe);
  ctx.lineTo(sx + 3, sy - 37 + breathe);
  ctx.stroke();
}

function drawSporeCrest(ctx, lx, ly, t, p){
  // 5 pointes de spores derrière la tête, chacune pulsant
  const positions = [-7, -4, 0, 4, 7];
  for(let i = 0; i < positions.length; i++){
    const dx = positions[i];
    const h = 4 + Math.abs(dx) * 0.5;
    const pulse = 0.85 + Math.sin(t * 0.1 + i) * 0.15;
    // Halo violet
    ctx.fillStyle = `rgba(160,96,192,${pulse * 0.3})`;
    ctx.beginPath();
    ctx.arc(lx + dx, ly - h, h, 0, Math.PI * 2);
    ctx.fill();
    // Pointe
    ctx.fillStyle = p.violetDark;
    ctx.beginPath();
    ctx.moveTo(lx + dx, ly - h - 4);
    ctx.lineTo(lx + dx - 2, ly);
    ctx.lineTo(lx + dx + 2, ly);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = p.violet;
    ctx.beginPath();
    ctx.moveTo(lx + dx, ly - h - 4);
    ctx.lineTo(lx + dx, ly);
    ctx.lineTo(lx + dx + 2, ly);
    ctx.closePath();
    ctx.fill();
    // Bright tip
    ctx.fillStyle = `rgba(216,160,232,${pulse})`;
    ctx.fillRect(Math.round(lx + dx - 0.5), ly - h - 3, 1, 2);
  }
}

export const attacks = {
  idle: {
    id: 'idle', name: 'IDLE', icon: '◇',
    duration: 9999, looping: true,
    description: 'Posture dominante, crête de spores qui pulse, yeux violets brillants. Respiration grave.',
    phases: [{ from: 0, to: 9999, label: 'Loop' }],
    update(frame){
      const fx = [];
      if(frame % 18 === 0){
        fx.push({ type: 'ash', dx: 0, dy: -36, count: 1, color: '#a060c0' });
      }
      if(frame % 24 === 0){
        fx.push({ type: 'ash', dx: -8, dy: -32, count: 1, color: '#7fc844' });
        fx.push({ type: 'ash', dx: 8, dy: -32, count: 1, color: '#7fc844' });
      }
      return { opts: {}, fx };
    },
  },

  bite: {
    id: 'bite', name: 'ALPHA BITE', icon: '🦷',
    duration: 80,
    description: '80% Poison forte (5 tours, 4 PV). 40% lifesteal. Charge avec les mâchoires, frappe puissante avec lifesteal violet.',
    phases: [
      { from: 0, to: 25, label: 'Anticipation' },
      { from: 25, to: 38, label: 'Frappe' },
      { from: 38, to: 60, label: 'Drain' },
      { from: 60, to: 80, label: 'Recovery' },
    ],
    update(frame){
      const opts = {};
      const fx = [];
      if(frame < 25){
        const p = frame / 25;
        opts.armRaise = -p * 1.0;
        opts.roar = p * 0.4;
      } else if(frame < 38){
        const p = (frame - 25) / 13;
        opts.armRaise = -1.0 + p * 1.5;
        opts.roar = 0.4 + p * 0.6;
        if(frame === 25){
          fx.push({ type: 'sparks', dx: -18, dy: -22, count: 12, color: '#a8e065' });
          fx.push({ type: 'flash', dx: -18, dy: -22, color: '#c8d845', size: 14 });
          fx.push({ type: 'shockwave', dx: -18, dy: -16, color: '#a060c0', maxRadius: 28 });
        }
      } else if(frame < 60){
        const p = (frame - 38) / 22;
        opts.armRaise = 0.5 - p * 0.4;
        opts.roar = 1 - p;
        opts.buffActive = (1 - p) * 0.4;
        // Lifesteal drain particles
        if(frame % 3 === 0){
          fx.push({ type: 'sparks', dx: -18 + (frame - 38), dy: -16, count: 1, color: '#a060c0' });
        }
      } else {
        const p = (frame - 60) / 20;
        opts.armRaise = 0.1 - 0.1 * p;
        opts.buffActive = Math.max(0, 0.4 - p);
      }
      return { opts, fx };
    },
  },

  buffAllies: {
    id: 'buffAllies', name: 'ALPHA ROAR', icon: '📢',
    duration: 90,
    description: 'Donne +20% damage aux mutants alliés adjacents. Anim : rugit, lève la tête, aura violette se diffuse autour.',
    phases: [
      { from: 0, to: 25, label: 'Charge' },
      { from: 25, to: 60, label: 'Roar' },
      { from: 60, to: 90, label: 'Recovery' },
    ],
    update(frame){
      const opts = {};
      const fx = [];
      if(frame < 25){
        const p = frame / 25;
        opts.roar = p * 0.5;
        opts.buffActive = p * 0.4;
        if(frame % 4 === 0){
          fx.push({ type: 'sparks', dx: 0, dy: -28, count: 1, color: '#a060c0' });
        }
      } else if(frame < 60){
        opts.roar = 1;
        opts.buffActive = 1 + Math.sin(frame * 0.2) * 0.2;
        if(frame === 25){
          fx.push({ type: 'flash', dx: 0, dy: -28, color: '#d8a0e8', size: 26 });
          fx.push({ type: 'shockwave', dx: 0, dy: 4, color: '#a060c0', maxRadius: 50 });
          fx.push({ type: 'sparks', dx: 0, dy: -22, count: 18, color: '#a060c0' });
        }
        if(frame === 30){
          fx.push({ type: 'shockwave', dx: 0, dy: 4, color: '#d8a0e8', maxRadius: 40 });
        }
        if(frame === 38){
          fx.push({ type: 'shockwave', dx: 0, dy: 4, color: '#a060c0', maxRadius: 30 });
        }
      } else {
        const p = (frame - 60) / 30;
        opts.roar = 1 - p;
        opts.buffActive = Math.max(0, 1 - p);
      }
      return { opts, fx };
    },
  },

  walk: {
    id: 'walk', name: 'WALK', icon: '🏃',
    duration: 220,
    looping: true,
    description: 'Marche dominante, posture droite. Aller-retour 110/110.',
    phases: [
      { from: 0, to: 110, label: 'Avancée' },
      { from: 110, to: 220, label: 'Retour' },
    ],
    update(frame){
      const opts = {};
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
        fx.push({ type: 'ash', dx: -5, dy: 13, count: 3, color: '#7fc844' });
        fx.push({ type: 'ash', dx: 5, dy: 13, count: 3, color: '#7fc844' });
        fx.push({ type: 'ash', dx: 0, dy: -32, count: 1, color: '#a060c0' });
      }
      return { opts, fx };
    },
  },
};

export const meta = { width: 36, height: 60, groundOffsetY: 0 };
export default { draw, attacks, palette, meta };
