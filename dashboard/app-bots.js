/**
 * Bot Management Page — Grokbot-style interface
 * Vertical stripe of agents on left, chat panel on right.
 * Inline chat (no modal).
 */
import { escapeHtml } from './app-core.js';

class BotsPage {
  constructor() {
    this.bots = [];
    this.currentBot = null;
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
    const stripe = document.getElementById('bots-stripe');
    const countEl = document.getElementById('bots-count');
    if (!stripe) return;

    if (countEl) countEl.textContent = this.bots.length;

    if (this.bots.length === 0) {
      stripe.innerHTML = `
        <div class="bot-empty">
          <div class="bot-empty-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/></svg></div>
          <div class="bot-empty-title">No Agents Configured</div>
          <div class="bot-empty-desc">Add your first bot to get started.</div>
        </div>
      `;
      return;
    }

    stripe.innerHTML = this.bots.map(bot => this.renderStripeItem(bot)).join('');
  }

  renderStripeItem(bot) {
    const statusClass = `bot-stripe-status--${bot.status || 'idle'}`;
    const isActive = this.currentBot && this.currentBot.id === bot.id ? ' active' : '';
    return `
      <div class="bot-stripe-item${isActive}" data-bot-id="${bot.id}" tabindex="0" role="button" aria-label="Chat with ${escapeHtml(bot.name)}">
        <div class="bot-stripe-avatar">${bot.avatar || '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20" height="20"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/></svg>'}</div>
        <div class="bot-stripe-info">
          <div class="bot-stripe-name">${escapeHtml(bot.name)}</div>
          <div class="bot-stripe-role">${escapeHtml(bot.role)}</div>
        </div>
        <div class="bot-stripe-status ${statusClass}" aria-label="Status: ${bot.status || 'idle'}"></div>
      </div>
    `;
  }

  bindEvents() {
    const stripe = document.getElementById('bots-stripe');
    if (!stripe) return;

    stripe.querySelectorAll('.bot-stripe-item').forEach(item => {
      item.addEventListener('click', () => {
        const botId = item.dataset.botId;
        this.openChat(botId);
      });
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const botId = item.dataset.botId;
          this.openChat(botId);
        }
      });
    });

    // Send button
    const sendBtn = document.getElementById('bot-chat-send');
    const input = document.getElementById('bot-chat-input');
    if (sendBtn && input) {
      const send = () => this.sendMessage();
      sendBtn.addEventListener('click', send);
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') send();
      });
    }
  }

  openChat(botId) {
    const bot = this.bots.find(b => b.id === botId);
    if (!bot) return;
    this.currentBot = bot;

    // Update stripe active state
    document.querySelectorAll('.bot-stripe-item').forEach(item => {
      item.classList.toggle('active', item.dataset.botId === botId);
    });

    // Show chat panel
    const emptyEl = document.getElementById('bots-chat-empty');
    const activeEl = document.getElementById('bots-chat-active');
    if (emptyEl) emptyEl.style.display = 'none';
    if (activeEl) activeEl.style.display = 'flex';

    // Set header info
    const avatarEl = document.getElementById('chat-bot-avatar');
    const nameEl = document.getElementById('chat-bot-name');
    const modelEl = document.getElementById('chat-bot-model');
    const statusDot = document.getElementById('chat-bot-status-dot');
    const statusText = document.getElementById('chat-bot-status-text');

    if (avatarEl) avatarEl.innerHTML = bot.avatar || '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20" height="20"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/></svg>';
    if (nameEl) nameEl.textContent = bot.name;
    if (modelEl) modelEl.textContent = `${bot.model} • ${bot.provider}`;
    if (statusDot) statusDot.className = `bot-status-dot bot-status-dot--${bot.status || 'idle'}`;
    if (statusText) statusText.textContent = bot.status || 'idle';

    // Render initial greeting
    const messagesContainer = document.getElementById('bot-chat-messages');
    if (messagesContainer) {
      messagesContainer.innerHTML = `
        <div class="bot-message bot-message--bot">
          Hello! I'm ${escapeHtml(bot.name)}. How can I help you today?
          <div class="bot-message-time">Just now</div>
        </div>
      `;
    }

    // Focus input
    setTimeout(() => document.getElementById('bot-chat-input')?.focus(), 50);
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
    userMsg.innerHTML = `${escapeHtml(message)}<div class="bot-message-time">Just now</div>`;
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

      typing.remove();

      const botMsg = document.createElement('div');
      botMsg.className = 'bot-message bot-message--bot';
      botMsg.innerHTML = `${escapeHtml(data.reply)}<div class="bot-message-time">${this.formatTime(data.timestamp)}</div>`;
      messagesContainer.appendChild(botMsg);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    } catch (e) {
      typing.remove();
      console.error('Failed to send message:', e);
      const errMsg = document.createElement('div');
      errMsg.className = 'bot-message bot-message--bot';
      errMsg.innerHTML = `<span style="color:var(--accent-rose)">Error: Could not reach agent.</span>`;
      messagesContainer.appendChild(errMsg);
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
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
  window.botsPage = new BotsPage();
});