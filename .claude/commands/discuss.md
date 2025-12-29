---
description: Structured discussion for requirements gathering and solution exploration
allowed-tools: Task, Read, Glob, Grep, Bash, Write, AskUserQuestion
argument-hint: <topic to discuss>
---

# Discussion Workflow

You are facilitating a structured discussion to gather requirements, explore solutions, and make decisions. This phase comes BEFORE planning and implementation.

## Input
Topic: $ARGUMENTS

## CRITICAL: Multi-Phase Architecture

**WHY**: Subagent output is NOT directly visible to users. Only the main agent can display content to users. Therefore, this workflow uses multiple Task calls where the main agent reads and displays intermediate results.

## Workflow Phases

### Phase 1: Context & Requirements Gathering

Launch facilitator to gather context and requirements:

```
Task: Gather context and requirements
Subagent: facilitator
Prompt: "PHASE 1 ONLY - Context & Requirements Gathering

Topic: $ARGUMENTS

Your tasks:
1. Classify discussion type (requirements/design/trade-off/decision)
2. If code-related: Launch parallel scouter agents for codebase research
3. If external libraries: Launch parallel researcher agents for internet research
4. Gather requirements using Socratic method
5. Define scope (in/out)

OUTPUT: Write requirements summary to .claude/.reports/YYYY-MM-DD-HH-MM-discuss-requirements-<topic>.md

Return: File path and brief summary of requirements gathered."
```

**Main Agent Action**: Read the requirements file and display to user:
```
Read: [returned file path]
Display: Full requirements content
AskUserQuestion: "Does this understanding look correct? Should we proceed to solution exploration?"
```

### Phase 2: Solution Exploration

Launch facilitator to explore approaches (ONLY after user confirms requirements):

```
Task: Explore solution approaches
Subagent: facilitator
Prompt: "PHASE 2 ONLY - Solution Exploration

Topic: $ARGUMENTS
Requirements file: [path from Phase 1]

Your tasks:
1. Read the requirements file for context
2. Identify 2-4 alternative approaches
3. For EACH approach, analyze in FULL detail:
   - Description (2-3 sentences minimum)
   - Pros (with explanations)
   - Cons (with explanations)
   - Risks (with mitigations)
   - Effort level and reasoning
   - Fit with existing patterns
4. Create comparison matrix

OUTPUT: Write ALL approaches to .claude/.reports/YYYY-MM-DD-HH-MM-discuss-approaches-<topic>.md

Use this format in the file:
═══════════════════════════════════════════════════════════════
APPROACH 1: [Name]
═══════════════════════════════════════════════════════════════
[Full details...]

═══════════════════════════════════════════════════════════════
APPROACH 2: [Name]
═══════════════════════════════════════════════════════════════
[Full details...]

═══════════════════════════════════════════════════════════════
COMPARISON MATRIX
═══════════════════════════════════════════════════════════════
[Matrix...]

Return: File path only. Do NOT summarize - main agent will display full content."
```

**Main Agent Action**: Read and display ALL approaches:
```
Read: [returned file path]
Display: FULL FILE CONTENT (all approaches, comparison matrix)
AskUserQuestion: "Review all approaches above. Which approach do you prefer, or would you like to discuss further?"
```

### Phase 3: Decision Synthesis

Launch facilitator to synthesize decision (ONLY after user reviews approaches):

```
Task: Synthesize decision and recommendation
Subagent: facilitator
Prompt: "PHASE 3 ONLY - Decision Synthesis

Topic: $ARGUMENTS
Requirements file: [path from Phase 1]
Approaches file: [path from Phase 2]
User preference: [user's response from Phase 2]

Your tasks:
1. Consider user's stated preference
2. Synthesize recommendation with clear rationale
3. Reference specific approaches from the approaches file

OUTPUT: Return your recommendation directly (no file needed).

Format:
## Recommended Approach
[Name and why]

## Rationale
[Why this over others, reference comparison matrix]

## Trade-offs Accepted
[What we're accepting by choosing this]"
```

**Main Agent Action**: Display recommendation and ask for approval:
```
Display: Facilitator's recommendation
AskUserQuestion: "Do you approve this approach? Should I create an ADR decision record?"
```

### Phase 4: Artifact Generation

If user approves, launch facilitator to create final artifacts:

```
Task: Generate discussion artifacts
Subagent: facilitator
Prompt: "PHASE 4 ONLY - Artifact Generation

Topic: $ARGUMENTS
Requirements file: [path]
Approaches file: [path]
Approved approach: [user's choice]
Create ADR: [yes/no based on user response]

Your tasks:
1. Create discussion summary: .claude/.discussions/YYYY-MM-DD-HH-MM-<topic>.md
2. If ADR requested: Create .claude/.decisions/YYYY-MM-DD-<title>.md
3. Include references to the reports files

Return: List of created artifact paths."
```

**Main Agent Action**: Report completion:
```
Display: List of artifacts created with paths
Suggest: Next steps (/plan, /feature)
```

## Key Principles

1. **Subagent writes to files** → Main agent reads and displays
2. **Main agent asks questions** → Not subagent (except during research)
3. **Full content visibility** → User sees ALL approaches before deciding
4. **Sequential phases** → Each phase waits for user confirmation

## Error Handling

If stuck at any phase:
1. Document what's unclear
2. Ask specific clarifying questions
3. Propose assumptions if needed
4. Wait for user input

## Output

At completion, provide:
- Summary of discussion outcomes
- List of artifacts created with paths:
  - `.claude/.reports/` - Requirements and approaches analysis
  - `.claude/.discussions/` - Final discussion summary
  - `.claude/.decisions/` - ADR (if created)
- Recommended next steps

## Next Steps

After discussion is complete:
```
/plan --discussion .claude/.discussions/<discussion-file>.md
```
or
```
/feature <description>
```
