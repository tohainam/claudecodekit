#!/usr/bin/env node
/**
 * CCK Checklists Viewer
 * Zero-dependency local web viewer for Claude Code Kit checklists
 *
 * Usage: node .claude/tools/checklists-viewer.js [port]
 *
 * Features:
 * - 2-level navigation (Month → Feature → Files)
 * - Real-time updates via SSE
 * - Markdown rendering via marked.js (CDN)
 * - Cross-platform browser auto-open
 */

import { createServer } from "node:http";
import { readFile, readdir, stat, mkdir } from "node:fs/promises";
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

// Get project root (3 levels up from .claude/tools/checklists-viewer.js)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = resolve(__dirname, "../..");
const CLAUDE_DIR = join(PROJECT_ROOT, ".claude");
const CHECKLISTS_DIR = join(CLAUDE_DIR, ".checklists");

// Configuration
const BASE_PORT = parseInt(process.argv[2]) || 5568;
const MAX_PORT_RETRIES = 10;
const DEBOUNCE_MS = 100;
const HEARTBEAT_MS = 30000;

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

// Month names for display
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

// ═══════════════════════════════════════════════════════════════
// Checklist Discovery
// ═══════════════════════════════════════════════════════════════

async function ensureChecklistsDir() {
  if (!existsSync(CHECKLISTS_DIR)) {
    await mkdir(CHECKLISTS_DIR, { recursive: true });
  }
}

async function discoverChecklists() {
  await ensureChecklistsDir();

  const tree = {};

  if (!existsSync(CHECKLISTS_DIR)) return tree;

  const entries = await readdir(CHECKLISTS_DIR, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (entry.name.startsWith(".")) continue;

    const featureName = entry.name;
    const featurePath = join(CHECKLISTS_DIR, featureName);
    const files = await readdir(featurePath, { withFileTypes: true });

    for (const file of files) {
      if (!file.isFile()) continue;
      const ext = extname(file.name);
      if (ext !== ".md") continue;

      const filePath = join(featurePath, file.name);
      const stats = await stat(filePath);
      const mtime = stats.mtime;

      // Get month key (e.g., "January 2026")
      const monthKey = `${MONTH_NAMES[mtime.getMonth()]} ${mtime.getFullYear()}`;

      if (!tree[monthKey]) tree[monthKey] = {};
      if (!tree[monthKey][featureName]) tree[monthKey][featureName] = [];

      tree[monthKey][featureName].push({
        name: basename(file.name, ext).replace(/-/g, " "),
        path: join(".checklists", featureName, file.name),
        feature: featureName,
        mtime: mtime.toISOString(),
      });
    }
  }

  // Sort: months descending, features alphabetically, files by mtime descending
  const sortedTree = {};
  const monthKeys = Object.keys(tree).sort((a, b) => {
    const [aMonth, aYear] = a.split(" ");
    const [bMonth, bYear] = b.split(" ");
    const aDate = new Date(`${aMonth} 1, ${aYear}`);
    const bDate = new Date(`${bMonth} 1, ${bYear}`);
    return bDate - aDate; // Descending
  });

  for (const month of monthKeys) {
    sortedTree[month] = {};
    const features = Object.keys(tree[month]).sort();
    for (const feature of features) {
      sortedTree[month][feature] = tree[month][feature].sort(
        (a, b) => new Date(b.mtime) - new Date(a.mtime)
      );
    }
  }

  return sortedTree;
}

// ═══════════════════════════════════════════════════════════════
// HTTP Server & Routing
// ═══════════════════════════════════════════════════════════════

async function handleRequest(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  try {
    // API routes
    if (pathname === "/api/checklists") {
      const tree = await discoverChecklists();
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(tree));
      return;
    }

    if (pathname === "/api/checklist") {
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
    if (!isChecklistFile(filename)) return;

    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      console.log(`File changed: ${filename}`);
      broadcastReload(filename);
    }, DEBOUNCE_MS);
  };

  if (!existsSync(CHECKLISTS_DIR)) return;

  if (supportsRecursive) {
    watch(CHECKLISTS_DIR, { recursive: true }, watchHandler);
  } else {
    watchRecursive(CHECKLISTS_DIR, watchHandler);
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

function isChecklistFile(filename) {
  return extname(filename) === ".md";
}

async function watchRecursive(dir, handler) {
  watch(dir, handler);

  try {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory() && !entry.name.startsWith(".")) {
        await watchRecursive(join(dir, entry.name), handler);
      }
    }
  } catch {
    // Ignore errors
  }
}

// ═══════════════════════════════════════════════════════════════
// Browser Opening
// ═══════════════════════════════════════════════════════════════

function openBrowser(url) {
  const plat = platform();
  let command;

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

  server.listen(port, async () => {
    await ensureChecklistsDir();
    const url = `http://localhost:${port}`;
    console.log("");
    console.log(
      "═══════════════════════════════════════════════════════════════"
    );
    console.log("  CCK Checklists Viewer");
    console.log(
      "═══════════════════════════════════════════════════════════════"
    );
    console.log(`  URL: ${url}`);
    console.log(`  Checklists: .claude/.checklists/`);
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

    for (const [id, res] of sseClients) {
      res.end();
      sseClients.delete(id);
    }

    server.close(() => {
      console.log("Server closed");
      process.exit(0);
    });

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
  <title>CCK Checklists Viewer</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.8.1/github-markdown.min.css">
  <style>
    :root {
      --bg-primary: #fafaf9;
      --bg-secondary: #f5f5f4;
      --bg-sidebar: #f5f5f4;
      --text-primary: #292524;
      --text-secondary: #57534e;
      --border-color: #e7e5e4;
      --accent: #059669;
      --hover-bg: #e7e5e4;
    }
    [data-theme="dark"] {
      --bg-primary: #0d1117;
      --bg-secondary: #161b22;
      --bg-sidebar: #161b22;
      --text-primary: #e6edf3;
      --text-secondary: #8b949e;
      --border-color: #30363d;
      --accent: #34d399;
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
      width: 300px;
      min-width: 300px;
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
    .tree-month {
      margin-bottom: 8px;
    }
    .tree-month-header {
      display: flex;
      align-items: center;
      padding: 8px 10px;
      font-size: 13px;
      font-weight: 600;
      color: var(--text-primary);
      cursor: pointer;
      border-radius: 6px;
      background: var(--bg-secondary);
    }
    .tree-month-header:hover { background: var(--hover-bg); }
    .tree-month-header::before {
      content: '▶';
      font-size: 10px;
      margin-right: 8px;
      transition: transform 0.2s;
    }
    .tree-month.open .tree-month-header::before { transform: rotate(90deg); }
    .tree-month-content { display: none; padding-left: 8px; margin-top: 4px; }
    .tree-month.open .tree-month-content { display: block; }

    .tree-feature {
      margin: 4px 0;
    }
    .tree-feature-header {
      display: flex;
      align-items: center;
      padding: 6px 10px;
      font-size: 12px;
      font-weight: 500;
      color: var(--accent);
      cursor: pointer;
      border-radius: 4px;
    }
    .tree-feature-header:hover { background: var(--hover-bg); }
    .tree-feature-header::before {
      content: '📁';
      margin-right: 6px;
    }
    .tree-feature.open .tree-feature-header::before { content: '📂'; }
    .tree-feature-content { display: none; padding-left: 20px; }
    .tree-feature.open .tree-feature-content { display: block; }

    .tree-file {
      padding: 5px 10px;
      font-size: 12px;
      color: var(--text-primary);
      cursor: pointer;
      border-radius: 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      display: flex;
      align-items: center;
    }
    .tree-file::before {
      content: '☑';
      margin-right: 6px;
      color: var(--text-secondary);
    }
    .tree-file:hover { background: var(--hover-bg); }
    .tree-file.active { background: var(--accent); color: white; }
    .tree-file.active::before { color: white; }

    /* Content */
    .content {
      flex: 1;
      overflow-y: auto;
      padding: 32px 48px;
    }
    .content .markdown-body {
      max-width: 900px;
      margin: 0 auto;
    }
    .content.empty {
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-secondary);
      flex-direction: column;
      gap: 12px;
    }
    .empty-icon {
      font-size: 48px;
      opacity: 0.5;
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
      border-left-color: var(--accent) !important;
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
    /* Checklist styling */
    .markdown-body input[type="checkbox"] {
      margin-right: 8px;
      transform: scale(1.2);
      accent-color: var(--accent);
    }
    .markdown-body li {
      list-style: none;
    }
    .markdown-body ul {
      padding-left: 0;
    }
    .markdown-body ul ul {
      padding-left: 24px;
    }

    /* Live reload indicator */
    .live-indicator {
      position: fixed;
      bottom: 16px;
      right: 16px;
      background: var(--accent);
      color: white;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 11px;
      opacity: 0;
      transition: opacity 0.3s;
    }
    .live-indicator.show { opacity: 1; }

    /* Empty state */
    .help-text {
      max-width: 400px;
      text-align: center;
      line-height: 1.6;
    }
    .help-text code {
      background: var(--bg-secondary);
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <aside class="sidebar">
    <div class="sidebar-header">
      <span class="sidebar-title">☑ Checklists</span>
      <button class="theme-toggle" onclick="toggleTheme()">🌓</button>
    </div>
    <nav id="nav"></nav>
  </aside>
  <main class="content empty" id="content">
    <div class="empty-icon">☑</div>
    <p>Select a checklist from the sidebar</p>
    <p class="help-text">
      Checklists are stored in <code>.claude/.checklists/</code><br>
      Create folders for features, add <code>.md</code> files inside.
    </p>
  </main>
  <div class="live-indicator" id="liveIndicator">● Live</div>

  <script src="https://cdn.jsdelivr.net/npm/marked/lib/marked.umd.js"></script>
  <script>
    let currentPath = null;
    let checklistsTree = {};

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
    async function loadChecklists() {
      const res = await fetch('/api/checklists');
      checklistsTree = await res.json();
      renderNav();
    }

    function renderNav() {
      const nav = document.getElementById('nav');
      nav.innerHTML = '';

      const months = Object.keys(checklistsTree);
      if (months.length === 0) {
        nav.innerHTML = '<p style="color: var(--text-secondary); font-size: 12px; padding: 8px;">No checklists yet.<br><br>Create folders in <code>.claude/.checklists/</code> and add <code>.md</code> files.</p>';
        return;
      }

      for (const [month, features] of Object.entries(checklistsTree)) {
        const monthEl = document.createElement('div');
        // First month is open by default
        const isFirst = months.indexOf(month) === 0;
        monthEl.className = 'tree-month' + (isFirst ? ' open' : '');

        let html = '<div class="tree-month-header" onclick="this.parentElement.classList.toggle(\\'open\\')">' + month + '</div>';
        html += '<div class="tree-month-content">';

        for (const [feature, files] of Object.entries(features)) {
          html += '<div class="tree-feature open">';
          html += '<div class="tree-feature-header" onclick="this.parentElement.classList.toggle(\\'open\\')">' + feature + ' (' + files.length + ')</div>';
          html += '<div class="tree-feature-content">';

          for (const file of files) {
            html += '<div class="tree-file" data-path="' + file.path + '" onclick="loadChecklist(\\'' + file.path + '\\')">';
            html += file.name;
            html += '</div>';
          }

          html += '</div></div>';
        }

        html += '</div>';
        monthEl.innerHTML = html;
        nav.appendChild(monthEl);
      }
    }

    // Document loading
    async function loadChecklist(path) {
      currentPath = path;

      // Update active state
      document.querySelectorAll('.tree-file').forEach(el => {
        el.classList.toggle('active', el.dataset.path === path);
      });

      const content = document.getElementById('content');
      content.classList.remove('empty');

      try {
        const res = await fetch('/api/checklist?path=' + encodeURIComponent(path));
        const text = await res.text();
        content.innerHTML = '<article class="markdown-body">' + marked.parse(text) + '</article>';
      } catch (err) {
        content.innerHTML = '<p style="color: red;">Error loading checklist: ' + err.message + '</p>';
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

        indicator.textContent = '↻ Reloading...';
        indicator.classList.add('show');

        await loadChecklists();
        if (currentPath) {
          await loadChecklist(currentPath);
        }

        indicator.textContent = '● Live';
        setTimeout(() => indicator.classList.remove('show'), 1500);
      });

      evtSource.onerror = () => {
        indicator.textContent = '○ Disconnected';
        indicator.classList.add('show');
      };
    }

    // Initialize
    initTheme();
    loadChecklists();
    initSSE();
  </script>
</body>
</html>`;
}

// Start the server
startServer(BASE_PORT);
