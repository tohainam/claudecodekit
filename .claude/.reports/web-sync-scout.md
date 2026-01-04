# Scout Report: Web Sync Analysis

**Generated**: 2026-01-04
**Task**: Phân tích gaps giữa CCK và web/

## Executive Summary

Web documentation cần cập nhật để sync với CCK:
- **Commands**: Web hiển thị 2, CCK có 4 (thiếu `/onboarding`, `/view-docs`)
- **Skills**: Web hiển thị 9 skills, CCK có 10 skills (thiếu `report`)
- Một số content và metadata cần update

## CCK Current State

### Commands (4 total)

| Command | Status in Web |
|---------|---------------|
| `/brainstorm` | ✅ Có |
| `/run` | ✅ Có |
| `/onboarding` | ❌ **THIẾU** |
| `/view-docs` | ❌ **THIẾU** |

### Skills (10 total)

| Skill | SKILL.md Location | Status in Web |
|-------|-------------------|---------------|
| debug | `debug/skill.md` | ✅ Có |
| documentation | `documentation/SKILL.md` | ✅ Có |
| gemini | `gemini/SKILL.md` | ✅ Có |
| git-workflow | `git-workflow/SKILL.md` | ✅ Có |
| implementation | `implementation/SKILL.md` | ✅ Có |
| planning | `planning/SKILL.md` | ✅ Có |
| report | `report/SKILL.md` | ❌ **THIẾU** |
| security-audit | `security-audit/SKILL.md` | ✅ Có |
| skill-creator | `skill-creator/SKILL.md` | ✅ Có |
| testing | `testing/SKILL.md` | ✅ Có |

## CCK Changes Summary

### New Components (cần thêm vào web)

| Type | Name | Description |
|------|------|-------------|
| **command** | `/onboarding` | First-time setup - analyzes project, generates CLAUDE.md |
| **command** | `/view-docs` | Local docs viewer với browser UI |
| **skill** | `report` | Report synthesis với templates |

### Updated Components (cần review content)

| Component | Changes |
|-----------|---------|
| `/brainstorm` | Scaling guidelines, parallel agent patterns |
| `/run` | Artifact ingestion, research/review/commit patterns, error handling |
| `researcher` | Execution flow phases, output templates |
| `scouter` | 4-phase execution, search patterns |
| `reviewer` | Review checklist, severity levels, verdict guidelines |
| `debug` | Updated 5-phase methodology |
| `gemini` | References và examples |

## Gap Analysis

### Missing in Web

| Type | Name | Priority |
|------|------|----------|
| command | `/onboarding` | HIGH |
| command | `/view-docs` | HIGH |
| skill | `report` | HIGH |

### Outdated Content (cần verify)

| Section | Check |
|---------|-------|
| `/brainstorm` content | Verify scaling guidelines |
| `/run` content | Verify artifact ingestion table |
| Agent descriptions | Verify execution patterns |
| Skills count | Currently "8 Extensible Skills" → should be "10" |

## Web Structure

```
web/
├── index.html   # 116KB, 2374 lines - ALL content hardcoded
├── css/
│   └── styles.css  # 1649 lines, light/dark themes
└── js/
    └── app.js      # 665 lines, interactive features
```

### Current Sections
- Commands: 2 (brainstorm, run)
- Workflows: 7 (feature, bugfix, hotfix, refactor, research, review, docs)
- Agents: 3 (researcher, scouter, reviewer)
- Skills: 9 (thiếu report)
- Examples: 3

## Action Items

### Priority 1: Add Missing Content
1. Add `/onboarding` command section
2. Add `/view-docs` command section
3. Add `report` skill section
4. Update sidebar navigation

### Priority 2: Update Existing Content
5. Review và update `/brainstorm` content
6. Review và update `/run` content
7. Review và update agent descriptions
8. Update skills count (8 → 10)

### Priority 3: Metadata
9. Update version numbers
10. Verify all links work
