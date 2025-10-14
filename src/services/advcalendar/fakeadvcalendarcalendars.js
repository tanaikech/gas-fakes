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
}