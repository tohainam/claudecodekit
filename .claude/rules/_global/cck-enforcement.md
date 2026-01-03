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

## Feature Behavior

### Gemini

| Status   | Behavior                                                               |
| -------- | ---------------------------------------------------------------------- |
| ENABLED  | Proactively use when beneficial                                        |
| DISABLED | Only use when user explicitly requests (`/gemini`, "use gemini", etc.) |

## DO NOT

- Ignore language settings
- Proactively use disabled features
- Override settings without user request
- Ask to confirm settings - just follow them
