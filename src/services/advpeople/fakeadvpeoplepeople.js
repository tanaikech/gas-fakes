import { FakeAdvResource } from "../common/fakeadvresource.js";
import { Syncit } from "../../support/syncit.js";
import { Proxies } from "../../support/proxies.js";

export const newFakeAdvPeoplePeople = (...args) =>
  Proxies.guard(new FakeAdvPeoplePeople(...args));

/**
 * @see https://developers.google.com/people/api/rest/v1/people
 */
class FakeAdvPeoplePeople extends FakeAdvResource {
  /**
   *
   * @param {object} mainService the main service
   */
  constructor(mainService) {
    super(mainService, "people", Syncit.fxPeople);
    this.people = mainService;
    this.__fakeObjectType = "People.People";
  }
}