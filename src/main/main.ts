import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import * as path from 'path';
import { MCPManager } from './mcp-manager';

let mainWindow: BrowserWindow | null = null;
let mcpManager: MCPManager | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    backgroundColor: '#1a1a1a',
    title: 'Big AGI MCP Assistant',
  });

  // Load the app
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  // Initialize MCP Manager
  mcpManager = new MCPManager();

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

app.on('before-quit', async () => {
  if (mcpManager) {
    await mcpManager.cleanup();
  }
});

// IPC Handlers
ipcMain.handle('send-message', async (event, message: string) => {
  try {
    if (!mcpManager) {
      throw new Error('MCP Manager not initialized');
    }
    const response = await mcpManager.sendMessage(message);
    return { success: true, data: response };
  } catch (error) {
    console.error('Error sending message:', error);
    return { success: false, error: (error as Error).message };
  }
});

ipcMain.handle('get-mcp-servers', async () => {
  try {
    if (!mcpManager) {
      throw new Error('MCP Manager not initialized');
    }
    const servers = await mcpManager.getServers();
    return { success: true, data: servers };
  } catch (error) {
    console.error('Error getting servers:', error);
    return { success: false, error: (error as Error).message };
  }
});

ipcMain.handle('add-mcp-server', async (event, config: any) => {
  try {
    if (!mcpManager) {
      throw new Error('MCP Manager not initialized');
    }
    await mcpManager.addServer(config);
    return { success: true };
  } catch (error) {
    console.error('Error adding server:', error);
    return { success: false, error: (error as Error).message };
  }
});

ipcMain.handle('remove-mcp-server', async (event, serverId: string) => {
  try {
    if (!mcpManager) {
      throw new Error('MCP Manager not initialized');
    }
    await mcpManager.removeServer(serverId);
    return { success: true };
  } catch (error) {
    console.error('Error removing server:', error);
    return { success: false, error: (error as Error).message };
  }
});

ipcMain.handle('get-available-tools', async () => {
  try {
    if (!mcpManager) {
      throw new Error('MCP Manager not initialized');
    }
    const tools = await mcpManager.getAvailableTools();
    return { success: true, data: tools };
  } catch (error) {
    console.error('Error getting tools:', error);
    return { success: false, error: (error as Error).message };
  }
});

ipcMain.handle('call-tool', async (event, toolName: string, args: any) => {
  try {
    if (!mcpManager) {
      throw new Error('MCP Manager not initialized');
    }
    const result = await mcpManager.callTool(toolName, args);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error calling tool:', error);
    return { success: false, error: (error as Error).message };
  }
});

ipcMain.handle('select-file', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
  });
  return result.filePaths[0];
});

ipcMain.handle('select-directory', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory'],
  });
  return result.filePaths[0];
});
