# Pull Request Guidelines

## Table of Contents
1. [PR Size Guidelines](#pr-size-guidelines)
2. [PR Title Format](#pr-title-format)
3. [PR Description Template](#pr-description-template)
4. [Review Focus Areas](#review-focus-areas)
5. [Review Etiquette](#review-etiquette)
6. [CODEOWNERS Setup](#codeowners-setup)

---

## PR Size Guidelines

### Ideal PR Size
| Metric | Ideal | Acceptable | Needs Split |
|--------|-------|------------|-------------|
| Lines changed | < 200 | 200-400 | > 400 |
| Files changed | < 10 | 10-20 | > 20 |
| Review time | < 15 min | 15-30 min | > 30 min |

### Why Small PRs Matter
- **Faster reviews**: Reviewers stay focused
- **Fewer bugs**: Easier to spot issues
- **Quicker merges**: Less conflict potential
- **Better history**: Atomic, reversible changes

### Splitting Large PRs

**Strategy 1: By Layer**
```
PR 1: Database migrations and models
PR 2: Backend API endpoints
PR 3: Frontend components
PR 4: Integration and tests
```

**Strategy 2: By Feature Slice**
```
PR 1: User can view profile (read-only)
PR 2: User can edit profile
PR 3: User can upload avatar
```

**Strategy 3: By Risk**
```
PR 1: Low-risk infrastructure changes
PR 2: Core logic changes (needs careful review)
PR 3: UI polish and cleanup
```

---

## PR Title Format

### Format
```
<type>(<scope>): <description>
```

### Examples
```
feat(auth): add OAuth2 login support
fix(api): handle null response in user endpoint
docs(readme): update installation instructions
refactor(utils): extract date formatting helpers
test(auth): add integration tests for login flow
```

### Rules
- Use conventional commit format
- Keep under 72 characters
- Use imperative mood
- Be specific and descriptive

---

## PR Description Template

### Standard Template
```markdown
## Summary
<!-- Brief description of changes (1-3 sentences) -->

## Changes
<!-- Bullet list of specific changes -->
-
-
-

## Type of Change
<!-- Check applicable boxes -->
- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to change)
- [ ] Refactoring (no functional changes)
- [ ] Documentation update
- [ ] Test update

## Testing
<!-- How was this tested? -->
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing performed

## Screenshots
<!-- If applicable, add screenshots -->

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests pass locally

## Related Issues
<!-- Link related issues -->
Closes #
Related to #
```

### Minimal Template (Small PRs)
```markdown
## Summary
<1-2 sentences>

## Test Plan
<How to verify>

Closes #<issue>
```

### Bug Fix Template
```markdown
## Problem
<!-- What was the bug? -->

## Root Cause
<!-- Why did it happen? -->

## Solution
<!-- How was it fixed? -->

## Testing
- [ ] Added regression test
- [ ] Verified fix locally
- [ ] Tested edge cases

Closes #<issue>
```

### Feature Template
```markdown
## Summary
<!-- What does this feature do? -->

## Motivation
<!-- Why is this needed? -->

## Implementation
<!-- Technical approach -->

## Screenshots/Demo
<!-- Visual evidence -->

## Testing
- [ ] Unit tests
- [ ] Integration tests
- [ ] Manual QA

## Documentation
- [ ] README updated
- [ ] API docs updated
- [ ] Changelog entry

Related to #<issue>
```

---

## Review Focus Areas

### 1. Functionality
- [ ] Code behaves as intended
- [ ] Edge cases handled
- [ ] Error handling appropriate
- [ ] User experience considered

### 2. Design
- [ ] Fits existing architecture
- [ ] Follows project patterns
- [ ] Appropriate abstraction level
- [ ] No unnecessary complexity

### 3. Code Quality
- [ ] Readable and maintainable
- [ ] Meaningful names
- [ ] DRY principles followed
- [ ] No dead code

### 4. Security
- [ ] Input validated
- [ ] No sensitive data exposed
- [ ] Authentication/authorization correct
- [ ] No injection vulnerabilities

### 5. Performance
- [ ] No obvious inefficiencies
- [ ] Database queries optimized
- [ ] No memory leaks
- [ ] Appropriate caching

### 6. Testing
- [ ] Tests exist and pass
- [ ] Coverage adequate
- [ ] Test cases meaningful
- [ ] Edge cases covered

---

## Review Etiquette

### For Authors

**Before Submitting:**
- Self-review your changes
- Run all tests locally
- Update documentation
- Check for typos and formatting
- Add context in description

**During Review:**
- Respond to all comments
- Be open to feedback
- Explain decisions clearly
- Update promptly

### For Reviewers

**Comment Types:**
```
[blocking] Must be fixed before merge
[suggestion] Consider this improvement
[question] Need clarification
[nitpick] Minor style preference
[praise] Good work! (important for morale)
```

**Good Review Comments:**
```
// Good - specific and actionable
[blocking] This query will cause N+1. Consider using .includes(:posts)

// Good - suggests alternative
[suggestion] Instead of nested ifs, consider early return pattern:
if (!user) return null;
if (!user.isActive) return null;
return user.profile;

// Good - asks for context
[question] What happens if the API returns 429? Should we add retry logic?
```

**Bad Review Comments:**
```
// Bad - vague
This looks wrong.

// Bad - no explanation
Don't do this.

// Bad - subjective without reasoning
I don't like this approach.
```

### Response Time Guidelines
| PR Type | Initial Review | Follow-up |
|---------|----------------|-----------|
| Hotfix | < 2 hours | < 1 hour |
| Regular | < 24 hours | < 4 hours |
| Large/Complex | < 48 hours | < 8 hours |

---

## CODEOWNERS Setup

### File: `.github/CODEOWNERS`

### Format
```
# Syntax: <pattern> <owners>
# Owners can be @username, @org/team, or email

# Default owner for everything
* @default-team

# Frontend
/src/components/ @frontend-team
/src/styles/ @frontend-team @design-team
*.tsx @frontend-team
*.css @frontend-team

# Backend
/src/api/ @backend-team
/src/services/ @backend-team
/src/models/ @backend-team @dba-team

# DevOps
/infrastructure/ @devops-team
/.github/ @devops-team
Dockerfile @devops-team
*.yml @devops-team

# Documentation
/docs/ @docs-team
*.md @docs-team

# Security-sensitive files
/src/auth/ @security-team @backend-team
/src/crypto/ @security-team

# Database
/migrations/ @dba-team
/schema/ @dba-team

# Config files need broad review
*.config.js @tech-leads
```

### Branch Protection Rules

**Recommended Settings:**
```yaml
main:
  required_reviews: 2
  require_codeowner_approval: true
  require_status_checks: true
  require_branches_up_to_date: true
  include_administrators: false

develop:
  required_reviews: 1
  require_status_checks: true
```

---

## PR Workflow Summary

```
1. Create Branch
   └── git checkout -b feature/description

2. Make Changes
   ├── Write code
   ├── Add tests
   └── Update docs

3. Self-Review
   ├── Run linter
   ├── Run tests
   └── Review diff

4. Open PR
   ├── Use template
   ├── Add reviewers
   └── Link issues

5. Address Feedback
   ├── Respond to comments
   ├── Push updates
   └── Re-request review

6. Merge
   ├── Squash (feature) or Merge (release)
   ├── Delete branch
   └── Celebrate!
```
