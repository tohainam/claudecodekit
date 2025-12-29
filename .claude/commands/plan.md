---
description: Create implementation plan only (no coding)
allowed-tools: Task, Read, Glob, Grep, Bash, Write, TodoWrite
argument-hint: <task description>
---

# Create Implementation Plan

You are creating a detailed implementation plan without executing any code changes.

## Input
Task description: $ARGUMENTS

**Optional**: `--discussion <path>` to reference a prior discussion for context.

## Process

### Step 0: Check for Prior Context
Before planning, check for related discussions, decisions, and scout reports:

1. If `--discussion <path>` is provided, read that discussion file
2. Otherwise, search `.claude/.discussions/` for related topics
3. Extract requirements, acceptance criteria, and selected approach from discussions
4. Reference any related ADRs from `.claude/.decisions/`
5. Check `.claude/.reports/` for existing scout reports on related code

```bash
# Check for related context
ls -la .claude/.discussions/ 2>/dev/null
ls -la .claude/.decisions/ 2>/dev/null
ls -la .claude/.reports/ 2>/dev/null
```

### Step 1: Create Plan

Use Task tool with **planner** agent to analyze and create a comprehensive plan:

```
Task: Launch planner agent
Prompt: "Create a detailed implementation plan for: $ARGUMENTS

Requirements:
1. Check .claude/.discussions/ for related discussions
2. Check .claude/.decisions/ for related ADRs
3. Check .claude/.reports/ for existing scout reports
4. Analyze the task requirements thoroughly
5. Research the codebase for patterns and conventions
6. Identify all affected files and dependencies
7. Design the solution with clear rationale
8. Break down into actionable implementation steps
9. Define test strategy
10. Identify risks and mitigations

Create the plan file at .claude/.plans/[datetime]-[type]-[name].md

Important:
- Select ONE approach with clear reasoning (no multiple options)
- Keep under 500 lines (split if larger)
- All steps must be actionable (verb + noun)
- Include file:line references where relevant"

Subagent: planner
```

## Output

The planner will create a plan file. After completion:

1. Report the plan file location
2. Provide a brief summary of the plan
3. Highlight any risks or concerns identified
4. Note if the plan should be split into sub-plans

## Next Steps

After plan is created, user can:
- Review and edit the plan file directly
- Approve and run `/implement` to execute the plan
- Request changes and run `/plan` again
