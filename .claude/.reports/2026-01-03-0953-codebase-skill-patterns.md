# Codebase Analysis: Skill Creation Patterns

**Generated**: 2026-01-03 09:53
**Scope**: `.claude/skills/`, `.claude/.specs/gemini-skill.md`
**Files Analyzed**: 14

## Summary

Skill system uses progressive disclosure pattern with YAML frontmatter triggering + markdown body instructions. Skills organized as `{name}/SKILL.md` with optional `references/`, `scripts/`, `assets/` subdirectories. Existing gemini spec + research report provide comprehensive blueprint for implementation.

## Architecture & Structure

### Directory Organization

```
.claude/skills/
├── documentation/       # Templates-based (templates/)
│   ├── SKILL.md
│   └── templates/
├── git-workflow/        # References-based (references/)
│   ├── SKILL.md
│   └── references/
├── implementation/      # Mixed (references/ + examples/)
│   ├── SKILL.md
│   ├── references/
│   └── examples/
├── planning/            # Mixed (references/ + templates/)
├── security-audit/      # Heavy references
├── skill-creator/       # Full structure (references/ + scripts/)
│   ├── SKILL.md
│   ├── references/
│   └── scripts/
└── testing/             # Mixed (references/ + examples/)
```

### Design Patterns Identified

| Pattern | Location | Description |
|---------|----------|-------------|
| **Progressive Disclosure** | All skills | Frontmatter loads always, body on trigger, references on demand |
| **Templates Pattern** | `documentation/`, `planning/` | Store reusable output formats in `templates/` |
| **References Pattern** | All skills | Deep-dive docs in `references/` linked from SKILL.md |
| **Examples Pattern** | `implementation/`, `testing/` | Concrete code samples in `examples/` |
| **Scripts Pattern** | `skill-creator/` | Executable tools in `scripts/` |

## Key Files

| File | Purpose | Notes |
|------|---------|-------|
| `skill-creator/SKILL.md:1-357` | Meta-skill for creating skills | Comprehensive guide, use as primary reference |
| `skill-creator/scripts/init_skill.py:1-303` | Skill initialization script | Creates boilerplate structure |
| `skill-creator/references/workflows.md:1-29` | Sequential/conditional workflow patterns | Short, focused |
| `skill-creator/references/output-patterns.md:1-93` | Template and example patterns | Strict vs flexible guidance |
| `git-workflow/SKILL.md:1-154` | Example well-structured skill | Good balance of inline content + references |

## SKILL.md Template Patterns

### Required Frontmatter Structure

```yaml
---
name: skill-name             # kebab-case, matches directory
description: [Comprehensive description including WHEN to use]
---
```

**Key insight** (`skill-creator/SKILL.md:66-70`): Description is PRIMARY trigger mechanism. Must include:
- What the skill does
- Specific triggers/contexts for when to use it
- All "when to use" info (body only loads after triggering)

### Body Structure Patterns

**Pattern 1: Quick Reference** (git-workflow, security-audit)
```markdown
# Skill Name

## When to Use
- Bullet list of triggers

## Quick Start
### Decision Table or Quick Reference
[Table or concise reference]

## Guidelines
### DO / DON'T lists

## [Domain-Specific Sections]

## References
- [File](references/file.md) - Description
```

**Pattern 2: Workflow-Based** (skill-creator)
```markdown
# Skill Name

## About [Domain]
[Background context]

## Core Principles
[Key concepts]

## [Process Name] Process
### Step 1: ...
### Step 2: ...
```

**Pattern 3: Domain Guidelines** (implementation, testing)
```markdown
# Skill Name

## When to Use

## Quick Start
### Core Principles / Philosophy
### Code Examples

## Guidelines
### DO / DON'T

## [Pattern/Type] Quick Reference
[Tables]

## References
## Examples
```

### Frontmatter Examples (from codebase)

| Skill | Description Pattern |
|-------|---------------------|
| `git-workflow` | `{Topic} + {aspects}. Use when: {comma-separated triggers}` |
| `security-audit` | `{Purpose} + {specialty}. Use when: {triggers}` |
| `planning` | `{Method} with {approach}. Use when: {triggers}` |
| `skill-creator` | Long-form: `{Purpose}. This skill should be used when {detailed context}` |

## Reference File Organization

### Naming Conventions

```
references/
├── {topic}.md           # General pattern (e.g., clean-code.md)
├── {subtopic}.md        # Specific area (e.g., error-handling.md)
└── {category}.md        # Domain category (e.g., owasp-top10.md)
```

### Content Structure (from `references/branching.md:1-294`)

```markdown
# [Reference Title]

## [Topic 1]

### Overview
[Brief description]

### [Subtopic]
[Details with code examples]

### When to Use
[Context]

### Implementation
```bash
# Code examples
```

## [Topic 2]
...

## Comparison
[Table comparing options]
```

### Reference File Patterns

| Type | Example | Content |
|------|---------|---------|
| **Command Reference** | `conventional-commits.md` | Syntax, types, examples |
| **Workflow Guide** | `branching.md` | Step-by-step with diagrams |
| **Best Practices** | `clean-code.md` | Principles, patterns, anti-patterns |
| **Security Reference** | `owasp-top10.md` | Vulnerabilities, mitigations |

## Gemini Skill Recommendations

### Recommended Structure

Based on spec at `.claude/.specs/gemini-skill.md` and existing patterns:

```
gemini/
├── SKILL.md              # Core headless workflow, quick start
└── references/
    ├── commands.md       # CLI flags reference (table format)
    ├── examples.md       # Bash automation patterns
    └── integration.md    # Claude Code + Gemini patterns
```

### SKILL.md Template for Gemini

```yaml
---
name: gemini
description: Gemini CLI headless mode for automation and scripting. Use when: Running Gemini from bash scripts, CI/CD pipelines, subagent orchestration, codebase analysis via CLI, or programmatic AI invocations without interactive sessions.
---
```

**Recommended sections:**
1. `## Quick Start` - Installation + first headless command
2. `## Headless Mode Basics` - `-p` flag, input methods, output formats
3. `## Common Patterns` - Top 3-5 use cases inline
4. `## Guidelines` - DO/DON'T list
5. `## References` - Links to commands.md, examples.md, integration.md

### Reference Files Content Plan

**references/commands.md:**
- Table format for all headless flags (from research report lines 73-86)
- Input methods section
- Output processing section

**references/examples.md:**
- Code analysis patterns
- Git integration patterns
- Full automation with YOLO
- Error handling patterns

**references/integration.md:**
- Pattern 1: Gemini as Subagent (lines 172-201)
- Pattern 2: Dual-Agent Workflow (lines 203-216)
- Pattern 3: MCP-Based Orchestration (lines 218-230)
- Why integrate both table

## Code Snippets

### Frontmatter Pattern (git-workflow/SKILL.md:1-4)
```yaml
---
name: git-workflow
description: Git conventions, branching strategies, and commit practices. Use when: Choosing a branching strategy, Writing commit messages, Creating pull requests, Reviewing code.
---
```

### References Section Pattern (implementation/SKILL.md:100-109)
```markdown
## References

- [Clean Code](references/clean-code.md) - SOLID, YAGNI, DRY principles
- [Naming Conventions](references/naming.md) - Language-specific naming
- [Error Handling](references/error-handling.md) - Error categories and patterns

## Examples

- [Function Design](examples/function-design.md) - Small functions, parameters
- [Refactoring](examples/refactoring.md) - Extract method, TDD workflow
```

### DO/DON'T Pattern (git-workflow/SKILL.md:58-76)
```markdown
## Guidelines

### DO

- Use trunk-based development for most projects
- Write atomic commits (one logical change per commit)
- Use conventional commit format

### DON'T

- Force push to main/master
- Commit directly to protected branches
- Create long-lived feature branches (> 2-3 days)
```

## Issues & Recommendations

### For Gemini Skill Implementation

1. **Use comprehensive description** - Include "headless mode", "automation", "bash", "scripting", "CI/CD" in description for broad triggering
2. **Follow git-workflow pattern** - Clean structure with tables + code examples
3. **Include JSON output examples** - Critical for automation (research report line 289)
4. **Add error handling patterns** - Exit codes, JSON error fields
5. **Keep SKILL.md under 200 lines** - Push details to references

### Technical Debt Noted

- `skill-creator/scripts/__pycache__/` - Compiled Python cache in repo

### Skill Creation Process

Per `skill-creator/SKILL.md:202-214`:
1. Understand skill with concrete examples
2. Plan reusable contents (scripts, references, assets)
3. Initialize via `scripts/init_skill.py`
4. Edit SKILL.md and resources
5. Package via `scripts/package_skill.py`
6. Iterate based on usage

## Unresolved Questions

- Should gemini skill include scripts for common automation tasks, or rely purely on reference documentation?
- What authentication guidance level is appropriate (spec says focus on headless, but auth is prerequisite)?
