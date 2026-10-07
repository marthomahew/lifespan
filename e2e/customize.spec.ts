import { test, expect } from './fixtures';
import { cheat, clearPopups, startSeeded } from './helpers';

test('in life: practise a picked skill, get a new look, change your name', async ({ page }) => {
  await startSeeded(page, 9090, async (p) => {
    await p.getByTestId('f-gender-male').click();
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
  await page.getByTestId('look-tab-hat').click();
  await page.getByTestId('look-opt-hat-beanie').click();
  await expect(
    page.getByTestId('makeover-portrait').locator('[data-layer="hat"]').first(),
  ).toBeAttached();
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
  await expect(meter).toContainText('9 of 9 left');
  for (const id of [
    'gym',
    'meditate',
    'nightlife',
    'volunteer',
    'write_novel',
    'diet',
    'go_running',
    'chess_study',
    'code_project',
  ]) {
    await page.getByTestId(`act-${id}`).click();
    await clearPopups(page);
  }
  await expect(meter).toHaveAttribute('data-left', '0');
  await expect(page.getByTestId('act-vacation')).toBeDisabled();
  await expect(page.getByTestId('act-vacation')).toContainText('No free time left this year');
  // Career moves have their own allowance, untouched by hobbies.
  await page.getByTestId('tab-occupation').click();
  await expect(page.getByTestId('work-time')).toContainText('6 of 6 left');
  await page.getByTestId('tab-activities').click();
  await page.getByTestId('age-up').click();
  await clearPopups(page);
  await page.getByTestId('tab-activities').click();
  await expect(meter).not.toHaveAttribute('data-left', '0');
});

test('cosmetic surgery: pick the face you want, and take your chances', async ({ page }) => {
  await startSeeded(page, 6262, async (p) => {
    await p.getByTestId('f-country').selectOption('us');
  });
  await cheat(page, 'age set 30', 'money add 50000');
  await clearPopups(page);
  await page.getByTestId('tab-activities').click();
  await page.getByTestId('act-plastic_surgery').click();
  await expect(page.getByTestId('look-tab-hair')).toHaveCount(0);
  await page.getByTestId('look-tab-nose').click();
  const current = await page
    .getByTestId('look-builder')
    .locator('.look-option.active')
    .getAttribute('data-testid');
  const pick = current === 'look-opt-nose-roman' ? 'look-opt-nose-button' : 'look-opt-nose-roman';
  await page.getByTestId(pick).click();
  await page.getByTestId('opt-surgery-go').click();
  await expect(page.getByTestId('option-dialog')).toHaveCount(0);
  await expect(
    page.getByTestId('log-line').filter({ hasText: /mirror is kind|long nap|Complications/ }),
  ).toHaveCount(1);
});

test('toddlers have things to do: forts, questions, dancing, worms', async ({ page }) => {
  await startSeeded(page, 3434);
  await cheat(page, 'age set 3');
  await clearPopups(page);
  await page.getByTestId('tab-activities').click();
  for (const id of ['toddler_fort', 'toddler_why', 'toddler_dance', 'toddler_garden'])
    await expect(page.getByTestId(`act-${id}`)).toBeEnabled();
  await page.getByTestId('act-toddler_fort').click();
  await clearPopups(page);
  await expect(page.getByTestId('act-toddler_fort')).toBeDisabled();
});

test('a holiday: pick where, and the log says what happened there', async ({ page }) => {
  await startSeeded(page, 2525, async (p) => {
    await p.getByTestId('f-country').selectOption('us');
  });
  await cheat(page, 'age set 30', 'money add 50000');
  await clearPopups(page);
  await page.getByTestId('tab-activities').click();
  await page.getByTestId('act-vacation').click();
  await page.getByTestId('opt-dest-iceland').click();
  await clearPopups(page);
  await expect(page.getByTestId('log-line').filter({ hasText: '🇮🇸' })).toHaveCount(1);
});

test('writing a novel starts a thread you can follow in the left column', async ({ page }) => {
  await startSeeded(page, 2626);
  await cheat(page, 'age set 30', 'skill writing 60');
  await clearPopups(page);
  await page.getByTestId('tab-activities').click();
  await page.getByTestId('act-write_novel').click();
  await clearPopups(page);
  await expect(page.getByTestId('thread-novel')).toContainText('% of a draft');
});

test('activity categories fold away, and stay folded', async ({ page }) => {
  await startSeeded(page, 5160);
  await cheat(page, 'age set 30');
  await clearPopups(page);
  await page.getByTestId('tab-activities').click();
  await expect(page.getByTestId('crime-shoplifting')).toBeVisible();
  await page.getByTestId('fold-crime').click();
  await expect(page.getByTestId('crime-shoplifting')).toHaveCount(0);
  await expect(page.getByTestId('fold-crime')).toHaveAttribute('aria-expanded', 'false');
  await page.getByTestId('tab-assets').click();
  await page.getByTestId('tab-activities').click();
  await expect(page.getByTestId('crime-shoplifting')).toHaveCount(0);
  await page.getByTestId('fold-crime').click();
  await expect(page.getByTestId('crime-shoplifting')).toBeVisible();
});
