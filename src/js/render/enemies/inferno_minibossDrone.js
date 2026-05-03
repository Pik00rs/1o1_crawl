// src/js/render/enemies/inferno_minibossDrone.js
// Drone-Sentinelle Igni-7 — MINIBOSS.
// Flotte (1.3x hero), boîtier hexagonal métal, 4 buses orientables qui crachent du feu,
// bouclier énergétique CYAN-BLEU pulsant (contraste avec le reste rouge),
// œil-caméra rouge central qui scanne.

export const palette = {
  hull:        '#3a2820',
  hullDark:    '#1a0f08',
  hullLight:   '#5a3a28',
  hullPlate:   '#7a5028',
  bolt:        '#1a0a05',
  vent:        '#2a1410',
  ventGlow:    '#ff6f1a',
  shield:      '#4fc3f7',  // CYAN — contraste fort
  shieldHot:   '#aee6ff',
  shieldCore:  '#e0f5ff',
  eye:         '#ff3015',
  eyeHot:      '#ff8a4d',
  eyeCore:     '#ffe080',
  flame:       '#ff6f1a',
  flameHot:    '#ffb347',
  shadow:      'rgba(0,0,0,0.6)',
};

export function draw(ctx, sx, sy, t, opts){
  opts = opts || {};
  const p = palette;
  // Le drone flotte donc oscille verticalement davantage que les autres
  const float = Math.sin(t * 0.04) * 1.5;
  const sway = Math.sin(t * 0.025 + 1.3) * 1;
  sx = Math.round(sx + (opts.bodyShift || 0) + sway);
  sy = Math.round(sy + float);

  // Hover offset : le drone flotte ~12px au-dessus du sol
  const HOVER = 12;

  const shieldIntensity = opts.shieldIntensity !== undefined ? opts.shieldIntensity : 0.7;
  const eyeFocus = opts.eyeFocus || 0; // 0 = scan, 1 = locked
  const noseDownTilt = opts.noseDownTilt || 0; // pour flameWave
  const flameOut = opts.flameOut || 0; // 0..1, intensity des cônes de feu

  // Shadow (au sol, pas sous le drone direct)
  ctx.fillStyle = p.shadow;
  ctx.beginPath();
  ctx.ellipse(sx, sy + 8, 16, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Hover trail under (jet de stabilisation)
  for(let i = 0; i < 3; i++){
    const a = 0.15 - i * 0.05;
    ctx.fillStyle = `rgba(255,107,26,${a})`;
    ctx.fillRect(sx - 8 + i * 2, sy - HOVER + 12 + i * 2, 16 - i * 4, 1);
  }

  ctx.save();
  ctx.translate(sx, sy - HOVER);
  ctx.rotate(noseDownTilt);

  // === SHIELD (couche extérieure, derrière le hull) ===
  if(shieldIntensity > 0){
    // Hexagonal shield bubble
    const shieldRadius = 22;
    const shieldPulse = 0.85 + Math.sin(t * 0.12) * 0.15;
    const sa = shieldIntensity * shieldPulse;
    // Hex outline
    ctx.strokeStyle = `rgba(79,195,247,${sa * 0.7})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    for(let i = 0; i < 6; i++){
      const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
      const x = Math.cos(angle) * shieldRadius;
      const y = Math.sin(angle) * shieldRadius;
      if(i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
    // Inner hex thinner
    ctx.strokeStyle = `rgba(174,230,255,${sa})`;
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    for(let i = 0; i < 6; i++){
      const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
      const x = Math.cos(angle) * (shieldRadius - 1.5);
      const y = Math.sin(angle) * (shieldRadius - 1.5);
      if(i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();

    // Hex grid pattern faintly visible inside shield
    ctx.strokeStyle = `rgba(174,230,255,${sa * 0.25})`;
    ctx.lineWidth = 0.4;
    ctx.beginPath();
    for(let i = 0; i < 6; i++){
      const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(angle) * shieldRadius, Math.sin(angle) * shieldRadius);
    }
    ctx.stroke();

    // Diffuse blue glow
    const grad = ctx.createRadialGradient(0, 0, 6, 0, 0, shieldRadius + 4);
    grad.addColorStop(0, `rgba(174,230,255,${sa * 0.15})`);
    grad.addColorStop(1, 'rgba(174,230,255,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(-shieldRadius - 4, -shieldRadius - 4, (shieldRadius + 4) * 2, (shieldRadius + 4) * 2);
  }

  // === HULL : hexagone central ===
  const hullR = 12;
  ctx.fillStyle = p.hullDark;
  ctx.beginPath();
  for(let i = 0; i < 6; i++){
    const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
    const x = Math.cos(angle) * (hullR + 1);
    const y = Math.sin(angle) * (hullR + 1);
    if(i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = p.hull;
  ctx.beginPath();
  for(let i = 0; i < 6; i++){
    const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
    const x = Math.cos(angle) * hullR;
    const y = Math.sin(angle) * hullR;
    if(i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();

  // Hull plates (3 panneaux sur le devant)
  ctx.fillStyle = p.hullLight;
  ctx.fillRect(-8, -4, 4, 8);
  ctx.fillRect(-2, -4, 4, 8);
  ctx.fillRect(4, -4, 4, 8);
  // Lignes entre plaques
  ctx.strokeStyle = p.hullDark;
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(-4, -4); ctx.lineTo(-4, 4);
  ctx.moveTo(2, -4); ctx.lineTo(2, 4);
  ctx.stroke();

  // Bolts
  ctx.fillStyle = p.bolt;
  for(const [x, y] of [[-9, -8], [9, -8], [-9, 8], [9, 8]]){
    ctx.beginPath();
    ctx.arc(x, y, 1, 0, Math.PI * 2);
    ctx.fill();
  }

  // === EYE / CAMERA centrale ===
  // Outer ring
  ctx.fillStyle = p.bolt;
  ctx.beginPath();
  ctx.arc(0, 0, 4, 0, Math.PI * 2);
  ctx.fill();
  // Inner lens
  const eyePulse = 0.85 + Math.sin(t * 0.1) * 0.15;
  const eyeColor = eyeFocus > 0 ? p.eyeCore : p.eye;
  ctx.fillStyle = eyeColor;
  ctx.beginPath();
  ctx.arc(0, 0, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = `rgba(255,138,77,${eyePulse})`;
  ctx.beginPath();
  ctx.arc(0, 0, 2, 0, Math.PI * 2);
  ctx.fill();
  // Pupil dot (offsetée par eye scan)
  const scanX = eyeFocus > 0 ? 0 : Math.sin(t * 0.06) * 1;
  const scanY = eyeFocus > 0 ? 0 : Math.cos(t * 0.06) * 0.5;
  ctx.fillStyle = '#fff';
  ctx.fillRect(Math.round(scanX) - 0.5, Math.round(scanY) - 0.5, 1.5, 1.5);

  // Halo around eye
  const eyeGrad = ctx.createRadialGradient(0, 0, 1, 0, 0, 8);
  eyeGrad.addColorStop(0, `rgba(255,48,21,${eyePulse * 0.6})`);
  eyeGrad.addColorStop(1, 'rgba(255,48,21,0)');
  ctx.fillStyle = eyeGrad;
  ctx.fillRect(-8, -8, 16, 16);

  // === 4 BUSES de feu (positions hexagonales, en haut+bas+côtés) ===
  const nozzlePositions = [
    { x: 0, y: -hullR - 1, angle: -Math.PI / 2 },   // top
    { x: hullR + 1, y: 0, angle: 0 },                // right
    { x: 0, y: hullR + 1, angle: Math.PI / 2 },      // bottom
    { x: -hullR - 1, y: 0, angle: Math.PI },         // left
  ];

  for(const n of nozzlePositions){
    drawNozzle(ctx, n.x, n.y, n.angle, t, flameOut, p);
  }

  // === Antenna on top hull ===
  ctx.fillStyle = p.bolt;
  ctx.fillRect(-1, -hullR - 2, 2, 2);
  ctx.strokeStyle = p.eye;
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(0, -hullR - 2);
  ctx.lineTo(0, -hullR - 5);
  ctx.stroke();
  ctx.fillStyle = p.eyeCore;
  ctx.fillRect(-0.5, -hullR - 5, 1, 1);

  ctx.restore();

  // Drop ash from time to time (signal de chauffe)
  // Géré dans update.fx
}

function drawNozzle(ctx, lx, ly, angle, t, flameOut, p){
  ctx.save();
  ctx.translate(lx, ly);
  ctx.rotate(angle);
  // Nozzle body
  ctx.fillStyle = p.hullDark;
  ctx.fillRect(-2, -2, 4, 4);
  ctx.fillStyle = p.hullPlate;
  ctx.fillRect(-2, -2, 4, 1);
  // Inner aperture (orange when armed)
  const aperturePulse = 0.6 + Math.sin(t * 0.1) * 0.2 + flameOut * 0.4;
  ctx.fillStyle = `rgba(255,107,26,${aperturePulse})`;
  ctx.fillRect(-1, -1, 2, 2);
  ctx.fillStyle = `rgba(255,224,128,${aperturePulse})`;
  ctx.fillRect(-0.5, -0.5, 1, 1);
  // Flame jet
  if(flameOut > 0){
    const len = 16 * flameOut;
    const wid = 6 * flameOut;
    // Outer flame
    ctx.fillStyle = `rgba(255,107,26,${0.7 * flameOut})`;
    ctx.beginPath();
    ctx.moveTo(2, -wid / 2);
    ctx.lineTo(len, 0);
    ctx.lineTo(2, wid / 2);
    ctx.closePath();
    ctx.fill();
    // Inner flame
    ctx.fillStyle = `rgba(255,179,71,${0.85 * flameOut})`;
    ctx.beginPath();
    ctx.moveTo(2, -wid / 3);
    ctx.lineTo(len * 0.75, 0);
    ctx.lineTo(2, wid / 3);
    ctx.closePath();
    ctx.fill();
    // Core
    ctx.fillStyle = `rgba(255,224,128,${flameOut})`;
    ctx.beginPath();
    ctx.moveTo(2, -wid / 5);
    ctx.lineTo(len * 0.5, 0);
    ctx.lineTo(2, wid / 5);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

export const attacks = {
  idle: {
    id: 'idle', name: 'IDLE', icon: '◇',
    duration: 9999, looping: true,
    description: 'Patrouille flottante. Bouclier cyan stable, œil-caméra qui scanne en cercles, légère oscillation.',
    phases: [{ from: 0, to: 9999, label: 'Patrol' }],
    update(frame){
      const fx = [];
      if(frame % 24 === 0){
        fx.push({ type: 'ash', dx: 0, dy: -2, count: 1, color: '#ffb347' });
      }
      return { opts: { shieldIntensity: 0.7 }, fx };
    },
  },

  flameWave: {
    id: 'flameWave', name: 'FLAME WAVE', icon: '🌊',
    duration: 90,
    description: 'Cône de feu (3 cases) tous les 4 tours. AOE. Les 4 buses s\'orientent et libèrent un torrent de feu coordonné.',
    phases: [
      { from: 0, to: 25, label: 'Charge' },
      { from: 25, to: 60, label: 'Burst' },
      { from: 60, to: 90, label: 'Cooldown' },
    ],
    update(frame){
      const opts = { shieldIntensity: 0.5 };
      const fx = [];
      if(frame < 25){
        const p = frame / 25;
        opts.eyeFocus = p;
        opts.noseDownTilt = p * 0.1;
        if(frame % 4 === 0){
          fx.push({ type: 'sparks', dx: 0, dy: 0, count: 2, color: '#ffb347' });
        }
      } else if(frame < 60){
        const p = (frame - 25) / 35;
        opts.eyeFocus = 1;
        opts.noseDownTilt = 0.1 - p * 0.1;
        opts.flameOut = Math.sin(p * Math.PI); // grossit puis rétrécit
        if(frame === 25){
          fx.push({ type: 'shockwave', dx: 0, dy: -10, color: '#ff6f1a', maxRadius: 30 });
          fx.push({ type: 'flash', dx: 0, dy: -10, color: '#ffe080', size: 18 });
        }
        if(frame % 4 === 0){
          // Embers from each nozzle
          for(let i = 0; i < 4; i++){
            const a = (i / 4) * Math.PI * 2;
            fx.push({
              type: 'ash',
              dx: Math.cos(a) * 26,
              dy: -10 + Math.sin(a) * 26,
              count: 1,
              color: '#ffb347',
            });
          }
        }
      } else {
        const p = (frame - 60) / 30;
        opts.eyeFocus = 1 - p;
        opts.flameOut = 0;
      }
      return { opts, fx };
    },
  },

  shieldRecharge: {
    id: 'shieldRecharge', name: 'SHIELD RECHARGE', icon: '🛡',
    duration: 70,
    description: 'Bouclier 30 PV qui régénère hors combat. Le drone se met en défense, hexagones bleus s\'illuminent et se recomposent.',
    phases: [
      { from: 0, to: 20, label: 'Init' },
      { from: 20, to: 50, label: 'Recharge' },
      { from: 50, to: 70, label: 'Stabilize' },
    ],
    update(frame){
      const opts = {};
      const fx = [];
      if(frame < 20){
        const p = frame / 20;
        opts.shieldIntensity = 0.3 + p * 0.7;
        if(frame === 0){
          fx.push({ type: 'flash', dx: 0, dy: -10, color: '#aee6ff', size: 24 });
          fx.push({ type: 'shockwave', dx: 0, dy: -10, color: '#4fc3f7', maxRadius: 36 });
        }
      } else if(frame < 50){
        opts.shieldIntensity = 1 + Math.sin(frame * 0.25) * 0.15;
        if(frame % 5 === 0){
          // Bursts of cyan particles converging on the drone
          const angle = Math.random() * Math.PI * 2;
          fx.push({
            type: 'sparks',
            dx: Math.cos(angle) * 24,
            dy: -10 + Math.sin(angle) * 12,
            count: 1,
            color: '#aee6ff',
          });
        }
      } else {
        const p = (frame - 50) / 20;
        opts.shieldIntensity = 1 - p * 0.3;
      }
      return { opts, fx };
    },
  },
};

export const meta = { width: 50, height: 50, groundOffsetY: 0 };
export default { draw, attacks, palette, meta };
