# Knowledge Freshness Guidelines

## Date & Time

For accurate timestamps (avoids hallucination):

| Purpose                 | Command                  | Example Output   |
| ----------------------- | ------------------------ | ---------------- |
| Report timestamp        | `date +"%Y-%m-%d %H:%M"` | 2026-01-02 14:30 |
| File naming             | `date +"%Y-%m-%d-%H%M"`  | 2026-01-02-1430  |
| Current year (searches) | `date +%Y`               | 2026             |

Subagents: Always use Bash `date` command rather than assuming date from context.

## Research First

- Verify current best practices before implementing
- Check official documentation for latest APIs
- Look for deprecation warnings in existing code

## When Uncertain

- Use WebSearch for current information
- Check package versions and changelogs
- Verify compatibility with project dependencies

## Documentation Dates

- Note when documentation was last updated
- Prefer recent sources over older ones
- Cross-reference multiple sources for critical decisions
