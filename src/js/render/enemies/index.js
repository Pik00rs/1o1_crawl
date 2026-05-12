// src/js/render/enemies/index.js
// Adapteur de compatibilité bestiaire.
// VERSION DÉFENSIVE : pas de top-level await, tous les fails sont absorbés.

import { CHARACTER_RENDERERS, CHARACTER_CONFIGS } from '../characters/index.js';
import { buildAttacksFor } from './attack-roster.js';

function buildSpriteAdapter(id){
  const drawFn = CHARACTER_RENDERERS[id];
  const config = CHARACTER_CONFIGS[id];
  if(!drawFn || !config) return null;

  return {
    id,
    name: config.name || id,
    archetype: config.archetype || id,
    palette: {
      bodyColor: config.bodyColor,
      accentColor: config.accentColor,
      glowColor: config.glowColor,
      skinColor: config.skinColor,
      hairColor: config.hairColor,
      capeColor: config.capeColor,
    },
    draw(ctx, x, y, t, opts = {}){
      try {
        const actor = {
          ...config,
          idle: t,
          target: opts.moving ? { x: x + 10, y } : null,
          attackPhase: opts.attackPhase || null,
          attackProgress: opts.attackProgress || 0,
          dashOffset: opts.dashOffset || 0,
        };
        const cx = opts.dashOffset ? x + opts.dashOffset : x;
        drawFn(ctx, cx, y, actor, t, { fxLevel: 1, ...opts });
      } catch(e){
        // silencieux pour ne pas crash la boucle d'animation
      }
    },
    attacks: null,
  };
}

const _registry = {};
for(const id of Object.keys(CHARACTER_RENDERERS)){
  if(id === 'hero') continue;
  try {
    const adapter = buildSpriteAdapter(id);
    if(adapter) _registry[id] = adapter;
  } catch(e){
    console.warn('[ENEMY_SPRITES] adapter build failed:', id, e.message);
  }
}

export const ENEMY_SPRITES = _registry;

export function attachAttacks(enemyData){
  if(!enemyData || !enemyData.id) return;
  const sprite = _registry[enemyData.id];
  if(!sprite) return;
  try {
    sprite.attacks = buildAttacksFor(enemyData);
  } catch(e){
    console.warn('[ENEMY_SPRITES] attack build failed:', enemyData.id, e.message);
    sprite.attacks = null;
  }
}

export function attachAttacksBatch(enemies){
  if(!enemies) return;
  try {
    if(Array.isArray(enemies)){
      for(const e of enemies){
        try { attachAttacks(e); } catch(err){ /* skip silently */ }
      }
    } else {
      for(const id of Object.keys(enemies)){
        try { attachAttacks(enemies[id]); } catch(err){ /* skip silently */ }
      }
    }
  } catch(e){
    console.warn('[ENEMY_SPRITES] attachAttacksBatch failure:', e.message);
  }
}

export function getEnemySprite(enemyId){
  return _registry[enemyId] || null;
}

export function listEnemyIds(){
  return Object.keys(_registry);
}
