# Big-AGI MCP Assistant

A fully functional standalone desktop application for AI-powered assistance using the Model Context Protocol (MCP). Built with Electron for cross-platform compatibility.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey.svg)
![Electron](https://img.shields.io/badge/Electron-28.0.0-47848F.svg)

## Features

### Core Features
- 🖥️ **Cross-Platform** - Runs on Windows, macOS, and Linux
- 💬 **Interactive Chat Interface** - Clean, modern UI for conversing with AI
- 💾 **Save & Load Conversations** - Persist your conversation history
- ⌨️ **Keyboard Shortcuts** - Efficient workflow with hotkeys
- 🎨 **Dark Mode UI** - Easy on the eyes for extended usage
- 🔒 **Secure Architecture** - Context isolation and security best practices
- 📦 **Standalone Builds** - Portable executables for all platforms

### 🌟 PREMIUM Features (NEW!)
- ✨ **Markdown Rendering** - Full GitHub-flavored markdown with rich formatting
- 🎨 **Syntax Highlighting** - Beautiful code blocks for 7+ languages
- 📋 **Copy to Clipboard** - One-click copy for messages and code
- 🔔 **Toast Notifications** - Professional feedback system
- 🔄 **AI Provider Switcher** - Switch between 30+ APIs in real-time
- ⚙️ **Settings Panel** - Modern configuration interface
- 📤 **Export to Markdown/JSON** - Save conversations in multiple formats
- 🎬 **Premium Animations** - Smooth, professional transitions
- 💅 **Enhanced UI/UX** - Gradients, hover effects, and polished design

**See [PREMIUM_FEATURES.md](PREMIUM_FEATURES.md) for the complete guide!**

## Screenshots

The application features:
- Modern chat interface with message history
- Real-time typing indicators
- Conversation management
- Context-aware responses

## Installation

### Prerequisites

- **Node.js** 16.x or higher
- **npm** 7.x or higher

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/4429BrandingnMarketing/big-agi-mcp-asst.git
   cd big-agi-mcp-asst
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the application**
   ```bash
   npm start
   ```

### Development Mode

Run with developer tools enabled:
```bash
npm run dev
```

## Building Standalone Executables

### Build for All Platforms
```bash
npm run build
```

### Platform-Specific Builds

**Windows:**
```bash
npm run build:win
```
Creates NSIS installer and portable executable in `dist/`

**macOS:**
```bash
npm run build:mac
```
Creates DMG and ZIP in `dist/`

**Linux:**
```bash
npm run build:linux
```
Creates AppImage, DEB, and RPM packages in `dist/`

### Build Output

Built applications will be in the `dist/` directory:
- **Windows**: `.exe` installer and portable `.exe`
- **macOS**: `.dmg` disk image and `.zip` archive
- **Linux**: `.AppImage`, `.deb`, and `.rpm` packages

## Usage

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + N` | New conversation |
| `Ctrl/Cmd + S` | Save conversation |
| `Ctrl/Cmd + O` | Load conversation |
| `Ctrl/Cmd + Q` | Quit application |
| `Enter` | Send message |
| `Shift + Enter` | New line in message |

### Conversation Management

1. **Starting a New Conversation**
   - Click the `+` button in the header
   - Or use `Ctrl/Cmd + N`

2. **Saving Conversations**
   - File → Save Conversation
   - Or use `Ctrl/Cmd + S`
   - Saves as JSON file with timestamp

3. **Loading Conversations**
   - File → Load Conversation
   - Or use `Ctrl/Cmd + O`
   - Select a previously saved JSON file

## Project Structure

```
big-agi-mcp-asst/
├── src/
│   ├── main.js          # Electron main process
│   ├── preload.js       # Preload script for security
│   ├── renderer.js      # Renderer process logic
│   ├── index.html       # Main application UI
│   └── styles.css       # Application styling
├── assets/
│   └── icon.png         # Application icon
├── package.json         # Project dependencies
├── electron-builder.yml # Build configuration
├── .gitignore          # Git ignore rules
├── LICENSE             # MIT License
└── README.md           # This file
```

## Architecture

### Main Process (`main.js`)
- Creates and manages application windows
- Handles IPC communication with renderer
- Manages application menu and dialogs
- Implements file operations (save/load)

### Preload Script (`preload.js`)
- Provides secure bridge between main and renderer processes
- Exposes only necessary APIs via contextBridge
- Maintains security with context isolation

### Renderer Process (`renderer.js` + `index.html`)
- Handles user interface and interactions
- Manages conversation state
- Communicates with main process via IPC

## Configuration

### Customizing the AI Response

The demo includes a placeholder AI response system in `src/main.js`. To integrate with a real AI service:

1. Install the AI service SDK (e.g., OpenAI, Anthropic)
2. Update the `generateAIResponse()` function in `src/main.js`
3. Add your API configuration

Example:
```javascript
async function generateAIResponse(message) {
  // Replace with actual AI service call
  const response = await yourAIService.chat({
    message: message,
    // ... configuration
  });
  return response.text;
}
```

### Build Configuration

Edit `electron-builder.yml` to customize:
- Application ID and name
- Target platforms and formats
- Icons and assets
- Installation options

## Development

### Tech Stack
- **Electron** - Desktop application framework
- **Node.js** - Runtime environment
- **HTML/CSS/JavaScript** - User interface

### Security Features
- Context isolation enabled
- Node integration disabled
- Content Security Policy enforced
- Secure IPC communication

### Adding Features

1. **New Menu Items**: Edit `createMenu()` in `src/main.js`
2. **UI Components**: Modify `src/index.html` and `src/styles.css`
3. **IPC Handlers**: Add handlers in `src/main.js` and expose via `src/preload.js`
4. **Styling**: Update CSS variables in `src/styles.css`

## Troubleshooting

### Build Issues

**Windows:**
- Install Windows Build Tools: `npm install --global windows-build-tools`

**macOS:**
- Ensure Xcode Command Line Tools are installed: `xcode-select --install`

**Linux:**
- Install required dependencies: `sudo apt-get install libarchive-tools`

### Runtime Issues

**Application won't start:**
- Delete `node_modules/` and run `npm install` again
- Check Node.js version: `node --version` (should be 16+)

**Build fails:**
- Clear cache: `npm cache clean --force`
- Update electron-builder: `npm install --save-dev electron-builder@latest`

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Roadmap

- [x] ~~Markdown rendering in messages~~ ✅ **DONE!**
- [x] ~~Code syntax highlighting~~ ✅ **DONE!**
- [x] ~~Export conversations to Markdown/JSON~~ ✅ **DONE!**
- [x] ~~Integration with 30+ AI services~~ ✅ **DONE!**
- [ ] Multiple conversation tabs
- [ ] Export conversations to PDF
- [ ] Themes and customization options (light mode)
- [ ] Plugin system for extensibility
- [ ] Voice input/output support
- [ ] Image generation inline display
- [ ] Cloud sync across devices

## Acknowledgments

- Built with [Electron](https://www.electronjs.org/)
- Inspired by modern AI chat applications
- Model Context Protocol (MCP) architecture

## Support

For issues, questions, or suggestions:
- Open an [Issue](https://github.com/4429BrandingnMarketing/big-agi-mcp-asst/issues)
- Start a [Discussion](https://github.com/4429BrandingnMarketing/big-agi-mcp-asst/discussions)

---

**Made with ❤️ for the AI community**