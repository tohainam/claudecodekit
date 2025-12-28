#!/usr/bin/env python3
"""
File Protection Hook - PreToolUse:Edit|Write

This hook blocks editing of sensitive files like:
- Environment files (.env, .env.*)
- Lock files (package-lock.json, yarn.lock, etc.)
- Secret files (*.pem, *.key, secrets/)
- Git internals (.git/)

Exit codes:
- 0: Allow the operation
- 2: Block the operation (error message in stderr)
"""

import json
import sys
import re
import os

# Patterns for files that should never be edited
BLOCKED_PATTERNS = [
    # Environment and secrets
    r'\.env$',
    r'\.env\.[^/]+$',
    r'\.env\.local$',
    r'secrets/',
    r'credentials/',
    r'\.credentials',

    # Lock files
    r'package-lock\.json$',
    r'yarn\.lock$',
    r'pnpm-lock\.yaml$',
    r'Gemfile\.lock$',
    r'poetry\.lock$',
    r'Cargo\.lock$',
    r'composer\.lock$',

    # Cryptographic files
    r'\.pem$',
    r'\.key$',
    r'\.crt$',
    r'\.p12$',
    r'\.pfx$',
    r'id_rsa',
    r'id_ed25519',
    r'id_ecdsa',

    # Git internals
    r'\.git/',
    r'\.git$',

    # IDE and editor configs that shouldn't be auto-edited
    r'\.idea/',
    r'\.vscode/settings\.json$',
]

# Files that require confirmation but aren't blocked
WARNING_PATTERNS = [
    r'\.github/workflows/',
    r'\.gitlab-ci\.yml$',
    r'Dockerfile$',
    r'docker-compose\.ya?ml$',
    r'Makefile$',
    r'webpack\.config\.',
    r'vite\.config\.',
    r'tsconfig\.json$',
    r'package\.json$',
]


def get_file_path(data: dict) -> str:
    """Extract file path from tool input."""
    tool_input = data.get('tool_input', {})
    return tool_input.get('file_path', '') or tool_input.get('path', '')


def is_blocked(file_path: str) -> tuple[bool, str]:
    """Check if file path matches any blocked pattern."""
    # Normalize path
    file_path = os.path.normpath(file_path)

    for pattern in BLOCKED_PATTERNS:
        if re.search(pattern, file_path, re.IGNORECASE):
            return True, pattern

    return False, ''


def is_warning(file_path: str) -> tuple[bool, str]:
    """Check if file path matches any warning pattern."""
    file_path = os.path.normpath(file_path)

    for pattern in WARNING_PATTERNS:
        if re.search(pattern, file_path, re.IGNORECASE):
            return True, pattern

    return False, ''


def main():
    try:
        # Read JSON input from stdin
        input_data = sys.stdin.read()
        if not input_data:
            sys.exit(0)  # No input, allow

        data = json.loads(input_data)

        # Get the file path being edited
        file_path = get_file_path(data)
        if not file_path:
            sys.exit(0)  # No file path, allow

        # Check if blocked
        blocked, pattern = is_blocked(file_path)
        if blocked:
            print(f"🚫 BLOCKED: Cannot edit protected file", file=sys.stderr)
            print(f"   File: {file_path}", file=sys.stderr)
            print(f"   Pattern: {pattern}", file=sys.stderr)
            print(f"", file=sys.stderr)
            print(f"Protected files include:", file=sys.stderr)
            print(f"   - Environment files (.env, .env.*)", file=sys.stderr)
            print(f"   - Lock files (package-lock.json, etc.)", file=sys.stderr)
            print(f"   - Secret/key files (.pem, .key, secrets/)", file=sys.stderr)
            print(f"   - Git internals (.git/)", file=sys.stderr)
            sys.exit(2)  # Block the operation

        # Check for warnings (but don't block)
        warning, pattern = is_warning(file_path)
        if warning:
            # Output warning but allow
            output = {
                "systemMessage": f"⚠️ Editing sensitive file: {file_path} (matched: {pattern})"
            }
            print(json.dumps(output))

        # Allow the operation
        sys.exit(0)

    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON input: {e}", file=sys.stderr)
        sys.exit(1)  # Non-blocking error
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)  # Non-blocking error


if __name__ == '__main__':
    main()
