import { FakeAdvResource } from "../common/fakeadvresource.js";
import { Syncit } from "../../support/syncit.js";
import { Proxies } from "../../support/proxies.js";

export const newFakeAdvCalendarSettings = (...args) =>
  Proxies.guard(new FakeAdvCalendarSettings(...args));

/**
 * @see https://developers.google.com/calendar/api/v3/reference/settings
 */
class FakeAdvCalendarSettings extends FakeAdvResource {
  /**
   *
   * @param {object} mainService the main service
   */
  constructor(mainService) {
    super(mainService, "settings", Syncit.fxCalendar);
    this.calendar = mainService;
    this.__fakeObjectType = "Calendar.Settings";
  }
}