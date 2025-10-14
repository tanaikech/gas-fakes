/**
 * @file advpeople/fakeadvpeople.js
 * @author Bruce Mcpherson
 *
 * @description This is a fake for the advanced people service
 *
 */
import { Proxies } from "../../support/proxies.js";
import { advClassMaker } from "../../support/helpers.js";
import { peopleCacher } from "../../support/peoplecacher.js";
import { newFakeAdvPeoplePeople } from "./fakeadvpeoplepeople.js";
import { propsList } from "./peoplepropslist.js";

class FakeAdvPeople {
    constructor() {
        this.__fakeObjectType = "People";

        Reflect.ownKeys(propsList).forEach((p) => {
            this[p] = () => advClassMaker(propsList[p]);
        });
    }
    toString() {
        return "AdvancedServiceIdentifier{name=people, version=v1}";
    }

    getVersion() {
        return "v1";
    }

    get People() {
        return newFakeAdvPeoplePeople(this);
    }
    __getPeoplePerformance() {
        return peopleCacher.getPerformance()
    }
}

export const newFakeAdvPeople = (...args) =>
    Proxies.guard(new FakeAdvPeople(...args));