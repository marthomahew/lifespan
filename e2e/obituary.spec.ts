import { test, expect } from './fixtures';
import { ageTo, startSeeded } from './helpers';

test('a life ends in an obituary with a cause, a title and a New Life action', async ({ page }) => {
  test.setTimeout(120_000);
  await startSeeded(page, 5);
  await ageTo(page, 200);
  await expect(page.getByTestId('obituary-screen')).toBeVisible();
  await expect(page.getByTestId('obit-cause')).toContainText('Cause of death:');
  await expect(page.getByTestId('obit-title')).not.toBeEmpty();
  await expect(page.getByTestId('obit-summary').locator('li').first()).toBeVisible();
  await page.getByTestId('btn-obit-new-life').click();
  await expect(page.getByTestId('new-life-screen')).toBeVisible();
});
