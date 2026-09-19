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
        this.switchView('homelab');
      } else if (typeof this.showView === 'function') {
        this.showView('homelab');
      } else {
        const labLink = document.querySelector('.sidebar-link[data-view="homelab"]');
        if (labLink) labLink.click();
      }
      setTimeout(() => {
        const panel = document.getElementById('system-settings-panel');
        if (panel) panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
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
        this.switchView('homelab');
      } else if (typeof this.showView === 'function') {
        this.showView('homelab');
      } else {
        const labLink = document.querySelector('.sidebar-link[data-view="homelab"]');
        if (labLink) labLink.click();
      }
      setTimeout(() => {
        const panel = document.getElementById('system-settings-panel');
        if (panel) panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
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
        this.showView('homelab');
        setTimeout(() => {
          const panel = document.getElementById('system-settings-panel');
          if (panel) panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
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
  quotesList.innerHTML = '<tr><td colspan="5" class="agent-loading">Fetching market quotes...</td></tr>';

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
    quotesList.innerHTML = `<tr><td colspan="5" class="empty-hint">Error: ${escapeHtml(e.message)}</td></tr>`;
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
    tbody.innerHTML = '<tr><td colspan="5" class="empty-hint" style="text-align:center; padding:20px;">No followed assets. Search above to follow assets.</td></tr>';
    return;
  }

  tbody.innerHTML = quotes.map(q => `
    <tr data-ticker="${escapeHtml(q.ticker)}">
      <td>
        <div style="display:flex; align-items:center; gap:6px;">
          <div style="font-weight:600; color:var(--text-1);">${escapeHtml(q.name)}</div>
          <span class="badge badge-subtle" style="font-size:0.65rem; padding:1px 4px;">${escapeHtml(q.type || 'equity')}</span>
        </div>
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
      <td style="text-align:center;">
        <button class="market-unfollow-btn" data-ticker="${escapeHtml(q.ticker)}" title="Unfollow ${escapeHtml(q.ticker)}">&times;</button>
      </td>
    </tr>
  `).join('');

  tbody.querySelectorAll('tr').forEach(row => {
    row.onclick = async (e) => {
      if (e.target.closest('.market-unfollow-btn')) return;
      tbody.querySelectorAll('tr').forEach(r => r.style.background = '');
      row.style.background = 'var(--bg-tertiary)';
      const ticker = row.dataset.ticker;
      this.activeMarketTicker = ticker;
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
            <button class="btn btn--secondary btn--sm" onclick="window.commandDeck?.showView('homelab'); setTimeout(() => document.getElementById('system-settings-panel')?.scrollIntoView({behavior:'smooth'}), 100);">⚙️ Configure in Settings</button>
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
            <button class="btn btn--secondary btn--sm" onclick="window.commandDeck?.showView('homelab'); setTimeout(() => document.getElementById('system-settings-panel')?.scrollIntoView({behavior:'smooth'}), 100);">⚙️ Configure in Settings</button>
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
            <button class="btn btn--secondary btn--sm" onclick="window.commandDeck?.showView('homelab'); setTimeout(() => document.getElementById('system-settings-panel')?.scrollIntoView({behavior:'smooth'}), 100);">⚙️ Configure in Settings</button>
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
            <button class="btn btn--secondary btn--sm" onclick="window.commandDeck?.showView('homelab'); setTimeout(() => document.getElementById('system-settings-panel')?.scrollIntoView({behavior:'smooth'}), 100);">⚙️ Configure in Settings</button>
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
            <button class="btn btn--secondary btn--sm" onclick="window.commandDeck?.showView('homelab'); setTimeout(() => document.getElementById('system-settings-panel')?.scrollIntoView({behavior:'smooth'}), 100);">⚙️ Configure in Settings</button>
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
            <button class="btn btn--secondary btn--sm" onclick="window.commandDeck?.showView('homelab'); setTimeout(() => document.getElementById('system-settings-panel')?.scrollIntoView({behavior:'smooth'}), 100);">⚙️ Configure in Settings</button>
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
  const saveBtn = document.getElementById('btn-save-system-settings');
  if (saveBtn && !saveBtn.dataset.initDone) {
    saveBtn.dataset.initDone = 'true';
    saveBtn.onclick = async () => {
      const payload = {};

      // Homelab & Automation inputs
      const n8nUrl = document.getElementById('input-url-n8n');
      const n8nKey = document.getElementById('input-key-n8n');
      const n8nMcp = document.getElementById('input-mcp-n8n');
      const hassUrl = document.getElementById('input-url-hass');
      const hassToken = document.getElementById('input-token-hass');
      const searxngUrl = document.getElementById('input-url-searxng');
      const pgUrl = document.getElementById('input-url-pg');
      const infMain = document.getElementById('input-url-inference-main');
      const infVision = document.getElementById('input-url-inference-vision');
      const infVllm = document.getElementById('input-url-inference-vllm');
      const infKey = document.getElementById('input-key-inference');
      const elKey = document.getElementById('input-key-elevenlabs');

      // Homelab Applications inputs
      const deerflowUrl = document.getElementById('input-url-deerflow');
      const deerflowKey = document.getElementById('input-key-deerflow');
      const vaneUrl = document.getElementById('input-url-vane');
      const vaneKey = document.getElementById('input-key-vane');
      const owuiUrl = document.getElementById('input-url-openwebui');
      const owuiKey = document.getElementById('input-key-openwebui');
      const absUrl = document.getElementById('input-url-audiobookshelf');
      const absToken = document.getElementById('input-token-audiobookshelf');
      const blUrl = document.getElementById('input-url-booklore');
      const blKey = document.getElementById('input-key-booklore');
      const immichUrl = document.getElementById('input-url-immich');
      const immichKey = document.getElementById('input-key-immich');
      const ncUrl = document.getElementById('input-url-nextcloud');
      const ncToken = document.getElementById('input-token-nextcloud');
      const ncUser = document.getElementById('input-user-nextcloud');
      const seerUrl = document.getElementById('input-url-seer');
      const seerKey = document.getElementById('input-key-seer');
      const frssUrl = document.getElementById('input-url-freshrss');
      const frssKey = document.getElementById('input-key-freshrss');
      const frssUser = document.getElementById('input-user-freshrss');

      // Financial API inputs
      const avInput = document.getElementById('input-key-alphavantage');
      const msInput = document.getElementById('input-key-massive');
      const fhInput = document.getElementById('input-key-finnhub');
      const fmpInput = document.getElementById('input-key-fmp');
      const tdInput = document.getElementById('input-key-twelvedata');
      const fredInput = document.getElementById('input-key-fred');

      // Add homelab values to payload
      if (n8nUrl && n8nUrl.value.trim()) payload.n8n_url = n8nUrl.value.trim();
      if (n8nKey && n8nKey.value && !n8nKey.value.includes('•••')) payload.n8n_api_key = n8nKey.value.trim();
      if (n8nMcp && n8nMcp.value && !n8nMcp.value.includes('•••')) payload.n8n_mcp_token = n8nMcp.value.trim();

      if (hassUrl && hassUrl.value.trim()) payload.hass_url = hassUrl.value.trim();
      if (hassToken && hassToken.value && !hassToken.value.includes('•••')) payload.hass_token = hassToken.value.trim();

      if (searxngUrl && searxngUrl.value.trim()) payload.searxng_url = searxngUrl.value.trim();
      if (pgUrl && pgUrl.value.trim()) payload.pg_url = pgUrl.value.trim();

      if (infMain && infMain.value.trim()) payload.inference_node_main = infMain.value.trim();
      if (infVision && infVision.value.trim()) payload.inference_node_vision = infVision.value.trim();
      if (infVllm && infVllm.value.trim()) payload.inference_node_vllm = infVllm.value.trim();
      if (infKey && infKey.value && !infKey.value.includes('•••')) payload.inference_api_key = infKey.value.trim();

      if (elKey && elKey.value && !elKey.value.includes('•••')) payload.elevenlabs_api_key = elKey.value.trim();

      // Add homelab applications to payload
      if (deerflowUrl && deerflowUrl.value.trim()) payload.deerflow_url = deerflowUrl.value.trim();
      if (deerflowKey && deerflowKey.value && !deerflowKey.value.includes('•••')) payload.deerflow_api_key = deerflowKey.value.trim();
      if (vaneUrl && vaneUrl.value.trim()) payload.vane_url = vaneUrl.value.trim();
      if (vaneKey && vaneKey.value && !vaneKey.value.includes('•••')) payload.vane_api_key = vaneKey.value.trim();
      if (owuiUrl && owuiUrl.value.trim()) payload.openwebui_url = owuiUrl.value.trim();
      if (owuiKey && owuiKey.value && !owuiKey.value.includes('•••')) payload.openwebui_api_key = owuiKey.value.trim();
      if (absUrl && absUrl.value.trim()) payload.audiobookshelf_url = absUrl.value.trim();
      if (absToken && absToken.value && !absToken.value.includes('•••')) payload.audiobookshelf_token = absToken.value.trim();
      if (blUrl && blUrl.value.trim()) payload.booklore_url = blUrl.value.trim();
      if (blKey && blKey.value && !blKey.value.includes('•••')) payload.booklore_api_key = blKey.value.trim();
      if (immichUrl && immichUrl.value.trim()) payload.immich_url = immichUrl.value.trim();
      if (immichKey && immichKey.value && !immichKey.value.includes('•••')) payload.immich_api_key = immichKey.value.trim();
      if (ncUrl && ncUrl.value.trim()) payload.nextcloud_url = ncUrl.value.trim();
      if (ncToken && ncToken.value && !ncToken.value.includes('•••')) payload.nextcloud_token = ncToken.value.trim();
      if (ncUser && ncUser.value.trim()) payload.nextcloud_user = ncUser.value.trim();
      if (seerUrl && seerUrl.value.trim()) payload.seer_url = seerUrl.value.trim();
      if (seerKey && seerKey.value && !seerKey.value.includes('•••')) payload.seer_api_key = seerKey.value.trim();
      if (frssUrl && frssUrl.value.trim()) payload.freshrss_url = frssUrl.value.trim();
      if (frssKey && frssKey.value && !frssKey.value.includes('•••')) payload.freshrss_api_key = frssKey.value.trim();
      if (frssUser && frssUser.value.trim()) payload.freshrss_user = frssUser.value.trim();

      // Add financial values to payload
      if (avInput && avInput.value && !avInput.value.includes('•••')) payload.alphavantage_api_key = avInput.value.trim();
      if (msInput && msInput.value && !msInput.value.includes('•••')) payload.massive_api_key = msInput.value.trim();
      if (fhInput && fhInput.value && !fhInput.value.includes('•••')) payload.finnhub_api_key = fhInput.value.trim();
      if (fmpInput && fmpInput.value && !fmpInput.value.includes('•••')) payload.fmp_api_key = fmpInput.value.trim();
      if (tdInput && tdInput.value && !tdInput.value.includes('•••')) payload.twelvedata_api_key = tdInput.value.trim();
      if (fredInput && fredInput.value && !fredInput.value.includes('•••')) payload.fred_api_key = fredInput.value.trim();

      try {
        const res = await fetch(`${this.apiBase}/api/system/settings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          if (typeof this.showToast === 'function') {
            this.showToast('System, Homelab & Financial settings saved and synced with .env!', 'success');
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

      let keyVal = '';
      let urlVal = '';

      if (provider === 'n8n') {
        const kInp = document.getElementById('input-key-n8n');
        const uInp = document.getElementById('input-url-n8n');
        if (kInp && kInp.value && !kInp.value.includes('•••')) keyVal = kInp.value.trim();
        if (uInp && uInp.value) urlVal = uInp.value.trim();
      } else if (provider === 'homeassistant') {
        const kInp = document.getElementById('input-token-hass');
        const uInp = document.getElementById('input-url-hass');
        if (kInp && kInp.value && !kInp.value.includes('•••')) keyVal = kInp.value.trim();
        if (uInp && uInp.value) urlVal = uInp.value.trim();
      } else if (provider === 'searxng') {
        const uInp = document.getElementById('input-url-searxng');
        if (uInp && uInp.value) urlVal = uInp.value.trim();
      } else if (provider === 'pgvector') {
        const uInp = document.getElementById('input-url-pg');
        if (uInp && uInp.value) urlVal = uInp.value.trim();
      } else if (provider === 'inference') {
        const kInp = document.getElementById('input-key-inference');
        const uInp = document.getElementById('input-url-inference-main');
        if (kInp && kInp.value && !kInp.value.includes('•••')) keyVal = kInp.value.trim();
        if (uInp && uInp.value) urlVal = uInp.value.trim();
      } else if (provider === 'elevenlabs') {
        const kInp = document.getElementById('input-key-elevenlabs');
        if (kInp && kInp.value && !kInp.value.includes('•••')) keyVal = kInp.value.trim();
      } else {
        const inp = document.getElementById(`input-key-${provider}`) || document.getElementById(`input-token-${provider}`);
        if (inp && inp.value && !inp.value.includes('•••')) keyVal = inp.value.trim();
        const uInp = document.getElementById(`input-url-${provider}`);
        if (uInp && uInp.value) urlVal = uInp.value.trim();
      }

      if (msgEl) {
        msgEl.className = 'setting-status-msg';
        msgEl.textContent = 'Testing connection...';
      }

      try {
        const res = await fetch(`${this.apiBase}/api/system/settings/test`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ provider, api_key: keyVal, api_url: urlVal })
        });
        const data = await res.json();
        if (msgEl) {
          msgEl.className = `setting-status-msg ${data.status === 'ok' ? 'success' : 'error'}`;
          msgEl.textContent = data.message || 'Test complete';
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
        this.switchView('homelab');
      } else if (typeof this.showView === 'function') {
        this.showView('homelab');
      } else {
        const labLink = document.querySelector('.sidebar-link[data-view="homelab"]');
        if (labLink) labLink.click();
      }
      setTimeout(() => {
        const panel = document.getElementById('system-settings-panel');
        if (panel) {
          panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
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

    // Homelab & Automation
    if (settings.n8n) {
      updateBadge(document.getElementById('setting-badge-n8n'), settings.n8n.configured);
      const uInp = document.getElementById('input-url-n8n');
      const kInp = document.getElementById('input-key-n8n');
      const mInp = document.getElementById('input-mcp-n8n');
      if (uInp && settings.n8n.url && !uInp.value) uInp.value = settings.n8n.url;
      if (kInp && settings.n8n.masked_key && !kInp.value) kInp.value = settings.n8n.masked_key;
      if (mInp && settings.n8n.masked_mcp_token && !mInp.value) mInp.value = settings.n8n.masked_mcp_token;

      const n8nLink = document.getElementById('n8n-external-link');
      if (n8nLink && settings.n8n.url) {
        n8nLink.href = settings.n8n.url;
      }
    }

    if (settings.homeassistant) {
      updateBadge(document.getElementById('setting-badge-homeassistant'), settings.homeassistant.configured);
      const uInp = document.getElementById('input-url-hass');
      const tInp = document.getElementById('input-token-hass');
      if (uInp && settings.homeassistant.url && !uInp.value) uInp.value = settings.homeassistant.url;
      if (tInp && settings.homeassistant.masked_token && !tInp.value) tInp.value = settings.homeassistant.masked_token;

      const haLink = document.getElementById('ha-external-link');
      if (haLink && settings.homeassistant.url) {
        haLink.href = settings.homeassistant.url;
      }
    }

    if (settings.searxng) {
      updateBadge(document.getElementById('setting-badge-searxng'), settings.searxng.configured);
      const uInp = document.getElementById('input-url-searxng');
      if (uInp && settings.searxng.url && !uInp.value) uInp.value = settings.searxng.url;
    }

    if (settings.pgvector) {
      updateBadge(document.getElementById('setting-badge-pgvector'), settings.pgvector.configured);
      const uInp = document.getElementById('input-url-pg');
      if (uInp && settings.pgvector.url && !uInp.value) uInp.value = settings.pgvector.url;
    }

    if (settings.inference) {
      updateBadge(document.getElementById('setting-badge-inference'), settings.inference.configured);
      const mInp = document.getElementById('input-url-inference-main');
      const vInp = document.getElementById('input-url-inference-vision');
      const lInp = document.getElementById('input-url-inference-vllm');
      const kInp = document.getElementById('input-key-inference');
      if (mInp && settings.inference.node_main && !mInp.value) mInp.value = settings.inference.node_main;
      if (vInp && settings.inference.node_vision && !vInp.value) vInp.value = settings.inference.node_vision;
      if (lInp && settings.inference.node_vllm && !lInp.value) lInp.value = settings.inference.node_vllm;
      if (kInp && settings.inference.masked_key && !kInp.value) kInp.value = settings.inference.masked_key;
    }

    if (settings.elevenlabs) {
      updateBadge(document.getElementById('setting-badge-elevenlabs'), settings.elevenlabs.configured);
      const kInp = document.getElementById('input-key-elevenlabs');
      if (kInp && settings.elevenlabs.masked_key && !kInp.value) kInp.value = settings.elevenlabs.masked_key;
    }

    // Homelab Applications
    const homelabServices = ['deerflow', 'vane', 'openwebui', 'audiobookshelf', 'booklore', 'immich', 'nextcloud', 'seer', 'freshrss'];
    homelabServices.forEach(s => {
      const cfg = settings[s];
      if (!cfg) return;
      updateBadge(document.getElementById(`setting-badge-${s}`), cfg.configured);
      const uInp = document.getElementById(`input-url-${s}`);
      const kInp = document.getElementById(`input-key-${s}`) || document.getElementById(`input-token-${s}`);
      const userInp = document.getElementById(`input-user-${s}`);
      const linkEl = document.getElementById(`link-setting-${s}`);
      const extLink = document.getElementById(`${s}-external-link`);

      if (uInp && cfg.url && !uInp.value) uInp.value = cfg.url;
      if (kInp && (cfg.masked_key || cfg.masked_token) && !kInp.value) kInp.value = cfg.masked_key || cfg.masked_token;
      if (userInp && cfg.user && !userInp.value) userInp.value = cfg.user;
      if (linkEl && cfg.url) {
        linkEl.href = cfg.url;
        linkEl.textContent = cfg.url;
      }
      if (extLink && cfg.url) {
        extLink.href = cfg.url;
      }
    });

    // Financial APIs
    const avBadge = document.getElementById('setting-badge-alphavantage');
    const msBadge = document.getElementById('setting-badge-massive');
    const fhBadge = document.getElementById('setting-badge-finnhub');
    const fmpBadge = document.getElementById('setting-badge-fmp');
    const tdBadge = document.getElementById('setting-badge-twelvedata');
    const fredBadge = document.getElementById('setting-badge-fred');

    const avInput = document.getElementById('input-key-alphavantage');
    const msInput = document.getElementById('input-key-massive');
    const fhInput = document.getElementById('input-key-finnhub');
    const fmpInput = document.getElementById('input-key-fmp');
    const tdInput = document.getElementById('input-key-twelvedata');
    const fredInput = document.getElementById('input-key-fred');

    if (settings.alphavantage) {
      updateBadge(avBadge, settings.alphavantage.configured);
      if (avInput && settings.alphavantage.masked_key && !avInput.value) {
        avInput.value = settings.alphavantage.masked_key;
      }
    }

    if (settings.massive) {
      updateBadge(msBadge, settings.massive.configured);
      if (msInput && settings.massive.masked_key && !msInput.value) {
        msInput.value = settings.massive.masked_key;
      }
    }

    if (settings.finnhub) {
      updateBadge(fhBadge, settings.finnhub.configured);
      if (fhInput && settings.finnhub.masked_key && !fhInput.value) {
        fhInput.value = settings.finnhub.masked_key;
      }
    }

    if (settings.fmp) {
      updateBadge(fmpBadge, settings.fmp.configured);
      if (fmpInput && settings.fmp.masked_key && !fmpInput.value) {
        fmpInput.value = settings.fmp.masked_key;
      }
    }

    if (settings.twelvedata) {
      updateBadge(tdBadge, settings.twelvedata.configured);
      if (tdInput && settings.twelvedata.masked_key && !tdInput.value) {
        tdInput.value = settings.twelvedata.masked_key;
      }
    }

    if (settings.fred) {
      updateBadge(fredBadge, settings.fred.configured);
      if (fredInput && settings.fred.masked_key && !fredInput.value) {
        fredInput.value = settings.fred.masked_key;
      }
    }
  } catch (err) {
    console.warn('Error loading system settings:', err);
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


// ── Wire Navigation & Global Shortcuts ────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  const initIntegrations = () => {
    window.commandDeck?.initHeaderOmnibar?.();
    window.commandDeck?.initMarketAssetSearch?.();
    window.commandDeck?.initSystemSettings?.();
  };

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
});
