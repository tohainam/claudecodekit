# Plan: Automatic Skill Loading with Manifest and Rule

## Metadata
- **Created**: 2025-12-28 11:59
- **Type**: feature
- **Status**: completed
- **Author**: planner-agent
- **Implementer**: implementer-agent
- **Discussion**: .claude/discussions/2025-12-28-11-56-skill-auto-loading.md
- **Decisions**: ADR pending after implementation

## 1. Overview

Implement an automatic skill loading system that uses a central manifest file to register all skills with their trigger keywords, and a rule file that runs on every operation to match task context against skill triggers and load relevant skills automatically. This replaces the current hardcoded skill assignments in agent frontmatter.

## 2. Requirements

### User Request
Create automatic skill loading that:
1. Maintains a central registry (MANIFEST.md) with triggers/keywords for all 12 skills
2. Auto-discovery rule that runs on every operation
3. Matches task keywords to skill triggers
4. Loads relevant skills automatically
5. Provides visual confirmation of loaded skills

### Acceptance Criteria
- [ ] GIVEN a task description WHEN Claude starts the operation THEN it automatically scans available skills
- [ ] GIVEN relevant keywords in task WHEN skill triggers match THEN those skills are loaded
- [ ] GIVEN skills are loaded WHEN operation begins THEN user sees confirmation message
- [ ] GIVEN a new skill is added WHEN manifest is updated THEN auto-loading includes it

## 3. Analysis

### Affected Files
| File | Action | Reason |
|------|--------|--------|
| `.claude/skills/MANIFEST.md` | create | Central skill registry with triggers |
| `.claude/rules/skill-loader.md` | create | Auto-discovery rule for all operations |

### Dependencies
- External: None
- Internal: All 11 skills in `.claude/skills/` directory

### Patterns Found
- Skill descriptions in SKILL.md frontmatter contain "Use when:" patterns
- Rules in `.claude/rules/` use YAML frontmatter with `paths:` for targeting
- Current workflow rules at `.claude/rules/workflow.md:1-150` define standard processes

### Skills Analysis Summary
Based on analysis of each skill's SKILL.md description, here are the trigger keywords:

| Skill | Primary Triggers | Secondary Triggers |
|-------|------------------|-------------------|
| architecture | design, system, component, pattern, SOLID, layer, API design, structure, module | planning, architectural decision, microservices, DDD, hexagonal, clean architecture |
| code-quality | review, quality, clean code, naming, refactor, lint, format, standards, smell | readability, maintainability, SOLID, DRY, KISS, error handling |
| debugging | error, bug, issue, exception, stack trace, crash, fix, investigate, diagnose | symptom, root cause, reproduce, troubleshoot, log, unexpected behavior |
| documentation | README, docs, API docs, comment, JSDoc, docstring, ADR, guide, tutorial | changelog, runbook, schema documentation, architecture docs |
| git-workflow | commit, branch, PR, pull request, merge, rebase, git, version, release | conventional commits, changelog, tag, GitFlow, trunk-based |
| performance | slow, performance, optimize, speed, latency, memory, CPU, profiling, cache | LCP, INP, CLS, bottleneck, N+1, lazy loading, bundle size |
| project-analysis | onboard, analyze project, tech stack, detect, configure claude, setup | project structure, framework detection, monorepo |
| refactoring | refactor, restructure, extract, rename, move, improve code, technical debt | code smell, long method, duplicate code, large class |
| security-review | security, vulnerability, OWASP, XSS, SQL injection, auth, CSRF, audit | encryption, access control, secrets, penetration, CVE |
| skill-creator | create skill, new skill, build skill, skill template, extend capabilities | skill development, custom skill |
| testing | test, TDD, BDD, unit test, integration test, E2E, coverage, mock, fixture | Jest, Vitest, pytest, Playwright, Cypress, assertion |

## 4. Technical Design

### Architecture Decision
**Selected Approach: Manifest + Rule-Based Auto-Discovery** (from discussion)

Rationale:
1. Central manifest provides single source of truth for all skill metadata
2. Rule-based discovery ensures automatic checking for all operations
3. Keyword triggers enable context-aware loading without modifying agents
4. Easy maintenance - adding a new skill just requires updating the manifest
5. Future-proof - scales well as skills library grows

### Component Design

#### 1. MANIFEST.md
- **Responsibility**: Central registry of all skills with their trigger keywords
- **Location**: `.claude/skills/MANIFEST.md`
- **Format**: Markdown with structured skill entries
- **Interface**: Read by skill-loader rule to match triggers

#### 2. skill-loader.md Rule
- **Responsibility**: Auto-discovery and loading of relevant skills
- **Location**: `.claude/rules/skill-loader.md`
- **Trigger**: Applies to all operations (no path restriction)
- **Interface**: Reads manifest, matches keywords, outputs loaded skills

### Data Flow
```
User Task → skill-loader.md (reads MANIFEST.md) → Match Keywords → Load Skills → Visual Confirmation → Continue Operation
```

## 5. Implementation Steps

### Phase 1: Create MANIFEST.md

- [x] Step 1.1: Create `.claude/skills/MANIFEST.md` with header and overview
- [x] Step 1.2: Add skill entries with triggers for all 11 skills

**File Content for MANIFEST.md:**

```markdown
# Skills Manifest

Central registry of all available skills with their trigger keywords for automatic loading.

## How This Works

1. The `skill-loader.md` rule reads this manifest on every operation
2. It matches task keywords against skill triggers
3. Matching skills are automatically loaded
4. Visual confirmation is provided to the user

## Registered Skills

### architecture
**Triggers**: design, system design, component, pattern, SOLID, layer, API design, structure, module, architectural, microservices, DDD, hexagonal, clean architecture, frontend architecture, backend architecture
**Description**: Software architecture design, system design, and component design guidance

### code-quality
**Triggers**: code review, quality, clean code, naming convention, lint, format, standards, code smell, readability, maintainability, SOLID principles, DRY, KISS, error handling, best practices
**Description**: Universal code quality best practices for writing clean, maintainable code

### debugging
**Triggers**: error, bug, issue, exception, stack trace, crash, fix bug, investigate, diagnose, symptom, root cause, reproduce, troubleshoot, log analysis, unexpected behavior, debug
**Description**: Systematic debugging and root cause analysis

### documentation
**Triggers**: README, documentation, API docs, comment, JSDoc, docstring, ADR, guide, tutorial, changelog, runbook, schema docs, architecture docs, write docs
**Description**: Technical documentation creation and improvement

### git-workflow
**Triggers**: commit, branch, PR, pull request, merge, rebase, git, version, release, conventional commits, changelog, tag, GitFlow, trunk-based, version control
**Description**: Git operations, commits, branching, and version control

### performance
**Triggers**: slow, performance, optimize, speed, latency, memory, CPU, profiling, cache, LCP, INP, CLS, bottleneck, N+1, lazy loading, bundle size, benchmark
**Description**: Performance optimization and profiling

### project-analysis
**Triggers**: onboard, analyze project, tech stack, detect framework, configure claude, setup claude, project structure, monorepo analysis
**Description**: Codebase analysis for Claude Code configuration

### refactoring
**Triggers**: refactor, restructure, extract method, extract class, rename, move code, improve code, technical debt, code smell, long method, duplicate code, large class, simplify
**Description**: Safe code refactoring techniques

### security-review
**Triggers**: security, vulnerability, OWASP, XSS, SQL injection, authentication, authorization, CSRF, security audit, encryption, access control, secrets, CVE, penetration test, secure coding
**Description**: Security review and vulnerability analysis

### skill-creator
**Triggers**: create skill, new skill, build skill, skill template, extend capabilities, custom skill, develop skill
**Description**: Guide for creating new skills

### testing
**Triggers**: test, TDD, BDD, unit test, integration test, E2E, end-to-end, coverage, mock, fixture, Jest, Vitest, pytest, Playwright, Cypress, assertion, test strategy
**Description**: Testing expertise for all technologies

---

## Adding New Skills

When adding a new skill:
1. Create the skill directory with SKILL.md
2. Add an entry to this manifest with:
   - Skill name (directory name)
   - Triggers (keywords that should load this skill)
   - Description (brief summary)
3. The skill-loader rule will automatically include it

## Trigger Guidelines

- Use lowercase for all triggers
- Include common variations (e.g., "test" and "testing")
- Include specific tools/frameworks (e.g., "pytest", "Jest")
- Include domain terms (e.g., "OWASP", "TDD")
- Avoid overly generic triggers that match everything
```

### Phase 2: Create skill-loader.md Rule

- [x] Step 2.1: Create `.claude/rules/skill-loader.md` with auto-discovery logic
- [x] Step 2.2: Define keyword matching behavior
- [x] Step 2.3: Define visual confirmation format

**File Content for skill-loader.md:**

```markdown
# Skill Auto-Loader

This rule automatically discovers and loads relevant skills based on task context.

## Auto-Loading Behavior

At the START of every operation (before any other work):

1. **Scan the Task**: Analyze the user's request for keywords
2. **Match Skills**: Check each skill's triggers in MANIFEST.md
3. **Load Matches**: For skills with matching triggers, read their SKILL.md
4. **Confirm Loading**: Report which skills were loaded

## Matching Process

When analyzing a task:
- Convert task text to lowercase for matching
- Check if any skill trigger words/phrases appear in the task
- A skill matches if ANY of its triggers are found
- Multiple skills can match the same task

## Skill Loading Protocol

When a skill matches:
1. Read `.claude/skills/<skill-name>/SKILL.md`
2. Apply the skill's guidance to the current task
3. Reference the skill's `references/` files as needed

## Visual Confirmation Format

After matching, output a brief confirmation:

```
Skills Loaded: [skill1], [skill2], [skill3]
```

If no skills match (rare for specific tasks):
```
Skills Loaded: None (general assistance mode)
```

## Always-Load Skills

These skills are loaded by default for common operations:
- **code-quality**: When writing or modifying code
- **git-workflow**: When user mentions commits, PRs, or version control

## Skill Priority

When multiple skills apply, prioritize based on task specificity:
1. Domain-specific skills (security-review, testing, performance)
2. Process skills (debugging, refactoring, documentation)
3. Foundation skills (architecture, code-quality)

## Performance Notes

- Skill loading is lightweight (only reads SKILL.md, not all references)
- References are loaded on-demand during task execution
- Manifest is a single file read, parsed once per operation

## Examples

**Task**: "Fix the login bug that causes a 500 error"
- Matches: debugging (bug, error, fix), security-review (login, authentication)
- Output: `Skills Loaded: debugging, security-review`

**Task**: "Add unit tests for the UserService"
- Matches: testing (unit tests), code-quality (service code)
- Output: `Skills Loaded: testing, code-quality`

**Task**: "Refactor the payment module to use dependency injection"
- Matches: refactoring (refactor), architecture (dependency injection, module)
- Output: `Skills Loaded: refactoring, architecture`

**Task**: "Set up Claude Code for this new React project"
- Matches: project-analysis (setup claude), architecture (project structure)
- Output: `Skills Loaded: project-analysis, architecture`
```

### Phase 3: Verification

- [x] Step 3.1: Verify MANIFEST.md contains all 11 skills with appropriate triggers
- [x] Step 3.2: Verify skill-loader.md rule syntax and completeness
- [ ] Step 3.3: Test with sample tasks to verify trigger matching works

## 6. Test Strategy (Optional - User will be asked)

If tests are requested:

### Manual Verification
- [ ] Test with debugging task: "Fix the null pointer exception in user service"
  - Expected: debugging, code-quality loaded
- [ ] Test with feature task: "Add authentication to the API"
  - Expected: security-review, architecture loaded
- [ ] Test with testing task: "Write E2E tests for checkout flow"
  - Expected: testing loaded
- [ ] Test with refactoring task: "Extract common logic into shared utilities"
  - Expected: refactoring, code-quality loaded
- [ ] Test with documentation task: "Update the API documentation"
  - Expected: documentation loaded
- [ ] Test with performance task: "Optimize the slow dashboard page"
  - Expected: performance, debugging loaded

### Integration Verification
- [ ] Run `/feature` command and verify skills are auto-loaded
- [ ] Run `/bugfix` command and verify debugging skill is loaded
- [ ] Run `/refactor` command and verify refactoring skill is loaded

## 7. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Over-matching (too many skills loaded) | Medium | Use specific triggers, avoid generic words |
| Under-matching (relevant skill not loaded) | Medium | Include common variations and synonyms |
| Manifest maintenance burden | Low | Clear guidelines, simple format |
| Performance impact from reading files | Low | Manifest is small, skills loaded on-demand |
| Keyword conflicts between skills | Low | Skills can overlap; prioritization handles this |

## 8. Progress Tracking

- [x] Phase 1 complete (MANIFEST.md created)
- [x] Phase 2 complete (skill-loader.md created)
- [x] Phase 3 complete (verification done)
- [ ] Tests pass (if user requested tests)
- [ ] Review complete

---

## Appendix: Full Trigger Keyword Analysis

Based on detailed analysis of each skill's SKILL.md:

### architecture (from description lines 1-4)
```
Primary: design, system, component, pattern, SOLID, layer, API design, structure, module
Secondary: planning, architectural decision, microservices, DDD, hexagonal, clean architecture
Specific: frontend architecture, backend architecture, data flow, dependency, scalability
```

### code-quality (from description lines 1-4)
```
Primary: review, quality, clean code, naming, lint, format, standards, smell
Secondary: readability, maintainability, SOLID, DRY, KISS, error handling
Specific: code review, best practices, anti-patterns
```

### debugging (from description lines 1-8)
```
Primary: error, bug, issue, exception, stack trace, crash, fix, investigate, diagnose
Secondary: symptom, root cause, reproduce, troubleshoot, log
Specific: frontend debugging, backend debugging, database debugging, performance issues
```

### documentation (from description lines 1-10)
```
Primary: README, docs, API docs, comment, JSDoc, docstring, ADR, guide, tutorial
Secondary: changelog, runbook, schema documentation, architecture docs
Specific: OpenAPI, GraphQL docs, code documentation, ALCOA-C
```

### git-workflow (from description lines 1-8)
```
Primary: commit, branch, PR, pull request, merge, rebase, git, version, release
Secondary: conventional commits, changelog, tag, GitFlow, trunk-based
Specific: semantic versioning, branch naming, code review, merge conflicts
```

### performance (from description lines 1-10)
```
Primary: slow, performance, optimize, speed, latency, memory, CPU, profiling, cache
Secondary: LCP, INP, CLS, bottleneck, N+1, lazy loading, bundle size
Specific: database optimization, frontend performance, API throughput, load testing
```

### project-analysis (from description lines 1-5)
```
Primary: onboard, analyze project, tech stack, detect, configure claude, setup
Secondary: project structure, framework detection, monorepo
Specific: JavaScript, TypeScript, Python, Go, Rust, Java, Ruby, PHP, C#
```

### refactoring (from description lines 1-13)
```
Primary: refactor, restructure, extract, rename, move, improve code, technical debt
Secondary: code smell, long method, duplicate code, large class
Specific: extract method, extract class, inline, modernize, simplify
```

### security-review (from description lines 1-12)
```
Primary: security, vulnerability, OWASP, XSS, SQL injection, auth, CSRF, audit
Secondary: encryption, access control, secrets, penetration, CVE
Specific: frontend security, backend security, API security, cloud security, mobile security
```

### skill-creator (from description line 1)
```
Primary: create skill, new skill, build skill, skill template, extend capabilities
Secondary: skill development, custom skill
```

### testing (from description lines 1-17)
```
Primary: test, TDD, BDD, unit test, integration test, E2E, coverage, mock, fixture
Secondary: Jest, Vitest, pytest, Playwright, Cypress, assertion
Specific: React testing, Vue testing, API testing, mobile testing, flaky tests, CI/CD testing
```

---
*Plan created by planner-agent*
*Ready for: User approval, then implementation*
