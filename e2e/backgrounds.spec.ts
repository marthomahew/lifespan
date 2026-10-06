import { test, expect } from './fixtures';
import { startSeeded } from './helpers';

test('a chosen background starts the life; the setting for chance lives defaults to off', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByTestId('btn-start-settings').click();
  await expect(page.getByTestId('set-backgrounds')).toHaveValue('off');
  await startSeeded(page, 6060, async (p) => {
    await p.getByTestId('f-background').selectOption('twin');
    await expect(p.getByTestId('background-note')).toContainText('twin');
  });
  await expect(page.getByTestId('game-screen')).toContainText('👯');
});
