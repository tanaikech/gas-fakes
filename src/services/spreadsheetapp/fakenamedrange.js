import { Proxies } from "../../support/proxies.js";

/**
 * create a new FakeNamedRange instance
 * @param  {...any} args
 * @returns {FakeNamedRange}
 */
export const newFakeNamedRange = (...args) => {
  return Proxies.guard(new FakeNamedRange(...args));
};

/**
 * basic fake FakeTextFinder
 * ref: https://developers.google.com/apps-script/reference/spreadsheet/text-finder
 * @class FakeTextFinder
 */
export class FakeNamedRange {
  /**
   * @constructor
   * @param {Spreadsheet|Sheet} obj
   * @param {Object} o
   * @returns {FakeNamedRange}
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

  getRange() {
    return this.sheet.getRange(
      this.object.range.startRowIndex + 1,
      this.object.range.startColumnIndex + 1,
      this.object.range.endRowIndex - this.object.range.startRowIndex,
      this.object.range.endColumnIndex - this.object.range.startColumnIndex
    );
  }

  getName() {
    return this.object.name;
  }

  remove() {
    const obj = {
      spreadsheetId: this.spreadsheetId,
      requests: [
        {
          deleteNamedRange: {
            namedRangeId: this.object.namedRangeId,
          },
        },
      ],
    };
    this.__batchUpdate(obj);
    return null;
  }

  setName(name) {
    const obj = {
      spreadsheetId: this.spreadsheetId,
      requests: [
        {
          updateNamedRange: {
            namedRange: {
              namedRangeId: this.object.namedRangeId,
              name,
            },
            fields: "name",
          },
        },
      ],
    };
    this.__batchUpdate(obj);
    return this;
  }

  setRange(range) {
    const startRowIndex = range.getRow() - 1;
    const endRowIndex = startRowIndex + range.getNumRows();
    const startColumnIndex = range.getColumn() - 1;
    const endColumnIndex = startColumnIndex + range.getNumColumns();
    const obj = {
      spreadsheetId: this.spreadsheetId,
      requests: [
        {
          updateNamedRange: {
            namedRange: {
              range: {
                sheetId: range.getSheet().getSheetId(),
                startRowIndex,
                endRowIndex,
                startColumnIndex,
                endColumnIndex,
              },
              namedRangeId: this.object.namedRangeId,
            },
            fields: "range",
          },
        },
      ],
    };
    this.__batchUpdate(obj);
    return this;
  }

  __batchUpdate({ spreadsheetId, requests }) {
    Sheets.Spreadsheets.batchUpdate({ requests }, spreadsheetId);
  }
}
