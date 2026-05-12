// src/js/render/enemies/fx-system.js
// Système FX pour Attack Lab du bestiaire.
// Émet et anime: particules, projectiles, ondes de choc, AoE, slash trails.

const TYPE_COLORS = {
  fire:   { primary: '#ff6f1a', secondary: '#ffd060', glow: '#ffaa40' },
  cold:   { primary: '#4fc3f7', secondary: '#aee6ff', glow: '#80d8ff' },
  ice:    { primary: '#4fc3f7', secondary: '#aee6ff', glow: '#80d8ff' },
  poison: { primary: '#8eb828', secondary: '#c8e848', glow: '#a0d040' },
  shock:  { primary: '#00f0ff', secondary: '#aef0ff', glow: '#80f0ff' },
  blunt:  { primary: '#c8c8c8', secondary: '#ffffff', glow: '#e0e0e0' },
  slash:  { primary: '#ff5060', secondary: '#ffa0a0', glow: '#ff8080' },
  pierce: { primary: '#ffe040', secondary: '#ffffff', glow: '#fff080' },
  void:   { primary: '#8a40ff', secondary: '#c0a0ff', glow: '#a070ff' },
  blood:  { primary: '#c82828', secondary: '#ffe060', glow: '#e85050' },
};

export function colorsFor(damageType){
  return TYPE_COLORS[damageType] || TYPE_COLORS.blunt;
}

function hexA(hex, alpha){
  const r = parseInt(hex.slice(1,3), 16);
  const g = parseInt(hex.slice(3,5), 16);
  const b = parseInt(hex.slice(5,7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export class FxSystem {
  constructor(){
    this.particles = [];
    this.projectiles = [];
    this.shockwaves = [];
    this.aoes = [];
    this.slashes = [];
    this.flashes = [];
    this.beams = [];
  }

  emit(cmd, ox, oy){
    if(!cmd) return;
    const x = ox + (cmd.dx || 0);
    const y = oy + (cmd.dy || 0);
    const life = cmd.life || 30;
    switch(cmd.type){
      case 'particle':
        this.particles.push({
          x, y,
          vx: cmd.vx || 0, vy: cmd.vy || 0,
          gravity: cmd.gravity || 0,
          color: cmd.color || '#fff',
          size: cmd.size || 1.5,
          life, age: 0,
        });
        break;
      case 'spark': {
        const count = cmd.count || 8;
        const spread = cmd.spread || Math.PI * 2;
        const baseAngle = cmd.baseAngle || 0;
        const speed = cmd.speed || 1.5;
        for(let i = 0; i < count; i++){
          const a = baseAngle + (Math.random() - 0.5) * spread;
          const s = speed * (0.6 + Math.random() * 0.6);
          this.particles.push({
            x, y,
            vx: Math.cos(a) * s, vy: Math.sin(a) * s - (cmd.upBias || 0),
            gravity: cmd.gravity || 0.05,
            color: cmd.color || '#fff',
            size: cmd.size || 1.2,
            life, age: 0,
          });
        }
        break;
      }
      case 'shockwave':
        this.shockwaves.push({
          x, y, color: cmd.color || '#fff',
          maxRadius: cmd.maxRadius || 20, life, age: 0,
        });
        break;
      case 'aoe':
        this.aoes.push({
          x, y, color: cmd.color || '#ff6f1a',
          radius: cmd.radius || 24, life, age: 0, pulse: cmd.pulse || false,
        });
        break;
      case 'slash':
        this.slashes.push({
          x, y, angle: cmd.angle || 0, length: cmd.length || 28,
          color: cmd.color || '#fff', width: cmd.width || 3, life, age: 0,
        });
        break;
      case 'flash':
        this.flashes.push({
          x, y, color: cmd.color || '#fff',
          radius: cmd.radius || 14, life, age: 0,
        });
        break;
      case 'beam':
        this.beams.push({
          x, y, angle: cmd.angle || 0, length: cmd.length || 60,
          color: cmd.color || '#fff', width: cmd.width || 3, life, age: 0,
        });
        break;
    }
  }

  spawnProjectile(sx, sy, ex, ey, opts = {}){
    this.projectiles.push({
      sx, sy, ex, ey, x: sx, y: sy,
      travelFrames: opts.travelFrames || 18, age: 0,
      color: opts.color || '#fff', glowColor: opts.glowColor || opts.color || '#fff',
      size: opts.size || 2, arc: opts.arc || 0, trail: opts.trail !== false,
      onHit: opts.onHit, _hit: false,
    });
  }

  update(){
    for(const p of this.particles){
      p.x += p.vx; p.y += p.vy; p.vy += p.gravity; p.age++;
    }
    this.particles = this.particles.filter(p => p.age < p.life);

    for(const s of this.shockwaves) s.age++;
    this.shockwaves = this.shockwaves.filter(s => s.age < s.life);
    for(const a of this.aoes) a.age++;
    this.aoes = this.aoes.filter(a => a.age < a.life);
    for(const s of this.slashes) s.age++;
    this.slashes = this.slashes.filter(s => s.age < s.life);
    for(const f of this.flashes) f.age++;
    this.flashes = this.flashes.filter(f => f.age < f.life);
    for(const b of this.beams) b.age++;
    this.beams = this.beams.filter(b => b.age < b.life);

    for(const p of this.projectiles){
      p.age++;
      const t = Math.min(1, p.age / p.travelFrames);
      p.x = p.sx + (p.ex - p.sx) * t;
      const arcOffset = p.arc * Math.sin(t * Math.PI);
      p.y = p.sy + (p.ey - p.sy) * t - arcOffset;
      if(t >= 1 && !p._hit){
        p._hit = true;
        if(p.onHit) this.emit(p.onHit, p.ex, p.ey);
      }
    }
    this.projectiles = this.projectiles.filter(p => p.age < p.travelFrames + 4);
  }

  renderUnder(ctx){
    for(const a of this.aoes){
      const t = a.age / a.life;
      const alpha = (1 - t) * 0.7;
      const r = a.radius * (a.pulse ? (0.8 + Math.sin(t * Math.PI * 4) * 0.2) : (0.5 + t * 0.5));
      const grad = ctx.createRadialGradient(a.x, a.y, 0, a.x, a.y, r);
      grad.addColorStop(0, hexA(a.color, alpha * 0.6));
      grad.addColorStop(0.7, hexA(a.color, alpha * 0.25));
      grad.addColorStop(1, hexA(a.color, 0));
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(a.x, a.y, r, r * 0.45, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = hexA(a.color, alpha * 0.8);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(a.x, a.y, r, r * 0.45, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    for(const s of this.shockwaves){
      const t = s.age / s.life;
      const r = s.maxRadius * t;
      const alpha = (1 - t) * 0.85;
      ctx.strokeStyle = hexA(s.color, alpha);
      ctx.lineWidth = 2 - t;
      ctx.beginPath();
      ctx.ellipse(s.x, s.y, r, r * 0.5, 0, 0, Math.PI * 2);
      ctx.stroke();
      if(r > 6){
        ctx.strokeStyle = hexA(s.color, alpha * 0.4);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(s.x, s.y, r - 3, (r - 3) * 0.5, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  }

  renderOver(ctx){
    for(const s of this.slashes){
      const t = s.age / s.life;
      const alpha = (1 - t) * 0.95;
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate(s.angle);
      ctx.strokeStyle = hexA(s.color, alpha);
      ctx.lineWidth = s.width;
      ctx.beginPath();
      const len = s.length * (0.3 + t * 0.7);
      ctx.moveTo(-len / 2, 0);
      ctx.lineTo(len / 2, 0);
      ctx.stroke();
      ctx.strokeStyle = hexA('#ffffff', alpha * 0.7);
      ctx.lineWidth = s.width * 0.4;
      ctx.stroke();
      ctx.restore();
    }
    for(const b of this.beams){
      const t = b.age / b.life;
      const alpha = (1 - t) * 0.95;
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(b.angle);
      ctx.strokeStyle = hexA(b.color, alpha * 0.5);
      ctx.lineWidth = b.width * 2.5;
      ctx.beginPath();
      ctx.moveTo(0, 0); ctx.lineTo(b.length, 0);
      ctx.stroke();
      ctx.strokeStyle = hexA(b.color, alpha);
      ctx.lineWidth = b.width;
      ctx.beginPath();
      ctx.moveTo(0, 0); ctx.lineTo(b.length, 0);
      ctx.stroke();
      ctx.strokeStyle = hexA('#ffffff', alpha * 0.85);
      ctx.lineWidth = b.width * 0.3;
      ctx.stroke();
      ctx.restore();
    }
    for(const p of this.projectiles){
      if(p._hit) continue;
      if(p.trail){
        const trailLen = 5;
        for(let i = 1; i <= trailLen; i++){
          const t = i / trailLen;
          const tx = p.x - (p.ex - p.sx) / p.travelFrames * i * 0.8;
          const ty = p.y - (p.ey - p.sy) / p.travelFrames * i * 0.8;
          ctx.fillStyle = hexA(p.glowColor, (1 - t) * 0.5);
          ctx.beginPath();
          ctx.arc(tx, ty, p.size * (1 - t * 0.7), 0, Math.PI * 2);
          ctx.fill();
        }
      }
      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
      grad.addColorStop(0, hexA(p.glowColor, 0.9));
      grad.addColorStop(1, hexA(p.glowColor, 0));
      ctx.fillStyle = grad;
      ctx.fillRect(p.x - p.size * 3, p.y - p.size * 3, p.size * 6, p.size * 6);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
    for(const f of this.flashes){
      const t = f.age / f.life;
      const alpha = (1 - t) * 0.85;
      const r = f.radius * (0.5 + t * 0.5);
      const grad = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, r);
      grad.addColorStop(0, hexA('#ffffff', alpha));
      grad.addColorStop(0.4, hexA(f.color, alpha * 0.7));
      grad.addColorStop(1, hexA(f.color, 0));
      ctx.fillStyle = grad;
      ctx.fillRect(f.x - r, f.y - r, r * 2, r * 2);
    }
    for(const p of this.particles){
      const t = p.age / p.life;
      const alpha = 1 - t;
      ctx.fillStyle = hexA(p.color, alpha);
      const s = p.size * (1 - t * 0.4);
      ctx.fillRect(p.x - s / 2, p.y - s / 2, s, s);
    }
  }

  clear(){
    this.particles.length = 0;
    this.projectiles.length = 0;
    this.shockwaves.length = 0;
    this.aoes.length = 0;
    this.slashes.length = 0;
    this.flashes.length = 0;
    this.beams.length = 0;
  }
}

export default FxSystem;
