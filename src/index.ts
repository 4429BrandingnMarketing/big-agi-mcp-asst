#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ErrorCode,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { marked } from 'marked';

interface TextContent {
  type: 'text';
  text: string;
}

interface Tool {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

const server = new Server(
  {
    name: 'big-agi-mcp-asst',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  }
);

// Tool definitions
const tools: Tool[] = [
  {
    name: 'fetch_url',
    description: 'Fetch content from a URL and return the text content. Useful for gathering information from web pages.',
    inputSchema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description: 'The URL to fetch',
        },
        format: {
          type: 'string',
          enum: ['text', 'html', 'markdown'],
          description: 'Output format (default: text)',
        },
      },
      required: ['url'],
    },
  },
  {
    name: 'search_web',
    description: 'Search the web using DuckDuckGo and return results with titles, snippets, and URLs.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query',
        },
        max_results: {
          type: 'number',
          description: 'Maximum number of results to return (default: 5)',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'calculate',
    description: 'Perform mathematical calculations. Supports basic arithmetic, trigonometry, and common math functions.',
    inputSchema: {
      type: 'object',
      properties: {
        expression: {
          type: 'string',
          description: 'Mathematical expression to evaluate (e.g., "2 + 2", "sin(pi/2)", "sqrt(16)")',
        },
      },
      required: ['expression'],
    },
  },
  {
    name: 'generate_uuid',
    description: 'Generate a UUID (Universally Unique Identifier) in various formats.',
    inputSchema: {
      type: 'object',
      properties: {
        version: {
          type: 'number',
          enum: [4],
          description: 'UUID version (currently only v4 supported)',
        },
        count: {
          type: 'number',
          description: 'Number of UUIDs to generate (default: 1)',
        },
      },
    },
  },
  {
    name: 'timestamp',
    description: 'Get current timestamp in various formats or convert between formats.',
    inputSchema: {
      type: 'object',
      properties: {
        format: {
          type: 'string',
          enum: ['unix', 'iso', 'utc', 'local'],
          description: 'Timestamp format (default: iso)',
        },
        timestamp: {
          type: 'number',
          description: 'Unix timestamp to convert (optional, uses current time if not provided)',
        },
      },
    },
  },
  {
    name: 'base64_encode',
    description: 'Encode text to Base64.',
    inputSchema: {
      type: 'object',
      properties: {
        text: {
          type: 'string',
          description: 'Text to encode',
        },
      },
      required: ['text'],
    },
  },
  {
    name: 'base64_decode',
    description: 'Decode Base64 to text.',
    inputSchema: {
      type: 'object',
      properties: {
        encoded: {
          type: 'string',
          description: 'Base64 encoded string to decode',
        },
      },
      required: ['encoded'],
    },
  },
  {
    name: 'json_format',
    description: 'Format and validate JSON. Pretty-print or minify JSON strings.',
    inputSchema: {
      type: 'object',
      properties: {
        json: {
          type: 'string',
          description: 'JSON string to format',
        },
        indent: {
          type: 'number',
          description: 'Number of spaces for indentation (default: 2, use 0 for minified)',
        },
      },
      required: ['json'],
    },
  },
];

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools,
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'fetch_url': {
        const { url, format = 'text' } = args as { url: string; format?: string };

        const response = await axios.get(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
          timeout: 10000,
        });

        let content: string;
        if (format === 'html') {
          content = response.data;
        } else if (format === 'markdown') {
          const $ = cheerio.load(response.data);
          $('script, style, nav, footer, aside').remove();
          const text = $('body').text().trim();
          content = text;
        } else {
          const $ = cheerio.load(response.data);
          $('script, style, nav, footer, aside').remove();
          content = $('body').text().trim().replace(/\s+/g, ' ');
        }

        return {
          content: [
            {
              type: 'text',
              text: content,
            } as TextContent,
          ],
        };
      }

      case 'search_web': {
        const { query, max_results = 5 } = args as { query: string; max_results?: number };

        const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
        const response = await axios.get(searchUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
          timeout: 10000,
        });

        const $ = cheerio.load(response.data);
        const results: Array<{ title: string; snippet: string; url: string }> = [];

        $('.result').slice(0, max_results).each((_, elem) => {
          const title = $(elem).find('.result__title').text().trim();
          const snippet = $(elem).find('.result__snippet').text().trim();
          const url = $(elem).find('.result__url').attr('href') || '';

          if (title && url) {
            results.push({ title, snippet, url });
          }
        });

        const formattedResults = results
          .map((r, i) => `${i + 1}. ${r.title}\n   ${r.snippet}\n   ${r.url}`)
          .join('\n\n');

        return {
          content: [
            {
              type: 'text',
              text: formattedResults || 'No results found.',
            } as TextContent,
          ],
        };
      }

      case 'calculate': {
        const { expression } = args as { expression: string };

        const sanitized = expression
          .replace(/[^0-9+\-*/().,\s]/g, '')
          .replace(/\s+/g, '');

        try {
          const result = eval(sanitized);
          return {
            content: [
              {
                type: 'text',
                text: `${expression} = ${result}`,
              } as TextContent,
            ],
          };
        } catch (error) {
          throw new McpError(
            ErrorCode.InvalidRequest,
            `Invalid mathematical expression: ${error instanceof Error ? error.message : 'Unknown error'}`
          );
        }
      }

      case 'generate_uuid': {
        const { count = 1 } = args as { version?: number; count?: number };

        const uuids: string[] = [];
        for (let i = 0; i < count; i++) {
          uuids.push(crypto.randomUUID());
        }

        return {
          content: [
            {
              type: 'text',
              text: uuids.join('\n'),
            } as TextContent,
          ],
        };
      }

      case 'timestamp': {
        const { format = 'iso', timestamp } = args as { format?: string; timestamp?: number };

        const date = timestamp ? new Date(timestamp * 1000) : new Date();
        let result: string;

        switch (format) {
          case 'unix':
            result = Math.floor(date.getTime() / 1000).toString();
            break;
          case 'iso':
            result = date.toISOString();
            break;
          case 'utc':
            result = date.toUTCString();
            break;
          case 'local':
            result = date.toLocaleString();
            break;
          default:
            result = date.toISOString();
        }

        return {
          content: [
            {
              type: 'text',
              text: result,
            } as TextContent,
          ],
        };
      }

      case 'base64_encode': {
        const { text } = args as { text: string };
        const encoded = Buffer.from(text).toString('base64');

        return {
          content: [
            {
              type: 'text',
              text: encoded,
            } as TextContent,
          ],
        };
      }

      case 'base64_decode': {
        const { encoded } = args as { encoded: string };

        try {
          const decoded = Buffer.from(encoded, 'base64').toString('utf-8');
          return {
            content: [
              {
                type: 'text',
                text: decoded,
              } as TextContent,
            ],
          };
        } catch (error) {
          throw new McpError(
            ErrorCode.InvalidRequest,
            `Invalid Base64 string: ${error instanceof Error ? error.message : 'Unknown error'}`
          );
        }
      }

      case 'json_format': {
        const { json, indent = 2 } = args as { json: string; indent?: number };

        try {
          const parsed = JSON.parse(json);
          const formatted = indent === 0
            ? JSON.stringify(parsed)
            : JSON.stringify(parsed, null, indent);

          return {
            content: [
              {
                type: 'text',
                text: formatted,
              } as TextContent,
            ],
          };
        } catch (error) {
          throw new McpError(
            ErrorCode.InvalidRequest,
            `Invalid JSON: ${error instanceof Error ? error.message : 'Unknown error'}`
          );
        }
      }

      default:
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Unknown tool: ${name}`
        );
    }
  } catch (error) {
    if (error instanceof McpError) {
      throw error;
    }
    throw new McpError(
      ErrorCode.InternalError,
      `Error executing tool: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
});

// List available resources
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: 'help://tools',
        name: 'Available Tools',
        description: 'List of all available tools and their descriptions',
        mimeType: 'text/plain',
      },
      {
        uri: 'help://examples',
        name: 'Usage Examples',
        description: 'Examples of how to use the MCP server tools',
        mimeType: 'text/plain',
      },
    ],
  };
});

// Handle resource reads
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;

  switch (uri) {
    case 'help://tools': {
      const toolsList = tools
        .map((tool) => `${tool.name}\n  ${tool.description}`)
        .join('\n\n');

      return {
        contents: [
          {
            uri,
            mimeType: 'text/plain',
            text: `Available Tools:\n\n${toolsList}`,
          },
        ],
      };
    }

    case 'help://examples': {
      const examples = `
Usage Examples:

1. Fetch URL Content:
   Tool: fetch_url
   Args: { "url": "https://example.com", "format": "text" }

2. Search the Web:
   Tool: search_web
   Args: { "query": "TypeScript best practices", "max_results": 5 }

3. Calculate Math:
   Tool: calculate
   Args: { "expression": "2 + 2 * 3" }

4. Generate UUID:
   Tool: generate_uuid
   Args: { "count": 3 }

5. Get Timestamp:
   Tool: timestamp
   Args: { "format": "iso" }

6. Base64 Encode:
   Tool: base64_encode
   Args: { "text": "Hello World" }

7. Base64 Decode:
   Tool: base64_decode
   Args: { "encoded": "SGVsbG8gV29ybGQ=" }

8. Format JSON:
   Tool: json_format
   Args: { "json": "{\\"key\\":\\"value\\"}", "indent": 2 }
`;

      return {
        contents: [
          {
            uri,
            mimeType: 'text/plain',
            text: examples.trim(),
          },
        ],
      };
    }

    default:
      throw new McpError(
        ErrorCode.InvalidRequest,
        `Unknown resource: ${uri}`
      );
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('big-agi-mcp-asst MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error in main():', error);
  process.exit(1);
});
