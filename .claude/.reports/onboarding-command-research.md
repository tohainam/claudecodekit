# Research Report: Onboarding Command

**Generated**: 2026-01-04 15:37
**Type**: Research (External Documentation)
**Scope**: Claude Code Memory Format

---

## Executive Summary

Claude Code memory system sử dụng hierarchical file-based approach với `CLAUDE.md` và `.claude/rules/`. Rules có thể global hoặc conditional qua YAML frontmatter với glob patterns. Hệ thống hỗ trợ import syntax, symlinks, và cả user-level lẫn project-level configurations.

---

## Claude Code Memory Format (Latest)

### YAML Frontmatter cho Rules

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `paths` | **String** | Không | Glob pattern cho conditional rule application |

**CHÚ Ý**: `paths` là **string** (không phải array). Dùng brace expansion `{a,b}` hoặc comma-separated cho multiple patterns.

#### Syntax đúng:

```yaml
# Single pattern
---
paths: src/api/**/*.ts
---

# Brace expansion (multiple extensions)
---
paths: src/**/*.{ts,tsx}
---

# Multiple directories với brace expansion + comma-separated
---
paths: {src,lib}/**/*.ts, tests/**/*.test.ts
---
```

### Cấu trúc thư mục

```
your-project/
├── CLAUDE.md                      # Main project instructions
├── CLAUDE.local.md                # Personal overrides (auto-gitignored)
├── .claude/
│   ├── CLAUDE.md                  # Main project instructions (alternative location)
│   └── rules/
│       ├── code-style.md          # Global: no paths frontmatter
│       ├── testing.md             # Global: no paths frontmatter
│       ├── frontend/              # Subdirectories supported
│       │   ├── react.md           # paths: "src/**/*.tsx"
│       │   └── styles.md          # paths: "**/*.css"
│       └── backend/
│           ├── api.md             # paths: "src/api/**/*.ts"
│           └── database.md        # paths: "**/migrations/*.sql"
```

### Global vs Path-Specific Rules

| Rule Type | Frontmatter | Behavior |
|-----------|-------------|----------|
| **Global** | Không có `paths:` | Luôn load cho tất cả files |
| **Conditional** | Có `paths:` | Chỉ load khi working on matching files |

### Common Glob Patterns

| Pattern | Matches |
|---------|---------|
| `**/*.ts` | All TypeScript files anywhere |
| `src/**/*` | All files under `src/` directory |
| `*.md` | Markdown files in project root only |
| `src/**/*.{ts,tsx}` | Both `.ts` and `.tsx` files |
| `{src,lib}/**/*.ts` | TypeScript in both `src/` and `lib/` |

### Memory Import Syntax

```markdown
See @README for project overview and @package.json for available npm commands.

# Additional Instructions
- Git workflow: @docs/git-instructions.md
```

---

## Key Findings

### Updates so với knowledge hiện tại:

1. **Không có `_global` convention chính thức** - Docs cho thấy rules không có `paths:` được load globally. Folder `_global/` trong CCK là local convention.

2. **YAML quoting bắt buộc** - Patterns bắt đầu `{` hoặc `*` phải quote (GitHub Issue #13905).

3. **Không có `alwaysApply` field** - Đây là Cursor-specific. Claude Code dùng absence of `paths:` cho global rules.

4. **Không có `description` field cho rules** - Field `description` chỉ cho Skills (`SKILL.md`), không phải rules.

5. **String format (không phải array)** - `paths` là string, dùng brace expansion hoặc comma-separated cho multiple patterns.

6. **Symlinks supported** - `.claude/rules/` hỗ trợ symlinks.

7. **Recursive discovery** - Tất cả `.md` files trong `.claude/rules/` được discover recursive.

---

## Best Practices

### Organization

1. **Keep rules focused** - Một topic per file
2. **Use descriptive filenames** - Indicate what rules cover
3. **Organize with subdirectories** - Group related rules
4. **Use symlinks for sharing** - Share common rules across projects

### Content

1. **Be specific** - "Use 2-space indentation" không "Format code properly"
2. **Use structure** - Bullet points under descriptive headings
3. **Review periodically** - Update as project evolves

### Loading Strategy

1. **Use CLAUDE.md for universal rules** - Routing logic, quality standards
2. **Use path-specific rules for domains** - API patterns, test requirements
3. **Add paths to reduce noise** - Only load when relevant
4. **Keep global rules lean** - Everything competes for attention

---

## Sources

- [Manage Claude's memory - Claude Code Docs](https://code.claude.com/docs/en/memory)
- [YAML Frontmatter Bug - GitHub Issue #13905](https://github.com/anthropics/claude-code/issues/13905)
- [Rules Directory Mechanics - Claude Fast](https://claudefa.st/blog/guide/mechanics/rules-directory)
- [Claude Code Best Practices - Anthropic Engineering](https://www.anthropic.com/engineering/claude-code-best-practices)
