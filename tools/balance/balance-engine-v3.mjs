// engine-v3.mjs - Itération 3 avec ajustements précis
// Changements vs v2 :
// - hpRegen encore nerfé : range [1,2] → [1,2] mais cap d'effet en multi-équipement (max +5/tour total)
// - lifesteal range [3,8] → [2,6] (était devenu trop fort)
// - bonusFireDamage range [4,10] → [3,7] (encore un peu fort)
// - Niveau 1 plus facile : HP base joueur 40+lvl*8 → 50+lvl*7 (compensation bas niveau)
// - Niveaux 6-10 : HP boss légèrement augmenté ×1.3 → ×1.4 (HP boss encore trop faible)

export const TIER_AFFIX_COUNT = {
  common: 0, uncommon: 1, rare: 3, epic: 4, legendary: 4, set: 3,
};

export const TIER_RANGE_MULT_FLAT = {
  uncommon: [0.7, 1.1], rare: [1.0, 1.6], epic: [1.4, 2.2], legendary: [2.0, 3.2], set: [1.3, 2.0],
};
export const TIER_RANGE_MULT_PERCENT = {
  uncommon: [0.8, 1.05], rare: [1.0, 1.3], epic: [1.2, 1.6], legendary: [1.5, 2.0], set: [1.1, 1.4],
};
export const ILVL_MULT_FLAT = { 1: 0.40, 2: 0.55, 3: 0.75, 4: 0.95, 5: 1.20, 6: 1.50, 7: 1.85, 8: 2.25, 9: 2.80, 10: 3.50 };
export const ILVL_MULT_PERCENT = { 1: 0.50, 2: 0.65, 3: 0.80, 4: 0.95, 5: 1.10, 6: 1.25, 7: 1.40, 8: 1.55, 9: 1.65, 10: 1.75 };

const PERCENT_STATS = new Set([
  'critChance', 'critMultiplier', 'attackSpeed', 'bleedChance', 'bonusMagicDamage',
  'cooldownReduction', 'stunChance', 'fireResist', 'iceResist', 'shockResist',
  'poisonResist', 'magicFind', 'lifesteal', 'dodgeChance', 'spellCritChance',
  'tagResonance', 'rageOnHit', 'executeBonus', 'maxHpPercent', 'ccReduction',
  'blockChance', 'criticalDodgeChance', 'accuracy', 'elementalPenetration', 'riposteChance',
]);
export const isPercent = (s) => PERCENT_STATS.has(s);

const ENEMY_SCALE = ILVL_MULT_FLAT;

export const ENEMY_ARCHETYPES = {
  brute: { name: 'Brute', icon: '👹', role: 'mob', baseHP: 35, baseDmg: [8, 14], damageType: 'blunt', armor: 4, range: 1 },
  skirmisher: { name: 'Skirmisher', icon: '🗡️', role: 'mob', baseHP: 24, baseDmg: [6, 11], damageType: 'slash', armor: 2, range: 1 },
  caster: { name: 'Caster', icon: '🧙', role: 'mob', baseHP: 20, baseDmg: [10, 16], damageType: 'fire', armor: 1, range: 4, applyBurn: 30 },
  archer: { name: 'Archer', icon: '🏹', role: 'mob', baseHP: 22, baseDmg: [8, 13], damageType: 'pierce', armor: 2, range: 5 },
  toxicMutant: { name: 'Mutant Toxique', icon: '☠️', role: 'mob', baseHP: 28, baseDmg: [5, 9], damageType: 'poison', armor: 3, range: 2, applyPoison: 50, lifesteal: 30 },
  berserker: { name: 'Berserker', icon: '⚔️', role: 'elite', baseHP: 60, baseDmg: [12, 20], damageType: 'slash', armor: 5, range: 1 },
  sentinel: { name: 'Sentinelle', icon: '🛡️', role: 'elite', baseHP: 80, baseDmg: [9, 15], damageType: 'blunt', armor: 12, range: 1 },
  // Boss HP encore légèrement augmentés vs v2 (étaient trop bas en haut niveau)
  bossInferno: { name: 'Pyromancien', icon: '🔥', role: 'boss', baseHP: 170, baseDmg: [16, 24], damageType: 'fire', armor: 8, range: 5, applyBurn: 40, aoeDamage: true, biome: 'inferno' },
  bossCryo: { name: 'Cryo-Reine', icon: '❄️', role: 'boss', baseHP: 190, baseDmg: [14, 22], damageType: 'ice', armor: 10, range: 4, applyChill: 40, biome: 'cryo' },
  bossToxic: { name: 'Bête Putréfiée', icon: '🦠', role: 'boss', baseHP: 200, baseDmg: [12, 20], damageType: 'poison', armor: 6, range: 2, applyPoison: 60, lifesteal: 30, biome: 'toxic' },
  bossVoid: { name: 'Architecte Vide', icon: '⚡', role: 'boss', baseHP: 160, baseDmg: [18, 28], damageType: 'shock', armor: 5, range: 6, applyShock: 50, aoeDamage: true, biome: 'voidnet' },
  bossCrimson: { name: 'Champion Sang', icon: '🩸', role: 'boss', baseHP: 180, baseDmg: [20, 30], damageType: 'slash', armor: 7, range: 1, applyBleed: 50, executeBonus: 50, biome: 'crimson' },
};

export function scaleEnemy(archetype, dungeonLevel) {
  const lvlMult = ENEMY_SCALE[dungeonLevel];
  // Boss multiplicateur 1.3 → 1.35 (légère hausse)
  const hpMult = lvlMult * (archetype.role === 'boss' ? 1.35 : archetype.role === 'elite' ? 1.15 : 1.0);
  const dmgMult = lvlMult * 0.95;
  return {
    ...archetype,
    maxHP: Math.round(archetype.baseHP * hpMult),
    hp: Math.round(archetype.baseHP * hpMult),
    damage: [Math.round(archetype.baseDmg[0] * dmgMult), Math.round(archetype.baseDmg[1] * dmgMult)],
    armor: Math.round(archetype.armor * lvlMult * 0.7),
    statuses: [],
    isAlive: true,
  };
}

export const WEAPON_POOL = {
  sword: { name: 'Épée', baseDamage: [16, 24], type: 'slash', range: 1 },
  dagger: { name: 'Dague', baseDamage: [10, 18], type: 'pierce', range: 1, critBonus: 8 },
  axe: { name: 'Hache', baseDamage: [18, 26], type: 'slash', range: 1, bleedChance: 20 },
  mace: { name: 'Masse', baseDamage: [17, 25], type: 'blunt', range: 1, stunChance: 15 },
  wand: { name: 'Wand', baseDamage: [10, 16], type: 'magic', range: 4 },
  pistol: { name: 'Pistolet', baseDamage: [13, 20], type: 'pierce', range: 4 },
  greatsword: { name: 'GreatSword', baseDamage: [28, 42], type: 'slash', range: 1 },
  bow: { name: 'Arc', baseDamage: [24, 34], type: 'pierce', range: 5 },
  staff: { name: 'Staff', baseDamage: [18, 28], type: 'magic', range: 5 },
};

export function rollInRange([min, max]) { return Math.round(min + Math.random() * (max - min)); }

export function rollAffixValue(baseRange, tier, ilvl, statId) {
  const isPct = isPercent(statId);
  const tierTable = isPct ? TIER_RANGE_MULT_PERCENT : TIER_RANGE_MULT_FLAT;
  const ilvlTable = isPct ? ILVL_MULT_PERCENT : ILVL_MULT_FLAT;
  const tMult = tierTable[tier];
  const iMult = ilvlTable[ilvl];
  const min = baseRange[0] * tMult[0] * iMult;
  const max = baseRange[1] * tMult[1] * iMult;
  return Math.round(min + Math.random() * (max - min));
}

export const WEAPON_AFFIX_POOL = [
  // bonusFireDamage range nerf (4-10 → 3-7)
  { stat: 'bonusFireDamage', range: [3, 7] },
  { stat: 'bonusIceDamage', range: [3, 7] },
  { stat: 'bonusShockDamage', range: [3, 7] },
  { stat: 'bonusPoisonDamage', range: [3, 7] },
  { stat: 'critChance', range: [4, 10] },
  { stat: 'critMultiplier', range: [18, 40] },
  // lifesteal nerf (3-8 → 2-5)
  { stat: 'lifesteal', range: [2, 5] },
  { stat: 'executeBonus', range: [10, 22] },
  { stat: 'armorPenetration', range: [2, 5] },
  { stat: 'bleedChance', range: [10, 22] },
];

export const ARMOR_AFFIX_POOL = [
  { stat: 'maxHP', range: [10, 22] },
  { stat: 'maxHpPercent', range: [2, 5] },
  { stat: 'armor', range: [8, 18] },
  { stat: 'fireResist', range: [8, 18] },
  { stat: 'iceResist', range: [8, 18] },
  { stat: 'shockResist', range: [8, 18] },
  { stat: 'poisonResist', range: [8, 18] },
  { stat: 'dodgeChance', range: [4, 10] },
  { stat: 'thornsDamage', range: [3, 8] },
  { stat: 'ccReduction', range: [6, 15] },
  { stat: 'criticalDodgeChance', range: [3, 8] },
  // hpRegen reste à [1,2] mais cappé en aggregateStats
  { stat: 'hpRegen', range: [1, 2] },
  { stat: 'critChance', range: [4, 10] },
];

export const ACCESSORY_AFFIX_POOL = [
  { stat: 'maxHP', range: [10, 22] },
  { stat: 'critChance', range: [4, 10] },
  { stat: 'critMultiplier', range: [18, 40] },
  // lifesteal accessory aussi
  { stat: 'lifesteal', range: [2, 5] },
  { stat: 'cooldownReduction', range: [5, 12] },
  { stat: 'bonusFireDamage', range: [3, 7] },
  { stat: 'bonusIceDamage', range: [3, 7] },
  { stat: 'bonusShockDamage', range: [3, 7] },
  { stat: 'fireResist', range: [8, 18] },
  { stat: 'iceResist', range: [8, 18] },
  { stat: 'executeBonus', range: [10, 22] },
];

export function rollAffixes(pool, tier, ilvl) {
  const count = TIER_AFFIX_COUNT[tier] || 0;
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

export function generateSimItem(slot, ilvl, tier = null, options = {}) {
  if (!tier) {
    const r = Math.random();
    if (r < 0.05) tier = 'legendary';
    else if (r < 0.15) tier = 'epic';
    else if (r < 0.4) tier = 'rare';
    else tier = 'uncommon';
  }
  const ilvlMult = ILVL_MULT_FLAT[ilvl];

  if (slot === 'weapon') {
    const weaponKeys = options.weaponType ? [options.weaponType] : Object.keys(WEAPON_POOL);
    const wKey = weaponKeys[Math.floor(Math.random() * weaponKeys.length)];
    const w = WEAPON_POOL[wKey];
    return {
      slot, tier, ilvl, name: w.name,
      baseDamage: [Math.round(w.baseDamage[0] * ilvlMult), Math.round(w.baseDamage[1] * ilvlMult)],
      damageType: w.type, range: w.range,
      critBonus: w.critBonus || 0,
      bleedChance: w.bleedChance || 0,
      stunChance: w.stunChance || 0,
      affixes: rollAffixes(WEAPON_AFFIX_POOL, tier, ilvl),
    };
  }
  if (['head', 'chest', 'legs', 'gloves', 'boots'].includes(slot)) {
    const armorBase = { head: 10, chest: 15, legs: 9, gloves: 6, boots: 6 }[slot];
    const hpBase = { head: 0, chest: 25, legs: 10, gloves: 0, boots: 0 }[slot];
    return {
      slot, tier, ilvl,
      armor: Math.round(armorBase * ilvlMult),
      maxHP: Math.round(hpBase * ilvlMult),
      affixes: rollAffixes(ARMOR_AFFIX_POOL, tier, ilvl),
    };
  }
  if (slot === 'offhand') {
    return {
      slot, tier, ilvl,
      armor: Math.round(14 * ilvlMult),
      blockChance: rollAffixValue([10, 25], tier, ilvl, 'blockChance'),
      affixes: rollAffixes([...ARMOR_AFFIX_POOL, { stat: 'blockChance', range: [4, 10] }], tier, ilvl),
    };
  }
  if (slot === 'amulet' || slot === 'ring') {
    return { slot, tier, ilvl, affixes: rollAffixes(ACCESSORY_AFFIX_POOL, tier, ilvl) };
  }
}

export function aggregateStats(equipment) {
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
  // FIX hpRegen : cap d'effet à +5 PV/tour total même si plusieurs items en ont
  stats.hpRegen = Math.min(stats.hpRegen, 5);
  // FIX résistances : cap à 75% (pas plus)
  stats.fireResist = Math.min(stats.fireResist, 75);
  stats.iceResist = Math.min(stats.iceResist, 75);
  stats.shockResist = Math.min(stats.shockResist, 75);
  stats.poisonResist = Math.min(stats.poisonResist, 75);
  // FIX critChance : cap à 75%
  stats.critChance = Math.min(stats.critChance, 70);
  return stats;
}

export function buildPlayer(level, equipment) {
  // HP base : 50 + lvl*7 (avant 40 + lvl*8)
  // Niveau 1 : 50+7=57 (avant 48), niveau 10 : 50+70=120 (avant 120)
  // Buff bas niveau, identique haut niveau
  const baseHP = 50 + level * 7;
  const stats = aggregateStats(equipment);
  const maxHP = Math.round((baseHP + stats.maxHpFlat) * (1 + stats.maxHpPercent / 100));
  const weapon = equipment.weapon;
  const baseDmg = weapon ? weapon.baseDamage : [8, 12];
  const damageType = weapon ? weapon.damageType : 'blunt';
  return {
    name: 'Joueur', icon: '🧑', level,
    maxHP, hp: maxHP, ap: 6,
    damage: baseDmg, damageType,
    range: weapon ? weapon.range : 1,
    armor: stats.armor,
    critChance: 5 + stats.critChance,
    critMultiplier: 100 + stats.critMultiplier,
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
    statuses: [], isAlive: true, isPlayer: true,
  };
}

export function generateFullEquipment(ilvl, options = {}) {
  return {
    weapon: generateSimItem('weapon', ilvl, null, options),
    offhand: generateSimItem('offhand', ilvl),
    head: generateSimItem('head', ilvl),
    chest: generateSimItem('chest', ilvl),
    legs: generateSimItem('legs', ilvl),
    gloves: generateSimItem('gloves', ilvl),
    boots: generateSimItem('boots', ilvl),
    amulet: generateSimItem('amulet', ilvl),
    ring: generateSimItem('ring', ilvl),
  };
}

export function calculateDamage(attacker, target, isPlayer) {
  let dmg = rollInRange(attacker.damage);
  const dmgType = attacker.damageType;
  if (isPlayer) {
    if (dmgType === 'fire') dmg += attacker.bonusFireDamage || 0;
    else if (dmgType === 'magic') dmg += Math.round((attacker.bonusFireDamage || 0) * 0.5);
    else if (dmgType === 'ice') dmg += attacker.bonusIceDamage || 0;
    else if (dmgType === 'shock') dmg += attacker.bonusShockDamage || 0;
    else if (dmgType === 'poison') dmg += attacker.bonusPoisonDamage || 0;
    else {
      // Splash réduit pour armes physiques
      dmg += Math.round((attacker.bonusFireDamage || 0) * 0.4);
      dmg += Math.round((attacker.bonusIceDamage || 0) * 0.4);
      dmg += Math.round((attacker.bonusShockDamage || 0) * 0.4);
      dmg += Math.round((attacker.bonusPoisonDamage || 0) * 0.4);
    }
  }
  let isCrit = Math.random() * 100 < (attacker.critChance || 5);
  if (isCrit) {
    if (Math.random() * 100 < (target.criticalDodgeChance || 0)) {
      isCrit = false;
    } else {
      dmg = Math.round(dmg * ((attacker.critMultiplier || 100) / 100 + 1));
    }
  }
  if (Math.random() * 100 < (target.dodgeChance || 0)) return { damage: 0, dodged: true, isCrit: false };
  let blocked = false;
  if (Math.random() * 100 < (target.blockChance || 0)) { dmg = Math.round(dmg * 0.5); blocked = true; }
  const isPhysical = ['slash', 'pierce', 'blunt'].includes(dmgType);
  if (isPhysical) {
    const effectiveArmor = Math.max(0, (target.armor || 0) - (attacker.armorPenetration || 0));
    const armorReduction = Math.min(0.75, effectiveArmor / (effectiveArmor + 50));
    dmg = Math.max(1, Math.round(dmg * (1 - armorReduction)));
  } else {
    let resist = 0;
    if (dmgType === 'fire') resist = target.fireResist || 0;
    if (dmgType === 'ice') resist = target.iceResist || 0;
    if (dmgType === 'shock') resist = target.shockResist || 0;
    if (dmgType === 'poison') resist = target.poisonResist || 0;
    resist = Math.min(75, resist);
    dmg = Math.max(1, Math.round(dmg * (1 - resist / 100)));
  }
  if (isPlayer && attacker.executeBonus && target.hp / target.maxHP < 0.3) {
    dmg = Math.round(dmg * (1 + attacker.executeBonus / 100));
  }
  return { damage: dmg, dodged: false, blocked, isCrit };
}

export function applyStatus(target, statusId, duration, power = 1) {
  if (['stunned', 'frozen', 'rooted', 'silenced', 'chilled', 'slowed'].includes(statusId) && target.ccReduction) {
    duration = Math.max(1, Math.round(duration * (1 - target.ccReduction / 100)));
  }
  target.statuses.push({ id: statusId, duration, power });
}

export function tickStatuses(entity) {
  const newStatuses = [];
  for (const s of entity.statuses) {
    if (s.id === 'burning') entity.hp -= Math.max(1, Math.round(s.power * (1 - (entity.fireResist || 0) / 100)));
    else if (s.id === 'poisoned') entity.hp -= Math.max(1, Math.round(s.power * (1 - (entity.poisonResist || 0) / 100)));
    else if (s.id === 'bleeding') entity.hp -= s.power;
    else if (s.id === 'shocked') entity.hp -= Math.max(1, Math.round(s.power * (1 - (entity.shockResist || 0) / 100)));
    else if (s.id === 'chilled') entity.hp -= Math.max(1, Math.round(s.power * (1 - (entity.iceResist || 0) / 100)));
    s.duration -= 1;
    if (s.duration > 0) newStatuses.push(s);
  }
  entity.statuses = newStatuses;
  if (entity.hpRegen && entity.hp > 0 && entity.hp < entity.maxHP) {
    entity.hp = Math.min(entity.maxHP, entity.hp + entity.hpRegen);
  }
  if (entity.hp <= 0) { entity.isAlive = false; entity.hp = 0; }
}

export function isStunned(e) { return e.statuses.some(s => s.id === 'stunned' || s.id === 'frozen'); }

export function chooseTarget(player, enemies) {
  const alive = enemies.filter(e => e.isAlive);
  if (alive.length === 0) return null;
  if (player.executeBonus > 0) {
    const lowHp = alive.find(e => e.hp / e.maxHP < 0.3);
    if (lowHp) return lowHp;
  }
  return alive.reduce((a, b) => a.hp < b.hp ? a : b);
}

export function simulateRoom(player, enemies, metrics) {
  let turn = 0;
  while (player.isAlive && enemies.some(e => e.isAlive) && turn < 50) {
    turn++;
    tickStatuses(player);
    if (!player.isAlive) break;
    if (!isStunned(player)) {
      const target = chooseTarget(player, enemies);
      if (target) {
        const result = calculateDamage(player, target, true);
        if (!result.dodged) {
          target.hp -= result.damage;
          metrics.damageDealt += result.damage;
          if (result.isCrit) metrics.crits++;
          if (player.lifesteal) {
            player.hp = Math.min(player.maxHP, player.hp + Math.round(result.damage * (player.lifesteal / 100)));
          }
          if (player.bleedChance && Math.random() * 100 < player.bleedChance) applyStatus(target, 'bleeding', 3, Math.round(result.damage * 0.2));
          if (player.stunChance && Math.random() * 100 < player.stunChance) applyStatus(target, 'stunned', 1);
          if (player.bonusFireDamage > 0 && Math.random() < 0.2) applyStatus(target, 'burning', 3, Math.round(player.bonusFireDamage * 0.5));
          if (target.hp <= 0) { target.isAlive = false; target.hp = 0; }
        }
      }
    }
    for (const enemy of enemies) {
      if (!enemy.isAlive) continue;
      tickStatuses(enemy);
      if (!enemy.isAlive) continue;
      if (!player.isAlive) break;
      if (isStunned(enemy)) continue;
      const result = calculateDamage(enemy, player, false);
      if (!result.dodged) {
        player.hp -= result.damage;
        metrics.damageTaken += result.damage;
        metrics.maxHitTaken = Math.max(metrics.maxHitTaken, result.damage);
        if (player.thornsDamage && enemy.range === 1) {
          enemy.hp -= Math.max(1, player.thornsDamage - (enemy.armor || 0));
          if (enemy.hp <= 0) { enemy.isAlive = false; enemy.hp = 0; }
        }
        if (enemy.lifesteal) enemy.hp = Math.min(enemy.maxHP, enemy.hp + Math.round(result.damage * (enemy.lifesteal / 100)));
        if (enemy.applyBurn && Math.random() * 100 < enemy.applyBurn) applyStatus(player, 'burning', 3, 4);
        if (enemy.applyPoison && Math.random() * 100 < enemy.applyPoison) applyStatus(player, 'poisoned', 4, 3);
        if (enemy.applyChill && Math.random() * 100 < enemy.applyChill) applyStatus(player, 'chilled', 3, 3);
        if (enemy.applyShock && Math.random() * 100 < enemy.applyShock) applyStatus(player, 'shocked', 3, 4);
        if (enemy.applyBleed && Math.random() * 100 < enemy.applyBleed) applyStatus(player, 'bleeding', 3, 5);
        if (enemy.aoeDamage) {
          const aoe = Math.round(rollInRange(enemy.damage) * 0.3);
          const armorReduction = Math.min(0.75, (player.armor || 0) / ((player.armor || 0) + 50));
          player.hp -= Math.max(1, Math.round(aoe * (1 - armorReduction)));
        }
        if (player.hp <= 0) { player.isAlive = false; player.hp = 0; break; }
      }
    }
  }
  return turn;
}

export function generateDungeon(level, biomeBoss = null) {
  const rooms = [
    { label: 'Salle 1', enemies: [scaleEnemy(ENEMY_ARCHETYPES.brute, level), scaleEnemy(ENEMY_ARCHETYPES.skirmisher, level)] },
    { label: 'Salle 2', enemies: [scaleEnemy(ENEMY_ARCHETYPES.skirmisher, level), scaleEnemy(ENEMY_ARCHETYPES.archer, level), scaleEnemy(ENEMY_ARCHETYPES.toxicMutant, level)] },
    { label: 'Salle 3', enemies: [scaleEnemy(ENEMY_ARCHETYPES.berserker, level), scaleEnemy(ENEMY_ARCHETYPES.brute, level)] },
    { label: 'Salle 4', enemies: [scaleEnemy(ENEMY_ARCHETYPES.sentinel, level), scaleEnemy(ENEMY_ARCHETYPES.caster, level), scaleEnemy(ENEMY_ARCHETYPES.archer, level)] },
  ];
  const bossKeys = ['bossInferno', 'bossCryo', 'bossToxic', 'bossVoid', 'bossCrimson'];
  const bossKey = biomeBoss || bossKeys[Math.floor(Math.random() * bossKeys.length)];
  rooms.push({ label: 'BOSS', enemies: [scaleEnemy(ENEMY_ARCHETYPES[bossKey], level)] });
  return rooms;
}

export function simulateRun(player, dungeon) {
  const metrics = { damageDealt: 0, damageTaken: 0, maxHitTaken: 0, crits: 0, turnsTotal: 0, roomsCleared: 0, victory: false };
  for (const room of dungeon) {
    const turns = simulateRoom(player, room.enemies, metrics);
    metrics.turnsTotal += turns;
    if (!player.isAlive) break;
    metrics.roomsCleared++;
  }
  if (player.isAlive && metrics.roomsCleared === dungeon.length) metrics.victory = true;
  metrics.finalHpPercent = Math.round((player.hp / player.maxHP) * 100);
  return metrics;
}

export function clonePlayer(p) { return { ...p, statuses: [], isAlive: true, hp: p.maxHP }; }
export function cloneDungeon(d) {
  return d.map(r => ({ label: r.label, enemies: r.enemies.map(e => ({ ...e, statuses: [], isAlive: true, hp: e.maxHP })) }));
}
