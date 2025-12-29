# Rules Templates Reference

This reference provides complete rule templates for all supported tech stacks, organized by folder structure. Use these templates during Step 4 of the project analysis workflow to generate recommendations.

## Mixed Folder Structure

Rules are organized into folders for better organization:

```
.claude/rules/
├── _global/          # Universal rules (no paths, apply to all files)
├── frontend/      # Frontend-specific rules with component/page paths
├── backend/       # Backend-specific rules with API/service paths
├── devops/        # Infrastructure rules with Docker/CI paths
├── testing/       # Testing rules with test file paths
└── security/      # Security rules (some universal, some specific)
```

## Frontmatter Format

All rules use YAML frontmatter with single-line `paths` field:

```yaml
---
paths: glob-pattern-1, glob-pattern-2, glob-pattern-3
---
```

**Format rules:**
- Single line, comma-separated
- Use brace expansion: `**/*.{ts,tsx,js,jsx}`
- Global rules have no `paths` field (apply to all files)
- Specific rules have targeted paths

## Template Usage Guide

### Template Hierarchy

When generating recommendations, follow this priority order:

1. **User custom templates** (if `.claude/custom-templates/` exists) - highest priority
2. **Built-in templates** (this file) - standard templates
3. **Generic structure** (fallback) - basic YAML + markdown

### Customization Guidelines

Templates should be customized with:
- **Actual project paths** from structure analysis
- **Detected framework versions** for accurate patterns
- **Project-specific patterns** found during analysis

### Path Placeholder Replacement

Replace these placeholders with actual paths from project analysis:

| Placeholder | Example Replacement | How to Detect |
|-------------|---------------------|---------------|
| `[COMPONENT_PATHS]` | `src/components/**/*.tsx, app/components/**/*.tsx` | Find component directories in structure |
| `[PAGES_PATHS]` | `app/**/page.tsx, pages/**/*.tsx` | Next.js app/ or pages/ directory |
| `[API_PATHS]` | `src/routes/**/*.ts, app/api/**/*.ts` | API route directories |
| `[MIDDLEWARE_PATHS]` | `src/middleware/**/*.ts` | Middleware directory |
| `[DB_PATHS]` | `prisma/**, src/models/**/*.ts` | ORM schema or model directories |
| `[TEST_PATHS]` | `**/*.test.ts, **/*.spec.ts, tests/**` | Test file patterns from config |

### When to Recommend

Use the Tech-to-Rules Mapping Table at the end of this file to determine which rules to recommend based on detected technologies.

## Global Rules (_global/ folder)

Global rules apply to all files and have no `paths` field in frontmatter.

### _global/code-style.md Template

**Location**: `.claude/rules/_global/code-style.md`
**Recommend for**: All projects
**Frontmatter**: No paths field (applies to all files)

```markdown
---
# No paths field - applies to all files
---

# Code Style Rules

Project-specific coding standards and conventions.

## General Principles

- Write code for humans first, machines second
- Prefer clarity over cleverness
- Keep it simple (KISS principle)
- Don't repeat yourself (DRY principle)
- You aren't gonna need it (YAGNI principle)

## Language-Specific Standards

### [DETECTED_LANGUAGE] Conventions

[Customize based on detected language:]

**For TypeScript/JavaScript:**
- Use TypeScript for all new code
- Prefer `const` over `let`, avoid `var`
- Use async/await over promises chains
- Enable strict mode in tsconfig.json

**For Python:**
- Follow PEP 8 style guide
- Use type hints for function signatures
- Prefer f-strings for string formatting
- Maximum line length: 88 characters (Black formatter)

**For Go:**
- Follow effective Go guidelines
- Use gofmt for formatting
- Prefer early returns over deep nesting
- Keep functions small and focused

## Naming Conventions

- **Variables**: camelCase (JS/TS), snake_case (Python/Go)
- **Functions**: descriptive verb + noun (getUserById, calculate_total)
- **Classes/Types**: PascalCase (UserService, PaymentProcessor)
- **Constants**: SCREAMING_SNAKE_CASE (MAX_RETRIES, API_BASE_URL)
- **Files**: kebab-case or snake_case based on language convention

## File Organization

- Group related functionality together
- Keep files focused on single responsibility
- Maximum file length: 300 lines (consider splitting if larger)
- Organize imports: external, internal, relative

## Comments & Documentation

- Write self-documenting code (clear names over comments)
- Comment WHY, not WHAT
- Document complex algorithms
- Keep comments up-to-date with code changes
- Use JSDoc/docstrings for public APIs

## Error Handling

- Fail fast and fail loudly
- Provide meaningful error messages
- Log errors with sufficient context
- Don't catch errors you can't handle
- Always validate inputs

## Code Quality Checks

Run before committing:
- Linter: [DETECTED_LINTER - ESLint, Ruff, golangci-lint, etc.]
- Formatter: [DETECTED_FORMATTER - Prettier, Black, gofmt, etc.]
- Type checker: [DETECTED_TYPE_CHECKER - TypeScript, mypy, etc.]
- Tests: [DETECTED_TEST_FRAMEWORK]
```

### _global/git-workflow.md Template

**Location**: `.claude/rules/_global/git-workflow.md`
**Recommend for**: All projects with .git directory
**Frontmatter**: No paths field (applies to all files)

```markdown
---
# No paths field - applies to all files
---

# Git Workflow Rules

Git commit, branch, and pull request conventions for this project.

## Branch Naming

- **Feature**: `feature/short-description` or `feat/short-description`
- **Bug fix**: `fix/issue-description` or `bugfix/issue-123`
- **Hotfix**: `hotfix/critical-issue`
- **Refactor**: `refactor/what-is-refactored`
- **Docs**: `docs/what-is-documented`

## Commit Messages

Follow conventional commits format:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style (formatting, missing semicolons, etc.)
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `perf`: Performance improvement
- `test`: Adding or updating tests
- `chore`: Maintenance tasks, dependencies

**Examples:**
```
feat(auth): add JWT authentication
fix(api): resolve race condition in user creation
docs(readme): update installation instructions
```

## Pull Request Process

1. Create feature branch from main/develop
2. Make atomic commits with clear messages
3. Keep PRs small (< 400 lines if possible)
4. Write descriptive PR title and description
5. Link related issues
6. Request review from relevant team members
7. Address review comments
8. Squash commits if needed before merge

## Protected Operations

**Always get approval before:**
- Force pushing to shared branches
- Deleting remote branches
- Rebasing shared commits
- Modifying Git history

## Pre-commit Checklist

- [ ] Code lints without errors
- [ ] All tests pass
- [ ] No debug code (console.log, print, etc.)
- [ ] No sensitive data in commit
- [ ] Commit message follows convention
```

## Frontend Rules (frontend/ folder)

Frontend rules target component, page, and UI-specific files.

### frontend/components.md Template

**Location**: `.claude/rules/frontend/components.md`
**Recommend for**: React, Vue, Angular, Svelte projects
**Frontmatter**: Component paths (customize based on project structure)

Customize `[FRAMEWORK]` and `[COMPONENT_PATHS]` based on detection.

```markdown
---
paths: [COMPONENT_PATHS]
---
# Example paths:
# paths: src/components/**/*.{tsx,ts}, app/components/**/*.{tsx,ts}
# paths: src/components/**/*.vue
# paths: src/app/**/*.component.ts

# Component Development Rules

Guidelines for building [FRAMEWORK] components in this project.

## Component Structure

[For React/Next.js:]
```tsx
// PreferredPattern.tsx
import { FC } from 'react'

interface PreferredPatternProps {
  // Props with clear types
}

export const PreferredPattern: FC<PreferredPatternProps> = ({ props }) => {
  // Hooks at top
  // Event handlers
  // Render logic
  return <div>...</div>
}
```

[For Vue:]
```vue
<!-- PreferredPattern.vue -->
<script setup lang="ts">
// Composables and logic
</script>

<template>
  <!-- Template -->
</template>

<style scoped>
/* Scoped styles */
</style>
```

## Naming Conventions

- **Component files**: PascalCase (Button.tsx, UserCard.vue)
- **Component names**: Match file name
- **Props interfaces**: ComponentNameProps
- **Event handlers**: handle[Event] (handleClick, handleSubmit)

## Component Organization

```
components/
├── ui/              # Reusable UI components (Button, Input, Card)
├── features/        # Feature-specific components
├── layouts/         # Layout components (Header, Footer, Sidebar)
└── common/          # Shared components
```

## Best Practices

### Composition Over Complexity
- Keep components small and focused
- Extract reusable logic to hooks/composables
- Use composition for shared behavior

### Props Design
- Keep props interface minimal
- Use TypeScript for prop validation
- Provide sensible defaults
- Document complex props

### State Management
- Use local state when possible
- Lift state only when necessary
- [If Redux/Zustand/Pinia detected]: Use [STORE] for global state

### Performance
- Memoize expensive calculations
- Use React.memo/computed for optimization (when profiled)
- Lazy load heavy components
- Optimize re-renders

### Accessibility
- Use semantic HTML
- Include ARIA labels where needed
- Support keyboard navigation
- Test with screen readers

## Testing Components

[If testing framework detected:]
- Write tests for user interactions
- Test component props variations
- Mock external dependencies
- Aim for > 70% coverage on critical components
```

### frontend/pages.md Template

**Location**: `.claude/rules/frontend/pages.md`
**Recommend for**: Next.js, Nuxt, SvelteKit (routing frameworks)
**Frontmatter**: Page/route paths (customize based on framework)

```markdown
---
paths: [PAGES_PATHS]
---
# Example paths:
# Next.js App Router: app/**/page.tsx, app/**/layout.tsx, app/**/loading.tsx, app/**/error.tsx
# Next.js Pages Router: pages/**/*.{tsx,ts}
# Nuxt: pages/**/*.vue
# SvelteKit: src/routes/**/*.svelte

# Pages & Routing Rules

Guidelines for [FRAMEWORK] page components and routing.

## Page Structure

[For Next.js App Router:]
- Use Server Components by default
- Add 'use client' only when needed (interactivity, hooks)
- Colocate page.tsx, loading.tsx, error.tsx
- Use route groups for organization: (auth), (dashboard)

[For Next.js Pages Router:]
- One page per file in pages/ directory
- Use getServerSideProps or getStaticProps for data
- Dynamic routes: [id].tsx, [...slug].tsx

## Data Fetching

- Fetch data at highest level possible
- Use Suspense boundaries for loading states
- Handle errors with error boundaries
- Cache appropriately (revalidate for fresh data)

## SEO & Metadata

- Add metadata to all pages
- Use descriptive titles and descriptions
- Include OpenGraph tags for social sharing
- Set appropriate canonical URLs

## Performance

- Use Image component for images
- Lazy load below-the-fold content
- Minimize client-side JavaScript
- Optimize fonts with next/font
```

## Backend Rules (backend/ folder)

Backend rules target API routes, services, and server-side code.

### backend/api.md Template

**Location**: `.claude/rules/backend/api.md`
**Recommend for**: Express, Fastify, Django, Flask, FastAPI, Gin projects
**Frontmatter**: API route paths (customize based on framework)

```markdown
---
paths: [API_PATHS]
---
# Example paths:
# Express/Fastify: src/routes/**/*.{ts,js}, src/api/**/*.{ts,js}
# Next.js: app/api/**/*.ts, pages/api/**/*.ts
# FastAPI: app/routers/**/*.py, app/api/**/*.py
# Django: */views.py, */urls.py
# Flask: app/routes/**/*.py
# Gin (Go): internal/handlers/**/*.go, internal/routes/**/*.go

# API Development Rules

Guidelines for building [FRAMEWORK] APIs in this project.

## API Structure

[For Express/Fastify:]
```typescript
// routes/users.ts
import { Router } from 'express'

const router = Router()

router.get('/', async (req, res, next) => {
  try {
    // Logic
    res.json(data)
  } catch (error) {
    next(error)
  }
})

export default router
```

[For FastAPI:]
```python
# routers/users.py
from fastapi import APIRouter, Depends

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/")
async def get_users():
    # Logic
    return data
```

## Endpoint Design

### RESTful Conventions
- GET: Retrieve resources (idempotent)
- POST: Create resources
- PUT/PATCH: Update resources
- DELETE: Remove resources

### URL Structure
- Use nouns, not verbs: `/users` not `/getUsers`
- Nested resources: `/users/:id/posts`
- Query params for filtering: `/users?role=admin`
- Versioning: `/api/v1/users` or via headers

## Request Validation

- Validate all inputs (body, query, params)
- Use schema validation ([Zod, Joi, Pydantic])
- Return clear validation errors (400 Bad Request)
- Sanitize inputs to prevent injection

## Response Format

### Success Response
```json
{
  "data": {...},
  "meta": {
    "page": 1,
    "total": 100
  }
}
```

### Error Response
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": [...]
  }
}
```

## Error Handling

- Use appropriate HTTP status codes
- Log errors with context (request ID, user, timestamp)
- Never expose internal errors to clients
- Implement global error handler

## Authentication & Authorization

[If auth system detected:]
- Authenticate requests with [DETECTED_AUTH_SYSTEM]
- Check permissions before executing actions
- Use middleware for route protection
- Include user context in requests

## Performance

- Implement pagination for list endpoints
- Use database indexes for common queries
- Cache frequently accessed data
- Rate limit endpoints to prevent abuse

## Testing APIs

[If test framework detected:]
- Write integration tests for endpoints
- Test success and error cases
- Mock external services
- Aim for > 80% coverage on API routes
```

### backend/middleware.md Template

**Location**: `.claude/rules/backend/middleware.md`
**Recommend for**: Express, Fastify, Django projects with middleware patterns
**Frontmatter**: Middleware paths (customize based on framework)

```markdown
---
paths: [MIDDLEWARE_PATHS]
---
# Example paths:
# Express/Fastify: src/middleware/**/*.{ts,js}
# Next.js: middleware.ts, src/middleware.ts
# Django: */middleware.py
# FastAPI: app/middleware/**/*.py

# Middleware Rules

Guidelines for creating and using middleware in [FRAMEWORK].

## Middleware Order

Critical order for Express/Fastify:
1. Logging middleware
2. Security middleware (helmet, cors)
3. Body parsing
4. Authentication
5. Authorization
6. Route handlers
7. Error handling (last)

## Common Middleware Patterns

### Authentication Middleware
```typescript
export const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) throw new Error('No token')
    req.user = await verifyToken(token)
    next()
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized' })
  }
}
```

### Authorization Middleware
```typescript
export const authorize = (...roles: string[]) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' })
    }
    next()
  }
}
```

## Best Practices

- Keep middleware focused (single responsibility)
- Always call next() or send response
- Handle errors appropriately
- Make middleware reusable and composable
- Document middleware behavior
```

### backend/database.md Template

**Location**: `.claude/rules/backend/database.md`
**Recommend for**: Projects with Prisma, TypeORM, Drizzle, SQLAlchemy, GORM
**Frontmatter**: Database schema/model paths (customize based on ORM)

```markdown
---
paths: [DB_PATHS]
---
# Example paths:
# Prisma: prisma/schema.prisma, prisma/migrations/**
# TypeORM: src/models/**/*.{ts,js}, src/entities/**/*.{ts,js}
# Drizzle: src/db/**/*.{ts,js}
# SQLAlchemy: app/models/**/*.py
# Django ORM: */models.py
# GORM: internal/models/**/*.go

# Database Rules

Guidelines for database interactions using [DETECTED_ORM].

## Schema Design

- Use descriptive table/model names (users, posts, comments)
- Define relationships clearly (one-to-many, many-to-many)
- Add indexes on frequently queried fields
- Use appropriate data types
- Include created_at, updated_at timestamps

[For Prisma:]
```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  posts     Post[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## Query Patterns

### Efficient Queries
- Select only needed fields
- Use includes/joins wisely (avoid N+1)
- Paginate large result sets
- Use transactions for related operations

### Query Examples
[For Prisma:]
```typescript
// Good: Select specific fields
const users = await prisma.user.findMany({
  select: { id: true, email: true }
})

// Good: Include relations efficiently
const user = await prisma.user.findUnique({
  where: { id },
  include: { posts: true }
})
```

## Migrations

- Never edit migrations directly
- Review migrations before applying
- Test migrations in development first
- Always have rollback strategy
- Keep migrations small and focused

## Best Practices

- Use prepared statements (ORM handles this)
- Validate data before database operations
- Handle unique constraint violations gracefully
- Use database transactions for consistency
- Log slow queries for optimization
- Never store sensitive data in plain text

## Connection Management

- Use connection pooling
- Close connections properly
- Handle connection errors
- Monitor connection usage
```

## Security Rules (security/ folder)

Security rules include both universal guidelines and auth-specific patterns.

### security/security.md Template

**Location**: `.claude/rules/security/security.md`
**Recommend for**: Projects with authentication systems
**Frontmatter**: No paths field (universal security guidelines)

```markdown
---
# No paths field - security applies to all files
---

# Security Rules

Security best practices for [PROJECT_TYPE] with [DETECTED_AUTH].

## Authentication

[Customize based on detected auth system:]

**For NextAuth/Auth.js:**
- Configure providers in auth config
- Protect API routes with getServerSession
- Use callbacks for session customization
- Store sensitive config in environment variables

**For JWT:**
- Use strong secret keys (min 256 bits)
- Set appropriate expiration times
- Validate tokens on every request
- Implement token refresh mechanism

## Authorization

- Implement role-based access control (RBAC)
- Check permissions at API level, not just UI
- Use principle of least privilege
- Validate user permissions before actions

## Input Validation

- Validate all user inputs
- Sanitize data before database operations
- Use parameterized queries (prevent SQL injection)
- Escape output to prevent XSS
- Validate file uploads (type, size, content)

## Sensitive Data

### Never Commit
- API keys and secrets
- Database credentials
- Private keys
- OAuth client secrets

### Use Environment Variables
```env
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="..."
API_KEY="..."
```

### Secure Storage
- Hash passwords with bcrypt/argon2
- Encrypt sensitive data at rest
- Use HTTPS for data in transit
- Implement secure session management

## OWASP Top 10 Protection

1. **Injection**: Use ORMs, parameterized queries
2. **Broken Auth**: Strong password policy, MFA
3. **Sensitive Data**: Encryption, HTTPS only
4. **XXE**: Disable XML external entities
5. **Broken Access**: Server-side authz checks
6. **Security Misconfig**: Secure defaults, updates
7. **XSS**: Input validation, output encoding
8. **Insecure Deserialization**: Validate before deserialize
9. **Using Components with Known Vulnerabilities**: Regular updates
10. **Insufficient Logging**: Log security events

## API Security

- Implement rate limiting
- Use CORS appropriately
- Validate content-type headers
- Set security headers (CSP, HSTS, X-Frame-Options)
- Implement request signing for sensitive operations
```

## Testing Rules (testing/ folder)

Testing rules target test files and test-related code.

### testing/testing.md Template

**Location**: `.claude/rules/testing/testing.md`
**Recommend for**: Projects with Jest, Vitest, Pytest, etc.
**Frontmatter**: Test file paths (customize based on framework conventions)

```markdown
---
paths: [TEST_PATHS]
---
# Example paths:
# Jest/Vitest: **/*.test.{ts,tsx,js,jsx}, **/*.spec.{ts,tsx,js,jsx}
# Pytest: tests/**/*.py, **/*_test.py
# Go: **/*_test.go
# Java: **/src/test/**/*.java
# Ruby: spec/**/*_spec.rb

# Testing Rules

Testing guidelines for [DETECTED_TEST_FRAMEWORK].

## Test Structure (AAA Pattern)

```typescript
describe('UserService', () => {
  describe('createUser', () => {
    it('creates user with valid data', async () => {
      // Arrange
      const userData = { email: 'test@example.com', name: 'Test' }

      // Act
      const user = await userService.createUser(userData)

      // Assert
      expect(user).toBeDefined()
      expect(user.email).toBe(userData.email)
    })
  })
})
```

## What to Test

### Unit Tests (Most)
- Business logic functions
- Utility functions
- Data transformations
- Edge cases and error handling

### Integration Tests (Some)
- API endpoints
- Database operations
- External service interactions

### E2E Tests (Few)
- Critical user flows
- Authentication flow
- Checkout process

## Test Quality

- One assertion concept per test
- Use descriptive test names
- Test behavior, not implementation
- Keep tests independent (no shared state)
- Mock external dependencies

## Coverage Guidelines

- Aim for > 80% on business logic
- Focus on critical paths
- Don't obsess over 100% coverage
- Ignore generated code

## Running Tests

```bash
# Run all tests
[npm test / pytest / go test]

# Run with coverage
[npm test -- --coverage / pytest --cov / go test -cover]

# Run specific test
[npm test UserService / pytest tests/test_user.py / go test ./user]
```
```

## DevOps Rules (devops/ folder)

DevOps rules target infrastructure and deployment configuration.

### devops/docker.md Template

**Location**: `.claude/rules/devops/docker.md`
**Recommend for**: Projects with Dockerfile
**Frontmatter**: Docker-related file paths

```markdown
---
paths: **/Dockerfile, **/docker-compose.yml, **/docker-compose.*.yml, **/.dockerignore
---

# Docker Rules

Guidelines for containerization in this project.

## Dockerfile Best Practices

- Use official base images
- Use specific tags, not `latest`
- Minimize layers (combine RUN commands)
- Use multi-stage builds
- Copy only necessary files
- Use .dockerignore

### Example Multi-stage Build
```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

## Docker Compose

- Use version 3.8+
- Define services clearly
- Use environment variables
- Set resource limits
- Include health checks

## Security

- Run as non-root user
- Scan images for vulnerabilities
- Keep base images updated
- Don't include secrets in images
```

### devops/ci.md Template

**Location**: `.claude/rules/devops/ci.md`
**Recommend for**: Projects with GitHub Actions, GitLab CI, etc.
**Frontmatter**: CI/CD configuration paths

```markdown
---
paths: .github/workflows/**/*.{yml,yaml}, .gitlab-ci.yml, .circleci/config.yml, azure-pipelines.yml, Jenkinsfile
---

# CI/CD Rules

Continuous Integration and Deployment guidelines.

## Pipeline Structure

Typical stages:
1. **Lint**: Code style checks
2. **Test**: Run test suite
3. **Build**: Compile/bundle application
4. **Deploy**: Deploy to environment

## GitHub Actions Example

```yaml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint
      - run: npm test
      - run: npm run build
```

## Best Practices

- Run tests on every PR
- Block merge on test failure
- Cache dependencies
- Use matrix builds for multiple versions
- Separate build and deploy stages
- Keep secrets in environment variables
```

## Monorepo Rules (Special Case)

Monorepo rules apply to all files and workspace configuration.

### _global/monorepo.md Template

**Location**: `.claude/rules/_global/monorepo.md`
**Recommend for**: Projects with nx.json, turbo.json, or workspace config
**Frontmatter**: No paths field (applies to monorepo organization overall)

```markdown
---
# No paths field - monorepo organization applies to all workspaces
---

# Monorepo Organization Rules

Guidelines for working in this [DETECTED_MONOREPO_TOOL] monorepo.

## Workspace Structure

```
├── apps/              # Deployable applications
│   ├── web/          # [DETECTED_FRAMEWORK - e.g., Next.js]
│   └── api/          # [DETECTED_FRAMEWORK - e.g., Express]
├── packages/         # Shared packages
│   ├── ui/           # Component library
│   ├── config/       # Shared configs
│   └── utils/        # Shared utilities
└── tools/            # Build tools and scripts
```

## Dependency Management

- Use workspace protocol for internal deps
- Hoist common dependencies
- Version packages together
- Run `[pnpm install / npm install]` at root

## Code Sharing

- Extract shared code to packages/
- Use clear package boundaries
- Export only public APIs
- Document package interfaces

## Building & Testing

```bash
# Build all workspaces
[turbo build / nx build / pnpm -r build]

# Build specific workspace
[turbo build --filter=web / nx build web]

# Test all
[turbo test / nx test / pnpm -r test]
```

## Workspace-Specific Rules

Different workspaces may have different tech stacks. See:
- apps/web: [Link to web-specific rules]
- apps/api: [Link to api-specific rules]
```

## Tech-to-Rules Mapping Table

Use this table to determine which rules to recommend based on detected technologies. All paths should be customized with actual project structure.

| Detected Technology | Recommended Rules | Folder Location | Example Paths |
|---------------------|-------------------|----------------|---------------|
| **All projects** | _global/code-style.md | _global/ | (no paths - applies to all) |
| **Git repository** | _global/git-workflow.md | _global/ | (no paths - applies to all) |
| **React** | frontend/components.md | frontend/ | `src/components/**/*.{tsx,ts}` |
| **Vue** | frontend/components.md | frontend/ | `src/components/**/*.vue` |
| **Angular** | frontend/components.md | frontend/ | `src/app/**/*.component.ts` |
| **Svelte** | frontend/components.md | frontend/ | `src/lib/**/*.svelte` |
| **Next.js** | frontend/components.md, frontend/pages.md | frontend/ | `app/**/*.{tsx,ts}`, `components/**/*.{tsx,ts}` |
| **Nuxt** | frontend/components.md, frontend/pages.md | frontend/ | `pages/**/*.vue`, `components/**/*.vue` |
| **Express** | backend/api.md, backend/middleware.md | backend/ | `src/routes/**/*.{ts,js}`, `src/middleware/**/*.{ts,js}` |
| **Fastify** | backend/api.md, backend/middleware.md | backend/ | `src/routes/**/*.{ts,js}` |
| **NestJS** | backend/api.md | backend/ | `src/**/*.controller.ts`, `src/**/*.service.ts` |
| **Django** | backend/api.md, backend/middleware.md | backend/ | `*/views.py`, `*/middleware.py` |
| **Flask** | backend/api.md | backend/ | `app/routes/**/*.py` |
| **FastAPI** | backend/api.md | backend/ | `app/routers/**/*.py`, `app/api/**/*.py` |
| **Gin (Go)** | backend/api.md | backend/ | `internal/handlers/**/*.go` |
| **Prisma** | backend/database.md | backend/ | `prisma/schema.prisma`, `prisma/migrations/**` |
| **TypeORM** | backend/database.md | backend/ | `src/models/**/*.{ts,js}`, `src/entities/**/*.{ts,js}` |
| **Drizzle** | backend/database.md | backend/ | `src/db/**/*.{ts,js}` |
| **SQLAlchemy** | backend/database.md | backend/ | `app/models/**/*.py` |
| **Mongoose** | backend/database.md | backend/ | `src/models/**/*.{ts,js}` |
| **NextAuth** | security/security.md | security/ | (no paths - universal security) |
| **Auth.js** | security/security.md | security/ | (no paths - universal security) |
| **Passport** | security/security.md | security/ | (no paths - universal security) |
| **JWT packages** | security/security.md | security/ | (no paths - universal security) |
| **Jest** | testing/testing.md | testing/ | `**/*.test.{ts,tsx,js,jsx}`, `**/*.spec.{ts,tsx,js,jsx}` |
| **Vitest** | testing/testing.md | testing/ | `**/*.test.{ts,tsx,js,jsx}`, `**/*.spec.{ts,tsx,js,jsx}` |
| **Pytest** | testing/testing.md | testing/ | `tests/**/*.py`, `**/*_test.py` |
| **Playwright** | testing/testing.md | testing/ | `e2e/**/*.{ts,js}`, `tests/**/*.spec.{ts,js}` |
| **Dockerfile** | devops/docker.md | devops/ | `**/Dockerfile`, `**/docker-compose.yml` |
| **GitHub Actions** | devops/ci.md | devops/ | `.github/workflows/**/*.{yml,yaml}` |
| **GitLab CI** | devops/ci.md | devops/ | `.gitlab-ci.yml` |
| **Nx monorepo** | _global/monorepo.md + workspace-specific | _global/ + per workspace | (no paths for monorepo.md) + specific paths per workspace |
| **Turborepo** | _global/monorepo.md + workspace-specific | _global/ + per workspace | (no paths for monorepo.md) + specific paths per workspace |

## Customization Notes

When generating rules from templates:

1. **Replace placeholders**:
   - `[FRAMEWORK]` → Actual framework name
   - `[DETECTED_*]` → Detected tool/system
   - `[*_PATHS]` → Actual project paths

2. **Remove irrelevant sections**:
   - Remove framework-specific examples if not detected
   - Remove auth sections if no auth detected

3. **Add project-specific patterns**:
   - If analysis found unique patterns, include them
   - Add examples from actual codebase when relevant

4. **Adjust strictness**:
   - For new projects: More prescriptive
   - For existing projects: Align with current patterns

---

*Templates should be adapted to project specifics. These are starting points, not rigid requirements.*
