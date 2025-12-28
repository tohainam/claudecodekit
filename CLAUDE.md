# Claude Code Universal Config

This project provides a comprehensive, reusable configuration for Claude Code that can be applied to any project.

## Quick Start

After copying the `.claude/` directory to your project, you can use these commands:

| Command | Purpose |
|---------|---------|
| `/onboard [--apply]` | Analyze project and recommend Claude Code setup |
| `/discuss <topic>` | Structured discussion for requirements and decisions |
| `/feature <desc>` | Implement a new feature (full workflow) |
| `/bugfix <error>` | Fix a bug (diagnosis + fix + optional test) |
| `/plan <task>` | Create implementation plan only |
| `/implement [path]` | Execute an existing plan |
| `/review [scope]` | Review code changes |
| `/test <file>` | Write tests for code |
| `/debug <issue>` | Debug without fixing |
| `/refactor <file>` | Refactor code safely |
| `/commit [msg]` | Create git commit |
| `/pr [title]` | Create pull request |
| `/check [scope]` | Run lint, typecheck, tests |

## Architecture

```
.claude/
├── rules/          # Always loaded - coding standards
├── skills/         # Auto-loaded - domain knowledge
├── agents/         # Subagents - specialized executors
├── commands/       # Slash commands - user triggers
├── discussions/    # Discussion summaries from /discuss
├── decisions/      # ADR decision records
├── hooks/          # Automation scripts
└── settings.json   # Hooks config + permissions
```

## Workflows

### Project Onboarding (NEW)
```
/onboard
→ Detect tech stack → Analyze structure → Generate recommendations → ONBOARD-REPORT.md

/onboard --apply
→ Same as above + Create all recommended rules files
```
Use when setting up Claude Code for a new project or updating configuration as project evolves.

**What it detects:**
- Languages: JavaScript/TypeScript, Python, Go, Rust, Java, Ruby, PHP, C#
- Frameworks: Next.js, React, Vue, Django, FastAPI, Express, and more
- Databases: Prisma, TypeORM, SQLAlchemy, Mongoose, etc.
- Auth systems, testing frameworks, CI/CD, Docker

**What it creates:**
- ONBOARD-REPORT.md with full analysis
- Recommended `.claude/rules/` files (with --apply flag)
- Never overwrites existing files

### Requirements Gathering
```
/discuss "topic to explore"
→ Facilitator → (clarify) → (explore) → (decide) → Discussion Summary + ADR
```
Use before `/feature` or `/plan` when requirements are unclear or decisions need to be made.

### Feature Development
```
/feature "Add user authentication"
→ (check discussions) → Planner → (approve) → Implementer → (ask: tests?) → Tester → Reviewer → Commit/PR
```

### Bug Fixing
```
/bugfix "API returns 500 on checkout"
→ Debugger → (approve) → (ask: tests?) → Write failing test → Fix → Verify → Commit/PR
```

### Quick Changes
For simple changes (< 3 files), work directly without commands.

## Rules

See `.claude/rules/` for detailed standards:

| Rule | Purpose |
|------|---------|
| @.claude/rules/code-quality.md | Naming, structure, patterns |
| @.claude/rules/communication.md | Response format, when to ask |
| @.claude/rules/safety.md | Protected files, confirmations |
| @.claude/rules/workflow.md | Plan → Code → Test (optional) → Review |

## Skills Available

| Skill | Purpose |
|-------|---------|
| architecture | System design, patterns |
| code-quality | Best practices, clean code |
| debugging | Root cause analysis |
| documentation | Writing docs |
| git-workflow | Commits, branches, PRs |
| performance | Optimization |
| project-analysis | Codebase analysis for Claude Code setup (used by /onboard) |
| refactoring | Safe code improvement |
| security-review | Security auditing |
| testing | TDD, test strategies |

## Agents Available

| Agent | Model | Purpose |
|-------|-------|---------|
| facilitator | opus | Leads discussions, creates ADRs |
| planner | opus | Creates detailed plans |
| implementer | sonnet | Executes plans |
| code-reviewer | sonnet | Reviews code quality |
| test-writer | sonnet | Writes tests |
| debugger | sonnet | Finds root causes |
| refactorer | opus | Improves code safely |
| doc-writer | sonnet | Writes documentation |
| security-auditor | opus | Audits security |

## Hooks

| Hook | Event | Purpose |
|------|-------|---------|
| file-protection.py | PreToolUse:Edit | Blocks editing .env, secrets |

## Customization

### Add Project-Specific Rules

Create `.claude/rules/my-project.md`:
```markdown
---
paths: src/**/*.ts
---

# My Project Rules
- Use specific patterns...
```

### Override Permissions

Edit `.claude/settings.local.json` (gitignored):
```json
{
  "permissions": {
    "allow": ["Bash(my-custom-script:*)"]
  }
}
```

## License

MIT - Use freely in your projects.
