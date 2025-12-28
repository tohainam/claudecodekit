# Plan: Implement /onboard Command

## Metadata
- **Created**: 2025-12-28 11:12
- **Type**: feature
- **Status**: completed
- **Author**: planner-agent
- **Implementer**: implementer-agent
- **Discussion**: .claude/discussions/2025-12-28-11-07-onboard-command.md
- **Decisions**: ADR-001 (.claude/decisions/2025-12-28-onboard-command-design.md)
- **Completed**: 2025-12-28

## 1. Overview

Implement the `/onboard` command that auto-analyzes codebases and recommends Claude Code configuration (rules, skills). Following ADR-001's lean architecture, this feature consists of one command file plus one skill with reference files, without a separate subagent.

## 2. Requirements

### User Request
Implement `/onboard` command based on ADR-001 using the skill-creator pattern to create the project-analysis skill.

### Acceptance Criteria
- [ ] GIVEN a project with package.json WHEN running /onboard THEN detect Node.js and framework
- [ ] GIVEN a monorepo WHEN running /onboard THEN group recommendations by detected domains
- [ ] GIVEN existing .claude/rules/ WHEN running /onboard THEN show diff without overwriting
- [ ] GIVEN --apply flag WHEN running /onboard THEN create all recommended files
- [ ] GIVEN any project type WHEN running /onboard THEN complete analysis in < 30 seconds

## 3. Analysis

### Affected Files

| File | Action | Reason |
|------|--------|--------|
| `.claude/commands/onboard.md` | Create | Command orchestration (~100 lines) |
| `.claude/skills/project-analysis/SKILL.md` | Create | Workflow + core detection logic (~400 lines) |
| `.claude/skills/project-analysis/references/tech-detection.md` | Create | Detection tables for languages, frameworks, DBs (~300 lines) |
| `.claude/skills/project-analysis/references/rules-templates.md` | Create | Rule templates and recommendations (~500 lines) |
| `CLAUDE.md` | Modify | Document new /onboard command |

### Dependencies
- External: None (uses built-in Claude tools)
- Internal: Follows skill-creator pattern from `.claude/skills/skill-creator/SKILL.md`

### Patterns Found

**Skill Pattern** (from `.claude/skills/skill-creator/SKILL.md:49-62`):
```
skill-name/
├── SKILL.md (required)
│   ├── YAML frontmatter metadata (required)
│   │   ├── name: (required)
│   │   └── description: (required)
│   └── Markdown instructions (required)
└── Bundled Resources (optional)
    ├── scripts/
    ├── references/
    └── assets/
```

**Command Pattern** (from `.claude/commands/feature.md:1-6`):
```yaml
---
description: Full feature implementation workflow - from planning to PR
allowed-tools: Task, Read, Glob, Grep, Bash, Edit, Write, TodoWrite, AskUserQuestion
argument-hint: <feature description>
---
```

**Progressive Disclosure** (from `.claude/skills/skill-creator/SKILL.md:114-127`):
- Keep SKILL.md body under 500 lines
- Split content into separate reference files
- Reference files clearly from SKILL.md with when-to-read guidance

## 4. Technical Design

### Architecture Decision

**Chosen Approach**: Lean Implementation (per ADR-001)
- One command file (~100 lines) as thin orchestrator
- One skill with references (total ~1300 lines)
- No separate subagent - command invokes Claude directly with skill knowledge
- Progressive disclosure via reference files

**Rationale**:
1. Follows proven skill-creator pattern exactly
2. Commands like `/feature` work without dedicated subagents
3. Context-efficient: only loads what's needed
4. 4 files vs 6+ in original NEW.md design

### Component Design

#### 1. onboard.md (Command)
- **Responsibility**: Orchestrate the onboard workflow
- **Interface**: `/onboard` or `/onboard --apply`
- **Dependencies**: project-analysis skill

#### 2. project-analysis/SKILL.md
- **Responsibility**: Define analysis workflow, core detection logic, output generation
- **Interface**: Used when analyzing projects for Claude configuration
- **Dependencies**: tech-detection.md, rules-templates.md references

#### 3. tech-detection.md (Reference)
- **Responsibility**: Detection tables for all supported tech stacks
- **Interface**: Read when detecting specific technologies
- **Dependencies**: None

#### 4. rules-templates.md (Reference)
- **Responsibility**: Rule templates for all supported tech stacks
- **Interface**: Read when generating recommendations
- **Dependencies**: None

### Data Flow

```
/onboard command
     │
     ▼
┌─────────────────────────────────────────────────┐
│ DETECTION PHASE                                  │
│ Read: package.json, requirements.txt, go.mod... │
│ Reference: tech-detection.md                     │
│ Output: Tech Stack Map                           │
└─────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────┐
│ ANALYSIS PHASE                                   │
│ Analyze: folder structure, config files         │
│ Output: Project Structure Map, Key Paths        │
└─────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────┐
│ RECOMMENDATION PHASE                             │
│ Reference: rules-templates.md                    │
│ Output: Rules recommendations with paths         │
└─────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────┐
│ OUTPUT PHASE                                     │
│ Create: ONBOARD-REPORT.md                        │
│ If --apply: Create all recommended files         │
└─────────────────────────────────────────────────┘
```

## 5. Implementation Steps

### Phase 1: Create Skill Structure (~2-3 hours)

- [x] Step 1.1: Create skill directory structure
  ```bash
  mkdir -p .claude/skills/project-analysis/references
  ```

- [x] Step 1.2: Create `SKILL.md` with frontmatter
  - name: project-analysis
  - description: Comprehensive codebase analysis for Claude Code configuration. Use when users run /onboard to analyze a new project, detect tech stack, and recommend rules/skills setup.

- [x] Step 1.3: Write SKILL.md workflow section
  - Overview of the analysis process
  - 5-step workflow: Detect -> Analyze -> Identify -> Recommend -> Output
  - Clear section on when to read each reference file

- [x] Step 1.4: Write SKILL.md detection logic summary
  - High-level detection approach
  - Manifest file priorities
  - Reference to tech-detection.md for detailed tables

- [x] Step 1.5: Write SKILL.md output format section
  - ONBOARD-REPORT.md template structure
  - Summary output format for user
  - Instructions for --apply behavior

### Phase 2: Create Detection Reference (~2-3 hours)

- [x] Step 2.1: Create `references/tech-detection.md` header
  - Purpose description
  - How to use this reference

- [x] Step 2.2: Write language detection table
  | File | Language |
  |------|----------|
  | package.json | JavaScript/TypeScript |
  | tsconfig.json | TypeScript |
  | requirements.txt, pyproject.toml | Python |
  | go.mod | Go |
  | Cargo.toml | Rust |
  | pom.xml, build.gradle | Java |
  | Gemfile | Ruby |
  | composer.json | PHP |
  | *.csproj | C#/.NET |

- [x] Step 2.3: Write framework detection table
  - Next.js, React, Vue, Angular, Svelte
  - Express, Fastify, Hono
  - Django, Flask, FastAPI
  - Gin (Go), Rails (Ruby), Laravel (PHP)

- [x] Step 2.4: Write database/ORM detection table
  - Prisma, TypeORM, Drizzle, Sequelize, Mongoose
  - SQLAlchemy, Django ORM
  - GORM, ActiveRecord

- [x] Step 2.5: Write auth system detection table
  - NextAuth, Auth.js, Passport
  - Firebase Auth, Supabase Auth
  - Django Auth, JWT

- [x] Step 2.6: Write testing framework detection table
  - Jest, Vitest, Testing Library, Cypress, Playwright
  - Pytest, Go testing, RSpec, PHPUnit

- [x] Step 2.7: Write monorepo detection section
  - nx.json, turbo.json, pnpm-workspace.yaml, lerna.json
  - Domain detection patterns

### Phase 3: Create Rules Templates Reference (~2-3 hours)

- [x] Step 3.1: Create `references/rules-templates.md` header
  - Purpose description
  - Template hierarchy: user override > built-in > generic

- [x] Step 3.2: Write global rules templates
  - code-style.md template (always recommended)
  - git-workflow.md template (if .git exists)

- [x] Step 3.3: Write frontend rules templates
  - components.md (React, Vue, Angular, Svelte patterns)
  - pages.md (Next.js, Nuxt, SvelteKit patterns)
  - hooks.md (React hooks patterns)

- [x] Step 3.4: Write backend rules templates
  - api.md (Express, Fastify, Flask, FastAPI patterns)
  - middleware.md (middleware patterns)
  - database.md (ORM-specific patterns)

- [x] Step 3.5: Write auth rules templates
  - security.md (auth patterns by framework)

- [x] Step 3.6: Write testing rules templates
  - conventions.md (testing patterns by framework)

- [x] Step 3.7: Write devops rules templates
  - docker.md (Dockerfile, docker-compose patterns)
  - ci.md (GitHub Actions, GitLab CI patterns)

- [x] Step 3.8: Write monorepo rules templates
  - shared/code-style.md
  - apps/ patterns
  - packages/ patterns

- [x] Step 3.9: Write tech-to-rules mapping table
  | Detected Tech | Recommended Rules | Paths Pattern |
  |---------------|-------------------|---------------|

### Phase 4: Create Command File (~1 hour)

- [x] Step 4.1: Create `commands/onboard.md` with frontmatter
  ```yaml
  ---
  description: Analyze project and recommend Claude Code configuration. Use --apply to generate files.
  allowed-tools: Read, Glob, Grep, Bash, Write, TodoWrite
  argument-hint: [--apply]
  ---
  ```

- [x] Step 4.2: Write command input handling
  - Parse for --apply flag
  - Reference to project-analysis skill

- [x] Step 4.3: Write analysis-only workflow (no flag)
  - Load project-analysis skill
  - Execute 5-step workflow
  - Create ONBOARD-REPORT.md
  - Display summary to user

- [x] Step 4.4: Write apply workflow (--apply flag)
  - Check if ONBOARD-REPORT.md exists
  - If not, run full analysis first
  - Parse report and create all recommended files
  - Check for existing files (merge behavior)
  - Report created files

- [x] Step 4.5: Write incremental update handling
  - Detect existing .claude/ structure
  - Show diff: new vs existing
  - Never overwrite, only suggest additions

### Phase 5: Update Documentation (~30 minutes)

- [x] Step 5.1: Update CLAUDE.md command table
  - Add `/onboard` entry with description

- [x] Step 5.2: Update CLAUDE.md workflows section
  - Add onboarding workflow example

## 6. Test Strategy (Optional - User will be asked)

Note: Testing phase is optional. User will be asked if they want tests before proceeding.

If tests are requested:
- [ ] Manual test: Run `/onboard` on a Next.js project - verify detection of Next.js, TypeScript, etc.
- [ ] Manual test: Run `/onboard` on a Python FastAPI project - verify Python, FastAPI detection
- [ ] Manual test: Run `/onboard` on a monorepo - verify domain grouping
- [ ] Manual test: Run `/onboard --apply` - verify all files created correctly
- [ ] Manual test: Run `/onboard` twice - verify second run shows diff, not overwrite

## 7. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Detection accuracy for edge cases | Medium | Best-effort detection, allow user review before apply |
| SKILL.md exceeds 500 lines | Low | Already designed with references to stay under limit |
| Templates become outdated | Low | Templates versioned with project, easy to update |
| Monorepo detection complexity | Medium | Best-effort grouping, let user confirm/remove sections |
| Overwriting user customizations | High | Merge behavior: never overwrite, only suggest additions |

## 8. Progress Tracking

- [x] Phase 1: Skill structure and SKILL.md complete
- [x] Phase 2: tech-detection.md complete
- [x] Phase 3: rules-templates.md complete
- [x] Phase 4: onboard.md command complete
- [x] Phase 5: Documentation updated
- [ ] Manual tests pass (if user requested tests)
- [ ] Review complete

## 9. File Content Outlines

### 9.1 SKILL.md (~400 lines)

```markdown
---
name: project-analysis
description: >
  Comprehensive codebase analysis for Claude Code configuration.
  Use when users run /onboard to analyze a new project, detect tech stack,
  and recommend rules/skills setup. Supports JavaScript/TypeScript, Python,
  Go, Rust, Java, Ruby, PHP, C# projects including monorepos.
---

# Project Analysis Skill

## Overview
[Brief description of what this skill does]

## Analysis Workflow

### Step 1: Detect Tech Stack
[Detection process - which files to check]
See [references/tech-detection.md] for complete detection tables.

### Step 2: Analyze Structure
[How to map project structure]

### Step 3: Identify Patterns
[What patterns to look for]

### Step 4: Generate Recommendations
See [references/rules-templates.md] for templates.

### Step 5: Create Output
[ONBOARD-REPORT.md format]

## Monorepo Handling
[Special handling for monorepos]

## Incremental Updates
[How to handle re-runs]

## Output Format
[Template for ONBOARD-REPORT.md]
```

### 9.2 tech-detection.md (~300 lines)

```markdown
# Tech Stack Detection Reference

## Language Detection
[Table with manifest files -> languages]

## Framework Detection
[Table with dependencies -> frameworks]

## Database/ORM Detection
[Table with indicators -> databases/ORMs]

## Auth System Detection
[Table with packages -> auth systems]

## Testing Framework Detection
[Table with config files -> test frameworks]

## Monorepo Detection
[Indicators for monorepo structures]

## Structure Analysis Patterns
[Common directory patterns by tech stack]
```

### 9.3 rules-templates.md (~500 lines)

```markdown
# Rules Templates Reference

## Template Usage
[How to use templates, hierarchy]

## Global Rules (Always Recommend)

### code-style.md Template
[Full template]

### git-workflow.md Template
[Full template]

## Frontend Rules

### components.md Template
[Full template with variants for React/Vue/etc]

### pages.md Template
[Full template for routing frameworks]

## Backend Rules

### api.md Template
[Full template with variants]

### database.md Template
[Full template for ORMs]

## Auth Rules

### security.md Template
[Full template]

## Testing Rules

### conventions.md Template
[Full template]

## DevOps Rules

### docker.md Template
[Full template]

### ci.md Template
[Full template]

## Monorepo Rules

### shared/code-style.md Template
[Full template]

## Tech to Rules Mapping
[Complete mapping table]
```

### 9.4 onboard.md (~100 lines)

```markdown
---
description: Analyze project and recommend Claude Code configuration. Use --apply to generate files.
allowed-tools: Read, Glob, Grep, Bash, Write, TodoWrite
argument-hint: [--apply]
---

# Onboard Command

## Input
Arguments: $ARGUMENTS

## Process

### Without --apply flag:
1. Use project-analysis skill to analyze codebase
2. Create ONBOARD-REPORT.md with recommendations
3. Display summary to user

### With --apply flag:
1. Check if ONBOARD-REPORT.md exists
   - If NO: Run full analysis first
   - If YES: Read and parse report
2. Check for existing .claude/ structure
3. Create recommended files (merge, never overwrite)
4. Report created files

## Incremental Update Behavior
[How to handle existing files]

## Output
[What to display to user]
```

---

*Plan created by planner-agent following ADR-001 and skill-creator pattern*
