# Gemini CLI Automation Examples

## Table of Contents

- [Node.js JSON Parser](#nodejs-json-parser)
- [Basic Patterns](#basic-patterns)
- [Image Analysis](#image-analysis)
- [Code Analysis](#code-analysis)
- [Git Integration](#git-integration)
- [File Processing](#file-processing)
- [Saving Reports](#saving-reports)
- [Error Handling](#error-handling)

## Node.js JSON Parser

Safe pattern for extracting response (handles empty/malformed output):

```bash
# Reusable parser (single quotes for bash safety)
node -e '
const fs = require("fs");
const d = fs.readFileSync(0, "utf8");
const m = d.match(/{[\s\S]*}/);
console.log(m ? JSON.parse(m[0]).response : "");
'
```

## Basic Patterns

### Simple query with JSON output

```bash
gemini "Explain Docker containers" --output-format json 2>/dev/null | node -e '
const fs = require("fs");
const d = fs.readFileSync(0, "utf8");
const m = d.match(/{[\s\S]*}/);
console.log(m ? JSON.parse(m[0]).response : "");
'
```

### Pipe content for analysis

```bash
cat src/auth.py | gemini "Review for security issues" --output-format json 2>/dev/null | node -e '
const fs = require("fs");
const d = fs.readFileSync(0, "utf8");
const m = d.match(/{[\s\S]*}/);
console.log(m ? JSON.parse(m[0]).response : "");
'
```

### Save output to file

```bash
gemini "Generate API documentation" --output-format json 2>/dev/null | node -e '
const fs = require("fs");
const d = fs.readFileSync(0, "utf8");
try {
  const m = d.match(/{[\s\S]*}/);
  if (!m) throw new Error("No JSON");
  const r = JSON.parse(m[0]).response;
  fs.writeFileSync("api-docs.md", r || d);
  console.log("Saved to api-docs.md");
} catch (e) {
  console.error("Failed:", e.message);
  process.exit(1);
}
'
```

## Image Analysis

### Describe an image

```bash
gemini "Describe this image in detail" @screenshot.png
```

### Analyze UI screenshot

```bash
gemini "Analyze this UI. List all elements and suggest improvements." @ui.png
```

### Image with JSON output

```bash
gemini "What text is visible in this image?" @photo.jpg --output-format json 2>/dev/null | node -e '
const fs = require("fs");
const d = fs.readFileSync(0, "utf8");
const m = d.match(/{[\s\S]*}/);
console.log(m ? JSON.parse(m[0]).response : "");
'
```

## Code Analysis

### Security review

```bash
cat "$file" | gemini "Review for security vulnerabilities. List issues with severity."
```

### Bug detection

```bash
gemini "Scan for potential bugs and anti-patterns" --all-files
```

### Code explanation

```bash
cat complex_function.py | gemini "Explain this code step by step"
```

### With file attachment

```bash
gemini "Review this code for issues" @src/main.py
```

## Git Integration

### Generate commit message

```bash
git diff --cached | gemini "Write a concise commit message following conventional commits format"
```

### PR description

```bash
git diff origin/main...HEAD | gemini "Write a pull request description with summary and test plan"
```

### Review changes

```bash
git diff | gemini "Review for bugs, security issues, and code quality"
```

### Release notes

```bash
git log --oneline v1.0.0..HEAD | gemini "Generate release notes from these commits"
```

## File Processing

### Summarize documentation

```bash
cat README.md | gemini "Create a one-paragraph summary"
```

### Generate tests

```bash
cat src/utils.ts | gemini "Generate unit tests for these functions using Jest"
```

### With file attachment

```bash
gemini "Summarize this documentation" @README.md
```

## Saving Reports

### Save to .claude/.reports with timestamp

```bash
gemini "Analyze codebase architecture" --all-files --output-format json 2>/dev/null | node -e '
const fs = require("fs");
const d = fs.readFileSync(0, "utf8");
try {
  const m = d.match(/{[\s\S]*}/);
  if (!m) throw new Error("No JSON");
  const data = JSON.parse(m[0]);
  const ts = new Date().toISOString().slice(0, 16).replace(/[T:]/g, "-");
  const path = ".claude/.reports/" + ts + "-architecture.md";
  fs.writeFileSync(path, "# Architecture Analysis\n\n" + (data.response || d));
  console.log("Saved:", path);
} catch (e) {
  console.error("Failed:", e.message);
  process.exit(1);
}
'
```

### Security scan with report

```bash
gemini "Find security vulnerabilities" --all-files --output-format json 2>/dev/null | node -e '
const fs = require("fs");
const d = fs.readFileSync(0, "utf8");
try {
  const m = d.match(/{[\s\S]*}/);
  if (!m) throw new Error("No JSON");
  const data = JSON.parse(m[0]);
  const ts = new Date().toISOString().slice(0, 16).replace(/[T:]/g, "-");
  const path = ".claude/.reports/" + ts + "-security-scan.md";
  fs.writeFileSync(path, "# Security Scan Report\n\n" + (data.response || d));
  console.log("Report saved:", path);
  console.log(data.response || "");
} catch (e) {
  console.error("Failed:", e.message);
  process.exit(1);
}
'
```

### Batch analysis with combined report

```bash
node -e '
const { spawnSync } = require("child_process");
const fs = require("fs");
const files = fs.readdirSync("src").filter(f => f.endsWith(".py"));
let report = "# Batch Code Analysis\n\n";

files.forEach(file => {
  console.log("Analyzing:", file);
  try {
    const result = spawnSync("gemini", [
      "Find issues in this code",
      "@src/" + file,
      "--output-format", "json"
    ], { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] });
    const m = (result.stdout || "").match(/{[\s\S]*}/);
    if (m) {
      const data = JSON.parse(m[0]);
      report += "## " + file + "\n\n" + (data.response || "No issues found") + "\n\n";
    } else {
      report += "## " + file + "\n\nNo response\n\n";
    }
  } catch (e) {
    report += "## " + file + "\n\nError: " + e.message + "\n\n";
  }
});

const ts = new Date().toISOString().slice(0, 16).replace(/[T:]/g, "-");
fs.writeFileSync(".claude/.reports/" + ts + "-batch-analysis.md", report);
console.log("Report saved");
'
```

## Error Handling

### Safe JSON parsing with Node.js

```bash
gemini "Query" --output-format json 2>/dev/null | node -e '
const fs = require("fs");
const d = fs.readFileSync(0, "utf8");
try {
  const m = d.match(/{[\s\S]*}/);
  console.log(m ? JSON.parse(m[0]).response || "No response" : "Empty");
} catch (e) {
  console.error("Parse failed:", e.message);
  process.exit(1);
}
'
```

### With timeout (Unix/macOS)

```bash
timeout 60 bash -c 'gemini "Complex analysis" --output-format json 2>/dev/null | node -e "
const fs = require(\"fs\");
const d = fs.readFileSync(0, \"utf8\");
const m = d.match(/{[\\s\\S]*}/);
console.log(m ? JSON.parse(m[0]).response : \"\");
"' || echo "Timed out"
```

### Check exit code

```bash
if gemini "Analyze code" --output-format json 2>/dev/null | node -e '
const fs = require("fs");
const d = fs.readFileSync(0, "utf8");
try {
  const m = d.match(/{[\s\S]*}/);
  if (!m) throw new Error("No JSON");
  console.log(JSON.parse(m[0]).response);
} catch (e) {
  process.exit(1);
}
'; then
  echo "Success"
else
  echo "Gemini CLI failed"
  exit 1
fi
```
