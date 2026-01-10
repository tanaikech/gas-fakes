import { Proxies } from '../../support/proxies.js';

export const newFakeCalendarEvent = (...args) => {
  return Proxies.guard(new FakeCalendarEvent(...args));
};

/**
 * Represents a calendar event.
 * @see https://developers.google.com/apps-script/reference/calendar/calendar-event
 */
export class FakeCalendarEvent {
  /**
   * @param {string} calendarId The calendar ID.
   * @param {object} resource The underlying Event resource (Advanced).
   */
  constructor(calendarId, resource) {
    this.__calendarId = calendarId;
    this.__id = resource.id;
    this.__iCalUID = resource.iCalUID;
  }

  get __resource() {
    // Try to get by ID
    try {
        return Calendar.Events.get(this.__calendarId, this.__id);
    } catch (e) {
        // Fallback: search by iCalUID if main ID fails (though usually id is reliable for get)
        // or if the event was deleted?
        throw new Error(`Event with ID ${this.__id} not found in calendar ${this.__calendarId}`);
    }
  }

  getId() {
    return this.__resource.iCalUID || this.__resource.id;
  }

  getTitle() {
    return this.__resource.summary || '';
  }

  toString() {
    return 'CalendarEvent';
  }
}