---
description: View checklists in browser with live reload
argument-hint: [port]
---

Run the local checklist viewer for Claude Code Kit checklists.

```bash
node .claude/tools/checklists-viewer.js $ARGUMENTS
```

**Features:**
- 2-level navigation (Month → Feature/Files)
- Real-time updates when files change
- Dark/light mode toggle
- Zero npm dependencies required

**Default port:** 5568 (auto-increments if busy)

Opens browser automatically.
