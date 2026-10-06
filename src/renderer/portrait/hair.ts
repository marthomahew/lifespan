import type { Look } from '../../engine/types';
import { CX, ellipse, mix, type FaceGeom, type Shape } from './geom';

type CapOpts = { lift?: number; fringe?: number; side?: number; part?: boolean; curtain?: boolean };

/** Hair that hugs the skull, with a fringe line across the forehead and sideburns. */
function cap(g: FaceGeom, o: CapOpts = {}): string {
  const lift = o.lift ?? 3.5;
  const fringe = o.fringe ?? g.top + 12;
  const side = o.side ?? g.cy + 2;
  const L = CX - g.w;
  const R = CX + g.w;
  const t = g.top - lift;
  const outer = [
    `M ${L - 1.5} ${side}`,
    `C ${L - 3} ${g.top + 4} ${CX - g.w * 0.62} ${t} ${CX} ${t}`,
    `C ${CX + g.w * 0.62} ${t} ${R + 3} ${g.top + 4} ${R + 1.5} ${side}`,
    `L ${R - 2} ${side}`,
  ];
  const inner = o.curtain
    ? [
        `C ${R - 2} ${g.cy - 8} ${CX + 7} ${fringe + 2} ${CX} ${fringe}`,
        `C ${CX - 7} ${fringe + 2} ${L + 2} ${g.cy - 8} ${L + 2} ${side}`,
      ]
    : o.part
      ? [
          `C ${R - 1} ${fringe + 2} ${CX + g.w * 0.4} ${fringe - 4} ${CX + 5} ${fringe - 3}`,
          `C ${CX - g.w * 0.3} ${fringe + 6} ${L + 1} ${fringe + 8} ${L + 2} ${side}`,
        ]
      : [
          `C ${R - 1} ${fringe + 4} ${CX + g.w * 0.5} ${fringe} ${CX} ${fringe}`,
          `C ${CX - g.w * 0.5} ${fringe} ${L + 1} ${fringe + 4} ${L + 2} ${side}`,
        ];
  return [...outer, ...inner, 'Z'].join(' ');
}

/** Bumps along an arc around the head, for curls and afros. */
function bumps(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  r: number,
  n: number,
  from = Math.PI,
  to = 2 * Math.PI,
): string[] {
  const out: string[] = [];
  for (let i = 0; i < n; i++) {
    const a = from + ((to - from) * i) / (n - 1);
    out.push(ellipse(cx + rx * Math.cos(a), cy + ry * Math.sin(a), r, r));
  }
  return out;
}

/** The hair behind the head and the hair in front of it, for a cut at a life stage. */
export function hairShapes(
  look: Look,
  stage: string,
  g: FaceGeom,
  hex: string,
): { back: Shape[]; front: Shape[] } {
  const edge = mix(hex, '#000000', 0.28);
  const fill = (layer: string, d: string, extra: Partial<Shape> = {}): Shape => ({
    layer,
    d,
    fill: hex,
    stroke: edge,
    sw: 0.6,
    ...extra,
  });
  const back: Shape[] = [];
  const front: Shape[] = [];
  const L = CX - g.w;
  const R = CX + g.w;

  if (stage === 'baby') {
    if (look.hair !== 'bald')
      front.push({
        layer: 'hair',
        d: `M ${CX - 4} ${g.top + 2} Q ${CX - 1} ${g.top - 6} ${CX + 4} ${g.top - 1} Q ${CX + 1} ${g.top - 2} ${CX + 1} ${g.top + 2}`,
        stroke: hex,
        sw: 2.2,
      });
    return { back, front };
  }

  switch (look.hair) {
    case 'bald':
      front.push({
        layer: 'hair',
        d: ellipse(CX - 6, g.top + 6, 5, 2.6),
        fill: '#ffffff',
        opacity: 0.18,
      });
      break;
    case 'buzz':
      front.push(
        fill('hair', cap(g, { lift: 1, fringe: g.top + 8, side: g.cy - 3 }), {
          opacity: 0.85,
          sw: 0,
        }),
      );
      break;
    case 'short':
      front.push(fill('hair', cap(g)));
      break;
    case 'side':
      front.push(fill('hair', cap(g, { lift: 4.5, part: true, fringe: g.top + 13 })));
      front.push({
        layer: 'hair',
        d: `M ${CX + 5} ${g.top - 3} Q ${CX + 3} ${g.top + 2} ${CX + 5} ${g.top + 7}`,
        stroke: edge,
        sw: 0.8,
      });
      break;
    case 'quiff':
      front.push(fill('hair', cap(g, { lift: 3, fringe: g.top + 9 })));
      front.push(
        fill(
          'hair',
          `M ${CX - 13} ${g.top + 5} Q ${CX - 8} ${g.top - 12} ${CX + 9} ${g.top - 9} Q ${CX + 16} ${g.top - 6} ${CX + 13} ${g.top + 3} Q ${CX} ${g.top - 2} ${CX - 13} ${g.top + 5} Z`,
        ),
      );
      break;
    case 'curly':
      back.push(
        ...bumps(CX, g.cy - 4, g.w + 1.5, g.h - 2, 5.6, 11, Math.PI * 0.92, Math.PI * 2.08).map(
          (d) => fill('hair', d, { sw: 0 }),
        ),
      );
      front.push(fill('hair', cap(g, { lift: 4, fringe: g.top + 9 }), { sw: 0 }));
      front.push(
        ...bumps(CX, g.top + 8, g.w * 0.7, 3, 3.4, 6).map((d) => fill('hair', d, { sw: 0 })),
      );
      break;
    case 'afro':
      back.push(fill('hair', ellipse(CX, g.cy - 7, g.w + 13, g.h + 8)));
      front.push(fill('hair', cap(g, { lift: 2, fringe: g.top + 9, side: g.cy - 2 }), { sw: 0 }));
      break;
    case 'bob':
      back.push(
        fill(
          'hair',
          `M ${L - 6} ${g.cy + 15} L ${L - 6} ${g.cy - 6} C ${L - 6} ${g.top - 9} ${R + 6} ${g.top - 9} ${R + 6} ${g.cy - 6} L ${R + 6} ${g.cy + 15} Q ${CX} ${g.cy + 19} ${L - 6} ${g.cy + 15} Z`,
        ),
      );
      front.push(fill('hair', cap(g, { lift: 4, fringe: g.top + 14, side: g.cy + 14 })));
      break;
    case 'long':
      back.push(
        fill(
          'hair',
          `M ${L - 4} ${g.cy - 4} L ${L - 8} ${g.cy + 40} Q ${CX} ${g.cy + 47} ${R + 8} ${g.cy + 40} L ${R + 4} ${g.cy - 4} C ${R + 4} ${g.top - 8} ${L - 4} ${g.top - 8} ${L - 4} ${g.cy - 4} Z`,
        ),
      );
      front.push(
        fill('hair', cap(g, { lift: 4, fringe: g.top + 6, side: g.cy + 12, curtain: true })),
      );
      break;
    case 'ponytail':
      back.push(
        fill(
          'hair',
          `M ${R - 4} ${g.top + 10} Q ${R + 15} ${g.top + 14} ${R + 11} ${g.cy + 26} Q ${R + 6} ${g.cy + 32} ${R + 3} ${g.cy + 20} Q ${R + 6} ${g.top + 24} ${R - 4} ${g.top + 18} Z`,
        ),
      );
      front.push(fill('hair', cap(g, { lift: 3, fringe: g.top + 8, side: g.cy - 1 })));
      front.push({
        layer: 'hair',
        d: ellipse(R + 1, g.top + 15, 2, 2.6),
        fill: mix(hex, '#e04a6a', 0.6),
      });
      break;
    case 'bun':
      back.push(fill('hair', ellipse(CX, g.top - 4, 8.5, 7.5)));
      front.push(fill('hair', cap(g, { lift: 2.5, fringe: g.top + 8, side: g.cy - 1 })));
      break;
    case 'braids':
      front.push(
        fill('hair', cap(g, { lift: 3, fringe: g.top + 7, side: g.cy + 4, curtain: true })),
      );
      for (const x of [L - 1, R + 1])
        for (let i = 0; i < 7; i++)
          front.push(
            fill(
              'hair',
              ellipse(x + (x < CX ? -i * 0.35 : i * 0.35), g.cy + 6 + i * 5.6, 3.2, 3.4),
            ),
          );
      break;
    case 'mohawk':
      front.push(
        fill('hair', cap(g, { lift: 1, fringe: g.top + 8, side: g.cy - 3 }), {
          opacity: 0.35,
          sw: 0,
        }),
      );
      front.push(
        fill(
          'hair',
          `M ${CX - 4.5} ${g.top + 9} Q ${CX - 6.5} ${g.top - 12} ${CX} ${g.top - 17} Q ${CX + 6.5} ${g.top - 12} ${CX + 4.5} ${g.top + 9} Z`,
        ),
      );
      break;
  }
  // A soft sheen across the crown.
  if (!['bald', 'buzz', 'mohawk', 'curly', 'afro'].includes(look.hair))
    front.push({
      layer: 'hair',
      d: `M ${CX - g.w * 0.55} ${g.top + 1} Q ${CX - g.w * 0.1} ${g.top - 3.5} ${CX + g.w * 0.35} ${g.top - 1.5}`,
      stroke: '#ffffff',
      sw: 1.6,
      opacity: 0.22,
    });
  return { back, front };
}
