#!/usr/bin/env python3
"""
UserPromptSubmit hook: Inject user settings from cck.json into Claude context.

This hook runs every time user submits a prompt, ensuring Claude ALWAYS
receives the user's configured settings (language, features).

Cross-platform: Works on macOS, Linux, and Windows.

Exit codes:
- 0: Success, stdout added to context
- 2: Blocking error (not used here)
"""
import json
import sys
import os
from pathlib import Path

# Ensure Python 3
if sys.version_info[0] < 3:
    sys.exit(0)


def deep_merge(base: dict, override: dict) -> dict:
    """Deep merge two dictionaries. Override values take precedence."""
    result = base.copy()
    for key, value in override.items():
        if key in result and isinstance(result[key], dict) and isinstance(value, dict):
            result[key] = deep_merge(result[key], value)
        else:
            result[key] = value
    return result


def load_settings():
    """
    Load settings from cck.json and cck.local.json.

    Priority: cck.local.json > cck.json
    Local settings override project settings.
    """
    project_dir = os.environ.get('CLAUDE_PROJECT_DIR', os.getcwd())
    claude_dir = Path(project_dir) / '.claude'

    config_path = claude_dir / 'cck.json'
    local_config_path = claude_dir / 'cck.local.json'

    settings = {}

    # Load base config (cck.json)
    if config_path.exists():
        try:
            with open(config_path, 'r', encoding='utf-8') as f:
                settings = json.load(f)
        except (json.JSONDecodeError, IOError):
            pass

    # Load local config (cck.local.json) and merge
    if local_config_path.exists():
        try:
            with open(local_config_path, 'r', encoding='utf-8') as f:
                local_settings = json.load(f)
                settings = deep_merge(settings, local_settings)
        except (json.JSONDecodeError, IOError):
            pass

    return settings if settings else None


def build_context(settings: dict) -> str:
    """Build context string from settings."""
    lines = []

    language_map = {
        'vi': 'Vietnamese (Tiếng Việt)',
        'en': 'English',
        'ja': 'Japanese (日本語)',
        'ko': 'Korean (한국어)',
        'zh': 'Chinese (中文)',
        'fr': 'French (Français)',
        'de': 'German (Deutsch)',
        'es': 'Spanish (Español)',
        'pt': 'Portuguese (Português)',
        'ru': 'Russian (Русский)',
        'it': 'Italian (Italiano)',
        'th': 'Thai (ไทย)',
    }

    # Language settings
    language_config = settings.get('language', {})
    think_lang = language_config.get('think', 'en')
    response_lang = language_config.get('response', 'en')
    document_lang = language_config.get('document', 'en')

    think_display = language_map.get(think_lang, think_lang)
    response_display = language_map.get(response_lang, response_lang)
    document_display = language_map.get(document_lang, document_lang)

    lines.append("## CCK USER SETTINGS (MANDATORY)")
    lines.append("")
    lines.append("**Language Settings**:")
    lines.append(f"- Think/Reasoning: {think_display}")
    lines.append(f"- Response to user: {response_display}")
    lines.append(f"- Documents (.reports, .plans, comments, commits): {document_display}")
    lines.append("")

    # Workflow settings
    workflow = settings.get('workflow', {})
    if workflow:
        max_instances = workflow.get('maxInstances', {})
        if max_instances:
            lines.append("**Workflow**: Max agents per type:")
            for agent, max_val in max_instances.items():
                lines.append(f"  - {agent}: {max_val}")
            lines.append("  - CRITICAL: Wait for ALL agents to complete before next phase")
            lines.append("")

    return '\n'.join(lines)


def main():
    # Read hook input from stdin
    try:
        json.load(sys.stdin)
    except (json.JSONDecodeError, IOError):
        pass

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
