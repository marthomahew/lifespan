import { test, type Page } from '@playwright/test';

const SIZES = [
  { name: '1280', width: 1280, height: 820 },
  { name: '1024', width: 1024, height: 700 },
] as const;
const THEMES = ['light', 'dark'] as const;
const DIR = 'reports/screenshots';

async function setTheme(page: Page, theme: string): Promise<void> {
  await page.evaluate((t) => {
    localStorage.setItem('lifespan.settings', JSON.stringify({ theme: t }));
  }, theme);
}

async function newGame(page: Page): Promise<void> {
  await page.getByTestId('btn-new-life').click();
  await page.getByTestId('f-first').fill('Marguerite');
  await page.getByTestId('f-last').fill('Okonkwo-Hale');
  await page.getByTestId('f-seed').fill('4242');
  await page.getByTestId('btn-begin').click();
  await page.getByTestId('game-screen').waitFor();
}

async function ageTo(page: Page, age: number): Promise<void> {
  for (let i = 0; i < 400; i++) {
    const txt = (await page.getByTestId('header-age').textContent()) ?? '';
    if (Number(txt.replace(/\D/g, '')) >= age) return;
    if (await page.getByTestId('event-modal').isVisible())
      await page.getByTestId('choice-1').click();
    else await page.getByTestId('age-up').click();
  }
}

for (const size of SIZES) {
  for (const theme of THEMES) {
    test(`screens ${size.name} ${theme}`, async ({ page }) => {
      await page.setViewportSize({ width: size.width, height: size.height });
      await page.goto('/');
      await setTheme(page, theme);
      await page.reload();
      const shot = (name: string): Promise<Buffer> =>
        page.screenshot({ path: `${DIR}/${name}-${theme}-${size.name}.png` });
      await shot('01-start');
      await page.getByTestId('btn-new-life').click();
      await shot('02-new-life');
      await page.getByTestId('btn-back').click();
      await newGame(page);
      await shot('03-main-newborn');
      await ageTo(page, 9);
      if (await page.getByTestId('event-modal').isVisible()) await shot('04-event');
      await ageTo(page, 24);
      if (await page.getByTestId('event-modal').isVisible())
        await page.getByTestId('choice-1').click();
      await shot('05-main-adult');
      await page.getByTestId('tab-relationships').click();
      await shot('06-relationships');
      await page.keyboard.press('?');
      await shot('07-help');
      await page.keyboard.press('Escape');
      await page.getByTestId('btn-settings').click();
      await shot('08-settings');
      await page.getByTestId('btn-back').click();
      await page.getByTestId('btn-lives').click();
      await page.getByTestId('lives-screen').waitFor();
      await shot('09-lives');
    });
  }
}
