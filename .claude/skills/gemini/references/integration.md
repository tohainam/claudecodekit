# Claude Code + Gemini CLI Integration

## Table of Contents

- [Silent Fallback Rule](#silent-fallback-rule)
- [Why Integrate Both](#why-integrate-both)
- [Node.js Response Handler](#nodejs-response-handler)
- [Delegation Patterns](#delegation-patterns)
- [Saving Reports](#saving-reports)
- [Dual-Agent Workflows](#dual-agent-workflows)
- [Best Practices](#best-practices)

## Silent Fallback Rule

**CRITICAL: If Gemini fails for ANY reason, Claude must silently fallback to its own tools.**

| Gemini Failure | Claude Fallback |
|----------------|-----------------|
| Not installed | Use `Read`, `Glob`, `Grep` directly |
| Not authenticated | Use `Read`, `Glob`, `Grep` directly |
| Rate limited | Use `Read`, `Glob`, `Grep` directly |
| Timeout | Use `Read`, `Glob`, `Grep` directly |
| Any error | Use `Read`, `Glob`, `Grep` directly |

**NEVER:**
- Suggest installing Gemini
- Suggest authenticating Gemini
- Show error messages about Gemini
- Ask user to configure anything

**Just complete the task using Claude's own capabilities.**

## Why Integrate Both

| Claude Code | Gemini CLI |
|-------------|------------|
| Complex multi-step tasks | Large context analysis (1M tokens) |
| Code generation & editing | Codebase-wide pattern detection |
| Deep reasoning | Fast scanning |
| Paid usage | Generous free tier (60 req/min, 1K req/day) |

Use Gemini CLI when:

- Analyzing entire codebases (1M token context)
- Scanning for patterns across many files
- Performing quick, stateless queries
- Reducing Claude Code token usage
- Analyzing images

Use Claude Code when:

- Multi-step implementation tasks
- Code editing and refactoring
- Complex reasoning chains
- Maintaining conversation context

## Node.js Response Handler

Node.js is portable (no jq dependency) and already required for Gemini CLI:

```bash
# Extract response field (single quotes for bash safety)
node -e '
const fs = require("fs");
const d = fs.readFileSync(0, "utf8");
const m = d.match(/{[\s\S]*}/);
console.log(m ? JSON.parse(m[0]).response : "");
'

# Full handler with report saving
node -e '
const fs = require("fs");
const d = fs.readFileSync(0, "utf8");
try {
  const m = d.match(/{[\s\S]*}/);
  if (!m) throw new Error("No JSON");
  const data = JSON.parse(m[0]);
  const ts = new Date().toISOString().slice(0, 16).replace(/[T:]/g, "-");
  const path = ".claude/.reports/" + ts + "-gemini.md";
  fs.writeFileSync(path, data.response || d);
  console.log("Saved:", path);
} catch (e) {
  console.error("Failed:", e.message);
  process.exit(1);
}
'
```

## Delegation Patterns

### Pattern 1: Analysis Delegation

Delegate large-context analysis to Gemini, save to reports:

```bash
gemini "Identify all API endpoints and their handlers" --all-files --output-format json 2>/dev/null | node -e '
const fs = require("fs");
const d = fs.readFileSync(0, "utf8");
try {
  const m = d.match(/{[\s\S]*}/);
  if (!m) throw new Error("No JSON");
  const data = JSON.parse(m[0]);
  const ts = new Date().toISOString().slice(0, 16).replace(/[T:]/g, "-");
  fs.writeFileSync(".claude/.reports/" + ts + "-api-endpoints.md", "# API Endpoints\n\n" + (data.response || d));
  console.log(data.response || "");
} catch (e) {
  console.error("Failed:", e.message);
  process.exit(1);
}
'
```

### Pattern 2: Image Analysis

Delegate image analysis to Gemini:

```bash
gemini "Describe this UI screenshot. List all elements and their purposes." @screenshot.png
```

### Pattern 3: Preprocessing

Use Gemini to summarize before detailed Claude Code work:

```bash
cat large_file.py | gemini "Summarize the main functions and their purposes"
```

### Pattern 4: Validation

Use Gemini for quick validation checks:

```bash
gemini "List potential security vulnerabilities" --all-files
```

## Saving Reports

### Standard report saving pattern

```bash
gemini "Your prompt" --output-format json 2>/dev/null | node -e '
const filename = process.argv[2] || "gemini";
const fs = require("fs");
const d = fs.readFileSync(0, "utf8");
try {
  const m = d.match(/{[\s\S]*}/);
  if (!m) throw new Error("No JSON");
  const data = JSON.parse(m[0]);
  const ts = new Date().toISOString().slice(0, 16).replace(/[T:]/g, "-");
  const path = ".claude/.reports/" + ts + "-" + filename + ".md";
  fs.writeFileSync(path, data.response || d);
  console.log("Saved:", path);
} catch (e) {
  console.error("Failed:", e.message);
  process.exit(1);
}
' -- "report-name"
```

### Report with metadata

```bash
gemini "Analyze codebase" --all-files --output-format json 2>/dev/null | node -e '
const fs = require("fs");
const d = fs.readFileSync(0, "utf8");
try {
  const m = d.match(/{[\s\S]*}/);
  if (!m) throw new Error("No JSON");
  const data = JSON.parse(m[0]);
  const ts = new Date().toISOString().slice(0, 16).replace(/[T:]/g, "-");
  const report = [
    "# Gemini Analysis Report",
    "",
    "**Generated:** " + new Date().toISOString(),
    "**Tokens:** " + (data.tokens_used || "N/A"),
    "",
    "---",
    "",
    data.response || d
  ].join("\n");
  fs.writeFileSync(".claude/.reports/" + ts + "-analysis.md", report);
  console.log("Report saved");
} catch (e) {
  console.error("Failed:", e.message);
  process.exit(1);
}
'
```

## Dual-Agent Workflows

### Detection + Fixing Pattern

1. **Gemini detects issues** → writes to .claude/.reports/
2. **Claude Code fixes issues** → marks complete

```bash
# Step 1: Gemini scans and reports
gemini "Scan for code smells and anti-patterns. Output as markdown checklist." --all-files --output-format json 2>/dev/null | node -e '
const fs = require("fs");
const d = fs.readFileSync(0, "utf8");
try {
  const m = d.match(/{[\s\S]*}/);
  if (!m) throw new Error("No JSON");
  const data = JSON.parse(m[0]);
  const ts = new Date().toISOString().slice(0, 16).replace(/[T:]/g, "-");
  fs.writeFileSync(".claude/.reports/" + ts + "-issues.md", "# Issues Found\n\n" + (data.response || d));
  console.log("Issues saved for Claude Code to fix");
} catch (e) {
  console.error("Failed:", e.message);
  process.exit(1);
}
'

# Step 2: Claude Code processes .claude/.reports/*-issues.md items
```

### Research + Implementation Pattern

1. **Gemini researches** codebase patterns
2. **Claude Code implements** based on findings

```bash
# Gemini analyzes existing patterns, saves to report
gemini "Analyze error handling patterns used in this codebase" --all-files --output-format json 2>/dev/null | node -e '
const fs = require("fs");
const d = fs.readFileSync(0, "utf8");
try {
  const m = d.match(/{[\s\S]*}/);
  if (!m) throw new Error("No JSON");
  const data = JSON.parse(m[0]);
  const ts = new Date().toISOString().slice(0, 16).replace(/[T:]/g, "-");
  fs.writeFileSync(".claude/.reports/" + ts + "-patterns.md", "# Error Handling Patterns\n\n" + (data.response || d));
  console.log(data.response || "");
} catch (e) {
  console.error("Failed:", e.message);
  process.exit(1);
}
'
```

### Review + Refinement Pattern

1. **Claude Code generates** code
2. **Gemini reviews** with full context → saves to .reports
3. **Claude Code refines** based on feedback

```bash
# After Claude Code generates code, Gemini reviews
gemini "Review the recently added code for consistency with existing patterns" --all-files --output-format json 2>/dev/null | node -e '
const fs = require("fs");
const d = fs.readFileSync(0, "utf8");
try {
  const m = d.match(/{[\s\S]*}/);
  if (!m) throw new Error("No JSON");
  const data = JSON.parse(m[0]);
  const ts = new Date().toISOString().slice(0, 16).replace(/[T:]/g, "-");
  fs.writeFileSync(".claude/.reports/" + ts + "-review.md", "# Code Review\n\n" + (data.response || d));
  console.log(data.response || "");
} catch (e) {
  console.error("Failed:", e.message);
  process.exit(1);
}
'
```

## Best Practices

### 1. Use JSON Output with Node.js

Always use `--output-format json` with Node.js for reliable parsing:

```bash
gemini "Query" --output-format json 2>/dev/null | node -e '
const fs = require("fs");
const d = fs.readFileSync(0, "utf8");
const m = d.match(/{[\s\S]*}/);
console.log(m ? JSON.parse(m[0]).response : "");
'
```

### 2. Scope Context Appropriately

```bash
# Full codebase when needed
gemini "Find all usages of deprecated API" --all-files

# Specific directories for focused work
gemini "Review authentication logic" --include-directories src/auth

# Single file with attachment
gemini "Review this file" @src/auth.ts
```

### 3. Silent Fallback on Errors

If Gemini fails, Claude should silently use its own tools (Read, Glob, Grep, WebSearch) without mentioning the failure:

```bash
# Try Gemini with timeout, check exit code
timeout 30 gemini "Query" --output-format json 2>/dev/null
# If exit code != 0, Claude uses own tools silently (no error message to user)
```

### 4. Avoid Stateful Assumptions

Gemini CLI is stateless - each invocation is independent:

```bash
# Bad: assumes context
gemini "Now fix the issues"  # Doesn't know what issues

# Good: self-contained
gemini "Find and list all TODO comments" --all-files
```

### 5. Respect Rate Limits

Free tier: 60 req/min, 1,000 req/day

```bash
# Add delays in batch operations
node -e '
const files = ["file1.py", "file2.py"];
function sleep(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}
files.forEach((file, i) => {
  if (i > 0) sleep(1000);
  console.log("Analyzing:", file);
  // ... analysis
});
'
```

## Example: Full Integration Workflow

```bash
#!/bin/bash
# Codebase analysis workflow with report saving

# 1. Gemini scans for issues, saves to report
echo "Scanning codebase..."
gemini "List all potential bugs and security issues with file locations" --all-files --output-format json 2>/dev/null | node -e '
const fs = require("fs");
const d = fs.readFileSync(0, "utf8");
try {
  const m = d.match(/{[\s\S]*}/);
  if (!m) throw new Error("No JSON");
  const data = JSON.parse(m[0]);
  const ts = new Date().toISOString().slice(0, 16).replace(/[T:]/g, "-");
  fs.writeFileSync(".claude/.reports/" + ts + "-gemini-scan.md", "# Gemini Codebase Scan\n\n" + (data.response || d));
  console.log("Scan saved to .claude/.reports/" + ts + "-gemini-scan.md");
} catch (e) {
  console.error("Scan failed:", e.message);
  process.exit(1);
}
'

# 2. Gemini generates summary, saves to report
echo "Generating summary..."
gemini "Provide executive summary of code quality" --all-files --output-format json 2>/dev/null | node -e '
const fs = require("fs");
const d = fs.readFileSync(0, "utf8");
try {
  const m = d.match(/{[\s\S]*}/);
  if (!m) throw new Error("No JSON");
  const data = JSON.parse(m[0]);
  const ts = new Date().toISOString().slice(0, 16).replace(/[T:]/g, "-");
  fs.writeFileSync(".claude/.reports/" + ts + "-quality-summary.md", "# Code Quality Summary\n\n" + (data.response || d));
  console.log("Summary:", (data.response || "").substring(0, 200) + "...");
} catch (e) {
  console.error("Summary failed:", e.message);
  process.exit(1);
}
'

echo "Reports saved to .claude/.reports/"
```
