import { expect, type Page } from '@playwright/test';

export async function headerAge(page: Page): Promise<number> {
  const t = (await page.getByTestId('header-age').textContent()) ?? '';
  return Number(t.replace(/\D/g, ''));
}

/** Start a custom life with a fixed seed so runs are repeatable. */
export async function startSeeded(
  page: Page,
  seed: number,
  extra: (p: Page) => Promise<void> = async () => {},
): Promise<void> {
  await page.goto('/');
  await page.getByTestId('btn-new-life').click();
  await page.getByTestId('f-seed').fill(String(seed));
  await extra(page);
  await page.getByTestId('btn-begin').click();
  await expect(page.getByTestId('game-screen')).toBeVisible();
}

/** Answer any popup with its first enabled choice. Returns true if one was answered. */
export async function answerPopup(page: Page): Promise<boolean> {
  const modal = page.getByTestId('event-modal');
  if (!(await modal.isVisible())) return false;
  const choices = modal.locator('button.choice:not([disabled])');
  await choices.first().click();
  return true;
}

/** Age up (answering popups) until the player reaches `age` or dies. */
export async function ageTo(page: Page, age: number): Promise<void> {
  for (let i = 0; i < 2000; i++) {
    if (await page.getByTestId('obituary-screen').isVisible()) return;
    if (await answerPopup(page)) continue;
    if ((await headerAge(page)) >= age) return;
    await page.getByTestId('age-up').click();
  }
  throw new Error('ageTo did not converge');
}
