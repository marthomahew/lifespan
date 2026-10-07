import { test, expect } from './fixtures';
import { answerPopup, clearPopups, headerAge, startSeeded } from './helpers';

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
  await expect(page.getByTestId('header-age')).toHaveText('Age 1');
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
  await page.getByTestId('f-gender-nonbinary').click();
  await page.getByTestId('f-attraction-everyone').click();
  await page.getByTestId('f-country').selectOption('ca');
  await page.getByTestId('f-city').selectOption({ index: 2 });
  const city = await page.getByTestId('f-city').inputValue();
  await page.getByTestId('f-year').fill('1988');
  await page.getByTestId('f-wealth-rich').click();
  await page.getByTestId('look-opt-skin-5').click();
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
  await expect(page.getByTestId('header-portrait')).toHaveAttribute('data-skin', '5');
  await expect(page.getByTestId('header')).toHaveAttribute('data-gender', 'nonbinary');
  await expect(page.getByTestId('header')).toHaveAttribute('data-attraction', 'everyone');
  await expect(page.getByTestId('header')).toHaveAttribute('data-wealth', 'rich');
});

test('achievements: a toast when earned and an Achievements screen', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('btn-new-life').click();
  await page.getByTestId('btn-random-life').click();
  await page.getByTestId('age-up').click();
  await expect(page.getByTestId('toast').filter({ hasText: 'First Words' })).toBeVisible();
  await clearPopups(page);
  await page.getByTestId('btn-achievements').click();
  await expect(page.getByTestId('achievements')).toBeVisible();
  await expect(page.getByTestId('ach-first_words')).toHaveAttribute('data-earned', 'true');
  await expect(page.getByTestId('ach-millionaire')).toHaveAttribute('data-earned', 'false');
  await page.keyboard.press('Escape');
  await expect(page.getByTestId('achievements')).toHaveCount(0);
});

test('custom life leaves gender and attraction to chance unless chosen', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('btn-new-life').click();
  await expect(page.getByTestId('f-gender-any')).toHaveAttribute('aria-checked', 'true');
  await expect(page.getByTestId('f-attraction-any')).toHaveAttribute('aria-checked', 'true');
  await page.getByTestId('btn-begin').click();
  await expect(page.getByTestId('game-screen')).toBeVisible();
});

test('full customization: look, family, talent, preview, and the life that follows', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByTestId('btn-new-life').click();
  await page.getByTestId('f-first').fill('Isolde');
  await page.getByTestId('f-last').fill('Marchetti');
  await page.getByTestId('f-gender-female').click();
  // The look builder: every option is drawn on your own face.
  await page.getByTestId('look-opt-skin-3').click();
  await page.getByTestId('look-freckles').check();
  await page.getByTestId('look-tab-hair').click();
  await page.getByTestId('look-opt-hair-braids').click();
  await page.getByTestId('look-opt-hairColor-red').click();
  await page.getByTestId('look-tab-glasses').click();
  await page.getByTestId('look-opt-glasses-cateye').click();
  await expect(page.getByTestId('look-portrait')).toHaveAttribute('data-hair', 'braids');
  await expect(
    page.getByTestId('look-portrait').locator('[data-layer="glasses"]').first(),
  ).toBeAttached();
  await expect(
    page.getByTestId('look-portrait').locator('[data-layer="freckles"]').first(),
  ).toBeAttached();
  await page.getByTestId('f-country').selectOption('fr');
  await page.getByTestId('f-parents-mother').click();
  await page.getByTestId('f-siblings-2').click();
  await page.getByTestId('f-talent').selectOption('instrument');
  await page.getByTestId('f-trait-creative').click();
  await expect(page.getByTestId('preview-name')).toHaveText('Isolde Marchetti');
  await expect(page.getByTestId('preview-summary')).toContainText('a single mother');
  await expect(page.getByTestId('preview-summary')).toContainText('2 siblings');
  await expect(page.getByTestId('preview-summary')).toContainText('A gift for instrument');
  // The preview shows them growing up and growing old.
  await expect(page.getByTestId('preview-age-30')).toHaveAttribute('data-hair', 'braids');
  await expect(page.getByTestId('preview-age-1').locator('[data-layer="glasses"]')).toHaveCount(0);
  // A section's dice changes that section only.
  await page.getByTestId('dice-stats').click();
  await expect(page.getByTestId('preview-name')).toHaveText('Isolde Marchetti');
  await page.getByTestId('f-seed').fill('8080');
  await page.getByTestId('btn-begin').click();
  await expect(page.getByTestId('game-screen')).toBeVisible();
  await expect(page.getByTestId('log-line').first()).toContainText('raised by your mother');
  await expect(page.getByTestId('talent-instrument')).toBeVisible();
  await expect(page.getByTestId('header-portrait')).toHaveAttribute('data-hair', 'braids');
  await page.getByTestId('tab-relationships').click();
  await expect(
    page.locator('[data-testid^="npc-"]').filter({ hasText: /brother|sister|sibling/ }),
  ).toHaveCount(2);
  // Family members have drawn faces too.
  await expect(page.locator('.npc-row .portrait').first()).toBeVisible();
});

test('roll everything fills every section', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('btn-new-life').click();
  await page.getByTestId('btn-roll-all').click();
  await expect(page.getByTestId('f-gender-any')).toHaveAttribute('aria-checked', 'false');
  await expect(page.getByTestId('f-parents-any')).toHaveAttribute('aria-checked', 'false');
  await page.getByTestId('btn-begin').click();
  await expect(page.getByTestId('game-screen')).toBeVisible();
});

test('a seed replays the same face unless you shape it', async ({ page }) => {
  const faces: string[] = [];
  for (let i = 0; i < 2; i++) {
    await startSeeded(page, 4242);
    const p = page.getByTestId('header-portrait');
    faces.push(`${await p.getAttribute('data-hair')}/${await p.getAttribute('data-skin')}`);
  }
  expect(faces[0]).toBe(faces[1]);
});
