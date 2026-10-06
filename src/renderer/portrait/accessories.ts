import type { Look } from '../../engine/types';
import { CX, ellipse, mix, type FaceGeom, type Shape } from './geom';

const GOLD = '#d9b25f';

/** Earrings hang from the lobes, drawn over hair so they show. */
export function earrings(kind: Look['earrings'], g: FaceGeom): Shape[] {
  const out: Shape[] = [];
  for (const side of [-1, 1]) {
    const x = CX + side * (g.w + 0.6);
    const y = g.cy + 8.6;
    if (kind === 'studs') out.push({ layer: 'earrings', d: ellipse(x, y, 1.6, 1.6), fill: GOLD });
    if (kind === 'hoops')
      out.push({ layer: 'earrings', d: ellipse(x, y + 2.4, 2.4, 2.6), stroke: GOLD, sw: 0.9 });
    if (kind === 'gems') {
      out.push({
        layer: 'earrings',
        d: `M ${x} ${y - 1.8} L ${x + 1.6} ${y} L ${x} ${y + 1.8} L ${x - 1.6} ${y} Z`,
        fill: '#c2457a',
      });
      out.push({
        layer: 'earrings',
        d: ellipse(x - 0.4, y - 0.5, 0.45, 0.45),
        fill: '#ffffff',
        opacity: 0.8,
      });
    }
    if (kind === 'drops') {
      out.push({ layer: 'earrings', d: `M ${x} ${y} L ${x} ${y + 2.6}`, stroke: GOLD, sw: 0.6 });
      out.push({
        layer: 'earrings',
        d: `M ${x} ${y + 2.4} Q ${x + 1.8} ${y + 4.8} ${x} ${y + 6} Q ${x - 1.8} ${y + 4.8} ${x} ${y + 2.4} Z`,
        fill: '#5aa3c9',
      });
    }
  }
  return out;
}

/** Cuts that would poke through a hat are tucked under it. */
export function hatHides(hat: Look['hat'], hair: Look['hair']): Look['hair'] {
  if (hat === 'none') return hair;
  if (hat === 'headscarf') return 'bald';
  return hair === 'mohawk' || hair === 'quiff' || hair === 'bun' ? 'short' : hair;
}

/** Headwear in front of the hair; a headscarf also drapes behind. */
export function headwear(
  look: Look,
  g: FaceGeom,
  color: string,
): { back: Shape[]; front: Shape[] } {
  const L = CX - g.w;
  const R = CX + g.w;
  const t = g.top - (look.hair === 'afro' ? 8 : 3);
  const dark = mix(color, '#000000', 0.3);
  const dome = (lift: number, band: number): string =>
    `M ${L - 2.5} ${band} C ${L - 3} ${t - lift + 4} ${CX - g.w * 0.6} ${t - lift} ${CX} ${t - lift} C ${CX + g.w * 0.6} ${t - lift} ${R + 3} ${t - lift + 4} ${R + 2.5} ${band} Z`;
  const back: Shape[] = [];
  const front: Shape[] = [];
  const band = g.top + 11;
  switch (look.hat) {
    case 'beanie':
      front.push({ layer: 'hat', d: dome(3, band), fill: color, stroke: dark, sw: 0.6 });
      front.push({
        layer: 'hat',
        d: `M ${L - 3} ${band - 4.5} Q ${CX} ${band - 7.5} ${R + 3} ${band - 4.5} L ${R + 3} ${band + 0.5} Q ${CX} ${band - 2.5} ${L - 3} ${band + 0.5} Z`,
        fill: dark,
      });
      front.push({
        layer: 'hat',
        d: ellipse(CX, t - 5, 4, 3.6),
        fill: mix(color, '#ffffff', 0.35),
      });
      break;
    case 'cap':
      front.push({ layer: 'hat', d: dome(1.5, band - 1), fill: color, stroke: dark, sw: 0.6 });
      front.push({
        layer: 'hat',
        d: `M ${L - 1.5} ${band - 2} Q ${CX} ${band - 5} ${R + 1.5} ${band - 2} Q ${R + 2} ${band + 4.5} ${CX} ${band + 5.5} Q ${L - 2} ${band + 4.5} ${L - 1.5} ${band - 2} Z`,
        fill: dark,
      });
      front.push({ layer: 'hat', d: ellipse(CX, t - 1, 1.4, 1.1), fill: dark });
      break;
    case 'bucket':
      front.push({ layer: 'hat', d: dome(2, band - 1), fill: color, stroke: dark, sw: 0.6 });
      front.push({
        layer: 'hat',
        d: `M ${L - 3} ${band - 2.5} L ${L - 8} ${band + 3.5} Q ${CX} ${band + 7} ${R + 8} ${band + 3.5} L ${R + 3} ${band - 2.5} Q ${CX} ${band - 4} ${L - 3} ${band - 2.5} Z`,
        fill: color,
        stroke: dark,
        sw: 0.6,
      });
      break;
    case 'fedora':
      front.push({
        layer: 'hat',
        d: `M ${L + 1} ${band - 2} C ${L} ${t - 8} ${CX - 6} ${t - 9} ${CX} ${t - 6} C ${CX + 6} ${t - 9} ${R} ${t - 8} ${R - 1} ${band - 2} Z`,
        fill: color,
        stroke: dark,
        sw: 0.6,
      });
      front.push({
        layer: 'hat',
        d: `M ${L + 0.6} ${band - 5.5} L ${R - 0.6} ${band - 5.5} L ${R - 0.9} ${band - 2.5} L ${L + 0.9} ${band - 2.5} Z`,
        fill: dark,
      });
      front.push({
        layer: 'hat',
        d: ellipse(CX, band - 1.5, g.w + 10, 3.2),
        fill: color,
        stroke: dark,
        sw: 0.6,
      });
      break;
    case 'headscarf': {
      const chin = g.bottom + 2;
      back.push({
        layer: 'hat',
        d: `M ${L - 6} ${g.cy} C ${L - 8} ${chin + 10} ${L - 4} ${chin + 18} ${CX} ${chin + 20} C ${R + 4} ${chin + 18} ${R + 8} ${chin + 10} ${R + 6} ${g.cy} Z`,
        fill: dark,
      });
      front.push({
        layer: 'hat',
        d: `M ${L - 6} ${g.cy + 6} C ${L - 7} ${t - 6} ${R + 7} ${t - 6} ${R + 6} ${g.cy + 6} C ${R + 5} ${g.bottom} ${CX + 8} ${chin + 3} ${CX} ${chin + 3} C ${CX - 8} ${chin + 3} ${L - 5} ${g.bottom} ${L - 6} ${g.cy + 6} Z M ${L + 2} ${g.cy + 4} C ${L + 3} ${g.bottom - 4} ${CX - 7} ${chin - 1} ${CX} ${chin - 1} C ${CX + 7} ${chin - 1} ${R - 3} ${g.bottom - 4} ${R - 2} ${g.cy + 4} C ${R - 2} ${g.top + 4} ${L + 2} ${g.top + 4} ${L + 2} ${g.cy + 4} Z`,
        fill: color,
        stroke: dark,
        sw: 0.6,
        evenOdd: true,
      });
      break;
    }
  }
  return { back, front };
}
