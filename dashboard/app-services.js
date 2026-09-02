import { CommandDeck } from './app-core.js';

// ── Phase 2: Service Grid, Media & Queue ──────────────────────────────────

CommandDeck.prototype.getServiceIcon = function(name) {
  const icons = {
    'Jellyfin': '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>',
    'Plex': '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="15" rx="2" ry="2"/><polyline points="17 2 12 7 7 2"/></svg>',
    'Sonarr': '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>',
    'Radarr': '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/></svg>',
    'qBittorrent': '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
    'Traefik': '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
    'Uptime Kuma': '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>',
    'Grafana': '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>',
    'Prometheus': '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
    'FreshRSS': '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11a9 9 0 0 1 9 9"/><path d="M4 4a16 16 0 0 1 16 16"/><circle cx="5" cy="19" r="1"/></svg>',
    'Home Assistant': '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
  };
  return icons[name] || '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>';
};

CommandDeck.prototype.getServiceSvg = function(name) {
  const svgs = {
    'Jellyfin': '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>',
    'Plex': '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="15" rx="2" ry="2"/><polyline points="17 2 12 7 7 2"/></svg>',
    'Sonarr': '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>',
    'Radarr': '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/><line x1="17" y1="17" x2="22" y2="17"/></svg>',
    'qBittorrent': '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
    'Traefik': '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
    'Uptime Kuma': '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>',
    'Grafana': '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>',
    'Prometheus': '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
    'FreshRSS': '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11a9 9 0 0 1 9 9"/><path d="M4 4a16 16 0 0 1 16 16"/><circle cx="5" cy="19" r="1"/></svg>',
    'Home Assistant': '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
  };
  return svgs[name] || '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>';
};

CommandDeck.prototype.formatSize = function(bytes) {
  if (!bytes) return '';
  const gb = bytes / (1024 * 1024 * 1024);
  return gb >= 1 ? `${gb.toFixed(1)} GB` : `${(bytes / (1024 * 1024)).toFixed(0)} MB`;
};

CommandDeck.prototype.fetchServices = async function() {
  try {
    const res = await fetch(`${this.apiBase}/api/services`);
    if (res.ok) {
      const services = await res.json();
      this.renderServiceGrid(services);
      this.updateServiceStatus(services);
    }
  } catch (e) {
    console.warn('Service fetch error:', e);
  }
};

CommandDeck.prototype.renderServiceGrid = function(services) {
  const grid = document.getElementById('service-grid');
  const viewGrid = document.getElementById('service-grid-view');

  const svcList = Array.isArray(services) ? services : Object.values(services || {});

  const svcHtml = svcList.map(svc => {
    const badgeHtml = svc.details?.queue_count
      ? `<div class="service-card__queue" aria-label="${svc.details.queue_count} pending">${svc.details.queue_count} pending</div>`
      : '';
    const metricHtml = svc.details?.sessions
      ? `<div class="service-card__metric"><span class="metric-label">Sessions</span><span class="metric-val">${svc.details.sessions}</span></div>`
      : '';
    const icon = this.getServiceSvg(svc.name);
    return `
      <a href="http://localhost:${svc.port}" target="_blank" rel="noopener"
         class="service-card" data-service="${svc.name.toLowerCase()}"
         data-status="${svc.health}" tabindex="0" role="listitem"
         aria-label="${svc.name}: ${svc.health}">
        ${badgeHtml}
        <div class="service-card__header">
          <span class="service-card__icon" aria-hidden="true">${icon}</span>
          <span class="service-card__status status-dot status-dot--${svc.health}" aria-label="${svc.health}"></span>
        </div>
        <div class="service-card__body">
          <h3 class="service-card__name">${svc.name}</h3>
          <span class="service-card__port">:${svc.port}</span>
          ${metricHtml}
        </div>
      </a>`;
  }).join('');

  if (grid) grid.innerHTML = svcHtml;
  if (viewGrid) viewGrid.innerHTML = svcHtml;
};

CommandDeck.prototype.updateServiceStatus = function(services) {
  const statusEl = document.getElementById('services-status');
  const viewStatusEl = document.getElementById('services-view-status');
  const updateEl = (el) => {
    if (!el) return;
    const healthy = Object.values(services).filter(s => s.health === 'healthy').length;
    const unhealthy = Object.values(services).filter(s => s.health !== 'healthy').length;
    if (healthy === Object.keys(services).length) {
      el.innerHTML = '<span class="panel-status__dot panel-status__dot--ok" aria-hidden="true"></span><span>All services healthy</span>';
    } else {
      el.innerHTML = `<span class="panel-status__dot panel-status__dot--warn" aria-hidden="true"></span><span>${healthy} up, ${unhealthy} down</span>`;
    }
  };
  updateEl(statusEl);
  updateEl(viewStatusEl);

  // Update freshness stamp
  const freshEl = document.getElementById('services-freshness-text');
  if (freshEl) freshEl.textContent = 'updated just now';
  const freshEl2 = document.getElementById('services-freshness');
  if (freshEl2) {
    freshEl2.classList.remove('is-stale');
    const dot = freshEl2.querySelector('.panel-freshness__dot');
    if (dot) dot.className = 'panel-freshness__dot panel-freshness__dot--fresh';
  }
};

CommandDeck.prototype.fetchMedia = async function() {
  try {
    const res = await fetch(`${this.apiBase}/api/media/active`);
    if (res.ok) {
      const streams = await res.json();
      this.renderMediaGrid(streams);
    }
  } catch (e) {
    console.warn('Media fetch error:', e);
  }
};

CommandDeck.prototype.renderMediaGrid = function(streams) {
  const grid = document.getElementById('media-grid');
  if (!grid) return;

  const countEl = document.getElementById('media-count');
  if (countEl) countEl.textContent = `${streams.length} active stream${streams.length !== 1 ? 's' : ''}`;

  if (streams.length === 0) {
    grid.innerHTML = '<div class="media-placeholder">No active streams</div>';
    return;
  }

  grid.innerHTML = streams.map(s => {
    const progress = s.total ? (s.progress / s.total) * 100 : 0;
    return `
      <div class="media-card">
        <div class="media-card__info">
          <span class="media-card__service">${s.service}</span>
          <h3 class="media-card__title">${s.title || 'Unknown'}</h3>
          <span class="media-card__user">${s.user || '?'} on ${s.device || 'unknown'}</span>
        </div>
        <div class="media-card__progress">
          <div class="media-card__progress-bar" style="width: ${progress}%"></div>
        </div>
      </div>`;
  }).join('');
};

CommandDeck.prototype.fetchQueue = async function() {
  try {
    const res = await fetch(`${this.apiBase}/api/queue`);
    if (res.ok) {
      const queue = await res.json();
      this.renderQueue(queue);
    }
  } catch (e) {
    console.warn('Queue fetch error:', e);
  }
};

CommandDeck.prototype.renderQueue = function(queue) {
  const list = document.getElementById('queue-list');
  if (!list) return;

  const countEl = document.getElementById('queue-count');
  if (countEl) countEl.textContent = `${queue.length} pending`;

  if (queue.length === 0) {
    list.innerHTML = '<div class="queue-placeholder">Queue is empty</div>';
    return;
  }

  list.innerHTML = queue.map(item => `
    <div class="queue-item" data-service="${item.service}">
      <span class="queue-item__service queue-badge queue-badge--${item.service.toLowerCase()}">${item.service}</span>
      <span class="queue-item__title">${item.title}</span>
      <span class="queue-item__size">${this.formatSize(item.size)}</span>
    </div>
  `).join('');
};
