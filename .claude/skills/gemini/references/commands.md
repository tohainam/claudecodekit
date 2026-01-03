# Gemini CLI Command Reference

## Table of Contents

- [Core Headless Flags](#core-headless-flags)
- [Output Formats](#output-formats)
- [Context Control](#context-control)
- [Approval Modes](#approval-modes)
- [Model Selection](#model-selection)

## Core Headless Flags

| Flag | Short | Description |
|------|-------|-------------|
| `"prompt"` | | Positional prompt for headless mode (recommended) |
| `@file` | | Attach file to prompt (images, text, etc.) |
| `--output-format` | `-o` | Output type: `text`, `json`, `stream-json` |
| `--yolo` | `-y` | Auto-approve all tool calls |
| `--sandbox` | `-s` | Enable sandbox mode for safer execution |
| `--debug` | `-d` | Enable debug output |
| `--all-files` | `-a` | Include entire codebase in context |

## Output Formats

### Text (default)

```bash
gemini "Explain this code"
```

Plain text response, suitable for direct display.

### JSON (recommended for automation)

```bash
gemini "Analyze this" --output-format json
```

Returns structured JSON:

```json
{
  "response": "The analysis shows...",
  "tool_calls": [...],
  "tokens_used": 1234
}
```

Parse with Node.js (portable, no jq dependency):

```bash
# Extract response field
gemini "Query" --output-format json 2>/dev/null | node -e '
const fs = require("fs");
const d = fs.readFileSync(0, "utf8");
const m = d.match(/{[\s\S]*}/);
console.log(m ? JSON.parse(m[0]).response : "");
'

# Full object access
gemini "Query" --output-format json 2>/dev/null | node -e '
const fs = require("fs");
const d = fs.readFileSync(0, "utf8");
try {
  const m = d.match(/{[\s\S]*}/);
  if (!m) throw new Error("No JSON");
  const data = JSON.parse(m[0]);
  console.log("Response:", data.response || "");
  console.log("Tokens:", data.tokens_used || "N/A");
} catch (e) {
  console.error("Parse failed:", e.message);
  process.exit(1);
}
'
```

### Stream JSON

```bash
gemini "Long task" --output-format stream-json
```

Real-time JSON chunks for monitoring long operations.

## Context Control

| Flag | Short | Description |
|------|-------|-------------|
| `--all-files` | `-a` | Include entire codebase in context |
| `--include-directories` | | Add specific directories to context |

### Examples

```bash
# Full codebase analysis
gemini "Find code duplication" --all-files

# Specific directories
gemini "Review test coverage" --include-directories src,tests

# With file attachment
gemini "Analyze this screenshot" @screenshot.png
```

## Approval Modes

| Mode | Flag | Behavior |
|------|------|----------|
| Default | (none) | Prompts for approval on each tool call |
| YOLO | `--yolo` or `-y` | Auto-approve all tool calls |
| Auto-edit | `--approval-mode auto_edit` | Auto-approve edits only |

### YOLO Mode

```bash
gemini "Refactor the auth module" --yolo
```

**Warning**: Auto-approves ALL actions including file modifications.

## Model Selection

```bash
gemini "Query" -m gemini-2.5-flash
```

Available models:

| Model | Use Case |
|-------|----------|
| `gemini-2.5-pro` | Default, 1M context, best quality |
| `gemini-2.5-flash` | Faster, lower cost |

## Input Methods

### Direct prompt (positional)

```bash
gemini "What is machine learning?"
```

### With file attachment

```bash
gemini "Describe this image" @image.png
gemini "Analyze this code" @src/main.py
```

### Pipe from stdin

```bash
echo "Explain this code" | gemini
cat README.md | gemini "Summarize this"
```

### Command output

```bash
git diff | gemini "Review these changes"
git log --oneline -20 | gemini "Summarize recent commits"
```

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | Error (check stderr) |

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `GEMINI_API_KEY` | API key authentication |
| `GOOGLE_API_KEY` | Alternative API key |
| `GOOGLE_GENAI_USE_VERTEXAI` | Enable Vertex AI backend |
