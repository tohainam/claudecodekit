---
description: Bug diagnosis and fix workflow - debug, test, fix, verify
allowed-tools: Task, Read, Glob, Grep, Bash, Edit, Write, TodoWrite, AskUserQuestion
argument-hint: <error message or bug description>
---

# Bugfix Workflow

You are orchestrating a complete bug fix workflow. This follows a TDD approach: diagnose, write failing test, fix, verify.

## Input
Bug description/error: $ARGUMENTS

## Workflow Phases

### Phase 1: Diagnosis
Use the **debugger** agent to find the root cause.

```
Task: Launch debugger agent
Prompt: "Diagnose this bug: $ARGUMENTS

Analyze the error, search the codebase, check git history, and create a diagnosis report at .claude/.plans/ with:
- Root cause identified
- Affected files
- Proposed fix approach
- Risk assessment"

Subagent: debugger
```

**STOP after diagnosis** - Wait for user to confirm the root cause is correct before proceeding.

### Phase 2: Write Failing Test First (Optional)
**ASK USER**: "Do you want to write a failing test before fixing the bug? (TDD approach)"

Options:
- **Yes**: Write test first, then fix (TDD approach - recommended for regression prevention)
- **No**: Skip to Phase 3 (Fix) directly

If user wants tests, use the **test-writer** agent to create a test that reproduces the bug.

```
Task: Launch test-writer agent
Prompt: "Write a test that reproduces the bug described in the diagnosis. The test MUST FAIL before the fix is applied - this confirms the bug exists."

Subagent: test-writer
```

Verify the test fails. If it passes, the bug may already be fixed or the test is wrong.

**If user skips testing**: Proceed directly to Phase 3.

### Phase 3: Fix
Use the **implementer** agent to implement the fix.

```
Task: Launch implementer agent
Prompt: "Implement the fix based on the diagnosis report. Make minimal changes to fix the bug. Run the failing test after - it should now pass."

Subagent: implementer
```

### Phase 4: Verify
Run full verification:

1. **Run the specific test** - Must pass now (if test was written)
2. **Run related tests** - No regressions
3. **Run full test suite** - All tests pass (if project has tests)

Use the **code-reviewer** agent for final check:

```
Task: Launch code-reviewer agent
Prompt: "Review the bug fix. Verify:
- Fix is minimal and targeted
- No regressions introduced
- Security implications considered
- Similar bugs in codebase checked"

Subagent: code-reviewer
```

### Phase 5: Finalize
After passing verification:

**ASK USER**: "Do you want to commit the fix?"

Options:
- **Yes**: Create commit and optionally PR
- **No**: Leave changes uncommitted (user will commit manually later)

If user wants to commit:
1. Create commit with message: `fix(scope): description`
2. Reference issue number if available: `Fixes #123`
3. Ask user if they want to create a PR
4. If yes, create PR with:
   - Root cause explanation
   - Fix description
   - Test added (if user requested)
   - `Closes #xxx` if applicable

If user declines commit:
- Provide summary of fix applied
- List files modified
- Remind user changes are uncommitted

## User Checkpoints

1. **After Diagnosis**: Confirm root cause is correct
2. **Before Testing**: Ask user if they want to write a failing test (optional)
3. **After Verification**: Ask user if they want to commit (optional)
4. **After Commit**: Ask user if they want to create PR (optional)

## Error Handling

If the fix doesn't work:
1. Report the issue
2. Analyze what went wrong
3. Update diagnosis
4. Try alternative approach

## Output

At completion, provide:
- Root cause summary
- What was fixed
- Test added (if user requested)
- Any related issues found
