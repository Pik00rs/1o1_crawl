// src/js/render/enemies/fx-system.js
// Système de particules / FX pour les animations d'attaques.
// Réutilisable pour tous les ennemis. Le sprite émet des FX via son fn update()
// qui retourne un array { type, dx, dy, ... }, et le caller les passe ici.
//
// Types supportés :
//   - 'ash'        : particule de cendre qui monte lentement
//   - 'sparks'     : étincelles éjectées dans toutes les directions
//   - 'shockwave'  : onde de choc circulaire (anneau iso qui s'élargit)
//   - 'flash'      : flash blanc/orange à un point (court)
//   - 'projectile' : projectile qui voyage du tireur à la cible avec drawFn custom
//
// Les projectiles sont réutilisables dans le jeu : chaque sprite expose
// `attacks[id].projectile = { drawProjectile, travelFrames, spawnOffset, hitsAt }`
// et le bestiaire (ou le moteur) appelle fx.spawnProjectile(...) au bon frame.

export class FxSystem {
  constructor(){
    this.ashes = [];
    this.sparks = [];
    this.shockwaves = [];
    this.flashes = [];
    this.projectiles = [];
  }

  /**
   * Ingère une commande FX émise par le update() d'une attaque.
   * @param {object} cmd - { type, dx, dy, ... }
   * @param {number} originX - position de l'ennemi
   * @param {number} originY
   */
  emit(cmd, originX, originY){
    const x = originX + (cmd.dx || 0);
    const y = originY + (cmd.dy || 0);
    if(cmd.type === 'ash'){
      this.spawnAsh(x, y, cmd.count || 1, cmd.color);
    } else if(cmd.type === 'sparks'){
      this.spawnSparks(x, y, cmd.count || 4, cmd.color);
    } else if(cmd.type === 'shockwave'){
      this.spawnShockwave(x, y, cmd.color, cmd.maxRadius);
    } else if(cmd.type === 'flash'){
      this.spawnFlash(x, y, cmd.color, cmd.size);
    } else if(cmd.type === 'projectile'){
      // cmd: { type, dx, dy, targetX, targetY, drawProjectile, travelFrames, onHit }
      this.spawnProjectile(x, y, cmd.targetX, cmd.targetY, cmd);
    }
  }

  spawnAsh(x, y, count, color){
    for(let i = 0; i < count; i++){
      this.ashes.push({
        x: x + (Math.random() - 0.5) * 14,
        y: y,
        vx: (Math.random() - 0.5) * 0.6,
        vy: -0.4 - Math.random() * 0.5,
        life: 50 + Math.random() * 30,
        maxLife: 80,
        color: color || (Math.random() < 0.5 ? '#ffb347' : '#5a3525'),
      });
    }
  }

  spawnSparks(x, y, count, color){
    for(let i = 0; i < count; i++){
      const a = Math.random() * Math.PI * 2;
      this.sparks.push({
        x: x, y: y,
        vx: Math.cos(a) * (1 + Math.random() * 1.5),
        vy: Math.sin(a) * (0.3 + Math.random() * 0.6) - 1.5,
        life: 25 + Math.random() * 15,
        maxLife: 40,
        color: color || '#ffb347',
      });
    }
  }

  spawnShockwave(x, y, color, maxRadius){
    this.shockwaves.push({
      x: x, y: y,
      r: 0,
      maxR: maxRadius || 42,
      life: 30,
      maxLife: 30,
      color: color || '#ff6f1a',
    });
  }

  spawnFlash(x, y, color, size){
    this.flashes.push({
      x: x, y: y,
      life: 8,
      maxLife: 8,
      color: color || '#ffe080',
      size: size || 12,
    });
  }

  /**
   * Lance un projectile qui voyage de (originX,originY) vers (targetX,targetY).
   * Le drawProjectile reçoit (ctx, x, y, vx, vy, t) où vx/vy sont la direction
   * unitaire et t est le frame courant — utile pour orientation et anim interne.
   *
   * @param {number} originX
   * @param {number} originY
   * @param {number} targetX
   * @param {number} targetY
   * @param {object} opts - { drawProjectile, travelFrames, onHit, trailColor, arc }
   *   - travelFrames : nombre de frames pour atteindre la cible (défaut 18)
   *   - drawProjectile : fn(ctx, x, y, vx, vy, t) — render custom du projectile
   *   - trailColor : si fourni, dessine une traînée de cette couleur
   *   - arc : 0 = ligne droite, > 0 = parabole vers le haut (défaut 0)
   *   - onHit : commandes FX à émettre à l'impact { sparks, flash, shockwave, count, color }
   */
  spawnProjectile(originX, originY, targetX, targetY, opts){
    opts = opts || {};
    const dx = targetX - originX;
    const dy = targetY - originY;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    this.projectiles.push({
      x: originX, y: originY,
      ox: originX, oy: originY,
      tx: targetX, ty: targetY,
      vx: dx / dist, vy: dy / dist,  // direction unitaire (orientation)
      progress: 0,
      travelFrames: opts.travelFrames || 18,
      drawProjectile: opts.drawProjectile || defaultProjectileDraw,
      trailColor: opts.trailColor || null,
      arc: opts.arc || 0,
      onHit: opts.onHit || null,
      trail: [], // historique des positions pour la traînée
      t: 0,
    });
  }

  /**
   * Update tous les FX d'un tick.
   */
  update(){
    for(let i = this.ashes.length - 1; i >= 0; i--){
      const p = this.ashes[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.005;
      p.life--;
      if(p.life <= 0) this.ashes.splice(i, 1);
    }
    for(let j = this.sparks.length - 1; j >= 0; j--){
      const s = this.sparks[j];
      s.x += s.vx;
      s.y += s.vy;
      s.vy += 0.12;
      s.life--;
      if(s.life <= 0) this.sparks.splice(j, 1);
    }
    for(let k = this.shockwaves.length - 1; k >= 0; k--){
      const w = this.shockwaves[k];
      w.r += w.maxR / w.maxLife;
      w.life--;
      if(w.life <= 0) this.shockwaves.splice(k, 1);
    }
    for(let l = this.flashes.length - 1; l >= 0; l--){
      const f = this.flashes[l];
      f.life--;
      if(f.life <= 0) this.flashes.splice(l, 1);
    }
    // Projectiles : avancent du tireur vers la cible avec arc optionnel
    for(let m = this.projectiles.length - 1; m >= 0; m--){
      const pr = this.projectiles[m];
      pr.progress += 1 / pr.travelFrames;
      pr.t++;
      const p = Math.min(1, pr.progress);
      // Ligne droite + arc parabolique
      pr.x = pr.ox + (pr.tx - pr.ox) * p;
      pr.y = pr.oy + (pr.ty - pr.oy) * p - Math.sin(p * Math.PI) * pr.arc;
      // Trail
      if(pr.trailColor){
        pr.trail.push({ x: pr.x, y: pr.y, life: 12 });
        if(pr.trail.length > 12) pr.trail.shift();
        for(const tr of pr.trail) tr.life--;
      }
      // Hit
      if(pr.progress >= 1){
        // Émet les fx à l'impact
        if(pr.onHit){
          if(pr.onHit.flash) this.spawnFlash(pr.tx, pr.ty, pr.onHit.flash, pr.onHit.flashSize || 14);
          if(pr.onHit.sparks) this.spawnSparks(pr.tx, pr.ty, pr.onHit.sparks, pr.onHit.color);
          if(pr.onHit.shockwave) this.spawnShockwave(pr.tx, pr.ty, pr.onHit.shockwave, pr.onHit.shockwaveRadius);
          if(pr.onHit.ash) this.spawnAsh(pr.tx, pr.ty, pr.onHit.ash, pr.onHit.color);
        }
        this.projectiles.splice(m, 1);
      }
    }
  }

  /**
   * Render tous les FX. Les ondes de choc sont dessinées avant les sprites
   * (au sol), les particules après (au-dessus).
   */
  renderUnder(ctx){
    for(const w of this.shockwaves){
      const a = w.life / w.maxLife;
      ctx.strokeStyle = `rgba(255,107,26,${a * 0.9})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(w.x, w.y, w.r, w.r * 0.4, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = `rgba(255,200,100,${a * 0.5})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(w.x, w.y, w.r * 0.7, w.r * 0.28, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  renderOver(ctx){
    for(const p of this.ashes){
      const a = p.life / p.maxLife;
      ctx.fillStyle = p.color;
      ctx.globalAlpha = a * 0.75;
      ctx.fillRect(Math.round(p.x), Math.round(p.y), 1, 1);
    }
    ctx.globalAlpha = 1;
    for(const s of this.sparks){
      const a = s.life / s.maxLife;
      ctx.fillStyle = s.color || '#ffb347';
      ctx.globalAlpha = a;
      ctx.fillRect(Math.round(s.x), Math.round(s.y), 1, 1);
      ctx.fillStyle = '#fff';
      ctx.globalAlpha = a * 0.5;
      ctx.fillRect(Math.round(s.x), Math.round(s.y), 1, 1);
    }
    ctx.globalAlpha = 1;
    for(const f of this.flashes){
      const a = f.life / f.maxLife;
      const rgb = hexToRgb(f.color);
      const grad = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.size);
      grad.addColorStop(0, `rgba(${rgb.r},${rgb.g},${rgb.b},${a})`);
      grad.addColorStop(1, `rgba(${rgb.r},${rgb.g},${rgb.b},0)`);
      ctx.fillStyle = grad;
      ctx.fillRect(f.x - f.size, f.y - f.size, f.size * 2, f.size * 2);
    }
    // Projectiles : trail puis projectile lui-même
    for(const pr of this.projectiles){
      // Trail
      if(pr.trailColor && pr.trail.length > 1){
        const rgb = hexToRgb(pr.trailColor);
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        for(let i = 1; i < pr.trail.length; i++){
          const t1 = pr.trail[i - 1];
          const t2 = pr.trail[i];
          const a = (t2.life / 12) * 0.7;
          ctx.strokeStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},${a})`;
          ctx.beginPath();
          ctx.moveTo(t1.x, t1.y);
          ctx.lineTo(t2.x, t2.y);
          ctx.stroke();
        }
      }
      // Le projectile dessine lui-même
      pr.drawProjectile(ctx, pr.x, pr.y, pr.vx, pr.vy, pr.t);
    }
  }

  clear(){
    this.ashes.length = 0;
    this.sparks.length = 0;
    this.shockwaves.length = 0;
    this.flashes.length = 0;
    this.projectiles.length = 0;
  }
}

// Helpers
function hexToRgb(hex){
  if(!hex) return { r: 255, g: 179, b: 71 };
  if(hex[0] !== '#') hex = '#' + hex;
  const h = hex.substr(1);
  return {
    r: parseInt(h.substr(0, 2), 16) || 0,
    g: parseInt(h.substr(2, 2), 16) || 0,
    b: parseInt(h.substr(4, 2), 16) || 0,
  };
}

/**
 * Dessin par défaut d'un projectile : boule orange avec halo.
 * Les sprites custom remplacent ça via opts.drawProjectile.
 */
function defaultProjectileDraw(ctx, x, y, vx, vy, t){
  const grad = ctx.createRadialGradient(x, y, 0, x, y, 8);
  grad.addColorStop(0, 'rgba(255,224,128,0.95)');
  grad.addColorStop(0.4, 'rgba(255,107,26,0.7)');
  grad.addColorStop(1, 'rgba(255,107,26,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(x - 8, y - 8, 16, 16);
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(x, y, 1.5, 0, Math.PI * 2);
  ctx.fill();
}
