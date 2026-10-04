import { contextBridge, ipcRenderer } from 'electron';
import { IPC, type LifespanBridge } from '../shared/api';

const bridge: LifespanBridge = {
  saves: {
    list: () => ipcRenderer.invoke(IPC.list),
    read: (id) => ipcRenderer.invoke(IPC.read, id),
    write: (id, json) => ipcRenderer.invoke(IPC.write, id, json),
    delete: (id) => ipcRenderer.invoke(IPC.delete, id),
    exportDialog: (name, json) => ipcRenderer.invoke(IPC.exportDialog, name, json),
    importDialog: () => ipcRenderer.invoke(IPC.importDialog),
  },
  app: { version: () => ipcRenderer.invoke(IPC.version) },
  onMenu(handler) {
    const listener = (_e: unknown, command: unknown): void => {
      if (typeof command === 'string') handler(command);
    };
    ipcRenderer.on(IPC.menu, listener);
    return () => ipcRenderer.removeListener(IPC.menu, listener);
  },
};

contextBridge.exposeInMainWorld('lifespan', bridge);
