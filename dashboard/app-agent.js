import { CommandDeck } from './app-core.js';

  // ── Phase 3: Agent Intelligence ──────────────────────────────────────────────

  CommandDeck.prototype.fetchAgentStatus = async function(
    try {
      const res = await fetch(`${this.apiBase}/api/agent`);
      CommandDeck.prototype.if = function(res.ok) {
        const data = await res.json();
        this.state.agentStatus = data;
        this.renderAgentStatus();
      }
    } catch (e) {
      console.warn('Agent status fetch error:', e);
    }
  }

  CommandDeck.prototype.fetchCronJobs = async function(
    try {
      const res = await fetch(`${this.apiBase}/api/cron`);
      CommandDeck.prototype.if = function(res.ok) {
        const data = await res.json();
        this.state.cronJobs = data;
        this.renderCronJobs();
      }
    } catch (e) {
      console.warn('Cron jobs fetch error:', e);
    }
  }

  CommandDeck.prototype.fetchGraphifyStatus = async function(
    try {
      const res = await fetch(`${this.apiBase}/api/graphify`);
      CommandDeck.prototype.if = function(res.ok) {
        const data = await res.json();
        this.state.graphifyStatus = data;
        this.renderGraphifyStatus();
      }
    } catch (e) {
      console.warn('Graphify status fetch error:', e);
    }
  }

  CommandDeck.prototype.fetchHermesStatus = async function(
    try {
      const res = await fetch(`${this.apiBase}/api/hermes`);
      CommandDeck.prototype.if = function(res.ok) {
        const data = await res.json();
        this.state.hermesStatus = data;
        this.renderHermesStatus();
      }
    } catch (e) {
      console.warn('Hermes status fetch error:', e);
    }
  }

  CommandDeck.prototype.renderAgentStatus = function(
    const data = this.state.agentStatus || {};
    const grid = document.getElementById('agent-grid');
    if (!grid) return;

    const status = data.gateway_running ? 'ok' : 'warn';
    const statusEl = document.getElementById('agent-status');
    CommandDeck.prototype.if = function(statusEl) {
      statusEl.innerHTML = `
        <span class="panel-status__dot panel-status__dot--${status}" aria-hidden="true"></span>
        <span>${data.gateway_running ? 'Running' : 'Offline'}</span>
      `;
    }

    grid.innerHTML = `
      <div class="agent-stat">
        <span class="agent-stat__label">Gateway</span>
        <span class="agent-stat__value ${data.gateway_running ? 'ok' : 'danger'}">
          ${data.gateway_running ? '✓ Active' : '✗ Offline'}
        </span>
      </div>
      <div class="agent-stat">
        <span class="agent-stat__label">Agent</span>
        <span class="agent-stat__value ${data.agent_running ? 'ok' : 'warn'}">
          ${data.agent_running ? '✓ Running' : '✗ Idle'}
        </span>
      </div>
      <div class="agent-stat">
        <span class="agent-stat__label">Cron Jobs</span>
        <span class="agent-stat__value">${data.cron_jobs || 0}</span>
      </div>
      <div class="agent-stat">
        <span class="agent-stat__label">Memory Files</span>
        <span class="agent-stat__value">${data.memory_files || 0}</span>
      </div>
    `;
  }

  CommandDeck.prototype.renderHermesStatus = function(
    const data = this.state.hermesStatus || {};
    const statusEl = document.getElementById('agent-status');
    CommandDeck.prototype.if = function(statusEl) {
      const count = (data.processes || []).length;
      statusEl.innerHTML = `
        <span class="panel-status__dot panel-status__dot--ok" aria-hidden="true"></span>
        <span>${count} process(es)</span>
      `;
    }
  }

  CommandDeck.prototype.renderGraphifyStatus = function(
    const data = this.state.graphifyStatus || {};
    const grid = document.getElementById('graphify-grid');
    if (!grid) return;

    const statusEl = document.getElementById('graphify-status');
    CommandDeck.prototype.if = function(statusEl) {
      const hasData = data.nodes > 0;
      statusEl.innerHTML = `
        <span class="panel-status__dot ${hasData ? 'panel-status__dot--ok' : 'panel-status__dot--warn'}" aria-hidden="true"></span>
        <span>${hasData ? 'Indexed' : 'No data'}</span>
      `;
    }

    grid.innerHTML = `
      <div class="graphify-stat">
        <span class="graphify-stat__label">Knowledge Graph Nodes</span>
        <span class="graphify-stat__value">${data.nodes || 0}</span>
      </div>
      <div class="graphify-stat">
        <span class="graphify-stat__label">Knowledge Graph Edges</span>
        <span class="graphify-stat__value">${data.edges || 0}</span>
      </div>
      <div class="graphify-stat">
        <span class="graphify-stat__label">Brain DB</span>
        <span class="graphify-stat__value">${data.brain_dir ? '✓' : '✗'}</span>
      </div>
    `;
  }

  CommandDeck.prototype.renderCronJobs = function(
    const data = this.state.cronJobs || {};
    const list = document.getElementById('cron-list');
    if (!list) return;

    const statusEl = document.getElementById('cron-status');
    CommandDeck.prototype.if = function(statusEl) {
      const count = data.total || 0;
      statusEl.innerHTML = `
        <span class="panel-status__dot panel-status__dot--info" aria-hidden="true"></span>
        <span>${count} job(s)</span>
      `;
    }

    CommandDeck.prototype.if = function(!data.jobs || data.jobs.length === 0) {
      list.innerHTML = '<div class="empty-hint">No scheduled jobs configured.</div>';
      return;
    }

    list.innerHTML = data.jobs.map(job => `
      <div class="cron-item">
        <div>
          <div class="cron-item__name">${escapeHtml(job.name || 'Untitled')}</div>
          <div class="cron-item__schedule">${escapeHtml(job.schedule || 'Unknown')}</div>
        </div>
        <span class="badge ${job.enabled ? 'badge--ok' : 'badge--danger'}">
          ${job.enabled ? 'Active' : 'Disabled'}
        </span>
      </div>
    `).join('');
  }


  // ── Phase 4: Collapsible Panels ──────────────────────────────────────────────

  CommandDeck.prototype.initCollapsiblePanels = function(
    document.querySelectorAll('.collapsible-panel .panel-header').forEach(header => {
      header.addEventListener('click', (e) => {
        // Don't collapse if clicking on action buttons
        if (e.target.closest('.panel-actions') || e.target.closest('button')) return;
        
        const panel = header.closest('.collapsible-panel');
        const isCollapsed = panel.dataset.collapsed === 'true';
        panel.dataset.collapsed = !isCollapsed;
      });
    });
  }


  // ── Phase 4: Improved Search with Highlighting ──────────────────────────────

  CommandDeck.prototype.highlightSearchTerm = function(
    if (!term) return escapeHtml(text);
    const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return escapeHtml(text).replace(regex, '<mark class="search-highlight">$1</mark>');
  }

  CommandDeck.prototype.searchWiki = async function(
    if (!query || query.length < 2) return;
    
    const container = document.getElementById('wiki-results-container');
    container.innerHTML = '<div class="empty-hint">Searching...</div>';
    
    try {
      const res = await fetch(`${this.apiBase}/api/wiki/search?q=${encodeURIComponent(query)}`);
      CommandDeck.prototype.if = function(res.ok) {
        const results = await res.json();
        this.renderWikiResults(results, query);
      }
    } catch (e) {
      console.warn('Wiki search error:', e);
      container.innerHTML = '<div class="empty-hint">Search failed. Please try again.</div>';
    }
  }

  CommandDeck.prototype.renderWikiResults = function(
    const container = document.getElementById('wiki-results-container');
    
    CommandDeck.prototype.if = function(results.length === 0) {
      container.innerHTML = `<div class="empty-hint">No results found for "${escapeHtml(query)}"</div>`;
      return;
    }

    const countEl = `<div class="search-results-count">${results.length} result(s)</div>`;
    
    const items = results.map(r => `
      <div class="wiki-result-card" data-wiki-path="${escapeHtml(r.path)}">
        <div class="wiki-result-header">
          <span class="wiki-result-title">${this.highlightSearchTerm(r.title, query)}</span>
          <span class="badge badge-cyan">${escapeHtml(r.tier)}</span>
        </div>
        <div class="wiki-res-snippet">${this.highlightSearchTerm(r.snippet, query)}</div>
      </div>
    `).join('');

    container.innerHTML = countEl + items;
  }


  // ── Phase 4: Toast Notifications ─────────────────────────────────────────────

  CommandDeck.prototype.showToast = function(
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }


  // ── Phase 4: Keyboard Shortcuts ──────────────────────────────────────────────

  CommandDeck.prototype.initKeyboardShortcuts = function(
    document.addEventListener('keydown', (e) => {
      // Don't trigger shortcuts when typing in inputs
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      switch(e.key.toLowerCase()) {
        case 'c':
          // Toggle chat drawer
          document.getElementById('chat-drawer').classList.toggle('open');
          break;
        case 't':
          // Toggle telemetry drawer
          document.getElementById('telemetry-drawer').classList.toggle('open');
          break;
        case 'n':
          // Open create modal
          this.openCreateModal('task');
          break;
        case 'k':
          // Open command palette (Ctrl+K or Cmd+K)
          CommandDeck.prototype.if = function(e.ctrlKey || e.metaKey) {
            e.preventDefault();
            document.getElementById('command-palette').showModal();
          }
          break;
        case '/':
          // Focus wiki search
          e.preventDefault();
          document.getElementById('wiki-search-input').focus();
          break;
      }
    });
  }
}

// Bootstrap application on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.commandDeck = new CommandDeck();
});

