import { test, expect } from './fixtures';

test('app loads in the browser', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('app-root')).toBeVisible();
  await expect(page).toHaveTitle('Lifespan');
});

test('the console-error guard catches errors', async ({ browser }) => {
  // A separate page outside the fixture: prove the listener pattern sees errors.
  const page = await browser.newPage();
  const errors: string[] = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  await page.evaluate(() => {
    console.error('boom');
    setTimeout(() => {
      throw new Error('kaboom');
    }, 0);
  });
  await page.waitForTimeout(50);
  expect(errors).toContain('boom');
  expect(errors).toContain('kaboom');
  await page.close();
});
