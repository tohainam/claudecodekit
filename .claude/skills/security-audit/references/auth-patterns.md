# Authentication Patterns

## OAuth 2.0 with PKCE

### Flow (Authorization Code + PKCE)

```
┌──────────┐                              ┌──────────────┐
│  Client  │                              │ Auth Server  │
└────┬─────┘                              └──────┬───────┘
     │                                           │
     │  1. Generate code_verifier + code_challenge
     │  ─────────────────────────────────────►  │
     │  /authorize?                              │
     │    response_type=code&                    │
     │    code_challenge=xxx&                    │
     │    code_challenge_method=S256             │
     │                                           │
     │  2. User authenticates                    │
     │                                           │
     │  ◄─────────────────────────────────────   │
     │  Redirect with authorization code         │
     │                                           │
     │  3. Exchange code for tokens              │
     │  ─────────────────────────────────────►  │
     │  /token                                   │
     │    code=xxx&                              │
     │    code_verifier=xxx                      │
     │                                           │
     │  ◄─────────────────────────────────────   │
     │  Access token + Refresh token             │
     │                                           │
```

### Implementation

```typescript
// Generate PKCE values
function generatePKCE(): { verifier: string; challenge: string } {
  const verifier = base64url(crypto.randomBytes(32));
  const challenge = base64url(
    crypto.createHash("sha256").update(verifier).digest()
  );
  return { verifier, challenge };
}

// Initiate OAuth flow
app.get("/auth/login", (req, res) => {
  const { verifier, challenge } = generatePKCE();
  req.session.codeVerifier = verifier;

  const authUrl = new URL("https://auth.example.com/authorize");
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("client_id", CLIENT_ID);
  authUrl.searchParams.set("redirect_uri", REDIRECT_URI);
  authUrl.searchParams.set("scope", "openid profile email");
  authUrl.searchParams.set("code_challenge", challenge);
  authUrl.searchParams.set("code_challenge_method", "S256");
  authUrl.searchParams.set("state", generateState());

  res.redirect(authUrl.toString());
});

// Handle callback
app.get("/auth/callback", async (req, res) => {
  const { code, state } = req.query;

  // Validate state to prevent CSRF
  if (state !== req.session.expectedState) {
    return res.status(400).send("Invalid state");
  }

  const tokens = await exchangeCode(code, req.session.codeVerifier);
  req.session.accessToken = tokens.access_token;
  req.session.refreshToken = tokens.refresh_token;

  res.redirect("/dashboard");
});
```

## JWT Best Practices

### Token Structure

```
Header.Payload.Signature

Header: { "alg": "ES256", "typ": "JWT" }
Payload: { "sub": "123", "exp": 1234567890, ... }
Signature: ECDSA(header.payload, privateKey)
```

### Secure Configuration

```typescript
import { SignJWT, jwtVerify } from "jose";

// Sign tokens
async function createAccessToken(user: User): Promise<string> {
  return new SignJWT({
    sub: user.id,
    email: user.email,
    roles: user.roles,
  })
    .setProtectedHeader({ alg: "ES256" })
    .setIssuedAt()
    .setExpirationTime("15m") // Short-lived
    .setIssuer("https://api.example.com")
    .setAudience("https://app.example.com")
    .sign(privateKey);
}

// Verify tokens
async function verifyToken(token: string): Promise<JWTPayload> {
  const { payload } = await jwtVerify(token, publicKey, {
    issuer: "https://api.example.com",
    audience: "https://app.example.com",
    algorithms: ["ES256"],
  });
  return payload;
}
```

### Token Recommendations

| Setting                | Recommendation                             |
| ---------------------- | ------------------------------------------ |
| Algorithm              | ES256, RS256 (never HS256 for distributed) |
| Access token lifetime  | 5-15 minutes                               |
| Refresh token lifetime | 7-30 days                                  |
| Storage (browser)      | HttpOnly cookie or memory                  |
| Storage (mobile)       | Secure enclave/keychain                    |

### What NOT to Include in JWT

- Passwords or secrets
- Sensitive PII (SSN, credit cards)
- Full user permissions (include role, lookup details)
- Large payloads (keep < 4KB)

## Session Management

### Secure Session Configuration

```typescript
import session from "express-session";
import RedisStore from "connect-redis";

app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    name: "__Host-session", // Cookie prefix for security
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: true, // HTTPS only
      httpOnly: true, // No JavaScript access
      sameSite: "strict", // CSRF protection
      maxAge: 3600000, // 1 hour
      path: "/",
      domain: undefined, // Current domain only
    },
    rolling: true, // Extend on activity
  })
);
```

### Session Lifecycle

```typescript
// Login: Create session
app.post("/login", async (req, res) => {
  const user = await authenticateUser(req.body);

  // Regenerate session ID to prevent fixation
  req.session.regenerate((err) => {
    req.session.userId = user.id;
    req.session.createdAt = Date.now();
    res.redirect("/dashboard");
  });
});

// Logout: Destroy session
app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    res.clearCookie("__Host-session");
    res.redirect("/");
  });
});

// Absolute timeout
app.use((req, res, next) => {
  const maxAge = 8 * 60 * 60 * 1000; // 8 hours
  if (req.session.createdAt && Date.now() - req.session.createdAt > maxAge) {
    return req.session.destroy(() => res.redirect("/login"));
  }
  next();
});
```

## Password Security

### Hashing

```typescript
import { hash, verify } from "@node-rs/argon2";

// Hash password
async function hashPassword(password: string): Promise<string> {
  return hash(password, {
    memoryCost: 65536, // 64 MB
    timeCost: 3, // 3 iterations
    parallelism: 4, // 4 threads
    hashLength: 32,
  });
}

// Verify password
async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return verify(hashedPassword, password);
}
```

### Password Policy

```typescript
const passwordPolicy = {
  minLength: 12,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecial: false, // Debated, NIST recommends against
  maxLength: 128,
  preventCommon: true, // Check against breached passwords
};

function validatePassword(password: string): string[] {
  const errors: string[] = [];

  if (password.length < passwordPolicy.minLength) {
    errors.push(
      `Password must be at least ${passwordPolicy.minLength} characters`
    );
  }

  // Check against breached passwords (via k-anonymity API)
  if (await isBreachedPassword(password)) {
    errors.push("This password has been found in a data breach");
  }

  return errors;
}
```

## Passwordless Authentication

### WebAuthn / Passkeys

```typescript
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from "@simplewebauthn/server";

// Registration
app.post("/auth/webauthn/register/options", async (req, res) => {
  const options = await generateRegistrationOptions({
    rpName: "Example App",
    rpID: "example.com",
    userID: user.id,
    userName: user.email,
    attestationType: "none",
    authenticatorSelection: {
      residentKey: "preferred",
      userVerification: "preferred",
    },
  });

  req.session.challenge = options.challenge;
  res.json(options);
});

// Authentication
app.post("/auth/webauthn/authenticate/options", async (req, res) => {
  const options = await generateAuthenticationOptions({
    rpID: "example.com",
    allowCredentials: user.credentials.map((c) => ({
      id: c.credentialID,
      type: "public-key",
    })),
  });

  req.session.challenge = options.challenge;
  res.json(options);
});
```

### Magic Links

```typescript
// Generate magic link
async function sendMagicLink(email: string): Promise<void> {
  const token = crypto.randomBytes(32).toString("hex");
  const expiry = Date.now() + 15 * 60 * 1000; // 15 minutes

  await db.magicLinks.create({
    email,
    token: hashToken(token), // Store hashed
    expiresAt: expiry,
  });

  await sendEmail(email, {
    subject: "Sign in to Example App",
    link: `https://example.com/auth/magic/${token}`,
  });
}

// Verify magic link
app.get("/auth/magic/:token", async (req, res) => {
  const hashedToken = hashToken(req.params.token);
  const link = await db.magicLinks.findOne({
    token: hashedToken,
    expiresAt: { $gt: Date.now() },
  });

  if (!link) {
    return res.status(400).send("Invalid or expired link");
  }

  // Delete used token
  await db.magicLinks.delete({ token: hashedToken });

  // Create session
  const user = await db.users.findOne({ email: link.email });
  req.session.userId = user.id;
  res.redirect("/dashboard");
});
```

## Multi-Factor Authentication

### TOTP (Time-based One-Time Password)

```typescript
import { authenticator } from "otplib";

// Setup MFA
app.post("/mfa/setup", async (req, res) => {
  const secret = authenticator.generateSecret();
  const otpauth = authenticator.keyuri(user.email, "Example App", secret);

  // Store secret encrypted
  await db.users.update(user.id, {
    mfaSecret: encrypt(secret),
    mfaEnabled: false, // Enable after verification
  });

  res.json({
    secret,
    qrCode: await generateQRCode(otpauth),
  });
});

// Verify MFA
app.post("/mfa/verify", async (req, res) => {
  const { code } = req.body;
  const secret = decrypt(user.mfaSecret);

  if (!authenticator.verify({ token: code, secret })) {
    return res.status(400).json({ error: "Invalid code" });
  }

  // MFA verified, complete login
  req.session.mfaVerified = true;
  res.json({ success: true });
});
```
