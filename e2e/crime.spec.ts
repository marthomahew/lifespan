import { test, expect } from './fixtures';
import { cheat, clearPopups, startSeeded } from './helpers';

test('flow 7: commit a crime; the arrest, trial, and sentence or acquittal path completes', async ({
  page,
}) => {
  await startSeeded(page, 707);
  await cheat(page, 'age set 25', 'money add 100000');
  await clearPopups(page);
  await page.getByTestId('tab-activities').click();
  const modal = page.getByTestId('event-modal');
  for (let i = 0; i < 40 && !(await modal.isVisible()); i++) {
    await page.getByTestId('crime-armed_robbery').click();
  }
  await expect(modal).toBeVisible();
  await expect(page.getByTestId('event-text')).toContainText('arrested');
  await page.locator('[data-choice-id="wait"]').click();
  await page.getByTestId('result-continue').click();
  await expect(page.getByTestId('event-text')).toContainText('lawyer');
  await page.locator('[data-choice-id="public"]').click();
  await page.getByTestId('result-continue').click();
  await expect(page.getByTestId('event-text')).toContainText('plea');
  await page.locator('[data-choice-id="trial"]').click();
  await page.getByTestId('result-continue').click();
  await expect(modal).toHaveCount(0);
  const verdict = page
    .getByTestId('log-line')
    .filter({ hasText: /Not guilty|Guilty\. The sentence is|Guilty\. The judge gives you/ });
  await expect(verdict).toHaveCount(1);
  await page.getByTestId('tab-occupation').click();
  await expect(page.getByTestId('criminal-record')).toContainText('Armed robbery');
});
