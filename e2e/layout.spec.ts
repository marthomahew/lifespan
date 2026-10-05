import { test, expect } from './fixtures';
import { startSeeded } from './helpers';

for (const size of [
  { width: 1280, height: 820 },
  { width: 1024, height: 700 },
]) {
  test(`main screen layout at ${size.width}×${size.height}`, async ({ page }) => {
    await page.setViewportSize(size);
    await startSeeded(page, 12);
    const header = await page.getByTestId('header').boundingBox();
    const stats = await page.getByLabel('Stats').boundingBox();
    const log = await page.getByTestId('log').boundingBox();
    const right = await page.getByLabel('Life panels').boundingBox();
    const age = await page.getByTestId('age-up').boundingBox();
    for (const b of [header, stats, log, right, age]) expect(b).not.toBeNull();
    if (!header || !stats || !log || !right || !age) return;
    // Header on top; stats left of the log; panel right of the log; Age Up below the log.
    expect(header.y + header.height).toBeLessThanOrEqual(stats.y);
    expect(stats.x + stats.width).toBeLessThanOrEqual(log.x);
    expect(log.x + log.width).toBeLessThanOrEqual(right.x);
    expect(age.y).toBeGreaterThan(log.y + log.height - 1);
    expect(age.x).toBeGreaterThan(log.x);
    expect(age.x + age.width).toBeLessThan(log.x + log.width);
    // Nothing spills outside the window.
    for (const b of [header, stats, log, right, age]) {
      expect(b.x + b.width).toBeLessThanOrEqual(size.width + 1);
      expect(b.y + b.height).toBeLessThanOrEqual(size.height + 1);
    }
    // The log gets the most room.
    expect(log.width).toBeGreaterThan(right.width);
    await expect(page.getByTestId('tab-occupation')).toBeVisible();
    await expect(page.getByTestId('tab-activities')).toBeVisible();
    // Achievement toasts land over the left column, never over the log or the panels.
    await page.getByTestId('age-up').click();
    const toast = page.getByTestId('toast').first();
    await expect(toast).toBeVisible();
    const t = await toast.boundingBox();
    expect(t).not.toBeNull();
    if (t) expect(t.x + t.width).toBeLessThanOrEqual(log.x);
  });
}
