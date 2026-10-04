import { test, expect } from './fixtures';
import { cheat, clearPopups, startSeeded } from './helpers';

test('flow 8: emigrate; currency and country change in the header', async ({ page }) => {
  await startSeeded(page, 808, async (p) => {
    await p.getByTestId('f-country').selectOption('us');
  });
  await cheat(page, 'age set 30', 'money add 50000');
  await clearPopups(page);
  await expect(page.getByTestId('header-cash')).toContainText('USD');
  await expect(page.getByTestId('header-place')).toContainText('United States');
  await page.getByTestId('tab-activities').click();
  await page.getByTestId('emigrate-country').selectOption('jp');
  await page.getByTestId('emigrate-city').selectOption('Sapporo');
  await page.getByTestId('btn-emigrate').click();
  await expect(page.getByTestId('header-place')).toContainText('Sapporo, Japan');
  await expect(page.getByTestId('header-cash')).toContainText('JPY');
  await expect(page.getByTestId('header-cash')).toContainText('¥');
});
