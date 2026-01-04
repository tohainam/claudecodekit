# Implementation Plan: Onboarding Command

**Spec**: `.specs/onboarding-command.md`
**Status**: In Progress
**Created**: 2026-01-04
**Effort**: M (4-8 hours)

---

## Overview

Tạo slash command `/onboarding` để tự động phân tích project và generate CLAUDE.md + project rules, giúp user setup Claude Code Kit lần đầu.

## Key Insights từ Research

1. **YAML frontmatter format**: `paths` là **string** (không phải array), dùng brace expansion hoặc comma-separated
2. **Global rules**: Không có `paths:` = global (load cho tất cả files)
3. **CCK command pattern**: YAML frontmatter → Role → Context → Execution Protocol → Rules → Tools → Examples
4. **Scouter delegation**: NEVER làm analysis inline, spawn scouter agent

---

## Phases

### Phase 1: Command File Creation (Size: S)

**Status**: Completed

**Tasks**:
1. Tạo `.claude/commands/onboarding.md` với CCK command structure
2. Define YAML frontmatter (description, argument-hint)
3. Define Role và Context sections
4. Define Execution Protocol với 6 steps

**Output**: `.claude/commands/onboarding.md`

---

### Phase 2: Scouter Prompt Definition (Size: S)

**Status**: Completed

**Tasks**:
1. Define comprehensive scouter prompt để deep analyze project:
   - Languages và frameworks detection
   - Project structure (monorepo vs single)
   - Key directories và purposes
   - Dependencies (package.json, requirements.txt, etc.)
   - Coding patterns và conventions
   - Feature/screen boundaries
2. Define expected output format từ scouter
3. Define report structure

**Output**: Scouter prompt section trong command file

---

### Phase 3: CLAUDE.md Generation Template (Size: S)

**Status**: Completed

**Tasks**:
1. Define CLAUDE.md template structure:
   - Project name và purpose
   - Architecture overview
   - Directory structure
   - Key principles
   - Quick references
2. Include placeholders cho dynamic content từ scouter analysis

**Output**: CLAUDE.md generation template trong command file

---

### Phase 4: Rules Generation Logic (Size: M)

**Status**: Completed

**Tasks**:
1. Define logic để detect project type:
   - Monorepo → by project folders
   - Feature-based → by feature folders
   - Type-based → coding/business/testing
2. Define coding rules template với paths frontmatter
3. Define business rules template với paths frontmatter
4. Define detection logic cho screens/features/flows

**Output**: Rules generation section trong command file

---

### Phase 5: User Confirmation Flow (Size: S)

**Status**: Completed

**Tasks**:
1. Implement AskUserQuestion cho analysis confirmation
2. Implement existing rules handling (Keep/Replace/Merge)
3. Implement completion summary display

**Output**: Confirmation flow trong command file

---

## Files To Create

| File | Purpose | Size |
|------|---------|------|
| `.claude/commands/onboarding.md` | Main command file | ~300 lines |

## Dependencies

- **Internal**: Scouter agent, AskUserQuestion tool, Write tool, Glob tool
- **External**: Claude Code memory format specification

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Scouter analysis không chính xác | User confirm trước khi apply |
| Large project chậm | Single scouter agent (không parallel) |
| Rules format outdated | Research report đã verify format mới nhất |

## Success Criteria

- [ ] `/onboarding` command hoạt động
- [ ] Scouter detect languages, frameworks, dependencies
- [ ] Report được generate vào `.reports/`
- [ ] User confirm trước khi write
- [ ] CLAUDE.md được generate
- [ ] Rules được tạo với đúng format (paths string, không array)
- [ ] Existing rules được handle đúng

---

## Implementation Notes

### YAML Frontmatter Format (CRITICAL)

```yaml
# ĐÚNG - paths là string
---
paths: src/api/**/*.ts
---

# ĐÚNG - multiple patterns với brace expansion
---
paths: src/**/*.{ts,tsx}
---

# SAI - không dùng array
---
paths:
  - src/**/*.ts
---
```

### CCK Command Structure

```markdown
---
description: Short description
argument-hint: [optional args]
---

## Role
[Who Claude is acting as]

## Context
- **Input**: $ARGUMENTS

## Execution Protocol
### Step 1: [Phase Name]
[Tool invocations]

## Rules
### Always / Never

## Tools
| Tool | Invocation | Use For |

## Examples
```

### Scouter Invocation

```
Task(subagent_type: "scouter", prompt: "...", description: "...")
```

NEVER do analysis inline với Read/Grep/Glob - ALWAYS spawn scouter agent.
