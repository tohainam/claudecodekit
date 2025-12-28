# Claude Code Universal Config

Reusable Claude Code configuration for any project. Copy `.claude/` directory to get started.

## Commands

| Command              | Purpose                           |
| -------------------- | --------------------------------- |
| `/onboard [--apply]` | Analyze project, recommend setup  |
| `/discuss <topic>`   | Requirements gathering, decisions |
| `/feature <desc>`    | Full feature workflow             |
| `/bugfix <error>`    | Bug diagnosis + fix               |
| `/plan <task>`       | Create implementation plan        |
| `/implement [path]`  | Execute existing plan             |
| `/review [scope]`    | Review code changes               |
| `/test <file>`       | Write tests                       |
| `/debug <issue>`     | Debug without fixing              |
| `/refactor <file>`   | Safe refactoring                  |
| `/commit [msg]`      | Create git commit                 |
| `/pr [title]`        | Create pull request               |
| `/check [scope]`     | Run lint, typecheck, tests        |

## Architecture

```
.claude/
├── rules/          # Coding standards (always loaded)
├── skills/         # Domain knowledge (auto-scanned by hook)
├── agents/         # Specialized subagents
├── commands/       # Slash command definitions
├── hooks/          # Auto-loaders + protection
├── .mcp.json       # MCP servers config
├── settings.json   # Permissions + hooks config
├── .discussions/   # /discuss outputs
├── .decisions/     # ADR records
└── .plans/         # Implementation plans
```

## Workflows

**Feature**: `/feature` → Plan → Approve → Implement → Test? → Review → Commit? → PR?

**Bug Fix**: `/bugfix` → Debug → Test? → Fix → Verify → Commit? → PR?

**Quick Changes**: For < 3 files, work directly without commands.

## Rules

| Rule                   | Purpose                        |
| ---------------------- | ------------------------------ |
| code-quality.md        | Naming, structure, patterns    |
| communication.md       | Response format, when to ask   |
| safety.md              | Protected files, confirmations |
| workflow.md            | Plan → Code → Test → Review    |
| knowledge-freshness.md | Source priority, freshness     |

## Skills

Auto-discovered from `.claude/skills/*/SKILL.md`:

| Skill            | Purpose                        |
| ---------------- | ------------------------------ |
| architecture     | System design, patterns        |
| code-quality     | Best practices, clean code     |
| debugging        | Root cause analysis            |
| documentation    | Writing docs                   |
| frontend-design  | Production-grade UI            |
| git-workflow     | Commits, branches, PRs         |
| performance      | Optimization                   |
| project-analysis | Codebase analysis for /onboard |
| refactoring      | Safe code improvement          |
| security-review  | Security auditing              |
| skill-creator    | Creating new skills            |
| testing          | TDD, test strategies           |

## Agents

| Agent            | Model  | Purpose                 |
| ---------------- | ------ | ----------------------- |
| facilitator      | opus   | Leads discussions, ADRs |
| planner          | opus   | Creates plans           |
| implementer      | sonnet | Executes plans          |
| code-reviewer    | sonnet | Reviews code            |
| test-writer      | sonnet | Writes tests            |
| debugger         | sonnet | Finds root causes       |
| refactorer       | opus   | Safe improvements       |
| doc-writer       | sonnet | Documentation           |
| security-auditor | opus   | Security audits         |

## MCP Servers

Auto-discovered from `.mcp.json`:

| Server              | Tools                                | Use When                    |
| ------------------- | ------------------------------------ | --------------------------- |
| context7            | resolve-library-id, get-library-docs | Library/framework docs      |
| sequential-thinking | sequentialthinking                   | Complex multi-step problems |

## Hooks

| Hook               | Event        | Purpose                              |
| ------------------ | ------------ | ------------------------------------ |
| file-protection.py | PreToolUse   | Block editing .env, secrets, locks   |
| skill-loader.py    | Notification | Scan skills → inject JSON context    |
| mcp-loader.py      | Notification | Read .mcp.json → inject JSON context |

## Customization

**Add project rules**: Create `.claude/rules/my-project.md`

**Add skills**: Create `.claude/skills/<name>/SKILL.md` with YAML frontmatter

**Add MCP servers**: Add to `.mcp.json`

**Override permissions**: Edit `.claude/settings.local.json` (gitignored)

## License

MIT
