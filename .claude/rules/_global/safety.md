# Safety Rules

These rules define safety guidelines to prevent accidental damage and ensure responsible code changes.

## Protected Files

### Never Edit Without Explicit Permission
- `.env` and `.env.*` files (contains secrets)
- `package-lock.json`, `yarn.lock`, `pnpm-lock.yaml` (auto-generated)
- `*.pem`, `*.key`, `*.crt` (cryptographic keys)
- `secrets/`, `credentials/` directories
- `.git/` directory contents
- Production configuration files

### Require Confirmation Before Editing
- Database migration files (may affect production data)
- CI/CD configuration (`.github/workflows/`, `.gitlab-ci.yml`)
- Docker/Kubernetes configs (deployment impact)
- Build configuration (webpack, vite, etc.)
- Main/production branch files directly

## Operations Requiring Confirmation

### Destructive Git Operations
- Force push: `git push --force`
- Hard reset: `git reset --hard`
- Branch deletion: `git branch -D`
- Interactive rebase: `git rebase -i`
- Amending pushed commits

### File Operations
- Deleting files (especially multiple files)
- Moving/renaming files (may break imports)
- Large-scale refactoring (multiple files)
- Changing file permissions

### System Operations
- Installing new dependencies
- Removing dependencies
- Running scripts that modify system state
- Executing commands with `sudo`

## Dangerous Patterns to Avoid

### Shell Commands
- `rm -rf` without careful path verification
- Commands with `*` wildcards on delete operations
- Piping to shell: `curl ... | bash`
- Commands that modify system paths

### Code Patterns
- Disabling security features: `--no-verify`, `--insecure`
- Exposing ports to public: `0.0.0.0:*`
- Disabling HTTPS/TLS verification
- Hardcoding credentials in source code
- SQL queries with string concatenation

## Backup Procedures

### Before Major Changes
1. Ensure work is committed or stashed
2. Create a backup branch: `git branch backup-$(date +%Y%m%d)`
3. Document the current state
4. Verify tests pass before changes

### Recovery Options
- `git reflog` to find lost commits
- `git stash list` for stashed changes
- `git checkout <hash>` to recover specific state

## Sensitive Data Handling

### What's Considered Sensitive
- API keys and tokens
- Passwords and secrets
- Personal Identifiable Information (PII)
- Internal URLs and endpoints
- Database connection strings

### Handling Rules
- Never log sensitive data
- Never include in code comments
- Never commit to version control
- Use environment variables
- Use secret management systems

## Code Review Safety

### Before Suggesting Changes
- Verify understanding of existing code purpose
- Check for existing tests that might break
- Consider backward compatibility
- Look for dependent code that might be affected

### Risk Assessment
- High: Security code, authentication, payments
- Medium: Core business logic, data access
- Low: UI components, utilities, documentation

## Error Prevention

### Validation Steps
- Run linter before committing
- Run tests after changes
- Check build succeeds
- Review git diff before commit

### Rollback Strategy
- Always have a way to undo changes
- Prefer small, atomic commits
- Test in isolation when possible
- Keep deployment reversible
