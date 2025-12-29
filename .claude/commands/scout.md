---
description: Deep codebase research for understanding features, flows, and dependencies
allowed-tools: Task, Read, Glob, Grep, Bash, Write
argument-hint: <topic to research>
---

# Scout Codebase

You are performing deep codebase research to understand existing implementation. This command runs comprehensive analysis across three dimensions: architecture, data flow, and dependencies.

## Input
Research topic: $ARGUMENTS

## Workflow Phases

### Phase 1: Launch Parallel Scout Instances

Spawn 3 parallel scouter agent instances, each with a different focus area:

```
Task: Launch scouter agent for architecture analysis
Prompt: "Research the following topic with ARCHITECTURE focus: $ARGUMENTS

Focus Area: architecture

Your task:
- Map component structure and organization
- Identify design patterns and architectural boundaries
- Understand module responsibilities
- Document entry points and configuration

Output ONLY the '## Architecture & Structure' section of the report.

Follow the scouter agent research process:
1. Topic Analysis - Extract key terms, formulate search strategy
2. Codebase Search - Use Glob/Grep to find relevant files
3. Deep Analysis - Read key files, identify patterns
4. Report Generation - Output structured findings with file:line references

Report Section Template:
## Architecture & Structure

### Component Organization
[Description of code organization]

**Key Files:**
- path/to/file.ts:10-50 - [Purpose]

### Design Patterns
[Identified patterns]

### Architectural Boundaries
[Separation of concerns]

**Integration Points:**
- [Component A] → [Component B] via [mechanism]"

Subagent: scouter
```

```
Task: Launch scouter agent for data flow analysis
Prompt: "Research the following topic with DATA FLOW focus: $ARGUMENTS

Focus Area: data-flow

Your task:
- Trace how data enters the system
- Follow data transformations and processing
- Map state management approach
- Document data persistence strategy

Output ONLY the '## Data Flow & Logic' section of the report.

Follow the scouter agent research process:
1. Topic Analysis - Extract key terms, formulate search strategy
2. Codebase Search - Use Glob/Grep to find relevant files
3. Deep Analysis - Read key files, trace data journey
4. Report Generation - Output structured findings with file:line references

Report Section Template:
## Data Flow & Logic

### Request/Data Journey
[Trace from entry to completion]

1. **Entry Point**: path/to/file.ts:15 - [Description]
2. **Processing**: path/to/file.ts:42 - [Transformation]
3. **Storage/Output**: path/to/file.ts:78 - [Destination]

### State Management
[How state is managed]

### Business Logic
[Core domain logic]

### Data Transformations
[Shape changes through the system]"

Subagent: scouter
```

```
Task: Launch scouter agent for dependencies analysis
Prompt: "Research the following topic with DEPENDENCIES focus: $ARGUMENTS

Focus Area: dependencies

Your task:
- Map internal module dependencies
- Identify external package usage
- Document third-party integrations
- Track environment configuration needs

Output ONLY the '## Dependencies & Integration' section of the report.

Follow the scouter agent research process:
1. Topic Analysis - Extract key terms, formulate search strategy
2. Codebase Search - Use Glob/Grep to find relevant files
3. Deep Analysis - Read key files, map connections
4. Report Generation - Output structured findings with file:line references

Report Section Template:
## Dependencies & Integration

### External Dependencies
[Third-party packages and services]

**From package.json/requirements.txt:**
- package-name@version - [Used for X]

### Internal Dependencies
[Module dependency graph]

**Key Import Chains:**
- ComponentA → ServiceB → UtilityC

### External Integrations
[APIs, databases, services]

**Integration Points:**
- path/to/api-client.ts:20-40 - [External API]

### Environment Configuration
[Environment variables]

**Required ENV vars:**
- API_KEY - Used in path/to/file.ts:15"

Subagent: scouter
```

### Phase 2: Wait for Completion

All three scouter instances will run in parallel. Wait for all to complete before proceeding.

### Phase 3: Consolidate Report

Once all three instances complete:

1. **Extract Results**: Capture the three report sections:
   - Architecture & Structure (from first instance)
   - Data Flow & Logic (from second instance)
   - Dependencies & Integration (from third instance)

2. **Create Consolidated Report**: Combine into single document with this structure:

```markdown
# Scout Report: [Topic]

**Generated**: [YYYY-MM-DD HH:MM]
**Topic**: [Research topic from $ARGUMENTS]
**Scope**: Full codebase analysis (Architecture, Data Flow, Dependencies)

---

[## Architecture & Structure section from instance 1]

---

[## Data Flow & Logic section from instance 2]

---

[## Dependencies & Integration section from instance 3]

---

## Summary

**Key Findings:**
- [Major architectural pattern or structure]
- [Critical data flow or state management approach]
- [Important dependency or integration]

**Relevant Files** (most referenced):
- [List top 5-8 files mentioned across all sections]

**Next Steps:**
- [Suggested areas for deeper investigation if needed]
- [Potential concerns or technical debt noted]

---
*Scout report generated by parallel scouter agent instances*
```

3. **Save Report**: Write the consolidated report to:
   `.claude/.reports/YYYY-MM-DD-HH-MM-<sanitized-topic>.md`

   Sanitization rules for filename:
   - Replace spaces with hyphens
   - Remove special characters except hyphens
   - Lowercase all letters
   - Truncate to 50 characters max

### Phase 4: Output Summary

Provide user with:

```
✅ Scout Report Complete

**Topic**: [Research topic]
**Report**: .claude/.reports/[filename].md

**Key Findings:**
- [1-3 line summary of architecture insights]
- [1-3 line summary of data flow insights]
- [1-3 line summary of dependencies insights]

**Total Files Analyzed**: [Count of unique files referenced]
**Report Sections**: Architecture, Data Flow, Dependencies

You can now:
- Read the full report: `cat .claude/.reports/[filename].md`
- Use insights for planning: `/plan [feature based on findings]`
- Start a discussion: `/discuss [topic based on findings]`
```

## User Checkpoints

This workflow runs automatically without checkpoints. All research is non-invasive (read-only).

## Error Handling

### If No Relevant Code Found
- Note in report that topic may be new/unimplemented
- Document what was searched
- Suggest alternative search terms or clarifications

### If Topic Too Broad
- Focus on main entry points and common patterns
- Note in report that analysis is high-level
- Suggest more specific topics for deeper dives

### If Scouter Instance Fails
- Continue with successful instances
- Note in consolidated report which section is missing
- Provide partial findings

## Output

At completion:
- Consolidated scout report saved to `.claude/.reports/`
- Summary of key findings displayed to user
- Suggestions for next steps based on research

## Next Steps

After scouting:
- Use findings to inform `/plan` or `/feature` workflow
- Reference report in `/discuss` for architecture decisions
- Dive deeper into specific areas with follow-up `/scout` on narrower topics

---

*Scout command for standalone deep codebase research*
