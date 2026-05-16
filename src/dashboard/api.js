// src/dashboard/api.js
//
// Couche d'abstraction Supabase pour toutes les lectures/écritures joueur.
// Toutes les pages doivent appeler requireAuth() (auth.js) avant tout autre call.

import { supabase } from './supabase-config.js';
import { getUser } from './auth.js';

function userId(){
  const u = getUser();
  if(!u) throw new Error('[api] No authenticated user. Call requireAuth() first.');
  return u.id;
}

// === CHEST ===
export async function loadChest(){
  const { data, error } = await supabase
    .from('chest_items')
    .select('data')
    .eq('user_id', userId());
  if(error){ console.error('[api] loadChest:', error); return []; }
  return (data || []).map(r => r.data);
}

export async function saveChest(arr){
  const uid = userId();
  const newIds = new Set((arr || []).map(it => it.instanceId).filter(Boolean));
  const { data: existing, error: errFetch } = await supabase
    .from('chest_items')
    .select('instance_id')
    .eq('user_id', uid);
  if(errFetch){ console.error('[api] saveChest fetch:', errFetch); return; }
  const existingIds = new Set((existing || []).map(r => r.instance_id));

  const toDelete = [...existingIds].filter(id => !newIds.has(id));
  if(toDelete.length > 0){
    const { error: errDel } = await supabase
      .from('chest_items')
      .delete()
      .eq('user_id', uid)
      .in('instance_id', toDelete);
    if(errDel) console.error('[api] saveChest delete:', errDel);
  }

  const rows = (arr || [])
    .filter(it => it && it.instanceId)
    .map(it => ({ instance_id: it.instanceId, user_id: uid, data: it }));
  if(rows.length > 0){
    const { error: errUp } = await supabase
      .from('chest_items')
      .upsert(rows, { onConflict: 'instance_id' });
    if(errUp) console.error('[api] saveChest upsert:', errUp);
  }
}

// === EQUIPPED ===
export async function loadEquipped(){
  const { data, error } = await supabase
    .from('equipped')
    .select('slot, item_data')
    .eq('user_id', userId());
  if(error){ console.error('[api] loadEquipped:', error); return {}; }
  const result = {};
  (data || []).forEach(r => { result[r.slot] = r.item_data; });
  return result;
}

export async function saveEquipped(obj){
  const uid = userId();
  const { error: errDel } = await supabase
    .from('equipped')
    .delete()
    .eq('user_id', uid);
  if(errDel){ console.error('[api] saveEquipped delete:', errDel); return; }
  const rows = Object.entries(obj || {})
    .filter(([_, item]) => item)
    .map(([slot, item]) => ({ user_id: uid, slot, item_data: item }));
  if(rows.length > 0){
    const { error: errIns } = await supabase.from('equipped').insert(rows);
    if(errIns) console.error('[api] saveEquipped insert:', errIns);
  }
}

// === WALLET ===
export async function loadWallet(){
  const { data, error } = await supabase
    .from('wallet')
    .select('resource_id, amount')
    .eq('user_id', userId());
  if(error){ console.error('[api] loadWallet:', error); return {}; }
  const result = {};
  (data || []).forEach(r => { result[r.resource_id] = r.amount; });
  return result;
}

export async function saveWallet(obj){
  const uid = userId();
  const rows = Object.entries(obj || {}).map(([resource_id, amount]) => ({
    user_id: uid,
    resource_id,
    amount: Number(amount) || 0,
  }));
  if(rows.length === 0) return;
  const { error } = await supabase
    .from('wallet')
    .upsert(rows, { onConflict: 'user_id,resource_id' });
  if(error) console.error('[api] saveWallet:', error);
}

// === FAVORITES ===
export async function loadFavorites(){
  const { data, error } = await supabase
    .from('favorites')
    .select('instance_id')
    .eq('user_id', userId());
  if(error){ console.error('[api] loadFavorites:', error); return new Set(); }
  return new Set((data || []).map(r => r.instance_id));
}

export async function saveFavorites(set){
  const uid = userId();
  const { error: errDel } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', uid);
  if(errDel){ console.error('[api] saveFavorites delete:', errDel); return; }
  const rows = [...(set || [])].map(instance_id => ({ user_id: uid, instance_id }));
  if(rows.length > 0){
    const { error: errIns } = await supabase.from('favorites').insert(rows);
    if(errIns) console.error('[api] saveFavorites insert:', errIns);
  }
}

// === BUILDS ===
export async function loadBuilds(){
  const { data, error } = await supabase
    .from('builds')
    .select('id, name, items, created_at')
    .eq('user_id', userId())
    .order('created_at', { ascending: true });
  if(error){ console.error('[api] loadBuilds:', error); return []; }
  return (data || []).map(r => ({ id: r.id, name: r.name, items: r.items || {} }));
}

export async function saveBuilds(arr){
  const uid = userId();
  const { data: existing, error: errFetch } = await supabase
    .from('builds')
    .select('id')
    .eq('user_id', uid);
  if(errFetch){ console.error('[api] saveBuilds fetch:', errFetch); return; }
  const existingIds = new Set((existing || []).map(r => r.id));
  const newIds = new Set((arr || []).map(b => b.id));
  const toDelete = [...existingIds].filter(id => !newIds.has(id));
  if(toDelete.length > 0){
    const { error: errDel } = await supabase
      .from('builds')
      .delete()
      .eq('user_id', uid)
      .in('id', toDelete);
    if(errDel) console.error('[api] saveBuilds delete:', errDel);
  }
  const rows = (arr || []).map(b => ({
    id: b.id, user_id: uid, name: b.name || 'Sans nom', items: b.items || {},
  }));
  if(rows.length > 0){
    const { error: errUp } = await supabase.from('builds').upsert(rows, { onConflict: 'id' });
    if(errUp) console.error('[api] saveBuilds upsert:', errUp);
  }
}

// === PROGRESS (donjons clean par biome × tier) ===
// Forme retournée :
//   { biomeId: { currentTierUnlocked, selectedTier, clearedByTier: { [tier]: [int] } } }
// Le schéma DB stocke en colonnes :
//   user_id, biome_id, current_tier_unlocked, selected_tier, cleared_by_tier (JSONB)
// Pour rétro-compat avec l'ancien schéma { tier, cleared_dungeons }, on garde un fallback
// de lecture si current_tier_unlocked est absent.
export async function loadProgress(){
  const { data, error } = await supabase
    .from('progress')
    .select('biome_id, tier, cleared_dungeons, current_tier_unlocked, selected_tier, cleared_by_tier')
    .eq('user_id', userId());
  if(error){ console.error('[api] loadProgress:', error); return {}; }
  const out = {};
  (data || []).forEach(r => {
    // Nouveau schéma prioritaire
    if(r.cleared_by_tier && typeof r.cleared_by_tier === 'object'){
      out[r.biome_id] = {
        currentTierUnlocked: r.current_tier_unlocked || 1,
        selectedTier: r.selected_tier || r.current_tier_unlocked || 1,
        clearedByTier: r.cleared_by_tier,
      };
    } else {
      // Legacy schéma → laissé tel quel, sera migré côté ascension-data.hydrateProgress
      out[r.biome_id] = {
        tier: r.tier || 1,
        clearedDungeons: Array.isArray(r.cleared_dungeons) ? r.cleared_dungeons : [],
      };
    }
  });
  return out;
}

/**
 * Marque un donjon comme cleared dans un tier donné, et débloque le tier suivant
 * si on a clean D6 (le boss).
 * @param {string} biomeId
 * @param {number} tier         1 à 10 (tier auquel on a joué le donjon)
 * @param {number} dungeonLevel 1 à 6
 */
export async function markDungeonCleared(biomeId, tier, dungeonLevel){
  const uid = userId();
  const MAX_TIER = 10;
  const t = Math.max(1, Math.min(MAX_TIER, tier | 0));
  const lvl = Math.max(1, Math.min(6, dungeonLevel | 0));

  // Charge l'état actuel pour ce biome
  const { data: existing, error: errFetch } = await supabase
    .from('progress')
    .select('current_tier_unlocked, selected_tier, cleared_by_tier, tier, cleared_dungeons')
    .eq('user_id', uid)
    .eq('biome_id', biomeId)
    .maybeSingle();
  if(errFetch){ console.error('[api] markDungeonCleared fetch:', errFetch); return; }

  // État de départ : migration legacy si besoin
  let currentTierUnlocked = 1;
  let selectedTier = 1;
  let clearedByTier = {};
  if(existing){
    if(existing.cleared_by_tier && typeof existing.cleared_by_tier === 'object'){
      currentTierUnlocked = existing.current_tier_unlocked || 1;
      selectedTier = existing.selected_tier || currentTierUnlocked;
      clearedByTier = { ...existing.cleared_by_tier };
    } else if(Array.isArray(existing.cleared_dungeons)){
      // Migration : on coule l'ancien dans le tier 1
      currentTierUnlocked = existing.tier || 1;
      selectedTier = currentTierUnlocked;
      clearedByTier = { 1: [...existing.cleared_dungeons] };
    }
  }

  // Ajoute le clear
  if(!clearedByTier[t]) clearedByTier[t] = [];
  if(!clearedByTier[t].includes(lvl)){
    clearedByTier[t].push(lvl);
    clearedByTier[t].sort((a, b) => a - b);
  }
  // Débloque tier suivant si D6 clean (et qu'on est pas déjà au-delà)
  if(lvl === 6 && t < MAX_TIER && t >= currentTierUnlocked){
    currentTierUnlocked = t + 1;
  }

  const { error: errUp } = await supabase
    .from('progress')
    .upsert({
      user_id: uid,
      biome_id: biomeId,
      current_tier_unlocked: currentTierUnlocked,
      selected_tier: selectedTier,
      cleared_by_tier: clearedByTier,
      // On garde aussi les colonnes legacy à jour pour ne pas casser d'éventuels anciens clients
      tier: currentTierUnlocked,
      cleared_dungeons: clearedByTier[selectedTier] || [],
    }, { onConflict: 'user_id,biome_id' });
  if(errUp) console.error('[api] markDungeonCleared upsert:', errUp);
}

/**
 * Sauvegarde le tier sélectionné par l'UI pour un biome (sans changer rien d'autre).
 * @param {string} biomeId
 * @param {number} tier  1 à currentTierUnlocked
 */
export async function saveSelectedTier(biomeId, tier){
  const uid = userId();
  const MAX_TIER = 10;
  const t = Math.max(1, Math.min(MAX_TIER, tier | 0));

  // On lit l'état pour valider que tier <= currentTierUnlocked, et on garde les autres champs.
  const { data: existing } = await supabase
    .from('progress')
    .select('current_tier_unlocked, selected_tier, cleared_by_tier, tier, cleared_dungeons')
    .eq('user_id', uid)
    .eq('biome_id', biomeId)
    .maybeSingle();
  if(!existing){
    // Pas encore d'entrée pour ce biome : on crée avec tier 1 (impossible de sélectionner T2+ sans avoir clean)
    const { error } = await supabase
      .from('progress')
      .upsert({
        user_id: uid,
        biome_id: biomeId,
        current_tier_unlocked: 1,
        selected_tier: 1,
        cleared_by_tier: {},
        tier: 1,
        cleared_dungeons: [],
      }, { onConflict: 'user_id,biome_id' });
    if(error) console.error('[api] saveSelectedTier upsert (new):', error);
    return;
  }
  const ctu = existing.current_tier_unlocked || existing.tier || 1;
  const sel = Math.min(t, ctu);
  const { error } = await supabase
    .from('progress')
    .upsert({
      user_id: uid,
      biome_id: biomeId,
      current_tier_unlocked: ctu,
      selected_tier: sel,
      cleared_by_tier: existing.cleared_by_tier || {},
      tier: existing.tier || ctu,
      cleared_dungeons: existing.cleared_dungeons || [],
    }, { onConflict: 'user_id,biome_id' });
  if(error) console.error('[api] saveSelectedTier upsert:', error);
}

// === BULK LOAD ===
export async function loadAllPlayerData(){
  const [chest, equipped, wallet, favorites, builds] = await Promise.all([
    loadChest(), loadEquipped(), loadWallet(), loadFavorites(), loadBuilds(),
  ]);
  return { chest, equipped, wallet, favorites, builds };
}
