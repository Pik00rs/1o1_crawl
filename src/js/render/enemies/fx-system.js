// src/js/render/enemies/fx-system.js
// Système de particules / FX pour les animations d'attaques.
// Réutilisable pour tous les ennemis. Le sprite émet des FX via son fn update()
// qui retourne un array { type, dx, dy, ... }, et le caller les passe ici.
//
// Types supportés :
//   - 'ash'       : particule de cendre qui monte lentement
//   - 'sparks'    : étincelles éjectées dans toutes les directions
//   - 'shockwave' : onde de choc circulaire (anneau iso qui s'élargit)
//   - 'flash'     : flash blanc/orange à un point (court)
//   - 'trail'     : traînée derrière un point en mouvement

export class FxSystem {
  constructor(){
    this.ashes = [];
    this.sparks = [];
    this.shockwaves = [];
    this.flashes = [];
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
      this.spawnSparks(x, y, cmd.count || 4);
    } else if(cmd.type === 'shockwave'){
      this.spawnShockwave(x, y, cmd.color, cmd.maxRadius);
    } else if(cmd.type === 'flash'){
      this.spawnFlash(x, y, cmd.color, cmd.size);
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

  spawnSparks(x, y, count){
    for(let i = 0; i < count; i++){
      const a = Math.random() * Math.PI * 2;
      this.sparks.push({
        x: x, y: y,
        vx: Math.cos(a) * (1 + Math.random() * 1.5),
        vy: Math.sin(a) * (0.3 + Math.random() * 0.6) - 1.5,
        life: 25 + Math.random() * 15,
        maxLife: 40,
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
      ctx.fillStyle = '#ffb347';
      ctx.globalAlpha = a;
      ctx.fillRect(Math.round(s.x), Math.round(s.y), 1, 1);
      ctx.fillStyle = '#fff';
      ctx.globalAlpha = a * 0.5;
      ctx.fillRect(Math.round(s.x), Math.round(s.y), 1, 1);
    }
    ctx.globalAlpha = 1;
    for(const f of this.flashes){
      const a = f.life / f.maxLife;
      const grad = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.size);
      grad.addColorStop(0, `${f.color.replace(')', ',' + a + ')').replace('#', 'rgba(').replace(/^rgba\(([0-9a-f]+)/, (m, h) => {
        // hex to rgba helper inline
        return 'rgba(' + parseInt(h.substr(0,2),16) + ',' + parseInt(h.substr(2,2),16) + ',' + parseInt(h.substr(4,2),16);
      })}`);
      grad.addColorStop(1, 'rgba(255,179,71,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(f.x - f.size, f.y - f.size, f.size * 2, f.size * 2);
    }
  }

  clear(){
    this.ashes.length = 0;
    this.sparks.length = 0;
    this.shockwaves.length = 0;
    this.flashes.length = 0;
  }
}
