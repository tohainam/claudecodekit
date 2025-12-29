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

### Phase 0: Check for Prior Context
Before planning, check for related discussions, decisions, and scout reports:

1. Search `.claude/.discussions/` for discussions related to this feature
2. Search `.claude/.decisions/` for relevant ADRs
3. Search `.claude/.reports/` for existing scout reports on related code
4. If found, reference them in the planning phase

If no discussion exists and requirements seem unclear:
Use AskUserQuestion tool: "Would you like to /discuss this feature first to clarify requirements?"

Options:
- **Yes**: Stop and run `/discuss` first
- **No**: Proceed with planning

### Phase 1: Planning
Use Task tool with **planner** agent to create a comprehensive implementation plan.

```
Task: Launch planner agent
Prompt: "Create a detailed implementation plan for: $ARGUMENTS

Analyze the codebase, identify affected files, design the solution, and create a plan file at .claude/.plans/."

Subagent: planner
```

Use AskUserQuestion tool: "Do you approve this implementation plan?"

### Phase 2: Implementation
After plan approval, use Task tool with **implementer** agent to execute the plan.

```
Task: Launch implementer agent
Prompt: "Execute the approved plan. Read the plan file and implement each step, updating checkboxes as you complete them."

Subagent: implementer
```

### Phase 3: Testing (Optional)
Use AskUserQuestion tool: "Do you want to write tests for this feature?"

Options:
- **Yes**: Proceed with test-writer agent
- **No**: Skip to Phase 4 (Review)

If user wants tests, use Task tool with **test-writer** agent to create tests for the new feature.

```
Task: Launch test-writer agent
Prompt: "Write comprehensive tests for the newly implemented feature. Include unit tests, integration tests if needed, and edge cases."

Subagent: test-writer
```

**If user skips testing**: Proceed directly to Phase 4.

### Phase 4: Review
Use Task tool with **code-reviewer** agent to review all changes.

```
Task: Launch code-reviewer agent
Prompt: "Review all changes made for this feature. Run git diff to see changes, check code quality, security, and test coverage."

Subagent: code-reviewer
```

**If critical issues found**: Go back to Phase 2 to fix them.

### Phase 5: Finalize
After passing review:

Use AskUserQuestion tool: "Do you want to commit the changes?"

Options:
- **Yes**: Create commit(s) with conventional message format, then ask about PR
- **No**: Leave changes uncommitted (user will commit manually later)

If user wants to commit:
1. Create commit(s) with conventional message format
2. Ask user if they want to create a PR
3. If yes, create PR with summary

If user declines commit:
- Provide summary of changes made
- List files modified
- Remind user changes are uncommitted

## User Checkpoints

This workflow has user checkpoints:
1. **After Planning**: User must approve plan before implementation
2. **Before Testing**: Ask user if they want to write tests (optional)
3. **After Review**: Ask user if they want to commit (optional)
4. **After Commit**: Ask user if they want to create PR (optional)

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
- Test results (if tests were written)
- Any follow-up recommendations
