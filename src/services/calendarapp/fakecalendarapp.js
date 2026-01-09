import { Proxies } from '../../support/proxies.js';
import * as CalendarEnums from '../enums/calendarenums.js';
import { newFakeCalendar } from './fakecalendar.js';

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

  createCalendar(name, options = {}) {
    ScriptApp.__behavior.checkMethod('CalendarApp', 'createCalendar');
    this.__checkUsage('write');
    const resource = Calendar.Calendars.insert({ summary: name, ...options });
    if (ScriptApp.__behavior.sandboxMode && resource.id) {
      ScriptApp.__behavior.addCalendarId(resource.id);
    }
    return newFakeCalendar(resource.id, resource);
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
