// src/js/ui/combat-end.js
// Modal de fin de combat (victoire / défaite).

import { rollLoot } from '../loot/generator.js';

export function showCombatEnd(victory) {
  const endEl = document.getElementById('combat-end');
  const titleEl = document.getElementById('end-title');
  const contentEl = document.getElementById('end-content');
  if (!endEl) return;

  if (victory) {
    titleEl.textContent = '🏆 Victoire !';
    titleEl.style.color = '#f0c060';
    const loot = rollLoot();
    contentEl.innerHTML = `
      <p style="margin-bottom:10px;">Vous avez vaincu vos ennemis !</p>
      <p style="margin-bottom:6px;"><strong>Butin trouvé :</strong></p>
      ${loot.map(l => `<div class="loot-item rarity-${l.rarity}">${l.icon} ${l.name}<br><small style="color:#888">${l.desc}</small></div>`).join('')}
    `;
  } else {
    titleEl.textContent = '💀 Défaite';
    titleEl.style.color = '#c44';
    contentEl.innerHTML = '<p>Vous avez été vaincu...</p>';
  }
  endEl.style.display = 'block';
}

export function hideCombatEnd() {
  const endEl = document.getElementById('combat-end');
  if (endEl) endEl.style.display = 'none';
}
