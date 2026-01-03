# Gemini CLI Examples

Practical examples for automation and scripting.

## Table of Contents

- [Setup](#setup)
- [Code Review](#code-review)
- [Image Analysis](#image-analysis)
- [Documentation](#documentation)
- [Git Operations](#git-operations)
- [Log Analysis](#log-analysis)
- [Test Generation](#test-generation)
- [Batch Processing](#batch-processing)
- [CI/CD Integration](#cicd-integration)
- [Quick Reference](#quick-reference)

---

## Setup

### Shell Helper Function

Add to `~/.bashrc` or `~/.zshrc`:

```bash
gemi() {
  gemini -p "$@" --output-format json | node -p "
    const j=JSON.parse(require('fs').readFileSync(0,'utf8'));
    if(j.error){console.error(j.error.message);process.exit(1)}
    j.response
  "
}
```

Usage: `gemi "your prompt here"`

### Standard Pattern

All examples use this cross-platform Node.js pattern:

```bash
gemini -p "..." --output-format json | node -p "JSON.parse(require('fs').readFileSync(0,'utf8')).response"
```

---

## Code Review

### Staged Changes

```bash
git diff --staged | gemini -p "Review for:
1. Security vulnerabilities
2. Performance issues
3. Code quality" --output-format json | node -p "JSON.parse(require('fs').readFileSync(0,'utf8')).response"
```

### Pull Request

```bash
git diff origin/main...HEAD | gemini -p "Review PR:
- Breaking changes
- Issues
- Improvements" --output-format json | node -p "JSON.parse(require('fs').readFileSync(0,'utf8')).response"
```

### Specific File

```bash
cat src/api/users.ts | gemini -p "Review:
- Error handling
- Input validation
- Best practices" --output-format json | node -p "JSON.parse(require('fs').readFileSync(0,'utf8')).response"
```

### Security Audit

```bash
cat src/auth/*.ts | gemini -p "Security audit:
- SQL injection
- XSS
- Auth flaws" --output-format json | node -p "JSON.parse(require('fs').readFileSync(0,'utf8')).response"
```

---

## Image Analysis

> **Note**: For images, use interactive mode with `@` syntax or base64 encoding.

### Interactive Mode (Recommended)

```bash
gemini
> @screenshot.png Extract all text from this image
> @diagram.png Analyze architecture components
```

### Extract Text (OCR)

```bash
# Interactive
gemini -i "Extract text from @./screenshot.png"
```

### Architecture Diagram

```bash
gemini -i "Analyze @./system-design.png:
- Components
- Data flow
- Bottlenecks"
```

### Error Screenshot

```bash
gemini -i "Analyze error @./error.png:
- What error?
- Cause?
- Fix?"
```

---

## Documentation

### Generate JSDoc

```bash
cat src/utils.ts | gemini -p "Generate JSDoc comments" --output-format json | node -p "JSON.parse(require('fs').readFileSync(0,'utf8')).response"
```

### README

```bash
cat src/lib/auth/*.ts | gemini -p "Generate README:
- Overview
- Usage
- API reference" --output-format json | node -p "JSON.parse(require('fs').readFileSync(0,'utf8')).response"
```

### API Documentation

```bash
cat src/routes/users.ts | gemini -p "Document API:
- Description
- Request/response
- Errors" --output-format json | node -p "JSON.parse(require('fs').readFileSync(0,'utf8')).response"
```

### Explain Code

```bash
cat src/algorithms/pathfinding.ts | gemini -p "Explain for new developers" --output-format json | node -p "JSON.parse(require('fs').readFileSync(0,'utf8')).response"
```

---

## Git Operations

### Commit Message

```bash
git diff --cached | gemini -p "Write conventional commit message.
Format: type(scope): description
Types: feat, fix, docs, refactor, test, chore" --output-format json | node -p "JSON.parse(require('fs').readFileSync(0,'utf8')).response"
```

### PR Description

```bash
git log origin/main..HEAD --oneline | gemini -p "Write PR description:
## Summary
## Changes
## Testing" --output-format json | node -p "JSON.parse(require('fs').readFileSync(0,'utf8')).response"
```

### Release Notes

```bash
git log v1.0.0..HEAD --oneline | gemini -p "Write release notes:
- Features
- Bug Fixes
- Breaking Changes" --output-format json | node -p "JSON.parse(require('fs').readFileSync(0,'utf8')).response"
```

### Commit Analysis

```bash
git log --oneline -20 | gemini -p "Summarize recent activity" --output-format json | node -p "JSON.parse(require('fs').readFileSync(0,'utf8')).response"
```

---

## Log Analysis

### Error Logs

```bash
tail -100 /var/log/app.log | grep -i error | gemini -p "Categorize, find root causes, suggest fixes" --output-format json | node -p "JSON.parse(require('fs').readFileSync(0,'utf8')).response"
```

### Stack Trace

```bash
cat stacktrace.txt | gemini -p "Analyze:
- Cause?
- File/line?
- Fix?" --output-format json | node -p "JSON.parse(require('fs').readFileSync(0,'utf8')).response"
```

### Incident Summary

```bash
cat incident.log | gemini -p "Incident summary:
- Timeline
- Impact
- Root cause
- Resolution" --output-format json | node -p "JSON.parse(require('fs').readFileSync(0,'utf8')).response"
```

---

## Test Generation

### Unit Tests

```bash
cat src/utils/validation.ts | gemini -p "Generate Vitest tests:
- Edge cases
- Error scenarios" --output-format json | node -p "JSON.parse(require('fs').readFileSync(0,'utf8')).response"
```

### Integration Tests

```bash
cat src/api/users.ts | gemini -p "Generate integration tests:
- CRUD operations
- Error handling" --output-format json | node -p "JSON.parse(require('fs').readFileSync(0,'utf8')).response"
```

### Test Cases from Requirements

```bash
cat requirements.md | gemini -p "Generate test cases:
- Positive/negative cases
- Priority" --output-format json | node -p "JSON.parse(require('fs').readFileSync(0,'utf8')).response"
```

---

## Batch Processing

### Multiple Files

```bash
for file in src/**/*.ts; do
  echo "=== $file ==="
  cat "$file" | gemini -p "Quick review" --output-format json | node -p "JSON.parse(require('fs').readFileSync(0,'utf8')).response"
done
```

### Save Reports

```bash
for file in src/**/*.ts; do
  cat "$file" | gemini -p "Analyze" --output-format json | node -p "JSON.parse(require('fs').readFileSync(0,'utf8')).response" > "reports/$(basename "$file").md"
done
```

### Parallel Processing

```bash
find src -name "*.ts" | xargs -P 4 -I {} bash -c '
  cat "$1" | gemini -p "Lint" --output-format json | node -p "JSON.parse(require(\"fs\").readFileSync(0,\"utf8\")).response" > "lint-$(basename "$1").txt"
' -- {}
```

---

## CI/CD Integration

### GitHub Actions

```yaml
name: AI Review
on: [pull_request]

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
      - name: Install Gemini CLI
        run: npm install -g @google/gemini-cli
      - name: Review
        run: |
          git diff origin/main...HEAD | \
            gemini -p "Review for bugs and security" --output-format json | \
            node -p "JSON.parse(require('fs').readFileSync(0,'utf8')).response" > review.md
        env:
          GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
```

### Official GitHub Action

```yaml
- uses: google-github-actions/run-gemini-cli@v0
  with:
    gemini_api_key: ${{ secrets.GEMINI_API_KEY }}
    prompt: Review this PR
```

### Pre-commit Hook

```bash
#!/bin/bash
# .git/hooks/pre-commit

if [ -n "$(git diff --cached --name-only)" ]; then
  result=$(git diff --cached | gemini -p "Quick check. Reply OK or list issues." --output-format json | node -p "JSON.parse(require('fs').readFileSync(0,'utf8')).response")
  echo "$result"
  if [[ "$result" != *"OK"* ]]; then
    echo "Issues found. Commit blocked."
    exit 1
  fi
fi
```

---

## Quick Reference

### One-Liners (with gemi helper)

```bash
# Code review
git diff | gemi "Review"

# Commit message
git diff --cached | gemi "Write commit"

# Explain code
cat complex.ts | gemi "Explain"

# Generate tests
cat utils.ts | gemi "Write tests"

# Analyze logs
tail -50 app.log | gemi "Summarize errors"

# Security check
cat src/auth/*.ts | gemi "Security audit"
```

### Batch (with gemi helper)

```bash
# Review all files
for f in src/*.ts; do cat "$f" | gemi "Review"; done

# Generate docs
for d in src/*/; do cat "$d"*.ts | gemi "Document" > "docs/$(basename "$d").md"; done
```

### Safe Mode

```bash
gemini -s -p "Analyze without modifications" --output-format json | node -p "JSON.parse(require('fs').readFileSync(0,'utf8')).response"
```

### Sessions

```bash
gemini                    # Start interactive
gemini --resume           # Resume last
gemini --list-sessions    # List all
```

---

## Platform Support

| Platform | Shell      | Notes               |
| -------- | ---------- | ------------------- |
| macOS    | bash/zsh   | Native              |
| Linux    | bash/zsh   | Native              |
| Windows  | PowerShell | Use `node` directly |
| Windows  | Git Bash   | Full support        |
| Windows  | WSL        | Full support        |
