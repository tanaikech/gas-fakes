import { Proxies } from "../../support/proxies.js";
// import {
//   makeGridRange,
//   getGridRange,
//   makeSheetsGridRange,
//   batchUpdate,
// } from "./sheetrangehelpers.js";
import { newFakeUser } from "../common/fakeuser.js";
import { isNull } from "@sindresorhus/is";

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
   * @param {Spreadsheet|Sheet|Range} obj
   * @param {Object} o
   * @returns {FakeProtection}
   */
  constructor(obj, o) {
    this.spreadsheet = false;
    this.sheet = false;
    this.range = false;
    this.object = o;
    this.kind = null;
    if (obj.toString() == "Spreadsheet") {
      this.spreadsheet = obj;
      this.spreadsheetId = obj.getId();
      this.kind = "Spreadsheet";
    } else if (obj.toString() == "Sheet") {
      this.spreadsheet = obj.getParent();
      this.spreadsheetId = this.spreadsheet.getId();
      this.sheet = obj;
      this.sheetId = obj.getSheetId();
      this.kind = "Sheet";
    } else if (obj.toString() == "Range") {
      this.range = obj;
      this.sheet = obj.getSheet();
      this.spreadsheet = this.sheet.getParent();
      this.spreadsheetId = this.spreadsheet.getId();
      this.sheetId = this.sheet.getSheetId();
      this.kind = "Range";
    }
  }

  addEditor(o) {
    const emailAddresses = [o.toString()];
    return this.addEditors(emailAddresses);
  }

  addEditors(emailAddresses) {
    if (Array.isArray(emailAddresses) && emailAddresses.length > 0) {
      const editors = { users: emailAddresses };
      const obj = {
        spreadsheetId: this.spreadsheetId,
        requestObj: {
          requests: [
            {
              updateProtectedRange: {
                protectedRange: {
                  protectedRangeId: this.object.protectedRangeId,
                  editors,
                },
                fields: "editors",
              },
            },
          ],
          includeSpreadsheetInResponse: true,
        },
      };
      const res1 = this.__batchUpdate(obj);
      const pr = res1?.updatedSpreadsheet?.sheets[0]?.protectedRanges || [];
      const res2 = pr.find(
        (e) => e.protectedRangeId == this.object.protectedRangeId
      );
      this.object = res2;
    }
    return this;
  }

  addTargetAudience() {
    // Cannot test
    return this;
  }

  canDomainEdit() {
    // Cannot test
    return this.object.editors?.domainUsersCanEdit || false;
  }

  canEdit() {
    if (this.object.requestingUserCanEdit) {
      return this.object.requestingUserCanEdit;
    }
    return false;
  }

  getDescription() {
    return this.object.description || "";
  }

  getEditors() {
    if (this.object.editors?.users && this.object.editors?.users.length > 0) {
      return this.object.editors.users.map((email) => newFakeUser({ email }));
    }
    return null;
  }

  getProtectionType() {
    const checkKeys = [
      "startRowIndex",
      "endRowIndex",
      "startColumnIndex",
      "endColumnIndex",
    ];
    if (checkKeys.every((k) => this.object.range.hasOwnProperty(k))) {
      return SpreadsheetApp.ProtectionType.RANGE;
    }
    return SpreadsheetApp.ProtectionType.SHEET;
  }

  getRange() {
    if (this.getProtectionType().toString() == "RANGE") {
      return this.spreadsheet
        .getSheetById(this.object.sheetId)
        .getRange(
          this.object.range.startRowIndex + 1,
          this.object.range.startColumnIndex + 1,
          this.object.range.endRowIndex - this.object.range.startRowIndex,
          this.object.range.endColumnIndex - this.object.range.startColumnIndex
        );
    } else if (this.getProtectionType().toString() == "SHEET") {
      const sheet = this.spreadsheet.getSheetById(this.object.sheetId);
      return sheet.getRange(1, 1, sheet.getMaxRows(), sheet.getMaxColumns());
    }
    return null;
  }

  getRangeName() {}

  getTargetAudiences() {
    // Cannot test
  }

  getUnprotectedRanges() {}

  isWarningOnly() {
    return this.object.warningOnly || false;
  }

  remove() {
    const obj = {
      spreadsheetId: this.spreadsheetId,
      requestObj: {
        requests: [
          {
            deleteProtectedRange: {
              protectedRangeId: this.object.protectedRangeId,
            },
          },
        ],
      },
    };
    this.__batchUpdate(obj);
    return null;
  }

  removeEditor(o) {
    const emailAddresses = [o.toString()];
    return this.removeEditors(emailAddresses);
  }

  removeEditors(emailAddresses) {
    if (Array.isArray(emailAddresses) && emailAddresses.length > 0) {
      const res = this.__getProtections(this.object.protectedRangeId);
      if (res) {
        const mails = res.editors.users.filter(
          (e) => !emailAddresses.includes(e)
        );
        return this.addEditors(mails);
      }
    }
    return this;
  }

  removeTargetAudience() {
    // Cannot test
    return this;
  }

  setDescription(description) {
    if (description) {
      const obj = {
        spreadsheetId: this.spreadsheetId,
        requestObj: {
          requests: [
            {
              updateProtectedRange: {
                protectedRange: {
                  protectedRangeId: this.object.protectedRangeId,
                  description,
                },
                fields: "description",
              },
            },
          ],
          includeSpreadsheetInResponse: true,
        },
      };
      const res1 = this.__batchUpdate(obj);
      const pr = res1?.updatedSpreadsheet?.sheets[0]?.protectedRanges || [];
      const res2 = pr.find(
        (e) => e.protectedRangeId == this.object.protectedRangeId
      );
      this.object = res2;
    }
    return this;
  }

  setDomainEdit() {
    // Cannot test
    return this;
  }

  setNamedRange() {
    return this;
  }

  setRange() {
    if (this.kind == "Sheet") {
      throw new Error(
        "Exception: Cannot change sheet protection to range protection (or vice versa)."
      );
    }
    //
    return this;
  }

  setRangeName() {
    return this;
  }

  // 20250831 今ここを作成中
  setUnprotectedRanges(ranges) {
    if (range && Array.isArray(range) && range.length > 0) {
    }
    return this;
  }

  setWarningOnly(warningOnly = false) {
    const obj = {
      spreadsheetId: this.spreadsheetId,
      requestObj: {
        requests: [
          {
            updateProtectedRange: {
              protectedRange: {
                protectedRangeId: this.object.protectedRangeId,
                warningOnly,
              },
              fields: "warningOnly",
            },
          },
        ],
        includeSpreadsheetInResponse: true,
      },
    };
    const res1 = this.__batchUpdate(obj);
    const pr = res1?.updatedSpreadsheet?.sheets[0]?.protectedRanges || [];
    const res2 = pr.find(
      (e) => e.protectedRangeId == this.object.protectedRangeId
    );
    this.object = res2;
    return this;
  }

  __getProtections(id) {
    const obj = {
      spreadsheetId: this.spreadsheetId,
      ranges: [this.sheet.getSheetName()],
      fields: "sheets(protectedRanges)",
    };
    const res = this.__get(obj).sheets;
    if (
      res &&
      res.length > 0 &&
      res[0].protectedRanges &&
      res[0].protectedRanges.length > 0
    ) {
      if (id) {
        return (
          res[0].protectedRanges.find((e) => e.protectedRangeId == id) || null
        );
      }
      return res[0].protectedRanges;
    }
    return [];
  }

  __batchUpdate({ spreadsheetId, requestObj }) {
    return Sheets.Spreadsheets.batchUpdate(requestObj, spreadsheetId);
  }

  __get({ spreadsheetId, ranges, fields = "*" }) {
    return Sheets.Spreadsheets.get(spreadsheetId, { ranges, fields });
  }
}
