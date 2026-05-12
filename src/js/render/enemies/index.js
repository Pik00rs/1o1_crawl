// src/js/render/enemies/index.js
// Adapteur de compatibilité pour le bestiaire (et autres consommateurs legacy).
//
// Le bestiaire attend une API:
//   getEnemySprite(id) → { draw(ctx, x, y, t, opts), attacks: {...} }
//   ENEMY_SPRITES: { id: { draw, attacks, ... } }
//
// Nos nouveaux renderers iso ont une signature différente:
//   draw(ctx, cx, cy, actor, time, options)
//   actor = palette config (bodyColor, accentColor, ...)
//
// On adapte: pour chaque renderer iso, on construit un objet sprite-like
// qui wrap la signature pour rester compatible avec le bestiaire existant.

import { CHARACTER_RENDERERS, CHARACTER_CONFIGS } from '../characters/index.js';

/**
 * Construit un sprite-adapter à partir d'un renderer iso.
 * Retourne un objet compatible avec l'ancien format du bestiaire.
 */
function buildSpriteAdapter(id){
  const drawFn = CHARACTER_RENDERERS[id];
  const config = CHARACTER_CONFIGS[id];
  if(!drawFn || !config) return null;

  return {
    id,
    name: config.name || id,
    archetype: config.archetype || id,
    // Re-expose la palette pour les consommateurs qui regardent dedans
    palette: {
      bodyColor: config.bodyColor,
      accentColor: config.accentColor,
      glowColor: config.glowColor,
      skinColor: config.skinColor,
      hairColor: config.hairColor,
      capeColor: config.capeColor,
    },
    /**
     * Wrap la signature legacy:
     *   sprite.draw(ctx, x, y, t, opts)
     * vers la signature iso:
     *   draw(ctx, cx, cy, actor, time, options)
     *
     * - (x, y) = position des pieds, comme dans le renderer iso (cy = pieds)
     * - t = frame counter → on l'utilise comme `actor.idle` ET comme `time`
     *   pour avoir les animations qui tournent.
     * - opts (ancien) = options d'animation (used by attacks) → ignoré pour idle.
     */
    draw(ctx, x, y, t, opts = {}){
      const actor = {
        ...config,
        idle: t,
        target: opts.moving ? { x: x + 10, y } : null,
      };
      drawFn(ctx, x, y, actor, t, { fxLevel: 1, ...opts });
    },
    // Pas d'attaques codées dans les renderers iso pour le moment.
    // Le bestiaire affichera l'idle seul dans l'attack lab.
    attacks: null,
  };
}

// Build registry une seule fois au module load
const _registry = {};
for(const id of Object.keys(CHARACTER_RENDERERS)){
  if(id === 'hero') continue; // Pas un ennemi
  const adapter = buildSpriteAdapter(id);
  if(adapter) _registry[id] = adapter;
}

export const ENEMY_SPRITES = _registry;

export function getEnemySprite(enemyId){
  return _registry[enemyId] || null;
}

// Helper diagnostic
export function listEnemyIds(){
  return Object.keys(_registry);
}
