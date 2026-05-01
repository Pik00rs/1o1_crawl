import React, { useState, useMemo, useCallback } from 'react';
import { Sword, Shield, Skull, Zap, Heart, Sparkles, Play, FastForward, RotateCcw, ChevronRight, Trophy, Target, Activity } from 'lucide-react';

// ============ CONFIG ============

const TIER_CONFIG = {
  common: { color: '#9ca3af', label: 'Commun' },
  uncommon: { color: '#60a5fa', label: 'Peu commun' },
  rare: { color: '#fbbf24', label: 'Rare' },
  epic: { color: '#c084fc', label: 'Épique' },
  legendary: { color: '#fb923c', label: 'Légendaire' },
  set: { color: '#4ade80', label: 'Set' },
};

const TIER_AFFIX_COUNT = {
  common: 0, uncommon: 1, rare: 3, epic: 4, legendary: 4, set: 3,
};

const TIER_RANGE_MULT_FLAT = {
  uncommon: [0.7, 1.1], rare: [1.0, 1.6], epic: [1.4, 2.2], legendary: [2.0, 3.2], set: [1.3, 2.0],
};
const TIER_RANGE_MULT_PERCENT = {
  uncommon: [0.8, 1.05], rare: [1.0, 1.3], epic: [1.2, 1.6], legendary: [1.5, 2.0], set: [1.1, 1.4],
};
const ILVL_MULT_FLAT = { 1: 0.40, 2: 0.55, 3: 0.75, 4: 0.95, 5: 1.20, 6: 1.50, 7: 1.85, 8: 2.25, 9: 2.80, 10: 3.50 };
const ILVL_MULT_PERCENT = { 1: 0.50, 2: 0.65, 3: 0.80, 4: 0.95, 5: 1.10, 6: 1.25, 7: 1.40, 8: 1.55, 9: 1.65, 10: 1.75 };

const PERCENT_STATS = new Set([
  'critChance', 'critMultiplier', 'attackSpeed', 'bleedChance', 'bonusMagicDamage',
  'cooldownReduction', 'stunChance', 'fireResist', 'iceResist', 'shockResist',
  'poisonResist', 'magicFind', 'lifesteal', 'dodgeChance', 'spellCritChance',
  'tagResonance', 'rageOnHit', 'executeBonus', 'maxHpPercent', 'ccReduction',
  'blockChance', 'criticalDodgeChance', 'accuracy', 'elementalPenetration', 'riposteChance',
]);
const isPercent = (s) => PERCENT_STATS.has(s);

// ============ ENEMY ARCHETYPES ============

const ENEMY_ARCHETYPES = {
  brute: {
    name: 'Brute',
    icon: '👹',
    role: 'mob',
    baseHP: 35, baseDmg: [8, 14], damageType: 'blunt',
    armor: 4, range: 1, speed: 1,
    aiPriority: 'rush', // se rapproche pour mêlée
  },
  skirmisher: {
    name: 'Skirmisher',
    icon: '🗡️',
    role: 'mob',
    baseHP: 24, baseDmg: [6, 11], damageType: 'slash',
    armor: 2, range: 1, speed: 2, critChance: 10,
    aiPriority: 'rush',
  },
  caster: {
    name: 'Caster',
    icon: '🧙',
    role: 'mob',
    baseHP: 20, baseDmg: [10, 16], damageType: 'fire',
    armor: 1, range: 4, speed: 1, applyBurn: 30,
    aiPriority: 'kite', // garde distance
  },
  archer: {
    name: 'Archer',
    icon: '🏹',
    role: 'mob',
    baseHP: 22, baseDmg: [8, 13], damageType: 'pierce',
    armor: 2, range: 5, speed: 1,
    aiPriority: 'kite',
  },
  toxicMutant: {
    name: 'Mutant Toxique',
    icon: '☠️',
    role: 'mob',
    baseHP: 28, baseDmg: [5, 9], damageType: 'poison',
    armor: 3, range: 2, speed: 1, applyPoison: 50, lifesteal: 30,
    aiPriority: 'rush',
  },
  berserker: {
    name: 'Berserker',
    icon: '⚔️',
    role: 'elite',
    baseHP: 60, baseDmg: [12, 20], damageType: 'slash',
    armor: 5, range: 1, speed: 2, ragingAt: 50,
    aiPriority: 'rush',
  },
  sentinel: {
    name: 'Sentinelle',
    icon: '🛡️',
    role: 'elite',
    baseHP: 80, baseDmg: [9, 15], damageType: 'blunt',
    armor: 12, range: 1, speed: 1, riposte: 30,
    aiPriority: 'guard',
  },
  bossInferno: {
    name: 'Pyromancien Suprême',
    icon: '🔥',
    role: 'boss',
    baseHP: 220, baseDmg: [18, 28], damageType: 'fire',
    armor: 8, range: 5, speed: 1, applyBurn: 60, aoeDamage: true, aoeRadius: 1,
    biome: 'inferno',
    aiPriority: 'kite',
  },
  bossCryo: {
    name: 'Cryo-Reine',
    icon: '❄️',
    role: 'boss',
    baseHP: 250, baseDmg: [16, 24], damageType: 'ice',
    armor: 10, range: 4, speed: 1, applyChill: 50,
    biome: 'cryo',
    aiPriority: 'kite',
  },
  bossToxic: {
    name: 'Bête Putréfiée',
    icon: '🦠',
    role: 'boss',
    baseHP: 280, baseDmg: [14, 22], damageType: 'poison',
    armor: 6, range: 2, speed: 1, applyPoison: 80, lifesteal: 40,
    biome: 'toxic',
    aiPriority: 'rush',
  },
  bossVoid: {
    name: 'Architecte du Vide',
    icon: '⚡',
    role: 'boss',
    baseHP: 200, baseDmg: [20, 30], damageType: 'shock',
    armor: 5, range: 6, speed: 2, applyShock: 70, aoeDamage: true, aoeRadius: 1,
    biome: 'voidnet',
    aiPriority: 'kite',
  },
  bossCrimson: {
    name: 'Champion du Sang',
    icon: '🩸',
    role: 'boss',
    baseHP: 240, baseDmg: [22, 32], damageType: 'slash',
    armor: 7, range: 1, speed: 2, applyBleed: 70, executeBonus: 50,
    biome: 'crimson',
    aiPriority: 'rush',
  },
};

// Scale ennemi avec niveau du donjon (1-10)
function scaleEnemy(archetype, dungeonLevel) {
  // Multiplicateurs : niveau 1 = ×0.5, niveau 5 = ×1.0, niveau 10 = ×2.5
  const lvlMult = 0.4 + (dungeonLevel - 1) * 0.23;
  const hpMult = lvlMult * (archetype.role === 'boss' ? 1.5 : archetype.role === 'elite' ? 1.2 : 1.0);
  const dmgMult = lvlMult;

  return {
    ...archetype,
    maxHP: Math.round(archetype.baseHP * hpMult),
    hp: Math.round(archetype.baseHP * hpMult),
    damage: [Math.round(archetype.baseDmg[0] * dmgMult), Math.round(archetype.baseDmg[1] * dmgMult)],
    armor: Math.round(archetype.armor * lvlMult * 0.8),
    statuses: [],
    isAlive: true,
    dungeonLevel,
  };
}

// ============ ITEM POOL (simplifié pour le simulateur) ============

const WEAPON_POOL = {
  sword: { name: 'Épée', icon: '🗡️', baseDamage: [16, 24], type: 'slash', tags: ['Slash', 'Melee'], range: 1 },
  dagger: { name: 'Dague', icon: '🔪', baseDamage: [10, 18], type: 'pierce', tags: ['Pierce', 'Melee'], range: 1, critBonus: 8 },
  axe: { name: 'Hache', icon: '🪓', baseDamage: [18, 26], type: 'slash', tags: ['Slash', 'Bleed'], range: 1, bleedChance: 20 },
  mace: { name: 'Masse', icon: '🔨', baseDamage: [17, 25], type: 'blunt', tags: ['Blunt'], range: 1, stunChance: 15 },
  wand: { name: 'Wand', icon: '🪄', baseDamage: [10, 16], type: 'magic', tags: ['Magic'], range: 4 },
  pistol: { name: 'Pistolet', icon: '🔫', baseDamage: [13, 20], type: 'pierce', tags: ['Pierce', 'Ranged'], range: 4 },
  greatsword: { name: 'Épée 2 mains', icon: '⚔️', baseDamage: [28, 42], type: 'slash', tags: ['Slash', 'Heavy'], range: 1 },
  bow: { name: 'Arc', icon: '🏹', baseDamage: [24, 34], type: 'pierce', tags: ['Pierce', 'Ranged'], range: 5 },
  staff: { name: 'Bâton', icon: '🪄', baseDamage: [18, 28], type: 'magic', tags: ['Magic', 'Heavy'], range: 5 },
};

// ============ HELPERS ============

function rollInRange([min, max]) {
  return Math.round(min + Math.random() * (max - min));
}

function rollAffixValue(baseRange, tier, ilvl, statId) {
  const isPct = isPercent(statId);
  const tierTable = isPct ? TIER_RANGE_MULT_PERCENT : TIER_RANGE_MULT_FLAT;
  const ilvlTable = isPct ? ILVL_MULT_PERCENT : ILVL_MULT_FLAT;
  const tMult = tierTable[tier];
  const iMult = ilvlTable[ilvl];
  const min = baseRange[0] * tMult[0] * iMult;
  const max = baseRange[1] * tMult[1] * iMult;
  return Math.round(min + Math.random() * (max - min));
}

// Génère un item simplifié (juste les stats utiles au combat)
function generateSimItem(slot, ilvl, tier = null) {
  if (!tier) {
    const r = Math.random();
    if (r < 0.05) tier = 'legendary';
    else if (r < 0.15) tier = 'epic';
    else if (r < 0.4) tier = 'rare';
    else tier = 'uncommon';
  }

  const ilvlMult = ILVL_MULT_FLAT[ilvl];

  if (slot === 'weapon') {
    const weaponKeys = Object.keys(WEAPON_POOL);
    const wKey = weaponKeys[Math.floor(Math.random() * weaponKeys.length)];
    const w = WEAPON_POOL[wKey];
    return {
      slot, tier, ilvl, name: w.name, icon: w.icon,
      baseDamage: [Math.round(w.baseDamage[0] * ilvlMult), Math.round(w.baseDamage[1] * ilvlMult)],
      damageType: w.type,
      range: w.range,
      critBonus: w.critBonus || 0,
      bleedChance: w.bleedChance || 0,
      stunChance: w.stunChance || 0,
      tags: [...w.tags],
      // Affixes : bonus dégâts élémentaires + crit, etc.
      affixes: rollWeaponAffixes(tier, ilvl),
    };
  }

  if (['head', 'chest', 'legs', 'gloves', 'boots'].includes(slot)) {
    const armorBase = { head: 7, chest: 10, legs: 6, gloves: 4, boots: 4 }[slot];
    const hpBase = { head: 0, chest: 22, legs: 8, gloves: 0, boots: 0 }[slot];
    return {
      slot, tier, ilvl,
      name: { head: 'Casque', chest: 'Veste', legs: 'Pantalon', gloves: 'Gants', boots: 'Bottes' }[slot],
      icon: { head: '⛑️', chest: '🦺', legs: '👖', gloves: '🧤', boots: '👢' }[slot],
      armor: Math.round(armorBase * ilvlMult),
      maxHP: Math.round(hpBase * ilvlMult),
      affixes: rollArmorAffixes(slot, tier, ilvl),
    };
  }

  if (slot === 'offhand') {
    return {
      slot, tier, ilvl, name: 'Bouclier', icon: '🛡️',
      armor: Math.round(10 * ilvlMult),
      blockChance: rollAffixValue([10, 25], tier, ilvl, 'blockChance'),
      affixes: rollArmorAffixes('offhand', tier, ilvl),
    };
  }

  if (slot === 'amulet') {
    return {
      slot, tier, ilvl, name: 'Amulette', icon: '📿',
      affixes: rollAccessoryAffixes(tier, ilvl),
    };
  }

  if (slot === 'ring') {
    return {
      slot, tier, ilvl, name: 'Anneau', icon: '💍',
      affixes: rollAccessoryAffixes(tier, ilvl),
    };
  }
}

function rollWeaponAffixes(tier, ilvl) {
  const count = TIER_AFFIX_COUNT[tier] || 0;
  const pool = [
    { stat: 'bonusFireDamage', range: [4, 10] },
    { stat: 'bonusIceDamage', range: [4, 10] },
    { stat: 'bonusShockDamage', range: [4, 10] },
    { stat: 'bonusPoisonDamage', range: [4, 9] },
    { stat: 'critChance', range: [4, 10] },
    { stat: 'critMultiplier', range: [12, 30] },
    { stat: 'lifesteal', range: [3, 8] },
    { stat: 'executeBonus', range: [10, 22] },
    { stat: 'armorPenetration', range: [3, 8] },
    { stat: 'bleedChance', range: [10, 22] },
  ];
  const used = new Set();
  const affixes = [];
  for (let i = 0; i < count; i++) {
    const candidates = pool.filter(p => !used.has(p.stat));
    if (candidates.length === 0) break;
    const pick = candidates[Math.floor(Math.random() * candidates.length)];
    used.add(pick.stat);
    affixes.push({ stat: pick.stat, value: rollAffixValue(pick.range, tier, ilvl, pick.stat) });
  }
  return affixes;
}

function rollArmorAffixes(slot, tier, ilvl) {
  const count = TIER_AFFIX_COUNT[tier] || 0;
  const pool = [
    { stat: 'maxHP', range: [10, 22] },
    { stat: 'maxHpPercent', range: [2, 5] },
    { stat: 'armor', range: [4, 10] },
    { stat: 'fireResist', range: [8, 18] },
    { stat: 'iceResist', range: [8, 18] },
    { stat: 'shockResist', range: [8, 18] },
    { stat: 'poisonResist', range: [8, 18] },
    { stat: 'dodgeChance', range: [4, 10] },
    { stat: 'thornsDamage', range: [3, 8] },
    { stat: 'ccReduction', range: [6, 15] },
    { stat: 'criticalDodgeChance', range: [3, 8] },
    { stat: 'hpRegen', range: [2, 5] },
    { stat: 'critChance', range: [4, 10] },
  ];
  if (slot === 'offhand') pool.push({ stat: 'blockChance', range: [4, 10] });

  const used = new Set();
  const affixes = [];
  for (let i = 0; i < count; i++) {
    const candidates = pool.filter(p => !used.has(p.stat));
    if (candidates.length === 0) break;
    const pick = candidates[Math.floor(Math.random() * candidates.length)];
    used.add(pick.stat);
    affixes.push({ stat: pick.stat, value: rollAffixValue(pick.range, tier, ilvl, pick.stat) });
  }
  return affixes;
}

function rollAccessoryAffixes(tier, ilvl) {
  const count = TIER_AFFIX_COUNT[tier] || 0;
  const pool = [
    { stat: 'maxHP', range: [10, 22] },
    { stat: 'critChance', range: [4, 10] },
    { stat: 'critMultiplier', range: [12, 30] },
    { stat: 'lifesteal', range: [3, 8] },
    { stat: 'cooldownReduction', range: [5, 12] },
    { stat: 'bonusFireDamage', range: [4, 10] },
    { stat: 'bonusIceDamage', range: [4, 10] },
    { stat: 'bonusShockDamage', range: [4, 10] },
    { stat: 'fireResist', range: [8, 18] },
    { stat: 'iceResist', range: [8, 18] },
    { stat: 'executeBonus', range: [10, 22] },
  ];
  const used = new Set();
  const affixes = [];
  for (let i = 0; i < count; i++) {
    const candidates = pool.filter(p => !used.has(p.stat));
    if (candidates.length === 0) break;
    const pick = candidates[Math.floor(Math.random() * candidates.length)];
    used.add(pick.stat);
    affixes.push({ stat: pick.stat, value: rollAffixValue(pick.range, tier, ilvl, pick.stat) });
  }
  return affixes;
}

// ============ AGRÉGATION DES STATS DU JOUEUR ============

function aggregateStats(equipment) {
  const stats = {
    maxHpFlat: 0, maxHpPercent: 0, armor: 0,
    bonusFireDamage: 0, bonusIceDamage: 0, bonusShockDamage: 0, bonusPoisonDamage: 0,
    critChance: 0, critMultiplier: 0,
    fireResist: 0, iceResist: 0, shockResist: 0, poisonResist: 0,
    dodgeChance: 0, thornsDamage: 0, ccReduction: 0, criticalDodgeChance: 0,
    blockChance: 0, hpRegen: 0, lifesteal: 0,
    executeBonus: 0, armorPenetration: 0,
    cooldownReduction: 0, bleedChance: 0, stunChance: 0,
  };

  for (const slot in equipment) {
    const item = equipment[slot];
    if (!item) continue;

    if (item.armor) stats.armor += item.armor;
    if (item.maxHP) stats.maxHpFlat += item.maxHP;
    if (item.blockChance) stats.blockChance += item.blockChance;
    if (item.critBonus) stats.critChance += item.critBonus;
    if (item.bleedChance) stats.bleedChance += item.bleedChance;
    if (item.stunChance) stats.stunChance += item.stunChance;

    if (item.affixes) {
      for (const a of item.affixes) {
        if (a.stat === 'maxHP') stats.maxHpFlat += a.value;
        else if (stats[a.stat] !== undefined) stats[a.stat] += a.value;
      }
    }
  }

  return stats;
}

function buildPlayer(level, equipment) {
  const baseHP = 30 + level * 5;
  const stats = aggregateStats(equipment);
  const maxHP = Math.round((baseHP + stats.maxHpFlat) * (1 + stats.maxHpPercent / 100));
  const weapon = equipment.weapon;
  const baseDmg = weapon ? weapon.baseDamage : [8, 12];
  const damageType = weapon ? weapon.damageType : 'blunt';
  const range = weapon ? weapon.range : 1;

  return {
    name: 'Joueur',
    icon: '🧑',
    level,
    maxHP, hp: maxHP,
    ap: 6,
    damage: baseDmg,
    damageType,
    range,
    armor: stats.armor,
    critChance: 5 + stats.critChance,
    critMultiplier: 100 + stats.critMultiplier, // base ×2.0 = 100% bonus
    bonusFireDamage: stats.bonusFireDamage,
    bonusIceDamage: stats.bonusIceDamage,
    bonusShockDamage: stats.bonusShockDamage,
    bonusPoisonDamage: stats.bonusPoisonDamage,
    fireResist: stats.fireResist,
    iceResist: stats.iceResist,
    shockResist: stats.shockResist,
    poisonResist: stats.poisonResist,
    dodgeChance: stats.dodgeChance,
    thornsDamage: stats.thornsDamage,
    ccReduction: stats.ccReduction,
    criticalDodgeChance: stats.criticalDodgeChance,
    blockChance: stats.blockChance,
    hpRegen: stats.hpRegen,
    lifesteal: stats.lifesteal,
    executeBonus: stats.executeBonus,
    armorPenetration: stats.armorPenetration,
    bleedChance: stats.bleedChance,
    stunChance: stats.stunChance,
    statuses: [],
    isAlive: true,
    isPlayer: true,
  };
}

// ============ COMBAT ENGINE ============

function calculateDamage(attacker, target, isPlayer) {
  // Base damage + bonus élémentaires
  let dmg = rollInRange(attacker.damage);
  const dmgType = attacker.damageType;

  // Add elemental bonuses (joueur uniquement, ennemis n'ont pas ces stats)
  if (isPlayer) {
    if (dmgType === 'fire' || dmgType === 'magic') dmg += attacker.bonusFireDamage || 0;
    if (dmgType === 'ice') dmg += attacker.bonusIceDamage || 0;
    if (dmgType === 'shock') dmg += attacker.bonusShockDamage || 0;
    if (dmgType === 'poison') dmg += attacker.bonusPoisonDamage || 0;
    // Dégâts élémentaires "splash" — toujours appliqués même sur attaque physique
    dmg += (attacker.bonusFireDamage || 0);
  }

  // Crit roll
  let isCrit = Math.random() * 100 < (attacker.critChance || 5);
  if (isCrit) {
    // Esquive critique du target
    if (Math.random() * 100 < (target.criticalDodgeChance || 0)) {
      isCrit = false; // crit converti en hit normal
    } else {
      dmg = Math.round(dmg * ((attacker.critMultiplier || 100) / 100 + 1));
    }
  }

  // Esquive complète
  if (Math.random() * 100 < (target.dodgeChance || 0)) {
    return { damage: 0, dodged: true, isCrit: false };
  }

  // Bloc (réduit de 50%)
  let blocked = false;
  if (Math.random() * 100 < (target.blockChance || 0)) {
    dmg = Math.round(dmg * 0.5);
    blocked = true;
  }

  // Armor mitigation : armor réduit les dégâts physiques
  const isPhysical = ['slash', 'pierce', 'blunt'].includes(dmgType);
  if (isPhysical) {
    const effectiveArmor = Math.max(0, (target.armor || 0) - (attacker.armorPenetration || 0));
    dmg = Math.max(1, dmg - effectiveArmor);
  } else {
    // Résistance élémentaire (en %)
    let resist = 0;
    if (dmgType === 'fire') resist = target.fireResist || 0;
    if (dmgType === 'ice') resist = target.iceResist || 0;
    if (dmgType === 'shock') resist = target.shockResist || 0;
    if (dmgType === 'poison') resist = target.poisonResist || 0;
    resist = Math.min(75, resist); // cap résistance à 75%
    dmg = Math.max(1, Math.round(dmg * (1 - resist / 100)));
  }

  // Execute bonus (joueur uniquement)
  if (isPlayer && attacker.executeBonus && target.hp / target.maxHP < 0.3) {
    dmg = Math.round(dmg * (1 + attacker.executeBonus / 100));
  }

  return { damage: dmg, dodged: false, blocked, isCrit };
}

function applyStatus(target, statusId, duration, power = 1) {
  // Réduction CC
  if (['stunned', 'frozen', 'rooted', 'silenced', 'chilled', 'slowed'].includes(statusId) && target.ccReduction) {
    duration = Math.max(1, Math.round(duration * (1 - target.ccReduction / 100)));
  }
  target.statuses.push({ id: statusId, duration, power });
}

function tickStatuses(entity, log) {
  const newStatuses = [];
  let totalDotDamage = 0;
  for (const s of entity.statuses) {
    // DoT
    if (s.id === 'burning') {
      const d = Math.max(1, Math.round(s.power * (1 - (entity.fireResist || 0) / 100)));
      entity.hp -= d;
      totalDotDamage += d;
      log.push(`${entity.icon} subit ${d} brûlure 🔥`);
    } else if (s.id === 'poisoned') {
      const d = Math.max(1, Math.round(s.power * (1 - (entity.poisonResist || 0) / 100)));
      entity.hp -= d;
      totalDotDamage += d;
      log.push(`${entity.icon} subit ${d} poison ☠️`);
    } else if (s.id === 'bleeding') {
      // Saignement ignore l'armure
      entity.hp -= s.power;
      totalDotDamage += s.power;
      log.push(`${entity.icon} saigne ${s.power} 🩸`);
    } else if (s.id === 'shocked') {
      const d = Math.max(1, Math.round(s.power * (1 - (entity.shockResist || 0) / 100)));
      entity.hp -= d;
      totalDotDamage += d;
      log.push(`${entity.icon} électrocuté ${d} ⚡`);
    } else if (s.id === 'chilled') {
      const d = Math.max(1, Math.round(s.power * (1 - (entity.iceResist || 0) / 100)));
      entity.hp -= d;
      totalDotDamage += d;
      log.push(`${entity.icon} subit ${d} froid ❄️`);
    }

    s.duration -= 1;
    if (s.duration > 0) newStatuses.push(s);
  }
  entity.statuses = newStatuses;

  // HP regen (joueur)
  if (entity.hpRegen && entity.hp > 0 && entity.hp < entity.maxHP) {
    entity.hp = Math.min(entity.maxHP, entity.hp + entity.hpRegen);
    log.push(`${entity.icon} régénère ${entity.hpRegen} PV 💚`);
  }

  if (entity.hp <= 0) {
    entity.isAlive = false;
    entity.hp = 0;
    log.push(`💀 ${entity.icon} ${entity.name} succombe à ses statuts (DoT total: ${totalDotDamage})`);
  }
}

function isStunned(entity) {
  return entity.statuses.some(s => s.id === 'stunned' || s.id === 'frozen');
}

// IA du joueur (auto-battle)
function chooseEnemyTarget(player, enemies) {
  const alive = enemies.filter(e => e.isAlive);
  if (alive.length === 0) return null;

  // Priorité 1: cible <30% PV (execute)
  if (player.executeBonus > 0) {
    const lowHp = alive.find(e => e.hp / e.maxHP < 0.3);
    if (lowHp) return lowHp;
  }

  // Priorité 2: la plus faible PV
  return alive.reduce((a, b) => a.hp < b.hp ? a : b);
}

// Simule un combat 1 salle
function simulateRoom(player, enemies, log, runMetrics) {
  let turn = 0;
  const maxTurns = 50; // safety

  while (player.isAlive && enemies.some(e => e.isAlive) && turn < maxTurns) {
    turn++;
    log.push(`--- Tour ${turn} ---`);

    // === TOUR DU JOUEUR ===
    tickStatuses(player, log);
    if (!player.isAlive) break;

    if (!isStunned(player)) {
      const target = chooseEnemyTarget(player, enemies);
      if (target) {
        const result = calculateDamage(player, target, true);
        if (result.dodged) {
          log.push(`${target.icon} esquive l'attaque !`);
        } else {
          target.hp -= result.damage;
          runMetrics.damageDealt += result.damage;
          if (result.isCrit) runMetrics.crits++;
          log.push(`${player.icon} ${result.isCrit ? 'CRIT ' : ''}attaque ${target.icon} pour ${result.damage}${result.blocked ? ' (bloqué)' : ''}`);

          // Lifesteal
          if (player.lifesteal) {
            const heal = Math.round(result.damage * (player.lifesteal / 100));
            player.hp = Math.min(player.maxHP, player.hp + heal);
            if (heal > 0) log.push(`💉 ${player.icon} récupère ${heal} PV (lifesteal)`);
          }

          // Status applications
          if (player.bleedChance && Math.random() * 100 < player.bleedChance) {
            applyStatus(target, 'bleeding', 3, Math.round(result.damage * 0.2));
            log.push(`🩸 ${target.icon} saigne !`);
          }
          if (player.stunChance && Math.random() * 100 < player.stunChance) {
            applyStatus(target, 'stunned', 1);
            log.push(`💫 ${target.icon} étourdi !`);
          }
          // Élémentaires
          if (player.bonusFireDamage > 0 && Math.random() < 0.2) {
            applyStatus(target, 'burning', 3, Math.round(player.bonusFireDamage * 0.5));
            log.push(`🔥 ${target.icon} brûle !`);
          }

          // Mort de l'ennemi
          if (target.hp <= 0) {
            target.isAlive = false;
            target.hp = 0;
            log.push(`💀 ${target.icon} ${target.name} tombe !`);
          }
        }
      }
    } else {
      log.push(`${player.icon} est étourdi, passe son tour`);
    }

    // === TOUR DES ENNEMIS ===
    for (const enemy of enemies) {
      if (!enemy.isAlive) continue;
      tickStatuses(enemy, log);
      if (!enemy.isAlive) continue;
      if (!player.isAlive) break;

      if (isStunned(enemy)) {
        log.push(`${enemy.icon} ${enemy.name} étourdi, passe son tour`);
        continue;
      }

      const result = calculateDamage(enemy, player, false);
      if (result.dodged) {
        log.push(`${player.icon} esquive ${enemy.name} !`);
      } else {
        player.hp -= result.damage;
        runMetrics.damageTaken += result.damage;
        runMetrics.maxHitTaken = Math.max(runMetrics.maxHitTaken, result.damage);
        log.push(`${enemy.icon} ${enemy.name} ${result.isCrit ? 'CRIT ' : ''}frappe pour ${result.damage}${result.blocked ? ' (bloqué)' : ''}`);

        // Thorns retaliation
        if (player.thornsDamage && enemy.range === 1) {
          const thorns = Math.max(1, player.thornsDamage - (enemy.armor || 0));
          enemy.hp -= thorns;
          log.push(`🌹 ${enemy.icon} subit ${thorns} dégâts d'épines`);
          if (enemy.hp <= 0) {
            enemy.isAlive = false;
            enemy.hp = 0;
            log.push(`💀 ${enemy.icon} ${enemy.name} tombe (épines) !`);
          }
        }

        // Lifesteal de l'ennemi
        if (enemy.lifesteal) {
          const heal = Math.round(result.damage * (enemy.lifesteal / 100));
          enemy.hp = Math.min(enemy.maxHP, enemy.hp + heal);
        }

        // Status applications par l'ennemi
        if (enemy.applyBurn && Math.random() * 100 < enemy.applyBurn) {
          applyStatus(player, 'burning', 3, 4);
          log.push(`🔥 ${player.icon} brûle !`);
          runMetrics.statusesReceived.burning = (runMetrics.statusesReceived.burning || 0) + 1;
        }
        if (enemy.applyPoison && Math.random() * 100 < enemy.applyPoison) {
          applyStatus(player, 'poisoned', 4, 3);
          log.push(`☠️ ${player.icon} empoisonné !`);
          runMetrics.statusesReceived.poisoned = (runMetrics.statusesReceived.poisoned || 0) + 1;
        }
        if (enemy.applyChill && Math.random() * 100 < enemy.applyChill) {
          applyStatus(player, 'chilled', 3, 3);
          log.push(`❄️ ${player.icon} glacé !`);
          runMetrics.statusesReceived.chilled = (runMetrics.statusesReceived.chilled || 0) + 1;
        }
        if (enemy.applyShock && Math.random() * 100 < enemy.applyShock) {
          applyStatus(player, 'shocked', 3, 4);
          log.push(`⚡ ${player.icon} électrocuté !`);
          runMetrics.statusesReceived.shocked = (runMetrics.statusesReceived.shocked || 0) + 1;
        }
        if (enemy.applyBleed && Math.random() * 100 < enemy.applyBleed) {
          applyStatus(player, 'bleeding', 3, 5);
          log.push(`🩸 ${player.icon} saigne !`);
          runMetrics.statusesReceived.bleeding = (runMetrics.statusesReceived.bleeding || 0) + 1;
        }
        // AOE damage du boss
        if (enemy.aoeDamage) {
          const aoe = Math.round(rollInRange(enemy.damage) * 0.3);
          player.hp -= Math.max(1, aoe - player.armor);
          log.push(`💥 AOE ${enemy.name} pour ${aoe} dégâts supplémentaires`);
        }

        if (player.hp <= 0) {
          player.isAlive = false;
          player.hp = 0;
          log.push(`💀 ${player.icon} Joueur tombe !`);
          break;
        }
      }
    }
  }

  return turn;
}

// Génère le donjon (4 salles + 1 boss)
function generateDungeon(level) {
  const rooms = [];

  // Salles 1-2: mobs faciles
  rooms.push({
    label: 'Salle 1',
    enemies: [
      scaleEnemy(ENEMY_ARCHETYPES.brute, level),
      scaleEnemy(ENEMY_ARCHETYPES.skirmisher, level),
    ],
  });
  rooms.push({
    label: 'Salle 2',
    enemies: [
      scaleEnemy(ENEMY_ARCHETYPES.skirmisher, level),
      scaleEnemy(ENEMY_ARCHETYPES.archer, level),
      scaleEnemy(ENEMY_ARCHETYPES.toxicMutant, level),
    ],
  });

  // Salles 3-4: avec élite
  rooms.push({
    label: 'Salle 3 (Élite)',
    enemies: [
      scaleEnemy(ENEMY_ARCHETYPES.berserker, level),
      scaleEnemy(ENEMY_ARCHETYPES.brute, level),
    ],
  });
  rooms.push({
    label: 'Salle 4 (Élite)',
    enemies: [
      scaleEnemy(ENEMY_ARCHETYPES.sentinel, level),
      scaleEnemy(ENEMY_ARCHETYPES.caster, level),
      scaleEnemy(ENEMY_ARCHETYPES.archer, level),
    ],
  });

  // Boss room
  const bossKeys = ['bossInferno', 'bossCryo', 'bossToxic', 'bossVoid', 'bossCrimson'];
  const bossKey = bossKeys[Math.floor(Math.random() * bossKeys.length)];
  rooms.push({
    label: '👑 BOSS',
    enemies: [scaleEnemy(ENEMY_ARCHETYPES[bossKey], level)],
  });

  return rooms;
}

function simulateRun(player, dungeon) {
  const log = [];
  const runMetrics = {
    damageDealt: 0, damageTaken: 0, maxHitTaken: 0, crits: 0,
    statusesReceived: {}, turnsTotal: 0, roomsCleared: 0, victory: false,
  };

  for (const room of dungeon) {
    log.push(`════════ ${room.label} ════════`);
    const turns = simulateRoom(player, room.enemies, log, runMetrics);
    runMetrics.turnsTotal += turns;

    if (!player.isAlive) {
      log.push(`☠️ DÉFAITE en ${room.label} après ${turns} tours`);
      break;
    }
    runMetrics.roomsCleared++;
    log.push(`✓ Salle clear en ${turns} tours, PV: ${player.hp}/${player.maxHP}`);
  }

  if (player.isAlive && runMetrics.roomsCleared === dungeon.length) {
    runMetrics.victory = true;
    log.push(`🏆 VICTOIRE ! Run complété`);
  }

  runMetrics.finalHpPercent = Math.round((player.hp / player.maxHP) * 100);
  return { log, metrics: runMetrics };
}

// ============ COMPONENTS ============

function ItemSlot({ slot, item, onGenerate, onClear, ilvl }) {
  const slotIcon = {
    weapon: '⚔️', offhand: '🛡️', head: '⛑️', chest: '🦺',
    legs: '👖', gloves: '🧤', boots: '👢', amulet: '📿', ring: '💍',
  };
  const slotName = {
    weapon: 'Arme', offhand: 'Off-hand', head: 'Casque', chest: 'Veste',
    legs: 'Pantalon', gloves: 'Gants', boots: 'Bottes', amulet: 'Amulette', ring: 'Anneau',
  };

  if (!item) {
    return (
      <button onClick={() => onGenerate(slot)}
        className="border border-dashed border-slate-700 rounded p-2 hover:border-pink-500 transition text-left">
        <div className="flex items-center gap-2 opacity-50">
          <span className="text-xl">{slotIcon[slot]}</span>
          <div>
            <div className="text-xs font-bold">{slotName[slot]}</div>
            <div className="text-[9px] text-slate-500">Cliquer pour générer</div>
          </div>
        </div>
      </button>
    );
  }

  return (
    <div className="border rounded p-2" style={{ borderColor: TIER_CONFIG[item.tier].color + '60' }}>
      <div className="flex items-start justify-between gap-1 mb-1">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-lg">{item.icon}</span>
          <div className="min-w-0">
            <div className="text-xs font-bold truncate" style={{ color: TIER_CONFIG[item.tier].color }}>
              {item.name}
            </div>
            <div className="text-[9px] text-slate-500">iLvl {item.ilvl} · {TIER_CONFIG[item.tier].label}</div>
          </div>
        </div>
        <div className="flex gap-1 shrink-0">
          <button onClick={() => onGenerate(slot)} className="p-1 rounded bg-slate-800 hover:bg-pink-900 text-slate-400 hover:text-pink-300" title="Re-générer">
            <RotateCcw size={10} />
          </button>
          <button onClick={() => onClear(slot)} className="p-1 rounded bg-slate-800 hover:bg-red-900 text-slate-400 hover:text-red-300" title="Retirer">×</button>
        </div>
      </div>
      {item.baseDamage && (
        <div className="text-[10px] text-orange-300">⚔ {item.baseDamage[0]}-{item.baseDamage[1]} {item.damageType}</div>
      )}
      {item.armor !== undefined && item.armor > 0 && (
        <div className="text-[10px] text-blue-300">🛡 {item.armor} armure</div>
      )}
      {item.maxHP && (<div className="text-[10px] text-red-300">❤️ +{item.maxHP} PV</div>)}
      {item.blockChance > 0 && (<div className="text-[10px] text-slate-300">+{item.blockChance}% bloc</div>)}
      {item.affixes?.length > 0 && (
        <div className="mt-1 pt-1 border-t border-slate-800 space-y-0.5">
          {item.affixes.map((a, i) => (
            <div key={i} className="text-[9px] text-slate-300">
              + {a.value}{isPercent(a.stat) ? '%' : ''} {a.stat}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatBar({ label, value, max, color = '#22d3ee', icon }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-[10px] mb-0.5">
        <span className="text-slate-400 flex items-center gap-1">{icon}{label}</span>
        <span className="font-mono" style={{ color }}>{value} / {max}</span>
      </div>
      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div className="h-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

function PlayerStatsPanel({ player }) {
  if (!player) return null;
  return (
    <div className="bg-slate-900 border border-cyan-500/30 rounded-lg p-3 space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-3xl">{player.icon}</span>
        <div>
          <div className="text-sm font-bold text-cyan-300">{player.name}</div>
          <div className="text-[10px] text-slate-400">Niveau {player.level}</div>
        </div>
      </div>
      <StatBar label="PV" value={player.hp} max={player.maxHP} color="#ef4444" icon="❤️" />
      <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px]">
        <div><span className="text-slate-500">Dégâts:</span> <span className="text-orange-300 font-mono">{player.damage[0]}-{player.damage[1]}</span></div>
        <div><span className="text-slate-500">Type:</span> <span className="text-orange-300">{player.damageType}</span></div>
        <div><span className="text-slate-500">Armure:</span> <span className="text-blue-300 font-mono">{player.armor}</span></div>
        <div><span className="text-slate-500">Crit:</span> <span className="text-yellow-300 font-mono">{player.critChance}%</span></div>
        <div><span className="text-slate-500">Multi crit:</span> <span className="text-yellow-300 font-mono">+{player.critMultiplier}%</span></div>
        <div><span className="text-slate-500">Esquive:</span> <span className="text-purple-300 font-mono">{player.dodgeChance}%</span></div>
        {player.blockChance > 0 && (<div><span className="text-slate-500">Bloc:</span> <span className="text-purple-300 font-mono">{player.blockChance}%</span></div>)}
        {player.lifesteal > 0 && (<div><span className="text-slate-500">Lifesteal:</span> <span className="text-pink-300 font-mono">{player.lifesteal}%</span></div>)}
        {player.thornsDamage > 0 && (<div><span className="text-slate-500">Épines:</span> <span className="text-emerald-300 font-mono">+{player.thornsDamage}</span></div>)}
        {player.hpRegen > 0 && (<div><span className="text-slate-500">PV/tour:</span> <span className="text-emerald-300 font-mono">+{player.hpRegen}</span></div>)}
      </div>
      {(player.fireResist > 0 || player.iceResist > 0 || player.shockResist > 0 || player.poisonResist > 0) && (
        <div className="pt-1 border-t border-slate-800 grid grid-cols-2 gap-x-2 text-[10px]">
          {player.fireResist > 0 && <div>🔥 <span className="font-mono">{player.fireResist}%</span></div>}
          {player.iceResist > 0 && <div>❄️ <span className="font-mono">{player.iceResist}%</span></div>}
          {player.shockResist > 0 && <div>⚡ <span className="font-mono">{player.shockResist}%</span></div>}
          {player.poisonResist > 0 && <div>☠️ <span className="font-mono">{player.poisonResist}%</span></div>}
        </div>
      )}
    </div>
  );
}

function DungeonPreview({ dungeon }) {
  if (!dungeon) return null;
  return (
    <div className="bg-slate-900 border border-slate-700 rounded p-3 space-y-2">
      <div className="text-[10px] uppercase tracking-wider text-slate-400 flex items-center gap-1">
        <Skull size={11} />Donjon (5 salles)
      </div>
      {dungeon.map((room, i) => (
        <div key={i} className="bg-slate-800/50 rounded p-2">
          <div className="text-xs font-bold text-pink-300 mb-1">{room.label}</div>
          <div className="flex flex-wrap gap-1.5">
            {room.enemies.map((e, j) => (
              <div key={j} className="flex items-center gap-1 bg-slate-900 rounded px-1.5 py-0.5 text-[10px]">
                <span>{e.icon}</span>
                <span className="text-slate-300">{e.name}</span>
                <span className="text-red-400 font-mono">{e.maxHP}❤</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function MetricsPanel({ metrics, runs }) {
  // Cas batch : afficher les stats agrégées même si metrics est null
  if (runs && runs.length > 1) {
    // Stats agrégées sur N runs
    const wins = runs.filter(r => r.metrics.victory).length;
    const winRate = (wins / runs.length) * 100;
    const avgTurns = runs.reduce((s, r) => s + r.metrics.turnsTotal, 0) / runs.length;
    const avgFinalHp = runs.reduce((s, r) => s + r.metrics.finalHpPercent, 0) / runs.length;
    const avgDmgDealt = runs.reduce((s, r) => s + r.metrics.damageDealt, 0) / runs.length;
    const avgDmgTaken = runs.reduce((s, r) => s + r.metrics.damageTaken, 0) / runs.length;
    const avgRoomsCleared = runs.reduce((s, r) => s + r.metrics.roomsCleared, 0) / runs.length;

    return (
      <div className="bg-slate-900 border border-amber-500/40 rounded-lg p-3 space-y-2">
        <div className="text-[10px] uppercase tracking-wider text-amber-400 flex items-center gap-1">
          <Activity size={11} />Stats agrégées sur {runs.length} runs
        </div>
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div className="bg-slate-800 rounded p-2">
            <div className="text-[9px] uppercase text-slate-400">Win Rate</div>
            <div className="text-lg font-bold" style={{ color: winRate > 70 ? '#4ade80' : winRate > 40 ? '#fbbf24' : '#ef4444' }}>
              {winRate.toFixed(1)}%
            </div>
            <div className="text-[9px] text-slate-500">{wins}/{runs.length}</div>
          </div>
          <div className="bg-slate-800 rounded p-2">
            <div className="text-[9px] uppercase text-slate-400">Tours moyens</div>
            <div className="text-lg font-bold text-cyan-300">{avgTurns.toFixed(1)}</div>
          </div>
          <div className="bg-slate-800 rounded p-2">
            <div className="text-[9px] uppercase text-slate-400">PV final moyen</div>
            <div className="text-lg font-bold text-red-300">{avgFinalHp.toFixed(0)}%</div>
          </div>
          <div className="bg-slate-800 rounded p-2">
            <div className="text-[9px] uppercase text-slate-400">Salles clear avg</div>
            <div className="text-lg font-bold text-purple-300">{avgRoomsCleared.toFixed(1)}/5</div>
          </div>
          <div className="bg-slate-800 rounded p-2 col-span-2">
            <div className="text-[9px] uppercase text-slate-400">Dégâts moyens (infligés / subis)</div>
            <div className="text-sm font-mono">
              <span className="text-orange-300">{avgDmgDealt.toFixed(0)}</span>
              {' / '}
              <span className="text-red-400">{avgDmgTaken.toFixed(0)}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Stats du run unique
  if (!metrics) return null;
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 space-y-2">
      <div className="text-[10px] uppercase tracking-wider text-slate-400 flex items-center gap-1">
        <Activity size={11} />Stats du run
      </div>
      <div className="grid grid-cols-2 gap-2 text-[11px]">
        <div className="bg-slate-800 rounded p-2">
          <div className="text-[9px] uppercase text-slate-400">Résultat</div>
          <div className={`text-sm font-bold ${metrics.victory ? 'text-emerald-400' : 'text-red-400'}`}>
            {metrics.victory ? '🏆 Victoire' : '☠️ Défaite'}
          </div>
        </div>
        <div className="bg-slate-800 rounded p-2">
          <div className="text-[9px] uppercase text-slate-400">Tours total</div>
          <div className="text-sm font-bold text-cyan-300">{metrics.turnsTotal}</div>
        </div>
        <div className="bg-slate-800 rounded p-2">
          <div className="text-[9px] uppercase text-slate-400">Salles clear</div>
          <div className="text-sm font-bold text-purple-300">{metrics.roomsCleared}/5</div>
        </div>
        <div className="bg-slate-800 rounded p-2">
          <div className="text-[9px] uppercase text-slate-400">PV final</div>
          <div className="text-sm font-bold text-red-300">{metrics.finalHpPercent}%</div>
        </div>
        <div className="bg-slate-800 rounded p-2">
          <div className="text-[9px] uppercase text-slate-400">Dégâts infligés</div>
          <div className="text-sm font-mono text-orange-300">{metrics.damageDealt}</div>
        </div>
        <div className="bg-slate-800 rounded p-2">
          <div className="text-[9px] uppercase text-slate-400">Dégâts subis</div>
          <div className="text-sm font-mono text-red-400">{metrics.damageTaken}</div>
        </div>
        <div className="bg-slate-800 rounded p-2">
          <div className="text-[9px] uppercase text-slate-400">Crits</div>
          <div className="text-sm font-mono text-yellow-300">{metrics.crits}</div>
        </div>
        <div className="bg-slate-800 rounded p-2">
          <div className="text-[9px] uppercase text-slate-400">Plus gros coup subi</div>
          <div className="text-sm font-mono text-red-400">{metrics.maxHitTaken}</div>
        </div>
      </div>
      {Object.keys(metrics.statusesReceived).length > 0 && (
        <div className="bg-slate-800 rounded p-2">
          <div className="text-[9px] uppercase text-slate-400 mb-1">Statuts subis</div>
          <div className="flex flex-wrap gap-2 text-[10px]">
            {Object.entries(metrics.statusesReceived).map(([s, c]) => (
              <span key={s} className="text-slate-300">{s}: <span className="font-mono text-amber-300">{c}</span></span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function CombatSimulator() {
  const [dungeonLevel, setDungeonLevel] = useState(5);
  const [equipment, setEquipment] = useState({});
  const [dungeon, setDungeon] = useState(null);
  const [lastRun, setLastRun] = useState(null);
  const [batchRuns, setBatchRuns] = useState(null);
  const [showLog, setShowLog] = useState(false);
  const [autoEquip, setAutoEquip] = useState(false);

  const player = useMemo(() => buildPlayer(dungeonLevel, equipment), [dungeonLevel, equipment]);

  const handleGenerateItem = useCallback((slot) => {
    const item = generateSimItem(slot, dungeonLevel);
    setEquipment(prev => ({ ...prev, [slot]: item }));
  }, [dungeonLevel]);

  const handleClearItem = useCallback((slot) => {
    setEquipment(prev => {
      const next = { ...prev };
      delete next[slot];
      return next;
    });
  }, []);

  const handleAutoEquipFull = useCallback(() => {
    const slots = ['weapon', 'offhand', 'head', 'chest', 'legs', 'gloves', 'boots', 'amulet', 'ring'];
    const next = {};
    for (const slot of slots) {
      next[slot] = generateSimItem(slot, dungeonLevel);
    }
    setEquipment(next);
  }, [dungeonLevel]);

  const handleClearAll = useCallback(() => {
    setEquipment({});
  }, []);

  const handleGenerateDungeon = useCallback(() => {
    setDungeon(generateDungeon(dungeonLevel));
    setLastRun(null);
    setBatchRuns(null);
  }, [dungeonLevel]);

  const handleSingleRun = useCallback(() => {
    if (!dungeon) return;
    // Deep clone du donjon (pour pouvoir relancer sur le même)
    const dungeonCopy = JSON.parse(JSON.stringify(dungeon));
    const playerCopy = { ...player, statuses: [] };
    const result = simulateRun(playerCopy, dungeonCopy);
    setLastRun(result);
    setBatchRuns(null);
  }, [dungeon, player]);

  const handleBatchRun = useCallback((n) => {
    if (!dungeon) return;
    const runs = [];
    for (let i = 0; i < n; i++) {
      const dungeonCopy = JSON.parse(JSON.stringify(dungeon));
      const playerCopy = { ...player, statuses: [] };
      runs.push(simulateRun(playerCopy, dungeonCopy));
    }
    setBatchRuns(runs);
    setLastRun(runs[0]);
  }, [dungeon, player]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 font-mono">
      <div className="max-w-7xl mx-auto">
        <div className="mb-4 pb-3 border-b border-slate-800">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Sword className="text-pink-500" size={28} />
            <span className="bg-gradient-to-r from-pink-500 to-cyan-400 bg-clip-text text-transparent">
              COMBAT SIMULATOR
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Simule un run de donjon (4 salles + boss) avec ton stuff. Auto-battle + statistiques.
          </p>
        </div>

        {/* Top controls */}
        <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">
                Niveau Donjon: <span className="text-cyan-400 font-bold">{dungeonLevel}</span>
              </label>
              <input type="range" min="1" max="10" value={dungeonLevel}
                onChange={e => setDungeonLevel(parseInt(e.target.value))}
                className="w-full accent-pink-500" />
              <div className="text-[9px] text-slate-500 mt-1 font-mono">
                Mult ennemis ×{(0.4 + (dungeonLevel - 1) * 0.23).toFixed(2)} · Drops iLvl {dungeonLevel}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={handleAutoEquipFull}
                className="bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold py-2 px-3 rounded">
                Stuff complet
              </button>
              <button onClick={handleClearAll}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold py-2 px-3 rounded">
                Tout retirer
              </button>
            </div>
            <button onClick={handleGenerateDungeon}
              className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold py-2 px-3 rounded flex items-center justify-center gap-1">
              <Skull size={14} />Générer donjon
            </button>
            <div className="flex gap-2">
              <button onClick={handleSingleRun} disabled={!dungeon}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-600 text-white text-xs font-bold py-2 px-3 rounded flex items-center justify-center gap-1">
                <Play size={12} />Run 1×
              </button>
              <button onClick={() => handleBatchRun(100)} disabled={!dungeon}
                className="flex-1 bg-amber-600 hover:bg-amber-500 disabled:bg-slate-800 disabled:text-slate-600 text-white text-xs font-bold py-2 px-3 rounded flex items-center justify-center gap-1">
                <FastForward size={12} />Run 100×
              </button>
            </div>
          </div>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* LEFT: Equipment */}
          <div className="lg:col-span-4 space-y-2">
            <div className="text-[10px] uppercase tracking-wider text-slate-500">Équipement</div>
            <div className="grid grid-cols-2 gap-2">
              <ItemSlot slot="weapon" item={equipment.weapon} onGenerate={handleGenerateItem} onClear={handleClearItem} ilvl={dungeonLevel} />
              <ItemSlot slot="offhand" item={equipment.offhand} onGenerate={handleGenerateItem} onClear={handleClearItem} ilvl={dungeonLevel} />
              <ItemSlot slot="head" item={equipment.head} onGenerate={handleGenerateItem} onClear={handleClearItem} ilvl={dungeonLevel} />
              <ItemSlot slot="chest" item={equipment.chest} onGenerate={handleGenerateItem} onClear={handleClearItem} ilvl={dungeonLevel} />
              <ItemSlot slot="legs" item={equipment.legs} onGenerate={handleGenerateItem} onClear={handleClearItem} ilvl={dungeonLevel} />
              <ItemSlot slot="gloves" item={equipment.gloves} onGenerate={handleGenerateItem} onClear={handleClearItem} ilvl={dungeonLevel} />
              <ItemSlot slot="boots" item={equipment.boots} onGenerate={handleGenerateItem} onClear={handleClearItem} ilvl={dungeonLevel} />
              <ItemSlot slot="amulet" item={equipment.amulet} onGenerate={handleGenerateItem} onClear={handleClearItem} ilvl={dungeonLevel} />
              <ItemSlot slot="ring" item={equipment.ring} onGenerate={handleGenerateItem} onClear={handleClearItem} ilvl={dungeonLevel} />
            </div>
          </div>

          {/* CENTER: Player + Dungeon */}
          <div className="lg:col-span-4 space-y-3">
            <PlayerStatsPanel player={player} />
            <DungeonPreview dungeon={dungeon} />
          </div>

          {/* RIGHT: Results */}
          <div className="lg:col-span-4 space-y-3">
            {batchRuns ? (
              <MetricsPanel metrics={null} runs={batchRuns} />
            ) : lastRun ? (
              <MetricsPanel metrics={lastRun.metrics} />
            ) : (
              <div className="bg-slate-900/50 border border-slate-800 border-dashed rounded p-6 text-center">
                <Trophy size={32} className="mx-auto mb-2 text-slate-600" />
                <div className="text-xs text-slate-500">Génère un donjon et lance un run pour voir les résultats</div>
              </div>
            )}

            {lastRun && (
              <div className="bg-slate-900 border border-slate-700 rounded">
                <button onClick={() => setShowLog(!showLog)}
                  className="w-full px-3 py-2 text-[10px] uppercase tracking-wider text-slate-400 hover:bg-slate-800 flex items-center justify-between">
                  <span>📜 Combat log ({lastRun.log.length} lignes)</span>
                  <ChevronRight size={12} className={`transition-transform ${showLog ? 'rotate-90' : ''}`} />
                </button>
                {showLog && (
                  <div className="p-2 max-h-96 overflow-y-auto text-[10px] space-y-0.5 font-mono border-t border-slate-700">
                    {lastRun.log.map((line, i) => (
                      <div key={i} className={`${line.startsWith('═') ? 'text-pink-400 font-bold mt-1' : line.startsWith('---') ? 'text-cyan-500 mt-1' : line.startsWith('💀') ? 'text-red-400' : line.startsWith('🏆') ? 'text-emerald-400 font-bold' : line.startsWith('✓') ? 'text-emerald-300' : 'text-slate-400'}`}>
                        {line}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-6 pt-3 border-t border-slate-800 text-[9px] text-slate-500 grid grid-cols-1 md:grid-cols-3 gap-2">
          <div>💡 Génère ton stuff, puis le donjon, puis lance 100 runs pour voir le winrate</div>
          <div>🎯 Si winrate &gt; 80% → too easy, &lt; 30% → too hard</div>
          <div>⚖️ Re-roll les items et le donjon pour voir la variance</div>
        </div>
      </div>
    </div>
  );
}
