import { test, expect } from './fixtures';
import { clearPopups, startSeeded } from './helpers';

test('a prodigy with a focus: picked at the start, shown in skills, and costing free time', async ({
  page,
}) => {
  await startSeeded(page, 4242, async (p) => {
    await p.getByTestId('f-talent').selectOption('instrument');
    await p.getByTestId('f-prodigy').check();
    await p.getByTestId('gift-quick_study').check();
  });
  await expect(page.getByTestId('talent-instrument')).toContainText('🌟');
  // Age into childhood, then choose the focus.
  for (let i = 0; i < 5; i++) {
    await page.getByTestId('age-up').click();
    await clearPopups(page);
  }
  await page.getByTestId('tab-activities').click();
  const before = await page.getByTestId('free-time').getAttribute('data-left');
  await page.getByTestId('focus-select').selectOption('instrument');
  await expect(page.getByTestId('focus-instrument')).toBeVisible();
  await expect(page.getByTestId('free-time')).not.toHaveAttribute('data-left', before ?? '');
  const level = Number(await page.getByTestId('skill-instrument').textContent());
  await page.getByTestId('age-up').click();
  await clearPopups(page);
  await expect
    .poll(async () => Number(await page.getByTestId('skill-instrument').textContent()))
    .toBeGreaterThan(level + 20);
});
