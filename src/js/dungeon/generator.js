// src/js/dungeon/generator.js
// Génère une run de donjon à partir de la spec d'ASCENSION_DATA.
// SOURCE DE VÉRITÉ pour le contenu = ascension-data.js (rooms count, enemies)
// SOURCE DE VÉRITÉ pour le loot = weapons.json + armor.json + amulets.json + rings.json
//   (via items-catalog.js qui roll les vrais items avec affixes)

import { ASCENSION_DATA, ENEMY_NAMES } from '../../dashboard/ascension-data.js';
import {
  loadCatalog,
  getAllItems,
  rollItem,
} from '../../dashboard/items-catalog.js';

// ============================================================
// PRNG : Mulberry32 déterministe
// ============================================================

function mulberry32(seed){
  let s = seed | 0;
  return function(){
    s = (s + 0x6D2B79F5) | 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function strToSeed(str){
  let h = 0x811c9dc5;
  for(let i = 0; i < str.length; i++){
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

// ============================================================
// HELPERS
// ============================================================

function rollInt(rng, min, max){
  return Math.floor(rng() * (max - min + 1)) + min;
}

function pickRandom(rng, arr){
  if(!arr || arr.length === 0) return null;
  return arr[Math.floor(rng() * arr.length)];
}

// ============================================================
// CLASSIFICATION : déterminer si un enemyType est mob/elite/miniboss/boss
// ============================================================

function classifyEnemy(enemyId){
  if(enemyId.endsWith('_boss')) return 'boss';
  if(enemyId.includes('_miniboss')) return 'miniboss';
  if(/_(berserker|sentinel|alpha|overclocked|gladiator)$/.test(enemyId)) return 'elite';
  return 'mob';
}

function partitionEnemyPool(enemyTypes){
  const mobs = [], elites = [];
  let miniboss = null, boss = null;
  for(const id of enemyTypes){
    const c = classifyEnemy(id);
    if(c === 'boss') boss = id;
    else if(c === 'miniboss') miniboss = id;
    else if(c === 'elite') elites.push(id);
    else mobs.push(id);
  }
  return { mobs, elites, miniboss, boss };
}

// ============================================================
// MAIN GENERATOR (async — needs catalog loaded for loot)
// ============================================================

export async function generateDungeonRun(biomeId, level, options = {}){
  // Ensure catalog is loaded before rolling loot
  await loadCatalog();

  const biomeData = ASCENSION_DATA[biomeId];
  if(!biomeData) throw new Error(`Unknown biome: ${biomeId}`);

  const dungeon = biomeData.dungeons[level - 1];
  if(!dungeon) throw new Error(`Unknown dungeon level: ${level}`);

  // === TIER ===
  // Le tier vient de l'UI Ascension (sélecteur par biome). Détermine :
  //  - ilvl du loot (ilvl = tier, calé sur RARITY_WEIGHTS_BY_ILVL existant)
  //  - difficulté ennemis (scaling +25% par tier au-delà de T1, voir game.html)
  // Si non fourni : fallback à 1 (rétro-compat avec anciens callers).
  const MAX_TIER = 10;
  const tier = Math.max(1, Math.min(MAX_TIER, (options.tier | 0) || 1));

  const seedSource = options.seed !== undefined
    ? (typeof options.seed === 'string' ? strToSeed(options.seed) : options.seed)
    : Math.floor(Math.random() * 0xFFFFFFFF);
  const rng = mulberry32(seedSource);

  // === Source de vérité : tout vient de "dungeon" ===
  const roomCount = dungeon.rooms;
  const totalEnemyCount = rollInt(rng, dungeon.enemyCount.min, dungeon.enemyCount.max);
  const pool = partitionEnemyPool(dungeon.enemyTypes);

  // === 1. Construire les types de rooms ===
  const roomTypes = new Array(roomCount).fill('combat');

  if(dungeon.hasBoss){
    roomTypes[roomCount - 1] = 'boss';
  }
  if(dungeon.hasMiniboss){
    const minibossIdx = dungeon.hasBoss ? roomCount - 2 : roomCount - 1;
    if(minibossIdx >= 0) roomTypes[minibossIdx] = 'miniboss';
  }
  if(dungeon.hasElite){
    const candidates = [];
    for(let i = 1; i < roomCount; i++){
      if(roomTypes[i] === 'combat') candidates.push(i);
    }
    if(candidates.length > 0){
      roomTypes[pickRandom(rng, candidates)] = 'elite';
    }
  }

  // === 2. Distribuer les ennemis sur les rooms de combat ===
  const combatRoomIndices = roomTypes
    .map((t, i) => t === 'combat' ? i : -1)
    .filter(i => i >= 0);
  const eliteIdx = roomTypes.indexOf('elite');

  let alreadyPlaced = 0;
  if(dungeon.hasBoss) alreadyPlaced += 1;
  if(dungeon.hasMiniboss) alreadyPlaced += 1;
  let eliteEscortCount = 0;
  if(eliteIdx >= 0){
    eliteEscortCount = rollInt(rng, 1, 2);
    alreadyPlaced += 1 + eliteEscortCount;
  }

  let remaining = Math.max(combatRoomIndices.length, totalEnemyCount - alreadyPlaced);

  const enemiesPerRoom = combatRoomIndices.map(() => 1);
  remaining -= combatRoomIndices.length;
  let cursor = 0;
  let safeguard = 100;
  while(remaining > 0 && safeguard-- > 0){
    const slot = cursor % combatRoomIndices.length;
    if(enemiesPerRoom[slot] < 5){
      enemiesPerRoom[slot]++;
      remaining--;
    }
    cursor++;
  }

  // === 3. Construire chaque room avec ses ennemis ===
  const rooms = roomTypes.map((type, index) => {
    let enemyIds = [];

    switch(type){
      case 'combat': {
        const slotIdx = combatRoomIndices.indexOf(index);
        const count = enemiesPerRoom[slotIdx];
        if(pool.mobs.length === 0){
          const nonBoss = dungeon.enemyTypes.filter(e => classifyEnemy(e) !== 'boss');
          enemyIds = Array.from({ length: count }, () => pickRandom(rng, nonBoss));
        } else {
          enemyIds = Array.from({ length: count }, () => pickRandom(rng, pool.mobs));
        }
        break;
      }
      case 'elite': {
        const elite = pickRandom(rng, pool.elites) || dungeon.enemyTypes[dungeon.enemyTypes.length - 1];
        const escortPool = pool.mobs.length ? pool.mobs : [elite];
        const escort = Array.from({ length: eliteEscortCount }, () => pickRandom(rng, escortPool));
        enemyIds = [elite, ...escort];
        break;
      }
      case 'miniboss':
        enemyIds = pool.miniboss ? [pool.miniboss] : [];
        break;
      case 'boss':
        enemyIds = pool.boss ? [pool.boss] : [];
        break;
    }

    const map = generateRoomMap(rng, type, enemyIds);

    return {
      index,
      type,
      width: map.width,
      height: map.height,
      walls: map.walls,
      playerStart: map.playerStart,
      enemies: map.enemies,
      enemyTypes: enemyIds,
      cleared: false,
    };
  });

  // === 4. Loot final (utilise le vrai catalog + rollItem) ===
  // Le tier détermine l'ilvl du loot (ilvl = tier). D6 (boss) mixe 50/50 tier et tier+1
  // pour récompenser le boss kill (sauf en T10 où tier+1 n'existe pas).
  const loot = rollLoot(rng, biomeData, dungeon, level, biomeId, tier);

  return {
    biomeId,
    level,
    tier, // <-- exposé pour que game.html puisse l'utiliser au moment de markDungeonCleared
    dungeonName: dungeon.name,
    seed: seedSource,
    roomCount,
    rooms,
    finalLoot: loot,
    state: {
      currentRoomIndex: 0,
      isComplete: false,
      isFailed: false,
    },
  };
}

// ============================================================
// MAP GENERATION (tile-based, compat game.html)
// ============================================================

function generateRoomMap(rng, roomType, enemyIds){
  let width, height;
  switch(roomType){
    case 'boss':     width = 10; height = 8; break;
    case 'miniboss': width = 9;  height = 7; break;
    case 'elite':    width = 9;  height = 6; break;
    default:         width = 8;  height = 6; break;
  }

  const walls = [];
  const wallSet = new Set();
  const wallCount = roomType === 'boss' ? 0
                  : roomType === 'miniboss' ? rollInt(rng, 0, 1)
                  : rollInt(rng, 1, 3);
  let attempts = 0;
  while(walls.length < wallCount && attempts < 30){
    attempts++;
    const wx = rollInt(rng, 2, width - 3);
    const wy = rollInt(rng, 1, height - 2);
    const k = `${wx},${wy}`;
    if(wallSet.has(k)) continue;
    wallSet.add(k);
    walls.push(k);
  }

  const playerStart = { x: 1, y: Math.floor(height / 2) };
  const enemies = [];
  const occupied = new Set([`${playerStart.x},${playerStart.y}`, ...wallSet]);
  const enemyCols = [width - 1, width - 2, width - 3];

  for(let i = 0; i < enemyIds.length; i++){
    const enemyId = enemyIds[i];
    let placed = false;
    let tries = 0;
    while(!placed && tries < 30){
      tries++;
      let ex, ey;
      if(roomType === 'boss' || roomType === 'miniboss'){
        ex = width - 2;
        ey = Math.floor(height / 2);
      } else {
        ex = enemyCols[i % enemyCols.length] + (tries > 5 ? rollInt(rng, -1, 0) : 0);
        ey = rollInt(rng, 0, height - 1);
      }
      if(ex < 0 || ex >= width || ey < 0 || ey >= height) continue;
      const k = `${ex},${ey}`;
      if(occupied.has(k)) continue;
      occupied.add(k);
      enemies.push({
        type: enemyId,
        x: ex, y: ey,
        displayName: ENEMY_NAMES[enemyId] || enemyId,
      });
      placed = true;
    }
  }

  return { width, height, walls, playerStart, enemies };
}

// ============================================================
// LOOT ROLLING (vrai catalog + rollItem avec affixes)
// ============================================================

// Affinités par biome — itemIds favorisés selon le thème.
// Le pool de chaque biome = items affinitaires (60%) + items génériques (40%).
export const BIOME_AFFINITY = {
  inferno: {
    weapons: ['flameSword', 'axeBerserker', 'warhammer', 'maceOfHonor'],
    accessories: ['amuletPyromancy', 'ringPyrokinesis'],
  },
  cryo: {
    weapons: ['iceStaff', 'maceOfHonor', 'warhammer'],
    accessories: ['amuletCryomancy', 'ringIceWard'],
  },
  toxic: {
    weapons: ['venomFang', 'daggerSwift', 'axeBerserker'],
    accessories: ['amuletPlague', 'ringSurvivor'],
  },
  voidnet: {
    weapons: ['stormWand', 'pistolHeavy', 'daggerSwift'],
    accessories: ['amuletStorm', 'ringStorm'],
  },
  crimson: {
    weapons: ['swordRusty', 'swordIron', 'axeBerserker', 'daggerSwift', 'maceOfHonor'],
    accessories: ['ringVampire', 'ringPredator'],
  },
};

// Distribution de raretés par iLvl du donjon.
// iLvl 1-2 : pas d'épique. iLvl 3-4 : peu d'épique. iLvl 5-6 : un peu plus d'épique, 1% legendary
export const RARITY_WEIGHTS_BY_ILVL = {
  1:  { common: 70, magic: 28, rare: 2,  epic: 0,  legendary: 0 },
  2:  { common: 60, magic: 33, rare: 6,  epic: 1,  legendary: 0 },
  3:  { common: 50, magic: 35, rare: 12, epic: 3,  legendary: 0 },
  4:  { common: 40, magic: 35, rare: 18, epic: 7,  legendary: 0 },
  5:  { common: 30, magic: 35, rare: 22, epic: 12, legendary: 1 },
  6:  { common: 20, magic: 32, rare: 28, epic: 18, legendary: 2 },
  7:  { common: 15, magic: 30, rare: 30, epic: 22, legendary: 3 },
  8:  { common: 10, magic: 25, rare: 32, epic: 28, legendary: 5 },
  9:  { common: 5,  magic: 20, rare: 35, epic: 33, legendary: 7 },
  10: { common: 0,  magic: 15, rare: 35, epic: 40, legendary: 10 },
};

function rollRarity(rng, ilvl){
  const weights = RARITY_WEIGHTS_BY_ILVL[ilvl] || RARITY_WEIGHTS_BY_ILVL[1];
  const total = Object.values(weights).reduce((s, w) => s + w, 0);
  let r = rng() * total;
  for(const [rarity, w] of Object.entries(weights)){
    r -= w;
    if(r <= 0) return rarity;
  }
  return 'common';
}

// Construit le pool effectif d'itemIds piochables pour un biome.
// 60% chance que l'item soit dans l'affinité du biome, 40% chance qu'il soit un item générique du catalog.
function buildBiomeItemPool(rng, biomeId){
  const catalog = getAllItems();
  const allIds = Object.keys(catalog);
  const affinity = BIOME_AFFINITY[biomeId] || { weapons: [], accessories: [] };

  // Items affinitaires effectivement présents dans le catalog
  const affinityIds = [...affinity.weapons, ...affinity.accessories]
    .filter(id => catalog[id]);

  // Items génériques = tout sauf l'affinity (pour ne pas double-compter)
  const genericIds = allIds.filter(id => !affinityIds.includes(id));

  return { affinityIds, genericIds };
}

function pickItemBaseId(rng, biomeId){
  const { affinityIds, genericIds } = buildBiomeItemPool(rng, biomeId);
  // 60% affinity / 40% generic, fallback sur l'autre si vide
  if(affinityIds.length > 0 && (genericIds.length === 0 || rng() < 0.6)){
    return pickRandom(rng, affinityIds);
  }
  return pickRandom(rng, genericIds.length > 0 ? genericIds : affinityIds);
}

function rollLootItem(rng, biomeId, ilvl, opts = {}){
  const baseId = pickItemBaseId(rng, biomeId);
  if(!baseId) return null;
  // Rareté : forcée si opts.rarity, sinon roll selon l'iLvl
  const rarity = opts.rarity || rollRarity(rng, ilvl);
  // Pass un RNG perso à rollItem ? Non — rollItem utilise Math.random() en interne.
  // C'est OK pour l'instant, on perd juste le déterminisme du roll seedé sur les affixes.
  // (À refacto plus tard si besoin de runs reproductibles.)
  return rollItem(baseId, {
    rarity,
    ilvl,
    biomeId,
    isBossDrop: !!opts.isBossDrop,
  });
}

function rollLoot(rng, biomeData, dungeon, level, biomeId, tier = 1){
  const MAX_TIER = 10;
  const itemCount = rollInt(rng, dungeon.lootCount.min, dungeon.lootCount.max);
  const items = [];

  // Détermine l'ilvl pour CET item donné.
  // - Donjons D1..D5 → ilvl = tier
  // - Donjon D6 (boss) → 50% tier, 50% tier+1 (sauf si tier == MAX_TIER → 100% tier)
  const isBossDungeon = (level === 6 && dungeon.hasBoss);
  function pickIlvl(){
    if(isBossDungeon && tier < MAX_TIER){
      return rng() < 0.5 ? tier : (tier + 1);
    }
    return tier;
  }

  // Boss D6 : 1 drop garanti epic (95%) ou legendary (5%)
  if(isBossDungeon){
    const isLegendary = rng() < 0.05;
    const guaranteedRarity = isLegendary ? 'legendary' : 'epic';
    const bossItem = rollLootItem(rng, biomeId, pickIlvl(), {
      rarity: guaranteedRarity,
      isBossDrop: true,
    });
    if(bossItem) items.push(bossItem);
  }

  const remaining = items.length > 0 ? itemCount - 1 : itemCount;
  for(let i = 0; i < remaining; i++){
    const item = rollLootItem(rng, biomeId, pickIlvl());
    if(item) items.push(item);
  }

  const resourceAmount = rollInt(rng, dungeon.resourceDrop.min, dungeon.resourceDrop.max);

  return {
    items,
    resource: {
      id: biomeData.resource.id,
      name: biomeData.resource.name,
      icon: biomeData.resource.icon,
      color: biomeData.resource.color,
      amount: resourceAmount,
    },
  };
}

// ============================================================
// EXPORTS UTILITAIRES
// ============================================================

export const ROOM_TYPE_LABELS = {
  combat:   { label: 'COMBAT',   icon: '⚔',  color: '#a89878' },
  elite:    { label: 'ÉLITE',    icon: '⚜',  color: '#c8a040' },
  miniboss: { label: 'MINIBOSS', icon: '☠',  color: '#ff8830' },
  boss:     { label: 'BOSS',     icon: '☠☠', color: '#ff5252' },
};
