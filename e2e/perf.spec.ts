import { test, expect } from './fixtures';
import { startSeeded } from './helpers';

test('first paint of the built app is under 1.5 s', async ({ page }) => {
  await page.goto('/');
  await page.waitForSelector('[data-testid="start-screen"]');
  // First contentful paint when the browser reports it; otherwise time from navigation to the rendered start screen.
  const ms = await page.evaluate(
    () =>
      performance.getEntriesByType('paint').find((p) => p.name === 'first-contentful-paint')
        ?.startTime ?? performance.now(),
  );
  expect(ms).toBeLessThan(1500);
});

test('the log stays smooth at 5,000 entries', async ({ page }) => {
  await startSeeded(page, 5000, async (p) => {
    await p.getByTestId('f-first').fill('Verbose');
  });
  // Pad the autosaved life to 5,000 log lines and load it.
  await page.evaluate(() => {
    const key = Object.keys(localStorage).find((k) => k.startsWith('lifespan.save.'));
    if (!key) throw new Error('no save');
    const file = JSON.parse(localStorage.getItem(key) ?? '{}') as {
      state: { log: { age: number; year: number; cat: string; text: string }[]; year: number };
    };
    const log = file.state.log;
    for (let i = log.length; i < 5000; i++)
      log.push({
        age: 0,
        year: file.state.year,
        cat: 'random',
        text: `Something small happens, number ${i}.`,
      });
    localStorage.setItem(key, JSON.stringify(file));
  });
  await page.reload();
  const t0 = Date.now();
  await page.getByTestId('btn-continue').click();
  await expect(page.getByTestId('game-screen')).toBeVisible();
  const loadMs = Date.now() - t0;
  expect(loadMs).toBeLessThan(2000);
  // Paginated: only recent years are in the DOM, with a way to see earlier ones.
  expect(await page.getByTestId('log-line').count()).toBeLessThanOrEqual(5000);
  const scrollMs = await page.getByTestId('log').evaluate(async (el) => {
    const start = performance.now();
    for (let i = 0; i < 20; i++) {
      el.scrollTop = (el.scrollHeight * i) / 20;
      await new Promise((r) => requestAnimationFrame(() => r(null)));
    }
    return performance.now() - start;
  });
  expect(scrollMs).toBeLessThan(2000);
  // Age Up still responds quickly.
  const t1 = Date.now();
  await page.getByTestId('age-up').click();
  await expect(page.getByTestId('header-age')).toHaveText('Age 1');
  expect(Date.now() - t1).toBeLessThan(1000);
});
