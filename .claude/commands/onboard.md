---
description: Analyze project and recommend Claude Code configuration. Use --apply to generate files.
allowed-tools: Read, Glob, Grep, Bash, Write, TodoWrite
argument-hint: [--apply]
---

# Onboard Command

Automated project analysis and Claude Code configuration setup.

## Input

Arguments: $ARGUMENTS

Parse for `--apply` flag:
- If `--apply` present: Run analysis + create all recommended files
- If no flag: Run analysis only, create ONBOARD-REPORT.md

## Process

### Step 1: Detect Apply Mode

Check if user wants to apply changes immediately:

```
$ARGUMENTS contains "--apply" → Apply mode = true
$ARGUMENTS is empty or other → Apply mode = false
```

### Step 2: Check for Existing Report

If apply mode is true:
- Check if `ONBOARD-REPORT.md` exists in project root
- If YES: Skip analysis, use existing report
- If NO: Run full analysis first

### Step 3: Run Project Analysis

Use the **project-analysis** skill to analyze the codebase following this workflow:

#### 3.1 Detect Tech Stack

Use Glob to find manifest files:
```bash
# Find all package managers and config files
**/{package.json,requirements.txt,pyproject.toml,go.mod,Cargo.toml,pom.xml,build.gradle,Gemfile,composer.json,*.csproj}
```

Read detected files and reference `project-analysis` skill's tech-detection.md for identification.

Record:
- Languages (with versions)
- Frameworks (with versions)
- Database/ORM systems
- Auth systems
- Testing frameworks
- Build tools
- Infrastructure (Docker, CI/CD)

#### 3.2 Analyze Project Structure

Use Glob to map directory structure:
```bash
# Find key directories
**/
```

Identify:
- Source code location (src/, app/, lib/)
- Component organization
- API/route definitions
- Test directories
- Configuration files
- Build outputs

Record all paths accurately for rules' `paths:` targeting.

#### 3.3 Identify Project Domains

Determine if monorepo:
- Check for nx.json, turbo.json, pnpm-workspace.yaml, lerna.json
- Find multiple package.json files
- Detect apps/, packages/ structure

For monorepos:
- Group by workspace
- Analyze tech stack per workspace
- Note workspace dependencies

For single projects:
- Treat entire project as one domain

#### 3.4 Generate Recommendations

Reference `project-analysis` skill's rules-templates.md for appropriate templates.

For each detected technology, recommend rules files using the Tech-to-Rules Mapping Table.

Customize templates with:
- Actual project paths from structure analysis
- Detected framework names and versions
- Project-specific patterns found

Always recommend:
- `.claude/rules/code-style.md` (all projects)
- `.claude/rules/git-workflow.md` (if .git exists)

Conditionally recommend based on detection:
- `components.md` (if frontend framework)
- `pages.md` (if routing framework)
- `api.md` (if backend framework)
- `database.md` (if ORM detected)
- `security.md` (if auth system)
- `testing.md` (if test framework)
- `docker.md` (if Dockerfile exists)
- `ci.md` (if CI config exists)
- `monorepo.md` (if monorepo detected)

#### 3.5 Create ONBOARD-REPORT.md

Generate comprehensive report using the template from project-analysis skill's SKILL.md.

Include:
- Executive Summary
- Tech Stack Detection (detailed)
- Project Structure (mapped paths)
- Recommended Configuration (all rules with purpose and paths)
- Skills to Enable
- Example Workflow Commands
- Next Steps
- Incremental Updates section (if .claude/ exists)

Write report to `ONBOARD-REPORT.md` in project root.

### Step 4: Display Summary to User

After creating report, show concise summary:

```markdown
# Onboarding Analysis Complete

## Detected Tech Stack
- Languages: [List]
- Frameworks: [List]
- Database: [List]
- Auth: [List]
- Testing: [List]

## Recommendations
- [X] rules files to create
- [Y] skills to enable

## Next Steps

Full report: ONBOARD-REPORT.md

To apply all recommendations:
/onboard --apply
```

If apply mode was false, STOP HERE.

### Step 5: Apply Recommendations (Only if --apply flag)

If apply mode is true, continue:

#### 5.1 Parse ONBOARD-REPORT.md

Read the report and extract:
- All recommended rules files (path + content)
- Skills to enable (list)

#### 5.2 Check for Existing Files

For each recommended file:
- Check if file already exists
- If exists: Skip and note in "Already Present" list
- If not exists: Add to "Will Create" list

#### 5.3 Create Recommended Files

For each file in "Will Create" list:

1. Create directory if needed:
   ```bash
   mkdir -p .claude/rules/[subdirs-if-any]
   ```

2. Write file with customized template content

3. Track created files for summary

#### 5.4 Report Results

Display what was created:

```markdown
# Onboard Complete

## Files Created
✓ .claude/rules/code-style.md
✓ .claude/rules/git-workflow.md
✓ .claude/rules/components.md
✓ .claude/rules/api.md
✓ .claude/rules/database.md
✓ .claude/rules/security.md
[... more files ...]

## Already Present
- .claude/rules/code-quality.md (keeping your version)

## Next Steps

1. Review generated files - customize as needed
2. Try commands:
   - /feature "add new feature"
   - /review
   - /test path/to/file

Your Claude Code configuration is ready!
```

## Incremental Update Handling

If `.claude/` directory already exists:

### Detection
- List existing `.claude/rules/` files
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
- .claude/rules/components.md (for React components at src/components/**)
- .claude/rules/api.md (for Express routes at src/routes/**)
- .claude/rules/database.md (for Prisma at prisma/**)

Conflicts: None
```

### Merge Strategy
- **Never overwrite** existing files
- Only create files that don't exist
- If similar file exists (e.g., user has custom components.md), note it but don't replace
- User can manually merge if desired

## Error Handling

### No Manifest Files Found
```
Unable to detect project type. This may not be a code project, or it uses an unsupported language.

Supported: JavaScript/TypeScript, Python, Go, Rust, Java, Ruby, PHP, C#

Would you like to:
1. Specify project type manually
2. Proceed with minimal configuration
3. Cancel
```

### Analysis Fails
- Log error details
- Create partial report with what was detected
- Note analysis failure in report
- Suggest manual review

### File Creation Fails
- Report which files failed
- Note error message
- Continue with other files
- Summarize successes and failures

## Performance Notes

- Target: Complete analysis in < 30 seconds
- Use Glob efficiently (specific patterns, not recursive searches of node_modules/)
- Read files in parallel when possible
- Cache file contents when checking multiple patterns
- Limit directory traversal depth

## Output Files

This command creates:
1. **ONBOARD-REPORT.md** (always) - Full analysis report in project root
2. **.claude/rules/*.md** (if --apply) - Recommended rules files
3. No skills files (skills are separate downloads/installs)

## User Guidance

After onboarding, remind users:
- Review generated files and customize for their team
- Generated rules are starting points, not rigid requirements
- They can edit, delete, or add more rules as needed
- Run `/onboard` again later to get new recommendations as project evolves
- Use `--apply` carefully on existing projects (review report first)
