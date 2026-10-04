import { describe, expect, it } from 'vitest';
import { isAllowedUrl, secureWebPreferences } from '../../src/main/security';
import { cspPlugin, PROD_CSP } from '../../build/csp';
import { readFileSync } from 'node:fs';

describe('electron security baseline (SPEC §9.6)', () => {
  it('locks down webPreferences', () => {
    const p = secureWebPreferences('/x/preload.cjs');
    expect(p.contextIsolation).toBe(true);
    expect(p.nodeIntegration).toBe(false);
    expect(p.nodeIntegrationInWorker).toBe(false);
    expect(p.sandbox).toBe(true);
    expect(p.webSecurity).toBe(true);
    expect(p.allowRunningInsecureContent).toBe(false);
    expect(p.webviewTag).toBe(false);
    expect(p.preload).toBe('/x/preload.cjs');
  });

  it('ships a strict CSP', () => {
    expect(PROD_CSP).toContain("default-src 'none'");
    expect(PROD_CSP).toContain("script-src 'self'");
    expect(PROD_CSP).not.toContain('unsafe-inline');
    expect(PROD_CSP).not.toContain('unsafe-eval');
    expect(PROD_CSP).not.toMatch(/https?:/);
  });

  it('injects the CSP into the built index.html', () => {
    const plugin = cspPlugin();
    const resolved = plugin.configResolved as (c: { command: string }) => void;
    resolved({ command: 'build' });
    const transform = plugin.transformIndexHtml as (html: string) => string;
    const html = transform(readFileSync('src/renderer/index.html', 'utf8'));
    expect(html).toContain(`content="${PROD_CSP}"`);
  });

  it('blocks navigation to remote pages', () => {
    expect(isAllowedUrl('file:///app/index.html', undefined)).toBe(true);
    expect(isAllowedUrl('https://example.com/', undefined)).toBe(false);
    expect(isAllowedUrl('http://localhost:5173/x', 'http://localhost:5173/')).toBe(true);
  });

  it('the main process denies new windows and webviews', () => {
    const src = readFileSync('src/main/index.ts', 'utf8');
    expect(src).toContain("setWindowOpenHandler(() => ({ action: 'deny' }))");
    expect(src).toContain('will-navigate');
    expect(src).toContain('will-attach-webview');
  });
});
