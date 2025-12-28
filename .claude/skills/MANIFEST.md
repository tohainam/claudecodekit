# Skills Manifest

Central registry of all available skills with full descriptions for semantic matching.

## How This Works

1. The `skill-loader.md` rule reads this manifest on every operation
2. It matches task context **semantically** against skill descriptions (not just keywords)
3. Matching skills are automatically loaded
4. Visual confirmation is provided to the user

## Semantic Matching

Instead of keyword matching, Claude analyzes the task and determines which skills are relevant based on:
- The full description of each skill
- The context and intent of the task
- The technologies and domains involved

This allows for more intelligent skill loading that understands context, not just exact words.

---

## Registered Skills

### architecture
**Description**: Software architecture design, system design, and component design guidance applicable to all technologies (frontend, backend, APIs, microservices). Use when: (1) Planning new features or systems, (2) Designing component structure, (3) Making architectural decisions, (4) Evaluating design patterns, (5) Reviewing system design, (6) Refactoring for better architecture, (7) Designing APIs or data flow, (8) Working with Clean/Hexagonal/Layered architecture.

---

### code-quality
**Description**: Universal code quality best practices for writing clean, maintainable, secure code across all technologies (frontend, backend, mobile, DevOps). Use when: (1) Writing or reviewing code, (2) Refactoring existing code, (3) Setting up linting/formatting, (4) Conducting code reviews, (5) Improving code readability, (6) Fixing code smells, (7) Implementing error handling, (8) Adding tests, (9) Security hardening, (10) Establishing coding standards for a team or project.

---

### debugging
**Description**: Universal debugging skill for systematic root cause analysis and bug fixing across all technologies. Use when: (1) encountering errors, exceptions, or unexpected behavior, (2) investigating bugs or issues, (3) analyzing stack traces, logs, or error messages, (4) diagnosing performance problems, (5) debugging frontend (React, Vue, Angular, browser), backend (Node.js, Python, Java, Go), mobile (iOS, Android, React Native, Flutter), database queries, or distributed systems. Applies scientific debugging methodology with hypothesis-driven investigation.

---

### documentation
**Description**: Universal documentation skill for creating high-quality technical documentation across all technologies. Use when writing, reviewing, or improving: (1) README files and project documentation, (2) API documentation (REST, GraphQL, gRPC, WebSocket), (3) Code documentation (JSDoc, TypeDoc, docstrings, Godoc), (4) Architecture documentation (ADRs, C4 diagrams, design docs), (5) Database schemas and data models, (6) Configuration and environment documentation, (7) Runbooks and operational guides, (8) Changelogs and release notes, (9) Troubleshooting guides, (10) User guides and tutorials. Applies ALCOA-C principles and docs-as-code best practices.

---

### git-workflow
**Description**: Comprehensive Git operations including commits, branching, PRs, and version control best practices. Use when Claude needs to: (1) Create commits with proper conventional commit messages, (2) Choose or implement branching strategies (GitFlow, GitHub Flow, Trunk-based), (3) Create or review pull requests, (4) Handle git operations safely (merge, rebase, reset), (5) Set up branch naming conventions, (6) Generate changelogs or manage releases, (7) Resolve merge conflicts, (8) Review git history or recover from mistakes. Applies to all technologies - frontend, backend, mobile, DevOps, and full-stack projects.

---

### performance
**Description**: Comprehensive performance optimization skill for all technologies: frontend (React, Vue, Angular), backend (Node.js, Python, Go, Java), databases (SQL, NoSQL), mobile (iOS, Android, React Native, Flutter), and APIs/microservices. Use PROACTIVELY when: (1) User reports slow performance, lag, or high latency, (2) Profiling or benchmarking is needed, (3) Optimizing Core Web Vitals (LCP, INP, CLS), (4) Database query optimization, (5) Memory leaks or high CPU usage, (6) Caching strategy design, (7) API throughput/latency improvements, (8) Mobile app performance tuning, (9) Code review for performance issues, (10) Load testing or capacity planning.

---

### project-analysis
**Description**: Comprehensive codebase analysis for Claude Code configuration. Use when users run /onboard to analyze a new project, detect tech stack, and recommend rules/skills setup. Supports JavaScript/TypeScript, Python, Go, Rust, Java, Ruby, PHP, C# projects including monorepos.

---

### refactoring
**Description**: Safe code refactoring techniques for improving code quality without changing behavior. Use PROACTIVELY when: (1) Code exhibits smells (long methods, duplicate code, large classes, feature envy), (2) Improving readability, maintainability, or testability, (3) Reducing technical debt or complexity, (4) Preparing code for new features or changes, (5) Extracting/inlining methods, classes, or variables.

---

### security-review
**Description**: Comprehensive security review and vulnerability analysis for code, architecture, and infrastructure. Use this skill PROACTIVELY when: (1) Reviewing code for security vulnerabilities (XSS, SQLi, CSRF, etc.), (2) Auditing authentication/authorization implementations, (3) Checking API security, (4) Reviewing cloud/infrastructure configurations, (5) Analyzing mobile app security, (6) Checking cryptography implementations, (7) Evaluating supply chain/dependency security, (8) Performing pre-deployment security checks, (9) Writing security-sensitive code, (10) User asks about OWASP, security best practices, or vulnerability prevention.

---

### skill-creator
**Description**: Guide for creating effective skills. This skill should be used when users want to create a new skill (or update an existing skill) that extends Claude's capabilities with specialized knowledge, workflows, or tool integrations.

---

### testing
**Description**: Comprehensive testing expertise for all technologies: frontend (React, Vue, Angular), backend (Python, Node.js, Go, Java), and mobile (React Native, Flutter, iOS, Android). Covers TDD/BDD methodologies, test strategies, coverage optimization, and modern testing tools (Vitest, Playwright, pytest, Jest). Use this skill when: (1) Writing unit tests, integration tests, or E2E tests, (2) Implementing TDD (Test-Driven Development) or BDD workflows, (3) Setting up testing frameworks (Vitest, Jest, pytest, etc.), (4) Configuring Playwright or Cypress for E2E testing.

---

### frontend-design
**Description**: Create distinctive, production-grade frontend interfaces with high design quality. Use this skill when the user asks to build web components, pages, artifacts, posters, or applications (examples include websites, landing pages, dashboards, React components, HTML/CSS layouts, or when styling/beautifying any web UI). Generates creative, polished code and UI design that avoids generic AI aesthetics.

---

## Adding New Skills

When adding a new skill:
1. Create the skill directory with SKILL.md (use skill-creator skill)
2. The skill-creator will automatically add an entry to this manifest
3. Entry includes: skill name and full description from SKILL.md frontmatter
4. The skill-loader rule will automatically include it in semantic matching

## Maintenance

- Descriptions should match the SKILL.md frontmatter exactly
- When updating a skill's description, update both SKILL.md and this manifest
- The skill-creator skill handles this automatically for new skills
