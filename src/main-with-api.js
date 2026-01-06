/**
 * EXAMPLE: Main Process with API Integration
 * This shows how to integrate your APIs into the desktop app
 *
 * To use this:
 * 1. Rename this file to main.js (backup the original first)
 * 2. Update your API configuration in config.js
 * 3. Add your API key to environment variables or config
 */

const { app, BrowserWindow, ipcMain, Menu, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { initializeAPI, getAPIService } = require('./api-service');
const { getConfig } = require('./config');

let mainWindow;
let conversationHistory = [];
let apiService;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      enableRemoteModule: false
    },
    icon: path.join(__dirname, '../assets/icon.png'),
    backgroundColor: '#1e1e1e',
    show: false
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  if (process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools();
  }

  createMenu();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New Conversation',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow.webContents.send('new-conversation');
          }
        },
        {
          label: 'Save Conversation',
          accelerator: 'CmdOrCtrl+S',
          click: () => {
            saveConversation();
          }
        },
        {
          label: 'Load Conversation',
          accelerator: 'CmdOrCtrl+O',
          click: () => {
            loadConversation();
          }
        },
        { type: 'separator' },
        {
          label: 'Settings',
          accelerator: 'CmdOrCtrl+,',
          click: () => {
            openSettings();
          }
        },
        { type: 'separator' },
        {
          label: 'Exit',
          accelerator: 'CmdOrCtrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About Big-AGI MCP Assistant',
              message: 'Big-AGI MCP Assistant v1.0.0',
              detail: 'A standalone desktop application for AI-powered assistance using the Model Context Protocol.',
              buttons: ['OK']
            });
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

async function saveConversation() {
  const { filePath } = await dialog.showSaveDialog(mainWindow, {
    title: 'Save Conversation',
    defaultPath: `conversation-${Date.now()}.json`,
    filters: [
      { name: 'JSON Files', extensions: ['json'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });

  if (filePath) {
    mainWindow.webContents.send('save-conversation-request');
  }
}

async function loadConversation() {
  const { filePaths } = await dialog.showOpenDialog(mainWindow, {
    title: 'Load Conversation',
    filters: [
      { name: 'JSON Files', extensions: ['json'] },
      { name: 'All Files', extensions: ['*'] }
    ],
    properties: ['openFile']
  });

  if (filePaths && filePaths.length > 0) {
    try {
      const data = fs.readFileSync(filePaths[0], 'utf8');
      const conversation = JSON.parse(data);
      mainWindow.webContents.send('load-conversation', conversation);
    } catch (error) {
      dialog.showErrorBox('Error Loading Conversation', error.message);
    }
  }
}

function openSettings() {
  // TODO: Create settings window
  const config = getConfig();
  console.log('Current config:', config.getAll());
}

// ============================================
// API INTEGRATION HANDLERS
// ============================================

/**
 * Send message to your API
 * This integrates with your actual API endpoints
 */
ipcMain.handle('send-message', async (event, message) => {
  try {
    // Add user message to conversation history
    conversationHistory.push({
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    });

    // Call your API service
    const response = await apiService.chat(message, conversationHistory);

    // Extract the AI response from your API response
    // Adjust this based on your API response structure
    let aiMessage = '';

    if (response.data && response.data.choices) {
      // OpenAI-style response
      aiMessage = response.data.choices[0].message.content;
    } else if (response.data && response.data.content) {
      // Anthropic-style response
      aiMessage = response.data.content;
    } else if (response.data && response.data.response) {
      // Custom API response
      aiMessage = response.data.response;
    } else {
      // Fallback
      aiMessage = response.data?.text || JSON.stringify(response.data);
    }

    // Add AI response to conversation history
    conversationHistory.push({
      role: 'assistant',
      content: aiMessage,
      timestamp: new Date().toISOString()
    });

    return aiMessage;

  } catch (error) {
    console.error('API Error:', error);

    // Return user-friendly error message
    return `I apologize, but I encountered an error while processing your request: ${error.message}. Please check your API configuration and try again.`;
  }
});

/**
 * Call specific API endpoint
 */
ipcMain.handle('api-call', async (event, { endpoint, method, data }) => {
  try {
    let response;

    switch (method.toUpperCase()) {
      case 'GET':
        response = await apiService.get(endpoint, data);
        break;
      case 'POST':
        response = await apiService.post(endpoint, data);
        break;
      case 'PUT':
        response = await apiService.put(endpoint, data);
        break;
      case 'DELETE':
        response = await apiService.delete(endpoint);
        break;
      default:
        throw new Error(`Unsupported method: ${method}`);
    }

    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

/**
 * Get analytics from your API
 */
ipcMain.handle('get-analytics', async (event, params) => {
  try {
    const response = await apiService.getAnalytics(params);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

/**
 * Update API configuration
 */
ipcMain.handle('update-api-config', async (event, config) => {
  try {
    const appConfig = getConfig();
    appConfig.set('api', config);

    // Reinitialize API service with new config
    apiService = initializeAPI(config);

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

/**
 * Get current configuration
 */
ipcMain.handle('get-config', async () => {
  const config = getConfig();
  return config.getAll();
});

// ============================================
// EXISTING HANDLERS
// ============================================

ipcMain.handle('save-conversation-data', async (event, data) => {
  const { filePath } = await dialog.showSaveDialog(mainWindow, {
    title: 'Save Conversation',
    defaultPath: `conversation-${Date.now()}.json`,
    filters: [
      { name: 'JSON Files', extensions: ['json'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });

  if (filePath) {
    try {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  return { success: false, error: 'No file selected' };
});

ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

// ============================================
// APP LIFECYCLE
// ============================================

app.whenReady().then(() => {
  // Initialize configuration
  const config = getConfig();

  // Initialize API service with configuration
  try {
    apiService = initializeAPI(config.get('api'));
    console.log('API Service initialized successfully');
  } catch (error) {
    console.error('Failed to initialize API service:', error);
    // Show error dialog
    dialog.showErrorBox(
      'API Configuration Error',
      'Failed to initialize API service. Please check your configuration in Settings.'
    );
  }

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Handle errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
