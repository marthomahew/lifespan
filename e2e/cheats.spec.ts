import { test, expect } from './fixtures';
import { ageTo, headerAge, startSeeded } from './helpers';

test('flow 11: cheat panel via both shortcuts; a console command changes state; rewind works', async ({
  page,
}) => {
  await startSeeded(page, 1111);
  await expect(page.getByTestId('cheat-badge')).toHaveCount(0);

  await page.keyboard.press('`');
  await expect(page.getByTestId('cheat-panel')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByTestId('cheat-panel')).toHaveCount(0);
  await page.keyboard.press('Control+Shift+K');
  await expect(page.getByTestId('cheat-panel')).toBeVisible();

  // Every tab from SPEC §8.3.
  for (const t of [
    'character',
    'money',
    'relationships',
    'career',
    'health',
    'events',
    'world',
    'debug',
  ]) {
    await page.getByTestId(`cheat-tab-${t}`).click();
  }

  const input = page.getByTestId('console-input');
  await input.fill('money add 5000');
  await input.press('Enter');
  await expect(page.getByTestId('header-cash')).toContainText('5,000');
  await expect(page.getByTestId('console-output')).toContainText('Cash:');
  await expect(page.getByTestId('cheat-badge')).toBeVisible();

  // History with the up arrow.
  await input.press('ArrowUp');
  await expect(input).toHaveValue('money add 5000');
  await input.fill('');

  // Autocomplete with Tab.
  await input.fill('mon');
  await expect(page.getByTestId('console-suggestions')).toContainText('money');
  await input.press('Tab');
  await expect(input).toHaveValue('money ');
  await input.fill('help age');
  await input.press('Enter');
  await expect(page.getByTestId('console-output')).toContainText('age set {age}');

  await page.getByTestId('cheat-close').click();
  await ageTo(page, 6);
  await page.keyboard.press('`');
  await input.fill('rewind 3');
  await input.press('Enter');
  await expect(page.getByTestId('header-age')).toHaveText('Age 3');
  await expect(page.getByTestId('console-output')).toContainText('Rewound to age 3');
});

test('GUI cheat forms use the registry: set a stat, toggle, age set', async ({ page }) => {
  await startSeeded(page, 1112);
  await page.keyboard.press('`');
  await page.getByTestId('cheat-stat.set-stat').selectOption('health');
  await page.getByTestId('cheat-stat.set-value').fill('17');
  await page.getByTestId('cheat-stat.set-run').click();
  await expect(page.getByTestId('stat-health-value')).toHaveText('17');
  await page.getByTestId('cheat-tab-world').click();
  await page.getByTestId('cheat-immortal-run').click();
  await expect(page.getByTestId('cheat-immortal')).toContainText('ON');
  await page.getByTestId('cheat-age.set-age').fill('18');
  await page.getByTestId('cheat-age.set-run').click();
  expect(await headerAge(page)).toBe(18);
});

test('debug tab: hidden stats overlay, event odds, validated JSON editing', async ({ page }) => {
  await startSeeded(page, 1113);
  await page.keyboard.press('`');
  await page.getByTestId('cheat-tab-debug').click();
  await page.getByTestId('debug-hidden-stats').check();
  await expect(page.getByTestId('hidden-stats')).toBeVisible();
  await expect(page.getByTestId('hidden-karma')).toBeVisible();
  await expect(page.getByTestId('debug-odds')).toBeVisible();

  await page.getByTestId('debug-json-open').click();
  const area = page.getByTestId('debug-json');
  const json = await area.inputValue();
  await area.fill(json.replace(/"first": "[^"]*"/, '"first": "Edited"'));
  await page.getByTestId('debug-json-apply').click();
  await expect(page.getByTestId('player-name')).toContainText('Edited');

  await page.getByTestId('debug-json-open').click();
  await area.fill('{ "broken": true ');
  await page.getByTestId('debug-json-apply').click();
  await expect(page.getByTestId('debug-json-error')).toBeVisible();
  await expect(page.getByTestId('player-name')).toContainText('Edited');
});

test('events tab lists every event with eligibility and fires one', async ({ page }) => {
  await startSeeded(page, 1114);
  await page.keyboard.press('`');
  await page.getByTestId('cheat-tab-events').click();
  await page.getByTestId('event-search').fill('crayon');
  await expect(page.getByTestId('ev-child_crayon_wall')).toContainText('ages 3–6');
  await page.getByTestId('ev-force-child_crayon_wall').click();
  await page.getByTestId('cheat-close').click();
  await expect(page.getByTestId('event-modal')).toBeVisible();
});
