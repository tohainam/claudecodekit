# Claude Code Kit - Architecture & Development Guide

> **Document Version**: 3.4
> **Last Updated**: December 31, 2025  
> **Claude Code Version**: 1.0.x+  
> **Reference**: https://code.claude.com/docs

---

## Table of Contents

1. [Overview](#1-overview)
2. [System Architecture](#2-system-architecture)
3. [Component Details](#3-component-details)
4. [Workflow Engine](#4-workflow-engine)
5. [Brainstorm Process](#5-brainstorm-process)
6. [Example Flows](#6-example-flows)
7. [Development Phases](#7-development-phases)

---

## 1. Overview

### 1.1. Purpose

Claude Code Kit is a framework-agnostic toolkit for software development with Claude Code. It provides:

- **Automated Workflows**: Streamlined development processes
- **Intelligent Orchestration**: Task detection and workflow routing
- **Hybrid Agent-Skill Architecture**: 3 specialized agents + extensible skills
- **Quality Gates**: Confirmation points for control
- **Hierarchical Planning**: Master plans with optional sub-plans
- **Interactive Brainstorming**: Structured spec refinement before automation

### 1.2. Claude Code Features (12/2025)

| Feature                | Description                                                    |
| ---------------------- | -------------------------------------------------------------- |
| **Subagents**          | Spawn isolated agents with specific tools and models           |
| **Agent Skills**       | Model-invoked capabilities with allowed-tools                  |
| **Multi-file Skills**  | Skills with supporting files (references, examples, templates) |
| **Prompt-Based Hooks** | LLM-evaluated hooks for complex conditions                     |
| **WebSearch/WebFetch** | Built-in tools for web research                                |
| **SlashCommand Tool**  | Claude auto-invokes custom slash commands                      |

### 1.3. Design Principles

```
┌─────────────────────────────────────────────────────────────────┐
│                    DESIGN PRINCIPLES                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. AGENTS FOR ISOLATION, SKILLS FOR KNOWLEDGE                  │
│     → Agents: parallel execution, separate context, deep tasks  │
│     → Skills: domain knowledge, shared context, guidelines      │
│                                                                 │
│  2. BRAINSTORM BEFORE AUTOMATE                                  │
│     → Interactive refinement of specs                           │
│     → Human judgment for critical decisions                     │
│     → Complete spec before workflow execution                   │
│                                                                 │
│  3. HIERARCHICAL PLANNING                                       │
│     → Master plan + sub-plans for complex features              │
│     → Single plan for simple tasks                              │
│     → Folder per feature for organization                       │
│                                                                 │
│  4. DOCUMENT EVERYTHING                                         │
│     → Specs in .specs/ after brainstorm                         │
│     → Reports in .reports/ after research/scout                 │
│     → Plans in .plans/{feature}/ before implementation          │
│                                                                 │
│  5. CONFIRMATION AT KEY POINTS                                  │
│     → After research/scout: validate findings                   │
│     → After planning: validate approach                         │
│     → Before commit: final review                               │
│                                                                 │
│  6. PROGRESSIVE DISCLOSURE                                      │
│     → Skills load supporting files only when needed             │
│     → Reduces context bloat, improves efficiency                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. System Architecture

### 2.1. Agents vs Skills

```
┌─────────────────────────────────────────────────────────────────┐
│                     AGENTS vs SKILLS                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  AGENTS                           SKILLS                        │
│  ───────────────────────────      ─────────────────────────     │
│  • Separate context               • Shared context              │
│  • Can run parallel               • Sequential only             │
│  • Different model possible       • Same model as main          │
│  • For DEEP, ISOLATED tasks       • For KNOWLEDGE, GUIDELINES   │
│  • Explicit invocation            • Auto-invoked by model       │
│                                                                 │
│  USE AGENTS WHEN:                 USE SKILLS WHEN:              │
│  ───────────────────────────      ─────────────────────────     │
│  ✓ Need parallel execution        ✓ Domain knowledge needed     │
│  ✓ Need isolated context          ✓ Guidelines/patterns         │
│  ✓ Need different model           ✓ Token efficiency matters    │
│  ✓ Task is long-running           ✓ Quick reference needed      │
│  ✓ Need unbiased review           ✓ Shared context is OK        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2. Directory Structure

```
project-root/
│
├── .claude/
│   │
│   ├── CLAUDE.md                      # Project context & instructions
│   ├── settings.json                  # Hooks, permissions, preferences
│   ├── settings.local.json            # Personal settings (gitignored)
│   │
│   ├── .specs/                        # Complete specs (after brainstorm)
│   │   └── {feature-name}.md
│   │
│   ├── .reports/                      # Generated reports (gitignored)
│   │   └── {timestamp}-{type}-{name}.md
│   │
│   ├── .plans/                        # Implementation plans
│   │   └── {feature-name}/            # Folder per feature
│   │       ├── _master.md             # Master plan
│   │       ├── phase-1-{name}.md      # Sub-plan (if complex)
│   │       ├── phase-2-{name}.md
│   │       └── ...
│   │
│   ├── workflows/                     # Workflow definitions
│   │   ├── _config.yaml               # Global workflow settings
│   │   ├── feature.yaml
│   │   ├── bugfix.yaml
│   │   ├── refactor.yaml
│   │   ├── hotfix.yaml
│   │   ├── research.yaml
│   │   ├── review.yaml
│   │   └── docs.yaml
│   │
│   ├── commands/                      # Slash commands
│   │   ├── run.md                     # Main workflow entry
│   │   ├── brainstorm.md              # Interactive spec refinement
│   │   ├── planning/
│   │   ├── coding/
│   │   ├── testing/
│   │   ├── review/
│   │   ├── docs/
│   │   ├── git/
│   │   └── utils/
│   │
│   ├── agents/                        # Subagents
│   │   ├── researcher.md
│   │   ├── scouter.md
│   │   └── reviewer.md
│   │
│   ├── skills/                        # Multi-file skills
│   │   └── {skill-name}/
│   │       ├── SKILL.md               # Required: main file
│   │       ├── references/            # Optional: reference docs
│   │       │   └── *.md
│   │       ├── examples/              # Optional: code examples
│   │       │   └── *.md
│   │       └── templates/             # Optional: file templates
│   │           └── *.md
│   │
│   ├── rules/                         # Conditional rules
│   │   ├── _global/
│   │   └── {scope}/
│   │
│   ├── output-styles/
│   │   ├── verbose.md
│   │   ├── minimal.md
│   │   └── teaching.md
│   │
│   └── hooks/
│       └── *.sh
│
├── .claude-plugin/                    # Optional: Plugin packaging
│   └── plugin.json
│
└── CLAUDE.local.md                    # Personal overrides (gitignored)
```

### 2.3. File Naming Conventions

```bash
# Timestamp format
TIMESTAMP=$(date +"%Y-%m-%d-%H%M%S")
# Output: 2025-12-31-143022

# Reports
.claude/.reports/{timestamp}-{type}-{name}.md
# Example: 2025-12-31-143022-research-oauth.md
# Example: 2025-12-31-143025-codebase-auth-module.md

# Specs
.claude/.specs/{feature-name}.md
# Example: feature-authentication.md

# Plans (folder per feature)
.claude/.plans/{feature-name}/
├── _master.md                    # Always present
├── phase-1-{name}.md             # Optional sub-plans
├── phase-2-{name}.md
└── ...
```

---

## 3. Component Details

### 3.1. Agents (3 Core Agents)

#### Agent: researcher.md

| Field       | Value                                              |
| ----------- | -------------------------------------------------- |
| **Purpose** | Deep web research - docs, best practices, patterns |
| **Model**   | sonnet                                             |
| **Tools**   | WebSearch, WebFetch, Read, Write                   |
| **Output**  | Report file in `.claude/.reports/`                 |

```markdown
---
name: researcher
description: Deep web research specialist. Use for finding documentation,
  best practices, and external references. Can run in parallel.
tools: WebSearch, WebFetch, Read, Write
model: sonnet
---

# Researcher Agent

## Purpose

Research external documentation, best practices, and reference implementations.

## Search Strategy

1. Official documentation first
2. Reputable tutorials and guides
3. Code examples and implementations
4. Known issues and pitfalls

## Output Format

Save to: .claude/.reports/{timestamp}-research-{topic}.md

### Report Structure

- Executive Summary
- Sources Referenced
- Key Findings
- Code Examples (if found)
- Security Considerations
- Warnings/Pitfalls
- Recommendations
```

#### Agent: scouter.md

| Field       | Value                                                   |
| ----------- | ------------------------------------------------------- |
| **Purpose** | Deep codebase analysis - patterns, issues, dependencies |
| **Model**   | sonnet                                                  |
| **Tools**   | Read, Glob, Grep, Bash                                  |
| **Output**  | Report file in `.claude/.reports/`                      |

```markdown
---
name: scouter
description: Deep codebase analysis specialist. Use for understanding existing
  patterns, finding related code, mapping dependencies.
tools: Read, Glob, Grep, Bash
model: sonnet
---

# Scouter Agent

## Purpose

DEEP codebase analysis (not quick scan). Understand patterns, dependencies,
and integration points.

## Analysis Strategy

1. Find related files and modules
2. Map dependency graph
3. Identify patterns in use
4. Detect anti-patterns and issues
5. Locate integration points

## Output Format

Save to: .claude/.reports/{timestamp}-codebase-{area}.md

### Report Structure

- Scope Analyzed
- Related Files
- Patterns Detected
- Anti-patterns/Issues Found
- Dependencies Mapped
- Integration Points
- Recommendations
```

#### Agent: reviewer.md

| Field       | Value                                     |
| ----------- | ----------------------------------------- |
| **Purpose** | Isolated code review - unbiased, thorough |
| **Model**   | sonnet                                    |
| **Tools**   | Read, Grep, Glob                          |
| **Output**  | Review report                             |

```markdown
---
name: reviewer
description: Code review specialist with isolated context. Use after
  implementation for unbiased security and quality review.
tools: Read, Grep, Glob
model: sonnet
---

# Reviewer Agent

## Purpose

Fresh context for unbiased code review. No prior knowledge of implementation
decisions.

## Review Checklist

- Security vulnerabilities
- Performance issues
- Code quality and readability
- Error handling completeness
- Test coverage adequacy
- Documentation accuracy

## Output Format

### Review Report Structure

- Files Reviewed
- Critical Issues (must fix)
- Warnings (should fix)
- Suggestions (nice to have)
- Test Coverage Assessment
- Verdict: Approved | Needs Changes
```

### 3.2. Skills (Multi-file Structure)

#### Skill Directory Structure

```
skill-name/
├── SKILL.md               # Required: main file with frontmatter
│
├── references/            # Optional: reference documentation
│   ├── concept-a.md
│   ├── concept-b.md
│   └── ...
│
├── examples/              # Optional: code examples
│   ├── basic-example.md
│   ├── advanced-example.md
│   └── ...
│
└── templates/             # Optional: file templates
    ├── template-a.md
    └── ...
```

#### SKILL.md Format

```markdown
---
name: skill-name
description: Brief description of WHAT it does and WHEN to use it.
  Max 1024 characters. Be specific about triggers.
allowed-tools: Read, Write, Bash # Optional: restrict tools
---

# Skill Name

## When to Use

- Trigger condition 1
- Trigger condition 2

## Quick Start

[Brief instructions for common use cases]

## Guidelines

[Key principles to follow]

## References

For detailed documentation:

- [Concept A](references/concept-a.md)
- [Concept B](references/concept-b.md)

## Examples

- [Basic usage](examples/basic-example.md)
- [Advanced patterns](examples/advanced-example.md)
```

#### Core Skills (Technology Agnostic)

| Skill              | Purpose                     | Supporting Files        |
| ------------------ | --------------------------- | ----------------------- |
| **planning**       | Create implementation plans | references/, templates/ |
| **implementation** | Code writing guidelines     | references/, examples/  |
| **testing**        | Testing patterns            | references/, examples/  |
| **documentation**  | Doc writing                 | templates/              |
| **security-audit** | Security review             | references/             |
| **performance**    | Performance patterns        | references/             |
| **code-patterns**  | Design patterns             | references/, examples/  |
| **git-workflow**   | Git conventions             | references/             |
| **error-handling** | Error patterns              | references/, examples/  |
| **api-design**     | API guidelines              | references/, examples/  |

#### Tech-Specific Skills (Add Per Project)

| Category     | Example Skills                |
| ------------ | ----------------------------- |
| **Frontend** | react, vue, angular, svelte   |
| **Backend**  | nodejs, python, go, java      |
| **Database** | postgresql, mongodb, redis    |
| **DevOps**   | docker, kubernetes, terraform |
| **Mobile**   | react-native, flutter         |

**Note**: Add tech-specific skills only when project requires them.

### 3.3. Rules

#### Structure

```
rules/
├── _global/                    # Always loaded
│   ├── coding-standards.md
│   ├── naming-conventions.md
│   ├── error-handling.md
│   ├── security-baseline.md
│   └── commit-conventions.md
│
└── {scope}/                    # Loaded based on file paths
    └── *.md
```

#### Rule File Format

```markdown
---
paths: src/**/*.ts # Glob pattern for when to apply
---

# Rule Name

## DO

- Guideline 1
- Guideline 2

## DON'T

- Anti-pattern 1
- Anti-pattern 2

## Examples

[Concrete examples]
```

### 3.4. Commands

#### Namespace Structure

| Namespace      | Commands                           | Purpose                     |
| -------------- | ---------------------------------- | --------------------------- |
| **run**        | (main entry)                       | Workflow entry point        |
| **brainstorm** | (main entry)                       | Interactive spec refinement |
| **planning**   | init, arch, estimate, breakdown    | Planning tasks              |
| **coding**     | implement, refactor, optimize, fix | Coding tasks                |
| **testing**    | unit, integration, e2e, coverage   | Testing tasks               |
| **review**     | code, security, performance        | Review tasks                |
| **docs**       | generate, api, readme, changelog   | Documentation               |
| **git**        | commit, pr, branch, sync           | Git operations              |
| **utils**      | context, clean, deps               | Utilities                   |

#### Command File Format

```markdown
---
description: What this command does
allowed-tools: Read, Write, Bash
argument-hint: [task description]
---

# Command Name

## Task

$ARGUMENTS

## Instructions

[Step-by-step instructions]

## Context

- Current branch: !`git branch --show-current`
- Recent commits: !`git log --oneline -3`
```

### 3.5. Hooks

#### Hook Types

| Hook Event       | Purpose                        |
| ---------------- | ------------------------------ |
| **SessionStart** | Initialize environment         |
| **PreToolUse**   | Validate before tool execution |
| **PostToolUse**  | Actions after tool execution   |
| **Stop**         | Cleanup/checkpoint             |

#### Configuration (settings.json)

```json
{
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          { "type": "command", "command": ".claude/hooks/session-init.sh" }
        ]
      }
    ],
    "PreToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": ".claude/hooks/pre-edit-check.sh $FILE"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": ".claude/hooks/post-edit-format.sh $FILE"
          },
          {
            "type": "command",
            "command": ".claude/hooks/post-edit-lint.sh $FILE"
          }
        ]
      }
    ],
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": ".claude/hooks/on-stop-checkpoint.sh"
          }
        ]
      }
    ]
  }
}
```

### 3.6. Output Styles

| Style        | Use Case                         |
| ------------ | -------------------------------- |
| **verbose**  | Detailed explanations, debugging |
| **minimal**  | Code only, experienced devs      |
| **teaching** | Educational, with explanations   |

---

## 4. Workflow Engine

### 4.1. Workflow Types

| Workflow     | Phases                                               | Confirms | Use When                |
| ------------ | ---------------------------------------------------- | -------- | ----------------------- |
| **feature**  | research → plan → implement → test → review → commit | 3        | New features            |
| **bugfix**   | scout → analyze → plan → fix → test → commit         | 3        | Bug fixes               |
| **refactor** | scout → plan → refactor → test → review → commit     | 3        | Code refactoring        |
| **hotfix**   | analyze → fix → test → commit                        | 2        | Urgent production fixes |
| **research** | research → scout → summarize → docs                  | 2        | Research tasks          |
| **review**   | scout → review → report                              | 1        | Code review             |
| **docs**     | scout → plan → generate → commit                     | 2        | Documentation           |

### 4.2. Scale-Adaptive Routing

```yaml
# workflows/_config.yaml

routing:
  quick:
    triggers: ["fix", "bug", "hotfix", "small", "typo"]
    phases: [analyze, implement, test, commit]
    skip: [research, full-planning]
    estimated_time: "< 30 minutes"
    plan_type: single # Just _master.md

  standard:
    triggers: ["feature", "add", "create", "implement"]
    phases: [research, plan, implement, test, review, commit]
    estimated_time: "hours to days"
    plan_type: hierarchical # _master.md + sub-plans if needed

  complex:
    triggers: ["enterprise", "major", "architecture", "migration"]
    phases:
      [research, plan, security-review, implement, test, review, audit, commit]
    estimated_time: "days to weeks"
    plan_type: hierarchical # Always with sub-plans
```

### 4.3. Hierarchical Plans

```
┌─────────────────────────────────────────────────────────────────┐
│              HIERARCHICAL PLANNING                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  SIMPLE TASK (quick route)                                      │
│  ─────────────────────────────────────────────────────────────  │
│  .plans/                                                        │
│  └── bugfix-login/                                              │
│      └── _master.md              # Single file, all details     │
│                                                                 │
│  STANDARD FEATURE                                               │
│  ─────────────────────────────────────────────────────────────  │
│  .plans/                                                        │
│  └── feature-auth/                                              │
│      ├── _master.md              # Overview + phase links       │
│      ├── phase-1-setup.md        # Detailed sub-plan            │
│      ├── phase-2-core.md         # Detailed sub-plan            │
│      └── phase-3-testing.md      # Detailed sub-plan            │
│                                                                 │
│  COMPLEX PROJECT                                                │
│  ─────────────────────────────────────────────────────────────  │
│  .plans/                                                        │
│  └── migration-v2/                                              │
│      ├── _master.md              # High-level roadmap           │
│      ├── phase-1-assessment.md                                  │
│      ├── phase-2-preparation.md                                 │
│      ├── phase-3-migration.md                                   │
│      ├── phase-4-validation.md                                  │
│      └── phase-5-cleanup.md                                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### Master Plan Format (\_master.md)

```markdown
# Plan: Feature Authentication

## Status: Draft | In Progress | Completed

## Overview

[High-level description]

## Complexity: Simple | Standard | Complex

## Phases

| Phase | Description          | Sub-plan                                   | Status         |
| ----- | -------------------- | ------------------------------------------ | -------------- |
| 1     | Setup & Dependencies | [phase-1-setup.md](./phase-1-setup.md)     | ⏳ In Progress |
| 2     | Core Implementation  | [phase-2-core.md](./phase-2-core.md)       | ⏸️ Pending     |
| 3     | Testing & Polish     | [phase-3-testing.md](./phase-3-testing.md) | ⏸️ Pending     |

## Files to Change (All Phases)

[Comprehensive list]

## Dependencies

[External dependencies]

## Estimated Time

[Total estimate]
```

#### Sub-plan Format (phase-N-{name}.md)

```markdown
# Phase 1: Setup & Dependencies

## Parent Plan

[\_master.md](./_master.md)

## Status: Pending | In Progress | Completed

## Objective

[What this phase accomplishes]

## Tasks

- [ ] Task 1
- [ ] Task 2
- [ ] Task 3

## Context

[Self-contained context for this phase]

## Files

- path/to/file.ts (create)
- path/to/other.ts (modify)

## Acceptance Criteria

- [ ] Criterion 1
- [ ] Criterion 2

## Notes

[Implementation hints, gotchas]
```

### 4.4. Confirmation Points

```
┌─────────────────────────────────────────────────────────────────┐
│              CONFIRMATION POINTS                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ◆ CONFIRM #1: After Research/Scout                             │
│  ─────────────────────────────────────────────────────────────  │
│  WHY: Ensure findings are adequate before planning              │
│  SHOWS: Report file links, key findings summary                 │
│  OPTIONS: [Y] Proceed | [R] Redo research | [N] Cancel          │
│                                                                 │
│  ◆ CONFIRM #2: After Planning                                   │
│  ─────────────────────────────────────────────────────────────  │
│  WHY: Validate plan before implementation                       │
│  SHOWS: Plan summary, phases, estimated effort                  │
│  OPTIONS: [Y] Proceed | [E] Edit plan | [N] Cancel              │
│                                                                 │
│  ◆ CONFIRM #3: Before Commit                                    │
│  ─────────────────────────────────────────────────────────────  │
│  WHY: Final gate before pushing code                            │
│  SHOWS: Test results, review findings, commit message           │
│  OPTIONS: [Y] Commit | [N] Cancel                               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. Brainstorm Process

### 5.1. Why Brainstorm is NOT a Workflow

| Workflow              | Brainstorm                   |
| --------------------- | ---------------------------- |
| Automated, structured | Interactive, exploratory     |
| Fixed phases          | Unknown number of rounds     |
| Minimal human input   | Continuous human judgment    |
| Predictable output    | Output depends on discussion |
| Single session        | May span multiple sessions   |

**Brainstorm is a CONVERSATION, not automation.**

### 5.2. Brainstorm Command

```markdown
# commands/brainstorm.md

---

description: Start interactive brainstorm session to refine spec
allowed-tools: Read, Write, Glob, Grep, WebSearch, WebFetch
argument-hint: [spec content or file path]

---

# Brainstorm Session

## Input

$ARGUMENTS

## Instructions

1. Parse and analyze the provided spec
2. Scout related codebase areas
3. Research approaches if needed
4. Identify gaps and unclear points
5. Present options to developer
6. WAIT for developer feedback (this is a conversation)
7. Update spec file with decisions
8. Iterate until developer says "finalize"
9. Generate final spec to .claude/.specs/

## Important

- This is a CONVERSATION, not automated workflow
- Always ask and wait for feedback before proceeding
- Do not assume - ask the developer
- Track all decisions in the spec file
```

### 5.3. Structured Spec Format

```markdown
# Spec: Feature Authentication

## Status: Draft | Review | Final

---

## 1. Original Requirements

[Planner's original spec - do not modify this section]

---

## 2. Analysis

### 2.1 Codebase Impact

- Files affected: ...
- Modules impacted: ...
- Dependencies: ...

### 2.2 Gaps Identified

- [ ] Gap 1: Auth provider not specified
- [x] Gap 2: Session duration unclear → Decided: 24 hours

### 2.3 Open Questions

- [ ] Question 1: Which OAuth providers to support?
- [x] Question 2: Need refresh tokens? → Answer: Yes, 7-day expiry

---

## 3. Approach Options

### Option A: OAuth Only

**Pros:**

- Simpler implementation
- No password management

**Cons:**

- Depends on external providers
- Some users prefer email/password

### Option B: OAuth + Email/Password ← SELECTED

**Pros:**

- Flexible for users
- Fallback if OAuth fails

**Cons:**

- More complex
- Password security responsibility

**Selection Reason:** Client requires email/password for enterprise users

---

## 4. Technical Decisions

| Decision         | Choice | Reason                | Date       |
| ---------------- | ------ | --------------------- | ---------- |
| Auth provider    | Auth0  | Team experience       | 2025-01-01 |
| Session storage  | Redis  | Performance at scale  | 2025-01-01 |
| Token format     | JWT    | Stateless, standard   | 2025-01-01 |
| Password hashing | Argon2 | Current best practice | 2025-01-01 |

---

## 5. Final Spec

> Auto-generated when Status = Final

### Objective

Implement user authentication supporting OAuth (Google, GitHub) and
email/password login.

### Requirements

1. OAuth login with Google and GitHub
2. Email/password registration and login
3. JWT tokens with 24-hour expiry
4. Refresh tokens with 7-day expiry
5. Password reset via email

### Technical Approach

- Auth0 for OAuth handling
- Redis for session/token storage
- Argon2 for password hashing
- JWT for access tokens

### Out of Scope

- Two-factor authentication (Phase 2)
- Social login beyond Google/GitHub (Phase 2)

### Acceptance Criteria

- [ ] User can register with email/password
- [ ] User can login with Google OAuth
- [ ] User can login with GitHub OAuth
- [ ] User can reset password via email
- [ ] Sessions persist correctly
- [ ] Tokens refresh automatically
```

### 5.4. Brainstorm Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    BRAINSTORM FLOW                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Developer: /brainstorm [planner's spec]                        │
│                    │                                            │
│                    ▼                                            │
│  ┌─────────────────────────────────────────┐                    │
│  │  Claude:                                │                    │
│  │  1. Create spec file (Status: Draft)   │                    │
│  │  2. Copy original to Section 1         │                    │
│  │  3. Scout codebase → Section 2.1       │                    │
│  │  4. Identify gaps → Section 2.2        │                    │
│  │  5. List questions → Section 2.3       │                    │
│  │  6. Present findings to developer      │                    │
│  └─────────────────────────────────────────┘                    │
│                    │                                            │
│                    ▼                                            │
│  ┌─────────────────────────────────────────┐                    │
│  │  CONVERSATION LOOP                      │                    │
│  │  ─────────────────────────────────────  │                    │
│  │                                         │                    │
│  │  Developer answers question             │                    │
│  │  → Claude updates Section 2.3 [x]       │                    │
│  │                                         │                    │
│  │  Developer chooses approach             │                    │
│  │  → Claude marks SELECTED in Section 3   │                    │
│  │                                         │                    │
│  │  Developer confirms decision            │                    │
│  │  → Claude adds row to Section 4         │                    │
│  │                                         │                    │
│  │  Repeat until all gaps filled...        │                    │
│  │                                         │                    │
│  └─────────────────────────────────────────┘                    │
│                    │                                            │
│                    ▼                                            │
│  Developer: "finalize" or "let's finalize"                      │
│                    │                                            │
│                    ▼                                            │
│  ┌─────────────────────────────────────────┐                    │
│  │  Claude:                                │                    │
│  │  1. Generate Section 5 (Final Spec)    │                    │
│  │  2. Update Status: Final               │                    │
│  │  3. Save to .claude/.specs/            │                    │
│  └─────────────────────────────────────────┘                    │
│                    │                                            │
│                    ▼                                            │
│  Ready for /run workflow                                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 6. Example Flows

### 6.1. Complete Feature Flow

```
┌─────────────────────────────────────────────────────────────────┐
│  COMPLETE FEATURE DEVELOPMENT FLOW                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────┐                    │
│  │  PHASE 0: BRAINSTORM (Interactive)      │                    │
│  │  Command: /brainstorm [planner-spec]    │                    │
│  │  Output: .claude/.specs/feature-x.md    │                    │
│  │                                         │                    │
│  │  ⚠️ This is conversation, not workflow  │                    │
│  └─────────────────────────────────────────┘                    │
│                    │                                            │
│                    ▼                                            │
│  .claude/.specs/feature-auth.md (Status: Final)                 │
│                    │                                            │
│                    ▼                                            │
│  ┌─────────────────────────────────────────┐                    │
│  │  WORKFLOW: /run feature feature-auth    │                    │
│  └─────────────────────────────────────────┘                    │
│                    │                                            │
│                    ▼                                            │
│  ┌─────────────────────────────────────────┐                    │
│  │  Phase 1: Research (Parallel Agents)    │                    │
│  │  ─────────────────────────────────────  │                    │
│  │  RESEARCHER         SCOUTER             │                    │
│  │  Best practices     Codebase analysis   │                    │
│  │       ↓                  ↓              │                    │
│  │  .reports/          .reports/           │                    │
│  │  {ts}-research.md   {ts}-codebase.md    │                    │
│  └─────────────────────────────────────────┘                    │
│                    │                                            │
│                    ▼                                            │
│  ◆ CONFIRM #1: Research complete?                               │
│  [Y] Proceed | [R] Redo | [N] Cancel                            │
│                    │                                            │
│                    ▼ (Y)                                        │
│  ┌─────────────────────────────────────────┐                    │
│  │  Phase 2: Planning                      │                    │
│  │  ─────────────────────────────────────  │                    │
│  │  Analyze complexity → Create plan       │                    │
│  │       ↓                                 │                    │
│  │  .plans/feature-auth/                   │                    │
│  │  ├── _master.md                         │                    │
│  │  ├── phase-1-setup.md                   │                    │
│  │  ├── phase-2-core.md                    │                    │
│  │  └── phase-3-testing.md                 │                    │
│  └─────────────────────────────────────────┘                    │
│                    │                                            │
│                    ▼                                            │
│  ◆ CONFIRM #2: Plan ready?                                      │
│  [Y] Proceed | [E] Edit | [N] Cancel                            │
│                    │                                            │
│                    ▼ (Y)                                        │
│  ┌─────────────────────────────────────────┐                    │
│  │  Phase 3: Implement (per sub-plan)      │                    │
│  │  ─────────────────────────────────────  │                    │
│  │  Load phase-1-setup.md → Implement      │                    │
│  │  Load phase-2-core.md → Implement       │                    │
│  │  Load phase-3-testing.md → Implement    │                    │
│  └─────────────────────────────────────────┘                    │
│                    │                                            │
│                    ▼                                            │
│  ┌─────────────────────────────────────────┐                    │
│  │  Phase 4: Test                          │                    │
│  │  ─────────────────────────────────────  │                    │
│  │  Run test suite, validate coverage      │                    │
│  └─────────────────────────────────────────┘                    │
│                    │                                            │
│                    ▼                                            │
│  ┌─────────────────────────────────────────┐                    │
│  │  Phase 5: Review (Isolated Agent)       │                    │
│  │  ─────────────────────────────────────  │                    │
│  │  REVIEWER agent (fresh context)         │                    │
│  │  Security + quality review              │                    │
│  └─────────────────────────────────────────┘                    │
│                    │                                            │
│                    ▼                                            │
│  ◆ CONFIRM #3: Ready to commit?                                 │
│  Tests: ✅ 24/24 passed                                         │
│  Review: ✅ Approved                                            │
│  [Y] Commit | [N] Cancel                                        │
│                    │                                            │
│                    ▼ (Y)                                        │
│  ┌─────────────────────────────────────────┐                    │
│  │  Phase 6: Commit                        │                    │
│  │  ─────────────────────────────────────  │                    │
│  │  Git commit + push                      │                    │
│  │  Update documentation if needed         │                    │
│  └─────────────────────────────────────────┘                    │
│                    │                                            │
│                    ▼                                            │
│                 ✅ DONE                                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 6.2. Quick Bugfix Flow

```
┌─────────────────────────────────────────────────────────────────┐
│  QUICK BUGFIX FLOW (No brainstorm needed)                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Developer: /run bugfix "Login fails with special characters"   │
│                    │                                            │
│                    ▼                                            │
│  ┌─────────────────────────────────────────┐                    │
│  │  Route: Quick (detected "bugfix")       │                    │
│  └─────────────────────────────────────────┘                    │
│                    │                                            │
│                    ▼                                            │
│  ┌─────────────────────────────────────────┐                    │
│  │  Scout (single agent, quick scan)       │                    │
│  │  Find: Login validation code            │                    │
│  └─────────────────────────────────────────┘                    │
│                    │                                            │
│                    ▼                                            │
│  ┌─────────────────────────────────────────┐                    │
│  │  Plan: Single _master.md                │                    │
│  │  (no sub-plans for simple fix)          │                    │
│  └─────────────────────────────────────────┘                    │
│                    │                                            │
│                    ▼                                            │
│  ◆ CONFIRM: Plan ready?                                         │
│                    │                                            │
│                    ▼ (Y)                                        │
│  ┌─────────────────────────────────────────┐                    │
│  │  Fix → Test → Commit                    │                    │
│  └─────────────────────────────────────────┘                    │
│                    │                                            │
│                    ▼                                            │
│                 ✅ DONE                                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 7. Development Phases

### 7.1. Implementation Phases

```
┌─────────────────────────────────────────────────────────────────┐
│                   DEVELOPMENT PHASES                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  PHASE 1: FOUNDATION (1-2 days) ✅ COMPLETED                    │
│  ─────────────────────────────────────────────────────────────  │
│  ✓ Create folder structure                                      │
│  ✓ CLAUDE.md, settings.json                                     │
│  ✓ .gitignore (add .reports/, .plans/, .specs/, *.local.*)      │
│  ✓ Global rules (_global/)                                      │
│                                                                 │
│  PHASE 2: AGENTS (1 day) ✅ COMPLETED                           │
│  ─────────────────────────────────────────────────────────────  │
│  ✓ researcher.md (purple, WebSearch/WebFetch/Read/Write)        │
│  ✓ scouter.md (blue, Read/Glob/Grep/Bash/Write)                 │
│  ✓ reviewer.md (green, Read/Grep/Glob/Write)                    │
│                                                                 │
│  PHASE 3: CORE SKILLS (2 days) ✅ COMPLETED                     │
│  ─────────────────────────────────────────────────────────────  │
│  ✓ planning/ (SKILL.md + references/ + templates/)              │
│  ✓ implementation/ (SKILL.md + references/ + examples/)         │
│  ✓ testing/ (SKILL.md + references/ + examples/)                │
│  ✓ documentation/ (SKILL.md + templates/)                       │
│  ✓ security-audit/ (SKILL.md + references/)                     │
│  ✓ code-patterns/ (SKILL.md + references/ + examples/)          │
│  ✓ git-workflow/ (SKILL.md + references/)                       │
│                                                                 │
│  PHASE 4: BRAINSTORM & WORKFLOWS (2 days) ✅ COMPLETED          │
│  ─────────────────────────────────────────────────────────────  │
│  ✓ brainstorm.md command                                        │
│  ✓ Spec file template (templates/spec.md)                       │
│  ✓ workflows/_config.yaml (routing)                             │
│  ✓ feature.yaml, bugfix.yaml, refactor.yaml                     │
│  ✓ hotfix.yaml, research.yaml, review.yaml, docs.yaml           │
│  ✓ run.md command                                               │
│                                                                 │
│  PHASE 5: COMMANDS & HOOKS (1-2 days)                           │
│  ─────────────────────────────────────────────────────────────  │
│  □ Hooks: session-init, pre-edit, post-edit, on-stop            │
│  □ Commands: planning/, coding/, testing/, review/              │
│  □ Commands: docs/, git/, utils/                                │
│  □ Output styles                                                │
│                                                                 │
│  PHASE 6: PROJECT-SPECIFIC (Optional)                           │
│  ─────────────────────────────────────────────────────────────  │
│  □ Tech-specific skills (react, vue, python, etc.)              │
│  □ Project-specific rules                                       │
│  □ Custom workflows                                             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 7.2. File Checklist

```
┌─────────────────────────────────────────────────────────────────┐
│                    FILE CHECKLIST                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  CONFIG (3) ✅                                                  │
│  ✓ .claude/CLAUDE.md                                            │
│  ✓ .claude/settings.json                                        │
│  ✓ .gitignore                                                   │
│                                                                 │
│  AGENTS (3) ✅                                                  │
│  ✓ agents/researcher.md                                         │
│  ✓ agents/scouter.md                                            │
│  ✓ agents/reviewer.md                                           │
│                                                                 │
│  CORE SKILLS (7 directories, 40 files) ✅                       │
│  ✓ planning/SKILL.md + references/ + templates/                 │
│  ✓ implementation/SKILL.md + references/ + examples/            │
│  ✓ testing/SKILL.md + references/ + examples/                   │
│  ✓ documentation/SKILL.md + templates/                          │
│  ✓ security-audit/SKILL.md + references/                        │
│  ✓ code-patterns/SKILL.md + references/ + examples/             │
│  ✓ git-workflow/SKILL.md + references/                          │
│                                                                 │
│  WORKFLOWS (8) ✅                                               │
│  ✓ _config.yaml                                                 │
│  ✓ feature.yaml, bugfix.yaml, refactor.yaml, hotfix.yaml        │
│  ✓ research.yaml, review.yaml, docs.yaml                        │
│                                                                 │
│  COMMANDS (2 + templates) ✅                                    │
│  ✓ run.md, brainstorm.md                                        │
│  ✓ templates/spec.md                                            │
│  □ planning/: init, arch, estimate, breakdown                   │
│  □ coding/: implement, refactor, optimize, fix                  │
│  □ testing/: unit, integration, e2e, coverage                   │
│  □ review/: code, security, performance                         │
│  □ docs/: generate, api, readme, changelog                      │
│  □ git/: commit, pr, branch, sync                               │
│  □ utils/: context, clean, deps                                 │
│                                                                 │
│  RULES (~5 global) ✅                                           │
│  ✓ _global/: code-quality, communication, knowledge-freshness,  │
│              safety, workflow                                   │
│                                                                 │
│  HOOKS (4-5)                                                    │
│  □ session-init.sh                                              │
│  □ pre-edit-check.sh                                            │
│  □ post-edit-format.sh                                          │
│  □ post-edit-lint.sh                                            │
│  □ on-stop-checkpoint.sh                                        │
│                                                                 │
│  OUTPUT STYLES (3)                                              │
│  □ verbose.md, minimal.md, teaching.md                          │
│                                                                 │
│  TOTAL: ~75 files                                               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 7.3. Testing Checkpoints

| After Phase | Test                                                         |
| ----------- | ------------------------------------------------------------ |
| **1** ✅    | Claude reads CLAUDE.md, rules active, folders exist          |
| **2** ✅    | Agents spawn correctly, produce reports                      |
| **3** ✅    | Skills auto-load, supporting files accessible on-demand      |
| **4** ✅    | /brainstorm creates structured spec, /run triggers workflows |
| **5**       | Hooks execute, commands work                                 |
| **6**       | Full end-to-end: brainstorm → workflow → commit              |

---

## Appendix

### A. Resources

| Resource         | URL                                         |
| ---------------- | ------------------------------------------- |
| Claude Code Docs | https://code.claude.com/docs                |
| Agent Skills     | https://code.claude.com/docs/en/skills      |
| Subagents        | https://code.claude.com/docs/en/sub-agents  |
| Hooks            | https://code.claude.com/docs/en/hooks-guide |
| Plugins          | https://code.claude.com/docs/en/plugins     |

### B. Changelog

| Version | Date       | Changes                                                  |
| ------- | ---------- | -------------------------------------------------------- |
| 3.5     | 2025-12-31 | Phase 4 Workflows implemented - 8 workflows, 2 commands  |
| 3.4     | 2025-12-31 | Phase 3 Core Skills implemented - 7 skills, 40 files     |
| 3.3     | 2025-12-31 | Phase 2 Agents implemented - researcher, scouter, reviewer |
| 3.2     | 2025-12-31 | Phase 1 Foundation implemented - CLAUDE.md, settings, rules |
| 3.1     | 2025-12-31 | Brainstorm process, structured specs, hierarchical plans |
| 3.0     | 2025-12-31 | Technology agnostic version                              |
| 2.3     | 2025-12-31 | Multi-file skills, version fixes                         |

### C. Glossary

| Term           | Definition                                                 |
| -------------- | ---------------------------------------------------------- |
| **Agent**      | Isolated subagent with separate context and specific tools |
| **Skill**      | Shared knowledge that Claude auto-loads based on task      |
| **Workflow**   | Automated multi-phase process with confirmation points     |
| **Brainstorm** | Interactive conversation to refine specs before workflow   |
| **Spec**       | Complete specification document (output of brainstorm)     |
| **Plan**       | Implementation plan (hierarchical: master + sub-plans)     |
| **Report**     | Output from research/scout agents                          |

---

_Document version: 3.5_
_Last updated: December 31, 2025_
_Technology: Agnostic - applicable to any stack_
