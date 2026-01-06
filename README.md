# big-agi-mcp-asst

A comprehensive MCP (Model Context Protocol) server for big-AGI, providing enhanced tools and resources to extend AI assistant capabilities.

## Features

This MCP server provides the following tools:

### Web & Network Tools
- **fetch_url** - Fetch and parse content from any URL (supports text, HTML, and markdown formats)
- **search_web** - Search the web using DuckDuckGo and get formatted results

### Utility Tools
- **calculate** - Perform mathematical calculations and evaluations
- **generate_uuid** - Generate UUIDs (v4) for unique identifiers
- **timestamp** - Get current timestamps or convert between formats (Unix, ISO, UTC, Local)
- **base64_encode** - Encode text to Base64
- **base64_decode** - Decode Base64 strings
- **json_format** - Format, validate, and pretty-print JSON

### Resources
- **help://tools** - View all available tools and their descriptions
- **help://examples** - See usage examples for each tool

## Installation

```bash
npm install
```

## Build

```bash
npm run build
```

## Usage

### With big-AGI

1. Build the server:
   ```bash
   npm run build
   ```

2. Add to your big-AGI MCP configuration (typically in `~/.config/big-agi/mcp.json` or similar):
   ```json
   {
     "mcpServers": {
       "big-agi-assistant": {
         "command": "node",
         "args": ["/path/to/big-agi-mcp-asst/dist/index.js"]
       }
     }
   }
   ```

3. Restart big-AGI to load the MCP server

### Standalone Testing

You can also run the server directly:

```bash
npm start
```

## Available Tools

### fetch_url
Fetch content from a URL and return it in various formats.

**Parameters:**
- `url` (required) - The URL to fetch
- `format` (optional) - Output format: 'text', 'html', or 'markdown' (default: 'text')

**Example:**
```json
{
  "url": "https://example.com",
  "format": "text"
}
```

### search_web
Search the web using DuckDuckGo.

**Parameters:**
- `query` (required) - Search query string
- `max_results` (optional) - Maximum number of results (default: 5)

**Example:**
```json
{
  "query": "TypeScript MCP servers",
  "max_results": 5
}
```

### calculate
Perform mathematical calculations.

**Parameters:**
- `expression` (required) - Mathematical expression to evaluate

**Example:**
```json
{
  "expression": "2 + 2 * 3"
}
```

### generate_uuid
Generate UUIDs.

**Parameters:**
- `version` (optional) - UUID version (currently only v4)
- `count` (optional) - Number of UUIDs to generate (default: 1)

**Example:**
```json
{
  "count": 3
}
```

### timestamp
Get or convert timestamps.

**Parameters:**
- `format` (optional) - Format: 'unix', 'iso', 'utc', or 'local' (default: 'iso')
- `timestamp` (optional) - Unix timestamp to convert (uses current time if not provided)

**Example:**
```json
{
  "format": "iso"
}
```

### base64_encode
Encode text to Base64.

**Parameters:**
- `text` (required) - Text to encode

**Example:**
```json
{
  "text": "Hello World"
}
```

### base64_decode
Decode Base64 to text.

**Parameters:**
- `encoded` (required) - Base64 string to decode

**Example:**
```json
{
  "encoded": "SGVsbG8gV29ybGQ="
}
```

### json_format
Format and validate JSON.

**Parameters:**
- `json` (required) - JSON string to format
- `indent` (optional) - Indentation spaces (default: 2, use 0 for minified)

**Example:**
```json
{
  "json": "{\"key\":\"value\"}",
  "indent": 2
}
```

## Development

### Project Structure

```
big-agi-mcp-asst/
├── src/
│   └── index.ts          # Main MCP server implementation
├── dist/                 # Compiled JavaScript (generated)
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
└── README.md            # This file
```

### Building

```bash
npm run build
```

### Development Mode

```bash
npm run dev
```

This will watch for changes and recompile automatically.

## Requirements

- Node.js 18 or higher
- npm or yarn

## License

MIT License - see [LICENSE](LICENSE) file for details

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## Author

Jason K Salvador

## Links

- [Model Context Protocol](https://modelcontextprotocol.io/)
- [big-AGI](https://github.com/enricoros/big-agi)
- [MCP SDK](https://github.com/modelcontextprotocol/sdk)
