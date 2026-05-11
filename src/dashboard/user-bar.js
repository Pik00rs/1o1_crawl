// src/dashboard/user-bar.js
// Injecte une barre user discrète en haut à droite de la page :
// - email/nom du user connecté
// - badge ADMIN si applicable
// - bouton "Déconnexion"

import { getUser, getProfile, isAdmin, signOut } from './auth.js';

/**
 * Injecte une barre user en haut à droite (position absolute, ne perturbe pas le layout).
 * À appeler après requireAuth().
 */
export function injectUserBar(){
  if(document.getElementById('rh-user-bar')) return; // déjà injecté

  const user = getUser();
  const profile = getProfile();
  if(!user) return;

  const displayName = profile?.display_name || user.email?.split('@')[0] || 'Joueur';
  const adminBadge = isAdmin() ? '<span class="rh-userbar-admin">ADMIN</span>' : '';

  const css = `
    .rh-userbar {
      position: fixed;
      top: 8px;
      right: 8px;
      z-index: 1000;
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(10, 13, 18, 0.92);
      border: 1px solid rgba(255, 255, 255, 0.12);
      padding: 5px 10px;
      font-family: 'Courier New', monospace;
      font-size: 10px;
      color: #a0a0a0;
      backdrop-filter: blur(4px);
    }
    .rh-userbar-name {
      color: #e8e8e8;
      font-weight: bold;
      letter-spacing: 0.5px;
    }
    .rh-userbar-admin {
      background: rgba(255, 100, 150, 0.2);
      color: #ff6699;
      border: 1px solid #ff6699;
      padding: 1px 5px;
      font-size: 8px;
      font-weight: bold;
      letter-spacing: 1px;
    }
    .rh-userbar-logout {
      background: transparent;
      border: 1px solid rgba(255, 89, 89, 0.4);
      color: #ff5959;
      font-family: inherit;
      font-size: 9px;
      padding: 3px 7px;
      cursor: pointer;
      letter-spacing: 1px;
      text-transform: uppercase;
    }
    .rh-userbar-logout:hover {
      background: #ff5959;
      color: #000;
    }
    @media (max-width: 600px) {
      .rh-userbar { font-size: 9px; padding: 4px 7px; }
      .rh-userbar-name { max-width: 80px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    }
  `;
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  const bar = document.createElement('div');
  bar.className = 'rh-userbar';
  bar.id = 'rh-user-bar';
  bar.innerHTML = `
    <span class="rh-userbar-name">${escapeHtml(displayName)}</span>
    ${adminBadge}
    <button class="rh-userbar-logout" id="rh-logout-btn">↗ DÉCO</button>
  `;
  document.body.appendChild(bar);

  document.getElementById('rh-logout-btn').addEventListener('click', async () => {
    if(!confirm('Se déconnecter ?')) return;
    try {
      await signOut();
      // Redirection vers login
      const path = window.location.pathname;
      const loginUrl = path.includes('/src/dashboard/') ? 'login.html' : 'src/dashboard/login.html';
      window.location.href = loginUrl;
    } catch(err){
      alert('Erreur : ' + (err.message || err));
    }
  });
}

function escapeHtml(s){
  return String(s || '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
}
