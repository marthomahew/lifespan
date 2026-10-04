import { test, expect } from './fixtures';
import { headerAge, startSeeded } from './helpers';
import type { Page } from '@playwright/test';

async function ageUntilPopup(page: Page): Promise<void> {
  for (let i = 0; i < 150; i++) {
    if (await page.getByTestId('event-modal').isVisible()) return;
    await page.getByTestId('age-up').click();
  }
  throw new Error('no popup appeared');
}

test('flow 3a: a popup answered by mouse; Age Up is blocked while it is pending', async ({
  page,
}) => {
  await startSeeded(page, 31);
  await ageUntilPopup(page);
  await expect(page.getByTestId('choice-1')).toContainText('1');
  await expect(page.getByTestId('age-up')).toBeDisabled();
  const age = await headerAge(page);
  await page.keyboard.press('Space');
  expect(await headerAge(page)).toBe(age);
  const lines = await page.getByTestId('log-line').count();
  await page.getByTestId('choice-1').click();
  await expect(page.getByTestId('log-line')).toHaveCount(lines + 1);
  // Any further popups this year still block Age Up until answered.
  while (await page.getByTestId('event-modal').isVisible()) {
    await expect(page.getByTestId('age-up')).toBeDisabled();
    await page.locator('button.choice:not([disabled])').first().click();
  }
  await expect(page.getByTestId('age-up')).toBeEnabled();
});

test('flow 3b: a popup answered by number key', async ({ page }) => {
  await startSeeded(page, 32);
  await ageUntilPopup(page);
  const lines = await page.getByTestId('log-line').count();
  const enabled = page.getByTestId('event-modal').locator('button.choice:not([disabled])');
  const testId = (await enabled.first().getAttribute('data-testid')) ?? 'choice-1';
  await page.keyboard.press(testId.replace('choice-', ''));
  await expect(page.getByTestId('log-line')).toHaveCount(lines + 1);
});
