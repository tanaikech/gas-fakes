import { Proxies } from '../../support/proxies.js';

// Placeholder for a future FakeBody implementation
class FakeBody {
    constructor(bodyResource) {
        this.__body = bodyResource;
    }
    // methods like appendParagraph, etc. would go here
    toString() {
        return 'Body';
    }
}
export const newFakeBody = (...args) => Proxies.guard(new FakeBody(...args));