import { Proxies } from "../../support/proxies.js";
import { makeGridRange } from "./sheetrangehelpers.js";
import { newFakeUser } from "../common/fakeuser.js";
import { newFakeNamedRange } from "./fakenamedrange.js";
import { FakeSheetRange } from "../spreadsheetapp/fakesheetrange.js";
import { FakeDriveApp } from "../driveapp/fakedriveapp.js";

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
      const res = this.__batchUpdate(obj);
      this.object = this.__getProtectedRangeFromResponseOfBatchUpdate(res);
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
    return this.object.requestingUserCanEdit || false;
  }

  getDescription() {
    return this.object.description || "";
  }

  getEditors() {
    if (this.object.editors?.users && this.object.editors?.users.length > 0) {
      const owner = DriveApp.getFileById(this.spreadsheetId)
        .getOwner()
        .getEmail();
      return this.object.editors.users
        .filter((email) => email != owner)
        .map((email) => newFakeUser({ email }));
    }
    return [];
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
    const sheetId = this.object.range?.sheetId || 0;
    const sheet = this.spreadsheet.getSheetById(sheetId);
    return new FakeSheetRange(this.object.range, sheet);
  }

  getRangeName() {
    const res1 = this.__getProtections(this.object.protectedRangeId);
    if (res1.namedRangeId) {
      const obj = {
        spreadsheetId: this.spreadsheetId,
        fields: "namedRanges",
      };
      const res2 = this.__get(obj).namedRanges;
      if (res2 && res2.length > 0) {
        const nr = res2.find(
          ({ namedRangeId }) => namedRangeId == res1.namedRangeId
        );
        if (nr) {
          return nr.name;
        }
      }
    }
    return null;
  }

  getTargetAudiences() {
    // Cannot test
  }

  getUnprotectedRanges() {
    const res = this.__getProtections(this.object.protectedRangeId);
    if (res.unprotectedRanges && res.unprotectedRanges.length > 0) {
      return res.unprotectedRanges.map((r) => {
        const sheet = this.spreadsheet.getSheetById(r.sheetId || 0);
        return new FakeSheetRange(r, sheet);
      });

      // return res.unprotectedRanges.map(
      //   ({
      //     sheetId = 0,
      //     startRowIndex = 0,
      //     endRowIndex = 0,
      //     startColumnIndex = 0,
      //     endColumnIndex = 0,
      //   }) => {
      //     const sheet = this.spreadsheet.getSheetById(sheetId);
      //     return sheet.getRange(
      //       startRowIndex + 1,
      //       startColumnIndex + 1,
      //       endRowIndex - startRowIndex || sheet.getMaxRows(),
      //       endColumnIndex - startColumnIndex || sheet.getMaxColumns()
      //     );
      //   }
      // );
    }
    return [];
  }

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
      const res = this.__batchUpdate(obj);
      this.object = this.__getProtectedRangeFromResponseOfBatchUpdate(res);
    }
    return this;
  }

  setDomainEdit() {
    // Cannot test
    return this;
  }

  setNamedRange(namedRange) {
    if (namedRange?.object?.namedRangeId) {
      const namedRangeId = namedRange.object.namedRangeId;
      const obj = {
        spreadsheetId: this.spreadsheetId,
        requestObj: {
          requests: [
            {
              updateProtectedRange: {
                protectedRange: {
                  protectedRangeId: this.object.protectedRangeId,
                  namedRangeId,
                },
                fields: "namedRangeId",
              },
            },
          ],
          includeSpreadsheetInResponse: true,
        },
      };
      const res = this.__batchUpdate(obj);
      this.object = this.__getProtectedRangeFromResponseOfBatchUpdate(res);
    }
    return this;
  }

  setRange(range) {
    if (this.kind == "Spreadsheet" || this.kind == "Sheet") {
      throw new Error(
        "Exception: Cannot change sheet protection to range protection (or vice versa)."
      );
    }
    const obj = {
      spreadsheetId: this.spreadsheetId,
      requestObj: {
        requests: [
          {
            updateProtectedRange: {
              protectedRange: {
                protectedRangeId: this.object.protectedRangeId,
                range: makeGridRange(range),
              },
              fields: "range",
            },
          },
        ],
        includeSpreadsheetInResponse: true,
      },
    };
    const res = this.__batchUpdate(obj);
    this.object = this.__getProtectedRangeFromResponseOfBatchUpdate(res);
    return this;
  }

  setRangeName(rangeName) {
    const obj = {
      spreadsheetId: this.spreadsheetId,
      fields: "namedRanges",
    };
    const res = this.__get(obj).namedRanges;
    if (res && res.length > 0) {
      const nr = res.find(({ name }) => name == rangeName);
      if (nr) {
        const namedRangeId = nr.namedRangeId;
        const obj = {
          spreadsheetId: this.spreadsheetId,
          requestObj: {
            requests: [
              {
                updateProtectedRange: {
                  protectedRange: {
                    protectedRangeId: this.object.protectedRangeId,
                    namedRangeId,
                  },
                  fields: "namedRangeId",
                },
              },
            ],
            includeSpreadsheetInResponse: true,
          },
        };
        const res = this.__batchUpdate(obj);
        this.object = this.__getProtectedRangeFromResponseOfBatchUpdate(res);
      } else {
        throw new Error(`No named range of ${rangeName}.`);
      }
    } else {
      throw new Error(`No named range of ${rangeName}.`);
    }
    return this;
  }

  setUnprotectedRanges(ranges) {
    if (ranges && Array.isArray(ranges) && ranges.length > 0) {
      const unprotectedRanges = ranges.map((r) => makeGridRange(r));
      const obj = {
        spreadsheetId: this.spreadsheetId,
        requestObj: {
          requests: [
            {
              updateProtectedRange: {
                protectedRange: {
                  protectedRangeId: this.object.protectedRangeId,
                  unprotectedRanges,
                },
                fields: "unprotectedRanges",
              },
            },
          ],
          includeSpreadsheetInResponse: true,
        },
      };
      const res = this.__batchUpdate(obj);
      this.object = this.__getProtectedRangeFromResponseOfBatchUpdate(res);
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
    const res = this.__batchUpdate(obj);
    this.object = this.__getProtectedRangeFromResponseOfBatchUpdate(res);
    return this;
  }

  toString() {
    return "Protection";
  }

  __getProtectedRangeFromResponseOfBatchUpdate(res) {
    const sheet = res?.updatedSpreadsheet?.sheets.find(
      (s) => s.properties.sheetId == this.sheetId
    );
    const pr = sheet?.protectedRanges || [];
    return (
      pr.find((e) => e.protectedRangeId == this.object.protectedRangeId) || {}
    );
  }

  __getProtections(id) {
    const obj = {
      spreadsheetId: this.spreadsheetId,
      fields: "sheets(protectedRanges)",
    };
    if (this.sheet && this.sheet.getSheetName()) {
      obj.ranges = [this.sheet.getSheetName()];
    }
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
