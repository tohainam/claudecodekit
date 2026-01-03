# Branching Strategies

## Trunk-Based Development

### Overview

All developers commit to a single branch (main/trunk) with short-lived feature branches.

```
main ─────●───●───●───●───●───●───●───●───●─────►
           ╲       ╱       ╲   ╱
feature-1   ●─────●         ● ●
            (< 2 days)   feature-2
```

### Characteristics

| Aspect          | Description                          |
| --------------- | ------------------------------------ |
| Branch lifetime | < 1-2 days                           |
| Merge frequency | Multiple times daily                 |
| Code review     | Pair programming or quick PRs        |
| Release         | Feature flags, continuous deployment |

### When to Use

- CI/CD pipelines
- Small to medium teams (< 20 devs)
- Web applications with continuous deployment
- Teams with strong testing culture

### Implementation

```bash
# Start feature (from updated main)
git checkout main
git pull
git checkout -b feature/short-description

# Work and commit frequently
git commit -m "feat: partial implementation"
git push -u origin feature/short-description

# Keep up with main (daily)
git fetch origin main
git rebase origin/main

# Merge quickly (within 1-2 days)
gh pr create --fill
gh pr merge --squash
```

### Feature Flags

```typescript
// Use flags to hide incomplete features
if (featureFlags.isEnabled("new-checkout")) {
  return <NewCheckout />;
}
return <OldCheckout />;
```

## GitFlow

### Overview

Structured workflow with dedicated branches for features, releases, and hotfixes.

```
main      ───●───────────────────●─────────●───────►
              ╲                 ╱           ╲
hotfix         ────────────────●─────────────●
               ╲             ╱
develop  ───●───●───●───●───●───●───●───●───●───●───►
              ╲       ╱   ╲       ╱
feature-1      ●─────●     ●─────●
                          feature-2
              ╲                       ╱
release        ────────●───●─────────●
```

### Branch Types

| Branch      | Purpose         | From    | Merge To       |
| ----------- | --------------- | ------- | -------------- |
| `main`      | Production code | -       | -              |
| `develop`   | Integration     | -       | -              |
| `feature/*` | New features    | develop | develop        |
| `release/*` | Release prep    | develop | main + develop |
| `hotfix/*`  | Urgent fixes    | main    | main + develop |

### When to Use

- Products with scheduled releases
- Multiple versions in production
- Larger teams with QA process
- Enterprise software

### Implementation

```bash
# Start feature
git checkout develop
git pull
git checkout -b feature/user-auth

# Complete feature
git checkout develop
git merge --no-ff feature/user-auth
git branch -d feature/user-auth

# Start release
git checkout -b release/1.2.0 develop

# Complete release
git checkout main
git merge --no-ff release/1.2.0
git tag -a v1.2.0
git checkout develop
git merge --no-ff release/1.2.0
git branch -d release/1.2.0

# Hotfix
git checkout -b hotfix/1.2.1 main
# ... fix bug ...
git checkout main
git merge --no-ff hotfix/1.2.1
git tag -a v1.2.1
git checkout develop
git merge --no-ff hotfix/1.2.1
git branch -d hotfix/1.2.1
```

## GitHub Flow

### Overview

Simplified workflow: main branch + feature branches with pull requests.

```
main    ───●───●───●───●───●───●───●───●───●───●───►
            ╲       ╱       ╲   ╱   ╲       ╱
feature      ●─────●         ● ●     ●─────●
             PR              PR      PR
```

### Process

1. Create branch from `main`
2. Add commits
3. Open Pull Request
4. Discuss and review
5. Deploy and test
6. Merge to `main`

### When to Use

- Web applications
- Small teams
- Continuous deployment
- Simple release process

### Implementation

```bash
# Create feature branch
git checkout main
git pull
git checkout -b feature/new-dashboard

# Work on feature
git add .
git commit -m "feat: add dashboard component"
git push -u origin feature/new-dashboard

# Create PR via GitHub CLI
gh pr create --title "Add new dashboard" --body "Implements #123"

# After approval, merge
gh pr merge --merge
```

## Comparison

| Aspect          | Trunk-Based     | GitFlow              | GitHub Flow    |
| --------------- | --------------- | -------------------- | -------------- |
| Complexity      | Low             | High                 | Medium         |
| Branch lifetime | Hours           | Days/Weeks           | Days           |
| Release process | Continuous      | Scheduled            | On merge       |
| Best for        | CI/CD, web apps | Enterprise, versions | Startups, SaaS |
| Team size       | Any             | Large                | Small-Medium   |

## Release Strategies

### Semantic Versioning

```
MAJOR.MINOR.PATCH

1.0.0 → 1.0.1 (patch: bug fix)
1.0.1 → 1.1.0 (minor: new feature)
1.1.0 → 2.0.0 (major: breaking change)
```

### Tagging Releases

```bash
# Create annotated tag
git tag -a v1.2.0 -m "Release version 1.2.0"

# Push tags
git push origin v1.2.0
# or push all tags
git push --tags

# List tags
git tag -l "v1.*"
```

### Release Branches

```bash
# Create release branch
git checkout -b release/v1.2.0

# Bump version
npm version minor  # or edit manually

# Commit version bump
git commit -am "chore: bump version to 1.2.0"

# After testing, merge and tag
git checkout main
git merge release/v1.2.0
git tag -a v1.2.0 -m "Release 1.2.0"
git push origin main --tags
```

## Merge Queues

### Why Use Merge Queues

- Prevent broken main branch
- Handle parallel PR merges
- Ensure CI passes after merge

### GitHub Merge Queue

```yaml
# .github/branch-protection.json
{
  "required_status_checks":
    { "strict": true, "contexts": ["ci/tests", "ci/lint"] },
  "merge_queue":
    { "enabled": true, "merge_method": "squash", "max_entries_to_build": 5 },
}
```

### How It Works

```
PR1 ─────┐
         ├──► Merge Queue ──► CI ──► Merge to main
PR2 ─────┤    (batches PRs)
PR3 ─────┘
```

## Branch Naming Conventions

### Format

```
<type>/<ticket>-<description>

Examples:
feature/AUTH-123-oauth-login
bugfix/API-456-null-handling
hotfix/PROD-789-payment-fix
docs/update-readme
refactor/extract-utils
```

### Types

| Prefix      | Purpose               |
| ----------- | --------------------- |
| `feature/`  | New functionality     |
| `bugfix/`   | Non-urgent bug fix    |
| `hotfix/`   | Urgent production fix |
| `docs/`     | Documentation changes |
| `refactor/` | Code restructuring    |
| `test/`     | Test additions        |
| `chore/`    | Maintenance tasks     |
