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
| `/mcp-register [info]` | Register new MCP server in manifest |

## Architecture

```
.claude/
├── rules/          # Always loaded - coding standards + auto-loaders
├── skills/         # Auto-loaded - domain knowledge (MANIFEST.md)
├── mcp/            # MCP servers registry (MANIFEST.md)
├── agents/         # Subagents - specialized executors
├── commands/       # Slash commands - user triggers
├── .discussions/   # Discussion summaries from /discuss
├── .decisions/     # ADR decision records
├── .plans/         # Implementation plans
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
→ (check discussions) → Planner → (approve) → Implementer → (ask: tests?) → Tester → Reviewer → (ask: commit?) → (ask: PR?)
```

### Bug Fixing
```
/bugfix "API returns 500 on checkout"
→ Debugger → (approve) → (ask: tests?) → Write failing test → Fix → Verify → (ask: commit?) → (ask: PR?)
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
| @.claude/rules/skill-loader.md | Auto-load skills based on task context |
| @.claude/rules/mcp-loader.md | Auto-use MCP servers when relevant |
| @.claude/rules/knowledge-freshness.md | Source priority chain, freshness attribution |

## Skills Available

| Skill | Purpose |
|-------|---------|
| architecture | System design, patterns |
| code-quality | Best practices, clean code |
| debugging | Root cause analysis |
| documentation | Writing docs |
| frontend-design | Distinctive, production-grade UI design |
| git-workflow | Commits, branches, PRs |
| performance | Optimization |
| project-analysis | Codebase analysis for Claude Code setup (used by /onboard) |
| refactoring | Safe code improvement |
| security-review | Security auditing |
| skill-creator | Creating new skills (auto-updates MANIFEST.md) |
| testing | TDD, test strategies |

Skills are auto-loaded based on semantic matching (see `@.claude/rules/skill-loader.md`).

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

## MCP Servers

MCP servers are auto-used based on semantic matching (see `@.claude/rules/mcp-loader.md`).

Registry: `.claude/mcp/MANIFEST.md`

| Server | Tools | Use When |
|--------|-------|----------|
| context7 | resolve-library-id, get-library-docs | Fetching library/framework documentation |
| sequential-thinking | sequentialthinking | Complex multi-step problem solving |

**Adding new MCP servers**: Add entry to `.claude/mcp/MANIFEST.md`

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
