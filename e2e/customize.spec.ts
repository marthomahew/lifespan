import { test, expect } from './fixtures';
import { cheat, clearPopups, startSeeded } from './helpers';

test('in life: practise a picked skill, get a new look, change your name', async ({ page }) => {
  await startSeeded(page, 9090, async (p) => {
    await p.getByTestId('f-gender').selectOption('male');
    await p.getByTestId('f-hair-default').click();
  });
  await cheat(page, 'age set 25', 'money add 5000');
  await clearPopups(page);
  await page.getByTestId('tab-activities').click();
  await page.getByTestId('act-practice_skill').click();
  await expect(page.getByTestId('option-dialog')).toBeVisible();
  await page.getByTestId('opt-skill-cooking').click();
  await expect(page.getByTestId('option-dialog')).toHaveCount(0);
  await expect(page.getByTestId('skill-cooking')).toBeVisible();
  await page.getByTestId('act-new_look').click();
  await page.getByTestId('opt-hair-curly').click();
  await expect(page.getByTestId('header')).toContainText('👨‍🦱');
  await page.getByTestId('act-change_name').click();
  await page.getByTestId('opt-first').fill('Bastian');
  await page.getByTestId('opt-last').fill('Moreau');
  await page.getByTestId('opt-name-go').click();
  await expect(page.getByTestId('player-name')).toHaveText('Bastian Moreau');
});
