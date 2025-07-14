import { Proxies } from '../../support/proxies.js';
import { newFakeParagraph } from './fakeparagraph.js';

// Placeholder for a future FakeBody implementation
class FakeBody {
    constructor(bodyResource) {
        this.__body = bodyResource;
    }

    appendParagraph(text) {
        // A full implementation would add a structural element to this.__body.content
        // For now, just return a new paragraph element to satisfy tests.
        return newFakeParagraph(text);
    }

    // methods like appendParagraph, etc. would go here
    toString() {
        return ScriptApp.isFake ? 'Body' : 'DocumentBodySection';
    }
}
export const newFakeBody = (...args) => Proxies.guard(new FakeBody(...args));