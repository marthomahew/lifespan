import { test, expect } from './fixtures';
import { cheat, clearPopups, startSeeded } from './helpers';

test('the full keyboard map works and is listed in Help', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('btn-start-settings').click();
  await page.getByTestId('set-autosave').uncheck();
  await startSeeded(page, 1144);
  await cheat(page, 'age set 20');
  await clearPopups(page);
  for (const [n, t] of [
    ['1', 'occupation'],
    ['2', 'assets'],
    ['3', 'relationships'],
    ['4', 'activities'],
  ] as const) {
    await page.keyboard.press(`Control+${n}`);
    await expect(page.getByTestId(`tab-${t}`)).toHaveAttribute('aria-selected', 'true');
  }
  await page.keyboard.press('?');
  const table = page.getByTestId('shortcut-table');
  for (const k of ['Space', '1 – 4', 'Esc', '⌘1 – ⌘4', '⌘K', '⌘S', '⌘L', '⌘,', '?', '` or ⇧⌘K'])
    await expect(table).toContainText(k);
  // And a short guide to the systems that aren't obvious from the screen.
  for (const k of ['A focus', 'Luck', 'Your own business', 'Backgrounds'])
    await expect(page.getByTestId('help-guide')).toContainText(k);
  await page.keyboard.press('Escape');
  await expect(page.getByTestId('help')).toHaveCount(0);
  await page.keyboard.press('Control+s');
  await expect
    .poll(() =>
      page.evaluate(
        () => Object.keys(localStorage).filter((k) => k.startsWith('lifespan.save.')).length,
      ),
    )
    .toBe(1);
  await page.keyboard.press('Control+l');
  await expect(page.getByTestId('lives-screen')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByTestId('game-screen')).toBeVisible();
  await page.keyboard.press('Control+,');
  await expect(page.getByTestId('settings-screen')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByTestId('game-screen')).toBeVisible();
});

test('⌘K finds and runs any available action', async ({ page }) => {
  await startSeeded(page, 1145);
  await cheat(page, 'age set 25');
  await clearPopups(page);
  await page.keyboard.press('Control+k');
  await expect(page.getByTestId('palette')).toBeVisible();
  await page.getByTestId('palette-input').fill('library');
  await expect(page.getByTestId('palette-item').first()).toContainText('Study at the library');
  const lines = await page.getByTestId('log-line').count();
  await page.getByTestId('palette-input').press('Enter');
  await expect(page.getByTestId('palette')).toHaveCount(0);
  await expect.poll(() => page.getByTestId('log-line').count()).toBeGreaterThan(lines);
  await expect(
    page
      .getByTestId('log-line')
      // The study line comes in several wordings; its emoji is constant.
      .filter({ hasText: '📖' })
      .last(),
  ).toBeVisible();
  // People and navigation are in there too.
  await page.keyboard.press('Control+k');
  await page.getByTestId('palette-input').fill('spend time');
  await expect(page.getByTestId('palette-item').first()).toContainText('Spend time');
  await page.getByTestId('palette-input').fill('finances');
  await page.getByTestId('palette-input').press('Enter');
  await expect(page.getByTestId('finances')).toBeVisible();
});

test('the log is searchable and filterable; the timeline lists milestones', async ({ page }) => {
  await startSeeded(page, 1146);
  await cheat(page, 'skip 20');
  await clearPopups(page);
  const all = await page.getByTestId('log-line').count();
  await page.getByTestId('log-search').fill('school');
  const found = await page.getByTestId('log-line').count();
  expect(found).toBeGreaterThan(0);
  expect(found).toBeLessThan(all);
  for (const t of await page.getByTestId('log-line').allTextContents())
    expect(t.toLowerCase()).toContain('school');
  await page.getByTestId('log-search').fill('');
  await page.getByTestId('log-filter').selectOption('system');
  for (const el of await page.getByTestId('log-line').all())
    await expect(el).toHaveClass(/cat-system/);
  await page.getByTestId('log-filter').selectOption('all');
  await page.getByTestId('btn-timeline').click();
  await expect(page.getByTestId('timeline-item').first()).toContainText('You are born');
  expect(await page.getByTestId('timeline-item').count()).toBeGreaterThan(3);
});

test('Space ages up even when a button kept focus after a dialog closed', async ({ page }) => {
  await startSeeded(page, 4545);
  await cheat(page, 'age set 20');
  await clearPopups(page);
  await page.getByTestId('tab-occupation').click();
  await page.getByTestId('btn-job-listings').click();
  await expect(page.getByTestId('job-listings')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByTestId('job-listings')).toHaveCount(0);
  const before = Number((await page.getByTestId('header-age').textContent())?.replace(/\D/g, ''));
  await page.keyboard.press(' ');
  await expect(page.getByTestId('job-listings')).toHaveCount(0);
  await clearPopups(page);
  await expect(page.getByTestId('header-age')).toContainText(String(before + 1));
});
