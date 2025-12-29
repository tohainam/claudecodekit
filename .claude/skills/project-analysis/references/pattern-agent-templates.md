# Pattern-Based Agent Templates Reference

Templates for creating project-specific agents that debug **ACTUAL CODE PATTERNS** found in the codebase.

## Core Principle

**Agents must reference ACTUAL CODE, not generic debugging.**

❌ BAD (generic):
```markdown
## Debug Process
1. Check state transitions
2. Verify business rules
3. Look at logs
```

✅ GOOD (code-focused):
```markdown
## Debug Process

1. **Check current state**
   ```bash
   # Query Order state
   grep -n "status" prisma/schema.prisma
   ```

2. **Find transition logic**
   File: `src/services/order/orderService.ts:45-78`
   ```typescript
   const validTransitions: Record<OrderStatus, OrderStatus[]> = {
     PENDING: ['PAID', 'CANCELLED'],
     PAID: ['PROCESSING', 'REFUNDED'],
     // ...
   };
   ```

3. **Check transition caller**
   ```bash
   grep -rn "transitionOrderState" src/
   ```
```

---

## Universal Agent Template

**File:** `.claude/agents/[entity]-[pattern].md`

```markdown
---
name: [entity]-[pattern]-debugger
description: |
  Debug [ENTITY] [PATTERN] issues in [PROJECT_NAME].
  Use when [ENTITY] [SPECIFIC_ISSUE].
tools: Read, Grep, Bash
model: sonnet
skills: [related-skill], debugging
---

You are debugging [ENTITY] [PATTERN] issues in this codebase.

## Key Files

| Purpose | File | Lines |
|---------|------|-------|
| [PURPOSE_1] | `[FILE_1]` | [LINES] |
| [PURPOSE_2] | `[FILE_2]` | [LINES] |
| [PURPOSE_3] | `[FILE_3]` | [LINES] |

## [PATTERN] Definition

**Source:** `[FILE]:[LINE_RANGE]`

```[LANGUAGE]
[ACTUAL_CODE_DEFINING_PATTERN]
```

## Debug Commands

### Find current state
```bash
[GREP_COMMAND_TO_FIND_STATE]
```

### Trace execution
```bash
[GREP_COMMAND_TO_TRACE_CALLS]
```

### Check related code
```bash
[GREP_COMMAND_FOR_RELATED]
```

## Common Issues

### Issue: [ISSUE_NAME]

**Symptom:** [what user sees]

**Check code at:** `[FILE]:[LINE]`

```[LANGUAGE]
[CODE_THAT_MIGHT_CAUSE_ISSUE]
```

**Solution:** [how to fix in this codebase]
```

---

## State Machine Agent Template

**When detected:** Entity with `status` or `state` field and transition logic

**File:** `.claude/agents/[entity]-state-debugger.md`

```markdown
---
name: [entity]-state-debugger
description: |
  Debug [ENTITY] state machine issues.
  Use when [ENTITY] stuck in wrong state or transitions fail.
tools: Read, Grep, Bash
model: sonnet
skills: [domain], debugging
---

You are debugging [ENTITY] state transitions in this codebase.

## State Machine Definition

**States defined in:** `[SCHEMA_FILE]:[LINE]`

```[LANGUAGE]
[ACTUAL_ENUM_OR_STATE_DEFINITION]
```

**Transitions defined in:** `[SERVICE_FILE]:[LINE_RANGE]`

```[LANGUAGE]
[ACTUAL_TRANSITION_LOGIC]
```

## Key Files

| Purpose | File | Lines |
|---------|------|-------|
| State enum | `[SCHEMA_FILE]` | [LINE] |
| Transition logic | `[SERVICE_FILE]` | [LINES] |
| State handlers | `[HANDLER_FILE]` | [LINES] |
| State validation | `[VALIDATION_FILE]` | [LINES] |

## Debug Commands

### Find state definition
```bash
grep -n "enum [Entity]Status\|status.*=" [SCHEMA_FILE]
```

### Find transition callers
```bash
grep -rn "transition[Entity]State\|updateStatus\|setStatus" src/
```

### Find state handlers
```bash
grep -rn "case '[STATE_NAME]'\|if.*status.*===.*'[STATE_NAME]'" src/
```

### Check state history (if audit table exists)
```bash
grep -rn "[entity]History\|[entity]Audit\|statusChangedAt" src/
```

## Valid Transitions

```
[STATE_1] → [STATE_2], [STATE_3]
[STATE_2] → [STATE_4]
[STATE_3] → [STATE_4], [STATE_5]
...
```

## Common Issues

### Issue: [ENTITY] stuck in [STATE]

**Check transition logic at:** `[FILE]:[LINE]`

```[LANGUAGE]
// This code validates transitions
[VALIDATION_CODE]
```

**Possible causes:**
1. Transition not allowed (check valid transitions above)
2. Precondition failed (check code at `[FILE]:[LINE]`)
3. Error thrown but swallowed (check try-catch at `[FILE]:[LINE]`)

### Issue: [ENTITY] skipped [STATE]

**Check direct updates at:**
```bash
grep -rn "update.*status\|status:.*[STATE]" src/ | grep -v "transition"
```

If found, direct status updates bypass transition validation.
```

---

## Event-Driven Agent Template

**When detected:** EventEmitter, publish/subscribe, event handlers

**File:** `.claude/agents/event-tracer.md`

```markdown
---
name: event-tracer
description: |
  Trace event flow in this codebase.
  Use when events not firing or handlers not executing.
tools: Read, Grep, Bash
model: sonnet
skills: debugging
---

You are tracing event flow in this codebase.

## Event System

**Event emitter defined in:** `[EVENTS_FILE]:[LINE]`

```[LANGUAGE]
[ACTUAL_EVENT_EMITTER_CODE]
```

**Event types defined in:** `[TYPES_FILE]:[LINE_RANGE]`

```[LANGUAGE]
[ACTUAL_EVENT_TYPE_DEFINITIONS]
```

## Key Files

| Purpose | File | Lines |
|---------|------|-------|
| Event emitter | `[EVENTS_FILE]` | [LINE] |
| Event types | `[TYPES_FILE]` | [LINES] |
| Event handlers | `[HANDLERS_DIR]/*.ts` | - |

## Registered Events

| Event | Emitted From | Handled By |
|-------|--------------|------------|
| [EVENT_1] | `[FILE]:[LINE]` | `[HANDLER_FILE]` |
| [EVENT_2] | `[FILE]:[LINE]` | `[HANDLER_FILE]` |

## Debug Commands

### Find event emission
```bash
grep -rn "emit\|publish\|dispatch" --include="*.ts" src/ | grep "[EVENT_NAME]"
```

### Find event handlers
```bash
grep -rn "on\|subscribe\|addEventListener" --include="*.ts" src/ | grep "[EVENT_NAME]"
```

### Check handler registration
```bash
grep -rn "register.*Handler\|addListener" src/
```

## Trace Event Flow

For event `[EVENT_NAME]`:

1. **Emitted at:** `[FILE]:[LINE]`
   ```[LANGUAGE]
   [EMIT_CODE]
   ```

2. **Handler registered at:** `[FILE]:[LINE]`
   ```[LANGUAGE]
   [REGISTRATION_CODE]
   ```

3. **Handler logic at:** `[FILE]:[LINE_RANGE]`
   ```[LANGUAGE]
   [HANDLER_CODE]
   ```

## Common Issues

### Issue: Event not handled

**Check registration at:** `[FILE]:[LINE]`
- Handler might not be registered
- Event name might be misspelled

```bash
# Compare emitted vs handled events
grep -rn "emit.*'" src/ | sed "s/.*emit.*'\([^']*\)'.*/\1/" | sort | uniq > /tmp/emitted
grep -rn "on.*'" src/ | sed "s/.*on.*'\([^']*\)'.*/\1/" | sort | uniq > /tmp/handled
diff /tmp/emitted /tmp/handled
```

### Issue: Handler runs multiple times

**Check for duplicate registration:**
```bash
grep -rn "on('[EVENT_NAME]'" src/ | wc -l
```

If count > 1, handler registered multiple times.
```

---

## Pipeline/Processor Agent Template

**When detected:** Pipeline, processor, transformer patterns

**File:** `.claude/agents/pipeline-debugger.md`

```markdown
---
name: [pipeline]-debugger
description: |
  Debug [PIPELINE] data flow issues.
  Use when pipeline produces wrong output or fails.
tools: Read, Grep, Bash
model: sonnet
skills: debugging
---

You are debugging [PIPELINE] data processing in this codebase.

## Pipeline Definition

**Pipeline defined in:** `[PIPELINE_FILE]:[LINE_RANGE]`

```[LANGUAGE]
[ACTUAL_PIPELINE_DEFINITION]
```

## Pipeline Stages

| Stage | File | Input Type | Output Type |
|-------|------|------------|-------------|
| [STAGE_1] | `[FILE]:[LINE]` | [TYPE] | [TYPE] |
| [STAGE_2] | `[FILE]:[LINE]` | [TYPE] | [TYPE] |
| [STAGE_3] | `[FILE]:[LINE]` | [TYPE] | [TYPE] |

## Stage Implementations

### Stage: [STAGE_NAME]

**Source:** `[FILE]:[LINE_RANGE]`

```[LANGUAGE]
[ACTUAL_STAGE_CODE]
```

## Debug Commands

### Find pipeline definition
```bash
grep -rn "pipeline\|stages\|processors" src/
```

### Trace data through stages
```bash
grep -rn "transform\|process\|map" [PIPELINE_DIR]/
```

### Find stage errors
```bash
grep -rn "catch\|error\|throw" [PIPELINE_DIR]/
```

## Common Issues

### Issue: Stage [N] produces wrong output

**Check transformation at:** `[FILE]:[LINE]`

```[LANGUAGE]
[TRANSFORMATION_CODE]
```

**Debug:** Add logging before/after to see data shape:
```[LANGUAGE]
console.log('Stage [N] input:', JSON.stringify(input));
const result = [TRANSFORM](input);
console.log('Stage [N] output:', JSON.stringify(result));
```
```

---

## Queue/Worker Agent Template

**When detected:** Bull, BullMQ, or queue patterns

**File:** `.claude/agents/job-debugger.md`

```markdown
---
name: job-debugger
description: |
  Debug background job issues.
  Use when jobs fail, get stuck, or produce wrong results.
tools: Read, Grep, Bash
model: sonnet
skills: debugging
---

You are debugging background jobs in this codebase.

## Queue Configuration

**Queue defined in:** `[QUEUE_FILE]:[LINE_RANGE]`

```[LANGUAGE]
[ACTUAL_QUEUE_CONFIG]
```

## Job Types

| Job | Processor | Queue |
|-----|-----------|-------|
| [JOB_1] | `[FILE]:[LINE]` | [QUEUE_NAME] |
| [JOB_2] | `[FILE]:[LINE]` | [QUEUE_NAME] |

## Job Processor

**Source:** `[PROCESSOR_FILE]:[LINE_RANGE]`

```[LANGUAGE]
[ACTUAL_PROCESSOR_CODE]
```

## Debug Commands

### Find job definitions
```bash
grep -rn "add\|process\|Queue" src/ | grep -i job
```

### Find job processors
```bash
grep -rn "processor\|handle\|worker" [JOBS_DIR]/
```

### Check retry config
```bash
grep -rn "attempts\|retry\|backoff" [QUEUE_FILE]
```

## Common Issues

### Issue: Job stuck in queue

**Check processor at:** `[FILE]:[LINE]`

```[LANGUAGE]
[PROCESSOR_CODE]
```

**Possible causes:**
1. Worker not running
2. Job threw before completion
3. Async operation hanging

### Issue: Job fails repeatedly

**Check error handling at:** `[FILE]:[LINE]`

```[LANGUAGE]
[ERROR_HANDLING_CODE]
```

**Debug:** Check retry count and last error in job data.
```

---

## Generation Process

When generating a pattern agent:

### Step 1: Detect Pattern and Entity

```bash
# Find state machine patterns
grep -rn "status\|state" prisma/schema.prisma src/models/

# Extract entity name
# e.g., "Order" if found "OrderStatus" or "Order.status"
```

### Step 2: Find Key Files

```bash
# Find files implementing the pattern
grep -rn "[ENTITY]\|[pattern]" --include="*.ts" src/
```

### Step 3: Extract Actual Code

For each key file:
1. Read the file
2. Find pattern implementation (enum, transitions, handlers)
3. Extract with line numbers
4. Include in agent template

### Step 4: Generate Debug Commands

Based on project structure:
- Grep commands for this specific codebase
- File paths from this project
- Actual function/type names

---

## Notes

- **Extract from codebase**: All code snippets must come from actual project files
- **Include line numbers**: Always reference `file:line-range`
- **Specific grep commands**: Use actual file paths and patterns from this project
- **Real valid transitions/events**: Extract from actual code, don't guess
- **Working debug commands**: Test that grep commands work in this project
