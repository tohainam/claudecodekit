# Frontend Security

## Table of Contents
1. [Cross-Site Scripting (XSS)](#cross-site-scripting-xss)
2. [Cross-Site Request Forgery (CSRF)](#cross-site-request-forgery-csrf)
3. [Content Security Policy (CSP)](#content-security-policy-csp)
4. [Security Headers](#security-headers)
5. [Secure Data Handling](#secure-data-handling)
6. [Third-Party Dependencies](#third-party-dependencies)
7. [Framework-Specific Security](#framework-specific-security)
8. [Authentication & Sessions](#authentication--sessions)

---

## Cross-Site Scripting (XSS)

### Types of XSS

| Type | Description | Example |
|------|-------------|---------|
| Reflected | Script in request reflected back | `?search=<script>alert(1)</script>` |
| Stored | Script persisted in database | Comment containing `<script>` |
| DOM-based | Client-side script manipulation | `document.write(location.hash)` |

### Vulnerable Patterns

```javascript
// BAD: innerHTML with user input
element.innerHTML = userInput;

// BAD: document.write
document.write(userInput);

// BAD: eval() with user data
eval(userProvidedCode);

// BAD: jQuery html()
$(element).html(userInput);

// BAD: React dangerouslySetInnerHTML without sanitization
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// BAD: Angular bypassSecurityTrustHtml
this.sanitizer.bypassSecurityTrustHtml(userInput);

// BAD: Vue v-html
<div v-html="userInput"></div>

// BAD: Template literals in DOM
document.getElementById('output').innerHTML = `Welcome, ${username}`;

// BAD: URL with user input
window.location.href = userInput; // javascript: URLs
```

### Secure Patterns

```javascript
// GOOD: textContent (safe)
element.textContent = userInput;

// GOOD: setAttribute for safe attributes
element.setAttribute('data-value', userInput);

// GOOD: Sanitize HTML before rendering
import DOMPurify from 'dompurify';
element.innerHTML = DOMPurify.sanitize(userInput);

// GOOD: React - automatic escaping
<div>{userInput}</div>

// GOOD: If HTML is needed, sanitize first
<div dangerouslySetInnerHTML={{
  __html: DOMPurify.sanitize(userInput, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a'],
    ALLOWED_ATTR: ['href']
  })
}} />

// GOOD: Vue - use v-text for text
<span v-text="userInput"></span>

// GOOD: URL validation
const isValidUrl = (url) => {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
};

if (isValidUrl(userInput)) {
  window.location.href = userInput;
}
```

### DOMPurify Configuration

```javascript
// Strict sanitization
const clean = DOMPurify.sanitize(dirty, {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
  ALLOWED_ATTR: ['href', 'title'],
  ALLOW_DATA_ATTR: false,
  FORBID_TAGS: ['script', 'style', 'iframe', 'form', 'input'],
  FORBID_ATTR: ['onerror', 'onload', 'onclick']
});

// Remove all HTML (text only)
const textOnly = DOMPurify.sanitize(dirty, { ALLOWED_TAGS: [] });
```

---

## Cross-Site Request Forgery (CSRF)

### Attack Vector
CSRF tricks authenticated users into performing unintended actions on websites where they're logged in.

### Vulnerable Patterns

```html
<!-- Attacker's site -->
<form action="https://bank.com/transfer" method="POST" id="csrf-form">
  <input type="hidden" name="to" value="attacker" />
  <input type="hidden" name="amount" value="10000" />
</form>
<script>document.getElementById('csrf-form').submit();</script>

<!-- Or with image -->
<img src="https://bank.com/transfer?to=attacker&amount=10000" />
```

### Protection Methods

#### 1. CSRF Tokens
```javascript
// Server generates token
const csrfToken = crypto.randomBytes(32).toString('hex');
req.session.csrfToken = csrfToken;

// Include in forms
<form method="POST">
  <input type="hidden" name="_csrf" value="${csrfToken}" />
</form>

// Or in headers for AJAX
fetch('/api/transfer', {
  method: 'POST',
  headers: {
    'X-CSRF-Token': csrfToken,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(data)
});

// Server validates
if (req.body._csrf !== req.session.csrfToken) {
  return res.status(403).json({ error: 'Invalid CSRF token' });
}
```

#### 2. SameSite Cookies
```javascript
// Express
res.cookie('session', sessionId, {
  httpOnly: true,
  secure: true,
  sameSite: 'strict', // Best protection
  // sameSite: 'lax'  // Good balance
});

// Set-Cookie header
Set-Cookie: session=abc123; HttpOnly; Secure; SameSite=Strict
```

#### 3. Double Submit Cookie
```javascript
// Client sends CSRF token in both cookie and header
document.cookie = `csrf=${token}; Secure; SameSite=Strict`;

fetch('/api/action', {
  headers: { 'X-CSRF-Token': token }
});

// Server compares both values
if (req.cookies.csrf !== req.headers['x-csrf-token']) {
  return res.status(403).send('CSRF validation failed');
}
```

---

## Content Security Policy (CSP)

### Basic CSP

```html
<!-- Meta tag (limited) -->
<meta http-equiv="Content-Security-Policy"
      content="default-src 'self'; script-src 'self'">
```

```javascript
// HTTP Header (recommended)
res.setHeader('Content-Security-Policy', [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'", // Inline styles (not ideal)
  "img-src 'self' data: https:",
  "font-src 'self'",
  "connect-src 'self' https://api.example.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'"
].join('; '));
```

### Strict CSP (Recommended)

```javascript
// Using nonces (most secure)
const nonce = crypto.randomBytes(16).toString('base64');

res.setHeader('Content-Security-Policy',
  `default-src 'self'; script-src 'nonce-${nonce}' 'strict-dynamic'; style-src 'self' 'nonce-${nonce}'`
);

// In HTML
<script nonce="${nonce}">
  // Trusted script
</script>
```

### CSP Directives Reference

| Directive | Purpose | Example |
|-----------|---------|---------|
| `default-src` | Fallback for other directives | `'self'` |
| `script-src` | JavaScript sources | `'self' 'nonce-xyz'` |
| `style-src` | CSS sources | `'self' 'unsafe-inline'` |
| `img-src` | Image sources | `'self' data: https:` |
| `connect-src` | AJAX, WebSocket, fetch | `'self' https://api.example.com` |
| `font-src` | Web fonts | `'self' https://fonts.gstatic.com` |
| `frame-src` | Iframe sources | `'none'` |
| `frame-ancestors` | Who can embed this page | `'none'` |
| `base-uri` | Base URL restriction | `'self'` |
| `form-action` | Form submission targets | `'self'` |
| `upgrade-insecure-requests` | Upgrade HTTP to HTTPS | (no value) |

### CSP Report-Only (Testing)

```javascript
// Test CSP without blocking
res.setHeader('Content-Security-Policy-Report-Only',
  "default-src 'self'; report-uri /csp-report"
);

// Report endpoint
app.post('/csp-report', express.json({ type: 'application/csp-report' }), (req, res) => {
  console.log('CSP Violation:', req.body);
  res.status(204).end();
});
```

---

## Security Headers

### Complete Security Headers

```javascript
// Using helmet.js (Express)
const helmet = require('helmet');
app.use(helmet());

// Manual configuration
app.use((req, res, next) => {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');

  // Prevent MIME sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // XSS filter (legacy browsers)
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // HTTPS enforcement
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions policy
  res.setHeader('Permissions-Policy', [
    'camera=()',
    'microphone=()',
    'geolocation=()',
    'payment=()'
  ].join(', '));

  next();
});
```

### Headers Reference

| Header | Purpose | Recommended Value |
|--------|---------|-------------------|
| `X-Frame-Options` | Prevent clickjacking | `DENY` or `SAMEORIGIN` |
| `X-Content-Type-Options` | Prevent MIME sniffing | `nosniff` |
| `Strict-Transport-Security` | Force HTTPS | `max-age=31536000; includeSubDomains` |
| `Referrer-Policy` | Control referer header | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | Feature restrictions | `camera=(), microphone=()` |
| `Content-Security-Policy` | Resource loading policy | See CSP section |

---

## Secure Data Handling

### Sensitive Data in Browser

```javascript
// BAD: Storing sensitive data in localStorage
localStorage.setItem('authToken', token); // Accessible to XSS
localStorage.setItem('creditCard', cardNumber);

// BAD: Exposing sensitive data in URL
window.location.href = `/reset?token=${resetToken}`;

// BAD: Console logging sensitive data
console.log('User password:', password);

// GOOD: Use httpOnly cookies for auth tokens
// Set by server, not accessible to JavaScript

// GOOD: Use sessionStorage for temporary data (cleared on tab close)
sessionStorage.setItem('tempData', nonSensitiveData);

// GOOD: Clear sensitive data after use
const processPayment = (cardData) => {
  try {
    // Process payment
  } finally {
    cardData = null;
  }
};

// GOOD: Mask sensitive display data
const maskCardNumber = (card) => `****-****-****-${card.slice(-4)}`;
```

### Form Security

```html
<!-- GOOD: Autocomplete control -->
<form autocomplete="off">
  <input type="password" autocomplete="new-password" />
  <input type="text" name="cc" autocomplete="cc-number" />
</form>

<!-- GOOD: Disable paste for confirmation fields -->
<input type="password" name="confirmPassword"
       onpaste="return false;" />
```

```javascript
// GOOD: Clear sensitive form data
document.getElementById('paymentForm').addEventListener('submit', (e) => {
  // After successful submission
  e.target.reset();
});

// GOOD: Prevent form data in history
history.replaceState(null, '', location.pathname);
```

---

## Third-Party Dependencies

### Subresource Integrity (SRI)

```html
<!-- GOOD: Use SRI for CDN resources -->
<script
  src="https://cdn.example.com/lib.js"
  integrity="sha384-abc123..."
  crossorigin="anonymous">
</script>

<link
  rel="stylesheet"
  href="https://cdn.example.com/style.css"
  integrity="sha384-xyz789..."
  crossorigin="anonymous">
```

### Generate SRI Hash

```bash
# Generate hash
openssl dgst -sha384 -binary file.js | openssl base64 -A

# Or use online tools / build plugins
```

### Dependency Security

```javascript
// package.json - lock versions
{
  "dependencies": {
    "lodash": "4.17.21",  // Exact version
    "express": "~4.18.2"  // Patch updates only
  }
}

// Audit dependencies
// npm audit
// npm audit fix
// npx snyk test
```

### Third-Party Script Isolation

```html
<!-- GOOD: Sandbox iframes for third-party content -->
<iframe
  src="https://third-party.com/widget"
  sandbox="allow-scripts allow-same-origin"
  loading="lazy">
</iframe>
```

---

## Framework-Specific Security

### React

```jsx
// GOOD: React auto-escapes by default
<div>{userInput}</div>

// CAREFUL: dangerouslySetInnerHTML
// Always sanitize first
import DOMPurify from 'dompurify';
<div dangerouslySetInnerHTML={{
  __html: DOMPurify.sanitize(htmlContent)
}} />

// GOOD: Use href validation
const SafeLink = ({ url, children }) => {
  const isSafe = /^(https?:)?\/\//.test(url);
  return isSafe ? <a href={url}>{children}</a> : <span>{children}</span>;
};

// GOOD: Avoid spreading user input to components
// BAD: <Component {...userInput} />
// GOOD: <Component allowed={userInput.allowed} />
```

### Vue

```vue
<!-- GOOD: Vue auto-escapes -->
<span>{{ userInput }}</span>

<!-- CAREFUL: v-html -->
<div v-html="sanitizedHtml"></div>

<script>
import DOMPurify from 'dompurify';

export default {
  computed: {
    sanitizedHtml() {
      return DOMPurify.sanitize(this.htmlContent);
    }
  }
}
</script>

<!-- GOOD: Use v-bind carefully -->
<!-- BAD: :href="userInput" -->
<!-- GOOD: :href="validatedUrl" -->
```

### Angular

```typescript
// Angular sanitizes by default
// CAREFUL: bypassSecurityTrust* methods
import { DomSanitizer } from '@angular/platform-browser';

@Component({...})
export class MyComponent {
  constructor(private sanitizer: DomSanitizer) {}

  // BAD: Bypassing security
  trustedHtml = this.sanitizer.bypassSecurityTrustHtml(userInput);

  // GOOD: Let Angular sanitize
  // Or use DOMPurify before bypassing
  safeHtml = this.sanitizer.bypassSecurityTrustHtml(
    DOMPurify.sanitize(userInput)
  );
}
```

---

## Authentication & Sessions

### Token Storage

```javascript
// BEST: HttpOnly cookies (set by server)
// Cannot be accessed by JavaScript = XSS-proof

// If tokens must be in JS (SPAs):
// Use memory storage with refresh token rotation
class TokenService {
  #accessToken = null;

  setToken(token) {
    this.#accessToken = token;
    // Clear after expiry
    setTimeout(() => this.#accessToken = null, 15 * 60 * 1000);
  }

  getToken() {
    return this.#accessToken;
  }

  clearToken() {
    this.#accessToken = null;
  }
}

// Refresh token in httpOnly cookie
// Access token in memory
// Refresh access token before expiry
```

### Logout Security

```javascript
// Complete logout
const logout = async () => {
  // 1. Call server to invalidate session
  await fetch('/api/logout', { method: 'POST' });

  // 2. Clear client-side storage
  localStorage.clear();
  sessionStorage.clear();

  // 3. Clear memory
  tokenService.clearToken();

  // 4. Clear service workers if needed
  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const registration of registrations) {
      registration.unregister();
    }
  }

  // 5. Redirect and replace history
  window.location.replace('/login');
};
```

### Sensitive Operation Protection

```javascript
// Require re-authentication for sensitive actions
const performSensitiveAction = async (action) => {
  // Show password confirmation modal
  const password = await showPasswordPrompt();

  const response = await fetch('/api/sensitive-action', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action,
      password,
      csrfToken: getCsrfToken()
    })
  });

  if (!response.ok) {
    throw new Error('Verification failed');
  }

  return response.json();
};
```
