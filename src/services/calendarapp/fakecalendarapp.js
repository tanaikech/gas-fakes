import { Proxies } from '../../support/proxies.js';
import * as CalendarEnums from '../enums/calendarenums.js';
import { newFakeCalendar } from './fakecalendar.js';
import { newFakeEventRecurrence } from './fakeeventrecurrence.js';

/**
 * Creates a new FakeCalendarApp instance.
 * @returns {FakeCalendarApp} The new instance.
 */
export const newFakeCalendarApp = () => {
  return Proxies.guard(new FakeCalendarApp());
};

/**
 * Placeholder for CalendarApp service.
 * @see https://developers.google.com/apps-script/reference/calendar/calendar-app
 */
export class FakeCalendarApp {
  constructor() {
    // Attach enums
    Object.assign(this, CalendarEnums);
  }

  // --- Service Methods ---

  newRecurrence() {
    ScriptApp.__behavior.checkMethod('CalendarApp', 'newRecurrence');
    return newFakeEventRecurrence();
  }

  createCalendar(name, options = {}) {
    ScriptApp.__behavior.checkMethod('CalendarApp', 'createCalendar');
    this.__checkUsage('write');
    const resource = Calendar.Calendars.insert({ summary: name, ...options });
    if (resource.id) {
      ScriptApp.__behavior.addCalendarId(resource.id);
    }
    return newFakeCalendar(resource.id, resource);
  }

  subscribeToCalendar(id) {
    ScriptApp.__behavior.checkMethod('CalendarApp', 'subscribeToCalendar');
    this.__checkUsage('write');
    const resource = { id };
    Calendar.CalendarList.insert(resource);
    return newFakeCalendar(id);
  }

  getCalendarById(id) {
    ScriptApp.__behavior.checkMethod('CalendarApp', 'getCalendarById');
    this.__checkUsage('read');
    this.__checkCalendarAccess(id);
    const resource = Calendar.Calendars.get(id);
    return newFakeCalendar(id, resource);
  }

  getDefaultCalendar() {
    ScriptApp.__behavior.checkMethod('CalendarApp', 'getDefaultCalendar');
    return this.getCalendarById('primary');
  }

  getCalendarsByName(name) {
    ScriptApp.__behavior.checkMethod('CalendarApp', 'getCalendarsByName');
    this.__checkUsage('read');
    const list = Calendar.CalendarList.list();
    return (list.items || [])
      .filter(item => this.__isCalendarAccessible(item.id))
      .filter(item => item.summary === name)
      .map(item => newFakeCalendar(item.id, item));
  }

  getOwnedCalendarsByName(name) {
    ScriptApp.__behavior.checkMethod('CalendarApp', 'getOwnedCalendarsByName');
    this.__checkUsage('read');
    return this.getCalendarsByName(name).filter(c => c.isOwnedByMe());
  }

  getOwnedCalendarById(id) {
    ScriptApp.__behavior.checkMethod('CalendarApp', 'getOwnedCalendarById');
    this.__checkUsage('read');
    const cal = this.getCalendarById(id);
    return cal && cal.isOwnedByMe() ? cal : null;
  }

  getAllCalendars() {
    ScriptApp.__behavior.checkMethod('CalendarApp', 'getAllCalendars');
    this.__checkUsage('read');
    const list = Calendar.CalendarList.list();
    return (list.items || [])
      .filter(item => this.__isCalendarAccessible(item.id))
      .map(item => newFakeCalendar(item.id, item));
  }

  getAllOwnedCalendars() {
    ScriptApp.__behavior.checkMethod('CalendarApp', 'getAllOwnedCalendars');
    this.__checkUsage('read');
    const list = Calendar.CalendarList.list();
    return (list.items || [])
      .filter(item => this.__isCalendarAccessible(item.id))
      .filter(item => item.accessRole === 'owner')
      .map(item => newFakeCalendar(item.id, item));
  }

  // --- Default Calendar Delegates ---

  createAllDayEvent(...args) { 
    ScriptApp.__behavior.checkMethod('CalendarApp', 'createAllDayEvent');
    return this.getDefaultCalendar().createAllDayEvent(...args); 
  }
  createAllDayEventSeries(...args) { 
    ScriptApp.__behavior.checkMethod('CalendarApp', 'createAllDayEventSeries');
    return this.getDefaultCalendar().createAllDayEventSeries(...args); 
  }
  createEvent(...args) { 
    ScriptApp.__behavior.checkMethod('CalendarApp', 'createEvent');
    return this.getDefaultCalendar().createEvent(...args); 
  }
  createEventFromDescription(...args) { 
    ScriptApp.__behavior.checkMethod('CalendarApp', 'createEventFromDescription');
    return this.getDefaultCalendar().createEventFromDescription(...args); 
  }
  createEventSeries(...args) { 
    ScriptApp.__behavior.checkMethod('CalendarApp', 'createEventSeries');
    return this.getDefaultCalendar().createEventSeries(...args); 
  }
  
  getEventById(id) { 
    ScriptApp.__behavior.checkMethod('CalendarApp', 'getEventById');
    return this.getDefaultCalendar().getEventById(id); 
  }
  getEvents(...args) { 
    ScriptApp.__behavior.checkMethod('CalendarApp', 'getEvents');
    return this.getDefaultCalendar().getEvents(...args); 
  }
  getEventsForDay(...args) { 
    ScriptApp.__behavior.checkMethod('CalendarApp', 'getEventsForDay');
    return this.getDefaultCalendar().getEventsForDay(...args); 
  }
  getEventSeriesById(id) { 
    ScriptApp.__behavior.checkMethod('CalendarApp', 'getEventSeriesById');
    return this.getDefaultCalendar().getEventSeriesById(id); 
  }

  getColor() { 
    ScriptApp.__behavior.checkMethod('CalendarApp', 'getColor');
    return this.getDefaultCalendar().getColor(); 
  }
  setColor(color) { 
    ScriptApp.__behavior.checkMethod('CalendarApp', 'setColor');
    return this.getDefaultCalendar().setColor(color); 
  }
  getDescription() { 
    ScriptApp.__behavior.checkMethod('CalendarApp', 'getDescription');
    return this.getDefaultCalendar().getDescription(); 
  }
  setDescription(description) { 
    ScriptApp.__behavior.checkMethod('CalendarApp', 'setDescription');
    return this.getDefaultCalendar().setDescription(description); 
  }
  getId() { 
    ScriptApp.__behavior.checkMethod('CalendarApp', 'getId');
    return this.getDefaultCalendar().getId(); 
  }
  getName() { 
    ScriptApp.__behavior.checkMethod('CalendarApp', 'getName');
    return this.getDefaultCalendar().getName(); 
  }
  setName(name) { 
    ScriptApp.__behavior.checkMethod('CalendarApp', 'setName');
    return this.getDefaultCalendar().setName(name); 
  }
  getTimeZone() { 
    ScriptApp.__behavior.checkMethod('CalendarApp', 'getTimeZone');
    return this.getDefaultCalendar().getTimeZone(); 
  }
  setTimeZone(timeZone) { 
    ScriptApp.__behavior.checkMethod('CalendarApp', 'setTimeZone');
    return this.getDefaultCalendar().setTimeZone(timeZone); 
  }
  isHidden() { 
    ScriptApp.__behavior.checkMethod('CalendarApp', 'isHidden');
    return this.getDefaultCalendar().isHidden(); 
  }
  setHidden(hidden) { 
    ScriptApp.__behavior.checkMethod('CalendarApp', 'setHidden');
    return this.getDefaultCalendar().setHidden(hidden); 
  }
  isSelected() { 
    ScriptApp.__behavior.checkMethod('CalendarApp', 'isSelected');
    return this.getDefaultCalendar().isSelected(); 
  }
  setSelected(selected) { 
    ScriptApp.__behavior.checkMethod('CalendarApp', 'setSelected');
    return this.getDefaultCalendar().setSelected(selected); 
  }
  isMyPrimaryCalendar() { 
    ScriptApp.__behavior.checkMethod('CalendarApp', 'isMyPrimaryCalendar');
    return this.getDefaultCalendar().isMyPrimaryCalendar(); 
  }
  isOwnedByMe() { 
    ScriptApp.__behavior.checkMethod('CalendarApp', 'isOwnedByMe');
    return this.getDefaultCalendar().isOwnedByMe(); 
  }

  // --- Internals ---

  __isCalendarAccessible(calendarId) {
    try {
      this.__checkCalendarAccess(calendarId);
      return true;
    } catch (e) {
      return false;
    }
  }

  __checkCalendarAccess(calendarId) {
    const behavior = ScriptApp.__behavior;
    if (!behavior.sandboxMode) return true;

    // 1. Session check - calendars created in this session are always accessible
    if (behavior.isKnownCalendar(calendarId)) return true;

    // 2. Primary calendar is always accessible
    if (calendarId === 'primary') return true;

    // 3. Whitelist check
    const settings = behavior.sandboxService.CalendarApp;
    const whitelist = settings && settings.calendarWhitelist;

    if (!whitelist) {
      throw new Error(`Access to calendar ${calendarId} is denied. No calendar whitelist configured.`);
    }

    // Get calendar details to check name
    const calendar = Calendar.Calendars.get(calendarId);
    const calendarName = calendar.summary;

    // Check if calendar name is in whitelist with read permission
    const entry = whitelist.find(item => item.name === calendarName);
    if (entry && entry.read) {
      return true;
    }

    throw new Error(`Access to calendar "${calendarName}" (${calendarId}) is denied by sandbox rules`);
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

  // Common pattern in gas-fakes for internal use
  __addAllowed(id) {
    // Shared logic with other services to track created resources
  }
}
