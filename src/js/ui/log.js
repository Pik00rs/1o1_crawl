// src/js/ui/log.js
// Système de log de combat.

import { state } from '../core/state.js';

export function log(msg, type = 'info') {
  state.log.push({ msg, type });
  renderLog();
}

export function renderLog() {
  const el = document.getElementById('log');
  if (!el) return;
  el.innerHTML = state.log.slice(-50).map(e =>
    `<div class="log-entry log-${e.type}">${e.msg}</div>`
  ).join('');
  el.scrollTop = el.scrollHeight;
}
