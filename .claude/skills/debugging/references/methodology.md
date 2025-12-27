# Debugging Methodology

Deep-dive into systematic debugging techniques and root cause analysis methods.

## Table of Contents

1. [Scientific Debugging Method](#scientific-debugging-method)
2. [Root Cause Analysis Techniques](#root-cause-analysis-techniques)
3. [Hypothesis-Driven Debugging](#hypothesis-driven-debugging)
4. [Delta Debugging](#delta-debugging)
5. [Debugging Heuristics](#debugging-heuristics)

---

## Scientific Debugging Method

Debugging mirrors the scientific process: observe, hypothesize, experiment, conclude.

```
┌─────────────────────────────────────────────────────────────────┐
│              SCIENTIFIC DEBUGGING CYCLE                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│         ┌──────────────┐                                        │
│         │   OBSERVE    │ ◄── Gather symptoms, logs, errors      │
│         └──────┬───────┘                                        │
│                │                                                 │
│                ▼                                                 │
│         ┌──────────────┐                                        │
│         │  HYPOTHESIZE │ ◄── Form testable theory               │
│         └──────┬───────┘                                        │
│                │                                                 │
│                ▼                                                 │
│         ┌──────────────┐                                        │
│         │   PREDICT    │ ◄── What would we see if true?         │
│         └──────┬───────┘                                        │
│                │                                                 │
│                ▼                                                 │
│         ┌──────────────┐                                        │
│         │  EXPERIMENT  │ ◄── Test the prediction                │
│         └──────┬───────┘                                        │
│                │                                                 │
│        ┌───────┴───────┐                                        │
│        │               │                                        │
│        ▼               ▼                                        │
│   ┌─────────┐    ┌─────────┐                                   │
│   │CONFIRMED│    │ REFUTED │──► Back to HYPOTHESIZE            │
│   └────┬────┘    └─────────┘                                   │
│        │                                                         │
│        ▼                                                         │
│   ┌─────────┐                                                   │
│   │   FIX   │                                                   │
│   └─────────┘                                                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Key Principles

1. **One variable at a time**: Change only one thing per experiment
2. **Document everything**: Record hypotheses, tests, and results
3. **Trust evidence over intuition**: Let data guide conclusions
4. **Falsifiability**: Design tests that CAN disprove the hypothesis

---

## Root Cause Analysis Techniques

### 5 Whys

Drill down through layers of causation:

```
Symptom: API returns 500 error
Why? → Database query failed
Why? → Connection pool exhausted
Why? → Connections not being released
Why? → Exception handler missing connection.close()
Why? → Code review didn't catch missing cleanup (ROOT CAUSE)
```

**Tips**:
- Don't stop at the first "why" that feels comfortable
- Look for process/systemic causes, not just technical
- Usually takes 4-7 iterations

### Fishbone Diagram (Ishikawa)

Categorize potential causes:

```
                    ┌─────────────────────────────────────────┐
                    │               BUG                       │
                    └─────────────────────────────────────────┘
                                        │
        ┌───────────────┬───────────────┼───────────────┬───────────────┐
        │               │               │               │               │
   ┌────┴────┐    ┌────┴────┐    ┌────┴────┐    ┌────┴────┐    ┌────┴────┐
   │  CODE   │    │  DATA   │    │  ENV    │    │  DEPS   │    │  USER   │
   └────┬────┘    └────┬────┘    └────┬────┘    └────┬────┘    └────┬────┘
        │               │               │               │               │
   - Logic error   - Invalid      - Config       - Version       - Edge case
   - Race condition  input        - Memory       - Breaking       input
   - Null pointer  - Edge case   - Network        change        - Sequence
   - Type error    - Encoding    - Permissions  - Missing dep   - Timing
```

### Fault Tree Analysis

Work backwards from failure:

```
                    [System Crash]
                          │
            ┌─────────────┴─────────────┐
            │                           │
      [Out of Memory]            [Unhandled Exception]
            │                           │
      ┌─────┴─────┐              ┌─────┴─────┐
      │           │              │           │
  [Memory     [Memory        [Null      [Type
   Leak]      Spike]        Pointer]    Error]
```

---

## Hypothesis-Driven Debugging

### Forming Good Hypotheses

**Structure**:
```
IF [condition] THEN [observable effect] BECAUSE [mechanism]
```

**Good examples**:
- "IF the user is not authenticated THEN the session cookie is missing BECAUSE the auth middleware is not running"
- "IF we query >1000 records THEN timeout occurs BECAUSE the index is not being used"

**Bad examples**:
- "Something is broken" (not testable)
- "It might be the database" (too vague)
- "This always fails" (not specific about conditions)

### Hypothesis Ranking

Prioritize hypotheses by:

1. **Likelihood** - Based on evidence and experience
2. **Testability** - Can you quickly prove/disprove?
3. **Impact** - If true, does it explain all symptoms?

```
┌─────────────────────────────────────────────────────────────┐
│ Hypothesis                      Likelihood  Testable  Score │
├─────────────────────────────────────────────────────────────┤
│ Race condition in auth          High        Medium    7     │
│ Database connection leak        Medium      High      7     │
│ Network timeout                 Low         High      4     │
│ Cosmic ray bit flip             Very Low    Low       1     │
└─────────────────────────────────────────────────────────────┘
```

---

## Delta Debugging

Systematically minimize failing input/code to find the cause.

### Binary Search Approach

```
Given: Code fails with 100 lines
1. Comment out lines 51-100 → Still fails? Bug in 1-50
2. Comment out lines 26-50  → Works? Bug in 26-50
3. Comment out lines 38-50  → Still fails? Bug in 26-37
4. ... continue until minimal failing case
```

### Git Bisect

Find the commit that introduced the bug:

```bash
git bisect start
git bisect bad HEAD           # Current version is bad
git bisect good v1.2.0        # Last known good version
# Git checks out middle commit
# Test and mark: git bisect good/bad
# Repeat until culprit found
git bisect reset              # Return to original HEAD
```

### Minimal Reproduction

Create the smallest case that exhibits the bug:

```
Starting case: 500-line component with bug
1. Remove unrelated imports → still bugs
2. Remove unused functions → still bugs
3. Simplify state → still bugs
4. Hardcode props → still bugs
5. Remove JSX except buggy part → still bugs

Minimal case: 15 lines that demonstrate the issue
```

---

## Debugging Heuristics

### Common Bug Locations

Based on research, bugs cluster in:

1. **Recently changed code** - Check `git log`, `git blame`
2. **Complex functions** - High cyclomatic complexity
3. **Boundary conditions** - Off-by-one, empty arrays, null values
4. **Integration points** - API calls, database queries, IPC
5. **Error handlers** - Often less tested paths

### Probabilistic Debugging

When stuck, consider probability:

```
Question: Is it more likely that...
A) The well-tested library has a bug?
B) Your code misuses the library?

Usually B. Check your assumptions first.
```

### Rubber Duck Debugging

Explain the problem out loud (or to a rubber duck):

1. "The code is supposed to..."
2. "But instead it..."
3. "It works when... but fails when..."
4. "I've tried... which showed..."

Often, articulating the problem reveals the solution.

### Time-Based Analysis

| Question | What it reveals |
|----------|-----------------|
| When did it start? | Recent changes, deployments |
| Does it happen at specific times? | Scheduled jobs, peak load |
| Does it get worse over time? | Memory leaks, resource exhaustion |
| Is it correlated with other events? | Dependencies, external systems |

### Print Statement Strategy

Strategic logging beats random prints:

```python
# Bad: Random prints
print("here")
print("here2")

# Good: Structured diagnostic output
print(f"[DEBUG] process_order: input={order_id}, user={user.id}")
print(f"[DEBUG] process_order: inventory_check={has_stock}")
print(f"[DEBUG] process_order: payment_status={payment.status}")
```

---

## Debugging Session Template

```markdown
## Debug Session: [Issue Description]
Date: [YYYY-MM-DD]

### Symptoms
- [What's happening]
- [Error messages]
- [Reproduction steps]

### Environment
- [Versions, configs, etc.]

### Investigation Log

#### Hypothesis 1: [Description]
- Test: [What I did]
- Result: [What happened]
- Conclusion: [Confirmed/Refuted]

#### Hypothesis 2: [Description]
- Test: [What I did]
- Result: [What happened]
- Conclusion: [Confirmed/Refuted]

### Root Cause
[Final determination]

### Fix Applied
[What was changed]

### Lessons Learned
[What to do differently next time]
```
