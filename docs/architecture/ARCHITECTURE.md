# Architecture du code

> Comment le moteur du jeu est organisé. À lire avant de toucher au code.

---

## Vue d'ensemble

Le jeu est un **SPA HTML + ES modules**. Pas de bundler, pas de framework, pas de npm install pour le runtime. On charge `index.html`, qui charge `src/js/core/game.js`, qui orchestre tout.

```
index.html
  ↓
src/js/core/game.js  ← entry point
  ↓
  ├─ core/state.js       ← état global du jeu (player, enemies, turn, etc.)
  ├─ core/turn.js        ← gestion de l'ordre des tours (timeline)
  ├─ data/loader.js      ← charge les JSON depuis src/data/
  ├─ grid/grid.js        ← grille 8×6, cases, voisins
  ├─ grid/pathfinding.js ← pathfinding A* (8 directions)
  ├─ entities/player.js  ← classe player + stats
  ├─ entities/enemy.js   ← classe enemy + IA hookup
  ├─ combat/             ← logique de combat
  │  ├─ damage.js        ← calcul des dégâts (où sont les patches !)
  │  ├─ attack.js        ← orchestration d'une attaque
  │  ├─ status.js        ← application/tick des statuts (DoT, CC)
  │  └─ actions.js       ← actions disponibles (move, attack, etc.)
  ├─ ai/                 ← IA des ennemis
  │  ├─ ai.js            ← dispatcher selon archetype
  │  ├─ aggressive.js    ← comportement CaC
  │  └─ caster.js        ← comportement à distance
  ├─ loot/               ← génération d'items
  │  ├─ generator.js     ← génère un item aléatoire
  │  ├─ affix-roller.js  ← roll les affixes
  │  ├─ value-roller.js  ← roll les valeurs (avec courbes iLvl)
  │  ├─ forge.js         ← opérations de forge (burn, reroll, transfer)
  │  ├─ combo-resolver.js← résout les combos d'affixes
  │  └─ synergies.js     ← bonus de set
  └─ ui/                 ← rendu et interactions
     ├─ render.js        ← orchestrateur de rendu
     ├─ grid-render.js   ← affichage de la grille
     ├─ panels.js        ← panneaux d'info (HP, stats)
     ├─ actions-ui.js    ← boutons d'action
     ├─ timeline.js      ← affichage de la timeline
     ├─ log.js           ← journal de combat
     └─ combat-end.js    ← écran de victoire/défaite
```

---

## Données vs code

**`src/data/*.json`** contient TOUTES les données de gameplay. Aucune valeur de combat ne devrait être hardcodée dans le JS :

| Fichier | Rôle |
|---|---|
| `enemies.json` | Bestiaire complet (40 entrées sur 5 biomes) |
| `weapons.json` | Armes (1H, 2H, off-hand) avec dégâts de base |
| `armor.json` | Armures (5 slots) avec stats de base |
| `amulets.json` | Amulettes (1 sort actif chacune) |
| `rings.json` | Anneaux (1 passif unique chacun) |
| `affixes.json` | Pool d'affixes possibles avec leurs ranges |
| `legendaries.json` | Items légendaires uniques |
| `sets.json` | Sets d'équipement par biome avec bonus |
| `forge-config.json` | Coûts et règles de la forge |
| `statuses.json` | Définition des 6 DoT + 9 CC + 7 buffs |
| `combos.json` | Les 5 combos lancés (Burn+Oil=Explosion, etc.) |
| `biomes.json` | Métadonnées des biomes |
| `spells.json` | Sorts liés aux amulettes |
| `rooms.json` | Templates de salles de donjon |

Pour ajouter un ennemi : éditer `enemies.json`. Pour changer un affixe : éditer `affixes.json`. Le code lit, ne décide pas.

---

## Cycle de vie d'un combat

1. `core/game.js` détecte que le joueur entre dans une salle de combat
2. `data/loader.js` charge les ennemis selon `rooms.json` + `enemies.json` du biome
3. `entities/enemy.js` instancie chaque ennemi avec scaling selon le niveau
4. `core/turn.js` calcule l'initiative et construit la timeline
5. À chaque tour :
   - Si c'est le joueur : `ui/actions-ui.js` affiche les boutons, on attend l'input
   - Si c'est un ennemi : `ai/ai.js` choisit l'action selon l'archetype
6. L'action passe par `combat/actions.js` → `combat/attack.js` → `combat/damage.js`
7. `combat/status.js` applique/tick les DoT et CC
8. `ui/render.js` met à jour l'écran
9. Si quelqu'un meurt : check fin de combat → `ui/combat-end.js`

---

## Où sont les bugs identifiés (à corriger)

Voir `docs/balance/PATCH-BALANCE.md` pour le détail des 12 patches. Résumé des fichiers à toucher :

| Patch | Fichier(s) à modifier |
|---|---|
| 1. Calcul dégâts élémentaires | `src/js/combat/damage.js` |
| 2. Formule armure DR | `src/js/combat/damage.js` |
| 3. Cap hpRegen | `src/js/loot/affix-roller.js` + agrégation stats |
| 4. Scaling ennemis | `src/js/entities/enemy.js` |
| 5. Boss HP | `src/data/enemies.json` (déjà fait dans la nouvelle version) |
| 6-9. Ranges affixes | `src/data/affixes.json` |
| 10. HP joueur | `src/js/entities/player.js` |
| 11. cooldownReduction | `src/data/affixes.json` (retirer) |
| 12. Boss Crimson | `src/data/enemies.json` (déjà inclus) + `src/js/combat/damage.js` |

---

## Prototypes vs code de prod

**Tout ce qui est dans `prototypes/`** est jetable. Ce sont des explorations dans Claude.ai pour valider des concepts visuels ou tester des mécaniques. Le **code de prod est uniquement dans `src/`**.

Les fichiers `.jsx` ne tournent **pas** dans le jeu ; ils sont conçus pour être collés dans Claude.ai comme artifacts. Le jeu lui-même n'utilise que du JS vanilla.

---

## Conventions de code

- **ES modules** partout (`import` / `export`).
- **Pas de `var`**, `const` par défaut, `let` quand mutation.
- **Pas de classe `Game` monolithique** — on garde la modularité.
- Les fonctions de combat sont **pures** quand possible : prennent un état, retournent un nouvel état.
- Les **ID sont string** (jamais d'index numérique stocké).
- Tout texte affiché est en **français**.
