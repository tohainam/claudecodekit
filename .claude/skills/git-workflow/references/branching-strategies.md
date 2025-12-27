# Git Branching Strategies

## Table of Contents
1. [Strategy Selection Guide](#strategy-selection-guide)
2. [Trunk-Based Development](#trunk-based-development)
3. [GitHub Flow](#github-flow)
4. [GitFlow](#gitflow)
5. [GitLab Flow](#gitlab-flow)
6. [Branch Naming Conventions](#branch-naming-conventions)

---

## Strategy Selection Guide

| Criteria | Trunk-Based | GitHub Flow | GitFlow | GitLab Flow |
|----------|-------------|-------------|---------|-------------|
| Team Size | Any | Small-Medium | Medium-Large | Medium-Large |
| Release Frequency | Continuous | Continuous | Scheduled | Flexible |
| Multiple Versions | No | No | Yes | Yes |
| CI/CD Maturity | High | Medium-High | Low-Medium | Medium-High |
| Complexity | Low | Low | High | Medium |

### Quick Decision Tree

```
Need multiple production versions?
├── Yes → GitFlow or GitLab Flow
└── No → Continuous deployment?
    ├── Yes → Team has strong CI/CD?
    │   ├── Yes → Trunk-Based Development
    │   └── No → GitHub Flow
    └── No → GitLab Flow with environment branches
```

---

## Trunk-Based Development

### Overview
All developers work on a single branch (`main`/`trunk`) with short-lived feature branches (< 1 day).

### Structure
```
main ─────●─────●─────●─────●─────●─────●─────►
           \   /       \   /       \   /
            ─●─         ─●─         ─●─
         (feature)   (feature)   (feature)
```

### Rules
- Feature branches live < 24 hours
- Merge to main multiple times per day
- Use feature flags for incomplete features
- Require comprehensive automated testing
- No long-lived branches

### When to Use
- High CI/CD maturity
- Strong automated test coverage
- Teams practicing continuous integration
- Microservices architecture

### Branch Naming
```
<developer>/<ticket>-<short-description>
john/PROJ-123-add-login
```

---

## GitHub Flow

### Overview
Lightweight workflow with protected `main` branch and feature branches for all changes.

### Structure
```
main ─────●─────────────●─────────────●─────►
           \           / \           /
            ●───●───●──   ●───●───●──
           (feature-a)   (feature-b)
```

### Rules
1. `main` is always deployable
2. Create descriptive feature branches from `main`
3. Push commits regularly
4. Open PR when ready for review
5. Merge only after approval
6. Deploy immediately after merge

### When to Use
- Web applications with single production version
- Small to medium teams
- Continuous deployment environments
- Projects without version releases

### Branch Naming
```
feature/<description>
fix/<description>
docs/<description>
```

---

## GitFlow

### Overview
Structured workflow with dedicated branches for features, releases, and hotfixes.

### Structure
```
main     ─────●───────────────────●───────────●─────►
              │                   │           │
hotfix        │                   │     ●───●─┤
              │                   │    /      │
release       │             ●───●─┴───●       │
              │            /                  │
develop ──────●───●───●───●───────────────────●─────►
               \ / \ /
feature         ●   ●
```

### Branch Types

| Branch | From | Merges To | Purpose |
|--------|------|-----------|---------|
| `main` | - | - | Production-ready code |
| `develop` | `main` | - | Integration branch |
| `feature/*` | `develop` | `develop` | New features |
| `release/*` | `develop` | `main` + `develop` | Release preparation |
| `hotfix/*` | `main` | `main` + `develop` | Production fixes |

### Rules
- Never commit directly to `main` or `develop`
- Features branch from and merge to `develop`
- Releases branch from `develop`, merge to both `main` and `develop`
- Hotfixes branch from `main`, merge to both `main` and `develop`
- Tag releases on `main`

### When to Use
- Software with scheduled releases
- Multiple versions in production
- Large teams needing clear structure
- Products requiring release cycles

### Branch Naming
```
feature/<ticket>-<description>
release/<version>
hotfix/<ticket>-<description>
```

---

## GitLab Flow

### Overview
Combines GitHub Flow simplicity with environment branches for deployment control.

### Structure (Environment Branches)
```
main ─────●─────●─────●─────●─────►
          │     │     │
staging ──●─────●─────●───────────►
                │     │
production ─────●─────●───────────►
```

### Structure (Release Branches)
```
main ─────●─────●─────●─────●─────►
          │           │
1.0 ──────●───────────│───────────►
                      │
2.0 ──────────────────●───────────►
```

### Rules
- `main` reflects latest development
- Environment branches for deployment stages
- Merge downstream only (main → staging → production)
- Cherry-pick for hotfixes when needed
- Release branches for versioned software

### When to Use
- Multiple deployment environments
- Need more control than GitHub Flow
- Want simpler workflow than GitFlow
- Hybrid release strategies

---

## Branch Naming Conventions

### Universal Format
```
<type>/<scope>-<description>
```

### Type Prefixes

| Prefix | Purpose | Example |
|--------|---------|---------|
| `feature/` | New functionality | `feature/user-auth` |
| `fix/` or `bugfix/` | Bug fixes | `fix/login-error` |
| `hotfix/` | Urgent production fix | `hotfix/security-patch` |
| `release/` | Release preparation | `release/v2.1.0` |
| `docs/` | Documentation | `docs/api-guide` |
| `refactor/` | Code refactoring | `refactor/auth-module` |
| `test/` | Test additions | `test/auth-coverage` |
| `chore/` | Maintenance | `chore/deps-update` |
| `ci/` | CI/CD changes | `ci/github-actions` |

### Naming Rules
1. Use lowercase letters
2. Use hyphens for spaces (not underscores)
3. Keep it short but descriptive (< 50 chars)
4. Include ticket number when available
5. Avoid special characters

### Examples by Technology

**Frontend:**
```
feature/PROJ-123-add-dark-mode
fix/PROJ-456-button-alignment
refactor/optimize-bundle-size
```

**Backend:**
```
feature/api-rate-limiting
fix/memory-leak-connection-pool
hotfix/sql-injection-fix
```

**DevOps:**
```
ci/add-staging-pipeline
chore/upgrade-node-18
```

**Mobile:**
```
feature/ios-push-notifications
fix/android-crash-startup
```
