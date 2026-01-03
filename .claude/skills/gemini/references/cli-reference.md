# Gemini CLI Reference

Complete reference for flags, models, and output formats.

## Table of Contents

- [CLI Flags](#cli-flags)
- [Models](#models)
- [Input Methods](#input-methods)
- [Output Formats](#output-formats)
- [Authentication](#authentication)
- [Configuration](#configuration)
- [Common Errors](#common-errors)

---

## CLI Flags

### Input/Output

| Flag                   | Short | Description                                    |
| ---------------------- | ----- | ---------------------------------------------- |
| `--prompt`             | `-p`  | Non-interactive mode (required for automation) |
| `--prompt-interactive` | `-i`  | Interactive with initial prompt                |
| `--output-format`      |       | Output: `text`, `json`, `stream-json`          |
| `--model`              | `-m`  | Model selection                                |

### Execution Control

| Flag              | Short | Description                     |
| ----------------- | ----- | ------------------------------- |
| `--sandbox`       | `-s`  | Sandboxed execution (safe mode) |
| `--yolo`          | `-y`  | Auto-approve all actions        |
| `--approval-mode` |       | `default`, `auto_edit`, `yolo`  |
| `--allowed-tools` |       | Whitelist specific tools        |

### Session Management

| Flag               | Short | Description                                 |
| ------------------ | ----- | ------------------------------------------- |
| `--resume`         | `-r`  | Resume session (`--resume` or `--resume 5`) |
| `--list-sessions`  |       | List available sessions                     |
| `--delete-session` |       | Delete session by ID                        |

### Workspace

| Flag                    | Short | Description                        |
| ----------------------- | ----- | ---------------------------------- |
| `--include-directories` | `-I`  | Add directories to context (max 5) |
| `--all-files`           |       | Ignore .gitignore                  |

### Other

| Flag                 | Short | Description            |
| -------------------- | ----- | ---------------------- |
| `--debug`            | `-d`  | Debug logging          |
| `--extensions`       | `-e`  | Enable extensions      |
| `--preview-features` |       | Enable Gemini 3 models |
| `--version`          |       | Show version           |
| `--help`             | `-h`  | Show help              |

---

## Models

### Available Models (January 2026)

| Model                   | Status         | Context   | Use Case            |
| ----------------------- | -------------- | --------- | ------------------- |
| `gemini-3-pro`          | Preview (paid) |           | Most powerful       |
| `gemini-3-flash`        | Preview (paid) |           | Fast, 78% SWE-bench |
| `gemini-2.5-pro`        | Stable         | 1M tokens | Complex reasoning   |
| `gemini-2.5-flash`      | Stable         |           | Fast (default)      |
| `gemini-2.5-flash-lite` | Stable         |           | Ultra-fast          |

### Selection Guide

| Task                 | Recommended Model       |
| -------------------- | ----------------------- |
| Automation/scripting | `gemini-2.5-flash`      |
| Complex reasoning    | `gemini-2.5-pro`        |
| Batch processing     | `gemini-2.5-flash-lite` |
| Cutting-edge (paid)  | `gemini-3-flash`        |

### Usage

```bash
# Command line
gemini -m gemini-2.5-flash -p "query"

# Environment variable
export GEMINI_MODEL="gemini-2.5-pro"
```

### Enable Preview Models

```bash
# Requires paid tier
gemini -m gemini-3-flash --preview-features -p "query"
```

---

## Input Methods

### Non-Interactive Mode (-p)

```bash
# Direct prompt
gemini -p "explain Docker"

# Piped input
cat file.py | gemini -p "review this code"
git diff | gemini -p "write commit message"

# File redirect
gemini -p "analyze" < report.txt

# Combined
cat src/*.ts | gemini -p "find security issues"
```

### Interactive Mode

```bash
# Start interactive session
gemini

# In session, use @ for files
> @src/main.py explain this
> @docs/ summarize all docs
```

> **Important**: `@file` syntax does NOT work with `-p` flag. Use piping instead.

---

## Output Formats

### JSON (Recommended for Automation)

```bash
gemini -p "query" --output-format json
```

**Response Schema:**

```json
{
  "response": "string",
  "stats": {
    "models": {
      "[model-name]": {
        "api": { "requests": 1, "latency": 1234 },
        "tokens": { "input": 100, "output": 200 }
      }
    },
    "tools": {
      "totalCalls": 0,
      "totalSuccess": 0,
      "byName": {}
    },
    "files": {}
  },
  "error": {
    "type": "string",
    "message": "string"
  }
}
```

### Parsing with Node.js

```bash
# Extract response
gemini -p "query" --output-format json | node -p "JSON.parse(require('fs').readFileSync(0,'utf8')).response"

# Get stats
gemini -p "query" --output-format json | node -p "JSON.parse(require('fs').readFileSync(0,'utf8')).stats"

# Check error
gemini -p "query" --output-format json | node -p "JSON.parse(require('fs').readFileSync(0,'utf8')).error"
```

### Stream JSON

```bash
gemini -p "complex task" --output-format stream-json
```

Event types: `init`, `message`, `tool_use`, `tool_result`, `error`, `result`

---

## Authentication

### Method 1: Google OAuth (Free Tier)

```bash
# First run triggers browser auth
gemini
```

**Limits:** 60 req/min, 1000 req/day

### Method 2: API Key

```bash
export GEMINI_API_KEY="your-key"
```

Get key: [Google AI Studio](https://aistudio.google.com/)

### Method 3: Vertex AI (Enterprise)

```bash
gcloud auth application-default login
export GOOGLE_CLOUD_PROJECT="project-id"
export GOOGLE_GENAI_USE_VERTEXAI="true"
```

### Environment Variables

| Variable                         | Purpose              |
| -------------------------------- | -------------------- |
| `GEMINI_API_KEY`                 | API key auth         |
| `GEMINI_MODEL`                   | Default model        |
| `GOOGLE_CLOUD_PROJECT`           | GCP project          |
| `GOOGLE_APPLICATION_CREDENTIALS` | Service account path |

---

## Configuration

### Settings File Locations (Precedence)

1. `/etc/gemini-cli/system-defaults.json`
2. `~/.gemini/settings.json`
3. `.gemini/settings.json` (project)
4. `/etc/gemini-cli/settings.json`

### Key Settings

```json
{
  "previewFeatures": false,
  "model": {
    "name": "gemini-2.5-flash"
  },
  "tools": {
    "sandbox": true,
    "autoAccept": false
  },
  "security": {
    "disableYoloMode": false
  }
}
```

### Context File (GEMINI.md)

- Global: `~/.gemini/GEMINI.md`
- Project: `.gemini/GEMINI.md`

---

## Common Errors

| Error                 | Cause             | Solution                             |
| --------------------- | ----------------- | ------------------------------------ |
| `API key not found`   | No auth           | Run `gemini` or set `GEMINI_API_KEY` |
| `Rate limit exceeded` | Too many requests | Wait or use API key                  |
| `Model not found`     | Invalid model     | Use `gemini-2.5-flash`               |
| `File not found`      | Bad @ path        | Verify path exists                   |
| `Context too long`    | Input too large   | Split into chunks                    |

### Error Handling Pattern

```bash
gemini -p "query" --output-format json | node -e "
  let d='';
  process.stdin.on('data',c=>d+=c);
  process.stdin.on('end',()=>{
    const j=JSON.parse(d);
    if(j.error){
      console.error('Error:',j.error.message);
      process.exit(1);
    }
    console.log(j.response);
  });
"
```

---

## Platform Support

| Feature         | macOS | Linux | Windows           |
| --------------- | ----- | ----- | ----------------- |
| Node.js parsing | ✅    | ✅    | ✅                |
| Piped input     | ✅    | ✅    | ✅ (PowerShell)   |
| Shell helper    | ✅    | ✅    | ✅ (Git Bash/WSL) |
