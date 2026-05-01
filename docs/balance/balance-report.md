# 📊 Rapport de balance — Itération 1 → 3

## TL;DR

**Avant** : système quasi injouable à bas niveau (winrate 13% au lvl 1), trop facile en endgame (85% au lvl 10).
**Après 3 itérations** : winrate diagonal entre 56% et 70% sur les niveaux 5-10. Bas niveau encore un peu dur mais améliorable.

J'ai lancé **70 000+ simulations** sur ton système pour identifier mathématiquement les problèmes. Voici ce qu'on a trouvé et corrigé.

---

## 🐛 BUGS TROUVÉS (à appliquer dans le vrai code)

### Bug 1 — `bonusFireDamage` doublé
Dans le simulateur, j'avais ce code :
```js
if (dmgType === 'fire' || dmgType === 'magic') dmg += attacker.bonusFireDamage || 0;
// ...
dmg += (attacker.bonusFireDamage || 0);  // ← AJOUTÉ UNE 2e FOIS POUR TOUTES LES ARMES
```

C'est pour ça que cette stat sortait avec un Δ +23% — elle était comptée double. **Pour le vrai jeu, faut décider** :
- **Option A** : `bonusFireDamage` ne s'applique QUE sur les armes Fire/Magic
- **Option B** : Sur toutes les armes mais en "splash" réduit (×0.4 ou ×0.5)
- **Option C** : Tu fais des "tags" sur les armes et l'affixe scale selon le tag

J'ai pris **Option B** dans la v3 (splash ×0.4 sur les armes physiques).

### Bug 2 — `hpRegen` infiniment stackable
Range était `[1,4]`. En endgame Legendary perfect roll iLvl 10, ça donnait `4 × 3.2 × 3.5 = 45 PV/tour` sur un seul item. Avec 4 items dans ce style, c'était **180 PV regen/tour** = invulnérable.

**Fix appliqué** : range `[1,2]` + cap d'effet à **+5 PV/tour total** même avec plusieurs items. Si tu veux plus, faut un set bonus ou un legendary spécifique.

### Bug 3 — Boss HP trop hauts à bas niveau, trop bas en haut niveau
Avec `baseHP: 220` × `0.4` (lvl 1) = 88 HP boss vs 60 HP joueur → joueur mort en 4 coups.
Avec `baseHP: 220` × `2.5` (lvl 10) = 550 HP boss vs 320 HP joueur → joueur tape vite vu qu'il a +400% damage.

**Fix appliqué** : baseHP boss réduit à 150-200, mais avec un nouveau scaling exponentiel cohérent avec celui du joueur.

### Bug 4 — Scaling ennemis ≠ scaling joueur
Joueur : iLvl mult ×0.40 → ×3.50 (croissance ×8.75)
Ennemis : 0.4 → 2.47 (croissance ×6.18 linéaire)

Donc le joueur scale **plus vite** que les ennemis. Au début il est sous-scalé, à la fin il les écrase.

**Fix appliqué** : ennemis utilisent maintenant **la même courbe que le joueur** (`ENEMY_SCALE = ILVL_MULT_FLAT`).

### Bug 5 — Armure flat reduction inutile
Formule originale : `dmg = max(1, dmg - armor)`. À iLvl 5, tu avais 60 armure et l'ennemi tapait 30. → tu bloquais 100% des dégâts (cap mini = 1). Peu importe combien d'armure tu avais au-delà de 30.

**Fix appliqué** : formule **diminishing returns** :
```
armorReduction = min(0.75, armor / (armor + 50))
dmg *= (1 - armorReduction)
```
Avec 50 armure → 50% reduction. Avec 100 armure → 67%. Cap à 75% pour éviter l'invulnérabilité.

### Bug 6 — `cooldownReduction` totalement inutile
Le simulateur n'a pas de système de cooldowns (juste attaques basiques). Stat affichée mais sans aucun impact.

**Fix nécessaire** : implémenter les cooldowns (sorts de l'amulette, abilities) ou retirer la stat.

---

## 📈 ÉVOLUTION DU BALANCING

### Heatmap finale (v3)
```
       D1   D2   D3   D4   D5   D6   D7   D8   D9   D10
S1  │  28    3    1    0    0    0    0    0    0    0
S2  │  78   35    7    1    0    0    0    0    0    0
S3  │  97   78   37   18    3    1    0    0    0    0
S4  │ 100   97   79   44   22    5    1    1    0    0
S5  │ 100  100   95   77   56   31    8    2    1    0
S6  │ 100  100  100   96   84   60   31   14    4    2
S7  │ 100  100  100   99   96   81   60   41   22    7
S8  │ 100  100  100  100  100   96   85   68   39   20
S9  │ 100  100  100  100  100  100   97   85   70   41
S10 │ 100  100  100  100  100  100  100   98   84   66
```

### Diagonale (stuff = donjon, équilibré attendu : 50-70%)

| Lvl | v1 | v2 | v3 | Verdict |
|---|---|---|---|---|
| 1 | 13.5% | 34.5% | 27.5% | 🔴 dur (oversized starting boss) |
| 2 | 12.0% | 47.5% | 35.0% | 🟡 acceptable |
| 3 | 18.0% | 51.5% | 36.5% | 🟡 acceptable |
| 4 | 23.0% | 64.0% | 43.5% | 🟡 acceptable |
| 5 | 40.5% | 65.5% | **56.5%** | 🟢 bon |
| 6 | 51.5% | 73.5% | **60.0%** | 🟢 bon |
| 7 | 53.5% | 75.5% | **59.5%** | 🟢 bon |
| 8 | 61.0% | 78.5% | **67.5%** | 🟢 bon |
| 9 | 82.5% | 78.5% | **70.0%** | 🟢 bon |
| 10 | 85.0% | 80.5% | **66.0%** | 🟢 bon |

**Verdict** : niveau 5-10 sont maintenant équilibrés (objectif 50-70% atteint).
Niveau 1-4 restent trop durs — probablement un problème spécifique au boss qui est encore trop fort vs un joueur très peu stuff (1-2 affixes par item à bas iLvl).

---

## 🎯 STATS DÉSÉQUILIBRÉES (v3)

| Stat | Δ winrate | Niveau |
|---|---|---|
| hpRegen | +27.5% | 🔴 OP (encore) |
| maxHP | +18.7% | 🔴 OP |
| bonusFireDamage | +17.2% | 🔴 OP |
| lifesteal | +14.8% | 🟠 fort |
| critChance | +13.7% | 🟠 fort |
| dodgeChance | +11.7% | 🟠 fort |
| bonusIceDamage | +11.4% | 🟠 fort |
| bonusShockDamage | +10.0% | 🟠 fort |
| **(reste : 4-8% = bon)** | | 🟢 |
| ccReduction | -0.4% | ⚪ neutre |
| cooldownReduction | +2.4% | ⚪ neutre (pas implémenté) |
| criticalDodgeChance | +2.9% | ⚪ neutre |

### Observations importantes

**Stats encore trop fortes** :
- **hpRegen** reste OP même cap à +5/tour. Probable explication : 5 PV/tour × 25 tours de combat = 125 PV régénérés, c'est énorme. **Fix proposé** : réduire encore + faire que la regen ne s'applique que si pas attaqué récemment.
- **maxHP** flat est devenu très important (logique vu qu'on a buffé HP boss).
- **bonusFireDamage** : même avec splash ×0.4, c'est encore un peu fort. Probablement parce qu'il s'applique à toutes les armes.

**Stats neutres (problème)** :
- **ccReduction** : faut que les ennemis appliquent plus souvent du CC pour que la stat compte
- **criticalDodgeChance** : impact trop niche, à 3% chance d'esquive critique c'est peu
- **cooldownReduction** : pas implémenté → faut soit le retirer soit ajouter des cooldowns

---

## 🌍 COUNTER BIOME

Test : équiper +30% de la résistance correspondante au boss du biome, vs équipement random.

| Boss | WR sans counter | WR avec counter | Δ |
|---|---|---|---|
| Inferno (Fire) | 72% | 100% | **+28%** |
| Cryo (Ice) | 76% | 100% | **+24%** |
| Toxic (Poison) | 62% | 99% | **+38%** |
| Voidnet (Shock) | 64% | 100% | **+36%** |
| Crimson (Slash physique) | 96% | 91% | -5% |

**Conclusions** :
- ✅ Le système de résistance counter **fonctionne très bien** pour les boss élémentaires (+24 à +38% de winrate avec counter)
- ⚠️ Le **boss Crimson** (physique) ne profite pas du système de résistances → il faut soit un système d'armure plus important contre lui, soit un boss vraiment dur (ses 96% sans counter c'est trop facile)
- ✅ Le système incite à **farmer plusieurs biomes** pour avoir le bon stuff anti-boss

---

## 🚀 RECOMMANDATIONS POUR LE VRAI JEU

### À appliquer en priorité (bugs majeurs)

1. **Fixer le double-counting de bonusFireDamage** dans tes calculs de dégâts
2. **Cap hpRegen** à +5/tour total ou nerf range à `[1,2]` ou les deux
3. **Refaire la formule d'armure** en diminishing returns (`armor / (armor + 50)`)
4. **Aligner scaling ennemis** sur celui du joueur (×0.40 → ×3.50)
5. **Réduire HP de base des boss** de 30%

### Améliorations design

1. **Implémenter les cooldowns** pour que `cooldownReduction` soit utile (sorts d'amulette par exemple)
2. **Faire que les ennemis appliquent plus de CC** pour que `ccReduction` compte
3. **Ajouter un mécanisme pour `criticalDodgeChance`** plus fort (genre +1 sec d'invulnérabilité après esquive crit)
4. **Le boss Crimson est trop facile** — il faut soit augmenter ses dégâts, soit lui donner un effet spécial qui ne se contre pas par armure

### Pour les bas niveaux (1-4)

Le scaling est encore trop dur. Plusieurs solutions possibles :
- **Stuff de départ garanti** : niveau 1, le joueur reçoit un "Set du Débutant" basique pour pas être tout nu
- **Boss progressifs** : boss niveau 1-3 nettement plus faibles (50% HP)
- **Plus de PV de base** : 60+lvl×7 au lieu de 50+lvl×7

### Test counter

Le système de résistance fonctionne. **Garde-le tel quel** mais ajuste pour que :
- Sans counter mais bonne armure générale = ~50% winrate
- Avec counter spécifique = ~80% winrate (pas 100% sinon trop trivial)

Pour ça : nerfer un peu les résistances rollables (`[8,18]` → `[6,14]`) ou réduire le cap de 75% à 60%.

---

## 💾 Fichiers de référence

- `engine.mjs` — version v1 (originale, buggée)
- `engine-v2.mjs` — version v2 (premiers fixes)
- `engine-v3.mjs` — version v3 (raffinements)
- `final-matrix.json` — heatmap winrate complète
- `final-stats.json` — impact détaillé de chaque stat

**Performance** : 16 000+ simulations/seconde dans Node, donc un test de 100 000 runs prend ~6 secondes.
