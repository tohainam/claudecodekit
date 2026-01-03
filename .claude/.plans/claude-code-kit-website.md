# Documentation Website Plan

## Design System

### Style
**Primary**: Dark Mode (OLED) + Glassmorphism + Minimalism
- Deep dark backgrounds with glass card effects
- High contrast for readability
- Performance: Excellent | Accessibility: WCAG AAA target

### Color Palette (Developer Tool Theme)
| Role | Color | Hex |
|------|-------|-----|
| Primary | Blue | #3B82F6 |
| Secondary | Slate | #1E293B |
| CTA | Blue | #2563EB |
| Background | Dark Slate | #0F172A |
| Text | Light Gray | #F1F5F9 |
| Border | Gray | #334155 |
| Accent | Cyan | #22D3EE |
| Success | Green | #10B981 |
| Warning | Orange | #F97316 |

### Typography
- **Headings**: Inter (modern, professional)
- **Body**: Inter (excellent readability)
- **Code**: JetBrains Mono (developer-focused)

### Effects
- Glassmorphism cards: `backdrop-blur-lg bg-white/5 border border-white/10`
- Subtle hover glow: `hover:shadow-lg hover:shadow-blue-500/20`
- Smooth transitions: `transition-all duration-200`

## Website Structure

```
docs/
├── index.html          # Home + Navigation hub
├── css/
│   └── styles.css      # Complete design system
└── js/
    └── app.js          # Navigation, search, interactions
```

## Pages & Sections

### Single Page Application Structure
1. **Hero Section** - Project intro, quick stats, CTA
2. **Getting Started** - Installation, quick start
3. **Architecture** - Visual diagram, workflow overview
4. **Agents Section** - 3 agents with full documentation
5. **Skills Section** - 10 skills with examples
6. **Commands Section** - 2 commands with usage
7. **Rules Section** - 4 global rules
8. **Configuration** - Settings.json reference

### Component Structure
Each documentation section includes:
- Overview/Purpose
- Configuration table
- Usage examples with code
- Related components

## Technical Implementation

### HTML Structure
- Semantic HTML5 (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`)
- ARIA attributes for accessibility
- Skip links for keyboard navigation

### CSS Approach
- CSS Custom Properties for theming
- Utility-first approach inspired by Tailwind
- Responsive: mobile-first, breakpoints at 768px, 1024px
- Dark mode by default

### JavaScript Features
- Smooth scroll navigation
- Active section highlighting
- Mobile menu toggle
- Code syntax highlighting (Prism.js)
- Search functionality (fuzzy search)
- Copy code buttons

### Performance
- No framework dependencies (vanilla JS)
- CSS variables for efficient theming
- Lazy loading for images
- Optimized fonts (woff2)

## Content Outline

### Agents (3)
1. **Researcher** - External docs, best practices, comparisons
2. **Scouter** - Codebase analysis, pattern detection
3. **Reviewer** - Code review, security audit

### Skills (10)
1. Planning - SDD, hierarchical plans
2. Implementation - Clean code, SOLID
3. Testing - TDD/BDD, coverage
4. Documentation - Templates, ADRs
5. Security Audit - OWASP, vulnerability assessment
6. Git Workflow - Branching, commits, PRs
7. Code Patterns - Design patterns, architecture
8. Gemini - AI automation, CLI integration
9. UI/UX Pro Max - Design intelligence
10. Skill Creator - Create custom skills

### Commands (2)
1. `/brainstorm` - Interactive spec refinement
2. `/run` - Workflow orchestration

### Rules (4)
1. Code Quality - Standards, error handling
2. Communication - Output style, docs
3. Knowledge Freshness - Timestamps, research
4. Safety - Protected files, dangerous commands

## Deliverables
- `docs/index.html` - Complete single-page documentation
- `docs/css/styles.css` - Full design system
- `docs/js/app.js` - Interactive functionality
