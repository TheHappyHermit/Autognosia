/* ============================================================================
   Autognosia Command Deck — Enhancement Layer
   Wires the redesigned shell's new surfaces (command palette, freshness
   stamps, live regions, empty-state actions) onto the base CommandDeck app.
   Loaded AFTER app.js. Everything is defensive: missing nodes are skipped.
   ========================================================================== */
(function () {
  'use strict';

  const $ = (id) => document.getElementById(id);

  /* ── Freshness stamps ─────────────────────────────────────────────────
     Every panel footer gets "updated Xs ago"; amber + "stale" after 90s. */
  const freshnessTargets = [
    { el: $('briefing-freshness'), label: 'briefing' },
    { el: $('cal-freshness-text'), label: 'calendar' },
  ].filter((t) => t.el);

  function stampFresh() {
    const now = new Date();
    for (const t of freshnessTargets) {
      t.lastUpdate = now;
      render(t);
    }
  }
  function render(t) {
    if (!t.lastUpdate) return;
    const age = Math.round((Date.now() - t.lastUpdate.getTime()) / 1000);
    if (age > 90) {
      t.el.textContent = 'stale';
      t.el.classList.add('is-stale');
    } else {
      t.el.textContent = `updated ${age}s ago`;
      t.el.classList.remove('is-stale');
    }
  }
  setInterval(() => freshnessTargets.forEach(render), 5000);
  stampFresh();
  // Refresh the stamps whenever the base app refetches (it re-renders panels).
  const overviewEl = $('briefing-summary');
  if (overviewEl && window.MutationObserver) {
    new MutationObserver(() => stampFresh()).observe(overviewEl, { childList: true });
  }

  /* ── Command palette (⌘K) ─────────────────────────────────────────── */
  const palette = $('command-palette');
  const paletteSearch = $('palette-search');
  const paletteResults = $('palette-results');

  const commands = [
    { id: 'new-task', label: 'New task', hint: 'create', group: 'Create', run: () => focusQuickAdd() },
    { id: 'new-intention', label: 'New intention', hint: 'IF-THEN rule', group: 'Create', run: () => focusSection('intentions') },
    { id: 'new-reminder', label: 'New reminder', hint: 'timed alert', group: 'Create', run: () => focusSection('comms') },
    { id: 'view-all-tasks', label: 'View all tasks', hint: 'organizer', group: 'Navigate', run: () => focusSection('tasks') },
    { id: 'goto-calendar', label: 'Go to calendar', hint: 'schedule', group: 'Navigate', run: () => focusSection('calendar') },
    { id: 'goto-comms', label: 'Go to comms radar', hint: 'email', group: 'Navigate', run: () => focusSection('comms') },
    { id: 'goto-intentions', label: 'Go to intentions', hint: 'prospective memory', group: 'Navigate', run: () => focusSection('intentions') },
    { id: 'open-telemetry', label: 'Open telemetry', hint: 'system health', group: 'Navigate', run: () => { const b = $('btn-telemetry'); if (b) b.click(); } },
    { id: 'open-chat', label: 'Open copilot chat', hint: 'talk to Hermes', group: 'Navigate', run: () => { const b = $('btn-toggle-chat') || $('btn-close-chat'); if (b) b.click(); } },
    { id: 'search-wiki', label: 'Search the wiki', hint: 'second brain', group: 'Navigate', run: () => focusSection('wiki') },
  ];

  function focusQuickAdd() {
    const el = $('quick-task-input') || $('briefing-prompt-text') || $('chat-input');
    focusSection('tasks');
    if (el) { el.focus(); el.scrollIntoView({ block: 'center', behavior: 'smooth' }); }
  }
  function focusSection(name) {
    const sec = document.querySelector(`.panel-${name}`) || document.querySelector(`[data-panel="${name}"]`);
    if (sec) sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  let paletteIdx = 0;
  let visible = [];

  function openPalette() {
    if (!palette) return;
    if (typeof palette.showModal === 'function') palette.showModal();
    else palette.setAttribute('open', '');
    paletteSearch.value = '';
    renderPalette('');
    paletteSearch.focus();
  }
  function closePalette() {
    if (!palette) return;
    if (typeof palette.close === 'function') palette.close();
    else palette.removeAttribute('open');
  }
  function renderPalette(q) {
    if (!paletteResults) return;
    const needle = q.trim().toLowerCase();
    visible = commands.filter(
      (c) => !needle || c.label.toLowerCase().includes(needle) || (c.hint || '').toLowerCase().includes(needle)
    );
    paletteIdx = Math.min(paletteIdx, Math.max(0, visible.length - 1));
    paletteResults.innerHTML = visible.length
      ? visible
          .map((c, i) => `
            <div class="palette-item ${i === paletteIdx ? 'is-selected' : ''}" role="option"
                 aria-selected="${i === paletteIdx}" data-cmd="${c.id}">
              <span class="palette-item__label">${c.label}</span>
              <span class="palette-item__hint">${c.hint || ''}</span>
              <span class="palette-item__group">${c.group}</span>
            </div>`)
          .join('')
      : '<div class="palette-empty">No matching commands — try "task", "calendar"…</div>';
  }
  function runCommand(id) {
    const cmd = commands.find((c) => c.id === id);
    closePalette();
    if (cmd) cmd.run();
  }

  if (palette) {
    $('btn-palette-trigger')?.addEventListener('click', openPalette);
    paletteSearch?.addEventListener('input', () => { paletteIdx = 0; renderPalette(paletteSearch.value); });
    paletteSearch?.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); paletteIdx = Math.min(paletteIdx + 1, visible.length - 1); renderPalette(paletteSearch.value); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); paletteIdx = Math.max(paletteIdx - 1, 0); renderPalette(paletteSearch.value); }
      else if (e.key === 'Enter') { e.preventDefault(); const c = visible[paletteIdx]; if (c) runCommand(c.id); }
    });
    paletteResults?.addEventListener('click', (e) => {
      const item = e.target.closest('[data-cmd]');
      if (item) runCommand(item.dataset.cmd);
    });
    document.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); openPalette(); }
    });
  }

  // Empty-state / inline buttons that request palette commands.
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-palette-cmd]');
    if (trigger) runCommand(trigger.dataset.paletteCmd);
  });

  /* ── aria-live announcer ──────────────────────────────────────────── */
  const liveRegion = $('live-region');
  window.announce = function (msg) {
    if (liveRegion) {
      liveRegion.textContent = '';
      setTimeout(() => { liveRegion.textContent = msg; }, 30);
    }
  };

  /* ── Toasts with undo (optimistic mutation feedback) ──────────────── */
  function toast(message, undoFn) {
    const host = document.createElement('div');
    host.className = 'toast';
    host.setAttribute('role', 'status');
    host.innerHTML = `<span class="toast__msg"></span>${undoFn ? '<button class="toast__undo btn btn--ghost btn--sm">Undo</button>' : ''}`;
    host.querySelector('.toast__msg').textContent = message;
    document.body.appendChild(host);
    requestAnimationFrame(() => host.classList.add('is-visible'));
    const kill = () => { host.classList.remove('is-visible'); setTimeout(() => host.remove(), 250); };
    if (undoFn) host.querySelector('.toast__undo').addEventListener('click', () => { undoFn(); kill(); });
    setTimeout(kill, 4500);
  }
  window.deckToast = toast;

  /* Announce background refreshes politely. */
  if (overviewEl && window.MutationObserver) {
    let first = true;
    new MutationObserver(() => { if (!first) { if (window.announce) window.announce('Dashboard data refreshed'); } first = false; })
      .observe(overviewEl, { childList: true });
  }
})();

/* ── Telemetry panel: populate the metric tiles ───────────────────────
   The base app renders full telemetry into its drawer (telemetry-body);
   the redesigned shell shows a compact grid. We fill the grid from
   /api/overview + /api/telemetry and refresh alongside the base poll. */
(function () {
  const grid = document.getElementById('telemetry-grid');
  if (!grid) return;

  function tile(label, value, sub) {
    return `<div class="telemetry-metric">
      <div class="telemetry-metric__value">${value}</div>
      <div class="telemetry-metric__label">${label}</div>
      ${sub ? `<div class="telemetry-metric__sub">${sub}</div>` : ''}
    </div>`;
  }

  async function refresh() {
    try {
      const [ov, tl] = await Promise.all([
        fetch('/api/overview').then((r) => r.json()),
        fetch('/api/telemetry').then((r) => r.json()).catch(() => null),
      ]);
      const containers = tl?.containers || [];
      const up = containers.filter((c) => /^up/i.test(c.status)).length;
      const ops = ov?.stats?.operations_count ?? '—';
      const tasks = ov?.stats?.active_tasks ?? '—';
      grid.innerHTML =
        tile('Active tasks', tasks) +
        tile('Operations logged', Number(ops).toLocaleString()) +
        tile('Containers up', `${up}/${containers.length}`) +
        tile('Intentions armed', ov?.stats?.active_intentions ?? 0);
    } catch (_) {
      /* keep skeletons on failure; next tick retries */
    }
  }
  refresh();
  setInterval(refresh, 30000);
})();
