import { EYE_COLORS, HAIR_COLORS, SKIN_COLORS, TOP_COLORS } from '../../engine/look';
import type { Gender, Look } from '../../engine/types';
import { hairShapes } from './hair';
import { CX, ellipse, faceGeom, mix, type Shape } from './geom';
import {
  brow,
  eyeSize,
  facialHair,
  glasses,
  mouth,
  nose,
  stubblePath,
  topDetail,
} from './features';

export type { Shape } from './geom';

/** The visible frame: head and shoulders, cropped from the 120-unit drawing box. */
export const FRAME = { viewBox: '14 11 92 92', cx: 60, cy: 57, r: 46 };

/** Life stage for drawing: babies and children are drawn differently from adults. */
export function stageOf(age: number): 'baby' | 'child' | 'teen' | 'adult' | 'senior' {
  if (age <= 2) return 'baby';
  if (age <= 11) return 'child';
  if (age <= 17) return 'teen';
  if (age < 65) return 'adult';
  return 'senior';
}

/** Natural hair greys from the mid-forties; dyed and fantasy colours stay put. */
export function hairHex(look: Look, age: number): string {
  const c = HAIR_COLORS.find((h) => h.id === look.hairColor) ?? HAIR_COLORS[1];
  if (!c) return '#3b2619';
  if (!c.natural || age < 45) return c.hex;
  const t = Math.min(0.9, (age - 45) / 32);
  return mix(c.hex, '#d4d4d2', t);
}

const LINE = '#3a2a22';

/**
 * Every shape in a portrait, back to front. Pure: the same look and age always draw the same
 * picture, so the React component only maps these to SVG paths.
 */
export function portraitShapes(look: Look, age: number, gender: Gender): Shape[] {
  const stage = stageOf(age);
  const small = stage === 'baby' || stage === 'child';
  const skin = SKIN_COLORS[look.skin] ?? SKIN_COLORS[2];
  const skinHex = skin?.hex ?? '#e2b48d';
  const shade = skin?.shade ?? '#cc966d';
  const hair = hairHex(look, age);
  const g = faceGeom(stage === 'baby' ? 'round' : look.face, stage);
  const out: Shape[] = [];
  const add = (layer: string, d: string, s: Omit<Shape, 'layer' | 'd'> = {}): void => {
    out.push({ layer, d, ...s });
  };

  // Hair that falls behind the head and shoulders.
  for (const h of hairShapes(look, stage, g, hair).back) out.push(h);

  // Shoulders and top.
  const top = TOP_COLORS[look.topColor] ?? TOP_COLORS[0] ?? '#3b6db3';
  const sw = small ? 30 : 38;
  const sy = small ? 92 : 88;
  add(
    'neck',
    `M ${CX - 7} ${g.bottom - 6} L ${CX - 7} ${sy + 4} L ${CX + 7} ${sy + 4} L ${CX + 7} ${g.bottom - 6} Z`,
    {
      fill: shade,
    },
  );
  add(
    'body',
    `M ${CX - sw - 4} 122 C ${CX - sw - 4} ${sy + 8} ${CX - sw + 8} ${sy} ${CX} ${sy} C ${CX + sw - 8} ${sy} ${CX + sw + 4} ${sy + 8} ${CX + sw + 4} 122 Z`,
    { fill: stage === 'baby' ? mix(top, '#ffffff', 0.45) : top },
  );
  out.push(...topDetail(stage === 'baby' ? 'tee' : look.top, sy, top, skinHex));

  // Ears, then the face.
  add('ears', ellipse(CX - g.w + 0.5, g.cy + 3, 3.6, 5.5), { fill: shade });
  add('ears', ellipse(CX + g.w - 0.5, g.cy + 3, 3.6, 5.5), { fill: shade });
  add('face', g.path, { fill: skinHex });
  const ey = g.eyeY;
  const ex = small ? 8.5 : 9;
  const eyeScale = stage === 'baby' ? 1.25 : stage === 'child' ? 1.15 : 1;

  // Cheeks: freckles, and a blush on the very young.
  if (look.freckles && stage !== 'baby') {
    for (const side of [-1, 1])
      for (const [dx, dy] of [
        [10, 7],
        [13, 9],
        [8, 10],
        [12, 12],
        [15, 6.5],
      ] as const)
        add('freckles', ellipse(CX + side * dx, ey + dy, 0.6, 0.6), {
          fill: mix(shade, '#5a3020', 0.4),
          opacity: 0.7,
        });
  }
  if (small)
    for (const side of [-1, 1])
      add('blush', ellipse(CX + side * 12, ey + 9, 3.6, 2.2), { fill: '#f08a8a', opacity: 0.25 });

  // Lines that come with age.
  if (age >= 50) {
    const o = Math.min(0.55, 0.2 + (age - 50) / 60);
    add('lines', `M ${CX - 7} ${g.top + 10} Q ${CX} ${g.top + 8.5} ${CX + 7} ${g.top + 10}`, {
      stroke: shade,
      sw: 0.8,
      opacity: o,
    });
    for (const side of [-1, 1])
      add(
        'lines',
        `M ${CX + side * (ex + 5.5)} ${ey - 1} l ${side * 2} -1 M ${CX + side * (ex + 5.5)} ${ey + 1} l ${side * 2} 1`,
        {
          stroke: shade,
          sw: 0.7,
          opacity: o,
        },
      );
  }
  if (age >= 62) {
    for (const side of [-1, 1])
      add(
        'lines',
        `M ${CX + side * 6} ${g.noseY + 2} Q ${CX + side * 9} ${g.mouthY} ${CX + side * 8} ${g.mouthY + 4}`,
        {
          stroke: shade,
          sw: 0.9,
          opacity: 0.5,
        },
      );
  }

  // Facial hair sits under the mouth and nose so they stay readable.
  if (!small && stage !== 'teen') out.push(...facialHair(look, g, hair));
  else if (stage === 'teen' && gender === 'male' && look.facialHair !== 'none' && age >= 16)
    add('facialHair', stubblePath(g), { fill: hair, opacity: 0.18 });

  // Eyes.
  const eyeHex = EYE_COLORS.find((e) => e.id === look.eyeColor)?.hex ?? '#5b3a1f';
  const [rx, ry] = eyeSize(look.eyes);
  for (const side of [-1, 1]) {
    const x = CX + side * ex;
    const erx = rx * eyeScale;
    const ery = ry * eyeScale;
    add('eyes', ellipse(x, ey, erx, ery), { fill: '#fbfbf8' });
    const ir = Math.min(2.4 * eyeScale, ery + 0.2);
    add('eyes', ellipse(x, ey + 0.2, ir, Math.min(ir, ery)), { fill: eyeHex });
    add('eyes', ellipse(x, ey + 0.2, ir * 0.45, Math.min(ir, ery) * 0.45), { fill: '#141110' });
    add('eyes', ellipse(x + 0.8, ey - 0.7, 0.55, 0.55), { fill: '#ffffff' });
    if (look.eyes === 'hooded' || age >= 60)
      add(
        'lids',
        `M ${x - erx - 0.4} ${ey} Q ${x} ${ey - ery * 2} ${x + erx + 0.4} ${ey} Q ${x} ${ey - ery * 0.6} ${x - erx - 0.4} ${ey} Z`,
        {
          fill: shade,
        },
      );
    add('eyes', `M ${x - erx} ${ey} Q ${x} ${ey - ery * 1.25} ${x + erx} ${ey}`, {
      stroke: LINE,
      sw: 0.9,
    });
  }

  // Brows.
  const browHex = mix(hair, '#2a1d15', 0.25);
  for (const side of [-1, 1])
    out.push(brow(look.brows, CX + side * ex, ey - 6.5 * eyeScale, side, browHex));

  // Nose and mouth.
  if (stage === 'baby')
    add('nose', `M ${CX - 1.6} ${g.noseY} Q ${CX} ${g.noseY + 1.6} ${CX + 1.6} ${g.noseY}`, {
      stroke: shade,
      sw: 1.1,
    });
  else out.push(...nose(look.nose, g.noseY, shade));
  out.push(...mouth(stage === 'baby' ? 'smile' : look.mouth, g.mouthY, skinHex, small));

  // Hair over the forehead, then glasses on top of everything.
  for (const h of hairShapes(look, stage, g, hair).front) out.push(h);
  if (look.glasses !== 'none' && stage !== 'baby' && age >= 6)
    out.push(...glasses(look.glasses, ey, ex));
  return out;
}
