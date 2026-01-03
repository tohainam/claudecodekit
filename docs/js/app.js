/**
 * Claude Code Kit - Documentation App
 * Interactive navigation, search, and UI components
 */

// DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initSearch();
  initTabs();
  initAccordions();
  initCopyButtons();
  initMobileMenu();
  initScrollSpy();
});

/**
 * Navigation - Smooth scroll and active states
 */
function initNavigation() {
  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });

        // Update URL without scrolling
        history.pushState(null, null, targetId);

        // Close mobile menu if open
        document.querySelector('.sidebar')?.classList.remove('active');
      }
    });
  });
}

/**
 * Search functionality
 */
function initSearch() {
  const searchInput = document.querySelector('.nav-search input');
  const searchResults = document.querySelector('.search-results');

  if (!searchInput || !searchResults) return;

  // Build search index
  const searchIndex = buildSearchIndex();

  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();

    if (query.length < 2) {
      searchResults.classList.remove('active');
      return;
    }

    const results = searchIndex.filter(item =>
      item.title.toLowerCase().includes(query) ||
      item.content.toLowerCase().includes(query) ||
      item.tags.some(tag => tag.toLowerCase().includes(query))
    ).slice(0, 10);

    if (results.length > 0) {
      renderSearchResults(results, searchResults);
      searchResults.classList.add('active');
    } else {
      searchResults.innerHTML = '<div class="search-result-item"><span class="search-result-title">No results found</span></div>';
      searchResults.classList.add('active');
    }
  });

  // Close on click outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-search')) {
      searchResults.classList.remove('active');
    }
  });

  // Keyboard navigation
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      searchResults.classList.remove('active');
      searchInput.blur();
    }
  });
}

function buildSearchIndex() {
  const index = [];

  // Index sections
  document.querySelectorAll('.section[id]').forEach(section => {
    const title = section.querySelector('h2, h3')?.textContent || '';
    const content = section.textContent.slice(0, 500);
    const id = section.id;

    index.push({
      title,
      content,
      id,
      path: `#${id}`,
      tags: extractTags(section)
    });
  });

  // Index cards
  document.querySelectorAll('.card[id]').forEach(card => {
    const title = card.querySelector('.card-title')?.textContent || '';
    const content = card.querySelector('.card-description')?.textContent || '';
    const id = card.id;

    index.push({
      title,
      content,
      id,
      path: `#${id}`,
      tags: extractTags(card)
    });
  });

  return index;
}

function extractTags(element) {
  const tags = [];
  element.querySelectorAll('code, .card-badge').forEach(el => {
    tags.push(el.textContent);
  });
  return tags;
}

function renderSearchResults(results, container) {
  container.innerHTML = results.map(result => `
    <a href="${result.path}" class="search-result-item">
      <div class="search-result-title">${result.title}</div>
      <div class="search-result-path">${result.path}</div>
    </a>
  `).join('');
}

/**
 * Tabs functionality
 */
function initTabs() {
  document.querySelectorAll('.tabs').forEach(tabGroup => {
    const tabs = tabGroup.querySelectorAll('.tab');
    const contents = tabGroup.parentElement.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetId = tab.dataset.tab;

        // Update tab states
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        // Update content visibility
        contents.forEach(content => {
          content.classList.toggle('active', content.id === targetId);
        });
      });
    });
  });
}

/**
 * Accordion functionality
 */
function initAccordions() {
  document.querySelectorAll('.accordion-header').forEach(header => {
    header.addEventListener('click', () => {
      const item = header.parentElement;
      const wasActive = item.classList.contains('active');

      // Close all items in the same accordion
      const accordion = item.parentElement;
      accordion.querySelectorAll('.accordion-item').forEach(i => {
        i.classList.remove('active');
      });

      // Toggle clicked item
      if (!wasActive) {
        item.classList.add('active');
      }
    });
  });
}

/**
 * Copy code buttons
 */
function initCopyButtons() {
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const codeBlock = btn.closest('.code-block');
      const code = codeBlock.querySelector('code')?.textContent || '';

      try {
        await navigator.clipboard.writeText(code);
        const originalText = btn.textContent;
        btn.textContent = 'Copied!';
        btn.style.background = 'var(--color-success)';

        setTimeout(() => {
          btn.textContent = originalText;
          btn.style.background = '';
        }, 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    });
  });
}

/**
 * Mobile menu toggle
 */
function initMobileMenu() {
  const menuBtn = document.querySelector('.mobile-menu-btn');
  const sidebar = document.querySelector('.sidebar');

  if (!menuBtn || !sidebar) return;

  menuBtn.addEventListener('click', () => {
    sidebar.classList.toggle('active');
  });

  // Close on click outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.sidebar') && !e.target.closest('.mobile-menu-btn')) {
      sidebar.classList.remove('active');
    }
  });
}

/**
 * Scroll spy - highlight active nav item
 */
function initScrollSpy() {
  const sections = document.querySelectorAll('.section[id]');
  const navLinks = document.querySelectorAll('.sidebar-nav a');

  if (sections.length === 0 || navLinks.length === 0) return;

  const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -80% 0px',
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;

        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, observerOptions);

  sections.forEach(section => observer.observe(section));
}

/**
 * Syntax highlighting (simple version)
 */
function highlightCode() {
  document.querySelectorAll('pre code').forEach(block => {
    let html = block.innerHTML;

    // Keywords
    const keywords = ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'class', 'import', 'export', 'from', 'async', 'await', 'try', 'catch'];
    keywords.forEach(kw => {
      html = html.replace(new RegExp(`\\b${kw}\\b`, 'g'), `<span class="token keyword">${kw}</span>`);
    });

    // Strings
    html = html.replace(/(["'`])(?:(?!\1)[^\\]|\\.)*?\1/g, '<span class="token string">$&</span>');

    // Comments
    html = html.replace(/\/\/.*$/gm, '<span class="token comment">$&</span>');
    html = html.replace(/\/\*[\s\S]*?\*\//g, '<span class="token comment">$&</span>');

    // Numbers
    html = html.replace(/\b\d+\.?\d*\b/g, '<span class="token number">$&</span>');

    block.innerHTML = html;
  });
}

// Run syntax highlighting
highlightCode();

/**
 * Theme toggle (for future light mode support)
 */
function toggleTheme() {
  document.body.classList.toggle('light-mode');
  localStorage.setItem('theme', document.body.classList.contains('light-mode') ? 'light' : 'dark');
}

// Load saved theme
if (localStorage.getItem('theme') === 'light') {
  document.body.classList.add('light-mode');
}
