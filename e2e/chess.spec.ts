import { test, expect } from './fixtures';
import { cheat, clearPopups, startSeeded } from './helpers';

test('a top player sees the world title cycle and can play the World Rapid', async ({ page }) => {
  await startSeeded(page, 5151);
  await cheat(page, 'age set 30', 'skill chess 100', 'chess rating 2750');
  await clearPopups(page);
  await page.getByTestId('tab-occupation').click();
  await expect(page.getByTestId('pursuit-chess')).toBeVisible();
  await expect(page.getByTestId('chess-majors')).toBeVisible();
  await expect(page.getByTestId('chess-major-rapid')).toBeVisible();
  await expect(page.getByTestId('chess-major-candidates')).toBeVisible();
  await page.getByTestId('chess-major-rapid').click();
  await clearPopups(page);
  await expect(page.getByTestId('chess-majors')).toContainText('World Rapid & Blitz,');
  await expect(page.getByTestId('chess-major-rapid')).toBeDisabled();
});
