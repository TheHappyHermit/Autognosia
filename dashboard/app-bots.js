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
    
    // Auto-select first bot if none selected
    if (this.bots.length > 0 && !this.currentBot) {
      this.openChat(this.bots[0].id);
    }
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

  async openChat(botId) {
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

    // Load persistent chat history from API
    const messagesContainer = document.getElementById('bot-chat-messages');
    if (messagesContainer) {
      messagesContainer.innerHTML = '';
      try {
        const res = await fetch(`/api/bots/${botId}/history`);
        if (res.ok) {
          const history = await res.json();
          if (history.messages && history.messages.length > 0) {
            history.messages.forEach(msg => {
              const div = document.createElement('div');
              div.className = `bot-message bot-message--${msg.role === 'user' ? 'user' : 'bot'}`;
              div.innerHTML = `${escapeHtml(msg.content)}<div class="bot-message-time">${this.formatTime(msg.timestamp)}</div>`;
              messagesContainer.appendChild(div);
            });
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
          } else {
            messagesContainer.innerHTML = `
              <div class="bot-message bot-message--bot">
                Hello! I'm ${escapeHtml(bot.name)}. How can I help you today?
                <div class="bot-message-time">Just now</div>
              </div>
            `;
          }
        }
      } catch (e) {
        messagesContainer.innerHTML = `
          <div class="bot-message bot-message--bot">
            Hello! I'm ${escapeHtml(bot.name)}. How can I help you today?
            <div class="bot-message-time">Just now</div>
          </div>
        `;
      }
    }

    // Bind clear history button
    const clearBtn = document.getElementById('bot-chat-clear');
    if (clearBtn) {
      clearBtn.onclick = async () => {
        try { await fetch(`/api/bots/${botId}/history`, { method: 'DELETE' }); } catch(e) { /* ignore */ }
        if (messagesContainer) {
          messagesContainer.innerHTML = `
            <div class="bot-message bot-message--bot">
              History cleared. How can I help you?
              <div class="bot-message-time">Just now</div>
            </div>
          `;
        }
      };
    }

    // Bind voice input (Speech-to-Text)
    this.initVoiceInput();

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

    // Bot response container
    const botMsg = document.createElement('div');
    botMsg.className = 'bot-message bot-message--bot';
    
    // Tools sub-container & text response element
    const toolsContainer = document.createElement('div');
    toolsContainer.className = 'bot-tools-container';
    const textSpan = document.createElement('span');
    textSpan.className = 'bot-reply-text';
    
    // Show initial typing indicator inside bot bubble
    textSpan.innerHTML = '<span class="bot-typing-dots"><span>.</span><span>.</span><span>.</span></span>';
    
    const timeDiv = document.createElement('div');
    timeDiv.className = 'bot-message-time';
    timeDiv.textContent = 'Just now';

    botMsg.appendChild(toolsContainer);
    botMsg.appendChild(textSpan);
    botMsg.appendChild(timeDiv);
    messagesContainer.appendChild(botMsg);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    let accumulatedText = '';
    let hasReceivedTokens = false;

    try {
      const res = await fetch(`/api/bots/${this.currentBot.id}/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split('\n\n');
        buffer = lines.pop(); // keep partial

        for (const block of lines) {
          if (!block.trim()) continue;
          let eventType = 'message';
          let eventData = '';

          for (const line of block.split('\n')) {
            if (line.startsWith('event: ')) {
              eventType = line.substring(7).trim();
            } else if (line.startsWith('data: ')) {
              eventData = line.substring(6).trim();
            }
          }

          if (!eventData) continue;
          let parsed;
          try {
            parsed = JSON.parse(eventData);
          } catch (e) {
            continue;
          }

          if (eventType === 'tool') {
            const toolEl = document.createElement('details');
            toolEl.className = 'bot-tool-trace';
            toolEl.innerHTML = `
              <summary><span class="tool-icon">🛠️</span> <strong>${escapeHtml(parsed.tool || 'Tool Execution')}</strong></summary>
              <pre>${escapeHtml(parsed.content || '')}</pre>
            `;
            toolsContainer.appendChild(toolEl);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
          } else if (eventType === 'token') {
            if (!hasReceivedTokens) {
              textSpan.innerHTML = '';
              hasReceivedTokens = true;
            }
            accumulatedText += (parsed.content || '');
            textSpan.innerHTML = escapeHtml(accumulatedText)
              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
              .replace(/`(.*?)`/g, '<code>$1</code>')
              .replace(/\n/g, '<br>');
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
          } else if (eventType === 'done') {
            if (!hasReceivedTokens && parsed.reply) {
              accumulatedText = parsed.reply;
              textSpan.innerHTML = escapeHtml(accumulatedText)
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/`(.*?)`/g, '<code>$1</code>')
                .replace(/\n/g, '<br>');
            }
            if (parsed.timestamp) {
              timeDiv.textContent = this.formatTime(parsed.timestamp);
            }
          } else if (eventType === 'error') {
            textSpan.innerHTML = `<span style="color:var(--danger)">Error: ${escapeHtml(parsed.error || 'Unknown error')}</span>`;
          }
        }
      }
    } catch (e) {
      console.warn('Stream failed or not supported, falling back to message endpoint:', e);
      try {
        const fallbackRes = await fetch(`/api/bots/${this.currentBot.id}/message`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message })
        });
        const fallbackData = await fallbackRes.json();
        textSpan.innerHTML = escapeHtml(fallbackData.reply || '')
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/`(.*?)`/g, '<code>$1</code>')
          .replace(/\n/g, '<br>');
        timeDiv.textContent = this.formatTime(fallbackData.timestamp);
      } catch (fallbackErr) {
        textSpan.innerHTML = `<span style="color:var(--danger)">Error: Could not reach agent.</span>`;
      }
    }
  }

  initVoiceInput() {
    const micBtn = document.getElementById('bot-chat-mic');
    const input = document.getElementById('bot-chat-input');
    if (!micBtn || !input) return;

    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
      micBtn.title = 'Speech-to-Text not supported in this browser';
      micBtn.style.opacity = '0.5';
      return;
    }

    if (this.recognition) return; // already initialized

    this.recognition = new SpeechRec();
    this.recognition.continuous = false;
    this.recognition.interimResults = true;
    this.isRecording = false;

    this.recognition.onstart = () => {
      this.isRecording = true;
      micBtn.style.background = 'var(--rose, #ef4444)';
      micBtn.style.color = '#fff';
      micBtn.title = 'Listening... Click to stop';
    };

    this.recognition.onresult = (e) => {
      let interim = '';
      let final = '';
      for (let i = e.resultIndex; i < e.results.length; ++i) {
        if (e.results[i].isFinal) {
          final += e.results[i][0].transcript;
        } else {
          interim += e.results[i][0].transcript;
        }
      }
      input.value = (final || interim);
    };

    this.recognition.onerror = (e) => {
      console.warn('Speech recognition error:', e.error);
      this.stopVoiceInput();
    };

    this.recognition.onend = () => {
      this.stopVoiceInput();
    };

    micBtn.onclick = () => {
      if (this.isRecording) {
        this.recognition.stop();
      } else {
        try {
          this.recognition.start();
        } catch (err) {
          console.warn('Speech start error:', err);
        }
      }
    };
  }

  stopVoiceInput() {
    this.isRecording = false;
    const micBtn = document.getElementById('bot-chat-mic');
    if (micBtn) {
      micBtn.style.background = 'var(--bg-secondary)';
      micBtn.style.color = '';
      micBtn.title = 'Voice Input (Speech-to-Text)';
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

// Initialize on load with readyState check
function bootBotsPage() {
  if (!window.botsPage) {
    window.botsPage = new BotsPage();
  }
  window.botsPage.init();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => setTimeout(bootBotsPage, 0));
} else {
  setTimeout(bootBotsPage, 0);
}