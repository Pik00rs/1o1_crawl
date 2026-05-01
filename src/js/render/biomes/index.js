// src/js/render/biomes/index.js
// Registre central des biomes. Importe et expose tous les biomes disponibles.
//
// Pour ajouter un nouveau biome :
//   1) Créer src/js/render/biomes/<nom>.js sur le modèle de inferno.js
//   2) L'importer ici et l'ajouter à BIOMES.

import inferno from './inferno.js';
import cryo from './cryo.js';
import toxic from './toxic.js';
// import voidnet from './voidnet.js';  // à venir
// import crimson from './crimson.js';  // à venir

export const BIOMES = {
  inferno,
  cryo,
  toxic,
  // voidnet,
  // crimson,
};

/**
 * Récupère un biome par ID. Retourne inferno par défaut si l'ID n'existe pas.
 */
export function getBiome(id){
  return BIOMES[id] || BIOMES.inferno;
}

/**
 * Liste les IDs disponibles (pour l'UI).
 */
export function listBiomeIds(){
  return Object.keys(BIOMES);
}

/**
 * Liste les configs (pour l'UI : afficher noms + descriptions).
 */
export function listBiomeConfigs(){
  return Object.values(BIOMES).map(b => b.config);
}
