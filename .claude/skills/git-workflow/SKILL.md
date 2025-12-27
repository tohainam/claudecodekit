---
name: git-workflow
description: >
  Comprehensive Git operations including commits, branching, PRs, and version control best practices.
  Use when Claude needs to - (1) Create commits with proper conventional commit messages,
  (2) Choose or implement branching strategies (GitFlow, GitHub Flow, Trunk-based),
  (3) Create or review pull requests, (4) Handle git operations safely (merge, rebase, reset),
  (5) Set up branch naming conventions, (6) Generate changelogs or manage releases,
  (7) Resolve merge conflicts, (8) Review git history or recover from mistakes.
  Applies to all technologies - frontend, backend, mobile, DevOps, and full-stack projects.
---

# Git Workflow

## Quick Reference

### Commit Format (Conventional Commits)
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:** `feat` | `fix` | `docs` | `style` | `refactor` | `perf` | `test` | `build` | `ci` | `chore` | `revert`

**Breaking Changes:** Add `!` after type or `BREAKING CHANGE:` in footer

### Common Examples
```bash
feat: add user authentication
fix(api): handle null response
docs: update README installation
refactor(auth)!: migrate to OAuth2

BREAKING CHANGE: Basic auth removed
```

---

## Workflow Decision Tree

```
What operation?
├── Commit changes ────────────► See "Creating Commits"
├── Choose branching strategy ─► See references/branching-strategies.md
├── Create/review PR ──────────► See references/pr-guidelines.md
├── Dangerous operation ───────► See references/safety.md
└── Need commit type details ──► See references/conventional-commits.md
```

---

## Creating Commits

### Step 1: Review Changes
```bash
git status                    # See what changed
git diff                      # Review unstaged changes
git diff --staged             # Review staged changes
```

### Step 2: Stage Changes
```bash
git add <file>                # Stage specific file
git add -p                    # Stage interactively (recommended)
git add .                     # Stage all (use carefully)
```

### Step 3: Write Commit Message

**Format:**
```
<type>(<scope>): <subject>    # Max 50 chars

<body>                        # Wrap at 72 chars

<footer>
```

**Rules:**
- Subject: imperative mood ("add" not "added"), no period, max 50 chars
- Body: explain WHY, not WHAT (code shows what)
- Footer: reference issues, note breaking changes

**Quick Type Selection:**
| Change Type | Use | Example |
|------------|-----|---------|
| New feature | `feat` | `feat: add dark mode toggle` |
| Bug fix | `fix` | `fix: prevent crash on empty input` |
| Documentation | `docs` | `docs: add API examples` |
| Formatting | `style` | `style: fix indentation` |
| Restructure | `refactor` | `refactor: extract validation logic` |
| Speed improvement | `perf` | `perf: cache database queries` |
| Tests | `test` | `test: add auth unit tests` |
| Build/deps | `build` | `build: upgrade webpack to v5` |
| CI/CD | `ci` | `ci: add GitHub Actions workflow` |
| Maintenance | `chore` | `chore: update gitignore` |

### Step 4: Commit
```bash
git commit -m "feat(auth): add OAuth2 support"

# Or for longer messages
git commit  # Opens editor
```

---

## Branch Operations

### Create Feature Branch
```bash
git checkout main
git pull origin main
git checkout -b feature/description
```

### Keep Branch Updated
```bash
git fetch origin
git rebase origin/main        # Preferred for feature branches
# OR
git merge origin/main         # Creates merge commit
```

### Branch Naming Convention
```
<type>/<ticket>-<description>

feature/PROJ-123-user-auth
fix/PROJ-456-login-error
hotfix/security-patch
release/v2.1.0
docs/api-reference
```

---

## Pull Request Workflow

### Before Creating PR
```bash
# Ensure branch is up to date
git fetch origin
git rebase origin/main

# Run checks
npm test                      # or project's test command
npm run lint                  # or project's lint command

# Review your changes
git log --oneline main..HEAD
git diff main..HEAD --stat
```

### PR Title Format
```
<type>(<scope>): <description>

feat(auth): add OAuth2 login support
fix(api): handle timeout errors
```

### PR Description Template
```markdown
## Summary
Brief description of changes

## Changes
- Change 1
- Change 2

## Test Plan
How to verify changes

Closes #<issue>
```

---

## Safety Guidelines

### Commands to Avoid
| Dangerous | Safe Alternative |
|-----------|------------------|
| `git push --force` | `git push --force-with-lease` |
| `git reset --hard` | `git stash` first |
| `git rebase` on shared branch | Use on local branches only |
| `--no-verify` flag | Fix hook issues properly |
| Amend after push | Create new commit |

### Before Destructive Operations
```bash
# Create backup
git branch backup-$(date +%Y%m%d)

# Or stash changes
git stash

# Check reflog exists
git reflog
```

### Recovery Commands
```bash
# View history
git reflog

# Recover commit
git cherry-pick <hash>

# Recover branch
git checkout -b recovered <hash>

# Undo last commit (keep changes)
git reset --soft HEAD~1
```

---

## Version & Release

### Semantic Versioning
```
MAJOR.MINOR.PATCH (e.g., 2.1.3)

MAJOR: Breaking changes
MINOR: New features (backward compatible)
PATCH: Bug fixes (backward compatible)
```

### How Commits Map to Versions
| Commit | Version Bump |
|--------|--------------|
| `fix:` | PATCH (1.0.0 → 1.0.1) |
| `feat:` | MINOR (1.0.0 → 1.1.0) |
| `BREAKING CHANGE` or `!` | MAJOR (1.0.0 → 2.0.0) |

### Creating Release
```bash
git checkout main
git pull
git tag -a v1.2.0 -m "Release v1.2.0"
git push origin v1.2.0
```

---

## Resources

### Reference Files
| File | When to Use |
|------|-------------|
| [references/branching-strategies.md](references/branching-strategies.md) | Choosing GitFlow vs GitHub Flow vs Trunk-based |
| [references/conventional-commits.md](references/conventional-commits.md) | Detailed commit types, scopes, and examples |
| [references/pr-guidelines.md](references/pr-guidelines.md) | PR templates, review checklists, CODEOWNERS |
| [references/safety.md](references/safety.md) | Dangerous commands, recovery procedures |

### External Tools
- **commitlint**: Enforce commit message format
- **husky**: Git hooks for validation
- **semantic-release**: Automated versioning
- **standard-version**: Changelog generation
