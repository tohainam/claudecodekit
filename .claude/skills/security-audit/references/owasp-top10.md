# OWASP Top 10 & CWE Top 25

## OWASP Top 10 (2021)

### A01: Broken Access Control

**Description**: Users can act outside their intended permissions.

**Common Weaknesses**:

- Bypassing access control via URL manipulation
- Missing access control for API
- Elevation of privilege
- CORS misconfiguration

**Mitigations**:

```typescript
// Deny by default
function getResource(userId: string, resourceId: string): Resource {
  const resource = await db.findResource(resourceId);

  // Explicit authorization check
  if (resource.ownerId !== userId && !user.isAdmin) {
    throw new ForbiddenError("Access denied");
  }

  return resource;
}

// Centralized access control
class AccessControl {
  canRead(user: User, resource: Resource): boolean {
    return (
      resource.isPublic ||
      resource.ownerId === user.id ||
      user.hasPermission("read:all")
    );
  }
}
```

### A02: Cryptographic Failures

**Description**: Failures related to cryptography leading to sensitive data exposure.

**Common Weaknesses**:

- Weak or deprecated algorithms (MD5, SHA1, DES)
- Hardcoded or weak keys
- Missing encryption for sensitive data
- Improper certificate validation

**Mitigations**:

```typescript
// Use standard algorithms
import { scrypt, randomBytes } from "crypto";

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const hash = await scryptAsync(password, salt, 64);
  return `${salt.toString("hex")}:${hash.toString("hex")}`;
}

// Use established libraries
import { SignJWT } from "jose";

const jwt = await new SignJWT({ userId: "123" })
  .setProtectedHeader({ alg: "ES256" })
  .setExpirationTime("2h")
  .sign(privateKey);
```

### A03: Injection

**Description**: User-supplied data is sent to an interpreter as part of a command.

**Types**: SQL, NoSQL, OS Command, LDAP, XPath, Expression Language

**Mitigations**:

```typescript
// SQL: Use parameterized queries
const user = await db.query("SELECT * FROM users WHERE email = $1", [email]);

// NoSQL: Sanitize operators
const sanitized = email.replace(/[$]/g, "");
const user = await db.findOne({ email: sanitized });

// OS Command: Avoid shell, use arrays
import { execFile } from "child_process";
execFile("convert", [inputPath, outputPath]); // Not exec()

// Template: Use safe templating
const html = template.render({ name: escapeHtml(userInput) });
```

### A04: Insecure Design

**Description**: Design flaws that cannot be fixed by implementation.

**Mitigations**:

- Threat modeling during design
- Secure design patterns
- Reference architectures
- Security requirements

**Threat Modeling Steps**:

1. Identify assets and entry points
2. Diagram data flows
3. Identify threats (STRIDE)
4. Rate risks (DREAD)
5. Plan mitigations

### A05: Security Misconfiguration

**Description**: Insecure default configurations or missing security hardening.

**Common Issues**:

- Default credentials
- Unnecessary features enabled
- Missing security headers
- Verbose error messages

**Mitigations**:

```typescript
// Security headers
app.use(
  helmet({
    contentSecurityPolicy: true,
    hsts: { maxAge: 31536000 },
    noSniff: true,
    frameguard: { action: "deny" },
  })
);

// Disable verbose errors in production
if (process.env.NODE_ENV === "production") {
  app.use((err, req, res, next) => {
    logger.error(err);
    res.status(500).json({ error: "Internal server error" });
  });
}
```

### A06: Vulnerable and Outdated Components

**Description**: Using components with known vulnerabilities.

**Mitigations**:

```bash
# Regular audits
npm audit
pip-audit
cargo audit

# Automated updates
dependabot
renovate

# Lock dependencies
package-lock.json
poetry.lock
Cargo.lock
```

### A07: Identification and Authentication Failures

**Description**: Weaknesses in authentication mechanisms.

**Common Issues**:

- Weak passwords allowed
- Credential stuffing
- Missing MFA
- Session fixation

**Mitigations**:

```typescript
// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many login attempts",
});
app.use("/login", limiter);

// Secure session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: true,
      httpOnly: true,
      sameSite: "strict",
      maxAge: 3600000,
    },
  })
);
```

### A08: Software and Data Integrity Failures

**Description**: Code/infrastructure without integrity verification.

**Mitigations**:

- Verify signatures on updates
- Use trusted repositories
- Implement CI/CD security
- Subresource integrity for CDN

```html
<!-- Subresource Integrity -->
<script
  src="https://cdn.example.com/lib.js"
  integrity="sha384-abc123..."
  crossorigin="anonymous"
></script>
```

### A09: Security Logging and Monitoring Failures

**Description**: Insufficient logging prevents detection of breaches.

**What to Log**:

- Authentication events (success/failure)
- Authorization failures
- Input validation failures
- Server errors
- High-value transactions

```typescript
// Security event logging
logger.security("authentication", {
  event: "login_failed",
  userId: attemptedUserId,
  ip: request.ip,
  userAgent: request.headers["user-agent"],
  reason: "invalid_password",
  timestamp: new Date().toISOString(),
});
```

### A10: Server-Side Request Forgery (SSRF)

**Description**: Application fetches remote resources without validating URLs.

**Mitigations**:

```typescript
// Validate URLs
const allowedDomains = ["api.trusted.com", "cdn.trusted.com"];

function validateUrl(url: string): boolean {
  try {
    const parsed = new URL(url);

    // Block internal IPs
    if (isInternalIP(parsed.hostname)) {
      return false;
    }

    // Whitelist domains
    if (!allowedDomains.includes(parsed.hostname)) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}
```

## CWE Top 25 (2024)

| Rank | CWE     | Name                       | Category       |
| ---- | ------- | -------------------------- | -------------- |
| 1    | CWE-79  | Cross-Site Scripting (XSS) | Injection      |
| 2    | CWE-787 | Out-of-bounds Write        | Memory         |
| 3    | CWE-89  | SQL Injection              | Injection      |
| 4    | CWE-862 | Missing Authorization      | Access Control |
| 5    | CWE-78  | OS Command Injection       | Injection      |
| 6    | CWE-20  | Improper Input Validation  | Validation     |
| 7    | CWE-125 | Out-of-bounds Read         | Memory         |
| 8    | CWE-22  | Path Traversal             | File System    |
| 9    | CWE-352 | CSRF                       | Web            |
| 10   | CWE-434 | Unrestricted File Upload   | File System    |

## OWASP LLM Top 10 (2025)

| #   | Risk                             | Description                           |
| --- | -------------------------------- | ------------------------------------- |
| 1   | Prompt Injection                 | Manipulating AI via crafted inputs    |
| 2   | Insecure Output Handling         | Trusting AI output without validation |
| 3   | Training Data Poisoning          | Corrupted training data               |
| 4   | Model Denial of Service          | Exhausting AI resources               |
| 5   | Supply Chain Vulnerabilities     | Compromised models/plugins            |
| 6   | Sensitive Information Disclosure | Leaking training data                 |
| 7   | Insecure Plugin Design           | Vulnerable AI integrations            |
| 8   | Excessive Agency                 | AI with too many permissions          |
| 9   | Overreliance                     | Trusting AI without verification      |
| 10  | Model Theft                      | Unauthorized model extraction         |
