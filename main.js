const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path');
const { initDb, addLog, getLogs, getSettings, setSettings } = require('./database');
const { getSystemInfo } = require('./systeminfo');
const { checkForUpdates, setupAutoUpdater } = require('./updater');

let mainWindow;

const iconPath = path.join(__dirname, 'icon', process.platform === 'win32' ? 'logo.ico' : 'logo.png');

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    minWidth: 800,
    minHeight: 600,
    icon: iconPath,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      devTools: false,
    },
    titleBarStyle: 'default',
    show: false,
    backgroundColor: '#0a0a0a',
  });

  mainWindow.loadFile(path.join(__dirname, 'src', 'index.html'));
  mainWindow.once('ready-to-show', () => mainWindow.show());

  setupAutoUpdater(mainWindow);
}

app.whenReady().then(async () => {
  Menu.setApplicationMenu(null);
  await initDb();
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// IPC: Systeminfos
ipcMain.handle('system:info', async () => {
  try {
    return await getSystemInfo();
  } catch (e) {
    addLog('error', 'Systeminfo', e.message);
    return { error: e.message };
  }
});

// IPC: Logs
ipcMain.handle('logs:get', (_, limit = 200) => getLogs(limit));
ipcMain.handle('logs:clear', () => {
  const Database = require('./database');
  return Database.clearLogs();
});

// IPC: Settings (JSON-artig über SQLite)
ipcMain.handle('settings:get', () => getSettings());
ipcMain.handle('settings:set', (_, key, value) => setSettings(key, value));

// IPC: Update
ipcMain.handle('update:check', async () => {
  try {
    return await checkForUpdates();
  } catch (e) {
    return { error: e.message };
  }
});
ipcMain.on('update:install', () => {
  const { quitAndInstall } = require('./updater');
  quitAndInstall();
});
ipcMain.handle('update:download', () => {
  const { downloadUpdate } = require('./updater');
  return downloadUpdate();
});

ipcMain.handle('app:version', () => require('./package.json').version);

// Log-App-Start
setTimeout(() => {
  addLog('info', 'App', 'PC Utility Tool gestartet');
}, 500);
