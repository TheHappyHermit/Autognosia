/**
 * Autognosia // Command Deck — Agent Intelligence
 * Fetches and renders agent status, cron jobs, graphify.
 */

CommandDeck.prototype.fetchAgentStatus = async function() {
  try {
    const res = await fetch(`${this.apiBase}/api/agent`);
    if (res.ok) {
      this.state.agentStatus = await res.json();
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
      this.state.cronJobs = await res.json();
      this.renderCronJobs();
    }
  } catch (e) {
    console.warn('Cron jobs fetch error:', e);
  }
};

CommandDeck.prototype.fetchGraphifyStatus = async function() {
  try {
    const res = await fetch(`${this.apiBase}/api/graphify`);
    if (res.ok) {
      this.state.graphifyStatus = await res.json();
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
      this.state.hermesStatus = await res.json();
      this.renderHermesStatus();
    }
  } catch (e) {
    console.warn('Hermes status fetch error:', e);
  }
};

CommandDeck.prototype.renderAgentStatus = function() {
  const el = document.getElementById('agent-grid');
  if (!el) return;
  const statusEl = document.getElementById('agent-status');
  const data = this.state.agentStatus || {};

  if (statusEl) {
    const status = data.gateway_running ? 'ok' : 'warn';
    statusEl.innerHTML = `<span class="panel-status__dot panel-status__dot--${status}"></span><span>${data.gateway_running ? 'Running' : 'Offline'}</span>`;
  }

  el.innerHTML = `
    <div class="agent-card">
      <div class="agent-card__name">Hermes</div>
      <div class="agent-card__model">longcat-2.0:free</div>
      <div class="agent-card__stat">Status: <strong>${data.gateway_running ? 'Running' : 'Idle'}</strong></div>
    </div>
    <div class="agent-card">
      <div class="agent-card__name">Coder</div>
      <div class="agent-card__model">qwen3.8-27b</div>
      <div class="agent-card__stat">Status: <strong>${data.agent_running ? 'Active' : 'Idle'}</strong></div>
    </div>
    <div class="agent-card">
      <div class="agent-card__name">Researcher</div>
      <div class="agent-card__model">longcat-2.0:free</div>
      <div class="agent-card__stat">Status: <strong>Idle</strong></div>
    </div>
  `;
};

CommandDeck.prototype.renderHermesStatus = function() {
  const el = document.getElementById('agent-grid');
  if (!el) return;
  const data = this.state.hermesStatus || {};
  const processes = data.processes || [];
  if (processes.length === 0) {
    el.innerHTML = '<div class="empty-hint">No Hermes processes.</div>';
    return;
  }
  el.innerHTML = processes.map(p => `
    <div class="agent-card">
      <div class="agent-card__name">${escapeHtml(p.name || 'Unknown')}</div>
      <div class="agent-card__model">${escapeHtml(p.model || '')}</div>
      <div class="agent-card__stat">Status: <strong>${escapeHtml(p.status || 'idle')}</strong></div>
    </div>
  `).join('');
};

CommandDeck.prototype.renderCronJobs = function() {
  const el = document.getElementById('cron-list');
  if (!el) return;
  const statusEl = document.getElementById('cron-status');
  const jobs = this.state.cronJobs || [];

  if (statusEl) {
    statusEl.innerHTML = `<span class="panel-status__dot panel-status__dot--ok"></span><span>${jobs.length} jobs</span>`;
  }

  if (jobs.length === 0) {
    el.innerHTML = '<div class="empty-hint">No scheduled jobs.</div>';
    return;
  }

  el.innerHTML = jobs.slice(0, 6).map(j => `
    <div class="cron-job">
      <span class="cron-job__name">${escapeHtml(j.name || 'Unknown')}</span>
      <span class="cron-job__schedule">${escapeHtml(j.schedule || '')}</span>
      <span class="cron-job__status ${j.status === 'ok' ? 'ok' : 'warn'}">${escapeHtml(j.status || 'unknown')}</span>
    </div>
  `).join('');
};

CommandDeck.prototype.renderGraphifyStatus = function() {
  const el = document.getElementById('graphify-grid');
  if (!el) return;
  const data = this.state.graphifyStatus || {};
  if (!data || Object.keys(data).length === 0) {
    this.renderEmptyState(el, 'Graph data will appear here after the first wiki extraction run.');
    return;
  }
  el.innerHTML = `
    <div class="agent-card">
      <div class="agent-card__name">Graphify</div>
      <div class="agent-card__model">${escapeHtml(data.status || 'unknown')}</div>
      <div class="agent-card__stat">Nodes: <strong>${data.node_count || 0}</strong></div>
    </div>
  `;
};
