// src/js/render/enemies/inferno_caster.js
// Pyromancien Mineur — caster ranged.
// Silhouette fine encapuchonnée, orbes de feu flottants aux mains,
// cortex implanté visible (LED orange sur la tempe).

export const palette = {
  robe:       '#5e1818',
  robeDark:   '#3a0e0e',
  robeLight:  '#7a2828',
  hood:       '#2a0808',
  hoodEdge:   '#1a0404',
  cortex:     '#ff6f1a',
  ash:        '#a06850',
  ashDark:    '#5a3525',
  flame:      '#ff6f1a',
  flameHot:   '#ffb347',
  flameCore:  '#ffe080',
  shadow:     'rgba(0,0,0,0.7)',
};

export function draw(ctx, sx, sy, t, opts){
  opts = opts || {};
  const p = palette;
  const float = Math.sin(t * 0.05) * 0.8;
  const breathe = Math.sin(t * 0.04) * 0.3;
  sx = Math.round(sx + (opts.bodyShift || 0));
  sy = Math.round(sy + float);

  const armRaise = opts.armRaise !== undefined ? opts.armRaise : -0.3;
  const orbSize = (opts.orbSize !== undefined ? opts.orbSize : 1) * (0.85 + Math.sin(t * 0.1) * 0.15);

  // Shadow
  ctx.fillStyle = p.shadow;
  ctx.beginPath();
  ctx.ellipse(sx, sy + 6, 11, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Orange glow halo
  if(opts.glowBoost === undefined || opts.glowBoost > 0){
    const glow = opts.glowBoost === undefined ? 0.3 : (0.3 + opts.glowBoost * 0.5);
    const bg = ctx.createRadialGradient(sx, sy - 14, 4, sx, sy - 14, 26);
    bg.addColorStop(0, `rgba(255,107,26,${glow})`);
    bg.addColorStop(1, 'rgba(255,107,26,0)');
    ctx.fillStyle = bg;
    ctx.fillRect(sx - 26, sy - 40, 52, 50);
  }

  // Robe bottom (s'évase un peu)
  ctx.fillStyle = p.robeDark;
  ctx.beginPath();
  ctx.moveTo(sx - 9, sy + 5);
  ctx.lineTo(sx + 9, sy + 5);
  ctx.lineTo(sx + 7, sy - 15 + breathe);
  ctx.lineTo(sx - 7, sy - 15 + breathe);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = p.robe;
  ctx.fillRect(sx - 7, sy - 15 + breathe, 14, 20);

  // Robe edge / fold lines
  ctx.strokeStyle = p.robeLight;
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(sx - 5, sy - 12 + breathe); ctx.lineTo(sx - 5, sy + 4);
  ctx.moveTo(sx, sy - 12 + breathe); ctx.lineTo(sx, sy + 4);
  ctx.moveTo(sx + 5, sy - 12 + breathe); ctx.lineTo(sx + 5, sy + 4);
  ctx.stroke();

  // Belt (cordon)
  ctx.fillStyle = p.cortex;
  ctx.fillRect(sx - 8, sy - 5 + breathe, 16, 1);

  // Sleeves (manches longues, traînent)
  // Left sleeve
  ctx.save();
  ctx.translate(sx - 7, sy - 13 + breathe);
  ctx.rotate(armRaise * 0.7);
  ctx.fillStyle = p.robeDark;
  ctx.fillRect(-2, 0, 4, 12);
  ctx.fillStyle = p.robe;
  ctx.fillRect(-2, 0, 2, 12);
  // Hand (cendre)
  ctx.fillStyle = p.ashDark;
  ctx.fillRect(-2, 11, 4, 3);
  // Orb
  drawFireOrb(ctx, 0, 14, t, orbSize, p);
  ctx.restore();

  // Right sleeve
  ctx.save();
  ctx.translate(sx + 7, sy - 13 + breathe);
  ctx.rotate(-armRaise * 0.7);
  ctx.fillStyle = p.robeDark;
  ctx.fillRect(-2, 0, 4, 12);
  ctx.fillStyle = p.robe;
  ctx.fillRect(0, 0, 2, 12);
  // Hand
  ctx.fillStyle = p.ashDark;
  ctx.fillRect(-2, 11, 4, 3);
  // Orb
  drawFireOrb(ctx, 0, 14, t + 50, orbSize, p);
  ctx.restore();

  // Hood (couvre la tête + épaules)
  ctx.fillStyle = p.hood;
  ctx.beginPath();
  ctx.moveTo(sx - 9, sy - 14 + breathe);
  ctx.lineTo(sx + 9, sy - 14 + breathe);
  ctx.lineTo(sx + 8, sy - 26 + breathe);
  ctx.lineTo(sx + 4, sy - 30 + breathe);
  ctx.lineTo(sx - 4, sy - 30 + breathe);
  ctx.lineTo(sx - 8, sy - 26 + breathe);
  ctx.closePath();
  ctx.fill();

  // Hood edge
  ctx.fillStyle = p.hoodEdge;
  ctx.beginPath();
  ctx.moveTo(sx - 9, sy - 14 + breathe);
  ctx.lineTo(sx + 9, sy - 14 + breathe);
  ctx.lineTo(sx + 8, sy - 17 + breathe);
  ctx.lineTo(sx - 8, sy - 17 + breathe);
  ctx.closePath();
  ctx.fill();

  // Inner shadow of hood (face area)
  ctx.fillStyle = '#000';
  ctx.fillRect(sx - 4, sy - 25 + breathe, 8, 6);

  // Two glowing eyes
  const eyePulse = 0.7 + Math.sin(t * 0.08) * 0.3;
  ctx.fillStyle = `rgba(255,107,26,${eyePulse})`;
  ctx.fillRect(sx - 3, sy - 23 + breathe, 2, 2);
  ctx.fillRect(sx + 1, sy - 23 + breathe, 2, 2);
  ctx.fillStyle = `rgba(255,224,128,${eyePulse})`;
  ctx.fillRect(sx - 3, sy - 23 + breathe, 1, 1);
  ctx.fillRect(sx + 1, sy - 23 + breathe, 1, 1);

  // Cortex LED (tempe droite, à l'extérieur de la capuche)
  const cortexPulse = 0.6 + Math.sin(t * 0.12) * 0.4;
  ctx.fillStyle = `rgba(255,107,26,${cortexPulse})`;
  ctx.fillRect(sx + 5, sy - 24 + breathe, 2, 1);
  ctx.fillStyle = '#fff';
  ctx.fillRect(sx + 5, sy - 24 + breathe, 1, 1);
}

function drawFireOrb(ctx, lx, ly, t, scale, p){
  if(scale <= 0) return;
  const r = 4 * scale;
  // Outer halo
  const grad = ctx.createRadialGradient(lx, ly, 0, lx, ly, r * 2.5);
  grad.addColorStop(0, `rgba(255,224,128,${0.9 * scale})`);
  grad.addColorStop(0.4, `rgba(255,140,40,${0.6 * scale})`);
  grad.addColorStop(1, 'rgba(255,80,20,0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(lx, ly, r * 2.5, 0, Math.PI * 2);
  ctx.fill();
  // Core
  ctx.fillStyle = p.flame;
  ctx.beginPath();
  ctx.arc(lx, ly, r, 0, Math.PI * 2);
  ctx.fill();
  // Hot center
  ctx.fillStyle = p.flameHot;
  ctx.beginPath();
  ctx.arc(lx, ly, r * 0.6, 0, Math.PI * 2);
  ctx.fill();
  // White core
  ctx.fillStyle = p.flameCore;
  ctx.beginPath();
  ctx.arc(lx + Math.sin(t * 0.1) * 0.5, ly + Math.cos(t * 0.1) * 0.5, r * 0.3, 0, Math.PI * 2);
  ctx.fill();
}

export const attacks = {
  idle: {
    id: 'idle', name: 'IDLE', icon: '◇',
    duration: 9999, looping: true,
    description: 'Flottement permanent, orbes de feu pulsants aux deux mains, yeux et cortex qui clignotent.',
    phases: [{ from: 0, to: 9999, label: 'Loop' }],
    update(frame){
      const fx = [];
      if(frame % 30 === 0){
        fx.push({ type: 'ash', dx: -10, dy: 2, count: 1, color: '#ffb347' });
        fx.push({ type: 'ash', dx: 10, dy: 2, count: 1, color: '#ffb347' });
      }
      return { opts: {}, fx };
    },
  },

  fireball: {
    id: 'fireball', name: 'FIREBALL', icon: '🔥',
    duration: 70,
    description: 'Concentre les deux orbes en un projectile chargé, puis le lance vers la cible. Range 4. 30% chance d\'appliquer Brûlure (3 tours).',
    phases: [
      { from: 0, to: 25, label: 'Charge' },
      { from: 25, to: 35, label: 'Cast' },
      { from: 35, to: 70, label: 'Recovery' },
    ],
    // Spec du projectile (réutilisable jeu + bestiaire)
    projectile: {
      // Frame où le projectile est lancé (compté depuis le début de l'attaque)
      spawnFrame: 25,
      // Origine relative au sprite (au-dessus des mains qui se rejoignent)
      spawnOffset: { dx: 0, dy: -10 },
      // Vitesse de voyage en frames
      travelFrames: 18,
      // Render custom : boule de feu avec halo, tourne légèrement
      drawProjectile(ctx, x, y, vx, vy, t){
        // Outer halo
        const grad = ctx.createRadialGradient(x, y, 0, x, y, 12);
        grad.addColorStop(0, 'rgba(255,224,128,0.95)');
        grad.addColorStop(0.3, 'rgba(255,179,71,0.85)');
        grad.addColorStop(0.7, 'rgba(255,107,26,0.5)');
        grad.addColorStop(1, 'rgba(255,80,20,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(x - 12, y - 12, 24, 24);
        // Core fireball
        ctx.fillStyle = '#ff6f1a';
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffb347';
        ctx.beginPath();
        ctx.arc(x, y, 2.5, 0, Math.PI * 2);
        ctx.fill();
        // Hot center (offset pour effet de combustion)
        ctx.fillStyle = '#fff';
        const wobX = Math.sin(t * 0.4) * 0.7;
        const wobY = Math.cos(t * 0.4) * 0.7;
        ctx.fillRect(Math.round(x + wobX), Math.round(y + wobY), 1, 1);
      },
      trailColor: '#ff8a4d',
      onHit: {
        flash: '#ffe080', flashSize: 16,
        sparks: 14, color: '#ffb347',
        shockwave: '#ff6f1a', shockwaveRadius: 28,
      },
    },
    update(frame){
      const opts = {};
      const fx = [];
      if(frame < 25){
        // Charge : les deux mains se rapprochent, orbes grossissent
        const p = frame / 25;
        opts.armRaise = -0.3 - p * 0.6;
        opts.orbSize = 1 + p * 0.8;
        opts.glowBoost = p * 0.6;
        if(frame % 4 === 0){
          fx.push({ type: 'sparks', dx: -6, dy: 0, count: 1, color: '#ffb347' });
          fx.push({ type: 'sparks', dx: 6, dy: 0, count: 1, color: '#ffb347' });
        }
      } else if(frame < 35){
        // Cast : projectile lancé au frame 25
        opts.armRaise = -1.1;
        opts.orbSize = 0.4;
        opts.glowBoost = 1;
        if(frame === 25){
          fx.push({ type: 'flash', dx: 0, dy: -10, color: '#ffe080', size: 14 });
          fx.push({ type: 'sparks', dx: 0, dy: -10, count: 8, color: '#ffd47a' });
          // Lance le projectile (le bestiaire ajoutera targetX/Y)
          fx.push({
            type: 'projectile',
            dx: 0, dy: -10,
            useAttackProjectile: 'fireball',
          });
        }
      } else {
        const p = (frame - 35) / 35;
        opts.armRaise = -1.1 + (-0.3 - (-1.1)) * p;
        opts.orbSize = 0.4 + 0.6 * p;
        opts.glowBoost = Math.max(0, 1 - p);
      }
      return { opts, fx };
    },
  },

  walk: {
    id: 'walk', name: 'WALK', icon: '🏃',
    duration: 160,
    looping: true,
    description: 'Recule lentement pour maintenir la distance, puis revient (boucle aller-retour). Robe qui flotte, traînée de cendres.',
    phases: [
      { from: 0, to: 80, label: 'Recul' },
      { from: 80, to: 160, label: 'Retour' },
    ],
    update(frame){
      const opts = {};
      const fx = [];
      // Aller-retour : 0..80 = avance vers la droite (recul du joueur), 80..160 = retour
      const half = 80;
      let p, dir;
      if(frame < half){
        p = frame / half;
        dir = 1;
        opts.bodyShift = p * 36;
      } else {
        p = (frame - half) / half;
        dir = -1;
        opts.bodyShift = (1 - p) * 36;
      }
      // Petite oscillation respiration
      opts.bodyShift += Math.sin(frame * 0.18) * 0.3;
      if(frame % 18 === 0 && frame % half < half - 10){
        fx.push({ type: 'ash', dx: 0, dy: 6, count: 2, color: '#5a3525' });
      }
      return { opts, fx };
    },
  },
};

export const meta = { width: 22, height: 38, groundOffsetY: 0 };
export default { draw, attacks, palette, meta };
