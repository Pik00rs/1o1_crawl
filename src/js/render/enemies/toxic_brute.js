// src/js/render/enemies/toxic_brute.js
// Mutant Putréfié — brute mêlée avec lifesteal.
// Silhouette voûtée, peau verdâtre tachée de bave, plaques nécrosées,
// bras longs asymétriques, bouche pleine de bile qui dégouline.

export const palette = {
  flesh:       '#7fa055',  // chair vert pâle
  fleshDark:   '#4a6030',
  fleshLight:  '#a8c878',
  necrosis:    '#5a3825',  // chair brune nécrosée
  necrosisDark:'#2a1808',
  bile:        '#a8e065',
  bileDark:    '#7fc844',
  bileBright:  '#c8d845',
  pus:         '#d8c870',
  vein:        '#7a3a8a',  // veines violettes (contraste)
  bone:        '#a8a888',
  shadow:      'rgba(20,30,10,0.75)',
};

export function draw(ctx, sx, sy, t, opts){
  opts = opts || {};
  const p = palette;
  const bob = Math.sin(t * 0.045) * 0.6;
  const breathe = Math.sin(t * 0.035) * 0.4;
  sx = Math.round(sx + (opts.bodyShift || 0));
  sy = Math.round(sy + bob);

  const armRaise = opts.armRaise || 0;
  const lifestealGlow = opts.lifestealGlow || 0;

  // Shadow
  ctx.fillStyle = p.shadow;
  ctx.beginPath();
  ctx.ellipse(sx, sy + 7, 13, 3.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Lifesteal glow (violet quand active)
  if(lifestealGlow > 0){
    for(let i = 0; i < 3; i++){
      const r = 16 + i * 5 + Math.sin(t * 0.15 + i) * 2;
      const a = lifestealGlow * 0.22 * (1 - i * 0.3);
      ctx.fillStyle = `rgba(122,58,138,${a})`;
      ctx.beginPath();
      ctx.ellipse(sx, sy - 6, r, r * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Soft green body glow (perma)
  const glow = 0.3 + Math.sin(t * 0.06) * 0.1;
  const bg = ctx.createRadialGradient(sx, sy - 10, 4, sx, sy - 10, 26);
  bg.addColorStop(0, `rgba(168,224,101,${glow * 0.4})`);
  bg.addColorStop(1, 'rgba(168,224,101,0)');
  ctx.fillStyle = bg;
  ctx.fillRect(sx - 26, sy - 36, 52, 50);

  // Legs (épaisses, tordues)
  ctx.fillStyle = p.fleshDark;
  ctx.fillRect(sx - 8, sy - 1, 6, 9);
  ctx.fillRect(sx + 2, sy - 1, 6, 9);
  ctx.fillStyle = p.flesh;
  ctx.fillRect(sx - 8, sy - 1, 2, 9);

  // Necrotic patches on legs
  ctx.fillStyle = p.necrosis;
  ctx.fillRect(sx - 6, sy + 3, 3, 2);
  ctx.fillRect(sx + 4, sy + 4, 2, 1);

  // Feet (déformés, griffus)
  ctx.fillStyle = p.necrosisDark;
  ctx.fillRect(sx - 9, sy + 8, 8, 3);
  ctx.fillRect(sx + 1, sy + 8, 8, 3);
  // Claws
  ctx.fillStyle = p.bone;
  ctx.fillRect(sx - 9, sy + 11, 1, 1);
  ctx.fillRect(sx - 5, sy + 11, 1, 1);
  ctx.fillRect(sx + 4, sy + 11, 1, 1);
  ctx.fillRect(sx + 8, sy + 11, 1, 1);

  // Torso (voûté, large)
  ctx.fillStyle = p.fleshDark;
  ctx.beginPath();
  ctx.moveTo(sx - 11, sy - 18 + breathe);
  ctx.lineTo(sx + 11, sy - 18 + breathe);
  ctx.lineTo(sx + 9, sy - 1);
  ctx.lineTo(sx - 9, sy - 1);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = p.flesh;
  ctx.fillRect(sx - 9, sy - 17 + breathe, 18, 16);
  ctx.fillStyle = p.fleshLight;
  ctx.fillRect(sx - 9, sy - 17 + breathe, 2, 16);

  // Necrotic plaques (chair brune exposée)
  ctx.fillStyle = p.necrosis;
  ctx.beginPath();
  ctx.moveTo(sx - 5, sy - 14 + breathe);
  ctx.lineTo(sx - 1, sy - 11 + breathe);
  ctx.lineTo(sx - 4, sy - 7 + breathe);
  ctx.lineTo(sx - 7, sy - 9 + breathe);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = p.necrosisDark;
  ctx.fillRect(sx - 3, sy - 12 + breathe, 1, 1);

  ctx.fillStyle = p.necrosis;
  ctx.beginPath();
  ctx.moveTo(sx + 4, sy - 16 + breathe);
  ctx.lineTo(sx + 7, sy - 13 + breathe);
  ctx.lineTo(sx + 5, sy - 9 + breathe);
  ctx.lineTo(sx + 2, sy - 12 + breathe);
  ctx.closePath();
  ctx.fill();

  // Pustules / blisters
  const pulse = 0.7 + Math.sin(t * 0.12) * 0.3;
  ctx.fillStyle = p.bileBright;
  ctx.beginPath();
  ctx.arc(sx + 6, sy - 6 + breathe, 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = `rgba(216,200,112,${pulse})`;
  ctx.fillRect(sx + 5, sy - 7 + breathe, 1, 1);

  // Veins (violettes, rampent sur le torse)
  ctx.strokeStyle = p.vein;
  ctx.lineWidth = 0.6;
  ctx.beginPath();
  ctx.moveTo(sx - 8, sy - 12 + breathe);
  ctx.lineTo(sx - 5, sy - 8 + breathe);
  ctx.lineTo(sx - 8, sy - 4 + breathe);
  ctx.moveTo(sx + 7, sy - 5 + breathe);
  ctx.lineTo(sx + 4, sy - 2 + breathe);
  ctx.stroke();

  // Arms (longs, asymétriques)
  // Left arm (longer, with raise option)
  ctx.save();
  ctx.translate(sx - 11, sy - 16 + breathe);
  ctx.rotate(armRaise);
  ctx.fillStyle = p.fleshDark;
  ctx.fillRect(-3, 0, 5, 16);
  ctx.fillStyle = p.flesh;
  ctx.fillRect(-3, 0, 1, 16);
  // Necrotic patches on arm
  ctx.fillStyle = p.necrosis;
  ctx.fillRect(-2, 6, 2, 3);
  // Hand (claws)
  ctx.fillStyle = p.necrosisDark;
  ctx.fillRect(-3, 16, 5, 4);
  ctx.fillStyle = p.bone;
  ctx.fillRect(-3, 19, 1, 2);
  ctx.fillRect(-1, 19, 1, 2);
  ctx.fillRect(1, 19, 1, 2);
  ctx.restore();

  // Right arm (shorter, asymmetric)
  ctx.fillStyle = p.fleshDark;
  ctx.fillRect(sx + 9, sy - 16 + breathe, 4, 13);
  ctx.fillStyle = p.flesh;
  ctx.fillRect(sx + 12, sy - 16 + breathe, 1, 13);
  ctx.fillStyle = p.necrosis;
  ctx.fillRect(sx + 10, sy - 8 + breathe, 2, 3);
  // Hand
  ctx.fillStyle = p.necrosisDark;
  ctx.fillRect(sx + 9, sy - 3 + breathe, 4, 4);
  ctx.fillStyle = p.bone;
  ctx.fillRect(sx + 9, sy + 1 + breathe, 1, 2);
  ctx.fillRect(sx + 12, sy + 1 + breathe, 1, 2);

  // Head (deformed, tilted)
  ctx.fillStyle = p.fleshDark;
  ctx.beginPath();
  ctx.moveTo(sx - 7, sy - 30 + breathe);
  ctx.lineTo(sx + 7, sy - 30 + breathe);
  ctx.lineTo(sx + 8, sy - 19 + breathe);
  ctx.lineTo(sx - 8, sy - 19 + breathe);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = p.flesh;
  ctx.fillRect(sx - 7, sy - 29 + breathe, 14, 9);
  ctx.fillStyle = p.fleshLight;
  ctx.fillRect(sx - 7, sy - 29 + breathe, 2, 9);

  // Necrotic patch on cheek
  ctx.fillStyle = p.necrosis;
  ctx.fillRect(sx - 6, sy - 24 + breathe, 3, 3);

  // Eyes (yellowish, sickly)
  ctx.fillStyle = '#000';
  ctx.fillRect(sx - 5, sy - 26 + breathe, 3, 2);
  ctx.fillRect(sx + 2, sy - 26 + breathe, 3, 2);
  const eyePulse = 0.85 + Math.sin(t * 0.08) * 0.15;
  ctx.fillStyle = `rgba(216,200,112,${eyePulse})`;
  ctx.fillRect(sx - 4, sy - 25 + breathe, 1, 1);
  ctx.fillRect(sx + 3, sy - 25 + breathe, 1, 1);

  // Mouth (large, dripping bile)
  ctx.fillStyle = p.necrosisDark;
  ctx.fillRect(sx - 5, sy - 22 + breathe, 10, 3);
  // Teeth
  ctx.fillStyle = p.bone;
  ctx.fillRect(sx - 4, sy - 22 + breathe, 1, 2);
  ctx.fillRect(sx - 1, sy - 22 + breathe, 1, 2);
  ctx.fillRect(sx + 2, sy - 22 + breathe, 1, 2);
  // Bile drip
  if(t % 60 < 30){
    ctx.fillStyle = p.bileDark;
    ctx.fillRect(sx - 2, sy - 19 + breathe, 1, 2 + Math.floor((t % 30) / 10));
    ctx.fillStyle = p.bileBright;
    ctx.fillRect(sx - 2, sy - 19 + breathe, 1, 1);
  }
}

export const attacks = {
  idle: {
    id: 'idle', name: 'IDLE', icon: '◇',
    duration: 9999, looping: true,
    description: 'Posture voûtée, respiration sifflante, bile qui dégouline de la bouche. Spores vertes en permanence.',
    phases: [{ from: 0, to: 9999, label: 'Loop' }],
    update(frame){
      const fx = [];
      if(frame % 24 === 0){
        fx.push({ type: 'ash', dx: 0, dy: -16, count: 1, color: '#a8e065' });
      }
      if(frame % 60 === 30){
        fx.push({ type: 'ash', dx: -2, dy: -18, count: 1, color: '#7fc844' });
      }
      return { opts: {}, fx };
    },
  },

  bite: {
    id: 'bite', name: 'BITE', icon: '🦷',
    duration: 70,
    description: 'Morsure mêlée. 50% chance Poison (4 tours). 30% lifesteal (soigne sur dégâts infligés). Anim de morsure violente avec aura violette de drain.',
    phases: [
      { from: 0, to: 22, label: 'Anticipation' },
      { from: 22, to: 32, label: 'Frappe' },
      { from: 32, to: 50, label: 'Drain' },
      { from: 50, to: 70, label: 'Recovery' },
    ],
    update(frame){
      const opts = {};
      const fx = [];
      if(frame < 22){
        const p = frame / 22;
        opts.armRaise = -p * 1.0;
      } else if(frame < 32){
        const p = (frame - 22) / 10;
        opts.armRaise = -1.0 + p * 1.4;
        if(frame === 22){
          fx.push({ type: 'sparks', dx: -16, dy: -8, count: 8, color: '#a8e065' });
          fx.push({ type: 'flash', dx: -16, dy: -8, color: '#c8d845', size: 10 });
          fx.push({ type: 'shockwave', dx: -16, dy: -4, color: '#7fc844', maxRadius: 22 });
        }
      } else if(frame < 50){
        const p = (frame - 32) / 18;
        opts.armRaise = 0.4 - p * 0.3;
        opts.lifestealGlow = 0.7 + Math.sin(frame * 0.3) * 0.3;
        // Drain particles flowing back to enemy
        if(frame % 3 === 0){
          fx.push({ type: 'sparks', dx: -16 + (frame - 32), dy: -6, count: 1, color: '#7a3a8a' });
        }
      } else {
        const p = (frame - 50) / 20;
        opts.armRaise = 0.1 - 0.1 * p;
        opts.lifestealGlow = Math.max(0, 0.7 - p);
      }
      return { opts, fx };
    },
  },

  walk: {
    id: 'walk', name: 'WALK', icon: '🏃',
    duration: 200,
    looping: true,
    description: 'Marche shambling claudicante. Aller-retour 100/100 frames. Spores vertes au sol.',
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
