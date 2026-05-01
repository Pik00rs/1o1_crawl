// src/js/ui/timeline.js
import { state } from '../core/state.js';

export function renderTimeline() {
  const tl = document.getElementById('timeline');
  if (!tl) return;
  tl.innerHTML = `<span style="color:#888;font-size:11px;">Tour ${state.turn + 1} :</span>`;
  state.initiative.forEach((a, i) => {
    const e = document.createElement('div');
    e.className = 'timeline-entry';
    if (i === state.currentActorIdx && !a.isDead) e.classList.add('active');
    if (a.isDead) e.classList.add('dead');
    e.textContent = `${a.icon} ${a.name}`;
    tl.appendChild(e);
  });
}
