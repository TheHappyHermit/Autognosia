
  // ── Calendar Rendering & Views (Day, Week, Month) ──────────────────────────
  CommandDeck.prototype.navigateCalendar = function(delta) {
    if (this.selectedCalendarView === 'day') {
      this.currentDate.setDate(this.currentDate.getDate() + delta);
    } else if (this.selectedCalendarView === 'week') {
      this.currentDate.setDate(this.currentDate.getDate() + (delta * 7));
    } else if (this.selectedCalendarView === 'month') {
      this.currentDate.setMonth(this.currentDate.getMonth() + delta);
    }
    this.renderCalendar();
  }

  CommandDeck.prototype.renderCalendar = function() {
    const stage = this.getViewEl('calendar-stage');
    if (!stage) return;
    const heading = this.getViewEl('cal-heading');
    
    // Filter events based on active category
    let events = this.state.calendarEvents;
    if (this.calFilter === 'meeting') events = events.filter(e => e.category === 'meeting' || e.type === 'calendar');
    else if (this.calFilter === 'task') events = events.filter(e => e.type === 'task' || e.category === 'task_deadline');
    else if (this.calFilter === 'subscription') events = events.filter(e => e.type === 'renewal' || e.category === 'subscription');

    if (events.length === 0) {
      stage.innerHTML = '<div class="empty-hint">No events scheduled.</div>';
      return;
    }

    if (this.selectedCalendarView === 'day') {
      this.renderDayView(stage, heading, events);
    } else if (this.selectedCalendarView === 'week') {
      this.renderWeekView(stage, heading, events);
    } else if (this.selectedCalendarView === 'month') {
      this.renderMonthView(stage, heading, events);
    }
  }

  CommandDeck.prototype.renderDayView = function(stage, heading, events) {
    const dateStr = this.currentDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    const isoDate = this.currentDate.toISOString().split('T')[0];
    heading.textContent = dateStr;

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
                  ${e.location ? `<span>📍 ${escapeHtml(e.location)}</span>` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    });

    html += '</div>';
    stage.innerHTML = html;
  }

  CommandDeck.prototype.renderWeekView = function(stage, heading, events) {
    const startOfWeek = new Date(this.currentDate);
    startOfWeek.setDate(this.currentDate.getDate() - this.currentDate.getDay());
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    heading.textContent = `${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

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
  }

  CommandDeck.prototype.renderMonthView = function(stage, heading, events) {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    heading.textContent = this.currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

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
  }


