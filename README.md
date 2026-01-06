# Big AGI MCP Assistant

A powerful standalone desktop AI assistant with Model Context Protocol (MCP) support, built with Electron, React, and TypeScript.

## Features

- 🤖 **AI Assistant Interface** - Clean, modern chat interface for interacting with AI
- 🔧 **MCP Integration** - Full support for Model Context Protocol servers and tools
- 💻 **Cross-Platform** - Available for Windows, macOS, and Linux
- 🎨 **Modern UI** - Beautiful dark-themed interface with smooth animations
- ⚡ **Fast & Lightweight** - Built with Vite for optimal performance
- 🔌 **Extensible** - Easy to add new MCP servers and tools

## Screenshots

The app features:
- **Chat Interface** - Intuitive conversation view with markdown support
- **Sidebar** - Manage MCP servers and view available tools
- **Real-time Updates** - See connected servers and tools dynamically

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/big-agi-mcp-asst.git
cd big-agi-mcp-asst
```

2. Install dependencies:
```bash
npm install
```

### Development

Run the app in development mode:

```bash
# Start both main and renderer processes
npm run dev

# Or run them separately:
npm run dev:main      # Electron main process
npm run dev:renderer  # Vite dev server
```

The app will open automatically with hot reload enabled.

### Building for Production

Build the application:

```bash
npm run build
```

This will:
1. Compile TypeScript (main and preload processes)
2. Build the React app with Vite
3. Output to the `dist/` directory

### Packaging

Create distributable packages for your platform:

```bash
# Package for current platform
npm run package

# Package for specific platforms
npm run package:win    # Windows (NSIS installer + portable)
npm run package:mac    # macOS (DMG + ZIP)
npm run package:linux  # Linux (AppImage + deb)
```

Packages will be created in the `release/` directory.

## Using MCP Servers

### Adding an MCP Server

1. Click the **+** button in the sidebar
2. Enter the server details:
   - **Name**: A friendly name for the server
   - **Command**: The executable (e.g., `node`, `python`)
   - **Args**: Comma-separated arguments (e.g., `server.js, --port, 3000`)
3. Click **Add Server**

### Example MCP Servers

**Filesystem Server (Node.js)**
```
Name: Filesystem
Command: node
Args: path/to/mcp-server-filesystem/index.js
```

**Custom Python Server**
```
Name: My Python Server
Command: python
Args: -m, my_mcp_server
```

### Available Tools

Once servers are connected, their tools will appear in the "Available Tools" section. The AI assistant can use these tools automatically during conversations.

## Architecture

```
big-agi-mcp-asst/
├── src/
│   ├── main/              # Electron main process
│   │   ├── main.ts        # Main entry point
│   │   ├── preload.ts     # Preload script (context bridge)
│   │   └── mcp-manager.ts # MCP server management
│   └── renderer/          # React frontend
│       ├── components/    # React components
│       ├── styles/        # CSS files
│       ├── App.tsx        # Main App component
│       └── main.tsx       # React entry point
├── assets/                # Icons and images
├── dist/                  # Build output
├── release/               # Packaged distributions
└── package.json
```

## Tech Stack

- **Electron** - Desktop app framework
- **React** - UI library
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool
- **MCP SDK** - Model Context Protocol integration
- **React Markdown** - Markdown rendering

## Configuration

### Build Configuration

Edit `electron-builder.yml` to customize build settings:
- App ID and product name
- Icons and assets
- Target platforms and formats
- Installer options

### TypeScript

Three TypeScript configurations:
- `tsconfig.json` - Renderer process (React)
- `tsconfig.main.json` - Main process
- `tsconfig.preload.json` - Preload script

## IPC API

The app uses Electron IPC for communication:

- `sendMessage(message)` - Send chat message to AI
- `getMCPServers()` - Get list of connected servers
- `addMCPServer(config)` - Add new MCP server
- `removeMCPServer(serverId)` - Remove MCP server
- `getAvailableTools()` - Get all tools from servers
- `callTool(toolName, args)` - Call a specific tool

## Extending the App

### Adding Custom AI Integration

Edit `src/main/mcp-manager.ts` to integrate with AI APIs:

```typescript
async sendMessage(message: string): Promise<string> {
  // Add your AI API integration here
  // Examples: OpenAI, Anthropic, local models
}
```

### Custom Themes

Modify CSS variables in `src/renderer/styles/global.css`:

```css
:root {
  --bg-primary: #1a1a1a;
  --accent-primary: #4a9eff;
  /* Add your colors */
}
```

## Troubleshooting

### Build Issues

If you encounter build errors:

```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear build cache
rm -rf dist release
```

### MCP Server Connection

If servers won't connect:
- Verify the command and args are correct
- Check server logs for errors
- Ensure the server executable is in your PATH

### Electron Issues

```bash
# Rebuild electron
npm run postinstall
```

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details

## Roadmap

- [ ] Multiple AI model support (OpenAI, Anthropic, local models)
- [ ] Conversation history persistence
- [ ] Custom themes and appearance settings
- [ ] Plugin system for extensions
- [ ] Voice input/output
- [ ] File attachments in chat
- [ ] Export conversations
- [ ] Multi-language support

## Support

For issues and questions:
- Open an issue on GitHub
- Check existing issues for solutions
- Read the MCP SDK documentation

## Acknowledgments

- Built with [Electron](https://www.electronjs.org/)
- Uses [Model Context Protocol](https://modelcontextprotocol.io/)
- Powered by [React](https://react.dev/)

---

**Made with ❤️ by the Big AGI Team**
