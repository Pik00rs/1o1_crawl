# `src/` — Code source du jeu

C'est le **seul dossier qui contient le code de production**. Tout le reste (prototypes/, tools/, archive/) est jetable.

## Structure

```
src/
├── js/              ← code JavaScript (ES modules)
│   ├── core/        ← état, game loop, turns
│   ├── combat/      ← damage, attacks, statuts
│   ├── grid/        ← grille 8×6, pathfinding
│   ├── entities/    ← player, enemy
│   ├── loot/        ← générateur d'items, forge
│   ├── ai/          ← IA des ennemis
│   ├── ui/          ← rendu, panels, log
│   └── data/        ← loader des JSON
├── css/             ← styles
│   ├── base/        ← variables, layout global
│   └── components/  ← composants UI
├── data/            ← données du jeu (JSON)
└── assets/          ← (sprites, sons à venir)
```

## Conventions

- ES modules (`import` / `export`)
- `const` par défaut, `let` quand mutation, jamais `var`
- Pas de framework. Pas de bundler. Vanilla JS.
- Toutes les valeurs de gameplay vivent dans `src/data/*.json`, pas dans le code

Voir `docs/architecture/ARCHITECTURE.md` pour le détail.
