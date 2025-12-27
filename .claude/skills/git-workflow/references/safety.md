# Git Safety Guidelines

## Table of Contents
1. [Critical Rules](#critical-rules)
2. [Dangerous Commands](#dangerous-commands)
3. [Safe Alternatives](#safe-alternatives)
4. [Recovery Procedures](#recovery-procedures)
5. [Pre-Commit Checklist](#pre-commit-checklist)

---

## Critical Rules

### Never Do These
| Action | Why Dangerous | Safe Alternative |
|--------|---------------|------------------|
| `git push --force` to main/master | Overwrites team history | `git push --force-with-lease` on feature branches only |
| `git reset --hard` without backup | Loses uncommitted work | `git stash` first, or use `git reset --soft` |
| Commit `.env`, secrets, credentials | Security breach | Add to `.gitignore`, use vault |
| `git rebase` on shared branches | Breaks collaborators | Rebase only local/personal branches |
| Skip hooks with `--no-verify` | Bypasses safety checks | Fix the hook issue properly |
| Amend pushed commits | Requires force push | Create new commit instead |

### Always Do These
- Pull before push
- Review `git status` and `git diff` before commit
- Use descriptive branch names
- Test before pushing
- Back up before destructive operations

---

## Dangerous Commands

### High Risk (Avoid)
```bash
# Destroys remote history - NEVER on main/shared branches
git push --force
git push -f

# Loses all uncommitted changes permanently
git reset --hard HEAD
git checkout -- .
git clean -fd

# Rewrites history - dangerous on shared branches
git rebase -i <hash>
git commit --amend  # if already pushed

# Deletes without confirmation
git branch -D <branch>  # force delete
```

### Medium Risk (Use Carefully)
```bash
# Changes history - OK on personal branches
git rebase <branch>
git commit --amend  # before push only

# Force push with safety
git push --force-with-lease  # safer than --force

# Discards staged changes
git reset HEAD <file>
```

### Safe Commands
```bash
# Always safe
git status
git log
git diff
git branch -a
git stash list

# Safe - creates new commits
git revert <hash>
git merge <branch>
```

---

## Safe Alternatives

### Instead of `git reset --hard`
```bash
# Option 1: Stash first
git stash
git reset --hard HEAD
git stash pop  # if needed

# Option 2: Create backup branch
git branch backup-branch
git reset --hard HEAD

# Option 3: Soft reset (keeps changes staged)
git reset --soft HEAD~1
```

### Instead of `git push --force`
```bash
# Option 1: Force with lease (refuses if remote changed)
git push --force-with-lease

# Option 2: Revert instead of rewriting
git revert <bad-commit>
git push

# Option 3: New branch for controversial changes
git checkout -b feature-v2
git push -u origin feature-v2
```

### Instead of `git commit --amend` (after push)
```bash
# Create a new "fixup" commit
git commit -m "fix: correct typo in previous commit"
git push

# Or use revert + new commit
git revert HEAD
git commit -m "feat: correct implementation"
```

### Instead of `git checkout -- .`
```bash
# Stash instead of discard
git stash

# Or selectively discard
git checkout -- <specific-file>

# Or use restore (Git 2.23+)
git restore <file>
git restore --staged <file>
```

---

## Recovery Procedures

### Recover Deleted Branch
```bash
# Find the commit hash
git reflog

# Recreate branch from hash
git checkout -b recovered-branch <hash>
```

### Recover Deleted Commits
```bash
# View reflog
git reflog

# Reset to previous state
git reset --hard HEAD@{2}

# Or cherry-pick specific commit
git cherry-pick <hash>
```

### Recover Stashed Changes
```bash
# List all stashes
git stash list

# Apply specific stash
git stash apply stash@{2}

# View stash contents
git stash show -p stash@{0}
```

### Undo Last Commit
```bash
# Keep changes staged
git reset --soft HEAD~1

# Keep changes unstaged
git reset HEAD~1

# Discard changes completely (careful!)
git reset --hard HEAD~1
```

### Undo Merge
```bash
# If not pushed yet
git reset --hard HEAD~1

# If already pushed - use revert
git revert -m 1 <merge-commit-hash>
```

### Recover File from History
```bash
# Get file from specific commit
git checkout <commit-hash> -- path/to/file

# Get file from N commits ago
git checkout HEAD~3 -- path/to/file
```

---

## Pre-Commit Checklist

### Before Every Commit
```bash
# 1. Check status
git status

# 2. Review changes
git diff                    # unstaged
git diff --staged           # staged

# 3. Verify no secrets
git diff --staged | grep -i "password\|secret\|key\|token"

# 4. Check files being committed
git diff --staged --name-only
```

### Before Pushing
```bash
# 1. Pull latest
git pull --rebase origin <branch>

# 2. Run tests
npm test  # or equivalent

# 3. Run linter
npm run lint  # or equivalent

# 4. Review commit history
git log --oneline -5

# 5. Verify remote
git remote -v
```

### Before Force Push (Feature Branches Only)
```bash
# 1. Verify branch is personal/feature
git branch --show-current

# 2. Check if anyone else is using branch
git log --oneline origin/<branch>..HEAD

# 3. Use --force-with-lease
git push --force-with-lease
```

---

## Sensitive Files Checklist

### Must Be in .gitignore
```gitignore
# Environment files
.env
.env.local
.env.*.local
*.env

# Secrets
*.pem
*.key
*.p12
*.pfx
secrets/
credentials/

# IDE
.idea/
.vscode/
*.swp

# Dependencies
node_modules/
vendor/
venv/
__pycache__/

# Build artifacts
dist/
build/
*.log

# OS files
.DS_Store
Thumbs.db
```

### Check Before Commit
```bash
# Search for common secrets patterns
git diff --staged | grep -iE "(api[_-]?key|password|secret|token|credential)"

# List large files
git diff --staged --stat | sort -k3 -n -r | head -10

# Check for binary files
git diff --staged --numstat | grep "^-"
```

---

## Quick Reference: Safe Git Workflow

```bash
# Start work
git checkout main
git pull
git checkout -b feature/my-feature

# During work
git add -p                    # Stage interactively
git commit -m "feat: ..."     # Small, atomic commits
git push -u origin feature/my-feature

# Before PR
git fetch origin
git rebase origin/main        # Keep up to date
git push --force-with-lease   # Safe force push

# Emergency undo
git reflog                    # Find commit
git reset --soft HEAD~1       # Undo keeping changes
git stash                     # Save for later
```
