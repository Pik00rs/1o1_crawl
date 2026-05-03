// src/js/render/enemies/cryo_archer.js
// Lanceur d'Aiguilles — ranged.
// Pas d'arc classique : silhouette mince qui propulse des aiguilles de glace
// cristalline depuis ses poignets. Cristaux flottants autour des poignets.

export const palette = {
  body:        '#5a7898',
  bodyDark:    '#28384a',
  bodyLight:   '#7a98b0',
  outline:     '#1a2838',
  cloak:       '#3a5878',
  cloakDark:   '#1a2838',
  cloakLight:  '#5a7898',
  ice:         '#aee6ff',
  iceCore:     '#e0f5ff',
  iceDark:     '#4fc3f7',
  needle:      '#e0f5ff',
  needleHot:   '#ffffff',
  hood:        '#28384a',
  shadow:      'rgba(20,40,60,0.7)',
};

export function draw(ctx, sx, sy, t, opts){
  opts = opts || {};
  const p = palette;
  const float = Math.sin(t * 0.04) * 0.4;
  const breathe = Math.sin(t * 0.03) * 0.3;
  sx = Math.round(sx + (opts.bodyShift || 0));
  sy = Math.round(sy + float);

  const armExtend = opts.armExtend !== undefined ? opts.armExtend : 0; // 0..1, bras tendus pour tirer
  const needleCharge = opts.needleCharge !== undefined ? opts.needleCharge : 0; // 0..1
  const needleVisible = opts.needleVisible !== undefined ? opts.needleVisible : 1;

  // Shadow
  ctx.fillStyle = p.shadow;
  ctx.beginPath();
  ctx.ellipse(sx, sy + 6, 11, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Cyan glow around hands (when charging)
  if(needleVisible > 0){
    const handGlow = 0.4 + needleCharge * 0.5 + Math.sin(t * 0.1) * 0.15;
    // Right hand glow (front, toward target)
    const rhx = sx - 11 - armExtend * 4;
    const rhy = sy - 14 + breathe;
    const grad = ctx.createRadialGradient(rhx, rhy, 1, rhx, rhy, 12);
    grad.addColorStop(0, `rgba(255,255,255,${handGlow * 0.5})`);
    grad.addColorStop(0.5, `rgba(174,230,255,${handGlow * 0.4})`);
    grad.addColorStop(1, 'rgba(174,230,255,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(rhx - 12, rhy - 12, 24, 24);
  }

  // Legs
  ctx.fillStyle = p.bodyDark;
  ctx.fillRect(sx - 6, sy - 1, 5, 9);
  ctx.fillRect(sx + 1, sy - 1, 5, 9);
  ctx.fillStyle = p.body;
  ctx.fillRect(sx - 6, sy - 1, 1, 9);
  // Frost on legs
  ctx.fillStyle = p.ice;
  ctx.fillRect(sx - 5, sy + 4, 2, 1);
  ctx.fillRect(sx + 3, sy + 3, 2, 1);

  // Boots
  ctx.fillStyle = '#0a1418';
  ctx.fillRect(sx - 7, sy + 8, 6, 3);
  ctx.fillRect(sx + 1, sy + 8, 6, 3);
  ctx.fillStyle = p.iceCore;
  ctx.fillRect(sx - 7, sy + 10, 6, 1);
  ctx.fillRect(sx + 1, sy + 10, 6, 1);

  // Cloak (back, hangs)
  ctx.fillStyle = p.cloakDark;
  ctx.beginPath();
  ctx.moveTo(sx + 8, sy - 17 + breathe);
  ctx.lineTo(sx + 12, sy - 15 + breathe);
  ctx.lineTo(sx + 10, sy + 4);
  ctx.lineTo(sx + 6, sy + 4);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = p.cloak;
  ctx.fillRect(sx + 9, sy - 14 + breathe, 2, 16);

  // Torso
  ctx.fillStyle = p.bodyDark;
  ctx.fillRect(sx - 7, sy - 18 + breathe, 14, 17);
  ctx.fillStyle = p.body;
  ctx.fillRect(sx - 7, sy - 18 + breathe, 14, 15);
  ctx.fillStyle = p.bodyLight;
  ctx.fillRect(sx - 7, sy - 18 + breathe, 2, 17);

  // Cross-strap (carquois invisible — mais on suggère un harnais)
  ctx.fillStyle = p.iceDark;
  ctx.fillRect(sx - 7, sy - 12 + breathe, 14, 1);
  // Frost veins
  const vp = 0.6 + Math.sin(t * 0.08) * 0.2;
  ctx.strokeStyle = `rgba(174,230,255,${vp})`;
  ctx.lineWidth = 0.6;
  ctx.beginPath();
  ctx.moveTo(sx - 4, sy - 16 + breathe); ctx.lineTo(sx - 2, sy - 12 + breathe);
  ctx.moveTo(sx + 3, sy - 15 + breathe); ctx.lineTo(sx + 5, sy - 11 + breathe);
  ctx.stroke();

  // === LEFT ARM (back, support, étendu vers l'arrière) ===
  ctx.save();
  ctx.translate(sx + 5, sy - 16 + breathe);
  ctx.rotate(0.4 - armExtend * 0.2);
  ctx.fillStyle = p.bodyDark;
  ctx.fillRect(-2, 0, 4, 11);
  ctx.fillStyle = p.body;
  ctx.fillRect(0, 0, 1, 11);
  // Hand
  ctx.fillStyle = p.outline;
  ctx.fillRect(-2, 11, 4, 3);
  // Floating crystals around the wrist
  if(needleVisible > 0){
    drawFloatingCrystals(ctx, 0, 14, t + 30, 0.7, p);
  }
  ctx.restore();

  // === RIGHT ARM (front, leading, tendu vers la cible) ===
  ctx.save();
  ctx.translate(sx - 5, sy - 16 + breathe);
  ctx.rotate(-0.5 - armExtend * 0.6);
  ctx.fillStyle = p.bodyDark;
  ctx.fillRect(-2, 0, 4, 12 + armExtend * 4);
  ctx.fillStyle = p.body;
  ctx.fillRect(-2, 0, 1, 12 + armExtend * 4);
  // Hand
  ctx.fillStyle = p.outline;
  ctx.fillRect(-2, 12 + armExtend * 4, 4, 3);
  // Floating crystals around wrist + needle
  if(needleVisible > 0){
    drawFloatingCrystals(ctx, 0, 15 + armExtend * 4, t, 1, p);
    // The needle being charged at the fingertip
    if(needleCharge > 0){
      const ny = 15 + armExtend * 4 + 2 + needleCharge * 4;
      ctx.fillStyle = p.needle;
      ctx.beginPath();
      ctx.moveTo(-1, ny);
      ctx.lineTo(0, ny + 4 * needleCharge);
      ctx.lineTo(1, ny);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = p.needleHot;
      ctx.fillRect(-0.5, ny + 1, 1, 2 * needleCharge);
    }
  }
  ctx.restore();

  // === HEAD : capuche ample ===
  ctx.fillStyle = p.hood;
  ctx.beginPath();
  ctx.moveTo(sx - 8, sy - 18 + breathe);
  ctx.lineTo(sx + 8, sy - 18 + breathe);
  ctx.lineTo(sx + 7, sy - 28 + breathe);
  ctx.lineTo(sx + 4, sy - 31 + breathe);
  ctx.lineTo(sx - 4, sy - 31 + breathe);
  ctx.lineTo(sx - 7, sy - 28 + breathe);
  ctx.closePath();
  ctx.fill();

  // Hood edge
  ctx.fillStyle = '#0a1418';
  ctx.fillRect(sx - 8, sy - 18 + breathe, 16, 2);

  // Frost on hood
  ctx.fillStyle = p.ice;
  ctx.fillRect(sx - 6, sy - 30 + breathe, 12, 1);

  // Inner shadow of hood
  ctx.fillStyle = '#000';
  ctx.fillRect(sx - 4, sy - 26 + breathe, 8, 6);

  // Glowing eyes
  const eyePulse = 0.85 + Math.sin(t * 0.09) * 0.15;
  ctx.fillStyle = `rgba(174,230,255,${eyePulse})`;
  ctx.fillRect(sx - 3, sy - 24 + breathe, 2, 2);
  ctx.fillRect(sx + 1, sy - 24 + breathe, 2, 2);
  ctx.fillStyle = `rgba(255,255,255,${eyePulse})`;
  ctx.fillRect(sx - 3, sy - 24 + breathe, 1, 1);
  ctx.fillRect(sx + 1, sy - 24 + breathe, 1, 1);
}

function drawFloatingCrystals(ctx, lx, ly, t, scale, p){
  // 3 cristaux qui orbitent autour du point
  for(let i = 0; i < 3; i++){
    const angle = (i / 3) * Math.PI * 2 + t * 0.05;
    const r = 4 * scale;
    const cx = lx + Math.cos(angle) * r;
    const cy = ly + Math.sin(angle) * r * 0.6;
    const size = scale * (1 + Math.sin(t * 0.1 + i) * 0.2);
    // Crystal
    ctx.fillStyle = p.iceDark;
    ctx.beginPath();
    ctx.moveTo(cx, cy - 2 * size);
    ctx.lineTo(cx - 1.2 * size, cy);
    ctx.lineTo(cx, cy + 2 * size);
    ctx.lineTo(cx + 1.2 * size, cy);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = p.iceCore;
    ctx.fillRect(Math.round(cx - 0.5), Math.round(cy - 0.5), 1, 1);
  }
}

export const attacks = {
  idle: {
    id: 'idle', name: 'IDLE', icon: '◇',
    duration: 9999, looping: true,
    description: 'Cristaux qui orbitent en permanence autour des poignets, halo cyan, capuche immobile.',
    phases: [{ from: 0, to: 9999, label: 'Loop' }],
    update(frame){
      const fx = [];
      if(frame % 30 === 0){
        fx.push({ type: 'ash', dx: -10, dy: -10, count: 1, color: '#aee6ff' });
      }
      return { opts: { needleVisible: 1 }, fx };
    },
  },

  crystalNeedle: {
    id: 'crystalNeedle', name: 'CRYSTAL NEEDLE', icon: '🏹',
    duration: 65,
    description: 'Aiguille de glace cristalline si fine qu\'elle traverse l\'armure (-30% armure cible). Range 6. Bras se tend, charge l\'aiguille, tire.',
    phases: [
      { from: 0, to: 25, label: 'Charge' },
      { from: 25, to: 33, label: 'Tir' },
      { from: 33, to: 65, label: 'Recovery' },
    ],
    projectile: {
      spawnFrame: 25,
      spawnOffset: { dx: -16, dy: -2 },
      travelFrames: 12, // très rapide, c'est une aiguille
      drawProjectile(ctx, x, y, vx, vy, t){
        const angle = Math.atan2(vy, vx);
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        // Halo
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, 8);
        grad.addColorStop(0, 'rgba(255,255,255,0.95)');
        grad.addColorStop(0.4, 'rgba(224,245,255,0.7)');
        grad.addColorStop(1, 'rgba(174,230,255,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(-8, -8, 16, 16);
        // Needle (aiguille très fine et longue)
        ctx.fillStyle = '#aee6ff';
        ctx.fillRect(-8, 0, 16, 1);
        ctx.fillStyle = '#fff';
        ctx.fillRect(-7, 0, 14, 0.5);
        // Sharp tip
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.moveTo(8, 0);
        ctx.lineTo(5, -1);
        ctx.lineTo(5, 1);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      },
      trailColor: '#e0f5ff',
      onHit: {
        flash: '#fff', flashSize: 9,
        sparks: 6, color: '#aee6ff',
      },
    },
    update(frame){
      const opts = { needleVisible: 1 };
      const fx = [];
      if(frame < 25){
        const p = frame / 25;
        opts.armExtend = p;
        opts.needleCharge = p;
        if(frame % 5 === 0 && frame > 8){
          fx.push({ type: 'sparks', dx: -14, dy: -4, count: 1, color: '#e0f5ff' });
        }
      } else if(frame < 33){
        opts.armExtend = 1;
        opts.needleCharge = 0;
        if(frame === 25){
          fx.push({ type: 'flash', dx: -16, dy: -2, color: '#fff', size: 9 });
          fx.push({ type: 'sparks', dx: -16, dy: -2, count: 6, color: '#aee6ff' });
          fx.push({
            type: 'projectile',
            dx: -16, dy: -2,
            useAttackProjectile: 'crystalNeedle',
          });
        }
      } else {
        const p = (frame - 33) / 32;
        opts.armExtend = 1 - p;
        opts.needleCharge = 0;
      }
      return { opts, fx };
    },
  },

  walk: {
    id: 'walk', name: 'WALK', icon: '🏃',
    duration: 160,
    looping: true,
    description: 'Recul/avancée pour maintenir distance (boucle aller-retour). Cristaux qui orbitent toujours.',
    phases: [
      { from: 0, to: 80, label: 'Recul' },
      { from: 80, to: 160, label: 'Retour' },
    ],
    update(frame){
      const opts = { needleVisible: 1 };
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
      opts.bodyShift += Math.sin(frame * 0.18) * 0.3;
      if(frame % 16 === 0){
        fx.push({ type: 'ash', dx: 0, dy: 11, count: 1, color: '#aee6ff' });
      }
      return { opts, fx };
    },
  },
};

export const meta = { width: 22, height: 38, groundOffsetY: 0 };
export default { draw, attacks, palette, meta };
