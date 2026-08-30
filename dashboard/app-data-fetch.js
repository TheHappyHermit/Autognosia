import { CommandDeck } from './app-core.js';

// ── Status Strip State Machine ───────────────────────────────────────────
const STATUS_STRIP = {
  mode: 'loading', // loading | healthy | warning | critical
  lastMode: 'loading',
  holdCount: 0,
  holdThreshold: 3,
  staleTimer: null,
  lastDataTime: null,
  issues: [],
  metrics: { cpu: null, ram: null, disk: null, network: null, agents: null, uptime: null },
  tasksDue: 0,
  emailSync: true,
};

function deriveStatusMode(metrics, tasksDue, emailSync) {
  const issues = [];
  let maxSeverity = 'healthy';

  const warn = (metric, value, label) => {
    issues.push({ severity: 'warning', label: `${label} ${value}%`, metric });
    maxSeverity = 'warning';
  };
  const crit = (metric, value, label) => {
    issues.push({ severity: 'critical', label: `${label} ${value}%`, metric });
    maxSeverity = 'critical';
  };

  if (metrics.cpu != null) {
    if (metrics.cpu >= 90) crit('cpu', metrics.cpu, 'CPU');
    else if (metrics.cpu >= 75) warn('cpu', metrics.cpu, 'CPU');
  }
  if (metrics.ram != null) {
    if (metrics.ram >= 90) crit('ram', metrics.ram, 'RAM');
    else if (metrics.ram >= 80) warn('ram', metrics.ram, 'RAM');
  }
  if (metrics.disk != null) {
    if (metrics.disk >= 90) crit('disk', metrics.disk, 'Disk');
    else if (metrics.disk >= 80) warn('disk', metrics.disk, 'Disk');
  }
  if (!emailSync) {
    issues.push({ severity: 'warning', label: 'Email sync failed', metric: 'email' });
    if (maxSeverity === 'healthy') maxSeverity = 'warning';
  }

  return { mode: maxSeverity, issues };
}

function updateStatusStrip() {
  const strip = document.getElementById('status-strip');
  const text = document.getElementById('status-strip-text');
  const dot = strip?.querySelector('.status-strip__dot');
  if (!strip || !text || !dot) return;

  // Clear stale timer
  if (STATUS_STRIP.staleTimer) {
    clearTimeout(STATUS_STRIP.staleTimer);
    STATUS_STRIP.staleTimer = null;
  }

  // Derive new mode
  const { mode, issues } = deriveStatusMode(
    STATUS_STRIP.metrics,
    STATUS_STRIP.tasksDue,
    STATUS_STRIP.emailSync
  );

  // Hysteresis: require 3 consecutive samples to escalate
  if (mode !== STATUS_STRIP.mode) {
    STATUS_STRIP.holdCount++;
    if (STATUS_STRIP.holdCount >= STATUS_STRIP.holdThreshold || mode === 'healthy') {
      STATUS_STRIP.mode = mode;
      STATUS_STRIP.issues = issues;
      STATUS_STRIP.holdCount = 0;
    }
  } else {
    STATUS_STRIP.holdCount = 0;
    STATUS_STRIP.issues = issues;
  }

  // Update dot color
  dot.className = 'status-strip__dot status-dot';
  if (STATUS_STRIP.mode === 'healthy') dot.classList.add('status-dot--ok');
  else if (STATUS_STRIP.mode === 'warning') dot.classList.add('status-dot--warn');
  else if (STATUS_STRIP.mode === 'critical') dot.classList.add('status-dot--error');

  // Build text
  const cpu = STATUS_STRIP.metrics.cpu != null ? `${STATUS_STRIP.metrics.cpu}%` : '--%';
  const ram = STATUS_STRIP.metrics.ram != null ? `${STATUS_STRIP.metrics.ram}%` : '--%';
  const tasks = STATUS_STRIP.tasksDue > 0 ? `${STATUS_STRIP.tasksDue} tasks due today` : '0 tasks due today';

  let html;
  if (STATUS_STRIP.mode === 'healthy') {
    html = `All systems healthy · CPU ${cpu} · RAM ${ram} · ${tasks}`;
  } else if (STATUS_STRIP.mode === 'warning') {
    const topIssues = STATUS_STRIP.issues.filter(i => i.severity === 'warning').slice(0, 2);
    html = `⚠️ ${STATUS_STRIP.issues.length} issue${STATUS_STRIP.issues.length > 1 ? 's' : ''} — ${topIssues.map(i => i.label).join(' · ')}`;
  } else {
    const topIssues = STATUS_STRIP.issues.filter(i => i.severity === 'critical').slice(0, 2);
    const more = STATUS_STRIP.issues.length > 2 ? ` <a href="#" data-view="system">+${STATUS_STRIP.issues.length - 2} more</a>` : '';
    html = `▲ ${STATUS_STRIP.issues.length} issue${STATUS_STRIP.issues.length > 1 ? 's' : ''} — ${topIssues.map(i => `<a href="#" data-view="system">${i.label}</a>`).join(' · ')}${more}`;
  }

  text.innerHTML = html;

  // Bind issue links
  text.querySelectorAll('a[data-view]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const view = link.dataset.view;
      if (window.commandDeck) window.commandDeck.showView(view);
    });
  });

  // Stale detection: if no data for 15s, append stale warning
  STATUS_STRIP.lastDataTime = Date.now();
  STATUS_STRIP.staleTimer = setTimeout(() => {
    const staleEl = document.getElementById('status-strip-text');
    if (staleEl && !staleEl.textContent.includes('stale')) {
      const now = new Date();
      const hh = now.getHours().toString().padStart(2, '0');
      const mm = now.getMinutes().toString().padStart(2, '0');
      staleEl.innerHTML += ` <span style="color:var(--text-3)">· stale ${hh}:${mm}</span>`;
    }
  }, 15000);
}

// ── Renderers ──────────────────────────────────────────────────────────────

CommandDeck.prototype.renderOverview = function() {
  const stats = this.state.overview.stats || {};
  STATUS_STRIP.tasksDue = stats.active_tasks ?? 0;
  STATUS_STRIP.emailSync = stats.email_sync !== false;
  updateStatusStrip();
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
      STATUS_STRIP.metrics = {
        cpu: data.cpu_percent ?? null,
        ram: data.ram_percent ?? null,
        disk: data.disk_percent ?? null,
        network: data.network_mbps ?? null,
        agents: data.active_agents ?? null,
        uptime: data.uptime_days ?? null,
      };
      updateStatusStrip();
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
