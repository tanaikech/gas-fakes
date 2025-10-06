/**
 * @OnlyCurrentDoc
 */
import '@mcpher/gas-fakes';

// the test
const test = () => {
  // enable sandbox mode
  ScriptApp.__behavior.sandboxMode = true;

  // create a new document
  const doc = DocumentApp.create('--gas-fakes-test');

  // append a paragraph
  const text = 'coffee turns potential into momentum.';
  doc.getBody().appendParagraph(text);
  doc.saveAndClose();

  // read the document text and ensure it matches what you created
  const readText = DocumentApp.openById(doc.getId()).getBody().getText();

  // check it
  if (text !== readText.trim()) {
    throw new Error(`expected "${text}", but got "${readText}"`);
  }
  console.log('document created and read back successfully');

  // tidy up sandbox
  ScriptApp.__behavior.trash();
}

// run the test
test();