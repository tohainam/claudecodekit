# CCK Settings Enforcement

## CRITICAL: User Settings from Hooks

When you see "CCK USER SETTINGS" injected in context, you MUST follow these settings.

Settings are loaded from:

1. `.claude/cck.json` - Project settings (shared with team)
2. `.claude/cck.local.json` - Personal settings (gitignored, overrides project)

They represent the user's explicit preferences.

## Language Settings

| Setting             | What it controls                                                                                      |
| ------------------- | ----------------------------------------------------------------------------------------------------- |
| **Think/Reasoning** | Language for internal reasoning and thinking                                                          |
| **Response**        | Language when replying to user                                                                        |
| **Document**        | Language for all written files: `.reports/`, `.plans/`, code comments, commit messages, documentation |

### Examples

```json
{
  "language": {
    "think": "en", // Reason in English (more precise)
    "response": "vi", // Reply in Vietnamese (user preference)
    "document": "en" // Write docs in English (team standard)
  }
}
```

## Workflow Settings

When running `/run` command:

| Setting        | What it controls                 |
| -------------- | -------------------------------- |
| `maxInstances` | Maximum parallel agents per type |

### Execution Flow

1. **Spawn agents** - Up to `maxInstances` in parallel
2. **Wait ALL** - Block until every agent completes (use `TaskOutput` with `block: true`)
3. **Synthesize** - Main agent consolidates all outputs into single report
4. **Next phase** - Proceed to next agent type (researcher → scouter → reviewer)

### Report Synthesis

Each agent returns raw findings. Main agent MUST:
- Merge insights from all agents into ONE coherent report
- Remove duplicates, resolve conflicts
- Save to `.reports/` with descriptive filename
- Never create multiple fragmented reports per phase

## DO NOT

- Ignore language settings
- Override settings without user request
- Ask to confirm settings - just follow them
- Spawn more agents than `maxInstances` allows
- Proceed before all agents complete
