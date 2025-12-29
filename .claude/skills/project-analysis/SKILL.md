---
name: project-analysis
description: >
  Comprehensive codebase analysis for Claude Code configuration.
  Use when users run /onboard to analyze a new project, detect tech stack,
  and recommend rules/skills setup. Supports JavaScript/TypeScript, Python,
  Go, Rust, Java, Ruby, PHP, C# projects including monorepos.
---

# Project Analysis Skill

Automates codebase analysis and Claude Code configuration recommendations.

## Overview

This skill analyzes a project's structure and tech stack to recommend appropriate:
- `.claude/rules/` files with accurate paths targeting
- Skills to enable for the project type
- Best practices configuration

**Output**: ONBOARD-REPORT.md containing all findings and recommendations.

## Analysis Workflow

Use this 5-step process when analyzing projects:

### Step 1: Detect Tech Stack

Analyze manifest and config files to identify languages, frameworks, databases, and tools.

**Priority order for detection:**
1. Package managers (package.json, requirements.txt, go.mod, Cargo.toml, etc.)
2. Configuration files (tsconfig.json, next.config.js, django settings, etc.)
3. Directory structure (src/, app/, api/, etc.)
4. Lock files (for version verification)

**What to detect:**
- Primary language(s)
- Frontend framework (if any)
- Backend framework (if any)
- Database/ORM (if any)
- Auth system (if any)
- Testing framework (if any)
- Build tools and infrastructure

**Reference for detailed detection:**
See [references/tech-detection.md](references/tech-detection.md) for comprehensive detection tables.

### Step 2: Analyze Project Structure

Map the project's directory structure to identify:

**Key directories:**
- Source code location (src/, app/, lib/, etc.)
- Component/module organization
- API/route definitions
- Test directories
- Configuration location
- Build/dist outputs

**Monorepo indicators:**
- Workspace configuration (nx.json, turbo.json, pnpm-workspace.yaml, lerna.json)
- Multiple package.json files
- Apps/packages directory structure

**Structure patterns by tech:**
- **Next.js**: app/ or pages/, components/, public/, lib/
- **React SPA**: src/components/, src/hooks/, src/services/
- **Express/Node**: src/routes/, src/middleware/, src/models/
- **Django**: project_name/, apps/, manage.py, settings/
- **FastAPI**: app/routers/, app/models/, app/schemas/
- **Go**: cmd/, internal/, pkg/
- **Monorepo**: apps/, packages/, libs/

Record all paths accurately - they'll be used in rules' `paths:` targeting.

### Step 3: Identify Project Domains

Determine logical domains to organize rules recommendations:

**Single-app project:**
- Domain = entire project
- Group all recommendations together

**Monorepo:**
- Group by workspace structure (apps/web, apps/api, packages/ui, etc.)
- Detect technology per domain (frontend app vs backend API)
- Each domain gets separate rules recommendations

**Domain detection signals:**
- Separate package.json indicates separate domain
- Different tech stack (e.g., Next.js vs Express)
- Organizational boundaries (apps/ vs packages/)

### Step 3.5: Detect Business Domain (NEW)

Analyze the codebase to detect business domain beyond just tech stack.

**Reference for domain detection:**
See [references/domain-detection.md](references/domain-detection.md) for domain keyword tables and detection patterns.

**Domain detection process:**
1. Grep codebase for domain-specific keywords
2. Analyze model/entity names
3. Check API route patterns
4. Review folder naming conventions
5. Calculate confidence score (High/Medium/Low)

**Detected domains:**
- E-commerce (cart, checkout, payment, order)
- Healthcare (patient, appointment, prescription)
- Fintech (transaction, account, ledger)
- EdTech (course, lesson, enrollment)
- Booking (reservation, availability, slot)
- Social (post, feed, comment, follow)
- Analytics (dashboard, metric, report)
- And more...

**Output:** List of detected domains with confidence levels and evidence

### Step 3.6: Detect Architectural Patterns (NEW)

Analyze code structure for common architectural patterns.

**Reference for pattern detection:**
See [references/pattern-agent-templates.md](references/pattern-agent-templates.md) for pattern detection keywords.

**Pattern detection process:**
1. Grep for state machine patterns (status, state, transition)
2. Grep for event-driven patterns (emit, publish, subscribe)
3. Grep for pipeline patterns (pipeline, stage, step)
4. Grep for queue patterns (queue, job, worker)
5. Identify entities involved in each pattern

**Detected patterns:**
- State Machine (Order states, Booking states, etc.)
- Event-Driven (Event emitters, handlers)
- Pipeline (Data transformation pipelines)
- Queue/Worker (Background job processing)
- CQRS, Saga, etc.

**Output:** List of detected patterns with key files and entities

### Step 4: Generate Recommendations

For each detected technology, recommend appropriate rules files, skills, and agents.

**Recommendation process:**
1. Identify detected tech stack components
2. Look up corresponding rule templates (organized in mixed folder structure)
3. Customize templates with actual project paths
4. Generate EXISTING skill recommendations using tech-to-skill mapping
5. Generate EXISTING agent recommendations using tech-to-agent mapping
6. **Generate NEW skill recommendations** based on detected domains
7. **Generate NEW agent recommendations** based on detected patterns
8. Consider project-specific patterns found in analysis
9. Group recommendations by domain (for monorepos)

**Reference for rules templates:**
See [references/rules-templates.md](references/rules-templates.md) for all rule templates with mixed folder structure (_global/, frontend/, backend/, devops/, testing/, security/).

**Reference for skill recommendations:**
See [references/tech-to-skill-mapping.md](references/tech-to-skill-mapping.md) to map detected technologies to relevant skills AND recommend creating new domain skills.

**Reference for agent recommendations:**
See [references/tech-to-agent-mapping.md](references/tech-to-agent-mapping.md) to map project characteristics to useful agents AND recommend creating new pattern agents.

**Reference for domain skill templates:**
See [references/domain-skill-templates.md](references/domain-skill-templates.md) for templates to generate domain-specific skills.

**Reference for pattern agent templates:**
See [references/pattern-agent-templates.md](references/pattern-agent-templates.md) for templates to generate pattern-specific agents.

**CRITICAL - CODE-FOCUS REQUIREMENT:**
- NEW domain skills must document ACTUAL CODE from the project, NOT generic domain advice
- NEW pattern agents must reference ACTUAL CODE with file:line locations and project-specific grep commands
- All generated content must include code snippets extracted from the actual codebase

**Always recommend (global rules):**
- _global/code-style.md (universal coding standards, no paths)
- _global/git-workflow.md (if .git exists, no paths)

**Conditional recommendations based on detection:**
- frontend/components.md (if React/Vue/Angular/Svelte detected)
- frontend/pages.md (if Next.js/Nuxt/SvelteKit detected)
- backend/api.md (if backend framework detected)
- backend/middleware.md (if Express/Fastify/Django detected)
- backend/database.md (if ORM detected)
- security/security.md (if auth system detected)
- testing/testing.md (if test framework detected)
- devops/docker.md (if Dockerfile exists)
- devops/ci.md (if .github/workflows or .gitlab-ci.yml exists)
- _global/monorepo.md (if monorepo detected)

**Skill recommendations (always provide):**
- Map detected technologies to skills
- Prioritize by relevance (4-7 skills maximum)
- Include rationale for each skill

**Agent recommendations (always provide):**
- Map project characteristics to agents
- Include usage guidance for each agent
- Note command invocation patterns

### Step 5: Create Output

Generate ONBOARD-REPORT.md with this structure:

```markdown
# Project Onboarding Report

Generated: [timestamp]

## Executive Summary

- **Project Type**: [e.g., Next.js Full-Stack Application]
- **Languages**: [e.g., TypeScript, JavaScript]
- **Key Frameworks**: [e.g., Next.js 14, React 18, Prisma]
- **Recommendations**: [X] rules files, [Y] skills, [Z] agents

## Codebase Analysis

### Architecture Overview
[Summary from scouter agent - if invoked]
- High-level architecture pattern (MVC, Clean Architecture, etc.)
- Key architectural decisions
- Integration points

### Data Flow
[Summary from scouter agent - if invoked]
- Request/response flow
- State management approach
- Data persistence patterns

### Dependencies
[Summary from scouter agent - if invoked]
- External dependencies analysis
- Internal module dependencies
- Dependency injection patterns

## Tech Stack Detection

### Languages
- [Language]: [version] (detected via [file])

### Frameworks
- [Framework]: [version] (detected via [file/dependency])

### Databases & ORMs
- [Database/ORM]: [version]

### Authentication
- [Auth system]: [version]

### Testing
- [Test framework]: [version]

### Build Tools
- [Tool]: [version]

### Infrastructure
- [Docker/CI/etc]

## Best Practices Research

[Summary from researcher agent - if invoked]

### Official Documentation
- [Framework]: Key patterns and recommendations from official docs

### Best Practices
- Industry standards for detected technologies
- Security considerations
- Performance optimization patterns

### Current State
- Latest versions and migration paths
- Breaking changes to be aware of

## Project Structure

```
project-root/
├── [key directories mapped]
```

**Key Paths:**
- Source: [path]
- Components: [path]
- APIs: [path]
- Tests: [path]
- Config: [path]

## Recommended Configuration

### Rules to Create

Rules are organized in mixed folder structure:

#### Global Rules (apply to all files)

##### 1. .claude/rules/_global/code-style.md
**Purpose**: Universal coding standards
**Frontmatter**: No paths (applies to all files)
**Template**: Built-in generic template
**Priority**: High

##### 2. .claude/rules/_global/git-workflow.md
**Purpose**: Git conventions and workflow
**Frontmatter**: No paths (applies to all files)
**Priority**: High

#### Frontend Rules (component/UI files)

##### 3. .claude/rules/frontend/components.md
**Purpose**: Component development patterns
**Frontmatter**: `paths: [COMPONENT_PATHS]`
**Example paths**: `src/components/**/*.{tsx,ts}, app/components/**/*.{tsx,ts}`
**Priority**: High

#### Backend Rules (API/service files)

##### 4. .claude/rules/backend/api.md
**Purpose**: API endpoint patterns
**Frontmatter**: `paths: [API_PATHS]`
**Example paths**: `src/routes/**/*.{ts,js}, app/api/**/*.ts`
**Priority**: High

#### [More rules organized by folder...]

### Skills to Enable

Based on your tech stack, these skills are recommended:

#### 1. frontend-design
**Why**: Provides React/Next.js component patterns and modern UI development best practices
**Use for**: Component development, styling patterns, accessibility

#### 2. architecture
**Why**: Covers API design, Prisma schema patterns, and backend architecture
**Use for**: System design decisions, database modeling, service organization

#### 3. security-review
**Why**: Essential for NextAuth setup, OAuth flows, and authentication security
**Use for**: Security audits, auth implementation review, vulnerability prevention

#### [More skills with rationale...]

### Agents to Use

Based on your project characteristics, these agents will be helpful:

#### Core Workflow Agents (Always Use)

- **planner** (opus): Use `/plan <task>` or `/feature <desc>` to create implementation plans
- **implementer** (sonnet): Use `/implement [path]` to execute plans with validation

#### Recommended for Your Project

- **researcher** (opus): Use `/research <topic>` to fetch current docs for Next.js, Prisma, NextAuth
  - Example: `/research Prisma relations` or `/research Next.js App Router`

- **test-writer** (sonnet): Use `/test <file>` to write comprehensive tests
  - Your project has Vitest - use this agent for test generation

- **code-reviewer** (sonnet): Use `/review [scope]` before commits/PRs
  - Essential with git repository detected

- **scouter** (opus): Use `/scout <topic>` for deep codebase analysis
  - Helpful for understanding complex areas before changes
  - Example: `/scout authentication flow`

- **security-auditor** (opus): Review security-critical code
  - Important due to NextAuth usage
  - Use for auth implementation audits

#### [More agents with usage guidance...]

### Example Workflow Commands

Based on your stack, these commands will be most useful:

- `/feature <description>` - Full feature workflow (plan → implement → test → review)
- `/research <topic>` - Fetch current documentation (e.g., `/research Prisma migrations`)
- `/scout <area>` - Deep codebase analysis (e.g., `/scout API architecture`)
- `/test <file>` - Generate comprehensive tests
- `/review` - Review changes before commit
- `/refactor <file>` - Safe code improvements

## Next Steps

1. **Review this report** - Verify detected technologies and recommendations are accurate
2. **Run with --apply** - Execute `/onboard --apply` to create all recommended rules
3. **Customize** - Edit generated rules to match your team's conventions
4. **Enable skills** - Skills are auto-loaded, but review recommendations above
5. **Try agents** - Use recommended agents via commands (e.g., `/research`, `/scout`)
6. **Test** - Try `/feature <simple-task>` to verify full workflow works

## Incremental Updates

[If .claude/ already exists, show this section:]

**Existing Configuration Detected:**

Already present:
- [List existing files]

New recommendations:
- [List files that would be added]

Conflicts:
- [List any conflicts - never overwrite, just note]

---
Generated by project-analysis skill
For questions or issues, refer to CLAUDE.md documentation
```

## Monorepo Handling

When monorepo is detected:

1. **Identify all workspaces:**
   - Parse workspace configuration files
   - Find all package.json files
   - Map workspace to directory structure

2. **Analyze each workspace separately:**
   - Treat each workspace as a mini-project
   - Detect tech stack per workspace
   - Note workspace dependencies

3. **Organize recommendations by domain:**
   ```markdown
   ## Recommended Configuration

   ### Global Rules (Apply to all workspaces)
   - .claude/rules/code-style.md
   - .claude/rules/git-workflow.md

   ### Workspace: apps/web (Next.js Frontend)
   - .claude/rules/web/components.md (paths: apps/web/components/**)
   - .claude/rules/web/pages.md (paths: apps/web/app/**)

   ### Workspace: apps/api (Express Backend)
   - .claude/rules/api/routes.md (paths: apps/api/src/routes/**)
   - .claude/rules/api/middleware.md (paths: apps/api/src/middleware/**)
   ```

4. **Note shared dependencies:**
   - Identify packages/ that are used by multiple apps
   - Recommend shared rules for common code

## Incremental Update Behavior

When running on a project with existing `.claude/` configuration:

**Detection:**
- Check if `.claude/` directory exists
- List existing rules files
- List existing skills
- Read existing settings.json

**Diff Generation:**
```
Existing Configuration:
✓ .claude/rules/code-quality.md
✓ .claude/skills/testing/

New Recommendations:
+ .claude/rules/components.md (for React components)
+ .claude/rules/api.md (for Express routes)

No Conflicts - all new files
```

**Merge Strategy:**
- **Never overwrite** existing files
- Only recommend new files that don't exist
- If similar file exists (e.g., custom components.md), note it and skip
- User can manually merge if desired

## Output Modes

### Analysis-Only (Default)
```bash
/onboard
```
- Run full analysis
- Create ONBOARD-REPORT.md
- Display summary to user
- Do not create any files

### Apply Mode
```bash
/onboard --apply
```
- Check if ONBOARD-REPORT.md exists
  - If NO: Run analysis first, then apply
  - If YES: Read report and apply recommendations
- Create all recommended rules files
- **Create recommended NEW domain skills** (using domain-skill-templates)
  - Must READ actual files and EXTRACT code snippets
  - Must include file:line references
  - Must NOT contain generic domain advice
- **Create recommended NEW pattern agents** (using pattern-agent-templates)
  - Must reference actual code defining states/events/stages
  - Must include project-specific grep commands
  - Must NOT contain generic debugging steps
- Use merge strategy for existing files
- Report what was created

## Technical Notes

### Performance Targets
- Complete analysis in < 30 seconds
- Handle monorepos with 10+ workspaces
- Process projects up to 100k LOC efficiently

### Accuracy Considerations
- Detection is best-effort based on standard patterns
- Edge cases may require user review
- False positives in framework detection are acceptable (user reviews before apply)
- False negatives are worse (missing important tech)

### Extensibility
- New tech stack support: Add to tech-detection.md
- New rule templates: Add to rules-templates.md
- No changes needed to this SKILL.md

## Reference Files

| File | When to Read |
|------|--------------|
| [references/tech-detection.md](references/tech-detection.md) | During Step 1 (tech stack detection) - comprehensive detection tables for all supported languages, frameworks, databases, testing tools |
| [references/rules-templates.md](references/rules-templates.md) | During Step 4 (generating recommendations) - complete rule templates with mixed folder structure and frontmatter format |
| [references/tech-to-skill-mapping.md](references/tech-to-skill-mapping.md) | During Step 4 (skill recommendations) - maps detected technologies to relevant skills with rationale |
| [references/tech-to-agent-mapping.md](references/tech-to-agent-mapping.md) | During Step 4 (agent recommendations) - maps project characteristics to useful agents with usage guidance |
| [references/domain-detection.md](references/domain-detection.md) | During Step 3.5 (domain detection) - domain keyword tables and detection patterns |
| [references/domain-skill-templates.md](references/domain-skill-templates.md) | During Step 4 (NEW skill generation) - templates for creating domain-specific skills |
| [references/pattern-agent-templates.md](references/pattern-agent-templates.md) | During Step 3.6 & 4 (pattern detection & NEW agent generation) - templates for creating pattern-specific agents |

These references are split out to keep this SKILL.md lean while providing comprehensive detection and templating capabilities.
