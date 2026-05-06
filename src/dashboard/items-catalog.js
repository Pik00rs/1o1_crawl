// src/dashboard/items-catalog.js
// Catalog unifié d'items v2.
// Charge weapons.json + offhands.json + armor.json + amulets.json + rings.json + affixes.json
// affixes.json est organisé par POOL (elemental, physical, armor, boots, ring, amulet_specific,
// tome, quiver, charger, shield, elite). Chaque item a un champ `affixPools` qui dit dans quels
// pools il pioche.
//
// API publique conservée (rétro-compat) :
//   - loadCatalog(), getItem(id), getAllItems(), getAllAffixes(), getAffix(id)
//   - rollItem(id, opts), composeItemName(item), describeItemStats(item), ilvlToRoman(n)
//   - rollAffixValue(range, rarity, ilvl), affixQualityPct(value, range, ilvl)

const FILES = {
  weapons:  '../data/weapons.json',
  offhands: '../data/offhands.json',
  armor:    '../data/armor.json',
  amulets:  '../data/amulets.json',
  rings:    '../data/rings.json',
  affixes:  '../data/affixes.json',
};

// Cache global
const STATE = {
  loaded: false,
  loading: null,
  catalog: {},      // itemId → template normalisé
  affixesByPool: {}, // pool → { id → affix }
  affixesById: {},   // id → affix (lookup direct)
  affixesByType: {   // rétro-compat : prefixes/suffixes pour APIs anciennes (grimoire/reroller)
    prefixes: {},
    suffixes: {},
  },
  armorImplicitChoices: {}, // hp/armor/divineShield (pour armures rollables)
};

// === SLOT NORMALIZATION ===
// weapons.json a 'weapon1H'/'weapon2H', tout le reste est déjà normalisé.
// Slots du héro (8) : mainhand, offhand, head, chest, legs, gloves, boots, amulet, ring
function normalizeSlot(rawSlot){
  if(rawSlot === 'weapon1H' || rawSlot === 'weapon2H') return 'mainhand';
  return rawSlot;
}
function getHandedFromRawSlot(rawSlot){
  if(rawSlot === 'weapon2H') return 2;
  if(rawSlot === 'weapon1H') return 1;
  return 0;
}

// === LOAD ALL JSON ===
export async function loadCatalog(){
  if(STATE.loaded) return STATE;
  if(STATE.loading) return STATE.loading;

  STATE.loading = (async () => {
    const fetchJson = async (path) => {
      const res = await fetch(path);
      if(!res.ok) throw new Error(`Failed to fetch ${path}: ${res.status}`);
      return res.json();
    };

    try {
      const [weapons, offhands, armor, amulets, rings, affixes] = await Promise.all([
        fetchJson(FILES.weapons),
        fetchJson(FILES.offhands),
        fetchJson(FILES.armor),
        fetchJson(FILES.amulets),
        fetchJson(FILES.rings),
        fetchJson(FILES.affixes),
      ]);

      const catalog = {};

      // Weapons
      Object.entries(weapons).forEach(([id, w]) => {
        if(id.startsWith('_')) return;
        catalog[id] = {
          ...w,
          cat: 'weapon',
          slot: normalizeSlot(w.slot),
          handed: getHandedFromRawSlot(w.slot),
          affixPools: w.affixPools || ['physical'],
        };
      });

      // Offhands (nouveau)
      Object.entries(offhands).forEach(([id, o]) => {
        if(id.startsWith('_')) return;
        catalog[id] = {
          ...o,
          cat: 'offhand',
          slot: 'offhand',
          affixPools: o.affixPools || [],
        };
      });

      // Armor
      Object.entries(armor).forEach(([id, a]) => {
        if(id.startsWith('_')) return;
        catalog[id] = {
          ...a,
          cat: a.category === 'boots' ? 'boots' : 'armor',
          slot: normalizeSlot(a.slot),
          affixPools: a.affixPools || (a.category === 'boots' ? ['boots'] : ['armor']),
        };
      });
      // Stocke les choix d'implicits pour armures rollables
      if(armor._meta && armor._meta.implicitChoices){
        STATE.armorImplicitChoices = armor._meta.implicitChoices;
        delete STATE.armorImplicitChoices._doc; // remove le commentaire
      }

      // Amulets
      Object.entries(amulets).forEach(([id, a]) => {
        if(id.startsWith('_')) return;
        catalog[id] = {
          ...a,
          cat: 'amulet',
          slot: normalizeSlot(a.slot),
          affixPools: a.affixPools || ['physical', 'armor', 'amulet_specific'],
        };
      });

      // Rings
      Object.entries(rings).forEach(([id, r]) => {
        if(id.startsWith('_')) return;
        catalog[id] = {
          ...r,
          cat: 'ring',
          slot: normalizeSlot(r.slot),
          affixPools: r.affixPools || ['ring'],
          guaranteedAffixCount: r.guaranteedAffixCount || 2,
        };
      });

      STATE.catalog = catalog;

      // === AFFIXES : nouveau format par pool ===
      STATE.affixesByPool = {};
      STATE.affixesById = {};
      STATE.affixesByType = { prefixes: {}, suffixes: {} };

      Object.entries(affixes).forEach(([poolName, poolEntries]) => {
        if(poolName === '_meta') return;
        STATE.affixesByPool[poolName] = {};
        Object.entries(poolEntries).forEach(([affId, affix]) => {
          // Inject pool name into affix object pour debug/affichage
          const enriched = { ...affix, pool: poolName };
          STATE.affixesByPool[poolName][affId] = enriched;
          STATE.affixesById[affId] = enriched;
          // Rétro-compat : groupe par type
          if(affix.type === 'prefix'){
            STATE.affixesByType.prefixes[affId] = enriched;
          } else if(affix.type === 'suffix'){
            STATE.affixesByType.suffixes[affId] = enriched;
          }
        });
      });

      STATE.loaded = true;
      return STATE;
    } catch(e){
      console.error('Catalog load failed, using fallback:', e);
      STATE.catalog = buildFallbackCatalog();
      STATE.affixesByPool = buildFallbackAffixes();
      STATE.affixesById = {};
      STATE.affixesByType = { prefixes: {}, suffixes: {} };
      Object.values(STATE.affixesByPool).forEach(pool => {
        Object.values(pool).forEach(a => {
          STATE.affixesById[a.id] = a;
          if(a.type === 'prefix') STATE.affixesByType.prefixes[a.id] = a;
          else if(a.type === 'suffix') STATE.affixesByType.suffixes[a.id] = a;
        });
      });
      STATE.armorImplicitChoices = {
        hp:           { id: 'maxHp',        valueRange: [12, 25], label: '+X PV max' },
        armor:        { id: 'armor',        valueRange: [4, 9],   label: '+X armure' },
        divineShield: { id: 'divineShield', valueRange: [4, 9],   label: '+X% réduction dégâts élémentaires' },
      };
      STATE.loaded = true;
      return STATE;
    }
  })();

  return STATE.loading;
}

// === FALLBACK (file:// / CORS) ===
function buildFallbackCatalog(){
  return {
    sword1H:    { id: 'sword1H', name: 'Épée', icon: '⚔️', cat: 'weapon', slot: 'mainhand', handed: 1, damage: [9, 14], damageType: 'slash', range: 1, appliedStatus: 'bleeding', biome: 'crimson', affixPools: ['physical'] },
    sword2H:    { id: 'sword2H', name: 'Espadon', icon: '⚔️', cat: 'weapon', slot: 'mainhand', handed: 2, damage: [16, 25], damageType: 'slash', range: 2, appliedStatus: 'bleeding', biome: 'crimson', affixPools: ['physical'] },
    dagger1H:   { id: 'dagger1H', name: 'Dague', icon: '🔪', cat: 'weapon', slot: 'mainhand', handed: 1, damage: [5, 9], damageType: 'pierce', range: 1, biome: 'crimson', affixPools: ['physical'] },
    hammer1H:   { id: 'hammer1H', name: 'Marteau', icon: '🔨', cat: 'weapon', slot: 'mainhand', handed: 1, damage: [8, 13], damageType: 'blunt', range: 1, biome: 'inferno', affixPools: ['physical'] },
    bow:        { id: 'bow', name: 'Arc', icon: '🏹', cat: 'weapon', slot: 'mainhand', handed: 1, damage: [7, 12], damageType: 'pierce', range: 4, biome: 'voidnet', affixPools: ['physical'] },
    pistol:     { id: 'pistol', name: 'Pistolet', icon: '🔫', cat: 'weapon', slot: 'mainhand', handed: 1, damage: [7, 12], damageType: 'slash', range: 5, biome: 'voidnet', affixPools: ['physical'] },
    staffPyro:  { id: 'staffPyro', name: 'Bâton Pyromantique', icon: '🔥', cat: 'weapon', slot: 'mainhand', handed: 1, damage: [8, 13], damageType: 'fire', range: 3, element: 'fire', biome: 'inferno', affixPools: ['elemental'] },
    headHp:     { id: 'headHp', name: 'Casque de Vitalité', icon: '🪖', cat: 'armor', slot: 'head', defenseType: 'hp', biome: 'cryo', implicit: { id: 'maxHp', valueRange: [12, 25], label: '+X PV max' }, affixPools: ['armor'] },
    headArmor:  { id: 'headArmor', name: 'Casque d\'Acier', icon: '🪖', cat: 'armor', slot: 'head', defenseType: 'armor', biome: 'cryo', implicit: { id: 'armor', valueRange: [4, 9], label: '+X armure' }, affixPools: ['armor'] },
    chestHp:    { id: 'chestHp', name: 'Veste de Vitalité', icon: '🦺', cat: 'armor', slot: 'chest', defenseType: 'hp', biome: 'cryo', implicit: { id: 'maxHp', valueRange: [15, 30], label: '+X PV max' }, affixPools: ['armor'] },
    legsArmor:  { id: 'legsArmor', name: 'Pantalon d\'Acier', icon: '👖', cat: 'armor', slot: 'legs', defenseType: 'armor', biome: 'cryo', implicit: { id: 'armor', valueRange: [3, 7], label: '+X armure' }, affixPools: ['armor'] },
    glovesArmor:{ id: 'glovesArmor', name: 'Gants d\'Acier', icon: '🧤', cat: 'armor', slot: 'gloves', defenseType: 'armor', biome: 'crimson', implicit: { id: 'armor', valueRange: [3, 6], label: '+X armure' }, affixPools: ['armor'] },
    boots:      { id: 'boots', name: 'Bottes', icon: '👢', cat: 'boots', slot: 'boots', biome: 'voidnet', implicit: { id: 'freeMovement', valueRange: [1, 1], label: '+X case mouvement gratuit/tour' }, affixPools: ['boots'] },
    amuletPyro: { id: 'amuletPyromancy', name: 'Amulette Pyromantique', icon: '🔥', cat: 'amulet', slot: 'amulet', spell: 'fireball', element: 'fire', biome: 'inferno', affixPools: ['physical', 'armor', 'amulet_specific'] },
    ring:       { id: 'ring', name: 'Anneau', icon: '💍', cat: 'ring', slot: 'ring', biome: 'crimson', affixPools: ['ring'], guaranteedAffixCount: 2 },
  };
}

function buildFallbackAffixes(){
  return {
    physical: {
      critChance: { id: 'critChance', name: 'Vicieuse', type: 'prefix', stat: 'critChance', label: '+X% chance crit', valueRange: [3, 8], pool: 'physical', biome: 'crimson' },
      lifesteal:  { id: 'lifesteal',  name: 'Sanguinaire', type: 'prefix', stat: 'lifesteal',  label: '+X% lifesteal', valueRange: [3, 8], pool: 'physical', biome: 'toxic' },
    },
    armor: {
      armorFlat: { id: 'armorFlat', name: 'Renforcée', type: 'prefix', stat: 'armor', label: '+X armure', valueRange: [3, 8], pool: 'armor', biome: 'cryo' },
      hpFlat:    { id: 'hpFlat',    name: 'Vitale',    type: 'prefix', stat: 'maxHp', label: '+X PV max', valueRange: [10, 25], pool: 'armor', biome: 'cryo' },
    },
    elemental: {
      elemDamageFlat: { id: 'elemDamageFlat', name: 'Élémentaire', type: 'prefix', stat: 'bonusElemDamage', label: '+X dégâts élémentaires', valueRange: [3, 8], pool: 'elemental', biome: 'inferno' },
    },
    ring: {
      ringHp: { id: 'ringHp', name: 'Vital', type: 'prefix', stat: 'maxHp', label: '+X PV max', valueRange: [8, 18], pool: 'ring', biome: 'cryo' },
    },
    boots: {
      freeMovement: { id: 'freeMovement', name: 'du Vent', type: 'suffix', stat: 'freeMovement', label: '+X case mouvement gratuit/tour', valueRange: [1, 2], pool: 'boots', biome: 'voidnet' },
    },
  };
}

// === API PUBLIQUE ===
export function getItem(itemId){ return STATE.catalog[itemId] || null; }
export function getAllItems(){ return STATE.catalog; }
export function getAffix(id){ return STATE.affixesById[id] || null; }
export function getAllAffixes(){ return STATE.affixesByType; } // {prefixes, suffixes} pour rétro-compat
export function getAffixesByPool(){ return STATE.affixesByPool; } // {pool: {id: affix}}
export function getAffixesInPools(poolNames){
  const out = {};
  for(const pool of (poolNames || [])){
    if(STATE.affixesByPool[pool]){
      Object.assign(out, STATE.affixesByPool[pool]);
    }
  }
  return out;
}

// === SKEW DISTRIBUTION (Hardcore) ===
const RARITY_SKEW = {
  common:    4.0,
  magic:     2.5,
  rare:      1.5,
  epic:      1.0,
  legendary: 0.6,
};

const ILVL_MULTIPLIER = {
  1: 0.50, 2: 0.65, 3: 0.80, 4: 0.95, 5: 1.00,
  6: 1.15, 7: 1.30, 8: 1.50, 9: 1.75, 10: 2.10,
};

function randomInRange(min, max){ return Math.floor(Math.random() * (max - min + 1)) + min; }

function rangeIsInt(valueRange){
  return Number.isInteger(valueRange[0]) && Number.isInteger(valueRange[1]);
}
function floorByRange(rawVal, valueRange){
  if(rangeIsInt(valueRange)) return Math.max(1, Math.floor(rawVal));
  return Math.max(0.1, Math.floor(rawVal * 10) / 10);
}

/**
 * Roll la valeur d'un affixe avec skew par rareté.
 * 0% = vMin × ilvlMult, 100% = vMax × ilvlMult.
 */
export function rollAffixValue(valueRange, rarity, ilvl){
  const [vMin, vMax] = valueRange;
  const ilvlMult = ILVL_MULTIPLIER[ilvl] || 1;
  const skew = RARITY_SKEW[rarity] ?? 1.0;
  const u = Math.random();
  const t = Math.pow(u, skew);
  const rawVal = (vMin + t * (vMax - vMin)) * ilvlMult;
  return floorByRange(rawVal, valueRange);
}

/**
 * Calcule le % qualité d'un roll par rapport au range possible pour cet iLvl.
 */
export function affixQualityPct(value, valueRange, ilvl){
  const [vMin, vMax] = valueRange;
  const ilvlMult = ILVL_MULTIPLIER[ilvl] || 1;
  const minPossible = vMin * ilvlMult;
  const maxPossible = vMax * ilvlMult;
  if(maxPossible <= minPossible) return 100;
  const pct = ((value - minPossible) / (maxPossible - minPossible)) * 100;
  return Math.max(0, Math.min(100, pct));
}

// === RARITY → AFFIX COUNT (par défaut, sauf si guaranteedAffixCount) ===
const RARITY_AFFIX_COUNT = {
  common:    [0, 0],
  magic:     [1, 2],
  rare:      [2, 3],
  epic:      [3, 4],
  legendary: [4, 4],
};

// Quels rarities permettent les affixes "elite" (isElite)
const ELITE_ALLOWED_RARITIES = new Set(['epic', 'legendary']);

/**
 * Roll un item complet.
 * @param {string} itemId
 * @param {object} opts - { rarity, ilvl, biomeId, isBossDrop }
 */
export function rollItem(itemId, opts = {}){
  const tpl = getItem(itemId);
  if(!tpl) return null;
  const rarity = opts.rarity || 'common';
  const ilvl = opts.ilvl || 1;
  const biomeId = opts.biomeId || tpl.biome || null;

  // Compute affix count
  let affixCount;
  if(typeof tpl.guaranteedAffixCount === 'number'){
    affixCount = tpl.guaranteedAffixCount; // Anneaux : toujours 2 peu importe rareté
  } else {
    const ac = RARITY_AFFIX_COUNT[rarity];
    if(Array.isArray(ac)) affixCount = randomInRange(ac[0], ac[1]);
    else if(typeof ac === 'number') affixCount = ac;
    else affixCount = 0;
  }

  // Roll affixes en piochant dans les pools de l'item
  const affixes = rollAffixesFromPools(
    affixCount,
    tpl.affixPools || [],
    rarity,
    ilvl,
  );

  // === IMPLICIT ===
  let implicit = null;
  if(tpl.implicitRollable){
    // Armures qui peuvent roller hp/armor/divineShield au drop
    const choices = STATE.armorImplicitChoices;
    const choiceKeys = Object.keys(choices);
    if(choiceKeys.length > 0){
      const pickedKey = choiceKeys[Math.floor(Math.random() * choiceKeys.length)];
      const pickedDef = choices[pickedKey];
      const ilvlMult = ILVL_MULTIPLIER[ilvl] || 1;
      const [vMin, vMax] = pickedDef.valueRange;
      const value = Math.max(1, Math.floor(randomInRange(vMin, vMax) * ilvlMult));
      implicit = {
        id: pickedDef.id,
        label: pickedDef.label,
        value,
      };
    }
  } else if(tpl.implicit){
    // Implicit fixe (ex: bottes = freeMovement)
    const ilvlMult = ILVL_MULTIPLIER[ilvl] || 1;
    const [vMin, vMax] = tpl.implicit.valueRange;
    const value = Math.max(1, Math.floor(randomInRange(vMin, vMax) * ilvlMult));
    implicit = {
      id: tpl.implicit.id,
      label: tpl.implicit.label,
      value,
    };
  }

  return {
    itemId,
    rarity,
    ilvl,
    biomeId,
    affixes,
    implicit,
    droppedAt: Date.now(),
    isBossDrop: !!opts.isBossDrop,
    instanceId: `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
  };
}

function rollAffixesFromPools(count, poolNames, rarity, ilvl){
  if(count <= 0) return [];
  if(!poolNames || poolNames.length === 0) return [];

  // Construit le pool d'affixes disponibles depuis les pool names + élite si possible
  const allowedPools = [...poolNames];
  // Élites disponibles sur tout item Epic/Legendary qui n'a pas de pool spécifique élite
  const eliteAvailable = ELITE_ALLOWED_RARITIES.has(rarity);
  if(eliteAvailable && !allowedPools.includes('elite')){
    allowedPools.push('elite');
  }

  const pool = [];
  for(const poolName of allowedPools){
    const poolAffixes = STATE.affixesByPool[poolName];
    if(!poolAffixes) continue;
    Object.values(poolAffixes).forEach(a => {
      // Élites : seulement Epic/Legendary
      if(a.isElite && !eliteAvailable) return;
      pool.push(a);
    });
  }

  if(pool.length === 0) return [];

  const affixes = [];
  const usedStats = new Set();
  let safety = 0;
  while(affixes.length < count && safety++ < 50){
    const candidate = pool[Math.floor(Math.random() * pool.length)];
    if(usedStats.has(candidate.stat)) continue;
    usedStats.add(candidate.stat);
    const finalVal = rollAffixValue(candidate.valueRange, rarity, ilvl);
    affixes.push({
      id: candidate.id,
      type: candidate.type,
      stat: candidate.stat,
      label: candidate.label,
      value: finalVal,
      name: candidate.name,
      pool: candidate.pool,
      isElite: !!candidate.isElite,
    });
  }
  return affixes;
}

// === DISPLAY HELPERS ===
const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
export function ilvlToRoman(n){ return ROMAN[n] || String(n); }

export function composeItemName(rolledItem){
  const tpl = getItem(rolledItem.itemId);
  if(!tpl) return rolledItem.itemId;
  if(!rolledItem.affixes || rolledItem.affixes.length === 0) return tpl.name;
  const prefix = rolledItem.affixes.find(a => a.type === 'prefix');
  const suffix = rolledItem.affixes.find(a => a.type === 'suffix');
  let name = tpl.name;
  if(prefix) name = `${prefix.name} ${name}`;
  if(suffix) name = `${name} ${suffix.name}`;
  return name;
}

export function describeItemStats(rolledItem){
  const tpl = getItem(rolledItem.itemId);
  if(!tpl) return [];
  const lines = [];

  // Base damage (weapons)
  if(tpl.damage){
    const ilvlMult = ILVL_MULTIPLIER[rolledItem.ilvl] || 1;
    const [dMin, dMax] = tpl.damage;
    lines.push({
      label: `DGT ${tpl.damageType?.toUpperCase() || ''}`,
      value: `${Math.round(dMin * ilvlMult)}-${Math.round(dMax * ilvlMult)}`,
      kind: 'base',
    });
    if(tpl.range) lines.push({ label: 'PORTÉE', value: tpl.range, kind: 'base' });
  }

  // Implicit
  if(rolledItem.implicit){
    lines.push({
      label: rolledItem.implicit.label?.replace('X', '').trim() || rolledItem.implicit.id,
      value: rolledItem.implicit.value,
      kind: 'implicit',
    });
  }

  // Spell (amulets)
  if(tpl.spell){
    lines.push({ label: 'SORT', value: tpl.spell, kind: 'implicit' });
  }

  // Affixes
  (rolledItem.affixes || []).forEach(a => {
    lines.push({
      label: a.label?.replace('X', '').trim() || a.stat,
      value: a.value,
      kind: a.type, // 'prefix' or 'suffix'
      name: a.name,
    });
  });

  return lines;
}
