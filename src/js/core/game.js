// src/js/core/game.js
// Point d'entrée du jeu : initialisation, restart, exposition globale.
// Supporte aussi les "custom runs" injectés par le module Playtest.

import { state, resetState } from './state.js';
import { DATA, loadAllData } from '../data/loader.js';
import { createPlayer } from '../entities/player.js';
import { createEnemy } from '../entities/enemy.js';
import { computeInitiative, startTurn, getCurrentActor, endTurn } from './turn.js';
import { hideCombatEnd } from '../ui/combat-end.js';
import { render } from '../ui/render.js';
import { log } from '../ui/log.js';

// Stocke la config player active (pour restart)
let activePlayerConfig = null;

function initCombat(roomId = 'tutorial') {
  resetState();
  const room = DATA.rooms[roomId];
  if (!room) throw new Error(`Unknown room: ${roomId}`);

  state.gridWidth = room.width;
  state.gridHeight = room.height;
  state.walls = new Set(room.walls);

  // Crée le joueur avec la config active (custom ou défaut)
  const playerCfg = {
    ...(activePlayerConfig || {}),
    x: room.playerStart.x,
    y: room.playerStart.y,
  };
  state.player = createPlayer(playerCfg);

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

/**
 * Définit la config du joueur pour les prochains combats.
 * Appelée par game.html quand un custom run est détecté.
 */
export function setPlayerConfig(config) {
  activePlayerConfig = config;
}

export async function startGame(opts = {}) {
  await loadAllData();

  // Permet à game.html d'injecter des rooms custom AVANT le démarrage
  if (opts.injectRooms) {
    for (const [id, room] of Object.entries(opts.injectRooms)) {
      DATA.rooms[id] = room;
    }
  }
  // Et la config player custom
  if (opts.playerConfig) {
    activePlayerConfig = opts.playerConfig;
  }

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

  // Démarre sur la room tutorial (qui peut avoir été overridée par injectRooms)
  initCombat(opts.startRoom || 'tutorial');
}
