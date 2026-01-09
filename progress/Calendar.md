# [Calendar](https://developers.google.com/apps-script/reference/calendar)

This service allows a script to access and modify the user's Google Calendar, including additional calendars that the user is subscribed to.

## Class: [Calendar](https://developers.google.com/apps-script/reference/calendar/calendar)

Represents a calendar that the user owns or is subscribed to.

| Method | Description | Return Type | Return Description | Status | Implementation |
|--- |--- |--- |--- |--- |--- |
| [createAllDayEvent(String,Date,Date,Object)](https://developers.google.com/apps-script/reference/calendar/calendar#createAllDayEvent(String,Date,Date,Object)) |  |  |  | not started |  |
| [createAllDayEvent(String,Date,Date)](https://developers.google.com/apps-script/reference/calendar/calendar#createAllDayEvent(String,Date,Date)) |  |  |  | not started |  |
| [createAllDayEvent(String,Date,Object)](https://developers.google.com/apps-script/reference/calendar/calendar#createAllDayEvent(String,Date,Object)) |  |  |  | not started |  |
| [createAllDayEvent(String,Date)](https://developers.google.com/apps-script/reference/calendar/calendar#createAllDayEvent(String,Date)) |  |  |  | not started |  |
| [createAllDayEventSeries(String,Date,EventRecurrence,Object)](https://developers.google.com/apps-script/reference/calendar/calendar#createAllDayEventSeries(String,Date,EventRecurrence,Object)) |  |  |  | not started |  |
| [createAllDayEventSeries(String,Date,EventRecurrence)](https://developers.google.com/apps-script/reference/calendar/calendar#createAllDayEventSeries(String,Date,EventRecurrence)) |  |  |  | not started |  |
| [createEvent(String,Date,Date,Object)](https://developers.google.com/apps-script/reference/calendar/calendar#createEvent(String,Date,Date,Object)) |  |  |  | not started |  |
| [createEvent(String,Date,Date)](https://developers.google.com/apps-script/reference/calendar/calendar#createEvent(String,Date,Date)) |  |  |  | not started |  |
| [createEventFromDescription(String)](https://developers.google.com/apps-script/reference/calendar/calendar#createEventFromDescription(String)) | Creates an event from a free-form description. | [CalendarEvent](#class-calendarevent) | the created event | not started |  |
| [createEventSeries(String,Date,Date,EventRecurrence,Object)](https://developers.google.com/apps-script/reference/calendar/calendar#createEventSeries(String,Date,Date,EventRecurrence,Object)) |  |  |  | not started |  |
| [createEventSeries(String,Date,Date,EventRecurrence)](https://developers.google.com/apps-script/reference/calendar/calendar#createEventSeries(String,Date,Date,EventRecurrence)) |  |  |  | not started |  |
| [deleteCalendar()](https://developers.google.com/apps-script/reference/calendar/calendar#deleteCalendar()) | Deletes the calendar permanently. A user can only delete a calendar they own. |  |  | not started |  |
| [getColor()](https://developers.google.com/apps-script/reference/calendar/calendar#getColor()) | Gets the color of the calendar. | String | A hexadecimal color string ("#rrggbb"). | not started |  |
| [getDescription()](https://developers.google.com/apps-script/reference/calendar/calendar#getDescription()) | Gets the description of the calendar. | String | The description of this calendar. | completed | [link](../src/services/calendarapp/fakecalendar.js#L42) |
| [getEventById(String)](https://developers.google.com/apps-script/reference/calendar/calendar#getEventById(String)) | Gets the event with the given ID. If the series belongs to a calendar other than the default calendar, this method must be called from that calendar. Calling CalendarApp.getEventById(iCalId) only returns an event in the default calendar. | [CalendarEvent](#class-calendarevent) | The event with the given ID, or null if the event doesn't exist or the user cannot access it. | not started |  |
| [getEvents(Date,Date,Object)](https://developers.google.com/apps-script/reference/calendar/calendar#getEvents(Date,Date,Object)) |  |  |  | not started |  |
| [getEvents(Date,Date)](https://developers.google.com/apps-script/reference/calendar/calendar#getEvents(Date,Date)) |  |  |  | not started |  |
| [getEventSeriesById(String)](https://developers.google.com/apps-script/reference/calendar/calendar#getEventSeriesById(String)) | Gets the event series with the given ID. If the ID given is for a single CalendarEvent, then a CalendarEventSeries is returned with a single event in the series. Note that if the event series belongs to a calendar other than the default calendar, this method must be called from that Calendar; calling CalendarApp.getEventSeriesById(iCalId) directly only returns an event series that exists in the default calendar. | [CalendarEventSeries](#class-calendareventseries) | The series with the given ID, or null if the series doesn't exist or the user cannot access it. | not started |  |
| [getEventsForDay(Date,Object)](https://developers.google.com/apps-script/reference/calendar/calendar#getEventsForDay(Date,Object)) |  |  |  | not started |  |
| [getEventsForDay(Date)](https://developers.google.com/apps-script/reference/calendar/calendar#getEventsForDay(Date)) | Gets all events that occur on a given day. | [CalendarEvent[]](#class-calendarevent) | the events that occur on the given date | not started |  |
| [getId()](https://developers.google.com/apps-script/reference/calendar/calendar#getId()) | Gets the ID of the calendar. The ID for a user's default calendar is their email address. | String | The ID of the calendar. | completed | [link](../src/services/calendarapp/fakecalendar.js#L28) |
| [getName()](https://developers.google.com/apps-script/reference/calendar/calendar#getName()) | Gets the name of the calendar. | String | This calendar's name. | completed | [link](../src/services/calendarapp/fakecalendar.js#L32) |
| [getTimeZone()](https://developers.google.com/apps-script/reference/calendar/calendar#getTimeZone()) | Gets the time zone of the calendar. | String | The time zone, specified in "long" format (for example, "America/New_York", as listed by Joda.org). | completed | [link](../src/services/calendarapp/fakecalendar.js#L52) |
| [isHidden()](https://developers.google.com/apps-script/reference/calendar/calendar#isHidden()) | Determines whether the calendar is hidden in the user interface. | Boolean | true if the calendar is hidden in the user interface; false if it isn't. | completed | [link](../src/services/calendarapp/fakecalendar.js#L73) |
| [isMyPrimaryCalendar()](https://developers.google.com/apps-script/reference/calendar/calendar#isMyPrimaryCalendar()) | Determines whether the calendar is the primary calendar for the effective user. | Boolean | true if the calendar is the default calendar for the effective user; false if it isn't. | completed | [link](../src/services/calendarapp/fakecalendar.js#L62) |
| [isOwnedByMe()](https://developers.google.com/apps-script/reference/calendar/calendar#isOwnedByMe()) | Determines whether the calendar is owned by you. | Boolean | true if the calendar is owned by you; false if not. | completed | [link](../src/services/calendarapp/fakecalendar.js#L68) |
| [isSelected()](https://developers.google.com/apps-script/reference/calendar/calendar#isSelected()) | Determines whether the calendar's events are displayed in the user interface. | Boolean | true if the calendar's events are displayed in the user interface; false if not | completed | [link](../src/services/calendarapp/fakecalendar.js#L77) |
| [setColor(String)](https://developers.google.com/apps-script/reference/calendar/calendar#setColor(String)) | Sets the color of the calendar. | [Calendar](#class-calendar) | This calendar for chaining. | not started |  |
| [setDescription(String)](https://developers.google.com/apps-script/reference/calendar/calendar#setDescription(String)) | Sets the description of a calendar. | [Calendar](#class-calendar) | this calendar for chaining | completed | [link](../src/services/calendarapp/fakecalendar.js#L46) |
| [setHidden(Boolean)](https://developers.google.com/apps-script/reference/calendar/calendar#setHidden(Boolean)) | Sets whether the calendar is visible in the user interface. | [Calendar](#class-calendar) | this calendar for chaining | not started |  |
| [setName(String)](https://developers.google.com/apps-script/reference/calendar/calendar#setName(String)) | Sets the name of the calendar. | [Calendar](#class-calendar) | this calendar for chaining | completed | [link](../src/services/calendarapp/fakecalendar.js#L36) |
| [setSelected(Boolean)](https://developers.google.com/apps-script/reference/calendar/calendar#setSelected(Boolean)) | Sets whether the calendar's events are displayed in the user interface. | [Calendar](#class-calendar) | this calendar for chaining | not started |  |
| [setTimeZone(String)](https://developers.google.com/apps-script/reference/calendar/calendar#setTimeZone(String)) | Sets the time zone of the calendar. | [Calendar](#class-calendar) | This calendar for chaining. | completed | [link](../src/services/calendarapp/fakecalendar.js#L56) |
| [unsubscribeFromCalendar()](https://developers.google.com/apps-script/reference/calendar/calendar#unsubscribeFromCalendar()) | Unsubscribes the user from a calendar. A user can't unsubscribe from calendars listed under the My calendars list. They can unsubscribe from calendars listed under Other calendars. |  |  | not started |  |

## Class: [CalendarApp](https://developers.google.com/apps-script/reference/calendar/calendar-app)

Allows a script to read and update the user's Google Calendar. This class provides direct access to the user's default calendar, as well as the ability to retrieve additional calendars that the user owns or is subscribed to.

| Method | Description | Return Type | Return Description | Status | Implementation |
|--- |--- |--- |--- |--- |--- |
| [createAllDayEvent(String,Date,Date,Object)](https://developers.google.com/apps-script/reference/calendar/calendar-app#createAllDayEvent(String,Date,Date,Object)) |  |  |  | not started |  |
| [createAllDayEvent(String,Date,Date)](https://developers.google.com/apps-script/reference/calendar/calendar-app#createAllDayEvent(String,Date,Date)) |  |  |  | not started |  |
| [createAllDayEvent(String,Date,Object)](https://developers.google.com/apps-script/reference/calendar/calendar-app#createAllDayEvent(String,Date,Object)) |  |  |  | not started |  |
| [createAllDayEvent(String,Date)](https://developers.google.com/apps-script/reference/calendar/calendar-app#createAllDayEvent(String,Date)) |  |  |  | not started |  |
| [createAllDayEventSeries(String,Date,EventRecurrence,Object)](https://developers.google.com/apps-script/reference/calendar/calendar-app#createAllDayEventSeries(String,Date,EventRecurrence,Object)) |  |  |  | not started |  |
| [createAllDayEventSeries(String,Date,EventRecurrence)](https://developers.google.com/apps-script/reference/calendar/calendar-app#createAllDayEventSeries(String,Date,EventRecurrence)) |  |  |  | not started |  |
| [createCalendar(String,Object)](https://developers.google.com/apps-script/reference/calendar/calendar-app#createCalendar(String,Object)) |  |  |  | completed | [link](../src/services/calendarapp/fakecalendarapp.js#L23) |
| [createCalendar(String)](https://developers.google.com/apps-script/reference/calendar/calendar-app#createCalendar(String)) | Creates a new calendar, owned by the user. | [Calendar](#class-calendar) | the newly created calendar | completed | [link](../src/services/calendarapp/fakecalendarapp.js#L23) |
| [createEvent(String,Date,Date,Object)](https://developers.google.com/apps-script/reference/calendar/calendar-app#createEvent(String,Date,Date,Object)) |  |  |  | not started |  |
| [createEvent(String,Date,Date)](https://developers.google.com/apps-script/reference/calendar/calendar-app#createEvent(String,Date,Date)) |  |  |  | not started |  |
| [createEventFromDescription(String)](https://developers.google.com/apps-script/reference/calendar/calendar-app#createEventFromDescription(String)) | Creates an event from a free-form description. | [CalendarEvent](#class-calendarevent) | the created event | not started |  |
| [createEventSeries(String,Date,Date,EventRecurrence,Object)](https://developers.google.com/apps-script/reference/calendar/calendar-app#createEventSeries(String,Date,Date,EventRecurrence,Object)) |  |  |  | not started |  |
| [createEventSeries(String,Date,Date,EventRecurrence)](https://developers.google.com/apps-script/reference/calendar/calendar-app#createEventSeries(String,Date,Date,EventRecurrence)) |  |  |  | not started |  |
| [getAllCalendars()](https://developers.google.com/apps-script/reference/calendar/calendar-app#getAllCalendars()) | Gets all calendars that the user owns or is subscribed to. | [Calendar[]](#class-calendar) | all calendars that the user can access | completed | [link](../src/services/calendarapp/fakecalendarapp.js#L56) |
| [getAllOwnedCalendars()](https://developers.google.com/apps-script/reference/calendar/calendar-app#getAllOwnedCalendars()) | Gets all calendars that the user owns. | [Calendar[]](#class-calendar) | all calendars that the user owns | completed | [link](../src/services/calendarapp/fakecalendarapp.js#L65) |
| [getCalendarById(String)](https://developers.google.com/apps-script/reference/calendar/calendar-app#getCalendarById(String)) | Gets the calendar with the given ID. | [Calendar](#class-calendar) | the calendar with the given ID, or null if the calendar does not exist, if the user cannot access it, or if the user is not subscribed to the calendar | completed | [link](../src/services/calendarapp/fakecalendarapp.js#L33) |
| [getCalendarsByName(String)](https://developers.google.com/apps-script/reference/calendar/calendar-app#getCalendarsByName(String)) | Gets all calendars with a given name that the user owns or is subscribed to. Names are not case-sensitive. | [Calendar[]](#class-calendar) | all calendars with this name that the user can access | completed | [link](../src/services/calendarapp/fakecalendarapp.js#L46) |
| [getColor()](https://developers.google.com/apps-script/reference/calendar/calendar-app#getColor()) | Gets the color of the calendar. | String | A hexadecimal color string ("#rrggbb"). | not started |  |
| [getDefaultCalendar()](https://developers.google.com/apps-script/reference/calendar/calendar-app#getDefaultCalendar()) | Gets the user's default calendar. | [Calendar](#class-calendar) | the user's default calendar | completed | [link](../src/services/calendarapp/fakecalendarapp.js#L41) |
| [getDescription()](https://developers.google.com/apps-script/reference/calendar/calendar-app#getDescription()) | Gets the description of the calendar. | String | The description of this calendar. | not started |  |
| [getEventById(String)](https://developers.google.com/apps-script/reference/calendar/calendar-app#getEventById(String)) | Gets the event with the given ID. If the series belongs to a calendar other than the default calendar, this method must be called from that calendar. Calling getEventById(iCalId) only returns an event in the default calendar. | [CalendarEvent](#class-calendarevent) | The event with the given ID, or null if the event doesn't exist or the user cannot access it. | not started |  |
| [getEvents(Date,Date,Object)](https://developers.google.com/apps-script/reference/calendar/calendar-app#getEvents(Date,Date,Object)) |  |  |  | not started |  |
| [getEvents(Date,Date)](https://developers.google.com/apps-script/reference/calendar/calendar-app#getEvents(Date,Date)) |  |  |  | not started |  |
| [getEventSeriesById(String)](https://developers.google.com/apps-script/reference/calendar/calendar-app#getEventSeriesById(String)) | Gets the event series with the given ID. If the ID given is for a single CalendarEvent, then a CalendarEventSeries is returned with a single event in the series. Note that if the event series belongs to a calendar other than the default calendar, this method must be called from that CalendarApp; calling getEventSeriesById(iCalId) directly only returns an event series that exists in the default calendar. | [CalendarEventSeries](#class-calendareventseries) | The series with the given ID, or null if the series doesn't exist or the user cannot access it. | not started |  |
| [getEventsForDay(Date,Object)](https://developers.google.com/apps-script/reference/calendar/calendar-app#getEventsForDay(Date,Object)) |  |  |  | not started |  |
| [getEventsForDay(Date)](https://developers.google.com/apps-script/reference/calendar/calendar-app#getEventsForDay(Date)) | Gets all events that occur on a given day. | [CalendarEvent[]](#class-calendarevent) | the events that occur on the given date | not started |  |
| [getId()](https://developers.google.com/apps-script/reference/calendar/calendar-app#getId()) | Gets the ID of the calendar. The ID for a user's default calendar is their email address. | String | The ID of the calendar. | not started |  |
| [getName()](https://developers.google.com/apps-script/reference/calendar/calendar-app#getName()) | Gets the name of the calendar. | String | This calendar's name. | not started |  |
| [getOwnedCalendarById(String)](https://developers.google.com/apps-script/reference/calendar/calendar-app#getOwnedCalendarById(String)) | Gets the calendar with the given ID, if the user owns it. | [Calendar](#class-calendar) | the calendar with the given ID, or null if the calendar does not exist or the user does not own it | not started |  |
| [getOwnedCalendarsByName(String)](https://developers.google.com/apps-script/reference/calendar/calendar-app#getOwnedCalendarsByName(String)) | Gets all calendars with a given name that the user owns. Names are not case-sensitive. | [Calendar[]](#class-calendar) | all calendars with this name that the user owns | not started |  |
| [getTimeZone()](https://developers.google.com/apps-script/reference/calendar/calendar-app#getTimeZone()) | Gets the time zone of the calendar. | String | The time zone, specified in "long" format (for example, "America/New_York", as listed by Joda.org). | not started |  |
| [isHidden()](https://developers.google.com/apps-script/reference/calendar/calendar-app#isHidden()) | Determines whether the calendar is hidden in the user interface. | Boolean | true if the calendar is hidden in the user interface; false if it isn't. | not started |  |
| [isMyPrimaryCalendar()](https://developers.google.com/apps-script/reference/calendar/calendar-app#isMyPrimaryCalendar()) | Determines whether the calendar is the primary calendar for the effective user. | Boolean | true if the calendar is the default calendar for the effective user; false if it isn't. | not started |  |
| [isOwnedByMe()](https://developers.google.com/apps-script/reference/calendar/calendar-app#isOwnedByMe()) | Determines whether the calendar is owned by you. | Boolean | true if the calendar is owned by you; false if not. | not started |  |
| [isSelected()](https://developers.google.com/apps-script/reference/calendar/calendar-app#isSelected()) | Determines whether the calendar's events are displayed in the user interface. | Boolean | true if the calendar's events are displayed in the user interface; false if not | not started |  |
| [newRecurrence()](https://developers.google.com/apps-script/reference/calendar/calendar-app#newRecurrence()) | Creates a new recurrence object, which can be used to create rules for event recurrence. | [EventRecurrence](#class-eventrecurrence) | a new recurrence object with no rules set (behaves as a weekly recurrence) | not started |  |
| [setColor(String)](https://developers.google.com/apps-script/reference/calendar/calendar-app#setColor(String)) | Sets the color of the calendar. | [Calendar](#class-calendar) | This calendar for chaining. | not started |  |
| [setDescription(String)](https://developers.google.com/apps-script/reference/calendar/calendar-app#setDescription(String)) | Sets the description of a calendar. | [Calendar](#class-calendar) | this calendar for chaining | not started |  |
| [setHidden(Boolean)](https://developers.google.com/apps-script/reference/calendar/calendar-app#setHidden(Boolean)) | Sets whether the calendar is visible in the user interface. | [Calendar](#class-calendar) | this calendar for chaining | not started |  |
| [setName(String)](https://developers.google.com/apps-script/reference/calendar/calendar-app#setName(String)) | Sets the name of the calendar. | [Calendar](#class-calendar) | this calendar for chaining | not started |  |
| [setSelected(Boolean)](https://developers.google.com/apps-script/reference/calendar/calendar-app#setSelected(Boolean)) | Sets whether the calendar's events are displayed in the user interface. | [Calendar](#class-calendar) | this calendar for chaining | not started |  |
| [setTimeZone(String)](https://developers.google.com/apps-script/reference/calendar/calendar-app#setTimeZone(String)) | Sets the time zone of the calendar. | [Calendar](#class-calendar) | This calendar for chaining. | not started |  |
| [subscribeToCalendar(String,Object)](https://developers.google.com/apps-script/reference/calendar/calendar-app#subscribeToCalendar(String,Object)) |  |  |  | not started |  |
| [subscribeToCalendar(String)](https://developers.google.com/apps-script/reference/calendar/calendar-app#subscribeToCalendar(String)) | Subscribes the user to the calendar with the given ID, if the user is allowed to subscribe. | [Calendar](#class-calendar) | the newly subscribed to calendar | not started |  |

## Class: [CalendarEvent](https://developers.google.com/apps-script/reference/calendar/calendar-event)

Represents a single calendar event.

| Method | Description | Return Type | Return Description | Status | Implementation |
|--- |--- |--- |--- |--- |--- |
| [addEmailReminder(Integer)](https://developers.google.com/apps-script/reference/calendar/calendar-event#addEmailReminder(Integer)) | Adds a new email reminder to the event. The reminder must be at least 5 minutes, and at most 4 weeks (40320 minutes), before the event. | [CalendarEvent](#class-calendarevent) | this CalendarEvent for chaining | not started |  |
| [addGuest(String)](https://developers.google.com/apps-script/reference/calendar/calendar-event#addGuest(String)) | Adds a guest to the event. | [CalendarEvent](#class-calendarevent) | This CalendarEvent for chaining. | not started |  |
| [addPopupReminder(Integer)](https://developers.google.com/apps-script/reference/calendar/calendar-event#addPopupReminder(Integer)) | Adds a new pop-up notification to the event. The notification must be at least 5 minutes, and at most 4 weeks (40320 minutes), before the event. | [CalendarEvent](#class-calendarevent) | this CalendarEvent for chaining | not started |  |
| [addSmsReminder(Integer)](https://developers.google.com/apps-script/reference/calendar/calendar-event#addSmsReminder(Integer)) | Adds a new SMS reminder to the event. The reminder must be at least 5 minutes, and at most 4 weeks (40320 minutes), before the event. | [CalendarEvent](#class-calendarevent) | this CalendarEvent for chaining | not started |  |
| [anyoneCanAddSelf()](https://developers.google.com/apps-script/reference/calendar/calendar-event#anyoneCanAddSelf()) | Determines whether people can add themselves as guests to a Calendar event. | Boolean | true if non-guests can add themselves to the event; false if not | not started |  |
| [deleteEvent()](https://developers.google.com/apps-script/reference/calendar/calendar-event#deleteEvent()) | Deletes a Calendar event. |  |  | not started |  |
| [deleteTag(String)](https://developers.google.com/apps-script/reference/calendar/calendar-event#deleteTag(String)) | Deletes a key/value tag from the event. | [CalendarEvent](#class-calendarevent) | this CalendarEvent for chaining | not started |  |
| [getAllDayEndDate()](https://developers.google.com/apps-script/reference/calendar/calendar-event#getAllDayEndDate()) | Gets the date on which this all-day calendar event ends. (If this is not an all-day event, then this method throws an exception.) The returned Date represents midnight at the beginning of the day after the event ends in the script's time zone. To use the calendar's time zone instead, call getEndTime(). | Date | this all-day calendar event's end date | not started |  |
| [getAllDayStartDate()](https://developers.google.com/apps-script/reference/calendar/calendar-event#getAllDayStartDate()) | Gets the date on which this all-day calendar event begins. (If this is not an all-day event, then this method throws an exception.) The returned Date represents midnight at the beginning of the day on which the event starts in the script's time zone. To use the calendar's time zone instead, call getStartTime(). | Date | this all-day calendar event's start date | not started |  |
| [getAllTagKeys()](https://developers.google.com/apps-script/reference/calendar/calendar-event#getAllTagKeys()) | Gets all keys for tags that have been set on the event. | String[] | an array of string keys | not started |  |
| [getColor()](https://developers.google.com/apps-script/reference/calendar/calendar-event#getColor()) | Returns the color of the calendar event. | String | The string representation of the event color, as an index (1-11) of values from CalendarApp.EventColor. | not started |  |
| [getCreators()](https://developers.google.com/apps-script/reference/calendar/calendar-event#getCreators()) | Gets the creators of an event. | String[] | the email addresses of the event's creators | not started |  |
| [getDateCreated()](https://developers.google.com/apps-script/reference/calendar/calendar-event#getDateCreated()) | Gets the date the event was created. You must have access to the calendar. | Date | the date of creation | not started |  |
| [getDescription()](https://developers.google.com/apps-script/reference/calendar/calendar-event#getDescription()) | Gets the description of the event. You must have edit access to the calendar. | String | the description | not started |  |
| [getEmailReminders()](https://developers.google.com/apps-script/reference/calendar/calendar-event#getEmailReminders()) | Gets the minute values for all email reminders for the event. You must have edit access to the calendar. | Integer[] | an array in which each value corresponds to the number of minutes before the event that a reminder triggers | not started |  |
| [getEndTime()](https://developers.google.com/apps-script/reference/calendar/calendar-event#getEndTime()) | Gets the date and time at which this calendar event ends. You must have access to the calendar. For non–all-day events, this is the instant in time at which the event was defined to end. For all-day events, which only store an end date (not a date and time), this is midnight at the beginning of the day after the event ends in the calendar's time zone. This allows meaningful comparison of end times for all types of events; however, it does not necessarily preserve the original day-of-year unmodified. | Date | this calendar event's end time | not started |  |
| [getEventSeries()](https://developers.google.com/apps-script/reference/calendar/calendar-event#getEventSeries()) | Gets the series of recurring events that this event belongs to. You must have access to the calendar. A CalendarEventSeries object is returned even if this event doesn't belong to a series, so that you can add new recurrence settings. | [CalendarEventSeries](#class-calendareventseries) | the event series this event belongs to, or a new event series if it does not yet belong to a series | not started |  |
| [getEventType()](https://developers.google.com/apps-script/reference/calendar/calendar-event#getEventType()) | Gets the EventType of this event. | [EventType](#enum-eventtype) | The event type. | not started |  |
| [getGuestByEmail(String)](https://developers.google.com/apps-script/reference/calendar/calendar-event#getGuestByEmail(String)) | Gets a guest by email address. | [EventGuest](#class-eventguest) | the guest, or null if the email address does not correspond to a guest | not started |  |
| [getGuestList()](https://developers.google.com/apps-script/reference/calendar/calendar-event#getGuestList()) | Gets the guests for the event, not including the event owner. | [EventGuest[]](#class-eventguest) | an array of the guests | not started |  |
| [getGuestList(Boolean)](https://developers.google.com/apps-script/reference/calendar/calendar-event#getGuestList(Boolean)) | Gets the guests for the event, potentially including the event owners. | [EventGuest[]](#class-eventguest) | an array of the guests | not started |  |
| [getId()](https://developers.google.com/apps-script/reference/calendar/calendar-event#getId()) | Gets the unique iCalUID of the event. Note that the iCalUID and the event id used by the Calendar v3 API and Calendar advanced service are not identical and cannot be used interchangeably. One difference in their semantics is that in recurring events all occurrences of one event have different ids while they all share the same iCalUIDs. | String | the iCalUID of the event | not started |  |
| [getLastUpdated()](https://developers.google.com/apps-script/reference/calendar/calendar-event#getLastUpdated()) | Gets the date the event was last updated. | Date | the last updated date | not started |  |
| [getLocation()](https://developers.google.com/apps-script/reference/calendar/calendar-event#getLocation()) | Gets the location of the event. | String | the event location | not started |  |
| [getMyStatus()](https://developers.google.com/apps-script/reference/calendar/calendar-event#getMyStatus()) | Gets the event status (such as attending or invited) of the effective user. Always returns GuestStatus.OWNER if the effective user is the owner of the event. | [GuestStatus](#enum-gueststatus) | the status | not started |  |
| [getOriginalCalendarId()](https://developers.google.com/apps-script/reference/calendar/calendar-event#getOriginalCalendarId()) | Get the ID of the calendar where this event was originally created. | String | the ID of the original calendar | not started |  |
| [getPopupReminders()](https://developers.google.com/apps-script/reference/calendar/calendar-event#getPopupReminders()) | Gets the minute values for all pop-up reminders for the event. | Integer[] | an array in which each value corresponds to the number of minutes before the event that a reminder triggers | not started |  |
| [getSmsReminders()](https://developers.google.com/apps-script/reference/calendar/calendar-event#getSmsReminders()) | Gets the minute values for all SMS reminders for the event. | Integer[] | an array in which each value corresponds to the number of minutes before the event that a reminder triggers | not started |  |
| [getStartTime()](https://developers.google.com/apps-script/reference/calendar/calendar-event#getStartTime()) | Gets the date and time at which this calendar event begins. For non–all-day events, this is the instant in time at which the event was defined to start. For all-day events, which only store a start date (not a date and time), this is midnight at the beginning of the day on which the event starts in the calendar's time zone. This allows meaningful comparison of start times for all types of events; however, it is not necessarily preserve the original day-of-year unmodified. | Date | this calendar event's start time | not started |  |
| [getTag(String)](https://developers.google.com/apps-script/reference/calendar/calendar-event#getTag(String)) | Gets a tag value of the event. | String | the tag value | not started |  |
| [getTitle()](https://developers.google.com/apps-script/reference/calendar/calendar-event#getTitle()) | Gets the title of the event. | String | the title | not started |  |
| [getTransparency()](https://developers.google.com/apps-script/reference/calendar/calendar-event#getTransparency()) | Gets the transparency of the event. Use this method to determine whether an event is TRANSPARENT, meaning the calendar shows as Available during that time, or OPAQUE , meaning the calendar shows as Busy during that time. | [EventTransparency](#enum-eventtransparency) | The transparency value. | not started |  |
| [getVisibility()](https://developers.google.com/apps-script/reference/calendar/calendar-event#getVisibility()) | Gets the visibility of the event. | [Visibility](#enum-visibility) | the visibility value | not started |  |
| [guestsCanInviteOthers()](https://developers.google.com/apps-script/reference/calendar/calendar-event#guestsCanInviteOthers()) | Determines whether guests can invite other guests. | Boolean | true if guests can invite others; false if not | not started |  |
| [guestsCanModify()](https://developers.google.com/apps-script/reference/calendar/calendar-event#guestsCanModify()) | Determines whether guests can modify the event. | Boolean | true if guests can modify the event; false if not | not started |  |
| [guestsCanSeeGuests()](https://developers.google.com/apps-script/reference/calendar/calendar-event#guestsCanSeeGuests()) | Determines whether guests can see other guests. | Boolean | true if guests can see other guests; false if not | not started |  |
| [isAllDayEvent()](https://developers.google.com/apps-script/reference/calendar/calendar-event#isAllDayEvent()) | Determines whether this is an all-day event. | Boolean | true if the event is all-day; false if not | not started |  |
| [isOwnedByMe()](https://developers.google.com/apps-script/reference/calendar/calendar-event#isOwnedByMe()) | Determines whether you're the owner of the event. | Boolean | true if the event is owned by the effective user; false if not | not started |  |
| [isRecurringEvent()](https://developers.google.com/apps-script/reference/calendar/calendar-event#isRecurringEvent()) | Determines whether the event is part of an event series. | Boolean | true if the event is part of an event series; false if not | not started |  |
| [removeAllReminders()](https://developers.google.com/apps-script/reference/calendar/calendar-event#removeAllReminders()) | Removes all reminders from the event. | [CalendarEvent](#class-calendarevent) | this CalendarEvent for chaining | not started |  |
| [removeGuest(String)](https://developers.google.com/apps-script/reference/calendar/calendar-event#removeGuest(String)) | Removes a guest from the event. | [CalendarEvent](#class-calendarevent) | this CalendarEvent for chaining | not started |  |
| [resetRemindersToDefault()](https://developers.google.com/apps-script/reference/calendar/calendar-event#resetRemindersToDefault()) | Resets the reminders using the calendar's default settings. | [CalendarEvent](#class-calendarevent) | this CalendarEvent for chaining | not started |  |
| [setAllDayDate(Date)](https://developers.google.com/apps-script/reference/calendar/calendar-event#setAllDayDate(Date)) | Sets the date of the event. Applying this method changes a regular event into an all-day event. | [CalendarEvent](#class-calendarevent) | this CalendarEvent for chaining | not started |  |
| [setAllDayDates(Date,Date)](https://developers.google.com/apps-script/reference/calendar/calendar-event#setAllDayDates(Date,Date)) |  |  |  | not started |  |
| [setAnyoneCanAddSelf(Boolean)](https://developers.google.com/apps-script/reference/calendar/calendar-event#setAnyoneCanAddSelf(Boolean)) | Sets whether non-guests can add themselves to the event. | [CalendarEvent](#class-calendarevent) | this CalendarEvent for chaining | not started |  |
| [setColor(String)](https://developers.google.com/apps-script/reference/calendar/calendar-event#setColor(String)) | Sets the color of the calendar event. | [CalendarEvent](#class-calendarevent) | This calendar event, for chaining. | not started |  |
| [setDescription(String)](https://developers.google.com/apps-script/reference/calendar/calendar-event#setDescription(String)) | Sets the description of the event. | [CalendarEvent](#class-calendarevent) | this CalendarEvent for chaining | not started |  |
| [setGuestsCanInviteOthers(Boolean)](https://developers.google.com/apps-script/reference/calendar/calendar-event#setGuestsCanInviteOthers(Boolean)) | Sets whether guests can invite other guests. | [CalendarEvent](#class-calendarevent) | this CalendarEvent for chaining | not started |  |
| [setGuestsCanModify(Boolean)](https://developers.google.com/apps-script/reference/calendar/calendar-event#setGuestsCanModify(Boolean)) | Sets whether guests can modify the event. | [CalendarEvent](#class-calendarevent) | this CalendarEvent for chaining | not started |  |
| [setGuestsCanSeeGuests(Boolean)](https://developers.google.com/apps-script/reference/calendar/calendar-event#setGuestsCanSeeGuests(Boolean)) | Sets whether guests can see other guests. | [CalendarEvent](#class-calendarevent) | this CalendarEvent for chaining | not started |  |
| [setLocation(String)](https://developers.google.com/apps-script/reference/calendar/calendar-event#setLocation(String)) | Sets the location of the event. | [CalendarEvent](#class-calendarevent) | this CalendarEvent for chaining | not started |  |
| [setMyStatus(GuestStatus)](https://developers.google.com/apps-script/reference/calendar/calendar-event#setMyStatus(GuestStatus)) | Sets the event status (such as attending or invited) of the effective user. | [CalendarEvent](#class-calendarevent) | this CalendarEvent for chaining | not started |  |
| [setTag(String,String)](https://developers.google.com/apps-script/reference/calendar/calendar-event#setTag(String,String)) |  |  |  | not started |  |
| [setTime(Date,Date)](https://developers.google.com/apps-script/reference/calendar/calendar-event#setTime(Date,Date)) |  |  |  | not started |  |
| [setTitle(String)](https://developers.google.com/apps-script/reference/calendar/calendar-event#setTitle(String)) | Sets the title of the event. | [CalendarEvent](#class-calendarevent) | this CalendarEvent for chaining | not started |  |
| [setTransparency(EventTransparency)](https://developers.google.com/apps-script/reference/calendar/calendar-event#setTransparency(EventTransparency)) | Sets the transparency of the event. Use this method to set whether an event is TRANSPARENT, meaning the calendar shows as Available during that time, or OPAQUE , meaning the calendar shows as Busy during that time. | [CalendarEvent](#class-calendarevent) | This CalendarEvent for chaining. | not started |  |
| [setVisibility(Visibility)](https://developers.google.com/apps-script/reference/calendar/calendar-event#setVisibility(Visibility)) | Sets the visibility of the event. | [CalendarEvent](#class-calendarevent) | this CalendarEvent for chaining | not started |  |

## Class: [CalendarEventSeries](https://developers.google.com/apps-script/reference/calendar/calendar-event-series)

Represents a series of events (a recurring event).

| Method | Description | Return Type | Return Description | Status | Implementation |
|--- |--- |--- |--- |--- |--- |
| [addEmailReminder(Integer)](https://developers.google.com/apps-script/reference/calendar/calendar-event-series#addEmailReminder(Integer)) | Adds a new email reminder to the event. The reminder must be at least 5 minutes, and at most 4 weeks (40320 minutes), before the event. | [CalendarEventSeries](#class-calendareventseries) | this CalendarEventSeries for chaining | not started |  |
| [addGuest(String)](https://developers.google.com/apps-script/reference/calendar/calendar-event-series#addGuest(String)) | Adds a guest to the event. | [CalendarEventSeries](#class-calendareventseries) | This CalendarEventSeries for chaining. | not started |  |
| [addPopupReminder(Integer)](https://developers.google.com/apps-script/reference/calendar/calendar-event-series#addPopupReminder(Integer)) | Adds a new pop-up notification to the event. The notification must be at least 5 minutes, and at most 4 weeks (40320 minutes), before the event. | [CalendarEventSeries](#class-calendareventseries) | this CalendarEventSeries for chaining | not started |  |
| [addSmsReminder(Integer)](https://developers.google.com/apps-script/reference/calendar/calendar-event-series#addSmsReminder(Integer)) | Adds a new SMS reminder to the event. The reminder must be at least 5 minutes, and at most 4 weeks (40320 minutes), before the event. | [CalendarEventSeries](#class-calendareventseries) | this CalendarEventSeries for chaining | not started |  |
| [anyoneCanAddSelf()](https://developers.google.com/apps-script/reference/calendar/calendar-event-series#anyoneCanAddSelf()) | Determines whether people can add themselves as guests to a Calendar event. | Boolean | true if non-guests can add themselves to the event; false if not | not started |  |
| [deleteEventSeries()](https://developers.google.com/apps-script/reference/calendar/calendar-event-series#deleteEventSeries()) | Deletes the event series. |  |  | not started |  |
| [deleteTag(String)](https://developers.google.com/apps-script/reference/calendar/calendar-event-series#deleteTag(String)) | Deletes a key/value tag from the event. | [CalendarEventSeries](#class-calendareventseries) | this CalendarEventSeries for chaining | not started |  |
| [getAllTagKeys()](https://developers.google.com/apps-script/reference/calendar/calendar-event-series#getAllTagKeys()) | Gets all keys for tags that have been set on the event. | String[] | an array of string keys | not started |  |
| [getColor()](https://developers.google.com/apps-script/reference/calendar/calendar-event-series#getColor()) | Returns the color of the calendar event. | String | The string representation of the event color, as an index (1-11) of values from CalendarApp.EventColor. | not started |  |
| [getCreators()](https://developers.google.com/apps-script/reference/calendar/calendar-event-series#getCreators()) | Gets the creators of an event. | String[] | the email addresses of the event's creators | not started |  |
| [getDateCreated()](https://developers.google.com/apps-script/reference/calendar/calendar-event-series#getDateCreated()) | Gets the date the event was created. You must have access to the calendar. | Date | the date of creation | not started |  |
| [getDescription()](https://developers.google.com/apps-script/reference/calendar/calendar-event-series#getDescription()) | Gets the description of the event. You must have edit access to the calendar. | String | the description | not started |  |
| [getEmailReminders()](https://developers.google.com/apps-script/reference/calendar/calendar-event-series#getEmailReminders()) | Gets the minute values for all email reminders for the event. You must have edit access to the calendar. | Integer[] | an array in which each value corresponds to the number of minutes before the event that a reminder triggers | not started |  |
| [getEventType()](https://developers.google.com/apps-script/reference/calendar/calendar-event-series#getEventType()) | Gets the EventType of this event. | [EventType](#enum-eventtype) | The event type. | not started |  |
| [getGuestByEmail(String)](https://developers.google.com/apps-script/reference/calendar/calendar-event-series#getGuestByEmail(String)) | Gets a guest by email address. | [EventGuest](#class-eventguest) | the guest, or null if the email address does not correspond to a guest | not started |  |
| [getGuestList()](https://developers.google.com/apps-script/reference/calendar/calendar-event-series#getGuestList()) | Gets the guests for the event, not including the event owner. | [EventGuest[]](#class-eventguest) | an array of the guests | not started |  |
| [getGuestList(Boolean)](https://developers.google.com/apps-script/reference/calendar/calendar-event-series#getGuestList(Boolean)) | Gets the guests for the event, potentially including the event owners. | [EventGuest[]](#class-eventguest) | an array of the guests | not started |  |
| [getId()](https://developers.google.com/apps-script/reference/calendar/calendar-event-series#getId()) | Gets the unique iCalUID of the event. Note that the iCalUID and the event id used by the Calendar v3 API and Calendar advanced service are not identical and cannot be used interchangeably. One difference in their semantics is that in recurring events all occurrences of one event have different ids while they all share the same iCalUIDs. | String | the iCalUID of the event | not started |  |
| [getLastUpdated()](https://developers.google.com/apps-script/reference/calendar/calendar-event-series#getLastUpdated()) | Gets the date the event was last updated. | Date | the last updated date | not started |  |
| [getLocation()](https://developers.google.com/apps-script/reference/calendar/calendar-event-series#getLocation()) | Gets the location of the event. | String | the event location | not started |  |
| [getMyStatus()](https://developers.google.com/apps-script/reference/calendar/calendar-event-series#getMyStatus()) | Gets the event status (such as attending or invited) of the effective user. Always returns GuestStatus.OWNER if the effective user is the owner of the event. | [GuestStatus](#enum-gueststatus) | the status | not started |  |
| [getOriginalCalendarId()](https://developers.google.com/apps-script/reference/calendar/calendar-event-series#getOriginalCalendarId()) | Get the ID of the calendar where this event was originally created. | String | the ID of the original calendar | not started |  |
| [getPopupReminders()](https://developers.google.com/apps-script/reference/calendar/calendar-event-series#getPopupReminders()) | Gets the minute values for all pop-up reminders for the event. | Integer[] | an array in which each value corresponds to the number of minutes before the event that a reminder triggers | not started |  |
| [getSmsReminders()](https://developers.google.com/apps-script/reference/calendar/calendar-event-series#getSmsReminders()) | Gets the minute values for all SMS reminders for the event. | Integer[] | an array in which each value corresponds to the number of minutes before the event that a reminder triggers | not started |  |
| [getTag(String)](https://developers.google.com/apps-script/reference/calendar/calendar-event-series#getTag(String)) | Gets a tag value of the event. | String | the tag value | not started |  |
| [getTitle()](https://developers.google.com/apps-script/reference/calendar/calendar-event-series#getTitle()) | Gets the title of the event. | String | the title | not started |  |
| [getTransparency()](https://developers.google.com/apps-script/reference/calendar/calendar-event-series#getTransparency()) | Gets the transparency of the event. Use this method to determine whether an event is TRANSPARENT, meaning the calendar shows as Available during that time, or OPAQUE , meaning the calendar shows as Busy during that time. | [EventTransparency](#enum-eventtransparency) | The transparency value. | not started |  |
| [getVisibility()](https://developers.google.com/apps-script/reference/calendar/calendar-event-series#getVisibility()) | Gets the visibility of the event. | [Visibility](#enum-visibility) | the visibility value | not started |  |
| [guestsCanInviteOthers()](https://developers.google.com/apps-script/reference/calendar/calendar-event-series#guestsCanInviteOthers()) | Determines whether guests can invite other guests. | Boolean | true if guests can invite others; false if not | not started |  |
| [guestsCanModify()](https://developers.google.com/apps-script/reference/calendar/calendar-event-series#guestsCanModify()) | Determines whether guests can modify the event. | Boolean | true if guests can modify the event; false if not | not started |  |
| [guestsCanSeeGuests()](https://developers.google.com/apps-script/reference/calendar/calendar-event-series#guestsCanSeeGuests()) | Determines whether guests can see other guests. | Boolean | true if guests can see other guests; false if not | not started |  |
| [isOwnedByMe()](https://developers.google.com/apps-script/reference/calendar/calendar-event-series#isOwnedByMe()) | Determines whether you're the owner of the event. | Boolean | true if the event is owned by the effective user; false if not | not started |  |
| [removeAllReminders()](https://developers.google.com/apps-script/reference/calendar/calendar-event-series#removeAllReminders()) | Removes all reminders from the event. | [CalendarEventSeries](#class-calendareventseries) | this CalendarEventSeries for chaining | not started |  |
| [removeGuest(String)](https://developers.google.com/apps-script/reference/calendar/calendar-event-series#removeGuest(String)) | Removes a guest from the event. | [CalendarEventSeries](#class-calendareventseries) | this CalendarEventSeries for chaining | not started |  |
| [resetRemindersToDefault()](https://developers.google.com/apps-script/reference/calendar/calendar-event-series#resetRemindersToDefault()) | Resets the reminders using the calendar's default settings. | [CalendarEventSeries](#class-calendareventseries) | this CalendarEventSeries for chaining | not started |  |
| [setAnyoneCanAddSelf(Boolean)](https://developers.google.com/apps-script/reference/calendar/calendar-event-series#setAnyoneCanAddSelf(Boolean)) | Sets whether non-guests can add themselves to the event. | [CalendarEventSeries](#class-calendareventseries) | this CalendarEventSeries for chaining | not started |  |
| [setColor(String)](https://developers.google.com/apps-script/reference/calendar/calendar-event-series#setColor(String)) | Sets the color of the calendar event. | [CalendarEventSeries](#class-calendareventseries) | This calendar event, for chaining. | not started |  |
| [setDescription(String)](https://developers.google.com/apps-script/reference/calendar/calendar-event-series#setDescription(String)) | Sets the description of the event. | [CalendarEventSeries](#class-calendareventseries) | this CalendarEventSeries for chaining | not started |  |
| [setGuestsCanInviteOthers(Boolean)](https://developers.google.com/apps-script/reference/calendar/calendar-event-series#setGuestsCanInviteOthers(Boolean)) | Sets whether guests can invite other guests. | [CalendarEventSeries](#class-calendareventseries) | this CalendarEventSeries for chaining | not started |  |
| [setGuestsCanModify(Boolean)](https://developers.google.com/apps-script/reference/calendar/calendar-event-series#setGuestsCanModify(Boolean)) | Sets whether guests can modify the event. | [CalendarEventSeries](#class-calendareventseries) | this CalendarEventSeries for chaining | not started |  |
| [setGuestsCanSeeGuests(Boolean)](https://developers.google.com/apps-script/reference/calendar/calendar-event-series#setGuestsCanSeeGuests(Boolean)) | Sets whether guests can see other guests. | [CalendarEventSeries](#class-calendareventseries) | this CalendarEventSeries for chaining | not started |  |
| [setLocation(String)](https://developers.google.com/apps-script/reference/calendar/calendar-event-series#setLocation(String)) | Sets the location of the event. | [CalendarEventSeries](#class-calendareventseries) | this CalendarEventSeries for chaining | not started |  |
| [setMyStatus(GuestStatus)](https://developers.google.com/apps-script/reference/calendar/calendar-event-series#setMyStatus(GuestStatus)) | Sets the event status (such as attending or invited) of the effective user. | [CalendarEventSeries](#class-calendareventseries) | this CalendarEventSeries for chaining | not started |  |
| [setRecurrence(EventRecurrence,Date,Date)](https://developers.google.com/apps-script/reference/calendar/calendar-event-series#setRecurrence(EventRecurrence,Date,Date)) |  |  |  | not started |  |
| [setRecurrence(EventRecurrence,Date)](https://developers.google.com/apps-script/reference/calendar/calendar-event-series#setRecurrence(EventRecurrence,Date)) |  |  |  | not started |  |
| [setTag(String,String)](https://developers.google.com/apps-script/reference/calendar/calendar-event-series#setTag(String,String)) |  |  |  | not started |  |
| [setTitle(String)](https://developers.google.com/apps-script/reference/calendar/calendar-event-series#setTitle(String)) | Sets the title of the event. | [CalendarEventSeries](#class-calendareventseries) | this CalendarEventSeries for chaining | not started |  |
| [setTransparency(EventTransparency)](https://developers.google.com/apps-script/reference/calendar/calendar-event-series#setTransparency(EventTransparency)) | Sets the transparency of the event. Use this method to set whether an event is TRANSPARENT, meaning the calendar shows as Available during that time, or OPAQUE , meaning the calendar shows as Busy during that time. | [CalendarEventSeries](#class-calendareventseries) | This CalendarEventSeries for chaining. | not started |  |
| [setVisibility(Visibility)](https://developers.google.com/apps-script/reference/calendar/calendar-event-series#setVisibility(Visibility)) | Sets the visibility of the event. | [CalendarEventSeries](#class-calendareventseries) | this CalendarEventSeries for chaining | not started |  |

## Class: [EventGuest](https://developers.google.com/apps-script/reference/calendar/event-guest)

Represents a guest of an event.

| Method | Description | Return Type | Return Description | Status | Implementation |
|--- |--- |--- |--- |--- |--- |
| [getAdditionalGuests()](https://developers.google.com/apps-script/reference/calendar/event-guest#getAdditionalGuests()) | Gets the number of additional people that this guest has said are attending. | Integer | the number of additional people this guest has said are attending | not started |  |
| [getEmail()](https://developers.google.com/apps-script/reference/calendar/event-guest#getEmail()) | Gets the email address of the guest. | String | the guest's email address | not started |  |
| [getGuestStatus()](https://developers.google.com/apps-script/reference/calendar/event-guest#getGuestStatus()) | Gets the status of the guest for the event. | [GuestStatus](#enum-gueststatus) | the status of this guest | not started |  |
| [getName()](https://developers.google.com/apps-script/reference/calendar/event-guest#getName()) | Gets the name of the guest. If the name of the guest is not available, this method returns the guest's email address. | String | the guest's name, or the guest's email address if the name is not available | not started |  |

## Class: [EventRecurrence](https://developers.google.com/apps-script/reference/calendar/event-recurrence)

Represents the recurrence settings for an event series.

| Method | Description | Return Type | Return Description | Status | Implementation |
|--- |--- |--- |--- |--- |--- |
| [addDailyExclusion()](https://developers.google.com/apps-script/reference/calendar/event-recurrence#addDailyExclusion()) | Adds a rule that excludes occurrences on a daily basis. | [RecurrenceRule](#class-recurrencerule) | the new RecurrenceRule | not started |  |
| [addDailyRule()](https://developers.google.com/apps-script/reference/calendar/event-recurrence#addDailyRule()) | Adds a rule that causes the event to recur on a daily basis. | [RecurrenceRule](#class-recurrencerule) | the new RecurrenceRule | not started |  |
| [addDate(Date)](https://developers.google.com/apps-script/reference/calendar/event-recurrence#addDate(Date)) | Adds a rule that causes the event to recur on a specific date. | [EventRecurrence](#class-eventrecurrence) | this EventRecurrence for chaining | not started |  |
| [addDateExclusion(Date)](https://developers.google.com/apps-script/reference/calendar/event-recurrence#addDateExclusion(Date)) | Adds a rule that excludes an occurrence for a specific date. | [EventRecurrence](#class-eventrecurrence) | this EventRecurrence for chaining | not started |  |
| [addMonthlyExclusion()](https://developers.google.com/apps-script/reference/calendar/event-recurrence#addMonthlyExclusion()) | Adds a rule that excludes occurrences on a monthly basis. | [RecurrenceRule](#class-recurrencerule) | the new RecurrenceRule | not started |  |
| [addMonthlyRule()](https://developers.google.com/apps-script/reference/calendar/event-recurrence#addMonthlyRule()) | Adds a rule that causes the event to recur on a monthly basis. | [RecurrenceRule](#class-recurrencerule) | the new RecurrenceRule | not started |  |
| [addWeeklyExclusion()](https://developers.google.com/apps-script/reference/calendar/event-recurrence#addWeeklyExclusion()) | Adds a rule that excludes occurrences on a weekly basis. | [RecurrenceRule](#class-recurrencerule) | the new RecurrenceRule | not started |  |
| [addWeeklyRule()](https://developers.google.com/apps-script/reference/calendar/event-recurrence#addWeeklyRule()) | Adds a rule that causes the event to recur on a weekly basis. | [RecurrenceRule](#class-recurrencerule) | the new RecurrenceRule | not started |  |
| [addYearlyExclusion()](https://developers.google.com/apps-script/reference/calendar/event-recurrence#addYearlyExclusion()) | Adds a rule that excludes occurrences on a yearly basis. | [RecurrenceRule](#class-recurrencerule) | the new RecurrenceRule | not started |  |
| [addYearlyRule()](https://developers.google.com/apps-script/reference/calendar/event-recurrence#addYearlyRule()) | Adds a rule that causes the event to recur on a yearly basis. | [RecurrenceRule](#class-recurrencerule) | the new RecurrenceRule | not started |  |
| [setTimeZone(String)](https://developers.google.com/apps-script/reference/calendar/event-recurrence#setTimeZone(String)) | Sets the time zone for this recurrence. This affects the date and time that events recur on, and whether the event shifts with daylight savings time. Defaults to the calendar's time zone. | [EventRecurrence](#class-eventrecurrence) | this EventRecurrence for chaining | not started |  |

## Class: [RecurrenceRule](https://developers.google.com/apps-script/reference/calendar/recurrence-rule)

Represents a recurrence rule for an event series.

| Method | Description | Return Type | Return Description | Status | Implementation |
|--- |--- |--- |--- |--- |--- |
| [addDailyExclusion()](https://developers.google.com/apps-script/reference/calendar/recurrence-rule#addDailyExclusion()) | Adds a rule that excludes occurrences on a daily basis. | [RecurrenceRule](#class-recurrencerule) | the new RecurrenceRule | not started |  |
| [addDailyRule()](https://developers.google.com/apps-script/reference/calendar/recurrence-rule#addDailyRule()) | Adds a rule that causes the event to recur on a daily basis. | [RecurrenceRule](#class-recurrencerule) | the new RecurrenceRule | not started |  |
| [addDate(Date)](https://developers.google.com/apps-script/reference/calendar/recurrence-rule#addDate(Date)) | Adds a rule that causes the event to recur on a specific date. | [EventRecurrence](#class-eventrecurrence) | this EventRecurrence for chaining | not started |  |
| [addDateExclusion(Date)](https://developers.google.com/apps-script/reference/calendar/recurrence-rule#addDateExclusion(Date)) | Adds a rule that excludes an occurrence for a specific date. | [EventRecurrence](#class-eventrecurrence) | this EventRecurrence for chaining | not started |  |
| [addMonthlyExclusion()](https://developers.google.com/apps-script/reference/calendar/recurrence-rule#addMonthlyExclusion()) | Adds a rule that excludes occurrences on a monthly basis. | [RecurrenceRule](#class-recurrencerule) | the new RecurrenceRule | not started |  |
| [addMonthlyRule()](https://developers.google.com/apps-script/reference/calendar/recurrence-rule#addMonthlyRule()) | Adds a rule that causes the event to recur on a monthly basis. | [RecurrenceRule](#class-recurrencerule) | the new RecurrenceRule | not started |  |
| [addWeeklyExclusion()](https://developers.google.com/apps-script/reference/calendar/recurrence-rule#addWeeklyExclusion()) | Adds a rule that excludes occurrences on a weekly basis. | [RecurrenceRule](#class-recurrencerule) | the new RecurrenceRule | not started |  |
| [addWeeklyRule()](https://developers.google.com/apps-script/reference/calendar/recurrence-rule#addWeeklyRule()) | Adds a rule that causes the event to recur on a weekly basis. | [RecurrenceRule](#class-recurrencerule) | the new RecurrenceRule | not started |  |
| [addYearlyExclusion()](https://developers.google.com/apps-script/reference/calendar/recurrence-rule#addYearlyExclusion()) | Adds a rule that excludes occurrences on a yearly basis. | [RecurrenceRule](#class-recurrencerule) | the new RecurrenceRule | not started |  |
| [addYearlyRule()](https://developers.google.com/apps-script/reference/calendar/recurrence-rule#addYearlyRule()) | Adds a rule that causes the event to recur on a yearly basis. | [RecurrenceRule](#class-recurrencerule) | the new RecurrenceRule | not started |  |
| [interval(Integer)](https://developers.google.com/apps-script/reference/calendar/recurrence-rule#interval(Integer)) | Configures the rule to only apply at this interval of the rule's time unit. | [RecurrenceRule](#class-recurrencerule) | this RecurrenceRule for chaining | not started |  |
| [onlyInMonth(Month)](https://developers.google.com/apps-script/reference/calendar/recurrence-rule#onlyInMonth(Month)) | Configures the rule to only apply to a specific month. | [RecurrenceRule](#class-recurrencerule) | this RecurrenceRule for chaining | not started |  |
| [onlyInMonths(Month)](https://developers.google.com/apps-script/reference/calendar/recurrence-rule#onlyInMonths(Month)) | Configures the rule to only apply to specific months. | [RecurrenceRule](#class-recurrencerule) | this RecurrenceRule for chaining | not started |  |
| [onlyOnMonthDay(Integer)](https://developers.google.com/apps-script/reference/calendar/recurrence-rule#onlyOnMonthDay(Integer)) | Configures the rule to only apply to a specific day of the month. | [RecurrenceRule](#class-recurrencerule) | this RecurrenceRule for chaining | not started |  |
| [onlyOnMonthDays(Integer)](https://developers.google.com/apps-script/reference/calendar/recurrence-rule#onlyOnMonthDays(Integer)) | Configures the rule to only apply to specific days of the month. | [RecurrenceRule](#class-recurrencerule) | this RecurrenceRule for chaining | not started |  |
| [onlyOnWeek(Integer)](https://developers.google.com/apps-script/reference/calendar/recurrence-rule#onlyOnWeek(Integer)) | Configures the rule to only apply to a specific week of the year. | [RecurrenceRule](#class-recurrencerule) | this RecurrenceRule for chaining | not started |  |
| [onlyOnWeekday(Weekday)](https://developers.google.com/apps-script/reference/calendar/recurrence-rule#onlyOnWeekday(Weekday)) | Configures the rule to only apply to a specific day of the week. | [RecurrenceRule](#class-recurrencerule) | this RecurrenceRule for chaining | not started |  |
| [onlyOnWeekdays(Weekday)](https://developers.google.com/apps-script/reference/calendar/recurrence-rule#onlyOnWeekdays(Weekday)) | Configures the rule to only apply to specific days of the week. | [RecurrenceRule](#class-recurrencerule) | this RecurrenceRule for chaining | not started |  |
| [onlyOnWeeks(Integer)](https://developers.google.com/apps-script/reference/calendar/recurrence-rule#onlyOnWeeks(Integer)) | Configures the rule to only apply to specific weeks of the year. | [RecurrenceRule](#class-recurrencerule) | this RecurrenceRule for chaining | not started |  |
| [onlyOnYearDay(Integer)](https://developers.google.com/apps-script/reference/calendar/recurrence-rule#onlyOnYearDay(Integer)) | Configures the rule to only apply to a specific day of the year. | [RecurrenceRule](#class-recurrencerule) | this RecurrenceRule for chaining | not started |  |
| [onlyOnYearDays(Integer)](https://developers.google.com/apps-script/reference/calendar/recurrence-rule#onlyOnYearDays(Integer)) | Configures the rule to only apply to specific days of the year. | [RecurrenceRule](#class-recurrencerule) | this RecurrenceRule for chaining | not started |  |
| [setTimeZone(String)](https://developers.google.com/apps-script/reference/calendar/recurrence-rule#setTimeZone(String)) | Sets the time zone for this recurrence. This affects the date and time that events recur on, and whether the event shifts with daylight savings time. Defaults to the calendar's time zone. | [EventRecurrence](#class-eventrecurrence) | this EventRecurrence for chaining | not started |  |
| [times(Integer)](https://developers.google.com/apps-script/reference/calendar/recurrence-rule#times(Integer)) | Configures the rule to end after a given number of occurrences. | [RecurrenceRule](#class-recurrencerule) | this RecurrenceRule for chaining | not started |  |
| [until(Date)](https://developers.google.com/apps-script/reference/calendar/recurrence-rule#until(Date)) | Configures the rule to end on a given date (inclusive). | [RecurrenceRule](#class-recurrencerule) | this RecurrenceRule for chaining | not started |  |
| [weekStartsOn(Weekday)](https://developers.google.com/apps-script/reference/calendar/recurrence-rule#weekStartsOn(Weekday)) | Configures which day a week starts on, for the purposes of applying the rule. | [RecurrenceRule](#class-recurrencerule) | this RecurrenceRule for chaining | not started |  |

## Enum: [Color](https://developers.google.com/apps-script/reference/calendar/color)

An enum representing the named colors available in the Calendar service.

| Property | Description | Status | Implementation |
|--- |--- |--- |--- |
| BLUE | Blue (#2952A3). | not started |  |
| BROWN | Brown (#8D6F47). | not started |  |
| CHARCOAL | Charcoal (#4E5D6C). | not started |  |
| CHESTNUT | Chestnut (#865A5A). | not started |  |
| GRAY | Gray (#5A6986). | not started |  |
| GREEN | Green (#0D7813). | not started |  |
| INDIGO | Indigo (#5229A3). | not started |  |
| LIME | Lime (#528800). | not started |  |
| MUSTARD | Mustard (#88880E). | not started |  |
| OLIVE | Olive (#6E6E41). | not started |  |
| ORANGE | Orange (#BE6D00). | not started |  |
| PINK | Pink (#B1365F). | not started |  |
| PLUM | Plum (#705770). | not started |  |
| PURPLE | Purple (#7A367A). | not started |  |
| RED | Red (#A32929). | not started |  |
| RED_ORANGE | Red-Orange (#B1440E). | not started |  |
| SEA_BLUE | Sea Blue (#29527A). | not started |  |
| SLATE | Slate (#4A716C). | not started |  |
| TEAL | Teal (#28754E). | not started |  |
| TURQOISE | Turquoise (#1B887A). | not started |  |
| YELLOW | Yellow (#AB8B00). | not started |  |

## Enum: [EventColor](https://developers.google.com/apps-script/reference/calendar/event-color)

An enum representing the named event colors available in the Calendar service.

| Property | Description | Status | Implementation |
|--- |--- |--- |--- |
| BLUE | Blue ("9"), referred to as "Blueberry" in th Calendar UI. | not started |  |
| CYAN | Cyan ("7"), referred to as "Lavender" in th Calendar UI. | not started |  |
| GRAY | Gray ("8"), referred to as "Graphite" in th Calendar UI. | not started |  |
| GREEN | Green ("10"), referred to as "Basil" in th Calendar UI. | not started |  |
| MAUVE | Mauve ("3"),, referred to as "Grape" in th Calendar UI. | not started |  |
| ORANGE | Orange ("6"), referred to as "Tangerine" in th Calendar UI. | not started |  |
| PALE_BLUE | Pale Blue ("1"), referred to as "Peacock" in th Calendar UI. | not started |  |
| PALE_GREEN | Pale Green ("2"), referred to as "Sage" in th Calendar UI. | not started |  |
| PALE_RED | Pale Red ("4"), referred to as "Flamingo" in th Calendar UI. | not started |  |
| RED | Red ("11"), referred to as "Tomato" in th Calendar UI. | not started |  |
| YELLOW | Yellow ("5"), referred to as "Banana" in th Calendar UI. | not started |  |

## Enum: [EventTransparency](https://developers.google.com/apps-script/reference/calendar/event-transparency)

An enum representing the transparency of an event.

| Property | Description | Status | Implementation |
|--- |--- |--- |--- |
| OPAQUE | The event does block time on the calendar. This is equivalent to setting "Show me as" to "Busy" in the Calendar UI. | not started |  |
| TRANSPARENT | The event does not block time on the calendar. This is equivalent to setting "Show me as" to "Available" in the Calendar UI. | not started |  |

## Enum: [EventType](https://developers.google.com/apps-script/reference/calendar/event-type)

An enum representing the type of an event.

| Property | Description | Status | Implementation |
|--- |--- |--- |--- |
| BIRTHDAY | The event is a special all-day event with an annual recurrence. | not started |  |
| DEFAULT | The event is a regular event. | not started |  |
| FOCUS_TIME | The event is a focus-time event. | not started |  |
| FROM_GMAIL | The event is an event from Gmail. | not started |  |
| OUT_OF_OFFICE | The event is an out-of-office event. | not started |  |
| WORKING_LOCATION | The event is a working location event. | not started |  |

## Enum: [GuestStatus](https://developers.google.com/apps-script/reference/calendar/guest-status)

An enum representing the statuses a guest can have for an event.

| Property | Description | Status | Implementation |
|--- |--- |--- |--- |
| INVITED | The guest has been invited, but has not indicated whether they are attending. | not started |  |
| MAYBE | The guest has indicated they might attend. | not started |  |
| NO | The guest has indicated they are not attending. | not started |  |
| OWNER | The guest is the owner of the event. | not started |  |
| YES | The guest has indicated they are attending. | not started |  |

## Enum: [Visibility](https://developers.google.com/apps-script/reference/calendar/visibility)

An enum representing the visibility of an event.

| Property | Description | Status | Implementation |
|--- |--- |--- |--- |
| CONFIDENTIAL | The event is private. This value is provided for compatibility reasons. | not started |  |
| DEFAULT | Uses the default visibility for events on the calendar. | not started |  |
| PRIVATE | The event is private and only event attendees may view event details. | not started |  |
| PUBLIC | The event is public and event details are visible to all readers of the calendar. | not started |  |

