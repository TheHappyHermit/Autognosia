/**
 * Autognosia // Command Deck — Tasks View
 * Kanban board with filtering.
 */

CommandDeck.prototype.renderTasks = function() {
  const activeContainer = document.getElementById('task-list-container');
  const waitingContainer = document.getElementById('waiting-list-container');
  if (!activeContainer || !waitingContainer) return;
  
  const allTasks = this.state.tasks || [];
  let filtered = allTasks;
  if (this.taskFilter === 'critical') filtered = allTasks.filter(t => t.priority === 'critical');
  else if (this.taskFilter === 'in_progress') filtered = allTasks.filter(t => t.status === 'in_progress');
  else if (this.taskFilter === 'next') filtered = allTasks.filter(t => t.status === 'active');
  else if (this.taskFilter === 'completed') filtered = allTasks.filter(t => t.status === 'completed');
  
  const active = filtered.filter(t => t.status !== 'completed' && t.status !== 'blocked');
  const waiting = filtered.filter(t => t.status === 'blocked' || t.status === 'waiting');
  
  if (active.length === 0) {
    activeContainer.innerHTML = '<div class="empty-hint">No active tasks.</div>';
  } else {
    activeContainer.innerHTML = active.map(t => this.renderTaskCard(t)).join('');
  }
  
  if (waiting.length === 0) {
    waitingContainer.innerHTML = '<div class="empty-hint">Nothing waiting.</div>';
  } else {
    waitingContainer.innerHTML = waiting.map(t => this.renderTaskCard(t)).join('');
  }
};

CommandDeck.prototype.renderTaskCard = function(task) {
  return `
    <div class="task-card" data-id="${task.id}">
      <div class="task-card__title">${escapeHtml(task.title)}</div>
      <div class="task-card__meta">
        <span class="badge badge-${task.priority}">${escapeHtml(task.priority)}</span>
        ${task.due_at ? `<span class="task-card__due">⏰ ${escapeHtml(task.due_at)}</span>` : ''}
      </div>
      ${task.project_name ? `<div class="task-card__project">${escapeHtml(task.project_name)}</div>` : ''}
    </div>
  `;
};
