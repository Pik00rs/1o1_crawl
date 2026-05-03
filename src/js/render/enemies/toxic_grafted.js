// src/js/render/enemies/toxic_grafted.js
// Greffé de Chair — monstrosité multi-bras (4 bras, 2 têtes fusionnées).
// Cicatrices de greffe partout, points de suture épais. Plus large que les autres mobs.
// Régénère 3 PV/tour, frappe 2 fois.

export const palette = {
  flesh:       '#7a9050',
  fleshDark:   '#4a5828',
  fleshLight:  '#a0b870',
  flesh2:      '#a08858',  // chair de l'autre corps fusionné (différente teinte)
  flesh2Dark:  '#5a4828',
  necrosis:    '#5a3825',
  necrosisDark:'#2a1808',
  scar:        '#5a3018',
  scarDark:    '#2a1808',
  suture:      '#1a0a05',
  bloodstain:  '#7a2020',
  regenGreen:  '#a8e065',
  regenCore:   '#c8e845',
  shadow:      'rgba(20,30,10,0.85)',
};

export function draw(ctx, sx, sy, t, opts){
  opts = opts || {};
  const p = palette;
  const bob = Math.sin(t * 0.04) * 0.6;
  const breathe = Math.sin(t * 0.03) * 0.4;
  sx = Math.round(sx + (opts.bodyShift || 0));
  sy = Math.round(sy + bob);

  const arm1Raise = opts.arm1Raise || 0;
  const arm2Raise = opts.arm2Raise || 0;
  const regenGlow = opts.regenGlow || 0;

  // Shadow (large)
  ctx.fillStyle = p.shadow;
  ctx.beginPath();
  ctx.ellipse(sx, sy + 8, 17, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Regen aura (active passive)
  if(regenGlow > 0){
    for(let i = 0; i < 3; i++){
      const r = 22 + i * 5 + Math.sin(t * 0.12 + i) * 3;
      const a = regenGlow * 0.22 * (1 - i * 0.3);
      ctx.fillStyle = `rgba(168,224,101,${a})`;
      ctx.beginPath();
      ctx.ellipse(sx, sy + 4, r, r * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Body glow
  const glow = 0.3 + Math.sin(t * 0.05) * 0.1;
  const bg = ctx.createRadialGradient(sx, sy - 14, 5, sx, sy - 14, 32);
  bg.addColorStop(0, `rgba(168,184,112,${glow * 0.4})`);
  bg.addColorStop(1, 'rgba(168,184,112,0)');
  ctx.fillStyle = bg;
  ctx.fillRect(sx - 32, sy - 46, 64, 60);

  // Legs (3 jambes? non, 2 mais épaisses)
  ctx.fillStyle = p.fleshDark;
  ctx.fillRect(sx - 9, sy - 1, 7, 11);
  ctx.fillRect(sx + 2, sy - 1, 7, 11);
  ctx.fillStyle = p.flesh;
  ctx.fillRect(sx - 9, sy - 1, 1, 11);
  // Suture line on right leg (graft visible)
  ctx.strokeStyle = p.suture;
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(sx + 5, sy + 2);
  ctx.lineTo(sx + 5, sy + 9);
  ctx.stroke();
  // Stitches
  for(let i = 0; i < 4; i++){
    ctx.strokeStyle = p.suture;
    ctx.lineWidth = 0.4;
    ctx.beginPath();
    ctx.moveTo(sx + 4, sy + 3 + i * 2);
    ctx.lineTo(sx + 6, sy + 3 + i * 2);
    ctx.stroke();
  }

  // Right leg has slightly different flesh color (graft)
  ctx.fillStyle = p.flesh2;
  ctx.fillRect(sx + 6, sy - 1, 3, 11);

  // Boots / wraps
  ctx.fillStyle = p.scarDark;
  ctx.fillRect(sx - 10, sy + 10, 8, 4);
  ctx.fillRect(sx + 1, sy + 10, 8, 4);

  // === TORSO (large, fused multiple bodies) ===
  ctx.fillStyle = p.fleshDark;
  ctx.beginPath();
  ctx.moveTo(sx - 14, sy - 22 + breathe);
  ctx.lineTo(sx + 14, sy - 22 + breathe);
  ctx.lineTo(sx + 12, sy - 1);
  ctx.lineTo(sx - 12, sy - 1);
  ctx.closePath();
  ctx.fill();

  // Two halves of torso (different fleshes)
  ctx.fillStyle = p.flesh;
  ctx.fillRect(sx - 12, sy - 21 + breathe, 12, 20);
  ctx.fillStyle = p.flesh2;
  ctx.fillRect(sx, sy - 21 + breathe, 12, 20);
  ctx.fillStyle = p.fleshLight;
  ctx.fillRect(sx - 12, sy - 21 + breathe, 2, 20);

  // Major center suture (vertical, where the two bodies meet)
  ctx.strokeStyle = p.suture;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(sx, sy - 21 + breathe);
  ctx.lineTo(sx, sy - 1);
  ctx.stroke();
  // Stitch marks
  for(let i = 0; i < 7; i++){
    ctx.strokeStyle = p.suture;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(sx - 1.5, sy - 19 + breathe + i * 3);
    ctx.lineTo(sx + 1.5, sy - 19 + breathe + i * 3);
    ctx.stroke();
  }

  // Scar tissue patches
  ctx.fillStyle = p.scar;
  ctx.beginPath();
  ctx.moveTo(sx - 8, sy - 16 + breathe);
  ctx.lineTo(sx - 4, sy - 12 + breathe);
  ctx.lineTo(sx - 6, sy - 8 + breathe);
  ctx.lineTo(sx - 9, sy - 11 + breathe);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = p.scarDark;
  ctx.fillRect(sx - 7, sy - 14 + breathe, 1, 2);

  ctx.fillStyle = p.scar;
  ctx.fillRect(sx + 5, sy - 14 + breathe, 4, 3);

  // Bloodstain (around major suture)
  ctx.fillStyle = p.bloodstain;
  ctx.fillRect(sx - 1, sy - 6 + breathe, 2, 1);
  ctx.fillRect(sx, sy - 13 + breathe, 1, 1);

  // Regen sparkles (when regenerating)
  if(regenGlow > 0){
    for(let i = 0; i < 5; i++){
      const angle = t * 0.04 + i * 1.25;
      const x = sx + Math.cos(angle) * 12;
      const y = sy - 14 + Math.sin(angle) * 8;
      ctx.fillStyle = `rgba(200,232,69,${regenGlow})`;
      ctx.fillRect(Math.round(x), Math.round(y), 1, 1);
    }
  }

  // === 4 ARMS (2 per side, asymétriques) ===
  // Left primary arm (top)
  ctx.save();
  ctx.translate(sx - 13, sy - 21 + breathe);
  ctx.rotate(arm1Raise);
  ctx.fillStyle = p.fleshDark;
  ctx.fillRect(-3, 0, 5, 14);
  ctx.fillStyle = p.flesh;
  ctx.fillRect(-3, 0, 1, 14);
  ctx.fillStyle = p.necrosisDark;
  ctx.fillRect(-3, 14, 5, 4);
  // Suture
  ctx.strokeStyle = p.suture;
  ctx.lineWidth = 0.4;
  ctx.beginPath();
  ctx.moveTo(-3, 5); ctx.lineTo(2, 5);
  ctx.stroke();
  ctx.restore();

  // Left secondary arm (bottom, smaller)
  ctx.save();
  ctx.translate(sx - 12, sy - 14 + breathe);
  ctx.rotate(0.3 + arm1Raise * 0.5);
  ctx.fillStyle = p.flesh2Dark;
  ctx.fillRect(-3, 0, 4, 11);
  ctx.fillStyle = p.flesh2;
  ctx.fillRect(-3, 0, 1, 11);
  ctx.fillStyle = p.necrosisDark;
  ctx.fillRect(-3, 11, 4, 3);
  ctx.restore();

  // Right primary arm
  ctx.save();
  ctx.translate(sx + 13, sy - 21 + breathe);
  ctx.rotate(-arm2Raise);
  ctx.fillStyle = p.flesh2Dark;
  ctx.fillRect(-2, 0, 5, 14);
  ctx.fillStyle = p.flesh2;
  ctx.fillRect(0, 0, 1, 14);
  ctx.fillStyle = p.necrosisDark;
  ctx.fillRect(-2, 14, 5, 4);
  // Suture
  ctx.strokeStyle = p.suture;
  ctx.lineWidth = 0.4;
  ctx.beginPath();
  ctx.moveTo(-2, 5); ctx.lineTo(3, 5);
  ctx.stroke();
  ctx.restore();

  // Right secondary arm
  ctx.save();
  ctx.translate(sx + 12, sy - 14 + breathe);
  ctx.rotate(-0.3 - arm2Raise * 0.5);
  ctx.fillStyle = p.fleshDark;
  ctx.fillRect(-1, 0, 4, 11);
  ctx.fillStyle = p.flesh;
  ctx.fillRect(2, 0, 1, 11);
  ctx.fillStyle = p.necrosisDark;
  ctx.fillRect(-1, 11, 4, 3);
  ctx.restore();

  // === 2 HEADS (fused, asymmetric) ===
  // Main head (centered, larger)
  ctx.fillStyle = p.fleshDark;
  ctx.fillRect(sx - 6, sy - 32 + breathe, 12, 11);
  ctx.fillStyle = p.flesh;
  ctx.fillRect(sx - 6, sy - 32 + breathe, 12, 9);
  ctx.fillStyle = p.fleshLight;
  ctx.fillRect(sx - 6, sy - 32 + breathe, 2, 11);

  // Suture going up the neck and across the head
  ctx.strokeStyle = p.suture;
  ctx.lineWidth = 0.6;
  ctx.beginPath();
  ctx.moveTo(sx + 1, sy - 22 + breathe);
  ctx.lineTo(sx + 1, sy - 32 + breathe);
  ctx.stroke();

  // Main head eyes
  ctx.fillStyle = '#000';
  ctx.fillRect(sx - 4, sy - 28 + breathe, 2, 2);
  ctx.fillRect(sx + 1, sy - 28 + breathe, 2, 2);
  const eyePulse = 0.85 + Math.sin(t * 0.08) * 0.15;
  ctx.fillStyle = `rgba(168,224,101,${eyePulse})`;
  ctx.fillRect(sx - 3, sy - 27 + breathe, 1, 1);
  ctx.fillRect(sx + 2, sy - 27 + breathe, 1, 1);

  // Mouth
  ctx.fillStyle = '#1a0808';
  ctx.fillRect(sx - 3, sy - 24 + breathe, 6, 2);

  // Secondary smaller head (grafted on the side, asymmetric)
  ctx.fillStyle = p.flesh2Dark;
  ctx.fillRect(sx + 5, sy - 28 + breathe, 6, 7);
  ctx.fillStyle = p.flesh2;
  ctx.fillRect(sx + 5, sy - 28 + breathe, 6, 6);
  // Suture connecting
  ctx.strokeStyle = p.suture;
  ctx.lineWidth = 0.6;
  ctx.beginPath();
  ctx.moveTo(sx + 5, sy - 27 + breathe);
  ctx.lineTo(sx + 5, sy - 22 + breathe);
  ctx.stroke();
  // Tiny eyes on secondary head
  ctx.fillStyle = '#000';
  ctx.fillRect(sx + 6, sy - 26 + breathe, 1, 1);
  ctx.fillRect(sx + 9, sy - 26 + breathe, 1, 1);
  ctx.fillStyle = `rgba(168,224,101,${eyePulse * 0.8})`;
  ctx.fillRect(sx + 6, sy - 26 + breathe, 0.5, 0.5);
  ctx.fillRect(sx + 9, sy - 26 + breathe, 0.5, 0.5);
  // Tiny mouth
  ctx.fillStyle = '#1a0808';
  ctx.fillRect(sx + 6, sy - 24 + breathe, 4, 1);
}

export const attacks = {
  idle: {
    id: 'idle', name: 'IDLE', icon: '◇',
    duration: 9999, looping: true,
    description: 'Les 4 bras bougent indépendamment, deux têtes regardent dans des directions différentes. Spores constants.',
    phases: [{ from: 0, to: 9999, label: 'Loop' }],
    update(frame){
      const opts = {};
      const fx = [];
      // Each arm bobs out of phase
      opts.arm1Raise = Math.sin(frame * 0.03) * 0.15;
      opts.arm2Raise = Math.sin(frame * 0.04 + 1.5) * 0.15;
      if(frame % 24 === 0){
        fx.push({ type: 'ash', dx: 0, dy: -22, count: 1, color: '#7fc844' });
      }
      return { opts, fx };
    },
  },

  multiSlash: {
    id: 'multiSlash', name: 'MULTI-SLASH', icon: '⚔',
    duration: 90,
    description: 'Frappe avec 2 bras successivement (multiAttack). Anim : bras gauche d\'abord, puis bras droit, en chaîne.',
    phases: [
      { from: 0, to: 18, label: 'Wind-up 1' },
      { from: 18, to: 30, label: 'Strike 1' },
      { from: 30, to: 50, label: 'Wind-up 2' },
      { from: 50, to: 60, label: 'Strike 2' },
      { from: 60, to: 90, label: 'Recovery' },
    ],
    update(frame){
      const opts = {};
      const fx = [];
      if(frame < 18){
        const p = frame / 18;
        opts.arm1Raise = -p * 1.2;
      } else if(frame < 30){
        const p = (frame - 18) / 12;
        opts.arm1Raise = -1.2 + p * 1.6;
        if(frame === 18){
          fx.push({ type: 'sparks', dx: -16, dy: -10, count: 6, color: '#a8c440' });
          fx.push({ type: 'flash', dx: -16, dy: -10, color: '#c8e845', size: 10 });
          fx.push({ type: 'shockwave', dx: -16, dy: -6, color: '#a8c440', maxRadius: 18 });
        }
      } else if(frame < 50){
        opts.arm1Raise = 0.4;
        const p = (frame - 30) / 20;
        opts.arm2Raise = -p * 1.2;
      } else if(frame < 60){
        opts.arm1Raise = 0.4 - (frame - 50) / 10 * 0.4;
        const p = (frame - 50) / 10;
        opts.arm2Raise = -1.2 + p * 1.6;
        if(frame === 50){
          fx.push({ type: 'sparks', dx: 16, dy: -10, count: 6, color: '#a8c440' });
          fx.push({ type: 'flash', dx: 16, dy: -10, color: '#c8e845', size: 10 });
          fx.push({ type: 'shockwave', dx: 16, dy: -6, color: '#a8c440', maxRadius: 18 });
        }
      } else {
        const p = (frame - 60) / 30;
        opts.arm1Raise = 0;
        opts.arm2Raise = 0.4 - 0.4 * p;
      }
      return { opts, fx };
    },
  },

  regen: {
    id: 'regen', name: 'REGENERATION', icon: '✚',
    duration: 70, passive: true,
    description: 'Régénère 3 PV/tour. Visuel passif : aura verte qui pulse, plaies qui se referment, sparkles qui orbitent.',
    phases: [
      { from: 0, to: 25, label: 'Activation' },
      { from: 25, to: 70, label: 'Sustain' },
    ],
    update(frame){
      const opts = {};
      const fx = [];
      if(frame < 25){
        const p = frame / 25;
        opts.regenGlow = p;
        if(frame === 0){
          fx.push({ type: 'flash', dx: 0, dy: -14, color: '#c8e845', size: 22 });
          fx.push({ type: 'shockwave', dx: 0, dy: 4, color: '#a8e065', maxRadius: 36 });
        }
      } else {
        opts.regenGlow = 1 + Math.sin(frame * 0.15) * 0.15;
        if(frame % 5 === 0){
          const angle = Math.random() * Math.PI * 2;
          fx.push({ type: 'sparks', dx: Math.cos(angle) * 16, dy: -10 + Math.sin(angle) * 10, count: 1, color: '#c8e845' });
        }
      }
      return { opts, fx };
    },
  },

  walk: {
    id: 'walk', name: 'WALK', icon: '🏃',
    duration: 220,
    looping: true,
    description: 'Démarche maladroite avec 4 bras qui ballottent. Aller-retour 110/110.',
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
      opts.bodyShift += Math.sin(frame * 0.16) * 0.6;
      // Arms bouncing
      opts.arm1Raise = Math.sin(frame * 0.18) * 0.2;
      opts.arm2Raise = Math.sin(frame * 0.18 + Math.PI) * 0.2;
      if(frame % 14 === 0){
        fx.push({ type: 'ash', dx: -4, dy: 13, count: 2, color: '#7fc844' });
        fx.push({ type: 'ash', dx: 4, dy: 13, count: 2, color: '#7fc844' });
      }
      return { opts, fx };
    },
  },
};

export const meta = { width: 32, height: 46, groundOffsetY: 0 };
export default { draw, attacks, palette, meta };
