// src/js/render/enemies/inferno_brute.js
// Brûlant — Inferno Brute (mob standard).
// Sprite pixel-art canvas + animations d'attaques.
//
// Référence visuelle : silhouette voûtée, plus large que le héros (1.3×),
// gantelet de forge droit massif, casque de soudeur fondu avec fente
// incandescente, fissures orange sur le corps.

export const palette = {
  body:      '#5e2418',  // combinaison brun-rouge calcinée
  bodyDark:  '#3a1610',  // ombrage corps
  bodyLight: '#7a3525',  // highlight corps
  accent:    '#ff6f1a',  // orange feu (fissures, fente casque)
  accentHot: '#ffb347',  // orange chaud (cœur des fissures, gantelet)
  accentWhite: '#ffe080', // jaune-blanc (étincelles, cœur incandescent)
  helmet:    '#1a0805',  // casque
  helmetEdge:'#3a1810',  // bord casque
  skin:      '#a06850',  // peau visible (bras gauche)
  skinDark:  '#5a3a28',  // ombrage peau
  gauntlet:  '#4a2a18',  // gantelet métal
  gauntletL: '#7a4528',  // gantelet highlight
  gauntletD: '#2a140a',  // gantelet ombrage
  shadow:    'rgba(0,0,0,0.7)',
};

/**
 * Dessine le Brûlant à la position (sx, sy) où sy = position des pieds.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} sx
 * @param {number} sy - position des pieds (le perso est dessiné au-dessus)
 * @param {number} t - frame counter (pour bobbing/pulse)
 * @param {object} opts - modifs de pose pour les anims
 *   { armRaise, armSwing, gauntletGlowBoost, bodyShift, slitGlowBoost,
 *     auraRadius, auraIntensity }
 */
export function draw(ctx, sx, sy, t, opts){
  opts = opts || {};
  const p = palette;
  const bob = Math.sin(t * 0.04) * 0.8;
  const breathe = Math.sin(t * 0.03) * 0.4;
  sx = Math.round(sx + (opts.bodyShift || 0));
  sy = Math.round(sy + bob);

  const armRaise = opts.armRaise || 0;
  const armSwing = opts.armSwing || 0;

  // === SHADOW ===
  ctx.fillStyle = p.shadow;
  ctx.beginPath();
  ctx.ellipse(sx, sy + 7, 17, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // === HEAT AURA (si active, dessin du sol qui chauffe) ===
  if(opts.auraRadius && opts.auraRadius > 0){
    drawHeatAuraGround(ctx, sx, sy, opts.auraRadius, opts.auraIntensity || 1, t);
  }

  // === BODY GLOW (halo permanent) ===
  if(opts.glowBoost === undefined || opts.glowBoost > 0){
    const glowAmount = opts.glowBoost === undefined ? 0.4 : (0.4 + opts.glowBoost * 0.4);
    const bg = ctx.createRadialGradient(sx, sy - 6, 4, sx, sy - 6, 30);
    bg.addColorStop(0, `rgba(255,138,48,${glowAmount})`);
    bg.addColorStop(1, 'rgba(255,138,48,0)');
    ctx.fillStyle = bg;
    ctx.fillRect(sx - 30, sy - 36, 60, 60);
  }

  // === LEGS ===
  ctx.fillStyle = p.bodyDark;
  ctx.fillRect(sx - 9, sy - 2, 7, 11);
  ctx.fillRect(sx + 2, sy - 2, 7, 11);
  ctx.fillStyle = p.body;
  ctx.fillRect(sx - 9, sy - 2, 2, 11);
  ctx.fillStyle = p.helmet;
  ctx.fillRect(sx + 7, sy - 2, 2, 11);

  // === BOOTS ===
  ctx.fillStyle = p.helmet;
  ctx.fillRect(sx - 11, sy + 9, 11, 3);
  ctx.fillRect(sx, sy + 9, 11, 3);
  ctx.fillStyle = p.accent;
  ctx.fillRect(sx - 11, sy + 11, 11, 1);
  ctx.fillRect(sx, sy + 11, 11, 1);

  // === TORSO (combinaison) ===
  ctx.fillStyle = p.body;
  ctx.fillRect(sx - 13, sy - 22 + breathe, 26, 20);
  ctx.fillStyle = p.bodyLight;
  ctx.fillRect(sx - 13, sy - 22 + breathe, 3, 20);
  ctx.fillStyle = p.bodyDark;
  ctx.fillRect(sx + 10, sy - 22 + breathe, 3, 20);

  // Lignes de plaques soudées
  ctx.strokeStyle = 'rgba(122,53,37,0.4)';
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(sx - 10, sy - 18 + breathe); ctx.lineTo(sx + 10, sy - 18 + breathe);
  ctx.moveTo(sx - 10, sy - 12 + breathe); ctx.lineTo(sx + 10, sy - 12 + breathe);
  ctx.moveTo(sx - 10, sy - 6 + breathe); ctx.lineTo(sx + 10, sy - 6 + breathe);
  ctx.stroke();

  // Fissures incandescentes (3 zigzags)
  const crackPulse = 0.7 + Math.sin(t * 0.06) * 0.3;
  ctx.strokeStyle = `rgba(255,138,48,${crackPulse})`;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(sx - 8, sy - 20 + breathe);
  ctx.lineTo(sx - 6, sy - 15 + breathe);
  ctx.lineTo(sx - 8, sy - 10 + breathe);
  ctx.lineTo(sx - 5, sy - 5 + breathe);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(sx + 5, sy - 19 + breathe);
  ctx.lineTo(sx + 3, sy - 14 + breathe);
  ctx.lineTo(sx + 6, sy - 9 + breathe);
  ctx.lineTo(sx + 4, sy - 4 + breathe);
  ctx.stroke();
  ctx.strokeStyle = `rgba(255,179,71,${crackPulse})`;
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(sx - 2, sy - 16 + breathe);
  ctx.lineTo(sx, sy - 12 + breathe);
  ctx.lineTo(sx - 1, sy - 7 + breathe);
  ctx.stroke();

  // Bord épaule
  ctx.fillStyle = p.bodyDark;
  ctx.beginPath();
  ctx.moveTo(sx - 13, sy - 22 + breathe);
  ctx.lineTo(sx + 13, sy - 22 + breathe);
  ctx.lineTo(sx + 11, sy - 19 + breathe);
  ctx.lineTo(sx - 11, sy - 19 + breathe);
  ctx.closePath();
  ctx.fill();

  // === LEFT ARM (peau visible, bras fin calciné) ===
  ctx.fillStyle = p.bodyDark;
  ctx.fillRect(sx - 15, sy - 19 + breathe, 3, 11);
  ctx.fillStyle = p.skin;
  ctx.fillRect(sx - 15, sy - 8 + breathe, 3, 6);
  ctx.fillStyle = p.skinDark;
  ctx.fillRect(sx - 15, sy - 8 + breathe, 1, 6);

  // === RIGHT ARM + GAUNTLET (rotation possible pour anim) ===
  ctx.save();
  ctx.translate(sx + 13, sy - 22 + breathe);
  ctx.rotate(armRaise + armSwing);
  // Le gantelet est dessiné en coords locales (pivot = épaule)
  drawGauntlet(ctx, 0, 0, t, opts.gauntletGlowBoost || 0);
  ctx.restore();

  // === HEAD (casque) ===
  ctx.fillStyle = p.helmet;
  ctx.fillRect(sx - 11, sy - 37 + breathe, 22, 15);
  ctx.fillStyle = p.helmetEdge;
  ctx.fillRect(sx - 11, sy - 37 + breathe, 22, 3);
  ctx.fillRect(sx - 11, sy - 37 + breathe, 3, 15);
  ctx.fillStyle = '#0a0402';
  ctx.fillRect(sx + 8, sy - 37 + breathe, 3, 15);

  // Bord supérieur casque
  ctx.fillStyle = p.helmetEdge;
  ctx.fillRect(sx - 13, sy - 39 + breathe, 26, 3);
  ctx.fillStyle = '#5a2a18';
  ctx.fillRect(sx - 13, sy - 39 + breathe, 26, 1);

  // Fente incandescente du casque
  const slitGlow = opts.slitGlowBoost ? 1 : (0.85 + Math.sin(t * 0.05) * 0.15);
  ctx.fillStyle = `rgba(255,107,26,${slitGlow})`;
  ctx.fillRect(sx - 9, sy - 30 + breathe, 18, 2);
  ctx.fillStyle = `rgba(255,224,128,${slitGlow})`;
  ctx.fillRect(sx - 9, sy - 30 + breathe, 18, 1);
  // Reflets aux extrémités de la fente
  ctx.fillStyle = '#fff';
  ctx.fillRect(sx - 7, sy - 29 + breathe, 1, 1);
  ctx.fillRect(sx + 6, sy - 29 + breathe, 1, 1);

  // Rivets aux 4 coins du casque
  ctx.fillStyle = p.accentHot;
  ctx.fillRect(sx - 12, sy - 35 + breathe, 1, 3);
  ctx.fillRect(sx + 11, sy - 35 + breathe, 1, 3);
  ctx.fillRect(sx - 12, sy - 26 + breathe, 1, 3);
  ctx.fillRect(sx + 11, sy - 26 + breathe, 1, 3);
}

/**
 * Dessine le gantelet de forge à (lx, ly) en coords locales.
 * Le pivot est en haut-gauche pour que la rotation se fasse depuis l'épaule.
 */
function drawGauntlet(ctx, lx, ly, t, glowBoost){
  const p = palette;
  const gx = lx - 1;
  const gy = ly;

  // Plaque principale
  ctx.fillStyle = p.gauntlet;
  ctx.fillRect(gx, gy, 11, 14);
  ctx.fillStyle = p.gauntletL;
  ctx.fillRect(gx, gy, 11, 2);
  ctx.fillRect(gx, gy + 12, 11, 2);
  ctx.fillRect(gx, gy, 3, 14);
  ctx.fillStyle = p.gauntletD;
  ctx.fillRect(gx + 9, gy, 2, 14);

  // Veines de métal en fusion (3 lignes horizontales)
  const veinPulse = glowBoost > 0 ? 1 : (0.85 + Math.sin(t * 0.08) * 0.15);
  ctx.strokeStyle = `rgba(255,179,71,${veinPulse})`;
  ctx.lineWidth = 0.7;
  ctx.beginPath();
  ctx.moveTo(gx + 2, gy + 3); ctx.lineTo(gx + 9, gy + 3);
  ctx.moveTo(gx + 2, gy + 7); ctx.lineTo(gx + 9, gy + 7);
  ctx.moveTo(gx + 2, gy + 11); ctx.lineTo(gx + 9, gy + 11);
  ctx.stroke();

  // Surcharge incandescente (anim slam)
  if(glowBoost > 0){
    ctx.fillStyle = `rgba(255,255,200,${glowBoost})`;
    ctx.fillRect(gx + 1, gy + 2, 9, 1);
    ctx.fillRect(gx + 1, gy + 6, 9, 1);
    ctx.fillRect(gx + 1, gy + 10, 9, 1);
    // Halo autour du gantelet
    const ggrad = ctx.createRadialGradient(gx + 5, gy + 7, 1, gx + 5, gy + 7, 14);
    ggrad.addColorStop(0, `rgba(255,255,180,${0.6 * glowBoost})`);
    ggrad.addColorStop(1, 'rgba(255,180,80,0)');
    ctx.fillStyle = ggrad;
    ctx.fillRect(gx - 8, gy - 6, 26, 26);
  }

  // Rivets aux coins
  ctx.fillStyle = '#1a0805';
  ctx.fillRect(gx + 1, gy + 1, 1, 1);
  ctx.fillRect(gx + 9, gy + 1, 1, 1);
  ctx.fillRect(gx + 1, gy + 12, 1, 1);
  ctx.fillRect(gx + 9, gy + 12, 1, 1);

  // Avant-bras (court)
  ctx.fillStyle = p.bodyDark;
  ctx.fillRect(gx, gy + 14, 9, 5);
}

/**
 * HEAT AURA (effet au sol). Gros anneau orange ÉPAIS et lumineux avec distorsion thermique.
 * Visible quand opts.auraRadius > 0.
 *
 * Structure (du plus loin au plus proche du joueur visuel) :
 *   1. Halo extérieur diffus (rouge-orange, large, faible alpha)
 *   2. Anneau principal ÉPAIS pulsant (orange chaud, gradient radial faux par triple-stroke)
 *   3. Rim incandescent jaune/blanc fin sur le bord intérieur (high-contrast)
 *   4. Disque central rouge-sombre (sol qui chauffe)
 *   5. Marques de chauffe stationnaires (segments noirs cassés autour du Brûlant)
 *   6. Distorsion thermique : 12 ondulations qui montent du sol
 *   7. Étincelles aléatoires qui sautent sur l'anneau
 */
function drawHeatAuraGround(ctx, sx, sy, radius, intensity, t){
  const groundY = sy + 6;
  const ry = radius * 0.4; // ratio iso

  // Pulse global pour rendre l'aura "vivante"
  const pulse = 0.85 + Math.sin(t * 0.12) * 0.15;
  const pulse2 = 0.7 + Math.sin(t * 0.18 + 1.2) * 0.3;

  ctx.save();

  // ─── 1. Halo extérieur diffus (large nuage rougeoyant) ────────────────────
  for(let i = 0; i < 4; i++){
    const r = radius * (1.15 + i * 0.08);
    const a = intensity * 0.10 * (1 - i * 0.22) * pulse;
    ctx.fillStyle = `rgba(255,80,20,${a})`;
    ctx.beginPath();
    ctx.ellipse(sx, groundY, r, r * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // ─── 2. Disque central (sol incandescent qui chauffe) ─────────────────────
  // Du rouge sombre au centre vers orange en bordure
  for(let i = 5; i >= 0; i--){
    const r = radius * (0.2 + i * 0.13);
    const a = intensity * 0.15 * pulse;
    // teinte plus sombre au centre, plus orange en bordure
    const red = 200 + i * 10;
    const green = 30 + i * 18;
    const blue = 10;
    ctx.fillStyle = `rgba(${red},${green},${blue},${a})`;
    ctx.beginPath();
    ctx.ellipse(sx, groundY, r, r * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // ─── 3. Anneau principal ÉPAIS pulsant (3 strokes superposés) ─────────────
  // Stroke 1 : large, orange foncé (base)
  ctx.strokeStyle = `rgba(220,80,15,${intensity * 0.85 * pulse})`;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.ellipse(sx, groundY, radius, ry, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Stroke 2 : moyen, orange vif (chair de l'anneau)
  ctx.strokeStyle = `rgba(255,130,40,${intensity * 0.95 * pulse})`;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(sx, groundY, radius, ry, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Stroke 3 : fin, jaune-blanc incandescent (rim intérieur, contraste max)
  ctx.strokeStyle = `rgba(255,230,160,${intensity * pulse2})`;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.ellipse(sx, groundY, radius - 1, ry - 0.4, 0, 0, Math.PI * 2);
  ctx.stroke();

  // ─── 4. Marques de chauffe stationnaires (8 segments cassés) ──────────────
  // Donnent un look de "pavage qui craque sous la chaleur"
  ctx.strokeStyle = `rgba(40,10,5,${intensity * 0.55})`;
  ctx.lineWidth = 1.5;
  for(let i = 0; i < 8; i++){
    const a1 = (i / 8) * Math.PI * 2;
    const a2 = a1 + 0.18;
    ctx.beginPath();
    ctx.ellipse(sx, groundY, radius - 2, ry - 0.8, 0, a1, a2);
    ctx.stroke();
  }

  // ─── 5. Distorsion thermique (12 colonnes qui montent du sol) ─────────────
  const heatRise = (t * 0.6) % 24;
  ctx.lineWidth = 0.9;
  for(let i = 0; i < 12; i++){
    const angle = (i / 12) * Math.PI * 2 + Math.sin(t * 0.03) * 0.05;
    const dx = Math.cos(angle) * radius * 0.85;
    const dy = Math.sin(angle) * radius * 0.34;
    const startX = sx + dx;
    const startY = groundY + dy;

    // Gradient d'opacité : plus visible en bas, fondu en haut
    for(let j = 0; j < 5; j++){
      const localY = -j * 5 - heatRise;
      const nextY = -(j + 1) * 5 - heatRise;
      const wave = Math.sin((t * 0.13 + i * 1.7 + j * 0.8)) * 2.2;
      const waveNext = Math.sin((t * 0.13 + i * 1.7 + (j + 1) * 0.8)) * 2.2;
      const fade = (1 - j / 5) * intensity * 0.55;
      ctx.strokeStyle = `rgba(255,180,90,${fade})`;
      ctx.beginPath();
      ctx.moveTo(startX + wave, startY + localY);
      ctx.lineTo(startX + waveNext, startY + nextY);
      ctx.stroke();
    }
  }

  // ─── 6. Étincelles qui sautent sur l'anneau (8 points pulsants) ───────────
  for(let i = 0; i < 8; i++){
    const angle = (i / 8) * Math.PI * 2 + t * 0.008;
    // Position légèrement variable (bruit sinusoïdal)
    const noiseR = 1 + Math.sin(t * 0.07 + i * 2.3) * 0.04;
    const dx = Math.cos(angle) * radius * noiseR;
    const dy = Math.sin(angle) * radius * 0.4 * noiseR;
    const sparkPulse = 0.5 + Math.sin(t * 0.15 + i * 1.1) * 0.5;
    const a = intensity * sparkPulse * 0.95;
    // Étincelle blanche/jaune
    ctx.fillStyle = `rgba(255,240,180,${a})`;
    ctx.beginPath();
    ctx.arc(sx + dx, groundY + dy, 1.6, 0, Math.PI * 2);
    ctx.fill();
    // Halo orange autour
    ctx.fillStyle = `rgba(255,140,40,${a * 0.4})`;
    ctx.beginPath();
    ctx.arc(sx + dx, groundY + dy, 3.2, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

// ============================================================================
// ATTAQUES — chaque attaque est une fonction qui prend (frame, totalFrames)
// et retourne { opts, fx } pour modifier le sprite et émettre des effets.
// ============================================================================

export const attacks = {
  slam: {
    id: 'slam',
    name: 'SLAM',
    icon: '⚔',
    duration: 80,
    description: 'Coup d\'écrasement avec le gantelet de forge. Anticipation lente, frappe rapide, onde de choc à l\'impact.',
    phases: [
      { from: 0, to: 25, label: 'Anticipation' },
      { from: 25, to: 33, label: 'Frappe' },
      { from: 33, to: 45, label: 'Impact' },
      { from: 45, to: 80, label: 'Recovery' },
    ],
    update(frame){
      const opts = {};
      const fx = [];
      if(frame < 25){
        const p = frame / 25;
        opts.armRaise = -1.4 * p;
        opts.gauntletGlowBoost = 0.4 * p;
        if(frame > 15) opts.bodyShift = (Math.random() - 0.5) * 1.5;
      } else if(frame < 33){
        const p = (frame - 25) / 8;
        opts.armRaise = -1.4 + (1.4 + 0.4) * p;
        opts.gauntletGlowBoost = 0.4 + 0.6 * p;
      } else if(frame < 45){
        opts.armRaise = 0.4;
        opts.gauntletGlowBoost = 1;
        if(frame === 33){
          fx.push({ type: 'shockwave', dx: 60, dy: 20 });
          fx.push({ type: 'sparks', dx: 60, dy: 20, count: 10 });
          fx.push({ type: 'ash', dx: 60, dy: 20, count: 6, color: '#5a3525' });
        }
        if(frame === 36){
          fx.push({ type: 'shockwave', dx: 60, dy: 20 });
        }
      } else {
        const p = (frame - 45) / 35;
        opts.armRaise = 0.4 - 0.4 * p;
        opts.gauntletGlowBoost = Math.max(0, 1 - p);
      }
      return { opts, fx };
    },
  },

  heatAura: {
    id: 'heatAura',
    name: 'HEAT AURA',
    icon: '🩸',
    duration: 120,
    passive: true,
    description: 'Aura de chaleur permanente. Brûle les ennemis adjacents (1 PV/tour). Visible en jeu via le cercle de chauffe au sol et les ondes de distorsion.',
    phases: [
      { from: 0, to: 60, label: 'Expansion' },
      { from: 60, to: 120, label: 'Stable' },
    ],
    update(frame){
      const opts = {};
      const fx = [];
      // L'aura grandit progressivement puis reste stable
      let radius;
      if(frame < 60){
        const p = frame / 60;
        // Easing out
        radius = (1 - Math.pow(1 - p, 3)) * 52;
      } else {
        // Pulsation marquée autour de 52
        radius = 52 + Math.sin(frame * 0.1) * 4;
      }
      opts.auraRadius = radius;
      opts.auraIntensity = Math.min(1, frame / 30);
      opts.glowBoost = 0.4 + Math.sin(frame * 0.06) * 0.2;
      // Le slit du casque pulse aussi pour montrer la chauffe interne
      opts.slitGlowBoost = 0.3 + Math.sin(frame * 0.08) * 0.2;

      // Étincelles ambiantes au bord de l'anneau
      if(frame % 6 === 0 && frame > 20){
        const angle = Math.random() * Math.PI * 2;
        fx.push({
          type: 'ash',
          dx: Math.cos(angle) * radius * 0.95,
          dy: 6 + Math.sin(angle) * radius * 0.38,
          count: 1,
          color: '#ffb347',
        });
      }
      // Pulse de sparks au moment où l'anneau atteint sa taille max
      if(frame === 60){
        fx.push({ type: 'sparks', dx: 0, dy: 6, count: 12, color: '#ffd47a' });
      }
      return { opts, fx };
    },
  },

  walk: {
    id: 'walk',
    name: 'WALK',
    icon: '🏃',
    duration: 200,
    looping: true,
    description: 'Démarche lourde et lente. Avance sur 100 frames, recule sur 100 frames (boucle aller-retour). Mini-flash orange au sol à chaque impact des pieds.',
    phases: [
      { from: 0, to: 100, label: 'Avancée' },
      { from: 100, to: 200, label: 'Retour' },
    ],
    update(frame, totalFrames, ctx){
      const opts = {};
      const fx = [];
      const half = 100;
      let p;
      if(frame < half){
        p = frame / half;
        opts.bodyShift = p * 40;
      } else {
        p = (frame - half) / half;
        opts.bodyShift = (1 - p) * 40;
      }
      // Petite oscillation
      opts.bodyShift += Math.sin(frame * 0.2) * 0.5;
      // Pas tous les 15 frames
      if(frame % 15 === 0 && frame > 5){
        fx.push({ type: 'ash', dx: -4, dy: 12, count: 3 });
        fx.push({ type: 'ash', dx: 4, dy: 12, count: 3 });
        fx.push({ type: 'sparks', dx: 0, dy: 12, count: 2 });
      }
      return { opts, fx };
    },
  },

  idle: {
    id: 'idle',
    name: 'IDLE',
    icon: '◇',
    duration: 9999,
    looping: true,
    description: 'Pose au repos. Bobbing de respiration, pulse permanent des fissures incandescentes, montée occasionnelle de cendres depuis les épaules.',
    phases: [
      { from: 0, to: 9999, label: 'Loop' },
    ],
    update(frame){
      const opts = {};
      const fx = [];
      if(frame % 24 === 0){
        fx.push({ type: 'ash', dx: 0, dy: -22, count: 1 });
      }
      return { opts, fx };
    },
  },
};

/**
 * Métadonnées du sprite (taille, point d'origine, etc.)
 */
export const meta = {
  width: 30,         // bounding box approximative
  height: 50,
  groundOffsetY: 0,  // sy = position des pieds (pas d'offset)
};

export default { draw, attacks, palette, meta };
