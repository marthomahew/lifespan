import { test, expect } from './fixtures';
import { cheat, clearPopups, startSeeded } from './helpers';

test('blackjack: pick a table, play two hands, cash out, and the money follows the cards', async ({
  page,
}) => {
  await startSeeded(page, 9292, async (p) => {
    await p.getByTestId('f-country').selectOption('us');
  });
  await cheat(page, 'age set 30', 'money add 20000');
  await clearPopups(page);
  await page.getByTestId('tab-activities').click();
  await page.getByTestId('act-casino').click();
  await page.getByTestId('bj-bet-1').click();
  await expect(page.getByTestId('bj-player').locator('.bj-card')).toHaveCount(2);
  for (let hand = 0; hand < 2; hand++) {
    if (await page.getByTestId('bj-stand').isVisible()) await page.getByTestId('bj-stand').click();
    await expect(page.getByTestId('bj-status')).not.toHaveAttribute('data-hand', 'playing');
    await expect(page.getByTestId('bj-dealer').locator('.bj-card.down')).toHaveCount(0);
    if (hand === 0) await page.getByTestId('bj-next').click();
  }
  await page.getByTestId('bj-cashout').click();
  await expect(page.getByTestId('casino-table')).toHaveCount(0);
  await clearPopups(page);
  await expect(
    page
      .getByTestId('log-line')
      .filter({ hasText: /walk out .* up|lighter|exactly what you came in with/ }),
  ).not.toHaveCount(0);
});

test('walking away mid-hand stands on it: closing the table settles up', async ({ page }) => {
  await startSeeded(page, 9393, async (p) => {
    await p.getByTestId('f-country').selectOption('us');
  });
  await cheat(page, 'age set 30', 'money add 20000');
  await clearPopups(page);
  await page.getByTestId('tab-activities').click();
  await page.getByTestId('act-casino').click();
  await page.getByTestId('bj-bet-1').click();
  await page.keyboard.press('Escape');
  await expect(page.getByTestId('casino-table')).toHaveCount(0);
  await clearPopups(page);
  await expect(
    page
      .getByTestId('log-line')
      .filter({ hasText: /walk out .* up|lighter|exactly what you came in with/ }),
  ).not.toHaveCount(0);
});
