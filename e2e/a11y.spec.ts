import AxeBuilder from '@axe-core/playwright';
import { test, expect, type Page } from './fixtures';
import { cheat, clearPopups, startSeeded } from './helpers';

async function scan(page: Page, name: string): Promise<void> {
  const res = await new AxeBuilder({ page }).analyze();
  const bad = res.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
  const summary = bad.map(
    (v) =>
      `${name}: ${v.id} (${v.impact}) ${v.nodes
        .slice(0, 3)
        .map((n) => `${n.target.join(' ')} ${n.failureSummary ?? ''}`)
        .join(' | ')}`,
  );
  expect(summary).toEqual([]);
}

for (const theme of ['light', 'dark'] as const) {
  test(`flow 14: axe finds no serious or critical issues (${theme})`, async ({ page }) => {
    await page.goto('/');
    await page.evaluate(
      (t) =>
        localStorage.setItem(
          'lifespan.settings',
          JSON.stringify({ theme: t, reducedMotion: true }),
        ),
      theme,
    );
    await startSeeded(page, 1414);
    await cheat(page, 'age set 20');
    await clearPopups(page);
    await scan(page, 'main');
    await page.getByTestId('tab-activities').click();
    await scan(page, 'main/activities');
    await page.keyboard.press('`');
    await page.getByTestId('console-input').fill('event fire child_crayon_wall on');
    await page.getByTestId('console-input').press('Enter');
    await scan(page, 'cheats');
    await page.getByTestId('cheat-close').click();
    await expect(page.getByTestId('event-modal')).toBeVisible();
    await scan(page, 'event');
    await clearPopups(page);
    await page.getByTestId('btn-settings').click();
    await scan(page, 'settings');
    await page.getByTestId('btn-back').click();
    await cheat(page, 'deathbot');
    await expect(page.getByTestId('obituary-screen')).toBeVisible();
    await scan(page, 'obituary');
  });
}
