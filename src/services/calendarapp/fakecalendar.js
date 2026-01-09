import { Proxies } from '../../support/proxies.js';

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
    this.__id = id;
  }

  /**
   * Internal helper to refresh or get the current resource.
   */
  get __resource() {
    // calendar caching will will only update if its changed
    return Calendar.Calendars.get(this.__id)
  }

  getId() {
    return this.__id || this.__resource.id;
  }

  getName() {
    return this.__resource.summary || '';
  }

  setName(name) {
    this.__checkWriteAccess();
    this.__update({ summary: name });
    return this;
  }

  getDescription() {
    return this.__resource.description || '';
  }

  setDescription(description) {
    this.__checkWriteAccess();
    this.__update({ description });
    return this;
  }

  getTimeZone() {
    return this.__resource.timeZone || '';
  }

  setTimeZone(timeZone) {
    this.__checkWriteAccess();
    this.__update({ timeZone });
    return this;
  }

  isMyPrimaryCalendar() {
    // Usually the ID of the primary calendar is the user's email address.
    // In gas-fakes we might need a better check, but for now:
    return this.getId() === 'primary';
  }

  isOwnedByMe() {
    // For now assume true if we can edit it.
    return true;
  }

  isHidden() {
    return false; // placeholder
  }

  isSelected() {
    return true; // placeholder
  }

  /**
   * Permanently deletes a calendar.
   * A user can only delete a calendar they own.
   * @see https://developers.google.com/apps-script/reference/calendar/calendar#deleteCalendar()
   */
  deleteCalendar() {
    this.__checkDeleteAccess();
    Calendar.Calendars.delete(this.getId());
  }

  /**
   * Synchronizes changes back to the Advanced service.
   * @param {object} patch The changes to apply.
   * @private
   */
  __update(patch) {
    const resource = { ...this.__resource, ...patch };
    Calendar.Calendars.patch(resource, this.getId());
    this.__internalResource = resource; // Update local cache
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
    const entry = whitelist.find(item => item.name === calendarName);
    if (entry && entry[accessType]) {
      return true;
    }

    throw new Error(`${accessType} access to calendar "${calendarName}" (${calendarId}) is denied by sandbox rules`);
  }
  __checkDeleteAccess() {
    return this.__checkAccess('delete');
  }
  __checkWriteAccess() {
    return this.__checkAccess('write');
  }

  toString() {
    return 'Calendar';
  }
}
