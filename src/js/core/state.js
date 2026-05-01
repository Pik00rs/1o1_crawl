// src/js/core/state.js
// État global du jeu. Source de vérité unique.

export const state = {
  player: null, enemies: [], actors: [],
  turn: 0, currentActorIdx: 0, initiative: [],
  gridWidth: 8, gridHeight: 6,
  walls: new Set(), fireTiles: new Map(),
  selectedSkill: null, targetingMode: null,
  validTargets: new Set(), aoePreview: new Set(),
  log: [], combatOver: false,
};

export function resetState() {
  state.player = null;
  state.enemies = [];
  state.actors = [];
  state.turn = 0;
  state.currentActorIdx = 0;
  state.initiative = [];
  state.walls = new Set();
  state.fireTiles = new Map();
  state.selectedSkill = null;
  state.targetingMode = null;
  state.validTargets = new Set();
  state.aoePreview = new Set();
  state.log = [];
  state.combatOver = false;
}
