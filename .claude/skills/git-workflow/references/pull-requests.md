# Pull Requests

## PR Size Guidelines

### Optimal PR Size

```
Ideal: 200-400 lines changed
Maximum: 800 lines (strongly discourage larger)
```

### Size Impact

| Size | Lines   | Review Quality | Merge Time |
| ---- | ------- | -------------- | ---------- |
| XS   | < 50    | Excellent      | < 1 hour   |
| S    | 50-200  | Very Good      | < 4 hours  |
| M    | 200-400 | Good           | < 1 day    |
| L    | 400-800 | Declining      | 1-2 days   |
| XL   | > 800   | Poor           | > 2 days   |

### Breaking Down Large PRs

1. **By layer**: API changes, then UI changes
2. **By feature**: Core functionality, then enhancements
3. **By file type**: Models, then services, then tests
4. **By dependency**: Build foundation, then features

```bash
# Create stacked PRs
git checkout -b feature/part-1
# ... make changes ...
git push -u origin feature/part-1
gh pr create --base main

git checkout -b feature/part-2
# ... make more changes ...
git push -u origin feature/part-2
gh pr create --base feature/part-1
```

## PR Title and Description

### Title Format

Follow conventional commits:

```
<type>(<scope>): <description>

Examples:
feat(auth): add two-factor authentication
fix(api): resolve race condition in payment processing
docs: update deployment instructions
```

### Description Template

```markdown
## Summary

Brief description of changes and motivation.

## Changes

- Added X functionality
- Fixed Y bug
- Updated Z documentation

## Type of Change

- [ ] Bug fix (non-breaking change fixing an issue)
- [ ] New feature (non-breaking change adding functionality)
- [ ] Breaking change (fix or feature causing existing functionality to change)
- [ ] Documentation update

## Testing

- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Screenshots (if applicable)

[Add screenshots for UI changes]

## Checklist

- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No new warnings introduced
- [ ] Tests pass locally
```

## PR Workflow

### Creating a PR

```bash
# Ensure branch is up to date
git fetch origin main
git rebase origin/main

# Push branch
git push -u origin feature/my-feature

# Create PR with GitHub CLI
gh pr create \
  --title "feat(auth): add OAuth login" \
  --body "$(cat <<'EOF'
## Summary
Implements OAuth2 login with Google and GitHub providers.

## Changes
- Add OAuth2 authentication flow
- Implement provider configurations
- Add login buttons to UI

## Testing
- [x] Unit tests for OAuth service
- [x] Integration tests for login flow
- [x] Manual testing with test accounts

Closes #123
EOF
)"
```

### Requesting Review

```bash
# Request specific reviewers
gh pr edit --add-reviewer alice,bob

# Add labels
gh pr edit --add-label "needs-review,feature"

# Add to project
gh pr edit --add-project "Sprint 12"
```

### Addressing Feedback

```bash
# Make changes based on feedback
git add .
git commit -m "address review feedback: rename variable"

# Or amend if appropriate (only if not yet reviewed)
git commit --amend
git push --force-with-lease  # Safer than --force

# Mark conversations as resolved in GitHub UI
```

## PR Review Process

### Review Timeline

| Priority | First Review | Complete Review |
| -------- | ------------ | --------------- |
| Critical | < 2 hours    | < 4 hours       |
| High     | < 4 hours    | < 1 day         |
| Normal   | < 1 day      | < 2 days        |
| Low      | < 2 days     | < 3 days        |

### Review Checklist

```markdown
## Functionality

- [ ] Changes work as described
- [ ] Edge cases handled
- [ ] Error handling appropriate

## Code Quality

- [ ] Code is readable and maintainable
- [ ] No unnecessary complexity
- [ ] Follows project conventions

## Testing

- [ ] Tests cover new functionality
- [ ] Tests cover edge cases
- [ ] No flaky tests introduced

## Security

- [ ] No security vulnerabilities introduced
- [ ] Input validation present
- [ ] Sensitive data handled properly

## Performance

- [ ] No obvious performance issues
- [ ] Database queries optimized
- [ ] No memory leaks
```

## Merge Strategies

### When to Use Each

| Strategy         | Use When                              |
| ---------------- | ------------------------------------- |
| **Merge commit** | Preserve full history, complex PRs    |
| **Squash merge** | Clean history, many small commits     |
| **Rebase merge** | Linear history, already clean commits |

### Merge Commit

```bash
# Preserves all commits and creates merge commit
git checkout main
git merge --no-ff feature/branch
```

Result:

```
main    ●───●───────●───●
             ╲     ╱
feature       ●───●
```

### Squash Merge

```bash
# Combines all commits into one
gh pr merge --squash
```

Result:

```
main    ●───●───●───●
                    ↑
              (squashed)
```

### Rebase Merge

```bash
# Replays commits onto main
gh pr merge --rebase
```

Result:

```
main    ●───●───●───●───●
                    ↑───↑
              (rebased commits)
```

## Draft PRs

### When to Use

- Work in progress, seeking early feedback
- Blocked by dependencies
- Exploring approach before full implementation

```bash
# Create draft PR
gh pr create --draft --title "WIP: new feature"

# Mark as ready
gh pr ready
```

## PR Automation

### GitHub Actions for PRs

```yaml
# .github/workflows/pr-checks.yml
name: PR Checks

on:
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run lint

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm test

  size-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: codelytv/pr-size-labeler@v1
        with:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          xs_label: "size/xs"
          xs_max_size: 50
          s_label: "size/s"
          s_max_size: 200
          m_label: "size/m"
          m_max_size: 400
          l_label: "size/l"
          l_max_size: 800
          xl_label: "size/xl"
```

### Auto-Merge

```yaml
# Enable auto-merge for dependabot
name: Auto-merge Dependabot

on:
  pull_request:
    types: [opened, reopened]

jobs:
  auto-merge:
    if: github.actor == 'dependabot[bot]'
    runs-on: ubuntu-latest
    steps:
      - uses: dependabot/fetch-metadata@v1
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
      - run: gh pr merge --auto --squash "$PR_URL"
        env:
          PR_URL: ${{ github.event.pull_request.html_url }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## Stacked PRs

### Workflow

```bash
# Base feature
git checkout -b feature/auth-base main
# ... implement base ...
git push -u origin feature/auth-base
gh pr create --base main --title "feat(auth): base authentication"

# Extension (stacked on base)
git checkout -b feature/auth-oauth feature/auth-base
# ... implement OAuth ...
git push -u origin feature/auth-oauth
gh pr create --base feature/auth-base --title "feat(auth): add OAuth providers"

# After base is merged, rebase extension
git checkout feature/auth-oauth
git rebase main
gh pr edit --base main
```

### Best Practices

- Keep each PR independently reviewable
- Document dependencies in PR description
- Update base branch reference after merge
- Use tools like `git-stack` or `graphite` for complex stacks
