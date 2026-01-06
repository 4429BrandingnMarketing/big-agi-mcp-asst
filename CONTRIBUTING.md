# Contributing to Big-AGI MCP Assistant

Thank you for your interest in contributing to Big-AGI MCP Assistant! This document provides guidelines and instructions for contributing.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/big-agi-mcp-asst.git`
3. Create a new branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Test your changes
6. Commit your changes: `git commit -m "Add: description of your changes"`
7. Push to your fork: `git push origin feature/your-feature-name`
8. Open a Pull Request

## Development Setup

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run in development mode with watch
npm run dev
```

## Code Style

- Use TypeScript for all code
- Follow existing code formatting
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions focused and single-purpose

## Adding New Tools

To add a new tool to the MCP server:

1. Define the tool in the `tools` array with proper schema:
```typescript
{
  name: "your_tool_name",
  description: "Clear description of what the tool does",
  inputSchema: {
    type: "object",
    properties: {
      param1: {
        type: "string",
        description: "Description of parameter"
      }
    },
    required: ["param1"]
  }
}
```

2. Implement the tool function:
```typescript
function yourToolFunction(param1: string): string {
  // Implementation
  return result;
}
```

3. Add the tool handler in the `CallToolRequestSchema` handler:
```typescript
case "your_tool_name": {
  const result = yourToolFunction(args.param1 as string);
  return {
    content: [{ type: "text", text: result }]
  };
}
```

4. Update documentation in README.md

## Testing

Before submitting a PR:

1. Build the project: `npm run build`
2. Test the server manually with an MCP client
3. Verify all existing tools still work
4. Test your new feature thoroughly

## Commit Messages

Use clear, descriptive commit messages:

- `Add: new feature or functionality`
- `Fix: bug fix`
- `Update: changes to existing functionality`
- `Docs: documentation changes`
- `Refactor: code refactoring`
- `Test: adding or updating tests`

## Pull Request Guidelines

- Provide a clear description of the changes
- Reference any related issues
- Include screenshots or examples if applicable
- Ensure the code builds without errors
- Update documentation as needed

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Focus on constructive feedback
- Help others learn and grow

## Questions?

If you have questions or need help, please open an issue or reach out to the maintainers.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
