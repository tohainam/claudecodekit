# Documentation Templates

## Table of Contents
1. [README Templates](#readme-templates)
2. [API Endpoint Documentation](#api-endpoint-documentation)
3. [Function/Method Documentation](#functionmethod-documentation)
4. [Component Documentation](#component-documentation)
5. [Database Documentation](#database-documentation)
6. [Configuration Documentation](#configuration-documentation)
7. [Runbook/Operations Documentation](#runbookoperations-documentation)
8. [Changelog Templates](#changelog-templates)
9. [Troubleshooting Guide](#troubleshooting-guide)

---

## README Templates

### Minimal README
```markdown
# Project Name

Brief description of what this project does.

## Quick Start

\`\`\`bash
# Installation
npm install project-name

# Usage
npx project-name --help
\`\`\`

## License

MIT
```

### Standard README
```markdown
# Project Name

[![Build Status](badge-url)](ci-url)
[![npm version](badge-url)](npm-url)

One-paragraph description of the project, what problem it solves, and who it's for.

## Features

- Feature 1: Brief description
- Feature 2: Brief description
- Feature 3: Brief description

## Installation

\`\`\`bash
npm install project-name
# or
yarn add project-name
\`\`\`

## Quick Start

\`\`\`javascript
import { something } from 'project-name';

const result = something({ option: 'value' });
console.log(result);
\`\`\`

## Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `option1` | `string` | `'default'` | What this option does |
| `option2` | `boolean` | `false` | What this option does |

## API Reference

See [API Documentation](./docs/api.md) for complete reference.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## License

[MIT](./LICENSE)
```

### Comprehensive README (Large Projects)
```markdown
# Project Name

[![Build](badge)](url) [![Coverage](badge)](url) [![Docs](badge)](url)

> Tagline: One sentence describing the project's value proposition.

[Documentation](url) | [Demo](url) | [Discord](url)

## Overview

2-3 paragraphs explaining:
- What the project does
- Why it exists (problem it solves)
- Who should use it

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Documentation](#documentation)
- [Examples](#examples)
- [Architecture](#architecture)
- [Contributing](#contributing)
- [Roadmap](#roadmap)
- [License](#license)

## Features

### Core Features
- **Feature Name**: Description with benefit
- **Feature Name**: Description with benefit

### Integrations
- Integration 1
- Integration 2

## Installation

### Prerequisites
- Node.js >= 18
- PostgreSQL >= 14

### Install via npm
\`\`\`bash
npm install project-name
\`\`\`

### Install via Docker
\`\`\`bash
docker pull project/name:latest
\`\`\`

## Quick Start

Step-by-step guide to get running in <5 minutes.

## Documentation

| Resource | Description |
|----------|-------------|
| [Getting Started](url) | First-time setup guide |
| [API Reference](url) | Complete API documentation |
| [Examples](url) | Code examples and tutorials |
| [FAQ](url) | Frequently asked questions |

## Examples

### Basic Example
\`\`\`javascript
// Code example with comments
\`\`\`

### Advanced Example
\`\`\`javascript
// More complex example
\`\`\`

## Architecture

Brief architecture overview or link to architecture docs.

\`\`\`
┌─────────┐     ┌─────────┐     ┌─────────┐
│ Client  │────▶│   API   │────▶│   DB    │
└─────────┘     └─────────┘     └─────────┘
\`\`\`

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md).

### Development Setup
\`\`\`bash
git clone repo-url
cd project
npm install
npm run dev
\`\`\`

## Roadmap

- [ ] Feature 1 (Q1 2025)
- [ ] Feature 2 (Q2 2025)
- [x] ~~Completed feature~~

## License

[MIT](LICENSE) - Copyright (c) 2025 Author Name
```

---

## API Endpoint Documentation

### REST Endpoint Template
```markdown
## Endpoint Name

Brief description of what this endpoint does.

### Request

\`\`\`
POST /api/v1/resources
\`\`\`

**Headers**
| Header | Required | Description |
|--------|----------|-------------|
| `Authorization` | Yes | Bearer token |
| `Content-Type` | Yes | `application/json` |

**Path Parameters**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | `string` | Resource identifier |

**Query Parameters**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | `integer` | `20` | Max items to return |
| `offset` | `integer` | `0` | Pagination offset |

**Request Body**
\`\`\`json
{
  "name": "string (required)",
  "description": "string (optional)",
  "tags": ["string"]
}
\`\`\`

### Response

**Success (201 Created)**
\`\`\`json
{
  "id": "abc123",
  "name": "Example",
  "createdAt": "2025-01-01T00:00:00Z"
}
\`\`\`

**Errors**
| Status | Code | Description |
|--------|------|-------------|
| 400 | `INVALID_INPUT` | Request body validation failed |
| 401 | `UNAUTHORIZED` | Missing or invalid token |
| 404 | `NOT_FOUND` | Resource not found |
| 429 | `RATE_LIMITED` | Too many requests |

### Example

\`\`\`bash
curl -X POST https://api.example.com/v1/resources \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "My Resource"}'
\`\`\`
```

---

## Function/Method Documentation

### TypeScript/JavaScript (JSDoc)
```typescript
/**
 * Calculates the total price including tax and discounts.
 *
 * @param items - Array of items with price and quantity
 * @param options - Calculation options
 * @param options.taxRate - Tax rate as decimal (default: 0.1)
 * @param options.discountCode - Optional discount code to apply
 * @returns Calculated total with breakdown
 * @throws {ValidationError} When items array is empty
 * @throws {InvalidDiscountError} When discount code is invalid
 *
 * @example
 * ```ts
 * const total = calculateTotal(
 *   [{ price: 100, quantity: 2 }],
 *   { taxRate: 0.08, discountCode: 'SAVE10' }
 * );
 * // Returns: { subtotal: 200, tax: 16, discount: 20, total: 196 }
 * ```
 */
function calculateTotal(
  items: CartItem[],
  options?: CalculationOptions
): TotalBreakdown {
  // implementation
}
```

### Python (Docstrings - Google Style)
```python
def calculate_total(
    items: list[CartItem],
    tax_rate: float = 0.1,
    discount_code: str | None = None
) -> TotalBreakdown:
    """Calculate the total price including tax and discounts.

    Args:
        items: List of items with price and quantity.
        tax_rate: Tax rate as decimal. Defaults to 0.1 (10%).
        discount_code: Optional discount code to apply.

    Returns:
        TotalBreakdown containing subtotal, tax, discount, and total.

    Raises:
        ValidationError: When items list is empty.
        InvalidDiscountError: When discount code is invalid.

    Example:
        >>> total = calculate_total(
        ...     [CartItem(price=100, quantity=2)],
        ...     tax_rate=0.08,
        ...     discount_code='SAVE10'
        ... )
        >>> total.total
        196.0
    """
```

### Go (Godoc)
```go
// CalculateTotal computes the total price including tax and discounts.
//
// Items must not be empty. The taxRate should be a decimal (e.g., 0.1 for 10%).
// If discountCode is provided, it will be validated against active promotions.
//
// Returns ErrEmptyCart if items is empty.
// Returns ErrInvalidDiscount if the discount code is not valid.
//
// Example:
//
//	total, err := CalculateTotal(
//	    []CartItem{{Price: 100, Quantity: 2}},
//	    WithTaxRate(0.08),
//	    WithDiscountCode("SAVE10"),
//	)
//	// total.Total == 196
func CalculateTotal(items []CartItem, opts ...Option) (*TotalBreakdown, error) {
    // implementation
}
```

---

## Component Documentation

### React Component
```markdown
## Button

A versatile button component with multiple variants and states.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'primary' \| 'secondary' \| 'ghost'` | `'primary'` | Visual style |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Button size |
| `disabled` | `boolean` | `false` | Disable interactions |
| `loading` | `boolean` | `false` | Show loading spinner |
| `onClick` | `() => void` | - | Click handler |
| `children` | `ReactNode` | - | Button content |

### Usage

\`\`\`tsx
import { Button } from '@/components/ui';

// Primary button
<Button onClick={handleClick}>Submit</Button>

// Secondary with loading
<Button variant="secondary" loading={isLoading}>
  Save Changes
</Button>

// Ghost button, small
<Button variant="ghost" size="sm">
  Cancel
</Button>
\`\`\`

### Accessibility

- Uses native `<button>` element
- Supports keyboard navigation (Enter/Space)
- `aria-disabled` applied when disabled or loading
- `aria-busy` applied when loading

### Design Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--button-primary-bg` | `blue-600` | Primary background |
| `--button-primary-hover` | `blue-700` | Primary hover |
| `--button-radius` | `8px` | Border radius |
```

---

## Database Documentation

### Table Documentation
```markdown
## users

Stores user account information and authentication data.

### Schema

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | `uuid` | No | `gen_random_uuid()` | Primary key |
| `email` | `varchar(255)` | No | - | Unique email address |
| `password_hash` | `varchar(255)` | No | - | Bcrypt hashed password |
| `display_name` | `varchar(100)` | Yes | `NULL` | User's display name |
| `role` | `user_role` | No | `'user'` | User role enum |
| `email_verified` | `boolean` | No | `false` | Email verification status |
| `created_at` | `timestamptz` | No | `now()` | Record creation time |
| `updated_at` | `timestamptz` | No | `now()` | Last update time |

### Indexes

| Name | Columns | Type | Description |
|------|---------|------|-------------|
| `users_pkey` | `id` | PRIMARY | Primary key |
| `users_email_key` | `email` | UNIQUE | Email uniqueness |
| `users_role_idx` | `role` | BTREE | Role filtering |

### Relations

| Table | Type | Foreign Key | Description |
|-------|------|-------------|-------------|
| `user_sessions` | 1:N | `user_id` | Active sessions |
| `user_preferences` | 1:1 | `user_id` | User settings |
| `organizations` | N:M | via `org_members` | Organization membership |

### Example Queries

\`\`\`sql
-- Find user by email
SELECT id, display_name, role, email_verified
FROM users
WHERE email = 'user@example.com';

-- Get users with org membership
SELECT u.*, array_agg(o.name) as organizations
FROM users u
LEFT JOIN org_members om ON om.user_id = u.id
LEFT JOIN organizations o ON o.id = om.org_id
GROUP BY u.id;
\`\`\`
```

---

## Configuration Documentation

### Environment Variables
```markdown
## Environment Variables

### Required

| Variable | Type | Description |
|----------|------|-------------|
| `DATABASE_URL` | `string` | PostgreSQL connection string |
| `JWT_SECRET` | `string` | Secret for signing JWTs (min 32 chars) |
| `REDIS_URL` | `string` | Redis connection string |

### Optional

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `PORT` | `number` | `3000` | HTTP server port |
| `LOG_LEVEL` | `string` | `'info'` | Logging level: debug, info, warn, error |
| `CORS_ORIGINS` | `string` | `'*'` | Comma-separated allowed origins |
| `RATE_LIMIT_MAX` | `number` | `100` | Max requests per window |
| `RATE_LIMIT_WINDOW` | `number` | `60000` | Rate limit window in ms |

### Example .env

\`\`\`bash
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/myapp

# Authentication
JWT_SECRET=your-super-secret-key-at-least-32-characters

# Redis
REDIS_URL=redis://localhost:6379

# Server
PORT=3000
LOG_LEVEL=debug

# Security
CORS_ORIGINS=http://localhost:3001,https://myapp.com
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=60000
\`\`\`

### Validation

Environment variables are validated at startup using Zod schema.
Missing required variables will cause the application to exit with error code 1.
```

---

## Runbook/Operations Documentation

### Runbook Template
```markdown
# Runbook: [Service/Task Name]

## Overview
Brief description of what this runbook covers.

## Prerequisites
- Access to: AWS Console, kubectl, PagerDuty
- Permissions: admin role on production cluster
- Tools: aws-cli, kubectl, jq

## Procedures

### 1. Normal Operations

#### Starting the Service
\`\`\`bash
kubectl scale deployment myapp --replicas=3
\`\`\`

#### Stopping the Service
\`\`\`bash
kubectl scale deployment myapp --replicas=0
\`\`\`

### 2. Incident Response

#### High CPU Alert
1. Check current CPU usage:
   \`\`\`bash
   kubectl top pods -l app=myapp
   \`\`\`
2. Check for stuck requests:
   \`\`\`bash
   kubectl logs -l app=myapp --since=5m | grep -i timeout
   \`\`\`
3. If > 90% CPU for > 5 min, scale horizontally:
   \`\`\`bash
   kubectl scale deployment myapp --replicas=5
   \`\`\`

#### Database Connection Errors
1. Verify database is accessible:
   \`\`\`bash
   psql $DATABASE_URL -c "SELECT 1"
   \`\`\`
2. Check connection pool status:
   \`\`\`bash
   curl localhost:3000/health/db
   \`\`\`
3. Restart pods if pool is exhausted:
   \`\`\`bash
   kubectl rollout restart deployment myapp
   \`\`\`

## Rollback Procedures

### Code Rollback
\`\`\`bash
# Get previous revision
kubectl rollout history deployment myapp

# Rollback to previous
kubectl rollout undo deployment myapp

# Rollback to specific revision
kubectl rollout undo deployment myapp --to-revision=3
\`\`\`

## Contacts
| Role | Contact | Escalation |
|------|---------|------------|
| On-call | PagerDuty | @oncall-primary |
| Database | @db-team | Slack #db-support |
| Platform | @platform-team | Slack #platform |
```

---

## Changelog Templates

### Keep a Changelog Format
```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- New feature description

### Changed
- Changed behavior description

### Deprecated
- Soon-to-be removed feature

### Removed
- Removed feature description

### Fixed
- Bug fix description

### Security
- Security fix description

## [1.0.0] - 2025-01-15

### Added
- Initial release
- Core functionality X
- Core functionality Y

[Unreleased]: https://github.com/user/repo/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/user/repo/releases/tag/v1.0.0
```

---

## Troubleshooting Guide

### Troubleshooting Template
```markdown
# Troubleshooting Guide

## Common Issues

### Issue: Connection Refused

**Symptoms:**
- Error message: `ECONNREFUSED 127.0.0.1:5432`
- Application fails to start

**Causes:**
1. Database not running
2. Wrong port configuration
3. Firewall blocking connection

**Solutions:**

1. **Check if database is running:**
   \`\`\`bash
   docker ps | grep postgres
   # or
   systemctl status postgresql
   \`\`\`

2. **Verify connection string:**
   \`\`\`bash
   echo $DATABASE_URL
   # Should match: postgresql://user:pass@host:port/db
   \`\`\`

3. **Test direct connection:**
   \`\`\`bash
   psql $DATABASE_URL -c "SELECT 1"
   \`\`\`

---

### Issue: Memory Leak

**Symptoms:**
- Gradual memory increase over time
- OOMKilled events in container logs
- Performance degradation after extended uptime

**Diagnosis:**
\`\`\`bash
# Check memory usage
kubectl top pods -l app=myapp

# Get heap snapshot (Node.js)
kill -USR2 <pid>
\`\`\`

**Solutions:**
1. Check for unclosed connections/streams
2. Review event listeners for cleanup
3. Implement memory limits and auto-restart
```
