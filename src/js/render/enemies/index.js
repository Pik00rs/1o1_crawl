// src/js/render/enemies/index.js
// Adapteur de compatibilité bestiaire + injection des attaques.
//
// API consommée par bestiary.html:
//   getEnemySprite(id) → { draw(ctx, x, y, t, opts), attacks: {id: attackDef, ...}, ... }
//   ENEMY_SPRITES: { id: sprite, ... }
//
// Les attaques sont **chargées de façon paresseuse** depuis src/data/enemies.json
// car ce fichier n'est pas un module ES — on doit le fetch.
// Pour synchroniser, le bestiaire (qui charge déjà enemies.json) peut appeler
// attachAttacks(enemyData) après son fetch initial. Sinon on tente un fetch
// au premier accès via getEnemySprite.

import { CHARACTER_RENDERERS, CHARACTER_CONFIGS } from '../characters/index.js';
import { buildAttacksFor } from './attack-roster.js';

// Build sprite adapter wrapping the iso renderer (signature legacy → iso)
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
    /**
     * sprite.draw(ctx, x, y, t, opts) → wrap vers drawXxx(ctx, cx, cy, actor, time, options).
     * opts peut contenir `attackPhase` et `attackProgress` venant des attaques —
     * on les copie sur l'actor pour qu'un renderer puisse en tenir compte
     * (les renderers actuels ne les lisent pas, mais c'est prévu pour plus tard).
     */
    draw(ctx, x, y, t, opts = {}){
      const actor = {
        ...config,
        idle: t,
        target: opts.moving ? { x: x + 10, y } : null,
        attackPhase: opts.attackPhase || null,
        attackProgress: opts.attackProgress || 0,
        dashOffset: opts.dashOffset || 0,
      };
      const cx = (opts.dashOffset ? x + opts.dashOffset : x);
      drawFn(ctx, cx, y, actor, t, { fxLevel: 1, ...opts });
    },
    attacks: null, // injecté par attachAttacks() ou loadAttacksFor()
  };
}

// Build registry une seule fois au module load
const _registry = {};
for(const id of Object.keys(CHARACTER_RENDERERS)){
  if(id === 'hero') continue;
  const adapter = buildSpriteAdapter(id);
  if(adapter) _registry[id] = adapter;
}

export const ENEMY_SPRITES = _registry;

// ─────────────────────────────────────────────────────────────────────────────
// Attaques : chargement paresseux depuis enemies.json
// ─────────────────────────────────────────────────────────────────────────────
let _enemyDataCache = null;
let _enemyDataPromise = null;

async function fetchEnemyData(){
  if(_enemyDataCache) return _enemyDataCache;
  if(_enemyDataPromise) return _enemyDataPromise;
  _enemyDataPromise = (async () => {
    // Path relatif depuis ce fichier vers /src/data/enemies.json
    // location: src/js/render/enemies/index.js → src/data/enemies.json
    const url = new URL('../../../data/enemies.json', import.meta.url);
    const res = await fetch(url);
    if(!res.ok) throw new Error('enemies.json not loadable: ' + res.status);
    const json = await res.json();
    _enemyDataCache = json;
    return json;
  })();
  return _enemyDataPromise;
}

/**
 * Permet au bestiaire (ou autre consommateur) de pré-attacher les attaques
 * une fois qu'il a déjà fetché enemies.json.
 * Utile pour éviter un second fetch.
 */
export function attachAttacks(enemyData){
  if(!enemyData || !enemyData.id) return;
  const sprite = _registry[enemyData.id];
  if(!sprite) return;
  sprite.attacks = buildAttacksFor(enemyData);
  // Cache aussi pour usages futurs
  if(!_enemyDataCache) _enemyDataCache = {};
  _enemyDataCache[enemyData.id] = enemyData;
}

/**
 * Variante batch — accepte un array ou un dict.
 */
export function attachAttacksBatch(enemies){
  if(!enemies) return;
  if(Array.isArray(enemies)){
    for(const e of enemies) attachAttacks(e);
  } else {
    for(const id of Object.keys(enemies)) attachAttacks(enemies[id]);
  }
}

/**
 * Récupère le sprite + auto-load les attaques si pas encore fait.
 * Si fetch async nécessaire et appel synchrone, retourne le sprite sans attaques
 * (sera enrichi à la prochaine vérification une fois le JSON chargé).
 */
export function getEnemySprite(enemyId){
  const sprite = _registry[enemyId];
  if(!sprite) return null;
  if(!sprite.attacks){
    // Trigger lazy load (background) — ne bloque pas le retour
    fetchEnemyData().then(data => {
      const e = data && data[enemyId];
      if(e) sprite.attacks = buildAttacksFor(e);
    }).catch(err => {
      console.warn('[ENEMY_SPRITES] Could not load attacks for', enemyId, err.message);
    });
  }
  return sprite;
}

// Helper diagnostic
export function listEnemyIds(){
  return Object.keys(_registry);
}
