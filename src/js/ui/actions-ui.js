// src/js/ui/actions-ui.js
// Rendu du panneau d'actions, groupé par source :
//   - Mouvement
//   - Arme (light + heavy)
//   - Sort d'amulette
//   - Passifs équipés (info uniquement, non cliquable)

import { state } from '../core/state.js';
import { getCurrentActor } from '../core/turn.js';
import { getPlayerSkills, selectMove, selectSkill } from '../combat/actions.js';
import { getDamageType } from '../combat/damage-types.js';

export function renderActions() {
  const cont = document.getElementById('actions');
  if (!cont) return;
  cont.innerHTML = '';

  const cur = getCurrentActor();
  const isPlayerTurn = cur?.isPlayer && !state.combatOver;

  // ===========================================================================
  // MOUVEMENT
  // ===========================================================================
  const moveBtn = document.createElement('button');
  moveBtn.className = 'action-btn';
  if (state.selectedSkill?.id === 'move') moveBtn.classList.add('selected');
  moveBtn.innerHTML = `🏃 Déplacement <span class="action-cost">1 AP / case</span>`;
  moveBtn.disabled = !isPlayerTurn || state.player.ap < 1;
  moveBtn.onclick = () => selectMove();
  cont.appendChild(moveBtn);

  // ===========================================================================
  // SKILLS GROUPÉS PAR SOURCE
  // ===========================================================================
  const skills = getPlayerSkills();

  // Grouper par sourceSlot
  const byGroup = {
    mainhand: [],
    amulet: [],
    other: [],
  };
  for (const sk of skills) {
    if (sk.sourceSlot === 'mainhand') byGroup.mainhand.push(sk);
    else if (sk.sourceSlot === 'amulet') byGroup.amulet.push(sk);
    else byGroup.other.push(sk);
  }

  if (byGroup.mainhand.length > 0) {
    const wpName = byGroup.mainhand[0].source?.name || 'Arme';
    appendSeparator(cont, `⚔️ ${wpName}`);
    for (const sk of byGroup.mainhand) appendSkillButton(cont, sk, isPlayerTurn);
  }

  if (byGroup.amulet.length > 0) {
    const amName = byGroup.amulet[0].source?.name || 'Amulette';
    appendSeparator(cont, `📿 ${amName}`);
    for (const sk of byGroup.amulet) appendSkillButton(cont, sk, isPlayerTurn);
  }

  if (byGroup.other.length > 0) {
    appendSeparator(cont, '🎒 Autres');
    for (const sk of byGroup.other) appendSkillButton(cont, sk, isPlayerTurn);
  }

  // ===========================================================================
  // PASSIFS (info, non cliquable)
  // ===========================================================================
  const passives = collectPassives();
  if (passives.length > 0) {
    appendSeparator(cont, '✨ Passifs équipés');
    for (const p of passives) {
      const div = document.createElement('div');
      div.className = 'passive-info';
      div.style.cssText = 'padding:6px 10px;font-size:11px;color:#aaa;border-left:2px solid #555;margin:2px 0;';
      div.innerHTML = `${p.icon || '💍'} <strong>${p.label}</strong> <span style="color:#888">${p.value}</span>`;
      cont.appendChild(div);
    }
  }
}

// =============================================================================
// HELPERS UI
// =============================================================================

function appendSeparator(cont, label) {
  const sep = document.createElement('div');
  sep.className = 'action-section';
  sep.style.cssText = 'font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:#888;padding:8px 0 4px;border-bottom:1px solid #2a2a30;margin-top:8px;';
  sep.textContent = label;
  cont.appendChild(sep);
}

function appendSkillButton(cont, sk, isPlayerTurn) {
  const btn = document.createElement('button');
  btn.className = 'action-btn';
  if (state.selectedSkill?.id === sk.id) btn.classList.add('selected');
  const cd = state.player.cooldowns[sk.id] || 0;

  // Couleur du type de dégâts
  const dmgInfo = sk.damageType ? getDamageType(sk.damageType) : null;
  const typeBadge = dmgInfo
    ? `<span style="display:inline-block;padding:1px 6px;font-size:9px;border:1px solid ${dmgInfo.color};color:${dmgInfo.color};letter-spacing:1px;">${dmgInfo.label}</span>`
    : '';

  let costInfo = `<span class="action-cost">${sk.cost} AP</span>`;
  if (sk.cooldown) costInfo = `<span class="action-cd">${cd > 0 ? `CD: ${cd}` : `CD ${sk.cooldown}`}</span>` + costInfo;

  btn.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;">
      <span><strong>${sk.name}</strong> ${typeBadge}</span>
      ${costInfo}
    </div>
    <small style="color:#888;display:block;margin-top:3px;">${sk.description || ''}</small>
  `;
  btn.disabled = !isPlayerTurn || state.player.ap < sk.cost || cd > 0;
  btn.onclick = () => selectSkill(sk);
  cont.appendChild(btn);
}

function collectPassives() {
  const out = [];
  const eq = state.player.equipment || {};
  for (const slot in eq) {
    const item = eq[slot];
    if (!item?.passive) continue;
    for (const [key, val] of Object.entries(item.passive)) {
      out.push({
        icon: item.icon,
        label: passiveLabel(key),
        value: passiveValueText(key, val),
        from: item.name,
      });
    }
  }
  return out;
}

const PASSIVE_LABELS = {
  lifesteal: 'Vol de vie',
  armorPen: 'Pénétration',
  hpRegen: 'Régénération',
  critChance: 'Chance critique',
  critMultiplier: 'Multi crit',
  dodgeChance: 'Esquive',
  blockChance: 'Blocage',
  riposte: 'Riposte',
  bonusFire: 'Bonus dégâts feu',
  bonusIce: 'Bonus dégâts glace',
  bonusShock: 'Bonus dégâts foudre',
  bonusPoison: 'Bonus dégâts poison',
  fireResist: 'Résist feu',
  iceResist: 'Résist glace',
  shockResist: 'Résist foudre',
  poisonResist: 'Résist poison',
  magicResist: 'Résist magique',
  ccReduction: 'Réduc CC',
};
function passiveLabel(key) {
  return PASSIVE_LABELS[key] || key;
}
function passiveValueText(key, val) {
  const isPct = ['lifesteal','critChance','critMultiplier','dodgeChance','blockChance',
                 'fireResist','iceResist','shockResist','poisonResist','magicResist','ccReduction'].includes(key);
  return `+${val}${isPct ? '%' : ''}`;
}
