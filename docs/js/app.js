/**
 * Claude Code Kit - Neo-Terminal 2026
 * Modern documentation with terminal-inspired interactions
 */

(function() {
    'use strict';

    // ===========================================
    // Configuration
    // ===========================================

    const CONFIG = {
        scrollThrottle: 100,
        searchDebounce: 150,
        animationDuration: 300,
        typingSpeed: 50,
        cursorBlinkSpeed: 530
    };

    const state = {
        theme: localStorage.getItem('theme') || 'dark',
        paletteOpen: false,
        paletteSelectedIndex: 0,
        mobileNavOpen: false,
        currentFilter: 'all',
        hasAnimated: new Set()
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
        elements.heroTitle = document.querySelector('.hero-title');
        elements.bentoCards = document.querySelectorAll('.bento-card');
        elements.skillCards = document.querySelectorAll('.skill-card');
        elements.stats = document.querySelectorAll('.stat');
    }

    // ===========================================
    // Theme Management
    // ===========================================

    function initTheme() {
        if (!localStorage.getItem('theme')) {
            state.theme = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
        }
        applyTheme(state.theme);

        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem('theme')) {
                applyTheme(e.matches ? 'dark' : 'light');
            }
        });

        if (elements.themeToggle) {
            elements.themeToggle.addEventListener('click', toggleTheme);
        }
    }

    function applyTheme(theme) {
        state.theme = theme;
        elements.html.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }

    function toggleTheme() {
        const newTheme = state.theme === 'dark' ? 'light' : 'dark';
        applyTheme(newTheme);
    }

    // ===========================================
    // Progress Bar
    // ===========================================

    function initProgressBar() {
        if (!elements.progressBar) return;

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

        elements.mobileMenuBtn.addEventListener('click', () => {
            state.mobileNavOpen = !state.mobileNavOpen;
            elements.mobileMenuBtn.classList.toggle('active', state.mobileNavOpen);
            elements.mobileNav.classList.toggle('open', state.mobileNavOpen);
            elements.body.style.overflow = state.mobileNavOpen ? 'hidden' : '';
        });

        elements.navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (state.mobileNavOpen) {
                    state.mobileNavOpen = false;
                    elements.mobileMenuBtn.classList.remove('active');
                    elements.mobileNav.classList.remove('open');
                    elements.body.style.overflow = '';
                }
            });
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && state.mobileNavOpen) {
                state.mobileNavOpen = false;
                elements.mobileMenuBtn.classList.remove('active');
                elements.mobileNav.classList.remove('open');
                elements.body.style.overflow = '';
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
            if (href === `#${activeId}`) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    // ===========================================
    // Scroll Animations
    // ===========================================

    function initScrollAnimations() {
        const animatedElements = [
            ...elements.bentoCards,
            ...elements.skillCards,
            ...elements.commandCards,
            ...elements.stats
        ];

        if (!animatedElements.length) return;

        // Set initial state
        animatedElements.forEach((el, index) => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = `opacity 0.6s cubic-bezier(0.23, 1, 0.32, 1) ${index % 4 * 0.1}s, transform 0.6s cubic-bezier(0.23, 1, 0.32, 1) ${index % 4 * 0.1}s`;
        });

        const observerOptions = {
            root: null,
            rootMargin: '0px 0px -10% 0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !state.hasAnimated.has(entry.target)) {
                    state.hasAnimated.add(entry.target);
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        animatedElements.forEach(el => observer.observe(el));
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
        const duration = 1500;
        const start = performance.now();

        function update(currentTime) {
            const elapsed = currentTime - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 4);
            element.textContent = Math.round(target * eased);

            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }

        requestAnimationFrame(update);
    }

    // ===========================================
    // Command Palette
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
            { type: 'section', id: 'features', title: 'Features', icon: '*', desc: 'Why Claude Code Kit?' },
            { type: 'section', id: 'commands', title: 'All Commands', icon: '/', desc: '14 available commands' },
            { type: 'section', id: 'workflows', title: 'Workflows', icon: '~', desc: 'Structured development flows' },
            { type: 'section', id: 'skills', title: 'Skills', icon: '+', desc: '12 auto-loading skills' },
            { type: 'section', id: 'agents', title: 'Agents', icon: '@', desc: '9 specialized agents' },
            { type: 'section', id: 'installation', title: 'Get Started', icon: '>', desc: 'Installation guide' }
        ];

        sectionData.forEach(item => searchableItems.push(item));

        elements.commandCards.forEach(card => {
            const name = card.querySelector('.command-name')?.textContent || '';
            const desc = card.querySelector('.command-desc')?.textContent || '';
            const category = card.dataset.category || '';

            searchableItems.push({
                type: 'command',
                id: name.replace('/', ''),
                title: name,
                icon: '/',
                desc: desc,
                category: category,
                element: card
            });
        });
    }

    function openPalette() {
        state.paletteOpen = true;
        state.paletteSelectedIndex = 0;
        elements.commandPalette.classList.add('open');
        elements.paletteInput.value = '';
        renderPaletteResults('');
        elements.body.style.overflow = 'hidden';

        // Focus with delay to ensure DOM is ready and visible
        setTimeout(() => {
            if (elements.paletteInput) {
                elements.paletteInput.focus();
                elements.paletteInput.select();
            }
        }, 50);
    }

    function closePalette() {
        state.paletteOpen = false;
        elements.commandPalette.classList.remove('open');
        elements.body.style.overflow = '';
    }

    function handlePaletteSearch(e) {
        const query = e.target.value.toLowerCase().trim();
        renderPaletteResults(query);
    }

    function renderPaletteResults(query) {
        let results = searchableItems;

        if (query) {
            results = searchableItems.filter(item => {
                const searchText = `${item.title} ${item.desc}`.toLowerCase();
                return searchText.includes(query);
            });
        }

        const sections = results.filter(r => r.type === 'section');
        const commands = results.filter(r => r.type === 'command');

        let html = '';

        if (sections.length > 0) {
            html += `
                <div class="palette-group">
                    <div class="palette-group-title">Sections</div>
                    ${sections.map((item, i) => renderPaletteItem(item, i)).join('')}
                </div>
            `;
        }

        if (commands.length > 0) {
            html += `
                <div class="palette-group">
                    <div class="palette-group-title">Commands</div>
                    ${commands.map((item, i) => renderPaletteItem(item, sections.length + i)).join('')}
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

    function renderPaletteItem(item, index) {
        const selectedClass = index === state.paletteSelectedIndex ? 'selected' : '';
        return `
            <button class="palette-item ${selectedClass}" data-type="${item.type}" data-id="${item.id}" data-index="${index}">
                <span class="palette-item-icon">${item.icon}</span>
                <span class="palette-item-text">${escapeHtml(item.title)}</span>
                <span class="palette-item-hint">${escapeHtml(item.desc).substring(0, 40)}</span>
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
            scrollToSection(id);
        } else if (type === 'command') {
            scrollToSection('commands');
            setTimeout(() => {
                const commandCard = document.querySelector(`[data-search*="/${id}"]`);
                if (commandCard) {
                    commandCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    commandCard.style.boxShadow = 'inset 0 0 0 2px var(--accent), var(--shadow-glow-sm)';
                    setTimeout(() => {
                        commandCard.style.boxShadow = '';
                    }, 2000);
                }
            }, 400);
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

                elements.filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
    }

    function filterCommands(category) {
        state.currentFilter = category;

        elements.commandCards.forEach((card, index) => {
            const cardCategory = card.dataset.category;

            if (category === 'all' || cardCategory === category) {
                card.classList.remove('hidden');
                card.style.animation = `fadeSlide 0.4s cubic-bezier(0.23, 1, 0.32, 1) ${index * 0.05}s forwards`;
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

                elements.workflowTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                elements.workflowPanels.forEach(panel => {
                    if (panel.id === `workflow-${workflow}`) {
                        panel.classList.add('active');
                    } else {
                        panel.classList.remove('active');
                    }
                });
            });
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
                } catch (err) {
                    const textarea = document.createElement('textarea');
                    textarea.value = cleanCode;
                    textarea.style.position = 'fixed';
                    textarea.style.opacity = '0';
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
                    scrollToSection(href.substring(1));
                }
            });
        });
    }

    function scrollToSection(id) {
        const section = document.getElementById(id);
        if (!section) return;

        const headerHeight = elements.header?.offsetHeight || 72;
        const top = section.getBoundingClientRect().top + window.pageYOffset - headerHeight - 24;

        window.scrollTo({
            top: top,
            behavior: 'smooth'
        });

        history.pushState(null, '', `#${id}`);
    }

    // ===========================================
    // Header Scroll Effect
    // ===========================================

    function initHeaderScroll() {
        if (!elements.header) return;

        let lastScroll = 0;
        let ticking = false;

        function updateHeader() {
            const currentScroll = window.scrollY;

            if (currentScroll > 100) {
                elements.header.style.backdropFilter = 'blur(20px) saturate(180%)';
            } else {
                elements.header.style.backdropFilter = 'blur(20px) saturate(180%)';
            }

            lastScroll = currentScroll;
            ticking = false;
        }

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateHeader);
                ticking = true;
            }
        }, { passive: true });
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
                    if (!e.metaKey && !e.ctrlKey) {
                        toggleTheme();
                    }
                    break;
            }
        });
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
    // CSS Animation Injection
    // ===========================================

    function injectAnimationStyles() {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeSlide {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
        `;
        document.head.appendChild(style);
    }

    // ===========================================
    // Initialization
    // ===========================================

    function init() {
        cacheElements();
        injectAnimationStyles();
        initTheme();
        initProgressBar();
        initMobileNav();
        initScrollSpy();
        initScrollAnimations();
        initCounterAnimation();
        initCommandPalette();
        initCommandsFilter();
        initWorkflowTabs();
        initCopyButtons();
        initSmoothScroll();
        initHeaderScroll();
        initKeyboardShortcuts();

        // Handle initial hash
        if (window.location.hash) {
            const id = window.location.hash.substring(1);
            setTimeout(() => scrollToSection(id), 100);
        }

        // Log ready message
        console.log('%c Claude Code Kit %c Documentation loaded',
            'background: linear-gradient(135deg, #00ffd5, #ff00aa); color: #030303; padding: 4px 8px; border-radius: 4px; font-weight: bold;',
            'color: #00ffd5;'
        );
    }

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
