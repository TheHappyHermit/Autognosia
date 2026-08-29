/**
 * Bot Management Page — Grokbot-style interface
 * Handles bot grid rendering, chat modal, and message sending.
 */
class BotsPage {
  constructor() {
    this.bots = [];
    this.currentBot = null;
    this.chatOpen = false;
  }

  async init() {
    await this.loadBots();
    this.render();
    this.bindEvents();
  }

  async loadBots() {
    try {
      const res = await fetch('/api/bots');
      const data = await res.json();
      this.bots = data.bots || [];
    } catch (e) {
      console.error('Failed to load bots:', e);
      this.bots = [];
    }
  }

  render() {
    const container = document.getElementById('bots-container');
    if (!container) return;

    if (this.bots.length === 0) {
      container.innerHTML = this.renderEmptyState();
      return;
    }

    container.innerHTML = `
      <div class="section-title">Configured Agents</div>
      <div class="bot-grid">
        ${this.bots.map(bot => this.renderBotCard(bot)).join('')}
      </div>
    `;
  }

  renderBotCard(bot) {
    const statusClass = `bot-status-dot--${bot.status || 'idle'}`;
    const lastActivity = this.formatTime(bot.last_activity);
    return `
      <div class="bot-card" data-bot-id="${bot.id}" tabindex="0" role="button" aria-label="Open chat with ${bot.name}">
        <div class="bot-card-header">
          <div class="bot-avatar">${bot.avatar || '🤖'}</div>
          <div class="bot-info">
            <div class="bot-name">${this.escapeHtml(bot.name)}</div>
            <div class="bot-role">${this.escapeHtml(bot.role)}</div>
          </div>
          <div class="bot-status-dot ${statusClass}" aria-label="Status: ${bot.status}"></div>
        </div>
        <div class="bot-meta">
          <span class="bot-model-badge">${this.escapeHtml(bot.model)}</span>
          <span>${this.escapeHtml(bot.provider)}</span>
          <span class="bot-last-activity">${lastActivity}</span>
        </div>
        <div class="bot-actions">
          <button class="bot-action-btn" data-action="chat" data-bot-id="${bot.id}">💬 Chat</button>
          <button class="bot-action-btn" data-action="history" data-bot-id="${bot.id}">📜 History</button>
          <button class="bot-action-btn" data-action="config" data-bot-id="${bot.id}">⚙️ Config</button>
        </div>
      </div>
    `;
  }

  renderEmptyState() {
    return `
      <div class="bot-empty">
        <div class="bot-empty-icon">🤖</div>
        <div class="bot-empty-title">No Agents Configured</div>
        <div class="bot-empty-desc">Add your first bot to get started. Connect your Hermes profiles or add a custom agent.</div>
        <button class="btn btn--primary" onclick="document.getElementById('add-bot-modal')?.showModal()">+ Add Bot</button>
      </div>
    `;
  }

  bindEvents() {
    // Bot card clicks
    document.querySelectorAll('.bot-card').forEach(card => {
      card.addEventListener('click', (e) => {
        const botId = card.dataset.botId;
        const action = e.target.dataset.action;
        if (action === 'chat') {
          this.openChat(botId);
        } else if (action === 'history') {
          this.viewHistory(botId);
        } else if (action === 'config') {
          this.configureBot(botId);
        } else {
          this.openChat(botId);
        }
      });
    });
  }

  async openChat(botId) {
    const bot = this.bots.find(b => b.id === botId);
    if (!bot) return;
    this.currentBot = bot;
    this.chatOpen = true;

    // Create modal
    const modal = document.createElement('div');
    modal.className = 'bot-chat-overlay open';
    modal.id = 'bot-chat-overlay';
    modal.innerHTML = `
      <div class="bot-chat" role="dialog" aria-modal="true" aria-label="Chat with ${this.escapeHtml(bot.name)}">
        <div class="bot-chat-header">
          <div class="bot-avatar">${bot.avatar || '🤖'}</div>
          <div class="bot-chat-header-info">
            <div class="bot-chat-header-name">${this.escapeHtml(bot.name)}</div>
            <div class="bot-chat-header-model">${this.escapeHtml(bot.model)} • ${this.escapeHtml(bot.provider)}</div>
          </div>
          <button class="bot-chat-close" aria-label="Close chat">✕</button>
        </div>
        <div class="bot-chat-messages" id="bot-chat-messages">
          <div class="bot-message bot-message--bot">
            Hello! I'm ${this.escapeHtml(bot.name)}. How can I help you today?
            <div class="bot-message-time">Just now</div>
          </div>
        </div>
        <div class="bot-token-counter">0 tokens</div>
        <div class="bot-quick-prompts">
          <button class="bot-quick-prompt" data-prompt="What can you do?">What can you do?</button>
          <button class="bot-quick-prompt" data-prompt="Help me with a task">Help with task</button>
          <button class="bot-quick-prompt" data-prompt="Tell me a joke">Tell me a joke</button>
        </div>
        <div class="bot-chat-input-bar">
          <input type="text" class="bot-chat-input" id="bot-chat-input" placeholder="Type a message..." aria-label="Message" />
          <button class="bot-chat-send" id="bot-chat-send" aria-label="Send">➤</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Focus input
    setTimeout(() => document.getElementById('bot-chat-input')?.focus(), 100);

    // Close handlers
    modal.querySelector('.bot-chat-close').addEventListener('click', () => this.closeChat());
    modal.addEventListener('click', (e) => {
      if (e.target === modal) this.closeChat();
    });

    // Send handler
    const sendBtn = document.getElementById('bot-chat-send');
    const input = document.getElementById('bot-chat-input');

    const send = () => this.sendMessage();
    sendBtn.addEventListener('click', send);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') send();
    });

    // Quick prompts
    modal.querySelectorAll('.bot-quick-prompt').forEach(btn => {
      btn.addEventListener('click', () => {
        input.value = btn.dataset.prompt;
        this.sendMessage();
      });
    });
  }

  closeChat() {
    const modal = document.getElementById('bot-chat-overlay');
    if (modal) {
      modal.classList.remove('open');
      setTimeout(() => modal.remove(), 250);
    }
    this.chatOpen = false;
    this.currentBot = null;
  }

  async sendMessage() {
    const input = document.getElementById('bot-chat-input');
    const message = input.value.trim();
    if (!message || !this.currentBot) return;

    input.value = '';
    const messagesContainer = document.getElementById('bot-chat-messages');

    // Add user message
    const userMsg = document.createElement('div');
    userMsg.className = 'bot-message bot-message--user';
    userMsg.innerHTML = `${this.escapeHtml(message)}<div class="bot-message-time">Just now</div>`;
    messagesContainer.appendChild(userMsg);

    // Show typing indicator
    const typing = document.createElement('div');
    typing.className = 'bot-typing';
    typing.id = 'bot-typing';
    typing.innerHTML = '<div class="bot-typing-dot"></div><div class="bot-typing-dot"></div><div class="bot-typing-dot"></div>';
    messagesContainer.appendChild(typing);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    try {
      const res = await fetch(`/api/bots/${this.currentBot.id}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });
      const data = await res.json();

      // Remove typing
      typing.remove();

      // Add bot response
      const botMsg = document.createElement('div');
      botMsg.className = 'bot-message bot-message--bot';
      botMsg.innerHTML = `${this.escapeHtml(data.reply)}<div class="bot-message-time">${this.formatTime(data.timestamp)}</div>`;
      messagesContainer.appendChild(botMsg);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    } catch (e) {
      typing.remove();
      console.error('Failed to send message:', e);
    }
  }

  async viewHistory(botId) {
    try {
      const res = await fetch(`/api/bots/${botId}/history`);
      const data = await res.json();
      // For now, just open chat (history is empty)
      this.openChat(botId);
    } catch (e) {
      console.error('Failed to load history:', e);
    }
  }

  configureBot(botId) {
    // Placeholder: show toast
    if (window.showToast) {
      window.showToast(`Configure ${botId} — coming soon`);
    }
  }

  formatTime(iso) {
    if (!iso) return 'Never';
    try {
      const d = new Date(iso);
      const now = new Date();
      const diff = (now - d) / 1000;
      if (diff < 60) return 'Just now';
      if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
      if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
      return d.toLocaleDateString();
    } catch {
      return iso;
    }
  }

  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
  window.botsPage = new BotsPage();
});
