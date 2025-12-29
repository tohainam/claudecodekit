# Tech-to-Agent Mapping Reference

This reference maps project characteristics to recommended Claude Code agents. Use this during Step 4 of the onboard workflow to generate agent recommendations.

## Overview

Agents are specialized Claude instances that handle specific tasks in the development workflow. Based on project characteristics, certain agents will be more useful than others.

## Agent Recommendation Rules

1. **Core workflow agents**: Always recommend `planner`, `implementer` for all projects
2. **Conditional agents**: Recommend based on project setup and characteristics
3. **Task-specific agents**: Suggest when relevant infrastructure exists
4. **Usage context**: Explain when and how to invoke each agent

## Mapping Table

### Universal Agents (All Projects)

| Agent | Model | When to Recommend | Usage Guidance |
|-------|-------|-------------------|----------------|
| `planner` | opus | Always | Use `/plan <task>` or `/feature <desc>` to create implementation plans before coding |
| `implementer` | sonnet | Always | Use `/implement [path]` to execute existing plans step-by-step with validation |

### Version Control Agents

| Agent | Model | Characteristic | Usage Guidance |
|-------|-------|----------------|----------------|
| `code-reviewer` | sonnet | Has `.git` directory | Use `/review [scope]` before commits/PRs to catch issues early |

### Testing Agents

| Agent | Model | Characteristic | Usage Guidance |
|-------|-------|----------------|----------------|
| `test-writer` | sonnet | Has test files or testing framework | Use `/test <file>` to write comprehensive tests for new features |

### Research & Analysis Agents

| Agent | Model | Characteristic | Usage Guidance |
|-------|-------|----------------|----------------|
| `scouter` | opus | Complex codebase (>30 files) OR unclear architecture | Use `/scout <topic>` for deep codebase analysis: architecture, data flow, dependencies |
| `researcher` | opus | Uses external libraries/frameworks | Use `/research <topic>` to fetch current docs, best practices, examples |

### Code Improvement Agents

| Agent | Model | Characteristic | Usage Guidance |
|-------|-------|----------------|----------------|
| `refactorer` | opus | Legacy code OR technical debt OR complex codebase | Use `/refactor <file>` for safe code improvements with tests |
| `debugger` | sonnet | Has bugs OR complex issues | Use `/debug <issue>` to find root causes without making changes |

### Documentation Agents

| Agent | Model | Characteristic | Usage Guidance |
|-------|-------|----------------|----------------|
| `doc-writer` | sonnet | Has `docs/`, `README.md`, or documentation | Use for writing/updating documentation, API docs, guides |

### Security Agents

| Agent | Model | Characteristic | Usage Guidance |
|-------|-------|----------------|----------------|
| `security-auditor` | opus | Has auth system OR handles sensitive data OR payment processing | Use for security reviews, vulnerability analysis, auth audits |

### Discussion & Planning Agents

| Agent | Model | Characteristic | Usage Guidance |
|-------|-------|----------------|----------------|
| `facilitator` | opus | Complex decisions OR unclear requirements OR architectural choices | Use `/discuss <topic>` for requirements gathering, ADRs, trade-off analysis |

## Detailed Recommendation Logic

### Project Characteristic Detection → Agent Recommendations

#### Characteristic: Git Repository Detected

**Detection**: `.git/` directory exists

**Recommended Agents:**
- `code-reviewer` - Review changes before commits
- `planner` - Plan changes with git workflow in mind
- `implementer` - Execute plans with commit strategy

**Usage Guidance:**
```markdown
### Git Workflow Agents

**code-reviewer**: Use `/review` before creating commits or PRs to ensure:
- Code quality standards met
- No obvious bugs or security issues
- Tests pass and coverage is adequate
- Changes align with project conventions

**Example**: `/review` or `/review src/auth/` (scope to specific directory)
```

#### Characteristic: Testing Infrastructure Detected

**Detection**: Test files (`*.test.ts`, `*.spec.py`) OR testing framework (Jest, Vitest, Pytest, etc.)

**Recommended Agents:**
- `test-writer` - Write and update tests
- `implementer` - Include test creation in implementation workflow

**Usage Guidance:**
```markdown
### Testing Agents

**test-writer**: Use `/test <file>` to generate comprehensive tests:
- Unit tests for business logic
- Integration tests for APIs and services
- Edge cases and error scenarios
- Follows project's testing patterns

**Example**: `/test src/services/payment.ts`
```

#### Characteristic: Complex Codebase

**Detection**: >30 files OR monorepo structure OR microservices OR complex architecture

**Recommended Agents:**
- `scouter` - Deep codebase analysis
- `debugger` - Root cause analysis for complex issues
- `refactorer` - Safe code improvements
- `facilitator` - Architectural discussions

**Usage Guidance:**
```markdown
### Complex Codebase Agents

**scouter**: Use `/scout <topic>` for deep analysis before making changes:
- Understand architecture patterns
- Map data flows
- Identify dependencies
- Find similar implementations

**Example**: `/scout authentication flow` or `/scout payment processing`

**debugger**: Use `/debug <issue>` to find root causes:
- Analyze error patterns
- Trace execution flow
- Identify bottlenecks
- No code changes (diagnosis only)

**refactorer**: Use `/refactor <file>` for safe improvements:
- Maintains existing tests
- Incremental changes
- Performance optimizations
- Code smell removal

**Example**: `/refactor src/legacy/user-service.ts`
```

#### Characteristic: External Libraries/Frameworks

**Detection**: Modern frameworks (React, Next.js, FastAPI, Django) OR ORMs (Prisma, TypeORM, SQLAlchemy) OR auth libraries

**Recommended Agents:**
- `researcher` - Fetch current documentation
- `scouter` - Understand integration patterns

**Usage Guidance:**
```markdown
### Research Agents

**researcher**: Use `/research <topic>` to fetch current best practices:
- Official documentation (via context7 MCP)
- Framework-specific patterns
- Version-specific APIs
- Security considerations
- Performance optimizations

**Example**:
- `/research Prisma relations` - Fetch current Prisma docs
- `/research Next.js App Router` - Get latest Next.js patterns
- `/research FastAPI authentication` - Current auth patterns
```

#### Characteristic: Documentation Present

**Detection**: `docs/` directory OR `README.md` OR `.md` files in root OR documentation comments

**Recommended Agents:**
- `doc-writer` - Write and update documentation

**Usage Guidance:**
```markdown
### Documentation Agents

**doc-writer**: Use for documentation tasks:
- API documentation
- User guides
- Contributing guidelines
- Code comments and JSDoc/docstrings
- README updates

**Example**: Ask doc-writer to "update README with new authentication flow"
```

#### Characteristic: Security-Sensitive Project

**Detection**: Auth system (NextAuth, Passport, JWT) OR payment processing OR PII handling OR production deployment

**Recommended Agents:**
- `security-auditor` - Security reviews and audits

**Usage Guidance:**
```markdown
### Security Agents

**security-auditor**: Use for security-critical reviews:
- Auth implementation audits
- Input validation checks
- SQL injection prevention
- XSS vulnerability analysis
- Secrets management review
- OWASP compliance checks

**Example**:
- "Review authentication security in src/auth/"
- "Audit payment processing for vulnerabilities"
- "Check API endpoints for security issues"
```

#### Characteristic: Legacy Code or Technical Debt

**Detection**: Old dependencies OR mixed patterns OR TODO comments OR commented code OR large files (>300 lines)

**Recommended Agents:**
- `refactorer` - Safe code improvements
- `debugger` - Understand legacy behavior
- `scouter` - Map legacy architecture

**Usage Guidance:**
```markdown
### Legacy Code Agents

**refactorer**: Use `/refactor <file>` for systematic improvements:
- Maintains backward compatibility
- Preserves existing tests
- Incremental, safe changes
- Modernization patterns

**debugger**: Use to understand legacy code behavior before changes
**scouter**: Use to map legacy architecture and dependencies
```

#### Characteristic: Unclear Requirements

**Detection**: New feature request OR architectural decision needed OR multiple approaches possible

**Recommended Agents:**
- `facilitator` - Lead discussions and create ADRs
- `scouter` - Research existing patterns in codebase
- `researcher` - Research best practices

**Usage Guidance:**
```markdown
### Planning & Discussion Agents

**facilitator**: Use `/discuss <topic>` for:
- Requirements gathering
- Architectural decisions (ADRs)
- Trade-off analysis
- Approach exploration
- Auto-generates discussion summaries and decision records

**Example**: `/discuss authentication strategy for multi-tenant app`

**Workflow**: facilitator will auto-invoke scouter (codebase patterns) and researcher (best practices)
```

## Technology Stack → Agent Recommendations

### Next.js + Prisma + NextAuth

**Recommended Agents:**
- `planner`, `implementer` - Core workflow
- `researcher` - Fetch Next.js, Prisma, NextAuth docs
- `test-writer` - React and API tests
- `security-auditor` - Auth security review
- `code-reviewer` - Pre-commit reviews

### React SPA + Express API

**Recommended Agents:**
- `planner`, `implementer` - Core workflow
- `researcher` - React and Express best practices
- `test-writer` - Frontend and API tests
- `scouter` - Understand frontend-backend integration
- `code-reviewer` - Pre-commit reviews

### Django + PostgreSQL

**Recommended Agents:**
- `planner`, `implementer` - Core workflow
- `researcher` - Django patterns and PostgreSQL best practices
- `test-writer` - Django test patterns (pytest-django)
- `security-auditor` - Django security review
- `code-reviewer` - Pre-commit reviews

### FastAPI + SQLAlchemy

**Recommended Agents:**
- `planner`, `implementer` - Core workflow
- `researcher` - FastAPI async patterns, SQLAlchemy ORM
- `test-writer` - Pytest async testing
- `code-reviewer` - Pre-commit reviews

### Monorepo (Turborepo/Nx)

**Recommended Agents:**
- `planner`, `implementer` - Core workflow
- `scouter` - Map workspace dependencies and shared code
- `refactorer` - Refactor shared packages
- `researcher` - Monorepo best practices
- `code-reviewer` - Pre-commit reviews across workspaces

### Microservices

**Recommended Agents:**
- `planner`, `implementer` - Core workflow
- `scouter` - Map service dependencies and communication
- `debugger` - Distributed debugging
- `researcher` - Microservices patterns
- `security-auditor` - Service security review
- `code-reviewer` - Per-service reviews

## Agent Invocation Patterns

### Command-Based Invocation

```bash
/discuss <topic>       # Invoke facilitator
/scout <topic>         # Invoke scouter
/research <topic>      # Invoke researcher
/plan <task>           # Invoke planner
/implement [path]      # Invoke implementer
/test <file>           # Invoke test-writer
/debug <issue>         # Invoke debugger
/refactor <file>       # Invoke refactorer
/review [scope]        # Invoke code-reviewer
```

### Workflow-Based Invocation

```bash
/feature <desc>        # Planner → Implementer → Test-writer → Code-reviewer
/bugfix <error>        # Debugger → Test-writer → Implementer → Code-reviewer
```

### Manual Invocation (Advanced)

When using main Claude without commands, you can request specific agents:
- "Use the scouter agent to analyze the authentication flow"
- "Have the researcher agent fetch Prisma documentation"
- "Get the security-auditor to review this auth code"

## Agent Communication & Handoffs

Agents are designed to work together in workflows:

1. **facilitator** → **scouter** + **researcher** → Create discussion summary + ADR
2. **planner** → **researcher** (for best practices) → Create implementation plan
3. **implementer** → Execute plan → Handoff to **test-writer** (optional) → Handoff to **code-reviewer** (optional)
4. **debugger** → Find root cause → Handoff to **implementer** for fix

## Usage Frequency Recommendations

| Agent | Frequency | Primary Use Cases |
|-------|-----------|-------------------|
| `planner` | Very High | Every new feature, refactoring, complex changes |
| `implementer` | Very High | Execute all plans |
| `code-reviewer` | High | Before every commit/PR |
| `researcher` | High | When using external libraries, learning new patterns |
| `test-writer` | Medium | After features, for uncovered code |
| `scouter` | Medium | Before large changes, understanding complex areas |
| `facilitator` | Medium | Unclear requirements, architectural decisions |
| `debugger` | As Needed | When bugs are unclear or complex |
| `refactorer` | As Needed | Technical debt reduction, code improvement |
| `doc-writer` | As Needed | Documentation updates, new features |
| `security-auditor` | As Needed | Pre-release, after auth changes, security reviews |

## Notes

- **Agents are specialized**: Each has a specific purpose and model (opus for complex, sonnet for execution)
- **Agents use Task tool**: Invoked via `/command` patterns that use the Task tool
- **Agents can auto-invoke others**: facilitator auto-invokes scouter and researcher
- **Recommendations guide workflow**: Not all agents needed for every project
- **User decides invocation**: Recommendations are advisory, user controls agent usage
