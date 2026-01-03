# Claude Code Kit - Complete Component Inventory

**Generated**: 2026-01-02 23:21
**Version**: 1.0.0
**Purpose**: Comprehensive documentation for Claude Code Kit website

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Architecture Overview](#architecture-overview)
3. [Agents](#agents)
4. [Skills](#skills)
5. [Commands](#commands)
6. [Global Rules](#global-rules)
7. [Component Relationships](#component-relationships)
8. [Configuration](#configuration)

---

## Executive Summary

Claude Code Kit is a framework-agnostic development toolkit providing automated workflows, intelligent orchestration, and a hybrid agent-skill architecture for software development.

### Key Statistics

| Component Type | Count | Description |
|----------------|-------|-------------|
| **Agents** | 3 | Specialized subagents for research, scouting, and review |
| **Skills** | 10 | Domain knowledge modules with progressive disclosure |
| **Commands** | 2 | User-facing slash commands |
| **Global Rules** | 4 | Always-loaded behavioral guidelines |

### Core Philosophy

1. **Brainstorm Before Automate** - Interactive refinement before workflow execution
2. **Hierarchical Planning** - Master plan + sub-plans for complex features
3. **Document Everything** - Specs, reports, plans in designated folders
4. **Confirmation Points** - Human validation at key stages

---

## Architecture Overview

### Directory Structure

```
.claude/
├── CLAUDE.md                 # Main project configuration
├── settings.json             # Permissions and environment
├── agents/                   # Subagent definitions (3 agents)
│   ├── researcher.md
│   ├── scouter.md
│   └── reviewer.md
├── skills/                   # Multi-file skills (10 skills)
│   ├── planning/
│   ├── implementation/
│   ├── testing/
│   ├── documentation/
│   ├── security-audit/
│   ├── git-workflow/
│   ├── code-patterns/
│   ├── gemini/
│   ├── ui-ux-pro-max/
│   └── skill-creator/
├── commands/                 # Slash commands (2 commands)
│   ├── brainstorm.md
│   └── run.md
├── rules/_global/            # Always-loaded guidelines (4 rules)
│   ├── code-quality.md
│   ├── communication.md
│   ├── knowledge-freshness.md
│   └── safety.md
├── .specs/                   # Finalized specifications
├── .reports/                 # Research/scout reports
├── .plans/                   # Implementation plans
└── .state/                   # Workflow state
```

### Execution Flow

```
User Request → Command Parser → Workflow Detection → Agent Orchestration → Skill Application → Output
                    ↓                    ↓                    ↓                    ↓
              /brainstorm          Auto-detect          researcher          planning
                 /run              or explicit           scouter        implementation
                                                        reviewer            testing
                                                                         git-workflow
```

---

## Agents

### 1. Researcher Agent

**File**: `.claude/agents/researcher.md`

| Property | Value |
|----------|-------|
| **Name** | researcher |
| **Color** | purple |
| **Model** | inherit |
| **Tools** | WebSearch, WebFetch, Bash, Read, Grep, Glob, Edit, Write |

**Description**: Research external documentation, best practices, and technology comparisons. Produces structured markdown reports with citations.

**Use Cases**:
- Library documentation lookup
- API references
- Architecture patterns
- Error troubleshooting
- "A vs B" comparisons

**Research Depth Levels**:

| Depth | Searches | Triggers |
|-------|----------|----------|
| `quick` | 2-3 | "quick", "briefly", simple lookups |
| `standard` | 4-6 | Default - feature research, best practices |
| `deep` | 8-12 | "deep dive", "thorough", architecture decisions |

**Research Types**:

| Type | Indicators | Strategy |
|------|------------|----------|
| Library | Package name, framework, API | Context7 + WebSearch + GitHub |
| Concept | Pattern, methodology, architecture | WebSearch + authoritative tech blogs |
| Comparison | "vs", "or", "compare", "which" | Both sides equally + structured table |
| Error | Error message, "not working" | Exact error search + SO + GitHub Issues |

**Output Format**: Structured markdown report saved to `.claude/.reports/{YYYY-MM-DD-HHMM}-{type}-{topic}.md`

**Report Templates**:
- Standard Report (Key Findings, Documentation, Best Practices, Code Examples, Recommendations)
- Comparison Report (Comparison Table, Pros/Cons for each option, When to use)

---

### 2. Scouter Agent

**File**: `.claude/agents/scouter.md`

| Property | Value |
|----------|-------|
| **Name** | scouter |
| **Color** | blue |
| **Model** | inherit |
| **Tools** | Bash, Read, Grep, Glob, Edit, Write |

**Description**: Deep codebase analysis specialist for patterns, dependencies, and architecture. Produces structured reports with file:line references.

**Use Cases**:
- Understanding existing implementations
- Tracing data flows
- Mapping dependencies
- Planning refactors

**Execution Phases**:

1. **Broad Search**: Find all potentially relevant files using Glob and Grep
2. **Deep Analysis**: Read and analyze key files (max 10-15)
3. **Synthesis**: Synthesize findings into structured report
4. **Report**: Save report using template

**Search Patterns**:

| Target | Search Approach |
|--------|-----------------|
| Architecture | Config files, main entry points, module boundaries |
| Data Flow | Routes, handlers, state management, DB queries |
| Dependencies | Import statements, package files, external API calls |
| Patterns | Factory, repository, service, controller classes |
| Tests | Test files, fixtures, mocks |

**Output Format**: Structured analysis report saved to `.claude/.reports/{YYYY-MM-DD-HHMM}-codebase-{area}.md`

**Report Sections**:
- Architecture & Structure (Directory organization, Design patterns)
- Key Files (Purpose and observations)
- Data Flow (Entry → Processing → Output)
- Dependencies (Internal tree, External packages)
- Integration Points
- Issues & Recommendations (Technical debt, Improvements)
- Code Snippets

---

### 3. Reviewer Agent

**File**: `.claude/agents/reviewer.md`

| Property | Value |
|----------|-------|
| **Name** | reviewer |
| **Color** | green |
| **Model** | inherit |
| **Tools** | Bash, Read, Grep, Glob, Edit, Write |

**Description**: Isolated code review specialist with fresh context for unbiased analysis. Produces structured reports with verdict (Approved/Needs Changes).

**Use Cases**:
- Post-implementation review
- Pre-merge validation
- Security audits

**Severity Levels**:

| Level | Definition | Action Required |
|-------|------------|-----------------|
| **Critical** | Security vulnerabilities, data loss, broken functionality | Must fix before merge |
| **Warning** | Code smells, performance issues, missing error handling | Should fix |
| **Suggestion** | Style improvements, refactoring opportunities | Optional |

**Review Checklist Categories**:
- **Security**: Exposed secrets, input validation, SQL injection, XSS, auth checks
- **Code Quality**: Readability, single responsibility, duplication, naming, error handling
- **Performance**: N+1 queries, caching, memory leaks, algorithms
- **Testing**: Coverage, edge cases, maintainability

**Verdict Guidelines**:

| Verdict | Conditions |
|---------|------------|
| **Approved** | No Critical issues, Warnings are minor |
| **Needs Changes** | Any Critical issues, multiple significant Warnings, or security concerns |

**Output Format**: Code review report saved to `.claude/.reports/{YYYY-MM-DD-HHMM}-review-{scope}.md`

---

## Skills

### 1. Planning Skill

**Path**: `.claude/skills/planning/`

| Property | Value |
|----------|-------|
| **Name** | planning |
| **Purpose** | Implementation planning with Spec-Driven Development (SDD) |

**Triggers**:
- Starting new feature development
- Breaking down complex requirements
- Estimating AI-assisted development tasks
- Creating hierarchical project plans

**Core Concept**: Spec-Driven Development (SDD)
```
Spec → Plan → Execute
```
SDD outperforms unstructured prompting by **8x** for accuracy.

**Hierarchical Plan Structure**:
```
.plans/{feature}/
├── _master.md          # Overview, phases, status
├── phase-1-setup.md    # Detailed phase plan
├── phase-2-core.md     # Each phase self-contained
└── phase-3-polish.md
```

**AI Augmentation Factor (AAF)**:

| Task Type | AAF | Notes |
|-----------|-----|-------|
| Boilerplate | 0.3-0.5 | AI excels at repetitive code |
| Standard features | 0.5-0.7 | Well-documented patterns |
| Complex logic | 0.8-1.0 | AI assists, human leads |
| Novel problems | 1.0-1.2 | AI may slow down |
| Integration work | 1.2-1.5 | Context switching overhead |

**T-Shirt Sizing**:

| Size | Effort | Description |
|------|--------|-------------|
| XS | < 2 hours | Single function, config change |
| S | 2-4 hours | Single component, simple endpoint |
| M | 4-8 hours | Feature slice, multiple components |
| L | 1-3 days | Complex feature, multiple integrations |
| XL | 3-5 days | Major feature, architectural changes |

**References**:
- `references/task-breakdown.md` - INVEST, vertical slicing, sizing
- `references/estimation.md` - AAF, T-shirt sizing, anti-patterns
- `references/risk-management.md` - Risk identification and response

**Templates**:
- `templates/master-plan.md` - Hierarchical master plan template
- `templates/phase-plan.md` - Sub-plan template with tasks

---

### 2. Implementation Skill

**Path**: `.claude/skills/implementation/`

| Property | Value |
|----------|-------|
| **Name** | implementation |
| **Purpose** | Code writing best practices for clean, maintainable software |

**Triggers**:
- Writing new code or features
- Reviewing code quality
- Refactoring existing code
- Pair programming with AI

**Clean Code Principles**:
```
1. Readable > Clever
2. Simple > Complex
3. Explicit > Implicit
4. Consistent > Perfect
```

**Function Design Guidelines**:
- Target: Under 20 lines
- Parameters: 0-3 maximum
- Small, focused, clear naming

**AI-Assisted Coding Model**:

| AI Task | Human Task |
|---------|------------|
| Generate boilerplate | Review for correctness |
| Suggest implementations | Validate architecture |
| Write tests | Verify edge cases |
| Draft documentation | Ensure accuracy |

**SOLID Principles Quick Reference**:

| Principle | Meaning | Violation Sign |
|-----------|---------|----------------|
| **S**ingle Responsibility | One reason to change | "...and..." in description |
| **O**pen/Closed | Extend, don't modify | Switch statements everywhere |
| **L**iskov Substitution | Subtypes replaceable | `instanceof` checks |
| **I**nterface Segregation | Small, focused interfaces | Implementing unused methods |
| **D**ependency Inversion | Depend on abstractions | Direct `new` of dependencies |

**References**:
- `references/clean-code.md` - SOLID, YAGNI, DRY principles
- `references/naming.md` - Language-specific naming
- `references/error-handling.md` - Error categories and patterns

**Examples**:
- `examples/function-design.md` - Small functions, parameters
- `examples/refactoring.md` - Extract method, TDD workflow

---

### 3. Testing Skill

**Path**: `.claude/skills/testing/`

| Property | Value |
|----------|-------|
| **Name** | testing |
| **Purpose** | Testing patterns, strategies, and best practices |

**Triggers**:
- Writing tests for new code
- Reviewing test coverage
- Choosing testing approach (TDD, BDD)
- Setting up test infrastructure

**Testing Philosophy**:
```
Tests are documentation that never lies.
Tests are a safety net for refactoring.
Tests give confidence to ship.
```

**Test Types**:

| Type | Scope | Speed | Confidence | When to Use |
|------|-------|-------|------------|-------------|
| Unit | Single function/class | Fast | Low-Medium | Pure logic, algorithms |
| Integration | Multiple components | Medium | Medium-High | Features, user flows |
| E2E | Entire system | Slow | High | Critical paths |
| Contract | API boundaries | Fast | Medium | Microservices |

**Coverage Target**: 80-90% meaningful coverage

**What to Test**:
- Business logic
- Edge cases
- Error handling
- Integration points
- User-facing features

**What NOT to Test**:
- Framework code
- Third-party libraries
- Configuration files
- Simple getters/setters
- Generated code

**AAA Pattern**:
```
Arrange: Set up test data
Act: Execute the code under test
Assert: Verify the outcome
```

**References**:
- `references/testing-pyramid.md` - Test type distribution
- `references/tdd-bdd.md` - Test-driven methodologies
- `references/test-coverage.md` - Coverage strategies

**Examples**:
- `examples/unit-tests.md` - AAA pattern, mocking
- `examples/integration-tests.md` - API testing, TestContainers

---

### 4. Documentation Skill

**Path**: `.claude/skills/documentation/`

| Property | Value |
|----------|-------|
| **Name** | documentation |
| **Purpose** | Documentation writing guidelines and templates |

**Triggers**:
- Creating project documentation
- Documenting architecture decisions
- Writing API documentation
- Maintaining changelogs

**Documentation Types**:

| Type | Purpose | Audience |
|------|---------|----------|
| README | Project overview, setup | All users |
| ADR | Architecture decisions | Developers |
| API Docs | Endpoint reference | API consumers |
| Changelog | Version history | All users |
| Guides | How-to tutorials | Developers |

**Docs-as-Code Workflow**:
```
Write (Markdown) → Review (PR) → Build (CI) → Deploy (Static site)
```

**When to Comment**:
- Explains WHY (non-obvious reason)
- Documents gotcha or workaround
- Complex algorithm reference

**Templates**:
- `templates/readme.md` - Project README template
- `templates/adr.md` - Architecture Decision Record
- `templates/changelog.md` - Keep a Changelog format
- `templates/api-docs.md` - API documentation template

---

### 5. Security Audit Skill

**Path**: `.claude/skills/security-audit/`

| Property | Value |
|----------|-------|
| **Name** | security-audit |
| **Purpose** | Security review checklist and vulnerability assessment |

**Triggers**:
- Reviewing code for security issues
- Designing authentication/authorization
- Handling user input or external data
- Auditing dependencies

**Security Review Checklist**:
```
[ ] Input Validation     - All external data validated
[ ] Output Encoding      - Context-appropriate escaping
[ ] Authentication       - Strong, properly implemented
[ ] Authorization        - Least privilege enforced
[ ] Data Protection      - Encryption at rest/transit
[ ] Error Handling       - No sensitive data leaked
[ ] Logging              - Security events captured
[ ] Dependencies         - No known vulnerabilities
```

**OWASP Top 10 (2021) Quick Reference**:

| # | Vulnerability | Quick Fix |
|---|---------------|-----------|
| 1 | Broken Access Control | Deny by default, enforce server-side |
| 2 | Cryptographic Failures | Use standard algorithms, protect keys |
| 3 | Injection | Parameterized queries, validate input |
| 4 | Insecure Design | Threat model, secure patterns |
| 5 | Security Misconfiguration | Harden defaults, minimal install |
| 6 | Vulnerable Components | Audit deps, update regularly |
| 7 | Auth Failures | MFA, rate limiting, secure sessions |
| 8 | Data Integrity Failures | Verify signatures, trusted sources |
| 9 | Logging Failures | Log security events, monitor |
| 10 | SSRF | Validate URLs, blocklist internal |

**LLM/AI Security (2025)**:

| Risk | Mitigation |
|------|------------|
| Prompt Injection | Separate user input from instructions |
| Data Leakage | Don't include secrets in prompts |
| Excessive Agency | Limit AI capabilities, require confirmation |
| Model Poisoning | Validate training data sources |
| Output Validation | Sanitize AI-generated content |

**References**:
- `references/owasp-top10.md` - Vulnerability details and mitigations
- `references/auth-patterns.md` - OAuth, JWT, sessions
- `references/input-validation.md` - Validation strategies
- `references/secrets-management.md` - Secure credential handling
- `references/dependency-security.md` - SBOM, SCA tools

---

### 6. Git Workflow Skill

**Path**: `.claude/skills/git-workflow/`

| Property | Value |
|----------|-------|
| **Name** | git-workflow |
| **Purpose** | Git conventions, branching strategies, and commit practices |

**Triggers**:
- Choosing a branching strategy
- Writing commit messages
- Creating pull requests
- Reviewing code

**Branching Strategy Selection**:

| Situation | Recommended Strategy |
|-----------|---------------------|
| CI/CD, frequent deploys | Trunk-based development |
| Multiple release versions | GitFlow |
| Small team, single product | GitHub Flow |
| Open source project | Fork & Pull Request |

**Conventional Commits**:
```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

**Commit Types**:

| Type | Use For |
|------|---------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation |
| `style` | Formatting (no code change) |
| `refactor` | Code restructure |
| `perf` | Performance improvement |
| `test` | Adding tests |
| `chore` | Maintenance |

**PR Size Recommendations**:

| Size | Lines Changed | Review Time |
|------|--------------|-------------|
| XS | < 50 | 15 min |
| S | 50-200 | 30 min |
| M | 200-400 | 1 hour |
| L | 400-800 | 2+ hours |
| XL | > 800 | Split it |

**References**:
- `references/branching.md` - Trunk-based, GitFlow, GitHub Flow
- `references/conventional-commits.md` - Message format
- `references/pull-requests.md` - PR best practices
- `references/code-review.md` - Review guidelines

---

### 7. Code Patterns Skill

**Path**: `.claude/skills/code-patterns/`

| Property | Value |
|----------|-------|
| **Name** | code-patterns |
| **Purpose** | Design patterns reference and selection guide |

**Triggers**:
- Choosing architectural patterns
- Implementing common solutions
- Refactoring toward patterns
- Reviewing code structure

**Pattern Selection Guide**:

| Problem | Pattern |
|---------|---------|
| Too many constructor params | Builder |
| Need single instance | Singleton (sparingly) |
| Create objects without specifying class | Factory |
| Add behavior dynamically | Decorator |
| Notify multiple objects of changes | Observer/Pub-Sub |
| Handle request through chain | Chain of Responsibility |
| Encapsulate algorithm variations | Strategy |
| Track operation history | Command |
| Handle async workflows | Saga |
| Separate read/write models | CQRS |
| Handle cascading failures | Circuit Breaker |

**Modern Pattern Preferences (2025)**:
```
Composition > Inheritance
Functions > Classes (where appropriate)
Result types > Exceptions
Dependency Injection > Global state
Immutability > Mutability
```

**Pattern Categories**:

**Creational**:
- Factory - Create objects polymorphically
- Builder - Complex object construction
- Singleton - Global single instance (rarely)

**Structural**:
- Adapter - Convert interface
- Decorator - Add behavior dynamically
- Facade - Simplify complex subsystem

**Behavioral**:
- Strategy - Algorithm variations
- Observer - Event notification
- Command - Encapsulate operations

**Architectural**:
- CQRS - Separate read/write
- Event Sourcing - Audit trail needed
- Saga - Distributed transactions
- Circuit Breaker - Handle failures

**References**:
- `references/modern-patterns.md` - Saga, CQRS, Circuit Breaker
- `references/functional.md` - Result types, Railway Oriented
- `references/composition.md` - Composition over inheritance
- `references/solid.md` - Modern interpretation

**Examples**:
- `examples/pattern-usage.md` - Practical implementations

---

### 8. Gemini Skill

**Path**: `.claude/skills/gemini/`

| Property | Value |
|----------|-------|
| **Name** | gemini |
| **Purpose** | Execute Google Gemini CLI for AI-powered automation and analysis |

**Triggers**:
- Analyzing images, PDFs, screenshots, diagrams
- Processing media files Claude cannot read directly
- Code review and documentation generation
- Batch processing files with AI
- CI/CD pipeline integration

**Requirements**:
- Node.js 20+
- Gemini CLI: `npm install -g @google/gemini-cli`

**Quick Reference**:
```bash
# Non-interactive (automation) - ALWAYS use -p flag
gemini -p "prompt" --output-format json

# Parse JSON response (cross-platform)
gemini -p "query" --output-format json | node -p "JSON.parse(require('fs').readFileSync(0,'utf8')).response"

# With piped input
cat file.txt | gemini -p "analyze this"
git diff | gemini -p "write commit message" --output-format json
```

**Core Flags**:

| Flag | Short | Purpose |
|------|-------|---------|
| `--prompt` | `-p` | **Required** for non-interactive mode |
| `--output-format` | | `text`, `json`, `stream-json` |
| `--model` | `-m` | Model selection |
| `--sandbox` | `-s` | Safe sandboxed execution |
| `--yolo` | `-y` | Auto-approve actions (caution) |
| `--resume` | `-r` | Resume previous session |

**Models**:

| Model | Use Case |
|-------|----------|
| `gemini-2.5-flash` | Fast, automation (default) |
| `gemini-2.5-pro` | Complex reasoning, 1M context |
| `gemini-2.5-flash-lite` | Ultra-fast, simple tasks |
| `gemini-3-flash` | Preview, paid tier |
| `gemini-3-pro` | Preview, most powerful |

**Claude Code Integration Rules**:
1. Return EXACT response - Output raw `.response` value unmodified
2. DO NOT interpret - No summarizing or adding commentary
3. DO NOT wrap - No "Here's what Gemini said:" prefixes
4. Preserve formatting - Keep markdown, code blocks as-is

**References**:
- `references/cli-reference.md` - Complete flags, models, output schema
- `references/examples.md` - Code review, image analysis, CI/CD, batch processing

---

### 9. UI/UX Pro Max Skill

**Path**: `.claude/skills/ui-ux-pro-max/`

| Property | Value |
|----------|-------|
| **Name** | ui-ux-pro-max |
| **Purpose** | Frontend UI/UX design intelligence |

**Triggers**:
- User requests "beautiful", "stunning", "gorgeous", or "aesthetic" interfaces
- Design decisions before implementation
- Working with: website, landing page, dashboard, admin panel, e-commerce, SaaS, portfolio, blog, mobile app
- Elements: button, modal, navbar, sidebar, card, table, form, chart
- Styles: glassmorphism, claymorphism, minimalism, brutalism, neumorphism, bento grid, dark mode, skeuomorphism, flat design

**Searchable Database**:
- 50 UI styles
- 21 color palettes
- 50 font pairings
- 20 chart types
- 8 stacks (React, Next.js, Vue, Svelte, SwiftUI, React Native, Flutter, Tailwind)

**Search Domains**:

| Domain | Use For | Example Keywords |
|--------|---------|------------------|
| `product` | Product type recommendations | SaaS, e-commerce, portfolio, healthcare |
| `style` | UI styles, colors, effects | glassmorphism, minimalism, dark mode |
| `typography` | Font pairings, Google Fonts | elegant, playful, professional |
| `color` | Color palettes by product type | saas, ecommerce, healthcare, beauty |
| `landing` | Page structure, CTA strategies | hero, testimonial, pricing |
| `chart` | Chart types, library recommendations | trend, comparison, timeline |
| `ux` | Best practices, anti-patterns | animation, accessibility, z-index |
| `prompt` | AI prompts, CSS keywords | (style name) |

**Available Stacks**:

| Stack | Focus |
|-------|-------|
| `html-tailwind` | Tailwind utilities, responsive, a11y (DEFAULT) |
| `react` | State, hooks, performance, patterns |
| `nextjs` | SSR, routing, images, API routes |
| `vue` | Composition API, Pinia, Vue Router |
| `svelte` | Runes, stores, SvelteKit |
| `swiftui` | Views, State, Navigation, Animation |
| `react-native` | Components, Navigation, Lists |
| `flutter` | Widgets, State, Layout, Theming |

**Usage**:
```bash
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "<keyword>" --domain <domain> [-n <max_results>]
```

**Bundled Scripts**:
- `scripts/core.py` - Core utilities
- `scripts/search.py` - Searchable database interface

**Data Files** (16 CSV files):
- `data/charts.csv` - Chart type recommendations
- `data/colors.csv` - Color palettes
- `data/landing.csv` - Landing page structures
- `data/products.csv` - Product type recommendations
- `data/prompts.csv` - AI prompts
- `data/styles.csv` - UI style definitions
- `data/typography.csv` - Font pairings
- `data/ux-guidelines.csv` - UX best practices
- `data/stacks/*.csv` - 8 stack-specific guideline files

**Pre-Delivery Checklist**:
- Visual Quality (no emojis as icons, consistent icon set, correct brand logos)
- Interaction (cursor-pointer, hover states, transitions)
- Light/Dark Mode (contrast, visibility)
- Layout (spacing, responsive)
- Accessibility (alt text, labels, color not only indicator)

---

### 10. Skill Creator Skill

**Path**: `.claude/skills/skill-creator/`

| Property | Value |
|----------|-------|
| **Name** | skill-creator |
| **Purpose** | Guide for creating effective skills |

**Triggers**:
- Creating a new skill
- Updating an existing skill
- Extending Claude's capabilities with specialized knowledge

**What Skills Provide**:
1. Specialized workflows - Multi-step procedures for specific domains
2. Tool integrations - Instructions for working with specific file formats or APIs
3. Domain expertise - Company-specific knowledge, schemas, business logic
4. Bundled resources - Scripts, references, and assets for complex tasks

**Core Principles**:
- **Concise is Key** - Context window is a public good
- **Set Appropriate Degrees of Freedom** - Match specificity to task fragility

**Skill Anatomy**:
```
skill-name/
├── SKILL.md (required)
│   ├── YAML frontmatter metadata (required)
│   │   ├── name: (required)
│   │   └── description: (required)
│   └── Markdown instructions (required)
└── Bundled Resources (optional)
    ├── scripts/          - Executable code
    ├── references/       - Documentation for context loading
    └── assets/           - Files used in output
```

**Progressive Disclosure**:
1. Metadata (name + description) - Always in context (~100 words)
2. SKILL.md body - When skill triggers (<5k words)
3. Bundled resources - As needed by Claude

**Skill Creation Process**:
1. Understand the skill with concrete examples
2. Plan reusable skill contents (scripts, references, assets)
3. Initialize the skill (run `init_skill.py`)
4. Edit the skill (implement resources and write SKILL.md)
5. Package the skill (run `package_skill.py`)
6. Iterate based on real usage

**Bundled Scripts**:
- `scripts/init_skill.py` - Initialize new skill with template
- `scripts/package_skill.py` - Package skill into .skill file
- `scripts/quick_validate.py` - Validate skill structure

**References**:
- `references/workflows.md` - Sequential workflows and conditional logic
- `references/output-patterns.md` - Template and example patterns

---

## Commands

### 1. Brainstorm Command

**File**: `.claude/commands/brainstorm.md`

| Property | Value |
|----------|-------|
| **Invocation** | `/brainstorm [initial spec or feature description]` |
| **Purpose** | Start interactive brainstorm session to refine a specification |

**Description**: Creates structured spec through conversation with developer. This is a CONVERSATION, not automation - always wait for developer feedback.

**Output Path**: `.claude/.specs/{feature-name}.md`

**Execution Protocol**:

1. **Parse Feature Name** - Extract and convert to kebab-case
2. **Initialize Spec File** - Create using template
3. **Analyze Codebase** - Quick search + optional deep analysis via scouter/researcher
4. **Identify Gaps and Questions** - Missing information, decisions needed
5. **Present Findings** - **STOP and wait for developer**
6. **Conversation Loop** - Process responses, update spec, present remaining
7. **Finalize Spec** - Generate final spec when developer confirms

**Key Rules**:
- ALWAYS wait for developer response
- Use `Task(subagent_type: "scouter", ...)` for deep codebase analysis
- Use `Task(subagent_type: "researcher", ...)` for external research
- NEVER make decisions for the developer
- Update spec file after each developer input

**Spec Template Sections**:
1. Original Requirements
2. Analysis (Codebase Impact, Gaps Identified, Open Questions)
3. Approach Options (A/B with pros/cons, effort estimate)
4. Technical Decisions (table with choice, reason, date)
5. Final Spec (Objective, Requirements, Technical Approach, Out of Scope, Acceptance Criteria, Dependencies, Risks)

**Related Commands**:
- `/run feature {name}` - Execute feature workflow after finalization
- `/run bugfix {description}` - Skip brainstorm for simple bug fixes

---

### 2. Run Command

**File**: `.claude/commands/run.md`

| Property | Value |
|----------|-------|
| **Invocation** | `/run [workflow] [name-or-description]` |
| **Purpose** | Execute a development workflow with scale-adaptive routing |

**Description**: Orchestrates agents and skills through defined workflow phases with human confirmation points.

**Artifact Locations**:
- Specs: `.claude/.specs/`
- Reports: `.claude/.reports/`
- Plans: `.claude/.plans/`
- State: `.claude/.state/`

**Available Workflows**:

| Workflow | Requires Spec | Phases | Description |
|----------|---------------|--------|-------------|
| `feature` | Yes | research → plan → implement → test → review → commit | Complete workflow for new feature |
| `bugfix` | No | scout → analyze → plan → fix → test → commit | Bug investigation and fixing |
| `hotfix` | No | analyze → fix → test → commit | Urgent production fix |
| `refactor` | No | scout → plan → refactor → test → review → commit | Safe code refactoring |
| `research` | No | research → scout → summarize | Research without code changes |
| `review` | No | scout → review → report | Independent code review |
| `docs` | No | scout → plan → generate → commit | Documentation generation |

**Auto-Detection Mappings**:

| Intent | Workflow |
|--------|----------|
| Add NEW functionality, create, build, implement | `feature` |
| Fix something BROKEN, bug, error, defect | `bugfix` |
| URGENT, critical, production down, P0, emergency | `hotfix` |
| IMPROVE code without changing behavior | `refactor` |
| REVIEW code, PR, audit, check quality | `review` |
| LEARN, investigate, explore, compare, research | `research` |
| DOCUMENT, readme, api-docs, changelog | `docs` |

**Special Inputs**:
- `resume {name}` - Load state and continue from paused phase
- `status {name}` - Display current workflow state

**Agents Used**:

| Agent | Purpose | Invocation |
|-------|---------|------------|
| `researcher` | External documentation, best practices | `Task(subagent_type: "researcher", ...)` |
| `scouter` | Codebase analysis, pattern detection | `Task(subagent_type: "scouter", ...)` |
| `reviewer` | Code review with isolated/fresh context | `Task(subagent_type: "reviewer", ...)` |

**Skills Used**:

| Skill | Use For | Invocation |
|-------|---------|------------|
| `planning` | plan phases | `Skill(skill: "planning")` |
| `implementation` | implement, fix, refactor phases | `Skill(skill: "implementation")` |
| `testing` | test phases | `Skill(skill: "testing")` |
| `documentation` | docs, summarize phases | `Skill(skill: "documentation")` |
| `security-audit` | security review | `Skill(skill: "security-audit")` |
| `git-workflow` | commit phases | `Skill(skill: "git-workflow")` |

**Key Rules**:
- Use `Task(subagent_type: ...)` for all agent phases
- Use `Skill(skill: ...)` for all skill phases
- Use `AskUserQuestion` for all confirmations
- Use `TodoWrite` after every phase status change
- Use `Write` to save state file after every phase completion
- NEVER skip phases

---

## Global Rules

### 1. Code Quality (`rules/_global/code-quality.md`)

**Purpose**: Establish code quality standards across all development work.

**DO**:
- Write clean, readable, self-documenting code
- Follow existing patterns in the codebase
- Handle errors explicitly with meaningful messages
- Keep functions focused and single-purpose
- Use descriptive naming (verbs for functions, nouns for variables)

**DON'T**:
- Leave commented-out code
- Use magic numbers without constants
- Catch exceptions without handling them
- Create deeply nested conditionals
- Duplicate code - extract to shared functions

**Error Handling**:
- Always handle potential failure points
- Provide context in error messages
- Log errors with sufficient detail for debugging
- Fail fast and fail loudly in development

**Security**:
- Never log sensitive data (passwords, tokens, PII)
- Validate all external input
- Use parameterized queries for database operations
- Escape output in templates

---

### 2. Communication (`rules/_global/communication.md`)

**Purpose**: Guide output style and documentation practices.

**Output Style**:
- Be concise and direct
- Use code examples over lengthy explanations
- Format output for terminal readability
- Use markdown for structure

**When Explaining**:
- Start with the "what" before the "why"
- Use bullet points for multiple items
- Include command examples when relevant
- Reference file paths with line numbers

**Documentation**:
- Document the "why" not the "what"
- Keep comments minimal and meaningful
- Update docs when changing functionality
- Use JSDoc/docstrings for public APIs only

---

### 3. Knowledge Freshness (`rules/_global/knowledge-freshness.md`)

**Purpose**: Ensure accurate timestamps and current information.

**Date & Time Commands**:

| Purpose | Command | Example Output |
|---------|---------|----------------|
| Report timestamp | `date +"%Y-%m-%d %H:%M"` | 2026-01-02 14:30 |
| File naming | `date +"%Y-%m-%d-%H%M"` | 2026-01-02-1430 |
| Current year (searches) | `date +%Y` | 2026 |

**Research First**:
- Verify current best practices before implementing
- Check official documentation for latest APIs
- Look for deprecation warnings in existing code

**When Uncertain**:
- Use WebSearch for current information
- Check package versions and changelogs
- Verify compatibility with project dependencies

**Documentation Dates**:
- Note when documentation was last updated
- Prefer recent sources over older ones
- Cross-reference multiple sources for critical decisions

---

### 4. Safety (`rules/_global/safety.md`)

**Purpose**: Protect sensitive files and prevent dangerous operations.

**Protected Files** (never modify without explicit confirmation):
- `.env`, `.env.*` - Environment configuration
- `package-lock.json`, `yarn.lock` - Lock files
- `*.pem`, `*.key` - Certificates and keys
- `.git/` - Git internals
- `node_modules/` - Dependencies

**Dangerous Commands** (always warn before executing):
- `rm -rf` - Recursive deletion
- `git push --force` - Force push
- `git reset --hard` - Hard reset
- `DROP TABLE`, `DELETE FROM` without WHERE

**Credentials**:
- Never echo secrets to console
- Never commit credentials to git
- Use environment variables for sensitive values
- Redact secrets in logs and output

---

## Component Relationships

### Agent Dependencies

```
researcher ────┬──── WebSearch, WebFetch (external)
               └──── Produces .reports/ artifacts

scouter ───────┬──── Read, Grep, Glob (codebase)
               └──── Produces .reports/ artifacts

reviewer ──────┬──── Read, Grep, Glob (codebase)
               └──── Produces .reports/ with verdict
```

### Skill Dependencies

```
planning ──────────► implementation ──────────► testing
    │                      │                        │
    │                      ▼                        │
    └──────────────► git-workflow ◄─────────────────┘

security-audit ◄────── reviewer (uses during review phase)

code-patterns ◄──────── implementation (references patterns)
```

### Command → Agent → Skill Flow

```
/brainstorm
    └── scouter (optional)
    └── researcher (optional)
    └── Output: .specs/{name}.md

/run feature {name}
    ├── research phase
    │   ├── researcher (parallel)
    │   └── scouter (parallel)
    ├── plan phase
    │   └── planning skill
    ├── implement phase
    │   └── implementation skill
    ├── test phase
    │   └── testing skill
    ├── review phase
    │   └── reviewer agent
    └── commit phase
        └── git-workflow skill
```

### Workflow Phase Matrix

| Phase | researcher | scouter | reviewer | planning | implementation | testing | documentation | git-workflow |
|-------|------------|---------|----------|----------|----------------|---------|---------------|--------------|
| research | X | X | | | | | | |
| scout | | X | | | | | | |
| plan | | | | X | | | | |
| implement | | | | | X | | | |
| fix | | | | | X | | | |
| refactor | | | | | X | | | |
| test | | | | | | X | | |
| review | | | X | | | | | |
| summarize | | | | | | | X | |
| generate | | | | | | | X | |
| commit | | | | | | | | X |

---

## Configuration

### Settings File (`.claude/settings.json`)

```json
{
  "permissions": {
    "allow": [
      "Bash(git:*)",
      "Bash(npm:*)",
      "Bash(npx:*)",
      "Bash(python:*)",
      "Bash(python3:*)",
      "Bash(pytest:*)",
      "Bash(go:*)",
      "Bash(cargo:*)",
      "Task(*)",
      "Skill(*)",
      "Read(src/**)",
      "Read(docs/**)",
      "Read(.claude/**)",
      "Edit(src/**)",
      "Edit(docs/**)"
    ],
    "deny": [
      "Read(.env)",
      "Read(.env.*)",
      "Read(**/.env)",
      "Read(secrets/**)",
      "Read(credentials/**)",
      "Read(*.pem)",
      "Read(*.key)",
      "Edit(.env)",
      "Edit(.env.*)",
      "Edit(secrets/**)",
      "Bash(sudo:*)",
      "Bash(rm -rf:*)"
    ]
  },
  "env": {
    "CLAUDE_CODE_KIT_VERSION": "1.0.0"
  },
  "attribution": {
    "commit": "Generated with [Claude Code](https://claude.com/claude-code)\n\nCo-Authored-By: Claude <noreply@anthropic.com>",
    "pr": "Generated with [Claude Code](https://claude.com/claude-code)"
  }
}
```

### Permission Categories

| Category | Allowed | Denied |
|----------|---------|--------|
| **Bash** | git, npm, npx, python, python3, pytest, go, cargo | sudo, rm -rf |
| **Read** | src/**, docs/**, .claude/** | .env, secrets/**, credentials/**, *.pem, *.key |
| **Edit** | src/**, docs/** | .env, secrets/** |
| **Task** | All subagent types | - |
| **Skill** | All skills | - |

---

## File Inventory

### All Component Files

**Agents (3 files)**:
- `.claude/agents/researcher.md`
- `.claude/agents/scouter.md`
- `.claude/agents/reviewer.md`

**Skills (10 SKILL.md + 26 references + 6 templates + 5 examples + 5 scripts + 16 data files)**:
- `.claude/skills/planning/SKILL.md`
- `.claude/skills/planning/references/task-breakdown.md`
- `.claude/skills/planning/references/estimation.md`
- `.claude/skills/planning/references/risk-management.md`
- `.claude/skills/planning/templates/master-plan.md`
- `.claude/skills/planning/templates/phase-plan.md`
- `.claude/skills/implementation/SKILL.md`
- `.claude/skills/implementation/references/clean-code.md`
- `.claude/skills/implementation/references/naming.md`
- `.claude/skills/implementation/references/error-handling.md`
- `.claude/skills/implementation/examples/function-design.md`
- `.claude/skills/implementation/examples/refactoring.md`
- `.claude/skills/testing/SKILL.md`
- `.claude/skills/testing/references/testing-pyramid.md`
- `.claude/skills/testing/references/tdd-bdd.md`
- `.claude/skills/testing/references/test-coverage.md`
- `.claude/skills/testing/examples/unit-tests.md`
- `.claude/skills/testing/examples/integration-tests.md`
- `.claude/skills/documentation/SKILL.md`
- `.claude/skills/documentation/templates/readme.md`
- `.claude/skills/documentation/templates/adr.md`
- `.claude/skills/documentation/templates/changelog.md`
- `.claude/skills/documentation/templates/api-docs.md`
- `.claude/skills/security-audit/SKILL.md`
- `.claude/skills/security-audit/references/owasp-top10.md`
- `.claude/skills/security-audit/references/auth-patterns.md`
- `.claude/skills/security-audit/references/input-validation.md`
- `.claude/skills/security-audit/references/secrets-management.md`
- `.claude/skills/security-audit/references/dependency-security.md`
- `.claude/skills/git-workflow/SKILL.md`
- `.claude/skills/git-workflow/references/branching.md`
- `.claude/skills/git-workflow/references/conventional-commits.md`
- `.claude/skills/git-workflow/references/pull-requests.md`
- `.claude/skills/git-workflow/references/code-review.md`
- `.claude/skills/code-patterns/SKILL.md`
- `.claude/skills/code-patterns/references/modern-patterns.md`
- `.claude/skills/code-patterns/references/functional.md`
- `.claude/skills/code-patterns/references/composition.md`
- `.claude/skills/code-patterns/references/solid.md`
- `.claude/skills/code-patterns/examples/pattern-usage.md`
- `.claude/skills/gemini/SKILL.md`
- `.claude/skills/gemini/references/cli-reference.md`
- `.claude/skills/gemini/references/examples.md`
- `.claude/skills/ui-ux-pro-max/SKILL.md`
- `.claude/skills/ui-ux-pro-max/scripts/core.py`
- `.claude/skills/ui-ux-pro-max/scripts/search.py`
- `.claude/skills/ui-ux-pro-max/data/charts.csv`
- `.claude/skills/ui-ux-pro-max/data/colors.csv`
- `.claude/skills/ui-ux-pro-max/data/landing.csv`
- `.claude/skills/ui-ux-pro-max/data/products.csv`
- `.claude/skills/ui-ux-pro-max/data/prompts.csv`
- `.claude/skills/ui-ux-pro-max/data/styles.csv`
- `.claude/skills/ui-ux-pro-max/data/typography.csv`
- `.claude/skills/ui-ux-pro-max/data/ux-guidelines.csv`
- `.claude/skills/ui-ux-pro-max/data/stacks/flutter.csv`
- `.claude/skills/ui-ux-pro-max/data/stacks/html-tailwind.csv`
- `.claude/skills/ui-ux-pro-max/data/stacks/nextjs.csv`
- `.claude/skills/ui-ux-pro-max/data/stacks/react-native.csv`
- `.claude/skills/ui-ux-pro-max/data/stacks/react.csv`
- `.claude/skills/ui-ux-pro-max/data/stacks/svelte.csv`
- `.claude/skills/ui-ux-pro-max/data/stacks/swiftui.csv`
- `.claude/skills/ui-ux-pro-max/data/stacks/vue.csv`
- `.claude/skills/skill-creator/SKILL.md`
- `.claude/skills/skill-creator/references/workflows.md`
- `.claude/skills/skill-creator/references/output-patterns.md`
- `.claude/skills/skill-creator/scripts/init_skill.py`
- `.claude/skills/skill-creator/scripts/package_skill.py`
- `.claude/skills/skill-creator/scripts/quick_validate.py`

**Commands (2 files)**:
- `.claude/commands/brainstorm.md`
- `.claude/commands/run.md`

**Rules (4 files)**:
- `.claude/rules/_global/code-quality.md`
- `.claude/rules/_global/communication.md`
- `.claude/rules/_global/knowledge-freshness.md`
- `.claude/rules/_global/safety.md`

**Configuration (2 files)**:
- `.claude/CLAUDE.md`
- `.claude/settings.json`

---

**Total Files Inventoried**: 81+ files across agents, skills, commands, rules, and configuration.
