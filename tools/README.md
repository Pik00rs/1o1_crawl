# `tools/` — Outils dev hors-jeu

Outils qui tournent en CLI Node.js, pas dans le navigateur.

## `balance/`

`balance-engine-v3.mjs` — simulateur de combats. Lance des milliers de duels (lvl 1-10) × (build) et sort une heatmap de winrates.

```bash
node tools/balance/balance-engine-v3.mjs
```

C'est ce moteur qui a permis d'identifier les 12 patches dans `docs/balance/PATCH-BALANCE.md`.

**Note** : ce moteur est **isolé** de `src/` — il a sa propre copie du calcul de combat. Quand tu modifies le balance dans le vrai code, refais une passe de simulation pour valider.
