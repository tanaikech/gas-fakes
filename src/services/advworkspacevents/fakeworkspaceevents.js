/**
 * @file advworkspacevents/fakeworkspaceevents.js
 * @author Bruce Mcpherson
 *
 * @description This is a fake for the advanced workspace events service
 *
 */
import { Proxies } from "../../support/proxies.js";
import { advClassMaker } from "../../support/helpers.js";
import { workspaceeventsCacher } from "../../support/workspaceeventscacher.js";
import { newFakeAdvWorkspaceEventsSubscriptions } from "./fakeworkspaceeventssubscriptions.js";
import { propsList } from "./workspaceeventspropslist.js";

class FakeAdvWorkspaceEvents {
  constructor() {
    this.__fakeObjectType = "WorkspaceEvents";

    Reflect.ownKeys(propsList).forEach((p) => {
      this[p] = () => advClassMaker(propsList[p]);
    });
  }
  toString() {
    return "AdvancedServiceIdentifier{name=workspaceevents, version=v1}";
  }

  getVersion() {
    return "v1";
  }

  get Subscriptions() {
    return newFakeAdvWorkspaceEventsSubscriptions(this);
  }

  __getWorkspaceEventsPerformance() {
    return workspaceeventsCacher.getPerformance();
  }
}

export const newFakeAdvWorkspaceEvents = (...args) =>
  Proxies.guard(new FakeAdvWorkspaceEvents(...args));