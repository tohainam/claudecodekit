---
description: View CCK documents in browser with live reload
argument-hint: [port]
---

Run the local document viewer for Claude Code Kit documents.

```bash
node .claude/tools/docs-viewer.js $ARGUMENTS
```

**Features:**
- 3-level navigation (Date → Type → Files)
- Real-time updates when files change
- Dark/light mode toggle
- Zero npm dependencies required

**Default port:** 4567 (auto-increments if busy)

Opens browser automatically.
