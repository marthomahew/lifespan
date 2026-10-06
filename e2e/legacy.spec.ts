import { test, expect } from './fixtures';
import { cheat, clearPopups, startSeeded } from './helpers';

test('flow 10: death via cheats, obituary, continue as a child', async ({ page }) => {
  await startSeeded(page, 1010, async (p) => {
    await p.getByTestId('f-first').fill('Ottoline');
  });
  await cheat(page, 'age set 30', 'baby now', 'baby now', 'age set 55', 'deathbot');
  await expect(page.getByTestId('obituary-screen')).toBeVisible();
  await expect(page.getByTestId('obit-name')).toContainText('Ottoline');
  await expect(page.getByTestId('obit-cause')).toContainText('Cause of death');
  await expect(page.getByTestId('obit-cheated')).toBeVisible();
  const heir = page.getByTestId('heirs').locator('button').first();
  const label = (await heir.textContent()) ?? '';
  const first = label.replace('Continue as ', '').trim();
  await heir.click();
  await expect(page.getByTestId('game-screen')).toBeVisible();
  await expect(page.getByTestId('player-name')).toContainText(first);
  await clearPopups(page);
  // History carries over: the dynasty lists the late parent.
  await page.getByTestId('btn-dynasty').click();
  await expect(page.getByTestId('dynasty-row').first()).toContainText('Ottoline');
  await expect(page.getByTestId('dynasty-row').first().locator('.portrait')).toBeVisible();
  await expect(page.getByTestId('dynasty-current')).toBeVisible();
  await expect(page.getByTestId('legacy-score')).toContainText('Legacy score');
  await page.keyboard.press('Escape');
  await page.getByTestId('tab-relationships').click();
  await expect(page.locator('[data-testid^="npc-"]').filter({ hasText: 'Ottoline' })).toBeVisible();
});
