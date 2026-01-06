# Big-AGI MCP Assistant

A powerful Model Context Protocol (MCP) server that provides utility tools and resources for AI assistants, specifically designed to integrate with Big-AGI and other MCP-compatible clients.

## Features

This MCP server provides a comprehensive set of tools:

- **Mathematical Calculations**: Evaluate mathematical expressions
- **Text Analysis**: Analyze text for word count, character count, sentence count, and average word length
- **JSON Formatting**: Format and validate JSON with customizable indentation
- **Timestamp Conversion**: Convert between timestamps and human-readable dates
- **Base64 Encoding/Decoding**: Encode and decode base64 strings
- **UUID Generation**: Generate UUID v4 identifiers
- **Text Hashing**: Generate hashes using MD5, SHA1, SHA256, or SHA512 algorithms

## Installation

```bash
# Clone the repository
git clone https://github.com/4429BrandingnMarketing/big-agi-mcp-asst.git
cd big-agi-mcp-asst

# Install dependencies
npm install

# Build the project
npm run build
```

## Usage

### Standalone Server

Run the server directly:

```bash
npm start
```

### Integration with MCP Clients

#### Big-AGI Configuration

Add this server to your Big-AGI MCP configuration:

```json
{
  "mcpServers": {
    "big-agi-assistant": {
      "command": "node",
      "args": ["/path/to/big-agi-mcp-asst/dist/index.js"],
      "env": {}
    }
  }
}
```

#### Claude Desktop Configuration

Add to your Claude Desktop configuration (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "big-agi-assistant": {
      "command": "node",
      "args": ["/absolute/path/to/big-agi-mcp-asst/dist/index.js"]
    }
  }
}
```

## Available Tools

### 1. calculate

Perform mathematical calculations with support for complex expressions.

```json
{
  "expression": "2 + 2 * 3"
}
```

### 2. text_analysis

Analyze text for various metrics.

```json
{
  "text": "Your text here",
  "metrics": ["word_count", "char_count", "sentence_count", "avg_word_length"]
}
```

Available metrics:
- `word_count`: Count of words
- `char_count`: Count of characters (with and without spaces)
- `sentence_count`: Count of sentences
- `avg_word_length`: Average word length
- `all`: All metrics (default)

### 3. format_json

Format and validate JSON data.

```json
{
  "json": "{\"key\":\"value\"}",
  "indent": 2
}
```

### 4. timestamp_converter

Convert between timestamps and dates.

```json
{
  "input": "1609459200000",
  "output_format": "iso"
}
```

Output formats:
- `iso`: ISO 8601 format
- `locale`: Localized string
- `timestamp`: Unix timestamp in milliseconds

### 5. base64_encode_decode

Encode or decode base64 strings.

```json
{
  "input": "Hello, World!",
  "operation": "encode"
}
```

Operations: `encode`, `decode`

### 6. generate_uuid

Generate UUID v4 identifiers.

```json
{
  "count": 5
}
```

Generates 1-100 UUIDs (default: 1)

### 7. hash_text

Generate cryptographic hashes of text.

```json
{
  "text": "Hello, World!",
  "algorithm": "sha256"
}
```

Supported algorithms: `md5`, `sha1`, `sha256`, `sha512`

## Available Resources

### assistant://capabilities

Returns JSON with all available tools and their capabilities.

### assistant://help

Returns help documentation for the server.

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Development mode (watch)
npm run dev
```

## Project Structure

```
big-agi-mcp-asst/
├── src/
│   └── index.ts          # Main server implementation
├── dist/                 # Compiled JavaScript (generated)
├── package.json          # Project configuration
├── tsconfig.json         # TypeScript configuration
├── .env.example          # Example environment variables
├── .gitignore           # Git ignore rules
└── README.md            # This file
```

## Requirements

- Node.js >= 18.0.0
- npm or yarn

## Environment Variables

Copy `.env.example` to `.env` and customize as needed:

```bash
cp .env.example .env
```

Available configuration options:
- `SERVER_NAME`: Server identifier
- `SERVER_VERSION`: Server version
- `LOG_LEVEL`: Logging level (debug, info, warn, error)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see [LICENSE](LICENSE) file for details

## Author

Jason K Salvador

## Related Projects

- [Model Context Protocol](https://modelcontextprotocol.io) - The MCP specification
- [Big-AGI](https://github.com/enricoros/big-AGI) - AI interface that supports MCP
- [MCP SDK](https://github.com/modelcontextprotocol/sdk) - Official MCP SDK

## Support

For issues, questions, or contributions, please visit the [GitHub repository](https://github.com/4429BrandingnMarketing/big-agi-mcp-asst).