import { memo, useId } from 'react';
import { ellipse, mix, type Shape } from './geom';

/** Coat colours per animal; a pet's id picks one, so each pet keeps its own. */
const COATS: Record<string, string[]> = {
  dog: ['#c8924f', '#2b2421', '#efe3cf', '#8a5a3b', '#d9b25f', '#6f6f6f'],
  cat: ['#e08a3a', '#2a2a2e', '#9a9a9a', '#f1ebe2', '#7a5a3a', '#d8c2a0'],
  rabbit: ['#f2ede6', '#a58a6c', '#6b6b6b', '#d9c3a5'],
  hamster: ['#e3b27a', '#f3e6d4', '#c78a4e', '#9a7a5a'],
  parrot: ['#3e9f62', '#3d6fd8', '#e0563a', '#e0b43a'],
  fish: ['#f08a2a', '#f2c84b', '#e8603e', '#f5f0e6'],
  tortoise: ['#7a8a4a', '#8a6a3a', '#5f6e3c'],
  horse: ['#8a5a3b', '#2b2421', '#c8a070', '#efe3cf', '#6b4429'],
};

export function coatOf(kind: string, id: number): string {
  const list = COATS[kind] ?? ['#999999'];
  let h = Math.imul(id + 7, 2654435761) >>> 0;
  h = Math.imul(h ^ (h >>> 15), 2246822519) >>> 0;
  h = (h ^ (h >>> 13)) >>> 0;
  return list[h % list.length] ?? '#999999';
}

const EYE = '#1d1715';

/** Shapes for one animal, in the same 120-unit box and frame as people's portraits. */
export function petShapes(kind: string, coat: string): Shape[] {
  const dark = mix(coat, '#000000', 0.3);
  const light = mix(coat, '#ffffff', 0.45);
  const eyes = (y: number, dx: number, r = 2.8): Shape[] =>
    [-1, 1].flatMap((s) => [
      { layer: 'eyes', d: ellipse(60 + s * dx, y, r, r), fill: EYE },
      { layer: 'eyes', d: ellipse(60 + s * dx + 0.9, y - 1, r * 0.35, r * 0.35), fill: '#ffffff' },
    ]);
  switch (kind) {
    case 'dog':
      return [
        { layer: 'ears', d: 'M 34 40 Q 26 62 34 80 Q 42 76 44 56 Z', fill: dark },
        { layer: 'ears', d: 'M 86 40 Q 94 62 86 80 Q 78 76 76 56 Z', fill: dark },
        { layer: 'head', d: ellipse(60, 56, 24, 25), fill: coat },
        { layer: 'snout', d: ellipse(60, 70, 13, 10), fill: light },
        ...eyes(52, 9),
        { layer: 'nose', d: ellipse(60, 65, 4.5, 3.4), fill: EYE },
        { layer: 'mouth', d: 'M 54 73 Q 60 78 66 73', stroke: EYE, sw: 1.4 },
        { layer: 'tongue', d: 'M 57 75 Q 60 83 63 75 Z', fill: '#e8737f' },
        { layer: 'body', d: 'M 26 122 C 26 96 40 88 60 88 C 80 88 94 96 94 122 Z', fill: coat },
      ];
    case 'cat':
      return [
        { layer: 'body', d: 'M 28 122 C 28 98 42 90 60 90 C 78 90 92 98 92 122 Z', fill: coat },
        { layer: 'ears', d: 'M 38 46 L 40 22 L 56 36 Z', fill: coat },
        { layer: 'ears', d: 'M 82 46 L 80 22 L 64 36 Z', fill: coat },
        { layer: 'ears', d: 'M 41 41 L 42 28 L 51 36 Z', fill: '#f2b4bd' },
        { layer: 'ears', d: 'M 79 41 L 78 28 L 69 36 Z', fill: '#f2b4bd' },
        { layer: 'head', d: ellipse(60, 58, 25, 22), fill: coat },
        { layer: 'eyes', d: 'M 45 55 Q 51 49 57 55 Q 51 60 45 55 Z', fill: '#b9c84a' },
        { layer: 'eyes', d: 'M 63 55 Q 69 49 75 55 Q 69 60 63 55 Z', fill: '#b9c84a' },
        { layer: 'eyes', d: ellipse(51, 55, 1.2, 3.2), fill: EYE },
        { layer: 'eyes', d: ellipse(69, 55, 1.2, 3.2), fill: EYE },
        { layer: 'nose', d: 'M 57 64 L 63 64 L 60 67 Z', fill: '#e8737f' },
        { layer: 'mouth', d: 'M 60 67 Q 57 71 54 69 M 60 67 Q 63 71 66 69', stroke: EYE, sw: 1.1 },
        {
          layer: 'whiskers',
          d: 'M 50 66 L 34 63 M 50 68 L 34 70 M 70 66 L 86 63 M 70 68 L 86 70',
          stroke: dark,
          sw: 0.8,
        },
      ];
    case 'rabbit':
      return [
        { layer: 'body', d: 'M 30 122 C 30 98 42 90 60 90 C 78 90 90 98 90 122 Z', fill: coat },
        { layer: 'ears', d: ellipse(48, 24, 7, 20), fill: coat },
        { layer: 'ears', d: ellipse(72, 24, 7, 20), fill: coat },
        { layer: 'ears', d: ellipse(48, 25, 3.5, 15), fill: '#f2b4bd' },
        { layer: 'ears', d: ellipse(72, 25, 3.5, 15), fill: '#f2b4bd' },
        { layer: 'head', d: ellipse(60, 62, 22, 21), fill: coat },
        ...eyes(58, 9, 3),
        { layer: 'nose', d: ellipse(60, 67, 3, 2.2), fill: '#e8737f' },
        {
          layer: 'teeth',
          d: 'M 57.5 71 L 62.5 71 L 62.5 76 L 57.5 76 Z',
          fill: '#ffffff',
          stroke: dark,
          sw: 0.5,
        },
      ];
    case 'hamster':
      return [
        { layer: 'body', d: ellipse(60, 100, 38, 26), fill: coat },
        { layer: 'ears', d: ellipse(40, 40, 7, 7), fill: dark },
        { layer: 'ears', d: ellipse(80, 40, 7, 7), fill: dark },
        { layer: 'head', d: ellipse(60, 62, 30, 26), fill: coat },
        { layer: 'cheeks', d: ellipse(42, 70, 10, 8), fill: light },
        { layer: 'cheeks', d: ellipse(78, 70, 10, 8), fill: light },
        ...eyes(58, 11, 3),
        { layer: 'nose', d: ellipse(60, 66, 2.6, 2), fill: '#e8737f' },
      ];
    case 'parrot':
      return [
        { layer: 'crest', d: 'M 56 30 Q 52 14 62 18 Q 60 24 66 22 Q 64 30 62 34 Z', fill: dark },
        { layer: 'body', d: 'M 32 122 C 32 96 44 86 60 86 C 76 86 88 96 88 122 Z', fill: coat },
        { layer: 'head', d: ellipse(60, 56, 22, 24), fill: coat },
        { layer: 'face', d: ellipse(66, 56, 10, 11), fill: '#f6f2ea' },
        { layer: 'eyes', d: ellipse(66, 52, 3, 3), fill: EYE },
        {
          layer: 'beak',
          d: 'M 70 60 Q 86 60 80 76 Q 76 68 70 68 Z',
          fill: '#e0b43a',
          stroke: '#8a6a1a',
          sw: 0.6,
        },
        { layer: 'wing', d: 'M 34 104 Q 44 90 58 100 Q 46 112 34 120 Z', fill: dark },
      ];
    case 'fish':
      return [
        { layer: 'water', d: ellipse(60, 57, 46, 46), fill: '#bfe3f2', opacity: 0.5 },
        { layer: 'tail', d: 'M 82 57 L 100 42 L 98 57 L 100 72 Z', fill: dark },
        { layer: 'body', d: ellipse(58, 57, 26, 17), fill: coat },
        { layer: 'fin', d: 'M 52 42 Q 60 30 68 41 Z', fill: dark },
        { layer: 'eyes', d: ellipse(44, 54, 3.6, 3.6), fill: '#ffffff' },
        { layer: 'eyes', d: ellipse(44, 54, 2, 2), fill: EYE },
        { layer: 'mouth', d: 'M 33 60 Q 36 62 38 60', stroke: dark, sw: 1.2 },
        {
          layer: 'bubbles',
          d: `${ellipse(26, 40, 2.5, 2.5)} ${ellipse(22, 30, 1.8, 1.8)}`,
          stroke: '#ffffff',
          sw: 1,
        },
      ];
    case 'tortoise':
      return [
        { layer: 'legs', d: `${ellipse(36, 94, 7, 6)} ${ellipse(84, 94, 7, 6)}`, fill: '#9aa86a' },
        { layer: 'shell', d: 'M 24 92 C 24 56 96 56 96 92 Z', fill: coat, stroke: dark, sw: 1 },
        {
          layer: 'pattern',
          d: 'M 44 70 L 52 62 L 68 62 L 76 70 L 68 80 L 52 80 Z M 36 86 L 44 70 M 84 86 L 76 70 M 60 92 L 60 80',
          stroke: dark,
          sw: 1.2,
        },
        { layer: 'head', d: ellipse(60, 46, 12, 11), fill: '#9aa86a' },
        ...eyes(44, 5, 1.8),
        { layer: 'mouth', d: 'M 55 51 Q 60 54 65 51', stroke: EYE, sw: 1 },
      ];
    case 'horse':
      return [
        {
          layer: 'neck',
          d: 'M 34 122 C 34 96 42 80 54 74 L 78 78 C 86 96 88 110 88 122 Z',
          fill: coat,
        },
        { layer: 'mane', d: 'M 46 26 Q 34 50 38 82 L 48 80 Q 44 52 56 30 Z', fill: dark },
        { layer: 'ears', d: 'M 48 30 L 50 12 L 58 27 Z M 70 27 L 76 12 L 77 30 Z', fill: coat },
        {
          layer: 'head',
          d: 'M 46 30 C 40 46 42 70 50 84 C 56 93 72 93 76 84 C 84 66 82 44 76 30 Q 62 22 46 30 Z',
          fill: coat,
        },
        { layer: 'blaze', d: 'M 61 34 Q 66 52 63 72 Q 57 52 61 34 Z', fill: '#f6f2ea' },
        { layer: 'muzzle', d: ellipse(62, 82, 13, 8), fill: mix(coat, '#000000', 0.15) },
        ...eyes(48, 12, 2.8),
        {
          layer: 'nostrils',
          d: `${ellipse(56, 83, 2, 1.6)} ${ellipse(68, 83, 2, 1.6)}`,
          fill: dark,
        },
      ];
    default:
      return [{ layer: 'head', d: ellipse(60, 57, 24, 24), fill: coat }];
  }
}

/** A drawn animal in a round frame. */
export const PetPortrait = memo(function PetPortrait({
  kind,
  id,
  size = 40,
  gone = false,
  testId,
}: {
  kind: string;
  id: number;
  size?: number;
  gone?: boolean;
  testId?: string;
}): React.JSX.Element {
  const clip = `pp${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  return (
    <svg
      className={`portrait pet-portrait${gone ? ' dead' : ''}`}
      viewBox="14 11 92 92"
      width={size}
      height={size}
      aria-hidden="true"
      data-testid={testId}
      data-kind={kind}
    >
      <defs>
        <clipPath id={clip}>
          <circle cx="60" cy="57" r="46" />
        </clipPath>
      </defs>
      <circle className="portrait-bg" cx="60" cy="57" r="46" />
      <g clipPath={`url(#${clip})`}>
        {petShapes(kind, coatOf(kind, id)).map((s, i) => (
          <path
            key={i}
            d={s.d}
            fill={s.fill ?? 'none'}
            stroke={s.stroke}
            strokeWidth={s.sw}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={s.opacity}
          />
        ))}
      </g>
    </svg>
  );
});
