import { FakeAdvResource } from "../common/fakeadvresource.js";
import { Syncit } from "../../support/syncit.js";
import { Proxies } from "../../support/proxies.js";

export const newFakeAdvTasksTasklists = (...args) =>
  Proxies.guard(new FakeAdvTasksTasklists(...args));

/**
 * @see https://developers.google.com/tasks/reference/rest/v1/tasklists
 */
class FakeAdvTasksTasklists extends FakeAdvResource {
  /**
   *
   * @param {object} mainService the main service
   */
  constructor(mainService) {
    super(mainService, "tasklists", Syncit.fxTasks);
    this.tasks = mainService;
    this.__fakeObjectType = "Tasks.Tasklists";
  }
}