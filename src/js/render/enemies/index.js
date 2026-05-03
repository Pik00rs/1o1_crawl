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

// === CRYO ===
import * as cryo_brute from './cryo_brute.js';
import * as cryo_caster from './cryo_caster.js';
import * as cryo_skater from './cryo_skater.js';
import * as cryo_archer from './cryo_archer.js';
import * as cryo_shielder from './cryo_shielder.js';
import * as cryo_sentinel from './cryo_sentinel.js';
import * as cryo_minibossWarden from './cryo_minibossWarden.js';
import * as cryo_boss from './cryo_boss.js';

// === TOXIC ===
import * as toxic_brute from './toxic_brute.js';
import * as toxic_spitter from './toxic_spitter.js';
import * as toxic_swarmer from './toxic_swarmer.js';
import * as toxic_carrier from './toxic_carrier.js';
import * as toxic_grafted from './toxic_grafted.js';
import * as toxic_alpha from './toxic_alpha.js';
import * as toxic_minibossSpore from './toxic_minibossSpore.js';
import * as toxic_boss from './toxic_boss.js';

export const ENEMY_SPRITES = {
  // Inferno
  inferno_brute,
  inferno_caster,
  inferno_charger,
  inferno_archer,
  inferno_engineer,
  inferno_berserker,
  inferno_minibossDrone,
  inferno_boss,
  // Cryo
  cryo_brute,
  cryo_caster,
  cryo_skater,
  cryo_archer,
  cryo_shielder,
  cryo_sentinel,
  cryo_minibossWarden,
  cryo_boss,
  // Toxic
  toxic_brute,
  toxic_spitter,
  toxic_swarmer,
  toxic_carrier,
  toxic_grafted,
  toxic_alpha,
  toxic_minibossSpore,
  toxic_boss,
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
