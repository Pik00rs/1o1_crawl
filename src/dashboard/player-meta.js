// src/dashboard/player-meta.js
// Module partagé favoris + builds. Backend = api.js (Supabase).
//
// IMPORTANT : pour éviter d'avoir tous les appels en async dans les vues,
// on garde un CACHE EN MÉMOIRE qui est rafraîchi via `refreshMeta()` au boot
// de la page, puis lu de façon synchrone par les helpers `isFavorite()`,
// `isInAnyBuild()`, etc. À chaque mutation, le cache est mis à jour AVANT
// de persister (optimistic update), et la persistance se fait en arrière-plan.
//
// Usage type :
//   import { refreshMeta, isFavorite, toggleFavorite, ... } from './player-meta.js';
//   await refreshMeta();      // 1 fois au boot, après requireAuth()
//   const fav = isFavorite(itemId); // sync
//   await toggleFavorite(itemId);   // async (persiste)

import {
  loadFavorites as apiLoadFavorites,
  saveFavorites as apiSaveFavorites,
  loadBuilds as apiLoadBuilds,
  saveBuilds as apiSaveBuilds,
} from './api.js';

export const MAX_BUILDS = 5;

// === CACHE ===
let CACHE = {
  favorites: new Set(),
  builds: [],
  loaded: false,
};

/**
 * Recharge favoris + builds depuis l'API. À appeler 1 fois au boot après requireAuth().
 */
export async function refreshMeta(){
  const [favs, builds] = await Promise.all([
    apiLoadFavorites(),
    apiLoadBuilds(),
  ]);
  CACHE.favorites = favs;
  CACHE.builds = builds;
  CACHE.loaded = true;
}

// === FAVORITES ===
export function isFavorite(instanceId){
  return CACHE.favorites.has(instanceId);
}

export function getBuildsContainingItem(instanceId){
  return CACHE.builds.filter(b => Object.values(b.items || {}).some(id => id === instanceId));
}
export function isInAnyBuild(instanceId){
  return getBuildsContainingItem(instanceId).length > 0;
}

/**
 * Détermine si un item peut être supprimé (= n'est pas favori).
 */
export function canDelete(instanceId){
  return !isFavorite(instanceId);
}

/**
 * Toggle un favori. Refuse si l'item est dans un build (il reste favori auto).
 * Retourne le nouvel état booléen.
 */
export async function toggleFavorite(instanceId){
  if(CACHE.favorites.has(instanceId)){
    if(isInAnyBuild(instanceId)){
      // Verrouillé par un build, on garde favori
      return true;
    }
    CACHE.favorites.delete(instanceId);
  } else {
    CACHE.favorites.add(instanceId);
  }
  await apiSaveFavorites(CACHE.favorites);
  return CACHE.favorites.has(instanceId);
}

// === BUILDS ===
export function loadBuildsSync(){ return [...CACHE.builds]; }
export function getBuild(id){ return CACHE.builds.find(b => b.id === id) || null; }

/**
 * Crée un nouveau build (marque ses items en favori). Renvoie le build créé ou null si plein.
 */
export async function createBuild(name, items){
  if(CACHE.builds.length >= MAX_BUILDS) return null;
  const id = `build_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const build = {
    id,
    name: String(name || '').trim() || 'Sans nom',
    items: items || {},
  };
  CACHE.builds.push(build);
  // Auto-favori les items du build
  Object.values(build.items).forEach(iid => { if(iid) CACHE.favorites.add(iid); });
  await Promise.all([
    apiSaveBuilds(CACHE.builds),
    apiSaveFavorites(CACHE.favorites),
  ]);
  return build;
}

/**
 * Update un build (name et/ou items). Réajuste les favoris.
 */
export async function updateBuild(id, changes){
  const idx = CACHE.builds.findIndex(b => b.id === id);
  if(idx === -1) return null;
  const old = CACHE.builds[idx];
  const oldItemIds = new Set(Object.values(old.items || {}).filter(Boolean));
  if(typeof changes.name === 'string') old.name = changes.name.trim() || 'Sans nom';
  if(changes.items) old.items = changes.items;
  CACHE.builds[idx] = old;

  // Ajoute favoris pour nouveaux items
  const newItemIds = new Set(Object.values(old.items || {}).filter(Boolean));
  newItemIds.forEach(iid => CACHE.favorites.add(iid));
  // Retire favoris pour items qui ne sont plus dans AUCUN build
  oldItemIds.forEach(iid => {
    if(!newItemIds.has(iid) && !isInAnyBuild(iid)){
      CACHE.favorites.delete(iid);
    }
  });

  await Promise.all([
    apiSaveBuilds(CACHE.builds),
    apiSaveFavorites(CACHE.favorites),
  ]);
  return old;
}

/**
 * Supprime un build et nettoie les favoris orphelins.
 */
export async function deleteBuild(id){
  const target = CACHE.builds.find(b => b.id === id);
  if(!target) return false;
  const removedIds = Object.values(target.items || {}).filter(Boolean);
  CACHE.builds = CACHE.builds.filter(b => b.id !== id);
  // Pour chaque item retiré : si plus dans aucun autre build, retire le favori
  removedIds.forEach(iid => {
    if(!isInAnyBuild(iid)){
      CACHE.favorites.delete(iid);
    }
  });
  await Promise.all([
    apiSaveBuilds(CACHE.builds),
    apiSaveFavorites(CACHE.favorites),
  ]);
  return true;
}
