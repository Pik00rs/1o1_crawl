// src/js/dungeon/generator.js
// Génère une run de donjon à partir de la spec d'ASCENSION_DATA.
// SOURCE DE VÉRITÉ = ascension-data.js. Les valeurs (rooms count, enemy count,
// pool d'ennemis, loot) sont lues depuis là. Le generator se contente de :
//   1. Distribuer les ennemis sur les rooms
//   2. Générer une map tile-based par room (compatible game.html)
//   3. Roller le loot final selon la spec du donjon

import { ASCENSION_DATA, ENEMY_NAMES } from '../../dashboard/ascension-data.js';

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

function pickWeighted(rng, items){
  const total = items.reduce((s, it) => s + (it.weight || 1), 0);
  let r = rng() * total;
  for(const it of items){
    r -= (it.weight || 1);
    if(r <= 0) return it;
  }
  return items[items.length - 1];
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
// MAIN GENERATOR
// ============================================================

export function generateDungeonRun(biomeId, level, options = {}){
  const biomeData = ASCENSION_DATA[biomeId];
  if(!biomeData) throw new Error(`Unknown biome: ${biomeId}`);

  const dungeon = biomeData.dungeons[level - 1];
  if(!dungeon) throw new Error(`Unknown dungeon level: ${level}`);

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

  // Calcule combien d'ennemis sont déjà "consommés" par les rooms spéciales
  let alreadyPlaced = 0;
  if(dungeon.hasBoss) alreadyPlaced += 1;
  if(dungeon.hasMiniboss) alreadyPlaced += 1;
  let eliteEscortCount = 0;
  if(eliteIdx >= 0){
    eliteEscortCount = rollInt(rng, 1, 2);
    alreadyPlaced += 1 + eliteEscortCount;
  }

  // Ennemis restants à distribuer dans les combat rooms
  let remaining = Math.max(combatRoomIndices.length, totalEnemyCount - alreadyPlaced);

  // Distribution : min 1 par room, puis round-robin pour le reste
  const enemiesPerRoom = combatRoomIndices.map(() => 1);
  remaining -= combatRoomIndices.length;
  let cursor = 0;
  let safeguard = 100;
  while(remaining > 0 && safeguard-- > 0){
    const slot = cursor % combatRoomIndices.length;
    if(enemiesPerRoom[slot] < 5){ // cap 5 ennemis par room pour la lisibilité
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
        // Pioche dans pool.mobs (les ennemis non-spéciaux du dungeon.enemyTypes)
        if(pool.mobs.length === 0){
          // Fallback improbable : pas de mobs dans le pool, on prend n'importe quel non-boss
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
      // Champs consommés par game.html (readPlaytestRun)
      width: map.width,
      height: map.height,
      walls: map.walls,
      playerStart: map.playerStart,
      enemies: map.enemies,
      // Métadonnées pour notre UI / debug
      enemyTypes: enemyIds,
      cleared: false,
    };
  });

  // === 4. Loot final ===
  const loot = rollLoot(rng, biomeData, dungeon, level);

  return {
    biomeId,
    level,
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
// LOOT ROLLING (utilise dungeon.lootCount/lootPool/resourceDrop)
// ============================================================

const BOSS_DROP_LEGENDARY_CHANCE = 0.05; // 5% légendaire / 95% épique

function rollLoot(rng, biomeData, dungeon, level){
  const pool = dungeon.lootPool;
  if(!pool || pool.length === 0){
    throw new Error(`Empty loot pool for ${biomeData.id} D${level}`);
  }

  const itemCount = rollInt(rng, dungeon.lootCount.min, dungeon.lootCount.max);
  const items = [];

  // Boss D6 : 1 drop garanti épique (95%) ou légendaire (5%)
  if(level === 6 && dungeon.hasBoss){
    const isLegendary = rng() < BOSS_DROP_LEGENDARY_CHANCE;
    const guaranteedRarity = isLegendary ? 'legendary' : 'epic';
    const rares = pool.filter(p => p.rarity === 'rare');
    const baseItem = rares.length > 0 ? pickWeighted(rng, rares) : pickWeighted(rng, pool);
    items.push({
      itemId: baseItem.itemId,
      rarity: guaranteedRarity,
      stats: rollItemStats(rng, baseItem.statRanges),
      isBossDrop: true,
    });
  }

  const remaining = items.length > 0 ? itemCount - 1 : itemCount;
  for(let i = 0; i < remaining; i++){
    const baseItem = pickWeighted(rng, pool);
    items.push({
      itemId: baseItem.itemId,
      rarity: baseItem.rarity,
      stats: rollItemStats(rng, baseItem.statRanges),
      isBossDrop: false,
    });
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

function rollItemStats(rng, statRanges){
  const stats = {};
  for(const [key, range] of Object.entries(statRanges || {})){
    if(Array.isArray(range) && range.length === 2){
      stats[key] = rollInt(rng, range[0], range[1]);
    }
  }
  return stats;
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
