# Plan: Knowledge Freshness Protocol Implementation

## Metadata
- **Created**: 2025-12-28 14:14
- **Type**: feature
- **Status**: implemented
- **Author**: planner-agent
- **Implementer**: implementer-agent
- **Discussion**: `.claude/discussions/2025-12-28-12-30-knowledge-freshness.md`
- **Decisions**: `.claude/decisions/2025-12-28-knowledge-freshness-strategy.md`

## 1. Overview

Implement a Graceful Degradation Protocol for knowledge freshness that ensures Claude always uses the freshest available knowledge source and transparently communicates the source and confidence level to users. The protocol establishes a priority chain (MCP > WebSearch > Skills > Training) and requires explicit staleness warnings when falling back to training data.

## 2. Requirements

### User Request
Implement the knowledge freshness protocol as decided in ADR `2025-12-28-knowledge-freshness-strategy.md`, creating a rule file that defines source priorities, transparency requirements, and domain-aware behavior.

### Acceptance Criteria
- [x] Knowledge source priority chain is clearly defined (MCP > WebSearch > Skills > Training)
- [x] Transparency format is specified with freshness labels (fresh / current / curated / may-be-stale)
- [x] Domain-aware behavior is documented (library -> context7, versions -> web search, etc.)
- [x] Explicit staleness warning format is defined for training data fallback
- [x] Integration with existing mcp-loader.md is seamless (no conflicts)
- [x] MCP MANIFEST.md includes freshness context for each server entry

## 3. Analysis

### Affected Files

| File | Action | Reason |
|------|--------|--------|
| `.claude/rules/knowledge-freshness.md` | Create | Core protocol definition - new rule file |
| `.claude/mcp/MANIFEST.md` | Modify | Add freshness labels and priority context to server entries |

### Dependencies
- **Internal**:
  - `.claude/rules/mcp-loader.md` - Must work alongside this rule without conflicts
  - `.claude/rules/skill-loader.md` - Pattern reference for consistent rule structure
  - `.claude/mcp/MANIFEST.md` - Registry to be updated with freshness context

### Patterns Found
- Rule file structure pattern at `.claude/rules/mcp-loader.md:1-98` - Uses sections: Purpose, Behavior, Matching, Protocol, Format, Errors
- Semantic matching approach at `.claude/rules/skill-loader.md:5-14` - Analyze -> Read -> Match -> Apply -> Confirm
- Confirmation format pattern at `.claude/rules/mcp-loader.md:52-60` - Brief inline status messages
- Error handling pattern at `.claude/rules/mcp-loader.md:74-78` - Never block user task, continue with fallback
- MANIFEST entry pattern at `.claude/mcp/MANIFEST.md:23-31` - Server name, tools, description, usage flow

## 4. Technical Design

### Architecture Decision
Create a single rule file `knowledge-freshness.md` that defines the protocol independently but integrates naturally with the existing mcp-loader and skill-loader rules. The MCP MANIFEST will be updated minimally to include freshness metadata. This approach follows the KISS principle established in the ADR decision.

**Rationale**:
- Single file reduces maintenance burden
- Leverages existing infrastructure (mcp-loader already handles MCP usage)
- Follows established rule file patterns for consistency
- Minimal MANIFEST changes preserve existing functionality

### Component Design

**Component 1: knowledge-freshness.md**
- **Responsibility**: Define knowledge source priorities, transparency requirements, and staleness warnings
- **Interface**: Rule-based instructions Claude follows when answering questions requiring external knowledge
- **Dependencies**: Reads from mcp-loader.md patterns, references MANIFEST.md servers
- **Structure**:
  1. Purpose section - Why this protocol exists
  2. Source Priority Chain - Ordered list with freshness labels
  3. Domain Mapping - Which sources to prefer for which knowledge types
  4. Transparency Protocol - Output format for source attribution
  5. Staleness Warning Format - Explicit warning templates
  6. Integration Notes - How this works with mcp-loader

**Component 2: MANIFEST.md Updates**
- **Responsibility**: Provide freshness context for each MCP server
- **Changes**: Add `**Freshness**:` field to each server entry
- **Dependencies**: None (data file)

### Data Flow

```
[User Question]
    → [Identify Knowledge Domain]
    → [Check Source Availability]
    → [Use Highest Priority Available Source]
    → [Fetch/Retrieve Knowledge]
    → [Format Response with Source Attribution]
    → [Add Staleness Warning if Training Data Used]
    → [Response to User]
```

## 5. Implementation Steps

### Phase 1: Create Knowledge Freshness Rule File

- [x] Step 1.1: Create file `.claude/rules/knowledge-freshness.md`
- [x] Step 1.2: Write Purpose section explaining the protocol's goal
- [x] Step 1.3: Define Knowledge Source Priority Chain with labels:
  - Priority 1: MCP Servers (context7, future web-search) - Label: `fresh`
  - Priority 2: WebSearch tools (if available) - Label: `current`
  - Priority 3: Local Skills/Documentation - Label: `curated`
  - Priority 4: Training Knowledge - Label: `may-be-stale`
- [x] Step 1.4: Create Domain-Aware Behavior section with mapping table:
  - Library/Framework docs -> context7 MCP first
  - Version/Release info -> Web search first
  - Best practices -> Skills first, then external
  - General knowledge -> Available sources with caveats
- [x] Step 1.5: Define Transparency Protocol with output format:
  - Source attribution format: `Source: [name] ([freshness])`
  - When to show attribution (always for domain-specific knowledge)
  - Inline vs footer placement guidance
- [x] Step 1.6: Create Staleness Warning Templates:
  - Standard warning for training data fallback
  - Warning with suggestion to verify
  - Version-specific warning for API/library questions
- [x] Step 1.7: Write Integration Notes section:
  - How this works with mcp-loader.md (mcp-loader handles MCP usage, this handles attribution)
  - How this works with skill-loader.md (skills are "curated" sources)
  - Confirmation format consistency
- [x] Step 1.8: Add Examples section showing the protocol in action:
  - Example with MCP available (fresh)
  - Example with MCP unavailable, skills used (curated)
  - Example falling back to training data (may-be-stale with warning)
- [x] Step 1.9: Add Error Handling section following mcp-loader pattern:
  - Never block user task due to attribution issues
  - Default to most conservative freshness label when uncertain

### Phase 2: Update MCP MANIFEST

- [x] Step 2.1: Read current MANIFEST.md structure
- [x] Step 2.2: Add `**Freshness**:` field to context7 entry:
  - Value: `fresh` - Real-time documentation fetch
  - Note: Authoritative for library/framework questions
- [x] Step 2.3: Add `**Freshness**:` field to sequential-thinking entry:
  - Value: N/A (not a knowledge source, but a reasoning tool)
  - Note: Explain why freshness doesn't apply
- [x] Step 2.4: Update "Adding New MCP Servers" section:
  - Include `**Freshness**:` in the example entry template
  - Add guidance on when servers are "fresh" vs "current"

### Phase 3: Verification

- [x] Step 3.1: Review knowledge-freshness.md for completeness:
  - All sections from ADR are included
  - Examples are clear and actionable
  - No conflicts with existing rules
- [x] Step 3.2: Review MANIFEST.md updates:
  - Freshness fields are consistent with protocol
  - Example template is updated
- [x] Step 3.3: Verify integration coherence:
  - mcp-loader.md unchanged but compatible
  - skill-loader.md unchanged but compatible
  - No contradictory instructions

## 6. Test Strategy (Optional - User will be asked)

If tests are requested, verification would include:
- [ ] Manual test: Ask a library question with context7 available - Should see "fresh" attribution
- [ ] Manual test: Ask a library question with context7 unavailable - Should see "may-be-stale" warning
- [ ] Manual test: Ask a best practices question - Should check skills first, note "curated"
- [ ] Manual test: Ask a version/release question - Should warn if no web search available

## 7. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Verbose attribution clutters responses | Medium | Define when to omit (simple/obvious questions), use inline format |
| Users confused by freshness labels | Low | Include brief explanation in first use, consistent terminology |
| Rule conflicts with mcp-loader | Medium | Clearly separate concerns (mcp-loader = usage, this = attribution) |
| MCP availability detection unreliable | Low | Default to "may-be-stale" when uncertain, never block task |
| Over-warning reduces user trust | Medium | Reserve strong warnings for genuinely uncertain info (API versions, syntax) |

## 8. Progress Tracking

- [x] Phase 1 complete: knowledge-freshness.md created
- [x] Phase 2 complete: MANIFEST.md updated
- [x] Phase 3 complete: Verification passed
- [ ] Review complete

---

## Appendix: File Content Specifications

### knowledge-freshness.md Structure

```
# Knowledge Freshness Protocol

## Purpose
[Why this exists - transparency and best available source]

## Auto-Activation
[When this protocol applies - any task requiring external knowledge]

## Source Priority Chain
[Table: Priority, Source, Label, Examples]

## Domain-Aware Behavior
[Table: Domain, Preferred Source, Fallback]

## Transparency Protocol
[Format specifications, when to show, placement]

## Staleness Warning Templates
[Warning formats for training data fallback]

## Integration with Other Rules
[How this works with mcp-loader, skill-loader]

## Examples
[3-4 complete examples showing protocol in action]

## Error Handling
[Never block, default behaviors]
```

### MANIFEST.md Changes

Add to each server entry after `**Usage Flow**:`:
```markdown
**Freshness**: fresh | current | N/A
**Freshness Note**: [Optional explanation]
```

Update example template to include freshness field.
