import { FakeAdvResource } from "../common/fakeadvresource.js";
import { Syncit } from "../../support/syncit.js";
import { Proxies } from "../../support/proxies.js";

export const newFakeAdvWorkspaceEventsSubscriptions = (...args) =>
  Proxies.guard(new FakeAdvWorkspaceEventsSubscriptions(...args));

/**
 * @see https://developers.google.com/workspace/events/api/reference/rest/v1/subscriptions
 */
class FakeAdvWorkspaceEventsSubscriptions extends FakeAdvResource {
  /**
   *
   * @param {object} mainService the main service
   */
  constructor(mainService) {
    super(mainService, "subscriptions", Syncit.fxWorkspaceEvents);
    this.workspaceevents = mainService;
    this.__fakeObjectType = "WorkspaceEvents.Subscriptions";
  }
}