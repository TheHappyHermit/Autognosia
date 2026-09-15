import { CommandDeck } from './app-core.js';

// ── Task, Reminder & Intention CRUD Operations ────────────────────────────

CommandDeck.prototype.createTask = async function(data) {
  await fetch(`${this.apiBase}/api/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
};

CommandDeck.prototype.updateTask = async function(id, data) {
  await fetch(`${this.apiBase}/api/tasks/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
};

CommandDeck.prototype.createReminder = async function(data) {
  await fetch(`${this.apiBase}/api/reminders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
};

CommandDeck.prototype.snoozeReminder = async function(remId, minutes) {
  await fetch(`${this.apiBase}/api/reminders/${remId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'snooze', snooze_minutes: minutes })
  });
};

CommandDeck.prototype.dismissReminder = async function(remId) {
  await fetch(`${this.apiBase}/api/reminders/${remId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'sent' })
  });
};

CommandDeck.prototype.createIntention = async function(data) {
  await fetch(`${this.apiBase}/api/intentions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
};

// ── Hermes AI Copilot Chat ────────────────────────────────────────────────

CommandDeck.prototype.sendChatMessage = async function(text) {
  const container = document.getElementById('chat-messages-container');
  if (!container) return;
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
};

CommandDeck.prototype.deleteTask = async function(id) {
  await fetch(`${this.apiBase}/api/tasks/${id}`, {
    method: 'DELETE'
  });
};

// ── Universal Create Modal ──────────────────────────────────────────────────

CommandDeck.prototype.openCreateModal = function(defaultType = 'task') {
  const modal = document.getElementById('modal-create-item');
  if (!modal) return;

  const select = document.getElementById('create-type');
  if (select) select.value = defaultType;

  this.toggleCreateModalFields(defaultType);

  modal.style.display = 'flex';
  requestAnimationFrame(() => modal.classList.add('open'));

  // Auto-focus first field
  setTimeout(() => {
    if (defaultType === 'task') document.getElementById('task-title')?.focus();
    else if (defaultType === 'intention') document.getElementById('intention-cue')?.focus();
    else if (defaultType === 'reminder') document.getElementById('reminder-title')?.focus();
  }, 50);
};

CommandDeck.prototype.closeCreateModal = function() {
  const modal = document.getElementById('modal-create-item');
  if (!modal) return;
  modal.classList.remove('open');
  setTimeout(() => { modal.style.display = 'none'; }, 200);
  document.getElementById('form-create-item')?.reset();
};

CommandDeck.prototype.toggleCreateModalFields = function(type) {
  const taskFields = document.getElementById('fields-task');
  const intentionFields = document.getElementById('fields-intention');
  const reminderFields = document.getElementById('fields-reminder');

  if (taskFields) taskFields.style.display = type === 'task' ? 'block' : 'none';
  if (intentionFields) intentionFields.style.display = type === 'intention' ? 'block' : 'none';
  if (reminderFields) reminderFields.style.display = type === 'reminder' ? 'block' : 'none';

  // Toggle required attributes so browser validation works properly
  const taskTitle = document.getElementById('task-title');
  if (taskTitle) taskTitle.required = (type === 'task');

  const cue = document.getElementById('intention-cue');
  const action = document.getElementById('intention-action');
  if (cue) cue.required = (type === 'intention');
  if (action) action.required = (type === 'intention');

  const remTitle = document.getElementById('reminder-title');
  const remTime = document.getElementById('reminder-time');
  if (remTitle) remTitle.required = (type === 'reminder');
  if (remTime) remTime.required = (type === 'reminder');
};

CommandDeck.prototype.initCreateModal = function() {
  const select = document.getElementById('create-type');
  if (select) {
    select.addEventListener('change', (e) => {
      this.toggleCreateModalFields(e.target.value);
    });
  }

  const closeBtn = document.getElementById('create-close');
  const cancelBtn = document.getElementById('create-cancel');
  const backdrop = document.getElementById('create-backdrop');

  if (closeBtn) closeBtn.onclick = () => this.closeCreateModal();
  if (cancelBtn) cancelBtn.onclick = () => this.closeCreateModal();
  if (backdrop) backdrop.onclick = () => this.closeCreateModal();

  const form = document.getElementById('form-create-item');
  if (form) {
    form.onsubmit = async (e) => {
      e.preventDefault();
      const type = document.getElementById('create-type')?.value || 'task';

      try {
        if (type === 'task') {
          const title = document.getElementById('task-title')?.value.trim();
          if (!title) return;
          const desc = document.getElementById('task-desc')?.value.trim() || '';
          const priority = document.getElementById('task-priority')?.value || 'medium';
          const dueEl = document.getElementById('task-due');
          const due_at = dueEl?.value ? new Date(dueEl.value).toISOString() : null;

          await this.createTask({ title, description: desc, priority, due_at });
          if (this.showToast) this.showToast(`Task created: "${title}"`, 'success');
          await this.fetchTasks();
        } else if (type === 'intention') {
          const cue = document.getElementById('intention-cue')?.value.trim();
          const action = document.getElementById('intention-action')?.value.trim();
          if (!cue || !action) return;

          await this.createIntention({ cue, action, status: 'active' });
          if (this.showToast) this.showToast(`Intention registered`, 'success');
          await this.fetchIntentions();
        } else if (type === 'reminder') {
          const title = document.getElementById('reminder-title')?.value.trim();
          const timeEl = document.getElementById('reminder-time');
          const channel = document.getElementById('reminder-channel')?.value || 'all';
          if (!title) return;
          const remind_at = timeEl?.value ? new Date(timeEl.value).toISOString() : null;

          await this.createReminder({ title, remind_at, channel });
          if (this.showToast) this.showToast(`Reminder created`, 'success');
          await this.fetchReminders();
        }

        await this.fetchOverview();
        this.closeCreateModal();
      } catch (err) {
        console.error('Error creating item:', err);
        alert(`Failed to create ${type}: ${err.message}`);
      }
    };
  }
};
