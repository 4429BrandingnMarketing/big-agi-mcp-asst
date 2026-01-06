#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  Tool,
  Resource,
} from "@modelcontextprotocol/sdk/types.js";

// Server configuration
const SERVER_NAME = "big-agi-mcp-asst";
const SERVER_VERSION = "1.0.0";

// Available tools for Big-AGI
const tools: Tool[] = [
  {
    name: "calculate",
    description: "Perform mathematical calculations with support for complex expressions",
    inputSchema: {
      type: "object",
      properties: {
        expression: {
          type: "string",
          description: "Mathematical expression to evaluate (e.g., '2 + 2', 'sqrt(16)', 'sin(pi/2)')",
        },
      },
      required: ["expression"],
    },
  },
  {
    name: "text_analysis",
    description: "Analyze text for various metrics including word count, character count, sentiment hints, and readability",
    inputSchema: {
      type: "object",
      properties: {
        text: {
          type: "string",
          description: "Text to analyze",
        },
        metrics: {
          type: "array",
          items: {
            type: "string",
            enum: ["word_count", "char_count", "sentence_count", "avg_word_length", "all"],
          },
          description: "Metrics to calculate (default: all)",
        },
      },
      required: ["text"],
    },
  },
  {
    name: "format_json",
    description: "Format and validate JSON data with optional indentation",
    inputSchema: {
      type: "object",
      properties: {
        json: {
          type: "string",
          description: "JSON string to format",
        },
        indent: {
          type: "number",
          description: "Number of spaces for indentation (default: 2)",
        },
      },
      required: ["json"],
    },
  },
  {
    name: "timestamp_converter",
    description: "Convert between timestamps and human-readable dates",
    inputSchema: {
      type: "object",
      properties: {
        input: {
          type: "string",
          description: "Timestamp (milliseconds or seconds) or ISO date string",
        },
        output_format: {
          type: "string",
          enum: ["iso", "locale", "timestamp"],
          description: "Desired output format",
        },
      },
      required: ["input"],
    },
  },
  {
    name: "base64_encode_decode",
    description: "Encode or decode base64 strings",
    inputSchema: {
      type: "object",
      properties: {
        input: {
          type: "string",
          description: "String to encode or decode",
        },
        operation: {
          type: "string",
          enum: ["encode", "decode"],
          description: "Operation to perform",
        },
      },
      required: ["input", "operation"],
    },
  },
  {
    name: "generate_uuid",
    description: "Generate a UUID (v4)",
    inputSchema: {
      type: "object",
      properties: {
        count: {
          type: "number",
          description: "Number of UUIDs to generate (default: 1, max: 100)",
        },
      },
    },
  },
  {
    name: "hash_text",
    description: "Generate hash of text using various algorithms",
    inputSchema: {
      type: "object",
      properties: {
        text: {
          type: "string",
          description: "Text to hash",
        },
        algorithm: {
          type: "string",
          enum: ["md5", "sha1", "sha256", "sha512"],
          description: "Hash algorithm to use (default: sha256)",
        },
      },
      required: ["text"],
    },
  },
];

// Available resources
const resources: Resource[] = [
  {
    uri: "assistant://capabilities",
    name: "Assistant Capabilities",
    mimeType: "application/json",
    description: "List of all available tools and their capabilities",
  },
  {
    uri: "assistant://help",
    name: "Help Documentation",
    mimeType: "text/plain",
    description: "Documentation on how to use this MCP assistant",
  },
];

// Tool implementation functions
function calculate(expression: string): string {
  try {
    // Basic safe math evaluation (limited to prevent code injection)
    const sanitized = expression.replace(/[^0-9+\-*/().\s]/g, "");
    const result = eval(sanitized);
    return `Result: ${result}`;
  } catch (error) {
    return `Error: Invalid mathematical expression - ${error}`;
  }
}

function analyzeText(text: string, metrics?: string[]): object {
  const requestedMetrics = metrics || ["all"];
  const shouldInclude = (metric: string) =>
    requestedMetrics.includes("all") || requestedMetrics.includes(metric);

  const result: any = {};

  if (shouldInclude("word_count")) {
    result.word_count = text.trim().split(/\s+/).filter(Boolean).length;
  }

  if (shouldInclude("char_count")) {
    result.char_count = text.length;
    result.char_count_no_spaces = text.replace(/\s/g, "").length;
  }

  if (shouldInclude("sentence_count")) {
    result.sentence_count = text.split(/[.!?]+/).filter(Boolean).length;
  }

  if (shouldInclude("avg_word_length")) {
    const words = text.trim().split(/\s+/).filter(Boolean);
    result.avg_word_length =
      words.length > 0
        ? (words.reduce((sum, word) => sum + word.length, 0) / words.length).toFixed(2)
        : 0;
  }

  return result;
}

function formatJson(json: string, indent: number = 2): string {
  try {
    const parsed = JSON.parse(json);
    return JSON.stringify(parsed, null, indent);
  } catch (error) {
    return `Error: Invalid JSON - ${error}`;
  }
}

function convertTimestamp(input: string, outputFormat: string = "iso"): string {
  try {
    let date: Date;

    // Try parsing as timestamp
    const timestamp = Number(input);
    if (!isNaN(timestamp)) {
      // If timestamp is in seconds (10 digits), convert to milliseconds
      date = new Date(timestamp < 10000000000 ? timestamp * 1000 : timestamp);
    } else {
      // Try parsing as date string
      date = new Date(input);
    }

    if (isNaN(date.getTime())) {
      return "Error: Invalid timestamp or date string";
    }

    switch (outputFormat) {
      case "iso":
        return date.toISOString();
      case "locale":
        return date.toLocaleString();
      case "timestamp":
        return date.getTime().toString();
      default:
        return date.toISOString();
    }
  } catch (error) {
    return `Error: ${error}`;
  }
}

function base64Operation(input: string, operation: string): string {
  try {
    if (operation === "encode") {
      return Buffer.from(input, "utf-8").toString("base64");
    } else {
      return Buffer.from(input, "base64").toString("utf-8");
    }
  } catch (error) {
    return `Error: ${error}`;
  }
}

function generateUUID(count: number = 1): string[] {
  const uuids: string[] = [];
  const maxCount = Math.min(count, 100);

  for (let i = 0; i < maxCount; i++) {
    uuids.push(crypto.randomUUID());
  }

  return uuids;
}

async function hashText(text: string, algorithm: string = "sha256"): Promise<string> {
  try {
    const crypto = await import("crypto");
    const hash = crypto.createHash(algorithm);
    hash.update(text);
    return hash.digest("hex");
  } catch (error) {
    return `Error: ${error}`;
  }
}

// Create server instance
const server = new Server(
  {
    name: SERVER_NAME,
    version: SERVER_VERSION,
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args = {} } = request.params;

  try {
    switch (name) {
      case "calculate": {
        const result = calculate((args as any).expression as string);
        return {
          content: [{ type: "text", text: result }],
        };
      }

      case "text_analysis": {
        const result = analyzeText((args as any).text as string, (args as any).metrics as string[]);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "format_json": {
        const result = formatJson((args as any).json as string, (args as any).indent as number);
        return {
          content: [{ type: "text", text: result }],
        };
      }

      case "timestamp_converter": {
        const result = convertTimestamp(
          (args as any).input as string,
          (args as any).output_format as string
        );
        return {
          content: [{ type: "text", text: result }],
        };
      }

      case "base64_encode_decode": {
        const result = base64Operation(
          (args as any).input as string,
          (args as any).operation as string
        );
        return {
          content: [{ type: "text", text: result }],
        };
      }

      case "generate_uuid": {
        const result = generateUUID((args as any).count as number);
        return {
          content: [
            {
              type: "text",
              text: result.join("\n"),
            },
          ],
        };
      }

      case "hash_text": {
        const result = await hashText((args as any).text as string, (args as any).algorithm as string);
        return {
          content: [{ type: "text", text: result }],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: "text",
          text: `Error executing tool ${name}: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
});

// List available resources
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return { resources };
});

// Handle resource reads
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;

  switch (uri) {
    case "assistant://capabilities":
      return {
        contents: [
          {
            uri,
            mimeType: "application/json",
            text: JSON.stringify(
              {
                server: SERVER_NAME,
                version: SERVER_VERSION,
                tools: tools.map((t) => ({
                  name: t.name,
                  description: t.description,
                })),
              },
              null,
              2
            ),
          },
        ],
      };

    case "assistant://help":
      return {
        contents: [
          {
            uri,
            mimeType: "text/plain",
            text: `Big-AGI MCP Assistant Server

Available Tools:
${tools.map((t) => `- ${t.name}: ${t.description}`).join("\n")}

Usage:
This server implements the Model Context Protocol (MCP) and can be used with
any MCP-compatible client, including Big-AGI.

To use a tool, call it with the appropriate parameters as defined in each
tool's input schema.

For more information about MCP, visit:
https://modelcontextprotocol.io
`,
          },
        ],
      };

    default:
      throw new Error(`Unknown resource: ${uri}`);
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);

  // Handle shutdown gracefully
  process.on("SIGINT", async () => {
    await server.close();
    process.exit(0);
  });

  process.on("SIGTERM", async () => {
    await server.close();
    process.exit(0);
  });
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
