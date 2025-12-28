# Workflow Rules

These rules define the standard workflow for different types of tasks.

## Core Workflow: Plan -> Code -> Test -> Review

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
- Plan file in `.claude/plans/`
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

### Phase 3: Testing
**What to Test:**
- Happy path (normal use cases)
- Edge cases (boundaries, empty, null)
- Error cases (invalid input, failures)
- Integration points

**Testing Order:**
1. Write test for the feature/fix
2. Verify test fails (confirms bug exists or feature is new)
3. Implement the solution
4. Verify test passes
5. Run full test suite

### Phase 4: Review
**Self-Review Before Requesting:**
- All tests pass
- Linter passes
- Type checker passes
- No console.log/debug code
- Error handling complete

**Review Checklist:**
- [ ] Code quality standards met
- [ ] Security considerations addressed
- [ ] Performance acceptable
- [ ] Tests adequate
- [ ] Documentation updated

## Command Usage Guide

### Feature Development
```
Use Case: New feature from scratch
Command: /feature <description>
Workflow: Plan -> Implement -> Test -> Review -> Commit/PR
```

### Bug Fixing
```
Use Case: Fixing reported bugs
Command: /bugfix <error or description>
Workflow: Debug -> Write failing test -> Fix -> Verify -> Review
```

### Quick Changes
```
Use Case: Simple changes (< 3 files)
Command: Direct implementation (no command)
Workflow: Edit -> Test -> Commit
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
2. Before large deletions (> 10 files or > 500 lines)
3. Before destructive git operations
4. Before making breaking changes
5. When switching approaches mid-implementation

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

### Reporting Format
```
✅ Step N: [description]
   - Files changed: [list]
   - Notes: [any relevant info]
```

## Commit Strategy

### When to Commit
- After each logical unit of work
- After passing tests
- Before switching to unrelated work
- At natural breakpoints

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
- [ ] All tests pass locally
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
