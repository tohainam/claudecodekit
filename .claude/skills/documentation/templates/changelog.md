# Changelog Template

## Keep a Changelog Format

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- New features that have been added

### Changed

- Changes in existing functionality

### Deprecated

- Features that will be removed in upcoming releases

### Removed

- Features that have been removed

### Fixed

- Bug fixes

### Security

- Security vulnerability fixes

## [1.1.0] - 2025-01-15

### Added

- User authentication with OAuth2 support
- Export functionality for reports
- Dark mode theme option

### Changed

- Improved performance of dashboard loading
- Updated dependencies to latest versions

### Fixed

- Fixed timezone handling in date picker
- Resolved memory leak in WebSocket connection

## [1.0.1] - 2025-01-08

### Fixed

- Fixed critical bug in payment processing
- Corrected validation for email addresses

### Security

- Updated `axios` to address CVE-2025-XXXX

## [1.0.0] - 2025-01-01

### Added

- Initial release
- User registration and login
- Dashboard with analytics
- API for data access

[Unreleased]: https://github.com/org/repo/compare/v1.1.0...HEAD
[1.1.0]: https://github.com/org/repo/compare/v1.0.1...v1.1.0
[1.0.1]: https://github.com/org/repo/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/org/repo/releases/tag/v1.0.0
```

---

## Change Categories

| Category       | Description                  | Example                         |
| -------------- | ---------------------------- | ------------------------------- |
| **Added**      | New features                 | "Added user profile page"       |
| **Changed**    | Changes to existing features | "Changed password requirements" |
| **Deprecated** | Features soon to be removed  | "Deprecated v1 API endpoints"   |
| **Removed**    | Features removed             | "Removed legacy export format"  |
| **Fixed**      | Bug fixes                    | "Fixed login redirect issue"    |
| **Security**   | Security fixes               | "Fixed XSS vulnerability"       |

---

## Writing Good Changelog Entries

### Do

```markdown
### Added

- Add user search with filters for name, email, and role
- Add bulk export for reports (CSV, JSON, PDF formats)

### Fixed

- Fix race condition when multiple users update same record
- Fix incorrect total calculation in invoice summary
```

### Don't

```markdown
### Added

- New feature # Too vague
- Fixed stuff # Wrong category, too vague

### Changed

- Updated code # Not meaningful
- Refactored UserService # Internal change, not user-facing
```

### Entry Guidelines

1. **Start with a verb**: Add, Fix, Remove, Change, Update
2. **Be specific**: What exactly changed?
3. **User-focused**: How does it affect users?
4. **Link issues**: Reference related issues/PRs
5. **One change per line**: Easy to scan

---

## Automated Changelog Generation

### From Conventional Commits

```bash
# Using conventional-changelog-cli
npx conventional-changelog -p angular -i CHANGELOG.md -s

# Using standard-version
npx standard-version

# Using release-please
# (Configured via GitHub Action)
```

### GitHub Release Notes

```bash
# Generate release notes via GitHub CLI
gh release create v1.2.0 --generate-notes

# Create with custom notes
gh release create v1.2.0 --notes-file release-notes.md
```

### Commit to Changelog Mapping

| Commit Type        | Changelog Category |
| ------------------ | ------------------ |
| `feat:`            | Added              |
| `fix:`             | Fixed              |
| `perf:`            | Changed            |
| `refactor:`        | (Usually omit)     |
| `docs:`            | (Usually omit)     |
| `BREAKING CHANGE:` | Changed (major)    |
| Security fixes     | Security           |

---

## Release Process with Changelog

### Manual Process

```bash
# 1. Update CHANGELOG.md with new version
# 2. Update version in package.json
npm version minor --no-git-tag-version

# 3. Commit changes
git add CHANGELOG.md package.json
git commit -m "chore: release v1.2.0"

# 4. Tag release
git tag -a v1.2.0 -m "Release v1.2.0"

# 5. Push
git push origin main --tags
```

### Automated with GitHub Actions

```yaml
# .github/workflows/release.yml
name: Release

on:
  push:
    tags:
      - "v*"

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Extract changelog
        id: changelog
        run: |
          VERSION=${GITHUB_REF#refs/tags/v}
          CHANGELOG=$(sed -n "/## \[$VERSION\]/,/## \[/p" CHANGELOG.md | sed '$d')
          echo "changelog<<EOF" >> $GITHUB_OUTPUT
          echo "$CHANGELOG" >> $GITHUB_OUTPUT
          echo "EOF" >> $GITHUB_OUTPUT

      - name: Create GitHub Release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: ${{ github.ref }}
          release_name: Release ${{ github.ref }}
          body: ${{ steps.changelog.outputs.changelog }}
```

---

## Changelog Best Practices

### Versioning

```
MAJOR.MINOR.PATCH

1.0.0 → 1.0.1  # Patch: Bug fixes
1.0.1 → 1.1.0  # Minor: New features (backward compatible)
1.1.0 → 2.0.0  # Major: Breaking changes
```

### Pre-release Versions

```
2.0.0-alpha.1
2.0.0-beta.1
2.0.0-rc.1
2.0.0
```

### Checklist

- [ ] Version number follows semver
- [ ] Date in ISO format (YYYY-MM-DD)
- [ ] All user-facing changes documented
- [ ] Security fixes highlighted
- [ ] Breaking changes clearly marked
- [ ] Links to compare versions
- [ ] Unreleased section for ongoing work
