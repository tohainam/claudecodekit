# Discussion: Implementing the /onboard Command

## Metadata
- **Created**: 2025-12-28 11:07
- **Type**: design + requirements
- **Status**: concluded
- **Participants**: user, facilitator-agent
- **Related ADR**: [ADR-001: Onboard Command Design](../decisions/2025-12-28-onboard-command-design.md)

## 1. Topic Summary

This discussion explored the implementation of a `/onboard` command that auto-analyzes codebases and recommends Claude Code configuration (rules, skills, subagents). The feature addresses the problem of repetitive manual setup when starting with new projects. After evaluating four approaches, we selected a lean implementation that follows existing project patterns.

## 2. Context

### Background

When users adopt this Claude Code configuration toolkit for a new project, they face:
- Uncertainty about which rules to create
- Time-consuming manual codebase analysis
- Repetitive setup across projects
- No guidance on paths targeting for rules

A design document (NEW.md) proposed a comprehensive solution with auto-detection, recommendations, and optional auto-application.

### Constraints Identified

| Constraint | Type | Impact |
|------------|------|--------|
| Skills should be < 500 lines | Technical | Must use progressive disclosure with reference files |
| Commands should be thin orchestrators | Structural | Logic belongs in skill, not command |
| Context window is shared resource | Resource | Minimize tokens loaded at runtime |
| Project-level placement | Architectural | Part of reusable toolkit, not user-level |

### Related Artifacts

- Design document: `/Users/tohainam/Desktop/work/learn-claude-code/NEW.md`
- Existing pattern reference: `.claude/skills/skill-creator/SKILL.md`
- Command pattern reference: `.claude/commands/feature.md`

## 3. Requirements Gathered

### User Needs

1. Auto-detect tech stack from manifest files (package.json, requirements.txt, go.mod, etc.)
2. Analyze project structure and identify key directories
3. Recommend rules with accurate paths targeting
4. Generate ONBOARD-REPORT.md with all findings
5. Optional `--apply` flag to auto-generate all files
6. Support for monorepos and hybrid projects
7. Incremental updates when re-running on existing projects

### Scope Definition

**In Scope:**
- Tech stack detection (8+ languages, 14+ frameworks)
- Structure analysis (source, tests, config, CI/CD)
- Rules recommendations with paths
- Skills recommendations (universal vs project-specific)
- CLAUDE.md draft generation
- Monorepo support with domain grouping
- Incremental update support (merge behavior)

**Out of Scope:**
- Separate subagent (use skill directly)
- User-level installation (~/.claude/)
- Interactive wizard mode
- Custom template authoring UI

### Acceptance Criteria

- [ ] GIVEN a project with package.json WHEN running /onboard THEN detect Node.js and framework
- [ ] GIVEN a monorepo WHEN running /onboard THEN group recommendations by detected domains
- [ ] GIVEN existing .claude/rules/ WHEN running /onboard THEN show diff without overwriting
- [ ] GIVEN --apply flag WHEN running /onboard THEN create all recommended files
- [ ] GIVEN any project type WHEN running /onboard THEN complete analysis in < 30 seconds

## 4. Approaches Explored

### Approach A: Full Implementation (As Designed in NEW.md)

| Aspect | Assessment |
|--------|------------|
| Description | Separate subagent, 4-file skill, complete template library |
| Pros | Complete solution, handles all cases, future-proof |
| Cons | High implementation effort, large skill file, maintenance burden |
| Risks | Template bloat, context window pressure, harder to iterate |
| Effort | High (5+ files, 2000+ lines) |

### Approach B: Lean Implementation (Selected)

| Aspect | Assessment |
|--------|------------|
| Description | No subagent, single skill with references, follows existing patterns |
| Pros | Follows proven patterns, maintainable, faster to implement |
| Cons | Less "pure" separation, detection logic in skill body |
| Risks | May need refactoring if scope grows significantly |
| Effort | Medium (4 files, ~1300 lines) |

### Approach C: Command-Only (Minimal)

| Aspect | Assessment |
|--------|------------|
| Description | All logic in single command file |
| Pros | Simplest initial implementation |
| Cons | Unmaintainable as templates grow, violates command pattern |
| Risks | Technical debt accumulation |
| Effort | Low initially, High to maintain |

### Approach D: Interactive Wizard

| Aspect | Assessment |
|--------|------------|
| Description | User answers questions instead of auto-detection |
| Pros | 100% accurate, user control |
| Cons | Slower workflow, defeats automation purpose |
| Risks | Users may not know their full stack |
| Effort | Medium |

### Comparison Matrix

| Factor | A: Full | B: Lean | C: Minimal | D: Wizard |
|--------|---------|---------|------------|-----------|
| Implementation effort | High | Medium | Low | Medium |
| Maintenance burden | High | Low | High | Medium |
| Follows project patterns | Partial | Yes | No | Partial |
| Detection accuracy | Good | Good | Good | Perfect |
| User experience | Best | Good | Good | Slower |
| Extensibility | Excellent | Good | Poor | Good |
| Context window impact | High | Low | Medium | Low |

## 5. Decision

### Selected Approach

**Approach B: Lean Implementation**

### Rationale

1. **Pattern Consistency**: The `skill-creator` skill in this project uses exactly this pattern - SKILL.md under 500 lines with reference files for detailed content.

2. **No Subagent Needed**: Existing agents like `planner` handle complex analysis without spawning sub-subagents. Commands can invoke Claude directly with skill knowledge.

3. **Progressive Disclosure**: Detection tables and templates load on-demand from reference files, keeping context usage efficient.

4. **Maintainability**: 4 files vs 6+ in full design. Easier to update, debug, and understand.

5. **Same Functionality**: Achieves all goals from NEW.md without unnecessary complexity.

### Trade-offs Accepted

| Trade-off | Why Acceptable |
|-----------|----------------|
| Less modular than full design | Pattern consistency outweighs theoretical purity |
| Detection logic in skill | Keeps related concerns together, easier to maintain |
| No dedicated analyzer agent | Command + skill is sufficient for this use case |

### Key Design Decisions

#### Monorepo Handling
- Best-effort detection with domain grouping
- Group recommendations by detected tech stack locations
- Let user confirm/remove unwanted sections

#### Incremental Updates
- Merge behavior: never overwrite existing files
- Show diff: "New recommendations vs existing"
- Only suggest additions

#### Template Maintenance
- Built-in templates in `rules-templates.md`
- Optional user overrides via `custom-templates.md` (gitignored)
- Templates versioned with the config project

### Proposed File Structure

```
.claude/
├── commands/
│   └── onboard.md                    # ~100 lines (orchestration)
├── skills/
│   └── project-analysis/
│       ├── SKILL.md                  # ~400 lines (workflow + detection)
│       └── references/
│           ├── tech-detection.md     # ~300 lines (detection tables)
│           └── rules-templates.md    # ~500 lines (rule templates)
```

## 6. Open Questions

- [ ] Should we add language detection via file extensions as fallback?
- [ ] How to handle projects with no manifest files (legacy projects)?
- [ ] Should templates include example code snippets or just guidelines?

## 7. Next Steps

1. Run `/plan --discussion .claude/discussions/2025-12-28-11-07-onboard-command.md`
2. Implement in phases:
   - Phase 1: Skill SKILL.md + tech-detection.md
   - Phase 2: rules-templates.md
   - Phase 3: onboard.md command
   - Phase 4: Testing with sample projects
3. Update CLAUDE.md to document the new command

---

*Discussion facilitated by facilitator-agent*
*Ready for: /plan or /feature workflow*
