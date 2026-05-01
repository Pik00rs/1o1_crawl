// src/js/ui/render.js
// Orchestrateur de rendu : appelle tous les sub-renderers.

import { renderGrid } from './grid-render.js';
import { renderTimeline } from './timeline.js';
import { renderPlayerInfo, renderEquipment } from './panels.js';
import { renderActions } from './actions-ui.js';
import { renderLog } from './log.js';

export function render() {
  renderGrid();
  renderTimeline();
  renderPlayerInfo();
  renderActions();
  renderEquipment();
  renderLog();
}
