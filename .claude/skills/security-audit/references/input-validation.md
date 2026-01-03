# Input Validation

## Validation Principles

### Defense in Depth

```
Client-Side Validation (UX)
         ↓
API Gateway (Rate limiting, basic format)
         ↓
Application Layer (Business rules)
         ↓
Database Layer (Constraints)
```

### Validation Strategy

| Layer    | Purpose     | Example                             |
| -------- | ----------- | ----------------------------------- |
| Client   | UX feedback | HTML5 validation, inline errors     |
| Server   | Security    | Schema validation, sanitization     |
| Database | Integrity   | NOT NULL, UNIQUE, CHECK constraints |

## Schema Validation

### Using Zod (TypeScript)

```typescript
import { z } from "zod";

// Define schema
const UserSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z
    .string()
    .min(12, "Password must be at least 12 characters")
    .max(128, "Password too long"),
  name: z
    .string()
    .min(1, "Name is required")
    .max(100)
    .regex(/^[\p{L}\s'-]+$/u, "Name contains invalid characters"),
  age: z
    .number()
    .int()
    .min(13, "Must be at least 13 years old")
    .max(120)
    .optional(),
  role: z.enum(["user", "admin", "moderator"]).default("user"),
});

// Validate input
function createUser(input: unknown): User {
  const validated = UserSchema.parse(input);
  return new User(validated);
}

// Safe parsing (no throw)
function tryCreateUser(input: unknown): Result<User, ValidationError> {
  const result = UserSchema.safeParse(input);
  if (result.success) {
    return Ok(new User(result.data));
  }
  return Err(new ValidationError(result.error.issues));
}
```

### Common Validations

```typescript
// Email
const emailSchema = z.string().email().toLowerCase().max(254);

// URL
const urlSchema = z
  .string()
  .url()
  .refine((url) => {
    const parsed = new URL(url);
    return ["http:", "https:"].includes(parsed.protocol);
  }, "Only HTTP(S) URLs allowed");

// UUID
const uuidSchema = z.string().uuid();

// Slug
const slugSchema = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug format");

// Phone (E.164)
const phoneSchema = z
  .string()
  .regex(/^\+[1-9]\d{1,14}$/, "Invalid phone format");

// Date
const dateSchema = z.coerce.date().min(new Date("1900-01-01")).max(new Date());
```

## Input Sanitization

### HTML Sanitization

```typescript
import DOMPurify from "dompurify";
import { JSDOM } from "jsdom";

const window = new JSDOM("").window;
const purify = DOMPurify(window);

// Sanitize user HTML
function sanitizeHtml(dirty: string): string {
  return purify.sanitize(dirty, {
    ALLOWED_TAGS: ["b", "i", "em", "strong", "a", "p", "br"],
    ALLOWED_ATTR: ["href"],
    ALLOW_DATA_ATTR: false,
  });
}

// Strip all HTML
function stripHtml(dirty: string): string {
  return purify.sanitize(dirty, { ALLOWED_TAGS: [] });
}
```

### SQL/NoSQL Sanitization

```typescript
// SQL: Always use parameterized queries
const user = await db.query(
  "SELECT * FROM users WHERE id = $1 AND status = $2",
  [userId, "active"]
);

// NoSQL: Sanitize operators
function sanitizeMongoQuery(input: unknown): object {
  if (typeof input !== "object" || input === null) {
    return {};
  }

  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(input)) {
    // Block operator injection
    if (key.startsWith("$")) {
      continue;
    }

    // Recursively sanitize nested objects
    if (typeof value === "object" && value !== null) {
      sanitized[key] = sanitizeMongoQuery(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}
```

### Path Traversal Prevention

```typescript
import path from "path";

const UPLOAD_DIR = "/var/app/uploads";

function resolveUploadPath(filename: string): string {
  // Normalize and resolve
  const normalized = path.normalize(filename);

  // Remove leading slashes and dots
  const safe = normalized.replace(/^[./\\]+/, "");

  // Get only the base name (no directories)
  const base = path.basename(safe);

  // Resolve full path
  const fullPath = path.resolve(UPLOAD_DIR, base);

  // Verify it's within upload directory
  if (!fullPath.startsWith(UPLOAD_DIR)) {
    throw new Error("Invalid path");
  }

  return fullPath;
}
```

## Output Encoding

### Context-Specific Encoding

| Context        | Encoding               | Example                     |
| -------------- | ---------------------- | --------------------------- |
| HTML Body      | HTML entities          | `&lt;script&gt;`            |
| HTML Attribute | HTML entities + quotes | `value="&quot;test&quot;"`  |
| JavaScript     | JS escape              | `\x3cscript\x3e`            |
| URL Parameter  | URL encode             | `%3Cscript%3E`              |
| CSS            | CSS escape             | `\3c script\3e`             |
| JSON           | JSON.stringify         | Already safe if not in HTML |

### Implementation

```typescript
// HTML encoding
function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// For attributes
function escapeAttribute(unsafe: string): string {
  return escapeHtml(unsafe).replace(/`/g, "&#96;").replace(/=/g, "&#61;");
}

// URL parameters
function encodeParam(value: string): string {
  return encodeURIComponent(value);
}

// JavaScript string
function escapeJs(unsafe: string): string {
  return JSON.stringify(unsafe).slice(1, -1);
}
```

## Content-Type Validation

### File Upload Validation

```typescript
import { fileTypeFromBuffer } from "file-type";

const ALLOWED_TYPES = new Map([
  ["image/jpeg", [".jpg", ".jpeg"]],
  ["image/png", [".png"]],
  ["image/gif", [".gif"]],
  ["application/pdf", [".pdf"]],
]);

async function validateUpload(file: UploadedFile): Promise<void> {
  // Check file size
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB
  if (file.size > MAX_SIZE) {
    throw new ValidationError("File too large");
  }

  // Detect actual file type from content
  const type = await fileTypeFromBuffer(file.buffer);

  if (!type || !ALLOWED_TYPES.has(type.mime)) {
    throw new ValidationError("File type not allowed");
  }

  // Verify extension matches content
  const ext = path.extname(file.name).toLowerCase();
  const allowedExts = ALLOWED_TYPES.get(type.mime);

  if (!allowedExts?.includes(ext)) {
    throw new ValidationError("File extension mismatch");
  }

  // Additional checks for specific types
  if (type.mime.startsWith("image/")) {
    await validateImage(file.buffer);
  }
}

async function validateImage(buffer: Buffer): Promise<void> {
  // Use sharp to validate image is parseable
  const sharp = require("sharp");
  const metadata = await sharp(buffer).metadata();

  // Check dimensions
  if (metadata.width > 10000 || metadata.height > 10000) {
    throw new ValidationError("Image dimensions too large");
  }
}
```

## Rate Limiting

### Implementation

```typescript
import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";

// General API rate limit
const apiLimiter = rateLimit({
  store: new RedisStore({ client: redis }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: "Too many requests" },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict limit for auth endpoints
const authLimiter = rateLimit({
  store: new RedisStore({ client: redis }),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: { error: "Too many login attempts" },
  skipSuccessfulRequests: true,
});

app.use("/api/", apiLimiter);
app.use("/api/auth/login", authLimiter);
```

## Validation Checklist

### By Data Type

| Type   | Validations                             |
| ------ | --------------------------------------- |
| String | Length, format (regex), encoding, trim  |
| Number | Range, integer vs float, NaN/Infinity   |
| Email  | Format, normalize (lowercase), length   |
| URL    | Protocol whitelist, hostname validation |
| Date   | Range, format, timezone                 |
| File   | Size, type, extension, content scan     |
| Array  | Length, element validation              |
| Object | Required fields, no extra fields        |

### Security Checklist

- [ ] Validate on server (never trust client)
- [ ] Use allowlist over denylist
- [ ] Validate before use
- [ ] Encode output for context
- [ ] Limit input sizes
- [ ] Handle encoding (UTF-8)
- [ ] Log validation failures
- [ ] Return safe error messages
