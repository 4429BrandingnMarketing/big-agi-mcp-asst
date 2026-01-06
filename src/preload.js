const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  sendMessage: (message) => ipcRenderer.invoke('send-message', message),
  saveConversation: (data) => ipcRenderer.invoke('save-conversation-data', data),
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),

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
