import { test, expect } from './fixtures';
import { answerPopup, startSeeded } from './helpers';

test('flow 12: theme switch persists across a reload', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('btn-start-settings').click();
  await page.getByTestId('set-theme').selectOption('dark');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.getByTestId('btn-start-settings').click();
  await page.getByTestId('set-theme').selectOption('light');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
});

test('every setting persists', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('btn-start-settings').click();
  await page.getByTestId('set-text-size').selectOption('large');
  await page.getByTestId('set-popups').fill('5');
  await page.getByTestId('set-cheat-badge').uncheck();
  await page.getByTestId('set-autosave').uncheck();
  await page.getByTestId('set-reduced-motion').check();
  await page.reload();
  await page.getByTestId('btn-start-settings').click();
  await expect(page.getByTestId('set-text-size')).toHaveValue('large');
  await expect(page.getByTestId('set-popups')).toHaveValue('5');
  await expect(page.getByTestId('set-cheat-badge')).not.toBeChecked();
  await expect(page.getByTestId('set-autosave')).not.toBeChecked();
  await expect(page.getByTestId('set-reduced-motion')).toBeChecked();
  await expect(page.locator('html')).toHaveAttribute('data-text-size', 'large');
  await expect(page.locator('html')).toHaveAttribute('data-reduced-motion', 'true');
});

test('the theme follows the system by default', async ({ browser }) => {
  for (const scheme of ['dark', 'light'] as const) {
    const ctx = await browser.newContext({ colorScheme: scheme });
    const page = await ctx.newPage();
    await page.goto('http://localhost:4173/');
    await expect(page.locator('html')).toHaveAttribute('data-theme', scheme);
    const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(bg).toBe(scheme === 'dark' ? 'rgb(28, 28, 31)' : 'rgb(245, 245, 247)');
    await ctx.close();
  }
});

test('stat sparklines and trait tooltips with modifiers', async ({ page }) => {
  await startSeeded(page, 44, async (p) => {
    await p.getByTestId('f-trait-bookish').click();
  });
  for (let i = 0; i < 4; i++) {
    if (await page.getByTestId('event-modal').isVisible())
      await page.getByTestId('choice-1').click();
    await page.getByTestId('age-up').click();
  }
  await answerPopup(page);
  await expect(page.getByTestId('stat-happiness').locator('svg.sparkline path')).toHaveCount(1);
  await page.getByTestId('trait-bookish').hover();
  await expect(page.getByTestId('trait-tip-bookish')).toBeVisible();
  await expect(page.getByTestId('trait-tip-bookish')).toContainText('Smarts drift +2 a year');
});
