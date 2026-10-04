import { app, BrowserWindow, Menu, type MenuItemConstructorOptions } from 'electron';
import { IPC } from '../shared/api';

function send(cmd: string): void {
  const win = BrowserWindow.getFocusedWindow() ?? BrowserWindow.getAllWindows()[0];
  win?.webContents.send(IPC.menu, cmd);
}

/** The application menu (SPEC §9.7). Dev tools only in development builds. */
export function buildMenu(isDev: boolean): Menu {
  const isMac = process.platform === 'darwin';
  const template: MenuItemConstructorOptions[] = [
    {
      label: 'Lifespan',
      id: 'app',
      submenu: [
        { role: 'about', label: 'About Lifespan' },
        { type: 'separator' },
        {
          id: 'settings',
          label: 'Settings…',
          accelerator: 'CmdOrCtrl+,',
          click: () => send('settings'),
        },
        { type: 'separator' },
        ...(isMac
          ? ([
              { role: 'hide' },
              { role: 'hideOthers' },
              { role: 'unhide' },
              { type: 'separator' },
            ] as MenuItemConstructorOptions[])
          : []),
        { role: 'quit', label: 'Quit Lifespan' },
      ],
    },
    {
      label: 'File',
      id: 'file',
      submenu: [
        {
          id: 'new-life',
          label: 'New Life',
          accelerator: 'CmdOrCtrl+N',
          click: () => send('new-life'),
        },
        { id: 'save', label: 'Save', accelerator: 'CmdOrCtrl+S', click: () => send('save') },
        { id: 'lives', label: 'Lives…', accelerator: 'CmdOrCtrl+L', click: () => send('lives') },
        { type: 'separator' },
        { id: 'export', label: 'Export Life…', click: () => send('export') },
        { id: 'import', label: 'Import Life…', click: () => send('import') },
      ],
    },
    { role: 'editMenu', id: 'edit' },
    {
      label: 'View',
      id: 'view',
      submenu: [
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
        ...(isDev
          ? ([
              { type: 'separator' },
              { role: 'reload' },
              { role: 'toggleDevTools' },
            ] as MenuItemConstructorOptions[])
          : []),
      ],
    },
    {
      label: 'Cheats',
      id: 'cheats',
      submenu: [
        {
          id: 'cheats-toggle',
          label: 'Open Cheat Panel',
          accelerator: 'Shift+CmdOrCtrl+K',
          click: () => send('cheats.toggle'),
        },
        { type: 'separator' },
        { id: 'cheat-immortal', label: 'Toggle Immortality', click: () => send('cheat:immortal') },
        {
          id: 'cheat-forcesuccess',
          label: 'Toggle Force Success',
          click: () => send('cheat:forcesuccess'),
        },
        {
          id: 'cheat-nobadevents',
          label: 'Toggle No Bad Events',
          click: () => send('cheat:nobadevents'),
        },
        {
          id: 'cheat-infinite',
          label: 'Toggle Infinite Money',
          click: () => send('cheat:money.infinite'),
        },
      ],
    },
    { role: 'windowMenu', id: 'window' },
    {
      role: 'help',
      id: 'help',
      submenu: [
        {
          id: 'shortcuts',
          label: 'Keyboard Shortcuts',
          accelerator: 'Shift+CmdOrCtrl+/',
          click: () => send('help'),
        },
      ],
    },
  ];
  return Menu.buildFromTemplate(template);
}

export function installMenu(): void {
  Menu.setApplicationMenu(
    buildMenu(!app.isPackaged && process.env['ELECTRON_RENDERER_URL'] !== undefined),
  );
}
