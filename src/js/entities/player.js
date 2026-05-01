// src/js/entities/player.js
// Création du joueur.

import { DATA } from '../data/loader.js';

export function createPlayer(config = {}) {
  const equipment = config.equipment || {
    mainhand: DATA.weapons.flameSword,
    offhand: DATA.armor.guardShield,
    boots: DATA.accessories.windBoots,
    ring: DATA.accessories.pyroRing,
  };

  return {
    id: 'player',
    name: config.name || 'Kael',
    icon: config.icon || '🧙',
    isPlayer: true,
    x: config.x || 1,
    y: config.y || 2,
    hp: 32, maxHp: 32,
    ap: 0, maxAp: 6,
    bonusAp: 1,
    armor: 14,
    initiative: 18,
    statuses: [],
    cooldowns: {},
    equipment,
    isDead: false,
  };
}
