---
description: Initialize Claude Code Kit for your project. Analyzes codebase and generates CLAUDE.md + project rules.
argument-hint: "[no arguments required]"
---

## Thinking Mode

**ULTRATHINK**: Use extended thinking for this command. Think deeply and thoroughly before each action. Analyze project structure comprehensively, detect patterns accurately, and reason through rule generation carefully.

## Role

You are an onboarding specialist that helps set up Claude Code Kit for new projects.
You deeply analyze the project structure, detect technologies, and generate
appropriate CLAUDE.md and rules files to give Claude maximum context.

## Context

- **Input**: $ARGUMENTS (optional flags)
- **Output Paths**:
  - Report: `.claude/.reports/onboarding-scout.md`
  - Config: `.claude/CLAUDE.md`
  - Rules: `.claude/rules/{category}/`
- **Report Skill**: Use `Skill(skill: "report")` templates at `.claude/skills/report/templates/`

## Execution Protocol

### Step 0: Initialize Todo List

Create todo list to track onboarding progress.

**Tool**:
```
TodoWrite(todos: [
  { content: "Get timestamp", status: "pending", activeForm: "Getting timestamp" },
  { content: "Analyze project structure", status: "pending", activeForm: "Analyzing project structure" },
  { content: "Generate scout report", status: "pending", activeForm: "Generating scout report" },
  { content: "Confirm with user", status: "pending", activeForm: "Confirming with user" },
  { content: "Check existing rules", status: "pending", activeForm: "Checking existing rules" },
  { content: "Generate CLAUDE.md", status: "pending", activeForm: "Generating CLAUDE.md" },
  { content: "Generate rules", status: "pending", activeForm: "Generating rules" },
  { content: "Show completion summary", status: "pending", activeForm: "Showing completion summary" }
])
```

---

### Step 1: Get Timestamp

**Todo**: Mark "Get timestamp" as `in_progress`

Get current date for report naming.

**Tool**: `Bash(command: "date +%Y-%m-%d-%H%M")`

**Store**: `timestamp` (e.g., "2026-01-04-1530")

**Todo**: Mark "Get timestamp" as `completed`

---

### Step 2: Deep Analysis

**Todo**: Mark "Analyze project structure" as `in_progress`

**Scaling**: Check `cck.json` → `workflow.maxInstances` for limits (default: 3 scouters).

**Quick Assessment First**:
```
Glob(pattern: "**/*")  # Count total files
Glob(pattern: "{package.json,requirements.txt,go.mod,Cargo.toml,pom.xml}")  # Detect tech stacks
```

**Scaling Decision**:

| Project Size | Criteria | Scouters |
|--------------|----------|----------|
| Small | < 100 files, single tech stack | 1 |
| Medium | 100-500 files, or 2-3 tech stacks | 2 |
| Large | > 500 files, or monorepo | up to maxInstances |

**For Small Projects** (single scouter):
```
Task(subagent_type: "scouter", prompt: "...", description: "Full project analysis")
```

**For Medium/Large Projects** (multiple scouters in parallel):
```
# Divide analysis by focus area
s1 = Task(subagent_type: "scouter", prompt: "
Analyze TECH STACK và DEPENDENCIES for onboarding:
- Languages, frameworks, build tools
- All config files (package.json, tsconfig, etc.)
- External dependencies và versions
", description: "Tech stack analysis", run_in_background: true)

s2 = Task(subagent_type: "scouter", prompt: "
Analyze PROJECT STRUCTURE và PATTERNS for onboarding:
- Directory organization
- Architecture patterns (MVC, Clean, etc.)
- Coding conventions
- Entry points
", description: "Structure analysis", run_in_background: true)

s3 = Task(subagent_type: "scouter", prompt: "
Analyze FEATURES và BUSINESS LOGIC for onboarding:
- Major features/modules
- Business flows
- Data models/entities
- Integration points
", description: "Features analysis", run_in_background: true)

# Wait for ALL scouters
s1_result = TaskOutput(task_id: s1, block: true)
s2_result = TaskOutput(task_id: s2, block: true)
s3_result = TaskOutput(task_id: s3, block: true)
```

**Scouter Prompt Template** (for single scouter or when adapting):
```
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
```

**Todo**: Mark "Analyze project structure" as `completed`

---

### Step 3: Generate Scout Report

**Todo**: Mark "Generate scout report" as `in_progress`

Synthesize scouter output(s) using report skill template.

**CRITICAL**: If multiple scouters were spawned, MUST merge all outputs before writing report.

**Synthesis Process** (when multiple scouters):
1. **Collect all outputs** - Wait for all TaskOutput results
2. **Remove duplicates** - Same findings from different scouters
3. **Resolve conflicts** - If scouters disagree, use most specific finding
4. **Organize by theme** - Group into Tech Stack, Structure, Features, etc.

**Reference**: `Skill(skill: "report")` - use scout template at `.claude/skills/report/templates/scout.md`

**Tool**: `Write(file_path: ".claude/.reports/onboarding-scout.md", content: ...)`

**Content** (follow scout template structure):
```markdown
# Scout Report: Project Onboarding

**Generated**: {timestamp từ `date +"%Y-%m-%d %H:%M"`}
**Type**: Codebase Analysis
**Scope**: Full project analysis
**Files Analyzed**: {count}

---

## Summary

[2-3 câu overview về project structure và tech stack]

---

## Architecture & Structure

### Directory Organization

```
project/
├── src/           # [purpose]
├── tests/         # [purpose]
└── ...
```

### Design Patterns

- **[Pattern]**: `location` - [how used]

---

## Key Files

| File | Purpose | Notes |
|------|---------|-------|
| `path/file:line` | [Purpose] | [Key observations] |

---

## Dependencies

### External

| Package | Purpose | Version |
|---------|---------|---------|
| `pkg` | [Purpose] | x.y.z |

---

## Generation Plan

### CLAUDE.md
{preview of what will be generated}

### Rules Structure
{preview of rules folders/files to be created}

---

## Unresolved Questions

- [Questions cần investigate thêm]
```

**Todo**: Mark "Generate scout report" as `completed`

---

### Step 4: Present Analysis and Confirm

**Todo**: Mark "Confirm with user" as `in_progress`

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

Report saved: .claude/.reports/onboarding-scout.md

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

**On Cancel**: Mark all todos as `completed` (cancelled), then STOP workflow.
**On Review**: Tell user to review `.claude/.reports/onboarding-scout.md`, then wait.

**Todo**: Mark "Confirm with user" as `completed`

---

### Step 5: Check Existing Rules

**Todo**: Mark "Check existing rules" as `in_progress`

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

**Todo**: Mark "Check existing rules" as `completed`

---

### Step 6: Generate CLAUDE.md

**Todo**: Mark "Generate CLAUDE.md" as `in_progress`

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

**Todo**: Mark "Generate CLAUDE.md" as `completed`

---

### Step 7: Generate Rules

**Todo**: Mark "Generate rules" as `in_progress`

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

**Todo**: Mark "Generate rules" as `completed`

---

### Step 8: Completion Summary

**Todo**: Mark "Show completion summary" as `in_progress`

Show what was generated.

**Output**:
```
═══════════════════════════════════════════════════════════════════════
Onboarding Complete!
═══════════════════════════════════════════════════════════════════════

## Files Generated

✓ .claude/CLAUDE.md
✓ .claude/rules/{list of created folders/files}

## Scout Report

.claude/.reports/onboarding-scout.md

---

Claude Code Kit is now configured for your project.
Run `/help` to see available commands.
```

**Todo**: Mark "Show completion summary" as `completed`

**Final**: Clear todo list
```
TodoWrite(todos: [])
```

## Rules

### Always

- **Initialize todo list at Step 0** - Track all 8 steps
- **Mark todo `in_progress` at step START** - Before any work
- **Mark todo `completed` at step END** - After work done
- **Clear todo list on completion** - `TodoWrite(todos: [])`
- Use `Task(subagent_type: "scouter", ...)` for codebase analysis - NEVER do inline
- **Scale scouters based on project size** - Check file count and tech stacks first
- **Wait for ALL scouters** before proceeding - Use `TaskOutput(block: true)`
- **Merge multiple scouter outputs** into single synthesized report
- Generate report BEFORE asking user confirmation
- Use `AskUserQuestion(...)` for ALL confirmations
- Check for existing rules BEFORE generating new ones
- Use correct paths format: `paths: glob/pattern` (STRING, not array)
- Global rules: NO paths frontmatter
- Path-specific rules: WITH paths frontmatter
- Preserve `_global/` folder content
- Show completion summary with all generated files

### Never

- **Skip TodoWrite at step transitions** - MUST track progress
- Do analysis inline with `Read`, `Grep`, `Glob` - MUST use scouter agent
- **Proceed before ALL scouters complete** - Always block until done
- **Create separate reports per scouter** - MUST synthesize into ONE report
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
| `TodoWrite` | `TodoWrite(todos: [...])` | Track progress through steps |
| `Bash` | `Bash(command: "date +\"%Y-%m-%d %H:%M\"")` | Get timestamp |
| `Glob` | `Glob(pattern: "**/*")` | Quick file count for scaling decision |
| `Task` (scouter) | `Task(subagent_type: "scouter", prompt: "...", description: "...", run_in_background: true)` | Deep project analysis (parallel) |
| `TaskOutput` | `TaskOutput(task_id: scouter_id, block: true)` | Wait for scouter completion |
| `Skill` (report) | `Skill(skill: "report")` | Report synthesis templates |
| `Write` | `Write(file_path: "...", content: "...")` | Generate files |
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

### Example: Small Project (< 100 files)

**Input**: `/onboarding`

**Trace**:
1. **Step 0**: `TodoWrite` - Initialize 8 todos (all pending)
2. **Step 1**: Mark "Get timestamp" → `in_progress` → get date → `completed`
3. **Step 2**: Mark "Analyze project structure" → `in_progress`
   - Quick assessment: 50 files, 1 tech stack (Node.js)
   - Spawn 1 scouter for full analysis
   - Wait for scouter completion
   - Mark → `completed`
4. **Step 3**: Mark "Generate scout report" → `in_progress`
   - Write `.claude/.reports/onboarding-scout.md`
   - Mark → `completed`
5. **Step 4**: Mark "Confirm with user" → `in_progress`
   - Present summary, ask confirmation
   - User: Proceed
   - Mark → `completed`
6. **Step 5**: Mark "Check existing rules" → `in_progress`
   - None found
   - Mark → `completed`
7. **Step 6**: Mark "Generate CLAUDE.md" → `in_progress` → write → `completed`
8. **Step 7**: Mark "Generate rules" → `in_progress`
   - Generate `coding/typescript.md`, `testing/jest.md`
   - Mark → `completed`
9. **Step 8**: Mark "Show completion summary" → `in_progress` → show → `completed`
10. **Final**: `TodoWrite(todos: [])` - Clear list

### Example: Large Project (> 500 files)

**Input**: `/onboarding`

**Trace**:
1. **Step 0**: `TodoWrite` - Initialize 8 todos
2. **Step 1**: Get timestamp → `completed`
3. **Step 2**: "Analyze project structure" → `in_progress`
   - Quick assessment: 1200 files, 3 tech stacks
   - Spawn 3 scouters in parallel (s1, s2, s3)
   - Wait ALL: `TaskOutput(block: true)` × 3
   - Mark → `completed`
4. **Step 3**: "Generate scout report" → `in_progress`
   - Synthesize 3 outputs → single merged report
   - Write `.claude/.reports/onboarding-scout.md`
   - Mark → `completed`
5. **Step 4-8**: Continue with todo tracking...
6. **Final**: Clear todo list

### Example: Project with Existing Rules

**Input**: `/onboarding`

**Trace**:
1. **Step 0**: `TodoWrite` - Initialize todos
2. **Steps 1-4**: Execute with todo tracking...
3. **Step 5**: "Check existing rules" → `in_progress`
   - Found 5 files
   - Ask: Keep/Replace/Merge?
   - User: Keep
   - Mark → `completed`
4. **Step 6**: Generate CLAUDE.md
5. **Step 7**: Generate only NEW rules (skip existing)
6. **Step 8**: Show summary
7. **Final**: Clear todo list
