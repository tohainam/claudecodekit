---
description: Refactor code safely without changing behavior
allowed-tools: Task, Read, Glob, Grep, Bash, Edit, Write, TodoWrite, AskUserQuestion
argument-hint: <file or component> [goal]
---

# Refactor Code

You are refactoring code to improve quality WITHOUT changing behavior.

## Input
Target and goal: $ARGUMENTS

## Critical Rule
**Behavior MUST NOT change.** All existing tests must continue to pass after refactoring.

## Process

### Phase 1: Analysis
Use Task tool with **refactorer** agent for analysis:

```
Task: Launch refactorer agent (read-only phase)
Prompt: "Analyze for refactoring: $ARGUMENTS

1. Read the target code
2. Identify code smells:
   - Long methods/functions
   - Deep nesting
   - Code duplication
   - Poor naming
   - God classes
   - Feature envy

3. Check test coverage
   - Are there adequate tests?
   - What behaviors are tested?

4. Create refactoring plan:
   - List specific refactorings to apply
   - Order from safest to most impactful
   - Each step must be independently testable

Create plan at .claude/.plans/"

Subagent: refactorer
```

Use AskUserQuestion tool: "Do you approve this refactoring plan?"

### Phase 2: Ensure Tests Exist (Optional)
Use AskUserQuestion tool: "Do you want to verify/add test coverage before refactoring?"

Options:
- **Yes**: Check and add tests for safety net (recommended)
- **No**: Skip to Phase 3 (Refactor) directly

If user wants tests, use Task tool with **test-writer** agent to verify test coverage:

```
Task: Launch test-writer agent (if needed)
Prompt: "Check test coverage for the code being refactored. If coverage is inadequate, write tests BEFORE refactoring begins. These tests will serve as safety net."

Subagent: test-writer
```

Run all tests - they must pass before proceeding.

**If user skips testing**: Proceed directly to Phase 3. Note: This is riskier as there's no safety net for behavior verification.

### Phase 3: Refactor (Small Steps)
Use Task tool with **refactorer** agent to execute refactoring in small, safe steps:

```
Task: Launch refactorer agent
Prompt: "Execute the approved refactoring plan using SMALL STEPS:

For each refactoring step:
1. Make ONE small change
2. Run tests immediately
3. If PASS → Commit → Next step
4. If FAIL → Revert → Try different approach

Do NOT batch multiple changes. Each commit should be a single, atomic refactoring.

Refactoring techniques to use:
- Extract Method/Function
- Rename for clarity
- Introduce Parameter Object
- Replace Magic Numbers with Constants
- Remove Dead Code
- Simplify Conditionals
- Extract Class/Module"

Subagent: refactorer
```

### Phase 4: Verify
Use Task tool with **code-reviewer** agent for final verification:

```
Task: Launch code-reviewer agent
Prompt: "Review the refactoring changes:
- All tests still pass?
- Behavior unchanged?
- Code quality improved?
- No new issues introduced?"

Subagent: code-reviewer
```

## Safety Measures

- **Run tests** between refactoring steps (if tests exist)
- **Revert immediately** if tests fail
- **Stop if uncertain** about behavior impact

## Output

At completion, provide:
- List of refactorings applied
- Before/after comparison
- Test results
- Files modified

## Follow-up

After refactoring is complete:

Use AskUserQuestion tool: "Do you want to commit the refactoring changes?"

Options:
- **Yes**: Create commit(s) with conventional message format, then ask about PR
- **No**: Leave changes uncommitted (user will commit manually later)

If user wants to commit:
- Create commit with refactoring summary
- Ask if they want to create a PR
- If yes, create PR with refactoring summary

If user declines commit:
- Remind user changes are uncommitted
- Suggest reviewing with `git diff` before committing
