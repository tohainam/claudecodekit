---
name: documentation
description: |
  Universal documentation skill for creating high-quality technical documentation across all technologies. Use when writing, reviewing, or improving: (1) README files and project documentation, (2) API documentation (REST, GraphQL, gRPC, WebSocket), (3) Code documentation (JSDoc, TypeDoc, docstrings, Godoc), (4) Architecture documentation (ADRs, C4 diagrams, design docs), (5) Database schemas and data models, (6) Configuration and environment documentation, (7) Runbooks and operational guides, (8) Changelogs and release notes, (9) Troubleshooting guides, (10) User guides and tutorials. Applies ALCOA-C principles and docs-as-code best practices.
---

# Documentation

Universal skill for creating clear, accurate, and maintainable documentation.

## Quick Start

1. **Identify documentation type** → Select appropriate template
2. **Know your audience** → Adjust depth and terminology
3. **Follow the pattern** → Use consistent structure
4. **Verify accuracy** → Test all code examples
5. **Maintain freshness** → Add version and date metadata

## Documentation Type Selection

| Need | Reference File | Key Sections |
|------|----------------|--------------|
| README, guides | [templates.md](references/templates.md) | README Templates, Runbook |
| REST/GraphQL/gRPC APIs | [api-docs.md](references/api-docs.md) | OpenAPI, GraphQL, gRPC |
| Code comments | [code-docs.md](references/code-docs.md) | JSDoc, Python, Go, Rust |
| System design | [architecture-docs.md](references/architecture-docs.md) | ADRs, C4, Diagrams |
| Writing quality | [best-practices.md](references/best-practices.md) | ALCOA-C, Style Guide |

## Core Principles

### ALCOA-C Framework
- **Attributable**: Include author, date, version
- **Legible**: Clear formatting, consistent style
- **Contemporaneous**: Document during development
- **Original**: Write from source, avoid stale copies
- **Accurate**: Verify code examples actually work
- **Complete**: Cover edge cases and errors

### Writing Rules
- Active voice, present tense
- Imperative mood for instructions ("Run..." not "You should run...")
- One idea per sentence, one topic per paragraph
- Define jargon on first use
- Test every code example

## Workflow by Task

### Creating New Documentation

```
1. Determine doc type and audience
2. Load appropriate reference file
3. Copy relevant template
4. Fill in content following structure
5. Add code examples (tested!)
6. Add metadata (author, date, version)
7. Cross-link related docs
```

### Documenting an API Endpoint

```
1. Read references/api-docs.md
2. Use OpenAPI/AsyncAPI/GraphQL template
3. Document: endpoint, params, request/response, errors
4. Include curl/SDK examples
5. Add authentication requirements
```

### Writing Code Documentation

```
1. Read references/code-docs.md
2. Match language convention:
   - TypeScript/JS → JSDoc
   - Python → Google-style docstrings
   - Go → Godoc format
   - Rust → rustdoc
3. Document: purpose, params, returns, throws, examples
4. Ensure examples are runnable
```

### Creating Architecture Decision Record

```
1. Read references/architecture-docs.md
2. Use ADR template (MADR or Y-Statement)
3. Document: context, decision, consequences
4. Link to related ADRs
5. Set status: Proposed → Accepted
```

### Writing README

```
1. Read references/templates.md
2. Choose template by project size:
   - Small: Minimal README
   - Medium: Standard README
   - Large: Comprehensive README
3. Include: description, install, usage, config, license
4. Add badges for CI/coverage/version
```

## Output Formats

### Markdown (Default)
Use for: READMEs, guides, ADRs, general docs
```markdown
# Title
## Section
Content with `inline code` and:
\`\`\`language
code blocks
\`\`\`
```

### OpenAPI (YAML)
Use for: REST API documentation
```yaml
openapi: 3.1.0
paths:
  /endpoint:
    get:
      summary: Description
```

### JSDoc/TSDoc
Use for: JavaScript/TypeScript code
```typescript
/**
 * Brief description.
 * @param name - Parameter description
 * @returns Return description
 */
```

### Python Docstrings (Google Style)
Use for: Python code
```python
"""Brief description.

Args:
    name: Parameter description.

Returns:
    Return description.
"""
```

## Quality Checklist

Before finalizing any documentation:

- [ ] Purpose clear from first paragraph
- [ ] Prerequisites listed
- [ ] Code examples tested and working
- [ ] Edge cases and errors documented
- [ ] Version/date metadata included
- [ ] Related docs cross-linked
- [ ] No jargon without definition
- [ ] Active voice used
- [ ] Alt text for images/diagrams

## Common Patterns

### Progressive Disclosure
```markdown
## Quick Start
5-minute getting started (most users stop here)

## Configuration
Detailed options (power users)

## Advanced
Edge cases, internals (experts)
```

### API Endpoint Pattern
```markdown
## Endpoint Name
Brief description.

### Request
\`\`\`
METHOD /path
\`\`\`

### Parameters
| Name | Type | Required | Description |

### Response
\`\`\`json
{ "example": "response" }
\`\`\`

### Errors
| Status | Code | Description |
```

### Troubleshooting Pattern
```markdown
### Issue: Error Message

**Symptoms:**
- What the user sees

**Causes:**
1. Most common cause
2. Less common cause

**Solutions:**
1. Step to fix cause 1
2. Step to fix cause 2
```

## Anti-Patterns to Avoid

| Anti-Pattern | Problem | Solution |
|--------------|---------|----------|
| Wall of text | Hard to scan | Use headings, lists, tables |
| Outdated examples | Broken code | Test examples in CI |
| Missing context | Confusing | Start with "why" and prerequisites |
| Jargon overload | Excludes beginners | Define terms, link to glossary |
| Scattered docs | Can't find info | Single source of truth |
| Copy-paste duplication | Inconsistent updates | Reference, don't duplicate |

## Reference Files

For detailed templates and examples, load the appropriate reference:

- **[references/templates.md](references/templates.md)**: README templates, runbooks, changelogs, troubleshooting guides, database schemas, configuration docs
- **[references/api-docs.md](references/api-docs.md)**: OpenAPI 3.x, AsyncAPI 3.0, GraphQL, gRPC, SDK documentation, versioning, authentication, error handling
- **[references/code-docs.md](references/code-docs.md)**: JSDoc, TypeDoc, Python docstrings (Google/NumPy), Godoc, rustdoc, JavaDoc, KDoc, C# XML docs, inline comments, doc generation tools
- **[references/architecture-docs.md](references/architecture-docs.md)**: ADRs (MADR, Y-Statement), C4 diagrams, system design docs, sequence diagrams, data flow, infrastructure docs, dependency mapping
- **[references/best-practices.md](references/best-practices.md)**: ALCOA-C principles, writing guidelines, structure patterns, audience awareness, docs-as-code, maintenance, accessibility, anti-patterns
