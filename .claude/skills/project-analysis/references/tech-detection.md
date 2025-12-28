# Tech Stack Detection Reference

This reference provides comprehensive detection tables for identifying languages, frameworks, databases, and tools in a codebase. Use these tables during Step 1 of the project analysis workflow.

## How to Use This Reference

1. Check manifest files in priority order (package managers first)
2. Look for exact matches in the detection tables below
3. Cross-reference with config files for version and setup details
4. Record all detected technologies with their detection source

## Language Detection

Detect primary programming languages based on manifest and config files:

| File Pattern | Language | Version Source |
|-------------|----------|----------------|
| `package.json` | JavaScript | engines.node field |
| `package.json` + `tsconfig.json` | TypeScript | tsconfig.json compilerOptions |
| `requirements.txt` | Python | Python version comments |
| `pyproject.toml` | Python | requires-python field |
| `Pipfile` | Python | Pipfile python_version |
| `go.mod` | Go | go directive line |
| `Cargo.toml` | Rust | package.rust-version |
| `pom.xml` | Java | maven.compiler.source |
| `build.gradle` | Java | sourceCompatibility |
| `build.gradle.kts` | Kotlin | kotlinOptions |
| `Gemfile` | Ruby | ruby directive |
| `composer.json` | PHP | require.php field |
| `*.csproj` | C#/.NET | TargetFramework element |
| `mix.exs` | Elixir | elixir version |
| `pubspec.yaml` | Dart | environment.sdk |

**Multi-language projects**: Record all detected languages, note primary based on line count or project type.

## Framework Detection

### JavaScript/TypeScript Frameworks

Check `package.json` dependencies and devDependencies:

| Indicator | Framework | Additional Signals |
|-----------|-----------|-------------------|
| `next` | Next.js | next.config.js, app/ or pages/ dir |
| `react` without Next.js | React (SPA) | src/App.tsx, vite.config.ts or webpack |
| `vue` | Vue.js | vue.config.js or vite.config.ts |
| `@angular/core` | Angular | angular.json |
| `svelte` | Svelte | svelte.config.js |
| `nuxt` | Nuxt.js | nuxt.config.js |
| `@remix-run/react` | Remix | remix.config.js |
| `gatsby` | Gatsby | gatsby-config.js |
| `@solidjs/router` | SolidJS | vite.config.ts with solid plugin |
| `express` | Express.js | Server framework |
| `fastify` | Fastify | Server framework |
| `@nestjs/core` | NestJS | nest-cli.json |
| `hono` | Hono | Lightweight server |
| `koa` | Koa | Server framework |

**Version detection**: Read from package.json dependencies

**Framework combos**: Note if using multiple (e.g., Next.js + React + Express API routes)

### Python Frameworks

Check requirements.txt, pyproject.toml, or Pipfile:

| Package | Framework | Additional Signals |
|---------|-----------|-------------------|
| `django` | Django | manage.py, settings.py, Django project structure |
| `flask` | Flask | app.py or wsgi.py |
| `fastapi` | FastAPI | main.py with FastAPI import, routers/ |
| `tornado` | Tornado | tornado handlers |
| `pyramid` | Pyramid | pyramid config |
| `strawberry-graphql` | Strawberry (GraphQL) | schema.py with strawberry |
| `graphene` | Graphene (GraphQL) | GraphQL Django integration |

**Detection priority**: FastAPI > Flask > Django (by specificity)

### Go Frameworks

Check go.mod require statements:

| Module | Framework | Additional Signals |
|--------|-----------|-------------------|
| `github.com/gin-gonic/gin` | Gin | main.go with gin.Default() |
| `github.com/labstack/echo` | Echo | main.go with echo.New() |
| `github.com/gofiber/fiber` | Fiber | main.go with fiber.New() |
| `net/http` (stdlib) | Standard Library | No framework, http.HandleFunc |

### Other Frameworks

| Language | Package/File | Framework |
|----------|-------------|-----------|
| Ruby | `rails` in Gemfile | Ruby on Rails |
| Ruby | `sinatra` in Gemfile | Sinatra |
| PHP | `laravel/framework` in composer.json | Laravel |
| PHP | `symfony/symfony` in composer.json | Symfony |
| Java | `spring-boot-starter` in pom.xml | Spring Boot |
| C# | `Microsoft.AspNetCore.App` in csproj | ASP.NET Core |

## Database & ORM Detection

### Node.js/TypeScript ORMs

Check package.json dependencies:

| Package | Type | Database Support |
|---------|------|------------------|
| `prisma` | ORM | PostgreSQL, MySQL, SQLite, MongoDB, etc. |
| `@prisma/client` | Prisma Client | Generated client |
| `typeorm` | ORM | PostgreSQL, MySQL, SQLite, MSSQL, Oracle |
| `drizzle-orm` | ORM | PostgreSQL, MySQL, SQLite |
| `sequelize` | ORM | PostgreSQL, MySQL, SQLite, MSSQL |
| `mongoose` | ODM | MongoDB |
| `pg` | Driver | PostgreSQL (raw) |
| `mysql2` | Driver | MySQL (raw) |
| `better-sqlite3` | Driver | SQLite |

**Additional signals**:
- `prisma/schema.prisma` - Prisma schema file
- `ormconfig.json` - TypeORM config
- `drizzle.config.ts` - Drizzle config

### Python ORMs

Check requirements.txt or pyproject.toml:

| Package | Type | Framework Association |
|---------|------|----------------------|
| `sqlalchemy` | ORM | Universal (Flask, FastAPI) |
| `alembic` | Migrations | SQLAlchemy companion |
| `django` | ORM | Built into Django |
| `peewee` | ORM | Lightweight |
| `tortoise-orm` | ORM | Async (FastAPI) |
| `psycopg2` or `psycopg3` | Driver | PostgreSQL |
| `pymongo` | Driver | MongoDB |

### Other Language ORMs

| Language | Package/Pattern | ORM |
|----------|----------------|-----|
| Go | `gorm.io/gorm` in go.mod | GORM |
| Ruby | `activerecord` in Gemfile | ActiveRecord (Rails) |
| Java | `hibernate` in pom.xml | Hibernate |
| C# | Entity Framework references | Entity Framework |

**Database type detection**:
- Check ORM config files for connection strings
- Look for docker-compose.yml services (postgres, mysql, mongo, redis)
- Check environment variables (.env.example for DATABASE_URL patterns)

## Authentication System Detection

### Node.js/TypeScript Auth

| Package | Auth System | Type |
|---------|-------------|------|
| `next-auth` | NextAuth.js | OAuth + Credentials (Next.js) |
| `@auth/core` | Auth.js | OAuth + Credentials (Universal) |
| `passport` | Passport.js | Strategy-based auth |
| `jsonwebtoken` | JWT | Token-based |
| `@clerk/nextjs` | Clerk | Auth as a Service |
| `@supabase/auth-helpers-nextjs` | Supabase Auth | Backend as a Service |
| `firebase` or `@firebase/auth` | Firebase Auth | Google auth service |
| `bcrypt` or `bcryptjs` | Password hashing | DIY auth indicator |

**Additional signals**:
- `[...nextauth].ts` or `route.ts` in app/api/auth/
- Middleware files checking auth headers
- Protected route patterns

### Python Auth

| Package | Auth System | Framework |
|---------|-------------|-----------|
| `django.contrib.auth` | Django Auth | Built-in |
| `djangorestframework-simplejwt` | JWT for DRF | Django REST |
| `flask-login` | Flask-Login | Flask sessions |
| `fastapi-users` | FastAPI Users | FastAPI |
| `python-jose` | JWT | FastAPI common |
| `passlib` | Password hashing | Universal |

### Other Auth Systems

| Language | Package | Auth System |
|----------|---------|-------------|
| Go | `golang-jwt/jwt` | JWT |
| Ruby | `devise` | Rails authentication |
| Java | Spring Security | Spring Boot |

## Testing Framework Detection

### JavaScript/TypeScript Testing

Check package.json devDependencies:

| Package | Testing Framework | Type |
|---------|------------------|------|
| `vitest` | Vitest | Unit/Integration (modern) |
| `jest` | Jest | Unit/Integration |
| `@testing-library/react` | React Testing Library | Component testing |
| `@testing-library/vue` | Vue Testing Library | Component testing |
| `@playwright/test` | Playwright | E2E |
| `cypress` | Cypress | E2E |
| `mocha` | Mocha | Unit (older) |
| `chai` | Chai | Assertions |
| `jasmine` | Jasmine | Unit (older) |

**Config file signals**:
- `vitest.config.ts`
- `jest.config.js`
- `playwright.config.ts`
- `cypress.json` or `cypress.config.ts`

### Python Testing

| Package | Testing Framework |
|---------|------------------|
| `pytest` | Pytest (modern standard) |
| `pytest-django` | Pytest for Django |
| `pytest-asyncio` | Async support for Pytest |
| `unittest` | Built-in unittest |
| `nose2` | Nose2 |
| `hypothesis` | Property-based testing |

**Config signals**: `pytest.ini`, `pyproject.toml` [tool.pytest]

### Other Language Testing

| Language | Package/Pattern | Framework |
|----------|----------------|-----------|
| Go | `*_test.go` files | Built-in testing |
| Go | `github.com/stretchr/testify` | Testify (assertions) |
| Ruby | `rspec` in Gemfile | RSpec |
| PHP | `phpunit/phpunit` | PHPUnit |
| Java | `junit` | JUnit |
| C# | `xunit` or `nunit` | xUnit/NUnit |

## Monorepo Detection

Detect monorepo structure and workspace configuration:

| File | Monorepo Tool | Workspaces Pattern |
|------|---------------|-------------------|
| `nx.json` | Nx | apps/, libs/ |
| `turbo.json` | Turborepo | apps/, packages/ |
| `pnpm-workspace.yaml` | pnpm workspaces | packages/, apps/ |
| `lerna.json` | Lerna | packages/ |
| `workspace` in package.json | npm/yarn workspaces | Custom array |
| `rush.json` | Rush | apps/, libraries/ |

**Monorepo indicators**:
- Multiple package.json files in subdirectories
- Top-level package.json with workspaces field
- Conventional directory names: apps/, packages/, libs/, tools/

**Workspace discovery**:
1. Parse workspace configuration
2. Find all package.json files
3. Map each to its directory
4. Analyze tech stack per workspace

## Build Tools & Infrastructure Detection

### Build Tools

| File | Build Tool | Language |
|------|-----------|----------|
| `vite.config.ts` | Vite | JS/TS (modern) |
| `webpack.config.js` | Webpack | JS/TS |
| `rollup.config.js` | Rollup | JS/TS |
| `esbuild.config.js` | esbuild | JS/TS |
| `tsup.config.ts` | tsup | TypeScript |
| `Makefile` | Make | Universal |
| `CMakeLists.txt` | CMake | C/C++ |
| `build.gradle` | Gradle | Java/Kotlin |
| `pom.xml` | Maven | Java |

### Containerization

| File | Technology |
|------|-----------|
| `Dockerfile` | Docker |
| `docker-compose.yml` | Docker Compose |
| `.dockerignore` | Docker |
| `Containerfile` | Podman |
| `kubernetes/` or `k8s/` | Kubernetes |

### CI/CD

| File | CI/CD System |
|------|--------------|
| `.github/workflows/*.yml` | GitHub Actions |
| `.gitlab-ci.yml` | GitLab CI |
| `.circleci/config.yml` | CircleCI |
| `.travis.yml` | Travis CI |
| `azure-pipelines.yml` | Azure Pipelines |
| `Jenkinsfile` | Jenkins |
| `.drone.yml` | Drone CI |

### Package Managers

| Lock File | Package Manager |
|-----------|----------------|
| `package-lock.json` | npm |
| `yarn.lock` | Yarn |
| `pnpm-lock.yaml` | pnpm |
| `bun.lockb` | Bun |
| `Pipfile.lock` | Pipenv |
| `poetry.lock` | Poetry |
| `Gemfile.lock` | Bundler |
| `composer.lock` | Composer |
| `Cargo.lock` | Cargo |
| `go.sum` | Go modules |

## Directory Structure Analysis Patterns

Common patterns by project type to aid in path detection:

### Next.js Project Structure

```
next-app/
├── app/                    # App Router (Next.js 13+)
│   ├── (auth)/            # Route groups
│   ├── api/               # API routes
│   └── [dynamic]/         # Dynamic routes
├── pages/                 # Pages Router (legacy)
├── components/            # React components
├── lib/                   # Utilities
├── public/                # Static assets
├── styles/                # CSS/styling
└── next.config.js
```

### React SPA Structure

```
react-app/
├── src/
│   ├── components/        # React components
│   ├── hooks/             # Custom hooks
│   ├── services/          # API services
│   ├── utils/             # Utilities
│   ├── store/             # State management
│   ├── assets/            # Images, fonts
│   └── App.tsx
├── public/
└── vite.config.ts
```

### Express/Node Backend

```
express-app/
├── src/
│   ├── routes/            # Route handlers
│   ├── controllers/       # Business logic
│   ├── middleware/        # Express middleware
│   ├── models/            # Database models
│   ├── services/          # Business services
│   ├── utils/             # Helpers
│   └── app.ts
└── package.json
```

### Django Project

```
django-project/
├── project_name/          # Project config
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── apps/                  # Django apps
│   ├── users/
│   └── posts/
├── templates/             # HTML templates
├── static/                # Static files
└── manage.py
```

### FastAPI Project

```
fastapi-app/
├── app/
│   ├── routers/           # API routes
│   ├── models/            # Pydantic/ORM models
│   ├── schemas/           # Request/response schemas
│   ├── services/          # Business logic
│   ├── dependencies.py    # Dependencies
│   └── main.py
└── requirements.txt
```

### Go Project

```
go-app/
├── cmd/                   # Application entrypoints
│   └── server/
│       └── main.go
├── internal/              # Private code
│   ├── handlers/
│   ├── models/
│   └── services/
├── pkg/                   # Public libraries
└── go.mod
```

### Monorepo Structure

```
monorepo/
├── apps/                  # Applications
│   ├── web/              # Frontend app (Next.js)
│   ├── mobile/           # Mobile app
│   └── api/              # Backend API
├── packages/             # Shared packages
│   ├── ui/               # Component library
│   ├── config/           # Shared config
│   └── utils/            # Shared utilities
├── tools/                # Build tools
└── turbo.json
```

## Detection Workflow Example

Step-by-step example of analyzing a Next.js + Prisma project:

1. **Find package.json** → Detect JavaScript/TypeScript
2. **Check dependencies**:
   - `next` → Next.js framework
   - `react` → React library
   - `prisma` → Prisma ORM
   - `next-auth` → NextAuth.js authentication
   - `vitest` → Vitest testing
3. **Check for TypeScript**: `tsconfig.json` exists → TypeScript confirmed
4. **Check structure**:
   - `app/` directory exists → App Router (Next.js 13+)
   - `prisma/schema.prisma` exists → Prisma configured
   - `app/api/auth/[...nextauth]/route.ts` → NextAuth setup
5. **Check CI/CD**: `.github/workflows/` exists → GitHub Actions
6. **Check Docker**: `Dockerfile` exists → Docker deployment

**Result**: Full-stack Next.js app with TypeScript, Prisma ORM, NextAuth, Vitest, GitHub Actions, Docker

## Edge Cases & Special Scenarios

### Multiple Frameworks Detected

- **Microservices**: Different tech per service directory
- **Migration in progress**: Old + new framework coexisting
- **Polyglot projects**: Different languages for different components

**Handling**: Report all detected, note which is primary/active

### No Framework Detected

- **Vanilla projects**: Just language + standard library
- **Custom framework**: Internal/proprietary
- **Legacy projects**: Outdated/uncommon stack

**Handling**: Report language only, recommend generic rules

### Conflicting Indicators

- **Old config files**: Leftover from migration
- **Multiple package managers**: Both npm and yarn locks present
- **Abandoned experiments**: Unused dependencies

**Handling**: Use most recent/actively used, note conflicts in report

### Minimal Projects

- **Single file**: One HTML/Python file
- **Starter templates**: Barely initialized
- **Prototypes**: Incomplete setup

**Handling**: Detect what's present, recommend minimal rules

## Version Detection Best Practices

- **Lock files are source of truth** for installed versions
- **Config files** specify required/compatible versions
- **Don't assume latest** - use detected version
- **Note version ranges** when specified (e.g., "^18.0.0")
- **Include in report** for context on recommended rules

## Performance Notes

- **Glob efficiently**: Use `**/{package.json,go.mod,requirements.txt}` patterns
- **Read files once**: Cache contents if checking multiple patterns
- **Parallel checks**: Independent detections can run concurrently
- **Fail fast**: Stop checking once primary indicator found
- **Limit depth**: Don't search node_modules/, venv/, dist/

---

*This reference is comprehensive but not exhaustive. For unknown patterns, make best-effort detection and note uncertainty in the report.*
