# 📜 LOOT.md — Système d'itemisation complet

> Document de design consolidé. Toutes les valeurs ici sont **canoniques** et doivent matcher les JSON dans `src/data/`.
> Calibré sur : difficulté D2 modernisé, runs 10-15 min, power scaling ×50-80 endgame, drop rate modéré.

---

## 🎯 Philosophie centrale

Trois piliers :
1. **L'arme définit le rôle** (implicit garanti)
2. **Le biome définit la teinte** (affixes random favorisés)
3. **Le tier définit la profondeur** (nombre d'affixes, leur puissance, unicité)

---

## 🗡️ 1. Armes

### 1.1 — Armes 1 main (équipées avec offhand)

| Arme | Implicits possibles (2-3, roll au drop) | Stat principale |
|---|---|---|
| **Épée** | +Dégâts Tranchants / +Chance Crit / +Vitesse attaque | Force |
| **Dague** | +Chance Crit / +Multiplicateur Crit / +Saignement appliqué | Dextérité |
| **Hache** | +Saignement / +Dégâts Tranchants / +Execute | Force |
| **Masse** | +Dégâts Contondants / +Pénétration armure / +Étourdir | Force |
| **Wand** | +Vitesse sort (-1 AP) / +Dégâts magiques / +Cooldown -% | Intelligence |
| **Pistolet** | +Portée / +Chance Crit / +Vitesse attaque | Dextérité |

### 1.2 — Armes 2 mains (occupent les 2 slots, +1 affixe bonus)

| Arme | Implicits possibles | Stat principale |
|---|---|---|
| **Épée 2 mains** | +Dégâts Tranchants / +Cleave (2 cases) / +Crit | Force |
| **Hallebarde** | +Portée mêlée +1 / +Dégâts perforants / +Étourdir | Force |
| **Arc** | +Dégâts Perforants / +Portée +1 / +Précision | Dextérité |
| **Bâton** | +Dégâts magiques globaux / +Cooldown -% / +Sort gratuit (1×/combat) | Intelligence |

### 1.3 — Off-hand (équipée avec une 1 main)

| Off-hand | Implicits possibles | Style |
|---|---|---|
| **Bouclier** | +Armure / +Riposte / +Bouclier d'énergie | Tank |
| **Tome** | +Dégâts magiques / +Cooldown -% / +Mana | Caster |
| **Focus** | +Crit sorts / +Dégâts magiques / +Pénétration élémentaire | Burst caster |
| **Carquois** | +Portée / +Dégâts perforants / +Vitesse | Archer |

### 1.4 — Bonus 2-mains vs 1m+offhand

- **2 mains** : implicit garanti **+ 1 affixe bonus** (donc 1 ligne de stats supplémentaire)
- **1m + offhand** : 2 implicits cumulés (un par item) + défense/utilitaire de l'offhand
- **Pas de dual-wield 2× 1m** (simplification)

---

## 🛡️ 2. Armures et accessoires

| Slot | Type | Implicit garanti |
|---|---|---|
| Casque | Armure | +Armure |
| Veste | Armure | +PV max |
| Pantalon | Armure | +Armure |
| Gants | Armure | +Chance crit |
| Bottes | Armure | +Mouvement (1 case gratuite/tour) |
| Amulette | Bijou | **Porte 1 sort actif** (défini par l'item) |
| Bague (×2) | Bijou | **Porte 1 effet passif unique** |

---

## 💎 3. Tiers (rareté)

| Tier | Couleur | Affixes | Implicit | Unique mod | Drop rate |
|---|---|---|---|---|---|
| Common | #ccc | 0 | ✅ | ❌ | 60% |
| Magic | #6af | 1-2 | ✅ | ❌ | 25% |
| Rare | #fc4 | 2-3 | ✅ | ❌ | 10% |
| Epic | #c4f | 3-4 | ✅ | ❌ | 4% |
| Legendary | #f80 | 4 | ✅ | ✅ | 0.9% |
| Set | #6f6 | 2-3 | ✅ | ❌ (bonus set) | 0.1% |

---

## 📈 4. Item Level (1 → 10)

L'iLvl multiplie les valeurs des stats. Range au drop = niveau du donjon.

| iLvl | Multiplicateur min/max |
|---|---|
| 1 | 0.50× |
| 2 | 0.65× |
| 3 | 0.80× |
| 4 | 0.95× |
| 5 | **1.00× (référence)** |
| 6 | 1.15× |
| 7 | 1.30× |
| 8 | 1.50× |
| 9 | 1.75× |
| 10 | **2.10×** |

**iLvl 1 → 10 = ~4.2× plus puissant.** Total essences pour upgrade = **1205**.

### Coût de level up (essences)
| Niveau actuel → suivant | Coût |
|---|---|
| 1→2 | 5 |
| 2→3 | 10 |
| 3→4 | 20 |
| 4→5 | 35 |
| 5→6 | 60 |
| 6→7 | 100 |
| 7→8 | 175 |
| 8→9 | 300 |
| 9→10 | 500 |

---

## 🎲 5. RNG 3 couches — la magie du farming

### Couche 1 — Quoi drop
Type, subtype, tier, iLvl déterminés par : table de drop ennemi/donjon × biome × magic find.

### Couche 2 — Quels affixes
Pour chaque slot d'affixe libre (selon tier) : roll d'un affixe compatible avec slot ET biome (50% biome / 50% global).

### Couche 3 — Quelles valeurs (perfect roll potentiel)
Pour chaque affixe : `valeur = roll(min, max)` dans la range définie par tier × multiplicateur iLvl.

### Range par tier
| Tier | Range relative au base |
|---|---|
| Magic | 60-100% |
| Rare | 80-130% |
| Epic | 100-160% |
| Legendary | 130-200% |
| Set | 90-140% |

**Conséquence** : un Legendary mal rollé peut être moins bon qu'un Epic perfect roll. Motive le re-grind.

### Visualisation qualité du roll (UI)

Chaque affixe affiche une **mini-bar de qualité** :

```
+12 dégâts Feu  ████████░░  85%
```

- 0-30% : rouge (à reroll)
- 30-60% : jaune (correct)
- 60-85% : vert (bon)
- 85-99% : cyan (excellent)
- 100% : **doré + glow** (perfect roll, screenshot-worthy)

Probabilité de perfect roll par affixe : **~1/30** sur un Legendary.

---

## ⚔️ 6. Effets et statuts

### 6.1 — DoT (6 statuts)

| Statut | Tag | Mécanique | Stack |
|---|---|---|---|
| 🔥 Brûlé | Fire | Dégâts feu/tour | Refresh durée |
| ❄️ Glacé | Ice | Dégâts glace/tour + -1 AP | Refresh |
| ☠️ Empoisonné | Poison | Dégâts poison/tour | Stack 5× |
| ⚡ Électrocuté | Shock | Dégâts/tour + saute aux adjacents | Refresh |
| 🩸 Saignement | Bleed | Dégâts physiques, ignore armure | Stack 5× |
| 🌑 Corruption | Corruption | Dégâts ombre + réduit soins reçus -50% | Refresh |

### 6.2 — CC et debuffs (8 statuts)

| Statut | Mécanique |
|---|---|
| 💫 Étourdi | Skip tour, non stack |
| 🥶 Gelé | Skip tour + ×2 contondant reçu |
| 🌫️ Aveuglé | -50% précision |
| 🦶 Ralenti | -1 AP par tour |
| 🎯 Marqué | +25% dégâts reçus toutes sources |
| 🛢️ Huilé | +50% feu reçu, glissant |
| 🔗 Enraciné | Pas de mouvement, peut attaquer |
| 🔇 Silencé | Pas de sorts, juste attaque basique |
| 💧 Mouillé | Annule Brûlé, +50% foudre, -50% feu reçu |

### 6.3 — Buffs personnels (7 buffs)

| Buff | Mécanique |
|---|---|
| 🔱 Rage | +30% dégâts mêlée 3 tours |
| 🛡️ Garde | -30% dégâts reçus 1 tour (gagné par AP non utilisés) |
| 💎 Bouclier d'énergie | Pool PV temporaire absorbe avant vrais PV |
| 🎯 Précision | +25% chance crit 3 tours |
| 🌟 Concentration | +1 AP au prochain tour |
| 💚 Régénération | +X PV/tour pendant N tours |
| ⚡ Hâte | +2 cases mouvement gratuit ce tour |

### 6.4 — Combos élémentaires (5 au lancement)

| Combo | Trigger | Effet |
|---|---|---|
| 🔥 + 🛢️ Huile | Brûlé sur Huilé | **Explosion** zone 3×3 |
| ❄️ + 💥 Contondant | Coup contondant sur Gelé | **Brise** ×3 dégâts |
| ⚡ + ⚡ | 2e Électrocution sur cible déjà électrocutée | **Surcharge** zone, retire statut |
| ☠️ + 🔥 | Brûlé sur Empoisonné | **Gaz toxique** DoT zone 3 tours |
| 🩸 ×3 | 3e stack Saignement | **Hémorragie** dégâts massifs instantanés |

À ajouter plus tard : 💧+⚡ = Choc (Étourdi), 💧+❄️ = Givre au sol, 🌑+❤️ = Soin inversé.

---

## 🌍 7. Biomes (5)

| Biome | Thème | Tags favorisés | Essence |
|---|---|---|---|
| 🔥 **Inferno Sector** | Industriel en feu | Fire, Stun, Rage | Cendres ardentes |
| ❄️ **Cryo Vault** | Cryo-stockage | Ice, Slow, Shield | Éclats glacés |
| ☠️ **Toxic Wastes** | Égouts mutants | Poison, Bleed, Lifesteal | Bave acide |
| ⚡ **Voidnet** | Cyberespace | Shock, Crit, Echo | Fragments numériques |
| 🩸 **Crimson Pits** | Arène sanglante | Bleed, Execute, Crit | Sang coagulé |

### Effet biome sur drops
- 50% chance qu'un affixe roll soit du tag favorisé
- +30% chance d'items dont l'implicit est compatible
- 100% des essences drop sont du biome courant

### Tiers de difficulté (T1-T10 par biome)
| Tier | iLvl drops | Drop Légendaire | Drop Set |
|---|---|---|---|
| T1-3 | 1-3 | 0.1% | 0% |
| T4-6 | 4-6 | 0.5% | 0.05% |
| T7-9 | 7-9 | 1% | 0.2% |
| T10 (Infernal) | 10 | 2% | 0.5% |

T(N+1) débloqué après réussite de T(N).

---

## 🔧 8. Forge — opérations

### A. Burn (gratuit, génère)
Détruit un item → essences du biome de l'item.
Formule : `essences = baseTier × iLvl`.

| Tier | Base | × iLvl 5 | × iLvl 10 |
|---|---|---|---|
| Common | 1 | 5 | 10 |
| Magic | 2 | 10 | 20 |
| Rare | 5 | 25 | 50 |
| Epic | 12 | 60 | 120 |
| Legendary | 30 | 150 | **300** |
| Set | 25 | 125 | 250 |

### B. Reroll de valeur
Re-roll juste la valeur d'un affixe dans sa range.
- Coût : 5-15 essences du tag de l'affixe + or modéré
- **Coût exponentiel** sur le même affixe : ×1.5 chaque fois

### C. Reroll d'affixe
Change l'affixe pour un autre du **même type** (préfixe/suffixe) et **même tag**.
- Coût : 25-50 essences + or important
- Coût exponentiel ×1.5

### D. Transfert d'attribut
Prend 1 affixe d'item **émetteur** → pose sur **receveur**.
- ✅ Même slot type
- ✅ Receveur doit avoir slot libre OU on remplace (l'ancien est perdu)
- ⚠️ L'affixe prend l'**iLvl du receveur** (re-calcul)
- ⚠️ iLvl émetteur > receveur : roll défavorable
- ⚠️ iLvl émetteur < receveur : roll favorable
- 💀 Émetteur **détruit**
- 💰 Coût : 30-60 essences du tag + or important

### E. Upgrade iLvl
+1 iLvl. Coût voir §4. Total iLvl 1→10 = **1205 essences**.

### F. (Pas d'ajout d'affixe en v1)
L'item drop avec ses slots, c'est définitif.

---

## 🎒 9. Sets d'armure (5)

### Linceul des Cendres (Inferno)
- 2 pièces : +20% dégâts Feu
- 3 pièces : Tes attaques ont 30% chance d'appliquer Brûlé
- 5 pièces : **Tes ennemis Brûlés explosent à la mort, propageant Brûlé en zone 3×3**

### Manteau Glacé (Cryo Vault)
- 2 pièces : +20% dégâts Glace
- 3 pièces : Tes critiques appliquent Gelé
- 5 pièces : **Quand tu reçois un coup, applique Glacé à l'attaquant**

### Voie du Sang (Crimson Pits)
- 2 pièces : +25% chance Saignement
- 3 pièces : Saignements durent +2 tours
- 5 pièces : **Tu te soignes de 30% des dégâts de Saignement infligés**

### Robe Toxique (Toxic Wastes)
- 2 pièces : +20% dégâts Poison
- 3 pièces : Empoisonnement stack jusqu'à 8 (au lieu de 5)
- 5 pièces : **Quand un Empoisonné meurt, gaz toxique zone 3×3 pendant 3 tours**

### Trame du Vide (Voidnet)
- 2 pièces : +20% dégâts Foudre
- 3 pièces : Tes critiques appliquent Électrocuté
- 5 pièces : **Tes Électrocutions sautent à 2 ennemis supplémentaires**

**Mix possible** : 3 pièces d'un set + 2 pièces d'un autre = bonus 3 + bonus 2 actifs simultanément.

---

## ⭐ 10. Légendaires nommés (15)

### Armes (5)
1. **Lame du Phénix** (Épée 1m) — Quand tu tues un ennemi, propage Brûlé aux adjacents
2. **Faux du Néant** (Hallebarde) — Critiques infligent +50% en dégâts Ombre
3. **Crocs des Sept Veines** (Dague) — Attaques basiques appliquent toujours 1 stack Saignement
4. **Arc des Tempêtes** (Arc) — Tirs traversent et appliquent Électrocuté
5. **Bâton du Soleil Mort** (Staff) — 25% chance qu'un sort se relance gratis

### Armures (4)
6. **Heaume de l'Oracle** (Casque) — Tu vois les actions ennemies du prochain tour
7. **Plastron des Mille Ans** (Veste) — +50% PV max mais -2 AP/tour
8. **Gants du Bourreau** (Gants) — +100% chance crit sur cibles <30% PV
9. **Bottes de la Tempête** (Bottes) — Te déplacer applique Foudre aux ennemis adjacents

### Amulettes (3)
10. **Cœur de Volcan** — Sort "Éruption" zone 5×5, pas de CD si <30% PV
11. **Larme de Cryo-Reine** — Sort "Blizzard" zone 3×3 sur 3 tours, applique Glacé chaque tick
12. **Œil du Hacker** — Sort "Surcharge" : vole un sort ennemi adjacent et le lance

### Bagues (3)
13. **Anneau du Vampire** — Mêlée te soigne 25% des dégâts infligés
14. **Anneau du Temps Suspendu** — Si tu ne te déplaces pas, +2 AP au prochain tour
15. **Anneau de Conversion** — 30% dégâts physiques convertis en Feu

---

## 💰 11. Économie

### Magic Find
Stat rollable sur items. +X% chance que les drops soient de tier supérieur.
Cap : +200% (au-delà, diminishing returns).

### Stash
- **Slot de départ** : 50 items
- **Extensible** par achat avec or : +20 slots = 5000 or, prix ×2 chaque palier
- **Onglets séparés** : armes, armures, bijoux, essences, divers

### Boucle saine
- 80% drops Common → 90% burn, 10% gold
- 15% Magic → 70% burn, 30% kept
- 4% Rare → toujours examiné
- 0.9% Epic → optimisé via forge
- 0.1% Legendary/Set → moment de joie

### Hardcore mode
À considérer plus tard, pas v1.

### Pas de gemmes/runes
Volontaire, simplification.

---

## 🗂️ 12. Structure de fichiers du système

```
src/data/
├── weapons.json        Tous les types + implicits possibles
├── armor.json          Armures avec implicits
├── amulets.json        Amulettes (chacune porte un sort)
├── rings.json          Bagues (chacune porte un effet unique)
├── affixes.json        Pool d'affixes avec tags, slots, ranges
├── statuses.json       Tous les statuts avec règles
├── combos.json         Règles des combos élémentaires
├── sets.json           5 sets complets
├── legendaries.json    15 légendaires nommés
├── biomes.json         5 biomes avec tags favorisés
└── forge-config.json   Coûts et règles de la forge

src/js/loot/
├── generator.js        Roll d'un drop (3 couches RNG)
├── affix-roller.js     Roll des affixes selon tier/biome
├── value-roller.js     Roll des valeurs avec multiplicateur iLvl
├── forge.js            Opérations forge
├── synergies.js        Calcul bonus tags/sets/passifs
└── combo-resolver.js   Détection et déclenchement combos
```
