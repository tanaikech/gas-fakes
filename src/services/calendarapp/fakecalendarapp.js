import { Proxies } from '../../support/proxies.js';
import * as CalendarEnums from '../enums/calendarenums.js';

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
    console.warn('CalendarApp.createCalendar is not yet implemented.');
    return null;
  }

  getCalendarById(id) {
    console.warn('CalendarApp.getCalendarById is not yet implemented.');
    return null;
  }

  getDefaultCalendar() {
    console.warn('CalendarApp.getDefaultCalendar is not yet implemented.');
    return null;
  }

  getCalendarsByName(name) {
    console.warn('CalendarApp.getCalendarsByName is not yet implemented.');
    return [];
  }

  getAllCalendars() {
    console.warn('CalendarApp.getAllCalendars is not yet implemented.');
    return [];
  }

  getAllOwnedCalendars() {
    console.warn('CalendarApp.getAllOwnedCalendars is not yet implemented.');
    return [];
  }

  // Common pattern in gas-fakes for internal use
  __addAllowed(id) {
    // Shared logic with other services to track created resources
  }
}
