# CCK Consistency Audit Report

**Ngày**: 2026-01-04 23:28
**Workflow**: research (scout-only)
**Scope**: Toàn bộ `.claude/` framework

---

## Executive Summary

| Metric | Count |
|--------|-------|
| **Files analyzed** | 29+ |
| **Total issues** | 17 |
| **Critical** | 3 |
| **Warnings** | 11 |
| **Suggestions** | 3 |

**Verdict**: Framework có cấu trúc tốt với separation of concerns rõ ràng. Có 3 issues cần fix ngay (naming inconsistency, duplicate rules), còn lại là improvements nhỏ.

---

## Critical Issues (Fix Required)

### 1. Skill filename inconsistency
**Location**: `.claude/skills/debug/skill.md`
**Issue**: Sử dụng `skill.md` (lowercase) trong khi tất cả skills khác dùng `SKILL.md` (uppercase)
**Impact**: Inconsistent, có thể gây confusion khi glob patterns
**Fix**: Rename `skill.md` → `SKILL.md`

### 2. Duplicate security rules
**Location**:
- `.claude/rules/_global/code-quality.md:28`
- `.claude/rules/_global/safety.md:24-27`

**Issue**: Cả hai đều mention "Never log sensitive data"
```markdown
# code-quality.md:28
- Never log sensitive data (passwords, tokens, PII)

# safety.md:24-27
- Never echo secrets to console
- Never commit credentials to git
```
**Impact**: Potential confusion về authoritative source
**Fix**: Consolidate - giữ security rules trong `safety.md`, remove từ `code-quality.md`

### 3. CLAUDE.md thiếu directories
**Location**: `.claude/CLAUDE.md:18-25`
**Issue**: Directory structure không list `hooks/` và `tools/`
**Impact**: Documentation không phản ánh đúng actual structure
**Fix**: Thêm 2 entries:
```markdown
- `hooks/` - Hook scripts (inject-settings.py)
- `tools/` - CLI tools (docs-viewer.js)
```

---

## Warnings

### Agent/Command Files

| File | Issue | Recommendation |
|------|-------|----------------|
| `agents/*.md` | Nested code blocks trong templates gây rendering issues | Dùng HTML `<pre>` hoặc indent format |
| `commands/run.md:53` | Vietnamese comment trong English doc | Chuyển sang English hoặc note explicitly |
| `commands/onboarding.md:37` | Vietnamese trong scouter prompt | Consistency check |
| `commands/view-docs.md` | Không có error handling cho missing script | Thêm file existence check |

### Rules

| File | Issue | Recommendation |
|------|-------|----------------|
| `knowledge-freshness.md:23` | `WebSearch` tool reference unclear | Clarify exact tool name |
| `communication.md:19-22` | Overlap với documentation skill | Add cross-reference |

### Skills

| File | Issue | Recommendation |
|------|-------|----------------|
| `documentation/templates/` | Dùng `templates/` thay vì `references/` | Minor - consistent within skill |
| `security-audit/` | Input validation overlap với code-quality.md | Add cross-reference note |

### Config/Tools

| File | Issue | Recommendation |
|------|-------|----------------|
| `hooks/inject-settings.py:124` | Discards stdin data | Use `_` assignment explicitly |
| `tools/docs-viewer.js:377` | Mixed require/import style | Cosmetic - ESM consistency |

---

## Suggestions (Low Priority)

1. **Long files**: `brainstorm.md` (550 lines) và `run.md` (653 lines) khá dài → consider extracting templates
2. **Cross-references**: Thêm links giữa related rules/skills
3. **Tool naming**: Standardize tool references across all rules

---

## Positive Findings

### Architecture Strengths
- **Clear separation**: Rules = guidelines, Skills = domain knowledge, Agents = execution
- **No role overlap**: researcher (external), scouter (internal), reviewer (quality gate)
- **Consistent frontmatter**: YAML format uniform across agents and skills

### Code Quality
- **inject-settings.py**: Excellent error handling, silent degradation
- **docs-viewer.js**: Path traversal security, cross-platform support
- **Config files**: Valid JSON, all references exist

### Cross-Reference Integrity
- Tất cả agent references trong commands đều match với agent files
- Tất cả skill references đều có corresponding skill directories
- Config settings được sử dụng đúng bởi hooks

---

## Verification Checklist

### Agents (3/3 verified)
- [x] researcher.md - Tools: WebSearch, WebFetch, Bash, Read, Grep, Glob
- [x] reviewer.md - Tools: Bash, Read, Grep, Glob (no web - correct)
- [x] scouter.md - Tools: Bash, Read, Grep, Glob (no web - correct)

### Commands (4/4 verified)
- [x] brainstorm.md - References: scouter, researcher, report skill
- [x] onboarding.md - References: scouter
- [x] run.md - References: all 3 agents, 8 skills
- [x] view-docs.md - No dependencies

### Skills (10/10 verified)
- [x] debug - Has references/, integrates with other skills
- [x] documentation - Has templates/
- [x] gemini - Has references/
- [x] git-workflow - Has references/
- [x] implementation - Has references/, examples/
- [x] planning - Has references/, templates/
- [x] report - Has templates/, integrates with agents
- [x] security-audit - Has references/
- [x] skill-creator - Has references/, scripts/
- [x] testing - Has references/, examples/

### Rules (5/5 verified)
- [x] cck-enforcement.md - Valid settings format
- [x] code-quality.md - Clear DO/DON'T
- [x] communication.md - Style guidelines
- [x] knowledge-freshness.md - Date commands
- [x] safety.md - Protected files, dangerous commands

### Config (3/3 verified)
- [x] CLAUDE.md - Architecture overview (missing 2 dirs)
- [x] cck.json - Language + workflow settings
- [x] settings.json - Hook definitions

---

## Recommended Actions

### Immediate (Critical)
1. `mv .claude/skills/debug/skill.md .claude/skills/debug/SKILL.md`
2. Update CLAUDE.md directory structure
3. Consolidate security rules

### Short-term (Warnings)
4. Add error handling to view-docs.md
5. Standardize language in comments (English or Vietnamese, not mixed)
6. Fix nested code block rendering in agent templates

### Nice-to-have (Suggestions)
7. Extract templates from long command files
8. Add cross-references between related docs
