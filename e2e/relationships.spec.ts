import { test, expect } from './fixtures';
import { answerPopup, startSeeded } from './helpers';
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
  let after = before;
  let done = 0;
  for (const id of ['insult', 'argue', 'prank', 'apologize']) {
    await page.getByTestId(`int-${id}`).click();
    done++;
    await expect(page.getByTestId('memory-line')).toHaveCount(Math.min(30, memories + done));
    after = Number(await page.getByTestId('npc-rel-value').textContent());
    if (after !== before) break;
  }
  expect(after).not.toBe(before);
  await expect(page.getByTestId('npc-rel-bar')).toHaveAttribute('data-value', String(after));
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
  await expect(page.getByTestId('fact-relationship')).toContainText('Seeing');
  await page.getByTestId('tab-relationships').click();
  await page
    .locator('[data-testid^="npc-"]')
    .filter({ hasText: /boyfriend|girlfriend|partner/ })
    .first()
    .click();
  await page.getByTestId('int-propose').click();
  await expect(page.getByTestId('fact-relationship')).toContainText('Engaged');
  await page.getByTestId('int-plan_wedding').click();
  await page.getByTestId('wedding-size').selectOption('medium');
  await page.getByTestId('wedding-prenup').check();
  await page.getByTestId('wedding-go').click();
  await expect(page.getByTestId('fact-relationship')).toContainText('Married');
});
