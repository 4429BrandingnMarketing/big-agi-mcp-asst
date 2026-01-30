const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  sendMessage: (message) => ipcRenderer.invoke('send-message', message),
  saveConversation: (data) => ipcRenderer.invoke('save-conversation-data', data),
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),

  // Provider management
  getProviders: () => ipcRenderer.invoke('get-providers'),
  setProvider: (provider) => ipcRenderer.invoke('set-provider', provider),
  getActiveProvider: () => ipcRenderer.invoke('get-active-provider'),

  // Configuration
  getConfig: () => ipcRenderer.invoke('get-config'),
  updateConfig: (config) => ipcRenderer.invoke('update-config', config),

  // Event listeners
  onNewConversation: (callback) => {
    ipcRenderer.on('new-conversation', callback);
  },
  onSaveConversationRequest: (callback) => {
    ipcRenderer.on('save-conversation-request', callback);
  },
  onLoadConversation: (callback) => {
    ipcRenderer.on('load-conversation', (event, data) => callback(data));
  },

  // Remove listeners
  removeNewConversationListener: () => {
    ipcRenderer.removeAllListeners('new-conversation');
  },
  removeSaveConversationRequestListener: () => {
    ipcRenderer.removeAllListeners('save-conversation-request');
  },
  removeLoadConversationListener: () => {
    ipcRenderer.removeAllListeners('load-conversation');
  }
});
