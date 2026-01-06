const { app, BrowserWindow, ipcMain, Menu, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

// Store for conversation history
let conversationHistory = [];

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

  // Show window when ready to prevent flicker
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Open DevTools in development mode
  if (process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools();
  }

  // Create application menu
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
        },
        {
          label: 'Documentation',
          click: () => {
            require('electron').shell.openExternal('https://github.com/4429BrandingnMarketing/big-agi-mcp-asst');
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

// IPC handlers
ipcMain.handle('send-message', async (event, message) => {
  // Simulate AI response (in a real app, this would call an AI service)
  const response = await generateAIResponse(message);
  return response;
});

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

async function generateAIResponse(message) {
  // This is a placeholder function that simulates an AI response
  // In a real application, this would integrate with an AI service/API

  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay

  const responses = {
    greeting: [
      "Hello! I'm your Big-AGI MCP Assistant. How can I help you today?",
      "Hi there! I'm ready to assist you with your tasks.",
      "Greetings! What can I do for you?"
    ],
    help: [
      "I can help you with various tasks including:\n- Answering questions\n- Providing information\n- Analyzing data\n- And much more!\n\nWhat would you like to know?",
      "I'm here to assist! You can ask me questions, request information, or have me help with tasks. What do you need?"
    ],
    default: [
      "I understand you're asking about: " + message + "\n\nThis is a demonstration response. In a production version, this would connect to an AI service to provide intelligent responses.",
      "Thank you for your message. I'm currently in demo mode. A full implementation would integrate with AI services like OpenAI, Anthropic, or local models to provide meaningful responses.",
      "I received your message: '" + message + "'. In a complete version, I would process this using advanced AI capabilities."
    ]
  };

  const lowerMessage = message.toLowerCase();

  if (lowerMessage.match(/\b(hi|hello|hey|greetings)\b/)) {
    return responses.greeting[Math.floor(Math.random() * responses.greeting.length)];
  } else if (lowerMessage.match(/\b(help|what can you do|capabilities)\b/)) {
    return responses.help[Math.floor(Math.random() * responses.help.length)];
  } else {
    return responses.default[Math.floor(Math.random() * responses.default.length)];
  }
}

// App lifecycle
app.whenReady().then(() => {
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
