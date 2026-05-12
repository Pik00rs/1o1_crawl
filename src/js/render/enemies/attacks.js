// src/js/render/enemies/attacks.js
// Bibliothèque d'attaques pour les 40 ennemis du bestiaire.
//
// Format attendu par bestiary.html attack lab:
//   attack = {
//     id, name, icon, duration, description,
//     phases: [{ from, to, label }, ...],
//     update(frame, duration, ctx) → { opts, fx: [...] },
//     projectile?: { drawProjectile, travelFrames, trailColor, arc, onHit },  // si projectile à émettre
//     looping?: bool,
//   }
//
// update() est appelé chaque frame avec frame courante. Retourne:
//   - opts: passés au draw du sprite (ex: { attackPhase: 'strike', attackProgress: 0.5 })
//   - fx: array de commandes FX à émettre via fxSystem.emit()
//   - Pour projectiles: une cmd type 'projectile' avec useAttackProjectile:true
//     déclenche fxSystem.spawnProjectile() avec attack.projectile en spec.

import { colorsFor } from './fx-system.js';

// ─────────────────────────────────────────────────────────────────────────────
// FACTORIES — chaque factory construit une attaque type pour un ennemi donné
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Mêlée basique : recul → frappe → recovery.
 * Émet un slash dans la direction de la cible + sparks à l'impact.
 */
export function makeMeleeSwing({
  id = 'melee', name = 'FRAPPE', icon = '◇', desc = 'Frappe rapide au CaC',
  duration = 36, damageType = 'blunt', dmgRange = [1, 1],
  slashLength = 28, slashWidth = 3,
}){
  const colors = colorsFor(damageType);
  return {
    id, name, icon, duration,
    description: `${desc} · ${dmgRange[0]}-${dmgRange[1]} dmg`,
    phases: [
      { from: 0,  to: 14, label: 'windup' },
      { from: 14, to: 20, label: 'strike' },
      { from: 20, to: duration, label: 'recovery' },
    ],
    update(frame){
      const fx = [];
      let phase = 'idle';
      if(frame < 14) phase = 'windup';
      else if(frame < 20) phase = 'strike';
      else phase = 'recovery';

      const opts = { attackPhase: phase, attackProgress: frame / duration };

      // STRIKE frame: emit slash + flash + sparks
      if(frame === 14){
        fx.push({
          type: 'slash',
          dx: 14, dy: -8,
          angle: -0.2,
          length: slashLength,
          width: slashWidth,
          color: colors.primary,
          life: 12,
        });
        fx.push({
          type: 'flash',
          dx: 22, dy: -8,
          color: colors.glow,
          radius: 12,
          life: 14,
        });
        fx.push({
          type: 'spark',
          dx: 22, dy: -8,
          count: 8,
          color: colors.secondary,
          speed: 1.8,
          spread: Math.PI * 1.2,
          life: 22,
          gravity: 0.08,
        });
        // Impact shockwave at ground
        fx.push({
          type: 'shockwave',
          dx: 22, dy: 0,
          color: colors.primary,
          maxRadius: 16,
          life: 18,
        });
      }
      return { opts, fx };
    },
  };
}

/**
 * Mêlée lourde : windup long, frappe puissante, AoE.
 */
export function makeHeavyStrike({
  id = 'heavy', name = 'FRAPPE LOURDE', icon = '◆', desc = 'Coup chargé qui propulse',
  duration = 56, damageType = 'blunt', dmgRange = [1, 1],
}){
  const colors = colorsFor(damageType);
  return {
    id, name, icon, duration,
    description: `${desc} · ${dmgRange[0]}-${dmgRange[1]} dmg`,
    phases: [
      { from: 0,  to: 28, label: 'wind-up' },
      { from: 28, to: 36, label: 'strike' },
      { from: 36, to: duration, label: 'recovery' },
    ],
    update(frame){
      const fx = [];
      let phase = 'idle';
      if(frame < 28) phase = 'windup_heavy';
      else if(frame < 36) phase = 'strike_heavy';
      else phase = 'recovery';
      const opts = { attackPhase: phase, attackProgress: frame / duration };

      // Charging sparks during windup
      if(phase === 'windup_heavy' && frame % 4 === 0){
        fx.push({
          type: 'spark', dx: 10, dy: -8,
          count: 3, color: colors.glow,
          speed: 0.6, spread: Math.PI * 2, life: 15, gravity: 0,
        });
      }
      // STRIKE
      if(frame === 28){
        fx.push({
          type: 'slash', dx: 16, dy: -6,
          angle: 0.3, length: 36, width: 5,
          color: colors.primary, life: 14,
        });
        fx.push({
          type: 'flash', dx: 26, dy: -6,
          color: colors.glow, radius: 18, life: 16,
        });
        fx.push({
          type: 'spark', dx: 26, dy: -6,
          count: 14, color: colors.secondary,
          speed: 2.5, spread: Math.PI * 1.5, life: 28, gravity: 0.1,
        });
        fx.push({
          type: 'shockwave', dx: 26, dy: 2,
          color: colors.primary, maxRadius: 26, life: 22,
        });
        fx.push({
          type: 'shockwave', dx: 0, dy: 2,
          color: colors.primary, maxRadius: 18, life: 18,
        });
      }
      return { opts, fx };
    },
  };
}

/**
 * Projectile rangé : windup → tir → projectile → impact.
 */
export function makeRangedShot({
  id = 'shot', name = 'TIR', icon = '➤', desc = 'Tir à distance',
  duration = 48, damageType = 'pierce', dmgRange = [1, 1],
  projectileSize = 2, arc = 0,
}){
  const colors = colorsFor(damageType);
  return {
    id, name, icon, duration,
    description: `${desc} · ${dmgRange[0]}-${dmgRange[1]} dmg`,
    projectile: {
      travelFrames: 22,
      arc,
      drawProjectile: null, // handled by fx-system
      trailColor: colors.glow,
      onHit: { type: 'spark', count: 10, color: colors.secondary, speed: 2, life: 24, gravity: 0.08, spread: Math.PI * 2 },
    },
    phases: [
      { from: 0,  to: 18, label: 'aim' },
      { from: 18, to: 22, label: 'release' },
      { from: 22, to: duration, label: 'recovery' },
    ],
    update(frame){
      const fx = [];
      let phase = 'idle';
      if(frame < 18) phase = 'aim';
      else if(frame < 22) phase = 'release';
      else phase = 'recovery';
      const opts = { attackPhase: phase, attackProgress: frame / duration };

      // Charge glow on weapon during aim
      if(phase === 'aim' && frame % 3 === 0){
        fx.push({
          type: 'spark', dx: 10, dy: -10,
          count: 2, color: colors.glow,
          speed: 0.4, spread: Math.PI * 2, life: 10, gravity: 0,
        });
      }
      // Release: fire projectile + muzzle flash
      if(frame === 18){
        fx.push({
          type: 'flash', dx: 14, dy: -8,
          color: colors.glow, radius: 10, life: 8,
        });
        fx.push({
          type: 'spark', dx: 14, dy: -8,
          count: 6, color: colors.secondary,
          speed: 1.2, spread: 0.6, baseAngle: 0,
          life: 10, gravity: 0,
        });
        // Signal projectile to be spawned by bestiary
        fx.push({
          type: 'projectile',
          useAttackProjectile: true,
          dx: 14, dy: -8,
        });
      }
      return { opts, fx };
    },
  };
}

/**
 * Cast magique : longue invocation → orbe → projectile arqué.
 */
export function makeMagicCast({
  id = 'cast', name = 'INCANTATION', icon = '✦', desc = 'Sort à distance',
  duration = 60, damageType = 'fire', dmgRange = [1, 1],
}){
  const colors = colorsFor(damageType);
  return {
    id, name, icon, duration,
    description: `${desc} · ${dmgRange[0]}-${dmgRange[1]} dmg`,
    projectile: {
      travelFrames: 26, arc: 14,
      trailColor: colors.glow,
      onHit: {
        type: 'flash', color: colors.glow, radius: 18, life: 18,
      },
    },
    phases: [
      { from: 0,  to: 30, label: 'channel' },
      { from: 30, to: 36, label: 'release' },
      { from: 36, to: duration, label: 'recovery' },
    ],
    update(frame){
      const fx = [];
      let phase = 'idle';
      if(frame < 30) phase = 'channel';
      else if(frame < 36) phase = 'release';
      else phase = 'recovery';
      const opts = { attackPhase: phase, attackProgress: frame / duration };

      // Channeling: orbiting sparks around the caster hand
      if(phase === 'channel' && frame % 2 === 0){
        const angle = frame * 0.3;
        fx.push({
          type: 'particle',
          dx: -10 + Math.cos(angle) * 5,
          dy: -4 + Math.sin(angle) * 3,
          vx: 0, vy: -0.2,
          color: colors.primary, size: 1.5,
          life: 16, gravity: -0.02,
        });
      }
      // Release: large flash + projectile
      if(frame === 30){
        fx.push({
          type: 'flash', dx: -10, dy: -4,
          color: colors.glow, radius: 16, life: 16,
        });
        fx.push({
          type: 'spark', dx: -10, dy: -4,
          count: 12, color: colors.secondary,
          speed: 1.5, spread: Math.PI * 2, life: 22, gravity: 0.04,
        });
        fx.push({
          type: 'projectile',
          useAttackProjectile: true,
          dx: -10, dy: -4,
        });
      }
      // After: emit some additional drifting embers
      if(phase === 'recovery' && frame % 4 === 0){
        fx.push({
          type: 'particle',
          dx: -10 + (Math.random() - 0.5) * 8,
          dy: -4 + (Math.random() - 0.5) * 4,
          vx: (Math.random() - 0.5) * 0.4,
          vy: -0.6,
          color: colors.secondary, size: 1,
          life: 24, gravity: -0.03,
        });
      }
      return { opts, fx };
    },
  };
}

/**
 * Charge : windup, dash visuel, frappe au choc, dust trail.
 */
export function makeCharge({
  id = 'charge', name = 'CHARGE', icon = '⟫', desc = 'Charge sur plusieurs cases',
  duration = 60, damageType = 'blunt', dmgRange = [1, 1],
}){
  const colors = colorsFor(damageType);
  return {
    id, name, icon, duration,
    description: `${desc} · ${dmgRange[0]}-${dmgRange[1]} dmg`,
    phases: [
      { from: 0,  to: 18, label: 'preparation' },
      { from: 18, to: 36, label: 'dash' },
      { from: 36, to: 42, label: 'impact' },
      { from: 42, to: duration, label: 'recovery' },
    ],
    update(frame){
      const fx = [];
      let phase = 'idle';
      if(frame < 18) phase = 'charge_prep';
      else if(frame < 36) phase = 'charge_dash';
      else if(frame < 42) phase = 'charge_impact';
      else phase = 'recovery';

      const dashProgress = phase === 'charge_dash' ? (frame - 18) / 18 : 0;
      const opts = {
        attackPhase: phase,
        attackProgress: frame / duration,
        dashOffset: dashProgress * 30,
      };

      // Dash dust trail
      if(phase === 'charge_dash' && frame % 2 === 0){
        const dustX = dashProgress * 26;
        fx.push({
          type: 'particle',
          dx: dustX - 8, dy: 6,
          vx: -0.5 + Math.random() * 0.3, vy: -0.2,
          color: '#7a6850', size: 1.3,
          life: 18, gravity: 0.04,
        });
      }
      // Impact
      if(frame === 36){
        fx.push({
          type: 'flash', dx: 30, dy: -8,
          color: colors.glow, radius: 20, life: 18,
        });
        fx.push({
          type: 'shockwave', dx: 30, dy: 2,
          color: colors.primary, maxRadius: 30, life: 24,
        });
        fx.push({
          type: 'spark', dx: 30, dy: -8,
          count: 16, color: colors.secondary,
          speed: 2.8, spread: Math.PI * 1.5, life: 30, gravity: 0.1,
        });
      }
      return { opts, fx };
    },
  };
}

/**
 * AoE explosion / burst centré sur l'ennemi (boss skill).
 */
export function makeAoeBlast({
  id = 'blast', name = 'EXPLOSION', icon = '✺', desc = 'AoE 3×3',
  duration = 72, damageType = 'fire', dmgRange = [1, 1],
  radius = 38,
}){
  const colors = colorsFor(damageType);
  return {
    id, name, icon, duration,
    description: `${desc} · ${dmgRange[0]}-${dmgRange[1]} dmg`,
    phases: [
      { from: 0,  to: 30, label: 'charge' },
      { from: 30, to: 40, label: 'detonate' },
      { from: 40, to: duration, label: 'recovery' },
    ],
    update(frame){
      const fx = [];
      let phase = 'idle';
      if(frame < 30) phase = 'cast_charge';
      else if(frame < 40) phase = 'cast_release';
      else phase = 'recovery';
      const opts = { attackPhase: phase, attackProgress: frame / duration };

      // Charging vortex
      if(phase === 'cast_charge'){
        if(frame % 2 === 0){
          const a = frame * 0.4;
          const r = 18 - (frame / 30) * 12;
          fx.push({
            type: 'particle',
            dx: Math.cos(a) * r,
            dy: -10 + Math.sin(a) * r * 0.5,
            vx: -Math.cos(a) * 0.5,
            vy: -Math.sin(a) * 0.25,
            color: colors.primary, size: 1.6,
            life: 14, gravity: 0,
          });
        }
      }
      // Detonate
      if(frame === 30){
        fx.push({
          type: 'aoe', dx: 0, dy: 4,
          color: colors.primary, radius, life: 40, pulse: true,
        });
        fx.push({
          type: 'shockwave', dx: 0, dy: 4,
          color: colors.glow, maxRadius: radius * 1.2, life: 28,
        });
        fx.push({
          type: 'shockwave', dx: 0, dy: 4,
          color: colors.secondary, maxRadius: radius * 0.7, life: 20,
        });
        fx.push({
          type: 'flash', dx: 0, dy: -4,
          color: colors.glow, radius: 24, life: 18,
        });
        fx.push({
          type: 'spark', dx: 0, dy: -4,
          count: 28, color: colors.secondary,
          speed: 3, spread: Math.PI * 2, life: 36, gravity: 0.08,
        });
      }
      // Lingering particles
      if(phase === 'recovery' && frame % 3 === 0){
        const a = Math.random() * Math.PI * 2;
        const r = Math.random() * radius * 0.8;
        fx.push({
          type: 'particle',
          dx: Math.cos(a) * r,
          dy: Math.sin(a) * r * 0.4,
          vx: 0, vy: -0.4,
          color: colors.secondary, size: 1.2,
          life: 28, gravity: -0.02,
        });
      }
      return { opts, fx };
    },
  };
}

/**
 * Buff / aura passive ou active (rage, heal, shield).
 */
export function makeBuffAura({
  id = 'aura', name = 'AURA', icon = '◎', desc = 'Aura passive',
  duration = 999999, damageType = 'fire', looping = true,
}){
  const colors = colorsFor(damageType);
  return {
    id, name, icon, duration: 9999, looping,
    description: desc,
    passive: true,
    phases: [{ from: 0, to: 9999, label: 'passive' }],
    update(frame){
      const fx = [];
      const opts = { attackPhase: 'aura_pulse', attackProgress: (frame % 60) / 60 };
      // Continuous aura particles
      if(frame % 3 === 0){
        const a = Math.random() * Math.PI * 2;
        const r = 10 + Math.random() * 6;
        fx.push({
          type: 'particle',
          dx: Math.cos(a) * r,
          dy: -8 + Math.sin(a) * r * 0.4,
          vx: -Math.cos(a) * 0.15,
          vy: -0.3 - Math.random() * 0.2,
          color: colors.primary, size: 1.4,
          life: 28, gravity: -0.015,
        });
      }
      if(frame % 24 === 0){
        fx.push({
          type: 'shockwave', dx: 0, dy: 4,
          color: colors.glow, maxRadius: 20, life: 22,
        });
      }
      return { opts, fx };
    },
  };
}

/**
 * Status effect attack (poison spit, ice shard, etc.) — projectile rapide avec status.
 */
export function makeStatusProjectile({
  id = 'status', name = 'CRACHAT', icon = '⌀', desc = 'Projectile à statut',
  duration = 44, damageType = 'poison', dmgRange = [1, 1], status = 'Empoisonné',
}){
  const colors = colorsFor(damageType);
  return {
    id, name, icon, duration,
    description: `${desc} · ${dmgRange[0]}-${dmgRange[1]} dmg · Inflige ${status}`,
    projectile: {
      travelFrames: 18, arc: 8,
      trailColor: colors.glow,
      onHit: {
        type: 'aoe', color: colors.primary, radius: 16, life: 30, pulse: false,
      },
    },
    phases: [
      { from: 0,  to: 16, label: 'charge' },
      { from: 16, to: 20, label: 'release' },
      { from: 20, to: duration, label: 'recovery' },
    ],
    update(frame){
      const fx = [];
      let phase = 'idle';
      if(frame < 16) phase = 'aim';
      else if(frame < 20) phase = 'release';
      else phase = 'recovery';
      const opts = { attackPhase: phase, attackProgress: frame / duration };

      // Charge bubbles
      if(phase === 'aim' && frame % 3 === 0){
        fx.push({
          type: 'particle',
          dx: 0, dy: -10,
          vx: (Math.random() - 0.5) * 0.4,
          vy: -0.3,
          color: colors.primary, size: 1.2,
          life: 18, gravity: -0.02,
        });
      }
      // Release
      if(frame === 16){
        fx.push({
          type: 'spark', dx: 8, dy: -10,
          count: 6, color: colors.secondary,
          speed: 1.5, spread: 0.8, baseAngle: 0,
          life: 14, gravity: 0.06,
        });
        fx.push({
          type: 'projectile', useAttackProjectile: true,
          dx: 8, dy: -10,
        });
      }
      return { opts, fx };
    },
  };
}

/**
 * Idle "default" qui ne fait rien — sert si on veut juste afficher l'ennemi.
 */
export function makeIdle(){
  return {
    id: 'idle', name: 'REPOS', icon: '~', duration: 9999, looping: true,
    description: 'L\'ennemi attend.',
    passive: true,
    phases: [{ from: 0, to: 9999, label: 'idle' }],
    update(frame){ return { opts: { attackPhase: 'idle' }, fx: [] }; },
  };
}
