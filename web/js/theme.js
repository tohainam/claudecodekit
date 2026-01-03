/**
 * Claude Code Kit - Theme Toggle
 * Dark/Light mode with smooth transitions
 */

(function() {
    'use strict';

    // Constants
    const STORAGE_KEY = 'claude-code-kit-theme';
    const THEME_DARK = 'dark';
    const THEME_LIGHT = 'light';

    // DOM Elements
    const html = document.documentElement;
    let themeToggle;

    /**
     * Get the initial theme
     * Priority: localStorage > system preference > default (dark)
     */
    function getInitialTheme() {
        // Check localStorage
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored === THEME_LIGHT || stored === THEME_DARK) {
            return stored;
        }

        // Check system preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
            return THEME_LIGHT;
        }

        // Default to dark
        return THEME_DARK;
    }

    /**
     * Set the theme
     */
    function setTheme(theme) {
        html.setAttribute('data-theme', theme);
        localStorage.setItem(STORAGE_KEY, theme);

        // Update toggle button aria-label
        if (themeToggle) {
            const label = theme === THEME_DARK ? 'Switch to light mode' : 'Switch to dark mode';
            themeToggle.setAttribute('aria-label', label);
        }

        // Dispatch custom event
        window.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
    }

    /**
     * Toggle the theme
     */
    function toggleTheme() {
        const current = html.getAttribute('data-theme') || THEME_DARK;
        const next = current === THEME_DARK ? THEME_LIGHT : THEME_DARK;
        setTheme(next);
    }

    /**
     * Initialize theme toggle
     */
    function init() {
        // Set initial theme
        setTheme(getInitialTheme());

        // Get toggle button
        themeToggle = document.getElementById('themeToggle');

        // Add click handler
        if (themeToggle) {
            themeToggle.addEventListener('click', toggleTheme);
        }

        // Listen for system preference changes
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                // Only update if user hasn't set a preference
                if (!localStorage.getItem(STORAGE_KEY)) {
                    setTheme(e.matches ? THEME_DARK : THEME_LIGHT);
                }
            });
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Expose API
    window.ThemeManager = {
        toggle: toggleTheme,
        set: setTheme,
        get: () => html.getAttribute('data-theme') || THEME_DARK,
        isDark: () => (html.getAttribute('data-theme') || THEME_DARK) === THEME_DARK,
        isLight: () => html.getAttribute('data-theme') === THEME_LIGHT
    };
})();
