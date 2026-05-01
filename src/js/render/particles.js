// src/js/render/particles.js
// Système de particules léger.
// Une particule est un objet { x, y, vx, vy, life, maxLife, size, color, gravity? }.
// Le système les met à jour, les dessine, et recycle les expirées.

import { hexToRgba } from './iso-utils.js';

export class ParticleSystem {
  constructor(){
    this.particles = [];
  }

  /**
   * Ajoute une particule.
   */
  emit(p){
    this.particles.push({
      x: p.x, y: p.y,
      vx: p.vx || 0, vy: p.vy || 0,
      life: p.life || 30,
      maxLife: p.maxLife || p.life || 30,
      size: p.size || 1,
      color: p.color || '#fff',
      gravity: p.gravity ?? 0.005,
    });
  }

  /**
   * Émet un nuage de poussière (au pas du joueur, au sol).
   */
  emitDust(sx, sy){
    for(let i = 0; i < 6; i++){
      this.emit({
        x: sx + (Math.random() - 0.5) * 16,
        y: sy + Math.random() * 4,
        vx: (Math.random() - 0.5) * 0.6,
        vy: -Math.random() * 0.3,
        life: 25 + Math.random() * 15,
        maxLife: 40,
        size: 1.5 + Math.random() * 1.2,
        color: '#a89880',
      });
    }
  }

  /**
   * Émet une étincelle/braise vers le haut.
   */
  emitEmber(sx, sy, color){
    this.emit({
      x: sx, y: sy,
      vx: (Math.random() - 0.5) * 0.3,
      vy: -0.4 - Math.random() * 0.3,
      life: 80 + Math.random() * 60,
      maxLife: 140,
      size: 1 + Math.random(),
      color,
    });
  }

  /**
   * Met à jour toutes les particules d'un tick.
   */
  update(){
    for(let i = this.particles.length - 1; i >= 0; i--){
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.life--;
      if(p.life <= 0){
        this.particles.splice(i, 1);
      }
    }
  }

  /**
   * Dessine toutes les particules.
   */
  render(ctx){
    for(const p of this.particles){
      const a = p.life / p.maxLife;
      ctx.fillStyle = hexToRgba(p.color, a);
      ctx.fillRect(p.x|0, p.y|0, p.size|0, p.size|0);
    }
  }

  clear(){
    this.particles = [];
  }
}
