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
    ${!connected ? `
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; padding:12px 16px; background:rgba(245,158,11,0.08); border:1px solid rgba(245,158,11,0.25); border-radius:var(--radius-md); margin-bottom:16px;">
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="font-size:1.2rem;">⚠️</span>
          <div>
            <div style="font-weight:600; font-size:0.85rem; color:var(--text-1);">Home Assistant Live Node Offline or Unauthenticated</div>
            <div style="font-size:0.75rem; color:var(--text-3); margin-top:2px;">Currently displaying local fallback entities. To connect live IoT entities, add your Long-Lived Access Token in System Settings.</div>
          </div>
        </div>
        <button class="btn btn--secondary btn--sm btn-goto-system-settings" style="font-size:0.75rem;">⚙️ Configure in Settings</button>
      </div>
    ` : ''}
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

  container.querySelectorAll('.btn-goto-system-settings').forEach(btn => {
    btn.onclick = (e) => {
      e.preventDefault();
      if (typeof this.switchView === 'function') {
        this.switchView('system');
      } else if (typeof this.showView === 'function') {
        this.showView('system');
      } else {
        const sysLink = document.querySelector('.sidebar-link[data-view="system"]');
        if (sysLink) sysLink.click();
      }
    };
  });
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
    ${!connected ? `
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; padding:12px 16px; background:rgba(139,92,246,0.08); border:1px solid rgba(139,92,246,0.25); border-radius:var(--radius-md); margin-bottom:16px;">
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="font-size:1.2rem;">🔄</span>
          <div>
            <div style="font-weight:600; font-size:0.85rem; color:var(--text-1);">Local n8n Workflow Automation Bridge Offline</div>
            <div style="font-size:0.75rem; color:var(--text-3); margin-top:2px;">Showing simulated pipeline DAGs. Start your local instance (<code>npx n8n</code> or Docker port 5678) and enter your API Key in System Settings.</div>
          </div>
        </div>
        <button class="btn btn--secondary btn--sm btn-goto-system-settings" style="font-size:0.75rem;">⚙️ Configure in Settings</button>
      </div>
    ` : ''}
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

  container.querySelectorAll('.btn-goto-system-settings').forEach(btn => {
    btn.onclick = (e) => {
      e.preventDefault();
      if (typeof this.switchView === 'function') {
        this.switchView('system');
      } else if (typeof this.showView === 'function') {
        this.showView('system');
      } else {
        const sysLink = document.querySelector('.sidebar-link[data-view="system"]');
        if (sysLink) sysLink.click();
      }
    };
  });
};


// ── 2b. Homelab Dedicated Services View Loader ────────────────────────────────

CommandDeck.prototype.loadHomelabServiceView = async function(serviceName) {
  const meta = {
    deerflow: { title: 'DeerFlow', defaultUrl: 'http://localhost:8000', icon: '🦌', desc: 'Deep multi-agent research workflow, automated literature synthesis & DAG flows' },
    vane: { title: 'Vane (Perplexica)', defaultUrl: 'http://localhost:3000', icon: '🧭', desc: 'AI-powered conversational search engine with multi-source web grounding' },
    openwebui: { title: 'Open WebUI', defaultUrl: 'http://localhost:3000', icon: '💬', desc: 'Self-hosted conversational AI workstation with local Ollama, vLLM & OpenAI model endpoints' },
    audiobookshelf: { title: 'Audiobookshelf', defaultUrl: 'http://localhost:13378', icon: '🎧', desc: 'Self-hosted audiobook, podcast & sync server' },
    booklore: { title: 'Booklore', defaultUrl: 'http://localhost:8080', icon: '📖', desc: 'Self-hosted eBook library & reading archive' },
    immich: { title: 'Immich', defaultUrl: 'http://localhost:2283', icon: '📷', desc: 'High-performance photo and video backup with machine learning visual search' },
    nextcloud: { title: 'Nextcloud', defaultUrl: 'http://localhost:8080', icon: '☁️', desc: 'Private cloud hub, file sync, collaborative docs & calendar' },
    seer: { title: 'Seer Requests', defaultUrl: 'http://localhost:5055', icon: '🎬', desc: 'Media discovery and automated request manager (Overseerr / Jellyseerr)' },
    freshrss: { title: 'FreshRSS', defaultUrl: 'http://localhost:8080', icon: '📰', desc: 'Self-hosted RSS/Atom feed aggregator & reader' },
    godseye: { title: "God's Eye View", defaultUrl: 'http://localhost:5173', icon: '🛰️', desc: 'Real-time 3D geospatial intelligence, Cesium photorealistic tiles, satellite & transponder tracking' },
  };

  const service = meta[serviceName];
  if (!service) return;

  const cfg = this.systemSettings?.[serviceName] || {};
  const currentUrl = cfg.url || service.defaultUrl;

  const stage = document.getElementById(`${serviceName}-stage`);
  const badge = document.getElementById(`${serviceName}-connection-badge`);
  const extLink = document.getElementById(`${serviceName}-external-link`);

  if (extLink) extLink.href = currentUrl;

  if (stage) {
    stage.innerHTML = `
      <div style="display:flex; flex-direction:column; width:100%; height:100%; position:absolute; inset:0;">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; padding:10px 16px; background:var(--bg-secondary); border-bottom:1px solid var(--border-subtle);">
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-size:1.1rem;">${service.icon}</span>
            <span style="font-weight:600; font-size:0.85rem; color:var(--text-1);">${service.title} Live Node</span>
            <a href="${escapeHtml(currentUrl)}" target="_blank" rel="noopener noreferrer" style="font-size:0.75rem; color:var(--accent); font-family:var(--font-mono); text-decoration:underline;">${escapeHtml(currentUrl)}</a>
          </div>
          <div style="display:flex; align-items:center; gap:6px;">
            <button class="btn btn--ghost btn--sm btn-reload-frame" data-service="${serviceName}" style="font-size:0.75rem; padding:3px 8px;">↻ Reload Frame</button>
            <a href="${escapeHtml(currentUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn--primary btn--sm" style="font-size:0.75rem; padding:3px 10px; text-decoration:none; display:inline-flex; align-items:center; gap:4px;">
              <span>Open in New Tab ↗</span>
            </a>
          </div>
        </div>
        <div style="padding:8px 16px; background:rgba(59,130,246,0.05); border-bottom:1px solid var(--border-subtle); font-size:0.75rem; color:var(--text-3); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px;">
          <span>💡 Embedded Sandbox View. If the web app is blocked by container X-Frame-Options, use <strong>Open in New Tab ↗</strong>.</span>
          <button class="btn btn--ghost btn--sm btn-goto-system-settings" style="font-size:0.75rem; padding:2px 6px;">⚙️ Configure URL / Token</button>
        </div>
        <div style="flex:1; width:100%; height:calc(100% - 75px); position:relative; overflow:hidden;">
          <iframe id="iframe-${serviceName}" src="${escapeHtml(currentUrl)}" style="width:100%; height:100%; border:none; background:var(--bg-primary);" sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals" loading="lazy"></iframe>
        </div>
      </div>
    `;

    const reloadBtn = stage.querySelector('.btn-reload-frame');
    if (reloadBtn) {
      reloadBtn.onclick = () => {
        const frame = document.getElementById(`iframe-${serviceName}`);
        if (frame) frame.src = currentUrl;
      };
    }

    stage.querySelectorAll('.btn-goto-system-settings').forEach(btn => {
      btn.onclick = (e) => {
        e.preventDefault();
        this.showView('system');
      };
    });
  }

  // Check connectivity in background
  try {
    const testRes = await fetch(`${this.apiBase}/api/system/test-connection?provider=${serviceName}`);
    if (testRes.ok) {
      const testData = await testRes.json();
      if (badge) {
        if (testData.status === 'ok') {
          badge.textContent = 'Live Connected';
          badge.className = 'badge badge-ok';
        } else {
          badge.textContent = 'Configured / Offline';
          badge.className = 'badge badge-secondary';
        }
      }
    }
  } catch (e) {
    if (badge) {
      badge.textContent = 'Offline';
      badge.className = 'badge badge-secondary';
    }
  }
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

  // Ensure persistent bottom ticker ribbon is loaded with live data
  this.fetchMarketTickerRibbon();

  try {
    const [quotesRes, chartRes] = await Promise.all([
      fetch(`${this.apiBase}/api/markets/quotes`),
      fetch(`${this.apiBase}/api/markets/chart?ticker=^GSPC&period=1mo`)
    ]);
    const quotesData = await quotesRes.json();
    const chartData = await chartRes.json();

    this.renderWatchlist(quotesData);
    this.renderMarketChart(chartData);
    this.loadTickerBreakdown('^GSPC');
  } catch (e) {
    quotesList.innerHTML = `<tr><td colspan="4" class="empty-hint">Error: ${escapeHtml(e.message)}</td></tr>`;
  }
};

CommandDeck.prototype.renderWatchlist = function(data) {
  const tbody = document.getElementById('market-watchlist-tbody');
  const countBadge = document.getElementById('market-watchlist-count');
  if (!tbody) return;

  const quotes = data.quotes || [];
  if (countBadge) {
    countBadge.textContent = `${quotes.length} Asset${quotes.length === 1 ? '' : 's'}`;
  }

  if (quotes.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="empty-hint" style="text-align:center; padding:20px;">No followed assets. Search above to follow assets.</td></tr>';
    return;
  }

  tbody.innerHTML = quotes.map(q => `
    <tr data-ticker="${escapeHtml(q.ticker)}" class="${this.activeMarketTicker === q.ticker ? 'active-watchlist-row' : ''}">
      <td>
        <div style="display:flex; align-items:center; gap:6px;">
          <div style="font-weight:600; color:var(--text-1);">${escapeHtml(q.name)}</div>
          <span class="badge badge-subtle" style="font-size:0.65rem; padding:1px 4px;">${escapeHtml(q.type || 'equity')}</span>
        </div>
        <div style="font-size:0.7rem; color:var(--text-3); font-family:var(--font-mono);">${escapeHtml(q.ticker)}</div>
      </td>
      <td style="font-family:var(--font-mono); font-weight:600; color:var(--text-1);">$${Number(q.price).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
      <td class="${q.is_positive ? 'market-gain' : 'market-loss'}" style="font-family:var(--font-mono); font-weight:600;">
        ${q.is_positive ? '+' : ''}${q.change_pct}%
      </td>
      <td style="text-align:center;">
        <button class="market-unfollow-btn" data-ticker="${escapeHtml(q.ticker)}" title="Unfollow ${escapeHtml(q.ticker)}">&times;</button>
      </td>
    </tr>
  `).join('');

  tbody.querySelectorAll('tr').forEach(row => {
    row.onclick = async (e) => {
      if (e.target.closest('.market-unfollow-btn')) return;
      tbody.querySelectorAll('tr').forEach(r => {
        r.classList.remove('active-watchlist-row');
        r.style.background = '';
      });
      row.classList.add('active-watchlist-row');
      row.style.background = 'var(--bg-tertiary)';
      const ticker = row.dataset.ticker;
      this.activeMarketTicker = ticker;
      const titleEl = document.getElementById('market-chart-ticker');
      if (titleEl) titleEl.textContent = `${ticker} Market Overview`;
      await Promise.all([
        this.loadTickerChart(ticker, this.activeMarketPeriod || '1mo'),
        this.loadTickerBreakdown(ticker)
      ]);
    };
  });

  tbody.querySelectorAll('.market-unfollow-btn').forEach(btn => {
    btn.onclick = async (e) => {
      e.stopPropagation();
      const ticker = btn.dataset.ticker;
      await this.unfollowTicker(ticker);
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

CommandDeck.prototype.initMarketAssetSearch = function() {
  const input = document.getElementById('market-search-input');
  const dropdown = document.getElementById('market-search-dropdown');
  const wrap = document.getElementById('market-search-bar-wrap');
  if (!input || !dropdown) return;
  if (input.dataset.searchInit === 'true') return;
  input.dataset.searchInit = 'true';

  let debounceTimer = null;

  const closeDropdown = () => { dropdown.style.display = 'none'; };

  input.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    const q = input.value.trim();
    if (!q) {
      closeDropdown();
      return;
    }

    debounceTimer = setTimeout(async () => {
      try {
        const res = await fetch(`${this.apiBase}/api/markets/search?q=${encodeURIComponent(q)}`);
        if (!res.ok) return;
        const data = await res.json();
        const results = data.results || [];

        if (results.length === 0) {
          dropdown.innerHTML = `<div style="padding:14px; text-align:center; font-size:0.8rem; color:var(--text-3);">No matching tickers or assets found for "${escapeHtml(q)}"</div>`;
          dropdown.style.display = 'flex';
          return;
        }

        dropdown.innerHTML = results.map(item => `
          <div class="market-search-item" data-symbol="${escapeHtml(item.symbol)}" data-name="${escapeHtml(item.name)}" data-type="${escapeHtml(item.type)}">
            <div class="market-search-meta">
              <span class="market-search-symbol">${escapeHtml(item.symbol)}</span>
              <div style="min-width:0;">
                <div class="market-search-name">${escapeHtml(item.name)}</div>
                <div style="font-size:0.7rem; color:var(--text-3);">${escapeHtml(item.exchange)} • ${escapeHtml(item.type)}</div>
              </div>
            </div>
            <button class="market-follow-btn ${item.is_followed ? 'following' : ''}" data-symbol="${escapeHtml(item.symbol)}" data-name="${escapeHtml(item.name)}" data-type="${escapeHtml(item.type)}">
              ${item.is_followed ? '✓ Following' : '+ Follow'}
            </button>
          </div>
        `).join('');

        dropdown.style.display = 'flex';

        dropdown.querySelectorAll('.market-search-item').forEach(el => {
          el.onclick = async (e) => {
            if (e.target.closest('.market-follow-btn')) return;
            const sym = el.dataset.symbol;
            closeDropdown();
            input.value = sym;
            this.activeMarketTicker = sym;
            const titleEl = document.getElementById('market-chart-ticker');
            if (titleEl) titleEl.textContent = `${sym} Market Overview`;
            await Promise.all([
              this.loadTickerChart(sym, this.activeMarketPeriod || '1mo'),
              this.loadTickerBreakdown(sym)
            ]);
          };
        });

        dropdown.querySelectorAll('.market-follow-btn').forEach(btn => {
          btn.onclick = async (e) => {
            e.stopPropagation();
            const sym = btn.dataset.symbol;
            const name = btn.dataset.name;
            const type = btn.dataset.type;
            if (btn.classList.contains('following')) {
              await this.unfollowTicker(sym);
              btn.classList.remove('following');
              btn.textContent = '+ Follow';
            } else {
              await this.followTicker(sym, name, type);
              btn.classList.add('following');
              btn.textContent = '✓ Following';
            }
          };
        });
      } catch (err) {
        console.warn('Market search error:', err);
      }
    }, 200);
  });

  input.addEventListener('keydown', async (e) => {
    if (e.key === 'Enter') {
      const q = input.value.trim().toUpperCase();
      if (!q) return;
      closeDropdown();
      this.activeMarketTicker = q;
      const titleEl = document.getElementById('market-chart-ticker');
      if (titleEl) titleEl.textContent = `${q} Market Overview`;
      await Promise.all([
        this.loadTickerChart(q, this.activeMarketPeriod || '1mo'),
        this.loadTickerBreakdown(q)
      ]);
    }
  });

  document.addEventListener('click', (e) => {
    if (wrap && !wrap.contains(e.target)) {
      closeDropdown();
    }
  });

  // Timeframe buttons wiring
  document.querySelectorAll('.market-tf-btn').forEach(btn => {
    btn.onclick = async () => {
      document.querySelectorAll('.market-tf-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const tf = btn.dataset.tf;
      this.activeMarketPeriod = tf;
      const ticker = this.activeMarketTicker || '^GSPC';
      await this.loadTickerChart(ticker, tf);
    };
  });
};

CommandDeck.prototype.followTicker = async function(ticker, name, type) {
  try {
    const res = await fetch(`${this.apiBase}/api/markets/watchlist/follow`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticker, name, type })
    });
    if (res.ok) {
      if (typeof this.showToast === 'function') {
        this.showToast(`Followed ${ticker} to watchlist`, 'success');
      }
      const qRes = await fetch(`${this.apiBase}/api/markets/quotes`);
      if (qRes.ok) this.renderWatchlist(await qRes.json());
    }
  } catch (err) {
    console.warn('Error following ticker:', err);
  }
};

CommandDeck.prototype.unfollowTicker = async function(ticker) {
  try {
    const res = await fetch(`${this.apiBase}/api/markets/watchlist/unfollow`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticker })
    });
    if (res.ok) {
      if (typeof this.showToast === 'function') {
        this.showToast(`Unfollowed ${ticker}`, 'info');
      }
      const qRes = await fetch(`${this.apiBase}/api/markets/quotes`);
      if (qRes.ok) this.renderWatchlist(await qRes.json());
    }
  } catch (err) {
    console.warn('Error unfollowing ticker:', err);
  }
};

CommandDeck.prototype.loadTickerBreakdown = async function(ticker) {
  const panel = document.getElementById('market-ticker-breakdown');
  if (!panel) return;

  const symEl = document.getElementById('breakdown-ticker-symbol');
  const nameEl = document.getElementById('breakdown-ticker-name');
  const typeEl = document.getElementById('breakdown-ticker-type');
  const recBadge = document.getElementById('breakdown-recommendation-badge');

  if (symEl) symEl.textContent = ticker;
  if (nameEl) nameEl.textContent = 'Loading detailed metrics...';

  try {
    const res = await fetch(`${this.apiBase}/api/markets/detail?ticker=${encodeURIComponent(ticker)}`);
    if (!res.ok) return;
    const data = await res.json();

    if (symEl) symEl.textContent = data.ticker || ticker;
    if (nameEl) nameEl.textContent = data.name || ticker;
    if (typeEl) typeEl.textContent = data.profile?.sector || 'Asset';

    const rec = data.targets?.recommendation_key || 'HOLD';
    if (recBadge) {
      recBadge.textContent = rec.toUpperCase();
      if (['BUY', 'STRONG_BUY'].includes(rec.toUpperCase())) {
        recBadge.className = 'badge badge-green';
      } else if (['SELL', 'UNDERPERFORM'].includes(rec.toUpperCase())) {
        recBadge.className = 'badge badge-rose';
      } else {
        recBadge.className = 'badge badge-purple';
      }
    }

    const fmtNum = (val, prefix = '$', suffix = '') => {
      if (val == null || isNaN(val)) return '---';
      if (Math.abs(val) >= 1e12) return `${prefix}${(val / 1e12).toFixed(2)}T${suffix}`;
      if (Math.abs(val) >= 1e9) return `${prefix}${(val / 1e9).toFixed(2)}B${suffix}`;
      if (Math.abs(val) >= 1e6) return `${prefix}${(val / 1e6).toFixed(2)}M${suffix}`;
      return `${prefix}${Number(val).toLocaleString()}${suffix}`;
    };

    const q = data.quote || {};
    const v = data.valuation || {};
    const t = data.targets || {};
    const f = data.financials || {};
    const p = data.profile || {};
    const providers = data.providers || {};

    const elMcap = document.getElementById('kpi-market-cap');
    const elPe = document.getElementById('kpi-pe-ratio');
    const elEps = document.getElementById('kpi-eps');
    const el52w = document.getElementById('kpi-52w');
    const elBeta = document.getElementById('kpi-beta');
    const elDiv = document.getElementById('kpi-dividend');
    const elVol = document.getElementById('kpi-volume');
    const elTarget = document.getElementById('kpi-target');

    if (elMcap) elMcap.textContent = fmtNum(q.market_cap);
    if (elPe) elPe.textContent = v.trailing_pe ? v.trailing_pe.toFixed(2) : (v.forward_pe ? `${v.forward_pe.toFixed(2)} (Fwd)` : '---');
    if (elEps) elEps.textContent = v.trailing_eps ? `$${v.trailing_eps.toFixed(2)}` : '---';
    if (el52w) el52w.textContent = (q.fifty_two_week_low && q.fifty_two_week_high) ? `$${q.fifty_two_week_low.toFixed(1)} - $${q.fifty_two_week_high.toFixed(1)}` : '---';
    if (elBeta) elBeta.textContent = v.beta ? v.beta.toFixed(2) : '1.00';
    if (elDiv) elDiv.textContent = v.dividend_yield ? `${v.dividend_yield}%` : '0.00%';
    if (elVol) elVol.textContent = `${fmtNum(q.volume, '')} / ${fmtNum(q.avg_volume, '')}`;
    if (elTarget) elTarget.textContent = t.target_mean_price ? `$${t.target_mean_price.toFixed(2)}` : '---';

    // 1. yfinance Valuation & Profile Lists
    const valList = document.getElementById('yf-valuation-list');
    if (valList) {
      valList.innerHTML = `
        <div class="breakdown-metric-row"><span class="breakdown-metric-label">Forward P/E</span><span class="breakdown-metric-val">${v.forward_pe ? v.forward_pe.toFixed(2) : 'N/A'}</span></div>
        <div class="breakdown-metric-row"><span class="breakdown-metric-label">PEG Ratio</span><span class="breakdown-metric-val">${v.peg_ratio ? v.peg_ratio.toFixed(2) : 'N/A'}</span></div>
        <div class="breakdown-metric-row"><span class="breakdown-metric-label">Price / Book</span><span class="breakdown-metric-val">${v.price_to_book ? v.price_to_book.toFixed(2) : 'N/A'}</span></div>
        <div class="breakdown-metric-row"><span class="breakdown-metric-label">Revenue (TTM)</span><span class="breakdown-metric-val">${fmtNum(f.total_revenue)}</span></div>
        <div class="breakdown-metric-row"><span class="breakdown-metric-label">Operating Margin</span><span class="breakdown-metric-val">${f.operating_margins ? f.operating_margins + '%' : 'N/A'}</span></div>
        <div class="breakdown-metric-row"><span class="breakdown-metric-label">Profit Margin</span><span class="breakdown-metric-val">${f.profit_margins ? f.profit_margins + '%' : 'N/A'}</span></div>
        <div class="breakdown-metric-row"><span class="breakdown-metric-label">Free Cashflow</span><span class="breakdown-metric-val">${fmtNum(f.free_cashflow)}</span></div>
        <div class="breakdown-metric-row"><span class="breakdown-metric-label">Total Cash / Debt</span><span class="breakdown-metric-val">${fmtNum(f.total_cash)} / ${fmtNum(f.total_debt)}</span></div>
      `;
    }

    const profList = document.getElementById('yf-profile-list');
    if (profList) {
      profList.innerHTML = `
        <div class="breakdown-metric-row"><span class="breakdown-metric-label">Sector</span><span class="breakdown-metric-val">${escapeHtml(p.sector || 'N/A')}</span></div>
        <div class="breakdown-metric-row"><span class="breakdown-metric-label">Industry</span><span class="breakdown-metric-val">${escapeHtml(p.industry || 'N/A')}</span></div>
        <div class="breakdown-metric-row"><span class="breakdown-metric-label">Headquarters</span><span class="breakdown-metric-val">${escapeHtml(p.city ? `${p.city}, ${p.country}` : 'Global')}</span></div>
        <div class="breakdown-metric-row"><span class="breakdown-metric-label">Employees</span><span class="breakdown-metric-val">${p.full_time_employees ? Number(p.full_time_employees).toLocaleString() : 'N/A'}</span></div>
        <div class="breakdown-metric-row"><span class="breakdown-metric-label">Website</span><span class="breakdown-metric-val"><a href="${escapeHtml(p.website || '#')}" target="_blank" rel="noopener noreferrer" style="color:var(--accent);">${escapeHtml(p.website || 'N/A')}</a></span></div>
        <div class="breakdown-metric-row"><span class="breakdown-metric-label">Analyst Opinions</span><span class="breakdown-metric-val">${t.number_of_analyst_opinions || 'N/A'} analysts</span></div>
      `;
    }

    const sumEl = document.getElementById('yf-summary-text');
    if (sumEl) sumEl.textContent = data.summary || '';

    // 2. Alpha Vantage Tab
    const avBody = document.getElementById('av-breakdown-body');
    if (avBody) {
      const av = providers.alphavantage || {};
      if (av.configured && av.global_quote) {
        avBody.innerHTML = `
          <div class="breakdown-subgrid">
            <div class="breakdown-section-box">
              <h4 class="breakdown-section-title">Alpha Vantage Global Quote</h4>
              <div class="breakdown-metrics-list">
                <div class="breakdown-metric-row"><span class="breakdown-metric-label">Latest Price</span><span class="breakdown-metric-val">$${av.global_quote.price}</span></div>
                <div class="breakdown-metric-row"><span class="breakdown-metric-label">Change</span><span class="breakdown-metric-val">${av.global_quote.change} (${av.global_quote.change_percent})</span></div>
                <div class="breakdown-metric-row"><span class="breakdown-metric-label">Trading Volume</span><span class="breakdown-metric-val">${Number(av.global_quote.volume).toLocaleString()}</span></div>
                <div class="breakdown-metric-row"><span class="breakdown-metric-label">Trading Day</span><span class="breakdown-metric-val">${escapeHtml(av.global_quote.latest_trading_day)}</span></div>
              </div>
            </div>
            <div class="breakdown-section-box">
              <h4 class="breakdown-section-title">API Connection Status</h4>
              <div style="font-size:0.8rem; color:var(--text-2); line-height:1.5;">
                <p>● Live connected to <a href="https://www.alphavantage.co/" target="_blank" rel="noopener noreferrer" style="color:var(--accent);">https://www.alphavantage.co/</a></p>
                <p style="color:var(--text-3); font-size:0.75rem;">Global Quote and technical indicators active for ticker ${escapeHtml(data.ticker)}.</p>
              </div>
            </div>
          </div>
        `;
      } else {
        avBody.innerHTML = `
          <div class="api-unconfigured-banner">
            <div style="font-size:1.8rem; margin-bottom:8px;">📈</div>
            <h4 style="margin:0 0 6px 0; font-size:1rem;">Alpha Vantage API Key Not Configured</h4>
            <p style="font-size:0.8rem; color:var(--text-3); max-width:500px; margin:0 auto 14px;">
              Connect your free API key from <a href="https://www.alphavantage.co/support/#api-key" target="_blank" rel="noopener noreferrer" style="color:var(--accent);">https://www.alphavantage.co/</a> to activate live Global Quotes, currency cross-rates, and technical momentum indicators (RSI, MACD, SMA).
            </p>
            <button class="btn btn--secondary btn--sm" onclick="window.commandDeck?.showView('system');">⚙️ Configure in Settings</button>
          </div>
        `;
      }
    }

    // 3. Finnhub Tab
    const fhBody = document.getElementById('fh-breakdown-body');
    if (fhBody) {
      const fh = providers.finnhub || {};
      if (fh.configured && fh.data) {
        const qFh = fh.data.quote || {};
        const rec = fh.data.recommendation || {};
        fhBody.innerHTML = `
          <div class="breakdown-subgrid">
            <div class="breakdown-section-box">
              <h4 class="breakdown-section-title">Finnhub Real-Time Quote</h4>
              <div class="breakdown-metrics-list">
                <div class="breakdown-metric-row"><span class="breakdown-metric-label">Current Price</span><span class="breakdown-metric-val">$${qFh.current || '---'}</span></div>
                <div class="breakdown-metric-row"><span class="breakdown-metric-label">Day High / Low</span><span class="breakdown-metric-val">$${qFh.high || '---'} / $${qFh.low || '---'}</span></div>
                <div class="breakdown-metric-row"><span class="breakdown-metric-label">Open / Prev Close</span><span class="breakdown-metric-val">$${qFh.open || '---'} / $${qFh.previous_close || '---'}</span></div>
                <div class="breakdown-metric-row"><span class="breakdown-metric-label">Percent Change</span><span class="breakdown-metric-val">${qFh.percent_change ? qFh.percent_change + '%' : '---'}</span></div>
              </div>
            </div>
            <div class="breakdown-section-box">
              <h4 class="breakdown-section-title">Finnhub Analyst Consensus Breakdown</h4>
              <div class="breakdown-metrics-list">
                <div class="breakdown-metric-row"><span class="breakdown-metric-label" style="color:#10b981;">Strong Buy</span><span class="breakdown-metric-val">${rec.strongBuy ?? '---'}</span></div>
                <div class="breakdown-metric-row"><span class="breakdown-metric-label" style="color:#34d399;">Buy</span><span class="breakdown-metric-val">${rec.buy ?? '---'}</span></div>
                <div class="breakdown-metric-row"><span class="breakdown-metric-label" style="color:#a78bfa;">Hold</span><span class="breakdown-metric-val">${rec.hold ?? '---'}</span></div>
                <div class="breakdown-metric-row"><span class="breakdown-metric-label" style="color:#f87171;">Sell</span><span class="breakdown-metric-val">${rec.sell ?? '---'}</span></div>
                <div class="breakdown-metric-row"><span class="breakdown-metric-label" style="color:#ef4444;">Strong Sell</span><span class="breakdown-metric-val">${rec.strongSell ?? '---'}</span></div>
              </div>
            </div>
          </div>
        `;
      } else {
        fhBody.innerHTML = `
          <div class="api-unconfigured-banner">
            <div style="font-size:1.8rem; margin-bottom:8px;">🎯</div>
            <h4 style="margin:0 0 6px 0; font-size:1rem;">Finnhub API Key Not Configured</h4>
            <p style="font-size:0.8rem; color:var(--text-3); max-width:500px; margin:0 auto 14px;">
              Connect your free API key from <a href="https://finnhub.io/register" target="_blank" rel="noopener noreferrer" style="color:var(--accent);">https://finnhub.io/</a> to activate real-time institutional stock quotes, recommendation trends, and analyst price targets.
            </p>
            <button class="btn btn--secondary btn--sm" onclick="window.commandDeck?.showView('system');">⚙️ Configure in Settings</button>
          </div>
        `;
      }
    }

    // 4. Massive Tab
    const msBody = document.getElementById('ms-breakdown-body');
    if (msBody) {
      const ms = providers.massive || {};
      if (ms.configured) {
        msBody.innerHTML = `
          <div class="breakdown-subgrid">
            <div class="breakdown-section-box">
              <h4 class="breakdown-section-title">Massive Market Data Feeds</h4>
              <div class="breakdown-metrics-list">
                <div class="breakdown-metric-row"><span class="breakdown-metric-label">Feed Status</span><span class="breakdown-metric-val badge badge-green">${escapeHtml(ms.status)}</span></div>
                <div class="breakdown-metric-row"><span class="breakdown-metric-label">Endpoint</span><span class="breakdown-metric-val">${escapeHtml(ms.endpoint)}</span></div>
                <div class="breakdown-metric-row"><span class="breakdown-metric-label">Provider</span><span class="breakdown-metric-val">Massive High-Frequency Engine</span></div>
              </div>
            </div>
            <div class="breakdown-section-box">
              <h4 class="breakdown-section-title">Market Telemetry</h4>
              <p style="font-size:0.8rem; color:var(--text-2); line-height:1.5;">Streaming quotes and high-speed order flow connectivity verified via <a href="https://massive.com/" target="_blank" rel="noopener noreferrer" style="color:var(--accent);">https://massive.com/</a>.</p>
            </div>
          </div>
        `;
      } else {
        msBody.innerHTML = `
          <div class="api-unconfigured-banner">
            <div style="font-size:1.8rem; margin-bottom:8px;">⚡</div>
            <h4 style="margin:0 0 6px 0; font-size:1rem;">Massive Market Data Key Not Configured</h4>
            <p style="font-size:0.8rem; color:var(--text-3); max-width:500px; margin:0 auto 14px;">
              Connect your API token from <a href="https://massive.com/" target="_blank" rel="noopener noreferrer" style="color:var(--accent);">https://massive.com/</a> to activate high-throughput order book telemetry and aggregated trade streams.
            </p>
            <button class="btn btn--secondary btn--sm" onclick="window.commandDeck?.showView('system');">⚙️ Configure in Settings</button>
          </div>
        `;
      }
    }

    // 5. FMP Tab
    const fmpBody = document.getElementById('fmp-breakdown-body');
    if (fmpBody) {
      const fmp = providers.fmp || {};
      if (fmp.configured && fmp.data) {
        const d = fmp.data;
        const r = d.ratios || {};
        const isUnder = d.differential_pct != null && d.differential_pct > 0;
        const diffBadge = d.differential_pct != null 
          ? `<span class="badge ${isUnder ? 'badge-green' : 'badge-rose'}">${isUnder ? '+' : ''}${d.differential_pct}% (${escapeHtml(d.verdict)})</span>`
          : `<span class="badge badge-purple">${escapeHtml(d.verdict || 'Fair Value')}</span>`;

        fmpBody.innerHTML = `
          <div class="breakdown-subgrid">
            <div class="breakdown-section-box">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                <h4 class="breakdown-section-title" style="margin:0;">DCF Intrinsic Valuation Model</h4>
                ${diffBadge}
              </div>
              <div class="breakdown-metrics-list">
                <div class="breakdown-metric-row"><span class="breakdown-metric-label">Estimated DCF Value</span><span class="breakdown-metric-val" style="font-weight:700; color:var(--accent);">$${d.dcf_intrinsic_value != null ? Number(d.dcf_intrinsic_value).toFixed(2) : '---'}</span></div>
                <div class="breakdown-metric-row"><span class="breakdown-metric-label">Reference Stock Price</span><span class="breakdown-metric-val">$${d.current_price != null ? Number(d.current_price).toFixed(2) : '---'}</span></div>
                <div class="breakdown-metric-row"><span class="breakdown-metric-label">Valuation Spread</span><span class="breakdown-metric-val ${isUnder ? 'market-gain' : 'market-loss'}">${d.differential_pct != null ? `${isUnder ? '+' : ''}${d.differential_pct}%` : '---'}</span></div>
                <div class="breakdown-metric-row"><span class="breakdown-metric-label">Model Engine</span><span class="breakdown-metric-val">Financial Modeling Prep DCF</span></div>
              </div>
            </div>
            <div class="breakdown-section-box">
              <h4 class="breakdown-section-title">Institutional Key Ratios (TTM)</h4>
              <div class="breakdown-metrics-list">
                <div class="breakdown-metric-row"><span class="breakdown-metric-label">Return on Equity (ROE)</span><span class="breakdown-metric-val">${r.roe != null ? (r.roe * 100).toFixed(2) + '%' : '---'}</span></div>
                <div class="breakdown-metric-row"><span class="breakdown-metric-label">Return on Assets (ROA)</span><span class="breakdown-metric-val">${r.roa != null ? (r.roa * 100).toFixed(2) + '%' : '---'}</span></div>
                <div class="breakdown-metric-row"><span class="breakdown-metric-label">Debt-to-Equity</span><span class="breakdown-metric-val">${r.debt_to_equity != null ? Number(r.debt_to_equity).toFixed(2) : '---'}</span></div>
                <div class="breakdown-metric-row"><span class="breakdown-metric-label">Current Ratio (Liquidity)</span><span class="breakdown-metric-val">${r.current_ratio != null ? Number(r.current_ratio).toFixed(2) : '---'}</span></div>
                <div class="breakdown-metric-row"><span class="breakdown-metric-label">Net Profit Margin</span><span class="breakdown-metric-val">${r.net_margin != null ? (r.net_margin * 100).toFixed(2) + '%' : '---'}</span></div>
                <div class="breakdown-metric-row"><span class="breakdown-metric-label">Price to Free Cash Flow</span><span class="breakdown-metric-val">${r.price_to_fcf != null ? Number(r.price_to_fcf).toFixed(2) : '---'}</span></div>
              </div>
            </div>
          </div>
        `;
      } else {
        fmpBody.innerHTML = `
          <div class="api-unconfigured-banner">
            <div style="font-size:1.8rem; margin-bottom:8px;">🏛️</div>
            <h4 style="margin:0 0 6px 0; font-size:1rem;">Financial Modeling Prep (FMP) Key Not Configured</h4>
            <p style="font-size:0.8rem; color:var(--text-3); max-width:500px; margin:0 auto 14px;">
              Connect your API key from <a href="https://site.financialmodelingprep.com/developer/docs" target="_blank" rel="noopener noreferrer" style="color:var(--accent);">https://site.financialmodelingprep.com/</a> to unlock automated DCF intrinsic valuation models, capital structure ratios, and enterprise value multiples.
            </p>
            <button class="btn btn--secondary btn--sm" onclick="window.commandDeck?.showView('system');">⚙️ Configure in Settings</button>
          </div>
        `;
      }
    }

    // 6. Twelve Data Tab
    const tdBody = document.getElementById('td-breakdown-body');
    if (tdBody) {
      const td = providers.twelvedata || {};
      if (td.configured && td.data) {
        const qTd = td.data.quote || {};
        const rsi = td.data.rsi || {};
        const rsiVal = rsi.value != null ? rsi.value : 50;
        let rsiClass = 'badge-purple';
        if (rsiVal > 70) rsiClass = 'badge-rose';
        else if (rsiVal < 30) rsiClass = 'badge-green';

        tdBody.innerHTML = `
          <div class="breakdown-subgrid">
            <div class="breakdown-section-box">
              <h4 class="breakdown-section-title">Twelve Data Real-Time Stream</h4>
              <div class="breakdown-metrics-list">
                <div class="breakdown-metric-row"><span class="breakdown-metric-label">Live Price</span><span class="breakdown-metric-val">$${qTd.price || '---'}</span></div>
                <div class="breakdown-metric-row"><span class="breakdown-metric-label">Change</span><span class="breakdown-metric-val">${qTd.change != null ? (qTd.change >= 0 ? '+' : '') + qTd.change : '---'} (${escapeHtml(qTd.percent_change || '0%')})</span></div>
                <div class="breakdown-metric-row"><span class="breakdown-metric-label">Exchange / Venue</span><span class="breakdown-metric-val">${escapeHtml(qTd.exchange || 'N/A')}</span></div>
                <div class="breakdown-metric-row"><span class="breakdown-metric-label">Market Status</span><span class="breakdown-metric-val badge ${qTd.is_market_open ? 'badge-green' : 'badge-subtle'}">${qTd.is_market_open ? 'Open' : 'Closed'}</span></div>
              </div>
            </div>
            <div class="breakdown-section-box">
              <h4 class="breakdown-section-title">Technical Momentum Indicators</h4>
              <div class="breakdown-metrics-list">
                <div class="breakdown-metric-row"><span class="breakdown-metric-label">14-Day RSI</span><span class="breakdown-metric-val" style="font-weight:700;">${rsi.value != null ? rsi.value : '---'}</span></div>
                <div class="breakdown-metric-row"><span class="breakdown-metric-label">Momentum Signal</span><span class="breakdown-metric-val badge ${rsiClass}">${escapeHtml(rsi.signal || 'Neutral')}</span></div>
                <div class="breakdown-metric-row"><span class="breakdown-metric-label">Signal Timestamp</span><span class="breakdown-metric-val">${escapeHtml(rsi.date || 'Today')}</span></div>
                <div class="breakdown-metric-row"><span class="breakdown-metric-label">Data Provider</span><span class="breakdown-metric-val"><a href="https://twelvedata.com/" target="_blank" rel="noopener noreferrer" style="color:var(--accent);">Twelve Data API</a></span></div>
              </div>
            </div>
          </div>
        `;
      } else {
        tdBody.innerHTML = `
          <div class="api-unconfigured-banner">
            <div style="font-size:1.8rem; margin-bottom:8px;">📊</div>
            <h4 style="margin:0 0 6px 0; font-size:1rem;">Twelve Data API Key Not Configured</h4>
            <p style="font-size:0.8rem; color:var(--text-3); max-width:500px; margin:0 auto 14px;">
              Connect your free API key from <a href="https://twelvedata.com/" target="_blank" rel="noopener noreferrer" style="color:var(--accent);">https://twelvedata.com/</a> to activate real-time quotes, multi-exchange order data, and technical indicator streams (14-day RSI, MACD, Moving Averages).
            </p>
            <button class="btn btn--secondary btn--sm" onclick="window.commandDeck?.showView('system');">⚙️ Configure in Settings</button>
          </div>
        `;
      }
    }

    // 7. FRED Tab
    const fredBody = document.getElementById('fred-breakdown-body');
    if (fredBody) {
      const fred = providers.fred || {};
      if (fred.configured && fred.data) {
        const m = fred.data;
        const ff = m.fed_funds?.value != null ? m.fed_funds.value + '%' : '5.33%';
        const t10 = m.treasury_10y?.value != null ? m.treasury_10y.value + '%' : '4.15%';
        const spread = m.yield_curve_spread?.value != null ? (m.yield_curve_spread.value >= 0 ? '+' : '') + m.yield_curve_spread.value + '%' : '+0.15%';
        const cpi = m.cpi_inflation?.value != null ? m.cpi_inflation.value : '314.8';
        const unemp = m.unemployment?.value != null ? m.unemployment.value + '%' : '4.1%';
        const isInverted = m.curve_status && m.curve_status.includes('Inverted');

        fredBody.innerHTML = `
          <div class="breakdown-subgrid">
            <div class="breakdown-section-box">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                <h4 class="breakdown-section-title" style="margin:0;">Federal Reserve Macro Benchmarks</h4>
                <span class="badge ${isInverted ? 'badge-rose' : 'badge-green'}">${escapeHtml(m.curve_status || 'Normal Yield Curve')}</span>
              </div>
              <div class="breakdown-metrics-list">
                <div class="breakdown-metric-row"><span class="breakdown-metric-label">Fed Funds Effective Rate</span><span class="breakdown-metric-val" style="font-weight:700;">${ff}</span></div>
                <div class="breakdown-metric-row"><span class="breakdown-metric-label">10-Year Treasury Constant Maturity</span><span class="breakdown-metric-val" style="font-weight:700;">${t10}</span></div>
                <div class="breakdown-metric-row"><span class="breakdown-metric-label">10Y-2Y Treasury Yield Spread</span><span class="breakdown-metric-val ${isInverted ? 'market-loss' : 'market-gain'}">${spread}</span></div>
                <div class="breakdown-metric-row"><span class="breakdown-metric-label">US Civilian Unemployment Rate</span><span class="breakdown-metric-val">${unemp}</span></div>
                <div class="breakdown-metric-row"><span class="breakdown-metric-label">Consumer Price Index (CPI)</span><span class="breakdown-metric-val">${cpi}</span></div>
              </div>
            </div>
            <div class="breakdown-section-box">
              <h4 class="breakdown-section-title">Valuation & Discount Rate Implications</h4>
              <div style="font-size:0.8rem; color:var(--text-2); line-height:1.5;">
                <p>The 10-Year Treasury Yield serves as the risk-free rate (\(R_f\)) benchmark for DCF discount rates and equity risk premia.</p>
                <p style="margin-top:8px; color:var(--text-3);">
                  Source: <a href="https://fred.stlouisfed.org/" target="_blank" rel="noopener noreferrer" style="color:var(--accent);">Federal Reserve Bank of St. Louis (FRED API)</a>. Real-time macroeconomic series updated daily.
                </p>
              </div>
            </div>
          </div>
        `;
      } else {
        fredBody.innerHTML = `
          <div class="api-unconfigured-banner">
            <div style="font-size:1.8rem; margin-bottom:8px;">🏦</div>
            <h4 style="margin:0 0 6px 0; font-size:1rem;">FRED API Key Not Configured</h4>
            <p style="font-size:0.8rem; color:var(--text-3); max-width:500px; margin:0 auto 14px;">
              Connect your free API key from <a href="https://fred.stlouisfed.org/docs/api/api_key.html" target="_blank" rel="noopener noreferrer" style="color:var(--accent);">https://fred.stlouisfed.org/</a> to activate macroeconomic discount benchmarks, yield curve inversion tracking, and Federal Reserve policy indicators.
            </p>
            <button class="btn btn--secondary btn--sm" onclick="window.commandDeck?.showView('system');">⚙️ Configure in Settings</button>
          </div>
        `;
      }
    }

    // Provider Tabs Switching
    document.querySelectorAll('.breakdown-tab-btn').forEach(btn => {
      btn.onclick = () => {
        document.querySelectorAll('.breakdown-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const tab = btn.dataset.tab;
        document.querySelectorAll('.breakdown-tab-pane').forEach(p => p.style.display = 'none');
        const targetPane = document.getElementById(`tab-pane-${tab}`);
        if (targetPane) targetPane.style.display = 'block';
      };
    });

  } catch (err) {
    console.warn('Error loading ticker breakdown:', err);
  }
};

CommandDeck.prototype.initSystemSettings = function() {
  const settingsPanel = document.getElementById('system-settings-panel');
  if (settingsPanel) {
    settingsPanel.querySelectorAll('input').forEach(input => {
      if (!input.dataset.dirtyBound) {
        input.dataset.dirtyBound = 'true';
        input.addEventListener('input', () => {
          input.dataset.dirty = 'true';
        });
      }
    });
  }

  const saveBtn = document.getElementById('btn-save-system-settings');
  if (saveBtn && !saveBtn.dataset.initDone) {
    saveBtn.dataset.initDone = 'true';
    saveBtn.onclick = async () => {
      const payload = {};

      const checkField = (inp, key, isSecret = false) => {
        if (!inp) return;
        const v = inp.value;
        if (isSecret && (v.includes('•••') || v.includes('••••'))) {
          return; // Unmodified masked secret from server
        }
        if (inp.dataset.dirty === 'true' || (!isSecret && v.trim() !== '') || (isSecret && v !== '')) {
          payload[key] = v.trim();
        }
      };

      // Homelab & Automation inputs
      checkField(document.getElementById('input-url-n8n'), 'n8n_url');
      checkField(document.getElementById('input-key-n8n'), 'n8n_api_key', true);
      checkField(document.getElementById('input-mcp-n8n'), 'n8n_mcp_token', true);

      checkField(document.getElementById('input-url-hass'), 'hass_url');
      checkField(document.getElementById('input-token-hass'), 'hass_token', true);

      checkField(document.getElementById('input-url-searxng'), 'searxng_url');
      checkField(document.getElementById('input-url-pg'), 'pg_url');

      checkField(document.getElementById('input-url-inference-main'), 'inference_node_main');
      checkField(document.getElementById('input-url-inference-vision'), 'inference_node_vision');
      checkField(document.getElementById('input-url-inference-vllm'), 'inference_node_vllm');
      checkField(document.getElementById('input-key-inference'), 'inference_api_key', true);

      checkField(document.getElementById('input-key-elevenlabs'), 'elevenlabs_api_key', true);

      // Homelab Applications inputs
      checkField(document.getElementById('input-url-deerflow'), 'deerflow_url');
      checkField(document.getElementById('input-key-deerflow'), 'deerflow_api_key', true);
      checkField(document.getElementById('input-url-vane'), 'vane_url');
      checkField(document.getElementById('input-key-vane'), 'vane_api_key', true);
      checkField(document.getElementById('input-url-openwebui'), 'openwebui_url');
      checkField(document.getElementById('input-key-openwebui'), 'openwebui_api_key', true);
      checkField(document.getElementById('input-url-audiobookshelf'), 'audiobookshelf_url');
      checkField(document.getElementById('input-token-audiobookshelf'), 'audiobookshelf_token', true);
      checkField(document.getElementById('input-url-booklore'), 'booklore_url');
      checkField(document.getElementById('input-key-booklore'), 'booklore_api_key', true);
      checkField(document.getElementById('input-url-immich'), 'immich_url');
      checkField(document.getElementById('input-key-immich'), 'immich_api_key', true);
      checkField(document.getElementById('input-url-nextcloud'), 'nextcloud_url');
      checkField(document.getElementById('input-user-nextcloud'), 'nextcloud_user');
      checkField(document.getElementById('input-token-nextcloud'), 'nextcloud_token', true);
      checkField(document.getElementById('input-url-seer'), 'seer_url');
      checkField(document.getElementById('input-key-seer'), 'seer_api_key', true);
      checkField(document.getElementById('input-url-freshrss'), 'freshrss_url');
      checkField(document.getElementById('input-user-freshrss'), 'freshrss_user');
      checkField(document.getElementById('input-key-freshrss'), 'freshrss_api_key', true);
      checkField(document.getElementById('input-url-godseye'), 'godseye_url');
      checkField(document.getElementById('input-key-godseye'), 'godseye_api_key', true);

      // Financial API inputs
      checkField(document.getElementById('input-key-alphavantage'), 'alphavantage_api_key', true);
      checkField(document.getElementById('input-key-massive'), 'massive_api_key', true);
      checkField(document.getElementById('input-key-finnhub'), 'finnhub_api_key', true);
      checkField(document.getElementById('input-key-fmp'), 'fmp_api_key', true);
      checkField(document.getElementById('input-key-twelvedata'), 'twelvedata_api_key', true);
      checkField(document.getElementById('input-key-fred'), 'fred_api_key', true);

      try {
        const res = await fetch(`${this.apiBase}/api/system/settings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          if (typeof this.showToast === 'function') {
            this.showToast('Settings successfully saved and synchronized with .env!', 'success');
          }
          await this.loadSystemSettings();
        }
      } catch (err) {
        console.warn('Error saving system settings:', err);
      }
    };
  }

  // Toggle key visibility
  document.querySelectorAll('.btn-toggle-key').forEach(btn => {
    if (btn.dataset.initDone) return;
    btn.dataset.initDone = 'true';
    btn.onclick = () => {
      const targetId = btn.dataset.target;
      const inp = document.getElementById(targetId);
      if (inp) {
        inp.type = inp.type === 'password' ? 'text' : 'password';
      }
    };
  });

  // Test connection buttons
  document.querySelectorAll('.btn-test-connection').forEach(btn => {
    if (btn.dataset.initDone) return;
    btn.dataset.initDone = 'true';
    btn.onclick = async () => {
      const provider = btn.dataset.provider;
      const msgEl = document.getElementById(`msg-${provider}`);
      if (msgEl) {
        msgEl.className = 'setting-status-msg';
        msgEl.textContent = 'Testing connection...';
      }

      // Check if user typed a key in the input
      let typedKey = '';
      const keyInp = document.getElementById(`input-key-${provider}`);
      if (keyInp && keyInp.value && !keyInp.value.includes('•••')) {
        typedKey = keyInp.value.trim();
      }

      let typedUrl = '';
      const urlInp = document.getElementById(`input-url-${provider}`);
      if (urlInp && urlInp.value) {
        typedUrl = urlInp.value.trim();
      }

      try {
        const res = await fetch(`${this.apiBase}/api/system/settings/test`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            provider,
            api_key: typedKey,
            api_url: typedUrl
          })
        });
        const data = await res.json();
        if (msgEl) {
          msgEl.className = `setting-status-msg ${data.status === 'ok' ? 'success' : 'error'}`;
          msgEl.textContent = data.message || (data.status === 'ok' ? 'Connection successful!' : 'Connection failed.');
        }
      } catch (err) {
        if (msgEl) {
          msgEl.className = 'setting-status-msg error';
          msgEl.textContent = 'Error testing connection: ' + err.message;
        }
      }
    };
  });

  // Wire "Configure in Settings" buttons anywhere in the dashboard
  document.querySelectorAll('.btn-goto-system-settings').forEach(btn => {
    if (btn.dataset.initDone) return;
    btn.dataset.initDone = 'true';
    btn.onclick = (e) => {
      e.preventDefault();
      if (typeof this.switchView === 'function') {
        this.switchView('system');
      } else if (typeof this.showView === 'function') {
        this.showView('system');
      } else {
        const sysLink = document.querySelector('.sidebar-link[data-view="system"]');
        if (sysLink) sysLink.click();
      }
    };
  });

  this.loadSystemSettings();
};

CommandDeck.prototype.loadSystemSettings = async function() {
  try {
    const res = await fetch(`${this.apiBase}/api/system/settings`);
    if (!res.ok) return;
    const settings = await res.json();
    this.systemSettings = settings;

    const updateBadge = (badgeEl, isConfigured) => {
      if (!badgeEl) return;
      badgeEl.textContent = isConfigured ? '● Configured' : '○ Not Configured';
      badgeEl.className = isConfigured ? 'badge badge-green' : 'badge badge-amber';
    };

    const setField = (inp, val) => {
      if (!inp) return;
      inp.value = val || '';
      inp.dataset.dirty = 'false';
    };

    // Homelab & Automation
    if (settings.n8n) {
      updateBadge(document.getElementById('setting-badge-n8n'), settings.n8n.configured);
      setField(document.getElementById('input-url-n8n'), settings.n8n.url);
      setField(document.getElementById('input-key-n8n'), settings.n8n.masked_key);
      setField(document.getElementById('input-mcp-n8n'), settings.n8n.masked_mcp_token);

      const n8nLink = document.getElementById('n8n-external-link');
      if (n8nLink && settings.n8n.url) {
        n8nLink.href = settings.n8n.url;
      }
    }

    if (settings.homeassistant) {
      updateBadge(document.getElementById('setting-badge-homeassistant'), settings.homeassistant.configured);
      setField(document.getElementById('input-url-hass'), settings.homeassistant.url);
      setField(document.getElementById('input-token-hass'), settings.homeassistant.masked_token);

      const haLink = document.getElementById('ha-external-link');
      if (haLink && settings.homeassistant.url) {
        haLink.href = settings.homeassistant.url;
      }
    }

    if (settings.searxng) {
      updateBadge(document.getElementById('setting-badge-searxng'), settings.searxng.configured);
      setField(document.getElementById('input-url-searxng'), settings.searxng.url);
    }

    if (settings.pgvector) {
      updateBadge(document.getElementById('setting-badge-pgvector'), settings.pgvector.configured);
      setField(document.getElementById('input-url-pg'), settings.pgvector.url);
    }

    if (settings.inference) {
      updateBadge(document.getElementById('setting-badge-inference'), settings.inference.configured);
      setField(document.getElementById('input-url-inference-main'), settings.inference.node_main);
      setField(document.getElementById('input-url-inference-vision'), settings.inference.node_vision);
      setField(document.getElementById('input-url-inference-vllm'), settings.inference.node_vllm);
      setField(document.getElementById('input-key-inference'), settings.inference.masked_key);
    }

    if (settings.elevenlabs) {
      updateBadge(document.getElementById('setting-badge-elevenlabs'), settings.elevenlabs.configured);
      setField(document.getElementById('input-key-elevenlabs'), settings.elevenlabs.masked_key);
    }

    // Homelab Applications
    const homelabServices = ['deerflow', 'vane', 'openwebui', 'audiobookshelf', 'booklore', 'immich', 'nextcloud', 'seer', 'freshrss', 'godseye'];
    homelabServices.forEach(s => {
      const cfg = settings[s];
      if (!cfg) return;
      updateBadge(document.getElementById(`setting-badge-${s}`), cfg.configured);
      setField(document.getElementById(`input-url-${s}`), cfg.url);
      setField(document.getElementById(`input-key-${s}`) || document.getElementById(`input-token-${s}`), cfg.masked_key || cfg.masked_token);
      setField(document.getElementById(`input-user-${s}`), cfg.user);
      const linkEl = document.getElementById(`link-setting-${s}`);
      const extLink = document.getElementById(`${s}-external-link`);

      if (linkEl && cfg.url) {
        linkEl.href = cfg.url;
        linkEl.textContent = cfg.url;
      }
      if (extLink && cfg.url) {
        extLink.href = cfg.url;
      }
    });

    // Financial APIs
    updateBadge(document.getElementById('setting-badge-alphavantage'), settings.alphavantage?.configured);
    updateBadge(document.getElementById('setting-badge-massive'), settings.massive?.configured);
    updateBadge(document.getElementById('setting-badge-finnhub'), settings.finnhub?.configured);
    updateBadge(document.getElementById('setting-badge-fmp'), settings.fmp?.configured);
    updateBadge(document.getElementById('setting-badge-twelvedata'), settings.twelvedata?.configured);
    updateBadge(document.getElementById('setting-badge-fred'), settings.fred?.configured);

    setField(document.getElementById('input-key-alphavantage'), settings.alphavantage?.masked_key);
    setField(document.getElementById('input-key-massive'), settings.massive?.masked_key);
    setField(document.getElementById('input-key-finnhub'), settings.finnhub?.masked_key);
    setField(document.getElementById('input-key-fmp'), settings.fmp?.masked_key);
    setField(document.getElementById('input-key-twelvedata'), settings.twelvedata?.masked_key);
    setField(document.getElementById('input-key-fred'), settings.fred?.masked_key);
  } catch (err) {
    console.warn('Failed to load system settings:', err);
  }
};


// ── 5. SearXNG Private Metasearch Omnibar ───────────────────────────────────────

CommandDeck.prototype.openSearXNGModal = function(initialQuery = '', category = 'general') {
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
  const queryInput = document.getElementById('searxng-query-input');
  if (queryInput) {
    if (initialQuery) {
      queryInput.value = initialQuery;
      this.executeSearXNG(initialQuery, category);
    }
    setTimeout(() => queryInput.focus(), 50);
  }
};

CommandDeck.prototype.initHeaderOmnibar = function() {
  const searchInput = document.getElementById('global-search');
  const dropdown = document.getElementById('header-search-dropdown');
  const webSection = document.getElementById('search-dropdown-web');
  const wikiSection = document.getElementById('search-dropdown-wiki');
  const wikiTitle = document.getElementById('search-dropdown-wiki-title');
  const container = document.getElementById('header-search-container');

  if (!searchInput || !dropdown) return;
  if (searchInput.dataset.omnibarInit === 'true') return;
  searchInput.dataset.omnibarInit = 'true';

  let debounceTimer = null;
  let selectedIdx = -1;

  const closeDropdown = () => {
    dropdown.style.display = 'none';
    selectedIdx = -1;
  };

  const getVisibleItems = () => Array.from(dropdown.querySelectorAll('.search-dropdown-item'));

  const updateSelected = (items) => {
    items.forEach((it, idx) => {
      it.classList.toggle('selected', idx === selectedIdx);
    });
  };

  searchInput.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    const query = searchInput.value.trim();

    if (!query) {
      closeDropdown();
      return;
    }

    selectedIdx = -1;

    // Omnibar Slash Commands: /task, /ha, /n8n, /market, /note
    if (query.startsWith('/')) {
      const lower = query.toLowerCase();
      let cmdHtml = '';

      if (lower.startsWith('/task')) {
        const title = query.replace(/^\/task\s*/i, '').trim();
        cmdHtml = `
          <div class="search-dropdown-item search-dropdown-web-action" id="dropdown-cmd-action">
            <span class="search-dropdown-item-icon">📋</span>
            <div class="search-dropdown-item-content">
              <div class="search-dropdown-item-title">
                ${title ? `Create Task: <span style="font-weight:700; color:var(--text-1);">${escapeHtml(title)}</span>` : 'Create Task in Pipeline'}
              </div>
              <div class="search-dropdown-item-snippet">${title ? 'Press ↵ Enter to save task immediately' : 'Type /task <task title> and press Enter'}</div>
            </div>
            <span class="badge badge-purple" style="font-size:0.65rem; padding:2px 6px;">/task</span>
          </div>`;
      } else if (lower.startsWith('/ha')) {
        const cmd = query.replace(/^\/ha\s*/i, '').trim();
        cmdHtml = `
          <div class="search-dropdown-item search-dropdown-web-action" id="dropdown-cmd-action">
            <span class="search-dropdown-item-icon">🏠</span>
            <div class="search-dropdown-item-content">
              <div class="search-dropdown-item-title">
                ${cmd ? `Home Assistant: <span style="font-weight:700; color:var(--text-1);">${escapeHtml(cmd)}</span>` : 'Home Assistant Smart Home'}
              </div>
              <div class="search-dropdown-item-snippet">Press ↵ Enter to switch to Smart Home controls</div>
            </div>
            <span class="badge badge-cyan" style="font-size:0.65rem; padding:2px 6px;">/ha</span>
          </div>`;
      } else if (lower.startsWith('/n8n')) {
        const actionId = query.replace(/^\/n8n\s*/i, '').trim();
        cmdHtml = `
          <div class="search-dropdown-item search-dropdown-web-action" id="dropdown-cmd-action">
            <span class="search-dropdown-item-icon">⚡</span>
            <div class="search-dropdown-item-content">
              <div class="search-dropdown-item-title">
                ${actionId ? `Trigger n8n Workflow: <span style="font-weight:700; color:var(--text-1);">${escapeHtml(actionId)}</span>` : 'Automations Orchestrator'}
              </div>
              <div class="search-dropdown-item-snippet">${actionId ? 'Press ↵ Enter to trigger automation workflow' : 'Type /n8n <action_id> or press Enter to open n8n view'}</div>
            </div>
            <span class="badge badge-primary" style="font-size:0.65rem; padding:2px 6px;">/n8n</span>
          </div>`;
      } else if (lower.startsWith('/market')) {
        const sym = query.replace(/^\/market\s*/i, '').trim().toUpperCase();
        cmdHtml = `
          <div class="search-dropdown-item search-dropdown-web-action" id="dropdown-cmd-action">
            <span class="search-dropdown-item-icon">📈</span>
            <div class="search-dropdown-item-content">
              <div class="search-dropdown-item-title">
                ${sym ? `Analyze Market Asset: <span style="font-weight:700; color:var(--text-1);">$${escapeHtml(sym)}</span>` : 'Financial Markets'}
              </div>
              <div class="search-dropdown-item-snippet">${sym ? `Press ↵ Enter to load candlestick chart for ${sym}` : 'Type /market <symbol> (e.g. /market NVDA)'}</div>
            </div>
            <span class="badge badge-ok" style="font-size:0.65rem; padding:2px 6px;">/market</span>
          </div>`;
      } else if (lower.startsWith('/note')) {
        const noteRaw = query.replace(/^\/note\s*/i, '').trim();
        const parts = noteRaw.split('|');
        const title = (parts[0] || '').trim();
        const content = (parts[1] || '').trim();
        cmdHtml = `
          <div class="search-dropdown-item search-dropdown-web-action" id="dropdown-cmd-action">
            <span class="search-dropdown-item-icon">📝</span>
            <div class="search-dropdown-item-content">
              <div class="search-dropdown-item-title">
                ${title ? `Save Note to Active Wiki: <span style="font-weight:700; color:var(--text-1);">${escapeHtml(title)}</span>` : 'Quick Note to Active Wiki'}
              </div>
              <div class="search-dropdown-item-snippet">${title ? 'Press ↵ Enter to save note to active-wiki/' : 'Usage: /note <title> | <content>'}</div>
            </div>
            <span class="badge badge-purple" style="font-size:0.65rem; padding:2px 6px;">/note</span>
          </div>`;
      } else {
        cmdHtml = `
          <div class="search-dropdown-item search-dropdown-web-action" data-slash="/task ">
            <span class="search-dropdown-item-icon">📋</span>
            <div class="search-dropdown-item-content">
              <div class="search-dropdown-item-title"><strong>/task</strong> &lt;title&gt;</div>
              <div class="search-dropdown-item-snippet">Quickly create a task in the pipeline</div>
            </div>
          </div>
          <div class="search-dropdown-item search-dropdown-web-action" data-slash="/ha ">
            <span class="search-dropdown-item-icon">🏠</span>
            <div class="search-dropdown-item-content">
              <div class="search-dropdown-item-title"><strong>/ha</strong> &lt;entity&gt;</div>
              <div class="search-dropdown-item-snippet">Home Assistant smart home control</div>
            </div>
          </div>
          <div class="search-dropdown-item search-dropdown-web-action" data-slash="/n8n ">
            <span class="search-dropdown-item-icon">⚡</span>
            <div class="search-dropdown-item-content">
              <div class="search-dropdown-item-title"><strong>/n8n</strong> &lt;action_id&gt;</div>
              <div class="search-dropdown-item-snippet">Trigger n8n workflow quick actions</div>
            </div>
          </div>
          <div class="search-dropdown-item search-dropdown-web-action" data-slash="/market ">
            <span class="search-dropdown-item-icon">📈</span>
            <div class="search-dropdown-item-content">
              <div class="search-dropdown-item-title"><strong>/market</strong> &lt;symbol&gt;</div>
              <div class="search-dropdown-item-snippet">Load candlestick chart for ticker (e.g. /market NVDA)</div>
            </div>
          </div>
          <div class="search-dropdown-item search-dropdown-web-action" data-slash="/note ">
            <span class="search-dropdown-item-icon">📝</span>
            <div class="search-dropdown-item-content">
              <div class="search-dropdown-item-title"><strong>/note</strong> &lt;title&gt; | &lt;content&gt;</div>
              <div class="search-dropdown-item-snippet">Directly save a note to the Active Wiki</div>
            </div>
          </div>
        `;
      }

      if (webSection) {
        webSection.innerHTML = cmdHtml;
        const singleAction = document.getElementById('dropdown-cmd-action');
        if (singleAction) {
          singleAction.onclick = async () => {
            closeDropdown();
            searchInput.value = '';
            if (lower.startsWith('/task')) {
              const title = query.replace(/^\/task\s*/i, '').trim();
              if (title) {
                try {
                  const res = await fetch(`${this.apiBase}/api/tasks`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ title, status: 'todo' })
                  });
                  if (res.ok) {
                    this.showToast?.(`Task created: ${title}`, 'success');
                    if (typeof this.fetchTasks === 'function') this.fetchTasks();
                  }
                } catch (e) {
                  this.showToast?.(`Task creation error: ${e.message}`, 'error');
                }
              } else {
                this.openCreateModal?.('task');
              }
            } else if (lower.startsWith('/ha')) {
              this.showView?.('homeassistant');
            } else if (lower.startsWith('/n8n')) {
              const actionId = query.replace(/^\/n8n\s*/i, '').trim();
              if (actionId && typeof this.triggerN8nQuickAction === 'function') {
                this.triggerN8nQuickAction(actionId);
              } else {
                this.showView?.('n8n');
              }
            } else if (lower.startsWith('/market')) {
              const sym = query.replace(/^\/market\s*/i, '').trim().toUpperCase();
              this.showView?.('markets');
              if (sym && typeof this.loadTickerChart === 'function') {
                setTimeout(() => this.loadTickerChart(sym), 100);
              }
            } else if (lower.startsWith('/note')) {
              const noteRaw = query.replace(/^\/note\s*/i, '').trim();
              const parts = noteRaw.split('|');
              const title = (parts[0] || '').trim();
              const content = (parts[1] || '').trim();
              if (title && typeof this.createQuickVaultNote === 'function') {
                this.createQuickVaultNote(title, content);
              } else {
                this.showView?.('vault');
              }
            }
          };
        }

        webSection.querySelectorAll('[data-slash]').forEach(item => {
          item.onclick = () => {
            searchInput.value = item.dataset.slash;
            searchInput.focus();
            searchInput.dispatchEvent(new Event('input'));
          };
        });
      }

      if (wikiTitle) wikiTitle.style.display = 'none';
      if (wikiSection) wikiSection.innerHTML = '';
      dropdown.style.display = 'flex';
      return;
    }

    // Direct Ticker shortcut: $NVDA, $BTC, etc.
    if (query.startsWith('$') && query.length > 1) {
      const sym = query.substring(1).trim().toUpperCase();
      if (webSection) {
        webSection.innerHTML = `
          <div class="search-dropdown-item search-dropdown-web-action" id="dropdown-cmd-action">
            <span class="search-dropdown-item-icon">📈</span>
            <div class="search-dropdown-item-content">
              <div class="search-dropdown-item-title">
                Analyze Market Asset: <span style="font-weight:700; color:var(--text-1);">$${escapeHtml(sym)}</span>
              </div>
              <div class="search-dropdown-item-snippet">Press ↵ Enter to load candlestick chart on Markets view</div>
            </div>
            <span class="badge badge-ok" style="font-size:0.65rem; padding:2px 6px;">Markets</span>
          </div>`;
        const action = document.getElementById('dropdown-cmd-action');
        if (action) {
          action.onclick = () => {
            closeDropdown();
            searchInput.value = '';
            this.showView?.('markets');
            setTimeout(() => this.loadTickerChart?.(sym), 100);
          };
        }
      }
      if (wikiTitle) wikiTitle.style.display = 'none';
      if (wikiSection) wikiSection.innerHTML = '';
      dropdown.style.display = 'flex';
      return;
    }

    // 1. Render immediate web search action via SearXNG
    if (webSection) {
      webSection.innerHTML = `
        <div class="search-dropdown-item search-dropdown-web-action" id="dropdown-item-web">
          <span class="search-dropdown-item-icon">🌐</span>
          <div class="search-dropdown-item-content">
            <div class="search-dropdown-item-title">
              Search Web via SearXNG for <span style="font-weight:700; color:var(--text-1); margin-left:4px;">"${escapeHtml(query)}"</span>
            </div>
            <div class="search-dropdown-item-snippet">Query private metasearch engine (Google, Bing, ArXiv, GitHub) • Press ↵ Enter</div>
          </div>
          <span class="badge badge-purple" style="font-size:0.65rem; padding:2px 6px;">SearXNG</span>
        </div>`;

      const webItem = document.getElementById('dropdown-item-web');
      if (webItem) {
        webItem.onclick = () => {
          closeDropdown();
          this.openSearXNGModal(query);
        };
      }
    }

    dropdown.style.display = 'flex';

    // 2. Fetch predictive text matches from Knowledge Base Wikis (Active Wiki & Oracle Brain)
    debounceTimer = setTimeout(async () => {
      try {
        const res = await fetch(`${this.apiBase}/api/wiki/search?q=${encodeURIComponent(query)}`);
        if (!res.ok) return;
        const results = await res.json();

        if (results && results.length > 0) {
          if (wikiTitle) wikiTitle.style.display = 'block';
          if (wikiSection) {
            wikiSection.innerHTML = results.slice(0, 8).map(item => `
              <div class="search-dropdown-item search-dropdown-wiki-item" data-path="${escapeHtml(item.path)}" data-title="${escapeHtml(item.title)}" data-tier="${escapeHtml(item.tier)}">
                <span class="search-dropdown-item-icon">${item.tier.includes('Oracle') ? '🧠' : '📄'}</span>
                <div class="search-dropdown-item-content">
                  <div class="search-dropdown-item-title">
                    <span>${escapeHtml(item.title)}</span>
                    <span class="badge ${item.tier.includes('Oracle') ? 'badge-purple' : 'badge-cyan'}" style="font-size:0.65rem; padding:1px 5px;">${escapeHtml(item.tier)}</span>
                  </div>
                  <div class="search-dropdown-item-snippet">${escapeHtml(item.snippet || '')}</div>
                </div>
              </div>`).join('');

            wikiSection.querySelectorAll('.search-dropdown-wiki-item').forEach(el => {
              el.onclick = () => {
                closeDropdown();
                const path = el.dataset.path;
                const title = el.dataset.title;
                const tier = el.dataset.tier;
                if (typeof this.openWikiDrawer === 'function') {
                  this.openWikiDrawer({ id: path, path: path, label: title, tier: tier });
                } else if (typeof this.inspectWikiNode === 'function') {
                  this.inspectWikiNode({ id: path, path: path, label: title, tier: tier });
                }
              };
            });
          }
        } else {
          if (wikiTitle) wikiTitle.style.display = 'none';
          if (wikiSection) wikiSection.innerHTML = '';
        }
      } catch (err) {
        console.warn('Wiki predictive search error:', err);
      }
    }, 150);
  });

  searchInput.addEventListener('keydown', (e) => {
    const items = getVisibleItems();
    if (e.key === 'ArrowDown') {
      if (dropdown.style.display === 'none') return;
      e.preventDefault();
      selectedIdx = (selectedIdx + 1) % items.length;
      updateSelected(items);
      items[selectedIdx]?.scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'ArrowUp') {
      if (dropdown.style.display === 'none') return;
      e.preventDefault();
      selectedIdx = (selectedIdx - 1 + items.length) % items.length;
      updateSelected(items);
      items[selectedIdx]?.scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const query = searchInput.value.trim();
      if (selectedIdx >= 0 && items[selectedIdx]) {
        items[selectedIdx].click();
      } else if (items.length > 0 && (query.startsWith('/') || query.startsWith('$'))) {
        items[0].click();
      } else if (query) {
        closeDropdown();
        this.openSearXNGModal(query);
      }
    } else if (e.key === 'Escape') {
      closeDropdown();
    }
  });

  // Focus event: if input has text, reopen dropdown
  searchInput.addEventListener('focus', () => {
    if (searchInput.value.trim()) {
      dropdown.style.display = 'flex';
    }
  });

  // Close when clicking outside
  document.addEventListener('click', (e) => {
    if (container && !container.contains(e.target)) {
      closeDropdown();
    }
  });
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


// ── 7. Homelab 11-Service Live Health & Latency Mesh ──────────────────────────

CommandDeck.prototype.fetchHomelabMesh = async function() {
  const container = document.getElementById('homelab-mesh-grid');
  const badge = document.getElementById('homelab-mesh-online-badge');
  if (!container) return;

  try {
    const res = await fetch(`${this.apiBase}/api/system/homelab-mesh`);
    if (res.ok) {
      const data = await res.json();
      this.renderHomelabMesh(data);
    } else {
      container.innerHTML = '<div class="empty-hint">Unable to probe homelab services.</div>';
    }
  } catch (e) {
    container.innerHTML = `<div class="empty-hint">Error probing homelab mesh: ${escapeHtml(e.message)}</div>`;
  }
};

CommandDeck.prototype.renderHomelabMesh = function(data) {
  const container = document.getElementById('homelab-mesh-grid');
  const badge = document.getElementById('homelab-mesh-online-badge');
  if (!container) return;

  const online = data.services_online || 0;
  const total = data.services_total || 11;

  if (badge) {
    badge.textContent = `${online}/${total} Online`;
    badge.className = online >= 1 ? 'badge badge-emerald' : 'badge badge-secondary';
  }

  const services = data.services || [];
  container.innerHTML = services.map(s => {
    const statusClass = s.status === 'online' ? 'online' : (s.status === 'slow' ? 'slow' : 'offline');
    const latencyText = s.latency_ms ? `${s.latency_ms}ms` : 'offline';
    return `
      <div class="homelab-mesh-card" data-service="${escapeHtml(s.id)}" data-view="${escapeHtml(s.target_view)}">
        <div class="homelab-mesh-card-top">
          <div class="homelab-mesh-identity">
            <span class="homelab-mesh-icon">${s.icon || '📦'}</span>
            <div>
              <div class="homelab-mesh-name">${escapeHtml(s.name)}</div>
              <div class="homelab-mesh-category">${escapeHtml(s.category)}</div>
            </div>
          </div>
          <span class="homelab-mesh-status-dot ${statusClass}" title="${statusClass.toUpperCase()}"></span>
        </div>
        <div class="homelab-mesh-card-bottom">
          <span class="latency-pill ${statusClass}">⚡ ${latencyText}</span>
          <button class="btn btn--ghost btn--sm btn-jump-service" data-view="${escapeHtml(s.target_view)}" style="font-size:0.75rem; padding:2px 8px;">Launch ➔</button>
        </div>
      </div>
    `;
  }).join('');

  container.querySelectorAll('.homelab-mesh-card, .btn-jump-service').forEach(el => {
    el.onclick = () => {
      const targetView = el.dataset.view || el.closest('.homelab-mesh-card')?.dataset.view;
      if (targetView) {
        window.commandDeck?.showView(targetView);
      }
    };
  });
};


// ── 8. Multi-Host Local Inference Cluster & GPU/VRAM Telemetry ────────────────

CommandDeck.prototype.fetchInferenceCluster = async function() {
  const container = document.getElementById('cluster-nodes-grid');
  if (!container) return;

  try {
    const res = await fetch(`${this.apiBase}/api/system/inference-cluster`);
    if (res.ok) {
      const data = await res.json();
      this.renderInferenceCluster(data);
    }
  } catch (e) {
    console.warn('Inference cluster probe error:', e);
  }
};

CommandDeck.prototype.renderInferenceCluster = function(data) {
  const container = document.getElementById('cluster-nodes-grid');
  const vramBadge = document.getElementById('cluster-vram-summary');
  const statusBadge = document.getElementById('cluster-status-badge');
  if (!container) return;

  if (vramBadge && data.total_vram_gb) {
    vramBadge.textContent = `${data.used_vram_gb || 0} / ${data.total_vram_gb} GB VRAM`;
  }
  if (statusBadge) {
    const online = data.nodes_online || 0;
    statusBadge.textContent = `${online}/${data.nodes_total || 3} Nodes Ready`;
    statusBadge.className = online >= 1 ? 'badge badge-ok' : 'badge badge-warn';
  }

  const nodes = data.nodes || [];
  container.innerHTML = nodes.map(n => {
    const vramPct = n.vram_total_gb > 0 ? Math.round((n.vram_used_gb / n.vram_total_gb) * 100) : 0;
    const isOnline = n.online;
    return `
      <div class="cluster-node-card">
        <div class="cluster-node-header">
          <div>
            <div style="font-weight:700; font-size:0.92rem; color:var(--text-1);">${escapeHtml(n.name)}</div>
            <div class="cluster-node-role">${escapeHtml(n.engine)} • ${escapeHtml(n.role)}</div>
          </div>
          <span class="badge ${isOnline ? 'badge-emerald' : 'badge-secondary'}" style="font-size:0.7rem;">${isOnline ? (n.latency_ms ? `${n.latency_ms}ms` : 'Online') : 'Standby'}</span>
        </div>
        <div style="font-size:0.75rem; color:var(--accent); font-family:var(--font-mono);">${escapeHtml(n.model)}</div>
        
        <div class="cluster-gauge-wrap">
          <div class="cluster-gauge-labels">
            <span>VRAM Allocation</span>
            <span>${n.vram_used_gb} / ${n.vram_total_gb} GB (${vramPct}%)</span>
          </div>
          <div class="cluster-gauge-bar-track">
            <div class="cluster-gauge-bar-fill" style="width:${vramPct}%;"></div>
          </div>
        </div>

        <div class="cluster-gauge-wrap">
          <div class="cluster-gauge-labels">
            <span>KV-Cache Saturation</span>
            <span>${n.kv_cache_pct || 0}%</span>
          </div>
          <div class="cluster-gauge-bar-track">
            <div class="cluster-gauge-bar-fill" style="width:${n.kv_cache_pct || 0}%; background:linear-gradient(90deg, #10b981, #f59e0b);"></div>
          </div>
        </div>
      </div>
    `;
  }).join('');
};


// ── 9. Epistemic Truth Ledger & Disputed Claims Deck ──────────────────────────

CommandDeck.prototype.fetchEpistemicLedger = async function() {
  const stage = document.getElementById('epistemic-claims-stage');
  if (!stage) return;

  try {
    const res = await fetch(`${this.apiBase}/api/epistemic/claims`);
    if (res.ok) {
      const data = await res.json();
      this.epistemicData = data;
      this.renderEpistemicLedger(data.claims, this.activeEpistemicFilter || 'all');
    } else {
      stage.innerHTML = '<div class="empty-hint">Unable to load epistemic ledger.</div>';
    }
  } catch (e) {
    stage.innerHTML = `<div class="empty-hint">Error loading claims: ${escapeHtml(e.message)}</div>`;
  }
};

CommandDeck.prototype.renderEpistemicLedger = function(claims = [], filter = 'all') {
  const stage = document.getElementById('epistemic-claims-stage');
  if (!stage) return;

  const counts = this.epistemicData?.counts || {};
  const elDisputed = document.getElementById('count-disputed');
  const elVerified = document.getElementById('count-verified');
  const elUnverified = document.getElementById('count-unverified');
  const elSuperseded = document.getElementById('count-superseded');
  if (elDisputed) elDisputed.textContent = counts.disputed || 0;
  if (elVerified) elVerified.textContent = counts.verified || 0;
  if (elUnverified) elUnverified.textContent = counts.unverified || 0;
  if (elSuperseded) elSuperseded.textContent = counts.superseded || 0;

  const filtered = filter === 'all' ? claims : claims.filter(c => c.status === filter);

  if (filtered.length === 0) {
    stage.innerHTML = `<div class="empty-state"><div class="empty-state__title">No ${escapeHtml(filter)} claims found</div><div class="empty-state__desc">All claims in this category have been reconciled.</div></div>`;
    return;
  }

  stage.innerHTML = `
    <div class="epistemic-deck">
      ${filtered.map(c => `
        <div class="claim-card status-${c.status}">
          <div class="claim-header">
            <div>
              <span class="claim-topic">${escapeHtml(c.topic)}</span>
              <div class="claim-text">${escapeHtml(c.claim)}</div>
            </div>
            <div style="display:flex; gap:6px; align-items:center;">
              <span class="action-gate-tag ${c.action_gate || 'HOLD'}">Gate: ${c.action_gate || 'HOLD'}</span>
              <span class="badge ${c.status === 'VERIFIED' ? 'badge-emerald' : (c.status === 'DISPUTED' ? 'badge-warn' : 'badge-secondary')}">${c.status}</span>
            </div>
          </div>

          ${c.conflict_summary ? `
            <div style="font-size:0.8rem; color:var(--text-3); font-style:italic; padding:6px 10px; background:rgba(245,158,11,0.06); border-radius:4px;">
              ⚠️ Conflict Note: ${escapeHtml(c.conflict_summary)}
            </div>
          ` : ''}

          <div class="evidence-comparison-grid">
            ${(c.evidence || []).map(ev => `
              <div class="evidence-item">
                <span class="evidence-source">📄 ${escapeHtml(ev.source)} [${escapeHtml(ev.type)}]</span>
                <span class="evidence-assertion">"${escapeHtml(ev.assertion)}"</span>
              </div>
            `).join('')}
          </div>

          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:4px;">
            <span style="font-size:0.75rem; color:var(--text-3);">Confidence: <strong>${Math.round((c.confidence || 0.8) * 100)}%</strong></span>
            <div style="display:flex; gap:6px;">
              <button class="btn btn--ghost btn--sm btn-resolve-claim" data-id="${escapeHtml(c.id)}" data-status="VERIFIED" style="font-size:0.72rem; color:var(--emerald);">✓ Ground / Verify</button>
              <button class="btn btn--ghost btn--sm btn-resolve-claim" data-id="${escapeHtml(c.id)}" data-status="SUPERSEDED" style="font-size:0.72rem;">Archive Superseded</button>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  stage.querySelectorAll('.btn-resolve-claim').forEach(btn => {
    btn.onclick = async () => {
      const claimId = btn.dataset.id;
      const status = btn.dataset.status;
      await this.resolveEpistemicClaim(claimId, status, 'Resolved from Command Deck Epistemic Deck');
    };
  });
};

CommandDeck.prototype.resolveEpistemicClaim = async function(claimId, status, note = '') {
  try {
    const res = await fetch(`${this.apiBase}/api/epistemic/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ claim_id: claimId, status, resolution_note: note })
    });
    if (res.ok) {
      await this.fetchEpistemicLedger();
      this.showToast?.(`Claim ${claimId} marked as ${status}`, 'success');
    }
  } catch (e) {
    this.showToast?.(`Failed to update claim: ${e.message}`, 'error');
  }
};


// ── 10. Autonomous Deep Research Pipeline (Curiosity Engine) ──────────────────

CommandDeck.prototype.fetchResearchQueue = async function() {
  const stage = document.getElementById('research-queue-stage');
  if (!stage) return;

  try {
    const res = await fetch(`${this.apiBase}/api/knowledge/research-queue`);
    if (res.ok) {
      const data = await res.json();
      this.renderResearchQueue(data);
    }
  } catch (e) {
    stage.innerHTML = `<div class="empty-hint">Error loading research queue: ${escapeHtml(e.message)}</div>`;
  }
};

CommandDeck.prototype.renderResearchQueue = function(data) {
  const stage = document.getElementById('research-queue-stage');
  if (!stage) return;

  const active = data.active_topic || {};
  const catalog = data.frontier_catalog || [];

  stage.innerHTML = `
    <!-- Active Research Stage Stepper -->
    <div style="background:var(--bg-secondary); border:1px solid var(--border-subtle); border-radius:var(--radius-md); padding:16px; margin-bottom:16px;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
        <span style="font-size:0.75rem; font-weight:700; text-transform:uppercase; color:var(--accent);">Active Research Synthesis</span>
        <span class="badge badge-purple">Synthesizing</span>
      </div>
      <h3 style="margin:0 0 4px 0; font-size:1.05rem; color:var(--text-1);">${escapeHtml(active.title || 'Complementary Learning Systems Theory')}</h3>
      <p style="margin:0 0 14px 0; font-size:0.82rem; color:var(--text-3);">${escapeHtml(active.description || 'Rapid hippocampal learning vs slow neocortical memory consolidation.')}</p>

      <div class="research-stepper">
        <div class="research-step completed">
          <div class="research-step-dot">✓</div>
          <span class="research-step-label">1. Query Gen</span>
        </div>
        <div class="research-step completed">
          <div class="research-step-dot">✓</div>
          <span class="research-step-label">2. SearXNG Crawl</span>
        </div>
        <div class="research-step active">
          <div class="research-step-dot">3</div>
          <span class="research-step-label">3. Synthesis</span>
        </div>
        <div class="research-step">
          <div class="research-step-dot">4</div>
          <span class="research-step-label">4. OKF Verification</span>
        </div>
        <div class="research-step">
          <div class="research-step-dot">5</div>
          <span class="research-step-label">5. pgvector Ingest</span>
        </div>
      </div>
    </div>

    <!-- Frontier Cognition Catalog Browser -->
    <div style="margin-top:14px;">
      <h4 style="margin:0 0 10px 0; font-size:0.9rem; color:var(--text-1);">Cognitive Architecture Frontier Topics</h4>
      <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(280px, 1fr)); gap:10px;">
        ${catalog.map(item => `
          <div style="background:var(--bg-secondary); border:1px solid var(--border-subtle); border-radius:var(--radius-sm); padding:12px; display:flex; flex-direction:column; justify-content:space-between; gap:8px;">
            <div>
              <div style="font-size:0.7rem; color:var(--accent); text-transform:uppercase; font-weight:600;">${escapeHtml(item.domain)}</div>
              <div style="font-weight:600; font-size:0.88rem; color:var(--text-1); margin-top:2px;">${escapeHtml(item.title)}</div>
              <div style="font-size:0.75rem; color:var(--text-3); margin-top:4px;">${escapeHtml(item.description)}</div>
            </div>
            <button class="btn btn--ghost btn--sm btn-enqueue-topic" data-topic="${escapeHtml(item.title)}" data-rationale="${escapeHtml(item.description)}" style="font-size:0.72rem; align-self:flex-start;">
              + Enqueue Research
            </button>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  stage.querySelectorAll('.btn-enqueue-topic').forEach(btn => {
    btn.onclick = async () => {
      const topic = btn.dataset.topic;
      const rationale = btn.dataset.rationale;
      await this.enqueueResearchTopic(topic, rationale);
    };
  });
};

CommandDeck.prototype.enqueueResearchTopic = async function(topic, rationale) {
  try {
    const res = await fetch(`${this.apiBase}/api/knowledge/research-queue/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, rationale })
    });
    if (res.ok) {
      await this.fetchResearchQueue();
      this.showToast?.(`Enqueued research: ${topic}`, 'success');
    }
  } catch (e) {
    this.showToast?.(`Failed to enqueue topic: ${e.message}`, 'error');
  }
};


// ── 11. Dual-Graph Switcher & Multi-Hop Path Finder ───────────────────────────

CommandDeck.prototype.filterGraphTier = function(tier = 'all') {
  document.querySelectorAll('#view-vault .filter-chips-group button').forEach(b => {
    b.classList.toggle('active', b.dataset.graphTier === tier);
  });
  if (typeof this.fetchKnowledgeGraph === 'function') {
    this.activeGraphTier = tier;
    this.fetchKnowledgeGraph(tier);
  }
};

CommandDeck.prototype.findGraphPath = async function(source, target) {
  const resultEl = document.getElementById('pathfinder-result');
  if (!resultEl) return;
  resultEl.textContent = 'Tracing shortest relationship path...';

  try {
    const res = await fetch(`${this.apiBase}/api/graphify/path?source=${encodeURIComponent(source)}&target=${encodeURIComponent(target)}`);
    if (res.ok) {
      const data = await res.json();
      if (data.status === 'no_path') {
        resultEl.innerHTML = `<span style="color:var(--rose);">No path found between "${escapeHtml(source)}" and "${escapeHtml(target)}".</span>`;
      } else {
        const pathStr = (data.path || []).map(p => escapeHtml(p.label || p.id)).join(' ➔ ');
        resultEl.innerHTML = `<strong>Found Path (${data.hops} hops):</strong> <span style="color:var(--text-1);">${pathStr}</span>`;
      }
    } else {
      resultEl.innerHTML = `<span style="color:var(--rose);">Node not found in graph index.</span>`;
    }
  } catch (e) {
    resultEl.innerHTML = `<span style="color:var(--rose);">Pathfinding error: ${escapeHtml(e.message)}</span>`;
  }
};


// ── Wire Navigation & Global Shortcuts ────────────────────────────────────────

const initIntegrations = () => {
    window.commandDeck?.initHeaderOmnibar?.();
    window.commandDeck?.initMarketAssetSearch?.();
    window.commandDeck?.initSystemSettings?.();

    // Homelab Mesh & Cluster refresh
    document.getElementById('btn-refresh-mesh')?.addEventListener('click', () => {
      window.commandDeck?.fetchHomelabMesh?.();
    });

    // Epistemic Ledger refresh & filters
    document.getElementById('btn-refresh-epistemic')?.addEventListener('click', () => {
      window.commandDeck?.fetchEpistemicLedger?.();
    });
    document.querySelectorAll('#epistemic-filter-group button').forEach(btn => {
      btn.onclick = () => {
        document.querySelectorAll('#epistemic-filter-group button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.epistemicFilter;
        window.commandDeck.activeEpistemicFilter = filter;
        window.commandDeck?.renderEpistemicLedger?.(window.commandDeck.epistemicData?.claims || [], filter);
      };
    });

    // Dual-Graph filters & pathfinder
    document.querySelectorAll('#view-vault .filter-chips-group button').forEach(btn => {
      btn.onclick = () => {
        const tier = btn.dataset.graphTier;
        window.commandDeck?.filterGraphTier?.(tier);
      };
    });

    const btnPathfinder = document.getElementById('btn-graph-pathfinder');
    const drawerPathfinder = document.getElementById('graph-pathfinder-drawer');
    if (btnPathfinder && drawerPathfinder) {
      btnPathfinder.onclick = () => {
        const isHidden = drawerPathfinder.style.display === 'none';
        drawerPathfinder.style.display = isHidden ? 'flex' : 'none';
      };
    }

    document.getElementById('btn-run-pathfinder')?.addEventListener('click', () => {
      const src = document.getElementById('input-path-source')?.value?.trim();
      const tgt = document.getElementById('input-path-target')?.value?.trim();
      if (src && tgt) {
        window.commandDeck?.findGraphPath?.(src, tgt);
      }
    });

    // Enqueue research modal controls
    const researchModal = document.getElementById('research-enqueue-modal');
    document.getElementById('btn-open-research-modal')?.addEventListener('click', () => {
      if (researchModal) researchModal.style.display = 'flex';
    });
    document.getElementById('btn-close-research-modal')?.addEventListener('click', () => {
      if (researchModal) researchModal.style.display = 'none';
    });
    document.getElementById('btn-cancel-research-modal')?.addEventListener('click', () => {
      if (researchModal) researchModal.style.display = 'none';
    });
    document.getElementById('btn-submit-research-modal')?.addEventListener('click', async () => {
      const topicInput = document.getElementById('research-topic-input');
      const rationaleInput = document.getElementById('research-rationale-input');
      const topic = topicInput?.value?.trim();
      const rationale = rationaleInput?.value?.trim();
      if (topic) {
        await window.commandDeck?.enqueueResearchTopic?.(topic, rationale);
        if (topicInput) topicInput.value = '';
        if (rationaleInput) rationaleInput.value = '';
        if (researchModal) researchModal.style.display = 'none';
      }
    });

    // Refresh homelab summaries
    document.getElementById('btn-refresh-summary-widgets')?.addEventListener('click', () => {
      window.commandDeck?.fetchHomelabSummaryWidgets?.();
    });

    // Initialize workbench & ticker ribbon
    window.commandDeck?.fetchMarketTickerRibbon?.();
    window.commandDeck?.initWorkbenchMode?.();
    if (!window._tickerRibbonInterval) {
      window._tickerRibbonInterval = setInterval(() => {
        window.commandDeck?.fetchMarketTickerRibbon?.();
      }, 30000);
    }
  };

// ── 12. Persistent Financial Market Ticker Ribbon ─────────────────────

CommandDeck.prototype.fetchMarketTickerRibbon = async function() {
  const track = document.getElementById('market-ticker-track');
  if (!track) return;

  try {
    const res = await fetch(`${this.apiBase}/api/markets/ribbon`);
    if (res.ok) {
      const data = await res.json();
      this.renderMarketTickerRibbon(data.tickers || []);
    }
  } catch (e) {
    console.warn('Ticker ribbon fetch error:', e);
  }
};

CommandDeck.prototype.renderMarketTickerRibbon = function(tickers) {
  const track = document.getElementById('market-ticker-track');
  if (!track || !tickers.length) return;

  // Triplicate list to ensure full-width 100vw marquee coverage and seamless infinite scroll
  const list = [...tickers, ...tickers, ...tickers];
  track.innerHTML = list.map(t => {
    const isUp = (t.change_pct >= 0);
    const sign = isUp ? '+' : '';
    const formattedPrice = t.price >= 1000 ? t.price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) : t.price.toFixed(2);
    const hasDollar = t.symbol.includes('USD') || !t.symbol.startsWith('^');
    return `
      <span class="ticker-pill ${isUp ? 'up' : 'down'}" data-ticker="${escapeHtml(t.symbol)}">
        <span class="ticker-sym">${escapeHtml(t.name || t.symbol)}</span>
        <span class="ticker-price">${hasDollar ? '$' : ''}${formattedPrice}</span>
        <span class="ticker-pct ${isUp ? 'up' : 'down'}">${sign}${t.change_pct.toFixed(2)}%</span>
      </span>
    `;
  }).join('');

  track.querySelectorAll('.ticker-pill').forEach(pill => {
    pill.onclick = async () => {
      const sym = pill.dataset.ticker;
      if (sym) {
        this.activeMarketTicker = sym;
        const titleEl = document.getElementById('market-chart-ticker');
        if (titleEl) titleEl.textContent = `${sym} Market Overview`;
        this.showView('markets');
        await Promise.all([
          this.loadTickerChart(sym, this.activeMarketPeriod || '1mo'),
          this.loadTickerBreakdown(sym)
        ]);
      }
    };
  });
};

// ── 13. Homelab Apps Live Summary Widgets ─────────────────────────────

CommandDeck.prototype.fetchHomelabSummaryWidgets = async function() {
  const container = document.getElementById('homelab-summary-grid');
  if (!container) return;

  try {
    const res = await fetch(`${this.apiBase}/api/widgets/homelab-summary`);
    if (res.ok) {
      const data = await res.json();
      this.renderHomelabSummaryWidgets(data);
    }
  } catch (e) {
    container.innerHTML = `<div class="empty-hint">Error fetching homelab summaries: ${escapeHtml(e.message)}</div>`;
  }
};

CommandDeck.prototype.renderHomelabSummaryWidgets = function(data) {
  const container = document.getElementById('homelab-summary-grid');
  if (!container) return;

  const fr = data.freshrss || {};
  const ab = data.audiobookshelf || {};
  const seer = data.seer || {};
  const del = data.deluge || {};

  const currentBook = ab.current_book || {};
  const pendingRequests = seer.requests || [];
  const articles = fr.recent_articles || [];
  const torrents = del.items || [];

  container.innerHTML = `
    <!-- FreshRSS Summary Card -->
    <div class="summary-card">
      <div>
        <div class="summary-card-header">
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-size:1.2rem;">📰</span>
            <span style="font-weight:700; color:var(--text-1);">FreshRSS Feeds</span>
          </div>
          <span class="badge ${fr.unread_count > 0 ? 'badge-warn' : 'badge-ok'}">${fr.unread_count || 0} unread</span>
        </div>
        <div style="display:flex; flex-direction:column; gap:6px; margin-top:10px;">
          ${articles.slice(0, 3).map(a => `
            <div style="font-size:0.76rem; border-bottom:1px solid var(--border-subtle); padding-bottom:4px;">
              <a href="${escapeHtml(a.url)}" target="_blank" style="color:var(--text-1); font-weight:500; text-decoration:none; display:block; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                ${escapeHtml(a.title)}
              </a>
              <span style="font-size:0.68rem; color:var(--text-3);">${escapeHtml(a.feed)} • ${escapeHtml(a.time)}</span>
            </div>
          `).join('')}
        </div>
      </div>
      <button class="btn btn--ghost btn--sm" onclick="window.commandDeck?.showView('freshrss')" style="font-size:0.72rem; margin-top:8px; align-self:flex-start;">
        Open Full FreshRSS ➔
      </button>
    </div>

    <!-- Audiobookshelf Summary Card -->
    <div class="summary-card">
      <div>
        <div class="summary-card-header">
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-size:1.2rem;">🎧</span>
            <span style="font-weight:700; color:var(--text-1);">Audiobookshelf</span>
          </div>
          <span class="badge badge-purple">${currentBook.progress_pct || 0}% Complete</span>
        </div>
        <div style="display:flex; gap:10px; margin-top:10px; align-items:center;">
          <img src="${escapeHtml(currentBook.cover_url || '')}" alt="Cover" style="width:48px; height:48px; object-fit:cover; border-radius:4px; border:1px solid var(--border-subtle);" />
          <div style="flex:1; min-width:0;">
            <div style="font-weight:600; font-size:0.8rem; color:var(--text-1); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escapeHtml(currentBook.title || 'No active book')}</div>
            <div style="font-size:0.7rem; color:var(--text-3);">${escapeHtml(currentBook.author || '')} • ${escapeHtml(currentBook.duration_left || '')} left</div>
            <div class="summary-progress-bar">
              <div class="summary-progress-fill" style="width:${currentBook.progress_pct || 0}%;"></div>
            </div>
          </div>
        </div>
      </div>
      <button class="btn btn--ghost btn--sm" onclick="window.commandDeck?.showView('audiobookshelf')" style="font-size:0.72rem; margin-top:8px; align-self:flex-start;">
        Resume Listening ➔
      </button>
    </div>

    <!-- Seer Media Requests Card -->
    <div class="summary-card">
      <div>
        <div class="summary-card-header">
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-size:1.2rem;">🎬</span>
            <span style="font-weight:700; color:var(--text-1);">Seer Requests</span>
          </div>
          <span class="badge ${seer.pending_count > 0 ? 'badge-cyan' : 'badge-ok'}">${seer.pending_count || 0} Pending</span>
        </div>
        <div style="display:flex; flex-direction:column; gap:8px; margin-top:10px;">
          ${pendingRequests.slice(0, 2).map(r => `
            <div style="display:flex; justify-content:space-between; align-items:center; background:var(--bg-tertiary); padding:6px 8px; border-radius:4px; font-size:0.75rem;">
              <div>
                <strong style="color:var(--text-1);">${escapeHtml(r.title)}</strong> (${r.year})
                <div style="font-size:0.68rem; color:var(--text-3);">By ${escapeHtml(r.requester)}</div>
              </div>
              <button class="btn btn--primary btn--sm btn-approve-media" data-id="${escapeHtml(r.id)}" style="font-size:0.68rem; padding:2px 6px;">Approve</button>
            </div>
          `).join('')}
        </div>
      </div>
      <button class="btn btn--ghost btn--sm" onclick="window.commandDeck?.showView('seer')" style="font-size:0.72rem; margin-top:8px; align-self:flex-start;">
        Manage All Requests ➔
      </button>
    </div>

    <!-- Deluge / Media Queues Card -->
    <div class="summary-card">
      <div>
        <div class="summary-card-header">
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-size:1.2rem;">⚡</span>
            <span style="font-weight:700; color:var(--text-1);">Active Downloads</span>
          </div>
          <span class="badge badge-emerald">↓ ${del.download_rate_mb || 0} MB/s</span>
        </div>
        <div style="display:flex; flex-direction:column; gap:6px; margin-top:10px;">
          ${torrents.slice(0, 2).map(t => `
            <div style="font-size:0.75rem;">
              <div style="display:flex; justify-content:space-between; color:var(--text-2);">
                <span style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:180px;">${escapeHtml(t.name)}</span>
                <span style="font-size:0.7rem; font-family:var(--font-mono);">${t.progress_pct}%</span>
              </div>
              <div class="summary-progress-bar">
                <div class="summary-progress-fill" style="width:${t.progress_pct}%;"></div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
      <button class="btn btn--ghost btn--sm" onclick="window.commandDeck?.showView('services')" style="font-size:0.72rem; margin-top:8px; align-self:flex-start;">
        View Queues ➔
      </button>
    </div>
  `;

  container.querySelectorAll('.btn-approve-media').forEach(btn => {
    btn.onclick = () => {
      btn.textContent = '✓ Approved';
      btn.classList.replace('btn--primary', 'btn--ghost');
      this.showToast?.('Media request approved.', 'success');
    };
  });
};

// ── 14. n8n Visual Automation Control Board ───────────────────────────

CommandDeck.prototype.fetchN8nQuickActions = async function() {
  const container = document.getElementById('n8n-quick-actions-grid');
  if (!container) return;

  try {
    const res = await fetch(`${this.apiBase}/api/n8n/quick-actions`);
    if (res.ok) {
      const data = await res.json();
      this.renderN8nQuickActions(data.actions || []);
    }
  } catch (e) {
    container.innerHTML = `<div class="empty-hint">Error loading automation presets: ${escapeHtml(e.message)}</div>`;
  }
};

CommandDeck.prototype.renderN8nQuickActions = function(actions) {
  const container = document.getElementById('n8n-quick-actions-grid');
  const countEl = document.getElementById('n8n-actions-count');
  if (!container) return;

  if (countEl) countEl.textContent = `${actions.length} Ready`;

  container.innerHTML = actions.map(a => `
    <div class="n8n-action-card">
      <div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
          <span style="font-size:1.3rem;">${a.icon}</span>
          <span class="badge badge-secondary" style="font-size:0.65rem;">${escapeHtml(a.category)}</span>
        </div>
        <div style="font-weight:600; font-size:0.85rem; color:var(--text-1);">${escapeHtml(a.name)}</div>
        <div style="font-size:0.72rem; color:var(--text-3); margin-top:2px;">${escapeHtml(a.description)}</div>
      </div>
      <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px; padding-top:6px; border-top:1px solid var(--border-subtle);">
        <span style="font-size:0.68rem; color:var(--text-3);">Last: ${escapeHtml(a.last_run)}</span>
        <button class="btn btn--primary btn--sm btn-trigger-n8n-action" data-action-id="${escapeHtml(a.id)}" style="font-size:0.72rem; padding:3px 10px;">
          ⚡ Run Now
        </button>
      </div>
    </div>
  `).join('');

  container.querySelectorAll('.btn-trigger-n8n-action').forEach(btn => {
    btn.onclick = async () => {
      const id = btn.dataset.actionId;
      btn.disabled = true;
      btn.textContent = 'Running...';
      try {
        const res = await fetch(`${this.apiBase}/api/n8n/trigger`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action_id: id })
        });
        const data = await res.json();
        this.showToast?.(data.message || 'Workflow executed', 'success');
        btn.textContent = '✓ Done';
        setTimeout(() => {
          btn.textContent = '⚡ Run Now';
          btn.disabled = false;
        }, 2500);
      } catch (err) {
        this.showToast?.(`Workflow failed: ${err.message}`, 'error');
        btn.textContent = '⚡ Run Now';
        btn.disabled = false;
      }
    };
  });
};

// ── 15. Docker Container Log Console Modal ────────────────────────────

CommandDeck.prototype.openContainerLogsModal = async function(containerName) {
  const drawer = document.getElementById('container-logs-drawer');
  const titleEl = document.getElementById('container-logs-title');
  const contentEl = document.getElementById('container-logs-content');
  const searchInput = document.getElementById('container-logs-search');
  const closeBtn = document.getElementById('container-logs-close');
  const refreshBtn = document.getElementById('container-logs-refresh');
  const restartBtn = document.getElementById('container-logs-restart');

  if (!drawer) return;
  drawer.classList.add('open');
  if (titleEl) titleEl.textContent = `${containerName} Logs`;
  if (contentEl) contentEl.textContent = 'Loading container logs...';

  let rawLogs = '';

  const renderFilteredLogs = () => {
    if (!contentEl) return;
    const filter = (searchInput?.value || '').toLowerCase();
    const lines = rawLogs.split('\n');
    const filtered = filter ? lines.filter(l => l.toLowerCase().includes(filter)) : lines;
    contentEl.innerHTML = filtered.map(line => {
      let cls = '';
      if (/error|fatal|fail/i.test(line)) cls = 'terminal-line-err';
      else if (/warn/i.test(line)) cls = 'terminal-line-warn';
      else if (/info|notice/i.test(line)) cls = 'terminal-line-info';
      return `<div class="${cls}">${escapeHtml(line)}</div>`;
    }).join('');
    contentEl.scrollTop = contentEl.scrollHeight;
  };

  const fetchLogs = async () => {
    try {
      const res = await fetch(`${this.apiBase}/api/docker/containers/${encodeURIComponent(containerName)}/logs`);
      if (res.ok) {
        const data = await res.json();
        rawLogs = data.logs || 'No logs available.';
        renderFilteredLogs();
      }
    } catch (e) {
      if (contentEl) contentEl.textContent = `Error fetching logs: ${e.message}`;
    }
  };

  if (searchInput) searchInput.oninput = renderFilteredLogs;
  if (refreshBtn) refreshBtn.onclick = fetchLogs;
  if (restartBtn) {
    restartBtn.onclick = async () => {
      if (!confirm(`Restart container "${containerName}"?`)) return;
      try {
        const res = await fetch(`${this.apiBase}/api/docker/containers/${encodeURIComponent(containerName)}/restart`, { method: 'POST' });
        const data = await res.json();
        this.showToast?.(data.message || 'Container restarted', 'success');
        setTimeout(fetchLogs, 1500);
      } catch (err) {
        this.showToast?.(`Restart failed: ${err.message}`, 'error');
      }
    };
  }
  if (closeBtn) closeBtn.onclick = () => drawer.classList.remove('open');
  drawer.onclick = (e) => {
    if (e.target === drawer) drawer.classList.remove('open');
  };

  await fetchLogs();
};

CommandDeck.prototype.openContainerLogs = function(containerName) {
  return this.openContainerLogsModal(containerName);
};

CommandDeck.prototype.triggerN8nQuickAction = async function(actionId) {
  try {
    const res = await fetch(`${this.apiBase}/api/n8n/trigger`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action_id: actionId })
    });
    const data = await res.json();
    this.showToast?.(data.message || `Workflow ${actionId} executed`, 'success');
  } catch (err) {
    this.showToast?.(`Workflow failed: ${err.message}`, 'error');
  }
};

// ── 16. Split-Screen Dual Workbench Mode ──────────────────────────────

CommandDeck.prototype.initWorkbenchMode = function() {
  const btnToggle = document.getElementById('btn-toggle-workbench');
  const splitStage = document.getElementById('workbench-split-stage');
  const primaryPane = document.getElementById('workbench-pane-primary');
  const secondaryBody = document.getElementById('workbench-secondary-body');
  const secondarySelect = document.getElementById('workbench-secondary-select');
  const btnClose = document.getElementById('btn-close-workbench');

  if (!btnToggle || !splitStage) return;

  this.isWorkbenchActive = false;

  btnToggle.onclick = () => {
    this.isWorkbenchActive = !this.isWorkbenchActive;
    btnToggle.classList.toggle('active', this.isWorkbenchActive);
    splitStage.style.display = this.isWorkbenchActive ? 'block' : 'none';

    document.querySelectorAll('.view-section').forEach(el => {
      if (this.isWorkbenchActive) {
        el.style.display = 'none';
      }
    });

    if (this.isWorkbenchActive) {
      const activeView = this.currentView || 'dashboard';
      const targetEl = document.getElementById(`view-${activeView}`);
      if (targetEl && primaryPane) {
        primaryPane.innerHTML = '';
        const cloned = targetEl.cloneNode(true);
        cloned.style.display = 'block';
        primaryPane.appendChild(cloned);
      }
      this.loadWorkbenchSecondary(secondarySelect?.value || 'agents');
    } else {
      this.showView(this.currentView || 'dashboard');
    }
  };

  if (btnClose) {
    btnClose.onclick = () => {
      this.isWorkbenchActive = false;
      btnToggle.classList.remove('active');
      splitStage.style.display = 'none';
      this.showView(this.currentView || 'dashboard');
    };
  }

  if (secondarySelect) {
    secondarySelect.onchange = () => {
      this.loadWorkbenchSecondary(secondarySelect.value);
    };
  }
};

CommandDeck.prototype.loadWorkbenchSecondary = function(viewName) {
  const secondaryBody = document.getElementById('workbench-secondary-body');
  if (!secondaryBody) return;

  const targetEl = document.getElementById(`view-${viewName}`);
  if (targetEl) {
    secondaryBody.innerHTML = '';
    const cloned = targetEl.cloneNode(true);
    cloned.style.display = 'block';
    secondaryBody.appendChild(cloned);
  }
};

// ── 17. Cross-Page Quick Note Creation ────────────────────────────────

CommandDeck.prototype.createQuickVaultNote = async function(title, content) {
  try {
    const res = await fetch(`${this.apiBase}/api/vault/quick-note`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content })
    });
    if (res.ok) {
      const data = await res.json();
      this.showToast?.(`Note created: ${data.title}`, 'success');
    }
  } catch (e) {
    this.showToast?.(`Failed to create note: ${e.message}`, 'error');
  }
};

const setupIntegrations = () => {
  if (window.commandDeck) {
    initIntegrations();
  } else {
    setTimeout(initIntegrations, 100);
  }

  // Keyboard shortcut: pressing / focuses SearXNG & wiki search omnibar
  document.addEventListener('keydown', (e) => {
    if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
      e.preventDefault();
      const searchInput = document.getElementById('global-search');
      if (searchInput) {
        searchInput.focus();
        searchInput.select();
      }
    }
  });

  // Wire timeframe buttons for markets
  document.querySelectorAll('.market-tf-btn').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('.market-tf-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const tf = btn.dataset.tf;
      const currentTicker = window.commandDeck?.activeMarketTicker || document.getElementById('market-chart-ticker')?.textContent?.split(' ')[0] || '^GSPC';
      window.commandDeck?.loadTickerChart(currentTicker, tf);
    };
  });

  // Wire vault save button
  const vaultSaveBtn = document.getElementById('btn-vault-save');
  if (vaultSaveBtn) {
    vaultSaveBtn.onclick = () => window.commandDeck?.saveVaultNote();
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupIntegrations);
} else {
  setupIntegrations();
}
