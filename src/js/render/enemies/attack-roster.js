// src/js/render/enemies/attack-roster.js
// Mapping enemy_id → array d'attaques.
// Règle de distribution:
//   - mob (25) : 1 attaque
//   - elite (5) : 2 attaques (basic + signature)
//   - miniboss (5) : 2 attaques (basic + signature)
//   - boss (5) : 3 attaques (basic + signature + ultimate AoE)
//
// Les paramètres (damageType, dmgRange) sont alignés sur src/data/enemies.json.

import {
  makeMeleeSwing, makeHeavyStrike, makeRangedShot, makeMagicCast,
  makeCharge, makeAoeBlast, makeBuffAura, makeStatusProjectile, makeIdle,
} from './attacks.js';

/**
 * Construit le set d'attaques pour un ennemi en fonction de son enemyData
 * (l'entrée de enemies.json).
 */
export function buildAttacksFor(enemyData){
  if(!enemyData) return null;
  const id = enemyData.id;
  const role = enemyData.role || 'mob';
  const damageType = enemyData.damageType || 'blunt';
  const dmgRange = enemyData.attackPower || enemyData.baseDmg || [1, 1];
  const isRanged = (enemyData.range || 1) >= 2;
  const isCaster = enemyData.ai === 'caster';

  // Custom roster per enemy (overrides defaults)
  const custom = CUSTOM_ROSTERS[id];
  if(custom) return custom(enemyData);

  // ─── Defaults par rôle ───
  const attacks = {};

  // Attaque 1 (basic) - tous
  if(isCaster || isRanged){
    if(isCaster){
      attacks.cast = makeMagicCast({
        id: 'cast', name: 'INCANTATION',
        damageType, dmgRange,
        desc: `Lance un sort à distance`,
      });
    } else {
      attacks.shot = makeRangedShot({
        id: 'shot', name: 'TIR',
        damageType, dmgRange,
        desc: `Tir à distance · range ${enemyData.range}`,
      });
    }
  } else {
    attacks.strike = makeMeleeSwing({
      id: 'strike', name: 'FRAPPE',
      damageType, dmgRange,
      desc: 'Frappe au corps-à-corps',
    });
  }

  // Attaque 2 (signature) - elite, miniboss, boss
  if(role === 'elite' || role === 'miniboss' || role === 'boss'){
    if(isCaster){
      attacks.heavy_cast = makeAoeBlast({
        id: 'heavy_cast', name: 'SORT MAJEUR', icon: '✸',
        damageType, dmgRange: [dmgRange[0] + 4, dmgRange[1] + 6],
        radius: 32,
        desc: 'Sort de zone (AoE 2×2)',
      });
    } else {
      attacks.heavy = makeHeavyStrike({
        id: 'heavy', name: 'FRAPPE LOURDE',
        damageType, dmgRange: [dmgRange[0] + 3, dmgRange[1] + 5],
        desc: 'Coup chargé qui inflige plus de dégâts',
      });
    }
  }

  // Attaque 3 (ultimate AoE) - boss only
  if(role === 'boss'){
    attacks.ultimate = makeAoeBlast({
      id: 'ultimate', name: 'ULTIMATE', icon: '✺',
      damageType, dmgRange: [dmgRange[0] * 2, dmgRange[1] * 2],
      radius: 44, duration: 84,
      desc: 'AoE puissante (3×3)',
    });
  }

  return attacks;
}

// ─────────────────────────────────────────────────────────────────────────────
// CUSTOM ROSTERS — surcharges spécifiques par ennemi (~personnalité)
// Permettent d'utiliser des factories spéciales (charge, status, aura)
// pour mieux refléter le behavior de l'ennemi.
// ─────────────────────────────────────────────────────────────────────────────

const CUSTOM_ROSTERS = {
  // ═══════════════ INFERNO ═══════════════
  inferno_charger: (e) => ({
    charge: makeCharge({
      id: 'charge', name: 'CHARGE CENDREUSE', icon: '⟫',
      damageType: 'fire', dmgRange: e.attackPower,
      desc: 'Fonce sur 3 cases et stun à l\'impact',
    }),
  }),
  inferno_brute: (e) => ({
    strike: makeMeleeSwing({
      id: 'strike', name: 'COUP BRÛLANT', icon: '◇',
      damageType: 'fire', dmgRange: e.attackPower,
      desc: 'Frappe enflammée',
    }),
    aura: makeBuffAura({
      id: 'heatAura', name: 'AURA THERMIQUE', icon: '◎',
      damageType: 'fire',
      desc: 'Inflige 1 PV/tour aux adjacents (passive)',
    }),
  }),
  inferno_engineer: (e) => ({
    shot: makeRangedShot({
      id: 'shot', name: 'TIR DE RIVET', icon: '➤',
      damageType: e.damageType, dmgRange: e.attackPower,
      desc: 'Tire un rivet incandescent',
    }),
  }),
  inferno_berserker: (e) => ({
    strike: makeMeleeSwing({
      id: 'strike', name: 'TAILLADE', icon: '◇',
      damageType: 'slash', dmgRange: e.attackPower,
      desc: 'Coup de flamberge',
    }),
    heavy: makeHeavyStrike({
      id: 'rage', name: 'FUREUR', icon: '✦',
      damageType: 'slash', dmgRange: [e.attackPower[0] + 4, e.attackPower[1] + 7],
      desc: 'Déchaîne sa rage (+30% si <50% HP)',
    }),
  }),
  inferno_minibossDrone: (e) => ({
    shot: makeRangedShot({
      id: 'thermal', name: 'BURST THERMIQUE', icon: '➤',
      damageType: 'fire', dmgRange: e.attackPower,
      desc: 'Tir thermique précis',
    }),
    blast: makeAoeBlast({
      id: 'overload', name: 'SURCHARGE', icon: '✸',
      damageType: 'fire', dmgRange: [e.attackPower[0] + 3, e.attackPower[1] + 5],
      radius: 30, desc: 'Décharge thermique de zone',
    }),
  }),
  inferno_boss: (e) => ({
    cast: makeMagicCast({
      id: 'cast', name: 'FLAMME FOCALISÉE', icon: '✦',
      damageType: 'fire', dmgRange: e.attackPower,
      desc: 'Projectile thermonucléaire',
    }),
    infernoBurst: makeAoeBlast({
      id: 'infernoBurst', name: 'BRASIER INFERNAL', icon: '✺',
      damageType: 'fire', dmgRange: [e.attackPower[0] + 5, e.attackPower[1] + 8],
      radius: 40, desc: 'AOE feu 3×3 tous les 5 tours',
    }),
    ultimate: makeAoeBlast({
      id: 'ultimate', name: 'COMBUSTION TOTALE', icon: '☀',
      damageType: 'fire', dmgRange: [e.attackPower[0] * 2, e.attackPower[1] * 2],
      radius: 50, duration: 90,
      desc: 'Explosion thermonucléaire (phase 2)',
    }),
  }),

  // ═══════════════ CRYO ═══════════════
  cryo_brute: (e) => ({
    strike: makeMeleeSwing({
      id: 'strike', name: 'FRAPPE GIVRÉE', icon: '◇',
      damageType: 'ice', dmgRange: e.attackPower,
      desc: 'Poings de glace',
    }),
  }),
  cryo_caster: (e) => ({
    cast: makeMagicCast({
      id: 'cast', name: 'ÉCLAT GLACIAL', icon: '✦',
      damageType: 'ice', dmgRange: e.attackPower,
      desc: 'Projectile de glace · Slow',
    }),
  }),
  cryo_skater: (e) => ({
    charge: makeCharge({
      id: 'glide', name: 'GLISSE TRANCHANTE', icon: '⟫',
      damageType: 'slash', dmgRange: e.attackPower,
      desc: 'Glisse sur la glace et coupe',
    }),
  }),
  cryo_archer: (e) => ({
    shot: makeRangedShot({
      id: 'needle', name: 'AIGUILLE GELÉE', icon: '➤',
      damageType: 'pierce', dmgRange: e.attackPower,
      desc: 'Aiguille glacée perçante',
    }),
  }),
  cryo_shielder: (e) => ({
    strike: makeMeleeSwing({
      id: 'punch', name: 'POING GLACIER', icon: '◇',
      damageType: 'blunt', dmgRange: e.attackPower,
      desc: 'Frappe lourde et lente',
    }),
  }),
  cryo_sentinel: (e) => ({
    strike: makeMeleeSwing({
      id: 'halberd', name: 'HALLEBARDE', icon: '◇',
      damageType: 'pierce', dmgRange: e.attackPower,
      desc: 'Estoc de hallebarde',
    }),
    heavy: makeHeavyStrike({
      id: 'sweep', name: 'BALAYAGE', icon: '✦',
      damageType: 'pierce', dmgRange: [e.attackPower[0] + 3, e.attackPower[1] + 5],
      desc: 'Balayage horizontal large',
    }),
  }),
  cryo_minibossWarden: (e) => ({
    strike: makeMeleeSwing({
      id: 'key_strike', name: 'CLÉ DE GLACE', icon: '◇',
      damageType: 'blunt', dmgRange: e.attackPower,
      desc: 'Frappe avec la clé géante',
    }),
    freeze: makeAoeBlast({
      id: 'freeze', name: 'GEL TOTAL', icon: '✸',
      damageType: 'ice', dmgRange: [e.attackPower[0] + 2, e.attackPower[1] + 4],
      radius: 30, desc: 'Gèle la zone (Slow)',
    }),
  }),
  cryo_boss: (e) => ({
    cast: makeMagicCast({
      id: 'ice_lance', name: 'LANCE DE GLACE', icon: '✦',
      damageType: 'ice', dmgRange: e.attackPower,
      desc: 'Lance gelée perçante',
    }),
    blizzard: makeAoeBlast({
      id: 'blizzard', name: 'BLIZZARD', icon: '✸',
      damageType: 'ice', dmgRange: [e.attackPower[0] + 4, e.attackPower[1] + 7],
      radius: 38, desc: 'Tempête de glace (AOE 2×2)',
    }),
    ultimate: makeAoeBlast({
      id: 'absolute_zero', name: 'ZÉRO ABSOLU', icon: '☆',
      damageType: 'ice', dmgRange: [e.attackPower[0] * 2, e.attackPower[1] * 2],
      radius: 48, duration: 90,
      desc: 'Gèle tout sur la map (phase 2)',
    }),
  }),

  // ═══════════════ TOXIC ═══════════════
  toxic_brute: (e) => ({
    strike: makeMeleeSwing({
      id: 'maw', name: 'MORSURE FÉTIDE', icon: '◇',
      damageType: 'poison', dmgRange: e.attackPower,
      desc: 'Morsure empoisonnée',
    }),
  }),
  toxic_spitter: (e) => ({
    spit: makeStatusProjectile({
      id: 'spit', name: 'CRACHAT ACIDE', icon: '⌀',
      damageType: 'poison', dmgRange: e.attackPower, status: 'Empoisonné 3T',
      desc: 'Crache de l\'acide corrosif',
    }),
  }),
  toxic_swarmer: (e) => ({
    strike: makeMeleeSwing({
      id: 'swarm', name: 'NUÉE', icon: '◇',
      damageType: 'poison', dmgRange: e.attackPower,
      slashLength: 18, slashWidth: 2,
      desc: 'L\'essaim attaque',
    }),
  }),
  toxic_carrier: (e) => ({
    strike: makeMeleeSwing({
      id: 'kukri', name: 'LAME COURBÉE', icon: '◇',
      damageType: 'slash', dmgRange: e.attackPower,
      desc: 'Coup de lame infectée',
    }),
  }),
  toxic_grafted: (e) => ({
    strike: makeMeleeSwing({
      id: 'four_fists', name: 'QUATRE POINGS', icon: '◇',
      damageType: 'blunt', dmgRange: e.attackPower,
      desc: 'Frappe combinée des 4 bras',
    }),
  }),
  toxic_alpha: (e) => ({
    strike: makeMeleeSwing({
      id: 'alpha_bite', name: 'MORSURE ALPHA', icon: '◇',
      damageType: 'poison', dmgRange: e.attackPower,
      desc: 'Morsure massive de la meute',
    }),
    heavy: makeHeavyStrike({
      id: 'spore_release', name: 'LIBÉRATION SPORES', icon: '✦',
      damageType: 'poison', dmgRange: [e.attackPower[0] + 3, e.attackPower[1] + 5],
      desc: 'Libère des spores autour de lui',
    }),
  }),
  toxic_minibossSpore: (e) => ({
    spit: makeStatusProjectile({
      id: 'spore_shot', name: 'JET DE SPORES', icon: '⌀',
      damageType: 'poison', dmgRange: e.attackPower, status: 'Empoisonné fort',
      desc: 'Projettes des spores corrosives',
    }),
    burst: makeAoeBlast({
      id: 'spore_burst', name: 'NUAGE TOXIQUE', icon: '✸',
      damageType: 'poison', dmgRange: [e.attackPower[0] + 3, e.attackPower[1] + 5],
      radius: 36, desc: 'Nuage toxique (DOT)',
    }),
  }),
  toxic_boss: (e) => ({
    strike: makeMeleeSwing({
      id: 'maul', name: 'MAUL PUTRÉFIÉE', icon: '◇',
      damageType: 'poison', dmgRange: e.attackPower,
      slashLength: 36, slashWidth: 4,
      desc: 'Coup massif de la bête',
    }),
    plague: makeAoeBlast({
      id: 'plague_burst', name: 'PESTE', icon: '✸',
      damageType: 'poison', dmgRange: [e.attackPower[0] + 4, e.attackPower[1] + 6],
      radius: 42, desc: 'Vague de peste (AOE)',
    }),
    ultimate: makeAoeBlast({
      id: 'putrefaction', name: 'PUTRÉFACTION', icon: '☣',
      damageType: 'poison', dmgRange: [e.attackPower[0] * 2, e.attackPower[1] * 2],
      radius: 50, duration: 90,
      desc: 'Décomposition totale (phase 2)',
    }),
  }),

  // ═══════════════ VOIDNET ═══════════════
  voidnet_glitch: (e) => ({
    strike: makeMeleeSwing({
      id: 'glitch_strike', name: 'GLITCH', icon: '◇',
      damageType: 'shock', dmgRange: e.attackPower,
      desc: 'Téléporte et frappe',
    }),
  }),
  voidnet_daemon: (e) => ({
    cast: makeMagicCast({
      id: 'data_bolt', name: 'BOULON DE DATA', icon: '✦',
      damageType: 'shock', dmgRange: e.attackPower,
      desc: 'Boulon de données corrompues',
    }),
  }),
  voidnet_executor: (e) => ({
    strike: makeMeleeSwing({
      id: 'energy_blade', name: 'LAME D\'ÉNERGIE', icon: '◇',
      damageType: 'slash', dmgRange: e.attackPower,
      desc: 'Coup de lame d\'énergie',
    }),
  }),
  voidnet_corrupter: (e) => ({
    cast: makeStatusProjectile({
      id: 'curse', name: 'MALÉDICTION', icon: '⌀',
      damageType: 'void', dmgRange: e.attackPower, status: 'Corrompu',
      desc: 'Glyphe maudit · Inflige Corruption',
    }),
  }),
  voidnet_replicator: (e) => ({
    strike: makeMeleeSwing({
      id: 'echo_strike', name: 'FRAPPE ÉCHO', icon: '◇',
      damageType: 'shock', dmgRange: e.attackPower,
      desc: 'Le clone frappe en même temps',
    }),
  }),
  voidnet_overclocked: (e) => ({
    strike: makeMeleeSwing({
      id: 'arc_strike', name: 'ARC ÉLECTRIQUE', icon: '◇',
      damageType: 'shock', dmgRange: e.attackPower,
      desc: 'Frappe électrique surchargée',
    }),
    burst: makeAoeBlast({
      id: 'arc_burst', name: 'SURCHARGE ARC', icon: '✸',
      damageType: 'shock', dmgRange: [e.attackPower[0] + 4, e.attackPower[1] + 6],
      radius: 34, desc: 'Décharge électrique (AOE)',
    }),
  }),
  voidnet_minibossKernel: (e) => ({
    cast: makeMagicCast({
      id: 'data_lance', name: 'LANCE DE DATA', icon: '✦',
      damageType: 'void', dmgRange: e.attackPower,
      desc: 'Lance de données perçante',
    }),
    blast: makeAoeBlast({
      id: 'kernel_panic', name: 'KERNEL PANIC', icon: '✸',
      damageType: 'shock', dmgRange: [e.attackPower[0] + 3, e.attackPower[1] + 5],
      radius: 36, desc: 'Explosion système (AOE)',
    }),
  }),
  voidnet_boss: (e) => ({
    cast: makeMagicCast({
      id: 'void_orb', name: 'ORBE DU VIDE', icon: '✦',
      damageType: 'void', dmgRange: e.attackPower,
      desc: 'Orbe de vide qui aspire',
    }),
    corrupt: makeAoeBlast({
      id: 'corrupt_zone', name: 'ZONE CORROMPUE', icon: '✸',
      damageType: 'void', dmgRange: [e.attackPower[0] + 4, e.attackPower[1] + 7],
      radius: 40, desc: 'Zone corrompue 3×3',
    }),
    ultimate: makeAoeBlast({
      id: 'system_crash', name: 'SYSTEM CRASH', icon: '☓',
      damageType: 'void', dmgRange: [e.attackPower[0] * 2, e.attackPower[1] * 2],
      radius: 50, duration: 90,
      desc: 'Crash total (phase 2)',
    }),
  }),

  // ═══════════════ CRIMSON ═══════════════
  crimson_brawler: (e) => ({
    strike: makeMeleeSwing({
      id: 'punch', name: 'COUP DE POING', icon: '◇',
      damageType: 'blunt', dmgRange: e.attackPower,
      desc: 'Bandages tachés de sang',
    }),
  }),
  crimson_butcher: (e) => ({
    strike: makeMeleeSwing({
      id: 'cleaver', name: 'COUPERET', icon: '◇',
      damageType: 'slash', dmgRange: e.attackPower,
      slashLength: 32, slashWidth: 4,
      desc: 'Coup de couperet sanglant',
    }),
  }),
  crimson_throwblade: (e) => ({
    shot: makeRangedShot({
      id: 'throw', name: 'LAME LANCÉE', icon: '➤',
      damageType: 'pierce', dmgRange: e.attackPower,
      desc: 'Lance une lame tournoyante',
    }),
  }),
  crimson_hooked: (e) => ({
    strike: makeMeleeSwing({
      id: 'hook_strike', name: 'CROC', icon: '◇',
      damageType: 'pierce', dmgRange: e.attackPower,
      desc: 'Crochet sanglant',
    }),
  }),
  crimson_doctor: (e) => ({
    strike: makeMeleeSwing({
      id: 'scalpel', name: 'SCALPEL', icon: '◇',
      damageType: 'pierce', dmgRange: e.attackPower,
      slashLength: 18, slashWidth: 2,
      desc: 'Coup de scalpel précis',
    }),
  }),
  crimson_gladiator: (e) => ({
    strike: makeMeleeSwing({
      id: 'gladius', name: 'GLADIUS', icon: '◇',
      damageType: 'slash', dmgRange: e.attackPower,
      desc: 'Estoc romain',
    }),
    heavy: makeHeavyStrike({
      id: 'shield_bash', name: 'COUP DE BOUCLIER', icon: '✦',
      damageType: 'blunt', dmgRange: [e.attackPower[0] + 2, e.attackPower[1] + 4],
      desc: 'Charge avec le bouclier',
    }),
  }),
  crimson_minibossExecutioner: (e) => ({
    strike: makeMeleeSwing({
      id: 'axe', name: 'GROSSE HACHE', icon: '◇',
      damageType: 'slash', dmgRange: e.attackPower,
      slashLength: 38, slashWidth: 5,
      desc: 'Coup de hache massif',
    }),
    heavy: makeHeavyStrike({
      id: 'execution', name: 'EXÉCUTION', icon: '✦',
      damageType: 'slash', dmgRange: [e.attackPower[0] + 5, e.attackPower[1] + 8],
      desc: 'Coup d\'exécuteur (bonus si HP bas)',
    }),
  }),
  crimson_boss: (e) => ({
    strike: makeMeleeSwing({
      id: 'champion_strike', name: 'FRAPPE DU CHAMPION', icon: '◇',
      damageType: 'blood', dmgRange: e.attackPower,
      slashLength: 38, slashWidth: 5,
      desc: 'Frappe sanglante du champion',
    }),
    bleed: makeAoeBlast({
      id: 'blood_wave', name: 'VAGUE DE SANG', icon: '✸',
      damageType: 'blood', dmgRange: [e.attackPower[0] + 4, e.attackPower[1] + 6],
      radius: 38, desc: 'Vague de sang (AOE 2×2)',
    }),
    ultimate: makeAoeBlast({
      id: 'bloodbath', name: 'BAIN DE SANG', icon: '☠',
      damageType: 'blood', dmgRange: [e.attackPower[0] * 2, e.attackPower[1] * 2],
      radius: 50, duration: 90,
      desc: 'Carnage total (phase 2)',
    }),
  }),
};
