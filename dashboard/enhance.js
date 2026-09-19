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
    { id: 'goto-system', label: 'Go to System Settings', hint: 'settings, credentials & financial APIs', group: 'Navigate', run: () => window.commandDeck?.showView('system') },
    { id: 'goto-homeassistant', label: 'Go to Smart Home', hint: 'home assistant entities', group: 'Navigate', run: () => window.commandDeck?.showView('homeassistant') },
    { id: 'goto-n8n', label: 'Go to Automations', hint: 'n8n workflow orchestrator', group: 'Navigate', run: () => window.commandDeck?.showView('n8n') },
    { id: 'goto-agents', label: 'Go to Agents & Chat', hint: 'Hermes bots', group: 'Navigate', run: () => window.commandDeck?.showView('agents') },
    { id: 'goto-vault', label: 'Go to Knowledge Vault', hint: 'wiki & graph', group: 'Navigate', run: () => window.commandDeck?.showView('vault') },
    { id: 'goto-markets', label: 'Go to Financial Markets', hint: 'yfinance candlestick charts', group: 'Navigate', run: () => window.commandDeck?.showView('markets') },

    // Homelab Service Jumps
    { id: 'goto-deerflow', label: 'Go to DeerFlow (Deep Research)', hint: 'homelab app', group: 'Homelab', run: () => window.commandDeck?.showView('deerflow') },
    { id: 'goto-vane', label: 'Go to Vane / Perplexica (Search Engine)', hint: 'homelab app', group: 'Homelab', run: () => window.commandDeck?.showView('vane') },
    { id: 'goto-openwebui', label: 'Go to OpenWebUI', hint: 'homelab app', group: 'Homelab', run: () => window.commandDeck?.showView('openwebui') },
    { id: 'goto-audiobookshelf', label: 'Go to Audiobookshelf', hint: 'homelab app', group: 'Homelab', run: () => window.commandDeck?.showView('audiobookshelf') },
    { id: 'goto-booklore', label: 'Go to BookLore (Calibre-Web)', hint: 'homelab app', group: 'Homelab', run: () => window.commandDeck?.showView('booklore') },
    { id: 'goto-immich', label: 'Go to Immich (Photos)', hint: 'homelab app', group: 'Homelab', run: () => window.commandDeck?.showView('immich') },
    { id: 'goto-nextcloud', label: 'Go to Nextcloud (Private Cloud)', hint: 'homelab app', group: 'Homelab', run: () => window.commandDeck?.showView('nextcloud') },
    { id: 'goto-seer', label: 'Go to Seer (Media Requests)', hint: 'homelab app', group: 'Homelab', run: () => window.commandDeck?.showView('seer') },
    { id: 'goto-freshrss', label: 'Go to FreshRSS (Feeds)', hint: 'homelab app', group: 'Homelab', run: () => window.commandDeck?.showView('freshrss') },

    // Cognitive Decks & Autonomous Research
    { id: 'action-epistemic', label: 'Open Epistemic Truth Ledger', hint: 'disputed claims & evidence', group: 'Cognitive', run: () => { window.commandDeck?.showView('vault'); setTimeout(() => document.getElementById('vault-epistemic-deck')?.scrollIntoView({behavior:'smooth'}), 100); } },
    { id: 'action-research-queue', label: 'Open Autonomous Research Pipeline', hint: 'frontier topics', group: 'Cognitive', run: () => { window.commandDeck?.showView('vault'); setTimeout(() => document.getElementById('vault-research-pipeline')?.scrollIntoView({behavior:'smooth'}), 100); } },
    { id: 'action-experience-inspector', label: 'Open Agent Experience Inspector', hint: 'autognosia.db cognitive traces', group: 'Cognitive', run: () => { window.commandDeck?.showView('agents'); setTimeout(() => document.getElementById('btn-toggle-experience')?.click(), 100); } },
    { id: 'action-voice-copilot', label: 'Activate Voice Copilot', hint: 'listen & speak', group: 'Actions', run: () => document.getElementById('btn-voice-copilot')?.click() },
    { id: 'action-probe-homelab-mesh', label: 'Probe Homelab 11-Service Mesh', hint: 'ping & latency audit', group: 'Homelab', run: () => { window.commandDeck?.showView('homelab'); setTimeout(() => document.getElementById('btn-refresh-mesh')?.click(), 100); } },

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
  let activeDynamicCmds = [];

  function renderPalette(q) {
    if (!paletteResults) return;
    const raw = q.trim();
    const needle = raw.toLowerCase();

    let dynamicCommands = [];
    if (raw.startsWith('$') && raw.length > 1) {
      const ticker = raw.substring(1).toUpperCase();
      dynamicCommands.push({
        id: `ticker-${ticker}`,
        label: `Analyze $${ticker} on Financial Markets`,
        hint: `Open candlestick chart for ${ticker}`,
        group: 'Markets',
        run: () => {
          window.commandDeck?.showView('markets');
          setTimeout(() => window.commandDeck?.loadTickerChart(ticker), 100);
        }
      });
    }

    if (raw.startsWith('/task')) {
      const title = raw.replace(/^\/task\s*/i, '').trim();
      dynamicCommands.push({
        id: 'cmd-slash-task',
        label: title ? `Create Task: "${title}"` : 'Create Task (/task <title>)',
        hint: 'Quick-create task in pipeline',
        group: 'Actions',
        run: async () => {
          if (!title) {
            window.commandDeck?.openCreateModal('task');
            return;
          }
          try {
            const res = await fetch(`${window.location.origin}/api/tasks`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ title, status: 'todo' })
            });
            if (res.ok) {
              window.commandDeck?.showToast?.(`Task created: ${title}`, 'success');
              if (window.commandDeck?.fetchTasks) window.commandDeck.fetchTasks();
            }
          } catch (e) {
            window.commandDeck?.showToast?.(`Task error: ${e.message}`, 'error');
          }
        }
      });
    }

    if (raw.startsWith('/ha')) {
      const arg = raw.replace(/^\/ha\s*/i, '').trim();
      dynamicCommands.push({
        id: 'cmd-slash-ha',
        label: arg ? `Home Assistant: "${arg}"` : 'Home Assistant (/ha <entity>)',
        hint: 'Switch to Smart Home view',
        group: 'Smart Home',
        run: () => {
          window.commandDeck?.showView('homeassistant');
        }
      });
    }

    if (raw.startsWith('/n8n')) {
      const actionId = raw.replace(/^\/n8n\s*/i, '').trim();
      dynamicCommands.push({
        id: 'cmd-slash-n8n',
        label: actionId ? `Trigger n8n Workflow: "${actionId}"` : 'Trigger n8n Automation (/n8n <id>)',
        hint: 'Dispatch workflow execution',
        group: 'Automations',
        run: () => {
          if (actionId) {
            window.commandDeck?.triggerN8nQuickAction?.(actionId);
          } else {
            window.commandDeck?.showView('n8n');
          }
        }
      });
    }

    if (raw.startsWith('/market')) {
      const sym = raw.replace(/^\/market\s*/i, '').trim().toUpperCase();
      dynamicCommands.push({
        id: 'cmd-slash-market',
        label: sym ? `Analyze $${sym} on Financial Markets` : 'Analyze Market (/market <symbol>)',
        hint: 'Open candlestick chart',
        group: 'Markets',
        run: () => {
          window.commandDeck?.showView('markets');
          if (sym) setTimeout(() => window.commandDeck?.loadTickerChart(sym), 100);
        }
      });
    }

    if (raw.startsWith('/note')) {
      const noteRaw = raw.replace(/^\/note\s*/i, '').trim();
      const parts = noteRaw.split('|');
      const title = (parts[0] || '').trim();
      const content = (parts[1] || '').trim();
      dynamicCommands.push({
        id: 'cmd-slash-note',
        label: title ? `Save Note to Active Wiki: "${title}"` : 'Save Note (/note <title> | <content>)',
        hint: 'Direct markdown creation in active-wiki/',
        group: 'Knowledge',
        run: () => {
          if (title) {
            window.commandDeck?.createQuickVaultNote?.(title, content);
          } else {
            window.commandDeck?.showView('vault');
          }
        }
      });
    }

    activeDynamicCmds = dynamicCommands;
    const allCmds = [...dynamicCommands, ...commands];
    visible = allCmds.filter(
      (c) => !needle || c.label.toLowerCase().includes(needle) || (c.hint || '').toLowerCase().includes(needle) || (c.group || '').toLowerCase().includes(needle)
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
      : '<div class="palette-empty">No matching commands — try "task", "calendar", "memory", "$NVDA"…</div>';
  }
  function runCommand(id) {
    let cmd = commands.find((c) => c.id === id) || activeDynamicCmds.find((c) => c.id === id);
    if (!cmd && id && id.startsWith('ticker-')) {
      const ticker = id.replace('ticker-', '');
      cmd = {
        run: () => {
          window.commandDeck?.showView('markets');
          setTimeout(() => window.commandDeck?.loadTickerChart(ticker), 100);
        }
      };
    }
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

  /* ── Executive Widget Pinning (Dashboard Top Quick-Pins) ────────── */
  const pinnedStorageKey = 'autognosia_pinned_widgets';
  let pinnedWidgets = new Set();
  try {
    const saved = JSON.parse(localStorage.getItem(pinnedStorageKey) || '[]');
    pinnedWidgets = new Set(saved);
  } catch (_) {}

  function updatePinButtons() {
    $('btn-pin-homelab-mesh')?.classList.toggle('active', pinnedWidgets.has('mesh'));
    $('btn-pin-markets')?.classList.toggle('active', pinnedWidgets.has('markets'));
    $('btn-pin-epistemic')?.classList.toggle('active', pinnedWidgets.has('epistemic'));
  }

  function esc(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function renderPinnedWidgets() {
    const container = $('dashboard-pinned-widgets');
    if (!container) return;
    updatePinButtons();

    if (pinnedWidgets.size === 0) {
      container.innerHTML = '';
      container.style.display = 'none';
      return;
    }

    container.style.display = 'block';
    let html = '<div style="display:flex; flex-direction:column; gap:var(--space-3); margin-top:var(--space-2);">';

    if (pinnedWidgets.has('mesh')) {
      html += `
        <div class="panel" style="margin:0;">
          <div class="panel-header" style="display:flex; justify-content:space-between; align-items:center;">
            <div class="panel-title" style="display:flex; align-items:center; gap:8px;">
              <span>🌐 Pinned: Homelab Service Mesh</span>
            </div>
            <div style="display:flex; gap:6px; align-items:center;">
              <button class="btn btn--ghost btn--sm btn-unpin-widget" data-widget="mesh" title="Unpin widget">✕ Unpin</button>
              <button class="btn btn--ghost btn--sm" onclick="window.commandDeck?.showView('homelab')">Open Homelab ➔</button>
            </div>
          </div>
          <div class="panel-body" style="padding:12px;">
            <div id="pinned-mesh-container">
              <div class="agent-loading">Loading live mesh status...</div>
            </div>
          </div>
        </div>
      `;
    }

    if (pinnedWidgets.has('markets')) {
      html += `
        <div class="panel" style="margin:0;">
          <div class="panel-header" style="display:flex; justify-content:space-between; align-items:center;">
            <div class="panel-title" style="display:flex; align-items:center; gap:8px;">
              <span>📈 Pinned: Financial Markets Pulse</span>
            </div>
            <div style="display:flex; gap:6px; align-items:center;">
              <button class="btn btn--ghost btn--sm btn-unpin-widget" data-widget="markets" title="Unpin widget">✕ Unpin</button>
              <button class="btn btn--ghost btn--sm" onclick="window.commandDeck?.showView('markets')">Open Markets ➔</button>
            </div>
          </div>
          <div class="panel-body" style="padding:12px;">
            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(130px, 1fr)); gap:8px;" id="pinned-markets-container">
              <div style="background:var(--bg-secondary); border:1px solid var(--border-subtle); border-radius:4px; padding:8px 10px;">
                <div style="font-size:0.7rem; color:var(--text-3);">S&P 500</div>
                <div style="font-weight:700; font-size:0.95rem; color:var(--text-1); margin-top:2px;">^GSPC</div>
                <div style="font-size:0.75rem; color:var(--emerald, #10b981);">5,648.40 (+0.42%)</div>
              </div>
              <div style="background:var(--bg-secondary); border:1px solid var(--border-subtle); border-radius:4px; padding:8px 10px;">
                <div style="font-size:0.7rem; color:var(--text-3);">NASDAQ 100</div>
                <div style="font-weight:700; font-size:0.95rem; color:var(--text-1); margin-top:2px;">^IXIC</div>
                <div style="font-size:0.75rem; color:var(--emerald, #10b981);">17,845.20 (+0.65%)</div>
              </div>
              <div style="background:var(--bg-secondary); border:1px solid var(--border-subtle); border-radius:4px; padding:8px 10px;">
                <div style="font-size:0.7rem; color:var(--text-3);">Bitcoin</div>
                <div style="font-weight:700; font-size:0.95rem; color:var(--text-1); margin-top:2px;">BTC-USD</div>
                <div style="font-size:0.75rem; color:var(--emerald, #10b981);">$64,120.00 (+1.85%)</div>
              </div>
              <div style="background:var(--bg-secondary); border:1px solid var(--border-subtle); border-radius:4px; padding:8px 10px;">
                <div style="font-size:0.7rem; color:var(--text-3);">NVIDIA</div>
                <div style="font-weight:700; font-size:0.95rem; color:var(--text-1); margin-top:2px;">NVDA</div>
                <div style="font-size:0.75rem; color:var(--emerald, #10b981);">$128.90 (+2.40%)</div>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    if (pinnedWidgets.has('epistemic')) {
      html += `
        <div class="panel" style="margin:0;">
          <div class="panel-header" style="display:flex; justify-content:space-between; align-items:center;">
            <div class="panel-title" style="display:flex; align-items:center; gap:8px;">
              <span>⚖️ Pinned: Epistemic Disputed Claims Deck</span>
            </div>
            <div style="display:flex; gap:6px; align-items:center;">
              <button class="btn btn--ghost btn--sm btn-unpin-widget" data-widget="epistemic" title="Unpin widget">✕ Unpin</button>
              <button class="btn btn--ghost btn--sm" onclick="window.commandDeck?.showView('vault')">Open Vault ➔</button>
            </div>
          </div>
          <div class="panel-body" style="padding:12px;">
            <div id="pinned-epistemic-container">
              <div class="agent-loading">Loading active disputes...</div>
            </div>
          </div>
        </div>
      `;
    }

    html += '</div>';
    container.innerHTML = html;

    // Populate data for pinned mesh
    if (pinnedWidgets.has('mesh')) {
      fetch('/api/system/homelab-mesh').then(r => r.json()).then(data => {
        const meshEl = $('pinned-mesh-container');
        if (!meshEl) return;
        const svcs = data.services || [];
        meshEl.innerHTML = `
          <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(140px, 1fr)); gap:8px;">
            ${svcs.slice(0, 8).map(s => `
              <div style="background:var(--bg-secondary); border:1px solid var(--border-subtle); border-radius:4px; padding:6px 8px; display:flex; justify-content:space-between; align-items:center;">
                <span style="font-size:0.75rem; font-weight:600; color:var(--text-1);">${esc(s.name)}</span>
                <span class="badge ${s.status === 'online' ? 'badge-ok' : (s.status === 'slow' ? 'badge-warn' : 'badge-danger')}" style="font-size:0.65rem; padding:1px 5px;">
                  ${s.latency_ms > 0 ? `${s.latency_ms}ms` : s.status}
                </span>
              </div>
            `).join('')}
          </div>
        `;
      }).catch(() => {});
    }

    // Populate data for pinned epistemic
    if (pinnedWidgets.has('epistemic')) {
      fetch('/api/epistemic/claims').then(r => r.json()).then(data => {
        const epiEl = $('pinned-epistemic-container');
        if (!epiEl) return;
        const disputed = (data.claims || []).filter(c => c.status === 'DISPUTED');
        if (disputed.length === 0) {
          epiEl.innerHTML = '<div style="font-size:0.78rem; color:var(--text-3);">No active epistemic disputes detected. All knowledge claims verified.</div>';
        } else {
          epiEl.innerHTML = `
            <div style="display:flex; flex-direction:column; gap:6px;">
              ${disputed.map(c => `
                <div style="background:var(--bg-secondary); border:1px solid rgba(245,158,11,0.3); border-radius:4px; padding:8px 10px; display:flex; justify-content:space-between; align-items:center;">
                  <div>
                    <span class="badge badge-warn" style="font-size:0.65rem; margin-right:6px;">DISPUTED</span>
                    <strong style="font-size:0.8rem; color:var(--text-1);">${esc(c.claim)}</strong>
                    <div style="font-size:0.72rem; color:var(--text-3); margin-top:2px;">${esc(c.conflict_summary || '')}</div>
                  </div>
                  <button class="btn btn--sm btn--primary" onclick="window.commandDeck?.showView('vault')" style="font-size:0.7rem; padding:2px 8px;">Resolve</button>
                </div>
              `).join('')}
            </div>
          `;
        }
      }).catch(() => {});
    }

    // Bind unpin buttons
    container.querySelectorAll('.btn-unpin-widget').forEach(btn => {
      btn.onclick = () => {
        const w = btn.dataset.widget;
        pinnedWidgets.delete(w);
        localStorage.setItem(pinnedStorageKey, JSON.stringify([...pinnedWidgets]));
        renderPinnedWidgets();
      };
    });
  }

  function togglePinWidget(widgetId) {
    if (pinnedWidgets.has(widgetId)) {
      pinnedWidgets.delete(widgetId);
    } else {
      pinnedWidgets.add(widgetId);
    }
    localStorage.setItem(pinnedStorageKey, JSON.stringify([...pinnedWidgets]));
    renderPinnedWidgets();
  }

  $('btn-pin-homelab-mesh')?.addEventListener('click', () => togglePinWidget('mesh'));
  $('btn-pin-markets')?.addEventListener('click', () => togglePinWidget('markets'));
  $('btn-pin-epistemic')?.addEventListener('click', () => togglePinWidget('epistemic'));

  setTimeout(renderPinnedWidgets, 100);

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
