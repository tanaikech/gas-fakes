import { Proxies } from '../../support/proxies.js';
import { newFakeElement } from './fakeelement.js';
import { signatureArgs, unimplementedProps } from '../../support/helpers.js';
import { Utils } from '../../support/utils.js';
const { is } = Utils;
import { ElementType } from '../enums/docsenums.js';
import {  extractText } from './shadowhelpers.js';
import { FakeElement } from './fakeelement.js';

export const newFakeContainerElement = (...args) => {
  return Proxies.guard(new FakeContainerElement(...args));
};

/**
 * Base class for elements that can contain other elements.
 * @see https://developers.google.com/apps-script/reference/document/container-element
 */
export class FakeContainerElement extends FakeElement {
  constructor(structure, name) {
    super(structure, name)
    this.__structure = structure
    this.__name = name
  }


  get __children() {
    return this.__twig.children
  }


  getChild(childIndex) {
    const children = this.__children
    const { nargs, matchThrow } = signatureArgs(arguments, 'ContainerElement.getChild');
    if (nargs !== 1 || !is.integer(childIndex) || childIndex < 0 || childIndex >= children.length) {
      matchThrow();
    }
    const se = children[childIndex]
    if (!se) {
      throw new Error(`child with index ${childIndex} not found`);
    }
    return newFakeElement(this.__structure, se.name)
  }

  /**
   * the children are shadow, but the arguement arriving will be an apps script element
   * @param {FakeElement} child 
   * @returns 
   */
  getChildIndex(child) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'ContainerElement.getChildIndex');
    if (nargs !== 1 || !is.object(child)) {
      matchThrow();
    }
    // we just need to compare the name here
    // dont want to look at the content because if child has been defined prior to an update it would be out of date anyway
    const seIndex = this.__children.findIndex(c => c.name === child.__name)
    if (seIndex === -1) {
      console.log(child)
      throw new Error(`child with name ${child.__name} not found`);
    }
    return seIndex
  }

  getNumChildren() {
    return this.__children.length
  }
  getText() {
    const item = this.__elementMapItem



    let text = []

    const extract = (elItem, text) => {
      if (elItem && elItem.__type === ElementType.PARAGRAPH.toString()) {
        text.push(extractText(elItem))
      } else {
        const leaves = (elItem?.__twig?.children || []).map(leaf => this.__getElementMapItem(leaf.name))
        leaves.forEach(leaf => {
          extract(leaf, text)
        })
      }
    }
    extract(item, text)
    return text.join('\n')
  }

}