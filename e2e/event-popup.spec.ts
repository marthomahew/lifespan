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
  await page.getByTestId('event-modal').locator('button.choice:not([disabled])').first().click();
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

test('after a choice, a result card shows what you chose and what changed', async ({ page }) => {
  await startSeeded(page, 33);
  await ageUntilPopup(page);
  const first = page.getByTestId('event-modal').locator('button.choice:not([disabled])').first();
  const label = ((await first.textContent()) ?? '').replace(/^\d/, '').trim();
  await first.click();
  await expect(page.getByTestId('event-result')).toBeVisible();
  await expect(page.getByTestId('result-chose')).toContainText(label);
  await expect(page.getByTestId('result-text')).not.toBeEmpty();
  // Age Up waits for you to read it; Space carries on without ageing.
  await expect(page.getByTestId('age-up')).toBeDisabled();
  const age = await headerAge(page);
  await page.keyboard.press('Space');
  await expect(page.getByTestId('event-result')).toHaveCount(0);
  expect(await headerAge(page)).toBe(age);
  // The log keeps the choice with its outcome.
  await expect(page.locator('.log-chose').last()).toContainText(label);
});

test('after Age Up, a line sums up what this year has done', async ({ page }) => {
  await startSeeded(page, 34);
  await expect(page.getByTestId('last-year')).toHaveCount(0);
  for (let i = 0; i < 6; i++) {
    while (await page.getByTestId('event-modal').isVisible())
      await page.locator('button.choice:not([disabled])').first().click();
    await page.getByTestId('age-up').click();
  }
  await expect(page.getByTestId('last-year')).toContainText('This year:');
  // The same year shows beside the stats, and this year's log lines are marked.
  expect(await page.locator('[data-testid$="-delta"]').count()).toBeGreaterThan(0);
  expect(await page.locator('.log-line.fresh').count()).toBeGreaterThan(0);
});
