// src/js/combat/damage-types.js
// Source de vérité pour les types de dégâts du jeu.
//
// Le moteur utilise un type plat (string) parmi 8 valeurs.
// Une "catégorie" (physical/magic) est dérivée par helper.

// =============================================================================
// LISTE DES 8 TYPES DE DÉGÂTS
// =============================================================================

export const DAMAGE_TYPES = {
  // PHYSIQUES (3) — bloqués par l'armure
  slash:  { id:'slash',  label:'Tranchant',  category:'physical', color:'#ff5252', icon:'⚔️',  defaultStatus:'bleeding' },
  pierce: { id:'pierce', label:'Perçant',    category:'physical', color:'#ffeb3b', icon:'🏹',  defaultStatus:null      }, // pas de statut, l'effet est armorPen
  blunt:  { id:'blunt',  label:'Contondant', category:'physical', color:'#bdbdbd', icon:'🔨',  defaultStatus:'stunned' },

  // MAGIQUES (5) — non bloqués par l'armure mais soumis aux résistances magiques
  fire:   { id:'fire',   label:'Feu',        category:'magic', color:'#ff5722', icon:'🔥',  defaultStatus:'burning'  },
  ice:    { id:'ice',    label:'Glace',      category:'magic', color:'#4fc3f7', icon:'❄️',  defaultStatus:'chilled'  },
  shock:  { id:'shock',  label:'Foudre',     category:'magic', color:'#9c27b0', icon:'⚡',  defaultStatus:'shocked'  },
  poison: { id:'poison', label:'Poison',     category:'magic', color:'#8bc34a', icon:'☣️',  defaultStatus:'poisoned' },
  magic:  { id:'magic',  label:'Magique',    category:'magic', color:'#e040fb', icon:'✨',  defaultStatus:null       }, // magique pur (rare)
};

// Liste plate pour itération
export const DAMAGE_TYPE_IDS = Object.keys(DAMAGE_TYPES);

// =============================================================================
// CATÉGORIES (groupement UI/conceptuel)
// =============================================================================

export const CATEGORIES = {
  physical: { label:'Physique', members: ['slash','pierce','blunt'] },
  magic:    { label:'Magique',  members: ['fire','ice','shock','poison','magic'] },
};

// =============================================================================
// HELPERS
// =============================================================================

export function getDamageType(id) {
  return DAMAGE_TYPES[id] || DAMAGE_TYPES.blunt; // fallback sécurisé
}

export function getCategory(damageType) {
  return DAMAGE_TYPES[damageType]?.category || 'physical';
}

export function isPhysical(damageType) {
  return getCategory(damageType) === 'physical';
}

export function isMagic(damageType) {
  return getCategory(damageType) === 'magic';
}

export function getColor(damageType) {
  return DAMAGE_TYPES[damageType]?.color || '#bdbdbd';
}

export function getDefaultStatus(damageType) {
  return DAMAGE_TYPES[damageType]?.defaultStatus || null;
}

// Quel champ de résistance regarder pour un type magique donné
// (ex: damage type 'fire' → on regarde target.fireResist + target.magicResist)
export function getResistanceFields(damageType) {
  if (!isMagic(damageType)) return [];
  const fields = ['magicResist'];          // résistance globale
  if (damageType === 'fire')   fields.push('fireResist');
  if (damageType === 'ice')    fields.push('iceResist');
  if (damageType === 'shock')  fields.push('shockResist');
  if (damageType === 'poison') fields.push('poisonResist');
  // 'magic' pur : seulement magicResist global
  return fields;
}
