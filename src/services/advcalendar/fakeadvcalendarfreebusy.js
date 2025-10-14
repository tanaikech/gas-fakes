import { FakeAdvResource } from "../common/fakeadvresource.js";
import { Syncit } from "../../support/syncit.js";
import { Proxies } from "../../support/proxies.js";

export const newFakeAdvCalendarFreebusy = (...args) =>
  Proxies.guard(new FakeAdvCalendarFreebusy(...args));

/**
 * @see https://developers.google.com/calendar/api/v3/reference/freebusy
 */
class FakeAdvCalendarFreebusy extends FakeAdvResource {
  /**
   *
   * @param {object} mainService the main service
   */
  constructor(mainService) {
    super(mainService, "freebusy", Syncit.fxCalendar);
    this.calendar = mainService;
    this.__fakeObjectType = "Calendar.Freebusy";
  }
}