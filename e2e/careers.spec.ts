import { test, expect } from './fixtures';
import { cheat, clearPopups, startSeeded } from './helpers';

test('flow 4: cheat to 18, apply for a job, get hired, see it under Occupation', async ({
  page,
}) => {
  await startSeeded(page, 404);
  await cheat(page, 'age set 18', 'forcesuccess on');
  await clearPopups(page);
  await page.getByTestId('tab-occupation').click();
  await page.getByTestId('btn-job-listings').click();
  await expect(page.getByTestId('job-listings')).toBeVisible();
  await page.getByTestId('jobs-field').selectOption('retail');
  await page.getByTestId('jobs-eligible').check();
  await expect(page.getByTestId('job-retail_associate')).toBeVisible();
  await page.getByTestId('apply-retail_associate').click();
  // The interview popup.
  await expect(page.getByTestId('event-modal')).toBeVisible();
  await page.locator('button.choice:not([disabled])').first().click();
  await clearPopups(page);
  await expect(page.getByTestId('current-job')).toBeVisible();
  await expect(page.getByTestId('job-title')).not.toBeEmpty();
  await expect(page.getByTestId('occupation-now')).toHaveText(
    (await page.getByTestId('job-title').textContent()) ?? '',
  );
  await expect(page.getByTestId('fact-occupation')).not.toContainText('Unemployed');
});

test('university: enroll from the Occupation tab', async ({ page }) => {
  await startSeeded(page, 405);
  await cheat(page, 'age set 18', 'forcesuccess on', 'money add 500000', 'grade 85');
  await clearPopups(page);
  await page.getByTestId('tab-occupation').click();
  await page.getByTestId('enroll-kind').selectOption('university');
  await page.getByTestId('enroll-program').selectOption('history');
  await page.getByTestId('btn-enroll').click();
  await expect(page.getByTestId('enrollment')).toContainText('History');
  await expect(page.getByTestId('occupation-now')).toHaveText('At university');
});

test('military and music from the Occupation tab', async ({ page }) => {
  await startSeeded(page, 406);
  await cheat(page, 'age set 19', 'skill instrument 40');
  await clearPopups(page);
  await page.getByTestId('tab-occupation').click();
  await page.getByTestId('music-busk').click();
  await expect(page.getByTestId('music-section')).toContainText('Busker');
  await page.getByTestId('enlist-open').click();
  await page.getByTestId('enlist-branch').selectOption('Navy');
  await page.getByTestId('enlist-specialty').selectOption('medical');
  await page.getByTestId('btn-enlist').click();
  await expect(page.getByTestId('military-rank')).toContainText('Private');
  await expect(page.getByTestId('occupation-now')).toContainText('Navy');
});

test('perks say what they do, on listings and on the current job', async ({ page }) => {
  await startSeeded(page, 404);
  await cheat(page, 'age set 30', 'job set school_teacher');
  await clearPopups(page);
  await page.getByTestId('tab-occupation').click();
  await expect(page.getByTestId('job-perks')).toContainText('summers off (less job stress)');
  await expect(page.getByTestId('job-perks')).toContainText('pension (pension +25%)');
});

test('school: the average is shown, and a child can study harder from the Occupation tab', async ({
  page,
}) => {
  await startSeeded(page, 4747);
  await cheat(page, 'age set 13');
  await clearPopups(page);
  await page.getByTestId('tab-occupation').click();
  await expect(page.getByTestId('school-grade')).toContainText(/average \d+; universities want 70/);
  await page.getByTestId('btn-study').click();
  await expect(page.getByTestId('act-feedback')).toBeVisible();
  await expect(page.getByTestId('btn-study')).toBeDisabled();
});
