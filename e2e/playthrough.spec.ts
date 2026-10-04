import { test, expect } from './fixtures';
import { headerAge } from './helpers';

test('flow 15: a 40+ year playthrough by hand with random choices', async ({ page }) => {
  test.setTimeout(120_000);
  // Seeded picks keep the run repeatable while still choosing at random.
  let r = 20261004;
  const pick = (n: number): number => {
    r = (Math.imul(r, 1103515245) + 12345) >>> 0;
    return (r >>> 8) % n;
  };
  await page.goto('/');
  await page.getByTestId('btn-new-life').click();
  await page.getByTestId('f-seed').fill('4242');
  await page.getByTestId('btn-begin').click();
  await expect(page.getByTestId('game-screen')).toBeVisible();

  let ageUps = 0;
  let answered = 0;
  for (let i = 0; i < 400 && ageUps < 45; i++) {
    if (await page.getByTestId('obituary-screen').isVisible()) break;
    const modal = page.getByTestId('event-modal');
    if (await modal.isVisible()) {
      const choices = modal.locator('button.choice:not([disabled])');
      const n = await choices.count();
      expect(n).toBeGreaterThan(0);
      await choices.nth(pick(n)).click();
      answered += 1;
      continue;
    }
    const before = await headerAge(page);
    await page.getByTestId('age-up').click();
    await expect
      .poll(
        async () =>
          (await page.getByTestId('obituary-screen').isVisible()) ||
          (await headerAge(page)) > before,
      )
      .toBe(true);
    ageUps += 1;
  }
  expect(ageUps).toBeGreaterThanOrEqual(40);
  await expect(page.getByTestId('game-screen')).toBeVisible();
  expect(answered).toBeGreaterThan(5);
});
