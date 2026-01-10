import { FakeAdvResource } from "../common/fakeadvresource.js";
import { Syncit } from "../../support/syncit.js";
import { Proxies } from "../../support/proxies.js";

export const newFakeAdvCalendarEvents = (...args) =>
  Proxies.guard(new FakeAdvCalendarEvents(...args));

/**
 * @see https://developers.google.com/calendar/api/v3/reference/events
 */
class FakeAdvCalendarEvents extends FakeAdvResource {
  /**
   *
   * @param {object} mainService the main service
   */
  constructor(mainService) {
    super(mainService, "events", Syncit.fxCalendar);
    this.calendar = mainService;
    this.__fakeObjectType = "Calendar.Events";
  }

  list(calendarId, options) {
    const { response, data } = this._call("list", { calendarId, ...options });
    return data;
  }

  get(calendarId, eventId, options) {
    const { response, data } = this._call("get", { calendarId, eventId, ...options });
    return data;
  }

  insert(requestBody, calendarId, options) {
    const { response, data } = this._call("insert", { calendarId, requestBody, ...options });
    return data;
  }

  update(requestBody, calendarId, eventId, options) {
    const { response, data } = this._call("update", { calendarId, eventId, requestBody, ...options });
    return data;
  }

  patch(requestBody, calendarId, eventId, options) {
    const { response, data } = this._call("patch", { calendarId, eventId, requestBody, ...options });
    return data;
  }

  delete(calendarId, eventId, options) {
    const { response, data } = this._call("delete", { calendarId, eventId, ...options });
    return data;
  }

  quickAdd(calendarId, text, options) {
    const { response, data } = this._call("quickAdd", { calendarId, text, ...options });
    return data;
  }

  move(calendarId, eventId, destinationCalendarId, options) {
    const { response, data } = this._call("move", { calendarId, eventId, destinationCalendarId, ...options });
    return data;
  }
  
  import(requestBody, calendarId, options) {
    const { response, data } = this._call("import", { calendarId, requestBody, ...options });
    return data;
  }
  
  instances(calendarId, eventId, options) {
      const { response, data } = this._call("instances", { calendarId, eventId, ...options });
      return data;
  }
}
