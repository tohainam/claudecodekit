# Conventional Commits Reference

## Table of Contents
1. [Format Specification](#format-specification)
2. [Commit Types](#commit-types)
3. [Scopes](#scopes)
4. [Breaking Changes](#breaking-changes)
5. [Examples by Technology](#examples-by-technology)
6. [Semantic Versioning Mapping](#semantic-versioning-mapping)

---

## Format Specification

### Full Format
```
<type>(<scope>): <subject>

<body>

<footer(s)>
```

### Minimal Format
```
<type>: <subject>
```

### Rules
| Element | Required | Description |
|---------|----------|-------------|
| `type` | Yes | Category of change |
| `scope` | No | Component affected |
| `!` | No | Breaking change indicator |
| `subject` | Yes | Short description (imperative mood) |
| `body` | No | Detailed explanation |
| `footer` | No | Metadata (breaking changes, refs) |

### Subject Guidelines
- Use imperative mood: "add" not "added" or "adds"
- No capitalization at start
- No period at end
- Max 50 characters (72 for body lines)
- Complete the sentence: "This commit will..."

---

## Commit Types

### Core Types (SemVer Impact)

| Type | Description | SemVer | Example |
|------|-------------|--------|---------|
| `feat` | New feature | MINOR | `feat: add user registration` |
| `fix` | Bug fix | PATCH | `fix: resolve null pointer exception` |

### Extended Types (No Version Bump)

| Type | Description | When to Use |
|------|-------------|-------------|
| `build` | Build system/dependencies | webpack config, package.json |
| `chore` | Maintenance tasks | gitignore, editor config |
| `ci` | CI/CD configuration | GitHub Actions, Jenkins |
| `docs` | Documentation only | README, API docs, comments |
| `style` | Code formatting | whitespace, semicolons, linting |
| `refactor` | Code restructure (no behavior change) | rename, extract method |
| `perf` | Performance improvement | optimize algorithm, caching |
| `test` | Add/modify tests | unit tests, integration tests |
| `revert` | Revert previous commit | undo changes |

---

## Scopes

### Purpose
Scopes provide additional context about what part of the codebase was affected.

### Scope Conventions by Project Type

**Frontend (React/Vue/Angular):**
```
components, hooks, store, utils, api, styles, types, config
```

**Backend (API):**
```
auth, users, orders, payments, db, middleware, routes, services
```

**Full-Stack:**
```
client, server, shared, api, db, config, deploy
```

**Mobile:**
```
ios, android, shared, navigation, screens, services
```

**Monorepo:**
```
pkg-name, app-name, lib-name
```

### Examples with Scopes
```
feat(auth): add OAuth2 support
fix(api): handle timeout errors gracefully
docs(readme): update installation steps
style(components): apply consistent formatting
refactor(utils): extract date formatting helpers
test(users): add integration tests for registration
```

---

## Breaking Changes

### Marking Breaking Changes

**Method 1: Exclamation Mark**
```
feat!: remove deprecated API endpoints
feat(api)!: change response format
```

**Method 2: Footer**
```
feat: update authentication flow

BREAKING CHANGE: JWT tokens now expire after 1 hour instead of 24 hours.
Existing tokens will be invalidated.
```

**Method 3: Both (Recommended for Major Changes)**
```
feat(auth)!: migrate to OAuth2

BREAKING CHANGE: Basic auth is no longer supported.
Users must re-authenticate using OAuth2.

Migration guide: https://docs.example.com/oauth2-migration
```

### Breaking Change Footer Format
```
BREAKING CHANGE: <description>

<optional detailed explanation>
<optional migration instructions>
```

---

## Examples by Technology

### Frontend (React/Vue)
```
feat(components): add DatePicker component
fix(hooks): prevent memory leak in useSubscription
style(ui): standardize button spacing
refactor(store): migrate from Redux to Zustand
perf(images): implement lazy loading
test(forms): add validation tests
build(webpack): optimize bundle splitting
```

### Backend (Node.js/Python/Go/Java)
```
feat(api): add rate limiting middleware
fix(db): resolve connection pool exhaustion
perf(queries): add index for user lookups
refactor(services): extract payment logic
docs(swagger): update API documentation
test(integration): add e2e tests for checkout
ci(docker): multi-stage build optimization
```

### Mobile (iOS/Android/Flutter)
```
feat(ios): implement biometric authentication
fix(android): resolve crash on orientation change
perf(flutter): optimize list rendering
style(ui): update theme colors
refactor(navigation): simplify routing logic
test(screens): add widget tests
```

### DevOps/Infrastructure
```
ci(actions): add automated testing workflow
chore(deps): update security dependencies
build(docker): reduce image size
feat(terraform): add auto-scaling configuration
fix(k8s): correct resource limits
docs(runbook): add incident response guide
```

### Database/Migrations
```
feat(migrations): add users table
fix(schema): correct foreign key constraint
refactor(queries): optimize slow queries
docs(erd): update database diagram
```

---

## Semantic Versioning Mapping

### How Commits Map to Versions

| Commit Type | Version Bump | Before | After |
|-------------|--------------|--------|-------|
| `fix:` | PATCH | 1.2.3 | 1.2.4 |
| `feat:` | MINOR | 1.2.3 | 1.3.0 |
| `BREAKING CHANGE` or `!` | MAJOR | 1.2.3 | 2.0.0 |
| `docs:`, `style:`, `refactor:`, `test:`, `chore:` | None | 1.2.3 | 1.2.3 |

### Release Automation

Tools that support conventional commits:
- **semantic-release**: Fully automated versioning and publishing
- **standard-version**: Changelog generation and versioning
- **commitlint**: Enforce commit message format
- **husky**: Git hooks for validation

### Changelog Generation

Conventional commits enable automatic changelog grouping:

```markdown
## [2.1.0] - 2025-12-26

### Features
- add user registration (abc1234)
- implement OAuth2 support (def5678)

### Bug Fixes
- resolve null pointer exception (ghi9012)
- handle timeout errors gracefully (jkl3456)

### Performance
- optimize database queries (mno7890)
```

---

## Quick Reference Card

```
# Feature
feat: add login functionality
feat(auth): add OAuth2 support

# Bug Fix
fix: resolve memory leak
fix(api): handle null response

# Breaking Change
feat!: remove deprecated endpoint
feat(api)!: change response format

# With Body
fix(auth): prevent session timeout

The session was expiring prematurely due to
incorrect token refresh logic.

Closes #123

# With Multiple Footers
feat(payments): add Stripe integration

Implements payment processing via Stripe API.

Reviewed-by: John Doe
Refs: #456, #789
```
