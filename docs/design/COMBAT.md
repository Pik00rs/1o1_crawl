# ⚔️ Système de Combat

## Boucle
[Init] → [Tour acteur N] → [N+1] → ... → [Nouveau tour]

## Tour d'un acteur
1. Réinit AP
2. Tick DoT
3. Tick cooldowns
4. Décrément durée statuts
5. Vérif CC (Étourdi/Gelé → skip)
6. Action(s)
7. AP restants → Garde

## Dégâts
```
brut = roll(armeDegats) + roll(bonusElemental)
brut *= multiplicateur (Coup Ardent = 1.5)
if (crit) brut *= 2
armureEff = isSpell ? armure/2 : armure
final = max(1, brut - armureEff)
```

## Critiques
- 5% base
- Bonus équipement
- Flanquement +10%, hauteur +10%, Marqué +15%

## Statuts
| Statut | Effet | Stack |
|---|---|---|
| Brûlé | DoT feu | Refresh |
| Saignement | DoT phys, ignore armure | ×5 |
| Empoisonné | DoT poison | Refresh |
| Gelé | Skip + ×2 contondant | Non |
| Étourdi | Skip | Non |
| Aveuglé | -50% précision | Refresh |
| Affaibli | -30% dégâts | Refresh |
| Marqué | +25% dégâts reçus | Refresh |
| Huilé | +50% feu reçu | Refresh |

## Réactions
- Riposte (bouclier) : 1×/tour mêlée
- Esquive : seuil
- Opportunity attack (Phase 4)
