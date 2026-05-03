// src/js/render/enemies/toxic_spitter.js
// Cracheur d'Acide — caster ranged.
// Humanoïde mince avec glandes salivaires gonflées sur les joues (pochettes
// vertes-violettes pulsantes), bouche large déformée, projectile boule d'acide.

export const palette = {
  flesh:       '#8aa860',
  fleshDark:   '#5a7038',
  fleshLight:  '#a8c878',
  rags:        '#3a3018',
  ragsDark:    '#1a1408',
  glandSac:    '#7fc844',
  glandHot:    '#a8e065',
  glandVein:   '#7a3a8a',
  glandCore:   '#c8d845',
  acidBright:  '#c8e845',
  acid:        '#7fc844',
  acidDark:    '#4a8030',
  drool:       '#a8e065',
  shadow:      'rgba(20,30,10,0.7)',
};

export function draw(ctx, sx, sy, t, opts){
  opts = opts || {};
  const p = palette;
  const float = Math.sin(t * 0.045) * 0.5;
  const breathe = Math.sin(t * 0.035) * 0.3;
  sx = Math.round(sx + (opts.bodyShift || 0));
  sy = Math.round(sy + float);

  const armRaise = opts.armRaise !== undefined ? opts.armRaise : -0.2;
  const glandPump = opts.glandPump !== undefined ? opts.glandPump : 0;
  const mouthOpen = opts.mouthOpen || 0;

  // Shadow
  ctx.fillStyle = p.shadow;
  ctx.beginPath();
  ctx.ellipse(sx, sy + 6, 11, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Acid green glow (perma + boost on charge)
  const glow = 0.3 + glandPump * 0.5 + Math.sin(t * 0.06) * 0.1;
  const bg = ctx.createRadialGradient(sx, sy - 22 + breathe, 4, sx, sy - 22 + breathe, 22);
  bg.addColorStop(0, `rgba(127,200,68,${glow * 0.5})`);
  bg.addColorStop(1, 'rgba(127,200,68,0)');
  ctx.fillStyle = bg;
  ctx.fillRect(sx - 22, sy - 44, 44, 44);

  // Legs (skinny)
  ctx.fillStyle = p.fleshDark;
  ctx.fillRect(sx - 6, sy - 1, 5, 9);
  ctx.fillRect(sx + 1, sy - 1, 5, 9);
  ctx.fillStyle = p.flesh;
  ctx.fillRect(sx - 6, sy - 1, 1, 9);

  // Feet (claws)
  ctx.fillStyle = p.ragsDark;
  ctx.fillRect(sx - 7, sy + 8, 6, 3);
  ctx.fillRect(sx + 1, sy + 8, 6, 3);

  // Loincloth / rags
  ctx.fillStyle = p.ragsDark;
  ctx.fillRect(sx - 7, sy - 4 + breathe, 14, 5);
  ctx.fillStyle = p.rags;
  ctx.fillRect(sx - 7, sy - 4 + breathe, 14, 3);
  // Torn edges
  ctx.fillStyle = p.fleshDark;
  ctx.fillRect(sx - 7, sy + 1 + breathe, 2, 1);
  ctx.fillRect(sx - 1, sy + 1 + breathe, 2, 1);
  ctx.fillRect(sx + 5, sy + 1 + breathe, 2, 1);

  // Torso (skinny, ribcage visible)
  ctx.fillStyle = p.fleshDark;
  ctx.fillRect(sx - 7, sy - 18 + breathe, 14, 14);
  ctx.fillStyle = p.flesh;
  ctx.fillRect(sx - 7, sy - 18 + breathe, 14, 12);
  ctx.fillStyle = p.fleshLight;
  ctx.fillRect(sx - 7, sy - 18 + breathe, 2, 14);

  // Ribcage (visible bones lines)
  ctx.strokeStyle = p.fleshDark;
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(sx - 5, sy - 14 + breathe); ctx.lineTo(sx + 5, sy - 14 + breathe);
  ctx.moveTo(sx - 5, sy - 11 + breathe); ctx.lineTo(sx + 5, sy - 11 + breathe);
  ctx.moveTo(sx - 5, sy - 8 + breathe); ctx.lineTo(sx + 5, sy - 8 + breathe);
  ctx.stroke();

  // Arms (skinny)
  ctx.save();
  ctx.translate(sx - 8, sy - 17 + breathe);
  ctx.rotate(armRaise);
  ctx.fillStyle = p.fleshDark;
  ctx.fillRect(-2, 0, 4, 13);
  ctx.fillStyle = p.flesh;
  ctx.fillRect(-2, 0, 1, 13);
  ctx.fillStyle = p.ragsDark;
  ctx.fillRect(-2, 13, 4, 3);
  ctx.restore();

  ctx.fillStyle = p.fleshDark;
  ctx.fillRect(sx + 6, sy - 17 + breathe, 4, 13);
  ctx.fillStyle = p.flesh;
  ctx.fillRect(sx + 9, sy - 17 + breathe, 1, 13);
  ctx.fillStyle = p.ragsDark;
  ctx.fillRect(sx + 6, sy - 4 + breathe, 4, 3);

  // === HEAD (large pour les glandes) ===
  ctx.fillStyle = p.fleshDark;
  ctx.fillRect(sx - 8, sy - 30 + breathe, 16, 12);
  ctx.fillStyle = p.flesh;
  ctx.fillRect(sx - 8, sy - 30 + breathe, 16, 10);
  ctx.fillStyle = p.fleshLight;
  ctx.fillRect(sx - 8, sy - 30 + breathe, 2, 12);

  // === GLANDES SALIVAIRES (le détail signature) ===
  // Left gland (cheek)
  drawGland(ctx, sx - 9, sy - 22 + breathe, t, glandPump, 1.0, p);
  // Right gland (cheek)
  drawGland(ctx, sx + 9, sy - 22 + breathe, t + 30, glandPump, 1.1, p);

  // Eyes (small, sickly yellow)
  ctx.fillStyle = '#000';
  ctx.fillRect(sx - 4, sy - 27 + breathe, 2, 2);
  ctx.fillRect(sx + 2, sy - 27 + breathe, 2, 2);
  const eyePulse = 0.85 + Math.sin(t * 0.08) * 0.15;
  ctx.fillStyle = `rgba(200,232,69,${eyePulse})`;
  ctx.fillRect(sx - 3, sy - 27 + breathe, 1, 1);
  ctx.fillRect(sx + 3, sy - 27 + breathe, 1, 1);

  // Mouth (déformée, large)
  const mw = 8 + mouthOpen * 4;
  const mh = 2 + mouthOpen * 3;
  ctx.fillStyle = '#1a0808';
  ctx.fillRect(sx - mw / 2, sy - 22 + breathe, mw, mh);
  // Teeth
  ctx.fillStyle = p.glandCore;
  for(let i = 0; i < 3; i++){
    ctx.fillRect(sx - mw / 2 + i * 3, sy - 22 + breathe, 1, mh);
  }
  // Acid pool inside mouth (when open)
  if(mouthOpen > 0.3){
    ctx.fillStyle = p.acidBright;
    ctx.fillRect(sx - mw / 2 + 1, sy - 21 + breathe + mh - 1, mw - 2, 1);
  }

  // Drool (occasionnel)
  if(t % 80 < 40 && mouthOpen < 0.3){
    const droolLen = Math.floor((t % 40) / 8);
    ctx.fillStyle = p.drool;
    ctx.fillRect(sx, sy - 19 + breathe, 1, droolLen);
    ctx.fillStyle = p.acidBright;
    ctx.fillRect(sx, sy - 19 + breathe, 1, 1);
  }
}

function drawGland(ctx, lx, ly, t, pump, scale, p){
  const r = (3 + pump * 2) * scale;
  const localPulse = 0.85 + Math.sin(t * 0.12) * 0.15 + pump * 0.2;
  // Halo
  const grad = ctx.createRadialGradient(lx, ly, 0, lx, ly, r * 2);
  grad.addColorStop(0, `rgba(127,200,68,${localPulse * 0.5})`);
  grad.addColorStop(1, 'rgba(127,200,68,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(lx - r * 2, ly - r * 2, r * 4, r * 4);
  // Outer sac
  ctx.fillStyle = p.glandHot;
  ctx.beginPath();
  ctx.arc(lx, ly, r, 0, Math.PI * 2);
  ctx.fill();
  // Inner (darker)
  ctx.fillStyle = p.glandSac;
  ctx.beginPath();
  ctx.arc(lx, ly, r * 0.7, 0, Math.PI * 2);
  ctx.fill();
  // Veins (purple)
  ctx.strokeStyle = p.glandVein;
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(lx - r, ly); ctx.lineTo(lx, ly - r * 0.5);
  ctx.moveTo(lx + r, ly); ctx.lineTo(lx, ly + r * 0.5);
  ctx.stroke();
  // Bright core
  ctx.fillStyle = p.glandCore;
  ctx.fillRect(Math.round(lx - 0.5), Math.round(ly - 0.5), 1, 1);
}

export const attacks = {
  idle: {
    id: 'idle', name: 'IDLE', icon: '◇',
    duration: 9999, looping: true,
    description: 'Glandes pulsent doucement, drool occasionnel, posture voûtée.',
    phases: [{ from: 0, to: 9999, label: 'Loop' }],
    update(frame){
      const fx = [];
      if(frame % 30 === 0){
        fx.push({ type: 'ash', dx: 0, dy: -10, count: 1, color: '#7fc844' });
      }
      return { opts: { glandPump: 0.2 }, fx };
    },
  },

  acidSpit: {
    id: 'acidSpit', name: 'ACID SPIT', icon: '💧',
    duration: 70,
    description: 'Crache une boule d\'acide. Range 4. 40% Poison. 20% chance corroder armure (-5 perma combat).',
    phases: [
      { from: 0, to: 25, label: 'Glands pump' },
      { from: 25, to: 35, label: 'Spit' },
      { from: 35, to: 70, label: 'Recovery' },
    ],
    projectile: {
      spawnFrame: 25,
      spawnOffset: { dx: 0, dy: -22 },
      travelFrames: 16,
      arc: 8,
      drawProjectile(ctx, x, y, vx, vy, t){
        // Boule d'acide qui dégouline et tournoie
        const wobX = Math.sin(t * 0.5) * 0.5;
        const wobY = Math.cos(t * 0.4) * 0.4;
        // Halo green
        const grad = ctx.createRadialGradient(x, y, 0, x, y, 14);
        grad.addColorStop(0, 'rgba(200,232,69,0.95)');
        grad.addColorStop(0.4, 'rgba(168,224,101,0.7)');
        grad.addColorStop(1, 'rgba(127,200,68,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(x - 14, y - 14, 28, 28);
        // Core blob
        ctx.fillStyle = '#7fc844';
        ctx.beginPath();
        ctx.arc(x + wobX, y + wobY, 4, 0, Math.PI * 2);
        ctx.fill();
        // Bright inner
        ctx.fillStyle = '#a8e065';
        ctx.beginPath();
        ctx.arc(x + wobX, y + wobY, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#c8e845';
        ctx.fillRect(Math.round(x + wobX - 0.5), Math.round(y + wobY - 0.5), 1, 1);
        // Drip below (drop falling)
        ctx.fillStyle = '#7fc844';
        ctx.fillRect(Math.round(x), Math.round(y + 4), 1, 2);
      },
      trailColor: '#a8e065',
      onHit: {
        flash: '#c8e845', flashSize: 14,
        sparks: 12, color: '#a8e065',
        shockwave: '#7fc844', shockwaveRadius: 26,
        ash: 8, color: '#7fc844',
      },
    },
    update(frame){
      const opts = {};
      const fx = [];
      if(frame < 25){
        const p = frame / 25;
        opts.glandPump = 0.2 + p * 0.8;
        opts.armRaise = -0.2 - p * 0.2;
        if(frame % 4 === 0){
          fx.push({ type: 'sparks', dx: -9, dy: -22, count: 1, color: '#a8e065' });
          fx.push({ type: 'sparks', dx: 9, dy: -22, count: 1, color: '#a8e065' });
        }
      } else if(frame < 35){
        opts.glandPump = 0.3;
        opts.mouthOpen = 1;
        opts.armRaise = -0.4;
        if(frame === 25){
          fx.push({ type: 'flash', dx: 0, dy: -22, color: '#c8e845', size: 14 });
          fx.push({ type: 'sparks', dx: 0, dy: -22, count: 8, color: '#a8e065' });
          fx.push({
            type: 'projectile',
            dx: 0, dy: -22,
            useAttackProjectile: 'acidSpit',
          });
        }
      } else {
        const p = (frame - 35) / 35;
        opts.glandPump = 0.3 - 0.1 * p;
        opts.mouthOpen = Math.max(0, 1 - p * 2);
        opts.armRaise = -0.4 + 0.2 * p;
      }
      return { opts, fx };
    },
  },

  walk: {
    id: 'walk', name: 'WALK', icon: '🏃',
    duration: 160,
    looping: true,
    description: 'Recule pour maintenir distance puis revient. Glandes oscillent.',
    phases: [
      { from: 0, to: 80, label: 'Recul' },
      { from: 80, to: 160, label: 'Retour' },
    ],
    update(frame){
      const opts = { glandPump: 0.2 };
      const fx = [];
      const half = 80;
      let p;
      if(frame < half){
        p = frame / half;
        opts.bodyShift = p * 32;
      } else {
        p = (frame - half) / half;
        opts.bodyShift = (1 - p) * 32;
      }
      opts.bodyShift += Math.sin(frame * 0.18) * 0.4;
      if(frame % 16 === 0){
        fx.push({ type: 'ash', dx: 0, dy: 11, count: 1, color: '#7fc844' });
      }
      return { opts, fx };
    },
  },
};

export const meta = { width: 22, height: 38, groundOffsetY: 0 };
export default { draw, attacks, palette, meta };
