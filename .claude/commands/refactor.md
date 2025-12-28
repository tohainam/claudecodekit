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
Use the **refactorer** agent for analysis:

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

Create plan at .claude/plans/"

Subagent: refactorer
```

**STOP for user approval** of the refactoring plan.

### Phase 2: Ensure Tests Exist
Before refactoring, verify test coverage:

```
Task: Launch test-writer agent (if needed)
Prompt: "Check test coverage for the code being refactored. If coverage is inadequate, write tests BEFORE refactoring begins. These tests will serve as safety net."

Subagent: test-writer
```

Run all tests - they must pass before proceeding.

### Phase 3: Refactor (Small Steps)
Execute refactoring in small, safe steps:

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
Final verification:

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

- **Never skip tests** between refactoring steps
- **Commit after each successful step** (can squash later)
- **Revert immediately** if tests fail
- **Stop if uncertain** about behavior impact

## Output

At completion, provide:
- List of refactorings applied
- Before/after comparison
- Test results
- Commits created (or squash summary)

## Follow-up

After refactoring:
- Squash commits if desired
- Create PR with refactoring summary
- Update documentation if needed
