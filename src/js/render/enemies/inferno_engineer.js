// src/js/render/enemies/inferno_engineer.js
// Ingénieur Thermique — support qui déploie des tourelles.
// Combinaison ouvrier moins calcinée, casque avec lampe frontale,
// pistolet rivet en main, sac d'outils sur le dos.

export const palette = {
  suit:        '#5a4030',
  suitDark:    '#3a2818',
  suitLight:   '#7a5840',
  helmet:      '#c89030',  // casque jaune-orange (ouvrier)
  helmetDark:  '#7a5018',
  helmetEdge:  '#5a3810',
  lamp:        '#ffe080',
  lampGlow:    '#fff8c0',
  rivet:       '#3a2418',
  rivetMetal:  '#7a5040',
  rivetSpark:  '#ffd47a',
  toolbox:     '#2a1810',
  toolboxAcc:  '#ff6f1a',
  shadow:      'rgba(0,0,0,0.7)',
};

export function draw(ctx, sx, sy, t, opts){
  opts = opts || {};
  const p = palette;
  const bob = Math.sin(t * 0.045) * 0.5;
  const breathe = Math.sin(t * 0.035) * 0.3;
  sx = Math.round(sx + (opts.bodyShift || 0));
  sy = Math.round(sy + bob);

  const lampOn = opts.lampBlink !== undefined ? opts.lampBlink : 1;
  const armRaise = opts.armRaise || 0;
  const muzzleFlash = opts.muzzleFlash || 0;

  // Shadow
  ctx.fillStyle = p.shadow;
  ctx.beginPath();
  ctx.ellipse(sx, sy + 6, 12, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Lamp beam (cone forward)
  if(lampOn > 0){
    const beamGrad = ctx.createLinearGradient(sx + 6, sy - 24 + breathe, sx + 24, sy - 18 + breathe);
    beamGrad.addColorStop(0, `rgba(255,248,192,${0.55 * lampOn})`);
    beamGrad.addColorStop(1, 'rgba(255,248,192,0)');
    ctx.fillStyle = beamGrad;
    ctx.beginPath();
    ctx.moveTo(sx + 6, sy - 24 + breathe);
    ctx.lineTo(sx + 24, sy - 28 + breathe);
    ctx.lineTo(sx + 24, sy - 14 + breathe);
    ctx.closePath();
    ctx.fill();
  }

  // Legs
  ctx.fillStyle = p.suitDark;
  ctx.fillRect(sx - 7, sy - 1, 6, 9);
  ctx.fillRect(sx + 1, sy - 1, 6, 9);
  ctx.fillStyle = p.suit;
  ctx.fillRect(sx - 7, sy - 1, 2, 9);
  // Knee patches (carrés contrastés, comme une combinaison ouvrier)
  ctx.fillStyle = p.helmetEdge;
  ctx.fillRect(sx - 6, sy + 3, 4, 2);
  ctx.fillRect(sx + 2, sy + 3, 4, 2);

  // Boots
  ctx.fillStyle = '#1a0805';
  ctx.fillRect(sx - 8, sy + 8, 7, 3);
  ctx.fillRect(sx, sy + 8, 7, 3);
  // Steel toes
  ctx.fillStyle = p.rivetMetal;
  ctx.fillRect(sx - 8, sy + 10, 3, 1);
  ctx.fillRect(sx + 5, sy + 10, 3, 1);

  // Toolbox on back (peek)
  ctx.fillStyle = p.toolbox;
  ctx.fillRect(sx + 7, sy - 17 + breathe, 4, 11);
  ctx.fillStyle = p.toolboxAcc;
  ctx.fillRect(sx + 7, sy - 14 + breathe, 4, 1);
  ctx.fillRect(sx + 7, sy - 10 + breathe, 4, 1);

  // Torso (combinaison)
  ctx.fillStyle = p.suit;
  ctx.fillRect(sx - 8, sy - 18 + breathe, 16, 17);
  ctx.fillStyle = p.suitLight;
  ctx.fillRect(sx - 8, sy - 18 + breathe, 2, 17);
  ctx.fillStyle = p.suitDark;
  ctx.fillRect(sx + 6, sy - 18 + breathe, 2, 17);

  // Reflective stripes (orange high-vis, ouvrier)
  ctx.fillStyle = p.toolboxAcc;
  ctx.fillRect(sx - 8, sy - 13 + breathe, 16, 1);
  ctx.fillRect(sx - 8, sy - 7 + breathe, 16, 1);

  // Chest patch / nameplate
  ctx.fillStyle = p.suitDark;
  ctx.fillRect(sx - 4, sy - 16 + breathe, 8, 2);
  ctx.fillStyle = p.lamp;
  ctx.fillRect(sx - 3, sy - 16 + breathe, 6, 1);

  // === LEFT ARM (libre) ===
  ctx.fillStyle = p.suitDark;
  ctx.fillRect(sx - 11, sy - 17 + breathe, 4, 11);
  ctx.fillStyle = p.suit;
  ctx.fillRect(sx - 11, sy - 17 + breathe, 1, 11);
  // Glove
  ctx.fillStyle = '#1a0805';
  ctx.fillRect(sx - 11, sy - 6 + breathe, 4, 3);

  // === RIGHT ARM + RIVET GUN ===
  ctx.save();
  ctx.translate(sx + 8, sy - 17 + breathe);
  ctx.rotate(armRaise);
  ctx.fillStyle = p.suitDark;
  ctx.fillRect(0, 0, 4, 11);
  ctx.fillStyle = p.suit;
  ctx.fillRect(0, 0, 1, 11);
  // Glove holding gun
  ctx.fillStyle = '#1a0805';
  ctx.fillRect(0, 11, 5, 3);
  // Rivet gun
  ctx.fillStyle = p.rivet;
  ctx.fillRect(2, 13, 9, 4);
  ctx.fillStyle = p.rivetMetal;
  ctx.fillRect(2, 13, 9, 1);
  ctx.fillStyle = p.helmetEdge;
  ctx.fillRect(2, 16, 9, 1);
  // Barrel
  ctx.fillStyle = p.rivetMetal;
  ctx.fillRect(11, 14, 4, 2);
  // Trigger guard
  ctx.fillStyle = p.rivetMetal;
  ctx.fillRect(4, 17, 1, 2);
  // Muzzle flash
  if(muzzleFlash > 0){
    ctx.fillStyle = `rgba(255,224,128,${muzzleFlash})`;
    ctx.beginPath();
    ctx.arc(15, 15, 4 * muzzleFlash, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = `rgba(255,255,255,${muzzleFlash})`;
    ctx.fillRect(15, 14, 3, 2);
  }
  ctx.restore();

  // === HEAD : casque ouvrier ===
  // Helmet base
  ctx.fillStyle = p.helmetDark;
  ctx.fillRect(sx - 7, sy - 26 + breathe, 14, 9);
  ctx.fillStyle = p.helmet;
  ctx.fillRect(sx - 7, sy - 26 + breathe, 14, 7);
  // Top ridge
  ctx.fillStyle = p.helmetEdge;
  ctx.fillRect(sx - 7, sy - 28 + breathe, 14, 2);
  ctx.fillStyle = p.helmet;
  ctx.fillRect(sx - 6, sy - 28 + breathe, 12, 1);
  // Brim shadow
  ctx.fillStyle = p.helmetEdge;
  ctx.fillRect(sx - 7, sy - 19 + breathe, 14, 2);

  // Face under helmet
  ctx.fillStyle = '#0a0402';
  ctx.fillRect(sx - 5, sy - 19 + breathe, 10, 2);
  // Eyes
  const eyePulse = 0.7 + Math.sin(t * 0.08) * 0.3;
  ctx.fillStyle = `rgba(255,107,26,${eyePulse})`;
  ctx.fillRect(sx - 4, sy - 19 + breathe, 2, 1);
  ctx.fillRect(sx + 2, sy - 19 + breathe, 2, 1);

  // Lamp on helmet (circular, white)
  ctx.fillStyle = p.helmetEdge;
  ctx.beginPath();
  ctx.arc(sx + 4, sy - 23 + breathe, 2.5, 0, Math.PI * 2);
  ctx.fill();
  if(lampOn > 0){
    ctx.fillStyle = `rgba(255,248,192,${lampOn})`;
    ctx.beginPath();
    ctx.arc(sx + 4, sy - 23 + breathe, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(sx + 4, sy - 23 + breathe, 1, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillStyle = '#3a2818';
    ctx.beginPath();
    ctx.arc(sx + 4, sy - 23 + breathe, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Antenna
  ctx.fillStyle = p.helmetEdge;
  ctx.fillRect(sx - 5, sy - 30 + breathe, 1, 3);
  ctx.fillStyle = p.toolboxAcc;
  ctx.fillRect(sx - 5, sy - 31 + breathe, 1, 1);
}

export const attacks = {
  idle: {
    id: 'idle', name: 'IDLE', icon: '◇',
    duration: 9999, looping: true,
    description: 'Lampe frontale qui clignote occasionnellement. Bobbing de respiration. Cône de lumière projeté vers l\'avant.',
    phases: [{ from: 0, to: 9999, label: 'Loop' }],
    update(frame){
      // Lamp blink toutes les ~120 frames
      const blinkPhase = frame % 120;
      const lampBlink = (blinkPhase < 90) ? 1 : (blinkPhase < 95 ? 0.3 : (blinkPhase < 100 ? 1 : (blinkPhase < 103 ? 0.3 : 1)));
      return { opts: { lampBlink }, fx: [] };
    },
  },

  rivetShot: {
    id: 'rivetShot', name: 'RIVET SHOT', icon: '🔧',
    duration: 55,
    description: 'Tir de rivet enflammé. Range 3. Recul du pistolet, flash au museau, rivet métallique chauffé qui voyage vers la cible.',
    phases: [
      { from: 0, to: 15, label: 'Visée' },
      { from: 15, to: 22, label: 'Tir' },
      { from: 22, to: 55, label: 'Recovery' },
    ],
    projectile: {
      spawnFrame: 15,
      spawnOffset: { dx: 22, dy: -3 },
      travelFrames: 12,
      drawProjectile(ctx, x, y, vx, vy, t){
        const angle = Math.atan2(vy, vx);
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        // Halo orange
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, 7);
        grad.addColorStop(0, 'rgba(255,200,100,0.8)');
        grad.addColorStop(1, 'rgba(255,107,26,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(-7, -7, 14, 14);
        // Rivet body (cylindre métal chauffé)
        ctx.fillStyle = '#3a2418';
        ctx.fillRect(-3, -1, 6, 2);
        ctx.fillStyle = '#7a5040';
        ctx.fillRect(-3, -1, 6, 1);
        // Hot tip
        ctx.fillStyle = '#ffb347';
        ctx.fillRect(2, -1, 2, 2);
        ctx.fillStyle = '#fff';
        ctx.fillRect(3, 0, 1, 1);
        ctx.restore();
      },
      trailColor: '#ffb347',
      onHit: {
        flash: '#ffe080', flashSize: 9,
        sparks: 6, color: '#ffd47a',
      },
    },
    update(frame){
      const opts = { lampBlink: 1 };
      const fx = [];
      if(frame < 15){
        const p = frame / 15;
        opts.armRaise = -0.15 - p * 0.1;
      } else if(frame < 22){
        opts.armRaise = -0.4;
        opts.muzzleFlash = (22 - frame) / 7;
        opts.bodyShift = -0.8;
        if(frame === 15){
          fx.push({ type: 'sparks', dx: 22, dy: -3, count: 6, color: '#ffd47a' });
          fx.push({ type: 'flash', dx: 22, dy: -3, color: '#ffe080', size: 8 });
          fx.push({
            type: 'projectile',
            dx: 22, dy: -3,
            useAttackProjectile: 'rivetShot',
          });
        }
      } else {
        const p = (frame - 22) / 33;
        opts.armRaise = -0.4 + (0.4) * p;
      }
      return { opts, fx };
    },
  },

  deployTurret: {
    id: 'deployTurret', name: 'DEPLOY TURRET', icon: '🛠',
    duration: 80,
    description: 'Pose une tourelle au sol (12 PV, 8 dmg, range 4, déployable tous les 5 tours). Anim de pose : se penche, tourelle apparaît, se redresse.',
    phases: [
      { from: 0, to: 20, label: 'Sortie' },
      { from: 20, to: 50, label: 'Pose' },
      { from: 50, to: 80, label: 'Recul' },
    ],
    update(frame){
      const opts = { lampBlink: 1 };
      const fx = [];
      if(frame < 20){
        const p = frame / 20;
        opts.armRaise = -0.6 + p * 0.6; // descend le bras vers le sol
        opts.bodyShift = p * 1;
      } else if(frame < 50){
        // Pose la tourelle
        opts.armRaise = 0;
        opts.bodyShift = 1;
        if(frame === 20){
          fx.push({ type: 'flash', dx: 8, dy: 14, color: '#ff6f1a', size: 12 });
          fx.push({ type: 'sparks', dx: 8, dy: 14, count: 10, color: '#ffb347' });
          fx.push({ type: 'shockwave', dx: 8, dy: 14, color: '#ff6f1a', maxRadius: 22 });
        }
        if(frame % 6 === 0 && frame < 45){
          fx.push({ type: 'ash', dx: 8, dy: 14, count: 1, color: '#ffb347' });
        }
      } else {
        const p = (frame - 50) / 30;
        opts.bodyShift = 1 - p;
        opts.armRaise = -p * 0.15;
      }
      return { opts, fx };
    },
  },

  walk: {
    id: 'walk', name: 'WALK', icon: '🏃',
    duration: 180,
    looping: true,
    description: 'Marche en arrière puis revient (aller-retour). Lampe qui balaie, sac à outils qui ballotte.',
    phases: [
      { from: 0, to: 90, label: 'Recul' },
      { from: 90, to: 180, label: 'Avancée' },
    ],
    update(frame){
      const opts = { lampBlink: 1 };
      const fx = [];
      const half = 90;
      let p;
      if(frame < half){
        p = frame / half;
        opts.bodyShift = p * 32;
      } else {
        p = (frame - half) / half;
        opts.bodyShift = (1 - p) * 32;
      }
      opts.bodyShift += Math.sin(frame * 0.2) * 0.4;
      if(frame % 14 === 0){
        fx.push({ type: 'ash', dx: 0, dy: 11, count: 1, color: '#5a3525' });
      }
      return { opts, fx };
    },
  },
};

export const meta = { width: 24, height: 40, groundOffsetY: 0 };
export default { draw, attacks, palette, meta };
