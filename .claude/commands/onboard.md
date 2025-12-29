---
description: Analyze project with deep codebase research and recommend Claude Code configuration. Use --apply to generate files.
allowed-tools: Read, Glob, Grep, Bash, Write, Skill, Task, AskUserQuestion
argument-hint: [--apply]
---

# Onboard Command

Automated project analysis with agent integration for comprehensive codebase understanding and Claude Code configuration setup.

## Overview

This command performs deep analysis using specialized agents and generates tailored recommendations for Claude Code configuration.

**Workflow:**
1. Argument parsing and mode detection
2. Scouter agent analysis (architecture, data flow, dependencies)
3. Tech stack detection (languages, frameworks, tools)
4. **Domain detection** (e-commerce, healthcare, fintech, etc.)
5. **Pattern detection** (state machine, event-driven, pipeline, etc.)
6. Researcher agent analysis (best practices for detected tech)
7. Generate recommendations (rules, EXISTING skills/agents, **NEW skills/agents**)
8. Create ONBOARD-REPORT.md
9. Apply configuration (if --apply flag present)

## Input

Arguments: $ARGUMENTS

Parse for `--apply` flag:

- If `--apply` present: Run analysis + create all recommended files
- If no flag: Run analysis only, create ONBOARD-REPORT.md

## Process

### Step 1: Detect Apply Mode and Check Existing Report

Check if user wants to apply changes immediately:

```
$ARGUMENTS contains "--apply" → Apply mode = true
$ARGUMENTS is empty or other → Apply mode = false
```

If apply mode is true:

- Check if `ONBOARD-REPORT.md` exists in project root
- If YES: Skip analysis, jump to Step 6 (apply from existing report)
- If NO: Continue with full analysis

**Output Progress**: "Starting onboard analysis..." or "Found existing ONBOARD-REPORT.md, proceeding to apply..."

### Step 1.5: Run Scouter Agent (Deep Codebase Analysis)

Use Task tool to invoke scouter agent for comprehensive codebase analysis.

**Prompt for scouter**:
```
Analyze this entire codebase with focus on:
1. Architecture - Overall system design, patterns, layer organization
2. Data Flow - How data moves through the system (request/response, state management)
3. Dependencies - External libraries, internal module dependencies, integration points

Provide a consolidated report with:
- Architecture Overview: High-level patterns, key decisions
- Data Flow Summary: Request handling, state management, persistence
- Dependency Analysis: External deps, internal coupling, integration patterns

Keep the report concise (3-5 paragraphs total) for inclusion in onboarding report.
```

**Invocation**:
```
Use Task tool with:
- task: "scouter agent codebase analysis"
- description: [prompt above]
```

**Handling Results**:
- If scouter succeeds: Store findings for ONBOARD-REPORT.md (Codebase Analysis section)
- If scouter fails or times out: Continue without scout findings, note in report
- Set timeout: 120 seconds (2 minutes) for large codebases

**Output Progress**: "Analyzing codebase architecture and dependencies..."

### Step 2: Detect Tech Stack

Use Skill tool with **project-analysis** skill to analyze the tech stack.

#### 2.1 Find Manifest Files

Use Glob to find all package managers and config files:

```bash
**/{package.json,requirements.txt,pyproject.toml,go.mod,Cargo.toml,pom.xml,build.gradle,Gemfile,composer.json,*.csproj,nx.json,turbo.json,pnpm-workspace.yaml}
```

#### 2.2 Detect Technologies

Read detected manifest files and reference project-analysis skill's `tech-detection.md`.

Record:

- Languages (with versions) - Priority: package manager manifests
- Frameworks (with versions) - Check dependencies
- Database/ORM systems - Check database libraries
- Auth systems - Check auth packages
- Testing frameworks - Check test dependencies
- Build tools - Check build configs
- Infrastructure - Look for Dockerfile, CI config
- Monorepo tools - Check for nx.json, turbo.json, workspace configs

**Output Progress**: "Detected [X] languages, [Y] frameworks..."

#### 2.3 Analyze Project Structure

Use Glob to map directory structure. Find key directories:

```bash
# Find all directories (limit depth to avoid node_modules, venv)
**/
```

Identify:

- Source code location (src/, app/, lib/, internal/)
- Component organization (components/, pages/, views/)
- API/route definitions (routes/, api/, routers/, handlers/)
- Test directories (tests/, __tests__/, test/, spec/)
- Configuration files (config/, prisma/, etc.)
- Build outputs (dist/, build/, target/)

Record all paths accurately - they'll be used for rules' `paths:` frontmatter.

**Output Progress**: "Mapping project structure..."

#### 2.4 Classify Topic for Researcher

Based on detected technologies, determine research topic classification:

**Topic Type**: DEFAULT (covers most onboarding cases)

**Dimensions to research**:
1. official-docs - Current documentation for detected frameworks
2. best-practices - Industry standards for the stack
3. examples - Common patterns and examples

**Tech to research**: List top 3-5 detected frameworks/tools (e.g., Next.js, Prisma, NextAuth)

### Step 2.5: Detect Business Domain (NEW)

Analyze the codebase to detect business domain beyond just tech stack.

**Reference**: `project-analysis` skill's `domain-detection.md`

**Process**:
1. Grep codebase for domain-specific keywords
2. Analyze model/entity names (Prisma schema, TypeORM entities, etc.)
3. Check API route patterns
4. Review folder naming conventions
5. Calculate confidence score (High/Medium/Low)

**Domain detection commands**:
```bash
# E-commerce detection
grep -r -i -c "cart\|checkout\|payment\|order\|inventory" --include="*.ts" --include="*.tsx" src/ 2>/dev/null | awk -F: '{sum += $2} END {print sum}'

# Healthcare detection
grep -r -i -c "patient\|appointment\|prescription\|diagnosis" --include="*.ts" --include="*.py" src/ 2>/dev/null | awk -F: '{sum += $2} END {print sum}'

# Fintech detection
grep -r -i -c "transaction\|account\|balance\|ledger\|transfer" --include="*.ts" --include="*.py" src/ 2>/dev/null | awk -F: '{sum += $2} END {print sum}'
```

**Confidence scoring**:
- 10+ keyword matches → High confidence
- 5-9 keyword matches → Medium confidence
- 1-4 keyword matches → Low (don't recommend)

**Output**: List of detected domains with evidence (keywords found, folders, routes)

### Step 2.6: Detect Architectural Patterns (NEW)

Analyze code structure for common architectural patterns that benefit from specialized agents.

**Reference**: `project-analysis` skill's `pattern-agent-templates.md`

**Process**:
1. Grep for state machine patterns (status, state, transition)
2. Grep for event-driven patterns (emit, publish, subscribe, handler)
3. Grep for pipeline patterns (pipeline, stage, step, processor)
4. Grep for queue patterns (queue, job, worker, Bull)
5. Identify key entities involved in each pattern

**Pattern detection commands**:
```bash
# State Machine Pattern
grep -r -l "status\|state.*=\|transition\|fsm" --include="*.ts" src/ 2>/dev/null | head -5

# Event-Driven Pattern
grep -r -l "emit\|publish\|subscribe\|addEventListener\|EventEmitter" --include="*.ts" src/ 2>/dev/null | head -5

# Pipeline Pattern
grep -r -l "pipeline\|stage\|step\|processor\|transform" --include="*.ts" src/ 2>/dev/null | head -5

# Queue/Worker Pattern
grep -r -l "queue\|job\|worker\|Bull\|BullMQ" --include="*.ts" src/ 2>/dev/null | head -5
```

**Entity identification**:
- For state machines: What entity has the states? (Order, Booking, Payment, etc.)
- For events: What events are emitted? (OrderPlaced, PaymentReceived, etc.)
- For pipelines: What data flows through? (User data, Analytics, etc.)

**Output**: List of detected patterns with key files and entities

### Step 3: Run Researcher Agent (Best Practices Lookup)

Use Task tool to invoke researcher agent for best practices research.

**Prompt for researcher**:
```
Research current best practices for this tech stack:
[List detected technologies, e.g., "Next.js 14, React 18, Prisma, NextAuth, Vitest"]

Focus on:
1. Official Documentation - Key patterns and recommendations
2. Best Practices - Security, performance, code organization
3. Current State - Latest versions, common patterns, migration paths

Provide a consolidated summary (3-5 paragraphs) suitable for onboarding report.
Include practical takeaways for Claude Code configuration.
```

**Invocation**:
```
Use Task tool with:
- task: "researcher agent for tech stack best practices"
- description: [prompt above]
```

**Handling Results**:
- If researcher succeeds: Store findings for ONBOARD-REPORT.md (Best Practices Research section)
- If researcher fails: Continue without research findings, note in report
- Set timeout: 120 seconds (2 minutes)

**Output Progress**: "Researching best practices for [frameworks]..."

### Step 4: Generate Recommendations

Using project-analysis skill's reference files, generate comprehensive recommendations.

#### 4.1 Rules Recommendations

Reference: `project-analysis` skill's `rules-templates.md`

**Process**:
1. Consult Tech-to-Rules Mapping Table
2. For each detected technology, identify recommended rules
3. Customize templates with actual project paths from Step 2.3
4. Organize by mixed folder structure: _global/, frontend/, backend/, devops/, testing/, security/

**Always recommend (global rules)**:
- `_global/code-style.md` (no paths - applies to all files)
- `_global/git-workflow.md` (if .git exists, no paths)

**Conditional recommendations**:
- `frontend/components.md` (if React/Vue/Angular/Svelte detected, with component paths)
- `frontend/pages.md` (if Next.js/Nuxt/SvelteKit detected, with page paths)
- `backend/api.md` (if backend framework detected, with API paths)
- `backend/middleware.md` (if Express/Fastify/Django detected, with middleware paths)
- `backend/database.md` (if ORM detected, with schema/model paths)
- `security/security.md` (if auth system detected, no paths - universal)
- `testing/testing.md` (if test framework detected, with test file paths)
- `devops/docker.md` (if Dockerfile exists, with Docker file paths)
- `devops/ci.md` (if CI config exists, with CI file paths)
- `_global/monorepo.md` (if monorepo detected, no paths)

**Path customization**:
- Replace placeholders: `[COMPONENT_PATHS]`, `[API_PATHS]`, `[DB_PATHS]`, `[TEST_PATHS]`
- Use actual paths from structure analysis
- Format: Single-line, comma-separated in frontmatter
- Example: `paths: src/components/**/*.{tsx,ts}, app/components/**/*.{tsx,ts}`

#### 4.2 Skills Recommendations

Reference: `project-analysis` skill's `tech-to-skill-mapping.md`

**Process**:
1. Consult mapping table for detected technologies
2. Include project characteristics (codebase size, has tests, has docs, etc.)
3. Generate 4-7 skill recommendations maximum
4. For each skill, provide rationale and use cases

**Always recommend**: `code-quality`, `git-workflow`

**Map technologies to skills** using reference table, e.g.:
- Next.js → `frontend-design`, `architecture`, `testing`
- Prisma → `architecture`, `testing`
- NextAuth → `security-review`, `architecture`

#### 4.3 Agent Recommendations (EXISTING)

Reference: `project-analysis` skill's `tech-to-agent-mapping.md`

**Process**:
1. Consult mapping table for project characteristics
2. Include core workflow agents (planner, implementer)
3. Add conditional agents based on detected infrastructure
4. Provide usage guidance and command examples for each

**Always recommend**: `planner`, `implementer`

**Conditional agents**:
- `code-reviewer` (if .git exists)
- `test-writer` (if testing framework detected)
- `scouter` (if codebase > 30 files or complex architecture)
- `researcher` (if uses external frameworks)
- `security-auditor` (if auth system detected)
- `refactorer` (if large/legacy codebase)
- `doc-writer` (if docs/ directory exists)
- `debugger` (always useful but not emphasized)

#### 4.4 NEW Skill Recommendations (Based on Detected Domain)

Reference: `project-analysis` skill's `domain-skill-templates.md`

**Process**:
1. For each domain detected with High/Medium confidence (from Step 2.5)
2. Recommend creating a domain-specific skill
3. Include evidence (keywords found, files, patterns)
4. Provide template preview with actual project paths

**Example output for E-commerce domain**:

```markdown
### NEW Skills to Create

#### 1. `ecommerce` Skill (RECOMMENDED TO CREATE)

**Why create:** Detected e-commerce domain with High confidence
**Evidence:**
- Keywords: cart (15), order (42), payment (28), checkout (8)
- Folders: src/services/payment/, src/services/order/
- Models: Product, Order, Cart, Payment in prisma/schema.prisma

**Proposed coverage** (focus on CODE PATTERNS):
- Payment integration patterns found in src/services/payment/
- Cart state management patterns in src/stores/cart.ts
- Order state transitions in src/services/order/orderService.ts
- Inventory update patterns in src/services/inventory/

**Key code files to document:**
- src/services/payment/stripeService.ts:20-80 (payment flow)
- src/services/order/orderService.ts:45-120 (order lifecycle)
- prisma/schema.prisma:50-100 (domain models)

**To create:** Run `/onboard --apply` or manually create `.claude/skills/ecommerce/SKILL.md`
```

#### 4.5 NEW Agent Recommendations (Based on Detected Patterns)

Reference: `project-analysis` skill's `pattern-agent-templates.md`

**Process**:
1. For each pattern detected (from Step 2.6)
2. Identify the entity involved (Order, Payment, Booking, etc.)
3. Recommend creating a pattern-specific agent
4. Include key files and states/events detected

**Example output for State Machine pattern**:

```markdown
### NEW Agents to Create

#### 1. `order-state-debugger` Agent (RECOMMENDED TO CREATE)

**Why create:** Order entity has complex state machine with 6 states
**Evidence:**
- Order states in prisma/schema.prisma: PENDING, PAID, PROCESSING, SHIPPED, DELIVERED, CANCELLED
- Transition logic in src/services/order/orderService.ts:45-120
- 15+ state transition functions detected

**Purpose:** Debug order state transitions when orders get stuck or skip states

**Key code locations:**
- State definitions: prisma/schema.prisma:75 (enum OrderStatus)
- Transition handlers: src/services/order/orderService.ts
- State validation: src/utils/orderValidation.ts

**Proposed agent definition:**
```yaml
name: order-state-debugger
description: Debug order state transitions and lifecycle issues
model: sonnet
tools: Read, Grep, Bash
skills: ecommerce, debugging
```

**To create:** Run `/onboard --apply` or manually create `.claude/agents/order-state-debugger.md`
```

**Output Progress**: "Generating recommendations..."

### Step 5: Create ONBOARD-REPORT.md

Generate comprehensive report using the template from project-analysis skill's SKILL.md.

**Report Structure** (with all new sections):

```markdown
# Project Onboarding Report

Generated: [timestamp]

## Executive Summary

- **Project Type**: [e.g., Next.js Full-Stack Application]
- **Languages**: [e.g., TypeScript]
- **Key Frameworks**: [e.g., Next.js 14, React 18, Prisma]
- **Recommendations**: [X] rules files, [Y] skills, [Z] agents

## Codebase Analysis

[Include scouter findings if available]

### Architecture Overview
[From scouter agent]
- High-level architecture pattern
- Key architectural decisions
- Integration points

### Data Flow
[From scouter agent]
- Request/response flow
- State management approach
- Data persistence patterns

### Dependencies
[From scouter agent]
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

## Domain Analysis

### Detected Domains

#### 1. [Domain Name] ([Confidence] Confidence)

**Evidence:**
- Keywords found: [keyword] ([count]), [keyword] ([count])
- Folders: [folder paths]
- Models/Entities: [model names in schema files]
- Routes: [API route patterns]

### Detected Architectural Patterns

#### 1. [Pattern Name] Pattern

**Entity:** [Entity involved, e.g., Order, Booking]
**Evidence:**
- States/Events: [list of states or events]
- Key files: [file:line references]
- Transition logic: [file:line]

## Best Practices Research

[Include researcher findings if available]

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
**Priority**: High

##### 2. .claude/rules/_global/git-workflow.md
**Purpose**: Git conventions and workflow
**Frontmatter**: No paths (applies to all files)
**Priority**: High

#### Frontend Rules (component/UI files)

##### 3. .claude/rules/frontend/components.md
**Purpose**: Component development patterns
**Frontmatter**: `paths: [actual component paths]`
**Priority**: High

#### Backend Rules (API/service files)

##### 4. .claude/rules/backend/api.md
**Purpose**: API endpoint patterns
**Frontmatter**: `paths: [actual API paths]`
**Priority**: High

[... more rules organized by folder ...]

### Skills to Enable (EXISTING)

Based on your tech stack, these existing skills are recommended:

#### 1. [skill-name]
**Why**: [Rationale based on detected tech]
**Use for**: [Specific use cases]

[... more existing skills with rationale ...]

### NEW Skills to Create

Based on detected domain and code patterns, these NEW skills should be created.

**IMPORTANT:** Skills document ACTUAL CODE from your project, NOT generic domain knowledge.

#### 1. `[domain]` Skill (RECOMMENDED TO CREATE)

**Why create:** Detected [domain] domain with [confidence] confidence
**Evidence:**
- Keywords: [keyword] ([count]), [keyword] ([count])
- Folders: [folder paths with domain logic]
- Models: [model names]

**Code patterns to document** (extracted from your codebase):

| Pattern | Location | Code Preview |
|---------|----------|--------------|
| [Entity] lifecycle | `[file:line-range]` | `function create[Entity]...` |
| State transitions | `[file:line-range]` | `validTransitions = {...}` |
| Error handling | `[file:line-range]` | `class [Domain]Error...` |

**Sample code extraction:**
```[language]
// From [file:line-range]
[ACTUAL_CODE_SNIPPET_FROM_PROJECT]
```

**Key files this skill will reference:**
- `[file]:[line-range]` - [purpose]
- `[file]:[line-range]` - [purpose]

**To create:** Run `/onboard --apply` or manually create `.claude/skills/[domain]/SKILL.md`

### Agents to Use (EXISTING)

Based on your project characteristics, these agents will be helpful:

#### Core Workflow Agents (Always Use)

- **planner** (opus): Use `/plan <task>` or `/feature <desc>` to create implementation plans
- **implementer** (sonnet): Use `/implement [path]` to execute plans with validation

#### Recommended for Your Project

[List recommended existing agents with usage guidance and examples]

### NEW Agents to Create

Based on detected architectural patterns, these NEW agents should be created.

**IMPORTANT:** Agents reference ACTUAL CODE with specific file:line locations and project-specific grep commands.

#### 1. `[entity]-state-debugger` Agent (RECOMMENDED TO CREATE)

**Why create:** [Entity] has complex state machine with [N] states
**Evidence:**
- States: [list of states from schema/code]
- Transition logic: [file:line-range]
- [N] state transition functions detected

**Purpose:** Debug [entity] state transitions when [entity]s get stuck or skip states

**Code this agent will reference:**

```[language]
// State enum from [file:line]
enum [Entity]Status {
  [ACTUAL_STATES_FROM_PROJECT]
}

// Transition logic from [file:line-range]
const validTransitions = {
  [ACTUAL_TRANSITIONS_FROM_PROJECT]
};
```

**Debug commands for this project:**
```bash
# Find state definition
grep -n "enum [Entity]Status" [schema_file]

# Find transition callers
grep -rn "transition[Entity]State" src/

# Check state handlers
grep -rn "case '[STATE_NAME]'" src/
```

**Proposed definition:**
```yaml
name: [entity]-state-debugger
description: Debug [entity] state transitions and lifecycle issues
model: sonnet
tools: Read, Grep, Bash
skills: [domain], debugging
```

**To create:** Run `/onboard --apply` or manually create `.claude/agents/[entity]-state-debugger.md`

### Example Workflow Commands

Based on your stack, these commands will be most useful:

- `/feature <description>` - Full feature workflow (plan → implement → test → review)
- `/research <topic>` - Fetch current documentation
- `/scout <area>` - Deep codebase analysis
- `/test <file>` - Generate comprehensive tests
- `/review` - Review changes before commit

## Next Steps

1. **Review this report** - Verify detected technologies and recommendations
2. **Run with --apply** - Execute `/onboard --apply` to create all recommended rules
3. **Customize** - Edit generated rules to match your team's conventions
4. **Enable skills** - Skills are auto-loaded, but review recommendations above
5. **Try agents** - Use recommended agents via commands
6. **Test** - Try `/feature <simple-task>` to verify full workflow works

## Incremental Updates

[If .claude/ already exists, show this section]

**Existing Configuration Detected:**

Already present:
- [List existing files]

New recommendations:
- [List files that would be added]

Conflicts:
- [List any conflicts - never overwrite, just note]

---
Generated by project-analysis skill with scouter and researcher agents
For questions or issues, refer to CLAUDE.md documentation
```

Write report to `ONBOARD-REPORT.md` in project root.

**Output Progress**: "Created ONBOARD-REPORT.md"

### Step 6: Display Summary to User

After creating report, show concise summary:

```markdown
# Onboarding Analysis Complete

## Detected Tech Stack

- Languages: [List]
- Frameworks: [List]
- Database: [List]
- Auth: [List]
- Testing: [List]

## Analysis Performed

- Codebase architecture analysis (scouter agent)
- Best practices research (researcher agent)
- Tech stack detection
- Project structure mapping

## Recommendations

- [X] rules files to create (organized in mixed folder structure)
- [Y] skills to enable
- [Z] agents to use

## Next Steps

Full report: ONBOARD-REPORT.md

To apply all recommendations:
/onboard --apply
```

If apply mode was false, STOP HERE.

### Step 7: Apply Recommendations (Only if --apply flag)

If apply mode is true, continue:

#### 7.1 Parse ONBOARD-REPORT.md

Read the report and extract:

- All recommended rules files (folder path + frontmatter + content)
- Project-specific skills needed (if any)

#### 7.2 Create Folder Structure

Create the mixed folder structure:

```bash
mkdir -p .claude/rules/_global
mkdir -p .claude/rules/frontend
mkdir -p .claude/rules/backend
mkdir -p .claude/rules/devops
mkdir -p .claude/rules/testing
mkdir -p .claude/rules/security
```

#### 7.3 Check for Existing Files

For each recommended rule file:

- Check if file already exists at full path (e.g., `.claude/rules/frontend/components.md`)
- If exists: Skip and note in "Already Present" list
- If not exists: Add to "Will Create" list

#### 7.4 Create Rules Files

For each file in "Will Create" list:

1. Use template from `rules-templates.md` reference
2. Customize with actual paths from analysis
3. Format frontmatter as single line: `paths: glob1, glob2, glob3`
4. For global rules: omit paths field entirely (applies to all files)
5. Write file to appropriate folder location
6. Track created files for summary

**Frontmatter format**:
```yaml
---
paths: src/components/**/*.{tsx,ts}, app/components/**/*.{tsx,ts}
---
```

OR for global rules:
```yaml
---
# No paths field - applies to all files
---
```

#### 7.5 Create NEW Domain Skills (If Recommended)

**CRITICAL: Skills must contain ACTUAL CODE from the project, not generic advice.**

For each domain skill recommended in the report:

1. Create skill directory: `mkdir -p .claude/skills/[domain]`
2. Load template from `domain-skill-templates.md`
3. **READ the actual files** identified during domain detection
4. **EXTRACT code snippets** with line numbers:
   ```bash
   # Extract actual code
   sed -n '45,78p' src/services/order/orderService.ts
   ```
5. Customize template with EXTRACTED code:
   - Replace `[ACTUAL_CODE_FROM_PROJECT]` with real code
   - Replace `[FILE_PATH]:[LINE_RANGE]` with actual locations
   - Replace `[NAMING_PATTERNS]` with patterns found in codebase
6. Write to `.claude/skills/[domain]/SKILL.md`
7. Track created skills for summary

**Skill content requirements:**
- ✅ Actual code snippets from project files
- ✅ File:line references for all patterns
- ✅ Real function/class names from codebase
- ✅ Project-specific conventions and naming
- ❌ Generic domain advice (NO!)
- ❌ Industry best practices not in codebase (NO!)

**Example of what skill should contain:**
```markdown
## Pattern: Order State Transitions

**Source:** `src/services/order/orderService.ts:45-78`

```typescript
// ACTUAL CODE FROM THIS PROJECT
export async function transitionOrderState(orderId: string, newState: OrderStatus) {
  const validTransitions: Record<OrderStatus, OrderStatus[]> = {
    PENDING: ['PAID', 'CANCELLED'],
    PAID: ['PROCESSING', 'REFUNDED'],
    // ...
  };
}
```
```

#### 7.6 Create NEW Pattern Agents (If Recommended)

**CRITICAL: Agents must reference ACTUAL CODE with specific grep commands for THIS project.**

For each pattern agent recommended in the report:

1. Load template from `pattern-agent-templates.md`
2. **READ the actual files** where pattern was detected
3. **EXTRACT the code** that defines the pattern:
   ```bash
   # Get actual state enum
   grep -n "enum.*Status" prisma/schema.prisma
   # Get actual transition logic
   grep -A 20 "validTransitions" src/services/order/orderService.ts
   ```
4. Customize template with EXTRACTED code:
   - Replace `[entity]` with actual entity (Order, Booking, etc.)
   - Replace `[ACTUAL_ENUM_OR_STATE_DEFINITION]` with real enum code
   - Replace `[ACTUAL_TRANSITION_LOGIC]` with real transition code
   - Replace grep patterns with project-specific file paths
5. Write to `.claude/agents/[entity]-[pattern].md`
6. Track created agents for summary

**Agent content requirements:**
- ✅ Actual code defining states/events/stages
- ✅ File:line references for key locations
- ✅ Grep commands using actual project file paths
- ✅ Valid state transitions extracted from code
- ❌ Generic debugging steps (NO!)
- ❌ Placeholder file paths (NO!)

**Example of what agent should contain:**
```markdown
## State Machine Definition

**States defined in:** `prisma/schema.prisma:75`

```prisma
enum OrderStatus {
  PENDING
  PAID
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
}
```

## Debug Commands

### Find transition callers
```bash
grep -rn "transitionOrderState" src/
```
```

#### 7.7 Report Results

Display what was created:

```markdown
# Onboard Complete

## Folder Structure Created

.claude/rules/
├── _global/
│   ├── code-style.md
│   └── git-workflow.md
├── frontend/
│   ├── components.md
│   └── pages.md
├── backend/
│   ├── api.md
│   ├── middleware.md
│   └── database.md
├── security/
│   └── security.md
├── testing/
│   └── testing.md
└── devops/
    ├── docker.md
    └── ci.md

## Files Created ([X] total)

### Rules
✓ .claude/rules/_global/code-style.md
✓ .claude/rules/_global/git-workflow.md
✓ .claude/rules/frontend/components.md
✓ .claude/rules/frontend/pages.md
✓ .claude/rules/backend/api.md
✓ .claude/rules/backend/middleware.md
✓ .claude/rules/backend/database.md
✓ .claude/rules/security/security.md
✓ .claude/rules/testing/testing.md
✓ .claude/rules/devops/docker.md
✓ .claude/rules/devops/ci.md

### NEW Domain Skills Created
✓ .claude/skills/ecommerce/SKILL.md (e-commerce patterns from your codebase)
✓ .claude/skills/project-conventions/SKILL.md (your project's specific patterns)

### NEW Pattern Agents Created
✓ .claude/agents/order-state-debugger.md (Order state machine debugging)
✓ .claude/agents/payment-validator.md (Payment flow validation)

## Already Present

- .claude/rules/code-quality.md (keeping your version)

## Next Steps

1. Review generated files - customize as needed
2. Skills are auto-loaded by skill-loader hook
3. Try recommended commands:
   - /feature "add new feature"
   - /research "Prisma relations"
   - /scout "authentication flow"
   - /review
   - /test path/to/file

Your Claude Code configuration is ready!
```

## Incremental Update Handling

If `.claude/` directory already exists:

### Detection

- List existing `.claude/rules/` files (including subfolders)
- List existing `.claude/skills/` directories

### Diff Generation

Show in ONBOARD-REPORT.md:

```markdown
## Incremental Updates

### Existing Configuration Detected

Already present:

- .claude/rules/code-quality.md
- .claude/rules/communication.md
- .claude/skills/testing/

New recommendations:

- .claude/rules/frontend/components.md (for React components)
- .claude/rules/backend/api.md (for Express routes)
- .claude/rules/backend/database.md (for Prisma schema)

Conflicts: None
```

### Merge Strategy

- **Never overwrite** existing files
- Only create files that don't exist
- If similar file exists at different path (e.g., user has `.claude/rules/react.md` but we recommend `.claude/rules/frontend/components.md`), note both but don't replace
- User can manually merge or reorganize if desired

## Error Handling

### Scouter Agent Fails or Times Out

```
⚠ Scouter agent timed out or failed.
Continuing with tech stack detection...

Note: ONBOARD-REPORT.md will not include codebase architecture analysis.
For deep analysis, try: /scout "codebase overview"
```

- Continue with rest of workflow
- Note in report that scouter analysis unavailable
- Suggest manual `/scout` command for later

### Researcher Agent Fails or Times Out

```
⚠ Researcher agent failed to fetch best practices.
Falling back to training knowledge for recommendations...

Note: ONBOARD-REPORT.md will not include current best practices research.
For specific research, try: /research "<framework> best practices"
```

- Continue with rest of workflow
- Note in report that researcher findings unavailable
- Use training knowledge for recommendations with staleness warning

### No Manifest Files Found

```
Unable to detect project type. This may not be a code project, or it uses an unsupported language.

Supported: JavaScript/TypeScript, Python, Go, Rust, Java, Ruby, PHP, C#
```

Use AskUserQuestion tool: "How would you like to proceed?"
Options:

- Specify project type manually
- Proceed with minimal configuration (global rules only)
- Cancel

### Analysis Fails

- Log error details
- Create partial report with what was detected
- Note analysis failure in report
- Include sections that were successful
- Suggest manual review and re-run

### File Creation Fails

- Report which files failed to create
- Note error message
- Continue with other files
- Summarize successes and failures
- Suggest manual creation for failed files

## Performance Notes

- Target: Complete full analysis (including agents) in < 2 minutes
- Scouter timeout: 120 seconds
- Researcher timeout: 120 seconds
- Run agents in sequence (not parallel) to avoid overwhelming Task tool
- Use Glob efficiently (specific patterns, exclude node_modules/, venv/, dist/)
- Read files in parallel when possible for tech detection
- Cache file contents when checking multiple patterns

## Output Files

This command creates:

1. **ONBOARD-REPORT.md** (always) - Full analysis report in project root
2. **.claude/rules/\*\*/\*.md** (if --apply) - Rules in mixed folder structure
3. **.claude/skills/[domain]/SKILL.md** (if --apply and domain detected) - Domain-specific skills with code patterns
4. **.claude/agents/[entity]-[pattern].md** (if --apply and patterns detected) - Pattern-specific agents

## Integration with Agent Workflow

This command uses:

- **scouter agent** (via Task tool) - Deep codebase analysis
- **researcher agent** (via Task tool) - Best practices lookup
- **skill-creator skill** (optional, if available) - Project-specific skill generation
- **project-analysis skill** - Tech detection and recommendation logic

## Testing Guidance

To verify onboard command works correctly:

1. **Test advisory mode**: `/onboard` on test project
   - Verify ONBOARD-REPORT.md created
   - Check Codebase Analysis section (scouter)
   - Check Best Practices Research section (researcher)
   - Verify no files created

2. **Test apply mode**: `/onboard --apply` on test project
   - Verify rules created in mixed folder structure
   - Check frontmatter format (single line paths)
   - Verify global rules have no paths field
   - Check skills and agents sections in report

3. **Test incremental update**: Run `/onboard --apply` on project with existing .claude/
   - Verify no overwrites
   - Check "Already Present" section
   - Verify only new files created

4. **Test agent failure handling**: Mock agent timeout
   - Verify graceful fallback
   - Check report notes missing sections
   - Ensure workflow continues

## User Guidance

After onboarding, remind users:

- Review generated files and customize for their team
- Generated rules are starting points, not rigid requirements
- Rules in mixed folder structure for better organization
- Skills are auto-loaded by skill-loader hook
- Try recommended agents via commands (`/scout`, `/research`, etc.)
- Run `/onboard` again later to get new recommendations as project evolves
- Use `--apply` carefully on existing projects (review report first)
