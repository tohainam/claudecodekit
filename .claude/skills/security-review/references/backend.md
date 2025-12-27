# Backend Security

## Table of Contents
1. [Input Validation](#input-validation)
2. [SQL Injection](#sql-injection)
3. [NoSQL Injection](#nosql-injection)
4. [Command Injection](#command-injection)
5. [Authentication & Authorization](#authentication--authorization)
6. [Session Management](#session-management)
7. [File Operations](#file-operations)
8. [Error Handling](#error-handling)
9. [Logging & Monitoring](#logging--monitoring)
10. [Database Security](#database-security)

---

## Input Validation

### Principles
- **Validate on server-side** - Never trust client-side validation
- **Whitelist over blacklist** - Define what's allowed, not what's blocked
- **Validate type, length, format, range** - All dimensions
- **Fail closed** - Reject invalid input, don't try to fix it

### Validation Patterns

```javascript
// Using Joi (Node.js)
const Joi = require('joi');

const userSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().email().required(),
  age: Joi.number().integer().min(0).max(150),
  password: Joi.string().min(12).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
});

const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({
      error: 'Validation failed',
      details: error.details.map(d => d.message)
    });
  }
  req.validatedBody = value;
  next();
};

app.post('/users', validate(userSchema), createUser);
```

```python
# Using Pydantic (Python)
from pydantic import BaseModel, EmailStr, constr, validator

class UserCreate(BaseModel):
    username: constr(min_length=3, max_length=30, regex=r'^[a-zA-Z0-9]+$')
    email: EmailStr
    age: int = Field(ge=0, le=150)
    password: constr(min_length=12)

    @validator('password')
    def password_complexity(cls, v):
        if not any(c.isupper() for c in v):
            raise ValueError('must contain uppercase')
        if not any(c.islower() for c in v):
            raise ValueError('must contain lowercase')
        if not any(c.isdigit() for c in v):
            raise ValueError('must contain digit')
        return v

@app.post('/users')
async def create_user(user: UserCreate):
    # user is validated
    pass
```

### Content-Type Validation

```javascript
// Validate Content-Type
app.use((req, res, next) => {
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const contentType = req.headers['content-type'];
    if (!contentType?.includes('application/json')) {
      return res.status(415).json({ error: 'Unsupported Media Type' });
    }
  }
  next();
});

// Limit body size
app.use(express.json({ limit: '100kb' }));
```

---

## SQL Injection

### Vulnerable Patterns

```javascript
// BAD: String concatenation
const query = `SELECT * FROM users WHERE id = ${userId}`;
const query = "SELECT * FROM users WHERE name = '" + username + "'";

// BAD: Template literals
const query = `SELECT * FROM products WHERE category = '${category}'`;

// BAD: Format strings (Python)
query = f"SELECT * FROM users WHERE email = '{email}'"
query = "SELECT * FROM users WHERE id = %s" % user_id
```

### Secure Patterns

```javascript
// GOOD: Parameterized queries (Node.js)

// mysql2
const [rows] = await connection.execute(
  'SELECT * FROM users WHERE id = ?',
  [userId]
);

// pg (PostgreSQL)
const result = await client.query(
  'SELECT * FROM users WHERE id = $1 AND status = $2',
  [userId, status]
);

// GOOD: ORM with proper usage
// Sequelize
const user = await User.findOne({
  where: { id: userId }
});

// Prisma
const user = await prisma.user.findUnique({
  where: { id: userId }
});
```

```python
# GOOD: Parameterized queries (Python)

# psycopg2
cursor.execute(
    "SELECT * FROM users WHERE id = %s AND status = %s",
    (user_id, status)
)

# SQLAlchemy
result = session.execute(
    text("SELECT * FROM users WHERE id = :id"),
    {"id": user_id}
)

# Django ORM
User.objects.filter(id=user_id)
User.objects.raw('SELECT * FROM users WHERE id = %s', [user_id])
```

### Dynamic Queries (Safe Approach)

```javascript
// GOOD: Building dynamic queries safely
const buildQuery = (filters) => {
  const conditions = [];
  const params = [];

  if (filters.status) {
    conditions.push('status = ?');
    params.push(filters.status);
  }

  if (filters.category) {
    conditions.push('category = ?');
    params.push(filters.category);
  }

  // Whitelist for ORDER BY
  const allowedSortFields = ['name', 'created_at', 'price'];
  if (filters.sortBy && allowedSortFields.includes(filters.sortBy)) {
    const direction = filters.sortDir === 'desc' ? 'DESC' : 'ASC';
    // sortBy is from whitelist, safe to use directly
  }

  const whereClause = conditions.length
    ? `WHERE ${conditions.join(' AND ')}`
    : '';

  return {
    query: `SELECT * FROM products ${whereClause}`,
    params
  };
};
```

---

## NoSQL Injection

### Vulnerable Patterns

```javascript
// BAD: Direct object injection (MongoDB)
app.post('/login', async (req, res) => {
  const user = await User.findOne({
    username: req.body.username,
    password: req.body.password
  });
  // Attacker sends: { "username": "admin", "password": { "$ne": "" } }
  // Query becomes: { username: "admin", password: { $ne: "" } }
  // Matches admin with any password!
});

// BAD: String query from user input
const query = JSON.parse(req.query.filter);
const results = await collection.find(query);
```

### Secure Patterns

```javascript
// GOOD: Type validation
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // Ensure strings, not objects
  if (typeof username !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ error: 'Invalid input' });
  }

  const user = await User.findOne({ username });
  if (!user || !await bcrypt.compare(password, user.passwordHash)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
});

// GOOD: Use schema validation
const loginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required()
});

// GOOD: Sanitize operators
const mongoSanitize = require('express-mongo-sanitize');
app.use(mongoSanitize());

// GOOD: Explicitly construct queries
const buildUserQuery = (filters) => {
  const query = {};

  if (typeof filters.status === 'string') {
    query.status = filters.status;
  }

  if (typeof filters.minAge === 'number') {
    query.age = { $gte: filters.minAge };
  }

  return query;
};
```

---

## Command Injection

### Vulnerable Patterns

```javascript
// BAD: exec with user input
const { exec } = require('child_process');
exec(`ping ${userInput}`); // Attacker: "8.8.8.8; rm -rf /"

// BAD: Shell commands in string
exec(`convert ${inputFile} ${outputFile}`);

// BAD: System commands (Python)
import os
os.system(f"ping {host}")  # BAD
```

### Secure Patterns

```javascript
// GOOD: Use execFile with arguments array
const { execFile } = require('child_process');

execFile('ping', ['-c', '4', validatedHost], (error, stdout) => {
  // Safe: arguments are passed separately
});

// GOOD: Use spawn with no shell
const { spawn } = require('child_process');

const convert = spawn('convert', [inputFile, outputFile], {
  shell: false  // Explicitly disable shell
});

// GOOD: Whitelist commands
const ALLOWED_COMMANDS = {
  'list-files': { cmd: 'ls', args: ['-la'] },
  'disk-usage': { cmd: 'df', args: ['-h'] }
};

const runCommand = (commandName) => {
  const command = ALLOWED_COMMANDS[commandName];
  if (!command) {
    throw new Error('Unknown command');
  }
  return execFile(command.cmd, command.args);
};

// GOOD: Validate input strictly
const isValidHostname = (host) => {
  return /^[a-zA-Z0-9][a-zA-Z0-9.-]+[a-zA-Z0-9]$/.test(host);
};
```

```python
# GOOD: subprocess with list arguments (Python)
import subprocess

# Safe: arguments as list
subprocess.run(['ping', '-c', '4', validated_host], check=True)

# Safe: no shell=True
subprocess.run(
    ['convert', input_file, output_file],
    shell=False,
    check=True
)

# GOOD: shlex for necessary shell commands
import shlex
cmd = f'echo {shlex.quote(user_input)}'
```

---

## Authentication & Authorization

### Password Handling

```javascript
// GOOD: Use bcrypt or argon2
const bcrypt = require('bcrypt');
const SALT_ROUNDS = 12;

// Hash password
const hash = await bcrypt.hash(password, SALT_ROUNDS);

// Verify password
const isValid = await bcrypt.compare(password, hash);

// GOOD: Argon2 (preferred)
const argon2 = require('argon2');

const hash = await argon2.hash(password, {
  type: argon2.argon2id,
  memoryCost: 65536,
  timeCost: 3,
  parallelism: 4
});

const isValid = await argon2.verify(hash, password);
```

```python
# Python: passlib with argon2
from passlib.hash import argon2

hash = argon2.hash(password)
is_valid = argon2.verify(password, hash)
```

### JWT Security

```javascript
// GOOD: Proper JWT configuration
const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  return jwt.sign(
    {
      sub: user.id,
      role: user.role
    },
    process.env.JWT_SECRET,
    {
      algorithm: 'HS256', // Or RS256 for asymmetric
      expiresIn: '15m',
      issuer: 'api.example.com',
      audience: 'example.com'
    }
  );
};

const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET, {
    algorithms: ['HS256'], // Prevent algorithm switching attack
    issuer: 'api.example.com',
    audience: 'example.com'
  });
};

// GOOD: Token blacklisting for logout
const tokenBlacklist = new Set();

const logout = (token) => {
  const decoded = jwt.decode(token);
  tokenBlacklist.add(token);
  // Schedule removal after expiry
  setTimeout(() => tokenBlacklist.delete(token), decoded.exp * 1000 - Date.now());
};

const isBlacklisted = (token) => tokenBlacklist.has(token);
```

### Authorization Patterns

```javascript
// GOOD: Role-based access control (RBAC)
const permissions = {
  admin: ['read', 'write', 'delete', 'manage-users'],
  editor: ['read', 'write'],
  viewer: ['read']
};

const authorize = (...requiredPermissions) => (req, res, next) => {
  const userPermissions = permissions[req.user.role] || [];
  const hasPermission = requiredPermissions.every(p =>
    userPermissions.includes(p)
  );

  if (!hasPermission) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
};

app.delete('/posts/:id', authenticate, authorize('delete'), deletePost);

// GOOD: Attribute-based access control (ABAC)
const canAccessResource = (user, resource, action) => {
  // Owner can do anything
  if (resource.ownerId === user.id) return true;

  // Admins can do anything
  if (user.role === 'admin') return true;

  // Check specific permissions
  if (action === 'read' && resource.isPublic) return true;

  return false;
};
```

---

## Session Management

### Secure Session Configuration

```javascript
// Express session
const session = require('express-session');
const RedisStore = require('connect-redis').default;

app.use(session({
  store: new RedisStore({ client: redisClient }),
  name: 'sessionId', // Don't use default 'connect.sid'
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true, // HTTPS only
    httpOnly: true, // No JS access
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000, // 15 minutes
    domain: '.example.com'
  }
}));

// Regenerate session on login
app.post('/login', async (req, res) => {
  const user = await authenticate(req.body);
  if (user) {
    req.session.regenerate((err) => {
      req.session.userId = user.id;
      res.json({ success: true });
    });
  }
});

// Destroy session on logout
app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    res.clearCookie('sessionId');
    res.json({ success: true });
  });
});
```

---

## File Operations

### Path Traversal Prevention

```javascript
// BAD: Direct user input in path
const filePath = path.join('/uploads', req.params.filename);
// Attacker: ../../../etc/passwd

// GOOD: Validate and sanitize path
const path = require('path');

const getSecureFilePath = (baseDir, filename) => {
  // Remove path traversal attempts
  const sanitized = path.basename(filename);

  // Build path
  const fullPath = path.join(baseDir, sanitized);

  // Verify it's still within base directory
  const resolved = path.resolve(fullPath);
  if (!resolved.startsWith(path.resolve(baseDir))) {
    throw new Error('Invalid path');
  }

  return resolved;
};

// GOOD: Whitelist file extensions
const ALLOWED_EXTENSIONS = ['.jpg', '.png', '.pdf'];

const isAllowedFile = (filename) => {
  const ext = path.extname(filename).toLowerCase();
  return ALLOWED_EXTENSIONS.includes(ext);
};
```

### File Upload Security

```javascript
// GOOD: Comprehensive file upload validation
const multer = require('multer');
const crypto = require('crypto');

const storage = multer.diskStorage({
  destination: '/uploads/temp',
  filename: (req, file, cb) => {
    // Generate random filename
    const randomName = crypto.randomBytes(16).toString('hex');
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${randomName}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 1
  },
  fileFilter: (req, file, cb) => {
    // Check MIME type
    const allowedMimes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowedMimes.includes(file.mimetype)) {
      return cb(new Error('Invalid file type'));
    }

    // Check extension
    const ext = path.extname(file.originalname).toLowerCase();
    if (!['.jpg', '.jpeg', '.png', '.pdf'].includes(ext)) {
      return cb(new Error('Invalid extension'));
    }

    cb(null, true);
  }
});

// GOOD: Verify file content (magic bytes)
const fileType = require('file-type');

app.post('/upload', upload.single('file'), async (req, res) => {
  const buffer = await fs.promises.readFile(req.file.path);
  const type = await fileType.fromBuffer(buffer);

  if (!type || !['image/jpeg', 'image/png'].includes(type.mime)) {
    await fs.promises.unlink(req.file.path);
    return res.status(400).json({ error: 'Invalid file content' });
  }

  // Move to permanent storage
});
```

---

## Error Handling

### Secure Error Responses

```javascript
// GOOD: Custom error class
class AppError extends Error {
  constructor(message, statusCode, code) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
  }
}

// GOOD: Global error handler
app.use((err, req, res, next) => {
  // Log full error server-side
  logger.error({
    error: err.message,
    stack: err.stack,
    requestId: req.id,
    userId: req.user?.id,
    path: req.path
  });

  // Determine response
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      error: {
        message: err.message,
        code: err.code
      }
    });
  }

  // Unknown errors - don't expose details
  res.status(500).json({
    error: {
      message: 'An unexpected error occurred',
      code: 'INTERNAL_ERROR',
      requestId: req.id // For support reference
    }
  });
});

// BAD: Exposing stack traces
res.status(500).json({ error: err.stack }); // Never do this!
```

---

## Logging & Monitoring

### Security Logging

```javascript
// GOOD: Structured security logging
const winston = require('winston');

const securityLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'security.log' })
  ]
});

// Log authentication events
const logAuthEvent = (event, details) => {
  securityLogger.info({
    type: 'auth',
    event,
    ...details,
    timestamp: new Date().toISOString()
  });
};

// Usage
logAuthEvent('login_success', { userId: user.id, ip: req.ip });
logAuthEvent('login_failure', { username, ip: req.ip, reason: 'invalid_password' });
logAuthEvent('password_change', { userId: user.id, ip: req.ip });

// What to log
const SECURITY_EVENTS = [
  'login_success', 'login_failure', 'logout',
  'password_change', 'password_reset_request',
  'account_lockout', 'mfa_enable', 'mfa_disable',
  'permission_denied', 'unauthorized_access',
  'data_export', 'admin_action'
];

// What NOT to log
// - Passwords (even hashed)
// - Full credit card numbers
// - API keys/tokens
// - Session IDs (except last few chars)
```

---

## Database Security

### Connection Security

```javascript
// GOOD: Secure database connection
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: {
    rejectUnauthorized: true,
    ca: fs.readFileSync('/path/to/ca-cert.pem')
  },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
});
```

### Principle of Least Privilege

```sql
-- Create application-specific user with minimal permissions
CREATE USER app_user WITH PASSWORD 'strong_password';

-- Grant only necessary permissions
GRANT SELECT, INSERT, UPDATE ON users TO app_user;
GRANT SELECT ON products TO app_user;
-- No DELETE, no DROP, no ALTER

-- Use row-level security for multi-tenant
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON documents
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
```

### Data Encryption

```javascript
// GOOD: Encrypt sensitive fields
const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm';
const KEY = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');

const encrypt = (text) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
};

const decrypt = (encrypted) => {
  const [ivHex, authTagHex, content] = encrypted.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(content, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};

// Store encrypted
user.ssn = encrypt(ssn);
await user.save();
```
