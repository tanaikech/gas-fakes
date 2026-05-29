import { newFakeShape } from './fakeshape.js';
import { newFakeLine } from './fakeline.js';
import { newFakeTable } from './faketable.js';
import { newFakeGroup } from './fakegroup.js';
import { PageElementRegistry } from './fakepageelement.js';

/**
 * Converts a base PageElement to a more specific subclass (Shape, Line, etc.)
 * @param {FakePageElement} pageElement The base page element.
 * @returns {FakePageElement|FakeShape|FakeLine|FakeGroup} The specific subclass.
 */
export const asSpecificPageElement = (pageElement) => {
  const resource = pageElement.__resource;
  if (resource.shape) {
    return newFakeShape(resource, pageElement.__page);
  }
  if (resource.line) {
    return newFakeLine(resource, pageElement.__page);
  }
  if (resource.table) {
    return newFakeTable(resource, pageElement.__page);
  }
  if (resource.elementGroup || resource.group) {
    return newFakeGroup(resource, pageElement.__page);
  }
  // Add other types as they are implemented
  return pageElement;
};

PageElementRegistry.asSpecificPageElement = asSpecificPageElement;
