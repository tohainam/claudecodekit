---
description: Create a pull request with proper description
allowed-tools: Bash, Read, Glob, Grep
argument-hint: [title]
---

# Create Pull Request

Create a well-documented pull request using the GitHub CLI.

## Input
Optional title: $ARGUMENTS

## Context Gathering

First, understand the current state:

- Current branch: !`git branch --show-current`
- Remote tracking: !`git status -sb`
- Commits on this branch: !`git log --oneline main..HEAD 2>/dev/null || git log --oneline master..HEAD 2>/dev/null || git log --oneline -10`
- Changed files: !`git diff --stat main..HEAD 2>/dev/null || git diff --stat master..HEAD 2>/dev/null`

## Process

### Step 1: Pre-flight Checks
Verify before creating PR:
- [ ] Branch is up to date with base branch
- [ ] All tests pass locally
- [ ] No uncommitted changes
- [ ] Branch pushed to remote

If branch not pushed:
```bash
git push -u origin $(git branch --show-current)
```

### Step 2: Analyze All Changes
Review ALL commits on the branch (not just the latest):
```bash
git log --oneline main..HEAD
git diff main..HEAD
```

### Step 3: Generate PR Content

**Title Format:**
```
<type>(<scope>): <description>
```
Example: `feat(auth): add OAuth2 login support`

**Description Template:**
```markdown
## Summary
<1-3 bullet points describing the change>

## Changes
- <Specific change 1>
- <Specific change 2>
- <Specific change 3>

## Test Plan
- [ ] How to test this change
- [ ] What to verify

## Related Issues
Closes #<issue-number> (if applicable)

---
🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

### Step 4: Create PR

Use GitHub CLI with HEREDOC for proper formatting:

```bash
gh pr create --title "<title>" --body "$(cat <<'EOF'
## Summary
<summary content>

## Changes
- Change 1
- Change 2

## Test Plan
- [ ] Test step 1
- [ ] Test step 2

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

### Step 5: Verify
After PR creation:
- Show PR URL
- Show PR status
- Note any CI checks running

## PR Best Practices

**Title:**
- Use conventional commit format
- Be specific about what changed
- Max 72 characters

**Description:**
- Explain WHY, not just WHAT
- Include test instructions
- Reference related issues
- Add screenshots for UI changes

**Size:**
- Keep PRs focused and reviewable
- Split large changes into smaller PRs
- One logical change per PR

## Output

After successful PR creation:
- PR URL
- PR number
- Status of CI checks
- Reviewers (if auto-assigned)

## Error Handling

If PR creation fails:
- Check if branch is pushed
- Verify gh CLI is authenticated
- Check for duplicate PRs
- Verify base branch exists
