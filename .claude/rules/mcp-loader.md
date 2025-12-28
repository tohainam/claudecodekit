# MCP Auto-Loader

This rule ensures MCP (Model Context Protocol) servers are used when relevant to the task, based on semantic matching.

## Auto-Loading Behavior

At the START of relevant operations:

1. **Analyze the Task**: Understand the user's request, intent, and context
2. **Read Manifest**: Check `.claude/mcp/MANIFEST.md` for available MCP servers
3. **Semantic Match**: Compare task context against each server's full description
4. **Use Matches**: For servers that are semantically relevant, use their tools
5. **Confirm Usage**: Briefly note which MCP servers are being used

## Semantic Matching (Not Keyword Matching)

**DO NOT** just match keywords. Instead, understand the task semantically:

### How to Match

1. Read the task description and understand the **intent**
2. For each MCP server in MANIFEST.md, read its full **description**
3. Determine if the server would be **helpful** for this task
4. Consider the **tools available** and how they apply

### Examples of Semantic Understanding

| Task | Reasoning | MCP Server |
|------|-----------|------------|
| "How do I use React hooks?" | Library documentation needed | context7 |
| "What's the Prisma API for relations?" | Library-specific API lookup | context7 |
| "Debug this complex race condition" | Multi-step analysis needed | sequential-thinking |
| "Design auth architecture" | Trade-off analysis, complex decision | sequential-thinking |
| "Show me Next.js 14 routing" | Framework documentation | context7 |

## MCP Usage Protocol

### For context7 (Library Documentation)

1. First call `resolve-library-id` with the library name
2. Then call `get-library-docs` with the resolved ID and topic
3. Use the fetched documentation to provide accurate answers

### For sequential-thinking (Complex Problems)

1. Start with initial thought about the problem
2. Continue with subsequent thoughts, tracking progress
3. Adjust totalThoughts as understanding evolves
4. Use revision when approach needs to change
5. Set `nextThoughtNeeded: false` only when satisfied

## Confirmation Format

When using MCP servers, briefly note it:

```
Using context7 to fetch [library] documentation...
```

```
Using sequential-thinking for structured analysis...
```

## Priority Guidelines

1. **context7**: Use BEFORE answering library questions from memory
   - Training data may be outdated
   - Documentation is authoritative

2. **sequential-thinking**: Use for genuinely complex problems
   - Don't overuse for simple tasks
   - Reserve for multi-step analysis

## Error Handling

- **MCP server unavailable**: Continue with best effort using training knowledge
- **Library not found in context7**: Note limitation, use training knowledge
- **Never block the user's task** due to MCP issues

## When NOT to Use

### Don't use context7 when:
- Simple questions you know well from training
- General programming concepts (not library-specific)
- User explicitly says "from memory" or "don't look up"

### Don't use sequential-thinking when:
- Simple, straightforward tasks
- Single-step operations
- Tasks that don't benefit from structured analysis

## Adding New MCP Servers

When new MCP servers are added:
1. They will be registered in `.claude/mcp/MANIFEST.md`
2. This rule automatically includes them via semantic matching
3. No need to modify this rule file
