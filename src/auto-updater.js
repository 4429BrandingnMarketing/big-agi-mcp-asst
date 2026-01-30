/**
 * Auto-Updater Module
 * Handles automatic application updates
 */

const { autoUpdater } = require('electron-updater');
const { dialog } = require('electron');

class AutoUpdater {
  constructor(mainWindow) {
    this.mainWindow = mainWindow;
    this.enabled = process.env.NODE_ENV === 'production';

    // Configure auto-updater
    autoUpdater.autoDownload = false;
    autoUpdater.autoInstallOnAppQuit = true;

    this.setupEventListeners();
  }

  setupEventListeners() {
    autoUpdater.on('checking-for-update', () => {
      this.log('Checking for updates...');
    });

    autoUpdater.on('update-available', (info) => {
      this.log('Update available:', info.version);
      this.notifyUpdateAvailable(info);
    });

    autoUpdater.on('update-not-available', (info) => {
      this.log('No updates available', info.version);
    });

    autoUpdater.on('error', (err) => {
      this.log('Error checking for updates:', err);
    });

    autoUpdater.on('download-progress', (progressObj) => {
      const message = `Downloaded ${progressObj.percent.toFixed(2)}%`;
      this.log(message);
      this.sendStatusToWindow('download-progress', progressObj);
    });

    autoUpdater.on('update-downloaded', (info) => {
      this.log('Update downloaded:', info.version);
      this.notifyUpdateDownloaded(info);
    });
  }

  async checkForUpdates(silent = true) {
    if (!this.enabled) {
      this.log('Auto-update disabled in development mode');
      return;
    }

    try {
      const result = await autoUpdater.checkForUpdates();
      if (!silent && !result.updateInfo) {
        dialog.showMessageBox(this.mainWindow, {
          type: 'info',
          title: 'No Updates',
          message: 'You are running the latest version!',
          buttons: ['OK']
        });
      }
      return result;
    } catch (error) {
      this.log('Check for updates failed:', error);
      if (!silent) {
        dialog.showErrorBox('Update Error', 'Failed to check for updates.');
      }
    }
  }

  async downloadUpdate() {
    try {
      await autoUpdater.downloadUpdate();
    } catch (error) {
      this.log('Download failed:', error);
      dialog.showErrorBox('Download Error', 'Failed to download update.');
    }
  }

  quitAndInstall() {
    autoUpdater.quitAndInstall(false, true);
  }

  notifyUpdateAvailable(info) {
    const response = dialog.showMessageBoxSync(this.mainWindow, {
      type: 'info',
      title: 'Update Available',
      message: `A new version (${info.version}) is available!`,
      detail: `Current version: ${require('../package.json').version}\nNew version: ${info.version}\n\nWould you like to download it now?`,
      buttons: ['Download', 'Later'],
      defaultId: 0,
      cancelId: 1
    });

    if (response === 0) {
      this.downloadUpdate();
    }
  }

  notifyUpdateDownloaded(info) {
    const response = dialog.showMessageBoxSync(this.mainWindow, {
      type: 'info',
      title: 'Update Ready',
      message: 'Update downloaded successfully!',
      detail: `Version ${info.version} has been downloaded and is ready to install.\n\nThe application will restart to apply the update.`,
      buttons: ['Restart Now', 'Later'],
      defaultId: 0,
      cancelId: 1
    });

    if (response === 0) {
      this.quitAndInstall();
    }
  }

  sendStatusToWindow(event, data) {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send('update-status', { event, data });
    }
  }

  log(...args) {
    console.log('[AutoUpdater]', ...args);
  }

  enable() {
    this.enabled = true;
  }

  disable() {
    this.enabled = false;
  }

  isEnabled() {
    return this.enabled;
  }
}

module.exports = AutoUpdater;
