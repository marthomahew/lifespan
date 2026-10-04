import { app, BrowserWindow, session } from 'electron';
import { join } from 'node:path';
import { isAllowedUrl, secureWebPreferences } from './security';
import { registerSaveHandlers } from './saves';

const devServerUrl = process.env['ELECTRON_RENDERER_URL'];

function createWindow(): BrowserWindow {
  const win = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 1024,
    minHeight: 700,
    title: 'Lifespan',
    show: false,
    backgroundColor: '#f5f5f7',
    webPreferences: secureWebPreferences(join(__dirname, '../preload/index.cjs')),
  });
  win.once('ready-to-show', () => win.show());

  // No navigation away from the app and no new windows.
  win.webContents.on('will-navigate', (event, url) => {
    if (!isAllowedUrl(url, devServerUrl)) event.preventDefault();
  });
  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));

  if (devServerUrl) void win.loadURL(devServerUrl);
  else void win.loadFile(join(__dirname, '../renderer/index.html'));
  return win;
}

app.on('web-contents-created', (_e, contents) => {
  contents.on('will-attach-webview', (event) => event.preventDefault());
});

void app.whenReady().then(() => {
  // No remote content: refuse every request that isn't ours.
  session.defaultSession.webRequest.onBeforeRequest((details, callback) => {
    const ok =
      details.url.startsWith('file://') ||
      details.url.startsWith('devtools://') ||
      details.url.startsWith('data:') ||
      (devServerUrl !== undefined && details.url.startsWith(devServerUrl.replace(/\/$/, '')));
    callback({ cancel: !ok });
  });
  session.defaultSession.setPermissionRequestHandler((_wc, _perm, cb) => cb(false));
  registerSaveHandlers();
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
