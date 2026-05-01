// bestiary-viewer.jsx
// Visualiseur du bestiaire de Reactor Hollow
// Esthétique : dossier classifié corpo, terminal sombre, monospace stats, néon

import React, { useState, useMemo } from 'react';

// ============ DATA EMBARQUÉE ============
// Pour l'usage standalone. Dans le vrai jeu, importer depuis bestiary.json.

const BESTIARY = {
  biomes: {
    inferno: { id: 'inferno', name: 'Secteur Inferno', shortName: 'Inferno', color: '#ff5722', accentColor: '#ffb300', danger: 'high', primaryDamage: 'fire', primaryStatuses: ['burning', 'stunned'], description: 'Ancienne fonderie d\'acier reconvertie en réacteur thermique.' },
    cryo: { id: 'cryo', name: 'Coffre Cryo', shortName: 'Cryo', color: '#4fc3f7', accentColor: '#b3e5fc', danger: 'medium', primaryDamage: 'ice', primaryStatuses: ['chilled', 'slowed', 'frozen'], description: 'Bunker de stockage cryogénique abandonné.' },
    toxic: { id: 'toxic', name: 'Friches Toxiques', shortName: 'Toxic', color: '#8bc34a', accentColor: '#cddc39', danger: 'high', primaryDamage: 'poison', primaryStatuses: ['poisoned', 'bleeding'], description: 'Décharge biotech à ciel ouvert.' },
    voidnet: { id: 'voidnet', name: 'Voidnet', shortName: 'Void', color: '#9c27b0', accentColor: '#e040fb', danger: 'very-high', primaryDamage: 'shock', primaryStatuses: ['shocked', 'silenced', 'marked'], description: 'Cyberespace corrompu, projection physique d\'un réseau qui a glitché.' },
    crimson: { id: 'crimson', name: 'Fosses Cramoisies', shortName: 'Crimson', color: '#c62828', accentColor: '#ff8a80', danger: 'medium', primaryDamage: 'slash', primaryStatuses: ['bleeding'], description: 'Arène de combat clandestine creusée sous l\'ancien stade.' },
  },
  enemies: [
    // Inferno
    { id: 'inferno_brute', name: 'Brûlant', icon: '🔥', role: 'mob', biome: 'inferno', baseHP: 38, baseDmg: [9,15], damageType: 'blunt', armor: 5, range: 1, lore: 'Ancien ouvrier de la fonderie. Sa peau a fusionné avec sa combinaison ignifugée à des températures qui auraient dû le tuer.', specialAbilities: [{ id: 'heatAura', description: 'Inflige 1 PV/tour aux ennemis adjacents' }], behavior: 'Avance lentement vers le joueur. Frappe au CaC.', tip: 'Ne reste pas adjacent. Une arme à distance le neutralise.' },
    { id: 'inferno_caster', name: 'Pyromancien Mineur', icon: '🧙‍♂️', role: 'mob', biome: 'inferno', baseHP: 22, baseDmg: [11,18], damageType: 'fire', armor: 1, range: 4, lore: 'Technicien du système de chauffage qui a appris à canaliser le flux thermique avec son cortex implanté.', specialAbilities: [{ id: 'applyBurn', description: '30% chance d\'appliquer Brûlure (3 tours)' }], behavior: 'Reste à distance. Recule si le joueur s\'approche.', tip: 'Cible prioritaire à cause des Brûlures. fireResist réduit ses dégâts ET ses DoT.' },
    { id: 'inferno_charger', name: 'Charge Cendreuse', icon: '💢', role: 'mob', biome: 'inferno', baseHP: 30, baseDmg: [12,18], damageType: 'fire', armor: 2, range: 1, lore: 'Forme dégénérée d\'un berserker. Son corps brûle sans douleur.', specialAbilities: [{ id: 'charge', description: 'Charge sur 3 cases au tour 1' }, { id: 'stunOnCharge', description: 'Étourdit 1 tour si la charge touche' }], behavior: 'Fonce à l\'engagement.', tip: 'Esquive sa première charge en bougeant en diagonale.' },
    { id: 'inferno_archer', name: 'Tireur de Phosphore', icon: '🏹', role: 'mob', biome: 'inferno', baseHP: 24, baseDmg: [9,14], damageType: 'fire', armor: 2, range: 5, lore: 'Garde de la périphérie, équipé d\'un arc à munitions au phosphore blanc.', specialAbilities: [{ id: 'applyBurn', description: '20% chance Brûlure (2 tours)' }], behavior: 'Tire à très longue portée.', tip: 'Closer rapidement ou utiliser une arme ranged.' },
    { id: 'inferno_engineer', name: 'Ingénieur Thermique', icon: '🔧', role: 'mob', biome: 'inferno', baseHP: 26, baseDmg: [7,11], damageType: 'pierce', armor: 3, range: 3, lore: 'Survivant du dernier shift. Il déploie encore les tourelles automatiques.', specialAbilities: [{ id: 'deployTurret', description: 'Déploie une tourelle (12 PV, 8 dmg, range 4) tous les 5 tours' }], behavior: 'Déploie une tourelle au début, recule.', tip: 'Tuer l\'ingénieur d\'abord pour empêcher le redéploiement.' },
    { id: 'inferno_berserker', name: 'Berserker Carbonisé', icon: '⚔️', role: 'elite', biome: 'inferno', baseHP: 65, baseDmg: [13,22], damageType: 'slash', armor: 6, range: 1, lore: 'Officier de sécurité dont le module de contrôle de la rage a brûlé.', specialAbilities: [{ id: 'rage', description: '+30% damage en dessous de 50% HP' }, { id: 'applyBurn', description: '20% chance Brûlure' }], behavior: 'Fonce au CaC. Plus agressif à mi-vie.', tip: 'Burst au-dessus de 50% HP est plus safe. Stuns le neutralisent.' },
    { id: 'inferno_minibossDrone', name: 'Drone-Sentinelle Igni-7', icon: '🤖', role: 'miniboss', biome: 'inferno', baseHP: 110, baseDmg: [15,22], damageType: 'fire', armor: 8, range: 5, lore: 'Drone de sécurité prototype, jamais déployé officiellement. Il s\'est réactivé seul.', specialAbilities: [{ id: 'flameWave', description: 'Cône de feu (3 cases) tous les 4 tours' }, { id: 'applyBurn', description: '60% chance Brûlure forte' }, { id: 'shieldRecharge', description: 'Bouclier 30 PV qui régénère hors combat' }], behavior: 'Patrouille à mi-distance. Cônes de feu en alternance.', tip: 'Burst rapide avant le 4e tour. Casser le bouclier d\'abord.' },
    { id: 'inferno_boss', name: 'Pyromancien', icon: '🔥', role: 'boss', biome: 'inferno', baseHP: 170, baseDmg: [16,24], damageType: 'fire', armor: 8, range: 5, lore: 'Le directeur du complexe. Ses implants neuraux sont fusionnés à un noyau thermonucléaire miniature.', specialAbilities: [{ id: 'infernoBurst', description: 'AOE feu 3×3 cases tous les 5 tours' }, { id: 'applyBurn', description: '40% chance Brûlure forte' }, { id: 'secondPhase', description: 'À 30% HP : invoque 2 Pyromanciens Mineurs' }], behavior: 'Reste à 4-5 cases. Téléporte si pris au CaC.', tip: 'Build avec fireResist >40% obligatoire. Tuer les adds vite en phase 2.' },
    // Cryo
    { id: 'cryo_brute', name: 'Givre-Marcheur', icon: '🧟', role: 'mob', biome: 'cryo', baseHP: 35, baseDmg: [8,13], damageType: 'ice', armor: 4, range: 1, lore: 'Prisonnier ressorti de cryostase. Sa chair est un mélange de cristal de glace et de tissu organique mort.', specialAbilities: [{ id: 'applyChill', description: '30% chance Chill (-1 PA)' }], behavior: 'Avance régulièrement. Frappe lentement mais sûr.', tip: 'Vulnérable au combo Frozen + Blunt (Shatter).' },
    { id: 'cryo_caster', name: 'Cryomancien', icon: '❄️', role: 'mob', biome: 'cryo', baseHP: 20, baseDmg: [10,16], damageType: 'ice', armor: 1, range: 4, lore: 'Médecin cryogénique qui s\'est injecté son propre sérum de conservation.', specialAbilities: [{ id: 'applyChill', description: '60% chance Chill prolongé' }, { id: 'applyFrozen', description: '10% chance Frozen 1 tour (cumulable)' }], behavior: 'Reste à distance. Spam les sorts de glace.', tip: 'Cible prio absolue. ccReduction utile contre les Frozen.' },
    { id: 'cryo_skater', name: 'Patineur Spectral', icon: '💨', role: 'mob', biome: 'cryo', baseHP: 18, baseDmg: [7,12], damageType: 'pierce', armor: 1, range: 1, lore: 'Forme la plus mobile que les Givre-Marcheurs aient développée.', specialAbilities: [{ id: 'evade', description: '+25% dodge inhérent' }, { id: 'dash', description: 'Se déplace de 4 cases' }], behavior: 'Hit and run. Frappe puis recule.', tip: 'Une attaque ranged ou un AOE le règle vite.' },
    { id: 'cryo_archer', name: 'Lanceur d\'Aiguilles', icon: '🏹', role: 'mob', biome: 'cryo', baseHP: 22, baseDmg: [10,15], damageType: 'pierce', armor: 2, range: 6, lore: 'Tire des projectiles de glace cristalline si fins qu\'ils traversent l\'armure.', specialAbilities: [{ id: 'armorPierce', description: 'Ignore 30% de l\'armure cible' }], behavior: 'Tir longue portée. Stationnaire en général.', tip: 'Dangereux pour les builds tank. Closer ou kill rapide.' },
    { id: 'cryo_shielder', name: 'Glacier Vivant', icon: '🛡️', role: 'mob', biome: 'cryo', baseHP: 50, baseDmg: [6,10], damageType: 'blunt', armor: 12, range: 1, lore: 'Bloc de glace qui a développé une primitive conscience.', specialAbilities: [{ id: 'iceArmor', description: 'Réduit dégâts ice subis de 75%' }, { id: 'guardAlly', description: 'Allies adjacents prennent -30% damage' }], behavior: 'Reste devant les casters/archers.', tip: 'Ignorer pour tuer les casters derrière, ou briser avec dégâts physiques.' },
    { id: 'cryo_sentinel', name: 'Sentinelle de Glace', icon: '⚔️', role: 'elite', biome: 'cryo', baseHP: 85, baseDmg: [10,16], damageType: 'blunt', armor: 14, range: 1, lore: 'Ancien soldat dont l\'armure a fusionné avec une couche permanente de gel.', specialAbilities: [{ id: 'applyChill', description: '40% chance Chill' }, { id: 'iceShatter', description: 'Quand tué, AOE dégâts ice 2 cases' }], behavior: 'Tank lourd. Frappe fort mais lentement.', tip: 'Le finir à distance pour éviter le shatter. armorPenetration aide.' },
    { id: 'cryo_minibossWarden', name: 'Gardien des Cellules', icon: '🗝️', role: 'miniboss', biome: 'cryo', baseHP: 130, baseDmg: [12,18], damageType: 'ice', armor: 11, range: 3, lore: 'Officier de la prison qui a refusé d\'évacuer pendant la crise.', specialAbilities: [{ id: 'summonWalker', description: 'Invoque 1 Givre-Marcheur tous les 4 tours' }, { id: 'applyFrozen', description: '20% chance Frozen 1 tour' }], behavior: 'Mid-range. Invoque des adds régulièrement.', tip: 'Burst l\'invocateur en priorité.' },
    { id: 'cryo_boss', name: 'Cryo-Reine', icon: '❄️', role: 'boss', biome: 'cryo', baseHP: 190, baseDmg: [14,22], damageType: 'ice', armor: 10, range: 4, lore: 'La directrice du programme cryogénique, première sujet de son propre protocole expérimental.', specialAbilities: [{ id: 'blizzard', description: '-2 PA pour le joueur tous les 5 tours (1 tour)' }, { id: 'applyChill', description: '50% chance Chill prolongé' }, { id: 'iceWall', description: 'À 50% HP : invoque 2 Glaciers Vivants comme bouclier' }], behavior: 'Distance moyenne. Phase 2 défensive avec adds-bouclier.', tip: 'iceResist >40%. ccReduction critique.' },
    // Toxic
    { id: 'toxic_brute', name: 'Mutant Putréfié', icon: '🦠', role: 'mob', biome: 'toxic', baseHP: 30, baseDmg: [6,10], damageType: 'poison', armor: 3, range: 1, lore: 'Ce qui restait d\'un visiteur curieux qui s\'est aventuré dans la décharge il y a deux ans.', specialAbilities: [{ id: 'applyPoison', description: '50% chance Poison (4 tours)' }, { id: 'lifesteal', description: '30% lifesteal sur ses attaques' }], behavior: 'CaC pur. Très tanky avec lifesteal.', tip: 'poisonResist annule le DoT. Burst au lieu de DPS lent.' },
    { id: 'toxic_spitter', name: 'Cracheur d\'Acide', icon: '💚', role: 'mob', biome: 'toxic', baseHP: 22, baseDmg: [8,13], damageType: 'poison', armor: 1, range: 4, lore: 'Un humanoïde dont les glandes salivaires ont muté en réservoirs corrosifs.', specialAbilities: [{ id: 'armorCorrode', description: '20% chance de réduire l\'armure cible de 5' }, { id: 'applyPoison', description: '40% chance Poison' }], behavior: 'Distance moyenne.', tip: 'Tue-le en priorité si tu joues tank.' },
    { id: 'toxic_swarmer', name: 'Essaim Bourdonnant', icon: '🪲', role: 'mob', biome: 'toxic', baseHP: 14, baseDmg: [4,7], damageType: 'poison', armor: 0, range: 1, lore: 'Pas un seul ennemi mais une nuée d\'insectes mutants se déplaçant en groupe.', specialAbilities: [{ id: 'applyPoison', description: '70% chance Poison faible' }, { id: 'swarm', description: 'Apparaît en groupes de 3-4' }], behavior: 'Toujours en groupe.', tip: 'Cible parfaite pour AOE.' },
    { id: 'toxic_carrier', name: 'Porteur de Plaies', icon: '🩸', role: 'mob', biome: 'toxic', baseHP: 28, baseDmg: [7,11], damageType: 'slash', armor: 2, range: 1, lore: 'Vecteur ambulant. Sa peau est une plaque de bactéries hostiles.', specialAbilities: [{ id: 'applyBleed', description: '60% chance Bleed' }, { id: 'deathCloud', description: 'À sa mort, nuage poison 2x2 pendant 3 tours' }], behavior: 'CaC. Sa mort laisse une zone dangereuse.', tip: 'Tuer à distance ou s\'éloigner avant le coup fatal.' },
    { id: 'toxic_grafted', name: 'Greffé de Chair', icon: '🧬', role: 'mob', biome: 'toxic', baseHP: 40, baseDmg: [9,14], damageType: 'blunt', armor: 4, range: 1, lore: 'Plusieurs corps fusionnés en un seul, avec autant de bras qu\'il y avait de victimes initiales.', specialAbilities: [{ id: 'regen', description: 'Régénère 3 PV/tour' }, { id: 'multiAttack', description: 'Frappe 2 fois par tour' }], behavior: 'CaC tanky avec régénération.', tip: 'Burst nécessaire. Bleed casse la regen.' },
    { id: 'toxic_alpha', name: 'Alpha Mutant', icon: '🦂', role: 'elite', biome: 'toxic', baseHP: 75, baseDmg: [11,18], damageType: 'poison', armor: 5, range: 2, lore: 'Le plus ancien et le plus stable des mutants. Il a appris à diriger les plus jeunes.', specialAbilities: [{ id: 'applyPoison', description: '80% Poison forte (5 tours, 4 PV)' }, { id: 'buffAllies', description: '+20% damage aux mutants alliés' }, { id: 'lifesteal', description: '40% lifesteal' }], behavior: 'Reste au milieu du groupe pour buff.', tip: 'Cible prio absolue.' },
    { id: 'toxic_minibossSpore', name: 'Mère-Spore', icon: '🍄', role: 'miniboss', biome: 'toxic', baseHP: 140, baseDmg: [10,16], damageType: 'poison', armor: 5, range: 3, lore: 'Une masse organique semi-immobile qui produit en continu des spores hostiles.', specialAbilities: [{ id: 'summonSwarm', description: 'Invoque 2 Essaims tous les 3 tours' }, { id: 'toxicAura', description: '1 PV poison/tour aux ennemis dans 3 cases' }], behavior: 'Stationnaire. Aura de poison + invocations.', tip: 'Ne pas tanker l\'aura. Burst entre invocs.' },
    { id: 'toxic_boss', name: 'Bête Putréfiée', icon: '🦠', role: 'boss', biome: 'toxic', baseHP: 200, baseDmg: [12,20], damageType: 'poison', armor: 6, range: 2, lore: 'Le sujet zéro. La première fuite, le premier mutant.', specialAbilities: [{ id: 'applyPoison', description: '60% Poison forte continue' }, { id: 'lifesteal', description: '30% lifesteal' }, { id: 'regen', description: 'Régénère 5 PV/tour' }, { id: 'spawnGrafted', description: 'À 50% HP : invoque 2 Greffés' }], behavior: 'Hyper tanky. Trois mécaniques de soin.', tip: 'Bleed très efficace contre lui (ignore armure ET regen).' },
    // Voidnet
    { id: 'voidnet_glitch', name: 'Erreur Persistante', icon: '⚡', role: 'mob', biome: 'voidnet', baseHP: 18, baseDmg: [9,14], damageType: 'shock', armor: 0, range: 3, lore: 'Un fragment de processus qui n\'a jamais terminé son exécution.', specialAbilities: [{ id: 'phaseShift', description: '30% dodge inhérent' }, { id: 'applyShock', description: '40% Shock' }], behavior: 'Imprévisible. Téléporte sur la map.', tip: 'Frustrant mais fragile.' },
    { id: 'voidnet_daemon', name: 'Daemon Mineur', icon: '👁️', role: 'mob', biome: 'voidnet', baseHP: 24, baseDmg: [11,16], damageType: 'shock', armor: 1, range: 5, lore: 'Programme système rendu sentient. Il croit accomplir une tâche d\'optimisation.', specialAbilities: [{ id: 'chainLightning', description: 'Le shock se propage à 1 ennemi adjacent' }, { id: 'applySilence', description: '15% Silence (1 tour)' }], behavior: 'Long range.', tip: 'Garder le joueur loin des autres mobs.' },
    { id: 'voidnet_executor', name: 'Exécuteur', icon: '🗡️', role: 'mob', biome: 'voidnet', baseHP: 26, baseDmg: [13,19], damageType: 'pierce', armor: 2, range: 1, lore: 'Un processus dédié à terminer toute autre process non autorisée.', specialAbilities: [{ id: 'executeBonus', description: '+50% damage sur cibles <30% HP' }, { id: 'blink', description: 'Téléporte adjacent à la cible la plus blessée' }], behavior: 'Va finir le joueur si bas HP.', tip: 'Heal-up avant qu\'il blink. Lifesteal aide.' },
    { id: 'voidnet_corrupter', name: 'Corrupteur', icon: '🔮', role: 'mob', biome: 'voidnet', baseHP: 22, baseDmg: [8,13], damageType: 'shock', armor: 1, range: 4, lore: 'Une entité qui altère les statistiques des autres process en temps réel.', specialAbilities: [{ id: 'applyMarked', description: '30% chance Marked (cible prend +25% damage)' }, { id: 'applyShock', description: '30% Shock' }], behavior: 'Mid-range.', tip: 'Cible prio dans une room mixte.' },
    { id: 'voidnet_replicator', name: 'Réplicateur', icon: '♾️', role: 'mob', biome: 'voidnet', baseHP: 20, baseDmg: [7,11], damageType: 'shock', armor: 1, range: 2, lore: 'Lui-même n\'est rien. Mais il sait se copier.', specialAbilities: [{ id: 'replicate', description: 'À 50% HP : se duplique en 2 copies' }], behavior: 'Standard.', tip: 'Tue-le en un burst.' },
    { id: 'voidnet_overclocked', name: 'Process Overclocké', icon: '💻', role: 'elite', biome: 'voidnet', baseHP: 70, baseDmg: [9,15], damageType: 'shock', armor: 4, range: 4, lore: 'Une simple boucle while qui s\'est exécutée beaucoup trop vite, beaucoup trop longtemps.', specialAbilities: [{ id: 'doubleAttack', description: 'Frappe 2 fois par tour' }, { id: 'applyShock', description: '50% Shock chain' }, { id: 'haste', description: 'Déplacement de 4 cases' }], behavior: 'Hyper mobile et frappe deux fois.', tip: 'Stuns/Frozen sont vitaux.' },
    { id: 'voidnet_minibossKernel', name: 'Sous-Noyau de Trame', icon: '🌐', role: 'miniboss', biome: 'voidnet', baseHP: 120, baseDmg: [14,22], damageType: 'shock', armor: 5, range: 6, lore: 'Un fragment du noyau central du Voidnet, séparé du reste après une mise à jour cassée.', specialAbilities: [{ id: 'lightningField', description: '4 cases aléatoires reçoivent dmg shock tous les 4 tours' }, { id: 'applySilence', description: '30% Silence' }, { id: 'applyMarked', description: 'Marked sur tous les hits crit' }], behavior: 'Très longue portée.', tip: 'shockResist et mobilité. Anti-CC obligatoire.' },
    { id: 'voidnet_boss', name: 'Architecte du Vide', icon: '⚡', role: 'boss', biome: 'voidnet', baseHP: 160, baseDmg: [18,28], damageType: 'shock', armor: 5, range: 6, lore: 'Le créateur du Voidnet, devenu sa propre création.', specialAbilities: [{ id: 'voidStorm', description: 'AOE shock 4×4 cases tous les 5 tours' }, { id: 'applyShock', description: '50% Shock chain' }, { id: 'phaseShift', description: 'À 50% HP : invulnérable 1 tour, téléporte' }, { id: 'summonDaemons', description: 'À 30% HP : invoque 3 Daemons' }], behavior: 'Distance maximum, AOE périodique.', tip: 'shockResist >40%. Burst en sortie de phase shift.' },
    // Crimson
    { id: 'crimson_brawler', name: 'Bagarreur de Fosse', icon: '👊', role: 'mob', biome: 'crimson', baseHP: 32, baseDmg: [10,16], damageType: 'blunt', armor: 3, range: 1, lore: 'Un combattant amateur qui n\'a jamais quitté l\'arène.', specialAbilities: [{ id: 'applyBleed', description: '30% Bleed' }, { id: 'rage', description: '+20% damage sous 50% HP' }], behavior: 'Fonce, frappe fort.', tip: 'Burst au-dessus de 50% est plus safe.' },
    { id: 'crimson_butcher', name: 'Boucher', icon: '🔪', role: 'mob', biome: 'crimson', baseHP: 36, baseDmg: [13,20], damageType: 'slash', armor: 4, range: 1, lore: 'Spécialiste du dépeçage qui a élargi son répertoire à tout ce qui bouge.', specialAbilities: [{ id: 'applyBleed', description: '60% Bleed forte (3 tours, 5 PV)' }, { id: 'executeBonus', description: '+30% damage sur cibles <30% HP' }], behavior: 'CaC.', tip: 'Ne jamais rester en bas HP à proximité.' },
    { id: 'crimson_throwblade', name: 'Lanceur de Lames', icon: '🗡️', role: 'mob', biome: 'crimson', baseHP: 22, baseDmg: [11,17], damageType: 'pierce', armor: 1, range: 5, lore: 'Tireur d\'élite de la fosse.', specialAbilities: [{ id: 'applyBleed', description: '40% Bleed' }], behavior: 'Distance pure.', tip: 'Closer ou ranged kill.' },
    { id: 'crimson_hooked', name: 'Crocheteur', icon: '🪝', role: 'mob', biome: 'crimson', baseHP: 28, baseDmg: [9,14], damageType: 'pierce', armor: 2, range: 4, lore: 'Un maître du grappin. Personne ne s\'enfuit.', specialAbilities: [{ id: 'hook', description: 'Tire la cible de 3 cases (1× par combat)' }, { id: 'applyBleed', description: '30% Bleed' }], behavior: 'Range moyenne. Pull dès l\'engagement.', tip: 'S\'attendre au pull au tour 1.' },
    { id: 'crimson_doctor', name: 'Docteur de Sang', icon: '🩺', role: 'mob', biome: 'crimson', baseHP: 20, baseDmg: [6,10], damageType: 'pierce', armor: 1, range: 1, lore: 'Médecin qui a renoncé à soigner pour collecter à la place.', specialAbilities: [{ id: 'healAllies', description: 'Heal 8 PV à un allié blessé adjacent' }, { id: 'lifesteal', description: '50% lifesteal (rare)' }], behavior: 'Soutien.', tip: 'Cible prio dans une room.' },
    { id: 'crimson_gladiator', name: 'Gladiateur', icon: '⚔️', role: 'elite', biome: 'crimson', baseHP: 80, baseDmg: [14,22], damageType: 'slash', armor: 7, range: 1, lore: 'Le champion local. Il a battu tout le monde dans sa catégorie.', specialAbilities: [{ id: 'applyBleed', description: '50% Bleed' }, { id: 'rage', description: '+30% damage sous 50% HP' }, { id: 'blockChance', description: '30% chance de bloquer (réduit dégâts moitié)' }], behavior: 'CaC. Tank ET DPS.', tip: 'Burst au-dessus de 50% prio. Stuns le neutralisent.' },
    { id: 'crimson_minibossExecutioner', name: 'Exécuteur de l\'Arène', icon: '🪓', role: 'miniboss', biome: 'crimson', baseHP: 130, baseDmg: [20,30], damageType: 'slash', armor: 9, range: 1, lore: 'Le bourreau officiel des matches à mort. Sa hache est plus vieille que lui.', specialAbilities: [{ id: 'executeBonus', description: '+80% damage sur cibles <40% HP' }, { id: 'applyBleed', description: '60% Bleed forte' }, { id: 'armorPiercing', description: 'Ignore 40% de l\'armure cible' }], behavior: 'CaC pur.', tip: 'Garder >40% HP en permanence.' },
    { id: 'crimson_boss', name: 'Champion du Sang', icon: '🩸', role: 'boss', biome: 'crimson', baseHP: 180, baseDmg: [20,30], damageType: 'slash', armor: 7, range: 1, lore: 'L\'invaincu de la fosse depuis 14 ans. Il a perdu compte de combien il a tué.', specialAbilities: [{ id: 'applyBleed', description: '50% Bleed très forte (4 tours, 6 PV)' }, { id: 'executeBonus', description: '+50% damage sur cibles <30% HP' }, { id: 'armorPiercing', description: 'Ignore 50% de l\'armure du joueur' }, { id: 'rampUpDamage', description: '+5% damage par tour passé en combat' }, { id: 'spawnButchers', description: 'À 33% HP : invoque 2 Bouchers' }], behavior: 'Pur DPS physique avec armor pierce.', tip: 'Tuer vite obligatoire. Bleed reste très efficace contre lui.' },
  ],
};

// ============ CONSTANTS ============

const ROLE_LABELS = {
  mob: { label: 'STANDARD', color: '#888' },
  elite: { label: 'ELITE', color: '#ff9800' },
  miniboss: { label: 'MINI-BOSS', color: '#e91e63' },
  boss: { label: 'BOSS', color: '#f44336' },
};

const DAMAGE_COLORS = {
  slash: '#ff5252', pierce: '#ffeb3b', blunt: '#bdbdbd',
  fire: '#ff5722', ice: '#4fc3f7', shock: '#9c27b0',
  poison: '#8bc34a', magic: '#e040fb',
};

// ============ UI COMPONENTS ============

function StatRow({ label, value, color }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '6px 0', borderBottom: '1px dashed #333' }}>
      <span style={{ fontSize: 11, letterSpacing: 1.5, color: '#666', textTransform: 'uppercase' }}>{label}</span>
      <span style={{ fontFamily: '"JetBrains Mono", monospace', color: color || '#e0e0e0', fontWeight: 600 }}>{value}</span>
    </div>
  );
}

function DangerBadge({ danger }) {
  const map = {
    'medium': { label: 'MODÉRÉ', color: '#ffc107' },
    'high': { label: 'ÉLEVÉ', color: '#ff5722' },
    'very-high': { label: 'CRITIQUE', color: '#f44336' },
  };
  const d = map[danger] || map['medium'];
  return (
    <span style={{
      fontFamily: '"JetBrains Mono", monospace',
      fontSize: 10,
      letterSpacing: 2,
      padding: '3px 8px',
      border: `1px solid ${d.color}`,
      color: d.color,
      background: `${d.color}15`,
      textTransform: 'uppercase',
    }}>{d.label}</span>
  );
}

function EnemyCard({ enemy, biome, isSelected, onClick }) {
  const role = ROLE_LABELS[enemy.role];
  const dmgColor = DAMAGE_COLORS[enemy.damageType] || '#ccc';

  return (
    <div
      onClick={onClick}
      style={{
        cursor: 'pointer',
        padding: '14px',
        background: isSelected ? `linear-gradient(135deg, ${biome.color}25, transparent)` : '#0d0d0f',
        border: `1px solid ${isSelected ? biome.color : '#1f1f24'}`,
        position: 'relative',
        transition: 'all 0.15s ease',
      }}
    >
      {/* Coin top-left */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: 8, height: 8, borderTop: `2px solid ${biome.color}`, borderLeft: `2px solid ${biome.color}` }} />
      <div style={{ position: 'absolute', bottom: 0, right: 0, width: 8, height: 8, borderBottom: `2px solid ${biome.color}80`, borderRight: `2px solid ${biome.color}80` }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ fontSize: 32, lineHeight: 1, filter: enemy.role === 'boss' ? 'drop-shadow(0 0 8px ' + biome.color + ')' : 'none' }}>
          {enemy.icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
            <span style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: 9,
              letterSpacing: 1.5,
              color: role.color,
              padding: '1px 5px',
              border: `1px solid ${role.color}40`,
            }}>{role.label}</span>
          </div>
          <div style={{
            fontFamily: '"Orbitron", "JetBrains Mono", monospace',
            fontSize: 15,
            fontWeight: 700,
            color: '#fff',
            letterSpacing: 0.5,
            marginBottom: 4,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>{enemy.name}</div>
          <div style={{ display: 'flex', gap: 12, fontSize: 11, fontFamily: '"JetBrains Mono", monospace', color: '#999' }}>
            <span>HP <span style={{ color: '#fff' }}>{enemy.baseHP}</span></span>
            <span>DMG <span style={{ color: dmgColor }}>{enemy.baseDmg[0]}-{enemy.baseDmg[1]}</span></span>
          </div>
        </div>
      </div>
    </div>
  );
}

function EnemyDetail({ enemy, biome }) {
  const role = ROLE_LABELS[enemy.role];
  const dmgColor = DAMAGE_COLORS[enemy.damageType] || '#ccc';
  const avgDmg = (enemy.baseDmg[0] + enemy.baseDmg[1]) / 2;

  return (
    <div style={{
      background: '#0a0a0c',
      border: `1px solid ${biome.color}40`,
      padding: '24px',
      position: 'relative',
      minHeight: '100%',
    }}>
      {/* Décorations en coins */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: 16, height: 16, borderTop: `2px solid ${biome.color}`, borderLeft: `2px solid ${biome.color}` }} />
      <div style={{ position: 'absolute', top: 0, right: 0, width: 16, height: 16, borderTop: `2px solid ${biome.color}`, borderRight: `2px solid ${biome.color}` }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, width: 16, height: 16, borderBottom: `2px solid ${biome.color}`, borderLeft: `2px solid ${biome.color}` }} />
      <div style={{ position: 'absolute', bottom: 0, right: 0, width: 16, height: 16, borderBottom: `2px solid ${biome.color}`, borderRight: `2px solid ${biome.color}` }} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, marginBottom: 24 }}>
        <div style={{
          fontSize: 64,
          lineHeight: 1,
          padding: '12px',
          background: `${biome.color}10`,
          border: `1px solid ${biome.color}30`,
          filter: enemy.role === 'boss' ? `drop-shadow(0 0 16px ${biome.color})` : `drop-shadow(0 0 4px ${biome.color}80)`,
        }}>
          {enemy.icon}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: 2, color: '#666', marginBottom: 6 }}>
            FILE://BESTIARY/{enemy.id.toUpperCase()}
          </div>
          <div style={{
            fontFamily: '"Orbitron", "JetBrains Mono", monospace',
            fontSize: 28,
            fontWeight: 800,
            color: '#fff',
            letterSpacing: 1,
            lineHeight: 1.1,
            marginBottom: 8,
          }}>{enemy.name}</div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: 10,
              letterSpacing: 2,
              color: role.color,
              padding: '3px 8px',
              border: `1px solid ${role.color}`,
              background: `${role.color}15`,
            }}>{role.label}</span>
            <span style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: 10,
              letterSpacing: 2,
              color: biome.color,
              padding: '3px 8px',
              border: `1px solid ${biome.color}`,
              background: `${biome.color}15`,
            }}>{biome.shortName.toUpperCase()}</span>
            <span style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: 10,
              letterSpacing: 2,
              color: dmgColor,
              padding: '3px 8px',
              border: `1px solid ${dmgColor}`,
              background: `${dmgColor}15`,
            }}>{enemy.damageType.toUpperCase()}</span>
          </div>
        </div>
      </div>

      {/* Lore */}
      <div style={{
        padding: '16px 20px',
        background: '#000',
        border: `1px solid #1f1f24`,
        borderLeft: `3px solid ${biome.color}`,
        marginBottom: 24,
        fontStyle: 'italic',
        fontSize: 14,
        lineHeight: 1.6,
        color: '#bbb',
      }}>
        {enemy.lore}
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        <div>
          <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: 2, color: biome.color, marginBottom: 8 }}>
            ◢ STATS DE BASE
          </div>
          <StatRow label="HP" value={enemy.baseHP} />
          <StatRow label="Dégâts" value={`${enemy.baseDmg[0]}-${enemy.baseDmg[1]} (avg ${avgDmg.toFixed(0)})`} color={dmgColor} />
          <StatRow label="Type dmg" value={enemy.damageType} color={dmgColor} />
          <StatRow label="Armure" value={enemy.armor} />
          <StatRow label="Range" value={`${enemy.range} ${enemy.range === 1 ? 'case' : 'cases'}`} />
        </div>

        <div>
          <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: 2, color: biome.color, marginBottom: 8 }}>
            ◢ SCALING (par lvl)
          </div>
          <StatRow label="HP lvl 1" value={Math.round(enemy.baseHP * 0.40 * (enemy.role === 'boss' ? 1.35 : enemy.role === 'elite' ? 1.15 : 1))} />
          <StatRow label="HP lvl 5" value={Math.round(enemy.baseHP * 1.20 * (enemy.role === 'boss' ? 1.35 : enemy.role === 'elite' ? 1.15 : 1))} />
          <StatRow label="HP lvl 10" value={Math.round(enemy.baseHP * 3.50 * (enemy.role === 'boss' ? 1.35 : enemy.role === 'elite' ? 1.15 : 1))} />
          <StatRow label="DMG lvl 5" value={`${Math.round(enemy.baseDmg[0] * 1.14)}-${Math.round(enemy.baseDmg[1] * 1.14)}`} color={dmgColor} />
          <StatRow label="DMG lvl 10" value={`${Math.round(enemy.baseDmg[0] * 3.33)}-${Math.round(enemy.baseDmg[1] * 3.33)}`} color={dmgColor} />
        </div>
      </div>

      {/* Capacités */}
      {enemy.specialAbilities && enemy.specialAbilities.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: 2, color: biome.color, marginBottom: 12 }}>
            ◢ CAPACITÉS SPÉCIALES
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {enemy.specialAbilities.map((a, i) => (
              <div key={i} style={{
                padding: '10px 14px',
                background: '#0d0d0f',
                border: '1px solid #1f1f24',
                display: 'flex',
                gap: 12,
                alignItems: 'flex-start',
              }}>
                <div style={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: 9,
                  color: biome.accentColor,
                  letterSpacing: 1.5,
                  paddingTop: 2,
                  minWidth: 80,
                  textTransform: 'uppercase',
                }}>{a.id}</div>
                <div style={{ flex: 1, fontSize: 13, color: '#ddd', lineHeight: 1.5 }}>{a.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Comportement */}
      {enemy.behavior && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: 2, color: biome.color, marginBottom: 8 }}>
            ◢ COMPORTEMENT
          </div>
          <div style={{ fontSize: 13, color: '#bbb', lineHeight: 1.6 }}>{enemy.behavior}</div>
        </div>
      )}

      {/* Tip */}
      {enemy.tip && (
        <div style={{
          padding: '12px 16px',
          background: `${biome.accentColor}10`,
          border: `1px solid ${biome.accentColor}40`,
          borderLeft: `3px solid ${biome.accentColor}`,
        }}>
          <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: 2, color: biome.accentColor, marginBottom: 4 }}>
            ▸ STRATÉGIE
          </div>
          <div style={{ fontSize: 13, color: '#ddd', lineHeight: 1.6 }}>{enemy.tip}</div>
        </div>
      )}
    </div>
  );
}

// ============ MAIN ============

export default function BestiaryViewer() {
  const [selectedBiome, setSelectedBiome] = useState('all');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedEnemyId, setSelectedEnemyId] = useState('inferno_boss');
  const [search, setSearch] = useState('');

  const filteredEnemies = useMemo(() => {
    return BESTIARY.enemies.filter(e => {
      if (selectedBiome !== 'all' && e.biome !== selectedBiome) return false;
      if (selectedRole !== 'all' && e.role !== selectedRole) return false;
      if (search && !e.name.toLowerCase().includes(search.toLowerCase()) && !e.lore.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [selectedBiome, selectedRole, search]);

  const selectedEnemy = BESTIARY.enemies.find(e => e.id === selectedEnemyId);
  const selectedEnemyBiome = selectedEnemy ? BESTIARY.biomes[selectedEnemy.biome] : null;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at top, #0a0e14 0%, #050507 100%)',
      color: '#e0e0e0',
      fontFamily: '"Inter", system-ui, sans-serif',
      padding: 0,
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Orbitron:wght@400;700;800;900&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: #0a0a0c; }
        ::-webkit-scrollbar-thumb { background: #2a2a30; }
        ::-webkit-scrollbar-thumb:hover { background: #3a3a40; }
        .scanline {
          background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.015) 2px, rgba(255,255,255,0.015) 4px);
          position: absolute; top: 0; left: 0; right: 0; bottom: 0; pointer-events: none;
        }
      `}</style>

      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '32px 24px', position: 'relative' }}>
        <div className="scanline" />

        {/* Header */}
        <header style={{ marginBottom: 32, paddingBottom: 24, borderBottom: '1px solid #1f1f24', position: 'relative', zIndex: 1 }}>
          <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 11, letterSpacing: 3, color: '#ff5252', marginBottom: 8 }}>
            ◤ DOSSIER CLASSIFIÉ — NIVEAU 4 — REACTOR HOLLOW SECURITY ◢
          </div>
          <div style={{
            fontFamily: '"Orbitron", monospace',
            fontSize: 42,
            fontWeight: 900,
            letterSpacing: 4,
            color: '#fff',
            textTransform: 'uppercase',
            lineHeight: 1,
            marginBottom: 12,
          }}>BESTIAIRE</div>
          <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 12, color: '#666', letterSpacing: 1.5 }}>
            {BESTIARY.enemies.length} ENTITÉS_RÉPERTORIÉES // {Object.keys(BESTIARY.biomes).length} BIOMES_ACTIFS // RÉVISION_1.0
          </div>
        </header>

        {/* Filtres */}
        <section style={{ marginBottom: 24, position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', marginBottom: 16 }}>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Recherche par nom ou description..."
              style={{
                flex: '1 1 280px',
                padding: '10px 14px',
                background: '#0d0d0f',
                border: '1px solid #2a2a30',
                color: '#e0e0e0',
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: 12,
                outline: 'none',
                letterSpacing: 0.5,
              }}
            />
            <div style={{ display: 'flex', gap: 6 }}>
              {['all', 'mob', 'elite', 'miniboss', 'boss'].map(r => (
                <button
                  key={r}
                  onClick={() => setSelectedRole(r)}
                  style={{
                    padding: '8px 12px',
                    background: selectedRole === r ? '#ff5252' : 'transparent',
                    border: `1px solid ${selectedRole === r ? '#ff5252' : '#2a2a30'}`,
                    color: selectedRole === r ? '#000' : '#888',
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: 10,
                    letterSpacing: 1.5,
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                  }}
                >{r === 'all' ? 'TOUS' : (ROLE_LABELS[r]?.label || r)}</button>
              ))}
            </div>
          </div>

          {/* Onglets biomes */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            <button
              onClick={() => setSelectedBiome('all')}
              style={{
                padding: '10px 16px',
                background: selectedBiome === 'all' ? '#fff' : 'transparent',
                border: `1px solid ${selectedBiome === 'all' ? '#fff' : '#2a2a30'}`,
                color: selectedBiome === 'all' ? '#000' : '#888',
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: 11,
                letterSpacing: 2,
                cursor: 'pointer',
              }}
            >TOUS LES BIOMES</button>
            {Object.values(BESTIARY.biomes).map(b => (
              <button
                key={b.id}
                onClick={() => setSelectedBiome(b.id)}
                style={{
                  padding: '10px 16px',
                  background: selectedBiome === b.id ? b.color : 'transparent',
                  border: `1px solid ${selectedBiome === b.id ? b.color : '#2a2a30'}`,
                  color: selectedBiome === b.id ? '#000' : '#888',
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: 11,
                  letterSpacing: 2,
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                }}
              >{b.shortName}</button>
            ))}
          </div>

          {/* Description du biome sélectionné */}
          {selectedBiome !== 'all' && (() => {
            const b = BESTIARY.biomes[selectedBiome];
            return (
              <div style={{
                marginTop: 16,
                padding: '16px 20px',
                background: `${b.color}08`,
                borderLeft: `3px solid ${b.color}`,
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                flexWrap: 'wrap',
              }}>
                <div style={{ flex: '1 1 300px' }}>
                  <div style={{ fontFamily: '"Orbitron", monospace', fontSize: 18, fontWeight: 700, color: b.color, marginBottom: 4 }}>{b.name}</div>
                  <div style={{ fontSize: 13, color: '#bbb', lineHeight: 1.5, fontStyle: 'italic' }}>{b.description}</div>
                </div>
                <DangerBadge danger={b.danger} />
              </div>
            );
          })()}
        </section>

        {/* Layout principal : grid d'ennemis + détail */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 5fr) minmax(0, 7fr)', gap: 24, position: 'relative', zIndex: 1 }}>
          {/* Liste des ennemis */}
          <div>
            <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: 2, color: '#666', marginBottom: 12 }}>
              ◢ ENTRÉES ({filteredEnemies.length})
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 8 }}>
              {filteredEnemies.map(e => (
                <EnemyCard
                  key={e.id}
                  enemy={e}
                  biome={BESTIARY.biomes[e.biome]}
                  isSelected={e.id === selectedEnemyId}
                  onClick={() => setSelectedEnemyId(e.id)}
                />
              ))}
            </div>
            {filteredEnemies.length === 0 && (
              <div style={{ padding: 32, textAlign: 'center', color: '#666', fontFamily: '"JetBrains Mono", monospace', fontSize: 12 }}>
                NO_ENTRIES_FOUND
              </div>
            )}
          </div>

          {/* Détail */}
          <div>
            {selectedEnemy && selectedEnemyBiome ? (
              <EnemyDetail enemy={selectedEnemy} biome={selectedEnemyBiome} />
            ) : (
              <div style={{ padding: 48, textAlign: 'center', color: '#666' }}>
                Sélectionnez une entité pour voir les détails
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer style={{ marginTop: 48, paddingTop: 24, borderTop: '1px solid #1f1f24', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: 2, color: '#444' }}>
            ◤ END_OF_FILE ◢ // GENERATED BY R-H_SEC_DIVISION // EYES_ONLY
          </div>
        </footer>
      </div>
    </div>
  );
}
