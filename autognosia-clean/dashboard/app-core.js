/**
 * Autognosia // Command Deck Frontend Controller (v2.5)
 * Reactive state, dynamic calendar views, task pipeline, email triage,
 * prospective intentions, second brain search, and cognitive telemetry.
 */


// ── Helper Utility Functions (must be defined before class) ─────────────────
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

export class CommandDeck {
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
  }


  // ── Event Bindings ─────────────────────────────────────────────────────────
  bindEvents() {
    // Refresh rate selector
    const refreshSelect = document.getElementById('auto-refresh-rate');
    refreshSelect.addEventListener('change', (e) => {
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
    document.getElementById('cal-prev').addEventListener('click', () => this.navigateCalendar(-1));
    document.getElementById('cal-next').addEventListener('click', () => this.navigateCalendar(1));
    document.getElementById('cal-today').addEventListener('click', () => {
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

    // Organizer Tab Toggles
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.org-tab-pane').forEach(p => p.classList.remove('active'));
        e.target.classList.add('active');
        const tab = e.target.dataset.orgTab;
        document.getElementById(`pane-${tab}`).classList.add('active');
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

    // Second Brain Instant Search
    const searchInput = document.getElementById('wiki-search-input');
    let searchDebounce = null;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchDebounce);
      const q = e.target.value.trim();
      if (!q) {
        document.getElementById('wiki-results-container').innerHTML =
          '<div class="empty-hint">Type above to search across all Markdown wiki & oracle documents.</div>';
        return;
      }
      searchDebounce = setTimeout(() => this.searchWiki(q), 200);
    });

    // Keyboard shortcut '/' to search
    window.addEventListener('keydown', (e) => {
      if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault();
        searchInput.focus();
      }
    });

    // Telemetry Drawer
    document.getElementById('btn-telemetry').addEventListener('click', () => {
      document.getElementById('telemetry-drawer').classList.toggle('open');
    });
    document.getElementById('btn-close-telemetry').addEventListener('click', () => {
      document.getElementById('telemetry-drawer').classList.remove('open');
    });

    // Chat Drawer Toggle
    const chatDrawer = document.getElementById('chat-drawer');
    document.getElementById('btn-toggle-chat').addEventListener('click', () => {
      chatDrawer.classList.toggle('open');
      if (chatDrawer.classList.contains('open')) {
        document.getElementById('chat-input').focus();
      }
    });
    document.getElementById('btn-close-chat').addEventListener('click', () => {
      chatDrawer.classList.remove('open');
    });

    // Chat Message Send
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('btn-send-chat');
    const handleSend = () => {
      const msg = chatInput.value.trim();
      if (!msg) return;
      this.sendChatMessage(msg);
      chatInput.value = '';
    };
    sendBtn.addEventListener('click', handleSend);
    chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    });

    // Chat Prompt Suggestions
    document.querySelectorAll('.sugg-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        const p = btn.dataset.prompt;
        this.sendChatMessage(p);
      });
    });

    // Create Modal
    document.getElementById('btn-quick-create').addEventListener('click', () => this.openCreateModal('task'));
    document.getElementById('btn-add-intention').addEventListener('click', () => this.openCreateModal('intention'));
    document.getElementById('btn-close-create').addEventListener('click', () => this.closeCreateModal());
    document.getElementById('btn-cancel-create').addEventListener('click', () => this.closeCreateModal());

    // Service Refresh Button
    document.getElementById('btn-service-refresh')?.addEventListener('click', () => this.fetchServices());
    
    // Type selector in create modal
    const createTypeSelect = document.getElementById('create-type');
    createTypeSelect.addEventListener('change', (e) => {
      const val = e.target.value;
      document.getElementById('fields-task').style.display = val === 'task' ? 'block' : 'none';
      document.getElementById('fields-reminder').style.display = val === 'reminder' ? 'block' : 'none';
      document.getElementById('fields-intention').style.display = val === 'intention' ? 'block' : 'none';
    });

    // Reminder preset dropdown in modal
    const remPreset = document.getElementById('reminder-time-preset');
    if (remPreset) {
      remPreset.addEventListener('change', (e) => {
        document.getElementById('group-reminder-custom-date').style.display =
          e.target.value === 'custom' ? 'block' : 'none';
      });
    }

    // Create Form Submit
    document.getElementById('form-create-item').addEventListener('submit', async (e) => {
      e.preventDefault();
      const type = createTypeSelect.value;
      if (type === 'task') {
        const title = document.getElementById('task-title').value;
        const priority = document.getElementById('task-priority').value;
        const due = document.getElementById('task-due-date').value || null;
        const desc = document.getElementById('task-desc').value;
        await this.createTask({ title, priority, due_at: due, description: desc, status: 'active' });
      } else if (type === 'reminder') {
        const title = document.getElementById('reminder-title').value;
        const preset = document.getElementById('reminder-time-preset').value;
        const channel = document.getElementById('reminder-channel').value;
        const notes = document.getElementById('reminder-notes').value;
        
        let payload = { title, channel, notes };
        if (preset === 'custom') {
          payload.remind_at = document.getElementById('reminder-custom-dt').value;
        } else {
          payload.offset_minutes = parseInt(preset, 10);
        }
        await this.createReminder(payload);
      } else {
        const cue = document.getElementById('intention-cue').value;
        const action = document.getElementById('intention-action').value;
        await this.createIntention({ cue, action });
      }
      this.closeCreateModal();
      await this.refreshAllData();
    });

    // Doc Viewer Modal Close
    document.getElementById('btn-close-doc').addEventListener('click', () => {
      document.getElementById('modal-doc-viewer').classList.remove('open');
    });
  }


  // ── Clock & Heartbeat ──────────────────────────────────────────────────────
  startClock() {
    const clockEl = document.getElementById('hud-clock');
    const update = () => {
      const now = new Date();
      clockEl.textContent = now.toTimeString().split(' ')[0] + ' UTC';
    };
    update();
    setInterval(update, 1000);
  }

  setupAutoRefresh() {
    if (this.refreshTimer) clearInterval(this.refreshTimer);
    if (this.autoRefreshInterval > 0) {
      this.refreshTimer = setInterval(() => this.refreshAllData(), this.autoRefreshInterval);
    }
  }



}
