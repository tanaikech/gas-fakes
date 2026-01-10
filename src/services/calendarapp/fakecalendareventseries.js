import { Proxies } from '../../support/proxies.js';

export const newFakeCalendarEventSeries = (...args) => {
  return Proxies.guard(new FakeCalendarEventSeries(...args));
};

/**
 * Represents a series of events (a recurring event).
 * @see https://developers.google.com/apps-script/reference/calendar/calendar-event-series
 */
export class FakeCalendarEventSeries {
  /**
   * @param {string} calendarId The calendar ID.
   * @param {object} resource The underlying Event resource (Advanced).
   */
  constructor(calendarId, resource) {
    this.__calendarId = calendarId;
    this.__id = resource.id;
  }

  get __resource() {
    try {
        return Calendar.Events.get(this.__calendarId, this.__id);
    } catch (e) {
        throw new Error(`Event Series with ID ${this.__id} not found in calendar ${this.__calendarId}`);
    }
  }

  getId() {
    return this.__resource.iCalUID || this.__resource.id;
  }

  toString() {
    return 'CalendarEventSeries';
  }
}