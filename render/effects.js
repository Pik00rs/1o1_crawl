// src/js/render/effects.js
// Effets globaux d'ambiance : ciel, vignette, étoiles/flecks ambiantes.
// Tout dépend du biome courant.

/**
 * Dessine le ciel/fond du biome avec un gradient.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {object} viewport - { width, height }
 * @param {object} biome - { skyTop, skyBot }
 * @param {number} time
 * @param {object} options - { night, fxLevel }
 */
export function drawSky(ctx, viewport, biome, time, options = {}){
  const top = options.night ? '#02050a' : biome.skyTop;
  const bot = options.night ? '#000000' : biome.skyBot;

  const grad = ctx.createLinearGradient(0, 0, 0, viewport.height);
  grad.addColorStop(0, top);
  grad.addColorStop(1, bot);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, viewport.width, viewport.height);

  // Étoiles / flecks ambiantes
  const fleckCount = options.night ? 70 : (options.fxLevel === 0 ? 0 : 30);
  for(let i = 0; i < fleckCount; i++){
    const k = (i * 73 + time * 0.02) % 1000;
    const x = (k * 17.7) % viewport.width;
    const y = (k * 9.3) % (viewport.height * 0.5);
    const a = 0.2 + Math.sin(time * 0.04 + i) * 0.2 + 0.4;
    ctx.fillStyle = `rgba(255,255,255,${a * 0.4})`;
    ctx.fillRect(x|0, y|0, 1, 1);
  }
}

/**
 * Dessine la vignette en bordure du canvas (assombrit les bords).
 */
export function drawVignette(ctx, viewport){
  const grad = ctx.createRadialGradient(
    viewport.width/2, viewport.height/2, viewport.width * 0.3,
    viewport.width/2, viewport.height/2, viewport.width * 0.7
  );
  grad.addColorStop(0, 'rgba(0,0,0,0)');
  grad.addColorStop(1, 'rgba(0,0,0,0.55)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, viewport.width, viewport.height);
}

/**
 * Émet périodiquement des braises ambiantes qui montent.
 * À appeler depuis la boucle d'update.
 *
 * @param {ParticleSystem} particles
 * @param {object} viewport
 * @param {object} biome - { ember }
 * @param {number} time
 * @param {number} fxLevel - 0 (off) | 1 (sometimes) | 2 (full)
 */
export function emitAmbientEmbers(particles, viewport, biome, time, fxLevel = 1){
  if(fxLevel < 2) return;
  if(time % 5 !== 0) return;
  const x = Math.random() * viewport.width;
  const y = viewport.height * (0.7 + Math.random() * 0.2);
  particles.emit({
    x, y,
    vx: (Math.random() - 0.5) * 0.3,
    vy: -0.4 - Math.random() * 0.3,
    life: 80 + Math.random() * 60,
    maxLife: 140,
    size: 1 + Math.random(),
    color: biome.ember || '#ffb347',
  });
}
