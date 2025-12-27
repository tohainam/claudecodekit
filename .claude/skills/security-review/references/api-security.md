# API Security (OWASP API Top 10)

## Table of Contents
1. [API01: Broken Object Level Authorization](#api01-broken-object-level-authorization)
2. [API02: Broken Authentication](#api02-broken-authentication)
3. [API03: Broken Object Property Level Authorization](#api03-broken-object-property-level-authorization)
4. [API04: Unrestricted Resource Consumption](#api04-unrestricted-resource-consumption)
5. [API05: Broken Function Level Authorization](#api05-broken-function-level-authorization)
6. [API06: Unrestricted Access to Sensitive Business Flows](#api06-unrestricted-access-to-sensitive-business-flows)
7. [API07: Server Side Request Forgery](#api07-server-side-request-forgery)
8. [API08: Security Misconfiguration](#api08-security-misconfiguration)
9. [API09: Improper Inventory Management](#api09-improper-inventory-management)
10. [API10: Unsafe Consumption of APIs](#api10-unsafe-consumption-of-apis)
11. [Best Practices](#best-practices)

---

## API01: Broken Object Level Authorization

### Description
APIs tend to expose endpoints that handle object identifiers, creating a wide attack surface of Object Level Access Control issues. Object level authorization checks should be considered in every function that accesses a data source using an ID from the user.

### Vulnerable Pattern
```javascript
// BAD: No authorization check
app.get('/api/orders/:orderId', async (req, res) => {
  const order = await Order.findById(req.params.orderId);
  res.json(order); // Any user can access any order!
});

// BAD: Relying only on obscurity
app.get('/api/documents/:uuid', async (req, res) => {
  const doc = await Document.findByUuid(req.params.uuid);
  res.json(doc); // UUIDs can be guessed/leaked
});
```

### Secure Pattern
```javascript
// GOOD: Proper authorization check
app.get('/api/orders/:orderId', authenticate, async (req, res) => {
  const order = await Order.findById(req.params.orderId);

  if (!order) {
    return res.status(404).json({ error: 'Not found' });
  }

  // Check ownership or permission
  if (order.userId !== req.user.id && !req.user.hasRole('admin')) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  res.json(order);
});

// GOOD: Query scoped to user
app.get('/api/orders/:orderId', authenticate, async (req, res) => {
  const order = await Order.findOne({
    _id: req.params.orderId,
    userId: req.user.id  // Scoped to user
  });

  if (!order) {
    return res.status(404).json({ error: 'Not found' });
  }

  res.json(order);
});
```

---

## API02: Broken Authentication

### Description
Authentication mechanisms are often implemented incorrectly, allowing attackers to compromise authentication tokens or exploit implementation flaws.

### Vulnerable Patterns
```javascript
// BAD: Weak JWT secret
const token = jwt.sign(payload, 'secret123');

// BAD: No token expiration
const token = jwt.sign(payload, secret); // No expiresIn

// BAD: Token in URL
res.redirect(`/callback?token=${token}`);

// BAD: No rate limiting on login
app.post('/api/login', async (req, res) => {
  const user = await authenticate(req.body);
  // No rate limiting = brute force possible
});

// BAD: Exposing authentication details
if (!user) return res.json({ error: 'User not found' });
if (!validPassword) return res.json({ error: 'Invalid password' });
```

### Secure Pattern
```javascript
// GOOD: Strong JWT configuration
const token = jwt.sign(payload, process.env.JWT_SECRET, {
  expiresIn: '15m',
  algorithm: 'RS256',
  issuer: 'api.example.com',
  audience: 'example.com'
});

// GOOD: Rate limiting
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  skipSuccessfulRequests: true
});

app.post('/api/login', loginLimiter, async (req, res) => {
  // Generic error message
  const user = await authenticate(req.body);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
});

// GOOD: Refresh token rotation
app.post('/api/refresh', async (req, res) => {
  const { refreshToken } = req.body;
  const decoded = await verifyRefreshToken(refreshToken);

  // Invalidate old refresh token
  await invalidateToken(refreshToken);

  // Issue new tokens
  const newAccessToken = generateAccessToken(decoded.userId);
  const newRefreshToken = generateRefreshToken(decoded.userId);

  res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
});
```

---

## API03: Broken Object Property Level Authorization

### Description
APIs may expose more data than necessary or allow modification of properties that should be protected. Combines excessive data exposure and mass assignment.

### Vulnerable Patterns
```javascript
// BAD: Exposing all fields
app.get('/api/users/:id', async (req, res) => {
  const user = await User.findById(req.params.id);
  res.json(user); // Exposes password, SSN, internal fields
});

// BAD: Mass assignment vulnerability
app.put('/api/users/:id', async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, req.body);
  // User can set isAdmin: true in body!
});
```

### Secure Pattern
```javascript
// GOOD: Explicit field selection
app.get('/api/users/:id', async (req, res) => {
  const user = await User.findById(req.params.id)
    .select('id name email avatar createdAt');
  res.json(user);
});

// GOOD: DTO/Schema validation
const updateUserSchema = Joi.object({
  name: Joi.string().max(100),
  email: Joi.string().email(),
  avatar: Joi.string().uri()
  // isAdmin, role, etc. NOT allowed
});

app.put('/api/users/:id', async (req, res) => {
  const { error, value } = updateUserSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details });
  }

  await User.findByIdAndUpdate(req.params.id, value);
});

// GOOD: Response DTO
const userResponse = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  avatar: user.avatar
});

app.get('/api/users/:id', async (req, res) => {
  const user = await User.findById(req.params.id);
  res.json(userResponse(user));
});
```

---

## API04: Unrestricted Resource Consumption

### Description
APIs may not limit the size or number of resources that can be requested, leading to DoS, increased costs, or degraded service.

### Vulnerable Patterns
```javascript
// BAD: No pagination
app.get('/api/products', async (req, res) => {
  const products = await Product.find(); // Could be millions
  res.json(products);
});

// BAD: No file size limit
app.post('/api/upload', upload.single('file'), async (req, res) => {
  // No size limit = storage exhaustion
});

// BAD: No timeout on operations
app.post('/api/report', async (req, res) => {
  const report = await generateReport(req.body); // Could take hours
  res.json(report);
});

// BAD: Allowing expensive regex
const pattern = new RegExp(req.query.pattern); // ReDoS possible
```

### Secure Pattern
```javascript
// GOOD: Pagination with limits
app.get('/api/products', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);
  const skip = (page - 1) * limit;

  const products = await Product.find()
    .skip(skip)
    .limit(limit);

  const total = await Product.countDocuments();

  res.json({
    data: products,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) }
  });
});

// GOOD: File size and type limits
const upload = multer({
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 1
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// GOOD: Operation timeouts
const AbortController = require('abort-controller');

app.post('/api/report', async (req, res) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const report = await generateReport(req.body, controller.signal);
    res.json(report);
  } catch (error) {
    if (error.name === 'AbortError') {
      res.status(408).json({ error: 'Request timeout' });
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
});

// GOOD: Rate limiting
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/', apiLimiter);
```

---

## API05: Broken Function Level Authorization

### Description
Authorization flaws at the function level allow attackers to access administrative functions or operations they shouldn't have access to.

### Vulnerable Patterns
```javascript
// BAD: Admin endpoint without proper auth
app.delete('/api/admin/users/:id', async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// BAD: Relying on hidden endpoints
app.post('/api/internal/generate-report', async (req, res) => {
  // "Hidden" but no auth
});

// BAD: Client-side role check
// Frontend checks role, but API doesn't verify
```

### Secure Pattern
```javascript
// GOOD: Role-based middleware
const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
};

app.delete('/api/admin/users/:id',
  authenticate,
  requireRole('admin'),
  async (req, res) => {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  }
);

// GOOD: Permission-based authorization
const requirePermission = (...permissions) => (req, res, next) => {
  const userPermissions = req.user.permissions || [];
  const hasPermission = permissions.some(p => userPermissions.includes(p));

  if (!hasPermission) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
};

app.post('/api/reports/generate',
  authenticate,
  requirePermission('reports:create'),
  generateReport
);
```

---

## API06: Unrestricted Access to Sensitive Business Flows

### Description
APIs exposing business flows (purchasing, commenting, posting) may be abused by automated attacks if they lack proper restrictions.

### Vulnerable Patterns
```javascript
// BAD: No protection against automation
app.post('/api/checkout', async (req, res) => {
  // Scalpers can automate purchases
});

app.post('/api/comments', async (req, res) => {
  // Spam bots can flood comments
});

app.post('/api/register', async (req, res) => {
  // Fake account creation at scale
});
```

### Secure Pattern
```javascript
// GOOD: Multi-layered protection
const protectBusinessFlow = [
  authenticate,
  rateLimit({ windowMs: 60000, max: 5 }),
  verifyCaptcha,
  detectAnomalies
];

app.post('/api/checkout', ...protectBusinessFlow, async (req, res) => {
  // Additional checks
  const recentOrders = await Order.countDocuments({
    userId: req.user.id,
    createdAt: { $gte: new Date(Date.now() - 3600000) }
  });

  if (recentOrders > 3) {
    return res.status(429).json({
      error: 'Too many orders. Please try again later.'
    });
  }

  // Process order
});

// GOOD: Device fingerprinting
app.post('/api/register', async (req, res) => {
  const deviceId = generateDeviceFingerprint(req);

  const recentRegistrations = await User.countDocuments({
    deviceFingerprint: deviceId,
    createdAt: { $gte: new Date(Date.now() - 86400000) }
  });

  if (recentRegistrations > 0) {
    return res.status(429).json({ error: 'Registration limit reached' });
  }

  // Process registration
});
```

---

## API07: Server Side Request Forgery

### Description
SSRF flaws occur when an API fetches a remote resource without validating the user-supplied URL, allowing attackers to access internal services.

### Vulnerable Patterns
```javascript
// BAD: Direct URL fetch
app.post('/api/fetch-url', async (req, res) => {
  const response = await fetch(req.body.url);
  const data = await response.text();
  res.json({ content: data });
});

// BAD: URL in query parameter
app.get('/api/preview', async (req, res) => {
  const image = await fetch(req.query.imageUrl);
  // Could access internal services: http://localhost:6379/
  // Could access cloud metadata: http://169.254.169.254/
});
```

### Secure Pattern
```javascript
// GOOD: URL validation and allowlist
const { URL } = require('url');

const ALLOWED_HOSTS = ['example.com', 'cdn.example.com'];
const BLOCKED_IP_RANGES = [
  '127.0.0.0/8',      // Localhost
  '10.0.0.0/8',       // Private
  '172.16.0.0/12',    // Private
  '192.168.0.0/16',   // Private
  '169.254.0.0/16',   // Link-local (cloud metadata)
  '0.0.0.0/8'         // Invalid
];

const isAllowedUrl = async (urlString) => {
  try {
    const url = new URL(urlString);

    // Protocol check
    if (!['http:', 'https:'].includes(url.protocol)) {
      return false;
    }

    // Hostname allowlist
    if (!ALLOWED_HOSTS.includes(url.hostname)) {
      return false;
    }

    // DNS resolution to prevent DNS rebinding
    const addresses = await dns.promises.resolve(url.hostname);
    for (const addr of addresses) {
      if (isPrivateIP(addr)) {
        return false;
      }
    }

    return true;
  } catch {
    return false;
  }
};

app.post('/api/fetch-url', async (req, res) => {
  if (!await isAllowedUrl(req.body.url)) {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  const response = await fetch(req.body.url, {
    timeout: 5000,
    redirect: 'error' // Don't follow redirects
  });

  res.json({ content: await response.text() });
});
```

---

## API08: Security Misconfiguration

### Description
APIs and supporting systems often have complex configurations. Misconfigurations can expose the API to attacks.

### Security Headers
```javascript
// GOOD: Proper security headers for APIs
app.use((req, res, next) => {
  // Prevent MIME sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Prevent caching of sensitive responses
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Pragma', 'no-cache');

  // CORS configuration
  res.setHeader('Access-Control-Allow-Origin', 'https://app.example.com');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  next();
});

// GOOD: CORS with proper configuration
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = ['https://app.example.com', 'https://admin.example.com'];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  maxAge: 86400
};

app.use(cors(corsOptions));
```

### Error Handling
```javascript
// GOOD: Safe error responses
app.use((err, req, res, next) => {
  console.error(err); // Log full error server-side

  // Generic error for clients
  res.status(err.status || 500).json({
    error: {
      message: err.expose ? err.message : 'Internal server error',
      code: err.code || 'INTERNAL_ERROR'
    }
  });
});
```

---

## API09: Improper Inventory Management

### Description
APIs tend to expose more endpoints than traditional web applications. Proper documentation and inventory are essential.

### Best Practices
```yaml
# OpenAPI specification
openapi: 3.0.3
info:
  title: My API
  version: 1.0.0

servers:
  - url: https://api.example.com/v1
    description: Production
  - url: https://api-staging.example.com/v1
    description: Staging

paths:
  /users:
    get:
      summary: List users
      security:
        - bearerAuth: []
      responses:
        '200':
          description: Success

# Version deprecation
x-deprecated-versions:
  - version: v0
    sunset: 2025-01-01
```

### Implementation
```javascript
// GOOD: Version management
app.use('/api/v1', v1Router);
app.use('/api/v2', v2Router);

// Deprecation headers
app.use('/api/v1', (req, res, next) => {
  res.setHeader('Deprecation', 'true');
  res.setHeader('Sunset', 'Sat, 01 Jan 2025 00:00:00 GMT');
  res.setHeader('Link', '</api/v2>; rel="successor-version"');
  next();
});

// API documentation endpoint
app.get('/api/docs', (req, res) => {
  res.json(openApiSpec);
});
```

---

## API10: Unsafe Consumption of APIs

### Description
Developers tend to trust data from third-party APIs more than user input. Attackers may compromise third-party services to attack your API.

### Vulnerable Patterns
```javascript
// BAD: Trusting third-party response
app.post('/api/process-payment', async (req, res) => {
  const paymentResult = await paymentGateway.process(req.body);

  // Directly trusting and storing third-party data
  await Order.update(orderId, {
    status: paymentResult.status,
    metadata: paymentResult.metadata // Could contain malicious data
  });
});
```

### Secure Pattern
```javascript
// GOOD: Validate third-party responses
const paymentResultSchema = Joi.object({
  transactionId: Joi.string().uuid().required(),
  status: Joi.string().valid('success', 'failed', 'pending').required(),
  amount: Joi.number().positive().required(),
  currency: Joi.string().length(3).required()
});

app.post('/api/process-payment', async (req, res) => {
  const paymentResult = await paymentGateway.process(req.body);

  // Validate third-party response
  const { error, value } = paymentResultSchema.validate(paymentResult);
  if (error) {
    console.error('Invalid payment gateway response', error);
    return res.status(500).json({ error: 'Payment processing failed' });
  }

  await Order.update(orderId, {
    status: value.status,
    transactionId: value.transactionId
  });
});

// GOOD: Use timeouts and circuit breakers
const circuitBreaker = new CircuitBreaker(paymentGateway.process, {
  timeout: 5000,
  errorThresholdPercentage: 50,
  resetTimeout: 30000
});

// GOOD: Verify webhooks
app.post('/webhooks/payment', (req, res) => {
  const signature = req.headers['x-signature'];
  const isValid = verifyWebhookSignature(req.body, signature, WEBHOOK_SECRET);

  if (!isValid) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  // Process webhook
});
```

---

## Best Practices

### Transport Security
```javascript
// Always use HTTPS
// Implement HSTS
app.use((req, res, next) => {
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

// Mutual TLS for sensitive APIs
const https = require('https');
const server = https.createServer({
  key: fs.readFileSync('server-key.pem'),
  cert: fs.readFileSync('server-cert.pem'),
  ca: fs.readFileSync('ca-cert.pem'),
  requestCert: true,
  rejectUnauthorized: true
}, app);
```

### Input Validation
```javascript
// Validate all inputs
const createUserSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  email: Joi.string().email().required(),
  age: Joi.number().integer().min(0).max(150)
});

// Content-Type validation
app.use((req, res, next) => {
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    if (!req.is('application/json')) {
      return res.status(415).json({ error: 'Unsupported Media Type' });
    }
  }
  next();
});
```

### Logging
```javascript
// Log security-relevant events
const securityLogger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [new winston.transports.File({ filename: 'security.log' })]
});

app.use((req, res, next) => {
  securityLogger.info({
    type: 'api_request',
    method: req.method,
    path: req.path,
    ip: req.ip,
    userId: req.user?.id,
    timestamp: new Date().toISOString()
  });
  next();
});
```
