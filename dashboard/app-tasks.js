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

  // Bind checkboxes across containers
  [container, viewContainer].forEach(target => {
    if (!target) return;
    target.querySelectorAll('.task-checkbox').forEach(cb => {
      cb.addEventListener('change', async (e) => {
        const id = e.target.dataset.taskId;
        const newStatus = e.target.checked ? 'completed' : 'next';
        await this.updateTask(id, { status: newStatus });
        await this.fetchTasks();
        await this.fetchOverview();
      });
    });
  });
};

CommandDeck.prototype.renderTaskCard = function(t) {
  const isDone = t.status === 'completed';
  return `
    <div class="task-card ${isDone ? 'completed' : ''}" data-task-id="${t.id}">
      <input type="checkbox" class="task-checkbox" data-task-id="${t.id}" ${isDone ? 'checked' : ''} />
      <div class="task-details">
        <div class="task-title-line">
          <span class="task-title">${escapeHtml(t.title)}</span>
          <span class="badge badge-${t.priority || 'medium'}">${t.priority}</span>
        </div>
        <div class="task-meta-row">
          ${t.project_name ? `<span class="task-project"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>${escapeHtml(t.project_name)}</span><span>•</span>` : ''}
          ${t.due_at ? `<span class="task-due"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>Due ${escapeHtml(t.due_at)}</span><span>•</span>` : ''}
          <span>Status: ${t.status}</span>
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
