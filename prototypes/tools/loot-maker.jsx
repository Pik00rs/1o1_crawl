import React, { useState, useMemo } from 'react';
import { Sword, Shield, Sparkles, Flame, Snowflake, Skull, Zap, Droplet, Dice5, Trash2, RefreshCw } from 'lucide-react';

// ============ DATA EMBEDDED ============

const TIER_CONFIG = {
  common: { color: '#9ca3af', label: 'Commun', affixCount: [0, 0], dropRate: 0.60 },
  magic: { color: '#60a5fa', label: 'Magique', affixCount: [1, 2], dropRate: 0.25 },
  rare: { color: '#fbbf24', label: 'Rare', affixCount: [2, 3], dropRate: 0.10 },
  epic: { color: '#c084fc', label: 'Épique', affixCount: [3, 4], dropRate: 0.04 },
  legendary: { color: '#fb923c', label: 'Légendaire', affixCount: [4, 4], dropRate: 0.009 },
  set: { color: '#4ade80', label: 'Set', affixCount: [2, 3], dropRate: 0.001 },
};

const TIER_RANGE_MULT = {
  magic: [0.6, 1.0],
  rare: [0.8, 1.3],
  epic: [1.0, 1.6],
  legendary: [1.3, 2.0],
  set: [0.9, 1.4],
};

const ILVL_MULT = {
  1: 0.50, 2: 0.65, 3: 0.80, 4: 0.95, 5: 1.00,
  6: 1.15, 7: 1.30, 8: 1.50, 9: 1.75, 10: 2.10,
};

const BIOMES = {
  inferno: {
    id: 'inferno', name: 'Inferno Sector', icon: '🔥',
    favoredTags: ['Fire', 'Stun', 'Rage'],
    essence: { id: 'ashEmber', name: 'Cendres ardentes', icon: '🔥' },
    favoredImplicits: ['sword', 'axe', 'mace', 'wand', 'staff'],
  },
  cryo: {
    id: 'cryo', name: 'Cryo Vault', icon: '❄️',
    favoredTags: ['Ice', 'Slow', 'Shield'],
    essence: { id: 'frostShard', name: 'Éclats glacés', icon: '❄️' },
    favoredImplicits: ['shield', 'staff', 'wand', 'mace'],
  },
  toxic: {
    id: 'toxic', name: 'Toxic Wastes', icon: '☠️',
    favoredTags: ['Poison', 'Bleed', 'Lifesteal'],
    essence: { id: 'acidBile', name: 'Bave acide', icon: '☠️' },
    favoredImplicits: ['dagger', 'axe', 'bow', 'wand'],
  },
  voidnet: {
    id: 'voidnet', name: 'Voidnet', icon: '⚡',
    favoredTags: ['Shock', 'Crit', 'Echo'],
    essence: { id: 'digitalFragment', name: 'Fragments numériques', icon: '⚡' },
    favoredImplicits: ['pistol', 'wand', 'bow', 'staff'],
  },
  crimson: {
    id: 'crimson', name: 'Crimson Pits', icon: '🩸',
    favoredTags: ['Bleed', 'Execute', 'Crit'],
    essence: { id: 'coagulatedBlood', name: 'Sang coagulé', icon: '🩸' },
    favoredImplicits: ['sword', 'axe', 'dagger', 'halberd'],
  },
};

const WEAPONS = {
  oneHand: {
    sword: { id: 'sword', name: 'Épée', icon: '🗡️', category: 'oneHand', tags: ['Slash', 'Melee'], baseDamage: [12, 18],
      possibleImplicits: [
        { id: 'bonusSlashDamage', valueRange: [3, 8], label: '+X dégâts Tranchants' },
        { id: 'critChance', valueRange: [3, 8], label: '+X% chance crit' },
        { id: 'attackSpeed', valueRange: [5, 12], label: '+X% vitesse attaque' },
      ]
    },
    dagger: { id: 'dagger', name: 'Dague', icon: '🔪', category: 'oneHand', tags: ['Pierce', 'Melee', 'Light'], baseDamage: [8, 14],
      possibleImplicits: [
        { id: 'critChance', valueRange: [5, 12], label: '+X% chance crit' },
        { id: 'critMultiplier', valueRange: [10, 25], label: '+X% multi crit' },
        { id: 'bleedChance', valueRange: [10, 25], label: '+X% chance Saignement' },
      ]
    },
    axe: { id: 'axe', name: 'Hache', icon: '🪓', category: 'oneHand', tags: ['Slash', 'Melee', 'Bleed'], baseDamage: [14, 20],
      possibleImplicits: [
        { id: 'bleedChance', valueRange: [15, 30], label: '+X% chance Saignement' },
        { id: 'bonusSlashDamage', valueRange: [4, 10], label: '+X dégâts Tranchants' },
        { id: 'executeBonus', valueRange: [15, 30], label: '+X% sur cibles <30% PV' },
      ]
    },
    mace: { id: 'mace', name: 'Masse', icon: '🔨', category: 'oneHand', tags: ['Blunt', 'Melee'], baseDamage: [13, 19],
      possibleImplicits: [
        { id: 'bonusBluntDamage', valueRange: [4, 10], label: '+X dégâts Contondants' },
        { id: 'armorPenetration', valueRange: [3, 8], label: '+X pénétration armure' },
        { id: 'stunChance', valueRange: [10, 20], label: '+X% chance Étourdir' },
      ]
    },
    wand: { id: 'wand', name: 'Wand', icon: '🪄', category: 'oneHand', tags: ['Magic', 'Caster'], baseDamage: [8, 12],
      possibleImplicits: [
        { id: 'spellCostReduction', valueRange: [1, 1], label: '-X AP coût sorts' },
        { id: 'bonusMagicDamage', valueRange: [10, 20], label: '+X% dégâts magiques' },
        { id: 'cooldownReduction', valueRange: [10, 20], label: '-X% cooldowns' },
      ]
    },
    pistol: { id: 'pistol', name: 'Pistolet', icon: '🔫', category: 'oneHand', tags: ['Pierce', 'Ranged'], baseDamage: [10, 16],
      possibleImplicits: [
        { id: 'rangeBonus', valueRange: [1, 1], label: '+X portée' },
        { id: 'critChance', valueRange: [4, 10], label: '+X% chance crit' },
        { id: 'attackSpeed', valueRange: [8, 15], label: '+X% vitesse attaque' },
      ]
    },
  },
  twoHand: {
    greatsword: { id: 'greatsword', name: 'Épée 2 mains', icon: '⚔️', category: 'twoHand', tags: ['Slash', 'Heavy'], baseDamage: [22, 32], bonusAffixSlot: true,
      possibleImplicits: [
        { id: 'bonusSlashDamage', valueRange: [6, 14], label: '+X dégâts Tranchants' },
        { id: 'cleave', valueRange: [1, 1], label: 'Frappe 2 cases adjacentes' },
        { id: 'critChance', valueRange: [4, 10], label: '+X% chance crit' },
      ]
    },
    bow: { id: 'bow', name: 'Arc', icon: '🏹', category: 'twoHand', tags: ['Pierce', 'Ranged'], baseDamage: [18, 26], bonusAffixSlot: true,
      possibleImplicits: [
        { id: 'bonusPierceDamage', valueRange: [5, 12], label: '+X dégâts Perforants' },
        { id: 'rangeBonus', valueRange: [1, 1], label: '+X portée' },
        { id: 'accuracy', valueRange: [15, 30], label: '+X% précision' },
      ]
    },
    staff: { id: 'staff', name: 'Bâton', icon: '🪄', category: 'twoHand', tags: ['Magic', 'Heavy'], baseDamage: [14, 22], bonusAffixSlot: true,
      possibleImplicits: [
        { id: 'bonusMagicDamage', valueRange: [15, 30], label: '+X% dégâts magiques' },
        { id: 'cooldownReduction', valueRange: [12, 25], label: '-X% cooldowns' },
        { id: 'freeSpell', valueRange: [1, 1], label: '1 sort gratuit/combat' },
      ]
    },
  },
  offHand: {
    shield: { id: 'shield', name: 'Bouclier', icon: '🛡️', category: 'offHand', tags: ['Defense'],
      possibleImplicits: [
        { id: 'armor', valueRange: [6, 12], label: '+X armure' },
        { id: 'riposteChance', valueRange: [25, 50], label: '+X% riposte' },
      ]
    },
  }
};

const ARMOR = {
  head: { name: 'Casque', icon: '⛑️', tags: ['Defense'], implicit: { id: 'armor', valueRange: [4, 8], label: '+X armure' } },
  chest: { name: 'Veste', icon: '🦺', tags: ['Defense'], implicit: { id: 'maxHP', valueRange: [12, 25], label: '+X PV max' } },
  legs: { name: 'Pantalon', icon: '👖', tags: ['Defense'], implicit: { id: 'armor', valueRange: [3, 7], label: '+X armure' } },
  gloves: { name: 'Gants', icon: '🧤', tags: ['Offense'], implicit: { id: 'critChance', valueRange: [3, 7], label: '+X% chance crit' } },
  boots: { name: 'Bottes', icon: '👢', tags: ['Mobility'], implicit: { id: 'freeMovement', valueRange: [1, 1], label: '+X case mvt gratuit' } },
};

const AMULETS = [
  { name: 'Amulette de Pyromancie', icon: '📿', tags: ['Fire', 'Magic'], spell: 'Boule de Feu — zone 3×3, applique Brûlé' },
  { name: 'Cœur de Givre', icon: '❄️', tags: ['Ice', 'Magic'], spell: 'Nova Glaciale — explosion 3×3, applique Gelé' },
  { name: 'Capteur Tempête', icon: '⚡', tags: ['Shock', 'Magic'], spell: 'Éclair Chain — touche 3 ennemis' },
  { name: 'Pendentif Toxique', icon: '☠️', tags: ['Poison'], spell: 'Nuage Toxique — zone 3×3 sur 3 tours' },
  { name: 'Larme de Vie', icon: '💚', tags: ['Heal'], spell: 'Vague de Soin — restaure 30% PV max' },
];

const RINGS = [
  { name: 'Anneau de Sang', icon: '💍', tags: ['Bleed'], passive: 'Tes attaques mêlée appliquent toujours 1 stack de Saignement.' },
  { name: 'Anneau des Braises', icon: '🔥', tags: ['Fire'], passive: 'Tes Brûlures durent +50% plus longtemps.' },
  { name: 'Anneau du Givre', icon: '❄️', tags: ['Ice'], passive: 'Tes critiques appliquent Glacé.' },
  { name: 'Anneau Vampirique', icon: '💉', tags: ['Lifesteal'], passive: 'Tu récupères 15% des dégâts mêlée infligés en PV.' },
  { name: 'Anneau de l\'Écho', icon: '🔁', tags: ['Caster'], passive: 'Tes sorts ont 15% chance de se relancer gratis.' },
];

const AFFIXES = {
  prefixes: {
    flaming: { name: 'Enflammée', stat: 'bonusFireDamage', label: '+X dégâts Feu', valueRange: [3, 8], tags: ['Fire'], validSlots: ['mainhand', 'ring', 'amulet', 'gloves'] },
    freezing: { name: 'Glaciale', stat: 'bonusIceDamage', label: '+X dégâts Glace', valueRange: [3, 8], tags: ['Ice'], validSlots: ['mainhand', 'ring', 'amulet', 'gloves'] },
    venomous: { name: 'Venimeuse', stat: 'bonusPoisonDamage', label: '+X dégâts Poison', valueRange: [3, 7], tags: ['Poison'], validSlots: ['mainhand', 'ring', 'amulet', 'gloves'] },
    shocking: { name: 'Foudroyante', stat: 'bonusShockDamage', label: '+X dégâts Foudre', valueRange: [3, 8], tags: ['Shock'], validSlots: ['mainhand', 'ring', 'amulet', 'gloves'] },
    bloody: { name: 'Sanglante', stat: 'bleedChance', label: '+X% chance Saignement', valueRange: [8, 18], tags: ['Bleed'], validSlots: ['mainhand'] },
    sharp: { name: 'Tranchante', stat: 'bonusSlashDamage', label: '+X dégâts Tranchants', valueRange: [3, 7], tags: ['Slash'], validSlots: ['mainhand', 'gloves'] },
    vicious: { name: 'Vicieuse', stat: 'critChance', label: '+X% chance crit', valueRange: [3, 8], tags: ['Crit'], validSlots: ['mainhand', 'offhand', 'gloves', 'ring', 'amulet'] },
    deadly: { name: 'Mortelle', stat: 'critMultiplier', label: '+X% multi crit', valueRange: [10, 25], tags: ['Crit'], validSlots: ['mainhand', 'offhand', 'gloves', 'ring', 'amulet'] },
    swift: { name: 'Rapide', stat: 'bonusAP', label: '+X AP par tour', valueRange: [1, 1], tags: ['Mobility'], validSlots: ['boots', 'amulet', 'ring'] },
    reinforced: { name: 'Renforcée', stat: 'armor', label: '+X armure', valueRange: [3, 8], tags: ['Defense'], validSlots: ['head', 'chest', 'legs', 'gloves', 'boots', 'offhand'] },
    vital: { name: 'Vitale', stat: 'maxHP', label: '+X PV max', valueRange: [8, 18], tags: ['Defense'], validSlots: ['chest', 'legs', 'amulet', 'ring'] },
    lifestealing: { name: 'Vampirique', stat: 'lifesteal', label: '+X% lifesteal', valueRange: [3, 8], tags: ['Lifesteal'], validSlots: ['mainhand', 'ring', 'amulet'] },
    magicFinder: { name: 'du Découvreur', stat: 'magicFind', label: '+X% Magic Find', valueRange: [5, 15], tags: ['Loot'], validSlots: ['head', 'chest', 'boots', 'ring', 'amulet'] },
  },
  suffixes: {
    ofTheWind: { name: 'du Vent', stat: 'freeMovement', label: '+X case mvt gratuit', valueRange: [1, 2], tags: ['Mobility'], validSlots: ['boots', 'amulet'] },
    ofVigor: { name: 'de Vigueur', stat: 'maxHP', label: '+X PV max', valueRange: [10, 20], tags: ['Defense'], validSlots: ['chest', 'amulet', 'ring'] },
    ofShadow: { name: 'des Ombres', stat: 'dodgeChance', label: '+X% esquive', valueRange: [3, 10], tags: ['Defense', 'Shadow'], validSlots: ['boots', 'gloves', 'ring'] },
    ofFortitude: { name: 'de Robustesse', stat: 'armor', label: '+X armure', valueRange: [3, 7], tags: ['Defense'], validSlots: ['head', 'chest', 'legs', 'gloves', 'boots'] },
    ofFireResist: { name: 'Pyro-Résistante', stat: 'fireResist', label: '+X% rés Feu', valueRange: [10, 25], tags: ['Defense'], validSlots: ['head', 'chest', 'legs', 'gloves', 'boots', 'ring', 'amulet'] },
    ofPenetration: { name: 'Perforante', stat: 'armorPenetration', label: '+X pénét armure', valueRange: [2, 6], tags: ['Offense'], validSlots: ['mainhand', 'gloves', 'ring'] },
    ofExecution: { name: 'd\'Exécution', stat: 'executeBonus', label: '+X% sur cibles <30% PV', valueRange: [10, 25], tags: ['Execute'], validSlots: ['mainhand', 'ring', 'amulet'] },
    ofConcentration: { name: 'de Concentration', stat: 'cooldownReduction', label: '-X% cooldowns', valueRange: [5, 12], tags: ['Caster'], validSlots: ['amulet', 'ring', 'offhand'] },
    ofResonance: { name: 'de Résonance', stat: 'tagResonance', label: '+X% par item même tag', valueRange: [3, 7], tags: ['Resonance'], validSlots: ['amulet', 'ring'] },
  },
};

const LEGENDARIES = [
  { name: 'Lame du Phénix', icon: '🔥', type: 'weapon', subtype: 'sword', category: 'oneHand', tags: ['Fire'], baseDamage: [12, 18], biome: 'inferno', uniqueModifier: 'Quand tu tues un ennemi, propage Brûlé aux adjacents.' },
  { name: 'Crocs des Sept Veines', icon: '🩸', type: 'weapon', subtype: 'dagger', category: 'oneHand', tags: ['Bleed'], baseDamage: [8, 14], biome: 'crimson', uniqueModifier: 'Tes attaques basiques appliquent toujours 1 stack de Saignement.' },
  { name: 'Arc des Tempêtes', icon: '⚡', type: 'weapon', subtype: 'bow', category: 'twoHand', tags: ['Shock'], baseDamage: [18, 26], biome: 'voidnet', uniqueModifier: 'Tes tirs traversent les ennemis et appliquent Électrocuté.' },
  { name: 'Heaume de l\'Oracle', icon: '👁️', type: 'armor', slot: 'head', tags: ['Vision'], uniqueModifier: 'Tu vois les actions ennemies du prochain tour.' },
  { name: 'Plastron des Mille Ans', icon: '🛡️', type: 'armor', slot: 'chest', tags: ['Tank'], uniqueModifier: '+50% PV max mais -2 AP par tour.' },
  { name: 'Gants du Bourreau', icon: '⚰️', type: 'armor', slot: 'gloves', tags: ['Execute'], uniqueModifier: '+100% chance crit sur cibles <30% PV.' },
  { name: 'Bottes de la Tempête', icon: '👢', type: 'armor', slot: 'boots', tags: ['Shock'], biome: 'voidnet', uniqueModifier: 'Te déplacer applique Foudre aux ennemis adjacents.' },
  { name: 'Cœur de Volcan', icon: '🌋', type: 'amulet', slot: 'amulet', tags: ['Fire'], biome: 'inferno', spell: 'Éruption — zone 5×5, gros dégâts feu', uniqueModifier: 'Pas de cooldown si tu es <30% PV.' },
  { name: 'Anneau du Vampire', icon: '💉', type: 'ring', slot: 'ring', tags: ['Lifesteal'], biome: 'crimson', uniqueModifier: 'Tes attaques mêlée te soignent de 25% des dégâts infligés.' },
];

const SETS = {
  ashShroud: { name: 'Linceul des Cendres', biome: 'inferno', tags: ['Fire'] },
  frozenMantle: { name: 'Manteau Glacé', biome: 'cryo', tags: ['Ice'] },
  bloodPath: { name: 'Voie du Sang', biome: 'crimson', tags: ['Bleed'] },
  toxicRobes: { name: 'Robe Toxique', biome: 'toxic', tags: ['Poison'] },
  voidWeave: { name: 'Trame du Vide', biome: 'voidnet', tags: ['Shock'] },
};

// ============ GENERATOR ============

function rollValue([min, max]) {
  return Math.round((min + Math.random() * (max - min)) * 10) / 10;
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function rollItemTier(magicFind) {
  const mfBonus = magicFind / 100;
  const adjusted = {
    common: TIER_CONFIG.common.dropRate * 100 * (1 - mfBonus * 0.5),
    magic: TIER_CONFIG.magic.dropRate * 100 * (1 + mfBonus * 0.5),
    rare: TIER_CONFIG.rare.dropRate * 100 * (1 + mfBonus * 0.8),
    epic: TIER_CONFIG.epic.dropRate * 100 * (1 + mfBonus * 1.2),
    legendary: TIER_CONFIG.legendary.dropRate * 100 * (1 + mfBonus * 1.5),
    set: TIER_CONFIG.set.dropRate * 100 * (1 + mfBonus * 1.5),
  };
  const total = Object.values(adjusted).reduce((a, b) => a + b, 0);
  for (const k in adjusted) adjusted[k] = (adjusted[k] / total) * 100;
  let cumul = 0;
  const roll = Math.random() * 100;
  for (const [tier, rate] of Object.entries(adjusted)) {
    cumul += rate;
    if (roll < cumul) return tier;
  }
  return 'common';
}

function rollImplicit(possibleImplicits, ilvl) {
  const impl = possibleImplicits[Math.floor(Math.random() * possibleImplicits.length)];
  const mult = ILVL_MULT[ilvl];
  const value = rollValue([impl.valueRange[0] * mult, impl.valueRange[1] * mult]);
  return { ...impl, value };
}

function rollAffixValue(affix, tier, ilvl) {
  const tMult = TIER_RANGE_MULT[tier];
  const iMult = ILVL_MULT[ilvl];
  const finalMin = affix.valueRange[0] * tMult[0] * iMult;
  const finalMax = affix.valueRange[1] * tMult[1] * iMult;
  const value = rollValue([finalMin, finalMax]);
  const quality = Math.round(((value - finalMin) / (finalMax - finalMin)) * 100);
  return {
    id: affix.id || affix.name,
    name: affix.name,
    label: affix.label,
    value,
    minRolled: Math.round(finalMin * 10) / 10,
    maxRolled: Math.round(finalMax * 10) / 10,
    quality: isNaN(quality) ? 100 : quality,
    tags: affix.tags || [],
  };
}

function pickAffix(item, biome, useBiome, usedIds) {
  const all = [
    ...Object.entries(AFFIXES.prefixes).map(([id, a]) => ({ ...a, id, type: 'prefix' })),
    ...Object.entries(AFFIXES.suffixes).map(([id, a]) => ({ ...a, id, type: 'suffix' })),
  ];
  const slotMap = { oneHand: 'mainhand', twoHand: 'mainhand', offHand: 'offhand' };
  const itemSlot = slotMap[item.category] || item.slot || item.subtype;
  let pool = all.filter(a => !usedIds.has(a.id) && (!a.validSlots || a.validSlots.includes(itemSlot)));
  if (pool.length === 0) return null;
  if (useBiome && biome) {
    const favored = pool.filter(a => a.tags?.some(t => biome.favoredTags.includes(t)));
    if (favored.length > 0) pool = favored;
  }
  return pool[Math.floor(Math.random() * pool.length)];
}

function generateLoot(biomeId, ilvl, magicFind) {
  const tier = rollItemTier(magicFind);
  const biome = BIOMES[biomeId];

  // Legendary
  if (tier === 'legendary' && Math.random() < 0.7) {
    const compatibleLegs = LEGENDARIES.filter(l => !l.biome || l.biome === biomeId);
    const pool = compatibleLegs.length > 0 ? [...compatibleLegs, ...LEGENDARIES] : LEGENDARIES;
    const def = pool[Math.floor(Math.random() * pool.length)];
    const item = { uid: uid(), tier: 'legendary', ilvl, ...def, isLegendary: true, affixes: [] };
    const usedIds = new Set();
    for (let i = 0; i < 4; i++) {
      const a = pickAffix(item, biome, Math.random() < 0.5, usedIds);
      if (a) {
        item.affixes.push(rollAffixValue(a, 'legendary', ilvl));
        usedIds.add(a.id);
      }
    }
    return item;
  }

  // Set piece
  if (tier === 'set') {
    const setIds = Object.keys(SETS);
    const pickedSet = setIds.find(s => SETS[s].biome === biomeId) || setIds[Math.floor(Math.random() * setIds.length)];
    const set = SETS[pickedSet];
    const slots = ['head', 'chest', 'legs', 'gloves', 'boots'];
    const slot = slots[Math.floor(Math.random() * slots.length)];
    const armorDef = ARMOR[slot];
    const mult = ILVL_MULT[ilvl];
    const item = {
      uid: uid(), tier: 'set', ilvl, type: 'armor', subtype: slot, slot,
      name: `${armorDef.name} ${set.name}`, icon: armorDef.icon,
      tags: [...armorDef.tags, ...set.tags], setName: set.name,
      implicit: { ...armorDef.implicit, value: rollValue([armorDef.implicit.valueRange[0] * mult, armorDef.implicit.valueRange[1] * mult]) },
      affixes: [], isSetPiece: true,
    };
    const usedIds = new Set();
    const count = 2 + Math.floor(Math.random() * 2);
    for (let i = 0; i < count; i++) {
      const a = pickAffix(item, biome, Math.random() < 0.5, usedIds);
      if (a) { item.affixes.push(rollAffixValue(a, 'set', ilvl)); usedIds.add(a.id); }
    }
    return item;
  }

  // Choose item type
  const r = Math.random();
  let itemType, subtype;
  if (r < 0.4) {
    itemType = 'weapon';
    const allWeapons = [
      ...Object.keys(WEAPONS.oneHand),
      ...Object.keys(WEAPONS.twoHand),
      ...Object.keys(WEAPONS.offHand),
    ];
    const favored = biome.favoredImplicits || [];
    const weighted = allWeapons.flatMap(w => Array(favored.includes(w) ? 2 : 1).fill(w));
    subtype = weighted[Math.floor(Math.random() * weighted.length)];
  } else if (r < 0.9) {
    itemType = 'armor';
    const slots = ['head', 'chest', 'legs', 'gloves', 'boots'];
    subtype = slots[Math.floor(Math.random() * slots.length)];
  } else {
    itemType = 'jewelry';
    subtype = Math.random() < 0.5 ? 'amulet' : 'ring';
  }

  // Build base
  let item;
  if (itemType === 'weapon') {
    let def, category;
    if (WEAPONS.oneHand[subtype]) { def = WEAPONS.oneHand[subtype]; category = 'oneHand'; }
    else if (WEAPONS.twoHand[subtype]) { def = WEAPONS.twoHand[subtype]; category = 'twoHand'; }
    else { def = WEAPONS.offHand[subtype]; category = 'offHand'; }
    const mult = ILVL_MULT[ilvl];
    item = {
      uid: uid(), type: 'weapon', subtype, category, tier, ilvl,
      name: def.name, icon: def.icon, tags: [...def.tags],
      baseDamage: def.baseDamage ? [Math.round(def.baseDamage[0] * mult), Math.round(def.baseDamage[1] * mult)] : null,
      implicit: rollImplicit(def.possibleImplicits, ilvl),
      affixes: [], bonusAffixSlot: !!def.bonusAffixSlot,
    };
  } else if (itemType === 'armor') {
    const def = ARMOR[subtype];
    const mult = ILVL_MULT[ilvl];
    item = {
      uid: uid(), type: 'armor', subtype, slot: subtype, tier, ilvl,
      name: def.name, icon: def.icon, tags: [...def.tags],
      implicit: { ...def.implicit, value: rollValue([def.implicit.valueRange[0] * mult, def.implicit.valueRange[1] * mult]) },
      affixes: [],
    };
  } else {
    const pool = subtype === 'amulet' ? AMULETS : RINGS;
    const def = pool[Math.floor(Math.random() * pool.length)];
    item = {
      uid: uid(), type: 'jewelry', subtype, slot: subtype, tier, ilvl,
      name: def.name, icon: def.icon, tags: [...def.tags],
      spell: def.spell || null, passive: def.passive || null,
      affixes: [],
    };
  }

  // Roll affixes
  const config = TIER_CONFIG[tier];
  const [aMin, aMax] = config.affixCount;
  let count = aMin + Math.floor(Math.random() * (aMax - aMin + 1));
  if (item.bonusAffixSlot) count += 1;
  const usedIds = new Set();
  for (let i = 0; i < count; i++) {
    const a = pickAffix(item, biome, Math.random() < 0.5, usedIds);
    if (a) { item.affixes.push(rollAffixValue(a, tier, ilvl)); usedIds.add(a.id); }
  }

  return item;
}

// ============ COMPONENT ============

function getQualityColor(q) {
  if (q >= 100) return '#facc15';
  if (q >= 85) return '#22d3ee';
  if (q >= 60) return '#4ade80';
  if (q >= 30) return '#facc15';
  return '#ef4444';
}

function getQualityLabel(q) {
  if (q >= 100) return 'PARFAIT';
  if (q >= 85) return 'EXCELLENT';
  if (q >= 60) return 'BON';
  if (q >= 30) return 'CORRECT';
  return 'FAIBLE';
}

function ItemCard({ item, onBurn, onReroll }) {
  const tierColor = TIER_CONFIG[item.tier].color;
  const tierLabel = TIER_CONFIG[item.tier].label;
  const tierBg = `${tierColor}22`;

  return (
    <div
      className="border rounded-lg p-3 transition-all hover:scale-[1.01]"
      style={{
        borderColor: tierColor,
        background: `linear-gradient(135deg, ${tierBg}, transparent)`,
        boxShadow: item.tier === 'legendary' ? `0 0 16px ${tierColor}66` : item.tier === 'set' ? `0 0 12px ${tierColor}55` : 'none'
      }}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{item.icon}</span>
          <div>
            <div className="font-bold text-sm leading-tight" style={{ color: tierColor }}>
              {item.name}
            </div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">
              {tierLabel} · iLvl {item.ilvl} · {item.subtype}
            </div>
          </div>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => onBurn(item)}
            className="p-1.5 rounded bg-slate-800 hover:bg-red-900/50 text-slate-400 hover:text-red-400 transition"
            title="Brûler"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {item.tags && item.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {item.tags.map((t, i) => (
            <span key={i} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-700/50 text-cyan-300 uppercase tracking-wider">
              {t}
            </span>
          ))}
        </div>
      )}

      {item.uniqueModifier && (
        <div className="text-xs italic mb-2 px-2 py-1 rounded bg-orange-500/10 border-l-2 border-orange-500 text-orange-200">
          ⭐ {item.uniqueModifier}
        </div>
      )}

      {item.passive && (
        <div className="text-xs italic mb-2 px-2 py-1 rounded bg-purple-500/10 border-l-2 border-purple-500 text-purple-200">
          ⚡ {item.passive}
        </div>
      )}

      {item.spell && (
        <div className="text-xs italic mb-2 px-2 py-1 rounded bg-indigo-500/10 border-l-2 border-indigo-500 text-indigo-200">
          🔮 {item.spell}
        </div>
      )}

      {item.baseDamage && (
        <div className="text-xs text-slate-300 mb-1">
          ⚔ <span className="font-mono">{item.baseDamage[0]}-{item.baseDamage[1]}</span> dégâts
        </div>
      )}

      {item.implicit && (
        <div className="text-xs text-cyan-300 mb-2">
          ▸ {item.implicit.label.replace('X', item.implicit.value)}
        </div>
      )}

      {item.affixes && item.affixes.length > 0 && (
        <div className="space-y-1 pt-2 border-t border-slate-700/50">
          {item.affixes.map((a, i) => (
            <div key={i} className="flex items-center justify-between text-xs">
              <span className="text-slate-300 flex-1 truncate">
                + {a.label.replace('X', a.value)}
              </span>
              <div className="flex items-center gap-1.5 ml-2">
                <div className="w-12 h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all"
                    style={{
                      width: `${a.quality}%`,
                      background: getQualityColor(a.quality),
                      boxShadow: a.quality >= 100 ? `0 0 4px ${getQualityColor(a.quality)}` : 'none'
                    }}
                  />
                </div>
                <span
                  className="text-[10px] font-mono w-7 text-right"
                  style={{ color: getQualityColor(a.quality) }}
                >
                  {a.quality}%
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {item.setName && (
        <div className="mt-2 text-[10px] text-emerald-400 uppercase tracking-wider font-semibold">
          ⚙ Set : {item.setName}
        </div>
      )}
    </div>
  );
}

function StatBadge({ label, value, color }) {
  return (
    <div className="flex flex-col items-center bg-slate-800/50 rounded px-2 py-1 min-w-[60px]">
      <div className="text-[9px] uppercase tracking-wider text-slate-400">{label}</div>
      <div className="text-sm font-bold" style={{ color }}>{value}</div>
    </div>
  );
}

export default function LootMaker() {
  const [biome, setBiome] = useState('inferno');
  const [ilvl, setIlvl] = useState(5);
  const [magicFind, setMagicFind] = useState(0);
  const [count, setCount] = useState(12);
  const [items, setItems] = useState([]);
  const [essences, setEssences] = useState({});
  const [totalRolls, setTotalRolls] = useState(0);

  const stats = useMemo(() => {
    const s = { common: 0, magic: 0, rare: 0, epic: 0, legendary: 0, set: 0 };
    for (const it of items) s[it.tier]++;
    return s;
  }, [items]);

  const handleRoll = () => {
    const newItems = [];
    for (let i = 0; i < count; i++) {
      const item = generateLoot(biome, ilvl, magicFind);
      item.biomeOrigin = biome;
      newItems.push(item);
    }
    setItems(newItems);
    setTotalRolls(t => t + count);
  };

  const handleBurn = (item) => {
    const baseTier = { common: 1, magic: 2, rare: 5, epic: 12, legendary: 30, set: 25 };
    const ess = (baseTier[item.tier] || 1) * item.ilvl;
    const biomeData = BIOMES[item.biomeOrigin || biome];
    const essKey = biomeData.essence.id;
    setEssences(prev => ({ ...prev, [essKey]: (prev[essKey] || 0) + ess }));
    setItems(items.filter(i => i.uid !== item.uid));
  };

  const handleClear = () => {
    setItems([]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 font-mono">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Dice5 className="text-pink-500" size={28} />
              <span className="bg-gradient-to-r from-pink-500 to-cyan-400 bg-clip-text text-transparent">
                LOOT MAKER
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">Visualiseur du système de génération de butin</p>
          </div>
          <div className="flex gap-2">
            <StatBadge label="Total rolls" value={totalRolls} color="#22d3ee" />
            <StatBadge label="Items affichés" value={items.length} color="#a78bfa" />
          </div>
        </div>

        {/* CONTROLS */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 mb-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">Biome</label>
              <select
                value={biome}
                onChange={e => setBiome(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-sm focus:border-pink-500 outline-none"
              >
                {Object.values(BIOMES).map(b => (
                  <option key={b.id} value={b.id}>{b.icon} {b.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">
                Item Level: <span className="text-cyan-400 font-bold">{ilvl}</span>
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={ilvl}
                onChange={e => setIlvl(parseInt(e.target.value))}
                className="w-full accent-pink-500"
              />
              <div className="text-[9px] text-slate-500 mt-1">Multi: ×{ILVL_MULT[ilvl]}</div>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">
                Magic Find: <span className="text-yellow-400 font-bold">{magicFind}%</span>
              </label>
              <input
                type="range"
                min="0"
                max="200"
                step="10"
                value={magicFind}
                onChange={e => setMagicFind(parseInt(e.target.value))}
                className="w-full accent-yellow-500"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">
                Quantité: <span className="text-purple-400 font-bold">{count}</span>
              </label>
              <input
                type="range"
                min="1"
                max="50"
                value={count}
                onChange={e => setCount(parseInt(e.target.value))}
                className="w-full accent-purple-500"
              />
            </div>
            <div className="flex items-end gap-2">
              <button
                onClick={handleRoll}
                className="flex-1 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold py-2 px-4 rounded transition flex items-center justify-center gap-2 text-sm"
              >
                <Dice5 size={16} />
                ROLL
              </button>
              {items.length > 0 && (
                <button
                  onClick={handleClear}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2 px-3 rounded transition"
                  title="Vider"
                >
                  <RefreshCw size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Tags du biome */}
          <div className="mt-3 pt-3 border-t border-slate-800 flex items-center gap-2 text-xs flex-wrap">
            <span className="text-slate-400">Tags favorisés :</span>
            {BIOMES[biome].favoredTags.map(t => (
              <span key={t} className="px-2 py-0.5 rounded bg-pink-500/20 text-pink-300 text-[10px] uppercase tracking-wider">
                {t}
              </span>
            ))}
            <span className="text-slate-400 ml-2">Essence :</span>
            <span className="text-amber-300 text-[10px]">
              {BIOMES[biome].essence.icon} {BIOMES[biome].essence.name}
            </span>
          </div>
        </div>

        {/* STATS DROP */}
        {items.length > 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 mb-4">
            <div className="text-[10px] uppercase tracking-wider text-slate-400 mb-2">Distribution du roll actuel</div>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              {Object.entries(stats).map(([tier, n]) => (
                <div key={tier} className="bg-slate-800 rounded px-2 py-1.5">
                  <div
                    className="text-[9px] uppercase tracking-wider"
                    style={{ color: TIER_CONFIG[tier].color }}
                  >
                    {TIER_CONFIG[tier].label}
                  </div>
                  <div className="text-sm font-bold flex items-baseline gap-1">
                    <span style={{ color: TIER_CONFIG[tier].color }}>{n}</span>
                    <span className="text-[9px] text-slate-500">
                      ({items.length ? ((n / items.length) * 100).toFixed(0) : 0}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ESSENCES STOCK */}
        {Object.keys(essences).length > 0 && (
          <div className="bg-amber-900/20 border border-amber-700/50 rounded-lg p-3 mb-4">
            <div className="text-[10px] uppercase tracking-wider text-amber-400 mb-2 flex items-center gap-2">
              <Sparkles size={12} />
              Essences accumulées (par burn)
            </div>
            <div className="flex flex-wrap gap-3 text-xs">
              {Object.entries(essences).map(([id, count]) => {
                const biomeData = Object.values(BIOMES).find(b => b.essence.id === id);
                return (
                  <div key={id} className="flex items-center gap-2 bg-slate-900/50 rounded px-2 py-1">
                    <span>{biomeData?.essence.icon}</span>
                    <span className="text-slate-300">{biomeData?.essence.name}</span>
                    <span className="text-amber-400 font-bold font-mono">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ITEMS GRID */}
        {items.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <Dice5 size={48} className="mx-auto mb-4 opacity-40" />
            <p className="text-sm">Clique sur ROLL pour générer du loot</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {items.map(item => (
              <ItemCard
                key={item.uid}
                item={item}
                onBurn={handleBurn}
              />
            ))}
          </div>
        )}

        {/* LEGEND */}
        <div className="mt-6 pt-4 border-t border-slate-800 text-[10px] text-slate-500 grid grid-cols-2 md:grid-cols-5 gap-2">
          {Object.entries(TIER_CONFIG).map(([tier, cfg]) => (
            <div key={tier} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ background: cfg.color }} />
              <span>{cfg.label}</span>
              <span className="text-slate-600">{(cfg.dropRate * 100).toFixed(1)}%</span>
            </div>
          ))}
          <div className="text-slate-600 italic md:col-span-5 mt-2">
            💡 Astuce : essaie biome Inferno + iLvl 10 + Magic Find 200% pour spam de Légendaires
          </div>
        </div>
      </div>
    </div>
  );
}
