# OWASP Top 10 2025

## Table of Contents
1. [A01: Broken Access Control](#a01-broken-access-control)
2. [A02: Security Misconfiguration](#a02-security-misconfiguration)
3. [A03: Software Supply Chain Failures](#a03-software-supply-chain-failures)
4. [A04: Cryptographic Failures](#a04-cryptographic-failures)
5. [A05: Injection](#a05-injection)
6. [A06: Insecure Design](#a06-insecure-design)
7. [A07: Authentication Failures](#a07-authentication-failures)
8. [A08: Data Integrity Failures](#a08-data-integrity-failures)
9. [A09: Security Logging and Alerting Failures](#a09-security-logging-and-alerting-failures)
10. [A10: Mishandling of Exceptional Conditions](#a10-mishandling-of-exceptional-conditions)

---

## A01: Broken Access Control

**Severity**: Critical | **Prevalence**: 94% of applications tested

### Description
Access control enforces policy such that users cannot act outside of their intended permissions. Failures typically lead to unauthorized information disclosure, modification, or destruction of data.

### Common Vulnerabilities
- Bypassing access control by modifying URL, application state, or HTML page
- Allowing primary key to be changed to another user's record (IDOR)
- Privilege escalation (acting as user without login, or as admin when logged in as user)
- Metadata manipulation (replaying/tampering JWT, cookies, hidden fields)
- CORS misconfiguration allowing unauthorized API access
- Force browsing to authenticated/privileged pages
- SSRF (Server-Side Request Forgery) - NEW in this category

### Code Patterns to Flag

```javascript
// BAD: Client-side access control
if (user.role === 'admin') {
  showAdminPanel();
}

// BAD: Direct object reference without authorization
app.get('/api/users/:id', (req, res) => {
  const user = db.getUser(req.params.id); // No auth check!
  res.json(user);
});

// BAD: Predictable resource IDs
const documentUrl = `/documents/${documentId}`; // Sequential IDs

// GOOD: Server-side authorization
app.get('/api/users/:id', authorize('read:users'), (req, res) => {
  if (req.params.id !== req.user.id && !req.user.isAdmin) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  const user = db.getUser(req.params.id);
  res.json(user);
});
```

### Prevention
- Deny by default (except for public resources)
- Implement access control mechanisms once and reuse throughout application
- Enforce record ownership - users can only CRUD their own records
- Disable web server directory listing and remove sensitive files
- Log access control failures and alert on repeated failures
- Rate limit API and controller access
- Invalidate JWT tokens on server after logout
- Use UUIDs instead of sequential IDs for resources

---

## A02: Security Misconfiguration

**Severity**: High | **Prevalence**: Found in every tested application

### Description
Security misconfiguration is the most commonly seen issue, often resulting from insecure default configurations, incomplete configurations, open cloud storage, misconfigured HTTP headers, or verbose error messages.

### Common Vulnerabilities
- Missing security hardening across application stack
- Improperly configured cloud service permissions
- Unnecessary features enabled (ports, services, pages, accounts)
- Default accounts with unchanged passwords
- Error handling revealing stack traces or sensitive info
- Latest security features disabled or not configured
- Security settings in servers/frameworks not set to secure values
- Missing or misconfigured security headers

### Code Patterns to Flag

```yaml
# BAD: Docker running as root
FROM node:18
USER root  # Should use non-root user

# BAD: Debug mode in production
DEBUG=true
NODE_ENV=development

# BAD: Exposed error details
app.use((err, req, res, next) => {
  res.status(500).json({
    error: err.message,
    stack: err.stack  // Exposes internals!
  });
});
```

```nginx
# BAD: Missing security headers
server {
  # No X-Frame-Options
  # No X-Content-Type-Options
  # No Content-Security-Policy
}

# GOOD: Proper security headers
server {
  add_header X-Frame-Options "SAMEORIGIN" always;
  add_header X-Content-Type-Options "nosniff" always;
  add_header X-XSS-Protection "1; mode=block" always;
  add_header Content-Security-Policy "default-src 'self'" always;
  add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
}
```

### Prevention
- Automated hardening process for consistent, locked-down environments
- Minimal platform - remove unused features, frameworks, dependencies
- Review and update configurations as part of patch management
- Segmented application architecture with secure separation
- Send security directives via headers (CSP, HSTS)
- Automated verification of configurations across all environments

---

## A03: Software Supply Chain Failures

**Severity**: Critical | **NEW in 2025**

### Description
Expanded from "Vulnerable and Outdated Components" to encompass broader compromises occurring across the entire software dependency ecosystem, build systems, and distribution infrastructure.

### Common Vulnerabilities
- Using components with known vulnerabilities
- Not knowing all component versions (direct and transitive)
- Compromised build pipelines or CI/CD systems
- Malicious packages in public repositories (typosquatting)
- Unsigned or unverified packages
- Missing integrity checks for downloaded dependencies
- Lack of SBOM (Software Bill of Materials)

### Code Patterns to Flag

```json
// BAD: No version pinning
{
  "dependencies": {
    "lodash": "*",
    "express": "^4.0.0"
  }
}

// BAD: No lockfile committed
// Missing package-lock.json, yarn.lock, or pnpm-lock.yaml

// GOOD: Exact versions with integrity
{
  "dependencies": {
    "lodash": "4.17.21",
    "express": "4.18.2"
  }
}
```

```dockerfile
# BAD: Using latest tag
FROM node:latest

# GOOD: Pinned version with digest
FROM node:20.10.0@sha256:abc123...
```

### Prevention
- Remove unused dependencies and unnecessary features
- Continuously inventory component versions (SBOM)
- Monitor CVE/NVD for vulnerabilities in components
- Obtain components only from official sources over secure links
- Prefer signed packages
- Monitor for unmaintained libraries/components
- Implement dependency scanning in CI/CD
- Use private registries with vetted packages

---

## A04: Cryptographic Failures

**Severity**: High

### Description
Failures related to cryptography that often lead to exposure of sensitive data. Includes weak cryptographic algorithms, poor key management, and transmission of data in plaintext.

### Common Vulnerabilities
- Transmitting data in clear text (HTTP, SMTP, FTP)
- Using old or weak cryptographic algorithms (MD5, SHA1, DES)
- Using default or weak cryptographic keys
- Not enforcing encryption (missing HSTS)
- Not properly validating certificates
- Using deprecated hash functions for passwords
- Using random values not cryptographically secure
- Initialization vectors ignored or reused

### Code Patterns to Flag

```python
# BAD: Weak hashing for passwords
import hashlib
password_hash = hashlib.md5(password.encode()).hexdigest()

# BAD: Hardcoded encryption key
SECRET_KEY = "my-secret-key-123"

# BAD: Using ECB mode (predictable patterns)
cipher = AES.new(key, AES.MODE_ECB)

# BAD: Weak random for security purposes
import random
token = random.randint(0, 999999)

# GOOD: Proper password hashing
from argon2 import PasswordHasher
ph = PasswordHasher()
hash = ph.hash(password)

# GOOD: Secure random
import secrets
token = secrets.token_urlsafe(32)
```

### Prevention
- Classify data by sensitivity and apply controls accordingly
- Don't store sensitive data unnecessarily
- Encrypt all sensitive data at rest
- Use strong standard algorithms and proper key management
- Encrypt data in transit with TLS 1.2+ and enforce with HSTS
- Disable caching for sensitive responses
- Use password-specific hashing: Argon2, bcrypt, scrypt, PBKDF2
- Use authenticated encryption (GCM mode)
- Generate IVs randomly for each encryption

---

## A05: Injection

**Severity**: High

### Description
Injection flaws occur when untrusted data is sent to an interpreter as part of a command or query. Includes SQL injection, NoSQL injection, OS command injection, LDAP injection, and XSS.

### Common Vulnerabilities
- User-supplied data not validated, filtered, or sanitized
- Dynamic queries without context-aware escaping
- Hostile data used in ORM search parameters
- Hostile data directly used or concatenated
- XSS (now categorized under injection)

### Code Patterns to Flag

```javascript
// BAD: SQL Injection
const query = `SELECT * FROM users WHERE id = ${userId}`;

// BAD: Command Injection
exec(`ping ${userInput}`);

// BAD: NoSQL Injection
db.users.find({ username: req.body.username });

// BAD: XSS
element.innerHTML = userInput;

// GOOD: Parameterized queries
const query = 'SELECT * FROM users WHERE id = ?';
db.query(query, [userId]);

// GOOD: Safe command execution
execFile('ping', ['-c', '4', sanitizedHost]);

// GOOD: Output encoding
element.textContent = userInput;
```

### Prevention
- Use safe APIs that avoid the interpreter entirely
- Use parameterized queries (prepared statements)
- Use positive server-side input validation
- Escape special characters for residual dynamic queries
- Use LIMIT and other SQL controls to prevent mass disclosure
- Implement Content-Security-Policy to mitigate XSS
- Use auto-escaping template engines

---

## A06: Insecure Design

**Severity**: Medium-High

### Description
Insecure design represents weaknesses in the design and architecture of an application. This is different from implementation flaws - you cannot fix insecure design with perfect implementation.

### Common Vulnerabilities
- Missing or ineffective threat modeling
- Lack of security requirements
- No security design patterns applied
- Missing rate limiting for expensive operations
- Credential recovery flaws by design
- Not limiting resource consumption

### Design Anti-Patterns

```
// BAD DESIGN: Password recovery via security questions
- "What is your mother's maiden name?" (publicly discoverable)
- No rate limiting on attempts
- Same questions for all users

// BAD DESIGN: Bots can abuse functionality
- No CAPTCHA on registration
- No rate limiting on API endpoints
- Allowing bulk operations without verification

// GOOD DESIGN: Secure credential recovery
- Email/SMS-based verification with time-limited tokens
- Rate limiting on attempts
- Account lockout after failures
- Audit logging of all attempts
```

### Prevention
- Establish secure development lifecycle with AppSec professionals
- Use threat modeling for critical flows
- Integrate security language in user stories
- Design for security controls at each tier
- Write unit and integration tests for security controls
- Segregate tenants robustly by design
- Limit resource consumption by user/service

---

## A07: Authentication Failures

**Severity**: High

### Description
Confirmation of the user's identity, authentication, and session management is critical. Weaknesses here allow attackers to compromise passwords, keys, or session tokens.

### Common Vulnerabilities
- Permits brute force or credential stuffing attacks
- Permits default, weak, or well-known passwords
- Uses weak credential recovery processes
- Uses plain text, encrypted, or weakly hashed passwords
- Has missing or ineffective MFA
- Exposes session identifier in URL
- Reuses session identifier after login
- Does not properly invalidate sessions

### Code Patterns to Flag

```javascript
// BAD: Weak password requirements
const isValidPassword = password.length >= 4;

// BAD: Session in URL
res.redirect(`/dashboard?sessionId=${sessionId}`);

// BAD: No session regeneration after login
req.session.user = authenticatedUser;

// BAD: Exposing whether user exists
if (!user) return res.json({ error: 'User not found' });
if (!validPassword) return res.json({ error: 'Wrong password' });

// GOOD: Generic error message
if (!user || !validPassword) {
  return res.json({ error: 'Invalid credentials' });
}

// GOOD: Session regeneration
req.session.regenerate((err) => {
  req.session.user = authenticatedUser;
});
```

### Prevention
- Implement MFA to prevent automated attacks
- Don't deploy with default credentials
- Implement weak password checks against top 10k passwords
- Align password policies with NIST 800-63b guidelines
- Harden against enumeration attacks (same responses)
- Limit failed login attempts with progressive delays
- Use secure session manager that generates random session IDs
- Invalidate sessions after logout, idle, and absolute timeouts

---

## A08: Data Integrity Failures

**Severity**: Medium-High

### Description
Code and infrastructure that does not protect against integrity violations. Includes insecure deserialization, using software or data from untrusted sources without verification.

### Common Vulnerabilities
- Using plugins, libraries, or modules from untrusted sources
- Insecure CI/CD pipeline allowing unauthorized code
- Auto-update functionality without signature verification
- Insecure deserialization of untrusted data
- Missing integrity verification for data/code

### Code Patterns to Flag

```python
# BAD: Insecure deserialization
import pickle
data = pickle.loads(user_input)

# BAD: Using eval on user input
eval(user_provided_code)

# BAD: No integrity check on downloads
urllib.request.urlretrieve(url, 'update.exe')
os.system('update.exe')
```

```javascript
// BAD: Unverified dynamic code loading
const module = require(userProvidedPath);

// GOOD: Whitelist approach
const allowedModules = ['moduleA', 'moduleB'];
if (allowedModules.includes(moduleName)) {
  const module = require(`./${moduleName}`);
}
```

### Prevention
- Use digital signatures to verify software/data integrity
- Ensure libraries are consumed from trusted repositories
- Use SCA tools to detect vulnerable components
- Ensure CI/CD pipeline has proper access control and segregation
- Ensure unsigned/unencrypted serialized data isn't sent to untrusted clients
- Implement integrity checks using checksums/digital signatures

---

## A09: Security Logging and Alerting Failures

**Severity**: Medium

### Description
Without logging and monitoring, breaches cannot be detected. Insufficient logging, detection, monitoring, and response allows attackers to persist and pivot.

### Common Vulnerabilities
- Auditable events not logged (logins, failures, high-value transactions)
- Warnings and errors generate no/unclear/inadequate log messages
- Logs only stored locally
- Alerting thresholds not set or ineffective
- No real-time or near-real-time alerting
- Logs visible to users (information leakage)

### What to Log

```
ALWAYS LOG:
- Authentication attempts (success/failure)
- Authorization failures
- Input validation failures
- Session management events
- Application errors and exceptions
- Administrative functions
- High-value transactions
- Data exports

NEVER LOG:
- Passwords (even hashed)
- API keys or tokens
- Credit card numbers (except last 4)
- Social Security Numbers
- Personal health information
- Full session identifiers
```

### Code Pattern

```python
# GOOD: Structured security logging
import logging

security_logger = logging.getLogger('security')

def login(username, password):
    user = authenticate(username, password)
    if user:
        security_logger.info(
            'login_success',
            extra={
                'user_id': user.id,
                'ip': request.remote_addr,
                'user_agent': request.user_agent
            }
        )
    else:
        security_logger.warning(
            'login_failure',
            extra={
                'username': username,  # OK to log username
                'ip': request.remote_addr,
                'user_agent': request.user_agent
            }
        )
```

### Prevention
- Log all authentication, access control, server-side input validation failures
- Ensure logs have enough context to identify suspicious activity
- Ensure logs are in format easily consumed by log management solutions
- Ensure log data is encoded correctly (injection prevention)
- Establish effective monitoring and alerting
- Establish incident response and recovery plan

---

## A10: Mishandling of Exceptional Conditions

**Severity**: Medium | **NEW in 2025**

### Description
New category focusing on improper error handling, logical errors, failing open, and scenarios stemming from abnormal conditions that systems may encounter.

### Common Vulnerabilities
- Fail-open behavior (granting access when errors occur)
- Inconsistent exception handling across application
- Exposing sensitive info in error messages
- Not handling all error conditions
- Resource exhaustion leading to DoS
- Race conditions in error handling

### Code Patterns to Flag

```python
# BAD: Fail-open
def check_authorization(user, resource):
    try:
        return auth_service.check(user, resource)
    except Exception:
        return True  # Fail-open: allows access on error!

# BAD: Swallowing exceptions
try:
    process_payment(order)
except Exception:
    pass  # Silent failure, order state unknown!

# GOOD: Fail-closed with proper handling
def check_authorization(user, resource):
    try:
        return auth_service.check(user, resource)
    except Exception as e:
        logger.error(f"Auth check failed: {e}")
        return False  # Fail-closed: deny on error

# GOOD: Proper error recovery
try:
    process_payment(order)
except PaymentError as e:
    order.status = 'payment_failed'
    logger.error(f"Payment failed for order {order.id}: {e}")
    notify_user(order.user, "Payment failed")
    raise
```

### Prevention
- Implement fail-closed behavior - deny on uncertainty
- Handle all possible error conditions explicitly
- Use exception hierarchies and catch specific exceptions
- Never expose internal error details to users
- Test error paths thoroughly
- Implement circuit breakers for external dependencies
- Use timeouts for all external calls
