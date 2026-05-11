// src/dashboard/api.js
//
// Couche d'abstraction pour TOUTES les lectures/écritures de données joueur.
// Toutes les fonctions sont ASYNC dès maintenant, même si en backend localStorage
// c'est synchrone. Ça nous permet de swap pour Supabase plus tard sans refacto
// supplémentaire des pages appelantes.
//
// API:
//   await loadChest()           -> array<RolledItem>
//   await saveChest(arr)        -> void
//   await loadEquipped()        -> { [slot]: RolledItem }
//   await saveEquipped(obj)     -> void
//   await loadWallet()          -> { [resourceId]: number }
//   await saveWallet(obj)       -> void
//   await loadFavorites()       -> Set<instanceId>
//   await saveFavorites(set)    -> void
//   await loadBuilds()          -> array<Build>
//   await saveBuilds(arr)       -> void
//   await getProfile()          -> { id, isAdmin, ... } | null  (toujours null en localStorage mode)
//
// Mode :
//   - 'local' : tout en localStorage (par défaut, comportement actuel)
//   - 'supabase' : tout via SDK Supabase (Étape 2)

const STORAGE_KEYS = {
  chest:     'rh_player_chest',
  equipped:  'rh_player_equipped',
  wallet:    'rh_player_wallet',
  favorites: 'rh_player_favorites',
  builds:    'rh_player_builds',
};

// État runtime : peut être basculé depuis l'extérieur via setBackend('supabase')
const STATE = {
  backend: 'local',
  supabaseClient: null,
  currentUserId: null,
  currentProfile: null,
};

// === BACKEND SWITCHER ===
export function setBackend(name, opts = {}){
  STATE.backend = name;
  if(name === 'supabase'){
    STATE.supabaseClient = opts.client || null;
    STATE.currentUserId = opts.userId || null;
    STATE.currentProfile = opts.profile || null;
  }
}
export function getBackend(){ return STATE.backend; }
export function getCurrentProfile(){ return STATE.currentProfile; }
export function isAdmin(){ return !!STATE.currentProfile?.isAdmin; }

// === GENERIC JSON LOAD/SAVE (localStorage) ===
function loadLocalJson(key, fallback){
  try {
    const raw = localStorage.getItem(key);
    if(raw === null) return fallback;
    return JSON.parse(raw);
  } catch(e){
    console.warn(`[api] Failed to parse ${key}, returning fallback`, e);
    return fallback;
  }
}
function saveLocalJson(key, value){
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch(e){
    console.error(`[api] Failed to save ${key}`, e);
  }
}

// === CHEST ===
export async function loadChest(){
  if(STATE.backend === 'local'){
    const arr = loadLocalJson(STORAGE_KEYS.chest, []);
    return Array.isArray(arr) ? arr : [];
  }
  // TODO étape 3 : Supabase
  throw new Error('[api] Supabase backend not yet implemented');
}
export async function saveChest(arr){
  if(STATE.backend === 'local'){
    saveLocalJson(STORAGE_KEYS.chest, arr || []);
    return;
  }
  throw new Error('[api] Supabase backend not yet implemented');
}

// === EQUIPPED ===
export async function loadEquipped(){
  if(STATE.backend === 'local'){
    const obj = loadLocalJson(STORAGE_KEYS.equipped, {});
    return (obj && typeof obj === 'object') ? obj : {};
  }
  throw new Error('[api] Supabase backend not yet implemented');
}
export async function saveEquipped(obj){
  if(STATE.backend === 'local'){
    saveLocalJson(STORAGE_KEYS.equipped, obj || {});
    return;
  }
  throw new Error('[api] Supabase backend not yet implemented');
}

// === WALLET ===
export async function loadWallet(){
  if(STATE.backend === 'local'){
    const obj = loadLocalJson(STORAGE_KEYS.wallet, {});
    return (obj && typeof obj === 'object') ? obj : {};
  }
  throw new Error('[api] Supabase backend not yet implemented');
}
export async function saveWallet(obj){
  if(STATE.backend === 'local'){
    saveLocalJson(STORAGE_KEYS.wallet, obj || {});
    return;
  }
  throw new Error('[api] Supabase backend not yet implemented');
}

// === FAVORITES (Set<instanceId>) ===
export async function loadFavorites(){
  if(STATE.backend === 'local'){
    const arr = loadLocalJson(STORAGE_KEYS.favorites, []);
    return new Set(Array.isArray(arr) ? arr : []);
  }
  throw new Error('[api] Supabase backend not yet implemented');
}
export async function saveFavorites(set){
  if(STATE.backend === 'local'){
    saveLocalJson(STORAGE_KEYS.favorites, [...(set || [])]);
    return;
  }
  throw new Error('[api] Supabase backend not yet implemented');
}

// === BUILDS ===
export async function loadBuilds(){
  if(STATE.backend === 'local'){
    const arr = loadLocalJson(STORAGE_KEYS.builds, []);
    return Array.isArray(arr) ? arr : [];
  }
  throw new Error('[api] Supabase backend not yet implemented');
}
export async function saveBuilds(arr){
  if(STATE.backend === 'local'){
    saveLocalJson(STORAGE_KEYS.builds, arr || []);
    return;
  }
  throw new Error('[api] Supabase backend not yet implemented');
}

// === PROFILE (Étape 2+) ===
export async function getProfile(){
  if(STATE.backend === 'local'){
    return null; // En local, pas de notion de profil
  }
  throw new Error('[api] Supabase backend not yet implemented');
}

// === BULK LOAD pour la page d'accueil ===
// Évite plusieurs await en chaîne, charge tout en parallèle.
export async function loadAllPlayerData(){
  const [chest, equipped, wallet, favorites, builds] = await Promise.all([
    loadChest(),
    loadEquipped(),
    loadWallet(),
    loadFavorites(),
    loadBuilds(),
  ]);
  return { chest, equipped, wallet, favorites, builds };
}
