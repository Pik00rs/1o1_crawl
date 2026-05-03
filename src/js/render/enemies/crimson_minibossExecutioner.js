// src/js/render/enemies/crimson_minibossExecutioner.js
// Exécuteur de l'Arène — MINIBOSS.
// Grosse hache à deux mains, cagoule de bourreau noire, torse nu massif,
// ceinture cloutée, plaques d'armure aux épaules.

export const palette = {
  skin:        '#a87858',
  skinDark:    '#5a3818',
  skinLight:   '#c89878',
  hood:        '#1a0a05',
  hoodLight:   '#3a1a08',
  hoodEye:     '#3a3018',
  belt:        '#3a1a08',
  beltStud:    '#a89878',
  beltStudDk:  '#5a4828',
  pants:       '#1a0a05',
  shoulder:    '#3a3018',
  shoulderEdg: '#7a6850',
  bronze:      '#c8a040',
  bronzeLight: '#e8c860',
  bronzeDark:  '#7a5818',
  scar:        '#5a3018',
  blood:       '#5a0808',
  bloodFresh:  '#a02828',
  bloodBright: '#c82828',
  // Hache
  axeHaft:     '#3a1a08',
  axeHaftLt:   '#5a3018',
  axeHead:     '#5a4828',
  axeHeadEdge: '#9a8868',
  axeHeadHi:   '#d8c8a0',
  axeHeadDk:   '#2a1808',
  axeBlood:    '#5a0808',
  rope:        '#7a6850',
  shadow:      'rgba(20,5,5,0.95)',
};

export function draw(ctx, sx, sy, t, opts){
  opts = opts || {};
  const p = palette;
  const bob = Math.sin(t * 0.035) * 0.7; // lent, lourd
  const breathe = Math.sin(t * 0.025) * 0.5;
  sx = Math.round(sx + (opts.bodyShift || 0));
  sy = Math.round(sy + bob);

  const axeRaise = opts.axeRaise || 0;
  const armorPiercing = opts.armorPiercing || 0;

  // Shadow (très large)
  ctx.fillStyle = p.shadow;
  ctx.beginPath();
  ctx.ellipse(sx, sy + 10, 20, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Soft red death glow
  const glow = 0.45 + armorPiercing * 0.4 + Math.sin(t * 0.05) * 0.15;
  const bg = ctx.createRadialGradient(sx, sy - 18, 5, sx, sy - 18, 44);
  bg.addColorStop(0, `rgba(90,8,8,${glow * 0.5})`);
  bg.addColorStop(0.5, `rgba(138,24,24,${glow * 0.3})`);
  bg.addColorStop(1, 'rgba(90,8,8,0)');
  ctx.fillStyle = bg;
  ctx.fillRect(sx - 44, sy - 60, 88, 76);

  // Legs (pants, heavy)
  ctx.fillStyle = p.pants;
  ctx.fillRect(sx - 9, sy - 1, 7, 11);
  ctx.fillRect(sx + 2, sy - 1, 7, 11);
  ctx.fillStyle = p.hoodLight;
  ctx.fillRect(sx - 9, sy - 1, 1, 11);

  // Boots (massive, leather, studded)
  ctx.fillStyle = '#000';
  ctx.fillRect(sx - 11, sy + 10, 9, 4);
  ctx.fillRect(sx + 2, sy + 10, 9, 4);
  // Studs on boots
  ctx.fillStyle = p.beltStud;
  ctx.fillRect(sx - 9, sy + 11, 1, 1);
  ctx.fillRect(sx - 5, sy + 11, 1, 1);
  ctx.fillRect(sx + 4, sy + 11, 1, 1);
  ctx.fillRect(sx + 8, sy + 11, 1, 1);

  // Loincloth (rags)
  ctx.fillStyle = p.belt;
  ctx.fillRect(sx - 9, sy - 4 + breathe, 18, 5);
  ctx.fillStyle = p.hoodLight;
  ctx.fillRect(sx - 9, sy - 4 + breathe, 18, 3);

  // Studded belt (signature)
  ctx.fillStyle = '#000';
  ctx.fillRect(sx - 11, sy - 6 + breathe, 22, 3);
  ctx.fillStyle = p.beltStud;
  // Studs
  for(let i = 0; i < 7; i++){
    ctx.fillRect(sx - 10 + i * 3, sy - 5 + breathe, 1, 1);
  }
  ctx.fillStyle = p.beltStudDk;
  for(let i = 0; i < 7; i++){
    ctx.fillRect(sx - 10 + i * 3, sy - 4 + breathe, 1, 1);
  }
  // Bronze buckle
  ctx.fillStyle = p.bronze;
  ctx.fillRect(sx - 2, sy - 6 + breathe, 4, 3);
  ctx.fillStyle = p.bronzeLight;
  ctx.fillRect(sx - 1, sy - 5 + breathe, 1, 1);

  // === TORSO (massive bare chest) ===
  ctx.fillStyle = p.skinDark;
  ctx.fillRect(sx - 12, sy - 28 + breathe, 24, 22);
  ctx.fillStyle = p.skin;
  ctx.fillRect(sx - 12, sy - 28 + breathe, 24, 19);
  ctx.fillStyle = p.skinLight;
  ctx.fillRect(sx - 12, sy - 28 + breathe, 3, 22);

  // Massive pecs
  ctx.fillStyle = p.skinDark;
  ctx.fillRect(sx - 10, sy - 26 + breathe, 9, 8);
  ctx.fillRect(sx + 1, sy - 26 + breathe, 9, 8);
  ctx.fillStyle = p.skin;
  ctx.fillRect(sx - 10, sy - 26 + breathe, 9, 6);
  ctx.fillRect(sx + 1, sy - 26 + breathe, 9, 6);
  // Cleavage line
  ctx.fillStyle = p.skinDark;
  ctx.fillRect(sx, sy - 26 + breathe, 0.5, 8);

  // Abs (huge)
  ctx.strokeStyle = p.skinDark;
  ctx.lineWidth = 0.6;
  ctx.beginPath();
  ctx.moveTo(sx - 8, sy - 17 + breathe); ctx.lineTo(sx + 8, sy - 17 + breathe);
  ctx.moveTo(sx - 7, sy - 13 + breathe); ctx.lineTo(sx + 7, sy - 13 + breathe);
  ctx.moveTo(sx - 6, sy - 10 + breathe); ctx.lineTo(sx + 6, sy - 10 + breathe);
  ctx.moveTo(sx, sy - 18 + breathe); ctx.lineTo(sx, sy - 7 + breathe);
  ctx.stroke();

  // Battle scars (signature - many)
  ctx.strokeStyle = p.scar;
  ctx.lineWidth = 0.7;
  ctx.beginPath();
  // Long diagonal across chest
  ctx.moveTo(sx - 9, sy - 25 + breathe);
  ctx.lineTo(sx + 4, sy - 12 + breathe);
  // Side scar
  ctx.moveTo(sx + 8, sy - 22 + breathe);
  ctx.lineTo(sx + 11, sy - 16 + breathe);
  // Vertical scar on belly
  ctx.moveTo(sx - 5, sy - 8 + breathe);
  ctx.lineTo(sx - 4, sy - 14 + breathe);
  ctx.stroke();

  // Old blood stains
  ctx.fillStyle = p.blood;
  ctx.fillRect(sx + 5, sy - 16 + breathe, 1, 1);
  ctx.fillRect(sx - 7, sy - 19 + breathe, 1, 1);

  // === SHOULDER ARMOR (signature) ===
  // Left shoulder (big iron pauldron with spikes)
  ctx.fillStyle = p.hood;
  ctx.fillRect(sx - 17, sy - 31 + breathe, 8, 8);
  ctx.fillStyle = p.shoulder;
  ctx.fillRect(sx - 17, sy - 31 + breathe, 8, 6);
  ctx.fillStyle = p.shoulderEdg;
  ctx.fillRect(sx - 17, sy - 31 + breathe, 8, 1);
  // Spike on shoulder
  ctx.fillStyle = p.shoulder;
  ctx.beginPath();
  ctx.moveTo(sx - 17, sy - 31 + breathe);
  ctx.lineTo(sx - 13, sy - 36 + breathe);
  ctx.lineTo(sx - 9, sy - 31 + breathe);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = p.shoulderEdg;
  ctx.fillRect(sx - 13, sy - 35 + breathe, 1, 3);

  // Right shoulder (mirror)
  ctx.fillStyle = p.hood;
  ctx.fillRect(sx + 9, sy - 31 + breathe, 8, 8);
  ctx.fillStyle = p.shoulder;
  ctx.fillRect(sx + 9, sy - 31 + breathe, 8, 6);
  ctx.fillStyle = p.shoulderEdg;
  ctx.fillRect(sx + 9, sy - 31 + breathe, 8, 1);
  ctx.fillStyle = p.shoulder;
  ctx.beginPath();
  ctx.moveTo(sx + 9, sy - 31 + breathe);
  ctx.lineTo(sx + 13, sy - 36 + breathe);
  ctx.lineTo(sx + 17, sy - 31 + breathe);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = p.shoulderEdg;
  ctx.fillRect(sx + 12, sy - 35 + breathe, 1, 3);

  // === ARMS (huge, with leather bracers) ===
  // Both arms holding the axe at the haft (two-handed grip)
  // Left arm (front, holding upper haft)
  ctx.save();
  ctx.translate(sx - 16, sy - 28 + breathe);
  ctx.rotate(axeRaise * 0.7);
  // Bicep
  ctx.fillStyle = p.skinDark;
  ctx.fillRect(-3, 0, 6, 10);
  ctx.fillStyle = p.skin;
  ctx.fillRect(-3, 0, 1, 10);
  // Bracer
  ctx.fillStyle = p.belt;
  ctx.fillRect(-3, 10, 6, 8);
  ctx.fillStyle = p.beltStudDk;
  ctx.fillRect(-3, 10, 6, 1);
  // Studs on bracer
  ctx.fillStyle = p.beltStud;
  ctx.fillRect(-2, 12, 1, 1);
  ctx.fillRect(0, 12, 1, 1);
  ctx.fillRect(2, 12, 1, 1);
  ctx.fillRect(-2, 15, 1, 1);
  ctx.fillRect(2, 15, 1, 1);
  // Hand
  ctx.fillStyle = p.skinDark;
  ctx.fillRect(-3, 18, 6, 5);
  ctx.restore();

  // Right arm (back, holding lower haft)
  ctx.save();
  ctx.translate(sx + 16, sy - 28 + breathe);
  ctx.rotate(-axeRaise * 0.5);
  ctx.fillStyle = p.skinDark;
  ctx.fillRect(-3, 0, 6, 10);
  ctx.fillStyle = p.skin;
  ctx.fillRect(2, 0, 1, 10);
  ctx.fillStyle = p.belt;
  ctx.fillRect(-3, 10, 6, 8);
  ctx.fillStyle = p.beltStudDk;
  ctx.fillRect(-3, 10, 6, 1);
  ctx.fillStyle = p.beltStud;
  ctx.fillRect(-2, 12, 1, 1);
  ctx.fillRect(0, 12, 1, 1);
  ctx.fillRect(2, 12, 1, 1);
  ctx.fillRect(-2, 15, 1, 1);
  ctx.fillRect(2, 15, 1, 1);
  ctx.fillStyle = p.skinDark;
  ctx.fillRect(-3, 18, 6, 5);
  ctx.restore();

  // === EXECUTIONER HOOD (signature, full black with eye holes) ===
  // Hood neck
  ctx.fillStyle = p.hood;
  ctx.fillRect(sx - 6, sy - 28 + breathe, 12, 5);
  // Hood main mass (covers entire head, falls over shoulders)
  ctx.fillStyle = p.hood;
  ctx.fillRect(sx - 9, sy - 42 + breathe, 18, 14);
  ctx.fillStyle = p.hoodLight;
  ctx.fillRect(sx - 9, sy - 42 + breathe, 18, 1);
  ctx.fillStyle = '#000';
  ctx.fillRect(sx - 9, sy - 42 + breathe, 1, 14);

  // Hood pointed top
  ctx.fillStyle = p.hood;
  ctx.beginPath();
  ctx.moveTo(sx - 4, sy - 42 + breathe);
  ctx.lineTo(sx + 4, sy - 42 + breathe);
  ctx.lineTo(sx, sy - 47 + breathe);
  ctx.closePath();
  ctx.fill();

  // Rope around neck (signature)
  ctx.fillStyle = p.rope;
  ctx.fillRect(sx - 7, sy - 30 + breathe, 14, 1);
  // Rope detail (twisted)
  for(let i = 0; i < 7; i++){
    ctx.fillStyle = p.bronzeDark;
    ctx.fillRect(sx - 7 + i * 2, sy - 30 + breathe, 1, 1);
  }

  // === EYE HOLES (signature) — empty void with red glow ===
  ctx.fillStyle = '#000';
  ctx.fillRect(sx - 5, sy - 36 + breathe, 3, 3);
  ctx.fillRect(sx + 2, sy - 36 + breathe, 3, 3);
  // Red glow inside (executioner's stare)
  const eyePulse = 0.92 + Math.sin(t * 0.08) * 0.08;
  ctx.fillStyle = `rgba(200,40,40,${eyePulse})`;
  ctx.fillRect(sx - 4, sy - 35 + breathe, 1, 1);
  ctx.fillRect(sx + 3, sy - 35 + breathe, 1, 1);
  // Bright center
  ctx.fillStyle = `rgba(255,128,128,${eyePulse * 0.85})`;
  ctx.fillRect(sx - 4, sy - 35 + breathe, 0.5, 0.5);
  ctx.fillRect(sx + 3, sy - 35 + breathe, 0.5, 0.5);

  // Mouth slit (small, dark)
  ctx.fillStyle = '#000';
  ctx.fillRect(sx - 3, sy - 32 + breathe, 6, 1);

  // Stitching on the hood
  ctx.strokeStyle = p.hoodLight;
  ctx.lineWidth = 0.4;
  ctx.beginPath();
  ctx.moveTo(sx - 9, sy - 33 + breathe);
  ctx.lineTo(sx + 9, sy - 33 + breathe);
  ctx.stroke();

  // === GIANT 2-HANDED AXE (signature) ===
  drawGiantAxe(ctx, sx, sy, t, axeRaise, breathe, p);
}

function drawGiantAxe(ctx, sx, sy, t, axeRaise, breathe, p){
  // Axe is held in front, vertical when idle, raised over head when striking
  // Base position : haft from hands at sx-16/sy-10 going up to sx-16/sy-44
  // When axeRaise = 0 : axe vertical
  // When axeRaise = -1.4 : axe raised over head
  // When axeRaise = 0.5 : axe down

  ctx.save();
  ctx.translate(sx - 16, sy - 10 + breathe);
  ctx.rotate(axeRaise * 0.8);

  // Haft (long, going up)
  ctx.fillStyle = p.axeHaft;
  ctx.fillRect(-1.5, -34, 3, 38);
  ctx.fillStyle = p.axeHaftLt;
  ctx.fillRect(-1.5, -34, 1, 38);
  // Wraps on haft (binding)
  ctx.fillStyle = p.belt;
  ctx.fillRect(-2, -22, 4, 2);
  ctx.fillRect(-2, -10, 4, 2);
  ctx.fillRect(-2, -28, 4, 2);

  // Pommel (bottom)
  ctx.fillStyle = p.axeHeadDk;
  ctx.fillRect(-2, 4, 4, 2);
  ctx.fillStyle = p.bronze;
  ctx.fillRect(-2, 4, 4, 1);

  // === AXE HEAD (massive, single-bit) ===
  // Mounting at the top
  ctx.fillStyle = p.axeHeadDk;
  ctx.fillRect(-3, -38, 6, 4);
  ctx.fillStyle = p.axeHead;
  ctx.fillRect(-3, -38, 6, 3);

  // Big curved blade
  ctx.fillStyle = p.axeHeadDk;
  ctx.beginPath();
  ctx.moveTo(-3, -38);
  ctx.lineTo(-14, -42);
  ctx.lineTo(-16, -36);
  ctx.lineTo(-14, -28);
  ctx.lineTo(-3, -32);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = p.axeHead;
  ctx.beginPath();
  ctx.moveTo(-3, -38);
  ctx.lineTo(-13, -41);
  ctx.lineTo(-15, -36);
  ctx.lineTo(-13, -29);
  ctx.lineTo(-3, -33);
  ctx.closePath();
  ctx.fill();

  // Edge highlight
  ctx.fillStyle = p.axeHeadEdge;
  ctx.beginPath();
  ctx.moveTo(-13, -41);
  ctx.lineTo(-15, -36);
  ctx.lineTo(-13, -29);
  ctx.lineTo(-14, -32);
  ctx.lineTo(-15, -36);
  ctx.lineTo(-14, -40);
  ctx.closePath();
  ctx.fill();

  // Bright cutting edge
  ctx.fillStyle = p.axeHeadHi;
  ctx.fillRect(-15, -36, 1, 0.5);
  ctx.beginPath();
  ctx.moveTo(-14, -40);
  ctx.lineTo(-16, -36);
  ctx.lineTo(-14, -32);
  ctx.stroke();

  // Spike on top of axe head (executioner detail)
  ctx.fillStyle = p.axeHeadDk;
  ctx.beginPath();
  ctx.moveTo(0, -38);
  ctx.lineTo(2, -42);
  ctx.lineTo(-2, -42);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = p.axeHead;
  ctx.fillRect(-1, -42, 1, 4);

  // Rivet on axe head
  ctx.fillStyle = p.bronze;
  ctx.beginPath();
  ctx.arc(-1, -36, 1, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = p.bronzeLight;
  ctx.fillRect(-1.5, -36.5, 1, 1);

  // === BLOOD (lots) ===
  ctx.fillStyle = p.axeBlood;
  ctx.fillRect(-12, -38, 6, 1);
  ctx.fillRect(-10, -34, 4, 2);
  ctx.fillRect(-8, -31, 3, 1);
  ctx.fillStyle = p.bloodFresh;
  ctx.fillRect(-9, -36, 3, 1);
  ctx.fillRect(-7, -33, 2, 1);
  // Blood drip from edge
  if(t % 100 < 60){
    const len = Math.floor((t % 60) / 12);
    ctx.fillStyle = p.bloodFresh;
    ctx.fillRect(-10, -28, 1, 1 + len);
    ctx.fillStyle = p.bloodBright;
    ctx.fillRect(-10, -28, 1, 1);
  }

  ctx.restore();
}

export const attacks = {
  idle: {
    id: 'idle', name: 'IDLE', icon: '◇',
    duration: 9999, looping: true,
    description: 'Posture stoïque, hache portée à deux mains. Respiration profonde, eye holes rouges qui pulsent.',
    phases: [{ from: 0, to: 9999, label: 'Loop' }],
    update(frame){
      const fx = [];
      if(frame % 30 === 0){
        fx.push({ type: 'ash', dx: -16, dy: -36, count: 1, color: '#5a0808' });
      }
      return { opts: {}, fx };
    },
  },

  execute: {
    id: 'execute', name: 'EXECUTE', icon: '🪓',
    duration: 100,
    description: 'Frappe hache verticale lourde. 60% Bleed forte. +80% damage si cible <40% HP.',
    phases: [
      { from: 0, to: 35, label: 'Wind-up' },
      { from: 35, to: 50, label: 'Strike' },
      { from: 50, to: 100, label: 'Recovery' },
    ],
    update(frame){
      const opts = {};
      const fx = [];
      if(frame < 35){
        const p = frame / 35;
        opts.axeRaise = -p * 1.5;
      } else if(frame < 50){
        const p = (frame - 35) / 15;
        opts.axeRaise = -1.5 + p * 2.0;
        if(frame === 35){
          fx.push({ type: 'sparks', dx: -16, dy: -10, count: 18, color: '#c82828' });
          fx.push({ type: 'flash', dx: -16, dy: -10, color: '#a02828', size: 18 });
          fx.push({ type: 'shockwave', dx: -16, dy: 0, color: '#5a0808', maxRadius: 36 });
        }
        if(frame === 42){
          fx.push({ type: 'sparks', dx: -16, dy: 0, count: 14, color: '#5a0808' });
          fx.push({ type: 'shockwave', dx: -16, dy: 4, color: '#8a1818', maxRadius: 26 });
        }
      } else {
        const p = (frame - 50) / 50;
        opts.axeRaise = 0.5 - p * 0.5;
      }
      return { opts, fx };
    },
  },

  armorPierce: {
    id: 'armorPierce', name: 'ARMOR PIERCE', icon: '⚔',
    duration: 90,
    description: 'Frappe en piqué qui ignore 40% de l\'armure cible. Anim : pointe d\'abord, frappe descendante focalisée.',
    phases: [
      { from: 0, to: 30, label: 'Aim' },
      { from: 30, to: 45, label: 'Pierce' },
      { from: 45, to: 90, label: 'Recovery' },
    ],
    update(frame){
      const opts = {};
      const fx = [];
      if(frame < 30){
        const p = frame / 30;
        opts.axeRaise = -p * 0.6;
        opts.armorPiercing = p;
        if(frame % 4 === 0){
          fx.push({ type: 'sparks', dx: -8, dy: -36, count: 1, color: '#c8a040' });
        }
      } else if(frame < 45){
        const p = (frame - 30) / 15;
        opts.axeRaise = -0.6 + p * 1.4;
        opts.armorPiercing = 1;
        if(frame === 30){
          fx.push({ type: 'flash', dx: -16, dy: -16, color: '#e8c860', size: 14 });
          fx.push({ type: 'sparks', dx: -16, dy: -16, count: 10, color: '#c8a040' });
        }
        if(frame === 38){
          fx.push({ type: 'sparks', dx: -16, dy: -4, count: 16, color: '#c82828' });
          fx.push({ type: 'flash', dx: -16, dy: -4, color: '#fff', size: 14 });
          fx.push({ type: 'shockwave', dx: -16, dy: 0, color: '#a02828', maxRadius: 32 });
        }
      } else {
        const p = (frame - 45) / 45;
        opts.axeRaise = 0.8 - p * 0.8;
        opts.armorPiercing = Math.max(0, 1 - p);
      }
      return { opts, fx };
    },
  },

  walk: {
    id: 'walk', name: 'HEAVY WALK', icon: '🏃',
    duration: 240, // lent et lourd
    looping: true,
    description: 'Marche lente et lourde. Aller-retour 120/120. Pas qui font trembler le sol.',
    phases: [
      { from: 0, to: 120, label: 'Avancée' },
      { from: 120, to: 240, label: 'Retour' },
    ],
    update(frame){
      const opts = {};
      const fx = [];
      const half = 120;
      let p;
      if(frame < half){
        p = frame / half;
        opts.bodyShift = p * 38;
      } else {
        p = (frame - half) / half;
        opts.bodyShift = (1 - p) * 38;
      }
      opts.bodyShift += Math.sin(frame * 0.15) * 0.7;
      // Axe sways with weight
      opts.axeRaise = Math.sin(frame * 0.13) * 0.1;
      if(frame % 18 === 0){
        fx.push({ type: 'ash', dx: -5, dy: 13, count: 3, color: '#3a1a08' });
        fx.push({ type: 'ash', dx: 5, dy: 13, count: 3, color: '#3a1a08' });
        fx.push({ type: 'shockwave', dx: 0, dy: 13, color: '#3a1a08', maxRadius: 12 });
      }
      return { opts, fx };
    },
  },
};

export const meta = { width: 44, height: 64, groundOffsetY: 0 };
export default { draw, attacks, palette, meta };
