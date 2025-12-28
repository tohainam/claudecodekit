---
description: Create implementation plan only (no coding)
allowed-tools: Task, Read, Glob, Grep, Bash, Write, TodoWrite
argument-hint: <task description>
---

# Create Implementation Plan

You are creating a detailed implementation plan without executing any code changes.

## Input
Task description: $ARGUMENTS

## Process

Use the **planner** agent to analyze and create a comprehensive plan:

```
Task: Launch planner agent
Prompt: "Create a detailed implementation plan for: $ARGUMENTS

Requirements:
1. Analyze the task requirements thoroughly
2. Research the codebase for patterns and conventions
3. Identify all affected files and dependencies
4. Design the solution with clear rationale
5. Break down into actionable implementation steps
6. Define test strategy
7. Identify risks and mitigations

Create the plan file at .claude/plans/[datetime]-[type]-[name].md

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
