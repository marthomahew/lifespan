import { test, expect } from './fixtures';
import { cheat, clearPopups, startSeeded } from './helpers';

test('flow 6: cheat money, buy a home with a mortgage, see the loan under Assets', async ({
  page,
}) => {
  await startSeeded(page, 606);
  await cheat(page, 'age set 30', 'money add 2000000', 'job set lawyer');
  await clearPopups(page);
  // Listings arrive with the year.
  await page.getByTestId('age-up').click();
  await clearPopups(page);
  await page.getByTestId('tab-assets').click();
  await expect(page.getByTestId('listing-0')).toBeVisible();
  await page.getByTestId('buy-mortgage-0').click();
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
