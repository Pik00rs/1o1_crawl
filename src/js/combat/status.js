// src/js/combat/status.js
// Application et résolution des statuts.

import { DATA } from '../data/loader.js';
import { log } from '../ui/log.js';

export function applyStatus(target, statusDef) {
  const existing = target.statuses.find(s => s.id === statusDef.id);
  if (existing) {
    existing.duration = Math.max(existing.duration, statusDef.duration);
    existing.power = Math.max(existing.power || 0, statusDef.power || 0);
  } else {
    target.statuses.push({ ...statusDef });
  }
  log(`${target.name} est ${DATA.statuses[statusDef.id].name} !`, 'status');
}

export function tickDoTStatuses(actor) {
  for (const s of actor.statuses) {
    if (s.id === 'burning' || s.id === 'bleeding') {
      const dmg = s.power || 3;
      actor.hp -= dmg;
      const statusName = DATA.statuses[s.id].name;
      log(`${actor.name} subit ${dmg} dégâts (${statusName}).`, 'damage');
    }
  }
}

export function tickStatusDurations(actor) {
  actor.statuses = actor.statuses.filter(s => {
    s.duration--;
    return s.duration > 0;
  });
}

export function isSkippedByStatus(actor) {
  return actor.statuses.some(s => {
    const def = DATA.statuses[s.id];
    return def && def.skipTurn;
  });
}
