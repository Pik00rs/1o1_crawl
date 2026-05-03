// src/js/render/enemies/index.js
// Registry des sprites ennemis. Chaque ennemi exporte une fonction draw()
// avec la signature standard : (ctx, sx, sy, time, options).
//
// time : compteur de frame courant (pour idle bobbing, pulses, etc.)
// options : { armRaise, gauntletGlowBoost, auraRadius, bodyShift, glowBoost, ... }
//           specifique à chaque sprite, utilisé par les attaques pour modifier
//           la pose du sprite pendant une anim.
//
// Pour ajouter un nouveau sprite : créer un fichier biome/<id>.js qui
// exporte default { draw, palette } et l'enregistrer ici.

import * as inferno_brute from './inferno_brute.js';

export const ENEMY_SPRITES = {
  inferno_brute,
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
