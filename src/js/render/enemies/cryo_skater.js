// src/js/render/enemies/cryo_skater.js
// Patineur Spectral — mob mêlée hit-and-run.
// Silhouette dynamique, posture de patineur (genoux pliés, un pied avancé),
// trail de glace au sol, semi-translucide (effet spectral).

export const palette = {
  body:        '#4a6878',
  bodyDark:    '#28384a',
  bodyLight:   '#6a8898',
  outline:     '#1a2838',
  ice:         '#aee6ff',
  iceCore:     '#e0f5ff',
  iceTrail:    '#7fc7e7',
  spectralGlow:'rgba(174,230,255,0.5)',
  blade:       '#cef0ff',  // lames de glace aux pieds
  bladeDark:   '#5a8898',
  shadow:      'rgba(20,40,60,0.5)',
};

export function draw(ctx, sx, sy, t, opts){
  opts = opts || {};
  const p = palette;
  const slide = Math.sin(t * 0.06) * 0.7;
  const breathe = Math.sin(t * 0.05) * 0.3;
  sx = Math.round(sx + (opts.bodyShift || 0) + slide * (opts.dashing ? 0 : 1));
  sy = Math.round(sy + breathe);

  const dashing = opts.dashing || 0; // 0..1, intensité du dash
  const slashArm = opts.slashArm || 0; // pour le slash
  const transparency = opts.transparency !== undefined ? opts.transparency : 0.85;

  // Trail behind (when moving)
  if(dashing > 0){
    for(let i = 0; i < 6; i++){
      const dx = -i * 5;
      const a = dashing * (1 - i / 6) * 0.4;
      ctx.fillStyle = `rgba(174,230,255,${a})`;
      ctx.fillRect(sx + dx - 5, sy - 16, 10, 18);
    }
  }

  // Shadow
  ctx.fillStyle = p.shadow;
  ctx.beginPath();
  ctx.ellipse(sx, sy + 7, 12, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Spectral glow (always)
  const grad = ctx.createRadialGradient(sx, sy - 12, 4, sx, sy - 12, 22);
  grad.addColorStop(0, `rgba(174,230,255,${0.3 + Math.sin(t * 0.08) * 0.1})`);
  grad.addColorStop(1, 'rgba(174,230,255,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(sx - 22, sy - 36, 44, 44);

  ctx.save();
  ctx.globalAlpha = transparency;

  // === LEGS : posture de patineur, un genou plié plus que l'autre ===
  // Front leg (gauche, plus avancé, plié)
  ctx.fillStyle = p.bodyDark;
  ctx.beginPath();
  ctx.moveTo(sx - 8, sy - 1);
  ctx.lineTo(sx - 4, sy - 1);
  ctx.lineTo(sx - 6, sy + 8);
  ctx.lineTo(sx - 10, sy + 8);
  ctx.closePath();
  ctx.fill();
  // Back leg (droite, plus tendue)
  ctx.beginPath();
  ctx.moveTo(sx + 1, sy - 1);
  ctx.lineTo(sx + 6, sy - 1);
  ctx.lineTo(sx + 8, sy + 8);
  ctx.lineTo(sx + 4, sy + 8);
  ctx.closePath();
  ctx.fill();

  // Body lights on legs
  ctx.fillStyle = p.body;
  ctx.fillRect(sx - 8, sy - 1, 1, 9);
  ctx.fillRect(sx + 1, sy - 1, 1, 9);

  // === ICE BLADES at feet (patin de glace) ===
  // Front blade
  ctx.fillStyle = p.bladeDark;
  ctx.fillRect(sx - 11, sy + 8, 8, 2);
  ctx.fillStyle = p.blade;
  ctx.fillRect(sx - 11, sy + 8, 8, 1);
  // Back blade
  ctx.fillStyle = p.bladeDark;
  ctx.fillRect(sx + 3, sy + 8, 8, 2);
  ctx.fillStyle = p.blade;
  ctx.fillRect(sx + 3, sy + 8, 8, 1);
  // Tiny ice particles under blades
  if(t % 4 === 0){
    ctx.fillStyle = p.iceCore;
    ctx.fillRect(sx - 9 + (t % 8) - 4, sy + 11, 1, 1);
  }

  // === TORSO ===
  // Penché en avant
  ctx.fillStyle = p.bodyDark;
  ctx.beginPath();
  ctx.moveTo(sx - 9, sy - 16);
  ctx.lineTo(sx + 8, sy - 18);
  ctx.lineTo(sx + 6, sy - 1);
  ctx.lineTo(sx - 7, sy - 1);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = p.body;
  ctx.fillRect(sx - 8, sy - 16, 14, 15);
  ctx.fillStyle = p.bodyLight;
  ctx.fillRect(sx - 8, sy - 16, 2, 15);

  // Frost veins on torso
  const crackPulse = 0.6 + Math.sin(t * 0.1) * 0.3;
  ctx.strokeStyle = `rgba(174,230,255,${crackPulse})`;
  ctx.lineWidth = 0.7;
  ctx.beginPath();
  ctx.moveTo(sx - 5, sy - 14); ctx.lineTo(sx - 3, sy - 10); ctx.lineTo(sx - 5, sy - 6);
  ctx.moveTo(sx + 4, sy - 13); ctx.lineTo(sx + 2, sy - 8);
  ctx.stroke();

  // === ARMS ===
  // Front arm (gauche, pour balance)
  ctx.save();
  ctx.translate(sx - 9, sy - 15);
  ctx.rotate(0.3 + slashArm);
  ctx.fillStyle = p.bodyDark;
  ctx.fillRect(-2, 0, 4, 11);
  ctx.fillStyle = p.body;
  ctx.fillRect(-2, 0, 1, 11);
  // Hand
  ctx.fillStyle = p.outline;
  ctx.fillRect(-2, 11, 4, 3);
  // Ice claw (petite lame sur la main)
  ctx.fillStyle = p.blade;
  ctx.fillRect(-3, 13, 1, 3);
  ctx.fillStyle = p.iceCore;
  ctx.fillRect(-3, 15, 1, 1);
  ctx.restore();

  // Back arm (droite, étirée vers l'arrière)
  ctx.save();
  ctx.translate(sx + 7, sy - 15);
  ctx.rotate(-0.5);
  ctx.fillStyle = p.bodyDark;
  ctx.fillRect(-2, 0, 4, 11);
  ctx.fillStyle = p.body;
  ctx.fillRect(0, 0, 1, 11);
  ctx.fillStyle = p.outline;
  ctx.fillRect(-2, 11, 4, 3);
  // Ice claw
  ctx.fillStyle = p.blade;
  ctx.fillRect(2, 13, 1, 3);
  ctx.restore();

  // === HEAD : cagoule cryo ===
  ctx.fillStyle = p.outline;
  ctx.fillRect(sx - 6, sy - 26, 12, 11);
  ctx.fillStyle = p.bodyDark;
  ctx.fillRect(sx - 6, sy - 25, 12, 9);
  ctx.fillStyle = p.body;
  ctx.fillRect(sx - 6, sy - 25, 2, 9);

  // Frost on head
  ctx.fillStyle = p.ice;
  ctx.fillRect(sx - 6, sy - 26, 12, 1);
  ctx.fillStyle = p.iceCore;
  ctx.fillRect(sx - 5, sy - 26, 10, 0.5);

  // Visor / eye band (bleu glow horizontal)
  const eyePulse = 0.85 + Math.sin(t * 0.09) * 0.15;
  ctx.fillStyle = `rgba(174,230,255,${eyePulse})`;
  ctx.fillRect(sx - 5, sy - 22, 10, 2);
  ctx.fillStyle = `rgba(255,255,255,${eyePulse})`;
  ctx.fillRect(sx - 4, sy - 22, 1, 1);
  ctx.fillRect(sx + 3, sy - 22, 1, 1);

  ctx.restore();
}

export const attacks = {
  idle: {
    id: 'idle', name: 'IDLE', icon: '◇',
    duration: 9999, looping: true,
    description: 'Posture de patineur, oscille sur les lames de glace comme s\'il glissait sur place. Petites particules de glace sous les pieds.',
    phases: [{ from: 0, to: 9999, label: 'Loop' }],
    update(frame){
      const fx = [];
      if(frame % 18 === 0){
        fx.push({ type: 'ash', dx: -3, dy: 11, count: 1, color: '#aee6ff' });
        fx.push({ type: 'ash', dx: 3, dy: 11, count: 1, color: '#aee6ff' });
      }
      return { opts: {}, fx };
    },
  },

  slash: {
    id: 'slash', name: 'ICE SLASH', icon: '⚔',
    duration: 50,
    description: 'Coup mêlée rapide avec griffes de glace. Hit-and-run : frappe puis recule via le dash.',
    phases: [
      { from: 0, to: 12, label: 'Anticip' },
      { from: 12, to: 22, label: 'Frappe' },
      { from: 22, to: 50, label: 'Recovery' },
    ],
    update(frame){
      const opts = {};
      const fx = [];
      if(frame < 12){
        const p = frame / 12;
        opts.slashArm = -p * 0.8;
      } else if(frame < 22){
        const p = (frame - 12) / 10;
        opts.slashArm = -0.8 + p * 1.6;
        if(frame === 12){
          fx.push({ type: 'sparks', dx: 12, dy: -8, count: 8, color: '#aee6ff' });
          fx.push({ type: 'flash', dx: 12, dy: -8, color: '#e0f5ff', size: 10 });
          fx.push({ type: 'shockwave', dx: 12, dy: 0, color: '#aee6ff', maxRadius: 18 });
        }
      } else {
        const p = (frame - 22) / 28;
        opts.slashArm = 0.8 - 0.8 * p;
      }
      return { opts, fx };
    },
  },

  dash: {
    id: 'dash', name: 'DASH', icon: '💨',
    duration: 80,
    description: 'Glisse 4 cases sur la glace en un seul mouvement. Trail de glace très visible, accélération brutale puis freinage.',
    phases: [
      { from: 0, to: 12, label: 'Charge' },
      { from: 12, to: 50, label: 'Glissade' },
      { from: 50, to: 80, label: 'Stop' },
    ],
    update(frame){
      const opts = {};
      const fx = [];
      if(frame < 12){
        // Pré-charge : recule légèrement
        const p = frame / 12;
        opts.bodyShift = -p * 4;
        opts.dashing = p * 0.3;
      } else if(frame < 50){
        const p = (frame - 12) / 38;
        // Easing in-out
        const ease = p < 0.5 ? 2*p*p : 1 - Math.pow(-2*p + 2, 2) / 2;
        opts.bodyShift = -4 + ease * 56;
        opts.dashing = 1;
        if(frame % 2 === 0){
          fx.push({ type: 'sparks', dx: 0, dy: 11, count: 2, color: '#aee6ff' });
          fx.push({ type: 'ash', dx: -5, dy: 11, count: 1, color: '#e0f5ff' });
        }
      } else {
        const p = (frame - 50) / 30;
        opts.bodyShift = 52 - p * 4;
        opts.dashing = Math.max(0, 1 - p * 2);
        if(frame === 50){
          fx.push({ type: 'shockwave', dx: 52, dy: 8, color: '#aee6ff', maxRadius: 26 });
          fx.push({ type: 'sparks', dx: 52, dy: 8, count: 12, color: '#e0f5ff' });
        }
      }
      return { opts, fx };
    },
  },

  walk: {
    id: 'walk', name: 'WALK', icon: '🏃',
    duration: 140,
    looping: true,
    description: 'Glisse en avant puis en arrière (boucle). Trail de glace au sol, posture toujours basse.',
    phases: [
      { from: 0, to: 70, label: 'Avancée' },
      { from: 70, to: 140, label: 'Retour' },
    ],
    update(frame){
      const opts = {};
      const fx = [];
      const half = 70;
      let p;
      if(frame < half){
        p = frame / half;
        opts.bodyShift = p * 32;
      } else {
        p = (frame - half) / half;
        opts.bodyShift = (1 - p) * 32;
      }
      opts.dashing = 0.3;
      if(frame % 8 === 0){
        fx.push({ type: 'ash', dx: 0, dy: 11, count: 1, color: '#aee6ff' });
      }
      return { opts, fx };
    },
  },
};

export const meta = { width: 22, height: 36, groundOffsetY: 0 };
export default { draw, attacks, palette, meta };
