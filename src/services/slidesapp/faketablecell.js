import { Proxies } from '../../support/proxies.js';
import { newFakeTextRange } from './faketextrange.js';
import { newFakeFill } from './fakefill.js';
import { ContentAlignment, CellMergeState } from '../enums/slidesenums.js';

export const newFakeTableCell = (...args) => {
  return Proxies.guard(new FakeTableCell(...args));
};

export class FakeTableCell {
  constructor(table, rowIndex, colIndex) {
    this.__table = table;
    this.__rowIndex = rowIndex;
    this.__colIndex = colIndex;
  }

  /**
   * Returns the unique ID for this object.
   * @returns {string} The ID.
   */
  getObjectId() {
    return this.__table.getObjectId();
  }

  get __resource() {
    return this.__table.__resource.table?.tableRows?.[this.__rowIndex]?.tableCells?.[this.__colIndex];
  }

  /**
   * Returns the 0-based column index of the table cell.
   * @returns {number} The column index.
   */
  getColumnIndex() {
    return this.__colIndex;
  }

  /**
   * Returns the column span of the table cell.
   * @returns {number} The column span.
   */
  getColumnSpan() {
    return this.__resource?.columnSpan || 1;
  }

  /**
   * Returns the ContentAlignment of the text in the table cell.
   * @returns {ContentAlignment} The content alignment.
   */
  getContentAlignment() {
    const alignment = this.__resource?.tableCellProperties?.contentAlignment;
    return ContentAlignment[alignment || 'TOP'];
  }

  /**
   * Returns the fill of the table cell.
   * @returns {FakeFill} The fill.
   */
  getFill() {
    return newFakeFill(this);
  }

  /**
   * Returns the head cell of this table cell.
   * @returns {FakeTableCell | null} The head cell or null.
   */
  getHeadCell() {
    // Basic implementation: if this is merged, find its head.
    // For now, return null as we don't have full merge tracking.
    return null;
  }

  /**
   * Returns the merge state of the table cell.
   * @returns {CellMergeState} The merge state.
   */
  getMergeState() {
    const rowSpan = this.getRowSpan();
    const colSpan = this.getColumnSpan();
    if (rowSpan > 1 || colSpan > 1) {
      return CellMergeState.HEAD;
    }
    // TODO: Detect MERGED state if we can find the head.
    return CellMergeState.NORMAL;
  }

  /**
   * Returns the table column containing the current cell.
   * @returns {FakeTableColumn} The column.
   */
  getParentColumn() {
    return this.__table.getColumn(this.__colIndex);
  }

  /**
   * Returns the table row containing the current cell.
   * @returns {FakeTableRow} The row.
   */
  getParentRow() {
    return this.__table.getRow(this.__rowIndex);
  }

  /**
   * Returns the table containing the current cell.
   * @returns {FakeTable} The table.
   */
  getParentTable() {
    return this.__table;
  }

  /**
   * Returns the 0-based row index of the table cell.
   * @returns {number} The row index.
   */
  getRowIndex() {
    return this.__rowIndex;
  }

  /**
   * Returns the row span of the table cell.
   * @returns {number} The row span.
   */
  getRowSpan() {
    return this.__resource?.rowSpan || 1;
  }

  /**
   * Sets the ContentAlignment of the text in the table cell.
   * @param {ContentAlignment} alignment The alignment.
   * @returns {FakeTableCell} This cell.
   */
  setContentAlignment(alignment) {
    const presentationId = this.__table.__presentation.getId();
    Slides.Presentations.batchUpdate({ requests: [{
      updateTableCellProperties: {
        objectId: this.__table.getObjectId(),
        tableCellProperties: {
          contentAlignment: alignment.toString()
        },
        fields: 'contentAlignment',
        tableRange: {
          location: {
            rowIndex: this.__rowIndex,
            columnIndex: this.__colIndex
          },
          rowSpan: 1,
          columnSpan: 1
        }
      }
    }] }, presentationId);
    return this;
  }

  /**
   * Gets the text in the cell.
   * @returns {FakeTextRange} The text range.
   */
  getText() {
    const mockShape = {
      getObjectId: () => this.__table.getObjectId(),
      get __resource() {
        return {
          shape: {
            text: this.__target.__resource?.text || { textElements: [] }
          }
        };
      },
      __target: this,
      __cellLocation: {
        rowIndex: this.__rowIndex,
        columnIndex: this.__colIndex
      },
      __presentation: this.__table.__presentation
    };
    return newFakeTextRange(mockShape);
  }

  toString() {
    return 'TableCell';
  }
}
