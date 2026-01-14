import { Proxies } from '../../support/proxies.js';
import { newFakeCalendarEvent } from './fakecalendarevent.js';
import { newFakeCalendarEventSeries } from './fakecalendareventseries.js';
import { Utils } from '../../support/utils.js';
export const newFakeCalendar = (...args) => {
  return Proxies.guard(new FakeCalendar(...args));
};

/**
 * Represents a calendar in the CalendarApp service.
 * @see https://developers.google.com/apps-script/reference/calendar/calendar
 */
export class FakeCalendar {
  /**
   * @param {string} id The calendar ID.
   * @param {object} resource The underlying Calendar resource (Advanced).
   */
  constructor(id, resource) {
    // If a resource is provided, use its canonical ID (e.g. email) instead of the lookup ID (e.g. 'primary')
    // This matches GAS behavior where getId() returns the email even if retrieved via 'primary'
    this.__id = (resource && resource.id) ? resource.id : id;
  }

  /**
   * Internal helper to refresh or get the current resource (Calendars).
   */
  get __resource() {
    // calendar caching will will only update if its changed
    return Calendar.Calendars.get(this.__id);
  }

  /**
   * Internal helper to get the current list entry resource (CalendarList).
   * Used for user-specific properties like color, hidden, selected.
   */
  get __listEntry() {
    try {
      return Calendar.CalendarList.get(this.__id);
    } catch (e) {
      return null;
    }
  }

  getId() {
    return this.__id || this.__resource.id;
  }

  getName() {
    // summary can be in list entry (override) or calendar resource
    const entry = this.__listEntry;
    if (entry && entry.summaryOverride) return entry.summaryOverride;
    return this.__resource.summary || '';
  }

  setName(name) {
    this.__checkWriteAccess();
    // Sets the name of the calendar. This updates the global name (Calendars).
    Calendar.Calendars.patch({ summary: name }, this.getId());
    return this;
  }

  getDescription() {
    return this.__resource.description || '';
  }

  setDescription(description) {
    this.__checkWriteAccess();
    Calendar.Calendars.patch({ description }, this.getId());
    return this;
  }

  getTimeZone() {
    return this.__resource.timeZone || '';
  }

  setTimeZone(timeZone) {
    this.__checkWriteAccess();
    Calendar.Calendars.patch({ timeZone }, this.getId());
    return this;
  }

  getColor() {
    const entry = this.__listEntry;
    return entry ? entry.backgroundColor : '';
  }
  // this can be an enum, or a hex code
  setColor(color) {
    this.__checkWriteAccess();
    if (Utils.isEnum(color)) {
      color = color.toString();
    }
    Calendar.CalendarList.patch({ backgroundColor: color }, this.getId(), {colorRgbFormat: true});
    return this;
  }

  isHidden() {
    const entry = this.__listEntry;
    return entry ? !!entry.hidden : false;
  }

  setHidden(hidden) {
    this.__checkWriteAccess();
    Calendar.CalendarList.patch({ hidden }, this.getId());
    return this;
  }

  isSelected() {
    const entry = this.__listEntry;
    return entry ? !!entry.selected : false;
  }

  setSelected(selected) {
    this.__checkWriteAccess();
    Calendar.CalendarList.patch({ selected }, this.getId());
    return this;
  }

  isMyPrimaryCalendar() {
    return this.getId() === 'primary' || (this.__listEntry && this.__listEntry.primary);
  }

  isOwnedByMe() {
    const entry = this.__listEntry;
    return entry ? entry.accessRole === 'owner' : false;
  }

  /**
   * Permanently deletes a calendar.
   */
  deleteCalendar() {
    this.__checkUsage('write');
    this.__checkDeleteAccess();
    Calendar.Calendars.delete(this.getId());
  }

  unsubscribeFromCalendar() {
    this.__checkUsage('write');
    // Unsubscribes the user from a calendar (removes from list).
    Calendar.CalendarList.remove(this.getId());
  }

  // --- Events ---

  createEvent(title, startTime, endTime, options) {
    if (startTime.getTime() >= endTime.getTime()) {
      throw new Error('Event start date must be before event end date.');
    }
    this.__checkUsage('write');
    this.__checkWriteAccess();
    const resource = {
      summary: title,
      start: { dateTime: startTime.toISOString() },
      end: { dateTime: endTime.toISOString() }
    };
    this.__applyEventOptions(resource, options);
    
    const args = {};
    if (options && options.sendInvites) {
      args.sendUpdates = 'all';
    }

    const event = Calendar.Events.insert(resource, this.getId(), args);
    return newFakeCalendarEvent(this.getId(), event);
  }

  createAllDayEvent(title, startDate, endDateOrOptions, options) {
    this.__checkUsage('write');
    this.__checkWriteAccess();
    
    let endDate = startDate;
    let opts = options;

    if (endDateOrOptions instanceof Date) {
        endDate = endDateOrOptions;
    } else if (typeof endDateOrOptions === 'object') {
        opts = endDateOrOptions;
        // Single day event, end date should be start date + 1 day for API v3 (exclusive)
        const nextDay = new Date(startDate);
        nextDay.setDate(nextDay.getDate() + 1);
        endDate = nextDay;
    } else {
        // Just title and date
        const nextDay = new Date(startDate);
        nextDay.setDate(nextDay.getDate() + 1);
        endDate = nextDay;
    }

    if (startDate.getTime() >= endDate.getTime()) {
      throw new Error('Event start date must be before event end date.');
    }

    const toDateString = (date) => date.toISOString().split('T')[0];

    const resource = {
        summary: title,
        start: { date: toDateString(startDate) },
        end: { date: toDateString(endDate) }
    };
    this.__applyEventOptions(resource, opts);

    const args = {};
    if (opts && opts.sendInvites) {
        args.sendUpdates = 'all';
    }

    const event = Calendar.Events.insert(resource, this.getId(), args);
    return newFakeCalendarEvent(this.getId(), event);
  }

  createEventFromDescription(description) {
    this.__checkUsage('write');
    this.__checkWriteAccess();
    const event = Calendar.Events.quickAdd(this.getId(), description);
    return newFakeCalendarEvent(this.getId(), event);
  }

  getEvents(startTime, endTime, options) {
    this.__checkUsage('read');
    this.__checkReadAccess();
    const args = {
        timeMin: startTime.toISOString(),
        timeMax: endTime.toISOString(),
        singleEvents: true // Expand recurring events usually expected
    };
    
    if (options) {
        if (options.start !== undefined) args.startIndex = options.start; // Note: Not in v3 standard list?
        if (options.max !== undefined) args.maxResults = options.max;
        if (options.search) args.q = options.search;
        if (options.author) { /* Not directly supported in v3 list? */ }
    }

    const list = Calendar.Events.list(this.getId(), args);
    return (list.items || []).map(item => newFakeCalendarEvent(this.getId(), item));
  }

  getEventsForDay(date, options) {
    const startTime = new Date(date);
    startTime.setHours(0, 0, 0, 0);
    const endTime = new Date(date);
    endTime.setHours(23, 59, 59, 999);
    return this.getEvents(startTime, endTime, options);
  }

  getEventById(iCalId) {
    this.__checkUsage('read');
    this.__checkReadAccess();
    // Apps Script expects iCalUID. Try finding by iCalUID first using list.
    // This avoids "Not Found" errors in the worker when passing iCalUID to events.get (which expects eventId)
    const list = Calendar.Events.list(this.getId(), { iCalUID: iCalId });
    if (list.items && list.items.length > 0) {
        return newFakeCalendarEvent(this.getId(), list.items[0]);
    }

    // Fallback: Try getting by eventId directly.
    try {
        const event = Calendar.Events.get(this.getId(), iCalId);
        return newFakeCalendarEvent(this.getId(), event);
    } catch (e) {
        return null;
    }
  }

  // --- Series ---
  
  createEventSeries(title, startTime, endTime, recurrence, options) {
      this.__checkUsage('write');
      this.__checkWriteAccess();
      const resource = {
          summary: title,
          start: { dateTime: startTime.toISOString() },
          end: { dateTime: endTime.toISOString() },
          recurrence: [ recurrence.toString() ] // Assuming recurrence has proper RRULE string representation or handled
      };
      this.__applyEventOptions(resource, options);
      const event = Calendar.Events.insert(resource, this.getId());
      return newFakeCalendarEventSeries(this.getId(), event);
  }

  createAllDayEventSeries(title, startDate, recurrence, options) {
       this.__checkUsage('write');
       this.__checkWriteAccess();
       const toDateString = (date) => date.toISOString().split('T')[0];
       // For all day series, end date is usually next day for the first instance
       const endDate = new Date(startDate);
       endDate.setDate(endDate.getDate() + 1);

       const resource = {
           summary: title,
           start: { date: toDateString(startDate) },
           end: { date: toDateString(endDate) },
           recurrence: [ recurrence.toString() ]
       };
       this.__applyEventOptions(resource, options);
       const event = Calendar.Events.insert(resource, this.getId());
       return newFakeCalendarEventSeries(this.getId(), event);
  }

  getEventSeriesById(iCalId) {
      this.__checkUsage('read');
      this.__checkReadAccess();
      try {
          const event = Calendar.Events.get(this.getId(), iCalId);
          // Check if it's actually a recurring event (has recurrence or is instance)
          if (event.recurrence || event.recurringEventId) {
              return newFakeCalendarEventSeries(this.getId(), event);
          }
      } catch (e) {}
      return null;
  }

  // --- Internal ---

  __applyEventOptions(resource, options) {
    if (options) {
        if (options.description) resource.description = options.description;
        if (options.location) resource.location = options.location;
        if (options.guests) resource.attendees = options.guests.split(',').map(e => ({ email: e.trim() }));
    }
  }

  __checkUsage(type) {
    const serviceName = 'CalendarApp';
    const behavior = ScriptApp.__behavior;
    if (behavior.sandboxMode) {
      const settings = behavior.sandboxService[serviceName];
      let limit = settings && settings.usageLimit;
      if (limit) {
        if (typeof limit === 'number') {
          const total = (settings.usageCount.read || 0) + (settings.usageCount.write || 0) + (settings.usageCount.trash || 0);
          if (total >= limit) {
            throw new Error(`Calendar total usage limit of ${limit} exceeded`);
          }
          settings.incrementUsage(type);
          return;
        }

        let specificLimit = limit[type];
        if (specificLimit !== undefined) {
          const current = settings.usageCount[type] || 0;
          if (current >= specificLimit) {
            throw new Error(`Calendar ${type} usage limit of ${specificLimit} exceeded`);
          }
          settings.incrementUsage(type);
        }
      }
    }
  }

  __checkAccess(accessType) {
    const behavior = ScriptApp.__behavior;
    if (!behavior.sandboxMode) return true;

    const calendarId = this.getId();

    // Session-created calendars are always writable
    if (behavior.isKnownCalendar(calendarId)) return true;

    // Check whitelist
    const settings = behavior.sandboxService.CalendarApp;
    const whitelist = settings && settings.calendarWhitelist;

    if (!whitelist) {
      throw new Error(`Access to calendar ${calendarId} is denied. No calendar whitelist configured.`);
    }

    const calendarName = this.getName();
    // primary check
    if (calendarId === 'primary') {
         const entry = whitelist.find(item => item.name === 'Primary' || item.name === 'primary');
         if (entry && entry[accessType]) return true;
         // Default primary to accessible if not explicit? Or strictly follow whitelist?
         // Existing code had "Primary calendar is always accessible" for *read* in CalendarApp.
         // But here we check specific access.
    }

    const entry = whitelist.find(item => item.name === calendarName);
    if (entry && entry[accessType]) {
      return true;
    }

    throw new Error(`${accessType} access to calendar "${calendarName}" (${calendarId}) is denied by sandbox rules`);
  }
  
  __checkDeleteAccess() {
    return this.__checkAccess('write'); // Delete requires write usually? Or 'delete'?
  }
  __checkWriteAccess() {
    return this.__checkAccess('write');
  }
  __checkReadAccess() {
    return this.__checkAccess('read');
  }

  toString() {
    return 'Calendar';
  }
}