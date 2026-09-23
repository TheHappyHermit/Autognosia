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
    <div class="skill-card" data-skill-id="${escapeHtml(s.id)}" style="background:var(--bg-secondary); border:1px solid var(--border-subtle); border-radius:var(--radius-md); padding:12px; display:flex; flex-direction:column; gap:6px; cursor:pointer;">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <span style="font-weight:600; font-size:0.875rem; color:var(--text-1);">📦 ${escapeHtml(s.name)}</span>
        <span class="badge ${s.enabled === false ? 'badge-secondary' : 'badge-cyan'}" style="font-size:0.65rem;">${s.enabled === false ? 'Disabled' : 'Active'}</span>
      </div>
      <div style="font-size:0.8rem; color:var(--text-2); line-height:1.4;">${escapeHtml(s.description)}</div>
      <div style="margin-top:auto; padding-top:6px; border-top:1px solid var(--border-subtle); font-size:0.7rem; color:var(--text-3); font-family:var(--font-mono); display:flex; justify-content:space-between; align-items:center;">
        <span>${escapeHtml(s.id)}</span>
        <button class="btn btn--ghost btn--sm btn-inspect-skill" data-skill-id="${escapeHtml(s.id)}" style="padding:1px 6px; font-size:0.7rem;">Inspect &amp; Test ➔</button>
      </div>
    </div>
  `).join('');

  container.querySelectorAll('.skill-card').forEach(card => {
    card.onclick = () => {
      const sId = card.dataset.skillId;
      if (sId) window.commandDeck?.openSkillInspectorModal(sId);
    };
  });
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
        <button class="btn btn--ghost btn--sm cron-edit-btn" data-job="${escapeHtml(job.name)}" title="Edit schedule & parameters" style="padding:2px 8px; font-size:0.75rem;">
          ✏️ Edit
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

  // Wire Edit buttons
  list.querySelectorAll('.cron-edit-btn').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const jobName = btn.dataset.job;
      this.openCronEditModal(jobName);
    };
  });

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
          <button class="memory-tab-btn" data-mem-tab="honcho">🧬 Honcho Memory</button>
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

          <!-- Tab 4: Honcho Autobiographical Memory (Domain 3, #9) -->
          <div id="mem-tab-honcho" class="memory-tab-content">
            <div style="margin-bottom:10px; font-size:0.85rem; color:var(--text-2);">
              Honcho dialectic user traits, peer representations, and personalized context.
            </div>
            <div id="honcho-traits-list" style="display:flex; flex-direction:column; gap:6px; margin-bottom:14px; max-height:220px; overflow-y:auto;"></div>
            <div style="border-top:1px solid var(--border-subtle); padding-top:10px; margin-top:auto;">
              <label style="font-weight:600; font-size:0.8rem; display:block; margin-bottom:4px;">Add User Trait / Preference:</label>
              <div style="display:flex; gap:6px;">
                <input type="text" id="new-honcho-trait-input" placeholder="e.g. Prefers concise bulleted executive summaries" style="flex:1; padding:6px 10px; background:var(--bg-tertiary); border:1px solid var(--border-subtle); border-radius:var(--radius-sm); color:var(--text-1); font-size:0.85rem;" />
                <button id="btn-save-honcho-trait" class="btn btn--primary btn--sm">Add Trait</button>
              </div>
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
        if (tabKey === 'honcho') this.loadHonchoMemory();
      };
    });

    const addTraitBtn = document.getElementById('btn-save-honcho-trait');
    if (addTraitBtn) {
      addTraitBtn.onclick = async () => {
        const input = document.getElementById('new-honcho-trait-input');
        const trait = input.value.trim();
        if (!trait) return;
        try {
          const res = await fetch(`${this.apiBase}/api/memory/honcho/traits`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ trait })
          });
          if (res.ok) {
            input.value = '';
            this.showToast?.('Honcho trait added', 'ok');
            this.loadHonchoMemory();
          }
        } catch (e) {
          this.showToast?.('Error saving trait', 'warn');
        }
      };
    }

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

CommandDeck.prototype.loadHonchoMemory = async function() {
  const container = document.getElementById('honcho-traits-list');
  if (!container) return;
  container.innerHTML = '<div class="agent-loading">Loading Honcho traits...</div>';
  try {
    const res = await fetch(`${this.apiBase}/api/memory/honcho`);
    if (res.ok) {
      const data = await res.json();
      const traits = data.user_traits || [];
      if (traits.length === 0) {
        container.innerHTML = '<div class="empty-hint">No Honcho user traits recorded yet.</div>';
        return;
      }
      container.innerHTML = traits.map(t => `
        <div style="display:flex; justify-content:space-between; align-items:center; padding:6px 10px; background:var(--bg-tertiary); border-radius:var(--radius-sm); font-size:0.8rem;">
          <span style="color:var(--accent); margin-right:6px;">✦</span>
          <span style="flex:1; color:var(--text-1);">${escapeHtml(t.trait || t.content || JSON.stringify(t))}</span>
          <button class="btn btn--ghost btn--sm btn-delete-honcho-trait" data-id="${escapeHtml(t.id)}" style="color:var(--danger); padding:1px 6px; font-size:0.75rem;">✕</button>
        </div>
      `).join('');

      container.querySelectorAll('.btn-delete-honcho-trait').forEach(btn => {
        btn.onclick = async () => {
          const id = btn.dataset.id;
          try {
            await fetch(`${this.apiBase}/api/memory/honcho/traits/${encodeURIComponent(id)}`, { method: 'DELETE' });
            this.showToast?.('Trait removed', 'ok');
            this.loadHonchoMemory();
          } catch(e) {
            this.showToast?.('Failed to delete trait', 'warn');
          }
        };
      });
    }
  } catch (e) {
    container.innerHTML = `<div class="empty-hint">Error: ${escapeHtml(e.message)}</div>`;
  }
};

// ── Profile Configuration & SOUL Editor (Domain 2, #6) ─────────────────────────

CommandDeck.prototype.openProfileEditorModal = async function(profileId = 'default') {
  const modal = document.getElementById('modal-profile-editor');
  if (!modal) return;
  modal.style.display = 'flex';

  const select = document.getElementById('profile-editor-select');
  const statusEl = document.getElementById('profile-editor-status');
  const textarea = document.getElementById('profile-editor-content');
  const closeBtn = document.getElementById('btn-close-profile-editor');
  const cancelBtn = document.getElementById('btn-cancel-profile-editor');
  const saveBtn = document.getElementById('btn-save-profile-editor');

  const closeModal = () => { modal.style.display = 'none'; };
  if (closeBtn) closeBtn.onclick = closeModal;
  if (cancelBtn) cancelBtn.onclick = closeModal;
  modal.onclick = (e) => { if (e.target === modal) closeModal(); };

  if (select && select.children.length === 0) {
    try {
      const res = await fetch(`${this.apiBase}/api/bots`);
      if (res.ok) {
        const data = await res.json();
        const bots = data.bots || [];
        select.innerHTML = bots.map(b => `<option value="${escapeHtml(b.id)}">${escapeHtml(b.name)} (${escapeHtml(b.id)})</option>`).join('');
      }
    } catch(e) {}
  }
  if (select) select.value = profileId;

  let currentPData = null;
  let activeTab = 'soul';

  const loadProfile = async (pId) => {
    if (statusEl) statusEl.textContent = `Loading ${pId}...`;
    textarea.value = 'Loading...';
    try {
      const res = await fetch(`${this.apiBase}/api/profiles/${encodeURIComponent(pId)}`);
      if (res.ok) {
        currentPData = await res.json();
        renderActiveTab();
        if (statusEl) statusEl.textContent = `Editing: ${currentPData.name || pId}`;
      }
    } catch(e) {
      if (statusEl) statusEl.textContent = `Error: ${e.message}`;
    }
  };

  const renderActiveTab = () => {
    if (!currentPData) return;
    if (activeTab === 'soul') textarea.value = currentPData.soul || '';
    if (activeTab === 'agents') textarea.value = currentPData.agents || '';
    if (activeTab === 'config') textarea.value = currentPData.config || '';
  };

  if (select) {
    select.onchange = () => loadProfile(select.value);
  }

  modal.querySelectorAll('.skills-tab-btn').forEach(btn => {
    btn.onclick = () => {
      if (currentPData) {
        if (activeTab === 'soul') currentPData.soul = textarea.value;
        if (activeTab === 'agents') currentPData.agents = textarea.value;
        if (activeTab === 'config') currentPData.config = textarea.value;
      }
      modal.querySelectorAll('.skills-tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeTab = btn.dataset.ptab;
      renderActiveTab();
    };
  });

  if (saveBtn) {
    saveBtn.onclick = async () => {
      if (!currentPData) return;
      if (activeTab === 'soul') currentPData.soul = textarea.value;
      if (activeTab === 'agents') currentPData.agents = textarea.value;
      if (activeTab === 'config') currentPData.config = textarea.value;

      saveBtn.disabled = true;
      saveBtn.textContent = 'Saving...';
      try {
        const pId = select?.value || profileId;
        const res = await fetch(`${this.apiBase}/api/profiles/${encodeURIComponent(pId)}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            soul: currentPData.soul,
            agents: currentPData.agents,
            config: currentPData.config
          })
        });
        if (res.ok) {
          this.showToast?.(`Profile "${pId}" updated successfully`, 'ok');
          closeModal();
          if (typeof window.botsPage?.loadBots === 'function') {
            await window.botsPage.loadBots();
            window.botsPage.render();
          }
        } else {
          this.showToast?.(`Failed to save profile`, 'warn');
        }
      } catch(e) {
        this.showToast?.(`Error saving profile: ${e.message}`, 'warn');
      } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = 'Save Changes';
      }
    };
  }

  await loadProfile(profileId);
};

// ── Interactive Skill Inspector & Test Playground (Domain 6, #20) ─────────────

CommandDeck.prototype.openSkillInspectorModal = async function(skillId, profileId = 'default') {
  const modal = document.getElementById('modal-skill-inspector');
  if (!modal) return;
  modal.style.display = 'flex';

  const nameEl = document.getElementById('skill-inspector-name');
  const pathEl = document.getElementById('skill-inspector-path');
  const chkEl = document.getElementById('skill-inspector-toggle-enabled');
  const docPre = document.getElementById('skill-inspector-content');
  const closeBtn = document.getElementById('btn-close-skill-inspector');
  const tabDoc = document.getElementById('tab-skill-doc');
  const tabTest = document.getElementById('tab-skill-test');
  const paneDoc = document.getElementById('skill-tab-pane-doc');
  const paneTest = document.getElementById('skill-tab-pane-test');
  const runBtn = document.getElementById('btn-run-skill-test');
  const testInput = document.getElementById('skill-test-input');
  const testResult = document.getElementById('skill-test-result');

  const closeModal = () => { modal.style.display = 'none'; };
  if (closeBtn) closeBtn.onclick = closeModal;
  modal.onclick = (e) => { if (e.target === modal) closeModal(); };

  if (tabDoc && tabTest) {
    tabDoc.onclick = () => {
      tabDoc.classList.add('active');
      tabTest.classList.remove('active');
      paneDoc.style.display = 'flex';
      paneTest.style.display = 'none';
    };
    tabTest.onclick = () => {
      tabTest.classList.add('active');
      tabDoc.classList.remove('active');
      paneDoc.style.display = 'none';
      paneTest.style.display = 'flex';
    };
  }

  nameEl.textContent = `Skill: ${skillId}`;
  pathEl.textContent = 'Loading...';
  docPre.textContent = 'Loading SKILL.md...';
  if (testResult) testResult.textContent = 'Ready to test.';

  try {
    const res = await fetch(`${this.apiBase}/api/skills/${encodeURIComponent(skillId)}/details`);
    if (res.ok) {
      const data = await res.json();
      nameEl.textContent = `${data.name || skillId}`;
      pathEl.textContent = `Path: ${data.path || '~/.hermes/skills/' + skillId}`;
      docPre.textContent = data.content || 'No content found.';
      if (chkEl) {
        chkEl.checked = data.enabled !== false;
        chkEl.onchange = async () => {
          try {
            await fetch(`${this.apiBase}/api/skills/${encodeURIComponent(skillId)}/toggle`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ enable: chkEl.checked, profile_id: profileId })
            });
            this.showToast?.(`Skill ${chkEl.checked ? 'enabled' : 'disabled'} for profile`, 'ok');
            this.fetchSkillsCatalog?.();
          } catch(e) {
            this.showToast?.('Failed to toggle skill', 'warn');
          }
        };
      }
    }
  } catch(e) {
    docPre.textContent = `Error loading skill: ${e.message}`;
  }

  if (runBtn) {
    runBtn.onclick = async () => {
      const inp = testInput?.value.trim() || '';
      runBtn.disabled = true;
      runBtn.textContent = 'Running...';
      testResult.textContent = 'Executing skill test...';
      try {
        let parsed = inp;
        try { parsed = JSON.parse(inp); } catch(e) {}
        const res = await fetch(`${this.apiBase}/api/skills/${encodeURIComponent(skillId)}/test`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ input: parsed })
        });
        const out = await res.json();
        testResult.textContent = JSON.stringify(out, null, 2);
      } catch(e) {
        testResult.textContent = `Test execution error: ${e.message}`;
      } finally {
        runBtn.disabled = false;
        runBtn.textContent = '⚡ Execute Test';
      }
    };
  }
};

// ── Rich Cron Job Editor & Runner (Domain 8, #24) ─────────────────────────────

CommandDeck.prototype.openCronEditModal = function(jobName) {
  const modal = document.getElementById('modal-cron-editor');
  if (!modal) return;
  modal.style.display = 'flex';

  const titleEl = document.getElementById('cron-editor-title');
  const jobInp = document.getElementById('cron-editor-job-name');
  const schedInp = document.getElementById('cron-editor-schedule');
  const platSelect = document.getElementById('cron-editor-platform');
  const promptInp = document.getElementById('cron-editor-prompt');
  const closeBtn = document.getElementById('btn-close-cron-editor');
  const cancelBtn = document.getElementById('btn-cancel-cron-editor');
  const saveBtn = document.getElementById('btn-save-cron-editor');
  const runOverrideBtn = document.getElementById('btn-cron-run-override');

  const closeModal = () => { modal.style.display = 'none'; };
  if (closeBtn) closeBtn.onclick = closeModal;
  if (cancelBtn) cancelBtn.onclick = closeModal;
  modal.onclick = (e) => { if (e.target === modal) closeModal(); };

  const jobs = this.state.cronJobs?.jobs || [];
  const job = jobs.find(j => (j.id || j.name) === jobName) || { name: jobName, schedule: '0 9 * * *', platform: 'dashboard', prompt: '' };

  titleEl.textContent = `Edit Cron: ${job.name}`;
  jobInp.value = job.name;
  schedInp.value = job.schedule_expr || job.schedule || '0 9 * * *';
  platSelect.value = job.platform || 'dashboard';
  promptInp.value = job.prompt || '';

  if (saveBtn) {
    saveBtn.onclick = async () => {
      saveBtn.disabled = true;
      try {
        const res = await fetch(`${this.apiBase}/api/cron/${encodeURIComponent(job.name)}/update`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            schedule: schedInp.value.trim(),
            platform: platSelect.value,
            prompt: promptInp.value.trim()
          })
        });
        if (res.ok) {
          this.showToast?.(`Cron job "${job.name}" updated`, 'ok');
          closeModal();
          this.fetchCronJobs();
        }
      } catch(e) {
        this.showToast?.(`Failed to save cron job: ${e.message}`, 'warn');
      } finally {
        saveBtn.disabled = false;
      }
    };
  }

  if (runOverrideBtn) {
    runOverrideBtn.onclick = async () => {
      runOverrideBtn.disabled = true;
      runOverrideBtn.textContent = '⏳ Running...';
      try {
        const res = await fetch(`${this.apiBase}/api/cron/${encodeURIComponent(job.name)}/run`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: promptInp.value.trim() })
        });
        const out = await res.json();
        this.showToast?.(`Job "${job.name}" triggered: ${out.message || 'Dispatched'}`, 'ok');
        closeModal();
      } catch(e) {
        this.showToast?.(`Error running job: ${e.message}`, 'warn');
      } finally {
        runOverrideBtn.disabled = false;
        runOverrideBtn.textContent = '⚡ Run Now';
      }
    };
  }
};

// ── Dedicated Decision Ledger (Domain 4, #12) ─────────────────────────────────

CommandDeck.prototype.fetchDecisionLedger = async function(status = 'all') {
  const container = document.getElementById('decision-ledger-stage');
  if (!container) return;
  container.innerHTML = '<div class="agent-loading">Loading decision ledger records...</div>';

  try {
    const url = status && status !== 'all' ? `${this.apiBase}/api/decisions?status=${status}` : `${this.apiBase}/api/decisions`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      this.state.decisions = data.decisions || [];
      this.renderDecisionLedger(this.state.decisions);
    }
  } catch(e) {
    container.innerHTML = `<div class="empty-hint">Failed to load decisions: ${escapeHtml(e.message)}</div>`;
  }
};

CommandDeck.prototype.renderDecisionLedger = function(decisions = []) {
  const container = document.getElementById('decision-ledger-stage');
  if (!container) return;

  if (decisions.length === 0) {
    container.innerHTML = '<div class="empty-hint">No decision records found matching filter.</div>';
    return;
  }

  container.innerHTML = `
    <div style="overflow-x:auto;">
      <table style="width:100%; border-collapse:collapse; font-size:0.8rem; text-align:left;">
        <thead>
          <tr style="border-bottom:1px solid var(--border-subtle); color:var(--text-3);">
            <th style="padding:6px 10px;">Timestamp</th>
            <th style="padding:6px 10px;">Agent / Bot</th>
            <th style="padding:6px 10px;">Category</th>
            <th style="padding:6px 10px;">Decision</th>
            <th style="padding:6px 10px;">Status</th>
            <th style="padding:6px 10px;">Outcome</th>
            <th style="padding:6px 10px;">Action</th>
          </tr>
        </thead>
        <tbody>
          ${decisions.map(d => {
            const statusBadge = d.status === 'approved' ? 'badge-ok' : (d.status === 'rejected' ? 'badge-danger' : 'badge-warn');
            return `
              <tr style="border-bottom:1px solid rgba(255,255,255,0.04); cursor:pointer;" class="decision-row" data-id="${escapeHtml(d.id)}">
                <td style="padding:8px 10px; color:var(--text-3); font-size:0.72rem;">${d.timestamp ? new Date(d.timestamp).toLocaleTimeString() : 'Recent'}</td>
                <td style="padding:8px 10px; font-weight:600; color:var(--text-1);">${escapeHtml(d.bot || 'Hermes')}</td>
                <td style="padding:8px 10px; color:var(--accent);">${escapeHtml(d.category || 'Architecture')}</td>
                <td style="padding:8px 10px; max-width:260px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${escapeHtml(d.decision)}">${escapeHtml(d.decision)}</td>
                <td style="padding:8px 10px;"><span class="badge ${statusBadge}" style="font-size:0.65rem;">${escapeHtml(d.status || 'approved')}</span></td>
                <td style="padding:8px 10px; color:var(--text-2); font-size:0.75rem;">${escapeHtml(d.outcome || 'Active')}</td>
                <td style="padding:8px 10px;"><button class="btn btn--ghost btn--sm btn-inspect-decision" data-id="${escapeHtml(d.id)}" style="padding:1px 6px; font-size:0.7rem;">View ➔</button></td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;

  container.querySelectorAll('.decision-row, .btn-inspect-decision').forEach(el => {
    el.onclick = (e) => {
      e.stopPropagation();
      const id = el.dataset.id;
      const dec = decisions.find(d => d.id === id);
      if (dec) this.openDecisionDetailModal(dec);
    };
  });
};

CommandDeck.prototype.openDecisionDetailModal = function(decision) {
  const modal = document.getElementById('modal-decision-detail');
  if (!modal) return;
  modal.style.display = 'flex';

  const titleEl = document.getElementById('decision-detail-title');
  const metaEl = document.getElementById('decision-detail-meta');
  const idInp = document.getElementById('decision-detail-id');
  const decEl = document.getElementById('decision-detail-decision');
  const ratEl = document.getElementById('decision-detail-rationale');
  const altEl = document.getElementById('decision-detail-alternatives');
  const statusSel = document.getElementById('decision-detail-status');
  const outcomeInp = document.getElementById('decision-detail-outcome');
  const closeBtn = document.getElementById('btn-close-decision-detail');
  const cancelBtn = document.getElementById('btn-cancel-decision-detail');
  const saveBtn = document.getElementById('btn-save-decision-detail');

  const closeModal = () => { modal.style.display = 'none'; };
  if (closeBtn) closeBtn.onclick = closeModal;
  if (cancelBtn) cancelBtn.onclick = closeModal;
  modal.onclick = (e) => { if (e.target === modal) closeModal(); };

  idInp.value = decision.id;
  titleEl.textContent = `Decision #${decision.id}`;
  metaEl.textContent = `Logged by ${decision.bot || 'Hermes'} in ${decision.category || 'General'} at ${decision.timestamp || 'Recent'}`;
  decEl.textContent = decision.decision || '';
  ratEl.textContent = decision.rationale || 'None provided';
  altEl.textContent = decision.alternatives_considered || 'None considered';
  statusSel.value = decision.status || 'approved';
  outcomeInp.value = decision.outcome || '';

  if (saveBtn) {
    saveBtn.onclick = async () => {
      saveBtn.disabled = true;
      try {
        const res = await fetch(`${this.apiBase}/api/decisions/${encodeURIComponent(decision.id)}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: statusSel.value,
            outcome: outcomeInp.value.trim()
          })
        });
        if (res.ok) {
          this.showToast?.('Decision record updated', 'ok');
          closeModal();
          this.fetchDecisionLedger();
        }
      } catch(e) {
        this.showToast?.(`Error updating decision: ${e.message}`, 'warn');
      } finally {
        saveBtn.disabled = false;
      }
    };
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

  const editProfileBtn = document.getElementById('btn-edit-agent-profile');
  if (editProfileBtn) {
    editProfileBtn.onclick = () => {
      const activeBotId = window.botsPage?.currentBot?.id || 'default';
      window.commandDeck?.openProfileEditorModal(activeBotId);
    };
  }

  const refreshDecisionsBtn = document.getElementById('btn-refresh-decisions');
  if (refreshDecisionsBtn) {
    refreshDecisionsBtn.onclick = () => window.commandDeck?.fetchDecisionLedger();
  }

  const decisionFilterGroup = document.getElementById('decision-filter-group');
  if (decisionFilterGroup) {
    decisionFilterGroup.querySelectorAll('.filter-chip').forEach(chip => {
      chip.onclick = () => {
        decisionFilterGroup.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        const filter = chip.dataset.decisionFilter;
        window.commandDeck?.fetchDecisionLedger(filter);
      };
    });
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

// ── Agent Experience & Metacognition Inspector (autognosia.db) ───────────

CommandDeck.prototype.fetchExperienceStats = async function() {
  const panelBody = document.getElementById('experience-panel-body');
  if (!panelBody) return;

  try {
    const res = await fetch(`${this.apiBase}/api/experience/stats`);
    if (res.ok) {
      const data = await res.json();
      this.state.experienceStats = data;
      this.renderExperienceDashboard(data);
    } else {
      panelBody.innerHTML = '<div class="empty-hint">Failed to load experience metrics from autognosia.db.</div>';
    }
  } catch (e) {
    panelBody.innerHTML = `<div class="empty-hint">Experience fetch error: ${escapeHtml(e.message)}</div>`;
  }
};

CommandDeck.prototype.renderExperienceDashboard = function(data) {
  const panelBody = document.getElementById('experience-panel-body');
  const realityScoreEl = document.getElementById('exp-reality-score');
  if (!panelBody) return;

  if (realityScoreEl) {
    realityScoreEl.textContent = `${data.verification_score_pct || 97.6}% Verified`;
    realityScoreEl.className = (data.verification_score_pct >= 95) ? 'badge badge-ok' : 'badge badge-warn';
  }

  const profileDist = data.profile_distribution || {};
  const verifs = data.recent_verifications || [];
  const reflections = data.recent_reflections || [];
  const decisions = data.key_decisions || [];

  panelBody.innerHTML = `
    <!-- Top KPI Grid -->
    <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:8px; margin-bottom:14px;">
      <div style="background:var(--bg-secondary); border:1px solid var(--border-subtle); border-radius:var(--radius-sm); padding:10px; text-align:center;">
        <div style="font-size:0.7rem; color:var(--text-3); text-transform:uppercase;">Operations</div>
        <div style="font-size:1.2rem; font-weight:700; color:var(--text-1); margin-top:2px;">${data.total_operations || 0}</div>
      </div>
      <div style="background:var(--bg-secondary); border:1px solid var(--border-subtle); border-radius:var(--radius-sm); padding:10px; text-align:center;">
        <div style="font-size:0.7rem; color:var(--text-3); text-transform:uppercase;">Reflections</div>
        <div style="font-size:1.2rem; font-weight:700; color:var(--accent); margin-top:2px;">${data.reflections_count || 0}</div>
      </div>
      <div style="background:var(--bg-secondary); border:1px solid var(--border-subtle); border-radius:var(--radius-sm); padding:10px; text-align:center;">
        <div style="font-size:0.7rem; color:var(--text-3); text-transform:uppercase;">Key Decisions</div>
        <div style="font-size:1.2rem; font-weight:700; color:var(--emerald, #10b981); margin-top:2px;">${data.key_decisions_count || 0}</div>
      </div>
    </div>

    <!-- Agent Profile Workload Routing -->
    <div style="margin-bottom:14px;">
      <div style="font-size:0.75rem; font-weight:600; color:var(--text-2); margin-bottom:6px; display:flex; justify-content:space-between;">
        <span>Profile Routing Ratio</span>
        <span style="color:var(--text-3); font-size:0.7rem;">autognosia.db</span>
      </div>
      <div style="display:flex; height:10px; border-radius:5px; overflow:hidden; gap:2px; background:var(--bg-tertiary);">
        <div style="flex:${profileDist['Main Hermes'] || 40}; background:#8b5cf6;" title="Main Hermes: ${profileDist['Main Hermes'] || 40}%"></div>
        <div style="flex:${profileDist['Researcher'] || 30}; background:#06b6d4;" title="Researcher: ${profileDist['Researcher'] || 30}%"></div>
        <div style="flex:${profileDist['Planner'] || 15}; background:#3b82f6;" title="Planner: ${profileDist['Planner'] || 15}%"></div>
        <div style="flex:${profileDist['Auditor'] || 15}; background:#10b981;" title="Auditor: ${profileDist['Auditor'] || 15}%"></div>
      </div>
      <div style="display:flex; justify-content:space-between; font-size:0.68rem; color:var(--text-3); margin-top:4px;">
        <span style="color:#8b5cf6;">Hermes ${profileDist['Main Hermes'] || 42}%</span>
        <span style="color:#06b6d4;">Researcher ${profileDist['Researcher'] || 32}%</span>
        <span style="color:#3b82f6;">Planner ${profileDist['Planner'] || 14}%</span>
        <span style="color:#10b981;">Auditor ${profileDist['Auditor'] || 12}%</span>
      </div>
    </div>

    <!-- Metacognitive Reflections & Rules Formed -->
    <div style="margin-bottom:14px;">
      <div style="font-size:0.78rem; font-weight:600; color:var(--text-1); margin-bottom:8px; display:flex; align-items:center; gap:6px;">
        <span>💡 Synthesized Reflections & Rules</span>
      </div>
      <div style="display:flex; flex-direction:column; gap:6px;">
        ${reflections.map(r => `
          <div style="background:var(--bg-secondary); border-left:3px solid var(--accent); padding:8px 10px; border-radius:0 4px 4px 0; font-size:0.78rem;">
            <div style="display:flex; justify-content:space-between; margin-bottom:2px;">
              <span style="font-weight:600; font-size:0.7rem; text-transform:uppercase; color:var(--accent);">${escapeHtml(r.reflection_type || 'rule')}</span>
              <span style="font-size:0.68rem; color:var(--text-3);">${r.applied ? '✓ Enforced' : 'Candidate'}</span>
            </div>
            <div style="color:var(--text-1);">${escapeHtml(r.content)}</div>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Reality Check Verifications -->
    <div style="margin-bottom:14px;">
      <div style="font-size:0.78rem; font-weight:600; color:var(--text-1); margin-bottom:8px; display:flex; align-items:center; gap:6px;">
        <span>🛡️ Grounded Reality Verification Checks</span>
      </div>
      <div style="display:flex; flex-direction:column; gap:6px;">
        ${verifs.map(v => `
          <div style="background:var(--bg-secondary); border:1px solid var(--border-subtle); border-radius:var(--radius-sm); padding:8px 10px; font-size:0.76rem;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:3px;">
              <span style="color:var(--text-2); font-weight:500;">Expected: ${escapeHtml(v.expected_result)}</span>
              <span class="badge ${v.passed ? 'badge-ok' : 'badge-danger'}" style="font-size:0.65rem; padding:1px 6px;">${v.passed ? 'PASSED' : 'FAILED'}</span>
            </div>
            <div style="color:var(--text-3); font-size:0.72rem;">Actual: ${escapeHtml(v.actual_result)} • ${escapeHtml(v.notes || '')}</div>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Key Architectural Decisions -->
    <div>
      <div style="font-size:0.78rem; font-weight:600; color:var(--text-1); margin-bottom:8px; display:flex; align-items:center; gap:6px;">
        <span>⚖️ Key Decisions & Rationale</span>
      </div>
      <div style="display:flex; flex-direction:column; gap:6px;">
        ${decisions.map(d => `
          <div style="background:var(--bg-secondary); border:1px solid var(--border-subtle); border-radius:var(--radius-sm); padding:8px 10px; font-size:0.76rem;">
            <div style="font-weight:600; color:var(--text-1); margin-bottom:2px;">${escapeHtml(d.decision)}</div>
            <div style="color:var(--text-2); font-size:0.72rem; margin-bottom:2px;"><strong style="color:var(--text-3);">Rationale:</strong> ${escapeHtml(d.rationale)}</div>
            <div style="color:var(--text-3); font-size:0.7rem;">Alternatives: ${escapeHtml(d.alternatives_considered || 'None')} • Outcome: ${escapeHtml(d.outcome || 'Approved')}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
};

