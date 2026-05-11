// src/js/combat/actions.js
// Gestion des actions du joueur.
//
// Affixes câblés :
//   - freeMovement       : 1ère case de mvt gratuite/tour
//   - freeOpenerChance   : 1ère action du combat gratuite (cost=0)
//   - freeShotChance     : tir gratuit % (ranged only)
//   - spellAPCostReduction : -X AP sur sorts
//   - spellRange         : +X portée des sorts
//   - aoeRadius          : +X rayon AOE
//   - bowRangeBonus      : +X portée si arme bow équipée
//   - cleavePct          : touche les ennemis adjacents à la cible mêlée
//   - fly                : pathfinding ignore les murs (TODO : nécessite mod pathfinding.js)
//   - Tracking _movedThisTurn / _cellsMovedThisTurn / _firstAttackDone pour les conditionnels

import { state } from '../core/state.js';
import { key, inBounds, isWall, getActorAt, getCellsInAOE } from '../grid/grid.js';
import { getReachableCells } from '../grid/pathfinding.js';
import { performAttack } from './attack.js';
import { getWeaponAttacks } from './weapon-attacks.js';
import { log } from '../ui/log.js';
import { render } from '../ui/render.js';
import { checkCombatEnd } from '../core/turn.js';
import { getCleaveTargets, shouldUseFreeOpener, shouldUseFreeShot } from './modifiers.js';

// =============================================================================
// HELPERS — détecter type d'arme
// =============================================================================

function isBowEquipped(player) {
  const mh = player.equipment?.mainhand;
  if (!mh) return false;
  // On considère bow par nom ou par damageType+range
  if (mh.id?.includes('bow') || mh.id?.includes('Bow')) return true;
  return (mh.range || 1) >= 3 && mh.damageType === 'pierce';
}

// =============================================================================
// COLLECTE DES ACTIONS DISPONIBLES
// =============================================================================

export function getPlayerSkills() {
  const skills = [];
  const eq = state.player.equipment || {};

  // 1) Attaques d'arme
  const mainhand = eq.mainhand || eq.weapon || eq.weapon1H || eq.weapon2H;
  if (mainhand) {
    const weaponAttacks = getWeaponAttacks(mainhand);
    for (const atk of weaponAttacks) {
      // bowRangeBonus : +range pour arc
      if (state.player.bowRangeBonus && isBowEquipped(state.player)) {
        atk.range = (atk.range || 1) + state.player.bowRangeBonus;
      }
      skills.push({ ...atk, source: mainhand, sourceSlot: 'mainhand' });
    }
  }

  // 2) Sort de l'amulette
  const amulet = eq.amulet;
  if (amulet?.spell) {
    const spellDef = window.__DATA__?.spells?.[amulet.spell];
    if (spellDef) {
      const spell = { ...spellDef, source: amulet, sourceSlot: 'amulet' };
      // spellRange : +range
      if (state.player.spellRange) {
        spell.range = (spell.range || 1) + state.player.spellRange;
      }
      // spellAPCostReduction : -cost
      if (state.player.spellAPCostReduction) {
        spell.cost = Math.max(0, (spell.cost || 0) - state.player.spellAPCostReduction);
      }
      // aoeRadius : +rayon AOE
      if (state.player.aoeRadius && spell.aoe) {
        spell.aoe = (spell.aoe || 1) + state.player.aoeRadius;
      }
      // amuletSpellPower : boost damage du sort de l'amulette
      if (state.player.amuletSpellPower && spell.damage && Array.isArray(spell.damage)) {
        const boost = 1 + state.player.amuletSpellPower / 100;
        spell.damage = [
          Math.max(1, Math.round(spell.damage[0] * boost)),
          Math.max(1, Math.round(spell.damage[1] * boost)),
        ];
      }
      skills.push(spell);
    }
  }

  // 3) Compat ascendante : si un item a un champ "skills"
  for (const slot in eq) {
    const item = eq[slot];
    if (!item?.skills) continue;
    for (const skillId of item.skills) {
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
// SÉLECTION
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
  const freeAvail = (state.player.freeMovement || 0) > 0 && !state.player._freeMovementUsedThisTurn ? 1 : 0;
  const reachable = getReachableCells(state.player, state.player.ap + freeAvail);
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
    const freeAvail = (state.player.freeMovement || 0) > 0 && !state.player._freeMovementUsedThisTurn ? 1 : 0;
    const reachable = getReachableCells(state.player, state.player.ap + freeAvail);
    const cost = reachable.get(key(targetX, targetY));
    if (cost === undefined) return;

    // Track distance bougée ce tour (pour longMoveDamageMult)
    state.player._cellsMovedThisTurn = (state.player._cellsMovedThisTurn || 0) + cost;
    state.player._movedThisTurn = true;

    state.player.x = targetX;
    state.player.y = targetY;

    let apCost = cost;
    if (freeAvail > 0 && cost > 0) {
      apCost = Math.max(0, cost - 1);
      state.player._freeMovementUsedThisTurn = true;
      log(`${state.player.name} se déplace (${apCost} AP, +1 gratuit).`, 'info');
    } else {
      log(`${state.player.name} se déplace (${cost} AP).`, 'info');
    }
    state.player.ap -= apCost;
  } else if (sk.type === 'attack' || sk.type === 'spell') {
    if (!state.validTargets.has(key(targetX, targetY))) return;

    // === COÛT AP : free opener / free shot / free spell on kill ===
    let cost = sk.cost;
    let freeMsg = null;
    if (shouldUseFreeOpener(state.player)) {
      cost = 0;
      freeMsg = '⚡ Ouverture gratuite !';
    } else if (sk.type === 'attack' && shouldUseFreeShot(state.player, sk)) {
      cost = 0;
      freeMsg = '⚡ Tir gratuit !';
    } else if (sk.type === 'spell' && state.player._freeSpellAvailable) {
      cost = 0;
      state.player._freeSpellAvailable = false;
      freeMsg = '⚡ Sort gratuit !';
    }
    if (freeMsg) log(freeMsg, 'info');

    state.player.ap -= cost;
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
      if (target) {
        performAttack(state.player, target, sk, sk.source);

        // === CLEAVE === : si attaque mêlée et cleavePct > 0, touche les ennemis adjacents
        if (state.player.cleavePct && sk.type === 'attack' && (sk.range || 1) === 1) {
          const cleaveTargets = getCleaveTargets(state.player, target, sk);
          if (cleaveTargets.length > 0) {
            const cleaveDmgMult = state.player.cleavePct / 100;
            for (const ct of cleaveTargets) {
              // On crée un skill miroir avec dégâts réduits par cleavePct
              const cleaveSkill = {
                ...sk,
                _isCleaveHit: true,
                damageMult: (sk.damageMult || 1) * cleaveDmgMult,
              };
              performAttack(state.player, ct, cleaveSkill, sk.source);
            }
            log(`${state.player.name} fauche ${cleaveTargets.length} ennemi(s) adjacent(s).`, 'info');
          }
        }
      }
    }
  }

  state.selectedSkill = null;
  state.targetingMode = null;
  state.validTargets = new Set();
  state.aoePreview = new Set();

  if (checkCombatEnd()) return;
  render();
}

/**
 * À appeler en début de tour du joueur pour reset les flags par-tour.
 */
export function resetPerTurnFlags(actor) {
  if (!actor) return;
  delete actor._freeMovementUsedThisTurn;
  delete actor._movedThisTurn;
  delete actor._cellsMovedThisTurn;
  delete actor.ripostedThisTurn;
}
