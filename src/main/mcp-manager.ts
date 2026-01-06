import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { CallToolResultSchema, ListToolsResultSchema } from '@modelcontextprotocol/sdk/types.js';

interface MCPServer {
  id: string;
  name: string;
  command: string;
  args: string[];
  client?: Client;
  transport?: StdioClientTransport;
  connected: boolean;
}

export class MCPManager {
  private servers: Map<string, MCPServer> = new Map();
  private conversationHistory: Array<{ role: string; content: string }> = [];

  constructor() {
    this.initializeDefaultServers();
  }

  private async initializeDefaultServers() {
    // Add default MCP servers here if needed
    // For example, a filesystem server or other common tools
  }

  async addServer(config: { name: string; command: string; args: string[] }): Promise<void> {
    const id = `${config.name}-${Date.now()}`;
    const server: MCPServer = {
      id,
      name: config.name,
      command: config.command,
      args: config.args,
      connected: false,
    };

    try {
      // Create transport
      server.transport = new StdioClientTransport({
        command: config.command,
        args: config.args,
      });

      // Create client
      server.client = new Client(
        {
          name: 'big-agi-mcp-asst',
          version: '1.0.0',
        },
        {
          capabilities: {},
        }
      );

      // Connect
      await server.client.connect(server.transport);
      server.connected = true;

      this.servers.set(id, server);
      console.log(`MCP Server ${config.name} connected successfully`);
    } catch (error) {
      console.error(`Failed to connect to MCP server ${config.name}:`, error);
      throw error;
    }
  }

  async removeServer(serverId: string): Promise<void> {
    const server = this.servers.get(serverId);
    if (server && server.client) {
      await server.client.close();
    }
    this.servers.delete(serverId);
  }

  async getServers(): Promise<Array<{ id: string; name: string; connected: boolean }>> {
    return Array.from(this.servers.values()).map((server) => ({
      id: server.id,
      name: server.name,
      connected: server.connected,
    }));
  }

  async getAvailableTools(): Promise<any[]> {
    const allTools: any[] = [];

    for (const server of this.servers.values()) {
      if (server.client && server.connected) {
        try {
          const result = await server.client.listTools();
          const validated = ListToolsResultSchema.parse(result);
          allTools.push(
            ...validated.tools.map((tool) => ({
              ...tool,
              serverId: server.id,
              serverName: server.name,
            }))
          );
        } catch (error) {
          console.error(`Error listing tools for ${server.name}:`, error);
        }
      }
    }

    return allTools;
  }

  async callTool(toolName: string, args: any): Promise<any> {
    for (const server of this.servers.values()) {
      if (server.client && server.connected) {
        try {
          const tools = await server.client.listTools();
          const validated = ListToolsResultSchema.parse(tools);

          if (validated.tools.some((tool) => tool.name === toolName)) {
            const result = await server.client.callTool({ name: toolName, arguments: args });
            return CallToolResultSchema.parse(result);
          }
        } catch (error) {
          console.error(`Error calling tool ${toolName}:`, error);
        }
      }
    }

    throw new Error(`Tool ${toolName} not found in any connected server`);
  }

  async sendMessage(message: string): Promise<string> {
    // Add user message to history
    this.conversationHistory.push({
      role: 'user',
      content: message,
    });

    // Simple AI response logic
    // In a real implementation, you would integrate with an actual LLM
    let response = '';

    try {
      // Check if message is asking for tools
      if (message.toLowerCase().includes('what tools') || message.toLowerCase().includes('available tools')) {
        const tools = await this.getAvailableTools();
        response = `I have access to the following tools:\n\n${tools
          .map((tool) => `- **${tool.name}** (from ${tool.serverName}): ${tool.description}`)
          .join('\n')}`;
      } else if (message.toLowerCase().includes('help')) {
        response = `Welcome to Big AGI MCP Assistant! I'm an AI assistant with access to various tools through the Model Context Protocol (MCP).

Here's what I can do:
- Answer questions and have conversations
- Use tools from connected MCP servers
- Help you with various tasks

Try asking me "what tools are available?" to see what I can do!`;
      } else {
        // Default response
        response = `I received your message: "${message}".

This is a demo response. To add full AI capabilities, integrate with an LLM API like OpenAI, Anthropic, or a local model.

Connected MCP servers: ${this.servers.size}
Available tools: ${(await this.getAvailableTools()).length}`;
      }
    } catch (error) {
      response = `Sorry, I encountered an error: ${(error as Error).message}`;
    }

    // Add assistant response to history
    this.conversationHistory.push({
      role: 'assistant',
      content: response,
    });

    return response;
  }

  getConversationHistory() {
    return this.conversationHistory;
  }

  clearHistory() {
    this.conversationHistory = [];
  }

  async cleanup() {
    for (const server of this.servers.values()) {
      if (server.client) {
        await server.client.close();
      }
    }
    this.servers.clear();
  }
}
