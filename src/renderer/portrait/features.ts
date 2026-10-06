import type { Look } from '../../engine/types';
import { CX, ellipse, mix, type FaceGeom, type Shape } from './geom';

export function eyeSize(e: Look['eyes']): [number, number] {
  switch (e) {
    case 'round':
      return [3.6, 3.4];
    case 'narrow':
      return [4.1, 1.9];
    case 'wide':
      return [4.5, 3.6];
    case 'hooded':
      return [4, 2.7];
    default:
      return [4.2, 2.7];
  }
}

/** A brow; `lift` raises the inner end, for worry. */
export function brow(
  kind: Look['brows'],
  x: number,
  y: number,
  side: number,
  hex: string,
  lift = 0,
): Shape {
  const m = (dx: number): number => x + side * dx;
  const w = { thick: 2.8, thin: 0.9, straight: 1.7, soft: 1.5, arched: 1.4, angled: 1.6 }[kind];
  const d =
    kind === 'straight'
      ? `M ${m(-4.5)} ${y - lift + 0.4} L ${m(4.8)} ${y}`
      : kind === 'arched'
        ? `M ${m(-4.5)} ${y - lift + 1.2} Q ${m(0)} ${y - 3} ${m(5)} ${y + 1}`
        : kind === 'angled'
          ? `M ${m(-4.5)} ${y - lift + 1.4} L ${m(2.2)} ${y - 1.4} L ${m(5)} ${y + 0.4}`
          : `M ${m(-4.5)} ${y - lift + 0.9} Q ${m(0)} ${y - 1.6} ${m(5)} ${y + 0.6}`;
  return { layer: 'brows', d, stroke: hex, sw: w };
}

export function nose(kind: Look['nose'], y: number, shade: string): Shape[] {
  const s = { layer: 'nose', stroke: shade, sw: 1.2 };
  switch (kind) {
    case 'button':
      return [
        { ...s, d: `M ${CX - 2.4} ${y} Q ${CX} ${y + 2.6} ${CX + 2.4} ${y}` },
        { layer: 'nose', d: ellipse(CX, y - 1, 1.6, 1.3), fill: shade, opacity: 0.35 },
      ];
    case 'wide':
      return [
        {
          ...s,
          d: `M ${CX - 1} ${y - 8} L ${CX - 1.2} ${y - 2} M ${CX - 4.8} ${y - 0.5} Q ${CX - 3} ${y + 2.2} ${CX} ${y + 1} Q ${CX + 3} ${y + 2.2} ${CX + 4.8} ${y - 0.5}`,
        },
      ];
    case 'long':
      return [
        {
          ...s,
          d: `M ${CX - 0.4} ${y - 10} L ${CX + 1.4} ${y + 0.5} Q ${CX} ${y + 2.2} ${CX - 2.4} ${y + 0.6}`,
        },
      ];
    case 'roman':
      return [
        {
          ...s,
          d: `M ${CX - 0.6} ${y - 9} Q ${CX + 2.6} ${y - 5} ${CX + 1.8} ${y} Q ${CX} ${y + 2} ${CX - 2.6} ${y + 0.4}`,
        },
      ];
    case 'small':
      return [{ ...s, d: `M ${CX - 1.6} ${y} Q ${CX} ${y + 1.5} ${CX + 1.6} ${y}` }];
    default:
      return [
        {
          ...s,
          d: `M ${CX - 0.4} ${y - 8} L ${CX + 0.9} ${y - 1} Q ${CX} ${y + 1.6} ${CX - 2.6} ${y + 0.3}`,
        },
      ];
  }
}

export function mouth(
  kind: Look['mouth'] | 'frown',
  y: number,
  skin: string,
  small: boolean,
): Shape[] {
  const lip = mix(skin, '#a3424a', 0.45);
  const w = small ? 4.2 : 5.5;
  const line = { layer: 'mouth', stroke: mix(skin, '#5a1f22', 0.6), sw: 1.3 };
  switch (kind) {
    case 'grin':
      return [
        {
          layer: 'mouth',
          d: `M ${CX - w - 0.5} ${y - 1} Q ${CX} ${y + 6} ${CX + w + 0.5} ${y - 1} Z`,
          fill: '#5e2326',
        },
        {
          layer: 'mouth',
          d: `M ${CX - w + 0.5} ${y - 0.6} L ${CX + w - 0.5} ${y - 0.6} L ${CX + w - 1.6} ${y + 1.2} L ${CX - w + 1.6} ${y + 1.2} Z`,
          fill: '#ffffff',
        },
      ];
    case 'frown':
      return [
        {
          ...line,
          d: `M ${CX - w + 0.5} ${y + 1.6} Q ${CX} ${y - 2.4} ${CX + w - 0.5} ${y + 1.6}`,
        },
      ];
    case 'neutral':
      return [{ ...line, d: `M ${CX - w + 1} ${y} Q ${CX} ${y + 0.8} ${CX + w - 1} ${y}` }];
    case 'smirk':
      return [
        { ...line, d: `M ${CX - w + 1} ${y + 0.6} Q ${CX + 1} ${y + 1.6} ${CX + w} ${y - 1.6}` },
      ];
    case 'full':
      return [
        {
          layer: 'mouth',
          d: `M ${CX - w} ${y} Q ${CX - 2.5} ${y - 2.8} ${CX} ${y - 1.4} Q ${CX + 2.5} ${y - 2.8} ${CX + w} ${y} Z`,
          fill: lip,
        },
        {
          layer: 'mouth',
          d: `M ${CX - w} ${y} Q ${CX} ${y + 4.4} ${CX + w} ${y} Z`,
          fill: mix(lip, '#ffffff', 0.12),
        },
        { ...line, d: `M ${CX - w} ${y} Q ${CX} ${y + 0.9} ${CX + w} ${y}`, sw: 0.8 },
      ];
    default:
      return [{ ...line, d: `M ${CX - w} ${y - 0.6} Q ${CX} ${y + 4} ${CX + w} ${y - 0.6}` }];
  }
}

export function stubblePath(g: FaceGeom): string {
  return `M ${CX - g.w + 1} ${g.cy + 4} C ${CX - g.w + 2} ${g.bottom - 2} ${CX - 8} ${g.bottom + 1} ${CX} ${g.bottom + 1} C ${CX + 8} ${g.bottom + 1} ${CX + g.w - 2} ${g.bottom - 2} ${CX + g.w - 1} ${g.cy + 4} L ${CX + g.w - 4} ${g.cy + 6} Q ${CX + 7} ${g.noseY + 1} ${CX} ${g.noseY + 2} Q ${CX - 7} ${g.noseY + 1} ${CX - g.w + 4} ${g.cy + 6} Z`;
}

export function facialHair(look: Look, g: FaceGeom, hair: string): Shape[] {
  const my = g.mouthY;
  const tache = `M ${CX - 7} ${my - 1} Q ${CX - 6} ${my - 5} ${CX} ${my - 3.6} Q ${CX + 6} ${my - 5} ${CX + 7} ${my - 1} Q ${CX + 3} ${my - 2.4} ${CX} ${my - 2} Q ${CX - 3} ${my - 2.4} ${CX - 7} ${my - 1} Z`;
  const chin = `M ${CX - 4.5} ${my + 3} Q ${CX} ${my + 2} ${CX + 4.5} ${my + 3} L ${CX + 3.5} ${g.bottom + 1.5} Q ${CX} ${g.bottom + 3} ${CX - 3.5} ${g.bottom + 1.5} Z`;
  const full = (drop: number): string =>
    `M ${CX - g.w + 0.5} ${g.cy} C ${CX - g.w + 1} ${g.bottom + drop * 0.4} ${CX - 10} ${g.bottom + drop} ${CX} ${g.bottom + drop} C ${CX + 10} ${g.bottom + drop} ${CX + g.w - 1} ${g.bottom + drop * 0.4} ${CX + g.w - 0.5} ${g.cy} L ${CX + g.w - 3} ${g.cy + 2} Q ${CX + g.w - 5} ${my + 1} ${CX + 6} ${my + 2.4} Q ${CX} ${my + 4.5} ${CX - 6} ${my + 2.4} Q ${CX - g.w + 5} ${my + 1} ${CX - g.w + 3} ${g.cy + 2} Z`;
  switch (look.facialHair) {
    case 'stubble':
      return [{ layer: 'facialHair', d: stubblePath(g), fill: hair, opacity: 0.22 }];
    case 'moustache':
      return [{ layer: 'facialHair', d: tache, fill: hair }];
    case 'goatee':
      return [
        { layer: 'facialHair', d: tache, fill: hair },
        { layer: 'facialHair', d: chin, fill: hair },
      ];
    case 'beard':
      return [
        { layer: 'facialHair', d: full(4), fill: hair },
        { layer: 'facialHair', d: tache, fill: hair },
      ];
    case 'longbeard':
      return [
        { layer: 'facialHair', d: full(16), fill: hair },
        { layer: 'facialHair', d: tache, fill: hair },
      ];
    default:
      return [];
  }
}

export function glasses(kind: Look['glasses'], y: number, ex: number): Shape[] {
  const frame = { layer: 'glasses', stroke: '#26221f', sw: 1.2 };
  const lens = (x: number): string => {
    switch (kind) {
      case 'square':
        return `M ${x - 5.6} ${y - 4} L ${x + 5.6} ${y - 4} L ${x + 5.2} ${y + 3.6} L ${x - 5.2} ${y + 3.6} Z`;
      case 'cateye':
        return `M ${x - 5.6} ${y - 2.4} Q ${x - 1} ${y - 5} ${x + 6.4} ${y - 5.2} Q ${x + 5.4} ${y + 4} ${x} ${y + 3.6} Q ${x - 5} ${y + 3} ${x - 5.6} ${y - 2.4} Z`;
      default:
        return ellipse(x, y, 5.2, 4.8);
    }
  };
  const out: Shape[] = [];
  for (const side of [-1, 1]) {
    const x = CX + side * ex;
    const d = kind === 'cateye' && side < 0 ? mirror(lens(CX + ex), CX) : lens(x);
    if (kind === 'sunglasses')
      out.push({
        layer: 'glasses',
        d: `M ${x - 5.8} ${y - 3.4} L ${x + 5.8} ${y - 3.4} Q ${x + 5.6} ${y + 4.6} ${x} ${y + 4.4} Q ${x - 5.6} ${y + 4.6} ${x - 5.8} ${y - 3.4} Z`,
        fill: '#1b1d22',
        opacity: 0.92,
      });
    else out.push({ ...frame, d, fill: '#ffffff', opacity: 1, fillOpacity: 0.12 });
  }
  out.push({
    ...frame,
    d: `M ${CX - ex + 5.2} ${y - 1} Q ${CX} ${y - 3} ${CX + ex - 5.2} ${y - 1}`,
  });
  return out;
}

/** Mirror a path's x coordinates around cx (paths here use only absolute M/L/Q/C/Z and arcs). */
function mirror(d: string, cx: number): string {
  const tokens = d.split(' ');
  let xNext = true;
  return tokens
    .map((t) => {
      if (/^[A-Za-z]$/.test(t)) {
        xNext = true;
        return t;
      }
      const n = Number(t);
      if (Number.isNaN(n)) return t;
      const out = xNext ? String(2 * cx - n) : t;
      xNext = !xNext;
      return out;
    })
    .join(' ');
}

export function topDetail(kind: Look['top'], sy: number, color: string, skin: string): Shape[] {
  const dark = mix(color, '#000000', 0.25);
  switch (kind) {
    case 'vneck':
      return [
        { layer: 'top', d: `M ${CX - 8} ${sy} L ${CX} ${sy + 11} L ${CX + 8} ${sy} Z`, fill: skin },
      ];
    case 'shirt':
      return [
        {
          layer: 'top',
          d: `M ${CX - 7} ${sy + 2} L ${CX} ${sy + 9} L ${CX + 7} ${sy + 2} Z`,
          fill: skin,
        },
        {
          layer: 'top',
          d: `M ${CX - 9} ${sy - 1} L ${CX - 1} ${sy + 9} L ${CX - 6} ${sy + 11} L ${CX - 11} ${sy + 2} Z`,
          fill: '#f4f2ec',
        },
        {
          layer: 'top',
          d: `M ${CX + 9} ${sy - 1} L ${CX + 1} ${sy + 9} L ${CX + 6} ${sy + 11} L ${CX + 11} ${sy + 2} Z`,
          fill: '#f4f2ec',
        },
        { layer: 'top', d: `M ${CX} ${sy + 10} L ${CX} 122`, stroke: dark, sw: 0.8 },
      ];
    case 'hoodie':
      return [
        {
          layer: 'top',
          d: `M ${CX - 15} ${sy + 2} Q ${CX} ${sy + 16} ${CX + 15} ${sy + 2} Q ${CX} ${sy + 8} ${CX - 15} ${sy + 2} Z`,
          fill: dark,
        },
        {
          layer: 'top',
          d: `M ${CX - 4} ${sy + 9} L ${CX - 4.6} ${sy + 20} M ${CX + 4} ${sy + 9} L ${CX + 4.6} ${sy + 20}`,
          stroke: '#f4f2ec',
          sw: 1,
        },
      ];
    case 'sweater':
      return [
        {
          layer: 'top',
          d: `M ${CX - 8.5} ${sy + 0.5} Q ${CX} ${sy + 8} ${CX + 8.5} ${sy + 0.5}`,
          stroke: dark,
          sw: 3,
        },
      ];
    default:
      return [
        {
          layer: 'top',
          d: `M ${CX - 7.5} ${sy} Q ${CX} ${sy + 6} ${CX + 7.5} ${sy} Z`,
          fill: skin,
        },
      ];
  }
}
