---
name: debugging
description: >
  Universal debugging skill for systematic root cause analysis and bug fixing across all technologies.
  Use when: (1) encountering errors, exceptions, or unexpected behavior, (2) investigating bugs or issues,
  (3) analyzing stack traces, logs, or error messages, (4) diagnosing performance problems, (5) debugging
  frontend (React, Vue, Angular, browser), backend (Node.js, Python, Java, Go), mobile (iOS, Android,
  React Native, Flutter), database queries, or distributed systems. Applies scientific debugging methodology
  with hypothesis-driven investigation.
---

# Debugging

## Overview

Systematic debugging follows the scientific method: observe symptoms, form hypotheses, test them, and iterate until root cause is found. This skill provides universal debugging methodology applicable to any technology stack.

## Quick Reference

| Bug Type | Start With |
|----------|------------|
| Frontend UI/rendering | [references/frontend.md](references/frontend.md) |
| Backend/API errors | [references/backend.md](references/backend.md) |
| Mobile app issues | [references/mobile.md](references/mobile.md) |
| Database/SQL problems | [references/database.md](references/database.md) |
| Performance bottlenecks | [references/performance.md](references/performance.md) |
| Need specific tools | [references/tools.md](references/tools.md) |

For detailed debugging methodology and RCA techniques: [references/methodology.md](references/methodology.md)

## Core Debugging Process

```
┌─────────────────────────────────────────────────────────────────┐
│                    SYSTEMATIC DEBUGGING                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. REPRODUCE ──► Can you reliably trigger the bug?             │
│       │          (If no, gather more data first)                │
│       ▼                                                         │
│  2. ISOLATE ───► Narrow down: binary search, comment out,       │
│       │          disable features, minimal reproduction         │
│       ▼                                                         │
│  3. HYPOTHESIZE ► Form SPECIFIC, TESTABLE theories              │
│       │          "X causes Y because Z"                         │
│       ▼                                                         │
│  4. TEST ──────► Design experiment to prove/disprove            │
│       │          One variable at a time                         │
│       ▼                                                         │
│  5. FIX ───────► Minimal change, verify with tests              │
│       │          Check for similar bugs elsewhere               │
│       ▼                                                         │
│  6. VERIFY ────► Run tests, no regressions, document            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Step 1: Reproduce

**Goal**: Establish reliable reproduction steps.

```
Gather:
- Exact error message/stack trace
- Environment (OS, browser, versions)
- Input data that triggers bug
- Steps to reproduce (STR)
- Frequency (always, intermittent, specific conditions)
```

**If intermittent**: Add logging, check for race conditions, timing issues, or state dependencies.

## Step 2: Isolate

**Goal**: Narrow the problem space.

Techniques:
- **Binary search**: Comment out half the code, which half contains bug?
- **Minimal reproduction**: Smallest code that still exhibits bug
- **Feature toggle**: Disable features until bug disappears
- **Dependency isolation**: Is it your code or a library?
- **Environment diff**: Works locally, fails in prod? What's different?

```
Questions to ask:
- When did it last work? (git bisect)
- What changed recently? (git diff, git log)
- Which component owns this behavior?
- What are the inputs/outputs at each step?
```

## Step 3: Hypothesize

**Goal**: Form specific, testable theories.

Good hypothesis format:
```
"The bug occurs because [CAUSE] when [CONDITION],
which results in [SYMPTOM]."
```

Examples:
- "The null pointer occurs because user.address is undefined when user is guest"
- "The timeout happens because the query lacks an index on created_at"
- "The race condition occurs because setState is async but we read state immediately"

Avoid vague hypotheses like "something is wrong with the database."

## Step 4: Test

**Goal**: Prove or disprove each hypothesis.

```
For each hypothesis:
1. Predict what you'd see if hypothesis is true
2. Design minimal test to verify prediction
3. Change ONE variable at a time
4. Document results
5. If disproved, move to next hypothesis
```

Common testing approaches:
- Add strategic logging/breakpoints
- Inspect variable values at key points
- Check assumptions with assertions
- Modify inputs to trigger/avoid condition
- Use debugger to step through execution

## Step 5: Fix

**Goal**: Minimal change that addresses root cause.

Principles:
- Fix the ROOT CAUSE, not just symptoms
- Make the smallest change possible
- Write test that would have caught this bug
- Check for similar patterns elsewhere in codebase

```
Fix checklist:
[ ] Addresses root cause, not symptom
[ ] Minimal change
[ ] Test added that reproduces bug (fails before fix, passes after)
[ ] No regressions in related functionality
[ ] Similar bugs checked/fixed elsewhere
```

## Step 6: Verify

**Goal**: Confirm fix works without side effects.

```
Verification checklist:
[ ] Original bug no longer reproducible
[ ] New test passes
[ ] All existing tests pass
[ ] Manual verification in affected scenarios
[ ] Code review for fix quality
[ ] Document root cause and fix
```

## Root Cause Analysis Techniques

### 5 Whys

Ask "why" repeatedly until you reach the fundamental cause:

```
Problem: Production server crashed
Why? → Out of memory
Why? → Memory leak in user session handler
Why? → Sessions not cleaned up after logout
Why? → Cleanup callback not registered
Why? → Refactor removed callback registration (ROOT CAUSE)
```

### Bug Clustering

Group similar bugs to find common root causes:
- Same error type across different features
- Same file/module repeatedly appears in bugs
- Same time period (recent deployment?)

## Anti-Patterns to Avoid

```
❌ Random changes hoping something works
❌ Fixing symptoms instead of root cause
❌ Not reproducing before fixing
❌ Multiple changes at once
❌ Assuming you know the cause without testing
❌ Ignoring error messages/stack traces
❌ Not checking recent changes (git log/blame)
❌ Not writing test to prevent regression
```

## Debugging Output Format

When documenting debugging findings:

```markdown
## Bug Investigation: [Brief Description]

### Symptoms
- Error: [exact error message]
- Frequency: [always/intermittent/conditions]
- Environment: [where it occurs]

### Root Cause
[Clear explanation of why bug occurs]

### Evidence
- [How you confirmed the root cause]
- [Relevant logs/screenshots]

### Fix
- [What was changed]
- [Why this fixes the root cause]

### Prevention
- [Test added]
- [Similar issues checked]
```

## Platform-Specific References

Load the appropriate reference based on the technology:

- **Frontend (Browser, React, Vue, etc.)**: [references/frontend.md](references/frontend.md)
- **Backend (Node.js, Python, Java, Go)**: [references/backend.md](references/backend.md)
- **Mobile (iOS, Android, React Native, Flutter)**: [references/mobile.md](references/mobile.md)
- **Database (SQL, queries, optimization)**: [references/database.md](references/database.md)
- **Performance (profiling, memory, CPU)**: [references/performance.md](references/performance.md)
- **Tools (debuggers, logging, tracing)**: [references/tools.md](references/tools.md)
- **Methodology (RCA techniques, scientific method)**: [references/methodology.md](references/methodology.md)
