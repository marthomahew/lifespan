import { test, expect, type Page } from '../fixtures';

const DIR = 'reports/audit';
const STAGES: [number, string][] = [
  [0, 'infant'],
  [5, 'child'],
  [14, 'teen'],
  [22, 'young-adult'],
  [35, 'adult'],
  [55, 'middle-age'],
  [70, 'senior'],
];

async function age(page: Page): Promise<number> {
  if (await page.getByTestId('obituary-screen').isVisible()) return 999;
  return Number(((await page.getByTestId('header-age').textContent()) ?? '').replace(/\D/g, ''));
}
async function popups(page: Page, pick: 'first' | 'random' = 'random'): Promise<void> {
  for (let i = 0; i < 20 && (await page.getByTestId('event-modal').isVisible()); i++) {
    const enabled = page.locator('button.choice:not([disabled])');
    const n = await enabled.count();
    await enabled.nth(pick === 'first' ? 0 : Math.floor(Math.random() * n)).click();
  }
}
async function ageBy(page: Page, years: number): Promise<void> {
  const target = (await age(page)) + years;
  for (let i = 0; i < years * 6 && (await age(page)) < target; i++) {
    if (await page.getByTestId('obituary-screen').isVisible()) return;
    await popups(page);
    if (await page.getByTestId('age-up').isEnabled()) await page.getByTestId('age-up').click();
  }
  await popups(page);
}
async function cheat(page: Page, cmd: string): Promise<void> {
  await page.keyboard.press('`');
  await page.getByTestId('console-input').fill(cmd);
  await page.getByTestId('console-input').press('Enter');
  await page.getByTestId('cheat-close').click();
  await popups(page);
}
async function activity(page: Page, id: string): Promise<void> {
  await page.getByTestId('tab-activities').click();
  const b = page.getByTestId(`act-${id}`);
  if ((await b.count()) && (await b.isEnabled())) await b.click();
  await popups(page);
}
async function shot(page: Page, life: string, stage: string): Promise<void> {
  await page.screenshot({ path: `${DIR}/${life}-${stage}.png`, animations: 'disabled' });
}
async function start(page: Page, first: string, seed: number): Promise<void> {
  await page.goto('/');
  await page.getByTestId('btn-new-life').click();
  await page.getByTestId('f-first').fill(first);
  await page.getByTestId('f-seed').fill(String(seed));
  await page.getByTestId('btn-begin').click();
  await expect(page.getByTestId('game-screen')).toBeVisible();
}

/** Age to each stage, doing the persona's yearly things on the way, screenshot at each. */
async function live(page: Page, life: string, yearly: (a: number) => Promise<void>): Promise<void> {
  for (const [at, stage] of STAGES) {
    while ((await age(page)) < at && !(await page.getByTestId('obituary-screen').isVisible())) {
      const a = await age(page);
      await yearly(a);
      // Cheats only to skip dull stretches.
      if (at - a > 8 && a >= 25) await cheat(page, `skip ${Math.min(10, at - a - 3)}`);
      else await ageBy(page, 1);
    }
    if (await page.getByTestId('obituary-screen').isVisible()) break;
    await shot(page, life, `${String(at).padStart(2, '0')}-${stage}`);
  }
  if (!(await page.getByTestId('obituary-screen').isVisible())) await cheat(page, 'deathbot');
  await expect(page.getByTestId('obituary-screen')).toBeVisible();
  await shot(page, life, '99-obituary');
}

test('ordinary life', async ({ page }) => {
  await start(page, 'Agnes', 7001);
  await live(page, 'ordinary', async (a) => {
    if (a >= 6 && a <= 17) await activity(page, 'study');
    if (a === 18) {
      await page.getByTestId('tab-occupation').click();
      const btn = page.getByTestId('btn-enroll');
      if (await btn.isEnabled()) await btn.click();
      await popups(page);
    }
    if (a >= 22 && a % 3 === 0) {
      await page.getByTestId('tab-occupation').click();
      await page.getByTestId('btn-job-listings').click();
      await page.getByTestId('jobs-eligible').check();
      const apply = page.locator('[data-testid^="apply-"]:not([disabled])').first();
      if (await apply.count()) await apply.click();
      else await page.keyboard.press('Escape');
      await popups(page);
    }
    if (a >= 20 && a % 4 === 0) await activity(page, 'find_date');
  });
});

test('criminal life', async ({ page }) => {
  await start(page, 'Rook', 7002);
  await live(page, 'criminal', async (a) => {
    if (a >= 16 && (await page.getByTestId('tab-activities').count())) {
      await page.getByTestId('tab-activities').click();
      const crimes = page.locator('[data-testid^="crime-"]:not([disabled])');
      if (await crimes.count())
        await crimes.nth(Math.floor(Math.random() * (await crimes.count()))).click();
      await popups(page);
      const prison = page.locator('[data-testid^="act-prison_"]:not([disabled])');
      if (await prison.count()) await prison.first().click();
      await popups(page);
    }
  });
});

test('military life', async ({ page }) => {
  await start(page, 'Sergei', 7003);
  await live(page, 'military', async (a) => {
    if (a === 18) {
      await page.getByTestId('tab-occupation').click();
      const enlist = page.getByTestId('btn-enlist');
      if (await enlist.isEnabled()) await enlist.click();
      await popups(page);
    }
    if (a === 28) {
      await page.getByTestId('tab-occupation').click();
      const d = page.getByTestId('btn-discharge');
      if (await d.count()) await d.click();
      await popups(page);
    }
    if (a === 29) {
      await page.getByTestId('tab-occupation').click();
      const btn = page.getByTestId('btn-enroll');
      if (await btn.isEnabled()) await btn.click();
      await popups(page);
    }
  });
});
