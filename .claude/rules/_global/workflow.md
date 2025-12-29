# Workflow Rules

These rules define the standard workflow for different types of tasks.

## Core Workflow: Discuss (Optional) -> Plan -> Code -> Test (Optional) -> Review -> Commit (Optional)

### Phase 0: Discussion (Optional)
**When to Discuss:**
- Requirements are unclear or ambiguous
- Multiple valid approaches exist
- Architectural decisions needed
- Trade-offs need to be analyzed
- User says "let's discuss", "I'm not sure", "which approach"

**Skip Discussion When:**
- Requirements are clear and specific
- Simple implementation with obvious approach
- Following existing patterns

**Discussion Output:**
- Discussion summary in `.claude/.discussions/`
- ADR decision record in `.claude/.decisions/` (if decision made)
- Scout reports in `.claude/.reports/` (auto-generated for code-related topics)
  - Naming: `YYYY-MM-DD-HH-MM-<topic>.md`
  - Contains architecture, data flow, and dependencies analysis
- Research reports in `.claude/.reports/` (auto-generated for non-code topics)
  - Naming: `YYYY-MM-DD-HH-MM-research-<topic>.md`
  - Contains external library docs, best practices, comparisons, troubleshooting
- Use `/discuss <topic>` command

### Phase 1: Planning
**When to Plan:**
- New features (always)
- Complex bug fixes
- Refactoring (medium+)
- Multi-file changes

**Skip Planning When:**
- Simple typo fixes
- Single-line changes
- Adding comments/docs only

**Planning Output:**
- Plan file in `.claude/.plans/`
- Naming: `YYYY-MM-DD-HH-MM-<type>-<name>.md`
- User approval required before proceeding

### Phase 2: Implementation
**Process:**
1. Read the approved plan
2. Implement step by step
3. Update plan checkboxes as you go
4. Run lint/typecheck after each file
5. Report progress regularly

**If Blocked:**
- Stop immediately
- Document the blocker
- Propose alternatives
- Wait for user decision

### Phase 3: Testing (Optional)
Use AskUserQuestion tool before writing tests. Testing is recommended but optional.

**When Tests Are Requested:**
- Happy path (normal use cases)
- Edge cases (boundaries, empty, null)
- Error cases (invalid input, failures)
- Integration points

**Testing Order (if TDD):**
1. Write test for the feature/fix
2. Verify test fails (confirms bug exists or feature is new)
3. Implement the solution
4. Verify test passes
5. Run full test suite

**Skip Testing When:**
- User explicitly declines
- Quick prototype or proof-of-concept
- Project doesn't have test infrastructure

### Phase 4: Review
**Self-Review Before Requesting:**
- All tests pass (if tests exist)
- Linter passes
- Type checker passes
- No console.log/debug code
- Error handling complete

**Review Checklist:**
- [ ] Code quality standards met
- [ ] Security considerations addressed
- [ ] Performance acceptable
- [ ] Tests adequate (if user requested tests)
- [ ] Documentation updated

### Phase 5: Commit (Optional)
Use AskUserQuestion tool before committing changes. Committing is optional.

**When User Wants to Commit:**
1. Create commit(s) with conventional message format
2. Ask if user wants to create a PR
3. If yes, create PR with summary

**When User Declines Commit:**
- Provide summary of changes made
- List files modified
- Remind user changes are uncommitted
- User will commit manually when ready

**Skip Asking When:**
- User has already expressed preference in this session
- User explicitly requested commit in original task

## Command Usage Guide

### Requirements Gathering
```
Use Case: Unclear requirements, architectural decisions, trade-off analysis
Command: /discuss <topic>
Workflow: Clarify -> Explore -> Decide -> Discussion Summary + ADR
Output: .claude/.discussions/ and .claude/.decisions/
```

### Codebase Research
```
Use Case: Deep analysis of existing code before changes or discussions
Command: /scout <topic>
Workflow: Parallel Analysis (Architecture + Data Flow + Dependencies) -> Consolidated Report
Output: .claude/.reports/
Note: Auto-invoked during /discuss for code-related topics
```

### Internet Research
```
Use Case: External library docs, tech comparisons, best practices, troubleshooting
Command: /research <topic>
Workflow: Classify Topic -> Select Dimensions -> Research (parallel) -> Consolidate -> Report
Output: .claude/.reports/
Topic Types: COMPARISON, HOW_TO, BEST_PRACTICE, TROUBLESHOOTING, SECURITY, PERFORMANCE, CURRENT_STATE, DEFAULT
Dimensions: official-docs, best-practices, comparisons, examples, current-state, troubleshooting, security, performance
Note: Auto-invoked during /discuss for non-code topics and during /plan for external libraries
```

### Feature Development
```
Use Case: New feature from scratch
Command: /feature <description>
Workflow: (Check discussions) -> Plan -> Implement -> Test (optional) -> Review -> Commit (optional) -> PR (optional)
```

### Bug Fixing
```
Use Case: Fixing reported bugs
Command: /bugfix <error or description>
Workflow: Debug -> Write failing test (optional) -> Fix -> Verify -> Review -> Commit (optional) -> PR (optional)
```

### Quick Changes
```
Use Case: Simple changes (< 3 files)
Command: Direct implementation (no command)
Workflow: Edit -> Test (if needed) -> Commit (optional)
```

### Code Quality
```
Use Case: Improve existing code
Command: /refactor <target>
Workflow: Analyze -> Plan -> Implement in small steps -> Verify
```

## Checkpoint Requirements

### User Approval Required
1. After creating plan (before implementation)
2. Before writing tests (ask if user wants tests)
3. Before committing changes (ask if user wants to commit)
4. Before large deletions (> 10 files or > 500 lines)
5. Before destructive git operations
6. Before making breaking changes
7. When switching approaches mid-implementation

### Progress Reports
- After each phase completion
- After significant milestones
- When encountering unexpected issues
- Before final completion

## Progress Tracking

### Plan File Updates
- Update checkboxes as steps complete: `[ ]` -> `[x]`
- Add notes for deviations from plan
- Log any issues encountered
- Update status in metadata
- Reference scout reports or research reports in metadata if auto-generated during workflow

### Reporting Format
```
✅ Step N: [description]
   - Files changed: [list]
   - Notes: [any relevant info]
```

## Commit Strategy

**IMPORTANT**: Always ask user before committing. Never commit automatically.

### When to Offer Commit
- After each logical unit of work is complete
- After passing tests and review
- Before switching to unrelated work
- At natural breakpoints

### If User Declines Commit
- Leave changes uncommitted
- Provide summary of what was done
- User can use `/commit` later when ready

### Commit Message Format
- Use conventional commits: `type(scope): description`
- Types: feat, fix, docs, style, refactor, perf, test, chore
- Keep subject under 50 chars
- Add body for complex changes

## Branch Strategy

### Feature Development
1. Create branch from main: `feature/<description>`
2. Make atomic commits
3. Keep branch updated with main
4. Create PR when ready

### Bug Fixes
- Branch naming: `fix/<issue-or-description>`
- Include issue number in commits/PR

### Hotfixes
- Branch from production: `hotfix/<description>`
- Minimal changes only
- Expedited review process
- Merge to both production and main

## Quality Gates

### Before Creating PR
- [ ] All tests pass locally (if tests exist)
- [ ] Lint passes
- [ ] Type check passes
- [ ] No debug code remains
- [ ] Documentation updated
- [ ] Changelog updated (if applicable)

### PR Requirements
- Clear title following conventional format
- Description with summary and test plan
- Link to related issues
- Screenshots for UI changes
