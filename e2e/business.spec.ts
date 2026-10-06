import { test, expect } from './fixtures';
import { cheat, clearPopups, startSeeded } from './helpers';

test('open a café, watch it trade, and sell it', async ({ page }) => {
  await startSeeded(page, 7311);
  await cheat(page, 'age set 30', 'money add 200000');
  await clearPopups(page);
  await page.getByTestId('tab-occupation').click();
  await page.getByTestId('business-open').click();
  await page.getByTestId('business-kind').selectOption('cafe');
  await page.getByTestId('business-name').fill('Lumière');
  await page.getByTestId('business-start').click();
  await expect(page.getByTestId('business-name-now')).toContainText('Lumière');
  await expect(page.getByTestId('occupation-now')).toHaveText('Running Lumière');
  await page.getByTestId('age-up').click();
  await clearPopups(page);
  await page.getByTestId('tab-occupation').click();
  await expect(page.getByTestId('business-numbers')).toContainText('Last year');
  await page.getByTestId('business-sell').click();
  await page.getByTestId('business-sell-yes').click();
  await expect(page.getByTestId('business-open')).toBeVisible();
});
