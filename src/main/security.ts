import type { WebPreferences } from 'electron';

/** webPreferences for every BrowserWindow (SPEC §9.6). Tests assert on these values. */
export function secureWebPreferences(preloadPath: string): WebPreferences {
  return {
    preload: preloadPath,
    contextIsolation: true,
    nodeIntegration: false,
    nodeIntegrationInWorker: false,
    nodeIntegrationInSubFrames: false,
    sandbox: true,
    webSecurity: true,
    allowRunningInsecureContent: false,
    experimentalFeatures: false,
    webviewTag: false,
    spellcheck: false,
  };
}

/** Only our own bundled pages may load: files under the app's own directory, or the dev server. */
export function isAllowedUrl(
  url: string,
  devServerUrl: string | undefined,
  appRoot: string,
): boolean {
  if (devServerUrl && url.startsWith(devServerUrl)) return true;
  return url.startsWith(appRoot);
}
