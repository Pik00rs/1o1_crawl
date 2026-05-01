# `docs/` — Documentation

## Organisation

```
docs/
├── design/          ← vision et systèmes de jeu
│   ├── DESIGN.md         ← vision générale
│   ├── COMBAT.md         ← système de combat
│   ├── LOOT.md           ← itemisation v1 (basique)
│   └── LOOT-ADVANCED.md  ← itemisation v2 (forge, combos, sets)
│
├── balance/         ← travail d'équilibrage
│   ├── balance-report.md ← rapport des 70k simulations
│   ├── PATCH-BALANCE.md  ← 12 patches code-ready à appliquer
│   └── heatmap-data.json ← matrice winrate par lvl × build
│
├── bestiary/        ← bestiaire complet
│   ├── bestiary.md       ← doc lisible (lore, stats, tips)
│   └── bestiary.json     ← données structurées
│
├── architecture/    ← documentation technique
│   └── ARCHITECTURE.md   ← organisation du code
│
├── ROADMAP.md       ← roadmap du projet
└── CHANGELOG.md     ← historique des versions
```

## Ordre de lecture

Pour découvrir le projet :

1. `design/DESIGN.md` — vision globale
2. `design/COMBAT.md` — comment se battre
3. `design/LOOT-ADVANCED.md` — comment l'itemisation marche
4. `bestiary/bestiary.md` — qui on combat
5. `architecture/ARCHITECTURE.md` — comment c'est codé
6. `balance/PATCH-BALANCE.md` — quoi corriger en premier
7. `ROADMAP.md` — la suite
