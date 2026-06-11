/**
 * @file Provides a fake implementation of the Person class.
 */
import { Proxies } from '../../support/proxies.js';
import { signatureArgs } from '../../support/helpers.js';
import { Utils } from '../../support/utils.js';
import { FakeElement } from './fakeelement.js';
import { registerElement } from './elementRegistry.js';

const { is } = Utils;

/**
 * Creates a new proxied FakePerson instance.
 * @param {...any} args The arguments for the FakePerson constructor.
 * @returns {FakePerson} A new proxied FakePerson instance.
 */
export const newFakePerson = (...args) => {
  return Proxies.guard(new FakePerson(...args));
};

/**
 * A fake implementation of the Person class for DocumentApp.
 * @class FakePerson
 * @extends {FakeElement}
 * @implements {GoogleAppsScript.Document.Person}
 * @see https://developers.google.com/apps-script/reference/document/person
 */
export class FakePerson extends FakeElement {
  /**
   * @param {import('./shadowdocument.js').ShadowDocument} shadowDocument The shadow document manager.
   * @param {string|object} nameOrItem The name of the element or the element's API resource.
   * @private
   */
  constructor(shadowDocument, nameOrItem) {
    super(shadowDocument, nameOrItem);
  }

  /**
   * Returns the person's email address.
   * @returns {string} The email address of the person.
   */
  getEmail() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Person.getEmail');
    if (nargs !== 0) matchThrow();

    const person = this.__elementMapItem.person;
    return person ? person.personId : null;
  }

  /**
   * Returns the person's display name, if set.
   * @returns {string} The display name of the person link.
   */
  getName() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Person.getName');
    if (nargs !== 0) matchThrow();

    const person = this.__elementMapItem.person;
    return person?.personProperties ? person.personProperties.name : null;
  }

  toString() {
    return 'Person';
  }
}

registerElement('PERSON', newFakePerson);
