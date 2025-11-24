import '@mcpher/gas-fakes';

const SPREADSHEET_ID = '1sy2IDiAGhmDVC-tj_p1Gf6lWHs3ZoqBs56CkB0TkMDI';

const inspectSpreadsheet = () => {
  try {
    // Open the spreadsheet
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = spreadsheet.getSheets()[0]; // Get first sheet

    console.log(`\n=== Spreadsheet: ${spreadsheet.getName()} ===`);
    console.log(`Sheet: ${sheet.getName()}`);

    // Get all data
    const data = sheet.getDataRange().getValues();

    // Print headers
    console.log('\n=== Headers ===');
    const headers = data[0];
    headers.forEach((header, index) => {
      console.log(`Column ${index}: "${header}"`);
    });

    // Find checkbox grid columns
    const checkboxGridColumns = [];
    headers.forEach((header, index) => {
      if (header.includes('closest') || header.includes('influential')) {
        checkboxGridColumns.push({ index, header });
      }
    });

    console.log('\n=== Checkbox Grid Columns ===');
    checkboxGridColumns.forEach(col => {
      console.log(`Column ${col.index}: "${col.header}"`);
    });

    // Print first few data rows for checkbox grid columns
    console.log('\n=== Sample Data (First 3 Rows) ===');
    for (let rowIndex = 1; rowIndex <= Math.min(3, data.length - 1); rowIndex++) {
      console.log(`\nRow ${rowIndex}:`);
      checkboxGridColumns.forEach(col => {
        const value = data[rowIndex][col.index];
        console.log(`  ${col.header}: "${value}" (type: ${typeof value})`);
      });
    }

  } catch (error) {
    console.error(`Error: ${error.toString()}`);
  }
};

inspectSpreadsheet();
