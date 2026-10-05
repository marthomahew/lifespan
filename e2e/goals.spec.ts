import { test, expect } from './fixtures';
import { cheat, clearPopups, startSeeded } from './helpers';

test('life goals: choose, drop, and reach one', async ({ page }) => {
  await startSeeded(page, 1616);
  await expect(page.getByTestId('goals-card')).toHaveCount(0);
  await cheat(page, 'age set 20');
  await clearPopups(page);
  await page.getByTestId('btn-choose-goal').click();
  await expect(page.getByTestId('goal-picker')).toBeVisible();
  await page.getByTestId('pick-goal-abroad').click();
  await expect(page.getByTestId('goal-picker')).toHaveCount(0);
  await page.getByTestId('btn-choose-goal').click();
  await page.getByTestId('pick-goal-doctor').click();
  await expect(page.getByTestId('goal-abroad')).toBeVisible();
  await page.getByTestId('goal-drop-doctor').click();
  await expect(page.getByTestId('goal-doctor')).toHaveCount(0);
  // Reach it: move abroad, then live the year out.
  await cheat(page, 'emigrate ca');
  await page.getByTestId('age-up').click();
  await expect(page.getByTestId('goal-abroad')).toContainText('✅');
  await expect(page.getByTestId('goal-drop-abroad')).toHaveCount(0);
});
