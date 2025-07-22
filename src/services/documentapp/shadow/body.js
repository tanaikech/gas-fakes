import { Proxies } from '../../../support/proxies.js';
import { ShadowContainer } from './container.js';
export const newShadowBody= (...args) => {
  return Proxies.guard(new ShadowBody (...args));
};

class ShadowBody  extends ShadowContainer  {

  constructor(shadowDocument, body) {
    super(shadowDocument, body) 
    this.__shadowDocument = shadowDocument;
    this.__body = body
  }

}

