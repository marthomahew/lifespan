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

test('the research career: lab, conference, and your town in depth on the Assets tab', async ({
  page,
}) => {
  await startSeeded(page, 5151, async (p) => {
    await p.getByTestId('f-country').selectOption('si');
    await p.getByTestId('f-city').selectOption('Slovenj Gradec');
  });
  await cheat(page, 'age set 32', 'job set professor', 'money add 50000');
  await clearPopups(page);
  await page.getByTestId('tab-occupation').click();
  await expect(page.getByTestId('science-lab')).toBeVisible();
  await expect(page.getByTestId('sci-hire-phd')).toBeDisabled();
  await page.getByTestId('sci-conference').click();
  await expect(page.getByTestId('sci-conference')).toBeDisabled();
  await page.getByTestId('tab-assets').click();
  await expect(page.getByTestId('town')).toContainText('Slovenj Gradec');
  await expect(page.getByTestId('town-region')).toContainText('Koroška');
  await expect(page.getByTestId('btn-move-town')).toBeVisible();
});
