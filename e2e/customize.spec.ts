import { test, expect } from './fixtures';
import { cheat, clearPopups, startSeeded } from './helpers';

test('in life: practise a picked skill, get a new look, change your name', async ({ page }) => {
  await startSeeded(page, 9090, async (p) => {
    await p.getByTestId('f-gender').selectOption('male');
    await p.getByTestId('look-tab-hair').click();
    await p.getByTestId('look-opt-hair-short').click();
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
  await expect(page.getByTestId('look-builder')).toBeVisible();
  // Only what a salon, a razor, an optician or a shop can change.
  await expect(page.getByTestId('look-tab-face')).toHaveCount(0);
  await page.getByTestId('look-opt-hair-mohawk').click();
  await page.getByTestId('look-opt-hairColor-green').click();
  await page.getByTestId('look-tab-facialHair').click();
  await page.getByTestId('look-opt-facialHair-goatee').click();
  await expect(page.getByTestId('makeover-portrait')).toHaveAttribute('data-hair', 'mohawk');
  await page.getByTestId('opt-look-go').click();
  await expect(page.getByTestId('header-portrait')).toHaveAttribute('data-hair', 'mohawk');
  await page.getByTestId('act-change_name').click();
  await page.getByTestId('opt-first').fill('Bastian');
  await page.getByTestId('opt-last').fill('Moreau');
  await page.getByTestId('opt-name-go').click();
  await expect(page.getByTestId('player-name')).toHaveText('Bastian Moreau');
});

test('free time: a year holds only so many activities, and a birthday refills it', async ({
  page,
}) => {
  await startSeeded(page, 5150);
  await cheat(page, 'age set 30', 'money add 50000');
  await clearPopups(page);
  await page.getByTestId('tab-activities').click();
  const meter = page.getByTestId('free-time');
  await expect(meter).toContainText('7 of 7 left');
  for (const id of ['gym', 'meditate', 'nightlife', 'volunteer', 'join_club', 'diet', 'study']) {
    await page.getByTestId(`act-${id}`).click();
    await clearPopups(page);
  }
  await expect(meter).toHaveAttribute('data-left', '0');
  await expect(page.getByTestId('act-practice_skill')).toBeDisabled();
  await expect(page.getByTestId('act-practice_skill')).toContainText('No free time left this year');
  await page.getByTestId('age-up').click();
  await clearPopups(page);
  await page.getByTestId('tab-activities').click();
  await expect(meter).not.toHaveAttribute('data-left', '0');
});
