// src/dashboard/items-catalog.js
// Catalog unifié d'items : charge weapons.json + armor.json + amulets.json + rings.json
// Expose un Map {itemId → template} avec un slot normalisé pour matcher l'équipement du héro.
// Affixes lus depuis affixes.json pour roll/affichage.

const FILES = {
  weapons:  '../data/weapons.json',
  armor:    '../data/armor.json',
  amulets:  '../data/amulets.json',
  rings:    '../data/rings.json',
  affixes:  '../data/affixes.json',
};

// Cache global
const STATE = {
  loaded: false,
  loading: null,
  catalog: {},   // itemId → template (avec slot normalisé)
  affixes: { prefixes: {}, suffixes: {} },
};

// Slot normalisation : weapons.json a 'weapon1H'/'weapon2H', armures sont par slot,
// amulettes ont 'amulet', anneaux 'ring', off-hand 'offhand'. On unifie avec les 8 slots du héro.
//
// Slots du héro (8) : mainhand, offhand, head, chest, legs, gloves, boots, amulet, ring
// Une arme 2H occupe mainhand ET offhand (l'offhand est verrouillée tant que la 2H est équipée).
// Le champ 'handed' (1 ou 2) est ajouté à chaque item pour savoir si c'est une 2H.
function normalizeSlot(rawSlot){
  if(rawSlot === 'weapon1H' || rawSlot === 'weapon2H') return 'mainhand';
  return rawSlot; // head, chest, legs, gloves, boots, amulet, ring, offhand (déjà bons)
}

function getHandedFromRawSlot(rawSlot){
  if(rawSlot === 'weapon2H') return 2;
  if(rawSlot === 'weapon1H') return 1;
  return 0; // pas une arme
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
      const [weapons, armor, amulets, rings, affixes] = await Promise.all([
        fetchJson(FILES.weapons),
        fetchJson(FILES.armor),
        fetchJson(FILES.amulets),
        fetchJson(FILES.rings),
        fetchJson(FILES.affixes),
      ]);

      // Build catalog
      const catalog = {};

      // Weapons
      Object.entries(weapons).forEach(([id, w]) => {
        if(id.startsWith('_')) return;
        catalog[id] = {
          ...w,
          cat: 'weapon',
          slot: normalizeSlot(w.slot),
          handed: getHandedFromRawSlot(w.slot), // 1 ou 2
        };
      });

      // Armor
      Object.entries(armor).forEach(([id, a]) => {
        if(id.startsWith('_')) return;
        catalog[id] = {
          ...a,
          cat: 'armor',
          slot: normalizeSlot(a.slot),
        };
      });

      // Amulets
      Object.entries(amulets).forEach(([id, a]) => {
        if(id.startsWith('_')) return;
        catalog[id] = {
          ...a,
          cat: 'amulet',
          slot: normalizeSlot(a.slot),
        };
      });

      // Rings
      Object.entries(rings).forEach(([id, r]) => {
        if(id.startsWith('_')) return;
        catalog[id] = {
          ...r,
          cat: 'ring',
          slot: normalizeSlot(r.slot),
        };
      });

      STATE.catalog = catalog;
      STATE.affixes = {
        prefixes: affixes.prefixes || {},
        suffixes: affixes.suffixes || {},
      };
      STATE.loaded = true;
      return STATE;
    } catch(e){
      console.error('Catalog load failed, using fallback:', e);
      // Fallback minimal pour qu'on puisse au moins tester l'UI
      STATE.catalog = buildFallbackCatalog();
      STATE.affixes = buildFallbackAffixes();
      STATE.loaded = true;
      return STATE;
    }
  })();

  return STATE.loading;
}

// Fallback si fetch échoue (file://, CORS, JSON manquants)
function buildFallbackCatalog(){
  return {
    swordRusty:   { id: 'swordRusty', name: 'Épée rouillée', icon: '🗡️', cat: 'weapon', slot: 'mainhand', handed: 1, damage: [6, 10], damageType: 'slash', range: 1 },
    swordIron:    { id: 'swordIron', name: 'Épée de fer', icon: '⚔️', cat: 'weapon', slot: 'mainhand', handed: 1, damage: [9, 14], damageType: 'slash', range: 1 },
    flameSword:   { id: 'flameSword', name: 'Lame Ardente', icon: '🔥', cat: 'weapon', slot: 'mainhand', handed: 1, damage: [8, 13], damageType: 'fire', range: 1 },
    iceStaff:     { id: 'iceStaff', name: 'Bâton de Givre', icon: '❄️', cat: 'weapon', slot: 'mainhand', handed: 2, damage: [10, 15], damageType: 'ice', range: 4 },
    axeBerserker: { id: 'axeBerserker', name: 'Hache de berserker', icon: '🪓', cat: 'weapon', slot: 'mainhand', handed: 2, damage: [13, 22], damageType: 'slash', range: 1 },
    daggerSwift:  { id: 'daggerSwift', name: 'Dague véloce', icon: '🔪', cat: 'weapon', slot: 'mainhand', handed: 1, damage: [5, 9], damageType: 'pierce', range: 1 },
    head:         { id: 'head', name: 'Casque', icon: '⛑️', cat: 'armor', slot: 'head', implicit: { id: 'armor', valueRange: [4,8], label: '+X armure' }, tags: ['Defense'] },
    chest:        { id: 'chest', name: 'Veste', icon: '🦺', cat: 'armor', slot: 'chest', implicit: { id: 'maxHP', valueRange: [12,25], label: '+X PV max' }, tags: ['Defense'] },
    legs:         { id: 'legs', name: 'Pantalon', icon: '👖', cat: 'armor', slot: 'legs', implicit: { id: 'armor', valueRange: [3,7], label: '+X armure' }, tags: ['Defense'] },
    gloves:       { id: 'gloves', name: 'Gants', icon: '🧤', cat: 'armor', slot: 'gloves', implicit: { id: 'critChance', valueRange: [3,7], label: '+X% chance crit' }, tags: ['Offense'] },
    boots:        { id: 'boots', name: 'Bottes', icon: '👢', cat: 'armor', slot: 'boots', implicit: { id: 'freeMovement', valueRange: [1,1], label: '+X mouvement' }, tags: ['Mobility'] },
    amuletPyromancy: { id: 'amuletPyromancy', name: 'Amulette Pyromantique', icon: '🔥', cat: 'amulet', slot: 'amulet', spell: 'fireball' },
    amuletCryomancy: { id: 'amuletCryomancy', name: 'Amulette Cryomantique', icon: '❄️', cat: 'amulet', slot: 'amulet', spell: 'frostBolt' },
    ringPyrokinesis: { id: 'ringPyrokinesis', name: 'Anneau de Pyrokinèse', icon: '🔥', cat: 'ring', slot: 'ring', passive: { bonusFire: 6, fireResist: 15 } },
    ringVampire:     { id: 'ringVampire', name: 'Anneau du Vampire', icon: '🩸', cat: 'ring', slot: 'ring', passive: { lifesteal: 8 } },
  };
}

function buildFallbackAffixes(){
  return {
    prefixes: {
      flaming:   { id: 'flaming', name: 'Enflammée', label: '+X dégâts Feu', stat: 'bonusFireDamage', valueRange: [3, 8], type: 'prefix' },
      sharp:     { id: 'sharp', name: 'Tranchante', label: '+X dégâts Tranchants', stat: 'bonusSlashDamage', valueRange: [3, 7], type: 'prefix' },
      vicious:   { id: 'vicious', name: 'Vicieuse', label: '+X% chance crit', stat: 'critChance', valueRange: [3, 8], type: 'prefix' },
      vital:     { id: 'vital', name: 'Vitale', label: '+X PV max', stat: 'maxHP', valueRange: [8, 18], type: 'prefix' },
      reinforced:{ id: 'reinforced', name: 'Renforcée', label: '+X armure', stat: 'armor', valueRange: [3, 8], type: 'prefix' },
    },
    suffixes: {
      ofVigor:        { id: 'ofVigor', name: 'de Vigueur', label: '+X PV max', stat: 'maxHP', valueRange: [10, 20], type: 'suffix' },
      ofFortitude:    { id: 'ofFortitude', name: 'de Robustesse', label: '+X armure', stat: 'armor', valueRange: [3, 7], type: 'suffix' },
      ofFireResist:   { id: 'ofFireResist', name: 'Pyro-Résistante', label: '+X% résistance Feu', stat: 'fireResist', valueRange: [10, 25], type: 'suffix' },
      ofShadow:       { id: 'ofShadow', name: 'des Ombres', label: '+X% esquive', stat: 'dodgeChance', valueRange: [3, 10], type: 'suffix' },
    },
  };
}

// === API ===
export function getItem(itemId){ return STATE.catalog[itemId] || null; }
export function getAllItems(){ return STATE.catalog; }
export function getAffix(id){
  return STATE.affixes.prefixes[id] || STATE.affixes.suffixes[id] || null;
}
export function getAllAffixes(){ return STATE.affixes; }

// === ROLL HELPERS (utilisés pour mock + dropped items) ===
const RARITY_AFFIX_COUNT = {
  common: 0,
  magic: [1, 2],
  rare: [2, 3],
  epic: [3, 4],
  legendary: [4, 4],
};

const RARITY_VALUE_MULTIPLIERS = {
  common: [0.5, 0.8],
  magic: [0.6, 1.0],
  rare: [0.8, 1.3],
  epic: [1.0, 1.6],
  legendary: [1.3, 2.0],
};

const ILVL_MULTIPLIER = {
  1: 0.50, 2: 0.65, 3: 0.80, 4: 0.95, 5: 1.00,
  6: 1.15, 7: 1.30, 8: 1.50, 9: 1.75, 10: 2.10,
};

function randomInRange(min, max){ return Math.floor(Math.random() * (max - min + 1)) + min; }

/**
 * Roll un item complet avec affixes, à partir d'un itemId du catalog.
 * @param {string} itemId
 * @param {object} opts - { rarity, ilvl, biomeId }
 */
export function rollItem(itemId, opts = {}){
  const tpl = getItem(itemId);
  if(!tpl) return null;
  const rarity = opts.rarity || 'common';
  const ilvl = opts.ilvl || 1;
  const biomeId = opts.biomeId || null;

  // Compute affix count
  let affixCount = 0;
  const ac = RARITY_AFFIX_COUNT[rarity];
  if(Array.isArray(ac)) affixCount = randomInRange(ac[0], ac[1]);
  else if(typeof ac === 'number') affixCount = ac;

  // Roll affixes
  const affixes = rollAffixes(affixCount, tpl.slot, rarity, ilvl);

  // Implicit (pour armures)
  let implicit = null;
  if(tpl.implicit){
    const ilvlMult = ILVL_MULTIPLIER[ilvl] || 1;
    const [vMin, vMax] = tpl.implicit.valueRange;
    const value = Math.round(randomInRange(vMin, vMax) * ilvlMult);
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

function rollAffixes(count, itemSlot, rarity, ilvl){
  if(count <= 0) return [];
  const affixes = [];
  const usedStats = new Set();
  const allPrefixes = Object.values(STATE.affixes.prefixes);
  const allSuffixes = Object.values(STATE.affixes.suffixes);

  // Filter affixes valid for this slot (validSlots empty = all)
  const isValidForSlot = (affix) => {
    if(!affix.validSlots || affix.validSlots.length === 0) return true;
    return affix.validSlots.includes(itemSlot);
  };

  const validPrefixes = allPrefixes.filter(isValidForSlot);
  const validSuffixes = allSuffixes.filter(isValidForSlot);

  const ilvlMult = ILVL_MULTIPLIER[ilvl] || 1;
  const tierMult = RARITY_VALUE_MULTIPLIERS[rarity] || [0.5, 1.0];

  // Alterne prefix/suffix pour la diversité
  let preferPrefix = Math.random() < 0.5;
  let safety = 0;
  while(affixes.length < count && safety++ < 30){
    const pool = preferPrefix ? validPrefixes : validSuffixes;
    if(pool.length === 0){
      preferPrefix = !preferPrefix;
      continue;
    }
    const candidate = pool[Math.floor(Math.random() * pool.length)];
    if(usedStats.has(candidate.stat)){
      // Évite duplicates de même stat. Switch prefix/suffix pour diversifier.
      preferPrefix = !preferPrefix;
      continue;
    }
    usedStats.add(candidate.stat);
    // Roll value
    const [vMin, vMax] = candidate.valueRange;
    const baseVal = randomInRange(vMin, vMax);
    const finalVal = Math.max(1, Math.round(baseVal * ilvlMult * (tierMult[0] + Math.random() * (tierMult[1] - tierMult[0]))));
    affixes.push({
      id: candidate.id,
      type: candidate.type,
      stat: candidate.stat,
      label: candidate.label,
      value: finalVal,
      name: candidate.name,
    });
    preferPrefix = !preferPrefix;
  }
  return affixes;
}

// === DISPLAY HELPERS ===

const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
export function ilvlToRoman(n){ return ROMAN[n] || String(n); }

/**
 * Compose le nom affiché : préfixe + nom de base + suffixe
 * Ex: "Tranchante Épée de Fer de Vigueur"
 */
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

/**
 * Liste de stats à afficher (implicit + affixes + base damage si arme)
 * Retourne [{label, value, kind}] kind = 'base'|'implicit'|'prefix'|'suffix'
 */
export function describeItemStats(rolledItem){
  const tpl = getItem(rolledItem.itemId);
  if(!tpl) return [];
  const lines = [];

  // Base damage (pour weapons)
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

  // Implicit (pour armures)
  if(rolledItem.implicit){
    lines.push({
      label: rolledItem.implicit.label?.replace('X', '').trim() || rolledItem.implicit.id,
      value: rolledItem.implicit.value,
      kind: 'implicit',
    });
  }

  // Passives (pour rings)
  if(tpl.passive){
    Object.entries(tpl.passive).forEach(([k, v]) => {
      lines.push({ label: k, value: v, kind: 'implicit' });
    });
  }

  // Spell (pour amulets)
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
