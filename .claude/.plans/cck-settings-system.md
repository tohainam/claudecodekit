# CCK Settings System - Implementation Plan

> **Goal**: Tạo hệ thống settings để Claude Code LUÔN nhớ user preferences (language, features)

## Overview

Sử dụng `UserPromptSubmit` hook để đọc file `cck.json` và inject settings vào context mỗi khi user submit prompt. Claude sẽ **KHÔNG BAO GIỜ** bỏ lỡ settings này.

## Architecture

```
User submits prompt
        ↓
┌─────────────────────────────┐
│  UserPromptSubmit Hook      │
│  ┌───────────────────────┐  │
│  │ inject-settings.py    │  │
│  │ - Read cck.json       │  │
│  │ - Build context       │  │
│  │ - Output to stdout    │  │
│  └───────────────────────┘  │
└─────────────────────────────┘
        ↓
Context injected: "Language: vi, Gemini: enabled"
        ↓
Claude receives prompt + settings context
        ↓
Claude responds following settings
```

## Files to Create/Modify

### 1. `.claude/cck.json` (NEW)

User-editable settings file.

```json
{
  "$schema": "./schemas/cck.schema.json",
  "language": "en",
  "features": {
    "gemini": true
  },
  "_comment": "Claude Code Kit Settings - Edit this file to configure Claude behavior"
}
```

**Settings Options:**

| Setting | Type | Values | Description |
|---------|------|--------|-------------|
| `language` | string | `"en"`, `"vi"`, `"ja"`, etc. | Response language |
| `features.gemini` | boolean | `true`/`false` | Enable/disable Gemini skill |

### 2. `.claude/hooks/inject-settings.py` (NEW)

Python script to read cck.json and inject context.

```python
#!/usr/bin/env python3
"""
UserPromptSubmit hook: Inject user settings from cck.json into Claude context.

Exit codes:
- 0: Success, stdout added to context
- 2: Blocking error (not used here)
"""
import json
import sys
import os
from pathlib import Path

def load_settings():
    """Load cck.json from project directory."""
    project_dir = os.environ.get('CLAUDE_PROJECT_DIR', os.getcwd())
    config_path = Path(project_dir) / '.claude' / 'cck.json'

    if not config_path.exists():
        return None

    try:
        with open(config_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except (json.JSONDecodeError, IOError):
        return None

def build_context(settings: dict) -> str:
    """Build context string from settings."""
    lines = [
        "---",
        "## CCK USER SETTINGS (MANDATORY - NEVER IGNORE)",
        ""
    ]

    # Language setting
    language = settings.get('language', 'en')
    language_map = {
        'vi': 'Vietnamese (Tiếng Việt)',
        'en': 'English',
        'ja': 'Japanese (日本語)',
        'ko': 'Korean (한국어)',
        'zh': 'Chinese (中文)',
        'fr': 'French (Français)',
        'de': 'German (Deutsch)',
        'es': 'Spanish (Español)',
    }
    lang_display = language_map.get(language, language)
    lines.append(f"**Response Language**: {lang_display}")
    lines.append(f"→ You MUST respond in {lang_display}. This is MANDATORY.")
    lines.append("")

    # Features
    features = settings.get('features', {})

    # Gemini feature
    gemini_enabled = features.get('gemini', False)
    gemini_status = "ENABLED" if gemini_enabled else "DISABLED"
    lines.append(f"**Gemini Integration**: {gemini_status}")
    if gemini_enabled:
        lines.append("→ You CAN use the Gemini skill (/gemini) when beneficial.")
    else:
        lines.append("→ You MUST NOT use or suggest Gemini skill.")
    lines.append("")

    lines.append("---")

    return '\n'.join(lines)

def main():
    # Read hook input (optional, but good practice)
    try:
        input_data = json.load(sys.stdin)
    except (json.JSONDecodeError, IOError):
        input_data = {}

    # Load settings
    settings = load_settings()

    if not settings:
        # No settings file, silently proceed
        sys.exit(0)

    # Build and output context
    context = build_context(settings)
    print(context)
    sys.exit(0)

if __name__ == '__main__':
    main()
```

### 3. `.claude/settings.json` (MODIFY)

Add hook registration.

```json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "python3 \"$CLAUDE_PROJECT_DIR/.claude/hooks/inject-settings.py\"",
            "timeout": 5
          }
        ]
      }
    ]
  }
}
```

### 4. `.claude/rules/_global/cck-enforcement.md` (NEW - Backup Layer)

Optional backup layer to reinforce settings.

```markdown
# CCK Settings Enforcement

## CRITICAL INSTRUCTIONS

When you see "CCK USER SETTINGS" in context, you MUST:

1. **Language**: ALWAYS respond in the specified language
2. **Features**: ONLY use enabled features

These settings are injected by hooks and represent user's explicit preferences.
NEVER ignore or override these settings.
```

## Implementation Steps

### Step 1: Create cck.json

Create `.claude/cck.json` with default settings.

### Step 2: Create hook script

Create `.claude/hooks/inject-settings.py`:
- Make it executable: `chmod +x`
- Test standalone: `echo '{}' | python3 .claude/hooks/inject-settings.py`

### Step 3: Register hook

Update `.claude/settings.json` to add `UserPromptSubmit` hook.

### Step 4: Create backup rule (optional)

Create `.claude/rules/_global/cck-enforcement.md` for extra enforcement.

### Step 5: Test

1. Restart Claude Code session
2. Submit a prompt
3. Verify settings context is injected
4. Test language switching
5. Test feature toggle

## User Guide

### How to Configure

Edit `.claude/cck.json`:

```json
{
  "language": "vi",        // Change to your preferred language
  "features": {
    "gemini": true         // true = enabled, false = disabled
  }
}
```

### Available Languages

| Code | Language |
|------|----------|
| `en` | English |
| `vi` | Vietnamese |
| `ja` | Japanese |
| `ko` | Korean |
| `zh` | Chinese |
| `fr` | French |
| `de` | German |
| `es` | Spanish |

### Troubleshooting

1. **Settings not applied**: Restart Claude Code session (hooks load at startup)
2. **Hook error**: Check `python3` is available, run script manually to debug
3. **JSON parse error**: Validate cck.json syntax

## Security Notes

- cck.json is project-level, committed to git (shared with team)
- For personal overrides, use `.claude/cck.local.json` (add to .gitignore)
- Hook runs with user permissions, no elevated access

## Sources

- [Claude Code Hooks Reference](https://code.claude.com/docs/en/hooks)
- [Configure Claude Code Hooks](https://claude.com/blog/how-to-configure-hooks)
