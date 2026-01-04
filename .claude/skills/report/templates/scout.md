# Scout Report Template

Use for synthesizing codebase analysis from scouter agents.

---

```markdown
# Scout Report: {Area/Feature}

**Generated**: {timestamp từ `date +"%Y-%m-%d %H:%M"`}
**Type**: Codebase Analysis
**Scope**: {directories/files analyzed}
**Files Analyzed**: {count}

---

## Summary

[2-3 câu overview findings]

---

## Architecture & Structure

### Directory Organization

```
relevant/
├── module-a/     # [purpose]
│   ├── file.ts   # [role]
│   └── ...
└── module-b/     # [purpose]
```

### Design Patterns

- **[Pattern]**: `location` - [how used]
- **[Pattern]**: `location` - [how used]

---

## Key Files

| File | Purpose | Notes |
|------|---------|-------|
| `path/file.ts:line` | [Purpose] | [Key observations] |
| `path/file.ts:line` | [Purpose] | [Key observations] |

---

## Data Flow

```
[Entry] → [Processing] → [Output]
```

1. **Entry**: `file.ts:15` - [Description]
2. **Process**: `service.ts:42` - [Transformation]
3. **Output**: `handler.ts:78` - [Result]

---

## Dependencies

### Internal

```
ComponentA
└── ServiceB
    └── UtilityC
```

### External

| Package | Purpose | Version |
|---------|---------|---------|
| `pkg` | [Purpose] | x.y.z |

---

## Integration Points

- **API**: `routes/api.ts` - [Description]
- **Database**: `models/*.ts` - [Description]
- **External**: `services/ext.ts` - [Description]

---

## Issues & Recommendations

### Technical Debt

- `file.ts:42` - **[Issue]**: [Recommendation]

### Improvements

- **[Opportunity]**: [Recommendation]

---

## Code Snippets

```{language}
// file.ts:42-58
[relevant code]
```

---

## Unresolved Questions

- [Questions cần investigate thêm]
```
