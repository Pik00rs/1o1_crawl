// src/dashboard/ascension-data.js
// Données mockées pour la page Ascension.
// 5 biomes × 6 donjons = 30 donjons au total.
// Schéma : biome → tier → 6 dungeons → loot pool + enemies.

// === ITEMS POOL (référentiel central) ===
// Chaque item a un id, un nom, une catégorie, un slot, une icône.
// Les ranges de stats sont définis par donjon (le même item à dungeon 1 vs 6 a des stats différentes).
export const ITEM_TEMPLATES = {
  // === WEAPONS ===
  // Inferno
  flame_axe:       { name: 'Hache Embrasée',     cat: 'weapon', slot: 'mainhand', icon: '🪓', dmgType: 'slash' },
  ember_blade:     { name: 'Lame de Cendres',    cat: 'weapon', slot: 'mainhand', icon: '🗡', dmgType: 'slash' },
  forge_hammer:    { name: 'Marteau de Forge',   cat: 'weapon', slot: 'mainhand', icon: '🔨', dmgType: 'blunt' },
  pyro_staff:      { name: 'Bâton Pyromancien',  cat: 'weapon', slot: 'mainhand', icon: '🔥', dmgType: 'fire' },
  magma_gauntlet:  { name: 'Gantelet Magmatique',cat: 'weapon', slot: 'mainhand', icon: '👊', dmgType: 'fire' },

  // Cryo
  frost_blade:     { name: 'Lame Givrée',        cat: 'weapon', slot: 'mainhand', icon: '🗡', dmgType: 'slash' },
  glacier_axe:     { name: 'Hache Glaciaire',    cat: 'weapon', slot: 'mainhand', icon: '🪓', dmgType: 'slash' },
  ice_spear:       { name: 'Lance de Glace',     cat: 'weapon', slot: 'mainhand', icon: '🔱', dmgType: 'pierce' },
  rime_staff:      { name: 'Bâton de Givre',     cat: 'weapon', slot: 'mainhand', icon: '❄', dmgType: 'cold' },

  // Toxic
  bone_dagger:     { name: 'Dague d\'Os',        cat: 'weapon', slot: 'mainhand', icon: '🗡', dmgType: 'pierce' },
  spore_whip:      { name: 'Fouet de Spores',    cat: 'weapon', slot: 'mainhand', icon: '〰', dmgType: 'poison' },
  acid_claws:      { name: 'Griffes Acides',     cat: 'weapon', slot: 'mainhand', icon: '🦴', dmgType: 'poison' },
  rotten_flail:    { name: 'Fléau Putride',      cat: 'weapon', slot: 'mainhand', icon: '⚒', dmgType: 'blunt' },

  // Voidnet
  data_blade:      { name: 'Lame de Données',    cat: 'weapon', slot: 'mainhand', icon: '⚔', dmgType: 'shock' },
  cipher_pistol:   { name: 'Pistolet Cipher',    cat: 'weapon', slot: 'mainhand', icon: '🔫', dmgType: 'shock' },
  null_staff:      { name: 'Bâton du Nul',       cat: 'weapon', slot: 'mainhand', icon: '⚡', dmgType: 'shock' },
  glitch_dagger:   { name: 'Dague Glitchée',     cat: 'weapon', slot: 'mainhand', icon: '🗡', dmgType: 'pierce' },

  // Crimson
  rusty_cleaver:   { name: 'Couperet Rouillé',   cat: 'weapon', slot: 'mainhand', icon: '🪓', dmgType: 'slash' },
  gladius:         { name: 'Gladius',            cat: 'weapon', slot: 'mainhand', icon: '🗡', dmgType: 'slash' },
  blood_axe:       { name: 'Hache Sanglante',    cat: 'weapon', slot: 'mainhand', icon: '🪓', dmgType: 'slash' },
  arena_spear:     { name: 'Lance d\'Arène',     cat: 'weapon', slot: 'mainhand', icon: '🔱', dmgType: 'pierce' },
  hooked_chain:    { name: 'Chaîne Crochetée',   cat: 'weapon', slot: 'mainhand', icon: '⛓', dmgType: 'pierce' },

  // === ARMOR ===
  forge_plate:     { name: 'Plastron de Forge',   cat: 'armor', slot: 'chest', icon: '🛡' },
  ember_robe:      { name: 'Robe Cendrée',        cat: 'armor', slot: 'chest', icon: '👘' },
  frost_mail:      { name: 'Cotte Givrée',        cat: 'armor', slot: 'chest', icon: '🛡' },
  glacier_plate:   { name: 'Plastron Glaciaire',  cat: 'armor', slot: 'chest', icon: '🛡' },
  bone_armor:      { name: 'Armure d\'Os',        cat: 'armor', slot: 'chest', icon: '🦴' },
  spore_cloak:     { name: 'Cape de Spores',      cat: 'armor', slot: 'chest', icon: '👘' },
  data_vest:       { name: 'Veste de Données',    cat: 'armor', slot: 'chest', icon: '🦺' },
  null_robe:       { name: 'Robe du Nul',         cat: 'armor', slot: 'chest', icon: '👘' },
  arena_cuirass:   { name: 'Cuirasse d\'Arène',   cat: 'armor', slot: 'chest', icon: '🛡' },
  butcher_apron:   { name: 'Tablier du Boucher',  cat: 'armor', slot: 'chest', icon: '🥩' },

  // === HELMETS ===
  forge_helm:      { name: 'Heaume de Forge',     cat: 'helm', slot: 'head', icon: '⛑' },
  frost_hood:      { name: 'Capuche Givrée',      cat: 'helm', slot: 'head', icon: '🪖' },
  bone_mask:       { name: 'Masque d\'Os',        cat: 'helm', slot: 'head', icon: '💀' },
  data_visor:      { name: 'Visière de Données',  cat: 'helm', slot: 'head', icon: '🥽' },
  gladiator_helm:  { name: 'Casque Gladiateur',   cat: 'helm', slot: 'head', icon: '⛑' },

  // === ACCESSORIES ===
  ember_ring:      { name: 'Anneau de Braises',   cat: 'accessory', slot: 'ring', icon: '💍' },
  frost_amulet:    { name: 'Amulette Givrée',     cat: 'accessory', slot: 'neck', icon: '📿' },
  spore_pouch:     { name: 'Bourse à Spores',     cat: 'accessory', slot: 'belt', icon: '👝' },
  data_chip:       { name: 'Puce de Données',     cat: 'accessory', slot: 'ring', icon: '💾' },
  blood_pendant:   { name: 'Pendentif Sanglant',  cat: 'accessory', slot: 'neck', icon: '🩸' },

  // === CONSUMABLES ===
  health_vial:     { name: 'Fiole de Soin',       cat: 'consumable', slot: 'inv', icon: '🧪' },
  ember_charge:    { name: 'Charge de Braise',    cat: 'consumable', slot: 'inv', icon: '🔥' },
  frost_charge:    { name: 'Charge Glacée',       cat: 'consumable', slot: 'inv', icon: '❄' },
  spore_bomb:      { name: 'Bombe à Spores',      cat: 'consumable', slot: 'inv', icon: '💣' },
  data_packet:     { name: 'Paquet de Données',   cat: 'consumable', slot: 'inv', icon: '📦' },
  blood_vial:      { name: 'Fiole de Sang',       cat: 'consumable', slot: 'inv', icon: '🩸' },
};

// === RARITY ===
export const RARITIES = {
  common:    { label: 'Commun',    color: '#a89878', textColor: '#fff', weight: 1.0 },
  uncommon:  { label: 'Inhabituel',color: '#3df068', textColor: '#fff', weight: 0.7 },
  rare:      { label: 'Rare',      color: '#3d9cf0', textColor: '#fff', weight: 0.4 },
  epic:      { label: 'Épique',    color: '#c040ff', textColor: '#fff', weight: 0.15 },
  legendary: { label: 'Légendaire',color: '#ffaa20', textColor: '#fff', weight: 0.05 },
};

// === BIOMES ===
export const BIOMES = {
  inferno: {
    id: 'inferno',
    name: 'Inferno',
    subtitle: 'Forges Damnées',
    color: '#c83820',
    colorDark: '#5a1a08',
    colorLight: '#ff8830',
    accent: '#ffd060',
    icon: '🔥',
    resource: { id: 'ember', name: 'Braise', icon: '🔥', color: '#ff8830' },
    lootFavored: 'weapons',
    description: 'Forges en feu, mineurs damnés, dragons de magma. Spécialise dans les armes de feu et les marteaux.',
  },
  cryo: {
    id: 'cryo',
    name: 'Cryo',
    subtitle: 'Étendues Gelées',
    color: '#3da0d0',
    colorDark: '#1a4858',
    colorLight: '#a8d8e8',
    accent: '#e0f8ff',
    icon: '❄',
    resource: { id: 'frost', name: 'Givre', icon: '❄', color: '#a8d8e8' },
    lootFavored: 'armor',
    description: 'Glaciers infinis, bêtes givrées, gardiens silencieux. Spécialise dans les armures et la défense.',
  },
  toxic: {
    id: 'toxic',
    name: 'Toxic',
    subtitle: 'Marais Putrides',
    color: '#7fc844',
    colorDark: '#3a5818',
    colorLight: '#a8e065',
    accent: '#c040ff',
    icon: '☣',
    resource: { id: 'spore', name: 'Spore', icon: '🍄', color: '#a8e065' },
    lootFavored: 'consumables',
    description: 'Marais empoisonnés, créatures mutées, alpha de la meute. Spécialise dans les consommables et poisons.',
  },
  voidnet: {
    id: 'voidnet',
    name: 'Voidnet',
    subtitle: 'Réseau Brisé',
    color: '#3df0ff',
    colorDark: '#1a4858',
    colorLight: '#88ffff',
    accent: '#c040ff',
    icon: '⚡',
    resource: { id: 'datum', name: 'Datum', icon: '💾', color: '#3df0ff' },
    lootFavored: 'accessories',
    description: 'Code corrompu, daemons sentients, le vide cosmique. Spécialise dans les accessoires et la tech.',
  },
  crimson: {
    id: 'crimson',
    name: 'Crimson',
    subtitle: 'Arène Sanglante',
    color: '#a02828',
    colorDark: '#5a0808',
    colorLight: '#e84040',
    accent: '#c8a040',
    icon: '🩸',
    resource: { id: 'blood', name: 'Sang', icon: '🩸', color: '#c82828' },
    lootFavored: 'helms',
    description: 'Arènes brutales, gladiateurs, bouchers. Spécialise dans les casques et armes de mêlée.',
  },
};

// === DUNGEONS GENERATOR ===
// Helper : ajuster les stats selon le level (plus haut = stats plus fortes)
function scaleStats(base, level){
  const mult = 1 + (level - 1) * 0.18; // +18% par level
  return [Math.round(base[0] * mult), Math.round(base[1] * mult)];
}

// Pool de loot par biome × level. La rareté augmente avec le level.
function makeLootPool(biome, level){
  const pools = {
    inferno: [
      { itemId: 'flame_axe',      rarity: 'common',   weight: 50, statRanges: { dmg: scaleStats([10, 16], level), armor: [0, 0] } },
      { itemId: 'ember_blade',    rarity: 'uncommon', weight: 30, statRanges: { dmg: scaleStats([14, 20], level) } },
      { itemId: 'forge_hammer',   rarity: 'uncommon', weight: 25, statRanges: { dmg: scaleStats([16, 22], level), stun: [10, 20] } },
      { itemId: 'pyro_staff',     rarity: 'rare',     weight: 12, statRanges: { dmg: scaleStats([18, 26], level), burn: [15, 25] } },
      { itemId: 'magma_gauntlet', rarity: 'rare',     weight: 10, statRanges: { dmg: scaleStats([20, 28], level), burn: [20, 30] } },
      { itemId: 'forge_plate',    rarity: 'common',   weight: 30, statRanges: { armor: scaleStats([4, 7], level) } },
      { itemId: 'ember_robe',     rarity: 'uncommon', weight: 18, statRanges: { armor: scaleStats([3, 5], level), fireRes: [10, 20] } },
      { itemId: 'forge_helm',     rarity: 'common',   weight: 22, statRanges: { armor: scaleStats([2, 4], level) } },
      { itemId: 'ember_ring',     rarity: 'rare',     weight: 8, statRanges: { fireRes: [15, 30], dmg: scaleStats([2, 5], level) } },
      { itemId: 'health_vial',    rarity: 'common',   weight: 35, statRanges: { heal: [20, 30] } },
      { itemId: 'ember_charge',   rarity: 'uncommon', weight: 15, statRanges: { charge: [1, 3] } },
    ],
    cryo: [
      { itemId: 'frost_blade',    rarity: 'common',   weight: 40, statRanges: { dmg: scaleStats([10, 14], level), slow: [10, 20] } },
      { itemId: 'glacier_axe',    rarity: 'uncommon', weight: 25, statRanges: { dmg: scaleStats([14, 20], level), freeze: [10, 20] } },
      { itemId: 'ice_spear',      rarity: 'uncommon', weight: 22, statRanges: { dmg: scaleStats([12, 18], level), pierce: [15, 25] } },
      { itemId: 'rime_staff',     rarity: 'rare',     weight: 10, statRanges: { dmg: scaleStats([16, 22], level), freeze: [25, 40] } },
      { itemId: 'frost_mail',     rarity: 'uncommon', weight: 32, statRanges: { armor: scaleStats([5, 9], level), coldRes: [15, 25] } },
      { itemId: 'glacier_plate',  rarity: 'rare',     weight: 14, statRanges: { armor: scaleStats([8, 12], level), coldRes: [25, 40] } },
      { itemId: 'frost_hood',     rarity: 'common',   weight: 28, statRanges: { armor: scaleStats([2, 4], level), coldRes: [10, 20] } },
      { itemId: 'frost_amulet',   rarity: 'rare',     weight: 9, statRanges: { coldRes: [30, 50], hp: [10, 20] } },
      { itemId: 'health_vial',    rarity: 'common',   weight: 30, statRanges: { heal: [20, 30] } },
      { itemId: 'frost_charge',   rarity: 'uncommon', weight: 18, statRanges: { charge: [1, 3] } },
    ],
    toxic: [
      { itemId: 'bone_dagger',    rarity: 'common',   weight: 35, statRanges: { dmg: scaleStats([8, 13], level), bleed: [15, 25] } },
      { itemId: 'spore_whip',     rarity: 'uncommon', weight: 25, statRanges: { dmg: scaleStats([10, 16], level), poison: [20, 30] } },
      { itemId: 'acid_claws',     rarity: 'rare',     weight: 12, statRanges: { dmg: scaleStats([12, 18], level), poison: [30, 45] } },
      { itemId: 'rotten_flail',   rarity: 'uncommon', weight: 18, statRanges: { dmg: scaleStats([14, 20], level), stun: [15, 25] } },
      { itemId: 'bone_armor',     rarity: 'common',   weight: 28, statRanges: { armor: scaleStats([3, 6], level), poisonRes: [10, 20] } },
      { itemId: 'spore_cloak',    rarity: 'rare',     weight: 11, statRanges: { armor: scaleStats([2, 4], level), poisonRes: [30, 50] } },
      { itemId: 'bone_mask',      rarity: 'uncommon', weight: 20, statRanges: { armor: scaleStats([2, 4], level), poisonRes: [15, 25] } },
      { itemId: 'spore_pouch',    rarity: 'rare',     weight: 8, statRanges: { invSlots: [1, 2], poison: [10, 20] } },
      { itemId: 'health_vial',    rarity: 'common',   weight: 40, statRanges: { heal: [20, 30] } },
      { itemId: 'spore_bomb',     rarity: 'uncommon', weight: 28, statRanges: { dmg: scaleStats([15, 25], level), aoe: [2, 3] } },
    ],
    voidnet: [
      { itemId: 'data_blade',     rarity: 'common',   weight: 35, statRanges: { dmg: scaleStats([9, 14], level), shock: [15, 25] } },
      { itemId: 'cipher_pistol',  rarity: 'uncommon', weight: 22, statRanges: { dmg: scaleStats([11, 17], level), range: [4, 6] } },
      { itemId: 'null_staff',     rarity: 'rare',     weight: 13, statRanges: { dmg: scaleStats([14, 20], level), shock: [30, 45] } },
      { itemId: 'glitch_dagger',  rarity: 'rare',     weight: 11, statRanges: { dmg: scaleStats([12, 18], level), crit: [15, 25] } },
      { itemId: 'data_vest',      rarity: 'common',   weight: 25, statRanges: { armor: scaleStats([3, 5], level), shockRes: [10, 20] } },
      { itemId: 'null_robe',      rarity: 'rare',     weight: 12, statRanges: { armor: scaleStats([2, 4], level), shockRes: [25, 40] } },
      { itemId: 'data_visor',     rarity: 'uncommon', weight: 20, statRanges: { armor: scaleStats([2, 3], level), crit: [10, 20] } },
      { itemId: 'data_chip',      rarity: 'rare',     weight: 14, statRanges: { shockRes: [20, 35], dmg: scaleStats([3, 6], level) } },
      { itemId: 'health_vial',    rarity: 'common',   weight: 28, statRanges: { heal: [20, 30] } },
      { itemId: 'data_packet',    rarity: 'uncommon', weight: 18, statRanges: { reroll: [1, 2] } },
    ],
    crimson: [
      { itemId: 'rusty_cleaver',  rarity: 'common',   weight: 40, statRanges: { dmg: scaleStats([11, 17], level), bleed: [20, 30] } },
      { itemId: 'gladius',        rarity: 'uncommon', weight: 25, statRanges: { dmg: scaleStats([13, 19], level), crit: [10, 20] } },
      { itemId: 'blood_axe',      rarity: 'rare',     weight: 12, statRanges: { dmg: scaleStats([18, 26], level), bleed: [30, 45] } },
      { itemId: 'arena_spear',    rarity: 'uncommon', weight: 18, statRanges: { dmg: scaleStats([12, 18], level), pierce: [20, 30] } },
      { itemId: 'hooked_chain',   rarity: 'rare',     weight: 9, statRanges: { dmg: scaleStats([10, 16], level), pull: [2, 4] } },
      { itemId: 'arena_cuirass',  rarity: 'uncommon', weight: 22, statRanges: { armor: scaleStats([5, 8], level), bleedRes: [15, 25] } },
      { itemId: 'butcher_apron',  rarity: 'rare',     weight: 8, statRanges: { armor: scaleStats([4, 6], level), bleed: [20, 30] } },
      { itemId: 'gladiator_helm', rarity: 'rare',     weight: 14, statRanges: { armor: scaleStats([4, 6], level), block: [15, 25] } },
      { itemId: 'blood_pendant',  rarity: 'rare',     weight: 10, statRanges: { lifesteal: [15, 25], hp: [15, 25] } },
      { itemId: 'health_vial',    rarity: 'common',   weight: 30, statRanges: { heal: [20, 30] } },
      { itemId: 'blood_vial',     rarity: 'uncommon', weight: 18, statRanges: { lifesteal: [10, 20] } },
    ],
  };
  // Filtre : pour les donjons bas niveau, on retire les loots trop rares
  const pool = pools[biome];
  if(level <= 2){
    return pool.filter(p => ['common', 'uncommon'].includes(p.rarity)).map(p => ({...p}));
  }
  if(level <= 4){
    return pool.filter(p => p.rarity !== 'epic' && p.rarity !== 'legendary').map(p => ({...p}));
  }
  return pool.map(p => ({...p}));
}

// === DUNGEON STRUCTURE ===
// Génère 6 donjons par biome.
function makeDungeon(biomeId, level, dungeonName){
  const enemyMap = {
    inferno: ['inferno_brute', 'inferno_archer', 'inferno_caster', 'inferno_charger', 'inferno_engineer', 'inferno_berserker'],
    cryo:    ['cryo_brute', 'cryo_archer', 'cryo_caster', 'cryo_skater', 'cryo_shielder', 'cryo_sentinel'],
    toxic:   ['toxic_brute', 'toxic_spitter', 'toxic_swarmer', 'toxic_carrier', 'toxic_grafted', 'toxic_alpha'],
    voidnet: ['voidnet_glitch', 'voidnet_daemon', 'voidnet_executor', 'voidnet_corrupter', 'voidnet_replicator', 'voidnet_overclocked'],
    crimson: ['crimson_brawler', 'crimson_butcher', 'crimson_throwblade', 'crimson_hooked', 'crimson_doctor', 'crimson_gladiator'],
  };
  const minibossMap = {
    inferno: 'inferno_minibossDrone',
    cryo:    'cryo_minibossWarden',
    toxic:   'toxic_minibossSpore',
    voidnet: 'voidnet_minibossKernel',
    crimson: 'crimson_minibossExecutioner',
  };
  const bossMap = {
    inferno: 'inferno_boss',
    cryo:    'cryo_boss',
    toxic:   'toxic_boss',
    voidnet: 'voidnet_boss',
    crimson: 'crimson_boss',
  };

  const allEnemies = enemyMap[biomeId];
  // Plus le level monte, plus on a de variété d'ennemis et plus le pool inclut d'élites
  const enemyTypeCount = Math.min(2 + Math.floor(level / 2), allEnemies.length);
  const enemyTypes = allEnemies.slice(0, enemyTypeCount);

  // Élite à partir du level 3, miniboss au 5, boss au 6
  const hasElite = level >= 3;
  const hasMiniboss = level >= 5;
  const hasBoss = level === 6;

  if(hasElite){
    enemyTypes.push(allEnemies[5]); // élite (berserker, sentinel, alpha, overclocked, gladiator)
  }
  if(hasMiniboss){
    enemyTypes.push(minibossMap[biomeId]);
  }
  if(hasBoss){
    enemyTypes.push(bossMap[biomeId]);
  }

  return {
    level,
    name: dungeonName,
    rooms: 4 + level, // 5 → 10 pièces
    enemyCount: { min: 6 + level * 2, max: 10 + level * 3 },
    enemyTypes,
    hasElite,
    hasMiniboss,
    hasBoss,
    lootCount: { min: 2 + Math.floor(level / 2), max: 3 + level },
    resourceDrop: { min: 4 + level * 2, max: 8 + level * 3 },
    lootPool: makeLootPool(biomeId, level),
  };
}

// === DUNGEON NAMES PER BIOME ===
const DUNGEON_NAMES = {
  inferno: ['Galeries de Cendres', 'Forge Engloutie', 'Veine de Magma', 'Atelier Damné', 'Crypte Ardente', 'Cœur de la Forge'],
  cryo:    ['Plaines Givrées', 'Cavernes Glacées', 'Citadelle de Glace', 'Crypte Cristalline', 'Tour du Gardien', 'Trône Glaciaire'],
  toxic:   ['Marécages Pourris', 'Bois Putrides', 'Nid Mycotique', 'Charnier Vivant', 'Antre de la Meute', 'Cathédrale Putréfiée'],
  voidnet: ['Secteur Corrompu', 'Réseau Brisé', 'Datacenter Mort', 'Pile Glitchée', 'Sous-Noyau', 'Architecte du Vide'],
  crimson: ['Fosses de Sable', 'Cellules Sanglantes', 'Arène Mineure', 'Chambres du Boucher', 'Loge de l\'Exécuteur', 'Grande Arène'],
};

// === BUILD ALL BIOMES TIER 1 ===
export const ASCENSION_DATA = Object.fromEntries(
  Object.keys(BIOMES).map(biomeId => [
    biomeId,
    {
      ...BIOMES[biomeId],
      tier: 1,
      unlocked: true,
      dungeons: DUNGEON_NAMES[biomeId].map((name, i) => makeDungeon(biomeId, i + 1, name)),
    },
  ])
);

// === PLAYER PROGRESS ===
// Hydraté depuis localStorage si dispo, sinon valeurs mock pour la démo.
const DEFAULT_PROGRESS = {
  inferno: { tier: 1, clearedDungeons: [] },
  cryo:    { tier: 1, clearedDungeons: [] },
  toxic:   { tier: 1, clearedDungeons: [] },
  voidnet: { tier: 1, clearedDungeons: [] },
  crimson: { tier: 1, clearedDungeons: [] },
};

function loadPlayerProgress(){
  try {
    if(typeof localStorage === 'undefined') return DEFAULT_PROGRESS;
    const raw = localStorage.getItem('rh_player_progress');
    if(!raw) return DEFAULT_PROGRESS;
    const parsed = JSON.parse(raw);
    // Merge with default to ensure all biomes are present
    const merged = { ...DEFAULT_PROGRESS };
    for(const biomeId of Object.keys(DEFAULT_PROGRESS)){
      if(parsed[biomeId]){
        merged[biomeId] = {
          tier: parsed[biomeId].tier || 1,
          clearedDungeons: Array.isArray(parsed[biomeId].clearedDungeons) ? parsed[biomeId].clearedDungeons : [],
        };
      }
    }
    return merged;
  } catch(e){
    console.error('Failed to load progress, using defaults:', e);
    return DEFAULT_PROGRESS;
  }
}

export const PLAYER_PROGRESS = loadPlayerProgress();

// Helper : statut d'un donjon
export function getDungeonStatus(biomeId, dungeonLevel){
  const progress = PLAYER_PROGRESS[biomeId];
  if(!progress) return 'locked';
  if(progress.clearedDungeons.includes(dungeonLevel)) return 'cleared';
  // Donjon disponible si c'est le 1er ou si le précédent est clean
  if(dungeonLevel === 1) return 'available';
  if(progress.clearedDungeons.includes(dungeonLevel - 1)) return 'available';
  return 'locked';
}

export default { ITEM_TEMPLATES, RARITIES, BIOMES, ASCENSION_DATA, PLAYER_PROGRESS, getDungeonStatus };
