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
4. Researcher agent analysis (best practices for detected tech)
5. Generate recommendations (rules, skills, agents)
6. Create ONBOARD-REPORT.md
7. Apply configuration (if --apply flag present)

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

#### 4.3 Agent Recommendations

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

### Skills to Enable

Based on your tech stack, these skills are recommended:

#### 1. [skill-name]
**Why**: [Rationale based on detected tech]
**Use for**: [Specific use cases]

[... more skills with rationale ...]

### Agents to Use

Based on your project characteristics, these agents will be helpful:

#### Core Workflow Agents (Always Use)

- **planner** (opus): Use `/plan <task>` or `/feature <desc>` to create implementation plans
- **implementer** (sonnet): Use `/implement [path]` to execute plans with validation

#### Recommended for Your Project

[List recommended agents with usage guidance and examples]

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

#### 7.5 Create Project-Specific Skills (If Needed)

If report recommends project-specific skills (e.g., for unique domain):

1. Check if skill-creator skill is available
2. Use skill-creator to generate project-specific skill
3. Run `scripts/init_skill.py` if available
4. Document in summary

**Fallback**: If skill-creator unavailable, note in report that user can create manually

#### 7.6 Report Results

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
3. **.claude/skills/[project-name]/** (if --apply and needed) - Project-specific skill via skill-creator

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
