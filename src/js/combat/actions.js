// src/js/combat/actions.js
// Gestion des actions du joueur (mouvement, sorts, attaques d'arme).
//
// Sources d'actions :
//   - Mouvement (toujours disponible)
//   - Attaques de l'arme équipée (light + heavy, dérivées via weapon-attacks.js)
//   - Sort de l'amulette équipée (1 actif, depuis spells.json via amulet.spell)
//   - Sorts/skills explicites définis dans item.skills (compat ascendante)
//   - Les anneaux ne donnent PAS d'action (passifs uniquement)

import { state } from '../core/state.js';
import { key, inBounds, isWall, getActorAt, getCellsInAOE } from '../grid/grid.js';
import { getReachableCells } from '../grid/pathfinding.js';
import { performAttack } from './attack.js';
import { getWeaponAttacks } from './weapon-attacks.js';
import { log } from '../ui/log.js';
import { render } from '../ui/render.js';
import { checkCombatEnd } from '../core/turn.js';

// =============================================================================
// COLLECTE DES ACTIONS DISPONIBLES
// =============================================================================

export function getPlayerSkills() {
  const skills = [];
  const eq = state.player.equipment || {};

  // 1) Attaques d'arme (light + heavy) depuis l'arme principale
  const mainhand = eq.mainhand || eq.weapon || eq.weapon1H || eq.weapon2H;
  if (mainhand) {
    const weaponAttacks = getWeaponAttacks(mainhand);
    for (const atk of weaponAttacks) {
      skills.push({ ...atk, source: mainhand, sourceSlot: 'mainhand' });
    }
  }

  // 2) Sort de l'amulette
  const amulet = eq.amulet;
  if (amulet?.spell) {
    const spellDef = window.__DATA__?.spells?.[amulet.spell];
    if (spellDef) {
      skills.push({ ...spellDef, source: amulet, sourceSlot: 'amulet' });
    }
  }

  // 3) Compat ascendante : si un item a un champ "skills" (ancien format)
  for (const slot in eq) {
    const item = eq[slot];
    if (!item?.skills) continue;
    for (const skillId of item.skills) {
      // Ne pas ré-ajouter le sort de l'amulette
      if (slot === 'amulet' && skillId === amulet?.spell) continue;
      const skillDef = window.__DATA__?.spells?.[skillId];
      if (skillDef && !skills.find(s => s.id === skillDef.id)) {
        skills.push({ ...skillDef, source: item, sourceSlot: slot });
      }
    }
  }

  return skills;
}

// =============================================================================
// SÉLECTION D'UN SKILL
// =============================================================================

export function selectSkill(skill) {
  if (state.player.ap < skill.cost) return;
  if (skill.cooldown && state.player.cooldowns[skill.id] > 0) return;
  state.selectedSkill = skill;

  if (skill.type === 'attack' || skill.type === 'spell') {
    state.targetingMode = skill.aoe ? 'aoe' : 'attack';
    state.validTargets = new Set();
    for (let x = 0; x < state.gridWidth; x++) {
      for (let y = 0; y < state.gridHeight; y++) {
        if (!inBounds(x, y) || isWall(x, y)) continue;
        const dist = Math.max(Math.abs(x - state.player.x), Math.abs(y - state.player.y));
        if (dist === 0 || dist > skill.range) continue;
        if (skill.targetType === 'enemy') {
          const a = getActorAt(x, y);
          if (a && !a.isDead && !a.isPlayer) state.validTargets.add(key(x, y));
        } else if (skill.targetType === 'tile') {
          state.validTargets.add(key(x, y));
        }
      }
    }
  }
  render();
}

export function selectMove() {
  state.selectedSkill = { id: 'move', name: 'Déplacement' };
  state.targetingMode = 'move';
  state.validTargets = new Set();
  const reachable = getReachableCells(state.player, state.player.ap);
  for (const k of reachable.keys()) state.validTargets.add(k);
  render();
}

// =============================================================================
// EXÉCUTION
// =============================================================================

export function executeAction(targetX, targetY) {
  const sk = state.selectedSkill;
  if (!sk) return;

  if (sk.id === 'move') {
    const reachable = getReachableCells(state.player, state.player.ap);
    const cost = reachable.get(key(targetX, targetY));
    if (cost === undefined) return;
    state.player.x = targetX;
    state.player.y = targetY;
    state.player.ap -= cost;
    log(`${state.player.name} se déplace (${cost} AP).`, 'info');
  } else if (sk.type === 'attack' || sk.type === 'spell') {
    if (!state.validTargets.has(key(targetX, targetY))) return;
    state.player.ap -= sk.cost;
    if (sk.cooldown) state.player.cooldowns[sk.id] = sk.cooldown + 1;

    if (sk.aoe) {
      const cells = getCellsInAOE(targetX, targetY, sk.aoe);
      for (const c of cells) {
        const a = getActorAt(c.x, c.y);
        if (a && !a.isDead && !a.isPlayer) {
          performAttack(state.player, a, sk, sk.source);
        }
        if (sk.damageType === 'fire') {
          state.fireTiles.set(key(c.x, c.y), 2);
        }
      }
      log(`${state.player.name} lance ${sk.name} en zone !`, 'info');
    } else {
      const target = getActorAt(targetX, targetY);
      if (target) performAttack(state.player, target, sk, sk.source);
    }
  }

  state.selectedSkill = null;
  state.targetingMode = null;
  state.validTargets = new Set();
  state.aoePreview = new Set();

  if (checkCombatEnd()) return;
  render();
}
