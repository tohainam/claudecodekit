# Security Review Checklists

Quick reference checklists for security reviews across different domains.

## Table of Contents
1. [Code Review Checklist](#code-review-checklist)
2. [API Security Checklist](#api-security-checklist)
3. [Frontend Security Checklist](#frontend-security-checklist)
4. [Database Security Checklist](#database-security-checklist)
5. [Authentication Checklist](#authentication-checklist)
6. [Cloud Security Checklist](#cloud-security-checklist)
7. [Dependency Security Checklist](#dependency-security-checklist)
8. [Pre-Deployment Checklist](#pre-deployment-checklist)

---

## Code Review Checklist

### Input Validation
- [ ] All user inputs validated on server-side
- [ ] Input length limits enforced
- [ ] Input type/format validated (whitelist approach)
- [ ] File uploads validated (type, size, content)
- [ ] Path traversal attempts blocked
- [ ] SQL injection prevented (parameterized queries)
- [ ] Command injection prevented (no shell with user input)
- [ ] XSS prevented (output encoding)

### Authentication
- [ ] Passwords hashed with Argon2id/bcrypt
- [ ] No plaintext passwords in logs/errors
- [ ] Session tokens are random and unpredictable
- [ ] Sessions invalidated on logout
- [ ] Password complexity requirements enforced
- [ ] Account lockout after failed attempts
- [ ] MFA implemented for sensitive operations

### Authorization
- [ ] Authorization checked on every request
- [ ] Principle of least privilege applied
- [ ] No direct object references without auth check
- [ ] Admin functions properly protected
- [ ] API endpoints have proper access control
- [ ] CORS configured restrictively

### Data Protection
- [ ] Sensitive data encrypted at rest
- [ ] TLS 1.2+ for data in transit
- [ ] No sensitive data in URLs
- [ ] No sensitive data in logs
- [ ] Proper data masking in UI
- [ ] PII handled according to regulations

### Error Handling
- [ ] No stack traces exposed to users
- [ ] Generic error messages for auth failures
- [ ] Fail-closed on exceptions
- [ ] All exceptions handled
- [ ] Errors logged server-side

### Secrets Management
- [ ] No hardcoded credentials
- [ ] No secrets in source control
- [ ] Environment variables or secret manager used
- [ ] API keys not exposed in frontend
- [ ] Secrets rotated regularly

---

## API Security Checklist

### Authentication & Authorization
- [ ] Strong authentication required
- [ ] JWT tokens validated properly (signature, expiry, issuer)
- [ ] Token refresh mechanism secure
- [ ] API keys not exposed in URLs
- [ ] OAuth 2.0/OIDC implemented correctly
- [ ] Rate limiting implemented
- [ ] Brute force protection

### Input/Output
- [ ] All inputs validated
- [ ] Content-Type validated
- [ ] Request size limits
- [ ] Response filtering (no excessive data exposure)
- [ ] Mass assignment prevented
- [ ] SSRF prevented

### Transport Security
- [ ] HTTPS only (no HTTP)
- [ ] HSTS enabled
- [ ] TLS 1.2+ only
- [ ] Certificate pinning (mobile)

### Headers
- [ ] CORS configured properly
- [ ] X-Content-Type-Options: nosniff
- [ ] Cache-Control: no-store (sensitive data)
- [ ] Content-Security-Policy set

### Documentation & Inventory
- [ ] API documented (OpenAPI)
- [ ] Deprecated endpoints tracked
- [ ] Version management in place
- [ ] No debug endpoints in production

---

## Frontend Security Checklist

### XSS Prevention
- [ ] User input properly escaped
- [ ] DOM manipulation uses safe methods
- [ ] No innerHTML with user data
- [ ] HTML sanitizer used where needed
- [ ] Framework auto-escaping enabled

### CSRF Protection
- [ ] CSRF tokens for state-changing requests
- [ ] SameSite cookie attribute set
- [ ] Origin/Referer validation

### CSP
- [ ] Content-Security-Policy header set
- [ ] No unsafe-inline (or nonces used)
- [ ] No unsafe-eval
- [ ] report-uri configured

### Security Headers
- [ ] X-Frame-Options set
- [ ] X-Content-Type-Options: nosniff
- [ ] Referrer-Policy configured
- [ ] Permissions-Policy set

### Data Handling
- [ ] Sensitive data not in localStorage
- [ ] Auth tokens in httpOnly cookies
- [ ] No sensitive data in console.log
- [ ] Form autocomplete disabled for sensitive fields

### Third-Party
- [ ] SRI for CDN resources
- [ ] Dependencies up to date
- [ ] Third-party scripts sandboxed
- [ ] No untrusted CDNs

---

## Database Security Checklist

### Access Control
- [ ] Least privilege database users
- [ ] No shared database accounts
- [ ] Connection via private network
- [ ] No direct public access

### Query Security
- [ ] Parameterized queries only
- [ ] No dynamic SQL with user input
- [ ] ORM used correctly
- [ ] Query logging enabled

### Data Protection
- [ ] Encryption at rest enabled
- [ ] TLS for connections
- [ ] Sensitive columns encrypted
- [ ] PII pseudonymized where possible

### Backup & Recovery
- [ ] Backups encrypted
- [ ] Backup access restricted
- [ ] Recovery tested regularly
- [ ] Point-in-time recovery possible

---

## Authentication Checklist

### Password Security
- [ ] Minimum 12 characters
- [ ] Complexity requirements (or passphrases)
- [ ] Common password check
- [ ] Breached password check (HaveIBeenPwned)
- [ ] Argon2id/bcrypt for hashing
- [ ] Salt per-password (automatic with Argon2/bcrypt)

### Session Management
- [ ] Session ID regenerated on login
- [ ] Session timeout implemented
- [ ] Secure cookie flags set
- [ ] Session invalidated on logout
- [ ] Concurrent session handling

### MFA
- [ ] MFA available for all users
- [ ] MFA required for sensitive operations
- [ ] Backup codes provided
- [ ] MFA bypass resistant to phishing

### Account Security
- [ ] Account lockout after failures
- [ ] Login attempt logging
- [ ] Password reset secure
- [ ] Email verification for changes
- [ ] Account recovery secure

---

## Cloud Security Checklist

### IAM
- [ ] Least privilege policies
- [ ] No root/admin credentials in code
- [ ] MFA for console access
- [ ] Service accounts with minimal permissions
- [ ] Regular access reviews
- [ ] No long-lived access keys

### Network
- [ ] VPC configured correctly
- [ ] Security groups restrictive
- [ ] No public access to databases
- [ ] Private endpoints for services
- [ ] WAF configured

### Data
- [ ] Encryption at rest enabled
- [ ] Encryption in transit enforced
- [ ] No public S3 buckets
- [ ] Data classification applied
- [ ] DLP controls in place

### Logging & Monitoring
- [ ] CloudTrail/audit logs enabled
- [ ] Log retention configured
- [ ] Alerts for security events
- [ ] SIEM integration
- [ ] Regular log reviews

### Infrastructure as Code
- [ ] IaC scanned for security
- [ ] No secrets in IaC
- [ ] State files secured
- [ ] Change management process

---

## Dependency Security Checklist

### Inventory
- [ ] All dependencies documented
- [ ] Direct and transitive deps tracked
- [ ] SBOM generated
- [ ] License compliance verified

### Updates
- [ ] Dependencies regularly updated
- [ ] Security patches applied promptly
- [ ] Dependabot/Renovate configured
- [ ] Update process documented

### Verification
- [ ] Lockfiles committed
- [ ] Integrity hashes verified
- [ ] Packages from official sources
- [ ] No typosquatting risks

### Scanning
- [ ] SCA in CI/CD pipeline
- [ ] Vulnerability alerts enabled
- [ ] High/critical vulns blocked
- [ ] Regular manual review

---

## Pre-Deployment Checklist

### Code
- [ ] Code review completed
- [ ] SAST scan passed
- [ ] No TODO/FIXME for security items
- [ ] Debug code removed
- [ ] Logging reviewed

### Secrets
- [ ] No hardcoded secrets
- [ ] Production secrets rotated
- [ ] Secret scanning passed
- [ ] Environment variables set

### Configuration
- [ ] Debug mode disabled
- [ ] Error pages configured
- [ ] Security headers set
- [ ] TLS configured correctly

### Testing
- [ ] DAST scan completed
- [ ] Penetration test passed (if applicable)
- [ ] Security regression tests pass
- [ ] Authentication/authorization tested

### Infrastructure
- [ ] Firewall rules reviewed
- [ ] Database access restricted
- [ ] Backups configured
- [ ] Monitoring enabled
- [ ] Incident response ready

### Documentation
- [ ] Security documentation updated
- [ ] Runbooks available
- [ ] Contact info for security team
- [ ] Rollback plan documented

---

## Severity Classification

| Severity | Description | SLA |
|----------|-------------|-----|
| **Critical** | Active exploitation, data breach imminent | Fix immediately |
| **High** | Exploitable vulnerability, significant impact | Fix within 24-48h |
| **Medium** | Vulnerability with mitigating factors | Fix within 1-2 weeks |
| **Low** | Minor issue, defense in depth | Fix in next release |
| **Info** | Best practice recommendation | Plan for future |

---

## Review Report Template

```markdown
# Security Review Report

**Project**: [Name]
**Date**: [YYYY-MM-DD]
**Reviewer**: [Name]
**Scope**: [Describe what was reviewed]

## Summary

[Brief overview of findings]

| Severity | Count |
|----------|-------|
| Critical | X |
| High     | X |
| Medium   | X |
| Low      | X |

## Critical/High Findings

### [FINDING-001] Title
- **Severity**: Critical/High
- **Location**: `file.js:123`
- **Description**: [What is the issue]
- **Impact**: [What could happen]
- **Recommendation**: [How to fix]
- **Reference**: [CWE/OWASP reference]

## Medium/Low Findings

[List with same format]

## Positive Observations

[What was done well]

## Recommendations

[General improvements suggested]
```
