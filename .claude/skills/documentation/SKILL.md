---
name: documentation
description: "Documentation writing guidelines and templates. Use when: Creating project documentation, Documenting architecture decisions, Writing API documentation, Maintaining changelogs."
---

# Documentation

## When to Use

- Creating or updating README files
- Documenting architecture decisions (ADRs)
- Writing API documentation
- Maintaining changelogs
- Creating developer guides

## Quick Start

### Documentation Types

| Type          | Purpose                 | Audience      |
| ------------- | ----------------------- | ------------- |
| **README**    | Project overview, setup | All users     |
| **ADR**       | Architecture decisions  | Developers    |
| **API Docs**  | Endpoint reference      | API consumers |
| **Changelog** | Version history         | All users     |
| **Guides**    | How-to tutorials        | Developers    |

### Docs-as-Code Workflow

```
Write (Markdown) → Review (PR) → Build (CI) → Deploy (Static site)
```

Benefits:

- Version controlled
- Reviewable changes
- Automated publishing
- Single source of truth

## Guidelines

### DO

- Write for your audience
- Keep documentation close to code
- Use examples liberally
- Update docs with code changes
- Follow "docs-as-code" principles
- Write in present tense, active voice

### DON'T

- Document obvious code
- Let docs become stale
- Write walls of text
- Duplicate information across docs
- Document implementation details (use code comments)
- Skip the "why" in ADRs

## Self-Documenting Code vs Comments

### When to Comment

```typescript
// BAD: Explains what (code is clear)
// Increment counter by 1
counter++;

// GOOD: Explains why (non-obvious reason)
// API uses 1-based indexing, convert from 0-based
const apiIndex = index + 1;

// GOOD: Documents gotcha or workaround
// HACK: setTimeout needed due to race condition in v2.3
// TODO: Remove when upgrading to v3.0
setTimeout(init, 0);

// GOOD: Complex algorithm reference
// Implements Floyd-Warshall algorithm for shortest paths
// See: https://en.wikipedia.org/wiki/Floyd–Warshall_algorithm
```

### When to Write Docs

| Situation             | Documentation Type          |
| --------------------- | --------------------------- |
| Public API            | JSDoc/Docstrings + API docs |
| Architecture decision | ADR                         |
| Setup instructions    | README                      |
| Version changes       | CHANGELOG                   |
| Complex process       | Guide/Tutorial              |

## Documentation Structure

### Project Documentation

```
docs/
├── README.md              # Project overview
├── CONTRIBUTING.md        # How to contribute
├── CHANGELOG.md           # Version history
├── adr/                   # Architecture decisions
│   ├── 001-use-postgresql.md
│   └── 002-api-versioning.md
├── api/                   # API documentation
│   └── openapi.yaml
└── guides/                # How-to guides
    ├── getting-started.md
    └── deployment.md
```

## Templates

- [README](templates/readme.md) - Project README template
- [ADR](templates/adr.md) - Architecture Decision Record
- [Changelog](templates/changelog.md) - Keep a Changelog format
- [API Docs](templates/api-docs.md) - API documentation template
