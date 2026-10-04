import { test, expect } from './fixtures';
import { answerPopup, headerAge } from './helpers';

test('flow 1: new random life, age to 5 with the button and Space', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('start-screen')).toBeVisible();
  await page.getByTestId('btn-new-life').click();
  await page.getByTestId('btn-random-life').click();
  await expect(page.getByTestId('game-screen')).toBeVisible();
  expect(await headerAge(page)).toBe(0);
  const year0 = Number(await page.getByTestId('header-year').textContent());
  await expect(page.getByTestId('header-cash')).toBeVisible();

  await page.getByTestId('age-up').click();
  expect(await headerAge(page)).toBe(1);
  expect(Number(await page.getByTestId('header-year').textContent())).toBe(year0 + 1);

  for (let i = 0; i < 50 && (await headerAge(page)) < 5; i++) {
    if (await answerPopup(page)) continue;
    await page.keyboard.press('Space');
  }
  expect(await headerAge(page)).toBe(5);
  // The log groups by age with a sticky header per year.
  await expect(page.getByTestId('log-age-0')).toBeVisible();
  await expect(page.getByTestId('log-age-0').locator('h4')).toHaveCSS('position', 'sticky');
});

test('flow 2: custom life with every field set', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('btn-new-life').click();
  await page.getByTestId('f-first').fill('Philippa');
  await page.getByTestId('f-last').fill('Drummond');
  await page.getByTestId('f-gender').selectOption('nonbinary');
  await page.getByTestId('f-attraction').selectOption('everyone');
  await page.getByTestId('f-country').selectOption('ca');
  await page.getByTestId('f-city').selectOption({ index: 2 });
  const city = await page.getByTestId('f-city').inputValue();
  await page.getByTestId('f-year').fill('1988');
  await page.getByTestId('f-wealth').selectOption('rich');
  await page.getByTestId('f-tone-4').click();
  await page.getByTestId('f-trait-bookish').click();
  await page.getByTestId('f-trait-funny').click();
  await page.getByTestId('f-trait-calm').click();
  for (const [k, v] of [
    ['happiness', '12'],
    ['health', '34'],
    ['smarts', '56'],
    ['looks', '78'],
  ] as const) {
    await page.getByTestId(`f-stat-${k}`).fill(v);
  }
  await page.getByTestId('f-seed').fill('777');
  await page.getByTestId('btn-begin').click();

  await expect(page.getByTestId('player-name')).toHaveText('Philippa Drummond');
  await expect(page.getByTestId('header-place')).toContainText(`${city}, Canada`);
  await expect(page.getByTestId('header-year')).toHaveText('1988');
  await expect(page.getByTestId('trait-bookish')).toBeVisible();
  await expect(page.getByTestId('trait-funny')).toBeVisible();
  await expect(page.getByTestId('trait-calm')).toBeVisible();
  await expect(page.getByTestId('stat-happiness-value')).toHaveText('12');
  await expect(page.getByTestId('stat-health-value')).toHaveText('34');
  await expect(page.getByTestId('stat-smarts-value')).toHaveText('56');
  await expect(page.getByTestId('stat-looks-value')).toHaveText('78');
  await expect(page.getByTestId('header').locator('.avatar')).toContainText('🏾');
});
