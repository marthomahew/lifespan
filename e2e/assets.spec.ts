import { test, expect } from './fixtures';
import { cheat, clearPopups, startSeeded } from './helpers';

test('flow 6: cheat money, buy a home with a mortgage, see the loan under Assets', async ({
  page,
}) => {
  await startSeeded(page, 606);
  await cheat(page, 'age set 30', 'money add 5000000', 'job set lawyer');
  await clearPopups(page);
  // Listings arrive with the year.
  await page.getByTestId('age-up').click();
  await clearPopups(page);
  await page.getByTestId('tab-assets').click();
  await expect(page.getByTestId('listing-0')).toBeVisible();
  await page.getByTestId('buy-0').click();
  await expect(page.getByTestId('buy-dialog')).toBeVisible();
  // The quote follows the chosen term and deposit.
  const yearly30 = await page.getByTestId('buy-yearly').textContent();
  await page.getByTestId('buy-term').selectOption('15');
  await page.getByTestId('buy-down').fill('20');
  await expect(page.getByTestId('buy-yearly')).not.toHaveText(yearly30 ?? '');
  await page.getByTestId('buy-confirm').click();
  await expect(page.getByTestId('buy-dialog')).toHaveCount(0);
  await expect(page.getByTestId('homes').locator('li')).toHaveCount(1);
  await expect(page.getByTestId('loan-mortgage')).toBeVisible();
  await expect(page.getByTestId('loan-mortgage')).toContainText('Mortgage loan');
  await expect(page.getByTestId('housing-status')).toHaveText('In your own home');
});

test('finances view shows last year and a net worth graph; investing works', async ({ page }) => {
  await startSeeded(page, 607);
  await cheat(page, 'age set 30', 'money add 50000', 'job set accountant');
  await clearPopups(page);
  for (let i = 0; i < 3; i++) {
    await page.getByTestId('age-up').click();
    await clearPopups(page);
  }
  await page.getByTestId('tab-assets').click();
  await page.getByTestId('btn-finances').click();
  await expect(page.getByTestId('finance-breakdown')).toContainText('Salary');
  await expect(page.getByTestId('finance-breakdown')).toContainText('Tax');
  await expect(page.getByTestId('networth-chart')).toBeVisible();
  await page.getByTestId('fin-amount').fill('1000');
  await page.getByTestId('fin-invest').click();
  await expect(page.getByTestId('holdings')).toContainText('1,000');
  await page.keyboard.press('Escape');
  await expect(page.getByTestId('finances')).toHaveCount(0);
});

test('vehicles and possessions are bought through the buy dialog', async ({ page }) => {
  await startSeeded(page, 608);
  await cheat(page, 'age set 30', 'money add 100000');
  await clearPopups(page);
  await page.getByTestId('tab-assets').click();
  await page.getByTestId('btn-shop-vehicle').click();
  await page.getByTestId('vehicle-model').selectOption({ index: 1 });
  await page.getByTestId('buy-finance').check();
  await page.getByTestId('buy-confirm').click();
  await expect(page.getByTestId('buy-dialog')).toHaveCount(0);
  await expect(page.getByTestId('vehicles').locator('li')).toHaveCount(1);
  await expect(page.getByTestId('loan-personal')).toBeVisible();
  await page.getByTestId('btn-shop-item').click();
  await page.getByTestId('item-select').selectOption({ index: 2 });
  await page.getByTestId('buy-confirm').click();
  await expect(page.getByTestId('possessions').locator('li')).toHaveCount(1);
  // A purchase you can't afford keeps the dialog open with the reason.
  await cheat(page, 'money set 0');
  await page.getByTestId('btn-shop-item').click();
  await page.getByTestId('buy-confirm').click();
  await expect(page.getByTestId('buy-error')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByTestId('buy-dialog')).toHaveCount(0);
});
