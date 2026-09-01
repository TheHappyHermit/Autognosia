/**
 * Autognosia // Command Deck — Core Controller
 * State management, view routing, event bindings, data fetching.
 */
class CommandDeck {
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
      telemetry: {},
      homelab: null,
    };

    this.currentView = 'dashboard';

    this.init();
  }

  getViewEl(id) {
    // If a dedicated view is active (not dashboard), look there first
    const activeView = this.currentView;
    if (activeView && activeView !== 'dashboard') {
      const viewEl = document.getElementById(`view-${activeView}`);
      if (viewEl) {
        const el = viewEl.querySelector(`#${id}`);
        if (el) return el;
      }
      return document.getElementById(id);
    }
    // Dashboard preview elements carry a dashboard- prefix
    return document.getElementById(`dashboard-${id}`) || document.getElementById(id);
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
  }

  showView(viewName) {
    this.currentView = viewName;
    
    document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
    const link = document.querySelector(`.sidebar-link[data-view="${viewName}"]`);
    if (link) link.classList.add('active');

    document.querySelectorAll('.view-section').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(`view-${viewName}`);
    if (target) target.classList.add('active');

    if (viewName === 'bots' && window.botsPage) {
      window.botsPage.init();
    }

    // Trigger data loads for specific views
    if (viewName === 'calendar') this.fetchCalendar();
    if (viewName === 'tasks') this.fetchTasks();
    if (viewName === 'services') {
      this.fetchServices();
      this.fetchMedia();
      this.fetchQueue();
    }
    if (viewName === 'homelab') this.fetchHomelab();
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

  async fetchHomelab() {
    try {
      const res = await fetch(`${this.apiBase}/api/homelab`);
      if (res.ok) {
        this.state.homelab = await res.json();
        this.renderHomelab();
      }
    } catch (e) {
      console.warn('Homelab fetch error:', e);
    }
  }

  renderHomelab() {
    const data = this.state.homelab;
    if (!data || !data.servers) return;

    // Map of server keys to DOM element IDs
    const serverMap = {
      main:   { card: 'server-main',   status: 'server-main-status',   services: 'server-main-services' },
      agent:  { card: 'server-agent',   status: 'server-agent-status',  services: 'server-agent-services' },
      'agent-zero': { card: 'server-agent-zero', status: 'server-agent-zero-status', services: 'server-agent-zero-services' },
    };

    for (const [key, elIds] of Object.entries(serverMap)) {
      const server = data.servers[key];
      if (!server) continue;

      // Update status indicator
      const statusEl = this.getViewEl(elIds.status);
      if (statusEl) {
        if (server.online) {
          statusEl.className = 'server-card__status online';
          statusEl.innerHTML = '● Online';
        } else {
          statusEl.className = 'server-card__status offline';
          statusEl.innerHTML = '● Offline';
        }
      }

      // Update service pills
      const servicesEl = this.getViewEl(elIds.services);
      if (servicesEl) {
        servicesEl.innerHTML = '';
        if (server.services) {
          for (const [svcName, svcInfo] of Object.entries(server.services)) {
            const pill = document.createElement('span');
            pill.className = svcInfo.healthy ? 'service-pill service-pill--online' : 'service-pill service-pill--offline';
            pill.innerHTML = `<span class="service-pill__dot"></span>${svcName}`;
            servicesEl.appendChild(pill);
          }
        }
      }
    }

    // Update GPU meter on main server card
    const gpuInfo = data.gpu;
    const gpuUtilEl = this.getViewEl('gpu-main-util');
    const gpuFillEl = this.getViewEl('gpu-main-fill');
    if (gpuInfo && gpuInfo.available && gpuInfo.gpus && gpuInfo.gpus.length > 0) {
      const gpu = gpuInfo.gpus[0];
      const util = gpu.utilization ?? 0;
      if (gpuUtilEl) {
        gpuUtilEl.textContent = `${util}%`;
      }
      if (gpuFillEl) {
        gpuFillEl.style.width = `${util}%`;
        gpuFillEl.className = util > 80 ? 'gpu-meter__fill gpu-meter__fill--high' : 'gpu-meter__fill';
      }
    }
  }

  getServiceIcon(name) {
    const icons = {
      'Jellyfin': '🎬', 'Plex': '🎥', 'Sonarr': '📺', 'Radarr': '🎞️',
      'qBittorrent': '⬇️', 'Traefik': '🚦', 'Uptime Kuma': '📊',
      'Grafana': '📈', 'Prometheus': '⚡', 'FreshRSS': '📰', 'Home Assistant': '🏠',
    };
    return icons[name] || '⚙️';
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

// Utility functions
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatTime(iso) {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  } catch (e) { return iso; }
}

function strToDateStr(iso) {
  if (!iso) return '';
  return iso.includes('T') ? iso.split('T')[0] : iso;
}

function getCategoryBadge(cat) {
  const map = { meeting: 'cyan', task: 'amber', subscription: 'violet', task_deadline: 'amber' };
  return map[cat] || 'cyan';
}

// Bootstrap
document.addEventListener('DOMContentLoaded', () => {
  window.commandDeck = new CommandDeck();
  window.cd = window.commandDeck;
});