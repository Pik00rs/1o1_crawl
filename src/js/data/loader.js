// src/js/data/loader.js
// Charge tous les fichiers JSON de data en mémoire.
export const DATA = {
  weapons: {}, armor: {},
  amulets: {}, rings: {}, accessories: {},  // accessories = merge des deux pour rétrocompat
  spells: {}, statuses: {}, enemies: {},
  rooms: {}, affixes: {},
  legendaries: {}, sets: {}, biomes: {}, combos: {}, forgeConfig: {},
};

const FILES = [
  ['weapons', './src/data/weapons.json'],
  ['armor', './src/data/armor.json'],
  ['amulets', './src/data/amulets.json'],
  ['rings', './src/data/rings.json'],
  ['spells', './src/data/spells.json'],
  ['statuses', './src/data/statuses.json'],
  ['enemies', './src/data/enemies.json'],
  ['rooms', './src/data/rooms.json'],
  ['affixes', './src/data/affixes.json'],
  ['legendaries', './src/data/legendaries.json'],
  ['sets', './src/data/sets.json'],
  ['biomes', './src/data/biomes.json'],
  ['combos', './src/data/combos.json'],
  ['forgeConfig', './src/data/forge-config.json'],
];

export async function loadAllData() {
  await Promise.all(FILES.map(async ([k, path]) => {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`Failed to load ${path}`);
    DATA[k] = await res.json();
  }));
  // Fusion : accessories = amulets + rings (rétrocompatibilité avec l'ancien code)
  DATA.accessories = { ...DATA.amulets, ...DATA.rings };
  return DATA;
}

export function getItem(id) {
  return DATA.weapons[id] || DATA.armor[id] || DATA.accessories[id];
}
export function getSpell(id) { return DATA.spells[id]; }
export function getStatus(id) { return DATA.statuses[id]; }
export function getEnemy(id) { return DATA.enemies[id]; }
export function getRoom(id) { return DATA.rooms[id]; }
export function getLegendary(id) { return DATA.legendaries[id]; }
export function getSet(id) { return DATA.sets[id]; }
export function getBiome(id) { return DATA.biomes[id]; }