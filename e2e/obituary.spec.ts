import { test, expect } from './fixtures';
import { ageTo, startSeeded } from './helpers';

test('a life ends in an obituary with a cause, a title and a New Life action', async ({ page }) => {
  test.setTimeout(120_000);
  await startSeeded(page, 5);
  await ageTo(page, 200);
  await expect(page.getByTestId('obituary-screen')).toBeVisible();
  await expect(page.getByTestId('obit-cause')).toContainText('Cause of death:');
  await expect(page.getByTestId('obit-portrait')).toHaveClass(/dead/);
  await expect(page.getByTestId('obit-years').locator('.portrait').first()).toBeVisible();
  await expect(page.getByTestId('btn-obit-new-life')).toBeInViewport();
  await expect(page.getByTestId('obit-title')).not.toBeEmpty();
  await expect(page.getByTestId('obit-summary').locator('li').first()).toBeVisible();
  await page.getByTestId('btn-obit-new-life').click();
  await expect(page.getByTestId('new-life-screen')).toBeVisible();
});

test('a finished life goes into the records on the start screen', async ({ page }) => {
  await startSeeded(page, 6);
  await page.keyboard.press('`');
  await page.getByTestId('console-input').fill('deathbot');
  await page.getByTestId('console-input').press('Enter');
  await page.getByTestId('cheat-close').click();
  await expect(page.getByTestId('obituary-screen')).toBeVisible();
  await page.goto('/');
  await expect(page.getByTestId('records')).toContainText('1 life lived');
  await expect(page.getByTestId('records')).toContainText('Oldest');
});
