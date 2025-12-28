---
description: Full feature implementation workflow - from planning to PR
allowed-tools: Task, Read, Glob, Grep, Bash, Edit, Write, TodoWrite, AskUserQuestion
argument-hint: <feature description>
---

# Feature Implementation Workflow

You are orchestrating a complete feature implementation workflow. This is a multi-phase process that ensures quality through planning, implementation, testing, and review.

## Input
Feature description: $ARGUMENTS

## Workflow Phases

### Phase 1: Planning
Use the **planner** agent to create a comprehensive implementation plan.

```
Task: Launch planner agent
Prompt: "Create a detailed implementation plan for: $ARGUMENTS

Analyze the codebase, identify affected files, design the solution, and create a plan file at .claude/plans/."

Subagent: planner
```

**STOP after planning** - Wait for user to review and approve the plan before proceeding.

### Phase 2: Implementation
After plan approval, use the **implementer** agent to execute the plan.

```
Task: Launch implementer agent
Prompt: "Execute the approved plan. Read the plan file and implement each step, updating checkboxes as you complete them."

Subagent: implementer
```

### Phase 3: Testing
Use the **test-writer** agent to create tests for the new feature.

```
Task: Launch test-writer agent
Prompt: "Write comprehensive tests for the newly implemented feature. Include unit tests, integration tests if needed, and edge cases."

Subagent: test-writer
```

### Phase 4: Review
Use the **code-reviewer** agent to review all changes.

```
Task: Launch code-reviewer agent
Prompt: "Review all changes made for this feature. Run git diff to see changes, check code quality, security, and test coverage."

Subagent: code-reviewer
```

**If critical issues found**: Go back to Phase 2 to fix them.

### Phase 5: Finalize
After passing review:
1. Create commit(s) with conventional message format
2. Ask user if they want to create a PR
3. If yes, create PR with summary

## User Checkpoints

This workflow has mandatory user checkpoints:
1. **After Planning**: User must approve plan before implementation
2. **After Review**: User confirms ready to commit/PR

## Error Handling

If blocked at any phase:
1. Stop immediately
2. Report the issue clearly
3. Propose alternatives
4. Wait for user decision

## Output

At completion, provide:
- Summary of what was implemented
- List of files created/modified
- Test results
- Any follow-up recommendations
