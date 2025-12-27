---
name: security-review
description: |
  Comprehensive security review and vulnerability analysis for code, architecture, and infrastructure.
  Use this skill PROACTIVELY when: (1) Reviewing code for security vulnerabilities (XSS, SQLi, CSRF, etc.),
  (2) Auditing authentication/authorization implementations, (3) Checking API security,
  (4) Reviewing cloud/infrastructure configurations, (5) Analyzing mobile app security,
  (6) Checking cryptography implementations, (7) Evaluating supply chain/dependency security,
  (8) Performing pre-deployment security checks, (9) Writing security-sensitive code,
  (10) User asks about OWASP, security best practices, or vulnerability prevention.
  Covers OWASP Top 10 2025, API Security, Frontend/Backend security, Cloud security (AWS/GCP/Azure),
  Mobile security (iOS/Android), Supply chain security, and Cryptography best practices.
---

# Security Review

## Overview

Perform comprehensive security reviews following OWASP 2025 guidelines and industry best practices. This skill provides vulnerability detection patterns, secure coding examples, and remediation guidance for all technology stacks.

## Security Review Process

```
1. IDENTIFY SCOPE
   └── What type of code/system? (frontend, backend, API, mobile, cloud, infra)

2. SELECT REFERENCE
   └── Load relevant reference file based on scope

3. ANALYZE CODE
   └── Check against vulnerability patterns and anti-patterns

4. CLASSIFY FINDINGS
   └── Critical → High → Medium → Low → Info

5. PROVIDE REMEDIATION
   └── Show secure code pattern and explanation
```

## Quick Reference Selection

| Review Type | Reference File | Key Focus |
|-------------|----------------|-----------|
| Web vulnerabilities | [owasp-top10.md](references/owasp-top10.md) | A01-A10 vulnerabilities |
| REST/GraphQL APIs | [api-security.md](references/api-security.md) | OWASP API Top 10 |
| React/Vue/Angular | [frontend.md](references/frontend.md) | XSS, CSRF, CSP |
| Node/Python/Java | [backend.md](references/backend.md) | Injection, Auth, Sessions |
| AWS/GCP/Azure | [cloud.md](references/cloud.md) | IAM, Network, Data |
| iOS/Android | [mobile.md](references/mobile.md) | Storage, Network, Binary |
| Dependencies | [supply-chain.md](references/supply-chain.md) | SBOM, CVE, Updates |
| Encryption/Hashing | [cryptography.md](references/cryptography.md) | Algorithms, Keys, TLS |
| Quick checklists | [checklists.md](references/checklists.md) | Pre-deployment, Reviews |

## Severity Classification

| Severity | Criteria | Action |
|----------|----------|--------|
| **Critical** | Actively exploitable, data breach imminent, RCE | Fix immediately |
| **High** | Exploitable with moderate effort, significant impact | Fix within 24-48h |
| **Medium** | Vulnerability with mitigating factors present | Fix within 1-2 weeks |
| **Low** | Minor issue, defense in depth | Fix in next release |
| **Info** | Best practice recommendation | Consider for future |

## Common Vulnerability Patterns

### Injection (SQL, Command, NoSQL)

```javascript
// VULNERABLE: String concatenation
const query = `SELECT * FROM users WHERE id = ${userId}`;
db.query(`ping ${hostname}`);

// SECURE: Parameterized queries
const query = 'SELECT * FROM users WHERE id = ?';
db.query(query, [userId]);
```

### Cross-Site Scripting (XSS)

```javascript
// VULNERABLE: Direct DOM manipulation
element.innerHTML = userInput;

// SECURE: Text content or sanitization
element.textContent = userInput;
// OR with DOMPurify
element.innerHTML = DOMPurify.sanitize(userInput);
```

### Broken Authentication

```javascript
// VULNERABLE: Weak password storage
const hash = crypto.createHash('md5').update(password).digest('hex');

// SECURE: Use Argon2id or bcrypt
const hash = await argon2.hash(password, { type: argon2.argon2id });
```

### Broken Access Control

```javascript
// VULNERABLE: No authorization check
app.get('/api/users/:id', (req, res) => {
  res.json(db.getUser(req.params.id)); // Any user can access!
});

// SECURE: Authorization check
app.get('/api/users/:id', auth, (req, res) => {
  if (req.params.id !== req.user.id && !req.user.isAdmin) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  res.json(db.getUser(req.params.id));
});
```

### Cryptographic Failures

```python
# VULNERABLE: Weak algorithms, hardcoded keys
key = "my-secret-key"
cipher = AES.new(key, AES.MODE_ECB)

# SECURE: Strong algorithms, proper key management
key = os.environ.get('ENCRYPTION_KEY')
cipher = AESGCM(key)
nonce = os.urandom(12)
ciphertext = cipher.encrypt(nonce, plaintext, None)
```

## Review Output Format

Structure security review findings as:

```markdown
## Security Review: [Component/File]

### Summary
- **Risk Level**: [Critical/High/Medium/Low]
- **Findings**: X Critical, Y High, Z Medium
- **Scope**: [What was reviewed]

### Critical Findings

#### [SEC-001] SQL Injection in User Query
- **Location**: `src/db/users.js:45`
- **Severity**: Critical
- **CWE**: CWE-89
- **Description**: User input directly concatenated into SQL query
- **Impact**: Full database access, data exfiltration
- **Current Code**:
  ```javascript
  const query = `SELECT * FROM users WHERE id = ${req.params.id}`;
  ```
- **Remediation**:
  ```javascript
  const query = 'SELECT * FROM users WHERE id = ?';
  db.query(query, [req.params.id]);
  ```

### High Findings
[...]

### Recommendations
1. Implement parameterized queries throughout
2. Add input validation middleware
3. Enable SQL query logging for monitoring
```

## Security Headers Checklist

For web applications, verify these headers:

```
Content-Security-Policy: default-src 'self'
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Strict-Transport-Security: max-age=31536000; includeSubDomains
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

## OWASP Top 10 2025 Quick Reference

| Rank | Category | Key Prevention |
|------|----------|----------------|
| A01 | Broken Access Control | Server-side authorization, deny by default |
| A02 | Security Misconfiguration | Automated hardening, minimal features |
| A03 | Supply Chain Failures | SBOM, dependency scanning, signed packages |
| A04 | Cryptographic Failures | Strong algorithms, proper key management |
| A05 | Injection | Parameterized queries, input validation |
| A06 | Insecure Design | Threat modeling, security requirements |
| A07 | Authentication Failures | MFA, strong password policies |
| A08 | Data Integrity Failures | Signed updates, verified dependencies |
| A09 | Logging Failures | Comprehensive logging, alerting |
| A10 | Exceptional Conditions | Fail-closed, proper error handling |

## Technology-Specific Guidance

### When reviewing Frontend code
Load [frontend.md](references/frontend.md) for:
- XSS prevention patterns (React, Vue, Angular)
- CSRF protection
- CSP configuration
- Secure data handling
- Third-party dependency security

### When reviewing Backend code
Load [backend.md](references/backend.md) for:
- Input validation patterns
- SQL/NoSQL injection prevention
- Command injection prevention
- Authentication/session management
- File operation security

### When reviewing APIs
Load [api-security.md](references/api-security.md) for:
- OWASP API Top 10
- Authentication mechanisms
- Rate limiting
- Input/output validation
- SSRF prevention

### When reviewing Cloud/Infrastructure
Load [cloud.md](references/cloud.md) for:
- IAM best practices
- Network security
- Data encryption
- Container security
- IaC security

### When reviewing Mobile apps
Load [mobile.md](references/mobile.md) for:
- Secure storage (Keychain/Keystore)
- Certificate pinning
- Binary protections
- Platform-specific security

### When reviewing Dependencies
Load [supply-chain.md](references/supply-chain.md) for:
- SBOM generation
- Vulnerability scanning
- Dependency management
- CI/CD security

### When reviewing Cryptography
Load [cryptography.md](references/cryptography.md) for:
- Algorithm selection
- Password hashing
- Key management
- TLS configuration

## Resources

### references/
Domain-specific security guidance organized by technology:

| File | Content |
|------|---------|
| `owasp-top10.md` | OWASP Top 10 2025 with code patterns |
| `api-security.md` | OWASP API Top 10 with examples |
| `frontend.md` | XSS, CSRF, CSP, security headers |
| `backend.md` | Injection, auth, file operations |
| `cloud.md` | AWS/GCP/Azure security |
| `mobile.md` | iOS/Android security |
| `supply-chain.md` | SBOM, dependency security |
| `cryptography.md` | Algorithms, key management |
| `checklists.md` | Quick review checklists |
