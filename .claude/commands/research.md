---
description: Deep internet research for libraries, best practices, comparisons, and troubleshooting
allowed-tools: Task, Read, Write, WebSearch, WebFetch
argument-hint: <topic to research>
---

# Research Topic

You are performing deep internet research to understand external libraries, frameworks, best practices, comparisons, or troubleshooting. This command runs comprehensive analysis across three dynamically-selected research dimensions based on topic type classification.

## Input
Research topic: $ARGUMENTS

## Workflow Phases

### Phase 1: Topic Analysis and Dimension Selection

Analyze the research topic to classify its type and select 3 appropriate research dimensions.

**Step 1: Classify Topic Type**

Apply this classification algorithm to the topic:

```
topic_lower = lowercase("$ARGUMENTS")

// Check patterns in priority order
if matches(topic_lower, ["error", "issue", "problem", "not working", "fails", "bug", "troubleshoot"]):
  topic_type = TROUBLESHOOTING

else if matches(topic_lower, ["vs", "versus", "compare", "comparison", "difference", "better", "or"]):
  topic_type = COMPARISON

else if matches(topic_lower, ["secure", "security", "vulnerability", "CVE", "safe", "attack", "exploit"]):
  topic_type = SECURITY

else if matches(topic_lower, ["fast", "slow", "benchmark", "optimize", "optimization", "performance"]):
  topic_type = PERFORMANCE

else if matches(topic_lower, ["new", "latest", "release", "update", "version", "changelog"]):
  topic_type = CURRENT_STATE

else if matches(topic_lower, ["best", "recommended", "should", "proper", "right way", "practice"]):
  topic_type = BEST_PRACTICE

else if matches(topic_lower, ["how to", "how do", "guide", "tutorial", "learn", "getting started"]):
  topic_type = HOW_TO

else:
  topic_type = DEFAULT
```

**Step 2: Select 3 Dimensions**

Based on classified topic type, select exactly 3 research dimensions:

| Topic Type | Selected Dimensions |
|------------|---------------------|
| TROUBLESHOOTING | troubleshooting, official-docs, current-state |
| COMPARISON | comparisons, official-docs, performance |
| SECURITY | security, official-docs, best-practices |
| PERFORMANCE | performance, official-docs, best-practices |
| CURRENT_STATE | current-state, official-docs, examples |
| BEST_PRACTICE | best-practices, examples, official-docs |
| HOW_TO | official-docs, examples, best-practices |
| DEFAULT | official-docs, best-practices, examples |

**Step 3: Announce Analysis**

Output:
```
Analyzing topic: "$ARGUMENTS"
Topic type detected: [TOPIC_TYPE]
Selected dimensions: [Dimension 1], [Dimension 2], [Dimension 3]

Launching 3 parallel research instances...
```

### Phase 2: Launch Parallel Researcher Instances

Spawn 3 parallel researcher agent instances, each focusing on one selected dimension.

**Important**: Replace `[DIMENSION_1]`, `[DIMENSION_2]`, `[DIMENSION_3]` with the actual dimensions selected in Phase 1.

#### Instance 1: First Dimension

```
Task: Launch researcher agent for [DIMENSION_1] research
Prompt: "Research the following topic with focus on [DIMENSION_1]: $ARGUMENTS

Dimension: [DIMENSION_1]

Your task:
[Include dimension-specific goals from the mapping below]

Output ONLY the '[Section Title]' section of the report.

Follow the researcher agent research process:
1. Topic Analysis - Extract key terms, formulate search strategy
2. Internet Search - Use WebSearch/WebFetch/context7 to find sources
3. Information Analysis - Critically evaluate and extract key insights
4. Report Generation - Output structured findings with source attribution

Use the [DIMENSION_1] section template from your agent definition.

Tool Strategy:
- Primary: [Primary tools for this dimension]
- Secondary: [Secondary tools]
- Fallback: Training knowledge with staleness warning

Source Attribution:
- Include URLs for all web sources
- Add publication/update dates
- Note source authority (official docs > blogs > forums)
- Follow knowledge-freshness protocol for confidence levels"

Subagent: researcher
```

#### Dimension-Specific Configurations

**For official-docs dimension:**
```
Goals:
- Find official documentation and API references
- Identify version-specific syntax and features
- Document installation and setup procedures
- Extract code examples from official sources

Primary Tools: context7 MCP (if library supported), WebFetch
Section Title: ## Official Documentation
```

**For best-practices dimension:**
```
Goals:
- Discover community-recommended patterns
- Identify common pitfalls and how to avoid them
- Find production-proven approaches
- Document do's and don'ts

Primary Tools: WebSearch
Section Title: ## Best Practices
```

**For comparisons dimension:**
```
Goals:
- Compare features between alternatives
- Analyze trade-offs objectively
- Document use cases for each option
- Provide decision-making criteria

Primary Tools: WebSearch
Section Title: ## Comparison Analysis
```

**For examples dimension:**
```
Goals:
- Find real-world code examples
- Identify common usage patterns
- Document integration examples
- Provide copy-paste starter code

Primary Tools: WebSearch
Section Title: ## Code Examples
```

**For current-state dimension:**
```
Goals:
- Find latest version numbers and releases
- Document recent changes and new features
- Identify breaking changes
- Track deprecations and migrations

Primary Tools: WebSearch
Section Title: ## Current State & Releases
```

**For troubleshooting dimension:**
```
Goals:
- Find solutions to specific errors
- Document debugging approaches
- Identify known issues and workarounds
- Provide step-by-step fixes

Primary Tools: WebSearch
Section Title: ## Troubleshooting
```

**For security dimension:**
```
Goals:
- Identify security vulnerabilities (CVEs)
- Document secure configuration practices
- Find security advisories
- Provide hardening recommendations

Primary Tools: WebSearch
Section Title: ## Security
```

**For performance dimension:**
```
Goals:
- Find performance benchmarks
- Document optimization techniques
- Compare performance between alternatives
- Identify performance bottlenecks

Primary Tools: WebSearch
Section Title: ## Performance
```

#### Instance 2: Second Dimension

```
Task: Launch researcher agent for [DIMENSION_2] research
Prompt: "Research the following topic with focus on [DIMENSION_2]: $ARGUMENTS

Dimension: [DIMENSION_2]

Your task:
[Include dimension-specific goals from mapping above]

Output ONLY the '[Section Title]' section of the report.

Follow the researcher agent research process:
1. Topic Analysis - Extract key terms, formulate search strategy
2. Internet Search - Use WebSearch/WebFetch/context7 to find sources
3. Information Analysis - Critically evaluate and extract key insights
4. Report Generation - Output structured findings with source attribution

Use the [DIMENSION_2] section template from your agent definition.

Tool Strategy:
- Primary: [Primary tools for this dimension]
- Secondary: [Secondary tools]
- Fallback: Training knowledge with staleness warning

Source Attribution:
- Include URLs for all web sources
- Add publication/update dates
- Note source authority (official docs > blogs > forums)
- Follow knowledge-freshness protocol for confidence levels"

Subagent: researcher
```

#### Instance 3: Third Dimension

```
Task: Launch researcher agent for [DIMENSION_3] research
Prompt: "Research the following topic with focus on [DIMENSION_3]: $ARGUMENTS

Dimension: [DIMENSION_3]

Your task:
[Include dimension-specific goals from mapping above]

Output ONLY the '[Section Title]' section of the report.

Follow the researcher agent research process:
1. Topic Analysis - Extract key terms, formulate search strategy
2. Internet Search - Use WebSearch/WebFetch/context7 to find sources
3. Information Analysis - Critically evaluate and extract key insights
4. Report Generation - Output structured findings with source attribution

Use the [DIMENSION_3] section template from your agent definition.

Tool Strategy:
- Primary: [Primary tools for this dimension]
- Secondary: [Secondary tools]
- Fallback: Training knowledge with staleness warning

Source Attribution:
- Include URLs for all web sources
- Add publication/update dates
- Note source authority (official docs > blogs > forums)
- Follow knowledge-freshness protocol for confidence levels"

Subagent: researcher
```

### Phase 3: Wait for Completion

All three researcher instances will run in parallel. Wait for all to complete before proceeding.

Output progress:
```
Research instance 1 ([DIMENSION_1]): ✓ Complete
Research instance 2 ([DIMENSION_2]): ✓ Complete
Research instance 3 ([DIMENSION_3]): ✓ Complete

Consolidating research findings...
```

### Phase 4: Consolidate Research Report

Once all three instances complete:

**Step 1: Extract Results**

Capture the three report sections:
- Section 1 from first dimension instance
- Section 2 from second dimension instance
- Section 3 from third dimension instance

**Step 2: Determine Confidence Level**

Based on source freshness across all sections:
- **High**: Multiple fresh web sources (2024-2025), official documentation included
- **Medium**: Fresh sources but limited coverage, or mixed freshness (some older)
- **Low**: Primarily training knowledge fallback, or sources older than 12 months

**Step 3: Create Consolidated Report**

Combine into single document with this structure:

```markdown
# Research Report: [Topic]

**Generated**: [YYYY-MM-DD HH:MM]
**Topic**: $ARGUMENTS
**Scope**: Internet research ([Dimension 1], [Dimension 2], [Dimension 3])
**Topic Type**: [Classified type from Phase 1]
**Confidence Level**: [High/Medium/Low based on source freshness]

---

[Section from instance 1]

---

[Section from instance 2]

---

[Section from instance 3]

---

## Summary

**Key Findings:**
- [Extract 2-3 most important insights from section 1]
- [Extract 2-3 most important insights from section 2]
- [Extract 2-3 most important insights from section 3]

**Recommended Actions:**
- [Actionable recommendation based on research]
- [Actionable recommendation based on research]

**Most Referenced Sources:**
- [URL 1] - [Source description]
- [URL 2] - [Source description]
- [URL 3] - [Source description]

**Research Limitations:**
[Note any gaps in research, unavailable tools, or areas needing deeper investigation]

**Next Steps:**
- For implementation: Use `/plan` to create implementation plan with this context
- For discussion: Use `/discuss` to explore trade-offs and decisions
- For deeper dive: Run `/research` on specific sub-topics identified

---
*Research report generated by parallel researcher agent instances*
*Confidence level reflects source freshness and availability*
```

**Step 4: Save Report**

Write the consolidated report to:
`.claude/.reports/YYYY-MM-DD-HH-MM-research-<sanitized-topic>.md`

Filename sanitization rules:
- Replace spaces with hyphens: `" "` → `"-"`
- Remove special characters except hyphens: keep only `a-z`, `0-9`, `-`
- Convert to lowercase
- Truncate to 50 characters max
- Example: "Prisma vs TypeORM performance" → "prisma-vs-typeorm-performance"

```bash
# Get current datetime for filename
date +"%Y-%m-%d-%H-%M"
```

### Phase 5: Output Summary

Provide user with completion summary:

```
✅ Research Report Complete

**Topic**: $ARGUMENTS
**Topic Type**: [Classified type]
**Dimensions Researched**: [Dimension 1], [Dimension 2], [Dimension 3]
**Confidence Level**: [High/Medium/Low]

**Report**: .claude/.reports/[filename].md

**Key Findings:**
- [1-2 line summary from dimension 1]
- [1-2 line summary from dimension 2]
- [1-2 line summary from dimension 3]

**Top Sources Consulted**:
- [URL 1]
- [URL 2]
- [URL 3]

**Recommended Next Steps:**
- [Contextual suggestion based on topic type and findings]

You can now:
- Read the full report: `cat .claude/.reports/[filename].md`
- Create implementation plan: `/plan [feature based on findings]`
- Discuss approach: `/discuss [topic based on findings]`
- Research deeper: `/research [specific sub-topic]`
```

## Topic Type Examples

To help with classification, here are concrete examples:

| Example Topic | Classified As | Selected Dimensions |
|---------------|---------------|---------------------|
| "Prisma vs TypeORM" | COMPARISON | comparisons, official-docs, performance |
| "React hydration error" | TROUBLESHOOTING | troubleshooting, official-docs, current-state |
| "Redis caching best practices" | BEST_PRACTICE | best-practices, examples, official-docs |
| "How to use Prisma migrations" | HOW_TO | official-docs, examples, best-practices |
| "JWT security vulnerabilities" | SECURITY | security, official-docs, best-practices |
| "Optimize Next.js bundle size" | PERFORMANCE | performance, official-docs, best-practices |
| "Latest React 19 features" | CURRENT_STATE | current-state, official-docs, examples |
| "PostgreSQL database" | DEFAULT | official-docs, best-practices, examples |

## Error Handling

### Dimension Selection Fallback

If topic classification is uncertain or doesn't match any pattern:
- Default to: [official-docs, best-practices, examples]
- Note in report: "Topic type: DEFAULT (general research)"
- These 3 dimensions provide broad coverage for any topic

### Instance Failure

If one of the three researcher instances fails:
- Continue with successful instances
- Create report with available sections
- Note in consolidated report which dimension is missing
- Example: "Note: Security analysis unavailable due to [reason]"
- Lower confidence level if critical dimension missing

### All Instances Fail

If all three instances fail:
- Report error to user
- Explain which tools were unavailable
- Suggest manual research directions
- Do not create empty report file

### WebSearch Unavailable

If WebSearch tool is unavailable:
- Researcher agents will fall back to:
  1. context7 MCP (if applicable)
  2. Training knowledge (with staleness warning)
- Report will have lower confidence level
- Add prominent note about tool unavailability

### Topic Too Broad

If topic is extremely broad (e.g., "JavaScript"):
- Proceed with research but note scope limitation
- Focus on most critical aspects
- Add to report: "Note: Topic is broad; research focuses on core aspects. Consider more specific topics for detailed analysis."
- Suggest specific sub-topics in "Next Steps"

## User Checkpoints

This workflow runs automatically without user checkpoints. All research is non-invasive (read-only operations).

The user will receive:
1. Initial topic analysis announcement
2. Progress updates as instances complete
3. Final consolidated report
4. Summary with key findings and next steps

## Output

At completion:
- Consolidated research report saved to `.claude/.reports/`
- Summary of key findings displayed to user
- Confidence level assessment
- Recommended next steps based on topic type

## Integration Notes

This command can be invoked:

1. **Manually by user**: `/research <topic>`
2. **Auto-invoked by facilitator**: When discussing non-code topics
3. **Auto-invoked by planner**: When external libraries detected in requirements

The output format and process are the same regardless of invocation method.

## Next Steps After Research

Based on topic type, suggest appropriate next actions:

- **COMPARISON**: `/discuss` to make decision between options
- **HOW_TO / BEST_PRACTICE**: `/plan` to implement the learned approach
- **TROUBLESHOOTING**: Apply solutions found, or `/plan` for fix implementation
- **SECURITY**: `/plan` to implement security improvements
- **PERFORMANCE**: `/plan` to implement optimizations
- **CURRENT_STATE**: `/plan` to adopt new features, or further `/research` on specific features
- **DEFAULT**: `/discuss` to explore how to apply findings, or `/plan` to implement

---

*Research command for standalone deep internet research*
*Supports Topic-Adaptive Dimensions with parallel execution*
