/**
 * Claude Code Kit - Documentation App
 * Modern documentation website with interactive features
 */

(function() {
    'use strict';

    // ==========================================
    // Theme Management
    // ==========================================
    const ThemeManager = {
        init() {
            this.toggle = document.getElementById('themeToggle');
            this.prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

            // Get saved theme or use system preference
            const saved = localStorage.getItem('theme');
            if (saved) {
                this.setTheme(saved);
            } else if (this.prefersDark.matches) {
                this.setTheme('dark');
            }

            // Listen for toggle click
            if (this.toggle) {
                this.toggle.addEventListener('click', () => this.toggleTheme());
            }

            // Listen for system preference changes
            this.prefersDark.addEventListener('change', (e) => {
                if (!localStorage.getItem('theme')) {
                    this.setTheme(e.matches ? 'dark' : 'light');
                }
            });
        },

        setTheme(theme) {
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem('theme', theme);
            this.updateIcon(theme);
        },

        toggleTheme() {
            const current = document.documentElement.getAttribute('data-theme') || 'light';
            this.setTheme(current === 'dark' ? 'light' : 'dark');
        },

        updateIcon(theme) {
            if (!this.toggle) return;
            const sunIcon = this.toggle.querySelector('.sun-icon');
            const moonIcon = this.toggle.querySelector('.moon-icon');
            if (sunIcon && moonIcon) {
                sunIcon.style.display = theme === 'dark' ? 'block' : 'none';
                moonIcon.style.display = theme === 'dark' ? 'none' : 'block';
            }
        }
    };

    // ==========================================
    // Sidebar Navigation
    // ==========================================
    const Sidebar = {
        init() {
            this.sidebar = document.querySelector('.sidebar');
            this.toggle = document.getElementById('sidebarToggle');
            this.overlay = document.querySelector('.sidebar-overlay');
            this.navLinks = document.querySelectorAll('.sidebar-nav a');

            if (this.toggle) {
                this.toggle.addEventListener('click', () => this.toggleSidebar());
            }

            if (this.overlay) {
                this.overlay.addEventListener('click', () => this.closeSidebar());
            }

            // Close on link click (mobile)
            this.navLinks.forEach(link => {
                link.addEventListener('click', () => {
                    if (window.innerWidth <= 1024) {
                        this.closeSidebar();
                    }
                });
            });

            // Initialize collapsible sections
            this.initCollapsible();

            // Set active link based on current scroll position
            this.initScrollSpy();
        },

        toggleSidebar() {
            this.sidebar?.classList.toggle('active');
            this.overlay?.classList.toggle('active');
            document.body.classList.toggle('sidebar-open');
        },

        closeSidebar() {
            this.sidebar?.classList.remove('active');
            this.overlay?.classList.remove('active');
            document.body.classList.remove('sidebar-open');
        },

        initCollapsible() {
            const headers = document.querySelectorAll('.sidebar-nav-header');
            headers.forEach(header => {
                header.addEventListener('click', () => {
                    const section = header.parentElement;
                    section.classList.toggle('collapsed');
                });
            });
        },

        initScrollSpy() {
            const sections = document.querySelectorAll('section[id]');
            if (!sections.length) return;

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const id = entry.target.getAttribute('id');
                        this.setActiveLink(id);
                    }
                });
            }, {
                rootMargin: '-80px 0px -70% 0px',
                threshold: 0
            });

            sections.forEach(section => observer.observe(section));
        },

        setActiveLink(id) {
            this.navLinks.forEach(link => {
                const href = link.getAttribute('href');
                if (href === `#${id}`) {
                    link.classList.add('active');
                    // Expand parent section if collapsed
                    const section = link.closest('.sidebar-nav-section');
                    if (section) {
                        section.classList.remove('collapsed');
                    }
                } else {
                    link.classList.remove('active');
                }
            });
        }
    };

    // ==========================================
    // Table of Contents (Right Sidebar)
    // ==========================================
    const TOC = {
        init() {
            this.container = document.querySelector('.toc-nav');
            if (!this.container) return;

            this.generateTOC();
            this.initScrollSpy();
        },

        generateTOC() {
            // Get current visible section
            const mainContent = document.querySelector('.main-content');
            if (!mainContent) return;

            // Find all h2 and h3 headings in the current section
            const headings = mainContent.querySelectorAll('h2[id], h3[id]');
            if (!headings.length) return;

            const fragment = document.createDocumentFragment();
            let currentH2 = null;

            headings.forEach(heading => {
                const link = document.createElement('a');
                link.href = `#${heading.id}`;
                link.textContent = heading.textContent;
                link.classList.add('toc-link');

                if (heading.tagName === 'H2') {
                    link.classList.add('toc-h2');
                    currentH2 = link;
                    fragment.appendChild(link);
                } else if (heading.tagName === 'H3') {
                    link.classList.add('toc-h3');
                    fragment.appendChild(link);
                }
            });

            this.container.innerHTML = '';
            this.container.appendChild(fragment);
        },

        initScrollSpy() {
            const headings = document.querySelectorAll('h2[id], h3[id]');
            if (!headings.length) return;

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const id = entry.target.getAttribute('id');
                        this.setActiveLink(id);
                    }
                });
            }, {
                rootMargin: '-80px 0px -70% 0px'
            });

            headings.forEach(heading => observer.observe(heading));
        },

        setActiveLink(id) {
            const links = this.container?.querySelectorAll('.toc-link');
            links?.forEach(link => {
                link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
            });
        }
    };

    // ==========================================
    // Search Functionality
    // ==========================================
    const Search = {
        init() {
            this.modal = document.getElementById('searchModal');
            this.input = document.getElementById('searchInput');
            this.results = document.getElementById('searchResults');
            this.searchBtn = document.getElementById('searchBtn');
            this.closeBtn = this.modal?.querySelector('.search-close');

            this.searchIndex = [];
            this.buildSearchIndex();

            // Open search
            this.searchBtn?.addEventListener('click', () => this.openSearch());

            // Close search
            this.closeBtn?.addEventListener('click', () => this.closeSearch());
            this.modal?.addEventListener('click', (e) => {
                if (e.target === this.modal) this.closeSearch();
            });

            // Keyboard shortcuts
            document.addEventListener('keydown', (e) => {
                // Ctrl/Cmd + K to open search
                if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                    e.preventDefault();
                    this.openSearch();
                }
                // Escape to close
                if (e.key === 'Escape' && this.modal?.classList.contains('active')) {
                    this.closeSearch();
                }
            });

            // Search input handler
            this.input?.addEventListener('input', (e) => {
                this.search(e.target.value);
            });

            // Navigate results with keyboard
            this.input?.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                    e.preventDefault();
                    this.navigateResults(e.key === 'ArrowDown' ? 1 : -1);
                } else if (e.key === 'Enter') {
                    e.preventDefault();
                    this.selectResult();
                }
            });
        },

        buildSearchIndex() {
            // Index all sections with headings
            const sections = document.querySelectorAll('section[id]');
            sections.forEach(section => {
                const heading = section.querySelector('h1, h2');
                const text = section.textContent || '';

                this.searchIndex.push({
                    id: section.id,
                    title: heading?.textContent || section.id,
                    content: text.substring(0, 500),
                    type: this.getSectionType(section.id)
                });
            });

            // Index headings within sections
            const headings = document.querySelectorAll('h2[id], h3[id]');
            headings.forEach(heading => {
                const parent = heading.closest('section[id]');
                this.searchIndex.push({
                    id: heading.id,
                    title: heading.textContent,
                    content: heading.nextElementSibling?.textContent?.substring(0, 200) || '',
                    type: parent ? this.getSectionType(parent.id) : 'general'
                });
            });
        },

        getSectionType(id) {
            if (id.includes('workflow')) return 'workflow';
            if (id.includes('agent')) return 'agent';
            if (id.includes('skill')) return 'skill';
            if (id.includes('command')) return 'command';
            if (id.includes('example')) return 'example';
            return 'docs';
        },

        openSearch() {
            this.modal?.classList.add('active');
            this.input?.focus();
            document.body.style.overflow = 'hidden';
        },

        closeSearch() {
            this.modal?.classList.remove('active');
            if (this.input) this.input.value = '';
            if (this.results) this.results.innerHTML = '';
            document.body.style.overflow = '';
        },

        search(query) {
            if (!query.trim()) {
                this.results.innerHTML = this.renderRecentSearches();
                return;
            }

            const terms = query.toLowerCase().split(' ').filter(t => t);
            const matches = this.searchIndex.filter(item => {
                const text = `${item.title} ${item.content}`.toLowerCase();
                return terms.every(term => text.includes(term));
            }).slice(0, 10);

            this.results.innerHTML = matches.length
                ? this.renderResults(matches, query)
                : '<div class="search-no-results">No results found</div>';
        },

        renderResults(matches, query) {
            return matches.map((item, index) => `
                <a href="#${item.id}" class="search-result ${index === 0 ? 'active' : ''}" data-index="${index}">
                    <span class="search-result-type">${item.type}</span>
                    <span class="search-result-title">${this.highlight(item.title, query)}</span>
                    <span class="search-result-preview">${this.highlight(item.content.substring(0, 100), query)}...</span>
                </a>
            `).join('');
        },

        renderRecentSearches() {
            return `
                <div class="search-hints">
                    <div class="search-hint-title">Quick links</div>
                    <a href="#workflows" class="search-result">
                        <span class="search-result-type">section</span>
                        <span class="search-result-title">Workflows</span>
                    </a>
                    <a href="#agents" class="search-result">
                        <span class="search-result-type">section</span>
                        <span class="search-result-title">Agents</span>
                    </a>
                    <a href="#skills" class="search-result">
                        <span class="search-result-type">section</span>
                        <span class="search-result-title">Skills</span>
                    </a>
                    <a href="#examples" class="search-result">
                        <span class="search-result-type">section</span>
                        <span class="search-result-title">Examples</span>
                    </a>
                </div>
            `;
        },

        highlight(text, query) {
            if (!query) return text;
            const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
            return text.replace(regex, '<mark>$1</mark>');
        },

        navigateResults(direction) {
            const results = this.results?.querySelectorAll('.search-result');
            if (!results?.length) return;

            const current = this.results.querySelector('.search-result.active');
            const currentIndex = current ? parseInt(current.dataset.index || 0) : -1;
            let newIndex = currentIndex + direction;

            if (newIndex < 0) newIndex = results.length - 1;
            if (newIndex >= results.length) newIndex = 0;

            results.forEach((r, i) => r.classList.toggle('active', i === newIndex));
            results[newIndex]?.scrollIntoView({ block: 'nearest' });
        },

        selectResult() {
            const active = this.results?.querySelector('.search-result.active');
            if (active) {
                active.click();
                this.closeSearch();
            }
        }
    };

    // ==========================================
    // Code Blocks - Copy to Clipboard
    // ==========================================
    const CodeBlocks = {
        init() {
            const codeBlocks = document.querySelectorAll('pre code');

            codeBlocks.forEach(block => {
                const pre = block.parentElement;
                if (!pre) return;

                // Create copy button
                const button = document.createElement('button');
                button.className = 'copy-btn';
                button.innerHTML = `
                    <svg class="copy-icon" viewBox="0 0 24 24" width="16" height="16">
                        <path fill="currentColor" d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                    </svg>
                    <svg class="check-icon" viewBox="0 0 24 24" width="16" height="16" style="display:none">
                        <path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                `;
                button.setAttribute('aria-label', 'Copy code');

                button.addEventListener('click', () => this.copyCode(block, button));

                // Wrap pre in container if not already
                if (!pre.parentElement?.classList.contains('code-block')) {
                    const wrapper = document.createElement('div');
                    wrapper.className = 'code-block';
                    pre.parentNode.insertBefore(wrapper, pre);
                    wrapper.appendChild(pre);
                }

                pre.parentElement.appendChild(button);
            });
        },

        async copyCode(block, button) {
            const text = block.textContent;

            try {
                await navigator.clipboard.writeText(text);

                // Show success state
                const copyIcon = button.querySelector('.copy-icon');
                const checkIcon = button.querySelector('.check-icon');

                copyIcon.style.display = 'none';
                checkIcon.style.display = 'block';
                button.classList.add('copied');

                setTimeout(() => {
                    copyIcon.style.display = 'block';
                    checkIcon.style.display = 'none';
                    button.classList.remove('copied');
                }, 2000);
            } catch (err) {
                console.error('Failed to copy:', err);
            }
        }
    };

    // ==========================================
    // Smooth Scrolling
    // ==========================================
    const SmoothScroll = {
        init() {
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', (e) => {
                    const href = anchor.getAttribute('href');
                    if (href === '#') return;

                    const target = document.querySelector(href);
                    if (target) {
                        e.preventDefault();
                        const offset = 80; // Account for fixed header
                        const top = target.getBoundingClientRect().top + window.scrollY - offset;

                        window.scrollTo({
                            top: top,
                            behavior: 'smooth'
                        });

                        // Update URL without scrolling
                        history.pushState(null, null, href);
                    }
                });
            });
        }
    };

    // ==========================================
    // Tabs Component
    // ==========================================
    const Tabs = {
        init() {
            const tabGroups = document.querySelectorAll('.tabs');

            tabGroups.forEach(group => {
                const tabs = group.querySelectorAll('.tab');
                const panels = group.parentElement?.querySelectorAll('.tab-panel');

                tabs.forEach(tab => {
                    tab.addEventListener('click', () => {
                        const target = tab.dataset.tab;

                        // Update tabs
                        tabs.forEach(t => t.classList.remove('active'));
                        tab.classList.add('active');

                        // Update panels
                        panels?.forEach(panel => {
                            panel.classList.toggle('active', panel.dataset.tab === target);
                        });
                    });
                });
            });
        }
    };

    // ==========================================
    // Accordion Component
    // ==========================================
    const Accordion = {
        init() {
            const accordions = document.querySelectorAll('.accordion');

            accordions.forEach(accordion => {
                const headers = accordion.querySelectorAll('.accordion-header');

                headers.forEach(header => {
                    header.addEventListener('click', () => {
                        const item = header.parentElement;
                        const isOpen = item.classList.contains('active');

                        // Close all items in this accordion
                        accordion.querySelectorAll('.accordion-item').forEach(i => {
                            i.classList.remove('active');
                        });

                        // Toggle current
                        if (!isOpen) {
                            item.classList.add('active');
                        }
                    });
                });
            });
        }
    };

    // ==========================================
    // Back to Top Button
    // ==========================================
    const BackToTop = {
        init() {
            const button = document.createElement('button');
            button.className = 'back-to-top';
            button.innerHTML = `
                <svg viewBox="0 0 24 24" width="20" height="20">
                    <path fill="currentColor" d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/>
                </svg>
            `;
            button.setAttribute('aria-label', 'Back to top');
            document.body.appendChild(button);

            // Show/hide based on scroll
            window.addEventListener('scroll', () => {
                button.classList.toggle('visible', window.scrollY > 500);
            });

            // Scroll to top on click
            button.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }
    };

    // ==========================================
    // Responsive Helpers
    // ==========================================
    const Responsive = {
        init() {
            this.handleResize();
            window.addEventListener('resize', () => this.handleResize());
        },

        handleResize() {
            const width = window.innerWidth;
            document.body.classList.toggle('is-mobile', width <= 640);
            document.body.classList.toggle('is-tablet', width > 640 && width <= 1024);
            document.body.classList.toggle('is-desktop', width > 1024);
        }
    };

    // ==========================================
    // External Link Handler
    // ==========================================
    const ExternalLinks = {
        init() {
            document.querySelectorAll('a[href^="http"]').forEach(link => {
                if (!link.href.includes(window.location.host)) {
                    link.setAttribute('target', '_blank');
                    link.setAttribute('rel', 'noopener noreferrer');
                }
            });
        }
    };

    // ==========================================
    // Print Styles Handler
    // ==========================================
    const Print = {
        init() {
            window.addEventListener('beforeprint', () => {
                document.body.classList.add('printing');
            });

            window.addEventListener('afterprint', () => {
                document.body.classList.remove('printing');
            });
        }
    };

    // ==========================================
    // Initialize Everything
    // ==========================================
    function init() {
        ThemeManager.init();
        Sidebar.init();
        TOC.init();
        Search.init();
        CodeBlocks.init();
        SmoothScroll.init();
        Tabs.init();
        Accordion.init();
        BackToTop.init();
        Responsive.init();
        ExternalLinks.init();
        Print.init();

        console.log('Claude Code Kit Documentation initialized');
    }

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Expose API
    window.ClaudeCodeKit = {
        version: '2.0.0',
        theme: ThemeManager,
        search: Search,
        sidebar: Sidebar
    };
})();
