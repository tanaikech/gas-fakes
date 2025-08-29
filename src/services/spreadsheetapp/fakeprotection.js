import { Proxies } from "../../support/proxies.js";
import {
  makeGridRange,
  getGridRange,
  makeSheetsGridRange,
  batchUpdate,
} from "./sheetrangehelpers.js";

/**
 * create a new FakeProtection instance
 * @param  {...any} args
 * @returns {FakeProtection}
 */
export const newFakeProtection = (...args) => {
  return Proxies.guard(new FakeProtection(...args));
};

/**
 * basic fake FakeProtection
 * @class FakeProtection
 */
export class FakeProtection {
  /**
   * @constructor
   * @param {Spreadsheet|Sheet} obj
   * @param {Object} o
   * @returns {FakeProtection}
   */
  constructor(obj, o) {
    this.spreadsheet = false;
    this.sheet = false;
    this.object = o;
    if (obj.toString() == "Spreadsheet") {
      this.spreadsheet = obj;
      this.spreadsheetId = obj.getId();
      this.sheet = obj.getSheetById(this.object.range.sheetId);
      this.sheetId = this.object.range.sheetId;
    } else if (obj.toString() == "Sheet") {
      this.spreadsheet = obj.getParent();
      this.spreadsheetId = this.spreadsheet;
      this.sheet = obj;
      this.sheetId = this.object.range.sheetId;
    }
  }

  addEditor() {
    return this;
  }

  addEditors() {
    return this;
  }

  addTargetAudience() {
    return this;
  }

  canDomainEdit() {}

  canEdit() {}

  getDescription() {}

  getEditors() {}

  getProtectionType() {}

  getRange() {}

  getRangeName() {}

  getTargetAudiences() {}

  getUnprotectedRanges() {}

  isWarningOnly() {}

  remove() {}

  removeEditor() {
    return this;
  }

  removeEditors() {
    return this;
  }

  removeTargetAudience() {
    return this;
  }

  setDescription() {
    return this;
  }

  setDomainEdit() {
    return this;
  }

  setNamedRange() {
    return this;
  }

  setRange() {
    return this;
  }

  setRangeName() {
    return this;
  }

  setUnprotectedRanges() {
    return this;
  }

  setWarningOnly() {
    return this;
  }

  // __batchUpdate({ spreadsheetId, requests }) {
  //   Sheets.Spreadsheets.batchUpdate({ requests }, spreadsheetId);
  // }

  __get({ spreadsheetId, ranges, fields = "*" }) {
    return Sheets.Spreadsheets.get(spreadsheetId, { ranges, fields });
  }
}
