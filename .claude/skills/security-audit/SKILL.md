---
name: security-audit
description: "Security review checklist and vulnerability assessment. Use when: Reviewing code for security issues, Designing authentication/authorization, Handling user input or external data, Auditing dependencies."
---

# Security Audit

## When to Use

- Reviewing code for security vulnerabilities
- Designing authentication systems
- Handling user input or external data
- Auditing third-party dependencies
- Preparing for security assessment
- Implementing data protection

## Quick Start

### Security Review Checklist

```
□ Input Validation     - All external data validated
□ Output Encoding      - Context-appropriate escaping
□ Authentication       - Strong, properly implemented
□ Authorization        - Least privilege enforced
□ Data Protection      - Encryption at rest/transit
□ Error Handling       - No sensitive data leaked
□ Logging              - Security events captured
□ Dependencies         - No known vulnerabilities
```

### OWASP Top 10 (2021) Quick Reference

| #   | Vulnerability             | Quick Fix                             |
| --- | ------------------------- | ------------------------------------- |
| 1   | Broken Access Control     | Deny by default, enforce server-side  |
| 2   | Cryptographic Failures    | Use standard algorithms, protect keys |
| 3   | Injection                 | Parameterized queries, validate input |
| 4   | Insecure Design           | Threat model, secure patterns         |
| 5   | Security Misconfiguration | Harden defaults, minimal install      |
| 6   | Vulnerable Components     | Audit deps, update regularly          |
| 7   | Auth Failures             | MFA, rate limiting, secure sessions   |
| 8   | Data Integrity Failures   | Verify signatures, trusted sources    |
| 9   | Logging Failures          | Log security events, monitor          |
| 10  | SSRF                      | Validate URLs, blocklist internal     |

## Guidelines

### DO

- Validate all input at system boundaries
- Use parameterized queries for database operations
- Encode output based on context (HTML, URL, JS)
- Implement defense in depth
- Log security-relevant events
- Keep dependencies updated
- Use established crypto libraries

### DON'T

- Trust client-side validation alone
- Store secrets in code or version control
- Log sensitive data (passwords, tokens, PII)
- Implement custom cryptography
- Expose stack traces in production
- Use deprecated algorithms (MD5, SHA1 for security)
- Hardcode credentials

## LLM/AI Security (2025)

| Risk              | Mitigation                                  |
| ----------------- | ------------------------------------------- |
| Prompt Injection  | Separate user input from instructions       |
| Data Leakage      | Don't include secrets in prompts            |
| Excessive Agency  | Limit AI capabilities, require confirmation |
| Model Poisoning   | Validate training data sources              |
| Output Validation | Sanitize AI-generated content               |

## Quick Security Patterns

### Input Validation

```typescript
// Validate at boundary, trust internally
function createUser(input: unknown): User {
  const validated = userSchema.parse(input); // Throws if invalid
  return new User(validated); // Internal code trusts this
}
```

### Output Encoding

```typescript
// HTML context
const safe = escapeHtml(userInput);

// JavaScript context
const jsString = JSON.stringify(userInput);

// URL context
const urlParam = encodeURIComponent(userInput);
```

### Parameterized Queries

```typescript
// Safe: parameterized
await db.query("SELECT * FROM users WHERE id = $1", [userId]);

// Unsafe: string concatenation
await db.query(`SELECT * FROM users WHERE id = ${userId}`); // SQL INJECTION!
```

## References

- [OWASP Top 10](references/owasp-top10.md) - Vulnerability details and mitigations
- [Authentication Patterns](references/auth-patterns.md) - OAuth, JWT, sessions
- [Input Validation](references/input-validation.md) - Validation strategies
- [Secrets Management](references/secrets-management.md) - Secure credential handling
- [Dependency Security](references/dependency-security.md) - SBOM, SCA tools
