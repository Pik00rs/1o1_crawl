# 🔧 Patch de balance complet — à appliquer dans le vrai code

> Tous les correctifs identifiés par 70k+ simulations, prêts à être appliqués.
> Garde ce fichier ouvert et applique chaque section dans `combat-simulator.jsx`, `item-explorer-v3.jsx` et `engine.mjs` du jeu.

---

## ⚙️ Patch 1 — Calcul des dégâts élémentaires

**Bug** : `bonusFireDamage` était ajouté DEUX fois (une fois pour les armes Fire/Magic + une fois pour TOUTES les armes en bonus), ce qui le rendait deux fois plus fort que ce qui était écrit.

**Fix** : appliquer les bonus élémentaires selon le type d'arme. Splash réduit (×0.4) pour les armes physiques.

### Code à remplacer (`calculateDamage`)

```js
// ❌ AVANT (buggé)
function calculateDamage(attacker, target, isPlayer) {
  let dmg = rollInRange(attacker.damage);
  const dmgType = attacker.damageType;
  if (isPlayer) {
    if (dmgType === 'fire' || dmgType === 'magic') dmg += attacker.bonusFireDamage || 0;
    if (dmgType === 'ice') dmg += attacker.bonusIceDamage || 0;
    if (dmgType === 'shock') dmg += attacker.bonusShockDamage || 0;
    if (dmgType === 'poison') dmg += attacker.bonusPoisonDamage || 0;
    dmg += (attacker.bonusFireDamage || 0); // ← BUG : ajouté une 2e fois
  }
  // ... reste du code
}

// ✅ APRÈS (corrigé)
function calculateDamage(attacker, target, isPlayer) {
  let dmg = rollInRange(attacker.damage);
  const dmgType = attacker.damageType;
  if (isPlayer) {
    if (dmgType === 'fire') {
      dmg += attacker.bonusFireDamage || 0;
    } else if (dmgType === 'magic') {
      dmg += Math.round((attacker.bonusFireDamage || 0) * 0.5);
    } else if (dmgType === 'ice') {
      dmg += attacker.bonusIceDamage || 0;
    } else if (dmgType === 'shock') {
      dmg += attacker.bonusShockDamage || 0;
    } else if (dmgType === 'poison') {
      dmg += attacker.bonusPoisonDamage || 0;
    } else {
      // Armes physiques (slash/pierce/blunt) : splash élémentaire réduit ×0.4
      dmg += Math.round((attacker.bonusFireDamage || 0) * 0.4);
      dmg += Math.round((attacker.bonusIceDamage || 0) * 0.4);
      dmg += Math.round((attacker.bonusShockDamage || 0) * 0.4);
      dmg += Math.round((attacker.bonusPoisonDamage || 0) * 0.4);
    }
  }
  // ... reste du code
}
```

---

## ⚙️ Patch 2 — Formule d'armure (diminishing returns)

**Bug** : armure flat reduction (`dmg = max(1, dmg - armor)`). À iLvl 5, le joueur a 60 armure et l'ennemi tape 30 → tu bloques 100% des dégâts. La stat n'a aucun impact mesurable (Δ 0.0% dans les simus).

**Fix** : formule en pourcentage avec diminishing returns. Plus tu as d'armure, moins chaque point supplémentaire est efficace. Cap à 75%.

### Code

```js
// ❌ AVANT (inutile)
if (isPhysical) {
  const effectiveArmor = Math.max(0, (target.armor || 0) - (attacker.armorPenetration || 0));
  dmg = Math.max(1, dmg - effectiveArmor);
}

// ✅ APRÈS (impactant)
if (isPhysical) {
  const effectiveArmor = Math.max(0, (target.armor || 0) - (attacker.armorPenetration || 0));
  // Diminishing returns : 50 armure = 50% reduction, 100 armure = 67%, cap 75%
  const armorReduction = Math.min(0.75, effectiveArmor / (effectiveArmor + 50));
  dmg = Math.max(1, Math.round(dmg * (1 - armorReduction)));
}
```

### Affixe `armor` à buffer

```js
// ARMOR_AFFIX_POOL
{ stat: 'armor', range: [4, 10] }   // ❌ AVANT (trop faible)
{ stat: 'armor', range: [8, 18] }   // ✅ APRÈS
```

### Armure de base des items à buffer aussi

```js
// generateSimItem - cas armure
const armorBase = { head: 7, chest: 10, legs: 6, gloves: 4, boots: 4 }[slot];      // ❌ AVANT
const armorBase = { head: 10, chest: 15, legs: 9, gloves: 6, boots: 6 }[slot];     // ✅ APRÈS

// offhand
armor: Math.round(10 * ilvlMult)   // ❌ AVANT
armor: Math.round(14 * ilvlMult)   // ✅ APRÈS
```

---

## ⚙️ Patch 3 — `hpRegen` cappé

**Bug** : range `[2,5]` × Legendary ×3.2 × iLvl 10 ×3.5 = jusqu'à **+56 PV/tour** sur un seul item. Avec 4 items du genre = invulnérable. Stat OP de loin (Δ +28% winrate).

**Fix** : range nerf + cap d'effet à +5 PV/tour total (peu importe combien d'items).

### Code

```js
// ARMOR_AFFIX_POOL
{ stat: 'hpRegen', range: [2, 5] }   // ❌ AVANT
{ stat: 'hpRegen', range: [1, 2] }   // ✅ APRÈS

// Dans aggregateStats(), juste avant le return
function aggregateStats(equipment) {
  const stats = { /* ... toutes les stats ... */ };
  for (const slot in equipment) { /* ... */ }

  // ✅ FIX : cap hpRegen à +5/tour total même avec plusieurs items
  stats.hpRegen = Math.min(stats.hpRegen, 5);

  // ✅ BONUS : cap des résistances et critChance
  stats.fireResist = Math.min(stats.fireResist, 75);
  stats.iceResist = Math.min(stats.iceResist, 75);
  stats.shockResist = Math.min(stats.shockResist, 75);
  stats.poisonResist = Math.min(stats.poisonResist, 75);
  stats.critChance = Math.min(stats.critChance, 70);

  return stats;
}
```

### Amélioration future suggérée

`hpRegen` reste un peu trop fort même cappé (+27% winrate). Solutions à essayer plus tard :
- Pas de regen si attaqué dans les 2 derniers tours
- Regen scale avec maxHP (ex: 1% maxHP/tour) au lieu de flat
- En faire une stat exclusive Set ou Legendary (plus disponible en affixe normal)

---

## ⚙️ Patch 4 — Scaling des ennemis

**Bug** : Joueur scale `×0.40 → ×3.50` (×8.75) en exponentiel. Ennemis scalent `0.4 → 2.47` en linéaire. Donc :
- Bas niveau : ennemis pas assez nerf, joueur trop sous-stuffé
- Haut niveau : joueur écrase tout, ennemis pas assez forts

**Fix** : aligner le scaling ennemi sur celui du joueur (même table).

### Code

```js
// ❌ AVANT (linéaire)
function scaleEnemy(archetype, dungeonLevel) {
  const lvlMult = 0.4 + (dungeonLevel - 1) * 0.23;
  // ...
}

// ✅ APRÈS (exponentiel cohérent)
const ENEMY_SCALE = ILVL_MULT_FLAT;  // même table que le joueur

function scaleEnemy(archetype, dungeonLevel) {
  const lvlMult = ENEMY_SCALE[dungeonLevel];
  const hpMult = lvlMult * (archetype.role === 'boss' ? 1.35 : archetype.role === 'elite' ? 1.15 : 1.0);
  const dmgMult = lvlMult * 0.95;  // léger nerf sur dégâts ennemis
  return {
    ...archetype,
    maxHP: Math.round(archetype.baseHP * hpMult),
    hp: Math.round(archetype.baseHP * hpMult),
    damage: [
      Math.round(archetype.baseDmg[0] * dmgMult),
      Math.round(archetype.baseDmg[1] * dmgMult)
    ],
    armor: Math.round(archetype.armor * lvlMult * 0.7),  // armure ennemis nerf
    statuses: [],
    isAlive: true,
  };
}
```

---

## ⚙️ Patch 5 — Boss HP rééquilibrés

**Bug** : `baseHP: 220-280` × scaling `0.4` = boss avec 88-112 HP au niveau 1 vs joueur avec ~60 HP. Joueur mort en 4 coups.

**Fix** : baseHP réduit, multiplicateur boss réduit, mais avec le nouveau scaling exponentiel ils restent forts en endgame.

### Code

```js
// ❌ AVANT
bossInferno:  { baseHP: 220, baseDmg: [18, 28], applyBurn: 60, ... }
bossCryo:     { baseHP: 250, baseDmg: [16, 24], applyChill: 50, ... }
bossToxic:    { baseHP: 280, baseDmg: [14, 22], applyPoison: 80, ... }
bossVoid:     { baseHP: 200, baseDmg: [20, 30], applyShock: 70, ... }
bossCrimson:  { baseHP: 240, baseDmg: [22, 32], applyBleed: 70, executeBonus: 50, ... }

// ✅ APRÈS
bossInferno:  { baseHP: 170, baseDmg: [16, 24], applyBurn: 40, ... }
bossCryo:     { baseHP: 190, baseDmg: [14, 22], applyChill: 40, ... }
bossToxic:    { baseHP: 200, baseDmg: [12, 20], applyPoison: 60, ... }
bossVoid:     { baseHP: 160, baseDmg: [18, 28], applyShock: 50, ... }
bossCrimson:  { baseHP: 180, baseDmg: [20, 30], applyBleed: 50, executeBonus: 50, ... }
```

Et le multiplicateur HP boss : `1.5` → `1.35` (déjà inclus dans `scaleEnemy` ci-dessus).

---

## ⚙️ Patch 6 — `lifesteal` nerf

**Observation** : devenu très fort (Δ +14.8%) après les autres fixes. Le combo `bonusFireDamage splash + lifesteal` rend le joueur trop tanky.

**Fix** : range nerf.

```js
// WEAPON_AFFIX_POOL et ACCESSORY_AFFIX_POOL
{ stat: 'lifesteal', range: [3, 8] }   // ❌ AVANT
{ stat: 'lifesteal', range: [2, 5] }   // ✅ APRÈS
```

---

## ⚙️ Patch 7 — `bonusFireDamage` et autres dégâts élémentaires

**Bug résiduel** : même après fix du double-counting, ces stats restent un peu fortes.

**Fix** : range nerf.

```js
// WEAPON_AFFIX_POOL et ACCESSORY_AFFIX_POOL
{ stat: 'bonusFireDamage',   range: [4, 10] }   // ❌ AVANT
{ stat: 'bonusIceDamage',    range: [4, 10] }
{ stat: 'bonusShockDamage',  range: [4, 10] }
{ stat: 'bonusPoisonDamage', range: [4, 9] }

{ stat: 'bonusFireDamage',   range: [3, 7] }    // ✅ APRÈS
{ stat: 'bonusIceDamage',    range: [3, 7] }
{ stat: 'bonusShockDamage',  range: [3, 7] }
{ stat: 'bonusPoisonDamage', range: [3, 7] }
```

---

## ⚙️ Patch 8 — `armorPenetration` nerf

**Observation** : trop fort (Δ +7.4%) avec l'ancienne armure inutile. Avec la nouvelle armure DR, faut nerfer la pen aussi sinon elle devient OP en endgame.

```js
// WEAPON_AFFIX_POOL
{ stat: 'armorPenetration', range: [3, 8] }   // ❌ AVANT
{ stat: 'armorPenetration', range: [2, 5] }   // ✅ APRÈS
```

---

## ⚙️ Patch 9 — `critMultiplier` buff

**Bug** : `critMultiplier` était sous-utilisé (Δ +2.4%) alors que `critChance` était fort (+10.8%). Le crit chance sans multi adéquat ne sert pas.

**Fix** : range buff.

```js
// WEAPON_AFFIX_POOL et ACCESSORY_AFFIX_POOL
{ stat: 'critMultiplier', range: [12, 30] }   // ❌ AVANT
{ stat: 'critMultiplier', range: [18, 40] }   // ✅ APRÈS
```

---

## ⚙️ Patch 10 — HP de base joueur

**Bug** : `baseHP = 30 + level * 5` donne 35 HP au lvl 1, c'est trop peu pour survivre aux mobs.

**Fix** : courbe rééquilibrée.

```js
// buildPlayer
const baseHP = 30 + level * 5;       // ❌ AVANT (lvl 1 = 35, lvl 10 = 80)
const baseHP = 50 + level * 7;       // ✅ APRÈS (lvl 1 = 57, lvl 10 = 120)
```

Ça buff les bas niveaux (×1.6 au lvl 1) sans trop changer le haut niveau (×1.5 au lvl 10).

---

## 🎮 Patch 11 — `cooldownReduction` à implémenter ou retirer

**Bug** : la stat existe dans le pool mais le simulateur n'a pas de cooldowns. Δ winrate ~0%.

**Décision à prendre** :
- **Option A** : retirer la stat de `ACCESSORY_AFFIX_POOL` jusqu'à ce que les sorts soient implémentés
- **Option B** : ajouter une mécanique de sort à cooldown (ex: amulette = sort actif)

Je recommande **Option A** pour la version actuelle (la réintroduire quand l'amulette aura un sort).

```js
// ACCESSORY_AFFIX_POOL — retirer cette ligne pour l'instant
// { stat: 'cooldownReduction', range: [5, 12] },
```

---

## ⚙️ Patch 12 — Boss Crimson (physique) trop facile

**Observation** : sans counter, 96% winrate. Le boss tape physique donc l'armure du joueur le contre tout seul.

**Fix proposé** : donner au boss Crimson un mécanisme spécial qui ignore une partie de l'armure ou applique un effet ne dépendant pas de la résistance physique.

```js
// ✅ APRÈS — ajouter ces propriétés
bossCrimson: {
  name: 'Champion Sang',
  icon: '🩸',
  role: 'boss',
  baseHP: 180,
  baseDmg: [20, 30],
  damageType: 'slash',
  armor: 7,
  range: 1,
  applyBleed: 60,           // chance d'appliquer Bleed (déjà ignore l'armure)
  executeBonus: 50,
  armorPiercing: 0.5,       // ⭐ NOUVEAU : ignore 50% de l'armure du joueur
  rampUpDamage: true,       // ⭐ NOUVEAU : +5% damage par tour passé en combat
  biome: 'crimson',
}
```

Et dans `calculateDamage` :

```js
if (isPhysical) {
  let effectiveArmor = Math.max(0, (target.armor || 0) - (attacker.armorPenetration || 0));
  // ⭐ NOUVEAU : armorPiercing % du boss
  if (attacker.armorPiercing) {
    effectiveArmor = Math.round(effectiveArmor * (1 - attacker.armorPiercing));
  }
  const armorReduction = Math.min(0.75, effectiveArmor / (effectiveArmor + 50));
  dmg = Math.max(1, Math.round(dmg * (1 - armorReduction)));
}
```

---

## 📋 Checklist d'application

Quand tu appliques ces patches dans ton vrai code, voici l'ordre recommandé :

1. ☑️ **Patch 4** (scaling ennemis) — fondation pour tout le reste
2. ☑️ **Patch 5** (boss HP) — fix le problème principal (boss trop forts à bas niveau)
3. ☑️ **Patch 10** (HP joueur) — buff les bas niveaux
4. ☑️ **Patch 1** (calcul dégâts) — fix le bug majeur
5. ☑️ **Patch 2** (armure DR) — rend l'armure utile
6. ☑️ **Patch 3** (hpRegen cap) — nerf la stat la plus broken
7. ☑️ **Patches 6, 7, 8, 9** (rerolls de ranges) — équilibre fin
8. ☑️ **Patch 11** (cooldownReduction) — décision design
9. ☑️ **Patch 12** (boss Crimson) — fix le boss trop facile

Après ces patches, ton balance devrait correspondre à `engine-v3.mjs` qui donne les résultats du `balance-report.md`.

---

## 🔁 Boucle d'amélioration continue

Pour continuer à améliorer le balance après ces patches :

1. Lance le simulateur sur ton vrai code (pas l'engine isolé)
2. Compare la heatmap réelle à celle de `engine-v3.mjs`
3. Si écart > 10% sur certaines cellules, c'est qu'un patch n'a pas été bien appliqué
4. Itère

**Ordre des prochaines optimisations** (après ces patches) :
- `hpRegen` reste fort → essayer la mécanique "pas de regen si attaqué"
- Niveau 1-4 encore durs → stuff de départ garanti ou boss progressifs (50% HP au lvl 1, 75% au lvl 2-3)
- `criticalDodgeChance` neutre → renforcer ou retirer
