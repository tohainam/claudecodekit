# Web Sync Plan

**Generated**: 2026-01-04
**Task**: Cập nhật web/ theo các thay đổi của CCK

## Summary

Cập nhật `web/index.html` để sync với CCK hiện tại:
- Thêm 2 commands mới: `/onboarding`, `/view-docs`
- Thêm 1 skill mới: `report`
- Update skills count: 8 → 10

## Changes Required

### 1. Update Sidebar Navigation

**File**: `web/index.html`

#### 1.1 Commands Section (lines 78-81)
```html
<!-- Thêm sau /run -->
<li><a href="#cmd-onboarding" class="nav-item" data-section="cmd-onboarding">/onboarding</a></li>
<li><a href="#cmd-view-docs" class="nav-item" data-section="cmd-view-docs">/view-docs</a></li>
```

#### 1.2 Skills Section (line 120)
```html
<!-- Thêm sau Skill Creator -->
<li><a href="#skill-report" class="nav-item" data-section="skill-report">Report</a></li>
```

### 2. Update Feature Card

**Line 165**: `8 Extensible Skills` → `10 Extensible Skills`

### 3. Add Command Sections

Insert trước line 682 (`<!-- Workflows -->`):

#### 3.1 /onboarding Command Section
```html
<section class="doc-section" id="cmd-onboarding">
    <!-- Content from .claude/commands/onboarding.md -->
</section>
```

#### 3.2 /view-docs Command Section
```html
<section class="doc-section" id="cmd-view-docs">
    <!-- Content from .claude/commands/view-docs.md -->
</section>
```

### 4. Add Report Skill Section

Insert sau line 2132 (`</section>` của skill-creator):

```html
<section class="doc-section" id="skill-report">
    <!-- Content from .claude/skills/report/SKILL.md -->
</section>
```

## Implementation Steps

| Step | Action | Location |
|------|--------|----------|
| 1 | Update sidebar - add commands | lines 78-81 |
| 2 | Update sidebar - add report skill | line 120 |
| 3 | Update skills count (8 → 10) | line 165 |
| 4 | Add /onboarding section | before line 682 |
| 5 | Add /view-docs section | before line 682 |
| 6 | Add report skill section | after line 2132 |

## Content Templates

### Command Section Template
```html
<section class="doc-section" id="cmd-{name}">
    <div class="section-header">
        <span class="section-badge command">/{name}</span>
        <h1>{Title} Command</h1>
        <p class="section-lead">{Description}</p>
    </div>

    <h2>Usage</h2>
    <div class="code-block">
        <div class="code-header">
            <span class="code-lang">Claude Code</span>
            <button class="copy-btn" data-copy="/{name} {args}">...</button>
        </div>
        <pre><code>/{name} {args}</code></pre>
    </div>

    <h2>Features</h2>
    <ul class="feature-list">
        <li>...</li>
    </ul>
</section>
```

### Skill Section Template
```html
<section class="doc-section" id="skill-{name}">
    <div class="section-header">
        <span class="section-badge skill">Skill</span>
        <h1>{Title}</h1>
        <p class="section-lead">{Description}</p>
    </div>

    <h2>When to Use</h2>
    <ul class="usage-list">
        <li>...</li>
    </ul>

    <h2>Key Features</h2>
    ...
</section>
```

## Verification

After implementation:
- [ ] All new nav links work
- [ ] Skills count shows "10"
- [ ] /onboarding section renders correctly
- [ ] /view-docs section renders correctly
- [ ] Report skill section renders correctly
- [ ] Search index includes new sections
