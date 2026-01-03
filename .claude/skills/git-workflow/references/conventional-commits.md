# Conventional Commits

## Specification (v1.0.0)

### Format

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Rules

1. **Type** is required
2. **Scope** is optional, in parentheses
3. **Description** starts with lowercase, no period at end
4. **Body** is optional, blank line after description
5. **Footer** is optional, for breaking changes and references

## Types

### Core Types

| Type   | Description | Semantic Version |
| ------ | ----------- | ---------------- |
| `feat` | New feature | MINOR            |
| `fix`  | Bug fix     | PATCH            |

### Extended Types

| Type       | Description                 | SemVer Impact |
| ---------- | --------------------------- | ------------- |
| `docs`     | Documentation only          | None          |
| `style`    | Formatting, no code change  | None          |
| `refactor` | Code change, no feature/fix | None          |
| `perf`     | Performance improvement     | PATCH         |
| `test`     | Adding/fixing tests         | None          |
| `build`    | Build system, dependencies  | None          |
| `ci`       | CI configuration            | None          |
| `chore`    | Other changes               | None          |
| `revert`   | Revert previous commit      | Depends       |

## Examples

### Simple Commits

```bash
# Feature
git commit -m "feat: add user avatar upload"

# Bug fix
git commit -m "fix: resolve race condition in checkout"

# Documentation
git commit -m "docs: add API authentication guide"

# Refactoring
git commit -m "refactor: extract validation logic"

# Performance
git commit -m "perf: optimize database queries"
```

### With Scope

```bash
# Feature with scope
git commit -m "feat(auth): implement OAuth2 login"

# Fix with scope
git commit -m "fix(api): handle null response gracefully"

# Refactor with scope
git commit -m "refactor(user): simplify profile update logic"
```

### With Body

```bash
git commit -m "feat(cart): add quantity validation

Validates that cart item quantities are positive integers.
Prevents negative quantities and decimal values.

Addresses user-reported issue with cart totals."
```

### Breaking Changes

```bash
# Method 1: Footer
git commit -m "feat(api): change authentication header format

BREAKING CHANGE: Authorization header now uses Bearer scheme.
Update all API clients to use 'Bearer <token>' instead of '<token>'."

# Method 2: Exclamation mark
git commit -m "feat(api)!: change authentication header format"
```

### References

```bash
# Closes issue
git commit -m "fix(login): resolve timeout error

Closes #123"

# Multiple references
git commit -m "feat(dashboard): add analytics widget

Implements #456
See-also: #789"
```

## Multi-Line Commits (Template)

```bash
# Using heredoc
git commit -m "$(cat <<'EOF'
feat(payments): implement Stripe integration

Add support for Stripe payment processing:
- Credit card payments
- Webhook handling
- Refund processing

This replaces the legacy payment system.

Closes #234
Co-authored-by: Alice <alice@example.com>
EOF
)"
```

## Scope Guidelines

### Choosing Scopes

Define scopes based on your project:

| Project Type | Example Scopes                                 |
| ------------ | ---------------------------------------------- |
| Monolith     | `auth`, `api`, `ui`, `db`, `config`            |
| Monorepo     | `@app/web`, `@lib/utils`, `@api/users`         |
| Frontend     | `components`, `hooks`, `pages`, `styles`       |
| Backend      | `handlers`, `models`, `middleware`, `services` |

### Scope Rules

1. Keep scopes short (1-2 words)
2. Use lowercase
3. Be consistent across team
4. Document allowed scopes in CONTRIBUTING.md

## Commit Message Best Practices

### Description Guidelines

```bash
# Good: Imperative mood, concise
git commit -m "feat: add user search functionality"

# Bad: Past tense
git commit -m "feat: added user search functionality"

# Bad: Present participle
git commit -m "feat: adding user search functionality"

# Bad: Too vague
git commit -m "feat: update code"

# Bad: Too detailed (put in body)
git commit -m "feat: add search with elasticsearch using fuzzy matching and pagination"
```

### Body Guidelines

- Explain **what** and **why**, not **how**
- Wrap at 72 characters
- Use bullet points for multiple changes
- Reference issues and other commits

```
fix(auth): prevent session fixation attack

The previous implementation reused session IDs after login,
which could allow session fixation attacks.

Changes:
- Regenerate session ID on successful login
- Clear old session data
- Add audit logging for session events

Security: This addresses CVE-2024-XXXX
Closes #567
```

## Automation

### Commitlint Configuration

```javascript
// commitlint.config.js
module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "feat",
        "fix",
        "docs",
        "style",
        "refactor",
        "perf",
        "test",
        "build",
        "ci",
        "chore",
        "revert",
      ],
    ],
    "scope-enum": [2, "always", ["auth", "api", "ui", "db", "config", "deps"]],
    "subject-case": [2, "always", "lower-case"],
    "subject-max-length": [2, "always", 72],
    "body-max-line-length": [2, "always", 100],
  },
};
```

### Husky Pre-Commit Hook

```bash
# .husky/commit-msg
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"
npx --no -- commitlint --edit "$1"
```

### Semantic Release

```javascript
// release.config.js
module.exports = {
  branches: ["main"],
  plugins: [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    "@semantic-release/changelog",
    "@semantic-release/npm",
    "@semantic-release/github",
  ],
};
```

## Quick Reference Card

```
┌─────────────────────────────────────────────────────┐
│                 CONVENTIONAL COMMITS                 │
├─────────────────────────────────────────────────────┤
│  FORMAT: <type>(<scope>): <description>             │
│                                                     │
│  TYPES:                                             │
│    feat     → New feature          (MINOR)         │
│    fix      → Bug fix              (PATCH)         │
│    docs     → Documentation                        │
│    style    → Formatting                           │
│    refactor → Code restructure                     │
│    perf     → Performance          (PATCH)         │
│    test     → Tests                                │
│    build    → Build system                         │
│    ci       → CI config                            │
│    chore    → Maintenance                          │
│                                                     │
│  BREAKING CHANGE:                                   │
│    feat!: ...  or  BREAKING CHANGE: in footer      │
│                                                     │
│  EXAMPLES:                                          │
│    feat(auth): add OAuth login                     │
│    fix(api): handle null response                  │
│    docs: update README                             │
└─────────────────────────────────────────────────────┘
```
