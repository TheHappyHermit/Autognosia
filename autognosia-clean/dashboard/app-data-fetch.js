/**
 * Autognosia // Command Deck — Data Fetching & Rendering
 * All fetch methods and their corresponding render methods.
 */

// ── Utility ──────────────────────────────────────────────────────────────────

function escapeHtml(str) {
  if (str == null) return '';
  const div = document.createElement('div');
  div.textContent = String(str);
  return div.innerHTML;
}

// ── Renderers ────────────────────────────────────────────────────────────────

CommandDeck.prototype.renderEmptyState = function(container, message) {
  if (!container) return;
  const msg = container.dataset.empty_state || container.dataset.emptyState || message || 'No data.';
  container.innerHTML = `
    <div class="empty-state">
      <div class="empty-state__title">${escapeHtml(msg)}</div>
    </div>
  `;
};

CommandDeck.prototype.renderOverview = function() {
  const stats = this.state.overview.stats || {};
  const setStat = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val ?? '--';
  };
  setStat('stat-active-tasks', stats.active_tasks);
  setStat('stat-critical-tasks', stats.critical_tasks);
  setStat('stat-reminders', stats.pending_reminders);
  setStat('stat-today-events', stats.today_events_count);
  setStat('stat-unread-emails', stats.unread_emails);
  setStat('stat-intentions', stats.active_intentions);
};

CommandDeck.prototype.renderBriefing = function() {
  const b = this.state.briefing;
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  if (b.date) set('briefing-date', b.date);
  if (b.summary) set('briefing-summary', b.summary);
  if (b.prompt_me) set('briefing-prompt-text', `"${b.prompt_me}"`);

  const priList = document.getElementById('briefing-priorities-list');
  if (priList) {
    if (b.top_priorities && b.top_priorities.length > 0) {
      priList.innerHTML = b.top_priorities.map(p => `
        <li>
          ${escapeHtml(p.title)}
          <span class="badge badge-${p.priority || 'medium'}">${escapeHtml(p.priority)}</span>
          ${p.due_at ? `<span>⏰ Due ${escapeHtml(p.due_at)}</span>` : ''}
        </li>
      `).join('');
    } else {
      priList.innerHTML = '<li class="empty-hint">No open priorities.</li>';
    }
  }
};

CommandDeck.prototype.renderTelemetry = function() {
  const el = document.getElementById('telemetry-grid');
  if (!el) return;
  const t = this.state.telemetry || {};
  const stats = this.state.overview.stats || {};
  if (!t || Object.keys(t).length === 0) {
    // Fall back to overview stats
    el.innerHTML = `
      <div class="telemetry-item"><span>Active Tasks</span><strong>${stats.active_tasks ?? '--'}</strong></div>
      <div class="telemetry-item"><span>Critical</span><strong>${stats.critical_tasks ?? '--'}</strong></div>
      <div class="telemetry-item"><span>Operations</span><strong>${t.operations_count ?? '--'}</strong></div>
      <div class="telemetry-item"><span>Containers</span><strong>${t.containers_up ?? '--'}/6</strong></div>
    `;
    return;
  }
  el.innerHTML = `
    <div class="telemetry-item"><span>Active Tasks</span><strong>${stats.active_tasks ?? '--'}</strong></div>
    <div class="telemetry-item"><span>Operations</span><strong>${t.operations_count ?? '--'}</strong></div>
    <div class="telemetry-item"><span>Containers</span><strong>${t.containers_up ?? '--'}/6</strong></div>
    <div class="telemetry-item"><span>Intentions</span><strong>${stats.active_intentions ?? '--'}</strong></div>
  `;
};

CommandDeck.prototype.renderAgentStatus = function() {
  const el = document.getElementById('agent-grid');
  if (!el) return;
  const statusEl = document.getElementById('agent-status');
  if (statusEl) {
    statusEl.innerHTML = '<span class="panel-status__dot panel-status__dot--ok"></span><span>Active</span>';
  }
  el.innerHTML = `
    <div class="agent-card">
      <div class="agent-card__name">Hermes</div>
      <div class="agent-card__model">longcat-2.0:free</div>
      <div class="agent-card__stat">Status: <strong>Running</strong></div>
    </div>
    <div class="agent-card">
      <div class="agent-card__name">Coder</div>
      <div class="agent-card__model">qwen3.8-27b</div>
      <div class="agent-card__stat">Status: <strong>Idle</strong></div>
    </div>
    <div class="agent-card">
      <div class="agent-card__name">Researcher</div>
      <div class="agent-card__model">longcat-2.0:free</div>
      <div class="agent-card__stat">Status: <strong>Idle</strong></div>
    </div>
  `;
};

CommandDeck.prototype.renderCronJobs = function() {
  const el = document.getElementById('cron-list');
  if (!el) return;
  const jobs = this.state.cronJobs || [];
  const statusEl = document.getElementById('cron-status');
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
      <span class="cron-job__status ${j.enabled !== false ? 'ok' : 'warn'}">${j.enabled !== false ? 'OK' : 'Disabled'}</span>
    </div>
  `).join('');
};

CommandDeck.prototype.renderProjects = function() {
  const el = document.getElementById('projects-list-container');
  if (!el) return;
  const projects = this.state.projects || [];
  if (projects.length === 0) {
    this.renderEmptyState(el);
    return;
  }
  el.innerHTML = projects.map(p => `
    <div class="project-item">
      <span class="project-item__name">${escapeHtml(p.name)}</span>
      <span class="project-item__tasks">${p.completed_tasks || 0}/${p.total_tasks || 0}</span>
      <span class="project-item__status ${p.status}">${escapeHtml(p.status)}</span>
    </div>
  `).join('');
};

CommandDeck.prototype.renderServiceGrid = function() {
  const el = document.getElementById('dashboard-service-grid');
  if (!el) return;
  const services = this.state.services;
  if (!services || (Array.isArray(services) && services.length === 0) || (!Array.isArray(services) && Object.keys(services).length === 0)) {
    this.renderEmptyState(el);
    return;
  }
  const svcList = Array.isArray(services) ? services : Object.values(services);
  el.innerHTML = svcList.slice(0, 9).map(s => `
    <div class="service-cell">
      <span class="service-cell__name">${escapeHtml(s.name || 'Unknown')}</span>
      <span class="service-cell__status ${s.health === 'healthy' ? 'online' : 'offline'}">${s.health === 'healthy' ? 'online' : 'offline'}</span>
    </div>
  `).join('');
};

CommandDeck.prototype.renderGraphifyStatus = function() {
  const el = document.getElementById('graphify-grid');
  if (!el) return;
  this.renderEmptyState(el, 'Graph data will appear here after the first wiki extraction run.');
};

CommandDeck.prototype.renderEmails = function() {
  const el = document.getElementById('email-stream-container');
  if (!el) return;
  const emails = this.state.emails || [];
  if (emails.length === 0) {
    this.renderEmptyState(el);
    return;
  }
  el.innerHTML = emails.slice(0, 5).map(e => `
    <div class="email-item ${e.read ? 'read' : 'unread'}">
      <span class="email-item__from">${escapeHtml(e.from || 'Unknown')}</span>
      <span class="email-item__subject">${escapeHtml(e.subject || '(no subject)')}</span>
      <span class="email-item__priority ${e.priority || 'normal'}">${escapeHtml(e.priority || '')}</span>
    </div>
  `).join('');
};

CommandDeck.prototype.renderIntentions = function() {
  const el = document.getElementById('intentions-stream-container');
  if (!el) return;
  const intentions = this.state.intentions || [];
  if (intentions.length === 0) {
    this.renderEmptyState(el);
    return;
  }
  el.innerHTML = intentions.slice(0, 5).map(i => `
    <div class="intention-item">
      <span class="intention-item__title">${escapeHtml(i.title)}</span>
      <span class="intention-item__status">${escapeHtml(i.status)}</span>
    </div>
  `).join('');
};


CommandDeck.prototype.renderReminders = function() {
  const el = document.getElementById('intentions-stream-container');
  if (!el) return;
  const reminders = this.state.reminders || [];
  if (reminders.length === 0) {
    this.renderEmptyState(el);
    return;
  }
  el.innerHTML = reminders.slice(0, 5).map(r => `
    <div class="intention-item">
      <span class="intention-item__title">${escapeHtml(r.title)}</span>
      <span class="intention-item__status">${escapeHtml(r.status)}</span>
    </div>
  `).join('');
};

CommandDeck.prototype.renderDashboardCalendar = function() {
  const el = document.getElementById('dashboard-calendar-stage');
  if (!el) return;
  const events = this.state.calendarEvents || [];
  const today = new Date().toISOString().split('T')[0];
  const todayEvents = events.filter(e => (e.start || '').startsWith(today));
  if (todayEvents.length === 0) {
    this.renderEmptyState(el);
    return;
  }
  el.innerHTML = todayEvents.slice(0, 3).map(e => {
    const isAllDay = !e.start.includes('T');
    const timeStr = isAllDay ? 'All day' : (e.start.split('T')[1]?.slice(0,5) || '');
    return `
    <div class="calendar-event-item calendar-event-item--compact">
      <span class="calendar-event-item__time">${timeStr}</span>
      <span class="calendar-event-item__title">${escapeHtml(e.title || 'Untitled')}</span>
    </div>
  `;}).join('');
};

CommandDeck.prototype.renderHomelab = function() {
  const servers = [
    { id: 'server-main', ip: '10.1.1.10' },
    { id: 'server-agent', ip: '10.1.1.37' },
    { id: 'server-agent-zero', ip: '10.1.1.18' }
  ];
  servers.forEach(s => {
    const statusEl = document.getElementById(`${s.id}-status`);
    if (statusEl) {
      statusEl.className = 'server-card__status online';
      statusEl.textContent = '● Online';
    }
  });
};

// ── Data Fetching ────────────────────────────────────────────────────────────

CommandDeck.prototype.fetchSystemStats = async function() {
  try {
    const res = await fetch(`${this.apiBase}/api/system`);
    if (res.ok) {
      const data = await res.json();
      const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val ?? '--'; };
      set('stat-cpu', data.cpu_percent);
      set('stat-ram', data.ram_percent);
      set('stat-disk', data.disk_percent);
      set('stat-network', data.network_mbps);
      set('stat-gpu', data.gpu_percent ?? '--');
      set('stat-uptime', data.uptime_days);
    }
  } catch (e) {
    console.warn('System stats fetch error:', e);
  }
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
      this.renderDashboardCalendar();
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

CommandDeck.prototype.fetchServices = async function() {
  try {
    const res = await fetch(`${this.apiBase}/api/services`);
    if (res.ok) {
      this.state.services = await res.json();
      this.renderServices();
      this.renderServiceGrid();
    }
  } catch (e) {
    console.warn('Services fetch error:', e);
  }
};

CommandDeck.prototype.fetchMedia = async function() {
  try {
    const res = await fetch(`${this.apiBase}/api/media/active`);
    if (res.ok) {
      const streams = await res.json();
      this.renderMediaGrid(streams);
    }
  } catch (e) {
    console.warn('Media fetch error:', e);
  }
};

CommandDeck.prototype.fetchQueue = async function() {
  try {
    const res = await fetch(`${this.apiBase}/api/queue`);
    if (res.ok) {
      const queue = await res.json();
      this.renderQueue(queue);
    }
  } catch (e) {
    console.warn('Queue fetch error:', e);
  }
};

CommandDeck.prototype.fetchHomelab = async function() {
  try {
    const res = await fetch(`${this.apiBase}/api/homelab`);
    if (res.ok) {
      this.state.homelab = await res.json();
      this.renderHomelab();
    }
  } catch (e) {
    console.warn('Homelab fetch error:', e);
  }
};

CommandDeck.prototype.refreshAllData = async function() {
  await Promise.all([
    this.fetchSystemStats(),
    this.fetchOverview(),
    this.fetchBriefing(),
    this.fetchTasks(),
    this.fetchReminders(),
    this.fetchProjects(),
    this.fetchCalendar(),
    this.fetchEmails(),
    this.fetchIntentions(),
    this.fetchTelemetry(),
    this.fetchServices(),
    this.fetchMedia(),
    this.fetchQueue()
  ]);
  // Render agent-dependent views
  this.renderAgentStatus();
  this.renderCronJobs();
  this.renderProjects();
  this.renderServiceGrid();
  this.renderGraphifyStatus();
};
