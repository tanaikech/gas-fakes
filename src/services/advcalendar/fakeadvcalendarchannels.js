import { FakeAdvResource } from "../common/fakeadvresource.js";
import { Syncit } from "../../support/syncit.js";
import { Proxies } from "../../support/proxies.js";

export const newFakeAdvCalendarChannels = (...args) =>
  Proxies.guard(new FakeAdvCalendarChannels(...args));

/**
 * @see https://developers.google.com/calendar/api/v3/reference/channels
 */
class FakeAdvCalendarChannels extends FakeAdvResource {
  /**
   *
   * @param {object} mainService the main service
   */
  constructor(mainService) {
    super(mainService, "channels", Syncit.fxCalendar);
    this.calendar = mainService;
    this.__fakeObjectType = "Calendar.Channels";
  }
}