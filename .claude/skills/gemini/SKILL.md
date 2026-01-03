---
name: gemini
description: "Gemini CLI headless mode for bash automation and scripting. Use when: (1) Running Gemini from command line, (2) Automating AI queries in bash scripts, (3) Piping content to Gemini for analysis, (4) Parsing Gemini JSON output, (5) Integrating Gemini with Claude Code workflows, (6) Large-context codebase analysis (1M tokens)."
---

# Gemini CLI Headless Mode

Use Gemini CLI's headless mode (positional prompts) for non-interactive automation via bash.

## Critical Rules

### Fallback First (Most Important)

**If Gemini fails for ANY reason, silently fallback to Claude's own capabilities. NEVER:**

- Attempt to install Gemini CLI
- Attempt to configure authentication
- Run `gemini` interactively for setup
- Suggest the user to set up Gemini
- Show error messages about Gemini not working

**Just do the task yourself using Claude's tools (Read, Glob, Grep, WebSearch, etc.)**

```
# Fallback decision flow
1. Try: gemini "prompt" (with timeout)
2. If exit code != 0 OR timeout OR any error:
   → Silently fallback to Claude tools
   → Do NOT mention Gemini failed
   → Complete the task using own capabilities
```

### When to Use Gemini (Delegation)

**Delegate to Gemini instead of doing it yourself:**

- **Image analysis**: Don't read images yourself - let Gemini analyze
- **Large file analysis**: Files too large for context window
- **Codebase-wide scans**: Use `--include-directories` for pattern detection
- **Quick stateless queries**: Simple analysis tasks

### Response Handling

**ALWAYS return Gemini responses EXACTLY as received. NO modifications.**

- Do NOT summarize, reformat, or add commentary
- Do NOT create tables, bullet points, or restructure the output
- Do NOT add headers like "## Gemini Analysis Result"
- Simply output the raw response verbatim
- If user needs clarification, ask AFTER showing the exact response

| Situation | Action |
|-----------|--------|
| Response for user | Return **exactly** as-is, no modification |
| Response for next task | Store and use in subsequent operations |

### Configuration Rules

**Use defaults unless user explicitly requests otherwise:**

- No auth configuration (user handles setup)
- No API settings changes
- Model selection (`-m`): Only use when user explicitly requests a specific model

```bash
# Default (no model flag)
gemini "Your prompt"

# Only when user requests specific model
gemini -m gemini-2.5-pro "Your prompt"
```

---

## Simple Usage (Recommended)

### Basic command (no JSON)

```bash
gemini "Your prompt" @file.png
```

### With JSON output

```bash
gemini "Your prompt" @file.png --output-format json
```

### Parse JSON response

```bash
gemini "Your prompt" --output-format json | node -p "JSON.parse(require('fs').readFileSync(0,'utf8').replace(/^[^{]*/s,'')).response"
```

## Fallback Strategy

**On ANY failure, silently use Claude's own tools:**

| Gemini Task | Fallback Tool |
|-------------|---------------|
| Image analysis | `Read(file_path: "image.png")` - Claude is multimodal |
| Code review | `Read` + `Grep` + inline analysis |
| Codebase scan | `Glob` + `Grep` + `Read` |
| Research | `WebSearch` + `WebFetch` |

**No error messages. No setup suggestions. Just complete the task.**

---

## Prerequisites (Info Only)

> **Note**: This section is for user reference only. Claude should NEVER check prerequisites or suggest installation. Just try Gemini and fallback silently if it fails.

| Requirement | Minimum | User Setup (if they want Gemini) |
|-------------|---------|----------------------------------|
| Node.js | 20.0.0 | [nodejs.org](https://nodejs.org) |
| Gemini CLI | any | `npm install -g @google/gemini-cli` |
| Authentication | - | Run `gemini` interactively, select "Login with Google" |

## Quick Start

### Basic headless query

```bash
gemini "Explain Docker containers"
```

### With file attachment

```bash
gemini "Analyze this image" @screenshot.png
```

### JSON output (recommended for automation)

```bash
gemini "Analyze this code" --output-format json
```

### Pipe content via stdin

```bash
cat src/main.py | gemini "Review for bugs"
```

### Full codebase context

```bash
gemini "Find security vulnerabilities" --include-directories .
```

## Core Flags

| Flag | Purpose |
|------|---------|
| `"prompt"` | Positional prompt for headless mode |
| `@file` | Attach file (images, text, etc.) |
| `--output-format json` | Structured output for parsing |
| `--include-directories .` | Include entire codebase |
| `--yolo` | Auto-approve tool calls |
| `-m gemini-2.5-flash` | Select model |

## JSON Parsing with Node.js

Node.js is portable and already required for Gemini CLI:

```bash
# Simple one-liner to extract response from JSON
gemini "Query" --output-format json | node -p "JSON.parse(require('fs').readFileSync(0,'utf8').replace(/^[^{]*/s,'')).response"

# With error handling
gemini "Query" --output-format json 2>&1 | node -e '
const d = require("fs").readFileSync(0, "utf8");
const m = d.match(/{[\s\S]*}/);
if (m) console.log(JSON.parse(m[0]).response || d);
else { console.error("No JSON found"); process.exit(1); }
'
```

## Common Patterns

### Image analysis

```bash
gemini "Describe this UI screenshot in detail" @screenshot.png
```

### Git commit message

```bash
git diff --cached | gemini "Write a concise commit message"
```

### Code review

```bash
git diff | gemini "Review these changes for bugs and issues"
```

### Codebase analysis

```bash
gemini "List all API endpoints with their HTTP methods" --all-files
```

### With JSON parsing

```bash
gemini "Analyze this image" @photo.jpg --output-format json | node -p "JSON.parse(require('fs').readFileSync(0,'utf8').replace(/^[^{]*/s,'')).response"
```

## Guidelines

### DO

- Use positional prompts: `gemini "prompt"`
- Use `@file` for file attachments (images, text, etc.)
- Use `--output-format json` for automation
- Parse with Node.js for portability (no jq dependency)
- Save important outputs to `.claude/.reports/`
- Use `--include-directories .` for codebase-wide queries
- Handle errors via exit codes

### DON'T

- Use deprecated `-p` flag (use positional prompts)
- Assume context between invocations (stateless)
- Use `--yolo` without understanding risks
- Exceed rate limits (60 req/min, 1K req/day)
- **Attempt to install or configure Gemini**
- **Show errors if Gemini fails - just fallback silently**
- **Suggest user to set up authentication**

## References

- [Command Reference](references/commands.md) - All CLI flags and options
- [Automation Examples](references/examples.md) - Bash scripting patterns
- [Claude Code Integration](references/integration.md) - Dual-agent workflows
