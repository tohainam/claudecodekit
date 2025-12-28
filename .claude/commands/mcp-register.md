# Register MCP Server

Register a new MCP server in the system for automatic discovery and usage.

## Input
MCP Server Info: $ARGUMENTS

## Workflow

### Step 1: Gather Information

If $ARGUMENTS is empty or incomplete, ask for:

1. **Server name**: The MCP server identifier (e.g., `filesystem`, `github`, `slack`)
2. **Tools available**: List of tools the server provides
3. **Description**: What the server does and when to use it
4. **Usage flow**: How to use the tools (step-by-step)

Use this format for questions:
```
To register the MCP server, I need:

1. **Server name**: What is the MCP server called?
2. **Tools**: What tools does it provide? (comma-separated)
3. **Description**: What does it do? When should it be used?
4. **Usage flow**: How should the tools be called?
```

### Step 2: Validate MCP Server

Before registering, verify the MCP server exists:

1. Check if the server is configured in Claude Code
2. Confirm the tools are accessible
3. If not accessible, warn user but allow registration anyway (they may add config later)

### Step 3: Update MCP MANIFEST.md

Add the new entry to `.claude/mcp/MANIFEST.md`:

```markdown
### <server-name>
**Tools**: `tool1`, `tool2`, `tool3`
**Description**: [Full description with use cases]

**Usage Flow**:
- [Step-by-step usage instructions]

---
```

**Placement**: Add in alphabetical order among existing entries.

### Step 4: Update mcp-loader.md (if needed)

If the MCP server requires special handling:
1. Add specific protocol section to `.claude/rules/mcp-loader.md`
2. Add examples to the semantic matching table

For most servers, no update needed - semantic matching handles it.

### Step 5: Update CLAUDE.md

Add the new server to the MCP Servers table in `CLAUDE.md`:

```markdown
| <server-name> | <tools> | <brief description> |
```

### Step 6: Confirmation

Report what was updated:
```
MCP Server Registered: <server-name>

Updated files:
- .claude/mcp/MANIFEST.md (added entry)
- CLAUDE.md (updated MCP table)

The server will now be auto-used when tasks match its description semantically.
```

## Example Usage

```
/mcp-register github

> Server: github
> Tools: create_issue, list_issues, create_pr, get_pr, list_prs
> Description: GitHub API operations for issues, PRs, and repository management.
>              Use when: creating/managing issues, pull requests, or repo operations.
> Usage: Call the appropriate tool with required parameters.

Registering...
✓ Added to .claude/mcp/MANIFEST.md
✓ Updated CLAUDE.md MCP table

Done! The github MCP server is now registered.
```

## Quick Registration

For quick registration with all info provided:

```
/mcp-register "github: create_issue, list_issues, create_pr | GitHub API for issues and PRs | Use for GitHub operations"
```

Format: `"name: tools | description | usage notes"`
