---
name: gemini
description: |
  Execute Google Gemini CLI in headless/non-interactive mode for automation and scripting.
  Use when: (1) Running Gemini from scripts, (2) Batch processing files with AI,
  (3) Piping content for analysis, (4) Code review in CI/CD, (5) Image/document analysis,
  (6) Building AI-powered CLI tools, (7) Any non-interactive Gemini usage.
---

# Gemini CLI

Execute Gemini CLI in headless mode for automation and AI-powered workflows.

## Requirements

| Dependency | Purpose        | Install                                                                           |
| ---------- | -------------- | --------------------------------------------------------------------------------- |
| `Node.js`  | Runtime (v20+) | [nodejs.org](https://nodejs.org/)                                                 |
| `gemini`   | Gemini CLI     | `npm install -g @google/gemini-cli`                                               |
| `jq`       | JSON parsing   | `brew install jq` (macOS), `apt install jq` (Linux), `choco install jq` (Windows) |

> **Platform**: Works on macOS, Linux, and Windows. On Windows, use PowerShell or WSL for best compatibility with pipe operators.

## Quick Start

### Interactive Use (human-readable output)
```bash
gemini "Explain recursion in one sentence"
gemini "Review @./src/main.py"
```

### Automation (JSON output - recommended for scripts)
```bash
# Always use -o json + awk + jq for automation
gemini "List 3 best practices" -o json 2>&1 | awk '/^{/,0' | jq -r '.response'

# Analyze file
gemini "Summarize @./src/main.py" -o json 2>&1 | awk '/^{/,0' | jq -r '.response'

# Analyze image
gemini "Describe @./diagram.png" -o json 2>&1 | awk '/^{/,0' | jq -r '.response'

# Piped input
git diff | gemini "Write commit message" -o json 2>&1 | awk '/^{/,0' | jq -r '.response'
```

## Core Patterns

### Input Methods

```bash
gemini "prompt"                    # Positional prompt
gemini "Review @./file.ts"         # File reference
gemini "Analyze @./src/"           # Directory
gemini "Describe @./image.png"     # Image/PDF
git diff | gemini "Review"         # Piped input
```

### Output

```bash
# Always use this pattern to handle prefixed non-JSON output
gemini "..." -o json 2>&1 | awk '/^{/,0' | jq -r '.response'
```

### Essential Flags

```bash
-o json          # JSON output (required for parsing)
-m MODEL         # Model: gemini-2.5-flash (fast), gemini-2.5-pro (powerful)
-s               # Sandbox mode (safe, no file changes)
-y, --yolo       # Auto-approve actions
-r, --resume     # Resume previous session
```

### Complex Prompts (Heredoc)

Use heredoc for multi-line prompts or prompts containing quotes:

```bash
# Multi-line prompt with quotes
gemini "$(cat <<'EOF'
Review this code for:
1. Security issues like "SQL injection"
2. Performance problems
3. Code that doesn't follow 'best practices'
EOF
)" -o json 2>&1 | awk '/^{/,0' | jq -r '.response'

# Alternative: use single quotes for simple cases
gemini 'Explain "dependency injection" pattern' -o json 2>&1 | awk '/^{/,0' | jq -r '.response'
```

## Error Handling

**Authentication errors** - Do NOT auto-configure. Guide user:

```
Gemini CLI auth error. To resolve:
1. Run `gemini` interactively to authenticate
2. Or: export GEMINI_API_KEY="your-key"
For help: gemini --help
```

**Error checking:**

```bash
# Robust pattern: extract JSON, check errors, get response
output=$(gemini "..." -o json 2>&1)
json=$(echo "$output" | awk '/^{/,0')

if ! echo "$json" | jq . > /dev/null 2>&1; then
  echo "Fatal: No valid JSON in output"; exit 1
fi

if echo "$json" | jq -e '.error' > /dev/null 2>&1; then
  echo "Error: $(echo "$json" | jq -r '.error.message')"; exit 1
fi

echo "$json" | jq -r '.response'
```

## References

- **CLI Reference**: See [references/cli-reference.md](references/cli-reference.md) for flags, models, output formats
- **Examples**: See [references/examples.md](references/examples.md) for use cases:
  - Code Review
  - Image Analysis & OCR
  - Documentation Generation
  - Git Operations
  - Log & Error Analysis
  - Test Generation
  - Batch Processing
  - CI/CD Integration

## Claude Code Integration

**CRITICAL: When executing Gemini commands and returning results to user:**

1. **Return EXACT response** - Output the raw `.response` value from Gemini's JSON, unmodified
2. **DO NOT interpret** - No summarizing, paraphrasing, or adding Claude's commentary
3. **DO NOT wrap** - No "Here's what Gemini said:" or similar prefixes
4. **Preserve formatting** - Keep markdown, code blocks, lists exactly as Gemini returned them

### Correct Behavior

```
User: Use gemini to explain recursion
Claude: [executes command, returns ONLY Gemini's response]

Recursion is a programming technique where a function calls itself...
(This is Gemini's exact output, not Claude's interpretation)
```

### Wrong Behavior

```
User: Use gemini to explain recursion
Claude: I ran Gemini and here's what it said:
> Recursion is...

Let me also add that... ❌ WRONG - Don't add commentary
```

### Execution Pattern

```bash
# Execute and capture
output=$(gemini "prompt" -o json 2>&1)
json=$(echo "$output" | awk '/^{/,0')

# Check for errors first
if echo "$json" | jq -e '.error' > /dev/null 2>&1; then
  # Report error to user
  echo "Gemini error: $(echo "$json" | jq -r '.error.message')"
else
  # Return EXACT response - this goes directly to user
  echo "$json" | jq -r '.response'
fi
```

### When to Add Context

Only add Claude's commentary when:
- Gemini returns an error (explain how to fix)
- User explicitly asks for Claude's opinion on Gemini's response
- Follow-up action is needed (e.g., "Gemini suggested X, should I apply it?")

## Best Practices

1. Always use `-o json` for automation
2. **Always pipe through `awk '/^{/,0'`** to extract JSON (handles "Loaded cached credentials." prefix)
3. Use `@` for files (better than piping)
4. Use `-s` (sandbox) for untrusted inputs
5. Use `gemini-2.5-flash` for speed, `gemini-2.5-pro` for complex tasks
6. Check errors before processing response
7. **Data privacy**: Avoid sending secrets, API keys, or credentials in prompts - review `git diff` output before piping
