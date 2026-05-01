// src/js/core/game.js
// Point d'entrée du jeu : initialisation, restart, exposition globale.

import { state, resetState } from './state.js';
import { DATA, loadAllData } from '../data/loader.js';
import { createPlayer } from '../entities/player.js';
import { createEnemy } from '../entities/enemy.js';
import { computeInitiative, startTurn, getCurrentActor, endTurn } from './turn.js';
import { hideCombatEnd } from '../ui/combat-end.js';
import { render } from '../ui/render.js';
import { log } from '../ui/log.js';

function initCombat(roomId = 'tutorial') {
  resetState();
  const room = DATA.rooms[roomId];
  if (!room) throw new Error(`Unknown room: ${roomId}`);

  state.gridWidth = room.width;
  state.gridHeight = room.height;
  state.walls = new Set(room.walls);

  state.player = createPlayer({ x: room.playerStart.x, y: room.playerStart.y });
  state.enemies = room.enemies.map((e, i) =>
    createEnemy(`${e.type}_${i}`, e.type, e.x, e.y)
  );
  state.actors = [state.player, ...state.enemies];
  computeInitiative();

  log('🎲 Combat initialisé. Cliquez sur une action puis sur une case cible.', 'info');
  log('💡 Astuce : survolez les boutons pour les descriptions.', 'info');

  startTurn(getCurrentActor());
  render();
}

export function restartCombat() {
  hideCombatEnd();
  initCombat('tutorial');
}

export async function startGame() {
  await loadAllData();
  // Expose DATA globalement (utilisé dans actions.js pour résoudre les skills par id)
  window.__DATA__ = DATA;

  // End turn button
  document.getElementById('end-turn-btn').onclick = () => {
    const cur = getCurrentActor();
    if (cur?.isPlayer && !state.combatOver) {
      log(`${state.player.name} termine son tour.`, 'info');
      endTurn();
    }
  };

  // Restart button (dans le modal)
  window.restartCombat = restartCombat;

  initCombat('tutorial');
}
