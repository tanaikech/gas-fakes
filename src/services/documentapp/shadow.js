/**
 * @file Manages the internal "shadow" representation of a Google Document.
 */

import { makeName, makeNrPrefix } from './nrhelpers.js';
import { getElementFactory } from './elementRegistry.js';
import { getText } from './elementhelpers.js';
import is from '@sindresorhus/is';

/**
 * @typedef {object} ShadowStructure
 * @property {Map<string, object>} elementMap - A map from unique element names to their API resource and metadata.
 * @property {string} rootName - The name of the root element (the body).
 * @property {ShadowDocument} shadowDocument - A reference back to this manager.
 */

/**
 * Manages an in-memory representation of the Google Doc structure,
 * which is used by the fake element classes to interact with the document.
 * It is responsible for parsing the document resource from the API and
 * orchestrating updates.
 * @class ShadowDocument
 */
export class ShadowDocument {
  /**
   * @param {object} docResource The raw document resource from the Google Docs API.
   */
  constructor(docResource) {
    this.__docResource = docResource;
    this.__segmentId = ''; // Assuming a single segment for now.
    this.structure = this.parse();
  }

  /**
   * Gets the parsed structure object.
   * @returns {ShadowStructure} The structure object.
   */
  getStructure() {
    return this.structure;
  }

  /**
   * Parses the document resource from the API into an internal `elementMap` and `twig` tree.
   * @returns {ShadowStructure} The parsed structure.
   * @private
   */
  parse() {
    const elementMap = new Map();
    const rootName = makeName(null, 'BODY_SECTION', 0);
    const rootTwig = { name: rootName, children: [] };

    elementMap.set(rootName, {
      __type: 'BODY_SECTION',
      __twig: rootTwig,
    });

    const content = this.__docResource?.body?.content || [];
    // Per oddities.md, DocumentApp ignores the initial sectionBreak.
    const visibleContent = content.filter((c) => !c.sectionBreak);

    visibleContent.forEach((structuralElement, index) => {
      const type = Object.keys(structuralElement).find(k => k !== 'startIndex' && k !== 'endIndex');
      if (type) {
        const name = makeName(null, type.toUpperCase(), index);
        const twig = { name, children: [], parent: rootTwig };
        rootTwig.children.push(twig);

        elementMap.set(name, {
          ...structuralElement,
          __type: type.toUpperCase(),
          __twig: twig,
        });
        // TODO: Recursively parse children of container elements like paragraphs and tables.
      }
    });

    return {
      elementMap,
      rootName,
      shadowDocument: this,
    };
  }

  /**
   * Appends an element to a parent container.
   * This method orchestrates the API call and refreshes the shadow state.
   * @param {import('./fakecontainerelement.js').FakeContainerElement} parent The parent to append to.
   * @param {string} type The type of element to append (e.g., 'PARAGRAPH').
   * @param {string | import('./fakeelement.js').FakeElement} content The content for the new element.
   * @returns {import('./fakeelement.js').FakeElement} The newly created and attached element.
   */
  appendElement(parent, type, content) {
    const docId = this.__docResource.documentId;
    const requests = [];
    // Insert at the end of the document body. The -1 is to insert *before* the final newline of the document.
    const location = {
      index: this.__docResource.body.content.slice(-1)[0].endIndex - 1,
    };

    if (type === 'PARAGRAPH') {
      const textToInsert = (is.string(content) ? content : getText(content)) + '\n';
      requests.push({ insertText: { location, text: textToInsert } });
    } else {
      // TODO: Implement other element types like Table.
      throw new Error(`Appending type ${type} is not yet implemented.`);
    }

    if (requests.length > 0) {
      globalThis.Docs.Documents.batchUpdate({ requests }, docId);
      // Refresh the entire state from the API.
      this.__docResource = globalThis.Docs.Documents.get(docId);
      this.structure = this.parse();
    }

    // Find and return the newly created element.
    const parentTwig = this.structure.elementMap.get(parent.__name).__twig;
    const newTwig = parentTwig.children.slice(-1)[0];
    const factory = getElementFactory(type);
    return factory(this.structure, newTwig.name);
  }
}