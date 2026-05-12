// src/js/render/enemies/fx-system.js
// Stub minimal du FxSystem legacy.
//
// L'ancien FxSystem émettait/affichait des effets de particules et projectiles
// pour l'Attack Lab du bestiaire. Comme les renderers iso n'ont pas (encore)
// d'attaques codées, le système n'est jamais réellement utilisé en pratique
// (seules les fonctions sont appelées avec des arrays vides).
//
// Ce stub évite l'erreur d'import et permet au bestiaire de se charger.
// Toutes les méthodes sont no-op et safe à appeler.

export class FxSystem {
  constructor(){
    this.particles = [];
    this.projectiles = [];
  }
  emit(_cmd, _x, _y){ /* no-op */ }
  spawnProjectile(_sx, _sy, _ex, _ey, _opts){ /* no-op */ }
  update(){ /* no-op */ }
  renderUnder(_ctx){ /* no-op */ }
  renderOver(_ctx){ /* no-op */ }
  clear(){
    this.particles.length = 0;
    this.projectiles.length = 0;
  }
}

export default FxSystem;
