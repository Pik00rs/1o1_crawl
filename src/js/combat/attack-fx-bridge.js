// src/js/combat/attack-fx-bridge.js
// Pont entre le combat (IA ennemie) et le système d'animation des attaques
// du bestiaire (FxSystem + roster d'attaques).
//
// Quand un ennemi attaque le joueur en combat, l'IA appelle:
//   triggerEnemyAttackFx(enemyId, targetScreenPos)
// Cela:
//   1. Picker la meilleure attaque du roster de cet ennemi (in-range, AP-affordable, max dmg)
//   2. Démarrer l'animation FX par-dessus le canvas iso
//   3. La boucle de rendu (game.html → renderLoop) appelle tickEnemyAttackFx()
//      qui fait avancer les frames et émet les FX au bon moment.
//   4. Le rendu se fait via renderEnemyAttackFx(ctx) appelé depuis renderLoop.
//
// Visuel découplé du gameplay: les dégâts s'appliquent immédiatement via
// performAttack(), le FX est juste un retour visuel passif.

import { FxSystem } from '../render/enemies/fx-system.js';
import { buildAttacksFor } from '../render/enemies/attack-roster.js';

// =============================================================================
// CACHE: roster d'attaques par enemyType. Construit à la première demande,
// pas besoin de pré-charger.
// =============================================================================
const _attackRosterCache = new Map();

function getRoster(enemyType, enemyData){
  if(_attackRosterCache.has(enemyType)){
    return _attackRosterCache.get(enemyType);
  }
  const roster = enemyData ? buildAttacksFor(enemyData) : null;
  _attackRosterCache.set(enemyType, roster);
  return roster;
}

// =============================================================================
// ANIMATIONS ACTIVES: array d'objets { attack, fx, frame, startPos, endPos, isPlayer }
// =============================================================================
const _activeAnims = [];

// =============================================================================
// PICK ATTACK: choisit la meilleure attaque d'un ennemi en fonction de la
// distance vers la cible et de l'AP dispo. Maximise les dégâts.
// =============================================================================

/**
 * Estime un score "dégâts" pour une attaque, à partir de sa description.
 * Les attaques portent leur "dmgRange" dans la description en clair ("X-Y dmg"),
 * mais aussi indirectement via les paramètres passés à makeXxx().
 * Pour faire simple, on parse la description ou on prend un score par défaut.
 */
function scoreAttack(attack){
  if(!attack || !attack.description) return 1;
  // Description type: "Frappe rapide · 9-15 dmg" ou "Frappe lourde · 12-20 dmg"
  const m = attack.description.match(/(\d+)\s*-\s*(\d+)\s*dmg/i);
  if(m){
    const max = parseInt(m[2], 10);
    return max;
  }
  // Sinon, AoE = score moyen ; idle/aura = score nul
  if(attack.passive) return 0;
  if(attack.id?.includes('blast') || attack.id?.includes('burst') || attack.id?.includes('aoe')) return 8;
  return 5;
}

/**
 * Estime si une attaque est "in-range" pour un ennemi qui tape sa cible.
 * - Mêlée = makeMeleeSwing / makeHeavyStrike → range ≈ 1
 * - Charge = makeCharge → range ≈ 3
 * - Ranged/Cast/Status = makeRangedShot/makeMagicCast/makeStatusProjectile → range ≈ enemy.range
 * - AoE = makeAoeBlast → centré sur attaquant, range ≈ rayon
 * On utilise un heuristique sur attack.id et attack.projectile.
 */
function attackInRange(attack, distance, enemyMaxRange){
  if(!attack || attack.passive) return false;
  // Attaques avec projectile = ranged
  if(attack.projectile) return distance <= (enemyMaxRange || 5);
  // Charge = range étendu
  if(attack.id?.includes('charge') || attack.id?.includes('dash')) return distance <= 3;
  // Aoe = on l'utilise même proche (centré sur attaquant)
  if(attack.id?.includes('blast') || attack.id?.includes('burst') || attack.id?.includes('aoe')
     || attack.id?.includes('plague') || attack.id?.includes('ultimate')
     || attack.id?.includes('blizzard') || attack.id?.includes('infernoBurst')
     || attack.id?.includes('corrupt') || attack.id?.includes('bloodbath')
     || attack.id?.includes('putrefaction') || attack.id?.includes('absolute_zero')
     || attack.id?.includes('system_crash')) {
    return distance <= 3;
  }
  // Default : mêlée
  return distance <= 1;
}

/**
 * Picker la meilleure attaque du roster pour cet ennemi.
 * - Roster vient de buildAttacksFor(enemyData) → { id1: attack1, id2: attack2, ... }
 * - On filtre par range, on prend celle au score max.
 * - Si rien ne matche → null (l'IA fera l'attaque générique fallback).
 */
export function pickBestAttack(enemyType, enemyData, distance, enemyMaxRange){
  const roster = getRoster(enemyType, enemyData);
  if(!roster) return null;

  let best = null;
  let bestScore = -1;
  for(const key of Object.keys(roster)){
    const attack = roster[key];
    if(!attack || attack.passive) continue;
    if(!attackInRange(attack, distance, enemyMaxRange)) continue;
    const score = scoreAttack(attack);
    if(score > bestScore){
      bestScore = score;
      best = attack;
    }
  }
  return best;
}

// =============================================================================
// TRIGGER FX: démarre l'animation visuelle pour un ennemi qui attaque.
// Visuel découplé : on ne bloque PAS le gameplay, l'IA continue normalement.
// =============================================================================

/**
 * Démarre une animation d'attaque ennemi.
 * @param {string} enemyType - id du renderer (ex: 'crimson_brawler')
 * @param {object} enemyData - entrée enemies.json pour construire le roster
 * @param {object} attackerScreenPos - {x, y} en CSS pixels (déjà projeté par isoToScreen)
 * @param {object} targetScreenPos - idem pour la cible
 * @param {number} distance - distance grille entre attaquant et cible
 * @param {number} enemyMaxRange - range max de l'ennemi
 * @returns {object|null} l'attaque jouée, ou null si rien
 */
export function triggerEnemyAttackFx(enemyType, enemyData, attackerScreenPos, targetScreenPos, distance, enemyMaxRange){
  const attack = pickBestAttack(enemyType, enemyData, distance, enemyMaxRange);
  if(!attack) return null;

  // Init une animation. Frame counter démarre à 0, on tick à 60fps via tickEnemyAttackFx().
  const anim = {
    attack,
    fx: new FxSystem(),
    frame: 0,
    duration: (attack.duration && attack.duration < 9999) ? attack.duration + 20 : 60,
    sx: attackerScreenPos.x,
    sy: attackerScreenPos.y,
    tx: targetScreenPos.x,
    ty: targetScreenPos.y,
    enemyType,
  };
  _activeAnims.push(anim);
  return attack;
}

// =============================================================================
// TICK FX: avance d'une frame toutes les animations actives et émet les FX.
// Appelé par game.html renderLoop() à 60fps.
// =============================================================================
export function tickEnemyAttackFx(){
  for(let i = _activeAnims.length - 1; i >= 0; i--){
    const anim = _activeAnims[i];
    let result = null;
    try {
      result = anim.attack.update(anim.frame, anim.attack.duration);
    } catch(e){
      // Si l'attaque plante, on retire silencieusement
      _activeAnims.splice(i, 1);
      continue;
    }

    if(result && result.fx){
      for(const cmd of result.fx){
        try {
          if(cmd.type === 'projectile' && cmd.useAttackProjectile && anim.attack.projectile){
            // Spawn projectile depuis attaquant vers cible
            const psx = anim.sx + (cmd.dx || 0);
            const psy = anim.sy + (cmd.dy || 0);
            anim.fx.spawnProjectile(psx, psy, anim.tx, anim.ty - 12, {
              travelFrames: anim.attack.projectile.travelFrames || 18,
              arc: anim.attack.projectile.arc || 0,
              color: anim.attack.projectile.trailColor || '#fff',
              glowColor: anim.attack.projectile.trailColor || '#fff',
              size: 2.5,
              onHit: anim.attack.projectile.onHit,
            });
          } else if(cmd.useTargetPosition){
            // Émet le FX à la position cible (ex: shockwave d'impact)
            anim.fx.emit({ ...cmd, dx: 0, dy: 0 }, anim.tx, anim.ty);
          } else {
            // Émet le FX à la position attaquant
            anim.fx.emit(cmd, anim.sx, anim.sy);
          }
        } catch(e){ /* skip silently */ }
      }
    }

    try { anim.fx.update(); } catch(e){}

    anim.frame++;
    if(anim.frame > anim.duration){
      _activeAnims.splice(i, 1);
    }
  }
}

// =============================================================================
// RENDER FX: dessine les animations actives par-dessus le canvas iso.
// Appelé par game.html renderLoop() après renderFrame().
// =============================================================================
export function renderEnemyAttackFx(ctx){
  for(const anim of _activeAnims){
    try {
      anim.fx.renderUnder(ctx);
      anim.fx.renderOver(ctx);
    } catch(e){ /* skip */ }
  }
}

// =============================================================================
// CLEAR (utile entre rooms ou au combat-end)
// =============================================================================
export function clearEnemyAttackFx(){
  for(const anim of _activeAnims){
    try { anim.fx.clear(); } catch(e){}
  }
  _activeAnims.length = 0;
}
