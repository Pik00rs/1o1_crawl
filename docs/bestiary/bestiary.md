# 🩸 Bestiaire de Reactor Hollow

> 40 entités hostiles réparties sur 5 biomes, chacun avec sa palette d'élements, de statuts, et son boss.

---

## Vue d'ensemble

| Biome | Danger | Élément | Statuts | Loot |
|---|---|---|---|---|
| 🔥 Secteur Inferno | Élevé | Feu | Brûlure, Étourdi | Set Linceul des Cendres |
| ❄️ Coffre Cryo | Modéré | Glace | Chill, Slow, Frozen | Set Manteau Glacé |
| ☣️ Friches Toxiques | Élevé | Poison | Poison, Bleed | Set Robe Toxique |
| ⚡ Voidnet | Très élevé | Foudre | Shock, Silence, Marked | Set Trame du Vide |
| 🩸 Fosses Cramoisies | Modéré | Tranchant | Bleed | Set Voie du Sang |

Chaque biome contient :
- **5 mobs basiques** (rôle : `mob`) — variations stat moyenne, complémentaires entre eux
- **1 élite** (rôle : `elite`) — version plus dangereuse, apparaît dans les salles 3-4
- **1 mini-boss** (rôle : `miniboss`) — encounter optionnel ou en milieu de donjon
- **1 boss** (rôle : `boss`) — combat final

---

## 🔥 Secteur Inferno

> *"Ancienne fonderie d'acier reconvertie en réacteur thermique. Les conduits de magma à ciel ouvert ont fait fondre la structure jusqu'à la rendre méconnaissable. Les habitants de cette zone ont muté autour de la chaleur."*

**Conseil général** : `fireResist > 30%` recommandé. Anti-stuns utile (le boss et les chargers).

### 🔥 Brûlant — *mob*
HP `38` · Dégâts `9-15` blunt · Armure `5` · Range `1`

Ouvrier de la fonderie dont la peau a fusionné avec sa combinaison ignifugée. Aujourd'hui il marche encore, et la chaleur radie de lui.

- **Aura de chaleur** : 1 PV/tour aux entités adjacentes (passif)
- *Comportement : avance lentement, frappe au CaC.*
- *Tip : ne reste pas adjacent. Une arme ranged le neutralise.*

### 🧙‍♂️ Pyromancien Mineur — *mob*
HP `22` · Dégâts `11-18` fire · Armure `1` · Range `4`

Technicien du chauffage qui a appris à canaliser le flux thermique avec son cortex implanté.

- **Brûlure** : 30% chance d'appliquer Brûlure (3 tours)
- *Reste à distance, recule si on s'approche.*
- *Tip : cible prio. fireResist réduit ses dégâts ET ses DoT.*

### 💢 Charge Cendreuse — *mob*
HP `30` · Dégâts `12-18` fire · Armure `2` · Range `1`

Forme dégénérée de berserker. Brûle sans douleur, fonce, percute.

- **Charge** : 3 cases au tour 1 du combat
- **Stun on Charge** : étourdit 1 tour si elle touche
- *Tip : esquive sa première charge en bougeant en diagonale, après c'est un mob standard.*

### 🏹 Tireur de Phosphore — *mob*
HP `24` · Dégâts `9-14` fire · Armure `2` · Range `5`

Garde de la périphérie, équipé d'un arc à munitions au phosphore blanc.

- **Brûlure** : 20% chance (2 tours)
- *Très longue portée. Fragile au CaC.*
- *Tip : closer rapidement ou utiliser une arme ranged.*

### 🔧 Ingénieur Thermique — *mob*
HP `26` · Dégâts `7-11` pierce · Armure `3` · Range `3`

Survivant du dernier shift. Il déploie encore les tourelles automatiques.

- **Déploie tourelle** : 12 PV / 8 dmg / range 4 — toutes les 5 tours
- *Tip : tuer l'ingénieur d'abord pour empêcher le redéploiement.*

### ⚔️ Berserker Carbonisé — *elite*
HP `65` · Dégâts `13-22` slash · Armure `6` · Range `1`

Officier de sécurité dont le module de contrôle de la rage a brûlé.

- **Rage** : +30% damage sous 50% HP
- **Brûlure** : 20% chance
- *Tip : burst au-dessus de 50% HP est plus safe. Stuns/Frozen le neutralisent.*

### 🤖 Drone-Sentinelle Igni-7 — *miniboss*
HP `110` · Dégâts `15-22` fire · Armure `8` · Range `5`

Drone de sécurité prototype, jamais déployé officiellement. Il s'est réactivé seul.

- **Vague de Flammes** : cône de feu (3 cases) tous les 4 tours, AOE
- **Brûlure forte** : 60% chance (4 tours, 4 PV)
- **Bouclier rechargeable** : 30 PV qui régénère hors combat
- *Tip : burst rapide avant le 4e tour. Casser le bouclier d'abord.*

### 🔥 Pyromancien — *BOSS*
HP `170` · Dégâts `16-24` fire · Armure `8` · Range `5`

> *Le directeur du complexe. Ses implants neuraux sont fusionnés à un noyau thermonucléaire miniature. Il ne se souvient plus de son nom, mais il se souvient du feu.*

- **Inferno Burst** : AOE feu 3×3 tous les 5 tours
- **Brûlure forte** : 40% chance
- **Phase 2** (à 30% HP) : invoque 2 Pyromanciens Mineurs
- *Tip : `fireResist > 40%` obligatoire. Tuer les adds vite en phase 2. Stuns interrompent ses cast.*

---

## ❄️ Coffre Cryo

> *"Bunker de stockage cryogénique abandonné. Les cellules de prisonniers congelés ont éclaté il y a des décennies, et leurs occupants déambulent toujours dans les couloirs givrés. Le temps semble ralenti."*

**Conseil général** : `iceResist > 30%` et `ccReduction > 20%` (Frozen et Chill réduisent ton AP). Privilégier dégâts blunt (combo Shatter sur Frozen).

### 🧟 Givre-Marcheur — *mob*
HP `35` · Dégâts `8-13` ice · Armure `4` · Range `1`

Prisonnier ressorti de cryostase. Sa chair est un mélange de cristal de glace et de tissu organique mort.

- **Chill** : 30% chance d'appliquer Chill (-1 PA)
- *Tip : vulnérable au Frozen + Blunt (combo Shatter).*

### ❄️ Cryomancien — *mob*
HP `20` · Dégâts `10-16` ice · Armure `1` · Range `4`

Médecin cryogénique qui s'est injecté son propre sérum de conservation.

- **Chill** : 60% chance (prolongé)
- **Frozen** : 10% chance (1 tour, cumulable)
- *Tip : cible prio absolue. ccReduction utile contre les Frozen.*

### 💨 Patineur Spectral — *mob*
HP `18` · Dégâts `7-12` pierce · Armure `1` · Range `1`

Forme la plus mobile que les Givre-Marcheurs aient développée. Glisse au lieu de marcher.

- **Évasion** : +25% dodge inhérent
- **Dash** : déplacement de 4 cases au lieu de 2
- *Tip : frustrant à toucher. Utiliser ranged ou AOE.*

### 🏹 Lanceur d'Aiguilles — *mob*
HP `22` · Dégâts `10-15` pierce · Armure `2` · Range `6`

Tire des projectiles de glace cristalline si fins qu'ils traversent l'armure.

- **Pénétration d'armure** : ignore 30% de l'armure
- *Tip : dangereux pour builds tank. Closer ou kill rapide.*

### 🛡️ Glacier Vivant — *mob*
HP `50` · Dégâts `6-10` blunt · Armure `12` · Range `1`

Bloc de glace qui a développé une primitive conscience.

- **Armure de glace** : -75% dmg ice subis
- **Garde alliés** : alliés adjacents prennent -30% damage
- *Très lent. Ignorer pour tuer les casters derrière, ou briser avec dégâts physiques (Shatter sur Frozen).*

### ⚔️ Sentinelle de Glace — *elite*
HP `85` · Dégâts `10-16` blunt · Armure `14` · Range `1`

Ancien soldat dont l'armure a fusionné avec une couche permanente de gel.

- **Chill** : 40% chance
- **Ice Shatter** (à sa mort) : AOE ice 2 cases
- *Tip : finir à distance pour éviter le shatter. armorPenetration aide énormément.*

### 🗝️ Gardien des Cellules — *miniboss*
HP `130` · Dégâts `12-18` ice · Armure `11` · Range `3`

Officier de prison qui a refusé d'évacuer pendant la crise. Il garde encore les cellules vides.

- **Invocation** : 1 Givre-Marcheur tous les 4 tours
- **Frozen** : 20% chance (1 tour)
- *Tip : burst l'invocateur d'abord. Garder AOE pour les vagues.*

### ❄️ Cryo-Reine — *BOSS*
HP `190` · Dégâts `14-22` ice · Armure `10` · Range `4`

> *La directrice du programme cryogénique, première sujet de son protocole. Le froid l'a préservée intacte mais lui a donné un contrôle total sur la glace.*

- **Blizzard** : -2 PA pour le joueur tous les 5 tours (1 tour)
- **Chill** : 50% chance prolongé
- **Phase 2** (à 50% HP) : invoque 2 Glaciers Vivants comme bouclier
- *Tip : `iceResist > 40%`, `ccReduction` critique. Briser les Glaciers en phase 2 avec blunt + Frozen.*

---

## ☣️ Friches Toxiques

> *"Décharge biotech à ciel ouvert. Les déchets pharmaceutiques ont créé un écosystème vivant de mutations en chaîne. Tout ce qui rampe ici a été quelque chose d'autre auparavant."*

**Conseil général** : `poisonResist > 30%`, attention aux nuages de mort et au lifesteal des ennemis. Bleed très efficace contre eux (ignore armure ET regen).

### 🦠 Mutant Putréfié — *mob*
HP `30` · Dégâts `6-10` poison · Armure `3` · Range `1`

Ce qui restait d'un visiteur curieux qui s'est aventuré dans la décharge il y a deux ans.

- **Poison** : 50% chance (4 tours)
- **Lifesteal** : 30% sur ses attaques
- *Tip : poisonResist annule le DoT. Burst plutôt que DPS lent.*

### 💚 Cracheur d'Acide — *mob*
HP `22` · Dégâts `8-13` poison · Armure `1` · Range `4`

Humanoïde dont les glandes salivaires ont muté en réservoirs corrosifs.

- **Corrosion d'armure** : 20% chance de réduire ton armure de 5 (perma combat)
- **Poison** : 40% chance
- *Tip : prio absolue si tu joues tank, sinon il corrode tout ton stuff.*

### 🪲 Essaim Bourdonnant — *mob*
HP `14` · Dégâts `4-7` poison · Armure `0` · Range `1`

Pas un seul ennemi mais une nuée d'insectes mutants.

- **Poison** : 70% chance (faible mais fréquent)
- **Spawn** : apparaît en groupes de 3-4
- *Cible parfaite pour AOE. Les ignorer = mourir empoisonné.*

### 🩸 Porteur de Plaies — *mob*
HP `28` · Dégâts `7-11` slash · Armure `2` · Range `1`

Vecteur ambulant. Sa peau est une plaque de bactéries hostiles.

- **Bleed** : 60% chance
- **Nuage de Mort** : à sa mort, nuage poison 2×2 pendant 3 tours
- *Tip : tuer à distance ou s'éloigner avant le coup fatal.*

### 🧬 Greffé de Chair — *mob*
HP `40` · Dégâts `9-14` blunt · Armure `4` · Range `1`

Plusieurs corps fusionnés en un, avec autant de bras qu'il y avait de victimes.

- **Régénération** : 3 PV/tour
- **Multi-Attack** : frappe 2 fois par tour
- *Tip : burst nécessaire. Bleed casse la regen ET ignore l'armure.*

### 🦂 Alpha Mutant — *elite*
HP `75` · Dégâts `11-18` poison · Armure `5` · Range `2`

Le plus ancien et le plus stable des mutants. Il dirige les plus jeunes.

- **Poison forte** : 80% chance (5 tours, 4 PV)
- **Buff alliés** : +20% damage aux mutants adjacents
- **Lifesteal** : 40%
- *Tip : prio absolue dans une room mixte. Sa mort affaiblit tout le pack.*

### 🍄 Mère-Spore — *miniboss*
HP `140` · Dégâts `10-16` poison · Armure `5` · Range `3`

Une masse organique semi-immobile qui produit en continu des spores hostiles. Personne ne sait si elle a déjà été humaine.

- **Invocation** : 2 Essaims tous les 3 tours
- **Aura toxique** : 1 PV poison/tour aux entités dans 3 cases
- *Tip : ne pas tanker l'aura. Burst entre invocs. AOE pour les Essaims.*

### 🦠 Bête Putréfiée — *BOSS*
HP `200` · Dégâts `12-20` poison · Armure `6` · Range `2`

> *Le sujet zéro. La première fuite, le premier mutant. Tout ce qui rampe dans les Friches descend de lui d'une manière ou d'une autre.*

- **Poison forte** : 60% chance continue
- **Lifesteal** : 30% sur tous les coups
- **Régénération** : 5 PV/tour
- **Phase 2** (à 50% HP) : invoque 2 Greffés
- *Tip : le boss le plus difficile à user. `poisonResist` + DPS très élevé. **Bleed très efficace** (ignore armure ET regen).*

---

## ⚡ Voidnet

> *"Cyberespace corrompu, projection physique d'un réseau qui a glitché. Les entités qui le peuplent sont des fragments de code rendus tangibles. Ici, la géométrie ment."*

**Conseil général** : `shockResist > 30%`, `ccReduction` pour les Silence/Marked, mobilité critique pour les AOE.

### ⚡ Erreur Persistante — *mob*
HP `18` · Dégâts `9-14` shock · Armure `0` · Range `3`

Un fragment de processus qui n'a jamais terminé son exécution.

- **Phase Shift** : 30% dodge inhérent (téléporte)
- **Shock** : 40% chance
- *Tip : frustrant mais fragile. Un coup sûr le tue.*

### 👁️ Daemon Mineur — *mob*
HP `24` · Dégâts `11-16` shock · Armure `1` · Range `5`

Programme système devenu sentient. Il croit accomplir une tâche d'optimisation.

- **Chain Lightning** : le shock se propage à 1 ennemi adjacent
- **Silence** : 15% chance (1 tour)
- *Tip : garder le joueur loin des autres mobs pour éviter le chain.*

### 🗡️ Exécuteur — *mob*
HP `26` · Dégâts `13-19` pierce · Armure `2` · Range `1`

Process dédié à terminer toute autre process non autorisée.

- **Execute** : +50% damage sur cibles <30% HP
- **Blink** : téléporte adjacent à la cible la plus blessée
- *Tip : très dangereux à low HP. Heal-up avant qu'il blink. Lifesteal aide.*

### 🔮 Corrupteur — *mob*
HP `22` · Dégâts `8-13` shock · Armure `1` · Range `4`

Entité qui altère les statistiques des autres process en temps réel.

- **Marked** : 30% chance (cible prend +25% damage)
- **Shock** : 30% chance
- *Tip : prio dans une room mixte : son Marked transforme les autres mobs en menaces majeures.*

### ♾️ Réplicateur — *mob*
HP `20` · Dégâts `7-11` shock · Armure `1` · Range `2`

Lui-même n'est rien. Mais il sait se copier.

- **Réplication** : à 50% HP, se duplique en 2 copies (qui ne se redupliquent pas)
- *Tip : tue-le en un burst plutôt que de l'amener doucement à 50%.*

### 💻 Process Overclocké — *elite*
HP `70` · Dégâts `9-15` shock · Armure `4` · Range `4`

Une boucle while qui s'est exécutée beaucoup trop vite, beaucoup trop longtemps.

- **Double Attaque** : frappe 2 fois par tour
- **Shock** : 50% chance + chain
- **Haste** : déplacement de 4 cases
- *Tip : Stuns/Frozen vitaux. Sinon il déchire vite.*

### 🌐 Sous-Noyau de Trame — *miniboss*
HP `120` · Dégâts `14-22` shock · Armure `5` · Range `6`

Fragment du noyau central du Voidnet, séparé du reste après une mise à jour cassée.

- **Champ d'Éclairs** : 4 cases aléatoires reçoivent dmg shock tous les 4 tours
- **Silence** : 30% chance
- **Marked** : sur tous les hits crit
- *Tip : `shockResist` et mobilité. Anti-CC obligatoire pour ne pas être Silence-locked.*

### ⚡ Architecte du Vide — *BOSS*
HP `160` · Dégâts `18-28` shock · Armure `5` · Range `6`

> *Le créateur du Voidnet, devenu sa propre création. Il n'existe plus en tant qu'entité unique mais comme un patron récurrent dans le réseau.*

- **Void Storm** : AOE shock 4×4 tous les 5 tours
- **Shock chain** : 50% chance
- **Phase Shift** (à 50% HP) : invulnérable 1 tour, téléporte
- **Phase 3** (à 30% HP) : invoque 3 Daemons
- *Tip : `shockResist > 40%`. Anti-CC. Burst quand il sort de phase shift (vulnérable). Garder une AOE pour les adds.*

---

## 🩸 Fosses Cramoisies

> *"Arène de combat clandestine creusée sous l'ancien stade. Les survivants se sont organisés en cercles rituels. Le sol n'a jamais séché."*

**Conseil général** : pas de résistance à mettre (dégâts physiques pour la plupart), miser sur armure + dodge. Bleed agressif des ennemis = lifesteal/regen utile.

### 👊 Bagarreur de Fosse — *mob*
HP `32` · Dégâts `10-16` blunt · Armure `3` · Range `1`

Combattant amateur qui n'a jamais quitté l'arène. Il s'y bat encore par habitude.

- **Bleed** : 30% chance
- **Rage** : +20% damage sous 50% HP
- *Tip : burst au-dessus de 50% est plus safe.*

### 🔪 Boucher — *mob*
HP `36` · Dégâts `13-20` slash · Armure `4` · Range `1`

Spécialiste du dépeçage qui a élargi son répertoire.

- **Bleed forte** : 60% chance (3 tours, 5 PV)
- **Execute** : +30% damage sur cibles <30% HP
- *Tip : ne jamais rester en bas HP à proximité.*

### 🗡️ Lanceur de Lames — *mob*
HP `22` · Dégâts `11-17` pierce · Armure `1` · Range `5`

Tireur d'élite. Il a transformé chaque rebut métallique en arme de jet.

- **Bleed** : 40% chance
- *Tip : closer ou ranged kill. Fragile au CaC.*

### 🪝 Crocheteur — *mob*
HP `28` · Dégâts `9-14` pierce · Armure `2` · Range `4`

Maître du grappin. Personne ne s'enfuit.

- **Hook** : tire la cible de 3 cases vers lui (1× par combat)
- **Bleed** : 30% chance
- *Tip : s'attendre au pull au tour 1. Préparer un burst une fois adjacent.*

### 🩺 Docteur de Sang — *mob*
HP `20` · Dégâts `6-10` pierce · Armure `1` · Range `1`

Médecin qui a renoncé à soigner pour collecter à la place.

- **Heal alliés** : 8 PV à un allié blessé adjacent (au lieu d'attaquer)
- **Lifesteal** : 50% (rare déclenchement)
- *Tip : prio dans une room. Sans lui, le pack tombe vite.*

### ⚔️ Gladiateur — *elite*
HP `80` · Dégâts `14-22` slash · Armure `7` · Range `1`

Champion local. Il a battu tout le monde dans sa catégorie.

- **Bleed** : 50% chance
- **Rage** : +30% damage sous 50% HP
- **Block** : 30% chance de bloquer (réduit dégâts moitié)
- *Tip : burst au-dessus de 50% prio. Stuns le neutralisent. Fuir si bas HP.*

### 🪓 Exécuteur de l'Arène — *miniboss*
HP `130` · Dégâts `20-30` slash · Armure `9` · Range `1`

Le bourreau officiel des matches à mort. Sa hache est plus vieille que lui.

- **Execute** : +80% damage sur cibles <40% HP
- **Bleed forte** : 60% chance
- **Pénétration** : ignore 40% de l'armure
- *Tip : garder >40% HP en permanence. Mobilité critique.*

### 🩸 Champion du Sang — *BOSS*
HP `180` · Dégâts `20-30` slash · Armure `7` · Range `1`

> *L'invaincu de la fosse depuis 14 ans. Il a perdu compte de combien il a tué. La foule a disparu, mais il continue à se battre pour elle.*

- **Bleed très forte** : 50% chance (4 tours, 6 PV)
- **Execute** : +50% damage sur cibles <30% HP
- **Pénétration** : ignore 50% de l'armure du joueur
- **Ramp Up** : +5% damage par tour passé en combat
- **Phase 2** (à 33% HP) : invoque 2 Bouchers
- *Tip : tuer vite obligatoire (rampUp). Armure inutile contre lui. Mobilité + dodge + heals. **Bleed reste très efficace contre lui.***

---

## Notes pour le développement

### Ordre de difficulté suggéré pour le joueur

Tier 1 (premier biome conseillé) : **Cryo** ou **Crimson** — danger modéré, mécaniques simples
Tier 2 : **Inferno** ou **Toxic** — DoT intense, demande un build adapté
Tier 3 : **Voidnet** — multiples mécaniques + AOE, demande un stuff complet

### Stats clés par biome (pour le joueur)

| Biome | Stat principale | Stat secondaire |
|---|---|---|
| Inferno | `fireResist` | `ccReduction` (anti-stun charge) |
| Cryo | `iceResist` | `ccReduction` (anti-Frozen) |
| Toxic | `poisonResist` | `bleedChance` (counter le boss) |
| Voidnet | `shockResist` | `ccReduction` + mobilité |
| Crimson | `armor` (limité par pénétration) | `dodgeChance`, `lifesteal`, `hpRegen` |

### Structure d'un donjon type

5 salles successives :
1. **Salle 1** : 2-3 mobs basiques d'un biome (intro)
2. **Salle 2** : 3-4 mobs basiques (un peu plus durs)
3. **Salle 3** : 1 elite + 2 mobs (test de skill)
4. **Salle 4** : 1 miniboss + 2 mobs OU 4-5 mobs (avant-boss)
5. **Salle Boss** : le boss du biome seul

Total run : 10-15 minutes selon le build.

### Idées d'extension future

- **Modifiers de donjon** : "Tous les ennemis ont +30% damage", "Sol enflammé permanent", etc.
- **Champions aléatoires** : un mob basique reçoit +50% HP/dmg + un suffixe random ("le Brûlant Vampirique", "le Givre-Marcheur Échoiste")
- **Rencontres optionnelles** : salles secrètes avec un mini-boss + loot garanti
- **Couplages inter-biomes** : un Brûlant qui apparaît parfois dans les Friches Toxiques (combo Burn+Poison = ToxicGas)
