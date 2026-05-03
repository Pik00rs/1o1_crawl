// src/js/render/iso-input.js
// Gestion unifiée des inputs canvas (souris + touch) pour le rendu iso.
//
// Expose une API qui déclenche des callbacks de haut niveau :
//   - onHover(tile)   : quand le curseur survole une tuile
//   - onSelect(tile)  : quand l'utilisateur valide une cible (click ou confirm popup)
//   - onCancel()      : escape
//   - onPan(dx, dy)   : drag caméra
//   - onZoom(factor)  : wheel ou pinch
//
// Le module gère lui-même :
//   - Le reticle tactile (élément #touch-reticle dans le DOM)
//   - Le popup de confirmation (élément #confirm-popup)
//   - La détection mode souris vs touch (au premier touchstart, on bascule)
//
// Le state du jeu (validTargets, reachableSet, selectedSkill) est lu via
// les fonctions getValidity() et getActionType() passées en config.

import { screenToIso, isoToScreen } from './iso-projection.js';

const RETICLE_OFFSET_Y = -55;

export function createIsoInput(opts){
  const {
    canvas,
    viewportRef,         // { width, height }
    viewRef,             // { camX, camY, zoom }
    gridSizeRef,         // { gridW, gridH }
    getElev,             // (gx, gy) => number
    getValidity,         // (gx, gy) => 'valid' | 'attack' | 'spell' | 'invalid' | null
    onHover,             // (tile|null) => void
    onSelect,            // (tile) => void
    onCancel,            // () => void
    onZoomChange,        // () => void  (optional, called when zoom changes)
    reticleEl,           // DOM element #touch-reticle
    confirmPopupEl,      // DOM element #confirm-popup
    cpLabelEl,           // DOM element label inside popup
    cpGoBtn,             // DOM element confirm go button
    cpCancelBtn,         // DOM element confirm cancel button
    getActionLabel,      // () => string  (label affiché dans popup)
    getActionColor,      // () => string  (couleur du label)
  } = opts;

  let inputMode = 'mouse'; // 'mouse' | 'touch'
  let cam = { dragging: false, sx: 0, sy: 0, ox: 0, oy: 0, justDragged: false };
  let touch = {
    active: false,
    startX: 0, startY: 0,
    fingerX: 0, fingerY: 0,
    pendingTile: null,
    isPan: false,
    twoFinger: false,
    pinchDist: 0,
  };
  let confirmingTile = null;

  // ---------- helpers ----------

  function tileAt(sx, sy){
    return screenToIso(sx, sy, gridSizeRef.gridW, gridSizeRef.gridH, viewportRef, getElev, viewRef);
  }

  function setReticleClass(cls){
    if(!reticleEl) return;
    reticleEl.classList.remove('valid','attack','spell','invalid');
    if(cls) reticleEl.classList.add(cls);
  }

  function hideReticle(){
    if(reticleEl) reticleEl.style.display = 'none';
    touch.pendingTile = null;
  }

  function updateReticle(fingerX, fingerY){
    if(!reticleEl) return;
    const rx = fingerX;
    const ry = fingerY + RETICLE_OFFSET_Y;
    reticleEl.style.left = rx + 'px';
    reticleEl.style.top = ry + 'px';
    const tile = tileAt(rx, ry);
    if(onHover) onHover(tile);
    if(!tile){
      setReticleClass('invalid');
      touch.pendingTile = null;
    } else {
      const validity = getValidity ? getValidity(tile.gx, tile.gy) : null;
      if(validity === 'valid' || validity === 'attack' || validity === 'spell'){
        setReticleClass(validity);
        touch.pendingTile = tile;
      } else {
        setReticleClass('invalid');
        touch.pendingTile = null;
      }
    }
    reticleEl.style.display = 'block';
  }

  function showConfirmPopup(tile){
    if(!confirmPopupEl) return;
    confirmingTile = { ...tile };
    const sp = isoToScreen(tile.gx, tile.gy, getElev(tile.gx, tile.gy), viewportRef, viewRef);
    let px = sp.x;
    let py = sp.y - 90;
    px = Math.max(80, Math.min(viewportRef.width - 80, px));
    py = Math.max(60, Math.min(viewportRef.height - 200, py));
    confirmPopupEl.style.left = px + 'px';
    confirmPopupEl.style.top = py + 'px';
    if(cpLabelEl){
      const label = getActionLabel ? getActionLabel(tile) : '▸ CONFIRM';
      const color = getActionColor ? getActionColor() : '#aee6ff';
      cpLabelEl.textContent = label;
      cpLabelEl.style.color = color;
    }
    confirmPopupEl.style.display = 'block';
  }

  function hideConfirmPopup(){
    if(confirmPopupEl) confirmPopupEl.style.display = 'none';
    confirmingTile = null;
  }

  // ---------- mouse ----------

  canvas.addEventListener('mousedown', e => {
    if(inputMode === 'touch') return;
    cam.dragging = true;
    cam.sx = e.clientX; cam.sy = e.clientY;
    cam.ox = viewRef.camX; cam.oy = viewRef.camY;
    cam.justDragged = false;
  });

  canvas.addEventListener('mousemove', e => {
    if(inputMode === 'touch') return;
    if(cam.dragging){
      const dx = e.clientX - cam.sx, dy = e.clientY - cam.sy;
      if(Math.abs(dx) + Math.abs(dy) > 4) cam.justDragged = true;
      viewRef.camX = cam.ox + dx;
      viewRef.camY = cam.oy + dy;
    }
    const tile = tileAt(e.clientX, e.clientY);
    if(onHover) onHover(tile);
  });

  canvas.addEventListener('mouseup', e => {
    if(inputMode === 'touch') return;
    if(cam.dragging && !cam.justDragged){
      const tile = tileAt(e.clientX, e.clientY);
      if(tile && onSelect) onSelect(tile);
    }
    cam.dragging = false;
  });

  canvas.addEventListener('mouseleave', () => {
    if(inputMode === 'touch') return;
    cam.dragging = false;
    if(onHover) onHover(null);
  });

  // ---------- wheel zoom ----------

  canvas.addEventListener('wheel', e => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.1 : 0.91;
    viewRef.zoom = Math.max(0.4, Math.min(2.5, viewRef.zoom * factor));
    if(onZoomChange) onZoomChange();
  }, { passive: false });

  // ---------- touch ----------

  canvas.addEventListener('touchstart', e => {
    e.preventDefault();
    inputMode = 'touch';

    if(e.touches.length === 2){
      touch.twoFinger = true;
      touch.active = false;
      cam.dragging = true;
      const t1 = e.touches[0], t2 = e.touches[1];
      cam.sx = (t1.clientX + t2.clientX) / 2;
      cam.sy = (t1.clientY + t2.clientY) / 2;
      cam.ox = viewRef.camX; cam.oy = viewRef.camY;
      touch.pinchDist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      hideReticle();
      hideConfirmPopup();
      return;
    }

    const t = e.touches[0];
    touch.twoFinger = false;
    touch.active = true;
    touch.startX = t.clientX;
    touch.startY = t.clientY;
    touch.fingerX = t.clientX;
    touch.fingerY = t.clientY;
    touch.isPan = false;

    // Si une cible est attendue (validity returns autre chose que null), on affiche le reticle
    const hasAction = !!opts.hasActiveAction && opts.hasActiveAction();
    if(hasAction){
      hideConfirmPopup();
      updateReticle(t.clientX, t.clientY);
    } else {
      cam.dragging = true;
      cam.sx = t.clientX; cam.sy = t.clientY;
      cam.ox = viewRef.camX; cam.oy = viewRef.camY;
      cam.justDragged = false;
    }
  }, { passive: false });

  canvas.addEventListener('touchmove', e => {
    e.preventDefault();
    if(!touch.active && !cam.dragging && !touch.twoFinger) return;

    if(touch.twoFinger && e.touches.length === 2){
      const t1 = e.touches[0], t2 = e.touches[1];
      const cx = (t1.clientX + t2.clientX) / 2;
      const cy = (t1.clientY + t2.clientY) / 2;
      viewRef.camX = cam.ox + (cx - cam.sx);
      viewRef.camY = cam.oy + (cy - cam.sy);
      const newDist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      if(touch.pinchDist > 0){
        const factor = newDist / touch.pinchDist;
        viewRef.zoom = Math.max(0.4, Math.min(2.5, viewRef.zoom * factor));
        if(onZoomChange) onZoomChange();
      }
      touch.pinchDist = newDist;
      return;
    }

    if(!e.touches[0]) return;
    const t = e.touches[0];
    touch.fingerX = t.clientX;
    touch.fingerY = t.clientY;

    const hasAction = !!opts.hasActiveAction && opts.hasActiveAction();
    if(hasAction && touch.active){
      updateReticle(t.clientX, t.clientY);
    } else if(cam.dragging){
      const dx = t.clientX - cam.sx, dy = t.clientY - cam.sy;
      if(Math.abs(dx) + Math.abs(dy) > 4) cam.justDragged = true;
      viewRef.camX = cam.ox + dx;
      viewRef.camY = cam.oy + dy;
    }
  }, { passive: false });

  canvas.addEventListener('touchend', e => {
    e.preventDefault();
    if(touch.twoFinger){
      touch.twoFinger = false;
      cam.dragging = false;
      return;
    }
    const hasAction = !!opts.hasActiveAction && opts.hasActiveAction();
    if(hasAction && touch.active && touch.pendingTile){
      showConfirmPopup(touch.pendingTile);
      hideReticle();
    } else {
      hideReticle();
    }
    touch.active = false;
    cam.dragging = false;
  }, { passive: false });

  // ---------- confirm buttons ----------

  if(cpGoBtn){
    const goHandler = (e) => {
      e.stopPropagation();
      if(e.cancelable) e.preventDefault();
      if(confirmingTile && onSelect) onSelect(confirmingTile);
      hideConfirmPopup();
    };
    cpGoBtn.addEventListener('click', goHandler);
    cpGoBtn.addEventListener('touchend', goHandler, { passive: false });
  }
  if(cpCancelBtn){
    const cancelHandler = (e) => {
      e.stopPropagation();
      if(e.cancelable) e.preventDefault();
      hideConfirmPopup();
    };
    cpCancelBtn.addEventListener('click', cancelHandler);
    cpCancelBtn.addEventListener('touchend', cancelHandler, { passive: false });
  }

  // ---------- keyboard ----------

  window.addEventListener('keydown', e => {
    if(e.key === 'Escape'){
      hideReticle();
      hideConfirmPopup();
      if(onCancel) onCancel();
    }
  });

  // ---------- public ----------

  return {
    hideReticle,
    hideConfirmPopup,
    setInputMode(mode){ inputMode = mode; },
    isTouch(){ return inputMode === 'touch'; },
  };
}
