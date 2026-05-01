// src/js/entities/player-stats.js
// Source de vérité unique des stats de base du joueur.
// Le stuff vient APPLIQUER des modifiers à ces bases (additifs ou multiplicatifs).
//
// 3 catégories :
//   - flat   : ajouté tel quel (ex: +5 armure → armor + 5)
//   - pct    : multiplicatif % (ex: +20% damage → damage *= 1.2)
//   - replace: remplace la valeur (rare, pour cas particuliers)

// =============================================================================
// STATS DE BASE DU JOUEUR (sans aucun stuff)
// =============================================================================
// Ces valeurs représentent le joueur "à poil" niveau 1.
// Modifier ici si on veut nerf/buff la base globalement.

export const PLAYER_BASE_STATS = {
  // Vitalité
  baseMaxHp: 50,        // PV max au niveau 1
  hpPerLevel: 7,        // PV gagnés par niveau

  // Action Points
  baseMaxAp: 6,         // AP par tour
  bonusAp: 1,           // AP bonus de départ

  // Combat - dégâts
  baseDamage: [4, 7],   // dégâts au poing nu (range)
  damageType: 'blunt',  // type de dégâts par défaut (sans arme)

  // Combat - défense
  baseArmor: 0,         // armure de base (le stuff l'ajoute)
  baseDodgeChance: 5,   // % esquive de base
  baseBlockChance: 0,   // % blocage de base (avec bouclier)

  // Combat - critique
  baseCritChance: 5,    // % crit
  baseCritMultiplier: 50, // +50% damage on crit (donc x1.5)

  // Combat - mobilité
  baseMoveSpeed: 4,     // cases par tour
  baseRange: 1,         // portée d'attaque par défaut (CaC)

  // Initiative & vitesse
  baseInitiative: 18,

  // Régénération
  baseHpRegen: 0,

  // Pénétration / lifesteal
  baseLifesteal: 0,
  baseArmorPen: 0,

  // Dégâts élémentaires bonus (additifs)
  baseBonusFire: 0,
  baseBonusIce: 0,
  baseBonusShock: 0,
  baseBonusPoison: 0,

  // Résistances (en %)
  baseFireResist: 0,
  baseIceResist: 0,
  baseShockResist: 0,
  basePoisonResist: 0,

  // Réduction CC
  baseCcReduction: 0,
};

// =============================================================================
// PRESETS DE STUFF
// =============================================================================
// Un preset est une liste de modifiers qui s'appliquent au-dessus des bases.
//
// Format d'un modifier :
//   { stat: 'maxHp',    op: 'flat', value: 30 }     →  maxHp += 30
//   { stat: 'damage',   op: 'pct',  value: 25 }     →  damage *= 1.25
//   { stat: 'armor',    op: 'flat', value: 12 }     →  armor += 12
//
// La fonction applyStuff plus bas applique ces modifiers sur PLAYER_BASE_STATS.

export const STUFF_PRESETS = {

  naked: {
    label: 'Sans stuff',
    description: 'Joueur nu. Stats de base uniquement.',
    modifiers: [],
  },

  poor: {
    label: 'Faible (Common)',
    description: 'Équipement de Tier 1. Petits bonus partout.',
    modifiers: [
      { stat: 'maxHp', op: 'flat', value: 10 },
      { stat: 'damage', op: 'pct', value: 15 },
      { stat: 'armor', op: 'flat', value: 4 },
      { stat: 'critChance', op: 'flat', value: 2 },
    ],
  },

  balanced: {
    label: 'Équilibré (Rare)',
    description: 'Équipement de Tier 3. Build polyvalent.',
    modifiers: [
      { stat: 'maxHp', op: 'flat', value: 25 },
      { stat: 'damage', op: 'pct', value: 40 },
      { stat: 'armor', op: 'flat', value: 12 },
      { stat: 'critChance', op: 'flat', value: 6 },
      { stat: 'critMultiplier', op: 'flat', value: 15 },
      { stat: 'dodgeChance', op: 'flat', value: 4 },
      { stat: 'fireResist', op: 'flat', value: 10 },
      { stat: 'iceResist', op: 'flat', value: 10 },
    ],
  },

  strong: {
    label: 'Fort (Epic)',
    description: 'Équipement de Tier 4. Optimisé.',
    modifiers: [
      { stat: 'maxHp', op: 'flat', value: 45 },
      { stat: 'damage', op: 'pct', value: 75 },
      { stat: 'armor', op: 'flat', value: 22 },
      { stat: 'critChance', op: 'flat', value: 10 },
      { stat: 'critMultiplier', op: 'flat', value: 30 },
      { stat: 'dodgeChance', op: 'flat', value: 8 },
      { stat: 'lifesteal', op: 'flat', value: 4 },
      { stat: 'armorPen', op: 'flat', value: 5 },
      { stat: 'fireResist', op: 'flat', value: 20 },
      { stat: 'iceResist', op: 'flat', value: 20 },
      { stat: 'hpRegen', op: 'flat', value: 1 },
    ],
  },

  op: {
    label: 'OP (Legendary)',
    description: 'Stuff de fin de jeu. Tier 5+.',
    modifiers: [
      { stat: 'maxHp', op: 'flat', value: 80 },
      { stat: 'damage', op: 'pct', value: 130 },
      { stat: 'armor', op: 'flat', value: 35 },
      { stat: 'critChance', op: 'flat', value: 18 },
      { stat: 'critMultiplier', op: 'flat', value: 60 },
      { stat: 'dodgeChance', op: 'flat', value: 12 },
      { stat: 'lifesteal', op: 'flat', value: 8 },
      { stat: 'armorPen', op: 'flat', value: 10 },
      { stat: 'bonusFire', op: 'flat', value: 8 },
      { stat: 'fireResist', op: 'flat', value: 35 },
      { stat: 'iceResist', op: 'flat', value: 35 },
      { stat: 'shockResist', op: 'flat', value: 25 },
      { stat: 'poisonResist', op: 'flat', value: 25 },
      { stat: 'hpRegen', op: 'flat', value: 3 },
      { stat: 'ccReduction', op: 'flat', value: 20 },
      { stat: 'bonusAp', op: 'flat', value: 1 },
    ],
  },
};

// =============================================================================
// APPLICATION DES MODIFIERS
// =============================================================================
// applyStuff(level, presetId, customModifiers?) → stats finales du joueur

const STAT_TO_BASE = {
  maxHp:           'baseMaxHp',
  maxAp:           'baseMaxAp',
  bonusAp:         'bonusAp',
  damage:          'baseDamage',          // spécial : range [min,max]
  armor:           'baseArmor',
  dodgeChance:     'baseDodgeChance',
  blockChance:     'baseBlockChance',
  critChance:      'baseCritChance',
  critMultiplier:  'baseCritMultiplier',
  moveSpeed:       'baseMoveSpeed',
  range:           'baseRange',
  initiative:      'baseInitiative',
  hpRegen:         'baseHpRegen',
  lifesteal:       'baseLifesteal',
  armorPen:        'baseArmorPen',
  bonusFire:       'baseBonusFire',
  bonusIce:        'baseBonusIce',
  bonusShock:      'baseBonusShock',
  bonusPoison:     'baseBonusPoison',
  fireResist:      'baseFireResist',
  iceResist:       'baseIceResist',
  shockResist:     'baseShockResist',
  poisonResist:    'basePoisonResist',
  ccReduction:     'baseCcReduction',
};

const PCT_CAPS = {
  fireResist: 75, iceResist: 75, shockResist: 75, poisonResist: 75,
  critChance: 70, dodgeChance: 60, blockChance: 60, ccReduction: 50,
};

export function applyStuff(level = 1, presetId = 'balanced', customModifiers = []) {
  // Étape 1 : copier les bases avec scaling de niveau pour HP
  const out = {
    maxHp: PLAYER_BASE_STATS.baseMaxHp + (level - 1) * PLAYER_BASE_STATS.hpPerLevel,
    maxAp: PLAYER_BASE_STATS.baseMaxAp,
    bonusAp: PLAYER_BASE_STATS.bonusAp,
    damage: [...PLAYER_BASE_STATS.baseDamage], // copie du range
    damageType: PLAYER_BASE_STATS.damageType,
    armor: PLAYER_BASE_STATS.baseArmor,
    dodgeChance: PLAYER_BASE_STATS.baseDodgeChance,
    blockChance: PLAYER_BASE_STATS.baseBlockChance,
    critChance: PLAYER_BASE_STATS.baseCritChance,
    critMultiplier: PLAYER_BASE_STATS.baseCritMultiplier,
    moveSpeed: PLAYER_BASE_STATS.baseMoveSpeed,
    range: PLAYER_BASE_STATS.baseRange,
    initiative: PLAYER_BASE_STATS.baseInitiative,
    hpRegen: PLAYER_BASE_STATS.baseHpRegen,
    lifesteal: PLAYER_BASE_STATS.baseLifesteal,
    armorPen: PLAYER_BASE_STATS.baseArmorPen,
    bonusFire: PLAYER_BASE_STATS.baseBonusFire,
    bonusIce: PLAYER_BASE_STATS.baseBonusIce,
    bonusShock: PLAYER_BASE_STATS.baseBonusShock,
    bonusPoison: PLAYER_BASE_STATS.baseBonusPoison,
    fireResist: PLAYER_BASE_STATS.baseFireResist,
    iceResist: PLAYER_BASE_STATS.baseIceResist,
    shockResist: PLAYER_BASE_STATS.baseShockResist,
    poisonResist: PLAYER_BASE_STATS.basePoisonResist,
    ccReduction: PLAYER_BASE_STATS.baseCcReduction,
  };

  // Étape 2 : appliquer le preset
  const preset = STUFF_PRESETS[presetId] || STUFF_PRESETS.naked;
  const allMods = [...preset.modifiers, ...customModifiers];

  for (const mod of allMods) {
    const { stat, op, value } = mod;
    if (!(stat in out)) continue;

    if (stat === 'damage') {
      // damage est un range, on traite spécialement
      if (op === 'flat') {
        out.damage[0] += value;
        out.damage[1] += value;
      } else if (op === 'pct') {
        out.damage[0] = Math.round(out.damage[0] * (1 + value/100));
        out.damage[1] = Math.round(out.damage[1] * (1 + value/100));
      }
      continue;
    }

    if (op === 'flat') {
      out[stat] += value;
    } else if (op === 'pct') {
      out[stat] = Math.round(out[stat] * (1 + value/100));
    } else if (op === 'replace') {
      out[stat] = value;
    }
  }

  // Étape 3 : appliquer les caps
  for (const [stat, cap] of Object.entries(PCT_CAPS)) {
    if (out[stat] > cap) out[stat] = cap;
  }
  // Cap regen à +5/tour (patch balance)
  if (out.hpRegen > 5) out.hpRegen = 5;

  return out;
}

// =============================================================================
// HELPER : décrire un preset en texte (pour l'UI)
// =============================================================================
export function describePreset(presetId) {
  const preset = STUFF_PRESETS[presetId];
  if (!preset) return [];
  return preset.modifiers.map(m => {
    const sign = m.value >= 0 ? '+' : '';
    const unit = m.op === 'pct' ? '%' : '';
    return `${sign}${m.value}${unit} ${m.stat}`;
  });
}
