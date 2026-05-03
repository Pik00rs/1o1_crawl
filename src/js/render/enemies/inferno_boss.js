// src/js/render/enemies/inferno_boss.js
// Pyromancien — BOSS final Inferno.
// Plus grand (1.5x hero), robe noire et rouge ample qui flotte (lévite ~5px),
// cœur thermonucléaire incrusté dans la poitrine (cercle blanc-bleu hyper lumineux),
// capuche large avec deux yeux blancs incandescents, mains levées avec spirales de feu permanentes.

export const palette = {
  robe:        '#1a0808',  // robe noire
  robeRed:     '#5a1818',  // doublure rouge sang
  robeDark:    '#0a0202',
  robeLight:   '#3a1010',
  hood:        '#0a0202',
  hoodEdge:    '#000',
  cortex:      '#cef0ff',  // cœur thermonucléaire (bleu-blanc, contraste max)
  cortexHot:   '#fff',
  cortexRing:  '#4fc3f7',
  flame:       '#ff6f1a',
  flameHot:    '#ffb347',
  flameCore:   '#ffe080',
  flameWhite:  '#ffffff',
  ash:         '#a06850',
  shadow:      'rgba(0,0,0,0.85)',
};

export function draw(ctx, sx, sy, t, opts){
  opts = opts || {};
  const p = palette;
  // Lévite : pas de bobbing, juste un float lent
  const float = Math.sin(t * 0.03) * 1.2 - 5; // -5px = lévitation permanente
  const sway = Math.sin(t * 0.022 + 2.1) * 0.6;
  sx = Math.round(sx + (opts.bodyShift || 0) + sway);
  sy = Math.round(sy + float);

  const armRaise = opts.armRaise !== undefined ? opts.armRaise : -0.5;
  const coreFlare = opts.coreFlare || 0; // 0..1, intensifies thermonuclear core
  const robeFlow = opts.robeFlow !== undefined ? opts.robeFlow : 1; // 0 = aplatie (dispelled), 1 = flotte
  const phase2 = opts.phase2 || 0; // changement visuel à 30%

  // Shadow (ovale large, distant car lévite)
  ctx.fillStyle = p.shadow;
  ctx.beginPath();
  ctx.ellipse(sx, sy + 13, 16, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Outer red glow (large halo)
  const outerGlow = 0.5 + coreFlare * 0.4 + Math.sin(t * 0.05) * 0.15;
  const og = ctx.createRadialGradient(sx, sy - 18, 6, sx, sy - 18, 50);
  og.addColorStop(0, `rgba(255,80,20,${outerGlow * 0.5})`);
  og.addColorStop(0.5, `rgba(255,107,26,${outerGlow * 0.25})`);
  og.addColorStop(1, 'rgba(255,107,26,0)');
  ctx.fillStyle = og;
  ctx.fillRect(sx - 50, sy - 70, 100, 100);

  // Cyan-white core glow (super bright, distinct)
  const coreGlow = 0.7 + coreFlare * 0.3 + Math.sin(t * 0.1) * 0.15;
  const cg = ctx.createRadialGradient(sx, sy - 18, 1, sx, sy - 18, 24);
  cg.addColorStop(0, `rgba(255,255,255,${coreGlow * 0.6})`);
  cg.addColorStop(0.4, `rgba(174,230,255,${coreGlow * 0.4})`);
  cg.addColorStop(1, 'rgba(174,230,255,0)');
  ctx.fillStyle = cg;
  ctx.fillRect(sx - 24, sy - 42, 48, 48);

  // === ROBE BOTTOM (s'évase fortement, flotte) ===
  ctx.fillStyle = p.robeDark;
  const flowOffset = Math.sin(t * 0.04) * 1.5 * robeFlow;
  ctx.beginPath();
  ctx.moveTo(sx - 14 - flowOffset, sy + 13);
  ctx.lineTo(sx + 14 + flowOffset, sy + 13);
  ctx.lineTo(sx + 11, sy - 6);
  ctx.lineTo(sx - 11, sy - 6);
  ctx.closePath();
  ctx.fill();
  // Inner red lining (visible at the base since robe flows)
  ctx.fillStyle = p.robeRed;
  ctx.beginPath();
  ctx.moveTo(sx - 13 - flowOffset, sy + 12);
  ctx.lineTo(sx + 13 + flowOffset, sy + 12);
  ctx.lineTo(sx + 9, sy + 6);
  ctx.lineTo(sx - 9, sy + 6);
  ctx.closePath();
  ctx.fill();

  // Robe folds (vertical lines)
  ctx.strokeStyle = p.robeLight;
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(sx - 8, sy + 12); ctx.lineTo(sx - 6, sy - 6);
  ctx.moveTo(sx, sy + 13); ctx.lineTo(sx, sy - 6);
  ctx.moveTo(sx + 8, sy + 12); ctx.lineTo(sx + 6, sy - 6);
  ctx.stroke();

  // === TORSO (robe, plus étroit que le bas) ===
  ctx.fillStyle = p.robe;
  ctx.fillRect(sx - 11, sy - 24, 22, 18);
  ctx.fillStyle = p.robeLight;
  ctx.fillRect(sx - 11, sy - 24, 2, 18);
  ctx.fillStyle = p.robeDark;
  ctx.fillRect(sx + 9, sy - 24, 2, 18);

  // === THERMONUCLEAR CORE on chest (THE focal point) ===
  // Outer ring (cyan)
  ctx.fillStyle = p.cortexRing;
  ctx.beginPath();
  ctx.arc(sx, sy - 18, 6, 0, Math.PI * 2);
  ctx.fill();
  // Mid ring
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.arc(sx, sy - 18, 5, 0, Math.PI * 2);
  ctx.fill();
  // Core glow (white-cyan, super bright)
  const corePulse = 0.9 + Math.sin(t * 0.08) * 0.1 + coreFlare * 0.2;
  ctx.fillStyle = `rgba(206,240,255,${corePulse})`;
  ctx.beginPath();
  ctx.arc(sx, sy - 18, 4, 0, Math.PI * 2);
  ctx.fill();
  // Inner white
  ctx.fillStyle = `rgba(255,255,255,${corePulse})`;
  ctx.beginPath();
  ctx.arc(sx, sy - 18, 2.5, 0, Math.PI * 2);
  ctx.fill();
  // Tiny cyan rotating particle pattern
  for(let i = 0; i < 3; i++){
    const angle = (i / 3) * Math.PI * 2 + t * 0.04;
    const x = sx + Math.cos(angle) * 3;
    const y = sy - 18 + Math.sin(angle) * 3;
    ctx.fillStyle = `rgba(79,195,247,${corePulse})`;
    ctx.fillRect(Math.round(x), Math.round(y), 1, 1);
  }
  // Cross beams emanating
  ctx.strokeStyle = `rgba(174,230,255,${corePulse * 0.6})`;
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(sx - 8, sy - 18); ctx.lineTo(sx + 8, sy - 18);
  ctx.moveTo(sx, sy - 26); ctx.lineTo(sx, sy - 10);
  ctx.stroke();

  // === SLEEVES (longues, larges, flottent) ===
  // Left sleeve
  ctx.save();
  ctx.translate(sx - 11, sy - 23);
  ctx.rotate(armRaise);
  ctx.fillStyle = p.robeDark;
  ctx.beginPath();
  ctx.moveTo(-3, 0);
  ctx.lineTo(2, 0);
  ctx.lineTo(4, 16);
  ctx.lineTo(-5, 16);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = p.robe;
  ctx.fillRect(-2, 0, 2, 14);
  // Hand exposed
  ctx.fillStyle = p.ash;
  ctx.fillRect(-1, 16, 4, 3);
  // Fire spiral around hand (permanent)
  drawHandSpiral(ctx, 1, 19, t, 1, p);
  ctx.restore();

  // Right sleeve
  ctx.save();
  ctx.translate(sx + 11, sy - 23);
  ctx.rotate(-armRaise);
  ctx.fillStyle = p.robeDark;
  ctx.beginPath();
  ctx.moveTo(-2, 0);
  ctx.lineTo(3, 0);
  ctx.lineTo(5, 16);
  ctx.lineTo(-4, 16);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = p.robe;
  ctx.fillRect(0, 0, 2, 14);
  // Hand
  ctx.fillStyle = p.ash;
  ctx.fillRect(-1, 16, 4, 3);
  drawHandSpiral(ctx, 1, 19, t + 60, 1, p);
  ctx.restore();

  // === HOOD (large, ample) ===
  ctx.fillStyle = p.hood;
  ctx.beginPath();
  ctx.moveTo(sx - 13, sy - 23);
  ctx.lineTo(sx + 13, sy - 23);
  ctx.lineTo(sx + 11, sy - 38);
  ctx.lineTo(sx + 5, sy - 44);
  ctx.lineTo(sx - 5, sy - 44);
  ctx.lineTo(sx - 11, sy - 38);
  ctx.closePath();
  ctx.fill();

  // Inner shadow (face)
  ctx.fillStyle = '#000';
  ctx.fillRect(sx - 6, sy - 38, 12, 9);

  // Two glowing white-blue eyes
  const eyePulse = 0.92 + Math.sin(t * 0.09) * 0.08;
  ctx.fillStyle = `rgba(255,255,255,${eyePulse})`;
  ctx.fillRect(sx - 4, sy - 35, 2, 2);
  ctx.fillRect(sx + 2, sy - 35, 2, 2);
  // Halo around eyes
  ctx.fillStyle = `rgba(206,240,255,${eyePulse * 0.5})`;
  ctx.fillRect(sx - 5, sy - 35, 4, 2);
  ctx.fillRect(sx + 1, sy - 35, 4, 2);

  // Hood edge (red lining peek)
  ctx.fillStyle = p.robeRed;
  ctx.fillRect(sx - 13, sy - 23, 26, 1);

  // Phase 2 indicator : extra crown of fire above hood
  if(phase2 > 0){
    for(let i = 0; i < 5; i++){
      const angle = (i / 5) * Math.PI - Math.PI * 0.5;
      const x = sx + Math.cos(angle) * 10;
      const y = sy - 44 + Math.sin(angle) * 4;
      const flameH = 6 + Math.sin(t * 0.15 + i * 1.2) * 2;
      ctx.fillStyle = `rgba(255,107,26,${0.85 * phase2})`;
      ctx.beginPath();
      ctx.moveTo(x - 1.5, y);
      ctx.lineTo(x, y - flameH);
      ctx.lineTo(x + 1.5, y);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = `rgba(255,224,128,${phase2})`;
      ctx.fillRect(x - 0.5, y - flameH * 0.6, 1, 1);
    }
  }
}

function drawHandSpiral(ctx, lx, ly, t, scale, p){
  // Spirale de feu permanente autour de la main
  const r = 5 * scale;
  // Halo
  const grad = ctx.createRadialGradient(lx, ly, 0, lx, ly, r * 2);
  grad.addColorStop(0, `rgba(255,224,128,${0.85 * scale})`);
  grad.addColorStop(0.4, `rgba(255,107,26,${0.6 * scale})`);
  grad.addColorStop(1, 'rgba(255,80,20,0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(lx, ly, r * 2, 0, Math.PI * 2);
  ctx.fill();

  // Spiral flames (3 bras qui tournent)
  for(let i = 0; i < 3; i++){
    const angle = (i / 3) * Math.PI * 2 + t * 0.08;
    const fx = lx + Math.cos(angle) * r;
    const fy = ly + Math.sin(angle) * r;
    ctx.fillStyle = p.flameHot;
    ctx.beginPath();
    ctx.arc(fx, fy, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = p.flameCore;
    ctx.fillRect(Math.round(fx) - 0.5, Math.round(fy) - 0.5, 1, 1);
  }

  // Inner core
  ctx.fillStyle = p.flameWhite;
  ctx.beginPath();
  ctx.arc(lx, ly, 1.5, 0, Math.PI * 2);
  ctx.fill();
}

export const attacks = {
  idle: {
    id: 'idle', name: 'IDLE', icon: '◇',
    duration: 9999, looping: true,
    description: 'Lévite. Cœur thermonucléaire bleu pulsant, robe qui flotte, spirales de feu permanentes aux mains, yeux blancs incandescents.',
    phases: [{ from: 0, to: 9999, label: 'Loop' }],
    update(frame){
      const fx = [];
      if(frame % 18 === 0){
        fx.push({ type: 'ash', dx: 0, dy: -22, count: 1, color: '#cef0ff' });
      }
      if(frame % 10 === 0){
        fx.push({ type: 'ash', dx: -14, dy: 5, count: 1, color: '#ffb347' });
        fx.push({ type: 'ash', dx: 14, dy: 5, count: 1, color: '#ffb347' });
      }
      return { opts: {}, fx };
    },
  },

  infernoBurst: {
    id: 'infernoBurst', name: 'INFERNO BURST', icon: '💥',
    duration: 100,
    description: 'AOE feu 3×3 cases tous les 5 tours. Le boss charge un orbe thermonucléaire dans le cœur, le projette vers la cible où il explose en spirale de feu.',
    phases: [
      { from: 0, to: 35, label: 'Charge' },
      { from: 35, to: 50, label: 'Project' },
      { from: 50, to: 80, label: 'Detonation' },
      { from: 80, to: 100, label: 'Recovery' },
    ],
    projectile: {
      spawnFrame: 35,
      // Origine = centre du cœur thermonucléaire
      spawnOffset: { dx: 0, dy: -18 },
      travelFrames: 15,
      arc: 12, // arc parabolique
      drawProjectile(ctx, x, y, vx, vy, t){
        // Halo blanc-bleu très large
        const grad = ctx.createRadialGradient(x, y, 0, x, y, 18);
        grad.addColorStop(0, 'rgba(255,255,255,0.95)');
        grad.addColorStop(0.3, 'rgba(206,240,255,0.85)');
        grad.addColorStop(0.6, 'rgba(79,195,247,0.5)');
        grad.addColorStop(1, 'rgba(79,195,247,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(x - 18, y - 18, 36, 36);
        // Outer ring (cyan)
        ctx.fillStyle = '#4fc3f7';
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fill();
        // Core
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();
        // White center
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
        // Rotating cyan particles
        for(let i = 0; i < 4; i++){
          const angle = (i / 4) * Math.PI * 2 + t * 0.25;
          const px = x + Math.cos(angle) * 4;
          const py = y + Math.sin(angle) * 4;
          ctx.fillStyle = '#aee6ff';
          ctx.fillRect(Math.round(px), Math.round(py), 1, 1);
        }
      },
      trailColor: '#aee6ff',
      onHit: {
        flash: '#ffe080', flashSize: 26,
        sparks: 24, color: '#ffd47a',
        shockwave: '#ff6f1a', shockwaveRadius: 56,
        ash: 12, color: '#ffb347',
      },
    },
    update(frame){
      const opts = {};
      const fx = [];
      if(frame < 35){
        // Charge : bras s'élèvent, cœur s'intensifie
        const p = frame / 35;
        opts.armRaise = -0.5 - p * 1.0;
        opts.coreFlare = p;
        if(frame % 5 === 0){
          fx.push({ type: 'sparks', dx: 0, dy: -18, count: 2, color: '#aee6ff' });
        }
        if(frame > 25 && frame % 3 === 0){
          fx.push({ type: 'sparks', dx: 0, dy: -8, count: 1, color: '#ffe080' });
        }
      } else if(frame < 50){
        // Project : projectile lancé au frame 35
        opts.armRaise = -1.5;
        opts.coreFlare = 1 - (frame - 35) / 15;
        if(frame === 35){
          fx.push({ type: 'flash', dx: 0, dy: -18, color: '#ffffff', size: 24 });
          fx.push({ type: 'shockwave', dx: 0, dy: -10, color: '#aee6ff', maxRadius: 36 });
          fx.push({
            type: 'projectile',
            dx: 0, dy: -18,
            useAttackProjectile: 'infernoBurst',
          });
        }
      } else if(frame < 80){
        // Detonation : on laisse onHit gérer + ondes secondaires
        opts.armRaise = -1.5 + ((frame - 50) / 30) * 1.0;
        opts.coreFlare = 0;
        // Ondes secondaires (le projectile a déjà émis la première)
        if(frame === 60){
          fx.push({ type: 'shockwave', dx: 0, dy: 0, color: '#ffb347', maxRadius: 44, useTargetPosition: true });
        }
        if(frame === 68){
          fx.push({ type: 'shockwave', dx: 0, dy: 0, color: '#ff8a4d', maxRadius: 32, useTargetPosition: true });
        }
      } else {
        opts.armRaise = -0.5;
      }
      return { opts, fx };
    },
  },

  summon: {
    id: 'summon', name: 'SUMMON (P2)', icon: '🔮',
    duration: 90,
    description: 'À 30% HP : phase 2. Couronne de feu apparaît au-dessus de la capuche. Deux glyphes au sol invoquent des Pyromanciens Mineurs.',
    phases: [
      { from: 0, to: 25, label: 'Phase shift' },
      { from: 25, to: 60, label: 'Glyphs' },
      { from: 60, to: 90, label: 'Manifest' },
    ],
    update(frame){
      const opts = { armRaise: -1.0 };
      const fx = [];
      if(frame < 25){
        const p = frame / 25;
        opts.phase2 = p;
        opts.coreFlare = p * 0.7;
        if(frame === 0){
          fx.push({ type: 'flash', dx: 0, dy: -36, color: '#ff6f1a', size: 26 });
          fx.push({ type: 'shockwave', dx: 0, dy: -10, color: '#ff3015', maxRadius: 44 });
        }
      } else if(frame < 60){
        opts.phase2 = 1;
        opts.coreFlare = 0.7;
        // Glyph particles spawn left and right of boss on the ground
        if(frame % 3 === 0){
          fx.push({ type: 'sparks', dx: -20, dy: 12, count: 1, color: '#ff6f1a' });
          fx.push({ type: 'sparks', dx: 20, dy: 12, count: 1, color: '#ff6f1a' });
        }
        if(frame === 25){
          fx.push({ type: 'shockwave', dx: -20, dy: 12, color: '#ff6f1a', maxRadius: 24 });
          fx.push({ type: 'shockwave', dx: 20, dy: 12, color: '#ff6f1a', maxRadius: 24 });
        }
      } else {
        opts.phase2 = 1;
        opts.coreFlare = 0.5;
        if(frame === 60){
          fx.push({ type: 'flash', dx: -20, dy: 8, color: '#ffe080', size: 18 });
          fx.push({ type: 'flash', dx: 20, dy: 8, color: '#ffe080', size: 18 });
          fx.push({ type: 'sparks', dx: -20, dy: 8, count: 12, color: '#ffb347' });
          fx.push({ type: 'sparks', dx: 20, dy: 8, count: 12, color: '#ffb347' });
        }
      }
      return { opts, fx };
    },
  },

  teleport: {
    id: 'teleport', name: 'TELEPORT', icon: '✦',
    duration: 60,
    description: 'Téléporte si pris au CaC. Disparaît en cendre, réapparaît à distance. Robe qui se compresse, vortex de cendres, flash, recomposition.',
    phases: [
      { from: 0, to: 25, label: 'Dissolve' },
      { from: 25, to: 35, label: 'Void' },
      { from: 35, to: 60, label: 'Reform' },
    ],
    update(frame){
      const opts = {};
      const fx = [];
      if(frame < 25){
        const p = frame / 25;
        opts.robeFlow = 1 - p; // robe se rétracte
        opts.coreFlare = p * 0.8;
        if(frame % 2 === 0){
          fx.push({
            type: 'ash',
            dx: (Math.random() - 0.5) * 22,
            dy: -10 + (Math.random() - 0.5) * 28,
            count: 2,
            color: '#5a3525',
          });
        }
        if(frame === 24){
          fx.push({ type: 'flash', dx: 0, dy: -18, color: '#ff3015', size: 26 });
          fx.push({ type: 'shockwave', dx: 0, dy: -10, color: '#ff6f1a', maxRadius: 30 });
        }
      } else if(frame < 35){
        // Void phase : sprite invisible (or barely)
        opts.robeFlow = 0;
        opts.coreFlare = 0;
        opts.bodyShift = 999; // off-screen during void
      } else {
        const p = (frame - 35) / 25;
        opts.robeFlow = p;
        opts.coreFlare = (1 - p) * 0.6;
        opts.bodyShift = 0;
        if(frame === 35){
          fx.push({ type: 'flash', dx: 0, dy: -18, color: '#aee6ff', size: 24 });
          fx.push({ type: 'sparks', dx: 0, dy: -10, count: 18, color: '#cef0ff' });
        }
      }
      return { opts, fx };
    },
  },
};

export const meta = { width: 40, height: 70, groundOffsetY: -5 }; // boss, le plus grand
export default { draw, attacks, palette, meta };
