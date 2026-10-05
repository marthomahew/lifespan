import { test, expect } from '../fixtures';

test('the opening minutes of a life', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('btn-new-life').click();
  await page.getByTestId('f-seed').fill('2027');
  await page.getByTestId('btn-begin').click();
  await expect(page.getByTestId('game-screen')).toBeVisible();
  let shots = 0;
  for (let i = 0; i < 40 && shots < 6; i++) {
    const modal = page.getByTestId('event-modal');
    if (await modal.isVisible()) {
      if (await page.getByTestId('event-result').isVisible()) {
        await page.screenshot({ path: `reports/audit/opening-${shots++}-result.png` });
        await page.getByTestId('result-continue').click();
      } else {
        await page.screenshot({ path: `reports/audit/opening-${shots++}-popup.png` });
        await modal.locator('button.choice:not([disabled])').first().click();
      }
      continue;
    }
    await page.getByTestId('age-up').click();
  }
  await page.screenshot({ path: 'reports/audit/opening-final.png' });
});
