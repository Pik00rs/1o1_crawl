// src/js/loot/generator.js
// Générateur de loot simple (placeholder, à enrichir Phase 2).

const POSSIBLE_LOOTS = [
  { name: 'Dague Rouillée', icon: '🗡️', rarity: 'common', desc: '8-12 perforants' },
  { name: 'Anneau de Vigueur', icon: '💍', rarity: 'magic', desc: '+5 PV max' },
  { name: 'Casque Gobelin', icon: '⛑️', rarity: 'common', desc: '+3 armure' },
  { name: 'Potion de Soin', icon: '🧪', rarity: 'common', desc: 'Restaure 15 PV' },
  { name: 'Bracelet du Sang', icon: '📿', rarity: 'rare', desc: '+10% Saignement, +1 AP' },
  { name: 'Grimoire Mineur', icon: '📕', rarity: 'magic', desc: 'Octroie Éclair de Glace' },
];

export function rollLoot() {
  const n = 1 + Math.floor(Math.random() * 3);
  const loot = [];
  for (let i = 0; i < n; i++) {
    loot.push(POSSIBLE_LOOTS[Math.floor(Math.random() * POSSIBLE_LOOTS.length)]);
  }
  return loot;
}
