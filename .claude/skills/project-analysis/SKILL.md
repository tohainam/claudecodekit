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

### Step 4: Generate Recommendations

For each detected technology, recommend appropriate rules files.

**Recommendation process:**
1. Identify detected tech stack components
2. Look up corresponding rule templates
3. Customize templates with actual project paths
4. Consider project-specific patterns found in analysis
5. Group recommendations by domain (for monorepos)

**Reference for templates:**
See [references/rules-templates.md](references/rules-templates.md) for all rule templates and tech-to-rules mapping.

**Always recommend:**
- code-style.md (universal coding standards)
- git-workflow.md (if .git exists)

**Conditional recommendations based on detection:**
- components.md (if React/Vue/Angular/Svelte detected)
- api.md (if backend framework detected)
- database.md (if ORM detected)
- security.md (if auth system detected)
- testing.md (if test framework detected)
- docker.md (if Dockerfile exists)
- ci.md (if .github/workflows or .gitlab-ci.yml exists)

### Step 5: Create Output

Generate ONBOARD-REPORT.md with this structure:

```markdown
# Project Onboarding Report

Generated: [timestamp]

## Executive Summary

- **Project Type**: [e.g., Next.js Full-Stack Application]
- **Languages**: [e.g., TypeScript, JavaScript]
- **Key Frameworks**: [e.g., Next.js 14, React 18, Prisma]
- **Recommendations**: [X] rules files, [Y] skills

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

#### 1. .claude/rules/code-style.md
**Purpose**: Universal coding standards
**Paths**: `**/*.{ext}`
**Template**: Built-in generic template
**Priority**: High

#### [More rules...]

### Skills to Enable

- [Skill name]: [Why it's relevant]

### Example Workflow Commands

Based on your stack, these commands will be most useful:
- `/feature` - [When to use]
- `/test` - [When to use]
- `/review` - [When to use]

## Next Steps

1. **Review this report** - Verify detected technologies are accurate
2. **Run with --apply** - Execute `/onboard --apply` to create all recommended files
3. **Customize** - Edit generated rules to match your team's conventions
4. **Test** - Try commands like `/feature` to verify configuration works

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
- Create all recommended files
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
| [references/rules-templates.md](references/rules-templates.md) | During Step 4 (generating recommendations) - complete rule templates and tech-to-rules mapping |

These references are split out to keep this SKILL.md lean while providing comprehensive detection and templating capabilities.
