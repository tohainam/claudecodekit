#!/usr/bin/env node
/**
 * CCK Document Viewer
 * Zero-dependency local web viewer for Claude Code Kit documents
 *
 * Usage: node .claude/tools/docs-viewer.js [port]
 *
 * Features:
 * - 3-level navigation (Date → Type → Files)
 * - Real-time updates via SSE
 * - Markdown rendering via marked.js (CDN)
 * - Cross-platform browser auto-open
 */

import { createServer } from "node:http";
import { readFile, readdir, stat, writeFile } from "node:fs/promises";
import { watch, existsSync } from "node:fs";
import {
  join,
  extname,
  resolve,
  normalize,
  dirname,
  basename,
} from "node:path";
import { exec } from "node:child_process";
import { platform } from "node:os";
import { fileURLToPath } from "node:url";

// Get project root (3 levels up from .claude/tools/docs-viewer.js)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = resolve(__dirname, "../..");
const CLAUDE_DIR = join(PROJECT_ROOT, ".claude");

// Configuration
const BASE_PORT = parseInt(process.argv[2]) || 4567;
const MAX_PORT_RETRIES = 10;
const DEBOUNCE_MS = 100;
const HEARTBEAT_MS = 30000;
const DOCUMENT_FOLDERS = [".reports", ".specs", ".plans", ".state"];

// MIME types
const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

// SSE clients
const sseClients = new Map();
let debounceTimer = null;

// ═══════════════════════════════════════════════════════════════
// Document Discovery
// ═══════════════════════════════════════════════════════════════

async function discoverDocuments() {
  const tree = {};
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  for (const folder of DOCUMENT_FOLDERS) {
    const folderPath = join(CLAUDE_DIR, folder);
    if (!existsSync(folderPath)) continue;

    const entries = await readdir(folderPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(folderPath, entry.name);
      let docs = [];

      if (entry.isDirectory()) {
        // Plans can be directories with _master.md
        const masterPath = join(fullPath, "_master.md");
        if (existsSync(masterPath)) {
          const stats = await stat(masterPath);
          const contentDate = await extractDateFromContent(masterPath);
          docs.push({
            name: entry.name,
            path: join(folder, entry.name, "_master.md"),
            type: "plan",
            date: contentDate || stats.mtime.toISOString().split("T")[0],
            mtime: stats.mtime.toISOString(),
          });
        }
      } else if (entry.isFile()) {
        const ext = extname(entry.name);
        if (ext !== ".md" && ext !== ".json") continue;

        const stats = await stat(fullPath);
        const contentDate =
          ext === ".md" ? await extractDateFromContent(fullPath) : null;
        const doc = parseDocument(entry.name, folder, stats, contentDate);
        if (doc) docs.push(doc);
      }

      for (const doc of docs) {
        const dateKey = getDateKey(doc.date || doc.mtime, today, yesterday);
        const folderKey = folder.replace(".", "");

        if (!tree[dateKey]) tree[dateKey] = {};
        if (!tree[dateKey][folderKey]) tree[dateKey][folderKey] = [];
        tree[dateKey][folderKey].push(doc);
      }
    }
  }

  // Sort dates (Today first, then Yesterday, then descending)
  const sortedTree = {};
  const dateOrder = ["Today", "Yesterday"];
  const otherDates = Object.keys(tree)
    .filter((d) => !dateOrder.includes(d))
    .sort()
    .reverse();

  for (const date of [...dateOrder, ...otherDates]) {
    if (tree[date]) {
      sortedTree[date] = tree[date];
      // Sort files within each folder by mtime descending
      for (const folder of Object.keys(sortedTree[date])) {
        sortedTree[date][folder].sort(
          (a, b) => new Date(b.mtime) - new Date(a.mtime)
        );
      }
    }
  }

  return sortedTree;
}

async function extractDateFromContent(filePath) {
  try {
    const content = await readFile(filePath, "utf-8");
    // Match **Generated**: YYYY-MM-DD or **Generated**: YYYY-MM-DD HH:MM
    const match = content.match(/\*\*Generated\*\*:\s*(\d{4}-\d{2}-\d{2})/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

function parseDocument(filename, folder, stats, contentDate = null) {
  const ext = extname(filename);
  const name = basename(filename, ext);
  const fallbackDate = stats.mtime.toISOString().split("T")[0];

  // Format: {name}-{type}.md where type is research|scout|review|comparison
  const reportMatch = name.match(/^(.+)-(research|scout|review|comparison)$/);
  if (reportMatch) {
    return {
      name: reportMatch[1].replace(/-/g, " "),
      path: join(folder, filename),
      type: reportMatch[2],
      date: contentDate || fallbackDate,
      mtime: stats.mtime.toISOString(),
    };
  }

  // Other files: use filename as name
  return {
    name: name.replace(/-/g, " "),
    path: join(folder, filename),
    type: ext === ".json" ? "state" : folder.replace(".", ""),
    date: contentDate || fallbackDate,
    mtime: stats.mtime.toISOString(),
  };
}

function getDateKey(dateStr, today, yesterday) {
  if (!dateStr) return "Unknown";
  const date = dateStr.split("T")[0];
  if (date === today) return "Today";
  if (date === yesterday) return "Yesterday";
  return date;
}

// ═══════════════════════════════════════════════════════════════
// HTTP Server & Routing
// ═══════════════════════════════════════════════════════════════

async function handleRequest(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  try {
    // API routes
    if (pathname === "/api/docs") {
      const tree = await discoverDocuments();
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(tree));
      return;
    }

    if (pathname === "/api/doc") {
      // GET: Read document
      if (req.method === "GET") {
        const docPath = url.searchParams.get("path");
        if (!docPath) {
          res.writeHead(400, { "Content-Type": "text/plain" });
          res.end("Missing path parameter");
          return;
        }

        const safePath = resolveSafePath(docPath);
        if (!safePath) {
          res.writeHead(403, { "Content-Type": "text/plain" });
          res.end("Access denied");
          return;
        }

        const content = await readFile(safePath, "utf-8");
        const stats = await stat(safePath);
        const mime = MIME_TYPES[extname(safePath)] || "text/plain";
        res.writeHead(200, {
          "Content-Type": mime,
          "X-Last-Modified": stats.mtime.toISOString(),
        });
        res.end(content);
        return;
      }

      // POST: Save document
      if (req.method === "POST") {
        const MAX_BODY_SIZE = 10 * 1024 * 1024; // 10MB limit
        let body = "";
        let totalSize = 0;

        for await (const chunk of req) {
          totalSize += chunk.length;
          if (totalSize > MAX_BODY_SIZE) {
            res.writeHead(413, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Request body too large" }));
            return;
          }
          body += chunk;
        }

        let data;
        try {
          data = JSON.parse(body);
        } catch {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Invalid JSON" }));
          return;
        }

        const { path: docPath, content } = data;
        if (!docPath || content === undefined) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Missing path or content" }));
          return;
        }

        const safePath = resolveSafePath(docPath);
        if (!safePath) {
          res.writeHead(403, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Access denied" }));
          return;
        }

        // Only allow editing .md files
        if (extname(safePath) !== ".md") {
          res.writeHead(403, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({ error: "Only markdown files can be edited" })
          );
          return;
        }

        try {
          await writeFile(safePath, content, "utf-8");
          const stats = await stat(safePath);
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({
              success: true,
              mtime: stats.mtime.toISOString(),
            })
          );
        } catch (err) {
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Failed to save" }));
        }
        return;
      }

      // Method not allowed
      res.writeHead(405, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Method not allowed" }));
      return;
    }

    if (pathname === "/events") {
      handleSSE(req, res);
      return;
    }

    // Serve HTML shell
    if (pathname === "/") {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(getHtmlTemplate());
      return;
    }

    // 404
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not found");
  } catch (err) {
    console.error("Request error:", err.message);
    res.writeHead(500, { "Content-Type": "text/plain" });
    res.end("Internal server error");
  }
}

function resolveSafePath(requestedPath) {
  // Reject null bytes which could truncate path checks
  if (requestedPath.includes("\0")) {
    return null;
  }

  const normalizedBase = normalize(resolve(CLAUDE_DIR));
  const normalizedTarget = normalize(resolve(CLAUDE_DIR, requestedPath));

  if (!normalizedTarget.startsWith(normalizedBase)) {
    return null;
  }

  if (!existsSync(normalizedTarget)) {
    return null;
  }

  return normalizedTarget;
}

// ═══════════════════════════════════════════════════════════════
// Server-Sent Events
// ═══════════════════════════════════════════════════════════════

function handleSSE(req, res) {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "Access-Control-Allow-Origin": "*",
  });

  res.write("event: connected\ndata: {}\n\n");

  const clientId = Date.now() + Math.random();
  const heartbeat = setInterval(() => {
    res.write(":heartbeat\n\n");
  }, HEARTBEAT_MS);

  sseClients.set(clientId, res);

  req.on("close", () => {
    clearInterval(heartbeat);
    sseClients.delete(clientId);
  });
}

function broadcastReload(filename) {
  const data = JSON.stringify({
    type: "reload",
    file: filename,
    timestamp: Date.now(),
  });

  for (const [, res] of sseClients) {
    res.write(`event: reload\ndata: ${data}\n\n`);
  }
}

// ═══════════════════════════════════════════════════════════════
// File Watching
// ═══════════════════════════════════════════════════════════════

function startFileWatcher() {
  const supportsRecursive = platform() === "darwin" || platform() === "win32";

  const watchHandler = (eventType, filename) => {
    if (!filename) return;
    if (shouldIgnore(filename)) return;

    // Only reload for files in document folders
    if (!isDocumentFile(filename)) return;

    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      console.log(`File changed: ${filename}`);
      broadcastReload(filename);
    }, DEBOUNCE_MS);
  };

  if (supportsRecursive) {
    // macOS/Windows: watch each document folder recursively
    for (const folder of DOCUMENT_FOLDERS) {
      const folderPath = join(CLAUDE_DIR, folder);
      if (existsSync(folderPath)) {
        watch(folderPath, { recursive: true }, watchHandler);
      }
    }
  } else {
    // Linux: watch each folder and walk subdirectories
    for (const folder of DOCUMENT_FOLDERS) {
      const folderPath = join(CLAUDE_DIR, folder);
      if (existsSync(folderPath)) {
        watchRecursive(folderPath, watchHandler);
      }
    }
  }
}

function shouldIgnore(filename) {
  const ignorePatterns = [
    /^\./, // Hidden files
    /~$/, // Vim backup
    /\.swp$/, // Vim swap
    /\.tmp$/, // Temp files
    /4913$/, // Vim temp
  ];
  return ignorePatterns.some((p) => p.test(filename));
}

function isDocumentFile(filename) {
  // Accept .md and .json files
  const ext = extname(filename);
  return ext === ".md" || ext === ".json";
}

async function watchRecursive(dir, handler) {
  // Watch the directory itself
  watch(dir, handler);

  // Walk subdirectories
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory() && !entry.name.startsWith(".")) {
        await watchRecursive(join(dir, entry.name), handler);
      }
    }
  } catch {
    // Ignore errors (e.g., permission denied)
  }
}

// ═══════════════════════════════════════════════════════════════
// Browser Opening
// ═══════════════════════════════════════════════════════════════

function openBrowser(url) {
  const plat = platform();
  let command;

  // Check for WSL
  const isWSL =
    plat === "linux" &&
    existsSync("/proc/version") &&
    require("fs").readFileSync("/proc/version", "utf8").includes("microsoft");

  if (isWSL) {
    command = `cmd.exe /c start "" "${url}"`;
  } else if (plat === "darwin") {
    command = `open "${url}"`;
  } else if (plat === "win32") {
    command = `start "" "${url}"`;
  } else {
    command = `xdg-open "${url}"`;
  }

  exec(command, (err) => {
    if (err) {
      console.log(`Could not open browser automatically.`);
      console.log(`Please open: ${url}`);
    }
  });
}

// ═══════════════════════════════════════════════════════════════
// Server Startup
// ═══════════════════════════════════════════════════════════════

function startServer(port, retries = MAX_PORT_RETRIES) {
  const server = createServer(handleRequest);

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE" && retries > 0) {
      console.log(`Port ${port} in use, trying ${port + 1}...`);
      startServer(port + 1, retries - 1);
    } else {
      console.error("Server error:", err.message);
      process.exit(1);
    }
  });

  server.listen(port, () => {
    const url = `http://localhost:${port}`;
    console.log("");
    console.log(
      "═══════════════════════════════════════════════════════════════"
    );
    console.log("  CCK Document Viewer");
    console.log(
      "═══════════════════════════════════════════════════════════════"
    );
    console.log(`  URL: ${url}`);
    console.log("  Press Ctrl+C to stop");
    console.log(
      "═══════════════════════════════════════════════════════════════"
    );
    console.log("");

    startFileWatcher();
    openBrowser(url);
  });

  // Graceful shutdown
  const shutdown = () => {
    console.log("\nShutting down...");

    // Close all SSE connections
    for (const [id, res] of sseClients) {
      res.end();
      sseClients.delete(id);
    }

    server.close(() => {
      console.log("Server closed");
      process.exit(0);
    });

    // Force exit after 2 seconds if server.close() hangs
    setTimeout(() => {
      console.log("Force exit");
      process.exit(0);
    }, 2000);
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}

// ═══════════════════════════════════════════════════════════════
// HTML Template
// ═══════════════════════════════════════════════════════════════

function getHtmlTemplate() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CCK Document Viewer</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.8.1/github-markdown.min.css">
  <style>
    :root {
      --bg-primary: #fafaf9;
      --bg-secondary: #f5f5f4;
      --bg-sidebar: #f5f5f4;
      --text-primary: #292524;
      --text-secondary: #57534e;
      --border-color: #e7e5e4;
      --accent: #2563eb;
      --hover-bg: #e7e5e4;
    }
    [data-theme="dark"] {
      --bg-primary: #0d1117;
      --bg-secondary: #161b22;
      --bg-sidebar: #161b22;
      --text-primary: #e6edf3;
      --text-secondary: #8b949e;
      --border-color: #30363d;
      --accent: #58a6ff;
      --hover-bg: #21262d;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
      background: var(--bg-primary);
      color: var(--text-primary);
      display: flex;
      height: 100vh;
    }

    /* Sidebar */
    .sidebar {
      width: 280px;
      min-width: 280px;
      background: var(--bg-sidebar);
      border-right: 1px solid var(--border-color);
      overflow-y: auto;
      padding: 16px;
    }
    .sidebar-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--border-color);
    }
    .sidebar-title {
      font-size: 14px;
      font-weight: 600;
    }
    .theme-toggle {
      background: none;
      border: 1px solid var(--border-color);
      border-radius: 6px;
      padding: 4px 8px;
      cursor: pointer;
      color: var(--text-secondary);
      font-size: 12px;
    }
    .theme-toggle:hover { background: var(--hover-bg); }

    /* Tree Navigation */
    .tree-date {
      margin-bottom: 8px;
    }
    .tree-date-header {
      display: flex;
      align-items: center;
      padding: 6px 8px;
      font-size: 13px;
      font-weight: 600;
      color: var(--text-primary);
      cursor: pointer;
      border-radius: 6px;
    }
    .tree-date-header:hover { background: var(--hover-bg); }
    .tree-date-header::before {
      content: '▶';
      font-size: 10px;
      margin-right: 6px;
      transition: transform 0.2s;
    }
    .tree-date.open .tree-date-header::before { transform: rotate(90deg); }
    .tree-date-content { display: none; padding-left: 16px; }
    .tree-date.open .tree-date-content { display: block; }

    .tree-folder {
      margin: 4px 0;
    }
    .tree-folder-header {
      display: flex;
      align-items: center;
      padding: 4px 8px;
      font-size: 12px;
      font-weight: 500;
      color: var(--text-secondary);
      cursor: pointer;
      border-radius: 4px;
    }
    .tree-folder-header:hover { background: var(--hover-bg); }
    .tree-folder-header::before {
      content: '▶';
      font-size: 8px;
      margin-right: 6px;
      transition: transform 0.2s;
    }
    .tree-folder.open .tree-folder-header::before { transform: rotate(90deg); }
    .tree-folder-content { display: none; padding-left: 14px; }
    .tree-folder.open .tree-folder-content { display: block; }

    .tree-file {
      padding: 4px 8px;
      font-size: 12px;
      color: var(--text-primary);
      cursor: pointer;
      border-radius: 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .tree-file:hover { background: var(--hover-bg); }
    .tree-file.active { background: var(--accent); color: white; }
    .tree-file-type {
      display: inline-block;
      padding: 1px 4px;
      font-size: 10px;
      background: var(--bg-secondary);
      border-radius: 3px;
      margin-right: 6px;
      color: var(--text-secondary);
    }
    .tree-file.active .tree-file-type { background: rgba(255,255,255,0.2); color: white; }

    /* Content */
    .content {
      flex: 1;
      overflow-y: auto;
      padding: 32px 48px;
    }
    .content .markdown-body {
      max-width: 1200px;
      margin: 0 auto;
    }
    .content.empty {
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-secondary);
    }
    .markdown-body {
      background: transparent !important;
      color: var(--text-primary) !important;
    }
    .markdown-body h1,
    .markdown-body h2,
    .markdown-body h3,
    .markdown-body h4,
    .markdown-body h5,
    .markdown-body h6 {
      color: var(--text-primary) !important;
      border-bottom-color: var(--border-color);
    }
    .markdown-body a {
      color: var(--accent) !important;
    }
    .markdown-body code {
      background: var(--bg-secondary) !important;
      color: var(--text-primary) !important;
    }
    .markdown-body pre {
      background: var(--bg-secondary) !important;
    }
    .markdown-body pre code {
      background: transparent !important;
    }
    .markdown-body blockquote {
      color: var(--text-secondary) !important;
      border-left-color: var(--border-color) !important;
    }
    .markdown-body table tr {
      background: var(--bg-primary) !important;
      border-color: var(--border-color) !important;
    }
    .markdown-body table tr:nth-child(2n) {
      background: var(--bg-secondary) !important;
    }
    .markdown-body table th,
    .markdown-body table td {
      border-color: var(--border-color) !important;
    }
    .markdown-body hr {
      background: var(--border-color) !important;
    }
    .markdown-body strong {
      color: var(--text-primary) !important;
    }

    /* Live reload indicator */
    .live-indicator {
      position: fixed;
      bottom: 16px;
      right: 16px;
      background: #2da44e;
      color: white;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 11px;
      opacity: 0;
      transition: opacity 0.3s;
    }
    .live-indicator.show { opacity: 1; }

    /* Toolbar */
    .toolbar {
      display: none;
      gap: 8px;
      padding: 12px 48px;
      border-bottom: 1px solid var(--border-color);
      background: var(--bg-secondary);
      align-items: center;
    }
    .toolbar.visible { display: flex; }
    .toolbar-btn {
      padding: 6px 12px;
      border: 1px solid var(--border-color);
      border-radius: 6px;
      background: var(--bg-primary);
      color: var(--text-primary);
      cursor: pointer;
      font-size: 13px;
      transition: background 0.2s;
    }
    .toolbar-btn:hover { background: var(--hover-bg); }
    .toolbar-btn.primary {
      background: var(--accent);
      border-color: var(--accent);
      color: white;
    }
    .toolbar-btn.primary:hover { opacity: 0.9; }
    .toolbar-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .toolbar-status {
      margin-left: auto;
      font-size: 12px;
      color: var(--text-secondary);
    }
    .toolbar-status.dirty { color: #f97316; }
    .toolbar-status.saving { color: var(--accent); }
    .toolbar-status.saved { color: #22c55e; }

    /* Editor */
    .editor-textarea {
      width: 100%;
      height: calc(100vh - 100px);
      padding: 32px 48px;
      border: none;
      outline: none;
      resize: none;
      font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace;
      font-size: 14px;
      line-height: 1.6;
      background: var(--bg-primary);
      color: var(--text-primary);
    }
    .editor-textarea:focus { outline: none; }

    /* Content wrapper for edit mode */
    .content-wrapper {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .content-wrapper .content {
      flex: 1;
      overflow-y: auto;
    }

    /* WYSIWYG Edit Mode */
    .markdown-body.editing {
      outline: 2px solid var(--accent);
      outline-offset: 8px;
      border-radius: 4px;
      min-height: 200px;
    }
    .markdown-body.editing:focus {
      outline-color: var(--accent);
    }
    .markdown-body.editing pre,
    .markdown-body.editing code {
      white-space: pre-wrap;
    }
    .markdown-body.editing table,
    .markdown-body.editing img {
      pointer-events: none;
      opacity: 0.8;
    }
  </style>
</head>
<body>
  <aside class="sidebar">
    <div class="sidebar-header">
      <span class="sidebar-title">CCK Documents</span>
      <button class="theme-toggle" onclick="toggleTheme()">🌓</button>
    </div>
    <nav id="nav"></nav>
  </aside>
  <div class="content-wrapper">
    <div class="toolbar" id="toolbar">
      <button class="toolbar-btn" id="editBtn" onclick="enterEditMode()">Edit</button>
      <button class="toolbar-btn primary" id="saveBtn" onclick="saveDocument()" style="display:none">Save</button>
      <button class="toolbar-btn" id="cancelBtn" onclick="exitEditMode()" style="display:none">Cancel</button>
      <span class="toolbar-status" id="toolbarStatus"></span>
    </div>
    <main class="content empty" id="content">
      <p>Select a document from the sidebar</p>
    </main>
  </div>
  <div class="live-indicator" id="liveIndicator">● Live</div>

  <script src="https://cdn.jsdelivr.net/npm/marked/lib/marked.umd.js"></script>
  <script src="https://unpkg.com/turndown/dist/turndown.js"></script>
  <script>
    let currentPath = null;
    let docsTree = {};

    // Edit mode state
    let isEditMode = false;
    let isDirty = false;
    let originalContent = '';
    let originalHtml = '';
    let lastKnownMtime = null;

    // Initialize Turndown for HTML-to-Markdown conversion
    const turndownService = new TurndownService({
      headingStyle: 'atx',
      codeBlockStyle: 'fenced',
      bulletListMarker: '-',
      emDelimiter: '*'
    });
    // Preserve code block language if present
    turndownService.addRule('fencedCodeBlock', {
      filter: function (node, options) {
        return node.nodeName === 'PRE' && node.querySelector('code');
      },
      replacement: function (content, node) {
        const code = node.querySelector('code');
        const lang = (code.className.match(/language-(\\w+)/) || ['', ''])[1];
        const text = code.textContent;
        return '\\n\\n\`\`\`' + lang + '\\n' + text + '\\n\`\`\`\\n\\n';
      }
    });

    // Theme
    function initTheme() {
      const saved = localStorage.getItem('cck-theme');
      if (saved) {
        document.documentElement.setAttribute('data-theme', saved);
      } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.setAttribute('data-theme', 'dark');
      }
    }
    function toggleTheme() {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('cck-theme', next);
    }

    // Navigation
    async function loadDocs() {
      const res = await fetch('/api/docs');
      docsTree = await res.json();
      renderNav();
    }

    function renderNav() {
      const nav = document.getElementById('nav');
      nav.innerHTML = '';

      for (const [date, folders] of Object.entries(docsTree)) {
        const dateEl = document.createElement('div');
        dateEl.className = 'tree-date' + (date === 'Today' ? ' open' : '');

        let html = '<div class="tree-date-header" onclick="this.parentElement.classList.toggle(\\'open\\')">' + date + '</div>';
        html += '<div class="tree-date-content">';

        for (const [folder, files] of Object.entries(folders)) {
          html += '<div class="tree-folder open">';
          html += '<div class="tree-folder-header" onclick="this.parentElement.classList.toggle(\\'open\\')">' + folder + ' (' + files.length + ')</div>';
          html += '<div class="tree-folder-content">';

          for (const file of files) {
            const typeLabel = file.type || folder;
            html += '<div class="tree-file" data-path="' + file.path + '" onclick="handleDocClick(\\'' + file.path + '\\')">';
            html += '<span class="tree-file-type">' + typeLabel + '</span>';
            html += file.name;
            html += '</div>';
          }

          html += '</div></div>';
        }

        html += '</div>';
        dateEl.innerHTML = html;
        nav.appendChild(dateEl);
      }
    }

    // Handle document click with unsaved changes check
    function handleDocClick(path) {
      if (isDirty) {
        if (!confirm('You have unsaved changes. Discard them?')) {
          return;
        }
        exitEditMode(true);
      }
      loadDoc(path);
    }

    // Document loading
    async function loadDoc(path) {
      currentPath = path;

      // Update active state
      document.querySelectorAll('.tree-file').forEach(el => {
        el.classList.toggle('active', el.dataset.path === path);
      });

      const content = document.getElementById('content');
      const toolbar = document.getElementById('toolbar');
      content.classList.remove('empty');

      try {
        const res = await fetch('/api/doc?path=' + encodeURIComponent(path));
        const text = await res.text();
        lastKnownMtime = res.headers.get('X-Last-Modified');

        if (path.endsWith('.json')) {
          content.innerHTML = '<pre class="markdown-body"><code>' +
            JSON.stringify(JSON.parse(text), null, 2) + '</code></pre>';
          toolbar.classList.remove('visible');
        } else {
          content.innerHTML = '<article class="markdown-body">' + marked.parse(text) + '</article>';
          // Show toolbar for markdown files
          toolbar.classList.add('visible');
          showViewMode();
        }
      } catch (err) {
        content.textContent = 'Error loading document: ' + err.message;
        content.style.color = 'red';
        toolbar.classList.remove('visible');
      }
    }

    // Edit Mode Functions
    function showViewMode() {
      document.getElementById('editBtn').style.display = '';
      document.getElementById('saveBtn').style.display = 'none';
      document.getElementById('cancelBtn').style.display = 'none';
      updateStatus('');
    }

    function showEditModeButtons() {
      document.getElementById('editBtn').style.display = 'none';
      document.getElementById('saveBtn').style.display = '';
      document.getElementById('cancelBtn').style.display = '';
    }

    function updateStatus(text, className = '') {
      const status = document.getElementById('toolbarStatus');
      status.textContent = text;
      status.className = 'toolbar-status' + (className ? ' ' + className : '');
    }

    async function enterEditMode() {
      if (!currentPath || isEditMode) return;

      try {
        // Fetch original markdown for comparison
        const res = await fetch('/api/doc?path=' + encodeURIComponent(currentPath));
        originalContent = await res.text();
        lastKnownMtime = res.headers.get('X-Last-Modified');

        const content = document.getElementById('content');
        const markdownBody = content.querySelector('.markdown-body');
        if (!markdownBody) return;

        // Save scroll position before any changes
        const scrollTop = content.scrollTop;

        // Store original HTML for dirty tracking
        originalHtml = markdownBody.innerHTML;

        // Enable inline editing
        markdownBody.contentEditable = 'true';
        markdownBody.classList.add('editing');

        // Focus without scrolling
        markdownBody.focus({ preventScroll: true });

        // Restore scroll position (in case focus caused scroll)
        content.scrollTop = scrollTop;

        // Add event listeners for WYSIWYG editing
        markdownBody.addEventListener('input', trackChanges);
        markdownBody.addEventListener('paste', handlePaste);
        markdownBody.addEventListener('keydown', handleEditShortcuts);

        isEditMode = true;
        isDirty = false;
        showEditModeButtons();
        updateStatus('Editing');
      } catch (err) {
        alert('Failed to load document for editing: ' + err.message);
      }
    }

    // Handle paste: strip HTML formatting
    function handlePaste(e) {
      e.preventDefault();
      const text = e.clipboardData.getData('text/plain');
      document.execCommand('insertText', false, text);
    }

    // Handle formatting shortcuts (Ctrl+B, Ctrl+I, Ctrl+K)
    function handleEditShortcuts(e) {
      if (!isEditMode) return;

      if (e.ctrlKey || e.metaKey) {
        switch(e.key.toLowerCase()) {
          case 'b':
            e.preventDefault();
            document.execCommand('bold');
            trackChanges();
            break;
          case 'i':
            e.preventDefault();
            document.execCommand('italic');
            trackChanges();
            break;
          case 'k':
            e.preventDefault();
            const url = prompt('Enter URL:');
            if (url) {
              const trimmedUrl = url.trim();
              // Validate URL - only allow http, https, mailto, and relative paths
              if (/^(https?:\\/\\/|mailto:|#|\\/|\\.\\.?\\/)/i.test(trimmedUrl) ||
                  !/^[a-z]+:/i.test(trimmedUrl)) {
                document.execCommand('createLink', false, trimmedUrl);
                trackChanges();
              } else {
                alert('Invalid URL. Only http://, https://, mailto:, or relative paths allowed.');
              }
            }
            break;
        }
      }
    }

    function exitEditMode(force = false) {
      if (!isEditMode) return;

      if (isDirty && !force) {
        if (!confirm('You have unsaved changes. Discard them?')) {
          return;
        }
      }

      const content = document.getElementById('content');
      const markdownBody = content.querySelector('.markdown-body');
      if (markdownBody) {
        // Remove contenteditable and event listeners
        markdownBody.contentEditable = 'false';
        markdownBody.classList.remove('editing');
        markdownBody.removeEventListener('input', trackChanges);
        markdownBody.removeEventListener('paste', handlePaste);
        markdownBody.removeEventListener('keydown', handleEditShortcuts);
      }

      isEditMode = false;
      isDirty = false;
      loadDoc(currentPath);
    }

    function trackChanges() {
      const content = document.getElementById('content');
      const markdownBody = content.querySelector('.markdown-body');
      if (!markdownBody) return;

      const newDirty = markdownBody.innerHTML !== originalHtml;
      if (newDirty !== isDirty) {
        isDirty = newDirty;
        updateStatus(isDirty ? 'Unsaved changes' : 'Editing', isDirty ? 'dirty' : '');
      }
    }

    async function saveDocument() {
      if (!isEditMode || !currentPath) return;

      const content = document.getElementById('content');
      const markdownBody = content.querySelector('.markdown-body');
      if (!markdownBody) return;

      const saveBtn = document.getElementById('saveBtn');
      saveBtn.disabled = true;
      updateStatus('Saving...', 'saving');

      try {
        // Convert HTML back to markdown using Turndown
        const markdown = turndownService.turndown(markdownBody);

        const res = await fetch('/api/doc', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            path: currentPath,
            content: markdown
          })
        });

        const result = await res.json();

        if (result.success) {
          originalContent = markdown;
          originalHtml = markdownBody.innerHTML;
          lastKnownMtime = result.mtime;
          isDirty = false;
          updateStatus('Saved!', 'saved');
          setTimeout(() => {
            if (!isDirty) updateStatus('Editing');
          }, 2000);
        } else {
          alert('Failed to save: ' + result.error);
          updateStatus('Save failed', 'dirty');
        }
      } catch (err) {
        alert('Failed to save: ' + err.message);
        updateStatus('Save failed', 'dirty');
      } finally {
        saveBtn.disabled = false;
      }
    }

    // SSE Live Reload
    function initSSE() {
      const evtSource = new EventSource('/events');
      const indicator = document.getElementById('liveIndicator');

      evtSource.addEventListener('connected', () => {
        indicator.classList.add('show');
        setTimeout(() => indicator.classList.remove('show'), 2000);
      });

      evtSource.addEventListener('reload', async (e) => {
        const data = JSON.parse(e.data);
        console.log('File changed:', data.file);

        // Check for external changes while editing (exact filename match)
        const currentFilename = currentPath ? currentPath.split('/').pop() : '';
        if (isEditMode && currentPath && data.file === currentFilename) {
          const reload = confirm('This file was modified externally. Reload and lose your changes?');
          if (!reload) {
            indicator.textContent = '⚠ External change ignored';
            indicator.classList.add('show');
            setTimeout(() => indicator.classList.remove('show'), 3000);
            return;
          }
          exitEditMode(true);
        }

        indicator.textContent = '↻ Reloading...';
        indicator.classList.add('show');

        await loadDocs();
        if (currentPath && !isEditMode) {
          await loadDoc(currentPath);
        }

        indicator.textContent = '● Live';
        setTimeout(() => indicator.classList.remove('show'), 1500);
      });

      evtSource.onerror = () => {
        indicator.textContent = '○ Disconnected';
        indicator.classList.add('show');
      };
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Ctrl+S / Cmd+S to save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        if (isEditMode) {
          e.preventDefault();
          saveDocument();
        }
      }
      // Escape to exit edit mode
      if (e.key === 'Escape' && isEditMode) {
        exitEditMode();
      }
    });

    // Unsaved changes protection
    window.addEventListener('beforeunload', (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    });

    // Initialize
    initTheme();
    loadDocs();
    initSSE();
  </script>
</body>
</html>`;
}

// Start the server
startServer(BASE_PORT);
