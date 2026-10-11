import { test, expect } from './fixtures';
import { cheat, clearPopups, startSeeded } from './helpers';

test('research: a project on the bench, a grant proposal waiting, Slovenian funders and the institute', async ({
  page,
}) => {
  await startSeeded(page, 5150, async (p) => {
    await p.getByTestId('f-country').selectOption('si');
  });
  await cheat(page, 'age set 30', 'job set research_scientist');
  await clearPopups(page);
  await page.getByTestId('tab-occupation').click();
  await expect(page.getByTestId('science')).toBeVisible();
  await page.getByTestId('sci-research').click();
  await expect(page.getByTestId('science-project')).toBeVisible();
  await expect(page.getByTestId('science-record')).toContainText('Jožef Stefan Institute');
  await expect(page.getByTestId('science-funders')).toContainText('your own institution');
  await expect(page.getByTestId('science-funders')).toContainText(/Slovenia/);
  await page.getByTestId('sci-apply-seed').click();
  await expect(page.getByTestId('science-pending')).toContainText('your own institution');
  await expect(page.getByTestId('sci-apply-seed')).toBeDisabled();
});
