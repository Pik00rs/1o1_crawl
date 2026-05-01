// src/js/ui/grid-render.js
// Rendu de la grille de combat.

import { state } from '../core/state.js';
import { isWall, getActorAt, getCellsInAOE, key } from '../grid/grid.js';
import { DATA } from '../data/loader.js';
import { getCurrentActor } from '../core/turn.js';
import { executeAction } from '../combat/actions.js';

export function renderGrid() {
  const grid = document.getElementById('grid');
  if (!grid) return;
  grid.innerHTML = '';

  for (let y = 0; y < state.gridHeight; y++) {
    for (let x = 0; x < state.gridWidth; x++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.x = x;
      cell.dataset.y = y;

      if (isWall(x, y)) cell.classList.add('wall');

      const k = key(x, y);
      if (state.targetingMode === 'move' && state.validTargets.has(k)) cell.classList.add('move-range');
      if ((state.targetingMode === 'attack' || state.targetingMode === 'aoe') && state.validTargets.has(k)) {
        const sk = state.selectedSkill;
        if (sk?.type === 'spell') cell.classList.add('spell-range');
        else cell.classList.add('attack-range');
      }
      if (state.aoePreview.has(k)) cell.classList.add('spell-aoe');
      if (state.fireTiles.has(k)) cell.classList.add('fire');

      const actor = getActorAt(x, y);
      if (actor) {
        const isCurrent = actor === getCurrentActor();
        cell.innerHTML = `<span style="filter: ${isCurrent ? 'drop-shadow(0 0 6px gold)' : ''}">${actor.icon}</span>`;
        const hpBar = document.createElement('div');
        hpBar.className = 'hp-bar';
        const hpFill = document.createElement('div');
        hpFill.className = 'hp-bar-fill' + (actor.isPlayer ? '' : ' enemy');
        hpFill.style.width = (actor.hp / actor.maxHp * 100) + '%';
        hpBar.appendChild(hpFill);
        cell.appendChild(hpBar);
        if (actor.statuses.length > 0) {
          const si = document.createElement('div');
          si.className = 'status-icons';
          si.innerHTML = actor.statuses.map(s => DATA.statuses[s.id].icon).join('');
          cell.appendChild(si);
        }
      } else if (state.fireTiles.has(k)) {
        cell.innerHTML = '🔥';
      }

      cell.addEventListener('click', () => onCellClick(x, y));
      cell.addEventListener('mouseenter', () => onCellHover(x, y));
      cell.addEventListener('mouseleave', () => { state.aoePreview = new Set(); renderGrid(); });

      grid.appendChild(cell);
    }
  }
}

function onCellHover(x, y) {
  const sk = state.selectedSkill;
  if (sk?.aoe && state.validTargets.has(key(x, y))) {
    state.aoePreview = new Set();
    getCellsInAOE(x, y, sk.aoe).forEach(c => state.aoePreview.add(key(c.x, c.y)));
    renderGrid();
  }
}

function onCellClick(x, y) {
  if (state.combatOver) return;
  const cur = getCurrentActor();
  if (!cur?.isPlayer) return;
  if (state.targetingMode) executeAction(x, y);
}
