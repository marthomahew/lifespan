import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { EVENTS } from '../../src/content/events';
import { countChains } from '../../scripts/content-lib';
import { CHEATS } from '../../src/engine/cheats/registry';

describe('REPORT.md (M12.6, M12.7)', () => {
  const report = readFileSync('progress/REPORT.md', 'utf8');
  const section = (title: string): string => {
    const at = report.indexOf(`## ${title}`);
    expect(at, title).toBeGreaterThanOrEqual(0);
    const next = report.indexOf('\n## ', at + 3);
    return report.slice(at, next < 0 ? undefined : next);
  };

  it('has every DONE §6 part', () => {
    for (const t of [
      'What was built',
      'Installing the Mac app',
      'Item status',
      'Known issues and limitations',
      'Ten key decisions',
      'Verification evidence',
      'Screenshots',
      'Suggested next steps',
    ])
      section(t);
    expect(section('Installing the Mac app')).toContain('scripts/mac/install-mac.sh');
    expect(section('Installing the Mac app')).toContain('scripts/mac/build-mac.sh');
    expect(section('Ten key decisions').match(/^\d+\. /gm)).toHaveLength(10);
  });

  it('states counts that match the code and the feature list', () => {
    const features = JSON.parse(readFileSync('progress/features.json', 'utf8')) as Record<
      string,
      { waived?: boolean }
    >;
    const items = Object.keys(features).filter((k) => /^M\d+\.\d+$/.test(k));
    expect(section('Item status')).toContain(`PLAN items: ${items.length}`);
    const waived = items.filter((k) => features[k]?.waived === true);
    if (waived.length === 0) expect(section('Item status')).toMatch(/none are waived/);
    else for (const k of waived) expect(section('Item status')).toContain(k);
    expect(report).toContain(`${EVENTS.length} original events (${countChains(EVENTS)} chains)`);
    expect(report).toContain(`| Events (in ${countChains(EVENTS)} chains) | ${EVENTS.length} |`);
    expect(report).toContain(`| Cheat commands | ${CHEATS.length} |`);
    for (const t of ['verify', 'Vitest', 'e2e', 'Coverage', 'invariant'])
      expect(section('Verification evidence')).toContain(t);
  });

  it('indexes every screenshot the shots script takes', () => {
    const shots = readFileSync('e2e/shots/shots.spec.ts', 'utf8');
    const names = [...shots.matchAll(/shot\('(\d\d-[a-z-]+)'\)/g)].map((m) => m[1]);
    expect(names.length).toBeGreaterThan(20);
    for (const n of names) expect(section('Screenshots'), n).toContain(`\`${n}\``);
  });

  it('records the fresh-eyes audit: a SPEC table covering every section and the three lives', () => {
    const audit = section('Fresh-eyes audit (DONE §7)');
    const spec = readFileSync('docs/SPEC.md', 'utf8');
    const tops = [...spec.matchAll(/^## (\d+)\. /gm)].map((m) => m[1]);
    expect(tops.length).toBeGreaterThanOrEqual(12);
    for (const n of tops) expect(audit, `§${n}`).toMatch(new RegExp(`^\\| §${n}[ .]`, 'm'));
    for (const sub of [...spec.matchAll(/^### (5\.\d+) /gm)].map((m) => m[1] ?? '')) {
      const [maj, min] = sub.split('.').map(Number);
      const covered = [...audit.matchAll(/^\| §5\.(\d+)(?:–5\.(\d+))?/gm)].some(
        (m) => maj === 5 && Number(m[1]) <= (min ?? 0) && (min ?? 0) <= Number(m[2] ?? m[1]),
      );
      expect(covered, `§${sub}`).toBe(true);
    }
    expect(audit).toContain('| SPEC section | Files | Checks | Gaps |');
    for (const life of ['ordinary', 'criminal', 'military']) expect(audit).toContain(life);
    expect(audit).toContain('e2e/audit/three-lives.spec.ts');
  });
});
