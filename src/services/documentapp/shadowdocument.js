import { Proxies } from '../../support/proxies.js';
import { makeNrPrefix, getCurrentNr,findOrCreateNamedRangeName } from './nrhelpers.js'
import { getElementProp } from './shadowhelpers.js';
import { Utils } from '../../support/utils.js';


const { is } = Utils;


export const newShadowDocument = (...args) => {
  return Proxies.guard(new ShadowDocument(...args));
};

class ShadowDocument {
  constructor(id) {
    this.__id = id
  }


 get __endBodyIndex () {
  const content = this.resource?.body?.content || []
  const endIndex = content[content.length - 1]?.endIndex || 0
  return endIndex
 }

  /**
   * we may need to do this if we're coming from cache
   * although the resource may be in cache, the element map might not be defined
   * why ? because if you create a new Document instance based on the same file as previous document, the document might be in cache,
   * but not its structure - so why not put the structure in cache - 
   * the document cache is managed by calls to the api wherever they come from, including the advanced service which knows nothig about
   * thisdocumentApp emulation.
   * broadening the scope will mean complicating that currently clean and abstracted process.
   * 
   */

  makeElementMap(data) {

    const content = data?.body?.content || []

    // get the currently known named ranges
    const currentNr = getCurrentNr(data)

    // if there's been an update, the revisionId will have changed
    if (this.__mapRevisionId !== data.revisionId) {
      this.__mapRevisionId = data.revisionId
      this.__segmentId = data.body.segmentId
    }

    // this will contain all the requests to add new named ranges
    const addRequests = []

    // we'll need to recursively iterate through the document to create a bookmark for every single one
    this.__elementMap = new Map()
    const bodyName = makeNrPrefix("BODY_SECTION");
    const bodyTree = { name: bodyName, children: [], parent: null }

    const bodyElement = {
      __prop: "BODY_SECTION",
      __type: "BODY_SECTION",
      __name: bodyName,
      __twig: bodyTree
    }
    this.__elementMap.set(bodyName, bodyElement);

    // console.log('named ranges after document fetch', JSON.stringify(currentNr))

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
      // For an empty document, we use static, non-API names to avoid re-indexing issues.
      // For all other documents, we use real NamedRanges to track elements.
      const { name, namedRangeId } = findOrCreateNamedRangeName(element, type, currentNr, addRequests);

      // embed this stuff in the shadow element
      element.__prop = prop;
      element.__type = type;
      element.__name = name;

      const twig = { name: name, children: [], parent: branch };
      element.__twig = twig;
      this.__elementMap.set(name, element);

      // recurse if we have sub elements
      const ep = element[prop]; // this is the object with .elements or .content
      if (Reflect.has(ep, "elements")) {
        // Process ALL sub-elements recursively to ensure they are in the elementMap and have a twig.
        ep.elements.forEach(subElement => mapElements(subElement, twig));

        // Now that all sub-elements have been processed and have a __twig, we can
        // filter them to build the user-facing children list for the current twig.
        if (type === 'PARAGRAPH') {
          twig.children = ep.elements
            .map(e => e.__twig) // Get the twig for each raw element
            .filter(childTwig => {
              if (!childTwig) return false;
              const childElement = this.__elementMap.get(childTwig.name);
              if (!childElement) return false;

              // Prioritize keeping non-text elements like PageBreak.
              if (childElement.pageBreak || childElement.horizontalRule) { // TODO: Add other non-text types
                return true;
              }
              // If it's a text run, it's a child only if it has visible content.
              if (childElement.textRun) {
                return childElement.textRun.content && childElement.textRun.content !== '\n';
              }
              return false;
            });
        } else {
          // For non-paragraph containers, all children are significant.
          twig.children = ep.elements.map(e => e.__twig).filter(Boolean);
        }
      }
      return twig;

    };

    // recurse the entire document
    content.forEach(c => mapElements(c, bodyTree));
    bodyTree.children = content.map(c => c.__twig).filter(Boolean);
    
    // delete the named ranges that weren't used
    // findOrCreate... consumes the currentNr list, so what's left are unused ranges.

    const deleteRequests = currentNr.map(r => ({
      deleteNamedRange: {
        namedRangeId: r.namedRangeId
      }
    }))

    // now commit any named range deletions/additions
    const requests = deleteRequests.concat(addRequests)

    // always do this because the nr ID may have changed if we had to update it
    // for new ones, it'll pick those up next refresh
    this.nrMap = new Map(getCurrentNr(data).map(f => [f.name, f]))

    if (requests.length > 0) {
      // console.log('adding', addRequests.length, 'deleting', deleteRequests.length, 'named ranges')
      Docs.Documents.batchUpdate({ requests }, this.__id)
      // we've changed the document, so we need to re-process it to get the latest state, including new namedRangeIds
      return this.makeElementMap(Docs.Documents.__get(this.__id).data)
    }
    return data;
  }

  // this looks expensive, but the document wil always be in case unless its been updated
  // in which case we have to get it anyway this will
  get resource() {
    const { data, response } = Docs.Documents.__get(this.__id)
    const { fromCache } = response
    if (fromCache) {
      if (!this.__elementMap || !this.__mapRevisionId || this.__mapRevisionId !== data.revisionId) {
        // if there are multiple document instances, it could be in cache, but this instance could be lacking an element map, or it could
        // have been updated by something else so we'd need to fiddle with the document map again
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
    const resource = this.refresh()
    const elementMap = this.elementMap
    return {
      elementMap,
      resource,
      shadowDocument: this
    }
  }

  getId() {
    return this.resource.documentId
  }

  getElement(name) {
    return this.structure.elementMap.get(name)
  }
  refresh() {
    // all that's need to refresh everything is to fetch the resource
    return this.resource
  }
  clear() {

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