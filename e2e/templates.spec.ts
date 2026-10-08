import { test, expect } from './fixtures';

test('a New Life setup saves as a template, survives a reload, loads, renames and deletes', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByTestId('btn-new-life').click();
  await expect(page.getByTestId('templates-empty')).toBeVisible();
  await page.getByTestId('f-first').fill('Philippa');
  await page.getByTestId('f-country').selectOption('ca');
  await page.getByTestId('f-year').fill('1988');
  await page.getByTestId('f-wealth-rich').click();
  await page.getByTestId('f-seed').fill('777');
  await page.getByTestId('f-pace-challenging').click();

  await page.getByTestId('btn-save-template').click();
  await page.getByTestId('template-name').fill('Rich Canadian');
  await page.getByTestId('template-keep-seed').check();
  await page.getByTestId('template-save-ok').click();
  await expect(page.getByTestId('template-load-t1')).toHaveText('🔁 Rich Canadian');

  // Templates live on this computer: they are still there after a reload.
  await page.reload();
  await page.getByTestId('btn-new-life').click();
  await expect(page.getByTestId('f-first')).toHaveValue('');
  await page.getByTestId('template-load-t1').click();
  await expect(page.getByTestId('f-first')).toHaveValue('Philippa');
  await expect(page.getByTestId('f-country')).toHaveValue('ca');
  await expect(page.getByTestId('f-year')).toHaveValue('1988');
  await expect(page.getByTestId('f-seed')).toHaveValue('777');
  await expect(page.getByTestId('f-pace-challenging')).toHaveAttribute('aria-checked', 'true');

  await page.getByTestId('template-rename-t1').click();
  await page.getByTestId('template-rename-input-t1').fill('Canada, rich');
  await page.getByTestId('template-rename-ok-t1').click();
  await expect(page.getByTestId('template-load-t1')).toHaveText('🔁 Canada, rich');

  await page.getByTestId('btn-begin').click();
  await expect(page.getByTestId('player-name')).toContainText('Philippa');
  await expect(page.getByTestId('header-year')).toHaveText('1988');
  await expect(page.getByTestId('header')).toHaveAttribute('data-wealth', 'rich');
  // The life keeps the pace it was created with (Settings shows it for this life).
  await page.getByTestId('btn-settings').click();
  await expect(page.getByTestId('set-pace')).toHaveValue('challenging');

  await page.goto('/');
  await page.getByTestId('btn-new-life').click();
  await page.getByTestId('template-delete-t1').click();
  await expect(page.getByTestId('template-t1')).toHaveCount(0);
  await expect(page.getByTestId('templates-empty')).toBeVisible();
});
