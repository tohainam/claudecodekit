# ADR: Knowledge Freshness Strategy

## Metadata
- **Date**: 2025-12-28
- **Status**: accepted
- **Deciders**: user, facilitator-agent
- **Discussion**: `.claude/discussions/2025-12-28-12-30-knowledge-freshness.md`

## Context

### Problem Statement
Claude Code often operates with outdated knowledge during implementation, research, and general tasks. This leads to:
- Using deprecated APIs or outdated library syntax
- Suggesting old best practices instead of current ones
- Not knowing latest versions of tools/frameworks
- Missing recent changes in specifications or documentation

### Technical Context
- `context7` MCP server exists for fetching library documentation
- `mcp-loader.md` rule handles semantic matching for MCP tools
- MCP servers may not always be available (different environments, configurations)
- Different knowledge types (library docs, best practices, versions) require different sources

### Business Context
- Users expect Claude to use the most current information available
- Outdated knowledge leads to rework and frustration
- Transparency about knowledge source builds user trust
- Solution must work across various user environments

## Decision

**We will implement a Graceful Degradation Protocol for knowledge freshness.**

The protocol establishes:

1. **Knowledge Source Priority Chain**
   ```
   Priority 1: MCP Servers (context7, web-search, etc.) - FRESH
   Priority 2: WebSearch tools (if available) - CURRENT
   Priority 3: Local Skills/Documentation - CURATED
   Priority 4: Training Knowledge - MAY BE STALE
   ```

2. **Transparency Requirement**
   - Always state the knowledge source used
   - Indicate confidence level: fresh / current / curated / may-be-stale
   - Warn explicitly when falling back to training data

3. **Domain-Aware Behavior**
   - Library/Framework questions: Prefer context7 MCP
   - Version/Release info: Prefer web search
   - Best practices: Check skills first, then external sources
   - General knowledge: Use available sources with appropriate caveats

4. **Implementation**: Single rule file `.claude/rules/knowledge-freshness.md`

## Rationale

### Why This Approach

1. **Pragmatic over Perfect**: Addresses the core problem (transparency and priority) without over-engineering
2. **Works Everywhere**: Functions with or without MCP servers - graceful degradation
3. **Low Maintenance**: Single rule file, leverages existing infrastructure
4. **Transparent**: Users always know what they're getting
5. **Extensible**: Can evolve to more comprehensive system later

### Alternatives Considered

#### Alternative 1: Simple Rule (Approach A)
- **Description**: Basic instruction to prefer fresh sources
- **Rejected because**: Too minimal, lacks structure for consistent application

#### Alternative 2: Knowledge Source Manifest (Approach B)
- **Description**: Separate registry of all knowledge sources
- **Rejected because**: Adds maintenance burden, duplicates MCP manifest, medium effort for marginal benefit

#### Alternative 3: Comprehensive Knowledge Fetcher (Approach C)
- **Description**: Full system with domain detection, skill integration, proactive fetching
- **Rejected because**: Over-engineering for current needs, high complexity, YAGNI principle

## Consequences

### Positive
- Users will always know the source and freshness of knowledge used
- Claude will use best available source in any environment
- Explicit warnings when using potentially stale training data
- Simple to maintain and extend
- Integrates naturally with existing MCP and skill loaders

### Negative
- Does not add new knowledge sources (must add MCP servers separately)
- Relies on Claude following instructions (no enforcement mechanism)
- May require tuning based on real-world usage patterns

### Neutral
- Requires users to understand source attribution messages
- Performance unchanged (no additional fetching overhead)
- Existing MCP behavior preserved, just made more transparent

## Implementation Notes

### Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `.claude/rules/knowledge-freshness.md` | Create | Core protocol definition |
| `.claude/mcp/MANIFEST.md` | Update | Add freshness context to entries |

### Protocol Structure (knowledge-freshness.md)

```markdown
# Knowledge Freshness Protocol

## Purpose
Ensure Claude always uses the freshest knowledge available and is transparent about sources.

## Source Priority
1. MCP Servers (context7, etc.) - Label: "fresh"
2. WebSearch tools - Label: "current"
3. Local Skills - Label: "curated"
4. Training Knowledge - Label: "may be stale" + explicit warning

## Domain Mapping
- Library docs: context7 first
- Versions: web search first
- Best practices: skills + external
- General: available sources with caveats

## Transparency Format
"Source: [source-name] ([freshness-level])"
"Note: Using training knowledge - may be outdated"
```

### Verification
- Test with context7 available: Should use MCP and report "fresh"
- Test without context7: Should fallback with "may be stale" warning
- Test with library question: Should attempt context7 first
- Test with version question: Should prefer web search if available

## Related Decisions
- Skill Auto-Loading: `.claude/discussions/2025-12-28-11-56-skill-auto-loading.md` - Similar pattern of semantic matching and transparency

---
*Decision recorded by facilitator-agent*
