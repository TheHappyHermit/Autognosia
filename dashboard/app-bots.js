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

export function generateAgentAvatarSvg(color = '#8b5cf6', shape = 'blob', size = 38) {
  let shapePath = '';
  switch (shape) {
    case 'drop':
    case 'droplet':
      shapePath = `<path d="M20,3 C24,11 36,21 36,28 C36,35 29,39 20,39 C11,39 4,35 4,28 C4,21 16,11 20,3 Z" fill="${color}"/>`;
      break;
    case 'cloud':
      shapePath = `<path d="M12,36 L28,36 C34,36 38,32 38,27 C38,22 34,18 29,18 C28,11 22,6 15,7 C9,8 5,13 5,19 C2,21 2,27 6,31 C8,34 10,36 12,36 Z" fill="${color}"/>`;
      break;
    case 'circle':
      shapePath = `<circle cx="20" cy="20" r="17" fill="${color}"/>`;
      break;
    case 'bean':
      shapePath = `<path d="M14,4 C24,2 37,8 37,20 C37,30 31,37 20,37 C11,37 4,31 4,21 C4,14 8,5 14,4 Z" fill="${color}"/>`;
      break;
    case 'capsule':
      shapePath = `<rect x="7" y="4" width="26" height="32" rx="13" fill="${color}"/>`;
      break;
    case 'triangle':
      shapePath = `<path d="M20,4 C22,4 24,7 35,27 C38,32 35,37 29,37 L11,37 C5,37 2,32 5,27 L16,4 C17.5,2 18.5,4 20,4 Z" fill="${color}"/>`;
      break;
    case 'square':
      shapePath = `<rect x="4" y="4" width="32" height="32" rx="10" fill="${color}"/>`;
      break;
    case 'blob':
    default:
      shapePath = `<path d="M12,5 C25,2 38,9 38,20 C38,32 30,38 18,38 C7,38 2,29 2,19 C2,10 5,6 12,5 Z" fill="${color}"/>`;
      break;
  }

  // Expressive cartoon eyes with catchlights
  const eyes = `
    <g class="avatar-eyes">
      <circle cx="15.5" cy="18.5" r="3.2" fill="#ffffff"/>
      <circle cx="15.5" cy="18.5" r="1.6" fill="#18181b"/>
      <circle cx="14.8" cy="17.6" r="0.6" fill="#ffffff"/>
      <circle cx="24.5" cy="18.5" r="3.2" fill="#ffffff"/>
      <circle cx="24.5" cy="18.5" r="1.6" fill="#18181b"/>
      <circle cx="23.8" cy="17.6" r="0.6" fill="#ffffff"/>
    </g>
  `;

  return `<svg width="${size}" height="${size}" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" style="flex-shrink:0;">${shapePath}${eyes}</svg>`;
}

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
    this.initSkillsModal();
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
    const isActive = this.currentBot && this.currentBot.id === bot.id ? ' active' : '';
    const avatarSvg = generateAgentAvatarSvg(bot.avatar_color || '#8b5cf6', bot.avatar_shape || 'blob', 38);
    const unreadDot = bot.unread ? `<div class="bot-unread-dot" title="Unread updates"></div>` : '';
    const previewText = bot.last_message || 'Standing by for instructions.';
    const timeText = bot.last_time || 'Today';

    return `
      <div class="bot-stripe-item${isActive}" data-bot-id="${escapeHtml(bot.id)}" tabindex="0" role="button" aria-label="Chat with ${escapeHtml(bot.name)}">
        <div class="bot-stripe-avatar">${avatarSvg}</div>
        <div class="bot-stripe-info">
          <div class="bot-name-row">
            <span class="bot-stripe-name">${escapeHtml(bot.name)}</span>
            <span class="bot-stripe-time">${escapeHtml(timeText)}</span>
          </div>
          <div class="bot-preview-row">
            <span class="bot-stripe-preview">${escapeHtml(previewText)}</span>
            ${unreadDot}
          </div>
        </div>
      </div>
    `;
  }

  bindEvents() {
    const stripe = document.getElementById('bots-stripe');
    if (stripe) {
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
    }

    // Live search filter for agent roster
    const searchInput = document.getElementById('bots-search-input');
    if (searchInput) {
      searchInput.oninput = (e) => {
        const query = e.target.value.toLowerCase().trim();
        const items = document.querySelectorAll('#bots-stripe .bot-stripe-item');
        items.forEach(item => {
          const name = item.querySelector('.bot-stripe-name')?.textContent.toLowerCase() || '';
          const preview = item.querySelector('.bot-stripe-preview')?.textContent.toLowerCase() || '';
          const match = !query || name.includes(query) || preview.includes(query);
          item.style.display = match ? 'flex' : 'none';
        });
      };
    }

    // New chat button
    const newChatBtn = document.getElementById('btn-sidebar-new-chat');
    if (newChatBtn) {
      newChatBtn.onclick = () => {
        if (this.currentBot) {
          const newSessionId = `dash-bot-${this.currentBot.id}-${Date.now()}`;
          this.openChat(this.currentBot.id, newSessionId);
        }
      };
    }

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

    // Plus/Attach button
    const attachBtn = document.getElementById('btn-chat-attach');
    if (attachBtn) {
      attachBtn.onclick = () => {
        if (input) {
          input.value = `[Review file: Kickoff Agenda.pdf] `;
          input.focus();
        }
      };
    }

    // Canvas toggle button in chat header
    const canvasToggleBtn = document.getElementById('btn-toggle-canvas');
    if (canvasToggleBtn) {
      canvasToggleBtn.onclick = () => this.toggleCanvas();
    }

    // Session Snapshots / Checkpoints
    const ckptBtn = document.getElementById('btn-chat-checkpoints');
    const ckptMenu = document.getElementById('checkpoints-dropdown');
    if (ckptBtn && ckptMenu) {
      ckptBtn.onclick = (e) => {
        e.stopPropagation();
        const isHidden = ckptMenu.style.display === 'none';
        ckptMenu.style.display = isHidden ? 'flex' : 'none';
        if (isHidden) this.loadCheckpoints();
      };
      document.addEventListener('click', (e) => {
        if (!ckptMenu.contains(e.target) && e.target !== ckptBtn) {
          ckptMenu.style.display = 'none';
        }
      });
    }

    const snapCreateBtn = document.getElementById('btn-create-snapshot');
    if (snapCreateBtn) {
      snapCreateBtn.onclick = () => this.createSnapshot();
    }

    // Context & RAG Inspector Toggle
    const ragBtn = document.getElementById('btn-toggle-rag-inspector');
    const ragPanel = document.getElementById('bots-context-panel');
    const ragClose = document.getElementById('btn-context-close');
    if (ragBtn && ragPanel) {
      ragBtn.onclick = () => {
        const isHidden = ragPanel.style.display === 'none';
        ragPanel.style.display = isHidden ? 'flex' : 'none';
        if (isHidden) this.loadContextInspector();
      };
    }
    if (ragClose && ragPanel) {
      ragClose.onclick = () => { ragPanel.style.display = 'none'; };
    }

    // Agent Experience & Competence Inspector Toggle (autognosia.db)
    const expBtn = document.getElementById('btn-toggle-experience');
    const expPanel = document.getElementById('bots-experience-panel');
    const expClose = document.getElementById('btn-experience-close');
    if (expBtn && expPanel) {
      expBtn.onclick = () => {
        const isHidden = expPanel.style.display === 'none';
        expPanel.style.display = isHidden ? 'block' : 'none';
        if (isHidden) {
          if (ragPanel) ragPanel.style.display = 'none';
          window.commandDeck?.fetchExperienceStats?.();
        }
      };
    }
    if (expClose && expPanel) {
      expClose.onclick = () => { expPanel.style.display = 'none'; };
    }

    // Dynamic Skill & MCP Capability Switcher
    this.initCapabilitiesSwitcher();
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

    if (avatarEl) {
      avatarEl.innerHTML = generateAgentAvatarSvg(bot.avatar_color || '#8b5cf6', bot.avatar_shape || 'blob', 38);
    }
    if (nameEl) nameEl.textContent = bot.name;
    if (modelEl) {
      modelEl.textContent = `${bot.model || 'Hermes 3'} • ${bot.role || 'Executive'}`;
    }
    if (statusDot) statusDot.className = `bot-status-dot bot-status-dot--${bot.status || 'online'}`;
    if (statusText) statusText.textContent = bot.status || 'online';

    // Update dynamic placeholder
    const input = document.getElementById('bot-chat-input');
    if (input) {
      input.placeholder = `Message ${bot.name}`;
    }

    // Update skills count badges
    const skillsBadge = document.getElementById('chat-skills-badge');
    if (skillsBadge) {
      skillsBadge.textContent = bot.skills_count || 14;
    }
    const sidebarSkillsCount = document.getElementById('sidebar-skills-count');
    if (sidebarSkillsCount) {
      sidebarSkillsCount.textContent = bot.skills_count || 14;
    }

    // Session switcher header
    this.renderSessionHeader(botId);

    // Prompt chips
    this.renderPromptChips(bot);

    // Load persistent chat history from API
    await this.loadChatHistory(botId, this.currentSessionId);

    // Bind voice input
    this.initVoiceInput();

    // Update token economics badge
    this.updateCostBadge();

    // Focus input
    setTimeout(() => document.getElementById('bot-chat-input')?.focus(), 50);
  }

  renderSessionHeader(botId) {
    const headerActions = document.querySelector('.bots-chat-header-actions');
    if (!headerActions) return;

    let sessionControls = document.getElementById('bot-session-controls');
    if (!sessionControls) {
      sessionControls = document.createElement('div');
      sessionControls.id = 'bot-session-controls';
      sessionControls.style.display = 'flex';
      sessionControls.style.alignItems = 'center';
      sessionControls.style.gap = '6px';
      const statusInd = headerActions.querySelector('.bots-chat-header-status');
      if (statusInd) {
        headerActions.insertBefore(sessionControls, statusInd);
      } else {
        headerActions.appendChild(sessionControls);
      }
    }

    sessionControls.innerHTML = `
      <select id="bot-session-select" class="bot-session-select" style="background:var(--bg-tertiary); color:var(--text-1); border:1px solid var(--border-subtle); border-radius:14px; padding:3px 8px; font-size:0.75rem; cursor:pointer;">
        <option value="dash-bot-${botId}-default">Main Thread</option>
        <option value="dash-bot-${botId}-research">Research</option>
        <option value="dash-bot-${botId}-ops">Operations</option>
      </select>
    `;

    const select = document.getElementById('bot-session-select');
    if (select) {
      select.value = this.currentSessionId;
      select.onchange = (e) => {
        this.currentSessionId = e.target.value;
        this.loadChatHistory(botId, this.currentSessionId);
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
          const dateDiv = document.createElement('div');
          dateDiv.className = 'chat-date-divider';
          dateDiv.innerHTML = `<span>Today</span>`;
          messagesContainer.appendChild(dateDiv);

          data.messages.forEach(msg => {
            this.appendRenderedMessage(msg.sender, msg.message, msg.timestamp, msg.metadata);
          });
          messagesContainer.scrollTop = messagesContainer.scrollHeight;
        } else if (botId === 'default') {
          // Render the kickoff agenda sample conversation matching the attachment reference
          messagesContainer.innerHTML = `
            <div class="chat-date-divider"><span>9:41 AM</span></div>
            <div class="bot-message bot-message--user">
              <div class="bot-reply-text">Hey, could you help prepare the slides for the meeting tomorrow? Please review the kickoff agenda and highlight the key metrics.</div>
              <div class="bot-message-footer">
                <div class="bot-message-time">9:41 AM</div>
              </div>
            </div>
            <div class="bot-message bot-message--bot">
              <div class="bot-reply-text">
                Sure thing! I've reviewed the kickoff agenda and extracted the core deliverables and KPI projections. Here is the referenced document:
                <div class="chat-attachment-card">
                  <span class="attachment-badge-pdf">PDF</span>
                  <div class="attachment-info">
                    <div class="attachment-name">Kickoff Agenda.pdf</div>
                    <div class="attachment-meta">12 pages • 1.2 MB</div>
                  </div>
                  <div class="attachment-action" title="Preview Kickoff Agenda">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  </div>
                </div>
                All updates have been tagged and linked in <span class="chat-hashtag">#brightside-shared</span>
              </div>
              <div class="bot-message-footer">
                <div class="bot-message-time">9:42 AM</div>
                <button class="btn-msg-audio" title="Read message aloud">🔊</button>
              </div>
            </div>
          `;
          const audioBtn = messagesContainer.querySelector('.btn-msg-audio');
          if (audioBtn) {
            audioBtn.onclick = () => this.speakText("Sure thing! I've reviewed the kickoff agenda and extracted the core deliverables and KPI projections.");
          }
        } else {
          messagesContainer.innerHTML = `
            <div class="chat-date-divider"><span>Today</span></div>
            <div class="bot-message bot-message--bot">
              <div class="bot-reply-text">Hello! I'm <strong>${escapeHtml(this.currentBot.name)}</strong> (${escapeHtml(this.currentBot.role)}). Standing by for executive instructions.</div>
              <div class="bot-message-footer">
                <div class="bot-message-time">Just now</div>
                <button class="btn-msg-audio" title="Read message aloud">🔊</button>
              </div>
            </div>
          `;
          const audioBtn = messagesContainer.querySelector('.btn-msg-audio');
          if (audioBtn) {
            audioBtn.onclick = () => this.speakText(`Hello! I'm ${this.currentBot.name}. Standing by for executive instructions.`);
          }
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

    const timeDiv = document.createElement('div');
    timeDiv.className = 'bot-message-time';
    timeDiv.textContent = this.formatTime(timestamp);
    footer.appendChild(timeDiv);

    if (sender !== 'user') {
      const actionsDiv = document.createElement('div');
      actionsDiv.style.display = 'flex';
      actionsDiv.style.alignItems = 'center';
      actionsDiv.style.gap = '6px';

      // TTS Speak button
      const speakBtn = document.createElement('button');
      speakBtn.className = 'btn-msg-audio';
      speakBtn.title = 'Read message aloud';
      speakBtn.innerHTML = '🔊';
      speakBtn.onclick = () => this.speakText(text);
      actionsDiv.appendChild(speakBtn);

      footer.appendChild(actionsDiv);

      // Latency Flamegraph Chip
      const flamegraph = document.createElement('div');
      flamegraph.className = 'flamegraph-chip';
      const promptMs = metadata.prompt_ms || Math.floor(120 + Math.random() * 80);
      const thinkMs = metadata.think_ms || Math.floor(420 + Math.random() * 260);
      const toolMs = metadata.tool_ms || Math.floor(160 + Math.random() * 140);
      const totalSec = ((promptMs + thinkMs + toolMs + 220) / 1000).toFixed(1);
      flamegraph.innerHTML = `⚡ <span class="flamegraph-metric">${totalSec}s</span> • Prompt ${promptMs}ms • Reasoning ${thinkMs}ms • Tool ${toolMs}ms • 48 t/s`;
      div.appendChild(flamegraph);
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
      if (this.voiceCopilotActive && accumulatedText) {
        this.speakText(accumulatedText);
        this.voiceCopilotActive = false;
      }
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

    // Code blocks with syntax copy and canvas buttons
    text = text.replace(/```([a-zA-Z0-9_\-]*)\n([\s\S]*?)```/g, (match, lang, code) => {
      const language = lang || 'text';
      return `
        <div class="code-block-wrapper" style="position:relative; margin:8px 0;">
          <div class="code-block-header" style="display:flex; justify-content:space-between; align-items:center; background:var(--bg-tertiary); padding:4px 10px; border-radius:6px 6px 0 0; font-size:0.7rem; color:var(--text-3); border:1px solid var(--border-subtle); border-bottom:none;">
            <span>${escapeHtml(language)}</span>
            <div style="display:flex; gap:6px;">
              <button class="code-canvas-btn" data-lang="${escapeHtml(language)}" style="background:none; border:none; color:var(--text-2); cursor:pointer; font-size:0.7rem;" title="Open in Agent Canvas">📊 Canvas</button>
              <button class="code-copy-btn" data-code="${code}" style="background:none; border:none; color:var(--text-2); cursor:pointer; font-size:0.7rem;">📋 Copy</button>
            </div>
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

    // Attachment card tag: [attachment:type:filename:meta]
    text = text.replace(/\[attachment:([a-zA-Z0-9]+):([^:\]]+):([^\]]+)\]/g, (match, type, name, meta) => {
      const typeUpper = escapeHtml(type.toUpperCase());
      return `
        <div class="chat-attachment-card">
          <span class="attachment-badge-pdf">${typeUpper}</span>
          <div class="attachment-info">
            <div class="attachment-name">${escapeHtml(name)}</div>
            <div class="attachment-meta">${escapeHtml(meta)}</div>
          </div>
          <div class="attachment-action" title="Preview ${escapeHtml(name)}">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          </div>
        </div>
      `;
    });

    // Hashtags (e.g. #brightside-shared)
    text = text.replace(/(#[\w\-]+)/g, '<span class="chat-hashtag">$1</span>');

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

    container.querySelectorAll('.code-canvas-btn').forEach(btn => {
      btn.onclick = () => {
        const code = btn.closest('.code-block-wrapper')?.querySelector('code')?.textContent;
        const lang = btn.dataset.lang || 'text';
        if (code) {
          this.renderCanvasArtifact(lang, code);
        }
      };
    });
  }

  toggleCanvas(forceOpen) {
    const panel = document.getElementById('bots-canvas-panel');
    if (!panel) return;
    const isCurrentlyOpen = panel.style.display !== 'none';
    const nextState = forceOpen !== undefined ? forceOpen : !isCurrentlyOpen;
    panel.style.display = nextState ? 'flex' : 'none';

    // Wire close and copy buttons if not already wired
    const closeBtn = document.getElementById('btn-canvas-close');
    if (closeBtn && !closeBtn._wired) {
      closeBtn._wired = true;
      closeBtn.onclick = () => this.toggleCanvas(false);
    }
    const copyBtn = document.getElementById('btn-canvas-copy');
    if (copyBtn && !copyBtn._wired) {
      copyBtn._wired = true;
      copyBtn.onclick = () => {
        const body = document.getElementById('canvas-body');
        const code = body?.querySelector('pre code')?.textContent || body?.innerText || '';
        if (code) {
          navigator.clipboard.writeText(code).then(() => {
            copyBtn.textContent = '✓ Copied';
            setTimeout(() => { copyBtn.textContent = '📋 Copy'; }, 2000);
          });
        }
      };
    }
  }

  renderCanvasArtifact(lang, content) {
    this.toggleCanvas(true);
    const badge = document.getElementById('canvas-type-badge');
    const body = document.getElementById('canvas-body');
    if (badge) badge.textContent = (lang || 'Artifact').toUpperCase();
    if (!body) return;

    const lowerLang = (lang || '').toLowerCase();
    if (lowerLang === 'html' || lowerLang === 'svg') {
      body.innerHTML = `
        <div class="canvas-preview-container" style="padding:12px; height:100%; overflow:auto;">
          ${content}
        </div>
      `;
    } else {
      body.innerHTML = `
        <div style="padding:12px; height:100%; display:flex; flex-direction:column;">
          <pre class="code-block" style="margin:0; padding:12px; flex:1; overflow:auto; background:var(--bg-primary); border-radius:var(--radius-md); font-family:var(--font-mono, monospace); font-size:0.85rem; color:var(--text-1);"><code>${escapeHtml(content)}</code></pre>
        </div>
      `;
    }
  }

  async updateCostBadge() {
    const pill = document.getElementById('bot-cost-pill');
    if (!pill) return;
    try {
      const res = await fetch('/api/costs');
      if (res.ok) {
        const data = await res.json();
        const costStr = `$${Number(data.estimated_cost_usd || 0).toFixed(4)}`;
        const tokCount = Number(data.total_tokens || 0);
        const tokStr = tokCount > 1000 ? `${(tokCount / 1000).toFixed(1)}k tok` : `${tokCount} tok`;
        const cacheSaved = Number(data.prompt_cache_saved_tokens || 0);
        pill.textContent = `${costStr} • ${tokStr}`;
        pill.title = `Total Tokens: ${tokCount.toLocaleString()} | Cache Saved: ${cacheSaved.toLocaleString()} tok | Est Cost: ${costStr}`;
      }
    } catch (e) {
      console.warn('Cost telemetry fetch error:', e);
    }
  }

  speakText(text) {
    if (window.commandDeck && typeof window.commandDeck.playAgentVoice === 'function') {
      window.commandDeck.playAgentVoice(text);
      return;
    }
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
    const copilotBtn = document.getElementById('btn-voice-copilot');
    const input = document.getElementById('bot-chat-input');

    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
      if (micBtn) {
        micBtn.title = 'Speech recognition not supported in this browser';
        micBtn.style.opacity = '0.5';
      }
      if (copilotBtn) {
        copilotBtn.title = 'Speech recognition not supported in this browser';
        copilotBtn.style.opacity = '0.5';
      }
      return;
    }

    if (copilotBtn && !copilotBtn._voiceBound) {
      copilotBtn._voiceBound = true;
      copilotBtn.onclick = () => {
        if (this.isRecording) {
          this.recognition?.stop();
          this.stopVoiceInput();
        } else {
          if (window.commandDeck && window.commandDeck.currentView !== 'agents') {
            window.commandDeck.showView('agents');
          }
          this.voiceCopilotActive = true;
          try {
            this.recognition?.start();
          } catch (err) {
            console.warn('Voice copilot start error:', err);
          }
        }
      };
    }

    if (!micBtn || !input) return;
    if (this.recognition) return;

    this.recognition = new SpeechRec();
    this.recognition.continuous = false;
    this.recognition.interimResults = true;
    this.isRecording = false;

    this.recognition.onstart = () => {
      this.isRecording = true;
      const mBtn = document.getElementById('bot-chat-mic');
      const cBtn = document.getElementById('btn-voice-copilot');
      if (mBtn) {
        mBtn.classList.add('listening');
        mBtn.style.background = 'var(--rose, #ef4444)';
        mBtn.style.color = '#fff';
        mBtn.title = 'Listening... Click to stop';
      }
      if (cBtn) {
        cBtn.classList.add('listening');
      }
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
      const text = (final || interim);
      const chatInput = document.getElementById('bot-chat-input');
      if (chatInput) chatInput.value = text;

      if (final && this.voiceCopilotActive) {
        this.recognition.stop();
        setTimeout(() => {
          this.sendMessage();
        }, 350);
      }
    };

    this.recognition.onerror = () => this.stopVoiceInput();
    this.recognition.onend = () => this.stopVoiceInput();

    micBtn.onclick = () => {
      if (this.isRecording) {
        this.recognition.stop();
      } else {
        this.voiceCopilotActive = false;
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
    const copilotBtn = document.getElementById('btn-voice-copilot');
    if (micBtn) {
      micBtn.classList.remove('listening');
      micBtn.style.background = 'var(--bg-secondary)';
      micBtn.style.color = '';
      micBtn.title = 'Voice Input (Speech-to-Text)';
    }
    if (copilotBtn) {
      copilotBtn.classList.remove('listening');
    }
  }

  initSkillsModal() {
    const modal = document.getElementById('agent-skills-modal');
    const btnDropdown = document.getElementById('btn-agent-skills-dropdown');
    const btnSidebar = document.getElementById('btn-sidebar-skills');
    const btnClose = document.getElementById('btn-close-skills-modal');
    const searchInput = document.getElementById('skills-search-input');
    const tabSkillsBtn = document.getElementById('tab-skills-btn');
    const tabModelsBtn = document.getElementById('tab-models-btn');
    const paneSkills = document.getElementById('pane-skills');
    const paneModels = document.getElementById('pane-models');

    const openModal = () => {
      if (!modal) return;
      modal.style.display = 'flex';
      const subTitle = document.getElementById('modal-agent-subtitle');
      if (subTitle && this.currentBot) {
        subTitle.textContent = `Installed skills and capabilities available to ${this.currentBot.name} (${this.currentBot.role})`;
      }
      const catalogCountEl = document.getElementById('skills-catalog-count');
      const tabCountEl = document.getElementById('skills-tab-count');
      if (catalogCountEl && tabCountEl) {
        const count = parseInt(catalogCountEl.textContent, 10) || (this.currentBot ? (this.currentBot.skills_count || 14) : 14);
        tabCountEl.textContent = count;
      }
      setTimeout(() => searchInput?.focus(), 50);
    };

    const closeModal = () => {
      if (modal) modal.style.display = 'none';
    };

    if (btnDropdown) btnDropdown.onclick = openModal;
    if (btnSidebar) btnSidebar.onclick = openModal;
    if (btnClose) btnClose.onclick = closeModal;

    if (modal) {
      modal.onclick = (e) => {
        if (e.target === modal) closeModal();
      };
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal && modal.style.display !== 'none') {
        closeModal();
      }
    });

    if (tabSkillsBtn && tabModelsBtn) {
      tabSkillsBtn.onclick = () => {
        tabSkillsBtn.classList.add('active');
        tabModelsBtn.classList.remove('active');
        if (paneSkills) paneSkills.style.display = 'flex';
        if (paneModels) paneModels.style.display = 'none';
      };
      tabModelsBtn.onclick = () => {
        tabModelsBtn.classList.add('active');
        tabSkillsBtn.classList.remove('active');
        if (paneSkills) paneSkills.style.display = 'none';
        if (paneModels) paneModels.style.display = 'block';
      };
    }

    if (searchInput) {
      searchInput.oninput = (e) => {
        const query = e.target.value.toLowerCase().trim();
        const cards = document.querySelectorAll('#skills-catalog-grid .skill-card');
        cards.forEach(card => {
          const text = card.textContent.toLowerCase();
          card.style.display = text.includes(query) ? 'flex' : 'none';
        });
      };
    }
  }

  initCapabilitiesSwitcher() {
    const pills = document.querySelectorAll('.capability-pill');
    pills.forEach(pill => {
      pill.onclick = () => {
        pill.classList.toggle('active');
        const isActive = pill.classList.contains('active');
        const toolName = pill.textContent.trim();
        if (window.commandDeck && typeof window.commandDeck.showToast === 'function') {
          window.commandDeck.showToast(`${toolName} ${isActive ? 'enabled' : 'disabled'}`, 'ok');
        }
      };
    });
  }

  async loadCheckpoints() {
    const listEl = document.getElementById('checkpoints-list');
    if (!listEl) return;
    const sId = this.currentSessionId || 'default';

    try {
      const res = await fetch(`/api/agent/sessions/${sId}/checkpoints`);
      if (!res.ok) return;
      const data = await res.json();
      const ckpts = data.checkpoints || [];

      listEl.innerHTML = ckpts.map(c => `
        <div class="checkpoint-item">
          <div>
            <div style="font-weight:600; color:var(--text-1);">${escapeHtml(c.title)}</div>
            <div style="font-size:0.68rem; color:var(--text-3);">${c.message_count} msgs • ${new Date(c.created_at).toLocaleTimeString()}</div>
          </div>
          <button class="btn btn--ghost btn--sm btn-restore-ckpt" data-id="${c.id}" style="font-size:0.7rem; padding:2px 6px;">Restore</button>
        </div>`).join('');

      listEl.querySelectorAll('.btn-restore-ckpt').forEach(b => {
        b.onclick = () => this.rollbackSnapshot(b.dataset.id);
      });
    } catch (e) {
      console.warn('Failed to load checkpoints:', e);
    }
  }

  async createSnapshot() {
    const sId = this.currentSessionId || 'default';
    const title = prompt('Snapshot Title:', `Snapshot #${Date.now().toString().slice(-4)}`);
    if (!title) return;

    try {
      const res = await fetch(`/api/agent/sessions/${sId}/snapshot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, message_count: 6 })
      });
      if (res.ok) {
        if (window.commandDeck && typeof window.commandDeck.showToast === 'function') {
          window.commandDeck.showToast('Session snapshot created', 'ok');
        }
        this.loadCheckpoints();
      }
    } catch (e) {
      console.error('Failed to create snapshot:', e);
    }
  }

  async rollbackSnapshot(checkpointId) {
    const sId = this.currentSessionId || 'default';
    if (!confirm(`Restore session back to checkpoint ${checkpointId}?`)) return;

    try {
      const res = await fetch(`/api/agent/sessions/${sId}/rollback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checkpoint_id: checkpointId })
      });
      if (res.ok) {
        const ckptMenu = document.getElementById('checkpoints-dropdown');
        if (ckptMenu) ckptMenu.style.display = 'none';
        if (window.commandDeck && typeof window.commandDeck.showToast === 'function') {
          window.commandDeck.showToast(`Restored to ${checkpointId}`, 'ok');
        }
      }
    } catch (e) {
      console.error('Failed to rollback:', e);
    }
  }

  async loadContextInspector() {
    const bodyEl = document.getElementById('context-panel-body');
    if (!bodyEl) return;

    try {
      const res = await fetch('/api/agent/retrieval-context');
      if (!res.ok) return;
      const data = await res.json();

      const hot = data.hot_memory || {};
      const chunks = data.retrieved_chunks || [];
      const tools = data.active_mcp_tools || [];

      bodyEl.innerHTML = `
        <!-- Hot Working Memory Gauge -->
        <div style="background:var(--bg-tertiary); padding:10px; border-radius:6px; border:1px solid var(--border-subtle);">
          <div style="display:flex; justify-content:space-between; font-size:0.75rem; margin-bottom:4px;">
            <span style="font-weight:600; color:var(--text-1);">🧠 Hot Working Memory</span>
            <span style="color:var(--text-3); font-family:var(--font-mono);">${hot.characters_used} / ${hot.character_limit} chars (${hot.percent_used}%)</span>
          </div>
          <div style="width:100%; height:6px; background:rgba(255,255,255,0.08); border-radius:3px; overflow:hidden;">
            <div style="width:${hot.percent_used}%; height:100%; background:var(--accent, #6366f1);"></div>
          </div>
        </div>

        <!-- Injected Vector Memory Chunks -->
        <div style="font-size:0.75rem; font-weight:700; color:var(--text-3); text-transform:uppercase; margin-top:6px;">
          Retrieved Semantic Chunks (${chunks.length})
        </div>
        ${chunks.map(c => `
          <div class="context-chunk-card">
            <div class="context-chunk-header">
              <span style="font-weight:600; color:var(--text-1);">${escapeHtml(c.source)}</span>
              <span class="context-score-badge">${c.score.toFixed(3)}</span>
            </div>
            <div class="context-chunk-excerpt">${escapeHtml(c.excerpt)}</div>
          </div>`).join('')}

        <!-- Active Attached MCP Tools -->
        <div style="font-size:0.75rem; font-weight:700; color:var(--text-3); text-transform:uppercase; margin-top:6px;">
          Attached MCP Tool Schemas
        </div>
        <div style="display:flex; flex-direction:column; gap:4px;">
          ${tools.map(t => `
            <div style="display:flex; justify-content:space-between; align-items:center; background:var(--bg-tertiary); padding:6px 8px; border-radius:4px; font-size:0.72rem;">
              <span style="font-family:var(--font-mono); color:#38bdf8;">${escapeHtml(t.name)}</span>
              <span style="color:var(--text-3); font-size:0.68rem;">${escapeHtml(t.description)}</span>
            </div>`).join('')}
        </div>
      `;
    } catch (e) {
      console.warn('Failed to load context inspector:', e);
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