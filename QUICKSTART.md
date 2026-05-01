# 🚀 Quick Start — Reactor Hollow

Pour reprendre le projet ou onboarder quelqu'un d'autre.

---

## 1. Cloner et lancer

```bash
git clone <ton-repo>
cd reactor-hollow

# lancer un serveur local (au choix)
python3 -m http.server 8000
# ou
npx serve .
```

Ouvrir `http://localhost:8000`.

---

## 2. Comprendre ce qui existe

Dans l'ordre :

1. **Joue le jeu actuel** (`index.html`) pour voir où on en est.
2. **Ouvre `docs/design/DESIGN.md`** pour la vision globale.
3. **Lis `docs/architecture/ARCHITECTURE.md`** pour le code.
4. **Regarde le bestiaire** dans `docs/bestiary/bestiary.md`.
5. **Comprends ce qui doit être fixé** dans `docs/balance/PATCH-BALANCE.md`.

---

## 3. Voir les prototypes visuels

Trois directions ont été explorées :

```bash
# Top-down (le plus avancé en code)
open prototypes/playable/dungeon_prototype.html

# Cyberpunk (palette néon)
open prototypes/playable/cyberpunk_demo.html

# Isométrique 2.5D (la direction visuelle décidée)
open prototypes/playable/iso_demo.html
```

---

## 4. Tester les outils internes

Les `.jsx` dans `prototypes/tools/` se collent dans Claude.ai en artifact React :

- `bestiary-viewer.jsx` — parcourir les 40 ennemis
- `loot-maker.jsx` — générer des items aléatoires
- `item-explorer-v3.jsx` — voir l'espace des items possibles
- `combat-simulator.jsx` — simuler des combats

---

## 5. Lancer une simulation de balance

```bash
node tools/balance/balance-engine-v3.mjs
```

Ça génère 70k combats sur la matrice (lvl 1-10) × (build slot config) et sort les winrates.

---

## 6. Prochaines actions concrètes

Dans cet ordre de priorité :

### Aujourd'hui
1. ☐ Push ce repo sur GitHub
2. ☐ Connecter Vercel
3. ☐ Vérifier que le jeu actuel se lance bien

### Cette semaine
4. ☐ Appliquer les 12 patches de `docs/balance/PATCH-BALANCE.md`
5. ☐ Brancher `src/data/enemies.json` (le nouveau bestiaire) dans `src/js/entities/enemy.js`
6. ☐ Décider de la direction visuelle finale (top-down, cyberpunk, iso ?)

### Ce mois
7. ☐ Implémenter sorts d'amulettes + cooldowns
8. ☐ Implémenter `armorPiercing` et `rampUpDamage` (boss Crimson)
9. ☐ Sprites/anims minimum viable
10. ☐ Sauvegarde locale

---

## 7. Quand t'es bloqué

Reprends une conv dans Claude.ai en uploadant le fichier qui te pose problème. Toute la doc est dans `docs/`, donc Claude pourra retrouver le contexte rapidement.

Ou utilise les outils :
- Sur du loot bizarre : `loot-maker.jsx` ou `item-explorer-v3.jsx`
- Sur un combat déséquilibré : `combat-simulator.jsx` ou l'engine en CLI
- Sur un ennemi à ajouter : modifie `src/data/enemies.json` puis relance le simulateur
