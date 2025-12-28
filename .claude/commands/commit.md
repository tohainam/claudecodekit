---
description: Create a git commit with conventional commit message
allowed-tools: Bash, Read, Glob, Grep
argument-hint: [commit message]
---

# Create Git Commit

Create a well-formatted git commit following conventional commit standards.

## Input
Optional message: $ARGUMENTS

## Context Gathering

First, gather information about current changes:

- Current git status: !`git status --short`
- Staged changes: !`git diff --staged --stat`
- Unstaged changes: !`git diff --stat`
- Recent commits: !`git log --oneline -5`
- Current branch: !`git branch --show-current`

## Process

### Step 1: Analyze Changes
Review what's being committed:
- If nothing staged, suggest what to stage
- If message provided, validate it fits changes
- If no message, analyze changes to generate one

### Step 2: Validate Staged Files
Check for issues:
- No `.env` or secrets files
- No debug/console.log statements
- No large binary files (unless intentional)

### Step 3: Generate/Validate Commit Message

**Conventional Commit Format:**
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Formatting (no code change)
- `refactor`: Code restructuring
- `perf`: Performance improvement
- `test`: Adding/updating tests
- `build`: Build system changes
- `ci`: CI configuration
- `chore`: Maintenance tasks
- `revert`: Reverting changes

**Rules:**
- Subject: imperative mood, no period, max 50 chars
- Body: explain WHY, wrap at 72 chars
- Footer: reference issues, note breaking changes

### Step 4: Create Commit

If message provided:
```bash
git commit -m "$ARGUMENTS"
```

If generating message, use HEREDOC for proper formatting:
```bash
git commit -m "$(cat <<'EOF'
type(scope): subject line here

Body explaining why this change was made.
What problem it solves or what feature it adds.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

### Step 5: Verify
After commit:
```bash
git status
git log -1
```

## Safety Rules

**NEVER:**
- Use `--no-verify` flag
- Amend pushed commits without explicit permission
- Commit sensitive files (.env, secrets, credentials)

**ALWAYS:**
- Review staged changes before committing
- Use clear, descriptive messages
- Follow project's commit conventions

## Output

After successful commit:
- Show commit hash and message
- Show current git status
- Note if ready to push

If commit fails (hooks, etc.):
- Show the error
- Suggest how to fix
- Do NOT bypass with --no-verify
