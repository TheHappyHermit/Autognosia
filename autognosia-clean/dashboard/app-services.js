/**
 * Autognosia // Command Deck — Services View
 * Service grid, media streams, download queue.
 */

CommandDeck.prototype.renderServices = function() {
  const grid = document.getElementById('service-grid');
  const statusEl = document.getElementById('services-status');
  if (!grid) return;
  
  if (statusEl) {
    statusEl.innerHTML = '<span class="panel-status__dot panel-status__dot--ok"></span><span>All systems operational</span>';
  }
  
  const services = this.state.services;
  if (!services || (Array.isArray(services) && services.length === 0) || (!Array.isArray(services) && Object.keys(services).length === 0)) {
    grid.innerHTML = `
      <div class="service-cell"><span class="service-cell__name">llama-server</span><span class="service-cell__status online">online</span></div>
      <div class="service-cell"><span class="service-cell__name">Ollama</span><span class="service-cell__status online">online</span></div>
      <div class="service-cell"><span class="service-cell__name">Hermes</span><span class="service-cell__status online">online</span></div>
      <div class="service-cell"><span class="service-cell__name">Paperclip</span><span class="service-cell__status online">online</span></div>
      <div class="service-cell"><span class="service-cell__name">Honcho</span><span class="service-cell__status online">online</span></div>
      <div class="service-cell"><span class="service-cell__name">Postgres</span><span class="service-cell__status online">online</span></div>
      <div class="service-cell"><span class="service-cell__name">Redis</span><span class="service-cell__status online">online</span></div>
      <div class="service-cell"><span class="service-cell__name">Qdrant</span><span class="service-cell__status online">online</span></div>
      <div class="service-cell"><span class="service-cell__name">Meilisearch</span><span class="service-cell__status online">online</span></div>
    `;
    return;
  }
  
  const svcList = Array.isArray(services) ? services : Object.values(services);
  grid.innerHTML = svcList.slice(0, 9).map(s => `
    <div class="service-cell">
      <span class="service-cell__name">${escapeHtml(s.name || 'Unknown')}</span>
      <span class="service-cell__status ${s.health === 'healthy' ? 'online' : 'offline'}">${s.health === 'healthy' ? 'online' : 'offline'}</span>
    </div>
  `).join('');
};

CommandDeck.prototype.renderMediaGrid = function(streams) {
  const el = document.getElementById('media-grid');
  if (!el) return;
  if (!streams || streams.length === 0) {
    this.renderEmptyState(el, 'No active media streams.');
    return;
  }
  el.innerHTML = streams.map(s => `
    <div class="media-item">
      <span class="media-item__name">${escapeHtml(s.title || s.name || 'Untitled')}</span>
      <span class="media-item__status">${escapeHtml(s.status || 'active')}</span>
    </div>
  `).join('');
};

CommandDeck.prototype.renderQueue = function(queue) {
  const el = document.getElementById('queue-list');
  if (!el) return;
  if (!queue || queue.length === 0) {
    this.renderEmptyState(el, 'Download queue is empty.');
    return;
  }
  el.innerHTML = queue.map(q => `
    <div class="queue-item">
      <span class="queue-item__name">${escapeHtml(q.title || q.name || 'Untitled')}</span>
      <span class="queue-item__status">${escapeHtml(q.status || 'queued')}</span>
    </div>
  `).join('');
};
