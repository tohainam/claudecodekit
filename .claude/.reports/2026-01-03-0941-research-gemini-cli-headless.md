# Research Report: Gemini CLI Headless Mode

**Generated**: 2026-01-03 09:41
**Depth**: deep
**Confidence**: High

## Executive Summary

Gemini CLI is Google's open-source AI agent that brings Gemini directly to the terminal. Headless mode enables non-interactive usage via the `-p`/`--prompt` flag, making it ideal for automation, scripting, CI/CD pipelines, and integration with other tools like Claude Code. The CLI offers a generous free tier (60 req/min, 1,000 req/day) with access to Gemini 2.5 Pro's 1M token context window.

## Key Findings

- Headless mode activated via `-p "prompt"` flag for single-prompt execution (Source: [Official Headless Docs](https://google-gemini.github.io/gemini-cli/docs/cli/headless.html))
- Free tier provides 60 requests/minute and 1,000 requests/day with Google OAuth (Source: [GitHub README](https://github.com/google-gemini/gemini-cli))
- JSON output format available via `--output-format json` for programmatic parsing (Source: [Gemini CLI Docs](https://geminicli.com/docs/cli/headless/))
- `--yolo` mode auto-approves tool calls for full automation (Source: [Configuration Docs](https://geminicli.com/docs/get-started/configuration/))
- MCP (Model Context Protocol) support enables custom tool integrations (Source: [MCP Server Docs](https://geminicli.com/docs/tools/mcp-server/))

## Installation & Configuration

### Prerequisites

- Node.js version 20 or higher

### Installation Methods

```bash
# Quick start (no install)
npx https://github.com/google-gemini/gemini-cli

# Global installation via npm
npm install -g @google/gemini-cli

# macOS/Linux via Homebrew
brew install gemini-cli

# Verify installation
gemini --version
```

### Authentication Options

**Option 1: Google OAuth (Recommended - Free Tier)**
```bash
gemini  # Select "Login with Google" on first run
# Benefits: 60 req/min, 1,000 req/day, Gemini 2.5 Pro, 1M context
```

**Option 2: Gemini API Key**
```bash
export GEMINI_API_KEY="YOUR_API_KEY"
gemini
```

**Option 3: Vertex AI (Enterprise)**
```bash
export GOOGLE_API_KEY="YOUR_API_KEY"
export GOOGLE_GENAI_USE_VERTEXAI=true
```

### Configuration Files

| Location | Scope |
|----------|-------|
| `.gemini/settings.json` | Project-specific |
| `~/.gemini/settings.json` | User-level |
| `/etc/gemini-cli/settings.json` | System-wide |

Environment variables load from `.env` files (searches upward to project root, then `~/.env`).

## Command-Line Options for Headless Mode

### Core Flags

| Flag | Short | Description |
|------|-------|-------------|
| `--prompt` | `-p` | Execute single prompt in headless mode |
| `--output-format` | | Output type: `text`, `json`, `stream-json` |
| `--model` | `-m` | Select model (e.g., `gemini-2.5-flash`) |
| `--yolo` | `-y` | Auto-approve all tool calls |
| `--approval-mode` | | Set approval behavior (`yolo`, `auto_edit`) |
| `--all-files` | `-a` | Include all files in context |
| `--include-directories` | | Add specific directories to context |
| `--sandbox` | `-s` | Enable sandbox mode |
| `--debug` | `-d` | Enable debug output |
| `--checkpointing` | | Save snapshots before modifications |

### Input Methods

```bash
# Direct prompt
gemini -p "What is machine learning?"

# Pipe from stdin
echo "Explain this code" | gemini

# File input
cat README.md | gemini -p "Summarize this documentation"

# Command output
git diff | gemini -p "Review these changes"
```

### Output Processing

```bash
# Plain text to file
gemini -p "Explain Docker" > explanation.txt

# JSON output for parsing
gemini -p "Analyze code" --output-format json > analysis.json

# Pipe JSON to jq
gemini -p "Query" --output-format json | jq '.response'

# Stream JSON for real-time monitoring
gemini -p "Run tests" --output-format stream-json
```

## Practical Automation Examples

### Code Analysis

```bash
# Security review
cat src/auth.py | gemini -p "Review this authentication code for security issues" > security-review.txt

# Bug detection
result=$(cat "$file" | gemini -p "Find potential bugs and suggest improvements" --output-format json)
echo "$result" | jq -r '.response'
```

### Git Integration

```bash
# Generate commit messages
git diff --cached | gemini -p "Write a concise commit message for these changes" --output-format json | jq -r '.response'

# PR review
git diff origin/main...HEAD | gemini -p "Review these changes for bugs, security issues, and code quality" --output-format json

# Release notes
git log --oneline v1.0.0..HEAD | gemini -p "Generate release notes from these commits" --output-format json | jq -r '.response'
```

### API Documentation

```bash
# Generate OpenAPI spec
cat api/routes.js | gemini -p "Generate OpenAPI spec for these routes" --output-format json | jq -r '.response' > openapi.yaml
```

### Error Analysis

```bash
# Log analysis
grep "ERROR" /var/log/app.log | tail -20 | gemini -p "Analyze these errors and suggest root cause and fixes" > error-analysis.txt
```

### Full Automation with YOLO

```bash
# Fully automated task (use with caution)
gemini -p "Refactor the authentication module" --yolo

# Codebase-wide analysis
gemini --all-files -p "Identify code duplication patterns" --yolo
```

## Claude Code Integration Patterns

### Pattern 1: Gemini as Subagent

Create a subagent file at `~/.claude/agents/gemini-analyzer.md` or `<project>/.claude/agents/gemini-analyzer.md`:

```yaml
---
name: gemini-analyzer
description: Manages Gemini CLI for codebase analysis and pattern detection
model: sonnet
color: yellow
---
```

The subagent:
- Receives analysis requests from Claude
- Formats appropriate Gemini CLI commands
- Executes with proper parameters
- Returns unfiltered results to Claude

**Example invocations:**
```bash
# Pattern detection
gemini --all-files -p "Analyze this codebase and identify all design patterns used"

# Architecture analysis
gemini --all-files -p "Analyze the overall architecture and component relationships"

# Security scan
gemini --all-files -p "Scan for potential security vulnerabilities"
```

### Pattern 2: Dual-Agent Workflow

Coordinate Claude Code and Gemini CLI via shared filesystem state:

1. **Detection Agent (Gemini)**: Scans codebase, appends issues to `todo.md`
2. **Fixing Agent (Claude)**: Monitors `todo.md`, fixes issues, marks complete

```bash
# Gemini scans and reports
gemini --all-files -p "Scan codebase for improvements, output as markdown checklist" >> todo.md

# Claude processes todo items
# (handled by Claude Code session)
```

### Pattern 3: MCP-Based Orchestration

Use MCP servers to expose Gemini as a tool to Claude:

```json
{
  "mcpServers": {
    "gemini-analyzer": {
      "command": "node",
      "args": ["path/to/gemini-mcp-server.js"]
    }
  }
}
```

### Why Integrate Both?

| Claude Code | Gemini CLI |
|-------------|------------|
| Complex multi-step tasks | Large context analysis (1M tokens) |
| Code generation & editing | Codebase-wide pattern detection |
| Paid usage | Generous free tier |
| Deep reasoning | Fast scanning |

## MCP Server Integration

Gemini CLI supports extending capabilities via MCP servers:

```json
// .gemini/settings.json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"]
    }
  }
}
```

**Transport Methods:**
- STDIO (default)
- SSE (Server-Sent Events)
- HTTP

**Built-in Tools:**
- `read_file`, `write_file`, `delete_file`
- `shell_execute`
- `web_fetch`, `google_search`

## Warnings & Pitfalls

- **YOLO mode risks**: Auto-approves all actions including potentially destructive ones; sandbox enabled by default in YOLO mode
- **No session persistence**: Headless mode has no context between invocations; each run is stateless
- **Custom commands limitation**: Commands defined in `.toml` files may not work in non-interactive mode (GitHub Issue #5435)
- **Rate limits**: Free tier has 1,000 req/day limit; plan accordingly for CI/CD
- **Large context trade-off**: 1M context is powerful but may slow processing

## Version Compatibility

- **Node.js**: Version 20+ required
- **Platforms**: macOS, Linux, Windows
- **Release Channels**:
  - `@stable` / `@latest`: Weekly Tuesday promotion
  - `@preview`: Weekly Tuesday releases
  - `@nightly`: Daily builds from main branch

## Recommendations

1. **Start with OAuth login** for free tier access (60 req/min, 1K req/day)
2. **Use `--output-format json`** for all automation to enable reliable parsing
3. **Implement error handling** via exit codes and JSON error fields
4. **Create a Gemini subagent** in Claude Code for codebase-wide analysis tasks
5. **Use `--all-files` flag** for comprehensive codebase understanding
6. **Combine with `jq`** for JSON output processing in shell scripts
7. **Consider MCP servers** for custom tool integrations

## Unresolved Questions

- Custom commands (`.toml`) behavior in headless mode remains inconsistent
- Stateful headless/daemon mode is a feature request (Issue #15338) but not yet implemented
- Performance benchmarks for large codebase analysis vs. Claude Code not widely documented

## Sources

- [Gemini CLI GitHub Repository](https://github.com/google-gemini/gemini-cli) - accessed 2026-01-03
- [Official Headless Mode Documentation](https://google-gemini.github.io/gemini-cli/docs/cli/headless.html) - accessed 2026-01-03
- [Gemini CLI Documentation](https://geminicli.com/docs/) - accessed 2026-01-03
- [Gemini CLI Configuration](https://geminicli.com/docs/get-started/configuration/) - accessed 2026-01-03
- [MCP Server Integration](https://geminicli.com/docs/tools/mcp-server/) - accessed 2026-01-03
- [Google Cloud Gemini CLI Docs](https://docs.cloud.google.com/gemini/docs/codeassist/gemini-cli) - accessed 2026-01-03
- [Gemini CLI Tips & Tricks - Addy Osmani](https://addyo.substack.com/p/gemini-cli-tips-and-tricks) - accessed 2026-01-03
- [Using Gemini CLI as Subagent for Claude Code](https://aicodingtools.blog/en/claude-code/gemini-cli-as-subagent-of-claude-code) - accessed 2026-01-03
- [Dual-Agent Workflow Pattern](https://medium.com/@slayerfifahamburg/the-dual-agent-workflow-how-to-pair-gemini-cli-and-claude-code-for-autonomous-code-evolution-f8f94900b6fc) - accessed 2026-01-03
- [Gemini CLI Cheatsheet - Phil Schmid](https://www.philschmid.de/gemini-cli-cheatsheet) - accessed 2026-01-03
