---
name: gemini
description: "Execute Gemini CLI in headless mode for automation, scripting, batch AI processing, and CI/CD integration."
---

# Gemini CLI

Execute Gemini CLI in headless mode for automation and AI-powered workflows.

## Requirements

| Dependency | Purpose        | Install                                           |
| ---------- | -------------- | ------------------------------------------------- |
| `Node.js`  | Runtime (v20+) | [nodejs.org](https://nodejs.org/)                 |
| `gemini`   | Gemini CLI     | `npm install -g @google/gemini-cli`               |

> **Platform**: Works on macOS, Linux, and Windows. Uses Node.js for JSON parsing (no `jq`/`awk`/`sed` needed).

## Quick Start

### Interactive Use (human-readable output)
```bash
gemini "Explain recursion in one sentence"
gemini "Review @./src/main.py"
```

### Automation (JSON output - recommended for scripts)
```bash
# Cross-platform pattern using Node.js (no jq/awk needed)
gemini "List 3 best practices" -o json 2>&1 | node -p "JSON.parse(require('fs').readFileSync(0,'utf8').replace(/^[^{]*/s,'')).response"

# Analyze file
gemini "Summarize @./src/main.py" -o json 2>&1 | node -p "JSON.parse(require('fs').readFileSync(0,'utf8').replace(/^[^{]*/s,'')).response"

# Analyze image
gemini "Describe @./diagram.png" -o json 2>&1 | node -p "JSON.parse(require('fs').readFileSync(0,'utf8').replace(/^[^{]*/s,'')).response"

# Piped input
git diff | gemini "Write commit message" -o json 2>&1 | node -p "JSON.parse(require('fs').readFileSync(0,'utf8').replace(/^[^{]*/s,'')).response"
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

### Output Parsing (Cross-Platform)

**Recommended: Node.js one-liner** (works on macOS, Linux, Windows)
```bash
gemini "..." -o json 2>&1 | node -p "JSON.parse(require('fs').readFileSync(0,'utf8').replace(/^[^{]*/s,'')).response"
```

**Why Node.js?**
- ✅ Already required for Gemini CLI - no extra dependencies
- ✅ Works identically on macOS, Linux, Windows (PowerShell)
- ✅ No `jq`, `awk`, `sed` compatibility issues (GNU vs BSD)
- ✅ Native JSON parsing with proper error handling

**Alternative: Shell function** (add to `~/.bashrc` or `~/.zshrc`)
```bash
gemi() {
  gemini "$@" -o json 2>&1 | node -p "
    const d=require('fs').readFileSync(0,'utf8');
    const j=JSON.parse(d.slice(d.indexOf('{')));
    if(j.error){console.error('Error:',j.error.message);process.exit(1)}
    j.response
  "
}

# Usage
gemi "Explain recursion"
gemi "Review @./src/main.py"
```

### Essential Flags

```bash
-o json          # JSON output (required for parsing)
-m MODEL         # Model selection (see Model Priority below)
-s               # Sandbox mode (safe, no file changes)
-y, --yolo       # Auto-approve actions
-r, --resume     # Resume previous session
```

## Model Priority & Fallback

**CRITICAL**: Use models in this priority order. If a model fails or returns empty response, try the next one.

### Priority Order

| Priority | Model | Best For |
|----------|-------|----------|
| 1 | `gemini-3-pro-preview` | Complex tasks, image analysis, reasoning |
| 2 | `gemini-3-flash-preview` | Fast complex tasks |
| 3 | `gemini-2.5-pro` | Stable complex tasks |
| 4 | `gemini-2.5-flash` | Fast automation |
| 5 | `gemini-2.5-flash-lite` | Simple/batch tasks |
| 6 | **Claude Code fallback** | If all Gemini models fail |

### Fallback Logic

```bash
# Try models in order until one succeeds
MODELS=("gemini-3-pro-preview" "gemini-3-flash-preview" "gemini-2.5-pro" "gemini-2.5-flash" "gemini-2.5-flash-lite")

for model in "${MODELS[@]}"; do
  result=$(gemini -m "$model" "Your prompt" -o json 2>&1)
  response=$(echo "$result" | node -p "JSON.parse(require('fs').readFileSync(0,'utf8').replace(/^[^{]*/s,'')).response" 2>/dev/null)

  if [ -n "$response" ]; then
    echo "$response"
    exit 0
  fi
done

# All models failed - fallback to Claude Code
echo "GEMINI_FALLBACK: All models failed, use Claude Code directly"
```

### Image Analysis Note

**Important**: Image analysis may not work with all models. If you get empty response with default model, explicitly use:
- `gemini-3-pro-preview` (recommended)
- `gemini-2.5-pro`

```bash
# Image analysis - use pro models
gemini -m gemini-3-pro-preview "Describe @./image.png" -o json 2>&1 | node -p "..."
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
)" -o json 2>&1 | node -p "JSON.parse(require('fs').readFileSync(0,'utf8').replace(/^[^{]*/s,'')).response"

# Alternative: use single quotes for simple cases
gemini 'Explain "dependency injection" pattern' -o json 2>&1 | node -p "JSON.parse(require('fs').readFileSync(0,'utf8').replace(/^[^{]*/s,'')).response"
```

## Error Handling

**Authentication errors** - Do NOT auto-configure. Guide user:

```
Gemini CLI auth error. To resolve:
1. Run `gemini` interactively to authenticate
2. Or: export GEMINI_API_KEY="your-key"
For help: gemini --help
```

**Robust error checking with Node.js:**

```bash
gemini "..." -o json 2>&1 | node -e "
  const chunks = [];
  process.stdin.on('data', c => chunks.push(c));
  process.stdin.on('end', () => {
    const data = Buffer.concat(chunks).toString();
    const idx = data.indexOf('{');
    if (idx < 0) {
      console.error('Fatal: No JSON found in output');
      process.exit(1);
    }
    try {
      const json = JSON.parse(data.slice(idx));
      if (json.error) {
        console.error('Gemini error:', json.error.message);
        process.exit(1);
      }
      console.log(json.response);
    } catch (e) {
      console.error('JSON parse error:', e.message);
      process.exit(1);
    }
  });
"
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
# Execute and parse with Node.js (cross-platform)
gemini "prompt" -o json 2>&1 | node -e "
  const chunks = [];
  process.stdin.on('data', c => chunks.push(c));
  process.stdin.on('end', () => {
    const data = Buffer.concat(chunks).toString();
    const idx = data.indexOf('{');
    if (idx < 0) { console.error('No JSON found'); process.exit(1); }
    try {
      const json = JSON.parse(data.slice(idx));
      if (json.error) {
        console.error('Gemini error:', json.error.message);
        process.exit(1);
      }
      console.log(json.response);
    } catch (e) {
      console.error('Parse error:', e.message);
      process.exit(1);
    }
  });
"
```

**Short version (when error handling is less critical):**
```bash
gemini "prompt" -o json 2>&1 | node -p "JSON.parse(require('fs').readFileSync(0,'utf8').replace(/^[^{]*/s,'')).response"
```

### When to Add Context

Only add Claude's commentary when:
- Gemini returns an error (explain how to fix)
- User explicitly asks for Claude's opinion on Gemini's response
- Follow-up action is needed (e.g., "Gemini suggested X, should I apply it?")

## Best Practices

1. Always use `-o json` for automation
2. **Use Node.js for JSON parsing** - cross-platform, no extra dependencies
3. Use `@` for files (better than piping)
4. Use `-s` (sandbox) for untrusted inputs
5. **Follow Model Priority**: Start with `gemini-3-pro-preview`, fallback down the chain
6. **Image/multimodal tasks**: Always use pro models (`gemini-3-pro-preview` or `gemini-2.5-pro`)
7. Check errors before processing response - empty response means try next model
8. **Data privacy**: Avoid sending secrets, API keys, or credentials in prompts - review `git diff` output before piping
9. **Fallback to Claude Code**: If all Gemini models fail, handle the task directly without Gemini

## Platform Compatibility

| Feature | macOS | Linux | Windows |
|---------|-------|-------|---------|
| Node.js parsing | ✅ | ✅ | ✅ |
| File references (`@`) | ✅ | ✅ | ✅ |
| Piped input | ✅ | ✅ | ✅ (PowerShell) |
| Shell function `gemi` | ✅ | ✅ | ✅ (Git Bash/WSL) |