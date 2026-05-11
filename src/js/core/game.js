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
import { resetPerCombatFlags } from '../combat/attack.js';

let activePlayerConfig = null;

function initCombat(roomId = 'tutorial') {
  resetState();
  const room = DATA.rooms[roomId];
  if (!room) throw new Error(`Unknown room: ${roomId}`);

  state.gridWidth = room.width;
  state.gridHeight = room.height;
  state.walls = new Set(room.walls);

  const playerCfg = {
    ...(activePlayerConfig || {}),
    x: room.playerStart.x,
    y: room.playerStart.y,
  };
  state.player = createPlayer(playerCfg);

  // Reset les flags par-combat (firstHitConsumed, fortify, backstabbedTargets, etc.)
  resetPerCombatFlags(state.player);

  state.enemies = room.enemies.map((e, i) =>
    createEnemy(`${e.type}_${i}`, e.type, e.x, e.y)
  );
  state.actors = [state.player, ...state.enemies];
  computeInitiative();

  log('🎲 Combat initialisé. Cliquez sur une action puis sur une case cible.', 'info');
  if (state.player.level && state.player.stuffPreset) {
    log(`👤 Player niveau ${state.player.level} · Stuff "${state.player.stuffPreset}" · ${state.player.maxHp} PV · ${state.player.damage[0]}-${state.player.damage[1]} dmg`, 'info');
  }
  log('💡 Astuce : survolez les boutons pour les descriptions.', 'info');

  startTurn(getCurrentActor());
  render();
}

export function restartCombat() {
  hideCombatEnd();
  initCombat('tutorial');
}

export function setPlayerConfig(config) {
  activePlayerConfig = config;
}

export async function startGame(opts = {}) {
  await loadAllData();

  if (opts.injectRooms) {
    for (const [id, room] of Object.entries(opts.injectRooms)) {
      DATA.rooms[id] = room;
    }
  }
  if (opts.playerConfig) {
    activePlayerConfig = opts.playerConfig;
  }

  window.__DATA__ = DATA;

  document.getElementById('end-turn-btn').onclick = () => {
    const cur = getCurrentActor();
    if (cur?.isPlayer && !state.combatOver) {
      log(`${state.player.name} termine son tour.`, 'info');
      endTurn();
    }
  };

  window.restartCombat = restartCombat;
  initCombat(opts.startRoom || 'tutorial');
}
