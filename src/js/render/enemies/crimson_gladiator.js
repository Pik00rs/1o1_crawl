// src/js/render/enemies/crimson_gladiator.js
// Gladiateur — ÉLITE.
// Casque romain pixelisé avec crête, bouclier rond fer/bronze, épée courte.
// Bandages aux bras. Posture de combat.

export const palette = {
  skin:        '#a87858',
  skinDark:    '#5a3818',
  skinLight:   '#c89878',
  helmet:      '#7a6850',
  helmetDark:  '#3a3018',
  helmetLight: '#a89878',
  helmetCrest: '#a02828',
  helmetCrest2:'#c82828',
  bronze:      '#c8a040',
  bronzeLight: '#e8c860',
  bronzeDark:  '#7a5818',
  iron:        '#5a5848',
  ironLight:   '#8a8878',
  ironDark:    '#2a2818',
  bandage:     '#d8c8a8',
  bandageDirty:'#a89878',
  bandageBlood:'#a02828',
  pants:       '#3a1a08',
  belt:        '#5a2818',
  blade:       '#9a8868',
  bladeEdge:   '#d8c8a0',
  bladeBlood:  '#5a0808',
  blood:       '#8a1818',
  bloodFresh:  '#c82828',
  rage:        'rgba(200,40,40,0.4)',
  shadow:      'rgba(20,5,5,0.9)',
};

export function draw(ctx, sx, sy, t, opts){
  opts = opts || {};
  const p = palette;
  const bob = Math.sin(t * 0.045) * 0.7;
  const breathe = Math.sin(t * 0.035) * 0.4;
  sx = Math.round(sx + (opts.bodyShift || 0));
  sy = Math.round(sy + bob);

  const swordRaise = opts.swordRaise || 0;
  const shieldRaise = opts.shieldRaise || 0;
  const rageActive = opts.rageActive || 0;

  // Shadow (large)
  ctx.fillStyle = p.shadow;
  ctx.beginPath();
  ctx.ellipse(sx, sy + 9, 16, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Rage aura
  if(rageActive > 0){
    for(let i = 0; i < 4; i++){
      const r = 22 + i * 6 + Math.sin(t * 0.12 + i) * 3;
      const a = rageActive * 0.22 * (1 - i * 0.22);
      ctx.fillStyle = `rgba(200,40,40,${a})`;
      ctx.beginPath();
      ctx.ellipse(sx, sy - 8, r, r * 0.45, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Bronze glow
  const glow = 0.4 + rageActive * 0.3 + Math.sin(t * 0.06) * 0.1;
  const bg = ctx.createRadialGradient(sx, sy - 16, 5, sx, sy - 16, 36);
  bg.addColorStop(0, `rgba(200,160,64,${glow * 0.4})`);
  bg.addColorStop(0.5, `rgba(138,24,24,${glow * 0.3})`);
  bg.addColorStop(1, 'rgba(200,160,64,0)');
  ctx.fillStyle = bg;
  ctx.fillRect(sx - 36, sy - 50, 72, 60);

  // Legs (greaves — jambières de bronze)
  ctx.fillStyle = p.helmetDark;
  ctx.fillRect(sx - 8, sy - 1, 6, 9);
  ctx.fillRect(sx + 2, sy - 1, 6, 9);
  ctx.fillStyle = p.bronze;
  ctx.fillRect(sx - 8, sy - 1, 6, 4);
  ctx.fillRect(sx + 2, sy - 1, 6, 4);
  ctx.fillStyle = p.bronzeLight;
  ctx.fillRect(sx - 8, sy - 1, 1, 4);
  ctx.fillRect(sx + 2, sy - 1, 1, 4);
  // Lower part : leather
  ctx.fillStyle = p.pants;
  ctx.fillRect(sx - 8, sy + 3, 6, 5);
  ctx.fillRect(sx + 2, sy + 3, 6, 5);

  // Sandals
  ctx.fillStyle = p.belt;
  ctx.fillRect(sx - 9, sy + 8, 8, 4);
  ctx.fillRect(sx + 1, sy + 8, 8, 4);
  // Sandal straps
  ctx.fillStyle = p.bronzeDark;
  ctx.fillRect(sx - 8, sy + 9, 6, 1);
  ctx.fillRect(sx + 2, sy + 9, 6, 1);

  // Skirt (gladiator pteruges — leather strips)
  ctx.fillStyle = p.belt;
  ctx.fillRect(sx - 11, sy - 3 + breathe, 22, 5);
  // Individual leather strips
  for(let i = 0; i < 6; i++){
    ctx.fillStyle = p.pants;
    ctx.fillRect(sx - 11 + i * 4, sy + 1 + breathe, 3, 3);
    ctx.fillStyle = p.bronzeDark;
    ctx.fillRect(sx - 11 + i * 4, sy + 1 + breathe, 3, 1);
  }

  // === TORSO (armor / chest plate) ===
  ctx.fillStyle = p.bronzeDark;
  ctx.fillRect(sx - 10, sy - 22 + breathe, 20, 19);
  ctx.fillStyle = p.bronze;
  ctx.fillRect(sx - 10, sy - 22 + breathe, 20, 17);
  ctx.fillStyle = p.bronzeLight;
  ctx.fillRect(sx - 10, sy - 22 + breathe, 3, 19);

  // Pectoral plate detail
  ctx.fillStyle = p.bronzeDark;
  ctx.fillRect(sx - 8, sy - 20 + breathe, 7, 6);
  ctx.fillRect(sx + 1, sy - 20 + breathe, 7, 6);
  ctx.fillStyle = p.bronze;
  ctx.fillRect(sx - 8, sy - 20 + breathe, 7, 4);
  ctx.fillRect(sx + 1, sy - 20 + breathe, 7, 4);

  // Chest emblem (bronze sun/laurel)
  ctx.fillStyle = p.bronzeLight;
  ctx.fillRect(sx - 1, sy - 12 + breathe, 3, 3);
  ctx.fillStyle = '#fff';
  ctx.fillRect(sx, sy - 11 + breathe, 1, 1);

  // Belly (leather under armor)
  ctx.fillStyle = p.pants;
  ctx.fillRect(sx - 9, sy - 5 + breathe, 18, 2);

  // Battle scars / blood on armor
  ctx.fillStyle = p.blood;
  ctx.fillRect(sx + 3, sy - 16 + breathe, 3, 1);
  ctx.fillStyle = p.bloodFresh;
  ctx.fillRect(sx + 4, sy - 16 + breathe, 1, 1);
  ctx.fillRect(sx - 5, sy - 8 + breathe, 2, 1);

  // === LEFT ARM (sword arm) ===
  ctx.save();
  ctx.translate(sx - 12, sy - 21 + breathe);
  ctx.rotate(swordRaise);
  // Bicep with bandages
  ctx.fillStyle = p.skinDark;
  ctx.fillRect(-3, 0, 5, 6);
  ctx.fillStyle = p.skin;
  ctx.fillRect(-3, 0, 1, 6);
  // Bandage wraps
  ctx.fillStyle = p.bandage;
  ctx.fillRect(-3, 1, 5, 1);
  ctx.fillRect(-3, 4, 5, 1);
  ctx.fillStyle = p.bandageDirty;
  ctx.fillRect(-3, 2, 5, 1);
  // Forearm (vambrace)
  ctx.fillStyle = p.bronzeDark;
  ctx.fillRect(-3, 6, 5, 8);
  ctx.fillStyle = p.bronze;
  ctx.fillRect(-3, 6, 5, 6);
  ctx.fillStyle = p.bronzeLight;
  ctx.fillRect(-3, 6, 1, 8);
  // Hand
  ctx.fillStyle = p.skinDark;
  ctx.fillRect(-3, 14, 5, 4);
  // === SHORT SWORD (gladius) ===
  drawGladius(ctx, 0, 18, t, p);
  ctx.restore();

  // === RIGHT ARM (shield arm) ===
  ctx.save();
  ctx.translate(sx + 12, sy - 21 + breathe);
  ctx.rotate(-shieldRaise);
  // Bicep with bandages
  ctx.fillStyle = p.skinDark;
  ctx.fillRect(-2, 0, 5, 6);
  ctx.fillStyle = p.skin;
  ctx.fillRect(2, 0, 1, 6);
  ctx.fillStyle = p.bandage;
  ctx.fillRect(-2, 1, 5, 1);
  ctx.fillRect(-2, 4, 5, 1);
  // Forearm (vambrace)
  ctx.fillStyle = p.bronzeDark;
  ctx.fillRect(-2, 6, 5, 8);
  ctx.fillStyle = p.bronze;
  ctx.fillRect(-2, 6, 5, 6);
  ctx.fillStyle = p.bronzeLight;
  ctx.fillRect(2, 6, 1, 8);
  // Hand
  ctx.fillStyle = p.skinDark;
  ctx.fillRect(-2, 14, 5, 4);
  // === SHIELD (round) ===
  drawShield(ctx, 0, 13, t, p);
  ctx.restore();

  // === HEAD with ROMAN HELMET ===
  // Skin under helmet (just chin)
  ctx.fillStyle = p.skinDark;
  ctx.fillRect(sx - 5, sy - 26 + breathe, 10, 4);
  ctx.fillStyle = p.skin;
  ctx.fillRect(sx - 5, sy - 26 + breathe, 10, 3);

  // Helmet base
  ctx.fillStyle = p.bronzeDark;
  ctx.fillRect(sx - 8, sy - 38 + breathe, 16, 12);
  ctx.fillStyle = p.bronze;
  ctx.fillRect(sx - 8, sy - 38 + breathe, 16, 10);
  ctx.fillStyle = p.bronzeLight;
  ctx.fillRect(sx - 8, sy - 38 + breathe, 3, 12);

  // Helmet lower edge (curve)
  ctx.fillStyle = p.bronzeDark;
  ctx.fillRect(sx - 8, sy - 28 + breathe, 16, 2);
  ctx.fillStyle = p.bronzeLight;
  ctx.fillRect(sx - 8, sy - 28 + breathe, 16, 0.5);

  // Cheek guards (lateral plates)
  ctx.fillStyle = p.bronzeDark;
  ctx.fillRect(sx - 8, sy - 28 + breathe, 3, 5);
  ctx.fillRect(sx + 5, sy - 28 + breathe, 3, 5);
  ctx.fillStyle = p.bronze;
  ctx.fillRect(sx - 8, sy - 28 + breathe, 3, 4);
  ctx.fillRect(sx + 5, sy - 28 + breathe, 3, 4);

  // === HORSEHAIR CREST (signature) ===
  drawCrest(ctx, sx, sy - 38 + breathe, t, p);

  // Eye slits (visor opening)
  ctx.fillStyle = '#000';
  ctx.fillRect(sx - 5, sy - 32 + breathe, 4, 2);
  ctx.fillRect(sx + 1, sy - 32 + breathe, 4, 2);
  // Eye glow (rage when triggered)
  if(rageActive > 0){
    const eyePulse = 0.85 + Math.sin(t * 0.15) * 0.15;
    ctx.fillStyle = `rgba(200,40,40,${eyePulse * rageActive})`;
    ctx.fillRect(sx - 4, sy - 31 + breathe, 2, 1);
    ctx.fillRect(sx + 2, sy - 31 + breathe, 2, 1);
  } else {
    const eyePulse = 0.85 + Math.sin(t * 0.08) * 0.15;
    ctx.fillStyle = `rgba(216,200,128,${eyePulse * 0.85})`;
    ctx.fillRect(sx - 4, sy - 31 + breathe, 2, 1);
    ctx.fillRect(sx + 2, sy - 31 + breathe, 2, 1);
  }

  // Helmet rivets
  ctx.fillStyle = p.bronzeDark;
  ctx.fillRect(sx - 7, sy - 35 + breathe, 1, 1);
  ctx.fillRect(sx + 6, sy - 35 + breathe, 1, 1);
  ctx.fillRect(sx - 7, sy - 30 + breathe, 1, 1);
  ctx.fillRect(sx + 6, sy - 30 + breathe, 1, 1);

  // Battle damage on helmet
  ctx.strokeStyle = p.bronzeDark;
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(sx + 4, sy - 36 + breathe);
  ctx.lineTo(sx + 6, sy - 33 + breathe);
  ctx.stroke();
}

function drawCrest(ctx, lx, ly, t, p){
  // Horsehair crest (from top of helmet, falling back)
  const sway = Math.sin(t * 0.08) * 1.5;
  // Base mount
  ctx.fillStyle = p.bronzeDark;
  ctx.fillRect(lx - 1, ly - 1, 2, 2);
  // Crest hair (multiple strands)
  for(let i = 0; i < 8; i++){
    const offset = i - 4;
    const len = 5 + Math.abs(offset) * 0.5;
    ctx.fillStyle = i % 2 === 0 ? p.helmetCrest2 : p.helmetCrest;
    ctx.fillRect(Math.round(lx + offset * 0.5 + sway * 0.2), Math.round(ly - len), 1, len);
  }
  // Tip highlights
  ctx.fillStyle = '#e84040';
  ctx.fillRect(lx - 1, ly - 5, 1, 1);
  ctx.fillRect(lx + 1, ly - 4, 1, 1);
}

function drawGladius(ctx, lx, ly, t, p){
  // Pommel
  ctx.fillStyle = p.bronzeDark;
  ctx.fillRect(lx - 1.5, ly + 2, 3, 1);
  // Grip
  ctx.fillStyle = p.belt;
  ctx.fillRect(lx - 1, ly - 4, 2, 6);
  // Cross-guard
  ctx.fillStyle = p.bronze;
  ctx.fillRect(lx - 3, ly - 5, 6, 1);
  ctx.fillStyle = p.bronzeLight;
  ctx.fillRect(lx - 3, ly - 5, 6, 0.5);
  // Blade body (gladius - short, leaf-shaped)
  ctx.fillStyle = p.iron;
  ctx.beginPath();
  ctx.moveTo(lx - 2, ly - 5);
  ctx.lineTo(lx + 2, ly - 5);
  ctx.lineTo(lx + 2.5, ly - 10);
  ctx.lineTo(lx + 1.5, ly - 14);
  ctx.lineTo(lx, ly - 16);
  ctx.lineTo(lx - 1.5, ly - 14);
  ctx.lineTo(lx - 2.5, ly - 10);
  ctx.closePath();
  ctx.fill();
  // Edge
  ctx.fillStyle = p.ironLight;
  ctx.fillRect(lx - 1.5, ly - 14, 0.5, 9);
  // Center fuller
  ctx.fillStyle = p.ironDark;
  ctx.fillRect(lx - 0.5, ly - 13, 1, 8);
  // Blood
  ctx.fillStyle = p.bladeBlood;
  ctx.fillRect(lx + 0.5, ly - 9, 1, 3);
  ctx.fillStyle = p.blood;
  ctx.fillRect(lx, ly - 7, 1, 1);
}

function drawShield(ctx, lx, ly, t, p){
  // Round shield (parma)
  // Outer rim
  ctx.fillStyle = p.bronzeDark;
  ctx.beginPath();
  ctx.arc(lx, ly, 9, 0, Math.PI * 2);
  ctx.fill();
  // Wood/leather body
  ctx.fillStyle = p.iron;
  ctx.beginPath();
  ctx.arc(lx, ly, 8, 0, Math.PI * 2);
  ctx.fill();
  // Bronze center boss
  ctx.fillStyle = p.bronzeDark;
  ctx.beginPath();
  ctx.arc(lx, ly, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = p.bronze;
  ctx.beginPath();
  ctx.arc(lx, ly, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = p.bronzeLight;
  ctx.beginPath();
  ctx.arc(lx - 0.5, ly - 0.5, 1, 0, Math.PI * 2);
  ctx.fill();

  // Decorative spokes (bronze)
  ctx.strokeStyle = p.bronze;
  ctx.lineWidth = 0.7;
  ctx.beginPath();
  for(let i = 0; i < 4; i++){
    const angle = (i / 4) * Math.PI * 2;
    ctx.moveTo(lx + Math.cos(angle) * 4, ly + Math.sin(angle) * 4);
    ctx.lineTo(lx + Math.cos(angle) * 8, ly + Math.sin(angle) * 8);
  }
  ctx.stroke();

  // Battle damage (gashes)
  ctx.strokeStyle = p.ironDark;
  ctx.lineWidth = 0.6;
  ctx.beginPath();
  ctx.moveTo(lx - 6, ly - 3); ctx.lineTo(lx - 3, ly - 2);
  ctx.moveTo(lx + 4, ly + 3); ctx.lineTo(lx + 7, ly + 1);
  ctx.stroke();

  // Blood spatter
  ctx.fillStyle = p.blood;
  ctx.fillRect(lx - 5, ly - 3, 2, 1);
  ctx.fillRect(lx + 4, ly + 3, 1, 1);
}

export const attacks = {
  idle: {
    id: 'idle', name: 'IDLE', icon: '◇',
    duration: 9999, looping: true,
    description: 'Posture de combat, bouclier semi-levé, épée prête. Crête de cheval ondule.',
    phases: [{ from: 0, to: 9999, label: 'Loop' }],
    update(frame){
      const fx = [];
      if(frame % 30 === 0){
        fx.push({ type: 'ash', dx: 0, dy: -38, count: 1, color: '#a02828' });
      }
      return { opts: { shieldRaise: 0.2 }, fx };
    },
  },

  slash: {
    id: 'slash', name: 'GLADIUS STRIKE', icon: '⚔',
    duration: 70,
    description: 'Frappe épée précise. 50% Bleed. Mêlée range 1.',
    phases: [
      { from: 0, to: 22, label: 'Wind-up' },
      { from: 22, to: 32, label: 'Strike' },
      { from: 32, to: 70, label: 'Recovery' },
    ],
    update(frame){
      const opts = { shieldRaise: 0.2 };
      const fx = [];
      if(frame < 22){
        const p = frame / 22;
        opts.swordRaise = -p * 1.2;
      } else if(frame < 32){
        const p = (frame - 22) / 10;
        opts.swordRaise = -1.2 + p * 1.7;
        if(frame === 22){
          fx.push({ type: 'sparks', dx: -16, dy: -8, count: 12, color: '#c82828' });
          fx.push({ type: 'flash', dx: -16, dy: -8, color: '#e8c860', size: 14 });
          fx.push({ type: 'shockwave', dx: -16, dy: -4, color: '#a02828', maxRadius: 26 });
        }
      } else {
        const p = (frame - 32) / 38;
        opts.swordRaise = 0.5 - p * 0.5;
      }
      return { opts, fx };
    },
  },

  block: {
    id: 'block', name: 'SHIELD BLOCK', icon: '🛡',
    duration: 60,
    description: '30% chance de bloquer (réduit dégâts moitié). Anim : bouclier levé en garde.',
    phases: [
      { from: 0, to: 15, label: 'Raise' },
      { from: 15, to: 40, label: 'Hold' },
      { from: 40, to: 60, label: 'Lower' },
    ],
    update(frame){
      const opts = {};
      const fx = [];
      if(frame < 15){
        const p = frame / 15;
        opts.shieldRaise = 0.2 + p * 0.8;
        if(frame === 0){
          fx.push({ type: 'sparks', dx: 14, dy: -16, count: 6, color: '#c8a040' });
        }
      } else if(frame < 40){
        opts.shieldRaise = 1;
      } else {
        const p = (frame - 40) / 20;
        opts.shieldRaise = 1 - p * 0.8;
      }
      return { opts, fx };
    },
  },

  rage: {
    id: 'rage', name: 'RAGE', icon: '💢',
    duration: 80, passive: true,
    description: 'Passif : +30% damage en dessous de 50% HP. Aura rouge, yeux qui brillent rouge.',
    phases: [
      { from: 0, to: 25, label: 'Activation' },
      { from: 25, to: 80, label: 'Sustain' },
    ],
    update(frame){
      const opts = { shieldRaise: 0.4 };
      const fx = [];
      if(frame < 25){
        const p = frame / 25;
        opts.rageActive = p;
        if(frame === 0){
          fx.push({ type: 'flash', dx: 0, dy: -16, color: '#c82828', size: 24 });
          fx.push({ type: 'shockwave', dx: 0, dy: 0, color: '#a02828', maxRadius: 40 });
        }
      } else {
        opts.rageActive = 1 + Math.sin(frame * 0.2) * 0.2;
        if(frame % 5 === 0){
          const angle = Math.random() * Math.PI * 2;
          fx.push({ type: 'sparks', dx: Math.cos(angle) * 18, dy: -12 + Math.sin(angle) * 14, count: 1, color: '#c82828' });
        }
      }
      return { opts, fx };
    },
  },

  walk: {
    id: 'walk', name: 'WALK', icon: '🏃',
    duration: 200,
    looping: true,
    description: 'Marche disciplinée, posture de combat maintenue. Aller-retour 100/100.',
    phases: [
      { from: 0, to: 100, label: 'Avancée' },
      { from: 100, to: 200, label: 'Retour' },
    ],
    update(frame){
      const opts = { shieldRaise: 0.3 };
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
      opts.bodyShift += Math.sin(frame * 0.18) * 0.6;
      if(frame % 14 === 0){
        fx.push({ type: 'ash', dx: -4, dy: 11, count: 2, color: '#3a1a08' });
        fx.push({ type: 'ash', dx: 4, dy: 11, count: 2, color: '#3a1a08' });
      }
      return { opts, fx };
    },
  },
};

export const meta = { width: 36, height: 56, groundOffsetY: 0 };
export default { draw, attacks, palette, meta };
