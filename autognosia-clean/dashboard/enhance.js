/**
 * Autognosia // Command Deck — Enhancements
 * Theme toggle, UI polish, keyboard shortcuts.
 */

(function() {
  'use strict';

  // ── Theme Toggle ─────────────────────────────────────────────────────────
  function initThemeToggle() {
    const toggle = document.getElementById('theme-toggle');
    if (!toggle) return;

    const moonSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
    const sunSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>';

    // Set initial icon based on current theme
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    toggle.innerHTML = isDark ? sunSvg : moonSvg;

    toggle.addEventListener('click', () => {
      const html = document.documentElement;
      const currentlyDark = html.getAttribute('data-theme') === 'dark';
      const next = currentlyDark ? 'light' : 'dark';
      html.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
      toggle.innerHTML = next === 'dark' ? sunSvg : moonSvg;
    });
  }

  // ── Keyboard Shortcuts ──────────────────────────────────────────────────
  function initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Cmd/Ctrl+K for search focus
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const search = document.getElementById('global-search');
        if (search) search.focus();
      }
      // Escape to close modals
      if (e.key === 'Escape') {
        document.querySelectorAll('[open]').forEach(el => el.removeAttribute('open'));
      }
    });
  }

  // ── Init ────────────────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    initThemeToggle();
    initKeyboardShortcuts();
  });
})();
