import { test, expect } from './fixtures';
import { cheat, clearPopups, startSeeded } from './helpers';

test('the escape plan: move with the keys, guards light the yard, losing your nerve costs nothing', async ({
  page,
}) => {
  await startSeeded(page, 8181);
  await cheat(page, 'age set 25', 'prison send 6');
  await clearPopups(page);
  const age = await page.getByTestId('header-age').textContent();
  await page.getByTestId('tab-activities').click();
  await page.getByTestId('act-prison_escape').click();
  const gameEl = page.getByTestId('escape-game');
  await expect(gameEl).toHaveAttribute('data-status', 'running');
  await expect(page.locator('.escape-cell.lit').first()).toBeVisible();
  const x0 = Number(await page.getByTestId('escape-you').getAttribute('data-x'));
  await page.keyboard.press('ArrowRight');
  await expect(page.getByTestId('escape-turn')).toContainText('Turn 1');
  // Space waits a turn here; it must not age you up underneath the dialog.
  await page.keyboard.press(' ');
  await expect(page.getByTestId('escape-turn')).toContainText('Turn 2');
  expect(await page.getByTestId('header-age').textContent()).toBe(age);
  const x1 = Number(await page.getByTestId('escape-you').getAttribute('data-x'));
  expect(x1 === x0 + 1 || (await gameEl.getAttribute('data-status')) !== 'running').toBe(true);
  await page.getByTestId('escape-quit').click();
  await expect(gameEl).toHaveCount(0);
  await clearPopups(page);
  await expect(page.getByTestId('log-line').filter({ hasText: 'laundry room' })).toHaveCount(1);
});
