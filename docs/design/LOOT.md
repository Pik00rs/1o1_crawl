# 🎒 Système de Loot

## Tiers
| Tier | Couleur | Affixes | Skills | ID |
|---|---|---|---|---|
| Commun | Gris | 0 | 0 | Auto |
| Magique | Bleu | 1-2 | 0-1 | Auto |
| Rare | Jaune | 2-3 | 0-1 | Manuelle |
| Épique | Violet | 3 | 1 | Manuelle |
| Légendaire | Orange | 4 + unique | 1-2 | Manuelle |
| Set | Vert | 2 + bonus | 0-1 | Auto |

## Slots
mainhand, offhand, head, chest, gloves, boots, amulet, ring1, ring2

## Structure d'un item
```json
{
  "id": "flameSword",
  "name": "Lame de l'Embrasement",
  "icon": "🗡️",
  "rarity": "rare",
  "type": "mainhand",
  "tags": ["Feu", "Tranchant"],
  "damage": [18, 24],
  "damageType": "slash",
  "bonusDamage": { "fire": [5, 8] },
  "skills": ["flameStrike"]
}
```

## Génération procédurale
1. Roll tier (table de drop ennemi)
2. Roll type
3. Roll base item
4. Roll affixes (1-3 selon tier)
5. Préfixe + base + suffixe

## Sets
Bonus 2/4/6 pièces.

## Synergies par tags
"+5% Feu par item Feu équipé" → builds hybrides sans set strict.
