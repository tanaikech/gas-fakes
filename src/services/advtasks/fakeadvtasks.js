/**
 * @file advtasks/fakeadvtasks.js
 * @author Bruce Mcpherson
 *
 * @description This is a fake for the advanced tasks service
 *
 */
import { Proxies } from "../../support/proxies.js";
import { advClassMaker } from "../../support/helpers.js";
import { tasksCacher } from "../../support/taskscacher.js";
import { newFakeAdvTasksTasklists } from "./fakeadvtaskstasklists.js";
import { propsList } from "./taskspropslist.js";

class FakeAdvTasks {
  constructor() {
    this.__fakeObjectType = "Tasks";

    Reflect.ownKeys(propsList).forEach((p) => {
      this[p] = () => advClassMaker(propsList[p]);
    });
  }
  toString() {
    return "AdvancedServiceIdentifier{name=tasks, version=v1}";
  }

  getVersion() {
    return "v1";
  }

  get Tasklists() {
    return newFakeAdvTasksTasklists(this);
  }

  __getTasksPerformance() {
    return tasksCacher.getPerformance();
  }
}

export const newFakeAdvTasks = (...args) =>
  Proxies.guard(new FakeAdvTasks(...args));