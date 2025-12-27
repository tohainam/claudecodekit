# Software Supply Chain Security

## Table of Contents
1. [Understanding Supply Chain Risks](#understanding-supply-chain-risks)
2. [Software Bill of Materials (SBOM)](#software-bill-of-materials-sbom)
3. [Dependency Management](#dependency-management)
4. [CI/CD Pipeline Security](#cicd-pipeline-security)
5. [Container Image Security](#container-image-security)
6. [Code Signing & Verification](#code-signing--verification)
7. [Vulnerability Management](#vulnerability-management)
8. [Third-Party Risk Assessment](#third-party-risk-assessment)

---

## Understanding Supply Chain Risks

### Attack Vectors

```
┌─────────────────────────────────────────────────────────────────┐
│                  SUPPLY CHAIN ATTACK VECTORS                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. DEPENDENCY ATTACKS                                          │
│     • Typosquatting (lodsh vs lodash)                          │
│     • Dependency confusion (private vs public package)          │
│     • Compromised maintainer accounts                           │
│     • Malicious updates to legitimate packages                  │
│                                                                  │
│  2. BUILD SYSTEM ATTACKS                                        │
│     • Compromised CI/CD pipelines                               │
│     • Malicious build scripts                                   │
│     • Poisoned build tools                                      │
│     • Unauthorized access to build systems                      │
│                                                                  │
│  3. DISTRIBUTION ATTACKS                                        │
│     • Compromised package registries                            │
│     • Man-in-the-middle during downloads                        │
│     • Compromised update mechanisms                             │
│     • Unsigned or tampered packages                             │
│                                                                  │
│  4. DEVELOPMENT ENVIRONMENT ATTACKS                             │
│     • IDE plugin compromises                                    │
│     • Developer workstation malware                             │
│     • Stolen credentials/tokens                                 │
│     • Malicious code contributions                              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Notable Incidents

| Incident | Year | Attack Type | Impact |
|----------|------|-------------|--------|
| SolarWinds | 2020 | Build system | 18,000+ organizations |
| Codecov | 2021 | CI/CD | Thousands of repos |
| ua-parser-js | 2021 | Package compromise | Millions of downloads |
| Log4Shell | 2021 | Vulnerability | Critical infrastructure |
| npm packages | 2022 | Typosquatting | Various |
| PyPI attacks | 2023 | Dependency confusion | Multiple companies |

---

## Software Bill of Materials (SBOM)

### SBOM Formats

```json
// CycloneDX format (JSON)
{
  "bomFormat": "CycloneDX",
  "specVersion": "1.5",
  "version": 1,
  "metadata": {
    "timestamp": "2025-01-15T10:00:00Z",
    "component": {
      "type": "application",
      "name": "my-application",
      "version": "1.0.0"
    }
  },
  "components": [
    {
      "type": "library",
      "name": "express",
      "version": "4.18.2",
      "purl": "pkg:npm/express@4.18.2",
      "licenses": [{ "license": { "id": "MIT" } }],
      "hashes": [
        { "alg": "SHA-256", "content": "abc123..." }
      ]
    }
  ],
  "dependencies": [
    {
      "ref": "pkg:npm/express@4.18.2",
      "dependsOn": ["pkg:npm/body-parser@1.20.2"]
    }
  ]
}
```

```xml
<!-- SPDX format -->
<SpdxDocument>
  <SPDXID>SPDXRef-DOCUMENT</SPDXID>
  <name>my-application</name>
  <packages>
    <Package>
      <SPDXID>SPDXRef-Package-express</SPDXID>
      <name>express</name>
      <versionInfo>4.18.2</versionInfo>
      <downloadLocation>https://registry.npmjs.org/express/-/express-4.18.2.tgz</downloadLocation>
      <licenseConcluded>MIT</licenseConcluded>
    </Package>
  </packages>
</SpdxDocument>
```

### Generating SBOMs

```bash
# Using Syft (multi-language)
syft packages dir:. -o cyclonedx-json > sbom.json
syft packages docker:myimage:latest -o spdx-json > sbom-spdx.json

# Using Trivy
trivy sbom --format cyclonedx myimage:latest > sbom.json

# Using npm (Node.js)
npm sbom --sbom-format cyclonedx > sbom.json

# Using pip-audit (Python)
pip-audit --format=cyclonedx-json > sbom.json

# Using cargo (Rust)
cargo cyclonedx > sbom.json
```

### SBOM in CI/CD

```yaml
# GitHub Actions - Generate and store SBOM
name: Build and SBOM
on: [push]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Build application
        run: npm ci && npm run build

      - name: Generate SBOM
        uses: anchore/sbom-action@v0
        with:
          artifact-name: sbom.cyclonedx.json
          output-file: sbom.cyclonedx.json
          format: cyclonedx-json

      - name: Upload SBOM
        uses: actions/upload-artifact@v4
        with:
          name: sbom
          path: sbom.cyclonedx.json

      - name: Scan SBOM for vulnerabilities
        uses: anchore/scan-action@v3
        with:
          sbom: sbom.cyclonedx.json
          fail-build: true
          severity-cutoff: high
```

---

## Dependency Management

### Lock Files

```json
// package-lock.json - Always commit!
{
  "name": "my-app",
  "lockfileVersion": 3,
  "packages": {
    "node_modules/express": {
      "version": "4.18.2",
      "resolved": "https://registry.npmjs.org/express/-/express-4.18.2.tgz",
      "integrity": "sha512-5/PsL6iGPdfQ/lKM1UuielYgv3BUoJfz1aUwU9vHZ+J7gyvwdQXFEBIEIaxeGf0GIcreATNyBExtalisDbuMqQ=="
    }
  }
}
```

```python
# Pipfile.lock - Always commit!
# Use: pipenv lock
{
    "_meta": {
        "hash": {"sha256": "..."},
        "requires": {"python_version": "3.11"}
    },
    "default": {
        "requests": {
            "hashes": ["sha256:..."],
            "version": "==2.31.0"
        }
    }
}
```

### Dependency Confusion Prevention

```json
// .npmrc - Use scoped packages and private registry
@mycompany:registry=https://npm.mycompany.com/
//npm.mycompany.com/:_authToken=${NPM_TOKEN}
always-auth=true
```

```python
# pip.conf - Use private index
[global]
index-url = https://pypi.mycompany.com/simple/
extra-index-url = https://pypi.org/simple/
trusted-host = pypi.mycompany.com
```

```yaml
# Artifactory configuration for dependency firewall
# Block typosquatting and malicious packages
version: 1
include:
  - "@mycompany/**"  # Allow internal packages
  - "express"
  - "react"
  - "lodash"
  # Explicitly list allowed packages

exclude:
  - "*"  # Block everything else by default
```

### Version Pinning Strategies

```json
// package.json - Best practices
{
  "dependencies": {
    // GOOD: Exact versions for critical dependencies
    "express": "4.18.2",

    // OK: Tilde for patch updates only
    "lodash": "~4.17.21",

    // AVOID: Caret allows minor updates (can break)
    "axios": "^1.6.0",

    // NEVER: Range or latest
    "bad-package": "*"
  },
  "overrides": {
    // Force specific version of transitive dependency
    "vulnerable-package": "2.0.1"
  }
}
```

---

## CI/CD Pipeline Security

### Secure Pipeline Configuration

```yaml
# GitHub Actions - Secure workflow
name: Secure Build

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

# Limit permissions
permissions:
  contents: read
  packages: write

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0  # Full history for security scanning

      # Pin action versions with SHA
      - uses: actions/setup-node@v4
        # Better: Use full SHA
        # uses: actions/setup-node@60edb5dd545a775178f52524783378180af0d1f8

      # Use OIDC for cloud authentication (no long-lived secrets)
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::123456789:role/github-actions
          aws-region: us-east-1

      # Verify dependencies
      - name: Install dependencies
        run: npm ci --ignore-scripts  # Don't run install scripts

      - name: Audit dependencies
        run: npm audit --audit-level=high

      # Security scanning
      - name: Run SAST
        uses: github/codeql-action/analyze@v2

      - name: Scan for secrets
        uses: trufflesecurity/trufflehog@main
        with:
          path: ./
          base: ${{ github.event.repository.default_branch }}
```

### Secrets Management

```yaml
# BAD: Secrets in code or config
env:
  API_KEY: "sk-1234567890"  # NEVER!

# GOOD: Use secret management
env:
  API_KEY: ${{ secrets.API_KEY }}

# BETTER: Use OIDC / Workload Identity
- uses: google-github-actions/auth@v2
  with:
    workload_identity_provider: 'projects/123/locations/global/workloadIdentityPools/github-pool/providers/github-provider'
    service_account: 'github-actions@project.iam.gserviceaccount.com'
```

### Branch Protection

```yaml
# Required branch protection rules
# Settings > Branches > Branch protection rules

- name: main
  protection:
    required_pull_request_reviews:
      required_approving_review_count: 2
      dismiss_stale_reviews: true
      require_code_owner_reviews: true
    required_status_checks:
      strict: true
      contexts:
        - security-scan
        - tests
        - build
    enforce_admins: true
    required_signatures: true  # Signed commits only
    restrictions:
      users: []
      teams: ["release-team"]
```

---

## Container Image Security

### Image Scanning

```yaml
# GitHub Actions - Container scanning
- name: Build image
  run: docker build -t myapp:${{ github.sha }} .

- name: Scan image with Trivy
  uses: aquasecurity/trivy-action@master
  with:
    image-ref: myapp:${{ github.sha }}
    format: 'sarif'
    output: 'trivy-results.sarif'
    severity: 'CRITICAL,HIGH'
    exit-code: '1'  # Fail on vulnerabilities

- name: Scan with Grype
  uses: anchore/scan-action@v3
  with:
    image: myapp:${{ github.sha }}
    fail-build: true
    severity-cutoff: high
```

### Image Signing

```bash
# Sign with cosign
cosign sign --key cosign.key myregistry.com/myapp:v1.0.0

# Verify signature
cosign verify --key cosign.pub myregistry.com/myapp:v1.0.0

# Sign with keyless (Sigstore)
cosign sign myregistry.com/myapp:v1.0.0
# Uses OIDC identity from CI provider
```

```yaml
# Kubernetes - Enforce signed images
apiVersion: policy.sigstore.dev/v1alpha1
kind: ClusterImagePolicy
metadata:
  name: require-signatures
spec:
  images:
    - glob: "myregistry.com/**"
  authorities:
    - keyless:
        url: https://fulcio.sigstore.dev
        identities:
          - issuer: https://token.actions.githubusercontent.com
            subject: https://github.com/myorg/myrepo/.github/workflows/build.yml@refs/heads/main
```

---

## Code Signing & Verification

### Git Commit Signing

```bash
# Configure GPG signing
git config --global user.signingkey YOUR_KEY_ID
git config --global commit.gpgsign true

# Sign commits
git commit -S -m "Signed commit"

# Verify signatures
git verify-commit HEAD
git log --show-signature
```

### Package Signing

```bash
# npm - Package signing
npm publish --sign

# Python - Sign with GPG
gpg --armor --detach-sign dist/mypackage-1.0.0.tar.gz

# Verify
gpg --verify dist/mypackage-1.0.0.tar.gz.asc
```

### Binary Signing

```bash
# macOS code signing
codesign --sign "Developer ID Application: Company Name" --timestamp myapp.app

# Windows code signing
signtool sign /tr http://timestamp.digicert.com /td SHA256 /fd SHA256 /a myapp.exe

# Verify
codesign --verify --verbose myapp.app
signtool verify /pa myapp.exe
```

---

## Vulnerability Management

### Automated Scanning

```yaml
# Dependabot configuration
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "daily"
    open-pull-requests-limit: 10
    groups:
      minor-and-patch:
        patterns:
          - "*"
        update-types:
          - "minor"
          - "patch"

  - package-ecosystem: "docker"
    directory: "/"
    schedule:
      interval: "weekly"
```

```yaml
# Renovate configuration (more flexible)
# renovate.json
{
  "extends": ["config:base", "security:openssf-scorecard"],
  "vulnerabilityAlerts": {
    "enabled": true,
    "labels": ["security"]
  },
  "packageRules": [
    {
      "matchUpdateTypes": ["patch", "minor"],
      "automerge": true,
      "automergeType": "pr"
    },
    {
      "matchPackagePatterns": ["*"],
      "matchUpdateTypes": ["major"],
      "automerge": false
    }
  ]
}
```

### Vulnerability Response

```yaml
# VEX (Vulnerability Exploitability eXchange) document
{
  "@context": "https://openvex.dev/ns/v0.2.0",
  "@id": "https://example.com/vex/123",
  "author": "security@example.com",
  "timestamp": "2025-01-15T10:00:00Z",
  "statements": [
    {
      "vulnerability": {
        "@id": "CVE-2024-12345"
      },
      "products": [
        {"@id": "pkg:npm/mypackage@1.0.0"}
      ],
      "status": "not_affected",
      "justification": "vulnerable_code_not_in_execute_path",
      "impact_statement": "The vulnerable function is not used in our implementation"
    }
  ]
}
```

---

## Third-Party Risk Assessment

### Evaluation Checklist

```markdown
## Third-Party Library Assessment

### Maintainer Trust
- [ ] Verified maintainer identity
- [ ] Multiple maintainers (bus factor > 1)
- [ ] Responsive to issues/PRs
- [ ] No history of malicious behavior

### Code Quality
- [ ] Automated tests with good coverage
- [ ] CI/CD pipeline
- [ ] Static analysis / linting
- [ ] Regular releases

### Security Practices
- [ ] Security policy (SECURITY.md)
- [ ] Vulnerability disclosure process
- [ ] Timely security patches
- [ ] Signed releases

### Legal & Compliance
- [ ] Clear license (compatible with our project)
- [ ] No problematic dependencies
- [ ] Export control compliance

### Operational
- [ ] Documentation quality
- [ ] Community size
- [ ] Active development
- [ ] Deprecation policy
```

### OpenSSF Scorecard

```bash
# Check package security score
scorecard --repo=github.com/owner/repo

# Checks performed:
# - Binary-Artifacts: No binaries in source
# - Branch-Protection: Branch protection rules
# - CI-Tests: CI tests on commits
# - CII-Best-Practices: CII best practices badge
# - Code-Review: Code review required
# - Contributors: Multiple contributors
# - Dependency-Update-Tool: Dependabot/Renovate
# - Fuzzing: Fuzzing in CI
# - License: Valid license
# - Maintained: Recent commits
# - Pinned-Dependencies: Dependencies pinned
# - Packaging: Official packaging
# - SAST: Static analysis
# - Security-Policy: SECURITY.md exists
# - Signed-Releases: Releases are signed
# - Token-Permissions: Minimal token permissions
# - Vulnerabilities: No known vulnerabilities
```

### Risk Matrix

| Factor | Low Risk | Medium Risk | High Risk |
|--------|----------|-------------|-----------|
| Downloads | >1M/week | 100K-1M | <100K |
| Maintainers | >5 | 2-5 | 1 |
| Last Update | <1 month | 1-6 months | >6 months |
| Open Issues | <50 | 50-200 | >200 |
| Dependencies | <10 | 10-50 | >50 |
| License | MIT/Apache | LGPL | GPL/Unknown |
| Scorecard | >7 | 4-7 | <4 |
