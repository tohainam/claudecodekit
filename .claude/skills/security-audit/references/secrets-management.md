# Secrets Management

## Secrets Hierarchy

### Types of Secrets

| Type               | Examples                        | Risk Level |
| ------------------ | ------------------------------- | ---------- |
| **Infrastructure** | Database passwords, API keys    | Critical   |
| **Application**    | JWT secrets, encryption keys    | Critical   |
| **Service**        | Third-party API tokens          | High       |
| **User**           | User passwords, personal tokens | High       |
| **Session**        | Session tokens, CSRF tokens     | Medium     |

### Storage Recommendations

| Environment | Storage Method                   |
| ----------- | -------------------------------- |
| Development | `.env` file (gitignored)         |
| CI/CD       | Pipeline secrets                 |
| Production  | Secrets manager (Vault, AWS SM)  |
| Kubernetes  | Sealed Secrets, External Secrets |

## Environment Variables

### Best Practices

```bash
# .env.example (committed, no real values)
DATABASE_URL=postgresql://user:password@localhost:5432/db
API_KEY=your-api-key-here
JWT_SECRET=generate-a-secure-random-string

# .env (gitignored, real values)
DATABASE_URL=postgresql://admin:s3cr3t@prod-db.example.com:5432/app
API_KEY=sk_live_abc123...
JWT_SECRET=7f8a9b...
```

### Loading Secrets

```typescript
// Load early in application startup
import "dotenv/config";

// Validate required secrets
const requiredSecrets = ["DATABASE_URL", "JWT_SECRET", "API_KEY"];

for (const secret of requiredSecrets) {
  if (!process.env[secret]) {
    throw new Error(`Missing required secret: ${secret}`);
  }
}

// Freeze config to prevent modification
export const config = Object.freeze({
  database: {
    url: process.env.DATABASE_URL!,
  },
  jwt: {
    secret: process.env.JWT_SECRET!,
    expiresIn: "15m",
  },
  api: {
    key: process.env.API_KEY!,
  },
});
```

## Secrets Managers

### HashiCorp Vault

```typescript
import Vault from "node-vault";

const vault = Vault({
  apiVersion: "v1",
  endpoint: process.env.VAULT_ADDR,
  token: process.env.VAULT_TOKEN,
});

// Read secret
async function getSecret(path: string): Promise<Record<string, string>> {
  const response = await vault.read(`secret/data/${path}`);
  return response.data.data;
}

// Usage
const dbCredentials = await getSecret("database/production");
const connectionString = `postgresql://${dbCredentials.username}:${dbCredentials.password}@...`;
```

### AWS Secrets Manager

```typescript
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

const client = new SecretsManagerClient({ region: "us-east-1" });

async function getSecret(secretId: string): Promise<Record<string, unknown>> {
  const command = new GetSecretValueCommand({ SecretId: secretId });
  const response = await client.send(command);

  if (response.SecretString) {
    return JSON.parse(response.SecretString);
  }

  throw new Error("Binary secrets not supported");
}

// Usage with caching
const cache = new Map<string, { value: unknown; expiry: number }>();

async function getCachedSecret(secretId: string): Promise<unknown> {
  const cached = cache.get(secretId);

  if (cached && cached.expiry > Date.now()) {
    return cached.value;
  }

  const value = await getSecret(secretId);
  cache.set(secretId, {
    value,
    expiry: Date.now() + 5 * 60 * 1000, // 5 minute cache
  });

  return value;
}
```

## Secret Rotation

### Rotation Strategy

```
┌─────────────────────────────────────────────────────┐
│                 Secret Rotation                      │
├─────────────────────────────────────────────────────┤
│  1. Generate new secret                              │
│  2. Update secrets manager (both old and new valid)  │
│  3. Deploy applications with new secret              │
│  4. Verify all instances using new secret            │
│  5. Revoke old secret                                │
└─────────────────────────────────────────────────────┘
```

### Implementation

```typescript
// Support multiple active secrets during rotation
class SecretManager {
  private secrets: string[] = [];

  async loadSecrets(): Promise<void> {
    // Load both current and previous secret
    this.secrets = [
      process.env.JWT_SECRET_CURRENT!,
      process.env.JWT_SECRET_PREVIOUS,
    ].filter(Boolean);
  }

  // Verify with any valid secret
  async verify(token: string): Promise<JWTPayload | null> {
    for (const secret of this.secrets) {
      try {
        return await jwtVerify(token, secret);
      } catch {
        continue;
      }
    }
    return null;
  }

  // Always sign with current secret
  async sign(payload: JWTPayload): Promise<string> {
    return new SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" })
      .sign(this.secrets[0]);
  }
}
```

## Encryption at Rest

### Key Management

```typescript
import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

// Encryption key from secrets manager
const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY!, "hex");

function encrypt(plaintext: string): string {
  const iv = randomBytes(16);
  const cipher = createCipheriv("aes-256-gcm", ENCRYPTION_KEY, iv);

  let encrypted = cipher.update(plaintext, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag();

  // Return IV + AuthTag + Ciphertext
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
}

function decrypt(ciphertext: string): string {
  const [ivHex, authTagHex, encrypted] = ciphertext.split(":");

  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");

  const decipher = createDecipheriv("aes-256-gcm", ENCRYPTION_KEY, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}
```

### Field-Level Encryption

```typescript
// Encrypt sensitive fields before storage
class User {
  id: string;
  email: string;

  @Encrypted()
  ssn: string;

  @Encrypted()
  creditCard: string;
}

// Decorator implementation
function Encrypted() {
  return function (target: any, propertyKey: string) {
    let value: string;

    Object.defineProperty(target, propertyKey, {
      get() {
        return decrypt(value);
      },
      set(newValue: string) {
        value = encrypt(newValue);
      },
    });
  };
}
```

## Git Security

### Prevention

```bash
# .gitignore
.env
.env.*
!.env.example
*.pem
*.key
secrets/
credentials.json
```

### Pre-commit Hooks

```bash
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/Yelp/detect-secrets
    rev: v1.4.0
    hooks:
      - id: detect-secrets
        args: ['--baseline', '.secrets.baseline']

  - repo: https://github.com/gitleaks/gitleaks
    rev: v8.18.0
    hooks:
      - id: gitleaks
```

### If Secrets Are Committed

```bash
# 1. Immediately rotate the secret
# 2. Remove from history (if not pushed)
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch path/to/secret' \
  --prune-empty -- --all

# Or use BFG Repo-Cleaner
bfg --delete-files credentials.json
bfg --replace-text passwords.txt

# 3. Force push (if already pushed)
git push --force --all

# 4. Contact GitHub/GitLab to purge caches
```

## Security Checklist

### Development

- [ ] Use `.env.example` for documentation
- [ ] Never commit real secrets
- [ ] Use different secrets per environment
- [ ] Install pre-commit secret detection

### CI/CD

- [ ] Use pipeline secret variables
- [ ] Don't echo secrets in logs
- [ ] Mask secrets in output
- [ ] Rotate secrets regularly

### Production

- [ ] Use secrets manager (Vault, AWS SM)
- [ ] Enable audit logging
- [ ] Implement secret rotation
- [ ] Encrypt secrets at rest
- [ ] Limit access with IAM

### Monitoring

- [ ] Alert on unauthorized access
- [ ] Monitor for exposed secrets
- [ ] Review access logs regularly
- [ ] Have incident response plan
