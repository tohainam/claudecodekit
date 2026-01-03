# Safety Rules

## Protected Files

Never modify without explicit confirmation using the `AskUserQuestion` tool:

- `.env`, `.env.*` - Environment configuration
- `package-lock.json`, `yarn.lock` - Lock files
- `*.pem`, `*.key` - Certificates and keys
- `.git/` - Git internals
- `node_modules/` - Dependencies

## Dangerous Commands

Always warn using `AskUserQuestion` before executing:

- `rm -rf` - Recursive deletion
- `git push --force` - Force push
- `git reset --hard` - Hard reset
- `DROP TABLE`, `DELETE FROM` without WHERE

## Credentials

- Never echo secrets to console
- Never commit credentials to git
- Use environment variables for sensitive values
- Redact secrets in logs and output
