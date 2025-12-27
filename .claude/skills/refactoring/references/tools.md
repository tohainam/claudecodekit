# Refactoring Tools Guide (2025)

Modern tools and automation for safe, efficient refactoring across all technology stacks.

## Table of Contents

1. [IDE Refactoring Features](#ide-refactoring-features)
2. [AI-Powered Refactoring](#ai-powered-refactoring)
3. [Static Analysis Tools](#static-analysis-tools)
4. [Language-Specific Tools](#language-specific-tools)
5. [Automation & CI/CD](#automation--cicd)
6. [Metrics & Visualization](#metrics--visualization)

---

## IDE Refactoring Features

### JetBrains IDEs (IntelliJ, WebStorm, PyCharm, etc.)

**Common Shortcuts:**
```
Shift+F6        Rename
Ctrl+Alt+M      Extract Method
Ctrl+Alt+V      Extract Variable
Ctrl+Alt+C      Extract Constant
Ctrl+Alt+F      Extract Field
Ctrl+Alt+P      Extract Parameter
F6              Move
Ctrl+Alt+N      Inline
```

**Advanced Features:**
- **Structural Search & Replace**: Pattern-based refactoring across codebase
- **Change Signature**: Safely modify method parameters
- **Safe Delete**: Find usages before deletion
- **Type Migration**: Change types throughout codebase
- **AI Assistant** (2025): Context-aware refactoring suggestions

---

### VS Code

**Built-in Refactoring (F2, Ctrl+Shift+R):**
- Rename Symbol
- Extract to Method/Function
- Extract to Variable
- Move to New File
- Convert to Template String

**Essential Extensions:**
```
- Refactor tools (language-specific)
  └── JS/TS: TypeScript built-in, Abracadabra
  └── Python: Pylance, Rope
  └── Go: Go extension built-in
  └── Java: Red Hat Java extension
  └── C#: C# Dev Kit

- Code Quality
  └── SonarLint
  └── Error Lens
  └── ESLint/Prettier

- AI-Powered
  └── GitHub Copilot
  └── Tabnine
  └── Codeium
```

---

### Vim/Neovim

**LSP-Based Refactoring:**
```lua
-- nvim-lspconfig + language servers
vim.keymap.set('n', 'rn', vim.lsp.buf.rename)
vim.keymap.set('n', 'ca', vim.lsp.buf.code_action)
```

**Plugins:**
- **nvim-lspconfig**: LSP refactoring support
- **refactoring.nvim**: Treesitter-based refactoring
- **telescope.nvim**: Navigate refactoring options

---

## AI-Powered Refactoring

### GitHub Copilot (2025)

**Refactoring Capabilities:**
```
- Suggest code improvements inline
- Extract method/function with naming
- Simplify complex conditionals
- Convert between patterns
- Modernize legacy syntax

Usage:
1. Select code to refactor
2. Ctrl+I (Copilot Chat)
3. Prompt: "Refactor this to use [pattern]"
         "Extract a function for this logic"
         "Simplify this conditional"
         "Apply SOLID principles"
```

---

### Refact.ai

**Features:**
- IDE plugin (VS Code, JetBrains)
- Context-aware suggestions
- Multi-language support
- CI/CD integration for automated refactoring

---

### Qodo Gen (formerly CodiumAI)

**Capabilities:**
- Test-aware refactoring
- Ensures behavior preservation
- Generates tests for refactored code
- IDE integration

---

### Google Gemini Code Assist

**Best For:**
- Large-scale modernization
- Legacy code transformation
- Converting patterns (e.g., callbacks → async/await)
- Codebase-wide improvements

---

## Static Analysis Tools

### Multi-Language

#### SonarQube / SonarCloud

**Detects:**
- Code smells with severity
- Duplications
- Cognitive complexity
- Technical debt
- Security vulnerabilities

**Integration:**
```yaml
# GitHub Actions
- name: SonarCloud Scan
  uses: SonarSource/sonarcloud-github-action@master
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
```

---

#### CodeScene

**Features:**
- CodeHealth™ metric
- Hotspot detection (frequently changed + complex)
- Technical debt visualization
- Predictive analysis
- AI-driven refactoring suggestions

**Use Case:** Prioritize where to refactor based on business impact.

---

#### CodeClimate

**Metrics:**
- Maintainability grade (A-F)
- Test coverage
- Duplication detection
- Complexity analysis

---

### JavaScript/TypeScript

```bash
# ESLint with refactoring rules
npm install eslint eslint-plugin-sonarjs

# .eslintrc.js
module.exports = {
  plugins: ['sonarjs'],
  rules: {
    'sonarjs/cognitive-complexity': ['error', 15],
    'sonarjs/no-duplicate-string': 'error',
    'sonarjs/no-identical-functions': 'error',
    'max-lines-per-function': ['warn', 50],
    'max-depth': ['warn', 3],
  }
};

# Additional tools
- jscpd: Duplicate code detection
- madge: Circular dependency detection
- dependency-cruiser: Architecture validation
```

---

### Python

```bash
# Pylint
pip install pylint
pylint --max-line-length=100 --max-args=5 src/

# Ruff (fast, modern)
pip install ruff
ruff check . --select=C,E,W,F,B,SIM,PL

# Radon (complexity)
pip install radon
radon cc src/ -a  # Cyclomatic complexity
radon mi src/     # Maintainability index

# Vulture (dead code)
pip install vulture
vulture src/

# Rope (refactoring library)
pip install rope
# Used by IDEs for Python refactoring
```

---

### Java

```xml
<!-- PMD -->
<plugin>
  <groupId>org.apache.maven.plugins</groupId>
  <artifactId>maven-pmd-plugin</artifactId>
  <configuration>
    <rulesets>
      <ruleset>category/java/bestpractices.xml</ruleset>
      <ruleset>category/java/design.xml</ruleset>
    </rulesets>
  </configuration>
</plugin>

<!-- SpotBugs -->
<plugin>
  <groupId>com.github.spotbugs</groupId>
  <artifactId>spotbugs-maven-plugin</artifactId>
</plugin>
```

```bash
# Additional tools
- Checkstyle: Code style violations
- jQAssistant: Architecture validation
- ArchUnit: Architecture unit tests
```

---

### Go

```bash
# Built-in tools
go vet ./...           # Suspicious constructs
go mod tidy            # Unused dependencies

# External
golangci-lint run      # Meta-linter
staticcheck ./...      # Advanced analysis
gocyclo -over 10 ./... # Complexity

# Refactoring
gorename              # Safe renaming
gomvpkg               # Move packages
```

---

### Rust

```bash
# Clippy (lints)
cargo clippy -- -D warnings

# Useful clippy lints for refactoring
#![warn(clippy::cognitive_complexity)]
#![warn(clippy::too_many_arguments)]
#![warn(clippy::too_many_lines)]

# cargo-udeps (unused dependencies)
cargo +nightly udeps

# cargo-machete (unused dependencies, faster)
cargo machete
```

---

## Language-Specific Tools

### JavaScript/TypeScript Codemods

```bash
# jscodeshift
npx jscodeshift -t transform.js src/

# Example: Convert var to const/let
npx jscodeshift -t @codemod/cli/src/transforms/no-vars.js src/

# Common codemods
- react-codemod: React upgrades
- next-codemod: Next.js migrations
- @types/ts-migrate: JavaScript to TypeScript
```

---

### Python Refactoring

```bash
# Bowler (AST-based refactoring)
pip install bowler

# Example: Rename function
from bowler import Query
Query('src/').select_function('old_name').rename('new_name').execute()

# 2to3 (Python 2 to 3)
2to3 -W -n src/

# pyupgrade (modernize Python)
pyupgrade --py310-plus *.py
```

---

### Java Codemods

```bash
# OpenRewrite (powerful recipe-based refactoring)
# Add to build.gradle
plugins {
  id 'org.openrewrite.rewrite' version '6.x'
}

rewrite {
  activeRecipe(
    'org.openrewrite.java.spring.boot3.UpgradeSpringBoot_3_0',
    'org.openrewrite.java.cleanup.CommonStaticAnalysis'
  )
}

# Run
./gradlew rewriteRun
```

---

### Go Codemods

```bash
# gofmt (fix formatting)
gofmt -s -w .

# go fix (update deprecated APIs)
go fix ./...

# eg (example-based refactoring)
# Create template, apply across codebase
```

---

## Automation & CI/CD

### Pre-Commit Hooks

```yaml
# .pre-commit-config.yaml
repos:
  - repo: local
    hooks:
      - id: complexity-check
        name: Check complexity
        entry: ./scripts/complexity-check.sh
        language: script
        types: [python]

      - id: no-large-functions
        name: No large functions
        entry: grep -n "function.*{" --include="*.js" | awk -F: 'NR>50'
        language: system
```

---

### GitHub Actions

```yaml
# .github/workflows/code-quality.yml
name: Code Quality

on: [push, pull_request]

jobs:
  analyze:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Check Complexity
        run: |
          npx escomplex src/ --format json | jq '.aggregate.cyclomatic'

      - name: Detect Duplicates
        run: npx jscpd src/ --threshold 5

      - name: Check for Code Smells
        run: npx eslint src/ --rule 'sonarjs/cognitive-complexity: error'

      - name: Block if Quality Degrades
        uses: codescene/codescene-ci-action@v1
        with:
          fail-on-declining-code-health: true
```

---

### Automated Refactoring PR

```yaml
# Create automated refactoring PRs
name: Auto Refactor

on:
  schedule:
    - cron: '0 0 * * 0'  # Weekly

jobs:
  refactor:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Apply Safe Refactorings
        run: |
          npx eslint --fix src/
          npx prettier --write src/

      - name: Create PR
        uses: peter-evans/create-pull-request@v5
        with:
          title: 'refactor: automated code quality improvements'
          branch: 'auto-refactor'
```

---

## Metrics & Visualization

### Complexity Metrics

| Metric | Tool | Threshold |
|--------|------|-----------|
| Cyclomatic Complexity | radon, escomplex, gocyclo | ≤ 10 per function |
| Cognitive Complexity | SonarQube, SonarLint | ≤ 15 per function |
| Lines per Function | eslint, pylint | ≤ 50 |
| Parameters per Function | all linters | ≤ 4 |
| Nesting Depth | all linters | ≤ 3 |

---

### Visualization Tools

**Code Visualization:**
- **CodeScene**: Hotspot maps, change coupling
- **Madge**: JavaScript dependency graphs
- **Arkit**: Swift/ObjC architecture diagrams
- **PlantUML**: Generate diagrams from code

**Dependency Visualization:**
```bash
# JavaScript
npx madge --image deps.svg src/

# Python
pip install pydeps
pydeps src/ --max-bacon=2

# Java
./gradlew dependencyReport
```

---

### Tracking Refactoring Progress

**Metrics to Track:**
```
BEFORE/AFTER COMPARISON
=======================
- Lines of code (should decrease or stay same)
- Number of files
- Average function length
- Cyclomatic complexity
- Test coverage
- Duplication percentage
- Number of code smells
- Build time
- Test execution time
```

**Dashboard Example:**
```bash
# Generate metrics report
echo "## Refactoring Metrics"
echo "| Metric | Before | After | Change |"
echo "|--------|--------|-------|--------|"
echo "| LOC | $(wc -l before/*.js) | $(wc -l after/*.js) | ... |"
echo "| Complexity | $(npx escomplex before/) | $(npx escomplex after/) | ... |"
```

---

## Quick Reference: Tool Selection

| Need | Tool |
|------|------|
| IDE refactoring | JetBrains, VS Code |
| AI suggestions | GitHub Copilot, Refact.ai |
| Code smells detection | SonarQube, ESLint |
| Complexity analysis | radon, escomplex, gocyclo |
| Duplicate detection | jscpd, PMD CPD |
| Dead code detection | vulture, ts-prune |
| Dependency analysis | madge, pydeps |
| Automated refactoring | jscodeshift, OpenRewrite |
| Tech debt tracking | CodeScene, CodeClimate |
| Architecture validation | ArchUnit, dependency-cruiser |
