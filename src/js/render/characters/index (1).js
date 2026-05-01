// src/js/render/characters/index.js
// Registre central des personnages disponibles.
//
// Pour ajouter un nouveau type de personnage :
//   1) Créer src/js/render/characters/<nom>.js avec un export drawXxx() et xxxConfig
//   2) L'importer ici et l'enregistrer dans CHARACTER_RENDERERS

import hero from './hero.js';

/**
 * Map archetype → fonction de rendu.
 * Le système utilise actor.archetype pour choisir le bon renderer.
 */
export const CHARACTER_RENDERERS = {
  hero: hero.drawHero,
};

/**
 * Map des configs par défaut, pour instancier un actor depuis l'archetype.
 */
export const CHARACTER_CONFIGS = {
  hero: hero.heroConfig,
};

/**
 * Récupère la fonction de rendu d'un archetype donné.
 */
export function getCharacterRenderer(archetype){
  return CHARACTER_RENDERERS[archetype] || CHARACTER_RENDERERS.hero;
}

/**
 * Récupère la config par défaut d'un archetype.
 */
export function getCharacterConfig(archetype){
  return CHARACTER_CONFIGS[archetype] || CHARACTER_CONFIGS.hero;
}
