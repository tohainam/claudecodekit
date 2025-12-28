# Discussion: Automatic Skill Loading for Claude Code

## Metadata
- **Created**: 2025-12-28 11:56
- **Type**: design
- **Status**: concluded
- **Participants**: user, facilitator-agent
- **Related ADR**: (pending user confirmation)

## 1. Topic Summary

Discussion about implementing automatic skill discovery and loading for Claude Code. As the project grows with more skills, the user wants a system that automatically checks available skills, loads relevant ones based on task context, and provides visual confirmation of loaded skills - all without manual intervention.

## 2. Context

### Background
The current Claude Code setup has 12 skills in `.claude/skills/`, but each agent has hardcoded skill assignments in their frontmatter. When new skills are added, agents don't automatically benefit from them. The user anticipates adding many more skills and wants a future-proof system.

### Current State
- **Skills Available**: 12 (architecture, code-quality, debugging, documentation, git-workflow, performance, project-analysis, refactoring, security-review, skill-creator, testing)
- **Loading Mechanism**: Declarative via agent frontmatter (`skills: name1, name2`)
- **Limitation**: Skills not in agent frontmatter are never loaded

### Current Agent -> Skill Assignments
| Agent | Skills |
|-------|--------|
| planner | architecture, code-quality |
| implementer | code-quality, testing |
| facilitator | architecture, code-quality |
| test-writer | testing |
| refactorer | refactoring, code-quality |
| debugger | debugging |
| code-reviewer | code-quality, security-review |
| security-auditor | security-review |
| doc-writer | documentation |

### Unused Skills (not assigned to any agent)
- git-workflow
- performance
- project-analysis
- skill-creator

### Constraints Identified
- Claude Code loads skills via agent frontmatter - declarative, not dynamic at runtime
- The `<command-name>` tag mechanism can load skills at command execution time
- Skills have `SKILL.md` with frontmatter containing descriptions

## 3. Requirements Gathered

### User Needs
1. Automatic checking of available skills before any operation
2. Context-based loading of relevant skills (no manual specification)
3. Visual confirmation of which skills are loaded
4. Works for ALL operations (commands, agents, direct chat)
5. Easy to maintain as new skills are added

### Scope Definition

**In Scope:**
- Central skill registry/manifest
- Auto-discovery rule for all operations
- Keyword/trigger-based skill matching
- Visual confirmation of loaded skills

**Out of Scope:**
- Dedicated /skills command (existing default command handles this)
- Modifying all individual agents
- Runtime dynamic loading mid-conversation

### Acceptance Criteria
- [ ] GIVEN a task description WHEN Claude starts the operation THEN it automatically scans available skills
- [ ] GIVEN relevant keywords in task WHEN skill triggers match THEN those skills are loaded
- [ ] GIVEN skills are loaded WHEN operation begins THEN user sees confirmation message
- [ ] GIVEN a new skill is added WHEN manifest is updated THEN auto-loading includes it

## 4. Approaches Explored

### Approach A: Manifest + Rule-Based Auto-Discovery (SELECTED)
| Aspect | Assessment |
|--------|------------|
| Pros | Single manifest to maintain, works for all operations, explicit keyword mapping, systematic |
| Cons | Requires manifest maintenance, keyword matching can miss nuances |
| Risks | Keywords may need tuning over time |
| Effort | Medium |

### Approach B: Enhanced Agent Protocol
| Aspect | Assessment |
|--------|------------|
| Pros | Uses existing skill descriptions, context-aware |
| Cons | Need to modify 9 agents, adds overhead |
| Risks | Inconsistent if agent is missed |
| Effort | High |

### Approach C: Universal CLAUDE.md Protocol
| Aspect | Assessment |
|--------|------------|
| Pros | Works for all operations, single location |
| Cons | CLAUDE.md grows, relies on Claude following instructions |
| Risks | No enforcement mechanism |
| Effort | Low |

### Approach D: Skill-Loader Command + Integration
| Aspect | Assessment |
|--------|------------|
| Pros | Explicit control, user visibility |
| Cons | Extra step unless integrated, user may forget |
| Risks | Workflow friction |
| Effort | Medium |

### Comparison Matrix
| Factor | A: Manifest+Rule | B: Agent Protocol | C: CLAUDE.md | D: /skills Command |
|--------|------------------|-------------------|--------------|---------------------|
| Covers all operations | Yes | Commands only | Yes | If integrated |
| Automatic | Yes | Yes | Mostly | Needs integration |
| Maintainability | Medium | Low | Medium | High |
| Reliability | High | High | Medium | High |
| Effort | Medium | High | Low | Medium |

## 5. Decision

### Selected Approach
**Approach A: Manifest + Rule-Based Auto-Discovery**

### Rationale
1. **Central manifest** provides single source of truth for all skill metadata
2. **Rule-based discovery** ensures automatic checking for all operations
3. **Keyword triggers** enable context-aware loading without modifying agents
4. **Easy maintenance** - adding a new skill just requires updating the manifest
5. **Future-proof** - scales well as skills library grows

### Trade-offs Accepted
- Keyword matching may occasionally miss nuanced contexts - acceptable, can refine triggers over time
- Manifest requires maintenance when adding skills - acceptable, single file with simple format
- Rule adds small overhead to every operation - acceptable, ensures consistency

### Implementation Components
1. `.claude/skills/MANIFEST.md` - Skill registry with triggers
2. `.claude/rules/skill-loader.md` - Auto-discovery rule

## 6. Open Questions
- [ ] Should skill loading be verbose (show all available) or minimal (show only loaded)?
- [ ] How to handle skill conflicts or overlaps?

## 7. Next Steps
1. Run `/plan --discussion .claude/discussions/2025-12-28-11-56-skill-auto-loading.md` to create implementation plan
2. Create `.claude/skills/MANIFEST.md` with all current skills
3. Create `.claude/rules/skill-loader.md` with discovery logic
4. Test with various commands to verify auto-loading works

---
*Discussion facilitated by facilitator-agent*
*Ready for: /plan or /feature workflow*
