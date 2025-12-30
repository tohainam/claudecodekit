# Gemini CLI Examples

Practical examples for common automation use cases.

## Table of Contents

- [Code Review](#code-review)
- [Image Analysis & OCR](#image-analysis--ocr)
- [Documentation Generation](#documentation-generation)
- [Git Operations](#git-operations)
- [Log & Error Analysis](#log--error-analysis)
- [Test Generation](#test-generation)
- [Batch Processing](#batch-processing)
- [CI/CD Integration](#cicd-integration)
- [Quick Reference](#quick-reference)
- [Multi-turn Workflows](#multi-turn-workflows)

---

## Setup

### Recommended: Shell Helper Function

Add to `~/.bashrc` or `~/.zshrc` for cleaner commands:

```bash
# Cross-platform Gemini wrapper (works on macOS, Linux, Windows)
gemi() {
  gemini "$@" -o json 2>&1 | node -p "
    const d=require('fs').readFileSync(0,'utf8');
    const j=JSON.parse(d.slice(d.indexOf('{')));
    if(j.error){console.error('Error:',j.error.message);process.exit(1)}
    j.response
  "
}
```

Then use `gemi "prompt"` instead of the full command.

### Direct Pattern (No Setup)

All examples use this Node.js pattern to extract JSON (works on macOS, Linux, Windows):

```bash
gemini "..." -o json 2>&1 | node -p "JSON.parse(require('fs').readFileSync(0,'utf8').replace(/^[^{]*/s,'')).response"
```

---

## Code Review

### Staged Changes
```bash
git diff --staged | gemini "Review for:
1. Security vulnerabilities
2. Performance issues
3. Code quality
4. Bugs" -o json 2>&1 | node -p "JSON.parse(require('fs').readFileSync(0,'utf8').replace(/^[^{]*/s,'')).response"
```

### Pull Request
```bash
git diff origin/main...HEAD | gemini "Review PR:
- Breaking changes
- Issues
- Improvements" -o json 2>&1 | node -p "JSON.parse(require('fs').readFileSync(0,'utf8').replace(/^[^{]*/s,'')).response"
```

### Security Audit
```bash
gemini "Security audit @./src/auth/:
- SQL injection
- XSS
- Auth flaws" -o json 2>&1 | node -p "JSON.parse(require('fs').readFileSync(0,'utf8').replace(/^[^{]*/s,'')).response"
```

### Specific File
```bash
gemini "Review @./src/api/users.ts:
- Error handling
- Input validation
- Best practices" -o json 2>&1 | node -p "JSON.parse(require('fs').readFileSync(0,'utf8').replace(/^[^{]*/s,'')).response"
```

### Batch Review
```bash
for file in src/**/*.ts; do
  echo "=== $file ==="
  gemini "Quick review @./$file" -o json 2>&1 | node -p "JSON.parse(require('fs').readFileSync(0,'utf8').replace(/^[^{]*/s,'')).response"
done
```

---

## Image Analysis & OCR

### Extract Text
```bash
gemini "Extract text from @./screenshot.png" -o json 2>&1 | node -p "JSON.parse(require('fs').readFileSync(0,'utf8').replace(/^[^{]*/s,'')).response"
```

### Architecture Diagram
```bash
gemini "Analyze @./system-design.png:
- Components
- Data flow
- Bottlenecks" -o json 2>&1 | node -p "JSON.parse(require('fs').readFileSync(0,'utf8').replace(/^[^{]*/s,'')).response"
```

### Compare Screenshots
```bash
gemini "Compare changes:
Before: @./ui-before.png
After: @./ui-after.png" -o json 2>&1 | node -p "JSON.parse(require('fs').readFileSync(0,'utf8').replace(/^[^{]*/s,'')).response"
```

### Process Invoice
```bash
gemini "Extract from @./invoice.png:
- Vendor, Invoice #, Date
- Line items, Total
Output JSON" -o json 2>&1 | node -p "JSON.parse(require('fs').readFileSync(0,'utf8').replace(/^[^{]*/s,'')).response"
```

### Alt Text
```bash
gemini "Write alt-text for @./hero-image.jpg" -o json 2>&1 | node -p "JSON.parse(require('fs').readFileSync(0,'utf8').replace(/^[^{]*/s,'')).response"
```

### Error Screenshot
```bash
gemini "Analyze error @./error.png:
- What error?
- Cause?
- Fix?" -o json 2>&1 | node -p "JSON.parse(require('fs').readFileSync(0,'utf8').replace(/^[^{]*/s,'')).response"
```

---

## Documentation Generation

### JSDoc
```bash
gemini "Generate JSDoc for @./src/utils.ts" -o json 2>&1 | node -p "JSON.parse(require('fs').readFileSync(0,'utf8').replace(/^[^{]*/s,'')).response"
```

### README
```bash
gemini "Generate README for @./src/lib/auth/:
- Overview
- Usage
- API reference" -o json 2>&1 | node -p "JSON.parse(require('fs').readFileSync(0,'utf8').replace(/^[^{]*/s,'')).response"
```

### API Docs
```bash
gemini "Document @./src/routes/users.ts:
- Description
- Request/response
- Errors" -o json 2>&1 | node -p "JSON.parse(require('fs').readFileSync(0,'utf8').replace(/^[^{]*/s,'')).response"
```

### Explain Code
```bash
gemini "Explain @./src/algorithms/pathfinding.ts for new developers" \
  -o json 2>&1 | node -p "JSON.parse(require('fs').readFileSync(0,'utf8').replace(/^[^{]*/s,'')).response"
```

---

## Git Operations

### Commit Message
```bash
git diff --cached | gemini "Conventional commit message.
Format: type(scope): description
Types: feat, fix, docs, refactor, test, chore" -o json 2>&1 | node -p "JSON.parse(require('fs').readFileSync(0,'utf8').replace(/^[^{]*/s,'')).response"
```

### PR Description
```bash
git log origin/main..HEAD --oneline | gemini "PR description:
## Summary
## Changes
## Testing" -o json 2>&1 | node -p "JSON.parse(require('fs').readFileSync(0,'utf8').replace(/^[^{]*/s,'')).response"
```

### Release Notes
```bash
git log v1.0.0..HEAD --oneline | gemini "Release notes:
- Features
- Bug Fixes
- Breaking Changes" -o json 2>&1 | node -p "JSON.parse(require('fs').readFileSync(0,'utf8').replace(/^[^{]*/s,'')).response"
```

### Commit Analysis
```bash
git log --oneline -20 | gemini "Summarize recent activity" -o json 2>&1 | node -p "JSON.parse(require('fs').readFileSync(0,'utf8').replace(/^[^{]*/s,'')).response"
```

---

## Log & Error Analysis

### Error Logs
```bash
tail -100 /var/log/app.log | grep -i error | \
  gemini "Categorize, find root causes, suggest fixes" -o json 2>&1 | node -p "JSON.parse(require('fs').readFileSync(0,'utf8').replace(/^[^{]*/s,'')).response"
```

### Incident Summary
```bash
cat incident.log | gemini "Incident summary:
- Timeline
- Impact
- Root cause
- Resolution" -o json 2>&1 | node -p "JSON.parse(require('fs').readFileSync(0,'utf8').replace(/^[^{]*/s,'')).response"
```

### Stack Trace
```bash
cat stacktrace.txt | gemini "Analyze:
- Cause?
- File/line?
- Fix?" -o json 2>&1 | node -p "JSON.parse(require('fs').readFileSync(0,'utf8').replace(/^[^{]*/s,'')).response"
```

### Log Patterns
```bash
cat app.log | gemini "Find anomalies:
- Frequency spikes
- New errors
- Performance issues" -o json 2>&1 | node -p "JSON.parse(require('fs').readFileSync(0,'utf8').replace(/^[^{]*/s,'')).response"
```

---

## Test Generation

### Unit Tests
```bash
gemini "Generate Vitest tests for @./src/utils/validation.ts:
- Edge cases
- Error scenarios" -o json 2>&1 | node -p "JSON.parse(require('fs').readFileSync(0,'utf8').replace(/^[^{]*/s,'')).response"
```

### Integration Tests
```bash
gemini "Generate integration tests for @./src/api/users.ts:
- CRUD operations
- Error handling" -o json 2>&1 | node -p "JSON.parse(require('fs').readFileSync(0,'utf8').replace(/^[^{]*/s,'')).response"
```

### Test Cases
```bash
cat requirements.md | gemini "Generate test cases:
- Positive/negative cases
- Priority" -o json 2>&1 | node -p "JSON.parse(require('fs').readFileSync(0,'utf8').replace(/^[^{]*/s,'')).response"
```

---

## Batch Processing

### Multiple Files
```bash
# Note: Quote variables to handle filenames with spaces
for file in src/**/*.ts; do
  gemini "Analyze @./$file" -o json 2>&1 | node -p "JSON.parse(require('fs').readFileSync(0,'utf8').replace(/^[^{]*/s,'')).response" > "reports/$(basename "$file").md"
done
```

### Directory
```bash
gemini "Analyze architecture of @./src/:
- Modules
- Dependencies
- Improvements" -o json 2>&1 | node -p "JSON.parse(require('fs').readFileSync(0,'utf8').replace(/^[^{]*/s,'')).response"
```

### Parallel
```bash
# Safe pattern: use $1 instead of {} to prevent shell injection
find src -name "*.ts" | xargs -P 4 -I {} bash -c \
  'gemini "Lint @$1" -o json 2>&1 | node -p "JSON.parse(require(\"fs\").readFileSync(0,\"utf8\").replace(/^[^{]*/s,\"\")).response" > "lint-$(basename "$1").txt"' -- {}
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
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      - name: Install Gemini CLI
        run: npm install -g @google/gemini-cli
      - name: Review
        run: |
          git diff origin/main...HEAD | \
            gemini "Review for bugs and security" -o json 2>&1 | \
            node -p "JSON.parse(require('fs').readFileSync(0,'utf8').replace(/^[^{]*/s,'')).response" > review.md
        env:
          GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
```

### Official Action
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
  git diff --cached | gemini "Quick check. Reply OK or list issues." \
    -o json 2>&1 | node -p "JSON.parse(require('fs').readFileSync(0,'utf8').replace(/^[^{]*/s,'')).response"
fi
```

---

## Quick Reference

> **Note**: One-liners below are for quick use. For production scripts, use the robust error-checking pattern from [SKILL.md](../SKILL.md#error-handling).

### One-Liners

```bash
# Helper function for brevity (add to shell config)
alias gparse="node -p \"JSON.parse(require('fs').readFileSync(0,'utf8').replace(/^[^{]*/s,'')).response\""

# Code review
git diff | gemini "Review" -o json 2>&1 | gparse

# Image OCR
gemini "Extract text @./screenshot.png" -o json 2>&1 | gparse

# Commit message
git diff --cached | gemini "Write commit" -o json 2>&1 | gparse

# Explain code
gemini "Explain @./complex.ts" -o json 2>&1 | gparse

# Generate tests
gemini "Write tests for @./utils.ts" -o json 2>&1 | gparse

# Analyze logs
tail -50 app.log | gemini "Summarize errors" -o json 2>&1 | gparse

# Compare files
gemini "Diff @./old.ts and @./new.ts" -o json 2>&1 | gparse

# Security check
gemini "Security audit @./src/auth/" -o json 2>&1 | gparse
```

### Batch (using gparse alias)
```bash
# Review all files
for f in src/*.ts; do gemini "Review @$f" -o json 2>&1 | gparse; done

# Generate docs
for d in src/*/; do gemini "Document @$d" -o json 2>&1 | gparse > "docs/$(basename "$d").md"; done

# OCR all images
for i in *.png; do gemini "OCR @$i" -o json 2>&1 | gparse > "${i%.png}.txt"; done
```

### Safe Mode
```bash
gemini -s "Analyze @./src/ without modifications" -o json 2>&1 | node -p "JSON.parse(require('fs').readFileSync(0,'utf8').replace(/^[^{]*/s,'')).response"
```

### Sessions
```bash
gemini -c "Start complex task"        # With checkpointing
gemini --resume "Continue"            # Resume
gemini --list-sessions                # List
```

---

## Multi-turn Workflows

### Node.js Helper for Sessions

For multi-turn workflows, create a helper script `gemini-parse.js`:

```javascript
// gemini-parse.js - Save this file for multi-turn workflows
const chunks = [];
process.stdin.on('data', c => chunks.push(c));
process.stdin.on('end', () => {
  const data = Buffer.concat(chunks).toString();
  const idx = data.indexOf('{');
  if (idx < 0) { console.error('No JSON found'); process.exit(1); }
  try {
    const json = JSON.parse(data.slice(idx));
    if (json.error) { console.error('Error:', json.error.message); process.exit(1); }
    // Output both session_id and response for multi-turn
    if (process.argv[2] === '--session') {
      console.log(json.session_id);
    } else {
      console.log(json.response);
    }
  } catch (e) { console.error('Parse error:', e.message); process.exit(1); }
});
```

### Iterative Code Refinement
```bash
#!/bin/bash
# Generate code, then refine based on errors

# Step 1: Generate initial code (capture session_id)
session_id=$(gemini -c "Write a Python function to parse CSV with error handling" \
  -o json 2>&1 | node gemini-parse.js --session)

gemini -c "Write a Python function to parse CSV with error handling" \
  -o json 2>&1 | node gemini-parse.js > generated_code.py

# Step 2: Test the code and capture errors
if ! python generated_code.py 2> errors.txt; then
  # Step 3: Resume session with error context to fix
  cat errors.txt | gemini --resume "$session_id" "Fix these errors in the code you generated" \
    -o json 2>&1 | node gemini-parse.js > generated_code.py
fi
```

### Review and Apply Feedback Loop
```bash
#!/bin/bash
# Code review -> Apply suggestions -> Verify

# Step 1: Initial review with checkpointing
session_id=$(gemini -c "Review @./src/api.ts for security issues" \
  -o json 2>&1 | node gemini-parse.js --session)

gemini -c "Review @./src/api.ts for security issues" \
  -o json 2>&1 | node gemini-parse.js

# Step 2: Ask for specific fixes (same session context)
gemini --resume "$session_id" "Show me the fixed code for issue #1" \
  -o json 2>&1 | node gemini-parse.js

# Step 3: Verify the fix addresses the concern
gemini --resume "$session_id" "Does this fix fully address the SQL injection risk?" \
  -o json 2>&1 | node gemini-parse.js
```

### Progressive Documentation
```bash
#!/bin/bash
# Build documentation incrementally

# Start with overview (capture session)
session_id=$(gemini -c "Document @./src/auth/ - start with module overview" \
  -o json 2>&1 | node gemini-parse.js --session)

echo "# Auth Module" > docs/auth.md
gemini -c "Document @./src/auth/ - start with module overview" \
  -o json 2>&1 | node gemini-parse.js >> docs/auth.md

# Add API reference (continues context)
echo -e "\n## API Reference" >> docs/auth.md
gemini --resume "$session_id" "Now document each exported function" \
  -o json 2>&1 | node gemini-parse.js >> docs/auth.md

# Add usage examples (continues context)
echo -e "\n## Examples" >> docs/auth.md
gemini --resume "$session_id" "Add practical usage examples" \
  -o json 2>&1 | node gemini-parse.js >> docs/auth.md
```

---

## Platform Compatibility

All examples in this document work on:

| Platform | Shell | Notes |
|----------|-------|-------|
| macOS | bash/zsh | Native support |
| Linux | bash/zsh | Native support |
| Windows | PowerShell | Use `node` command directly |
| Windows | Git Bash | Full compatibility |
| Windows | WSL | Full compatibility |
