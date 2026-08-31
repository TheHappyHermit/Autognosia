
  // ── Phase 2: Service Grid, Media & Queue ──────────────────────────────────

  CommandDeck.prototype.getServiceIcon = function(name) {
    const icons = {
      'Jellyfin': '🎬',
      'Plex': '🎥',
      'Sonarr': '📺',
      'Radarr': '🎞️',
      'qBittorrent': '⬇️',
      'Traefik': '🚦',
      'Uptime Kuma': '📊',
      'Grafana': '📈',
      'Prometheus': '⚡',
      'FreshRSS': '📰',
      'Home Assistant': '🏠',
    };
    return icons[name] || '⚙️';
  }

  CommandDeck.prototype.formatSize = function() {
    if (!bytes) return '';
    const gb = bytes / (1024 * 1024 * 1024);
    return gb >= 1 ? `${gb.toFixed(1)} GB` : `${(bytes / (1024 * 1024)).toFixed(0)} MB`;
  }

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
  }

  CommandDeck.prototype.renderServiceGrid = function(services) {
    const grid = this.getViewEl('service-grid');
    if (!grid) return;

    grid.innerHTML = Object.values(services).map(svc => {
      const badgeHtml = svc.details?.queue_count
        ? `<div class="service-card__queue" aria-label="${svc.details.queue_count} pending">${svc.details.queue_count} pending</div>`
        : '';
      const metricHtml = svc.details?.sessions
        ? `<div class="service-card__metric"><span class="metric-label">Sessions</span><span class="metric-val">${svc.details.sessions}</span></div>`
        : '';
      return `
        <div class="service-card" data-service="${svc.name.toLowerCase()}"
             data-status="${svc.health}" tabindex="0" role="listitem"
             aria-label="${svc.name}: ${svc.health}">
          ${badgeHtml}
          <div class="service-card__header">
            <span class="service-card__icon" aria-hidden="true">${this.getServiceIcon(svc.name)}</span>
            <span class="service-card__status status-dot status-dot--${svc.health}" aria-label="${svc.health}"></span>
          </div>
          <div class="service-card__body">
            <h3 class="service-card__name">${svc.name}</h3>
            <span class="service-card__port">:${svc.port}</span>
            ${metricHtml}
          </div>
        </div>`;
    }).join('');
  }

  CommandDeck.prototype.updateServiceStatus = function(services) {
    const statusEl = this.getViewEl('services-status');
    if (!statusEl) return;

    const healthy = Object.values(services).filter(s => s.health === 'healthy').length;
    const unhealthy = Object.values(services).filter(s => s.health !== 'healthy').length;

    if (healthy === Object.keys(services).length) {
      statusEl.innerHTML = '<span class="panel-status__dot panel-status__dot--ok" aria-hidden="true"></span><span>All services healthy</span>';
    } else {
      statusEl.innerHTML = `<span class="panel-status__dot panel-status__dot--warn" aria-hidden="true"></span><span>${healthy} up, ${unhealthy} down</span>`;
    }

    // Update freshness stamp
    const freshEl = this.getViewEl('services-freshness-text');
    if (freshEl) freshEl.textContent = 'updated just now';
    const freshEl2 = this.getViewEl('services-freshness');
    if (freshEl2) {
      freshEl2.classList.remove('is-stale');
      const dot = freshEl2.querySelector('.panel-freshness__dot');
      if (dot) dot.className = 'panel-freshness__dot panel-freshness__dot--fresh';
    }
  }

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
  }

  CommandDeck.prototype.renderMediaGrid = function(streams) {
    const grid = this.getViewEl('media-grid');
    if (!grid) return;

    const countEl = this.getViewEl('media-count');
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
  }

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
  }

  CommandDeck.prototype.renderQueue = function(queue) {
    const list = this.getViewEl('queue-list');
    if (!list) return;

    const countEl = this.getViewEl('queue-count');
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
  }


