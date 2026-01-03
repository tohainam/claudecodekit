# Spec: Gemini Skill

## Status: Final

---

## 1. Original Requirements

> Planner's original spec - do not modify this section

I want to create gemini skill use skill creator. This skill help claude code know how to use gemini cli headless mode.

---

## 2. Analysis

### 2.1 Codebase Impact

- **Files affected**:
  - New skill directory: `.claude/skills/gemini/`
  - SKILL.md: Main skill file with headless mode instructions
  - Optional: `references/` for command reference
- **Modules impacted**: Skills system
- **Dependencies**:
  - External: Gemini CLI (`npm install -g @google/gemini-cli`)
  - Node.js 20+
  - Google OAuth or Gemini API key for authentication

### 2.2 Gaps Identified

- [x] Gap 1: What specific use cases should the skill focus on? → **User-driven, flexible/general purpose**
- [x] Gap 2: Should the skill include scripts for common tasks, or just provide instructions? → **Reference files with comprehensive examples**
- [x] Gap 3: What level of detail for JSON parsing examples? → **Detailed, for automation**

### 2.3 Open Questions

- [x] Question 1: Should this skill focus primarily on headless mode automation, or also cover interactive mode? → **Headless mode only**
- [x] Question 2: Do you want a simple skill (just SKILL.md) or a more comprehensive one with reference files for commands and examples? → **Comprehensive with reference files**
- [x] Question 3: Should it include integration patterns for using Gemini as a subagent alongside Claude Code? → **Yes**
- [x] Question 4: What are the primary use cases you envision? → **Based on user needs (flexible)**

---

## 3. Approach Options

### Option A: Focused Headless Reference

**Description**: SKILL.md with core headless workflow + 2 reference files (commands.md, examples.md)

**Structure**:
```
gemini/
├── SKILL.md              # Core headless workflow, when to use
└── references/
    ├── commands.md       # All CLI flags and options
    └── examples.md       # Practical automation examples
```

**Pros:**
- Clean separation of concerns
- Quick to load core instructions
- Detailed references available on demand

**Cons:**
- May require reading multiple files for full context

**Estimated Effort**: S

### Option B: Comprehensive with Integration Patterns

**Description**: SKILL.md + 3 reference files including Claude Code integration patterns

**Structure**:
```
gemini/
├── SKILL.md              # Core headless workflow, when to use
└── references/
    ├── commands.md       # All CLI flags and options
    ├── examples.md       # Practical automation examples
    └── integration.md    # Claude Code + Gemini patterns
```

**Pros:**
- Dedicated integration guidance for dual-agent workflows
- More comprehensive for advanced users
- Better supports the "Gemini as subagent" pattern

**Cons:**
- Slightly more files to maintain

**Estimated Effort**: S

**Selection**: Option B <- SELECTED

**Selection Reason**: Best fits requirements - comprehensive reference files + dedicated integration patterns for Claude Code + Gemini dual-agent workflows as explicitly requested

---

## 4. Technical Decisions

| Decision | Choice | Reason | Date |
|----------|--------|--------|------|
| Scope | Headless mode only | Primary purpose is teaching Claude Code bash automation | 2026-01-03 |
| Structure | SKILL.md + 3 references | Comprehensive coverage with progressive disclosure | 2026-01-03 |
| Integration | Include Claude Code patterns | Support dual-agent workflows | 2026-01-03 |
| Use cases | User-driven/flexible | Skill provides building blocks, user defines purpose | 2026-01-03 |

---

## 5. Final Spec

### Objective

Create a comprehensive Gemini CLI skill that teaches Claude Code how to use Gemini in headless mode via bash for automation workflows.

### Requirements

1. Focus exclusively on headless mode (`-p` flag) for non-interactive automation
2. Provide comprehensive CLI command reference
3. Include practical automation examples (code analysis, git integration, etc.)
4. Document Claude Code + Gemini integration patterns for dual-agent workflows
5. Support flexible, user-driven use cases

### Technical Approach

- Create skill at `.claude/skills/gemini/`
- SKILL.md: Core workflow, installation, quick start, when to use
- references/commands.md: Complete CLI flags and options reference
- references/examples.md: Practical automation examples with bash
- references/integration.md: Claude Code + Gemini dual-agent patterns

### Out of Scope

- Interactive mode usage
- Gemini API direct integration (non-CLI)
- MCP server setup (mention only)

### Acceptance Criteria

- [ ] SKILL.md with proper frontmatter and headless workflow
- [ ] references/commands.md with all headless-relevant CLI flags
- [ ] references/examples.md with bash automation examples
- [ ] references/integration.md with Claude Code patterns
- [ ] Skill passes validation via package_skill.py

### Dependencies

- **Internal**: Skill creator workflow, existing skill patterns
- **External**: Gemini CLI (`@google/gemini-cli`), Node.js 20+

### Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Gemini CLI API changes | Low | Medium | Reference official docs, note version |
| Context window bloat | Medium | Low | Use progressive disclosure pattern |

---

**Created**: 2026-01-03
**Last Updated**: 2026-01-03
**Author**: Claude Code Kit
