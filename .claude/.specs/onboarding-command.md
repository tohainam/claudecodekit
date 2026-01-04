# Spec: Onboarding Command

## Status: Final

---

## 1. Original Requirements

> Planner's original spec - do not modify this section

I want to implement onboarding command. First time when use this claude code kit, user will use this command for startup. It will deep research all current project, analyze and update CLAUDE.md in .claude folder for matching with project. It's also create project rules for .claude/rules. Separate rules by folder based on project. Format of rules must match exactly latest version https://code.claude.com/docs/en/memory.

---

## 2. Analysis

### 2.1 Codebase Impact

- **Files affected**:
  - `.claude/commands/onboarding.md` (new - command definition)
  - `.claude/skills/onboarding/` (new - skill implementation if needed)
  - `.claude/CLAUDE.md` (modified - generated content)
  - `.claude/rules/` (new files - project-specific rules)
- **Modules impacted**:
  - Commands system (`commands/*.md`)
  - Agents (scouter for codebase analysis)
- **Dependencies**:
  - Scouter agent for deep codebase analysis
  - File system tools (Glob, Grep, Read, Write)

### 2.2 Gaps Identified

- [x] Gap 1: **CLAUDE.md update strategy** - Overwrite hoàn toàn, nhưng cần confirm với user trước khi ghi
- [x] Gap 2: **Rules detection logic** - Dùng scouter agent deep research toàn bộ project để detect
- [x] Gap 3: **Framework/language detection** - Phân tích càng sâu càng tốt (languages, frameworks, dependencies, patterns)
- [x] Gap 4: **User confirmation** - Tạo report vào `.reports/`, show cho user và ask confirm. Nếu OK thì proceed

### 2.3 Open Questions

- [x] Question 1: **Invocation method** - Slash command `/onboarding`
- [x] Question 2: **Interactive vs automatic** - Tự động hoàn toàn (fully automatic)
- [x] Question 3: **Existing rules handling** - Hỏi user nếu đã có rules (ask user)
- [x] Question 4: **Rule granularity** - Theo folder lớn (`frontend/`, `backend/`, `testing/`)
- [x] Question 5: **Path-specific rules** - Dùng YAML frontmatter `paths:` cho path-specific rules
- [x] Question 6: **Backup strategy** - Không backup

---

## 3. Approach Options

### Option A: Single Command với Scouter (Recommended)

**Description**: Tạo 1 slash command `/onboarding` gọi scouter agent để deep research, generate report, sau đó dùng AskUserQuestion để confirm trước khi write files.

**Flow**:
1. `/onboarding` → Scouter deep research project
2. Generate report → `.reports/{date}-onboarding-analysis.md`
3. AskUserQuestion: "Confirm to proceed?"
4. If existing rules → AskUserQuestion: "Keep/Replace/Merge?"
5. Generate CLAUDE.md + rules files

**Pros:**
- Đơn giản, 1 command làm tất cả
- Scouter đã có sẵn trong CCK
- Report lưu lại để reference sau
- User có full control qua confirmation

**Cons:**
- Phụ thuộc vào scouter agent quality
- Có thể mất thời gian nếu project lớn

**Estimated Effort**: M

### Option B: Multi-Phase Skill

**Description**: Tạo skill với multiple phases: analyze → preview → confirm → generate. Mỗi phase có thể run riêng.

**Flow**:
1. `/onboarding analyze` → Generate report only
2. `/onboarding preview` → Show what will be generated
3. `/onboarding apply` → Write files

**Pros:**
- Flexible, có thể dừng ở bất kỳ phase nào
- Dễ debug và test từng phase
- User có thể edit report trước khi apply

**Cons:**
- Phức tạp hơn để implement
- User phải chạy nhiều commands
- Overkill cho first-time setup

**Estimated Effort**: L

**Selection**: Option A <- SELECTED

**Selection Reason**: Đơn giản, phù hợp với use case first-time setup, scouter agent đã có sẵn trong CCK

---

## 4. Technical Decisions

| Decision | Choice | Reason | Date |
| -------- | ------ | ------ | ---- |
| Invocation method | Slash command `/onboarding` | Direct access, familiar UX | 2026-01-03 |
| Execution mode | Fully automatic | Speed, minimal friction | 2026-01-03 |
| Existing rules | Ask user via AskUserQuestion | Preserve user customizations | 2026-01-03 |
| Rule granularity | By project/feature/type (flexible) | Monorepo + feature support | 2026-01-03 |
| Rule types | Coding + Business rules | Full context for Claude | 2026-01-03 |
| Path-specific rules | YAML frontmatter `paths:` | Official Claude Code format | 2026-01-03 |
| Backup | No backup | Keep it simple | 2026-01-03 |
| CLAUDE.md strategy | Overwrite với user confirm | Fresh start, user control | 2026-01-03 |
| Detection method | Scouter agent deep research | Comprehensive analysis | 2026-01-03 |
| Tech stack depth | As deep as possible | Maximum context for Claude | 2026-01-03 |
| Confirmation flow | Report → User confirm → Generate | User stays in control | 2026-01-03 |

---

## 5. Final Spec

### Objective

Tạo slash command `/onboarding` để tự động phân tích project và generate CLAUDE.md + project rules phù hợp, giúp user setup Claude Code Kit lần đầu.

### Requirements

1. **Deep Research**: Dùng scouter agent phân tích toàn bộ project (languages, frameworks, dependencies, patterns, folder structure)
2. **Report Generation**: Tạo report chi tiết vào `.reports/{date}-onboarding-analysis.md`
3. **User Confirmation**: Show report và hỏi user confirm trước khi write files
4. **CLAUDE.md Generation**: Overwrite `.claude/CLAUDE.md` với nội dung phù hợp project
5. **Rules Generation**: Tạo rules trong `.claude/rules/` với cấu trúc linh hoạt:
   - **By Project** (monorepo): `rules/project-a/`, `rules/project-b/`
   - **By Feature**: `rules/auth/`, `rules/checkout/`, `rules/dashboard/`
   - **By Type**: `rules/coding/`, `rules/business/`, `rules/testing/`
6. **Coding Rules**: Standards về code style, patterns, conventions cho từng project/feature
7. **Business Rules**: Logic nghiệp vụ cho từng screen, file, flow - giúp Claude hiểu context business
8. **Path-specific Rules**: Sử dụng YAML frontmatter `paths:` cho path-specific rules theo chuẩn Claude Code
9. **Existing Rules Handling**: Nếu đã có rules, hỏi user: Keep/Replace/Merge

### Technical Approach

- Slash command format: `.claude/commands/onboarding.md`
- Scouter agent cho deep codebase analysis
- AskUserQuestion tool cho user confirmations
- Write tool để generate files
- Rules format theo chuẩn https://code.claude.com/docs/en/memory

### Execution Flow

```
1. User runs /onboarding
2. Scouter agent deep research project
3. Generate analysis report → .reports/{date}-onboarding-analysis.md
4. Present report summary to user
5. AskUserQuestion: "Proceed with generation?"
6. If existing rules exist → AskUserQuestion: "Keep/Replace/Merge?"
7. Generate CLAUDE.md (overwrite)
8. Generate rules files in .claude/rules/
9. Show completion summary
```

### Output Files

```
.claude/
├── CLAUDE.md                    # Generated project overview
└── rules/
    ├── _global/                 # Always-loaded rules (keep existing)
    │   └── ...
    │
    │   # === MONOREPO: By Project ===
    ├── project-a/               # Rules cho project A
    │   ├── coding.md            # Coding standards
    │   └── business.md          # Business rules
    ├── project-b/               # Rules cho project B
    │   └── ...
    │
    │   # === By Feature ===
    ├── auth/                    # Authentication feature
    │   ├── login-screen.md      # Business rules cho login
    │   └── signup-flow.md       # Business rules cho signup
    ├── checkout/                # Checkout feature
    │   └── payment-rules.md     # Payment business logic
    │
    │   # === By Type ===
    ├── coding/                  # Coding standards
    │   ├── frontend.md          # Frontend conventions
    │   ├── backend.md           # Backend conventions
    │   └── api.md               # API design rules
    ├── business/                # Business rules
    │   ├── screens/             # Per-screen rules
    │   │   ├── dashboard.md
    │   │   └── settings.md
    │   └── flows/               # Per-flow rules
    │       └── onboarding.md
    └── testing/                 # Testing standards
        └── testing.md
```

**Note**: Cấu trúc sẽ được detect tự động dựa trên project structure (monorepo vs single project, features detected, etc.)

### Rule File Format

**Coding Rules Example:**
```markdown
---
paths: src/frontend/**/*.tsx
---

# Frontend Coding Rules

- Use functional components
- Follow naming conventions
- Use TypeScript strict mode
```

**Business Rules Example (per screen):**
```markdown
---
paths: src/screens/checkout/**/*
---

# Checkout Screen Business Rules

## Validation
- Cart must have at least 1 item
- User must be authenticated before payment
- Shipping address required for physical products

## Price Calculation
- Apply discount codes before tax
- Free shipping for orders > $100
- Tax calculated based on shipping address

## Flow
1. Cart review → 2. Shipping → 3. Payment → 4. Confirmation
- User can go back to any previous step
- Payment step requires re-authentication if idle > 5 minutes
```

**Business Rules Example (per feature):**
```markdown
---
paths: src/features/auth/**/*
---

# Authentication Business Rules

## Login
- Max 5 failed attempts → lock account 15 minutes
- Remember me: 30 days token
- 2FA required for admin users

## Password Policy
- Minimum 8 characters
- Must include: uppercase, lowercase, number
- Cannot reuse last 5 passwords
```

### Out of Scope

- Editing existing user-created rules (only ask Keep/Replace/Merge)
- Auto-running on project clone (manual trigger only)
- Integration với CI/CD
- Auto-sync rules khi codebase thay đổi (manual re-run required)

### Acceptance Criteria

- [ ] `/onboarding` command hoạt động và trigger analysis
- [ ] Scouter agent detect được languages, frameworks, dependencies
- [ ] Detect monorepo structure (multiple projects)
- [ ] Detect features/screens trong codebase
- [ ] Report được generate vào `.reports/`
- [ ] User được hỏi confirm trước khi write
- [ ] CLAUDE.md được generate với project-specific content
- [ ] **Coding rules** được tạo (code style, patterns, conventions)
- [ ] **Business rules** được tạo (per screen, per feature, per flow)
- [ ] Rules được organize theo structure phù hợp (by project/feature/type)
- [ ] Rules format đúng chuẩn Claude Code (YAML frontmatter với paths)
- [ ] Existing rules được handle đúng (ask user)

### Dependencies

- **Internal**: Scouter agent, AskUserQuestion tool, Write tool
- **External**: Claude Code memory format specification

### Risks

| Risk | Probability | Impact | Mitigation |
| ---- | ----------- | ------ | ---------- |
| Scouter analysis không chính xác | Medium | Medium | User confirm trước khi apply |
| Large project chậm | Medium | Low | Show progress, có thể timeout |
| Rules format outdated | Low | High | Reference latest docs khi generate |

---

**Created**: 2026-01-03
**Last Updated**: 2026-01-03
**Author**: Claude Code Kit
