#!/usr/bin/env python3
"""
Language Loader Hook - SessionStart

Reads user language preferences from settings files and injects language context
into Claude Code sessions at startup. This ensures all responses are delivered
in the configured language while keeping technical terms and code comments in English.

For SessionStart hooks, plain text stdout with exit code 0 injects context
into Claude's conversation once at the beginning of the session.
"""

import json
import sys
from pathlib import Path


def get_claude_dir() -> Path:
    """Get the .claude directory path."""
    script_dir = Path(__file__).parent
    return script_dir.parent  # .claude/hooks -> .claude


def load_settings(path: Path) -> dict:
    """Load settings from JSON file."""
    if not path.exists():
        return {}
    try:
        return json.loads(path.read_text())
    except Exception:
        return {}


def get_language_preference() -> str | None:
    """Get language preference (local overrides project)."""
    claude_dir = get_claude_dir()

    # Load both files
    project_settings = load_settings(claude_dir / "settings.json")
    local_settings = load_settings(claude_dir / "settings.local.json")

    # Local overrides project
    return (
        local_settings.get("responseLanguage") or
        project_settings.get("responseLanguage")
    )


LANGUAGE_MAP = {
    # ISO codes
    "vi": "Vietnamese",
    "en": "English",
    "ja": "Japanese",
    "ko": "Korean",
    "zh": "Chinese",
    "fr": "French",
    "de": "German",
    "es": "Spanish",
    "pt": "Portuguese",
    "ru": "Russian",
    "ar": "Arabic",
    "th": "Thai",
    "id": "Indonesian",
    "nl": "Dutch",
    "it": "Italian",
    "pl": "Polish",
    "tr": "Turkish",
    "hi": "Hindi",
    # Full names (lowercase keys for matching)
    "vietnamese": "Vietnamese",
    "english": "English",
    "japanese": "Japanese",
    "korean": "Korean",
    "chinese": "Chinese",
    "french": "French",
    "german": "German",
    "spanish": "Spanish",
    "portuguese": "Portuguese",
    "russian": "Russian",
    "arabic": "Arabic",
    "thai": "Thai",
    "indonesian": "Indonesian",
    "dutch": "Dutch",
    "italian": "Italian",
    "polish": "Polish",
    "turkish": "Turkish",
    "hindi": "Hindi",
}


def normalize_language(lang: str) -> str | None:
    """Normalize language input to full name."""
    if not lang:
        return None

    normalized = lang.lower().strip()

    # Check map
    if normalized in LANGUAGE_MAP:
        return LANGUAGE_MAP[normalized]

    # Try title case as-is (for unlisted languages)
    return lang.strip().title()


def format_language_context(language: str) -> str:
    """Format language preference as context message."""
    lines = [
        "# Response Language Configuration",
        "",
        f"**Configured Language**: {language}",
        "",
        "## Language Rules",
        "",
        f"- Respond to the user in **{language}**",
        "- Keep technical terms in English (e.g., API, function, variable)",
        "- Keep code comments in English",
        "- Keep file paths and commands in English",
        "- Only translate explanations, discussions, and descriptions",
        "",
        "## Example",
        "",
        "When explaining code:",
        f'- Good: "[{language} explanation] `functionName` [{language} description]"',
        '- Bad: Translating function names or technical terms',
    ]
    return "\n".join(lines)


def main():
    try:
        # Consume stdin (hook protocol)
        sys.stdin.read()

        # Get language preference
        lang_pref = get_language_preference()

        if not lang_pref:
            # No preference, default to English (no context needed)
            sys.exit(0)

        # Skip if explicitly English
        normalized = normalize_language(lang_pref)
        if normalized and normalized.lower() == "english":
            sys.exit(0)

        if normalized:
            # Output context
            context = format_language_context(normalized)
            print(context)

        sys.exit(0)

    except Exception as e:
        print(f"language-loader warning: {e}", file=sys.stderr)
        sys.exit(0)  # Graceful degradation


if __name__ == "__main__":
    main()
