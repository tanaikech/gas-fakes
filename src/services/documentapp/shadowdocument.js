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


  // this looks expensive, but the document wil always be in case unless its been updated
  // in which case we have to get it anyway this will
  get resource() {
    const { data, response } = Docs.Documents.__get(this.__id)
    const { fromCache } = response
    if (fromCache) return data

    // if it didn't come from cache, then we're going to need to add some named ranges

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
        console.log(`...skipping`, element);
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
      const name =  findOrCreateNamedRangeName  (element, type, currentNr, addRequests) 

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
  // the file representation is required for some operations
  get file() {
    return DriveApp.getFileById(this.__id)
  }

  get structure () {
    // will always refresh if it needs to
    const resource = this.resource
    return {
      elementMap: this.__elementMap,
      resource,
      shadowDocument: this
    }
  }

  getElement (name)  {
    return this.structure.elementMap.get(name)
  }
  

}