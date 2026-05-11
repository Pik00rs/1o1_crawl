// src/dashboard/auth.js
// Gestion de la session utilisateur (login, logout, profile, garde sur les pages).

import { supabase } from './supabase-config.js';

// === STATE EN MEMOIRE ===
let currentSession = null;     // raw Supabase session
let currentUser = null;        // user object
let currentProfile = null;     // profiles row { id, email, display_name, is_admin, ... }

// === LOAD SESSION (au boot) ===
/**
 * Récupère la session courante depuis Supabase (lit le localStorage interne).
 * À appeler EN PREMIER au boot de chaque page protégée.
 */
export async function loadSession(){
  const { data, error } = await supabase.auth.getSession();
  if(error){
    console.error('[auth] getSession failed:', error);
    return null;
  }
  currentSession = data.session;
  currentUser = data.session?.user || null;

  if(currentUser){
    await loadCurrentProfile();
  } else {
    currentProfile = null;
  }
  return currentSession;
}

/**
 * Charge le profil joueur depuis la table `profiles`.
 * Si le profil n'existe pas encore (premier login), on le crée.
 */
async function loadCurrentProfile(){
  if(!currentUser) return null;
  // Tentative de fetch
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', currentUser.id)
    .maybeSingle();

  if(error){
    console.error('[auth] failed to load profile:', error);
    return null;
  }

  if(!data){
    // Premier login : on crée le profil
    const insertRes = await supabase
      .from('profiles')
      .insert({
        id: currentUser.id,
        email: currentUser.email,
        display_name: currentUser.user_metadata?.full_name
          || currentUser.user_metadata?.name
          || currentUser.email?.split('@')[0]
          || 'Joueur',
        is_admin: false,
      })
      .select()
      .single();
    if(insertRes.error){
      console.error('[auth] failed to create profile:', insertRes.error);
      return null;
    }
    currentProfile = insertRes.data;
  } else {
    currentProfile = data;
  }
  return currentProfile;
}

// === GETTERS ===
export function getSession(){ return currentSession; }
export function getUser(){ return currentUser; }
export function getProfile(){ return currentProfile; }
export function isAuthenticated(){ return !!currentSession && !!currentUser; }
export function isAdmin(){ return !!currentProfile?.is_admin; }

// === LOGIN ===
/**
 * Lance le flux OAuth Google. Après confirmation Google, la redirection
 * ramène l'utilisateur sur `redirectTo` (par défaut : la racine du site).
 */
export async function signInWithGoogle(redirectTo){
  const finalRedirect = redirectTo || `${window.location.origin}/index.html`;
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: finalRedirect,
    },
  });
  if(error){
    console.error('[auth] OAuth init failed:', error);
    throw error;
  }
  return data;
}

// === LOGOUT ===
export async function signOut(){
  const { error } = await supabase.auth.signOut();
  if(error){
    console.error('[auth] signOut failed:', error);
    throw error;
  }
  currentSession = null;
  currentUser = null;
  currentProfile = null;
}

// === ROUTE GUARD ===
/**
 * À appeler au tout début du boot d'une page protégée.
 * Si pas de session, redirige vers `loginUrl` et retourne false.
 * Sinon, charge le profil et retourne true.
 *
 * Usage :
 *   const ok = await requireAuth();
 *   if(!ok) return; // la redirection est en cours, on stoppe le boot
 *   // ... suite du boot ...
 */
export async function requireAuth(loginUrl){
  await loadSession();
  if(!isAuthenticated()){
    const url = loginUrl || resolveLoginUrl();
    window.location.href = url;
    return false;
  }
  return true;
}

/**
 * Calcule le chemin vers login.html depuis n'importe où dans le site.
 * - Depuis index.html → src/dashboard/login.html
 * - Depuis src/dashboard/XXX.html → login.html
 */
function resolveLoginUrl(){
  const path = window.location.pathname;
  if(path.includes('/src/dashboard/')){
    return 'login.html';
  }
  return 'src/dashboard/login.html';
}

// === LISTENERS ===
/**
 * Écoute les changements d'auth (login, logout, refresh token).
 * Re-charge le profil au besoin et appelle le callback à chaque changement.
 */
export function onAuthChange(cb){
  return supabase.auth.onAuthStateChange(async (event, session) => {
    currentSession = session;
    currentUser = session?.user || null;
    if(currentUser){
      await loadCurrentProfile();
    } else {
      currentProfile = null;
    }
    if(cb) cb(event, session);
  });
}
