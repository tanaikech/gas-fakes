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
}