import { Proxies } from '../../support/proxies.js';
import { newFakeEventGuest } from './fakeeventguest.js';
import * as CalendarEnums from '../enums/calendarenums.js';

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

  // --- Guests ---

  addGuest(email) {
    this.__checkWriteAccess();
    // Assuming same guest whitelist logic applies to series
    this.__checkGuestWhitelist(email);

    const resource = this.__resource;
    const attendees = resource.attendees || [];
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
      reminders.overrides = [];
    }
    if (!reminders.overrides) reminders.overrides = [];
    reminders.overrides.push({ method, minutes });
    Calendar.Events.patch({ reminders }, this.__calendarId, this.__id);
  }

  getReminders() {
    const r = this.__resource;
    if (r.reminders && r.reminders.useDefault) return [];
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
    const currentUserEmail = Session.getEffectiveUser().getEmail();
    return r.creator && r.creator.email === currentUserEmail;
  }

  getOriginalCalendarId() {
    return this.__calendarId;
  }

  getVisibility() {
    const r = this.__resource;
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
    return this.__resource.colorId || '';
  }

  setColor(color) {
    this.__checkWriteAccess();
    Calendar.Events.patch({ colorId: '1' }, this.__calendarId, this.__id); // Placeholder
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
    if (!attendee) return CalendarEnums.GuestStatus.NO; // Or maybe INVITED if explicitly?
    
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
    // In API, patching your own response status is done via events.patch/update usually
    const me = Session.getEffectiveUser().getEmail();
    const r = this.__resource;
    const attendees = r.attendees || [];
    let attendee = attendees.find(a => a.email === me);
    
    // Map Enum to API string
    const map = {};
    map[CalendarEnums.GuestStatus.YES] = 'accepted';
    map[CalendarEnums.GuestStatus.NO] = 'declined';
    map[CalendarEnums.GuestStatus.MAYBE] = 'tentative';
    map[CalendarEnums.GuestStatus.INVITED] = 'needsAction';
    
    const apiStatus = map[status];
    if (!apiStatus) return this;

    if (!attendee) {
        // If I'm not on the list, can I set my status? Maybe adding myself?
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

  // --- Recurrence ---

  setRecurrence(recurrence, startTime, endTime) {
      this.__checkWriteAccess();
      // This is complex. Recurrence object logic needs to be fully implemented to convert to RRULE.
      // For now, we will just update start/end time as a placeholder if provided.
      // Ideally, `recurrence` (EventRecurrence) should provide RRULEs.
      // TODO: Implement recurrence conversion.
      const resource = {};
      if (startTime) resource.start = { dateTime: startTime.toISOString() };
      if (endTime) resource.end = { dateTime: endTime.toISOString() };
      
      // resource.recurrence = [ recurrence.toRRule() ]; // Hypothetical method on FakeEventRecurrence
      
      Calendar.Events.patch(resource, this.__calendarId, this.__id);
      return this;
  }

  deleteEventSeries() {
    this.__checkWriteAccess();
    Calendar.Events.delete(this.__calendarId, this.__id);
  }

  // --- Helpers (Duplicated from FakeCalendarEvent) ---

  __checkWriteAccess() {
    this.__checkUsage('write');
    this.__checkPermission('write');
  }

  __checkUsage(type) {
    const serviceName = 'CalendarApp';
    const behavior = ScriptApp.__behavior;
    if (behavior && behavior.sandboxMode) {
        const settings = behavior.sandboxService[serviceName];
        if (settings) {
            settings.incrementUsage(type);
        }
    }
  }

  __checkPermission(accessType) {
    // Basic check relying on FakeCalendar implementation logic or just mimicking it here.
    // Ideally this logic resides in a shared helper or the CalendarApp/Calendar object.
    // For now, we assume if we can get the resource, we can try to patch it, and let API handle permissions
    // UNLESS sandbox mode is on.
    const behavior = ScriptApp.__behavior;
    if (!behavior || !behavior.sandboxMode) return;

    // ... (Same logic as FakeCalendarEvent) ...
    // Simplified: Check if calendar is writable in whitelist.
    const settings = behavior.sandboxService.CalendarApp;
    const whitelist = settings && settings.calendarWhitelist;
    
    if (!whitelist) throw new Error('Sandbox access denied (no whitelist)');

    // Fetch calendar summary for name check
    let calendarName = '';
    try {
        const cal = Calendar.Calendars.get(this.__calendarId);
        calendarName = cal.summary;
    } catch(e) {}

    if (this.__calendarId === 'primary') {
        const entry = whitelist.find(item => item.name === 'Primary' || item.name === 'primary');
        if (entry && entry[accessType]) return;
    }
    const entry = whitelist.find(item => item.name === calendarName);
    if (entry && entry[accessType]) return;

    throw new Error(`Sandbox ${accessType} access to calendar ${this.__calendarId} denied`);
  }

  __checkGuestWhitelist(email) {
    const behavior = ScriptApp.__behavior;
    if (!behavior || !behavior.sandboxMode) return;
    const gmailSettings = behavior.sandboxService.GmailApp;
    const whitelist = gmailSettings && gmailSettings.emailWhitelist;
    if (whitelist && !whitelist.includes(email)) {
        throw new Error(`Adding guest ${email} is denied by Gmail sandbox whitelist`);
    }
  }

  toString() {
    return 'CalendarEventSeries';
  }
}