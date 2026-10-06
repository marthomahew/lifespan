import { test, expect } from './fixtures';
import { cheat, clearPopups, startSeeded } from './helpers';

test('adopt a dog, name it, play and walk, and say goodbye', async ({ page }) => {
  await startSeeded(page, 7171, async (p) => {
    await p.getByTestId('f-country').selectOption('us');
  });
  await cheat(page, 'age set 28', 'money add 20000');
  await clearPopups(page);
  await page.getByTestId('tab-activities').click();
  await page.getByTestId('act-adopt_pet').click();
  await expect(page.getByTestId('opt-pet-horse')).toBeVisible();
  await page.getByTestId('opt-pet-dog').click();
  await page.getByTestId('opt-pet-name').fill('Biscuit');
  await page.getByTestId('opt-pet-go').click();
  await clearPopups(page);
  await expect(page.getByTestId('log-line').filter({ hasText: 'bring home Biscuit' })).toHaveCount(
    1,
  );

  await page.getByTestId('tab-relationships').click();
  const row = page.getByTestId('pet-list').getByRole('button', { name: /Biscuit/ });
  await expect(row).toContainText('dog');
  await row.click();
  await expect(page.getByTestId('pet-panel')).toBeVisible();
  await expect(page.getByTestId('pet-portrait')).toHaveAttribute('data-kind', 'dog');
  const bond = Number(await page.getByTestId('pet-bond').getAttribute('data-value'));
  await page.getByTestId('pet-act-play').click();
  await expect(page.getByTestId('pet-last')).toBeVisible();
  await page.getByTestId('pet-act-walk').click();
  expect(Number(await page.getByTestId('pet-bond').getAttribute('data-value'))).toBeGreaterThan(
    bond,
  );
  await expect(page.getByTestId('pet-bond-delta')).toContainText('+');
  await expect(page.getByTestId('pet-act-play')).toBeDisabled();
  await page.getByTestId('pet-act-rehome').click();
  await page.getByTestId('pet-rehome-yes').click();
  await expect(page.getByTestId('pet-panel')).toContainText('rehomed');
  await page.keyboard.press('Escape');
  await expect(row).toContainText('rehomed');
});

test('a child asks for a pet: only a small one, and the parents pay', async ({ page }) => {
  await startSeeded(page, 7272);
  await cheat(page, 'age set 9');
  await clearPopups(page);
  await page.getByTestId('tab-activities').click();
  await page.getByTestId('act-adopt_pet').click();
  await expect(page.getByTestId('opt-pet-horse')).toBeDisabled();
  await expect(page.getByTestId('opt-pet-hamster')).toContainText('Parents pay');
  await page.getByTestId('opt-pet-hamster').click();
  await page.getByTestId('opt-pet-go').click();
  await clearPopups(page);
  await page.getByTestId('tab-relationships').click();
  await expect(page.getByTestId('pet-list')).toContainText('hamster');
});
