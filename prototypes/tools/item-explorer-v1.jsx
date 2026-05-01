import React, { useState, useMemo } from 'react';
import { Sword, Shield, Sparkles, Search, Filter, Info, ChevronRight } from 'lucide-react';

// ============ DATA ============

const TIER_CONFIG = {
  common: { color: '#9ca3af', label: 'Commun', affixCount: [0, 0] },
  magic: { color: '#60a5fa', label: 'Magique', affixCount: [1, 2] },
  rare: { color: '#fbbf24', label: 'Rare', affixCount: [2, 3] },
  epic: { color: '#c084fc', label: 'Épique', affixCount: [3, 4] },
  legendary: { color: '#fb923c', label: 'Légendaire', affixCount: [4, 4] },
  set: { color: '#4ade80', label: 'Set', affixCount: [2, 3] },
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

// All items organized by category
const ITEMS = {
  weapons: {
    sword: {
      name: 'Épée', icon: '🗡️', category: 'oneHand', subtype: 'sword',
      slotKey: 'mainhand', tags: ['Slash', 'Melee'],
      baseDamage: [12, 18], baseDamageType: 'slash',
      possibleImplicits: [
        { id: 'bonusSlashDamage', valueRange: [3, 8], label: '+X dégâts Tranchants' },
        { id: 'critChance', valueRange: [3, 8], label: '+X% chance crit' },
        { id: 'attackSpeed', valueRange: [5, 12], label: '+X% vitesse attaque' },
      ],
      stat: 'Force',
    },
    dagger: {
      name: 'Dague', icon: '🔪', category: 'oneHand', subtype: 'dagger',
      slotKey: 'mainhand', tags: ['Pierce', 'Melee', 'Light'],
      baseDamage: [8, 14], baseDamageType: 'pierce',
      possibleImplicits: [
        { id: 'critChance', valueRange: [5, 12], label: '+X% chance crit' },
        { id: 'critMultiplier', valueRange: [10, 25], label: '+X% multiplicateur crit' },
        { id: 'bleedChance', valueRange: [10, 25], label: '+X% chance Saignement' },
      ],
      stat: 'Dextérité',
    },
    axe: {
      name: 'Hache', icon: '🪓', category: 'oneHand', subtype: 'axe',
      slotKey: 'mainhand', tags: ['Slash', 'Melee', 'Bleed'],
      baseDamage: [14, 20], baseDamageType: 'slash',
      possibleImplicits: [
        { id: 'bleedChance', valueRange: [15, 30], label: '+X% chance Saignement' },
        { id: 'bonusSlashDamage', valueRange: [4, 10], label: '+X dégâts Tranchants' },
        { id: 'executeBonus', valueRange: [15, 30], label: '+X% dégâts sur cibles <30% PV' },
      ],
      stat: 'Force',
    },
    mace: {
      name: 'Masse', icon: '🔨', category: 'oneHand', subtype: 'mace',
      slotKey: 'mainhand', tags: ['Blunt', 'Melee'],
      baseDamage: [13, 19], baseDamageType: 'blunt',
      possibleImplicits: [
        { id: 'bonusBluntDamage', valueRange: [4, 10], label: '+X dégâts Contondants' },
        { id: 'armorPenetration', valueRange: [3, 8], label: '+X pénétration armure' },
        { id: 'stunChance', valueRange: [10, 20], label: '+X% chance Étourdir' },
      ],
      stat: 'Force',
    },
    wand: {
      name: 'Wand', icon: '🪄', category: 'oneHand', subtype: 'wand',
      slotKey: 'mainhand', tags: ['Magic', 'Caster'],
      baseDamage: [8, 12], baseDamageType: 'magic',
      possibleImplicits: [
        { id: 'spellCostReduction', valueRange: [1, 1], label: '-X AP coût des sorts' },
        { id: 'bonusMagicDamage', valueRange: [10, 20], label: '+X% dégâts magiques' },
        { id: 'cooldownReduction', valueRange: [10, 20], label: '-X% cooldowns' },
      ],
      stat: 'Intelligence',
    },
    pistol: {
      name: 'Pistolet', icon: '🔫', category: 'oneHand', subtype: 'pistol',
      slotKey: 'mainhand', tags: ['Pierce', 'Ranged'],
      baseDamage: [10, 16], baseDamageType: 'pierce',
      possibleImplicits: [
        { id: 'rangeBonus', valueRange: [1, 1], label: '+X portée' },
        { id: 'critChance', valueRange: [4, 10], label: '+X% chance crit' },
        { id: 'attackSpeed', valueRange: [8, 15], label: '+X% vitesse attaque' },
      ],
      stat: 'Dextérité',
    },
    greatsword: {
      name: 'Épée 2 mains', icon: '⚔️', category: 'twoHand', subtype: 'greatsword',
      slotKey: 'mainhand', tags: ['Slash', 'Melee', 'Heavy'],
      baseDamage: [22, 32], baseDamageType: 'slash', bonusAffixSlot: true,
      possibleImplicits: [
        { id: 'bonusSlashDamage', valueRange: [6, 14], label: '+X dégâts Tranchants' },
        { id: 'cleave', valueRange: [1, 1], label: 'Frappe 2 cases adjacentes' },
        { id: 'critChance', valueRange: [4, 10], label: '+X% chance crit' },
      ],
      stat: 'Force',
    },
    halberd: {
      name: 'Hallebarde', icon: '🔱', category: 'twoHand', subtype: 'halberd',
      slotKey: 'mainhand', tags: ['Pierce', 'Heavy', 'Reach'],
      baseDamage: [20, 28], baseDamageType: 'pierce', bonusAffixSlot: true,
      possibleImplicits: [
        { id: 'meleeRange', valueRange: [1, 1], label: '+X portée mêlée' },
        { id: 'bonusPierceDamage', valueRange: [5, 12], label: '+X dégâts Perforants' },
        { id: 'stunChance', valueRange: [12, 22], label: '+X% chance Étourdir' },
      ],
      stat: 'Force',
    },
    bow: {
      name: 'Arc', icon: '🏹', category: 'twoHand', subtype: 'bow',
      slotKey: 'mainhand', tags: ['Pierce', 'Ranged'],
      baseDamage: [18, 26], baseDamageType: 'pierce', bonusAffixSlot: true,
      possibleImplicits: [
        { id: 'bonusPierceDamage', valueRange: [5, 12], label: '+X dégâts Perforants' },
        { id: 'rangeBonus', valueRange: [1, 1], label: '+X portée' },
        { id: 'accuracy', valueRange: [15, 30], label: '+X% précision' },
      ],
      stat: 'Dextérité',
    },
    staff: {
      name: 'Bâton', icon: '🪄', category: 'twoHand', subtype: 'staff',
      slotKey: 'mainhand', tags: ['Magic', 'Caster', 'Heavy'],
      baseDamage: [14, 22], baseDamageType: 'magic', bonusAffixSlot: true,
      possibleImplicits: [
        { id: 'bonusMagicDamage', valueRange: [15, 30], label: '+X% dégâts magiques' },
        { id: 'cooldownReduction', valueRange: [12, 25], label: '-X% cooldowns' },
        { id: 'freeSpellPerCombat', valueRange: [1, 1], label: '1 sort gratuit par combat' },
      ],
      stat: 'Intelligence',
    },
  },
  offHand: {
    shield: {
      name: 'Bouclier', icon: '🛡️', category: 'offHand', subtype: 'shield',
      slotKey: 'offhand', tags: ['Defense'],
      possibleImplicits: [
        { id: 'armor', valueRange: [6, 12], label: '+X armure' },
        { id: 'riposteChance', valueRange: [25, 50], label: '+X% riposte mêlée' },
        { id: 'energyShield', valueRange: [8, 15], label: '+X bouclier d\'énergie' },
      ],
    },
    tome: {
      name: 'Tome', icon: '📕', category: 'offHand', subtype: 'tome',
      slotKey: 'offhand', tags: ['Magic', 'Caster'],
      possibleImplicits: [
        { id: 'bonusMagicDamage', valueRange: [10, 18], label: '+X% dégâts magiques' },
        { id: 'cooldownReduction', valueRange: [8, 15], label: '-X% cooldowns' },
        { id: 'spellCostReduction', valueRange: [1, 1], label: '-X AP coût des sorts' },
      ],
    },
    focus: {
      name: 'Focus', icon: '🔮', category: 'offHand', subtype: 'focus',
      slotKey: 'offhand', tags: ['Magic', 'Crit'],
      possibleImplicits: [
        { id: 'spellCritChance', valueRange: [6, 12], label: '+X% crit sorts' },
        { id: 'bonusMagicDamage', valueRange: [12, 20], label: '+X% dégâts magiques' },
        { id: 'elementalPenetration', valueRange: [10, 20], label: '+X% pénétration élémentaire' },
      ],
    },
    quiver: {
      name: 'Carquois', icon: '🎯', category: 'offHand', subtype: 'quiver',
      slotKey: 'offhand', tags: ['Ranged'],
      possibleImplicits: [
        { id: 'rangeBonus', valueRange: [1, 1], label: '+X portée' },
        { id: 'bonusPierceDamage', valueRange: [4, 10], label: '+X dégâts Perforants' },
        { id: 'attackSpeed', valueRange: [10, 18], label: '+X% vitesse attaque' },
      ],
    },
  },
  armor: {
    head: {
      name: 'Casque', icon: '⛑️', subtype: 'head', slotKey: 'head', tags: ['Defense'],
      implicit: { id: 'armor', valueRange: [4, 8], label: '+X armure' },
    },
    chest: {
      name: 'Veste', icon: '🦺', subtype: 'chest', slotKey: 'chest', tags: ['Defense'],
      implicit: { id: 'maxHP', valueRange: [12, 25], label: '+X PV max' },
    },
    legs: {
      name: 'Pantalon', icon: '👖', subtype: 'legs', slotKey: 'legs', tags: ['Defense'],
      implicit: { id: 'armor', valueRange: [3, 7], label: '+X armure' },
    },
    gloves: {
      name: 'Gants', icon: '🧤', subtype: 'gloves', slotKey: 'gloves', tags: ['Offense'],
      implicit: { id: 'critChance', valueRange: [3, 7], label: '+X% chance crit' },
    },
    boots: {
      name: 'Bottes', icon: '👢', subtype: 'boots', slotKey: 'boots', tags: ['Mobility'],
      implicit: { id: 'freeMovement', valueRange: [1, 1], label: '+X case mouvement gratuit/tour' },
    },
  },
  amulets: {
    fireballAmulet: {
      name: 'Amulette de Pyromancie', icon: '📿', subtype: 'amulet', slotKey: 'amulet',
      tags: ['Fire', 'Magic'], grantedSpell: 'Boule de Feu — zone 3×3, applique Brûlé',
    },
    frostNovaAmulet: {
      name: 'Cœur de Givre', icon: '❄️', subtype: 'amulet', slotKey: 'amulet',
      tags: ['Ice', 'Magic'], grantedSpell: 'Nova Glaciale — explosion 3×3, applique Gelé',
    },
    lightningBoltAmulet: {
      name: 'Capteur Tempête', icon: '⚡', subtype: 'amulet', slotKey: 'amulet',
      tags: ['Shock', 'Magic'], grantedSpell: 'Éclair Chain — touche 3 ennemis en chaîne',
    },
    poisonCloudAmulet: {
      name: 'Pendentif Toxique', icon: '☠️', subtype: 'amulet', slotKey: 'amulet',
      tags: ['Poison', 'Magic'], grantedSpell: 'Nuage Toxique — zone 3×3 sur 3 tours',
    },
    healingAmulet: {
      name: 'Larme de Vie', icon: '💚', subtype: 'amulet', slotKey: 'amulet',
      tags: ['Heal'], grantedSpell: 'Vague de Soin — restaure 30% PV max',
    },
    teleportAmulet: {
      name: 'Talisman du Vide', icon: '🌀', subtype: 'amulet', slotKey: 'amulet',
      tags: ['Mobility', 'Shadow'], grantedSpell: 'Téléport — déplace-toi 5 cases',
    },
    oilFlaskAmulet: {
      name: 'Fiole d\'Huile', icon: '🛢️', subtype: 'amulet', slotKey: 'amulet',
      tags: ['Fire'], grantedSpell: 'Applique Huilé en zone 3×3',
    },
    rageAmulet: {
      name: 'Cri de Berserker', icon: '🔱', subtype: 'amulet', slotKey: 'amulet',
      tags: ['Rage', 'Buff'], grantedSpell: 'Gain Rage 3 tours',
    },
  },
  rings: {
    ringOfBlood: {
      name: 'Anneau de Sang', icon: '💍', subtype: 'ring', slotKey: 'ring', tags: ['Bleed'],
      uniquePassive: 'Tes attaques mêlée appliquent toujours 1 stack de Saignement.',
    },
    ringOfEmbers: {
      name: 'Anneau des Braises', icon: '🔥', subtype: 'ring', slotKey: 'ring', tags: ['Fire'],
      uniquePassive: 'Tes Brûlures durent +50% plus longtemps.',
    },
    ringOfFrost: {
      name: 'Anneau du Givre', icon: '❄️', subtype: 'ring', slotKey: 'ring', tags: ['Ice'],
      uniquePassive: 'Tes critiques appliquent Glacé.',
    },
    ringOfStorms: {
      name: 'Anneau des Tempêtes', icon: '⚡', subtype: 'ring', slotKey: 'ring', tags: ['Shock'],
      uniquePassive: 'Tes attaques basiques ont 15% chance d\'Électrocuter.',
    },
    ringOfLifesteal: {
      name: 'Anneau Vampirique', icon: '💉', subtype: 'ring', slotKey: 'ring', tags: ['Lifesteal'],
      uniquePassive: 'Tu récupères 15% des dégâts mêlée infligés en PV.',
    },
    ringOfMomentum: {
      name: 'Anneau du Souffle', icon: '💨', subtype: 'ring', slotKey: 'ring', tags: ['Mobility'],
      uniquePassive: 'Te déplacer de 3+ cases octroie Hâte au tour suivant.',
    },
    ringOfFocus: {
      name: 'Anneau de Concentration', icon: '🎯', subtype: 'ring', slotKey: 'ring', tags: ['Crit'],
      uniquePassive: '+10% chance crit pour chaque tour passé sans bouger (max +30%).',
    },
    ringOfThorns: {
      name: 'Anneau d\'Épines', icon: '🌹', subtype: 'ring', slotKey: 'ring', tags: ['Defense'],
      uniquePassive: 'Quand tu es touché en mêlée, l\'attaquant subit 8 dégâts physiques.',
    },
    ringOfEcho: {
      name: 'Anneau de l\'Écho', icon: '🔁', subtype: 'ring', slotKey: 'ring', tags: ['Caster', 'Echo'],
      uniquePassive: 'Tes sorts ont 15% chance de se relancer gratuitement.',
    },
    ringOfExecute: {
      name: 'Anneau du Bourreau', icon: '⚰️', subtype: 'ring', slotKey: 'ring', tags: ['Execute'],
      uniquePassive: '+30% dégâts contre cibles <30% PV.',
    },
  },
};

const AFFIXES = {
  prefixes: {
    flaming: { id: 'flaming', name: 'Enflammée', type: 'prefix', stat: 'bonusFireDamage', label: '+X dégâts Feu', valueRange: [3, 8], tags: ['Fire'], validSlots: ['mainhand', 'ring', 'amulet', 'gloves'], biome: 'inferno' },
    freezing: { id: 'freezing', name: 'Glaciale', type: 'prefix', stat: 'bonusIceDamage', label: '+X dégâts Glace', valueRange: [3, 8], tags: ['Ice'], validSlots: ['mainhand', 'ring', 'amulet', 'gloves'], biome: 'cryo' },
    venomous: { id: 'venomous', name: 'Venimeuse', type: 'prefix', stat: 'bonusPoisonDamage', label: '+X dégâts Poison', valueRange: [3, 7], tags: ['Poison'], validSlots: ['mainhand', 'ring', 'amulet', 'gloves'], biome: 'toxic' },
    shocking: { id: 'shocking', name: 'Foudroyante', type: 'prefix', stat: 'bonusShockDamage', label: '+X dégâts Foudre', valueRange: [3, 8], tags: ['Shock'], validSlots: ['mainhand', 'ring', 'amulet', 'gloves'], biome: 'voidnet' },
    bloody: { id: 'bloody', name: 'Sanglante', type: 'prefix', stat: 'bleedChance', label: '+X% chance Saignement', valueRange: [8, 18], tags: ['Bleed'], validSlots: ['mainhand'], biome: 'crimson' },
    sharp: { id: 'sharp', name: 'Tranchante', type: 'prefix', stat: 'bonusSlashDamage', label: '+X dégâts Tranchants', valueRange: [3, 7], tags: ['Slash'], validSlots: ['mainhand', 'gloves'] },
    piercing: { id: 'piercing', name: 'Perçante', type: 'prefix', stat: 'bonusPierceDamage', label: '+X dégâts Perforants', valueRange: [3, 7], tags: ['Pierce'], validSlots: ['mainhand', 'gloves'] },
    crushing: { id: 'crushing', name: 'Écrasante', type: 'prefix', stat: 'bonusBluntDamage', label: '+X dégâts Contondants', valueRange: [3, 7], tags: ['Blunt'], validSlots: ['mainhand', 'gloves'] },
    vicious: { id: 'vicious', name: 'Vicieuse', type: 'prefix', stat: 'critChance', label: '+X% chance crit', valueRange: [3, 8], tags: ['Crit'], validSlots: ['mainhand', 'offhand', 'gloves', 'ring', 'amulet'] },
    deadly: { id: 'deadly', name: 'Mortelle', type: 'prefix', stat: 'critMultiplier', label: '+X% multiplicateur crit', valueRange: [10, 25], tags: ['Crit'], validSlots: ['mainhand', 'offhand', 'gloves', 'ring', 'amulet'] },
    swift: { id: 'swift', name: 'Rapide', type: 'prefix', stat: 'bonusAP', label: '+X AP par tour', valueRange: [1, 1], tags: ['Mobility'], validSlots: ['boots', 'amulet', 'ring'] },
    reinforced: { id: 'reinforced', name: 'Renforcée', type: 'prefix', stat: 'armor', label: '+X armure', valueRange: [3, 8], tags: ['Defense'], validSlots: ['head', 'chest', 'legs', 'gloves', 'boots', 'offhand'] },
    vital: { id: 'vital', name: 'Vitale', type: 'prefix', stat: 'maxHP', label: '+X PV max', valueRange: [8, 18], tags: ['Defense'], validSlots: ['chest', 'legs', 'amulet', 'ring'] },
    regenerating: { id: 'regenerating', name: 'Régénérante', type: 'prefix', stat: 'hpRegen', label: '+X PV/tour', valueRange: [1, 3], tags: ['Heal'], validSlots: ['chest', 'amulet', 'ring'] },
    lifestealing: { id: 'lifestealing', name: 'Vampirique', type: 'prefix', stat: 'lifesteal', label: '+X% lifesteal', valueRange: [3, 8], tags: ['Lifesteal'], validSlots: ['mainhand', 'ring', 'amulet'] },
    magicFinder: { id: 'magicFinder', name: 'du Découvreur', type: 'prefix', stat: 'magicFind', label: '+X% Magic Find', valueRange: [5, 15], tags: ['Loot'], validSlots: ['head', 'chest', 'boots', 'ring', 'amulet'] },
  },
  suffixes: {
    ofTheWind: { id: 'ofTheWind', name: 'du Vent', type: 'suffix', stat: 'freeMovement', label: '+X case mouvement gratuit', valueRange: [1, 2], tags: ['Mobility'], validSlots: ['boots', 'amulet'] },
    ofVigor: { id: 'ofVigor', name: 'de Vigueur', type: 'suffix', stat: 'maxHP', label: '+X PV max', valueRange: [10, 20], tags: ['Defense'], validSlots: ['chest', 'amulet', 'ring'] },
    ofShadow: { id: 'ofShadow', name: 'des Ombres', type: 'suffix', stat: 'dodgeChance', label: '+X% esquive', valueRange: [3, 10], tags: ['Defense', 'Shadow'], validSlots: ['boots', 'gloves', 'ring'] },
    ofFortitude: { id: 'ofFortitude', name: 'de Robustesse', type: 'suffix', stat: 'armor', label: '+X armure', valueRange: [3, 7], tags: ['Defense'], validSlots: ['head', 'chest', 'legs', 'gloves', 'boots'] },
    ofFireResist: { id: 'ofFireResist', name: 'Pyro-Résistante', type: 'suffix', stat: 'fireResist', label: '+X% résistance Feu', valueRange: [10, 25], tags: ['Defense'], validSlots: ['head', 'chest', 'legs', 'gloves', 'boots', 'ring', 'amulet'] },
    ofFrostResist: { id: 'ofFrostResist', name: 'Cryo-Résistante', type: 'suffix', stat: 'iceResist', label: '+X% résistance Glace', valueRange: [10, 25], tags: ['Defense'], validSlots: ['head', 'chest', 'legs', 'gloves', 'boots', 'ring', 'amulet'] },
    ofShockResist: { id: 'ofShockResist', name: 'Anti-Foudre', type: 'suffix', stat: 'shockResist', label: '+X% résistance Foudre', valueRange: [10, 25], tags: ['Defense'], validSlots: ['head', 'chest', 'legs', 'gloves', 'boots', 'ring', 'amulet'] },
    ofPenetration: { id: 'ofPenetration', name: 'Perforante', type: 'suffix', stat: 'armorPenetration', label: '+X pénétration armure', valueRange: [2, 6], tags: ['Offense'], validSlots: ['mainhand', 'gloves', 'ring'] },
    ofTheBeast: { id: 'ofTheBeast', name: 'de la Bête', type: 'suffix', stat: 'rageOnHit', label: '+X% chance Rage en attaquant', valueRange: [5, 15], tags: ['Rage', 'Buff'], validSlots: ['mainhand', 'amulet'] },
    ofExecution: { id: 'ofExecution', name: 'd\'Exécution', type: 'suffix', stat: 'executeBonus', label: '+X% dégâts sur cibles <30% PV', valueRange: [10, 25], tags: ['Execute'], validSlots: ['mainhand', 'ring', 'amulet'] },
    ofConcentration: { id: 'ofConcentration', name: 'de Concentration', type: 'suffix', stat: 'cooldownReduction', label: '-X% cooldowns', valueRange: [5, 12], tags: ['Caster'], validSlots: ['amulet', 'ring', 'offhand'] },
    ofTheStudent: { id: 'ofTheStudent', name: 'de l\'Érudit', type: 'suffix', stat: 'spellCritChance', label: '+X% crit sorts', valueRange: [4, 10], tags: ['Caster', 'Crit'], validSlots: ['amulet', 'ring', 'offhand'] },
    ofResonance: { id: 'ofResonance', name: 'de Résonance', type: 'suffix', stat: 'tagResonance', label: '+X% dégâts par item au même tag équipé', valueRange: [3, 7], tags: ['Resonance'], validSlots: ['amulet', 'ring'] },
  },
};

const CATEGORY_LABELS = {
  weapons: { label: 'Armes', icon: '⚔️', color: '#ef4444' },
  offHand: { label: 'Off-hand', icon: '🛡️', color: '#3b82f6' },
  armor: { label: 'Armure', icon: '🦺', color: '#10b981' },
  amulets: { label: 'Amulettes', icon: '📿', color: '#8b5cf6' },
  rings: { label: 'Bagues', icon: '💍', color: '#ec4899' },
};

// ============ HELPERS ============

function computeRange(baseRange, tier, ilvl) {
  const tMult = TIER_RANGE_MULT[tier];
  const iMult = ILVL_MULT[ilvl];
  const min = baseRange[0] * tMult[0] * iMult;
  const max = baseRange[1] * tMult[1] * iMult;
  return [Math.round(min * 10) / 10, Math.round(max * 10) / 10];
}

function getValidAffixesForItem(item) {
  const allPrefixes = Object.entries(AFFIXES.prefixes).map(([id, a]) => ({ ...a, id, type: 'prefix' }));
  const allSuffixes = Object.entries(AFFIXES.suffixes).map(([id, a]) => ({ ...a, id, type: 'suffix' }));
  const itemSlot = item.slotKey;

  const prefixes = allPrefixes.filter(a => !a.validSlots || a.validSlots.includes(itemSlot));
  const suffixes = allSuffixes.filter(a => !a.validSlots || a.validSlots.includes(itemSlot));

  return { prefixes, suffixes };
}

// ============ COMPONENTS ============

function ItemCard({ item, itemKey, isSelected, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 p-2 rounded-lg border transition-all text-left w-full ${
        isSelected
          ? 'bg-pink-500/20 border-pink-500'
          : 'bg-slate-800/50 border-slate-700 hover:border-slate-500 hover:bg-slate-800'
      }`}
    >
      <span className="text-2xl">{item.icon}</span>
      <div className="flex-1 min-w-0">
        <div className="font-bold text-sm truncate">{item.name}</div>
        <div className="text-[10px] text-slate-400 uppercase tracking-wider">
          {item.subtype} {item.category && `· ${item.category}`}
        </div>
      </div>
      {isSelected && <ChevronRight size={14} className="text-pink-400" />}
    </button>
  );
}

function StatBar({ tier, value, max }) {
  const tierColor = TIER_CONFIG[tier].color;
  const widthPercent = max ? (value / max) * 100 : 0;
  return (
    <div className="flex items-center gap-1">
      <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full transition-all"
          style={{ width: `${widthPercent}%`, background: tierColor }}
        />
      </div>
    </div>
  );
}

function AffixRangeRow({ affix, ilvl, selectedTier }) {
  const range = computeRange(affix.valueRange, selectedTier, ilvl);
  const baseRange = affix.valueRange;
  const ilvlMult = ILVL_MULT[ilvl];
  const tierMult = TIER_RANGE_MULT[selectedTier];

  return (
    <div className="bg-slate-800/40 rounded p-2 hover:bg-slate-800/70 transition">
      <div className="flex items-start justify-between gap-2 mb-1">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[9px] uppercase tracking-wider text-slate-500">
              {affix.type === 'prefix' ? 'PRÉFIXE' : 'SUFFIXE'}
            </span>
            <span className="text-xs font-bold text-pink-300">{affix.name}</span>
          </div>
          <div className="text-xs text-slate-200 mt-0.5">
            {affix.label.replace('X', `${range[0]}–${range[1]}`)}
          </div>
        </div>
        <div className="text-right">
          <div
            className="text-base font-bold font-mono"
            style={{ color: TIER_CONFIG[selectedTier].color }}
          >
            {range[0]} – {range[1]}
          </div>
          <div className="text-[9px] text-slate-500">
            base: {baseRange[0]}–{baseRange[1]}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-1 mt-1.5">
        {affix.tags?.map(t => (
          <span key={t} className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-300 uppercase tracking-wider">
            {t}
          </span>
        ))}
        {affix.biome && (
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 uppercase tracking-wider">
            biome: {affix.biome}
          </span>
        )}
      </div>
    </div>
  );
}

function ImplicitRow({ implicit, ilvl }) {
  const iMult = ILVL_MULT[ilvl];
  const min = Math.round(implicit.valueRange[0] * iMult * 10) / 10;
  const max = Math.round(implicit.valueRange[1] * iMult * 10) / 10;
  return (
    <div className="bg-cyan-500/5 border border-cyan-500/30 rounded p-2">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="text-[9px] uppercase tracking-wider text-cyan-400 mb-0.5">
            IMPLICIT GARANTI
          </div>
          <div className="text-xs text-cyan-100">
            {implicit.label.replace('X', `${min}–${max}`)}
          </div>
        </div>
        <div className="text-right">
          <div className="text-base font-bold font-mono text-cyan-300">
            {min} – {max}
          </div>
          <div className="text-[9px] text-slate-500">
            base: {implicit.valueRange[0]}–{implicit.valueRange[1]}
          </div>
        </div>
      </div>
    </div>
  );
}

function ImplicitTable({ baseRange, label }) {
  return (
    <div className="bg-slate-800/40 rounded overflow-hidden">
      <div className="bg-slate-800 px-2 py-1.5 text-[10px] uppercase tracking-wider text-slate-400 border-b border-slate-700">
        {label}
      </div>
      <table className="w-full text-xs">
        <thead className="bg-slate-800/50">
          <tr className="text-[9px] text-slate-500 uppercase tracking-wider">
            <th className="text-left px-2 py-1">iLvl</th>
            <th className="text-right px-2 py-1">Min</th>
            <th className="text-right px-2 py-1">Max</th>
            <th className="text-right px-2 py-1">Multi</th>
          </tr>
        </thead>
        <tbody>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(lvl => {
            const mult = ILVL_MULT[lvl];
            const min = Math.round(baseRange[0] * mult * 10) / 10;
            const max = Math.round(baseRange[1] * mult * 10) / 10;
            return (
              <tr key={lvl} className={`border-t border-slate-800 ${lvl === 5 ? 'bg-cyan-500/10' : ''}`}>
                <td className="px-2 py-1 font-mono text-slate-400">{lvl}</td>
                <td className="px-2 py-1 text-right font-mono text-slate-300">{min}</td>
                <td className="px-2 py-1 text-right font-mono text-slate-300">{max}</td>
                <td className="px-2 py-1 text-right text-[10px] text-slate-500 font-mono">×{mult}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function AffixIlvlTable({ affix, selectedTier }) {
  const tierMult = TIER_RANGE_MULT[selectedTier];
  return (
    <div className="bg-slate-900/60 rounded overflow-hidden border border-slate-700">
      <div className="bg-slate-800 px-3 py-2 flex items-center justify-between">
        <div>
          <div className="text-[9px] uppercase tracking-wider text-slate-400">
            {affix.type === 'prefix' ? 'PRÉFIXE' : 'SUFFIXE'}
          </div>
          <div className="text-sm font-bold text-pink-300">{affix.name}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">{affix.label}</div>
        </div>
        <div className="text-right">
          <div className="text-[9px] uppercase text-slate-500">Tier</div>
          <div className="text-xs font-bold" style={{ color: TIER_CONFIG[selectedTier].color }}>
            {TIER_CONFIG[selectedTier].label}
          </div>
          <div className="text-[9px] text-slate-500 font-mono">
            ×{tierMult[0]}–{tierMult[1]}
          </div>
        </div>
      </div>
      <table className="w-full text-xs">
        <thead className="bg-slate-800/50">
          <tr className="text-[9px] text-slate-500 uppercase tracking-wider">
            <th className="text-left px-2 py-1">iLvl</th>
            <th className="text-right px-2 py-1">Min</th>
            <th className="text-right px-2 py-1">Max</th>
            <th className="text-right px-2 py-1">Spread</th>
          </tr>
        </thead>
        <tbody>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(lvl => {
            const range = computeRange(affix.valueRange, selectedTier, lvl);
            const spread = Math.round((range[1] - range[0]) * 10) / 10;
            return (
              <tr key={lvl} className={`border-t border-slate-800 ${lvl === 5 ? 'bg-cyan-500/5' : ''}`}>
                <td className="px-2 py-1 font-mono text-slate-400">{lvl}</td>
                <td className="px-2 py-1 text-right font-mono text-slate-300">{range[0]}</td>
                <td className="px-2 py-1 text-right font-mono" style={{ color: TIER_CONFIG[selectedTier].color }}>{range[1]}</td>
                <td className="px-2 py-1 text-right font-mono text-[10px] text-slate-500">{spread}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function ItemExplorer() {
  const [selectedCategory, setSelectedCategory] = useState('weapons');
  const [selectedItemKey, setSelectedItemKey] = useState('sword');
  const [selectedTier, setSelectedTier] = useState('rare');
  const [selectedIlvl, setSelectedIlvl] = useState(5);
  const [selectedAffixId, setSelectedAffixId] = useState(null);
  const [filterType, setFilterType] = useState('all'); // 'all', 'prefix', 'suffix'
  const [searchQuery, setSearchQuery] = useState('');

  const selectedItem = ITEMS[selectedCategory]?.[selectedItemKey];

  const validAffixes = useMemo(() => {
    if (!selectedItem) return { prefixes: [], suffixes: [] };
    return getValidAffixesForItem(selectedItem);
  }, [selectedItem]);

  const filteredAffixes = useMemo(() => {
    let all = [
      ...(filterType === 'suffix' ? [] : validAffixes.prefixes),
      ...(filterType === 'prefix' ? [] : validAffixes.suffixes),
    ];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      all = all.filter(a =>
        a.name.toLowerCase().includes(q) ||
        a.label.toLowerCase().includes(q) ||
        a.tags?.some(t => t.toLowerCase().includes(q)) ||
        a.stat.toLowerCase().includes(q)
      );
    }
    return all;
  }, [validAffixes, filterType, searchQuery]);

  const selectedAffix = useMemo(() => {
    if (!selectedAffixId) return null;
    return [...validAffixes.prefixes, ...validAffixes.suffixes].find(a => a.id === selectedAffixId);
  }, [selectedAffixId, validAffixes]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 font-mono">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="mb-4 pb-3 border-b border-slate-800">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Search className="text-pink-500" size={28} />
            <span className="bg-gradient-to-r from-pink-500 to-cyan-400 bg-clip-text text-transparent">
              ITEM EXPLORER
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Sélectionne un item pour voir ses affixes possibles, leurs ranges et leur scaling par iLvl
          </p>
        </div>

        {/* CATEGORY TABS */}
        <div className="flex flex-wrap gap-2 mb-4">
          {Object.entries(CATEGORY_LABELS).map(([key, cat]) => (
            <button
              key={key}
              onClick={() => {
                setSelectedCategory(key);
                setSelectedItemKey(Object.keys(ITEMS[key])[0]);
                setSelectedAffixId(null);
              }}
              className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition flex items-center gap-1.5 ${
                selectedCategory === key
                  ? 'bg-pink-500 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              <span>{cat.icon}</span>
              {cat.label}
              <span className="text-[9px] opacity-60">
                ({Object.keys(ITEMS[key]).length})
              </span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* LEFT: ITEM LIST */}
          <div className="lg:col-span-3 space-y-2">
            <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-2 px-1">
              Items disponibles
            </div>
            {Object.entries(ITEMS[selectedCategory]).map(([key, item]) => (
              <ItemCard
                key={key}
                item={item}
                itemKey={key}
                isSelected={selectedItemKey === key}
                onClick={() => {
                  setSelectedItemKey(key);
                  setSelectedAffixId(null);
                }}
              />
            ))}
          </div>

          {/* CENTER: ITEM DETAILS */}
          <div className="lg:col-span-5 space-y-3">
            {selectedItem && (
              <>
                {/* Item card */}
                <div className="bg-slate-900 border border-pink-500/40 rounded-lg p-3">
                  <div className="flex items-start gap-3">
                    <span className="text-4xl">{selectedItem.icon}</span>
                    <div className="flex-1">
                      <div className="text-lg font-bold text-pink-300">{selectedItem.name}</div>
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">
                        {selectedItem.subtype} · slot: {selectedItem.slotKey}
                        {selectedItem.category && ` · ${selectedItem.category}`}
                        {selectedItem.bonusAffixSlot && ' · +1 AFFIX SLOT'}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {selectedItem.tags?.map(t => (
                          <span key={t} className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-300 uppercase tracking-wider">
                            {t}
                          </span>
                        ))}
                      </div>
                      {selectedItem.stat && (
                        <div className="text-[10px] text-slate-500 mt-1">
                          Stat principale: <span className="text-amber-300">{selectedItem.stat}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedItem.baseDamage && (
                    <div className="mt-2 pt-2 border-t border-slate-800 text-xs">
                      ⚔ Dégâts de base : <span className="font-mono text-slate-200">{selectedItem.baseDamage[0]}–{selectedItem.baseDamage[1]}</span>
                      {' '}<span className="text-slate-500">({selectedItem.baseDamageType})</span>
                    </div>
                  )}

                  {selectedItem.grantedSpell && (
                    <div className="mt-2 pt-2 border-t border-slate-800 text-xs italic px-2 py-1 rounded bg-indigo-500/10 border-l-2 border-indigo-500 text-indigo-200">
                      🔮 Sort accordé : {selectedItem.grantedSpell}
                    </div>
                  )}

                  {selectedItem.uniquePassive && (
                    <div className="mt-2 pt-2 border-t border-slate-800 text-xs italic px-2 py-1 rounded bg-purple-500/10 border-l-2 border-purple-500 text-purple-200">
                      ⚡ Passif unique : {selectedItem.uniquePassive}
                    </div>
                  )}
                </div>

                {/* Implicits possibles (armes) */}
                {selectedItem.possibleImplicits && (
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-cyan-400 mb-2 flex items-center gap-1.5">
                      <Info size={11} />
                      Implicits possibles ({selectedItem.possibleImplicits.length}) — 1 rollé au drop
                    </div>
                    <div className="space-y-2">
                      {selectedItem.possibleImplicits.map((impl, i) => (
                        <ImplicitRow key={i} implicit={impl} ilvl={selectedIlvl} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Implicit garanti (armures) */}
                {selectedItem.implicit && (
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-cyan-400 mb-2 flex items-center gap-1.5">
                      <Info size={11} />
                      Implicit garanti
                    </div>
                    <ImplicitRow implicit={selectedItem.implicit} ilvl={selectedIlvl} />
                  </div>
                )}

                {/* Tier & iLvl selector */}
                <div className="bg-slate-900 border border-slate-700 rounded p-3">
                  <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-2">
                    Configuration de la simulation
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-[9px] uppercase tracking-wider text-slate-400 mb-1">
                        Tier de l'item
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        {['magic', 'rare', 'epic', 'legendary', 'set'].map(t => (
                          <button
                            key={t}
                            onClick={() => setSelectedTier(t)}
                            className={`px-1.5 py-1 rounded text-[10px] uppercase font-bold tracking-wider transition ${
                              selectedTier === t ? 'text-slate-900' : 'text-slate-400 bg-slate-800 hover:bg-slate-700'
                            }`}
                            style={{
                              background: selectedTier === t ? TIER_CONFIG[t].color : undefined,
                            }}
                          >
                            {TIER_CONFIG[t].label}
                          </button>
                        ))}
                      </div>
                      <div className="text-[9px] text-slate-500 mt-1 font-mono">
                        Range mult: ×{TIER_RANGE_MULT[selectedTier][0]}–{TIER_RANGE_MULT[selectedTier][1]}
                      </div>
                    </div>
                    <div>
                      <div className="text-[9px] uppercase tracking-wider text-slate-400 mb-1">
                        iLvl: <span className="text-cyan-400 font-bold">{selectedIlvl}</span>
                        <span className="text-slate-500 ml-2 font-mono">×{ILVL_MULT[selectedIlvl]}</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={selectedIlvl}
                        onChange={e => setSelectedIlvl(parseInt(e.target.value))}
                        className="w-full accent-cyan-500"
                      />
                      <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                        <span>1</span><span>5</span><span>10</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Affixes search & filter */}
                <div className="bg-slate-900 border border-slate-700 rounded p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-[10px] uppercase tracking-wider text-slate-400">
                      Affixes possibles ({filteredAffixes.length} / {validAffixes.prefixes.length + validAffixes.suffixes.length})
                    </div>
                    <div className="flex gap-1">
                      {['all', 'prefix', 'suffix'].map(f => (
                        <button
                          key={f}
                          onClick={() => setFilterType(f)}
                          className={`px-2 py-0.5 rounded text-[9px] uppercase tracking-wider transition ${
                            filterType === f ? 'bg-pink-500 text-white' : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {f === 'all' ? 'Tous' : f === 'prefix' ? 'Préfixes' : 'Suffixes'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="relative">
                    <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Rechercher (nom, stat, tag)..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded pl-7 pr-2 py-1 text-xs focus:border-pink-500 outline-none"
                    />
                  </div>

                  <div className="mt-2 max-h-96 overflow-y-auto space-y-1.5 pr-1">
                    {filteredAffixes.map((a, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedAffixId(a.id)}
                        className={`w-full text-left ${selectedAffixId === a.id ? 'ring-1 ring-pink-500' : ''}`}
                      >
                        <AffixRangeRow affix={a} ilvl={selectedIlvl} selectedTier={selectedTier} />
                      </button>
                    ))}
                    {filteredAffixes.length === 0 && (
                      <div className="text-xs text-slate-500 italic text-center py-4">
                        Aucun affixe ne correspond à ces critères
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* RIGHT: AFFIX DETAIL with iLvl scaling */}
          <div className="lg:col-span-4 space-y-3">
            <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-2 px-1">
              Scaling par iLvl
            </div>

            {selectedItem?.implicit && (
              <div className="space-y-1">
                <div className="text-[9px] uppercase tracking-wider text-cyan-400">
                  IMPLICIT
                </div>
                <ImplicitTable
                  baseRange={selectedItem.implicit.valueRange}
                  label={selectedItem.implicit.label}
                />
              </div>
            )}

            {selectedAffix ? (
              <div className="space-y-2">
                <div className="text-[9px] uppercase tracking-wider text-pink-400">
                  AFFIXE SÉLECTIONNÉ
                </div>
                <AffixIlvlTable affix={selectedAffix} selectedTier={selectedTier} />

                <div className="bg-slate-900 border border-slate-700 rounded p-2 text-[10px] space-y-1">
                  <div className="text-slate-400 uppercase tracking-wider">Détails techniques</div>
                  <div><span className="text-slate-500">Stat ID :</span> <span className="text-cyan-300 font-mono">{selectedAffix.stat}</span></div>
                  <div><span className="text-slate-500">Slots valides :</span> <span className="text-slate-300">{selectedAffix.validSlots?.join(', ') || 'tous'}</span></div>
                  <div className="flex items-center gap-1 flex-wrap">
                    <span className="text-slate-500">Tags :</span>
                    {selectedAffix.tags?.map(t => (
                      <span key={t} className="px-1 py-0.5 rounded bg-cyan-500/15 text-cyan-300 text-[9px]">
                        {t}
                      </span>
                    ))}
                  </div>
                  {selectedAffix.biome && (
                    <div><span className="text-slate-500">Biome favorisé :</span> <span className="text-amber-300">{selectedAffix.biome}</span></div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-slate-900/50 border border-slate-800 border-dashed rounded p-4 text-center">
                <Filter size={20} className="mx-auto mb-2 text-slate-600" />
                <div className="text-[11px] text-slate-500">
                  Clique sur un affixe à gauche pour voir son scaling complet
                </div>
              </div>
            )}

            {selectedItem?.possibleImplicits && (
              <div className="space-y-2">
                <div className="text-[9px] uppercase tracking-wider text-cyan-400">
                  TOUS LES IMPLICITS POSSIBLES
                </div>
                {selectedItem.possibleImplicits.map((impl, i) => (
                  <ImplicitTable
                    key={i}
                    baseRange={impl.valueRange}
                    label={impl.label}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
