# Skill Auto-Loader

This rule automatically discovers and loads relevant skills based on semantic understanding of task context.

## Auto-Loading Behavior

At the START of every operation (before any other work):

1. **Analyze the Task**: Understand the user's request, intent, and context
2. **Read Manifest**: Check `.claude/skills/MANIFEST.md` for available skills
3. **Semantic Match**: Compare task context against each skill's full description
4. **Load Matches**: For skills that are semantically relevant, read their SKILL.md
5. **Confirm Loading**: Report which skills were loaded

## Semantic Matching (Not Keyword Matching)

**DO NOT** just match keywords. Instead, understand the task semantically:

### How to Match
1. Read the task description and understand the **intent**
2. For each skill in MANIFEST.md, read its full **description**
3. Determine if the skill would be **helpful** for this task
4. Consider the **technologies**, **domains**, and **activities** involved

### Examples of Semantic Understanding

| Task | Reasoning | Skills Loaded |
|------|-----------|---------------|
| "Make this API faster" | Intent is optimization → performance skill. API work → may involve architecture | performance, architecture |
| "Add login feature" | Authentication → security matters. New feature → architecture, code quality | security-review, architecture, code-quality |
| "Why is this failing?" | Investigating issue → debugging. May need to understand code → code-quality | debugging, code-quality |
| "Clean up this messy code" | Improving code → refactoring. Quality standards → code-quality | refactoring, code-quality |

## Skill Loading Protocol

When a skill matches semantically:
1. Read `.claude/skills/<skill-name>/SKILL.md`
2. Apply the skill's guidance to the current task
3. Reference the skill's `references/` files as needed

## Visual Confirmation Format

After matching, output a brief confirmation:

```
Skills Loaded: [skill1], [skill2], [skill3]
```

If no skills match (rare for specific tasks):
```
Skills Loaded: None (general assistance mode)
```

## Default Skills

These skills are commonly applicable and should be loaded when relevant:
- **code-quality**: When writing, reviewing, or modifying any code
- **git-workflow**: When commits, PRs, branches, or version control are involved

## Skill Priority

When multiple skills apply, prioritize based on task specificity:
1. Domain-specific skills (security-review, testing, performance)
2. Process skills (debugging, refactoring, documentation)
3. Foundation skills (architecture, code-quality)

## Error Handling

If errors occur during skill loading:

1. **MANIFEST.md not found**: Log warning, continue without auto-loading
2. **Skill SKILL.md not found**: Skip that skill, log warning, continue with others
3. **Malformed manifest entry**: Skip entry, continue with others
4. **No skills match**: Continue normally (general assistance mode)

Never fail the entire operation due to skill loading issues. The user's actual task takes priority.

## Performance Notes

- Skill loading is lightweight (only reads SKILL.md, not all references)
- References are loaded on-demand during task execution
- Manifest is a single file read, parsed once per operation

## Examples

**Task**: "Fix the login bug that causes a 500 error"
- **Semantic Analysis**: Bug fixing (debugging), login involves auth (security)
- Output: `Skills Loaded: debugging, security-review`

**Task**: "Add unit tests for the UserService"
- **Semantic Analysis**: Writing tests (testing), service code quality matters
- Output: `Skills Loaded: testing, code-quality`

**Task**: "Refactor the payment module to use dependency injection"
- **Semantic Analysis**: Restructuring code (refactoring), DI is architectural pattern
- Output: `Skills Loaded: refactoring, architecture`

**Task**: "Create a new skill for handling PDF files"
- **Semantic Analysis**: Creating skills (skill-creator)
- Output: `Skills Loaded: skill-creator`

**Task**: "Review this PR for security issues"
- **Semantic Analysis**: Security review explicitly requested, code review (code-quality), git/PR (git-workflow)
- Output: `Skills Loaded: security-review, code-quality, git-workflow`
