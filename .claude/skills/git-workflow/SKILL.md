---
name: git-workflow
description: "Git conventions, branching strategies, and commit practices. Use when: Choosing a branching strategy, Writing commit messages, Creating pull requests, Reviewing code."
---

# Git Workflow

## When to Use

- Choosing a branching strategy for a project
- Writing commit messages
- Creating or reviewing pull requests
- Setting up Git workflow automation
- Resolving merge conflicts

## Quick Start

### Branching Strategy Decision

| Situation                  | Recommended Strategy    |
| -------------------------- | ----------------------- |
| CI/CD, frequent deploys    | Trunk-based development |
| Multiple release versions  | GitFlow                 |
| Small team, single product | GitHub Flow             |
| Open source project        | Fork & Pull Request     |

### Conventional Commits (Quick Reference)

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

**Types**:
| Type | Use For |
|------|---------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation |
| `style` | Formatting (no code change) |
| `refactor` | Code restructure |
| `perf` | Performance improvement |
| `test` | Adding tests |
| `chore` | Maintenance |

**Examples**:

```
feat(auth): add OAuth2 login support
fix(api): handle null response from payment gateway
docs: update API documentation for v2 endpoints
refactor(user): extract validation into separate module
```

## Guidelines

### DO

- Use trunk-based development for most projects
- Write atomic commits (one logical change per commit)
- Use conventional commit format
- Keep PRs small (< 250 lines of code)
- Review PRs within 24 hours
- Use merge queues for high-traffic repos

### DON'T

- Force push to main/master
- Commit directly to protected branches
- Create long-lived feature branches (> 2-3 days)
- Squash commits that should stay separate
- Skip code review for "small" changes
- Leave PRs open for more than a few days

## Pull Request Guidelines

### Size Recommendations

| Size | Lines Changed | Review Time |
| ---- | ------------- | ----------- |
| XS   | < 50          | 15 min      |
| S    | 50-200        | 30 min      |
| M    | 200-400       | 1 hour      |
| L    | 400-800       | 2+ hours    |
| XL   | > 800         | Split it    |

### PR Template

```markdown
## Summary

[Brief description of changes]

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing performed

## Checklist

- [ ] Code follows project style
- [ ] Self-reviewed changes
- [ ] Documentation updated
```

## Git Safety

### Before Dangerous Operations

```bash
# Always backup before rebase
git branch backup-branch-name

# Check current state
git status
git log --oneline -5

# Verify remote state
git fetch --all
git branch -vv
```

### Recovery Commands

```bash
# Undo last commit (keep changes)
git reset --soft HEAD~1

# Recover deleted branch
git reflog
git checkout -b branch-name <commit-sha>

# Abort failed rebase
git rebase --abort
```

## References

- [Branching Strategies](references/branching.md) - Trunk-based, GitFlow, GitHub Flow
- [Conventional Commits](references/conventional-commits.md) - Message format
- [Pull Requests](references/pull-requests.md) - PR best practices
- [Code Review](references/code-review.md) - Review guidelines
