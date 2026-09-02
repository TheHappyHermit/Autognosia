/**
 * Autognosia // Command Deck — Core Controller
 * State management, view routing, event bindings, data fetching.
 */
export function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export class CommandDeck {
  constructor() {
    this.apiBase = window.location.origin;
    this.currentDate = new Date();
    this.selectedCalendarView = 'day';
    this.calFilter = 'all';
    this.taskFilter = 'all';
    this.remFilter = 'all';
    this.autoRefreshInterval = 60000;
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
    document.querySelectorAll('.sidebar-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const view = link.dataset.view;
        this.showView(view);
      });
    });

    const hamburger = document.getElementById('hamburger-btn');
    if (hamburger) {
      hamburger.addEventListener('click', () => {
        document.querySelector('.sidebar')?.classList.toggle('open');
      });
    }

    // Sidebar collapse toggle
    const sidebarToggle = document.getElementById('sidebar-toggle');
    if (sidebarToggle) {
      sidebarToggle.addEventListener('click', () => {
        const sidebar = document.getElementById('main-sidebar');
        const appLayout = document.querySelector('.app-layout');
        const header = document.querySelector('.app-header');
        if (sidebar) {
          sidebar.classList.toggle('collapsed');
          const isCollapsed = sidebar.classList.contains('collapsed');
          document.documentElement.style.setProperty(
            '--sidebar-width',
            isCollapsed ? '56px' : '200px'
          );
          if (header) {
            header.style.left = isCollapsed ? '56px' : '200px';
          }
        }
      });
    }

    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => {
        this.toggleTheme();
      });
    }

    // Apply saved theme
    this.applyTheme();
  }

  toggleTheme() {
    const html = document.documentElement;
    const current = html.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('command-deck-theme', next);
    this.updateThemeIcon(next);
  }

  applyTheme() {
    const saved = localStorage.getItem('command-deck-theme') || 'light';
    document.documentElement.setAttribute('data-theme', saved);
    this.updateThemeIcon(saved);
  }

  updateThemeIcon(theme) {
    const sun = document.querySelector('.icon-sun');
    const moon = document.querySelector('.icon-moon');
    if (sun && moon) {
      sun.style.display = theme === 'dark' ? 'none' : 'block';
      moon.style.display = theme === 'light' ? 'none' : 'block';
    }
  }

  showView(viewName) {
    document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
    const link = document.querySelector(`.sidebar-link[data-view="${viewName}"]`);
    if (link) link.classList.add('active');



    // Show the correct view section
    document.querySelectorAll('.view-section').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(`view-${viewName}`);
    if (target) {
      target.classList.add('active');
    }

    // Initialize view-specific logic
    if (viewName === 'services') {
      this.fetchServices();
    } else if (viewName === 'calendar') {
      this.fetchCalendar();
    } else if (viewName === 'tasks') {
      this.fetchTasks();
    } else if (viewName === 'homelab') {
      this.renderHomeLab();
    } else if (viewName === 'agents') {
      this.fetchBots();
    }

    // Close sidebar on mobile
    if (window.innerWidth <= 768) {
      document.querySelector('.sidebar')?.classList.remove('open');
    }
  }

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

  bindEvents() {
    try {
      document.querySelectorAll('.view-tab').forEach(btn => {
        btn.addEventListener('click', (e) => {
          document.querySelectorAll('.view-tab').forEach(b => b.classList.remove('active'));
          e.target.classList.add('active');
          this.selectedCalendarView = e.target.dataset.view;
          this.renderCalendar();
        });
      });

      const calPrev = document.getElementById('cal-prev');
      const calNext = document.getElementById('cal-next');
      const calToday = document.getElementById('cal-today');
      if (calPrev) calPrev.addEventListener('click', () => this.navigateCalendar(-1));
      if (calNext) calNext.addEventListener('click', () => this.navigateCalendar(1));
      if (calToday) calToday.addEventListener('click', () => {
        this.currentDate = new Date();
        this.renderCalendar();
      });

      document.querySelectorAll('.filter-chip').forEach(chip => {
        chip.addEventListener('click', (e) => {
          document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
          e.target.classList.add('active');
          this.calFilter = e.target.dataset.calFilter;
          this.renderCalendar();
        });
      });

      document.querySelectorAll('.task-filter-pill').forEach(pill => {
        pill.addEventListener('click', (e) => {
          document.querySelectorAll('.task-filter-pill').forEach(p => p.classList.remove('active'));
          e.target.classList.add('active');
          this.taskFilter = e.target.dataset.taskFilter;
          this.renderTasks();
        });
      });

      document.querySelectorAll('.rem-filter-pill').forEach(pill => {
        pill.addEventListener('click', (e) => {
          document.querySelectorAll('.rem-filter-pill').forEach(p => p.classList.remove('active'));
          e.target.classList.add('active');
          this.remFilter = e.target.dataset.remFilter;
          this.renderReminders();
        });
      });

      const searchInput = document.getElementById('wiki-search-input');
      if (searchInput) {
        searchInput.addEventListener('input', (e) => {
          const q = e.target.value.trim();
          if (q.length < 2) return;
          this.searchWiki(q);
        });
      }

      const paletteTrigger = document.getElementById('btn-palette-trigger');
      if (paletteTrigger) {
        paletteTrigger.addEventListener('click', () => {
          document.getElementById('command-palette')?.showModal();
        });
      }

      const serviceRefresh = document.getElementById('btn-service-refresh');
      if (serviceRefresh) {
        serviceRefresh.addEventListener('click', () => this.fetchServices());
      }

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
      this.fetchAgentStatus(),
      this.fetchCronJobs(),
      this.fetchGraphifyStatus(),
    ]);
  }

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

  getServiceIcon(name) {
    const icons = {
      'Jellyfin': '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>',
      'Plex': '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="15" rx="2" ry="2"/><polyline points="17 2 12 7 7 2"/></svg>',
      'Sonarr': '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>',
      'Radarr': '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/></svg>',
      'qBittorrent': '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
      'Traefik': '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
      'Uptime Kuma': '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>',
      'Grafana': '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>',
      'Prometheus': '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
      'FreshRSS': '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11a9 9 0 0 1 9 9"/><path d="M4 4a16 16 0 0 1 16 16"/><circle cx="5" cy="19" r="1"/></svg>',
      'Home Assistant': '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
    };
    return icons[name] || '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>';
  }

  getServiceSvg(name) {
    const svgs = {
      'Jellyfin': '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>',
      'Plex': '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="15" rx="2" ry="2"/><polyline points="17 2 12 7 7 2"/></svg>',
      'Sonarr': '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>',
      'Radarr': '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/></svg>',
      'qBittorrent': '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
      'Traefik': '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
      'Uptime Kuma': '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>',
      'Grafana': '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>',
      'Prometheus': '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
      'FreshRSS': '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11a9 9 0 0 1 9 9"/><path d="M4 4a16 16 0 0 1 16 16"/><circle cx="5" cy="19" r="1"/></svg>',
      'Home Assistant': '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
    };
    return svgs[name] || '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>';
  }

  formatSize(bytes) {
    if (!bytes) return '';
    const gb = bytes / (1024 * 1024 * 1024);
    return gb >= 1 ? `${gb.toFixed(1)} GB` : `${(bytes / (1024 * 1024)).toFixed(0)} MB`;
  }

  highlightSearchTerm(text, term) {
    if (!term) return escapeHtml(text);
    const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return escapeHtml(text).replace(regex, '<mark class="search-highlight">$1</mark>');
  }

  initCollapsiblePanels() {
    document.querySelectorAll('.collapsible-panel .panel-header').forEach(header => {
      header.addEventListener('click', (e) => {
        if (e.target.closest('.panel-actions') || e.target.closest('button')) return;
        const panel = header.closest('.collapsible-panel');
        const isCollapsed = panel.dataset.collapsed === 'true';
        panel.dataset.collapsed = !isCollapsed;
      });
    });
  }

  initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      switch(e.key.toLowerCase()) {
        case '/':
          e.preventDefault();
          document.getElementById('wiki-search-input')?.focus();
          break;
      }
    });
  }
}

// Bootstrap
document.addEventListener('DOMContentLoaded', () => {
  window.commandDeck = new CommandDeck();
});