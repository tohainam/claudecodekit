---
description: Execute an existing implementation plan
allowed-tools: Task, Read, Glob, Grep, Bash, Edit, Write, TodoWrite, AskUserQuestion
argument-hint: [plan-file-path]
---

# Execute Implementation Plan

You are executing an approved implementation plan.

## Input
Plan file path (optional): $ARGUMENTS

If no path provided, look for the most recent plan file in `.claude/.plans/`.

## Process

### Step 1: Load Plan
1. Find and read the plan file
2. Verify plan status is "approved" or user confirms to proceed
3. Parse implementation steps

### Step 2: Create Todo List (CRITICAL)
**You (the parent session) MUST create the todo list yourself before launching the implementer agent.**

The implementer subagent has its own isolated context. Its TodoWrite calls do NOT sync to the main Claude Code visible todos. You must:

1. Extract all implementation steps from the plan file
2. Use TodoWrite to create todos based on plan steps:
   ```
   TodoWrite([
     { content: "Step 1: [description from plan]", status: "pending", activeForm: "Implementing step 1" },
     { content: "Step 2: [description from plan]", status: "pending", activeForm: "Implementing step 2" },
     ...
   ])
   ```
3. Keep this list visible to the user throughout implementation

### Step 3: Execute
Use Task tool with **implementer** agent to execute the plan:

```
Task: Launch implementer agent
Prompt: "Execute the implementation plan at: [plan-file-path]

Process:
1. Read the plan file completely
2. For each implementation step:
   a. Read the step details
   b. Implement the changes
   c. Run lint/typecheck
   d. Update the checkbox: [ ] -> [x]
   e. Report: '✅ Step N: [description]'
3. Update Progress Tracking section in plan

If blocked:
- STOP immediately
- Document the blocker in the plan
- Report the issue and propose alternatives
- Wait for user decision"

Subagent: implementer
```

### Step 4: Update Todos (CRITICAL)
After implementer returns, **you MUST update the main session's todos**:

1. Parse the implementer's completion report
2. For each completed step, mark the corresponding todo as completed:
   ```
   TodoWrite([
     { content: "Step 1: [description]", status: "completed", activeForm: "..." },
     { content: "Step 2: [description]", status: "completed", activeForm: "..." },
     { content: "Step 3: [description]", status: "in_progress", activeForm: "..." },  // if still working
     ...
   ])
   ```
3. If implementer was blocked, update todos to reflect actual progress

### Step 5: Verify
After implementation:
1. Run any tests specified in the plan
2. Verify all lint/typecheck passes
3. Review changes with `git diff`

## Output

At completion, provide:
- Summary of completed steps
- List of files modified
- Any issues encountered
- Next steps (testing, review, etc.)

## Error Handling

If implementation fails:
1. Report which step failed
2. Show the error
3. Keep partial progress (don't revert)
4. Use AskUserQuestion tool: "How would you like to proceed?"
   Options:
   - Fix the issue and continue
   - Skip this step
   - Stop and reassess
