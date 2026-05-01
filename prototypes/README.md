# `prototypes/` — Prototypes et outils internes

⚠️ **Ces fichiers ne sont PAS du code de production.** Ils servent à explorer des idées et à valider des mécaniques. Le code de prod est dans `src/`.

## `playable/` — Démos HTML jouables

Démos standalone qu'on ouvre dans le navigateur. Trois directions visuelles testées :

- **`dungeon_prototype.html`** — vue top-down classique, le plus complet en code
- **`cyberpunk_demo.html`** — palette néon, ambiance "rétro-futuriste"
- **`iso_demo.html`** — vue isométrique 2.5D (la direction visuelle décidée)

## `tools/` — Outils internes (artifacts React)

Ces `.jsx` sont conçus pour être collés dans Claude.ai en artifact React. Ils ne tournent pas dans le jeu — ils servent à **inspecter et tester** les systèmes.

| Fichier | Rôle |
|---|---|
| `bestiary-viewer.jsx` | Parcourir les 40 ennemis avec filtres |
| `loot-maker.jsx` | Générer des items aléatoires un par un |
| `item-explorer-v1.jsx` | Voir l'espace des items (v1, ancien) |
| `item-explorer-v2.jsx` | Voir l'espace des items (v2) |
| `item-explorer-v3.jsx` | Voir l'espace des items (v3, **le plus à jour**) |
| `combat-simulator.jsx` | Simuler des combats pour valider le balance |
| `test-loot.html` | Test loot HTML standalone (alternative au .jsx) |

**Pour utiliser un `.jsx`** : ouvre Claude.ai → demande "ouvre ce fichier comme artifact React" → colle le contenu.
