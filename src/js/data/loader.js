// src/js/data/loader.js
// Charge tous les fichiers JSON de data en mémoire.

export const DATA = {
  weapons: {}, armor: {}, accessories: {},
  spells: {}, statuses: {}, enemies: {},
  rooms: {}, affixes: {},
};

const FILES = [
  ['weapons', './src/data/weapons.json'],
  ['armor', './src/data/armor.json'],
  ['accessories', './src/data/accessories.json'],
  ['spells', './src/data/spells.json'],
  ['statuses', './src/data/statuses.json'],
  ['enemies', './src/data/enemies.json'],
  ['rooms', './src/data/rooms.json'],
  ['affixes', './src/data/affixes.json'],
];

export async function loadAllData() {
  await Promise.all(FILES.map(async ([k, path]) => {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`Failed to load ${path}`);
    DATA[k] = await res.json();
  }));
  return DATA;
}

export function getItem(id) {
  return DATA.weapons[id] || DATA.armor[id] || DATA.accessories[id];
}
export function getSpell(id) { return DATA.spells[id]; }
export function getStatus(id) { return DATA.statuses[id]; }
export function getEnemy(id) { return DATA.enemies[id]; }
export function getRoom(id) { return DATA.rooms[id]; }
