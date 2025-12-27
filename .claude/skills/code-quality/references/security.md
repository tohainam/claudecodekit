# Security Best Practices

Secure coding guidelines based on OWASP 2025 and industry standards.

## OWASP Top 10 (2025)

| Rank | Vulnerability | Prevention |
|------|--------------|------------|
| A01 | Broken Access Control | Deny by default, enforce server-side |
| A02 | Cryptographic Failures | Use strong algorithms, secure key management |
| A03 | Injection | Parameterized queries, input validation |
| A04 | Insecure Design | Threat modeling, secure design patterns |
| A05 | Security Misconfiguration | Hardened defaults, minimal permissions |
| A06 | Vulnerable Components | Dependency scanning, regular updates |
| A07 | Authentication Failures | MFA, secure password policies |
| A08 | Data Integrity Failures | Verify updates, code signing |
| A09 | Logging Failures | Log security events, protect logs |
| A10 | SSRF | Validate URLs, block internal networks |

## Core Principles

### Defense in Depth
```
Never rely on a single security control.

Layer 1: Input validation (client-side) → User experience
Layer 2: Input validation (server-side) → Primary defense
Layer 3: Parameterized queries → SQL injection prevention
Layer 4: Least privilege DB user → Limit damage if breached
Layer 5: Output encoding → XSS prevention
Layer 6: CSP headers → Additional XSS mitigation
```

### Least Privilege
```
Grant minimum access required for the task.

BAD:
db_user: root / all privileges
api_key: full access to all resources
file_permissions: 777

GOOD:
db_user: app_readonly / SELECT on specific tables
api_key: scoped to specific resources and actions
file_permissions: 644 (owner write, others read)
```

### Fail Secure
```
Default to denial when errors occur.

BAD (Fail Open):
try {
  if (checkPermission(user)) { allowAccess(); }
} catch (e) {
  allowAccess();  // Error = access granted
}

GOOD (Fail Secure):
try {
  if (checkPermission(user)) { allowAccess(); }
  else { denyAccess(); }
} catch (e) {
  denyAccess();  // Error = access denied
  logSecurityEvent(e);
}
```

## Input Validation

### Validation Strategy
```
1. Validate on server-side (REQUIRED)
2. Validate on client-side (UX only)
3. Use allowlist over blocklist
4. Validate type, length, format, range
```

### Validation Examples
```javascript
// BAD: Blocklist approach
function validateInput(input) {
  const dangerous = ['<script>', 'DROP TABLE', '../../'];
  return !dangerous.some(d => input.includes(d));
}

// GOOD: Allowlist approach
function validateEmail(email) {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email) && email.length <= 254;
}

function validateUsername(username) {
  return /^[a-zA-Z0-9_]{3,20}$/.test(username);
}

function validateAge(age) {
  const num = parseInt(age, 10);
  return Number.isInteger(num) && num >= 0 && num <= 150;
}
```

## Injection Prevention

### SQL Injection
```javascript
// BAD: String concatenation
const query = `SELECT * FROM users WHERE id = ${userId}`;
db.query(query);

// GOOD: Parameterized queries
const query = 'SELECT * FROM users WHERE id = ?';
db.query(query, [userId]);

// GOOD: ORM with proper escaping
User.findById(userId);
```

### Command Injection
```python
# BAD: Shell execution with user input
import os
os.system(f"convert {user_filename} output.png")

# GOOD: Use libraries, avoid shell
from PIL import Image
img = Image.open(validated_path)
img.save("output.png")

# If shell is needed, use proper escaping
import shlex
import subprocess
subprocess.run(["convert", shlex.quote(validated_filename), "output.png"])
```

### XSS Prevention
```javascript
// BAD: Direct HTML insertion
element.innerHTML = userContent;

// GOOD: Text content or sanitization
element.textContent = userContent;

// GOOD: With sanitization library (if HTML needed)
element.innerHTML = DOMPurify.sanitize(userContent);

// GOOD: Framework auto-escaping (React, Vue, etc.)
return <div>{userContent}</div>;  // Auto-escaped
```

## Authentication & Session

### Password Security
```python
# Password requirements (2025 NIST guidelines)
MIN_LENGTH = 8  # Minimum 8, recommend 12+
MAX_LENGTH = 128  # Allow long passphrases
# No complexity requirements (length > complexity)
# Check against breached password lists
# Use bcrypt, Argon2, or scrypt for hashing

import bcrypt

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(password.encode(), salt)

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed)
```

### Session Management
```javascript
// Session configuration
const sessionConfig = {
  secret: process.env.SESSION_SECRET,  // Strong random secret
  name: 'sessionId',                   // Change default name
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,        // HTTPS only
    httpOnly: true,      // No JS access
    sameSite: 'strict',  // CSRF protection
    maxAge: 3600000,     // 1 hour expiry
  }
};

// Regenerate session ID after login
req.session.regenerate((err) => {
  req.session.userId = user.id;
});
```

### JWT Best Practices
```javascript
// BAD practices
jwt.sign(payload, 'weak-secret');           // Weak secret
jwt.sign(payload, secret, { expiresIn: '365d' });  // Too long
jwt.verify(token, secret, { algorithms: ['none', 'HS256'] });  // none allowed

// GOOD practices
const token = jwt.sign(
  { userId: user.id, role: user.role },
  process.env.JWT_SECRET,  // Strong, env-based secret
  {
    expiresIn: '15m',      // Short-lived access tokens
    algorithm: 'HS256'     // Explicit algorithm
  }
);

jwt.verify(token, process.env.JWT_SECRET, {
  algorithms: ['HS256'],   // Only allow specific algorithms
  issuer: 'your-app',
  audience: 'your-api'
});
```

## Secrets Management

### Never Hardcode Secrets
```javascript
// BAD: Hardcoded
const API_KEY = 'sk-1234567890abcdef';
const DB_PASSWORD = 'production_password';

// GOOD: Environment variables
const API_KEY = process.env.API_KEY;
const DB_PASSWORD = process.env.DB_PASSWORD;

// GOOD: Secret manager
const secret = await secretManager.getSecret('api-key');
```

### .gitignore Essentials
```gitignore
# Secrets & credentials
.env
.env.*
*.pem
*.key
credentials.json
secrets.yaml

# IDE & OS
.idea/
.vscode/
.DS_Store

# Dependencies
node_modules/
vendor/
__pycache__/

# Build artifacts
dist/
build/
*.log
```

## Secure Communication

### HTTPS Configuration
```nginx
# Strong TLS configuration
ssl_protocols TLSv1.2 TLSv1.3;
ssl_prefer_server_ciphers on;
ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;

# Security headers
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header X-Content-Type-Options nosniff;
add_header X-Frame-Options DENY;
add_header Content-Security-Policy "default-src 'self'";
```

## Dependency Security

### Regular Auditing
```bash
# Node.js
npm audit
npm audit fix

# Python
pip-audit
safety check

# Ruby
bundle audit

# Java/Maven
mvn dependency-check:check

# General
snyk test
```

### Dependency Pinning
```json
// package.json - Pin exact versions for production
{
  "dependencies": {
    "express": "4.18.2",      // Exact version
    "lodash": "4.17.21"       // Not "^4.17.21"
  }
}
```

## Security Checklist

```
INPUT HANDLING
□ All input validated server-side?
□ Using allowlist validation?
□ File uploads validated (type, size, content)?
□ SQL queries parameterized?
□ Output encoded for context?

AUTHENTICATION
□ Passwords properly hashed (bcrypt/Argon2)?
□ Session IDs regenerated after login?
□ MFA available for sensitive operations?
□ Account lockout after failed attempts?
□ Secure password reset flow?

ACCESS CONTROL
□ Authorization checked server-side?
□ Principle of least privilege applied?
□ Direct object references protected?
□ Admin functions properly restricted?

DATA PROTECTION
□ Sensitive data encrypted at rest?
□ TLS 1.2+ for data in transit?
□ Secrets in environment/secret manager?
□ PII properly handled and minimized?

LOGGING & MONITORING
□ Security events logged?
□ Sensitive data excluded from logs?
□ Logs protected from tampering?
□ Alerting for suspicious activity?

DEPENDENCIES
□ Dependencies regularly audited?
□ Known vulnerabilities addressed?
□ Dependency updates automated?
□ Unused dependencies removed?
```
