# Documentation Best Practices

## Table of Contents
1. [Core Principles (ALCOA-C)](#core-principles-alcoa-c)
2. [Writing Guidelines](#writing-guidelines)
3. [Structure & Organization](#structure--organization)
4. [Audience-Aware Writing](#audience-aware-writing)
5. [Docs-as-Code Practices](#docs-as-code-practices)
6. [Maintenance & Governance](#maintenance--governance)
7. [Accessibility & Inclusivity](#accessibility--inclusivity)
8. [Common Anti-Patterns](#common-anti-patterns)

---

## Core Principles (ALCOA-C)

Industry-recognized documentation standards follow the ALCOA-C framework:

| Principle | Description | Application |
|-----------|-------------|-------------|
| **A**ttributable | Clear authorship and ownership | Include author, date, version |
| **L**egible | Easy to read and understand | Clear formatting, consistent style |
| **C**ontemporaneous | Written at time of work | Document during development |
| **O**riginal | First-hand, authentic source | Avoid copying outdated docs |
| **A**ccurate | Factually correct | Verify code examples work |
| **C**omplete | Contains all necessary info | Cover edge cases, errors |

---

## Writing Guidelines

### Voice and Tone

**Use active voice:**
```diff
- The configuration file is read by the application.
+ The application reads the configuration file.

- Errors are logged to the console.
+ The logger writes errors to the console.
```

**Use imperative mood for instructions:**
```diff
- You should run the tests before committing.
+ Run the tests before committing.

- The user needs to install dependencies.
+ Install dependencies.
```

**Be direct and concise:**
```diff
- In order to configure the database connection, you will need to...
+ To configure the database connection:

- It is important to note that the API requires authentication.
+ The API requires authentication.
```

### Clarity Checklist

- [ ] One idea per sentence
- [ ] One topic per paragraph
- [ ] Short sentences (< 25 words)
- [ ] Short paragraphs (< 5 sentences)
- [ ] Active voice
- [ ] Present tense
- [ ] Specific, concrete language
- [ ] No jargon without definition

### Technical Accuracy

**Always test code examples:**
```bash
# Bad: Untested example that may not work
npm install package --save

# Good: Tested with version number
npm install package@2.1.0
```

**Include version information:**
```markdown
# Requirements
- Node.js 18.x or higher
- PostgreSQL 15+
- Redis 7.0+

# This guide was tested with:
- Node.js 20.10.0
- PostgreSQL 16.1
- Redis 7.2.3
```

**Show complete, runnable examples:**
```typescript
// Bad: Incomplete snippet
const user = await createUser(data);

// Good: Complete, runnable example
import { createUser } from '@/services/user';

const user = await createUser({
  email: 'user@example.com',
  name: 'John Doe',
});

console.log(user.id); // Output: "usr_abc123"
```

---

## Structure & Organization

### Document Hierarchy

```markdown
# Title (H1) - One per document
Short introduction explaining what this doc covers.

## Major Section (H2)
Overview of the section topic.

### Subsection (H3)
Detailed content.

#### Sub-subsection (H4) - Use sparingly
Very specific details.
```

### Information Architecture

**Progressive disclosure pattern:**
1. Start with "Quick Start" or "TL;DR"
2. Follow with detailed explanation
3. End with advanced topics and edge cases

**Example structure:**
```markdown
# Feature Documentation

## Quick Start
5-minute getting started guide.

## How It Works
Conceptual explanation.

## Configuration
Detailed configuration options.

## Examples
Common use cases.

## Troubleshooting
Common issues and solutions.

## API Reference
Complete technical reference.
```

### Navigation Aids

**Add table of contents for docs > 3 sections:**
```markdown
## Table of Contents
1. [Installation](#installation)
2. [Configuration](#configuration)
3. [Usage](#usage)
4. [API Reference](#api-reference)
```

**Use anchor links for cross-references:**
```markdown
For authentication setup, see [Authentication Guide](./auth.md#jwt-setup).
```

**Provide "See Also" sections:**
```markdown
## See Also
- [Related Feature](./related.md)
- [Troubleshooting](./troubleshooting.md)
- [API Reference](./api.md)
```

---

## Audience-Aware Writing

### Identify Your Audience

| Audience | Focus On | Avoid |
|----------|----------|-------|
| Beginners | Step-by-step, context, why | Jargon, assumed knowledge |
| Intermediate | Practical examples, patterns | Over-explanation of basics |
| Advanced | Edge cases, internals, optimization | Excessive hand-holding |
| Decision-makers | Benefits, comparisons, trade-offs | Implementation details |

### Tailor Content by Audience

**For beginners:**
```markdown
## What is an API?
An API (Application Programming Interface) is a way for programs to
communicate with each other. Think of it like a waiter in a restaurant:
you give your order (request), and the waiter brings back your food (response).

## Your First API Call
Let's make a simple request to get user information:
```

**For experienced developers:**
```markdown
## API Authentication
The API uses JWT Bearer tokens. Include the token in the Authorization header:

\`\`\`bash
curl -H "Authorization: Bearer $TOKEN" https://api.example.com/v2/users
\`\`\`

See [Token Refresh](#token-refresh) for handling expiration.
```

### Provide Multiple Entry Points

```markdown
# Getting Started

Choose your path:

**New to programming?**
→ Start with our [Tutorial for Beginners](./tutorial-beginner.md)

**Experienced with similar tools?**
→ Jump to [Quick Start](./quickstart.md)

**Migrating from v1?**
→ See our [Migration Guide](./migration.md)
```

---

## Docs-as-Code Practices

### Version Control

**Store docs with code:**
```
project/
├── src/
├── docs/           # Documentation
│   ├── api/
│   ├── guides/
│   └── README.md
├── README.md       # Project README
└── CHANGELOG.md
```

**Commit message conventions:**
```
docs: add authentication guide
docs: fix typo in installation steps
docs: update API examples for v2.0
```

### CI/CD Integration

**Automated documentation checks:**
```yaml
# .github/workflows/docs.yml
name: Documentation

on: [push, pull_request]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Lint Markdown
        uses: DavidAnson/markdownlint-cli2-action@v14

      - name: Check links
        uses: lycheeverse/lychee-action@v1
        with:
          args: --verbose --no-progress './docs/**/*.md'

      - name: Spell check
        uses: streetsidesoftware/cspell-action@v5
```

**Auto-generate from code:**
```yaml
- name: Generate API docs
  run: npm run docs:generate

- name: Check docs are up-to-date
  run: |
    git diff --exit-code docs/api/
    if [ $? -ne 0 ]; then
      echo "API docs are out of date. Run 'npm run docs:generate'"
      exit 1
    fi
```

### Review Process

**Documentation PR checklist:**
- [ ] Technical accuracy verified
- [ ] Code examples tested
- [ ] Links validated
- [ ] Spelling/grammar checked
- [ ] Follows style guide
- [ ] Mobile-friendly formatting
- [ ] Accessibility considered

---

## Maintenance & Governance

### Documentation Lifecycle

| Stage | Activity | Frequency |
|-------|----------|-----------|
| Create | Write initial docs | With feature |
| Review | Technical accuracy check | Quarterly |
| Update | Sync with code changes | With each release |
| Deprecate | Mark outdated content | As needed |
| Archive | Remove obsolete docs | Annually |

### Ownership Model

**Assign documentation owners:**
```markdown
<!-- docs/api/users.md -->
---
owner: @user-team
reviewers: [@tech-lead, @senior-dev]
last-reviewed: 2025-01-15
---
```

### Staleness Detection

**Add freshness indicators:**
```markdown
> ⚠️ **Last updated:** January 2025 (v2.3.0)
>
> If you're using a newer version, some details may have changed.
```

**Automated staleness checks:**
```yaml
# Check for docs not updated in 6 months
- name: Check doc freshness
  run: |
    stale_docs=$(find docs -name "*.md" -mtime +180)
    if [ -n "$stale_docs" ]; then
      echo "Stale documentation found:"
      echo "$stale_docs"
    fi
```

### Deprecation Process

```markdown
> ⚠️ **Deprecated**
>
> This API is deprecated and will be removed in v3.0.
> Use [New API](./new-api.md) instead.
>
> **Migration:** See [Migration Guide](./migration.md)
```

---

## Accessibility & Inclusivity

### Accessible Documentation

**Images and diagrams:**
```markdown
<!-- Bad -->
![diagram](arch.png)

<!-- Good -->
![System architecture showing three layers: presentation, business logic,
and data access. The presentation layer connects to business logic via REST API,
and business logic connects to data access via repository pattern.](arch.png)
```

**Code blocks with context:**
```markdown
<!-- Bad -->
\`\`\`
npm install
\`\`\`

<!-- Good -->
Install dependencies using npm:
\`\`\`bash
npm install
\`\`\`
This installs all packages listed in package.json.
```

**Color-independent information:**
```markdown
<!-- Bad: Relies on color -->
The green button saves, the red button deletes.

<!-- Good: Uses labels -->
Click **Save** to save changes, or **Delete** to remove the item.
```

### Inclusive Language

**Avoid exclusionary terms:**
```diff
- Simply add the configuration.
+ Add the configuration.

- Obviously, you need to restart the server.
+ Restart the server.

- As everyone knows, this is the standard approach.
+ This is the standard approach.
```

**Use neutral language:**
```diff
- The user can set his preferences.
+ Users can set their preferences.

- A developer should test his code.
+ Developers should test their code.
```

**Avoid ableist language:**
```diff
- A blind API call
+ An unauthenticated API call

- Sanity check
+ Validation check

- Crippled functionality
+ Limited functionality
```

### Global Audience

**Consider internationalization:**
- Use simple, clear language
- Avoid idioms and colloquialisms
- Spell out abbreviations on first use
- Use standard date formats (ISO 8601: 2025-01-15)
- Include timezone for time-sensitive info

```markdown
<!-- Bad -->
The meeting is at 3pm next Tuesday.

<!-- Good -->
The meeting is at 2025-01-21 15:00 UTC.
```

---

## Common Anti-Patterns

### Anti-Pattern: Documentation Silos

**Problem:** Docs scattered across wikis, READMEs, and external tools.

**Solution:** Single source of truth, linked from code.
```markdown
<!-- In code -->
// For detailed configuration, see docs/config.md

<!-- Central docs -->
docs/
├── README.md (links to all docs)
├── getting-started.md
├── api/
└── guides/
```

### Anti-Pattern: Copy-Paste Documentation

**Problem:** Same information repeated across multiple files.

**Solution:** Single source, reference elsewhere.
```markdown
<!-- authentication.md (source of truth) -->
# Authentication
[Complete authentication docs]

<!-- api.md (references source) -->
## Authentication
For authentication setup, see [Authentication Guide](./authentication.md).
```

### Anti-Pattern: Outdated Examples

**Problem:** Code examples that no longer work with current version.

**Solution:** Automated testing of documentation examples.
```typescript
// docs/examples/create-user.test.ts
import { createUser } from '@/services/user';

test('documentation example: create user', async () => {
  // This is the exact code from docs
  const user = await createUser({
    email: 'user@example.com',
    name: 'John Doe',
  });

  expect(user.id).toBeDefined();
});
```

### Anti-Pattern: Missing Context

**Problem:** Jumping into details without explaining prerequisites or purpose.

**Solution:** Start with "why" and prerequisites.
```markdown
<!-- Bad -->
## Configuration
Set `DATABASE_URL` to your connection string.

<!-- Good -->
## Configuration

Before starting the application, you need to configure the database connection.

### Prerequisites
- PostgreSQL 15+ installed and running
- Database created (`createdb myapp`)
- User with read/write permissions

### Database URL
Set the `DATABASE_URL` environment variable:
\`\`\`bash
export DATABASE_URL="postgresql://user:pass@localhost:5432/myapp"
\`\`\`
```

### Anti-Pattern: Wall of Text

**Problem:** Long paragraphs without visual breaks.

**Solution:** Use formatting to improve scannability.
```markdown
<!-- Bad -->
To configure the application you need to set several environment variables.
First set the DATABASE_URL to point to your PostgreSQL instance. Then set
the REDIS_URL for caching. You also need to configure JWT_SECRET for
authentication. Finally set LOG_LEVEL to control logging verbosity.

<!-- Good -->
## Required Configuration

Set these environment variables before starting:

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `REDIS_URL` | Yes | Redis connection string |
| `JWT_SECRET` | Yes | Secret for signing JWTs (min 32 chars) |
| `LOG_LEVEL` | No | Logging level (default: `info`) |
```

### Anti-Pattern: Assuming Knowledge

**Problem:** Using jargon or concepts without explanation.

**Solution:** Define terms or link to explanations.
```markdown
<!-- Bad -->
The API uses HATEOAS for discoverability.

<!-- Good -->
The API uses [HATEOAS](https://en.wikipedia.org/wiki/HATEOAS)
(Hypermedia as the Engine of Application State) for discoverability.
Each response includes links to related resources and available actions.

Example response:
\`\`\`json
{
  "id": "123",
  "name": "Product",
  "_links": {
    "self": { "href": "/products/123" },
    "update": { "href": "/products/123", "method": "PUT" },
    "delete": { "href": "/products/123", "method": "DELETE" }
  }
}
\`\`\`
```

---

## Quick Reference Checklist

Before publishing documentation:

### Content
- [ ] Purpose is clear from the first paragraph
- [ ] Prerequisites are listed
- [ ] All code examples are tested
- [ ] Edge cases and errors are documented
- [ ] Related docs are linked

### Structure
- [ ] Logical heading hierarchy (H1 → H2 → H3)
- [ ] Table of contents for long docs
- [ ] Short paragraphs and sentences
- [ ] Visual aids (diagrams, tables, code blocks)

### Style
- [ ] Active voice, present tense
- [ ] Imperative mood for instructions
- [ ] Consistent terminology
- [ ] No jargon without definition

### Accessibility
- [ ] Alt text for images
- [ ] Color-independent information
- [ ] Screen reader-friendly
- [ ] Inclusive language

### Maintenance
- [ ] Version/date indicated
- [ ] Owner assigned
- [ ] Review schedule set
- [ ] Update process documented
