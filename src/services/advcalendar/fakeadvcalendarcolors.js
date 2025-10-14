import { FakeAdvResource } from "../common/fakeadvresource.js";
import { Syncit } from "../../support/syncit.js";
import { Proxies } from "../../support/proxies.js";

export const newFakeAdvCalendarColors = (...args) =>
  Proxies.guard(new FakeAdvCalendarColors(...args));

/**
 * @see https://developers.google.com/calendar/api/v3/reference/colors
 */
class FakeAdvCalendarColors extends FakeAdvResource {
  /**
   *
   * @param {object} mainService the main service
   */
  constructor(mainService) {
    super(mainService, "colors", Syncit.fxCalendar);
    this.calendar = mainService;
    this.__fakeObjectType = "Calendar.Colors";
  }
}