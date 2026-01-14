import { Proxies } from '../../support/proxies.js';
import { newFakeCalendarEventSeries } from './fakecalendareventseries.js';
import { newFakeEventGuest } from './fakeeventguest.js';
import * as CalendarEnums from '../enums/calendarenums.js';

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

  // --- Identity ---

  getId() {
    return this.__resource.iCalUID || this.__resource.id;
  }

  getOriginalCalendarId() {
    return this.__calendarId;
  }

  // --- Content ---

  getTitle() {
    return this.__resource.summary || '';
  }

  setTitle(title) {
    this.__checkWriteAccess();
    Calendar.Events.patch({ summary: title }, this.__calendarId, this.__id);
    return this;
  }

  getDescription() {
    return this.__resource.description || '';
  }

  setDescription(description) {
    this.__checkWriteAccess();
    Calendar.Events.patch({ description }, this.__calendarId, this.__id);
    return this;
  }

  getLocation() {
    return this.__resource.location || '';
  }

  setLocation(location) {
    this.__checkWriteAccess();
    Calendar.Events.patch({ location }, this.__calendarId, this.__id);
    return this;
  }

  // --- Time ---

  getStartTime() {
    const r = this.__resource;
    if (r.start.dateTime) return new Date(r.start.dateTime);
    if (r.start.date) return new Date(r.start.date);
    return new Date();
  }

  getEndTime() {
    const r = this.__resource;
    if (r.end.dateTime) return new Date(r.end.dateTime);
    if (r.end.date) return new Date(r.end.date);
    return new Date();
  }

  setTime(startTime, endTime) {
    this.__checkWriteAccess();
    Calendar.Events.patch({
      start: { dateTime: startTime.toISOString() },
      end: { dateTime: endTime.toISOString() }
    }, this.__calendarId, this.__id);
    return this;
  }

  setAllDayDate(date) {
    this.__checkWriteAccess();
    const toDateString = (d) => d.toISOString().split('T')[0];
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);

    Calendar.Events.patch({
      start: { date: toDateString(date) },
      end: { date: toDateString(nextDay) }
    }, this.__calendarId, this.__id);
    return this;
  }

  isAllDayEvent() {
    const r = this.__resource;
    return !!r.start.date;
  }

  getAllDayStartDate() {
    const r = this.__resource;
    if (r.start.date) return new Date(r.start.date);
    return new Date(r.start.dateTime); // Fallback if not all-day
  }

  getAllDayEndDate() {
    const r = this.__resource;
    if (r.end.date) return new Date(r.end.date);
    return new Date(r.end.dateTime); // Fallback if not all-day
  }

  // --- Recurring ---

  isRecurringEvent() {
    const r = this.__resource;
    return !!r.recurringEventId;
  }

  getEventSeries() {
    const r = this.__resource;
    const seriesId = r.recurringEventId || this.__id; // If not an instance, it might be the series master itself? Or single event
    // If it's a single event, getEventSeries usually returns a series containing just this event (conceptually) or null?
    // Docs say: "Gets the event series this event belongs to."
    return newFakeCalendarEventSeries(this.__calendarId, { id: seriesId });
  }

  // --- Guests ---

  addGuest(email) {
    this.__checkWriteAccess();
    this.__checkGuestWhitelist(email);

    const resource = this.__resource;
    const attendees = resource.attendees || [];
    // Check if already there
    if (!attendees.find(a => a.email === email)) {
      attendees.push({ email });
      Calendar.Events.patch({ attendees }, this.__calendarId, this.__id, { sendUpdates: 'all' });
    }
    return this;
  }

  removeGuest(email) {
    this.__checkWriteAccess();
    const resource = this.__resource;
    const attendees = resource.attendees || [];
    const newAttendees = attendees.filter(a => a.email !== email);
    if (newAttendees.length !== attendees.length) {
      Calendar.Events.patch({ attendees: newAttendees }, this.__calendarId, this.__id);
    }
    return this;
  }

  getGuestList(includeOwner = false) {
    const r = this.__resource;
    if (!r.attendees) return [];
    return r.attendees.map(a => newFakeEventGuest(a)).filter(g => includeOwner || g.getEmail() !== r.creator.email);
  }

  getGuestByEmail(email) {
    const guests = this.getGuestList(true);
    return guests.find(g => g.getEmail() === email) || null;
  }

  getCreators() {
    const r = this.__resource;
    // In API v3, creator is a single object {email, displayName, self}
    // Apps Script returns string[].
    return r.creator ? [r.creator.email] : [];
  }

  // --- Reminders ---

  addEmailReminder(minutesBefore) {
    this.__checkWriteAccess();
    this.__addReminder('email', minutesBefore);
    return this;
  }

  addPopupReminder(minutesBefore) {
    this.__checkWriteAccess();
    this.__addReminder('popup', minutesBefore);
    return this;
  }

  addSmsReminder(minutesBefore) {
    this.__checkWriteAccess();
    this.__addReminder('sms', minutesBefore);
    return this;
  }

  __addReminder(method, minutes) {
    const r = this.__resource;
    const reminders = r.reminders || { useDefault: true, overrides: [] };
    if (reminders.useDefault) {
      reminders.useDefault = false;
      reminders.overrides = []; // Start fresh if we were using default
    }
    if (!reminders.overrides) reminders.overrides = [];
    reminders.overrides.push({ method, minutes });
    Calendar.Events.patch({ reminders }, this.__calendarId, this.__id);
  }

  getReminders() {
    const r = this.__resource;
    if (r.reminders && r.reminders.useDefault) return []; // Or default reminders? API implies explicit ones.
    return (r.reminders && r.reminders.overrides) ? r.reminders.overrides.map(o => o.minutes) : [];
  }

  getEmailReminders() {
    return this.__getRemindersByMethod('email');
  }

  getPopupReminders() {
    return this.__getRemindersByMethod('popup');
  }

  getSmsReminders() {
    return this.__getRemindersByMethod('sms');
  }

  __getRemindersByMethod(method) {
    const r = this.__resource;
    if (r.reminders && r.reminders.useDefault) return [];
    if (!r.reminders || !r.reminders.overrides) return [];
    return r.reminders.overrides.filter(o => o.method === method).map(o => o.minutes);
  }

  removeAllReminders() {
    this.__checkWriteAccess();
    Calendar.Events.patch({ reminders: { useDefault: false, overrides: [] } }, this.__calendarId, this.__id);
    return this;
  }

  resetRemindersToDefault() {
    this.__checkWriteAccess();
    Calendar.Events.patch({ reminders: { useDefault: true } }, this.__calendarId, this.__id);
    return this;
  }

  // --- Tags (Extended Properties) ---

  setTag(key, value) {
    this.__checkWriteAccess();
    const r = this.__resource;
    const extendedProperties = r.extendedProperties || { shared: {} };
    if (!extendedProperties.shared) extendedProperties.shared = {};
    extendedProperties.shared[key] = value;
    Calendar.Events.patch({ extendedProperties }, this.__calendarId, this.__id);
    return this;
  }

  getTag(key) {
    const r = this.__resource;
    return (r.extendedProperties && r.extendedProperties.shared && r.extendedProperties.shared[key]) || null;
  }

  getAllTagKeys() {
    const r = this.__resource;
    return (r.extendedProperties && r.extendedProperties.shared) ? Object.keys(r.extendedProperties.shared) : [];
  }

  deleteTag(key) {
    this.__checkWriteAccess();
    const r = this.__resource;
    if (r.extendedProperties && r.extendedProperties.shared && r.extendedProperties.shared[key]) {
        delete r.extendedProperties.shared[key];
        Calendar.Events.patch({ extendedProperties: r.extendedProperties }, this.__calendarId, this.__id);
    }
    return this;
  }

  // --- Metadata & Permissions ---

  getDateCreated() {
    return new Date(this.__resource.created);
  }

  getLastUpdated() {
    return new Date(this.__resource.updated);
  }

  isOwnedByMe() {
    const r = this.__resource;
    // Assuming 'me' logic or checking against session user
    const currentUserEmail = Session.getEffectiveUser().getEmail();
    return r.creator && r.creator.email === currentUserEmail;
  }

  getVisibility() {
    const r = this.__resource;
    // Map 'private', 'public', 'confidential', 'default'
    const v = r.visibility || 'default';
    return CalendarEnums.Visibility[v.toUpperCase()] || CalendarEnums.Visibility.DEFAULT;
  }

  setVisibility(visibility) {
    this.__checkWriteAccess();
    const v = visibility.toString().toLowerCase();
    Calendar.Events.patch({ visibility: v }, this.__calendarId, this.__id);
    return this;
  }

  getColor() {
    // Returns the event color ID as a string, or an empty string if no color is set.
    return this.__resource.colorId || '';
  }

  setColor(color) {
    this.__checkWriteAccess();
    // color should be an enum value or a colorId string
    const colorId = color.toString();
    Calendar.Events.patch({ colorId }, this.__calendarId, this.__id); 
    return this;
  }

  getEventType() {
    const r = this.__resource;
    const typeMap = {
        'default': CalendarEnums.EventType.DEFAULT,
        'outOfOffice': CalendarEnums.EventType.OUT_OF_OFFICE,
        'focusTime': CalendarEnums.EventType.FOCUS_TIME,
        'workingLocation': CalendarEnums.EventType.WORKING_LOCATION
    };
    return typeMap[r.eventType] || CalendarEnums.EventType.DEFAULT;
  }

  getMyStatus() {
    const r = this.__resource;
    const me = Session.getEffectiveUser().getEmail();
    const attendee = (r.attendees || []).find(a => a.email === me);
    if (!attendee) return CalendarEnums.GuestStatus.NO; 
    
    const map = {
        'accepted': CalendarEnums.GuestStatus.YES,
        'declined': CalendarEnums.GuestStatus.NO,
        'tentative': CalendarEnums.GuestStatus.MAYBE,
        'needsAction': CalendarEnums.GuestStatus.INVITED
    };
    return map[attendee.responseStatus] || CalendarEnums.GuestStatus.INVITED;
  }

  setMyStatus(status) {
    this.__checkWriteAccess();
    const me = Session.getEffectiveUser().getEmail();
    const r = this.__resource;
    const attendees = r.attendees || [];
    let attendee = attendees.find(a => a.email === me);
    
    const map = {};
    map[CalendarEnums.GuestStatus.YES] = 'accepted';
    map[CalendarEnums.GuestStatus.NO] = 'declined';
    map[CalendarEnums.GuestStatus.MAYBE] = 'tentative';
    map[CalendarEnums.GuestStatus.INVITED] = 'needsAction';
    
    const apiStatus = map[status];
    if (!apiStatus) return this;

    if (!attendee) {
        attendee = { email: me, responseStatus: apiStatus };
        attendees.push(attendee);
    } else {
        attendee.responseStatus = apiStatus;
    }
    Calendar.Events.patch({ attendees }, this.__calendarId, this.__id);
    return this;
  }

  getTransparency() {
    const r = this.__resource;
    const t = r.transparency || 'opaque';
    return t === 'transparent' ? CalendarEnums.EventTransparency.TRANSPARENT : CalendarEnums.EventTransparency.OPAQUE;
  }

  setTransparency(transparency) {
    this.__checkWriteAccess();
    const t = transparency === CalendarEnums.EventTransparency.TRANSPARENT ? 'transparent' : 'opaque';
    Calendar.Events.patch({ transparency: t }, this.__calendarId, this.__id);
    return this;
  }

  setAllDayDates(startDate, endDate) {
    this.__checkWriteAccess();
    const toDateString = (d) => d.toISOString().split('T')[0];
    // Apps Script setAllDayDates uses exclusive end date logic same as createAllDayEvent
    Calendar.Events.patch({
      start: { date: toDateString(startDate) },
      end: { date: toDateString(endDate) }
    }, this.__calendarId, this.__id);
    return this;
  }

  guestsCanInviteOthers() {
    return !!this.__resource.guestsCanInviteOthers;
  }

  setGuestsCanInviteOthers(guestsCanInviteOthers) {
    this.__checkWriteAccess();
    Calendar.Events.patch({ guestsCanInviteOthers }, this.__calendarId, this.__id);
    return this;
  }

  guestsCanModify() {
    return !!this.__resource.guestsCanModify;
  }

  setGuestsCanModify(guestsCanModify) {
    this.__checkWriteAccess();
    Calendar.Events.patch({ guestsCanModify }, this.__calendarId, this.__id);
    return this;
  }

  guestsCanSeeGuests() {
    return !!this.__resource.guestsCanSeeGuests;
  }

  setGuestsCanSeeGuests(guestsCanSeeGuests) {
    this.__checkWriteAccess();
    Calendar.Events.patch({ guestsCanSeeGuests }, this.__calendarId, this.__id);
    return this;
  }

  anyoneCanAddSelf() {
    return !!this.__resource.anyoneCanAddSelf;
  }

  setAnyoneCanAddSelf(anyoneCanAddSelf) {
    this.__checkWriteAccess();
    Calendar.Events.patch({ anyoneCanAddSelf }, this.__calendarId, this.__id);
    return this;
  }

  // --- Deletion ---

  deleteEvent() {
    this.__checkWriteAccess();
    Calendar.Events.delete(this.__calendarId, this.__id);
  }

  // --- Helpers ---

  __checkWriteAccess() {
    this.__checkUsage('write');
    this.__checkPermission('write');
  }

  __checkUsage(type) {
    const serviceName = 'CalendarApp';
    const behavior = ScriptApp.__behavior;
    if (behavior && behavior.sandboxMode) {
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

  __checkPermission(accessType) {
    const behavior = ScriptApp.__behavior;
    if (!behavior || !behavior.sandboxMode) return;

    const calendarId = this.__calendarId;

    // Session-created calendars are always writable
    if (behavior.isKnownCalendar(calendarId)) return;

    // Check whitelist
    const settings = behavior.sandboxService.CalendarApp;
    const whitelist = settings && settings.calendarWhitelist;

    if (!whitelist) {
      throw new Error(`Access to calendar ${calendarId} is denied. No calendar whitelist configured.`);
    }

    // Get calendar name
    let calendarName = '';
    try {
      const cal = Calendar.Calendars.get(calendarId);
      calendarName = cal.summary;
    } catch (e) { }

    // Primary check
    if (calendarId === 'primary') {
      const entry = whitelist.find(item => item.name === 'Primary' || item.name === 'primary');
      if (entry && entry[accessType]) return;
      // If primary is not explicitly in whitelist, we deny write access by default in sandbox mode
    }

    const entry = whitelist.find(item => item.name === calendarName);
    if (entry && entry[accessType]) return;

    throw new Error(`${accessType} access to calendar "${calendarName}" (${calendarId}) is denied by sandbox rules`);
  }

  __checkGuestWhitelist(email) {
    const behavior = ScriptApp.__behavior;
    if (!behavior || !behavior.sandboxMode) return;

    const gmailSettings = behavior.sandboxService.GmailApp;
    const whitelist = gmailSettings && gmailSettings.emailWhitelist;

    if (whitelist) {
      if (!whitelist.includes(email)) {
        throw new Error(`Adding guest ${email} is denied by Gmail sandbox whitelist rules`);
      }
    }
  }

  toString() {
    return 'CalendarEvent';
  }
}
