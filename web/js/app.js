/**
 * Claude Code Kit - Main Application
 * Core functionality and component initialization
 */

(function() {
    'use strict';

    /**
     * Mobile navigation toggle
     */
    function initMobileNav() {
        const mobileToggle = document.getElementById('mobileToggle');
        const navLinks = document.querySelector('.nav-links');

        if (!mobileToggle || !navLinks) return;

        mobileToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            mobileToggle.classList.toggle('active');
        });

        // Close on link click
        navLinks.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                mobileToggle.classList.remove('active');
            });
        });

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (!mobileToggle.contains(e.target) && !navLinks.contains(e.target)) {
                navLinks.classList.remove('active');
                mobileToggle.classList.remove('active');
            }
        });
    }

    /**
     * Category tabs for use cases
     */
    function initCategoryTabs() {
        const tabs = document.querySelectorAll('#categoryTabs .tab');
        const cards = document.querySelectorAll('.use-case-card');

        if (!tabs.length || !cards.length) return;

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Update active tab
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                const category = tab.dataset.category;

                // Filter cards without animation flicker
                cards.forEach(card => {
                    if (category === 'all' || card.dataset.category === category) {
                        card.style.display = '';
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });
    }

    /**
     * Workflow tabs
     */
    function initWorkflowTabs() {
        const tabs = document.querySelectorAll('#workflowTabs .workflow-tab');
        const diagrams = document.querySelectorAll('.workflow-diagram');

        if (!tabs.length || !diagrams.length) return;

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const workflow = tab.dataset.workflow;

                // Update active tab
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                // Show corresponding diagram
                diagrams.forEach(diagram => {
                    if (diagram.dataset.workflow === workflow) {
                        diagram.classList.add('active');
                    } else {
                        diagram.classList.remove('active');
                    }
                });
            });
        });
    }

    /**
     * Accordion functionality
     */
    function initAccordions() {
        const accordionHeaders = document.querySelectorAll('.accordion-header');

        accordionHeaders.forEach(header => {
            header.addEventListener('click', () => {
                const item = header.parentElement;
                const isActive = item.classList.contains('active');

                // Close all
                item.parentElement.querySelectorAll('.accordion-item').forEach(i => {
                    i.classList.remove('active');
                });

                // Toggle current
                if (!isActive) {
                    item.classList.add('active');
                }
            });
        });
    }

    /**
     * Dropdown functionality
     */
    function initDropdowns() {
        const dropdowns = document.querySelectorAll('.dropdown');

        dropdowns.forEach(dropdown => {
            const toggle = dropdown.querySelector('.dropdown-toggle');

            if (toggle) {
                toggle.addEventListener('click', (e) => {
                    e.stopPropagation();
                    dropdown.classList.toggle('active');
                });
            }
        });

        // Close on outside click
        document.addEventListener('click', () => {
            dropdowns.forEach(d => d.classList.remove('active'));
        });
    }

    /**
     * Active navigation highlighting
     */
    function initActiveNav() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link');

        if (!sections.length || !navLinks.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    navLinks.forEach(link => {
                        link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
                    });
                }
            });
        }, {
            rootMargin: '-20% 0px -80% 0px'
        });

        sections.forEach(section => observer.observe(section));
    }

    /**
     * Lazy loading images
     */
    function initLazyLoad() {
        const images = document.querySelectorAll('img[data-src]');

        if (!images.length) return;

        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    }

    /**
     * Handle form submissions
     */
    function initForms() {
        const forms = document.querySelectorAll('form[data-ajax]');

        forms.forEach(form => {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();

                const formData = new FormData(form);
                const submitBtn = form.querySelector('[type="submit"]');

                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.textContent = 'Sending...';
                }

                try {
                    const response = await fetch(form.action, {
                        method: form.method,
                        body: formData
                    });

                    if (response.ok) {
                        form.reset();
                        // Show success message
                    }
                } catch (error) {
                    console.error('Form submission error:', error);
                } finally {
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.textContent = 'Submit';
                    }
                }
            });
        });
    }

    /**
     * Tooltips
     */
    function initTooltips() {
        const tooltipElements = document.querySelectorAll('[data-tooltip]');

        tooltipElements.forEach(el => {
            el.classList.add('tooltip');
        });
    }

    /**
     * Preload critical resources
     */
    function preloadResources() {
        // Preload fonts
        const fonts = [
            'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff2',
            'https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbY2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8yKxjOVGaysQgjxs.woff2'
        ];

        fonts.forEach(font => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'font';
            link.href = font;
            link.crossOrigin = 'anonymous';
            document.head.appendChild(link);
        });
    }

    /**
     * Performance monitoring
     */
    function initPerformanceMonitoring() {
        // Log page load metrics
        window.addEventListener('load', () => {
            if ('performance' in window) {
                const timing = performance.timing;
                const loadTime = timing.loadEventEnd - timing.navigationStart;
                console.log(`Page load time: ${loadTime}ms`);
            }
        });
    }

    /**
     * Service Worker registration (for PWA)
     */
    async function initServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                // Service worker registration would go here
                // await navigator.serviceWorker.register('/sw.js');
            } catch (error) {
                console.log('ServiceWorker registration failed:', error);
            }
        }
    }

    /**
     * Initialize everything
     */
    function init() {
        initMobileNav();
        initCategoryTabs();
        initWorkflowTabs();
        initAccordions();
        initDropdowns();
        initActiveNav();
        initLazyLoad();
        initForms();
        initTooltips();
        preloadResources();
        initPerformanceMonitoring();
        initServiceWorker();

        // Log initialization
        console.log('Claude Code Kit website initialized');
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Expose app API
    window.ClaudeCodeKit = {
        version: '1.0.0',
        init: init
    };
})();
