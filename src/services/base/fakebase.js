import { Proxies } from '../../support/proxies.js';
import * as BaseEnums from '../enums/baseenums.js';
import { newFakeMimeType } from '../mimetype/fakemimetype.js';

/**
 * @class FakeBase
 * @description The Base service in Google Apps Script.
 * @see https://developers.google.com/apps-script/reference/base
 */
export class FakeBase {
  constructor() {
    this.Button = BaseEnums.Button;
    this.ButtonSet = BaseEnums.ButtonSet;
    this.ColorType = BaseEnums.ColorType;
    this.MimeType = newFakeMimeType();
    this.Month = BaseEnums.Month;
    this.Weekday = BaseEnums.Weekday;
  }

  toString() {
    return 'Base';
  }
}

/**
 * @returns {FakeBase}
 */
export const newFakeBase = () => Proxies.guard(new FakeBase());
