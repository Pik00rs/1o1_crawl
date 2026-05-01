# 🩸 Reactor Hollow

> Dungeon crawler RPG turn-based, esthétique cyberpunk, vue isométrique 2.5D.
> Combat tactique sur grille 8×6 avec système d'affixes profond, 9 types de dégâts, 6 statuts DoT, 9 statuts CC, et 5 biomes peuplés.

**Stack** : HTML / CSS / JS vanilla en ES modules — déploiement Vercel — prototypage React via Claude.

---

## 📁 Structure du repo

```
reactor-hollow/
├── index.html              ← point d'entrée du jeu (à ouvrir local + servir via Vercel)
│
├── src/                    ← code source du jeu
│   ├── js/
│   │   ├── core/           ← state, game loop, turn management
│   │   ├── combat/         ← damage, attack, status, actions
│   │   ├── grid/           ← grille 8×6, pathfinding
│   │   ├── entities/       ← player, enemy
│   │   ├── loot/           ← générateur d'items, forge, synergies, combos
│   │   ├── ai/             ← IA des ennemis (aggressive, caster)
│   │   ├── ui/             ← rendu, panels, log, timeline
│   │   └── data/           ← loader JSON
│   ├── css/
│   │   ├── base/           ← variables, layout
│   │   └── components/     ← grid, panels, buttons
│   ├── data/               ← TOUTES les données JSON (enemies, weapons, affixes, etc.)
│   └── assets/             ← (sprites, sons à venir)
│
├── docs/                   ← documentation
│   ├── design/             ← DESIGN.md, COMBAT.md, LOOT.md
│   ├── balance/            ← rapport balance + 12 patches code-ready + heatmap
│   ├── bestiary/           ← bestiaire complet (40 ennemis, 5 biomes)
│   ├── architecture/       ← (réservé pour notes techniques)
│   ├── ROADMAP.md
│   └── CHANGELOG.md
│
├── prototypes/             ← prototypes standalone, pas du code de prod
│   ├── playable/           ← démos HTML jouables (top-down, isométrique, cyberpunk)
│   └── tools/              ← outils internes : loot maker, simulator, viewer
│
├── tools/                  ← outils dev hors jeu
│   └── balance/            ← engine de simulation Node.js
│
└── archive/                ← anciennes itérations conservées pour historique
```

---

## 🚀 Lancer en local

Le jeu est en ES modules, donc il faut un serveur HTTP local (pas juste `file://`) :

```bash
# avec Python
python3 -m http.server 8000
# ou avec Node
npx serve .
# ou Vercel
vercel dev
```

Puis ouvrir `http://localhost:8000`.

---

## 🚀 Déployer sur Vercel

1. Push ce repo sur GitHub.
2. Sur Vercel, "New Project" → importer le repo.
3. Framework Preset : **Other** (pas de build).
4. Output Directory : `.` (racine).
5. Deploy. Le jeu est live sur `<projet>.vercel.app`.

Aucune dépendance npm n'est requise pour le jeu lui-même.

---

## 🧪 Tests / outils

Les **prototypes/tools/** sont des outils internes faits avec React (à utiliser dans Claude.ai en artifacts) :

- **`loot-maker.jsx`** — génère des items aléatoires pour tester les rolls
- **`item-explorer-v3.jsx`** — explore l'espace des items possibles (le plus à jour)
- **`combat-simulator.jsx`** — simule des combats pour valider le balance
- **`bestiary-viewer.jsx`** — visualise le bestiaire (filtres par biome/rôle)

Les **prototypes/playable/** sont des HTML standalone à ouvrir dans le navigateur pour voir 3 directions visuelles testées (top-down, cyberpunk, isométrique).

L'**`tools/balance/balance-engine-v3.mjs`** lance des milliers de simulations en CLI :

```bash
node tools/balance/balance-engine-v3.mjs
```

---

## 📊 État actuel du projet

✅ **Conçu** : système de combat, itemisation, statuts, combos, forge, biomes
✅ **Documenté** : design + balance + bestiaire (40 ennemis, 5 biomes)
✅ **Prototypé** : moteur ES modules de base, plusieurs démos visuelles
✅ **Équilibré** : 70k+ simulations, 12 patches identifiés (voir `docs/balance/PATCH-BALANCE.md`)

⏳ **À faire (court terme)** :
1. Appliquer les 12 patches de balance dans `src/js/combat/damage.js` et le générateur de loot
2. Brancher le nouveau bestiaire (`src/data/enemies.json`) dans le moteur
3. Choisir une direction visuelle parmi les prototypes
4. Implémenter les sorts d'amulette + cooldowns

⏳ **À faire (moyen terme)** :
- Sprites/animations
- Sons
- Sauvegarde locale (localStorage)
- Plus de biomes / variations

Voir `docs/ROADMAP.md` pour la roadmap complète.

---

## 📂 Ordre de lecture recommandé

Pour reprendre le projet à zéro :

1. `docs/design/DESIGN.md` — vision d'ensemble
2. `docs/design/COMBAT.md` — système de combat
3. `docs/design/LOOT.md` puis `LOOT-ADVANCED.md` — itemisation
4. `docs/bestiary/bestiary.md` — ennemis et biomes
5. `docs/balance/balance-report.md` puis `PATCH-BALANCE.md` — équilibrage
6. `src/js/core/game.js` — point d'entrée du moteur
