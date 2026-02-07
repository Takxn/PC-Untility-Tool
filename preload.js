const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  app: {
    getVersion: () => ipcRenderer.invoke('app:version'),
  },
  system: {
    getInfo: () => ipcRenderer.invoke('system:info'),
  },
  logs: {
    get: (limit) => ipcRenderer.invoke('logs:get', limit),
    clear: () => ipcRenderer.invoke('logs:clear'),
  },
  settings: {
    get: () => ipcRenderer.invoke('settings:get'),
    set: (key, value) => ipcRenderer.invoke('settings:set', key, value),
  },
  update: {
    check: () => ipcRenderer.invoke('update:check'),
    download: () => ipcRenderer.invoke('update:download'),
    onAvailable: (cb) => ipcRenderer.on('update:available', (_, data) => cb(data)),
    onDownloaded: (cb) => ipcRenderer.on('update:downloaded', cb),
    install: () => ipcRenderer.send('update:install'),
  },
});
