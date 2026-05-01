// src/js/entities/player.js
// Création du joueur avec système de stats de base + stuff modifiers.
//
// La source de vérité des stats vit dans player-stats.js (PLAYER_BASE_STATS,
// STUFF_PRESETS, applyStuff). Ici on traduit ces stats en objet "actor"
// que le moteur de combat sait consommer.

import { applyStuff } from './player-stats.js';

export function createPlayer(config = {}) {
  // Lit la config (level, stuff, ou stats déjà calculées)
  const level = config.level ?? 1;
  const stuff = config.stuff ?? 'balanced';
  const customMods = config.customModifiers ?? [];

  // Calcule les stats finales = base × niveau + stuff
  const stats = config.stats ?? applyStuff(level, stuff, customMods);

  return {
    id: 'player',
    name: config.name || 'Kael',
    icon: config.icon || '🧙',
    isPlayer: true,
    x: config.x ?? 1,
    y: config.y ?? 2,

    // Niveau & stuff (info)
    level,
    stuffPreset: stuff,

    // Vitalité
    hp: stats.maxHp,
    maxHp: stats.maxHp,
    ap: 0,
    maxAp: stats.maxAp,
    bonusAp: stats.bonusAp,

    // Combat
    damage: stats.damage,
    damageType: stats.damageType,
    armor: stats.armor,
    dodgeChance: stats.dodgeChance,
    blockChance: stats.blockChance,
    critChance: stats.critChance,
    critMultiplier: stats.critMultiplier,
    moveSpeed: stats.moveSpeed,
    range: stats.range,
    initiative: stats.initiative,

    // Régénération & vampirisme
    hpRegen: stats.hpRegen,
    lifesteal: stats.lifesteal,
    armorPen: stats.armorPen,

    // Élémentaires
    bonusFire: stats.bonusFire,
    bonusIce: stats.bonusIce,
    bonusShock: stats.bonusShock,
    bonusPoison: stats.bonusPoison,
    fireResist: stats.fireResist,
    iceResist: stats.iceResist,
    shockResist: stats.shockResist,
    poisonResist: stats.poisonResist,

    // CC
    ccReduction: stats.ccReduction,

    // État
    statuses: [],
    cooldowns: {},
    isDead: false,

    // Snapshot des stats finales pour debug / UI
    finalStats: stats,
  };
}
