// src/js/items/item-roller.js
// Système de roll d'items à partir des JSON catalog.
// Source de vérité : src/data/{weapons,armor,amulets,rings,legendaries,affixes,forge-config}.json

let _catalog = null;
let _affixes = null;
let _forgeConfig = null;

const ILVL_MULT = {
  1: 0.50, 2: 0.65, 3: 0.80, 4: 0.95, 5: 1.00,
  6: 1.15, 7: 1.30, 8: 1.50, 9: 1.75, 10: 2.10,
};

const RARITY_AFFIX_COUNT = {
  common:    [0, 0],
  magic:     [1, 2],
  rare:      [2, 3],
  epic:      [3, 4],
  legendary: [4, 4],
  set:       [2, 3],
};

const TIER_RANGE_MULT = {
  common:    [0.5, 0.8],
  magic:     [0.6, 1.0],
  rare:      [0.8, 1.3],
  epic:      [1.0, 1.6],
  legendary: [1.3, 2.0],
  set:       [0.9, 1.4],
};

const FAVORED_TAGS_BY_BIOME = {
  inferno: ['Fire', 'Stun', 'Rage'],
  cryo:    ['Ice', 'Slow', 'Shield'],
  toxic:   ['Poison', 'Bleed', 'Lifesteal'],
  voidnet: ['Shock', 'Crit', 'Echo'],
  crimson: ['Bleed', 'Execute', 'Crit'],
};

// ============================================================
// CHARGEMENT (asynchrone, à appeler une fois au boot)
// ============================================================

export async function loadItemCatalog(){
  if(_catalog && _affixes) return _catalog;

  const fetchJson = async (path) => {
    const res = await fetch(path);
    if(!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`);
    return res.json();
  };

  const [weapons, armor, amulets, rings, legendaries, affixes, forgeConfig] = await Promise.all([
    fetchJson('/src/data/weapons.json'),
    fetchJson('/src/data/armor.json'),
    fetchJson('/src/data/amulets.json'),
    fetchJson('/src/data/rings.json'),
    fetchJson('/src/data/legendaries.json'),
    fetchJson('/src/data/affixes.json'),
    fetchJson('/src/data/forge-config.json'),
  ]);

  const stripMeta = (obj) => {
    const out = {};
    for(const k of Object.keys(obj)){
      if(k.startsWith('_')) continue;
      out[k] = obj[k];
    }
    return out;
  };

  _catalog = {
    weapons: stripMeta(weapons),
    armor: stripMeta(armor),
    amulets: stripMeta(amulets),
    rings: stripMeta(rings),
    legendaries: stripMeta(legendaries),
  };
  _affixes = {
    prefixes: stripMeta(affixes.prefixes || {}),
    suffixes: stripMeta(affixes.suffixes || {}),
  };
  _forgeConfig = forgeConfig;

  return _catalog;
}

export function getCatalog(){ return _catalog; }
export function getAffixesPool(){ return _affixes; }
export function getForgeConfig(){ return _forgeConfig; }

// ============================================================
// HELPERS
// ============================================================

function rollInt(rng, min, max){ return Math.floor(rng() * (max - min + 1)) + min; }

export function mulberry32(seed){
  let s = seed | 0;
  return function(){
    s = (s + 0x6D2B79F5) | 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ============================================================
// LOOKUP
// ============================================================

export function getCatalogEntry(baseId){
  if(!_catalog) return null;
  const catMap = { weapons: 'weapon', armor: 'armor', amulets: 'amulet', rings: 'ring', legendaries: 'legendary' };
  for(const plural of Object.keys(catMap)){
    if(_catalog[plural] && _catalog[plural][baseId]){
      return { cat: catMap[plural], entry: _catalog[plural][baseId] };
    }
  }
  return null;
}

// 'weapon1H' | 'weapon2H' → 'mainhand'
function normalizeSlot(catalogSlot){
  if(catalogSlot === 'weapon1H' || catalogSlot === 'weapon2H') return 'mainhand';
  return catalogSlot;
}

export function listBaseIds(cat){
  if(!_catalog) return [];
  const map = { weapon: 'weapons', armor: 'armor', amulet: 'amulets', ring: 'rings', legendary: 'legendaries' };
  const k = map[cat];
  return k ? Object.keys(_catalog[k]) : [];
}

export function pickRandomBaseId(rng, opts = {}){
  if(!_catalog) return null;
  rng = rng || Math.random;
  const pool = [];
  const cats = opts.cat ? [opts.cat] : ['weapon', 'armor', 'amulet', 'ring'];
  for(const c of cats){
    const ids = listBaseIds(c);
    for(const id of ids){
      const lookup = getCatalogEntry(id);
      if(!lookup) continue;
      if(opts.slot && normalizeSlot(lookup.entry.slot) !== opts.slot) continue;
      pool.push(id);
    }
  }
  if(pool.length === 0) return null;
  return pool[Math.floor(rng() * pool.length)];
}

// ============================================================
// ROLL ITEM
// ============================================================

export function rollItem(opts){
  if(!_catalog || !_affixes) throw new Error('Catalog not loaded. Call loadItemCatalog() first.');
  const rng = opts.rng || Math.random;
  const { baseId, rarity = 'common', ilvl = 1, biomeId = null, isBossDrop = false } = opts;

  const lookup = getCatalogEntry(baseId);
  if(!lookup) throw new Error(`Unknown baseId: ${baseId}`);
  const { cat, entry } = lookup;

  const item = {
    instanceId: `${Date.now()}_${Math.floor(rng() * 1e9).toString(36)}`,
    baseId,
    cat,
    slot: normalizeSlot(entry.slot),
    name: entry.name,
    icon: entry.icon,
    rarity,
    ilvl: Math.max(1, Math.min(10, ilvl | 0)),
    biomeId,
    isBossDrop,
    droppedAt: Date.now(),
    affixes: [],
    tags: Array.isArray(entry.tags) ? [...entry.tags] : [],
  };

  switch(cat){
    case 'weapon':
      item.baseDamage = entry.damage || [1, 1];
      item.baseDamageType = entry.damageType || 'slash';
      item.range = entry.range || 1;
      item.weaponSlot = entry.slot;
      if(entry.lightAttack) item.lightAttack = entry.lightAttack;
      if(entry.heavyAttack) item.heavyAttack = entry.heavyAttack;
      break;
    case 'armor':
      if(entry.implicit){
        const ilvlMult = ILVL_MULT[item.ilvl] || 1.0;
        const [vMin, vMax] = entry.implicit.valueRange;
        const value = Math.round(rollInt(rng, vMin, vMax) * ilvlMult);
        item.implicit = {
          id: entry.implicit.id,
          label: (entry.implicit.label || '').replace(/X/, String(value)),
          rawLabel: entry.implicit.label,
          value,
        };
      }
      break;
    case 'amulet':
      item.grantedSpell = entry.spell;
      break;
    case 'ring':
      item.passive = entry.passive ? { ...entry.passive } : null;
      break;
    case 'legendary':
      item.uniqueModifier = entry.uniqueModifier;
      item.modifierId = entry.modifierId;
      if(entry.grantedSpell) item.grantedSpell = entry.grantedSpell;
      if(entry.slot) item.slot = entry.slot;
      else if(entry.type === 'weapon') item.slot = 'mainhand';
      break;
  }

  item.affixes = rollAffixes(rng, item, rarity, item.ilvl, biomeId);

  // Tags supplémentaires depuis les affixes
  for(const aff of item.affixes){
    if(aff.tags){
      for(const t of aff.tags){
        if(!item.tags.includes(t)) item.tags.push(t);
      }
    }
  }

  return item;
}

// ============================================================
// AFFIX ROLLING
// ============================================================

function rollAffixes(rng, item, rarity, ilvl, biomeId){
  const range = RARITY_AFFIX_COUNT[rarity] || [0, 0];
  const count = rollInt(rng, range[0], range[1]);
  if(count === 0) return [];

  const itemSlot = item.slot;
  const eligiblePrefixes = Object.values(_affixes.prefixes).filter(a =>
    !a.validSlots || a.validSlots.length === 0 || a.validSlots.includes(itemSlot)
  );
  const eligibleSuffixes = Object.values(_affixes.suffixes).filter(a =>
    !a.validSlots || a.validSlots.length === 0 || a.validSlots.includes(itemSlot)
  );

  const result = [];
  const usedIds = new Set();
  const usedStats = new Set();

  const favoredTags = biomeId ? (FAVORED_TAGS_BY_BIOME[biomeId] || []) : [];

  function pickWeighted(pool){
    const weights = pool.map(a => {
      let w = 1;
      if(a.tags && favoredTags.length > 0){
        if(a.tags.some(t => favoredTags.includes(t))) w *= 3;
      }
      if(a.biome && a.biome === biomeId) w *= 2;
      return w;
    });
    const total = weights.reduce((s, x) => s + x, 0);
    let r = rng() * total;
    for(let i = 0; i < pool.length; i++){
      r -= weights[i];
      if(r <= 0) return pool[i];
    }
    return pool[pool.length - 1];
  }

  const MAX_PER_TYPE = 3;
  let prefixCount = 0, suffixCount = 0;

  for(let i = 0; i < count; i++){
    const wantPrefix = (prefixCount < MAX_PER_TYPE) && (suffixCount >= MAX_PER_TYPE || rng() < 0.5);
    const primary = wantPrefix
      ? eligiblePrefixes.filter(a => !usedIds.has(a.id) && !usedStats.has(a.stat))
      : eligibleSuffixes.filter(a => !usedIds.has(a.id) && !usedStats.has(a.stat));

    let chosen, chosenIsPrefix;
    if(primary.length > 0){
      chosen = pickWeighted(primary);
      chosenIsPrefix = wantPrefix;
    } else {
      const alt = wantPrefix
        ? eligibleSuffixes.filter(a => !usedIds.has(a.id) && !usedStats.has(a.stat))
        : eligiblePrefixes.filter(a => !usedIds.has(a.id) && !usedStats.has(a.stat));
      if(alt.length === 0) break;
      chosen = pickWeighted(alt);
      chosenIsPrefix = !wantPrefix;
    }

    result.push(buildAffixRoll(rng, chosen, rarity, ilvl));
    usedIds.add(chosen.id);
    usedStats.add(chosen.stat);
    if(chosenIsPrefix) prefixCount++; else suffixCount++;
  }

  // Sort : prefixes d'abord, suffixes après
  result.sort((a, b) => {
    if(a.type === b.type) return 0;
    return a.type === 'prefix' ? -1 : 1;
  });

  return result;
}

function buildAffixRoll(rng, affixDef, rarity, ilvl){
  const value = rollAffixValue(rng, affixDef.valueRange, rarity, ilvl);
  const label = (affixDef.label || '').replace(/X/, String(value));
  return {
    id: affixDef.id,
    type: affixDef.type,
    name: affixDef.name,
    stat: affixDef.stat,
    label,
    value,
    tags: Array.isArray(affixDef.tags) ? [...affixDef.tags] : [],
  };
}

function rollAffixValue(rng, valueRange, rarity, ilvl){
  if(!Array.isArray(valueRange) || valueRange.length !== 2) return 0;
  const [baseMin, baseMax] = valueRange;
  const baseValue = baseMin + rng() * (baseMax - baseMin);
  const ilvlMult = ILVL_MULT[ilvl] || 1.0;
  const tierRange = TIER_RANGE_MULT[rarity] || [1.0, 1.0];
  const tierMult = tierRange[0] + rng() * (tierRange[1] - tierRange[0]);
  const finalValue = baseValue * ilvlMult * tierMult;
  return Math.max(1, Math.round(finalValue));
}
