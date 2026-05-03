// src/js/render/enemies/voidnet_executor.js
// Exécuteur — mob mêlée chasseur.
// Silhouette militaire numérique avec lame d'énergie rouge-orange (contraste anti-cyan),
// symbole "kill" sur la poitrine, posture de chasseur.

export const palette = {
  body:        '#1a1018',
  bodyDark:    '#0a0510',
  bodyLight:   '#3a2828',
  armor:       '#2a1828',
  armorDark:   '#0a0510',
  armorLight:  '#5a3848',
  // Anti-cyan : rouge-orange
  blade:       '#ff4818',
  bladeCore:   '#ffe060',
  bladeHot:    '#ff8830',
  bladeDark:   '#a02808',
  killSymbol:  '#ff4818',
  killCore:    '#ffe060',
  cyan:        '#3df0ff',
  void:        '#0a0a18',
  shadow:      'rgba(20,5,5,0.85)',
};

export function draw(ctx, sx, sy, t, opts){
  opts = opts || {};
  const p = palette;
  const bob = Math.sin(t * 0.05) * 0.5;
  const breathe = Math.sin(t * 0.04) * 0.3;
  sx = Math.round(sx + (opts.bodyShift || 0));
  sy = Math.round(sy + bob);

  const bladeRaise = opts.bladeRaise || 0;
  const blinkActive = opts.blinkActive || 0;

  // Shadow
  ctx.fillStyle = p.shadow;
  ctx.beginPath();
  ctx.ellipse(sx, sy + 7, 12, 3.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Red glow halo (signature)
  const glow = 0.4 + Math.sin(t * 0.08) * 0.1;
  const bg = ctx.createRadialGradient(sx, sy - 12, 4, sx, sy - 12, 28);
  bg.addColorStop(0, `rgba(255,72,24,${glow * 0.45})`);
  bg.addColorStop(1, 'rgba(255,72,24,0)');
  ctx.fillStyle = bg;
  ctx.fillRect(sx - 28, sy - 40, 56, 50);

  // Blink ghost trail (when teleporting)
  if(blinkActive > 0){
    for(let i = 0; i < 4; i++){
      const dx = -i * 6;
      const a = blinkActive * (1 - i / 4) * 0.4;
      ctx.fillStyle = `rgba(255,72,24,${a})`;
      ctx.fillRect(sx + dx - 6, sy - 22, 12, 26);
    }
  }

  // Legs (military style)
  ctx.fillStyle = p.armorDark;
  ctx.fillRect(sx - 7, sy - 1, 5, 9);
  ctx.fillRect(sx + 2, sy - 1, 5, 9);
  ctx.fillStyle = p.armor;
  ctx.fillRect(sx - 7, sy - 1, 1, 9);
  ctx.fillStyle = p.bodyLight;
  ctx.fillRect(sx - 7, sy + 4, 5, 1);
  ctx.fillRect(sx + 2, sy + 4, 5, 1);

  // Boots
  ctx.fillStyle = '#000';
  ctx.fillRect(sx - 8, sy + 8, 6, 3);
  ctx.fillRect(sx + 2, sy + 8, 6, 3);
  // Red sole stripe
  ctx.fillStyle = p.blade;
  ctx.fillRect(sx - 8, sy + 10, 6, 1);
  ctx.fillRect(sx + 2, sy + 10, 6, 1);

  // Torso (armored)
  ctx.fillStyle = p.armorDark;
  ctx.fillRect(sx - 9, sy - 19 + breathe, 18, 18);
  ctx.fillStyle = p.armor;
  ctx.fillRect(sx - 9, sy - 19 + breathe, 18, 16);
  ctx.fillStyle = p.armorLight;
  ctx.fillRect(sx - 9, sy - 19 + breathe, 2, 18);

  // Chest plate (large)
  ctx.fillStyle = p.bodyDark;
  ctx.beginPath();
  ctx.moveTo(sx - 7, sy - 18 + breathe);
  ctx.lineTo(sx + 7, sy - 18 + breathe);
  ctx.lineTo(sx + 5, sy - 8 + breathe);
  ctx.lineTo(sx - 5, sy - 8 + breathe);
  ctx.closePath();
  ctx.fill();

  // === KILL SYMBOL on chest (signature) ===
  drawKillSymbol(ctx, sx, sy - 13 + breathe, t, p);

  // Belt
  ctx.fillStyle = '#000';
  ctx.fillRect(sx - 9, sy - 4 + breathe, 18, 2);
  ctx.fillStyle = p.blade;
  ctx.fillRect(sx - 1, sy - 4 + breathe, 2, 2);

  // Shoulder pads
  ctx.fillStyle = p.armorDark;
  ctx.fillRect(sx - 12, sy - 20 + breathe, 4, 6);
  ctx.fillRect(sx + 8, sy - 20 + breathe, 4, 6);
  ctx.fillStyle = p.bladeDark;
  ctx.fillRect(sx - 12, sy - 20 + breathe, 4, 1);
  ctx.fillRect(sx + 8, sy - 20 + breathe, 4, 1);

  // === ARMS ===
  // Right arm holding blade (front, raised)
  ctx.save();
  ctx.translate(sx - 11, sy - 18 + breathe);
  ctx.rotate(bladeRaise - 0.3);
  ctx.fillStyle = p.armorDark;
  ctx.fillRect(-2, 0, 4, 13);
  ctx.fillStyle = p.armor;
  ctx.fillRect(-2, 0, 1, 13);
  // Hand
  ctx.fillStyle = '#000';
  ctx.fillRect(-2, 13, 4, 4);
  // === ENERGY BLADE ===
  drawEnergyBlade(ctx, 0, 17, t, p);
  ctx.restore();

  // Left arm (rest)
  ctx.fillStyle = p.armorDark;
  ctx.fillRect(sx + 8, sy - 18 + breathe, 4, 13);
  ctx.fillStyle = p.armor;
  ctx.fillRect(sx + 11, sy - 18 + breathe, 1, 13);
  ctx.fillStyle = '#000';
  ctx.fillRect(sx + 8, sy - 5 + breathe, 4, 4);

  // === HEAD : visor helmet ===
  ctx.fillStyle = p.armorDark;
  ctx.fillRect(sx - 6, sy - 30 + breathe, 12, 11);
  ctx.fillStyle = p.armor;
  ctx.fillRect(sx - 6, sy - 30 + breathe, 12, 9);
  ctx.fillStyle = p.armorLight;
  ctx.fillRect(sx - 6, sy - 30 + breathe, 2, 11);

  // Visor (red horizontal band — signature contraste)
  const visorPulse = 0.92 + Math.sin(t * 0.1) * 0.08;
  ctx.fillStyle = `rgba(255,72,24,${visorPulse})`;
  ctx.fillRect(sx - 5, sy - 25 + breathe, 10, 2);
  ctx.fillStyle = `rgba(255,224,96,${visorPulse})`;
  ctx.fillRect(sx - 5, sy - 25 + breathe, 10, 1);
  // Targeting reticle on visor
  ctx.fillStyle = `rgba(255,255,255,${visorPulse})`;
  ctx.fillRect(sx, sy - 25 + breathe, 1, 1);
  ctx.fillRect(sx - 3, sy - 24 + breathe, 1, 1);
  ctx.fillRect(sx + 3, sy - 24 + breathe, 1, 1);

  // Helmet seam vertical
  ctx.fillStyle = p.bodyDark;
  ctx.fillRect(sx, sy - 30 + breathe, 0.5, 5);

  // Antenna / spike
  ctx.fillStyle = p.armorDark;
  ctx.fillRect(sx + 4, sy - 32 + breathe, 1, 3);
}

function drawKillSymbol(ctx, lx, ly, t, p){
  const pulse = 0.85 + Math.sin(t * 0.12) * 0.15;
  // Background plate
  ctx.fillStyle = '#000';
  ctx.fillRect(lx - 4, ly - 3, 8, 6);
  // X mark (kill)
  ctx.strokeStyle = p.killSymbol;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(lx - 3, ly - 2); ctx.lineTo(lx + 3, ly + 2);
  ctx.moveTo(lx + 3, ly - 2); ctx.lineTo(lx - 3, ly + 2);
  ctx.stroke();
  // Hot core
  ctx.fillStyle = `rgba(255,224,96,${pulse})`;
  ctx.fillRect(Math.round(lx - 0.5), Math.round(ly - 0.5), 1, 1);
}

function drawEnergyBlade(ctx, lx, ly, t, p){
  // Hilt
  ctx.fillStyle = '#000';
  ctx.fillRect(lx - 1.5, ly - 4, 3, 6);
  ctx.fillStyle = p.armorLight;
  ctx.fillRect(lx - 1, ly - 4, 1, 6);
  // Cross-guard
  ctx.fillStyle = '#000';
  ctx.fillRect(lx - 3, ly - 5, 6, 1);
  ctx.fillStyle = p.bladeDark;
  ctx.fillRect(lx - 3, ly - 6, 6, 1);

  // === ENERGY BLADE (red-orange, glowing) ===
  // Halo
  const grad = ctx.createRadialGradient(lx, ly - 16, 1, lx, ly - 16, 14);
  grad.addColorStop(0, 'rgba(255,224,96,0.6)');
  grad.addColorStop(0.4, 'rgba(255,72,24,0.5)');
  grad.addColorStop(1, 'rgba(255,72,24,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(lx - 14, ly - 30, 28, 28);

  // Main blade body
  ctx.fillStyle = p.bladeDark;
  ctx.beginPath();
  ctx.moveTo(lx - 1.5, ly - 6);
  ctx.lineTo(lx + 1.5, ly - 6);
  ctx.lineTo(lx + 1, ly - 24);
  ctx.lineTo(lx, ly - 26);
  ctx.lineTo(lx - 1, ly - 24);
  ctx.closePath();
  ctx.fill();
  // Hot inner
  ctx.fillStyle = p.blade;
  ctx.fillRect(lx - 1, ly - 24, 2, 18);
  // Flicker
  const flicker = 0.85 + Math.sin(t * 0.3) * 0.15;
  ctx.fillStyle = `rgba(255,136,48,${flicker})`;
  ctx.fillRect(lx - 0.5, ly - 24, 1, 18);
  // White-yellow core line
  ctx.fillStyle = `rgba(255,224,96,${flicker})`;
  ctx.fillRect(lx, ly - 24, 0.5, 18);
  // Tip
  ctx.fillStyle = p.bladeCore;
  ctx.fillRect(lx, ly - 26, 0.5, 2);
}

export const attacks = {
  idle: {
    id: 'idle', name: 'IDLE', icon: '◇',
    duration: 9999, looping: true,
    description: 'Posture de chasseur, lame d\'énergie qui crépite, visière rouge qui scanne. Pulse menaçant.',
    phases: [{ from: 0, to: 9999, label: 'Loop' }],
    update(frame){
      const fx = [];
      if(frame % 18 === 0){
        fx.push({ type: 'sparks', dx: -10, dy: -28, count: 1, color: '#ff4818' });
      }
      return { opts: {}, fx };
    },
  },

  slash: {
    id: 'slash', name: 'EXECUTE', icon: '⚔',
    duration: 70,
    description: 'Frappe lame d\'énergie. +50% damage sur cibles <30% HP. Slash diagonal puissant.',
    phases: [
      { from: 0, to: 22, label: 'Wind-up' },
      { from: 22, to: 34, label: 'Strike' },
      { from: 34, to: 70, label: 'Recovery' },
    ],
    update(frame){
      const opts = {};
      const fx = [];
      if(frame < 22){
        const p = frame / 22;
        opts.bladeRaise = -p * 1.4;
      } else if(frame < 34){
        const p = (frame - 22) / 12;
        opts.bladeRaise = -1.4 + p * 1.8;
        if(frame === 22){
          fx.push({ type: 'sparks', dx: -14, dy: -10, count: 14, color: '#ff8830' });
          fx.push({ type: 'flash', dx: -14, dy: -10, color: '#ffe060', size: 14 });
          fx.push({ type: 'shockwave', dx: -14, dy: -6, color: '#ff4818', maxRadius: 26 });
        }
        if(frame === 26){
          fx.push({ type: 'sparks', dx: -14, dy: -2, count: 6, color: '#ff4818' });
        }
      } else {
        const p = (frame - 34) / 36;
        opts.bladeRaise = 0.4 - p * 0.4;
      }
      return { opts, fx };
    },
  },

  blink: {
    id: 'blink', name: 'BLINK', icon: '✦',
    duration: 50,
    description: 'Téléporte adjacent à la cible la plus blessée. Anim : flash rouge, traînée fantôme, recompose à côté.',
    phases: [
      { from: 0, to: 18, label: 'Charge' },
      { from: 18, to: 28, label: 'Blink' },
      { from: 28, to: 50, label: 'Land' },
    ],
    update(frame){
      const opts = {};
      const fx = [];
      if(frame < 18){
        const p = frame / 18;
        opts.blinkActive = p * 0.5;
        if(frame % 3 === 0){
          fx.push({ type: 'sparks', dx: 0, dy: -12, count: 1, color: '#ff4818' });
        }
      } else if(frame < 28){
        opts.blinkActive = 1;
        opts.bodyShift = (frame - 18) * 4;
        if(frame === 18){
          fx.push({ type: 'flash', dx: 0, dy: -12, color: '#ffe060', size: 22 });
          fx.push({ type: 'shockwave', dx: 0, dy: -6, color: '#ff4818', maxRadius: 30 });
        }
      } else {
        const p = (frame - 28) / 22;
        opts.blinkActive = Math.max(0, 1 - p);
        opts.bodyShift = 40;
        if(frame === 28){
          fx.push({ type: 'flash', dx: 40, dy: -12, color: '#ffe060', size: 18 });
          fx.push({ type: 'sparks', dx: 40, dy: -12, count: 12, color: '#ff8830' });
        }
      }
      return { opts, fx };
    },
  },

  walk: {
    id: 'walk', name: 'WALK', icon: '🏃',
    duration: 180,
    looping: true,
    description: 'Marche militaire calculée. Aller-retour 90/90.',
    phases: [
      { from: 0, to: 90, label: 'Avancée' },
      { from: 90, to: 180, label: 'Retour' },
    ],
    update(frame){
      const opts = {};
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
      opts.bodyShift += Math.sin(frame * 0.18) * 0.4;
      if(frame % 14 === 0){
        fx.push({ type: 'ash', dx: 0, dy: 11, count: 1, color: '#ff4818' });
      }
      return { opts, fx };
    },
  },
};

export const meta = { width: 24, height: 40, groundOffsetY: 0 };
export default { draw, attacks, palette, meta };
