# Gemini CLI Reference

Complete reference for CLI flags, models, input/output formats.

## Table of Contents

- [CLI Flags](#cli-flags)
- [Available Models](#available-models)
- [Input Methods](#input-methods)
- [Output Formats](#output-formats)
- [Common Errors](#common-errors)

---

## CLI Flags

### Core Flags

| Flag | Short | Purpose | Example |
|------|-------|---------|---------|
| `[query..]` | | Positional prompt (recommended) | `gemini "query"` |
| `--output-format` | `-o` | Output: text/json/stream-json | `-o json` |
| `--model` | `-m` | Select model | `-m gemini-2.5-flash` |

### Approval & Safety

| Flag | Short | Purpose | Example |
|------|-------|---------|---------|
| `--yolo` | `-y` | Auto-approve all actions | `--yolo` |
| `--sandbox` | `-s` | Sandboxed execution | `-s` |
| `--allowed-tools` | | Whitelist tools | `--allowed-tools shell,edit` |
| `--approval-mode` | | default/auto_edit/yolo | `--approval-mode auto_edit` |

### Session Management

| Flag | Short | Purpose | Example |
|------|-------|---------|---------|
| `--resume` | `-r` | Resume session | `--resume` or `--resume 1` |
| `--list-sessions` | | List sessions | `--list-sessions` |
| `--delete-session` | | Delete session | `--delete-session 2` |
| `--checkpointing` | `-c` | State snapshots | `-c` |

### Context & Files

| Flag | Short | Purpose | Example |
|------|-------|---------|---------|
| `--include-directories` | | Add directories | `--include-directories ../shared` |
| `--all-files` | | Ignore gitignore | `--all-files` |

### Other

| Flag | Short | Purpose |
|------|-------|---------|
| `--debug` | `-d` | Debug output |
| `--preview-features` | | Gemini 3 models |
| `--extensions` | `-e` | Use extensions |
| `--help` | `-h` | Show help |

### Deprecated

| Flag | Use Instead |
|------|-------------|
| `--prompt` / `-p` | Positional: `gemini "query"` |

---

## Available Models

### Production Models

```bash
gemini -m gemini-2.5-flash "..."      # Fast - recommended for automation
gemini -m gemini-2.5-pro "..."        # Powerful - complex tasks
gemini -m gemini-2.5-flash-lite "..." # Ultra-fast - simple tasks
```

### Preview Models (Paid)

```bash
gemini -m gemini-3-flash --preview-features "..."
gemini -m gemini-3-pro --preview-features "..."
```

### Model Selection

| Use Case | Model |
|----------|-------|
| Automation | `gemini-2.5-flash` |
| Complex reasoning | `gemini-2.5-pro` |
| Batch processing | `gemini-2.5-flash-lite` |

---

## Input Methods

### Positional Prompt
```bash
gemini "Your prompt here"
```

### File References (@)
```bash
gemini "Review @./src/auth.ts"           # Single file
gemini "Compare @./old.py and @./new.py" # Multiple files
gemini "Analyze @./src/"                 # Directory
gemini "Describe @./diagram.png"         # Image
gemini "Summarize @./report.pdf"         # PDF
```

### Piped Input
```bash
git diff | gemini "Review changes"
cat error.log | gemini "Analyze errors"
```

---

## Output Formats

### JSON (Recommended)
```bash
gemini "Count to 3" -o json
```

```json
{
  "session_id": "uuid",
  "response": "1, 2, 3",
  "stats": { "models": {...}, "tools": {...}, "files": {...} },
  "error": null
}
```

### Parse with jq

**Important**: Gemini CLI may output non-JSON text (like "Loaded cached credentials.") before the JSON response. Always use `awk '/^{/,0'` to extract the JSON portion:

```bash
# Standard pattern for all Gemini automation
gemini "..." -o json 2>&1 | awk '/^{/,0' | jq -r '.response'       # Response
gemini "..." -o json 2>&1 | awk '/^{/,0' | jq '.stats.models'      # Token stats
gemini "..." -o json 2>&1 | awk '/^{/,0' | jq -e '.error // empty' # Check errors
```

---

## Common Errors

| Error | Meaning | Solution |
|-------|---------|----------|
| `jq: parse error` | Non-JSON prefix in output | Use `awk '/^{/,0'` before `jq` |
| `API key not found` | No auth | Run `gemini` to authenticate |
| `Rate limit exceeded` | Too many requests | Wait and retry |
| `Model not found` | Invalid model | Use `gemini-2.5-flash` |
| `File not found` | Invalid @ path | Verify path exists |
| `Context too long` | Input too large | Split into chunks |

### Error Checking Pattern

```bash
#!/bin/bash
# Capture output and extract JSON (handles "Loaded cached credentials." prefix)
output=$(gemini "..." -o json 2>&1)
json=$(echo "$output" | awk '/^{/,0')

# Validate JSON
if ! echo "$json" | jq . > /dev/null 2>&1; then
  echo "Fatal: No valid JSON found in output"
  echo "Raw output: $output"
  exit 1
fi

# Check for API errors
if echo "$json" | jq -e '.error' > /dev/null 2>&1; then
  echo "Error: $(echo "$json" | jq -r '.error.message')"
  exit 1
fi

# Success - extract response
echo "$json" | jq -r '.response'
```
