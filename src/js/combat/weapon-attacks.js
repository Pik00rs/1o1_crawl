// src/js/combat/weapon-attacks.js
// Dérive automatiquement 2 attaques (light + heavy) à partir d'une arme.
//
// Une arme a maintenant la structure :
//   {
//     id, name, icon, slot, damage:[min,max], damageType, range,
//     lightAttack: { name, statusChance? },
//     heavyAttack: { name, statusChance? }
//   }
//
// Si lightAttack/heavyAttack sont absents, des défauts par damageType sont utilisés.
// Le statut appliqué (Saignement, Étourdi, Brûlure...) est dérivé du damageType
// via getDefaultStatus(). Les chances sont configurables par item.
//
// Coûts AP fixés :
//   - Light : 1 AP, pas de cooldown
//   - Heavy : 3 AP, cooldown 2 tours

import { getDefaultStatus, getDamageType } from './damage-types.js';

// =============================================================================
// DÉFAUTS PAR TYPE (si l'arme ne précise rien)
// =============================================================================

const LIGHT_DEFAULTS = {
  slash:  { name:'Coup tranchant',     statusChance: 10 },
  pierce: { name:'Estoc',              statusChance: 0  }, // pierce = armorPen, pas de status
  blunt:  { name:'Frappe contondante', statusChance: 10 },
  fire:   { name:'Lance-flammes',      statusChance: 15 },
  ice:    { name:'Trait de glace',     statusChance: 15 },
  shock:  { name:'Décharge',           statusChance: 15 },
  poison: { name:'Crachat acide',      statusChance: 20 },
  magic:  { name:'Projection arcanique', statusChance: 0 },
};

const HEAVY_DEFAULTS = {
  slash:  { name:'Coup ample',          statusChance: 40, damageMult: 1.6 },
  pierce: { name:'Coup perforant',      statusChance: 0,  damageMult: 1.5 }, // ignore +50% armure en plus
  blunt:  { name:'Écrasement',          statusChance: 40, damageMult: 1.6 },
  fire:   { name:'Embrasement',         statusChance: 50, damageMult: 1.5 },
  ice:    { name:'Vague de gel',        statusChance: 50, damageMult: 1.5 },
  shock:  { name:'Foudre concentrée',   statusChance: 50, damageMult: 1.5 },
  poison: { name:'Geyser toxique',      statusChance: 60, damageMult: 1.4 },
  magic:  { name:'Salve arcanique',     statusChance: 0,  damageMult: 1.7 },
};

// =============================================================================
// BUILDERS
// =============================================================================

/**
 * Construit l'attaque légère pour une arme donnée.
 * @returns un objet skill compatible avec le moteur (mêmes champs que spells.json)
 */
export function buildLightAttack(weapon) {
  const dmgType = weapon.damageType || 'blunt';
  const defaults = LIGHT_DEFAULTS[dmgType] || LIGHT_DEFAULTS.blunt;
  const override = weapon.lightAttack || {};
  const statusChance = override.statusChance ?? defaults.statusChance;
  const statusId = getDefaultStatus(dmgType);

  const attack = {
    id: `${weapon.id}_light`,
    name: override.name || defaults.name,
    type: 'attack',
    cost: 1,
    range: weapon.range || 1,
    targetType: 'enemy',
    damageMult: 1.0,
    damageType: dmgType,
    description: `1 AP · ${dmgType}`,
  };
  if (statusId && statusChance > 0) {
    attack.applyStatus = {
      id: statusId,
      chance: statusChance,
      duration: defaultStatusDuration(statusId, false),
      power: defaultStatusPower(statusId, false),
    };
  }
  return attack;
}

/**
 * Construit l'attaque lourde pour une arme donnée.
 */
export function buildHeavyAttack(weapon) {
  const dmgType = weapon.damageType || 'blunt';
  const defaults = HEAVY_DEFAULTS[dmgType] || HEAVY_DEFAULTS.blunt;
  const override = weapon.heavyAttack || {};
  const statusChance = override.statusChance ?? defaults.statusChance;
  const statusId = getDefaultStatus(dmgType);
  const damageMult = override.damageMult ?? defaults.damageMult;

  const attack = {
    id: `${weapon.id}_heavy`,
    name: override.name || defaults.name,
    type: 'attack',
    cost: 3,
    cooldown: 2,
    range: weapon.range || 1,
    targetType: 'enemy',
    damageMult,
    damageType: dmgType,
    description: `3 AP · CD 2 · ×${damageMult} dmg`,
  };

  // Effets spéciaux selon type
  if (dmgType === 'pierce') {
    // Coup perforant : pénétration d'armure additionnelle
    attack.bonusArmorPen = 8;
    attack.description += ` · +pénétration`;
  }

  if (statusId && statusChance > 0) {
    attack.applyStatus = {
      id: statusId,
      chance: statusChance,
      duration: defaultStatusDuration(statusId, true),
      power: defaultStatusPower(statusId, true),
    };
  }
  return attack;
}

/**
 * Retourne les 2 attaques d'une arme (light + heavy).
 */
export function getWeaponAttacks(weapon) {
  if (!weapon) return [];
  return [buildLightAttack(weapon), buildHeavyAttack(weapon)];
}

// =============================================================================
// DÉFAUTS DURÉE / POWER PAR STATUT
// =============================================================================

function defaultStatusDuration(statusId, isHeavy) {
  const map = {
    bleeding: isHeavy ? 4 : 3,
    burning:  isHeavy ? 4 : 3,
    poisoned: isHeavy ? 5 : 4,
    chilled:  isHeavy ? 3 : 2,
    shocked:  isHeavy ? 2 : 2,
    stunned:  1,           // toujours 1 tour
    frozen:   1,
  };
  return map[statusId] || 2;
}

function defaultStatusPower(statusId, isHeavy) {
  const map = {
    bleeding: isHeavy ? 5 : 3,
    burning:  isHeavy ? 5 : 3,
    poisoned: isHeavy ? 4 : 2,
    // les autres n'ont pas de power numérique (pur effet)
  };
  return map[statusId] || 0;
}
