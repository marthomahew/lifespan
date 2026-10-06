import { describe, expect, it } from 'vitest';
import { newLife, runCheat } from '../../src/engine';
import { jobBoard, sortBoard } from '../../src/engine/systems/job-board';

const s = runCheat(newLife({ birthYear: 1990, country: 'us' }, 1700), 'age.set', { age: 24 }).state;

describe('the job board', () => {
  it('gives every job its ladder, its ceiling and, if you could apply, your odds', () => {
    const rows = jobBoard(s);
    const sparky = rows.find((r) => r.job.id === 'electrician');
    expect(sparky?.ladder.map((r) => r.title)).toEqual([
      'Apprentice Electrician',
      'Electrician',
      'Master Electrician',
      'Electrical Contractor',
    ]);
    expect(sparky?.top).toBeGreaterThan(sparky?.start ?? Infinity);
    expect(sparky?.topTitle).toBe('Electrical Contractor');
    for (const r of rows) {
      if (r.unmet.length) expect(r.odds).toBeNull();
      else expect(r.odds).toBeGreaterThan(0);
    }
    // Special careers find you; they're never on the board.
    expect(rows.some((r) => r.job.special)).toBe(false);
  });

  it('sorts by starting pay or by ceiling', () => {
    const byTop = sortBoard(jobBoard(s), 'top');
    for (let i = 1; i < byTop.length; i++)
      expect(byTop[i - 1]?.top ?? 0).toBeGreaterThanOrEqual(byTop[i]?.top ?? 0);
    const byStart = sortBoard(jobBoard(s), 'start');
    for (let i = 1; i < byStart.length; i++)
      expect(byStart[i - 1]?.start ?? 0).toBeGreaterThanOrEqual(byStart[i]?.start ?? 0);
  });
});
