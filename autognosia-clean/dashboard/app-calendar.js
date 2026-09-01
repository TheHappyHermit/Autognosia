/**
 * Autognosia // Command Deck — Calendar View
 * Renders calendar with day/week/month views and filtering.
 */

CommandDeck.prototype.navigateCalendar = function(direction) {
  const d = new Date(this.currentDate);
  if (this.selectedCalendarView === 'month') {
    d.setMonth(d.getMonth() + direction);
  } else if (this.selectedCalendarView === 'week') {
    d.setDate(d.getDate() + (direction * 7));
  } else {
    d.setDate(d.getDate() + direction);
  }
  this.currentDate = d;
  this.renderCalendar();
};

CommandDeck.prototype.renderCalendar = function() {
  const stage = document.getElementById('calendar-stage');
  if (!stage) return;
  const events = this.state.calendarEvents || [];
  const filtered = this.calFilter === 'all' ? events : events.filter(e => {
    const cat = e.category || e.type || '';
    if (this.calFilter === 'meeting') return cat === 'meeting';
    if (this.calFilter === 'task') return cat === 'task';
    if (this.calFilter === 'subscription') return cat === 'subscription';
    return true;
  });

  if (this.selectedCalendarView === 'month') {
    this.renderCalendarMonth(stage, filtered);
  } else if (this.selectedCalendarView === 'week') {
    this.renderCalendarWeek(stage, filtered);
  } else {
    this.renderCalendarDay(stage, filtered);
  }
};

CommandDeck.prototype.renderCalendarMonth = function(stage, events) {
  const year = this.currentDate.getFullYear();
  const month = this.currentDate.getMonth();
  const cal = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = cal.getDay();
  const monthName = cal.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const heading = document.getElementById('cal-heading');
  if (heading) heading.textContent = monthName;

  let html = '<div class="calendar-month"><div class="calendar-month__header">';
  ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].forEach(d => {
    html += `<div class="calendar-month__day-name">${d}</div>`;
  });
  html += '</div><div class="calendar-month__grid">';

  for (let i = 0; i < firstDay; i++) {
    html += '<div class="calendar-month__cell empty"></div>';
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    const dayEvents = events.filter(e => (e.start || '').startsWith(dateStr));
    html += `<div class="calendar-month__cell"><span class="calendar-month__day">${day}</span>`;
    dayEvents.slice(0,3).forEach(ev => {
      html += `<span class="calendar-event calendar-event--${ev.category || ev.type || 'default'}">${escapeHtml(ev.title || 'Untitled')}</span>`;
    });
    html += '</div>';
  }

  html += '</div></div>';
  stage.innerHTML = html;
};

CommandDeck.prototype.renderCalendarDay = function(stage, events) {
  const dateStr = this.currentDate.toISOString().split('T')[0];
  const heading = document.getElementById('cal-heading');
  if (heading) {
    heading.textContent = this.currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  }
  const dayEvents = events.filter(e => (e.start || '').startsWith(dateStr));
  if (dayEvents.length === 0) {
    stage.innerHTML = '<div class="empty-hint">No events today.</div>';
    return;
  }
  stage.innerHTML = `<div class="calendar-day">${dayEvents.map(ev => {
    const isAllDay = ev.all_day || !ev.start.includes('T');
    const timeStr = isAllDay ? 'All day' : (ev.start.split('T')[1]?.slice(0,5) || '');
    return `
    <div class="calendar-event-item">
      <span class="calendar-event-item__time">${timeStr}</span>
      <span class="calendar-event-item__title">${escapeHtml(ev.title || 'Untitled')}</span>
      <span class="calendar-event-item__category">${escapeHtml(ev.category || ev.type || '')}</span>
    </div>
  `;}).join('')}</div>`;
};

CommandDeck.prototype.renderCalendarWeek = function(stage, events) {
  const startOfWeek = new Date(this.currentDate);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  const heading = document.getElementById('cal-heading');
  if (heading) {
    heading.textContent = `Week of ${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  }
  stage.innerHTML = `<div class="calendar-week">${events.slice(0,20).map(ev => `
    <div class="calendar-event-item">
      <span class="calendar-event-item__time">${ev.start ? ev.start.slice(0,16).replace('T',' ') : ''}</span>
      <span class="calendar-event-item__title">${escapeHtml(ev.title || 'Untitled')}</span>
    </div>
  `).join('')}</div>`;
};
