# ADR-001: Onboard Command Design

## Metadata
- **Date**: 2025-12-28
- **Status**: accepted
- **Deciders**: user, facilitator-agent
- **Discussion**: [Discussion: Onboard Command](../discussions/2025-12-28-11-07-onboard-command.md)
- **Supersedes**: N/A

## Context

When users adopt this Claude Code configuration toolkit for new projects, they face repetitive manual work:
- Analyzing codebase to understand tech stack
- Deciding which rules to create
- Figuring out correct paths targeting for rules
- Setting up project-specific skills and subagents

A design document (NEW.md) proposed a `/onboard` command to automate this process.

### Technical Context

- Existing skill pattern: SKILL.md < 500 lines with reference files
- Existing command pattern: thin orchestrators that invoke agents/skills
- Context window is a shared resource - minimize token usage
- Project uses progressive disclosure (load content only when needed)

### Business Context

- Users want quick setup when adopting the toolkit
- Repetitive setup across projects wastes time
- Inconsistent configurations lead to suboptimal Claude behavior
- New users don't know what rules/skills to create

## Decision

**We will implement `/onboard` using a lean architecture: one command file plus one skill with reference files, without a separate subagent.**

### Implementation Structure

```
.claude/
├── commands/
│   └── onboard.md                    # Command orchestration (~100 lines)
├── skills/
│   └── project-analysis/
│       ├── SKILL.md                  # Workflow + core detection (~400 lines)
│       └── references/
│           ├── tech-detection.md     # Detection tables (~300 lines)
│           └── rules-templates.md    # Rule templates (~500 lines)
```

### Key Behaviors

1. **Detection**: Analyze manifest files (package.json, requirements.txt, go.mod, etc.) to detect tech stack
2. **Analysis**: Map project structure, identify key directories, detect patterns
3. **Recommendations**: Generate rules structure with accurate paths targeting
4. **Output**: Create ONBOARD-REPORT.md with all findings
5. **Apply**: With `--apply` flag, generate all recommended files

### Monorepo Handling

- Detect all tech stacks present, organized by location
- Group recommendations by detected "domains" (apps/web, apps/api, packages/)
- Present findings clearly, let user confirm which to apply

### Incremental Update Support

- On re-run, detect what already exists in `.claude/`
- Show diff: "New recommendations vs existing"
- Never overwrite existing files - only suggest additions
- Respect user customizations

### Template System

- Built-in templates in `rules-templates.md`
- Optional user overrides via `custom-templates.md` (gitignored)
- Templates versioned with the config project
- Hierarchy: user override > built-in > generic structure

## Rationale

### Why This Approach

1. **Pattern Consistency**: Follows the proven `skill-creator` pattern exactly - SKILL.md with references

2. **No Subagent Overhead**: Commands like `/feature` and `/plan` work effectively without dedicated subagents for each task. The skill provides sufficient knowledge.

3. **Maintainability**: 4 files totaling ~1300 lines vs 6+ files with 2000+ lines in the original design

4. **Context Efficiency**: Progressive disclosure ensures only relevant detection tables and templates are loaded when needed

5. **Extensibility**: Reference files can grow independently; adding new tech stack support requires editing one file

### Alternatives Considered

#### Alternative 1: Full Implementation (As Designed in NEW.md)

- **Description**: Separate `project-analyzer` subagent, 4-file skill structure, extensive template library
- **Rejected because**: Over-engineered for the use case. Violates KISS principle. The subagent adds complexity without clear benefit since commands can invoke skills directly.

#### Alternative 2: Command-Only (Minimal)

- **Description**: All detection logic and templates in single command file
- **Rejected because**: Violates the pattern that commands are thin orchestrators. Would become unmaintainable as templates grow. No knowledge reuse.

#### Alternative 3: Interactive Wizard

- **Description**: Guide user through choices instead of auto-detection
- **Rejected because**: Defeats the purpose of automation. Users may not know their full tech stack. Slower workflow.

## Consequences

### Positive

- Faster project setup (minutes instead of hours)
- Consistent configuration across projects
- New users get guidance on best practices
- Follows existing patterns - easy to understand and maintain
- Low context window impact with progressive disclosure

### Negative

- Detection may not be 100% accurate for edge cases
- Templates require maintenance as new frameworks emerge
- Initial implementation effort (~6-8 hours)

### Neutral

- Adds new skill directory to the project
- Users still need to review and customize recommendations
- Templates reflect opinionated best practices

## Implementation Notes

### Affected Components

| Path | Action | Description |
|------|--------|-------------|
| `.claude/commands/onboard.md` | Create | Command orchestration |
| `.claude/skills/project-analysis/SKILL.md` | Create | Workflow and core logic |
| `.claude/skills/project-analysis/references/tech-detection.md` | Create | Detection tables |
| `.claude/skills/project-analysis/references/rules-templates.md` | Create | Rule templates |
| `CLAUDE.md` | Modify | Document new command |

### Implementation Phases

| Phase | Deliverable | Estimated Effort |
|-------|-------------|------------------|
| 1 | SKILL.md + tech-detection.md | 2-3 hours |
| 2 | rules-templates.md | 2-3 hours |
| 3 | onboard.md command | 1 hour |
| 4 | Testing with sample projects | 1-2 hours |

### Verification

To verify decision was implemented correctly:

1. Run `/onboard` on a Next.js project - should detect Next.js, TypeScript, etc.
2. Run `/onboard` on a Python FastAPI project - should detect Python, FastAPI, etc.
3. Run `/onboard` on a monorepo - should group by domains
4. Run `/onboard --apply` - should create all files without errors
5. Run `/onboard` twice - second run should show diff, not overwrite

### Detection Coverage (Initial)

**Languages**: JavaScript/TypeScript, Python, Go, Rust, Java, Ruby, PHP, C#

**Frameworks**: Next.js, React, Vue, Angular, Svelte, Express, Fastify, Django, Flask, FastAPI, Gin, Rails, Laravel

**Databases/ORMs**: Prisma, TypeORM, Drizzle, Sequelize, Mongoose, SQLAlchemy, GORM, ActiveRecord

**Auth**: NextAuth, Auth.js, Passport, Firebase Auth, Supabase Auth

**Testing**: Jest, Vitest, Pytest, Go testing, RSpec, PHPUnit

## Related Decisions

- None (this is ADR-001)

---

*Decision recorded by facilitator-agent*
