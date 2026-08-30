/**
 * Autognosia // Command Deck Frontend Controller (v2.5)
 * Reactive state, dynamic calendar views, task pipeline, email triage,
 * prospective intentions, second brain search, and cognitive telemetry.
 */

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Expose globally
window.showToast = showToast;
function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function strToDateStr(str) {
  if (!str) return '';
  return str.split('T')[0];
}

function formatTime(isoStr) {
  if (!isoStr || !isoStr.includes('T')) return '';
  const time = isoStr.split('T')[1];
  return time.substring(0, 5);
}

function getCategoryBadge(cat) {
  if (cat === 'meeting') return 'badge-cyan';
  if (cat === 'task_deadline') return 'badge-amber';
  if (cat === 'subscription') return 'badge-purple';
  return 'badge-medium';
}

class CommandDeck {
  constructor() {
    this.apiBase = window.location.origin;
    this.currentDate = new Date();
    this.selectedCalendarView = 'day'; // 'day' | 'week' | 'month'
    this.calFilter = 'all';
    this.taskFilter = 'all';
    this.remFilter = 'all';
    this.autoRefreshInterval = 30000;
    this.refreshTimer = null;

    this.state = {
      overview: {},
      briefing: {},
      tasks: [],
      reminders: [],
      projects: [],
      calendarEvents: [],
      emails: [],
      intentions: [],
      telemetry: {}
    };

    this.init();
  }

  async init() {
    this.bindEvents();
    this.startClock();
    await this.refreshAllData();
    this.setupAutoRefresh();
    this.initCollapsiblePanels();
    this.initKeyboardShortcuts();
    this.initViewRouting();
  }

  initViewRouting() {
    // Sidebar link clicks
    document.querySelectorAll('.sidebar-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const view = link.dataset.view;
        this.showView(view);
      });
    });

    // Hamburger menu (mobile)
    const hamburger = document.getElementById('hamburger-btn');
    if (hamburger) {
      hamburger.addEventListener('click', () => {
        document.querySelector('.sidebar')?.classList.toggle('open');
      });
    }
  }

  showView(viewName) {
    // Update sidebar active state
    document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
    const link = document.querySelector(`.sidebar-link[data-view="${viewName}"]`);
    if (link) link.classList.add('active');

    // Show/hide sections
    document.querySelectorAll('.view-section').forEach(s => s.style.display = 'none');
    const target = document.getElementById(`view-${viewName}`);
    if (target) {
      target.style.display = 'block';
    }

    // For dashboard view, show the main content
    if (viewName === 'dashboard') {
      document.querySelector('.content-area').style.display = 'block';
    } else {
      document.querySelector('.content-area').style.display = 'none';
    }

    // Initialize view-specific content
    if (viewName === 'system') {
      // Re-fetch system data to ensure panels are populated
      this.fetchTelemetry();
      this.fetchServices();
      this.fetchCronJobs();
      this.fetchProjects();
      this.fetchGraphifyStatus();
    }
    if (viewName === 'bots' && window.botsPage) {
      window.botsPage.init();
    }
  }

  // ── Data Fetching ─────────────────────────────────────────────────────────────

  async fetchSystemStats() {
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
  }

  async fetchOverview() {
    try {
      const res = await fetch(`${this.apiBase}/api/overview`);
      if (res.ok) {
        this.state.overview = await res.json();
        this.renderOverview();
      }
    } catch (e) {
      console.warn('Overview fetch error:', e);
    }
  }

  async fetchBriefing() {
    try {
      const res = await fetch(`${this.apiBase}/api/briefing`);
      if (res.ok) {
        this.state.briefing = await res.json();
        this.renderBriefing();
      }
    } catch (e) {
      console.warn('Briefing fetch error:', e);
    }
  }

  async fetchTasks() {
    try {
      const res = await fetch(`${this.apiBase}/api/tasks`);
      if (res.ok) {
        this.state.tasks = await res.json();
        this.renderTasks();
      }
    } catch (e) {
      console.warn('Tasks fetch error:', e);
    }
  }

  async fetchProjects() {
    try {
      const res = await fetch(`${this.apiBase}/api/projects`);
      if (res.ok) {
        this.state.projects = await res.json();
        this.renderProjects();
      }
    } catch (e) {
      console.warn('Projects fetch error:', e);
    }
  }

  async fetchCalendar() {
    try {
      const res = await fetch(`${this.apiBase}/api/calendar`);
      if (res.ok) {
        this.state.calendarEvents = await res.json();
        this.renderCalendar();
      }
    } catch (e) {
      console.warn('Calendar fetch error:', e);
    }
  }

  async fetchEmails() {
    try {
      const res = await fetch(`${this.apiBase}/api/emails`);
      if (res.ok) {
        this.state.emails = await res.json();
        this.renderEmails();
      }
    } catch (e) {
      console.warn('Emails fetch error:', e);
    }
  }

  async fetchIntentions() {
    try {
      const res = await fetch(`${this.apiBase}/api/intentions`);
      if (res.ok) {
        this.state.intentions = await res.json();
        this.renderIntentions();
      }
    } catch (e) {
      console.warn('Intentions fetch error:', e);
    }
  }

  async fetchReminders() {
    try {
      const res = await fetch(`${this.apiBase}/api/reminders`);
      if (res.ok) {
        this.state.reminders = await res.json();
        this.renderReminders();
      }
    } catch (e) {
      console.warn('Reminders fetch error:', e);
    }
  }

  async fetchTelemetry() {
    try {
      const res = await fetch(`${this.apiBase}/api/telemetry`);
      if (res.ok) {
        this.state.telemetry = await res.json();
        this.renderTelemetry();
      }
    } catch (e) {
      console.warn('Telemetry fetch error:', e);
    }
  }

  async fetchServices() {
    try {
      const res = await fetch(`${this.apiBase}/api/services`);
      if (res.ok) {
        const services = await res.json();
        this.renderServiceGrid(services);
        this.updateServiceStatus(services);
      }
    } catch (e) {
      console.warn('Service fetch error:', e);
    }
  }

  async fetchMedia() {
    try {
      const res = await fetch(`${this.apiBase}/api/media/active`);
      if (res.ok) {
        const streams = await res.json();
        this.renderMediaGrid(streams);
      }
    } catch (e) {
      console.warn('Media fetch error:', e);
    }
  }

  async fetchQueue() {
    try {
      const res = await fetch(`${this.apiBase}/api/queue`);
      if (res.ok) {
        const queue = await res.json();
        this.renderQueue(queue);
      }
    } catch (e) {
      console.warn('Queue fetch error:', e);
    }
  }

  async fetchAgentStatus() {
    try {
      const res = await fetch(`${this.apiBase}/api/agent`);
      if (res.ok) {
        this.state.agentStatus = await res.json();
        this.renderAgentStatus();
      }
    } catch (e) {
      console.warn('Agent status fetch error:', e);
    }
  }

  async fetchCronJobs() {
    try {
      const res = await fetch(`${this.apiBase}/api/cron`);
      if (res.ok) {
        this.state.cronJobs = await res.json();
        this.renderCronJobs();
      }
    } catch (e) {
      console.warn('Cron jobs fetch error:', e);
    }
  }

  async fetchGraphifyStatus() {
    try {
      const res = await fetch(`${this.apiBase}/api/graphify`);
      if (res.ok) {
        this.state.graphifyStatus = await res.json();
        this.renderGraphifyStatus();
      }
    } catch (e) {
      console.warn('Graphify fetch error:', e);
    }
  }

  async fetchHermesStatus() {
    try {
      const res = await fetch(`${this.apiBase}/api/hermes`);
      if (res.ok) {
        this.state.hermesStatus = await res.json();
        this.renderHermesStatus();
      }
    } catch (e) {
      console.warn('Hermes status fetch error:', e);
    }
  }

  async refreshAllData() {
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
      this.fetchQueue(),
      this.fetchAgentStatus(),
      this.fetchCronJobs(),
      this.fetchGraphifyStatus(),
      this.fetchHermesStatus(),
    ]);
  }

  // ── Startup ───────────────────────────────────────────────────────────────────

  startClock() {
    const clockEl = document.getElementById('hud-clock');
    if (clockEl) {
      setInterval(() => {
        const now = new Date();
        clockEl.querySelector('.clock-time').textContent = now.toLocaleTimeString('en-US', { hour12: false });
      }, 1000);
    }
  }

  setupAutoRefresh() {
    if (this.refreshTimer) clearInterval(this.refreshTimer);
    if (this.autoRefreshInterval > 0) {
      this.refreshTimer = setInterval(() => this.refreshAllData(), this.autoRefreshInterval);
    }
  }

  // ── Event Bindings ─────────────────────────────────────────────────────────
  bindEvents() {
    try {
      // Refresh rate selector
      const refreshSelect = document.getElementById('auto-refresh-rate');
      if (refreshSelect) refreshSelect.addEventListener('change', (e) => {
        this.autoRefreshInterval = parseInt(e.target.value, 10);
        this.setupAutoRefresh();
        this.initCollapsiblePanels();
        this.initKeyboardShortcuts();
      });

      // Calendar View Toggles
      document.querySelectorAll('.view-tab').forEach(btn => {
        btn.addEventListener('click', (e) => {
          document.querySelectorAll('.view-tab').forEach(b => b.classList.remove('active'));
          e.target.classList.add('active');
          this.selectedCalendarView = e.target.dataset.view;
          this.renderCalendar();
        });
      });

      // Calendar Navigation
      const calPrev = document.getElementById('cal-prev');
      const calNext = document.getElementById('cal-next');
      const calToday = document.getElementById('cal-today');
      if (calPrev) calPrev.addEventListener('click', () => this.navigateCalendar(-1));
      if (calNext) calNext.addEventListener('click', () => this.navigateCalendar(1));
      if (calToday) calToday.addEventListener('click', () => {
        this.currentDate = new Date();
        this.renderCalendar();
      });

      // Calendar Filter Chips
      document.querySelectorAll('.filter-chip').forEach(chip => {
        chip.addEventListener('click', (e) => {
          document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
          e.target.classList.add('active');
          this.calFilter = e.target.dataset.calFilter;
          this.renderCalendar();
        });
      });

      // Task Filter Pills
      document.querySelectorAll('.task-filter-pill').forEach(pill => {
        pill.addEventListener('click', (e) => {
          document.querySelectorAll('.task-filter-pill').forEach(p => p.classList.remove('active'));
          e.target.classList.add('active');
          this.taskFilter = e.target.dataset.taskFilter;
          this.renderTasks();
        });
      });

      // Quick Task Add Input
      const quickInput = document.getElementById('quick-task-input');
      const quickBtn = document.getElementById('btn-quick-task-add');
      if (quickInput && quickBtn) {
        const handleQuickAdd = async () => {
          const val = quickInput.value.trim();
          if (!val) return;
          await this.createTask({ title: val, priority: 'medium', status: 'next' });
          quickInput.value = '';
          await this.fetchTasks();
          await this.fetchOverview();
        };
        quickBtn.addEventListener('click', handleQuickAdd);
        quickInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') handleQuickAdd();
        });
      }

      // Quick Reminder Add Input
      const quickRemInput = document.getElementById('quick-reminder-input');
      const quickRemBtn = document.getElementById('btn-quick-rem-add');
      if (quickRemInput && quickRemBtn) {
        const handleQuickRemAdd = async () => {
          const val = quickRemInput.value.trim();
          if (!val) return;
          await this.createReminder({ title: val, offset_minutes: 15, channel: 'all' });
          quickRemInput.value = '';
          await this.fetchReminders();
          await this.fetchOverview();
        };
        quickRemBtn.addEventListener('click', handleQuickRemAdd);
        quickRemInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') handleQuickRemAdd();
        });
      }

      // Reminder Filters
      document.querySelectorAll('.rem-filter-pill').forEach(pill => {
        pill.addEventListener('click', (e) => {
          document.querySelectorAll('.rem-filter-pill').forEach(p => p.classList.remove('active'));
          e.target.classList.add('active');
          this.remFilter = e.target.dataset.remFilter;
          this.renderReminders();
        });
      });

      // Wiki Search (in-content)
      const searchInput = document.getElementById('wiki-search-input');
      if (searchInput) {
        searchInput.addEventListener('input', (e) => {
          const q = e.target.value.trim();
          if (q.length < 2) return;
          this.searchWiki(q);
        });
      }

      // Global Search (⌘K) — header search triggers Knowledge Vault
      const globalSearch = document.getElementById('global-search');
      if (globalSearch) {
        globalSearch.addEventListener('input', (e) => {
          const q = e.target.value.trim();
          if (q.length < 2) return;
          this.searchWiki(q);
        });
        globalSearch.addEventListener('keydown', (e) => {
          if (e.key === 'Escape') {
            globalSearch.value = '';
            globalSearch.blur();
          }
        });
      }

      // Command Palette Trigger
      const paletteTrigger = document.getElementById('btn-palette-trigger');
      if (paletteTrigger) {
        paletteTrigger.addEventListener('click', () => {
          document.getElementById('command-palette')?.showModal();
        });
      }

      // Service Refresh
      const serviceRefresh = document.getElementById('btn-service-refresh');
      if (serviceRefresh) {
        serviceRefresh.addEventListener('click', () => this.fetchServices());
      }

      // Clock
      const clockEl = document.getElementById('hud-clock');
      if (clockEl) {
        setInterval(() => {
          const now = new Date();
          clockEl.querySelector('.clock-time').textContent = now.toLocaleTimeString('en-US', { hour12: false });
        }, 1000);
      }

      // Keyboard shortcuts
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          document.getElementById('command-palette')?.close();
          this.closeTaskDetailModal();
        }
        if (e.ctrlKey && e.key === 'k') {
          e.preventDefault();
          document.getElementById('command-palette')?.showModal();
        }
      });
      
      // Task detail modal events
      const modalClose = document.getElementById('task-detail-close');
      const modalCancel = document.getElementById('task-detail-cancel');
      const modalSave = document.getElementById('task-detail-save');
      const modalBackdrop = document.getElementById('task-detail-backdrop');
      
      if (modalClose) modalClose.addEventListener('click', () => this.closeTaskDetailModal());
      if (modalCancel) modalCancel.addEventListener('click', () => this.closeTaskDetailModal());
      if (modalSave) modalSave.addEventListener('click', () => this.saveTaskDetail());
      if (modalBackdrop) modalBackdrop.addEventListener('click', () => this.closeTaskDetailModal());

    } catch (e) {
      console.warn('Event binding error:', e);
    }
  }


  // ── Renderers ──────────────────────────────────────────────────────────────

  renderOverview() {
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
  }

  renderBriefing() {
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
  }

  // ── Calendar Rendering & Views (Day, Week, Month) ──────────────────────────
  navigateCalendar(delta) {
    if (this.selectedCalendarView === 'day') {
      this.currentDate.setDate(this.currentDate.getDate() + delta);
    } else if (this.selectedCalendarView === 'week') {
      this.currentDate.setDate(this.currentDate.getDate() + (delta * 7));
    } else if (this.selectedCalendarView === 'month') {
      this.currentDate.setMonth(this.currentDate.getMonth() + delta);
    }
    this.renderCalendar();
  }

  renderCalendar() {
    const stage = document.getElementById('calendar-stage');
    if (!stage) return;
    const heading = document.getElementById('cal-heading');
    
    let events = this.state.calendarEvents;
    if (this.calFilter === 'meeting') events = events.filter(e => e.category === 'meeting' || e.type === 'calendar');
    else if (this.calFilter === 'task') events = events.filter(e => e.type === 'task' || e.category === 'task_deadline');
    else if (this.calFilter === 'subscription') events = events.filter(e => e.type === 'renewal' || e.category === 'subscription');

    if (events.length === 0) {
      stage.innerHTML = '<div class="empty-state"><div class="empty-state__icon">📅</div><div class="empty-state__title">No events today</div><div class="empty-state__desc">Your schedule is clear.</div></div>';
      return;
    }

    if (heading) heading.textContent = this.currentDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    
    stage.innerHTML = events.slice(0, 5).map(e => {
      const date = e.start?.includes('T') 
        ? new Date(e.start).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        : e.start;
      const icon = e.type === 'renewal' ? '🔄' : e.type === 'important_date' ? '📌' : '⏰';
      return `
        <div class="calendar-event" style="border-left-color: ${e.color || 'var(--accent)'}">
          <div style="display:flex; justify-content:space-between; align-items:start;">
            <div>
              <strong>${escapeHtml(e.title)}</strong>
              <div style="font-size:11px; color:var(--text-3);">${escapeHtml(date)}</div>
            </div>
            <span class="badge ${e.priority === 'critical' ? 'badge-danger' : e.priority === 'high' ? 'badge-warn' : 'badge-medium'}">${escapeHtml(e.priority || e.category)}</span>
          </div>
          ${e.notes ? `<div style="font-size:11px; color:var(--text-secondary); margin-top:var(--space-1);">${escapeHtml(e.notes)}</div>` : ''}
        </div>`;
    }).join('');
    
    if (events.length > 5) {
      stage.innerHTML += `<div style="font-size:11px; color:var(--text-3); text-align:center; padding:var(--space-2);">${events.length - 5} more events</div>`;
    }
  }

  renderDayView(stage, heading, events) {
    const dateStr = this.currentDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    const isoDate = this.currentDate.toISOString().split('T')[0];
    heading.textContent = dateStr;

    const dayEvents = events.filter(e => strToDateStr(e.start) === isoDate);

    let html = '<div class="day-timeline">';
    const hours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

    hours.forEach(hr => {
      const hrFormatted = (hr < 10 ? '0' : '') + hr + ':00';
      const slotEvents = dayEvents.filter(e => {
        if (e.all_day && hr === 9) return true;
        const timePart = (e.start.includes('T') ? e.start.split('T')[1] : '');
        return timePart.startsWith(hrFormatted.substring(0, 2));
      });

      html += `
        <div class="day-time-slot">
          <span class="time-label">${hrFormatted}</span>
          <div class="time-slot-content">
            ${slotEvents.map(e => `
              <div class="event-card" style="border-left-color: ${e.color || 'var(--accent-cyan)'}">
                <div class="event-title">${escapeHtml(e.title)}</div>
                <div class="event-meta">
                  <span>${e.all_day ? 'ALL DAY' : formatTime(e.start)}</span>
                  <span>•</span>
                  <span class="badge ${getCategoryBadge(e.category)}">${e.category}</span>
                  ${e.location ? `<span>📍 ${escapeHtml(e.location)}</span>` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    });

    html += '</div>';
    stage.innerHTML = html;
  }

  renderWeekView(stage, heading, events) {
    const startOfWeek = new Date(this.currentDate);
    startOfWeek.setDate(this.currentDate.getDate() - this.currentDate.getDay());
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    heading.textContent = `${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

    let html = '<div style="display:grid; grid-template-columns: repeat(7, 1fr); gap:6px; height:100%;">';
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      const iso = day.toISOString().split('T')[0];
      const isToday = iso === new Date().toISOString().split('T')[0];
      const dayEvs = events.filter(e => strToDateStr(e.start) === iso);

      html += `
        <div class="month-cell ${isToday ? 'today' : ''}" style="min-height: 180px;">
          <div class="month-date-num">${day.toLocaleDateString('en-US', { weekday: 'short' })} ${day.getDate()}</div>
          <div style="display:flex; flex-direction:column; gap:3px; margin-top:4px;">
            ${dayEvs.map(e => `
              <div class="month-event-pill" style="border-left-color: ${e.color || 'var(--accent-cyan)'}">
                ${escapeHtml(e.title)}
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }
    
    html += '</div>';
    stage.innerHTML = html;
  }

  renderMonthView(stage, heading, events) {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    heading.textContent = this.currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    let html = '<div class="month-calendar-grid">';
    const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    dayNames.forEach(d => html += `<div class="month-day-head">${d}</div>`);

    // Blanks for preceding days
    for (let b = 0; b < firstDay; b++) {
      html += `<div class="month-cell other-month"></div>`;
    }

    // Days of current month
    for (let d = 1; d <= daysInMonth; d++) {
      const curIso = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isToday = curIso === new Date().toISOString().split('T')[0];
      const dayEvs = events.filter(e => strToDateStr(e.start) === curIso);

      html += `
        <div class="month-cell ${isToday ? 'today' : ''}">
          <div class="month-date-num">${d}</div>
          ${dayEvs.map(e => `
            <div class="month-event-pill" style="border-left-color: ${e.color || 'var(--accent-cyan)'}">
              ${escapeHtml(e.title)}
            </div>
          `).join('')}
        </div>
      `;
    }
    
    html += '</div>';
    stage.innerHTML = html;
  }

  // ── Tasks & Organizer ──────────────────────────────────────────────────────
  renderTasks() {
    const container = document.getElementById('task-list-container');
    const waitingContainer = document.getElementById('waiting-list-container');
    if (!container) return;
    
    let filtered = this.state.tasks;
    if (this.taskFilter === 'critical') filtered = filtered.filter(t => t.priority === 'critical' && t.status !== 'completed');
    else if (this.taskFilter === 'next') filtered = filtered.filter(t => t.status === 'next');
    else if (this.taskFilter === 'in_progress') filtered = filtered.filter(t => t.status === 'in_progress');
    else if (this.taskFilter === 'completed') filtered = filtered.filter(t => t.status === 'completed');
    else if (this.taskFilter === 'all') filtered = filtered.filter(t => t.status !== 'completed');

    if (filtered.length === 0) {
      container.innerHTML = '<div class="empty-hint">No tasks in this view. Use quick add above to create one!</div>';
    } else {
      container.innerHTML = filtered.map(t => this.renderTaskCard(t)).join('');
    }

    // Waiting / Blocked tab
    const waitingTasks = this.state.tasks.filter(t => t.status === 'waiting' || t.status === 'blocked');
    if (waitingContainer) {
      if (waitingTasks.length === 0) {
        waitingContainer.innerHTML = '<div class="empty-hint">No blocked or waiting tasks. Pipeline is clear!</div>';
      } else {
        waitingContainer.innerHTML = waitingTasks.map(t => this.renderTaskCard(t)).join('');
      }
    }

    // Bind checkboxes and task card clicks
    container.querySelectorAll('.task-checkbox').forEach(cb => {
      cb.addEventListener('change', async (e) => {
        e.stopPropagation();
        const id = e.target.dataset.taskId;
        const newStatus = e.target.checked ? 'completed' : 'next';
        await this.updateTask(id, { status: newStatus });
        await this.fetchTasks();
        await this.fetchOverview();
      });
    });
    
    container.querySelectorAll('.task-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.task-checkbox')) return;
        const taskId = card.dataset.taskId;
        const task = this.state.tasks.find(t => t.id == taskId);
        if (task) this.renderTaskDetailModal(task);
      });
    });
  }

  renderTaskCard(t) {
    const isDone = t.status === 'completed';
    return `
      <div class="task-card ${isDone ? 'completed' : ''}" data-task-id="${t.id}">
        <input type="checkbox" class="task-checkbox" data-task-id="${t.id}" aria-label="Mark ${escapeHtml(t.title)} as ${isDone ? 'active' : 'completed'}" ${isDone ? 'checked' : ''} />
        <div class="task-details">
          <div class="task-title-line">
            <span class="task-title">${escapeHtml(t.title)}</span>
            <span class="badge badge-${t.priority || 'medium'}">${t.priority}</span>
          </div>
          <div class="task-meta-row">
            ${t.project_name ? `<span>📁 ${escapeHtml(t.project_name)}</span><span>•</span>` : ''}
            ${t.due_at ? `<span>⏰ Due ${escapeHtml(t.due_at)}</span><span>•</span>` : ''}
            <span>Status: ${t.status}</span>
          </div>
        </div>
      </div>
    `;
  }

  // ── Task Detail Modal ─────────────────────────────────────────────────────
  renderTaskDetailModal(task) {
    const modal = document.getElementById('task-detail-modal');
    if (!modal) return;
    
    const body = document.getElementById('task-detail-body');
    if (!body) return;
    
    body.innerHTML = `
      <div class="task-detail-field">
        <label>Title</label>
        <input type="text" id="task-detail-title" value="${escapeHtml(task.title)}" />
      </div>
      <div class="task-detail-field">
        <label>Description</label>
        <textarea id="task-detail-description" rows="3">${escapeHtml(task.description || '')}</textarea>
      </div>
      <div class="task-detail-field">
        <label>Notes</label>
        <textarea id="task-detail-notes" rows="6" placeholder="Add notes, steps, references...">${escapeHtml(task.notes || '')}</textarea>
      </div>
      <div class="task-detail-row">
        <div class="task-detail-field">
          <label>Status</label>
          <select id="task-detail-status">
            <option value="active" ${task.status === 'active' ? 'selected' : ''}>Active</option>
            <option value="next" ${task.status === 'next' ? 'selected' : ''}>Next</option>
            <option value="in_progress" ${task.status === 'in_progress' ? 'selected' : ''}>In Progress</option>
            <option value="blocked" ${task.status === 'blocked' ? 'selected' : ''}>Blocked</option>
            <option value="waiting" ${task.status === 'waiting' ? 'selected' : ''}>Waiting</option>
            <option value="completed" ${task.status === 'completed' ? 'selected' : ''}>Completed</option>
            <option value="cancelled" ${task.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
          </select>
        </div>
        <div class="task-detail-field">
          <label>Priority</label>
          <select id="task-detail-priority">
            <option value="critical" ${task.priority === 'critical' ? 'selected' : ''}>Critical</option>
            <option value="high" ${task.priority === 'high' ? 'selected' : ''}>High</option>
            <option value="medium" ${task.priority === 'medium' ? 'selected' : ''}>Medium</option>
            <option value="low" ${task.priority === 'low' ? 'selected' : ''}>Low</option>
          </select>
        </div>
      </div>
      <div class="task-detail-field">
        <label>Due Date</label>
        <input type="datetime-local" id="task-detail-due" value="${task.due_at ? task.due_at.slice(0, 16) : ''}" />
      </div>
      <div class="task-detail-meta">
        ${task.project_name ? `<span>📁 ${escapeHtml(task.project_name)}</span>` : ''}
        <span>Created: ${escapeHtml(task.created_at || 'Unknown')}</span>
      </div>
    `;
    
    modal.classList.add('open');
    modal.dataset.taskId = task.id;
  }
  
  closeTaskDetailModal() {
    const modal = document.getElementById('task-detail-modal');
    if (modal) {
      modal.classList.remove('open');
      modal.dataset.taskId = '';
    }
  }
  
  async saveTaskDetail() {
    const modal = document.getElementById('task-detail-modal');
    if (!modal) return;
    const taskId = modal.dataset.taskId;
    if (!taskId) return;
    
    const payload = {
      title: document.getElementById('task-detail-title')?.value || '',
      description: document.getElementById('task-detail-description')?.value || '',
      notes: document.getElementById('task-detail-notes')?.value || '',
      status: document.getElementById('task-detail-status')?.value || 'active',
      priority: document.getElementById('task-detail-priority')?.value || 'medium',
    };
    
    const dueEl = document.getElementById('task-detail-due');
    if (dueEl?.value) {
      payload.due_at = new Date(dueEl.value).toISOString();
    }
    
    await this.updateTask(taskId, payload);
    this.closeTaskDetailModal();
    await this.fetchTasks();
    await this.fetchOverview();
  }

  // ── Reminders ──────────────────────────────────────────────────────────────
  renderReminders() {
    const container = document.getElementById('reminders-list-container');
    if (!container) return;

    let filtered = this.state.reminders || [];
    if (this.remFilter === 'pending') filtered = filtered.filter(r => r.status === 'pending');
    else if (this.remFilter === 'snoozed') filtered = filtered.filter(r => r.status === 'snoozed');
    else if (this.remFilter === 'sent') filtered = filtered.filter(r => r.status === 'sent');

    if (filtered.length === 0) {
      container.innerHTML = '<div class="empty-hint">No reminders matching this filter. Use the bar above or chat with Hermes to set one!</div>';
      return;
    }

    container.innerHTML = filtered.map(r => this.renderReminderCard(r)).join('');

    // Bind action buttons
    container.querySelectorAll('.btn-snooze-5m').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.target.dataset.remId;
        await this.snoozeReminder(id, 5);
        await this.fetchReminders();
        await this.fetchOverview();
      });
    });

    container.querySelectorAll('.btn-snooze-15m').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.target.dataset.remId;
        await this.snoozeReminder(id, 15);
        await this.fetchReminders();
        await this.fetchOverview();
      });
    });

    container.querySelectorAll('.btn-snooze-1h').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.target.dataset.remId;
        await this.snoozeReminder(id, 60);
        await this.fetchReminders();
        await this.fetchOverview();
      });
    });

    container.querySelectorAll('.btn-dismiss-rem').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.target.dataset.remId;
        await this.dismissReminder(id);
        await this.fetchReminders();
        await this.fetchOverview();
      });
    });
  }

  renderReminderCard(r) {
    const channel = r.channel || 'all';
    const channelLabels = {
      all: '⚡ All Channels',
      telegram: '📱 Telegram',
      discord: '💬 Discord',
      email: '📧 Email',
      sms: '📞 Phone/SMS',
      desktop: '🖥️ Desktop'
    };

    return `
      <div class="reminder-card ${r.status}" data-rem-id="${r.id}">
        <div class="reminder-top-row">
          <span class="reminder-title">${escapeHtml(r.title)}</span>
          <span class="badge ${r.status === 'sent' ? 'badge-completed' : r.status === 'snoozed' ? 'badge-medium' : 'badge-cyan'}">${r.status.toUpperCase()}</span>
        </div>
        ${r.notes ? `<div style="font-size:11px; color:var(--text-secondary);">${escapeHtml(r.notes)}</div>` : ''}
        <div class="reminder-meta-row">
          <div class="reminder-tags">
            <span class="channel-tag ${channel}">${channelLabels[channel] || channel}</span>
            <span>⏰ ${formatTime(r.remind_at) || r.remind_at}</span>
          </div>
          <div class="reminder-actions">
            ${r.status !== 'sent' ? `
              <button class="btn-rem-action btn-snooze-5m" data-rem-id="${r.id}">+5m</button>
              <button class="btn-rem-action btn-snooze-15m" data-rem-id="${r.id}">+15m</button>
              <button class="btn-rem-action btn-snooze-1h" data-rem-id="${r.id}">+1h</button>
              <button class="btn-rem-action btn-dismiss-rem" data-rem-id="${r.id}">Dismiss</button>
            ` : `
              <button class="btn-rem-action btn-snooze-15m" data-rem-id="${r.id}">Reset +15m</button>
            `}
          </div>
        </div>
      </div>
    `;
  }

  renderProjects() {
    const container = document.getElementById('projects-list-container');
    if (!container) return;
    if (this.state.projects.length === 0) {
      container.innerHTML = '<div class="empty-hint">No active projects configured.</div>';
      return;
    }

    container.innerHTML = this.state.projects.map(p => {
      const total = p.total_tasks || 0;
      const completed = p.completed_tasks || 0;
      const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

      return `
        <div class="project-card">
          <div class="project-name">${escapeHtml(p.name)}</div>
          <div style="font-size:10px; color:var(--text-muted);">${escapeHtml(p.description || '')}</div>
          <div style="display:flex; justify-content:space-between; font-family:var(--font-mono); font-size:10px; color:var(--text-secondary);">
            <span>Progress</span>
            <span>${pct}% (${completed}/${total})</span>
          </div>
          <div class="progress-bar-container">
            <div class="progress-bar-fill" style="width: ${pct}%"></div>
          </div>
        </div>
      `;
    }).join('');
  }

  // ── Emails & Communications ────────────────────────────────────────────────
  renderEmails() {
    const container = document.getElementById('email-stream-container');
    if (!container) return;
    const badge = document.getElementById('email-unread-badge');
    const unreadCount = this.state.emails.filter(e => !e.read).length;
    if (badge) badge.textContent = `${unreadCount} Pending Action`;

    if (this.state.emails.length === 0) {
      container.innerHTML = '<div class="empty-hint">No triaged communications in inbox.</div>';
      return;
    }

    container.innerHTML = this.state.emails.map(em => `
      <div class="email-card ${em.read ? 'read' : ''}" data-email-id="${em.id}">
        <div class="email-head">
          <span class="email-sender">${escapeHtml(em.sender.split('<')[0])}</span>
          <span class="email-time">${escapeHtml(em.timestamp)}</span>
        </div>
        <div class="email-subject">${escapeHtml(em.subject)}</div>
        <div style="font-size:11px; color:var(--text-secondary);">${escapeHtml(em.summary)}</div>
        ${em.extracted_action_items && em.extracted_action_items.length > 0 ? `
          <div class="email-action-box">
            ${em.extracted_action_items.map(a => `<div>▸ <strong>Action:</strong> ${escapeHtml(a.task)} (Due: ${escapeHtml(a.due)})</div>`).join('')}
          </div>
        ` : ''}
      </div>
    `).join('');
  }

  // ── Prospective Intentions ─────────────────────────────────────────────────
  renderIntentions() {
    const container = document.getElementById('intentions-stream-container');
    if (!container) return;
    if (this.state.intentions.length === 0) {
      container.innerHTML = '<div class="empty-state"><div class="empty-state__icon">⏱</div><div class="empty-state__title">No active intentions</div><div class="empty-state__desc">Prospective memory is quiet.</div></div>';
      return;
    }

    container.innerHTML = this.state.intentions.map(i => `
      <div class="intention-card">
        <div class="intention-cue"><strong>IF:</strong> ${escapeHtml(i.cue)}</div>
        <div class="intention-action"><strong>THEN:</strong> ${escapeHtml(i.action)}</div>
      </div>
    `).join('');
  }

  // ── Telemetry Drawer ───────────────────────────────────────────────────────
  renderTelemetry() {
    const t = this.state.telemetry;
    const body = document.getElementById('telemetry-grid') || document.getElementById('telemetry-body');
    if (!body) return;

    let html = '';

    // Docker services
    html += `
      <div class="telemetry-block">
        <h4>CONTAINER SERVICES (DOCKER)</h4>
        ${t.containers && t.containers.length > 0 ? t.containers.map(c => `
          <div>✓ <strong>${escapeHtml(c.name)}</strong>: ${escapeHtml(c.status)}</div>
        `).join('') : '<div style="color:var(--text-muted);">No Docker containers currently active.</div>'}
      </div>
    `;

    // Profiles
    html += `
      <div class="telemetry-block">
        <h4>COGNITIVE PROFILES (6)</h4>
        ${t.profiles ? Object.entries(t.profiles).map(([prof, stat]) => `
          <div>• <strong>${prof}</strong>: <span style="color:var(--accent-emerald)">${stat}</span></div>
        `).join('') : ''}
      </div>
    `;

    // Databases
    html += `
      <div class="telemetry-block">
        <h4>DETERMINISTIC STORAGE</h4>
        ${t.databases ? Object.entries(t.databases).map(([db, sz]) => `
          <div>• <strong>${db}</strong>: ${sz}</div>
        `).join('') : ''}
      </div>
    `;

    body.innerHTML = html;
  }

  // ── Phase 2: Service Grid, Media & Queue ──────────────────────────────────

  getServiceIcon(name) {
    const icons = {
      'Jellyfin': '🎬',
      'Plex': '🎥',
      'Sonarr': '📺',
      'Radarr': '🎞️',
      'qBittorrent': '⬇️',
      'Traefik': '🚦',
      'Uptime Kuma': '📊',
      'Grafana': '📈',
      'Prometheus': '⚡',
      'FreshRSS': '📰',
      'Home Assistant': '🏠',
    };
    return icons[name] || '⚙️';
  }

  formatSize(bytes) {
    if (!bytes) return '';
    const gb = bytes / (1024 * 1024 * 1024);
    return gb >= 1 ? `${gb.toFixed(1)} GB` : `${(bytes / (1024 * 1024)).toFixed(0)} MB`;
  }

  async fetchServices() {
    try {
      const res = await fetch(`${this.apiBase}/api/services`);
      if (res.ok) {
        const services = await res.json();
        this.renderServiceGrid(services);
        this.updateServiceStatus(services);
      }
    } catch (e) {
      console.warn('Service fetch error:', e);
    }
  }

  renderServiceGrid(services) {
    const grid = document.getElementById('service-grid');
    if (!grid) return;

    grid.innerHTML = Object.values(services).map(svc => {
      const badgeHtml = svc.details?.queue_count
        ? `<div class="service-card__queue" aria-label="${svc.details.queue_count} pending">${svc.details.queue_count} pending</div>`
        : '';
      const metricHtml = svc.details?.sessions
        ? `<div class="service-card__metric"><span class="metric-label">Sessions</span><span class="metric-val">${svc.details.sessions}</span></div>`
        : '';
      return `
        <div class="service-card" data-service="${svc.name.toLowerCase()}"
             data-status="${svc.health}" tabindex="0" role="listitem"
             aria-label="${svc.name}: ${svc.health}">
          ${badgeHtml}
          <div class="service-card__header">
            <span class="service-card__icon" aria-hidden="true">${this.getServiceIcon(svc.name)}</span>
            <span class="service-card__status status-dot status-dot--${svc.health}" aria-label="${svc.health}"></span>
          </div>
          <div class="service-card__body">
            <h3 class="service-card__name">${svc.name}</h3>
            <span class="service-card__port">:${svc.port}</span>
            ${metricHtml}
          </div>
        </div>`;
    }).join('');
  }

  updateServiceStatus(services) {
    const statusEl = document.getElementById('services-status');
    if (!statusEl) return;

    const healthy = Object.values(services).filter(s => s.health === 'healthy').length;
    const unhealthy = Object.values(services).filter(s => s.health !== 'healthy').length;

    if (healthy === Object.keys(services).length) {
      statusEl.innerHTML = '<span class="panel-status__dot panel-status__dot--ok" aria-hidden="true"></span><span>All services healthy</span>';
    } else {
      statusEl.innerHTML = `<span class="panel-status__dot panel-status__dot--warn" aria-hidden="true"></span><span>${healthy} up, ${unhealthy} down</span>`;
    }

    // Update freshness stamp
    const freshEl = document.getElementById('services-freshness-text');
    if (freshEl) freshEl.textContent = 'updated just now';
    const freshEl2 = document.getElementById('services-freshness');
    if (freshEl2) {
      freshEl2.classList.remove('is-stale');
      const dot = freshEl2.querySelector('.panel-freshness__dot');
      if (dot) dot.className = 'panel-freshness__dot panel-freshness__dot--fresh';
    }
  }

  async fetchMedia() {
    try {
      const res = await fetch(`${this.apiBase}/api/media/active`);
      if (res.ok) {
        const streams = await res.json();
        this.renderMediaGrid(streams);
      }
    } catch (e) {
      console.warn('Media fetch error:', e);
    }
  }

  renderMediaGrid(streams) {
    const grid = document.getElementById('media-grid');
    if (!grid) return;

    const countEl = document.getElementById('media-count');
    if (countEl) countEl.textContent = `${streams.length} active stream${streams.length !== 1 ? 's' : ''}`;

    if (streams.length === 0) {
      grid.innerHTML = '<div class="media-placeholder">No active streams</div>';
      return;
    }

    grid.innerHTML = streams.map(s => {
      const progress = s.total ? (s.progress / s.total) * 100 : 0;
      return `
        <div class="media-card">
          <div class="media-card__info">
            <span class="media-card__service">${s.service}</span>
            <h3 class="media-card__title">${s.title || 'Unknown'}</h3>
            <span class="media-card__user">${s.user || '?'} on ${s.device || 'unknown'}</span>
          </div>
          <div class="media-card__progress">
            <div class="media-card__progress-bar" style="width: ${progress}%"></div>
          </div>
        </div>`;
    }).join('');
  }

  async fetchQueue() {
    try {
      const res = await fetch(`${this.apiBase}/api/queue`);
      if (res.ok) {
        const queue = await res.json();
        this.renderQueue(queue);
      }
    } catch (e) {
      console.warn('Queue fetch error:', e);
    }
  }

  renderQueue(queue) {
    const list = document.getElementById('queue-list');
    if (!list) return;

    const countEl = document.getElementById('queue-count');
    if (countEl) countEl.textContent = `${queue.length} pending`;

    if (queue.length === 0) {
      list.innerHTML = '<div class="queue-placeholder">Queue is empty</div>';
      return;
    }

    list.innerHTML = queue.map(item => `
      <div class="queue-item" data-service="${item.service}">
        <span class="queue-item__service queue-badge queue-badge--${item.service.toLowerCase()}">${item.service}</span>
        <span class="queue-item__title">${item.title}</span>
        <span class="queue-item__size">${this.formatSize(item.size)}</span>
      </div>
    `).join('');
  }

  // ── Task, Reminder & Intention CRUD Operations ────────────────────────────
  async createTask(data) {
    await fetch(`${this.apiBase}/api/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  }

  async updateTask(id, data) {
    await fetch(`${this.apiBase}/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  }

  async createReminder(data) {
    await fetch(`${this.apiBase}/api/reminders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  }

  async snoozeReminder(remId, minutes = 10) {
    await fetch(`${this.apiBase}/api/reminders/${remId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'snooze', snooze_minutes: minutes })
    });
  }

  async dismissReminder(remId) {
    await fetch(`${this.apiBase}/api/reminders/${remId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'sent' })
    });
  }

  async createIntention(data) {
    await fetch(`${this.apiBase}/api/intentions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  }

  // ── Hermes AI Copilot Chat ────────────────────────────────────────────────
  async sendChatMessage(text) {
    const container = document.getElementById('chat-messages-container');
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // 1. Append User Bubble
    const userMsgEl = document.createElement('div');
    userMsgEl.className = 'chat-msg user';
    userMsgEl.innerHTML = `
      <div class="msg-author">YOU</div>
      <div class="msg-bubble">${escapeHtml(text)}</div>
      <div class="msg-time">${nowStr}</div>
    `;
    container.appendChild(userMsgEl);
    container.scrollTop = container.scrollHeight;

    // 2. Append Typing Indicator
    const typingEl = document.createElement('div');
    typingEl.className = 'chat-msg bot';
    typingEl.id = 'chat-typing-indicator';
    typingEl.innerHTML = `
      <div class="msg-author">Autognosia Copilot</div>
      <div class="msg-bubble" style="color:var(--text-muted); font-style:italic;">Processing cognitive instruction...</div>
    `;
    container.appendChild(typingEl);
    container.scrollTop = container.scrollHeight;

    // 3. Send API Request
    try {
      const res = await fetch(`${this.apiBase}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });

      typingEl.remove();

      if (res.ok) {
        const data = await res.json();
        const botMsgEl = document.createElement('div');
        botMsgEl.className = 'chat-msg bot';
        
        // Render simple markdown formatted reply
        let formattedReply = escapeHtml(data.reply)
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.*?)\*/g, '<em>$1</em>')
          .replace(/`([^`]+)`/g, '<code style="background:rgba(0,0,0,0.3); padding:2px 4px; border-radius:3px; font-family:var(--font-mono);">$1</code>')
          .replace(/\n/g, '<br>');

        botMsgEl.innerHTML = `
          <div class="msg-author">Autognosia Copilot</div>
          <div class="msg-bubble">${formattedReply}</div>
          <div class="msg-time">${nowStr}</div>
        `;
        container.appendChild(botMsgEl);
        container.scrollTop = container.scrollHeight;

        // Auto-refresh dashboard data if action was taken
        if (data.refresh_needed) {
          await this.refreshAllData();
        }
      } else {
        const errEl = document.createElement('div');
        errEl.className = 'chat-msg bot';
        errEl.innerHTML = `
          <div class="msg-author">Autognosia Copilot</div>
          <div class="msg-bubble" style="color:var(--accent-rose);">Error connecting to Hermes agent.</div>
        `;
        container.appendChild(errEl);
      }
    } catch (e) {
      if (typingEl) typingEl.remove();
      const errEl = document.createElement('div');
      errEl.className = 'chat-msg bot';
      errEl.innerHTML = `
        <div class="msg-author">Autognosia Copilot</div>
        <div class="msg-bubble" style="color:var(--accent-rose);">Network error communicating with dashboard server.</div>
      `;
      container.appendChild(errEl);
    }
  }

  // ── Modals ─────────────────────────────────────────────────────────────────
  openCreateModal(defaultType = 'task') {
    const select = document.getElementById('create-type');
    select.value = defaultType;
    document.getElementById('fields-task').style.display = defaultType === 'task' ? 'block' : 'none';
    document.getElementById('fields-intention').style.display = defaultType === 'task' ? 'none' : 'block';
    document.getElementById('modal-create-item').classList.add('open');
  }

  closeCreateModal() {
    document.getElementById('modal-create-item').classList.remove('open');
    document.getElementById('form-create-item').reset();
  }

  // ── Phase 3: Agent Intelligence ──────────────────────────────────────────────

  async fetchAgentStatus() {
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
  }

  async fetchCronJobs() {
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
  }

  async fetchGraphifyStatus() {
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
  }

  async fetchHermesStatus() {
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
  }

  renderAgentStatus() {
    const data = this.state.agentStatus || {};
    const grid = document.getElementById('agent-grid');
    if (!grid) return;

    const status = data.gateway_running ? 'ok' : 'warn';
    const statusEl = document.getElementById('agent-status');
    if (statusEl) {
      statusEl.innerHTML = `
        <span class="panel-status__dot panel-status__dot--${status}" aria-hidden="true"></span>
        <span>${data.gateway_running ? 'Running' : 'Offline'}</span>
      `;
    }

    grid.innerHTML = `
      <div class="agent-stat">
        <span class="agent-stat__label">Gateway</span>
        <span class="agent-stat__value ${data.gateway_running ? 'ok' : 'danger'}">
          ${data.gateway_running ? '✓ Active' : '✗ Offline'}
        </span>
      </div>
      <div class="agent-stat">
        <span class="agent-stat__label">Agent</span>
        <span class="agent-stat__value ${data.agent_running ? 'ok' : 'warn'}">
          ${data.agent_running ? '✓ Running' : '✗ Idle'}
        </span>
      </div>
      <div class="agent-stat">
        <span class="agent-stat__label">Cron Jobs</span>
        <span class="agent-stat__value">${data.cron_jobs || 0}</span>
      </div>
      <div class="agent-stat">
        <span class="agent-stat__label">Memory Files</span>
        <span class="agent-stat__value">${data.memory_files || 0}</span>
      </div>
    `;
  }

  renderHermesStatus() {
    const data = this.state.hermesStatus || {};
    const statusEl = document.getElementById('agent-status');
    if (statusEl) {
      const count = (data.processes || []).length;
      statusEl.innerHTML = `
        <span class="panel-status__dot panel-status__dot--ok" aria-hidden="true"></span>
        <span>${count} process(es)</span>
      `;
    }
  }

  renderGraphifyStatus() {
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
        <span class="graphify-stat__value">${data.brain_dir ? '✓' : '✗'}</span>
      </div>
    `;
  }

  renderCronJobs() {
    const data = this.state.cronJobs || {};
    const list = document.getElementById('cron-list');
    if (!list) return;

    const statusEl = document.getElementById('cron-status');
    if (statusEl) {
      const count = data.total || 0;
      statusEl.innerHTML = `
        <span class="panel-status__dot panel-status__dot--info" aria-hidden="true"></span>
        <span>${count} job(s)</span>
      `;
    }

    if (!data.jobs || data.jobs.length === 0) {
      list.innerHTML = '<div class="empty-hint">No scheduled jobs configured.</div>';
      return;
    }

    list.innerHTML = data.jobs.map(job => `
      <div class="cron-item">
        <div>
          <div class="cron-item__name">${escapeHtml(job.name || 'Untitled')}</div>
          <div class="cron-item__schedule">${escapeHtml(job.schedule || 'Unknown')}</div>
        </div>
        <span class="badge ${job.enabled ? 'badge--ok' : 'badge--danger'}">
          ${job.enabled ? 'Active' : 'Disabled'}
        </span>
      </div>
    `).join('');
  }

  // ── Phase 4: Collapsible Panels ──────────────────────────────────────────────

  initCollapsiblePanels() {
    document.querySelectorAll('.collapsible-panel .panel-header').forEach(header => {
      header.addEventListener('click', (e) => {
        // Don't collapse if clicking on action buttons
        if (e.target.closest('.panel-actions') || e.target.closest('button')) return;
        
        const panel = header.closest('.collapsible-panel');
        const isCollapsed = panel.dataset.collapsed === 'true';
        panel.dataset.collapsed = !isCollapsed;
      });
    });
  }

  // ── Phase 4: Improved Search with Highlighting ──────────────────────────────

  highlightSearchTerm(text, term) {
    if (!term) return escapeHtml(text);
    const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return escapeHtml(text).replace(regex, '<mark class="search-highlight">$1</mark>');
  }

  async searchWiki(query) {
    if (!query || query.length < 2) return;
    
    const container = document.getElementById('wiki-results-container');
    container.innerHTML = '<div class="empty-hint">Searching...</div>';
    
    try {
      const res = await fetch(`${this.apiBase}/api/wiki/search?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const results = await res.json();
        this.renderWikiResults(results, query);
      }
    } catch (e) {
      console.warn('Wiki search error:', e);
      container.innerHTML = '<div class="empty-hint">Search failed. Please try again.</div>';
    }
  }

  renderWikiResults(results, query) {
    const container = document.getElementById('wiki-results-container');
    const flyout = document.getElementById('global-search-results');
    const globalSearch = document.getElementById('global-search');

    // Render in-flyout if ⌘K is active
    if (flyout && globalSearch && document.activeElement === globalSearch) {
      if (results.length === 0) {
        flyout.innerHTML = `<div class="global-search-empty">No results for "${escapeHtml(query)}"</div>`;
      } else {
        flyout.innerHTML = results.map((r, i) => `
          <div class="global-search-item" role="option" aria-selected="${i === 0}" data-wiki-path="${escapeHtml(r.path)}">
            <div class="global-search-item__icon"><svg class="header-icon-sm"><use href="#icon-search"/></svg></div>
            <div class="global-search-item__body">
              <div class="global-search-item__title">${this.highlightSearchTerm(r.title, query)}</div>
              <div class="global-search-item__tier">${escapeHtml(r.tier)}</div>
            </div>
          </div>
        `).join('');
      }
      flyout.hidden = false;
      if (globalSearch) globalSearch.setAttribute('aria-expanded', 'true');

      // Click handler
      flyout.querySelectorAll('.global-search-item').forEach(item => {
        item.addEventListener('click', () => {
          const path = item.dataset.wikiPath;
          if (path && window.commandDeck) window.commandDeck.navigateToWiki(path);
        });
      });
      return;
    }

    if (!container) return;

    if (results.length === 0) {
      container.innerHTML = `<div class="empty-hint">No results found for "${escapeHtml(query)}"</div>`;
      return;
    }

    const countEl = `<div class="search-results-count">${results.length} result(s)</div>`;
    const items = results.map(r => `
      <div class="wiki-result-card" data-wiki-path="${escapeHtml(r.path)}">
        <div class="wiki-result-header">
          <span class="wiki-result-title">${this.highlightSearchTerm(r.title, query)}</span>
          <span class="badge badge-cyan">${escapeHtml(r.tier)}</span>
        </div>
        <div class="wiki-res-snippet">${this.highlightSearchTerm(r.snippet, query)}</div>
      </div>
    `).join('');
    container.innerHTML = countEl + items;
  }

  // ── Phase 4: Toast Notifications ─────────────────────────────────────────────

  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // ── Phase 4: Keyboard Shortcuts ──────────────────────────────────────────────

  navigateToWiki(path) {
    // Navigate to a wiki page — open in a drawer or new tab
    const flyout = document.getElementById('global-search-results');
    const globalSearch = document.getElementById('global-search');
    if (flyout) flyout.hidden = true;
    if (globalSearch) {
      globalSearch.value = '';
      globalSearch.setAttribute('aria-expanded', 'false');
    }
    // Open page in new tab for now
    window.open(`/wiki/page?path=${encodeURIComponent(path)}`, '_blank');
  }

  // ── Phase 4: Keyboard Shortcuts ──────────────────────────────────────────────

  initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Don't trigger shortcuts when typing in inputs
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      switch(e.key.toLowerCase()) {
        case 'c':
          // Toggle chat drawer
          document.getElementById('chat-drawer')?.classList.toggle('open');
          break;
        case 't':
          // Toggle telemetry drawer
          document.getElementById('telemetry-drawer')?.classList.toggle('open');
          break;
        case 'n':
          // Open create modal
          this.openCreateModal('task');
          break;
        case 'k':
          // Open Knowledge Vault search (Ctrl+K or Cmd+K)
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            const search = document.getElementById('global-search');
            if (search) search.focus();
          }
          break;
        case '/':
          // Focus wiki search
          e.preventDefault();
          document.getElementById('wiki-search-input')?.focus();
          break;
      }
    });
  }
}

// Bootstrap application on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.commandDeck = new CommandDeck();
});
