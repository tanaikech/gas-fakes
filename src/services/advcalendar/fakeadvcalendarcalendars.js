import { FakeAdvResource } from "../common/fakeadvresource.js";
import { Syncit } from "../../support/syncit.js";
import { Proxies } from "../../support/proxies.js";

export const newFakeAdvCalendarCalendars = (...args) =>
  Proxies.guard(new FakeAdvCalendarCalendars(...args));

/**
 * @see https://developers.google.com/calendar/api/v3/reference/calendars
 */
class FakeAdvCalendarCalendars extends FakeAdvResource {
  /**
   *
   * @param {object} mainService the main service
   */
  constructor(mainService) {
    super(mainService, "calendars", Syncit.fxCalendar);
    this.calendar = mainService;
    this.__fakeObjectType = "Calendar.Calendars";
  }

  get(calendarId, options) {
    const { response, data } = this._call("get", { calendarId, ...options });
    return data;
  }

  insert(requestBody, options) {
    const { response, data } = this._call("insert", { requestBody, ...options });
    return data;
  }

  patch(requestBody, calendarId, options) {
    const { response, data } = this._call("patch", { calendarId, requestBody, ...options });
    return data;
  }

  update(requestBody, calendarId, options) {
    const { response, data } = this._call("update", { calendarId, requestBody, ...options });
    return data;
  }

  delete(calendarId, options) {
    const { response, data } = this._call("delete", { calendarId, ...options });
    return data;
  }
}