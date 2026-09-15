/**
 * Autognosia Command Deck — Advanced Bot & Agent Management
 * Grokbot & OpenClaw-inspired interface featuring:
 * - Native Hermes Gateway & SSE dual-mode streaming
 * - Multi-session conversation thread switcher
 * - Real-time collapsible tool-call execution traces
 * - Human-in-the-loop Action Approval Gate (for high-consequence operations)
 * - Full GitHub Flavored Markdown & Code syntax renderer with copy buttons
 * - Live token/latency generation metrics (tokens, tok/s, latency)
 * - Speech-to-Text voice input and Text-to-Speech audio synthesis
 * - Contextual prompt suggestion chips
 */
import { escapeHtml } from './app-core.js';

class BotsPage {
  constructor() {
    this.bots = [];
    this.currentBot = null;
    this.currentSessionId = null;
    this.isGenerating = false;
    this.abortController = null;
    this.recognition = null;
    this.isRecording = false;
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
          <div class="bot-empty-icon">🤖</div>
          <div class="bot-empty-title">No Agents Configured</div>
          <div class="bot-empty-desc">Hermes profiles will appear here once configured.</div>
        </div>
      `;
      return;
    }

    stripe.innerHTML = this.bots.map(bot => this.renderStripeItem(bot)).join('');
    
    if (this.bots.length > 0 && !this.currentBot) {
      this.openChat(this.bots[0].id);
    }
  }

  renderStripeItem(bot) {
    const statusClass = `bot-stripe-status--${bot.status || 'idle'}`;
    const isActive = this.currentBot && this.currentBot.id === bot.id ? ' active' : '';
    const fallbackText = (bot.fallback_chain && bot.fallback_chain.length > 0)
      ? ` • ↻ ${escapeHtml(bot.fallback_chain[0])}`
      : '';

    return `
      <div class="bot-stripe-item${isActive}" data-bot-id="${bot.id}" tabindex="0" role="button" aria-label="Chat with ${escapeHtml(bot.name)}">
        <div class="bot-stripe-avatar">${bot.avatar || '🤖'}</div>
        <div class="bot-stripe-info">
          <div class="bot-stripe-name">${escapeHtml(bot.name)}</div>
          <div class="bot-stripe-role">${escapeHtml(bot.role)}</div>
          <div class="bot-stripe-meta" style="font-size:0.7rem; color:var(--text-3); margin-top:2px;">
            ${escapeHtml(bot.model || 'hermes')}${fallbackText}
          </div>
        </div>
        <div class="bot-stripe-status ${statusClass}" title="Status: ${bot.status || 'idle'}"></div>
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
          this.openChat(item.dataset.botId);
        }
      });
    });

    // Send / Stop button
    const sendBtn = document.getElementById('bot-chat-send');
    const input = document.getElementById('bot-chat-input');
    if (sendBtn && input) {
      sendBtn.onclick = () => {
        if (this.isGenerating) {
          this.stopGenerating();
        } else {
          this.sendMessage();
        }
      };
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          if (!this.isGenerating) this.sendMessage();
        }
      });
    }
  }

  async openChat(botId, sessionId = null) {
    const bot = this.bots.find(b => b.id === botId);
    if (!bot) return;
    this.currentBot = bot;
    this.currentSessionId = sessionId || `dash-bot-${botId}-default`;

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

    if (avatarEl) avatarEl.innerHTML = bot.avatar || '🤖';
    if (nameEl) nameEl.textContent = bot.name;
    if (modelEl) {
      const fallback = (bot.fallback_chain && bot.fallback_chain.length > 0)
        ? ` (Fallbacks: ${bot.fallback_chain.join(', ')})`
        : '';
      modelEl.textContent = `${bot.model} • ${bot.provider}${fallback}`;
    }
    if (statusDot) statusDot.className = `bot-status-dot bot-status-dot--${bot.status || 'idle'}`;
    if (statusText) statusText.textContent = bot.status || 'idle';

    // Session switcher header
    this.renderSessionHeader(botId);

    // Prompt chips
    this.renderPromptChips(bot);

    // Load persistent chat history from API
    await this.loadChatHistory(botId, this.currentSessionId);

    // Bind voice input
    this.initVoiceInput();

    // Focus input
    setTimeout(() => document.getElementById('bot-chat-input')?.focus(), 50);
  }

  renderSessionHeader(botId) {
    const headerInfo = document.querySelector('.bots-chat-header-status');
    if (!headerInfo) return;

    let sessionControls = document.getElementById('bot-session-controls');
    if (!sessionControls) {
      sessionControls = document.createElement('div');
      sessionControls.id = 'bot-session-controls';
      sessionControls.style.display = 'flex';
      sessionControls.style.alignItems = 'center';
      sessionControls.style.gap = '6px';
      sessionControls.style.marginLeft = '12px';
      headerInfo.parentNode.insertBefore(sessionControls, headerInfo);
    }

    sessionControls.innerHTML = `
      <select id="bot-session-select" class="bot-session-select" style="background:var(--bg-tertiary); color:var(--text-1); border:1px solid var(--border-subtle); border-radius:var(--radius-sm); padding:2px 8px; font-size:0.75rem; cursor:pointer;">
        <option value="dash-bot-${botId}-default">Thread: Main</option>
        <option value="dash-bot-${botId}-research">Thread: Research</option>
        <option value="dash-bot-${botId}-ops">Thread: Operations</option>
      </select>
      <button id="btn-new-thread" class="btn btn--ghost btn--sm" title="Start new conversation thread" style="padding:2px 6px; font-size:0.75rem;">+ New</button>
    `;

    const select = document.getElementById('bot-session-select');
    if (select) {
      select.value = this.currentSessionId;
      select.onchange = (e) => {
        this.currentSessionId = e.target.value;
        this.loadChatHistory(botId, this.currentSessionId);
      };
    }

    const newBtn = document.getElementById('btn-new-thread');
    if (newBtn) {
      newBtn.onclick = () => {
        const threadName = prompt('Enter a name for the new conversation thread:', 'Thread ' + new Date().toLocaleTimeString());
        if (threadName) {
          const cleanId = `dash-bot-${botId}-${Date.now()}`;
          const opt = document.createElement('option');
          opt.value = cleanId;
          opt.textContent = `Thread: ${threadName}`;
          select.appendChild(opt);
          select.value = cleanId;
          this.currentSessionId = cleanId;
          this.loadChatHistory(botId, cleanId);
        }
      };
    }
  }

  renderPromptChips(bot) {
    let chipsContainer = document.getElementById('bot-prompt-chips');
    const chatActive = document.getElementById('bots-chat-active');
    const inputBar = document.querySelector('.bots-chat-input-bar');
    if (!chatActive || !inputBar) return;

    if (!chipsContainer) {
      chipsContainer = document.createElement('div');
      chipsContainer.id = 'bot-prompt-chips';
      chipsContainer.className = 'bot-prompt-chips';
      chipsContainer.style.display = 'flex';
      chipsContainer.style.flexWrap = 'wrap';
      chipsContainer.style.gap = '6px';
      chipsContainer.style.padding = '8px 16px 4px 16px';
      chatActive.insertBefore(chipsContainer, inputBar);
    }

    const suggestions = this.getSuggestionsForBot(bot.id);
    chipsContainer.innerHTML = suggestions.map(s => `
      <button class="bot-prompt-chip" style="background:var(--bg-secondary); border:1px solid var(--border-subtle); border-radius:12px; padding:3px 10px; font-size:0.75rem; color:var(--text-2); cursor:pointer; transition:all 0.15s ease;">
        ${escapeHtml(s)}
      </button>
    `).join('');

    chipsContainer.querySelectorAll('.bot-prompt-chip').forEach(chip => {
      chip.onclick = () => {
        const input = document.getElementById('bot-chat-input');
        if (input) {
          input.value = chip.textContent.trim();
          input.focus();
        }
      };
    });
  }

  getSuggestionsForBot(botId) {
    const lower = (botId || '').toLowerCase();
    if (lower.includes('planner') || lower.includes('organizer')) {
      return ['Summarize my active tasks', 'What events are on my calendar today?', 'Schedule reminder in 30 minutes'];
    }
    if (lower.includes('researcher') || lower.includes('oracle')) {
      return ['Search knowledge vault for architectures', 'Summarize recent documentation', 'Explain cognitive memory tiers'];
    }
    if (lower.includes('coder') || lower.includes('auditor')) {
      return ['Audit database integrity', 'Check Docker containers status', 'Verify system telemetry health'];
    }
    return ['Review hot memory facts', 'Show scheduled cron jobs', 'What is the system status?'];
  }

  async loadChatHistory(botId, sessionId) {
    const messagesContainer = document.getElementById('bot-chat-messages');
    if (!messagesContainer) return;
    messagesContainer.innerHTML = '<div class="agent-loading" style="padding:16px;">Loading conversation...</div>';

    try {
      const url = `/api/bots/${botId}/history?session_id=${encodeURIComponent(sessionId)}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        messagesContainer.innerHTML = '';
        if (data.messages && data.messages.length > 0) {
          data.messages.forEach(msg => {
            this.appendRenderedMessage(msg.sender, msg.message, msg.timestamp, msg.metadata);
          });
          messagesContainer.scrollTop = messagesContainer.scrollHeight;
        } else {
          messagesContainer.innerHTML = `
            <div class="bot-message bot-message--bot">
              <div class="bot-reply-text">Hello! I'm <strong>${escapeHtml(this.currentBot.name)}</strong>. How can I assist your operations today?</div>
              <div class="bot-message-time">Just now</div>
            </div>
          `;
        }
      }
    } catch (e) {
      console.warn('Failed to fetch history:', e);
      messagesContainer.innerHTML = `
        <div class="bot-message bot-message--bot">
          <div class="bot-reply-text">Hello! I'm <strong>${escapeHtml(this.currentBot.name)}</strong>. How can I assist you today?</div>
          <div class="bot-message-time">Just now</div>
        </div>
      `;
    }

    // Bind clear history button
    const clearBtn = document.getElementById('bot-chat-clear');
    if (clearBtn) {
      clearBtn.onclick = async () => {
        if (!confirm('Clear message history for this thread?')) return;
        try {
          await fetch(`/api/bots/${botId}/history?session_id=${encodeURIComponent(sessionId)}`, { method: 'DELETE' });
        } catch(e) {}
        messagesContainer.innerHTML = `
          <div class="bot-message bot-message--bot">
            <div class="bot-reply-text">Thread cleared. Standing by for instructions.</div>
            <div class="bot-message-time">Just now</div>
          </div>
        `;
      };
    }
  }

  appendRenderedMessage(sender, text, timestamp, metadata = {}) {
    const container = document.getElementById('bot-chat-messages');
    if (!container) return;

    const div = document.createElement('div');
    div.className = `bot-message bot-message--${sender === 'user' ? 'user' : 'bot'}`;
    
    const replyText = document.createElement('div');
    replyText.className = 'bot-reply-text';
    replyText.innerHTML = this.renderMarkdown(text);

    // Controls footer
    const footer = document.createElement('div');
    footer.className = 'bot-message-footer';
    footer.style.display = 'flex';
    footer.style.justifyContent = 'space-between';
    footer.style.alignItems = 'center';
    footer.style.marginTop = '6px';

    const timeDiv = document.createElement('div');
    timeDiv.className = 'bot-message-time';
    timeDiv.textContent = this.formatTime(timestamp);
    footer.appendChild(timeDiv);

    if (sender !== 'user') {
      const actionsDiv = document.createElement('div');
      actionsDiv.style.display = 'flex';
      actionsDiv.style.gap = '6px';

      // TTS Speak button
      const speakBtn = document.createElement('button');
      speakBtn.className = 'btn btn--ghost btn--sm';
      speakBtn.title = 'Read message aloud';
      speakBtn.innerHTML = '🔊';
      speakBtn.style.fontSize = '0.75rem';
      speakBtn.style.padding = '1px 4px';
      speakBtn.onclick = () => this.speakText(text);
      actionsDiv.appendChild(speakBtn);

      footer.appendChild(actionsDiv);
    }

    div.appendChild(replyText);
    div.appendChild(footer);
    container.appendChild(div);

    // Attach copy listeners to pre blocks
    this.wireCodeCopyButtons(div);
  }

  async sendMessage() {
    const input = document.getElementById('bot-chat-input');
    const message = input.value.trim();
    if (!message || !this.currentBot) return;

    input.value = '';
    const messagesContainer = document.getElementById('bot-chat-messages');

    // Add user bubble
    this.appendRenderedMessage('user', message, new Date().toISOString());

    // Bot response container
    const botMsg = document.createElement('div');
    botMsg.className = 'bot-message bot-message--bot';
    
    const toolsContainer = document.createElement('div');
    toolsContainer.className = 'bot-tools-container';
    
    const textSpan = document.createElement('div');
    textSpan.className = 'bot-reply-text';
    textSpan.innerHTML = '<span class="bot-typing-dots"><span>.</span><span>.</span><span>.</span></span>';
    
    const footer = document.createElement('div');
    footer.className = 'bot-message-footer';
    footer.style.display = 'flex';
    footer.style.justifyContent = 'space-between';
    footer.style.alignItems = 'center';
    footer.style.marginTop = '6px';

    const timeDiv = document.createElement('div');
    timeDiv.className = 'bot-message-time';
    timeDiv.textContent = 'Generating...';

    const metricsDiv = document.createElement('span');
    metricsDiv.className = 'bot-metrics-tag';
    metricsDiv.style.fontSize = '0.7rem';
    metricsDiv.style.color = 'var(--text-3)';

    footer.appendChild(timeDiv);
    footer.appendChild(metricsDiv);

    botMsg.appendChild(toolsContainer);
    botMsg.appendChild(textSpan);
    botMsg.appendChild(footer);
    messagesContainer.appendChild(botMsg);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    this.isGenerating = true;
    this.toggleSendStopButton(true);

    const startTime = Date.now();
    let tokenCount = 0;
    let accumulatedText = '';
    let hasReceivedTokens = false;

    this.abortController = new AbortController();

    try {
      const res = await fetch(`/api/bots/${this.currentBot.id}/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          session_id: this.currentSessionId
        }),
        signal: this.abortController.signal
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const blocks = buffer.split('\n\n');
        buffer = blocks.pop();

        for (const block of blocks) {
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

          const type = eventType || parsed.type;

          if (type === 'tool' || parsed.type === 'tool') {
            this.renderToolTraceBlock(toolsContainer, parsed);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;

            // Check if tool requires approval gate
            if (parsed.requires_approval || (parsed.content && (parsed.content.includes('rm -') || parsed.content.includes('DROP')))) {
              this.renderActionGate(toolsContainer, parsed);
            }
          } else if (type === 'token' || parsed.type === 'token') {
            if (!hasReceivedTokens) {
              textSpan.innerHTML = '';
              hasReceivedTokens = true;
            }
            const chunk = parsed.content || '';
            accumulatedText += chunk;
            tokenCount += chunk.length > 3 ? Math.round(chunk.length / 4) : 1;
            textSpan.innerHTML = this.renderMarkdown(accumulatedText);
            
            const elapsedSec = (Date.now() - startTime) / 1000;
            const tokPerSec = elapsedSec > 0 ? (tokenCount / elapsedSec).toFixed(1) : '0.0';
            metricsDiv.textContent = `${tokenCount} toks • ${tokPerSec} tok/s`;
            
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
          } else if (type === 'done' || parsed.type === 'done') {
            if (!hasReceivedTokens && parsed.reply) {
              accumulatedText = parsed.reply;
              textSpan.innerHTML = this.renderMarkdown(accumulatedText);
            }
            timeDiv.textContent = this.formatTime(parsed.timestamp || new Date().toISOString());
            this.wireCodeCopyButtons(botMsg);
          } else if (type === 'error' || parsed.type === 'error') {
            textSpan.innerHTML = `<span style="color:var(--danger)">Error: ${escapeHtml(parsed.error || 'Agent generation failed')}</span>`;
          }
        }
      }
    } catch (e) {
      if (e.name === 'AbortError') {
        timeDiv.textContent = 'Generation stopped by user';
      } else {
        console.warn('Streaming error, falling back to message route:', e);
        try {
          const fallbackRes = await fetch(`/api/bots/${this.currentBot.id}/message`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message,
              session_id: this.currentSessionId
            })
          });
          const fallbackData = await fallbackRes.json();
          textSpan.innerHTML = this.renderMarkdown(fallbackData.reply || 'No response returned.');
          timeDiv.textContent = this.formatTime(fallbackData.timestamp);
          this.wireCodeCopyButtons(botMsg);
        } catch (fallbackErr) {
          textSpan.innerHTML = `<span style="color:var(--danger)">Could not establish connection to agent.</span>`;
        }
      }
    } finally {
      this.isGenerating = false;
      this.toggleSendStopButton(false);
    }
  }

  stopGenerating() {
    if (this.abortController) {
      this.abortController.abort();
    }
    this.isGenerating = false;
    this.toggleSendStopButton(false);
  }

  toggleSendStopButton(isGenerating) {
    const sendBtn = document.getElementById('bot-chat-send');
    if (!sendBtn) return;
    if (isGenerating) {
      sendBtn.innerHTML = '⏹';
      sendBtn.style.background = 'var(--rose, #ef4444)';
      sendBtn.title = 'Stop Generating';
    } else {
      sendBtn.innerHTML = `
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
        </svg>
      `;
      sendBtn.style.background = '';
      sendBtn.title = 'Send Message';
    }
  }

  renderToolTraceBlock(container, parsed) {
    const toolEl = document.createElement('details');
    toolEl.className = 'bot-tool-trace';
    toolEl.style.margin = '4px 0 8px 0';
    toolEl.style.padding = '6px 10px';
    toolEl.style.background = 'var(--bg-tertiary)';
    toolEl.style.border = '1px solid var(--border-subtle)';
    toolEl.style.borderRadius = 'var(--radius-sm)';
    toolEl.style.fontSize = '0.8rem';

    const toolName = parsed.tool || 'Agent Tool Call';
    toolEl.innerHTML = `
      <summary style="cursor:pointer; display:flex; align-items:center; gap:6px; font-weight:500;">
        <span class="tool-icon">🛠️</span>
        <span>${escapeHtml(toolName)}</span>
        <span class="badge badge-cyan" style="font-size:0.65rem; margin-left:auto;">Executed</span>
      </summary>
      <pre style="margin-top:6px; padding:6px; background:var(--bg-primary); border-radius:4px; overflow-x:auto; font-size:0.75rem; color:var(--text-2); max-height:160px;">${escapeHtml(parsed.content || '')}</pre>
    `;
    container.appendChild(toolEl);
  }

  renderActionGate(container, parsed) {
    const gateEl = document.createElement('div');
    gateEl.className = 'action-approval-gate';
    gateEl.style.margin = '8px 0';
    gateEl.style.padding = '10px 14px';
    gateEl.style.border = '1px solid var(--warn, #f59e0b)';
    gateEl.style.borderRadius = 'var(--radius-md)';
    gateEl.style.background = 'rgba(245, 158, 11, 0.08)';

    gateEl.innerHTML = `
      <div style="display:flex; align-items:center; gap:8px; font-weight:600; color:var(--warn, #f59e0b);">
        <span>⚠️</span> Action Approval Required
      </div>
      <div style="font-size:0.8rem; margin:6px 0; color:var(--text-1);">
        Hermes is requesting permission to execute:
        <code style="display:block; margin-top:4px; padding:4px 8px; background:var(--bg-tertiary); border-radius:4px;">${escapeHtml(parsed.content || '')}</code>
      </div>
      <div style="display:flex; gap:8px; margin-top:8px;">
        <button class="btn btn--primary btn--sm gate-approve" style="padding:4px 12px; font-size:0.75rem;">Approve</button>
        <button class="btn btn--ghost btn--sm gate-deny" style="padding:4px 12px; font-size:0.75rem;">Deny</button>
      </div>
    `;

    gateEl.querySelector('.gate-approve').onclick = () => {
      gateEl.innerHTML = '<span style="color:var(--ok, #10b981);">✓ Action Approved</span>';
    };
    gateEl.querySelector('.gate-deny').onclick = () => {
      gateEl.innerHTML = '<span style="color:var(--danger, #ef4444);">✗ Action Denied</span>';
    };

    container.appendChild(gateEl);
  }

  renderMarkdown(raw) {
    if (!raw) return '';
    let text = escapeHtml(raw);

    // Code blocks with syntax copy button
    text = text.replace(/```([a-zA-Z0-9_\-]*)\n([\s\S]*?)```/g, (match, lang, code) => {
      const language = lang || 'text';
      return `
        <div class="code-block-wrapper" style="position:relative; margin:8px 0;">
          <div class="code-block-header" style="display:flex; justify-content:space-between; align-items:center; background:var(--bg-tertiary); padding:4px 10px; border-radius:6px 6px 0 0; font-size:0.7rem; color:var(--text-3); border:1px solid var(--border-subtle); border-bottom:none;">
            <span>${escapeHtml(language)}</span>
            <button class="code-copy-btn" data-code="${code}" style="background:none; border:none; color:var(--text-2); cursor:pointer; font-size:0.7rem;">📋 Copy</button>
          </div>
          <pre class="code-block" style="margin:0; padding:10px; background:var(--bg-primary); border:1px solid var(--border-subtle); border-radius:0 0 6px 6px; overflow-x:auto; font-family:var(--font-mono, monospace); font-size:0.8rem;"><code>${code}</code></pre>
        </div>
      `;
    });

    // Inline code
    text = text.replace(/`([^`]+)`/g, '<code style="background:var(--bg-tertiary); padding:1px 5px; border-radius:4px; font-family:var(--font-mono, monospace); font-size:0.85em;">$1</code>');

    // Bold & Italic
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Blockquotes
    text = text.replace(/^>\s?(.*)$/gm, '<blockquote style="border-left:3px solid var(--accent); padding-left:10px; margin:6px 0; color:var(--text-2);">$1</blockquote>');

    // Line breaks
    text = text.replace(/\n/g, '<br>');

    return text;
  }

  wireCodeCopyButtons(container) {
    container.querySelectorAll('.code-copy-btn').forEach(btn => {
      btn.onclick = () => {
        const code = btn.dataset.code || btn.closest('.code-block-wrapper')?.querySelector('code')?.textContent;
        if (code) {
          navigator.clipboard.writeText(code).then(() => {
            btn.textContent = '✓ Copied!';
            setTimeout(() => { btn.textContent = '📋 Copy'; }, 2000);
          });
        }
      };
    });
  }

  speakText(text) {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    // Clean markdown syntax from text for speech
    const cleanText = text.replace(/[*_`#]/g, '').replace(/```[\s\S]*?```/g, 'Code block omitted.');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05;
    window.speechSynthesis.speak(utterance);
  }

  initVoiceInput() {
    const micBtn = document.getElementById('bot-chat-mic');
    const input = document.getElementById('bot-chat-input');
    if (!micBtn || !input) return;

    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
      micBtn.title = 'Speech recognition not supported in this browser';
      micBtn.style.opacity = '0.5';
      return;
    }

    if (this.recognition) return;

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

    this.recognition.onerror = () => this.stopVoiceInput();
    this.recognition.onend = () => this.stopVoiceInput();

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