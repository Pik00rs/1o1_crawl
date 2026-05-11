// src/js/combat/status.js
// Application et résolution des statuts.
// Étend avec :
//   - bleedResist sur target
//   - bleedDamage sur attaquant (augmente le power du bleed appliqué)
//   - elemStatusDuration sur attaquant (× durée statuts élémentaires)
//   - sick : -25% dmg infligés (lu par damage.js si on veut, mais ici on garde simple)
//   - electrocuted : -1 AP/tour
//   - paralyzed : skipTurn pendant N tours

import { DATA } from '../data/loader.js';
import { log } from '../ui/log.js';
import { pushCombatEvent } from '../core/state.js';
import {
  getEffectiveBleedPower,
  getEffectiveStatusDuration,
  rollStatusResist,
} from './modifiers.js';

/**
 * @param {object} target
 * @param {object} statusDef  { id, duration, power, chance? }
 * @param {object} [attacker] optionnel, pour bleedDamage / elemStatusDuration
 */
export function applyStatus(target, statusDef, attacker = null) {
  // Roll bleedResist
  if (rollStatusResist(target, statusDef.id)) return;

  // Ajuste power (bleed) et duration (elem) selon l'attaquant
  let effPower = statusDef.power || 0;
  let effDuration = statusDef.duration || 1;
  if (attacker) {
    if (statusDef.id === 'bleeding') {
      effPower = getEffectiveBleedPower(attacker, effPower);
    }
    effDuration = getEffectiveStatusDuration(attacker, statusDef.id, effDuration);
  }

  const existing = target.statuses.find(s => s.id === statusDef.id);
  if (existing) {
    existing.duration = Math.max(existing.duration, effDuration);
    existing.power = Math.max(existing.power || 0, effPower);
  } else {
    target.statuses.push({ ...statusDef, duration: effDuration, power: effPower });
  }
  const def = DATA.statuses?.[statusDef.id];
  const name = def?.name || statusDef.id;
  log(`${target.name} est ${name} !`, 'status');
}

export function tickDoTStatuses(actor) {
  for (const s of actor.statuses) {
    if (s.id === 'burning' || s.id === 'bleeding' || s.id === 'poisoned') {
      const dmg = s.power || 3;
      actor.hp -= dmg;
      const def = DATA.statuses?.[s.id];
      const statusName = def?.name || s.id;
      log(`${actor.name} subit ${dmg} dégâts (${statusName}).`, 'damage');
      // Map status → damageType for color
      const dmgType = s.id === 'burning' ? 'fire' : s.id === 'bleeding' ? 'slash' : 'poison';
      pushCombatEvent({ type: 'damage', x: actor.x, y: actor.y, value: dmg, damageType: dmgType, fromDoT: true });
    }
    // electrocuted : -1 AP/tour
    if (s.id === 'electrocuted' && actor.ap > 0) {
      actor.ap = Math.max(0, actor.ap - 1);
      log(`${actor.name} perd 1 AP (électrocuté).`, 'status');
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
    const def = DATA.statuses?.[s.id];
    return def && def.skipTurn;
  });
}
