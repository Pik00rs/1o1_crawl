// src/js/dungeon/generator.js
// Génère une run complète de donjon : séquence de rooms + métadonnées.
// Pure fonction : pas d'effet de bord. Une seed permet la reproductibilité.

import { rollDungeonLoot } from './loot-roller.js';

// ============================================================
// CONFIGURATION
// ============================================================

// Mapping biome → ennemis (par catégorie).
// On reflète la composition exacte des sprites dans /js/render/enemies/.
const ENEMY_POOL = {
  inferno: {
    mobs:     ['inferno_brute', 'inferno_caster', 'inferno_charger', 'inferno_archer', 'inferno_engineer'],
    elites:   ['inferno_berserker'],
    miniboss: 'inferno_minibossDrone',
    boss:     'inferno_boss',
  },
  cryo: {
    mobs:     ['cryo_brute', 'cryo_caster', 'cryo_skater', 'cryo_archer', 'cryo_shielder'],
    elites:   ['cryo_sentinel'],
    miniboss: 'cryo_minibossWarden',
    boss:     'cryo_boss',
  },
  toxic: {
    mobs:     ['toxic_brute', 'toxic_spitter', 'toxic_swarmer', 'toxic_carrier', 'toxic_grafted'],
    elites:   ['toxic_alpha'],
    miniboss: 'toxic_minibossSpore',
    boss:     'toxic_boss',
  },
  voidnet: {
    mobs:     ['voidnet_glitch', 'voidnet_daemon', 'voidnet_executor', 'voidnet_corrupter', 'voidnet_replicator'],
    elites:   ['voidnet_overclocked'],
    miniboss: 'voidnet_minibossKernel',
    boss:     'voidnet_boss',
  },
  crimson: {
    mobs:     ['crimson_brawler', 'crimson_butcher', 'crimson_throwblade', 'crimson_hooked', 'crimson_doctor'],
    elites:   ['crimson_gladiator'],
    miniboss: 'crimson_minibossExecutioner',
    boss:     'crimson_boss',
  },
};

// Quantité de rooms par donjon (min, max). Index 0 = D1.
const ROOM_COUNT_RANGES = [
  [1, 3],   // D1
  [2, 4],   // D2
  [3, 5],   // D3
  [4, 5],   // D4
  [5, 6],   // D5
  [6, 6],   // D6 (fixe)
];

// Composition par niveau de donjon (qui apparaît dans la séquence ?)
// Les flags additionnels s'ajoutent aux mobs normaux.
const DUNGEON_COMPOSITION = [
  { hasElite: false, hasMiniboss: false, hasBoss: false }, // D1
  { hasElite: false, hasMiniboss: false, hasBoss: false }, // D2
  { hasElite: true,  hasMiniboss: false, hasBoss: false }, // D3
  { hasElite: true,  hasMiniboss: true,  hasBoss: false }, // D4
  { hasElite: true,  hasMiniboss: true,  hasBoss: false }, // D5
  { hasElite: true,  hasMiniboss: true,  hasBoss: true  }, // D6
];

// Nombre de mobs par room normale (min, max). Index 0 = D1.
const MOBS_PER_ROOM_RANGES = [
  [1, 2],   // D1
  [1, 2],   // D2
  [2, 3],   // D3
  [2, 3],   // D4
  [3, 4],   // D5
  [3, 4],   // D6
];

// ============================================================
// PRNG : Mulberry32 (déterministe à partir d'une seed)
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

// Convertit une string en seed entière (hash simple)
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
  // Inclusive both ends.
  return Math.floor(rng() * (max - min + 1)) + min;
}

function pickRandom(rng, array){
  if(array.length === 0) return null;
  return array[Math.floor(rng() * array.length)];
}

function pickMultiple(rng, array, count, allowDuplicates = true){
  if(allowDuplicates){
    const out = [];
    for(let i = 0; i < count; i++) out.push(pickRandom(rng, array));
    return out;
  }
  // Sans doublons (Fisher-Yates partiel)
  const pool = [...array];
  const out = [];
  for(let i = 0; i < count && pool.length > 0; i++){
    const idx = Math.floor(rng() * pool.length);
    out.push(pool[idx]);
    pool.splice(idx, 1);
  }
  return out;
}

// ============================================================
// MAIN GENERATOR
// ============================================================

/**
 * Génère une run de donjon complète.
 *
 * @param {string} biomeId - 'inferno' | 'cryo' | 'toxic' | 'voidnet' | 'crimson'
 * @param {number} level - 1..6
 * @param {object} options
 * @param {string|number} [options.seed] - seed pour reproductibilité (default: aléatoire)
 * @returns {Run} Run object
 */
export function generateDungeonRun(biomeId, level, options = {}){
  // Validation
  if(!ENEMY_POOL[biomeId]){
    throw new Error(`Unknown biome: ${biomeId}`);
  }
  if(!Number.isInteger(level) || level < 1 || level > 6){
    throw new Error(`Invalid dungeon level: ${level} (must be 1-6)`);
  }

  // Seed handling
  const seedSource = options.seed !== undefined
    ? (typeof options.seed === 'string' ? strToSeed(options.seed) : options.seed)
    : Math.floor(Math.random() * 0xFFFFFFFF);
  const rng = mulberry32(seedSource);

  const pool = ENEMY_POOL[biomeId];
  const composition = DUNGEON_COMPOSITION[level - 1];
  const [roomMin, roomMax] = ROOM_COUNT_RANGES[level - 1];
  const [mobMin, mobMax] = MOBS_PER_ROOM_RANGES[level - 1];

  // 1) Combien de rooms ?
  const roomCount = rollInt(rng, roomMin, roomMax);

  // 2) Construire la séquence d'archétypes de rooms.
  // Règles :
  //   - Boss → toujours dernière room (si hasBoss)
  //   - Miniboss → avant-dernière room (si hasMiniboss)
  //   - Élite → random parmi les rooms restantes, mais pas la room 0 (sauf si seul choix possible)
  //   - Le reste = combat
  const roomTypes = new Array(roomCount).fill('combat');

  // Si très peu de rooms, on doit packer intelligemment.
  // Cas extrême : roomCount=1 → impossible d'avoir miniboss avant boss, donc on collapse.
  // Heureusement nos compos garantissent : si hasBoss alors level=6 → roomCount=6 (fixe).
  // Pour D4-D5 (hasMiniboss sans hasBoss) : roomMin=4, donc OK, miniboss en avant-dernière.

  if(composition.hasBoss){
    roomTypes[roomCount - 1] = 'boss';
  }

  if(composition.hasMiniboss){
    // Avant-dernière. Si hasBoss alors c'est room N-2, sinon dernière room (N-1).
    const minibossIdx = composition.hasBoss ? roomCount - 2 : roomCount - 1;
    roomTypes[minibossIdx] = 'miniboss';
  }

  if(composition.hasElite){
    // Pool d'index disponibles : tout sauf la room 0 et les rooms déjà occupées (boss/miniboss).
    const candidates = [];
    for(let i = 1; i < roomCount; i++){
      if(roomTypes[i] === 'combat') candidates.push(i);
    }
    if(candidates.length > 0){
      const eliteIdx = pickRandom(rng, candidates);
      roomTypes[eliteIdx] = 'elite';
    }
    // Si pas de candidats valides (improbable dans nos configs), on skip silencieusement.
  }

  // 3) Pour chaque room, déterminer les ennemis présents et générer la map tile.
  const rooms = roomTypes.map((type, index) => {
    // Liste d'enemy IDs selon le type de room
    let enemyIds;
    switch(type){
      case 'combat': {
        const count = rollInt(rng, mobMin, mobMax);
        enemyIds = pickMultiple(rng, pool.mobs, count, true);
        break;
      }
      case 'elite': {
        const elite = pickRandom(rng, pool.elites);
        const escortCount = rollInt(rng, 1, 2);
        const escort = pickMultiple(rng, pool.mobs, escortCount, true);
        enemyIds = [elite, ...escort];
        break;
      }
      case 'miniboss':
        enemyIds = [pool.miniboss];
        break;
      case 'boss':
        enemyIds = [pool.boss];
        break;
      default:
        enemyIds = [];
    }

    // Génère la map tile-based pour cette room.
    // Format compatible game.html : { width, height, walls: ["x,y", ...],
    //   playerStart: {x, y}, enemies: [{type, x, y}] }
    const map = generateRoomMap(rng, type, enemyIds, level);

    return {
      index,
      type,
      // Champs consommés par game.html (readPlaytestRun → roomData) :
      width: map.width,
      height: map.height,
      walls: map.walls,
      playerStart: map.playerStart,
      enemies: map.enemies,
      // Métadonnées pour notre UI :
      enemyTypes: enemyIds, // les IDs sans positions, utiles pour le compteur
      cleared: false,
    };
  });

  // 4) Loot final pré-rollé (au moment de la génération, comme spec'd).
  const loot = rollDungeonLoot(biomeId, level, rng);

  // 5) Build the Run object.
  return {
    biomeId,
    level,
    seed: seedSource,
    roomCount,
    rooms,
    finalLoot: loot,
    // Runtime state (sera mis à jour pendant la run)
    state: {
      currentRoomIndex: 0,
      isComplete: false,
      isFailed: false,
    },
  };
}

// ============================================================
// MAP GENERATION (tile-based, compatible game.html)
// ============================================================

/**
 * Génère une map tile-based pour une room.
 * Format : { width, height, walls: ["x,y", ...], playerStart: {x,y}, enemies: [{type,x,y}] }
 *
 * Layout :
 *   - Le joueur spawne sur la moitié gauche
 *   - Les ennemis sur la moitié droite
 *   - Quelques walls aléatoires au milieu pour donner du gameplay
 *
 * Les dimensions augmentent avec le type de room et le level.
 */
function generateRoomMap(rng, roomType, enemyIds, level){
  // Dimensions selon type de room
  // Plus le type est gros, plus la salle est grande pour laisser de l'espace
  let width, height;
  switch(roomType){
    case 'boss':     width = 10; height = 8; break;
    case 'miniboss': width = 9;  height = 7; break;
    case 'elite':    width = 9;  height = 6; break;
    default:         width = 8;  height = 6; break;
  }

  // Walls aléatoires : 0-3 walls dans la zone centrale (ni au spawn joueur ni aux spawns ennemis)
  const walls = [];
  const wallCount = roomType === 'boss' ? 0 // boss room reste vide pour pas piéger le boss
                  : roomType === 'miniboss' ? rollInt(rng, 0, 1)
                  : rollInt(rng, 1, 3);
  const wallSet = new Set();
  let attempts = 0;
  while(walls.length < wallCount && attempts < 30){
    attempts++;
    // Walls dans la zone centrale (col 2 à width-3)
    const wx = rollInt(rng, 2, width - 3);
    const wy = rollInt(rng, 1, height - 2);
    const k = `${wx},${wy}`;
    if(wallSet.has(k)) continue;
    wallSet.add(k);
    walls.push(k);
  }

  // Player start : colonne 1, ligne random au milieu
  const playerStart = { x: 1, y: Math.floor(height / 2) };

  // Spawn ennemis : colonne (width-3) à (width-1), réparti verticalement
  const enemies = [];
  const occupied = new Set([`${playerStart.x},${playerStart.y}`, ...wallSet]);
  const enemyCols = [width - 1, width - 2, width - 3];

  for(let i = 0; i < enemyIds.length; i++){
    const enemyId = enemyIds[i];
    let placed = false;
    let tries = 0;
    while(!placed && tries < 30){
      tries++;
      // Boss/Miniboss : centre de la zone droite
      let ex, ey;
      if(roomType === 'boss' || roomType === 'miniboss'){
        ex = width - 2;
        ey = Math.floor(height / 2);
      } else {
        ex = enemyCols[i % enemyCols.length] + (tries > 5 ? rollInt(rng, -1, 0) : 0);
        ey = rollInt(rng, 0, height - 1);
      }
      // Bounds check
      if(ex < 0 || ex >= width || ey < 0 || ey >= height){ continue; }
      const k = `${ex},${ey}`;
      if(occupied.has(k)){ continue; }
      occupied.add(k);
      enemies.push({ type: enemyId, x: ex, y: ey });
      placed = true;
    }
    // Si on n'a pas pu placer (jamais en théorie), on abandonne celui-là
  }

  return { width, height, walls, playerStart, enemies };
}

// ============================================================
// EXPORTS UTILITAIRES (pour debug + UI)
// ============================================================

export const ROOM_TYPE_LABELS = {
  combat:   { label: 'COMBAT',   icon: '⚔',  color: '#a89878' },
  elite:    { label: 'ÉLITE',    icon: '⚜',  color: '#c8a040' },
  miniboss: { label: 'MINIBOSS', icon: '☠',  color: '#ff8830' },
  boss:     { label: 'BOSS',     icon: '☠☠', color: '#ff5252' },
};

export { ENEMY_POOL, DUNGEON_COMPOSITION, ROOM_COUNT_RANGES, MOBS_PER_ROOM_RANGES };
