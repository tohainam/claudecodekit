/**
 * Claude Code Universal Config - Documentation Website
 * Interactive functionality: search, expand/collapse, copy-to-clipboard, navigation
 */

(function() {
    'use strict';

    // ===========================
    // State Management
    // ===========================

    const state = {
        expandedCards: new Set(),
        searchQuery: '',
        currentHash: window.location.hash
    };

    // ===========================
    // DOM Elements
    // ===========================

    let elements = {};

    function cacheElements() {
        elements = {
            // Sidebar
            sidebar: document.querySelector('.sidebar'),
            sidebarToggle: document.querySelector('.sidebar-toggle'),
            sidebarOverlay: document.querySelector('.sidebar-overlay'),
            navLinks: document.querySelectorAll('.nav-link'),

            // Search
            commandSearch: document.getElementById('command-search'),

            // Cards
            conceptCards: document.querySelectorAll('.concept-card'),
            commandCards: document.querySelectorAll('.command-card'),
            tutorialCards: document.querySelectorAll('.tutorial-card'),

            // Headers (clickable)
            conceptHeaders: document.querySelectorAll('.concept-header'),
            commandHeaders: document.querySelectorAll('.command-header'),
            tutorialHeaders: document.querySelectorAll('.tutorial-header'),

            // Wizard
            wizardCards: document.querySelectorAll('.wizard-card'),

            // Copy buttons
            copyButtons: document.querySelectorAll('.copy-btn'),

            // Sections for scroll spy
            sections: document.querySelectorAll('.doc-section')
        };
    }

    // ===========================
    // Sidebar Toggle (Mobile)
    // ===========================

    function initSidebar() {
        const { sidebar, sidebarToggle, sidebarOverlay, navLinks } = elements;

        if (!sidebar || !sidebarToggle) return;

        // Toggle sidebar
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
            sidebarOverlay.classList.toggle('visible');
            document.body.style.overflow = sidebar.classList.contains('open') ? 'hidden' : '';
        });

        // Close on overlay click
        if (sidebarOverlay) {
            sidebarOverlay.addEventListener('click', () => {
                sidebar.classList.remove('open');
                sidebarOverlay.classList.remove('visible');
                document.body.style.overflow = '';
            });
        }

        // Close on nav link click (mobile)
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 1024) {
                    sidebar.classList.remove('open');
                    sidebarOverlay.classList.remove('visible');
                    document.body.style.overflow = '';
                }
            });
        });

        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && sidebar.classList.contains('open')) {
                sidebar.classList.remove('open');
                sidebarOverlay.classList.remove('visible');
                document.body.style.overflow = '';
            }
        });
    }

    // ===========================
    // Scroll Spy (Active Nav Links)
    // ===========================

    function initScrollSpy() {
        const { navLinks, sections } = elements;

        if (!navLinks.length || !sections.length) return;

        const observerOptions = {
            root: null,
            rootMargin: '-20% 0px -60% 0px',
            threshold: 0
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.id;

                    // Update active nav link
                    navLinks.forEach(link => {
                        const href = link.getAttribute('href');
                        if (href === `#${id}`) {
                            link.classList.add('active');
                        } else {
                            link.classList.remove('active');
                        }
                    });
                }
            });
        }, observerOptions);

        sections.forEach(section => {
            observer.observe(section);
        });
    }

    // ===========================
    // Search Functionality
    // ===========================

    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    function filterCommands(query) {
        state.searchQuery = query.toLowerCase().trim();

        elements.commandCards.forEach(card => {
            const text = card.textContent.toLowerCase();
            const matches = !state.searchQuery || text.includes(state.searchQuery);

            if (matches) {
                card.classList.remove('hidden');
            } else {
                card.classList.add('hidden');
            }
        });

        // Update URL hash with search query
        if (state.searchQuery) {
            updateHash('commands', `q=${encodeURIComponent(state.searchQuery)}`);
        }
    }

    function initSearch() {
        if (!elements.commandSearch) return;

        const debouncedFilter = debounce(filterCommands, 300);

        elements.commandSearch.addEventListener('input', (e) => {
            debouncedFilter(e.target.value);
        });

        // Check for search query in URL on load
        const urlParams = new URLSearchParams(window.location.hash.split('?')[1]);
        const searchQuery = urlParams.get('q');
        if (searchQuery) {
            elements.commandSearch.value = searchQuery;
            filterCommands(searchQuery);
        }
    }

    // ===========================
    // Expand/Collapse Functionality
    // ===========================

    function toggleCard(card, header) {
        const isExpanded = card.classList.contains('expanded');

        if (isExpanded) {
            card.classList.remove('expanded');
            header.setAttribute('aria-expanded', 'false');
            state.expandedCards.delete(card);
        } else {
            card.classList.add('expanded');
            header.setAttribute('aria-expanded', 'true');
            state.expandedCards.add(card);
        }
    }

    function expandCard(card, header) {
        if (!card.classList.contains('expanded')) {
            card.classList.add('expanded');
            header.setAttribute('aria-expanded', 'true');
            state.expandedCards.add(card);
        }
    }

    function initExpandCollapse() {
        // Concept cards
        elements.conceptHeaders.forEach(header => {
            header.addEventListener('click', () => {
                const card = header.closest('.concept-card');
                toggleCard(card, header);
            });

            // Keyboard support
            header.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const card = header.closest('.concept-card');
                    toggleCard(card, header);
                }
            });
        });

        // Command cards
        elements.commandHeaders.forEach(header => {
            header.addEventListener('click', () => {
                const card = header.closest('.command-card');
                toggleCard(card, header);
            });

            header.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const card = header.closest('.command-card');
                    toggleCard(card, header);
                }
            });
        });

        // Tutorial cards
        elements.tutorialHeaders.forEach(header => {
            header.addEventListener('click', () => {
                const card = header.closest('.tutorial-card');
                toggleCard(card, header);
            });

            header.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const card = header.closest('.tutorial-card');
                    toggleCard(card, header);
                }
            });
        });

        // Escape key to close all
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                state.expandedCards.forEach(card => {
                    const header = card.querySelector('[role="button"]');
                    if (header) {
                        card.classList.remove('expanded');
                        header.setAttribute('aria-expanded', 'false');
                    }
                });
                state.expandedCards.clear();
            }
        });
    }

    // ===========================
    // Copy to Clipboard
    // ===========================

    async function copyToClipboard(text, button) {
        try {
            // Try modern Clipboard API first
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(text);
                showCopyFeedback(button);
            } else {
                // Fallback for older browsers
                const textarea = document.createElement('textarea');
                textarea.value = text;
                textarea.style.position = 'fixed';
                textarea.style.opacity = '0';
                document.body.appendChild(textarea);
                textarea.select();

                try {
                    document.execCommand('copy');
                    showCopyFeedback(button);
                } catch (err) {
                    console.error('Fallback copy failed:', err);
                    showCopyError(button);
                } finally {
                    document.body.removeChild(textarea);
                }
            }
        } catch (err) {
            console.error('Copy to clipboard failed:', err);
            showCopyError(button);
        }
    }

    function showCopyFeedback(button) {
        const originalText = button.textContent;
        button.textContent = 'Copied!';
        button.classList.add('copied');

        setTimeout(() => {
            button.textContent = originalText;
            button.classList.remove('copied');
        }, 2000);
    }

    function showCopyError(button) {
        const originalText = button.textContent;
        button.textContent = 'Error';

        setTimeout(() => {
            button.textContent = originalText;
        }, 2000);
    }

    function initCopyButtons() {
        elements.copyButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent card expansion

                const codeBlock = button.closest('.code-block');
                const preElement = codeBlock.querySelector('pre');
                const codeElement = preElement.querySelector('code');
                const textToCopy = codeElement ? codeElement.textContent : preElement.textContent;

                copyToClipboard(textToCopy.trim(), button);
            });
        });
    }

    // ===========================
    // Wizard Navigation
    // ===========================

    function scrollToSection(sectionId, options = {}) {
        const section = document.getElementById(sectionId);
        if (!section) return;

        // Account for mobile header on small screens
        const mobileHeader = document.querySelector('.mobile-header');
        const headerHeight = (window.innerWidth <= 1024 && mobileHeader) ? mobileHeader.offsetHeight : 0;
        const offset = options.offset || 20;
        const top = section.getBoundingClientRect().top + window.pageYOffset - headerHeight - offset;

        window.scrollTo({
            top: top,
            behavior: 'smooth'
        });
    }

    function highlightSection(sectionId) {
        // Could add temporary highlight effect here
        const section = document.getElementById(sectionId);
        if (section) {
            section.style.transition = 'background-color 0.5s ease';
            section.style.backgroundColor = 'rgba(37, 99, 235, 0.05)';
            setTimeout(() => {
                section.style.backgroundColor = '';
            }, 1000);
        }
    }

    function initWizardNavigation() {
        elements.wizardCards.forEach(card => {
            card.addEventListener('click', () => {
                const target = card.dataset.target;
                const filter = card.dataset.filter;

                if (target) {
                    // Scroll to target section
                    scrollToSection(target);

                    // Update hash
                    updateHash(target);

                    // If there's a filter, apply it to search
                    if (filter && target === 'commands' && elements.commandSearch) {
                        setTimeout(() => {
                            elements.commandSearch.value = filter;
                            elements.commandSearch.focus();
                            filterCommands(filter);
                        }, 500);
                    }

                    // Highlight section
                    setTimeout(() => {
                        highlightSection(target);
                    }, 500);
                }
            });

            // Keyboard support
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    card.click();
                }
            });

            // Make focusable
            card.setAttribute('tabindex', '0');
        });
    }

    // ===========================
    // Hash-based Navigation
    // ===========================

    function updateHash(sectionId, queryString = '') {
        const newHash = queryString ? `#${sectionId}?${queryString}` : `#${sectionId}`;

        if (window.location.hash !== newHash) {
            history.replaceState(null, '', newHash);
            state.currentHash = newHash;
        }
    }

    function parseHash() {
        const hash = window.location.hash;
        if (!hash || hash === '#') return null;

        const [sectionId, queryString] = hash.substring(1).split('?');
        return {
            sectionId,
            params: new URLSearchParams(queryString)
        };
    }

    function handleHashChange() {
        const hashData = parseHash();
        if (!hashData) return;

        const { sectionId, params } = hashData;

        // Scroll to section
        if (sectionId) {
            setTimeout(() => {
                scrollToSection(sectionId);
            }, 100);
        }

        // Handle specific section behavior
        if (sectionId === 'commands') {
            const searchQuery = params.get('q');
            if (searchQuery && elements.commandSearch) {
                elements.commandSearch.value = searchQuery;
                filterCommands(searchQuery);
            }
        }

        // Handle command-specific hash like #command-feature
        if (sectionId.startsWith('command-')) {
            const commandName = sectionId.replace('command-', '');
            const commandCard = Array.from(elements.commandCards).find(card => {
                const title = card.querySelector('.command-title h3');
                return title && title.textContent.includes(`/${commandName}`);
            });

            if (commandCard) {
                const header = commandCard.querySelector('.command-header');
                expandCard(commandCard, header);
                setTimeout(() => {
                    scrollToSection('commands');
                    setTimeout(() => {
                        const cardTop = commandCard.getBoundingClientRect().top + window.pageYOffset - 100;
                        window.scrollTo({ top: cardTop, behavior: 'smooth' });
                    }, 300);
                }, 100);
            }
        }

        // Handle tutorial-specific navigation
        const tutorialAttr = params.get('tutorial');
        if (tutorialAttr && sectionId === 'tutorials') {
            // Could expand specific tutorial based on data attribute
        }
    }

    function initHashNavigation() {
        // Handle hash on page load
        if (window.location.hash) {
            handleHashChange();
        }

        // Handle hash changes
        window.addEventListener('hashchange', handleHashChange);

        // Update sidebar navigation links to use smooth scroll
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href && href.startsWith('#')) {
                    e.preventDefault();
                    const sectionId = href.substring(1);
                    updateHash(sectionId);
                    scrollToSection(sectionId);

                    // Update active state immediately
                    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                    link.classList.add('active');
                }
            });
        });
    }

    // ===========================
    // Keyboard Accessibility
    // ===========================

    function initKeyboardAccessibility() {
        // Tab navigation is handled by native browser behavior
        // We've added keyboard support in expand/collapse and wizard already

        // Add focus visible styles programmatically if needed
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-nav');
            }
        });

        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-nav');
        });
    }

    // ===========================
    // Smooth Scroll Behavior
    // ===========================

    function initSmoothScroll() {
        // Smooth scroll is handled by CSS scroll-behavior: smooth
        // Additional JS handling is in scrollToSection function

        // Ensure all internal links scroll smoothly
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (href === '#' || !href) return;

                // Let hash navigation handle it
                const sectionId = href.substring(1);
                if (document.getElementById(sectionId)) {
                    e.preventDefault();
                    updateHash(sectionId);
                    scrollToSection(sectionId);
                }
            });
        });
    }

    // ===========================
    // Workflow Tabs
    // ===========================

    function initWorkflowTabs() {
        const tabs = document.querySelectorAll('.workflow-tab');
        const panels = document.querySelectorAll('.workflow-panel');

        if (!tabs.length || !panels.length) return;

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetWorkflow = tab.dataset.workflow;

                // Update active tab
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                // Update active panel
                panels.forEach(panel => {
                    if (panel.id === `workflow-${targetWorkflow}`) {
                        panel.classList.add('active');
                    } else {
                        panel.classList.remove('active');
                    }
                });

                // Track event
                trackEvent('Workflow', 'Tab Switch', targetWorkflow);
            });

            // Keyboard support
            tab.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    tab.click();
                }
            });
        });
    }

    // ===========================
    // Category Badge Colors
    // ===========================

    function initCategoryBadges() {
        const categoryMap = {
            'workflow': 'workflow',
            'quality': 'quality',
            'git': 'git',
            'setup': 'setup'
        };

        document.querySelectorAll('.command-category').forEach(badge => {
            const category = badge.textContent.toLowerCase().trim();
            const categoryClass = categoryMap[category];
            if (categoryClass) {
                badge.classList.add(categoryClass);
            }
        });
    }

    // ===========================
    // Analytics (Optional)
    // ===========================

    function trackEvent(category, action, label) {
        // Placeholder for analytics tracking
        // Could integrate with Google Analytics, Plausible, etc.
        if (typeof gtag !== 'undefined') {
            gtag('event', action, {
                'event_category': category,
                'event_label': label
            });
        }
    }

    function initAnalytics() {
        // Track wizard card clicks
        elements.wizardCards.forEach(card => {
            card.addEventListener('click', () => {
                const title = card.querySelector('h3').textContent;
                trackEvent('Wizard', 'Click', title);
            });
        });

        // Track command searches
        if (elements.commandSearch) {
            elements.commandSearch.addEventListener('input', debounce((e) => {
                if (e.target.value.trim()) {
                    trackEvent('Search', 'Query', e.target.value.trim());
                }
            }, 1000));
        }

        // Track copy button clicks
        elements.copyButtons.forEach(button => {
            button.addEventListener('click', () => {
                trackEvent('Copy', 'Code Block', 'Copied');
            });
        });
    }

    // ===========================
    // Utility Functions
    // ===========================

    function isMobile() {
        return window.innerWidth <= 768;
    }

    function isReducedMotion() {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    // ===========================
    // Loading State
    // ===========================

    function showLoadingState() {
        document.body.classList.add('loading');
    }

    function hideLoadingState() {
        document.body.classList.remove('loading');
    }

    // ===========================
    // Initialization
    // ===========================

    function init() {
        // Cache all DOM elements
        cacheElements();

        // Initialize all features
        initSidebar();
        initScrollSpy();
        initSearch();
        initExpandCollapse();
        initCopyButtons();
        initWizardNavigation();
        initHashNavigation();
        initKeyboardAccessibility();
        initSmoothScroll();
        initCategoryBadges();
        initWorkflowTabs();

        // Optional: Analytics
        // initAnalytics();

        // Hide loading state if implemented
        hideLoadingState();
    }

    // ===========================
    // Event Listeners
    // ===========================

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        // DOMContentLoaded already fired
        init();
    }

    // Handle window resize for responsive behavior
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            // Could re-calculate positions or update UI on resize
        }, 250);
    });

    // Prevent memory leaks on page unload
    window.addEventListener('beforeunload', () => {
        // Clean up event listeners if needed
        state.expandedCards.clear();
    });

})();
