// src/js/ui/actions-ui.js
// Rendu du panneau d'actions.

import { state } from '../core/state.js';
import { getCurrentActor } from '../core/turn.js';
import { getPlayerSkills, selectMove, selectSkill } from '../combat/actions.js';

export function renderActions() {
  const cont = document.getElementById('actions');
  if (!cont) return;
  cont.innerHTML = '';

  const cur = getCurrentActor();
  const isPlayerTurn = cur?.isPlayer && !state.combatOver;

  // Move
  const moveBtn = document.createElement('button');
  moveBtn.className = 'action-btn';
  if (state.selectedSkill?.id === 'move') moveBtn.classList.add('selected');
  moveBtn.innerHTML = `🏃 Déplacement <span class="action-cost">1 AP / case</span>`;
  moveBtn.disabled = !isPlayerTurn || state.player.ap < 1;
  moveBtn.onclick = () => selectMove();
  cont.appendChild(moveBtn);

  // Skills
  const skills = getPlayerSkills();
  for (const sk of skills) {
    const btn = document.createElement('button');
    btn.className = 'action-btn';
    if (state.selectedSkill?.id === sk.id) btn.classList.add('selected');
    const cd = state.player.cooldowns[sk.id] || 0;
    let extra = `<span class="action-cost">${sk.cost} AP</span>`;
    if (cd > 0) extra = `<span class="action-cd">CD: ${cd}</span>` + extra;
    btn.innerHTML = `${sk.source.icon} ${sk.name} ${extra}<br><small style="color:#888">${sk.description || ''}</small>`;
    btn.disabled = !isPlayerTurn || state.player.ap < sk.cost || cd > 0;
    btn.onclick = () => selectSkill(sk);
    cont.appendChild(btn);
  }
}
