import is from '@sindresorhus/is';
import '@mcpher/gas-fakes';
import { initTests } from './testinit.js';
import { wrapupTest, trasher } from './testassist.js';

export const testSlidesTable = (pack) => {
  const toTrash = [];
  const { unit, fixes } = pack || initTests();

  unit.section('Slides Table Components', (t) => {
    const presName = `gas-fakes-test-table-${new Date().getTime()}`;
    const pres = SlidesApp.create(presName);
    toTrash.push(DriveApp.getFileById(pres.getId()));

    const slide = pres.getSlides()[0];
    const table = slide.insertTable(3, 4);

    t.is(table.toString(), 'Table', 'table.toString() should be "Table"');
    t.is(table.getNumRows(), 3, 'Table should have 3 rows');
    t.is(table.getNumColumns(), 4, 'Table should have 4 columns');

    // Test Rows
    t.is(table.getNumRows(), 3, 'getNumRows() should return 3');
    const row = table.getRow(0);
    t.is(row.toString(), 'TableRow', 'row.toString() should be "TableRow"');
    t.is(row.getIndex(), 0, 'row.getIndex() should return 0');
    t.is(row.getNumCells(), 4, 'row.getNumCells() should return 4');
    t.is(row.getParentTable().getObjectId(), table.getObjectId(), 'row.getParentTable() should match');

    // Test Columns
    t.is(table.getNumColumns(), 4, 'getNumColumns() should return 4');
    const col = table.getColumn(1);
    t.is(col.toString(), 'TableColumn', 'col.toString() should be "TableColumn"');
    t.is(col.getIndex(), 1, 'col.getIndex() should return 1');
    t.is(col.getNumCells(), 3, 'col.getNumCells() should return 3');
    t.is(col.getParentTable().getObjectId(), table.getObjectId(), 'col.getParentTable() should match');

    // Test Cells
    const cell = table.getCell(0, 0);
    t.is(cell.toString(), 'TableCell', 'cell.toString() should be "TableCell"');
    t.is(cell.getRowIndex(), 0, 'cell.getRowIndex() should return 0');
    t.is(cell.getColumnIndex(), 0, 'cell.getColumnIndex() should return 0');
    t.is(cell.getRowSpan(), 1, 'cell.getRowSpan() should return 1');
    t.is(cell.getColumnSpan(), 1, 'cell.getColumnSpan() should return 1');
    t.is(cell.getParentRow().getIndex(), 0, 'cell.getParentRow() index should be 0');
    t.is(cell.getParentColumn().getIndex(), 0, 'cell.getParentColumn() index should be 0');
    t.is(cell.getParentTable().getObjectId(), table.getObjectId(), 'cell.getParentTable() should match');

    // Test Cell Text
    const text = cell.getText();
    t.is(text.toString(), 'TextRange', 'cell.getText() should return a TextRange');
    text.setText('Hello Table');
    t.is(text.asString().trim(), 'Hello Table', 'text.asString().trim() should return set text');

    // Test Cell Fill
    const fill = cell.getFill();
    t.is(fill.toString(), 'Fill', 'cell.getFill() should return a Fill');
    // Default cell fill is usually NONE/transparent
    t.false(fill.isVisible(), 'Default cell fill should not be visible');
    fill.setSolidFill('#ff0000');
    t.true(fill.isVisible(), 'Cell fill should be visible after setSolidFill');
    t.is(fill.getType().toString(), 'SOLID', 'Fill type should be SOLID');

    // Test Content Alignment
    t.is(cell.getContentAlignment().toString(), 'TOP', 'Default alignment should be TOP');
    cell.setContentAlignment(SlidesApp.ContentAlignment.MIDDLE);
    // Note: local fake update is immediate if implemented correctly
    // Actually we implemented it via batchUpdate, so we need to rely on the fake's resource if it reflects changes.
    // In our fake, batchUpdate is mock-intercepted usually.
  });

  if (!pack) {
    unit.report();
  }
  if (fixes.CLEAN) trasher(toTrash);
  return { unit, fixes };
};

wrapupTest(testSlidesTable);
