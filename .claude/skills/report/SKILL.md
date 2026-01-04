---
name: report
description: "Report writing and synthesis skill for CCK workflows. Use when: (1) Synthesizing raw data from subagents (researcher, scouter, reviewer) into structured reports, (2) Writing reports to .reports/ directory, (3) Merging multiple agent outputs into cohesive documents. Provides templates and naming conventions for consistent report generation."
---

# Report Skill

Standardized report generation for CCK workflow artifacts.

## When to Use

Main agent uses this skill after receiving raw data from subagents:

```
Subagent → Raw Data → Main Agent → Skill(report) → .reports/{name}-{type}.md
```

## Report Types

| Type | Source | Template | Output |
|------|--------|----------|--------|
| `research` | researcher agents | [templates/research.md](templates/research.md) | `{name}-research.md` |
| `comparison` | researcher (A vs B) | [templates/comparison.md](templates/comparison.md) | `{name}-comparison.md` |
| `scout` | scouter agents | [templates/scout.md](templates/scout.md) | `{name}-scout.md` |
| `review` | reviewer agent | [templates/review.md](templates/review.md) | `{name}-review.md` |

## Workflow

### Step 1: Collect Agent Outputs

```
# Wait for ALL agents
r1_result = TaskOutput(task_id: r1, block: true)
r2_result = TaskOutput(task_id: r2, block: true)
s1_result = TaskOutput(task_id: s1, block: true)
```

### Step 2: Select Template

Based on agent type and report purpose:

| Agent Type | Single Agent | Multiple Agents |
|------------|--------------|-----------------|
| researcher | Use directly | Merge → `research` template |
| scouter | Use directly | Merge → `scout` template |
| reviewer | Use `review` template | N/A (max 1) |

### Step 3: Synthesize

Merge multiple agent outputs:

1. **Remove duplicates** - Same findings from different agents
2. **Resolve conflicts** - Prioritize: official docs > community > inference
3. **Consolidate sources** - Dedupe URLs, keep most authoritative
4. **Organize by theme** - Group related findings together

### Step 4: Write Report

```
Write(file_path: ".claude/.reports/{name}-{type}.md", content: synthesized_report)
```

## Naming Convention

```
.claude/.reports/{feature-name}-{type}.md
```

| Component | Format | Example |
|-----------|--------|---------|
| `feature-name` | kebab-case | `user-authentication` |
| `type` | research, scout, review, comparison | `research` |

**Full example**: `.claude/.reports/user-authentication-research.md`

## Quality Checklist

Before writing report:

- [ ] All agent outputs received and processed
- [ ] Duplicates removed across agents
- [ ] Conflicts resolved with rationale
- [ ] Sources deduplicated
- [ ] Template structure followed
- [ ] Timestamp included (`date +"%Y-%m-%d %H:%M"`)

## Integration with Commands

### /brainstorm

```
# After spawning agents
scouter_data = TaskOutput(task_id: scouter, block: true)
researcher_data = TaskOutput(task_id: researcher, block: true)

# Use report skill templates to write
Write(".claude/.reports/{name}-scout.md", formatted_scout_report)
Write(".claude/.reports/{name}-research.md", formatted_research_report)
```

### /run

```
# Research phase
# Synthesize multiple agent outputs per type
Write(".claude/.reports/{name}-research.md", merged_researcher_results)
Write(".claude/.reports/{name}-scout.md", merged_scouter_results)

# Review phase
Write(".claude/.reports/{name}-review.md", reviewer_result)
```

### /onboarding

```
# After scouter analysis
scouter_data = TaskOutput(task_id: scouter, block: true)

# Use scout template for project analysis report
Write(".claude/.reports/onboarding-scout.md", formatted_scout_report)
```
