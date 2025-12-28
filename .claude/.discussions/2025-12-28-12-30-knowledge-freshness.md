# Discussion: Knowledge Freshness Strategy

## Metadata
- **Created**: 2025-12-28 12:30
- **Type**: trade-off
- **Status**: concluded
- **Participants**: user, facilitator-agent
- **Related ADR**: `.claude/decisions/2025-12-28-knowledge-freshness-strategy.md`

## 1. Topic Summary

Discussion about improving knowledge freshness in Claude Code operations. The user identified that Claude often works with outdated knowledge during implementation, research, or idle tasks. The goal is to establish a comprehensive strategy that ensures Claude always uses the most up-to-date information available, regardless of which tools are present.

## 2. Context

### Background
The user observed that Claude frequently relies on training data that may be outdated, leading to:
- Using deprecated APIs or outdated library syntax
- Suggesting old best practices instead of current ones
- Not knowing latest versions of tools/frameworks
- Missing recent changes in specifications or documentation

### Current State
- `context7` MCP server exists for fetching library documentation
- `mcp-loader.md` rule handles semantic matching for MCP tools
- No systematic approach to knowledge freshness across all domains
- No fallback strategy when MCP servers are unavailable

### Constraints Identified
- MCP servers may not always be available
- Different knowledge types require different sources
- Solution must work across all Claude Code operations
- Should not add significant overhead to simple tasks
- Must be transparent about knowledge source and confidence

### Related Artifacts
- Existing rule: `.claude/rules/mcp-loader.md`
- MCP registry: `.claude/mcp/MANIFEST.md`
- Previous discussion: `.claude/discussions/2025-12-28-11-56-skill-auto-loading.md`

## 3. Requirements Gathered

### User Needs
1. **Works without MCP**: Solution must function even when context7 or other MCP servers are unavailable
2. **Multiple sources**: Combine MCP, WebSearch, Skills, and other tools as available
3. **Broader scope**: Cover library docs, best practices, version info, general knowledge
4. **Proactive fetching**: Claude should check freshness automatically, not wait for user to ask
5. **Transparency**: User should always know the knowledge source and confidence level

### Scope Definition

**In Scope:**
- Knowledge source priority protocol
- Graceful degradation strategy
- Transparency requirements (source attribution)
- Staleness warnings
- Integration with existing MCP and skill loaders

**Out of Scope:**
- Adding new MCP servers (separate task)
- Caching mechanism for fetched knowledge
- Automatic knowledge refresh scheduling
- Per-skill knowledge dependencies

### Acceptance Criteria
- [ ] GIVEN any task requiring external knowledge WHEN Claude starts THEN it identifies knowledge domains needed
- [ ] GIVEN available MCP servers WHEN knowledge is needed THEN Claude uses MCP first
- [ ] GIVEN no MCP available WHEN knowledge is needed THEN Claude uses next best source with warning
- [ ] GIVEN any knowledge source used WHEN responding THEN Claude states source and confidence level
- [ ] GIVEN training data used as fallback WHEN responding THEN Claude explicitly warns about potential staleness

## 4. Approaches Explored

### Approach A: Knowledge Freshness Rule (Minimal)
| Aspect | Assessment |
|--------|------------|
| Description | Simple rule file instructing Claude to prefer fresh sources |
| Pros | Simple, no new infrastructure, works immediately |
| Cons | Relies on Claude following instructions, no enforcement |
| Risks | May be inconsistently applied |
| Effort | Low (1 file) |

### Approach B: Knowledge Source Manifest (Structured)
| Aspect | Assessment |
|--------|------------|
| Description | Registry of all knowledge sources with capabilities and priority |
| Pros | Systematic, extensible, clear priority order |
| Cons | Another manifest to maintain |
| Risks | May not have all needed MCP servers |
| Effort | Medium (2-3 files) |

### Approach C: Proactive Knowledge Fetcher (Comprehensive)
| Aspect | Assessment |
|--------|------------|
| Description | Full system with domain detection, fetch protocol, skill integration |
| Pros | Most comprehensive, proactive, domain-aware |
| Cons | Complex, requires skill updates, more maintenance |
| Risks | Over-engineering, may slow down simple tasks |
| Effort | High (5+ files) |

### Approach D: Graceful Degradation Protocol (Pragmatic)
| Aspect | Assessment |
|--------|------------|
| Description | Focus on fallback strategy and transparency about knowledge source |
| Pros | Practical, transparent, works everywhere |
| Cons | Doesn't add new sources, just manages existing |
| Risks | Limited by available tools |
| Effort | Low-Medium (1-2 files) |

### Comparison Matrix
| Factor | A: Rule Only | B: Manifest | C: Comprehensive | D: Degradation |
|--------|--------------|-------------|------------------|----------------|
| Works without MCP | Yes | Yes | Yes | Yes |
| Multiple sources | Manual | Systematic | Fully integrated | Priority-based |
| Proactive fetching | Instructed | Semi-auto | Automatic | Per-task |
| Staleness warning | Instructed | Defined | Systematic | Always shown |
| Maintenance effort | Low | Medium | High | Low |
| Complexity | Low | Medium | High | Low |
| Extensibility | Limited | Good | Excellent | Good |

## 5. Decision

### Selected Approach
**Approach D: Graceful Degradation Protocol**

### Rationale
1. **Pragmatic**: Solves the immediate problem without over-engineering
2. **Transparent**: User always knows the knowledge source and freshness level
3. **Works everywhere**: Functions with or without MCP servers
4. **Extensible**: Can evolve to more comprehensive approach later if needed
5. **Low maintenance**: Minimal new files, leverages existing MCP manifest
6. **KISS principle**: Simple solution that addresses core need

### Trade-offs Accepted
- Does not add new knowledge sources (separate task to add more MCP servers)
- Relies on Claude following the protocol (acceptable given clear instructions)
- May need refinement based on real-world usage patterns

### Implementation Components
1. `.claude/rules/knowledge-freshness.md` - Core protocol defining:
   - Knowledge domains (library, version, practice, general)
   - Source priority (MCP > WebSearch > Skills > Training)
   - Transparency requirement (always state source used)
   - Staleness warning (explicit when using training data)

2. Update `.claude/mcp/MANIFEST.md` - Add freshness notes to existing entries

## 6. Open Questions
- [ ] Should we track which MCP servers are commonly unavailable?
- [ ] How to handle conflicting information from multiple sources?
- [ ] Should there be a "confidence score" system?

## 7. Next Steps
1. Run `/plan --discussion .claude/discussions/2025-12-28-12-30-knowledge-freshness.md` to create implementation plan
2. Create `.claude/rules/knowledge-freshness.md` with the protocol
3. Update `.claude/mcp/MANIFEST.md` with freshness-related notes
4. Test with various scenarios (with/without MCP, different knowledge types)
5. Iterate based on real-world usage

---
*Discussion facilitated by facilitator-agent*
*Ready for: /plan or /feature workflow*
