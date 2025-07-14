import { Proxies } from '../../support/proxies.js';
import { FakeAdvResource } from '../common/fakeadvresource.js';
import { signatureArgs, ssError } from '../../support/helpers.js';
import is from '@sindresorhus/is';

export const newFakeAdvPresentations = (...args) => {
  return Proxies.guard(new FakeAdvPresentations(...args));
};

class FakeAdvPresentations extends FakeAdvResource {
  constructor(adv) {
    super(adv, 'presentations', adv.syncit.fxSlides);
    this.__fakeObjectType = 'Slides.Presentations';
  }

  /**
   * Creates a new presentation.
   * @param {object} resource The presentation resource.
   * @returns {object} The created presentation resource.
   */
  create(resource) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Slides.Presentations.create');
    if (nargs !== 1) matchThrow('Invalid number of arguments provided. Expected 1 only');
    if (!is.object(resource)) {
      matchThrow('API call to slides.presentations.create failed with error: Invalid JSON payload received.');
    }
    const { response, data } = this._call('create', {
      requestBody: resource,
    });

    ssError(response, 'create');
    return data;
  }

  /**
   * Gets a presentation by ID.
   * @param {string} presentationId The ID of the presentation.
   * @returns {object} The presentation resource.
   */
  get(presentationId) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Slides.Presentations.get');
    if (nargs !== 1) matchThrow('Invalid number of arguments provided. Expected 1 only');
    if (!is.string(presentationId)) {
      matchThrow('API call to slides.presentations.get failed with error: Invalid JSON payload received.');
    }
    const { response, data } = this._call('get', {
      presentationId,
    });
    ssError(response, 'get');
    return data;
  }

  toString() {
    return 'AdvancedServiceIdentifier{name=slides, version=v1}'
  }
}