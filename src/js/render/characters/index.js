// src/js/render/characters/index.js
// Registry global des renderers — hero + 40 ennemis.
// Arborescence:
//   src/js/render/characters/index.js  ← ce fichier
//   src/js/render/characters/hero.js
//   src/js/render/enemies/<id>.js      ← 40 fichiers

import hero from './hero.js';

// CRIMSON (8)
import crimson_brawler from '../enemies/crimson_brawler.js';
import crimson_butcher from '../enemies/crimson_butcher.js';
import crimson_throwblade from '../enemies/crimson_throwblade.js';
import crimson_hooked from '../enemies/crimson_hooked.js';
import crimson_doctor from '../enemies/crimson_doctor.js';
import crimson_gladiator from '../enemies/crimson_gladiator.js';
import crimson_minibossExecutioner from '../enemies/crimson_minibossExecutioner.js';
import crimson_boss from '../enemies/crimson_boss.js';

// CRYO (8)
import cryo_brute from '../enemies/cryo_brute.js';
import cryo_caster from '../enemies/cryo_caster.js';
import cryo_skater from '../enemies/cryo_skater.js';
import cryo_archer from '../enemies/cryo_archer.js';
import cryo_shielder from '../enemies/cryo_shielder.js';
import cryo_sentinel from '../enemies/cryo_sentinel.js';
import cryo_minibossWarden from '../enemies/cryo_minibossWarden.js';
import cryo_boss from '../enemies/cryo_boss.js';

// INFERNO (8)
import inferno_brute from '../enemies/inferno_brute.js';
import inferno_caster from '../enemies/inferno_caster.js';
import inferno_charger from '../enemies/inferno_charger.js';
import inferno_archer from '../enemies/inferno_archer.js';
import inferno_engineer from '../enemies/inferno_engineer.js';
import inferno_berserker from '../enemies/inferno_berserker.js';
import inferno_minibossDrone from '../enemies/inferno_minibossDrone.js';
import inferno_boss from '../enemies/inferno_boss.js';

// TOXIC (8)
import toxic_brute from '../enemies/toxic_brute.js';
import toxic_spitter from '../enemies/toxic_spitter.js';
import toxic_swarmer from '../enemies/toxic_swarmer.js';
import toxic_carrier from '../enemies/toxic_carrier.js';
import toxic_grafted from '../enemies/toxic_grafted.js';
import toxic_alpha from '../enemies/toxic_alpha.js';
import toxic_minibossSpore from '../enemies/toxic_minibossSpore.js';
import toxic_boss from '../enemies/toxic_boss.js';

// VOIDNET (8)
import voidnet_glitch from '../enemies/voidnet_glitch.js';
import voidnet_daemon from '../enemies/voidnet_daemon.js';
import voidnet_executor from '../enemies/voidnet_executor.js';
import voidnet_corrupter from '../enemies/voidnet_corrupter.js';
import voidnet_replicator from '../enemies/voidnet_replicator.js';
import voidnet_overclocked from '../enemies/voidnet_overclocked.js';
import voidnet_minibossKernel from '../enemies/voidnet_minibossKernel.js';
import voidnet_boss from '../enemies/voidnet_boss.js';

// ─── REGISTRY: id → fonction draw ───
export const CHARACTER_RENDERERS = {
  hero: hero.drawHero,

  // CRIMSON
  crimson_brawler: crimson_brawler.drawCrimsonBrawler,
  crimson_butcher: crimson_butcher.drawCrimsonButcher,
  crimson_throwblade: crimson_throwblade.drawCrimsonThrowblade,
  crimson_hooked: crimson_hooked.drawCrimsonHooked,
  crimson_doctor: crimson_doctor.drawCrimsonDoctor,
  crimson_gladiator: crimson_gladiator.drawCrimsonGladiator,
  crimson_minibossExecutioner: crimson_minibossExecutioner.drawCrimsonMinibossExecutioner,
  crimson_boss: crimson_boss.drawCrimsonBoss,

  // CRYO
  cryo_brute: cryo_brute.drawCryoBrute,
  cryo_caster: cryo_caster.drawCryoCaster,
  cryo_skater: cryo_skater.drawCryoSkater,
  cryo_archer: cryo_archer.drawCryoArcher,
  cryo_shielder: cryo_shielder.drawCryoShielder,
  cryo_sentinel: cryo_sentinel.drawCryoSentinel,
  cryo_minibossWarden: cryo_minibossWarden.drawCryoMinibossWarden,
  cryo_boss: cryo_boss.drawCryoBoss,

  // INFERNO
  inferno_brute: inferno_brute.drawInfernoBrute,
  inferno_caster: inferno_caster.drawInfernoCaster,
  inferno_charger: inferno_charger.drawInfernoCharger,
  inferno_archer: inferno_archer.drawInfernoArcher,
  inferno_engineer: inferno_engineer.drawInfernoEngineer,
  inferno_berserker: inferno_berserker.drawInfernoBerserker,
  inferno_minibossDrone: inferno_minibossDrone.drawInfernoMinibossDrone,
  inferno_boss: inferno_boss.drawInfernoBoss,

  // TOXIC
  toxic_brute: toxic_brute.drawToxicBrute,
  toxic_spitter: toxic_spitter.drawToxicSpitter,
  toxic_swarmer: toxic_swarmer.drawToxicSwarmer,
  toxic_carrier: toxic_carrier.drawToxicCarrier,
  toxic_grafted: toxic_grafted.drawToxicGrafted,
  toxic_alpha: toxic_alpha.drawToxicAlpha,
  toxic_minibossSpore: toxic_minibossSpore.drawToxicMinibossSpore,
  toxic_boss: toxic_boss.drawToxicBoss,

  // VOIDNET
  voidnet_glitch: voidnet_glitch.drawVoidnetGlitch,
  voidnet_daemon: voidnet_daemon.drawVoidnetDaemon,
  voidnet_executor: voidnet_executor.drawVoidnetExecutor,
  voidnet_corrupter: voidnet_corrupter.drawVoidnetCorrupter,
  voidnet_replicator: voidnet_replicator.drawVoidnetReplicator,
  voidnet_overclocked: voidnet_overclocked.drawVoidnetOverclocked,
  voidnet_minibossKernel: voidnet_minibossKernel.drawVoidnetMinibossKernel,
  voidnet_boss: voidnet_boss.drawVoidnetBoss,
};

// ─── REGISTRY: id → palette config par défaut ───
export const CHARACTER_CONFIGS = {
  hero: hero.heroConfig,

  // CRIMSON
  crimson_brawler: crimson_brawler.crimsonBrawlerConfig,
  crimson_butcher: crimson_butcher.crimsonButcherConfig,
  crimson_throwblade: crimson_throwblade.crimsonThrowbladeConfig,
  crimson_hooked: crimson_hooked.crimsonHookedConfig,
  crimson_doctor: crimson_doctor.crimsonDoctorConfig,
  crimson_gladiator: crimson_gladiator.crimsonGladiatorConfig,
  crimson_minibossExecutioner: crimson_minibossExecutioner.crimsonMinibossExecutionerConfig,
  crimson_boss: crimson_boss.crimsonBossConfig,

  // CRYO
  cryo_brute: cryo_brute.cryoBruteConfig,
  cryo_caster: cryo_caster.cryoCasterConfig,
  cryo_skater: cryo_skater.cryoSkaterConfig,
  cryo_archer: cryo_archer.cryoArcherConfig,
  cryo_shielder: cryo_shielder.cryoShielderConfig,
  cryo_sentinel: cryo_sentinel.cryoSentinelConfig,
  cryo_minibossWarden: cryo_minibossWarden.cryoMinibossWardenConfig,
  cryo_boss: cryo_boss.cryoBossConfig,

  // INFERNO
  inferno_brute: inferno_brute.infernoBruteConfig,
  inferno_caster: inferno_caster.infernoCasterConfig,
  inferno_charger: inferno_charger.infernoChargerConfig,
  inferno_archer: inferno_archer.infernoArcherConfig,
  inferno_engineer: inferno_engineer.infernoEngineerConfig,
  inferno_berserker: inferno_berserker.infernoBerserkerConfig,
  inferno_minibossDrone: inferno_minibossDrone.infernoMinibossDroneConfig,
  inferno_boss: inferno_boss.infernoBossConfig,

  // TOXIC
  toxic_brute: toxic_brute.toxicBruteConfig,
  toxic_spitter: toxic_spitter.toxicSpitterConfig,
  toxic_swarmer: toxic_swarmer.toxicSwarmerConfig,
  toxic_carrier: toxic_carrier.toxicCarrierConfig,
  toxic_grafted: toxic_grafted.toxicGraftedConfig,
  toxic_alpha: toxic_alpha.toxicAlphaConfig,
  toxic_minibossSpore: toxic_minibossSpore.toxicMinibossSporeConfig,
  toxic_boss: toxic_boss.toxicBossConfig,

  // VOIDNET
  voidnet_glitch: voidnet_glitch.voidnetGlitchConfig,
  voidnet_daemon: voidnet_daemon.voidnetDaemonConfig,
  voidnet_executor: voidnet_executor.voidnetExecutorConfig,
  voidnet_corrupter: voidnet_corrupter.voidnetCorrupterConfig,
  voidnet_replicator: voidnet_replicator.voidnetReplicatorConfig,
  voidnet_overclocked: voidnet_overclocked.voidnetOverclockedConfig,
  voidnet_minibossKernel: voidnet_minibossKernel.voidnetMinibossKernelConfig,
  voidnet_boss: voidnet_boss.voidnetBossConfig,
};

export const CHARACTER_IDS = Object.keys(CHARACTER_RENDERERS);
export const DEFAULT_RENDERER = hero.drawHero;
export const DEFAULT_CONFIG = hero.heroConfig;

// ─── Helpers compat avec iso-engine.js et autres consommateurs ───
// L'ancien API exposait `getCharacterRenderer(id)` et `getCharacterConfig(id)`
// pour retrouver le couple draw + palette d'un actor en jeu.
// On les ré-expose pour ne pas casser le moteur de rendu in-game.

export function getCharacterRenderer(id){
  return CHARACTER_RENDERERS[id] || DEFAULT_RENDERER;
}

export function getCharacterConfig(id){
  return CHARACTER_CONFIGS[id] || DEFAULT_CONFIG;
}

// Alias legacy : certains fichiers utilisaient `drawCharacter(ctx, id, ...)`
// On l'expose au cas où.
export function drawCharacter(ctx, id, cx, cy, actor, time, options){
  const fn = getCharacterRenderer(id);
  return fn(ctx, cx, cy, actor, time, options);
}
