import '@mcpher/gas-fakes';
const res1 = Sheets.Spreadsheets.create({ properties: { title: "sample" } });
const res2 = Sheets.Spreadsheets.get(res1.spreadsheetId);
console.log(res2);