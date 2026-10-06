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
      await page.locator('button.choice:not([disabled])').first().click();
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
        page.screenshot({
          path: `${DIR}/${name}-${theme}-${size.name}.png`,
          animations: 'disabled',
        });
      await shot('01-start');
      await page.getByTestId('btn-new-life').click();
      await shot('02-new-life');
      await page.getByTestId('look-tab-hair').click();
      await page.getByTestId('look-portrait').scrollIntoViewIfNeeded();
      await shot('28-look-builder');
      await page.getByTestId('btn-challenges').click();
      await page.getByTestId('challenge-picker').waitFor();
      await shot('27-challenges');
      await page.keyboard.press('Escape');
      await page.getByTestId('btn-back').click();
      await newGame(page);
      await shot('03-main-newborn');
      await ageTo(page, 9);
      if (await page.getByTestId('event-modal').isVisible()) {
        await shot('04-event');
        await page.locator('button.choice:not([disabled])').first().click();
        await page.getByTestId('event-result').waitFor();
        await shot('26-result');
      }
      await ageTo(page, 24);
      while (await page.getByTestId('event-modal').isVisible())
        await page.locator('button.choice:not([disabled])').first().click();
      await page.getByTestId('btn-choose-goal').click();
      await page.getByTestId('goal-picker').waitFor();
      await shot('25-goals');
      await page.getByTestId('pick-goal-own_home').click();
      await page.getByTestId('btn-choose-goal').click();
      await page.getByTestId('pick-goal-marry').click();
      await shot('05-main-adult');
      await page.getByTestId('tab-relationships').click();
      await shot('06-relationships');
      await page.locator('[data-testid^="npc-"]').first().click();
      await page.getByTestId('npc-panel').waitFor();
      await shot('10-npc-panel');
      await page.keyboard.press('Escape');
      await page.getByTestId('btn-family-tree').click();
      await shot('11-family-tree');
      await page.keyboard.press('Escape');
      await page.getByTestId('tab-activities').click();
      await shot('12-activities');
      await page.getByTestId('act-new_look').click();
      await page.getByTestId('look-builder').waitFor();
      await shot('29-makeover');
      await page.keyboard.press('Escape');
      await page.getByTestId('act-adopt_pet').click();
      await page.getByTestId('opt-pet-go').waitFor();
      await shot('30-adopt');
      await page.getByTestId('opt-pet-dog').click();
      await page.getByTestId('opt-pet-name').fill('Biscuit');
      await page.getByTestId('opt-pet-go').click();
      while (await page.getByTestId('event-modal').isVisible())
        await page.locator('button.choice:not([disabled])').first().click();
      await page.getByTestId('tab-relationships').click();
      await page.getByTestId('pet-list').getByRole('button').first().click();
      await page.getByTestId('pet-act-play').click();
      await shot('31-pet');
      await page.keyboard.press('Escape');
      await page.getByTestId('tab-occupation').click();
      await shot('13-occupation');
      await page.getByTestId('btn-job-listings').click();
      await page.getByTestId('job-listings').waitFor();
      await shot('14-job-listings');
      await page.keyboard.press('Escape');
      await page.getByTestId('tab-assets').click();
      await shot('15-assets');
      if (await page.getByTestId('buy-0').count()) {
        await page.getByTestId('buy-0').click();
        await page.getByTestId('buy-dialog').waitFor();
        await shot('24-buy-home');
        await page.keyboard.press('Escape');
      }
      await page.getByTestId('btn-finances').click();
      await page.getByTestId('finances').waitFor();
      await shot('16-finances');
      await page.keyboard.press('Escape');
      await page.keyboard.press('?');
      await shot('07-help');
      await page.keyboard.press('Escape');
      await page.keyboard.press('`');
      await page.getByTestId('cheat-panel').waitFor();
      await shot('17-cheats');
      await page.getByTestId('cheat-tab-events').click();
      await shot('18-cheats-events');
      await page.getByTestId('cheat-close').click();
      await page.keyboard.press('Control+k');
      await page.getByTestId('palette-input').fill('date');
      await shot('19-palette');
      await page.keyboard.press('Escape');
      await page.getByTestId('btn-achievements').click();
      await shot('20-achievements');
      await page.keyboard.press('Escape');
      await page.getByTestId('btn-timeline').click();
      await shot('21-timeline');
      await page.keyboard.press('Escape');
      await page.getByTestId('btn-settings').click();
      await shot('08-settings');
      await page.getByTestId('btn-back').click();
      await page.getByTestId('btn-lives').click();
      await page.getByTestId('lives-screen').waitFor();
      await shot('09-lives');
      await page.getByTestId('btn-back').click();
      // The casino table, then a night in the prison yard.
      await page.getByTestId('tab-activities').click();
      await page.getByTestId('act-casino').click();
      await page.getByTestId('bj-bet-1').click();
      await shot('32-blackjack');
      await page.keyboard.press('Escape');
      await page.keyboard.press('`');
      await page.getByTestId('console-input').fill('prison send 4');
      await page.getByTestId('console-input').press('Enter');
      await page.getByTestId('cheat-close').click();
      while (await page.getByTestId('event-modal').isVisible())
        await page.locator('button.choice:not([disabled])').first().click();
      await page.getByTestId('tab-activities').click();
      await page.getByTestId('act-prison_escape').click();
      await page.keyboard.press('ArrowRight');
      await shot('33-escape');
      await page.keyboard.press('Escape');
      await page.keyboard.press('`');
      for (const cmd of ['prison release', 'baby now', 'deathbot']) {
        await page.getByTestId('console-input').fill(cmd);
        await page.getByTestId('console-input').press('Enter');
      }
      await page.getByTestId('obituary-screen').waitFor();
      await page.getByTestId('cheat-close').click();
      await shot('22-obituary');
      await page.getByTestId('btn-obit-dynasty').click();
      await shot('23-dynasty');
    });
  }
}
