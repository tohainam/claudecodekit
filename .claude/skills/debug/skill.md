---
name: debug
description: Systematic debugging and root cause analysis skill. Use when: (1) Investigating bugs or errors, (2) Analyzing stack traces or error logs, (3) Finding root cause of failures, (4) Debugging production issues, (5) Performing root cause analysis. Provides structured 5-phase methodology (Investigate → Analyze → Hypothesize → Fix → Document) with AI-enhanced pattern recognition.
---

# Debug Skill

Systematic debugging methodology for reliable root cause analysis and fix implementation.

## Iron Law

> **NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST**

Systematic debugging (15-30 min, 95% first-time fix rate) beats random fixes (2-3 hours, 40% success rate).

## 5-Phase Debugging Process

```
┌─────────────────────────────────────────────────────┐
│  Phase 1: INVESTIGATE (gather evidence)             │
│  Phase 2: ANALYZE (find patterns)                   │
│  Phase 3: HYPOTHESIZE (form & test hypothesis)      │
│  Phase 4: FIX (test-first, minimal change)          │
│  Phase 5: DOCUMENT (root cause, regression test)    │
└─────────────────────────────────────────────────────┘
```

## Phase 1: Investigate

**Goal**: Reproduce consistently and gather evidence.

**Actions**:
1. Read error messages carefully - they often contain the answer
2. Reproduce the bug consistently (if can't reproduce, can't fix)
3. Check recent changes: `git diff HEAD~5`, `git log --oneline -10`
4. Gather evidence at component boundaries (inputs, outputs, state)
5. Trace data flow backward from symptom

**Output**: Reproduction steps, error context, evidence log

**Techniques**:
```bash
# Check recent changes
git log --oneline -10
git diff HEAD~5

# Search for related code
grep -rn "error_message_here" src/

# Check logs
tail -100 logs/app.log | grep -i error
```

## Phase 2: Analyze

**Goal**: Understand the pattern and isolate the problem.

**Actions**:
1. Find similar working code - what's different?
2. Compare against reference implementations
3. List ALL differences between working and broken
4. Map dependencies and assumptions
5. Use binary search to narrow scope

**Output**: Pattern comparison, difference list, dependency map

**Binary Search Debugging**:
```bash
# Git bisect for regression finding
git bisect start
git bisect bad HEAD
git bisect good v1.2.3
# Test at each step, git bisect good/bad
```

**5 Whys Analysis**:
```
Problem: API returns 500 error
1. Why? → Database query failed
2. Why? → Connection pool exhausted
3. Why? → Connections not released
4. Why? → Missing finally block
5. Why? → Pattern violation in review
→ Root Cause: Missing resource cleanup
```

## Phase 3: Hypothesize

**Goal**: Form and test a single, specific hypothesis.

**Actions**:
1. Form ONE specific hypothesis (not multiple)
2. Make smallest possible change to test it
3. Verify results before continuing
4. If fails → form NEW hypothesis (don't stack changes)

**Output**: Written hypothesis, test plan, verification result

**Hypothesis Template**:
```
HYPOTHESIS: The error occurs because [specific cause]
TEST: I will [specific action] to verify
EXPECTED: If correct, [expected outcome]
RESULT: [actual outcome]
CONCLUSION: [confirmed/refuted, next step]
```

**Red Flags** (stop if thinking this):
- "Quick fix for now, investigate later"
- "Just try changing X and see"
- "Add multiple changes, run tests"
- "One more fix attempt" (after 2+ failures)

## Phase 4: Fix

**Goal**: Implement minimal, verified fix.

**Actions**:
1. Write failing test case FIRST (TDD)
2. Implement single, focused fix
3. Verify fix works (test passes)
4. Run full test suite
5. If 3+ attempts fail → question architecture

**Output**: Failing test, minimal fix, passing tests

**Fix Checklist**:
- [ ] Root cause confirmed with evidence
- [ ] Failing test written first
- [ ] Fix is minimal (no unrelated changes)
- [ ] All tests pass
- [ ] No new warnings introduced

## Phase 5: Document

**Goal**: Prevent recurrence and share knowledge.

**Actions**:
1. Record root cause in commit message
2. Document fix rationale
3. Ensure regression test exists
4. Update runbook if production issue

**Output**: Root cause summary, fix rationale, regression test

**Commit Message Template**:
```
fix(scope): brief description

Root cause: [what was actually wrong]
Fix: [what change was made and why]

Closes #123
```

## Stop Signals

These indicate deviation from systematic process:

| Signal | Problem | Action |
|--------|---------|--------|
| "Quick fix, investigate later" | Skipping root cause | Stop, go back to Phase 1 |
| "Try X and see if it works" | Random guessing | Form proper hypothesis |
| "Multiple changes at once" | Can't isolate fix | Revert, one change at a time |
| "Skip the test, verify manually" | No regression protection | Write the test first |
| "3+ failed fix attempts" | Wrong hypothesis | Escalate, architecture review |

## AI-Enhanced Debugging

### Log Analysis
- Pattern recognition in error logs
- Semantic clustering of related errors
- Anomaly detection in metrics

### Stack Trace Interpretation
- Extract key information from traces
- Map to source code locations
- Suggest relevant code to investigate

### Hypothesis Generation
- Suggest causes based on error patterns
- Check against common anti-patterns
- Cross-reference with known issues

## Advanced Techniques

For complex issues, see: [references/methodologies.md](references/methodologies.md)
- Delta debugging
- Fault tree analysis
- Distributed tracing
- Time-travel debugging

## Integration with Bugfix Workflow

```
Bug Report → Debug Skill (Phases 1-3) → Implementation Skill (Phase 4) → Testing Skill → Git Workflow Skill
```

The debug skill replaces inline "analyze" phase with structured investigation.
