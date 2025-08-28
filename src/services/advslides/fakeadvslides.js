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
    this.slides = mainService
  }

  // Override 'get' to use the caching-enabled function fxSlidesGet.
  get(presentationId) {
    const { data } = this._call('get', { presentationId: this.slides.__allowed(presentationId) }, Syncit.fxSlidesGet);
    return data;
  }

  // Signature matches Apps Script advanced service.
  create(presentation) {
    // The underlying API wants the resource in a 'resource' property.
    const result = this._call('create', { resource: presentation });
    if (result.data) {
      this.slides.__addAllowed(result.data.presentationId);
    }
    return result.data;
  }

  // Signature matches Apps Script advanced service.
  batchUpdate(requests, presentationId) {
    const result = this._call('batchUpdate', {
      presentationId: this.slides.__allowed(presentationId),
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

  // in sandbox mode only files created in this instance are
  __allowed(id) {

    if (!ScriptApp.__behavior.isAccessible(id)) {
      throw new Error(`Access to slides ${id} is not allowed in sandbox mode`);
    }
    return id
  }
  __addAllowed(id) {
    if (ScriptApp.__behavior.sandBoxMode) {
      ScriptApp.__behavior.addFile(id);
    }
    return id
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