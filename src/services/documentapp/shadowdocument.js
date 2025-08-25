import { Proxies } from '../../support/proxies.js';
import { makeNrPrefix, getCurrentNr, findOrCreateNamedRangeName } from './nrhelpers.js'
import { getElementProp } from './elementhelpers.js';
import { Utils } from '../../support/utils.js';


const { is } = Utils;


export const newShadowDocument = (...args) => {
  return Proxies.guard(new ShadowDocument(...args));
};

class ShadowDocument {
  constructor(id) {
    this.__id = id
  }

  __fetch() {
    return Docs.Documents.__get(this.__id, { includeTabsContent: true })
  }



  get __endBodyIndex() {
    const content = this.__unpackDocumentTab(this.resource).body.content
    if (!content.length) {
      throw new Error("document has no content")
    }
    const endIndex = content[content.length - 1].endIndex
    if (!endIndex) {
      throw new Error("cant establish end index for document")
    }
    return endIndex
  }


  __unpackDocumentTab = (data) => {
    const tabs = data?.tabs
    const documentTab = tabs?.[0]?.documentTab || data
    const body = documentTab?.body
    if (!documentTab) {
      throw new Error("failed to find document tab in document")
    }
    if (!body) {
      throw new Error("failed to find body in document")
    }
    return {
      tabs,
      documentTab,
      body,
      lists: documentTab.lists,
      namedStyles: documentTab.namedStyles,
      namedRanges: documentTab.namedRanges  
    }
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

    // its possible that the document is a tabbed document, in which case the body content is in the first section
    // TODO support multiple tabs - for now we're just going to support legacy docs wrapped in a tab

    const {body, documentTab} = this.__unpackDocumentTab(data)
    const {content} = body


    // get the currently known named ranges
    const currentNr = getCurrentNr(documentTab)

    // if there's been an update, the revisionId will have changed
    if (this.__mapRevisionId !== data.revisionId) {
      this.__mapRevisionId = data.revisionId
      // TODO check this ro see when its not null
      this.__segmentId = body.segmentId
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
    const mapElements = (element, branch, knownType = null) => {
      // this gets the type and property name to look for for the given element content
      const elementProp = knownType ? { type: knownType, prop: null } : getElementProp(element);

      if (!elementProp) {
        // This will now catch things like sectionBreak
        return;
      }
      // the type is the enum text for te type, the prop is where to find it in the element
      const { type, prop } = elementProp;

      // All child elements are expected to have a range.
      // A list item is a paragraph, so its named range should be of type PARAGRAPH.
      const { endIndex, startIndex } = element;

      if (!is.integer(endIndex) || !is.integer(startIndex)) {
        console.log(element);
        throw new Error(`failed to find endindex/startindex for ${type}`);
      }
      // For an empty document, we use static, non-API names to avoid re-indexing issues.
      // For all other documents, we use real NamedRanges to track elements.
      const nrType = type === 'LIST_ITEM' ? 'PARAGRAPH' : type;
      const { name } = findOrCreateNamedRangeName(element, nrType, currentNr, addRequests);

      // embed this stuff in the shadow element
      element.__prop = prop;
      element.__type = type;
      element.__name = name;

      const twig = { name: name, children: [], parent: branch };
      element.__twig = twig;
      this.__elementMap.set(name, element);


      // For most elements, the content is in a sub-property (e.g., element.paragraph).
      // For TableRow and TableCell, the element itself is the content container.
      const ep = is.null(prop) ? element : element[prop];

      // Determine the correct property to iterate over for children
      let childrenArray = [];
      let childType = null;

      if (type === 'TABLE') {
        childrenArray = ep.tableRows || [];
        childType = 'TABLE_ROW';
      } else if (type === 'TABLE_ROW') {
        childrenArray = ep.tableCells || [];
        childType = 'TABLE_CELL';
      } else if (type === 'TABLE_CELL') {
        childrenArray = ep.content || [];
        // childType is null, getElementProp will figure it out
      } else if (ep && Reflect.has(ep, "elements")) { // For Paragraph and others
        childrenArray = ep.elements;
        // childType is null, getElementProp will figure it out
      }

      if (childrenArray.length > 0) {
        // Process ALL sub-elements recursively to ensure they are in the elementMap and have a twig.
        childrenArray.forEach(subElement => mapElements(subElement, twig, childType));

        // Now that all sub-elements have been processed and have a __twig, we can
        // filter them to build the user-facing children list for the current twig.
        if (type === 'PARAGRAPH') {
          twig.children = childrenArray
            .map(e => e.__twig) // Get the twig for each raw element
            .filter(childTwig => {
              if (!childTwig) return false;
              const childElement = this.__elementMap.get(childTwig.name);
              if (!childElement) return false;

              // A paragraph's children are its non-text elements (like PageBreak)
              // and text runs that are not just a newline.
              return childElement.pageBreak ||
                childElement.horizontalRule ||
                (childElement.textRun && childElement.textRun.content && childElement.textRun.content !== '\n');
            });
        } else {
          // For non-paragraph containers, all children are significant.
          twig.children = childrenArray.map(e => e.__twig).filter(Boolean);
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

    const requests = deleteRequests.concat(addRequests)

    if (requests.length > 0) {
      // If we need to add or delete named ranges, we do the update and then
      // recursively call this function with the refreshed document state.
      // This ensures the final elementMap and nrMap are based on the latest version.
      Docs.Documents.batchUpdate({ requests }, this.__id)
      return this.makeElementMap(this.__fetch().data)
    }
    // If there were no named range changes, the document is stable. We can set the map.
    this.nrMap = new Map(getCurrentNr(data).map(f => [f.name, f]));
    return data;
  }

  // this looks expensive, but the document wil always be in case unless its been updated
  // in which case we have to get it anyway this will
  get resource() {
    const { data, response } = this.__fetch()
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
    const content = this.__unpackDocumentTab(this.resource).body.content

    // If there's no content, there's nothing to clear.
    if (!content || content.length === 0) {
      return this;
    }

    const requests = [];

    // The last structural element contains the end index of the body's content.
    // A new/empty document has one structural element (a paragraph) with startIndex 1 and endIndex 2.
    // We must not delete this final newline character.
    const lastElement = content[content.length - 1];
    const endIndex = lastElement.endIndex;

    const hasContentToDelete = endIndex > 2;
    const firstElement = content.find(c => c.startIndex === 1);
    const isFirstElementListItem = firstElement?.paragraph?.bullet;

    // If there is content to delete (more than just the initial empty paragraph)...
    if (hasContentToDelete) {
      // We need to delete everything from the start of the body content (index 1)
      // up to the start of the final newline character. The range for deletion is
      // [1, endIndex - 1), where the end of the range is exclusive.
      requests.push({
        deleteContentRange: { range: { startIndex: 1, endIndex: endIndex - 1 } }
      });
    }

    // We must remove bullets if we are deleting content (which might merge a list item
    // into the first paragraph) OR if the first paragraph is already a list item.
    if (hasContentToDelete || isFirstElementListItem) {
      requests.push({ deleteParagraphBullets: { range: { startIndex: 1, endIndex: 1 } } });
    }

    if (requests.length > 0) {
      Docs.Documents.batchUpdate({ requests }, this.getId());
    }

    // on the next access to the resource, the cache will be dirty and be refreshed, and the elementmap rebuilt

    return this;
  }
}