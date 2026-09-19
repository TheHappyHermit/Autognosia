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
    { id: 'goto-dashboard', label: 'Go to Dashboard Overview', hint: 'main overview', group: 'Navigate', run: () => window.commandDeck?.showView('dashboard') },
    { id: 'goto-tasks', label: 'Go to Tasks & Pipeline', hint: 'kanban / list', group: 'Navigate', run: () => window.commandDeck?.showView('tasks') },
    { id: 'goto-calendar', label: 'Go to Calendar', hint: 'schedule & events', group: 'Navigate', run: () => window.commandDeck?.showView('calendar') },
    { id: 'goto-services', label: 'Go to Services', hint: 'media & queues', group: 'Navigate', run: () => window.commandDeck?.showView('services') },
    { id: 'goto-homelab', label: 'Go to Home Lab', hint: 'servers & docker', group: 'Navigate', run: () => window.commandDeck?.showView('homelab') },
    { id: 'goto-system', label: 'Go to System', hint: 'cpu, telemetry & cron', group: 'Navigate', run: () => window.commandDeck?.showView('system') },
    { id: 'goto-homeassistant', label: 'Go to Smart Home', hint: 'home assistant entities', group: 'Navigate', run: () => window.commandDeck?.showView('homeassistant') },
    { id: 'goto-n8n', label: 'Go to Automations', hint: 'n8n workflow orchestrator', group: 'Navigate', run: () => window.commandDeck?.showView('n8n') },
    { id: 'goto-agents', label: 'Go to Agents & Chat', hint: 'Hermes bots', group: 'Navigate', run: () => window.commandDeck?.showView('agents') },
    { id: 'goto-vault', label: 'Go to Knowledge Vault', hint: 'wiki & graph', group: 'Navigate', run: () => window.commandDeck?.showView('vault') },
    { id: 'goto-markets', label: 'Go to Financial Markets', hint: 'yfinance candlestick charts', group: 'Navigate', run: () => window.commandDeck?.showView('markets') },

    { id: 'new-task', label: 'New Task', hint: 'create task', group: 'Create', run: () => window.commandDeck?.openCreateModal('task') },
    { id: 'new-intention', label: 'New Intention', hint: 'IF-THEN rule', group: 'Create', run: () => window.commandDeck?.openCreateModal('intention') },
    { id: 'new-reminder', label: 'New Reminder', hint: 'timed alert', group: 'Create', run: () => window.commandDeck?.openCreateModal('reminder') },

    { id: 'consolidate-memory', label: 'Open Hot Memory Console', hint: 'MEMORY.md, USER.md, SOUL.md', group: 'Actions', run: () => window.commandDeck?.openMemoryEditorModal() },
    { id: 'toggle-agent-canvas', label: 'Toggle Agent Execution Canvas', hint: 'live preview & artifacts', group: 'Actions', run: () => window.botsPage?.toggleCanvas() },
    { id: 'open-notifications', label: 'Open Notification Center', hint: 'alerts & cron', group: 'Actions', run: () => document.getElementById('btn-notifications')?.click() },
    { id: 'read-briefing', label: 'Read Daily Briefing Aloud', hint: 'speech synthesis', group: 'Actions', run: () => document.getElementById('btn-read-briefing')?.click() },
    { id: 'reset-graph', label: 'Reset Knowledge Graph View', hint: 're-center canvas', group: 'Actions', run: () => document.getElementById('btn-graph-reset')?.click() },
    { id: 'toggle-theme', label: 'Toggle Light / Dark Mode', hint: 'appearance', group: 'Actions', run: () => window.commandDeck?.toggleTheme() },
    { id: 'refresh-data', label: 'Refresh All Deck Data', hint: 'poll now', group: 'Actions', run: () => window.commandDeck?.refreshAllData() },
    { id: 'search-wiki', label: 'Search Knowledge Vault', hint: 'second brain', group: 'Actions', run: () => { window.commandDeck?.showView('vault'); setTimeout(() => document.getElementById('wiki-search-input')?.focus(), 80); } },
  ];

  let paletteIdx = 0;
  let visible = [];

  function openPalette() {
    if (!palette) return;
    if (typeof palette.showModal === 'function') {
      try { palette.showModal(); } catch (_) { palette.setAttribute('open', ''); }
    } else {
      palette.setAttribute('open', '');
    }
    if (paletteSearch) {
      paletteSearch.value = '';
      renderPalette('');
      setTimeout(() => paletteSearch.focus(), 50);
    }
  }
  function closePalette() {
    if (!palette) return;
    if (typeof palette.close === 'function') {
      try { palette.close(); } catch (_) { palette.removeAttribute('open'); }
    } else {
      palette.removeAttribute('open');
    }
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
      : '<div class="palette-empty">No matching commands — try "task", "calendar", "memory"…</div>';
  }
  function runCommand(id) {
    const cmd = commands.find((c) => c.id === id);
    closePalette();
    if (cmd && typeof cmd.run === 'function') cmd.run();
  }

  if (palette) {
    $('btn-palette-trigger')?.addEventListener('click', openPalette);
    paletteSearch?.addEventListener('input', () => { paletteIdx = 0; renderPalette(paletteSearch.value); });
    paletteSearch?.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); paletteIdx = Math.min(paletteIdx + 1, visible.length - 1); renderPalette(paletteSearch.value); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); paletteIdx = Math.max(paletteIdx - 1, 0); renderPalette(paletteSearch.value); }
      else if (e.key === 'Enter') { e.preventDefault(); const c = visible[paletteIdx]; if (c) runCommand(c.id); }
      else if (e.key === 'Escape') { e.preventDefault(); closePalette(); }
    });
    paletteResults?.addEventListener('click', (e) => {
      const item = e.target.closest('[data-cmd]');
      if (item) runCommand(item.dataset.cmd);
    });
    palette.addEventListener('click', (e) => {
      if (e.target === palette || e.target.classList.contains('command-palette__overlay')) {
        closePalette();
      }
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
