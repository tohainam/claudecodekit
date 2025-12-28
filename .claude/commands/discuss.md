---
description: Structured discussion for requirements gathering and solution exploration
allowed-tools: Task, Read, Glob, Grep, Bash, Write, AskUserQuestion
argument-hint: <topic to discuss>
---

# Discussion Workflow

You are facilitating a structured discussion to gather requirements, explore solutions, and make decisions. This phase comes BEFORE planning and implementation.

## Input
Topic: $ARGUMENTS

## Workflow Phases

### Phase 1: Launch Facilitator
Use the **facilitator** agent to lead the structured discussion.

```
Task: Launch facilitator agent
Prompt: "Facilitate a structured discussion on: $ARGUMENTS

Follow the 6-phase process:
1. Topic Understanding - Classify and identify key questions
2. Context Gathering - Research codebase and constraints
3. Requirements Exploration - Socratic questioning, define scope
4. Solution Exploration - Present 2-4 approaches with trade-offs
5. Decision Synthesis - Recommend and confirm decision
6. Artifact Generation - Create discussion summary and ADR

User checkpoints:
- After requirements exploration (confirm understanding)
- After decision synthesis (approve approach)

Output:
- Discussion summary: .claude/discussions/YYYY-MM-DD-HH-MM-<topic>.md
- ADR (if decision made): .claude/decisions/YYYY-MM-DD-<title>.md"

Subagent: facilitator
```

### Phase 2: Requirements Exploration
The facilitator will:
- Ask clarifying questions (Socratic method)
- Define scope (what's in, what's out)
- Establish acceptance criteria

**USER CHECKPOINT**: Confirm understanding before proceeding.

### Phase 3: Solution Exploration
The facilitator will:
- Present 2-4 alternative approaches
- Analyze trade-offs for each (pros, cons, risks, effort)
- Create comparison matrix

### Phase 4: Decision Synthesis
The facilitator will:
- Summarize discussion insights
- Recommend an approach with rationale

**USER CHECKPOINT**: Approve the recommended approach.

### Phase 5: Artifact Generation
Create discussion artifacts:
- **Discussion Summary**: `.claude/discussions/YYYY-MM-DD-HH-MM-<topic>.md`
- **ADR Decision Record** (if decision made): `.claude/decisions/YYYY-MM-DD-<title>.md`

**ASK USER**: "Would you like to create an ADR decision record for this?"

## User Checkpoints

This workflow has key checkpoints:
1. **After Requirements**: Confirm understanding is correct
2. **Before Decision**: Approve recommended approach
3. **ADR Creation**: Optional - ask if user wants decision record

## Error Handling

If stuck at any phase:
1. Document what's unclear
2. Ask specific clarifying questions
3. Propose assumptions if needed
4. Wait for user input

## Output

At completion, provide:
- Summary of discussion outcomes
- List of artifacts created with paths
- Recommended next steps:
  - `/plan --discussion <path>` to create implementation plan
  - `/feature` to implement (will reference discussion)
- Any open questions for future discussion

## Next Steps

After discussion is complete:
```
/plan --discussion .claude/discussions/<discussion-file>.md
```
or
```
/feature <description>
```
The plan and feature commands will automatically reference related discussions.
