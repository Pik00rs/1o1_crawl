// src/js/combat/damage.js
// Calcul des dégâts.

export function rollDamage(range) {
  return range[0] + Math.floor(Math.random() * (range[1] - range[0] + 1));
}

export function computeDamage({ attacker, target, skill, weapon }) {
  let dmg = 0;
  const isSpell = skill?.type === 'spell';

  if (skill?.damage) {
    dmg = rollDamage(skill.damage);
  } else if (weapon) {
    dmg = rollDamage(weapon.damage);
    if (weapon.bonusDamage) {
      for (const t in weapon.bonusDamage) dmg += rollDamage(weapon.bonusDamage[t]);
    }
  } else {
    dmg = rollDamage(attacker.attackPower);
  }

  if (skill?.damageMult) dmg = Math.floor(dmg * skill.damageMult);

  const critChance = 5 + (skill?.critBonus || 0);
  const isCrit = Math.random() * 100 < critChance;
  if (isCrit) dmg *= 2;

  const effArmor = isSpell ? Math.floor(target.armor / 2) : target.armor;
  dmg = Math.max(1, dmg - effArmor);

  return { dmg, isCrit, isSpell };
}
