// src/js/ui/panels.js
// Panneaux du HUD : stats joueur, équipement.

import { state } from '../core/state.js';
import { DATA } from '../data/loader.js';

export function renderPlayerInfo() {
  const p = state.player;
  if (!p) return;
  document.getElementById('hp-text').textContent = `${Math.max(0, p.hp)}/${p.maxHp}`;
  document.getElementById('hp-fill').style.width = (Math.max(0, p.hp) / p.maxHp * 100) + '%';
  const maxApTotal = p.maxAp + (p.bonusAp || 0);
  document.getElementById('ap-text').textContent = `${p.ap}/${maxApTotal}`;
  document.getElementById('ap-fill').style.width = (p.ap / maxApTotal * 100) + '%';
  document.getElementById('armor-text').textContent = p.armor;

  const statusEl = document.getElementById('status-text');
  if (p.statuses.length === 0) {
    statusEl.textContent = 'Aucun';
  } else {
    statusEl.textContent = p.statuses.map(s =>
      `${DATA.statuses[s.id].icon} ${DATA.statuses[s.id].name} (${s.duration})`
    ).join(', ');
  }
}

export function renderEquipment() {
  const cont = document.getElementById('equipment');
  if (!cont) return;
  cont.innerHTML = '';
  const eq = state.player.equipment;
  for (const slot in eq) {
    const it = eq[slot];
    if (!it) continue;
    const div = document.createElement('div');
    div.className = 'equip-slot';
    div.innerHTML = `<span class="equip-icon">${it.icon}</span><span class="rarity-${it.rarity}">${it.name}</span>`;
    div.title = it.description || '';
    cont.appendChild(div);
  }
}
