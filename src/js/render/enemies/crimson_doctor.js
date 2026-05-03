// src/js/render/enemies/crimson_doctor.js
// Docteur de Sang — support healer.
// Silhouette grêle, masque chirurgical taché, blouse blanche-rouge tachée,
// scalpel en main, seringues dans la ceinture.

export const palette = {
  skin:        '#a87858',
  skinDark:    '#5a3818',
  skinLight:   '#c89878',
  coatWhite:   '#d8c8a8',  // blouse jaunie/sale, pas blanc pur
  coatLight:   '#e8d8b8',
  coatDark:    '#a89878',
  coatStain:   '#7a3838',  // taches vieilles
  bloodStain:  '#8a1818',
  bloodFresh:  '#c82828',
  bloodBright: '#e84040',
  mask:        '#c8b898',
  maskStrap:   '#7a6850',
  maskBlood:   '#8a3838',
  pants:       '#3a2818',
  scalpel:     '#9a8868',
  scalpelEdge: '#e8d8b8',
  scalpelBlood:'#5a0808',
  syringeGlass:'#a8c8d8',
  syringeContent:'#a02828',
  syringeNeedle:'#7a6850',
  bronze:      '#c8a040',
  healAura:    'rgba(200,40,40,0.4)',
  healPart:    '#ff8080',
  shadow:      'rgba(20,5,5,0.7)',
};

export function draw(ctx, sx, sy, t, opts){
  opts = opts || {};
  const p = palette;
  const float = Math.sin(t * 0.05) * 0.6;
  const breathe = Math.sin(t * 0.04) * 0.3;
  sx = Math.round(sx + (opts.bodyShift || 0));
  sy = Math.round(sy + float);

  const armRaise = opts.armRaise !== undefined ? opts.armRaise : -0.2;
  const healing = opts.healing || 0;

  // Shadow
  ctx.fillStyle = p.shadow;
  ctx.beginPath();
  ctx.ellipse(sx, sy + 7, 11, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Heal aura (when healing)
  if(healing > 0){
    for(let i = 0; i < 3; i++){
      const r = 18 + i * 5 + Math.sin(t * 0.12 + i) * 2;
      const a = healing * 0.22 * (1 - i * 0.3);
      ctx.fillStyle = `rgba(255,128,128,${a})`;
      ctx.beginPath();
      ctx.ellipse(sx, sy - 12, r, r * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Soft red glow
  const glow = 0.3 + Math.sin(t * 0.07) * 0.1;
  const bg = ctx.createRadialGradient(sx, sy - 14, 4, sx, sy - 14, 26);
  bg.addColorStop(0, `rgba(122,56,56,${glow * 0.5})`);
  bg.addColorStop(1, 'rgba(122,56,56,0)');
  ctx.fillStyle = bg;
  ctx.fillRect(sx - 26, sy - 38, 52, 50);

  // Legs (slim pants)
  ctx.fillStyle = p.pants;
  ctx.fillRect(sx - 5, sy - 1, 4, 9);
  ctx.fillRect(sx + 1, sy - 1, 4, 9);
  ctx.fillStyle = '#1a0a05';
  ctx.fillRect(sx - 5, sy - 1, 1, 9);

  // Boots
  ctx.fillStyle = '#000';
  ctx.fillRect(sx - 6, sy + 8, 5, 3);
  ctx.fillRect(sx + 1, sy + 8, 5, 3);

  // === COAT (blouse de docteur, descend jusqu'aux genoux) ===
  ctx.fillStyle = p.coatDark;
  ctx.beginPath();
  ctx.moveTo(sx - 9, sy + 5);
  ctx.lineTo(sx + 9, sy + 5);
  ctx.lineTo(sx + 8, sy - 18 + breathe);
  ctx.lineTo(sx - 8, sy - 18 + breathe);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = p.coatWhite;
  ctx.fillRect(sx - 8, sy - 18 + breathe, 16, 23);
  ctx.fillStyle = p.coatLight;
  ctx.fillRect(sx - 8, sy - 18 + breathe, 2, 23);

  // === COAT BLOOD STAINS (signature) ===
  drawCoatStain(ctx, sx - 4, sy - 8 + breathe, 5, p);
  drawCoatStain(ctx, sx + 3, sy - 4 + breathe, 4, p);
  drawCoatStain(ctx, sx - 6, sy + 1 + breathe, 3, p);
  drawCoatStain(ctx, sx + 5, sy - 11 + breathe, 3, p);
  drawCoatStain(ctx, sx, sy + 3 + breathe, 4, p);
  // Splatter (tiny dots)
  ctx.fillStyle = p.bloodStain;
  ctx.fillRect(sx - 7, sy - 14 + breathe, 1, 1);
  ctx.fillRect(sx + 7, sy - 8 + breathe, 1, 1);
  ctx.fillRect(sx - 3, sy - 16 + breathe, 1, 1);
  // Fresh drip
  if(t % 100 < 50){
    const len = Math.floor((t % 50) / 12);
    ctx.fillStyle = p.bloodBright;
    ctx.fillRect(sx + 2, sy - 6 + breathe, 1, 1 + len);
  }

  // Buttons (vertical line)
  ctx.fillStyle = p.bronze;
  ctx.fillRect(sx, sy - 14 + breathe, 1, 1);
  ctx.fillRect(sx, sy - 9 + breathe, 1, 1);
  ctx.fillRect(sx, sy - 4 + breathe, 1, 1);
  ctx.fillRect(sx, sy + 1 + breathe, 1, 1);

  // === BELT WITH SYRINGES ===
  ctx.fillStyle = '#000';
  ctx.fillRect(sx - 8, sy - 4 + breathe, 16, 2);
  // 3 syringes hanging from belt
  drawSyringe(ctx, sx - 5, sy - 2 + breathe, t, 0, p);
  drawSyringe(ctx, sx, sy - 2 + breathe, t, 1, p);
  drawSyringe(ctx, sx + 5, sy - 2 + breathe, t, 2, p);

  // === ARMS (skinny) ===
  // Left arm holding the scalpel
  ctx.save();
  ctx.translate(sx - 8, sy - 17 + breathe);
  ctx.rotate(armRaise);
  ctx.fillStyle = p.coatDark;
  ctx.fillRect(-2, 0, 4, 13);
  ctx.fillStyle = p.coatWhite;
  ctx.fillRect(-2, 0, 1, 13);
  // Blood stains on sleeve
  ctx.fillStyle = p.bloodStain;
  ctx.fillRect(0, 6, 2, 1);
  ctx.fillRect(-1, 10, 2, 2);
  // Hand (bare, pale)
  ctx.fillStyle = p.skinDark;
  ctx.fillRect(-2, 13, 4, 4);
  ctx.fillStyle = p.skin;
  ctx.fillRect(-2, 13, 2, 3);
  // === SCALPEL ===
  drawScalpel(ctx, 0, 17, t, p);
  ctx.restore();

  // Right arm (rest, sometimes raised when healing)
  ctx.save();
  ctx.translate(sx + 8, sy - 17 + breathe);
  ctx.rotate(-(opts.armRaise2 || 0));
  ctx.fillStyle = p.coatDark;
  ctx.fillRect(-2, 0, 4, 13);
  ctx.fillStyle = p.coatWhite;
  ctx.fillRect(0, 0, 1, 13);
  ctx.fillStyle = p.bloodStain;
  ctx.fillRect(-1, 4, 2, 1);
  // Hand
  ctx.fillStyle = p.skinDark;
  ctx.fillRect(-2, 13, 4, 4);
  ctx.fillStyle = p.skin;
  ctx.fillRect(-2, 13, 2, 3);
  // Glowing healing potion in hand (when healing)
  if(healing > 0){
    drawHealPotion(ctx, 0, 16, t, healing, p);
  }
  ctx.restore();

  // === HEAD ===
  ctx.fillStyle = p.skinDark;
  ctx.fillRect(sx - 5, sy - 28 + breathe, 10, 10);
  ctx.fillStyle = p.skin;
  ctx.fillRect(sx - 5, sy - 28 + breathe, 10, 8);
  ctx.fillStyle = p.skinLight;
  ctx.fillRect(sx - 5, sy - 28 + breathe, 2, 10);

  // === SURGICAL MASK (signature) ===
  ctx.fillStyle = p.maskStrap;
  ctx.fillRect(sx - 5, sy - 23 + breathe, 10, 4);
  ctx.fillStyle = p.mask;
  ctx.fillRect(sx - 5, sy - 23 + breathe, 10, 3);
  // Mask blood stain (defining detail)
  ctx.fillStyle = p.maskBlood;
  ctx.fillRect(sx - 2, sy - 22 + breathe, 4, 2);
  ctx.fillStyle = p.bloodFresh;
  ctx.fillRect(sx - 1, sy - 22 + breathe, 2, 1);
  // Strap going around the head
  ctx.fillStyle = p.maskStrap;
  ctx.fillRect(sx - 6, sy - 22 + breathe, 1, 2);
  ctx.fillRect(sx + 5, sy - 22 + breathe, 1, 2);

  // Eyes (creepy, calm, behind glasses)
  ctx.fillStyle = '#000';
  ctx.fillRect(sx - 4, sy - 26 + breathe, 3, 2);
  ctx.fillRect(sx + 1, sy - 26 + breathe, 3, 2);
  // Glasses frames
  ctx.strokeStyle = p.maskStrap;
  ctx.lineWidth = 0.5;
  ctx.strokeRect(sx - 5, sy - 26 + breathe, 4, 3);
  ctx.strokeRect(sx + 1, sy - 26 + breathe, 4, 3);
  ctx.beginPath();
  ctx.moveTo(sx - 1, sy - 25 + breathe); ctx.lineTo(sx + 1, sy - 25 + breathe);
  ctx.stroke();
  // Eye glint
  const eyePulse = 0.92 + Math.sin(t * 0.08) * 0.08;
  ctx.fillStyle = `rgba(216,200,128,${eyePulse * 0.85})`;
  ctx.fillRect(sx - 4, sy - 25 + breathe, 1, 1);
  ctx.fillRect(sx + 2, sy - 25 + breathe, 1, 1);

  // Hair / cap
  ctx.fillStyle = p.coatLight;
  ctx.fillRect(sx - 5, sy - 28 + breathe, 10, 2);
  ctx.fillStyle = p.bloodStain;
  ctx.fillRect(sx + 1, sy - 27 + breathe, 2, 1);
}

function drawCoatStain(ctx, lx, ly, scale, p){
  ctx.fillStyle = p.coatStain;
  ctx.fillRect(lx - scale / 2, ly - scale / 3, scale, scale * 0.7);
  // Drips
  ctx.fillRect(lx, ly + scale * 0.4, 1, scale * 0.4);
  // Darker center
  ctx.fillStyle = p.bloodStain;
  ctx.fillRect(lx - 1, ly - 1, 2, 2);
}

function drawSyringe(ctx, lx, ly, t, idx, p){
  const wobble = Math.sin(t * 0.1 + idx) * 0.3;
  ctx.save();
  ctx.translate(lx, ly);
  ctx.rotate(wobble);
  // Plunger top
  ctx.fillStyle = p.maskStrap;
  ctx.fillRect(-1, 0, 2, 1);
  // Glass body
  ctx.fillStyle = p.syringeGlass;
  ctx.fillRect(-1, 1, 2, 4);
  // Liquid (red)
  ctx.fillStyle = p.syringeContent;
  ctx.fillRect(-1, 2, 2, 3);
  // Highlight
  ctx.fillStyle = '#fff';
  ctx.fillRect(-1, 1, 0.5, 4);
  // Needle
  ctx.fillStyle = p.syringeNeedle;
  ctx.fillRect(-0.5, 5, 1, 2);
  ctx.restore();
}

function drawScalpel(ctx, lx, ly, t, p){
  // Handle
  ctx.fillStyle = p.maskStrap;
  ctx.fillRect(lx - 0.5, ly - 4, 1, 4);
  // Blade
  ctx.fillStyle = p.scalpel;
  ctx.beginPath();
  ctx.moveTo(lx - 1, ly - 4);
  ctx.lineTo(lx + 1, ly - 4);
  ctx.lineTo(lx + 0.5, ly - 8);
  ctx.lineTo(lx - 0.5, ly - 8);
  ctx.closePath();
  ctx.fill();
  // Edge
  ctx.fillStyle = p.scalpelEdge;
  ctx.fillRect(lx - 1, ly - 8, 0.5, 4);
  // Blood
  ctx.fillStyle = p.scalpelBlood;
  ctx.fillRect(lx - 0.5, ly - 6, 1, 2);
  ctx.fillStyle = p.bloodFresh;
  ctx.fillRect(lx - 0.5, ly - 7, 0.5, 1);
}

function drawHealPotion(ctx, lx, ly, t, intensity, p){
  // Halo
  const grad = ctx.createRadialGradient(lx, ly, 0, lx, ly, 6 * intensity);
  grad.addColorStop(0, `rgba(255,128,128,${intensity * 0.85})`);
  grad.addColorStop(0.4, `rgba(200,40,40,${intensity * 0.6})`);
  grad.addColorStop(1, 'rgba(138,24,24,0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(lx, ly, 6 * intensity, 0, Math.PI * 2);
  ctx.fill();
  // Bottle
  ctx.fillStyle = p.syringeGlass;
  ctx.fillRect(lx - 1.5, ly - 2, 3, 4);
  // Red liquid
  ctx.fillStyle = p.bloodFresh;
  ctx.fillRect(lx - 1.5, ly - 1, 3, 3);
  // Bright core
  ctx.fillStyle = `rgba(255,200,200,${intensity})`;
  ctx.fillRect(lx - 0.5, ly - 0.5, 1, 1);
  // Cork
  ctx.fillStyle = p.maskStrap;
  ctx.fillRect(lx - 1, ly - 3, 2, 1);
}

export const attacks = {
  idle: {
    id: 'idle', name: 'IDLE', icon: '◇',
    duration: 9999, looping: true,
    description: 'Posture observatrice, masque chirurgical taché. Examine ses alliés blessés.',
    phases: [{ from: 0, to: 9999, label: 'Loop' }],
    update(frame){
      const fx = [];
      if(frame % 36 === 0){
        fx.push({ type: 'ash', dx: 0, dy: -8, count: 1, color: '#7a3838' });
      }
      return { opts: {}, fx };
    },
  },

  slash: {
    id: 'slash', name: 'SCALPEL', icon: '🔪',
    duration: 60,
    description: 'Frappe scalpel rapide. Mêlée range 1. 50% lifesteal (rare).',
    phases: [
      { from: 0, to: 18, label: 'Wind-up' },
      { from: 18, to: 26, label: 'Strike' },
      { from: 26, to: 60, label: 'Recovery' },
    ],
    update(frame){
      const opts = {};
      const fx = [];
      if(frame < 18){
        const p = frame / 18;
        opts.armRaise = -p * 0.9;
      } else if(frame < 26){
        const p = (frame - 18) / 8;
        opts.armRaise = -0.9 + p * 1.4;
        if(frame === 18){
          fx.push({ type: 'sparks', dx: -14, dy: -6, count: 8, color: '#c82828' });
          fx.push({ type: 'flash', dx: -14, dy: -6, color: '#e84040', size: 10 });
        }
      } else {
        const p = (frame - 26) / 34;
        opts.armRaise = 0.5 - p * 0.5;
      }
      return { opts, fx };
    },
  },

  healAllies: {
    id: 'healAllies', name: 'HEAL ALLY', icon: '✚',
    duration: 80,
    description: 'Lance une fiole healing à un allié blessé adjacent (heal 8 PV). Au lieu d\'attaquer.',
    phases: [
      { from: 0, to: 25, label: 'Prepare' },
      { from: 25, to: 35, label: 'Throw' },
      { from: 35, to: 80, label: 'Recovery' },
    ],
    projectile: {
      spawnFrame: 25,
      spawnOffset: { dx: 8, dy: -8 },
      travelFrames: 16,
      arc: 6,
      drawProjectile(ctx, x, y, vx, vy, t){
        // Heal vial flying with sparkles
        const wob = Math.sin(t * 0.4) * 0.5;
        // Halo (red-pink, healing)
        const grad = ctx.createRadialGradient(x, y, 0, x, y, 12);
        grad.addColorStop(0, 'rgba(255,200,200,0.9)');
        grad.addColorStop(0.4, 'rgba(255,128,128,0.7)');
        grad.addColorStop(1, 'rgba(200,40,40,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(x - 12, y - 12, 24, 24);
        // Vial
        ctx.fillStyle = '#a8c8d8';
        ctx.fillRect(x - 1.5 + wob, y - 3, 3, 6);
        // Liquid
        ctx.fillStyle = '#c82828';
        ctx.fillRect(x - 1.5 + wob, y - 1, 3, 4);
        // Bright core
        ctx.fillStyle = '#fff';
        ctx.fillRect(Math.round(x + wob - 0.5), Math.round(y), 1, 1);
        // Sparkles (golden)
        for(let i = 0; i < 4; i++){
          const angle = (i / 4) * Math.PI * 2 + t * 0.3;
          const r = 5;
          const sx2 = x + Math.cos(angle) * r;
          const sy2 = y + Math.sin(angle) * r;
          ctx.fillStyle = '#ffe060';
          ctx.fillRect(Math.round(sx2), Math.round(sy2), 1, 1);
        }
      },
      trailColor: '#ff8080',
      onHit: {
        flash: '#fff', flashSize: 18,
        sparks: 14, color: '#ff8080',
        shockwave: '#c82828', shockwaveRadius: 28,
        ash: 6, color: '#ffe060',
      },
    },
    update(frame){
      const opts = {};
      const fx = [];
      if(frame < 25){
        const p = frame / 25;
        opts.armRaise2 = -p * 0.8;
        opts.healing = p;
        if(frame % 4 === 0){
          fx.push({ type: 'sparks', dx: 8, dy: -8, count: 1, color: '#ff8080' });
        }
      } else if(frame < 35){
        opts.armRaise2 = -0.8 + (frame - 25) / 10 * 1.0;
        opts.healing = Math.max(0, 1 - (frame - 25) / 10);
        if(frame === 25){
          fx.push({ type: 'flash', dx: 8, dy: -8, color: '#fff', size: 14 });
          fx.push({ type: 'sparks', dx: 8, dy: -8, count: 10, color: '#ff8080' });
          fx.push({
            type: 'projectile',
            dx: 8, dy: -8,
            useAttackProjectile: 'healAllies',
          });
        }
      } else {
        const p = (frame - 35) / 45;
        opts.armRaise2 = 0.2 - p * 0.2;
      }
      return { opts, fx };
    },
  },

  walk: {
    id: 'walk', name: 'WALK', icon: '🏃',
    duration: 180,
    looping: true,
    description: 'Marche prudente, observe les alliés. Aller-retour 90/90.',
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
        opts.bodyShift = p * 32;
      } else {
        p = (frame - half) / half;
        opts.bodyShift = (1 - p) * 32;
      }
      opts.bodyShift += Math.sin(frame * 0.18) * 0.4;
      if(frame % 16 === 0){
        fx.push({ type: 'ash', dx: 0, dy: 11, count: 1, color: '#7a3838' });
      }
      return { opts, fx };
    },
  },
};

export const meta = { width: 22, height: 38, groundOffsetY: 0 };
export default { draw, attacks, palette, meta };
