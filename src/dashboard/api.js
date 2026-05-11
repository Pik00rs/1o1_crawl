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

// === BULK LOAD ===
export async function loadAllPlayerData(){
  const [chest, equipped, wallet, favorites, builds] = await Promise.all([
    loadChest(), loadEquipped(), loadWallet(), loadFavorites(), loadBuilds(),
  ]);
  return { chest, equipped, wallet, favorites, builds };
}
