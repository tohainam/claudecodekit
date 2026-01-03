# Dependency Security

## Software Bill of Materials (SBOM)

### What Is SBOM?

A comprehensive inventory of all software components:

```json
{
  "bomFormat": "CycloneDX",
  "specVersion": "1.5",
  "components": [
    {
      "type": "library",
      "name": "express",
      "version": "4.18.2",
      "purl": "pkg:npm/express@4.18.2",
      "licenses": [{ "id": "MIT" }],
      "hashes": [{ "alg": "SHA-256", "content": "abc123..." }]
    }
  ]
}
```

### SBOM Requirements (2025)

- **US Federal**: Executive Order 14028 mandates SBOMs for government software
- **EU**: Cyber Resilience Act requires SBOMs for products with digital elements
- **Industry**: Increasingly required by enterprise customers

### Generating SBOMs

```bash
# JavaScript/TypeScript (CycloneDX)
npm install -g @cyclonedx/cyclonedx-npm
cyclonedx-npm --output-file sbom.json

# Python
pip install cyclonedx-bom
cyclonedx-py --format json -o sbom.json

# Go
go install github.com/CycloneDX/cyclonedx-gomod/cmd/cyclonedx-gomod@latest
cyclonedx-gomod mod -json > sbom.json

# Container images
syft myimage:latest -o cyclonedx-json > sbom.json
```

## SLSA Framework

### Supply-chain Levels for Software Artifacts

| Level      | Requirements                       |
| ---------- | ---------------------------------- |
| **SLSA 1** | Documented build process           |
| **SLSA 2** | Version control + hosted build     |
| **SLSA 3** | Source verified + hardened build   |
| **SLSA 4** | Two-person review + hermetic build |

### SLSA Compliance

```yaml
# GitHub Actions with SLSA attestations
name: Build with SLSA
on: push

jobs:
  build:
    runs-on: ubuntu-latest
    permissions:
      id-token: write
      contents: read
      attestations: write

    steps:
      - uses: actions/checkout@v4

      - name: Build
        run: npm run build

      - name: Generate SLSA attestation
        uses: actions/attest-build-provenance@v1
        with:
          subject-path: "dist/**"
```

## Software Composition Analysis (SCA)

### Tools Comparison

| Tool                | Languages  | Features               | License       |
| ------------------- | ---------- | ---------------------- | ------------- |
| **Snyk**            | All major  | SCA, SAST, containers  | Commercial    |
| **Dependabot**      | All major  | Auto-updates, alerts   | Free (GitHub) |
| **Renovate**        | All major  | Auto-updates, flexible | Free          |
| **npm audit**       | JS/TS      | Built-in, basic        | Free          |
| **Trivy**           | Containers | Comprehensive          | Free          |
| **OWASP Dep-Check** | Java, .NET | CVE scanning           | Free          |

### Running Audits

```bash
# JavaScript
npm audit
npm audit --production  # Only production deps
npm audit fix           # Auto-fix where possible

# Python
pip-audit
safety check

# Go
govulncheck ./...

# Rust
cargo audit

# Container
trivy image myapp:latest
grype myapp:latest
```

## Vulnerability Management

### Severity Ratings

| Severity | CVSS Score | Action                    |
| -------- | ---------- | ------------------------- |
| Critical | 9.0 - 10.0 | Patch immediately (hours) |
| High     | 7.0 - 8.9  | Patch within days         |
| Medium   | 4.0 - 6.9  | Patch within weeks        |
| Low      | 0.1 - 3.9  | Patch in next release     |

### Remediation Workflow

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Detection     │────►│   Triage        │────►│   Remediation   │
│   (SCA scan)    │     │   (Severity,    │     │   (Update,      │
│                 │     │    exploitable?)│     │    patch, WAF)  │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                         │
┌─────────────────┐     ┌─────────────────┐              │
│   Monitoring    │◄────│   Verification  │◄─────────────┘
│   (Retest)      │     │   (Deploy, test)│
└─────────────────┘     └─────────────────┘
```

### When You Can't Update

```typescript
// 1. Check if vulnerable code path is used
// 2. Apply workaround if available
// 3. Use WAF/runtime protection
// 4. Document and track

// package.json overrides (npm 8.3+)
{
  "overrides": {
    "vulnerable-package": "^2.0.0"
  }
}

// yarn resolutions
{
  "resolutions": {
    "vulnerable-package": "^2.0.0"
  }
}
```

## Automated Updates

### Dependabot Configuration

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: npm
    directory: /
    schedule:
      interval: weekly
    groups:
      production:
        dependency-type: production
      development:
        dependency-type: development
    ignore:
      - dependency-name: "*"
        update-types: ["version-update:semver-major"]
    open-pull-requests-limit: 10
    labels:
      - dependencies
      - automated
```

### Renovate Configuration

```json
// renovate.json
{
  "extends": ["config:recommended"],
  "schedule": ["before 3am on Monday"],
  "prConcurrentLimit": 5,
  "packageRules": [
    {
      "matchUpdateTypes": ["minor", "patch"],
      "matchCurrentVersion": "!/^0/",
      "automerge": true
    },
    {
      "matchPackagePatterns": ["eslint"],
      "groupName": "linting"
    },
    {
      "matchDepTypes": ["devDependencies"],
      "automerge": true
    }
  ],
  "vulnerabilityAlerts": {
    "enabled": true,
    "labels": ["security"]
  }
}
```

## Lock File Security

### Why Lock Files Matter

```bash
# Without lock file:
npm install  # Gets latest versions (unpredictable)

# With lock file:
npm ci       # Exact versions from lock (reproducible)
```

### Lock File Best Practices

```bash
# Always commit lock files
git add package-lock.json
git add yarn.lock
git add pnpm-lock.yaml

# Verify lock file integrity
npm ci --ignore-scripts  # First pass without scripts
npm ci                   # Then with scripts

# Detect lock file manipulation
# .github/workflows/security.yml
- name: Check lock file
  run: |
    npm ci --ignore-scripts
    git diff --exit-code package-lock.json
```

## CI/CD Security Checks

### Pipeline Example

```yaml
# .github/workflows/security.yml
name: Security Checks

on:
  push:
    branches: [main]
  pull_request:
  schedule:
    - cron: "0 0 * * *" # Daily

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install dependencies
        run: npm ci

      - name: Run npm audit
        run: npm audit --audit-level=high

      - name: Run Snyk
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}

      - name: Generate SBOM
        run: npx @cyclonedx/cyclonedx-npm --output-file sbom.json

      - name: Upload SBOM
        uses: actions/upload-artifact@v4
        with:
          name: sbom
          path: sbom.json

  container-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Build image
        run: docker build -t myapp:${{ github.sha }} .

      - name: Scan with Trivy
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: myapp:${{ github.sha }}
          severity: CRITICAL,HIGH
          exit-code: 1
```

## Security Checklist

### Development

- [ ] Run `npm audit` before committing
- [ ] Keep dependencies up to date
- [ ] Review new dependency licenses
- [ ] Minimize dependency count
- [ ] Prefer well-maintained packages

### CI/CD

- [ ] Block builds with critical vulnerabilities
- [ ] Generate SBOM for releases
- [ ] Scan container images
- [ ] Verify lock file integrity
- [ ] Sign artifacts

### Monitoring

- [ ] Enable GitHub Security Advisories
- [ ] Subscribe to security mailing lists
- [ ] Monitor for new CVEs
- [ ] Have update/patch process
- [ ] Document vulnerability exceptions
