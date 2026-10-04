import { test as base, expect, type Page } from '@playwright/test';

/**
 * Every spec uses this `test`: any console error or page error fails it.
 */
export const test = base.extend<{ errors: string[] }>({
  errors: [
    async ({ page }, use) => {
      const errors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') errors.push(`console: ${msg.text()}`);
      });
      page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
      await use(errors);
      expect(errors, 'browser console errors / page errors').toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };
export type { Page };
