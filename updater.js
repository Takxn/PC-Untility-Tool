const { autoUpdater } = require('electron-updater');

let mainWindowRef = null;

function setupAutoUpdater(mainWindow) {
  mainWindowRef = mainWindow;
  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on('update-available', (info) => {
    if (mainWindowRef && !mainWindowRef.isDestroyed()) {
      mainWindowRef.webContents.send('update:available', {
        version: info.version,
        releaseNotes: info.releaseNotes,
      });
    }
  });

  autoUpdater.on('update-downloaded', () => {
    if (mainWindowRef && !mainWindowRef.isDestroyed()) {
      mainWindowRef.webContents.send('update:downloaded');
    }
  });

  autoUpdater.on('error', (err) => {
    if (mainWindowRef && !mainWindowRef.isDestroyed()) {
      mainWindowRef.webContents.send('update:error', err.message);
    }
  });
}

async function checkForUpdates() {
  try {
    const result = await autoUpdater.checkForUpdates();
    if (!result || !result.updateInfo) {
      return { updateAvailable: false, message: 'Keine Updates gefunden.' };
    }
    const updateInfo = result.updateInfo;
    const currentVersion = require('./package.json').version;
    const available = updateInfo.version !== currentVersion;
    return {
      updateAvailable: available,
      version: updateInfo.version,
      currentVersion,
      releaseDate: updateInfo.releaseDate,
    };
  } catch (e) {
    return { updateAvailable: false, error: e.message };
  }
}

async function downloadUpdate() {
  try {
    const hasUpdate = await checkForUpdates();
    if (!hasUpdate || !hasUpdate.updateAvailable) {
      throw new Error('Bitte zuerst auf Updates prüfen – kein Update verfügbar.');
    }
    return await autoUpdater.downloadUpdate();
  } catch (e) {
    throw e;
  }
}

function quitAndInstall() {
  setImmediate(() => {
    app.isQuitting = true;
    autoUpdater.quitAndInstall(false, true);
  });
}

const app = require('electron').app;

module.exports = { setupAutoUpdater, checkForUpdates, downloadUpdate, quitAndInstall };
