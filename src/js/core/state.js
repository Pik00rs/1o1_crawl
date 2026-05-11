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
  // Événements combat consommés par l'UI pour afficher floats (dmg/heal/miss/etc).
  // Chaque event : { type: 'damage'|'heal'|'dodge'|'parry'|'block'|'crit'|'status', x, y, value, color?, isCrit?, id }
  combatEvents: [],
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
  state.combatEvents = [];
}

// Helper pour pusher un event combat (utilisé par attack.js, status.js, etc.)
let _eventId = 0;
export function pushCombatEvent(evt){
  state.combatEvents.push({ id: ++_eventId, t: Date.now(), ...evt });
}
