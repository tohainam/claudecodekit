---
name: code-quality
description: |
  Universal code quality best practices for writing clean, maintainable, secure code across all technologies (frontend, backend, mobile, DevOps). Use when: (1) Writing or reviewing code, (2) Refactoring existing code, (3) Setting up linting/formatting, (4) Conducting code reviews, (5) Improving code readability, (6) Fixing code smells, (7) Implementing error handling, (8) Adding tests, (9) Security hardening, (10) Establishing coding standards for a team or project.
---

# Code Quality

Universal principles and practices for writing professional, maintainable code.

## Core Principles

### Clean Code Fundamentals
| Principle | Rule | Violation Sign |
|-----------|------|----------------|
| **KISS** | Simple over clever | Needs explanation to understand |
| **DRY** | Extract after 3+ duplications | Copy-paste with minor changes |
| **YAGNI** | Build for now, not hypothetical futures | Features nobody requested |
| **Single Responsibility** | One reason to change | Class doing many unrelated things |
| **Fail Fast** | Detect and report errors early | Silent failures, bad state propagation |

### Quality Decision Tree

```
                    ┌─────────────────────────┐
                    │   What are you doing?   │
                    └───────────┬─────────────┘
                                │
    ┌───────────────────────────┼───────────────────────────┐
    ▼                           ▼                           ▼
┌─────────┐              ┌─────────────┐              ┌─────────┐
│ Writing │              │  Reviewing  │              │  Fixing │
│  Code   │              │    Code     │              │  Issues │
└────┬────┘              └──────┬──────┘              └────┬────┘
     │                          │                          │
     ▼                          ▼                          ▼
Use Naming &              Use Review                 Use Patterns &
Patterns refs             Checklist                  Refactoring refs
```

## Quick Reference Checklists

### Before Committing Code
```
READABILITY
□ Names reveal intent (no x, temp, data)?
□ Functions do ONE thing?
□ No magic numbers (use constants)?
□ Complex logic has comments explaining WHY?

ROBUSTNESS
□ Inputs validated?
□ Errors handled appropriately?
□ Edge cases considered (null, empty, boundary)?
□ No hardcoded secrets?

MAINTAINABILITY
□ DRY applied (no copy-paste)?
□ Dependencies explicit and minimal?
□ Testable without external systems?
□ Changes localized (low coupling)?
```

### Code Review Checklist
```
CORRECTNESS
□ Solves the stated problem?
□ Edge cases handled?
□ No obvious bugs or logic errors?

SECURITY
□ Input validation present?
□ No SQL injection, XSS risks?
□ Sensitive data protected?
□ Auth/authz correct?

QUALITY
□ Follows project conventions?
□ Appropriate error handling?
□ Tests added for new code?
□ No code smells introduced?
```

## Naming Quick Reference

| Element | Convention | Example |
|---------|------------|---------|
| Variables | Descriptive, context-appropriate | `userEmail`, `isActive`, `orderItems` |
| Functions | Verb + noun, describes action | `calculateTax()`, `validateEmail()` |
| Booleans | is/has/can/should prefix | `isValid`, `hasPermission`, `canEdit` |
| Classes | Noun, PascalCase | `UserService`, `PaymentGateway` |
| Constants | SCREAMING_SNAKE | `MAX_RETRIES`, `DEFAULT_TIMEOUT` |
| Files | Match content, kebab or snake | `user-service.ts`, `test_helpers.py` |

**Detailed conventions:** See [references/naming.md](references/naming.md)

## Function Design

### Good Functions
```
✓ Small (< 20 lines ideally)
✓ Single purpose (one reason to exist)
✓ Few parameters (≤ 3, use objects for more)
✓ Consistent abstraction level
✓ Descriptive name (no need for comments)
```

### Code Smell Fixes

| Smell | Sign | Quick Fix |
|-------|------|-----------|
| Long method | Scrolling needed | Extract methods |
| Long parameter list | > 3 params | Use parameter object |
| Magic numbers | `if (status === 3)` | Extract constant |
| Duplicate code | Copy-paste | Extract function |
| Deep nesting | > 3 levels | Early returns, extract |
| Comments | Explaining what | Rename to be self-documenting |

**Pattern details:** See [references/patterns.md](references/patterns.md)

## Error Handling

### Principles
```
1. Fail fast: Detect errors early, don't propagate bad state
2. Fail secure: Deny on error, never fail open
3. Catch specific: Avoid bare except/catch
4. Log appropriately: Include context, exclude secrets
5. User-friendly: Generic messages to users, details in logs
```

### Pattern
```javascript
try {
  // Risky operation
} catch (SpecificError) {
  logger.error('Context', { relevant, data, error });
  // Handle or rethrow appropriately
}
```

**Full guide:** See [references/error-handling.md](references/error-handling.md)

## Security Essentials (OWASP 2025)

| Risk | Prevention |
|------|------------|
| Injection | Parameterized queries, input validation |
| Broken Access | Server-side authz, deny by default |
| Crypto Failures | Strong algorithms, secure key management |
| Security Misconfig | Hardened defaults, minimal permissions |
| Vulnerable Components | Dependency scanning, regular updates |

### Security Checklist
```
□ All input validated server-side?
□ Using parameterized queries?
□ Output encoded for context?
□ No hardcoded secrets?
□ HTTPS everywhere?
□ Dependencies audited?
```

**Full OWASP guide:** See [references/security.md](references/security.md)

## Testing Essentials

### Test Pyramid
```
Few   →  E2E Tests      (critical paths only)
Some  →  Integration    (APIs, DB, services)
Many  →  Unit Tests     (logic, edge cases)
```

### Good Tests
```
✓ Fast (unit tests < 100ms)
✓ Independent (no test order dependency)
✓ Repeatable (same result every run)
✓ Self-validating (clear pass/fail)
✓ Named descriptively (documents behavior)
```

**Testing patterns:** See [references/testing.md](references/testing.md)

## Tools by Language

| Language | Formatter | Linter | Type Checker |
|----------|-----------|--------|--------------|
| JS/TS | Prettier | ESLint | TypeScript |
| Python | Ruff/Black | Ruff/Pylint | mypy |
| Go | gofmt | golangci-lint | Built-in |
| Java | - | Checkstyle, SpotBugs | Built-in |
| Ruby | RuboCop | RuboCop | Sorbet |

**Tool configs:** See [references/tools.md](references/tools.md)

## Code Review Guidelines

### PR Best Practices
```
✓ Small PRs (200-400 LOC)
✓ Single purpose per PR
✓ Clear description
✓ Self-reviewed before requesting
```

### Feedback Levels
```
🚫 BLOCKER: Must fix (security, bugs, broken)
⚠️ WARNING: Should fix (smells, performance)
💡 SUGGESTION: Nice to have (style, alternatives)
❓ QUESTION: Need clarification
✨ PRAISE: Acknowledge good work
```

**Review process:** See [references/review.md](references/review.md)

## Reference Files

| File | Content |
|------|---------|
| [references/naming.md](references/naming.md) | Naming conventions by language and element type |
| [references/patterns.md](references/patterns.md) | SOLID, clean code patterns, refactoring |
| [references/security.md](references/security.md) | OWASP 2025, secure coding practices |
| [references/testing.md](references/testing.md) | Testing strategies, patterns, best practices |
| [references/review.md](references/review.md) | Code review process and checklists |
| [references/error-handling.md](references/error-handling.md) | Error handling and logging |
| [references/tools.md](references/tools.md) | Linting, formatting, static analysis setup |
