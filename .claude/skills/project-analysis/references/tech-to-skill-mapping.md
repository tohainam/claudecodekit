# Tech-to-Skill Mapping Reference

This reference maps detected technologies to recommended Claude Code skills. Use this during Step 4 of the onboard workflow to generate skill recommendations.

## Overview

When technologies are detected during project analysis, consult this table to recommend relevant skills that provide domain-specific knowledge for working with the codebase.

## Skill Recommendation Rules

1. **Always recommend core skills** for all projects: `code-quality`, `git-workflow`
2. **Stack-based recommendations**: Match detected tech to skills below
3. **Project-size recommendations**: Large codebases (>50 files) benefit from `debugging`, `refactoring`
4. **Security-sensitive projects**: Recommend `security-review` if auth or sensitive data detected
5. **Documentation-heavy projects**: Recommend `documentation` if docs/ directory exists
6. **Performance-critical projects**: Recommend `performance` if real-time or high-scale indicators present

## Mapping Table

### Frontend Technologies → Skills

| Detected Technology | Recommended Skills | Rationale |
|---------------------|-------------------|-----------|
| React, Next.js | `frontend-design`, `testing` | Component patterns, UI best practices, React Testing Library |
| Vue, Nuxt.js | `frontend-design`, `testing` | Component patterns, Vue-specific testing |
| Angular | `frontend-design`, `testing`, `architecture` | Enterprise patterns, RxJS, dependency injection |
| Svelte, SvelteKit | `frontend-design`, `testing` | Modern reactive patterns |
| Remix, Astro | `frontend-design`, `architecture` | Server-side rendering patterns |
| Solid.js, Qwik | `frontend-design` | Modern reactivity patterns |
| Tailwind CSS, styled-components | `frontend-design` | Styling best practices |

### Backend Technologies → Skills

| Detected Technology | Recommended Skills | Rationale |
|---------------------|-------------------|-----------|
| Express.js, Fastify, Koa | `architecture`, `testing` | API design, middleware patterns, integration testing |
| NestJS | `architecture`, `testing` | Enterprise architecture, dependency injection, testing strategies |
| Next.js API routes | `architecture`, `testing` | API design in Next.js context |
| FastAPI, Django | `architecture`, `testing` | Python backend patterns, API design |
| Flask | `architecture`, `testing` | Microframework patterns |
| Ruby on Rails, Sinatra | `architecture`, `testing` | Ruby MVC patterns |
| Spring Boot | `architecture`, `testing` | Enterprise Java patterns |
| Gin, Echo, Fiber (Go) | `architecture`, `testing` | Go web patterns |
| ASP.NET Core | `architecture`, `testing` | .NET patterns |

### Database & ORM Technologies → Skills

| Detected Technology | Recommended Skills | Rationale |
|---------------------|-------------------|-----------|
| Prisma | `architecture`, `testing` | Schema design, migrations, Prisma-specific patterns |
| TypeORM, Drizzle ORM | `architecture`, `testing` | ORM patterns, query optimization |
| Sequelize, Mongoose | `architecture`, `testing` | ORM/ODM patterns |
| SQLAlchemy, Django ORM | `architecture`, `testing` | Python ORM patterns, migrations |
| GORM (Go) | `architecture` | Go database patterns |
| Entity Framework | `architecture` | .NET data access patterns |
| Raw SQL drivers (pg, mysql2) | `architecture`, `security-review` | Query safety, SQL injection prevention |

### Authentication Systems → Skills

| Detected Technology | Recommended Skills | Rationale |
|---------------------|-------------------|-----------|
| NextAuth.js, Auth.js | `security-review`, `architecture` | OAuth patterns, session management |
| Passport.js | `security-review`, `architecture` | Strategy patterns, auth flows |
| JWT (jsonwebtoken) | `security-review` | Token security, validation patterns |
| Clerk, Supabase Auth | `architecture` | Third-party auth integration |
| Firebase Auth | `architecture` | Google auth integration |
| Django Auth, Flask-Login | `security-review`, `architecture` | Python auth patterns |
| Spring Security | `security-review`, `architecture` | Java security patterns |
| DIY auth (bcrypt, passlib) | `security-review` | Password security, auth implementation |

### Testing Frameworks → Skills

| Detected Technology | Recommended Skills | Rationale |
|---------------------|-------------------|-----------|
| Vitest, Jest | `testing` | Unit testing, mocking, coverage strategies |
| React Testing Library | `testing`, `frontend-design` | Component testing patterns |
| Playwright, Cypress | `testing` | E2E testing strategies |
| Pytest | `testing` | Python testing patterns, fixtures |
| Go testing, Testify | `testing` | Go testing patterns |
| JUnit, TestNG | `testing` | Java testing patterns |
| RSpec | `testing` | Ruby testing patterns |

### Build Tools & Infrastructure → Skills

| Detected Technology | Recommended Skills | Rationale |
|---------------------|-------------------|-----------|
| Vite, Webpack, Rollup | `architecture` | Build optimization, config patterns |
| Docker, Docker Compose | `architecture` | Containerization best practices |
| Kubernetes | `architecture` | Orchestration patterns |
| Turborepo, Nx | `architecture`, `refactoring` | Monorepo patterns, workspace management |
| GitHub Actions, GitLab CI | `git-workflow` | CI/CD patterns, automation |

### Project Characteristics → Skills

| Characteristic | Recommended Skills | Rationale |
|----------------|-------------------|-----------|
| Large codebase (>50 files) | `debugging`, `refactoring`, `architecture` | Complex system navigation, code improvement |
| Has tests directory | `testing` | Test maintenance, coverage strategies |
| Has docs/ or documentation | `documentation` | Doc writing, maintenance |
| Real-time features (WebSocket, SSE) | `performance`, `architecture` | Performance optimization, scalability |
| API endpoints | `architecture`, `testing` | API design, integration testing |
| Microservices | `architecture`, `debugging` | Distributed systems, service communication |
| Monorepo | `architecture`, `refactoring` | Workspace management, shared code patterns |
| Security-sensitive (auth, payments) | `security-review` | Security auditing, vulnerability prevention |
| Legacy codebase | `refactoring`, `debugging`, `testing` | Code improvement, technical debt reduction |
| Performance-critical | `performance` | Optimization strategies, profiling |

## Special Combinations

Some technology combinations benefit from specific skill sets:

| Technology Stack | Recommended Skills | Rationale |
|-----------------|-------------------|-----------|
| Next.js + Prisma + NextAuth | `frontend-design`, `architecture`, `security-review`, `testing` | Full-stack patterns, auth security, comprehensive testing |
| React SPA + Express API | `frontend-design`, `architecture`, `testing` | Frontend-backend separation, API integration |
| Django + PostgreSQL | `architecture`, `testing`, `security-review` | Django patterns, database design, security |
| Turborepo monorepo | `architecture`, `refactoring`, `testing` | Monorepo patterns, shared code management |
| FastAPI + SQLAlchemy | `architecture`, `testing` | Async patterns, ORM usage |
| Microservices architecture | `architecture`, `debugging`, `testing`, `performance` | Distributed systems, service reliability |

## Usage Guide

### Step-by-Step Recommendation Process

1. **Start with core skills**: Always include `code-quality`, `git-workflow`
2. **Match detected technologies**: Use tables above to find relevant skills
3. **Consider project characteristics**: Add skills based on codebase size, complexity
4. **Prioritize by relevance**: Rank skills by how frequently they'll be used
5. **Limit recommendations**: Suggest 4-7 skills maximum to avoid overwhelming users
6. **Provide rationale**: Explain why each skill is recommended

### Example: Next.js + Prisma Project

**Detected Technologies:**
- Next.js (frontend framework)
- Prisma (ORM)
- NextAuth (authentication)
- Vitest (testing)
- GitHub Actions (CI/CD)

**Recommended Skills:**
1. `frontend-design` - React/Next.js component patterns
2. `architecture` - Backend API design, database schema patterns
3. `security-review` - NextAuth security, auth flow best practices
4. `testing` - Vitest patterns, component and API testing
5. `git-workflow` - CI/CD with GitHub Actions
6. `code-quality` - Code standards and best practices

**Rationale Output:**
```markdown
### Recommended Skills

Based on your Next.js + Prisma stack, we recommend these skills:

1. **frontend-design**: Provides Next.js component patterns, App Router best practices, and modern UI development
2. **architecture**: Covers API design, Prisma schema patterns, and backend architecture
3. **security-review**: Essential for NextAuth setup, OAuth flows, and auth security
4. **testing**: Vitest strategies, React Testing Library patterns, API testing
5. **git-workflow**: GitHub Actions CI/CD patterns and git best practices
6. **code-quality**: Universal code standards and clean code principles
```

### Example: FastAPI + PostgreSQL Project

**Detected Technologies:**
- FastAPI (backend framework)
- SQLAlchemy (ORM)
- Pytest (testing)
- Docker (containerization)

**Recommended Skills:**
1. `architecture` - FastAPI patterns, async design, database architecture
2. `testing` - Pytest strategies, async testing, API integration tests
3. `security-review` - API security, input validation, auth patterns
4. `code-quality` - Python code standards
5. `git-workflow` - Git best practices

## Excluded Skills from Auto-Recommendation

Some skills are NOT auto-recommended because they're task-specific:

| Skill | When to Use | Not Auto-Recommended Because |
|-------|-------------|------------------------------|
| `skill-creator` | Creating new skills | Only needed during onboard --apply for project-specific skills |
| `project-analysis` | Analyzing codebases | Used internally by /onboard command |

## Domain-Based NEW Skill Recommendations

Beyond recommending existing skills, onboard should analyze the project's business domain and recommend CREATING new project-specific skills.

**CRITICAL: Domain skills document ACTUAL CODE from the project, NOT generic domain knowledge.**

❌ BAD (generic domain advice):
```markdown
## E-commerce Patterns
- Use webhooks for payment notifications
- Implement idempotency for order creation
- Handle cart abandonment
```

✅ GOOD (actual code from project):
```markdown
## E-commerce Patterns

### Order State Transitions
**Source:** `src/services/order/orderService.ts:45-78`
```typescript
// ACTUAL CODE FROM THIS PROJECT
const validTransitions: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['PAID', 'CANCELLED'],
  PAID: ['PROCESSING', 'REFUNDED'],
  // ...
};
```

### Payment Flow
**Source:** `src/services/payment/stripeService.ts:20-80`
```typescript
// ACTUAL CODE FROM THIS PROJECT
export async function createPaymentIntent(...) {
  // ...
}
```
```

### When to Recommend Creating New Skills

| Condition | Recommendation |
|-----------|----------------|
| Domain detected with High confidence | Recommend creating domain skill (CODE-FOCUSED) |
| Unique project conventions found | Recommend creating `project-conventions` skill (CODE-FOCUSED) |
| Complex workflows not covered by existing skills | Recommend creating workflow-specific skill (CODE-FOCUSED) |

### Domain → NEW Skill Mapping

Reference: [domain-detection.md](domain-detection.md) for detection patterns
Reference: [domain-skill-templates.md](domain-skill-templates.md) for templates

| Detected Domain | NEW Skill to Create | Template |
|-----------------|---------------------|----------|
| E-commerce (cart, checkout, payment) | `ecommerce` | Universal Skill Template |
| Healthcare (patient, appointment, prescription) | `healthcare` | Universal Skill Template |
| Fintech (transaction, account, ledger) | `fintech` | Universal Skill Template |
| EdTech (course, lesson, enrollment) | `edtech` | Universal Skill Template |
| Booking (reservation, availability, slot) | `booking` | Universal Skill Template |
| Social (post, feed, comment, follow) | `social` | Universal Skill Template |
| Analytics (dashboard, metric, report) | `analytics` | Universal Skill Template |
| CMS (article, content, media, publish) | `cms` | Universal Skill Template |
| Project Management (task, issue, sprint) | `project-management` | Universal Skill Template |
| IoT (device, sensor, telemetry) | `iot` | Universal Skill Template |
| Marketplace (listing, seller, buyer) | `marketplace` | Universal Skill Template |

**Note:** All domains use the Universal Skill Template from `domain-skill-templates.md`. The template extracts ACTUAL CODE from the detected domain files - it does NOT contain generic domain advice.

### Project Convention Skills

When unique project patterns are detected, recommend creating a `project-conventions` skill:

| Detection | Include in Skill |
|-----------|------------------|
| Custom error handling pattern | Error handling conventions |
| Specific folder structure | File organization rules |
| Custom naming conventions | Naming patterns |
| Unique service layer patterns | Service implementation guide |
| Special API response format | API conventions |

### Skill Creation Output Format

In ONBOARD-REPORT.md, include:

```markdown
## Recommended NEW Skills to Create

**IMPORTANT:** These skills will document ACTUAL CODE from your project, not generic advice.

### 1. `ecommerce` Skill (RECOMMENDED TO CREATE)

**Why create:** Detected e-commerce domain with High confidence
**Evidence:**
- Keywords: cart (15), order (42), payment (28), checkout (8)
- Folders: src/services/payment/, src/services/order/
- Models: Product, Order, Cart, Payment

**Code patterns to document** (from your actual codebase):

| Pattern | Location | Code Preview |
|---------|----------|--------------|
| Payment flow | `src/services/payment/stripeService.ts:20-80` | `createPaymentIntent(...)` |
| Order lifecycle | `src/services/order/orderService.ts:45-120` | `transitionOrderState(...)` |
| Cart management | `src/stores/cart.ts:10-60` | `useCartStore(...)` |

**Sample code extraction:**
```typescript
// From src/services/order/orderService.ts:45-78
export async function transitionOrderState(orderId: string, newState: OrderStatus) {
  const validTransitions: Record<OrderStatus, OrderStatus[]> = {
    PENDING: ['PAID', 'CANCELLED'],
    PAID: ['PROCESSING', 'REFUNDED'],
    // ACTUAL CODE FROM THIS PROJECT
  };
}
```

**To create:** Run `/onboard --apply` or manually create `.claude/skills/ecommerce/SKILL.md`

### 2. `project-conventions` Skill (RECOMMENDED TO CREATE)

**Why create:** Unique patterns detected that differ from standard conventions
**Evidence:**
- Custom error classes in src/lib/errors/
- Service layer pattern: src/services/*Service.ts
- Custom API response wrapper

**Code patterns to document:**

| Pattern | Location | Code Preview |
|---------|----------|--------------|
| Error handling | `src/lib/errors.ts:5-30` | `class AppError extends...` |
| Service pattern | `src/services/orderService.ts:1-20` | `export class OrderService...` |
| API response | `src/lib/response.ts:10-40` | `function apiResponse(...)` |
```

### Skill Creation Process (--apply mode)

When `/onboard --apply` is run:

1. **Load template** from `domain-skill-templates.md`
2. **READ the actual files** identified during domain detection
3. **EXTRACT code snippets** with line numbers:
   ```bash
   # Extract actual code from detected files
   sed -n '45,78p' src/services/order/orderService.ts
   ```
4. **Replace placeholders** with ACTUAL CODE:
   - `[ACTUAL_CODE_FROM_PROJECT]` → extracted code snippets
   - `[FILE_PATH]:[LINE_RANGE]` → actual file locations
   - `[NAMING_PATTERNS]` → patterns found in file/function names
5. **Generate skill file** at `.claude/skills/[domain]/SKILL.md`
6. **Report creation** in output

**Content requirements:**
- ✅ Actual code snippets from project files
- ✅ File:line references for all patterns
- ✅ Real function/class names from codebase
- ❌ Generic domain advice (NO!)
- ❌ Industry best practices not in codebase (NO!)

## Notes

- **Skills are loaded automatically** by skill-loader hook based on task context
- **Recommendations guide users** on which skills exist and when to use them
- **Project-specific skills** can be created via skill-creator during --apply mode
- **Domain skills** complement tech skills - both should be recommended
- **Skill priorities** are determined by frequency of use and relevance to daily tasks
