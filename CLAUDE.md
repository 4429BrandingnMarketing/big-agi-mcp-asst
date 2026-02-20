# CLAUDE.md — AI Assistant Guidelines for big-agi-mcp-asst

This file provides context and conventions for AI assistants (Claude Code and others) working in this repository.

## Project Overview

**big-agi-mcp-asst** is an MCP (Model Context Protocol) assistant integration project, licensed under MIT. It is designed to extend or complement the [Big AGI](https://github.com/enricoros/big-AGI) ecosystem with MCP-based assistant capabilities.

- **Owner:** Jason K Salvador (4429BrandingnMarketing)
- **License:** MIT
- **Status:** Early development / initialization phase

## Repository State

As of the initial commit, this repository contains only:

| File | Purpose |
|------|---------|
| `README.md` | Project title placeholder |
| `LICENSE` | MIT License (2025, Jason K Salvador) |

No source code, build system, or test infrastructure exists yet. Development setup is forthcoming.

## Intended Architecture (Based on Project Name)

This project is expected to implement one or more of the following:

- An **MCP server** exposing tools or resources for Big AGI
- An **MCP client integration** connecting Big AGI to external services
- An **assistant layer** that wraps or orchestrates MCP-compatible AI models

When source code is added, update this section to reflect the actual architecture.

## Development Branch Convention

Active development branches follow this pattern:

```
claude/<session-identifier>
```

Example: `claude/claude-md-mlv251xhpawab050-RLvdK`

**Never push to `main` directly.** Always open a pull request from a feature branch.

## Git Workflow

1. **Branch** from `main` using the `claude/<id>` naming convention
2. **Commit** with clear, descriptive messages
3. **Push** with: `git push -u origin <branch-name>`
4. **Open a PR** for review before merging

Commits are GPG-signed via SSH key — do not disable signing (`--no-gpg-sign`).

## Expected Tech Stack (Provisional)

Once development begins, this project will likely use:

- **Language:** TypeScript or JavaScript (Node.js)
- **Protocol:** [Model Context Protocol (MCP)](https://modelcontextprotocol.io/)
- **Package manager:** npm or pnpm
- **Build tool:** To be determined (likely tsc / esbuild / vite)
- **Testing:** To be determined (likely Vitest or Jest)

Update this section when `package.json` and build config are added.

## Conventions for AI Assistants

### Reading Before Editing

Always read a file in full before making edits. Never modify code that has not been read in the current session.

### Minimal Changes

Only make changes directly required by the task. Do not refactor, add comments, or extend functionality beyond what is explicitly requested.

### No Speculative Files

Do not create files unless they are strictly necessary for the requested task. Prefer editing existing files over creating new ones.

### Security

- Do not introduce `eval`, dynamic code execution, or unsanitized user input into shell commands
- Validate all external inputs at system boundaries
- Do not commit secrets, `.env` files, or credentials

### Commit Messages

Use the imperative mood and be concise:

```
Add MCP tool handler for file operations
Fix session timeout not being respected
Update README with setup instructions
```

### Code Style (When Source Code Exists)

Follow the conventions already present in the codebase. If none exist yet:

- Use TypeScript with strict mode enabled
- Prefer `const` over `let`; avoid `var`
- Use `async/await` over raw Promise chains
- Export types explicitly; avoid implicit `any`
- Keep functions small and single-purpose

## Setting Up the Project (Future)

Once package infrastructure is added, setup will likely follow:

```bash
# Install dependencies
npm install

# Start development server / MCP server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

Update this section with accurate commands once `package.json` is committed.

## Environment Variables (Future)

Document environment variables here as they are introduced. Example format:

| Variable | Required | Description |
|----------|----------|-------------|
| `MCP_SERVER_PORT` | No | Port for the MCP server (default: 3000) |
| `ANTHROPIC_API_KEY` | Yes | API key for Claude model access |

Store secrets in `.env` (git-ignored). Provide a `.env.example` template for contributors.

## Key Resources

- [Model Context Protocol specification](https://modelcontextprotocol.io/)
- [Big AGI repository](https://github.com/enricoros/big-AGI)
- [Anthropic Claude API docs](https://docs.anthropic.com/)
- [MCP SDK (TypeScript)](https://github.com/modelcontextprotocol/typescript-sdk)

## Updating This File

Keep `CLAUDE.md` current as the project evolves. Update it when:

- New directories or source files are added
- Build/test commands change
- New environment variables are introduced
- Architecture decisions are made
- Coding conventions are established
