# Implementation Plan: Gemini Skill

**Created**: 2026-01-03
**Spec**: `.claude/.specs/gemini-skill.md`
**Status**: Active

## Overview

Create a comprehensive Gemini CLI skill that teaches Claude Code how to use Gemini in headless mode via bash for automation workflows.

## Structure

```
.claude/skills/gemini/
├── SKILL.md              # Core headless workflow (~150 lines)
└── references/
    ├── commands.md       # CLI flags and options reference
    ├── examples.md       # Bash automation examples
    └── integration.md    # Claude Code + Gemini patterns
```

## Phases

### Phase 1: Initialize Skill

- [ ] Run `init_skill.py gemini --path .claude/skills`
- [ ] Remove unnecessary example files (scripts/, assets/)

### Phase 2: Create Reference Files

- [ ] Create `references/commands.md` - CLI flags table
- [ ] Create `references/examples.md` - Bash automation patterns
- [ ] Create `references/integration.md` - Claude Code patterns

### Phase 3: Write SKILL.md

- [ ] Write frontmatter with comprehensive description
- [ ] Add installation section
- [ ] Add quick start with headless workflow
- [ ] Add reference links

### Phase 4: Validate

- [ ] Run `package_skill.py` to validate
- [ ] Fix any validation errors

## Content Sources

- Research report: `.claude/.reports/2026-01-03-0941-research-gemini-cli-headless.md`
- Skill patterns: `.claude/.reports/2026-01-03-0953-codebase-skill-patterns.md`

## Key Design Decisions

1. **Headless only**: No interactive mode coverage
2. **Progressive disclosure**: Core workflow in SKILL.md, details in references
3. **Imperative form**: All instructions use imperative verbs
4. **JSON output focus**: Emphasize `--output-format json` for automation
