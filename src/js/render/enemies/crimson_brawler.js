// src/js/render/enemies/crimson_brawler.js
// Bagarreur de Fosse — mob mêlée brute.
// Boxeur torse nu, bandages tachés sur les poings, cicatrices de combat,
// biceps marqués. Pantalon de cuir. Rage à <50% HP.

export const palette = {
  skin:        '#a87858',
  skinDark:    '#5a3818',
  skinLight:   '#c89878',
  scar:        '#8a3818',
  blood:       '#8a1818',
  bloodDark:   '#5a0808',
  bloodBright: '#c82828',
  bandage:     '#d8c8a8',
  bandageDirty:'#a89878',
  bandageBlood:'#a02828',
  pants:       '#4a2818',
  pantsDark:   '#1a0a05',
  belt:        '#3a1808',
  bronze:      '#c8a040',
  rage:        'rgba(200,40,40,0.4)',
  shadow:      'rgba(20,5,5,0.85)',
};

export function draw(ctx, sx, sy, t, opts){
  opts = opts || {};
  const p = palette;
  const bob = Math.sin(t * 0.05) * 0.6;
  const breathe = Math.sin(t * 0.04) * 0.3;
  sx = Math.round(sx + (opts.bodyShift || 0));
  sy = Math.round(sy + bob);

  const armRaise = opts.armRaise || 0;
  const stance = opts.stance || 0; // 0 = idle, 1 = aggressive
  const rageActive = opts.rageActive || 0;

  // Shadow
  ctx.fillStyle = p.shadow;
  ctx.beginPath();
  ctx.ellipse(sx, sy + 8, 12, 3.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Rage aura (when active)
  if(rageActive > 0){
    for(let i = 0; i < 4; i++){
      const r = 18 + i * 6 + Math.sin(t * 0.12 + i) * 3;
      const a = rageActive * 0.22 * (1 - i * 0.22);
      ctx.fillStyle = `rgba(200,40,40,${a})`;
      ctx.beginPath();
      ctx.ellipse(sx, sy - 4, r, r * 0.45, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Soft red glow
  const glow = 0.3 + rageActive * 0.4 + Math.sin(t * 0.06) * 0.1;
  const bg = ctx.createRadialGradient(sx, sy - 12, 4, sx, sy - 12, 26);
  bg.addColorStop(0, `rgba(138,24,24,${glow * 0.4})`);
  bg.addColorStop(1, 'rgba(138,24,24,0)');
  ctx.fillStyle = bg;
  ctx.fillRect(sx - 26, sy - 38, 52, 50);

  // Legs (pantalon de cuir)
  ctx.fillStyle = p.pantsDark;
  ctx.fillRect(sx - 7, sy - 1, 6, 9);
  ctx.fillRect(sx + 1, sy - 1, 6, 9);
  ctx.fillStyle = p.pants;
  ctx.fillRect(sx - 7, sy - 1, 1, 9);
  // Knee detail (worn leather)
  ctx.fillStyle = p.skinDark;
  ctx.fillRect(sx - 6, sy + 4, 2, 1);
  ctx.fillRect(sx + 4, sy + 4, 2, 1);

  // Boots (open-toed)
  ctx.fillStyle = p.belt;
  ctx.fillRect(sx - 8, sy + 8, 7, 3);
  ctx.fillRect(sx + 1, sy + 8, 7, 3);
  // Toes
  ctx.fillStyle = p.skin;
  ctx.fillRect(sx - 6, sy + 8, 3, 1);
  ctx.fillRect(sx + 3, sy + 8, 3, 1);

  // Belt
  ctx.fillStyle = p.belt;
  ctx.fillRect(sx - 8, sy - 3 + breathe, 16, 2);
  // Bronze buckle
  ctx.fillStyle = p.bronze;
  ctx.fillRect(sx - 1, sy - 3 + breathe, 3, 2);
  ctx.fillStyle = '#e8c860';
  ctx.fillRect(sx, sy - 3 + breathe, 1, 1);

  // === TORSO (bare chest, muscular) ===
  ctx.fillStyle = p.skinDark;
  ctx.fillRect(sx - 9, sy - 19 + breathe, 18, 17);
  ctx.fillStyle = p.skin;
  ctx.fillRect(sx - 9, sy - 19 + breathe, 18, 15);
  ctx.fillStyle = p.skinLight;
  ctx.fillRect(sx - 9, sy - 19 + breathe, 2, 17);

  // Pectoral musculature
  ctx.fillStyle = p.skinDark;
  ctx.fillRect(sx - 8, sy - 17 + breathe, 7, 6);
  ctx.fillRect(sx + 1, sy - 17 + breathe, 7, 6);
  ctx.fillStyle = p.skin;
  ctx.fillRect(sx - 8, sy - 17 + breathe, 7, 4);
  ctx.fillRect(sx + 1, sy - 17 + breathe, 7, 4);
  // Cleavage line
  ctx.fillStyle = p.skinDark;
  ctx.fillRect(sx, sy - 17 + breathe, 0.5, 6);

  // Abs
  ctx.strokeStyle = p.skinDark;
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(sx - 6, sy - 9 + breathe); ctx.lineTo(sx + 6, sy - 9 + breathe);
  ctx.moveTo(sx - 5, sy - 6 + breathe); ctx.lineTo(sx + 5, sy - 6 + breathe);
  ctx.stroke();

  // Scars (signature)
  ctx.strokeStyle = p.scar;
  ctx.lineWidth = 0.6;
  ctx.beginPath();
  // Diagonal scar across chest
  ctx.moveTo(sx - 6, sy - 18 + breathe); ctx.lineTo(sx + 2, sy - 11 + breathe);
  // Side scar
  ctx.moveTo(sx + 7, sy - 14 + breathe); ctx.lineTo(sx + 9, sy - 9 + breathe);
  ctx.stroke();

  // Blood spatter (occasional fresh blood)
  if(rageActive > 0 || (t % 100 < 70)){
    ctx.fillStyle = p.bloodBright;
    ctx.fillRect(sx + 4, sy - 13 + breathe, 1, 1);
    ctx.fillStyle = p.blood;
    ctx.fillRect(sx + 5, sy - 12 + breathe, 1, 1);
    ctx.fillRect(sx - 4, sy - 8 + breathe, 1, 1);
  }

  // === ARMS (muscular, with bandaged fists) ===
  // Left arm (the punching one)
  ctx.save();
  ctx.translate(sx - 9, sy - 18 + breathe);
  ctx.rotate(armRaise);
  // Bicep
  ctx.fillStyle = p.skinDark;
  ctx.fillRect(-3, 0, 5, 8);
  ctx.fillStyle = p.skin;
  ctx.fillRect(-3, 0, 1, 8);
  // Forearm
  ctx.fillStyle = p.skinDark;
  ctx.fillRect(-3, 8, 5, 7);
  ctx.fillStyle = p.skin;
  ctx.fillRect(-3, 8, 1, 7);
  // === BANDAGED FIST ===
  drawBandagedFist(ctx, 0, 16, t, rageActive, p);
  ctx.restore();

  // Right arm (resting / guarding)
  ctx.fillStyle = p.skinDark;
  ctx.fillRect(sx + 7, sy - 18 + breathe, 5, 8);
  ctx.fillStyle = p.skin;
  ctx.fillRect(sx + 11, sy - 18 + breathe, 1, 8);
  // Forearm (slightly forward in stance)
  ctx.save();
  ctx.translate(sx + 9, sy - 10 + breathe);
  ctx.rotate(-stance * 0.4);
  ctx.fillStyle = p.skinDark;
  ctx.fillRect(-2, 0, 5, 8);
  ctx.fillStyle = p.skin;
  ctx.fillRect(2, 0, 1, 8);
  drawBandagedFist(ctx, 0, 9, t + 30, rageActive, p);
  ctx.restore();

  // === HEAD ===
  ctx.fillStyle = p.skinDark;
  ctx.fillRect(sx - 6, sy - 30 + breathe, 12, 11);
  ctx.fillStyle = p.skin;
  ctx.fillRect(sx - 6, sy - 30 + breathe, 12, 9);
  ctx.fillStyle = p.skinLight;
  ctx.fillRect(sx - 6, sy - 30 + breathe, 2, 11);

  // Battered face : scar across one eye, bruised
  ctx.fillStyle = p.scar;
  ctx.fillRect(sx + 2, sy - 27 + breathe, 1, 4);
  // Bruise
  ctx.fillStyle = p.bloodDark;
  ctx.fillRect(sx - 5, sy - 26 + breathe, 2, 2);

  // Eyes (intense, narrow)
  ctx.fillStyle = '#000';
  ctx.fillRect(sx - 4, sy - 26 + breathe, 2, 1);
  ctx.fillRect(sx + 2, sy - 26 + breathe, 2, 1);
  // Eye whites visible (rage)
  if(rageActive > 0){
    ctx.fillStyle = `rgba(255,200,200,${rageActive})`;
    ctx.fillRect(sx - 4, sy - 25 + breathe, 1, 1);
    ctx.fillRect(sx + 3, sy - 25 + breathe, 1, 1);
  }

  // Mouth (gritted teeth, angry)
  ctx.fillStyle = '#1a0808';
  ctx.fillRect(sx - 3, sy - 23 + breathe, 6, 1);
  // Teeth (white when bared)
  if(rageActive > 0 || stance > 0){
    ctx.fillStyle = '#e8d8b8';
    ctx.fillRect(sx - 3, sy - 23 + breathe, 6, 0.5);
  }

  // Sweat / blood drip from forehead
  if(t % 80 < 40){
    const len = Math.floor((t % 40) / 10);
    ctx.fillStyle = p.bloodBright;
    ctx.fillRect(sx + 1, sy - 20 + breathe, 1, 1 + len);
  }

  // Short hair / shaved sides
  ctx.fillStyle = p.belt;
  ctx.fillRect(sx - 6, sy - 30 + breathe, 12, 2);
  ctx.fillStyle = p.pantsDark;
  ctx.fillRect(sx - 4, sy - 32 + breathe, 8, 2);
}

function drawBandagedFist(ctx, lx, ly, t, bloody, p){
  // Base fist shape
  ctx.fillStyle = p.skinDark;
  ctx.fillRect(lx - 3, ly - 1, 6, 5);
  ctx.fillStyle = p.skin;
  ctx.fillRect(lx - 3, ly - 1, 6, 3);
  // Bandage wrapping (diagonal lines)
  ctx.fillStyle = p.bandage;
  ctx.fillRect(lx - 4, ly, 8, 1);
  ctx.fillRect(lx - 4, ly + 2, 8, 1);
  ctx.fillStyle = p.bandageDirty;
  ctx.fillRect(lx - 4, ly + 1, 8, 1);
  // Blood stains on bandage (more if rage)
  const stainAlpha = 0.7 + bloody * 0.3;
  ctx.fillStyle = `rgba(160,40,40,${stainAlpha})`;
  ctx.fillRect(lx - 2, ly, 2, 1);
  ctx.fillRect(lx + 1, ly + 2, 2, 1);
  if(bloody > 0){
    ctx.fillStyle = `rgba(200,40,40,${bloody})`;
    ctx.fillRect(lx, ly + 1, 2, 2);
  }
  // Knuckle highlight
  ctx.fillStyle = p.bandage;
  ctx.fillRect(lx - 3, ly, 1, 3);
}

export const attacks = {
  idle: {
    id: 'idle', name: 'IDLE', icon: '◇',
    duration: 9999, looping: true,
    description: 'Posture de boxeur, respiration lourde, fist guard. Sang occasionnel sur les bandages.',
    phases: [{ from: 0, to: 9999, label: 'Loop' }],
    update(frame){
      const fx = [];
      if(frame % 30 === 0){
        fx.push({ type: 'ash', dx: -3, dy: -8, count: 1, color: '#8a1818' });
      }
      return { opts: { stance: 0.3 }, fx };
    },
  },

  punch: {
    id: 'punch', name: 'PUNCH', icon: '👊',
    duration: 60,
    description: 'Frappe poing puissante. 30% Bleed. Mêlée range 1.',
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
        opts.armRaise = -p * 1.0;
        opts.stance = 0.5;
      } else if(frame < 28){
        const p = (frame - 18) / 10;
        opts.armRaise = -1.0 + p * 1.6;
        opts.stance = 1;
        if(frame === 18){
          fx.push({ type: 'sparks', dx: -16, dy: -4, count: 10, color: '#a02828' });
          fx.push({ type: 'flash', dx: -16, dy: -4, color: '#c82828', size: 12 });
          fx.push({ type: 'shockwave', dx: -16, dy: 0, color: '#8a1818', maxRadius: 22 });
        }
      } else {
        const p = (frame - 28) / 32;
        opts.armRaise = 0.6 - p * 0.6;
        opts.stance = 1 - p * 0.7;
      }
      return { opts, fx };
    },
  },

  rage: {
    id: 'rage', name: 'RAGE', icon: '💢',
    duration: 80, passive: true,
    description: 'Passif : +20% damage en dessous de 50% HP. Aura rouge enragée, yeux blancs, dents serrées.',
    phases: [
      { from: 0, to: 25, label: 'Activation' },
      { from: 25, to: 80, label: 'Sustain' },
    ],
    update(frame){
      const opts = { stance: 1 };
      const fx = [];
      if(frame < 25){
        const p = frame / 25;
        opts.rageActive = p;
        if(frame === 0){
          fx.push({ type: 'flash', dx: 0, dy: -12, color: '#c82828', size: 22 });
          fx.push({ type: 'shockwave', dx: 0, dy: 4, color: '#8a1818', maxRadius: 36 });
        }
      } else {
        opts.rageActive = 1 + Math.sin(frame * 0.18) * 0.2;
        if(frame % 5 === 0){
          const angle = Math.random() * Math.PI * 2;
          fx.push({ type: 'sparks', dx: Math.cos(angle) * 16, dy: -8 + Math.sin(angle) * 12, count: 1, color: '#c82828' });
        }
      }
      return { opts, fx };
    },
  },

  walk: {
    id: 'walk', name: 'WALK', icon: '🏃',
    duration: 180,
    looping: true,
    description: 'Marche de boxeur, fists raised. Aller-retour 90/90.',
    phases: [
      { from: 0, to: 90, label: 'Avancée' },
      { from: 90, to: 180, label: 'Retour' },
    ],
    update(frame){
      const opts = { stance: 0.4 };
      const fx = [];
      const half = 90;
      let p;
      if(frame < half){
        p = frame / half;
        opts.bodyShift = p * 34;
      } else {
        p = (frame - half) / half;
        opts.bodyShift = (1 - p) * 34;
      }
      opts.bodyShift += Math.sin(frame * 0.18) * 0.5;
      if(frame % 14 === 0){
        fx.push({ type: 'ash', dx: -3, dy: 11, count: 1, color: '#5a3818' });
        fx.push({ type: 'ash', dx: 3, dy: 11, count: 1, color: '#5a3818' });
      }
      return { opts, fx };
    },
  },
};

export const meta = { width: 24, height: 40, groundOffsetY: 0 };
export default { draw, attacks, palette, meta };
