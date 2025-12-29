/**
 * Claude Code Kit - Neo-Editorial Terminal 2026
 * Modern documentation with View Transitions and enhanced interactions
 */

(function() {
    'use strict';

    // ===========================================
    // Configuration
    // ===========================================

    const CONFIG = {
        searchDebounce: 120,
        animationDuration: 350,
        scrollOffset: 96
    };

    const state = {
        theme: localStorage.getItem('theme') || 'dark',
        paletteOpen: false,
        paletteSelectedIndex: 0,
        mobileNavOpen: false,
        currentFilter: 'all',
        supportsViewTransitions: typeof document.startViewTransition === 'function',
        supportsScrollTimeline: CSS.supports('animation-timeline', 'scroll()')
    };

    // ===========================================
    // DOM Elements
    // ===========================================

    const elements = {};

    function cacheElements() {
        elements.html = document.documentElement;
        elements.body = document.body;
        elements.header = document.querySelector('.header');
        elements.progressBar = document.getElementById('progressBar');
        elements.mobileMenuBtn = document.getElementById('mobileMenuBtn');
        elements.mobileNav = document.getElementById('mobileNav');
        elements.navLinks = document.querySelectorAll('.nav-link, .mobile-nav-links a');
        elements.themeToggle = document.getElementById('themeToggle');
        elements.cmdTrigger = document.getElementById('cmdTrigger');
        elements.commandPalette = document.getElementById('commandPalette');
        elements.paletteInput = document.getElementById('paletteInput');
        elements.paletteResults = document.getElementById('paletteResults');
        elements.paletteBackdrop = document.querySelector('.palette-backdrop');
        elements.filterBtns = document.querySelectorAll('.filter-btn');
        elements.commandCards = document.querySelectorAll('.command-card');
        elements.workflowTabs = document.querySelectorAll('.workflow-tab');
        elements.workflowPanels = document.querySelectorAll('.workflow-panel');
        elements.copyBtns = document.querySelectorAll('.copy-btn');
        elements.sections = document.querySelectorAll('.section[id], .hero[id]');
        elements.stats = document.querySelectorAll('.stat');
    }

    // ===========================================
    // Theme Management
    // ===========================================

    function initTheme() {
        if (!localStorage.getItem('theme')) {
            state.theme = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
        }
        applyTheme(state.theme, false);

        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem('theme')) {
                applyTheme(e.matches ? 'dark' : 'light', true);
            }
        });

        if (elements.themeToggle) {
            elements.themeToggle.addEventListener('click', toggleTheme);
        }
    }

    function applyTheme(theme, animate = true) {
        const apply = () => {
            state.theme = theme;
            elements.html.setAttribute('data-theme', theme);
            localStorage.setItem('theme', theme);
        };

        if (animate && state.supportsViewTransitions) {
            document.startViewTransition(apply);
        } else {
            apply();
        }
    }

    function toggleTheme() {
        const newTheme = state.theme === 'dark' ? 'light' : 'dark';
        applyTheme(newTheme, true);
    }

    // ===========================================
    // Progress Bar (JS Fallback)
    // ===========================================

    function initProgressBar() {
        if (!elements.progressBar || state.supportsScrollTimeline) return;

        // Only use JS if CSS scroll-timeline is not supported
        let ticking = false;

        function updateProgress() {
            const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollTop = window.scrollY;
            const progress = scrollHeight > 0 ? scrollTop / scrollHeight : 0;
            elements.progressBar.style.transform = `scaleX(${progress})`;
            ticking = false;
        }

        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(updateProgress);
                ticking = true;
            }
        }, { passive: true });

        updateProgress();
    }

    // ===========================================
    // Mobile Navigation
    // ===========================================

    function initMobileNav() {
        if (!elements.mobileMenuBtn || !elements.mobileNav) return;

        function updateMobileNavState(isOpen) {
            state.mobileNavOpen = isOpen;
            elements.mobileMenuBtn.classList.toggle('active', isOpen);
            elements.mobileMenuBtn.setAttribute('aria-expanded', isOpen);
            elements.mobileNav.classList.toggle('open', isOpen);
            elements.mobileNav.setAttribute('aria-hidden', !isOpen);
            elements.body.style.overflow = isOpen ? 'hidden' : '';
        }

        elements.mobileMenuBtn.addEventListener('click', () => {
            updateMobileNavState(!state.mobileNavOpen);
        });

        elements.navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (state.mobileNavOpen) {
                    updateMobileNavState(false);
                }
            });
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && state.mobileNavOpen) {
                updateMobileNavState(false);
            }
        });
    }

    // ===========================================
    // Scroll Spy
    // ===========================================

    function initScrollSpy() {
        if (!elements.sections.length || !elements.navLinks.length) return;

        const observerOptions = {
            root: null,
            rootMargin: '-20% 0px -70% 0px',
            threshold: 0
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    updateActiveNav(entry.target.id);
                }
            });
        }, observerOptions);

        elements.sections.forEach(section => {
            observer.observe(section);
        });
    }

    function updateActiveNav(activeId) {
        elements.navLinks.forEach(link => {
            const href = link.getAttribute('href');
            link.classList.toggle('active', href === `#${activeId}`);
        });
    }

    // ===========================================
    // Counter Animation
    // ===========================================

    function initCounterAnimation() {
        if (!elements.stats.length) return;

        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.5
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const valueEl = entry.target.querySelector('.stat-value');
                    if (valueEl && !valueEl.dataset.animated) {
                        animateCounter(valueEl);
                        valueEl.dataset.animated = 'true';
                    }
                }
            });
        }, observerOptions);

        elements.stats.forEach(stat => observer.observe(stat));
    }

    function animateCounter(element) {
        const target = parseInt(element.textContent, 10);
        const duration = 1200;
        const start = performance.now();

        function update(currentTime) {
            const elapsed = currentTime - start;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out quart
            const eased = 1 - Math.pow(1 - progress, 4);
            element.textContent = Math.round(target * eased);

            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }

        requestAnimationFrame(update);
    }

    // ===========================================
    // Command Palette with Fuzzy Search
    // ===========================================

    const searchableItems = [];

    function initCommandPalette() {
        if (!elements.commandPalette) return;

        buildSearchIndex();

        if (elements.cmdTrigger) {
            elements.cmdTrigger.addEventListener('click', openPalette);
        }

        document.addEventListener('keydown', (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                state.paletteOpen ? closePalette() : openPalette();
            }
        });

        if (elements.paletteBackdrop) {
            elements.paletteBackdrop.addEventListener('click', closePalette);
        }

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && state.paletteOpen) {
                closePalette();
            }
        });

        if (elements.paletteInput) {
            elements.paletteInput.addEventListener('input', debounce(handlePaletteSearch, CONFIG.searchDebounce));
            elements.paletteInput.addEventListener('keydown', handlePaletteKeydown);
        }

        elements.paletteResults.addEventListener('click', (e) => {
            const item = e.target.closest('.palette-item');
            if (item) {
                handlePaletteSelect(item);
            }
        });
    }

    function buildSearchIndex() {
        const sectionData = [
            { type: 'section', id: 'features', title: 'Features', icon: '*', desc: 'Why Claude Code Kit?', keywords: 'features why benefits' },
            { type: 'section', id: 'commands', title: 'All Commands', icon: '/', desc: '14 available commands', keywords: 'commands reference list' },
            { type: 'section', id: 'workflows', title: 'Workflows', icon: '~', desc: 'Structured development flows', keywords: 'workflows process flow' },
            { type: 'section', id: 'skills', title: 'Skills', icon: '+', desc: '12 auto-loading skills', keywords: 'skills abilities auto' },
            { type: 'section', id: 'agents', title: 'Agents', icon: '@', desc: '9 specialized agents', keywords: 'agents ai models' },
            { type: 'section', id: 'installation', title: 'Get Started', icon: '>', desc: 'Installation guide', keywords: 'install setup start begin' }
        ];

        sectionData.forEach(item => searchableItems.push(item));

        elements.commandCards.forEach(card => {
            const name = card.querySelector('.command-name')?.textContent || '';
            const desc = card.querySelector('.command-desc')?.textContent || '';
            const category = card.dataset.category || '';
            const searchData = card.dataset.search || '';

            searchableItems.push({
                type: 'command',
                id: name.replace('/', ''),
                title: name,
                icon: '/',
                desc: desc,
                category: category,
                keywords: searchData,
                element: card
            });
        });
    }

    // Fuzzy search implementation
    function fuzzyMatch(pattern, str) {
        if (!pattern) return { score: 0, matches: [] };

        const patternLower = pattern.toLowerCase();
        const strLower = str.toLowerCase();
        const matches = [];

        let patternIdx = 0;
        let score = 0;
        let consecutive = 0;
        let lastMatchIdx = -1;

        for (let i = 0; i < strLower.length && patternIdx < patternLower.length; i++) {
            if (strLower[i] === patternLower[patternIdx]) {
                matches.push(i);

                // Scoring
                score += 1;
                if (lastMatchIdx === i - 1) {
                    consecutive++;
                    score += consecutive * 2;
                } else {
                    consecutive = 0;
                }

                // Bonus for word boundary
                if (i === 0 || /[\s\-_\/]/.test(str[i - 1])) {
                    score += 10;
                }

                // Bonus for camelCase
                if (i > 0 && str[i] === str[i].toUpperCase() && str[i - 1] === str[i - 1].toLowerCase()) {
                    score += 5;
                }

                lastMatchIdx = i;
                patternIdx++;
            }
        }

        // Return 0 if pattern wasn't fully matched
        if (patternIdx !== patternLower.length) {
            return { score: 0, matches: [] };
        }

        // Bonus for shorter strings (more relevant)
        score += Math.max(0, 20 - str.length);

        return { score, matches };
    }

    function highlightMatches(str, matches) {
        if (!matches.length) return escapeHtml(str);

        let result = '';
        let lastIdx = 0;

        matches.forEach(matchIdx => {
            result += escapeHtml(str.slice(lastIdx, matchIdx));
            result += `<mark>${escapeHtml(str[matchIdx])}</mark>`;
            lastIdx = matchIdx + 1;
        });

        result += escapeHtml(str.slice(lastIdx));
        return result;
    }

    function openPalette() {
        if (state.supportsViewTransitions) {
            document.startViewTransition(() => {
                state.paletteOpen = true;
                elements.commandPalette.classList.add('open');
            });
        } else {
            state.paletteOpen = true;
            elements.commandPalette.classList.add('open');
        }

        state.paletteSelectedIndex = 0;
        elements.paletteInput.value = '';
        renderPaletteResults('');
        elements.body.style.overflow = 'hidden';

        setTimeout(() => {
            if (elements.paletteInput) {
                elements.paletteInput.focus();
            }
        }, 50);
    }

    function closePalette() {
        if (state.supportsViewTransitions) {
            document.startViewTransition(() => {
                state.paletteOpen = false;
                elements.commandPalette.classList.remove('open');
            });
        } else {
            state.paletteOpen = false;
            elements.commandPalette.classList.remove('open');
        }
        elements.body.style.overflow = '';
    }

    function handlePaletteSearch(e) {
        const query = e.target.value.trim();
        renderPaletteResults(query);
    }

    function renderPaletteResults(query) {
        let results;

        if (!query) {
            results = searchableItems.map(item => ({
                ...item,
                score: 0,
                titleMatches: [],
                descMatches: []
            }));
        } else {
            results = searchableItems.map(item => {
                const searchText = `${item.title} ${item.desc} ${item.keywords || ''}`;
                const titleMatch = fuzzyMatch(query, item.title);
                const descMatch = fuzzyMatch(query, item.desc);
                const keywordsMatch = fuzzyMatch(query, item.keywords || '');

                const totalScore = Math.max(
                    titleMatch.score * 2,
                    descMatch.score,
                    keywordsMatch.score
                );

                return {
                    ...item,
                    score: totalScore,
                    titleMatches: titleMatch.matches,
                    descMatches: descMatch.matches
                };
            }).filter(item => item.score > 0)
              .sort((a, b) => b.score - a.score);
        }

        const sections = results.filter(r => r.type === 'section');
        const commands = results.filter(r => r.type === 'command');

        let html = '';
        let itemIndex = 0;

        if (sections.length > 0) {
            html += `
                <div class="palette-group">
                    <div class="palette-group-title">Sections</div>
                    ${sections.map(item => renderPaletteItem(item, itemIndex++, query)).join('')}
                </div>
            `;
        }

        if (commands.length > 0) {
            html += `
                <div class="palette-group">
                    <div class="palette-group-title">Commands</div>
                    ${commands.map(item => renderPaletteItem(item, itemIndex++, query)).join('')}
                </div>
            `;
        }

        if (results.length === 0) {
            html = `
                <div class="palette-group">
                    <div class="palette-group-title">No Results</div>
                    <div class="palette-item" style="opacity: 0.5; cursor: default;">
                        <span class="palette-item-text">No matches found for "${escapeHtml(query)}"</span>
                    </div>
                </div>
            `;
        }

        elements.paletteResults.innerHTML = html;
        state.paletteSelectedIndex = 0;
        updatePaletteSelection();
    }

    function renderPaletteItem(item, index, query) {
        const selectedClass = index === state.paletteSelectedIndex ? 'selected' : '';
        const titleHtml = query ? highlightMatches(item.title, item.titleMatches) : escapeHtml(item.title);
        const descHtml = query ? highlightMatches(item.desc, item.descMatches) : escapeHtml(item.desc);

        return `
            <button class="palette-item ${selectedClass}" data-type="${item.type}" data-id="${item.id}" data-index="${index}">
                <span class="palette-item-icon">${item.icon}</span>
                <span class="palette-item-text">${titleHtml}</span>
                <span class="palette-item-hint">${descHtml.substring(0, 40)}</span>
            </button>
        `;
    }

    function handlePaletteKeydown(e) {
        const items = elements.paletteResults.querySelectorAll('.palette-item[data-index]');
        const maxIndex = items.length - 1;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                state.paletteSelectedIndex = Math.min(state.paletteSelectedIndex + 1, maxIndex);
                updatePaletteSelection();
                break;
            case 'ArrowUp':
                e.preventDefault();
                state.paletteSelectedIndex = Math.max(state.paletteSelectedIndex - 1, 0);
                updatePaletteSelection();
                break;
            case 'Enter':
                e.preventDefault();
                const selectedItem = items[state.paletteSelectedIndex];
                if (selectedItem) {
                    handlePaletteSelect(selectedItem);
                }
                break;
        }
    }

    function updatePaletteSelection() {
        const items = elements.paletteResults.querySelectorAll('.palette-item[data-index]');
        items.forEach((item, i) => {
            item.classList.toggle('selected', i === state.paletteSelectedIndex);
        });

        const selected = items[state.paletteSelectedIndex];
        if (selected) {
            selected.scrollIntoView({ block: 'nearest' });
        }
    }

    function handlePaletteSelect(item) {
        const type = item.dataset.type;
        const id = item.dataset.id;

        closePalette();

        if (type === 'section') {
            navigateToSection(id);
        } else if (type === 'command') {
            navigateToSection('commands');
            setTimeout(() => {
                const commandCard = document.querySelector(`[data-search*="/${id}"]`);
                if (commandCard) {
                    commandCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    highlightCard(commandCard);
                }
            }, 450);
        }
    }

    function highlightCard(card) {
        card.style.boxShadow = 'inset 0 0 0 2px var(--color-accent), var(--shadow-glow-sm)';
        setTimeout(() => {
            card.style.boxShadow = '';
        }, 2500);
    }

    // ===========================================
    // Navigation with View Transitions
    // ===========================================

    function navigateToSection(id) {
        const section = document.getElementById(id);
        if (!section) return;

        const headerHeight = elements.header?.offsetHeight || 72;
        const top = section.getBoundingClientRect().top + window.pageYOffset - headerHeight - 24;

        if (state.supportsViewTransitions) {
            document.startViewTransition(() => {
                window.scrollTo({ top, behavior: 'instant' });
                history.pushState(null, '', `#${id}`);
            });
        } else {
            window.scrollTo({ top, behavior: 'smooth' });
            history.pushState(null, '', `#${id}`);
        }
    }

    // ===========================================
    // Commands Filtering
    // ===========================================

    function initCommandsFilter() {
        if (!elements.filterBtns.length) return;

        elements.filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const filter = btn.dataset.filter;
                filterCommands(filter);

                // Update ARIA states for filter tabs
                elements.filterBtns.forEach(b => {
                    const isActive = b === btn;
                    b.classList.toggle('active', isActive);
                    b.setAttribute('aria-selected', isActive);
                });
            });
        });
    }

    function filterCommands(category) {
        state.currentFilter = category;

        elements.commandCards.forEach((card, index) => {
            const cardCategory = card.dataset.category;
            const shouldShow = category === 'all' || cardCategory === category;

            if (shouldShow) {
                card.classList.remove('hidden');
                card.style.animationDelay = `${index * 0.05}s`;
            } else {
                card.classList.add('hidden');
            }
        });
    }

    // ===========================================
    // Workflow Tabs
    // ===========================================

    function initWorkflowTabs() {
        if (!elements.workflowTabs.length) return;

        elements.workflowTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const workflow = tab.dataset.workflow;

                // Update tab states with ARIA
                elements.workflowTabs.forEach(t => {
                    const isActive = t === tab;
                    t.classList.toggle('active', isActive);
                    t.setAttribute('aria-selected', isActive);
                });

                // Update panel visibility with hidden attribute
                elements.workflowPanels.forEach(panel => {
                    const isActive = panel.id === `workflow-${workflow}`;
                    panel.classList.toggle('active', isActive);
                    panel.hidden = !isActive;
                });
            });
        });

        // Touch gesture support for mobile
        let touchStartX = 0;
        const tabsArray = Array.from(elements.workflowTabs);

        elements.workflowPanels.forEach(panel => {
            panel.addEventListener('touchstart', (e) => {
                touchStartX = e.touches[0].clientX;
            }, { passive: true });

            panel.addEventListener('touchend', (e) => {
                const touchEndX = e.changedTouches[0].clientX;
                const diff = touchStartX - touchEndX;

                if (Math.abs(diff) > 50) {
                    const currentIndex = tabsArray.findIndex(t => t.classList.contains('active'));
                    let newIndex;

                    if (diff > 0 && currentIndex < tabsArray.length - 1) {
                        newIndex = currentIndex + 1;
                    } else if (diff < 0 && currentIndex > 0) {
                        newIndex = currentIndex - 1;
                    }

                    if (newIndex !== undefined) {
                        tabsArray[newIndex].click();
                    }
                }
            }, { passive: true });
        });
    }

    // ===========================================
    // Copy to Clipboard
    // ===========================================

    function initCopyButtons() {
        elements.copyBtns.forEach(btn => {
            btn.addEventListener('click', async () => {
                const code = btn.dataset.code || btn.closest('.code-block')?.querySelector('code')?.textContent;
                if (!code) return;

                // Remove the "$ " prefix if present
                const cleanCode = code.replace(/^\$\s*/, '').trim();

                try {
                    await navigator.clipboard.writeText(cleanCode);
                    showCopyFeedback(btn, true);
                } catch {
                    // Fallback for older browsers
                    const textarea = document.createElement('textarea');
                    textarea.value = cleanCode;
                    textarea.style.cssText = 'position:fixed;opacity:0;';
                    document.body.appendChild(textarea);
                    textarea.select();

                    try {
                        document.execCommand('copy');
                        showCopyFeedback(btn, true);
                    } catch {
                        showCopyFeedback(btn, false);
                    }

                    document.body.removeChild(textarea);
                }
            });
        });
    }

    function showCopyFeedback(btn, success) {
        const icon = btn.innerHTML;
        btn.classList.add('copied');

        if (success) {
            btn.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
            `;
        }

        setTimeout(() => {
            btn.classList.remove('copied');
            btn.innerHTML = icon;
        }, 2000);
    }

    // ===========================================
    // Smooth Scrolling
    // ===========================================

    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (!href || href === '#') return;

                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    navigateToSection(href.substring(1));
                }
            });
        });
    }

    // ===========================================
    // Keyboard Shortcuts
    // ===========================================

    function initKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Don't trigger when typing in inputs
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            switch (e.key) {
                case '/':
                    e.preventDefault();
                    openPalette();
                    break;
                case 't':
                    if (!e.metaKey && !e.ctrlKey && !e.altKey) {
                        toggleTheme();
                    }
                    break;
            }
        });
    }

    // ===========================================
    // View Transition Styles
    // ===========================================

    function injectViewTransitionStyles() {
        if (!state.supportsViewTransitions) return;

        const style = document.createElement('style');
        style.textContent = `
            ::view-transition-old(root),
            ::view-transition-new(root) {
                animation-duration: 0.3s;
                animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
            }

            ::view-transition-old(root) {
                animation-name: fade-out;
            }

            ::view-transition-new(root) {
                animation-name: fade-in;
            }

            @keyframes fade-out {
                to { opacity: 0; }
            }

            @keyframes fade-in {
                from { opacity: 0; }
            }

            /* Theme transition specific */
            [data-theme="dark"]::view-transition-old(root) {
                z-index: 1;
            }

            [data-theme="light"]::view-transition-new(root) {
                z-index: 999;
            }

            /* Highlight animation for fuzzy search */
            .palette-item mark {
                background: transparent;
                color: var(--color-accent);
                font-weight: 600;
            }
        `;
        document.head.appendChild(style);
    }

    // ===========================================
    // Utilities
    // ===========================================

    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func.apply(this, args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ===========================================
    // Initialization
    // ===========================================

    function init() {
        cacheElements();
        injectViewTransitionStyles();
        initTheme();
        initProgressBar();
        initMobileNav();
        initScrollSpy();
        initCounterAnimation();
        initCommandPalette();
        initCommandsFilter();
        initWorkflowTabs();
        initCopyButtons();
        initSmoothScroll();
        initKeyboardShortcuts();

        // Handle initial hash
        if (window.location.hash) {
            const id = window.location.hash.substring(1);
            setTimeout(() => navigateToSection(id), 100);
        }

        // Log ready message
        console.log(
            '%c Claude Code Kit %c 2026 Edition',
            'background: linear-gradient(135deg, oklch(82% 0.15 185), oklch(68% 0.22 330)); color: oklch(9% 0.005 265); padding: 6px 10px; border-radius: 6px; font-weight: bold; font-family: monospace;',
            'color: oklch(82% 0.15 185); font-family: monospace;'
        );
    }

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
