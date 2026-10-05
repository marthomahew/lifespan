import { test, expect } from '../fixtures';

test('the doctor warning in the UI', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('btn-new-life').click();
  await page.getByTestId('f-seed').fill('4040');
  await page.getByTestId('btn-begin').click();
  await page.keyboard.press('`');
  for (const c of ['age set 74', 'immortal on', 'stat health 8']) {
    await page.getByTestId('console-input').fill(c);
    await page.getByTestId('console-input').press('Enter');
  }
  await page.getByTestId('cheat-close').click();
  for (let i = 0; i < 30; i++) {
    const modal = page.getByTestId('event-modal');
    if (await modal.isVisible()) {
      if (await page.getByTestId('event-result').isVisible()) {
        await page.getByTestId('result-continue').click();
        continue;
      }
      const text = (await page.getByTestId('event-text').textContent({ timeout: 2000 })) ?? '';
      if (text.includes('glasses')) {
        await page.screenshot({ path: 'reports/audit/warning-popup.png', animations: 'disabled' });
        await page.locator('[data-choice-id="bucket"]').click();
        await expect(page.getByTestId('event-result')).toBeVisible();
        await page.screenshot({ path: 'reports/audit/warning-result.png', animations: 'disabled' });
        return;
      }
      await modal.locator('button.choice:not([disabled])').first().click();
      continue;
    }
    await page.getByTestId('age-up').click();
  }
  throw new Error('no warning');
});
