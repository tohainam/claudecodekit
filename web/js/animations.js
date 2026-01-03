/**
 * Claude Code Kit - Scroll Animations
 * Intersection Observer based animations
 */

(function() {
    'use strict';

    // Configuration
    const config = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    // Typing effect texts
    const typingTexts = [
        '/brainstorm user-authentication',
        '/run feature user-auth',
        'Generating specs...',
        'Research complete!',
        '/run bugfix login-error',
        'Bug fixed & tested!'
    ];

    let typingIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingElement;

    /**
     * Initialize scroll animations
     */
    function initScrollAnimations() {
        const animatedElements = document.querySelectorAll('[data-animate]');

        if (!animatedElements.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                    // Optionally unobserve after animating
                    // observer.unobserve(entry.target);
                }
            });
        }, config);

        animatedElements.forEach(el => observer.observe(el));
    }

    /**
     * Initialize navigation scroll effect
     */
    function initNavScroll() {
        const nav = document.getElementById('nav');
        if (!nav) return;

        let lastScroll = 0;

        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;

            if (currentScroll > 50) {
                nav.classList.add('scrolled');
            } else {
                nav.classList.remove('scrolled');
            }

            lastScroll = currentScroll;
        }, { passive: true });
    }

    /**
     * Typing effect
     */
    function type() {
        if (!typingElement) return;

        const currentText = typingTexts[typingIndex];
        const displayText = isDeleting
            ? currentText.substring(0, charIndex - 1)
            : currentText.substring(0, charIndex + 1);

        // Always show at least a space to maintain height
        typingElement.innerHTML = displayText || '&nbsp;';
        charIndex = isDeleting ? charIndex - 1 : charIndex + 1;

        let typeSpeed = isDeleting ? 30 : 50;

        if (!isDeleting && charIndex === currentText.length) {
            typeSpeed = 2000; // Pause at end
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            typingIndex = (typingIndex + 1) % typingTexts.length;
            typeSpeed = 300; // Pause before next
        }

        setTimeout(type, typeSpeed);
    }

    /**
     * Initialize typing effect
     */
    function initTypingEffect() {
        typingElement = document.getElementById('heroCode');
        if (typingElement) {
            setTimeout(type, 1000);
        }
    }

    /**
     * Smooth scroll for anchor links
     */
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    const navHeight = document.getElementById('nav')?.offsetHeight || 0;
                    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight - 20;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    /**
     * Parallax effect for hero
     */
    function initParallax() {
        const heroGrid = document.querySelector('.hero-grid');
        if (!heroGrid) return;

        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            heroGrid.style.transform = `translateY(${scrolled * 0.3}px)`;
        }, { passive: true });
    }

    /**
     * Copy to clipboard
     */
    function initCopyButtons() {
        document.querySelectorAll('.copy-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const text = btn.getAttribute('data-copy');
                if (!text) return;

                try {
                    await navigator.clipboard.writeText(text);

                    // Visual feedback
                    const originalHTML = btn.innerHTML;
                    btn.innerHTML = `
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                    `;
                    btn.style.color = 'var(--green)';

                    setTimeout(() => {
                        btn.innerHTML = originalHTML;
                        btn.style.color = '';
                    }, 2000);
                } catch (err) {
                    console.error('Failed to copy:', err);
                }
            });
        });
    }

    /**
     * Counter animation
     */
    function animateCounters() {
        const counters = document.querySelectorAll('.stat-value');

        counters.forEach(counter => {
            const target = parseInt(counter.textContent);
            const duration = 1500;
            const startTime = performance.now();

            function update(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);

                // Easing function
                const easeOut = 1 - Math.pow(1 - progress, 3);
                const current = Math.floor(target * easeOut);

                counter.textContent = current;

                if (progress < 1) {
                    requestAnimationFrame(update);
                } else {
                    counter.textContent = target;
                }
            }

            // Start when visible
            const observer = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting) {
                    requestAnimationFrame(update);
                    observer.disconnect();
                }
            }, { threshold: 0.5 });

            observer.observe(counter);
        });
    }

    /**
     * Ripple effect for buttons
     */
    function initRippleEffect() {
        document.querySelectorAll('.btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                const ripple = document.createElement('span');
                ripple.classList.add('ripple');

                const rect = this.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;

                ripple.style.width = ripple.style.height = size + 'px';
                ripple.style.left = x + 'px';
                ripple.style.top = y + 'px';

                this.appendChild(ripple);

                setTimeout(() => ripple.remove(), 600);
            });
        });
    }

    /**
     * Initialize all animations
     */
    function init() {
        initScrollAnimations();
        initNavScroll();
        initTypingEffect();
        initSmoothScroll();
        initParallax();
        initCopyButtons();
        animateCounters();
        initRippleEffect();
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Expose for debugging
    window.Animations = {
        reinit: init
    };
})();
