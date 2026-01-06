import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  sendMessage: (message: string) => ipcRenderer.invoke('send-message', message),
  getMCPServers: () => ipcRenderer.invoke('get-mcp-servers'),
  addMCPServer: (config: any) => ipcRenderer.invoke('add-mcp-server', config),
  removeMCPServer: (serverId: string) => ipcRenderer.invoke('remove-mcp-server', serverId),
  getAvailableTools: () => ipcRenderer.invoke('get-available-tools'),
  callTool: (toolName: string, args: any) => ipcRenderer.invoke('call-tool', toolName, args),
  selectFile: () => ipcRenderer.invoke('select-file'),
  selectDirectory: () => ipcRenderer.invoke('select-directory'),
});

// Type definitions for TypeScript
declare global {
  interface Window {
    electronAPI: {
      sendMessage: (message: string) => Promise<any>;
      getMCPServers: () => Promise<any>;
      addMCPServer: (config: any) => Promise<any>;
      removeMCPServer: (serverId: string) => Promise<any>;
      getAvailableTools: () => Promise<any>;
      callTool: (toolName: string, args: any) => Promise<any>;
      selectFile: () => Promise<string>;
      selectDirectory: () => Promise<string>;
    };
  }
}
