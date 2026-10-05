import { test, expect, type Page } from '../fixtures';

const age = async (p: Page): Promise<number> => {
  if (await p.getByTestId('obituary-screen').isVisible()) return 999;
  return Number(((await p.getByTestId('header-age').textContent()) ?? '').replace(/\D/g, ''));
};
async function popups(p: Page): Promise<void> {
  for (let i = 0; i < 20 && (await p.getByTestId('event-modal').isVisible()); i++) {
    const c = p.locator('button.choice:not([disabled])');
    await c.nth(Math.floor(Math.random() * (await c.count()))).click();
  }
}
async function act(p: Page, id: string, opt?: string): Promise<void> {
  await p.getByTestId('tab-activities').click();
  const b = p.getByTestId(`act-${id}`);
  if (!(await b.count()) || !(await b.isEnabled())) return;
  await b.click();
  if (opt) {
    if (await p.getByTestId(opt).count()) await p.getByTestId(opt).click();
    else await p.keyboard.press('Escape');
  }
  await popups(p);
}

test('a fully customized life, played through', async ({ page }) => {
  test.setTimeout(300_000);
  await page.goto('/');
  await page.getByTestId('btn-new-life').click();
  await page.getByTestId('f-first').fill('Noor');
  await page.getByTestId('f-last').fill('Haddad');
  await page.getByTestId('f-gender').selectOption('female');
  await page.getByTestId('f-attraction').selectOption('everyone');
  await page.getByTestId('f-tone-4').click();
  await page.getByTestId('f-hair-curly').click();
  await page.getByTestId('f-country').selectOption('ca');
  await page.getByTestId('f-city').selectOption({ index: 1 });
  await page.getByTestId('f-year').fill('1995');
  await page.getByTestId('f-wealth').selectOption('working');
  await page.getByTestId('f-parents').selectOption('father');
  await page.getByTestId('f-siblings').selectOption('1');
  await page.getByTestId('f-trait-funny').click();
  await page.getByTestId('f-trait-ambitious').click();
  await page.getByTestId('f-talent').selectOption('voice');
  await page.getByTestId('f-stat-smarts').fill('45');
  await page.getByTestId('f-seed').fill('31337');
  await page.screenshot({ path: 'reports/audit/custom-0-form.png' });
  await page.getByTestId('btn-begin').click();
  await expect(page.getByTestId('game-screen')).toBeVisible();
  await page.screenshot({ path: 'reports/audit/custom-1-born.png' });
  const shots: Record<number, string> = {
    8: 'child',
    16: 'teen-new-look',
    26: 'renamed',
    34: 'adult',
  };
  while ((await age(page)) < 35) {
    const a = await age(page);
    if (a >= 6 && a % 2 === 0) await act(page, 'practice_skill', 'opt-skill-voice');
    if (a === 16) await act(page, 'new_look', 'opt-hair-red');
    if (a === 25) {
      await page.getByTestId('tab-activities').click();
      if (await page.getByTestId('act-change_name').isEnabled()) {
        await page.getByTestId('act-change_name').click();
        await page.getByTestId('opt-last').fill('Haddad-Leclerc');
        await page.getByTestId('opt-name-go').click();
      }
    }
    if (shots[a]) await page.screenshot({ path: `reports/audit/custom-${a}-${shots[a]}.png` });
    await popups(page);
    if (await page.getByTestId('obituary-screen').isVisible()) break;
    await page.getByTestId('age-up').click();
    await popups(page);
  }
  await page.getByTestId('tab-relationships').click();
  await page.screenshot({ path: 'reports/audit/custom-35-people.png' });
});
