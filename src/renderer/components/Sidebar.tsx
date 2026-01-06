import React, { useState } from 'react';
import '../styles/Sidebar.css';
import { MCPServer, Tool } from '../App';

interface SidebarProps {
  servers: MCPServer[];
  tools: Tool[];
  onAddServer: (config: { name: string; command: string; args: string[] }) => void;
  onRemoveServer: (serverId: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ servers, tools, onAddServer, onRemoveServer }) => {
  const [isAddingServer, setIsAddingServer] = useState(false);
  const [serverName, setServerName] = useState('');
  const [serverCommand, setServerCommand] = useState('');
  const [serverArgs, setServerArgs] = useState('');

  const handleAddServer = () => {
    if (serverName.trim() && serverCommand.trim()) {
      const args = serverArgs.split(',').map((arg) => arg.trim()).filter(Boolean);
      onAddServer({
        name: serverName,
        command: serverCommand,
        args,
      });
      setServerName('');
      setServerCommand('');
      setServerArgs('');
      setIsAddingServer(false);
    }
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>🔧 MCP Servers</h2>
      </div>

      <div className="sidebar-content">
        <div className="servers-section">
          <div className="section-header">
            <h3>Connected Servers ({servers.length})</h3>
            <button
              className="add-server-btn"
              onClick={() => setIsAddingServer(!isAddingServer)}
            >
              {isAddingServer ? '✖' : '➕'}
            </button>
          </div>

          {isAddingServer && (
            <div className="add-server-form">
              <input
                type="text"
                placeholder="Server Name"
                value={serverName}
                onChange={(e) => setServerName(e.target.value)}
              />
              <input
                type="text"
                placeholder="Command (e.g., node)"
                value={serverCommand}
                onChange={(e) => setServerCommand(e.target.value)}
              />
              <input
                type="text"
                placeholder="Args (comma-separated)"
                value={serverArgs}
                onChange={(e) => setServerArgs(e.target.value)}
              />
              <button onClick={handleAddServer} className="submit-btn">
                Add Server
              </button>
            </div>
          )}

          <div className="servers-list">
            {servers.length === 0 ? (
              <div className="empty-state">
                <p>No servers connected</p>
                <p className="hint">Click + to add an MCP server</p>
              </div>
            ) : (
              servers.map((server) => (
                <div key={server.id} className="server-item">
                  <div className="server-info">
                    <span className={`status-dot ${server.connected ? 'connected' : 'disconnected'}`} />
                    <span className="server-name">{server.name}</span>
                  </div>
                  <button
                    className="remove-btn"
                    onClick={() => onRemoveServer(server.id)}
                    title="Remove server"
                  >
                    ✖
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="tools-section">
          <h3>Available Tools ({tools.length})</h3>
          <div className="tools-list">
            {tools.length === 0 ? (
              <div className="empty-state">
                <p>No tools available</p>
                <p className="hint">Add MCP servers to access tools</p>
              </div>
            ) : (
              tools.map((tool, index) => (
                <div key={index} className="tool-item">
                  <div className="tool-name">⚡ {tool.name}</div>
                  <div className="tool-description">{tool.description}</div>
                  <div className="tool-server">from {tool.serverName}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
