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

## Notes

- **Skills are loaded automatically** by skill-loader hook based on task context
- **Recommendations guide users** on which skills exist and when to use them
- **Project-specific skills** can be created via skill-creator during --apply mode
- **Skill priorities** are determined by frequency of use and relevance to daily tasks
