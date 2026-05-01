// src/js/render/characters/hero.js
// Personnage principal — Kael, mage en armure avec cape et bâton à cristal.
// Style : pixel-art chunky + touches anime (cheveux, yeux brillants).
//
// Le rendu est complètement déterminé par les couleurs de l'objet "actor"
// passé en paramètre. Ça permet de réutiliser ce même renderer pour des
// variantes de héros (NPCs alliés, autres skins) en changeant juste
// bodyColor / accentColor / hairColor / etc.

import { hexToRgba, shade } from '../iso-utils.js';

/**
 * Config par défaut du héros principal.
 * Sert de modèle quand on instancie l'actor du joueur.
 */
export const heroConfig = {
  id: 'kael',
  name: 'KAEL',
  archetype: 'hero',

  // Palette principale
  bodyColor:   '#3a4a5c',  // armure bleu-acier
  accentColor: '#4fc3f7',  // glow cyan
  glowColor:   '#aee6ff',  // halo plus clair
  skinColor:   '#f4d4a8',  // peau
  hairColor:   '#2c3640',  // cheveux foncés bleu-gris
  capeColor:   '#1a2230',  // cape sombre

  // Mensurations
  height: 'medium',  // small | medium | large

  // Pose
  weapon: 'staff',   // staff | sword | dagger | none
};

/**
 * Dessine le héros à la position (cx, cy) — où cy est la position
 * "des pieds" du personnage.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} cx
 * @param {number} cy - position des pieds (le perso est dessiné au-dessus)
 * @param {object} actor - { bodyColor, accentColor, ..., idle, target }
 * @param {number} time - frame counter
 * @param {object} options - { fxLevel }
 */
export function drawHero(ctx, cx, cy, actor, time, options = {}){
  const fxLevel = options.fxLevel ?? 1;
  const idle = actor.idle ?? 0;
  const moving = !!actor.target;
  const bob = Math.sin(idle) * 1.2;
  const breathe = Math.sin(idle * 0.7) * 0.5;
  const stride = moving ? Math.sin(time * 0.4) * 1.5 : 0;

  // Apply bob to vertical position
  cy = cy - 10 + bob;

  // Cape (derrière le corps)
  const flutter = Math.sin(time * 0.06 + idle) * 1.5;
  ctx.fillStyle = actor.capeColor;
  ctx.beginPath();
  ctx.moveTo(cx-7, cy-3+breathe);
  ctx.lineTo(cx+7, cy-3+breathe);
  ctx.lineTo(cx+5+flutter, cy+7);
  ctx.lineTo(cx-5+flutter, cy+7);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = shade(actor.capeColor, -0.3);
  ctx.beginPath();
  ctx.moveTo(cx+5, cy-3+breathe);
  ctx.lineTo(cx+7, cy-3+breathe);
  ctx.lineTo(cx+5+flutter, cy+7);
  ctx.lineTo(cx+3+flutter, cy+7);
  ctx.closePath();
  ctx.fill();

  // Jambes
  ctx.fillStyle = shade(actor.bodyColor, -0.3);
  ctx.fillRect(cx-6, cy+6+stride, 4, 9);
  ctx.fillRect(cx+2, cy+6-stride, 4, 9);
  // Bottes
  ctx.fillStyle = shade(actor.bodyColor, -0.55);
  ctx.fillRect(cx-7, cy+14+stride, 5, 2);
  ctx.fillRect(cx+2, cy+14-stride, 5, 2);
  // Bottes — accent
  ctx.fillStyle = actor.accentColor;
  ctx.fillRect(cx-6, cy+14+stride, 4, 1);
  ctx.fillRect(cx+2, cy+14-stride, 4, 1);

  // Torse principal (armure)
  ctx.fillStyle = actor.bodyColor;
  ctx.beginPath();
  ctx.moveTo(cx-8, cy+5);
  ctx.lineTo(cx+8, cy+5);
  ctx.lineTo(cx+7, cy-8+breathe);
  ctx.lineTo(cx-7, cy-8+breathe);
  ctx.closePath();
  ctx.fill();
  // Ombrage côté droit
  ctx.fillStyle = shade(actor.bodyColor, -0.3);
  ctx.beginPath();
  ctx.moveTo(cx+8, cy+5);
  ctx.lineTo(cx+7, cy-8+breathe);
  ctx.lineTo(cx+2, cy-8+breathe);
  ctx.lineTo(cx+2, cy+5);
  ctx.closePath();
  ctx.fill();
  // Highlight gauche
  ctx.fillStyle = shade(actor.bodyColor, 0.25);
  ctx.fillRect(cx-7, cy-7+breathe, 2, 11);

  // Emblème runique sur le plastron (pulse)
  const runePulse = Math.sin(time*0.08 + idle) * 0.3 + 0.7;
  ctx.fillStyle = '#000';
  ctx.fillRect(cx-2, cy-4+breathe, 4, 5);
  ctx.fillStyle = actor.accentColor;
  ctx.fillRect(cx-1, cy-3+breathe, 2, 3);
  ctx.fillStyle = `rgba(255,255,255,${runePulse})`;
  ctx.fillRect(cx, cy-2+breathe, 1, 1);

  // Épaulettes pointues
  ctx.fillStyle = shade(actor.bodyColor, 0.2);
  ctx.beginPath();
  ctx.moveTo(cx-9, cy-8+breathe);
  ctx.lineTo(cx-5, cy-9+breathe);
  ctx.lineTo(cx-5, cy-5+breathe);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx+9, cy-8+breathe);
  ctx.lineTo(cx+5, cy-9+breathe);
  ctx.lineTo(cx+5, cy-5+breathe);
  ctx.closePath();
  ctx.fill();

  // Bras (haut : armure, bas : peau)
  ctx.fillStyle = shade(actor.bodyColor, -0.1);
  ctx.fillRect(cx-9, cy-4+breathe, 2, 5);
  ctx.fillRect(cx+7, cy-4+breathe, 2, 5);
  ctx.fillStyle = actor.skinColor;
  ctx.fillRect(cx-9, cy+1+breathe, 2, 4);
  ctx.fillRect(cx+7, cy+1+breathe, 2, 4);
  // Main droite (tient le bâton)
  ctx.fillRect(cx+7, cy+5+breathe, 3, 2);

  // Bâton
  if(actor.weapon !== 'none'){
    ctx.fillStyle = '#3a2818';
    ctx.fillRect(cx+9, cy-16+breathe, 1.5, 22);
    ctx.fillStyle = '#2a1808';
    ctx.fillRect(cx+9.3, cy-16+breathe, 0.7, 22);
    // Cristal au sommet
    const crystalPulse = Math.sin(time*0.06 + idle) * 0.3 + 0.7;
    ctx.fillStyle = actor.accentColor;
    ctx.beginPath();
    ctx.moveTo(cx+9.5, cy-22+breathe);
    ctx.lineTo(cx+7, cy-18+breathe);
    ctx.lineTo(cx+9.5, cy-14+breathe);
    ctx.lineTo(cx+12, cy-18+breathe);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = `rgba(255,255,255,${crystalPulse})`;
    ctx.beginPath();
    ctx.moveTo(cx+9.5, cy-22+breathe);
    ctx.lineTo(cx+8, cy-19+breathe);
    ctx.lineTo(cx+9.5, cy-16+breathe);
    ctx.closePath();
    ctx.fill();
    // Halo lumineux du cristal
    if(fxLevel >= 1){
      const halo = ctx.createRadialGradient(cx+9.5, cy-18+breathe, 1, cx+9.5, cy-18+breathe, 8);
      halo.addColorStop(0, hexToRgba(actor.glowColor, 0.6 * crystalPulse));
      halo.addColorStop(1, hexToRgba(actor.glowColor, 0));
      ctx.fillStyle = halo;
      ctx.fillRect(cx+1, cy-26+breathe, 18, 18);
    }
  }

  // Tête
  ctx.fillStyle = actor.skinColor;
  ctx.beginPath();
  ctx.ellipse(cx, cy-13+breathe, 4.5, 5, 0, 0, Math.PI*2);
  ctx.fill();
  // Ombrage du visage
  ctx.fillStyle = shade(actor.skinColor, -0.15);
  ctx.beginPath();
  ctx.ellipse(cx+1.5, cy-13+breathe, 2.5, 4.5, 0, 0, Math.PI*2);
  ctx.fill();

  // Cheveux (anime spike)
  ctx.fillStyle = actor.hairColor;
  ctx.beginPath();
  ctx.moveTo(cx-4, cy-14+breathe);
  ctx.lineTo(cx-3, cy-18+breathe);
  ctx.lineTo(cx, cy-17+breathe);
  ctx.lineTo(cx+2, cy-19+breathe);
  ctx.lineTo(cx+4, cy-14+breathe);
  ctx.lineTo(cx+4, cy-12+breathe);
  ctx.lineTo(cx-4, cy-12+breathe);
  ctx.closePath();
  ctx.fill();
  // Highlights cheveux
  ctx.fillStyle = shade(actor.hairColor, 0.4);
  ctx.fillRect(cx-3, cy-17+breathe, 1, 2);
  ctx.fillRect(cx+1, cy-18+breathe, 1, 2);

  // Yeux (anime style : blanc + iris coloré + reflet)
  ctx.fillStyle = '#fff';
  ctx.fillRect(cx-3, cy-13+breathe, 1.5, 1.5);
  ctx.fillRect(cx+1, cy-13+breathe, 1.5, 1.5);
  ctx.fillStyle = actor.accentColor;
  ctx.fillRect(cx-2.5, cy-13+breathe, 1, 1);
  ctx.fillRect(cx+1.5, cy-13+breathe, 1, 1);
  if(fxLevel >= 1){
    ctx.fillStyle = hexToRgba(actor.glowColor, 0.7);
    ctx.fillRect(cx-2.2, cy-13+breathe, 0.5, 0.5);
    ctx.fillRect(cx+1.8, cy-13+breathe, 0.5, 0.5);
  }

  // Bouche
  ctx.fillStyle = shade(actor.skinColor, -0.4);
  ctx.fillRect(cx-1, cy-10+breathe, 2, 1);
}

export default { drawHero, heroConfig };
