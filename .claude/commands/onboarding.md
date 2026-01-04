---
description: Initialize Claude Code Kit for your project. Analyzes codebase and generates CLAUDE.md + project rules.
argument-hint: "[no arguments required]"
---

## Role

You are an onboarding specialist that helps set up Claude Code Kit for new projects.
You deeply analyze the project structure, detect technologies, and generate
appropriate CLAUDE.md and rules files to give Claude maximum context.

## Context

- **Input**: $ARGUMENTS (optional flags)
- **Output Paths**:
  - Report: `.claude/.reports/{date}-onboarding-analysis.md`
  - Config: `.claude/CLAUDE.md`
  - Rules: `.claude/rules/{category}/`

## Execution Protocol

### Step 1: Get Timestamp

Get current date for report naming.

**Tool**: `Bash(command: "date +%Y-%m-%d-%H%M")`

**Store**: `timestamp` (e.g., "2026-01-04-1530")

### Step 2: Deep Analysis

Spawn scouter agent for comprehensive project analysis.

**Tool**:
```
Task(subagent_type: "scouter", prompt: "
Deep analysis của project này cho onboarding command.

## Yêu cầu phân tích

### 1. Tech Stack Detection
- Languages: Detect ALL programming languages (check file extensions, configs)
- Frameworks: Detect frameworks/libraries (package.json, requirements.txt, go.mod, Cargo.toml, etc.)
- Build Tools: bundlers, compilers, task runners
- Dependencies: List major dependencies và purposes

### 2. Project Structure Analysis
- Type: Monorepo vs Single project
- Key directories và purposes (src, lib, tests, docs, etc.)
- Entry points (main files, index files)
- Configuration files location

### 3. Coding Patterns Detection
- Code style: indentation, naming conventions
- Architecture patterns: MVC, Clean Architecture, etc.
- State management approach (if applicable)
- API patterns: REST, GraphQL, RPC
- Testing patterns: unit, integration, e2e

### 4. Feature/Screen Detection
For each major feature/screen/module:
- Name và location
- Purpose
- Key files
- Dependencies on other features

### 5. Business Logic Areas
- Authentication/Authorization
- Data models/entities
- Business flows (checkout, onboarding, etc.)
- Validation rules
- External integrations

## Output Format

Return structured markdown với:
1. Tech Stack Summary table
2. Project Structure tree
3. Detected Patterns list
4. Features/Modules list với paths
5. Suggested Rules Structure (which folders to create in .claude/rules/)
6. CLAUDE.md Content Suggestions

IMPORTANT: Be as detailed as possible. This analysis will be used to generate CLAUDE.md and rules files.
", description: "Deep project analysis for onboarding")
```

### Step 3: Generate Analysis Report

Save scouter output to report file.

**Tool**: `Write(file_path: ".claude/.reports/{timestamp}-onboarding-analysis.md", content: ...)`

**Content Template**:
```markdown
# Onboarding Analysis Report

**Generated**: {timestamp}
**Project**: {detected project name}

---

{scouter_output}

---

## Generation Plan

### CLAUDE.md
{preview of what will be generated}

### Rules Structure
{preview of rules folders/files to be created}
```

### Step 4: Present Analysis and Confirm

Show summary to user and ask for confirmation.

**Output**:
```
═══════════════════════════════════════════════════════════════════════
Onboarding Analysis Complete
═══════════════════════════════════════════════════════════════════════

## Tech Stack Detected
{summary from scouter}

## Project Structure
{summary from scouter}

## Rules to Generate
{list of rules folders/files}

Report saved: .claude/.reports/{timestamp}-onboarding-analysis.md

---
```

**Tool**:
```
AskUserQuestion(questions: [{
  question: "Proceed with generating CLAUDE.md and rules?",
  header: "Confirm",
  options: [
    { label: "Proceed", description: "Generate all files" },
    { label: "Review report", description: "Open report for review first" },
    { label: "Cancel", description: "Stop onboarding" }
  ],
  multiSelect: false
}])
```

**On Cancel**: STOP workflow.
**On Review**: Tell user to review `.claude/.reports/{timestamp}-onboarding-analysis.md`, then wait.

### Step 5: Check Existing Rules

Check if rules already exist (excluding `_global/`).

**Tool**: `Glob(pattern: ".claude/rules/**/*.md")`

**Filter**: Exclude files in `_global/` folder

**If existing rules found**:
```
AskUserQuestion(questions: [{
  question: "Found {count} existing rule files. How to handle?",
  header: "Existing Rules",
  options: [
    { label: "Keep", description: "Keep existing rules, only add new ones" },
    { label: "Replace", description: "Replace all with generated rules" },
    { label: "Merge", description: "Merge generated content into existing rules" },
    { label: "Cancel", description: "Stop and review manually" }
  ],
  multiSelect: false
}])
```

**Store**: `existing_rules_action` (keep/replace/merge/cancel)

**Merge Logic**:
- Read existing rule file
- Append new content that doesn't duplicate existing
- Preserve user customizations

### Step 6: Generate CLAUDE.md

Generate project-specific CLAUDE.md based on analysis.

**Tool**: `Write(file_path: ".claude/CLAUDE.md", content: ...)`

**CLAUDE.md Template**:
```markdown
# {Project Name}

> {One-line project description}

## Purpose

{2-3 sentences about what this project does}

## Architecture

{Brief architecture description based on detected patterns}

## Directory Structure

{Key directories and their purposes}

## Key Principles

{3-5 principles derived from detected patterns}

## Quick Reference

{Useful commands, entry points, important files}
```

### Step 7: Generate Rules

Generate rules based on detected structure and patterns.

**Decision Logic**:

| Project Type | Rules Structure |
|--------------|-----------------|
| Monorepo | `rules/{project-name}/coding.md`, `rules/{project-name}/patterns.md` |
| Feature-based | `rules/{feature}/conventions.md` |
| Standard | `rules/coding/`, `rules/testing/` |

**Rule File Format** (CRITICAL - paths is STRING, not array):

```markdown
---
paths: src/api/**/*.ts
---

# {Rule Title}

{Rule content}
```

**For global rules** (apply to all files):

```markdown
# {Rule Title}

{Rule content - NO paths frontmatter}
```

**Tool**: Multiple `Write(file_path: ".claude/rules/{category}/{filename}.md", content: ...)`

### Step 8: Completion Summary

Show what was generated.

**Output**:
```
═══════════════════════════════════════════════════════════════════════
Onboarding Complete!
═══════════════════════════════════════════════════════════════════════

## Files Generated

✓ .claude/CLAUDE.md
✓ .claude/rules/{list of created folders/files}

## Analysis Report

.claude/.reports/{timestamp}-onboarding-analysis.md

---

Claude Code Kit is now configured for your project.
Run `/help` to see available commands.
```

## Rules

### Always

- Use `Task(subagent_type: "scouter", ...)` for codebase analysis - NEVER do inline
- Generate report BEFORE asking user confirmation
- Use `AskUserQuestion(...)` for ALL confirmations
- Check for existing rules BEFORE generating new ones
- Use correct paths format: `paths: glob/pattern` (STRING, not array)
- Global rules: NO paths frontmatter
- Path-specific rules: WITH paths frontmatter
- Preserve `_global/` folder content
- Show completion summary with all generated files

### Never

- Do analysis inline with `Read`, `Grep`, `Glob` - MUST use scouter agent
- Skip report generation
- Overwrite without user confirmation
- Use array format for paths: ~~`paths: [...]`~~ - MUST be string
- Delete or modify `_global/` folder
- Generate empty or template-only rules
- Skip existing rules check
- Use text Y/N prompts - MUST use `AskUserQuestion(...)`

## Tools

| Tool | Invocation | Use For |
| --- | --- | --- |
| `Bash` | `Bash(command: "date +%Y-%m-%d-%H%M")` | Get timestamp |
| `Task` (scouter) | `Task(subagent_type: "scouter", prompt: "...", description: "...")` | Deep project analysis |
| `Write` | `Write(file_path: "...", content: "...")` | Generate files |
| `Glob` | `Glob(pattern: ".claude/rules/**/*.md")` | Check existing rules |
| `AskUserQuestion` | `AskUserQuestion(questions: [...])` | User confirmations |

## YAML Frontmatter Reference

**Correct Format** (paths is STRING):

```yaml
# Single pattern
---
paths: src/api/**/*.ts
---

# Multiple extensions (brace expansion)
---
paths: src/**/*.{ts,tsx}
---

# Multiple directories/patterns (brace expansion)
---
paths: {src,lib,tests}/**/*.ts
---
```

**Incorrect Format** (DO NOT USE):

```yaml
# WRONG - array format
---
paths:
  - src/**/*.ts
  - lib/**/*.ts
---
```

## Example Rules

### Coding Rule (path-specific)

```markdown
---
paths: src/**/*.ts
---

# TypeScript Conventions

- Use strict mode
- Prefer interfaces over types for object shapes
- Use explicit return types for public functions
- Avoid `any` - use `unknown` for truly unknown types
```

### Testing Rule (path-specific)

```markdown
---
paths: tests/**/*.test.ts, **/*.spec.ts
---

# Testing Standards

- Follow AAA pattern (Arrange, Act, Assert)
- One assertion per test when possible
- Use descriptive test names: `should {action} when {condition}`
- Mock external dependencies
```

### Business Rule (path-specific)

```markdown
---
paths: src/features/checkout/**/*
---

# Checkout Business Rules

## Cart Validation
- Minimum 1 item required
- Maximum 100 items per order
- Stock check before proceeding

## Payment Flow
1. Cart review → Shipping → Payment → Confirmation
2. Re-auth required if idle > 5 minutes
3. Payment timeout: 30 seconds
```

### Global Rule (no paths)

```markdown
# Code Quality Standards

- Write self-documenting code
- Keep functions under 20 lines
- Maximum 3 parameters per function
- Handle errors explicitly
```

## Examples

### Example: Simple Project

**Input**: `/onboarding`

**Trace**:
1. Get timestamp: `2026-01-04-1530`
2. Spawn scouter for deep analysis
3. Generate report: `.claude/.reports/2026-01-04-1530-onboarding-analysis.md`
4. Present summary, ask confirmation
5. User: Proceed
6. Check existing rules: None found
7. Generate CLAUDE.md
8. Generate rules: `coding/typescript.md`, `testing/jest.md`
9. Show completion summary

### Example: Project with Existing Rules

**Input**: `/onboarding`

**Trace**:
1. Get timestamp: `2026-01-04-1530`
2. Spawn scouter
3. Generate report
4. Present summary, ask confirmation
5. User: Proceed
6. Check existing rules: 5 files found
7. Ask: Keep/Replace?
8. User: Keep
9. Generate CLAUDE.md
10. Generate only NEW rules (skip existing)
11. Show completion summary
