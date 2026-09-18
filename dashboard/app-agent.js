import { CommandDeck, escapeHtml } from './app-core.js';

// ── Phase 3: Agent Intelligence & Hermes Gateway Integration ──────────────────

CommandDeck.prototype.fetchAgentStatus = async function() {
  try {
    const res = await fetch(`${this.apiBase}/api/agent`);
    if (res.ok) {
      const data = await res.json();
      this.state.agentStatus = data;
      this.renderAgentStatus();
    }
  } catch (e) {
    console.warn('Agent status fetch error:', e);
  }
};

CommandDeck.prototype.fetchCronJobs = async function() {
  try {
    const res = await fetch(`${this.apiBase}/api/cron`);
    if (res.ok) {
      const data = await res.json();
      this.state.cronJobs = data;
      this.renderCronJobs();
    }
  } catch (e) {
    console.warn('Cron jobs fetch error:', e);
  }
};

CommandDeck.prototype.fetchSkillsCatalog = async function() {
  try {
    const res = await fetch(`${this.apiBase}/api/skills`);
    if (res.ok) {
      const data = await res.json();
      this.state.skillsCatalog = data;
      this.renderSkillsCatalog();
    }
  } catch (e) {
    console.warn('Skills catalog fetch error:', e);
  }
};

CommandDeck.prototype.fetchGatewayStatus = async function() {
  try {
    const res = await fetch(`${this.apiBase}/api/gateway/status`);
    if (res.ok) {
      const data = await res.json();
      this.state.gatewayStatus = data;
      this.renderGatewayStatus();
    }
  } catch (e) {
    console.warn('Gateway status fetch error:', e);
  }
};

CommandDeck.prototype.fetchGraphifyStatus = async function() {
  try {
    const res = await fetch(`${this.apiBase}/api/graphify`);
    if (res.ok) {
      const data = await res.json();
      this.state.graphifyStatus = data;
      this.renderGraphifyStatus();
    }
  } catch (e) {
    console.warn('Graphify status fetch error:', e);
  }
};

CommandDeck.prototype.fetchHermesStatus = async function() {
  try {
    const res = await fetch(`${this.apiBase}/api/hermes`);
    if (res.ok) {
      const data = await res.json();
      this.state.hermesStatus = data;
      this.renderHermesStatus();
    }
  } catch (e) {
    console.warn('Hermes status fetch error:', e);
  }
};

CommandDeck.prototype.renderAgentStatus = function() {
  const data = this.state.agentStatus || {};
  const grid = document.getElementById('agent-grid');
  if (!grid) return;

  const status = data.gateway_running ? 'ok' : 'warn';
  const statusEl = document.getElementById('agent-status');
  if (statusEl) {
    const modeBadge = data.gateway_info?.active ? 'Gateway (8642)' : 'CLI Fallback';
    statusEl.innerHTML = `
      <span class="panel-status__dot panel-status__dot--${status}" aria-hidden="true"></span>
      <span>${data.gateway_running ? 'Running' : 'Offline'} (${modeBadge})</span>
    `;
  }

  grid.innerHTML = `
    <div class="agent-stat">
      <span class="agent-stat__label">Gateway API</span>
      <span class="agent-stat__value ${data.gateway_running ? 'ok' : 'warn'}">
        ${data.gateway_running ? '✓ Port 8642 Active' : '⚠ CLI Mode'}
      </span>
    </div>
    <div class="agent-stat">
      <span class="agent-stat__label">Autonomous Cron</span>
      <span class="agent-stat__value ok">${data.cron_jobs || 0} active</span>
    </div>
    <div class="agent-stat">
      <span class="agent-stat__label">Hot Memory</span>
      <span class="agent-stat__value ${data.memory_percent > 80 ? 'warn' : 'ok'}">
        ${data.memory_chars || 0} / 2,200 chars (${data.memory_files || 0} facts)
      </span>
    </div>
    <div class="agent-stat">
      <span class="agent-stat__label">Uptime</span>
      <span class="agent-stat__value">${data.uptime_days || 0}d</span>
    </div>
  `;
};

CommandDeck.prototype.renderHermesStatus = function() {
  const data = this.state.hermesStatus || {};
  const statusEl = document.getElementById('agent-status');
  if (statusEl && data.processes) {
    const count = (data.processes || []).length;
    statusEl.innerHTML = `
      <span class="panel-status__dot panel-status__dot--ok" aria-hidden="true"></span>
      <span>${count} process(es) online</span>
    `;
  }
};

CommandDeck.prototype.renderGatewayStatus = function() {
  const data = this.state.gatewayStatus || {};
  const platforms = data.platforms || {};

  // Update header status pill or agent telemetry
  const statusContainer = document.getElementById('gateway-platforms-container');
  if (!statusContainer) return;

  const platformKeys = Object.keys(platforms);
  statusContainer.innerHTML = platformKeys.map(k => {
    const p = platforms[k];
    const isOnline = p.status === 'online' || p.status === 'active';
    return `
      <div class="platform-chip ${isOnline ? 'online' : 'offline'}" style="display:inline-flex; align-items:center; gap:4px; font-size:0.75rem; padding:2px 8px; border-radius:12px; background:var(--bg-secondary); border:1px solid var(--border-subtle); margin-right:4px;">
        <span>${p.icon || '📱'}</span>
        <span>${escapeHtml(p.name)}</span>
        <span class="status-dot ${isOnline ? 'status-dot--ok' : 'status-dot--idle'}" style="width:6px; height:6px;"></span>
      </div>
    `;
  }).join('');
};

CommandDeck.prototype.renderSkillsCatalog = function() {
  const catalog = this.state.skillsCatalog || { skills: [] };
  const container = document.getElementById('skills-catalog-grid');
  const countEl = document.getElementById('skills-catalog-count');
  if (countEl) countEl.textContent = `${catalog.skills?.length || 0} Skills`;
  if (!container) return;

  if (!catalog.skills || catalog.skills.length === 0) {
    container.innerHTML = '<div class="empty-hint" style="padding:16px;">No skills discovered in ~/.hermes/skills/.</div>';
    return;
  }

  container.innerHTML = catalog.skills.map(s => `
    <div class="skill-card" style="background:var(--bg-secondary); border:1px solid var(--border-subtle); border-radius:var(--radius-md); padding:12px; display:flex; flex-direction:column; gap:6px;">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <span style="font-weight:600; font-size:0.875rem; color:var(--text-1);">📦 ${escapeHtml(s.name)}</span>
        <span class="badge badge-cyan" style="font-size:0.65rem;">agentskills.io</span>
      </div>
      <div style="font-size:0.8rem; color:var(--text-2); line-height:1.4;">${escapeHtml(s.description)}</div>
      <div style="margin-top:auto; padding-top:6px; border-top:1px solid var(--border-subtle); font-size:0.7rem; color:var(--text-3); font-family:var(--font-mono);">
        ${escapeHtml(s.id)}
      </div>
    </div>
  `).join('');
};

CommandDeck.prototype.renderCronJobs = function() {
  const data = this.state.cronJobs || {};
  const list = document.getElementById('cron-list');
  if (!list) return;

  const statusEl = document.getElementById('cron-status');
  if (statusEl) {
    const count = data.total || 0;
    statusEl.innerHTML = `
      <span class="panel-status__dot panel-status__dot--info" aria-hidden="true"></span>
      <span>${count} job(s) in jobs.json</span>
    `;
  }

  if (!data.jobs || data.jobs.length === 0) {
    list.innerHTML = '<div class="empty-hint">No scheduled jobs configured in jobs.json.</div>';
    return;
  }

  const platformIcons = {
    telegram: '✈️ Telegram',
    discord: '👾 Discord',
    email: '✉️ Email',
    local: '🖥️ Local'
  };

  list.innerHTML = data.jobs.map(job => `
    <div class="cron-item" style="display:flex; justify-content:space-between; align-items:center; padding:8px 12px; border-bottom:1px solid var(--border-subtle);">
      <div style="flex:1; min-width:0; margin-right:12px;">
        <div style="display:flex; align-items:center; gap:8px;">
          <span class="cron-item__name" style="font-weight:600; font-size:0.875rem;">${escapeHtml(job.name || 'Untitled')}</span>
          <span class="badge" style="font-size:0.65rem; background:var(--bg-tertiary);">${platformIcons[job.platform] || '🖥️ Local'}</span>
        </div>
        <div style="display:flex; gap:8px; font-size:0.75rem; color:var(--text-3); margin-top:2px;">
          <span>🕒 ${escapeHtml(job.schedule_display || job.schedule_expr || 'Scheduled')}</span>
          <span>•</span>
          <span style="color:var(--accent);">${escapeHtml(job.next_run_estimate || 'Pending')}</span>
        </div>
      </div>
      <div style="display:flex; align-items:center; gap:6px; flex-shrink:0;">
        <button class="btn btn--ghost btn--sm cron-toggle-btn" data-job="${escapeHtml(job.id || job.name)}" data-enabled="${job.enabled ? 'true' : 'false'}" style="padding:2px 8px; font-size:0.75rem;">
          ${job.enabled ? '⏸ Pause' : '▶ Enable'}
        </button>
        <button class="btn btn--ghost btn--sm cron-run-btn" data-job="${escapeHtml(job.id || job.name)}" title="Run this job now" style="padding:2px 8px; font-size:0.75rem;">
          ⚡ Run
        </button>
        <button class="btn btn--ghost btn--sm cron-logs-btn" data-job="${escapeHtml(job.name)}" title="View execution logs" style="padding:2px 6px; font-size:0.75rem;">
          📋 Logs
        </button>
      </div>
    </div>
  `).join('');

  // Wire Run buttons
  list.querySelectorAll('.cron-run-btn').forEach(btn => {
    btn.onclick = async (e) => {
      e.stopPropagation();
      const jobName = btn.dataset.job;
      btn.disabled = true;
      btn.textContent = '⏳';
      try {
        const res = await fetch(`${this.apiBase}/api/cron/${encodeURIComponent(jobName)}/run`, { method: 'POST' });
        const result = await res.json();
        if (res.ok && result.status === 'ok') {
          this.showToast?.(`Job "${jobName}" triggered successfully`, 'ok');
        } else {
          this.showToast?.(result.detail || result.message || `Failed to run job "${jobName}"`, 'warn');
        }
      } catch (err) {
        this.showToast?.(`Error running job "${jobName}"`, 'warn');
      } finally {
        btn.disabled = false;
        btn.textContent = '⚡ Run';
      }
    };
  });

  // Wire Toggle enable/disable buttons
  list.querySelectorAll('.cron-toggle-btn').forEach(btn => {
    btn.onclick = async (e) => {
      e.stopPropagation();
      const jobName = btn.dataset.job;
      const currentlyEnabled = btn.dataset.enabled === 'true';
      btn.disabled = true;
      try {
        const res = await fetch(`${this.apiBase}/api/cron/${encodeURIComponent(jobName)}/toggle`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ enable: !currentlyEnabled })
        });
        if (res.ok) {
          this.showToast?.(`Job "${jobName}" ${!currentlyEnabled ? 'enabled' : 'paused'}`, 'ok');
          await this.fetchCronJobs();
        }
      } catch (err) {
        this.showToast?.(`Failed to toggle "${jobName}"`, 'warn');
      } finally {
        btn.disabled = false;
      }
    };
  });

  // Wire Logs buttons
  list.querySelectorAll('.cron-logs-btn').forEach(btn => {
    btn.onclick = async (e) => {
      e.stopPropagation();
      const jobName = btn.dataset.job;
      this.openCronLogsDrawer(jobName);
    };
  });
};

CommandDeck.prototype.openCronLogsDrawer = async function(jobName) {
  let drawer = document.getElementById('cron-logs-drawer');
  if (!drawer) {
    drawer = document.createElement('div');
    drawer.id = 'cron-logs-drawer';
    drawer.className = 'drawer';
    drawer.innerHTML = `
      <div class="drawer__backdrop" id="cron-logs-backdrop"></div>
      <div class="drawer__panel" style="width:600px; max-width:90vw;">
        <div class="drawer__header" style="display:flex; justify-content:space-between; align-items:center; padding:16px; border-bottom:1px solid var(--border-subtle);">
          <h3 id="cron-logs-title" style="margin:0; font-size:1.1rem;">Cron Job Logs</h3>
          <button class="drawer__close" id="cron-logs-close" style="background:none; border:none; font-size:1.5rem; cursor:pointer; color:var(--text-2);">&times;</button>
        </div>
        <div class="drawer__body" style="padding:16px;">
          <pre id="cron-logs-content" style="background:var(--bg-primary); padding:12px; border-radius:6px; overflow:auto; max-height:calc(100vh - 150px); font-size:0.8rem; font-family:var(--font-mono); color:var(--text-2);"></pre>
        </div>
      </div>
    `;
    document.body.appendChild(drawer);

    document.getElementById('cron-logs-close').onclick = () => { drawer.style.display = 'none'; };
    document.getElementById('cron-logs-backdrop').onclick = () => { drawer.style.display = 'none'; };
  }

  drawer.style.display = 'block';
  document.getElementById('cron-logs-title').textContent = `Logs: ${jobName}`;
  const pre = document.getElementById('cron-logs-content');
  pre.textContent = 'Loading execution logs...';

  try {
    const res = await fetch(`${this.apiBase}/api/cron/${encodeURIComponent(jobName)}/logs`);
    if (res.ok) {
      const data = await res.json();
      pre.textContent = data.logs || 'No logs found.';
    }
  } catch (e) {
    pre.textContent = `Error loading logs: ${e.message}`;
  }
};

CommandDeck.prototype.openMemoryEditorModal = async function() {
  let modal = document.getElementById('memory-editor-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'memory-editor-modal';
    modal.className = 'modal-backdrop';
    modal.style.position = 'fixed';
    modal.style.inset = '0';
    modal.style.background = 'rgba(0,0,0,0.6)';
    modal.style.backdropFilter = 'blur(4px)';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.zIndex = '999';

    modal.innerHTML = `
      <div style="background:var(--bg-secondary); border:1px solid var(--border-subtle); border-radius:var(--radius-lg); width:640px; max-width:94vw; max-height:88vh; display:flex; flex-direction:column; overflow:hidden;">
        <div style="display:flex; justify-content:space-between; align-items:center; padding:14px 16px; border-bottom:1px solid var(--border-subtle);">
          <h3 style="margin:0; font-size:1.1rem; display:flex; align-items:center; gap:8px;">
            <span>🧠 Hermes Cognitive Memory Console</span>
          </h3>
          <button id="memory-modal-close" style="background:none; border:none; font-size:1.4rem; cursor:pointer; color:var(--text-2);">&times;</button>
        </div>
        
        <!-- Memory Tabs -->
        <div class="memory-console-tabs">
          <button class="memory-tab-btn active" data-mem-tab="memory">🧠 MEMORY.md (Hot Facts)</button>
          <button class="memory-tab-btn" data-mem-tab="user">👤 USER.md (Profile)</button>
          <button class="memory-tab-btn" data-mem-tab="soul">✨ SOUL.md (Directives)</button>
        </div>

        <div style="flex:1; overflow-y:auto; display:flex; flex-direction:column;">
          <!-- Tab 1: MEMORY.md -->
          <div id="mem-tab-memory" class="memory-tab-content active">
            <div style="margin-bottom:12px; font-size:0.85rem; color:var(--text-2);">
              Hot memory retains active operational facts across Hermes sessions. Limit: <strong>2,200 characters</strong> (Consolidation triggered at 80%).
            </div>
            <div id="memory-modal-facts-list" style="display:flex; flex-direction:column; gap:6px; margin-bottom:16px;"></div>
            <div style="border-top:1px solid var(--border-subtle); padding-top:12px; margin-top:auto;">
              <label style="font-weight:600; font-size:0.8rem; display:block; margin-bottom:6px;">Add New Fact:</label>
              <input type="text" id="new-memory-fact-input" placeholder="e.g. Preferred model fallback chain: openrouter/auto -> deepseek-v3.2" style="width:100%; padding:8px 12px; background:var(--bg-tertiary); border:1px solid var(--border-subtle); border-radius:var(--radius-sm); color:var(--text-1); font-size:0.875rem;" />
              <div style="display:flex; justify-content:space-between; align-items:center; margin-top:10px;">
                <button id="btn-trigger-consolidation" class="btn btn--ghost btn--sm">Trim / Consolidate</button>
                <button id="btn-save-new-fact" class="btn btn--primary btn--sm">Add Fact</button>
              </div>
            </div>
          </div>

          <!-- Tab 2: USER.md -->
          <div id="mem-tab-user" class="memory-tab-content">
            <div style="margin-bottom:10px; font-size:0.85rem; color:var(--text-2);">
              User profile, habits, working style, and goals shared across Hermes sessions.
            </div>
            <textarea id="user-profile-textarea" style="width:100%; flex:1; min-height:240px; padding:10px; background:var(--bg-tertiary); border:1px solid var(--border-subtle); border-radius:var(--radius-sm); color:var(--text-1); font-family:var(--font-mono, monospace); font-size:0.85rem; resize:vertical;" placeholder="# User Profile..."></textarea>
            <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:10px;">
              <button id="btn-save-user-profile" class="btn btn--primary btn--sm">Save USER.md</button>
            </div>
          </div>

          <!-- Tab 3: SOUL.md -->
          <div id="mem-tab-soul" class="memory-tab-content">
            <div style="margin-bottom:10px; font-size:0.85rem; color:var(--text-2);">
              Hermes agent core identity, operational demeanor, boundary instructions, and voice guidelines.
            </div>
            <textarea id="soul-directives-textarea" style="width:100%; flex:1; min-height:240px; padding:10px; background:var(--bg-tertiary); border:1px solid var(--border-subtle); border-radius:var(--radius-sm); color:var(--text-1); font-family:var(--font-mono, monospace); font-size:0.85rem; resize:vertical;" placeholder="# Soul Directives..."></textarea>
            <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:10px;">
              <button id="btn-save-soul-directives" class="btn btn--primary btn--sm">Save SOUL.md</button>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('memory-modal-close').onclick = () => { modal.style.display = 'none'; };
    modal.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };

    // Tab switching handlers
    modal.querySelectorAll('.memory-tab-btn').forEach(tabBtn => {
      tabBtn.onclick = () => {
        modal.querySelectorAll('.memory-tab-btn').forEach(b => b.classList.remove('active'));
        modal.querySelectorAll('.memory-tab-content').forEach(c => c.classList.remove('active'));
        tabBtn.classList.add('active');
        const tabKey = tabBtn.dataset.memTab;
        const targetPanel = document.getElementById(`mem-tab-${tabKey}`);
        if (targetPanel) targetPanel.classList.add('active');

        if (tabKey === 'user') this.loadUserProfile();
        if (tabKey === 'soul') this.loadSoulDirectives();
        if (tabKey === 'memory') this.loadMemoryModalFacts();
      };
    });

    document.getElementById('btn-save-new-fact').onclick = async () => {
      const input = document.getElementById('new-memory-fact-input');
      const text = input.value.trim();
      if (!text) return;
      try {
        const res = await fetch(`${this.apiBase}/api/memory/facts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text })
        });
        if (res.ok) {
          input.value = '';
          this.showToast?.('Fact added to MEMORY.md', 'ok');
          this.loadMemoryModalFacts();
          this.fetchAgentStatus?.();
        }
      } catch (e) {
        this.showToast?.('Error saving fact', 'warn');
      }
    };

    document.getElementById('btn-trigger-consolidation').onclick = async () => {
      if (!confirm('Trigger Hermes memory consolidation now?')) return;
      try {
        const res = await fetch(`${this.apiBase}/api/memory/consolidate`, { method: 'POST' });
        const data = await res.json();
        this.showToast?.(data.status === 'success' ? 'Memory consolidated successfully' : 'Consolidation complete', 'ok');
        this.loadMemoryModalFacts();
        this.fetchAgentStatus?.();
      } catch (e) {
        this.showToast?.('Consolidation failed', 'warn');
      }
    };

    document.getElementById('btn-save-user-profile').onclick = async () => {
      const textarea = document.getElementById('user-profile-textarea');
      const content = textarea.value;
      try {
        const res = await fetch(`${this.apiBase}/api/memory/user`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content })
        });
        if (res.ok) {
          this.showToast?.('USER.md saved successfully', 'ok');
        } else {
          this.showToast?.('Failed to save USER.md', 'warn');
        }
      } catch (e) {
        this.showToast?.('Error saving USER.md: ' + e.message, 'warn');
      }
    };

    document.getElementById('btn-save-soul-directives').onclick = async () => {
      const textarea = document.getElementById('soul-directives-textarea');
      const content = textarea.value;
      try {
        const res = await fetch(`${this.apiBase}/api/memory/soul`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content })
        });
        if (res.ok) {
          this.showToast?.('SOUL.md saved successfully', 'ok');
        } else {
          this.showToast?.('Failed to save SOUL.md', 'warn');
        }
      } catch (e) {
        this.showToast?.('Error saving SOUL.md: ' + e.message, 'warn');
      }
    };
  }

  modal.style.display = 'flex';
  this.loadMemoryModalFacts();
};

CommandDeck.prototype.loadMemoryModalFacts = async function() {
  const listEl = document.getElementById('memory-modal-facts-list');
  if (!listEl) return;
  listEl.innerHTML = '<div class="agent-loading">Loading memory facts...</div>';

  try {
    const res = await fetch(`${this.apiBase}/api/memory/facts`);
    if (res.ok) {
      const data = await res.json();
      if (!data.facts || data.facts.length === 0) {
        listEl.innerHTML = '<div class="empty-hint">No facts currently in MEMORY.md.</div>';
        return;
      }
      listEl.innerHTML = data.facts.map(f => `
        <div style="display:flex; align-items:center; gap:8px; padding:6px 10px; background:var(--bg-tertiary); border-radius:var(--radius-sm); font-size:0.8rem;">
          <span style="color:var(--accent);">•</span>
          <span style="flex:1;">${escapeHtml(f.text)}</span>
          <span class="badge" style="font-size:0.65rem; background:var(--bg-primary);">${escapeHtml(f.category)}</span>
        </div>
      `).join('');
    }
  } catch (e) {
    listEl.innerHTML = `<div class="empty-hint">Error: ${escapeHtml(e.message)}</div>`;
  }
};

CommandDeck.prototype.loadUserProfile = async function() {
  const textarea = document.getElementById('user-profile-textarea');
  if (!textarea) return;
  textarea.placeholder = 'Loading USER.md...';
  try {
    const res = await fetch(`${this.apiBase}/api/memory/user`);
    if (res.ok) {
      const data = await res.json();
      textarea.value = data.content || '';
    }
  } catch (e) {
    console.warn('Error loading user profile:', e);
  }
};

CommandDeck.prototype.loadSoulDirectives = async function() {
  const textarea = document.getElementById('soul-directives-textarea');
  if (!textarea) return;
  textarea.placeholder = 'Loading SOUL.md...';
  try {
    const res = await fetch(`${this.apiBase}/api/memory/soul`);
    if (res.ok) {
      const data = await res.json();
      textarea.value = data.content || '';
    }
  } catch (e) {
    console.warn('Error loading soul directives:', e);
  }
};

// ── Local Model Inference Scanner ──────────────────────────────────────────────

CommandDeck.prototype.fetchLocalModels = async function() {
  const badge = document.getElementById('local-models-count');
  if (badge) badge.textContent = 'Scanning...';
  try {
    const res = await fetch(`${this.apiBase}/api/models/local`);
    if (res.ok) {
      const data = await res.json();
      this.state.localModels = data;
      this.renderLocalModels(data);
    }
  } catch (e) {
    console.warn('Local models fetch error:', e);
    if (badge) badge.textContent = 'Offline';
  }
};

CommandDeck.prototype.renderLocalModels = function(data) {
  const container = document.getElementById('local-models-container');
  const badge = document.getElementById('local-models-count');
  if (!container) return;

  const models = data?.models || [];
  if (badge) {
    badge.textContent = `${models.length} Online`;
    badge.className = models.length > 0 ? 'badge badge-ok' : 'badge badge-secondary';
  }

  if (models.length === 0) {
    container.innerHTML = `
      <div style="padding:12px; background:var(--bg-secondary); border-radius:var(--radius-sm); font-size:0.8rem; color:var(--text-3); text-align:center;">
        No local inference endpoints responding on :11434 (Ollama), :1234 (LM Studio), or :8000 (vLLM).
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div style="display:flex; flex-wrap:wrap; gap:6px; padding:4px 0;">
      ${models.map(m => `
        <div class="model-chip" title="${escapeHtml(m.provider)} endpoint: ${escapeHtml(m.url)}">
          <span class="dot"></span>
          <span>${escapeHtml(m.name)}</span>
          <span style="font-size:0.65rem; color:var(--text-3);">(${escapeHtml(m.provider)})</span>
        </div>
      `).join('')}
    </div>
  `;
};

// ── Tool Execution Permissions & Safeguards ──────────────────────────────────

CommandDeck.prototype.fetchToolPermissions = async function() {
  try {
    const res = await fetch(`${this.apiBase}/api/tools/permissions`);
    if (res.ok) {
      const data = await res.json();
      this.state.toolPermissions = data;
      this.renderToolPermissions(data);
    }
  } catch (e) {
    console.warn('Tool permissions fetch error:', e);
  }
};

CommandDeck.prototype.renderToolPermissions = function(perms = {}) {
  const container = document.getElementById('tool-perms-container');
  if (!container) return;

  const defaultKeys = [
    { key: 'read_files', label: 'File Reading', desc: 'Allow agent to inspect project files' },
    { key: 'write_files', label: 'File Writing', desc: 'Allow agent to create & modify files' },
    { key: 'bash', label: 'Shell Commands', desc: 'Allow terminal & script execution' },
    { key: 'python', label: 'Python Interpreter', desc: 'Allow running Python scripts' },
    { key: 'web_search', label: 'Web Search', desc: 'Allow online search & browsing' },
    { key: 'cron_management', label: 'Scheduled Jobs', desc: 'Allow creating cron triggers' }
  ];

  container.innerHTML = defaultKeys.map(item => {
    const isChecked = perms[item.key] !== false;
    return `
      <div class="perm-toggle-card">
        <label for="perm-chk-${item.key}">
          <input type="checkbox" id="perm-chk-${item.key}" data-perm-key="${item.key}" ${isChecked ? 'checked' : ''} />
          <span>${escapeHtml(item.label)}</span>
        </label>
      </div>
    `;
  }).join('');
};

CommandDeck.prototype.saveToolPermissions = async function() {
  const container = document.getElementById('tool-perms-container');
  if (!container) return;

  const permissions = {};
  container.querySelectorAll('input[type="checkbox"]').forEach(chk => {
    permissions[chk.dataset.permKey] = chk.checked;
  });

  try {
    const res = await fetch(`${this.apiBase}/api/tools/permissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ permissions })
    });
    if (res.ok) {
      this.showToast?.('Tool permissions updated', 'ok');
    } else {
      this.showToast?.('Failed to update tool permissions', 'warn');
    }
  } catch (e) {
    this.showToast?.('Error saving permissions: ' + e.message, 'warn');
  }
};

// ── Gateway Process Management ────────────────────────────────────────────────

CommandDeck.prototype.restartGateway = async function() {
  if (!confirm('Send restart signal to Hermes Gateway process?')) return;
  try {
    const res = await fetch(`${this.apiBase}/api/gateway/restart`, { method: 'POST' });
    if (res.ok) {
      this.showToast?.('Restart signal dispatched to Hermes Gateway', 'ok');
      setTimeout(() => this.fetchAgentStatus?.(), 2000);
    }
  } catch (e) {
    this.showToast?.('Gateway restart request failed', 'warn');
  }
};

// Wire Hot Memory HUD click, scan buttons, and memory buttons
document.addEventListener('DOMContentLoaded', () => {
  const memHud = document.getElementById('hud-memory-metric');
  if (memHud) {
    memHud.style.cursor = 'pointer';
    memHud.onclick = () => window.commandDeck?.openMemoryEditorModal();
  }
  const memBtn = document.getElementById('btn-open-memory-console');
  if (memBtn) {
    memBtn.onclick = () => window.commandDeck?.openMemoryEditorModal();
  }
  const refreshSkillsBtn = document.getElementById('btn-refresh-skills');
  if (refreshSkillsBtn) {
    refreshSkillsBtn.onclick = async () => {
      refreshSkillsBtn.disabled = true;
      refreshSkillsBtn.textContent = '⏳ Refreshing...';
      try {
        await window.commandDeck?.fetchSkillsCatalog?.();
      } finally {
        refreshSkillsBtn.disabled = false;
        refreshSkillsBtn.textContent = '↻ Refresh Skills';
      }
    };
  }
  const scanModelsBtn = document.getElementById('btn-refresh-local-models');
  if (scanModelsBtn) {
    scanModelsBtn.onclick = async () => {
      scanModelsBtn.disabled = true;
      scanModelsBtn.textContent = '⏳ Scanning...';
      try {
        await window.commandDeck?.fetchLocalModels?.();
      } finally {
        scanModelsBtn.disabled = false;
        scanModelsBtn.textContent = '↻ Scan';
      }
    };
  }
  const savePermsBtn = document.getElementById('btn-save-tool-perms');
  if (savePermsBtn) {
    savePermsBtn.onclick = () => window.commandDeck?.saveToolPermissions?.();
  }
});

// ── Knowledge Graph and Search Highlight Utilities ─────────────────────────────

CommandDeck.prototype.renderGraphifyStatus = function() {
  const data = this.state.graphifyStatus || {};
  const grid = document.getElementById('graphify-grid');
  if (!grid) return;

  const statusEl = document.getElementById('graphify-status');
  if (statusEl) {
    const hasData = data.nodes > 0;
    statusEl.innerHTML = `
      <span class="panel-status__dot ${hasData ? 'panel-status__dot--ok' : 'panel-status__dot--warn'}" aria-hidden="true"></span>
      <span>${hasData ? 'Indexed' : 'No data'}</span>
    `;
  }

  grid.innerHTML = `
    <div class="graphify-stat">
      <span class="graphify-stat__label">Knowledge Graph Nodes</span>
      <span class="graphify-stat__value">${data.nodes || 0}</span>
    </div>
    <div class="graphify-stat">
      <span class="graphify-stat__label">Knowledge Graph Edges</span>
      <span class="graphify-stat__value">${data.edges || 0}</span>
    </div>
    <div class="graphify-stat">
      <span class="graphify-stat__label">Brain DB</span>
      <span class="graphify-stat__value">${data.brain_dir ? '✓ Indexed' : '✗ Empty'}</span>
    </div>
  `;
};

CommandDeck.prototype.initCollapsiblePanels = function() {
  document.querySelectorAll('.collapsible-panel .panel-header').forEach(header => {
    header.addEventListener('click', (e) => {
      if (e.target.closest('.panel-actions') || e.target.closest('button')) return;
      const panel = header.closest('.collapsible-panel');
      const isCollapsed = panel.dataset.collapsed === 'true';
      panel.dataset.collapsed = !isCollapsed;
    });
  });
};

CommandDeck.prototype.highlightSearchTerm = function(text, term) {
  if (!term) return escapeHtml(text);
  const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return escapeHtml(text).replace(regex, '<mark class="search-highlight">$1</mark>');
};

CommandDeck.prototype.searchWiki = async function(query) {
  if (!query || query.length < 2) return;
  const container = document.getElementById('wiki-results-container');
  if (!container) return;
  container.innerHTML = '<div class="empty-hint">Searching...</div>';
  
  try {
    const res = await fetch(`${this.apiBase}/api/wiki/search?q=${encodeURIComponent(query)}`);
    if (res.ok) {
      const results = await res.json();
      this.renderWikiResults(results, query);
    }
  } catch (e) {
    container.innerHTML = '<div class="empty-hint">Search failed. Please try again.</div>';
  }
};

CommandDeck.prototype.renderWikiResults = function(results, query) {
  const container = document.getElementById('wiki-results-container');
  if (!container) return;

  if (results.length === 0) {
    container.innerHTML = `<div class="empty-hint">No results found for "${escapeHtml(query)}"</div>`;
    return;
  }

  const countEl = `<div class="search-results-count">${results.length} result(s)</div>`;
  const items = results.map(r => `
    <div class="wiki-result-card" data-wiki-path="${escapeHtml(r.path)}" style="cursor:pointer; padding:8px 12px; border-bottom:1px solid var(--border-subtle);">
      <div class="wiki-result-header" style="display:flex; justify-content:space-between; align-items:center;">
        <span class="wiki-result-title" style="font-weight:600;">${this.highlightSearchTerm(r.title, query)}</span>
        <span class="badge badge-cyan">${escapeHtml(r.tier || 'wiki')}</span>
      </div>
      <div class="wiki-res-snippet" style="font-size:0.8rem; color:var(--text-2); margin-top:4px;">${this.highlightSearchTerm(r.snippet, query)}</div>
    </div>
  `).join('');

  container.innerHTML = countEl + items;

  container.querySelectorAll('.wiki-result-card').forEach(card => {
    card.onclick = () => {
      const p = card.dataset.wikiPath;
      if (typeof this.loadVaultNote === 'function') {
        this.loadVaultNote(p);
      } else if (typeof this.openWikiDrawer === 'function') {
        this.openWikiDrawer({ path: p, label: card.querySelector('.wiki-result-title')?.textContent });
      }
    };
  });
};

CommandDeck.prototype.showToast = function(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
};

CommandDeck.prototype.initKeyboardShortcuts = function() {
  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    
    switch(e.key.toLowerCase()) {
      case 'c':
        document.getElementById('chat-drawer')?.classList.toggle('open');
        break;
      case 't':
        document.getElementById('telemetry-drawer')?.classList.toggle('open');
        break;
      case 'n':
        this.openCreateModal?.('task');
        break;
      case 'k':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          document.getElementById('command-palette')?.showModal();
        }
        break;
      case '/':
        e.preventDefault();
        document.getElementById('wiki-search-input')?.focus();
        break;
    }
  });
};
