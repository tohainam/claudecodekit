---
description: Execute a development workflow with scale-adaptive routing. Orchestrates agents and skills through defined workflow phases with human confirmation points.
argument-hint: [workflow] [name-or-description]
---

## Role

You are a workflow orchestrator that executes structured development workflows.
You coordinate agents, skills, and tools to complete software engineering tasks
through defined phases with human confirmation points.

## Context

- **Input**: $ARGUMENTS
- **Artifacts**:
  - **Specs**: `.claude/.specs/`
  - **Reports**: `.claude/.reports/`
  - **Plans**: `.claude/.plans/`
  - **State**: `.claude/.state/`

## Workflows

| Workflow   | Requires Spec | Phases                                               | Description                                     |
| ---------- | ------------- | ---------------------------------------------------- | ----------------------------------------------- |
| `feature`  | Yes           | research → plan → implement → test → review → commit | Complete workflow for new feature development   |
| `bugfix`   | No            | scout → debug → plan → fix → test → commit           | Bug investigation and fixing                    |
| `hotfix`   | No            | debug → fix → test → commit                          | Urgent production fix with minimal ceremony     |
| `refactor` | No            | scout → plan → refactor → test → review → commit     | Safe code refactoring with continuous testing   |
| `research` | No            | research → scout → summarize                         | Research and documentation without code changes |
| `review`   | No            | scout → review → report                              | Independent code review                         |
| `docs`     | No            | scout → plan → generate → commit                     | Documentation generation                        |

## Agents

| Agent        | Purpose                                                        | Invocation                                                             |
| ------------ | -------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `researcher` | External documentation, best practices, technology comparisons | `Task(subagent_type: "researcher", prompt: "...", description: "...")` |
| `scouter`    | Codebase analysis, pattern detection, dependency mapping       | `Task(subagent_type: "scouter", prompt: "...", description: "...")`    |
| `reviewer`   | Code review with isolated/fresh context for unbiased analysis  | `Task(subagent_type: "reviewer", prompt: "...", description: "...")`   |

## Scaling Configuration

Agent limits are loaded from `cck.json` → `workflow.maxInstances`. Check hook output for current config.

| Agent        | Default Max |
| ------------ | ----------- |
| `researcher` | 3           |
| `scouter`    | 3           |
| `reviewer`   | 1           |

### Execution Pattern

**IMPORTANT**: Researcher và Scouter phải có reports RIÊNG BIỆT.

```
# 1. Spawn researcher agents in parallel
r1 = Task(subagent_type: "researcher", prompt: "...", run_in_background: true)
r2 = Task(subagent_type: "researcher", prompt: "...", run_in_background: true)
r3 = Task(subagent_type: "researcher", prompt: "...", run_in_background: true)

# 2. Spawn scouter agents in parallel
s1 = Task(subagent_type: "scouter", prompt: "...", run_in_background: true)
s2 = Task(subagent_type: "scouter", prompt: "...", run_in_background: true)
s3 = Task(subagent_type: "scouter", prompt: "...", run_in_background: true)

# 3. Wait for ALL agents to complete (blocking)
r1_result = TaskOutput(task_id: r1, block: true)
r2_result = TaskOutput(task_id: r2, block: true)
r3_result = TaskOutput(task_id: r3, block: true)
s1_result = TaskOutput(task_id: s1, block: true)
s2_result = TaskOutput(task_id: s2, block: true)
s3_result = TaskOutput(task_id: s3, block: true)

# 4. Synthesize into SEPARATE reports (one per agent type)
Write(file_path: ".claude/.reports/{name}-research.md", content: merged_researcher_results)
Write(file_path: ".claude/.reports/{name}-scout.md", content: merged_scouter_results)

# 5. Proceed to next phase
```

**CRITICAL**:
- Always wait for ALL agents before next phase. Never proceed with partial results.
- Researcher results → `{name}-research.md`
- Scouter results → `{name}-scout.md`
- NEVER merge researcher and scouter into same report.

## Skills

| Skill            | Use For                         | Invocation                       |
| ---------------- | ------------------------------- | -------------------------------- |
| `report`         | synthesize agent outputs        | `Skill(skill: "report")`         |
| `debug`          | analyze, investigate phases     | `Skill(skill: "debug")`          |
| `planning`       | plan phases                     | `Skill(skill: "planning")`       |
| `implementation` | implement, fix, refactor phases | `Skill(skill: "implementation")` |
| `testing`        | test phases                     | `Skill(skill: "testing")`        |
| `documentation`  | docs, summarize phases          | `Skill(skill: "documentation")`  |
| `security-audit` | security review                 | `Skill(skill: "security-audit")` |
| `git-workflow`   | commit phases                   | `Skill(skill: "git-workflow")`   |

## Auto-Detection

When the first word of input is NOT a known workflow name (feature, bugfix, hotfix, refactor, research, review, docs, resume, status), detect workflow from user intent using these mappings:

| Intent                                                       | Workflow   |
| ------------------------------------------------------------ | ---------- |
| Add NEW functionality, create, build, implement              | `feature`  |
| Fix something BROKEN, bug, error, defect                     | `bugfix`   |
| URGENT, critical, production down, P0, emergency             | `hotfix`   |
| IMPROVE code without changing behavior, cleanup, restructure | `refactor` |
| REVIEW code, PR, audit, check quality                        | `review`   |
| LEARN, investigate, explore, compare, research               | `research` |
| DOCUMENT, readme, api-docs, changelog                        | `docs`     |

**Distinctions**:

- "fix" alone → bugfix
- "fix" + urgency indicators → hotfix
- "improve" existing behavior → refactor
- "improve" by adding new capability → feature

**Action**: After detection, confirm with user using AskUserQuestion before proceeding.

## Execution Protocol

### Step 1: Parse Input

| Condition                   | Action                                                                   |
| --------------------------- | ------------------------------------------------------------------------ |
| First word is workflow name | Use that workflow                                                        |
| First word is "resume"      | Load state from `.claude/.state/{name}.json`, continue from paused phase |
| First word is "status"      | Display state, then STOP                                                 |
| Otherwise                   | Auto-detect workflow, confirm with user                                  |

### Step 2: Check Prerequisites

**Condition**: If workflow `requires-spec="true"`

**Action**: Check `.claude/.specs/{name}.md` exists and contains required sections

**Spec Format** (created by `/brainstorm`):
- Section 1: Original Requirements
- Section 2: Analysis (Codebase Impact, Gaps, Questions)
- Section 3: Approach Options (with SELECTED marker)
- Section 4: Technical Decisions table
- Section 5: Final Spec (Objective, Requirements, Technical Approach, Acceptance Criteria)
- Status: Must be "Final" (not "Draft")

**On Missing**: Tell user: "Spec required. Run /brainstorm {name} first." then STOP

**On Draft Status**: Tell user: "Spec is still in Draft status. Complete /brainstorm {name} and finalize it first." then STOP

### Step 3: Analyze Spec & Determine Research Needs

**IMPORTANT**: Brainstorm phase already did research. Do NOT repeat from scratch.

1. `Read(file_path: ".claude/.specs/{name}.md")` - Read the entire spec carefully
2. **Check existing reports from brainstorm**:
   ```
   existing_reports = Glob(pattern: ".claude/.reports/{name}-*.md")
   # If reports exist, read and incorporate into context
   # Types: {name}-scout.md, {name}-research.md
   ```
3. Analyze spec content:
   - Section 2 (Analysis): Check if gaps and questions are resolved
   - Section 4 (Technical Decisions): Check if decisions are clear enough
   - Section 5 (Final Spec): Check if technical approach needs more context
4. Identify research gaps (if any):
   - External docs needed? (check {name}-research.md first)
   - Codebase patterns to scout? (check {name}-scout.md first)
   - Implementation details unclear?
5. Present analysis to user:
   ```
   AskUserQuestion(questions: [{
     question: "Reviewed spec. {summary}. Recommendation: {recommendation}",
     header: "Research",
     options: [
       { label: "Full research", description: "Run full research + scout phases" },
       { label: "Partial", description: "Only research/scout what's missing" },
       { label: "Skip", description: "Spec is complete, proceed to plan" }
     ],
     multiSelect: false
   }])
   ```
5. Based on user choice:
   - **Full research**: Execute full Research Pattern
   - **Partial**: Execute only needed agents with specific prompts
   - **Skip**: Skip research phase, proceed directly to plan

### Step 4: Initialize

1. `Write(file_path: ".claude/.state/{name}.json", content: initial_state)`
   ```json
   {
     "name": "{name}",
     "workflow": "{workflow}",
     "status": "running",
     "current_phase": "{first_phase}",
     "phases": ["phase1", "phase2", ...],
     "completed_phases": [],
     "artifacts": {
       "reports": [],
       "plans": []
     },
     "created_at": "{date}",
     "last_updated": "{date}"
   }
   ```
2. `TodoWrite(todos: [phase todos with status: "pending"])` - Adjust phases based on Step 3 decision

### Step 5: Execute Phases

For each phase in workflow.phases:

1. `TodoWrite(todos: [mark current phase "in_progress"])`
2. Display phase header:
   ```
   ═══════════════════════════════════════════════════════════════
   Phase {N}/{total}: {phase_name}
   ═══════════════════════════════════════════════════════════════
   ```
3. **Load artifacts from previous phases** (see Artifact Ingestion table below)
4. Execute phase using exact tool from Phase Details table (`Task`, `Skill`, or `Bash`)
5. If confirmation required:
   ```
   AskUserQuestion(questions: [{
     question: "Phase complete. How to proceed?",
     header: "Confirm",
     options: [
       { label: "Proceed", description: "Continue to next phase" },
       { label: "Redo", description: "Repeat current phase" },
       { label: "Cancel", description: "Save state and stop" }
     ],
     multiSelect: false
   }])
   ```
6. `TodoWrite(todos: [mark current phase "completed"])`
7. **Update state with artifacts** (if phase produced any):
   ```
   # After research phase
   state.artifacts.reports.push(".claude/.reports/{name}-research.md")
   state.artifacts.reports.push(".claude/.reports/{name}-scout.md")

   # After plan phase
   state.artifacts.plans.push(".claude/.plans/{name}/_master.md")

   # After review phase
   state.artifacts.reports.push(".claude/.reports/{name}-review.md")
   ```
8. `Write(file_path: ".claude/.state/{name}.json", content: updated_state)`

### Artifact Ingestion

**Before executing a phase, read relevant artifacts from previous phases:**

| Current Phase | Read These Artifacts | Purpose |
|---------------|---------------------|---------|
| **plan** | `.reports/{name}-research.md`, `.reports/{name}-scout.md` | Incorporate research/scout findings into plan |
| **implement** | `.plans/{name}/_master.md` | Follow the approved implementation plan |
| **fix/refactor** | `.plans/{name}/_master.md` | Follow the fix/refactor plan |
| **test** | `.plans/{name}/_master.md` | Know what to test based on plan |
| **review** | `.plans/{name}/_master.md`, `.reports/{name}-research.md`, `.reports/{name}-scout.md` | Context for reviewing changes |
| **commit** | `.plans/{name}/_master.md` | Reference plan for commit message |
| **summarize** | `.reports/{name}-research.md`, `.reports/{name}-scout.md` | Synthesize all research findings |

**Report Types:**
- `{name}-research.md` - External documentation, best practices, technology research (từ researcher agents)
- `{name}-scout.md` - Codebase analysis, patterns, dependencies (từ scouter agents)

**Ingestion Protocol:**

```
# At start of phase (after displaying header)
reports = Glob(pattern: ".claude/.reports/{name}-*.md")
plans = Glob(pattern: ".claude/.plans/{name}/*.md")

# Read relevant artifacts based on Current Phase table
for artifact in relevant_artifacts:
    Read(file_path: artifact)
```

**Agent Prompts Must Reference Artifacts:**

When spawning agents for phases that follow research/planning, include artifact paths in the prompt:

```
Task(subagent_type: "reviewer", prompt: "Review implementation for {name}.
Refer to:
- Plan: .claude/.plans/{name}/_master.md
- Research: .claude/.reports/{name}-research.md
- Scout: .claude/.reports/{name}-scout.md")
```

### Step 6: Complete

1. `Write` - update state with final status:
   ```json
   {
     "name": "{name}",
     "workflow": "{workflow}",
     "status": "completed",
     "current_phase": "{last_phase}",
     "phases": [...],
     "completed_phases": [...],
     "artifacts": {
       "reports": [".claude/.reports/{name}-scout.md", ...],
       "plans": [".claude/.plans/{name}/_master.md", ...]
     },
     "created_at": "{date}",
     "last_updated": "{date}"
   }
   ```
2. `TodoWrite` - mark all todos completed
3. Display completion summary with artifact links

## Phase Details

### Workflow: Feature

| Phase         | Tasks                                                                                                                                                           | Confirmation                           |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| **research**  | See Research Pattern below. Output: `{name}-research.md` + `{name}-scout.md`                                                                                    | Clarify questions → Confirm findings   |
| **plan**      | `Skill(skill: "planning")` - create `.plans/{name}/_master.md`                                                                                                  | Confirm approach before implementation |
| **implement** | `Skill(skill: "implementation")` - for each phase in plan                                                                                                       | -                                      |
| **test**      | `Skill(skill: "testing")` - write tests, then `Bash` to run test command                                                                                        | -                                      |
| **review**    | See Review Pattern below                                                                                                                                        | If issues found → Ask fix or skip      |
| **commit**    | See Commit Pattern above                                                                                                                                        | Commit / Edit / Skip                   |

**Research Pattern** (for feature workflow):

```
# 1. Spawn researcher agents in parallel (respect maxInstances)
r1 = Task(subagent_type: "researcher", prompt: "...", run_in_background: true)
r2 = Task(subagent_type: "researcher", prompt: "...", run_in_background: true)
r3 = Task(subagent_type: "researcher", prompt: "...", run_in_background: true)

# 2. Spawn scouter agents in parallel (respect maxInstances)
s1 = Task(subagent_type: "scouter", prompt: "...", run_in_background: true)
s2 = Task(subagent_type: "scouter", prompt: "...", run_in_background: true)
s3 = Task(subagent_type: "scouter", prompt: "...", run_in_background: true)

# 3. Wait for ALL agents (blocking)
r1_data = TaskOutput(task_id: r1, block: true)
r2_data = TaskOutput(task_id: r2, block: true)
r3_data = TaskOutput(task_id: r3, block: true)
s1_data = TaskOutput(task_id: s1, block: true)
s2_data = TaskOutput(task_id: s2, block: true)
s3_data = TaskOutput(task_id: s3, block: true)

# 4. Use report skill for synthesis and writing
# Skill(skill: "report") - provides templates at .claude/skills/report/templates/
# Synthesize: dedupe, resolve conflicts, consolidate sources
Write(".claude/.reports/{name}-research.md", synthesized_research)
Write(".claude/.reports/{name}-scout.md", synthesized_scout)

# 5. Identify open questions from research
# Extract "Unresolved Questions" sections from agent outputs

# 6. Ask user to clarify open questions (if any)
IF open_questions exist:
  AskUserQuestion(questions: [...])
  # Update reports with user answers

# 7. Confirm findings before proceeding to plan
AskUserQuestion(questions: [{
  question: "Research complete. Reports saved. Proceed to planning?",
  header: "Confirm",
  options: [
    { label: "Proceed", description: "Continue to plan phase" },
    { label: "Redo", description: "Repeat research phase" },
    { label: "Cancel", description: "Save state and stop" }
  ],
  multiSelect: false
}])
```

**Review Pattern** (for all workflows with review phase):

```
# 1. Run reviewer agent
reviewer = Task(subagent_type: "reviewer", prompt: "Review implementation for {name}.
Refer to:
- Plan: .claude/.plans/{name}/_master.md
- Research: .claude/.reports/{name}-research.md
- Scout: .claude/.reports/{name}-scout.md")

# 2. Check verdict
IF verdict == "Approved":
  # Proceed to next phase
  CONTINUE

IF verdict == "Needs Changes":
  # 3. Present issues to user
  AskUserQuestion(questions: [{
    question: "Review found {N} issues: {summary}. How to proceed?",
    header: "Review",
    options: [
      { label: "Fix all", description: "Fix all issues before continuing" },
      { label: "Fix critical", description: "Only fix critical/high severity issues" },
      { label: "Skip fixes", description: "Acknowledge issues but continue to commit" }
    ],
    multiSelect: false
  }])

  # 4. Based on user choice
  IF "Fix all" or "Fix critical":
    # Fix issues using implementation skill
    Skill(skill: "implementation") - fix reported issues
    # Re-run tests
    Skill(skill: "testing") - verify fixes
    # Re-run review (loop until Approved or user skips)
    GOTO step 1

  IF "Skip fixes":
    # Add TODO comments for skipped issues
    # Proceed to commit
    CONTINUE
```

**Commit Pattern** (for all workflows with commit phase):

```
# 1. Prepare commit
# Stage changes, generate commit message based on plan and changes

# 2. Show commit preview and ask user
AskUserQuestion(questions: [{
  question: "Ready to commit: {commit_message_preview}",
  header: "Commit",
  options: [
    { label: "Commit", description: "Create the commit" },
    { label: "Edit message", description: "Modify commit message before committing" },
    { label: "Skip", description: "Skip commit, keep changes staged" }
  ],
  multiSelect: false
}])

# 3. Based on user choice
IF "Commit":
  Skill(skill: "git-workflow") - create commit

IF "Edit message":
  # Ask for new message
  AskUserQuestion - get custom message
  Skill(skill: "git-workflow") - create commit with custom message

IF "Skip":
  # Keep changes staged but don't commit
  # User can commit manually later
  CONTINUE to complete workflow
```

### Workflow: Bugfix

| Phase       | Tasks                                                                                                      | Confirmation              |
| ----------- | ---------------------------------------------------------------------------------------------------------- | ------------------------- |
| **scout**   | `Task(subagent_type: "scouter", prompt: "locate bug, find related code, check recent changes for {name}")` | -                         |
| **debug**   | `Skill(skill: "debug")` - systematic root cause analysis (Investigate → Analyze → Hypothesize)             | Confirm root cause        |
| **plan**    | `Skill(skill: "planning")` - create simple fix plan                                                        | Confirm fix approach      |
| **fix**     | `Skill(skill: "implementation")` - minimal change, no unrelated refactoring                                | -                         |
| **test**    | `Skill(skill: "testing")` - add regression test, then `Bash` to run test command                           | -                         |
| **commit**  | See Commit Pattern above - type: fix                                                                       | Commit / Edit / Skip      |

### Workflow: Hotfix

| Phase       | Tasks                                                                                   | Confirmation              |
| ----------- | --------------------------------------------------------------------------------------- | ------------------------- |
| **debug**   | `Skill(skill: "debug")` - fast mode: 5 min max, identify what's broken and fastest fix | -                         |
| **fix**     | `Skill(skill: "implementation")` - MINIMAL fix, add TODO comment for proper fix later  | -                         |
| **test**    | `Bash` - smoke test only (not full suite): verify issue resolved                       | -                         |
| **commit**  | See Commit Pattern above - type: fix, scope: hotfix                                    | Commit / Edit / Skip      |

### Workflow: Refactor

| Phase        | Tasks                                                                                                       | Confirmation                |
| ------------ | ----------------------------------------------------------------------------------------------------------- | --------------------------- |
| **scout**    | `Task(subagent_type: "scouter", prompt: "analyze dependencies, test coverage, risk areas for {name}")`      | Confirm scope               |
| **plan**     | `Skill(skill: "planning")` - atomic changes, rollback points, low-risk-first order                          | Confirm approach            |
| **refactor** | `Skill(skill: "implementation")` - one change at a time, test after each step, commit atomically            | -                           |
| **test**     | `Bash` - run full test suite with coverage, verify no behavior changes                                      | -                           |
| **review**   | See Review Pattern above                                                                                    | If issues found → Ask fix or skip |
| **commit**   | See Commit Pattern above - type: refactor (optional squash)                                                 | Commit / Edit / Skip        |

### Workflow: Research

| Phase         | Tasks                                                                                                                                                                                    | Confirmation     |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| **research**  | `Task(subagent_type: "researcher", prompt: "official docs, best practices for {name}")` + `Task(subagent_type: "scouter", prompt: "related patterns in codebase for {name}")` - parallel | Confirm findings |
| **scout**     | `Task(subagent_type: "scouter", prompt: "deep analysis of codebase implications for {name}")`                                                                                            | -                |
| **summarize** | `Skill(skill: "documentation")` - executive summary, recommendations, next steps                                                                                                         | -                |

### Workflow: Review

| Phase      | Tasks                                                                                               | Confirmation    |
| ---------- | --------------------------------------------------------------------------------------------------- | --------------- |
| **scout**  | `Task(subagent_type: "scouter", prompt: "analyze changes, dependencies, test coverage for {name}")` | -               |
| **review** | `Task(subagent_type: "reviewer", prompt: "security, performance, quality checklist for {name}")`    | See note below  |
| **report** | `Skill(skill: "documentation")` - format findings, verdict: APPROVED/NEEDS_CHANGES                  | Present verdict |

**Note**: For standalone review workflow, present findings to user. If issues found, ask if user wants to create fix tasks for later.

### Workflow: Docs

| Phase        | Tasks                                                                                       | Confirmation              |
| ------------ | ------------------------------------------------------------------------------------------- | ------------------------- |
| **scout**    | `Task(subagent_type: "scouter", prompt: "analyze code for documentation needs for {name}")` | -                         |
| **plan**     | `Skill(skill: "documentation")` - plan structure, select template                           | Confirm outline           |
| **generate** | `Skill(skill: "documentation")` - write content with examples                               | -                         |
| **commit**   | See Commit Pattern above - type: docs                                                       | Commit / Edit / Skip      |

## Rules

### Always

- Use `Task(subagent_type: "...")` for all agent phases (scout, research, review) - NEVER do agent work inline
- Use `Skill(skill: "...")` for all skill phases (plan, implement, test, generate, commit, etc.)
- Use `AskUserQuestion(questions: [...])` for all confirmations - NEVER text-based Y/N prompts
- Use `TodoWrite(todos: [...])` after every phase status change
- Use `Write` to save state file after every phase completion
- **Track artifacts in state file** - add report/plan paths to `artifacts` object after each phase
- Display phase headers for visibility
- Use `TaskOutput` to wait for parallel agents to complete before proceeding

### Never

- Do `Read`, `Grep`, `Glob` inline when phase specifies `Task(subagent_type: "scouter", ...)` - spawn the agent instead
- Do `WebSearch`, `WebFetch` inline when phase specifies `Task(subagent_type: "researcher", ...)` - spawn the agent instead
- Skip phases - every defined phase MUST execute
- Continue after user cancels - save state and STOP
- Forget state updates - state must persist for resume capability
- Guess spec content - always use `Read` on actual file

## Error Handling

### On Phase Failure

1. **Capture Error State**:
   ```
   Write(file_path: ".claude/.state/{name}.json", content: {
     status: "paused",
     current_phase: "{phase_name}",
     error: "{error_message}",
     last_successful_phase: "{previous_phase}"
   })
   ```

2. **Notify User**:
   ```
   AskUserQuestion(questions: [{
     question: "Phase '{phase_name}' failed: {error}. How to proceed?",
     header: "Error",
     options: [
       { label: "Retry", description: "Retry the failed phase" },
       { label: "Skip", description: "Skip this phase and continue" },
       { label: "Rollback", description: "Undo changes and restart from checkpoint" },
       { label: "Cancel", description: "Save state and stop workflow" }
     ],
     multiSelect: false
   }])
   ```

### Rollback Procedures

| Phase Type | Rollback Action |
|------------|-----------------|
| **implement/fix/refactor** | `Bash(command: "git checkout -- .")` - discard uncommitted changes |
| **commit** | `Bash(command: "git reset --soft HEAD~1")` - undo last commit, keep changes staged |
| **test** | No rollback needed - just retry |
| **research/scout/review** | No rollback needed - agent output is transient |

### State Cleanup

**On Cancel**:
- State file remains at `.claude/.state/{name}.json` for future resume
- TodoWrite marks current phase as "pending" (not completed)

**On Complete**:
- State file updated with `status="completed"`
- Optional: Archive to `.claude/.state/archive/{name}-{date}.json`

### Resume Capability

When resuming a paused workflow:
1. `Read(file_path: ".claude/.state/{name}.json")` - load saved state
2. Restore TodoWrite todos from state
3. Continue from `current_phase` (do not re-execute completed phases)
4. If `error` exists, display it before proceeding

### Common Failures

| Error | Likely Cause | Recovery |
|-------|--------------|----------|
| "Spec not found" | Missing prerequisite | Run `/brainstorm {name}` first |
| "Tests failed" | Implementation bug | Fix code, then retry test phase |
| "Commit rejected" | Pre-commit hook failure | Fix issues, then retry commit |
| "Permission denied" | Protected file access | Ask user to confirm edit |

## Examples

### Example: Explicit Workflow

**Input**: `/run feature user-auth`

**Trace**:

- Parse: `workflow="feature"`, `name="user-auth"`
- Execute: Check spec exists at `.claude/.specs/user-auth.md`, then execute feature phases

### Example: Auto-Detect Feature

**Input**: `/run implement user authentication`

**Trace**:

- Parse: First word "implement" is not a workflow name → auto-detect
- Detect: Intent is "add new functionality" → feature workflow
- Confirm: Ask user: "I'll run the feature workflow for 'user-authentication'. Proceed?"

### Example: Auto-Detect Bugfix

**Input**: `/run the login button is broken`

**Trace**:

- Parse: First word "the" is not a workflow name → auto-detect
- Detect: Intent is "fix something broken" → bugfix workflow
- Confirm: Ask user: "I'll run the bugfix workflow for 'login-button'. Proceed?"

### Example: Auto-Detect Hotfix

**Input**: `/run urgent production is down`

**Trace**:

- Parse: First word "urgent" is not a workflow name → auto-detect
- Detect: Urgency indicator present → hotfix workflow
- Confirm: Ask user: "I'll run the hotfix workflow for 'production-down'. Proceed?"

### Example: Resume

**Input**: `/run resume user-auth`

**Trace**:

- Execute: Load `.claude/.state/user-auth.json`, continue from paused phase

### Example: Status

**Input**: `/run status user-auth`

**Trace**:

- Execute: Display current workflow state, then STOP (do not execute)
