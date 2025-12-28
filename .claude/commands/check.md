---
description: Run lint, typecheck, and tests
allowed-tools: Bash, Read, Glob
argument-hint: [scope: all|lint|types|test]
---

# Run Quality Checks

Run code quality checks: linting, type checking, and tests.

## Input
Scope (optional): $ARGUMENTS

Scope options:
- `all` (default): Run everything
- `lint`: Only linting
- `types`: Only type checking
- `test`: Only tests

## Project Detection

First, detect the project type and available scripts:

- Package.json scripts: !`cat package.json 2>/dev/null | grep -A 30 '"scripts"'`
- Makefile targets: !`grep -E '^[a-zA-Z_-]+:' Makefile 2>/dev/null | head -10`
- Python setup: !`ls pyproject.toml setup.py requirements.txt 2>/dev/null`

## Check Commands by Project Type

### Node.js / TypeScript
```bash
# Lint
npm run lint || npx eslint .

# Type check (TypeScript)
npm run typecheck || npx tsc --noEmit

# Tests
npm test || npm run test
```

### Python
```bash
# Lint
ruff check . || flake8 . || pylint .

# Type check
mypy . || pyright .

# Tests
pytest || python -m pytest
```

### Go
```bash
# Lint
golangci-lint run

# Type check (built into go build)
go build ./...

# Tests
go test ./...
```

### Rust
```bash
# Lint
cargo clippy

# Type check (built into cargo check)
cargo check

# Tests
cargo test
```

## Process

### Run All Checks (default)
```bash
# Example for Node.js project
npm run lint && npm run typecheck && npm test
```

### Handle Failures
For each check that fails:
1. Show the error output
2. Identify failing files/tests
3. Summarize issues found

## Output Format

```
# Check Results

## Lint
✅ Passed (or ❌ X issues found)
[Details if failed]

## Type Check
✅ Passed (or ❌ X errors found)
[Details if failed]

## Tests
✅ X passed, 0 failed (or ❌ X failed)
[Details if failed]

## Summary
- Total checks: 3
- Passed: X
- Failed: X
```

## Quick Commands

Based on detected project:

- **Fix lint issues**: `npm run lint -- --fix` or `ruff check --fix .`
- **Run specific test**: `npm test -- --grep "pattern"` or `pytest -k "pattern"`
- **Watch mode**: `npm run test -- --watch` or `pytest --watch`

## Exit Behavior

- If all checks pass: Report success
- If any check fails: Report failures with actionable information
- Never try to auto-fix unless explicitly asked
