import { CommandDeck } from './app-core.js';

// ── Tasks & Organizer ──────────────────────────────────────────────────────

CommandDeck.prototype.renderTasks = function() {
  const container = document.getElementById('task-list-container');
  const viewContainer = document.getElementById('tasks-view-container');
  const waitingContainer = document.getElementById('waiting-list-container');
  
  let filtered = this.state.tasks;
  if (this.taskFilter === 'critical') filtered = filtered.filter(t => t.priority === 'critical' && t.status !== 'completed');
  else if (this.taskFilter === 'next') filtered = filtered.filter(t => t.status === 'next');
  else if (this.taskFilter === 'in_progress') filtered = filtered.filter(t => t.status === 'in_progress');
  else if (this.taskFilter === 'completed') filtered = filtered.filter(t => t.status === 'completed');
  else if (this.taskFilter === 'all') filtered = filtered.filter(t => t.status !== 'completed');

  // Render HTML into both containers if they exist
  const html = (filtered.length === 0)
    ? '<div class="empty-state"><div class="empty-state__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div><div class="empty-state__title">No tasks</div><div class="empty-state__desc">Your pipeline is clear.</div></div>'
    : filtered.map(t => this.renderTaskCard(t)).join('');

  if (container) container.innerHTML = html;
  if (viewContainer) viewContainer.innerHTML = html;

  // Waiting / Blocked tab
  const waitingTasks = this.state.tasks.filter(t => t.status === 'waiting' || t.status === 'blocked');
  if (waitingContainer) {
    if (waitingTasks.length === 0) {
      waitingContainer.innerHTML = '<div class="empty-hint">No blocked or waiting tasks. Pipeline is clear!</div>';
    } else {
      waitingContainer.innerHTML = waitingTasks.map(t => this.renderTaskCard(t)).join('');
    }
  }

  // Bind checkboxes and card click across containers
  [container, viewContainer, waitingContainer].forEach(target => {
    if (!target) return;
    target.querySelectorAll('.task-checkbox').forEach(cb => {
      cb.addEventListener('change', async (e) => {
        e.stopPropagation();
        const id = e.target.dataset.taskId;
        const newStatus = e.target.checked ? 'completed' : 'next';
        await this.updateTask(id, { status: newStatus });
        await this.fetchTasks();
        await this.fetchOverview();
        if (this.fetchCalendar) await this.fetchCalendar();
      });
    });

    target.querySelectorAll('.task-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.task-checkbox')) return;
        const id = card.dataset.taskId;
        if (id && typeof this.openTaskDetail === 'function') {
          this.openTaskDetail(id);
        }
      });
      card.addEventListener('keydown', (e) => {
        if (e.target.closest('.task-checkbox')) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const id = card.dataset.taskId;
          if (id && typeof this.openTaskDetail === 'function') {
            this.openTaskDetail(id);
          }
        }
      });
    });
  });

  if (typeof this.renderKanbanBoard === 'function') {
    this.renderKanbanBoard();
  }
};

CommandDeck.prototype.renderTaskCard = function(t) {
  const isDone = t.status === 'completed';
  return `
    <div class="task-card ${isDone ? 'completed' : ''}" data-task-id="${t.id}" title="Click to view and edit task details" tabindex="0" role="button">
      <input type="checkbox" class="task-checkbox" data-task-id="${t.id}" ${isDone ? 'checked' : ''} title="Mark task complete / incomplete" />
      <div class="task-details">
        <div class="task-title-line">
          <span class="task-title">${escapeHtml(t.title)}</span>
          <span class="badge badge-${t.priority || 'medium'}">${escapeHtml(t.priority || 'medium')}</span>
        </div>
        <div class="task-meta-row">
          ${t.project_name ? `<span class="task-project"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>${escapeHtml(t.project_name)}</span><span>•</span>` : ''}
          ${t.due_at ? `<span class="task-due"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>Due ${escapeHtml(t.due_at)}</span><span>•</span>` : ''}
          <span>Status: ${escapeHtml(t.status)}</span>
        </div>
      </div>
    </div>
  `;
};

// ── Reminders ──────────────────────────────────────────────────────────────

CommandDeck.prototype.renderReminders = function() {
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
};

CommandDeck.prototype.renderReminderCard = function(r) {
  const channel = r.channel || 'all';
  const channelLabels = {
    all: 'All Channels',
    telegram: 'Telegram',
    discord: 'Discord',
    email: 'Email',
    sms: 'Phone/SMS',
    desktop: 'Desktop'
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
          <span><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> ${formatTime(r.remind_at) || r.remind_at}</span>
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
};

CommandDeck.prototype.renderProjects = function() {
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
};

// ── Kanban Board ────────────────────────────────────────────────────────────

const KANBAN_COLUMNS = [
  { key: 'backlog',     label: 'Backlog',     color: 'var(--text-3)' },
  { key: 'next',        label: 'Next',        color: 'var(--cyan)' },
  { key: 'in_progress', label: 'In Progress', color: 'var(--amber)' },
  { key: 'blocked',     label: 'Blocked',     color: 'var(--rose)' },
  { key: 'completed',   label: 'Completed',   color: 'var(--emerald)' }
];

CommandDeck.prototype.renderKanbanBoard = function() {
  const container = document.getElementById('task-kanban-container');
  if (!container) return;

  const tasks = this.state.tasks || [];

  container.innerHTML = `<div class="kanban-board">${KANBAN_COLUMNS.map(col => {
    const colTasks = tasks.filter(t => {
      if (col.key === 'backlog') return !['next','in_progress','blocked','completed'].includes(t.status);
      return t.status === col.key;
    });
    return `
      <div class="kanban-column" data-status="${col.key}">
        <div class="kanban-column__header">
          <span class="kanban-column__dot" style="background:${col.color}"></span>
          <span class="kanban-column__title">${col.label}</span>
          <span class="kanban-column__count">${colTasks.length}</span>
        </div>
        <div class="kanban-column__body" data-status="${col.key}">
          ${colTasks.map(t => `
            <div class="kanban-card" draggable="true" data-task-id="${t.id}">
              <div class="kanban-card__title">${escapeHtml(t.title)}</div>
              <div class="kanban-card__meta">
                <span class="badge badge-${t.priority || 'medium'}">${t.priority || 'medium'}</span>
                ${t.project_name ? `<span class="kanban-card__project">${escapeHtml(t.project_name)}</span>` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }).join('')}</div>`;

  this.bindKanbanDragDrop();
};

CommandDeck.prototype.bindKanbanDragDrop = function() {
  const container = document.getElementById('task-kanban-container');
  if (!container) return;

  let draggedId = null;

  container.querySelectorAll('.kanban-card').forEach(card => {
    card.addEventListener('dragstart', (e) => {
      draggedId = card.dataset.taskId;
      card.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });
    card.addEventListener('dragend', () => {
      card.classList.remove('dragging');
      draggedId = null;
      container.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
    });
    card.addEventListener('click', () => {
      if (card.classList.contains('dragging')) return;
      const id = card.dataset.taskId;
      if (id && typeof this.openTaskDetail === 'function') {
        this.openTaskDetail(id);
      }
    });
  });

  container.querySelectorAll('.kanban-column__body').forEach(col => {
    col.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      col.classList.add('drag-over');
    });
    col.addEventListener('dragleave', () => col.classList.remove('drag-over'));
    col.addEventListener('drop', async (e) => {
      e.preventDefault();
      col.classList.remove('drag-over');
      if (!draggedId) return;
      const newStatus = col.dataset.status;
      await this.updateTask(draggedId, { status: newStatus });
      await this.fetchTasks();
      await this.fetchOverview();
    });
  });
};

// ── View Toggle (List / Kanban) ─────────────────────────────────────────────

CommandDeck.prototype.initTaskViewToggle = function() {
  const tabList = document.getElementById('tab-task-list');
  const tabKanban = document.getElementById('tab-task-kanban');
  const listContainer = document.getElementById('tasks-view-container');
  const kanbanContainer = document.getElementById('task-kanban-container');
  if (!tabList || !tabKanban) return;

  tabList.addEventListener('click', () => {
    tabList.classList.add('active'); tabKanban.classList.remove('active');
    if (listContainer) listContainer.style.display = '';
    if (kanbanContainer) kanbanContainer.style.display = 'none';
  });
  tabKanban.addEventListener('click', () => {
    tabKanban.classList.add('active'); tabList.classList.remove('active');
    if (listContainer) listContainer.style.display = 'none';
    if (kanbanContainer) kanbanContainer.style.display = '';
    this.renderKanbanBoard();
  });
};

// ── Smart Natural Language Task Input ───────────────────────────────────────

CommandDeck.prototype.parseSmartTaskInput = function(raw) {
  let title = raw.trim();
  let priority = 'medium';
  let project = null;
  let due_at = null;

  // Extract priority: !critical, !high, !low
  const priMatch = title.match(/!(\w+)/);
  if (priMatch) {
    const p = priMatch[1].toLowerCase();
    if (['critical','high','medium','low'].includes(p)) priority = p;
    title = title.replace(priMatch[0], '').trim();
  }

  // Extract project: #projectname
  const projMatch = title.match(/#(\S+)/);
  if (projMatch) {
    project = projMatch[1];
    title = title.replace(projMatch[0], '').trim();
  }

  // Extract due dates: "tomorrow", "today", or datetime patterns
  const tmrw = /\btomorrow\b/i;
  const today = /\btoday\b/i;
  const timeMatch = title.match(/(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i);

  if (tmrw.test(title)) {
    const d = new Date(); d.setDate(d.getDate() + 1);
    if (timeMatch) { const t = this.parseTimeStr(timeMatch[1]); if (t) { d.setHours(t.h, t.m, 0); } }
    else { d.setHours(9, 0, 0); }
    due_at = d.toISOString();
    title = title.replace(tmrw, '').replace(timeMatch ? timeMatch[0] : '', '').trim();
  } else if (today.test(title)) {
    const d = new Date();
    if (timeMatch) { const t = this.parseTimeStr(timeMatch[1]); if (t) { d.setHours(t.h, t.m, 0); } }
    due_at = d.toISOString();
    title = title.replace(today, '').replace(timeMatch ? timeMatch[0] : '', '').trim();
  }

  return { title, priority, project, due_at };
};

CommandDeck.prototype.parseTimeStr = function(str) {
  if (!str) return null;
  const m = str.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
  if (!m) return null;
  let h = parseInt(m[1], 10);
  const min = m[2] ? parseInt(m[2], 10) : 0;
  if (m[3]) {
    if (m[3].toLowerCase() === 'pm' && h < 12) h += 12;
    if (m[3].toLowerCase() === 'am' && h === 12) h = 0;
  }
  return { h, m: min };
};

CommandDeck.prototype.initSmartTaskInput = function() {
  const input = document.getElementById('task-smart-input');
  const btn = document.getElementById('task-smart-submit');
  if (!input) return;

  const submit = async () => {
    const raw = input.value.trim();
    if (!raw) return;
    const parsed = this.parseSmartTaskInput(raw);
    if (!parsed.title) return;
    await this.createTask(parsed);
    input.value = '';
    await this.fetchTasks();
    await this.fetchOverview();
  };

  if (btn) btn.addEventListener('click', submit);
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') submit(); });
};
