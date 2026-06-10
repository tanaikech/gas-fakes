/**
 * @file Provides a fake implementation of the base ContainerElement class.
 */
import { getElementFactory } from './elementRegistry.js';
import { Proxies } from '../../support/proxies.js';
import { newFakeElement } from './fakeelement.js';
import { signatureArgs } from '../../support/helpers.js';
import { Utils } from '../../support/utils.js';
const { is } = Utils;
import { getElementProp } from './elementhelpers.js';
import { FakeElement } from './fakeelement.js';
import { createFootnote } from './appenderhelpers.js';
import { newFakeRangeElement } from './fakerangeelement.js';

/**
 * Creates a new proxied FakeContainerElement instance.
 * @param {...any} args The arguments for the FakeContainerElement constructor.
 * @returns {FakeContainerElement} A new proxied FakeContainerElement instance.
 */
export const newFakeContainerElement = (...args) => {
  return Proxies.guard(new FakeContainerElement(...args));
};

/**
 * Base class for elements that can contain other elements.
 * @class FakeContainerElement
 * @extends {FakeElement}
 * @see https://developers.google.com/apps-script/reference/document/container-element
 */
export class FakeContainerElement extends FakeElement {
  /**
   * @param {import('./shadowdocument.js').ShadowDocument} shadowDocument The shadow document manager.
   * @param {string|object} nameOrItem The name of the element or the element's API resource.
   * @private
   */
  constructor(shadowDocument, nameOrItem) {
    super(shadowDocument, nameOrItem);
  }

  /**
   * Gets the shadow document manager associated with this element's structure.
   * @type {import('./shadowdocument.js').ShadowDocument | null}
   * @private
   */
  get shadowDocument() {
    return this.__shadowDocument;
  }

  /**
   * Gets the segment ID for the content of this element.
   * @type {string | null}
   * @private
   */
  get __segmentId() {
    if (this.__isDetached) return null;
    const item = this.__elementMapItem;
    // For Body, headerId/footerId will be undefined, so it falls back to the shadow's segmentId (which is null/empty for body).
    // For Header/Footer, this will return the correct ID.
    // For Footnote/FootnoteSection, it will have a footnoteId.
    return item.headerId || item.footerId || item.footnoteId || this.shadowDocument.__segmentId;
  }


  get __children() {
    return this.__twig.children;
  }

  /**
   * Appends a new footnote to the element.
   * @param {string} text The text for the footnote.
   * @returns {GoogleAppsScript.Document.Footnote} The new footnote.
   * @see https://developers.google.com/apps-script/reference/document/body#appendFootnote(String)
   */
  appendFootnote(text) {
    const { nargs, matchThrow } = signatureArgs(arguments, `${this.toString()}.appendFootnote`);
    if (nargs !== 1 || !is.string(text)) {
      matchThrow();
    }
    // This method is only valid for Body.
    if (this.getType().toString() !== 'BODY_SECTION') {
      throw new Error(`Method appendFootnote is not supported for this element type.`);
    }
    return createFootnote(this, text);
  }

  /**
   * Inserts a new footnote at the specified index.
   * @param {number} childIndex The index at which to insert.
   * @param {string} text The text for the footnote.
   * @returns {GoogleAppsScript.Document.Footnote} The new footnote.
   * @see https://developers.google.com/apps-script/reference/document/body#insertFootnote(Integer,String)
   */
  insertFootnote(childIndex, text) {
    // The API does not support inserting a footnote at a specific child index, only at a text index.
    // This is a simplification. For now, it behaves like append.
    return this.appendFootnote(text);
  }

  /**
   * Retrieves all the InlineImages contained in the section.
   * @returns {GoogleAppsScript.Document.InlineImage[]} The section images.
   */
  getImages() {
    ScriptApp.__behavior.checkMethod(this.toString(), 'getImages');
    const elements = [];
    const numChildren = this.getNumChildren();
    for (let i = 0; i < numChildren; i++) {
      const child = this.getChild(i);
      const type = child.getType().toString();
      if (type === 'INLINE_IMAGE') {
        elements.push(child);
      } else if (child.getNumChildren) {
        // Recurse into containers
        elements.push(...child.getImages());
      } else if (type === 'PARAGRAPH') {
        // Paragraphs can contain inline images
        const numParaChildren = child.getNumChildren();
        for (let j = 0; j < numParaChildren; j++) {
           const pChild = child.getChild(j);
           if (pChild.getType().toString() === 'INLINE_IMAGE') {
             elements.push(pChild);
           }
        }
      }
    }
    return elements;
  }

  /**
   * Retrieves all the ListItems contained in the section.
   * @returns {GoogleAppsScript.Document.ListItem[]} The section list items.
   */
  getListItems() {
    ScriptApp.__behavior.checkMethod(this.toString(), 'getListItems');
    const elements = [];
    const numChildren = this.getNumChildren();
    for (let i = 0; i < numChildren; i++) {
      const child = this.getChild(i);
      if (child.getType().toString() === 'LIST_ITEM') {
        elements.push(child);
      } else if (child.getNumChildren) {
        elements.push(...child.getListItems());
      }
    }
    return elements;
  }

  /**
   * Retrieves all the Paragraphs contained in the section (including ListItems).
   * @returns {GoogleAppsScript.Document.Paragraph[]} The section paragraphs.
   */
  getParagraphs() {
    ScriptApp.__behavior.checkMethod(this.toString(), 'getParagraphs');
    const elements = [];
    const numChildren = this.getNumChildren();
    for (let i = 0; i < numChildren; i++) {
      const child = this.getChild(i);
      const type = child.getType().toString();
      if (type === 'PARAGRAPH' || type === 'LIST_ITEM') {
        elements.push(child);
      } else if (child.getNumChildren) {
        elements.push(...child.getParagraphs());
      }
    }
    return elements;
  }

  /**
   * Retrieves all the Tables contained in the section.
   * @returns {GoogleAppsScript.Document.Table[]} The section tables.
   */
  getTables() {
    ScriptApp.__behavior.checkMethod(this.toString(), 'getTables');
    const elements = [];
    const numChildren = this.getNumChildren();
    for (let i = 0; i < numChildren; i++) {
      const child = this.getChild(i);
      if (child.getType().toString() === 'TABLE') {
        elements.push(child);
      } else if (child.getNumChildren) {
        elements.push(...child.getTables());
      }
    }
    return elements;
  }

  /**
   * Clears the contents of the element.
   * @returns {GoogleAppsScript.Document.ContainerElement} The current element.
   * @see https://developers.google.com/apps-script/reference/document/container-element#clear()
   */
  clear() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'ContainerElement.clear');
    if (nargs !== 0) matchThrow();

    // Snapshot the children names to avoid issues with index shifting during removal
    const childrenNames = this.__twig.children.map(c => c.name);
    childrenNames.forEach(name => {
      newFakeElement(this.shadowDocument, name).removeFromParent();
    });

    return this;
  }

  /**
   * Obtains a Text version of the current element, for editing.
   * @returns {GoogleAppsScript.Document.Text} a text version of the current element
   * @see https://developers.google.com/apps-script/reference/document/container-element#editAsText()
   */
  editAsText() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'ContainerElement.editAsText');
    if (nargs !== 0) matchThrow();
    // For now, we'll mark it as not implemented but mark as draft.
    throw new Error('editAsText() is not yet implemented in gas-fakes');
  }

  /**
   * Searches the contents of the element for a descendant of the specified type.
   * @param {GoogleAppsScript.Document.ElementType} elementType The type of element to search for.
   * @param {GoogleAppsScript.Document.RangeElement} [from] The element to start searching from.
   * @returns {GoogleAppsScript.Document.RangeElement | null} A search result indicating the position of the search element.
   * @see https://developers.google.com/apps-script/reference/document/container-element#findElement(ElementType,RangeElement)
   */
  findElement(elementType, from = null) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'ContainerElement.findElement');
    if (nargs < 1 || nargs > 2) matchThrow();

    const searchFromElement = from ? from.getElement() : null;
    let foundStart = !searchFromElement;

    const findRecursive = (container) => {
      const numChildren = container.getNumChildren();
      for (let i = 0; i < numChildren; i++) {
        const child = container.getChild(i);
        
        if (!foundStart) {
          if (child.__name === searchFromElement.__name) {
            foundStart = true;
          } else if (child.getNumChildren) {
            const result = findRecursive(child);
            if (result) return result;
          }
          continue;
        }

        if (child.getType().toString() === elementType.toString()) {
          return newFakeRangeElement({ element: child });
        }

        if (child.getNumChildren) {
          const result = findRecursive(child);
          if (result) return result;
        }
      }
      return null;
    };

    return findRecursive(this);
  }

  /**
   * Searches the contents of the element for the specified text pattern using regular expressions.
   * @param {string} searchPattern The text pattern to search for.
   * @param {GoogleAppsScript.Document.RangeElement} [from] The element to start searching from.
   * @returns {GoogleAppsScript.Document.RangeElement | null} a search result indicating the position of the search text, or null if there is no match
   * @see https://developers.google.com/apps-script/reference/document/container-element#findText(String,RangeElement)
   */
  findText(searchPattern, from = null) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'ContainerElement.findText');
    if (nargs < 1 || nargs > 2) matchThrow();

    const searchFromElement = from ? from.getElement() : null;
    let foundStart = !searchFromElement;
    const regex = new RegExp(searchPattern);

    const findRecursive = (container) => {
      const numChildren = container.getNumChildren();
      for (let i = 0; i < numChildren; i++) {
        const child = container.getChild(i);

        if (!foundStart) {
          if (child.__name === searchFromElement.__name) {
            foundStart = true;
          } else if (child.getNumChildren) {
            const result = findRecursive(child);
            if (result) return result;
          }
          continue;
        }

        if (child.getType().toString() === 'TEXT') {
          const text = child.getText();
          const match = regex.exec(text);
          if (match) {
            return newFakeRangeElement({ 
              element: child, 
              startOffset: match.index, 
              endOffsetInclusive: match.index + match[0].length - 1 
            });
          }
        }

        if (child.getNumChildren) {
          const result = findRecursive(child);
          if (result) return result;
        }
      }
      return null;
    };

    return findRecursive(this);
  }

  /**
   * Retrieves the child element at the specified index.
   * @param {number} childIndex The zero-based index of the child element to retrieve.
   * @returns {GoogleAppsScript.Document.Element} The child element at the specified index.
   * @see https://developers.google.com/apps-script/reference/document/container-element#getChild(Integer)
   */
  getChild(childIndex) {
    const {
      nargs,
      matchThrow
    } = signatureArgs(arguments, 'ContainerElement.getChild');
    if (nargs !== 1 || !is.integer(childIndex) || childIndex < 0) {
      matchThrow();
    }

    // Handle detached elements, which don't have a live shadowDocument.
    if (this.__isDetached) {
      const parentItem = this.__elementMapItem;
      if (childIndex >= this.__twig.children.length) matchThrow();

      let childResource;
      let childType; // The type of the child element we will create.
      const parentType = this.getType().toString();

      if (parentType === 'TABLE') {
        childResource = parentItem.table.tableRows[childIndex];
        childType = 'TABLE_ROW';
      } else if (parentType === 'TABLE_ROW') {
        childResource = parentItem.tableCells[childIndex];
        childType = 'TABLE_CELL';
      } else if (parentType === 'TABLE_CELL') {
        childResource = parentItem.content[childIndex];
        // For a table cell, the child is a structural element, so we need to determine its type.
        ({ type: childType } = getElementProp(childResource));
      } else if (parentType === 'PARAGRAPH') {
        const visibleChildren = parentItem.paragraph.elements.filter(e =>
          e.pageBreak || e.horizontalRule || (e.textRun && e.textRun.content && e.textRun.content !== '\n')
        );
        childResource = visibleChildren[childIndex];
        if (childResource) {
          // For a paragraph, the child is a paragraph element, so we need to determine its type.
          ({ type: childType } = getElementProp(childResource));
        }
      } else {
        throw new Error(`getChild on detached element of type ${parentType} not supported`);
      }

      if (!childResource) matchThrow();

      // Create and return the detached child element.
      const factory = getElementFactory(childType);
      return factory(null, childResource);
    }

    // Attached element logic
    const structure = this.__structure;
    const item = structure.elementMap.get(this.__name);
    const children = item.__twig.children;

    if (childIndex >= children.length) matchThrow();

    const childTwig = children[childIndex];
    if (!childTwig) throw new Error(`child with index ${childIndex} not found`);
    
    return newFakeElement(this.shadowDocument, childTwig.name).__cast();
  }

  /**
   * Retrieves the contents of the element as a text string.
   * @returns {string} the contents of the element as text string
   * @see https://developers.google.com/apps-script/reference/document/container-element#getText()
   */
  getText() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'ContainerElement.getText');
    if (nargs !== 0) matchThrow();

    return getText(this);
  }

  /**
   * Gets the text alignment.
   * @returns {GoogleAppsScript.Document.TextAlignment | null} the type of text alignment
   * @see https://developers.google.com/apps-script/reference/document/container-element#getTextAlignment()
   */
  getTextAlignment() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'ContainerElement.getTextAlignment');
    if (nargs !== 0) matchThrow();

    const attrs = this.getAttributes();
    // ContainerElement doesn't have a single text alignment, it's usually paragraph-level.
    // However, if we are a Paragraph, this should work.
    return attrs[DocumentApp.Attribute.TEXT_ALIGNMENT] || null;
  }

  /**
   * Sets the text alignment.
   * @param {GoogleAppsScript.Document.TextAlignment} textAlignment The text alignment to set.
   * @returns {GoogleAppsScript.Document.ContainerElement} the current element
   * @see https://developers.google.com/apps-script/reference/document/container-element#setTextAlignment(TextAlignment)
   */
  setTextAlignment(textAlignment) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'ContainerElement.setTextAlignment');
    if (nargs !== 1) matchThrow();

    this.setAttributes({
      [DocumentApp.Attribute.TEXT_ALIGNMENT]: textAlignment
    });
    return this;
  }

  /**
   * Replaces all occurrences of a search pattern with a replacement string.
   * @param {string} searchPattern The text pattern to search for.
   * @param {string} replacement The replacement string.
   * @returns {GoogleAppsScript.Document.ContainerElement} the current element
   * @see https://developers.google.com/apps-script/reference/document/container-element#replaceText(String,String)
   */
  replaceText(searchPattern, replacement) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'ContainerElement.replaceText');
    if (nargs !== 2 || !is.string(searchPattern) || !is.string(replacement)) matchThrow();

    // replaceText in GAS is global if called on Body, or scoped if called on other containers.
    // Implementing scoped replaceText via API is complex (requires finding and replacing chunks).
    // For now, let's mark it.
    throw new Error('replaceText() is not yet implemented in gas-fakes');
  }

  /**
   * Gets the index of a given child element.
   * @param {GoogleAppsScript.Document.Element} child The child element to find.
   * @returns {number} The zero-based index of the child element, or -1 if the element is not a child of this container.
   * @see https://developers.google.com/apps-script/reference/document/container-element#getChildIndex(Element)
   */
  getChildIndex(child) {
    const {
      nargs,
      matchThrow
    } = signatureArgs(arguments, 'ContainerElement.getChildIndex');
    if (nargs !== 1 || !is.object(child)) {
      matchThrow();
    }

    let children;
    if (this.__isDetached) {
      children = this.__twig.children;
    } else {
      // Get the refreshed structure to find the index within the up-to-date children list.
      const structure = this.__structure;
      const item = structure.elementMap.get(this.__name);
      children = item.__twig.children;
    }

    // We just need to compare the name here.
    const seIndex = children.findIndex(c => c.name === child.__name);
    return seIndex;
  }

  /**
   * Retrieves the number of children in the element.
   * @returns {number} The number of children.
   * @see https://developers.google.com/apps-script/reference/document/container-element#getNumChildren()
   */
  getNumChildren() {
    if (this.__isDetached) {
      return this.__twig.children.length;
    }
    // Must get the latest structure to return an accurate count,
    // as the object's internal state might be stale.
    const item = this.__structure.elementMap.get(this.__name);
    return item.__twig.children.length;
  }

}