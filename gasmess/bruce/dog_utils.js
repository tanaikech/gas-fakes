export const foo = 'global var foo from server side for UI test';

export function bar(ob) {
  if (!ob) throw new Error("You must provide an object to bar()!");
  return `simple global function bar from server side received ${JSON.stringify(ob)}`;
}

export function getSheetData(source) {
  if (!source) {
    const active = SpreadsheetApp.getActiveSpreadsheet();
    source = {id: active.getId(), sheetName: active.getActiveSheet().getName()};
  }
  LibHandlerApp.load();
  const result = bmPreFiddler.PreFiddler().getFiddler(source);
  return { data: result.getData(), source };
}
