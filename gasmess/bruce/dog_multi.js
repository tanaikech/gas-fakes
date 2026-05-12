import '@mcpher/gas-fakes';
import { getSheetData, foo, bar } from './dog_utils.js';

export const showDialog = (e) => {
  const ssId = "1h9IGIShgVBVUrUjjawk5MaCEQte_7t32XeEP1Z5jXKQ";
  const ss = SpreadsheetApp.openById(ssId);
  SpreadsheetApp.setActiveSpreadsheet(ss);

  // Notice we use dogindex_multi which includes css and js
  const html = HtmlService.createTemplateFromFile('html/dogindex_multi').evaluate();
  
  // Choose framing via URL parameter or default to modal
  const type = (e && e.parameter && e.parameter.type) ? e.parameter.type : 'modal';
  
  if (type === 'sidebar') {
    SpreadsheetApp.getUi().showSidebar(html.setTitle('My Custom Sidebar'));
  } else {
    SpreadsheetApp.getUi().showModalDialog(html, 'My Custom Modal Dialog');
  }

  return html;
};

// Global variables for template evaluation
globalThis.foo = foo;

export { getSheetData, bar };

export function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}
