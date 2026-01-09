import { FakeAdvResource } from "../common/fakeadvresource.js";
import { Syncit } from "../../support/syncit.js";
import { Proxies } from "../../support/proxies.js";

export const newFakeAdvCalendarCalendarList = (...args) =>
  Proxies.guard(new FakeAdvCalendarCalendarList(...args));

/**
 * @see https://developers.google.com/calendar/api/v3/reference/calendarList
 */
class FakeAdvCalendarCalendarList extends FakeAdvResource {
  /**
   *
   * @param {object} mainService the main service
   */
  constructor(mainService) {
    super(mainService, "calendarList", Syncit.fxCalendar);
    this.calendar = mainService;
    this.__fakeObjectType = "Calendar.CalendarList";
  }

  list(options = {}) {
    const { response, data } = this._call("list", options);
    return data;
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

  remove(calendarId, options) {
    const { response, data } = this._call("remove", { calendarId, ...options });
    return data;
  }
}