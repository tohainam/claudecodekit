#!/usr/bin/env python3
"""
MCP Loader Hook - SessionStart

Reads .mcp.json (or .claude/.mcp.json) and outputs available MCP servers as context.
Outputs plain text context for Claude to know which MCP servers are available.

For SessionStart hooks, plain text stdout with exit code 0 injects context
into Claude's conversation once at the beginning of the session.
"""

import json
import sys
from pathlib import Path


def get_project_root() -> Path:
    """Get the project root directory."""
    script_dir = Path(__file__).parent
    return script_dir.parent.parent  # .claude/hooks -> .claude -> project root


def find_mcp_config() -> Path | None:
    """Find .mcp.json file in project root or .claude directory."""
    project_root = get_project_root()

    # Check possible locations
    locations = [
        project_root / ".mcp.json",
        project_root / ".claude" / ".mcp.json",
    ]

    for path in locations:
        if path.exists():
            return path

    return None


def load_mcp_servers(config_path: Path) -> list[dict]:
    """Load MCP servers from config file."""
    servers = []

    try:
        content = config_path.read_text()
        config = json.loads(content)

        mcp_servers = config.get("mcpServers", {})

        for name, server_config in mcp_servers.items():
            server = {
                "name": name,
                "command": server_config.get("command", ""),
                "args": server_config.get("args", []),
            }
            servers.append(server)

    except Exception:
        pass

    # Sort by name
    servers.sort(key=lambda x: x['name'])
    return servers


def format_mcp_context(servers: list[dict]) -> str:
    """Format MCP servers as a context message for Claude."""
    if not servers:
        return ""

    # Create server name list
    server_names = [s['name'] for s in servers]

    lines = [
        "# MCP Server Auto-Loading Protocol",
        "",
        "## Available MCP Servers",
        "",
        f"Servers discovered: {', '.join(server_names)}",
        "",
        "## How to Use MCP Tools",
        "",
        "MCP tools are invoked using the format: `mcp__<server-name>__<tool-name>`",
        "",
        "## Configured Servers",
        "",
    ]

    # Add server info dynamically
    for server in servers:
        name = server['name']
        command = server.get('command', 'unknown')
        args = server.get('args', [])
        args_str = ' '.join(args) if args else ''
        lines.append(f"- **{name}**: `{command} {args_str}`".strip())

    lines.extend([
        "",
        "## When to Use MCP Servers",
        "",
        "- Fresh/current information newer than training data",
        "- External resources (docs, APIs, databases)",
        "- Specialized tools that improve output quality",
        "- Version-specific or recent information",
        "",
        "**TIP**: Prefer MCP servers for real-time data over training knowledge.",
    ])

    return "\n".join(lines)


def main():
    try:
        # Read JSON input from stdin (hook context)
        sys.stdin.read()

        # Find MCP config
        config_path = find_mcp_config()

        if not config_path:
            sys.exit(0)

        # Load servers
        servers = load_mcp_servers(config_path)

        if not servers:
            sys.exit(0)

        # Format context message
        context = format_mcp_context(servers)

        # Output plain text for UserPromptSubmit context injection
        print(context)

        sys.exit(0)

    except Exception as e:
        print(f"mcp-loader warning: {e}", file=sys.stderr)
        sys.exit(0)


if __name__ == '__main__':
    main()
