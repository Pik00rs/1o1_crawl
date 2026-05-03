// src/js/dungeon/run-state.js
// Gestion de l'état runtime d'une run de donjon.
// Stocke la run générée dans sessionStorage pour la passer entre Ascension et run.html.

const STORAGE_KEY = 'rh_active_run';

/**
 * Persiste une run pour qu'elle soit lue par run.html.
 * On utilise sessionStorage pour que la run disparaisse à la fermeture de l'onglet.
 */
export function persistRun(run){
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(run));
    return true;
  } catch(e){
    console.error('Failed to persist run:', e);
    return false;
  }
}

/**
 * Récupère la run persistée. Retourne null si aucune.
 */
export function loadPersistedRun(){
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if(!raw) return null;
    return JSON.parse(raw);
  } catch(e){
    console.error('Failed to load run:', e);
    return null;
  }
}

/**
 * Efface la run persistée (à appeler quand la run est terminée et le loot consommé).
 */
export function clearPersistedRun(){
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch(e){
    console.error('Failed to clear run:', e);
  }
}

/**
 * Met à jour la run persistée (après changement d'état runtime).
 */
export function updatePersistedRun(updateFn){
  const run = loadPersistedRun();
  if(!run) return null;
  const updated = updateFn(run);
  persistRun(updated);
  return updated;
}
