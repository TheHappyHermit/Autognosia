import { CommandDeck } from './app-core.js';
import { GraphVisualizer } from './graph-visualizer.js';

// ── Renderers ──────────────────────────────────────────────────────────────

CommandDeck.prototype.renderOverview = function() {
  const stats = this.state.overview.stats || {};
  const set = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = (val != null ? val : 'N/A');
  };
  set('stat-active-tasks', stats.active_tasks);
  set('stat-critical-tasks', stats.critical_tasks);
  set('stat-reminders', stats.pending_reminders);
  set('stat-today-events', stats.today_events_count);
  set('stat-unread-emails', stats.unread_emails);
  set('stat-intentions', stats.active_intentions);
};

CommandDeck.prototype.renderBriefing = function() {
  const b = this.state.briefing;
  if (b.date) document.getElementById('briefing-date').textContent = b.date;
  if (b.summary) document.getElementById('briefing-summary').textContent = b.summary;
  if (b.prompt_me) document.getElementById('briefing-prompt-text').textContent = `"${b.prompt_me}"`;

  const priList = document.getElementById('briefing-priorities-list');
  if (b.top_priorities && b.top_priorities.length > 0) {
    priList.innerHTML = b.top_priorities.map(p => `
      <li>
        ${escapeHtml(p.title)}
        <span class="badge badge-${p.priority || 'medium'}">${escapeHtml(p.priority)}</span>
        ${p.due_at ? `<span><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> Due ${escapeHtml(p.due_at)}</span>` : ''}
      </li>
    `).join('');
  } else {
    priList.innerHTML = '<li class="empty-hint">No open priorities.</li>';
  }
};

CommandDeck.prototype.refreshAllData = async function() {
  const safe = async (fn) => {
    try {
      if (typeof fn === 'function') await fn();
    } catch (e) {
      console.warn('Fetch error:', e);
    }
  };
  await Promise.all([
    safe(() => this.fetchSystemStats && this.fetchSystemStats()),
    safe(() => this.fetchOverview && this.fetchOverview()),
    safe(() => this.fetchBriefing && this.fetchBriefing()),
    safe(() => this.fetchTasks && this.fetchTasks()),
    safe(() => this.fetchReminders && this.fetchReminders()),
    safe(() => this.fetchProjects && this.fetchProjects()),
    safe(() => this.fetchCalendar && this.fetchCalendar()),
    safe(() => this.fetchEmails && this.fetchEmails()),
    safe(() => this.fetchIntentions && this.fetchIntentions()),
    safe(() => this.fetchTelemetry && this.fetchTelemetry()),
    safe(() => this.fetchServices && this.fetchServices()),
    safe(() => this.fetchMedia && this.fetchMedia()),
    safe(() => this.fetchQueue && this.fetchQueue()),
    safe(() => this.renderDashboardServers && this.renderDashboardServers()),
    safe(() => this.fetchMemoryStatus && this.fetchMemoryStatus()),
    safe(() => this.fetchNotifications && this.fetchNotifications()),
    safe(() => this.fetchKnowledgeGraph && this.fetchKnowledgeGraph()),
    safe(() => this.fetchAgentStatus && this.fetchAgentStatus()),
    safe(() => this.fetchCronJobs && this.fetchCronJobs()),
    safe(() => this.fetchSkillsCatalog && this.fetchSkillsCatalog()),
    safe(() => this.fetchGatewayStatus && this.fetchGatewayStatus())
  ]);
};

// ── Dashboard Server Grid ─────────────────────────────────────────────────

CommandDeck.prototype.renderDashboardServers = async function() {
  const grid = document.getElementById('dashboard-server-grid');
  if (!grid) return;

  let sysData = {};
  let services = [];
  try {
    const sysRes = await fetch(`${this.apiBase}/api/system`);
    if (sysRes.ok) sysData = await sysRes.json();
  } catch (e) { /* ignore */ }
  try {
    const svcRes = await fetch(`${this.apiBase}/api/services`);
    if (svcRes.ok) services = await svcRes.json();
  } catch (e) { /* ignore */ }

  const svcList = Array.isArray(services) ? services : Object.values(services || {});
  const hostname = window.location.hostname || 'localhost';

  grid.innerHTML = `
    <div class="server-card">
      <div class="server-card__header">
        <div class="server-card__name">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
          <span>${escapeHtml(hostname)}</span>
          <span class="server-card__ip">Main</span>
        </div>
        <span class="server-card__status online">● Online</span>
      </div>
      <div class="server-card__body">
        <div class="server-card__services">
          ${svcList.length > 0 ? svcList.map(s => `
            <span class="service-pill service-pill--${s.health === 'healthy' ? 'online' : 'offline'}">
              <span class="service-pill__dot"></span>${escapeHtml(s.name)}
              <button class="btn-container-log-icon" data-container="${escapeHtml(s.name)}" title="View logs" style="background:none;border:none;cursor:pointer;padding:0 2px;margin-left:4px;color:var(--text-3);font-size:10px;">📋</button>
            </span>
          `).join('') : '<span class="service-pill"><span class="service-pill__dot"></span>No services</span>'}
        </div>
        <div class="gpu-meter">
          <div class="gpu-meter__label">
            <span>CPU</span>
            <span class="gpu-meter__value">${sysData.cpu_percent != null ? sysData.cpu_percent + '%' : 'N/A'}</span>
          </div>
          <div class="gpu-meter__bar">
            <div class="gpu-meter__fill" style="width: ${sysData.cpu_percent || 0}%"></div>
          </div>
        </div>
      </div>
    </div>
  `;

  grid.querySelectorAll('.btn-container-log-icon').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      this.openContainerLogs(btn.dataset.container);
    };
  });
};

CommandDeck.prototype.fetchOverview = async function() {
  try {
    const res = await fetch(`${this.apiBase}/api/overview`);
    if (res.ok) {
      this.state.overview = await res.json();
      this.renderOverview();
    }
  } catch (e) {
    console.warn('Overview fetch error:', e);
  }
};

CommandDeck.prototype.fetchBriefing = async function() {
  try {
    const res = await fetch(`${this.apiBase}/api/briefing`);
    if (res.ok) {
      this.state.briefing = await res.json();
      this.renderBriefing();
    }
  } catch (e) {
    console.warn('Briefing fetch error:', e);
  }
};

CommandDeck.prototype.fetchTasks = async function() {
  try {
    const res = await fetch(`${this.apiBase}/api/tasks`);
    if (res.ok) {
      this.state.tasks = await res.json();
      this.renderTasks();
    }
  } catch (e) {
    console.warn('Tasks fetch error:', e);
  }
};

CommandDeck.prototype.fetchReminders = async function() {
  try {
    const res = await fetch(`${this.apiBase}/api/reminders`);
    if (res.ok) {
      this.state.reminders = await res.json();
      this.renderReminders();
    }
  } catch (e) {
    console.warn('Reminders fetch error:', e);
  }
};

CommandDeck.prototype.fetchProjects = async function() {
  try {
    const res = await fetch(`${this.apiBase}/api/projects`);
    if (res.ok) {
      this.state.projects = await res.json();
      this.renderProjects();
    }
  } catch (e) {
    console.warn('Projects fetch error:', e);
  }
};

CommandDeck.prototype.fetchCalendar = async function() {
  try {
    const res = await fetch(`${this.apiBase}/api/calendar`);
    if (res.ok) {
      this.state.calendarEvents = await res.json();
      this.renderCalendar();
    }
  } catch (e) {
    console.warn('Calendar fetch error:', e);
  }
};

CommandDeck.prototype.fetchEmails = async function() {
  try {
    const res = await fetch(`${this.apiBase}/api/emails`);
    if (res.ok) {
      this.state.emails = await res.json();
      this.renderEmails();
    }
  } catch (e) {
    console.warn('Emails fetch error:', e);
  }
};

CommandDeck.prototype.fetchIntentions = async function() {
  try {
    const res = await fetch(`${this.apiBase}/api/intentions`);
    if (res.ok) {
      this.state.intentions = await res.json();
      this.renderIntentions();
    }
  } catch (e) {
    console.warn('Intentions fetch error:', e);
  }
};

CommandDeck.prototype.fetchTelemetry = async function() {
    try {
      const res = await fetch(`${this.apiBase}/api/telemetry`);
      if (res.ok) {
        this.state.telemetry = await res.json();
        this.renderTelemetry();
      }
    } catch (e) {
      console.warn('Telemetry fetch error:', e);
    }
  };

  // ── Bots / Agents ─────────────────────────────────────────────────────────

  CommandDeck.prototype.fetchBots = async function() {
    try {
      const res = await fetch(`${this.apiBase}/api/bots`);
      if (res.ok) {
        const data = await res.json();
        this.state.bots = data.bots || [];
        this.renderAgentsGrid();
      }
    } catch (e) {
      console.warn('Bots fetch error:', e);
    }
  };

  CommandDeck.prototype.renderAgentsGrid = function() {
    const grid = document.getElementById('agents-grid');
    if (!grid) return;

    if (!this.state.bots || this.state.bots.length === 0) {
      grid.innerHTML = '<div class="empty-state"><div class="empty-state__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><rect x="9" y="9" width="6" height="6"/></svg></div><div class="empty-state__title">No Agents</div><div class="empty-state__desc">No bots configured.</div></div>';
      return;
    }

    grid.innerHTML = this.state.bots.map(bot => {
      const statusClass = bot.status === 'online' ? 'online' : 'offline';
      return `
        <div class="agent-card">
          <div class="agent-card__header">
            <div class="agent-card__avatar">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="24" height="24"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><rect x="9" y="9" width="6" height="6"/></svg>
            </div>
            <div class="agent-card__info">
              <div class="agent-card__name">${escapeHtml(bot.name)}</div>
              <div class="agent-card__model">${escapeHtml(bot.model)} • ${escapeHtml(bot.provider)}</div>
            </div>
            <span class="agent-status-pill ${statusClass}">${escapeHtml(bot.status || 'unknown')}</span>
          </div>
          <div class="agent-card__body">
            <div class="agent-stat-row">
              <span class="agent-stat-label">Role</span>
              <span class="agent-stat-value">${escapeHtml(bot.role || 'N/A')}</span>
            </div>
            <div class="agent-stat-row">
              <span class="agent-stat-label">Last Activity</span>
              <span class="agent-stat-value">${escapeHtml(bot.last_activity || 'Never')}</span>
            </div>
          </div>
        </div>
      `;
    }).join('');
  };

  // ── Home Lab ──────────────────────────────────────────────────────────────

  CommandDeck.prototype.renderHomeLab = async function() {
    const grid = document.getElementById('homelab-server-grid');
    if (!grid) return;

    try {
      // Fetch home lab infrastructure data
      const res = await fetch(`${this.apiBase}/api/homelab`);
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      
      const homelabData = await res.json();
      const servers = homelabData.servers || [];
      
      if (!servers || servers.length === 0) {
        grid.innerHTML = `
          <div class="empty-state">
            <div class="empty-state__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
            </div>
            <div class="empty-state__title">No home lab servers</div>
            <div class="empty-state__desc">Configure your infrastructure in config.yaml</div>
          </div>
        `;
        return;
      }

      grid.innerHTML = servers.map(server => `
        <div class="server-card">
          <div class="server-card__header">
            <div class="server-card__name">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
              <span>${escapeHtml(server.name || 'Unknown')}</span>
              <span class="server-card__ip">${escapeHtml(server.role || 'server')}</span>
            </div>
            <span class="server-card__status ${server.online ? 'online' : 'offline'}">● ${server.online ? 'Online' : 'Offline'}</span>
          </div>
          <div class="server-card__body">
            <div class="server-card__services">
              ${server.services && server.services.length > 0 ? server.services.map(s => `
                <span class="service-pill service-pill--${s.healthy ? 'online' : 'offline'}">
                  <span class="service-pill__dot"></span>${escapeHtml(s.name)}
                  <button class="btn-container-log-icon" data-container="${escapeHtml(s.name)}" title="View logs" style="background:none;border:none;cursor:pointer;padding:0 2px;margin-left:4px;color:var(--text-3);font-size:10px;">📋</button>
                  <button class="btn-container-restart-icon" data-container="${escapeHtml(s.name)}" title="Restart container" style="background:none;border:none;cursor:pointer;padding:0 2px;margin-left:2px;color:var(--text-3);font-size:10px;">🔄</button>
                </span>
              `).join('') : '<span class="service-pill"><span class="service-pill__dot"></span>No services</span>'}
            </div>
            ${server.gpu ? `
            <div class="gpu-meter">
              <div class="gpu-meter__label">
                <span>GPU</span>
                <span class="gpu-meter__value">${escapeHtml(server.gpu.name)}</span>
              </div>
              <div class="gpu-meter__bar">
                <div class="gpu-meter__fill" style="width: ${server.gpu.utilization || 0}%"></div>
              </div>
            </div>
            ` : ''}
            ${server.cpu_percent != null ? `
            <div class="gpu-meter">
              <div class="gpu-meter__label">
                <span>CPU</span>
                <span class="gpu-meter__value">${server.cpu_percent}%</span>
              </div>
              <div class="gpu-meter__bar">
                <div class="gpu-meter__fill" style="width: ${server.cpu_percent}%"></div>
              </div>
            </div>
            ` : ''}
          </div>
        </div>
      `).join('');

      grid.querySelectorAll('.btn-container-log-icon').forEach(btn => {
        btn.onclick = (e) => {
          e.stopPropagation();
          this.openContainerLogs(btn.dataset.container);
        };
      });

      grid.querySelectorAll('.btn-container-restart-icon').forEach(btn => {
        btn.onclick = (e) => {
          e.stopPropagation();
          this.restartContainer(btn.dataset.container);
        };
      });
    } catch (e) {
      console.warn('Home lab fetch error:', e);
      grid.innerHTML = `
        <div class="empty-state">
          <div class="empty-state__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </div>
          <div class="empty-state__title">Unable to load home lab</div>
          <div class="empty-state__desc">Check server connectivity</div>
        </div>
      `;
    }
  };

// ── Hot Memory Saturation Meter & Consolidation ─────────────────────────────

CommandDeck.prototype.fetchMemoryStatus = async function() {
  try {
    const res = await fetch(`${this.apiBase}/api/memory/status`);
    if (!res.ok) return;
    const data = await res.json();
    
    const charEl = document.getElementById('stat-memory-chars');
    const badgeEl = document.getElementById('stat-memory-badge');
    const barEl = document.getElementById('stat-memory-bar');
    
    const charsUsed = data.chars_used != null ? data.chars_used : (data.char_count || 0);
    if (charEl) charEl.textContent = charsUsed;
    const pct = Math.min(100, Math.round(data.percent_used != null ? data.percent_used : (data.saturation_pct || 0)));
    
    const isCritical = pct >= 90;
    const isWarning = data.needs_consolidation || pct >= 80;

    if (barEl) {
      barEl.style.width = `${pct}%`;
      if (isCritical) {
        barEl.style.background = 'var(--rose, #ef4444)';
      } else if (isWarning) {
        barEl.style.background = 'var(--amber, #f59e0b)';
      } else {
        barEl.style.background = 'var(--accent, #06b6d4)';
      }
    }
    
    if (badgeEl) {
      if (isCritical) {
        badgeEl.textContent = 'CRITICAL';
        badgeEl.style.background = 'rgba(239, 68, 68, 0.2)';
        badgeEl.style.color = 'var(--rose, #ef4444)';
      } else if (isWarning) {
        badgeEl.textContent = 'WARNING';
        badgeEl.style.background = 'rgba(245, 158, 11, 0.2)';
        badgeEl.style.color = 'var(--amber, #f59e0b)';
      } else {
        badgeEl.textContent = 'OK';
        badgeEl.style.background = 'var(--accent-soft)';
        badgeEl.style.color = 'var(--accent)';
      }
    }

    // ── Render 7-point saturation sparkline on #stat-memory-sparkline canvas
    const canvas = document.getElementById('stat-memory-sparkline');
    if (canvas && canvas.getContext) {
      if (!this.memoryHistory || this.memoryHistory.length === 0) {
        const base = Math.max(5, pct - 12);
        this.memoryHistory = [
          Math.max(0, base - 6),
          Math.max(0, base - 3),
          Math.max(0, base + 2),
          Math.max(0, base),
          Math.max(0, base + 5),
          Math.max(0, base + 8),
          pct
        ];
      } else {
        this.memoryHistory.push(pct);
        if (this.memoryHistory.length > 7) {
          this.memoryHistory.shift();
        }
      }

      const ctx = canvas.getContext('2d');
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const pts = this.memoryHistory;
      if (pts.length >= 2) {
        ctx.beginPath();
        const strokeColor = isCritical ? '#ef4444' : (isWarning ? '#f59e0b' : '#06b6d4');
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 1.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        pts.forEach((val, i) => {
          const x = 3 + (i / (pts.length - 1)) * (w - 6);
          const y = (h - 3) - ((Math.min(100, Math.max(0, val)) / 100) * (h - 6));
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.stroke();

        // Draw small dot on latest point
        const lastVal = pts[pts.length - 1];
        const lastX = w - 3;
        const lastY = (h - 3) - ((Math.min(100, Math.max(0, lastVal)) / 100) * (h - 6));
        ctx.fillStyle = strokeColor;
        ctx.beginPath();
        ctx.arc(lastX, lastY, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } catch (e) {
    console.warn('Memory status fetch error:', e);
  }
};

CommandDeck.prototype.consolidateMemory = async function() {
  const badgeEl = document.getElementById('stat-memory-badge');
  if (badgeEl) badgeEl.textContent = 'CONSOLIDATING...';
  try {
    const res = await fetch(`${this.apiBase}/api/memory/consolidate`, { method: 'POST' });
    const data = await res.json();
    if (res.ok) {
      alert(data.message || 'Memory consolidation completed.');
    } else {
      alert(data.detail || 'Consolidation failed.');
    }
    await this.fetchMemoryStatus();
  } catch (e) {
    console.warn('Consolidation failed:', e);
    await this.fetchMemoryStatus();
  }
};

CommandDeck.prototype.initMemoryControls = function() {
  const metricEl = document.getElementById('hud-memory-metric');
  if (metricEl) {
    metricEl.style.cursor = 'pointer';
    metricEl.onclick = async () => {
      if (confirm('Trigger hot memory consolidation now? This moves stable facts into active-wiki / MEMORY.md.')) {
        await this.consolidateMemory();
      }
    };
  }
};

// ── Notifications Drawer ───────────────────────────────────────────────────

CommandDeck.prototype.fetchNotifications = async function() {
  try {
    const res = await fetch(`${this.apiBase}/api/notifications`);
    if (!res.ok) return;
    const data = await res.json();
    
    const countEl = document.getElementById('notification-drawer-count');
    const badgeDot = document.getElementById('notification-badge-dot');
    const bodyEl = document.getElementById('notification-drawer-body');
    
    const count = data.count || 0;
    if (countEl) countEl.textContent = count;
    if (badgeDot) {
      badgeDot.style.display = count > 0 ? 'block' : 'none';
    }
    
    if (bodyEl) {
      if (!data.notifications || data.notifications.length === 0) {
        bodyEl.innerHTML = `
          <div class="empty-state">
            <div class="empty-state__icon">🔔</div>
            <div class="empty-state__title">No Notifications</div>
            <div class="empty-state__desc">All clear. No pending alerts or reminders.</div>
          </div>
        `;
      } else {
        bodyEl.innerHTML = data.notifications.map(n => `
          <div class="notification-card notification-card--${n.type}" style="cursor:pointer;" data-link="${escapeHtml(n.link || '')}">
            <div class="notification-header">
              <span class="badge ${n.type === 'warning' ? 'badge-critical' : n.type === 'reminder' ? 'badge-cyan' : 'badge-medium'}">${escapeHtml(n.type.toUpperCase())}</span>
              <span class="notification-time">${escapeHtml(n.timestamp || '')}</span>
            </div>
            <div class="notification-title">${escapeHtml(n.title)}</div>
            ${n.subtitle ? `<div class="notification-subtitle">${escapeHtml(n.subtitle)}</div>` : ''}
          </div>
        `).join('');

        bodyEl.querySelectorAll('.notification-card').forEach(card => {
          card.onclick = () => {
            const link = card.dataset.link;
            if (link === '#tasks') window.commandDeck?.showView('tasks');
            else if (link === '#agents') window.commandDeck?.showView('agents');
            const drawer = document.getElementById('notification-drawer');
            if (drawer) {
              drawer.classList.remove('open');
              setTimeout(() => { drawer.style.display = 'none'; }, 200);
            }
          };
        });
      }
    }
  } catch (e) {
    console.warn('Notifications fetch error:', e);
  }
};

CommandDeck.prototype.initNotificationDrawer = function() {
  const btn = document.getElementById('btn-notifications');
  const drawer = document.getElementById('notification-drawer');
  const closeBtn = document.getElementById('notification-close');
  const backdrop = document.getElementById('notification-backdrop');
  
  if (btn && drawer) {
    btn.onclick = () => {
      drawer.style.display = 'flex';
      requestAnimationFrame(() => drawer.classList.add('open'));
      this.fetchNotifications();
    };
  }
  
  const closeDrawer = () => {
    if (!drawer) return;
    drawer.classList.remove('open');
    setTimeout(() => { drawer.style.display = 'none'; }, 250);
  };
  
  if (closeBtn) closeBtn.onclick = closeDrawer;
  if (backdrop) backdrop.onclick = closeDrawer;
};

// ── Daily Briefing Text-to-Speech (Read Aloud) ──────────────────────────────

CommandDeck.prototype.initBriefingTTS = function() {
  const btn = document.getElementById('btn-read-briefing');
  const label = document.getElementById('briefing-tts-label');
  const icon = document.getElementById('briefing-tts-icon');
  if (!btn || !('speechSynthesis' in window)) {
    if (btn) btn.style.display = 'none';
    return;
  }
  
  btn.onclick = () => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      if (label) label.textContent = 'Read Aloud';
      if (icon) icon.textContent = '🔊';
      return;
    }
    
    const summary = document.getElementById('briefing-summary')?.textContent || '';
    const prompt = document.getElementById('briefing-prompt-text')?.textContent || '';
    const text = `${summary}. Recommended focus: ${prompt}`;
    
    if (!text.trim() || text.includes('Loading...')) return;
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    
    utterance.onstart = () => {
      if (label) label.textContent = 'Stop';
      if (icon) icon.textContent = '⏹️';
    };
    
    utterance.onend = () => {
      if (label) label.textContent = 'Read Aloud';
      if (icon) icon.textContent = '🔊';
    };
    
    utterance.onerror = () => {
      if (label) label.textContent = 'Read Aloud';
      if (icon) icon.textContent = '🔊';
    };
    
    window.speechSynthesis.speak(utterance);
  };
};

// ── Interactive Knowledge Graph & Wiki Preview ──────────────────────────────

CommandDeck.prototype.fetchKnowledgeGraph = async function() {
  const canvas = document.getElementById('knowledge-graph-canvas');
  if (!canvas) return;
  
  if (!this.graphVisualizer) {
    this.graphVisualizer = new GraphVisualizer('knowledge-graph-canvas', {
      onNodeClick: (node) => this.openWikiDrawer(node)
    });
    const resetBtn = document.getElementById('btn-graph-reset');
    if (resetBtn) {
      resetBtn.onclick = () => this.graphVisualizer.resetZoom();
    }
  } else {
    this.graphVisualizer.initCanvasSize();
    this.graphVisualizer.render();
  }
  
  try {
    const res = await fetch(`${this.apiBase}/api/graphify/data`);
    if (!res.ok) return;
    const data = await res.json();
    this.graphVisualizer.setData(data);
    
    const countEl = document.getElementById('graph-node-count');
    if (countEl) countEl.textContent = `${data.nodes?.length || 0} nodes`;
  } catch (e) {
    console.warn('Knowledge graph fetch error:', e);
  }
};

CommandDeck.prototype.openWikiDrawer = async function(node) {
  const drawer = document.getElementById('wiki-node-drawer');
  const titleEl = document.getElementById('wiki-node-title');
  const bodyEl = document.getElementById('wiki-node-body');
  const closeBtn = document.getElementById('wiki-node-close');
  const backdrop = document.getElementById('wiki-node-backdrop');
  
  if (!drawer) return;
  
  drawer.style.display = 'flex';
  requestAnimationFrame(() => drawer.classList.add('open'));
  
  const closeDrawer = () => {
    drawer.classList.remove('open');
    setTimeout(() => { drawer.style.display = 'none'; }, 250);
  };
  
  if (closeBtn) closeBtn.onclick = closeDrawer;
  if (backdrop) backdrop.onclick = closeDrawer;
  
  if (titleEl) titleEl.textContent = node.label || node.id || 'Wiki Document';
  if (bodyEl) {
    bodyEl.innerHTML = `
      <div style="margin-bottom:12px; display:flex; gap:8px;">
        <span class="badge badge-cyan">${escapeHtml(node.tier || 'active-wiki')}</span>
        <span class="badge badge-medium">${escapeHtml(node.epistemic || 'heuristic')}</span>
      </div>
      <div class="agent-loading">Loading document content...</div>
    `;
    
    try {
      const pagePath = node.path || node.id;
      const res = await fetch(`${this.apiBase}/api/wiki/page?path=${encodeURIComponent(pagePath)}`);
      if (res.ok) {
        const pageData = await res.json();
        const content = pageData.content || 'No content found for this document.';
        bodyEl.innerHTML = `
          <div style="margin-bottom:12px; display:flex; gap:8px;">
            <span class="badge badge-cyan">${escapeHtml(node.tier || 'active-wiki')}</span>
            <span class="badge badge-medium">${escapeHtml(node.epistemic || 'heuristic')}</span>
          </div>
          <div class="wiki-markdown-body" style="white-space:pre-wrap; font-family:var(--font-sans); line-height:1.6;">${escapeHtml(content)}</div>
        `;
      } else {
        bodyEl.innerHTML = `
          <div style="margin-bottom:12px; display:flex; gap:8px;">
            <span class="badge badge-cyan">${escapeHtml(node.tier || 'active-wiki')}</span>
            <span class="badge badge-medium">${escapeHtml(node.epistemic || 'heuristic')}</span>
          </div>
          <div class="empty-hint">No source markdown file found for ${escapeHtml(node.id)}.</div>
        `;
      }
    } catch (e) {
      bodyEl.innerHTML = `<div class="empty-hint">Error loading document: ${escapeHtml(e.message)}</div>`;
    }
  }
};

// ── Homelab Container Operations (Logs & Restart) ───────────────────────────

CommandDeck.prototype.openContainerLogs = async function(containerName) {
  const drawer = document.getElementById('container-logs-drawer');
  const titleEl = document.getElementById('container-logs-title');
  const contentEl = document.getElementById('container-logs-content');
  const closeBtn = document.getElementById('container-logs-close');
  const backdrop = document.getElementById('container-logs-backdrop');
  const refreshBtn = document.getElementById('container-logs-refresh');
  
  if (!drawer) return;
  drawer.style.display = 'flex';
  requestAnimationFrame(() => drawer.classList.add('open'));
  
  const closeDrawer = () => {
    drawer.classList.remove('open');
    setTimeout(() => { drawer.style.display = 'none'; }, 250);
  };
  
  if (closeBtn) closeBtn.onclick = closeDrawer;
  if (backdrop) backdrop.onclick = closeDrawer;
  
  if (titleEl) titleEl.textContent = `${containerName} Logs`;
  if (contentEl) contentEl.textContent = 'Loading container logs...';
  
  const loadLogs = async () => {
    try {
      const res = await fetch(`${this.apiBase}/api/docker/containers/${encodeURIComponent(containerName)}/logs`);
      if (res.ok) {
        const data = await res.json();
        if (contentEl) contentEl.textContent = data.logs || 'No logs received.';
      } else {
        if (contentEl) contentEl.textContent = `Could not fetch logs (HTTP ${res.status})`;
      }
    } catch (e) {
      if (contentEl) contentEl.textContent = `Error: ${e.message}`;
    }
  };
  
  if (refreshBtn) refreshBtn.onclick = loadLogs;
  await loadLogs();
};

CommandDeck.prototype.restartContainer = async function(containerName) {
  if (!confirm(`Are you sure you want to restart container "${containerName}"?`)) return;
  try {
    const res = await fetch(`${this.apiBase}/api/docker/containers/${encodeURIComponent(containerName)}/restart`, {
      method: 'POST'
    });
    const data = await res.json();
    alert(data.message || `Container ${containerName} restarted.`);
  } catch (e) {
    alert(`Failed to restart container: ${e.message}`);
  }
};
