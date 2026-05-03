// src/js/render/enemies/crimson_hooked.js
// Crocheteur — caster ranged avec hook puller.
// Type costaud avec grappin/crochet de boucher au bout d'une chaîne.
// Bras musclé, attitude prédateur.

export const palette = {
  skin:        '#a87858',
  skinDark:    '#5a3818',
  skinLight:   '#c89878',
  vest:        '#3a1a08',
  vestDark:    '#1a0a05',
  vestLight:   '#5a2818',
  pants:       '#2a1408',
  belt:        '#5a2818',
  bandage:     '#a89878',
  bandageDirty:'#7a6850',
  chain:       '#7a6850',
  chainDark:   '#3a3018',
  chainLight:  '#a89878',
  hook:        '#9a8868',
  hookDark:    '#5a4828',
  hookEdge:    '#d8c8a0',
  hookBlood:   '#5a0808',
  blood:       '#8a1818',
  bloodFresh:  '#c82828',
  bronze:      '#c8a040',
  shadow:      'rgba(20,5,5,0.85)',
};

export function draw(ctx, sx, sy, t, opts){
  opts = opts || {};
  const p = palette;
  const bob = Math.sin(t * 0.045) * 0.5;
  const breathe = Math.sin(t * 0.035) * 0.3;
  sx = Math.round(sx + (opts.bodyShift || 0));
  sy = Math.round(sy + bob);

  const armRaise = opts.armRaise || 0;
  const hookExtended = opts.hookExtended || 0; // 0..1 progress of hook flying out

  // Shadow
  ctx.fillStyle = p.shadow;
  ctx.beginPath();
  ctx.ellipse(sx, sy + 8, 13, 3.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Soft red glow
  const glow = 0.3 + Math.sin(t * 0.06) * 0.1;
  const bg = ctx.createRadialGradient(sx, sy - 14, 4, sx, sy - 14, 28);
  bg.addColorStop(0, `rgba(138,24,24,${glow * 0.4})`);
  bg.addColorStop(1, 'rgba(138,24,24,0)');
  ctx.fillStyle = bg;
  ctx.fillRect(sx - 28, sy - 40, 56, 50);

  // Legs (pants)
  ctx.fillStyle = p.pants;
  ctx.fillRect(sx - 7, sy - 1, 6, 9);
  ctx.fillRect(sx + 1, sy - 1, 6, 9);
  ctx.fillStyle = p.vestDark;
  ctx.fillRect(sx - 7, sy - 1, 1, 9);
  // Knee patches (worn leather)
  ctx.fillStyle = p.vestDark;
  ctx.fillRect(sx - 6, sy + 4, 3, 2);
  ctx.fillRect(sx + 3, sy + 4, 3, 2);

  // Boots (heavy)
  ctx.fillStyle = '#000';
  ctx.fillRect(sx - 8, sy + 8, 7, 4);
  ctx.fillRect(sx + 1, sy + 8, 7, 4);
  // Bronze toe caps (gladiator-style)
  ctx.fillStyle = p.bronze;
  ctx.fillRect(sx - 8, sy + 11, 3, 1);
  ctx.fillRect(sx + 5, sy + 11, 3, 1);

  // === LEATHER VEST (open at chest, no shirt underneath) ===
  ctx.fillStyle = p.vestDark;
  ctx.beginPath();
  ctx.moveTo(sx - 9, sy - 1);
  ctx.lineTo(sx + 9, sy - 1);
  ctx.lineTo(sx + 9, sy - 19 + breathe);
  ctx.lineTo(sx + 4, sy - 22 + breathe);
  ctx.lineTo(sx - 4, sy - 22 + breathe);
  ctx.lineTo(sx - 9, sy - 19 + breathe);
  ctx.closePath();
  ctx.fill();

  // Vest highlight
  ctx.fillStyle = p.vest;
  ctx.fillRect(sx - 9, sy - 19 + breathe, 18, 18);
  ctx.fillStyle = p.vestLight;
  ctx.fillRect(sx - 9, sy - 19 + breathe, 2, 18);

  // Open vest center : skin visible
  ctx.fillStyle = p.skinDark;
  ctx.fillRect(sx - 3, sy - 18 + breathe, 6, 12);
  ctx.fillStyle = p.skin;
  ctx.fillRect(sx - 3, sy - 18 + breathe, 6, 10);
  // Chest hair / muscle definition
  ctx.fillStyle = p.skinDark;
  ctx.fillRect(sx, sy - 16 + breathe, 0.5, 8);

  // Belt with bronze buckle
  ctx.fillStyle = p.belt;
  ctx.fillRect(sx - 9, sy - 4 + breathe, 18, 2);
  ctx.fillStyle = p.bronze;
  ctx.fillRect(sx - 1, sy - 4 + breathe, 3, 2);
  ctx.fillStyle = '#e8c860';
  ctx.fillRect(sx, sy - 4 + breathe, 1, 1);

  // Vest stitching
  ctx.fillStyle = p.bronze;
  ctx.fillRect(sx - 5, sy - 18 + breathe, 1, 1);
  ctx.fillRect(sx + 4, sy - 16 + breathe, 1, 1);
  ctx.fillRect(sx - 7, sy - 12 + breathe, 1, 1);

  // Battle scar across chest
  ctx.strokeStyle = p.blood;
  ctx.lineWidth = 0.6;
  ctx.beginPath();
  ctx.moveTo(sx + 2, sy - 16 + breathe);
  ctx.lineTo(sx - 1, sy - 10 + breathe);
  ctx.stroke();

  // === ARMS ===
  // Left arm (the throwing one, holds hook+chain)
  ctx.save();
  ctx.translate(sx - 9, sy - 18 + breathe);
  ctx.rotate(armRaise);
  // Bicep (massive)
  ctx.fillStyle = p.skinDark;
  ctx.fillRect(-3, 0, 5, 8);
  ctx.fillStyle = p.skin;
  ctx.fillRect(-3, 0, 1, 8);
  // Bandage wrap on bicep
  ctx.fillStyle = p.bandage;
  ctx.fillRect(-3, 3, 5, 1);
  ctx.fillStyle = p.bandageDirty;
  ctx.fillRect(-3, 4, 5, 1);
  // Forearm
  ctx.fillStyle = p.skinDark;
  ctx.fillRect(-3, 8, 5, 8);
  ctx.fillStyle = p.skin;
  ctx.fillRect(-3, 8, 1, 8);
  // Wrist wrap
  ctx.fillStyle = p.bandageDirty;
  ctx.fillRect(-3, 14, 5, 2);
  // Hand gripping the chain
  ctx.fillStyle = p.skinDark;
  ctx.fillRect(-3, 16, 5, 4);
  ctx.restore();

  // Right arm (rest, also muscular)
  ctx.fillStyle = p.skinDark;
  ctx.fillRect(sx + 7, sy - 18 + breathe, 5, 16);
  ctx.fillStyle = p.skin;
  ctx.fillRect(sx + 11, sy - 18 + breathe, 1, 16);
  // Bandage on this arm
  ctx.fillStyle = p.bandage;
  ctx.fillRect(sx + 7, sy - 14 + breathe, 5, 1);
  ctx.fillStyle = p.bandageDirty;
  ctx.fillRect(sx + 7, sy - 9 + breathe, 5, 1);
  // Hand
  ctx.fillStyle = p.skinDark;
  ctx.fillRect(sx + 7, sy - 2 + breathe, 5, 4);

  // === HEAD ===
  ctx.fillStyle = p.skinDark;
  ctx.fillRect(sx - 6, sy - 30 + breathe, 12, 11);
  ctx.fillStyle = p.skin;
  ctx.fillRect(sx - 6, sy - 30 + breathe, 12, 9);
  ctx.fillStyle = p.skinLight;
  ctx.fillRect(sx - 6, sy - 30 + breathe, 2, 11);

  // Beard / facial hair (heavy)
  ctx.fillStyle = p.vestDark;
  ctx.fillRect(sx - 5, sy - 24 + breathe, 10, 5);
  ctx.fillStyle = p.vest;
  ctx.fillRect(sx - 5, sy - 24 + breathe, 10, 3);
  // Mustache
  ctx.fillRect(sx - 4, sy - 25 + breathe, 8, 1);

  // Eyes (predator gaze)
  ctx.fillStyle = '#000';
  ctx.fillRect(sx - 4, sy - 27 + breathe, 2, 2);
  ctx.fillRect(sx + 2, sy - 27 + breathe, 2, 2);
  const eyePulse = 0.92 + Math.sin(t * 0.08) * 0.08;
  ctx.fillStyle = `rgba(216,200,128,${eyePulse * 0.85})`;
  ctx.fillRect(sx - 3, sy - 26 + breathe, 1, 1);
  ctx.fillRect(sx + 3, sy - 26 + breathe, 1, 1);

  // Scar over one eye
  ctx.fillStyle = p.blood;
  ctx.fillRect(sx - 5, sy - 28 + breathe, 1, 4);

  // Bald head with bandana on top
  ctx.fillStyle = p.vest;
  ctx.fillRect(sx - 6, sy - 30 + breathe, 12, 2);

  // === CHAIN + HOOK ===
  // The chain trails from the left hand, hook at the end
  // When idle : hook hangs at side
  // When extending : hook flies forward
  drawChainAndHook(ctx, sx, sy, t, armRaise, hookExtended, p);
}

function drawChainAndHook(ctx, sx, sy, t, armRaise, extended, p){
  // Origin : left hand
  const handX = sx - 9 + Math.sin(armRaise) * 18 - Math.cos(armRaise) * 0;
  const handY = sy - 18 + 0.3 + Math.cos(armRaise) * 18 + Math.sin(armRaise) * 0;

  // When extended, hook flies forward
  const targetX = sx - 24 - extended * 18;
  const targetY = sy - 8 + Math.sin(t * 0.5) * 1;

  const hookX = handX + (targetX - handX) * (extended > 0 ? extended : 0.3);
  const hookY = handY + (targetY - handY) * (extended > 0 ? extended : 0.5);

  // Draw chain (segmented)
  const segments = Math.max(4, Math.floor(extended * 8) + 4);
  for(let i = 0; i < segments; i++){
    const tt = i / segments;
    const cx = handX + (hookX - handX) * tt;
    const cy = handY + (hookY - handY) * tt + Math.sin(t * 0.2 + i) * (1 - extended) * 1.5;
    // Alternate horizontal/vertical chain links
    if(i % 2 === 0){
      ctx.fillStyle = p.chainDark;
      ctx.fillRect(Math.round(cx - 1), Math.round(cy - 0.5), 2, 1);
      ctx.fillStyle = p.chain;
      ctx.fillRect(Math.round(cx - 1), Math.round(cy - 0.5), 1, 1);
    } else {
      ctx.fillStyle = p.chainDark;
      ctx.fillRect(Math.round(cx - 0.5), Math.round(cy - 1), 1, 2);
      ctx.fillStyle = p.chain;
      ctx.fillRect(Math.round(cx - 0.5), Math.round(cy - 1), 1, 1);
    }
  }

  // === HOOK at the end ===
  drawHook(ctx, hookX, hookY, t, extended, p);
}

function drawHook(ctx, lx, ly, t, extended, p){
  // Halo when extended
  if(extended > 0){
    const grad = ctx.createRadialGradient(lx, ly, 0, lx, ly, 8);
    grad.addColorStop(0, `rgba(216,200,160,${extended * 0.5})`);
    grad.addColorStop(1, 'rgba(138,24,24,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(lx - 8, ly - 8, 16, 16);
  }

  // Hook ring (where chain connects)
  ctx.fillStyle = p.hookDark;
  ctx.beginPath();
  ctx.arc(lx, ly, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = p.hook;
  ctx.beginPath();
  ctx.arc(lx, ly, 1.5, 0, Math.PI * 2);
  ctx.fill();

  // Hook curve (J-shape, butcher hook)
  ctx.strokeStyle = p.hook;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(lx, ly + 1);
  ctx.lineTo(lx, ly + 5);
  ctx.quadraticCurveTo(lx - 1, ly + 8, lx - 4, ly + 8);
  ctx.quadraticCurveTo(lx - 6, ly + 7, lx - 5, ly + 4);
  ctx.stroke();

  // Hook edge highlight
  ctx.strokeStyle = p.hookEdge;
  ctx.lineWidth = 0.7;
  ctx.beginPath();
  ctx.moveTo(lx + 0.5, ly + 1);
  ctx.lineTo(lx + 0.5, ly + 5);
  ctx.stroke();

  // Hook tip (pointy, sharp)
  ctx.fillStyle = p.hookEdge;
  ctx.fillRect(Math.round(lx - 5.5), Math.round(ly + 3), 1, 2);

  // Blood on the hook
  ctx.fillStyle = p.hookBlood;
  ctx.fillRect(Math.round(lx - 4), Math.round(ly + 7), 2, 1);
  ctx.fillStyle = p.bloodFresh;
  ctx.fillRect(Math.round(lx - 4), Math.round(ly + 7), 1, 1);
  // Drip
  if(t % 80 < 40){
    ctx.fillStyle = p.bloodFresh;
    ctx.fillRect(Math.round(lx - 4), Math.round(ly + 8 + Math.floor((t % 40) / 10)), 1, 1);
  }
}

export const attacks = {
  idle: {
    id: 'idle', name: 'IDLE', icon: '◇',
    duration: 9999, looping: true,
    description: 'Hook se balance au bout de la chaîne, prêt à être lancé. Posture prédateur.',
    phases: [{ from: 0, to: 9999, label: 'Loop' }],
    update(frame){
      const fx = [];
      if(frame % 35 === 0){
        fx.push({ type: 'ash', dx: -10, dy: 0, count: 1, color: '#5a0808' });
      }
      return { opts: {}, fx };
    },
  },

  hook: {
    id: 'hook', name: 'GRAPPLING HOOK', icon: '🪝',
    duration: 90,
    description: 'Lance le grappin pour tirer la cible de 3 cases vers lui (1×/combat). 30% Bleed. Range 4.',
    phases: [
      { from: 0, to: 18, label: 'Wind-up' },
      { from: 18, to: 50, label: 'Chain extends' },
      { from: 50, to: 90, label: 'Pull back' },
    ],
    update(frame){
      const opts = {};
      const fx = [];
      if(frame < 18){
        const p = frame / 18;
        opts.armRaise = -p * 0.8;
        opts.hookExtended = 0;
      } else if(frame < 50){
        const p = (frame - 18) / 32;
        opts.armRaise = -0.8;
        opts.hookExtended = p;
        if(frame === 18){
          fx.push({ type: 'flash', dx: -16, dy: -8, color: '#d8c8a0', size: 12 });
          fx.push({ type: 'sparks', dx: -16, dy: -8, count: 8, color: '#9a8868' });
        }
        if(frame === 32){
          fx.push({ type: 'sparks', dx: -28, dy: -8, count: 10, color: '#a02828' });
          fx.push({ type: 'flash', dx: -28, dy: -8, color: '#c82828', size: 12 });
          fx.push({ type: 'shockwave', dx: -28, dy: -4, color: '#8a1818', maxRadius: 22 });
        }
      } else {
        const p = (frame - 50) / 40;
        opts.armRaise = -0.8 + p * 0.8;
        opts.hookExtended = Math.max(0, 1 - p);
      }
      return { opts, fx };
    },
  },

  slash: {
    id: 'slash', name: 'HOOK SLASH', icon: '⚔',
    duration: 60,
    description: 'Mêlée si proche : utilise le hook comme arme courte.',
    phases: [
      { from: 0, to: 18, label: 'Wind-up' },
      { from: 18, to: 28, label: 'Strike' },
      { from: 28, to: 60, label: 'Recovery' },
    ],
    update(frame){
      const opts = {};
      const fx = [];
      if(frame < 18){
        const p = frame / 18;
        opts.armRaise = -p * 1.2;
      } else if(frame < 28){
        const p = (frame - 18) / 10;
        opts.armRaise = -1.2 + p * 1.6;
        if(frame === 18){
          fx.push({ type: 'sparks', dx: -16, dy: -6, count: 10, color: '#a02828' });
          fx.push({ type: 'flash', dx: -16, dy: -6, color: '#c82828', size: 11 });
        }
      } else {
        const p = (frame - 28) / 32;
        opts.armRaise = 0.4 - p * 0.4;
      }
      return { opts, fx };
    },
  },

  walk: {
    id: 'walk', name: 'WALK', icon: '🏃',
    duration: 200,
    looping: true,
    description: 'Marche prédateur, chain qui ballotte. Aller-retour 100/100.',
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
      // Hook swings with walk
      opts.armRaise = Math.sin(frame * 0.14) * 0.15;
      if(frame % 14 === 0){
        fx.push({ type: 'ash', dx: -3, dy: 11, count: 1, color: '#3a1a08' });
        fx.push({ type: 'ash', dx: 3, dy: 11, count: 1, color: '#3a1a08' });
      }
      return { opts, fx };
    },
  },
};

export const meta = { width: 26, height: 40, groundOffsetY: 0 };
export default { draw, attacks, palette, meta };
