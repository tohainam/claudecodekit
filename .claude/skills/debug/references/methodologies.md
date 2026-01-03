# Advanced Debugging Methodologies

Reference guide for complex debugging scenarios.

## Table of Contents
1. [Delta Debugging](#delta-debugging)
2. [Fault Tree Analysis](#fault-tree-analysis)
3. [TRAFFIC Framework](#traffic-framework)
4. [Distributed Tracing](#distributed-tracing)
5. [Time-Travel Debugging](#time-travel-debugging)
6. [Git Bisect Automation](#git-bisect-automation)

---

## Delta Debugging

Automated minimization of failure-inducing input/code.

### Concept
Systematically narrow down failure-inducing circumstances until minimal set remains.

### Process
```
1. Start with failing input/code
2. Split into two halves
3. Test each half
4. Keep failing half, discard passing half
5. Repeat until minimal reproducer found
```

### Use Cases
- Minimizing test cases
- Finding minimal code causing failure
- Isolating configuration changes

---

## Fault Tree Analysis (FTA)

Top-down deductive failure analysis using Boolean logic.

### Structure
```
                [System Failure]
                      │
                 [AND/OR Gate]
                 /           \
          [Cause A]       [Cause B]
             │                │
        [Sub-cause]      [Sub-cause]
```

### Gates
- **AND Gate**: All inputs must occur for output
- **OR Gate**: Any input causes output

### Process
1. Define TOP event (the failure)
2. Identify immediate causes
3. Decompose each cause recursively
4. Stop at basic events (can't decompose further)
5. Find minimal cut sets

---

## TRAFFIC Framework

7-step systematic debugging decomposition.

| Step | Action | Description |
|------|--------|-------------|
| **T** | Track | Log problem in database/issue tracker |
| **R** | Reproduce | Reliably trigger the failure |
| **A** | Automate | Simplify to smallest test case |
| **F** | Find | Identify possible infection origins |
| **F** | Focus | Prioritize most likely origins |
| **I** | Isolate | Trace the infection chain |
| **C** | Correct | Fix the defect |

**Key Insight**: Find → Focus → Isolate takes 80% of debugging time.

---

## Distributed Tracing

For microservices and distributed systems.

### OpenTelemetry Setup
```python
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider

# Initialize tracer
trace.set_tracer_provider(TracerProvider())
tracer = trace.get_tracer(__name__)

# Create span
with tracer.start_as_current_span("operation") as span:
    span.set_attribute("user.id", user_id)
    # ... operation code
```

### Trace Correlation
```bash
# Search logs by trace ID
grep "trace_id=abc123" logs/*.log

# Find all spans for a request
curl "http://jaeger:16686/api/traces/abc123"
```

### Best Practices
1. Instrument critical paths first (auth, payments)
2. Use consistent trace ID format across services
3. Include relevant context (user ID, request ID)
4. Set up service dependency maps

---

## Time-Travel Debugging

Record, replay, and resolve approach.

### Tools by Language
| Language | Tool |
|----------|------|
| C/C++ | rr, Undo |
| JavaScript | Replay.io, Wallaby.js |
| Python | RevPDB |
| .NET | RevDeBug, Microsoft TTD |

### rr (Linux)
```bash
# Record execution
rr record ./my_program

# Replay and debug
rr replay
(rr) reverse-continue  # Go backward
(rr) reverse-step      # Step backward
```

### Use Cases
- Race condition debugging
- Non-deterministic failures
- Production incident reproduction

---

## Git Bisect Automation

O(log n) bug localization through commit history.

### Basic Usage
```bash
git bisect start
git bisect bad HEAD              # Current is broken
git bisect good v1.2.0           # Last known good
# Git checks out midpoint
# Test and mark
git bisect good  # or git bisect bad
# Repeat until found
git bisect reset  # When done
```

### Automated Bisect
```bash
# With test script
git bisect start HEAD v1.2.0
git bisect run ./test.sh

# test.sh should exit 0 for good, 1+ for bad
```

### Example Test Script
```bash
#!/bin/bash
# test.sh - Returns 0 if build works, 1 if broken

npm install 2>/dev/null
npm test 2>/dev/null

if [ $? -eq 0 ]; then
    exit 0  # Good commit
else
    exit 1  # Bad commit
fi
```

### Skip Commits
```bash
# Skip untestable commits (e.g., won't compile)
git bisect skip
```

---

## Debugging Checklists

### Production Issue Checklist
- [ ] Capture current state (logs, metrics, traces)
- [ ] Check recent deployments
- [ ] Review change log
- [ ] Check external dependencies
- [ ] Verify configuration changes
- [ ] Check resource utilization (CPU, memory, disk)
- [ ] Review error rates and latency

### Memory Leak Checklist
- [ ] Profile heap usage over time
- [ ] Check for unclosed resources
- [ ] Review event listener cleanup
- [ ] Check circular references
- [ ] Analyze object retention

### Performance Issue Checklist
- [ ] Profile with flame graphs
- [ ] Check database query plans
- [ ] Review N+1 query patterns
- [ ] Check cache hit rates
- [ ] Analyze network latency
- [ ] Review algorithm complexity

---

## AI-Assisted Debugging Prompts

### Log Analysis
```
Analyze these logs and identify:
1. Error patterns and frequency
2. Temporal correlation
3. Potential root causes
4. Suggested investigation steps

[paste logs here]
```

### Stack Trace Interpretation
```
Explain this stack trace:
1. What is the immediate cause?
2. What is the likely root cause?
3. Which files should I investigate?
4. What are common fixes for this pattern?

[paste stack trace here]
```

### Hypothesis Generation
```
Given this bug description:
[description]

And this evidence:
[evidence]

Generate 3 hypotheses ranked by likelihood,
with specific tests to verify each.
```
