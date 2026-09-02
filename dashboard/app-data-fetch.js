import { CommandDeck } from './app-core.js';

// ── Renderers ──────────────────────────────────────────────────────────────

CommandDeck.prototype.renderOverview = function() {
  const stats = this.state.overview.stats || {};
  document.getElementById('stat-active-tasks').textContent = stats.active_tasks ?? '--';
  document.getElementById('stat-critical-tasks').textContent = stats.critical_tasks ?? '0';
  const remStatEl = document.getElementById('stat-reminders');
  if (remStatEl) remStatEl.textContent = stats.pending_reminders ?? '0';
  document.getElementById('stat-today-events').textContent = stats.today_events_count ?? '0';
  document.getElementById('stat-unread-emails').textContent = stats.unread_emails ?? '0';
  document.getElementById('stat-intentions').textContent = stats.active_intentions ?? '0';
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
        ${p.due_at ? `<span>⏰ Due ${escapeHtml(p.due_at)}</span>` : ''}
      </li>
    `).join('');
  } else {
    priList.innerHTML = '<li class="empty-hint">No open priorities.</li>';
  }
};

// ── Data Fetching ──────────────────────────────────────────────────────────

CommandDeck.prototype.fetchSystemStats = async function() {
  try {
    const res = await fetch(`${this.apiBase}/api/system`);
    if (res.ok) {
      const data = await res.json();
      document.getElementById('stat-cpu').textContent = data.cpu_percent ?? '--';
      document.getElementById('stat-ram').textContent = data.ram_percent ?? '--';
      document.getElementById('stat-disk').textContent = data.disk_percent ?? '--';
      document.getElementById('stat-network').textContent = data.network_mbps ?? '--';
      document.getElementById('stat-agents').textContent = data.active_agents ?? '--';
      document.getElementById('stat-uptime').textContent = data.uptime_days ?? '--';
    }
  } catch (e) {
    console.warn('System stats fetch error:', e);
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
