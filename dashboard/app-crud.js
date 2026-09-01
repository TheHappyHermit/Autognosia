import { CommandDeck } from './app-core.js';

  // ── Task, Reminder & Intention CRUD Operations ────────────────────────────
  CommandDeck.prototype.createTask = async function(
    await fetch(`${this.apiBase}/api/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  }

  CommandDeck.prototype.updateTask = async function(
    await fetch(`${this.apiBase}/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  }

  CommandDeck.prototype.createReminder = async function(
    await fetch(`${this.apiBase}/api/reminders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  }

  CommandDeck.prototype.snoozeReminder = async function(
    await fetch(`${this.apiBase}/api/reminders/${remId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'snooze', snooze_minutes: minutes })
    });
  }

  CommandDeck.prototype.dismissReminder = async function(
    await fetch(`${this.apiBase}/api/reminders/${remId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'sent' })
    });
  }

  CommandDeck.prototype.createIntention = async function(
    await fetch(`${this.apiBase}/api/intentions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  }


  // ── Hermes AI Copilot Chat ────────────────────────────────────────────────
  CommandDeck.prototype.sendChatMessage = async function(
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

      CommandDeck.prototype.if = function(res.ok) {
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
        CommandDeck.prototype.if = function(data.refresh_needed) {
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
  CommandDeck.prototype.openCreateModal = function(
    const select = document.getElementById('create-type');
    select.value = defaultType;
    document.getElementById('fields-task').style.display = defaultType === 'task' ? 'block' : 'none';
    document.getElementById('fields-intention').style.display = defaultType === 'task' ? 'none' : 'block';
    document.getElementById('modal-create-item').classList.add('open');
  }

  CommandDeck.prototype.closeCreateModal = function(
    document.getElementById('modal-create-item').classList.remove('open');
    document.getElementById('form-create-item').reset();
  }


