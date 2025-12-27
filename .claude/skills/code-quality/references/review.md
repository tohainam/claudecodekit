# Code Review Guidelines

Best practices for effective, constructive code reviews.

## Review Goals

```
Primary Goals:
├── Find defects (bugs, security issues, logic errors)
├── Ensure code quality (readability, maintainability)
├── Share knowledge (spread expertise across team)
└── Verify requirements (does it solve the problem?)

NOT Goals:
├── Prove reviewer superiority
├── Enforce personal style preferences
├── Block progress indefinitely
└── Rewrite author's code
```

## Pull Request Guidelines

### Size Limits
| Size | LOC | Review Time | Recommendation |
|------|-----|-------------|----------------|
| XS | < 50 | 5-10 min | Ideal |
| S | 50-200 | 10-30 min | Good |
| M | 200-400 | 30-60 min | Acceptable |
| L | 400-800 | 1-2 hours | Split if possible |
| XL | > 800 | Too long | Must split |

### PR Structure
```markdown
## Description
[What does this PR do? Why?]

## Type of Change
- [ ] Bug fix (non-breaking change fixing an issue)
- [ ] New feature (non-breaking change adding functionality)
- [ ] Breaking change (fix or feature causing existing functionality to change)
- [ ] Refactoring (no functional changes)

## How to Test
1. [Step-by-step testing instructions]
2. [Expected outcomes]

## Checklist
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No new warnings
- [ ] Self-reviewed code
```

### Commit Organization
```
Good: Logical, atomic commits
├── feat: add user validation schema
├── feat: implement validation endpoint
├── test: add validation tests
└── docs: update API documentation

Bad: Messy history
├── WIP
├── fix stuff
├── more fixes
├── final fix (hopefully)
└── ok now it works
```

## Review Dimensions

### 1. Correctness
```
□ Does the code do what it's supposed to?
□ Are edge cases handled?
□ Is error handling appropriate?
□ Are there off-by-one errors?
□ Are race conditions possible?
□ Is data validated properly?
```

### 2. Security
```
□ Input validated/sanitized?
□ SQL injection prevented?
□ XSS prevented?
□ Sensitive data protected?
□ Authentication/authorization correct?
□ Secrets not hardcoded?
```

### 3. Performance
```
□ Obvious inefficiencies (N+1 queries)?
□ Appropriate data structures?
□ Memory leaks possible?
□ Unnecessary computations in loops?
□ Proper indexing for queries?
```

### 4. Readability
```
□ Clear naming conventions?
□ Appropriate comments (why, not what)?
□ Reasonable function/file length?
□ Consistent formatting?
□ Complex logic explained?
```

### 5. Maintainability
```
□ DRY principle followed?
□ Single responsibility?
□ Testable design?
□ Dependencies appropriate?
□ Configuration externalized?
```

### 6. Testing
```
□ Tests added for new code?
□ Tests cover edge cases?
□ Tests are readable?
□ Integration tests where needed?
□ No flaky tests introduced?
```

## Feedback Classification

### Severity Levels
```
🚫 BLOCKER: Must fix before merge
   Security vulnerabilities, data loss risk, broken functionality

⚠️ WARNING: Should fix, but can discuss
   Performance issues, code smells, missing tests

💡 SUGGESTION: Nice to have, author decides
   Style preferences, alternative approaches

❓ QUESTION: Need clarification
   Understanding intent, learning opportunity

✨ PRAISE: Acknowledge good work
   Clever solutions, clean code, good patterns
```

### Comment Format
```markdown
// Good: Specific, actionable, explains why
🚫 **Security:** This query is vulnerable to SQL injection.
Use parameterized queries:
```sql
SELECT * FROM users WHERE id = ?
```

// Bad: Vague, unhelpful
This is wrong. Fix it.

// Good: Suggests alternative
💡 **Suggestion:** Consider using `Array.find()` here for better readability:
```javascript
const user = users.find(u => u.id === targetId);
```

// Good: Question for understanding
❓ What happens if `data` is null here? Should we add a guard clause?
```

## Reviewer Checklist

```
BEFORE REVIEWING
□ Understand the context (PR description, linked issue)
□ Check out branch and run locally if complex
□ Allocate focused time (no distractions)

DURING REVIEW
□ Start with high-level structure, then details
□ Check tests first (understand expected behavior)
□ Use severity labels consistently
□ Provide specific, actionable feedback
□ Include code examples for suggestions
□ Ask questions instead of assuming

AFTER REVIEWING
□ Summarize overall impression
□ Distinguish blockers from suggestions
□ Approve if ready, request changes if not
□ Be responsive to author's questions
```

## Author Checklist

```
BEFORE REQUESTING REVIEW
□ Self-review the diff (fresh eyes)
□ Run all tests locally
□ Run linters/formatters
□ Update documentation if needed
□ Write clear PR description
□ Keep PR focused and small

DURING REVIEW
□ Respond to all comments
□ Don't take feedback personally
□ Ask for clarification if needed
□ Explain decisions, but stay open to change
□ Thank reviewers for their time

AFTER APPROVAL
□ Squash commits if needed
□ Ensure CI passes
□ Merge promptly (don't let it go stale)
```

## Communication Tips

### Effective Phrasing
```
Instead of:                     Try:
"This is wrong"            →    "This might cause X because..."
"Why did you..."           →    "I'm curious about the reasoning for..."
"You should..."            →    "Consider..." or "What do you think about..."
"This is bad practice"     →    "This pattern can lead to X. Here's an alternative..."
"Obvious mistake"          →    "Easy to miss, but..."
```

### Handling Disagreements
```
1. Assume good intent
2. Focus on code, not person
3. Cite documentation or standards
4. Propose concrete alternatives
5. Know when to escalate or move on
6. Use synchronous communication for complex discussions
```

## Review Metrics

| Metric | Target | Warning Sign |
|--------|--------|--------------|
| Time to First Review | < 4 hours | > 24 hours |
| Review Iterations | 1-3 rounds | > 5 rounds |
| PR Lifetime | < 2 days | > 1 week |
| Review Size | 200-400 LOC | > 800 LOC |
| Comments Addressed | 100% | Ignored comments |

## Anti-Patterns

| Anti-Pattern | Problem | Solution |
|--------------|---------|----------|
| **Nitpicking** | Focus on trivial issues | Use linters, focus on important issues |
| **Rubber stamping** | Approving without reading | Allocate proper review time |
| **Ego battles** | Personal preferences override standards | Establish team guidelines |
| **Review hoarding** | One person reviews everything | Distribute review responsibility |
| **Stale PRs** | PRs open for weeks | Set review SLAs, smaller PRs |
| **Drive-by reviews** | Comments without follow-up | Complete the review cycle |
