import { test, expect } from './fixtures';
import { ageTo, startSeeded } from './helpers';
import { readFileSync } from 'node:fs';

test('flow 9: save, reload, same life restored; export then import round trip', async ({
  page,
}) => {
  await startSeeded(page, 909, async (p) => {
    await p.getByTestId('f-first').fill('Saoirse');
  });
  await ageTo(page, 12);
  await page.getByTestId('btn-save').click();
  const name = await page.getByTestId('player-name').textContent();
  const year = await page.getByTestId('header-year').textContent();
  const lines = await page.getByTestId('log-line').count();

  await page.reload();
  await page.getByTestId('btn-continue').click();
  await expect(page.getByTestId('player-name')).toHaveText(name ?? '');
  await expect(page.getByTestId('header-year')).toHaveText(year ?? '');
  await expect(page.getByTestId('log-line')).toHaveCount(lines);

  // Export.
  await page.getByTestId('btn-lives').click();
  const row = page.locator('[data-testid^="life-"]').filter({ hasText: 'Saoirse' }).first();
  const downloadPromise = page.waitForEvent('download');
  await row.getByTestId('life-export').click();
  const download = await downloadPromise;
  const file = await download.path();
  const json = readFileSync(file, 'utf8');
  expect(JSON.parse(json).format).toBe('lifespan-save');

  // Delete, then import it back.
  await row.getByTestId('life-delete').click();
  await row.getByTestId('life-delete-confirm').click();
  await expect(page.locator('[data-testid^="life-"]').filter({ hasText: 'Saoirse' })).toHaveCount(
    0,
  );
  const chooserPromise = page.waitForEvent('filechooser');
  await page.getByTestId('btn-import').click();
  const chooser = await chooserPromise;
  await chooser.setFiles({
    name: 'life.json',
    mimeType: 'application/json',
    buffer: Buffer.from(json),
  });
  const restored = page.locator('[data-testid^="life-"]').filter({ hasText: 'Saoirse' }).first();
  await expect(restored).toBeVisible();
  await restored.getByTestId('life-load').click();
  await expect(page.getByTestId('player-name')).toHaveText(name ?? '');
  await expect(page.getByTestId('log-line')).toHaveCount(lines);
});

test('lives can be renamed and autosave keeps up each year', async ({ page }) => {
  await startSeeded(page, 910, async (p) => {
    await p.getByTestId('f-first').fill('Ignatius');
  });
  await ageTo(page, 3);
  await page.getByTestId('btn-lives').click();
  const row = page.locator('[data-testid^="life-"]').filter({ hasText: 'Ignatius' }).first();
  await expect(row).toContainText('age 3');
  await row.getByTestId('life-rename').click();
  await page.getByTestId('rename-input').fill('The Ignatius Years');
  await page.getByTestId('rename-save').click();
  await expect(
    page.getByTestId('life-name').filter({ hasText: 'The Ignatius Years' }),
  ).toBeVisible();
});
