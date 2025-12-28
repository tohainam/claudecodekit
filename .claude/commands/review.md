---
description: Review code changes for quality, security, and best practices
allowed-tools: Task, Read, Glob, Grep, Bash
argument-hint: [file-path or PR-number]
---

# Code Review

You are performing a comprehensive code review.

## Input
Review scope: $ARGUMENTS

Scope can be:
- No args: Review uncommitted changes (`git diff`)
- File path: Review specific file
- PR number: Review pull request
- Directory: Review all files in directory

## Process

Use the **code-reviewer** agent to perform the review:

```
Task: Launch code-reviewer agent
Prompt: "Perform a comprehensive code review for: $ARGUMENTS

If no scope specified, run 'git diff' to review uncommitted changes.

Review Dimensions:

1. CODE QUALITY
   - Readability and clarity
   - Naming conventions
   - Code structure
   - Design patterns
   - DRY principle adherence

2. SECURITY
   - Input validation
   - Authentication/Authorization
   - Sensitive data handling
   - OWASP top 10 vulnerabilities
   - Injection risks

3. PERFORMANCE
   - Obvious inefficiencies
   - N+1 query patterns
   - Memory leaks
   - Unnecessary computations

4. TESTING
   - Test coverage adequate?
   - Edge cases covered?
   - Test quality

5. MAINTAINABILITY
   - Documentation
   - Complexity
   - Technical debt
   - Future extensibility

Output Format:
# Code Review Report

## Summary
[Overall assessment - Approved/Changes Requested]

## ✅ Strengths
- [Good things about the code]

## 🚫 Critical Issues (Must Fix)
- [File:Line] Issue description
  Suggestion: How to fix

## ⚠️ Warnings (Should Fix)
- [File:Line] Issue description
  Suggestion: How to fix

## 💡 Suggestions (Consider)
- [File:Line] Suggestion
  Reason: Why this would be better

## Test Coverage
- [Assessment of test coverage]

## Security Notes
- [Any security considerations]"

Subagent: code-reviewer
```

## Severity Levels

- **🚫 Critical**: Must fix before merge (security issues, bugs, breaking changes)
- **⚠️ Warning**: Should fix (code quality, potential issues)
- **💡 Suggestion**: Nice to have (improvements, style)

## Output

The review report will include:
- Overall verdict (Approved / Changes Requested)
- Issues by severity
- Specific file:line references
- Actionable suggestions

## Follow-up

After review:
- If approved: Proceed to commit/PR
- If changes requested: Fix issues and re-review
