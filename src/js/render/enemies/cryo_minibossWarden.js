// src/js/render/enemies/cryo_minibossWarden.js
// Gardien des Cellules — MINIBOSS.
// Officier de prison, manteau lourd cryo, casquette militaire,
// clé géante en glace dans une main (symbole), trousseau à la ceinture.

export const palette = {
  coat:         '#3a4858',
  coatDark:     '#1a2838',
  coatLight:    '#5a6878',
  coatTrim:     '#aee6ff',
  pants:        '#28384a',
  pantsLight:   '#3a4858',
  belt:         '#0a1418',
  buckle:       '#7a98b0',
  cap:          '#1a2838',
  capPeak:      '#0a1418',
  capBadge:     '#aee6ff',
  face:         '#7a98b0',
  faceDark:     '#5a7898',
  beard:        '#28384a',
  ice:          '#aee6ff',
  iceDark:      '#4fc3f7',
  iceCore:      '#e0f5ff',
  keyMetal:     '#5a98c8',
  keyShine:     '#aee6ff',
  shadow:       'rgba(20,40,60,0.85)',
};

export function draw(ctx, sx, sy, t, opts){
  opts = opts || {};
  const p = palette;
  const bob = Math.sin(t * 0.04) * 0.5;
  const breathe = Math.sin(t * 0.03) * 0.3;
  sx = Math.round(sx + (opts.bodyShift || 0));
  sy = Math.round(sy + bob);

  const keyRaise = opts.keyRaise || 0;
  const summonPower = opts.summonPower || 0;
  const projectileCharge = opts.projectileCharge || 0;

  // Shadow
  ctx.fillStyle = p.shadow;
  ctx.beginPath();
  ctx.ellipse(sx, sy + 8, 16, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Summon glow (when calling walker)
  if(summonPower > 0){
    for(let i = 0; i < 3; i++){
      const r = 22 + i * 6 + Math.sin(t * 0.12 + i) * 3;
      const a = summonPower * 0.2 * (1 - i * 0.25);
      ctx.fillStyle = `rgba(174,230,255,${a})`;
      ctx.beginPath();
      ctx.ellipse(sx, sy + 4, r, r * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Body glow
  const glow = 0.3 + Math.sin(t * 0.05) * 0.1;
  const bg = ctx.createRadialGradient(sx, sy - 14, 5, sx, sy - 14, 32);
  bg.addColorStop(0, `rgba(174,230,255,${glow * 0.5})`);
  bg.addColorStop(1, 'rgba(174,230,255,0)');
  ctx.fillStyle = bg;
  ctx.fillRect(sx - 32, sy - 46, 64, 60);

  // === LEGS (pants militaires) ===
  ctx.fillStyle = p.pants;
  ctx.fillRect(sx - 8, sy - 1, 7, 11);
  ctx.fillRect(sx + 1, sy - 1, 7, 11);
  ctx.fillStyle = p.pantsLight;
  ctx.fillRect(sx - 8, sy - 1, 1, 11);
  // Stripe down side (officer)
  ctx.fillStyle = p.coatTrim;
  ctx.fillRect(sx - 1, sy - 1, 0.5, 11);

  // Boots
  ctx.fillStyle = p.belt;
  ctx.fillRect(sx - 9, sy + 10, 8, 4);
  ctx.fillRect(sx + 1, sy + 10, 8, 4);
  ctx.fillStyle = p.buckle;
  ctx.fillRect(sx - 9, sy + 10, 8, 1);
  ctx.fillRect(sx + 1, sy + 10, 8, 1);
  // Frost on boots
  ctx.fillStyle = p.ice;
  ctx.fillRect(sx - 9, sy + 13, 8, 1);
  ctx.fillRect(sx + 1, sy + 13, 8, 1);

  // === COAT (long, descend jusqu'aux genoux) ===
  // Skirt of coat
  ctx.fillStyle = p.coatDark;
  ctx.beginPath();
  ctx.moveTo(sx - 12, sy + 4);
  ctx.lineTo(sx + 12, sy + 4);
  ctx.lineTo(sx + 10, sy - 4 + breathe);
  ctx.lineTo(sx - 10, sy - 4 + breathe);
  ctx.closePath();
  ctx.fill();
  // Center seam
  ctx.fillStyle = p.coat;
  ctx.fillRect(sx - 10, sy - 4 + breathe, 20, 8);
  ctx.strokeStyle = p.coatDark;
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(sx, sy - 4 + breathe); ctx.lineTo(sx, sy + 4);
  ctx.stroke();

  // Belt (large)
  ctx.fillStyle = p.belt;
  ctx.fillRect(sx - 11, sy - 4 + breathe, 22, 3);
  ctx.fillStyle = p.buckle;
  ctx.fillRect(sx - 2, sy - 4 + breathe, 4, 3);
  ctx.fillStyle = p.coatTrim;
  ctx.fillRect(sx - 1, sy - 3 + breathe, 2, 1);

  // Keychain on belt (small ice keys hanging)
  drawKeyring(ctx, sx + 8, sy - 1 + breathe, t, p);

  // === TORSO (coat) ===
  ctx.fillStyle = p.coatDark;
  ctx.fillRect(sx - 11, sy - 22 + breathe, 22, 18);
  ctx.fillStyle = p.coat;
  ctx.fillRect(sx - 11, sy - 22 + breathe, 22, 16);
  ctx.fillStyle = p.coatLight;
  ctx.fillRect(sx - 11, sy - 22 + breathe, 3, 18);

  // Lapels (col)
  ctx.fillStyle = p.coatDark;
  ctx.beginPath();
  ctx.moveTo(sx - 9, sy - 22 + breathe);
  ctx.lineTo(sx, sy - 18 + breathe);
  ctx.lineTo(sx, sy - 12 + breathe);
  ctx.lineTo(sx - 6, sy - 22 + breathe);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(sx + 9, sy - 22 + breathe);
  ctx.lineTo(sx, sy - 18 + breathe);
  ctx.lineTo(sx, sy - 12 + breathe);
  ctx.lineTo(sx + 6, sy - 22 + breathe);
  ctx.closePath();
  ctx.fill();

  // Buttons (3 verticaux)
  ctx.fillStyle = p.coatTrim;
  ctx.fillRect(sx - 0.5, sy - 16 + breathe, 1, 1);
  ctx.fillRect(sx - 0.5, sy - 12 + breathe, 1, 1);
  ctx.fillRect(sx - 0.5, sy - 8 + breathe, 1, 1);

  // Frost on shoulders
  ctx.fillStyle = p.ice;
  ctx.fillRect(sx - 11, sy - 22 + breathe, 22, 1);
  ctx.fillStyle = p.iceCore;
  ctx.fillRect(sx - 9, sy - 22 + breathe, 1, 1);
  ctx.fillRect(sx + 8, sy - 22 + breathe, 1, 1);

  // Officer shoulder boards
  ctx.fillStyle = p.coatTrim;
  ctx.fillRect(sx - 12, sy - 22 + breathe, 4, 2);
  ctx.fillRect(sx + 8, sy - 22 + breathe, 4, 2);

  // === LEFT ARM (free, hangs) ===
  ctx.fillStyle = p.coatDark;
  ctx.fillRect(sx - 14, sy - 21 + breathe, 4, 12);
  ctx.fillStyle = p.coat;
  ctx.fillRect(sx - 14, sy - 21 + breathe, 1, 12);
  // Glove
  ctx.fillStyle = p.belt;
  ctx.fillRect(sx - 14, sy - 9 + breathe, 4, 3);

  // === RIGHT ARM holding the giant ICE KEY ===
  ctx.save();
  ctx.translate(sx + 11, sy - 21 + breathe);
  ctx.rotate(keyRaise);
  ctx.fillStyle = p.coatDark;
  ctx.fillRect(-2, 0, 4, 12);
  ctx.fillStyle = p.coat;
  ctx.fillRect(-2, 0, 1, 12);
  // Glove
  ctx.fillStyle = p.belt;
  ctx.fillRect(-2, 12, 4, 3);
  // === GIANT ICE KEY ===
  drawIceKey(ctx, 1, 16, t, projectileCharge, p);
  ctx.restore();

  // === HEAD : casquette militaire ===
  // Face
  ctx.fillStyle = p.faceDark;
  ctx.fillRect(sx - 6, sy - 32 + breathe, 12, 11);
  ctx.fillStyle = p.face;
  ctx.fillRect(sx - 6, sy - 32 + breathe, 12, 9);
  // Beard / lower face shadow
  ctx.fillStyle = p.beard;
  ctx.fillRect(sx - 6, sy - 25 + breathe, 12, 3);
  ctx.fillStyle = p.faceDark;
  ctx.fillRect(sx - 4, sy - 23 + breathe, 8, 1);

  // Eyes (cold blue glow)
  ctx.fillStyle = '#000';
  ctx.fillRect(sx - 4, sy - 29 + breathe, 3, 2);
  ctx.fillRect(sx + 1, sy - 29 + breathe, 3, 2);
  const eyePulse = 0.85 + Math.sin(t * 0.07) * 0.15;
  ctx.fillStyle = `rgba(174,230,255,${eyePulse})`;
  ctx.fillRect(sx - 3, sy - 28 + breathe, 1, 1);
  ctx.fillRect(sx + 2, sy - 28 + breathe, 1, 1);

  // Nose / mustache
  ctx.fillStyle = p.beard;
  ctx.fillRect(sx - 2, sy - 26 + breathe, 4, 1);

  // === CAP : casquette militaire ===
  // Crown
  ctx.fillStyle = p.cap;
  ctx.fillRect(sx - 8, sy - 38 + breathe, 16, 7);
  ctx.fillStyle = p.coatLight;
  ctx.fillRect(sx - 8, sy - 38 + breathe, 16, 1);

  // Hat band
  ctx.fillStyle = p.coatDark;
  ctx.fillRect(sx - 8, sy - 33 + breathe, 16, 2);

  // Peak / brim (visière)
  ctx.fillStyle = p.capPeak;
  ctx.beginPath();
  ctx.moveTo(sx - 9, sy - 31 + breathe);
  ctx.lineTo(sx + 9, sy - 31 + breathe);
  ctx.lineTo(sx + 7, sy - 30 + breathe);
  ctx.lineTo(sx - 7, sy - 30 + breathe);
  ctx.closePath();
  ctx.fill();

  // Cap badge (insigne icy)
  ctx.fillStyle = p.capBadge;
  ctx.beginPath();
  ctx.moveTo(sx, sy - 38 + breathe);
  ctx.lineTo(sx - 2, sy - 35 + breathe);
  ctx.lineTo(sx, sy - 32 + breathe);
  ctx.lineTo(sx + 2, sy - 35 + breathe);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = p.iceCore;
  ctx.fillRect(sx - 0.5, sy - 36 + breathe, 1, 1);

  // Frost on cap
  ctx.fillStyle = p.ice;
  ctx.fillRect(sx - 8, sy - 39 + breathe, 16, 1);
}

function drawKeyring(ctx, lx, ly, t, p){
  // Anneau central
  ctx.strokeStyle = p.keyMetal;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(lx, ly, 1.5, 0, Math.PI * 2);
  ctx.stroke();
  // 3 petites clés qui pendent
  for(let i = 0; i < 3; i++){
    const offset = (i - 1) * 1.2 + Math.sin(t * 0.05 + i) * 0.3;
    ctx.fillStyle = p.keyMetal;
    ctx.fillRect(lx + offset, ly + 2, 1, 4);
    ctx.fillStyle = p.keyShine;
    ctx.fillRect(lx + offset, ly + 5, 1, 1);
  }
}

function drawIceKey(ctx, lx, ly, t, charge, p){
  // Bow (anneau de la clé)
  ctx.fillStyle = p.iceDark;
  ctx.beginPath();
  ctx.arc(lx, ly + 4, 4, 0, Math.PI * 2);
  ctx.fill();
  // Inner hole
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.arc(lx, ly + 4, 2, 0, Math.PI * 2);
  ctx.fill();
  // Shine on bow
  ctx.fillStyle = p.keyShine;
  ctx.fillRect(lx - 3, ly + 2, 1, 2);

  // Shaft (long descendant)
  ctx.fillStyle = p.iceDark;
  ctx.fillRect(lx - 1, ly + 8, 3, 14);
  ctx.fillStyle = p.ice;
  ctx.fillRect(lx, ly + 8, 1, 14);

  // Bit (la dent de la clé en bas)
  ctx.fillStyle = p.iceDark;
  ctx.fillRect(lx - 1, ly + 18, 5, 4);
  ctx.fillRect(lx - 1, ly + 22, 4, 2);
  ctx.fillStyle = p.ice;
  ctx.fillRect(lx, ly + 18, 1, 4);

  // Sharp point at bottom
  ctx.fillStyle = p.iceCore;
  ctx.fillRect(lx + 3, ly + 19, 1, 2);

  // Glow if charging
  if(charge > 0){
    const grad = ctx.createRadialGradient(lx, ly + 14, 1, lx, ly + 14, 12);
    grad.addColorStop(0, `rgba(174,230,255,${charge * 0.7})`);
    grad.addColorStop(1, 'rgba(174,230,255,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(lx - 12, ly + 2, 24, 24);
  }
}

export const attacks = {
  idle: {
    id: 'idle', name: 'IDLE', icon: '◇',
    duration: 9999, looping: true,
    description: 'Garde immobile, clé géante de glace tenue verticalement, regard glacial. Trousseau qui se balance lentement.',
    phases: [{ from: 0, to: 9999, label: 'Loop' }],
    update(frame){
      const fx = [];
      if(frame % 24 === 0){
        fx.push({ type: 'ash', dx: 0, dy: -28, count: 1, color: '#aee6ff' });
      }
      return { opts: {}, fx };
    },
  },

  iceProjectile: {
    id: 'iceProjectile', name: 'ICE THROW', icon: '🗝',
    duration: 70,
    description: 'Lance un éclat de glace dense vers la cible. Range 3. 20% chance d\'appliquer Frozen 1 tour.',
    phases: [
      { from: 0, to: 25, label: 'Charge' },
      { from: 25, to: 33, label: 'Tir' },
      { from: 33, to: 70, label: 'Recovery' },
    ],
    projectile: {
      spawnFrame: 25,
      spawnOffset: { dx: 14, dy: -8 },
      travelFrames: 16,
      arc: 6,
      drawProjectile(ctx, x, y, vx, vy, t){
        const angle = Math.atan2(vy, vx);
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle + t * 0.15);
        // Halo
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, 12);
        grad.addColorStop(0, 'rgba(255,255,255,0.95)');
        grad.addColorStop(0.4, 'rgba(174,230,255,0.85)');
        grad.addColorStop(1, 'rgba(79,195,247,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(-12, -12, 24, 24);
        // Ice chunk (jagged crystal)
        ctx.fillStyle = '#4fc3f7';
        ctx.beginPath();
        ctx.moveTo(-5, 0);
        ctx.lineTo(-2, -4);
        ctx.lineTo(2, -3);
        ctx.lineTo(5, 0);
        ctx.lineTo(2, 3);
        ctx.lineTo(-2, 4);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#aee6ff';
        ctx.beginPath();
        ctx.moveTo(-5, 0);
        ctx.lineTo(-2, -4);
        ctx.lineTo(2, -3);
        ctx.lineTo(0, 0);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.fillRect(-1, -1, 2, 1);
        ctx.restore();
      },
      trailColor: '#aee6ff',
      onHit: {
        flash: '#e0f5ff', flashSize: 14,
        sparks: 12, color: '#aee6ff',
        shockwave: '#4fc3f7', shockwaveRadius: 26,
      },
    },
    update(frame){
      const opts = {};
      const fx = [];
      if(frame < 25){
        const p = frame / 25;
        opts.keyRaise = -p * 0.5;
        opts.projectileCharge = p;
        if(frame % 5 === 0){
          fx.push({ type: 'sparks', dx: 14, dy: -2, count: 1, color: '#aee6ff' });
        }
      } else if(frame < 33){
        opts.keyRaise = -0.7;
        opts.projectileCharge = 0;
        if(frame === 25){
          fx.push({ type: 'flash', dx: 14, dy: -8, color: '#e0f5ff', size: 12 });
          fx.push({ type: 'sparks', dx: 14, dy: -8, count: 6, color: '#aee6ff' });
          fx.push({
            type: 'projectile',
            dx: 14, dy: -8,
            useAttackProjectile: 'iceProjectile',
          });
        }
      } else {
        const p = (frame - 33) / 37;
        opts.keyRaise = -0.7 + 0.7 * p;
      }
      return { opts, fx };
    },
  },

  summonWalker: {
    id: 'summonWalker', name: 'SUMMON WALKER', icon: '🧟',
    duration: 90,
    description: 'Frappe le sol avec la clé géante pour invoquer un Givre-Marcheur (tous les 4 tours). Anim : lève la clé, frappe, glyphe au sol, manifestation.',
    phases: [
      { from: 0, to: 28, label: 'Lift' },
      { from: 28, to: 42, label: 'Slam' },
      { from: 42, to: 70, label: 'Glyph' },
      { from: 70, to: 90, label: 'Manifest' },
    ],
    update(frame){
      const opts = {};
      const fx = [];
      if(frame < 28){
        const p = frame / 28;
        opts.keyRaise = -p * 1.2;
        opts.summonPower = p * 0.5;
        if(frame % 4 === 0 && frame > 8){
          fx.push({ type: 'sparks', dx: 22, dy: -16, count: 1, color: '#aee6ff' });
        }
      } else if(frame < 42){
        const p = (frame - 28) / 14;
        opts.keyRaise = -1.2 + p * 1.5;
        opts.summonPower = 0.5 + p * 0.3;
        if(frame === 28){
          fx.push({ type: 'flash', dx: 0, dy: 10, color: '#e0f5ff', size: 18 });
          fx.push({ type: 'shockwave', dx: 0, dy: 10, color: '#aee6ff', maxRadius: 40 });
          fx.push({ type: 'sparks', dx: 0, dy: 10, count: 14, color: '#aee6ff' });
        }
      } else if(frame < 70){
        opts.keyRaise = 0.3;
        opts.summonPower = 0.8 + Math.sin(frame * 0.2) * 0.15;
        // Glyph particles spawn at the ground in front
        if(frame % 3 === 0){
          fx.push({ type: 'sparks', dx: -12, dy: 12, count: 1, color: '#4fc3f7' });
        }
        if(frame === 42){
          fx.push({ type: 'shockwave', dx: -12, dy: 12, color: '#4fc3f7', maxRadius: 24 });
        }
      } else {
        const p = (frame - 70) / 20;
        opts.keyRaise = 0.3 - 0.3 * p;
        opts.summonPower = Math.max(0, 0.8 - p);
        if(frame === 70){
          fx.push({ type: 'flash', dx: -12, dy: 8, color: '#fff', size: 18 });
          fx.push({ type: 'sparks', dx: -12, dy: 8, count: 16, color: '#aee6ff' });
        }
      }
      return { opts, fx };
    },
  },

  walk: {
    id: 'walk', name: 'WALK', icon: '🏃',
    duration: 200,
    looping: true,
    description: 'Marche d\'officier, posture droite. Trousseau qui ballotte légèrement. Aller-retour 100/100 frames.',
    phases: [
      { from: 0, to: 100, label: 'Avancée' },
      { from: 100, to: 200, label: 'Retour' },
    ],
    update(frame){
      const opts = {};
      const fx = [];
      const half = 100;
      let p;
      if(frame < half){
        p = frame / half;
        opts.bodyShift = p * 36;
      } else {
        p = (frame - half) / half;
        opts.bodyShift = (1 - p) * 36;
      }
      opts.bodyShift += Math.sin(frame * 0.15) * 0.5;
      if(frame % 14 === 0){
        fx.push({ type: 'ash', dx: -3, dy: 12, count: 1, color: '#aee6ff' });
        fx.push({ type: 'ash', dx: 3, dy: 12, count: 1, color: '#aee6ff' });
      }
      return { opts, fx };
    },
  },
};

export const meta = { width: 30, height: 50, groundOffsetY: 0 };
export default { draw, attacks, palette, meta };
