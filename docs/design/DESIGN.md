# 🎨 Design Document

> Bible vivante du projet. À mettre à jour à chaque grande décision.

## 🎯 Vision
Dungeon crawler tour par tour où :
- Le **loot définit le personnage**, pas une classe rigide
- Chaque combat est une **énigme tactique**
- Les **synergies** entre objets créent des builds émergents
- Lisibilité et accessibilité priment

## 🧭 Inspirations
- **Divinity: OS2** : AP, combos élémentaires, positionnement
- **Diablo / PoE** : tiers de loot, affixes, builds via gear
- **Final Fantasy V** : jobs via équipement
- **Darkest Dungeon** : statuts impactants
- **Wasteland 3** : mitigation par armure, lisibilité

## ⚙️ Mécaniques

### AP (Action Points)
- 6 AP base + bonus équipement
- Déplacement 1/case, attaque légère 2, lourde 4, sort 2-5
- AP non utilisés → **Garde** (réduction de dégâts)

### Initiative
- Score individuel (Dex + d10)
- Timeline visible

### Combat
- Touche garantie + mitigation par armure
- Crit : 5% base + bonus, ×2 dégâts
- Types : Tranchant, Perforant, Contondant, Feu, Foudre, Glace, Poison, Sacré, Ombre

### Statuts
Brûlé, Saignement, Empoisonné, Gelé, Étourdi, Aveuglé, Affaibli, Marqué, Huilé.

### Combos
- Brûlé+Huilé = Explosion
- Mouillé+Foudre = Choc
- Gelé+Contondant = Brise
- Empoisonné+Feu = Gaz toxique
- Saignement ×3 = Hémorragie

## 🎒 Équipement (8 slots)
mainhand, offhand, head, chest, gloves, boots, amulet, ring×2.

Chaque pièce : stats + 1-3 affixes + 0-2 compétences.

## 🔗 Synergies (3 couches)
1. **Mots-clés** (Feu, Saignement, Glace...) → empilables
2. **Combos d'éléments** entre statuts
3. **Sets et tags** d'archétypes

## 📊 Stats
- **Force** — armes lourdes
- **Dextérité** — légères/distance, esquive, init
- **Intelligence** — magie
- **Constitution** — PV, résist statuts

## 🗺️ Grille
Carrée 8 directions (Chebyshev). 60px/case. Hauteur, couvert, murs.

## 🎲 Loot
Tiers : Commun → Magique → Rare → Épique → Légendaire → Set.

## ❓ Questions ouvertes
- [ ] Mort = KO ou définitif ?
- [ ] Brouillard de guerre ?
- [ ] Attaques d'opportunité ?
- [ ] Solo ou squad ?
- [ ] Donjons procéduraux ou hand-made ?
- [ ] Progression hors-loot ?
