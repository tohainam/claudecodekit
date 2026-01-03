---
name: gemini
description: Execute Google Gemini CLI for AI-powered automation and analysis. Use when: (1) Analyzing images, PDFs, screenshots, diagrams, (2) Processing media files Claude cannot read directly, (3) Code review and documentation generation, (4) Batch processing files with AI, (5) CI/CD pipeline integration, (6) Any task benefiting from Gemini's capabilities. Triggers: gemini, image analysis, screenshot, PDF analysis, OCR, media file, batch AI.
---

# Gemini CLI

Execute Gemini CLI in headless mode for automation and AI-powered workflows.

## Requirements

| Dependency  | Install                             |
| ----------- | ----------------------------------- |
| Node.js 20+ | [nodejs.org](https://nodejs.org/)   |
| Gemini CLI  | `npm install -g @google/gemini-cli` |

## Quick Reference

```bash
# Non-interactive (automation) - ALWAYS use -p flag
gemini -p "prompt" --output-format json

# Parse JSON response (cross-platform)
gemini -p "query" --output-format json | node -p "JSON.parse(require('fs').readFileSync(0,'utf8')).response"

# With piped input
cat file.txt | gemini -p "analyze this"
git diff | gemini -p "write commit message" --output-format json
```

## Core Flags

| Flag              | Short | Purpose                               |
| ----------------- | ----- | ------------------------------------- |
| `--prompt`        | `-p`  | **Required** for non-interactive mode |
| `--output-format` |       | `text`, `json`, `stream-json`         |
| `--model`         | `-m`  | Model selection                       |
| `--sandbox`       | `-s`  | Safe sandboxed execution              |
| `--yolo`          | `-y`  | Auto-approve actions (caution)        |
| `--resume`        | `-r`  | Resume previous session               |

## Models

| Model                   | Use Case                      |
| ----------------------- | ----------------------------- |
| `gemini-2.5-flash`      | Fast, automation (default)    |
| `gemini-2.5-pro`        | Complex reasoning, 1M context |
| `gemini-2.5-flash-lite` | Ultra-fast, simple tasks      |
| `gemini-3-flash`        | Preview, paid tier            |
| `gemini-3-pro`          | Preview, most powerful        |

## Input Methods

```bash
# Piped input (recommended for automation)
cat src/main.py | gemini -p "review this code"
git diff --staged | gemini -p "write commit message"

# File redirect
gemini -p "analyze" < report.txt

# Multiple files
cat src/*.ts | gemini -p "find bugs"
```

> **Note**: `@file` syntax only works in interactive mode, not with `-p` flag.

## Output Parsing

**Standard pattern (cross-platform):**

```bash
gemini -p "query" --output-format json | node -p "JSON.parse(require('fs').readFileSync(0,'utf8')).response"
```

**With error handling:**

```bash
gemini -p "query" --output-format json | node -e "
  let d='';process.stdin.on('data',c=>d+=c);
  process.stdin.on('end',()=>{
    const j=JSON.parse(d);
    if(j.error){console.error(j.error.message);process.exit(1)}
    console.log(j.response)
  })
"
```

**Shell helper (add to ~/.bashrc or ~/.zshrc):**

```bash
gemi() {
  gemini -p "$@" --output-format json | node -p "
    const j=JSON.parse(require('fs').readFileSync(0,'utf8'));
    if(j.error){console.error(j.error.message);process.exit(1)}
    j.response
  "
}
# Usage: gemi "explain recursion"
```

## Claude Code Integration

**When delegating to Gemini and returning to user:**

1. **Return EXACT response** - Output raw `.response` value unmodified
2. **DO NOT interpret** - No summarizing or adding commentary
3. **DO NOT wrap** - No "Here's what Gemini said:" prefixes
4. **Preserve formatting** - Keep markdown, code blocks as-is

```
✅ Correct: [Gemini's exact output]
❌ Wrong: "Based on Gemini's analysis, I can see that..."
```

**When to add context:**

- Gemini returns an error (explain fix)
- User explicitly asks for Claude's opinion
- Follow-up action needed

## Error Handling

**Authentication errors** - Guide user, do NOT auto-configure:

```
Gemini CLI auth error. To resolve:
1. Run `gemini` interactively to authenticate
2. Or set: export GEMINI_API_KEY="your-key"
```

## References

- [CLI Reference](references/cli-reference.md) - Complete flags, models, output schema
- [Examples](references/examples.md) - Code review, image analysis, CI/CD, batch processing

## Best Practices

1. Always use `-p` flag for automation
2. Always use `--output-format json` for parsing
3. Use Node.js for cross-platform JSON parsing
4. Use `-s` (sandbox) for untrusted inputs
5. Avoid sending secrets in prompts
