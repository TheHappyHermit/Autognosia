import { CommandDeck, escapeHtml } from './app-core.js';

// ── 1. Home Assistant Smart Home Integration ──────────────────────────────────

CommandDeck.prototype.fetchHomeAssistant = async function() {
  const container = document.getElementById('ha-stage');
  if (!container) return;
  container.innerHTML = '<div class="agent-loading">Connecting to Home Assistant...</div>';

  try {
    const res = await fetch(`${this.apiBase}/api/ha/overview`);
    if (res.ok) {
      const data = await res.json();
      this.renderHomeAssistant(data);
    } else {
      container.innerHTML = '<div class="empty-hint">Failed to load Home Assistant overview.</div>';
    }
  } catch (e) {
    container.innerHTML = `<div class="empty-hint">Error connecting to Home Assistant: ${escapeHtml(e.message)}</div>`;
  }
};

CommandDeck.prototype.renderHomeAssistant = function(data) {
  const container = document.getElementById('ha-stage');
  const badgeEl = document.getElementById('ha-connection-badge');
  if (!container) return;

  const connected = data.connected;
  if (badgeEl) {
    badgeEl.textContent = connected ? 'Live Connected' : 'Simulated / Offline';
    badgeEl.className = connected ? 'badge badge-ok' : 'badge badge-secondary';
  }

  const cats = data.categories || {};
  const lights = cats.lights || [];
  const climate = cats.climate || [];
  const switches = cats.switches || [];
  const sensors = cats.sensors || [];

  container.innerHTML = `
    ${data.notice ? `<div style="padding:10px 14px; background:rgba(59,130,246,0.08); border:1px solid var(--border-subtle); border-radius:var(--radius-md); font-size:0.8rem; color:var(--text-2); margin-bottom:16px;">ℹ️ ${escapeHtml(data.notice)}</div>` : ''}

    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
      <h3 style="margin:0; font-size:1rem; font-weight:600;">Active Smart Home Entities</h3>
      <div style="display:flex; gap:8px;">
        <button id="btn-ha-night-scene" class="btn btn--ghost btn--sm">🌙 Night Lockdown</button>
        <button id="btn-ha-refresh" class="btn btn--ghost btn--sm">↻ Refresh</button>
      </div>
    </div>

    <div class="ha-grid">
      <!-- Climate Cards -->
      ${climate.map(c => `
        <div class="ha-card">
          <div class="ha-card-header">
            <span class="ha-card-title">🌡️ ${escapeHtml(c.name)}</span>
            <span class="ha-card-state ${c.state === 'cool' ? 'on' : 'on'}">${escapeHtml(c.state.toUpperCase())}</span>
          </div>
          <div class="ha-climate-dial">
            <div>
              <div style="font-size:0.75rem; color:var(--text-3);">Target Temp</div>
              <div class="ha-climate-temp">${c.temperature || 72}°F</div>
            </div>
            <div style="text-align:right;">
              <div style="font-size:0.75rem; color:var(--text-3);">Ambient: ${c.current_temperature || 70}°F</div>
              <div style="font-size:0.75rem; color:var(--text-2); margin-top:4px;">Action: ${escapeHtml(c.hvac_action || 'idle')}</div>
            </div>
          </div>
          <div style="display:flex; gap:6px; margin-top:4px;">
            <button class="btn btn--ghost btn--sm ha-temp-step" data-entity="${escapeHtml(c.entity_id)}" data-step="-1" style="flex:1;">- 1°</button>
            <button class="btn btn--ghost btn--sm ha-temp-step" data-entity="${escapeHtml(c.entity_id)}" data-step="1" style="flex:1;">+ 1°</button>
          </div>
        </div>
      `).join('')}

      <!-- Lights Cards -->
      ${lights.map(l => `
        <div class="ha-card">
          <div class="ha-card-header">
            <span class="ha-card-title">💡 ${escapeHtml(l.name)}</span>
            <span class="ha-card-state ${l.state === 'on' ? 'on' : 'off'}">${escapeHtml(l.state.toUpperCase())}</span>
          </div>
          <div style="font-size:0.8rem; color:var(--text-2);">
            Brightness: <strong>${l.brightness ? Math.round((l.brightness / 255) * 100) : 0}%</strong>
          </div>
          <button class="ha-toggle-btn" data-entity="${escapeHtml(l.entity_id)}" data-domain="light" data-state="${l.state}">
            <span>${l.state === 'on' ? 'Turn Off' : 'Turn On'}</span>
          </button>
        </div>
      `).join('')}

      <!-- Switches Cards -->
      ${switches.map(s => `
        <div class="ha-card">
          <div class="ha-card-header">
            <span class="ha-card-title">🔌 ${escapeHtml(s.name)}</span>
            <span class="ha-card-state ${s.state === 'on' ? 'on' : 'off'}">${escapeHtml(s.state.toUpperCase())}</span>
          </div>
          <button class="ha-toggle-btn" data-entity="${escapeHtml(s.entity_id)}" data-domain="switch" data-state="${s.state}">
            <span>${s.state === 'on' ? 'Turn Off' : 'Turn On'}</span>
          </button>
        </div>
      `).join('')}

      <!-- Power & Battery Sensors -->
      ${sensors.map(sn => `
        <div class="ha-card">
          <div class="ha-card-header">
            <span class="ha-card-title">⚡ ${escapeHtml(sn.name)}</span>
            <span class="ha-card-state on">${escapeHtml(sn.state)} ${escapeHtml(sn.unit || '')}</span>
          </div>
          <div style="font-size:0.75rem; color:var(--text-3);">Entity: ${escapeHtml(sn.entity_id)}</div>
        </div>
      `).join('')}
    </div>
  `;

  // Bind toggles
  container.querySelectorAll('.ha-toggle-btn').forEach(btn => {
    btn.onclick = async () => {
      const entityId = btn.dataset.entity;
      const domain = btn.dataset.domain;
      const currentState = btn.dataset.state;
      const nextService = currentState === 'on' ? 'turn_off' : 'turn_on';
      btn.disabled = true;
      btn.textContent = 'Updating...';

      try {
        const res = await fetch(`${this.apiBase}/api/ha/service`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ domain, service: nextService, entity_id: entityId })
        });
        const result = await res.json();
        this.showToast?.(result.message || 'Service dispatched', 'ok');
        await this.fetchHomeAssistant();
      } catch (e) {
        this.showToast?.('HA command error', 'warn');
        btn.disabled = false;
      }
    };
  });

  const refreshBtn = document.getElementById('btn-ha-refresh');
  if (refreshBtn) refreshBtn.onclick = () => this.fetchHomeAssistant();

  const nightBtn = document.getElementById('btn-ha-night-scene');
  if (nightBtn) {
    nightBtn.onclick = async () => {
      this.showToast?.('Dispatched Night Lockdown Scene', 'ok');
      await fetch(`${this.apiBase}/api/ha/service`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: 'scene', service: 'turn_on', entity_id: 'scene.night_lockdown' })
      });
    };
  }
};


// ── 2. n8n Workflow Automation Hub ────────────────────────────────────────────

CommandDeck.prototype.fetchN8n = async function() {
  const container = document.getElementById('n8n-stage');
  if (!container) return;
  container.innerHTML = '<div class="agent-loading">Loading n8n automation pipelines...</div>';

  try {
    const [wfRes, exRes] = await Promise.all([
      fetch(`${this.apiBase}/api/n8n/workflows`),
      fetch(`${this.apiBase}/api/n8n/executions`)
    ]);
    const wfData = await wfRes.json();
    const exData = await exRes.json();
    this.renderN8n(wfData, exData);
  } catch (e) {
    container.innerHTML = `<div class="empty-hint">Error loading n8n workflows: ${escapeHtml(e.message)}</div>`;
  }
};

CommandDeck.prototype.renderN8n = function(wfData, exData) {
  const container = document.getElementById('n8n-stage');
  const badgeEl = document.getElementById('n8n-connection-badge');
  if (!container) return;

  const connected = wfData.connected;
  if (badgeEl) {
    badgeEl.textContent = connected ? 'Live Connected' : 'Simulated / Offline';
    badgeEl.className = connected ? 'badge badge-ok' : 'badge badge-secondary';
  }

  const workflows = wfData.workflows || [];
  const executions = exData.executions || [];

  container.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
      <h3 style="margin:0; font-size:1rem; font-weight:600;">Registered Automation Workflows</h3>
      <button id="btn-n8n-refresh" class="btn btn--ghost btn--sm">↻ Refresh Flows</button>
    </div>

    <div class="n8n-pipeline-grid">
      ${workflows.map(w => `
        <div class="n8n-card">
          <div style="display:flex; justify-content:space-between; align-items:flex-start;">
            <div>
              <div style="font-weight:600; font-size:0.9rem; color:var(--text-1);">${escapeHtml(w.name)}</div>
              <div style="font-size:0.75rem; color:var(--text-3); margin-top:2px;">Nodes: ${w.nodeCount || 1} • ID: ${escapeHtml(w.id)}</div>
            </div>
            <span class="badge ${w.active ? 'badge-ok' : 'badge-secondary'}">${w.active ? 'ACTIVE' : 'PAUSED'}</span>
          </div>
          <div style="display:flex; flex-wrap:wrap; gap:4px; margin-top:6px;">
            ${(w.tags || []).map(t => `<span class="n8n-tag">#${escapeHtml(t)}</span>`).join('')}
          </div>
          <div style="display:flex; gap:8px; margin-top:8px;">
            <button class="btn btn--primary btn--sm n8n-run-btn" data-slug="${escapeHtml(w.id)}" style="flex:1; font-size:0.75rem;">▶ Run Now</button>
          </div>
        </div>
      `).join('')}
    </div>

    <div style="margin-top:24px;">
      <h3 style="font-size:1rem; font-weight:600; margin-bottom:8px;">Recent Execution History</h3>
      <table class="n8n-exec-table">
        <thead>
          <tr>
            <th>Workflow</th>
            <th>Status</th>
            <th>Started</th>
            <th>Duration</th>
          </tr>
        </thead>
        <tbody>
          ${executions.map(ex => `
            <tr>
              <td style="font-weight:500;">${escapeHtml(ex.workflowName || ex.workflowId)}</td>
              <td>
                <span class="badge ${ex.status === 'success' ? 'badge-ok' : ex.status === 'error' ? 'badge-critical' : 'badge-secondary'}">
                  ${escapeHtml(ex.status ? ex.status.toUpperCase() : 'OK')}
                </span>
              </td>
              <td style="color:var(--text-3);">${escapeHtml(ex.startedAt || 'Recent')}</td>
              <td style="font-family:var(--font-mono);">${escapeHtml(ex.duration || '2.0s')}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;

  container.querySelectorAll('.n8n-run-btn').forEach(btn => {
    btn.onclick = async () => {
      const slug = btn.dataset.slug;
      btn.disabled = true;
      btn.textContent = 'Triggering...';
      try {
        const res = await fetch(`${this.apiBase}/api/n8n/trigger`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug })
        });
        const d = await res.json();
        this.showToast?.(d.message || `Triggered workflow: ${slug}`, 'ok');
        await this.fetchN8n();
      } catch (e) {
        this.showToast?.('Trigger failed', 'warn');
        btn.disabled = false;
      }
    };
  });

  const refreshBtn = document.getElementById('btn-n8n-refresh');
  if (refreshBtn) refreshBtn.onclick = () => this.fetchN8n();
};


// ── 3. Obsidian Vault & pgvector Semantic Visualizer ──────────────────────────

CommandDeck.prototype.fetchVault = async function() {
  const notesContainer = document.getElementById('vault-notes-list');
  if (!notesContainer) return;
  notesContainer.innerHTML = '<div class="agent-loading">Scanning vault notes...</div>';

  try {
    const [notesRes, vectorRes] = await Promise.all([
      fetch(`${this.apiBase}/api/vault/notes`),
      fetch(`${this.apiBase}/api/brain/vectors?limit=150`)
    ]);
    const notesData = await notesRes.json();
    const vectorData = await vectorRes.json();

    this.renderVaultNotes(notesData);
    this.renderVectorScatterPlot(vectorData);
  } catch (e) {
    notesContainer.innerHTML = `<div class="empty-hint">Error loading vault: ${escapeHtml(e.message)}</div>`;
  }
};

CommandDeck.prototype.renderVaultNotes = function(data) {
  const listEl = document.getElementById('vault-notes-list');
  const countEl = document.getElementById('vault-notes-count');
  if (!listEl) return;

  const notes = data.notes || [];
  if (countEl) countEl.textContent = `${notes.length} Notes`;

  if (notes.length === 0) {
    listEl.innerHTML = '<div class="empty-hint" style="padding:16px;">No markdown notes found in active-wiki.</div>';
    return;
  }

  listEl.innerHTML = notes.map(n => `
    <div class="vault-note-item" data-path="${escapeHtml(n.path)}">
      <div>
        <div style="font-weight:600; color:var(--text-1);">${escapeHtml(n.title)}</div>
        <div style="font-size:0.7rem; color:var(--text-3); margin-top:2px;">
          ${escapeHtml(n.tier)} • ${n.word_count} words
        </div>
      </div>
      <span class="badge ${n.epistemic === 'fact' ? 'badge-ok' : 'badge-cyan'}" style="font-size:0.65rem;">
        ${escapeHtml(n.epistemic)}
      </span>
    </div>
  `).join('');

  listEl.querySelectorAll('.vault-note-item').forEach(item => {
    item.onclick = () => {
      listEl.querySelectorAll('.vault-note-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      this.loadVaultNote(item.dataset.path);
    };
  });

  // Auto-open first note
  if (notes.length > 0) {
    this.loadVaultNote(notes[0].path);
    listEl.querySelector('.vault-note-item')?.classList.add('active');
  }
};

CommandDeck.prototype.loadVaultNote = async function(path) {
  const titleEl = document.getElementById('vault-current-title');
  const textarea = document.getElementById('vault-note-editor');
  const backlinksEl = document.getElementById('vault-backlinks-list');
  if (!textarea) return;

  textarea.value = 'Loading note...';
  try {
    const res = await fetch(`${this.apiBase}/api/vault/note?path=${encodeURIComponent(path)}`);
    if (res.ok) {
      const data = await res.json();
      if (titleEl) titleEl.textContent = data.title;
      textarea.value = data.content || '';
      textarea.dataset.currentPath = path;

      if (backlinksEl) {
        const links = data.outgoing_links || [];
        if (links.length === 0) {
          backlinksEl.innerHTML = '<div style="font-size:0.75rem; color:var(--text-3); padding:8px;">No outgoing wikilinks.</div>';
        } else {
          backlinksEl.innerHTML = links.map(l => `
            <div style="padding:4px 8px; background:var(--bg-secondary); border-radius:4px; font-size:0.75rem; color:var(--accent);">
              [[${escapeHtml(l)}]]
            </div>
          `).join('');
        }
      }
    }
  } catch (e) {
    textarea.value = `Error loading note: ${e.message}`;
  }
};

CommandDeck.prototype.saveVaultNote = async function() {
  const textarea = document.getElementById('vault-note-editor');
  const btn = document.getElementById('btn-vault-save');
  if (!textarea || !textarea.dataset.currentPath) return;

  const path = textarea.dataset.currentPath;
  const content = textarea.value;

  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Saving...';
  }

  try {
    const res = await fetch(`${this.apiBase}/api/vault/note`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path, content })
    });
    const data = await res.json();
    if (res.ok) {
      this.showToast?.(data.message || 'Note saved to vault', 'ok');
    } else {
      this.showToast?.(data.error || 'Failed to save note', 'warn');
    }
  } catch (e) {
    this.showToast?.(`Error saving note: ${e.message}`, 'warn');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = 'Save Note';
    }
  }
};

CommandDeck.prototype.renderVectorScatterPlot = function(data) {
  const canvas = document.getElementById('vector-scatter-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const w = canvas.width = canvas.parentElement?.clientWidth || 500;
  const h = canvas.height = 360;

  ctx.clearRect(0, 0, w, h);

  // Background grid
  ctx.strokeStyle = 'rgba(255,255,255,0.05)';
  ctx.lineWidth = 1;
  for (let x = 0; x < w; x += 40) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
  }
  for (let y = 0; y < h; y += 40) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
  }

  const points = data.points || [];
  const colorMap = {
    "System Architecture": "#3b82f6",
    "Agent Persona": "#8b5cf6",
    "Operational Tasks": "#10b981",
    "Research Vault": "#06b6d4",
    "Smart Home": "#f59e0b",
    "Finance": "#ec4899"
  };

  points.forEach(p => {
    const px = (p.x / 100) * (w - 40) + 20;
    const py = (p.y / 100) * (h - 40) + 20;
    const color = colorMap[p.category] || '#3b82f6';

    ctx.beginPath();
    ctx.arc(px, py, 4.5, 0, 2 * math_pi);
    ctx.fillStyle = color;
    ctx.shadowBlur = 8;
    ctx.shadowColor = color;
    ctx.fill();
    ctx.shadowBlur = 0;
  });

  const countBadge = document.getElementById('vector-count-badge');
  if (countBadge) countBadge.textContent = `${points.length} Vectors (pgvector 2000d)`;
};

const math_pi = Math.PI;


// ── 4. Financial Markets (yfinance & Candlestick Engine) ───────────────────────

CommandDeck.prototype.fetchMarkets = async function() {
  const quotesList = document.getElementById('market-watchlist-tbody');
  if (!quotesList) return;
  quotesList.innerHTML = '<tr><td colspan="4" class="agent-loading">Fetching market quotes...</td></tr>';

  try {
    const [quotesRes, chartRes] = await Promise.all([
      fetch(`${this.apiBase}/api/markets/quotes`),
      fetch(`${this.apiBase}/api/markets/chart?ticker=^GSPC&period=1mo`)
    ]);
    const quotesData = await quotesRes.json();
    const chartData = await chartRes.json();

    this.renderWatchlist(quotesData);
    this.renderMarketChart(chartData);
  } catch (e) {
    quotesList.innerHTML = `<tr><td colspan="4" class="empty-hint">Error: ${escapeHtml(e.message)}</td></tr>`;
  }
};

CommandDeck.prototype.renderWatchlist = function(data) {
  const tbody = document.getElementById('market-watchlist-tbody');
  if (!tbody) return;

  const quotes = data.quotes || [];
  tbody.innerHTML = quotes.map(q => `
    <tr data-ticker="${escapeHtml(q.ticker)}">
      <td>
        <div style="font-weight:600; color:var(--text-1);">${escapeHtml(q.name)}</div>
        <div style="font-size:0.7rem; color:var(--text-3);">${escapeHtml(q.ticker)}</div>
      </td>
      <td style="font-family:var(--font-mono); font-weight:600;">$${Number(q.price).toLocaleString()}</td>
      <td class="${q.is_positive ? 'market-gain' : 'market-loss'}">
        ${q.is_positive ? '+' : ''}${q.change_pct}%
      </td>
      <td>
        <svg width="60" height="20">
          <polyline fill="none" stroke="${q.is_positive ? '#10b981' : '#ef4444'}" stroke-width="1.5"
            points="${this.generateSparklinePoints(q.sparkline, 60, 20)}" />
        </svg>
      </td>
    </tr>
  `).join('');

  tbody.querySelectorAll('tr').forEach(row => {
    row.onclick = async () => {
      tbody.querySelectorAll('tr').forEach(r => r.style.background = '');
      row.style.background = 'var(--bg-tertiary)';
      const ticker = row.dataset.ticker;
      await this.loadTickerChart(ticker);
    };
  });
};

CommandDeck.prototype.generateSparklinePoints = function(pts, w, h) {
  if (!pts || pts.length < 2) return '';
  const min = Math.min(...pts);
  const max = Math.max(...pts);
  const range = max - min || 1;
  return pts.map((val, idx) => {
    const x = (idx / (pts.length - 1)) * (w - 4) + 2;
    const y = (h - 2) - ((val - min) / range) * (h - 4);
    return `${x},${y}`;
  }).join(' ');
};

CommandDeck.prototype.loadTickerChart = async function(ticker, period = '1mo') {
  try {
    const res = await fetch(`${this.apiBase}/api/markets/chart?ticker=${encodeURIComponent(ticker)}&period=${period}`);
    if (res.ok) {
      const data = await res.json();
      this.renderMarketChart(data);
    }
  } catch (e) {
    console.warn('Error loading chart:', e);
  }
};

CommandDeck.prototype.renderMarketChart = function(data) {
  const titleEl = document.getElementById('market-chart-ticker');
  const priceEl = document.getElementById('market-chart-price');
  const changeEl = document.getElementById('market-chart-change');
  const canvas = document.getElementById('market-candlestick-canvas');
  if (!canvas) return;

  if (titleEl) titleEl.textContent = `${data.ticker} Market Overview`;
  if (priceEl) priceEl.textContent = `$${Number(data.current_price).toLocaleString()}`;
  if (changeEl) {
    const isPos = data.period_change_pct >= 0;
    changeEl.textContent = `${isPos ? '+' : ''}${data.period_change_pct}% (${data.period.toUpperCase()})`;
    changeEl.className = isPos ? 'market-gain' : 'market-loss';
  }

  const ctx = canvas.getContext('2d');
  const w = canvas.width = canvas.parentElement?.clientWidth || 640;
  const h = canvas.height = 280;

  ctx.clearRect(0, 0, w, h);

  const candles = data.candles || [];
  if (candles.length === 0) return;

  const minPrice = Math.min(...candles.map(c => c.low));
  const maxPrice = Math.max(...candles.map(c => c.high));
  const range = maxPrice - minPrice || 1;

  const candleWidth = Math.max(3, Math.floor((w - 40) / candles.length) - 3);

  candles.forEach((c, idx) => {
    const x = 30 + idx * ((w - 50) / candles.length);
    const isBull = c.close >= c.open;
    const color = isBull ? '#10b981' : '#ef4444';

    const yHigh = (h - 30) - ((c.high - minPrice) / range) * (h - 50);
    const yLow = (h - 30) - ((c.low - minPrice) / range) * (h - 50);
    const yOpen = (h - 30) - ((c.open - minPrice) / range) * (h - 50);
    const yClose = (h - 30) - ((c.close - minPrice) / range) * (h - 50);

    // Wick
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.moveTo(x + candleWidth / 2, yHigh);
    ctx.lineTo(x + candleWidth / 2, yLow);
    ctx.stroke();

    // Body
    ctx.fillStyle = color;
    const bodyTop = Math.min(yOpen, yClose);
    const bodyHeight = Math.max(2, Math.abs(yClose - yOpen));
    ctx.fillRect(x, bodyTop, candleWidth, bodyHeight);
  });
};


// ── 5. SearXNG Private Metasearch Omnibar ───────────────────────────────────────

CommandDeck.prototype.openSearXNGModal = function() {
  let modal = document.getElementById('searxng-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'searxng-modal';
    modal.className = 'searxng-modal-backdrop';

    modal.innerHTML = `
      <div class="searxng-modal-box">
        <div class="searxng-search-header">
          <span style="font-size:1.2rem;">🔍</span>
          <input type="text" id="searxng-query-input" class="searxng-input" placeholder="Search SearXNG metasearch (Google, Bing, ArXiv, GitHub)..." autocomplete="off" />
          <button id="searxng-close-btn" style="background:none; border:none; font-size:1.4rem; color:var(--text-3); cursor:pointer;">&times;</button>
        </div>
        <div class="searxng-categories">
          <button class="searxng-cat-btn active" data-cat="general">General</button>
          <button class="searxng-cat-btn" data-cat="it">IT & Code</button>
          <button class="searxng-cat-btn" data-cat="science">Science & ArXiv</button>
          <button class="searxng-cat-btn" data-cat="news">News</button>
        </div>
        <div class="searxng-results-list" id="searxng-results-container">
          <div style="text-align:center; padding:32px; color:var(--text-3); font-size:0.85rem;">
            Type a search query and press Enter to query private metasearch.
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('searxng-close-btn').onclick = () => { modal.style.display = 'none'; };
    modal.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };

    const input = document.getElementById('searxng-query-input');
    input.onkeydown = (e) => {
      if (e.key === 'Enter') {
        const activeCat = modal.querySelector('.searxng-cat-btn.active')?.dataset.cat || 'general';
        this.executeSearXNG(input.value.trim(), activeCat);
      }
    };

    modal.querySelectorAll('.searxng-cat-btn').forEach(btn => {
      btn.onclick = () => {
        modal.querySelectorAll('.searxng-cat-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const q = input.value.trim();
        if (q) this.executeSearXNG(q, btn.dataset.cat);
      };
    });
  }

  modal.style.display = 'flex';
  setTimeout(() => document.getElementById('searxng-query-input')?.focus(), 50);
};

CommandDeck.prototype.executeSearXNG = async function(query, category = 'general') {
  const container = document.getElementById('searxng-results-container');
  if (!container || !query) return;
  container.innerHTML = '<div class="agent-loading">Querying private SearXNG engines...</div>';

  try {
    const res = await fetch(`${this.apiBase}/api/search/searxng?q=${encodeURIComponent(query)}&category=${encodeURIComponent(category)}`);
    const data = await res.json();

    const results = data.results || [];
    if (results.length === 0) {
      container.innerHTML = '<div class="empty-hint">No search results returned.</div>';
      return;
    }

    container.innerHTML = `
      ${data.notice ? `<div style="font-size:0.75rem; color:var(--text-3); margin-bottom:8px;">ℹ️ ${escapeHtml(data.notice)}</div>` : ''}
      ${results.map((r, i) => `
        <div class="searxng-result-card">
          <div style="display:flex; justify-content:space-between; align-items:flex-start;">
            <a href="${escapeHtml(r.url)}" target="_blank" rel="noopener noreferrer" class="searxng-result-title">${escapeHtml(r.title)}</a>
            <button class="btn btn--ghost btn--sm searxng-clip-btn" data-idx="${i}" style="padding:2px 8px; font-size:0.7rem;">+ Clip Note</button>
          </div>
          <div class="searxng-result-url">${escapeHtml(r.url)}</div>
          <div class="searxng-result-snippet">${escapeHtml(r.content)}</div>
        </div>
      `).join('')}
    `;

    container.querySelectorAll('.searxng-clip-btn').forEach(btn => {
      btn.onclick = async () => {
        const item = results[Number(btn.dataset.idx)];
        btn.disabled = true;
        btn.textContent = 'Saving...';
        try {
          const cRes = await fetch(`${this.apiBase}/api/search/clip`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: item.title, url: item.url, snippet: item.content })
          });
          const cData = await cRes.json();
          btn.textContent = '✓ Saved';
          this.showToast?.(`Clipped to ${cData.path}`, 'ok');
        } catch (e) {
          btn.textContent = 'Error';
        }
      };
    });
  } catch (e) {
    container.innerHTML = `<div class="empty-hint">Search error: ${escapeHtml(e.message)}</div>`;
  }
};


// ── 6. ElevenLabs Voice Synthesis Audio Player ────────────────────────────────

CommandDeck.prototype.playAgentVoice = async function(text, voiceId = '21m00Tcm4TlvDq8ikWAM') {
  const hud = document.getElementById('tts-player-hud');
  const bars = document.getElementById('tts-waveform-bars');

  if (hud) hud.style.display = 'flex';
  if (bars) bars.classList.add('active');

  try {
    const res = await fetch(`${this.apiBase}/api/tts/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voice_id: voiceId })
    });
    const data = await res.json();

    if (data.audio_data) {
      const audio = new Audio(data.audio_data);
      audio.onended = () => {
        if (bars) bars.classList.remove('active');
      };
      await audio.play();
    } else {
      // High-performance fallback browser speech
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const ut = new SpeechSynthesisUtterance(text.replace(/[*_`#]/g, ''));
        ut.onend = () => { if (bars) bars.classList.remove('active'); };
        window.speechSynthesis.speak(ut);
      }
    }
  } catch (e) {
    if (bars) bars.classList.remove('active');
  }
};


// ── Wire Navigation & Global Shortcuts ────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  // Wire SearXNG search omnibar trigger
  const searchInput = document.getElementById('global-search');
  if (searchInput) {
    searchInput.onclick = () => window.commandDeck?.openSearXNGModal();
  }

  // Keyboard shortcut: pressing / opens SearXNG modal
  document.addEventListener('keydown', (e) => {
    if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
      e.preventDefault();
      window.commandDeck?.openSearXNGModal();
    }
  });

  // Wire timeframe buttons for markets
  document.querySelectorAll('.market-tf-btn').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('.market-tf-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const tf = btn.dataset.tf;
      const currentTicker = document.getElementById('market-chart-ticker')?.textContent?.split(' ')[0] || '^GSPC';
      window.commandDeck?.loadTickerChart(currentTicker, tf);
    };
  });

  // Wire vault save button
  const vaultSaveBtn = document.getElementById('btn-vault-save');
  if (vaultSaveBtn) {
    vaultSaveBtn.onclick = () => window.commandDeck?.saveVaultNote();
  }
});
