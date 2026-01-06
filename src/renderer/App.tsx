import React, { useState, useEffect } from 'react';
import ChatInterface from './components/ChatInterface';
import Sidebar from './components/Sidebar';
import './styles/App.css';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface MCPServer {
  id: string;
  name: string;
  connected: boolean;
}

export interface Tool {
  name: string;
  description: string;
  serverName: string;
  serverId: string;
}

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [servers, setServers] = useState<MCPServer[]>([]);
  const [tools, setTools] = useState<Tool[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadServers();
    loadTools();
  }, []);

  const loadServers = async () => {
    try {
      const result = await window.electronAPI.getMCPServers();
      if (result.success) {
        setServers(result.data);
      }
    } catch (error) {
      console.error('Failed to load servers:', error);
    }
  };

  const loadTools = async () => {
    try {
      const result = await window.electronAPI.getAvailableTools();
      if (result.success) {
        setTools(result.data);
      }
    } catch (error) {
      console.error('Failed to load tools:', error);
    }
  };

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const result = await window.electronAPI.sendMessage(content);

      if (result.success) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: result.data,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `Error: ${result.error}`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Error: ${(error as Error).message}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddServer = async (config: { name: string; command: string; args: string[] }) => {
    try {
      const result = await window.electronAPI.addMCPServer(config);
      if (result.success) {
        await loadServers();
        await loadTools();
      }
    } catch (error) {
      console.error('Failed to add server:', error);
    }
  };

  const handleRemoveServer = async (serverId: string) => {
    try {
      const result = await window.electronAPI.removeMCPServer(serverId);
      if (result.success) {
        await loadServers();
        await loadTools();
      }
    } catch (error) {
      console.error('Failed to remove server:', error);
    }
  };

  return (
    <div className="app">
      <Sidebar
        servers={servers}
        tools={tools}
        onAddServer={handleAddServer}
        onRemoveServer={handleRemoveServer}
      />
      <ChatInterface
        messages={messages}
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
      />
    </div>
  );
}

export default App;
