// src/js/render/enemies/crimson_butcher.js
// Boucher — mob mêlée slash avec bleed.
// Silhouette massive avec tablier de cuir taché de sang, masque de cuir,
// gros couperet dans une main. Bras nus musclés.

export const palette = {
  skin:        '#a87858',
  skinDark:    '#5a3818',
  skinLight:   '#c89878',
  apronLeather:'#3a1a08',
  apronLight:  '#5a2818',
  bloodStain:  '#5a0808',
  bloodFresh:  '#a02828',
  bloodBright: '#c82828',
  mask:        '#1a0a05',
  maskStrap:   '#3a1a08',
  pants:       '#2a1408',
  cleaverBlade:'#9a8868',
  cleaverEdge: '#d8c8a0',
  cleaverHaft: '#3a1808',
  cleaverBlood:'#5a0808',
  bone:        '#a89878',
  shadow:      'rgba(20,5,5,0.9)',
};

export function draw(ctx, sx, sy, t, opts){
  opts = opts || {};
  const p = palette;
  const bob = Math.sin(t * 0.04) * 0.5;
  const breathe = Math.sin(t * 0.03) * 0.4;
  sx = Math.round(sx + (opts.bodyShift || 0));
  sy = Math.round(sy + bob);

  const cleaverRaise = opts.cleaverRaise || 0;

  // Shadow (large)
  ctx.fillStyle = p.shadow;
  ctx.beginPath();
  ctx.ellipse(sx, sy + 8, 14, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Soft red glow (constant menace)
  const glow = 0.35 + Math.sin(t * 0.05) * 0.1;
  const bg = ctx.createRadialGradient(sx, sy - 14, 4, sx, sy - 14, 30);
  bg.addColorStop(0, `rgba(90,8,8,${glow * 0.45})`);
  bg.addColorStop(1, 'rgba(90,8,8,0)');
  ctx.fillStyle = bg;
  ctx.fillRect(sx - 30, sy - 42, 60, 52);

  // Legs (heavy pants)
  ctx.fillStyle = p.pants;
  ctx.fillRect(sx - 8, sy - 1, 7, 9);
  ctx.fillRect(sx + 1, sy - 1, 7, 9);
  ctx.fillStyle = p.apronLight;
  ctx.fillRect(sx - 8, sy - 1, 1, 9);

  // Boots (heavy, blood-stained)
  ctx.fillStyle = '#000';
  ctx.fillRect(sx - 9, sy + 8, 8, 4);
  ctx.fillRect(sx + 1, sy + 8, 8, 4);
  // Blood splatter on boots
  ctx.fillStyle = p.bloodStain;
  ctx.fillRect(sx - 7, sy + 11, 2, 1);
  ctx.fillRect(sx + 4, sy + 11, 2, 1);

  // === LEATHER APRON (signature, stained) ===
  // Apron main shape
  ctx.fillStyle = p.apronLeather;
  ctx.beginPath();
  ctx.moveTo(sx - 11, sy + 6);
  ctx.lineTo(sx + 11, sy + 6);
  ctx.lineTo(sx + 10, sy - 16 + breathe);
  ctx.lineTo(sx + 4, sy - 22 + breathe);
  ctx.lineTo(sx - 4, sy - 22 + breathe);
  ctx.lineTo(sx - 10, sy - 16 + breathe);
  ctx.closePath();
  ctx.fill();
  // Apron highlight
  ctx.fillStyle = p.apronLight;
  ctx.fillRect(sx - 10, sy - 16 + breathe, 2, 22);
  // Apron strap around neck (V at top)
  ctx.fillStyle = p.apronLeather;
  ctx.fillRect(sx - 4, sy - 22 + breathe, 1, 4);
  ctx.fillRect(sx + 3, sy - 22 + breathe, 1, 4);

  // === BLOOD STAINS ON APRON (defining feature) ===
  drawBloodStain(ctx, sx - 4, sy - 8 + breathe, 5, t, p);
  drawBloodStain(ctx, sx + 3, sy - 14 + breathe, 4, t + 50, p);
  drawBloodStain(ctx, sx - 6, sy + 1 + breathe, 3, t + 100, p);
  drawBloodStain(ctx, sx + 5, sy - 2 + breathe, 4, t + 30, p);
  // Fresh blood drip
  ctx.fillStyle = p.bloodBright;
  if(t % 80 < 40){
    const len = Math.floor((t % 40) / 10);
    ctx.fillRect(sx - 2, sy - 5 + breathe, 1, 1 + len);
    ctx.fillStyle = p.bloodFresh;
    ctx.fillRect(sx - 2, sy - 5 + breathe + len, 1, 1);
  }

  // Belt/strap visible at waist
  ctx.fillStyle = p.maskStrap;
  ctx.fillRect(sx - 11, sy - 4 + breathe, 22, 2);

  // === ARMS (massive, bare, bloodied) ===
  // Left arm holding the cleaver
  ctx.save();
  ctx.translate(sx - 11, sy - 18 + breathe);
  ctx.rotate(cleaverRaise);
  // Bicep
  ctx.fillStyle = p.skinDark;
  ctx.fillRect(-3, 0, 5, 8);
  ctx.fillStyle = p.skin;
  ctx.fillRect(-3, 0, 1, 8);
  // Forearm
  ctx.fillStyle = p.skinDark;
  ctx.fillRect(-3, 8, 5, 8);
  ctx.fillStyle = p.skin;
  ctx.fillRect(-3, 8, 1, 8);
  // Blood spatter on forearm
  ctx.fillStyle = p.bloodStain;
  ctx.fillRect(-1, 4, 2, 1);
  ctx.fillRect(0, 11, 2, 2);
  // Hand
  ctx.fillStyle = p.skinDark;
  ctx.fillRect(-3, 16, 5, 4);
  // === CLEAVER (signature) ===
  drawCleaver(ctx, 0, 20, t, p);
  ctx.restore();

  // Right arm (resting)
  ctx.fillStyle = p.skinDark;
  ctx.fillRect(sx + 9, sy - 18 + breathe, 5, 16);
  ctx.fillStyle = p.skin;
  ctx.fillRect(sx + 13, sy - 18 + breathe, 1, 16);
  // Blood on this arm
  ctx.fillStyle = p.bloodStain;
  ctx.fillRect(sx + 10, sy - 12 + breathe, 2, 1);
  ctx.fillRect(sx + 11, sy - 6 + breathe, 1, 2);
  // Hand
  ctx.fillStyle = p.skinDark;
  ctx.fillRect(sx + 9, sy - 2 + breathe, 5, 4);

  // === HEAD (with leather mask) ===
  // Head base
  ctx.fillStyle = p.skinDark;
  ctx.fillRect(sx - 7, sy - 32 + breathe, 14, 12);
  ctx.fillStyle = p.skin;
  ctx.fillRect(sx - 7, sy - 32 + breathe, 14, 10);
  ctx.fillStyle = p.skinLight;
  ctx.fillRect(sx - 7, sy - 32 + breathe, 2, 12);

  // === LEATHER MASK (signature) ===
  // Mask covers lower face
  ctx.fillStyle = p.mask;
  ctx.fillRect(sx - 7, sy - 26 + breathe, 14, 6);
  // Mask highlight
  ctx.fillStyle = p.maskStrap;
  ctx.fillRect(sx - 7, sy - 26 + breathe, 14, 1);
  // Stitching line
  ctx.fillStyle = p.apronLight;
  ctx.fillRect(sx, sy - 26 + breathe, 0.5, 6);
  // Strap going up to head
  ctx.fillStyle = p.maskStrap;
  ctx.fillRect(sx - 7, sy - 28 + breathe, 14, 1);
  ctx.fillRect(sx - 8, sy - 26 + breathe, 1, 5);
  ctx.fillRect(sx + 7, sy - 26 + breathe, 1, 5);
  // Breathing holes (3 dots)
  ctx.fillStyle = '#000';
  ctx.fillRect(sx - 2, sy - 22 + breathe, 1, 1);
  ctx.fillRect(sx, sy - 22 + breathe, 1, 1);
  ctx.fillRect(sx + 2, sy - 22 + breathe, 1, 1);
  // Blood stain on mask
  ctx.fillStyle = p.bloodStain;
  ctx.fillRect(sx + 2, sy - 24 + breathe, 3, 1);

  // Eyes (cold, dead)
  ctx.fillStyle = '#000';
  ctx.fillRect(sx - 5, sy - 30 + breathe, 3, 2);
  ctx.fillRect(sx + 2, sy - 30 + breathe, 3, 2);
  const eyePulse = 0.92 + Math.sin(t * 0.08) * 0.08;
  ctx.fillStyle = `rgba(216,200,128,${eyePulse * 0.85})`;
  ctx.fillRect(sx - 4, sy - 29 + breathe, 1, 1);
  ctx.fillRect(sx + 3, sy - 29 + breathe, 1, 1);

  // Bald head with fresh stains on top
  ctx.fillStyle = p.bloodStain;
  ctx.fillRect(sx + 2, sy - 32 + breathe, 2, 1);
  ctx.fillRect(sx - 3, sy - 31 + breathe, 1, 1);
}

function drawBloodStain(ctx, lx, ly, scale, t, p){
  // Irregular blood stain shape
  ctx.fillStyle = p.bloodStain;
  ctx.fillRect(lx - scale / 2, ly - scale / 3, scale, scale * 0.7);
  // Drips below
  ctx.fillRect(lx, ly + scale * 0.4, 1, scale * 0.5);
  ctx.fillRect(lx - scale / 3, ly + scale * 0.3, 1, scale * 0.3);
  // Darker center
  ctx.fillStyle = '#3a0505';
  ctx.fillRect(lx - 1, ly - 1, 2, 2);
}

function drawCleaver(ctx, lx, ly, t, p){
  // Haft (handle)
  ctx.fillStyle = p.cleaverHaft;
  ctx.fillRect(lx - 1, ly - 6, 2, 8);
  ctx.fillStyle = p.maskStrap;
  ctx.fillRect(lx - 1, ly - 6, 1, 8);

  // Pommel
  ctx.fillStyle = p.cleaverHaft;
  ctx.fillRect(lx - 2, ly + 2, 4, 1);

  // === BIG CLEAVER BLADE ===
  // Main rectangular blade (large)
  ctx.fillStyle = p.cleaverBlade;
  ctx.beginPath();
  ctx.moveTo(lx + 1, ly - 6);
  ctx.lineTo(lx + 11, ly - 6);
  ctx.lineTo(lx + 12, ly - 8);
  ctx.lineTo(lx + 12, ly + 2);
  ctx.lineTo(lx + 11, ly + 4);
  ctx.lineTo(lx + 1, ly + 4);
  ctx.closePath();
  ctx.fill();

  // Edge (bright line on top)
  ctx.fillStyle = p.cleaverEdge;
  ctx.fillRect(lx + 1, ly - 6, 11, 1);
  ctx.fillRect(lx + 11, ly - 8, 1, 2);

  // Spine (dark line on bottom)
  ctx.fillStyle = '#5a4828';
  ctx.fillRect(lx + 1, ly + 4, 11, 1);

  // Hole for hanging (signature butcher cleaver detail)
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.arc(lx + 9, ly - 4, 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#5a4828';
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.arc(lx + 9, ly - 4, 1.5, 0, Math.PI * 2);
  ctx.stroke();

  // === BLOOD ON BLADE (signature) ===
  ctx.fillStyle = p.cleaverBlood;
  ctx.fillRect(lx + 4, ly - 4, 4, 1);
  ctx.fillRect(lx + 6, ly - 2, 3, 2);
  ctx.fillStyle = p.bloodFresh;
  ctx.fillRect(lx + 5, ly - 3, 2, 1);
  // Drip from the blade
  if(t % 120 < 60){
    const len = Math.floor((t % 60) / 15);
    ctx.fillStyle = p.bloodFresh;
    ctx.fillRect(lx + 7, ly + 4, 1, 1 + len);
    ctx.fillStyle = p.bloodBright;
    ctx.fillRect(lx + 7, ly + 4, 1, 1);
  }
}

export const attacks = {
  idle: {
    id: 'idle', name: 'IDLE', icon: '◇',
    duration: 9999, looping: true,
    description: 'Posture statique menaçante, couperet tenu près du corps. Sang qui dégouline du tablier et de la lame.',
    phases: [{ from: 0, to: 9999, label: 'Loop' }],
    update(frame){
      const fx = [];
      if(frame % 35 === 0){
        fx.push({ type: 'ash', dx: -2, dy: -4, count: 1, color: '#5a0808' });
      }
      return { opts: {}, fx };
    },
  },

  cleave: {
    id: 'cleave', name: 'CLEAVE', icon: '🪓',
    duration: 75,
    description: 'Frappe couperet horizontale large. 60% Bleed forte (3 tours, 5 PV). +30% damage si cible <30% HP.',
    phases: [
      { from: 0, to: 22, label: 'Wind-up' },
      { from: 22, to: 36, label: 'Strike' },
      { from: 36, to: 75, label: 'Recovery' },
    ],
    update(frame){
      const opts = {};
      const fx = [];
      if(frame < 22){
        const p = frame / 22;
        opts.cleaverRaise = -p * 1.3;
      } else if(frame < 36){
        const p = (frame - 22) / 14;
        opts.cleaverRaise = -1.3 + p * 1.8;
        if(frame === 22){
          fx.push({ type: 'sparks', dx: -16, dy: -6, count: 14, color: '#c82828' });
          fx.push({ type: 'flash', dx: -16, dy: -6, color: '#a02828', size: 14 });
          fx.push({ type: 'shockwave', dx: -16, dy: -2, color: '#8a1818', maxRadius: 26 });
        }
        if(frame === 26){
          fx.push({ type: 'sparks', dx: -16, dy: -2, count: 6, color: '#5a0808' });
        }
      } else {
        const p = (frame - 36) / 39;
        opts.cleaverRaise = 0.5 - p * 0.5;
      }
      return { opts, fx };
    },
  },

  walk: {
    id: 'walk', name: 'WALK', icon: '🏃',
    duration: 220,
    looping: true,
    description: 'Marche lourde, couperet ballotte. Aller-retour 110/110.',
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
        opts.bodyShift = p * 36;
      } else {
        p = (frame - half) / half;
        opts.bodyShift = (1 - p) * 36;
      }
      opts.bodyShift += Math.sin(frame * 0.16) * 0.6;
      // Cleaver swings with walk
      opts.cleaverRaise = Math.sin(frame * 0.12) * 0.15;
      if(frame % 14 === 0){
        fx.push({ type: 'ash', dx: -4, dy: 11, count: 2, color: '#3a1a08' });
        fx.push({ type: 'ash', dx: 4, dy: 11, count: 2, color: '#3a1a08' });
      }
      return { opts, fx };
    },
  },
};

export const meta = { width: 28, height: 42, groundOffsetY: 0 };
export default { draw, attacks, palette, meta };
