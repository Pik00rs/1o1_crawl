// src/js/render/enemies/crimson_boss.js
// Champion du Sang — BOSS final Crimson.
// Géant 1.5x torse nu avec scarifications rituelles dorées (longues balafres),
// énorme hache double (deux têtes), couronne de crocs sur la tête,
// CŒUR DE SANG sur le poitrail (orbe rouge sang ardent — 5e élément du quintet :
// feu rouge / glace bleue / poison violet / vide cosmique / SANG ardent rouge-or).
// Gantelets dorés.

export const palette = {
  skin:        '#a87858',
  skinDark:    '#5a3818',
  skinLight:   '#c89878',
  // Scarifications dorées (signature)
  scarGold:    '#c8a040',
  scarGoldHi:  '#ffe060',
  scarGoldDk:  '#7a5818',
  // Sang
  blood:       '#8a1818',
  bloodDark:   '#4a0808',
  bloodFresh:  '#c82828',
  bloodBright: '#e84040',
  // Bronze / or
  bronze:      '#c8a040',
  bronzeLight: '#ffe060',
  bronzeDark:  '#7a5818',
  bronzeHot:   '#e8c860',
  // Cuir
  belt:        '#3a1a08',
  beltDark:    '#1a0a05',
  beltLight:   '#5a2818',
  pants:       '#1a0a05',
  // Hache double
  axeHaft:     '#3a1a08',
  axeHaftLt:   '#5a3018',
  axeHead:     '#5a4828',
  axeHeadEdge: '#9a8868',
  axeHeadHi:   '#d8c8a0',
  axeHeadDk:   '#2a1808',
  axeBlood:    '#4a0808',
  // Couronne de crocs
  fang:        '#c8b898',
  fangDark:    '#7a6850',
  fangBlood:   '#5a0808',
  // Cœur de sang
  heartRing:    '#3a0505',
  heartCore:    '#000000',
  heartRed:     '#c82828',
  heartHot:     '#ff4040',
  heartGold:    '#ffe060',
  heartStar:    '#ffffff',
  shadow:       'rgba(20,5,5,0.95)',
};

export function draw(ctx, sx, sy, t, opts){
  opts = opts || {};
  const p = palette;
  const breathe = Math.sin(t * 0.025) * 0.6;
  const sway = Math.sin(t * 0.02 + 1.0) * 0.5;
  sx = Math.round(sx + (opts.bodyShift || 0) + sway);
  sy = Math.round(sy + Math.sin(t * 0.03) * 0.4);

  const axeRaise = opts.axeRaise || 0;
  const heartFlare = opts.heartFlare || 0;
  const rampUp = opts.rampUp || 0; // aura rampUpDamage
  const phase2 = opts.phase2 || 0; // 33% HP — spawn butchers

  // === MASSIVE SHADOW ===
  ctx.fillStyle = p.shadow;
  ctx.beginPath();
  ctx.ellipse(sx, sy + 14, 24, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  // === OUTER BLOOD-GOLD GLOW (large, signature) ===
  const outerGlow = 0.65 + heartFlare * 0.4 + rampUp * 0.4 + Math.sin(t * 0.05) * 0.15;
  const og = ctx.createRadialGradient(sx, sy - 22, 8, sx, sy - 22, 70);
  og.addColorStop(0, `rgba(232,64,64,${outerGlow * 0.45})`);
  og.addColorStop(0.3, `rgba(200,40,40,${outerGlow * 0.4})`);
  og.addColorStop(0.7, `rgba(200,160,64,${outerGlow * 0.3})`);
  og.addColorStop(1, 'rgba(74,8,8,0)');
  ctx.fillStyle = og;
  ctx.fillRect(sx - 70, sy - 90, 140, 130);

  // RampUp aura (when active — grows over time)
  if(rampUp > 0){
    for(let i = 0; i < 4; i++){
      const r = 28 + i * 8 + Math.sin(t * 0.08 + i) * 4;
      const a = rampUp * 0.18 * (1 - i * 0.22);
      ctx.fillStyle = `rgba(232,64,64,${a})`;
      ctx.beginPath();
      ctx.ellipse(sx, sy - 18, r, r * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Phase 2 ground blood (when summoning)
  if(phase2 > 0){
    for(let i = 0; i < 8; i++){
      const angle = (i / 8) * Math.PI * 2;
      const r = 20 + Math.sin(t * 0.1 + i) * 4;
      const bx = sx + Math.cos(angle) * r;
      const by = sy + 12 + Math.sin(angle) * r * 0.4;
      ctx.fillStyle = `rgba(138,24,24,${phase2 * 0.7})`;
      ctx.beginPath();
      ctx.ellipse(bx, by, 4, 1.5, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // === LEGS ===
  ctx.fillStyle = p.pants;
  ctx.fillRect(sx - 11, sy - 1, 9, 14);
  ctx.fillRect(sx + 2, sy - 1, 9, 14);
  ctx.fillStyle = p.beltLight;
  ctx.fillRect(sx - 11, sy - 1, 1, 14);

  // Boots (massive, gold-trimmed)
  ctx.fillStyle = '#000';
  ctx.fillRect(sx - 13, sy + 13, 11, 5);
  ctx.fillRect(sx + 2, sy + 13, 11, 5);
  // Gold trim on boots
  ctx.fillStyle = p.bronze;
  ctx.fillRect(sx - 13, sy + 17, 11, 1);
  ctx.fillRect(sx + 2, sy + 17, 11, 1);
  ctx.fillStyle = p.bronzeHot;
  ctx.fillRect(sx - 13, sy + 17, 11, 0.5);
  ctx.fillRect(sx + 2, sy + 17, 11, 0.5);

  // === LOINCLOTH (rags hanging from belt) ===
  ctx.fillStyle = p.beltDark;
  ctx.fillRect(sx - 12, sy - 4 + breathe, 24, 7);
  ctx.fillStyle = p.belt;
  ctx.fillRect(sx - 12, sy - 4 + breathe, 24, 5);
  // Strips of leather hanging
  for(let i = 0; i < 7; i++){
    const dx = sx - 12 + i * 4;
    const len = 3 + (i % 2) * 2;
    ctx.fillStyle = p.beltDark;
    ctx.fillRect(dx, sy + 1 + breathe, 3, len);
    ctx.fillStyle = p.belt;
    ctx.fillRect(dx, sy + 1 + breathe, 1, len);
  }

  // === BIG STUDDED BELT ===
  ctx.fillStyle = '#000';
  ctx.fillRect(sx - 13, sy - 7 + breathe, 26, 4);
  // Studs (big)
  for(let i = 0; i < 8; i++){
    const dx = sx - 12 + i * 3.5;
    ctx.fillStyle = p.bronze;
    ctx.fillRect(dx, sy - 6 + breathe, 1, 1);
    ctx.fillStyle = p.bronzeHot;
    ctx.fillRect(dx, sy - 5 + breathe, 1, 1);
  }
  // Big gold buckle (with engraved skull)
  ctx.fillStyle = p.bronzeDark;
  ctx.fillRect(sx - 4, sy - 7 + breathe, 8, 4);
  ctx.fillStyle = p.bronze;
  ctx.fillRect(sx - 4, sy - 7 + breathe, 8, 3);
  ctx.fillStyle = p.bronzeHot;
  ctx.fillRect(sx - 4, sy - 7 + breathe, 1, 4);
  // Skull on buckle
  ctx.fillStyle = '#000';
  ctx.fillRect(sx - 2, sy - 6 + breathe, 4, 2);
  ctx.fillStyle = p.bronzeHot;
  ctx.fillRect(sx - 1, sy - 5 + breathe, 1, 1);
  ctx.fillRect(sx + 1, sy - 5 + breathe, 1, 1);

  // === MASSIVE TORSO (bare, scarified) ===
  ctx.fillStyle = p.skinDark;
  ctx.fillRect(sx - 14, sy - 32 + breathe, 28, 25);
  ctx.fillStyle = p.skin;
  ctx.fillRect(sx - 14, sy - 32 + breathe, 28, 22);
  ctx.fillStyle = p.skinLight;
  ctx.fillRect(sx - 14, sy - 32 + breathe, 4, 25);

  // Pectorals (huge)
  ctx.fillStyle = p.skinDark;
  ctx.fillRect(sx - 12, sy - 30 + breathe, 11, 9);
  ctx.fillRect(sx + 1, sy - 30 + breathe, 11, 9);
  ctx.fillStyle = p.skin;
  ctx.fillRect(sx - 12, sy - 30 + breathe, 11, 7);
  ctx.fillRect(sx + 1, sy - 30 + breathe, 11, 7);
  // Cleavage line
  ctx.fillStyle = p.skinDark;
  ctx.fillRect(sx, sy - 30 + breathe, 0.5, 9);

  // Abs (8-pack)
  ctx.strokeStyle = p.skinDark;
  ctx.lineWidth = 0.7;
  ctx.beginPath();
  ctx.moveTo(sx - 9, sy - 21 + breathe); ctx.lineTo(sx + 9, sy - 21 + breathe);
  ctx.moveTo(sx - 8, sy - 17 + breathe); ctx.lineTo(sx + 8, sy - 17 + breathe);
  ctx.moveTo(sx - 7, sy - 13 + breathe); ctx.lineTo(sx + 7, sy - 13 + breathe);
  ctx.moveTo(sx, sy - 22 + breathe); ctx.lineTo(sx, sy - 8 + breathe);
  ctx.stroke();

  // === RITUAL SCARIFICATIONS (signature) — long golden gashes counting victories ===
  drawRitualScars(ctx, sx, sy, t, breathe, rampUp, p);

  // === BLOOD HEART on chest (focal point — 5e élément du quintet) ===
  drawBloodHeart(ctx, sx, sy - 18 + breathe, t, heartFlare, p);

  // === ARMS (massive, with golden gauntlets) ===
  // Left arm (front, holding axe)
  ctx.save();
  ctx.translate(sx - 16, sy - 31 + breathe);
  ctx.rotate(axeRaise * 0.6);
  // Bicep (huge, with scars)
  ctx.fillStyle = p.skinDark;
  ctx.fillRect(-4, 0, 7, 12);
  ctx.fillStyle = p.skin;
  ctx.fillRect(-4, 0, 1, 12);
  // Bicep scar (gold)
  ctx.fillStyle = p.scarGold;
  ctx.fillRect(-2, 4, 4, 0.5);
  ctx.fillStyle = p.scarGoldHi;
  ctx.fillRect(-1, 4, 2, 0.5);
  // Forearm
  ctx.fillStyle = p.skinDark;
  ctx.fillRect(-4, 12, 7, 8);
  ctx.fillStyle = p.skin;
  ctx.fillRect(-4, 12, 1, 8);
  // === GOLDEN GAUNTLET ===
  drawGoldGauntlet(ctx, 0, 20, t, p);
  ctx.restore();

  // Right arm (back, also holding axe)
  ctx.save();
  ctx.translate(sx + 16, sy - 31 + breathe);
  ctx.rotate(-axeRaise * 0.4);
  ctx.fillStyle = p.skinDark;
  ctx.fillRect(-4, 0, 7, 12);
  ctx.fillStyle = p.skin;
  ctx.fillRect(2, 0, 1, 12);
  // Bicep scar
  ctx.fillStyle = p.scarGold;
  ctx.fillRect(-2, 5, 4, 0.5);
  ctx.fillStyle = p.scarGoldHi;
  ctx.fillRect(-1, 5, 2, 0.5);
  // Forearm
  ctx.fillStyle = p.skinDark;
  ctx.fillRect(-4, 12, 7, 8);
  ctx.fillStyle = p.skin;
  ctx.fillRect(2, 12, 1, 8);
  drawGoldGauntlet(ctx, 0, 20, t + 30, p);
  ctx.restore();

  // === HEAD ===
  ctx.fillStyle = p.skinDark;
  ctx.fillRect(sx - 8, sy - 46 + breathe, 16, 14);
  ctx.fillStyle = p.skin;
  ctx.fillRect(sx - 8, sy - 46 + breathe, 16, 12);
  ctx.fillStyle = p.skinLight;
  ctx.fillRect(sx - 8, sy - 46 + breathe, 3, 14);

  // Beard (heavy, dark)
  ctx.fillStyle = p.belt;
  ctx.fillRect(sx - 6, sy - 38 + breathe, 12, 6);
  ctx.fillStyle = p.beltDark;
  ctx.fillRect(sx - 6, sy - 38 + breathe, 12, 3);
  // Beard braids
  ctx.fillStyle = p.beltDark;
  ctx.fillRect(sx - 4, sy - 33 + breathe, 1, 3);
  ctx.fillRect(sx + 3, sy - 33 + breathe, 1, 3);
  // Gold rings in beard
  ctx.fillStyle = p.bronze;
  ctx.fillRect(sx - 4, sy - 32 + breathe, 1, 1);
  ctx.fillRect(sx + 3, sy - 32 + breathe, 1, 1);

  // Face scars (gold ritual)
  ctx.fillStyle = p.scarGold;
  ctx.fillRect(sx - 6, sy - 41 + breathe, 1, 4);
  ctx.fillRect(sx + 5, sy - 41 + breathe, 1, 4);
  ctx.fillStyle = p.scarGoldHi;
  ctx.fillRect(sx - 6, sy - 41 + breathe, 0.5, 4);
  ctx.fillRect(sx + 5, sy - 41 + breathe, 0.5, 4);

  // Eyes (intense, blood-shot)
  ctx.fillStyle = '#000';
  ctx.fillRect(sx - 5, sy - 43 + breathe, 3, 2);
  ctx.fillRect(sx + 2, sy - 43 + breathe, 3, 2);
  // Red glow (always intense for the Champion)
  const eyePulse = 0.92 + Math.sin(t * 0.08) * 0.08;
  ctx.fillStyle = `rgba(232,64,64,${eyePulse})`;
  ctx.fillRect(sx - 4, sy - 43 + breathe, 2, 1);
  ctx.fillRect(sx + 3, sy - 43 + breathe, 2, 1);
  ctx.fillStyle = `rgba(255,200,200,${eyePulse * 0.85})`;
  ctx.fillRect(sx - 4, sy - 43 + breathe, 1, 0.5);
  ctx.fillRect(sx + 3, sy - 43 + breathe, 1, 0.5);

  // === FANG CROWN (signature) ===
  drawFangCrown(ctx, sx, sy - 46 + breathe, t, p);
}

function drawRitualScars(ctx, sx, sy, t, breathe, rampUp, p){
  // 5 long golden gashes counting kills
  // Each scar pulses with the rampUp aura
  const pulse = 0.7 + Math.sin(t * 0.08) * 0.2 + rampUp * 0.3;

  ctx.strokeStyle = `rgba(200,160,64,${pulse})`;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  // Diagonal across left pec
  ctx.moveTo(sx - 11, sy - 28 + breathe);
  ctx.lineTo(sx - 4, sy - 19 + breathe);
  // Diagonal across right pec
  ctx.moveTo(sx + 11, sy - 28 + breathe);
  ctx.lineTo(sx + 4, sy - 19 + breathe);
  // Vertical down center (above heart)
  ctx.moveTo(sx, sy - 26 + breathe);
  ctx.lineTo(sx, sy - 22 + breathe);
  // Horizontal across belly
  ctx.moveTo(sx - 9, sy - 13 + breathe);
  ctx.lineTo(sx - 3, sy - 13 + breathe);
  ctx.moveTo(sx + 3, sy - 13 + breathe);
  ctx.lineTo(sx + 9, sy - 13 + breathe);
  // Diagonal slash on abs
  ctx.moveTo(sx - 6, sy - 9 + breathe);
  ctx.lineTo(sx + 6, sy - 16 + breathe);
  ctx.stroke();

  // Bright highlights on the scars
  ctx.strokeStyle = `rgba(255,224,96,${pulse})`;
  ctx.lineWidth = 0.6;
  ctx.beginPath();
  ctx.moveTo(sx - 11, sy - 28 + breathe);
  ctx.lineTo(sx - 4, sy - 19 + breathe);
  ctx.moveTo(sx + 11, sy - 28 + breathe);
  ctx.lineTo(sx + 4, sy - 19 + breathe);
  ctx.moveTo(sx - 6, sy - 9 + breathe);
  ctx.lineTo(sx + 6, sy - 16 + breathe);
  ctx.stroke();

  // Tiny gold sparks on scars (rare)
  if((t * 5) % 60 < 6){
    const which = Math.floor((t / 12) % 6);
    const positions = [
      [sx - 8, sy - 23 + breathe],
      [sx + 8, sy - 23 + breathe],
      [sx, sy - 24 + breathe],
      [sx - 5, sy - 13 + breathe],
      [sx + 5, sy - 13 + breathe],
      [sx, sy - 12 + breathe],
    ];
    const [px, py] = positions[which];
    ctx.fillStyle = '#fff';
    ctx.fillRect(Math.round(px - 0.5), Math.round(py - 0.5), 1, 1);
  }
}

function drawBloodHeart(ctx, lx, ly, t, flare, p){
  // 5e élément du quintet : SANG ARDENT rouge-or-blanc
  // Ring extérieur (sang sombre)
  ctx.fillStyle = p.heartRing;
  ctx.beginPath();
  ctx.arc(lx, ly, 9, 0, Math.PI * 2);
  ctx.fill();
  // Ring intermédiaire (rouge plein)
  ctx.fillStyle = p.heartRed;
  ctx.beginPath();
  ctx.arc(lx, ly, 7.5, 0, Math.PI * 2);
  ctx.fill();
  // Inner (rouge chaud)
  ctx.fillStyle = p.heartHot;
  ctx.beginPath();
  ctx.arc(lx, ly, 6, 0, Math.PI * 2);
  ctx.fill();
  // Core (noir absolu — focal point)
  ctx.fillStyle = p.heartCore;
  ctx.beginPath();
  ctx.arc(lx, ly, 4, 0, Math.PI * 2);
  ctx.fill();

  // Étoiles tournantes (8 étoiles : or / rouge / blanc — chaque ennemi du biome a son cœur de boss)
  for(let i = 0; i < 8; i++){
    const angle = (i / 8) * Math.PI * 2 + t * 0.05;
    const r = 1.5 + (i % 3) * 1.0;
    const x = lx + Math.cos(angle) * r;
    const y = ly + Math.sin(angle) * r;
    const colorChoice = i % 3;
    let starColor;
    if(colorChoice === 0) starColor = p.heartGold;
    else if(colorChoice === 1) starColor = p.heartHot;
    else starColor = p.heartStar;
    const starPulse = 0.85 + Math.sin(t * 0.15 + i) * 0.15;
    ctx.fillStyle = `rgba(${hexToRgb(starColor)},${starPulse})`;
    ctx.fillRect(Math.round(x - 0.5), Math.round(y - 0.5), 1, 1);
  }

  // Cross beams (sang giclant du cœur)
  const beamPulse = 0.7 + Math.sin(t * 0.1) * 0.2 + flare * 0.4;
  ctx.strokeStyle = `rgba(232,64,64,${beamPulse * 0.8})`;
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(lx - 13, ly); ctx.lineTo(lx + 13, ly);
  ctx.moveTo(lx, ly - 13); ctx.lineTo(lx, ly + 13);
  ctx.moveTo(lx - 10, ly - 10); ctx.lineTo(lx + 10, ly + 10);
  ctx.moveTo(lx + 10, ly - 10); ctx.lineTo(lx - 10, ly + 10);
  ctx.stroke();
  // Gold secondary beams
  ctx.strokeStyle = `rgba(255,224,96,${beamPulse * 0.6})`;
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(lx - 11, ly - 5); ctx.lineTo(lx + 11, ly + 5);
  ctx.moveTo(lx + 11, ly - 5); ctx.lineTo(lx - 11, ly + 5);
  ctx.stroke();

  // Singularité centrale (point blanc-or pulsant)
  const corePulse = 0.85 + Math.sin(t * 0.2) * 0.15 + flare * 0.4;
  ctx.fillStyle = `rgba(255,255,200,${corePulse})`;
  ctx.fillRect(Math.round(lx - 0.5), Math.round(ly - 0.5), 1, 1);

  // Drip de sang qui tombe du cœur (constant)
  if(t % 80 < 50){
    const len = Math.floor((t % 50) / 10);
    ctx.fillStyle = p.bloodFresh;
    ctx.fillRect(Math.round(lx - 0.5), Math.round(ly + 9), 1, 1 + len);
    ctx.fillStyle = p.bloodBright;
    ctx.fillRect(Math.round(lx - 0.5), Math.round(ly + 9), 1, 1);
  }
}

function hexToRgb(hex){
  hex = hex.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `${r},${g},${b}`;
}

function drawFangCrown(ctx, lx, ly, t, p){
  // Bandeau de cuir noir
  ctx.fillStyle = p.beltDark;
  ctx.fillRect(lx - 9, ly - 1, 18, 3);
  ctx.fillStyle = p.belt;
  ctx.fillRect(lx - 9, ly - 1, 18, 1);

  // 7 fangs (crocs) plantés tout autour, pointes vers le haut
  const fangPositions = [
    { x: -8, h: 4, lean: -0.3 },
    { x: -5, h: 6, lean: -0.15 },
    { x: -2, h: 7, lean: -0.05 },
    { x: 1, h: 8, lean: 0 },     // largest center
    { x: 4, h: 6, lean: 0.1 },
    { x: 7, h: 5, lean: 0.2 },
    { x: 9, h: 3, lean: 0.35 },
  ];
  for(const f of fangPositions){
    drawFang(ctx, lx + f.x, ly - 1, f.h, f.lean, t, p);
  }

  // Gold ornaments on the band
  ctx.fillStyle = p.bronze;
  ctx.fillRect(lx - 7, ly, 1, 1);
  ctx.fillRect(lx + 6, ly, 1, 1);
  ctx.fillStyle = p.bronzeHot;
  ctx.fillRect(lx, ly + 1, 1, 1);

  // Central jewel
  ctx.fillStyle = p.heartRed;
  ctx.fillRect(lx - 1, ly - 1, 3, 2);
  ctx.fillStyle = p.heartHot;
  ctx.fillRect(lx, ly - 1, 1, 1);
  // Pulse
  const jewelPulse = 0.85 + Math.sin(t * 0.12) * 0.15;
  ctx.fillStyle = `rgba(255,128,128,${jewelPulse})`;
  ctx.fillRect(lx, ly - 1, 1, 1);
}

function drawFang(ctx, lx, ly, h, lean, t, p){
  ctx.save();
  ctx.translate(lx, ly);
  ctx.rotate(lean);
  // Fang body (tooth shape, base wider than tip)
  ctx.fillStyle = p.fangDark;
  ctx.beginPath();
  ctx.moveTo(-1, 0);
  ctx.lineTo(1, 0);
  ctx.lineTo(0.3, -h);
  ctx.lineTo(-0.3, -h);
  ctx.closePath();
  ctx.fill();
  // Highlight
  ctx.fillStyle = p.fang;
  ctx.beginPath();
  ctx.moveTo(-1, 0);
  ctx.lineTo(0, 0);
  ctx.lineTo(0, -h);
  ctx.lineTo(-0.3, -h);
  ctx.closePath();
  ctx.fill();
  // Tip
  ctx.fillStyle = '#fff';
  ctx.fillRect(-0.3, -h, 0.5, 1);
  // Blood at base
  ctx.fillStyle = p.fangBlood;
  ctx.fillRect(-1, 0, 2, 1);
  ctx.restore();
}

function drawGoldGauntlet(ctx, lx, ly, t, p){
  // Large golden gauntlet with red gem on knuckles
  ctx.fillStyle = p.bronzeDark;
  ctx.fillRect(lx - 4, ly - 1, 8, 7);
  ctx.fillStyle = p.bronze;
  ctx.fillRect(lx - 4, ly - 1, 8, 5);
  ctx.fillStyle = p.bronzeHot;
  ctx.fillRect(lx - 4, ly - 1, 8, 1);
  ctx.fillStyle = p.bronzeLight;
  ctx.fillRect(lx - 4, ly - 1, 1, 7);
  // Knuckle plates
  ctx.fillStyle = p.bronzeDark;
  for(let i = 0; i < 4; i++){
    ctx.fillRect(lx - 3 + i * 2, ly + 1, 1, 4);
  }
  // Red gem (knuckle)
  ctx.fillStyle = p.heartRed;
  ctx.fillRect(lx - 1, ly + 2, 3, 2);
  const pulse = 0.85 + Math.sin(t * 0.12) * 0.15;
  ctx.fillStyle = `rgba(255,128,128,${pulse})`;
  ctx.fillRect(lx, ly + 2, 1, 1);
  // Spike
  ctx.fillStyle = p.bronzeDark;
  ctx.beginPath();
  ctx.moveTo(lx - 4, ly + 6);
  ctx.lineTo(lx - 6, ly + 8);
  ctx.lineTo(lx - 4, ly + 8);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = p.bronze;
  ctx.fillRect(lx - 5, ly + 7, 1, 1);
  // Blood on gauntlet
  ctx.fillStyle = p.axeBlood;
  ctx.fillRect(lx - 2, ly + 4, 2, 1);
  ctx.fillStyle = p.bloodFresh;
  ctx.fillRect(lx + 2, ly + 5, 1, 1);
}

export const attacks = {
  idle: {
    id: 'idle', name: 'IDLE', icon: '◇',
    duration: 9999, looping: true,
    description: 'Posture impérieuse, hache double tenue à deux mains, scarifications dorées qui pulsent doucement, cœur de sang bat.',
    phases: [{ from: 0, to: 9999, label: 'Loop' }],
    update(frame){
      const fx = [];
      if(frame % 16 === 0){
        fx.push({ type: 'ash', dx: 0, dy: -22, count: 1, color: '#c82828' });
      }
      if(frame % 24 === 0){
        fx.push({ type: 'ash', dx: -16, dy: -32, count: 1, color: '#c8a040' });
        fx.push({ type: 'ash', dx: 16, dy: -32, count: 1, color: '#c8a040' });
      }
      return { opts: {}, fx };
    },
  },

  cleave: {
    id: 'cleave', name: 'BLOOD CLEAVE', icon: '🪓',
    duration: 110,
    description: 'Frappe hache double horizontale dévastatrice. 50% Bleed très forte (4 tours, 6 PV). +50% damage <30% HP. Ignore 50% armure.',
    phases: [
      { from: 0, to: 38, label: 'Wind-up' },
      { from: 38, to: 56, label: 'Strike' },
      { from: 56, to: 110, label: 'Recovery' },
    ],
    update(frame){
      const opts = {};
      const fx = [];
      if(frame < 38){
        const p = frame / 38;
        opts.axeRaise = -p * 1.8;
        opts.heartFlare = p * 0.6;
        if(frame % 4 === 0){
          fx.push({ type: 'sparks', dx: 0, dy: -18, count: 1, color: '#c82828' });
        }
        if(frame > 28 && frame % 3 === 0){
          fx.push({ type: 'sparks', dx: -16, dy: -36, count: 2, color: '#c8a040' });
        }
      } else if(frame < 56){
        const p = (frame - 38) / 18;
        opts.axeRaise = -1.8 + p * 2.6;
        opts.heartFlare = 0.6 - p * 0.3;
        if(frame === 38){
          fx.push({ type: 'sparks', dx: -20, dy: -16, count: 24, color: '#c82828' });
          fx.push({ type: 'flash', dx: -20, dy: -16, color: '#e84040', size: 22 });
          fx.push({ type: 'shockwave', dx: -20, dy: -8, color: '#8a1818', maxRadius: 44 });
          fx.push({ type: 'shockwave', dx: -20, dy: -8, color: '#c8a040', maxRadius: 30 });
        }
        if(frame === 46){
          fx.push({ type: 'sparks', dx: -20, dy: -4, count: 14, color: '#5a0808' });
          fx.push({ type: 'shockwave', dx: -20, dy: 0, color: '#c82828', maxRadius: 32 });
        }
      } else {
        const p = (frame - 56) / 54;
        opts.axeRaise = 0.8 - p * 0.8;
        opts.heartFlare = Math.max(0, 0.3 - p * 0.3);
      }
      return { opts, fx };
    },
  },

  rampUp: {
    id: 'rampUp', name: 'RAMP UP', icon: '💢',
    duration: 70, passive: true,
    description: 'Passif : +5% damage par tour passé en combat. Aura rouge grandit avec le temps.',
    phases: [
      { from: 0, to: 30, label: 'Build' },
      { from: 30, to: 70, label: 'Sustain' },
    ],
    update(frame){
      const opts = {};
      const fx = [];
      if(frame < 30){
        const p = frame / 30;
        opts.rampUp = p;
        opts.heartFlare = p * 0.5;
        if(frame === 0){
          fx.push({ type: 'flash', dx: 0, dy: -18, color: '#c82828', size: 26 });
          fx.push({ type: 'shockwave', dx: 0, dy: 0, color: '#8a1818', maxRadius: 50 });
        }
      } else {
        opts.rampUp = 1 + Math.sin(frame * 0.18) * 0.2;
        opts.heartFlare = 0.5 + Math.sin(frame * 0.15) * 0.2;
        if(frame % 4 === 0){
          const angle = Math.random() * Math.PI * 2;
          fx.push({ type: 'sparks', dx: Math.cos(angle) * 22, dy: -18 + Math.sin(angle) * 16, count: 1, color: frame % 8 === 0 ? '#c8a040' : '#c82828' });
        }
      }
      return { opts, fx };
    },
  },

  spawnButchers: {
    id: 'spawnButchers', name: 'SPAWN BUTCHERS (P2)', icon: '🩸',
    duration: 130,
    description: 'À 33% HP : rugit, sang gicle, 2 Bouchers émergent. Anim : flare cœur, blood pool ground, deux portails de sang s\'ouvrent.',
    phases: [
      { from: 0, to: 35, label: 'Roar' },
      { from: 35, to: 80, label: 'Blood pools' },
      { from: 80, to: 130, label: 'Manifest' },
    ],
    update(frame){
      const opts = { axeRaise: -0.6 };
      const fx = [];
      if(frame < 35){
        const p = frame / 35;
        opts.heartFlare = p;
        opts.rampUp = p * 0.8;
        opts.phase2 = p * 0.5;
        if(frame === 0){
          fx.push({ type: 'flash', dx: 0, dy: -18, color: '#fff', size: 36 });
          fx.push({ type: 'shockwave', dx: 0, dy: -8, color: '#c82828', maxRadius: 60 });
          fx.push({ type: 'shockwave', dx: 0, dy: -8, color: '#c8a040', maxRadius: 40 });
        }
        if(frame % 3 === 0){
          fx.push({ type: 'sparks', dx: 0, dy: -18, count: 2, color: '#e84040' });
        }
      } else if(frame < 80){
        opts.heartFlare = 1;
        opts.rampUp = 1;
        opts.phase2 = 1;
        // Two butcher portals on each side
        const portals = [[-30, 12], [30, 12]];
        for(let pi = 0; pi < 2; pi++){
          const [px, py] = portals[pi];
          if(frame % 4 === 0){
            fx.push({ type: 'sparks', dx: px, dy: py, count: 1, color: '#c82828' });
          }
          if(frame === 35 + pi * 6){
            fx.push({ type: 'shockwave', dx: px, dy: py, color: '#8a1818', maxRadius: 28 });
          }
          if(frame === 50 + pi * 6){
            fx.push({ type: 'shockwave', dx: px, dy: py, color: '#5a0808', maxRadius: 22 });
          }
        }
      } else {
        const p = (frame - 80) / 50;
        opts.heartFlare = 1 - p * 0.6;
        opts.rampUp = 1;
        opts.phase2 = 1 - p * 0.3;
        if(frame === 80){
          fx.push({ type: 'flash', dx: -30, dy: 12, color: '#c82828', size: 24 });
          fx.push({ type: 'flash', dx: 30, dy: 12, color: '#c82828', size: 24 });
          fx.push({ type: 'sparks', dx: -30, dy: 12, count: 16, color: '#5a0808' });
          fx.push({ type: 'sparks', dx: 30, dy: 12, count: 16, color: '#5a0808' });
        }
      }
      return { opts, fx };
    },
  },

  walk: {
    id: 'walk', name: 'WALK', icon: '🏃',
    duration: 240,
    looping: true,
    description: 'Marche dominante, hache portée à deux mains. Aller-retour 120/120. Pas qui font trembler le sol.',
    phases: [
      { from: 0, to: 120, label: 'Avancée' },
      { from: 120, to: 240, label: 'Retour' },
    ],
    update(frame){
      const opts = {};
      const fx = [];
      const half = 120;
      let p;
      if(frame < half){
        p = frame / half;
        opts.bodyShift = p * 38;
      } else {
        p = (frame - half) / half;
        opts.bodyShift = (1 - p) * 38;
      }
      opts.bodyShift += Math.sin(frame * 0.13) * 0.7;
      opts.axeRaise = Math.sin(frame * 0.11) * 0.1;
      if(frame % 18 === 0){
        fx.push({ type: 'ash', dx: -5, dy: 17, count: 3, color: '#3a1a08' });
        fx.push({ type: 'ash', dx: 5, dy: 17, count: 3, color: '#3a1a08' });
        fx.push({ type: 'shockwave', dx: 0, dy: 17, color: '#8a1818', maxRadius: 14 });
      }
      return { opts, fx };
    },
  },
};

export const meta = { width: 52, height: 80, groundOffsetY: 0 };
export default { draw, attacks, palette, meta };
