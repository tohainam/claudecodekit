# Scout Report: Onboarding Command

**Generated**: 2026-01-04 15:37
**Type**: Codebase Analysis
**Scope**: CCK Commands và Skills Patterns

---

## Executive Summary

CCK commands tuân theo markdown-based architecture với YAML frontmatter cho metadata, structured execution protocols, và heavy use của `AskUserQuestion` cho user confirmations. Commands delegate complex analysis cho subagents (scouter, researcher, reviewer) qua `Task()` tool và dùng `Write/Edit` tools cho file generation.

---

## CCK Command Patterns

### Command File Format

Commands là markdown files trong `.claude/commands/` với structure:

```markdown
---
description: [Short description shown in command list]
argument-hint: [Usage hint like "[workflow] [name]"]
---

## Role
[Who Claude is acting as]

## Context
- **Input**: $ARGUMENTS
- **Output Path**: [Where artifacts go]

## Execution Protocol
### Step 1: [Phase Name]
[Actions with tool invocations]

## Rules
### Always
- [Required behaviors]

### Never
- [Prohibited behaviors]

## Tools
| Tool | Invocation | Use For |
| --- | --- | --- |

## Examples
### Example: [Scenario]
**Input**: ...
**Trace**: ...
```

### Agent Invocation Pattern

```
| Agent        | Purpose                                                        | Invocation                                                             |
| ------------ | -------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `scouter`    | Codebase analysis, pattern detection, dependency mapping       | `Task(subagent_type: "scouter", prompt: "...", description: "...")`    |
| `researcher` | External documentation, best practices, technology comparisons | `Task(subagent_type: "researcher", prompt: "...", description: "...")` |
| `reviewer`   | Code review with isolated/fresh context for unbiased analysis  | `Task(subagent_type: "reviewer", prompt: "...", description: "...")`   |
```

**Parallel agent pattern:**

```
# 1. Spawn agents in parallel
scouter = Task(subagent_type: "scouter", prompt: "...", run_in_background: true)

# 2. Wait for ALL agents (blocking)
TaskOutput(task_id: scouter, block: true)

# 3. Generate reports
Write(".reports/{name}-scout.md", merged_results)
```

**Critical rules:**
- NEVER làm scouter work inline (Read, Grep, Glob) - spawn agent
- NEVER làm researcher work inline (WebSearch, WebFetch) - spawn agent
- ALWAYS wait for ALL agents trước khi proceed

### User Confirmation Pattern

```
AskUserQuestion(questions: [{
  question: "Analysis complete. Summary: {summary}. Proceed with generation?",
  header: "Confirm",
  options: [
    { label: "Proceed", description: "Generate CLAUDE.md and rules" },
    { label: "Review report", description: "Open report for review first" },
    { label: "Cancel", description: "Stop onboarding" }
  ],
  multiSelect: false
}])
```

**Common confirmation points:**
1. **Research/Scout findings** - Confirm before proceeding
2. **Phase completion** - Proceed/Redo/Cancel options
3. **Existing file handling** - Keep/Replace/Merge
4. **Commit preview** - Commit/Edit/Skip

**Rules:**
- Use `AskUserQuestion(questions: [...])` for ALL confirmations
- NEVER use text-based Y/N prompts

### File Generation Pattern

```
Write(file_path: ".claude/.specs/{name}.md", content: template)
Write(file_path: ".claude/.reports/{name}-{type}.md", content: report)
```

**Artifact paths:**
- Reports: `.claude/.reports/{name}-{type}.md`
- Configs: `.claude/CLAUDE.md`
- Rules: `.claude/rules/{category}/`

---

## Recommended Pattern for /onboarding

### Command Structure

```markdown
---
description: Initialize Claude Code Kit for your project. Analyzes codebase and generates CLAUDE.md + project rules.
argument-hint: [optional flags]
---

## Role
You are an onboarding specialist...

## Context
- **Input**: $ARGUMENTS
- **Output Paths**:
  - Report: `.claude/.reports/{date}-onboarding-analysis.md`
  - Config: `.claude/CLAUDE.md`
  - Rules: `.claude/rules/{category}/`

## Execution Protocol

### Step 1: Deep Analysis
Task(subagent_type: "scouter", prompt: "Deep analysis...", description: "Project analysis")

### Step 2: Generate Report
Write(file_path: ".claude/.reports/{date}-onboarding-analysis.md", content: report)

### Step 3: Confirm with User
AskUserQuestion(...)

### Step 4: Handle Existing Rules
IF existing_rules:
  AskUserQuestion(Keep/Replace/Merge)

### Step 5: Generate Files
Write(file_path: ".claude/CLAUDE.md", content: generated_claude_md)
Write(file_path: ".claude/rules/{category}/{rule}.md", content: generated_rule)

### Step 6: Complete
Display completion summary

## Rules
### Always
- Use scouter agent for analysis - NEVER inline
- Use AskUserQuestion for ALL confirmations
- Generate report BEFORE asking to proceed
- Check for existing rules BEFORE generating

### Never
- Overwrite without confirmation
- Skip report generation
```

### Scouter Prompt Should Request:

- Languages and frameworks detected
- Project structure (monorepo vs single)
- Key directories and their purposes
- Dependencies (package.json, requirements.txt, etc.)
- Coding patterns and conventions
- Feature/screen boundaries for business rules

### Execution Flow

```
/onboarding
    │
    ▼
┌─────────────────────────┐
│ 1. Spawn scouter agent  │
│    (deep project scan)  │
└───────────┬─────────────┘
            ▼
┌─────────────────────────┐
│ 2. Generate report      │
│    (.reports/{date}...) │
└───────────┬─────────────┘
            ▼
┌─────────────────────────┐
│ 3. AskUserQuestion:     │
│    "Proceed?"           │
└───────────┬─────────────┘
            ▼
┌─────────────────────────┐
│ 4. Check existing rules │
│    If exist → Ask user  │
└───────────┬─────────────┘
            ▼
┌─────────────────────────┐
│ 5. Write CLAUDE.md      │
│    Write rules/*.md     │
└───────────┬─────────────┘
            ▼
┌─────────────────────────┐
│ 6. Show completion      │
└─────────────────────────┘
```

---

## Key Files Reference

| File | Purpose |
| --- | --- |
| `.claude/commands/run.md` | Workflow orchestrator - most comprehensive |
| `.claude/commands/brainstorm.md` | Interactive spec refinement |
| `.claude/agents/scouter.md` | Codebase analysis agent |
| `.claude/agents/researcher.md` | External research agent |

---

## Issues & Recommendations

### Improvements for /onboarding:

1. Consider adding `--dry-run` flag để preview without writing
2. Add progress indicators cho long-running scouter analysis
3. Consider `--force` flag để skip confirmations for CI/CD use cases
