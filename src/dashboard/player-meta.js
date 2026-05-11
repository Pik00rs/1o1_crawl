// src/dashboard/player-meta.js
// Module partagé pour gérer favoris et builds (sets prédéfinis).
// Logique métier centrale :
//   - Un favori est un instanceId d'item dans rh_player_favorites
//   - Un build est { id, name, items: { slot: instanceId | null } }
//   - Si un item est dans AU MOINS UN build, il est forcément favori
//   - Si un item est retiré de tous les builds, son favori se retire aussi
//   - Limite max 5 builds
//
// API publique :
//   loadFavorites(), saveFavorites(set)
//   loadBuilds(), saveBuilds(arr)
//   isFavorite(instanceId)
//   toggleFavorite(instanceId) -> bool (nouveau état)
//   isInAnyBuild(instanceId) -> bool
//   getBuildsContainingItem(instanceId) -> Build[]
//   canDelete(instanceId) -> bool  (false si favori)
//   syncFavoritesWithBuilds() -> recalcule auto-favoris depuis builds
//
//   createBuild(name, items) -> Build (auto-marque les items en favori, return null si >= 5)
//   updateBuild(id, partialChanges) -> Build
//   deleteBuild(id) -> bool (retire les favoris devenus orphelins)
//   getBuild(id) -> Build
//   MAX_BUILDS = 5

export const MAX_BUILDS = 5;

const STORAGE_KEYS = {
  favorites: 'rh_player_favorites',
  builds:    'rh_player_builds',
};

// === FAVORITES (Set<string instanceId>) ===
export function loadFavorites(){
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.favorites);
    const arr = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(arr) ? arr : []);
  } catch(e){ return new Set(); }
}
export function saveFavorites(favSet){
  localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify([...favSet]));
}
export function isFavorite(instanceId){
  return loadFavorites().has(instanceId);
}

/**
 * Toggle d'un favori manuel. Si l'item est dans un build et qu'on tente de retirer,
 * on REFUSE (l'item reste favori automatiquement à cause du build).
 * Retourne le nouvel état.
 */
export function toggleFavorite(instanceId){
  const favs = loadFavorites();
  if(favs.has(instanceId)){
    // Vérifie si on a le droit de retirer (pas dans un build)
    if(isInAnyBuild(instanceId)){
      return true; // reste favori, on n'a pas pu changer
    }
    favs.delete(instanceId);
  } else {
    favs.add(instanceId);
  }
  saveFavorites(favs);
  return favs.has(instanceId);
}

// === BUILDS (array<Build>) ===
// Build = { id: string, name: string, items: { [slot]: instanceId | null } }
export function loadBuilds(){
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.builds);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch(e){ return []; }
}
export function saveBuilds(arr){
  localStorage.setItem(STORAGE_KEYS.builds, JSON.stringify(arr));
}
export function getBuild(id){
  return loadBuilds().find(b => b.id === id) || null;
}

/**
 * Retourne tous les builds qui contiennent cet instanceId.
 */
export function getBuildsContainingItem(instanceId){
  return loadBuilds().filter(b => {
    return Object.values(b.items || {}).some(id => id === instanceId);
  });
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
 * Resynchronise les favoris en fonction des builds :
 *   - tous les items dans un build sont marqués favoris (ajout auto)
 *   - les items qui n'étaient favoris QUE par le fait d'être dans un build
 *     mais qui n'y sont plus, sont retirés (best-effort : on retire ceux qui ne sont plus
 *     dans aucun build mais le user peut les remettre manuellement)
 *
 * Pour simplifier, on adopte la règle :
 *   - Au moment d'ajouter à un build : on add aux favoris
 *   - Au moment de retirer d'un build : si plus dans aucun build, on retire des favoris
 * Cette fonction sert principalement après une suppression de build.
 */
export function syncFavoritesAfterBuildChange(removedInstanceIds = []){
  const favs = loadFavorites();
  removedInstanceIds.forEach(id => {
    if(!isInAnyBuild(id)){
      favs.delete(id);
    }
  });
  saveFavorites(favs);
}

/**
 * Crée un nouveau build. Marque tous ses items comme favoris.
 * @param {string} name
 * @param {object} items - { mainhand: instanceId, offhand: instanceId, ... } (slots vides = null ou absent)
 * @returns {Build|null} null si limite atteinte
 */
export function createBuild(name, items){
  const builds = loadBuilds();
  if(builds.length >= MAX_BUILDS) return null;
  const id = `build_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const build = { id, name: String(name || '').trim() || 'Sans nom', items: items || {} };
  builds.push(build);
  saveBuilds(builds);
  // Auto-favori des items
  const favs = loadFavorites();
  Object.values(build.items).forEach(instanceId => {
    if(instanceId) favs.add(instanceId);
  });
  saveFavorites(favs);
  return build;
}

/**
 * Met à jour un build (name et/ou items).
 * Réajuste les favoris : ajoute pour les nouveaux items, retire pour les anciens qui ne sont plus liés à aucun build.
 */
export function updateBuild(id, changes){
  const builds = loadBuilds();
  const idx = builds.findIndex(b => b.id === id);
  if(idx === -1) return null;
  const old = builds[idx];
  const oldItemIds = new Set(Object.values(old.items || {}).filter(Boolean));

  if(typeof changes.name === 'string') old.name = changes.name.trim() || 'Sans nom';
  if(changes.items) old.items = changes.items;
  builds[idx] = old;
  saveBuilds(builds);

  // Ajoute favoris pour les nouveaux items
  const newItemIds = new Set(Object.values(old.items || {}).filter(Boolean));
  const favs = loadFavorites();
  newItemIds.forEach(iid => favs.add(iid));
  saveFavorites(favs);

  // Retire les favoris pour ceux qui n'étaient là QUE par ce build et n'y sont plus
  const removed = [...oldItemIds].filter(iid => !newItemIds.has(iid));
  syncFavoritesAfterBuildChange(removed);

  return old;
}

/**
 * Supprime un build et nettoie les favoris associés (si plus dans aucun autre build).
 */
export function deleteBuild(id){
  const builds = loadBuilds();
  const target = builds.find(b => b.id === id);
  if(!target) return false;
  const removedIds = Object.values(target.items || {}).filter(Boolean);
  const remaining = builds.filter(b => b.id !== id);
  saveBuilds(remaining);
  syncFavoritesAfterBuildChange(removedIds);
  return true;
}
