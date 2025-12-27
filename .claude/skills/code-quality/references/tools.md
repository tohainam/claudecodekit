# Code Quality Tools

Linting, formatting, and static analysis tools for maintaining code quality.

## Tool Categories

```
┌─────────────────────────────────────────────────────────────────┐
│                      CODE QUALITY TOOLS                          │
├─────────────────┬─────────────────┬─────────────────────────────┤
│    FORMATTERS   │     LINTERS     │    STATIC ANALYSIS          │
│                 │                 │                             │
│ Auto-fix style  │ Check for       │ Deep analysis for           │
│ Consistent look │ errors, smells  │ bugs, security, complexity  │
│                 │ Configurable    │                             │
│ Prettier        │ ESLint          │ SonarQube                   │
│ Black           │ Pylint          │ Snyk                        │
│ gofmt           │ RuboCop         │ Semgrep                     │
└─────────────────┴─────────────────┴─────────────────────────────┘
```

## By Language

### JavaScript/TypeScript

| Tool | Purpose | Config File |
|------|---------|-------------|
| **ESLint** | Linting, code quality | `.eslintrc.json` |
| **Prettier** | Code formatting | `.prettierrc` |
| **TypeScript** | Type checking | `tsconfig.json` |

```json
// .eslintrc.json (2025 recommended)
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier"
  ],
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint"],
  "rules": {
    "no-unused-vars": "error",
    "no-console": "warn",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "@typescript-eslint/no-explicit-any": "error"
  }
}
```

```json
// .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

```json
// package.json scripts
{
  "scripts": {
    "lint": "eslint . --ext .ts,.tsx",
    "lint:fix": "eslint . --ext .ts,.tsx --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx,json,css}\"",
    "format:check": "prettier --check \"src/**/*.{ts,tsx,json,css}\"",
    "typecheck": "tsc --noEmit"
  }
}
```

### Python

| Tool | Purpose | Config File |
|------|---------|-------------|
| **Ruff** | Fast linting & formatting | `pyproject.toml` |
| **Black** | Code formatting | `pyproject.toml` |
| **mypy** | Type checking | `mypy.ini` |
| **Pylint** | Comprehensive linting | `.pylintrc` |

```toml
# pyproject.toml (2025 recommended with Ruff)
[tool.ruff]
line-length = 100
target-version = "py311"

[tool.ruff.lint]
select = [
    "E",    # pycodestyle errors
    "W",    # pycodestyle warnings
    "F",    # Pyflakes
    "I",    # isort
    "B",    # flake8-bugbear
    "C4",   # flake8-comprehensions
    "UP",   # pyupgrade
    "S",    # flake8-bandit (security)
]
ignore = ["E501"]  # line too long (handled by formatter)

[tool.ruff.format]
quote-style = "double"
indent-style = "space"

[tool.mypy]
python_version = "3.11"
strict = true
warn_return_any = true
warn_unused_ignores = true
```

```bash
# Commands
ruff check .              # Lint
ruff check . --fix        # Lint and fix
ruff format .             # Format
mypy src/                 # Type check
```

### Go

| Tool | Purpose | Config File |
|------|---------|-------------|
| **gofmt** | Standard formatting | Built-in |
| **golint** | Style checks | - |
| **golangci-lint** | Meta linter | `.golangci.yml` |
| **staticcheck** | Advanced analysis | - |

```yaml
# .golangci.yml
linters:
  enable:
    - errcheck
    - gosimple
    - govet
    - ineffassign
    - staticcheck
    - unused
    - gosec          # Security
    - prealloc       # Performance
    - misspell       # Typos

linters-settings:
  errcheck:
    check-type-assertions: true
  govet:
    check-shadowing: true

issues:
  max-issues-per-linter: 0
  max-same-issues: 0
```

```bash
# Commands
go fmt ./...              # Format
go vet ./...              # Vet
golangci-lint run         # Full linting
```

### Java/Kotlin

| Tool | Purpose | Config File |
|------|---------|-------------|
| **Checkstyle** | Style checking | `checkstyle.xml` |
| **SpotBugs** | Bug detection | - |
| **PMD** | Code analysis | `pmd-ruleset.xml` |
| **ktlint** | Kotlin formatting | - |

```xml
<!-- pom.xml -->
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-checkstyle-plugin</artifactId>
    <version>3.3.0</version>
    <configuration>
        <configLocation>google_checks.xml</configLocation>
        <failsOnError>true</failsOnError>
    </configuration>
</plugin>
```

### Ruby

| Tool | Purpose | Config File |
|------|---------|-------------|
| **RuboCop** | Linting & formatting | `.rubocop.yml` |
| **Brakeman** | Security analysis | - |
| **Reek** | Code smell detection | `.reek.yml` |

```yaml
# .rubocop.yml
require:
  - rubocop-rails
  - rubocop-performance

AllCops:
  NewCops: enable
  TargetRubyVersion: 3.2

Style/StringLiterals:
  EnforcedStyle: double_quotes

Metrics/MethodLength:
  Max: 20
```

## Static Analysis & Security

### Multi-Language Tools

| Tool | Purpose | Languages |
|------|---------|-----------|
| **SonarQube** | Comprehensive analysis | 30+ languages |
| **Snyk** | Dependency vulnerabilities | All major |
| **Semgrep** | Custom pattern matching | 30+ languages |
| **CodeQL** | Security analysis | C/C++, C#, Go, Java, JS, Python, Ruby |

### Security-Focused

```bash
# Dependency scanning
npm audit                 # Node.js
pip-audit                 # Python
bundle audit              # Ruby
snyk test                 # Multi-language

# SAST (Static Application Security Testing)
semgrep --config=auto .   # Pattern-based analysis
trivy fs .                # Filesystem vulnerabilities
```

### SonarQube Quality Gates
```
Default Quality Gate Conditions:
├── Coverage < 80% on new code → FAIL
├── Duplicated Lines > 3% on new code → FAIL
├── Maintainability Rating worse than A → FAIL
├── Reliability Rating worse than A → FAIL
├── Security Rating worse than A → FAIL
└── Security Hotspots reviewed → REQUIRED
```

## CI/CD Integration

### GitHub Actions Example
```yaml
# .github/workflows/quality.yml
name: Code Quality

on: [push, pull_request]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Type check
        run: npm run typecheck

      - name: Format check
        run: npm run format:check

  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Run Snyk
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}

      - name: Run Semgrep
        uses: returntocorp/semgrep-action@v1
```

### Pre-commit Hooks
```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.5.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-yaml
      - id: check-json
      - id: check-added-large-files

  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.1.9
    hooks:
      - id: ruff
        args: [--fix]
      - id: ruff-format

  - repo: https://github.com/pre-commit/mirrors-eslint
    rev: v8.56.0
    hooks:
      - id: eslint
        files: \.[jt]sx?$
        additional_dependencies:
          - eslint@8.56.0
          - '@typescript-eslint/parser'
          - '@typescript-eslint/eslint-plugin'
```

```bash
# Install pre-commit
pip install pre-commit
pre-commit install
pre-commit run --all-files  # Test on all files
```

## Editor Integration

### VS Code Settings
```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[python]": {
    "editor.defaultFormatter": "charliermarsh.ruff"
  },
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit",
    "source.organizeImports": "explicit"
  },
  "eslint.validate": ["javascript", "typescript", "javascriptreact", "typescriptreact"],
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

### Recommended Extensions
```json
// .vscode/extensions.json
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "charliermarsh.ruff",
    "ms-python.python",
    "bradlc.vscode-tailwindcss",
    "streetsidesoftware.code-spell-checker",
    "sonarsource.sonarlint-vscode"
  ]
}
```

## Tool Selection Guide

```
┌─────────────────────────────────────────────────────────────────┐
│                    CHOOSE YOUR TOOLS                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  New Project?                                                    │
│  └── Use modern, fast tools (Ruff, ESLint flat config)          │
│                                                                  │
│  Legacy Project?                                                 │
│  └── Introduce tools incrementally, fix as you touch            │
│                                                                  │
│  Team Project?                                                   │
│  └── Standardize configs, use pre-commit hooks                  │
│                                                                  │
│  Security Critical?                                              │
│  └── Add SAST tools (Snyk, Semgrep, CodeQL)                     │
│                                                                  │
│  Microservices?                                                  │
│  └── Central SonarQube, language-specific linters               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Tools Checklist

```
ESSENTIAL (Every Project)
□ Formatter configured (Prettier/Black/gofmt)?
□ Linter configured (ESLint/Ruff/golangci-lint)?
□ Type checking enabled (TypeScript/mypy)?
□ Pre-commit hooks installed?

RECOMMENDED (Team Projects)
□ CI/CD quality checks?
□ Dependency vulnerability scanning?
□ Code coverage tracking?
□ Editor settings shared?

ADVANCED (Enterprise/Security)
□ SAST tools integrated?
□ SonarQube or equivalent?
□ Custom rules for domain?
□ Quality gates enforced?
```
