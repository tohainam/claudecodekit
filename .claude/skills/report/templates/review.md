# Code Review Report Template

Use for code review results from reviewer agent.

---

```markdown
# Code Review Report

**Reviewed**: {files hoặc git range}
**Date**: {timestamp từ `date +"%Y-%m-%d %H:%M"`}
**Verdict**: Approved | Needs Changes

---

## Summary

[2-3 câu assessment tổng quan]

---

## Critical Issues

> Must fix before merge

### Issue 1: {Title}

- **Severity**: Critical
- **File**: `path/file.ts:42`
- **Problem**: [Clear description]
- **Risk**: [What could go wrong]
- **Fix**:

```{language}
// Current (VULNERABLE/BROKEN)
[problematic code]

// Suggested (SAFE/FIXED)
[fixed code]
```

---

## Warnings

> Should fix

### Warning 1: {Title}

- **Severity**: Warning
- **File**: `path/file.ts:78`
- **Problem**: [Description]
- **Suggestion**: [Improvement]

---

## Suggestions

> Optional improvements

- `file.ts:92` - [Description]
- `file.ts:105` - [Description]

---

## Security Assessment

- [ ] No exposed credentials
- [ ] Input validation: Pass | Fail | N/A
- [ ] Authorization checks: Pass | Fail | N/A
- [ ] SQL injection prevention: Pass | Fail | N/A
- [ ] XSS prevention: Pass | Fail | N/A

---

## Test Coverage

[Comments on test adequacy]

---

## Final Verdict

**Verdict**: {Approved | Needs Changes}
**Reasoning**: [Clear explanation]
**Blocking Issues**: {count} Critical, {count} Warnings
```
