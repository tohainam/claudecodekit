#!/usr/bin/env python3
"""
Skill Loader Hook - SessionStart

Auto-scans .claude/skills/*/SKILL.md files and extracts skill info from YAML frontmatter.
Outputs plain text context for Claude to use for semantic matching.

For SessionStart hooks, plain text stdout with exit code 0 injects context
into Claude's conversation once at the beginning of the session.
"""

import json
import sys
import re
import os
from pathlib import Path


def get_claude_dir() -> Path:
    """Get the .claude directory path."""
    script_dir = Path(__file__).parent
    return script_dir.parent  # .claude/hooks -> .claude


def parse_yaml_frontmatter(content: str) -> dict:
    """Parse YAML frontmatter from markdown content."""
    # Match content between --- delimiters
    match = re.match(r'^---\s*\n(.*?)\n---', content, re.DOTALL)
    if not match:
        return {}

    yaml_content = match.group(1)
    result = {}

    # Simple YAML parsing for name and description
    # Handle multiline description with > or |
    lines = yaml_content.split('\n')
    current_key = None
    current_value = []

    for line in lines:
        # Check for new key
        key_match = re.match(r'^(\w+):\s*(.*)', line)
        if key_match:
            # Save previous key if exists
            if current_key:
                result[current_key] = ' '.join(current_value).strip()

            current_key = key_match.group(1)
            value = key_match.group(2).strip()

            # Check for multiline indicator
            if value in ('>', '|', '>-', '|-'):
                current_value = []
            else:
                current_value = [value]
        elif current_key and line.startswith('  '):
            # Continuation of multiline value
            current_value.append(line.strip())

    # Save last key
    if current_key:
        result[current_key] = ' '.join(current_value).strip()

    return result


def scan_skills(skills_dir: Path) -> list[dict]:
    """Scan skills directory and extract skill info from SKILL.md files."""
    skills = []

    if not skills_dir.exists():
        return skills

    for skill_path in skills_dir.iterdir():
        if not skill_path.is_dir():
            continue

        skill_md = skill_path / "SKILL.md"
        if not skill_md.exists():
            continue

        try:
            content = skill_md.read_text()
            frontmatter = parse_yaml_frontmatter(content)

            name = frontmatter.get('name', skill_path.name)
            description = frontmatter.get('description', '')

            if name and description:
                skills.append({
                    "name": name,
                    "description": description,
                    "path": f".claude/skills/{skill_path.name}/SKILL.md"
                })
        except Exception:
            continue

    # Sort by name
    skills.sort(key=lambda x: x['name'])
    return skills


def format_skills_context(skills: list[dict]) -> str:
    """Format skills as a context message for Claude."""
    if not skills:
        return ""

    # Create a simple list of skill names for reference
    skill_names = [s['name'] for s in skills]

    lines = [
        "# Skill Auto-Loading Protocol",
        "",
        "## Available Skills",
        "",
        f"Skills discovered: {', '.join(skill_names)}",
        "",
        "## How to Load Skills",
        "",
        "When a task matches a skill's purpose, invoke it using the **Skill tool**:",
        "",
        "```",
        'Skill(skill="<skill-name>")',
        "```",
        "",
        "## Skill Descriptions",
        "",
    ]

    # Add skill descriptions for semantic matching
    for skill in skills:
        lines.append(f"- **{skill['name']}**: {skill['description']}")

    lines.extend([
        "",
        "## When to Use Skills",
        "",
        "- **frontend-design**: UI work, web components, styling, landing pages",
        "- **testing**: Writing tests, TDD, test strategies",
        "- **debugging**: Bug investigation, root cause analysis",
        "- **security-review**: Security audits, vulnerability checks",
        "- **refactoring**: Code improvement without behavior change",
        "- **architecture**: System design, patterns, component structure",
        "- **code-quality**: Best practices, clean code",
        "- **performance**: Optimization, profiling",
        "- **documentation**: Writing docs, READMEs, API docs",
        "- **git-workflow**: Commits, branches, PRs",
        "",
        "**IMPORTANT**: Use the Skill tool to invoke skills, not the Read tool.",
    ])

    return "\n".join(lines)


def main():
    try:
        # Read JSON input from stdin (hook context)
        sys.stdin.read()

        # Get paths
        claude_dir = get_claude_dir()
        skills_dir = claude_dir / "skills"

        # Scan skills
        skills = scan_skills(skills_dir)

        if not skills:
            sys.exit(0)

        # Format context message
        context = format_skills_context(skills)

        # Output plain text for UserPromptSubmit context injection
        print(context)

        sys.exit(0)

    except Exception as e:
        print(f"skill-loader warning: {e}", file=sys.stderr)
        sys.exit(0)


if __name__ == '__main__':
    main()
