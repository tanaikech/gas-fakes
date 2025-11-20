import '@mcpher/gas-fakes';

// Replace with the ID of the form you want to read responses from.
const FORM_ID = '1V39MfdtCdRMCZtLYgpQqgwaFDZUw80ZsWG_d239MrsI';

/**
 * Reads and logs all responses from a Google Form.
 */
const readResponses = () => {
  if (FORM_ID === 'YOUR_FORM_ID_HERE') {
    console.error("Please replace 'YOUR_FORM_ID_HERE' with an actual Form ID in /Users/brucemcpherson/Documents/repos/gas-fakes/gasmess/bruce/bigger/indegree/src/testresponses.js");
    return;
  }

  try {
    // Open the form by ID
    const form = FormApp.openById(FORM_ID);
    console.log(`Reading responses from form: "${form.getTitle()}"`);

    // --- Diagnostic Logging: List all items in the form ---
    console.log('\n--- Form Item Inventory ---');
    const allItems = form.getItems();
    console.log(`Found ${allItems.length} total items in the form.`);
    allItems.forEach((item, index) => {
      console.log(`  [Item #${index}] ID: ${item.getId()}, Type: ${item.getType()}, Title: "${item.getTitle()}"`);
    });
    console.log('--- End Form Item Inventory ---\n');

    // Get all form responses
    const formResponses = form.getResponses();
    console.log(`Found ${formResponses.length} response(s).`);

    // Iterate through each response
    formResponses.forEach((formResponse, index) => {
      console.log(`\n--- Response #${index + 1} ---`);
      console.log(`Timestamp: ${formResponse.getTimestamp()}`);
      console.log(`Respondent Email: ${formResponse.getRespondentEmail()}`);

      // --- Start Diagnostic Logging ---
      const knownItemIds = new Set(form.getItems().map(item => item.getId()));
      console.log(`[Diagnostic] Built inventory of ${knownItemIds.size} known item IDs.`);
      // --- End Diagnostic Logging ---

      const itemResponses = formResponse.getItemResponses();

      itemResponses.forEach((itemResponse) => {
        const item = itemResponse.getItem();
        console.log(`  Question: "${item.getTitle()}", Answer:   "${itemResponse.getResponse()}"`);
      });
    });
  } catch (error) {
    console.error(`Error reading form responses: ${error.toString()}`);
  }
};

readResponses();