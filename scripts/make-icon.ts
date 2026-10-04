/**
 * Draws the app icon (a seedling on a rounded green square) with pure JS and writes
 * build/icon.png and build/icon.icns (PNG-based icns entries). Run: tsx scripts/make-icon.ts
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { PNG } from 'pngjs';

type RGBA = [number, number, number, number];

function sdRoundRect(x: number, y: number, half: number, r: number): number {
  const qx = Math.abs(x) - half + r;
  const qy = Math.abs(y) - half + r;
  return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r;
}
/** A leaf: intersection of two offset circles, rotated. */
function sdLeaf(x: number, y: number, cx: number, cy: number, angle: number, len: number): number {
  const c = Math.cos(-angle);
  const s = Math.sin(-angle);
  const px = (x - cx) * c - (y - cy) * s;
  const py = (x - cx) * s + (y - cy) * c;
  const r = len * 0.75;
  const off = r - len * 0.28;
  const d1 = Math.hypot(px - len / 2, py - off) - r;
  const d2 = Math.hypot(px - len / 2, py + off) - r;
  return Math.max(d1, d2);
}
function sdSegment(
  x: number,
  y: number,
  ax: number,
  ay: number,
  bx: number,
  by: number,
  w: number,
): number {
  const pax = x - ax;
  const pay = y - ay;
  const bax = bx - ax;
  const bay = by - ay;
  const h = Math.max(0, Math.min(1, (pax * bax + pay * bay) / (bax * bax + bay * bay)));
  return Math.hypot(pax - bax * h, pay - bay * h) - w;
}

function render(size: number): Buffer {
  const png = new PNG({ width: size, height: size });
  const px = 1 / size;
  for (let j = 0; j < size; j++) {
    for (let i = 0; i < size; i++) {
      // Normalised coordinates in [-0.5, 0.5].
      const x = (i + 0.5) / size - 0.5;
      const y = (j + 0.5) / size - 0.5;
      const bg = sdRoundRect(x, y, 0.42, 0.1);
      const t = (y + 0.5) * 0.9;
      let col: RGBA = [
        Math.round(52 + 30 * t),
        Math.round(168 - 40 * t),
        Math.round(108 - 30 * t),
        255,
      ];
      let a = Math.max(0, Math.min(1, 0.5 - bg / px));
      const stem = sdSegment(x, y, 0, 0.26, 0, -0.02, 0.028);
      const leafL = sdLeaf(x, y, 0, -0.02, Math.PI * 1.15, 0.26);
      const leafR = sdLeaf(x, y, 0, -0.06, -Math.PI * 0.18, 0.3);
      const plant = Math.min(stem, leafL, leafR);
      const soil = sdSegment(x, y, -0.16, 0.27, 0.16, 0.27, 0.035);
      const w = Math.max(0, Math.min(1, 0.5 - plant / px));
      const s = Math.max(0, Math.min(1, 0.5 - soil / px));
      const mix = (c: RGBA, d: RGBA, k: number): RGBA => [
        c[0] + (d[0] - c[0]) * k,
        c[1] + (d[1] - c[1]) * k,
        c[2] + (d[2] - c[2]) * k,
        255,
      ];
      col = mix(col, [250, 252, 245, 255], w);
      col = mix(col, [120, 84, 60, 255], s * (1 - w));
      if (bg > 0) a = Math.max(0, Math.min(1, 0.5 - bg / px));
      const k = (j * size + i) * 4;
      png.data[k] = Math.round(col[0]);
      png.data[k + 1] = Math.round(col[1]);
      png.data[k + 2] = Math.round(col[2]);
      png.data[k + 3] = Math.round(255 * a);
    }
  }
  return PNG.sync.write(png);
}

/** ICNS container with PNG payloads. */
function icns(entries: [string, Buffer][]): Buffer {
  const parts = entries.map(([type, data]) => {
    const head = Buffer.alloc(8);
    head.write(type, 0, 'ascii');
    head.writeUInt32BE(data.length + 8, 4);
    return Buffer.concat([head, data]);
  });
  const body = Buffer.concat(parts);
  const head = Buffer.alloc(8);
  head.write('icns', 0, 'ascii');
  head.writeUInt32BE(body.length + 8, 4);
  return Buffer.concat([head, body]);
}

mkdirSync('build', { recursive: true });
const sizes: [string, number][] = [
  ['icp4', 16],
  ['icp5', 32],
  ['icp6', 64],
  ['ic07', 128],
  ['ic08', 256],
  ['ic09', 512],
  ['ic10', 1024],
];
const pngs = new Map<number, Buffer>();
for (const [, n] of sizes) pngs.set(n, render(n));
writeFileSync('build/icon.png', pngs.get(1024) as Buffer);
writeFileSync('build/icon.icns', icns(sizes.map(([t, n]) => [t, pngs.get(n) as Buffer])));
console.log('make-icon: wrote build/icon.png and build/icon.icns');
