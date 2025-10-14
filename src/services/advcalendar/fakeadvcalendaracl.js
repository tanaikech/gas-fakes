import { FakeAdvResource } from "../common/fakeadvresource.js";
import { Syncit } from "../../support/syncit.js";
import { Proxies } from "../../support/proxies.js";

export const newFakeAdvCalendarAcl = (...args) =>
  Proxies.guard(new FakeAdvCalendarAcl(...args));

/**
 * @see https://developers.google.com/calendar/api/v3/reference/acl
 */
class FakeAdvCalendarAcl extends FakeAdvResource {
  /**
   *
   * @param {object} mainService the main service
   */
  constructor(mainService) {
    super(mainService, "acl", Syncit.fxCalendar);
    this.calendar = mainService;
    this.__fakeObjectType = "Calendar.Acl";
  }
}