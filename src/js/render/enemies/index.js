// src/js/render/enemies/index.js
// Registry des sprites ennemis. Chaque ennemi exporte une fonction draw()
// avec la signature standard : (ctx, sx, sy, time, options).

// === INFERNO ===
import * as inferno_brute from './inferno_brute.js';
import * as inferno_caster from './inferno_caster.js';
import * as inferno_charger from './inferno_charger.js';
import * as inferno_archer from './inferno_archer.js';
import * as inferno_engineer from './inferno_engineer.js';
import * as inferno_berserker from './inferno_berserker.js';
import * as inferno_minibossDrone from './inferno_minibossDrone.js';
import * as inferno_boss from './inferno_boss.js';

export const ENEMY_SPRITES = {
  inferno_brute,
  inferno_caster,
  inferno_charger,
  inferno_archer,
  inferno_engineer,
  inferno_berserker,
  inferno_minibossDrone,
  inferno_boss,
};

/**
 * Récupère le sprite d'un ennemi par son id.
 * Retourne null si inconnu (le caller affiche un fallback).
 */
export function getEnemySprite(id){
  return ENEMY_SPRITES[id] || null;
}

/**
 * Liste des ids ayant un sprite custom (le reste utilisera un fallback).
 */
export function listSpritedEnemies(){
  return Object.keys(ENEMY_SPRITES);
}
