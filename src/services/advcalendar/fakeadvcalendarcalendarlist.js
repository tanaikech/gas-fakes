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
}