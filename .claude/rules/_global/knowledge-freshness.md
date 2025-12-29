# Knowledge Freshness Protocol

This protocol ensures Claude always uses the freshest available knowledge source and transparently communicates the source and confidence level to users.

## Purpose

**Why this protocol exists:**
- Prevent outdated information from being presented as current
- Transparently communicate knowledge source and freshness
- Establish clear priority chain for knowledge retrieval
- Enable graceful degradation when fresh sources unavailable
- Build user trust through explicit source attribution

## Auto-Activation

This protocol applies to:
- Questions about specific libraries, frameworks, or tools
- API/syntax questions requiring current documentation
- Version-specific information or release details
- Best practices that may have evolved
- Any domain where training data may be stale (technology moves fast)

**Skip this protocol for:**
- General programming concepts (algorithms, data structures)
- Historical/established facts
- User preferences or project-specific decisions
- Simple clarifications or confirmations

## Source Priority Chain

Always attempt sources in this priority order:

| Priority | Source | Freshness Label | When to Use | Examples |
|----------|--------|----------------|-------------|----------|
| 1 | MCP Servers (context7, web-search) | `fresh` | Library docs, real-time data | context7 for React docs |
| 2 | Web Search Tools | `current` | Version info, recent releases | Package version lookups |
| 3 | Local Skills/Documentation | `curated` | Best practices, patterns | Testing strategies, security guides |
| 4 | Training Knowledge | `may-be-stale` | Fallback only | When no other source available |

**Priority Rule**: Always use the highest-priority available source. If a higher-priority source fails, fall back to the next level and note the degradation.

## Domain-Aware Behavior

Different knowledge domains have different optimal sources:

| Knowledge Domain | Preferred Source | Fallback Source | Reasoning |
|------------------|------------------|-----------------|-----------|
| Library/Framework API | context7 MCP | Training (with warning) | APIs change frequently, docs are authoritative |
| Specific Version Syntax | Web Search or context7 | Training (with strong warning) | Version-specific details critical |
| Release/Version Info | Web Search | Training (with date caveat) | Releases happen after training cutoff |
| Best Practices | Local Skills → context7 | Training | Practices evolve, but slower than APIs |
| Design Patterns | Local Skills | Training | Relatively stable over time |
| General Concepts | Training | N/A | Foundational knowledge unlikely stale |
| Security Vulnerabilities | Web Search (if available) | Skills → Training | Security landscape changes rapidly |

## Transparency Protocol

### When to Show Source Attribution

**Always show for:**
- Library/framework-specific questions
- Version-specific information
- When user asks "how to" for specific tools
- Security or vulnerability questions
- Anything where staleness matters

**Optionally show for:**
- General best practices (brief mention)
- Follow-up questions in same context

**Never needed for:**
- Obvious general knowledge
- User's own project context
- Simple acknowledgments

### Attribution Format

**Inline format (preferred for brief mentions):**
```
[Answer content] (via context7)
```

**Footer format (for detailed answers):**
```
[Answer content]

---
Source: context7 (fresh - retrieved from official documentation)
```

**Staleness warning format:**
```
[Answer content]

⚠️ Note: This information is from my training data (January 2025).
For the most current documentation, I recommend checking [official source].
```

### Freshness Label Meanings

- **fresh**: Retrieved in real-time from authoritative source (MCP servers)
- **current**: Recently retrieved or verified (web search, if available)
- **curated**: From maintained local documentation/skills (project-specific or carefully curated)
- **may-be-stale**: From training knowledge (cutoff January 2025)

## Staleness Warning Templates

### Standard Fallback Warning
```
⚠️ Note: This answer is based on my training data (current through January 2025).
For the most up-to-date information, please check the official [library/framework] documentation.
```

### Version-Specific Warning (Strong)
```
⚠️ Important: This syntax/API information is from my training data (January 2025).
Since you're asking about a specific version, I strongly recommend verifying against
the official [library] documentation for [version], as APIs can change between versions.
```

### Security/Vulnerability Warning
```
⚠️ Security Notice: This information is from my training data (January 2025).
Security vulnerabilities and best practices evolve rapidly. Please verify against
current security advisories and the latest [tool/framework] security documentation.
```

### Release/Version Info Warning
```
⚠️ Note: Version and release information is from my training data (January 2025).
For the latest releases and changelogs, please check the official repository or
package registry.
```

## Integration with Other Rules

### Works with mcp-loader.md
- **mcp-loader** handles WHEN to use MCP servers (semantic matching)
- **knowledge-freshness** handles HOW to attribute the source and warn on fallback
- No conflict: mcp-loader triggers MCP usage → knowledge-freshness adds attribution

### Works with skill-loader.md
- **skill-loader** loads relevant skills based on task context
- **knowledge-freshness** treats loaded skills as "curated" sources (Priority 3)
- Skills used before training fallback, but after MCP/web search

### Confirmation Format Consistency
Follow the brief inline format established by mcp-loader and skill-loader:

```
Using context7 to fetch React documentation... (fresh)
```

```
Referencing testing skill... (curated)
```

```
Based on training knowledge (may-be-stale - January 2025 cutoff)
```

## Examples

### Example 1: MCP Available (Fresh)

**User**: "How do I use React useEffect with cleanup?"

**Response**:
```
Using context7 to fetch React documentation...

The useEffect hook supports cleanup functions for side effects. Here's the pattern:

[Code example and explanation from context7]

(Source: React official documentation via context7 - fresh)
```

**Reasoning**: Library-specific question → context7 available → use it → mark as "fresh"

---

### Example 2: MCP Unavailable, Skill Used (Curated)

**User**: "What's the best way to structure tests?"

**Response**:
```
Skills Loaded: testing

Based on testing best practices (curated from local testing skill):

[Test structure recommendations from skill]

For framework-specific testing patterns, I can fetch current documentation if you
specify your testing framework (e.g., Vitest, Jest, pytest).
```

**Reasoning**: Best practices question → testing skill loaded → mark as "curated" → offer to fetch fresh docs

---

### Example 3: Training Data Fallback (May-Be-Stale)

**User**: "What's the syntax for Prisma relations in version 5?"

**Response** (if context7 unavailable):
```
Based on my training knowledge, Prisma relations use the @relation decorator:

[Code example]

⚠️ Important: This syntax information is from my training data (January 2025).
Since you're asking about Prisma version 5 specifically, I strongly recommend
verifying against the official Prisma documentation for that version, as the
API may have changed. Would you like me to try fetching the current documentation
via context7?
```

**Reasoning**: Version-specific API question → context7 should be used but unavailable → fall back to training → strong warning → offer alternative

---

### Example 4: General Knowledge (No Attribution Needed)

**User**: "What's the difference between a stack and a queue?"

**Response**:
```
A stack is a Last-In-First-Out (LIFO) data structure...
A queue is a First-In-First-Out (FIFO) data structure...

[Explanation]
```

**Reasoning**: General CS concept → stable knowledge → no attribution needed

## Error Handling

### When MCP Servers Fail
- Continue with next priority source (skills, then training)
- Add attribution noting the fallback: `(context7 unavailable, using curated skill)`
- Never block the user's task due to source unavailability

### When Freshness Level Uncertain
- Default to the most conservative (least fresh) label
- If unsure between "curated" and "may-be-stale", use "may-be-stale"
- Better to over-warn than under-warn

### When Attribution Becomes Verbose
- For follow-up questions in the same context, brief inline mention is sufficient
- After first detailed attribution, subsequent answers can use: `(same source)`
- Prioritize answer clarity over attribution completeness

### Never Block User Tasks
- If attribution logic fails, provide the answer without attribution
- Source transparency is important but not more important than helping the user
- Log the issue internally but continue serving the user

## Performance Notes

- Source checking is lightweight (read MANIFEST, check availability)
- Attribution adds minimal overhead (inline text)
- Freshness protocol does not slow down responses
- Staleness warnings only when actually falling back to training data
