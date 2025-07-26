import { Proxies } from '../../support/proxies.js';
import { getElementProp, makeNrPrefix, getCurrentNr, findOrCreateNamedRangeName } from './shadowhelpers.js';
import { Utils } from '../../support/utils.js';


const { is } = Utils;


export const newShadowDocument = (...args) => {
  return Proxies.guard(new ShadowDocument(...args));
};

class ShadowDocument {
  constructor(id) {
    this.__id = id
  }

  /**
   * we may need to do this if we're coming from cache
   * although the resource may be in cache, the element map might not be defined
   * why ? because if you create a new Document instance based on the same file as previous document, the document might be in cache,
   * but not its structure - so why not put the structure in cache - 
   * the document cache is managed by calls to the api wherever they come from, including the advanced service which knows nothig about
   * thisdocumentApp emulation.
   * broadening the scope will mean complicating that currently clean and abstracted process.
   */
  makeElementMap(data) {

    // get the currently known named ranges
    const currentNr = getCurrentNr(data)
    const content = data?.body?.content || []

    // this will contain all the requests to add new named ranges
    const addRequests = []

    // we'll need to recursively iterate through the document to create a bookmark for every single one
    this.__elementMap = new Map()
    const name = makeNrPrefix("BODY_SECTION")
    const bodyTree = { name, children: [], parent: null }

    const bodyElement = {
      __prop: "BODY_SECTION",
      __type: "BODY_SECTION",
      __name: name,
      __twig: bodyTree
    }
    this.__elementMap.set(name, bodyElement);


    // maps all the elements to their named range
    const mapElements = (element, branch) => {
      // this gets the type and property name to look for for the given element content
      const elementProp = getElementProp(element);

      if (!elementProp) {
        // This will now catch things like sectionBreak
        return;
      }
      // the type is the enum text for te type, the prop is where to find it in the element
      const { type, prop } = elementProp;

      // All child elements, are expected to have a range.
      const { endIndex, startIndex } = element;

      if (!is.integer(endIndex) || !is.integer(startIndex)) {
        console.log(element);
        throw new Error(`failed to find endindex/startindex for ${type}`);
      }
      const name = findOrCreateNamedRangeName(element, type, currentNr, addRequests)

      // embed this stuff in the shadow element
      element.__prop = prop;
      element.__type = type;
      element.__name = name;
      const twig = { name, children: [], parent: branch };
      branch.children.push(twig);
      element.__twig = twig;
      this.__elementMap.set(name, element);

      // recurse if we have sub elements
      const ep = element[prop]; // this is the object with .elements or .content
      if (Reflect.has(ep, "elements")) {
        ep.elements.forEach(e => mapElements(e, twig));
      }

    };
    // recurse the entire document
    content.forEach(c => mapElements(c, bodyTree))


    // delete the named ranges that weren't used
    const deleteRequests = currentNr.filter(nr => !this.__elementMap.has(nr.name)).map(r => ({
      deleteNamedRange: {
        namedRangeId: r.namedRangeId
      }
    }))

    // now commit any named range deletions/additions
    const requests = deleteRequests.concat(addRequests)
    if (!requests.length) {
      return data
    }

    console.log('adding', addRequests.length, 'deleting', deleteRequests.length, 'named ranges')
    Docs.Documents.batchUpdate({ requests }, this.__id)

    // this should just update the named range data
    // TODO need to check the content hasnt been changed

    const { data: afterData, response: afterResponse } = Docs.Documents.__get(this.__id)
    const { fromCache: afterCache } = afterResponse
    if (afterCache) {
      throw `didnt expect docs to come from cache after named range update`
    }
    return afterData

  }

  // this looks expensive, but the document wil always be in case unless its been updated
  // in which case we have to get it anyway this will
  get resource() {
    const { data, response } = Docs.Documents.__get(this.__id)
    const { fromCache } = response
    if (fromCache) {
      if (!this.__elementMap) {
        // if there are multiple document instances, it could be in cache, but this instance could be lacking an element map
        return this.makeElementMap(data)
      }
      return data
    }
    // it wasnt in cache so we'll need a rebuild of the element map
    return this.makeElementMap(data)
  }

  // the file representation is required for some operations
  get file() {
    return DriveApp.getFileById(this.__id)
  }

  get elementMap() {
    return this.__elementMap
  }

  get structure() {
    // will always refresh if it needs to
    const resource = this.resource
    const elementMap = this.elementMap
    return {
      elementMap,
      resource,
      shadowDocument: this
    }
  }
  
  getId () {
    return this.resource.documentId
  }

  getElement(name) {
    return this.structure.elementMap.get(name)
  }

  clear () {

  // The document's content is represented by an array of structural elements.
    const content = this.resource.body?.content;

    // If there's no content, or only the initial empty paragraph, there's nothing to clear.
    if (!content || content.length === 0) {
      return this;
    }

    // The last structural element contains the end index of the body's content.
    // A new/empty document has one structural element (a paragraph) with startIndex 1 and endIndex 2.
    // We must not delete this final newline character.
    const lastElement = content[content.length - 1];
    const endIndex = lastElement.endIndex;

    // If the document is already effectively empty (just one newline), do nothing.
    // The startIndex of all body content is 1.
    if (endIndex <= 2) {
      return this;
    }

    // We need to delete everything from the start of the body content (index 1)
    // up to the start of the final newline character. The range for deletion is
    // [1, endIndex - 1), where the end of the range is exclusive.
    const requests = [{
      deleteContentRange: { range: { startIndex: 1, endIndex: endIndex - 1 } }
    },];

    // Use the advanced Docs service to perform the update. This also invalidates the document cache.
    Docs.Documents.batchUpdate({ requests }, this.getId());

  // on the next access to the resource, the cache will be dirty and be refreshed, and the elementmap rebuilt

    return this;
  }
}