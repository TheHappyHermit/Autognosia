import { CommandDeck } from './app-core.js';

// ── Emails & Communications ────────────────────────────────────────────────

CommandDeck.prototype.renderEmails = function() {
  const container = document.getElementById('email-stream-container');
  const badge = document.getElementById('email-unread-badge');
  const unreadCount = this.state.emails.filter(e => !e.read).length;
  if (badge) badge.textContent = `${unreadCount} Pending Action`;

  if (this.state.emails.length === 0) {
    container.innerHTML = '<div class="empty-hint">No triaged communications in inbox.</div>';
    return;
  }

  container.innerHTML = this.state.emails.map(em => `
    <div class="email-card ${em.read ? 'read' : ''}" data-email-id="${em.id}">
      <div class="email-head">
        <span class="email-sender">${escapeHtml(em.sender.split('<')[0])}</span>
        <span class="email-time">${escapeHtml(em.timestamp)}</span>
      </div>
      <div class="email-subject">${escapeHtml(em.subject)}</div>
      <div style="font-size:11px; color:var(--text-secondary);">${escapeHtml(em.summary)}</div>
      ${em.extracted_action_items && em.extracted_action_items.length > 0 ? `
        <div class="email-action-box">
          ${em.extracted_action_items.map(a => `<div>▸ <strong>Action:</strong> ${escapeHtml(a.task)} (Due: ${escapeHtml(a.due)})</div>`).join('')}
        </div>
      ` : ''}
    </div>
  `).join('');
};

// ── Prospective Intentions ─────────────────────────────────────────────────

CommandDeck.prototype.renderIntentions = function() {
  const container = document.getElementById('intentions-stream-container');
  if (!container) return;

  if (this.state.intentions.length === 0) {
    container.innerHTML = '<div class="empty-hint">No active prospective intentions registered.</div>';
    return;
  }

  container.innerHTML = this.state.intentions.map(i => `
    <div class="intention-card">
      <div class="intention-cue"><strong>IF:</strong> ${escapeHtml(i.cue)}</div>
      <div class="intention-action"><strong>THEN:</strong> ${escapeHtml(i.action)}</div>
    </div>
  `).join('');
};

// ── Telemetry Drawer ───────────────────────────────────────────────────────

CommandDeck.prototype.renderTelemetry = function() {
  const t = this.state.telemetry;
  const body = document.getElementById('telemetry-body');
  if (!body) return;

  let html = '';

  // Docker services
  html += `
    <div class="telemetry-block">
      <h4>CONTAINER SERVICES (DOCKER)</h4>
      ${t.containers && t.containers.length > 0 ? t.containers.map(c => `
        <div>✓ <strong>${escapeHtml(c.name)}</strong>: ${escapeHtml(c.status)}</div>
      `).join('') : '<div style="color:var(--text-muted);">No Docker containers currently active.</div>'}
    </div>
  `;

  // Profiles
  html += `
    <div class="telemetry-block">
      <h4>COGNITIVE PROFILES (6)</h4>
      ${t.profiles ? Object.entries(t.profiles).map(([prof, stat]) => `
        <div>• <strong>${prof}</strong>: <span style="color:var(--accent-emerald)">${stat}</span></div>
      `).join('') : ''}
    </div>
  `;

  // Databases
  html += `
    <div class="telemetry-block">
      <h4>DETERMINISTIC STORAGE</h4>
      ${t.databases ? Object.entries(t.databases).map(([db, sz]) => `
        <div>• <strong>${db}</strong>: ${sz}</div>
      `).join('') : ''}
    </div>
  `;

  body.innerHTML = html;
};
