import { CommandDeck } from './app-core.js';

// ── Renderers ──────────────────────────────────────────────────────────────

CommandDeck.prototype.renderOverview = function() {
  const stats = this.state.overview.stats || {};
  const set = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = (val != null ? val : 'N/A');
  };
  set('stat-active-tasks', stats.active_tasks);
  set('stat-critical-tasks', stats.critical_tasks);
  set('stat-reminders', stats.pending_reminders);
  set('stat-today-events', stats.today_events_count);
  set('stat-unread-emails', stats.unread_emails);
  set('stat-intentions', stats.active_intentions);
};

CommandDeck.prototype.renderBriefing = function() {
  const b = this.state.briefing;
  if (b.date) document.getElementById('briefing-date').textContent = b.date;
  if (b.summary) document.getElementById('briefing-summary').textContent = b.summary;
  if (b.prompt_me) document.getElementById('briefing-prompt-text').textContent = `"${b.prompt_me}"`;

  const priList = document.getElementById('briefing-priorities-list');
  if (b.top_priorities && b.top_priorities.length > 0) {
    priList.innerHTML = b.top_priorities.map(p => `
      <li>
        ${escapeHtml(p.title)}
        <span class="badge badge-${p.priority || 'medium'}">${escapeHtml(p.priority)}</span>
        ${p.due_at ? `<span><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> Due ${escapeHtml(p.due_at)}</span>` : ''}
      </li>
    `).join('');
  } else {
    priList.innerHTML = '<li class="empty-hint">No open priorities.</li>';
  }
};

CommandDeck.prototype.refreshAllData = async function() {
  const safe = async (fn) => {
    try {
      if (typeof fn === 'function') await fn();
    } catch (e) {
      console.warn('Fetch error:', e);
    }
  };
  await Promise.all([
    safe(() => this.fetchSystemStats && this.fetchSystemStats()),
    safe(() => this.fetchOverview && this.fetchOverview()),
    safe(() => this.fetchBriefing && this.fetchBriefing()),
    safe(() => this.fetchTasks && this.fetchTasks()),
    safe(() => this.fetchReminders && this.fetchReminders()),
    safe(() => this.fetchProjects && this.fetchProjects()),
    safe(() => this.fetchCalendar && this.fetchCalendar()),
    safe(() => this.fetchEmails && this.fetchEmails()),
    safe(() => this.fetchIntentions && this.fetchIntentions()),
    safe(() => this.fetchTelemetry && this.fetchTelemetry()),
    safe(() => this.fetchServices && this.fetchServices()),
    safe(() => this.fetchMedia && this.fetchMedia()),
    safe(() => this.fetchQueue && this.fetchQueue()),
    safe(() => this.renderDashboardServers && this.renderDashboardServers())
  ]);
};

// ── Dashboard Server Grid ─────────────────────────────────────────────────

CommandDeck.prototype.renderDashboardServers = async function() {
  const grid = document.getElementById('dashboard-server-grid');
  if (!grid) return;

  let sysData = {};
  let services = [];
  try {
    const sysRes = await fetch(`${this.apiBase}/api/system`);
    if (sysRes.ok) sysData = await sysRes.json();
  } catch (e) { /* ignore */ }
  try {
    const svcRes = await fetch(`${this.apiBase}/api/services`);
    if (svcRes.ok) services = await svcRes.json();
  } catch (e) { /* ignore */ }

  const svcList = Array.isArray(services) ? services : Object.values(services || {});
  const hostname = window.location.hostname || 'localhost';

  grid.innerHTML = `
    <div class="server-card">
      <div class="server-card__header">
        <div class="server-card__name">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
          <span>${escapeHtml(hostname)}</span>
          <span class="server-card__ip">Main</span>
        </div>
        <span class="server-card__status online">● Online</span>
      </div>
      <div class="server-card__body">
        <div class="server-card__services">
          ${svcList.length > 0 ? svcList.map(s => `<span class="service-pill service-pill--${s.health === 'healthy' ? 'online' : 'offline'}"><span class="service-pill__dot"></span>${escapeHtml(s.name)}</span>`).join('') : '<span class="service-pill"><span class="service-pill__dot"></span>No services</span>'}
        </div>
        <div class="gpu-meter">
          <div class="gpu-meter__label">
            <span>CPU</span>
            <span class="gpu-meter__value">${sysData.cpu_percent != null ? sysData.cpu_percent + '%' : 'N/A'}</span>
          </div>
          <div class="gpu-meter__bar">
            <div class="gpu-meter__fill" style="width: ${sysData.cpu_percent || 0}%"></div>
          </div>
        </div>
      </div>
    </div>
  `;
};

CommandDeck.prototype.fetchOverview = async function() {
  try {
    const res = await fetch(`${this.apiBase}/api/overview`);
    if (res.ok) {
      this.state.overview = await res.json();
      this.renderOverview();
    }
  } catch (e) {
    console.warn('Overview fetch error:', e);
  }
};

CommandDeck.prototype.fetchBriefing = async function() {
  try {
    const res = await fetch(`${this.apiBase}/api/briefing`);
    if (res.ok) {
      this.state.briefing = await res.json();
      this.renderBriefing();
    }
  } catch (e) {
    console.warn('Briefing fetch error:', e);
  }
};

CommandDeck.prototype.fetchTasks = async function() {
  try {
    const res = await fetch(`${this.apiBase}/api/tasks`);
    if (res.ok) {
      this.state.tasks = await res.json();
      this.renderTasks();
    }
  } catch (e) {
    console.warn('Tasks fetch error:', e);
  }
};

CommandDeck.prototype.fetchReminders = async function() {
  try {
    const res = await fetch(`${this.apiBase}/api/reminders`);
    if (res.ok) {
      this.state.reminders = await res.json();
      this.renderReminders();
    }
  } catch (e) {
    console.warn('Reminders fetch error:', e);
  }
};

CommandDeck.prototype.fetchProjects = async function() {
  try {
    const res = await fetch(`${this.apiBase}/api/projects`);
    if (res.ok) {
      this.state.projects = await res.json();
      this.renderProjects();
    }
  } catch (e) {
    console.warn('Projects fetch error:', e);
  }
};

CommandDeck.prototype.fetchCalendar = async function() {
  try {
    const res = await fetch(`${this.apiBase}/api/calendar`);
    if (res.ok) {
      this.state.calendarEvents = await res.json();
      this.renderCalendar();
    }
  } catch (e) {
    console.warn('Calendar fetch error:', e);
  }
};

CommandDeck.prototype.fetchEmails = async function() {
  try {
    const res = await fetch(`${this.apiBase}/api/emails`);
    if (res.ok) {
      this.state.emails = await res.json();
      this.renderEmails();
    }
  } catch (e) {
    console.warn('Emails fetch error:', e);
  }
};

CommandDeck.prototype.fetchIntentions = async function() {
  try {
    const res = await fetch(`${this.apiBase}/api/intentions`);
    if (res.ok) {
      this.state.intentions = await res.json();
      this.renderIntentions();
    }
  } catch (e) {
    console.warn('Intentions fetch error:', e);
  }
};

CommandDeck.prototype.fetchTelemetry = async function() {
    try {
      const res = await fetch(`${this.apiBase}/api/telemetry`);
      if (res.ok) {
        this.state.telemetry = await res.json();
        this.renderTelemetry();
      }
    } catch (e) {
      console.warn('Telemetry fetch error:', e);
    }
  };

  // ── Bots / Agents ─────────────────────────────────────────────────────────

  CommandDeck.prototype.fetchBots = async function() {
    try {
      const res = await fetch(`${this.apiBase}/api/bots`);
      if (res.ok) {
        const data = await res.json();
        this.state.bots = data.bots || [];
        this.renderAgentsGrid();
      }
    } catch (e) {
      console.warn('Bots fetch error:', e);
    }
  };

  CommandDeck.prototype.renderAgentsGrid = function() {
    const grid = document.getElementById('agents-grid');
    if (!grid) return;

    if (!this.state.bots || this.state.bots.length === 0) {
      grid.innerHTML = '<div class="empty-state"><div class="empty-state__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><rect x="9" y="9" width="6" height="6"/></svg></div><div class="empty-state__title">No Agents</div><div class="empty-state__desc">No bots configured.</div></div>';
      return;
    }

    grid.innerHTML = this.state.bots.map(bot => {
      const statusClass = bot.status === 'online' ? 'online' : 'offline';
      return `
        <div class="agent-card">
          <div class="agent-card__header">
            <div class="agent-card__avatar">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="24" height="24"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><rect x="9" y="9" width="6" height="6"/></svg>
            </div>
            <div class="agent-card__info">
              <div class="agent-card__name">${escapeHtml(bot.name)}</div>
              <div class="agent-card__model">${escapeHtml(bot.model)} • ${escapeHtml(bot.provider)}</div>
            </div>
            <span class="agent-status-pill ${statusClass}">${escapeHtml(bot.status || 'unknown')}</span>
          </div>
          <div class="agent-card__body">
            <div class="agent-stat-row">
              <span class="agent-stat-label">Role</span>
              <span class="agent-stat-value">${escapeHtml(bot.role || 'N/A')}</span>
            </div>
            <div class="agent-stat-row">
              <span class="agent-stat-label">Last Activity</span>
              <span class="agent-stat-value">${escapeHtml(bot.last_activity || 'Never')}</span>
            </div>
          </div>
        </div>
      `;
    }).join('');
  };

  // ── Home Lab ──────────────────────────────────────────────────────────────

  CommandDeck.prototype.renderHomeLab = async function() {
    const grid = document.getElementById('homelab-server-grid');
    if (!grid) return;

    // Fetch system stats and services
    let sysData = {};
    let services = [];
    try {
      const sysRes = await fetch(`${this.apiBase}/api/system`);
      if (sysRes.ok) sysData = await sysRes.json();
    } catch (e) { /* ignore */ }
    try {
      const svcRes = await fetch(`${this.apiBase}/api/services`);
      if (svcRes.ok) services = await svcRes.json();
    } catch (e) { /* ignore */ }

    const svcList = Array.isArray(services) ? services : Object.values(services || {});
    const hostname = window.location.hostname || 'localhost';

    grid.innerHTML = `
      <div class="server-card">
        <div class="server-card__header">
          <div class="server-card__name">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
            <span>${escapeHtml(hostname)}</span>
            <span class="server-card__ip">Main</span>
          </div>
          <span class="server-card__status online">● Online</span>
        </div>
        <div class="server-card__body">
          <div class="server-card__services" id="homelab-main-services">
            ${svcList.length > 0 ? svcList.map(s => `<span class="service-pill service-pill--${s.health === 'healthy' ? 'online' : 'offline'}"><span class="service-pill__dot"></span>${escapeHtml(s.name)}</span>`).join('') : '<span class="service-pill"><span class="service-pill__dot"></span>No services detected</span>'}
          </div>
          <div class="gpu-meter">
            <div class="gpu-meter__label">
              <span>System Load</span>
              <span class="gpu-meter__value">${sysData.cpu_percent != null ? sysData.cpu_percent + '%' : 'N/A'}</span>
            </div>
            <div class="gpu-meter__bar">
              <div class="gpu-meter__fill" style="width: ${sysData.cpu_percent || 0}%"></div>
            </div>
          </div>
        </div>
      </div>
    `;
  };
