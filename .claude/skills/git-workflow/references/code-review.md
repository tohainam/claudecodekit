# Code Review

## Review Principles

### Goals of Code Review

1. **Catch bugs** before they reach production
2. **Ensure quality** and maintainability
3. **Share knowledge** across the team
4. **Enforce standards** consistently
5. **Mentor** less experienced developers

### Review Mindset

| Approach          | Description                                        |
| ----------------- | -------------------------------------------------- |
| **Collaborative** | "How can we make this better?" not "What's wrong?" |
| **Educational**   | Explain reasoning, share knowledge                 |
| **Respectful**    | Critique code, not people                          |
| **Timely**        | Review within 24 hours                             |
| **Thorough**      | Don't rubber-stamp                                 |

## Review Focus Areas

### Priority Order

1. **Security** - Vulnerabilities, data exposure
2. **Correctness** - Does it work? Edge cases?
3. **Performance** - Obvious inefficiencies
4. **Architecture** - Design, patterns, structure
5. **Style** - Naming, formatting (automate this)

### Security Checklist

```markdown
- [ ] No hardcoded secrets
- [ ] Input validation present
- [ ] Output encoding for context
- [ ] No SQL injection vulnerabilities
- [ ] No XSS vulnerabilities
- [ ] Authentication/authorization correct
- [ ] Sensitive data handled properly
- [ ] Dependencies are secure
```

### Correctness Checklist

```markdown
- [ ] Logic is correct
- [ ] Edge cases handled
- [ ] Error handling appropriate
- [ ] Null/undefined checks
- [ ] Concurrency issues addressed
- [ ] Tests cover new code
- [ ] Tests cover edge cases
```

### Architecture Checklist

```markdown
- [ ] Appropriate abstraction level
- [ ] Single responsibility
- [ ] No unnecessary complexity
- [ ] Follows existing patterns
- [ ] Changes are backward compatible
- [ ] No circular dependencies
```

## Providing Feedback

### Comment Types

```markdown
# Blocking (must fix)

🔴 **Security**: This SQL query is vulnerable to injection.
Use parameterized queries instead.

# Suggestion (should consider)

🟡 **Suggestion**: Consider extracting this into a separate
function for better testability.

# Nitpick (optional)

🟢 **Nit**: Variable name could be more descriptive.
`data` → `userPreferences`

# Question (clarification)

❓ **Question**: What's the expected behavior when
the user has no permissions?

# Praise (positive feedback)

👍 **Nice**: Clean implementation of the caching logic!
```

### Feedback Format

```markdown
# Good feedback structure

[What]: Describe what you're commenting on
[Why]: Explain why it's a concern
[How]: Suggest an improvement

# Example

"This function has 5 parameters (What). Functions with many
parameters are hard to test and maintain (Why). Consider
using an options object instead (How)."

// Before
function createUser(name, email, role, active, permissions)

// Suggested
function createUser(options: CreateUserOptions)
```

### Tone Guidelines

| Instead of                | Say                                       |
| ------------------------- | ----------------------------------------- |
| "This is wrong"           | "I think there might be an issue with..." |
| "Why did you do this?"    | "What was the reasoning behind...?"       |
| "You should..."           | "Consider..." or "What about...?"         |
| "This doesn't make sense" | "I'm having trouble understanding..."     |

## Receiving Feedback

### Best Practices

1. **Don't take it personally** - Review is about code
2. **Assume good intent** - Reviewers want to help
3. **Ask for clarification** - If feedback is unclear
4. **Explain your reasoning** - But be open to change
5. **Thank reviewers** - They're investing time

### Responding to Comments

```markdown
# Acknowledge and fix

"Good catch! Fixed in abc1234."

# Explain reasoning

"I used this approach because [reason]. What do you think?"

# Disagree respectfully

"I see your point, but I think [alternative] because [reason].
Would you be open to keeping it as-is?"

# Ask for help

"I'm not sure how to address this. Could you suggest an approach?"
```

## Review Efficiency

### Optimal Review Settings

| Metric      | Optimal       | Notes                         |
| ----------- | ------------- | ----------------------------- |
| PR size     | 200-400 lines | Larger = lower quality review |
| Review time | 30-60 min     | Take breaks for longer        |
| Reviewers   | 2             | More ≠ better                 |
| Turnaround  | < 24 hours    | Block on critical             |

### Two-Reviewer Strategy

```
Author ──► Reviewer 1 (Primary) ──► Reviewer 2 (Secondary)
              │                          │
         Deep review               Sanity check
         Architecture              Security
         Correctness               Edge cases
```

### Review Batching

```
Not ideal:     Review as they come (context switching)
Better:        Review at set times (2x daily)
Best:          Review in batches by domain
```

## Automated Checks

### What to Automate

| Check             | Tool                          |
| ----------------- | ----------------------------- |
| Code formatting   | Prettier, Black, gofmt        |
| Linting           | ESLint, Pylint, golangci-lint |
| Type checking     | TypeScript, mypy              |
| Security scanning | Snyk, npm audit               |
| Test coverage     | Jest, pytest-cov              |
| Commit messages   | commitlint                    |

### PR Status Checks

```yaml
# .github/workflows/pr.yml
name: PR Checks

on: pull_request

jobs:
  checks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Lint
        run: npm run lint

      - name: Type Check
        run: npm run typecheck

      - name: Test
        run: npm test -- --coverage

      - name: Security
        run: npm audit --audit-level=high
```

### Required Status Checks

```yaml
# Branch protection settings
required_status_checks:
  strict: true # Require up-to-date before merge
  contexts:
    - "lint"
    - "test"
    - "security"
required_pull_request_reviews:
  required_approving_review_count: 1
  dismiss_stale_reviews: true
```

## Review Templates

### Quick Review (< 100 lines)

```markdown
## Quick Review ✓

- [x] Changes look correct
- [x] No security concerns
- [x] Tests adequate

Approved! 🚀
```

### Standard Review

```markdown
## Review Summary

### Security

- [x] No vulnerabilities identified

### Correctness

- [x] Logic verified
- [x] Edge cases handled

### Code Quality

- [x] Readable and maintainable
- [x] Follows patterns

### Suggestions

- Consider adding error handling for [case]

### Nice Work

- Clean implementation of [feature]

**Status**: Approved ✓
```

### Comprehensive Review

```markdown
## Comprehensive Review

### Overview

Brief summary of changes and overall impression.

### Security Analysis

- Authentication: ✓
- Authorization: ✓
- Input validation: ⚠️ See comment on line 45
- Data handling: ✓

### Correctness

| Scenario    | Status |
| ----------- | ------ |
| Happy path  | ✓      |
| Error cases | ✓      |
| Edge cases  | ⚠️     |

### Architecture

- Design patterns: ✓
- Abstraction level: ✓
- Testability: ✓

### Performance

- No obvious issues
- Consider: [suggestion]

### Required Changes

1. Fix input validation on line 45
2. Add test for edge case X

### Suggestions (optional)

1. Extract method for readability
2. Consider caching here

**Status**: Request Changes
```

## Anti-Patterns

### What NOT to Do

| Anti-Pattern      | Problem                     |
| ----------------- | --------------------------- |
| Rubber-stamping   | Misses bugs, no value       |
| Nitpicking only   | Misses important issues     |
| Blocking on style | Waste of time (automate it) |
| Delayed reviews   | Blocks development          |
| Aggressive tone   | Damages relationships       |
| Perfectionism     | Delays shipping             |

### Signs of Poor Review Culture

- PRs sit unreviewed for days
- Reviews have only style comments
- Authors fear submitting PRs
- Same bugs keep appearing
- "LGTM" without actual review
