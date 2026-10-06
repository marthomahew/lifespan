import type { FaceShape } from '../../engine/types';

/** One drawn shape. Coordinates are in a 120×120 box. */
export type Shape = {
  layer: string;
  d: string;
  fill?: string;
  stroke?: string;
  sw?: number;
  opacity?: number;
  fillOpacity?: number;
  /** Fill with a hole (a scarf around the face). */
  evenOdd?: boolean;
};

export const CX = 60;

export function ellipse(cx: number, cy: number, rx: number, ry: number): string {
  return `M ${cx - rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx + rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx - rx} ${cy} Z`;
}

/** Blend two #rrggbb colours; t = 0 gives a, t = 1 gives b. */
export function mix(a: string, b: string, t: number): string {
  const p = (h: string, i: number): number => parseInt(h.slice(1 + i * 2, 3 + i * 2), 16);
  const c = [0, 1, 2].map((i) => Math.round(p(a, i) + (p(b, i) - p(a, i)) * t));
  return `#${c.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

export type FaceGeom = {
  path: string;
  /** Half-width and half-height of the head. */
  w: number;
  h: number;
  cy: number;
  top: number;
  bottom: number;
  eyeY: number;
  noseY: number;
  mouthY: number;
};

// Half-width, half-height, how far down the cheeks stay wide, and how wide the chin is.
const SHAPES: Record<FaceShape, [number, number, number, number]> = {
  oval: [20.5, 26, 0.55, 0.5],
  round: [22.5, 24.5, 0.72, 0.68],
  square: [21.5, 25, 0.88, 0.78],
  long: [19, 28, 0.6, 0.48],
  heart: [22.5, 26, 0.3, 0.26],
};

export function faceGeom(face: FaceShape, stage: string): FaceGeom {
  const [bw, bh, jaw, chin] = SHAPES[face];
  const baby = stage === 'baby';
  const child = stage === 'child';
  const w = baby ? 24 : child ? bw + 1 : bw;
  const h = baby ? 23 : child ? bh - 1.5 : bh;
  const cy = baby ? 60 : child ? 56 : 52;
  const top = cy - h;
  const bottom = cy + h;
  const path = [
    `M ${CX - w} ${cy}`,
    `C ${CX - w} ${cy - h * 0.78} ${CX - w * 0.58} ${top} ${CX} ${top}`,
    `C ${CX + w * 0.58} ${top} ${CX + w} ${cy - h * 0.78} ${CX + w} ${cy}`,
    `C ${CX + w} ${cy + h * jaw} ${CX + w * chin} ${bottom} ${CX} ${bottom}`,
    `C ${CX - w * chin} ${bottom} ${CX - w} ${cy + h * jaw} ${CX - w} ${cy}`,
    'Z',
  ].join(' ');
  const young = baby || child;
  return {
    path,
    w,
    h,
    cy,
    top,
    bottom,
    eyeY: young ? cy + 3 : cy - 1,
    noseY: young ? cy + h * 0.4 : cy + h * 0.34,
    mouthY: young ? cy + h * 0.64 : cy + h * 0.6,
  };
}
