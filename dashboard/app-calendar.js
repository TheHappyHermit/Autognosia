import { CommandDeck, escapeHtml } from './app-core.js';

// ── Calendar Rendering & Upcoming Schedule List ────────────────────────────

function strToDateStr(str) {
  if (!str) return '';
  return str.split('T')[0];
}

function formatTime(isoStr) {
  if (!isoStr || !isoStr.includes('T')) return '';
  const time = isoStr.split('T')[1];
  return time.substring(0, 5);
}

function getCategoryBadge(cat) {
  if (cat === 'meeting') return 'badge-cyan';
  if (cat === 'task_deadline') return 'badge-amber';
  if (cat === 'subscription') return 'badge-purple';
  return 'badge-medium';
}

CommandDeck.prototype.navigateCalendar = function(delta) {
  if (this.selectedCalendarView === 'day') {
    this.currentDate.setDate(this.currentDate.getDate() + delta);
  } else if (this.selectedCalendarView === 'week') {
    this.currentDate.setDate(this.currentDate.getDate() + (delta * 7));
  } else if (this.selectedCalendarView === 'month') {
    this.currentDate.setMonth(this.currentDate.getMonth() + delta);
  }
  this.renderCalendar();
};

CommandDeck.prototype.renderCalendar = function() {
  const stage = document.getElementById('calendar-stage');
  const viewStage = document.getElementById('calendar-view-stage');
  const heading = document.querySelector('#view-calendar .view-section-header .view-section-title');

  // Sync category division filter buttons
  document.querySelectorAll('[data-cal-filter]').forEach(b => {
    b.classList.toggle('active', b.dataset.calFilter === (this.calFilter || 'all'));
  });

  // Dedicated calendar view tabs
  document.querySelectorAll('.cal-view-tab').forEach(b => {
    const isSelected = b.dataset.calView === this.selectedCalendarView;
    b.classList.toggle('active', isSelected);
    b.style.background = isSelected ? 'var(--bg-secondary)' : 'transparent';
  });

  // 1. Render Main Dashboard upcoming schedule scrolldown list
  if (stage) {
    this.renderUpcomingSchedule(stage);
  }

  // 2. Render Dedicated Calendar view (Day, Week, Month)
  if (viewStage) {
    let events = this.state.calendarEvents || [];
    if (this.calFilter === 'meeting') events = events.filter(e => e.category === 'meeting' || e.type === 'calendar' || e.type === 'important_date');
    else if (this.calFilter === 'task') events = events.filter(e => e.type === 'task' || e.category === 'task_deadline');
    else if (this.calFilter === 'subscription') events = events.filter(e => e.type === 'renewal' || e.category === 'subscription');

    if (events.length === 0) {
      const emptyHtml = '<div class="empty-state"><div class="empty-state__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div><div class="empty-state__title">No events</div><div class="empty-state__desc">Your calendar is clear.</div></div>';
      viewStage.innerHTML = emptyHtml;
      if (heading) heading.textContent = 'No events';
      const viewTitleText = document.getElementById('calendar-view-title-text');
      if (viewTitleText) viewTitleText.textContent = 'Schedule & Events';
      return;
    }

    if (this.selectedCalendarView === 'day') {
      this.renderDayView(viewStage, heading, events);
    } else if (this.selectedCalendarView === 'week') {
      this.renderWeekView(viewStage, heading, events);
    } else if (this.selectedCalendarView === 'month') {
      this.renderMonthView(viewStage, heading, events);
    }
  }
};

CommandDeck.prototype.renderUpcomingSchedule = function(stage) {
  if (!stage) return;

  let rawEvents = [...(this.state.calendarEvents || [])];

  // Merge any active tasks with due dates from this.state.tasks so task edits reflect immediately
  const existingTaskIds = new Set();
  rawEvents.forEach(e => {
    if (e.id && String(e.id).startsWith('task-')) {
      existingTaskIds.add(String(e.id).replace('task-', ''));
    }
  });

  (this.state.tasks || []).forEach(t => {
    if (t.due_at && t.status !== 'completed' && !existingTaskIds.has(String(t.id))) {
      const priorityColor = {
        critical: '#ef4444',
        high: '#f59e0b',
        medium: '#38bdf8',
        low: '#64748b'
      }[t.priority] || '#38bdf8';

      rawEvents.push({
        id: `task-${t.id}`,
        raw_task_id: t.id,
        title: t.title,
        start: t.due_at,
        all_day: String(t.due_at).length <= 10,
        category: 'task_deadline',
        type: 'task',
        priority: t.priority || 'medium',
        project_name: t.project_name,
        status: t.status,
        color: priorityColor
      });
    }
  });

  // Apply category division filter
  const filter = this.calFilter || 'all';
  if (filter === 'meeting') {
    rawEvents = rawEvents.filter(e => e.category === 'meeting' || e.category === 'event' || e.type === 'calendar' || e.type === 'important_date');
  } else if (filter === 'task') {
    rawEvents = rawEvents.filter(e => e.type === 'task' || e.category === 'task_deadline');
  } else if (filter === 'subscription') {
    rawEvents = rawEvents.filter(e => e.type === 'renewal' || e.category === 'subscription');
  }

  // Filter for upcoming items (today and future, plus any overdue tasks)
  const now = new Date();
  const todayIso = now.toISOString().split('T')[0];

  // Sort chronologically by start date/time
  rawEvents.sort((a, b) => {
    const aTime = a.start ? new Date(a.start).getTime() : 0;
    const bTime = b.start ? new Date(b.start).getTime() : 0;
    return aTime - bTime;
  });

  // Group by date string (YYYY-MM-DD), skipping empty days
  const dateGroups = {};
  rawEvents.forEach(item => {
    const dateKey = strToDateStr(item.start);
    if (!dateKey) return;
    // Skip past events that are not tasks
    if (dateKey < todayIso && item.type !== 'task' && item.category !== 'task_deadline') {
      return;
    }
    if (!dateGroups[dateKey]) {
      dateGroups[dateKey] = [];
    }
    dateGroups[dateKey].push(item);
  });

  const sortedDateKeys = Object.keys(dateGroups).sort();

  if (sortedDateKeys.length === 0) {
    const filterLabels = {
      meeting: 'meetings or events',
      task: 'tasks with due dates',
      subscription: 'subscription renewals'
    };
    const filterLabel = filterLabels[filter] || 'upcoming schedule items';

    stage.innerHTML = `
      <div class="empty-state" style="padding: 32px 16px;">
        <div class="empty-state__icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        </div>
        <div class="empty-state__title">No ${filterLabel}</div>
        <div class="empty-state__desc">Your upcoming schedule is clear.</div>
      </div>
    `;
    return;
  }

  // Build the chronological scroll-down list divided by date
  let html = `<div class="upcoming-schedule-feed">`;

  sortedDateKeys.forEach(dateKey => {
    const items = dateGroups[dateKey];
    const isOverdue = dateKey < todayIso;
    const isToday = dateKey === todayIso;

    // Tomorrow ISO
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowIso = tomorrow.toISOString().split('T')[0];
    const isTomorrow = dateKey === tomorrowIso;

    let dateTitle = '';
    let badgeClass = 'badge-secondary';
    if (isOverdue) {
      dateTitle = '⚠️ Overdue Deadlines';
      badgeClass = 'badge-rose';
    } else if (isToday) {
      const parsedD = new Date(dateKey + 'T12:00:00');
      const dayName = parsedD.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      dateTitle = `Today • ${dayName}`;
      badgeClass = 'badge-cyan';
    } else if (isTomorrow) {
      const parsedD = new Date(dateKey + 'T12:00:00');
      const dayName = parsedD.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      dateTitle = `Tomorrow • ${dayName}`;
      badgeClass = 'badge-purple';
    } else {
      const parsedD = new Date(dateKey + 'T12:00:00');
      dateTitle = parsedD.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
    }

    html += `
      <div class="schedule-date-group ${isToday ? 'schedule-date-group--today' : ''}">
        <div class="schedule-date-header">
          <span class="schedule-date-title">${dateTitle}</span>
          <span class="badge ${badgeClass}" style="font-size:0.65rem;">${items.length} ${items.length === 1 ? 'item' : 'items'}</span>
        </div>
        <div class="schedule-date-items">
          ${items.map(item => this.renderScheduleItemCard(item)).join('')}
        </div>
      </div>
    `;
  });

  html += `</div>`;
  stage.innerHTML = html;

  // Bind clicks on task cards to open task detail modal
  stage.querySelectorAll('.schedule-item-card[data-task-id]').forEach(card => {
    card.addEventListener('click', (e) => {
      const taskId = card.dataset.taskId;
      if (taskId && typeof this.openTaskDetail === 'function') {
        this.openTaskDetail(taskId);
      }
    });
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const taskId = card.dataset.taskId;
        if (taskId && typeof this.openTaskDetail === 'function') {
          this.openTaskDetail(taskId);
        }
      }
    });
  });
};

CommandDeck.prototype.renderScheduleItemCard = function(item) {
  const isTask = item.type === 'task' || item.category === 'task_deadline';
  const isSubscription = item.type === 'renewal' || item.category === 'subscription';

  // Task ID extraction
  let taskId = null;
  if (isTask) {
    if (item.raw_task_id) taskId = item.raw_task_id;
    else if (String(item.id).startsWith('task-')) taskId = String(item.id).replace('task-', '');
    else taskId = item.id;
  }

  const taskIdAttr = taskId ? ` data-task-id="${escapeHtml(String(taskId))}" tabindex="0" role="button" title="Click to view and edit task wording and details"` : '';

  // Time label
  let timeDisplay = 'All Day';
  if (!item.all_day && item.start && item.start.includes('T')) {
    try {
      const dt = new Date(item.start);
      timeDisplay = dt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } catch(e) {
      timeDisplay = formatTime(item.start);
    }
  }

  // Icon & category badge
  let icon = '📅';
  let badgeHtml = '<span class="badge badge-cyan">Meeting</span>';
  let cleanTitle = item.title;

  if (isSubscription) {
    icon = '💳';
    badgeHtml = '<span class="badge badge-purple">Subscription</span>';
    if (cleanTitle.startsWith('Renewal: ')) {
      cleanTitle = cleanTitle.replace('Renewal: ', '');
    }
  } else if (isTask) {
    icon = '📋';
    const pri = item.priority || 'medium';
    badgeHtml = `<span class="badge badge-amber">Task</span> <span class="badge badge-${pri}">${escapeHtml(pri)}</span>`;
    if (cleanTitle.startsWith('Deadline: ')) {
      cleanTitle = cleanTitle.replace('Deadline: ', '');
    }
  } else {
    badgeHtml = `<span class="badge ${getCategoryBadge(item.category)}">${escapeHtml(item.category || 'Event')}</span>`;
  }

  // Meta row
  let metaHtml = '';
  if (item.location) {
    metaHtml += `<span>📍 ${escapeHtml(item.location)}</span>`;
  }
  if (item.billing_cycle) {
    metaHtml += `<span>🔄 ${escapeHtml(item.billing_cycle)}</span>`;
  }
  if (item.project_name) {
    metaHtml += `<span>📁 ${escapeHtml(item.project_name)}</span>`;
  }
  if (item.notes) {
    metaHtml += `<span>${escapeHtml(item.notes.slice(0, 60))}</span>`;
  }

  return `
    <div class="schedule-item-card ${isTask ? 'schedule-item-card--task' : ''}" ${taskIdAttr}>
      <div class="schedule-item-left">
        <div class="schedule-item-time">${timeDisplay}</div>
        <div class="schedule-item-icon">${icon}</div>
      </div>
      <div class="schedule-item-body">
        <div class="schedule-item-top">
          <span class="schedule-item-title">${escapeHtml(cleanTitle)}</span>
          <div class="schedule-item-badges">${badgeHtml}</div>
        </div>
        ${metaHtml ? `<div class="schedule-item-meta">${metaHtml}</div>` : ''}
      </div>
    </div>
  `;
};

CommandDeck.prototype.renderDayView = function(stage, heading, events) {
  const dateStr = this.currentDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  const isoDate = this.currentDate.toISOString().split('T')[0];
  if (heading) heading.textContent = dateStr;
  const viewTitleText = document.getElementById('calendar-view-title-text');
  if (viewTitleText) viewTitleText.textContent = dateStr;

  const dayEvents = events.filter(e => strToDateStr(e.start) === isoDate);

  let html = '<div class="day-timeline">';
  const hours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

  hours.forEach(hr => {
    const hrFormatted = (hr < 10 ? '0' : '') + hr + ':00';
    const slotEvents = dayEvents.filter(e => {
      if (e.all_day && hr === 9) return true;
      const timePart = (e.start.includes('T') ? e.start.split('T')[1] : '');
      return timePart.startsWith(hrFormatted.substring(0, 2));
    });

    html += `
      <div class="day-time-slot">
        <span class="time-label">${hrFormatted}</span>
        <div class="time-slot-content">
          ${slotEvents.map(e => `
            <div class="event-card" style="border-left-color: ${e.color || 'var(--accent-cyan)'}">
              <div class="event-title">${escapeHtml(e.title)}</div>
              <div class="event-meta">
                <span>${e.all_day ? 'ALL DAY' : formatTime(e.start)}</span>
                <span>•</span>
                <span class="badge ${getCategoryBadge(e.category)}">${e.category}</span>
                ${e.location ? `<span class="event-location"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>${escapeHtml(e.location)}</span>` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  });

  html += '</div>';
  stage.innerHTML = html;
};

CommandDeck.prototype.renderWeekView = function(stage, heading, events) {
  const startOfWeek = new Date(this.currentDate);
  startOfWeek.setDate(this.currentDate.getDate() - this.currentDate.getDay());

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);

  const weekTitle = `${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  if (heading) heading.textContent = weekTitle;
  const viewTitleText = document.getElementById('calendar-view-title-text');
  if (viewTitleText) viewTitleText.textContent = weekTitle;

  let html = '<div style="display:grid; grid-template-columns: repeat(7, 1fr); gap:6px; height:100%;">';

  for (let i = 0; i < 7; i++) {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    const iso = day.toISOString().split('T')[0];
    const isToday = iso === new Date().toISOString().split('T')[0];
    const dayEvs = events.filter(e => strToDateStr(e.start) === iso);

    html += `
      <div class="month-cell ${isToday ? 'today' : ''}" style="min-height: 180px;">
        <div class="month-date-num">${day.toLocaleDateString('en-US', { weekday: 'short' })} ${day.getDate()}</div>
        <div style="display:flex; flex-direction:column; gap:3px; margin-top:4px;">
          ${dayEvs.map(e => `
            <div class="month-event-pill" style="border-left-color: ${e.color || 'var(--accent-cyan)'}">
              ${escapeHtml(e.title)}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  html += '</div>';
  stage.innerHTML = html;
};

CommandDeck.prototype.renderMonthView = function(stage, heading, events) {
  const year = this.currentDate.getFullYear();
  const month = this.currentDate.getMonth();
  const monthTitle = this.currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  if (heading) heading.textContent = monthTitle;
  const viewTitleText = document.getElementById('calendar-view-title-text');
  if (viewTitleText) viewTitleText.textContent = monthTitle;

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  let html = '<div class="month-calendar-grid">';
  const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  dayNames.forEach(d => html += `<div class="month-day-head">${d}</div>`);

  // Blanks for preceding days
  for (let b = 0; b < firstDay; b++) {
    html += `<div class="month-cell other-month"></div>`;
  }

  // Days of current month
  for (let d = 1; d <= daysInMonth; d++) {
    const curIso = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const isToday = curIso === new Date().toISOString().split('T')[0];
    const dayEvs = events.filter(e => strToDateStr(e.start) === curIso);

    html += `
      <div class="month-cell ${isToday ? 'today' : ''}">
        <div class="month-date-num">${d}</div>
        ${dayEvs.map(e => `
          <div class="month-event-pill" style="border-left-color: ${e.color || 'var(--accent-cyan)'}">
            ${escapeHtml(e.title)}
          </div>
        `).join('')}
      </div>
    `;
  }

  html += '</div>';
  stage.innerHTML = html;
};
