import { FakeAdvResource } from '../common/fakeadvresource.js';
import { Syncit } from '../../support/syncit.js';
import { slidesCacher } from '../../support/slidescacher.js';
import { Proxies } from '../../support/proxies.js';

/**
 * @class FakeAdvSlidesPresentations
 */
class FakeAdvSlidesPresentations extends FakeAdvResource {
  constructor(mainService) {
    super(mainService, 'presentations', Syncit.fxSlides);
  }

  // Override 'get' to use the caching-enabled function fxSlidesGet.
  get(presentationId) {
    const { data } = this._call('get', { presentationId });
    return data;
  }

  // Signature matches Apps Script advanced service.
  create(presentation) {
    // The underlying API wants the resource in a 'resource' property.
    const result = this._call('create', { resource: presentation });
    return result.data;
  }

  // Signature matches Apps Script advanced service.
  batchUpdate(requests, presentationId) {
    const result = this._call('batchUpdate', {
      presentationId,
      resource: { requests },
    });

    // Any update should invalidate the cache for that presentation.
    if (presentationId) {
      slidesCacher.clear(presentationId);
    }

    return result.data;
  }
}

/**
 * @class FakeAdvSlides
 * @description The Slides Advanced Service
 */
class FakeAdvSlides {
  constructor() {
    this.Presentations = Proxies.guard(new FakeAdvSlidesPresentations(this));
  }

  __getSlidesPerformance() {
    return slidesCacher.getPerformance();
  }
  toString() {
    return 'AdvancedServiceIdentifier{name=slides, version=v1}';
  }
  getVersion() {
    return 'v1';
  }

}
/**
 * Creates a new fake Slides advanced service instance.
 * @returns {FakeAdvSlides}
 */
export const newFakeAdvSlides = () => Proxies.guard(new FakeAdvSlides());