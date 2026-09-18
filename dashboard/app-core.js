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

window.escapeHtml = escapeHtml;

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
    if (typeof this.initTaskViewToggle === 'function') this.initTaskViewToggle();
    if (typeof this.initSmartTaskInput === 'function') this.initSmartTaskInput();
    if (typeof this.initBriefingTTS === 'function') this.initBriefingTTS();
    if (typeof this.initNotificationDrawer === 'function') this.initNotificationDrawer();
    if (typeof this.initMemoryControls === 'function') this.initMemoryControls();
    if (typeof this.initCreateModal === 'function') this.initCreateModal();
    if (typeof this.initPersonalStateHUD === 'function') this.initPersonalStateHUD();
    if (typeof this.initHitlApprovalsDeck === 'function') this.initHitlApprovalsDeck();
    if (typeof this.initResearchFrontier === 'function') this.initResearchFrontier();
    if (typeof this.refreshAllData === 'function') {
      try {
        await this.refreshAllData();
      } catch (e) {
        console.warn('Initial data refresh failed:', e);
      }
    }
    this.setupAutoRefresh();
    if (typeof this.initCollapsiblePanels === 'function') this.initCollapsiblePanels();
    if (typeof this.initKeyboardShortcuts === 'function') this.initKeyboardShortcuts();
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
      if (typeof this.fetchServices === 'function') this.fetchServices();
    } else if (viewName === 'calendar') {
      if (typeof this.fetchCalendar === 'function') this.fetchCalendar();
    } else if (viewName === 'tasks') {
      if (typeof this.fetchTasks === 'function') this.fetchTasks();
      const tabKanban = document.getElementById('tab-task-kanban');
      if (tabKanban && tabKanban.classList.contains('active') && typeof this.renderKanbanBoard === 'function') {
        this.renderKanbanBoard();
      }
    } else if (viewName === 'homelab') {
      if (typeof this.renderHomeLab === 'function') this.renderHomeLab();
    } else if (viewName === 'system') {
      if (typeof this.fetchSystemStats === 'function') this.fetchSystemStats();
      if (typeof this.renderDashboardServers === 'function') this.renderDashboardServers();
      if (typeof this.fetchTelemetry === 'function') this.fetchTelemetry();
      if (typeof this.fetchAgentStatus === 'function') this.fetchAgentStatus();
      if (typeof this.fetchCronJobs === 'function') this.fetchCronJobs();
      if (typeof this.fetchGatewayStatus === 'function') this.fetchGatewayStatus();
      if (typeof this.fetchInferenceCluster === 'function') this.fetchInferenceCluster();
      if (typeof this.fetchTokenLedger === 'function') this.fetchTokenLedger();
      if (typeof this.fetchNotificationHub === 'function') this.fetchNotificationHub();
    } else if (viewName === 'agents') {
      if (window.botsPage && typeof window.botsPage.init === 'function') {
        window.botsPage.init();
      }
      if (typeof this.fetchSkillsCatalog === 'function') this.fetchSkillsCatalog();
      if (typeof this.fetchLocalModels === 'function') this.fetchLocalModels();
    } else if (viewName === 'homeassistant') {
      if (typeof this.fetchHomeAssistant === 'function') this.fetchHomeAssistant();
    } else if (viewName === 'n8n') {
      if (typeof this.fetchN8n === 'function') this.fetchN8n();
    } else if (viewName === 'vault') {
      if (typeof this.fetchVault === 'function') this.fetchVault();
      if (typeof this.fetchResearchQueue === 'function') this.fetchResearchQueue();
      if (typeof this.fetchKnowledgeGraph === 'function') {
        setTimeout(() => {
          this.fetchKnowledgeGraph();
          if (this.graphVisualizer) {
            this.graphVisualizer.initCanvasSize();
            this.graphVisualizer.render();
          }
        }, 50);
      }
    } else if (viewName === 'markets') {
      if (typeof this.fetchMarkets === 'function') this.fetchMarkets();
    } else if (viewName === 'dashboard') {
      if (typeof this.refreshAllData === 'function') this.refreshAllData();
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

      const calViewPrev = document.getElementById('cal-view-prev');
      const calViewNext = document.getElementById('cal-view-next');
      const calViewToday = document.getElementById('cal-view-today');
      if (calViewPrev) calViewPrev.addEventListener('click', () => this.navigateCalendar(-1));
      if (calViewNext) calViewNext.addEventListener('click', () => this.navigateCalendar(1));
      if (calViewToday) calViewToday.addEventListener('click', () => {
        this.currentDate = new Date();
        this.renderCalendar();
      });

      document.querySelectorAll('.cal-view-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
          document.querySelectorAll('.cal-view-tab').forEach(b => {
            b.classList.remove('active');
            b.style.background = 'transparent';
          });
          e.target.classList.add('active');
          e.target.style.background = 'var(--bg-secondary)';
          this.selectedCalendarView = e.target.dataset.calView;
          this.renderCalendar();
        });
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

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          const taskModal = document.getElementById('task-detail-modal');
          if (taskModal && taskModal.classList.contains('open')) {
            this.closeTaskDetailModal();
          }
        }
      });

      document.getElementById('btn-open-create-task')?.addEventListener('click', () => {
        this.openCreateModal('task');
      });
      document.getElementById('btn-open-create-event')?.addEventListener('click', () => {
        this.openCreateModal('task');
      });
    } catch (e) {
      console.warn('Event binding error:', e);
    }
  }

  async refreshAllData() {
    const safe = async (fn) => {
      try { await fn(); } catch(e) { console.warn('Fetch error:', e.message); }
    };
    await Promise.all([
      safe(() => this.fetchSystemStats()),
      safe(() => this.fetchOverview()),
      safe(() => this.fetchBriefing()),
      safe(() => this.fetchTasks()),
      safe(() => this.fetchReminders()),
      safe(() => this.fetchProjects()),
      safe(() => this.fetchCalendar()),
      safe(() => this.fetchEmails()),
      safe(() => this.fetchIntentions()),
      safe(() => this.fetchTelemetry()),
      safe(() => this.fetchServices()),
      safe(() => this.fetchAgentStatus()),
      safe(() => this.fetchCronJobs()),
      safe(() => this.fetchGraphifyStatus()),
    ]);
  }

  async fetchSystemStats() {
    try {
      const res = await fetch(`${this.apiBase}/api/system`);
      if (res.ok) {
        const data = await res.json();
        const cpuEl = document.getElementById('stat-cpu');
        if (cpuEl) cpuEl.textContent = (data.cpu_percent != null ? data.cpu_percent + '%' : 'N/A');
        const ramEl = document.getElementById('stat-ram');
        if (ramEl) ramEl.textContent = (data.ram_percent != null ? data.ram_percent + '%' : 'N/A');
        const diskEl = document.getElementById('stat-disk');
        if (diskEl) diskEl.textContent = (data.disk_percent != null ? data.disk_percent + '%' : 'N/A');
        const netEl = document.getElementById('stat-network');
        if (netEl) netEl.textContent = (data.network_gb != null ? data.network_gb + ' GB' : 'N/A');
        const gpuEl = document.getElementById('stat-gpu');
        if (gpuEl) gpuEl.textContent = 'N/A';
        const uptimeEl = document.getElementById('stat-uptime');
        if (uptimeEl) uptimeEl.textContent = (data.uptime_days != null ? data.uptime_days + 'd' : 'N/A');
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

  async openTaskDetail(taskId) {
    const modal = document.getElementById('task-detail-modal');
    if (!modal) {
      console.warn('Task detail modal not found');
      return;
    }
    let task = (this.state.tasks || []).find(t => String(t.id) === String(taskId));
    if (!task) {
      try {
        const res = await fetch(`${this.apiBase || ''}/api/tasks`);
        if (res.ok) {
          this.state.tasks = await res.json();
          task = (this.state.tasks || []).find(t => String(t.id) === String(taskId));
        }
      } catch (err) {
        console.warn('Failed to load tasks for detail:', err);
      }
    }
    if (!task) {
      if (this.showToast) this.showToast('Could not load task details', 'warn');
      return;
    }

    const projects = this.state.projects || [];
    const projectOptions = `
      <option value="">(None / General)</option>
      ${projects.map(p => `
        <option value="${p.id}" ${String(task.project_id) === String(p.id) ? 'selected' : ''}>
          ${escapeHtml(p.name)}
        </option>
      `).join('')}
    `;

    // Format due date for datetime-local input (YYYY-MM-DDTHH:mm)
    let formattedDue = '';
    if (task.due_at) {
      try {
        const d = new Date(task.due_at);
        if (!isNaN(d.getTime())) {
          formattedDue = d.toISOString().slice(0, 16);
        }
      } catch(e) {}
    }
    
    const body = modal.querySelector('.task-detail-modal__body');
    body.innerHTML = `
      <div class="task-detail-section">
        <label class="task-detail-label" for="task-detail-title">Task Wording / Title</label>
        <input type="text" id="task-detail-title" class="task-detail-title-input" value="${escapeHtml(task.title)}" placeholder="Enter task wording..." autofocus />
      </div>

      <div class="task-detail-divider">
        <span>Task Details</span>
      </div>

      <div class="task-detail-grid">
        <div class="task-detail-field">
          <label for="task-detail-status">Status</label>
          <select id="task-detail-status" class="task-detail-select">
            <option value="next" ${task.status === 'next' ? 'selected' : ''}>Next</option>
            <option value="in_progress" ${task.status === 'in_progress' ? 'selected' : ''}>In Progress</option>
            <option value="waiting" ${task.status === 'waiting' ? 'selected' : ''}>Waiting</option>
            <option value="blocked" ${task.status === 'blocked' ? 'selected' : ''}>Blocked</option>
            <option value="completed" ${task.status === 'completed' ? 'selected' : ''}>Completed</option>
          </select>
        </div>

        <div class="task-detail-field">
          <label for="task-detail-priority">Priority</label>
          <select id="task-detail-priority" class="task-detail-select">
            <option value="critical" ${task.priority === 'critical' ? 'selected' : ''}>Critical</option>
            <option value="high" ${task.priority === 'high' ? 'selected' : ''}>High</option>
            <option value="medium" ${task.priority === 'medium' || !task.priority ? 'selected' : ''}>Medium</option>
            <option value="low" ${task.priority === 'low' ? 'selected' : ''}>Low</option>
          </select>
        </div>

        <div class="task-detail-field">
          <label for="task-detail-project">Assigned Project</label>
          <select id="task-detail-project" class="task-detail-select">
            ${projectOptions}
          </select>
        </div>

        <div class="task-detail-field">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <label for="task-detail-due">Due Date & Time</label>
            <button type="button" id="btn-clear-due-date" class="task-detail-link-btn" title="Remove due date">Clear</button>
          </div>
          <input type="datetime-local" id="task-detail-due" class="task-detail-input" value="${formattedDue}" />
        </div>
      </div>

      <div class="task-detail-field" style="margin-top: 10px;">
        <label for="task-detail-description">Description, Context & Notes</label>
        <textarea id="task-detail-description" class="task-detail-textarea" rows="4" placeholder="Add descriptions, checklists, context or notes for this task...">${escapeHtml(task.description || '')}</textarea>
      </div>

      <div class="task-detail-meta-row">
        ${task.project_name ? `<span>📁 Project: <strong>${escapeHtml(task.project_name)}</strong></span>` : ''}
        <span>🆔 #${escapeHtml(String(task.id))}</span>
        <span>🕒 Created: ${task.created_at ? new Date(task.created_at).toLocaleDateString() : 'N/A'}</span>
        ${task.completed_at ? `<span>✓ Completed: ${new Date(task.completed_at).toLocaleDateString()}</span>` : ''}
      </div>
    `;
    
    // Clear due date button
    const clearDueBtn = body.querySelector('#btn-clear-due-date');
    if (clearDueBtn) {
      clearDueBtn.onclick = () => {
        const dueInp = document.getElementById('task-detail-due');
        if (dueInp) dueInp.value = '';
      };
    }

    modal.classList.add('open');
    modal.dataset.taskId = String(task.id);

    // Delete button
    const deleteBtn = document.getElementById('task-detail-delete');
    if (deleteBtn) {
      deleteBtn.onclick = async () => {
        if (confirm(`Are you sure you want to delete task "${task.title}"?`)) {
          await this.deleteTask(task.id);
          this.closeTaskDetailModal();
          if (this.showToast) this.showToast('Task deleted', 'info');
          await Promise.all([
            this.fetchTasks ? this.fetchTasks() : Promise.resolve(),
            this.fetchOverview ? this.fetchOverview() : Promise.resolve(),
            this.fetchCalendar ? this.fetchCalendar() : Promise.resolve()
          ]);
        }
      };
    }

    // Auto focus title input
    setTimeout(() => {
      const titleInput = document.getElementById('task-detail-title');
      if (titleInput) {
        titleInput.focus();
        titleInput.select();
        titleInput.onkeydown = (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            this.saveTaskDetail();
          }
        };
      }
    }, 50);
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
    
    const title = document.getElementById('task-detail-title')?.value.trim() || '';
    if (!title) {
      if (this.showToast) this.showToast('Task wording cannot be empty', 'warn');
      return;
    }

    const payload = {
      title,
      description: document.getElementById('task-detail-description')?.value || '',
      status: document.getElementById('task-detail-status')?.value || 'next',
      priority: document.getElementById('task-detail-priority')?.value || 'medium',
    };

    const projectSelect = document.getElementById('task-detail-project');
    if (projectSelect) {
      payload.project_id = projectSelect.value ? parseInt(projectSelect.value, 10) : null;
    }
    
    const dueEl = document.getElementById('task-detail-due');
    if (dueEl) {
      payload.due_at = dueEl.value ? new Date(dueEl.value).toISOString() : null;
    }
    
    try {
      await this.updateTask(taskId, payload);
      this.closeTaskDetailModal();
      if (this.showToast) this.showToast('Task updated successfully', 'ok');
      await Promise.all([
        this.fetchTasks ? this.fetchTasks() : Promise.resolve(),
        this.fetchOverview ? this.fetchOverview() : Promise.resolve(),
        this.fetchCalendar ? this.fetchCalendar() : Promise.resolve()
      ]);
    } catch (e) {
      console.error('Failed to save task detail:', e);
      if (this.showToast) this.showToast('Failed to save task update', 'warn');
    }
  }

  // ── 1. Personal State Attention HUD ──────────────────────────────────
  initPersonalStateHUD() {
    const chip = document.getElementById('attention-hud-chip');
    const drawer = document.getElementById('attention-drawer');
    const backdrop = document.getElementById('attention-backdrop');
    const closeBtn = document.getElementById('btn-close-attention');

    if (chip && drawer) {
      chip.addEventListener('click', () => {
        const isHidden = drawer.style.display === 'none';
        drawer.style.display = isHidden ? 'flex' : 'none';
        if (backdrop) backdrop.style.display = isHidden ? 'block' : 'none';
        if (isHidden) this.fetchPersonalState();
      });
    }

    const closeDrawer = () => {
      if (drawer) drawer.style.display = 'none';
      if (backdrop) backdrop.style.display = 'none';
    };

    if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
    if (backdrop) backdrop.addEventListener('click', closeDrawer);

    // Initial fetch and poll every 30s
    this.fetchPersonalState();
    setInterval(() => this.fetchPersonalState(), 30000);
  }

  async fetchPersonalState() {
    try {
      const res = await fetch(`${this.apiBase}/api/system/personal-state`);
      if (!res.ok) return;
      const data = await res.json();
      this.renderPersonalStateHUD(data);
    } catch (e) {
      console.warn('Personal state fetch error:', e);
    }
  }

  renderPersonalStateHUD(data) {
    const chip = document.getElementById('attention-hud-chip');
    const label = document.getElementById('attention-label');
    const badge = document.getElementById('attention-badge');
    if (!chip || !label) return;

    const total = data.total_attention || 0;
    if (data.status === 'attention' && total > 0) {
      chip.classList.add('needs-attention');
      label.textContent = `${total} Attention Item${total > 1 ? 's' : ''}`;
      if (badge) {
        badge.style.display = 'inline-block';
        badge.textContent = total;
      }
    } else {
      chip.classList.remove('needs-attention');
      label.textContent = 'Cognition Aligned';
      if (badge) badge.style.display = 'none';
    }

    // Update Drawer Stats
    const counts = data.counts || {};
    const setNum = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v || 0; };
    setNum('att-count-overdue', counts.overdue_tasks);
    setNum('att-count-reminders', counts.reminders);
    setNum('att-count-intentions', counts.intentions);
    setNum('att-count-waiting', counts.waiting);
    setNum('att-count-subs', counts.subscriptions);

    // Update Drawer Issues Body
    const body = document.getElementById('attention-drawer-body');
    if (!body) return;

    const issues = data.issues || [];
    if (issues.length === 0) {
      body.innerHTML = `
        <div class="empty-state" style="padding:40px 20px; text-align:center;">
          <div style="font-size:2rem; margin-bottom:8px;">✨</div>
          <div style="font-weight:600; color:var(--text-1); margin-bottom:4px;">All Operations Aligned</div>
          <div style="font-size:0.75rem; color:var(--text-3);">No overdue tasks, due reminders, or cognitive blocks detected.</div>
        </div>`;
      return;
    }

    body.innerHTML = issues.map(iss => {
      const sevClass = `att-issue-card--${iss.severity || 'info'}`;
      return `
        <div class="att-issue-card ${sevClass}">
          <div class="att-issue-header">
            <span class="att-issue-type">${escapeHtml(iss.type)}</span>
            <span class="badge ${iss.severity === 'critical' ? 'badge-rose' : (iss.severity === 'high' ? 'badge-warning' : 'badge-cyan')}">${escapeHtml(iss.badge || 'Pending')}</span>
          </div>
          <div class="att-issue-title">${escapeHtml(iss.title)}</div>
          ${iss.detail ? `<div class="att-issue-detail">${escapeHtml(iss.detail)}</div>` : ''}
          <div class="att-issue-due">Target: ${iss.due ? new Date(iss.due).toLocaleString() : 'Immediate'}</div>
        </div>`;
    }).join('');
  }

  // ── 2. HITL Action Approvals Deck ────────────────────────────────────
  initHitlApprovalsDeck() {
    const btn = document.getElementById('btn-hitl-approvals');
    const modal = document.getElementById('hitl-approval-modal');
    const backdrop = document.getElementById('hitl-backdrop');
    const closeBtn = document.getElementById('btn-close-hitl');

    if (btn && modal) {
      btn.addEventListener('click', () => {
        const isHidden = modal.style.display === 'none';
        modal.style.display = isHidden ? 'flex' : 'none';
        if (backdrop) backdrop.style.display = isHidden ? 'block' : 'none';
        if (isHidden) this.fetchHitlApprovals();
      });
    }

    const closeModal = () => {
      if (modal) modal.style.display = 'none';
      if (backdrop) backdrop.style.display = 'none';
    };

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (backdrop) backdrop.addEventListener('click', closeModal);

    this.fetchHitlApprovals();
    setInterval(() => this.fetchHitlApprovals(), 20000);
  }

  async fetchHitlApprovals() {
    try {
      const res = await fetch(`${this.apiBase}/api/agent/pending-approvals`);
      if (!res.ok) return;
      const data = await res.json();
      this.renderHitlApprovals(data);
    } catch (e) {
      console.warn('HITL fetch error:', e);
    }
  }

  renderHitlApprovals(data) {
    const countBadge = document.getElementById('hitl-badge-count');
    const modalCount = document.getElementById('hitl-modal-pending-count');
    const pendingList = document.getElementById('hitl-pending-list');
    const historyList = document.getElementById('hitl-history-list');

    const count = data.pending_count || 0;
    if (countBadge) {
      countBadge.style.display = count > 0 ? 'inline-block' : 'none';
      countBadge.textContent = count;
    }
    if (modalCount) modalCount.textContent = count;

    if (pendingList) {
      const pending = data.pending || [];
      if (pending.length === 0) {
        pendingList.innerHTML = `<div class="hitl-empty-msg" style="padding:20px; text-align:center; color:var(--text-3); font-size:0.8rem;">No pending agent actions require approval. Queue is clear.</div>`;
      } else {
        pendingList.innerHTML = pending.map(act => {
          const risk = (act.risk_level || 'medium').toLowerCase();
          return `
            <div class="hitl-card hitl-card--${risk}">
              <div class="hitl-card-header">
                <span class="hitl-agent-name">🤖 ${escapeHtml(act.agent || 'Agent')}</span>
                <span class="hitl-risk-tag hitl-risk-tag--${risk}">${risk.toUpperCase()} RISK</span>
              </div>
              <div style="font-size:0.85rem; font-weight:600; color:var(--text-1);">${escapeHtml(act.description || '')}</div>
              <div class="hitl-command-snippet">${escapeHtml(act.command || '')}</div>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-top:4px;">
                <span style="font-size:0.7rem; color:var(--text-3); font-family:var(--font-mono);">${new Date(act.created_at).toLocaleTimeString()}</span>
                <div class="hitl-actions">
                  <button class="btn btn--ghost btn--sm btn-hitl-reject" data-id="${act.id}" style="color:#ef4444; border-color:rgba(239,68,68,0.3); font-size:0.75rem;">✕ Reject</button>
                  <button class="btn btn--primary btn--sm btn-hitl-approve" data-id="${act.id}" style="background:#10b981; border:none; font-size:0.75rem;">✓ Approve & Run</button>
                </div>
              </div>
            </div>`;
        }).join('');

        pendingList.querySelectorAll('.btn-hitl-approve').forEach(b => {
          b.addEventListener('click', () => this.resolveHitlApproval(b.dataset.id, 'approved'));
        });
        pendingList.querySelectorAll('.btn-hitl-reject').forEach(b => {
          b.addEventListener('click', () => this.resolveHitlApproval(b.dataset.id, 'rejected'));
        });
      }
    }

    if (historyList) {
      const history = data.history || [];
      if (history.length > 0) {
        historyList.innerHTML = history.slice(0, 5).map(h => `
          <div style="display:flex; justify-content:space-between; padding:6px 0; border-bottom:1px solid rgba(255,255,255,0.04); font-size:0.75rem;">
            <span style="color:var(--text-2);">${escapeHtml(h.description || h.command || '')}</span>
            <span class="badge ${h.status === 'approved' ? 'badge-emerald' : 'badge-rose'}">${escapeHtml(h.status)}</span>
          </div>`).join('');
      } else {
        historyList.innerHTML = `<span style="font-size:0.75rem; color:var(--text-3);">No prior approval history.</span>`;
      }
    }
  }

  async resolveHitlApproval(actionId, decision) {
    try {
      const res = await fetch(`${this.apiBase}/api/agent/approvals/${actionId}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision, rationale: `User direct manual ${decision}` })
      });
      if (res.ok) {
        if (this.showToast) this.showToast(`Action ${actionId} ${decision}`, 'ok');
        await this.fetchHitlApprovals();
      }
    } catch (e) {
      console.error('Failed to resolve approval:', e);
    }
  }

  // ── 3. Multi-Host Inference Cluster Telemetry ───────────────────────
  async fetchInferenceCluster() {
    const stage = document.getElementById('inference-cluster-body');
    const badge = document.getElementById('inference-cluster-status');
    if (!stage) return;

    try {
      const res = await fetch(`${this.apiBase}/api/system/inference-cluster`);
      if (!res.ok) return;
      const data = await res.json();

      if (badge) {
        badge.innerHTML = `<span class="badge ${data.nodes_online >= 1 ? 'badge-emerald' : 'badge-rose'}">${data.nodes_online}/${data.nodes_total} Online • ${data.used_vram_gb} GB / ${data.total_vram_gb} GB VRAM</span>`;
      }

      stage.innerHTML = `
        <div class="inference-cluster-grid">
          ${(data.nodes || []).map(n => `
            <div class="inference-node-card">
              <div class="node-card-header">
                <div>
                  <div class="node-card-name">${escapeHtml(n.name)}</div>
                  <div class="node-card-role">${escapeHtml(n.role)}</div>
                </div>
                <span class="badge ${n.online ? 'badge-emerald' : 'badge-secondary'}">${n.online ? `${n.latency_ms}ms` : 'Offline'}</span>
              </div>
              <div style="font-size:0.75rem; color:var(--text-2); font-family:var(--font-mono); background:rgba(0,0,0,0.2); padding:4px 6px; border-radius:4px;">
                ${escapeHtml(n.model)}
              </div>
              <div class="node-vram-row">
                <div style="display:flex; justify-content:space-between; font-size:0.7rem; color:var(--text-3);">
                  <span>VRAM: ${n.vram_used_gb} / ${n.vram_total_gb} GB</span>
                  <span>KV: ${n.kv_cache_pct}%</span>
                </div>
                <div class="node-vram-bar">
                  <div class="node-vram-fill" style="width:${Math.round((n.vram_used_gb / n.vram_total_gb) * 100)}%;"></div>
                </div>
              </div>
            </div>`).join('')}
        </div>`;
    } catch (e) {
      console.warn('Inference cluster fetch error:', e);
    }
  }

  // ── 4. Daily Token & Multi-Provider Cost Ledger ─────────────────────
  async fetchTokenLedger() {
    const stage = document.getElementById('token-ledger-body');
    const badge = document.getElementById('token-budget-badge');
    if (!stage) return;

    try {
      const res = await fetch(`${this.apiBase}/api/system/token-usage`);
      if (!res.ok) return;
      const data = await res.json();

      if (badge) {
        badge.innerHTML = `<span class="badge badge-cyan">$${data.total_cost} / $${data.budget_limit.toFixed(2)} (${data.budget_pct}%)</span>`;
      }

      stage.innerHTML = `
        <div class="token-ledger-grid">
          <div class="token-stats-row">
            <div class="token-stat-box">
              <span class="token-stat-box__num">${(data.total_tokens || 0).toLocaleString()}</span>
              <span class="token-stat-box__lbl">Today's Tokens</span>
            </div>
            <div class="token-stat-box">
              <span class="token-stat-box__num">${(data.prompt_tokens || 0).toLocaleString()}</span>
              <span class="token-stat-box__lbl">Prompt</span>
            </div>
            <div class="token-stat-box">
              <span class="token-stat-box__num">${(data.completion_tokens || 0).toLocaleString()}</span>
              <span class="token-stat-box__lbl">Completion</span>
            </div>
            <div class="token-stat-box">
              <span class="token-stat-box__num" style="color:#10b981;">$${data.total_cost}</span>
              <span class="token-stat-box__lbl">Cost (USD)</span>
            </div>
          </div>
          <div class="budget-progress-wrapper">
            <div style="display:flex; justify-content:space-between; font-size:0.75rem; color:var(--text-3);">
              <span>Daily Budget Cap: $${data.budget_limit.toFixed(2)}</span>
              <span>${data.budget_pct}% used</span>
            </div>
            <div class="budget-progress-bar">
              <div class="budget-progress-fill" style="width:${Math.min(data.budget_pct, 100)}%;"></div>
            </div>
          </div>
          <div style="display:flex; flex-wrap:wrap; gap:8px; margin-top:4px;">
            ${(data.providers || []).map(p => `
              <div style="font-size:0.75rem; background:var(--bg-tertiary); padding:4px 8px; border-radius:6px; border:1px solid var(--border-subtle);">
                <span style="font-weight:600; color:var(--text-1);">${escapeHtml(p.name)}:</span>
                <span style="color:var(--text-3); margin-left:4px;">${p.tokens.toLocaleString()} tk ($${p.cost.toFixed(2)})</span>
              </div>`).join('')}
          </div>
        </div>`;
    } catch (e) {
      console.warn('Token ledger fetch error:', e);
    }
  }

  // ── 5. Omnichannel Notification Hub ──────────────────────────────────
  async fetchNotificationHub() {
    const stage = document.getElementById('notification-hub-body');
    const badge = document.getElementById('notification-hub-status');
    if (!stage) return;

    try {
      const res = await fetch(`${this.apiBase}/api/system/notifications/log`);
      if (!res.ok) return;
      const data = await res.json();

      if (badge) {
        badge.innerHTML = `<span class="badge badge-emerald">Dispatch Active</span>`;
      }

      stage.innerHTML = `
        <div class="notification-hub-grid">
          <div class="channels-status-row">
            ${(data.channels || []).map(ch => `
              <div class="channel-status-pill">
                <span>${ch.icon}</span>
                <span style="font-weight:600;">${escapeHtml(ch.name)}</span>
                <span class="badge badge-emerald" style="font-size:0.6rem; padding:1px 4px;">Connected</span>
              </div>`).join('')}
          </div>
          <div style="display:flex; gap:8px; margin-top:6px;">
            <input type="text" id="notif-test-input" placeholder="Broadcast instant test dispatch..." style="flex:1; padding:6px 10px; background:var(--bg-tertiary); border:1px solid var(--border-subtle); border-radius:6px; color:var(--text-1); font-size:0.8rem;" />
            <button class="btn btn--primary btn--sm" id="btn-send-test-dispatch" style="font-size:0.75rem;">Send Test</button>
          </div>
          <div style="font-size:0.75rem; font-weight:600; color:var(--text-3); text-transform:uppercase; margin-top:8px;">Recent Outbound Dispatches</div>
          <div style="display:flex; flex-direction:column; gap:6px; max-height:160px; overflow-y:auto;">
            ${(data.logs || []).map(l => `
              <div style="display:flex; justify-content:space-between; align-items:center; background:var(--bg-tertiary); padding:6px 10px; border-radius:4px; font-size:0.75rem;">
                <div>
                  <span style="font-weight:600; color:var(--text-1);">${escapeHtml(l.channel)}:</span>
                  <span style="color:var(--text-2); margin-left:4px;">${escapeHtml(l.subject)}</span>
                </div>
                <span style="font-family:var(--font-mono); color:var(--text-3); font-size:0.7rem;">${new Date(l.sent_at).toLocaleTimeString()}</span>
              </div>`).join('')}
          </div>
        </div>`;

      const testBtn = document.getElementById('btn-send-test-dispatch');
      const testInput = document.getElementById('notif-test-input');
      if (testBtn && testInput) {
        testBtn.addEventListener('click', async () => {
          const msg = testInput.value.trim();
          if (!msg) return;
          try {
            await fetch(`${this.apiBase}/api/system/notifications/test`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ message: msg })
            });
            testInput.value = '';
            if (this.showToast) this.showToast('Test dispatch delivered', 'ok');
            this.fetchNotificationHub();
          } catch (e) {
            console.error('Failed to send test dispatch:', e);
          }
        });
      }
    } catch (e) {
      console.warn('Notification hub fetch error:', e);
    }
  }

  // ── 6. Oracle Research Frontier & Curiosity Queue ────────────────────
  initResearchFrontier() {
    // Initial fetch if on vault view
  }

  async fetchResearchQueue() {
    const stage = document.getElementById('research-queue-stage');
    if (!stage) return;

    try {
      const res = await fetch(`${this.apiBase}/api/knowledge/research-queue`);
      if (!res.ok) return;
      const data = await res.json();

      const active = data.active_topic || {};
      const queued = data.queued_topics || [];
      const frontier = data.frontier_catalog || [];

      stage.innerHTML = `
        <div class="research-frontier-layout">
          <div class="active-research-card">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span class="badge badge-purple" style="font-size:0.65rem;">SYNTHESIS IN PROGRESS</span>
              <span style="font-size:0.7rem; color:var(--text-3); font-family:var(--font-mono);">${escapeHtml(active.domain || '')}</span>
            </div>
            <div style="font-weight:700; font-size:1rem; color:var(--text-1);">${escapeHtml(active.title || 'No active topic')}</div>
            <div style="font-size:0.8rem; color:var(--text-2); line-height:1.4;">${escapeHtml(active.description || '')}</div>
            <div style="display:flex; gap:8px; margin-top:6px;">
              <input type="text" id="enqueue-research-input" placeholder="Queue custom research package..." style="flex:1; padding:6px 10px; background:var(--bg-primary); border:1px solid var(--border-subtle); border-radius:6px; color:var(--text-1); font-size:0.78rem;" />
              <button class="btn btn--primary btn--sm" id="btn-enqueue-research" style="font-size:0.75rem;">+ Enqueue</button>
            </div>
          </div>
          <div class="frontier-queue-list">
            <div style="font-size:0.75rem; font-weight:700; color:var(--text-3); text-transform:uppercase;">Next in Research Pipeline</div>
            ${queued.map(q => `
              <div class="frontier-topic-item">
                <div>
                  <div style="font-weight:600; font-size:0.8rem; color:var(--text-1);">${escapeHtml(q.title)}</div>
                  <div style="font-size:0.7rem; color:var(--text-3);">${escapeHtml(q.domain)}</div>
                </div>
                <span class="badge badge-cyan" style="font-size:0.65rem;">Queued</span>
              </div>`).join('')}
            ${frontier.slice(0, 2).map(f => `
              <div class="frontier-topic-item">
                <div>
                  <div style="font-weight:600; font-size:0.8rem; color:var(--text-1);">${escapeHtml(f.title)}</div>
                  <div style="font-size:0.7rem; color:var(--text-3);">${escapeHtml(f.domain)}</div>
                </div>
                <span class="badge badge-secondary" style="font-size:0.65rem;">Frontier</span>
              </div>`).join('')}
          </div>
        </div>`;

      const addBtn = document.getElementById('btn-enqueue-research');
      const addInput = document.getElementById('enqueue-research-input');
      if (addBtn && addInput) {
        addBtn.addEventListener('click', async () => {
          const topic = addInput.value.trim();
          if (!topic) return;
          try {
            await fetch(`${this.apiBase}/api/knowledge/research-queue/add`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ topic })
            });
            addInput.value = '';
            if (this.showToast) this.showToast(`Enqueued: ${topic}`, 'ok');
            this.fetchResearchQueue();
          } catch (e) {
            console.error('Failed to enqueue research:', e);
          }
        });
      }
    } catch (e) {
      console.warn('Research queue fetch error:', e);
    }
  }
}

// Bootstrap CommandDeck
function bootCommandDeck() {
  if (!window.commandDeck) {
    window.commandDeck = new CommandDeck();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => setTimeout(bootCommandDeck, 0));
} else {
  setTimeout(bootCommandDeck, 0);
}