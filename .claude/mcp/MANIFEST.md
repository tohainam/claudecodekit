# MCP Servers Manifest

Central registry of all available MCP servers with descriptions for semantic matching.

## How This Works

1. The `mcp-loader.md` rule reads this manifest
2. It matches task context **semantically** against server descriptions
3. Matching MCP tools are automatically used
4. Confirmation is provided to the user

## Semantic Matching

Claude analyzes the task and determines which MCP servers are relevant based on:
- The full description of each server
- The context and intent of the task
- The tools each server provides

---

## Registered MCP Servers

### context7
**Tools**: `resolve-library-id`, `get-library-docs`
**Description**: Fetches up-to-date documentation for any library, framework, or package. Use when: (1) User asks how to use a specific library/framework, (2) Need accurate API documentation (React, Next.js, Prisma, Vue, Angular, etc.), (3) Implementing features with specific libraries, (4) Debugging library-specific issues, (5) Need current/latest documentation beyond training data, (6) User mentions specific library versions, (7) Working with unfamiliar libraries or APIs, (8) Looking up code examples for a library.

**Usage Flow**:
1. Call `resolve-library-id` with library name to get Context7 ID
2. Call `get-library-docs` with the ID and optional topic

**Freshness**: `fresh`
**Freshness Note**: Real-time documentation fetch from authoritative sources. Always prefer this over training knowledge for library/framework questions.

---

### sequential-thinking
**Tools**: `sequentialthinking`
**Description**: Structured problem-solving through step-by-step thinking with dynamic revision and branching. Use when: (1) Complex multi-step problems requiring careful analysis, (2) Problems where full scope isn't clear initially, (3) Tasks needing hypothesis generation and verification, (4) Debugging complex issues with multiple possible causes, (5) Architectural decisions with many trade-offs, (6) Problems requiring course correction as understanding deepens, (7) Breaking down ambiguous requirements, (8) Root cause analysis for difficult bugs.

**Usage Flow**:
- Call with initial thought, continue with subsequent thoughts
- Adjust totalThoughts as understanding evolves
- Use revision/branching when approach needs to change

**Freshness**: N/A
**Freshness Note**: This is a reasoning tool, not a knowledge source. It structures problem-solving but doesn't provide external information.

---

## Adding New MCP Servers

When adding a new MCP server:

1. Configure the server in Claude Code settings (mcp_settings.json or settings.json)
2. Add an entry to this manifest with:
   - Server name (matches the MCP server name)
   - Tools (list of available tools)
   - Description (comprehensive: what it does + when to use it)
   - Usage Flow (how to use the tools)
3. The mcp-loader rule will automatically include it

### Example Entry

```markdown
### my-new-server
**Tools**: `tool1`, `tool2`, `tool3`
**Description**: [What this server does]. Use when: (1) [scenario 1], (2) [scenario 2], (3) [scenario 3]...

**Usage Flow**:
- [Step-by-step usage instructions]

**Freshness**: `fresh` | `current` | N/A
**Freshness Note**: [Explain the freshness level - e.g., "Real-time data fetch" for fresh, "Cached/recent data" for current, "Not a knowledge source" for N/A]

---
```

## Guidelines

- Descriptions should be comprehensive for semantic matching
- Include specific use cases and scenarios
- List all available tools
- Provide clear usage flow/instructions
- Keep entries in alphabetical order
