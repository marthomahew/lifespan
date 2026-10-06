import { test, expect } from './fixtures';
import { answerPopup, clearPopups, startSeeded } from './helpers';
import type { Page } from '@playwright/test';

async function consoleCmd(page: Page, cmd: string): Promise<void> {
  await page.keyboard.press('`');
  await page.getByTestId('console-input').fill(cmd);
  await page.getByTestId('console-input').press('Enter');
  await page.getByTestId('cheat-close').click();
}

test('flow 5: an interaction changes the relationship bar and adds a memory line', async ({
  page,
}) => {
  await startSeeded(page, 505);
  await consoleCmd(page, 'age set 20');
  await answerPopup(page);
  await page.getByTestId('tab-relationships').click();
  const mother = page.locator('[data-testid^="npc-"]').filter({ hasText: 'mother' }).first();
  await mother.click();
  await expect(page.getByTestId('npc-panel')).toBeVisible();
  const before = Number(await page.getByTestId('npc-rel-value').textContent());
  const memories = await page.getByTestId('memory-line').count();
  // Interactions until the bar moves (a single roll can land on +0).
  let done = 0;
  for (const id of ['insult', 'argue', 'prank', 'apologize']) {
    await page.getByTestId(`int-${id}`).click();
    done++;
    await expect(page.getByTestId('memory-line')).toHaveCount(Math.min(30, memories + done));
    const after = Number(await page.getByTestId('npc-rel-value').textContent());
    if (after !== before) break;
  }
  // Reads right after a click can be a frame early; wait for the bar and the number to agree.
  await expect
    .poll(async () => {
      const v = (await page.getByTestId('npc-rel-value').textContent()) ?? '';
      const bar = (await page.getByTestId('npc-rel-bar').getAttribute('data-value')) ?? '';
      return v === bar && Number(v) !== before;
    })
    .toBe(true);
  await expect(page.getByTestId('npc-last-log')).not.toBeEmpty();
  await page.keyboard.press('Escape');
  await expect(page.getByTestId('npc-panel')).toHaveCount(0);
});

test('flow 13: the family tree opens and clicking a node opens that NPC', async ({ page }) => {
  await startSeeded(page, 1313);
  await consoleCmd(page, 'age set 30');
  await consoleCmd(page, 'spawn spouse');
  await consoleCmd(page, 'baby now');
  await page.getByTestId('tab-relationships').click();
  await page.getByTestId('btn-family-tree').click();
  await expect(page.getByTestId('family-tree')).toBeVisible();
  await expect(page.getByTestId('tree-gen--1')).toBeVisible();
  await expect(page.getByTestId('tree-gen-1')).toBeVisible();
  // Lines join children to parents: you to each parent, your child to you.
  const lines = page.getByTestId('tree-lines').locator('path');
  expect(await lines.count()).toBeGreaterThanOrEqual(3);
  const child = page.getByTestId('tree-gen-1').locator('button').first();
  const childId = (await child.getAttribute('data-node')) ?? '';
  await expect(page.getByTestId(`tree-line-${childId}-0`)).toHaveCount(1);
  await child.hover();
  await expect(page.getByTestId(`tree-line-${childId}-0`)).toHaveClass(/lit/);
  const node = page.getByTestId('tree-gen--1').locator('button').first();
  const name = (await node.locator('.tree-name').textContent()) ?? '';
  await node.click();
  await expect(page.getByTestId('npc-panel')).toBeVisible();
  await expect(page.getByTestId('npc-panel').locator('h2')).toHaveText(name);
});

test('activities: find a date, then propose and plan the wedding from the NPC panel', async ({
  page,
}) => {
  await startSeeded(page, 2121);
  await consoleCmd(page, 'age set 28');
  await consoleCmd(page, 'forcesuccess on');
  await consoleCmd(page, 'money add 1000000');
  await page.getByTestId('tab-activities').click();
  await page.getByTestId('act-find_date').click();
  // Three people to choose from, each with a face and what they want from life.
  await expect(page.getByTestId('date-2')).toBeVisible();
  await expect(page.getByTestId('date-0').locator('.portrait')).toBeVisible();
  // Ask out someone open to marriage, for the wedding below.
  let pick = 0;
  for (let i = 0; i < 3; i++)
    if ((await page.getByTestId(`date-${i}`).textContent())?.includes('open to marriage')) {
      pick = i;
      break;
    }
  const name =
    (await page.getByTestId(`date-${pick}`).locator('strong').textContent())?.split(' ')[0] ?? '';
  await page.getByTestId(`date-pick-${pick}`).click();
  await expect(page.getByTestId('fact-relationship')).toContainText('Seeing');
  await expect(page.getByTestId('fact-relationship')).toContainText(name);
  await page.getByTestId('tab-relationships').click();
  const partnerRow = page
    .locator('[data-testid^="npc-"]')
    .filter({ hasText: /boyfriend|girlfriend|partner/ })
    .first();
  // Proposals wait until things are serious: age up a few years, keeping the relationship warm.
  await partnerRow.click();
  // What they want from life, as the date card said.
  await expect(page.getByTestId('npc-wishes')).toContainText('open to marriage');
  await page.keyboard.press('Escape');
  for (let i = 0; i < 8; i++) {
    await partnerRow.click();
    if (await page.getByTestId('int-propose').isVisible()) break;
    if (await page.getByTestId('int-date_night').isEnabled())
      await page.getByTestId('int-date_night').click();
    await page.keyboard.press('Escape');
    await page.getByTestId('age-up').click();
    await clearPopups(page);
  }
  await page.getByTestId('int-propose').click();
  await expect(page.getByTestId('fact-relationship')).toContainText('Engaged');
  await page.getByTestId('int-plan_wedding').click();
  await page.getByTestId('wedding-size').selectOption('medium');
  await page.getByTestId('wedding-prenup').check();
  await page.getByTestId('wedding-go').click();
  await expect(page.getByTestId('fact-relationship')).toContainText('Married');
});

test('a gift can be money or something you own', async ({ page }) => {
  await startSeeded(page, 506);
  await consoleCmd(page, 'age set 25');
  await clearPopups(page);
  await consoleCmd(page, 'money add 5000');
  await consoleCmd(page, 'asset spawn item:gold_watch');
  await page.getByTestId('tab-relationships').click();
  await page.locator('[data-testid^="npc-"]').filter({ hasText: 'mother' }).first().click();
  await page.getByTestId('int-gift').click();
  await expect(page.getByTestId('gift-form')).toBeVisible();
  await page.getByTestId('gift-kind').selectOption('money');
  await page.getByTestId('gift-amount').fill('1200');
  await page.getByTestId('gift-go').click();
  await expect(page.getByTestId('gift-form')).toHaveCount(0);
  await page.keyboard.press('Escape');
  await expect(page.getByTestId('log-line').filter({ hasText: /You give .*1,200/ })).toHaveCount(1);
  // The watch goes to someone else.
  await page.locator('[data-testid^="npc-"]').filter({ hasText: 'father' }).first().click();
  await page.getByTestId('int-gift').click();
  await page.getByTestId('gift-kind').selectOption({ index: 2 });
  await page.getByTestId('gift-go').click();
  await page.keyboard.press('Escape');
  await expect(page.getByTestId('log-line').filter({ hasText: /your gold watch/i })).toHaveCount(1);
});
